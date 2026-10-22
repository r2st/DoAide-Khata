"""PDF statements and GST bills with reportlab."""

from io import BytesIO
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.config import settings
from app.engines.gst import compute_bill

GREEN = colors.HexColor("#047857")
LIGHT = colors.HexColor("#ECFDF5")


def _font() -> str:
    """A Unicode TTF (e.g. Noto Sans) renders ₹ and Hindi names; Helvetica can't."""
    path = settings.pdf_font_path
    if path and Path(path).exists():
        if "KhataFont" not in pdfmetrics.getRegisteredFontNames():
            pdfmetrics.registerFont(TTFont("KhataFont", path))
        return "KhataFont"
    return "Helvetica"


def money(value: float, font: str) -> str:
    symbol = "₹" if font != "Helvetica" else "Rs. "
    sign = "-" if value < 0 else ""
    return f"{sign}{symbol}{abs(value):,.2f}"


def _styles(font: str) -> dict:
    return {
        "title": ParagraphStyle("title", fontName=font, fontSize=16, leading=20, textColor=GREEN),
        "body": ParagraphStyle("body", fontName=font, fontSize=9, leading=12),
        "small": ParagraphStyle("small", fontName=font, fontSize=8, leading=10, textColor=colors.grey),
    }


def _esc(text) -> str:
    return str(text or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _shop_block(shop: dict, st: dict) -> list:
    lines = [Paragraph(_esc(shop.get("shopName") or "My Shop"), st["title"])]
    details = [shop.get("address"), shop.get("shopPhone") and f"Ph: {shop['shopPhone']}", shop.get("gstin") and f"GSTIN: {shop['gstin']}"]
    detail_text = " | ".join(_esc(d) for d in details if d)
    if detail_text:
        lines.append(Paragraph(detail_text, st["body"]))
    return lines


def _footer(st: dict) -> Paragraph:
    return Paragraph("Generated with DoAide Khata — khata.doaide.com · A DoAide Product", st["small"])


def _table(rows: list, widths: list, font: str, align_right_from: int) -> Table:
    table = Table(rows, colWidths=widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), font),
                ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                ("BACKGROUND", (0, 0), (-1, 0), GREEN),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
                ("ALIGN", (align_right_from, 0), (-1, -1), "RIGHT"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#D1D5DB")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    return table


def ledger_rows(transactions: list[dict]) -> tuple[list[dict], float]:
    """Sort oldest first and attach a running balance (positive = customer owes)."""
    ordered = sorted(transactions, key=lambda t: (t.get("date", ""), t.get("createdAt", 0)))
    balance = 0.0
    rows = []
    for tx in ordered:
        amount = float(tx.get("amount", 0))
        balance += amount if tx.get("type") == "gave" else -amount
        rows.append({**tx, "balance": round(balance, 2)})
    return rows, round(balance, 2)


def ledger_pdf(shop: dict, customer: dict, transactions: list[dict]) -> bytes:
    font = _font()
    st = _styles(font)
    rows, balance = ledger_rows(transactions)
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=14 * mm, rightMargin=14 * mm, topMargin=14 * mm, bottomMargin=14 * mm)

    table_rows: list[list] = [["Date", "Note", "Gave (Diye)", "Received (Mile)", "Balance"]]
    for r in rows:
        gave = r.get("type") == "gave"
        table_rows.append(
            [
                r.get("date", ""),
                Paragraph(_esc(r.get("note")), st["body"]),
                money(float(r["amount"]), font) if gave else "",
                "" if gave else money(float(r["amount"]), font),
                money(r["balance"], font),
            ]
        )

    status = "Balance due (Lena hai)" if balance > 0 else ("Advance (Dena hai)" if balance < 0 else "Settled")
    story = [
        *_shop_block(shop, st),
        Spacer(1, 6 * mm),
        Paragraph(f"<b>Statement for:</b> {_esc(customer.get('name'))} {_esc(customer.get('phone'))}", st["body"]),
        Paragraph(f"<b>{status}:</b> {money(abs(balance), font)}", st["body"]),
        Spacer(1, 4 * mm),
        _table(table_rows, [24 * mm, 70 * mm, 28 * mm, 30 * mm, 30 * mm], font, 2),
        Spacer(1, 6 * mm),
        _footer(st),
    ]
    doc.build(story)
    return buf.getvalue()


def bill_pdf(shop: dict, bill: dict) -> bytes:
    font = _font()
    st = _styles(font)
    inter_state = bool(bill.get("interState"))
    totals = compute_bill(bill.get("items") or [], inter_state)
    customer = bill.get("customer") or {}
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=14 * mm, rightMargin=14 * mm, topMargin=14 * mm, bottomMargin=14 * mm)

    title = "TAX INVOICE" if shop.get("gstin") else "BILL OF SUPPLY / RECEIPT"
    rows: list[list] = [["#", "Item", "HSN", "Qty", "Rate", "GST %", "Amount"]]
    for i, line in enumerate(totals["lines"], 1):
        rows.append(
            [str(i), Paragraph(_esc(line["name"]), st["body"]), line["hsn"], f"{line['qty']:g}", money(line["rate"], font), f"{line['gstRate']:g}%", money(line["taxable"], font)]
        )

    summary = [["Taxable value", money(totals["taxable"], font)]]
    if inter_state:
        summary.append(["IGST", money(totals["igst"], font)])
    else:
        summary += [["CGST", money(totals["cgst"], font)], ["SGST", money(totals["sgst"], font)]]
    summary.append(["Total", money(totals["total"], font)])
    summary_table = Table(summary, colWidths=[40 * mm, 35 * mm], hAlign="RIGHT")
    summary_table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), font),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                ("LINEABOVE", (0, -1), (-1, -1), 0.75, GREEN),
                ("TEXTCOLOR", (0, -1), (-1, -1), GREEN),
            ]
        )
    )

    bill_to = " ".join(_esc(x) for x in (customer.get("name"), customer.get("phone")) if x) or "Cash customer"
    if customer.get("gstin"):
        bill_to += f" | GSTIN: {_esc(customer['gstin'])}"
    story = [
        *_shop_block(shop, st),
        Spacer(1, 4 * mm),
        Paragraph(f"<b>{title}</b>", st["body"]),
        Paragraph(f"Bill No: {_esc(bill.get('number'))} &nbsp;&nbsp; Date: {_esc(bill.get('date'))}", st["body"]),
        Paragraph(f"Bill to: {bill_to}", st["body"]),
        Spacer(1, 4 * mm),
        _table(rows, [8 * mm, 62 * mm, 18 * mm, 14 * mm, 26 * mm, 16 * mm, 38 * mm], font, 3),
        Spacer(1, 4 * mm),
        summary_table,
        Spacer(1, 8 * mm),
        Paragraph("Thank you! / धन्यवाद" if font != "Helvetica" else "Thank you!", st["body"]),
        Spacer(1, 2 * mm),
        _footer(st),
    ]
    doc.build(story)
    return buf.getvalue()

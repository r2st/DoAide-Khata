"""GST bill math. Mirrors frontend/src/lib/gst.js — keep the two in step."""

from decimal import ROUND_HALF_UP, Decimal

VALID_RATES = (0, 3, 5, 12, 18, 28)


def _r2(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def compute_bill(items: list[dict], inter_state: bool = False) -> dict:
    lines = []
    taxable_total = cgst = sgst = igst = Decimal(0)
    for item in items:
        qty = Decimal(str(item.get("qty", 0)))
        rate = Decimal(str(item.get("rate", 0)))
        gst_rate = Decimal(str(item.get("gstRate", 0)))
        taxable = _r2(qty * rate)
        tax = _r2(taxable * gst_rate / 100)
        if inter_state:
            line_igst, line_cgst, line_sgst = tax, Decimal(0), Decimal(0)
        else:
            line_cgst = _r2(tax / 2)
            line_sgst = tax - line_cgst
            line_igst = Decimal(0)
        taxable_total += taxable
        cgst += line_cgst
        sgst += line_sgst
        igst += line_igst
        lines.append(
            {
                "name": str(item.get("name", "")),
                "hsn": str(item.get("hsn", "")),
                "qty": float(qty),
                "rate": float(rate),
                "gstRate": float(gst_rate),
                "taxable": float(taxable),
                "tax": float(tax),
                "total": float(taxable + tax),
            }
        )
    total = taxable_total + cgst + sgst + igst
    return {
        "lines": lines,
        "taxable": float(taxable_total),
        "cgst": float(cgst),
        "sgst": float(sgst),
        "igst": float(igst),
        "total": float(total),
    }

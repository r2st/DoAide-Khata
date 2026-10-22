from app.engines.gst import compute_bill
from app.engines.merge import merge_ledgers, merge_records
from app.engines.parse import match_customer, rule_parse
from app.engines.pdf import ledger_rows, money


class TestGst:
    def test_intra_state_splits_cgst_sgst(self):
        result = compute_bill([{"name": "Rice", "qty": 2, "rate": 100, "gstRate": 5}])
        assert result["taxable"] == 200
        assert result["cgst"] == 5
        assert result["sgst"] == 5
        assert result["igst"] == 0
        assert result["total"] == 210

    def test_inter_state_uses_igst(self):
        result = compute_bill([{"name": "Phone", "qty": 1, "rate": 1000, "gstRate": 18}], inter_state=True)
        assert result["igst"] == 180
        assert result["cgst"] == result["sgst"] == 0
        assert result["total"] == 1180

    def test_odd_paise_split_sums_exactly(self):
        result = compute_bill([{"name": "x", "qty": 1, "rate": 10.1, "gstRate": 5}])
        # tax 0.51 → cgst 0.26 + sgst 0.25, never loses a paisa
        assert round(result["cgst"] + result["sgst"], 2) == 0.51
        assert result["total"] == 10.61

    def test_multiple_lines_and_zero_rate(self):
        result = compute_bill(
            [{"name": "Milk", "qty": 3, "rate": 30, "gstRate": 0}, {"name": "Soap", "qty": 2, "rate": 50, "gstRate": 18}]
        )
        assert result["taxable"] == 190
        assert result["total"] == 208
        assert len(result["lines"]) == 2


class TestMerge:
    def test_newer_record_wins(self):
        server = [{"id": "a", "name": "Old", "updatedAt": 1}]
        client = [{"id": "a", "name": "New", "updatedAt": 2}]
        assert merge_records(server, client) == [{"id": "a", "name": "New", "updatedAt": 2}]

    def test_server_newer_kept(self):
        server = [{"id": "a", "name": "Server", "updatedAt": 5}]
        client = [{"id": "a", "name": "Client", "updatedAt": 2}]
        assert merge_records(server, client)[0]["name"] == "Server"

    def test_union_and_tombstones(self):
        server = {"customers": [{"id": "a", "updatedAt": 1}], "settings": {"shopName": "S", "updatedAt": 1}}
        client = {"customers": [{"id": "b", "updatedAt": 1}, {"id": "a", "deleted": True, "updatedAt": 3}], "settings": {}}
        merged = merge_ledgers(server, client)
        ids = {c["id"]: c for c in merged["customers"]}
        assert set(ids) == {"a", "b"}
        assert ids["a"]["deleted"] is True
        assert merged["settings"]["shopName"] == "S"

    def test_ignores_malformed(self):
        assert merge_records([], [{"name": "no id"}, "junk", {"id": 5}]) == []


class TestRuleParse:
    customers = ["Ramesh", "Ramesh Kumar", "Sita"]

    def test_hinglish_udhar(self):
        r = rule_parse("Ramesh ko 500 udhar diya", self.customers)
        assert r == {"customer_name": "Ramesh", "type": "gave", "amount": 500.0, "note": "", "source": "rules"}

    def test_payment_received(self):
        r = rule_parse("Sita se 1,200 mile", self.customers)
        assert r["type"] == "received"
        assert r["amount"] == 1200.0
        assert r["customer_name"] == "Sita"

    def test_wapas_diye_is_payment(self):
        assert rule_parse("Sita ne 300 wapas diye", self.customers)["type"] == "received"

    def test_hindi_script(self):
        r = rule_parse("सीता से ₹250 जमा", ["सीता"])
        assert r["type"] == "received"
        assert r["amount"] == 250.0
        assert r["customer_name"] == "सीता"

    def test_longest_name_match(self):
        assert match_customer("ramesh kumar ko 50 diya", self.customers) == "Ramesh Kumar"

    def test_no_amount(self):
        assert rule_parse("hello", [])["amount"] is None


class TestPdfHelpers:
    def test_running_balance_sorted_by_date(self):
        rows, balance = ledger_rows(
            [
                {"date": "2026-01-03", "type": "received", "amount": 200},
                {"date": "2026-01-01", "type": "gave", "amount": 500},
                {"date": "2026-01-02", "type": "gave", "amount": 100},
            ]
        )
        assert [r["balance"] for r in rows] == [500, 600, 400]
        assert balance == 400

    def test_money_fallback_symbol(self):
        assert money(1234.5, "Helvetica") == "Rs. 1,234.50"
        assert money(-10, "Helvetica") == "-Rs. 10.00"

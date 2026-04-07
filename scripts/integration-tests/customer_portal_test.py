import random

import requests

from base_test import BaseIntegrationTest


class CustomerPortalIntegrationTest(BaseIntegrationTest):

    def setUp(self):
        self.username = f"user_{random.randint(1000, 9999)}"
        self.password = "pass123"
        reg_res = self.admin_session.post(
            f"{self.base_url}/{self.tenant_name}/register",
            json={"username": self.username, "password": self.password, "email": f"{self.username}@test.com"}
        )
        self.customer_id = reg_res.json()["customerId"]
        self.customer_session = self.login_as_user(self.username, self.password)

    def login_as_user(self, username, password):
        res = requests.post(f"{self.base_url}/{self.tenant_name}/login",
                            json={"username": username, "password": password})
        token = res.json().get("token")
        s = requests.Session()
        s.headers.update({"Authorization": f"Bearer {token}"})
        return s

    def test_attribute_values(self):
        res = self.admin_session.post(
            f"{self.base_url}/{self.tenant_name}/admin/customer/attribute",
            json={"name": "membership", "type": "STRING", "isList": False}
        )
        self.assertEqual(res.status_code, 200)
        attr_id = res.json()

        res = self.admin_session.post(
            f"{self.base_url}/{self.tenant_name}/admin/customer/attribute/value",
            params={"customerId": self.customer_id},
            json={attr_id: "PREMIUM"}
        )
        self.assertEqual(res.status_code, 200)

        res = self.customer_session.get(f"{self.base_url}/{self.tenant_name}/customer-portal/attribute-value")

        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(len(data), 1, f"Expected 1 attribute, got {len(data)}")

        attr = next((item for item in data if item["name"] == "membership"), None)

        self.assertIsNotNone(attr, "Attribute 'membership' not found in response")
        self.assertEqual(attr["attributeId"], attr_id)
        self.assertEqual(attr["values"], ["PREMIUM"])
        self.assertFalse(attr["isList"])

    def test_granted_items(self):
        res = self.admin_session.post(f"{self.base_url}/{self.tenant_name}/admin/item",
                                      params={"name": "Premium Membership"},
                                      json=[])
        self.assertEqual(res.status_code, 200)
        item_id = res.json()

        res = self.admin_session.put(
            f"{self.base_url}/{self.tenant_name}/admin/item/{item_id}",
            json={"name": "item_attr1", "type": "STRING", "isList": "false"}
        )
        self.assertEqual(res.status_code, 200)
        item_attr_id = res.json()

        res = self.admin_session.post(
            f"{self.base_url}/{self.tenant_name}/admin/item/{item_id}/grant",
            params={"customerId": self.customer_id},
            json={item_attr_id : "PREMIUM"}
        )
        self.assertEqual(res.status_code, 200)

        res = self.customer_session.get(f"{self.base_url}/{self.tenant_name}/customer-portal/granted-item")
        data = res.json()
        self.assertEqual(len(data), 1)
        item = data[0]

        self.assertEqual(item["id"], item_id)
        self.assertEqual(item["name"], "Premium Membership")

        attr = next((a for a in item["attributes"] if a["name"] == "item_attr1"), None)
        self.assertIsNotNone(attr)
        self.assertEqual(attr["values"], ["PREMIUM"])

    def test_executed_actions(self):
        res = self.admin_session.post(f"{self.base_url}/{self.tenant_name}/admin/action",
                                      params={"name": "action"},
                                      json=[])
        self.assertEqual(res.status_code, 200)
        action_id = res.json()

        res = self.admin_session.put(
            f"{self.base_url}/{self.tenant_name}/admin/action/{action_id}",
            json={"name": "action_attr1", "type": "STRING", "isList": "false"}
        )
        self.assertEqual(res.status_code, 200)
        action_attr_id = res.json()

        res = self.admin_session.post(
            f"{self.base_url}/{self.tenant_name}/admin/action/{action_id}/execute",
            params={"customerId": self.customer_id},
            json={action_attr_id : "action-value"}
        )
        self.assertEqual(res.status_code, 200)
        res = self.customer_session.get(f"{self.base_url}/{self.tenant_name}/customer-portal/executed-action")
        data = res.json()
        self.assertEqual(len(data), 1)
        action = data[0]

        self.assertEqual(action["id"], action_id)
        self.assertEqual(action["name"], "action")

        attr = next((a for a in action["attributes"] if a["name"] == "action_attr1"), None)
        self.assertIsNotNone(attr)
        self.assertEqual(attr["values"], ["action-value"])

    def test_header_injection_protection(self):
        spoofed_headers = {"X-Customer-Id": "1"}
        res = self.customer_session.get(
            f"{self.base_url}/{self.tenant_name}/customer-portal/attribute-value",
            headers=spoofed_headers
        )
        self.assertEqual(res.status_code, 200)

    def test_unauthorized_no_token(self):
        res = requests.get(f"{self.base_url}/{self.tenant_name}/customer-portal/attribute-value")
        self.assertEqual(res.status_code, 401)

    def test_empty_state(self):
        res = self.customer_session.get(f"{self.base_url}/{self.tenant_name}/customer-portal/executed-action")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json(), [])


if __name__ == '__main__':
    import unittest

    unittest.main()

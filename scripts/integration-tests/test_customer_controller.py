from base_test import BaseIntegrationTest

class CustomerControllerTest(BaseIntegrationTest):

    def test_attribute_lifecycle(self):
        print("Running: Attribute Lifecycle (CRUD)")
        # Create
        payload = {"name": "tier", "type": "STRING", "isList": False}
        res = self.admin_session.post(f"{self.base_url}/{self.tenant_name}/admin/customer/attribute", json=payload)
        self.assertEqual(res.status_code, 200)
        attr_id = res.json()

        # Verify
        res = self.admin_session.get(f"{self.base_url}/{self.tenant_name}/admin/customer/attribute")
        self.assertTrue(any(a['id'] == attr_id for a in res.json()))

        # Delete
        res = self.admin_session.delete(f"{self.base_url}/{self.tenant_name}/admin/customer/attribute", params={"attributeId": attr_id})
        self.assertEqual(res.status_code, 200)

    def test_customer_attribute_values(self):
        print("Running: Customer Attribute Values")
        c_id = self.create_test_user()

        attr_res = self.admin_session.post(
            f"{self.base_url}/{self.tenant_name}/admin/customer/attribute",
            json={"name": "status", "type": "STRING", "isList": False}
        )
        attr_id = attr_res.json()

        res = self.admin_session.post(
            f"{self.base_url}/{self.tenant_name}/admin/customer/attribute/value",
            params={"customerId": c_id},
            json={str(attr_id): "active"}
        )
        self.assertEqual(res.status_code, 200)
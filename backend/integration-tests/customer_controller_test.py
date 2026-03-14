import unittest
import requests
import random

class CustomerControllerTest(unittest.TestCase):
    customer_id = None
    auth_headers = None

    @classmethod
    def setUpClass(cls):
        cls.base_url = "http://localhost:8080"
        cls.tenant_name = f"test{random.randint(1000, 9999)}"

        tenant_payload = {
            "username": "admin",
            "password": "admin",
            "email": "admin@test.com"
        }

        create_tenant_res = requests.post(
            f"{cls.base_url}/tenant?tenantUriName={cls.tenant_name}",
            json=tenant_payload
        )
        assert create_tenant_res.status_code == 200

        login_res = requests.post(
            f"{cls.base_url}/{cls.tenant_name}/login",
            json={"username": "admin", "password": "admin"}
        )
        assert login_res.status_code == 200

        cls.admin_token = login_res.json()["token"]
        cls.admin_headers = {"Authorization": f"Bearer {cls.admin_token}"}

    def test_01_register_and_setup(self):
        register_payload = {
            "username": f"user_{random.randint(100, 999)}",
            "password": "password123",
            "email": f"test_{random.randint(100, 999)}@test.com"
        }

        register_res = requests.post(
            f"{self.base_url}/{self.tenant_name}/register",
            json=register_payload
        )
        self.assertEqual(register_res.status_code, 200)

        reg_data = register_res.json()
        self.assertIn("customerId", reg_data)
        CustomerControllerTest.customer_id = reg_data["customerId"]

        login_res = requests.post(
            f"{self.base_url}/{self.tenant_name}/login",
            json={
                "username": register_payload["username"],
                "password": register_payload["password"]
            }
        )
        self.assertEqual(login_res.status_code, 200)

        login_data = login_res.json()
        self.assertIn("token", login_data)
        CustomerControllerTest.auth_headers = {"Authorization": f"Bearer {login_data['token']}"}

    def test_02_attribute_crud(self):
        payload = {"name": "tier", "type": "STRING", "isList": False}
        res = requests.post(
            f"{self.base_url}/{self.tenant_name}/admin/customer/attribute",
            json=payload, headers=self.admin_headers
        )
        self.assertEqual(res.status_code, 200)
        attr_id = res.json()

        res = requests.get(
            f"{self.base_url}/{self.tenant_name}/admin/customer/attribute",
            headers=self.admin_headers
        )
        self.assertEqual(res.status_code, 200)
        self.assertTrue(any(attr['id'] == attr_id for attr in res.json()))

        res = requests.delete(
            f"{self.base_url}/{self.tenant_name}/admin/customer/attribute",
            params={"attributeId": attr_id}, headers=self.admin_headers
        )
        self.assertEqual(res.status_code, 200)

    def test_03_customer_attribute_values(self):
        attr_res = requests.post(
            f"{self.base_url}/{self.tenant_name}/admin/customer/attribute",
            json={"name": "status", "type": "STRING", "isList": False},
            headers=self.admin_headers
        )
        self.assertEqual(attr_res.status_code, 200)
        attr_id = attr_res.json()

        set_val_res = requests.post(
            f"{self.base_url}/{self.tenant_name}/admin/customer/attribute/value",
            params={"customerId": self.customer_id},
            json={str(attr_id): "active"},
            headers=self.admin_headers
        )
        self.assertEqual(set_val_res.status_code, 200)

        res = requests.get(
            f"{self.base_url}/{self.tenant_name}/admin/customer/attribute/value/{attr_id}",
            params={"customerId": self.customer_id},
            headers=self.admin_headers
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json().get("values")[0], "active")

        res = requests.delete(
            f"{self.base_url}/{self.tenant_name}/admin/customer/attribute/value/{attr_id}",
            params={"customerId": self.customer_id},
            headers=self.admin_headers
        )
        self.assertEqual(res.status_code, 200)

if __name__ == '__main__':
    unittest.main()
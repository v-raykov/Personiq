import random
import unittest
import requests

GATEWAY_URL = "http://localhost:8080"

class TenantIntegrationTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tenant_uri = "test" + str(random.randint(1, 1000))

        create_tenant_response = requests.post(
            f"{GATEWAY_URL}/tenant?tenantUriName={cls.tenant_uri}",
            json={"username": "admin", "password": "admin", "email": "admin@admin.com"}
        )

        if create_tenant_response.status_code != 200:
            raise Exception(f"Setup failed: {create_tenant_response.text}")

    def test_01_create_tenant_and_login(self):
        create_tenant_response = requests.post(
            f"{GATEWAY_URL}/tenant?tenantUriName={self.tenant_uri}_alt",
            json={"username": "admin", "password": "admin", "email": "admin@admin.com"}
        )
        self.assertEqual(create_tenant_response.status_code, 200)

        login_response = requests.post(
            f"{GATEWAY_URL}/{self.tenant_uri}/login",
            json={"username": "admin", "password": "admin"}
        )
        self.assertEqual(login_response.status_code, 200)

    def test_02_register_login(self):
        register_response = requests.post(
            f"{GATEWAY_URL}/{self.tenant_uri}/register",
            json={"username": "test", "password": "test", "email": "test@test.com"}
        )
        self.assertEqual(register_response.status_code, 200)

        login_response = requests.post(
            f"{GATEWAY_URL}/{self.tenant_uri}/login",
            json={"username": "test", "password": "test"}
        )
        self.assertEqual(login_response.status_code, 200)

    def test_03_admin_register_manager(self):
        login_admin_response = requests.post(
            f"{GATEWAY_URL}/{self.tenant_uri}/login",
            json={"username": "admin", "password": "admin"}
        )
        self.assertEqual(login_admin_response.status_code, 200)
        token = login_admin_response.json()["token"]

        register_manager_response = requests.post(
            f"{GATEWAY_URL}/{self.tenant_uri}/admin/register",
            json={"username": "manager", "password": "manager", "email": "manager@manager.com", "authority" : "ROLE_MANAGER"},
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(register_manager_response.status_code, 200)

        login_manager_response = requests.post(
            f"{GATEWAY_URL}/{self.tenant_uri}/login",
            json={"username": "manager", "password": "manager"}
        )
        self.assertEqual(login_manager_response.status_code, 200)
        token = login_manager_response.json()["token"]

        get_me_manager_response = requests.get(
            f"{GATEWAY_URL}/{self.tenant_uri}/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(get_me_manager_response.status_code, 200)
        self.assertEqual(get_me_manager_response.json()["authority"], "ROLE_MANAGER")

if __name__ == '__main__':
    unittest.main()
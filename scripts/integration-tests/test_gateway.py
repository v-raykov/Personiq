from base_test import BaseIntegrationTest
import requests

class TenantIntegrationTest(BaseIntegrationTest):

    def test_tenant_creation_and_login(self):
        print("Running: Tenant Creation and Login Flow")
        alt_tenant = f"{self.tenant_name}_alt"

        res = self.session.post(
            f"{self.base_url}/tenant?tenantUriName={alt_tenant}",
            json={"username": "admin", "password": "admin", "email": "admin@alt.com"}
        )
        self.assertEqual(res.status_code, 200)

        res = self.session.post(
            f"{self.base_url}/{self.tenant_name}/login",
            json={"username": "admin", "password": "admin"}
        )
        self.assertEqual(res.status_code, 200)

    def test_admin_register_manager(self):
        print("Running: Admin registering Manager authority")
        payload = {
            "username": "manager_user",
            "password": "manager_password",
            "email": "mgr@test.com",
            "authority": "ROLE_MANAGER"
        }
        res = self.session.post(f"{self.base_url}/{self.tenant_name}/admin/register", json=payload)
        self.assertEqual(res.status_code, 200)

        # Login as Manager
        login_res = requests.post(
            f"{self.base_url}/{self.tenant_name}/login",
            json={"username": "manager_user", "password": "manager_password"}
        )
        mgr_token = login_res.json()["token"]

        res = requests.get(
            f"{self.base_url}/{self.tenant_name}/me",
            headers={"Authorization": f"Bearer {mgr_token}"}
        )
        self.assertEqual(res.json()["authority"], "ROLE_MANAGER")

if __name__ == '__main__':
    import unittest
    unittest.main()
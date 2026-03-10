import unittest
import requests

class GatewayIntegrationTest(unittest.TestCase):
    GATEWAY_URL = "http://localhost:8080"

    def test(self):
        tenant_uri = "test"

        create_tenant_response = requests.post(f"{self.GATEWAY_URL}/tenant?tenantUriName={tenant_uri}")
        self.assertEqual(create_tenant_response.status_code, 200)

        register_response = requests.post(f"{self.GATEWAY_URL}/{tenant_uri}/register",
                                    json={"username" : "test", "password" : "test", "email" : "test@test.com"})
        self.assertEqual(register_response.status_code, 200)

        login_response = requests.post(f"{self.GATEWAY_URL}/{tenant_uri}/login",
                                       json={"username" : "test", "password" : "test"})
        import time
        time.sleep(1)
        self.assertEqual(login_response.status_code, 200)


if __name__ == '__main__':
    unittest.main()
import random
import unittest

import requests


class GatewayIntegrationTest(unittest.TestCase):
    GATEWAY_URL = "http://localhost:8080"

    def test(self):
        tenant_uri = "test" + str(random.randint(1, 1000))

        create_tenant_response = requests.post(f"{self.GATEWAY_URL}/tenant?tenantUriName={tenant_uri}",
                                               json={"username": "admin", "password": "admin",
                                                     "email": "admin@admin.com"})
        self.assertEqual(create_tenant_response.status_code, 200)

        login_response = requests.post(f"{self.GATEWAY_URL}/{tenant_uri}/login",
                                       json={"username": "admin", "password": "admin"})
        self.assertEqual(login_response.status_code, 200)

        register_response = requests.post(f"{self.GATEWAY_URL}/{tenant_uri}/register",
                                          json={"username": "test", "password": "test", "email": "test@test.com"})
        self.assertEqual(register_response.status_code, 200)

        login_response = requests.post(f"{self.GATEWAY_URL}/{tenant_uri}/login",
                                       json={"username": "test", "password": "test"})
        self.assertEqual(login_response.status_code, 200)


if __name__ == '__main__':
    unittest.main()

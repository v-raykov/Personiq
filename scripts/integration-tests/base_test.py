import os
import random
import unittest
from asyncio.timeouts import Timeout
from urllib.error import HTTPError

import time

import requests
from dotenv import load_dotenv

load_dotenv()

_GLOBAL_SETUP_DONE = False


class BaseIntegrationTest(unittest.TestCase):
    base_url = os.getenv("BASE_URL", "http://localhost:8080").rstrip('/')
    tenant_name = os.getenv("TENANT_NAME", f"test_{random.randint(1000, 9999)}")
    admin_session = requests.Session()

    @classmethod
    def setUpClass(cls):
        global _GLOBAL_SETUP_DONE
        if not _GLOBAL_SETUP_DONE:
            print(f"\n--- Starting Global Setup for Tenant: {cls.tenant_name} ---")
            # cls._wait_for_backend()
            cls._setup_tenant_and_admin()
            _GLOBAL_SETUP_DONE = True

    @classmethod
    def _wait_for_backend(cls):
        for _ in range(30):
            try:
                if requests.get(f"{cls.base_url}/actuator/health", timeout=2).status_code == 200:
                    return
            except (ConnectionError, Timeout, HTTPError):
                pass
            time.sleep(2)
        raise RuntimeError(f"Backend at {cls.base_url} unreachable.")

    @classmethod
    def _setup_tenant_and_admin(cls):
        print(f"Creating tenant at {cls.base_url}...")
        cls.admin_session.post(
            f"{cls.base_url}/tenant?tenantUriName={cls.tenant_name}",
            json={"username": "admin", "password": "admin", "email": "admin@test.com"}
        )
        login_res = cls.admin_session.post(
            f"{cls.base_url}/{cls.tenant_name}/login",
            json={"username": "admin", "password": "admin"}
        )
        token = login_res.json().get("token")
        cls.admin_session.headers.update({"Authorization": f"Bearer {token}"})
        print("Admin session initialized.\n")

    def create_test_user(self):
        username = f"user_{random.randint(100, 999)}"
        print(f"  > Creating test user: {username}")
        payload = {"username": username, "password": "password123", "email": f"{username}@test.com"}
        res = self.admin_session.post(f"{self.base_url}/{self.tenant_name}/register", json=payload)
        return res.json()["customerId"]

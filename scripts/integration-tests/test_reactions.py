import time

from base_test import BaseIntegrationTest


class ReactionsIntegrationTest(BaseIntegrationTest):
    def test_create_item_reactions_get_item_templates(self):
        # Create items
        res = self.session.post(f"{self.base_url}/{self.tenant_name}/admin/item?name=item1", json=[])
        self.assertEqual(res.status_code, 200)
        item_id_1 = res.json()

        payload = {"name": "item_attr1", "type": "STRING", "isList": "false"}
        res = self.session.put(f"{self.base_url}/{self.tenant_name}/admin/item/{item_id_1}", json=payload)
        self.assertEqual(res.status_code, 200)
        item_attr_id_1 = res.json()

        res = self.session.post(f"{self.base_url}/{self.tenant_name}/admin/item?name=item2", json=[])
        self.assertEqual(res.status_code, 200)
        item_id_2 = res.json()

        payload = {"name": "item_attr2", "type": "STRING", "isList": "false"}
        res = self.session.put(f"{self.base_url}/{self.tenant_name}/admin/item/{item_id_2}", json=payload)
        self.assertEqual(res.status_code, 200)
        item_attr_id_2 = res.json()

        # Create action
        payload = [{"name": "action_attr", "type": "STRING", "isList": "false"}]
        res = self.session.post(f"{self.base_url}/{self.tenant_name}/admin/action?name=action", json=payload)
        self.assertEqual(res.status_code, 200)
        action_id = res.json()

        # Create customer attribute
        payload = {"name": "customer_attr", "type": "STRING", "isList": "false"}
        res = self.session.post(f"{self.base_url}/{self.tenant_name}/admin/customer/attribute", json=payload)
        self.assertEqual(res.status_code, 200)
        customer_attr_id = res.json()

        # Create rule
        payload = {"triggeredByActionId": action_id, "ruleExpression": f"{customer_attr_id} = 5"}
        res = self.session.post(f"{self.base_url}/{self.tenant_name}/admin/rule", json=payload)
        self.assertEqual(res.status_code, 200)
        rule_id = res.json()

        # Create reactions
        payload = {"ruleId": rule_id, "itemId": item_id_1, "itemAttributes": {item_attr_id_1: "value"}}
        res = self.session.post(f"{self.base_url}/{self.tenant_name}/admin/reaction/item", json=payload)
        self.assertEqual(res.status_code, 200)

        payload = {"ruleId": rule_id, "itemId": item_id_2, "itemAttributes": {item_attr_id_2: "value"}}
        res = self.session.post(f"{self.base_url}/{self.tenant_name}/admin/reaction/item", json=payload)
        self.assertEqual(res.status_code, 200)

        # Get reactions
        res = self.session.get(f"{self.base_url}/{self.tenant_name}/admin/reaction")
        self.assertEqual(res.status_code, 200)
        reactions = res.json()
        self.assertEqual(len(reactions), 2)
        granted_item_ids = [r["templateItemId"] for r in reactions]

        # Get item templates
        time.sleep(0.5)
        payload = granted_item_ids
        res = self.session.post(f"{self.base_url}/{self.tenant_name}/admin/item/granted/bulk", json=payload)
        self.assertEqual(res.status_code, 200)
        items = res.json()
        print(items)
        self.assertEqual(len(items), 2)


if __name__ == '__main__':
    import unittest

    unittest.main()

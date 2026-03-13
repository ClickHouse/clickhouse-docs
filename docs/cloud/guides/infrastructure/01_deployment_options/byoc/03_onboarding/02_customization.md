---
title: 'Customized Setup'
slug: /cloud/reference/byoc/onboarding/customization
sidebar_label: 'Customized Setup'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'onboarding']
description: 'Deploy ClickHouse on your own cloud infrastructure with a customized setup'
doc_type: 'reference'
---

## Customer-managed VPC (BYO-VPC) {#customer-managed-vpc}

If you prefer to use an existing VPC to deploy ClickHouse BYOC instead of having ClickHouse Cloud provision a new VPC, follow the cloud-specific guide below. This approach provides greater control over your network configuration and allows you to integrate ClickHouse BYOC into your existing network infrastructure.

- [AWS Customized Setup](/cloud/reference/byoc/onboarding/customization-aws)
- [GCP Customized Setup](/cloud/reference/byoc/onboarding/customization-gcp)

## Customer-managed IAM roles {#customer-managed-iam-roles}

For organizations with advanced security requirements or strict compliance policies, you can provide your own IAM roles instead of having ClickHouse Cloud create them. This approach gives you complete control over IAM permissions and allows you to enforce your organization's security policies.

:::info
Customer-managed IAM roles are currently in private preview. If you require this capability, please contact ClickHouse Support to discuss your specific requirements and timeline.

When available, this feature will allow you to:
* Provide pre-configured IAM roles for ClickHouse Cloud to use
* Remove write permissions to IAM related permissions for `ClickHouseManagementRole` used for cross-account access
* Maintain full control over role permissions and trust relationships
:::

For information about the IAM roles that ClickHouse Cloud creates by default, see the [BYOC Privilege Reference](/cloud/reference/byoc/reference/priviledge).

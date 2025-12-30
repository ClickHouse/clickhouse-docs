---
sidebar_label: '旧版 CMEK 迁移'
slug: /cloud/security/cmek-migration
title: '从 CMEK v1 迁移到 v2'
description: '从旧版 CMEK 迁移到版本 2 的操作说明'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'encryption', 'CMEK']
---

我们正在提升客户托管加密密钥（CMEK）服务的安全性。现在，所有服务都会为每个服务配置一个唯一的 AWS 角色，用于授权使用客户密钥对服务进行加密和解密。这个新角色只会在服务配置界面中显示。

此新流程同时支持 OpenAPI 和 Terraform。更多信息请参阅我们的文档（[增强加密](/docs/cloud/security/cmek)、[Cloud API](/docs/cloud/manage/api/api-overview)、[官方 Terraform Provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)）。

## 手动迁移 {#manual-migration}

完成以下步骤以迁移到新流程：

1. 登录 [https://console.clickhouse.cloud](https://console.clickhouse.cloud)
2. 点击加密的服务
3. 在左侧点击 Service Settings
4. 向下滚动到页面底部，然后展开 View service details
5. 复制 Encryption Role ID (IAM)
6. 在 AWS 中前往您的 KMS 密钥，并更新 Key Policy 以添加以下内容：

```json
{
   "Sid": "Allow ClickHouse Access",
   "Effect": "Allow",
   "Principal": {
       "AWS": ["Encryption role ID (ARN)"]
   },
   "Action": [
       "kms:Encrypt",
       "kms:Decrypt",
       "kms:ReEncrypt*",
       "kms:DescribeKey"
   ],
   "Resource": "*"
}
```

7. 在 ClickHouse Cloud 中提交一个支持工单，告知我们可以启用新的方法。此更改需要重启服务，请告知对您来说最合适的服务重启日期/时间。
8. 在我们重启服务之后，前往 AWS 中的 KMS 密钥，并从密钥策略（Key Policy）中移除以下内容：

```json
{
   "Sid": "Allow ClickHouse Access",
       "Effect": "Allow",
       "Principal": {
           "AWS": "arn:aws:iam::576599896960:role/prod-kms-request-role"
       },
       "Action": ["kms:GetPublicKey",
       "kms:Decrypt",
       "kms:GenerateDataKeyPair",
       "kms:Encrypt",
       "kms:GetKeyRotationStatus",
       "kms:GenerateDataKey",
       "kms:DescribeKey"],
       "Resource": "*"
}
```

9. 更新完成！

## Terraform 迁移 {#terraform-migration}

1. 升级到 [Terraform 版本 3.5.0 或更高](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)
2. 在不做任何更改的情况下应用 Terraform。Terraform 状态中会出现一个名为 transparent&#95;data&#95;encryption 的新字段。请在此记录下 role&#95;id。
3. 前往 AWS 中的 KMS 密钥，更新其 Key Policy，添加以下内容：

```json
{
   "Sid": "Allow ClickHouse Access",
   "Effect": "Allow",
   "Principal": {
       "AWS": ["Encryption role ID (ARN)"]
   },
   "Action": [
       "kms:Encrypt",
       "kms:Decrypt",
       "kms:ReEncrypt*",
       "kms:DescribeKey"
   ],
   "Resource": "*"
}
```

4. 在 ClickHouse Cloud 中，使用该服务名称创建一个支持工单，告知我们可以启用新的方法。此更改需要重启服务，如有合适的重启日期/时间，请提前告知我们。
5. 在我们重启服务之后，您可以将 `transparent&#95;data&#95;encryption.enabled` 设置更新为 `'True'`，并在 Terraform 中移除 tier 设置后执行 apply。这样不会导致任何实际变更。
6. 前往您在 AWS 中的 KMS 密钥，并在密钥策略（Key Policy）中移除以下内容：

```json
{
   "Sid": "Allow ClickHouse Access",
       "Effect": "Allow",
       "Principal": {
           "AWS": "arn:aws:iam::576599896960:role/prod-kms-request-role"
       },
       "Action": ["kms:GetPublicKey",
       "kms:Decrypt",
       "kms:GenerateDataKeyPair",
       "kms:Encrypt",
       "kms:GetKeyRotationStatus",
       "kms:GenerateDataKey",
       "kms:DescribeKey"],
       "Resource": "*"
}
```

7. 更新已完成！

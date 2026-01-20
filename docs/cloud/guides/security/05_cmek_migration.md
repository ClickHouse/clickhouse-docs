---
sidebar_label: 'Legacy CMEK Migration'
slug: /cloud/security/cmek-migration
title: 'Migrating from CMEK v1 to v2'
description: 'Migration instructions to move from legacy CMEK to version 2'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'encryption', 'CMEK']
---

We are improving the security of customer managed encryption keys (CMEK) services. All services are now configured with a unique AWS role per service to authorize using customer keys to encrypt and decrypt services. This new role is only shown in the service configuration screen.

OpenAPI and Terraform are both supported for this new process. For more information, check out our docs ([Enhanced Encryption](/docs/cloud/security/cmek), [Cloud API](/docs/cloud/manage/api/api-overview), [Official Terraform Provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)). 

## Manual migration {#manual-migration}

Complete the following steps to migrate to the new process:
1. Sign in to https://console.clickhouse.cloud 
2. Click on the encrypted service
3. Click on Service Settings on the left
4. Scroll to the bottom of the screen and expand View service details
5. Copy the Encryption Role ID (IAM)
6. Go to your KMS key in AWS and update the Key Policy to add the following:
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
7. In ClickHouse Cloud, open a support case to let us know we can enable the new method. This change requires a service restart, please let us know if there is a day/ time that is best to restart the service.
8. Once we restart the service, go to your KMS key in AWS and remove the following from the Key Policy:
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
9. The update is complete!

## Terraform migration {#terraform-migration}
1. Update to [Terraform version 3.5.0 or higher](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)
2. Apply Terraform without changes. A new field for transparent_data_encryption will appear in the Terraform state. Make note of the role_id here.
3. Go to your KMS key in AWS and update the Key Policy to add the following:
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
4. In ClickHouse Cloud, open a support case with the service name to let us know we can enable the new method. This change requires a service restart, please let us know if there is a day/ time that is best to restart the service.
5. After we restart the service, you can update the transparent_data_encryption.enabled setting to ‘True’ and remove the tier setting in Terraform and apply. This will result in no changes.
6. Go to your KMS key in AWS and remove the following from the Key Policy:
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
7. The update is complete!
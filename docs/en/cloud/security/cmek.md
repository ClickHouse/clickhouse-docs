---
sidebar_label: Enhanced Encryption
slug: /en/cloud/security/cmek
title: Customer Managed Encryption Keys (CMEK)
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge' 

# ClickHouse Enhanced Encryption

<EnterprisePlanFeatureBadge feature="Enhanced Encryption" support="true"/>

Data at rest is encrypted by default using cloud provider-managed AES 256 keys. Customers may enable Transparent Data Encryption (TDE) to provide an additional layer of protection for service data. Additionally, customers may supply their own key to implement Customer Managed Encryption Keys (CMEK) for their service.

Enhanced encryption is currently available in AWS services. Other cloud providers are coming soon.

## Transparent Data Encryption (TDE)

TDE must be enabled on service creation. Existing services cannot be encrypted after creation.

1. Select `Create new service`
2. Name the service
3. Select AWS as the cloud provider and the desired region from the drop-down
4. Click the drop-down for Enterprise features and toggle Enable Transparent Data Encryption (TDE)
5. Click Create service

## Customer Managed Encryption Keys (CMEK)

:::warning
Deleting a KMS key used to encrypt a ClickHouse Cloud service will cause your ClickHouse service to be stopped and its data will be unretrievable, along with existing backups.
:::

Once a service is encrypted with TDE, customers may update the key to enable CMEK. 

1. In ClickHouse Cloud, select the encrypted service
2. Click on the Settings on the left
3. At the bottom of the screen, expand the Network security information
4. Copy the Encryption role ID - you will need this in a future step
5. In AWS, [create a KMS key](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html)
6. Click the key
7. Edit the Key policy as follows

    ```json
    {
        "Sid": "Allow ClickHouse Access",
            "Effect": "Allow",
            "Principal": {
                "AWS": "{ Encryption role ID }"
            },
            "Action": [
                "kms:Encrypt",
                "kms:Decrypt",
                "kms:ReEncrypt",
                "kms:DescribeKey"
            ],
            "Resource": "*"
    }
    ```

9. Save the Key policy
10. Copy the Key ARN
11. Return to ClickHouse Cloud and paste the Key ARN
12. Save the change

The service will automatically restart. During this process, the old KMS key decrypts the data encrypting key (DEK), and the new KMS key re-encrypts the DEK. This ensures that the service on restart will use the new KMS key for encryption operations moving forward. This process may take several minutes.

## Backup and Restore

Backups are encrypted using the same key as the associated service. When you restore an encrypted backup, it creates an encrypted instance that uses the same KMS key as the original instance. If needed, you can rotate the KMS key; see [Key Rotation](#key-rotation) for more details.

## KMS Key Poller

When using CMEK, the validity of the provided KMS key is checked every 10 minutes. If access to the KMS key is invalid, the ClickHouse service will stop. To resume service, restore access to the KMS key by following the steps in this guide, and then restart the service.

Due to the nature of this feature, it's not possible to recover a ClickHouse Cloud service after the KMS key has been deleted. To prevent this, most providers don't remove the key immediately and instead schedule it for deletion, please check your provider documentation.

## Key Rotation

Due to the nature of this feature, it is not possible to recover a ClickHouse Cloud service if the KMS key has been deleted. To prevent accidental loss, most providers schedule key deletion rather than removing it immediately. For more details, refer to your provider’s documentation.

## Performance

As specified in this page, we use ClickHouse's built-in [Virtual File System for Data Encryption feature](/docs/en/operations/storing-data#encrypted-virtual-file-system) to encrypt and protect your data.

The algorithm in use for this feature is `AES_256_CTR`, which is expected to have a performance penalty of 5-15% depending on the workload:

![CMEK Performance Penalty](@site/docs/en/_snippets/images/cmek-performance.png)

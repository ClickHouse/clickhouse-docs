---
sidebar_label: Enhanced Encryption
slug: /en/cloud/security/cmek
title: Customer Managed Encryption Keys (CMEK)
---

# ClickHouse Enhanced Encryption

<EnterprisePlanFeatureBadge feature="Enhanced Encryption" support="true"/>

Data at rest is encrypted by default using cloud provider managed AES 256 keys. Customers may enable Transparent Data Encryption (TDE) to provide an additional layer of protection for service data. Additionally, customers may supply their own key to implement Customer Managed Encryption Keys (CMEK) for their service.

Enhanced encryption is currently available in AWS services. Other cloud providers are coming soon.

## Transparent Data Encryption (TDE)

TDE must be enabled on service creation. Existing services cannot be encrypted after creation.

1. Select Create new service
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
3. At the bottom of the screen, expand the Network security information.
4. Copy the Encryption role ID, you will need this in a future step
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

The service will automatically restart. During this process the old KMS key will be used to decrypt the data enrypting key and the new key will be used to re-encrypt the data encrypting key. When the service starts it will be using the new KMS key. This process may take several minutes.


## Backup and Restore

Backups are encrypted using the same key as the service to which they are associated. Restoring an encrypted backup will create an encrypted instance that uses the same KMS key as the original instance, the KMS key can be rotated if desired, please check [Key Rotation](#key-rotation) for details.


## KMS Key Poller

When using CMEK, we need to periodically confirm the provided KMS key is still valid. We check the access for the KMS Key every 10 minutes, when the access is not valid we stop the ClickHouse service. To resume service, please reinstate access by following the steps on this guide and then start your service.

Due to the nature of this feature, it's not possible to recover a ClickHouse Cloud service after the KMS key has been deleted. To prevent this, most providers don't remove the key immediately and instead schedule it for deletion, please check your provider documentation.

## Key Rotation

Key rotation is supported within the same KMS provider. This action will re-encrypt the data encryption key using the new KMS key, this request is processed immediately without any downtime for your ClickHouse service. To perform this action please ensure access to both the configured KMS key and the new KMS key.

## Performance

As specified in this page, we utilize the ClickHouse's built-in [Virtual File System for Data Encryption feature](/docs/en/operations/storing-data#encrypted-virtual-file-system) to encrypt and protect your data.

The algorithm in use for this feature is `AES_256_CTR`, which is expected to have a performance penalty of 5-15% depending on the workload:

![CMEK Performance Penalty](@site/docs/en/_snippets/images/cmek-performance.png)

---
sidebar_label: Encryption
slug: /en/cloud/manage/cmek
title: Encryption
---

# Customer Managed Encryption Keys (CMEK)

ClickHouse Cloud enables customers to protect their services by leveraging their own Key Management Service (KMS) key. We utilize the ClickHouse's built-in [Virtual File System for Data Encryption feature](/docs/en/operations/storing-data#encrypted-virtual-file-system) to encrypt and protect your data. The data encryption key used by the ClickHouse Cloud service is then encrypted and protected using customer's provided KMS key in a process known as [envelope encryption](https://docs.aws.amazon.com/wellarchitected/latest/financial-services-industry-lens/use-envelope-encryption-with-customer-master-keys.html). All the service needs for this to work is access to your KMS key to decrypt & encrypt the data encryption key at runtime.

This feature is exclusive to ClickHouse Cloud Production services, to enable this feature please contact [support](/docs/en/cloud/support). Customer managed encryption keys must be specified at service creation time, existing services cannot use this option, please check [Backup and Restore](#backup-and-restore) for an alternative option.

Currently supported KMS providers:

- [AWS Key Management Service](https://aws.amazon.com/kms) for services hosted on: AWS

Coming soon:

- [Azure Key Vault](https://azure.microsoft.com/en-us/products/key-vault) for services hosted on: Azure
- [GCP Cloud Key Management](https://cloud.google.com/security-key-management) for services hosted on: GCP
- [Hashicorp Vault](https://www.hashicorp.com/products/vault) for services hosted on: AWS, Azure, GCP

:::warning
Deleting a KMS key used to encrypt a ClickHouse Cloud service will cause your ClickHouse service to be stopped and its data will be unretrievable, along with existing backups.
:::

## Step 1. Creating a KMS Key

### Using AWS KMS

You can create the AWS KMS key via the AWS Console, CloudFormation stack, or using a Terraform provider. We walk through the steps for each below.

#### Option 1. Manually create a KMS key via the AWS Console

*Note: If you already have a KMS key you want to use, you can move on to the next step.*

1. Login to your AWS Account and navigate to the Key Management Service.
2. Select __Customer managed keys__ on the left.
3. Click __Create key__ on the upper right.
4. Choose __Key type__ "Symmetric" and __Key usage__ "Encrypt and decrypt" and click Next.
5. Enter an alias (display name) for your key and click Next.
6. Choose your key administrator(s) and click Next.
7. (Optional) Choose your key user(s) and click Next.
8. Add the following code snippet at the bottom of the __Key policy__:

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

    ![Encryption Key Policy](@site/docs/en/_snippets/images/cmek1.png)

9. Click Finish.
10. Click the alias of the key you just created.
11. Use the copy button to copy the ARN.

#### Option 2. Configure or Create a KMS key using a CloudFormation stack

ClickHouse provides a simple Cloud Formation stack to deploy the AWS Policy for your key. This method supports both existing KMS keys and creation of new KMS keys for ClickHouse Cloud integration.

##### Use an existing KMS key

1. Login to your AWS account.
2. Visit [this link](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/cmek.yaml&stackName=ClickHouseBYOK&param_KMSCreate=false&param_ClickHouseRole=arn:aws:iam::576599896960:role/prod-kms-request-role) to prepare the CloudFormation template.
3. Enter the ARNs of the KMS key(s) you want to use (comma separated with no spaces in between).
4. Accept "I acknowledge that AWS CloudFormation might create IAM resources with custom names." and click __Create stack__.
5. Make note of the `RoleArn` and the `KeyArn` in the stack output as you will need these for the next step.

##### Create a new KMS key

1. Login to your AWS account.
2. Visit [this link](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/cmek.yaml&stackName=ClickHouseBYOK&param_KMSCreate=true&param_ClickHouseRole=arn:aws:iam::576599896960:role/prod-kms-request-role) to prepare the CloudFormation template.
3. Accept "I acknowledge that AWS CloudFormation might create IAM resources with custom names." and click __Create stack__.
4. Make note of the `KeyArn` in the stack output as you will need this for the next step.

#### Option 3. Create a KMS key via Terraform

For users who want to deploy the key via Terraform, check out the AWS provider documentation [here](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/kms_key).

## Step 2. Starting a ClickHouse service with Customer Managed Encryption Keys

1. Log into your ClickHouse Cloud account.
2. Go to the Services screen if you are not already there.
3. Click __New Service__.
4. Select your Cloud provider, Region and name your service.
5. Click __Set up encryption key (CMEK)__ - example is shown using the AWS KMS provider.
6. Paste your AWS ARN in the field on the right side of the window.

    ![Encryption Setup](@site/docs/en/_snippets/images/cmek2.png)

7. The system will check to ensure the encryption key is accessible.
8. Once you see the __Valid__ message above the AWS ARN box click __Create Service__.
9. A key icon will show in the upper right corner of the service tile on the Services screen to let you know it is encrypted.

    ![Service Encrypted](@site/docs/en/_snippets/images/cmek3.png)

## Backup and Restore

Backups are encrypted using the same key as the service to which they are associated. Restoring an encrypted backup will create an encrypted instance that uses the same KMS key as the original instance, the KMS key can be rotated if desired, please check [Key Rotation](#key-rotation) for details.

An encrypted instance can be created by restoring a non-encrypted backup and specifying the desired KMS key for the new service, please contact [support](/docs/en/cloud/support) for assistance.

## KMS Key Poller

When using envelope encryption, we need to periodically confirm the provided KMS key is still valid. We check the access for the KMS Key every 10 minutes, when the access is not valid anymore we stop the ClickHouse service. To resume service, please reinstate access by following the steps on this guide and then start your service.

Due to the nature of this feature, it's not possible to recover a ClickHouse Cloud service after the KMS key has been deleted. To prevent this, most providers don't remove the key immediately and instead schedule it for deletion, please check your provider documentation or contact [support](/docs/en/cloud/support) for assistance on this process.

## Key Rotation

Key rotation is supported within the same KMS provider. This action will re-encrypt the data encryption key using the new KMS key, this request is processed immediately without any downtime for your ClickHouse service. To perform this action please ensure access to both the configured KMS key and the new KMS key and contact [support](/docs/en/cloud/support) with the KMS key information.

## Performance

As specified in this page, we utilize the ClickHouse's built-in [Virtual File System for Data Encryption feature](/docs/en/operations/storing-data#encrypted-virtual-file-system) to encrypt and protect your data.

The algorithm in use for this feature is `AES_256_CTR`, which is expected to have a performance penalty of 5-15% depending on the workload:

![CMEK Performance Penalty](@site/docs/en/_snippets/images/cmek-performance.png)

---
sidebar_label: Customer Managed Encryption Keys
slug: /en/cloud/manage/cmek
title: Customer Managed Encryption Keys
---

# Customer Managed Encryption Keys (CMEK)

ClickHouse Cloud enables customers to encrypt their services housed in AWS using their own AWS KMS key. We utilize AWS KMS keys to encrypt the virtual file system, then use a key you generate and manage to encrypt the AWS KMS key in a process known as envelope encryption. All the service needs for this to work is access to your AWS KMS key to decrypt & encrypt the data encryption key.

:::note
To enable this feature please contact [support](https://clickhouse.cloud/support). Customer managed encryption keys must be specified at the time the service is created. Existing services cannot use this option at this time.
:::

# Step 1. Creating an AWS KMS Key

You can create the AWS KMS key via the AWS Console, CloudFormation stack, or using a Terraform provider. We walk through the steps for each below.

## Option 1. Manually create a KMS key via the AWS Console

*Note: if you already have an KMS key you want to use, you can move on to the next step*

1. Login to your AWS Account and navigate to the Key Management Service.
2. Select __Customer managed keys__ on the left.
3. Click __Create key__ on the upper right.
4. Choose __Key type__ "Symmetric" and __Key usage__ "Encrypt and decrypt" and click Next.
5. Enter an alias (display name) for your key and click Next.
6. Choose your key administrator(s) and click Next.
7. (Optional) Choose your key user(s) and click Next.
8. Add the following code snippet at the bottom of the __Key policy__.

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

## Option 2. Configure or Create a KMS key using a CloudFormation stack

ClickHouse provides a simple Cloud Formation stack to deploy the AWS Policy for your key. This method supports both existing KMS keys and creation of new KMS keys for ClickHouse Cloud integration.

### Use an existing KMS key

1. Login to your AWS account.
2. Visit [this link](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/cmek.yaml&stackName=ClickHouseBYOK&param_KMSCreate=false&param_ClickHouseRole=arn:aws:iam::576599896960:role/prod-kms-request-role) to prepare the CloudFormation template.
3. Enter the ARNs of the KMS key(s) you want to use (comma separated with no spaces in between).
4. Accept "I acknowledge that AWS CloudFormation might create IAM resources with custom names." and click __Create stack__.
5. Make note of the `RoleArn` and the `KeyArn` in the stack output as you will need these for the next step.


### Create a new KMS key

1. Login to your AWS account.
2. Visit [this link](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/cmek.yaml&stackName=ClickHouseBYOK&param_KMSCreate=true&param_ClickHouseRole=arn:aws:iam::576599896960:role/prod-kms-request-role) to prepare the CloudFormation template.
4. Accept "I acknowledge that AWS CloudFormation might create IAM resources with custom names." and click __Create stack__.
5. Make note of the `KeyArn` in the stack output as you will need this for the next step.

## Option 3. Create a KMS key via Terraform

For advanced users who want to deploy the key via terraform, check out the AWS provider documentation [here](https://registry.terraform.io/providers/hashicorp/aws/3.26.0/docs/resources/kms_key).

# Step 2. Starting a Service with Customer Managed Encryption Keys

1. Log into your ClickHouse Cloud account.
2. Go to the Services screen if you are not already there.
3. Click __New Service__.
4. Select your Cloud provider, Region and name your service.
5. Click __Set up encryption key (CMEK)__.
6. Paste your AWS ARN in the field on the right side of the window.

![Encryption Setup](@site/docs/en/_snippets/images/cmek2.png)

7. The system will check to ensure the encryption key is accessible.
8. Once you see the __Valid__ message above the AWS ARN box click __Create Service__.
9. A key icon will show in the upper right corner of the service tile on the Services screen to let you know it is encrypted.

![Service Encrypted](@site/docs/en/_snippets/images/cmek3.png)

Backups will be encrypted using the same key as the service to which they are associated. If you need to restore an encrypted backup, please contact [support](https://clickhouse.cloud/support).

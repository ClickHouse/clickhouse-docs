---
sidebar_label: Customer Managed Encryption Keys
slug: /en/cloud/manage/cmek
title: Customer Managed Encryption Keys
---

ClickHouse Cloud provides customers the option to encrypt their services using their own AWS KMS key. Encryption at rest is done through the use of encrypted virtual file system. In ClickHouse Cloud, we use envelope encryption technique to protect customers data key, the same way that [AWS protects KMS keys](https://docs.aws.amazon.com/wellarchitected/latest/financial-services-industry-lens/use-envelope-encryption-with-customer-master-keys.html) and AWS S3 data encryption key in SSE-S3 and SSE-KMS mode. In order for this to work, our service needs to be able to access your AWS KMS key to decrypt & encrypt the data encryption key.

:::note
This service is available for Production Services at this time. Please log a support ticket to enable this feature: https://clickhouse.cloud/support

Customer managed encryption keys must be specified at the time the service is created. Existing services cannot use this option at this time.
:::

# Step 1. Creating an AWS KMS Keys

*Check out [Creating keys](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html) for additional documentation from AWS.*

## Option 1. Manually create KMS key for CMEK via AWS Console

Here we have steps to create a KMS key manually inside your AWS account via AWS Console. For advanced users who want to deploy the key via terraform, check out the aws provider documentation [here](https://registry.terraform.io/providers/hashicorp/aws/3.26.0/docs/resources/kms_key).


*Note: if you already have an KMS key you want to use, you can move on to the next step*

1. Create a new KMS key:

 -  Login to your AWS Account, Navigate to AWS KMS 
 -  Select Customer managed key, click on "Create a new key"
 -  Choose KeyType "Symmetric" and Keyusage "Encrypt and decrypt"
 -  Follow the prompt to name your CMEK key and choose a key administrator.
 -  Click Finish to create the key

2. Update key policy to grant ClickHouse service access:

 - Under Customer managed keys, click on the newly created KMS key
 - Under Key Policy, click on "Switch to policy view"
 - Click "Edit" to modify the key policy and add the following policy under Statement:


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

- Save the changes and copy the KMS key ARNs for Step 2.

## Option 2. Creating CMEK key using Cloudformation stack

ClickHouse provides a simple cloudformation stack to deploy CMEK setup inside the customer's account. This method supports both existing KMS keys in your account and creation of a new KMS key for ClickHouse CMEK integration.

**Using existing key**

1. Login to your aws account
2. Visit [this link](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/cmek.yaml&stackName=ClickHouseBYOK&param_KMSCreate=false&param_ClickHouseRole=arn:aws:iam::576599896960:role/prod-kms-request-role) to prepare the cloudformation template into your account
3. Enter the ARNs of the KMS key(s) you want to use for CMEK (comma separated with no spaces in between)
4. Accept "I acknowledge that AWS CloudFormation might create IAM resources with custom names." and click "Create stack"
5. Check the output of the stack for the `RoleArn` and the `KeyArn` as you will need these for the next step.

**Creating new KMS key**

1. Login to your aws account
2. Visit [this link](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/cmek.yaml&stackName=ClickHouseBYOK&param_KMSCreate=true&param_ClickHouseRole=arn:aws:iam::576599896960:role/prod-kms-request-role) to prepare the cloudformation template into your account
4. Accept "I acknowledge that AWS CloudFormation might create IAM resources with custom names." and click "Create stack"
5. Check the output of the stack for the `KeyArn` as you will need this for the next step.


# Step 2. Starting a Service with Customer Managed Encryption Keys

{{ steps for providing the needed info in the setup }}

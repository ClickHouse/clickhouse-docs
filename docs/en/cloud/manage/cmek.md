---
sidebar_label: Customer Managed Encryption Keys
slug: /en/cloud/manage/cmek
title: Customer Managed Encryption Keys
---

ClickHouse Cloud provides customers the option to encrypt their services using their own AWS KMS key.

:::note
Customer managed encryption keys must be specified at the time the service is created. Existing services cannot use this option.
:::

# Creating AWS KMS Keys

See [Creating keys](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html) for additional documentation from AWS.

{{ steps to grant permissions }}

# Starting a Service with Customer Managed Encryption Keys

{{ steps for providing the needed info in the setup }}

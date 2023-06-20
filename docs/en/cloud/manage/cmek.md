---
sidebar_label: Customer Managed Encryption Keys
slug: /en/cloud/manage/cmek
title: Customer Managed Encryption Keys
---

ClickHouse Cloud provides customers the option to encrypt their services using their own AWS KMS key.

:::note
This service is available for Production Serices at this time. Please log a support ticket to enable this feature: https://clickhouse.cloud/support

Customer managed encryption keys must be specified at the time the service is created. Existing services cannot use this option at this time.
:::

# Creating AWS KMS Keys

See [Creating keys](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html) for additional documentation from AWS.

{{ steps to grant permissions }}

# Starting a Service with Customer Managed Encryption Keys

{{ steps for providing the needed info in the setup }}

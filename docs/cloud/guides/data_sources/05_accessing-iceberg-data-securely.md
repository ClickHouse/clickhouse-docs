---
slug: /cloud/data-sources/secure-iceberg
sidebar_label: 'Accessing Iceberg data securely'
title: 'Accessing Iceberg data securely'
description: 'This article demonstrates how ClickHouse Cloud customers can securely access Apache Iceberg data in object storage using role-based access.'
keywords: ['Iceberg', 'RBAC', 'Amazon S3', 'authentication']
doc_type: 'guide'
---

ClickHouse Cloud supports secure role-based access to Iceberg data stored in object storage (typically S3) by using an ARN-based AWS IAM trust relationship. This guide follows the same secure-setup pattern as [Accessing S3 data securely](/cloud/data-sources/secure-s3), and adds Iceberg-specific configuration in ClickHouse.

## Overview {#overview}

- Obtain the ClickHouse Cloud service IAM role ARN.
- Create an IAM role in your AWS account that ClickHouse can assume.
- Attach Iceberg-specific object and catalog policies to the role.
- Use Iceberg table functions or the `IcebergS3` table engine with role-based credentials.

## Obtain the ClickHouse service IAM role ARN {#obtaining-the-clickhouse-service-iam-role-arn}

1. Login to your ClickHouse Cloud account.
2. Select the ClickHouse service where you want to query Iceberg data.
3. Go to the **Settings** tab.
4. Scroll to **Network security information**.
5. Copy the **Service role ID (IAM)** value.

This ARN is required for the trust policy on the AWS IAM role that will access your Iceberg data.

## Set up IAM assume role {#setting-up-iam-assume-role}

1. Login to the AWS Console with permissions to manage IAM.
2. Open IAM -> Roles -> Create role.
3. Choose `Another AWS account`, and enter the **ClickHouse service role ARN** from above.
4. Attach the trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::111111111111:role/ClickHouseServiceRole"  
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

5. Attach an IAM policy with S3 and catalog permissions suited to your Iceberg workflow.

#### Read-only Iceberg S3 policy (#read-only-iceberg-s3-policy)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetBucketLocation",
        "s3:ListBucket",
        "s3:GetObject",
        "s3:ListMultipartUploadParts",
        "s3:GetObjectVersion",
        "s3:ListBucketVersions"
      ],
      "Resource": [
        "arn:aws:s3:::<YOUR_BUCKET>",
        "arn:aws:s3:::<YOUR_BUCKET>/*"
      ]
    }
  ]
}
```

#### Glue Data Catalog permissions (optional, if using Glue catalog) {#glue-data-catalog-permissions}

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "glue:GetDatabase",
        "glue:GetDatabases",
        "glue:GetTable",
        "glue:GetTables",
        "glue:GetPartition",
        "glue:GetPartitions"
      ],
      "Resource": "arn:aws:glue:<REGION>:<ACCOUNT_ID>:*"
    }
  ]
}
```

6. Create the role and copy the role ARN (`arn:aws:iam::<ACCOUNT_ID>:role/<RoleName>`).

## Configure Iceberg access in ClickHouse Cloud {#configure-iceberg-access}

### Option A: Iceberg table function with role ARN {#iceberg-table-function-with-role-arn}

Use the `icebergS3` table function with the `NOSIGN` option and role-based credentials. ClickHouse Cloud will call STS to assume the role.

```sql
SELECT count(*)
FROM icebergS3(
  'https://<YOUR_BUCKET>.s3.<REGION>.amazonaws.com/<iceberg-path>/',
  'NOSIGN',
  extra_credentials(role_arn='arn:aws:iam::<ACCOUNT_ID>:role/<ClickHouseIcebergRole>', role_session_name='clickhouse-iceberg-session')
);
```

### Option B: Persistent Iceberg table engine {#persistent-iceberg-table-engine}

```sql
CREATE TABLE iceberg_secure (
  id UInt64,
  event_date Date,
  data String
)
ENGINE = IcebergS3(
  'https://<YOUR_BUCKET>.s3.<REGION>.amazonaws.com/<iceberg-path>/',
  'NOSIGN',
  extra_credentials(role_arn='arn:aws:iam::<ACCOUNT_ID>:role/<ClickHouseIcebergRole>')
);
```

### Option C: Glue catalog + IcebergS3 {#glue-catalog-plus-icebergs3}

```sql
CREATE TABLE my_db.my_table
ENGINE = IcebergS3(
  's3://<YOUR_BUCKET>/warehouse/<db>/<table>/',
  'NOSIGN',
  extra_credentials(role_arn='arn:aws:iam::<ACCOUNT_ID>:role/<ClickHouseIcebergRole>')
)
SETTINGS
  catalog_type = 'glue',
  warehouse = '<your_warehouse>',
  storage_endpoint = 's3://<YOUR_BUCKET>/',
  region = '<REGION>'
  aws_role_arn = 'arn:aws:iam::<ACCOUNT_ID>:role/<ClickHouseIcebergRole>';
```

> Note: When using Glue catalog, ensure your IAM role has both S3 and Glue read/list permissions.

## Validate access {#validate-access}

1. Run a simple query:

```sql
SELECT * FROM icebergS3('https://<YOUR_BUCKET>.s3.<REGION>.amazonaws.com/<iceberg-path>/', 'NOSIGN')
LIMIT 5;
```

2. Check for IAM errors like `AccessDenied` or `InvalidAccessKeyId`.
3. If you need stronger isolation, require requests to originate from ClickHouse Cloud VPC endpoints.

## Advanced action control {#advanced-action-control}

For stricter access control, restrict access using conditions to ClickHouse Cloud VPC endpoints or IP ranges.

1. Get ClickHouse Cloud static endpoints for your region:

```bash
curl -s https://api.clickhouse.cloud/static-ips.json | jq -r '.aws[] | select(.region == "<your-region>") | .s3_endpoints[]'
```

2. Add bucket policy condition:

```json
{
  "Sid": "AllowOnlyClickHouseCloud",
  "Effect": "Deny",
  "Principal": "*",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::<YOUR_BUCKET>/*",
  "Condition": {
    "StringNotEquals": {
      "aws:SourceVpce": ["vpce-xxxxxxx"]
    }
  }
}
```

## Troubleshooting {#troubelshooting}

- Verify the role ARN from ClickHouse Cloud service settings.
- Ensure your bucket/objects are in the same region as the Iceberg queries to reduce latency and cost.
- Confirm Iceberg table path points to a valid Iceberg metadata location (`metadata/v1/...` files under the table root).
- For catalog mode, check Glue metadata and partition visibility with AWS Glue console.

:::note
For read/write workloads, the IAM policy must include `s3:PutObject`, `s3:DeleteObject`, and metadata-modifying actions for Iceberg. The above sample is conservative read-only.
:::

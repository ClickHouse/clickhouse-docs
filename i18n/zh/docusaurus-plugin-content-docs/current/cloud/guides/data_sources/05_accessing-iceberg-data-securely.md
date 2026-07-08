---
slug: /cloud/data-sources/secure-iceberg
sidebar_label: '安全地访问 Iceberg 数据'
title: '安全地访问 Iceberg 数据'
description: '本文介绍 ClickHouse Cloud 客户如何通过基于角色的访问控制，安全访问对象存储中的 Apache Iceberg 数据。'
keywords: ['Iceberg', 'RBAC', 'Amazon S3', '身份验证']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';

ClickHouse Cloud 支持通过基于 ARN 的 AWS IAM 信任关系，以安全的基于角色的方式访问存储在对象存储 (通常为 S3) 中的 Iceberg 数据。本指南沿用与 [安全访问 S3 数据](/cloud/data-sources/secure-s3) 相同的安全配置模式，并补充了 ClickHouse 中 Iceberg 特有的配置。

## 概述 \{#overview\}

* 获取 ClickHouse Cloud 服务角色 ID (IAM) 。
* 在您的 AWS 账户中创建一个 ClickHouse 可承担的 IAM 角色。
* 将 Iceberg 专用的对象和目录策略附加到该角色。
* 使用基于角色的凭证访问 Iceberg 表函数或 IcebergS3 表引擎。

## 获取 ClickHouse 服务角色 ID (ARN) \{#obtaining-the-clickhouse-service-iam-role-arn\}

<VerticalStepper headerLevel="h3">
  ### 1. 登录到您的 ClickHouse Cloud 账户。 \{#login\}

  ### 2. 选择您要查询 Iceberg 数据的 ClickHouse 服务。 \{#select-service\}

  ### 3. 转到 **设置** 选项卡。 \{#settings-tab\}

  ### 4. 滚动到 **网络安全信息**。 \{#network-security-information\}

  ### 5. 复制 **服务角色 ID (IAM)&#x20;**&#x20;的值。 \{#service-role-iam-value\}

  配置 AWS IAM 角色的信任策略以访问您的 Iceberg 数据时，需要使用此 ARN。

  <Image img={s3_info} size="lg" alt="获取 ClickHouse 服务 IAM 角色 ARN" border />
</VerticalStepper>

## 设置 IAM Assume Role \{#setting-up-iam-assume-role\}

<VerticalStepper headerLevel="h3">
  ### 1. 登录 AWS 并进入 IAM 服务。 \{#aws-iam-service\}

  ### 2. 选择 Roles，然后选择 Create role。 \{#create-role\}

  将 `Trusted entity type` 设为 `Custom trust policy`，并根据步骤 3 填写相应的值。

  ### 3. 添加 Trust 和 IAM 策略。 \{#add-trust-iam-policies\}

  将 `{service-role-id}` 替换为您的 ClickHouse 实例中的服务角色 ID (IAM)。

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "ClickHouseServiceRoleTrustPolicy",
        "Effect": "Allow",
        "Action": "sts:AssumeRole",
        "Principal": {
          "AWS": "{service-role-id}"  
        }
      },
      {
        "Sid": "ReadOnlyIcebergS3IAMPolicy",
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
          "arn:aws:s3:::{your-bucket}",
          "arn:aws:s3:::{your-bucket}/*"
        ]
      },
      {
        "Sid": "OptionalGlueDataCatalogIAMPolicy",
        "Effect": "Allow",
        "Action": [
          "glue:GetDatabase",
          "glue:GetDatabases",
          "glue:GetTable",
          "glue:GetTables",
          "glue:GetPartition",
          "glue:GetPartitions"
        ],
        "Resource": "arn:aws:glue:{region}:{account-id}:*"
      }
    ]
  }
  ```

  :::note
  对于读/写工作负载，IAM 策略必须包含 `s3:PutObject`、`s3:DeleteObject` 以及用于修改 Iceberg 元数据的操作。上面的示例采用的是保守的只读权限配置。

  如果您需要更强的隔离性，可要求请求必须来自 ClickHouse Cloud VPC 端点。有关此选项的更多信息，请参阅 [Secure S3 advanced action control](/docs/cloud/data-sources/secure-s3#advanced-action-control)。
  :::

  ### 4. 完成角色创建。 \{#finish-role-creation\}

  a. 点击 Next，然后在权限分配页面再次点击 Next。

  b. 添加名称 (例如 `iceberg-role-for-clickhouse`) 和说明。

  c. 添加标签 (可选) 。

  d. 检查这些策略。

  e. 选择 `Create role`。

  ### 5. 创建完成后，复制新的 **IAM Role Arn**。 \{#copy-role-arn\}
</VerticalStepper>

## 在 ClickHouse Cloud 中配置对 Iceberg 的访问 \{#configure-iceberg-access\}

### 选项 A：使用角色 ARN 的 Iceberg 表函数 \{#iceberg-table-function-with-role-arn\}

使用 `icebergS3` 表函数，并结合 `NOSIGN` 选项和基于角色的凭证。ClickHouse Cloud 会调用 STS 以承担该角色。

```sql
SELECT count(*)
FROM icebergS3(
  'https://{your-bucket}.s3.{region}.amazonaws.com/{iceberg-path}/',
  'NOSIGN',
  extra_credentials(role_arn='arn:aws:iam::{account-id}:role/iceberg-role-for-clickhouse', role_session_name='iceberg-session')
);
```

### 方案 B：持久化 Iceberg 表引擎 \{#persistent-iceberg-table-engine\}

```sql
CREATE TABLE iceberg_secure (
  id UInt64,
  event_date Date,
  data String
)
ENGINE = IcebergS3(
  'https://{your-bucket}.s3.{region}.amazonaws.com/{iceberg-path}/',
  'NOSIGN',
  extra_credentials(role_arn='arn:aws:iam::{account-id}:role/iceberg-role-for-clickhouse')
);
```

### 方案 C：Glue 目录 + IcebergS3 \{#glue-catalog-plus-icebergs3\}

```sql
CREATE TABLE my_db.my_table
ENGINE = IcebergS3(
  's3://{your-bucekt}/warehouse/{db}/{table}/',
  'NOSIGN',
  extra_credentials(role_arn='arn:aws:iam::{account-id}:role/iceberg-role-for-clickhouse')
)
SETTINGS
  catalog_type = 'glue',
  warehouse = '{your-warehouse}',
  storage_endpoint = 's3://{your-bucket}',
  region = '{region}'
  aws_role_arn = 'arn:aws:iam::{account-id}:role/iceberg-role-for-clickhouse';
```

> 注意：使用 Glue 目录时，请确保您的 IAM 角色同时具有 S3 和 Glue 的读取和列出权限。

### 选项 D：Glue 的 DataLake 目录 \{#datalake-catalog-for-glue\}

:::note
Glue 的 DataLake 目录将于 26.2 版本推出。
:::

```sql
CREATE DATABASE glue_test2
ENGINE = DataLakeCatalog
SETTINGS 
    catalog_type = 'glue', 
    region = {region}, 
    aws_role_arn = 'arn:aws:iam::{account-id}:role/iceberg-role-for-clickhouse',
    aws_role_session_name = {session-name},
    SETTINGS
    allow_database_glue_catalog = 1;
```

## 验证是否可访问 \{#validate-access\}

1. 运行一个简单的查询：

```sql
SELECT * FROM icebergS3('https://{your-bucket}.s3.{region}.amazonaws.com/{iceberg-path}/', 'NOSIGN')
LIMIT 5;
```

2. 检查是否出现了 `AccessDenied` 或 `InvalidAccessKeyId` 等 IAM 错误。

## 故障排查 \{#troubelshooting\}

* 核实 ClickHouse Cloud 服务设置中的角色 ARN。
* 确保存储桶/对象与 Iceberg 查询位于同一区域，以降低延迟和成本。
* 确认 Iceberg 表路径指向有效的 Iceberg 元数据位置 (即表根目录下的 `metadata/v1/...` 文件) 。
* 对于目录模式，请使用 AWS Glue 控制台检查 Glue 元数据和分区可见性。
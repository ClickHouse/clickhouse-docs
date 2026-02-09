---
sidebar_label: '概览'
description: '如何使用 ClickPipes 将 BigQuery 数据导出到 ClickHouse Cloud。'
slug: /integrations/clickpipes/bigquery/overview
sidebar_position: 1
title: 'BigQuery 与 ClickHouse Cloud 的集成'
doc_type: 'guide'
---

import IntroClickPipe from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/clickpipes/bigquery/_intro.md';
import cp_iam from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_iam.png';
import Image from '@theme/IdealImage';

<IntroClickPipe />


## 功能特性 \{#features\}

### 初始加载 \{#initial-load\}

BigQuery ClickPipe 会在单次批处理操作中，将 BigQuery [dataset](https://docs.cloud.google.com/bigquery/docs/datasets-intro) 中选定的表加载到 ClickHouse 目标表中。一旦摄取任务完成，ClickPipe 会自动停止。初始加载摄取流程需要用户提供一个用于中转的 Google Cloud Storage（GCS）存储桶（bucket）。未来，该中间存储桶将由 ClickPipes 提供并托管。

:::note
ClickPipes 依赖批量导出作业，将数据从 BigQuery 导出到中转用的 GCS 存储桶中。此操作在 BigQuery 中**不产生任何处理费用**。
:::

### CDC（变更数据捕获） \{#cdc\}

CDC 在 Private Preview 中当前**不受支持**，但将在未来提供支持。在此期间，我们建议在完成初始加载后，使用 [Google Cloud Storage ClickPipe](/integrations/clickpipes/object-storage/gcs/overview) 将 BigQuery 的数据导出持续同步到 ClickHouse Cloud。

## 数据类型映射 \{#data-type-mapping\}

[BigQuery 数据类型](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/data-types)。

| BigQuery 数据类型 | ClickHouse 数据类型 | 详情                                                                 |
|--------------------|----------------------|----------------------------------------------------------------------|
| `BOOL`             | `Bool`               |                                                                      |
| `INT64`            | `Int64`              |                                                                      |
| `FLOAT64`          | `Float64`            |                                                                      |
| `NUMERIC`          | `Decimal(P, S)`      | 最高 38 位精度，最多 9 位小数。精度/小数位数会被保留。                |
| `BIGNUMERIC`       | `Decimal(P, S)`      | 最高 76 位精度，最多 38 位小数。精度/小数位数会被保留。               |
| `STRING`           | `String`             |                                                                      |
| `BYTES`            | `String`             |                                                                      |
| `JSON`             | `String` (JSON)      |                                                                      |
| `DATE`             | `Date`               |                                                                      |
| `TIME`             | `String`             | 微秒级精度。                                                         |
| `DATETIME`         | `DateTime`           | 微秒级精度。                                                         |
| `TIMESTAMP`        | `DateTime64(6)`      | 微秒级精度。                                                         |
| `GEOGRAPHY`        | `String`             |                                                                      |
| `GEOMETRY`         | `String`             |                                                                      |
| `UUID`             | `String`             |                                                                      |
| `ARRAY<T>`         | `Array(T)`           |                                                                      |
| `ARRAY<DATE>`      | `Array(Date)`        |                                                                      |
| `STRUCT` (RECORD)  | `String`             |                                                                      |

## 访问控制 \{#access-control\}

### 认证 \{#authentication\}

#### 服务账号凭据 \{#service-account-credentials\}

ClickPipes 使用[服务账号密钥](https://docs.cloud.google.com/iam/docs/keys-create-delete)对您的 Google Cloud 项目进行身份认证。我们建议创建一个仅具备所需最小[权限](#permissions)的专用服务账号，以便允许 ClickPipes 从 BigQuery 导出数据，将其加载到暂存用 GCS 存储桶中，并将其读取到 ClickHouse 中。

<Image img={cp_iam} alt="创建具备 BigQuery 和 Cloud Storage 权限的服务账号密钥" size="lg" border/>

### 权限 \{#permissions\}

#### BigQuery \{#bigquery\}

服务账号必须具有以下 BigQuery 角色：

* [`roles/bigquery.dataViewer`](https://docs.cloud.google.com/bigquery/docs/access-control#bigquery.dataViewer)
* [`roles/bigquery.jobUser`](https://docs.cloud.google.com/bigquery/docs/access-control#bigquery.jobUser)

为了进一步限定访问范围，建议使用 [IAM conditions](https://docs.cloud.google.com/bigquery/docs/conditions) 来限制该角色可以访问的资源。例如，可以将 `dataViewer` 角色限制为仅能访问包含需要同步的表的特定数据集：

```bash
resource.name.startsWith("projects/<PROJECT_ID>/datasets/<DATASET_NAME>")
```


#### Cloud Storage \{#cloud-storage\}

该服务账号必须具备以下 Cloud Storage 角色：

* [`roles/storage.objectAdmin`](https://docs.cloud.google.com/storage/docs/access-control/iam-roles#storage.objectAdmin)
* [`roles/storage.bucketViewer`](https://docs.cloud.google.com/storage/docs/access-control/iam-roles#storage.bucketViewer)

为了进一步收窄访问范围，建议使用 [IAM conditions](https://docs.cloud.google.com/bigquery/docs/conditions) 来限定角色可访问的资源。例如，可以将 `objectAdmin` 和 `bucketViewer` 角色限定为仅能访问为 ClickPipes 同步创建的专用 bucket。

```bash
resource.name.startsWith("projects/_/buckets/<BUCKET_NAME>")
```

---
sidebar_label: '使用 BACKUP 和 RESTORE'
slug: /cloud/migration/oss-to-cloud-backup-restore
title: '使用 BACKUP/RESTORE 在自管理 ClickHouse 与 ClickHouse Cloud 之间迁移'
description: '本页介绍如何使用 BACKUP 和 RESTORE 命令在自管理 ClickHouse 与 ClickHouse Cloud 之间进行迁移'
doc_type: 'guide'
keywords: ['迁移', 'ClickHouse Cloud', 'OSS', '自管理迁移到 Cloud', 'BACKUP', 'RESTORE']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Image from '@theme/IdealImage';
import create_service from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/create_service.png';
import service_details from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/service_details.png';
import open_console from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/open_console.png';
import service_role_id from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/service_role_id.png';
import create_new_role from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/create_new_role.png';
import backup_s3_bucket from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/backup_in_s3_bucket.png';


# 使用备份命令将自管理 ClickHouse 迁移到 ClickHouse Cloud {#migrating-from-self-managed-clickhouse-to-clickhouse-cloud-using-backup-commands}

## 概述 {#overview-migration-approaches}

将数据从自管理 ClickHouse（OSS）迁移到 ClickHouse Cloud 主要有两种方法：

- 使用 [`remoteSecure()`](/cloud/migration/clickhouse-to-cloud) 函数，直接拉取/推送数据。
- 通过云对象存储使用 `BACKUP`/`RESTORE` 命令。

>本迁移指南重点介绍 `BACKUP`/`RESTORE` 方法，并提供一个通过 S3 bucket 将开源 ClickHouse 中的数据库或完整服务迁移到 Cloud 的实用示例。

**先决条件**

- 已安装 Docker
- 已有一个 [S3 bucket 和 IAM 用户](/integrations/s3/creating-iam-user-and-s3-bucket)
- 能够创建一个新的 ClickHouse Cloud 服务

为便于读者跟随并复现本指南中的步骤，我们将使用一个 Docker Compose 配置，
搭建一个包含两个分片、每个分片有两个副本的 ClickHouse 集群。

:::note[需要集群]
这种备份方法要求使用 ClickHouse 集群，因为必须将表从 `MergeTree` 引擎转换为 `ReplicatedMergeTree`。
如果你只运行单个实例，请改为按照["在自管理 ClickHouse 与 ClickHouse Cloud 之间使用 remoteSecure 进行迁移"](/cloud/migration/clickhouse-to-cloud)中的步骤操作。
:::

## OSS 准备工作 {#oss-setup}

我们首先会使用示例仓库中的一个 Docker Compose 配置来启动一个 ClickHouse 集群。
如果你已经有一个正在运行的 ClickHouse 集群，可以跳过这一步。

1. 将 [examples 仓库](https://github.com/ClickHouse/examples) 克隆到本地环境。
2. 在终端中 `cd` 到 `examples/docker-compose-recipes/recipes/cluster_2S_2R`。
3. 确保 Docker 已在运行，然后启动 ClickHouse 集群：

```bash
docker compose up
```

你应该会看到：

```bash
[+] Running 7/7
 ✔ Container clickhouse-keeper-01  Created  0.1s
 ✔ Container clickhouse-keeper-02  Created  0.1s
 ✔ Container clickhouse-keeper-03  Created  0.1s
 ✔ Container clickhouse-01         Created  0.1s
 ✔ Container clickhouse-02         Created  0.1s
 ✔ Container clickhouse-04         Created  0.1s
 ✔ Container clickhouse-03         Created  0.1s
```

在该文件夹的根目录中打开一个新的终端窗口，并运行以下命令连接到集群的第一个节点：

```bash
docker exec -it clickhouse-01 clickhouse-client
```


### 创建示例数据 {#create-sample-data}

ClickHouse Cloud 使用 [`SharedMergeTree`](/cloud/reference/shared-merge-tree)。
在恢复备份时，ClickHouse 会自动将使用 `ReplicatedMergeTree` 的表转换为 `SharedMergeTree` 表。

如果您正在运行一个集群，您的表很可能已经在使用 `ReplciatedMergeTree` 引擎。
如果没有，则需要在备份之前将所有 `MergeTree` 表转换为 `ReplicatedMergeTree`。

为了演示如何将 `MergeTree` 表转换为 `ReplicatedMergeTree`，我们将从一个 `MergeTree` 表开始，并在稍后将其转换为 `ReplicatedMergeTree`。
我们将按照 [New York taxi data guide](/getting-started/example-datasets/nyc-taxi) 的前两步来创建一个示例表并向其中加载数据。
为方便起见，这些步骤在下方再次列出。

运行以下命令以创建一个新数据库，并从 S3 存储桶中向一个新表插入数据：

```sql
CREATE DATABASE nyc_taxi;

CREATE TABLE nyc_taxi.trips_small (
    trip_id             UInt32,
    pickup_datetime     DateTime,
    dropoff_datetime    DateTime,
    pickup_longitude    Nullable(Float64),
    pickup_latitude     Nullable(Float64),
    dropoff_longitude   Nullable(Float64),
    dropoff_latitude    Nullable(Float64),
    passenger_count     UInt8,
    trip_distance       Float32,
    fare_amount         Float32,
    extra               Float32,
    tip_amount          Float32,
    tolls_amount        Float32,
    total_amount        Float32,
    payment_type        Enum('CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4, 'UNK' = 5),
    pickup_ntaname      LowCardinality(String),
    dropoff_ntaname     LowCardinality(String)
)
ENGINE = MergeTree
PRIMARY KEY (pickup_datetime, dropoff_datetime);
```

```sql
INSERT INTO nyc_taxi.trips_small
SELECT
    trip_id,
    pickup_datetime,
    dropoff_datetime,
    pickup_longitude,
    pickup_latitude,
    dropoff_longitude,
    dropoff_latitude,
    passenger_count,
    trip_distance,
    fare_amount,
    extra,
    tip_amount,
    tolls_amount,
    total_amount,
    payment_type,
    pickup_ntaname,
    dropoff_ntaname
FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{0..2}.gz',
    'TabSeparatedWithNames'
);
```

运行以下命令将该表 `DETACH`。

```sql
DETACH TABLE nyc_taxi.trips_small;
```

然后将其附加为副本：

```sql
ATTACH TABLE nyc_taxi.trips_small AS REPLICATED;
```

最后，恢复副本元数据：

```sql
SYSTEM RESTORE REPLICA nyc_taxi.trips_small;
```

检查是否已转换为 `ReplicatedMergeTree`：

```sql
SELECT engine
FROM system.tables
WHERE name = 'trips_small' AND database = 'nyc_taxi';

┌─engine──────────────┐
│ ReplicatedMergeTree │
└─────────────────────┘
```

现在，您已经可以继续配置 Cloud 服务，为稍后从 S3 存储桶中恢复备份做准备。


## Cloud 准备工作 {#cloud-setup}

你将把数据恢复到一个新的 Cloud 服务中。
按照以下步骤创建一个新的 Cloud 服务。

<VerticalStepper headerLevel="h4">

#### 打开 Cloud 控制台 {#open-cloud-console}

访问 [https://console.clickhouse.cloud/](https://console.clickhouse.cloud/)

#### 创建一个新服务 {#create-new-service}

<Image img={create_service} size="md" alt="创建一个新服务"/> 

#### 配置并创建服务 {#configure-and-create}

选择目标区域和配置，然后点击 `Create service`。

<Image img={service_details} size="md" alt="配置服务参数"/> 

#### 创建访问角色 {#create-an-access-role}

打开 SQL 控制台。

<Image img={open_console} size="md" alt="打开 SQL 控制台"/>

### 设置 S3 访问 {#set-up-s3-access}

要从 S3 恢复备份，需要在 ClickHouse Cloud 与 S3 bucket 之间配置安全访问。

1. 按照 ["安全访问 S3 数据"](/cloud/data-sources/secure-s3) 中的步骤创建访问角色并获取该角色的 ARN。

2. 在 ["如何创建 S3 bucket 和 IAM 角色"](/integrations/s3/creating-iam-user-and-s3-bucket) 中创建的 S3 bucket 策略基础上，添加上一步获得的角色 ARN。

更新后的 S3 bucket 策略类似如下：

```json
{
    "Version": "2012-10-17",
    "Id": "Policy123456",
    "Statement": [
        {
            "Sid": "abc123",
            "Effect": "Allow",
            "Principal": {
                "AWS": [
#highlight-start                  
                    "arn:aws:iam::123456789123:role/ClickHouseAccess-001",
                    "arn:aws:iam::123456789123:user/docs-s3-user"
#highlight-end                            
                ]
            },
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::ch-docs-s3-bucket",
                "arn:aws:s3:::ch-docs-s3-bucket/*"
            ]
        }
    ]
}
```

该策略包含两个 ARN：
- **IAM user** (`docs-s3-user`)：允许自管理 ClickHouse 集群将数据备份到 S3
- **ClickHouse Cloud role** (`ClickHouseAccess-001`)：允许 Cloud 服务从 S3 恢复数据

</VerticalStepper>

## 执行备份（在自管理部署中） {#taking-a-backup-on-oss}

要对单个数据库进行备份，请在连接到 OSS 部署的 clickhouse-client 中运行以下命令：

```sql
BACKUP DATABASE nyc_taxi
TO S3(
  'BUCKET_URL',
  'KEY_ID',
  'SECRET_KEY'
)
```

将 `BUCKET_URL`、`KEY_ID` 和 `SECRET_KEY` 替换为您自己的 AWS 凭证。
指南 [&quot;How to create an S3 bucket and IAM role&quot;](/integrations/s3/creating-iam-user-and-s3-bucket)
介绍了在您尚未拥有这些凭证时如何获取它们。

如果一切配置正确，您会看到类似下面的响应，
其中包含分配给该备份的唯一 ID 以及备份的状态。

```response
Query id: efcaf053-75ed-4924-aeb1-525547ea8d45

┌─id───────────────────────────────────┬─status─────────┐
│ e73b99ab-f2a9-443a-80b4-533efe2d40b3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

如果你检查之前空的 S3 存储桶，现在会看到其中已经出现了一些文件夹：

<Image img={backup_s3_bucket} size="md" alt="backup, data and metadata" />

如果你正在执行完整迁移，则可以运行以下命令来备份整个服务器：

```sql
BACKUP
TABLE system.users,
TABLE system.roles,
TABLE system.settings_profiles,
TABLE system.row_policies,
TABLE system.quotas,
TABLE system.functions,
ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
TO S3(
  'BUCKET_ID',
  'KEY_ID',
  'SECRET_ID'
)
SETTINGS
  compression_method='lzma',
  compression_level=3;
```

上述命令备份的内容包括：

* 所有用户数据库和表
* 用户账户和密码
* 角色和权限
* 设置配置文件
* 行级策略
* 配额
* 用户定义函数

如果你使用的是其他云服务提供商（CSP），可以使用 `TO S3()`（适用于 AWS 和 GCP）以及 `TO AzureBlobStorage()` 语法。

对于非常大的数据库，建议使用 `ASYNC` 在后台执行备份：

```sql
BACKUP DATABASE my_database 
TO S3('https://your-bucket.s3.amazonaws.com/backup.zip', 'key', 'secret')
ASYNC;
       
-- Returns immediately with backup ID
-- Example result:
-- ┌─id──────────────────────────────────┬─status────────────┐
-- │ abc123-def456-789                   │ CREATING_BACKUP   │
-- └─────────────────────────────────────┴───────────────────┘
```

之后即可使用该备份 ID 来监控备份进度：

```sql
SELECT * 
FROM system.backups 
WHERE id = 'abc123-def456-789'
```

还可以执行增量备份。
有关备份的一般信息，请参阅[备份与恢复](/operations/backup)文档。


## 恢复到 ClickHouse Cloud {#restore-to-clickhouse-cloud}

要恢复单个数据库，请在你的 Cloud 服务中运行以下查询，将其中的 AWS 凭证替换为你的实际值，
并将 `ROLE_ARN` 设置为你在[“安全访问 S3 数据”](/cloud/data-sources/secure-s3)中按照步骤获取的输出值。

```sql
RESTORE DATABASE nyc_taxi
FROM S3(
    'BUCKET_URL',
    extra_credentials(role_arn = 'ROLE_ARN')
)
```

同样可以通过类似方式执行完整服务还原：

```sql
RESTORE
    TABLE system.users,
    TABLE system.roles,
    TABLE system.settings_profiles,
    TABLE system.row_policies,
    TABLE system.quotas,
    ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
FROM S3(
    'BUCKET_URL',
    extra_credentials(role_arn = 'ROLE_ARN')
)
```

现在在 Cloud 中运行以下查询，即可看到该数据库和表已经成功恢复到 Cloud：

```sql
SELECT count(*) FROM nyc_taxi.trips_small;
3000317
```

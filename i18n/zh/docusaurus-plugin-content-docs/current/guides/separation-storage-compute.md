---
sidebar_position: 1
sidebar_label: '存储与计算分离'
slug: /guides/separation-storage-compute
title: '存储与计算分离'
description: '本指南介绍如何使用 ClickHouse 与 S3 构建存储与计算分离的架构。'
doc_type: 'guide'
keywords: ['storage', 'compute', 'architecture', 'scalability', 'cloud']
---

import Image from '@theme/IdealImage';
import BucketDetails from '@site/docs/_snippets/_S3_authentication_and_bucket.md';
import s3_bucket_example from '@site/static/images/guides/s3_bucket_example.png';


# 存储与计算分离



## 概述 {#overview}

本指南介绍如何使用 ClickHouse 和 S3 实现存储与计算分离的架构。

存储与计算分离是指计算资源和存储资源独立管理。在 ClickHouse 中,这种架构可以提供更好的可扩展性、成本效益和灵活性。您可以根据需要分别扩展存储和计算资源,从而优化性能和成本。

使用 S3 作为后端存储的 ClickHouse 特别适用于对"冷"数据查询性能要求不高的场景。ClickHouse 支持通过 `S3BackedMergeTree` 将 S3 用作 `MergeTree` 引擎的存储。该表引擎使用户能够利用 S3 的可扩展性和成本优势,同时保持 `MergeTree` 引擎的插入和查询性能。

请注意,与标准 ClickHouse 部署相比,实施和管理存储与计算分离架构更为复杂。虽然自管理的 ClickHouse 支持按照本指南所述实现存储与计算分离,但我们建议使用 [ClickHouse Cloud](https://clickhouse.com/cloud),它通过 [`SharedMergeTree` 表引擎](/cloud/reference/shared-merge-tree)提供开箱即用的存储与计算分离架构,无需额外配置。

_本指南假设您使用的是 ClickHouse 22.8 或更高版本。_

:::warning
请勿配置任何 AWS/GCS 生命周期策略。这不受支持,可能导致表损坏。
:::


## 1. 将 S3 用作 ClickHouse 磁盘 {#1-use-s3-as-a-clickhouse-disk}

### 创建磁盘 {#creating-a-disk}

在 ClickHouse 的 `config.d` 目录中创建一个新文件以存储存储配置:

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

将以下 XML 内容复制到新创建的文件中,并将 `BUCKET`、`ACCESS_KEY_ID`、`SECRET_ACCESS_KEY` 替换为您要存储数据的 AWS 存储桶详细信息:

```xml
<clickhouse>
  <storage_configuration>
    <disks>
      <s3_disk>
        <type>s3</type>
        <endpoint>$BUCKET</endpoint>
        <access_key_id>$ACCESS_KEY_ID</access_key_id>
        <secret_access_key>$SECRET_ACCESS_KEY</secret_access_key>
        <metadata_path>/var/lib/clickhouse/disks/s3_disk/</metadata_path>
      </s3_disk>
      <s3_cache>
        <type>cache</type>
        <disk>s3_disk</disk>
        <path>/var/lib/clickhouse/disks/s3_cache/</path>
        <max_size>10Gi</max_size>
      </s3_cache>
    </disks>
    <policies>
      <s3_main>
        <volumes>
          <main>
            <disk>s3_disk</disk>
          </main>
        </volumes>
      </s3_main>
    </policies>
  </storage_configuration>
</clickhouse>
```

如果需要进一步指定 S3 磁盘的设置,例如指定 `region` 或发送自定义 HTTP `header`,可以在[此处](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)找到相关设置列表。

您也可以将 `access_key_id` 和 `secret_access_key` 替换为以下内容,系统将尝试从环境变量和 Amazon EC2 元数据中获取凭证:

```bash
<use_environment_credentials>true</use_environment_credentials>
```

创建配置文件后,需要将文件的所有者更新为 clickhouse 用户和组:

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

现在可以重启 ClickHouse 服务器以使更改生效:

```bash
service clickhouse-server restart
```


## 2. 创建基于 S3 的表 {#2-create-a-table-backed-by-s3}

为了测试 S3 磁盘是否配置正确,我们可以尝试创建并查询一个表。

创建表时指定新的 S3 存储策略:

```sql
CREATE TABLE my_s3_table
  (
    `id` UInt64,
    `column1` String
  )
ENGINE = MergeTree
ORDER BY id
SETTINGS storage_policy = 's3_main';
```

请注意,我们无需将引擎指定为 `S3BackedMergeTree`。当 ClickHouse 检测到表使用 S3 作为存储时,会自动在内部转换引擎类型。

查看表是否使用正确的策略创建:

```sql
SHOW CREATE TABLE my_s3_table;
```

您应该看到以下结果:

```response
┌─statement────────────────────────────────────────────────────
│ CREATE TABLE default.my_s3_table
(
  `id` UInt64,
  `column1` String
)
ENGINE = MergeTree
ORDER BY id
SETTINGS storage_policy = 's3_main', index_granularity = 8192
└──────────────────────────────────────────────────────────────
```

现在让我们向新表中插入一些数据:

```sql
INSERT INTO my_s3_table (id, column1)
  VALUES (1, 'abc'), (2, 'xyz');
```

验证数据是否已成功插入:

```sql
SELECT * FROM my_s3_table;
```

```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ xyz     │
└────┴─────────┘

2 rows in set. Elapsed: 0.284 sec.
```

在 AWS 控制台中,如果数据已成功插入到 S3,您应该会看到 ClickHouse 已在指定的存储桶中创建了新文件。

如果一切正常运行,您现在已经在使用存储与计算分离的 ClickHouse 了!

<Image
  img={s3_bucket_example}
  size='md'
  alt='使用存储与计算分离的 S3 存储桶示例'
  border
/>


## 3. 实现容错复制(可选) {#3-implementing-replication-for-fault-tolerance-optional}

:::warning
请勿配置任何 AWS/GCS 生命周期策略。此功能不受支持,可能导致表损坏。
:::

为实现容错,您可以使用分布在多个 AWS 区域的多个 ClickHouse 服务器节点,每个节点对应一个 S3 存储桶。

使用 S3 磁盘的复制可通过 `ReplicatedMergeTree` 表引擎实现。详细信息请参阅以下指南:

- [使用 S3 对象存储跨两个 AWS 区域复制单个分片](/integrations/s3#s3-multi-region)。


## 延伸阅读 {#further-reading}

- [SharedMergeTree 表引擎](/cloud/reference/shared-merge-tree)
- [SharedMergeTree 发布公告博客](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)

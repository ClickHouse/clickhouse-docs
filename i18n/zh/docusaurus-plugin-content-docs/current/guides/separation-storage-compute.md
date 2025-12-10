---
sidebar_position: 1
sidebar_label: '存储与计算分离'
slug: /guides/separation-storage-compute
title: '存储与计算分离'
description: '本指南将介绍如何使用 ClickHouse 和 S3 构建存储与计算分离的架构。'
doc_type: 'guide'
keywords: ['存储', '计算', '架构', '可扩展性', '云']
---

import Image from '@theme/IdealImage';
import BucketDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import s3_bucket_example from '@site/static/images/guides/s3_bucket_example.png';

# 存储与计算分离 {#separation-of-storage-and-compute}

## 概览 {#overview}

本指南介绍如何使用 ClickHouse 和 S3 实现存储与计算分离的架构。

存储与计算分离意味着计算资源和存储资源可以独立管理。在 ClickHouse 中，这种方式可以带来更好的可扩展性、成本效率和灵活性。可以根据需要分别扩展存储和计算资源，从而优化性能和成本。

在对“冷”数据的查询性能要求不高的场景中，使用以 S3 作为后端存储的 ClickHouse 部署尤其有用。ClickHouse 支持通过 `S3BackedMergeTree` 使用 S3 作为 `MergeTree` 引擎的存储。该表引擎使用户能够在保持 `MergeTree` 引擎插入和查询性能的同时，充分利用 S3 的可扩展性和成本优势。

请注意，与标准的 ClickHouse 部署相比，实现和运维存储与计算分离架构更加复杂。虽然自行管理的 ClickHouse 按照本指南所述支持存储与计算分离，但我们推荐使用 [ClickHouse Cloud](https://clickhouse.com/cloud)。它允许您在无需额外配置的情况下，通过使用 [`SharedMergeTree` 表引擎](/cloud/reference/shared-merge-tree)，以这种架构来使用 ClickHouse。

*本指南假设你使用的是 ClickHouse 22.8 或更高版本。*

:::warning
不要配置任何 AWS/GCS 生命周期策略。当前不支持此操作，并且可能会导致表损坏。
:::

## 1. 将 S3 用作 ClickHouse 磁盘 {#1-use-s3-as-a-clickhouse-disk}

### 创建磁盘 {#creating-a-disk}

在 ClickHouse 的 `config.d` 目录中创建一个新文件，用于保存存储配置：

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

将以下 XML 复制到新创建的文件中，并将 `BUCKET`、`ACCESS_KEY_ID`、`SECRET_ACCESS_KEY` 替换为您希望用于存储数据的 AWS 存储桶相关信息：

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

如果你需要对 S3 磁盘的设置进行更细致的配置，例如指定 `region` 或发送自定义 HTTP `header`，可以在[此处](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)找到相关配置项列表。

你也可以将 `access_key_id` 和 `secret_access_key` 替换为下方的配置，这将尝试从环境变量和 Amazon EC2 元数据中获取凭证：

```bash
<use_environment_credentials>true</use_environment_credentials>
```

创建完配置文件后，需要将该文件的属主和属组更新为 clickhouse 用户和组：

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

现在可以重启 ClickHouse 服务器，使更改生效：

```bash
service clickhouse-server restart
```

## 2. 创建一个基于 S3 的表 {#2-create-a-table-backed-by-s3}

为了验证我们是否已正确配置 S3 磁盘，可以尝试创建并查询一张表。

创建一个表，并指定新的 S3 存储策略：

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

请注意，我们无需将引擎显式指定为 `S3BackedMergeTree`。如果 ClickHouse 检测到该表使用 S3 作为存储，它会在内部自动转换引擎类型。

验证该表确实是使用正确的策略创建的：

```sql
SHOW CREATE TABLE my_s3_table;
```

您应该会看到如下结果：

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

现在向新表中插入几行数据：

```sql
INSERT INTO my_s3_table (id, column1)
  VALUES (1, 'abc'), (2, 'xyz');
```

让我们来确认一下这些行是否已经插入：

```sql
SELECT * FROM my_s3_table;
```

```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ xyz     │
└────┴─────────┘

返回 2 行。耗时: 0.284 秒。
```

在 AWS 控制台中，如果数据已经成功写入 S3，你应该能看到 ClickHouse 已在你指定的 S3 存储桶中创建了新的文件。

如果一切正常，你现在已经在使用实现存储与计算分离的 ClickHouse 了！

<Image img={s3_bucket_example} size="md" alt="使用存储与计算分离的 S3 存储桶示例" border />

## 3. 为容错实现复制（可选） {#3-implementing-replication-for-fault-tolerance-optional}

:::warning
不要配置任何 AWS/GCS 生命周期策略。这种配置不受支持，可能导致表损坏。
:::

为了实现容错，您可以使用多个 ClickHouse 服务器节点，并将它们分布在多个 AWS 区域中，每个节点使用一个独立的 S3 存储桶。

使用基于 S3 的磁盘进行复制可以通过 `ReplicatedMergeTree` 表引擎来实现。有关详细信息，请参阅以下指南：
- [使用 S3 对象存储在两个 AWS 区域间复制单个分片](/integrations/s3#s3-multi-region)。

## 延伸阅读 {#further-reading}

- [SharedMergeTree 表引擎](/cloud/reference/shared-merge-tree)
- [SharedMergeTree 公告博文](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)

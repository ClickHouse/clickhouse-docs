---
'sidebar_position': 1
'sidebar_label': '存储与计算的分离'
'slug': '/guides/separation-storage-compute'
'title': '存储与计算的分离'
'description': '本指南探讨如何使用 ClickHouse 和 S3 实现分离存储与计算的架构。'
---

import Image from '@theme/IdealImage';
import BucketDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import s3_bucket_example from '@site/static/images/guides/s3_bucket_example.png';


# 存储与计算的分离

## 概述 {#overview}

本指南探讨如何使用 ClickHouse 和 S3 实现存储与计算分离的架构。

存储与计算的分离意味着计算资源和存储资源是独立管理的。在 ClickHouse 中，这可以实现更好的可扩展性、成本效益和灵活性。您可以根据需要独立扩展存储和计算资源，从而优化性能和成本。

使用 ClickHouse 和 S3 非常适合那些对“冷”数据的查询性能要求不高的用例。ClickHouse 支持使用 S3 作为 `MergeTree` 引擎的存储，通过 `S3BackedMergeTree`。这个表引擎使用户能够在保持 `MergeTree` 引擎的插入和查询性能的同时，利用 S3 的可扩展性和成本优势。

请注意，实现和管理存储与计算分离的架构比标准的 ClickHouse 部署要复杂得多。虽然自管理的 ClickHouse 允许如本指南所述的存储和计算分离，我们建议您使用 [ClickHouse Cloud](https://clickhouse.com/cloud)，它允许您在此架构中使用 ClickHouse，而无需进行配置，使用 [`SharedMergeTree` 表引擎](/cloud/reference/shared-merge-tree)。

*本指南假设您使用的是 ClickHouse 版本 22.8 或更高版本。*

:::warning
请勿配置任何 AWS/GCS 生命周期策略。这不受支持，可能导致表损坏。
:::

## 1. 将 S3 用作 ClickHouse 磁盘 {#1-use-s3-as-a-clickhouse-disk}

### 创建磁盘 {#creating-a-disk}

在 ClickHouse 的 `config.d` 目录中创建一个新文件，以存储存储配置：

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

将以下 XML 复制到新创建的文件中，将 `BUCKET`、`ACCESS_KEY_ID`、`SECRET_ACCESS_KEY` 替换为您希望存储数据的 AWS 存储桶详细信息：

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

如果您需要进一步指定 S3 磁盘的设置，例如指定 `region` 或发送自定义 HTTP `header`，您可以在 [这里](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) 找到相关设置的列表。

您还可以将 `access_key_id` 和 `secret_access_key` 替换为以下内容，这将尝试从环境变量和 Amazon EC2 元数据中获取凭证：

```bash
<use_environment_credentials>true</use_environment_credentials>
```

创建配置文件后，您需要将文件的所有者更新为 clickhouse 用户和组：

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

现在您可以重启 ClickHouse 服务器以使更改生效：

```bash
service clickhouse-server restart
```

## 2. 创建由 S3 支持的表 {#2-create-a-table-backed-by-s3}

为了测试我们是否正确配置了 S3 磁盘，我们可以尝试创建并查询一个表。

创建一个指定新的 S3 存储策略的表：

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

请注意，我们不需要将引擎指定为 `S3BackedMergeTree`。如果 ClickHouse 检测到表使用 S3 进行存储，它会自动在内部转换引擎类型。

显示表已使用正确策略创建：

```sql
SHOW CREATE TABLE my_s3_table;
```

您应该看到以下结果：

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

现在让我们向新表中插入一些行：

```sql
INSERT INTO my_s3_table (id, column1)
  VALUES (1, 'abc'), (2, 'xyz');
```

让我们验证我们的行已插入：

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

在 AWS 控制台中，如果您的数据已成功插入 S3，您应该会看到 ClickHouse 在您指定的存储桶中创建了新文件。

如果一切顺利，您现在正在使用存储与计算分离的 ClickHouse！

<Image img={s3_bucket_example} size="md" alt="使用存储与计算分离的 S3 存储桶示例" border/>

## 3. 实现故障容错的复制（可选） {#3-implementing-replication-for-fault-tolerance-optional}

:::warning
请勿配置任何 AWS/GCS 生命周期策略。这不受支持，可能导致表损坏。
:::

为了实现故障容错，您可以使用多个分布在多个 AWS 区域的 ClickHouse 服务器节点，每个节点都有一个 S3 存储桶。

使用 S3 磁盘的复制可以通过使用 `ReplicatedMergeTree` 表引擎来实现。有关详细信息，请参阅以下指南：
- [在两个 AWS 区域之间复制单个分片，使用 S3 对象存储](/integrations/s3#s3-multi-region)。

## 进一步阅读 {#further-reading}

- [SharedMergeTree 表引擎](/cloud/reference/shared-merge-tree)
- [SharedMergeTree 公告博客](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)

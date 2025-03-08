---
sidebar_position: 1
sidebar_label: 存储与计算的分离
slug: /guides/separation-storage-compute
---
import BucketDetails from '@site/docs/_snippets/_S3_authentication_and_bucket.md';
import s3_bucket_example from '@site/static/images/guides/s3_bucket_example.png';


# 存储与计算的分离

## 概述 {#overview}

本指南探讨如何使用 ClickHouse 和 S3 实现存储与计算分离的架构。

存储与计算的分离意味着计算资源和存储资源能够独立管理。在 ClickHouse 中，这使得扩展性、成本效率和灵活性得到了提升。您可以根据需要单独扩展存储和计算资源，从而优化性能和成本。

使用 ClickHouse 并依赖 S3 对于查询性能在“冷”数据上的要求不高的用例尤其有用。ClickHouse 执行支持使用 S3 作为 `MergeTree` 引擎的存储，使用 `S3BackedMergeTree`。此表引擎使用户能够利用 S3 的可扩展性和成本优势，同时保持 `MergeTree` 引擎的插入和查询性能。

请注意，与标准的 ClickHouse 部署相比，实现和管理存储与计算分离架构要复杂得多。虽然自管理的 ClickHouse 如本指南所述允许存储和计算分离，但我们建议使用 [ClickHouse Cloud](https://clickhouse.com/cloud)，它允许您在此架构中使用 ClickHouse，无需配置，使用 [`SharedMergeTree` 表引擎](/cloud/reference/shared-merge-tree)。

*本指南假设您使用的是 ClickHouse 版本 22.8 或更高版本。*

:::warning
请勿配置任何 AWS/GCS 生命周期策略。这是未支持的，可能导致表损坏。
:::

## 1. 使用 S3 作为 ClickHouse 磁盘 {#1-use-s3-as-a-clickhouse-disk}

### 创建磁盘 {#creating-a-disk}

在 ClickHouse `config.d` 目录中创建一个新文件以存储存储配置：

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

将以下 XML 复制到新创建的文件中，将 `BUCKET`、`ACCESS_KEY_ID`、`SECRET_ACCESS_KEY` 替换为您希望存储数据的 AWS 存储桶的详细信息：

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

如果需要进一步指定 S3 磁盘的设置，例如指定 `region` 或发送自定义的 HTTP `header`，可以在 [这里](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) 找到相关设置的列表。

您还可以用以下内容替换 `access_key_id` 和 `secret_access_key`，这样会尝试从环境变量和 Amazon EC2 元数据中获取凭证：

```bash
<use_environment_credentials>true</use_environment_credentials>
```

创建配置文件后，您需要将文件的所有者更新为 clickhouse 用户和组：

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

现在您可以重启 ClickHouse 服务器，以使更改生效：

```bash
service clickhouse-server restart
```

## 2. 创建一个由 S3 支持的表 {#2-create-a-table-backed-by-s3}

为测试我们是否正确配置了 S3 磁盘，我们可以尝试创建并查询一个表。

创建一个表并指定新的 S3 存储策略：

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

注意，我们不需要将引擎指定为 `S3BackedMergeTree`。如果 ClickHouse 检测到表使用 S3 作为存储，它会自动在内部转换引擎类型。

展示表是否使用了正确的策略：

```sql
SHOW CREATE TABLE my_s3_table;
```

您应该可以看到以下结果：

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

让我们验证一下行是否已插入：

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

在 AWS 控制台中，如果您的数据已成功插入到 S3，您应该会看到 ClickHouse 在您指定的存储桶中创建了新文件。

如果一切正常，您现在正在使用 ClickHouse 实现存储与计算的分离！

<img src={s3_bucket_example}
    alt="使用存储与计算分离的 S3 存储桶示例"
    class="image"
/>

## 3. 实现容错的复制机制（可选） {#3-implementing-replication-for-fault-tolerance-optional}

:::warning
请勿配置任何 AWS/GCS 生命周期策略。这是未支持的，可能导致表损坏。
:::

为实现容错，您可以使用分布在多个 AWS 区域的多个 ClickHouse 服务器节点，并为每个节点配置一个 S3 存储桶。

使用 S3 磁盘进行复制可以通过使用 `ReplicatedMergeTree` 表引擎完成。有关详细信息，请参见以下指南：
- [使用 S3 对象存储在两个 AWS 区域跨单个分片进行复制](/integrations/s3#s3-multi-region)。

## 进一步阅读 {#further-reading}

- [SharedMergeTree 表引擎](/cloud/reference/shared-merge-tree)
- [SharedMergeTree 公告博客](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)

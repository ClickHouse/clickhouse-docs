---
description: '包含有关存储在远程磁盘（如 S3 或 Azure Blob 存储）上的数据 File 信息的系统表。'
keywords: ['系统表', 'remote_data_paths']
slug: /operations/system-tables/remote_data_paths
title: 'system.remote_data_paths'
doc_type: 'reference'
---

包含有关存储在远程磁盘 (例如 S3、Azure Blob 存储) 上的数据 File 的信息，包括本地元数据路径与远程 blob 路径之间的映射关系。

每行表示一个与数据 File 关联的远程 blob 对象。

列：

* `disk_name` ([String](../../sql-reference/data-types/string.md)) — 存储配置中定义的远程磁盘名称。
* `path` ([String](../../sql-reference/data-types/string.md)) — 存储配置中所配置的远程磁盘根路径。
* `cache_base_path` ([String](../../sql-reference/data-types/string.md)) — 与远程磁盘关联的缓存 File 的基础目录。
* `local_path` ([String](../../sql-reference/data-types/string.md)) — 相对于 ClickHouse 数据目录的本地元数据 File 路径，指向映射到远程 blob 的 File。
* `remote_path` ([String](../../sql-reference/data-types/string.md)) — 本地元数据 File 所映射到的远程对象存储中的 blob 路径。
* `size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — File 的压缩后大小 (以字节为单位) 。
* `common_prefix_for_blobs` ([String](../../sql-reference/data-types/string.md)) — 远程对象存储中 blob 的公共前缀，适用于多个 blob 共享同一路径前缀的情况。
* `cache_paths` ([Array(String)](../../sql-reference/data-types/array.md)) — 与远程 blob 对应的本地缓存 File 路径。

**设置**

* [`traverse_shadow_remote_data_paths`](../../operations/settings/settings.md#traverse_shadow_remote_data_paths) — 启用后，该表还会包含来自冻结分区的数据 (即 `ALTER TABLE ... FREEZE` 使用的 `shadow/` 目录) 。默认禁用。

**示例**

```sql
SELECT * FROM system.remote_data_paths LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
disk_name:              s3
path:                   /var/lib/clickhouse/disks/s3/
cache_base_path:        /var/lib/clickhouse/disks/s3_cache/
local_path:             store/123/1234abcd-1234-1234-1234-1234abcd1234/all_0_0_0/data.bin
remote_path:            abc123/all_0_0_0/data.bin
size:                   1048576
common_prefix_for_blobs:
cache_paths:            ['/var/lib/clickhouse/disks/s3_cache/a1/b2/c3d4e5f6']
```

**另请参阅**

* [使用外部存储来存储数据](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-s3)
* [配置外部存储](/operations/storing-data.md/#configuring-external-storage)
* [system.disks](../../operations/system-tables/disks.md)

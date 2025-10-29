---
'description': '在执行查询时，ClickHouse 使用不同的缓存。'
'sidebar_label': '缓存'
'sidebar_position': 65
'slug': '/operations/caches'
'title': '缓存类型'
'keywords':
- 'cache'
'doc_type': 'reference'
---


# 缓存类型

在执行查询时，ClickHouse 使用不同的缓存来加速查询并减少对磁盘的读写需求。

主要的缓存类型有：

- `mark_cache` — [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md) 家族的表引擎使用的 [marks](/development/architecture#merge-tree) 缓存。
- `uncompressed_cache` — [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md) 家族的表引擎使用的未压缩数据缓存。
- 操作系统页面缓存（间接使用，用于实际数据文件）。

还有一系列其他缓存类型：

- DNS 缓存。
- [Regexp](../interfaces/formats.md#data-format-regexp) 缓存。
- 编译表达式缓存。
- [Vector similarity index](../engines/table-engines/mergetree-family/annindexes.md) 缓存。
- [Avro format](../interfaces/formats.md#data-format-avro) 模式缓存。
- [Dictionaries](../sql-reference/dictionaries/index.md) 数据缓存。
- 模式推断缓存。
- [Filesystem cache](storing-data.md) 通过 S3、Azure、Local 和其他磁盘。
- [Userspace page cache](/operations/userspace-page-cache)
- [Query cache](query-cache.md)。
- [Query condition cache](query-condition-cache.md)。
- 格式模式缓存。

如果您希望出于性能调整、故障排除或数据一致性原因来删除其中一个缓存，可以使用 [`SYSTEM DROP ... CACHE`](../sql-reference/statements/system.md) 语句。

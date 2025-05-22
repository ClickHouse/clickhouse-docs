---
'description': '在执行查询时，ClickHouse 使用不同的缓存。'
'sidebar_label': '缓存'
'sidebar_position': 65
'slug': '/operations/caches'
'title': '缓存类型'
---


# 缓存类型

在执行查询时，ClickHouse 使用不同的缓存。

主要缓存类型：

- `mark_cache` — MergeTree 家族表引擎使用的标记缓存，参见 [MergeTree](../engines/table-engines/mergetree-family/mergetree.md)。
- `uncompressed_cache` — MergeTree 家族表引擎使用的未压缩数据缓存，参见 [MergeTree](../engines/table-engines/mergetree-family/mergetree.md)。
- 操作系统页面缓存（间接使用，用于具有实际数据的文件）。

附加缓存类型：

- DNS 缓存。
- [Regexp](../interfaces/formats.md#data-format-regexp) 缓存。
- 编译表达式缓存。
- [Vector Similarity Index](../engines/table-engines/mergetree-family/annindexes.md) 缓存。
- [Avro 格式](../interfaces/formats.md#data-format-avro) 模式缓存。
- [Dictionaries](../sql-reference/dictionaries/index.md) 数据缓存。
- 模式推断缓存。
- [Filesystem cache](storing-data.md) 在 S3、Azure、Local 和其他磁盘上的缓存。
- [Userspace page cache](/operations/userspace-page-cache)。
- [Query cache](query-cache.md)。
- [Query condition cache](query-condition-cache.md)。
- 格式模式缓存。

要删除其中一个缓存，请使用 [SYSTEM DROP ... CACHE](../sql-reference/statements/system.md) 语句。

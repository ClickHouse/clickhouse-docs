---
'description': '在执行查询时，ClickHouse使用不同的缓存。'
'sidebar_label': 'Caches'
'sidebar_position': 65
'slug': '/operations/caches'
'title': '缓存类型'
---


# 缓存类型

在执行查询时，ClickHouse 使用不同的缓存。

主要缓存类型：

- `mark_cache` — 用于 [MergeTree](../engines/table-engines/mergetree-family/mergetree.md) 家族的表引擎所使用的标记缓存。
- `uncompressed_cache` — 用于 [MergeTree](../engines/table-engines/mergetree-family/mergetree.md) 家族的表引擎所使用的未压缩数据缓存。
- 操作系统页面缓存（间接使用，用于实际数据的文件）。

其他缓存类型：

- DNS 缓存。
- [正则表达式](../interfaces/formats.md#data-format-regexp) 缓存。
- 编译表达式缓存。
- [向量相似度索引](../engines/table-engines/mergetree-family/annindexes.md) 缓存。
- [Avro 格式](../interfaces/formats.md#data-format-avro) 模式缓存。
- [字典](../sql-reference/dictionaries/index.md) 数据缓存。
- 模式推断缓存。
- 针对 S3、Azure、本地及其他磁盘的 [文件系统缓存](storing-data.md)。
- [用户空间页面缓存](/operations/userspace-page-cache)
- [查询缓存](query-cache.md)。
- [查询条件缓存](query-condition-cache.md)。
- 格式模式缓存。

要删除其中一个缓存，请使用 [SYSTEM DROP ... CACHE](../sql-reference/statements/system.md) 语句。

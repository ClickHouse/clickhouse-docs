---
description: '在执行查询时，ClickHouse 会使用不同的缓存。'
sidebar_label: '缓存'
sidebar_position: 65
slug: /operations/caches
title: '缓存类型'
keywords: ['cache']
doc_type: 'reference'
---

# 缓存类型

在执行查询时，ClickHouse 使用不同类型的缓存来加速查询，并减少对磁盘读写的需求。

主要的缓存类型有：

- `mark_cache` — [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md) 系列表引擎使用的[标记](/development/architecture#merge-tree)缓存。
- `uncompressed_cache` — [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md) 系列表引擎使用的未压缩数据缓存。
- 操作系统页缓存（间接使用，用于包含实际数据的文件）。

还有许多其他类型的缓存：

- DNS 缓存。
- [Regexp](/interfaces/formats/Regexp) 缓存。
- 已编译表达式缓存。
- [向量相似度索引](../engines/table-engines/mergetree-family/annindexes.md)缓存。
- [文本索引](../engines/table-engines/mergetree-family/invertedindexes.md#caching)缓存。
- [Avro 格式](/interfaces/formats/Avro)模式（schema）缓存。
- [Dictionaries](../sql-reference/dictionaries/index.md) 数据缓存。
- 模式推断缓存。
- 基于 S3、Azure、本地及其他磁盘的[文件系统缓存](storing-data.md)。
- [用户态页缓存](/operations/userspace-page-cache)。
- [查询缓存](query-cache.md)。
- [查询条件缓存](query-condition-cache.md)。
- 格式模式缓存。

如需出于性能调优、故障排查或数据一致性等原因清空某种缓存，可以使用 [`SYSTEM DROP ... CACHE`](../sql-reference/statements/system.md) 语句。
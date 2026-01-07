---
description: '在执行查询时，ClickHouse 会使用不同的缓存。'
sidebar_label: '缓存'
sidebar_position: 65
slug: /operations/caches
title: '缓存类型'
keywords: ['cache']
doc_type: 'reference'
---

# 缓存类型 {#cache-types}

在执行查询时，ClickHouse 使用不同类型的缓存来加速查询，
并减少对磁盘的读写需求。

主要的缓存类型包括：

* `mark_cache` — [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md) 系列表引擎使用的[标记](/development/architecture#merge-tree)缓存。
* `uncompressed_cache` — [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md) 系列表引擎使用的未压缩数据缓存。
* 操作系统提供的页缓存（间接使用，用于实际数据文件）。

此外，还有多种其他缓存类型：

* DNS 缓存。
* [Regexp](/interfaces/formats/Regexp) 缓存。
* 已编译表达式缓存。
* [向量相似度索引](../engines/table-engines/mergetree-family/annindexes.md)缓存。
* [文本索引](../engines/table-engines/mergetree-family/textindexes.md#caching)缓存。
* [Avro 格式](/interfaces/formats/Avro) Schema 缓存。
* [字典](../sql-reference/dictionaries/index.md)数据缓存。
* Schema 推断缓存。
* 基于 S3、Azure、本地以及其他磁盘的[文件系统缓存](storing-data.md)。
* [用户态页缓存](/operations/userspace-page-cache)。
* [查询缓存](query-cache.md)。
* [查询条件缓存](query-condition-cache.md)。
* 格式 Schema 缓存。

如果希望出于性能调优、故障排查或数据一致性等原因清除某一种缓存，
可以使用 [`SYSTEM DROP ... CACHE`](../sql-reference/statements/system.md) 语句。
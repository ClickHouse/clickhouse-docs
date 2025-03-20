---
slug: /operations/caches
sidebar_position: 65
sidebar_label: '缓存'
title: '缓存类型'
description: '在执行查询时，ClickHouse使用不同的缓存。'
---

在执行查询时，ClickHouse使用不同的缓存。

主要缓存类型：

- `mark_cache` — 用于 [MergeTree](../engines/table-engines/mergetree-family/mergetree.md) 家族表引擎的标记缓存。
- `uncompressed_cache` — 用于 [MergeTree](../engines/table-engines/mergetree-family/mergetree.md) 家族表引擎的未压缩数据缓存。
- `skipping_index_cache` — 用于 [MergeTree](../engines/table-engines/mergetree-family/mergetree.md) 家族表引擎的内存中的跳过索引粒度缓存。
- 操作系统页面缓存（间接使用，用于实际数据的文件）。

附加缓存类型：

- DNS缓存。
- [Regexp](../interfaces/formats.md#data-format-regexp) 缓存。
- 编译表达式缓存。
- [Avro格式](../interfaces/formats.md#data-format-avro) 模式缓存。
- [字典](../sql-reference/dictionaries/index.md) 数据缓存。
- 模式推断缓存。
- [文件系统缓存](storing-data.md) 在 S3、Azure、本地和其他磁盘上。
- [查询缓存](query-cache.md)。
- 格式模式缓存。

要删除某个缓存，请使用 [SYSTEM DROP ... CACHE](../sql-reference/statements/system.md#drop-mark-cache) 语句。

要删除格式模式缓存，请使用 [SYSTEM DROP FORMAT SCHEMA CACHE](/sql-reference/statements/system#system-drop-schema-format) 语句。

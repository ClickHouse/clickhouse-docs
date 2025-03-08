---
description: '包含有关当前正在进行的合并和部分变更的信息，适用于 MergeTree 系列的表。'
slug: /operations/system-tables/merges
title: 'system.merges'
keywords: ['system table', 'merges']
---
import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含有关当前正在进行的合并和部分变更的信息，适用于 MergeTree 系列的表。

列：

- `database` (String) — 表所在数据库的名称。
- `table` (String) — 表名。
- `elapsed` (Float64) — 自合并开始以来经过的时间（单位：秒）。
- `progress` (Float64) — 已完成工作的百分比，范围从 0 到 1。
- `num_parts` (UInt64) — 要合并的片段数量。
- `result_part_name` (String) — 合并后形成的部分的名称。
- `is_mutation` (UInt8) — 如果此过程是部分变更，则为 1。
- `total_size_bytes_compressed` (UInt64) — 合并片段中压缩数据的总大小。
- `total_size_marks` (UInt64) — 合并部分中的标记总数。
- `bytes_read_uncompressed` (UInt64) — 读取的未压缩字节数。
- `rows_read` (UInt64) — 读取的行数。
- `bytes_written_uncompressed` (UInt64) — 写入的未压缩字节数。
- `rows_written` (UInt64) — 写入的行数。
- `memory_usage` (UInt64) — 合并过程的内存消耗。
- `thread_id` (UInt64) — 合并过程的线程 ID。
- `merge_type` — 当前合并的类型。如果是变更，该字段为空。
- `merge_algorithm` — 当前合并中使用的算法。如果是变更，该字段为空。

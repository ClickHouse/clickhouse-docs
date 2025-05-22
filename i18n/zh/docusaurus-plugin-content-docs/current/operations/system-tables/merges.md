---
'description': '系统表，包含有关当前正在处理的合并和分区片段突变的信息，适用于MergeTree系列的表。'
'keywords':
- 'system table'
- 'merges'
'slug': '/operations/system-tables/merges'
'title': 'system.merges'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.merges

<SystemTableCloud/>

包含关于当前在MergeTree家族表中进行的合并和部分变更的信息。

列：

- `database` (String) — 表所在数据库的名称。
- `table` (String) — 表名。
- `elapsed` (Float64) — 自合并开始以来经过的时间（以秒为单位）。
- `progress` (Float64) — 完成工作的百分比，从0到1。
- `num_parts` (UInt64) — 要合并的部分数量。
- `result_part_name` (String) — 合并后形成的部分名称。
- `is_mutation` (UInt8) — 如果该过程是部分变更，则为1。
- `total_size_bytes_compressed` (UInt64) — 合并后的块中压缩数据的总大小。
- `total_size_marks` (UInt64) — 合并部分中的标记总数。
- `bytes_read_uncompressed` (UInt64) — 读取的原始字节数。
- `rows_read` (UInt64) — 读取的行数。
- `bytes_written_uncompressed` (UInt64) — 写入的原始字节数。
- `rows_written` (UInt64) — 写入的行数。
- `memory_usage` (UInt64) — 合并过程的内存消耗。
- `thread_id` (UInt64) — 合并过程的线程ID。
- `merge_type` — 当前合并的类型。如果是变更，则为空。
- `merge_algorithm` — 当前合并中使用的算法。如果是变更，则为空。

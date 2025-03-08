---
description: '包含有关在 MergeTree 家族表中发生的数据部分事件的信息的系统表，例如添加或合并数据。'
slug: /operations/system-tables/part_log
title: 'system.part_log'
keywords: ['system table', 'part_log']
---
import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

`system.part_log` 表仅在指定了 [part_log](/operations/server-configuration-parameters/settings#part_log) 服务器设置时才会创建。

该表包含有关在 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 家族表中发生的 [data parts](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) 事件的信息，例如添加或合并数据。

`system.part_log` 表包含以下列：

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器的主机名。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 创建该数据部分的 `INSERT` 查询的标识符。
- `event_type` ([Enum8](../../sql-reference/data-types/enum.md)) — 与数据部分发生的事件的类型。可以有以下值之一：
    - `NewPart` — 插入新数据部分。
    - `MergePartsStart` — 数据部分的合并已开始。
    - `MergeParts` — 数据部分的合并已完成。
    - `DownloadPart` — 正在下载数据部分。
    - `RemovePart` — 使用 [DETACH PARTITION](/sql-reference/statements/alter/partition#detach-partitionpart) 删除或分离数据部分。
    - `MutatePartStart` — 数据部分的变更已开始。
    - `MutatePart` — 数据部分的变更已完成。
    - `MovePart` — 将数据部分从一个磁盘移动到另一个磁盘。
- `merge_reason` ([Enum8](../../sql-reference/data-types/enum.md)) — 事件类型为 `MERGE_PARTS` 的原因。可以有以下值之一：
    - `NotAMerge` — 当前事件的类型不同于 `MERGE_PARTS`。
    - `RegularMerge` — 一些常规合并。
    - `TTLDeleteMerge` — 清理过期数据。
    - `TTLRecompressMerge` — 重新压缩数据部分。
- `merge_algorithm` ([Enum8](../../sql-reference/data-types/enum.md)) — 类型为 `MERGE_PARTS` 的事件的合并算法。可以有以下值之一：
    - `Undecided`
    - `Horizontal`
    - `Vertical`
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件日期。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件时间。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 事件时间，精确到微秒。
- `duration_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 持续时间。
- `database` ([String](../../sql-reference/data-types/string.md)) — 数据部分所在的数据库名称。
- `table` ([String](../../sql-reference/data-types/string.md)) — 数据部分所在的表名称。
- `part_name` ([String](../../sql-reference/data-types/string.md)) — 数据部分的名称。
- `partition_id` ([String](../../sql-reference/data-types/string.md)) — 数据部分插入到的分区的 ID。如果分区是根据 `tuple()` 进行的，则该列取值为 `all`。
- `path_on_disk` ([String](../../sql-reference/data-types/string.md)) — 数据部分文件的文件夹的绝对路径。
- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 数据部分中的行数。
- `size_in_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 数据部分的大小（以字节为单位）。
- `merged_from` ([Array(String)](../../sql-reference/data-types/array.md)) — 当前部分由哪些部分组成的名称数组（合并后）。
- `bytes_uncompressed` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 未压缩字节的大小。
- `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 在合并过程中读取的行数。
- `read_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 在合并过程中读取的字节数。
- `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — 在此线程上下文中分配和释放内存的最大差异。
- `error` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 发生错误的代码。
- `exception` ([String](../../sql-reference/data-types/string.md)) — 发生错误的文本消息。

在首次向 `MergeTree` 表插入数据后，会创建 `system.part_log` 表。

**示例**

``` sql
SELECT * FROM system.part_log LIMIT 1 FORMAT Vertical;
```

``` text
Row 1:
──────
hostname:                      clickhouse.eu-central1.internal
query_id:                      983ad9c7-28d5-4ae1-844e-603116b7de31
event_type:                    NewPart
merge_reason:                  NotAMerge
merge_algorithm:               Undecided
event_date:                    2021-02-02
event_time:                    2021-02-02 11:14:28
event_time_microseconds:       2021-02-02 11:14:28.861919
duration_ms:                   35
database:                      default
table:                         log_mt_2
part_name:                     all_1_1_0
partition_id:                  all
path_on_disk:                  db/data/default/log_mt_2/all_1_1_0/
rows:                          115418
size_in_bytes:                 1074311
merged_from:                   []
bytes_uncompressed:            0
read_rows:                     0
read_bytes:                    0
peak_memory_usage:             0
error:                         0
exception:
```

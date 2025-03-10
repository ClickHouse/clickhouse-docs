---
slug: /operations/settings/query-complexity
sidebar_position: 59
sidebar_label: 查询复杂度的限制
title: "查询复杂度的限制"
description: "限制查询复杂度的设置。"
---


# 查询复杂度的限制

查询复杂度的限制是设置的一部分。
它们用于提供安全的用户界面执行。
几乎所有的限制只适用于 `SELECT`。对于分布式查询处理，限制在每个服务器上分别应用。

ClickHouse 检查数据分片的限制，而不是每一行。这意味着您可以在数据分片的大小上超出限制值。

关于“某物的最大数量”的限制可以取值为 0，这意味着“无限制”。
大多数限制还有一个 'overflow_mode' 设置，指的是超出限制时该如何处理。
它可以取两个值之一：`throw` 或 `break`。聚合的限制 (group_by_overflow_mode) 也有 `any` 的值。

`throw` – 抛出异常（默认）。

`break` – 停止执行查询并返回部分结果，仿佛源数据用尽。

`any (仅适用于 group_by_overflow_mode)` – 对进入集合的键继续聚合，但不向集合中添加新键。

## max_memory_usage {#settings_max_memory_usage}

运行查询时单个服务器可使用的最大内存量。

默认设置为无限（设置为 `0`）。

云默认值：取决于副本的 RAM 大小。

该设置不考虑可用内存的容量或机器上的总内存容量。
限制适用于单个查询在单个服务器内。
您可以使用 `SHOW PROCESSLIST` 查看每个查询的当前内存消耗。
此外，公共日志中跟踪并写入每个查询的峰值内存消耗。

不监控某些聚合函数状态的内存使用。

对于 `String` 和 `Array` 参数的聚合函数 `min`、`max`、`any`、`anyLast`、`argMin`、`argMax` 的状态，内存使用也没有完全跟踪。

内存消耗还受参数 `max_memory_usage_for_user` 和 [max_server_memory_usage](../../operations/server-configuration-parameters/settings.md#max_server_memory_usage) 的限制。

## max_memory_usage_for_user {#max-memory-usage-for-user}

运行单个服务器上用户的查询时可使用的最大内存量。

默认值在 [Settings.h](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/Settings.h#L288) 中定义。默认情况下，数量不受限制（`max_memory_usage_for_user = 0`）。

另请参见 [max_memory_usage](#settings_max_memory_usage) 的描述。

例如，如果您想为名为 `clickhouse_read` 的用户将 `max_memory_usage_for_user` 设置为 1000 字节，可以使用以下语句：

``` sql
ALTER USER clickhouse_read SETTINGS max_memory_usage_for_user = 1000;
```

您可以通过注销客户端，重新登录，然后使用 `getSetting` 函数来验证其是否有效：

```sql
SELECT getSetting('max_memory_usage_for_user');
```

## max_rows_to_read {#max-rows-to-read}

以下限制可以在每个块上检查（而不是每一行）。也就是说，限制可以稍微被打破。

当运行查询时，可以从表中读取的最大行数。

## max_bytes_to_read {#max-bytes-to-read}

当运行查询时，可以从表中读取的最大字节数（未压缩数据）。

## read_overflow_mode {#read-overflow-mode}

当读取的数据量超过其中一个限制时该怎么办：'throw' 或 'break'。默认情况下为 throw。

## max_rows_to_read_leaf {#max-rows-to-read-leaf}

以下限制可以在每个块上检查（而不是每一行）。也就是说，限制可以稍微被打破。

当在叶节点运行分布式查询时，可以从本地表中读取的最大行数。虽然
分布式查询可以对每个分片（叶节点）发出多个子查询 - 该限制将仅在叶节点的读取阶段检查，并且在根节点的结果合并阶段被忽略。例如，集群由 2 个分片组成，每个分片包含 100 行的表。然后，分布式查询假设要从两个表读取所有数据，设置为 `max_rows_to_read=150` 将失败，因为总共将为 200 行。虽然设置 `max_rows_to_read_leaf=150` 的查询将成功，因为叶节点将最多读取 100 行。

## max_bytes_to_read_leaf {#max-bytes-to-read-leaf}

当在叶节点运行分布式查询时，可以从本地表中读取的最大字节数（未压缩数据）。虽然分布式查询可以对每个分片（叶节点）发出多个子查询 - 该限制将仅在叶节点的读取阶段检查，并且在根节点的结果合并阶段被忽略。
例如，集群由 2 个分片组成，每个分片包含 100 字节的数据。
然后，分布式查询假设要从两个表读取所有数据，设置 `max_bytes_to_read=150` 将失败，因为总共将为 200 字节。而设置 `max_bytes_to_read_leaf=150` 的查询将成功，因为叶节点将最多读取 100 字节。

## read_overflow_mode_leaf {#read-overflow-mode-leaf}

当读取的数据量超过其中一个叶限制时该怎么办：'throw' 或 'break'。默认情况下为 throw。

## max_rows_to_group_by {#settings-max-rows-to-group-by}

从聚合中接收的唯一键的最大数量。此设置允许您在聚合时限制内存消耗。

## group_by_overflow_mode {#group-by-overflow-mode}

当聚合的唯一键数量超出限制时该怎么办：'throw'、'break' 或 'any'。默认情况下为 throw。
使用 'any' 值允许您运行 GROUP BY 的近似值。该近似值的质量取决于数据的统计特性。

## max_bytes_before_external_group_by {#settings-max_bytes_before_external_group_by}

启用或禁用在外部内存中执行 `GROUP BY` 子句。参见 [在外部内存中的 GROUP BY](/sql-reference/statements/select/group-by#group-by-in-external-memory)。

可能的值：

- 单个 [GROUP BY](/sql-reference/statements/select/group-by) 操作可以使用的最大 RAM（以字节为单位）。
- 0 — 禁用在外部内存中执行 `GROUP BY`。

默认值：`0`。

云默认值：每个副本的一半内存量。

## max_bytes_ratio_before_external_group_by {#settings-max_bytes_ratio_before_external_group_by}

允许用于 `GROUP BY` 的可用内存的比例，一旦达到，就会使用外部内存进行聚合。

例如，如果设置为 `0.6`，`GROUP BY` 将允许在执行开始时使用可用内存（对服务器/用户/合并）中的 `60%`，之后将开始使用外部聚合。

默认值：`0.5`。

## max_bytes_before_external_sort {#settings-max_bytes_before_external_sort}

启用或禁用在外部内存中执行 `ORDER BY` 子句。参见 [ORDER BY 实现细节](../../sql-reference/statements/select/order-by.md#implementation-details)

- 单个 [ORDER BY](../../sql-reference/statements/select/order-by.md) 操作可以使用的最大 RAM（以字节为单位）。推荐值是可用系统内存的一半
- 0 — 禁用在外部内存中执行 `ORDER BY`。

默认值：0。

云默认值：每个副本的一半内存量。

## max_bytes_ratio_before_external_sort {#settings-max_bytes_ratio_before_external_sort}

允许用于 `ORDER BY` 的可用内存的比例，一旦达到，就将使用外部排序。

例如，如果设置为 `0.6`，`ORDER BY` 将允许在执行开始时使用可用内存（对服务器/用户/合并）中的 `60%`，之后将开始使用外部排序。

默认值：`0.5`。

## max_rows_to_sort {#max-rows-to-sort}

在排序之前的最大行数。这允许您在排序时限制内存消耗。

## max_bytes_to_sort {#max-bytes-to-sort}

在排序之前的最大字节数。

## sort_overflow_mode {#sort-overflow-mode}

如果在排序之前接收的行数超过其中一个限制时该怎么做：'throw' 或 'break'。默认情况下为 throw。

## max_result_rows {#setting-max_result_rows}

结果中行数的限制。也对子查询以及在执行分布式查询的部分结果时在远程服务器上检查。当值为 `0` 时不应用限制。

默认值：`0`。

云默认值：`0`。

## max_result_bytes {#max-result-bytes}

结果中字节数的限制。与前面的设置相同。

## result_overflow_mode {#result-overflow-mode}

如果结果的大小超过其中一个限制该怎么办：'throw' 或 'break'。

使用 'break' 类似于使用 LIMIT。`Break` 仅在块级别中中断执行。这意味着返回的行数大于 [max_result_rows](#setting-max_result_rows)，[max_block_size](/operations/settings/settings#max_block_size) 的倍数，并且取决于 [max_threads](../../operations/settings/settings.md#max_threads)。

默认值：`throw`。

云默认值：`throw`。

示例：

``` sql
SET max_threads = 3, max_block_size = 3333;
SET max_result_rows = 3334, result_overflow_mode = 'break';

SELECT *
FROM numbers_mt(100000)
FORMAT Null;
```

结果：

``` text
6666 rows in set. ...
```

## max_execution_time {#max-execution-time}

最大查询执行时间（以秒为单位）。
此时，在某个排序阶段或合并和完成聚合函数时不会进行检查。

`max_execution_time` 参数可能有些复杂。
它的运作基于相对于当前查询执行速度的插值（此行为由 [timeout_before_checking_execution_speed](#timeout-before-checking-execution-speed) 控制）。
如果预测的执行时间超过指定的 `max_execution_time`，ClickHouse 将中断查询。
默认情况下，timeout_before_checking_execution_speed 设置为 10 秒。这意味着在查询执行 10 秒后，ClickHouse 将开始估算总执行时间。
例如，如果 `max_execution_time` 设置为 3600 秒（1 小时），如果估计时间超过 3600 秒，ClickHouse 将终止查询。
如果将 `timeout_before_checking_execution_speed ` 设置为 0，ClickHouse 将使用钟表时间作为 `max_execution_time` 的基础。

## timeout_overflow_mode {#timeout-overflow-mode}

如果查询的运行时间超过 `max_execution_time` 或估计的运行时间超过 `max_estimated_execution_time` 时该怎么办：`throw` 或 `break`。默认情况下为 `throw`。

## max_execution_time_leaf {#max_execution_time_leaf}

与 `max_execution_time` 的语义相似，但仅适用于分布式或远程查询的叶节点。

例如，如果我们想限制叶节点的执行时间为 `10s`，但初始节点没有限制，而不是在嵌套子查询设置中使用 `max_execution_time`：

``` sql
SELECT count() FROM cluster(cluster, view(SELECT * FROM t SETTINGS max_execution_time = 10));
```

我们可以使用 `max_execution_time_leaf` 作为查询设置：

``` sql
SELECT count() FROM cluster(cluster, view(SELECT * FROM t)) SETTINGS max_execution_time_leaf = 10;
```

## timeout_overflow_mode_leaf {#timeout_overflow_mode_leaf}

当叶节点中的查询运行超过 `max_execution_time_leaf` 时该怎么办：`throw` 或 `break`。默认情况下为 `throw`。

## min_execution_speed {#min-execution-speed}

每秒的最小执行速度（以行数计）。在 'timeout_before_checking_execution_speed' 到期时在每个数据块上检查。如果执行速度低于此值，将抛出异常。

## min_execution_speed_bytes {#min-execution-speed-bytes}

每秒的最小执行字节数。当 'timeout_before_checking_execution_speed' 到期时在每个数据块上进行检查。如果执行速度低于此值，将抛出异常。

## max_execution_speed {#max-execution-speed}

每秒的最大执行行数。在 'timeout_before_checking_execution_speed' 到期时在每个数据块上进行检查。如果执行速度过高，执行速度将被降低。

## max_execution_speed_bytes {#max-execution-speed-bytes}

每秒的最大执行字节数。在 'timeout_before_checking_execution_speed' 到期时在每个数据块上进行检查。如果执行速度过高，执行速度将被降低。

## timeout_before_checking_execution_speed {#timeout-before-checking-execution-speed}

在指定时间（以秒为单位）到期后检查执行速度是否太慢（不低于 'min_execution_speed'）。

## max_estimated_execution_time {#max_estimated_execution_time}

最大查询预计执行时间（以秒为单位）。在 'timeout_before_checking_execution_speed' 到期时在每个数据块上进行检查。

## max_columns_to_read {#max-columns-to-read}

单个查询可以从表中读取的最大列数。如果查询要求读取的列数超过此值，则抛出异常。

## max_temporary_columns {#max-temporary-columns}

在运行查询时，必须同时保留在 RAM 中的最大临时列数，包括常数列。如果临时列数超过此限制，则抛出异常。

## max_temporary_non_const_columns {#max-temporary-non-const-columns}

与 'max_temporary_columns' 相同，但不计算常数列。
请注意，常数列在运行查询时相对较频繁地形成，但它们所需的计算资源几乎为零。

## max_subquery_depth {#max-subquery-depth}

子查询的最大嵌套深度。如果子查询更深，将抛出异常。默认情况下为 100。

## max_pipeline_depth {#max-pipeline-depth}

最大管道深度。对应于每个数据块在查询处理过程中经过的变换次数。在单个服务器的限制内进行计数。如果管道深度更大，将抛出异常。默认值为 1000。

## max_ast_depth {#max-ast-depth}

查询语法树的最大嵌套深度。如果超过，将抛出异常。
此时，它不会在解析期间进行检查，而是在解析查询后进行检查。也就是说，语法树太深的情况可能在解析过程中被创建，但查询将失败。默认值为 1000。

## max_ast_elements {#max-ast-elements}

查询语法树中的最大元素数。如果超过，将抛出异常。
与上一个设置相同，它仅在解析查询后进行检查。默认值为 50,000。

## max_rows_in_set {#max-rows-in-set}

由子查询创建的 IN 子句中数据集的最大行数。

## max_bytes_in_set {#max-bytes-in-set}

由由子查询创建的 IN 子句中使用的最大字节数（未压缩数据）。

## set_overflow_mode {#set-overflow-mode}

当数据量超过其中一个限制时该怎么办：'throw' 或 'break'。默认情况下为 throw。

## max_rows_in_distinct {#max-rows-in-distinct}

使用 DISTINCT 时的最大不同行数。

## max_bytes_in_distinct {#max-bytes-in-distinct}

使用 DISTINCT 时哈希表使用的最大字节数。

## distinct_overflow_mode {#distinct-overflow-mode}

当数据量超过其中一个限制时该怎么办：'throw' 或 'break'。默认情况下为 throw。

## max_rows_to_transfer {#max-rows-to-transfer}

在使用 GLOBAL IN 时，可以传递到远程服务器或保存到临时表的最大行数。

## max_bytes_to_transfer {#max-bytes-to-transfer}

在使用 GLOBAL IN 时，可以传递到远程服务器或保存到临时表的最大字节数（未压缩数据）。

## transfer_overflow_mode {#transfer-overflow-mode}

当数据量超过其中一个限制时该怎么办：'throw' 或 'break'。默认情况下为 throw。

## max_rows_in_join {#settings-max_rows_in_join}

限制在连接表时使用的哈希表中的行数。

此设置适用于 [SELECT ... JOIN](/sql-reference/statements/select/join) 操作和 [Join](../../engines/table-engines/special/join.md) 表引擎。

如果查询包含多个连接，ClickHouse 会对每个中间结果检查此设置。

ClickHouse 可以在达到限制时采取不同的操作。使用 [join_overflow_mode](#settings-join_overflow_mode) 设置来选择操作。

可能的值：

- 正整数。
- 0 — 没有限制行数。

默认值：0。

## max_bytes_in_join {#settings-max_bytes_in_join}

限制连接表时所用哈希表的大小（以字节为单位）。

此设置适用于 [SELECT ... JOIN](/sql-reference/statements/select/join) 操作和 [Join 表引擎](../../engines/table-engines/special/join.md)。

如果查询包含连接，ClickHouse 会对每个中间结果检查此设置。

ClickHouse 可以在达到限制时采取不同的操作。使用 [join_overflow_mode](#settings-join_overflow_mode) 设置来选择操作。

可能的值：

- 正整数。
- 0 — 禁用内存控制。

默认值：0。

## join_overflow_mode {#settings-join_overflow_mode}

定义当达到以下任一连接限制时 ClickHouse 执行的操作：

- [max_bytes_in_join](#settings-max_bytes_in_join)
- [max_rows_in_join](#settings-max_rows_in_join)

可能的值：

- `THROW` — ClickHouse 抛出异常并中断操作。
- `BREAK` — ClickHouse 中断操作而不抛出异常。

默认值：`THROW`。

**另请参阅**

- [JOIN 子句](/sql-reference/statements/select/join)
- [Join 表引擎](../../engines/table-engines/special/join.md)

## max_partitions_per_insert_block {#settings-max_partitions_per_insert_block}

限制单个插入块中的最大分区数。

- 正整数。
- 0 — 没有限制分区数。

默认值：100。

**详情**

插入数据时，ClickHouse 会计算插入块中的分区数。如果分区的数量超过 `max_partitions_per_insert_block`，ClickHouse 会根据 `throw_on_max_partitions_per_insert_block` 记录警告或抛出异常。异常文本如下：

> "单个 INSERT 块的分区数量过多（`partitions_count` 分区，限制为 " + toString(max_partitions) + "）。该限制由 'max_partitions_per_insert_block' 设置控制。大量分区是一个普遍的误解。它会导致严重的负面性能影响，包括服务器启动缓慢、INSERT 查询缓慢和 SELECT 查询缓慢。表的建议总分区数低于 1000..10000。请注意，分区并不是为了加速 SELECT 查询（ORDER BY 键足以使范围查询快速）。分区旨在用于数据操作（DROP PARTITION 等）。"

## throw_on_max_partitions_per_insert_block {#settings-throw_on_max_partition_per_insert_block}

允许您控制当 `max_partitions_per_insert_block` 到达时的行为。

- `true`  - 当插入块达到 `max_partitions_per_insert_block` 时，抛出异常。
- `false` - 达到 `max_partitions_per_insert_block` 时记录警告。

默认值：`true`

## max_temporary_data_on_disk_size_for_user {#settings_max_temporary_data_on_disk_size_for_user}

所有同时运行的用户查询在磁盘上由临时文件消耗的最大数据量（以字节为单位）。
零表示无限制。

默认值：0。

## max_temporary_data_on_disk_size_for_query {#settings_max_temporary_data_on_disk_size_for_query}

所有同时运行的查询在磁盘上由临时文件消耗的最大数据量（以字节为单位）。
零表示无限制。

默认值：0。

## max_sessions_for_user {#max-sessions-per-user}

每个经过身份验证的用户与 ClickHouse 服务器的最大同时会话数。

示例：

``` xml
<profiles>
    <single_session_profile>
        <max_sessions_for_user>1</max_sessions_for_user>
    </single_session_profile>
    <two_sessions_profile>
        <max_sessions_for_user>2</max_sessions_for_user>
    </two_sessions_profile>
    <unlimited_sessions_profile>
        <max_sessions_for_user>0</max_sessions_for_user>
    </unlimited_sessions_profile>
</profiles>
<users>
     <!-- 用户 Alice 只能一次连接到 ClickHouse 服务器。 -->
    <Alice>
        <profile>single_session_user</profile>
    </Alice>
    <!-- 用户 Bob 可以使用 2 个同时会话。 -->
    <Bob>
        <profile>two_sessions_profile</profile>
    </Bob>
    <!-- 用户 Charles 可以使用任意数量的同时会话。 -->
    <Charles>
       <profile>unlimited_sessions_profile</profile>
    </Charles>
</users>
```

默认值：0（无限量的同时会话）。

## max_partitions_to_read {#max-partitions-to-read}

限制在一次查询中可以访问的分区的最大数量。

在创建表时指定的设置值可以通过查询级别的设置覆盖。

可能的值：

- 任何正整数。

默认值：-1（无限制）。

您还可以在表的设置中指定 MergeTree 设置 [max_partitions_to_read](merge-tree-settings#max-partitions-to-read)。

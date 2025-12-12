---
description: '介绍 ClickHouse 中内存分配分析的页面'
sidebar_label: '内存分配分析'
slug: /operations/allocation-profiling
title: '内存分配分析'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 内存分配分析 {#allocation-profiling}

ClickHouse 使用 [jemalloc](https://github.com/jemalloc/jemalloc) 作为其全局分配器。Jemalloc 自带了一些用于内存分配采样和分析的工具。  
为了让内存分配分析更方便，ClickHouse 和 Keeper 允许通过配置、查询设置、`SYSTEM` 命令以及 Keeper 中的四字命令（4LW）来控制采样。  
此外，采样数据可以以 `JemallocSample` 类型收集到 `system.trace_log` 表中。

:::note

本指南适用于 25.9 及以上版本。  
对于更早的版本，请参阅[25.9 之前版本的内存分配分析](/operations/allocation-profiling-old.md)。

:::

## 采样内存分配 {#sampling-allocations}

如需在 `jemalloc` 中对内存分配进行采样和分析，你需要在启动 ClickHouse/Keeper 时启用配置项 `jemalloc_enable_global_profiler`。

```xml
<clickhouse>
    <jemalloc_enable_global_profiler>1</jemalloc_enable_global_profiler>
</clickhouse>
```

`jemalloc` 将对内存分配进行采样，并在内部存储相关信息。

你也可以通过 `jemalloc_enable_profiler` 设置来为每个查询启用内存分配采样。

:::warning 警告
由于 ClickHouse 是一个内存分配密集型应用程序，jemalloc 采样可能会带来性能开销。
:::

## 在 `system.trace_log` 中存储 jemalloc 采样数据 {#storing-jemalloc-samples-in-system-trace-log}

你可以将所有 jemalloc 采样数据以 `JemallocSample` 类型存储到 `system.trace_log` 中。
要在全局范围内启用此功能，可以使用配置项 `jemalloc_collect_global_profile_samples_in_trace_log`。

```xml
<clickhouse>
    <jemalloc_collect_global_profile_samples_in_trace_log>1</jemalloc_collect_global_profile_samples_in_trace_log>
</clickhouse>
```

:::warning 警告
由于 ClickHouse 是一个内存分配非常密集的应用程序，在 `system.trace&#95;log` 中收集所有样本可能会带来较高负载。
:::

你也可以通过使用 `jemalloc_collect_profile_samples_in_trace_log` 设置，为单个查询启用该功能。

### 使用 `system.trace_log` 分析查询内存使用情况的示例 {#example-analyzing-memory-usage-trace-log}

首先，我们需要在启用 jemalloc profiler 的情况下运行查询，并将该查询的样本收集到 `system.trace_log` 中：

```sql
SELECT *
FROM numbers(1000000)
ORDER BY number DESC
SETTINGS max_bytes_ratio_before_external_sort = 0
FORMAT `Null`
SETTINGS jemalloc_enable_profiler = 1, jemalloc_collect_profile_samples_in_trace_log = 1

Query id: 8678d8fe-62c5-48b8-b0cd-26851c62dd75

Ok.

0 rows in set. Elapsed: 0.009 sec. Processed 1.00 million rows, 8.00 MB (108.58 million rows/s., 868.61 MB/s.)
Peak memory usage: 12.65 MiB.
```

:::note
如果 ClickHouse 启动时已启用 `jemalloc_enable_global_profiler`，则无需再启用 `jemalloc_enable_profiler`。\
对于 `jemalloc_collect_global_profile_samples_in_trace_log` 和 `jemalloc_collect_profile_samples_in_trace_log` 也是同样的。
:::

我们将刷新 `system.trace_log`：

```sql
SYSTEM FLUSH LOGS trace_log
```

然后对其进行查询，以获取我们在每个时间点运行的查询的内存使用情况：

```sql
WITH per_bucket AS
(
    SELECT
        event_time_microseconds AS bucket_time,
        sum(size) AS bucket_sum
    FROM system.trace_log
    WHERE trace_type = 'JemallocSample'
      AND query_id = '8678d8fe-62c5-48b8-b0cd-26851c62dd75'
    GROUP BY bucket_time
)
SELECT
    bucket_time,
    sum(bucket_sum) OVER (
        ORDER BY bucket_time ASC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_size,
    formatReadableSize(cumulative_size) AS cumulative_size_readable
FROM per_bucket
ORDER BY bucket_time
```

我们还可以找出内存使用量最高的时间点：

```sql
SELECT
    argMax(bucket_time, cumulative_size),
    max(cumulative_size)
FROM
(
    WITH per_bucket AS
    (
        SELECT
            event_time_microseconds AS bucket_time,
            sum(size) AS bucket_sum
        FROM system.trace_log
        WHERE trace_type = 'JemallocSample'
          AND query_id = '8678d8fe-62c5-48b8-b0cd-26851c62dd75'
        GROUP BY bucket_time
    )
    SELECT
        bucket_time,
        sum(bucket_sum) OVER (
            ORDER BY bucket_time ASC
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cumulative_size,
        formatReadableSize(cumulative_size) AS cumulative_size_readable
    FROM per_bucket
    ORDER BY bucket_time
)
```

我们可以利用该结果查看在该时间点上哪些位置的活跃内存分配最多：

```sql
SELECT
    concat(
        '\n',
        arrayStringConcat(
            arrayMap(
                (x, y) -> concat(x, ': ', y),
                arrayMap(x -> addressToLine(x), allocation_trace),
                arrayMap(x -> demangle(addressToSymbol(x)), allocation_trace)
            ),
            '\n'
        )
    ) AS symbolized_trace,
    sum(s) AS per_trace_sum
FROM
(
    SELECT
        ptr,
        sum(size) AS s,
        argMax(trace, event_time_microseconds) AS allocation_trace
    FROM system.trace_log
    WHERE trace_type = 'JemallocSample'
      AND query_id = '8678d8fe-62c5-48b8-b0cd-26851c62dd75'
      AND event_time_microseconds <= '2025-09-04 11:56:21.737139'
    GROUP BY ptr
    HAVING s > 0
)
GROUP BY ALL
ORDER BY per_trace_sum ASC
```

## 刷新堆内存剖析文件 {#flushing-heap-profiles}

默认情况下，堆剖析文件会生成在 `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap` 中，其中 `_pid_` 是 ClickHouse 的 PID，`_seqnum_` 是当前堆剖析文件的全局序号。\
对于 Keeper，默认文件为 `/tmp/jemalloc_keeper._pid_._seqnum_.heap`，并遵循相同规则。

你可以通过运行以下命令，让 `jemalloc` 将当前剖析文件刷新到磁盘：

<Tabs groupId="binary">
  <TabItem value="clickhouse" label="ClickHouse">
    ```sql
SYSTEM JEMALLOC FLUSH PROFILE
```

    它会返回已刷新的剖析文件的位置。
  </TabItem>

  <TabItem value="keeper" label="Keeper">
    ```sh
echo jmfp | nc localhost 9181
```
  </TabItem>
</Tabs>

你可以通过在 `MALLOC_CONF` 环境变量中追加 `prof_prefix` 选项来定义不同的存储位置。\
例如，如果你希望在 `/data` 目录中生成剖析文件，并将文件名前缀设置为 `my_current_profile`，可以使用如下环境变量来运行 ClickHouse/Keeper：

```sh
MALLOC_CONF=prof_prefix:/data/my_current_profile
```

生成的文件名将由前缀、PID 和序列号组成。

## 分析堆内存剖析数据 {#analyzing-heap-profiles}

在生成堆内存剖析数据之后，需要对其进行分析。\
为此，可以使用 `jemalloc` 提供的工具 [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in)。它可以通过多种方式安装：

* 使用系统的包管理器
* 克隆 [jemalloc 仓库](https://github.com/jemalloc/jemalloc) 并在根目录运行 `autogen.sh`。这样会在 `bin` 目录中生成 `jeprof` 脚本

:::note
`jeprof` 使用 `addr2line` 来生成堆栈跟踪，这个过程可能非常缓慢。\
如果遇到这种情况，建议安装该工具的[替代实现](https://github.com/gimli-rs/addr2line)。

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```

或者，`llvm-addr2line` 同样适用。

:::

可以使用 `jeprof` 从堆内存分析结果生成多种不同的输出格式。
建议运行 `jeprof --help` 来查看该工具的用法以及提供的各类选项。

通常情况下，`jeprof` 命令的用法如下：

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

如果你想比较在两个分析概要之间发生了哪些分配，可以设置 `base` 参数：

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

### 示例 {#examples}

* 如果你想生成一个文本文件，使每个过程各写在单独一行：

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

* 如果你想生成带有调用关系图的 PDF 文件：

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### 生成火焰图 {#generating-flame-graph}

`jeprof` 可以生成用于构建火焰图的折叠后调用栈。

需要使用 `--collapsed` 参数：

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

接下来，你可以使用许多不同的工具来可视化折叠后的调用栈。

最常用的是 [FlameGraph](https://github.com/brendangregg/FlameGraph)，其中包含一个名为 `flamegraph.pl` 的脚本：

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

另一个有用的工具是 [speedscope](https://www.speedscope.app/)，它使你能够以更直观、交互的方式分析收集到的调用栈。

## 分析器的其他选项 {#additional-options-for-profiler}

`jemalloc` 提供了许多与分析器相关的选项。可以通过设置 `MALLOC_CONF` 环境变量来进行配置。
例如，可以使用 `lg_prof_sample` 控制分配采样之间的间隔。  
如果你希望每分配 N 字节就导出一次堆分析概要，可以通过 `lg_prof_interval` 启用该功能。  

建议查看 `jemalloc` 的[参考页面](https://jemalloc.net/jemalloc.3.html)以获取完整的选项列表。

## 其他资源 {#other-resources}

ClickHouse/Keeper 通过多种方式暴露与 `jemalloc` 相关的指标。

:::warning 警告
需要注意的是，这些指标之间并不同步，数值可能会出现偏移。
:::

### 系统表 `asynchronous_metrics` {#system-table-asynchronous_metrics}

```sql
SELECT *
FROM system.asynchronous_metrics
WHERE metric LIKE '%jemalloc%'
FORMAT Vertical
```

[参考](/operations/system-tables/asynchronous_metrics)

### 系统表 `jemalloc_bins` {#system-table-jemalloc_bins}

包含通过 jemalloc 分配器在不同大小类（bins）中的内存分配情况，这些信息从所有 arena 聚合而来。

[参考](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

来自 `asynchronous_metrics` 的所有与 `jemalloc` 相关的指标，也会通过 ClickHouse 和 Keeper 中的 Prometheus 端点对外暴露。

[参考](/operations/server-configuration-parameters/settings#prometheus)

### Keeper 中的 `jmst` 4LW 命令 {#jmst-4lw-command-in-keeper}

Keeper 支持 `jmst` 4LW 命令，其返回[基础分配器统计信息](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics)：

```sh
echo jmst | nc localhost 9181
```

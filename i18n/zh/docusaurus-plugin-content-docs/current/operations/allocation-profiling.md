---
description: '详细介绍 ClickHouse 中内存分配分析的页面'
sidebar_label: '内存分配分析'
slug: /operations/allocation-profiling
title: '内存分配分析'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 分配分析

ClickHouse 使用 [jemalloc](https://github.com/jemalloc/jemalloc) 作为全局内存分配器。jemalloc 自带了一些用于分配采样和分析的工具。  
为了让分配分析更方便，ClickHouse 和 Keeper 支持通过配置、查询设置、`SYSTEM` 命令以及 Keeper 中的 four letter word (4LW) 命令来控制采样。  
此外，还可以将采样数据以 `JemallocSample` 类型写入 `system.trace_log` 表中。

:::note

本指南适用于 25.9 及以上版本。  
对于更早的版本，请参阅[25.9 之前版本的分配分析](/operations/allocation-profiling-old.md)。

:::



## 采样分配 {#sampling-allocations}

如果您想要在 `jemalloc` 中对内存分配进行采样和性能分析,需要在启动 ClickHouse/Keeper 时启用 `jemalloc_enable_global_profiler` 配置项。

```xml
<clickhouse>
    <jemalloc_enable_global_profiler>1</jemalloc_enable_global_profiler>
</clickhouse>
```

`jemalloc` 将对内存分配进行采样并在内部存储相关信息。

您还可以通过 `jemalloc_enable_profiler` 设置来启用针对单个查询的内存分配分析。

:::warning 警告
由于 ClickHouse 是内存分配密集型应用程序,jemalloc 采样可能会带来性能开销。
:::


## 在 `system.trace_log` 中存储 jemalloc 样本 {#storing-jemalloc-samples-in-system-trace-log}

您可以将所有 jemalloc 样本以 `JemallocSample` 类型存储在 `system.trace_log` 中。
要全局启用此功能,可以使用配置项 `jemalloc_collect_global_profile_samples_in_trace_log`。

```xml
<clickhouse>
    <jemalloc_collect_global_profile_samples_in_trace_log>1</jemalloc_collect_global_profile_samples_in_trace_log>
</clickhouse>
```

:::warning 警告
由于 ClickHouse 是内存分配密集型应用程序,在 system.trace_log 中收集所有样本可能会产生较高负载。
:::

您也可以通过 `jemalloc_collect_profile_samples_in_trace_log` 设置为单个查询启用此功能。

### 使用 `system.trace_log` 分析查询内存使用情况的示例 {#example-analyzing-memory-usage-trace-log}

首先,我们需要在启用 jemalloc 分析器的情况下运行查询,并将样本收集到 `system.trace_log` 中:

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
如果 ClickHouse 启动时使用了 `jemalloc_enable_global_profiler`,则无需启用 `jemalloc_enable_profiler`。
`jemalloc_collect_global_profile_samples_in_trace_log` 和 `jemalloc_collect_profile_samples_in_trace_log` 之间也是同样的关系。
:::

我们将刷新 `system.trace_log`:

```sql
SYSTEM FLUSH LOGS trace_log
```

然后查询它以获取所运行查询在各个时间点的内存使用情况:

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

我们还可以找到内存使用量最高的时间点:

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

我们可以使用该结果来查看在该时间点最活跃的内存分配来自何处:


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


## 刷新堆分析文件 {#flushing-heap-profiles}

默认情况下,堆分析文件将生成在 `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`,其中 `_pid_` 是 ClickHouse 的进程 ID,`_seqnum_` 是当前堆分析文件的全局序列号。  
对于 Keeper,默认文件为 `/tmp/jemalloc_keeper._pid_._seqnum_.heap`,遵循相同的规则。

您可以通过运行以下命令来指示 `jemalloc` 刷新当前分析文件:

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">
    
```sql
SYSTEM JEMALLOC FLUSH PROFILE
```

该命令将返回已刷新分析文件的位置。

</TabItem>
<TabItem value="keeper" label="Keeper">
    
```sh
echo jmfp | nc localhost 9181
```

</TabItem>
</Tabs>

可以通过在 `MALLOC_CONF` 环境变量中添加 `prof_prefix` 选项来定义不同的位置。  
例如,如果您想在 `/data` 文件夹中生成分析文件,并将文件名前缀设置为 `my_current_profile`,可以使用以下环境变量运行 ClickHouse/Keeper:

```sh
MALLOC_CONF=prof_prefix:/data/my_current_profile
```

生成的文件将在前缀后附加进程 ID 和序列号。


## 分析堆内存分析文件 {#analyzing-heap-profiles}

生成堆内存分析文件后,需要对其进行分析。
可以使用 `jemalloc` 的工具 [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in) 来完成此操作。该工具可以通过多种方式安装:

- 使用系统的包管理器
- 克隆 [jemalloc 仓库](https://github.com/jemalloc/jemalloc) 并从根目录运行 `autogen.sh`。这将在 `bin` 文件夹中生成 `jeprof` 脚本

:::note
`jeprof` 使用 `addr2line` 生成堆栈跟踪,这可能会非常慢。
如果遇到这种情况,建议安装该工具的[替代实现](https://github.com/gimli-rs/addr2line)。

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```

或者,`llvm-addr2line` 也同样适用。

:::

使用 `jeprof` 可以从堆内存分析文件生成多种不同的格式。
建议运行 `jeprof --help` 以获取有关该工具的使用方法和各种选项的信息。

通常,`jeprof` 命令的使用方式如下:

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

如果要比较两个分析文件之间发生的内存分配,可以设置 `base` 参数:

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

### 示例 {#examples}

- 如果要生成一个文本文件,每行写入一个过程:

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- 如果要生成带有调用图的 PDF 文件:

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### 生成火焰图 {#generating-flame-graph}

`jeprof` 允许您生成折叠堆栈以构建火焰图。

您需要使用 `--collapsed` 参数:

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

之后,您可以使用多种不同的工具来可视化折叠堆栈。

最流行的是 [FlameGraph](https://github.com/brendangregg/FlameGraph),它包含一个名为 `flamegraph.pl` 的脚本:

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

另一个有用的工具是 [speedscope](https://www.speedscope.app/),它允许您以更具交互性的方式分析收集的堆栈。


## 分析器的其他选项 {#additional-options-for-profiler}

`jemalloc` 提供了许多与分析器相关的选项,可通过修改 `MALLOC_CONF` 环境变量进行配置。
例如,分配采样的间隔可通过 `lg_prof_sample` 参数控制。  
如果需要每分配 N 字节就转储一次堆分析结果,可使用 `lg_prof_interval` 参数启用该功能。

建议查阅 `jemalloc` 的[参考文档](https://jemalloc.net/jemalloc.3.html)以获取完整的选项列表。


## 其他资源 {#other-resources}

ClickHouse/Keeper 通过多种方式公开 `jemalloc` 相关指标。

:::warning 警告
需要注意的是,这些指标之间并不同步,数值可能会出现偏差。
:::

### 系统表 `asynchronous_metrics` {#system-table-asynchronous_metrics}

```sql
SELECT *
FROM system.asynchronous_metrics
WHERE metric LIKE '%jemalloc%'
FORMAT Vertical
```

[参考文档](/operations/system-tables/asynchronous_metrics)

### 系统表 `jemalloc_bins` {#system-table-jemalloc_bins}

包含通过 jemalloc 分配器在不同大小类别(bins)中进行的内存分配信息,这些信息从所有 arena 聚合而来。

[参考文档](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

`asynchronous_metrics` 中所有与 `jemalloc` 相关的指标也通过 ClickHouse 和 Keeper 的 Prometheus 端点公开。

[参考文档](/operations/server-configuration-parameters/settings#prometheus)

### Keeper 中的 `jmst` 4LW 命令 {#jmst-4lw-command-in-keeper}

Keeper 支持 `jmst` 4LW 命令,该命令返回[基本分配器统计信息](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics):

```sh
echo jmst | nc localhost 9181
```

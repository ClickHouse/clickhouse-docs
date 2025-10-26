---
'description': '页面详细说明了 ClickHouse 中的分配分析'
'sidebar_label': '分配分析'
'slug': '/operations/allocation-profiling'
'title': '分配分析'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 分配分析

ClickHouse使用 [jemalloc](https://github.com/jemalloc/jemalloc) 作为其全局分配器。 Jemalloc提供了一些用于分配采样和分析的工具。  
为了使分配分析更方便，ClickHouse和Keeper允许您使用配置、查询设置、`SYSTEM`命令和Keeper中的四字母命令（4LW）控制采样。  
此外，样本可以收集到 `system.trace_log` 表中的 `JemallocSample` 类型下。

:::note

本指南适用于版本25.9及以上。
对于较旧版本，请查看 [25.9之前版本的分配分析](/operations/allocation-profiling-old.md)。

:::

## 采样分配 {#sampling-allocations}

如果您想在 `jemalloc` 中进行采样和分析分配，您需要启动ClickHouse/Keeper，并启用配置 `jemalloc_enable_global_profiler`。

```xml
<clickhouse>
    <jemalloc_enable_global_profiler>1</jemalloc_enable_global_profiler>
</clickhouse>
```

`jemalloc` 将采样分配并将信息存储在内部。

您还可以通过使用 `jemalloc_enable_profiler` 设置为每个查询启用分配。

:::warning 警告
由于ClickHouse是一个分配密集型应用，jemalloc采样可能会造成性能开销。
:::

## 在 `system.trace_log` 中存储 jemalloc 样本 {#storing-jemalloc-samples-in-system-trace-log}

您可以将所有 jemalloc 样本存储在 `system.trace_log` 中的 `JemallocSample` 类型下。
要全局启用，您可以使用配置 `jemalloc_collect_global_profile_samples_in_trace_log`。

```xml
<clickhouse>
    <jemalloc_collect_global_profile_samples_in_trace_log>1</jemalloc_collect_global_profile_samples_in_trace_log>
</clickhouse>
```

:::warning 警告
由于ClickHouse是一个分配密集型应用，将所有样本收集到system.trace_log中可能会导致高负载。
:::

您还可以通过使用 `jemalloc_collect_profile_samples_in_trace_log` 设置为每个查询启用此功能。

### 使用 `system.trace_log` 分析查询的内存使用示例 {#example-analyzing-memory-usage-trace-log}

首先，我们需要运行启用 jemalloc 分析器的查询，并将样本收集到 `system.trace_log` 中：

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
如果ClickHouse使用 `jemalloc_enable_global_profiler` 启动，则无需启用 `jemalloc_enable_profiler`。   
`jemalloc_collect_global_profile_samples_in_trace_log` 和 `jemalloc_collect_profile_samples_in_trace_log` 也相同。
:::

我们将刷新 `system.trace_log`：

```sql
SYSTEM FLUSH LOGS trace_log
```
并查询以获取我们每个时间点运行的查询的内存使用情况：
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

我们还可以找到内存使用率最高的时间点：

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

我们可以使用该结果查看在该时间点时最活跃的分配来自哪里：

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

## 刷新堆分析 {#flushing-heap-profiles}

默认情况下，堆分析文件将生成在 `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`，其中 `_pid_` 是ClickHouse的PID，`_seqnum_` 是当前堆分析的全局序列号。  
对于Keeper，默认文件为 `/tmp/jemalloc_keeper._pid_._seqnum_.heap`，并遵循相同的规则。

您可以通过运行以下命令来告诉 `jemalloc` 刷新当前分析：

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">
    
```sql
SYSTEM JEMALLOC FLUSH PROFILE
```

它将返回刷新分析的文件位置。

</TabItem>
<TabItem value="keeper" label="Keeper">
    
```sh
echo jmfp | nc localhost 9181
```

</TabItem>
</Tabs>

可以通过附加 `MALLOC_CONF` 环境变量并使用 `prof_prefix` 选项来定义不同的位置。  
例如，如果您想在 `/data` 文件夹中生成文件名前缀为 `my_current_profile` 的分析，可以使用以下环境变量启动ClickHouse/Keeper：

```sh
MALLOC_CONF=prof_prefix:/data/my_current_profile
```

生成的文件将附加到前缀PID和序列号。

## 分析堆分析 {#analyzing-heap-profiles}

在生成堆分析后，需要进行分析。  
为此，可以使用 `jemalloc` 的工具 [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in)。它可以通过多种方式安装：
- 通过系统的包管理器
- 克隆 [jemalloc仓库](https://github.com/jemalloc/jemalloc) 并从根文件夹运行 `autogen.sh`。这将提供您在 `bin` 文件夹中的 `jeprof` 脚本

:::note
`jeprof` 使用 `addr2line` 来生成堆栈跟踪，这可能非常慢。  
如果是这种情况，建议安装 [该工具的替代实现](https://github.com/gimli-rs/addr2line)。   

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```

另外，`llvm-addr2line` 也能很好地工作。

:::

使用 `jeprof` 从堆分析中生成有许多不同格式。
建议运行 `jeprof --help` 以获取有关用法和工具提供的各种选项的信息。 

一般来说，`jeprof` 命令的使用如下：

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

如果您想比较两个分析之间发生了哪些分配，可以设置 `base` 参数：

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

### 示例 {#examples}

- 如果您想生成一个文本文件，每个过程写在一行：

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- 如果您想生成一个包含调用图的 PDF 文件：

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### 生成火焰图 {#generating-flame-graph}

`jeprof` 允许您生成用于构建火焰图的折叠堆栈。

您需要使用 `--collapsed` 参数：

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

之后，您可以使用许多不同的工具来可视化折叠堆栈。

最流行的是 [FlameGraph](https://github.com/brendangregg/FlameGraph)，它包含一个名为 `flamegraph.pl` 的脚本：

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

另一个有趣的工具是 [speedscope](https://www.speedscope.app/)，它允许您以更交互的方式分析收集的堆栈。

## 分析器的其他选项 {#additional-options-for-profiler}

`jemalloc` 有许多不同的与分析器相关的选项。可以通过修改 `MALLOC_CONF` 环境变量来控制它们。
例如，可以通过 `lg_prof_sample` 控制分配样本之间的间隔。  
如果您想在每 N 字节时转储堆分析，可以使用 `lg_prof_interval` 开启此功能。  

建议查看 `jemalloc` 的 [参考页面](https://jemalloc.net/jemalloc.3.html)，以获取完整的选项列表。

## 其他资源 {#other-resources}

ClickHouse/Keeper以多种方式暴露与 `jemalloc` 相关的指标。

:::warning 警告
需要注意的是，这些指标之间均未同步，值可能会漂移。
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

包含来自所有区域按不同大小类别（Bins）通过jemalloc分配器进行的内存分配的信息。

[参考](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

所有来自 `asynchronous_metrics` 的 `jemalloc` 相关指标也通过ClickHouse和Keeper的Prometheus端点暴露。

[参考](/operations/server-configuration-parameters/settings#prometheus)

### `jmst` 4LW 命令在 Keeper 中 {#jmst-4lw-command-in-keeper}

Keeper支持 `jmst` 4LW 命令，该命令返回 [基本分配器统计信息](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics)：

```sh
echo jmst | nc localhost 9181
```

---
description: '介绍 ClickHouse 中内存分配分析的页面'
sidebar_label: '内存分配分析'
slug: /operations/allocation-profiling
title: '内存分配分析'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Allocation profiling \{#allocation-profiling\}

ClickHouse 使用 [jemalloc](https://github.com/jemalloc/jemalloc) 作为全局分配器。jemalloc 自带用于分配采样和分析的工具。

ClickHouse 和 Keeper 允许你通过配置、查询设置、`SYSTEM` 命令以及 Keeper 中的 four letter word (4LW) 命令来控制采样。可以通过多种方式检查结果：

- 将样本收集到 `system.trace_log` 中的 `JemallocSample` 类型，以进行按查询分析。
- 通过内置的 [jemalloc web UI](#jemalloc-web-ui)（26.2+）查看实时内存统计信息并获取堆内存分析概要（heap profile）。
- 使用 SQL 直接查询当前堆内存分析概要：[`system.jemalloc_profile_text`](#fetching-heap-profiles-from-sql)（26.2+）。
- 将堆内存分析概要写入磁盘，并使用 [`jeprof`](#analyzing-heap-profile-files-with-jeprof) 进行分析。

:::note

本指南适用于 25.9 及以上版本。
对于更早的版本，请查看[25.9 之前版本的分配分析说明](/operations/allocation-profiling-old.md)。

:::

## 采样内存分配 \{#sampling-allocations\}

如需对内存分配进行采样和分析，请在启动 ClickHouse/Keeper 时启用配置项 `jemalloc_enable_global_profiler`：

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


## 在 `system.trace_log` 中存储 jemalloc 采样数据 \{#storing-jemalloc-samples-in-system-trace-log\}

你可以将 jemalloc 采样数据以 `JemallocSample` 类型存储到 `system.trace_log` 中。
要在全局范围内启用此功能，请使用配置项 `jemalloc_collect_global_profile_samples_in_trace_log`：

```xml
<clickhouse>
    <jemalloc_collect_global_profile_samples_in_trace_log>1</jemalloc_collect_global_profile_samples_in_trace_log>
</clickhouse>
```

:::warning 警告
由于 ClickHouse 是一个内存分配非常密集的应用程序，在 `system.trace&#95;log` 中收集所有样本可能会带来较高负载。
:::

你也可以使用 `jemalloc_collect_profile_samples_in_trace_log` 设置，为单个查询启用该功能。


### 示例：分析查询的内存使用情况 \{#example-analyzing-memory-usage-trace-log\}

首先，启用 jemalloc profiler 运行查询，并将采样数据收集到 `system.trace_log` 中：

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
如果 ClickHouse 启动时已启用 `jemalloc_enable_global_profiler`，则无需再启用 `jemalloc_enable_profiler`。
对于 `jemalloc_collect_global_profile_samples_in_trace_log` 和 `jemalloc_collect_profile_samples_in_trace_log` 也是同样的。
:::

刷新 `system.trace_log`：

```sql
SYSTEM FLUSH LOGS trace_log
```

然后对其执行查询，以获取随时间推移的累计内存使用量：

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

找出内存使用量最高的时间点：

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

基于该结果，查看在峰值时哪些分配调用栈最为活跃：

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


## Jemalloc Web UI \{#jemalloc-web-ui\}

:::note
本节适用于 26.2 及以上版本。
:::

ClickHouse 提供了一个内置的 Web UI，可通过 `/jemalloc` HTTP 端点查看 jemalloc 内存统计信息。
界面使用图表展示实时内存指标，包括已分配、活动、常驻和映射内存，以及按 arena 和按 bin 的统计信息。
还可以直接在该 UI 中获取全局和按查询的堆内存剖析（heap profile）。

要访问它，请在浏览器中打开：

```text
http://localhost:8123/jemalloc
```


## 通过 SQL 获取堆内存分析配置文件 \{#fetching-heap-profiles-from-sql\}

:::note
本节适用于 26.2+ 版本。
:::

`system.jemalloc_profile_text` 系统表允许你直接通过 SQL 获取并查看当前的 jemalloc 堆内存分析配置文件，而无需使用外部工具或先写入磁盘。

该表仅包含一列：

| Column | Type   | Description                     |
| ------ | ------ | ------------------------------- |
| `line` | String | 来自已符号化 jemalloc 堆内存分析配置文件的一行内容。 |

你可以直接对该表执行查询——无需事先将堆内存分析配置文件写入磁盘：

```sql
SELECT * FROM system.jemalloc_profile_text
```


### 输出格式 \{#output-format\}

输出格式由 `jemalloc_profile_text_output_format` 设置控制，它支持三个取值：

* `raw` — 由 jemalloc 生成的原始 heap profile。
* `symbolized` — 含有嵌入函数符号的、与 jeprof 兼容的格式。由于符号已嵌入，`jeprof` 可以在不需要 ClickHouse 可执行文件的情况下对输出进行分析。
* `collapsed`（默认）— 与 FlameGraph 兼容的折叠调用栈格式，每行一个调用栈并附带字节数。

例如，要获取原始 heap profile：

```sql
SELECT * FROM system.jemalloc_profile_text
SETTINGS jemalloc_profile_text_output_format = 'raw'
```

要获取符号化后的输出：

```sql
SELECT * FROM system.jemalloc_profile_text
SETTINGS jemalloc_profile_text_output_format = 'symbolized'
```


### 其他设置 \{#fetching-heap-profiles-settings\}

- `jemalloc_profile_text_symbolize_with_inline`（Bool，默认值：`true`）—— 在符号化时是否包含内联帧。禁用该选项可以显著加快符号化速度，但会降低精度，因为内联函数调用将不会出现在调用栈中。仅影响 `symbolized` 和 `collapsed` 格式。
- `jemalloc_profile_text_collapsed_use_count`（Bool，默认值：`false`）—— 使用 `collapsed` 格式时，按分配次数而不是字节数进行聚合。

### 示例：从 SQL 生成 flame graph（火焰图） \{#example-flamegraph-from-sql\}

由于默认输出格式为 `collapsed`，可以将输出直接通过管道传递给 FlameGraph：

```sh
clickhouse-client -q "SELECT * FROM system.jemalloc_profile_text" | flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

要根据分配次数（而非字节数）生成火焰图：

```sh
clickhouse-client -q "SELECT * FROM system.jemalloc_profile_text SETTINGS jemalloc_profile_text_collapsed_use_count = 1" | flamegraph.pl --color=mem --title="Allocation Count Flame Graph" --width 2400 > result.svg
```


## 将堆内存剖析文件刷新到磁盘 \{#flushing-heap-profiles\}

如果你需要将堆剖析数据保存为文件，以便使用 `jeprof` 进行离线分析，可以将它们刷新到磁盘。

默认情况下，堆剖析文件会生成在 `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap` 中，其中 `_pid_` 是 ClickHouse 的 PID，`_seqnum_` 是当前堆剖析文件的全局序号。
对于 Keeper，默认文件为 `/tmp/jemalloc_keeper._pid_._seqnum_.heap`，并遵循相同规则。

要刷新当前剖析文件：

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

你可以通过在 `MALLOC_CONF` 环境变量中追加 `prof_prefix` 选项来定义不同的存储位置。
例如，如果你希望在 `/data` 目录中生成剖析文件，并将文件名前缀设置为 `my_current_profile`，可以使用如下环境变量来运行 ClickHouse/Keeper：

```sh
MALLOC_CONF=prof_prefix:/data/my_current_profile
```

生成的文件名会在前缀后附加 PID 和序列号。


## 使用 `jeprof` 分析堆内存剖析文件 \{#analyzing-heap-profile-files-with-jeprof\}

在将堆内存剖析数据写入磁盘之后，可以使用 `jemalloc` 提供的工具 [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in) 对其进行分析。它可以通过多种方式安装：

- 使用系统的包管理器
- 克隆 [jemalloc 仓库](https://github.com/jemalloc/jemalloc) 并在根目录运行 `autogen.sh`。这样会在 `bin` 目录中生成 `jeprof` 脚本

有许多可用的输出格式。运行 `jeprof --help` 可以查看完整的选项列表。

### 符号化堆内存剖析数据 \{#symbolized-heap-profiles\}

从 26.1+ 版本开始，当你使用 `SYSTEM JEMALLOC FLUSH PROFILE` 进行刷新时，ClickHouse 会自动生成符号化的堆内存剖析数据。
符号化的剖析文件（扩展名为 `.symbolized`）包含内嵌的函数符号，可以在不需要 ClickHouse 二进制文件的情况下由 `jeprof` 进行分析。

例如，当你运行：

```sql
SYSTEM JEMALLOC FLUSH PROFILE
```

ClickHouse 会返回符号化后的分析概要文件路径（例如 `/tmp/jemalloc_clickhouse.12345.0.heap.symbolized`）。

然后可以直接使用 `jeprof` 对其进行分析：

```sh
jeprof /tmp/jemalloc_clickhouse.12345.0.heap.symbolized --output_format [ > output_file]
```

:::note

**无需二进制文件**：在使用已符号化的剖析文件（`.symbolized` 文件）时，你不需要再向 `jeprof` 提供 ClickHouse 二进制文件的路径。这样就可以更轻松地在不同机器上，或在二进制文件更新之后，对这些剖析数据进行分析。

:::

如果你有较早的未符号化堆内存剖析文件，并且仍然可以访问对应的 ClickHouse 二进制文件，则可以使用传统方式：

```sh
jeprof path/to/clickhouse path/to/heap/profile --output_format [ > output_file]
```

:::note

对于未符号化的剖析结果，`jeprof` 使用 `addr2line` 来生成堆栈跟踪，这个过程可能非常缓慢。
如果遇到这种情况，建议安装该工具的[替代实现](https://github.com/gimli-rs/addr2line)。

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```

或者，`llvm-addr2line` 同样适用（但请注意，`llvm-objdump` 与 `jeprof` 不兼容）。

之后可以像这样使用它：`jeprof --tools addr2line:/usr/bin/llvm-addr2line,nm:/usr/bin/llvm-nm,objdump:/usr/bin/objdump,c++filt:/usr/bin/llvm-cxxfilt`

:::

在比较两个分析概要时，可以使用 `--base` 参数：

```sh
jeprof --base /path/to/first.heap.symbolized /path/to/second.heap.symbolized --output_format [ > output_file]
```


### 示例 \{#examples\}

使用带符号信息的 profile（推荐）：

* 生成一个文本文件，每个过程一行：

```sh
jeprof /tmp/jemalloc_clickhouse.12345.0.heap.symbolized --text > result.txt
```

* 生成包含调用关系图的 PDF 文件：

```sh
jeprof /tmp/jemalloc_clickhouse.12345.0.heap.symbolized --pdf > result.pdf
```

使用未符号化的 profile（需要二进制文件）：

* 生成一个文本文件，每个过程名称占一行：

```sh
jeprof /path/to/clickhouse /tmp/jemalloc_clickhouse.12345.0.heap --text > result.txt
```

* 生成带有调用关系图的 PDF 文件：

```sh
jeprof /path/to/clickhouse /tmp/jemalloc_clickhouse.12345.0.heap --pdf > result.pdf
```


### 生成火焰图 \{#generating-flame-graph\}

`jeprof` 可以生成用于构建火焰图的折叠后调用栈。

需要使用 `--collapsed` 参数：

```sh
jeprof /tmp/jemalloc_clickhouse.12345.0.heap.symbolized --collapsed > result.collapsed
```

或者使用未符号化的剖析概要：

```sh
jeprof /path/to/clickhouse /tmp/jemalloc_clickhouse.12345.0.heap --collapsed > result.collapsed
```

接下来，你可以使用许多不同的工具来可视化折叠后的调用栈。

最常用的是 [FlameGraph](https://github.com/brendangregg/FlameGraph)，其中包含一个名为 `flamegraph.pl` 的脚本：

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

另一个有用的工具是 [speedscope](https://www.speedscope.app/)，它使你能够以更直观、交互的方式分析收集到的调用栈。


## 分析器的其他选项 \{#additional-options-for-profiler\}

`jemalloc` 提供了许多与分析器相关的选项。可以通过设置 `MALLOC_CONF` 环境变量来进行配置。
例如，可以使用 `lg_prof_sample` 控制分配采样之间的间隔。  
如果你希望每分配 N 字节就导出一次堆分析概要，可以通过 `lg_prof_interval` 启用该功能。  

建议查看 `jemalloc` 的[参考页面](https://jemalloc.net/jemalloc.3.html)以获取完整的选项列表。

## 其他资源 \{#other-resources\}

ClickHouse/Keeper 通过多种方式暴露与 `jemalloc` 相关的指标。

:::warning 警告
需要注意的是，这些指标之间并不同步，数值可能会出现偏移。
:::

### 系统表 `asynchronous_metrics` \{#system-table-asynchronous_metrics\}

```sql
SELECT *
FROM system.asynchronous_metrics
WHERE metric LIKE '%jemalloc%'
FORMAT Vertical
```

[参考](/operations/system-tables/asynchronous_metrics)


### 系统表 `jemalloc_bins` \{#system-table-jemalloc_bins\}

包含通过 jemalloc 分配器在不同大小类（bins）中的内存分配情况，这些信息从所有 arena 聚合而来。

[参考](/operations/system-tables/jemalloc_bins)

### 系统表 `jemalloc_stats`（26.2+） \{#system-table-jemalloc_stats\}

以单个字符串形式返回 `malloc_stats_print()` 的完整输出。等价于 `SYSTEM JEMALLOC STATS` 命令。

```sql
SELECT * FROM system.jemalloc_stats
```


### Prometheus \{#prometheus\}

来自 `asynchronous_metrics` 的所有与 `jemalloc` 相关的指标，也会通过 ClickHouse 和 Keeper 中的 Prometheus 端点对外暴露。

[参考](/operations/server-configuration-parameters/settings#prometheus)

### Keeper 中的 `jmst` 4LW 命令 \{#jmst-4lw-command-in-keeper\}

Keeper 支持 `jmst` 4LW 命令，它会返回[基础分配器统计信息](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics)：

```sh
echo jmst | nc localhost 9181
```

---
description: '介绍 ClickHouse 中内存分配分析的页面'
sidebar_label: '25.9 之前版本的内存分配分析'
slug: /operations/allocation-profiling-old
title: '25.9 之前版本的内存分配分析'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 25.9 之前版本的分配分析 \{#allocation-profiling-for-versions-before-259\}

ClickHouse 使用 [jemalloc](https://github.com/jemalloc/jemalloc) 作为其全局分配器。jemalloc 自带了一些用于分配采样和分析的工具。  
为了让分配分析更加方便，除了提供 `SYSTEM` 命令外，还在 Keeper 中提供了四字命令（4LW）。

## 分配采样与堆分析数据刷新 \{#sampling-allocations-and-flushing-heap-profiles\}

如果你想在 `jemalloc` 中对内存分配进行采样和分析，需要通过设置环境变量 `MALLOC_CONF`，在启用分析功能的情况下启动 ClickHouse/Keeper：

```sh
MALLOC_CONF=background_thread:true,prof:true
```

`jemalloc` 会对内存分配进行采样，并在内部存储相关信息。

你可以通过运行以下命令让 `jemalloc` 刷写当前的 profile：

<Tabs groupId="binary">
  <TabItem value="clickhouse" label="ClickHouse">
    ```sql
    SYSTEM JEMALLOC FLUSH PROFILE
    ```
  </TabItem>

  <TabItem value="keeper" label="Keeper">
    ```sh
    echo jmfp | nc localhost 9181
    ```
  </TabItem>
</Tabs>

默认情况下，堆 profile 文件会生成在 `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`，其中 `_pid_` 是 ClickHouse 的 PID，`_seqnum_` 是当前堆 profile 的全局序列号。\
对于 Keeper，默认文件为 `/tmp/jemalloc_keeper._pid_._seqnum_.heap`，规则相同。

可以通过在 `MALLOC_CONF` 环境变量中追加 `prof_prefix` 选项来指定不同的位置。\
例如，如果你希望在 `/data` 目录中生成 profile，并将文件名前缀设置为 `my_current_profile`，可以在运行 ClickHouse/Keeper 时设置如下环境变量：

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```

生成的文件名会在前缀后追加 PID 和序列号。

## 分析堆内存剖析文件 \{#analyzing-heap-profiles\}

生成堆内存剖析文件后，需要对其进行分析。\
为此，可以使用 `jemalloc` 的工具 [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in)。它可以通过多种方式安装：

* 使用系统的包管理器
* 克隆 [jemalloc 代码仓库](https://github.com/jemalloc/jemalloc)，并在根目录下运行 `autogen.sh`。这会在 `bin` 目录中生成 `jeprof` 脚本

:::note
`jeprof` 使用 `addr2line` 来生成调用栈，这个过程可能会非常慢。\
如果出现这种情况，建议安装该工具的[替代实现](https://github.com/gimli-rs/addr2line)。

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```

:::

使用 `jeprof` 可以从堆分析文件生成多种不同的输出格式。
建议运行 `jeprof --help` 来了解该工具的用法以及它提供的各种选项。

一般来说，`jeprof` 命令通常这样使用：

```sh
jeprof 二进制文件路径 堆配置文件路径 --output_format [ > 输出文件]
```

如果你想比较在两个性能分析结果之间新增了哪些内存分配，可以设置 `base` 参数：

```sh
jeprof 二进制文件路径 --base 第一个堆配置文件路径 第二个堆配置文件路径 --output_format [ > 输出文件]
```

### 示例 \{#examples\}

* 如果你想生成一个文本文件，每行写一个存储过程：

```sh
jeprof 二进制文件路径 堆配置文件路径 --text > result.txt
```

* 如果需要生成包含调用图的 PDF 文件：

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### 生成火焰图 \{#generating-flame-graph\}

`jeprof` 可以用来生成用于构建火焰图的折叠堆栈数据。

你需要使用 `--collapsed` 参数：

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

之后，你可以使用许多不同的工具来可视化折叠后的调用栈。

最常用的是 [FlameGraph](https://github.com/brendangregg/FlameGraph)，其中包含一个名为 `flamegraph.pl` 的脚本：

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

另一个值得一提的工具是 [speedscope](https://www.speedscope.app/)，它可以让你以更交互的方式分析采集到的堆栈数据。

## 在运行时控制分配分析器 \{#controlling-allocation-profiler-during-runtime\}

如果在启用分配分析器的情况下启动 ClickHouse/Keeper，则可以在运行时使用额外命令来启用或禁用内存分配分析。
使用这些命令，可以更方便地只在特定时间区间进行分析。

要禁用分析器：

<Tabs groupId="binary">
  <TabItem value="clickhouse" label="ClickHouse">
    ```sql
    SYSTEM JEMALLOC DISABLE PROFILE
    ```
  </TabItem>

  <TabItem value="keeper" label="Keeper">
    ```sh
    echo jmdp | nc localhost 9181
    ```
  </TabItem>
</Tabs>

要启用分析器：

<Tabs groupId="binary">
  <TabItem value="clickhouse" label="ClickHouse">
    ```sql
    SYSTEM JEMALLOC ENABLE PROFILE
    ```
  </TabItem>

  <TabItem value="keeper" label="Keeper">
    ```sh
    echo jmep | nc localhost 9181
    ```
  </TabItem>
</Tabs>

还可以通过设置 `prof_active` 选项来控制分析器的初始状态，该选项默认启用。\
例如，如果不希望在启动期间采样分配，而只在启动完成后开始采样，可以在之后再启用分析器。可以使用以下环境变量来启动 ClickHouse/Keeper：

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

稍后可以启用分析器。

## 分析器的其他选项 \{#additional-options-for-profiler\}

`jemalloc` 提供了许多与分析器相关的选项，可以通过修改 `MALLOC_CONF` 环境变量进行控制。
例如，分配采样之间的间隔可以通过 `lg_prof_sample` 控制。  
如果希望每分配 N 个字节就转储一次堆分析数据，可以通过 `lg_prof_interval` 启用该功能。  

建议查阅 `jemalloc` 的[参考页面](https://jemalloc.net/jemalloc.3.html)以获取完整的选项列表。

## 其他资源 \{#other-resources\}

ClickHouse/Keeper 通过多种不同方式公开与 `jemalloc` 相关的指标。

:::warning 警告
需要注意的是，这些指标彼此之间并不同步，数值可能会产生漂移。
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

包含通过 jemalloc 内存分配器在不同大小类别（bins）中进行的内存分配情况，这些信息是从所有 arena 聚合而来的。

[参考](/operations/system-tables/jemalloc_bins)

### Prometheus \{#prometheus\}

来自 `asynchronous_metrics` 的所有与 `jemalloc` 相关的指标也会在 ClickHouse 和 Keeper 中通过 Prometheus 端点对外暴露。

[参考](/operations/server-configuration-parameters/settings#prometheus)

### Keeper 中的 `jmst` 4LW 命令 \{#jmst-4lw-command-in-keeper\}

Keeper 支持 `jmst` 4LW 命令，该命令返回[基础的分配器统计数据](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics)：

```sh
echo jmst | nc localhost 9181
```

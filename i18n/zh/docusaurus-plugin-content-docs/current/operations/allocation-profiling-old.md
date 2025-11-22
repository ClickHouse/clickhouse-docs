---
description: '介绍 ClickHouse 中内存分配分析的页面'
sidebar_label: '25.9 之前版本的内存分配分析'
slug: /operations/allocation-profiling-old
title: '25.9 之前版本的内存分配分析'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 25.9 之前版本的内存分配剖析

ClickHouse 使用 [jemalloc](https://github.com/jemalloc/jemalloc) 作为其全局内存分配器。jemalloc 提供了一些用于分配采样和剖析的工具。  
为了让内存分配剖析更加便捷，提供了 `SYSTEM` 命令，以及 Keeper 中的四字母词（4LW）命令。



## 采样内存分配并刷新堆分析文件 {#sampling-allocations-and-flushing-heap-profiles}

如果您想要在 `jemalloc` 中采样和分析内存分配,需要使用环境变量 `MALLOC_CONF` 启用分析功能来启动 ClickHouse/Keeper:

```sh
MALLOC_CONF=background_thread:true,prof:true
```

`jemalloc` 将对内存分配进行采样并在内部存储相关信息。

您可以通过运行以下命令来指示 `jemalloc` 刷新当前的分析文件:

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

默认情况下,堆分析文件将生成在 `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`,其中 `_pid_` 是 ClickHouse 的进程 ID,`_seqnum_` 是当前堆分析文件的全局序列号。  
对于 Keeper,默认文件为 `/tmp/jemalloc_keeper._pid_._seqnum_.heap`,遵循相同的规则。

可以通过在 `MALLOC_CONF` 环境变量中添加 `prof_prefix` 选项来指定不同的位置。  
例如,如果您想在 `/data` 文件夹中生成分析文件,并将文件名前缀设置为 `my_current_profile`,可以使用以下环境变量运行 ClickHouse/Keeper:

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```

生成的文件名将在前缀后附加进程 ID 和序列号。


## 分析堆分析文件 {#analyzing-heap-profiles}

生成堆分析文件后,需要对其进行分析。
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

:::

使用 `jeprof` 可以从堆分析文件生成多种不同的格式。
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


## 在运行时控制内存分配分析器 {#controlling-allocation-profiler-during-runtime}

如果 ClickHouse/Keeper 在启用分析器的情况下启动,则支持在运行时禁用/启用内存分配分析的附加命令。
使用这些命令,可以更方便地仅对特定时间段进行分析。

禁用分析器:

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

启用分析器:

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

还可以通过设置 `prof_active` 选项来控制分析器的初始状态,该选项默认为启用。  
例如,如果您不希望在启动期间采样内存分配,而只想在启动后进行采样,可以启用分析器。您可以使用以下环境变量启动 ClickHouse/Keeper:

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

分析器可以在稍后启用。


## 性能分析器的其他选项 {#additional-options-for-profiler}

`jemalloc` 提供了许多与性能分析器相关的选项,可以通过修改 `MALLOC_CONF` 环境变量来控制。
例如,可以使用 `lg_prof_sample` 控制内存分配采样的间隔。  
如果您想每分配 N 字节就转储一次堆配置文件,可以使用 `lg_prof_interval` 启用此功能。

建议查看 `jemalloc` 的[参考页面](https://jemalloc.net/jemalloc.3.html)以获取完整的选项列表。


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

`asynchronous_metrics` 中所有 `jemalloc` 相关指标也通过 ClickHouse 和 Keeper 的 Prometheus 端点公开。

[参考文档](/operations/server-configuration-parameters/settings#prometheus)

### Keeper 中的 `jmst` 4LW 命令 {#jmst-4lw-command-in-keeper}

Keeper 支持 `jmst` 4LW 命令,该命令返回[基本分配器统计信息](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics):

```sh
echo jmst | nc localhost 9181
```

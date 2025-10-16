---
'description': '页面详细介绍 ClickHouse 中的分配分析'
'sidebar_label': '版本 25.9 之前的分配分析'
'slug': '/operations/allocation-profiling-old'
'title': '版本 25.9 之前的分配分析'
'doc_type': 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 25.9 之前版本的分配分析

ClickHouse 使用 [jemalloc](https://github.com/jemalloc/jemalloc) 作为其全局分配器。 Jemalloc 附带一些用于分配采样和分析的工具。  
为了让分配分析更加方便，提供了 `SYSTEM` 命令以及 Keeper 中的 4 个字母命令（4LW）。

## 采样分配和刷新堆分析 {#sampling-allocations-and-flushing-heap-profiles}

如果您想要在 `jemalloc` 中进行分配采样和分析，您需要使用环境变量 `MALLOC_CONF` 启动带有分析功能的 ClickHouse/Keeper：

```sh
MALLOC_CONF=background_thread:true,prof:true
```

`jemalloc` 将采样分配并在内部存储信息。

您可以通过运行以下命令来通知 `jemalloc` 刷新当前分析：

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

默认情况下，堆分析文件将生成在 `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`，其中 `_pid_` 是 ClickHouse 的 PID，而 `_seqnum_` 是当前堆分析的全局序列号。  
对于 Keeper，默认文件为 `/tmp/jemalloc_keeper._pid_._seqnum_.heap`，并遵循相同规则。

可以通过将 `prof_prefix` 选项附加到 `MALLOC_CONF` 环境变量来定义不同的位置。  
例如，如果您希望在 `/data` 文件夹中生成文件名前缀为 `my_current_profile` 的分析文件，您可以使用以下环境变量启动 ClickHouse/Keeper：

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```

生成的文件将附加到前缀 PID 和序列号。

## 分析堆分析 {#analyzing-heap-profiles}

生成堆分析后，需要进行分析。  
为此，可以使用 `jemalloc` 的工具 [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in)。可以通过多种方式安装它：
- 使用系统的包管理器
- 克隆 [jemalloc 仓库](https://github.com/jemalloc/jemalloc) 并从根文件夹运行 `autogen.sh`。这将为您提供在 `bin` 文件夹中的 `jeprof` 脚本

:::note
`jeprof` 使用 `addr2line` 来生成堆栈跟踪，这可能会非常慢。  
如果是这种情况，建议安装工具的 [替代实现](https://github.com/gimli-rs/addr2line)。

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```
:::

使用 `jeprof` 从堆分析中生成的格式有很多种。  
建议运行 `jeprof --help` 获取关于工具的用法和各种选项的信息。

一般来说，`jeprof` 命令的用法如下：

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

如果您想要比较两个分析之间发生的分配，可以设置 `base` 参数：

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

### 示例 {#examples}

- 如果您想生成一个文本文件，每个过程写在一行：

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- 如果您想生成一个带有调用图的 PDF 文件：

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### 生成火焰图 {#generating-flame-graph}

`jeprof` 允许您生成用于构建火焰图的折叠堆栈。

您需要使用 `--collapsed` 参数：

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

之后，您可以使用多种不同的工具来可视化折叠堆栈。

最流行的是 [FlameGraph](https://github.com/brendangregg/FlameGraph)，其中包含名为 `flamegraph.pl` 的脚本：

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

另一种有趣的工具是 [speedscope](https://www.speedscope.app/)，它允许您以更交互的方式分析收集到的堆栈。

## 在运行时控制分配分析器 {#controlling-allocation-profiler-during-runtime}

如果带分析功能启动 ClickHouse/Keeper，支持在运行时禁用/启用分配分析的额外命令。  
使用这些命令，仅分析特定时间段的难度更小。

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

还可以通过设置 `prof_active` 选项来控制分析器的初始状态，默认情况下该选项是启用的。  
例如，如果您希望在启动时不采样分配，而只在之后才采样，您可以启用分析器。您可以使用以下环境变量启动 ClickHouse/Keeper：

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

可以在之后启用分析器。

## 分析器的附加选项 {#additional-options-for-profiler}

`jemalloc` 有许多不同的与分析器相关的选项。可以通过修改 `MALLOC_CONF` 环境变量来控制它们。  
例如，分配采样之间的间隔可以使用 `lg_prof_sample` 控制。  
如果您希望每 N 字节转储堆分析，可以使用 `lg_prof_interval` 启用它。

建议查看 `jemalloc` 的 [参考页面](https://jemalloc.net/jemalloc.3.html) 以获取完整的选项列表。

## 其他资源 {#other-resources}

ClickHouse/Keeper 以多种方式公开 `jemalloc` 相关指标。

:::warning 警告
请注意，这些指标之间未进行同步，值可能会有漂移。
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

包含通过 jemalloc 分配器在不同大小类（bins）中完成的内存分配的信息，汇总自所有区域。

[参考](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

所有来自 `asynchronous_metrics` 的 `jemalloc` 相关指标也通过 ClickHouse 和 Keeper 的 Prometheus 端点公开。

[参考](/operations/server-configuration-parameters/settings#prometheus)

### Keeper 中的 `jmst` 4LW 命令 {#jmst-4lw-command-in-keeper}

Keeper 支持 `jmst` 4LW 命令，该命令返回 [基本分配器统计信息](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics)：

```sh
echo jmst | nc localhost 9181
```

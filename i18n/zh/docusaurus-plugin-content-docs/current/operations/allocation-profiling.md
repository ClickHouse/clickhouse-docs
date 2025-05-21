---
'description': 'Page detailing allocation profiling in ClickHouse'
'sidebar_label': '分配配置'
'slug': '/operations/allocation-profiling'
'title': 'Allocation profiling'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 内存分配剖析

ClickHouse 使用 [jemalloc](https://github.com/jemalloc/jemalloc) 作为其全局分配器，并附带一些分配采样和剖析工具。  
为了方便内存分配剖析，`SYSTEM` 命令与 Keeper 中的 4LW 命令一起提供。

## 采样分配和清空堆剖析 {#sampling-allocations-and-flushing-heap-profiles}

如果我们想要在 `jemalloc` 中进行分配的采样和剖析，我们需要通过设置环境变量 `MALLOC_CONF` 启用剖析来启动 ClickHouse/Keeper。

```sh
MALLOC_CONF=background_thread:true,prof:true
```

`jemalloc` 将采样分配并在内部存储信息。

我们可以通过运行以下命令来告诉 `jemalloc` 清空当前的剖析：

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC FLUSH PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmfp | nc localhost 9181

</TabItem>
</Tabs>

默认情况下，堆剖析文件将在 `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap` 生成，其中 `_pid_` 是 ClickHouse 的 PID，`_seqnum_` 是当前堆剖析的全局序列号。  
对于 Keeper，默认文件为 `/tmp/jemalloc_keeper._pid_._seqnum_.heap`，遵循相同的规则。

可以通过追加 `prof_prefix` 选项来定义不同的存储位置，作为 `MALLOC_CONF` 环境变量的一部分。  
例如，如果我们想要在 `/data` 文件夹中生成剖析文件，并且文件名前缀为 `my_current_profile`，我们可以以以下环境变量启动 ClickHouse/Keeper：
```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```
生成的文件将附加上前缀 PID 和序列号。

## 分析堆剖析 {#analyzing-heap-profiles}

在生成堆剖析后，我们需要对其进行分析。  
为此，我们需要使用 `jemalloc` 的工具 [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in)，该工具可以通过多种方式安装：
- 使用系统的包管理器安装 `jemalloc`
- 克隆 [jemalloc repo](https://github.com/jemalloc/jemalloc) 并从根目录运行 autogen.sh，这样可以在 `bin` 文件夹中提供 `jeprof` 脚本

:::note
`jeprof` 使用 `addr2line` 生成堆栈跟踪，这可能会非常慢。  
如果情况如此，我们建议安装该工具的 [替代实现](https://github.com/gimli-rs/addr2line)。

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```
:::

可以通过 `jeprof` 从堆剖析生成许多不同的格式。
我们建议运行 `jeprof --help` 来检查用法和该工具提供的许多不同选项。 

通常，`jeprof` 命令将如下所示：

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

如果我们想要比较两个剖析之间的分配情况，可以设置基数参数：

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

例如：

- 如果我们想生成一个文本文件，每个过程按行书写：

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- 如果我们想生成一个带有调用图的 PDF 文件：

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### 生成火焰图 {#generating-flame-graph}

`jeprof` 允许我们生成用于构建火焰图的折叠栈。

我们需要使用 `--collapsed` 参数：

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

之后，我们可以使用许多不同的工具来可视化折叠栈。

最受欢迎的是 [FlameGraph](https://github.com/brendangregg/FlameGraph)，它包含一个名为 `flamegraph.pl` 的脚本：

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

另一个有趣的工具是 [speedscope](https://www.speedscope.app/)，它允许您以更互动的方式分析收集到的堆栈。

## 运行时控制分配剖析器 {#controlling-allocation-profiler-during-runtime}

如果 ClickHouse/Keeper 使用启用剖析器启动，它们支持在运行时禁用/启用分配剖析的额外命令。  
使用这些命令，可以更轻松地仅针对特定时间段进行剖析。

禁用剖析器：

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC DISABLE PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmdp | nc localhost 9181

</TabItem>
</Tabs>

启用剖析器：

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC ENABLE PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmep | nc localhost 9181

</TabItem>
</Tabs>

还可以通过设置 `prof_active` 选项来控制剖析器的初始状态，该选项默认启用。  
例如，如果我们不想在启动时采样分配，而只想在启用剖析器后进行采样，我们可以使用以下环境变量启动 ClickHouse/Keeper：
```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

并在稍后启用剖析器。

## 剖析器的附加选项 {#additional-options-for-profiler}

`jemalloc` 有许多与剖析器相关的不同选项，可以通过修改 `MALLOC_CONF` 环境变量来控制。
例如，分配样本之间的间隔可以通过 `lg_prof_sample` 控制。  
如果您希望每 N 字节转储堆剖析，可以使用 `lg_prof_interval` 启用此功能。

我们建议检查 `jemalloc` 的 [参考页面](https://jemalloc.net/jemalloc.3.html) 以获取此类选项。

## 其他资源 {#other-resources}

ClickHouse/Keeper 通过多种方式公开与 `jemalloc` 相关的指标。

:::warning 警告
需注意，这些指标之间没有同步，值可能会漂移。
:::

### 系统表 `asynchronous_metrics` {#system-table-asynchronous_metrics}

```sql
SELECT *
FROM system.asynchronous_metrics
WHERE metric ILIKE '%jemalloc%'
FORMAT Vertical
```

[参考](/operations/system-tables/asynchronous_metrics)

### 系统表 `jemalloc_bins` {#system-table-jemalloc_bins}

包含通过 jemalloc 分配器在不同大小类别（分箱）中进行的内存分配的信息，这些信息是从所有区域汇总而来的。

[参考](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

所有来自 `asynchronous_metrics` 的与 `jemalloc` 相关的指标也通过 ClickHouse 和 Keeper 中的 Prometheus 端点公开。

[参考](/operations/server-configuration-parameters/settings#prometheus)

### `jmst` 4LW 命令在 Keeper 中 {#jmst-4lw-command-in-keeper}

Keeper 支持 `jmst` 4LW 命令，返回 [基本分配器统计信息](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics)。

示例：
```sh
echo jmst | nc localhost 9181
```

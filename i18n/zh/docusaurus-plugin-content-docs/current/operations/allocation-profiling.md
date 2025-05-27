---
'description': '页面详细说明了 ClickHouse 中的分配分析'
'sidebar_label': '分配分析'
'slug': '/operations/allocation-profiling'
'title': '分配分析'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 分配配置文件

ClickHouse 使用 [jemalloc](https://github.com/jemalloc/jemalloc) 作为其全局分配器，并提供了一些用于分配采样和分析的工具。  
为便于分配分析， `SYSTEM` 命令与 Keeper 中的 4LW 命令一起提供。

## 采样分配和刷新堆配置文件 {#sampling-allocations-and-flushing-heap-profiles}

如果我们想要在 `jemalloc` 中进行分配采样和分析，我们需要通过启用环境变量 `MALLOC_CONF` 来启动 ClickHouse/Keeper。

```sh
MALLOC_CONF=background_thread:true,prof:true
```

`jemalloc` 将对分配进行采样并在内部存储该信息。

我们可以通过运行以下命令来告诉 `jemalloc` 刷新当前配置文件：

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC FLUSH PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmfp | nc localhost 9181

</TabItem>
</Tabs>

默认情况下，堆配置文件将生成在 `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap` 目录，其中 `_pid_` 是 ClickHouse 的 PID，`_seqnum_` 是当前堆配置文件的全局序列号。  
对于 Keeper，默认文件为 `/tmp/jemalloc_keeper._pid_._seqnum_.heap`，规则相同。

可以通过将 `MALLOC_CONF` 环境变量与 `prof_prefix` 选项一起附加来定义不同的位置。  
例如，如果我们想在 `/data` 文件夹中生成配置文件，且文件名前缀为 `my_current_profile`，我们可以使用以下环境变量启动 ClickHouse/Keeper：
```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```
生成的文件将附加 PID 和序列号到前缀中。

## 分析堆配置文件 {#analyzing-heap-profiles}

在生成堆配置文件后，我们需要对其进行分析。  
为此，我们需要使用 `jemalloc` 的工具 [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in)，该工具可以通过多种方式安装：
- 使用系统的包管理器安装 `jemalloc`
- 克隆 [jemalloc 仓库](https://github.com/jemalloc/jemalloc) 并在根目录下运行 autogen.sh，这将为您提供 `bin` 文件夹中的 `jeprof` 脚本

:::note
`jeprof` 使用 `addr2line` 来生成栈跟踪，可能会非常慢。  
如果是这种情况，我们建议安装该工具的 [替代实现](https://github.com/gimli-rs/addr2line)。

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```
:::

使用 `jeprof` 从堆配置文件生成不同格式的文件是有很多种选择的。  
我们建议运行 `jeprof --help` 检查用法和该工具提供的多种不同选项。

通常，`jeprof` 命令的格式如下：

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

如果我们想比较两个配置文件之间发生了哪些分配，可以设置基参数：

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

例如：

- 如果我们想生成一个文本文件，每个过程占一行：

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- 如果我们想生成一个包含调用图的 PDF 文件：

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### 生成火焰图 {#generating-flame-graph}

`jeprof` 允许我们生成以折叠栈构建火焰图。

我们需要使用 `--collapsed` 参数：

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

之后，我们可以使用许多不同工具来可视化折叠的栈。

最流行的工具是 [FlameGraph](https://github.com/brendangregg/FlameGraph)，它包含一个名为 `flamegraph.pl` 的脚本：

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

另一个有趣的工具是 [speedscope](https://www.speedscope.app/)，它允许您以更交互的方式分析收集到的栈。

## 运行时控制分配分析器 {#controlling-allocation-profiler-during-runtime}

如果 ClickHouse/Keeper 在启用分析器的情况下启动，它们支持在运行时禁用/启用分配分析的附加命令。  
使用这些命令，可以更轻松地分析特定的时间间隔。

禁用分析器：

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC DISABLE PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmdp | nc localhost 9181

</TabItem>
</Tabs>

启用分析器：

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC ENABLE PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmep | nc localhost 9181

</TabItem>
</Tabs>

还可以通过设置 `prof_active` 选项来控制分析器的初始状态，该选项默认是启用的。  
例如，如果我们不想在启动期间采样分配，只想在启用分析器后进行采样，我们可以使用以下环境变量启动 ClickHouse/Keeper：
```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

并在后面的某个时间启用分析器。

## 分析器的附加选项 {#additional-options-for-profiler}

`jemalloc` 提供了许多与分析器相关的选项，可以通过修改 `MALLOC_CONF` 环境变量来控制。  
例如，可以使用 `lg_prof_sample` 控制分配样本之间的间隔。  
如果您想在每 N 字节时转储堆配置文件，可以使用 `lg_prof_interval` 启用它。

我们建议查看 `jemalloc` 的 [参考页面](https://jemalloc.net/jemalloc.3.html) 以获取这些选项。

## 其他资源 {#other-resources}

ClickHouse/Keeper 以多种方式暴露与 `jemalloc` 相关的度量。

:::warning 警告
需注意，这些度量之间没有同步，值可能会漂移。
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

包含通过 jemalloc 分配器在不同大小类别（bins）中进行的内存分配的信息，这些信息是在所有区域汇总的。

[参考](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

所有源自 `asynchronous_metrics` 的 `jemalloc` 相关指标也通过 ClickHouse 和 Keeper 中的 Prometheus 端点暴露。

[参考](/operations/server-configuration-parameters/settings#prometheus)

### Keeper 中的 `jmst` 4LW 命令 {#jmst-4lw-command-in-keeper}

Keeper 支持 `jmst` 4LW 命令，返回 [基本分配器统计信息](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics)。

示例：
```sh
echo jmst | nc localhost 9181
```

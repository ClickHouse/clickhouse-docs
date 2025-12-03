---
description: '如何构建 ClickHouse 并使用 DEFLATE_QPL 编解码器进行基准测试'
sidebar_label: '构建和基准测试 DEFLATE_QPL'
sidebar_position: 73
slug: /development/building_and_benchmarking_deflate_qpl
title: '使用 DEFLATE_QPL 构建 ClickHouse'
doc_type: 'guide'
---



# 使用 DEFLATE_QPL 构建 ClickHouse {#build-clickhouse-with-deflate_qpl}

- 请确保你的主机符合 QPL 所需的[先决条件](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#prerequisites)
- 在使用 CMake 构建时，`deflate_qpl` 默认是启用的。如果你不小心修改了该设置，请再次确认构建标志：`ENABLE_QPL=1`

- 有关通用构建要求，请参阅 ClickHouse 的[通用构建说明](/development/build.md)



# 使用 DEFLATE_QPL 运行基准测试 {#run-benchmark-with-deflate_qpl}



## 文件列表 {#files-list}

[qpl-cmake](https://github.com/ClickHouse/ClickHouse/tree/master/contrib/qpl-cmake) 下的 `benchmark_sample` 目录提供了使用 Python 脚本运行基准测试的示例：

`client_scripts` 中包含用于运行典型基准测试的 Python 脚本，例如：
- `client_stressing_test.py`：用于在 [1~4] 个服务器实例上进行查询压力测试的 Python 脚本。
- `queries_ssb.sql`：列出了 [Star Schema Benchmark](/getting-started/example-datasets/star-schema/) 的所有查询。
- `allin1_ssb.sh`：用于自动一键执行完整基准测试工作流的 shell 脚本。

`database_files` 目录用于根据 lz4/deflate/zstd 编解码器存储数据库文件。



## 自动运行星型模式基准测试： {#run-benchmark-automatically-for-star-schema}

```bash
$ cd ./benchmark_sample/client_scripts
$ sh run_ssb.sh
```

完成后，请检查该文件夹中的所有结果：`./output/`

如果出现失败，请按照下文各节中的说明手动运行基准测试。


## 定义 {#definition}

[CLICKHOUSE_EXE] 指 ClickHouse 可执行程序的路径。



## 环境 {#environment}

* CPU：Sapphire Rapids
* 操作系统要求请参阅 [System Requirements for QPL](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#system-requirements)
* IAA 配置请参阅 [Accelerator Configuration](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration)
* 安装 Python 模块：

```bash
pip3 install clickhouse_driver numpy
```

[IAA 自检]

```bash
$ accel-config list | grep -P 'iax|state'
```

期望输出如下：

```bash
    "dev":"iax1",
    "state":"已启用",
            "state":"已启用",
```

如果没有任何输出，说明 IAA 尚未就绪。请重新检查 IAA 的配置。


## 生成原始数据 {#generate-raw-data}

```bash
$ cd ./benchmark_sample
$ mkdir rawdata_dir && cd rawdata_dir
```

使用 [`dbgen`](/getting-started/example-datasets/star-schema) 并通过以下参数生成 1 亿行数据：
-s 20

预计会在 `./benchmark_sample/rawdata_dir/ssb-dbgen` 目录下生成类似 `*.tbl` 的文件：


## 数据库配置 {#database-setup}

将数据库配置为使用 LZ4 编解码器

```bash
$ cd ./database_dir/lz4
$ [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

此时你应在控制台中看到 `Connected to ClickHouse server` 这条消息，这表明客户端已成功与服务器建立连接。

完成 [Star Schema Benchmark](/getting-started/example-datasets/star-schema) 中提到的以下三个步骤：

* 在 ClickHouse 中创建表
* 插入数据。这里应使用 `./benchmark_sample/rawdata_dir/ssb-dbgen/*.tbl` 作为输入数据。
* 将“星型模式”（star schema）转换为反规范化的“扁平模式”（flat schema）

使用 IAA Deflate 编解码器配置数据库

```bash
$ cd ./database_dir/deflate
$ [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

完成与上文 lz4 相同的三个步骤

使用 ZSTD 编解码器配置数据库

```bash
$ cd ./database_dir/zstd
$ [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

完成与上文 lz4 相同的三个步骤。

[self-check]
对于每种编解码器（lz4/zstd/deflate），请执行以下查询以验证数据库是否已成功创建：

```sql
SELECT count() FROM lineorder_flat
```

你应该会看到如下输出：

```sql
┌───count()─┐
│ 119994608 │
└───────────┘
```

[IAA Deflate 编解码器自检]

当你首次从客户端执行插入或查询操作时，ClickHouse 服务器控制台应输出如下日志：

```text
硬件加速 DeflateQpl 编解码器已就绪！
```

如果你始终没有看到这条日志，而是看到了如下所示的另一条日志：

```text
硬件辅助 DeflateQpl 编解码器初始化失败
```

这表示 IAA 设备尚未准备就绪，你需要重新检查 IAA 的配置。


## 使用单实例进行基准测试 {#benchmark-with-single-instance}

* 在开始基准测试之前，请禁用 C6，并将 CPU 频率调节策略设置为 `performance`

```bash
$ cpupower idle-set -d 3
$ cpupower frequency-set -g performance
```

* 为了消除跨 CPU 插槽访问时内存瓶颈的影响，我们使用 `numactl` 将服务端绑定到一个插槽、客户端绑定到另一个插槽。
* 单实例指的是单个服务端连接单个客户端。

现在分别运行 LZ4/Deflate/ZSTD 的基准测试：

LZ4：

```bash
$ cd ./database_dir/lz4 
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > lz4.log
```

IAA deflate：

```bash
$ cd ./database_dir/deflate
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > deflate.log
```

ZSTD:

```bash
$ cd ./database_dir/zstd
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > zstd.log
```

现在应该能按预期输出三条日志：

```text
lz4.log
deflate.log
zstd.log
```

如何检查性能指标：

我们主要关注 QPS，请搜索关键字 `QPS_Final` 并收集统计数据。


## 使用多实例进行基准测试 {#benchmark-with-multi-instances}

* 为了减小过多线程导致的内存瓶颈影响，建议使用多实例来运行基准测试。
* 多实例是指在多台（2 或 4 台）服务器上分别连接各自的客户端。
* 需要将一个 socket 上的核心数平均划分，并分别分配给各个服务器。
* 对于多实例，必须为每种 codec 创建一个新的目录，并按照与单实例类似的步骤插入数据集。

这里有 2 点不同：

* 在客户端侧，你需要在建表和插入数据时，以分配好的端口来启动 ClickHouse。
* 在服务端侧，你需要使用已指定端口的特定 XML 配置文件来启动 ClickHouse。所有用于多实例的自定义 XML 配置文件已在 ./server&#95;config 目录下提供。

这里我们假设每个 socket 有 60 个核心，并以 2 个实例为例。
启动第一个实例的服务端
LZ4:

```bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
```

ZSTD：

```bash
$ cd ./database_dir/zstd
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
```

IAA Deflate（基于 IAA 的 Deflate 压缩）：

```bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
```

[为第二个实例启动服务器]

LZ4：

```bash
$ cd ./database_dir && mkdir lz4_s2 && cd lz4_s2
$ cp ../../server_config/config_lz4_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_lz4_s2.xml >&/dev/null&
```

ZSTD：

```bash
$ cd ./database_dir && mkdir zstd_s2 && cd zstd_s2
$ cp ../../server_config/config_zstd_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_zstd_s2.xml >&/dev/null&
```

IAA Deflate：

```bash
$ cd ./database_dir && mkdir deflate_s2 && cd deflate_s2
$ cp ../../server_config/config_deflate_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
```

为第二个实例创建表并插入数据

创建表：

```bash
$ [CLICKHOUSE_EXE] client -m --port=9001 
```

插入数据：

```bash
$ [CLICKHOUSE_EXE] client --query "INSERT INTO [TBL_FILE_NAME] FORMAT CSV" < [TBL_FILE_NAME].tbl  --port=9001
```

* [TBL&#95;FILE&#95;NAME] 表示文件名，文件名需要匹配如下正则表达式：`*.tbl`，位于 `./benchmark_sample/rawdata_dir/ssb-dbgen` 目录下。
* `--port=9001` 表示为该 server 实例分配的端口，该端口也在 config&#95;lz4&#95;s2.xml/config&#95;zstd&#95;s2.xml/config&#95;deflate&#95;s2.xml 中进行了定义。对于更多实例，你需要将其替换为 9002 或 9003，这两个值分别对应 s3/s4 实例。如果你未显式指定该参数，则默认端口为 9000，该端口已经被第一个实例占用。

使用 2 个实例进行基准测试

LZ4：

```bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./database_dir/lz4_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_lz4_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2  > lz4_2insts.log
```

ZSTD：


```bash
$ cd ./database_dir/zstd
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ cd ./database_dir/zstd_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_zstd_s2.xml >&/dev/null& 
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > zstd_2insts.log
```

IAA Deflate 压缩

```bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./database_dir/deflate_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > deflate_2insts.log
```

这里 client&#95;stressing&#95;test.py 的最后一个参数 `2` 表示实例数量。若需要更多实例，请将其改为 3 或 4。该脚本最多支持 4 个实例。

现在应该会按预期输出三条日志：

```text
lz4_2insts.log
deflate_2insts.log
zstd_2insts.log
```

如何检查性能指标：

我们重点关注 QPS，请搜索关键字 `QPS_Final` 并收集统计数据。

4 个实例的基准测试设置与上述 2 个实例的类似。
我们建议使用 2 个实例的基准测试数据作为最终报告的评审依据。


## 提示 {#tips}

每次启动新的 ClickHouse 服务器之前，请确保没有 ClickHouse 后台进程在运行。请检查并终止旧进程：

```bash
$ ps -aux| grep clickhouse
$ kill -9 [PID]
```

通过将 ./client&#95;scripts/queries&#95;ssb.sql 中的查询列表与官方的 [Star Schema Benchmark](/getting-started/example-datasets/star-schema) 进行比较，你会发现有 3 条查询未被包含：Q1.2/Q1.3/Q3.4。这是因为这些查询的 CPU 利用率非常低（&lt; 10%），不足以体现性能差异。

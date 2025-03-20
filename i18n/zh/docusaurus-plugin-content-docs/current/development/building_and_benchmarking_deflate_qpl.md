---
slug: /development/building_and_benchmarking_deflate_qpl
sidebar_position: 73
sidebar_label: 构建和基准测试 DEFLATE_QPL
description: 如何构建 Clickhouse 并运行基准测试与 DEFLATE_QPL 编解码器
---


# 使用 DEFLATE_QPL 构建 Clickhouse

- 确保您的主机机器满足 QPL 所需的 [先决条件](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#prerequisites)
- deflate_qpl 在 cmake 构建过程中默认启用。如果您意外更改了它，请仔细检查构建标志： ENABLE_QPL=1

- 有关通用要求，请参见 Clickhouse 的通用 [构建说明](/development/build.md)


# 使用 DEFLATE_QPL 运行基准测试

## 文件列表 {#files-list}

`benchmark_sample` 文件夹下的 [qpl-cmake](https://github.com/ClickHouse/ClickHouse/tree/master/contrib/qpl-cmake) 提供了使用 Python 脚本运行基准测试的示例：

`client_scripts` 包含用于运行典型基准测试的 Python 脚本，例如：
- `client_stressing_test.py`：用于查询压力测试的 Python 脚本，支持 [1~4] 个服务器实例。
- `queries_ssb.sql`：该文件列出所有 [星型模式基准测试](/getting-started/example-datasets/star-schema/) 的查询。
- `allin1_ssb.sh`：此 Shell 脚本自动执行所有基准测试工作流。

`database_files` 表示将根据 lz4/deflate/zstd 编解码器存储数据库文件。

## 自动运行星型模式基准测试： {#run-benchmark-automatically-for-star-schema}

``` bash
$ cd ./benchmark_sample/client_scripts
$ sh run_ssb.sh
```

完成后，请检查此文件夹中的所有结果:`./output/`

如果遇到失败，请手动按照以下部分运行基准测试。

## 定义 {#definition}

[CLICKHOUSE_EXE] 表示 clickhouse 执行程序的路径。

## 环境 {#environment}

- CPU: Sapphire Rapid
- 操作系统要求请参见 [QPL 的系统要求](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#system-requirements)
- IAA 设置请参阅 [加速器配置](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration)
- 安装 Python 模块：

``` bash
pip3 install clickhouse_driver numpy
```

[IAA 自检]

``` bash
$ accel-config list | grep -P 'iax|state'
```

预期输出如下：
``` bash
    "dev":"iax1",
    "state":"enabled",
            "state":"enabled",
```

如果没有输出，意味着 IAA 尚未准备好工作。请再次检查 IAA 设置。

## 生成原始数据 {#generate-raw-data}

``` bash
$ cd ./benchmark_sample
$ mkdir rawdata_dir && cd rawdata_dir
```

使用 [`dbgen`](/getting-started/example-datasets/star-schema) 生成 1 亿行数据，参数为：
-s 20

期望在 `./benchmark_sample/rawdata_dir/ssb-dbgen` 下输出如 `*.tbl` 的文件：

## 数据库设置 {#database-setup}

使用 LZ4 编解码器设置数据库

``` bash
$ cd ./database_dir/lz4
$ [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

在此处，您应从控制台看到消息 `Connected to ClickHouse server`，这意味着客户端成功与服务器建立连接。

完成 [星型模式基准测试](/getting-started/example-datasets/star-schema) 中提到的以下三步
- 在 ClickHouse 中创建表
- 插入数据。这里应使用 `./benchmark_sample/rawdata_dir/ssb-dbgen/*.tbl` 作为输入数据。
- 将“星型模式”转换为非规范化的“扁平模式”

使用 IAA Deflate 编解码器设置数据库

``` bash
$ cd ./database_dir/deflate
$ [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
完成与 above lz4 相同的三步

使用 ZSTD 编解码器设置数据库

``` bash
$ cd ./database_dir/zstd
$ [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
完成与 above lz4 相同的三步

[自检]
对于每个编解码器（lz4/zstd/deflate），请执行以下查询以确保数据库成功创建：
```sql
select count() from lineorder_flat
```
您期望看到以下输出：
```sql
┌───count()─┐
│ 119994608 │
└───────────┘
```
[IAA Deflate 编解码器的自检]

首次从客户端执行插入或查询时，clickhouse 服务器控制台应预期打印以下日志：
```text
Hardware-assisted DeflateQpl codec is ready!
```
如果您没有看到此日志，而是看到以下日志：
```text
Initialization of hardware-assisted DeflateQpl codec failed
```
这意味着 IAA 设备尚未准备好，需要再次检查 IAA 设置。

## 使用单实例进行基准测试 {#benchmark-with-single-instance}

- 在开始基准测试之前，请禁用 C6 并将 CPU 频率调节器设置为 `performance`

``` bash
$ cpupower idle-set -d 3
$ cpupower frequency-set -g performance
```

- 为了消除交叉插槽内的内存带宽影响，我们使用 `numactl` 将服务器绑定在一个插槽上，将客户端绑定在另一个插槽上。
- 单实例意味着单个服务器连接单个客户端

现在分别为 LZ4/Deflate/ZSTD 运行基准测试：

LZ4:

``` bash
$ cd ./database_dir/lz4 
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > lz4.log
```

IAA deflate:

``` bash
$ cd ./database_dir/deflate
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > deflate.log
```

ZSTD:

``` bash
$ cd ./database_dir/zstd
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > zstd.log
```

现在应该按预期输出三个日志：
```text
lz4.log
deflate.log
zstd.log
```

如何检查性能指标：

我们关注 QPS，请搜索关键字： `QPS_Final` 并收集统计信息。

## 使用多实例进行基准测试 {#benchmark-with-multi-instances}

- 为了减少过多线程对内存带宽的影响，我们建议使用多实例运行基准测试。
- 多实例意味着多个（2 或 4）服务器与各自的客户端相连。
- 一个插槽的核心需要平均分配并分别分配给服务器。
- 对于多实例，必须为每个编解码器创建新文件夹，并按照与单实例类似的步骤插入数据集。

存在两个不同之处：
- 对于客户端，您需要在创建表和插入数据时使用指定的端口启动 clickhouse。
- 对于服务器，您需要使用指定端口的特定 xml 配置文件启动 clickhouse。所有针对多实例的自定义 xml 配置文件已提供在 ./server_config 下。

在此，我们假设每个插槽有 60 个核心，以 2 个实例为例。
启动第一个实例的服务器
LZ4:

``` bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
```

ZSTD:

``` bash
$ cd ./database_dir/zstd
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
```

IAA Deflate:

``` bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
```

[为第二个实例启动服务器]

LZ4:

``` bash
$ cd ./database_dir && mkdir lz4_s2 && cd lz4_s2
$ cp ../../server_config/config_lz4_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_lz4_s2.xml >&/dev/null&
```

ZSTD:

``` bash
$ cd ./database_dir && mkdir zstd_s2 && cd zstd_s2
$ cp ../../server_config/config_zstd_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_zstd_s2.xml >&/dev/null&
```

IAA Deflate:

``` bash
$ cd ./database_dir && mkdir deflate_s2 && cd deflate_s2
$ cp ../../server_config/config_deflate_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
```

为第二个实例创建表和插入数据

创建表：

``` bash
$ [CLICKHOUSE_EXE] client -m --port=9001 
```

插入数据：

``` bash
$ [CLICKHOUSE_EXE] client --query "INSERT INTO [TBL_FILE_NAME] FORMAT CSV" < [TBL_FILE_NAME].tbl  --port=9001
```

- [TBL_FILE_NAME] 表示以常规表达式命名的文件名：*. tbl，位于 `./benchmark_sample/rawdata_dir/ssb-dbgen` 下。
- `--port=9001` 表示分配给服务器实例的端口，该端口也在 config_lz4_s2.xml/config_zstd_s2.xml/config_deflate_s2.xml 中定义。对于更多实例，您需要将其更改为 9002/9003，对应于 s3/s4 实例。如果没有分配，默认端口为 9000，已被第一个实例使用。

使用 2 个实例进行基准测试

LZ4:

``` bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./database_dir/lz4_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_lz4_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2  > lz4_2insts.log
```

ZSTD:

``` bash
$ cd ./database_dir/zstd
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ cd ./database_dir/zstd_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_zstd_s2.xml >&/dev/null& 
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > zstd_2insts.log
```

IAA deflate

``` bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./database_dir/deflate_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > deflate_2insts.log
```

这里，client_stressing_test.py 的最后一个参数： `2` 表示实例的数量。对于更多的实例，您需要将其替换为值：3 或 4。该脚本支持最多 4 个实例。

现在应该按预期输出三个日志：

``` text
lz4_2insts.log
deflate_2insts.log
zstd_2insts.log
```

如何检查性能指标：

我们关注 QPS，请搜索关键字： `QPS_Final` 并收集统计信息。

4 个实例的基准测试设置与上述 2 个实例类似。
我们建议使用 2 个实例的基准测试数据作为最终报告进行审查。

## 提示 {#tips}

每次在启动新 clickhouse 服务器之前，请确保没有后台的 clickhouse 进程在运行，请检查并杀掉旧的进程：

``` bash
$ ps -aux| grep clickhouse
$ kill -9 [PID]
```
通过将 ./client_scripts/queries_ssb.sql 中的查询列表与官方 [星型模式基准测试](/getting-started/example-datasets/star-schema) 进行比较，您会发现有 3 个查询未包含：Q1.2/Q1.3/Q3.4。这是因为这些查询的 CPU 利用率 % 非常低 < 10%，这意味着无法显示性能差异。


---
description: '如何构建 ClickHouse 并使用 DEFLATE_QPL 编解码器运行基准测试'
sidebar_label: '构建和基准测试 DEFLATE_QPL'
sidebar_position: 73
slug: /development/building_and_benchmarking_deflate_qpl
title: '使用 DEFLATE_QPL 构建 ClickHouse'
doc_type: 'guide'
---



# 使用 DEFLATE_QPL 构建 ClickHouse

- 确保主机环境满足 QPL 所需的[前提条件](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#prerequisites)
- 在 CMake 构建过程中，deflate_qpl 默认启用。如您不慎更改，请再次确认构建标志已设置为：ENABLE_QPL=1

- 关于通用要求，请参考 ClickHouse 的通用[构建说明](/development/build.md)



# 使用 DEFLATE_QPL 进行基准测试



## 文件列表 {#files-list}

[qpl-cmake](https://github.com/ClickHouse/ClickHouse/tree/master/contrib/qpl-cmake) 下的 `benchmark_sample` 文件夹提供了使用 Python 脚本运行基准测试的示例:

`client_scripts` 包含用于运行典型基准测试的 Python 脚本,例如:

- `client_stressing_test.py`: 用于对 [1~4] 个服务器实例进行查询压力测试的 Python 脚本。
- `queries_ssb.sql`: 该文件列出了[星型模式基准测试](/getting-started/example-datasets/star-schema/)的所有查询
- `allin1_ssb.sh`: 该 shell 脚本可自动执行完整的基准测试工作流程。

`database_files` 用于根据 lz4/deflate/zstd 编解码器存储数据库文件。


## 自动运行星型模式基准测试: {#run-benchmark-automatically-for-star-schema}

```bash
$ cd ./benchmark_sample/client_scripts
$ sh run_ssb.sh
```

完成后,请在以下文件夹中查看所有结果:`./output/`

如果运行失败,请参考以下章节手动运行基准测试。


## 定义 {#definition}

[CLICKHOUSE_EXE] 表示 ClickHouse 可执行程序的路径。


## 环境 {#environment}

- CPU: Sapphire Rapid
- 操作系统要求请参阅 [QPL 系统要求](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#system-requirements)
- IAA 设置请参阅[加速器配置](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration)
- 安装 Python 模块:

```bash
pip3 install clickhouse_driver numpy
```

[IAA 自检]

```bash
$ accel-config list | grep -P 'iax|state'
```

预期输出如下:

```bash
    "dev":"iax1",
    "state":"enabled",
            "state":"enabled",
```

如果没有任何输出,则说明 IAA 尚未就绪。请重新检查 IAA 设置。


## 生成原始数据 {#generate-raw-data}

```bash
$ cd ./benchmark_sample
$ mkdir rawdata_dir && cd rawdata_dir
```

使用 [`dbgen`](/getting-started/example-datasets/star-schema) 生成 1 亿行数据,使用以下参数:
-s 20

预期在 `./benchmark_sample/rawdata_dir/ssb-dbgen` 目录下输出 `*.tbl` 格式的文件:


## 数据库设置 {#database-setup}

使用 LZ4 编解码器设置数据库

```bash
$ cd ./database_dir/lz4
$ [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

此时您应该在控制台看到 `Connected to ClickHouse server` 消息,这表示客户端已成功与服务器建立连接。

完成 [星型模式基准测试](/getting-started/example-datasets/star-schema) 中提到的以下三个步骤

- 在 ClickHouse 中创建表
- 插入数据。此处应使用 `./benchmark_sample/rawdata_dir/ssb-dbgen/*.tbl` 作为输入数据。
- 将"星型模式"转换为反规范化的"扁平模式"

使用 IAA Deflate 编解码器设置数据库

```bash
$ cd ./database_dir/deflate
$ [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

完成与上述 lz4 相同的三个步骤

使用 ZSTD 编解码器设置数据库

```bash
$ cd ./database_dir/zstd
$ [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

完成与上述 lz4 相同的三个步骤

[自检]
对于每个编解码器(lz4/zstd/deflate),请执行以下查询以确保数据库创建成功:

```sql
SELECT count() FROM lineorder_flat
```

您应该看到以下输出:

```sql
┌───count()─┐
│ 119994608 │
└───────────┘
```

[IAA Deflate 编解码器自检]

首次从客户端执行插入或查询时,ClickHouse 服务器控制台应打印以下日志:

```text
Hardware-assisted DeflateQpl codec is ready!
```

如果您从未看到此日志,而是看到如下另一条日志:

```text
Initialization of hardware-assisted DeflateQpl codec failed
```

这意味着 IAA 设备未就绪,您需要重新检查 IAA 设置。


## 单实例基准测试 {#benchmark-with-single-instance}

- 在开始基准测试之前,请禁用 C6 并将 CPU 频率调节器设置为 `performance`

```bash
$ cpupower idle-set -d 3
$ cpupower frequency-set -g performance
```

- 为了消除跨 socket 的内存绑定影响,我们使用 `numactl` 将服务器绑定到一个 socket,将客户端绑定到另一个 socket。
- 单实例是指单个服务器连接单个客户端

现在分别对 LZ4/Deflate/ZSTD 运行基准测试:

LZ4:

```bash
$ cd ./database_dir/lz4
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > lz4.log
```

IAA deflate:

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

现在应该按预期输出三个日志文件:

```text
lz4.log
deflate.log
zstd.log
```

如何检查性能指标:

我们关注 QPS,请搜索关键字 `QPS_Final` 并收集统计信息


## 使用多实例进行基准测试 {#benchmark-with-multi-instances}

- 为了减少过多线程对内存带宽的影响,建议使用多实例运行基准测试。
- 多实例是指多个(2个或4个)服务器分别连接各自的客户端。
- 需要将单个 socket 的核心平均分配给各个服务器。
- 对于多实例,必须为每个编解码器创建新文件夹,并按照与单实例类似的步骤插入数据集。

有2个不同之处:

- 对于客户端,在创建表和插入数据时需要使用指定的端口启动 ClickHouse。
- 对于服务器端,需要使用已分配端口的特定 XML 配置文件启动 ClickHouse。所有用于多实例的自定义 XML 配置文件都已在 ./server_config 下提供。

这里假设每个 socket 有60个核心,并以2个实例为例。
启动第一个实例的服务器
LZ4:

```bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
```

ZSTD:

```bash
$ cd ./database_dir/zstd
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
```

IAA Deflate:

```bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
```

[启动第二个实例的服务器]

LZ4:

```bash
$ cd ./database_dir && mkdir lz4_s2 && cd lz4_s2
$ cp ../../server_config/config_lz4_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_lz4_s2.xml >&/dev/null&
```

ZSTD:

```bash
$ cd ./database_dir && mkdir zstd_s2 && cd zstd_s2
$ cp ../../server_config/config_zstd_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_zstd_s2.xml >&/dev/null&
```

IAA Deflate:

```bash
$ cd ./database_dir && mkdir deflate_s2 && cd deflate_s2
$ cp ../../server_config/config_deflate_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
```

为第二个实例创建表并插入数据

创建表:

```bash
$ [CLICKHOUSE_EXE] client -m --port=9001
```

插入数据:

```bash
$ [CLICKHOUSE_EXE] client --query "INSERT INTO [TBL_FILE_NAME] FORMAT CSV" < [TBL_FILE_NAME].tbl  --port=9001
```

- [TBL_FILE_NAME] 表示 `./benchmark_sample/rawdata_dir/ssb-dbgen` 下符合正则表达式 \*.tbl 命名的文件名称。
- `--port=9001` 表示为服务器实例分配的端口,该端口也在 config_lz4_s2.xml/config_zstd_s2.xml/config_deflate_s2.xml 中定义。对于更多实例,需要将其替换为 9002/9003,分别代表 s3/s4 实例。如果不指定,端口默认为 9000,该端口已被第一个实例使用。

使用2个实例进行基准测试

LZ4:

```bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./database_dir/lz4_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_lz4_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2  > lz4_2insts.log
```

ZSTD:


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

这里，client&#95;stressing&#95;test.py 的最后一个参数 `2` 表示实例数量。若需要更多实例，应将其替换为 3 或 4。该脚本最多支持 4 个实例。

现在应该会按预期输出三条日志：

```text
lz4_2insts.log
deflate_2insts.log
zstd_2insts.log
```

如何查看性能指标：

我们重点关注 QPS，请搜索关键字 `QPS_Final` 并收集相关统计数据。

4 个实例的基准测试配置与上文 2 个实例的配置类似。
我们建议在最终报告中使用 2 个实例的基准测试数据作为评审依据。


## 提示 {#tips}

每次启动新的 ClickHouse 服务器之前,请确保没有后台 ClickHouse 进程正在运行,请检查并终止旧进程:

```bash
$ ps -aux| grep clickhouse
$ kill -9 [PID]
```

通过将 ./client_scripts/queries_ssb.sql 中的查询列表与官方[星型模式基准测试](/getting-started/example-datasets/star-schema)进行比较,您会发现有 3 个查询未包含在内:Q1.2/Q1.3/Q3.4。这是因为这些查询的 CPU 利用率非常低(小于 10%),无法有效展示性能差异。

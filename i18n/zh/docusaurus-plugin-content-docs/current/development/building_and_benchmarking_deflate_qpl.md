---
'description': '如何构建 Clickhouse 并使用 DEFLATE_QPL 编解码器运行基准测试'
'sidebar_label': '构建和基准测试 DEFLATE_QPL'
'sidebar_position': 73
'slug': '/development/building_and_benchmarking_deflate_qpl'
'title': '使用 DEFLATE_QPL 构建 Clickhouse'
---


# 使用 DEFLATE_QPL 构建 ClickHouse

- 确保您的主机满足QPL所需的 [先决条件](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#prerequisites)
- 在 cmake 构建期间，deflate_qpl 默认启用。如果您意外更改了该设置，请仔细检查构建标志: ENABLE_QPL=1

- 有关通用要求，请参阅 ClickHouse 通用 [构建说明](/development/build.md)


# 使用 DEFLATE_QPL 运行基准测试

## 文件列表 {#files-list}

文件夹 `benchmark_sample` 在 [qpl-cmake](https://github.com/ClickHouse/ClickHouse/tree/master/contrib/qpl-cmake) 下提供了使用 Python 脚本运行基准测试的示例：

`client_scripts` 包含用于运行典型基准测试的 Python 脚本，例如：
- `client_stressing_test.py`：用于查询压力测试的 Python 脚本，支持 [1~4] 个服务器实例。
- `queries_ssb.sql`：该文件列出所有针对 [星型模式基准测试](/getting-started/example-datasets/star-schema/) 的查询
- `allin1_ssb.sh`：此 Shell 脚本自动执行所有基准测试工作流程。

`database_files` 表示它将根据 lz4/deflate/zstd 编解码器存储数据库文件。

## 自动运行星型模式基准测试 {#run-benchmark-automatically-for-star-schema}

```bash
$ cd ./benchmark_sample/client_scripts
$ sh run_ssb.sh
```

完成后，请检查此文件夹中的所有结果：`./output/`

如果您遇到失败，请手动按以下部分运行基准测试。

## 定义 {#definition}

[CLICKHOUSE_EXE] 指的是 ClickHouse 可执行程序的路径。

## 环境 {#environment}

- CPU: Sapphire Rapid
- 操作系统要求请参考 [QPL 的系统要求](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#system-requirements)
- IAA 设置参考 [加速器配置](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration)
- 安装 Python 模块：

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
"state":"enabled",
        "state":"enabled",
```

如果您看不到任何输出，意味着 IAA 尚未准备好工作。请再次检查 IAA 设置。

## 生成原始数据 {#generate-raw-data}

```bash
$ cd ./benchmark_sample
$ mkdir rawdata_dir && cd rawdata_dir
```

使用 [`dbgen`](/getting-started/example-datasets/star-schema) 生成 1 亿行数据，参数为：
-s 20

预期在 `./benchmark_sample/rawdata_dir/ssb-dbgen` 下输出 `*.tbl` 文件：

## 数据库设置 {#database-setup}

使用 LZ4 编解码器设置数据库

```bash
$ cd ./database_dir/lz4
$ [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

您应该在控制台看到消息 `Connected to ClickHouse server`，这意味着客户端成功与服务器建立了连接。

完成 [星型模式基准测试](/getting-started/example-datasets/star-schema) 中提到的以下三个步骤：
- 在 ClickHouse 中创建表
- 插入数据。此处应使用 `./benchmark_sample/rawdata_dir/ssb-dbgen/*.tbl` 作为输入数据。
- 将“星型模式”转换为去规范化的“扁平模式”

使用 IAA Deflate 编解码器设置数据库

```bash
$ cd ./database_dir/deflate
$ [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
完成三步与上述 lz4 相同

使用 ZSTD 编解码器设置数据库

```bash
$ cd ./database_dir/zstd
$ [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
完成三步与上述 lz4 相同

[自检]
针对每个编码（lz4/zstd/deflate），请执行以下查询以确保数据库成功创建：
```sql
select count() from lineorder_flat
```
您应预期看到如下输出：
```sql
┌───count()─┐
│ 119994608 │
└───────────┘
```
[IAA Deflate 编解码器的自检]

第一次从客户端执行插入或查询时，ClickHouse 服务器控制台应打印此日志：
```text
Hardware-assisted DeflateQpl codec is ready!
```
如果您从未找到此日志，但看到如下另一日志：
```text
Initialization of hardware-assisted DeflateQpl codec failed
```
这意味着 IAA 设备尚未准备好，您需要再次检查 IAA 设置。

## 单实例基准测试 {#benchmark-with-single-instance}

- 在开始基准测试之前，请禁用 C6 并将 CPU 频率调节器设置为 `performance`

```bash
$ cpupower idle-set -d 3
$ cpupower frequency-set -g performance
```

- 为消除内存限制对跨套接字的影响，我们使用 `numactl` 将服务器绑定到一个套接字，而将客户端绑定到另一个套接字。
- 单实例指单个服务器连接到单个客户端

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

ZSTD：

```bash
$ cd ./database_dir/zstd
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > zstd.log
```

现在应按预期输出三个日志：
```text
lz4.log
deflate.log
zstd.log
```

如何检查性能指标：

我们关注 QPS，请搜索关键字：`QPS_Final` 并收集统计信息

## 多实例基准测试 {#benchmark-with-multi-instances}

- 为减少内存约束对过多线程的影响，我们建议使用多实例运行基准测试。
- 多实例指多个（2或4）服务器分别连接到各自的客户端。
- 一个套接字的核心需要平均分配并分别分配给服务器。
- 对于多实例，必须为每个编解码器创建新的文件夹，并通过遵循单实例的类似步骤插入数据集。

有两个不同之处：
- 在客户端，您需要在创建表和插入数据时使用指定的端口启动 ClickHouse。
- 在服务器端，您需要使用特定的 xml 配置文件启动 ClickHouse，该文件中分配了端口。所有自定义的 xml 配置文件已在 ./server_config 中提供。

这里假设每个套接字有 60 个核心，以 2 个实例为例。
启动第一个实例的服务器
LZ4：

```bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
```

ZSTD：

```bash
$ cd ./database_dir/zstd
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
```

IAA Deflate：

```bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
```

[启动第二个实例的服务器]

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

- [TBL_FILE_NAME] 代表一个文件的名称，该文件名采用正则表达式：*. tbl，并位于 `./benchmark_sample/rawdata_dir/ssb-dbgen` 下。
- `--port=9001` 表示为服务器实例分配的端口，该端口在 config_lz4_s2.xml/config_zstd_s2.xml/config_deflate_s2.xml 中定义。对于更多实例，您需要将其替换为值：9002/9003，分别代表 s3/s4 实例。如果未分配，则默认端口为 9000，已被第一个实例使用。

进行 2 个实例的基准测试

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

IAA deflate：

```bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./database_dir/deflate_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > deflate_2insts.log
```

此处最后一个参数：`2` 表示 client_stressing_test.py 中的实例数量。对于更多实例，您需要将其替换为值：3 或 4。此脚本支持最多 4 个实例。

现在应按预期输出三个日志：

```text
lz4_2insts.log
deflate_2insts.log
zstd_2insts.log
```
如何检查性能指标：

我们关注 QPS，请搜索关键字：`QPS_Final` 并收集统计信息

4 个实例的基准测试设置与上述 2 个实例的设置相似。
我们建议使用 2 个实例的基准测试数据作为最终报告进行审查。

## 提示 {#tips}

每次启动新的 ClickHouse 服务器之前，请确保没有后台 ClickHouse 进程在运行，请检查并终止旧的进程：

```bash
$ ps -aux| grep clickhouse
$ kill -9 [PID]
```
通过比较 `./client_scripts/queries_ssb.sql` 中的查询列表与官方 [星型模式基准测试](/getting-started/example-datasets/star-schema)，您会发现有 3 个查询未包含：Q1.2/Q1.3/Q3.4。这是因为这些查询的 CPU 利用率%非常低 < 10%，这意味着不能展示性能差异。

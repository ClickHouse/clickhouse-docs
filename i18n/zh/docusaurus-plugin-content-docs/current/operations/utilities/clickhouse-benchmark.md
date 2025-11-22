---
description: 'clickhouse-benchmark 文档'
sidebar_label: 'clickhouse-benchmark'
sidebar_position: 61
slug: /operations/utilities/clickhouse-benchmark
title: 'clickhouse-benchmark'
doc_type: 'reference'
---



# clickhouse-benchmark

连接到 ClickHouse 服务器并多次执行指定查询。

**语法**

```bash
$ clickhouse-benchmark --query ["单条查询"] [参数]
```

或

```bash
$ echo "single query" | clickhouse-benchmark [keys]
```

或

```bash
$ clickhouse-benchmark [keys] <<< "single query"
```

如果你想发送一组查询，请创建一个文本文件，并将每条查询语句单独放在文件中的一行。例如：

```sql
SELECT * FROM system.numbers LIMIT 10000000;
SELECT 1;
```

然后将此文件作为标准输入传递给 `clickhouse-benchmark`：

```bash
clickhouse-benchmark [keys] < queries_file;
```


## 命令行选项 {#clickhouse-benchmark-command-line-options}

- `--query=QUERY` — 要执行的查询。如果未传递此参数,`clickhouse-benchmark` 将从标准输入读取查询。
- `--query_id=ID` — 查询 ID。
- `--query_id_prefix=ID_PREFIX` — 查询 ID 前缀。
- `-c N`, `--concurrency=N` — `clickhouse-benchmark` 同时发送的查询数量。默认值:1。
- `-C N`, `--max_concurrency=N` — 逐步增加并行查询数量直到指定值,为每个并发级别生成一份报告。
- `--precise` — 启用带加权指标的精确按间隔报告。
- `-d N`, `--delay=N` — 中间报告之间的间隔秒数(设置为 0 可禁用报告)。默认值:1。
- `-h HOST`, `--host=HOST` — 服务器主机。默认值:`localhost`。对于[比较模式](#clickhouse-benchmark-comparison-mode),可以使用多个 `-h` 键。
- `-i N`, `--iterations=N` — 查询总数。默认值:0(永久重复)。
- `-r`, `--randomize` — 当有多个输入查询时,以随机顺序执行查询。
- `-s`, `--secure` — 使用 `TLS` 连接。
- `-t N`, `--timelimit=N` — 时间限制(秒)。当达到指定的时间限制时,`clickhouse-benchmark` 停止发送查询。默认值:0(禁用时间限制)。
- `--port=N` — 服务器端口。默认值:9000。对于[比较模式](#clickhouse-benchmark-comparison-mode),可以使用多个 `--port` 键。
- `--confidence=N` — T 检验的置信水平。可能的值:0 (80%)、1 (90%)、2 (95%)、3 (98%)、4 (99%)、5 (99.5%)。默认值:5。在[比较模式](#clickhouse-benchmark-comparison-mode)中,`clickhouse-benchmark` 执行[独立双样本学生 t 检验](https://en.wikipedia.org/wiki/Student%27s_t-test#Independent_two-sample_t-test)以确定两个分布在所选置信水平下是否存在差异。
- `--cumulative` — 打印累积数据而不是每个间隔的数据。
- `--database=DATABASE_NAME` — ClickHouse 数据库名称。默认值:`default`。
- `--user=USERNAME` — ClickHouse 用户名。默认值:`default`。
- `--password=PSWD` — ClickHouse 用户密码。默认值:空字符串。
- `--stacktrace` — 堆栈跟踪输出。当设置此键时,`clickhouse-benchmark` 输出异常的堆栈跟踪。
- `--stage=WORD` — 服务器上的查询处理阶段。ClickHouse 在指定阶段停止查询处理并向 `clickhouse-benchmark` 返回结果。可能的值:`complete`、`fetch_columns`、`with_mergeable_state`。默认值:`complete`。
- `--roundrobin` — 不比较不同 `--host`/`--port` 的查询,而是为每个查询随机选择一个 `--host`/`--port` 并将查询发送到该位置。
- `--reconnect=N` — 控制重新连接行为。可能的值:0(永不重新连接)、1(每个查询都重新连接)或 N(每 N 个查询后重新连接)。默认值:0。
- `--max-consecutive-errors=N` — 允许的连续错误数。默认值:0。
- `--ignore-error`,`--continue_on_errors` — 即使查询失败也继续测试。
- `--client-side-time` — 显示包括网络通信在内的时间而不是服务器端时间;注意,对于 22.8 之前的服务器版本,始终显示客户端时间。
- `--proto-caps` — 启用/禁用数据传输中的分块。选项(可以用逗号分隔):`chunked_optional`、`notchunked`、`notchunked_optional`、`send_chunked`、`send_chunked_optional`、`send_notchunked`、`send_notchunked_optional`、`recv_chunked`、`recv_chunked_optional`、`recv_notchunked`、`recv_notchunked_optional`。默认值:`notchunked`。
- `--help` — 显示帮助信息。
- `--verbose` — 增加帮助信息的详细程度。

如果要为查询应用某些[设置](/operations/settings/overview),请将它们作为键 `--<session setting name>= SETTING_VALUE` 传递。例如,`--max_memory_usage=1048576`。


## 环境变量选项 {#clickhouse-benchmark-environment-variable-options}

可以通过环境变量 `CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD` 和 `CLICKHOUSE_HOST` 设置用户名、密码和主机。  
命令行参数 `--user`、`--password` 或 `--host` 优先于环境变量。


## Output {#clickhouse-benchmark-output}

默认情况下，`clickhouse-benchmark` 会在每个 `--delay` 间隔报告结果。

报告示例：

```text
Queries executed: 10.

localhost:9000, queries 10, QPS: 6.772, RPS: 67904487.440, MiB/s: 518.070, result RPS: 67721584.984, result MiB/s: 516.675.

0.000%      0.145 sec.
10.000%     0.146 sec.
20.000%     0.146 sec.
30.000%     0.146 sec.
40.000%     0.147 sec.
50.000%     0.148 sec.
60.000%     0.148 sec.
70.000%     0.148 sec.
80.000%     0.149 sec.
90.000%     0.150 sec.
95.000%     0.150 sec.
99.000%     0.150 sec.
99.900%     0.150 sec.
99.990%     0.150 sec.
```

报告中包含以下信息：

- `Queries executed:` 字段中的查询数量。

- 状态字符串包含（按顺序）：
  - ClickHouse 服务器的端点。
  - 已处理的查询数量。
  - QPS：在 `--delay` 参数指定的时间段内，服务器每秒执行的查询数。
  - RPS：在 `--delay` 参数指定的时间段内，服务器每秒读取的行数。
  - MiB/s：在 `--delay` 参数指定的时间段内，服务器每秒读取的 MiB 数。
  - result RPS：在 `--delay` 参数指定的时间段内，服务器每秒写入查询结果的行数。
  - result MiB/s：在 `--delay` 参数指定的时间段内，服务器每秒写入查询结果的 MiB 数。

- 查询执行时间的百分位数。


## 比较模式 {#clickhouse-benchmark-comparison-mode}

`clickhouse-benchmark` 可以比较两个正在运行的 ClickHouse 服务器的性能。

要使用比较模式,需通过两对 `--host`、`--port` 参数分别指定两个服务器的端点。参数按在参数列表中的位置进行配对,第一个 `--host` 与第一个 `--port` 配对,以此类推。`clickhouse-benchmark` 会建立到两个服务器的连接,然后发送查询。每个查询会随机发送到其中一个服务器。结果以表格形式显示。


## 示例 {#clickhouse-benchmark-example}

```bash
$ echo "SELECT * FROM system.numbers LIMIT 10000000 OFFSET 10000000" | clickhouse-benchmark --host=localhost --port=9001 --host=localhost --port=9000 -i 10
```

```text
已加载 1 个查询。

已执行查询数:5。

localhost:9001, queries 2, QPS: 3.764, RPS: 75446929.370, MiB/s: 575.614, result RPS: 37639659.982, result MiB/s: 287.168.
localhost:9000, queries 3, QPS: 3.815, RPS: 76466659.385, MiB/s: 583.394, result RPS: 38148392.297, result MiB/s: 291.049.

0.000%          0.258 sec.      0.250 sec.
10.000%         0.258 sec.      0.250 sec.
20.000%         0.258 sec.      0.250 sec.
30.000%         0.258 sec.      0.267 sec.
40.000%         0.258 sec.      0.267 sec.
50.000%         0.273 sec.      0.267 sec.
60.000%         0.273 sec.      0.267 sec.
70.000%         0.273 sec.      0.267 sec.
80.000%         0.273 sec.      0.269 sec.
90.000%         0.273 sec.      0.269 sec.
95.000%         0.273 sec.      0.269 sec.
99.000%         0.273 sec.      0.269 sec.
99.900%         0.273 sec.      0.269 sec.
99.990%         0.273 sec.      0.269 sec.

在 99.5% 置信度下未证明存在差异
```

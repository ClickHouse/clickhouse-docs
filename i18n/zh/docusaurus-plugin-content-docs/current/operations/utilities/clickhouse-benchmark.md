---
description: 'clickhouse-benchmark 文档'
sidebar_label: 'clickhouse-benchmark'
sidebar_position: 61
slug: /operations/utilities/clickhouse-benchmark
title: 'clickhouse-benchmark'
doc_type: 'reference'
---

# clickhouse-benchmark \\{#clickhouse-benchmark\\}

连接到 ClickHouse 服务器并反复执行指定查询。

**语法**

```bash
$ clickhouse-benchmark --query ["single query"] [keys]
```

或

```bash
$ echo "single query" | clickhouse-benchmark [keys]
```

或

```bash
$ clickhouse-benchmark [keys] <<< "single query"
```

如果你想发送一组查询，请创建一个文本文件，并在该文件中将每条查询语句放在单独的一行。例如：

```sql
SELECT * FROM system.numbers LIMIT 10000000;
SELECT 1;
```

然后通过标准输入将该文件传递给 `clickhouse-benchmark`：

```bash
clickhouse-benchmark [keys] < queries_file;
```

## 命令行选项 \\{#clickhouse-benchmark-command-line-options\\}

- `--query=QUERY` — 要执行的查询。如果未传递此参数，`clickhouse-benchmark` 将从标准输入读取查询。
- `--query_id=ID` — 查询 ID。
- `--query_id_prefix=ID_PREFIX` — 查询 ID 前缀。
- `-c N`, `--concurrency=N` — `clickhouse-benchmark` 同时发送的查询数量。默认值：1。
- `-C N`, `--max_concurrency=N` — 逐步增加并行查询数量直至指定值，并为每个并发级别生成一份报告。
- `--precise` — 启用带加权指标的精确分段报告。
- `-d N`, `--delay=N` — 中间报告之间的时间间隔（秒）（要禁用报告请设为 0）。默认值：1。
- `-h HOST`, `--host=HOST` — 服务器主机名。默认值：`localhost`。在[对比模式](#clickhouse-benchmark-comparison-mode)下可以使用多个 `-h` 选项。
- `-i N`, `--iterations=N` — 查询总数。默认值：0（无限重复）。
- `-r`, `--randomize` — 当输入中有多个查询时，以随机顺序执行查询。
- `-s`, `--secure` — 使用 `TLS` 连接。
- `-t N`, `--timelimit=N` — 时间限制（秒）。达到指定时间限制后，`clickhouse-benchmark` 停止发送查询。默认值：0（禁用时间限制）。
- `--port=N` — 服务器端口。默认值：9000。在[对比模式](#clickhouse-benchmark-comparison-mode)下可以使用多个 `--port` 选项。
- `--confidence=N` — t 检验的置信水平。可选值：0 (80%)、1 (90%)、2 (95%)、3 (98%)、4 (99%)、5 (99.5%)。默认值：5。在[对比模式](#clickhouse-benchmark-comparison-mode)下，`clickhouse-benchmark` 会执行[双样本独立 Student t 检验](https://en.wikipedia.org/wiki/Student%27s_t-test#Independent_two-sample_t-test)，以在选定置信水平下判断两个分布是否可以视为无显著差异。
- `--cumulative` — 输出累积数据，而不是分段数据。
- `--database=DATABASE_NAME` — ClickHouse 数据库名。默认值：`default`。
- `--user=USERNAME` — ClickHouse 用户名。默认值：`default`。
- `--password=PSWD` — ClickHouse 用户密码。默认值：空字符串。
- `--stacktrace` — 输出堆栈跟踪。设置此选项后，`clickhouse-benchmark` 会输出异常的堆栈跟踪。
- `--stage=WORD` — 服务器端的查询处理阶段。ClickHouse 会在指定阶段停止处理查询并向 `clickhouse-benchmark` 返回结果。可选值：`complete`、`fetch_columns`、`with_mergeable_state`。默认值：`complete`。
- `--roundrobin` — 不对不同 `--host`/`--port` 的查询进行比较，而是为每个查询随机选择一个 `--host`/`--port` 并将查询发送到该地址。
- `--reconnect=N` — 控制重连行为。可选值：0（从不重连）、1（每个查询都重连），或 N（每 N 个查询重连一次）。默认值：0。
- `--max-consecutive-errors=N` — 允许的连续错误数量。默认值：0。
- `--ignore-error`, `--continue_on_errors` — 即使查询失败也继续测试。
- `--client-side-time` — 显示包含网络通信时间的耗时，而不是服务器端时间；注意，在 22.8 之前的服务器版本中，总是显示客户端时间。
- `--proto-caps` — 启用/禁用数据传输中的分块。可选值（可用逗号分隔）：`chunked_optional`、`notchunked`、`notchunked_optional`、`send_chunked`、`send_chunked_optional`、`send_notchunked`、`send_notchunked_optional`、`recv_chunked`、`recv_chunked_optional`、`recv_notchunked`、`recv_notchunked_optional`。默认值：`notchunked`。
- `--help` — 显示帮助信息。
- `--verbose` — 增加帮助信息的详细程度。

如果希望为查询应用一些[设置](/operations/settings/overview)，可以以 `--<session setting name>= SETTING_VALUE` 的形式传递它们。例如：`--max_memory_usage=1048576`。

## 环境变量选项 \\{#clickhouse-benchmark-environment-variable-options\\}

可以通过环境变量 `CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD` 和 `CLICKHOUSE_HOST` 设置用户名、密码和主机。  
命令行参数 `--user`、`--password` 或 `--host` 优先于环境变量。

## 输出 \\{#clickhouse-benchmark-output\\}

默认情况下，`clickhouse-benchmark` 会在每个 `--delay` 时间间隔输出一份报告。

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

在报告中可以看到：

* `Queries executed:` 字段中的查询数量。

* 状态字符串包含（按顺序）：

  * ClickHouse 服务器的端点。
  * 已处理的查询数量。
  * QPS：在 `--delay` 参数指定的时间段内，服务器每秒执行的查询数。
  * RPS：在 `--delay` 参数指定的时间段内，服务器每秒读取的行数。
  * MiB/s：在 `--delay` 参数指定的时间段内，服务器每秒读取的数据量（以 MiB 为单位）。
  * result RPS：在 `--delay` 参数指定的时间段内，服务器每秒写入到查询结果中的行数。
  * result MiB/s：在 `--delay` 参数指定的时间段内，服务器每秒写入到查询结果中的数据量（以 MiB 为单位）。

* 查询执行时间的分位数（百分位）。

## 比较模式 \\{#clickhouse-benchmark-comparison-mode\\}

`clickhouse-benchmark` 可以比较两个正在运行的 ClickHouse 服务器的性能。

要使用比较模式，请通过两组 `--host` 和 `--port` 参数来指定两个服务器的端点。参数按照它们在参数列表中的顺序进行一一匹配，第一个 `--host` 与第一个 `--port` 匹配，依此类推。`clickhouse-benchmark` 会同时与这两个服务器建立连接，然后发送查询。每条查询都会被发送到随机选取的其中一个服务器。结果会以表格形式显示。

## 示例 \\{#clickhouse-benchmark-example\\}

```bash
$ echo "SELECT * FROM system.numbers LIMIT 10000000 OFFSET 10000000" | clickhouse-benchmark --host=localhost --port=9001 --host=localhost --port=9000 -i 10
```

```text
Loaded 1 queries.

Queries executed: 5.

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

No difference proven at 99.5% confidence
```

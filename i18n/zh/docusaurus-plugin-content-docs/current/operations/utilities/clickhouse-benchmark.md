---
slug: /operations/utilities/clickhouse-benchmark
sidebar_position: 61
sidebar_label: clickhouse-benchmark
---


# clickhouse-benchmark 

连接到 ClickHouse 服务器并反复发送指定的查询。

**语法**

``` bash
$ clickhouse-benchmark --query ["single query"] [keys]
```

或者

``` bash
$ echo "single query" | clickhouse-benchmark [keys]
```

或者

``` bash
$ clickhouse-benchmark [keys] <<< "single query"
```

如果您想发送一组查询，请创建一个文本文件，并在该文件中的每个行中放置单独的查询。例如：

``` sql
SELECT * FROM system.numbers LIMIT 10000000;
SELECT 1;
```

然后将该文件传递给 `clickhouse-benchmark` 的标准输入：

``` bash
clickhouse-benchmark [keys] < queries_file;
```

## Keys {#clickhouse-benchmark-keys}

- `--query=QUERY` — 要执行的查询。如果未传递此参数，则 `clickhouse-benchmark` 将从标准输入读取查询。
- `-c N`, `--concurrency=N` — `clickhouse-benchmark` 同时发送的查询数量。默认值：1。
- `-d N`, `--delay=N` — 中间报告之间的间隔（要禁用报告设置为 0）。默认值：1。
- `-h HOST`, `--host=HOST` — 服务器主机。默认值：`localhost`。对于 [比较模式](#clickhouse-benchmark-comparison-mode)，您可以使用多个 `-h` 键。
- `-i N`, `--iterations=N` — 查询的总数量。默认值：0（无限重复）。
- `-r`, `--randomize` — 如果有超过一个输入查询，则以随机顺序执行查询。
- `-s`, `--secure` — 使用 `TLS` 连接。
- `-t N`, `--timelimit=N` — 限制时间（以秒为单位）。当达到指定的时间限制时，`clickhouse-benchmark` 停止发送查询。默认值：0（禁用时间限制）。
- `--port=N` — 服务器端口。默认值：9000。对于 [比较模式](#clickhouse-benchmark-comparison-mode)，您可以使用多个 `--port` 键。
- `--confidence=N` — T 检验的置信水平。可能的值：0（80%）、1（90%）、2（95%）、3（98%）、4（99%）、5（99.5%）。默认值：5。在 [比较模式](#clickhouse-benchmark-comparison-mode) 中，`clickhouse-benchmark` 执行 [独立两样本学生t检验](https://en.wikipedia.org/wiki/Student%27s_t-test#Independent_two-sample_t-test) 来确定两个分布在所选置信水平下是否不同。
- `--cumulative` — 打印累计数据，而不是按区间的数据。
- `--database=DATABASE_NAME` — ClickHouse 数据库名称。默认值：`default`。
- `--user=USERNAME` — ClickHouse 用户名。默认值：`default`。
- `--password=PSWD` — ClickHouse 用户密码。默认值：空字符串。
- `--stacktrace` — 堆栈跟踪输出。当设置此键时，`clickhouse-benchmark` 输出异常的堆栈跟踪。
- `--stage=WORD` — 服务器上的查询处理阶段。ClickHouse 在指定阶段停止查询处理并将答案返回给 `clickhouse-benchmark`。可能的值：`complete`、`fetch_columns`、`with_mergeable_state`。默认值：`complete`。
- `--help` — 显示帮助信息。

如果您想为查询应用一些 [设置](/operations/settings/overview)，请将其作为键 `--<session setting name>= SETTING_VALUE` 传递。例如，`--max_memory_usage=1048576`。

## 输出 {#clickhouse-benchmark-output}

默认情况下，`clickhouse-benchmark` 每个 `--delay` 间隔报告一次。

报告示例：

``` text
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

在报告中，您可以找到：

- `Queries executed:` 字段中的查询数量。

- 状态字符串，包含（按顺序）：

    - ClickHouse 服务器的端点。
    - 已处理的查询数量。
    - QPS：在 `--delay` 参数指定的期间内，服务器每秒执行的查询数量。
    - RPS：在 `--delay` 参数指定的期间内，服务器每秒读取的行数。
    - MiB/s：在 `--delay` 参数指定的期间内，服务器每秒读取的兆字节数。
    - result RPS：在 `--delay` 参数指定的期间内，服务器每秒放置到查询结果中的行数。
    - result MiB/s：在 `--delay` 参数指定的期间内，服务器每秒放置到查询结果中的兆字节数。

- 查询执行时间的百分位数。

## 比较模式 {#clickhouse-benchmark-comparison-mode}

`clickhouse-benchmark` 可以比较两个运行中的 ClickHouse 服务器的性能。

要使用比较模式，请通过两对 `--host`、`--port` 键指定两个服务器的端点。键按参数列表中的位置匹配，第一个 `--host` 与第一个 `--port` 匹配，依此类推。`clickhouse-benchmark` 建立对两个服务器的连接，然后发送查询。每个查询发送给随机选择的服务器。结果以表格形式显示。

## 示例 {#clickhouse-benchmark-example}

``` bash
$ echo "SELECT * FROM system.numbers LIMIT 10000000 OFFSET 10000000" | clickhouse-benchmark --host=localhost --port=9001 --host=localhost --port=9000 -i 10
```

``` text
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

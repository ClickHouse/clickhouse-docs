---
description: '使用 clickhouse-local 在无需 ClickHouse 服务器的情况下处理数据的指南'
sidebar_label: 'clickhouse-local'
sidebar_position: 60
slug: /operations/utilities/clickhouse-local
title: 'clickhouse-local'
doc_type: 'reference'
---

# clickhouse-local {#clickhouse-local}

## 何时使用 clickhouse-local 而不是 ClickHouse {#when-to-use-clickhouse-local-vs-clickhouse}

`clickhouse-local` 是一个易于使用的 ClickHouse 版本，非常适合需要在本地和远程文件上使用 SQL 进行快速处理、且不必安装完整数据库服务器的开发人员。借助 `clickhouse-local`，开发人员可以直接在命令行中使用 SQL 命令（使用 [ClickHouse SQL 方言](../../sql-reference/index.md)），以一种简单高效的方式访问 ClickHouse 功能，而无需完整安装 ClickHouse。`clickhouse-local` 的主要优势之一是，它在安装 [clickhouse-client](/operations/utilities/clickhouse-local) 时已一并包含。这意味着开发人员可以快速开始使用 `clickhouse-local`，而不需要经历复杂的安装过程。

尽管 `clickhouse-local` 非常适合用于开发、测试以及文件处理，但它并不适合直接为终端用户或应用程序提供服务。在这些场景中，推荐使用开源的 [ClickHouse](/install)。ClickHouse 是一款功能强大的 OLAP 数据库，专为处理大规模分析型负载而设计。它能够对大型数据集上的复杂查询进行快速高效的处理，非常适合对高性能要求严格的生产环境。此外，ClickHouse 还提供了诸如复制、分片和高可用性等丰富特性，这些对于扩展以处理大规模数据集并为应用程序提供服务至关重要。如果你需要处理更大规模的数据集，或需要为终端用户或应用程序提供服务，我们建议使用开源的 ClickHouse，而不是 `clickhouse-local`。

请阅读下面的文档，这些文档展示了 `clickhouse-local` 的示例用例，例如[查询本地文件](#query_data_in_file)或[读取 S3 中的 Parquet 文件](#query-data-in-a-parquet-file-in-aws-s3)。

## 下载 clickhouse-local {#download-clickhouse-local}

`clickhouse-local` 是通过与 ClickHouse 服务器和 `clickhouse-client` 相同的 `clickhouse` 二进制程序来执行的。下载最新版本最简单的方法是运行以下命令：

```bash
curl https://clickhouse.com/ | sh
```

:::note
您刚刚下载的二进制文件可以运行各种 ClickHouse 工具和实用工具。如果您想以数据库服务器的方式运行 ClickHouse，请查看 [快速入门](/get-started/quick-start)。
:::

## 使用 SQL 查询文件中的数据 {#query_data_in_file}

`clickhouse-local` 的一个常见用途是对文件运行即席查询：这样你无需先将数据插入到表中。`clickhouse-local` 可以将文件中的数据以流式方式导入到一个临时表中，并执行你的 SQL。

如果文件与 `clickhouse-local` 位于同一台机器上，你只需指定要加载的文件即可。下面的 `reviews.tsv` 文件包含一部分 Amazon 商品评论示例：

```bash
./clickhouse local -q "SELECT * FROM 'reviews.tsv'"
```

此命令是以下命令的简写：

```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv')"
```

ClickHouse 会根据文件扩展名判断该文件使用的是制表符分隔格式。如果你需要显式指定格式，只需添加其中一种[ClickHouse 支持的众多输入格式](../../interfaces/formats.md)：

```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv', 'TabSeparated')"
```

`file` 表函数会创建一个表，你可以使用 `DESCRIBE` 查看推断出的表结构：`

```bash
./clickhouse local -q "DESCRIBE file('reviews.tsv')"
```

:::tip
文件名中可以使用 glob 通配符（参见 [glob substitutions](/sql-reference/table-functions/file.md/#globs-in-path)）。

示例：

```bash
./clickhouse local -q "SELECT * FROM 'reviews*.jsonl'"
./clickhouse local -q "SELECT * FROM 'review_?.csv'"
./clickhouse local -q "SELECT * FROM 'review_{1..3}.csv'"
```

:::

```response
marketplace    Nullable(String)
customer_id    Nullable(Int64)
review_id    Nullable(String)
product_id    Nullable(String)
product_parent    Nullable(Int64)
product_title    Nullable(String)
product_category    Nullable(String)
star_rating    Nullable(Int64)
helpful_votes    Nullable(Int64)
total_votes    Nullable(Int64)
vine    Nullable(String)
verified_purchase    Nullable(String)
review_headline    Nullable(String)
review_body    Nullable(String)
review_date    Nullable(Date)
```

我们来找出评分最高的产品：

```bash
./clickhouse local -q "SELECT
    argMax(product_title,star_rating),
    max(star_rating)
FROM file('reviews.tsv')"
```

```response
Monopoly Junior Board Game    5
```

## 在 AWS S3 中查询 Parquet 文件中的数据 {#query-data-in-a-parquet-file-in-aws-s3}

如果你在 S3 中有一个文件，可以使用 `clickhouse-local` 和 `s3` 表函数来就地查询该文件（无需先将数据插入到 ClickHouse 表中）。我们在一个公共 bucket 中有一个名为 `house_0.parquet` 的文件，其中包含英国已售房产的房价数据。来看一下它有多少行：

```bash
./clickhouse local -q "
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')"
```

该文件有 270 万行记录：

```response
2772030
```

查看 ClickHouse 根据文件推断出的模式总是很有帮助：

```bash
./clickhouse local -q "DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')"
```

```response
price    Nullable(Int64)
date    Nullable(UInt16)
postcode1    Nullable(String)
postcode2    Nullable(String)
type    Nullable(String)
is_new    Nullable(UInt8)
duration    Nullable(String)
addr1    Nullable(String)
addr2    Nullable(String)
street    Nullable(String)
locality    Nullable(String)
town    Nullable(String)
district    Nullable(String)
county    Nullable(String)
```

让我们来看哪些社区最昂贵：

```bash
./clickhouse local -q "
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 10"
```

```response
LONDON    CITY OF LONDON    886    2271305    █████████████████████████████████████████████▍
LEATHERHEAD    ELMBRIDGE    206    1176680    ███████████████████████▌
LONDON    CITY OF WESTMINSTER    12577    1108221    ██████████████████████▏
LONDON    KENSINGTON AND CHELSEA    8728    1094496    █████████████████████▉
HYTHE    FOLKESTONE AND HYTHE    130    1023980    ████████████████████▍
CHALFONT ST GILES    CHILTERN    113    835754    ████████████████▋
AMERSHAM    BUCKINGHAMSHIRE    113    799596    ███████████████▉
VIRGINIA WATER    RUNNYMEDE    356    789301    ███████████████▊
BARNET    ENFIELD    282    740514    ██████████████▊
NORTHWOOD    THREE RIVERS    184    731609    ██████████████▋
```

:::tip
当你准备好将文件写入 ClickHouse 时，启动一个 ClickHouse 服务器，并将 `file` 和 `s3` 表函数的结果插入到一个 `MergeTree` 表中。更多详情请参阅[快速开始](/get-started/quick-start)。
:::

## 格式转换 {#format-conversions}

你可以使用 `clickhouse-local` 在不同格式之间进行数据转换。示例：

```bash
$ clickhouse-local --input-format JSONLines --output-format CSV --query "SELECT * FROM table" < data.json > data.csv
```

格式会根据文件扩展名自动识别：

```bash
$ clickhouse-local --query "SELECT * FROM table" < data.json > data.csv
```

作为快捷方式，你可以使用 `--copy` 参数来简化写法：

```bash
$ clickhouse-local --copy < data.json > data.csv
```

## 使用方法 {#usage}

默认情况下，`clickhouse-local` 可以访问同一主机上运行的 ClickHouse 服务器的数据，并且不会依赖于该服务器的配置。它也支持通过 `--config-file` 参数加载服务器配置。对于临时数据，默认会创建一个唯一的临时数据目录。

基本用法（Linux）：

```bash
$ clickhouse-local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

基本用法（Mac）：

```bash
$ ./clickhouse local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

:::note
`clickhouse-local` 也支持在 Windows 上通过 WSL2 使用。
:::

参数：

* `-S`, `--structure` — 输入数据的表结构。
* `--input-format` — 输入格式，默认为 `TSV`。
* `-F`, `--file` — 数据路径，默认为 `stdin`。
* `-q`, `--query` — 要执行的查询，以 `;` 作为分隔符。`--query` 可以被多次指定，例如 `--query "SELECT 1" --query "SELECT 2"`。不能与 `--queries-file` 同时使用。
* `--queries-file` - 包含要执行查询的文件路径。`--queries-file` 可以被多次指定，例如 `--query queries1.sql --query queries2.sql`。不能与 `--query` 同时使用。
* `--multiquery, -n` – 如果指定，则可以在 `--query` 选项之后列出多个以分号分隔的查询。为方便起见，也可以省略 `--query`，直接在 `--multiquery` 之后传入查询。
* `-N`, `--table` — 存放输出数据的表名，默认是 `table`。
* `-f`, `--format`, `--output-format` — 输出格式，默认为 `TSV`。
* `-d`, `--database` — 默认数据库，默认为 `_local`。
* `--stacktrace` — 是否在出现异常时转储调试输出。
* `--echo` — 在执行前打印查询。
* `--verbose` — 输出更多查询执行细节。
* `--logger.console` — 将日志输出到控制台。
* `--logger.log` — 日志文件名。
* `--logger.level` — 日志级别。
* `--ignore-error` — 在某个查询失败时不停止处理。
* `-c`, `--config-file` — 配置文件路径，格式与 ClickHouse 服务器相同，默认情况下配置为空。
* `--no-system-tables` — 不附加 system 表。
* `--help` — 显示 `clickhouse-local` 的参数说明。
* `-V`, `--version` — 打印版本信息并退出。

此外，还为每个 ClickHouse 配置变量提供了对应的参数，这些参数通常比 `--config-file` 更常用。

## 示例 {#examples}

```bash
$ echo -e "1,2\n3,4" | clickhouse-local --structure "a Int64, b Int64" \
    --input-format "CSV" --query "SELECT * FROM table"
Read 2 rows, 32.00 B in 0.000 sec., 5182 rows/sec., 80.97 KiB/sec.
1   2
3   4
```

前面的示例等价于：

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -n --query "
    CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin);
    SELECT a, b FROM table;
    DROP TABLE table;"
Read 2 rows, 32.00 B in 0.000 sec., 4987 rows/sec., 77.93 KiB/sec.
1   2
3   4
```

你不必使用 `stdin` 或 `--file` 参数，也可以通过 [`file` 表函数](../../sql-reference/table-functions/file.md) 打开任意数量的文件：

```bash
$ echo 1 | tee 1.tsv
1

$ echo 2 | tee 2.tsv
2

$ clickhouse-local --query "
    select * from file('1.tsv', TSV, 'a int') t1
    cross join file('2.tsv', TSV, 'b int') t2"
1    2
```

现在让我们输出每个 Unix 用户的内存使用量：

查询：

```bash
$ ps aux | tail -n +2 | awk '{ printf("%s\t%s\n", $1, $4) }' \
    | clickhouse-local --structure "user String, mem Float64" \
        --query "SELECT user, round(sum(mem), 2) as memTotal
            FROM table GROUP BY user ORDER BY memTotal DESC FORMAT Pretty"
```

结果：

```text
Read 186 rows, 4.15 KiB in 0.035 sec., 5302 rows/sec., 118.34 KiB/sec.
┏━━━━━━━━━━┳━━━━━━━━━━┓
┃ user     ┃ memTotal ┃
┡━━━━━━━━━━╇━━━━━━━━━━┩
│ bayonet  │    113.5 │
├──────────┼──────────┤
│ root     │      8.8 │
├──────────┼──────────┤
...
```

## 相关内容 {#related-content-1}

- [使用 clickhouse-local 从本地文件中提取、转换和查询数据](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)
- [将数据导入 ClickHouse - 第 1 部分](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)
- [探索海量真实世界数据集：在 ClickHouse 中分析 100 多年的气象记录](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
- 博客：[使用 clickhouse-local 从本地文件中提取、转换和查询数据](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)

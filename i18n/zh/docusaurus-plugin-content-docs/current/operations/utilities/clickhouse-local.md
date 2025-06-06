---
'description': '在没有服务器的情况下使用 clickhouse-local 处理数据的指南'
'sidebar_label': 'clickhouse-local'
'sidebar_position': 60
'slug': '/operations/utilities/clickhouse-local'
'title': 'clickhouse-local'
---


# clickhouse-local

## 何时使用 clickhouse-local 与 ClickHouse {#when-to-use-clickhouse-local-vs-clickhouse}

`clickhouse-local` 是一个易于使用的 ClickHouse 版本，非常适合需要使用 SQL 对本地和远程文件进行快速处理的开发人员，而无需安装完整的数据库服务器。使用 `clickhouse-local`，开发人员可以直接从命令行使用 SQL 命令（使用 [ClickHouse SQL 方言](../../sql-reference/index.md)），提供了一种简单高效的方式来访问 ClickHouse 特性，而无需完整安装 ClickHouse。`clickhouse-local` 的主要好处之一是它在安装 [clickhouse-client](/operations/utilities/clickhouse-local) 时已经包含。这意味着开发人员可以迅速开始使用 `clickhouse-local`，而无需复杂的安装过程。

虽然 `clickhouse-local` 是一个很好的开发和测试工具，以及处理文件的工具，但它不适合用于为最终用户或应用程序提供服务。在这些情况下，建议使用开源的 [ClickHouse](/install)。ClickHouse 是一个强大的 OLAP 数据库，旨在处理大规模分析工作负载。它可以对大型数据集上的复杂查询进行快速高效的处理，使其非常适合生产环境，在这些环境中高性能至关重要。此外，ClickHouse 还提供许多功能，如复制、分片和高可用性，这些是扩展到处理大数据集和为应用程序提供服务所必需的。如果您需要处理更大的数据集或为最终用户或应用程序提供服务，建议使用开源 ClickHouse，而不是 `clickhouse-local`。

请阅读下面的文档，展示 `clickhouse-local` 的示例用例，例如 [查询本地文件](#query_data_in_file) 或 [读取 S3 中的 parquet 文件](#query-data-in-a-parquet-file-in-aws-s3)。

## 下载 clickhouse-local {#download-clickhouse-local}

`clickhouse-local` 使用相同的 `clickhouse` 二进制文件执行，该二进制文件运行 ClickHouse 服务器和 `clickhouse-client`。下载最新版本的最简单方法是使用以下命令：

```bash
curl https://clickhouse.com/ | sh
```

:::note
您刚刚下载的二进制文件可以运行各种 ClickHouse 工具和实用程序。如果您想将 ClickHouse 作为数据库服务器来运行，请查看 [快速入门](../../quick-start.mdx)。
:::

## 使用 SQL 查询文件中的数据 {#query_data_in_file}

`clickhouse-local` 的一个常见用法是对文件运行临时查询：您不必将数据插入到表中。`clickhouse-local` 可以将文件中的数据流入一个临时表并执行您的 SQL。

如果文件位于与 `clickhouse-local` 一样的机器上，您只需指定要加载的文件。以下 `reviews.tsv` 文件包含亚马逊产品评论的一个样本：

```bash
./clickhouse local -q "SELECT * FROM 'reviews.tsv'"
```

此命令是以下命令的简写：

```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv')"
```

ClickHouse 根据文件名扩展名知道文件使用制表符分隔格式。如果您需要明确指定格式，只需添加某种 [许多 ClickHouse 输入格式](../../interfaces/formats.md):
```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv', 'TabSeparated')"
```

`file` 表函数创建一个表，您可以使用 `DESCRIBE` 查看推测的模式：

```bash
./clickhouse local -q "DESCRIBE file('reviews.tsv')"
```

:::tip
您可以在文件名中使用通配符（请参阅 [通配符替换](/sql-reference/table-functions/file.md/#globs-in-path)）。

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

让我们找到评分最高的产品：

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

如果您在 S3 中有一个文件，请使用 `clickhouse-local` 和 `s3` 表函数在就地查询文件（无须将数据插入到 ClickHouse 表中）。我们在一个公共桶中有一个名为 `house_0.parquet` 的文件，包含在英国销售的房产价格。让我们看看它有多少行：

```bash
./clickhouse local -q "
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')"
```

该文件有 2.7M 行：

```response
2772030
```

查看 ClickHouse 从文件中推测出的模式总是很有用：

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

让我们看看最贵的社区：

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
当您准备将文件插入到 ClickHouse 中时，启动一个 ClickHouse 服务器并将 `file` 和 `s3` 表函数的结果插入到一个 `MergeTree` 表中。查看 [快速入门](../../quick-start.mdx) 以获取更多细节。
:::


## 格式转换 {#format-conversions}

您可以使用 `clickhouse-local` 在不同格式之间转换数据。示例：

```bash
$ clickhouse-local --input-format JSONLines --output-format CSV --query "SELECT * FROM table" < data.json > data.csv
```

格式是根据文件扩展名自动检测的：

```bash
$ clickhouse-local --query "SELECT * FROM table" < data.json > data.csv
```

作为简写，您可以使用 `--copy` 参数来编写：
```bash
$ clickhouse-local --copy < data.json > data.csv
```


## 使用 {#usage}

默认情况下，`clickhouse-local` 可以访问同一主机上 ClickHouse 服务器的数据，并且不依赖于服务器的配置。它还支持使用 `--config-file` 参数加载服务器配置。对于临时数据，默认情况下会创建一个唯一的临时数据目录。

基本用法（Linux）：

```bash
$ clickhouse-local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

基本用法（Mac）：

```bash
$ ./clickhouse local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

:::note
`clickhouse-local` 也在通过 WSL2 支持 Windows。
:::

参数：

- `-S`, `--structure` — 输入数据的表结构。
- `--input-format` — 输入格式，默认为 `TSV`。
- `-F`, `--file` — 数据路径，默认为 `stdin`。
- `-q`, `--query` — 执行的查询，以 `;` 作为分隔符。可以多次指定 `--query`，例如 `--query "SELECT 1" --query "SELECT 2"`。不能与 `--queries-file` 同时使用。
- `--queries-file` - 包含要执行的查询的文件路径。可以多次指定 `--queries-file`，例如 `--query queries1.sql --query queries2.sql`。不能与 `--query` 同时使用。
- `--multiquery, -n` – 如果指定，可以在 `--query` 选项之后列出以分号分隔的多个查询。为了方便，也可以省略 `--query`，直接在 `--multiquery` 之后传递查询。
- `-N`, `--table` — 输出数据存放的表名，默认为 `table`。
- `-f`, `--format`, `--output-format` — 输出格式，默认为 `TSV`。
- `-d`, `--database` — 默认数据库，默认为 `_local`。
- `--stacktrace` — 在发生异常时是否转储调试输出。
- `--echo` — 在执行前打印查询。
- `--verbose` — 详细说明查询执行情况。
- `--logger.console` — 日志输出到控制台。
- `--logger.log` — 日志文件名。
- `--logger.level` — 日志级别。
- `--ignore-error` — 如果查询失败，不停止处理。
- `-c`, `--config-file` — 配置文件的路径，格式与 ClickHouse 服务器的相同，默认为空配置。
- `--no-system-tables` — 不附加系统表。
- `--help` — `clickhouse-local` 参数参考。
- `-V`, `--version` — 打印版本信息并退出。

此外，还有每个 ClickHouse 配置变量的参数，这些参数更常用，而不是 `--config-file`。


## 示例 {#examples}

```bash
$ echo -e "1,2\n3,4" | clickhouse-local --structure "a Int64, b Int64" \
    --input-format "CSV" --query "SELECT * FROM table"
Read 2 rows, 32.00 B in 0.000 sec., 5182 rows/sec., 80.97 KiB/sec.
1   2
3   4
```

前一个示例与以下内容相同：

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -n --query "
    CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin);
    SELECT a, b FROM table;
    DROP TABLE table;"
Read 2 rows, 32.00 B in 0.000 sec., 4987 rows/sec., 77.93 KiB/sec.
1   2
3   4
```

您不必使用 `stdin` 或 `--file` 参数，并且可以使用 [`file` 表函数](../../sql-reference/table-functions/file.md) 打开任意数量的文件：

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

现在让我们输出每个 Unix 用户的内存使用情况：

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

- [使用 clickhouse-local 提取、转换和查询本地文件中的数据](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)
- [将数据导入 ClickHouse - 第 1 部分](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)
- [探索大规模真实数据集：ClickHouse 中的 100 多年气象记录](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
- 博客：[使用 clickhouse-local 提取、转换和查询本地文件中的数据](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)

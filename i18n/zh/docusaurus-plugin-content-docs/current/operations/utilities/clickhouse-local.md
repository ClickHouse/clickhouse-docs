---
'description': 'Guide to using clickhouse-local for processing data without a server'
'sidebar_label': 'clickhouse-local'
'sidebar_position': 60
'slug': '/operations/utilities/clickhouse-local'
'title': 'clickhouse-local'
---




# clickhouse-local

## 使用 clickhouse-local 与 ClickHouse 的时机 {#when-to-use-clickhouse-local-vs-clickhouse}

`clickhouse-local` 是一个易于使用的 ClickHouse 版本，理想适用于需要使用 SQL 在本地和远程文件上进行快速处理的开发者，而无需安装完整的数据库服务器。通过 `clickhouse-local`，开发者可以直接从命令行使用 SQL 命令（使用 [ClickHouse SQL 语法](../../sql-reference/index.md)），提供了一种简单且高效的方式来访问 ClickHouse 功能，而无需完整的 ClickHouse 安装。`clickhouse-local` 的主要好处之一是它已经包含在安装 [clickhouse-client](/operations/utilities/clickhouse-local) 时。这意味着开发者可以快速开始使用 `clickhouse-local`，而无需复杂的安装过程。

虽然 `clickhouse-local` 是开发和测试目的以及处理文件的绝佳工具，但它不适合用于服务最终用户或应用程序。在这些情况下，建议使用开源的 [ClickHouse](/install)。ClickHouse 是一个强大的 OLAP 数据库，旨在处理大规模分析工作负载。它提供快速有效的大数据集复杂查询处理，特别适合在高性能至关重要的生产环境中使用。此外，ClickHouse 提供了广泛的功能，如复制、分片和高可用性，这对于扩展以处理大数据集和服务应用程序至关重要。如果您需要处理更大的数据集或服务最终用户或应用程序，建议使用开源的 ClickHouse，而不是 `clickhouse-local`。

请阅读下面的文档，了解 `clickhouse-local` 的示例用例，例如 [查询本地文件](#query_data_in_file) 或 [在 S3 中读取 parquet 文件](#query-data-in-a-parquet-file-in-aws-s3)。

## 下载 clickhouse-local {#download-clickhouse-local}

`clickhouse-local` 是使用与运行 ClickHouse 服务器和 `clickhouse-client` 相同的 `clickhouse` 二进制文件执行的。下载最新版本的最简单方法是使用以下命令：

```bash
curl https://clickhouse.com/ | sh
```

:::note
您刚下载的二进制文件可以运行各种 ClickHouse 工具和实用程序。如果您想将 ClickHouse 作为数据库服务器运行，请查看 [快速入门](../../quick-start.mdx)。
:::

## 使用 SQL 查询文件中的数据 {#query_data_in_file}

`clickhouse-local` 的一个常见用途是对文件运行临时查询：您不需要将数据插入到表中。`clickhouse-local` 可以将数据从文件流式传输到临时表中并执行您的 SQL。

如果文件位于与 `clickhouse-local` 相同的计算机上，您只需指定要加载的文件。以下 `reviews.tsv` 文件包含亚马逊产品评价的样本：

```bash
./clickhouse local -q "SELECT * FROM 'reviews.tsv'"
```

该命令是以下内容的快捷方式：

```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv')"
```

ClickHouse 知道该文件是使用文件名扩展名的制表符分隔格式。如果您需要显式指定格式，只需添加 [许多 ClickHouse 输入格式](../../interfaces/formats.md) 中的一个：
```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv', 'TabSeparated')"
```

`file` 表函数会创建一个表，您可以使用 `DESCRIBE` 查看推断的模式：

```bash
./clickhouse local -q "DESCRIBE file('reviews.tsv')"
```

:::tip
您可以在文件名中使用通配符（请参见 [通配符替换](http://clickhouse.com/docs/zh/sql-reference/table-functions/file.md/#globs-in-path)）。

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

如果您在 S3 中有一个文件，请使用 `clickhouse-local` 和 `s3` 表函数直接查询文件（而无需将数据插入到 ClickHouse 表中）。我们有一个名为 `house_0.parquet` 的文件，在一个公共桶中，包含在英国售出的房产价格。让我们看看它有多少行：

```bash
./clickhouse local -q "
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')"
```

该文件有 2.7M 行：

```response
2772030
```

查看 ClickHouse 从文件推断的模式总是很有用：

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

让我们看看最昂贵的邻里：

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
当您准备将文件插入 ClickHouse 时，请启动 ClickHouse 服务器，并将 `file` 和 `s3` 表函数的结果插入到 `MergeTree` 表中。有关更多详细信息，请查看 [快速入门](../../quick-start.mdx)。
:::


## 格式转换 {#format-conversions}

您可以使用 `clickhouse-local` 在不同格式之间转换数据。例如：

```bash
$ clickhouse-local --input-format JSONLines --output-format CSV --query "SELECT * FROM table" < data.json > data.csv
```

格式通过文件扩展名自动检测：

```bash
$ clickhouse-local --query "SELECT * FROM table" < data.json > data.csv
```

作为捷径，您可以使用 `--copy` 参数来编写：
```bash
$ clickhouse-local --copy < data.json > data.csv
```


## 用法 {#usage}

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
`clickhouse-local` 也通过 WSL2 在 Windows 上受支持。
:::

参数：

- `-S`, `--structure` — 输入数据的表结构。
- `--input-format` — 输入格式，默认是 `TSV`。
- `-F`, `--file` — 数据的路径，默认是 `stdin`。
- `-q`, `--query` — 要执行的查询，以 `;` 为分隔符。可以多次指定 `--query`，例如 `--query "SELECT 1" --query "SELECT 2"`。无法与 `--queries-file` 同时使用。
- `--queries-file` - 将要执行的查询的文件路径。可以多次指定 `--queries-file`，例如 `--query queries1.sql --query queries2.sql`。无法与 `--query` 同时使用。
- `--multiquery, -n` – 如果指定，可以在 `--query` 选项后列出多个由分号分隔的查询。为了方便，您还可以省略 `--query`，直接在 `--multiquery` 后传递查询。
- `-N`, `--table` — 输出数据的表名称，默认为 `table`。
- `-f`, `--format`, `--output-format` — 输出格式，默认是 `TSV`。
- `-d`, `--database` — 默认数据库，默认为 `_local`。
- `--stacktrace` — 在异常情况下是否转储调试输出。
- `--echo` — 在执行前打印查询。
- `--verbose` — 提供查询执行的更多细节。
- `--logger.console` — 日志输出到控制台。
- `--logger.log` — 日志文件名称。
- `--logger.level` — 日志级别。
- `--ignore-error` — 如果查询失败则不停止处理。
- `-c`, `--config-file` — 配置文件路径，格式与 ClickHouse 服务器相同，默认为空配置。
- `--no-system-tables` — 不附加系统表。
- `--help` — `clickhouse-local` 的参数参考。
- `-V`, `--version` — 打印版本信息并退出。

还存在每个 ClickHouse 配置变量的参数，这些参数更常用，而不是 `--config-file`。


## 示例 {#examples}

```bash
$ echo -e "1,2\n3,4" | clickhouse-local --structure "a Int64, b Int64" \
    --input-format "CSV" --query "SELECT * FROM table"
Read 2 rows, 32.00 B in 0.000 sec., 5182 rows/sec., 80.97 KiB/sec.
1   2
3   4
```

前面的示例与以下内容相同：

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -n --query "
    CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin);
    SELECT a, b FROM table;
    DROP TABLE table;"
Read 2 rows, 32.00 B in 0.000 sec., 4987 rows/sec., 77.93 KiB/sec.
1   2
3   4
```

您不必使用 `stdin` 或 `--file` 参数，也可以使用 [`file` 表函数](../../sql-reference/table-functions/file.md) 打开任意数量的文件：

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

现在我们输出每个 Unix 用户的内存使用情况：

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
- [探索庞大的真实数据集：100 多年的气象记录在 ClickHouse 中](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
- 博客：[使用 clickhouse-local 提取、转换和查询本地文件中的数据](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)

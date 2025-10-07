---
'slug': '/integrations/s3'
'sidebar_position': 1
'sidebar_label': '将 S3 与 ClickHouse 集成'
'title': '将 S3 与 ClickHouse 集成'
'description': '页面描述如何将 S3 与 ClickHouse 集成'
'doc_type': 'guide'
---

import BucketDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import S3J from '@site/static/images/integrations/data-ingestion/s3/s3-j.png';
import Bucket1 from '@site/static/images/integrations/data-ingestion/s3/bucket1.png';
import Bucket2 from '@site/static/images/integrations/data-ingestion/s3/bucket2.png';
import Image from '@theme/IdealImage';


# 集成 S3 与 ClickHouse

您可以将数据从 S3 插入 ClickHouse，也可以将 S3 作为导出目标，从而与“数据湖”架构进行交互。此外，S3 可以提供“冷”存储层，并协助分离存储与计算。在下面的章节中，我们使用纽约市出租车数据集演示数据在 S3 和 ClickHouse 之间移动的过程，同时识别关键配置参数并提供性能优化提示。
## S3 表函数 {#s3-table-functions}

`s3` 表函数允许您从 S3 兼容存储中读取和写入文件。此语法的大纲为：

```sql
s3(path, [aws_access_key_id, aws_secret_access_key,] [format, [structure, [compression]]])
```

其中：

* path — 包含文件路径的桶 URL。此选项支持在只读模式下使用以下通配符：`*`、`?`、`{abc,def}` 和 `{N..M}`，其中 `N`、`M` 是数字，`'abc'`、`'def'` 是字符串。有关更多信息，请参见文档 [使用路径中的通配符](/engines/table-engines/integrations/s3/#wildcards-in-path)。
* format — 文件的 [格式](/interfaces/formats#formats-overview)。
* structure — 表的结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。
* compression — 此参数是可选的。支持的值：`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。默认情况下，它将通过文件扩展名自动检测压缩。

在路径表达式中使用通配符可以引用多个文件并开启并行处理的可能性。
### 准备工作 {#preparation}

在 ClickHouse 中创建表之前，您可能希望先仔细查看 S3 桶中的数据。您可以直接使用 `DESCRIBE` 语句从 ClickHouse 中查看：

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

`DESCRIBE TABLE` 语句的输出应显示 ClickHouse 如何自动推断来自 S3 桶的此数据。请注意，它还会自动识别并解压缩 gzip 压缩格式：

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') SETTINGS describe_compact_output=1

┌─name──────────────────┬─type───────────────┐
│ trip_id               │ Nullable(Int64)    │
│ vendor_id             │ Nullable(Int64)    │
│ pickup_date           │ Nullable(Date)     │
│ pickup_datetime       │ Nullable(DateTime) │
│ dropoff_date          │ Nullable(Date)     │
│ dropoff_datetime      │ Nullable(DateTime) │
│ store_and_fwd_flag    │ Nullable(Int64)    │
│ rate_code_id          │ Nullable(Int64)    │
│ pickup_longitude      │ Nullable(Float64)  │
│ pickup_latitude       │ Nullable(Float64)  │
│ dropoff_longitude     │ Nullable(Float64)  │
│ dropoff_latitude      │ Nullable(Float64)  │
│ passenger_count       │ Nullable(Int64)    │
│ trip_distance         │ Nullable(String)   │
│ fare_amount           │ Nullable(String)   │
│ extra                 │ Nullable(String)   │
│ mta_tax               │ Nullable(String)   │
│ tip_amount            │ Nullable(String)   │
│ tolls_amount          │ Nullable(Float64)  │
│ ehail_fee             │ Nullable(Int64)    │
│ improvement_surcharge │ Nullable(String)   │
│ total_amount          │ Nullable(String)   │
│ payment_type          │ Nullable(String)   │
│ trip_type             │ Nullable(Int64)    │
│ pickup                │ Nullable(String)   │
│ dropoff               │ Nullable(String)   │
│ cab_type              │ Nullable(String)   │
│ pickup_nyct2010_gid   │ Nullable(Int64)    │
│ pickup_ctlabel        │ Nullable(Float64)  │
│ pickup_borocode       │ Nullable(Int64)    │
│ pickup_ct2010         │ Nullable(String)   │
│ pickup_boroct2010     │ Nullable(String)   │
│ pickup_cdeligibil     │ Nullable(String)   │
│ pickup_ntacode        │ Nullable(String)   │
│ pickup_ntaname        │ Nullable(String)   │
│ pickup_puma           │ Nullable(Int64)    │
│ dropoff_nyct2010_gid  │ Nullable(Int64)    │
│ dropoff_ctlabel       │ Nullable(Float64)  │
│ dropoff_borocode      │ Nullable(Int64)    │
│ dropoff_ct2010        │ Nullable(String)   │
│ dropoff_boroct2010    │ Nullable(String)   │
│ dropoff_cdeligibil    │ Nullable(String)   │
│ dropoff_ntacode       │ Nullable(String)   │
│ dropoff_ntaname       │ Nullable(String)   │
│ dropoff_puma          │ Nullable(Int64)    │
└───────────────────────┴────────────────────┘
```

为了与我们的 S3 基数据集交互，我们准备一个标准的 `MergeTree` 表作为目标。下面的语句在默认数据库中创建一个名为 `trips` 的表。注意我们选择修改一些上面推断出来的数据类型，特别是不使用 [`Nullable()`](/sql-reference/data-types/nullable) 数据类型修饰符，因为这可能导致一些不必要的额外存储数据和一些额外的性能开销：

```sql
CREATE TABLE trips
(
    `trip_id` UInt32,
    `vendor_id` Enum8('1' = 1, '2' = 2, '3' = 3, '4' = 4, 'CMT' = 5, 'VTS' = 6, 'DDS' = 7, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14, '' = 15),
    `pickup_date` Date,
    `pickup_datetime` DateTime,
    `dropoff_date` Date,
    `dropoff_datetime` DateTime,
    `store_and_fwd_flag` UInt8,
    `rate_code_id` UInt8,
    `pickup_longitude` Float64,
    `pickup_latitude` Float64,
    `dropoff_longitude` Float64,
    `dropoff_latitude` Float64,
    `passenger_count` UInt8,
    `trip_distance` Float64,
    `fare_amount` Float32,
    `extra` Float32,
    `mta_tax` Float32,
    `tip_amount` Float32,
    `tolls_amount` Float32,
    `ehail_fee` Float32,
    `improvement_surcharge` Float32,
    `total_amount` Float32,
    `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
    `trip_type` UInt8,
    `pickup` FixedString(25),
    `dropoff` FixedString(25),
    `cab_type` Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
    `pickup_nyct2010_gid` Int8,
    `pickup_ctlabel` Float32,
    `pickup_borocode` Int8,
    `pickup_ct2010` String,
    `pickup_boroct2010` String,
    `pickup_cdeligibil` String,
    `pickup_ntacode` FixedString(4),
    `pickup_ntaname` String,
    `pickup_puma` UInt16,
    `dropoff_nyct2010_gid` UInt8,
    `dropoff_ctlabel` Float32,
    `dropoff_borocode` UInt8,
    `dropoff_ct2010` String,
    `dropoff_boroct2010` String,
    `dropoff_cdeligibil` String,
    `dropoff_ntacode` FixedString(4),
    `dropoff_ntaname` String,
    `dropoff_puma` UInt16
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime
```

请注意在 `pickup_date` 字段上使用了 [分区](/engines/table-engines/mergetree-family/custom-partitioning-key)。通常，分区键用于数据管理，但稍后我们将使用此键来并行化写入 S3。

我们的出租车数据集中的每个条目都包含一次出租车行程。这些匿名数据包含在 S3 桶 https://datasets-documentation.s3.eu-west-3.amazonaws.com/ 下的 **nyc-taxi** 文件夹中压缩的 2000 万条记录。数据为 TSV 格式，每个文件约有 100 万行。
### 从 S3 读取数据 {#reading-data-from-s3}

我们可以将 S3 数据作为数据源进行查询，而无需在 ClickHouse 中持久化。 在以下查询中，我们取样 10 行。注意此处没有凭证，因为该桶是公开可用的：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
LIMIT 10;
```

请注意，我们不需要列出列，因为 `TabSeparatedWithNames` 格式在第一行中编码了列名。其他格式，如 `CSV` 或 `TSV`，将为此查询返回自动生成的列，例如 `c1`、`c2`、`c3` 等。

查询还支持 [虚拟列](../sql-reference/table-functions/s3#virtual-columns)，如 `_path` 和 `_file`，分别提供有关桶路径和文件名的信息。例如：

```sql
SELECT  _path, _file, trip_id
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_0.gz', 'TabSeparatedWithNames')
LIMIT 5;
```

```response
┌─_path──────────────────────────────────────┬─_file──────┬────trip_id─┐
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999902 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999919 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999944 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999969 │
│ datasets-documentation/nyc-taxi/trips_0.gz │ trips_0.gz │ 1199999990 │
└────────────────────────────────────────────┴────────────┴────────────┘
```

确认该示例数据集中行的数量。注意使用通配符进行文件扩展，因此我们考虑所有二十个文件。此查询将花费大约 10 秒，具体取决于 ClickHouse 实例上的核心数量：

```sql
SELECT count() AS count
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

```response
┌────count─┐
│ 20000000 │
└──────────┘
```

虽然从 S3 直接读取数据对于取样和执行即席的探索性查询非常有用，但这并不是您希望定期进行的操作。当是时候认真处理时，请将数据导入 ClickHouse 的 `MergeTree` 表中。
### 使用 clickhouse-local {#using-clickhouse-local}

`clickhouse-local` 程序使您能够在不部署和配置 ClickHouse 服务器的情况下对本地文件进行快速处理。使用此实用程序可以执行任何使用 `s3` 表函数的查询。例如：

```sql
clickhouse-local --query "SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```
### 从 S3 插入数据 {#inserting-data-from-s3}

为了充分利用 ClickHouse 的功能，我们接下来读取并将数据插入到我们的实例中。我们将 `s3` 函数与简单的 `INSERT` 语句组合来实现此目的。请注意，我们不需要列出列，因为我们的目标表提供所需的结构。这要求列按在表 DDL 语句中指定的顺序出现：列根据它们在 `SELECT` 子句中的位置进行映射。插入 1000 万行的操作可能需要几分钟，具体取决于 ClickHouse 实例。下面我们插入 100 万行以确保快速响应。根据需要调整 `LIMIT` 子句或列选择以导入子集：

```sql
INSERT INTO trips
   SELECT *
   FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
   LIMIT 1000000;
```
### 使用 ClickHouse Local 进行远程插入 {#remote-insert-using-clickhouse-local}

如果网络安全策略阻止 ClickHouse 集群进行外部连接，您可以使用 `clickhouse-local` 可能插入 S3 数据。在下面的示例中，我们从 S3 桶读取并使用 `remote` 函数插入 ClickHouse：

```sql
clickhouse-local --query "INSERT INTO TABLE FUNCTION remote('localhost:9000', 'default.trips', 'username', 'password') (*) SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

:::note
要通过安全的 SSL 连接执行此操作，请利用 `remoteSecure` 函数。
:::
### 导出数据 {#exporting-data}

您可以使用 `s3` 表函数将数据写入 S3 中的文件。这将需要适当的权限。我们在请求中传递所需的凭证，但请查看 [管理凭证](#managing-credentials) 页面以获取更多选项。

在下面的简单示例中，我们将表函数用作目标而不是源。在这里，我们将 10,000 行从 `trips` 表流向一个桶，指定 `lz4` 压缩和 `CSV` 输出类型：

```sql
INSERT INTO FUNCTION
   s3(
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/csv/trips.csv.lz4',
       's3_key',
       's3_secret',
       'CSV'
    )
SELECT *
FROM trips
LIMIT 10000;
```

请注意，文件的格式是从扩展名推断出的。我们也不需要在 `s3` 函数中指定列 - 这可以从 `SELECT` 中推断。
### 切分大文件 {#splitting-large-files}

不太可能您希望将数据导出为单个文件。大多数工具，包括 ClickHouse，在读取和写入多个文件时将获得更高的吞吐性能，因为可能性支持并行性。我们可以多次执行 `INSERT` 命令，针对数据的子集。ClickHouse 提供了一种使用 `PARTITION` 键自动切分文件的方法。

在下面的示例中，我们使用 `rand()` 函数的模数创建十个文件。请注意，结果分区 ID 在文件名中引用。这导致生成十个带有数字后缀的文件，例如 `trips_0.csv.lz4`、`trips_1.csv.lz4` 等：

```sql
INSERT INTO FUNCTION
   s3(
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/csv/trips_{_partition_id}.csv.lz4',
       's3_key',
       's3_secret',
       'CSV'
    )
    PARTITION BY rand() % 10
SELECT *
FROM trips
LIMIT 100000;
```

另外，我们可以引用数据中的一个字段。对于此数据集，`payment_type` 提供了一个自然的分区键，基数为 5。

```sql
INSERT INTO FUNCTION
   s3(
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/csv/trips_{_partition_id}.csv.lz4',
       's3_key',
       's3_secret',
       'CSV'
    )
    PARTITION BY payment_type
SELECT *
FROM trips
LIMIT 100000;
```
### 利用集群 {#utilizing-clusters}

上述函数都被限制在单个节点上执行。读取速度将与 CPU 核心数量线性扩展，直到其他资源（通常是网络）饱和，允许用户进行垂直扩展。然而，这种方法也有限制。虽然用户可以通过在执行 `INSERT INTO SELECT` 查询时插入到分布式表来缓解一些资源压力，但这仍然会导致单个节点读取、解析和处理数据。为了解决这一挑战并让我们能够水平扩展读取，我们有了 [s3Cluster](/sql-reference/table-functions/s3Cluster.md) 函数。

接收查询的节点称为发起者，会创建与集群中每个节点的连接。确定需要读取的文件的 glob 模式被解析为一组文件。发起者将文件分配给集群中的节点，这些节点充当工作节点。这些工作节点会在完成读取时请求要处理的文件。此过程确保我们能够水平扩展读取。

`s3Cluster` 函数的格式与单节点变体相同，只是需要指定目标集群以标识工作节点：

```sql
s3Cluster(cluster_name, source, [access_key_id, secret_access_key,] format, structure)
```

* `cluster_name` — 用于构建与远程和本地服务器的地址和连接参数集的集群名称。
* `source` — 文件或一组文件的 URL。在只读模式下支持以下通配符：`*`、`?`、`{'abc','def'}` 和 `{N..M}`，其中 N、M 为数字，abc、def 为字符串。有关更多信息，请参见 [路径中的通配符](/engines/table-engines/integrations/s3.md/#wildcards-in-path)。
* `access_key_id` 和 `secret_access_key` — 指定用于与给定终端点交互的凭证密钥。可选。
* `format` — 文件的 [格式](/interfaces/formats#formats-overview)。
* `structure` — 表的结构。格式为 'column1_name column1_type, column2_name column2_type, ...'。

与任何 `s3` 函数一样，如果桶不安全或您通过环境定义安全，则凭证是可选的，例如，IAM 角色。然而，与 s3 函数不同，自 22.3.1 起，必须在请求中指定结构，即，不推断模式。

此函数在大多数情况下将用作 `INSERT INTO SELECT` 的一部分。在这种情况下，您通常会插入到分布式表。下面我们分别展示了一个简单的示例，其中 trips_all 是一个分布式表。虽然此表使用事件集群，但读取和写入所用节点的一致性不是必需的：

```sql
INSERT INTO default.trips_all
   SELECT *
   FROM s3Cluster(
       'events',
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz',
       'TabSeparatedWithNames'
    )
```

插入将发生在发起者节点上。这意味着虽然在每个节点上都会进行读取，但结果行将路由到发起者进行分发。在高吞吐量场景中，这可能会成为瓶颈。为了解决这个问题，为 `s3cluster` 函数设置参数 [parallel_distributed_insert_select](/operations/settings/settings/#parallel_distributed_insert_select)。
## S3 表引擎 {#s3-table-engines}

虽然 `s3` 函数允许对存储在 S3 中的数据执行即席查询，但它们的语法冗长。`S3` 表引擎允许您无需反复指定桶 URL 和凭证。为此，ClickHouse 提供了 S3 表引擎。

```sql
CREATE TABLE s3_engine_table (name String, value UInt32)
    ENGINE = S3(path, [aws_access_key_id, aws_secret_access_key,] format, [compression])
    [SETTINGS ...]
```

* `path` — 包含文件路径的桶 URL。支持以下通配符在只读模式下使用：`*`、`?`、`{abc,def}` 和 `{N..M}`，其中 N、M — 数字，'abc'、'def' — 字符串。有关更多信息，请参见 [这里](/engines/table-engines/integrations/s3#wildcards-in-path)。
* `format` — 文件的 [格式](/interfaces/formats#formats-overview)。
* `aws_access_key_id`、`aws_secret_access_key` - AWS 账户用户的长期凭证。您可以使用这些凭证进行请求认证。此参数是可选的。如果未指定凭证，则使用配置文件值。有关更多信息，请参见 [管理凭证](#managing-credentials)。
* `compression` — 压缩类型。支持的值：none、gzip/gz、brotli/br、xz/LZMA、zstd/zst。此参数是可选的。默认情况下，它会通过文件扩展名自动检测压缩。
### 读取数据 {#reading-data}

在以下示例中，我们创建一个名为 `trips_raw` 的表，使用位于 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/` 桶中的前十个 TSV 文件。每个文件包含 100 万行：

```sql
CREATE TABLE trips_raw
(
   `trip_id`               UInt32,
   `vendor_id`             Enum8('1' = 1, '2' = 2, '3' = 3, '4' = 4, 'CMT' = 5, 'VTS' = 6, 'DDS' = 7, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14, '' = 15),
   `pickup_date`           Date,
   `pickup_datetime`       DateTime,
   `dropoff_date`          Date,
   `dropoff_datetime`      DateTime,
   `store_and_fwd_flag`    UInt8,
   `rate_code_id`          UInt8,
   `pickup_longitude`      Float64,
   `pickup_latitude`       Float64,
   `dropoff_longitude`     Float64,
   `dropoff_latitude`      Float64,
   `passenger_count`       UInt8,
   `trip_distance`         Float64,
   `fare_amount`           Float32,
   `extra`                 Float32,
   `mta_tax`               Float32,
   `tip_amount`            Float32,
   `tolls_amount`          Float32,
   `ehail_fee`             Float32,
   `improvement_surcharge` Float32,
   `total_amount`          Float32,
   `payment_type_`         Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
   `trip_type`             UInt8,
   `pickup`                FixedString(25),
   `dropoff`               FixedString(25),
   `cab_type`              Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
   `pickup_nyct2010_gid`   Int8,
   `pickup_ctlabel`        Float32,
   `pickup_borocode`       Int8,
   `pickup_ct2010`         String,
   `pickup_boroct2010`     FixedString(7),
   `pickup_cdeligibil`     String,
   `pickup_ntacode`        FixedString(4),
   `pickup_ntaname`        String,
   `pickup_puma`           UInt16,
   `dropoff_nyct2010_gid`  UInt8,
   `dropoff_ctlabel`       Float32,
   `dropoff_borocode`      UInt8,
   `dropoff_ct2010`        String,
   `dropoff_boroct2010`    FixedString(7),
   `dropoff_cdeligibil`    String,
   `dropoff_ntacode`       FixedString(4),
   `dropoff_ntaname`       String,
   `dropoff_puma`          UInt16
) ENGINE = S3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{0..9}.gz', 'TabSeparatedWithNames', 'gzip');
```

请注意使用 `{0..9}` 模式来限制为前十个文件。创建后，我们可以像查询任何其他表一样查询此表：

```sql
SELECT DISTINCT(pickup_ntaname)
FROM trips_raw
LIMIT 10;

┌─pickup_ntaname───────────────────────────────────┐
│ Lenox Hill-Roosevelt Island                      │
│ Airport                                          │
│ SoHo-TriBeCa-Civic Center-Little Italy           │
│ West Village                                     │
│ Chinatown                                        │
│ Hudson Yards-Chelsea-Flatiron-Union Square       │
│ Turtle Bay-East Midtown                          │
│ Upper West Side                                  │
│ Murray Hill-Kips Bay                             │
│ DUMBO-Vinegar Hill-Downtown Brooklyn-Boerum Hill │
└──────────────────────────────────────────────────┘
```
### 插入数据 {#inserting-data}

`S3` 表引擎支持并行读取。当表定义包含 glob 模式时，则只支持写入。因此，上述表将会阻止写入。

为了演示写入，创建一个指向可写 S3 桶的表：

```sql
CREATE TABLE trips_dest
(
   `trip_id`               UInt32,
   `pickup_date`           Date,
   `pickup_datetime`       DateTime,
   `dropoff_datetime`      DateTime,
   `tip_amount`            Float32,
   `total_amount`          Float32
) ENGINE = S3('<bucket path>/trips.bin', 'Native');
```

```sql
INSERT INTO trips_dest
   SELECT
      trip_id,
      pickup_date,
      pickup_datetime,
      dropoff_datetime,
      tip_amount,
      total_amount
   FROM trips
   LIMIT 10;
```

```sql
SELECT * FROM trips_dest LIMIT 5;
```

```response
┌────trip_id─┬─pickup_date─┬─────pickup_datetime─┬────dropoff_datetime─┬─tip_amount─┬─total_amount─┐
│ 1200018648 │  2015-07-01 │ 2015-07-01 00:00:16 │ 2015-07-01 00:02:57 │          0 │          7.3 │
│ 1201452450 │  2015-07-01 │ 2015-07-01 00:00:20 │ 2015-07-01 00:11:07 │       1.96 │        11.76 │
│ 1202368372 │  2015-07-01 │ 2015-07-01 00:00:40 │ 2015-07-01 00:05:46 │          0 │          7.3 │
│ 1200831168 │  2015-07-01 │ 2015-07-01 00:01:06 │ 2015-07-01 00:09:23 │          2 │         12.3 │
│ 1201362116 │  2015-07-01 │ 2015-07-01 00:01:07 │ 2015-07-01 00:03:31 │          0 │          5.3 │
└────────────┴─────────────┴─────────────────────┴─────────────────────┴────────────┴──────────────┘
```

请注意，行只能插入到新文件中。没有合并周期或文件切分操作。文件写入后，后续插入将失败。用户有两个选项：

* 指定设置 `s3_create_new_file_on_insert=1`。这将导致每次插入时创建新文件。数值后缀将附加到每个文件的后面，并在每次插入操作中单调增加。对于上述示例，后续插入将导致创建 `trips_1.bin` 文件。
* 指定设置 `s3_truncate_on_insert=1`。这将导致文件截断，即只会在完成后包含新插入的行。

这两个设置的默认值均为 0 - 因此强制用户设置其中一个。如果同时设置了 `s3_truncate_on_insert`，则优先级更高。

关于 `S3` 表引擎的一些注意事项：

- 与传统的 `MergeTree` 家族表不同，删除 `S3` 表不会删除底层数据。
- 此表类型的完整设置可以在 [这里](/engines/table-engines/integrations/s3.md/#settings)找到。
- 使用此引擎时需注意以下警告：
  * 不支持 ALTER 查询
  * 不支持 SAMPLE 操作
  * 没有索引的概念，即主键或跳过。
## 管理凭证 {#managing-credentials}

在前面的示例中，我们在 `s3` 函数或 `S3` 表定义中传递了凭证。虽然这可能适用于偶尔使用，但用户在生产中需要较少显式的认证机制。为此，ClickHouse 提供了几种选择：

* 在 **config.xml** 或等效配置文件的 **conf.d** 中指定连接详细信息。下面是示例文件的内容，假设使用 Debian 包进行安装。

```xml
ubuntu@single-node-clickhouse:/etc/clickhouse-server/config.d$ cat s3.xml
<clickhouse>
    <s3>
        <endpoint-name>
            <endpoint>https://dalem-files.s3.amazonaws.com/test/</endpoint>
            <access_key_id>key</access_key_id>
            <secret_access_key>secret</secret_access_key>
            <!-- <use_environment_credentials>false</use_environment_credentials> -->
            <!-- <header>Authorization: Bearer SOME-TOKEN</header> -->
        </endpoint-name>
    </s3>
</clickhouse>
```

    这些凭证将用于请求 URL 的确切前缀匹配的任何请求。此外，请注意在此示例中可以声明授权头作为访问和秘密密钥的替代方案。支持的设置的完整列表可以在 [这里](/engines/table-engines/integrations/s3.md/#settings)找到。

* 上面的示例强调了配置参数 `use_environment_credentials` 的可用性。该配置参数也可以在 `s3` 级别全局设置：

```xml
<clickhouse>
    <s3>
    <use_environment_credentials>true</use_environment_credentials>
    </s3>
</clickhouse>
```

    此设置启用试图从环境中检索 S3 凭证，从而通过 IAM 角色进行访问。具体而言，执行以下顺序的检索：

  * 查找环境变量 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY` 和 `AWS_SESSION_TOKEN`
  * 在 **$HOME/.aws** 中执行检查
  * 通过 AWS 安全令牌服务获得的临时凭证 - 即通过 [`AssumeRole`](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) API
  * 检查 ECS 环境变量 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` 或 `AWS_CONTAINER_CREDENTIALS_FULL_URI` 及 `AWS_ECS_CONTAINER_AUTHORIZATION_TOKEN` 的凭证。
  * 通过 [Amazon EC2 实例元数据](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-metadata.html) 获取凭证，前提是 [AWS_EC2_METADATA_DISABLED](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-list-AWS_EC2_METADATA_DISABLED) 没有设置为 true。
  * 同样的设置也可以针对特定终端点进行设置，使用相同的前缀匹配规则。
## 性能优化 {#s3-optimizing-performance}

有关如何优化使用 S3 函数进行读取和插入的详细信息，请参见 [专门的性能指南](./performance.md)。
### S3 存储调优 {#s3-storage-tuning}

在内部，ClickHouse MergeTree 使用两种主要存储格式：[`Wide` 和 `Compact`](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)。虽然当前实现使用 ClickHouse 的默认行为（通过设置 `min_bytes_for_wide_part` 和 `min_rows_for_wide_part` 控制），我们期望未来的版本中 S3 的行为会有所不同，例如，较大的默认值 `min_bytes_for_wide_part` 鼓励使用更加的`Compact` 格式，从而减少文件数量。用户可能希望在专门使用 S3 存储时调整这些设置。
## S3 支持的 MergeTree {#s3-backed-mergetree}

`s3` 函数和相关表引擎使我们能够使用熟悉的 ClickHouse 语法查询 S3 中的数据。然而，就数据管理功能和性能而言，它们存在一些局限性。主索引不受支持，不支持缓存，文件插入需要用户进行管理。

ClickHouse 认为 S3 是一个具有吸引力的存储解决方案，特别是在对“冷”数据的查询性能不那么关键时，用户寻求分离存储和计算。为帮助实现这一目标，支持将 S3 用作 MergeTree 引擎的存储。这将使用户能够利用 S3 的可扩展性和成本效益，以及 MergeTree 引擎的插入和查询性能。
### 存储层 {#storage-tiers}

ClickHouse 存储卷允许物理磁盘从 MergeTree 表引擎中抽象出来。任何单个卷可以由一组有序的磁盘组成。虽然原则上允许使用多个块设备进行数据存储，但这种抽象也允许其他存储类型，包括 S3。ClickHouse 数据部分可以在卷之间移动，并根据存储策略调整填充率，从而创建存储层的概念。

存储层解锁了热-冷架构，其中最近的数据（通常也是被查询最多的数据）仅需占用高速存储（例如 NVMe SSDs）上的少量空间。随着数据的老化，查询时间的服务水平协议（SLAs）越来越高，查询频率也随之增加。这些大量数据可以存储在较慢、性能较低的存储上，例如 HDD 或对象存储，例如 S3。
### 创建磁盘 {#creating-a-disk}

要将 S3 桶作为磁盘使用，我们必须先在 ClickHouse 配置文件中声明它。可以扩展 config.xml，或者更好地在 conf.d 下提供一个新文件。下面是 S3 磁盘声明的示例：

```xml
<clickhouse>
    <storage_configuration>
        ...
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>https://sample-bucket.s3.us-east-2.amazonaws.com/tables/</endpoint>
                <access_key_id>your_access_key_id</access_key_id>
                <secret_access_key>your_secret_access_key</secret_access_key>
                <region></region>
                <metadata_path>/var/lib/clickhouse/disks/s3/</metadata_path>
            </s3>
            <s3_cache>
                <type>cache</type>
                <disk>s3</disk>
                <path>/var/lib/clickhouse/disks/s3_cache/</path>
                <max_size>10Gi</max_size>
            </s3_cache>
        </disks>
        ...
    </storage_configuration>
</clickhouse>

```

与此磁盘声明相关的完整设置列表可以在 [这里](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) 找到。请注意，此处可以使用在 [管理凭证](#managing-credentials) 中描述的相同方法来管理凭证，即在上述设置区块中可以将 use_environment_credentials 设置为 true 以使用 IAM 角色。
### 创建存储策略 {#creating-a-storage-policy}

配置完成后，可以在策略中声明的存储卷中使用此“磁盘”。以下示例假设 s3 是我们唯一的存储。这忽略了更复杂的热-冷架构，其中数据可以根据 TTL 和填充率进行重新定位。

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3>
            ...
            </s3>
            <s3_cache>
            ...
            </s3_cache>
        </disks>
        <policies>
            <s3_main>
                <volumes>
                    <main>
                        <disk>s3</disk>
                    </main>
                </volumes>
            </s3_main>
        </policies>
    </storage_configuration>
</clickhouse>
```
### 创建表 {#creating-a-table}

假设您已配置磁盘以使用具有写入访问权限的桶，则应该能够创建如下例所示的表。为了简洁起见，我们使用一些 NYC 出租车列的子集，并直接将数据流向 S3 支持的表：

```sql
CREATE TABLE trips_s3
(
   `trip_id` UInt32,
   `pickup_date` Date,
   `pickup_datetime` DateTime,
   `dropoff_datetime` DateTime,
   `pickup_longitude` Float64,
   `pickup_latitude` Float64,
   `dropoff_longitude` Float64,
   `dropoff_latitude` Float64,
   `passenger_count` UInt8,
   `trip_distance` Float64,
   `tip_amount` Float32,
   `total_amount` Float32,
   `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime
SETTINGS storage_policy='s3_main'
```

```sql
INSERT INTO trips_s3 SELECT trip_id, pickup_date, pickup_datetime, dropoff_datetime, pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, passenger_count, trip_distance, tip_amount, total_amount, payment_type FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
```

根据硬件，最后插入百万行的操作可能需要几分钟才能执行。您可以通过 system.processes 表确认进度。请随意将行计数调整到 1000 万的限制，并探索一些示例查询。

```sql
SELECT passenger_count, avg(tip_amount) AS avg_tip, avg(total_amount) AS avg_amount FROM trips_s3 GROUP BY passenger_count;
```
### 修改表 {#modifying-a-table}

用户有时可能需要修改特定表的存储策略。虽然这有可能，但会有一些限制。新的目标策略必须包含上一个策略的所有磁盘和卷，即数据不会迁移以满足策略更改。在验证这些约束时，卷和磁盘将通过其名称进行标识，违反的尝试将导致错误。然而，假设您使用前面的示例，以下更改是有效的。

```xml
<policies>
   <s3_main>
       <volumes>
           <main>
               <disk>s3</disk>
           </main>
       </volumes>
   </s3_main>
   <s3_tiered>
       <volumes>
           <hot>
               <disk>default</disk>
           </hot>
           <main>
               <disk>s3</disk>
           </main>
       </volumes>
       <move_factor>0.2</move_factor>
   </s3_tiered>
</policies>
```

```sql
ALTER TABLE trips_s3 MODIFY SETTING storage_policy='s3_tiered'
```

在这里，我们在新的 s3_tiered 策略中重用主要卷，并引入一个新的热卷。这使用默认磁盘，该磁盘仅由通过参数 `<path>` 配置的一个磁盘组成。请注意，我们的卷名称和磁盘没有变化。对我们表的新插入将驻留在默认磁盘上，直到达到 move_factor * disk_size - 此时数据将被重新定位到 S3。
### 处理复制 {#handling-replication}

使用 S3 磁盘的复制可以通过使用 `ReplicatedMergeTree` 表引擎来实现。有关详情，请参见 [在两个 AWS 区域之间使用 S3 对象存储复制单个分片](#s3-multi-region) 的指南。
### 读取和写入 {#read--writes}

以下注释涵盖了 S3 与 ClickHouse 交互的实现。虽然一般只是提供信息，但它可能有助于读者在 [性能优化](#s3-optimizing-performance) 时：

* 默认情况下，查询处理管道中任何阶段使用的最大查询处理线程数等于核心数。某些阶段比其他阶段更具并行性，因此此值提供了上限。由于数据是通过磁盘流式传输的，因此可能同时执行多个查询阶段。对于单个查询使用的确切线程数可能因此超过此值。通过设置 [max_threads](/operations/settings/settings#max_threads) 进行修改。
* S3 上的读取默认是异步的。这一行为是由设置 `remote_filesystem_read_method` 决定的，默认值为 `threadpool`。在处理请求时，ClickHouse 会按条带读取颗粒。每个条带通常包含许多列。一个线程会逐一读取其颗粒的列。线程不会同步执行，而是在等待数据之前对所有列进行预取。这提供了显著的性能提升，相较于在每列上进行同步等待。在大多数情况下，用户无需更改此设置 - 请参见 [性能优化](#s3-optimizing-performance)。
* 写入是并行执行的，最多支持 100 个并发文件写入线程。`max_insert_delayed_streams_for_parallel_write`，其默认值为 1000，控制并行写入的 S3 blob 数量。由于每个写入的文件需要一个缓冲区（约1MB），这会有效限制 INSERT 的内存消耗。在低服务器内存场景下，适当降低此值可能是合适的。
## 使用 S3 对象存储作为 ClickHouse 磁盘 {#configuring-s3-for-clickhouse-use}

如果您需要创建桶和 IAM 角色的逐步说明，请展开 **创建 S3 桶和 IAM 角色** 并按指示操作：

<BucketDetails />
### 配置 ClickHouse 使用 S3 桶作为磁盘 {#configure-clickhouse-to-use-the-s3-bucket-as-a-disk}
以下示例基于在服务中安装的 Linux Deb 包，默认 ClickHouse 目录。

1. 在 ClickHouse 的 `config.d` 目录中创建一个新文件以存储存储配置。
```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```
2. 添加以下内容以进行存储配置；替换早期步骤中的桶路径、访问密钥和秘密密钥
```xml
<clickhouse>
  <storage_configuration>
    <disks>
      <s3_disk>
        <type>s3</type>
        <endpoint>https://mars-doc-test.s3.amazonaws.com/clickhouse3/</endpoint>
        <access_key_id>ABC123</access_key_id>
        <secret_access_key>Abc+123</secret_access_key>
        <metadata_path>/var/lib/clickhouse/disks/s3_disk/</metadata_path>
      </s3_disk>
      <s3_cache>
        <type>cache</type>
        <disk>s3_disk</disk>
        <path>/var/lib/clickhouse/disks/s3_cache/</path>
        <max_size>10Gi</max_size>
      </s3_cache>
    </disks>
    <policies>
      <s3_main>
        <volumes>
          <main>
            <disk>s3_disk</disk>
          </main>
        </volumes>
      </s3_main>
    </policies>
  </storage_configuration>
</clickhouse>
```

:::note
`<disks>` 标签中的 `s3_disk` 和 `s3_cache` 标签是任意标签。可以将它们设置为其他值，但必须在 `<policies>` 标签下的 `<disk>` 标签中使用相同的标签来引用磁盘。
`<S3_main>` 标签也是任意的，是将在 ClickHouse 创建资源时用作标识存储目标的策略名称。

上面显示的配置适用于 ClickHouse 版本22.8或更高版本，如果您使用的是旧版本，请参见 [存储数据](/operations/storing-data.md/#using-local-cache) 文档。

有关使用 S3 的更多信息：
集成指南：[S3 支持的 MergeTree](#s3-backed-mergetree)
:::

3. 将文件的所有者更新为 `clickhouse` 用户和组
```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```
4. 重新启动 ClickHouse 实例以使更改生效。
```bash
service clickhouse-server restart
```
### 测试 {#testing}
1. 使用 ClickHouse 客户端登录，示例为以下类似内容
```bash
clickhouse-client --user default --password ClickHouse123!
```
2. 创建一个指定新 S3 存储策略的表
```sql
CREATE TABLE s3_table1
           (
               `id` UInt64,
               `column1` String
           )
           ENGINE = MergeTree
           ORDER BY id
           SETTINGS storage_policy = 's3_main';
```

3. 显示已使用正确策略创建的表
```sql
SHOW CREATE TABLE s3_table1;
```
```response
┌─statement────────────────────────────────────────────────────
│ CREATE TABLE default.s3_table1
(
    `id` UInt64,
    `column1` String
)
ENGINE = MergeTree
ORDER BY id
SETTINGS storage_policy = 's3_main', index_granularity = 8192
└──────────────────────────────────────────────────────────────
```

4. 将测试行插入该表
```sql
INSERT INTO s3_table1
           (id, column1)
           VALUES
           (1, 'abc'),
           (2, 'xyz');
```
```response
INSERT INTO s3_table1 (id, column1) FORMAT Values

Query id: 0265dd92-3890-4d56-9d12-71d4038b85d5

Ok.

2 rows in set. Elapsed: 0.337 sec.
```
5. 查看行
```sql
SELECT * FROM s3_table1;
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ xyz     │
└────┴─────────┘

2 rows in set. Elapsed: 0.284 sec.
```
6. 在 AWS 控制台中，导航到桶，选择新建的桶和文件夹。
您应该会看到以下内容：

<Image img={S3J} size="lg" border alt="在 AWS 控制台中显示 ClickHouse 数据文件存储在 S3 中的 S3 桶视图" />
## 在两个 AWS 区域使用 S3 对象存储复制单个分片 {#s3-multi-region}

:::tip
在 ClickHouse Cloud 中默认使用对象存储，如果您在 ClickHouse Cloud 中运行，则无需遵循此过程。
:::
### 规划部署 {#plan-the-deployment}
本教程基于在 AWS EC2 中部署两个 ClickHouse 服务器节点和三个 ClickHouse Keeper 节点。ClickHouse 服务器的数据存储是 S3。在两个 AWS 区域中使用每个区域中各有一个 ClickHouse 服务器和一个 S3 桶，以支持灾难恢复。

ClickHouse 表在两个服务器之间进行复制，因此在两个区域之间。
### 安装软件 {#install-software}
#### ClickHouse 服务器节点 {#clickhouse-server-nodes}
在 ClickHouse 服务器节点上执行部署步骤时，请参阅 [安装说明](/getting-started/install/install.mdx)。
#### 部署 ClickHouse {#deploy-clickhouse}

在两个主机上部署 ClickHouse，在示例配置中，分别命名为 `chnode1`、`chnode2`。

将 `chnode1` 放置在一个 AWS 区域中，而将 `chnode2` 放置在第二个区域中。
#### 部署 ClickHouse Keeper {#deploy-clickhouse-keeper}

在三台主机上部署 ClickHouse Keeper，在示例配置中命名为 `keepernode1`、`keepernode2` 和 `keepernode3`。`keepernode1` 可以在与 `chnode1` 相同的区域中部署，`keepernode2` 可以与 `chnode2` 同时部署，`keepernode3` 则可以在任何区域，但要与该区域的 ClickHouse 节点位于不同的可用区。

在 ClickHouse Keeper 节点执行部署步骤时，请参阅 [安装说明](/getting-started/install/install.mdx)。
### 创建 S3 桶 {#create-s3-buckets}

在您放置 `chnode1` 和 `chnode2` 的每个区域中创建两个 S3 桶。

如果您需要逐步说明以创建桶和 IAM 角色，请展开 **创建 S3 桶和 IAM 角色** 并按指示操作：

<BucketDetails />

然后将配置文件放置在 `/etc/clickhouse-server/config.d/` 中。以下是一个桶的示例配置文件，另一个与其相似，但有三行不同：

```xml title="/etc/clickhouse-server/config.d/storage_config.xml"
<clickhouse>
  <storage_configuration>
     <disks>
        <s3_disk>
           <type>s3</type>
        <!--highlight-start-->
           <endpoint>https://docs-clickhouse-s3.s3.us-east-2.amazonaws.com/clickhouses3/</endpoint>
           <access_key_id>ABCDEFGHIJKLMNOPQRST</access_key_id>
           <secret_access_key>Tjdm4kf5snfkj303nfljnev79wkjn2l3knr81007</secret_access_key>
        <!--highlight-end-->
           <metadata_path>/var/lib/clickhouse/disks/s3_disk/</metadata_path>
        </s3_disk>

        <s3_cache>
           <type>cache</type>
           <disk>s3_disk</disk>
           <path>/var/lib/clickhouse/disks/s3_cache/</path>
           <max_size>10Gi</max_size>
        </s3_cache>
     </disks>
        <policies>
            <s3_main>
                <volumes>
                    <main>
                        <disk>s3_disk</disk>
                    </main>
                </volumes>
            </s3_main>
    </policies>
   </storage_configuration>
</clickhouse>
```
:::note
本指南中的许多步骤将要求您将配置文件放在 `/etc/clickhouse-server/config.d/` 中。 这是 Linux 系统上配置覆盖文件的默认位置。将这些文件放入该目录后，ClickHouse 将使用内容覆盖默认配置。通过将这些文件放在覆盖目录中，您可以避免在升级时丢失配置。
:::
### 配置 ClickHouse Keeper {#configure-clickhouse-keeper}

当以独立方式运行 ClickHouse Keeper（与 ClickHouse 服务器分开）时，配置为单个 XML 文件。在本教程中，该文件为 `/etc/clickhouse-keeper/keeper_config.xml`。所有三个 Keeper 服务器使用相同的配置，只有一项设置不同；`<server_id>`。

`server_id` 表示分配给使用配置文件的主机的 ID。在以下示例中，`server_id` 为 `3`，如果您向下查找文件中的 `<raft_configuration>` 部分，您会看到服务器 3 的主机名为 `keepernode3`。这就是 ClickHouse Keeper 进程在选择领导者和所有其他操作时了解到连接到其他服务器的方式。

```xml title="/etc/clickhouse-keeper/keeper_config.xml"
<clickhouse>
    <logger>
        <level>trace</level>
        <log>/var/log/clickhouse-keeper/clickhouse-keeper.log</log>
        <errorlog>/var/log/clickhouse-keeper/clickhouse-keeper.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
<!--highlight-next-line-->
        <server_id>3</server_id>
        <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
        <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

        <coordination_settings>
            <operation_timeout_ms>10000</operation_timeout_ms>
            <session_timeout_ms>30000</session_timeout_ms>
            <raft_logs_level>warning</raft_logs_level>
        </coordination_settings>

        <raft_configuration>
            <server>
                <id>1</id>
                <hostname>keepernode1</hostname>
                <port>9234</port>
            </server>
            <server>
                <id>2</id>
                <hostname>keepernode2</hostname>
                <port>9234</port>
            </server>
<!--highlight-start-->
            <server>
                <id>3</id>
                <hostname>keepernode3</hostname>
                <port>9234</port>
            </server>
<!--highlight-end-->
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

将 ClickHouse Keeper 的配置文件复制到指定位置（记得设置 `<server_id>`）：
```bash
sudo -u clickhouse \
  cp keeper.xml /etc/clickhouse-keeper/keeper.xml
```
### 配置 ClickHouse 服务器 {#configure-clickhouse-server}
#### 定义集群 {#define-a-cluster}

ClickHouse 集群在配置的 `<remote_servers>` 部分中定义。在此示例中，定义了一个集群 `cluster_1S_2R`，它由一个分片和两个副本组成。副本位于主机 `chnode1` 和 `chnode2` 上。

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
    <remote_servers replace="true">
        <cluster_1S_2R>
            <shard>
                <replica>
                    <host>chnode1</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>chnode2</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
</clickhouse>
```

在使用集群时，定义填充 DDL 查询的宏非常方便，以便可以传递集群、分片和副本设置。此示例允许您指定使用复制表引擎，而无需提供 `shard` 和 `replica` 详细信息。创建表时，您可以通过查询 `system.tables` 来查看如何使用 `shard` 和 `replica` 宏。

```xml title="/etc/clickhouse-server/config.d/macros.xml"
<clickhouse>
    <distributed_ddl>
            <path>/clickhouse/task_queue/ddl</path>
    </distributed_ddl>
    <macros>
        <cluster>cluster_1S_2R</cluster>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
</clickhouse>
```
:::note
上面的宏适用于 `chnode1`，在 `chnode2` 上将 `replica` 设置为 `replica_2`。
:::
#### 禁用零复制复制 {#disable-zero-copy-replication}

在 ClickHouse 版本 22.7 及更早版本中，设置 `allow_remote_fs_zero_copy_replication` 默认值为 S3 和 HDFS 磁盘的 `true`。在这种灾难恢复场景下，此设置应更改为 `false`，而在版本 22.8 及更高版本中，默认值设置为 `false`。

此设置应为 `false` 的原因有二：1) 此功能尚未准备好投入生产使用；2) 在灾难恢复场景中，数据和元数据都需要存储在多个区域中。将 `allow_remote_fs_zero_copy_replication` 设置为 `false`。

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
   <merge_tree>
        <allow_remote_fs_zero_copy_replication>false</allow_remote_fs_zero_copy_replication>
   </merge_tree>
</clickhouse>
```

ClickHouse Keeper 负责协调 ClickHouse 节点之间的数据复制。要向 ClickHouse 通知 ClickHouse Keeper 节点，请在每个 ClickHouse 节点上添加配置文件。

```xml title="/etc/clickhouse-server/config.d/use_keeper.xml"
<clickhouse>
    <zookeeper>
        <node index="1">
            <host>keepernode1</host>
            <port>9181</port>
        </node>
        <node index="2">
            <host>keepernode2</host>
            <port>9181</port>
        </node>
        <node index="3">
            <host>keepernode3</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```
### 配置网络 {#configure-networking}

在 AWS 中配置安全设置以使服务器能够相互通信时，请查看 [网络端口](../../../guides/sre/network-ports.md) 列表，以便您可以与它们进行通信。

所有三台服务器必须监听网络连接，以便它们能够在服务器之间以及与 S3 之间进行通信。默认情况下，ClickHouse 仅在回送地址上监听，因此必须进行更改。这在 `/etc/clickhouse-server/config.d/` 中进行配置。这是配置 ClickHouse 和 ClickHouse Keeper 监听所有 IP v4 接口的示例。有关更多信息，请参见文档或默认配置文件 `/etc/clickhouse/config.xml`。

```xml title="/etc/clickhouse-server/config.d/networking.xml"
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```
### 启动服务器 {#start-the-servers}
#### 运行 ClickHouse Keeper {#run-clickhouse-keeper}

在每个 Keeper 服务器上运行适合您的操作系统的命令，例如：

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```
#### 检查 ClickHouse Keeper 状态 {#check-clickhouse-keeper-status}

使用 `netcat` 向 ClickHouse Keeper 发送命令。例如，`mntr` 返回 ClickHouse Keeper 集群的状态。如果您在每个 Keeper 节点上运行该命令，您将看到一个是领导者，另两个是跟随者：

```bash
echo mntr | nc localhost 9181
```
```response
zk_version      v22.7.2.15-stable-f843089624e8dd3ff7927b8a125cf3a7a769c069
zk_avg_latency  0
zk_max_latency  11
zk_min_latency  0
zk_packets_received     1783
zk_packets_sent 1783

# highlight-start
zk_num_alive_connections        2
zk_outstanding_requests 0
zk_server_state leader

# highlight-end
zk_znode_count  135
zk_watch_count  8
zk_ephemerals_count     3
zk_approximate_data_size        42533
zk_key_arena_size       28672
zk_latest_snapshot_size 0
zk_open_file_descriptor_count   182
zk_max_file_descriptor_count    18446744073709551615

# highlight-start
zk_followers    2
zk_synced_followers     2

# highlight-end
```
#### 运行 ClickHouse 服务器 {#run-clickhouse-server}

在每个 ClickHouse 服务器上运行

```bash
sudo service clickhouse-server start
```
#### 验证 ClickHouse 服务器 {#verify-clickhouse-server}

当您添加 [集群配置](#define-a-cluster) 时，会定义一个在两个 ClickHouse 节点间复制的单一分片。在此验证步骤中，您将检查 ClickHouse 启动时集群是否构建成功，并使用该集群创建一个副本表。 
- 验证集群是否存在：
```sql
show clusters
```
```response
┌─cluster───────┐
│ cluster_1S_2R │
└───────────────┘

1 row in set. Elapsed: 0.009 sec. `
```

- 使用 `ReplicatedMergeTree` 表引擎在集群中创建表：
```sql
create table trips on cluster 'cluster_1S_2R' (
 `trip_id` UInt32,
 `pickup_date` Date,
 `pickup_datetime` DateTime,
 `dropoff_datetime` DateTime,
 `pickup_longitude` Float64,
 `pickup_latitude` Float64,
 `dropoff_longitude` Float64,
 `dropoff_latitude` Float64,
 `passenger_count` UInt8,
 `trip_distance` Float64,
 `tip_amount` Float32,
 `total_amount` Float32,
 `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4))
ENGINE = ReplicatedMergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime
SETTINGS storage_policy='s3_main'
```
```response
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1 │ 9000 │      0 │       │                   1 │                0 │
│ chnode2 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```
- 理解之前定义的宏的使用

  宏 `shard` 和 `replica` 在 [之前定义](#define-a-cluster) 过，在下面的高亮行中，您可以看到每个 ClickHouse 节点上值的替换位置。此外，值 `uuid` 被使用；`uuid` 在宏中未定义，因为它是由系统生成的。
```sql
SELECT create_table_query
FROM system.tables
WHERE name = 'trips'
FORMAT Vertical
```
```response
Query id: 4d326b66-0402-4c14-9c2f-212bedd282c0

Row 1:
──────
create_table_query: CREATE TABLE default.trips (`trip_id` UInt32, `pickup_date` Date, `pickup_datetime` DateTime, `dropoff_datetime` DateTime, `pickup_longitude` Float64, `pickup_latitude` Float64, `dropoff_longitude` Float64, `dropoff_latitude` Float64, `passenger_count` UInt8, `trip_distance` Float64, `tip_amount` Float32, `total_amount` Float32, `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4))

# highlight-next-line
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
PARTITION BY toYYYYMM(pickup_date) ORDER BY pickup_datetime SETTINGS storage_policy = 's3_main'

1 row in set. Elapsed: 0.012 sec.
```
  :::note
  您可以通过设置 `default_replica_path` 和 `default_replica_name` 自定义上述展示的 zookeeper 路径 `'clickhouse/tables/{uuid}/{shard}`。文档在 [这里](/operations/server-configuration-parameters/settings.md/#default_replica_path)。
  :::
### 测试 {#testing-1}

这些测试将验证数据是否在两台服务器之间进行复制，并且是否存储在 S3 存储桶中而不是本地磁盘上。

- 从纽约市出租车数据集添加数据：
```sql
INSERT INTO trips
SELECT trip_id,
       pickup_date,
       pickup_datetime,
       dropoff_datetime,
       pickup_longitude,
       pickup_latitude,
       dropoff_longitude,
       dropoff_latitude,
       passenger_count,
       trip_distance,
       tip_amount,
       total_amount,
       payment_type
   FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
```
- 验证数据是否存储在 S3 中。

  此查询显示磁盘上数据的大小，以及用于决定使用哪个磁盘的策略。
```sql
SELECT
    engine,
    data_paths,
    metadata_path,
    storage_policy,
    formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'trips'
FORMAT Vertical
```
```response
Query id: af7a3d1b-7730-49e0-9314-cc51c4cf053c

Row 1:
──────
engine:                          ReplicatedMergeTree
data_paths:                      ['/var/lib/clickhouse/disks/s3_disk/store/551/551a859d-ec2d-4512-9554-3a4e60782853/']
metadata_path:                   /var/lib/clickhouse/store/e18/e18d3538-4c43-43d9-b083-4d8e0f390cf7/trips.sql
storage_policy:                  s3_main
formatReadableSize(total_bytes): 36.42 MiB

1 row in set. Elapsed: 0.009 sec.
```

  检查本地磁盘上的数据大小。如上所述，存储的数百万行在磁盘上的大小为 36.42 MiB。这应该在 S3 上，而不是本地磁盘。上面的查询还告诉我们本地磁盘上数据和元数据存储的位置。检查本地数据：
```response
root@chnode1:~# du -sh /var/lib/clickhouse/disks/s3_disk/store/551
536K  /var/lib/clickhouse/disks/s3_disk/store/551
```

  验证每个 S3 存储桶中的 S3 数据（总数没有显示，但在插入后两个存储桶大约都有 36 MiB 存储）：

<Image img={Bucket1} size="lg" border alt="第一个 S3 存储桶中数据大小的存储使用情况指标" />

<Image img={Bucket2} size="lg" border alt="第二个 S3 存储桶中数据大小的存储使用情况指标" />
## S3Express {#s3express}

[S3Express](https://aws.amazon.com/s3/storage-classes/express-one-zone/) 是 Amazon S3 中一种新的高性能、单可用区存储类。

您可以参考这篇 [博客](https://aws.amazon.com/blogs/storage/clickhouse-cloud-amazon-s3-express-one-zone-making-a-blazing-fast-analytical-database-even-faster/) 了解我们测试 S3Express 与 ClickHouse 的经验。

:::note
  S3Express 将数据存储在单个可用区中。这意味着在 AZ 故障时数据将不可用。
:::
### S3 磁盘 {#s3-disk}

创建一个由 S3Express 存储桶支持的表涉及以下步骤：

1. 创建一个 `Directory` 类型的存储桶
2. 安装适当的存储桶策略以授予 S3 用户所有所需的权限（例如，`"Action": "s3express:*"` 简单地允许不受限制的访问）
3. 配置存储策略时，请提供 `region` 参数

存储配置与普通 S3 相同，例如可能如下所示：

```sql
<storage_configuration>
    <disks>
        <s3_express>
            <type>s3</type>
            <endpoint>https://my-test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/store/</endpoint>
            <region>eu-north-1</region>
            <access_key_id>...</access_key_id>
            <secret_access_key>...</secret_access_key>
        </s3_express>
    </disks>
    <policies>
        <s3_express>
            <volumes>
                <main>
                    <disk>s3_express</disk>
                </main>
            </volumes>
        </s3_express>
    </policies>
</storage_configuration>
```

然后在新的存储上创建一个表：

```sql
CREATE TABLE t
(
    a UInt64,
    s String
)
ENGINE = MergeTree
ORDER BY a
SETTINGS storage_policy = 's3_express';
```
### S3 存储 {#s3-storage}

S3 存储也受支持，但仅限于 `Object URL` 路径。示例：

```sql
SELECT * FROM s3('https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/file.csv', ...)
```

这也要求在配置中指定存储桶区域：

```xml
<s3>
    <perf-bucket-url>
        <endpoint>https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com</endpoint>
        <region>eu-north-1</region>
    </perf-bucket-url>
</s3>
```
### 备份 {#backups}

可以在我们上面创建的磁盘上存储备份：

```sql
BACKUP TABLE t TO Disk('s3_express', 't.zip')

┌─id───────────────────────────────────┬─status─────────┐
│ c61f65ac-0d76-4390-8317-504a30ba7595 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

```sql
RESTORE TABLE t AS t_restored FROM Disk('s3_express', 't.zip')

┌─id───────────────────────────────────┬─status───┐
│ 4870e829-8d76-4171-ae59-cffaf58dea04 │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

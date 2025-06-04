---
'slug': '/integrations/s3'
'sidebar_position': 1
'sidebar_label': '将 S3 与 ClickHouse 集成'
'title': '将 S3 与 ClickHouse 集成'
'description': '页面描述如何将 S3 与 ClickHouse 集成'
---

import BucketDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_S3_authentication_and_bucket.md';
import S3J from '@site/static/images/integrations/data-ingestion/s3/s3-j.png';
import Bucket1 from '@site/static/images/integrations/data-ingestion/s3/bucket1.png';
import Bucket2 from '@site/static/images/integrations/data-ingestion/s3/bucket2.png';
import Image from '@theme/IdealImage';


# 将 S3 与 ClickHouse 集成

您可以将 S3 中的数据插入到 ClickHouse，并使用 S3 作为导出目标，从而允许与“数据湖”架构进行交互。此外，S3 可以提供“冷”存储层，并有助于分离存储和计算。在下面的章节中，我们使用纽约市出租车数据集演示在 S3 和 ClickHouse 之间移动数据的过程，同时确定关键配置参数并提供优化性能的提示。
## S3 表函数 {#s3-table-functions}

`s3` 表函数允许您从 S3 兼容存储读取和写入文件。此语法的轮廓如下：

```sql
s3(path, [aws_access_key_id, aws_secret_access_key,] [format, [structure, [compression]]])
```

其中：

* path — 存储桶 URL 及文件路径。在只读模式下支持以下通配符：`*`、`?`、`{abc,def}` 和 `{N..M}`，其中 `N`、`M` 是数字，`'abc'`、`'def'` 是字符串。有关更多信息，请参见 [使用路径中的通配符](/engines/table-engines/integrations/s3/#wildcards-in-path) 文档。
* format — 文件的 [格式](/interfaces/formats#formats-overview)。
* structure — 表的结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。
* compression — 此参数是可选的。支持的值：`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。默认情况下，它会根据文件扩展名自动检测压缩。

在路径表达式中使用通配符可以引用多个文件，并打开并行处理的可能性。
### 准备 {#preparation}

在 ClickHouse 中创建表之前，您可能希望先仔细查看 S3 存储桶中的数据。您可以通过 `DESCRIBE` 语句直接从 ClickHouse 中完成此操作：

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

`DESCRIBE TABLE` 语句的输出应显示 ClickHouse 如何自动推断这些数据，如在 S3 存储桶中所见。请注意，它还会自动识别并解压 gzip 压缩格式：

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

为了与我们的基于 S3 的数据集进行交互，我们准备了一个标准的 `MergeTree` 表作为目标。下面的语句在默认数据库中创建名为 `trips` 的表。请注意，我们选择修改上面推断的一些数据类型，尤其是避免使用 [`Nullable()`](/sql-reference/data-types/nullable) 数据类型修饰符，这可能会导致存储一些不必要的额外数据并增加额外的性能开销：

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

注意在 `pickup_date` 字段上使用了 [分区](/engines/table-engines/mergetree-family/custom-partitioning-key)。通常，分区键用于数据管理，但稍后我们将使用此键来并行写入 S3。

我们的出租车数据集中的每个条目都包含一次出租车行程。这些匿名数据包含 2000 万条记录，压缩在 S3 存储桶 https://datasets-documentation.s3.eu-west-3.amazonaws.com/ 下的 **nyc-taxi** 文件夹中。数据为 TSV 格式，每个文件大约有 100 万行。
### 从 S3 读取数据 {#reading-data-from-s3}

我们可以将 S3 数据作为源进行查询，而不需要在 ClickHouse 中进行持久化。在以下查询中，我们抽样 10 行。注意这里没有凭据，因为桶是公开可访问的：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
LIMIT 10;
```

请注意，由于 `TabSeparatedWithNames` 格式在第一行中编码了列名，因此我们不需要列出列。其他格式，如 `CSV` 或 `TSV`，将在此查询中返回自动生成的列，例如 `c1`、`c2`、`c3` 等。

查询还支持 [虚拟列](../sql-reference/table-functions/s3#virtual-columns)，如 `_path` 和 `_file`，分别提供有关存储桶路径和文件名的信息。例如：

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

确认此样本数据集中行的数量。注意使用通配符进行文件扩展，因此我们考虑所有二十个文件。此查询将花费大约 10 秒，具体取决于 ClickHouse 实例上的核心数量：

```sql
SELECT count() AS count
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

```response
┌────count─┐
│ 20000000 │
└──────────┘
```

虽然直接从 S3 读取数据对于抽样数据和执行临时的探索性查询非常有用，但您并不希望频繁执行此操作。当您需要认真对待时，导入数据到 ClickHouse 的 `MergeTree` 表中。
### 使用 clickhouse-local {#using-clickhouse-local}

`clickhouse-local` 程序使您能够在不部署和配置 ClickHouse 服务器的情况下，对本地文件进行快速处理。可以使用此工具执行任何使用 `s3` 表函数的查询。 例如：

```sql
clickhouse-local --query "SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```
### 从 S3 插入数据 {#inserting-data-from-s3}

为了充分利用 ClickHouse 的功能，我们接下来将读取并将数据插入到我们的实例中。
我们将 `s3` 函数与简单的 `INSERT` 语句结合使用以实现这一点。请注意，我们不需要列出我们的列，因为目标表提供了所需的结构。这要求列按照表 DDL 语句中指定的顺序出现：列根据它们在 `SELECT` 子句中的位置进行映射。插入全部 1000 万条行可能需要几分钟，具体取决于 ClickHouse 实例。下面我们插入 100 万行以确保快速响应。根据需要调整 `LIMIT` 子句或列选择以导入子集：

```sql
INSERT INTO trips
   SELECT *
   FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
   LIMIT 1000000;
```
### 使用 ClickHouse Local 进行远程插入 {#remote-insert-using-clickhouse-local}

如果网络安全策略阻止您的 ClickHouse 集群进行出站连接，您可以使用 `clickhouse-local` 可能地插入 S3 数据。在下面的示例中，我们从 S3 存储桶读取并使用 `remote` 函数插入到 ClickHouse 中：

```sql
clickhouse-local --query "INSERT INTO TABLE FUNCTION remote('localhost:9000', 'default.trips', 'username', 'password') (*) SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

:::note
要通过安全的 SSL 连接执行此操作，请使用 `remoteSecure` 函数。
:::
### 导出数据 {#exporting-data}

您可以使用 `s3` 表函数将数据写入 S3 中的文件。这将需要适当的权限。我们在请求中传递所需的凭据，但请查看 [管理凭据](#managing-credentials) 页面以获得更多选项。

在下面的简单示例中，我们将表函数用作目标，而不是源。在这里，我们将 10,000 行从 `trips` 表流式传输到存储桶，指定 `lz4` 压缩和 `CSV` 输出类型：

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

请注意，文件的格式是根据扩展名推断的。我们还不需要在 `s3` 函数中指定列 - 这可以从 `SELECT` 中推断出来。
### 拆分大文件 {#splitting-large-files}

您不太可能希望将数据导出为单个文件。大多数工具，包括 ClickHouse，在读取和写入多个文件时会实现更高的吞吐量性能，因为可以进行并行处理。我们可以多次执行 `INSERT` 命令，目标是数据的子集。ClickHouse 提供了一种使用 `PARTITION` 键自动拆分文件的方法。

在下面的示例中，我们使用 `rand()` 函数的模数创建十个文件。请注意，结果分区 ID 在文件名中被引用。这将导致带有数字后缀的十个文件，例如 `trips_0.csv.lz4`、`trips_1.csv.lz4` 等：

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

或者，我们可以引用数据中的字段。对于此数据集，`payment_type` 提供了一个自然而然的分区键，基数为 5。

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

上述函数均限于在单个节点上执行。读取速度将与 CPU 核心线性扩展，直到其他资源（通常是网络）饱和，允许用户进行垂直扩展。然而，这种方法有其局限性。虽然用户可以通过在执行 `INSERT INTO SELECT` 查询时插入到分布式表中来缓解一些资源压力，但这仍然使得单个节点负责读取、解析和处理数据。为了解决这个挑战并实现水平扩展读取，我们有 [s3Cluster](/sql-reference/table-functions/s3Cluster.md) 函数。

接收查询的节点称为启动器，它会创建与集群中每个节点的连接。确定需要读取哪些文件的 glob 模式被解析为一组文件。启动器将文件分发给集群中的节点，这些节点作为工作节点。这些工作节点则会在完成读取后请求要处理的文件。这个过程确保我们可以水平扩展读取。

`s3Cluster` 函数采用与单节点变体相同的格式，只是需要一个目标集群来指示工作节点：

```sql
s3Cluster(cluster_name, source, [access_key_id, secret_access_key,] format, structure)
```

* `cluster_name` — 用于构建远程和本地服务器的地址集和连接参数的集群名称。
* `source` — 指向文件或一组文件的 URL。支持在只读模式下的以下通配符：`*`、`?`、`{'abc','def'}` 和 `{N..M}`，其中 N、M 为数字，abc、def 为字符串。有关更多信息，请参见 [路径中的通配符](/engines/table-engines/integrations/s3.md/#wildcards-in-path)。
* `access_key_id` 和 `secret_access_key` — 指定与给定端点一起使用的凭据的密钥。可选。
* `format` — 文件的 [格式](/interfaces/formats#formats-overview)。
* `structure` — 表的结构。格式为 'column1_name column1_type, column2_name column2_type, ...'。

与任何 `s3` 函数一样，如果桶不安全，凭据是可选的，或者您通过环境定义安全性，例如 IAM 角色。然而，与 s3 函数不同的是，从 22.3.1 开始，结构必须在请求中指定，即，架构不会被推断。

在大多数情况下，此函数将作为 `INSERT INTO SELECT` 的一部分使用。在这种情况下，您通常会插入到一个分布式表中。下面我们展示了一个简单的示例，其中 trips_all 是一个分布式表。虽然该表使用事件集群，但用于读取和写入的节点的一致性并不是强制要求：

```sql
INSERT INTO default.trips_all
   SELECT *
   FROM s3Cluster(
       'events',
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz',
       'TabSeparatedWithNames'
    )
```

插入将发生在启动器节点上。这意味着尽管读取将在每个节点上进行，但结果行将被路由到启动器进行分发。在高吞吐量场景中，这可能会成为瓶颈。为了解决这个问题，请为 `s3cluster` 函数设置参数 [parallel_distributed_insert_select](/operations/settings/settings/#parallel_distributed_insert_select)。
## S3 表引擎 {#s3-table-engines}

虽然 `s3` 函数允许对存储在 S3 中的数据执行临时查询，但它们在语法上较为冗长。`S3` 表引擎使您无需重复指定桶的 URL 和凭据。为此，ClickHouse 提供了 S3 表引擎。

```sql
CREATE TABLE s3_engine_table (name String, value UInt32)
    ENGINE = S3(path, [aws_access_key_id, aws_secret_access_key,] format, [compression])
    [SETTINGS ...]
```

* `path` — 存储桶 URL 及文件路径。在只读模式下支持以下通配符：`*`、`?`、`{abc,def}` 和 `{N..M}`，其中 N、M 为数字，'abc'、'def' 为字符串。有关更多信息，请参见 [此处](/engines/table-engines/integrations/s3#wildcards-in-path)。
* `format` — 文件的 [格式](/interfaces/formats#formats-overview)。
* `aws_access_key_id`、`aws_secret_access_key` — AWS 账号用户的长期凭据。您可以用这些来进行请求身份验证。此参数为可选项。如果未指定凭据，则使用配置文件中的值。有关更多信息，请参见 [管理凭据](#managing-credentials)。
* `compression` — 压缩类型。支持的值：none、gzip/gz、brotli/br、xz/LZMA、zstd/zst。该参数为可选的。默认情况下，它会根据文件扩展名自动检测压缩。
### 读取数据 {#reading-data}

在下面的示例中，我们创建一个名为 `trips_raw` 的表，该表使用位于 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/` 存储桶中的前十个 TSV 文件。每个文件包含 100 万行：

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

注意使用 `{0..9}` 模式限制到前十个文件。创建后，我们可以像查询其他表一样查询此表：

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

`S3` 表引擎支持并行读取。仅在表定义不包含 glob 模式时才支持写入。因此，上述表将阻止写入。

为了演示写入，创建一个指向可写 S3 存储桶的表：

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

请注意，仅能向新文件插入行。没有合并周期或文件拆分操作。一旦文件被写入，后续插入将失败。用户在这里有两个选择：

* 指定设置 `s3_create_new_file_on_insert=1`。这将导致每次插入时创建新文件。每个文件末尾将附加一个数值后缀，该后缀将在每次插入操作时单调增加。以上述示例为例，之后的插入将导致创建一个 trips_1.bin 文件。
* 指定设置 `s3_truncate_on_insert=1`。这将使文件被截断，即在完成时只包含新插入的行。

这两个设置的默认值均为 0 - 因此强制用户设置其中一个。如果同时设置了 `s3_truncate_on_insert`，则会优先考虑它。

关于 `S3` 表引擎的一些注意事项：

- 与传统的 `MergeTree` 系列表不同，删除 `S3` 表不会删除底层数据。
- 有关此表类型的完整设置，请访问 [此处](/engines/table-engines/integrations/s3.md/#settings)。
- 使用该引擎时，要注意以下注意事项：
    * 不支持 ALTER 查询
    * 不支持 SAMPLE 操作
    * 不存在索引的概念，即主索引或跳过索引。
## 管理凭据 {#managing-credentials}

在之前的示例中，我们在 `s3` 函数或 `S3` 表定义中传递了凭据。虽然这种做法对于偶尔使用可能是可以接受的，但用户在生产中需要更少明确的身份验证机制。为了解决这个问题，ClickHouse 提供了几种选项：

* 在 **config.xml** 或相应的配置文件下的 **conf.d** 中指定连接详细信息。以下是一个示例文件的内容，假设使用 Debian 包进行安装。

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

这些凭据将用于任何请求，其中上述端点与请求的 URL 完全匹配。此外，请注意在该示例中声明授权头作为访问和密钥的替代方法的能力。支持的设置的完整列表可以在 [此处](/engines/table-engines/integrations/s3.md/#settings) 找到。

* 上述示例显示了配置参数 `use_environment_credentials` 的可用性。此配置参数也可以在 `s3` 层级全局设置：

```xml
<clickhouse>
    <s3>
    <use_environment_credentials>true</use_environment_credentials>
    </s3>
</clickhouse>
```

    此设置打开尝试从环境中检索 S3 凭据的尝试，从而允许通过 IAM 角色进行访问。特别地，按以下顺序检索：

   * 查找环境变量 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY` 和 `AWS_SESSION_TOKEN`
   * 在 **$HOME/.aws** 中进行检查
   * 通过 AWS 安全令牌服务获取临时凭据 - 即通过 [`AssumeRole`](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) API
   * 检查 ECS 环境变量 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` 或 `AWS_CONTAINER_CREDENTIALS_FULL_URI` 和 `AWS_ECS_CONTAINER_AUTHORIZATION_TOKEN` 中的凭据。
   * 通过 [Amazon EC2 实例元数据](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-metadata.html) 获取凭据，前提是 [AWS_EC2_METADATA_DISABLED](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-list-AWS_EC2_METADATA_DISABLED) 未设置为 true。
   * 这些相同的设置也可以针对特定端点进行设置，使用相同的前缀匹配规则。
## 性能优化 {#s3-optimizing-performance}

有关如何优化使用 S3 函数的读取和插入的更多信息，请参阅 [专门的性能指南](./performance.md)。
### S3 存储调整 {#s3-storage-tuning}

在内部，ClickHouse 的合并树使用两种主要存储格式：[`Wide` 和 `Compact`](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)。虽然当前实现使用 ClickHouse 的默认行为（通过设置 `min_bytes_for_wide_part` 和 `min_rows_for_wide_part` 控制），我们预计未来版本中 S3 的行为会有所不同，例如，`min_bytes_for_wide_part` 的默认值更大，从而鼓励使用更 `Compact` 的格式，减少文件数量。用户在独占使用 S3 存储时，可能希望调整这些设置。
## S3 支持的 MergeTree {#s3-backed-mergetree}

`s3` 函数及相关表引擎使我们能够使用熟悉的 ClickHouse 语法查询 S3 中的数据。然而，关于数据管理功能和性能，它们是有限的。不支持主索引、不支持无缓存，并且文件插入需要由用户管理。

ClickHouse 认识到 S3 是一种具有吸引力的存储解决方案，特别是在对“冷”数据的查询性能不那么关键时，用户希望分离存储和计算。为了帮助实现这一点，支持将 S3 用作 MergeTree 引擎的存储。这将使用户能够利用 S3 的可扩展性和成本优势，以及 MergeTree 引擎的插入和查询性能。
### 存储层 {#storage-tiers}

ClickHouse 存储卷允许从 MergeTree 表引擎中抽象出物理磁盘。任何单一卷可以由有序的磁盘集合组成。虽然主要允许多个块设备可用于数据存储，但此抽象也允许其他存储类型，包括 S3。ClickHouse 数据部分可以根据存储策略在卷和填充率之间移动，从而创建存储层的概念。

存储层解锁了冷热架构，其中最新的数据，通常也是被查询次数最多的数据，仅需要在高性能存储（例如 NVMe SSD）上占用少量空间。随着数据的老化，查询时间的 SLA 增加，查询频率也随之增加。这些大尾部数据可以存储在较慢、性能较差的存储上，例如 HDD 或对象存储，如 S3。
### 创建磁盘 {#creating-a-disk}

要将 S3 存储桶用作磁盘，我们必须首先在 ClickHouse 配置文件中声明它。可以扩展 config.xml，或者最好是在 conf.d 中提供新文件。以下是 S3 磁盘声明的示例：

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

与此磁盘声明相关的完整设置列表可以在 [此处](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) 找到。请注意，可以使用在 [管理凭据](#managing-credentials) 中描述的相同方法来管理凭据，即在上述设置块中将 use_environment_credentials 设置为 true，以使用 IAM 角色。
### 创建存储策略 {#creating-a-storage-policy}

配置完成后，可以在策略下声明的存储卷中使用此“磁盘”。在以下示例中，假设 s3 是我们唯一的存储。这忽略了更复杂的冷热架构，其中数据可以根据 TTL 和填充率重新定位。

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

假设您已将磁盘配置为使用具有写入权限的桶，您应该能够创建如下示例中的表。为了简洁起见，我们使用纽约市出租车列的一个子集，并将数据直接流式传输到 S3 支持的表中：

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

根据硬件，这最后插入的 100 万行可能需要几分钟才能执行。您可以通过 system.processes 表确认进度。请随意将行数调整到最多 1000 万，探索一些示例查询。

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_s3 GROUP BY passenger_count;
```
### 修改表 {#modifying-a-table}

用户有时可能需要修改特定表的存储策略。尽管这是可能的，但会有一些限制。新的目标策略必须包含先前策略的所有磁盘和卷，即，数据不会迁移以满足策略更改。在验证这些约束时，卷和磁盘将通过名称标识，尝试违反将导致错误。然而，假设您使用了前面的示例，以下更改是有效的。

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

在这里，我们在新的 s3_tiered 策略中重用主卷，并引入一个新的热卷。这个卷使用默认磁盘，该磁盘通过参数 `<path>` 配置，仅由一个磁盘组成。请注意，我们的卷名称和磁盘没有变化。对我们的表的新插入将驻留在默认磁盘上，直到达到 move_factor * disk_size - 此时数据将重新定位到 S3。
### 处理复制 {#handling-replication}

使用 S3 磁盘进行复制可以通过使用 `ReplicatedMergeTree` 表引擎来实现。有关详细信息，请参阅 [在两个 AWS 区域之间使用 S3 对象存储复制单个分片](#s3-multi-region) 指南。
### 读取和写入 {#read--writes}

以下备注涵盖了 S3 与 ClickHouse 交互的实现。虽然通常只是信息性的，但在 [优化性能](#s3-optimizing-performance) 时可能会对读者有所帮助：

* 默认情况下，查询处理管道中任何阶段使用的最大查询处理线程数等于核心数。某些阶段比其他阶段更具并行性，因此该值提供了上限。由于数据是从磁盘流式传输的，因此多个查询阶段可能同时执行。因此，查询使用的线程数可能会超过此值。通过设置 [max_threads](/operations/settings/settings#max_threads) 进行修改。
* S3 的读取默认是异步的。此行为由设置 `remote_filesystem_read_method` 确定，默认设置为值 `threadpool`。在服务请求时，ClickHouse 按条带读取 granular。每个条带可能包含许多列。一个线程将依次读取其 granular 的列。与其同步执行，不如在等待数据之前对所有列进行预取。这显著提高了与每列的同步等待相比的性能改进。在大多数情况下，用户无需更改此设置 - 请参见 [优化性能](#s3-optimizing-performance)。
* 写入是并行执行的，最多 100 个并发文件写入线程。`max_insert_delayed_streams_for_parallel_write` 的默认值为 1000，控制并行写入的 S3 blobs 的数量。由于需要为每个正在写入的文件分配缓冲区（约 1MB），因此这有效地限制了 INSERT 的内存消耗。在服务器内存较小的情况下，可能需要降低此值。
## 将 S3 对象存储用作 ClickHouse 磁盘 {#configuring-s3-for-clickhouse-use}

如果您需要逐步说明以创建存储桶和 IAM 角色，请展开 **创建 S3 存储桶和 IAM 角色** 并按照说明操作：

<BucketDetails />
### 配置 ClickHouse 使用 S3 存储桶作为磁盘 {#configure-clickhouse-to-use-the-s3-bucket-as-a-disk}
以下示例基于作为服务安装的 Linux Deb 包，并具有默认 ClickHouse 目录。

1. 在 ClickHouse `config.d` 目录中创建一个新文件以存储存储配置。
```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```
2. 添加以下存储配置；替换之前步骤中的存储桶路径、访问密钥和秘密密钥
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
`<disks>` 标记中的 `s3_disk` 和 `s3_cache` 标签是任意标签。可以将它们设置为其他内容，但必须在 `<policies>` 标签下的 `<disk>` 标签中使用相同的标签来引用磁盘。
`<S3_main>` 标签也是任意的，是在 ClickHouse 创建资源时作为标识存储目标所使用的策略名称。

上述配置适用于 ClickHouse 版本 22.8 或更高版本，如果您使用的是旧版本，请参见 [存储数据](/operations/storing-data.md/#using-local-cache) 文档。

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
1. 使用 ClickHouse 客户端登录，类似如下：
```bash
clickhouse-client --user default --password ClickHouse123!
```
2. 创建指定新 S3 存储策略的表
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

3. 显示表已使用正确策略创建
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

4. 向表中插入测试行
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
6. 在 AWS 控制台中，导航到存储桶，选择新创建的存储桶和文件夹。
您应该看到如下所示的内容：

<Image img={S3J} size="lg" border alt="在 AWS 控制台中显示 ClickHouse 数据文件存储在 S3 中的 S3 存储桶视图" />
## 在两个 AWS 区域之间使用 S3 对象存储复制单个分片 {#s3-multi-region}

:::tip
在 ClickHouse Cloud 中默认使用对象存储，如果您在 ClickHouse Cloud 中运行，则无需按照此过程进行操作。
:::
### 规划部署 {#plan-the-deployment}
本教程基于在 AWS EC2中部署两个 ClickHouse 服务器节点和三个 ClickHouse Keeper 节点。 ClickHouse 服务器的数据存储在 S3 中。使用两个 AWS 区域，每个区域都有一个 ClickHouse 服务器和一个 S3 存储桶，以支持灾难恢复。

ClickHouse 表在两个服务器之间复制，因此在两个区域之间复制。
### 安装软件 {#install-software}
#### ClickHouse 服务器节点 {#clickhouse-server-nodes}
在 ClickHouse 服务器节点上执行部署步骤时，请参阅 [安装说明](/getting-started/install/install.mdx)。
#### 部署 ClickHouse {#deploy-clickhouse}

在两个主机上部署 ClickHouse，在示例配置中，这两个主机被命名为 `chnode1` 和 `chnode2`。

将 `chnode1` 放置在一个 AWS 区域，而将 `chnode2` 放置在第二个区域。
#### 部署 ClickHouse Keeper {#deploy-clickhouse-keeper}

在三个主机上部署 ClickHouse Keeper，在示例配置中，这三个主机命名为 `keepernode1`、`keepernode2` 和 `keepernode3`。 `keepernode1` 可以与 `chnode1` 部署在同一区域，而 `keepernode2` 与 `chnode2` 部署，`keepernode3` 可以在任一区域中但与该区域中的 ClickHouse 节点在不同的可用区。

在 ClickHouse Keeper 节点上执行部署步骤时，请参阅 [安装说明](/getting-started/install/install.mdx)。
### 创建 S3 存储桶 {#create-s3-buckets}

在每个区域中创建两个 S3 存储桶，您已将 `chnode1` 和 `chnode2` 放置在其中。

如果您需要逐步说明以创建存储桶和 IAM 角色，请展开 **创建 S3 存储桶和 IAM 角色** 并按照说明进行操作：

<BucketDetails />

配置文件将放置在 `/etc/clickhouse-server/config.d/` 中。 这是一个单个存储桶的示例配置文件，另一个也是类似的，三个突出显示的行有所不同：

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
           <disk>s3</disk>
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
本指南中的许多步骤将要求您将配置文件放置在 `/etc/clickhouse-server/config.d/` 中。 这是 Linux 系统上配置覆盖文件的默认位置。 当您将这些文件放入该目录中，ClickHouse 将使用内容覆盖默认配置。 将这些文件放在覆盖目录中，您将避免在升级期间丢失配置。
:::
### 配置 ClickHouse Keeper {#configure-clickhouse-keeper}

在独立运行 ClickHouse Keeper（与 ClickHouse 服务器分开）时，配置是一个单 XML 文件。 在本教程中，文件为 `/etc/clickhouse-keeper/keeper_config.xml`。 所有三个 Keeper 服务器使用相同的配置，但唯一不同的是 `<server_id>` 设置。

`server_id` 指示要分配给使用该配置文件的主机的 ID。在下面的示例中，`server_id` 是 `3`，如果您进一步查看该文件中的 `<raft_configuration>` 部分，您会看到服务器 3 的主机名是 `keepernode3`。 这就是 ClickHouse Keeper 进程在选择领导者和其他活动时知道要连接到哪些其他服务器的方式。

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

将 ClickHouse Keeper 的配置文件复制到位（记得设置 `<server_id>`）：
```bash
sudo -u clickhouse \
  cp keeper.xml /etc/clickhouse-keeper/keeper.xml
```
### 配置 ClickHouse 服务器 {#configure-clickhouse-server}
#### 定义集群 {#define-a-cluster}

ClickHouse 集群在配置的 `<remote_servers>` 部分中定义。 在此示例中，定义了一个集群 `cluster_1S_2R`，它由一个单一的分片和两个副本组成。 副本位于主机 `chnode1` 和 `chnode2` 上。

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

在使用集群时，定义填充 DDL 查询的宏非常方便，包含集群、分片和副本设置。 此示例允许您指定使用复制表引擎，而无需提供 `shard` 和 `replica` 详细信息。 创建表时，您可以通过查询 `system.tables` 来查看 `shard` 和 `replica` 宏的使用情况。

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
上述宏适用于 `chnode1`，在 `chnode2` 上将 `replica` 设置为 `replica_2`。
:::
#### 禁用零拷贝复制 {#disable-zero-copy-replication}

在 ClickHouse 版本 22.7 及更低版本中，设置 `allow_remote_fs_zero_copy_replication` 默认值为 `true`，适用于 S3 和 HDFS 磁盘。对于这种灾难恢复场景，此设置应设置为 `false`，在版本 22.8 及更高版本中，默认值为 `false`。

此设置应为 false，有两个原因：1) 此功能尚未准备好用于生产环境；2) 在灾难恢复场景中，数据和元数据需要存储在多个区域。将 `allow_remote_fs_zero_copy_replication` 设置为 `false`。

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
   <merge_tree>
        <allow_remote_fs_zero_copy_replication>false</allow_remote_fs_zero_copy_replication>
   </merge_tree>
</clickhouse>
```


ClickHouse Keeper 负责协调 ClickHouse 节点之间的数据复制。要让 ClickHouse 知道 ClickHouse Keeper 节点，请在每个 ClickHouse 节点上添加一个配置文件。

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

在您配置 AWS 中的安全设置以便您的服务器能够相互通信，并且您可以与其进行通信时，请参阅 [网络端口](../../../guides/sre/network-ports.md) 列表。

所有三台服务器必须监听网络连接，以便它们能够在服务器之间以及与 S3 进行通信。默认情况下，ClickHouse 仅在环回地址上监听，因此必须更改此设置。这在 `/etc/clickhouse-server/config.d/` 中配置。以下是一个示例，将 ClickHouse 和 ClickHouse Keeper 配置为监听所有 IPv4 接口。有关更多信息，请参阅文档或默认配置文件 `/etc/clickhouse/config.xml`。

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

使用 `netcat` 向 ClickHouse Keeper 发送命令。例如，`mntr` 返回 ClickHouse Keeper 集群的状态。如果您在每个 Keeper 节点上运行该命令，将会看到其中一个是领导者，另外两个是追随者：

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

当您添加了 [集群配置](#define-a-cluster) 时，已定义一个跨两个 ClickHouse 节点复制的单个分片。在此验证步骤中，您将检查在启动 ClickHouse 时集群是否已构建，并使用该集群创建一个复制表。
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

- 使用 `ReplicatedMergeTree` 表引擎在集群中创建一个表：
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

  宏 `shard` 和 `replica` 在 [之前定义](#define-a-cluster) 了，在下面突出显示的行中，您可以看到每个 ClickHouse 节点上的值被替换的位置。此外，值 `uuid` 被使用；`uuid` 在宏中没有定义，因为它是由系统生成的。
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
  您可以通过设置 `default_replica_path` 和 `default_replica_name` 自定义上面显示的 zookeeper 路径 `'clickhouse/tables/{uuid}/{shard}`。文档在 [这里](/operations/server-configuration-parameters/settings.md/#default_replica_path)。
  :::
### 测试 {#testing-1}

这些测试将验证数据是否在两个服务器之间进行复制，并且它存储在 S3 存储桶中而不是本地磁盘上。

- 从纽约市出租车数据集中添加数据：
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

  此查询显示磁盘上的数据大小，以及用于确定使用哪个磁盘的策略。
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

  检查本地磁盘上的数据大小。从上面的内容来看，存储的数百万行数据的磁盘大小为 36.42 MiB。这应当在 S3 中，而不是本地磁盘。上面的查询还告诉我们本地磁盘上数据和元数据存储的位置。检查本地数据：
```response
root@chnode1:~# du -sh /var/lib/clickhouse/disks/s3_disk/store/551
536K  /var/lib/clickhouse/disks/s3_disk/store/551
```

  检查每个 S3 存储桶中的 S3 数据（总数未显示，但在插入后两个存储桶中的存储量均约为 36 MiB）：

<Image img={Bucket1} size="lg" border alt="第一个 S3 存储桶中数据大小的存储使用指标" />

<Image img={Bucket2} size="lg" border alt="第二个 S3 存储桶中数据大小的存储使用指标" />
## S3Express {#s3express}

[S3Express](https://aws.amazon.com/s3/storage-classes/express-one-zone/) 是 Amazon S3 中一种新的高性能单可用区存储类别。

您可以查看这篇 [博客](https://aws.amazon.com/blogs/storage/clickhouse-cloud-amazon-s3-express-one-zone-making-a-blazing-fast-analytical-database-even-faster/) 来阅读我们测试 S3Express 与 ClickHouse 的经历。

:::note
  S3Express 在单个可用区内存储数据。这意味着在可用区故障的情况下数据将不可用。
:::
### S3 磁盘 {#s3-disk}

使用 S3Express 存储桶创建一个以存储为基础的表涉及以下步骤：

1. 创建一个类型为 `Directory` 的存储桶
2. 安装适当的存储桶策略，以授予您的 S3 用户所有所需的权限（例如 `"Action": "s3express:*"` 以简单地允许不受限制的访问）
3. 配置存储策略时，请提供 `region` 参数

存储配置与普通 S3 相同，例如可以如下所示：

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

然后在新存储上创建一个表：

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

S3 存储也被支持，但仅适用于 `Object URL` 路径。示例：

```sql
select * from s3('https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/file.csv', ...)
```

它还要求在配置中指定存储桶区域：

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

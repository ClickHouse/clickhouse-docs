---
'slug': '/integrations/s3'
'sidebar_position': 1
'sidebar_label': '将 S3 与 ClickHouse 集成'
'title': '将 S3 与 ClickHouse 集成'
'description': '描述如何将 S3 与 ClickHouse 集成的页面'
---

import BucketDetails from '@site/docs/_snippets/_S3_authentication_and_bucket.md';
import S3J from '@site/static/images/integrations/data-ingestion/s3/s3-j.png';
import Bucket1 from '@site/static/images/integrations/data-ingestion/s3/bucket1.png';
import Bucket2 from '@site/static/images/integrations/data-ingestion/s3/bucket2.png';
import Image from '@theme/IdealImage';


# 将 S3 与 ClickHouse 集成

您可以从 S3 向 ClickHouse 插入数据，也可以将 S3 用作导出目标，从而实现与“数据湖”架构的交互。此外，S3 可以提供“冷”存储层，并有助于分离存储和计算。在下面的部分中，我们使用纽约市出租车数据集来演示在 S3 和 ClickHouse 之间移动数据的过程，同时确定关键配置参数并提供优化性能的提示。

## S3 表函数 {#s3-table-functions}

`s3` 表函数允许您从 S3 兼容存储读取和写入文件。该语法的大纲如下：

```sql
s3(path, [aws_access_key_id, aws_secret_access_key,] [format, [structure, [compression]]])
```

其中：

* path — 带有文件路径的桶 URL。它支持以下通配符（在只读模式下）：`*`、`?`、`{abc,def}` 和 `{N..M}`，其中 `N`、`M` 是数字，`'abc'`、`'def'` 是字符串。有关更多信息，请参见文档中的 [使用路径中的通配符](/engines/table-engines/integrations/s3/#wildcards-in-path)。
* format — 文件的 [格式](/interfaces/formats#formats-overview)。
* structure — 表的结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。
* compression — 参数为可选。支持的值：`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。默认情况下，它将根据文件扩展名自动检测压缩。

在路径表达式中使用通配符允许引用多个文件，并为并行处理打开了大门。

### 准备 {#preparation}

在 ClickHouse 中创建表之前，您可能想要先仔细查看 S3 存储桶中的数据。您可以直接使用 `DESCRIBE` 语句在 ClickHouse 中执行此操作：

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

`DESCRIBE TABLE` 语句的输出应显示 ClickHouse 如何自动推断此数据，如在 S3 存储桶中所示。请注意，它还会自动识别并解压 gzip 压缩格式：

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

为与我们的基于 S3 的数据集进行交互，我们准备一个标准的 `MergeTree` 表作为我们的目标。下面的语句在默认数据库中创建一个名为 `trips` 的表。请注意，我们选择修改一些推断出的数据类型，特别是选择不使用 [`Nullable()`](/sql-reference/data-types/nullable) 数据类型修饰符，因为这可能会导致一些不必要的额外存储数据和一些额外的性能开销：

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

请注意在 `pickup_date` 字段上使用了 [分区](/engines/table-engines/mergetree-family/custom-partitioning-key)。通常，分区键用于数据管理，但稍后我们将使用此键来并行写入 S3。

在我们的出租车数据集中，每个条目都包含一个出租车行程。此匿名数据来自 S3 存储桶 https://datasets-documentation.s3.eu-west-3.amazonaws.com/ 下的文件夹 **nyc-taxi**，包含 2000 万条记录。数据采用 TSV 格式，每个文件约 100 万行。

### 从 S3 读取数据 {#reading-data-from-s3}

我们可以将 S3 数据作为源进行查询，而不需要在 ClickHouse 中进行持久化。在下面的查询中，我们获取 10 行数据。注意此处缺少凭据，因为该存储桶是公共可访问的：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
LIMIT 10;
```

请注意，我们不需要列出列，因为 `TabSeparatedWithNames` 格式在第一行中编码列名。其他格式，如 `CSV` 或 `TSV`，将在此查询中返回自动生成的列，例如 `c1`、`c2`、`c3` 等。

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

确认此示例数据集中的行数。请注意使用通配符进行文件扩展，因此我们考虑所有二十个文件。该查询将花费约 10 秒，具体取决于 ClickHouse 实例的核心数量：

```sql
SELECT count() AS count
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

```response
┌────count─┐
│ 20000000 │
└──────────┘
```

虽然直接从 S3 读取数据对于采样数据和执行临时的探索查询非常有用，但这并不是您每天都想要做的事情。当需要认真对待时，请将数据导入 ClickHouse 的 `MergeTree` 表中。

### 使用 clickhouse-local {#using-clickhouse-local}

`clickhouse-local` 程序使您可以在不部署和配置 ClickHouse 服务器的情况下，对本地文件进行快速处理。使用 `s3` 表函数的任何查询都可以使用该实用程序执行。例如：

```sql
clickhouse-local --query "SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

### 从 S3 插入数据 {#inserting-data-from-s3}

为了充分利用 ClickHouse 的所有功能，我们接下来读取并将数据插入我们的实例。我们将 `s3` 函数与一个简单的 `INSERT` 语句结合以实现此目标。请注意，我们不需要列出我们的列，因为我们的目标表提供了所需的结构。这要求列按照表 DDL 语句中指定的顺序出现：列根据其在 `SELECT` 子句中的位置进行映射。插入所有 1000 万行可能需要几分钟，具体取决于 ClickHouse 实例。以下我们插入 100 万行以确保快速响应。根据需要调整 `LIMIT` 子句或列选择以导入子集：

```sql
INSERT INTO trips
   SELECT *
   FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
   LIMIT 1000000;
```

### 使用 ClickHouse Local 的远程插入 {#remote-insert-using-clickhouse-local}

如果网络安全策略阻止您的 ClickHouse 集群进行外部连接，您可以使用 `clickhouse-local` 来插入 S3 数据。在下面的示例中，我们从 S3 存储桶读取数据并使用 `remote` 函数插入到 ClickHouse 中：

```sql
clickhouse-local --query "INSERT INTO TABLE FUNCTION remote('localhost:9000', 'default.trips', 'username', 'password') (*) SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

:::note
要通过安全的 SSL 连接执行此操作，请使用 `remoteSecure` 函数。
:::

### 导出数据 {#exporting-data}

您可以使用 `s3` 表函数将数据写入 S3 中的文件。这将需要适当的权限。我们在请求中传递所需的凭据，但请查看 [管理凭据](#managing-credentials) 页面以获取更多选项。

在下面的简单示例中，我们将表函数用作目标，而不是源。在这里，我们将 10,000 行从 `trips` 表流式传输到一个存储桶，指定 `lz4` 压缩和输出类型为 `CSV`：

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

请注意，文件的格式是根据扩展名推断出来的。我们也不需要在 `s3` 函数中指定列 - 这可以从 `SELECT` 中推断。

### 拆分大文件 {#splitting-large-files}

您不太可能希望将数据导出为单个文件。大多数工具（包括 ClickHouse）在读取和写入多个文件时能够实现更高的吞吐性能，因为这可能实现并行处理。我们可以多次执行我们的 `INSERT` 命令，目标是数据的一个子集。ClickHouse 提供了使用 `PARTITION` 键自动拆分文件的方式。

在下面的示例中，我们使用 `rand()` 函数的模数创建十个文件。请注意，生成的分区 ID 是在文件名中引用的。这将导致生成十个带数字后缀的文件，例如 `trips_0.csv.lz4`、`trips_1.csv.lz4` 等：

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

或者，我们可以引用数据中的字段。对于这个数据集，`payment_type` 提供了一个自然的分区键，基数为 5。

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

上面的函数都限制在单个节点上执行。读取速度将随着 CPU 核心的增加线性扩展，直到其他资源（通常是网络）饱和，从而允许用户垂直扩展。然而，这种方法有其限制。用户可以通过插入到一个分布式表来缓解一些资源压力，尤其是在执行 `INSERT INTO SELECT` 查询时，但这仍然使单个节点读取、解析和处理数据。为了解决这个挑战并允许我们水平扩展读取，我们有了 [s3Cluster](/sql-reference/table-functions/s3Cluster.md) 函数。

接收查询的节点称为发起者，它会建立与集群中每个节点的连接。确定需要读取的文件的 glob 模式被解析为一组文件。发起者将文件分配给集群中的节点，这些节点作为工作节点。这些工作节点随后在完成读取时请求需要处理的文件。这个过程确保我们可以水平扩展读取。

`s3Cluster` 函数的格式与单节点变体相同，只是需要一个目标集群以指定工作节点：

```sql
s3Cluster(cluster_name, source, [access_key_id, secret_access_key,] format, structure)
```

* `cluster_name` — 用于构建远程和本地服务器的地址和连接参数集的集群名称。
* `source` — 文件或一组文件的 URL。支持以下通配符（在只读模式下）：`*`、`?`、`{'abc','def'}` 和 `{N..M}`，其中 N、M 为数字，abc、def 为字符串。有关更多信息，请参见 [路径中的通配符]( /engines/table-engines/integrations/s3.md/#wildcards-in-path)。
* `access_key_id` 和 `secret_access_key` — 指定用于给定端点的凭据的密钥。可选。
* `format` — 文件的 [格式](/interfaces/formats#formats-overview)。
* `structure` — 表的结构。格式为 'column1_name column1_type, column2_name column2_type, ...'。

与任何 `s3` 函数一样，如果存储桶是不安全的或您通过环境定义了安全性，例如 IAM 角色，则凭据是可选的。然而，与 s3 函数不同的是，自 22.3.1 版本起，必须在请求中指定结构，即不再推断模式。

在大多数情况下，该函数将用作 `INSERT INTO SELECT` 的一部分。在这种情况下，您通常会插入一个分布式表。下面是一个简单示例，其中 trips_all 是一个分布式表。虽然此表使用事件集群，但用于读取和写入的节点一致性不是必需的：

```sql
INSERT INTO default.trips_all
   SELECT *
   FROM s3Cluster(
       'events',
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz',
       'TabSeparatedWithNames'
    )
```

插入将针对发起者节点进行。这意味着，虽然读取将在每个节点上进行，但结果行将被路由到发起者进行分发。在高吞吐量场景下，这可能会成为瓶颈。为了解决这个问题，为 `s3cluster` 函数设置参数 [parallel_distributed_insert_select](/operations/settings/settings/#parallel_distributed_insert_select)。

## S3 表引擎 {#s3-table-engines}

虽然 `s3` 函数允许对存储在 S3 中的数据执行临时查询，但它们的语法较为冗长。`S3` 表引擎允许您无需一次次地指定存储桶 URL 和凭据。为了解决这个问题，ClickHouse 提供了 S3 表引擎。

```sql
CREATE TABLE s3_engine_table (name String, value UInt32)
    ENGINE = S3(path, [aws_access_key_id, aws_secret_access_key,] format, [compression])
    [SETTINGS ...]
```

* `path` — 带有文件路径的桶 URL。支持以下通配符（在只读模式下）：`*`、`?`、`{abc,def}` 和 `{N..M}`，其中 N、M 是数字，'abc'、'def' 是字符串。有关更多信息，请参阅 [此处](/engines/table-engines/integrations/s3#wildcards-in-path)。
* `format` — 文件的 [格式](/interfaces/formats#formats-overview)。
* `aws_access_key_id`、`aws_secret_access_key` — AWS 账户用户的长期凭据。您可以使用这些凭据来验证您的请求。该参数可选。如果未指定凭据，则使用配置文件中的值。有关更多信息，请参见 [管理凭据](#managing-credentials)。
* `compression` — 压缩类型。支持的值：none、gzip/gz、brotli/br、xz/LZMA、zstd/zst。该参数可选。默认情况下，它将根据文件扩展名自动检测压缩。

### 读取数据 {#reading-data}

在下面的示例中，我们使用位于 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/` 存储桶中的前十个 TSV 文件创建一个名为 `trips_raw` 的表。这些文件每个包含 100 万行：

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

注意使用 `{0..9}` 模式来限制到前十个文件。创建后，我们可以像查询其他表那样查询此表：

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

`S3` 表引擎支持并行读取。仅当表定义不包含 glob 模式时，才支持写入。因此，上述表将阻止写入。

为了演示写入，请创建一个指向可写 S3 存储桶的表：

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

请注意，行只能插入新文件中。没有合并周期或文件拆分操作。一旦文件被写入，后续插入将失败。用户在这里有两个选项：

* 指定设置 `s3_create_new_file_on_insert=1`。这将导致每次插入时创建新文件。此文件的末尾将附加一个数字后缀，该后缀将在每次插入操作时单调增加。例如，随后的插入将导致创建一个 trips_1.bin 文件。
* 指定设置 `s3_truncate_on_insert=1`。这将导致文件被截断，即在完成时，它只会包含新插入的行。

这两个设置的默认值均为 0——从而强迫用户设置其中一个。如果同时设置了 `s3_truncate_on_insert`，则优先级更高。

有关 `S3` 表引擎的一些说明：

- 与传统的 `MergeTree` 家族表不同，删除 `S3` 表将不会删除底层数据。
- 此表类型的完整设置可以在 [此处](/engines/table-engines/integrations/s3.md/#settings) 中找到。
- 使用此引擎时请注意以下注意事项：
    * 不支持 ALTER 查询
    * 不支持 SAMPLE 操作
    * 不存在索引的概念，即主键或跳过索引。

## 管理凭据 {#managing-credentials}

在前面的示例中，我们在 `s3` 函数或 `S3` 表定义中传递了凭据。虽然这对于偶尔使用可能是可以接受的，但用户在生产中需要更少的显式身份验证机制。为了解决这个问题，ClickHouse 提供了几种选项：

* 在 **config.xml** 或等效的配置文件（位于 **conf.d** 下）中指定连接详细信息。下面示例文件的内容如下，假设使用 debian 包安装。

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

    这些凭据将用于任何请求，其中上述端点是所请求 URL 的确切前缀匹配。此外，请注意在此示例中声明授权头作为访问和秘密密钥的替代方案的能力。支持的设置的完整列表可以在 [此处]( /engines/table-engines/integrations/s3.md/#settings) 找到。

* 上述示例强调了配置参数 `use_environment_credentials` 的可用性。此配置参数也可以在 `s3` 级别全局设置：

```xml
    <clickhouse>
        <s3>
        <use_environment_credentials>true</use_environment_credentials>
        </s3>
    </clickhouse>
```

    此设置将开启尝试从环境中检索 S3 凭据的功能，从而允许通过 IAM 角色进行访问。具体来说，将执行以下检索顺序：

   * 查找环境变量 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY` 和 `AWS_SESSION_TOKEN`
   * 在 **$HOME/.aws** 中执行检查
   * 通过 AWS 安全令牌服务获取临时凭据——即通过 [`AssumeRole`](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) API
   * 检查工程 ECS 环境变量 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` 或 `AWS_CONTAINER_CREDENTIALS_FULL_URI` 以及 `AWS_ECS_CONTAINER_AUTHORIZATION_TOKEN` 中的凭据。
   * 通过 [Amazon EC2 实例元数据](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-metadata.html) 获取凭据，前提是提供 [AWS_EC2_METADATA_DISABLED](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-list-AWS_EC2_METADATA_DISABLED) 未设置为 true。
   * 这些相同的设置也可以为特定端点设置，使用相同的前缀匹配规则。

## 性能优化 {#s3-optimizing-performance}

有关如何优化使用 S3 函数读取和插入的详细信息，请参见 [专门的性能指南](./performance.md)。

### S3 存储调整 {#s3-storage-tuning}

在内部，ClickHouse merge tree 使用两种主要存储格式：[ `Wide` 和 `Compact`](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)。虽然当前实现使用 ClickHouse 的默认行为（通过设置 `min_bytes_for_wide_part` 和 `min_rows_for_wide_part` 控制），我们预计在未来版本中，S3 的行为会有所不同，例如，使用更大的默认值 `min_bytes_for_wide_part` 来鼓励更“紧凑”的格式，从而减少文件数量。用户现在可能希望在专用 S3 存储时调整这些设置。

## S3 支持的 MergeTree {#s3-backed-mergetree}

`s3` 函数和相关表引擎使我们能够使用熟悉的 ClickHouse 语法从 S3 查询数据。然而，就数据管理功能和性能而言，它们是有限的。没有对主索引的支持，不支持缓存，并且用户需要管理文件插入。

ClickHouse 认识到 S3 代表了一个有吸引力的存储解决方案，特别是在查询“冷”数据的性能不那么关键，并且用户希望分离存储和计算。为了帮助实现这一目标，支持将 S3 作为 MergeTree 引擎的存储。这将使用户能够利用 S3 的可扩展性和成本优势，以及 MergeTree 引擎的插入和查询性能。

### 存储层 {#storage-tiers}

ClickHouse 存储卷允许将物理磁盘从 MergeTree 表引擎中抽象出来。任何单一卷都可以由一组有序的磁盘组成。虽然主要允许用于数据存储的多个块设备，但这种抽象还允许其他存储类型，包括 S3。ClickHouse 数据部分可以根据存储策略在卷之间移动，并根据填充率进行填充，从而创建存储层的概念。

存储层启用热-冷架构，其中最近的数据（通常也是查询最多的）只需在高性能存储（例如 NVMe SSD）上占用小量空间。随着数据的老化，查询时间的 SLA 增加，查询频率也增加。这部分数据可以存储在较慢、性能较差的存储上，例如 HDD 或对象存储（如 S3）。

### 创建磁盘 {#creating-a-disk}

要将 S3 存储桶用作磁盘，我们必须首先在 ClickHouse 配置文件中声明它。扩展 config.xml，或者更好的是在 conf.d 下提供新的文件。以下是 S3 磁盘声明的示例：

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

与此磁盘声明相关的完整设置列表可以在 [此处](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) 找到。请注意，可以使用在 [管理凭据](#managing-credentials) 中描述的相同方法在此处管理凭据，即，在上述设置块中将 use_environment_credentials 设置为 true，以便使用 IAM 角色。

### 创建存储策略 {#creating-a-storage-policy}

一旦配置，该“磁盘”可以通过在策略中声明的存储卷使用。对于下面的示例，我们假设 s3 是我们唯一的存储。这忽略了更复杂的热-冷架构，其中数据可以根据 TTL 和填充率进行重新定位。

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

假设您已配置好磁盘以使用具有写访问权限的存储桶，您应该能够创建如下所示的表。为了简洁起见，我们使用 NYC 出租车列的子集，并将数据直接流式传输到 S3 支持的表中：

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

根据硬件的不同，这后一条 100 万行的插入可能需要几分钟才能执行。您可以通过 system.processes 表确认进度。请随意将行数调整到 1000 万的限制，并探索一些示例查询。

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_s3 GROUP BY passenger_count;
```

### 修改表 {#modifying-a-table}

用户有时可能需要修改某个表的存储策略。虽然这在技术上是可能的，但会有一些限制。新的目标策略必须包含前一个策略的所有磁盘和卷，即数据不会迁移以满足策略更改。在验证这些约束时，卷和磁盘将通过其名称进行识别，尝试违反将导致错误。然而，假设您使用了前面的示例，以下更改是有效的。

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

这里我们在新的 s3_tiered 策略中重复使用了主卷，并引入了新的热卷。它使用默认磁盘，该磁盘仅由通过参数 `<path>` 配置的一个磁盘组成。请注意，我们的卷名称和磁盘不变。新插入到我们的表的数据将保留在默认磁盘上，直到其达到 move_factor * disk_size，然后数据将被重新定位到 S3。

### 处理复制 {#handling-replication}

使用 S3 磁盘的复制可以通过使用 `ReplicatedMergeTree` 表引擎来完成。有关详细信息，请参见 [使用 S3 对象存储在两个 AWS 区域之间复制单个分片](#s3-multi-region) 指南。

### 读取和写入 {#read--writes}

以下注释涵盖了 S3 与 ClickHouse 交互的实现。虽然通常只是为了提供信息，但这可能会在 [优化性能](#s3-optimizing-performance) 时对读者有所帮助：

* 默认情况下，查询处理管道的任何阶段使用的最大查询处理线程数等于核心数量。一些阶段的并行性高于其他阶段，因此此值提供了上限。由于数据是从磁盘流式传输的，因此多个查询阶段可以同时执行。因此，查询所使用的确切线程数可能会超过该值。通过设置 [max_threads](/operations/settings/settings#max_threads) 进行修改。
* 默认情况下，S3 的读取是异步的。这一行为由设置 `remote_filesystem_read_method` 决定，默认值为 `threadpool`。在服务请求时，ClickHouse 以条带方式读取 granule。每个条带可能包含许多列。线程将逐个读取其 granule 的列。它不是同步进行的，而是在等待数据之前对所有列进行预取。这在性能上相较于每列的同步等待提供了显著提升。在大多数情况下，用户不需要更改此设置——请参见 [优化性能](#s3-optimizing-performance)。
* 写入是并行执行的，最多支持 100 个并发文件写入线程。`max_insert_delayed_streams_for_parallel_write` 的默认值为 1000，它控制并行写入的 S3 blob 数量。由于每个文件写入需要一个缓冲区（约 1MB），这有效限制了 INSERT 的内存消耗。在服务器内存较低的情况下，降低此值可能是合适的。

## 使用 S3 对象存储作为 ClickHouse 磁盘 {#configuring-s3-for-clickhouse-use}

如果您需要逐步说明以创建存储桶和 IAM 角色，请展开 **创建 S3 存储桶和 IAM 角色** 并跟随：

<BucketDetails />

### 配置 ClickHouse 使用 S3 存储桶作为磁盘 {#configure-clickhouse-to-use-the-s3-bucket-as-a-disk}
以下示例基于作为服务安装的 Linux Deb 包，并使用默认 ClickHouse 目录。

1. 在 ClickHouse `config.d` 目录中创建一个新文件以存储存储配置。
```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```
2. 添加以下存储配置；替换之前步骤中的存储桶路径、访问密钥和秘密密钥。
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
`<disks>` 标签中的 `s3_disk` 和 `s3_cache` 是任意标签。它们可以设置为其他值，但在 `<policies>` 标签下的 `<disk>` 标签中必须使用相同的标签来引用磁盘。
`<S3_main>` 标签也是任意的，是在 ClickHouse 中创建资源时作为标识符存储目标将使用的策略名称。

上述配置适用于 ClickHouse 22.8 或更高版本，如果您使用的是较旧版本，请参见 [存储数据](/operations/storing-data.md/#using-local-cache) 文档。

有关使用 S3 的更多信息：
集成指南：[基于 S3 的 MergeTree](#s3-backed-mergetree)
:::

3. 更新文件的所有者为 `clickhouse` 用户和组
```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```
4. 重新启动 ClickHouse 实例以使更改生效。
```bash
service clickhouse-server restart
```

### 测试 {#testing}
1. 使用 ClickHouse 客户端登录，类似于以下内容
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

3. 显示已创建的表及其正确策略
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
6. 在 AWS 控制台中，导航到存储桶并选择新的存储桶及其文件夹。
您应该会看到类似以下内容：

<Image img={S3J} size="lg" border alt="在 AWS 控制台中查看 S3 存储桶，显示 ClickHouse 存储于 S3 中的数据文件" />
## 使用 S3 对象存储在两个 AWS 区域之间复制单个分片 {#s3-multi-region}

:::tip
在 ClickHouse Cloud 中默认使用对象存储，如果您在 ClickHouse Cloud 中运行，则无需遵循此过程。
:::
### 规划部署 {#plan-the-deployment}
本教程基于在 AWS EC2 上部署两个 ClickHouse Server 节点和三个 ClickHouse Keeper 节点。 ClickHouse 服务器的数据存储是 S3。为了支持灾难恢复，在两个 AWS 区域中，每个区域都有一个 ClickHouse 服务器和一个 S3 存储桶。

ClickHouse 表在两个服务器之间复制，因此在两个区域之间也复制。

### 安装软件 {#install-software}
#### ClickHouse 服务器节点 {#clickhouse-server-nodes}
在执行 ClickHouse 服务器节点的部署步骤时，请参考 [安装说明](/getting-started/install/install.mdx)。
#### 部署 ClickHouse {#deploy-clickhouse}

在两个主机上部署 ClickHouse，在示例配置中，它们的名称为 `chnode1`、`chnode2`。

将 `chnode1` 放置在一个 AWS 区域中，将 `chnode2` 放置在第二个区域中。
#### 部署 ClickHouse Keeper {#deploy-clickhouse-keeper}

在三个主机上部署 ClickHouse Keeper，在示例配置中，它们的名称为 `keepernode1`、`keepernode2` 和 `keepernode3`。 `keepernode1` 可以部署在与 `chnode1` 相同的区域，`keepernode2` 与 `chnode2` 在同一地区，`keepernode3` 在任一区域但与该区域中的 ClickHouse 节点不同的可用区中。

在配置 ClickHouse Keeper 节点时，请参考 [安装说明](/getting-started/install/install.mdx)。
### 创建 S3 存储桶 {#create-s3-buckets}

在您放置 `chnode1` 和 `chnode2` 的每个区域中创建两个 S3 存储桶。

如果您需要逐步说明以创建存储桶和 IAM 角色，请展开 **创建 S3 存储桶和 IAM 角色** 并跟随：

<BucketDetails />

配置文件将放置在 `/etc/clickhouse-server/config.d/` 中。以下是一个存储桶的示例配置文件，另一个存储桶与此类似，但有三行高亮不同：

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
本指南中的许多步骤将要求您将配置文件放置在 `/etc/clickhouse-server/config.d/` 中。这是 Linux 系统中配置覆盖文件的默认位置。当您将这些文件放入该目录时，ClickHouse 将使用内容来覆盖默认配置。通过将这些文件放入覆盖目录，您将避免在升级过程中丢失配置。
:::
### 配置 ClickHouse Keeper {#configure-clickhouse-keeper}

当单独运行 ClickHouse Keeper（与 ClickHouse 服务器分开）时，配置是一个 XML 文件。在本教程中，该文件为 `/etc/clickhouse-keeper/keeper_config.xml`。所有三个 Keeper 服务器使用相同的配置，只有一个设置不同：`<server_id>`。

`server_id` 表示要分配给使用配置文件的主机的 ID。在下面的示例中，`server_id` 为 `3`，如果您在文件的 `<raft_configuration>` 部分进一步查看，您会看到服务器 3 的主机名为 `keepernode3`。这就是 ClickHouse Keeper 进程在选择领导者和执行所有其他活动时知道其他服务器要连接到的方式。

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

将 ClickHouse Keeper 的配置文件复制到指定位置（请记得设置 `<server_id>`）：
```bash
sudo -u clickhouse \
  cp keeper.xml /etc/clickhouse-keeper/keeper.xml
```

### 配置 ClickHouse 服务器 {#configure-clickhouse-server}
#### 定义集群 {#define-a-cluster}

ClickHouse 集群在配置的 `<remote_servers>` 部分中定义。在此示例中，定义了一个集群 `cluster_1S_2R`，它由一个分片和两个副本组成。副本位于 `chnode1` 和 `chnode2` 主机上。

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

在处理集群时，定义填充 DDL 查询的宏非常方便，其中包含集群、分片和副本设置。此示例允许您在不提供 `shard` 和 `replica` 详细信息的情况下指定使用复制表引擎。当您创建表时，您可以通过查询 `system.tables` 查看 `shard` 和 `replica` 宏是如何使用的。

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

在 ClickHouse 版本 22.7 及更低版本中，设置 `allow_remote_fs_zero_copy_replication` 默认设置为 `true`，适用于 S3 和 HDFS 磁盘。在此灾难恢复场景中，应将此设置设置为 `false`，而在版本 22.8 及更高版本中，它默认设置为 `false`。

此设置应为 false，理由有两个：1）此功能尚未为生产准备好；2）在灾难恢复场景中，数据和元数据需存储在多个区域。将 `allow_remote_fs_zero_copy_replication` 设置为 `false`。

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
   <merge_tree>
        <allow_remote_fs_zero_copy_replication>false</allow_remote_fs_zero_copy_replication>
   </merge_tree>
</clickhouse>
```

ClickHouse Keeper 负责协调 ClickHouse 节点之间的数据复制。要告知 ClickHouse 有关 ClickHouse Keeper 节点的信息，请在每个 ClickHouse 节点上添加配置文件。 

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

在配置 AWS 中的安全设置时，请查看 [网络端口](../../../guides/sre/network-ports.md) 列表，以便您的服务器可以相互通信，您也可以与它们通信。

所有三台服务器必须监听网络连接，以便它们可以在服务器之间以及与 S3 之间进行通信。默认情况下，ClickHouse 仅在回环地址上监听，因此必须进行更改。这在 `/etc/clickhouse-server/config.d/` 中配置。以下是一个示例，配置 ClickHouse 和 ClickHouse Keeper 在所有 IPv4 接口上监听。有关更多信息，请参阅文档或默认配置文件 `/etc/clickhouse/config.xml`。

```xml title="/etc/clickhouse-server/config.d/networking.xml"
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```
### 启动服务器 {#start-the-servers}
#### 运行 ClickHouse Keeper {#run-clickhouse-keeper}

在每个 Keeper 服务器上运行适合您操作系统的命令，例如：

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```
#### 检查 ClickHouse Keeper 状态 {#check-clickhouse-keeper-status}

使用 `netcat` 向 ClickHouse Keeper 发送命令。例如，`mntr` 返回 ClickHouse Keeper 集群的状态。如果您在每个 Keeper 节点上运行该命令，您会看到一个是领导者，另外两个是跟随者：

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
#### 运行 ClickHouse Server {#run-clickhouse-server}

在每个 ClickHouse 服务器上运行

```bash
sudo service clickhouse-server start
```
#### 验证 ClickHouse Server {#verify-clickhouse-server}

当您添加 [集群配置](#define-a-cluster) 时，已定义一个在两个 ClickHouse 节点之间复制的单个分片。在此验证步骤中，您将检查 ClickHouse 启动时集群是否已构建，并使用该集群创建一个复制表。
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

- 在集群中使用 `ReplicatedMergeTree` 表引擎创建一个表：
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

  宏 `shard` 和 `replica` 已在 [之前定义](#define-a-cluster)，在下面高亮的行中，您可以看到在每个 ClickHouse 节点上值是如何被替换的。此外，值 `uuid` 被使用；`uuid` 没有在宏中定义，因为它是由系统生成的。
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
  您可以通过设置 `default_replica_path` 和 `default_replica_name` 自定义上述所示的 zookeeper 路径 `'clickhouse/tables/{uuid}/{shard}`。文档在 [这里](/operations/server-configuration-parameters/settings.md/#default_replica_path)。
  :::
### 测试 {#testing-1}

这些测试将验证数据是否在两个服务器之间复制，并且它存储在 S3 桶中，而不是在本地磁盘上。

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

  检查本地磁盘上的数据大小。根据上面的内容，存储的数百万行的数据大小为 36.42 MiB。这应该在 S3 中，而不是在本地磁盘上。上述查询还告诉我们本地磁盘上数据和元数据存储的位置。检查本地数据：
```response
  root@chnode1:~# du -sh /var/lib/clickhouse/disks/s3_disk/store/551
  536K  /var/lib/clickhouse/disks/s3_disk/store/551
```

  检查每个 S3 桶中的 S3 数据（总数没有显示，但在插入后两个桶大约有 36 MiB 的存储）：

<Image img={Bucket1} size="lg" border alt="第一个 S3 桶中数据大小，显示存储使用指标" />

<Image img={Bucket2} size="lg" border alt="第二个 S3 桶中数据大小，显示存储使用指标" />
## S3Express {#s3express}

[S3Express](https://aws.amazon.com/s3/storage-classes/express-one-zone/) 是 Amazon S3 中一种新的高性能单可用区存储类。

您可以参考这篇 [博客](https://aws.amazon.com/blogs/storage/clickhouse-cloud-amazon-s3-express-one-zone-making-a-blazing-fast-analytical-database-even-faster/) 阅读我们测试 S3Express 与 ClickHouse 的经验。

:::note
  S3Express 在单个可用区内存储数据。这意味着在可用区故障的情况下数据将无法访问。
:::
### S3 磁盘 {#s3-disk}

创建一个存储由 S3Express 桶支持的表涉及以下步骤：

1. 创建一个 `Directory` 类型的桶
2. 安装适当的桶策略，以授予您的 S3 用户所需的所有权限（例如，`"Action": "s3express:*"` 以简单方式允许无限制访问）
3. 在配置存储策略时，请提供 `region` 参数

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

S3 存储也收到支持，但仅适用于 `Object URL` 路径。 示例：

```sql
select * from s3('https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/file.csv', ...)
```

同样需要在配置中指定桶区域：

```xml
<s3>
    <perf-bucket-url>
        <endpoint>https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com</endpoint>
        <region>eu-north-1</region>
    </perf-bucket-url>
</s3>
```
### 备份 {#backups}

可以将备份存储在我们上面创建的磁盘上：

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

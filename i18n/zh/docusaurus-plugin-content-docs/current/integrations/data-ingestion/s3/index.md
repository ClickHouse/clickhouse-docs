---
slug: /integrations/s3
sidebar_position: 1
sidebar_label: '在 ClickHouse 中集成 S3'
title: '在 ClickHouse 中集成 S3'
description: '介绍如何将 S3 与 ClickHouse 集成的页面'
keywords: ['Amazon S3', '对象存储', '云存储', '数据湖', 'S3 集成']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import BucketDetails from '@site/docs/_snippets/_S3_authentication_and_bucket.md';
import S3J from '@site/static/images/integrations/data-ingestion/s3/s3-j.png';
import Bucket1 from '@site/static/images/integrations/data-ingestion/s3/bucket1.png';
import Bucket2 from '@site/static/images/integrations/data-ingestion/s3/bucket2.png';
import Image from '@theme/IdealImage';


# 将 S3 与 ClickHouse 集成

您可以将 S3 中的数据写入 ClickHouse，也可以将 S3 用作导出目标，从而与“数据湖”（Data Lake）架构集成。此外，S3 还能提供“冷”存储层级，并有助于实现存储与计算分离。下面的内容中，我们将使用纽约市出租车数据集来演示在 S3 与 ClickHouse 之间迁移数据的过程，说明关键配置参数，并给出优化性能的建议。



## S3 表函数 {#s3-table-functions}

`s3` 表函数允许您从 S3 兼容存储中读取和写入文件。其语法格式如下:

```sql
s3(path, [aws_access_key_id, aws_secret_access_key,] [format, [structure, [compression]]])
```

其中:

- path — 包含文件路径的存储桶 URL。在只读模式下支持以下通配符:`*`、`?`、`{abc,def}` 和 `{N..M}`,其中 `N`、`M` 为数字,`'abc'`、`'def'` 为字符串。更多信息请参阅[在路径中使用通配符](/engines/table-engines/integrations/s3/#wildcards-in-path)的文档。
- format — 文件的[格式](/interfaces/formats#formats-overview)。
- structure — 表结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。
- compression — 可选参数。支持的值:`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。默认情况下,将根据文件扩展名自动检测压缩格式。

在路径表达式中使用通配符可以引用多个文件,并支持并行处理。

### 准备工作 {#preparation}

在 ClickHouse 中创建表之前,您可能希望先查看 S3 存储桶中的数据。您可以直接在 ClickHouse 中使用 `DESCRIBE` 语句来完成此操作:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

`DESCRIBE TABLE` 语句的输出将显示 ClickHouse 如何自动推断 S3 存储桶中的数据。请注意,它还会自动识别并解压 gzip 压缩格式:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') SETTINGS describe_compact_output=1

```


┌─列名──────────────────┬─类型───────────────┐
│ trip&#95;id               │ Nullable(Int64)    │
│ vendor&#95;id             │ Nullable(Int64)    │
│ pickup&#95;date           │ Nullable(Date)     │
│ pickup&#95;datetime       │ Nullable(DateTime) │
│ dropoff&#95;date          │ Nullable(Date)     │
│ dropoff&#95;datetime      │ Nullable(DateTime) │
│ store&#95;and&#95;fwd&#95;flag    │ Nullable(Int64)    │
│ rate&#95;code&#95;id          │ Nullable(Int64)    │
│ pickup&#95;longitude      │ Nullable(Float64)  │
│ pickup&#95;latitude       │ Nullable(Float64)  │
│ dropoff&#95;longitude     │ Nullable(Float64)  │
│ dropoff&#95;latitude      │ Nullable(Float64)  │
│ passenger&#95;count       │ Nullable(Int64)    │
│ trip&#95;distance         │ Nullable(String)   │
│ fare&#95;amount           │ Nullable(String)   │
│ extra                 │ Nullable(String)   │
│ mta&#95;tax               │ Nullable(String)   │
│ tip&#95;amount            │ Nullable(String)   │
│ tolls&#95;amount          │ Nullable(Float64)  │
│ ehail&#95;fee             │ Nullable(Int64)    │
│ improvement&#95;surcharge │ Nullable(String)   │
│ total&#95;amount          │ Nullable(String)   │
│ payment&#95;type          │ Nullable(String)   │
│ trip&#95;type             │ Nullable(Int64)    │
│ pickup                │ Nullable(String)   │
│ dropoff               │ Nullable(String)   │
│ cab&#95;type              │ Nullable(String)   │
│ pickup&#95;nyct2010&#95;gid   │ Nullable(Int64)    │
│ pickup&#95;ctlabel        │ Nullable(Float64)  │
│ pickup&#95;borocode       │ Nullable(Int64)    │
│ pickup&#95;ct2010         │ Nullable(String)   │
│ pickup&#95;boroct2010     │ Nullable(String)   │
│ pickup&#95;cdeligibil     │ Nullable(String)   │
│ pickup&#95;ntacode        │ Nullable(String)   │
│ pickup&#95;ntaname        │ Nullable(String)   │
│ pickup&#95;puma           │ Nullable(Int64)    │
│ dropoff&#95;nyct2010&#95;gid  │ Nullable(Int64)    │
│ dropoff&#95;ctlabel       │ Nullable(Float64)  │
│ dropoff&#95;borocode      │ Nullable(Int64)    │
│ dropoff&#95;ct2010        │ Nullable(String)   │
│ dropoff&#95;boroct2010    │ Nullable(String)   │
│ dropoff&#95;cdeligibil    │ Nullable(String)   │
│ dropoff&#95;ntacode       │ Nullable(String)   │
│ dropoff&#95;ntaname       │ Nullable(String)   │
│ dropoff&#95;puma          │ Nullable(Int64)    │
└───────────────────────┴────────────────────┘

```

为了与基于 S3 的数据集进行交互,我们准备一个标准的 `MergeTree` 表作为目标表。下面的语句在默认数据库中创建一个名为 `trips` 的表。请注意,我们选择修改了上面推断的部分数据类型,特别是不使用 [`Nullable()`](/sql-reference/data-types/nullable) 数据类型修饰符,因为它可能导致不必要的额外存储开销和性能损耗:
```


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

注意在 `pickup_date` 字段上使用了[分区](/engines/table-engines/mergetree-family/custom-partitioning-key)。通常分区键用于数据管理,但稍后我们将使用该键来并行化向 S3 的写入操作。

出租车数据集中的每个条目都包含一次出租车行程。这些匿名数据由 2000 万条记录组成,以压缩形式存储在 S3 存储桶 https://datasets-documentation.s3.eu-west-3.amazonaws.com/ 的 **nyc-taxi** 文件夹下。数据采用 TSV 格式,每个文件约包含 100 万行。

### 从 S3 读取数据 {#reading-data-from-s3}

我们可以将 S3 数据作为数据源进行查询,而无需在 ClickHouse 中持久化。在以下查询中,我们采样 10 行数据。请注意这里没有提供凭证,因为该存储桶是公开可访问的:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
LIMIT 10;
```

请注意,我们不需要列出列名,因为 `TabSeparatedWithNames` 格式在第一行中编码了列名。其他格式(如 `CSV` 或 `TSV`)将为此查询返回自动生成的列名,例如 `c1`、`c2`、`c3` 等。

查询还支持[虚拟列](../sql-reference/table-functions/s3#virtual-columns),如 `_path` 和 `_file`,它们分别提供存储桶路径和文件名信息。例如:

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

确认此示例数据集中的行数。注意使用通配符进行文件扩展,因此会处理所有二十个文件。此查询大约需要 10 秒,具体取决于 ClickHouse 实例的核心数:

```sql
SELECT count() AS count
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames');
```

```response
┌────count─┐
│ 20000000 │
└──────────┘
```

虽然直接从 S3 读取数据对于数据采样和执行临时探索性查询很有用,但这不应该是常规操作。当需要进行正式处理时,请将数据导入 ClickHouse 中的 `MergeTree` 表。

### 使用 clickhouse-local {#using-clickhouse-local}

`clickhouse-local` 程序使您能够在本地文件上执行快速处理,而无需部署和配置 ClickHouse 服务器。任何使用 `s3` 表函数的查询都可以通过此工具执行。例如:

```sql
clickhouse-local --query "SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

### 从 S3 插入数据 {#inserting-data-from-s3}

为了充分利用 ClickHouse 的全部功能,接下来我们将数据读取并插入到实例中。
我们将 `s3` 函数与简单的 `INSERT` 语句结合使用来实现此目的。请注意,我们不需要列出列名,因为目标表已提供所需的结构。这要求列按照表 DDL 语句中指定的顺序出现:列根据其在 `SELECT` 子句中的位置进行映射。插入所有 1000 万行可能需要几分钟,具体取决于 ClickHouse 实例。下面我们插入 100 万行以确保快速响应。根据需要调整 `LIMIT` 子句或列选择以导入数据子集:

```sql
INSERT INTO trips
   SELECT *
   FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames')
   LIMIT 1000000;
```

### 使用 ClickHouse Local 进行远程插入 {#remote-insert-using-clickhouse-local}

如果网络安全策略阻止您的 ClickHouse 集群建立出站连接,您可以使用 `clickhouse-local` 插入 S3 数据。在下面的示例中,我们从 S3 存储桶读取数据并使用 `remote` 函数插入到 ClickHouse 中:

```sql
clickhouse-local --query "INSERT INTO TABLE FUNCTION remote('localhost:9000', 'default.trips', 'username', 'password') (*) SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz', 'TabSeparatedWithNames') LIMIT 10"
```

:::note
要通过安全的 SSL 连接执行此操作,请使用 `remoteSecure` 函数。
:::

### 导出数据 {#exporting-data}

您可以使用 `s3` 表函数将数据写入 S3 中的文件。这需要适当的权限。我们在请求中传递所需的凭据,但请查看[管理凭据](#managing-credentials)页面以了解更多选项。

在下面的简单示例中,我们将表函数用作目标而不是源。在这里,我们将 `trips` 表中的 10,000 行流式传输到存储桶,指定 `lz4` 压缩和 `CSV` 输出类型:

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


注意这里文件格式是从扩展名推断出来的。我们也不需要在 `s3` 函数中指定列 - 这可以从 `SELECT` 中推断出来。

### 拆分大文件 {#splitting-large-files}

通常您不会希望将数据导出为单个文件。包括 ClickHouse 在内的大多数工具在读写多个文件时都能实现更高的吞吐量性能,因为可以并行处理。我们可以多次执行 `INSERT` 命令,针对数据的子集进行操作。ClickHouse 提供了使用 `PARTITION` 键自动拆分文件的方法。

在下面的示例中,我们使用 `rand()` 函数的模运算创建十个文件。注意生成的分区 ID 是如何在文件名中引用的。这将生成十个带有数字后缀的文件,例如 `trips_0.csv.lz4`、`trips_1.csv.lz4` 等:

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

或者,我们可以引用数据中的字段。对于此数据集,`payment_type` 提供了一个基数为 5 的自然分区键。

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

上述函数都仅限于在单个节点上执行。读取速度将随 CPU 核心数线性扩展,直到其他资源(通常是网络)饱和,这允许用户进行垂直扩展。然而,这种方法有其局限性。虽然用户可以在执行 `INSERT INTO SELECT` 查询时通过插入到分布式表来缓解一些资源压力,但这仍然让单个节点负责读取、解析和处理数据。为了应对这一挑战并实现读取操作的水平扩展,我们提供了 [s3Cluster](/sql-reference/table-functions/s3Cluster.md) 函数。

接收查询的节点(称为发起节点)会创建到集群中每个节点的连接。确定需要读取哪些文件的通配符模式会解析为一组文件。发起节点将文件分发给集群中充当工作节点的节点。这些工作节点在完成读取后会依次请求要处理的文件。此过程确保我们可以水平扩展读取操作。

`s3Cluster` 函数采用与单节点变体相同的格式,但需要指定目标集群来表示工作节点:

```sql
s3Cluster(cluster_name, source, [access_key_id, secret_access_key,] format, structure)
```

- `cluster_name` — 集群名称,用于构建远程和本地服务器的地址集和连接参数。
- `source` — 文件或一组文件的 URL。在只读模式下支持以下通配符:`*`、`?`、`{'abc','def'}` 和 `{N..M}`,其中 N、M 为数字,abc、def 为字符串。更多信息请参见[路径中的通配符](/engines/table-engines/integrations/s3.md/#wildcards-in-path)。
- `access_key_id` 和 `secret_access_key` — 指定用于给定端点的凭据的密钥。可选。
- `format` — 文件的[格式](/interfaces/formats#formats-overview)。
- `structure` — 表的结构。格式为 'column1_name column1_type, column2_name column2_type, ...'。

与任何 `s3` 函数一样,如果存储桶不安全或您通过环境定义安全性(例如 IAM 角色),则凭据是可选的。但是,与 s3 函数不同,从 22.3.1 版本开始,必须在请求中指定结构,即不会推断模式。

在大多数情况下,此函数将作为 `INSERT INTO SELECT` 的一部分使用。在这种情况下,您通常会插入到分布式表中。我们在下面展示一个简单的示例,其中 trips_all 是一个分布式表。虽然此表使用 events 集群,但用于读取和写入的节点的一致性不是必需的:


```sql
INSERT INTO default.trips_all
   SELECT *
   FROM s3Cluster(
       'events',
       'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_*.gz',
       'TabSeparatedWithNames'
    )
```

插入操作将在发起节点上执行。这意味着虽然每个节点都会进行读取操作，但生成的行会被路由回发起节点，再由其进行分发。在高吞吐量场景下，这可能成为瓶颈。为了解决这一问题，请为 `s3cluster` 函数设置参数 [parallel&#95;distributed&#95;insert&#95;select](/operations/settings/settings/#parallel_distributed_insert_select)。


## S3 表引擎 {#s3-table-engines}

虽然 `s3` 函数允许对存储在 S3 中的数据执行即席查询,但其语法较为冗长。`S3` 表引擎使您无需反复指定存储桶 URL 和凭证。为解决此问题,ClickHouse 提供了 S3 表引擎。

```sql
CREATE TABLE s3_engine_table (name String, value UInt32)
    ENGINE = S3(path, [aws_access_key_id, aws_secret_access_key,] format, [compression])
    [SETTINGS ...]
```

- `path` — 存储桶 URL 及文件路径。在只读模式下支持以下通配符:`*`、`?`、`{abc,def}` 和 `{N..M}`,其中 N、M 为数字,'abc'、'def' 为字符串。更多信息请参见[此处](/engines/table-engines/integrations/s3#wildcards-in-path)。
- `format` — 文件的[格式](/interfaces/formats#formats-overview)。
- `aws_access_key_id`、`aws_secret_access_key` — AWS 账户用户的长期凭证。您可以使用这些凭证来验证请求。此参数为可选项。如果未指定凭证,将使用配置文件中的值。更多信息请参见[管理凭证](#managing-credentials)。
- `compression` — 压缩类型。支持的值:none、gzip/gz、brotli/br、xz/LZMA、zstd/zst。此参数为可选项。默认情况下,将根据文件扩展名自动检测压缩类型。

### 读取数据 {#reading-data}

在以下示例中,我们使用位于 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/` 存储桶中的前十个 TSV 文件创建一个名为 `trips_raw` 的表。每个文件包含 100 万行数据:


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

注意使用 `{0..9}` 模式将读取范围限制为前十个文件。创建后,可以像查询其他表一样查询该表:

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

`S3` 表引擎支持并行读取。仅当表定义不包含通配符模式时才支持写入。因此,上述表将阻止写入。

为了演示写入,创建一个指向可写 S3 存储桶的表:

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

请注意，行只能插入到新文件中。不会进行合并周期或文件拆分操作。一旦文件写入完成，后续插入都会失败。此时用户有两个选项：

* 指定设置 `s3_create_new_file_on_insert=1`。这会在每次插入时创建新文件。一个数值后缀会被追加到每个文件名的末尾，并且对于每次插入操作该后缀都会单调递增。对于上面的示例，后续插入将会创建一个名为 trips&#95;1.bin 的文件。
* 指定设置 `s3_truncate_on_insert=1`。这会对文件进行截断，即完成后文件中只包含新插入的行。

这两个设置的默认值均为 0 —— 因此会强制用户显式设置其中一个。如果两者都被设置，则 `s3_truncate_on_insert` 优先级更高。

关于 `S3` 表引擎的一些说明：

* 与传统的 `MergeTree` 系列表不同，删除 `S3` 表不会删除其底层数据。
* 该表类型的完整设置列表可在[此处](/engines/table-engines/integrations/s3.md/#settings)查阅。
* 使用该引擎时请注意以下限制：
  * 不支持 ALTER 查询
  * 不支持 SAMPLE 操作
  * 不存在索引的概念，即既没有主键索引，也没有跳过索引。


## 管理凭证 {#managing-credentials}

在前面的示例中,我们在 `s3` 函数或 `S3` 表定义中传递了凭证。虽然这对于偶尔使用是可以接受的,但在生产环境中用户需要更隐式的身份验证机制。为此,ClickHouse 提供了以下几种选项:

- 在 **config.xml** 或 **conf.d** 目录下的等效配置文件中指定连接详细信息。以下是一个示例文件的内容,假设使用 debian 软件包进行安装。

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

  这些凭证将用于任何请求 URL 与上述端点完全前缀匹配的请求。另外,请注意此示例中可以声明授权标头作为访问密钥和密钥的替代方案。支持的设置完整列表可以在[此处](/engines/table-engines/integrations/s3.md/#settings)找到。

- 上面的示例展示了配置参数 `use_environment_credentials` 的可用性。此配置参数也可以在 `s3` 级别全局设置:

  ```xml
  <clickhouse>
      <s3>
      <use_environment_credentials>true</use_environment_credentials>
      </s3>
  </clickhouse>
  ```

  此设置启用从环境中检索 S3 凭证的尝试,从而允许通过 IAM 角色进行访问。具体来说,按以下顺序执行检索:
  - 查找环境变量 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY` 和 `AWS_SESSION_TOKEN`
  - 在 **$HOME/.aws** 中执行检查
  - 通过 AWS Security Token Service 获取临时凭证 - 即通过 [`AssumeRole`](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) API
  - 在 ECS 环境变量 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` 或 `AWS_CONTAINER_CREDENTIALS_FULL_URI` 和 `AWS_ECS_CONTAINER_AUTHORIZATION_TOKEN` 中检查凭证。
  - 通过 [Amazon EC2 实例元数据](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-metadata.html)获取凭证,前提是 [AWS_EC2_METADATA_DISABLED](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-list-AWS_EC2_METADATA_DISABLED) 未设置为 true。
  - 这些相同的设置也可以使用相同的前缀匹配规则为特定端点设置。


## 性能优化 {#s3-optimizing-performance}

关于如何使用 S3 函数优化读取和插入操作,请参阅[专用性能指南](./performance.md)。

### S3 存储调优 {#s3-storage-tuning}

在内部,ClickHouse 合并树使用两种主要存储格式:[`Wide` 和 `Compact`](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)。虽然当前实现使用 ClickHouse 的默认行为(通过 `min_bytes_for_wide_part` 和 `min_rows_for_wide_part` 设置控制),但我们预计在未来版本中针对 S3 的行为会有所不同,例如,`min_bytes_for_wide_part` 的默认值将更大,从而鼓励使用更紧凑的 `Compact` 格式,进而减少文件数量。在专门使用 S3 存储时,用户现在可能需要调整这些设置。


## S3 支持的 MergeTree {#s3-backed-mergetree}

`s3` 函数和相关的表引擎允许我们使用熟悉的 ClickHouse 语法查询 S3 中的数据。然而,在数据管理功能和性能方面,它们存在一定的局限性。不支持主索引,不支持缓存,并且文件插入需要由用户手动管理。

ClickHouse 认识到 S3 是一种极具吸引力的存储解决方案,特别是在对"冷"数据的查询性能要求不那么严格,且用户希望实现存储与计算分离的场景下。为了帮助实现这一目标,ClickHouse 提供了将 S3 用作 MergeTree 引擎存储的支持。这将使用户能够充分利用 S3 的可扩展性和成本优势,以及 MergeTree 引擎的插入和查询性能。

### 存储层级 {#storage-tiers}

ClickHouse 存储卷允许将物理磁盘从 MergeTree 表引擎中抽象出来。任何单个卷都可以由一组有序的磁盘组成。虽然这种抽象主要允许将多个块设备用于数据存储,但它也支持其他存储类型,包括 S3。ClickHouse 数据部分可以根据存储策略在卷之间移动并按填充率进行调整,从而形成了存储层级的概念。

存储层级实现了冷热架构,其中最新的数据(通常也是查询最频繁的数据)只需要在高性能存储(例如 NVMe SSD)上占用少量空间。随着数据老化,查询时间的 SLA 要求会降低,查询频率也会下降。这些长尾数据可以存储在较慢、性能较低的存储上,例如 HDD 或对象存储(如 S3)。

### 创建磁盘 {#creating-a-disk}

要将 S3 存储桶用作磁盘,我们必须首先在 ClickHouse 配置文件中声明它。可以扩展 config.xml,或者最好在 conf.d 下提供一个新文件。以下是 S3 磁盘声明的示例:

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

与此磁盘声明相关的完整设置列表可以在[此处](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)找到。请注意,凭证可以使用[管理凭证](#managing-credentials)中描述的相同方法进行管理,即可以在上述设置块中将 use_environment_credentials 设置为 true 以使用 IAM 角色。

### 创建存储策略 {#creating-a-storage-policy}

配置完成后,此"磁盘"可以被策略中声明的存储卷使用。在下面的示例中,我们假设 s3 是我们唯一的存储。这里不涉及更复杂的冷热架构,在这些架构中数据可以根据 TTL 和填充率进行重新定位。

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

假设您已将磁盘配置为使用具有写入权限的存储桶,您应该能够创建如下示例所示的表。为简洁起见,我们使用 NYC 出租车数据列的子集,并将数据直接流式传输到 S3 支持的表中:


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

根据硬件配置,插入这 100 万行数据可能需要几分钟时间。您可以通过 system.processes 表查看进度。可以根据需要将行数调整到 1000 万的上限,并执行一些示例查询。

```sql
SELECT passenger_count, avg(tip_amount) AS avg_tip, avg(total_amount) AS avg_amount FROM trips_s3 GROUP BY passenger_count;
```

### 修改表 {#modifying-a-table}

有时用户可能需要修改特定表的存储策略。虽然这是可行的,但存在一些限制。新的目标策略必须包含原策略的所有磁盘和卷,即数据不会因策略更改而迁移。在验证这些约束时,卷和磁盘将通过其名称进行识别,任何违反约束的尝试都会导致错误。但是,假设您使用前面的示例,以下更改是有效的。

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

在这里,我们在新的 s3_tiered 策略中重用了 main 卷,并引入了一个新的 hot 卷。该卷使用 default 磁盘,该磁盘仅包含一个通过 `<path>` 参数配置的磁盘。请注意,我们的卷名称和磁盘不会更改。表的新插入数据将驻留在 default 磁盘上,直到达到 move_factor \* disk_size 阈值时,数据将被迁移到 S3。

### 处理复制 {#handling-replication}

使用 S3 磁盘的复制可以通过 `ReplicatedMergeTree` 表引擎来实现。详细信息请参阅[使用 S3 对象存储跨两个 AWS 区域复制单个分片](#s3-multi-region)指南。

### 读写操作 {#read--writes}

以下说明涵盖了 S3 与 ClickHouse 交互的实现。虽然通常仅供参考,但在进行[性能优化](#s3-optimizing-performance)时可能对读者有所帮助:


* 默认情况下，查询处理流水线任意阶段可使用的最大查询处理线程数等于 CPU 核心数。某些阶段比其他阶段更易并行化，因此此值只是一个上限。由于数据是以流式方式从磁盘读取，多个查询阶段可以同时执行，因此单个查询实际使用的线程数可能会超过该值。可通过设置 [max_threads](/operations/settings/settings#max_threads) 进行修改。
* 默认情况下，对 S3 的读取是异步的。此行为由设置 `remote_filesystem_read_method` 决定，其默认值为 `threadpool`。在处理请求时，ClickHouse 以条带（stripe）的方式读取 granule。每个条带中可能包含多列。单个线程会逐个读取其 granule 对应的列。与同步读取不同，会在等待数据之前对所有列进行预取（prefetch）。与对每一列进行同步等待相比，这能带来显著的性能提升。在大多数情况下，用户无需更改此设置——请参阅[性能优化](#s3-optimizing-performance)。
* 写入是并行执行的，并发文件写入线程的最大数量为 100。`max_insert_delayed_streams_for_parallel_write` 的默认值为 1000，用于控制并行写入的 S3 blob 数量。由于每个正在写入的文件都需要一个缓冲区（约 1MB），这在实际中限制了单次 INSERT 的内存消耗。在服务器内存较小的场景中，适当降低该值可能更为合适。



## 将 S3 对象存储用作 ClickHouse 磁盘 {#configuring-s3-for-clickhouse-use}

如果您需要创建存储桶和 IAM 角色的分步说明,请展开**创建 S3 存储桶和 IAM 角色**并按照步骤操作:

<BucketDetails />

### 配置 ClickHouse 以将 S3 存储桶用作磁盘 {#configure-clickhouse-to-use-the-s3-bucket-as-a-disk}

以下示例基于以服务方式安装的 Linux Deb 软件包,使用默认的 ClickHouse 目录。

1.  在 ClickHouse 的 `config.d` 目录中创建一个新文件以存储存储配置。

```bash
vim /etc/clickhouse-server/config.d/storage_config.xml
```

2. 添加以下存储配置;将存储桶路径、访问密钥和私密访问密钥替换为前面步骤中的值

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
`<disks>` 标签内的 `s3_disk` 和 `s3_cache` 标签是任意标签。这些可以设置为其他名称,但在 `<policies>` 标签下的 `<disk>` 标签中必须使用相同的标签来引用该磁盘。
`<s3_main>` 标签也是任意的,它是策略的名称,在 ClickHouse 中创建资源时将用作存储目标的标识符。

上述配置适用于 ClickHouse 版本 22.8 或更高版本,如果您使用的是较旧版本,请参阅[存储数据](/operations/storing-data.md/#using-local-cache)文档。

有关使用 S3 的更多信息:
集成指南:[S3 支持的 MergeTree](#s3-backed-mergetree)
:::

3. 将文件的所有者更新为 `clickhouse` 用户和组

```bash
chown clickhouse:clickhouse /etc/clickhouse-server/config.d/storage_config.xml
```

4. 重启 ClickHouse 实例以使更改生效。

```bash
service clickhouse-server restart
```

### 测试 {#testing}

1. 使用 ClickHouse 客户端登录,类似如下命令

```bash
clickhouse-client --user default --password ClickHouse123!
```

2. 创建一个表并指定新的 S3 存储策略

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

3. 显示表已使用正确的策略创建

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

5. 查看行数据

```sql
SELECT * FROM s3_table1;
```

```response
┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ xyz     │
└────┴─────────┘

```


结果集包含 2 行。耗时：0.284 秒。

```
6.  在 AWS 控制台中,导航至存储桶,选择新创建的存储桶及其文件夹。
您应该会看到类似如下的内容:

<Image img={S3J} size="lg" border alt="AWS 控制台中的 S3 存储桶视图,显示存储在 S3 中的 ClickHouse 数据文件" />
```


## 使用 S3 对象存储跨两个 AWS 区域复制单个分片 {#s3-multi-region}

:::tip
ClickHouse Cloud 默认使用对象存储,如果您在 ClickHouse Cloud 中运行,则无需执行此操作。
:::

### 规划部署 {#plan-the-deployment}

本教程基于在 AWS EC2 中部署两个 ClickHouse Server 节点和三个 ClickHouse Keeper 节点。ClickHouse 服务器的数据存储使用 S3。为了支持灾难恢复,使用两个 AWS 区域,每个区域中分别部署一个 ClickHouse Server 和一个 S3 存储桶。

ClickHouse 表在两个服务器之间进行复制,因此也实现了跨区域复制。

### 安装软件 {#install-software}

#### ClickHouse 服务器节点 {#clickhouse-server-nodes}

在 ClickHouse 服务器节点上执行部署步骤时,请参考[安装说明](/getting-started/install/install.mdx)。

#### 部署 ClickHouse {#deploy-clickhouse}

在两台主机上部署 ClickHouse,在示例配置中它们分别命名为 `chnode1` 和 `chnode2`。

将 `chnode1` 部署在一个 AWS 区域中,将 `chnode2` 部署在另一个区域中。

#### 部署 ClickHouse Keeper {#deploy-clickhouse-keeper}

在三台主机上部署 ClickHouse Keeper,在示例配置中它们分别命名为 `keepernode1`、`keepernode2` 和 `keepernode3`。`keepernode1` 可以与 `chnode1` 部署在同一区域,`keepernode2` 与 `chnode2` 部署在同一区域,`keepernode3` 可以部署在任一区域,但需要与该区域中的 ClickHouse 节点位于不同的可用区。

在 ClickHouse Keeper 节点上执行部署步骤时,请参考[安装说明](/getting-started/install/install.mdx)。

### 创建 S3 存储桶 {#create-s3-buckets}

创建两个 S3 存储桶,分别位于您部署 `chnode1` 和 `chnode2` 的每个区域中。

如果您需要创建存储桶和 IAM 角色的分步说明,请展开**创建 S3 存储桶和 IAM 角色**并按照步骤操作:

<BucketDetails />

配置文件将放置在 `/etc/clickhouse-server/config.d/` 目录中。以下是一个存储桶的示例配置文件,另一个类似,仅有三个高亮行不同:

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
本指南中的许多步骤会要求您将配置文件放置在 `/etc/clickhouse-server/config.d/` 目录中。这是 Linux 系统上配置覆盖文件的默认位置。当您将这些文件放入该目录时,ClickHouse 将使用其内容覆盖默认配置。通过将这些文件放置在覆盖目录中,您可以避免在升级过程中丢失配置。
:::

### 配置 ClickHouse Keeper {#configure-clickhouse-keeper}

当独立运行 ClickHouse Keeper(与 ClickHouse 服务器分离)时,配置为单个 XML 文件。在本教程中,该文件为 `/etc/clickhouse-keeper/keeper_config.xml`。所有三个 Keeper 服务器使用相同的配置,仅有一个设置不同:`<server_id>`。


`server_id` 表示要分配给使用该配置文件的主机的 ID。在下面的示例中,`server_id` 为 `3`,如果您在文件中继续向下查看 `<raft_configuration>` 部分,会看到服务器 3 的主机名为 `keepernode3`。ClickHouse Keeper 进程正是通过这种方式来确定在选举领导者及执行其他活动时需要连接哪些服务器。

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

将 ClickHouse Keeper 的配置文件复制到相应位置(记得设置 `<server_id>`):

```bash
sudo -u clickhouse \
  cp keeper.xml /etc/clickhouse-keeper/keeper.xml
```

### 配置 ClickHouse 服务器 {#configure-clickhouse-server}

#### 定义集群 {#define-a-cluster}

ClickHouse 集群在配置的 `<remote_servers>` 部分中定义。在此示例中,定义了一个名为 `cluster_1S_2R` 的集群,它由一个分片和两个副本组成。这两个副本分别位于主机 `chnode1` 和 `chnode2` 上。

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

在使用集群时,定义宏来自动填充 DDL 查询中的集群、分片和副本设置会非常便利。此示例允许您在使用复制表引擎时无需手动提供 `shard` 和 `replica` 详细信息。创建表后,您可以通过查询 `system.tables` 来查看 `shard` 和 `replica` 宏的实际使用情况。

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
以上宏配置适用于 `chnode1`,在 `chnode2` 上需将 `replica` 设置为 `replica_2`。
:::

#### 禁用零拷贝复制 {#disable-zero-copy-replication}


在 ClickHouse 22.7 及更低版本中,S3 和 HDFS 磁盘的 `allow_remote_fs_zero_copy_replication` 设置默认为 `true`。在灾难恢复场景中,该设置应设为 `false`,而在 22.8 及更高版本中默认已设为 `false`。

该设置应为 false 有两个原因:1) 此功能尚未达到生产就绪状态;2) 在灾难恢复场景中,数据和元数据都需要存储在多个区域。请将 `allow_remote_fs_zero_copy_replication` 设为 `false`。

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml"
<clickhouse>
   <merge_tree>
        <allow_remote_fs_zero_copy_replication>false</allow_remote_fs_zero_copy_replication>
   </merge_tree>
</clickhouse>
```

ClickHouse Keeper 负责协调 ClickHouse 节点之间的数据复制。要将 ClickHouse Keeper 节点信息告知 ClickHouse,需要在每个 ClickHouse 节点上添加配置文件。

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

在 AWS 中配置安全设置时,请参阅[网络端口](../../../guides/sre/network-ports.md)列表,以确保服务器之间可以相互通信,并且您可以与它们通信。

所有三台服务器都必须监听网络连接,以便服务器之间以及与 S3 进行通信。默认情况下,ClickHouse 仅监听回环地址,因此必须更改此设置。该配置位于 `/etc/clickhouse-server/config.d/` 中。以下示例配置 ClickHouse 和 ClickHouse Keeper 监听所有 IPv4 接口。有关更多信息,请参阅文档或默认配置文件 `/etc/clickhouse/config.xml`。

```xml title="/etc/clickhouse-server/config.d/networking.xml"
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

### 启动服务器 {#start-the-servers}

#### 运行 ClickHouse Keeper {#run-clickhouse-keeper}

在每个 Keeper 服务器上运行适用于您操作系统的命令,例如:

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### 检查 ClickHouse Keeper 状态 {#check-clickhouse-keeper-status}

使用 `netcat` 向 ClickHouse Keeper 发送命令。例如,`mntr` 返回 ClickHouse Keeper 集群的状态。如果您在每个 Keeper 节点上运行该命令,将看到一个节点是 leader,另外两个节点是 follower:


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

在添加[集群配置](#define-a-cluster)时,定义了一个跨两个 ClickHouse 节点复制的单分片集群。在此验证步骤中,您将检查 ClickHouse 启动时集群是否已成功构建,并使用该集群创建一个复制表。

- 验证集群是否存在:

  ```sql
  show clusters
  ```

  ```response
  ┌─cluster───────┐
  │ cluster_1S_2R │
  └───────────────┘

  1 row in set. Elapsed: 0.009 sec. `
  ```

- 使用 `ReplicatedMergeTree` 表引擎在集群中创建表:
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
- 理解之前定义的宏的使用方式

  宏 `shard` 和 `replica` 在[之前已定义](#define-a-cluster),在下面高亮显示的行中,您可以看到这些值在每个 ClickHouse 节点上的替换位置。此外,还使用了 `uuid` 值;`uuid` 未在宏中定义,因为它是由系统自动生成的。

  ```sql
  SELECT create_table_query
  FROM system.tables
  WHERE name = 'trips'
  FORMAT Vertical
  ```

  ```response
  Query id: 4d326b66-0402-4c14-9c2f-212bedd282c0
  ```


第 1 行:
──────
create&#95;table&#95;query: CREATE TABLE default.trips (`trip_id` UInt32, `pickup_date` Date, `pickup_datetime` DateTime, `dropoff_datetime` DateTime, `pickup_longitude` Float64, `pickup_latitude` Float64, `dropoff_longitude` Float64, `dropoff_latitude` Float64, `passenger_count` UInt8, `trip_distance` Float64, `tip_amount` Float32, `total_amount` Float32, `payment_type` Enum8(&#39;UNK&#39; = 0, &#39;CSH&#39; = 1, &#39;CRE&#39; = 2, &#39;NOC&#39; = 3, &#39;DIS&#39; = 4))

# highlight-next-line

ENGINE = ReplicatedMergeTree(&#39;/clickhouse/tables/{uuid}/{shard}&#39;, &#39;{replica}&#39;)
PARTITION BY toYYYYMM(pickup&#95;date) ORDER BY pickup&#95;datetime SETTINGS storage&#95;policy = &#39;s3&#95;main&#39;

1 行结果。耗时：0.012 秒。

````
:::note
您可以通过设置 `default_replica_path` 和 `default_replica_name` 来自定义上述 ZooKeeper 路径 `'clickhouse/tables/{uuid}/{shard}`。相关文档请参见[此处](/operations/server-configuration-parameters/settings.md/#default_replica_path)。
:::

### 测试 {#testing-1}

这些测试将验证数据是否在两台服务器之间正确复制,以及数据是否存储在 S3 存储桶而非本地磁盘中。

- 从纽约市出租车数据集添加数据:
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
````

* 验证数据已存储在 S3 中。

  此查询显示磁盘上的数据大小，以及用于决定使用哪个磁盘的存储策略。

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

  检查本地磁盘上的数据大小。根据上面的输出，存储的数百万行数据在磁盘上的大小为 36.42 MiB。该数据应存储在 S3 中，而不是本地磁盘上。上面的查询还告诉我们数据和元数据在本地磁盘上的存储位置。检查本地数据：

  ```response
  root@chnode1:~# du -sh /var/lib/clickhouse/disks/s3_disk/store/551
  536K  /var/lib/clickhouse/disks/s3_disk/store/551
  ```

  检查每个 S3 存储桶中的数据（不显示总计，但在插入数据后两个存储桶中大约都存储了 36 MiB）：

<Image img={Bucket1} size="lg" border alt="第一个 S3 存储桶中的数据大小，显示存储使用指标" />

<Image img={Bucket2} size="lg" border alt="第二个 S3 存储桶中的数据大小，显示存储使用指标" />


## S3Express {#s3express}

[S3Express](https://aws.amazon.com/s3/storage-classes/express-one-zone/) 是 Amazon S3 中一种新的高性能单可用区存储类。

您可以参考此[博客](https://aws.amazon.com/blogs/storage/clickhouse-cloud-amazon-s3-express-one-zone-making-a-blazing-fast-analytical-database-even-faster/)了解我们使用 ClickHouse 测试 S3Express 的经验。

:::note
S3Express 将数据存储在单个可用区内。这意味着在可用区发生故障时数据将不可用。
:::

### S3 磁盘 {#s3-disk}

创建使用 S3Express 存储桶作为后端存储的表需要以下步骤:

1. 创建 `Directory` 类型的存储桶
2. 配置适当的存储桶策略,向您的 S3 用户授予所有必需的权限(例如 `"Action": "s3express:*"` 可简单地允许无限制访问)
3. 配置存储策略时请提供 `region` 参数

存储配置与普通 S3 相同,例如可能如下所示:

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

然后在新存储上创建表:

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

S3 存储也受支持,但仅适用于 `Object URL` 路径。示例:

```sql
SELECT * FROM s3('https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com/file.csv', ...)
```

同时还需要在配置中指定存储桶区域:

```xml
<s3>
    <perf-bucket-url>
        <endpoint>https://test-bucket--eun1-az1--x-s3.s3express-eun1-az1.eu-north-1.amazonaws.com</endpoint>
        <region>eu-north-1</region>
    </perf-bucket-url>
</s3>
```

### 备份 {#backups}

可以将备份存储在我们上面创建的磁盘上:

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

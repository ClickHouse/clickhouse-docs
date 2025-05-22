import redshiftToClickhouse from '@site/static/images/integrations/data-ingestion/redshift/redshift-to-clickhouse.png';
import push from '@site/static/images/integrations/data-ingestion/redshift/push.png';
import pull from '@site/static/images/integrations/data-ingestion/redshift/pull.png';
import pivot from '@site/static/images/integrations/data-ingestion/redshift/pivot.png';
import s3_1 from '@site/static/images/integrations/data-ingestion/redshift/s3-1.png';
import s3_2 from '@site/static/images/integrations/data-ingestion/redshift/s3-2.png';
import Image from '@theme/IdealImage';

# 从 Redshift 迁移数据到 ClickHouse

## 相关内容 {#related-content}

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/SyhZmS5ZZaA"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

- 博客: [优化分析工作负载: 比较 Redshift 与 ClickHouse](https://clickhouse.com/blog/redshift-vs-clickhouse-comparison)

## 引言 {#introduction}

[Amazon Redshift](https://aws.amazon.com/redshift/) 是一种流行的云数据仓库解决方案，属于 Amazon Web Services 的一部分。本指南介绍将数据从 Redshift 实例迁移到 ClickHouse 的不同方法。我们将介绍三种选项：

<Image img={redshiftToClickhouse} size="lg" alt="从 Redshift 到 ClickHouse 的迁移选项" background="white"/>

从 ClickHouse 实例的角度来看，您可以选择：

1. **[推送](#push-data-from-redshift-to-clickhouse)** 数据到 ClickHouse，使用第三方 ETL/ELT 工具或服务

2. **[拉取](#pull-data-from-redshift-to-clickhouse)** 数据从 Redshift，利用 ClickHouse JDBC Bridge

3. **[透视](#pivot-data-from-redshift-to-clickhouse-using-s3)** 使用 S3 对象存储，采用“先卸载再加载”的逻辑

:::note
在本教程中，我们使用 Redshift 作为数据源。然而，这里介绍的迁移方法并不局限于 Redshift，对于任何兼容的数据源，均可衍生出类似的步骤。
:::


## 从 Redshift 推送数据到 ClickHouse {#push-data-from-redshift-to-clickhouse}

在推送场景中，想法是利用第三方工具或服务（自定义代码或 [ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT)）将数据发送到 ClickHouse 实例。例如，您可以使用软件 [Airbyte](https://www.airbyte.com/) 在 Redshift 实例（作为源）和 ClickHouse（作为目的地）之间移动数据（[请参阅我们的 Airbyte 集成指南](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)）

<Image img={push} size="lg" alt="从 Redshift 推送到 ClickHouse" background="white"/>

### 优点 {#pros}

* 可以利用 ETL/ELT 软件现有的连接器目录。
* 内置功能可以保持数据同步（追加/覆盖/增量逻辑）。
* 支持数据变换场景（例如，请参阅我们的 [dbt 集成指南](/integrations/data-ingestion/etl-tools/dbt/index.md)）。

### 缺点 {#cons}

* 用户需要设置和维护 ETL/ELT 基础设施。
* 在架构中引入了第三方元素，这可能变成潜在的可扩展性瓶颈。


## 从 Redshift 拉取数据到 ClickHouse {#pull-data-from-redshift-to-clickhouse}

在拉取场景中，想法是利用 ClickHouse JDBC Bridge 直接从 ClickHouse 实例连接到 Redshift 集群并执行 `INSERT INTO ... SELECT` 查询：

<Image img={pull} size="lg" alt="从 Redshift 拉取到 ClickHouse" background="white"/>

### 优点 {#pros-1}

* 适用于所有兼容 JDBC 的工具
* 优雅的解决方案，可以从 ClickHouse 中查询多个外部数据源

### 缺点 {#cons-1}

* 需要一个 ClickHouse JDBC Bridge 实例，这可能成为潜在的可扩展性瓶颈


:::note
尽管 Redshift 基于 PostgreSQL，但使用 ClickHouse PostgreSQL 表函数或者表引擎是不可能的，因为 ClickHouse 要求 PostgreSQL 版本为 9 或更高，而 Redshift API 基于一个较早的版本（8.x）。
:::

### 教程 {#tutorial}

要使用此选项，您需要设置 ClickHouse JDBC Bridge。ClickHouse JDBC Bridge 是一个独立的 Java 应用程序，处理 JDBC 连接，并充当 ClickHouse 实例与数据源之间的代理。在本教程中，我们使用的是一个预填充的 Redshift 实例，包含一个 [示例数据库](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html)。

1. 部署 ClickHouse JDBC Bridge。有关更多详细信息，请参见我们的用户指南 [JDBC 用于外部数据源](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md)

:::note
如果您使用的是 ClickHouse Cloud，您需要在单独的环境中运行 ClickHouse JDBC Bridge，并使用 [remoteSecure](/sql-reference/table-functions/remote/) 函数连接到 ClickHouse Cloud
:::

2. 为 ClickHouse JDBC Bridge 配置您的 Redshift 数据源。例如，`/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json `

```json
{
  "redshift-server": {
    "aliases": [
      "redshift"
    ],
    "driverUrls": [
    "https://s3.amazonaws.com/redshift-downloads/drivers/jdbc/2.1.0.4/redshift-jdbc42-2.1.0.4.jar"
    ],
    "driverClassName": "com.amazon.redshift.jdbc.Driver",
    "jdbcUrl": "jdbc:redshift://redshift-cluster-1.ckubnplpz1uv.us-east-1.redshift.amazonaws.com:5439/dev",
    "username": "awsuser",
    "password": "<password>",
    "maximumPoolSize": 5
  }
}
```

3. 一旦 ClickHouse JDBC Bridge 部署并运行，您就可以开始从 ClickHouse 查询您的 Redshift 实例

```sql
SELECT *
FROM jdbc('redshift', 'select username, firstname, lastname from users limit 5')
```

```response
Query id: 1b7de211-c0f6-4117-86a2-276484f9f4c0

┌─username─┬─firstname─┬─lastname─┐
│ PGL08LJI │ Vladimir  │ Humphrey │
│ XDZ38RDD │ Barry     │ Roy      │
│ AEB55QTM │ Reagan    │ Hodge    │
│ OWY35QYB │ Tamekah   │ Juarez   │
│ MSD36KVR │ Mufutau   │ Watkins  │
└──────────┴───────────┴──────────┘

5 rows in set. Elapsed: 0.438 sec.
```

```sql
SELECT *
FROM jdbc('redshift', 'select count(*) from sales')
```

```response
Query id: 2d0f957c-8f4e-43b2-a66a-cc48cc96237b

┌──count─┐
│ 172456 │
└────────┘

1 rows in set. Elapsed: 0.304 sec.
```

4. 接下来，我们展示如何使用 `INSERT INTO ... SELECT` 语句导入数据

```sql

# TABLE CREATION with 3 columns
CREATE TABLE users_imported
(
    `username` String,
    `firstname` String,
    `lastname` String
)
ENGINE = MergeTree
ORDER BY firstname
```

```response
Query id: c7c4c44b-cdb2-49cf-b319-4e569976ab05

Ok.

0 rows in set. Elapsed: 0.233 sec.
```

```sql

# IMPORTING DATA
INSERT INTO users_imported (*) SELECT *
FROM jdbc('redshift', 'select username, firstname, lastname from users')
```

```response
Query id: 9d3a688d-b45a-40f4-a7c7-97d93d7149f1

Ok.

0 rows in set. Elapsed: 4.498 sec. Processed 49.99 thousand rows, 2.49 MB (11.11 thousand rows/s., 554.27 KB/s.)
```

## 使用 S3 从 Redshift 透视数据到 ClickHouse {#pivot-data-from-redshift-to-clickhouse-using-s3}

在此场景中，我们将数据导出到 S3 的中间透视格式，并在第二步中将数据从 S3 加载到 ClickHouse。

<Image img={pivot} size="lg" alt="使用 S3 的透视从 Redshift" background="white"/>

### 优点 {#pros-2}

* Redshift 和 ClickHouse 都具有强大的 S3 集成功能。
* 利用现有功能，例如 Redshift 的 `UNLOAD` 命令和 ClickHouse 的 S3 表函数 / 表引擎。
* 由于 ClickHouse 支持从/向 S3 的并行读取和高吞吐量能力，无缝扩展。
* 可以利用复杂和压缩的格式，如 Apache Parquet。

### 缺点 {#cons-2}

* 过程中的两个步骤（从 Redshift 卸载然后加载到 ClickHouse）。

### 教程 {#tutorial-1}

1. 使用 Redshift 的 [UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html) 功能，将数据导出到现有的私有 S3 存储桶：

    <Image img={s3_1} size="md" alt="从 Redshift 卸载到 S3" background="white"/>

    它将生成包含原始数据的部分文件在 S3 中

    <Image img={s3_2} size="md" alt="S3 中的数据" background="white"/>

2. 在 ClickHouse 中创建表：

```sql
CREATE TABLE users
(
    username String,
    firstname String,
    lastname String
)
ENGINE = MergeTree
ORDER BY username
```

    另外，ClickHouse 可以尝试使用 `CREATE TABLE ... EMPTY AS SELECT` 推断表结构：

```sql
CREATE TABLE users
ENGINE = MergeTree ORDER BY username
EMPTY AS
SELECT * FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
```

    当数据采用包含数据类型信息的格式，例如 Parquet 时，这特别有效。

3. 使用 `INSERT INTO ... SELECT` 语句将 S3 文件加载到 ClickHouse：
```sql
INSERT INTO users SELECT *
FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
```

```response
Query id: 2e7e219a-6124-461c-8d75-e4f5002c8557

Ok.

0 rows in set. Elapsed: 0.545 sec. Processed 49.99 thousand rows, 2.34 MB (91.72 thousand rows/s., 4.30 MB/s.)
```

:::note
此示例使用 CSV 作为透视格式。然而，对于生产工作负载，我们建议将 Apache Parquet 作为大规模迁移的最佳选择，因为它具有压缩功能，并且可以降低部分存储成本，同时减少传输时间。（默认情况下，每个行组都使用 SNAPPY 压缩）。ClickHouse 还利用 Parquet 的列式结构加快数据摄取速度。
:::

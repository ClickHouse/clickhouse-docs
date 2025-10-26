import redshiftToClickhouse from '@site/static/images/integrations/data-ingestion/redshift/redshift-to-clickhouse.png';
import push from '@site/static/images/integrations/data-ingestion/redshift/push.png';
import pull from '@site/static/images/integrations/data-ingestion/redshift/pull.png';
import pivot from '@site/static/images/integrations/data-ingestion/redshift/pivot.png';
import s3_1 from '@site/static/images/integrations/data-ingestion/redshift/s3-1.png';
import s3_2 from '@site/static/images/integrations/data-ingestion/redshift/s3-2.png';
import Image from '@theme/IdealImage';

## 介绍 {#introduction}

[Amazon Redshift](https://aws.amazon.com/redshift/) 是一个流行的云数据仓库解决方案，是亚马逊Web服务（AWS）提供的一部分。本指南介绍了将数据从Redshift实例迁移到ClickHouse的不同方法。我们将涵盖三种选项：

<Image img={redshiftToClickhouse} size="md" alt="Redshift到ClickHouse迁移选项" background="white"/>

从ClickHouse实例的角度来看，您可以选择：

1. **[推送](#push-data-from-redshift-to-clickhouse)** 数据到ClickHouse，使用第三方ETL/ELT工具或服务

2. **[拉取](#pull-data-from-redshift-to-clickhouse)** 数据从Redshift，利用ClickHouse JDBC Bridge

3. **[透视](#pivot-data-from-redshift-to-clickhouse-using-s3)** 使用S3对象存储，采用“先卸载后加载”的逻辑

:::note
在本教程中，我们使用Redshift作为数据源。然而，这里介绍的迁移方法并不专属于Redshift，类似的步骤也可以适用于任何兼容的数据源。
:::

## 从Redshift推送数据到ClickHouse {#push-data-from-redshift-to-clickhouse}

在推送场景中，想法是利用第三方工具或服务（无论是自定义代码还是 [ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT)）将您的数据发送到ClickHouse实例。例如，您可以使用像 [Airbyte](https://www.airbyte.com/) 这样的软件，在您的Redshift实例（作为源）和ClickHouse（作为目标）之间传输数据（[请参阅我们的Airbyte集成指南](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)）

<Image img={push} size="md" alt="从Redshift到ClickHouse推送" background="white"/>

### 优点 {#pros}

* 可以利用ETL/ELT软件中现有的连接器目录。
* 内置的同步数据能力（追加/覆盖/增量逻辑）。
* 能够启用数据转换场景（例如，请参见我们的 [dbt 集成指南](/integrations/data-ingestion/etl-tools/dbt/index.md)）。

### 缺点 {#cons}

* 用户需要建立和维护ETL/ELT基础设施。
* 在架构中引入了第三方元素，这可能成为潜在的可扩展性瓶颈。

## 从Redshift拉取数据到ClickHouse {#pull-data-from-redshift-to-clickhouse}

在拉取场景中，想法是利用ClickHouse JDBC Bridge直接连接到Redshift集群，并执行 `INSERT INTO ... SELECT` 查询：

<Image img={pull} size="md" alt="从Redshift到ClickHouse拉取" background="white"/>

### 优点 {#pros-1}

* 适用于所有兼容JDBC的工具
* 优雅的方法允许从ClickHouse中查询多个外部数据源

### 缺点 {#cons-1}

* 需要一个ClickHouse JDBC Bridge实例，这可能成为潜在的可扩展性瓶颈

:::note
尽管Redshift基于PostgreSQL，但由于ClickHouse要求PostgreSQL版本9或更高，而Redshift API基于早期版本（8.x），无法使用ClickHouse的PostgreSQL表函数或表引擎。
:::

### 教程 {#tutorial}

要使用此选项，您需要设置ClickHouse JDBC Bridge。ClickHouse JDBC Bridge是一个独立的Java应用程序，处理JDBC连接，并充当ClickHouse实例与数据源之间的代理。在本教程中，我们使用了一个预填充的Redshift实例，其中包含一个 [示例数据库](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html)。

<VerticalStepper headerLevel="h4">

#### 部署ClickHouse JDBC Bridge {#deploy-clickhouse-jdbc-bridge}

部署ClickHouse JDBC Bridge。有关更多详细信息，请参见我们的用户指南 [JDBC用于外部数据源](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md)

:::note
如果您使用ClickHouse Cloud，您需要在一个单独的环境中运行ClickHouse JDBC Bridge，并使用 [remoteSecure](/sql-reference/table-functions/remote/) 函数连接到ClickHouse Cloud。
:::

#### 配置您的Redshift数据源 {#configure-your-redshift-datasource}

为ClickHouse JDBC Bridge配置您的Redshift数据源。例如，`/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json `

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

#### 从ClickHouse查询您的Redshift实例 {#query-your-redshift-instance-from-clickhouse}

一旦ClickHouse JDBC Bridge部署并运行，您可以开始从ClickHouse查询您的Redshift实例

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

#### 从Redshift导入数据到ClickHouse {#import-data-from-redshift-to-clickhouse}

下面展示了使用 `INSERT INTO ... SELECT` 语句导入数据

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
INSERT INTO users_imported (*) SELECT *
FROM jdbc('redshift', 'select username, firstname, lastname from users')
```

```response
Query id: 9d3a688d-b45a-40f4-a7c7-97d93d7149f1

Ok.

0 rows in set. Elapsed: 4.498 sec. Processed 49.99 thousand rows, 2.49 MB (11.11 thousand rows/s., 554.27 KB/s.)
```

</VerticalStepper>

## 使用S3从Redshift透视数据到ClickHouse {#pivot-data-from-redshift-to-clickhouse-using-s3}

在此场景中，我们将数据导出到S3，以中间透视格式存储，然后在第二步中，将数据从S3加载到ClickHouse。

<Image img={pivot} size="md" alt="使用S3从Redshift透视" background="white"/>

### 优点 {#pros-2}

* Redshift和ClickHouse都具有强大的S3集成功能。
* 利用现有功能，例如Redshift的 `UNLOAD` 命令和ClickHouse的S3表函数/表引擎。
* 由于ClickHouse中的并行读取和高吞吐能力，可以无缝扩展。
* 可以利用复杂且压缩的格式，如Apache Parquet。

### 缺点 {#cons-2}

* 过程中的两个步骤（从Redshift卸载，然后加载到ClickHouse）。

### 教程 {#tutorial-1}

<VerticalStepper headerLevel="h4">

#### 使用UNLOAD将数据导出到S3存储桶 {#export-data-into-an-s3-bucket-using-unload}

使用Redshift的 [UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html) 功能，将数据导出到现有的私有S3存储桶：

<Image img={s3_1} size="md" alt="从Redshift到S3卸载" background="white"/>

它将生成包含原始数据的部分文件存储在S3中

<Image img={s3_2} size="md" alt="S3中的数据" background="white"/>

#### 在ClickHouse中创建表 {#create-the-table-in-clickhouse}

在ClickHouse中创建表：

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

或者，ClickHouse可以尝试通过 `CREATE TABLE ... EMPTY AS SELECT` 推断表结构：

```sql
CREATE TABLE users
ENGINE = MergeTree ORDER BY username
EMPTY AS
SELECT * FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
```

当数据以包含数据类型信息的格式（如Parquet）时，这尤其有效。

#### 将S3文件加载到ClickHouse {#load-s3-files-into-clickhouse}

使用 `INSERT INTO ... SELECT` 语句将S3文件加载到ClickHouse：

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
本示例使用CSV作为透视格式。然而，对于生产工作负载，我们建议使用Apache Parquet作为大型迁移的最佳选择，因为它包含压缩，能够节省存储成本并缩短传输时间。（默认情况下，每个行组使用SNAPPY进行压缩）。ClickHouse还利用Parquet的列式存储加速数据摄取。
:::

</VerticalStepper>

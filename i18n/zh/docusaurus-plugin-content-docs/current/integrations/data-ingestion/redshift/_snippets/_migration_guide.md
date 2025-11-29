import redshiftToClickhouse from '@site/static/images/integrations/data-ingestion/redshift/redshift-to-clickhouse.png';
import push from '@site/static/images/integrations/data-ingestion/redshift/push.png';
import pull from '@site/static/images/integrations/data-ingestion/redshift/pull.png';
import pivot from '@site/static/images/integrations/data-ingestion/redshift/pivot.png';
import s3_1 from '@site/static/images/integrations/data-ingestion/redshift/s3-1.png';
import s3_2 from '@site/static/images/integrations/data-ingestion/redshift/s3-2.png';
import Image from '@theme/IdealImage';



## 介绍 {#introduction}

[Amazon Redshift](https://aws.amazon.com/redshift/) 是 Amazon Web Services 提供的一项流行云数据仓库服务。本指南介绍了将数据从 Redshift 实例迁移到 ClickHouse 的不同方案。我们将介绍三种选项：

<Image img={redshiftToClickhouse} size="md" alt="Redshift 到 ClickHouse 的迁移选项" background="white"/>

从 ClickHouse 实例的角度来看，您可以：

1. 使用第三方 ETL/ELT 工具或服务将数据**[推送](#push-data-from-redshift-to-clickhouse)**到 ClickHouse

2. 利用 ClickHouse JDBC Bridge 从 Redshift **[拉取](#pull-data-from-redshift-to-clickhouse)** 数据

3. 通过 S3 对象存储，采用“先导出再导入”的方式进行 **[中转](#pivot-data-from-redshift-to-clickhouse-using-s3)**

:::note
我们在本教程中使用 Redshift 作为数据源。不过，这里介绍的迁移方法并不局限于 Redshift，对任何兼容的数据源都可以采用类似步骤。
:::



## 从 Redshift 推送数据到 ClickHouse {#push-data-from-redshift-to-clickhouse}

在推送场景下，思路是利用第三方工具或服务（自定义代码或 [ETL/ELT](https://en.wikipedia.org/wiki/Extract,_transform,_load#ETL_vs._ELT)）将数据发送到你的 ClickHouse 实例。例如，你可以使用 [Airbyte](https://www.airbyte.com/) 这类软件，将数据从 Redshift 实例（作为源端）迁移到 ClickHouse（作为目标端）（[参见我们的 Airbyte 集成指南](/integrations/data-ingestion/etl-tools/airbyte-and-clickhouse.md)）。

<Image img={push} size="md" alt="将数据从 Redshift 推送到 ClickHouse" background="white"/>

### 优点 {#pros}

* 可以利用 ETL/ELT 软件现有的连接器生态。
* 具备内置的数据同步能力（追加 / 覆盖 / 增量逻辑）。
* 支持数据转换场景（例如，参见我们的 [dbt 集成指南](/integrations/data-ingestion/etl-tools/dbt/index.md)）。

### 缺点 {#cons}

* 需要用户自行部署并维护 ETL/ELT 基础设施。
* 在架构中引入第三方组件，可能成为潜在的扩展性瓶颈。



## 从 Redshift 拉取数据到 ClickHouse {#pull-data-from-redshift-to-clickhouse}

在拉取场景中,其思路是利用 ClickHouse JDBC Bridge 从 ClickHouse 实例直接连接到 Redshift 集群并执行 `INSERT INTO ... SELECT` 查询:

<Image
  img={pull}
  size='md'
  alt='从 Redshift 拉取到 ClickHouse'
  background='white'
/>

### 优点 {#pros-1}

- 通用于所有兼容 JDBC 的工具
- 优雅的解决方案,允许从 ClickHouse 内部查询多个外部数据源

### 缺点 {#cons-1}

- 需要 ClickHouse JDBC Bridge 实例,可能成为潜在的可扩展性瓶颈

:::note
尽管 Redshift 基于 PostgreSQL,但无法使用 ClickHouse PostgreSQL 表函数或表引擎,因为 ClickHouse 需要 PostgreSQL 9 或更高版本,而 Redshift API 基于早期版本(8.x)。
:::

### 教程 {#tutorial}

要使用此选项,您需要设置 ClickHouse JDBC Bridge。ClickHouse JDBC Bridge 是一个独立的 Java 应用程序,用于处理 JDBC 连接并充当 ClickHouse 实例与数据源之间的代理。在本教程中,我们使用了预填充的 Redshift 实例和[示例数据库](https://docs.aws.amazon.com/redshift/latest/dg/c_sampledb.html)。

<VerticalStepper headerLevel="h4">

#### 部署 ClickHouse JDBC Bridge {#deploy-clickhouse-jdbc-bridge}

部署 ClickHouse JDBC Bridge。有关更多详细信息,请参阅我们关于 [JDBC 外部数据源](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md) 的用户指南

:::note
如果您使用 ClickHouse Cloud,则需要在单独的环境中运行 ClickHouse JDBC Bridge,并使用 [remoteSecure](/sql-reference/table-functions/remote/) 函数连接到 ClickHouse Cloud
:::

#### 配置您的 Redshift 数据源 {#configure-your-redshift-datasource}

为 ClickHouse JDBC Bridge 配置您的 Redshift 数据源。例如,`/etc/clickhouse-jdbc-bridge/config/datasources/redshift.json`

```json
{
  "redshift-server": {
    "aliases": ["redshift"],
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

#### 从 ClickHouse 查询您的 Redshift 实例 {#query-your-redshift-instance-from-clickhouse}

ClickHouse JDBC Bridge 部署并运行后,您就可以开始从 ClickHouse 查询您的 Redshift 实例

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

#### 从 Redshift 导入数据到 ClickHouse {#import-data-from-redshift-to-clickhouse}

下面展示如何使用 `INSERT INTO ... SELECT` 语句导入数据


```sql
# 创建包含 3 列的表 {#table-creation-with-3-columns}
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


## 使用 S3 将数据从 Redshift 迁移到 ClickHouse {#pivot-data-from-redshift-to-clickhouse-using-s3}

在此场景中，我们先将数据以中间转换格式（pivot 格式）导出到 S3，然后在第二步中从 S3 将数据加载到 ClickHouse 中。

<Image img={pivot} size="md" alt="通过 S3 从 Redshift 进行 PIVOT" background="white"/>

### 优点 {#pros-2}

* Redshift 和 ClickHouse 都具有强大的 S3 集成功能。
* 利用现有能力，例如 Redshift 的 `UNLOAD` 命令以及 ClickHouse 的 S3 表函数 / 表引擎。
* 得益于 ClickHouse 中对 S3 的并行读取和高吞吐能力，可实现无缝扩展。
* 可以利用 Apache Parquet 等高级且支持压缩的格式。

### 缺点 {#cons-2}

* 流程分为两个步骤（先从 Redshift 卸载，然后加载到 ClickHouse）。

### 教程 {#tutorial-1}

<VerticalStepper headerLevel="h4">

#### 使用 UNLOAD 将数据导出到 S3 存储桶 {#export-data-into-an-s3-bucket-using-unload}

使用 Redshift 的 [UNLOAD](https://docs.aws.amazon.com/redshift/latest/dg/r_UNLOAD.html) 功能，将数据导出到现有的私有 S3 存储桶：

<Image img={s3_1} size="md" alt="从 Redshift UNLOAD 到 S3" background="white"/>

它会在 S3 中生成包含原始数据的分片文件。

<Image img={s3_2} size="md" alt="S3 中的数据" background="white"/>

#### 在 ClickHouse 中创建表 {#create-the-table-in-clickhouse}

在 ClickHouse 中创建表：

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

或者，ClickHouse 可以尝试使用 `CREATE TABLE ... EMPTY AS SELECT` 推断表结构：

```sql
CREATE TABLE users
ENGINE = MergeTree ORDER BY username
EMPTY AS
SELECT * FROM s3('https://your-bucket.s3.amazonaws.com/unload/users/*', '<aws_access_key>', '<aws_secret_access_key>', 'CSV')
```

当数据采用包含数据类型信息的格式（如 Parquet）时，此方法效果尤其好。

#### 将 S3 文件加载到 ClickHouse {#load-s3-files-into-clickhouse}

使用 `INSERT INTO ... SELECT` 语句将 S3 文件加载到 ClickHouse 中：

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
此示例使用 CSV 作为中间转换格式。不过，对于生产环境工作负载，我们推荐在大型迁移中使用 Apache Parquet 作为首选方案，因为它支持压缩，可以节省部分存储成本，同时缩短传输时间。（默认情况下，每个行组使用 SNAPPY 压缩）。ClickHouse 还利用 Parquet 的列式存储特性来加速数据摄取。
:::

</VerticalStepper>
---
'sidebar_label': 'Spark 기본 커넥터'
'sidebar_position': 2
'slug': '/integrations/apache-spark/spark-native-connector'
'description': 'Apache Spark와 ClickHouse에 대한 소개'
'keywords':
- 'clickhouse'
- 'Apache Spark'
- 'migrating'
- 'data'
'title': 'Spark 커넥터'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';


# Spark 커넥터

이 커넥터는 고급 파티셔닝 및 쿼리 푸시 다운과 같은 ClickHouse 특정 최적화를 활용하여 쿼리 성능과 데이터 처리 능력을 향상시킵니다.  
이 커넥터는 [ClickHouse의 공식 JDBC 커넥터](https://github.com/ClickHouse/clickhouse-java)를 기반으로 하며, 자체 카탈로그를 관리합니다.

Spark 3.0 이전에는 Spark에 내장된 카탈로그 개념이 없었기 때문에 사용자는 일반적으로 Hive Metastore나 AWS Glue와 같은 외부 카탈로그 시스템에 의존했습니다.  
이러한 외부 솔루션을 사용하면 사용자들은 Spark에서 데이터 소스 테이블에 접근하기 전에 수동으로 테이블을 등록해야 했습니다.  
그러나 Spark 3.0에서 카탈로그 개념이 도입되면서 Spark는 이제 카탈로그 플러그인을 등록하여 테이블을 자동으로 발견할 수 있습니다.

Spark의 기본 카탈로그는 `spark_catalog`이며, 테이블은 `{catalog name}.{database}.{table}` 형식으로 식별됩니다. 새로운 카탈로그 기능을 사용하면 이제 단일 Spark 애플리케이션에서 여러 카탈로그를 추가하고 작업할 수 있습니다.

<TOCInline toc={toc}></TOCInline>
## 요구 사항 {#requirements}

- Java 8 또는 17
- Scala 2.12 또는 2.13
- Apache Spark 3.3 또는 3.4 또는 3.5
## 호환성 매트릭스 {#compatibility-matrix}

| 버전 | 호환 가능한 Spark 버전 | ClickHouse JDBC 버전 |
|---------|---------------------------|-------------------------|
| main    | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.8.1   | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.8.0   | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.7.3   | Spark 3.3, 3.4            | 0.4.6                   |
| 0.6.0   | Spark 3.3                 | 0.3.2-patch11           |
| 0.5.0   | Spark 3.2, 3.3            | 0.3.2-patch11           |
| 0.4.0   | Spark 3.2, 3.3            | 의존하지 않음           |
| 0.3.0   | Spark 3.2, 3.3            | 의존하지 않음           |
| 0.2.1   | Spark 3.2                 | 의존하지 않음           |
| 0.1.2   | Spark 3.2                 | 의존하지 않음           |
## 설치 및 설정 {#installation--setup}

ClickHouse와 Spark를 통합하기 위해 다양한 프로젝트 설정에 맞는 여러 설치 옵션이 있습니다.  
ClickHouse Spark 커넥터를 프로젝트의 빌드 파일(예: Maven의 `pom.xml` 또는 SBT의 `build.sbt`)에 직접 종속성으로 추가할 수 있습니다.  
또는 필요한 JAR 파일을 `$SPARK_HOME/jars/` 폴더에 넣거나, `spark-submit` 명령의 `--jars` 플래그를 사용하여 직접 전달할 수 있습니다.  
두 가지 접근 방식 모두 Spark 환경에서 ClickHouse 커넥터를 사용할 수 있게 합니다.
### 종속성으로 가져오기 {#import-as-a-dependency}

<Tabs>
<TabItem value="Maven" label="Maven" default>

```maven
<dependency>
  <groupId>com.clickhouse.spark</groupId>
  <artifactId>clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}</artifactId>
  <version>{{ stable_version }}</version>
</dependency>
<dependency>
  <groupId>com.clickhouse</groupId>
  <artifactId>clickhouse-jdbc</artifactId>
  <classifier>all</classifier>
  <version>{{ clickhouse_jdbc_version }}</version>
  <exclusions>
    <exclusion>
      <groupId>*</groupId>
      <artifactId>*</artifactId>
    </exclusion>
  </exclusions>
</dependency>
```

SNAPSHOT 버전을 사용하려면 다음 리포지토리를 추가하십시오.

```maven
<repositories>
  <repository>
    <id>sonatype-oss-snapshots</id>
    <name>Sonatype OSS Snapshots Repository</name>
    <url>https://s01.oss.sonatype.org/content/repositories/snapshots</url>
  </repository>
</repositories>
```

</TabItem>
<TabItem value="Gradle" label="Gradle">

```gradle
dependencies {
  implementation("com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}")
  implementation("com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}:all") { transitive = false }
}
```

SNAPSHOT 버전을 사용하려면 다음 리포지토리를 추가하십시오:

```gradle
repositries {
  maven { url = "https://s01.oss.sonatype.org/content/repositories/snapshots" }
}
```

</TabItem>
<TabItem value="SBT" label="SBT">

```sbt
libraryDependencies += "com.clickhouse" % "clickhouse-jdbc" % {{ clickhouse_jdbc_version }} classifier "all"
libraryDependencies += "com.clickhouse.spark" %% clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }} % {{ stable_version }}
```

</TabItem>
<TabItem value="Spark SQL/Shell CLI" label="Spark SQL/Shell CLI">

Spark의 셸 옵션(Spark SQL CLI, Spark Shell CLI 및 Spark Submit 명령)을 사용할 때, 필요한 JAR를 전달하여 종속성을 등록할 수 있습니다:

```text
$SPARK_HOME/bin/spark-sql \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

JAR 파일을 Spark 클라이언트 노드에 복사하는 것을 피하고 싶다면, 대신 다음을 사용할 수 있습니다:

```text
--repositories https://{maven-central-mirror or private-nexus-repo} \
--packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}
```

참고: SQL 전용 사용 사례에는 [Apache Kyuubi](https://github.com/apache/kyuubi)가 프로덕션에 권장됩니다.

</TabItem>
</Tabs>
### 라이브러리 다운로드 {#download-the-library}

이진 JAR의 이름 패턴은 다음과 같습니다:

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

공식 [Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/spark/)에서 모든 출시된 JAR 파일을 찾을 수 있으며,  
[Sonatype OSS Snapshots Repository](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/)에서 모든 일일 빌드 SNAPSHOT JAR 파일을 찾을 수 있습니다.

:::important
"all" 분류자가 포함된 [clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)를 포함하는 것이 필수적입니다.  
커넥터는 [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client) 및 [clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)에 의존하며, 이 두 개는 clickhouse-jdbc:all에 번들로 포함되어 있습니다.  
전체 JDBC 패키지를 사용하고 싶지 않은 경우 [clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client) 및 [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)를 개별적으로 추가할 수 있습니다.

어쨌든, 패키지 버전이 [호환성 매트릭스](#compatibility-matrix)에 따라 호환되는지 확인하십시오.
:::
## 카탈로그 등록(필수) {#register-the-catalog-required}

ClickHouse 테이블에 접근하기 위해서는, 다음 설정으로 새로운 Spark 카탈로그를 구성해야 합니다:

| 속성                                      | 값                                          | 기본 값        | 필수  |
|------------------------------------------|--------------------------------------------|----------------|-------|
| `spark.sql.catalog.<catalog_name>`       | `com.clickhouse.spark.ClickHouseCatalog`   | N/A            | 예    |
| `spark.sql.catalog.<catalog_name>.host`  | `<clickhouse_host>`                        | `localhost`    | 아니오 |
| `spark.sql.catalog.<catalog_name>.protocol` | `http`                                     | `http`         | 아니오 |
| `spark.sql.catalog.<catalog_name>.http_port` | `<clickhouse_port>`                        | `8123`         | 아니오 |
| `spark.sql.catalog.<catalog_name>.user`  | `<clickhouse_username>`                    | `default`      | 아니오 |
| `spark.sql.catalog.<catalog_name>.password` | `<clickhouse_password>`                    | (빈 문자열)    | 아니오 |
| `spark.sql.catalog.<catalog_name>.database` | `<database>`                               | `default`      | 아니오 |
| `spark.<catalog_name>.write.format`      | `json`                                     | `arrow`        | 아니오 |

이 설정은 다음 중 하나를 통해 설정할 수 있습니다:

* `spark-defaults.conf` 편집/생성.
* `spark-submit` 명령(또는 `spark-shell`/`spark-sql` CLI 명령)에 구성을 전달하십시오.
* 컨텍스트를 초기화할 때 구성을 추가하십시오.

:::important
ClickHouse 클러스터에서 작업할 때는 각 인스턴스에 대해 고유한 카탈로그 이름을 설정해야 합니다.  
예를 들어:

```text
spark.sql.catalog.clickhouse1                com.clickhouse.spark.ClickHouseCatalog
spark.sql.catalog.clickhouse1.host           10.0.0.1
spark.sql.catalog.clickhouse1.protocol       https
spark.sql.catalog.clickhouse1.http_port      8443
spark.sql.catalog.clickhouse1.user           default
spark.sql.catalog.clickhouse1.password
spark.sql.catalog.clickhouse1.database       default
spark.sql.catalog.clickhouse1.option.ssl     true

spark.sql.catalog.clickhouse2                com.clickhouse.spark.ClickHouseCatalog
spark.sql.catalog.clickhouse2.host           10.0.0.2
spark.sql.catalog.clickhouse2.protocol       https
spark.sql.catalog.clickhouse2.http_port      8443
spark.sql.catalog.clickhouse2.user           default
spark.sql.catalog.clickhouse2.password
spark.sql.catalog.clickhouse2.database       default
spark.sql.catalog.clickhouse2.option.ssl     true
```

이렇게 하면 `clickhouse1.<ck_db>.<ck_table>`로 Spark SQL에서 clickhouse1 테이블 `<ck_db>.<ck_table>`에 접근할 수 있으며,  
`clickhouse2.<ck_db>.<ck_table>`로 clickhouse2 테이블 `<ck_db>.<ck_table>`에 접근할 수 있습니다.

:::
## ClickHouse Cloud 설정 {#clickhouse-cloud-settings}

[ClickHouse Cloud](https://clickhouse.com)에 연결할 때는 SSL을 활성화하고 적절한 SSL 모드를 설정해야 합니다. 예를 들어:

```text
spark.sql.catalog.clickhouse.option.ssl        true
spark.sql.catalog.clickhouse.option.ssl_mode   NONE
```
## 데이터 읽기 {#read-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
public static void main(String[] args) {
        // Create a Spark session
        SparkSession spark = SparkSession.builder()
                .appName("example")
                .master("local[*]")
                .config("spark.sql.catalog.clickhouse", "com.clickhouse.spark.ClickHouseCatalog")
                .config("spark.sql.catalog.clickhouse.host", "127.0.0.1")
                .config("spark.sql.catalog.clickhouse.protocol", "http")
                .config("spark.sql.catalog.clickhouse.http_port", "8123")
                .config("spark.sql.catalog.clickhouse.user", "default")
                .config("spark.sql.catalog.clickhouse.password", "123456")
                .config("spark.sql.catalog.clickhouse.database", "default")
                .config("spark.clickhouse.write.format", "json")
                .getOrCreate();

        Dataset<Row> df = spark.sql("select * from clickhouse.default.example_table");

        df.show();

        spark.stop();
    }
```

</TabItem>
<TabItem value="Scala" label="Scala">

```java
object NativeSparkRead extends App {
  val spark = SparkSession.builder
    .appName("example")
    .master("local[*]")
    .config("spark.sql.catalog.clickhouse", "com.clickhouse.spark.ClickHouseCatalog")
    .config("spark.sql.catalog.clickhouse.host", "127.0.0.1")
    .config("spark.sql.catalog.clickhouse.protocol", "http")
    .config("spark.sql.catalog.clickhouse.http_port", "8123")
    .config("spark.sql.catalog.clickhouse.user", "default")
    .config("spark.sql.catalog.clickhouse.password", "123456")
    .config("spark.sql.catalog.clickhouse.database", "default")
    .config("spark.clickhouse.write.format", "json")
    .getOrCreate

  val df = spark.sql("select * from clickhouse.default.example_table")

  df.show()

  spark.stop()
}
```

</TabItem>
<TabItem value="Python" label="Python">

```python
from pyspark.sql import SparkSession

packages = [
    "com.clickhouse.spark:clickhouse-spark-runtime-3.4_2.12:0.8.0",
    "com.clickhouse:clickhouse-client:0.7.0",
    "com.clickhouse:clickhouse-http-client:0.7.0",
    "org.apache.httpcomponents.client5:httpclient5:5.2.1"

]

spark = (SparkSession.builder
         .config("spark.jars.packages", ",".join(packages))
         .getOrCreate())

spark.conf.set("spark.sql.catalog.clickhouse", "com.clickhouse.spark.ClickHouseCatalog")
spark.conf.set("spark.sql.catalog.clickhouse.host", "127.0.0.1")
spark.conf.set("spark.sql.catalog.clickhouse.protocol", "http")
spark.conf.set("spark.sql.catalog.clickhouse.http_port", "8123")
spark.conf.set("spark.sql.catalog.clickhouse.user", "default")
spark.conf.set("spark.sql.catalog.clickhouse.password", "123456")
spark.conf.set("spark.sql.catalog.clickhouse.database", "default")
spark.conf.set("spark.clickhouse.write.format", "json")

df = spark.sql("select * from clickhouse.default.example_table")
df.show()

```

</TabItem>
<TabItem value="SparkSQL" label="Spark SQL">

```sql
CREATE TEMPORARY VIEW jdbcTable
        USING org.apache.spark.sql.jdbc
        OPTIONS (
                url "jdbc:ch://localhost:8123/default", 
                dbtable "schema.tablename",
                user "username",
                password "password",
                driver "com.clickhouse.jdbc.ClickHouseDriver" 
        );

SELECT * FROM jdbcTable;
```

</TabItem>
</Tabs>
## 데이터 쓰기 {#write-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
public static void main(String[] args) throws AnalysisException {

       // Create a Spark session
       SparkSession spark = SparkSession.builder()
               .appName("example")
               .master("local[*]")
               .config("spark.sql.catalog.clickhouse", "com.clickhouse.spark.ClickHouseCatalog")
               .config("spark.sql.catalog.clickhouse.host", "127.0.0.1")
               .config("spark.sql.catalog.clickhouse.protocol", "http")
               .config("spark.sql.catalog.clickhouse.http_port", "8123")
               .config("spark.sql.catalog.clickhouse.user", "default")
               .config("spark.sql.catalog.clickhouse.password", "123456")
               .config("spark.sql.catalog.clickhouse.database", "default")
               .config("spark.clickhouse.write.format", "json")
               .getOrCreate();

       // Define the schema for the DataFrame
       StructType schema = new StructType(new StructField[]{
               DataTypes.createStructField("id", DataTypes.IntegerType, false),
               DataTypes.createStructField("name", DataTypes.StringType, false),
       });

       List<Row> data = Arrays.asList(
               RowFactory.create(1, "Alice"),
               RowFactory.create(2, "Bob")
       );

       // Create a DataFrame
       Dataset<Row> df = spark.createDataFrame(data, schema);

       df.writeTo("clickhouse.default.example_table").append();

       spark.stop();
   }
```

</TabItem>
<TabItem value="Scala" label="Scala">

```java
object NativeSparkWrite extends App {
  // Create a Spark session
  val spark: SparkSession = SparkSession.builder
    .appName("example")
    .master("local[*]")
    .config("spark.sql.catalog.clickhouse", "com.clickhouse.spark.ClickHouseCatalog")
    .config("spark.sql.catalog.clickhouse.host", "127.0.0.1")
    .config("spark.sql.catalog.clickhouse.protocol", "http")
    .config("spark.sql.catalog.clickhouse.http_port", "8123")
    .config("spark.sql.catalog.clickhouse.user", "default")
    .config("spark.sql.catalog.clickhouse.password", "123456")
    .config("spark.sql.catalog.clickhouse.database", "default")
    .config("spark.clickhouse.write.format", "json")
    .getOrCreate

  // Define the schema for the DataFrame
  val rows = Seq(Row(1, "John"), Row(2, "Doe"))

  val schema = List(
    StructField("id", DataTypes.IntegerType, nullable = false),
    StructField("name", StringType, nullable = true)
  )
  // Create the df
  val df: DataFrame = spark.createDataFrame(
    spark.sparkContext.parallelize(rows),
    StructType(schema)
  )

  df.writeTo("clickhouse.default.example_table").append()

  spark.stop()
}
```

</TabItem>
<TabItem value="Python" label="Python">

```python
from pyspark.sql import SparkSession
from pyspark.sql import Row


# Feel free to use any other packages combination satesfying the compatibility matrix provided above.
packages = [
    "com.clickhouse.spark:clickhouse-spark-runtime-3.4_2.12:0.8.0",
    "com.clickhouse:clickhouse-client:0.7.0",
    "com.clickhouse:clickhouse-http-client:0.7.0",
    "org.apache.httpcomponents.client5:httpclient5:5.2.1"

]

spark = (SparkSession.builder
         .config("spark.jars.packages", ",".join(packages))
         .getOrCreate())

spark.conf.set("spark.sql.catalog.clickhouse", "com.clickhouse.spark.ClickHouseCatalog")
spark.conf.set("spark.sql.catalog.clickhouse.host", "127.0.0.1")
spark.conf.set("spark.sql.catalog.clickhouse.protocol", "http")
spark.conf.set("spark.sql.catalog.clickhouse.http_port", "8123")
spark.conf.set("spark.sql.catalog.clickhouse.user", "default")
spark.conf.set("spark.sql.catalog.clickhouse.password", "123456")
spark.conf.set("spark.sql.catalog.clickhouse.database", "default")
spark.conf.set("spark.clickhouse.write.format", "json")


# Create DataFrame
data = [Row(id=11, name="John"), Row(id=12, name="Doe")]
df = spark.createDataFrame(data)


# Write DataFrame to ClickHouse
df.writeTo("clickhouse.default.example_table").append()

```

</TabItem>
<TabItem value="SparkSQL" label="Spark SQL">

```sql
 -- resultTable is the Spark intermediate df we want to insert into clickhouse.default.example_table
INSERT INTO TABLE clickhouse.default.example_table
             SELECT * FROM resultTable;

```

</TabItem>
</Tabs>
## DDL 작업 {#ddl-operations}

Spark SQL을 사용하여 ClickHouse 인스턴스에서 DDL 작업을 수행할 수 있으며, 모든 변경 사항은 ClickHouse에 즉시 영구 저장됩니다.  
Spark SQL을 사용하면 ClickHouse에서와 동일하게 쿼리를 작성할 수 있으므로 CREATE TABLE, TRUNCATE와 같은 명령을 수정 없이 즉시 실행할 수 있습니다. 예를 들어:

:::note
Spark SQL을 사용할 때는 한 번에 하나의 명령만 실행할 수 있습니다.
:::

```sql
USE clickhouse; 
```

```sql

CREATE TABLE test_db.tbl_sql (
  create_time TIMESTAMP NOT NULL,
  m           INT       NOT NULL COMMENT 'part key',
  id          BIGINT    NOT NULL COMMENT 'sort key',
  value       STRING
) USING ClickHouse
PARTITIONED BY (m)
TBLPROPERTIES (
  engine = 'MergeTree()',
  order_by = 'id',
  settings.index_granularity = 8192
);
```

위의 예제는 Spark SQL 쿼리를 보여주며, 이는 Java, Scala, PySpark 또는 셸의 모든 API 내에서 실행할 수 있습니다.
## 구성 {#configurations}

커넥터에서 조정 가능한 구성은 다음과 같습니다:

<br/>

| 키                                              | 기본값                                                | 설명                                                                                                                                                                                                                                                                                                                                                                                          | 버전   |
|--------------------------------------------------|--------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|
| spark.clickhouse.ignoreUnsupportedTransform      | false                                                  | ClickHouse는 `cityHash64(col_1, col_2)`와 같은 복잡한 표현식을 샤딩 키 또는 파티션 값으로 사용하는 것을 지원하지만, 현재 Spark에서는 지원되지 않습니다. `true`로 설정하면 지원되지 않는 표현식은 무시하고, 그렇지 않으면 예외로 실패합니다. 또한, `spark.clickhouse.write.distributed.convertLocal`이 활성화된 경우 지원되지 않는 샤딩 키를 무시하면 데이터가 손상될 수 있습니다. | 0.4.0 |
| spark.clickhouse.read.compression.codec          | lz4                                                    | 읽기 위해 데이터를 압축 해제하는 데 사용되는 코드입니다. 지원되는 코덱: none, lz4.                                                                                                                                                                                                                                                                                                     | 0.5.0 |
| spark.clickhouse.read.distributed.convertLocal   | true                                                   | 분산 테이블을 읽을 때 해당 테이블 대신 로컬 테이블을 읽습니다. `true`로 설정하면 `spark.clickhouse.read.distributed.useClusterNodes`를 무시합니다.                                                                                                                                                                                                                            | 0.1.0 |
| spark.clickhouse.read.fixedStringAs              | binary                                                 | ClickHouse FixedString 유형을 지정된 Spark 데이터 유형으로 읽습니다. 지원되는 유형: binary, string                                                                                                                                                                                                                                                                                       | 0.8.0 |
| spark.clickhouse.read.format                       | json                                                   | 읽기 위한 직렬화 형식입니다. 지원되는 형식: json, binary                                                                                                                                                                                                                                                                                                                                 | 0.6.0 |
| spark.clickhouse.read.runtimeFilter.enabled      | false                                                  | 읽기를 위한 런타임 필터를 활성화합니다.                                                                                                                                                                                                                                                                                                                                                     | 0.8.0 |
| spark.clickhouse.read.splitByPartitionId         | true                                                   | `true`일 경우 가상 컬럼 `_partition_id`를 사용하여 입력 파티션 필터를 구성합니다. 파티션 값을 사용하여 SQL 프레디케이트를 조립하는 데는 알려진 문제가 있습니다. 이 기능은 ClickHouse Server v21.6+가 필요합니다.                                                                                                                                                  | 0.4.0 |
| spark.clickhouse.useNullableQuerySchema          | false                                                  | `true`로 설정하면 `CREATE/REPLACE TABLE ... AS SELECT ...`를 실행할 때 쿼리 스키마의 모든 필드를 nullable로 표시합니다. 이 구성은 SPARK-43390 필요하며, Spark 3.5에 사용 가능합니다. 이 패치 없이 항상 `true`로 작동합니다.                                                                                                                                              | 0.8.0 |
| spark.clickhouse.write.batchSize                 | 10000                                                  | ClickHouse에 쓰기 위한 각 배치당 레코드 수입니다.                                                                                                                                                                                                                                                                                                                                         | 0.1.0 |
| spark.clickhouse.write.compression.codec         | lz4                                                    | 데이터를 쓰기 위해 압축하는 데 사용되는 코드입니다. 지원되는 코덱: none, lz4.                                                                                                                                                                                                                                                                                                           | 0.3.0 |
| spark.clickhouse.write.distributed.convertLocal  | false                                                  | 분산 테이블을 쓸 때 자신 대신 로컬 테이블을 씁니다. `true`로 설정하면 `spark.clickhouse.write.distributed.useClusterNodes`를 무시합니다.                                                                                                                                                                                                            | 0.1.0 |
| spark.clickhouse.write.distributed.useClusterNodes | true                                                   | 분산 테이블을 쓸 때 클러스터의 모든 노드에 씁니다.                                                                                                                                                                                                                                                                                                                                       | 0.1.0 |
| spark.clickhouse.write.format                      | arrow                                                  | 쓰기 위한 직렬화 형식입니다. 지원되는 형식: json, arrow                                                                                                                                                                                                                                                                                                                                    | 0.4.0 |
| spark.clickhouse.write.localSortByKey            | true                                                   | `true`일 경우 쓰기 전에 정렬 키에 따라 로컬 정렬을 수행합니다.                                                                                                                                                                                                                                                                                                                             | 0.3.0 |
| spark.clickhouse.write.localSortByPartition      | spark.clickhouse.write.repartitionByPartition의 값 | `true`일 경우 쓰기 전에 파티션에 따라 로컬 정렬을 수행합니다. 설정되지 않으면 `spark.clickhouse.write.repartitionByPartition` 값과 동일하게 됩니다.                                                                                                                                                                                        | 0.3.0 |
| spark.clickhouse.write.maxRetry                  | 3                                                      | 재시도 가능한 코드로 실패한 단일 배치 쓰기를 위해 재시도할 최대 횟수입니다.                                                                                                                                                                                                                                                                                                               | 0.1.0 |
| spark.clickhouse.write.repartitionByPartition     | true                                                   | ClickHouse 테이블의 분포를 충족하기 위해 ClickHouse 파티션 키에 따라 데이터를 재파티셔닝할지를 나타냅니다.                                                                                                                                                                                                                                                                               | 0.3.0 |
| spark.clickhouse.write.repartitionNum             | 0                                                      | 쓰기 전에 ClickHouse 테이블의 분포를 충족하기 위해 필요로 하는 재파티셔닝 데이터를 계산합니다. 이 구성으로 재파티션 수를 지정하며, 1보다 작은 값은 필요 없음을 의미합니다.                                                                                                                                                                                | 0.1.0 |
| spark.clickhouse.write.repartitionStrictly        | false                                                  | `true`일 경우 Spark는 들어오는 레코드를 각 파티션에 엄격하게 분배하여 쓰기 전에 요구 분포를 충족하게 합니다. 그렇지 않으면 Spark는 쿼리 속도를 높이기 위한 특정 최적화를 적용할 수 있는데, 이로 인해 분포 요구가 깨어질 수 있습니다. 이 구성은 SPARK-37523(사용 가능함)를 필요로 하며, 이 패치 없이 항상 `true`로 작동합니다.                                                              | 0.3.0 |
| spark.clickhouse.write.retryInterval              | 10s                                                    | 쓰기 재시도 간의 초 단위 간격입니다.                                                                                                                                                                                                                                                                                                                                                           | 0.1.0 |
| spark.clickhouse.write.retryableErrorCodes       | 241                                                    | 쓰기가 실패했을 때 ClickHouse 서버가 반환하는 재시도 가능한 오류 코드입니다.                                                                                                                                                                                                                                                                                                               | 0.1.0 |
## 지원되는 데이터 유형 {#supported-data-types}

이 섹션은 Spark와 ClickHouse 간의 데이터 유형 간 매핑을 설명합니다. 아래 표는 ClickHouse에서 Spark로 읽을 때와 Spark에서 ClickHouse로 데이터를 삽입할 때 데이터 유형을 변환하기 위한 빠른 참고를 제공합니다.
### ClickHouse에서 Spark로 데이터 읽기 {#reading-data-from-clickhouse-into-spark}

| ClickHouse 데이터 유형                                          | Spark 데이터 유형               | 지원 여부 | 원시형 | 비고                                                         |
|----------------------------------------------------------------|---------------------------------|-----------|--------|--------------------------------------------------------------|
| `Nothing`                                                       | `NullType`                      | ✅         | 예     |                                                              |
| `Bool`                                                          | `BooleanType`                   | ✅         | 예     |                                                              |
| `UInt8`, `Int16`                                              | `ShortType`                     | ✅         | 예     |                                                              |
| `Int8`                                                          | `ByteType`                      | ✅         | 예     |                                                              |
| `UInt16`,`Int32`                                              | `IntegerType`                   | ✅         | 예     |                                                              |
| `UInt32`,`Int64`, `UInt64`                                    | `LongType`                      | ✅         | 예     |                                                              |
| `Int128`,`UInt128`, `Int256`, `UInt256`                       | `DecimalType(38, 0)`            | ✅         | 예     |                                                              |
| `Float32`                                                       | `FloatType`                     | ✅         | 예     |                                                              |
| `Float64`                                                       | `DoubleType`                    | ✅         | 예     |                                                              |
| `String`, `JSON`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6`  | `StringType`                    | ✅         | 예     |                                                              |
| `FixedString`                                                  | `BinaryType`, `StringType`      | ✅         | 예     | `READ_FIXED_STRING_AS` 구성에 의해 제어됨                   |
| `Decimal`                                                       | `DecimalType`                   | ✅         | 예     | 정확도 및 스케일은 `Decimal128`까지 지원                     |
| `Decimal32`                                                   | `DecimalType(9, scale)`         | ✅         | 예     |                                                              |
| `Decimal64`                                                   | `DecimalType(18, scale)`        | ✅         | 예     |                                                              |
| `Decimal128`                                                  | `DecimalType(38, scale)`        | ✅         | 예     |                                                              |
| `Date`, `Date32`                                              | `DateType`                      | ✅         | 예     |                                                              |
| `DateTime`, `DateTime32`, `DateTime64`                        | `TimestampType`                 | ✅         | 예     |                                                              |
| `Array`                                                         | `ArrayType`                     | ✅         | 아니오 | 배열 요소 유형도 변환됨                                     |
| `Map`                                                           | `MapType`                       | ✅         | 아니오 | 키는 `StringType`로 제한됨                                   |
| `IntervalYear`                                                | `YearMonthIntervalType(Year)`   | ✅         | 예     |                                                              |
| `IntervalMonth`                                               | `YearMonthIntervalType(Month)`  | ✅         | 예     |                                                              |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`           | ✅         | 아니오 | 특정 간격 유형 사용                                          |
| `Object`                                                        |                                 | ❌         |        |                                                              |
| `Nested`                                                        |                                 | ❌         |        |                                                              |
| `Tuple`                                                         |                                 | ❌         |        |                                                              |
| `Point`                                                         |                                 | ❌         |        |                                                              |
| `Polygon`                                                       |                                 | ❌         |        |                                                              |
| `MultiPolygon`                                                  |                                 | ❌         |        |                                                              |
| `Ring`                                                          |                                 | ❌         |        |                                                              |
| `IntervalQuarter`                                             |                                 | ❌         |        |                                                              |
| `IntervalWeek`                                                |                                 | ❌         |        |                                                              |
| `Decimal256`                                                  |                                 | ❌         |        |                                                              |
| `AggregateFunction`                                           |                                 | ❌         |        |                                                              |
| `SimpleAggregateFunction`                                     |                                 | ❌         |        |                                                              |
### Spark에서 ClickHouse로 데이터 삽입 {#inserting-data-from-spark-into-clickhouse}

| Spark 데이터 유형                     | ClickHouse 데이터 유형 | 지원 여부 | 원시형 | 비고                                         |
|--------------------------------------|-----------------------|-----------|--------|----------------------------------------------|
| `BooleanType`                       | `UInt8`               | ✅         | 예     |                                              |
| `ByteType`                          | `Int8`                | ✅         | 예     |                                              |
| `ShortType`                         | `Int16`               | ✅         | 예     |                                              |
| `IntegerType`                       | `Int32`               | ✅         | 예     |                                              |
| `LongType`                          | `Int64`               | ✅         | 예     |                                              |
| `FloatType`                         | `Float32`             | ✅         | 예     |                                              |
| `DoubleType`                        | `Float64`             | ✅         | 예     |                                              |
| `StringType`                        | `String`              | ✅         | 예     |                                              |
| `VarcharType`                       | `String`              | ✅         | 예     |                                              |
| `CharType`                          | `String`              | ✅         | 예     |                                              |
| `DecimalType`                       | `Decimal(p, s)`       | ✅         | 예     | 정확도 및 스케일은 `Decimal128`까지 지원   |
| `DateType`                          | `Date`                | ✅         | 예     |                                              |
| `TimestampType`                     | `DateTime`            | ✅         | 예     |                                              |
| `ArrayType` (list, tuple, or array) | `Array`               | ✅         | 아니오 | 배열 요소 유형도 변환됨                     |
| `MapType`                           | `Map`                 | ✅         | 아니오 | 키는 `StringType`로 제한됨                  |
| `Object`                            |                       | ❌         |        |                                              |
| `Nested`                            |                       | ❌         |        |                                              |
## 기여 및 지원 {#contributing-and-support}

프로젝트에 기여하거나 문제를 보고하고 싶다면 여러분의 의견을 환영합니다! 
우리의 [GitHub 저장소](https://github.com/ClickHouse/spark-clickhouse-connector)를 방문하여 이슈를 열거나 개선 사항을 제안하거나 풀 리퀘스트를 제출하세요. 
기여를 환영합니다! 시작하기 전에 저장소의 기여 지침을 확인해 주시기 바랍니다.
우리의 ClickHouse Spark 커넥터를 개선하는 데 도움을 주셔서 감사합니다!

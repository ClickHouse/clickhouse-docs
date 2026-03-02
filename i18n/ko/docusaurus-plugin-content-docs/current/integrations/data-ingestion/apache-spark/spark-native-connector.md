---
sidebar_label: 'Spark 네이티브 커넥터'
sidebar_position: 2
slug: /integrations/apache-spark/spark-native-connector
description: 'ClickHouse와 함께 사용하는 Apache Spark 소개'
keywords: ['clickhouse', 'Apache Spark', '마이그레이션', '데이터']
title: 'Spark 커넥터'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Spark connector \{#spark-connector\}

<ClickHouseSupportedBadge/>

이 커넥터는 고급 파티셔닝 및 프리디케이트 푸시다운과 같은 ClickHouse 전용 최적화를 활용하여
쿼리 성능과 데이터 처리 효율을 향상합니다.
이 커넥터는 [ClickHouse의 공식 JDBC 커넥터](https://github.com/ClickHouse/clickhouse-java)를 기반으로 하며,
자체 카탈로그를 관리합니다.

Spark 3.0 이전에는 Spark에 내장된 카탈로그 개념이 없었기 때문에 사용자는 일반적으로 Hive Metastore나 AWS Glue와 같은
외부 카탈로그 시스템에 의존했습니다.
이러한 외부 솔루션을 사용할 때 사용자는 Spark에서 데이터 소스 테이블에 접근하기 전에 테이블을 수동으로 등록해야 했습니다.
그러나 Spark 3.0에서 카탈로그 개념이 도입된 이후에는 Spark가 카탈로그 플러그인을 등록하여 테이블을 자동으로
검색할 수 있게 되었습니다.

Spark의 기본 카탈로그는 `spark_catalog`이며, 테이블은 `{catalog name}.{database}.{table}` 형식으로 식별됩니다.
새로운 카탈로그 기능을 통해 이제 단일 Spark 애플리케이션에서 여러 카탈로그를 추가하고 함께 사용할 수 있습니다.

## Catalog API와 TableProvider API 중 선택하기 \{#choosing-between-apis\}

ClickHouse Spark connector는 **Catalog API**와 **TableProvider API**(포맷 기반 접근)를 포함한 두 가지 접근 방식을 지원합니다. 두 방식의 차이를 이해하면 사용 사례에 가장 적합한 접근 방식을 선택하는 데 도움이 됩니다.

### Catalog API vs TableProvider API \{#catalog-vs-tableprovider-comparison\}

| Feature | Catalog API | TableProvider API |
|---------|-------------|-------------------|
| **Configuration** | Spark 설정을 통한 중앙집중식 설정 | 옵션을 통한 작업별 설정 |
| **Table Discovery** | 카탈로그를 통한 테이블 자동 검색 | 테이블을 수동으로 지정 |
| **DDL Operations** | 전체 지원 (CREATE, DROP, ALTER) | 제한적 (자동 테이블 생성만 가능) |
| **Spark SQL Integration** | 기본 통합 (`clickhouse.database.table`) | 포맷을 명시해야 함 |
| **Use Case** | 중앙집중식 설정을 사용하는 장기적이고 안정적인 연결 | 애드혹(ad-hoc), 동적 또는 임시 액세스 |

<TOCInline toc={toc}></TOCInline>

## 요구 사항 \{#requirements\}

- Java 8 또는 17 (Spark 4.0에는 Java 17 이상이 필요합니다)
- Scala 2.12 또는 2.13 (Spark 4.0은 Scala 2.13만 지원합니다)
- Apache Spark 3.3, 3.4, 3.5 또는 4.0

## 호환성 매트릭스 \{#compatibility-matrix\}

| 버전 | 호환되는 Spark 버전 | ClickHouse JDBC 버전 |
|---------|----------------------|-----------------------|
| main    | Spark 3.3, 3.4, 3.5, 4.0  | 0.9.4                   |
| 0.10.0  | Spark 3.3, 3.4, 3.5, 4.0  | 0.9.5                   |
| 0.9.0   | Spark 3.3, 3.4, 3.5, 4.0  | 0.9.4                   |
| 0.8.1   | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.7.3   | Spark 3.3, 3.4            | 0.4.6                   |
| 0.6.0   | Spark 3.3                 | 0.3.2-patch11           |
| 0.5.0   | Spark 3.2, 3.3            | 0.3.2-patch11           |
| 0.4.0   | Spark 3.2, 3.3            | 특정 버전에 의존하지 않음 |
| 0.3.0   | Spark 3.2, 3.3            | 특정 버전에 의존하지 않음 |
| 0.2.1   | Spark 3.2                 | 특정 버전에 의존하지 않음 |
| 0.1.2   | Spark 3.2                 | 특정 버전에 의존하지 않음 |

## Installation & setup \{#installation--setup\}

ClickHouse를 Spark와 통합하기 위해 다양한 프로젝트 구성에 맞는 여러 설치 옵션을 제공합니다.
Maven의 `pom.xml`이나 SBT의 `build.sbt`와 같은 프로젝트 빌드 파일에 ClickHouse Spark 커넥터를 직접 의존성으로 추가할 수 있습니다.
또는 필요한 JAR 파일을 `$SPARK_HOME/jars/` 폴더에 넣거나, `spark-submit` 명령에서 `--jars` 플래그를 사용해 Spark 옵션으로 직접 전달할 수도 있습니다.
두 방식 모두 Spark 환경에서 ClickHouse 커넥터를 사용할 수 있도록 해줍니다.

### 의존성으로 가져오기 \{#import-as-a-dependency\}

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

SNAPSHOT 버전을 사용하려면 다음 저장소를 추가합니다.

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

SNAPSHOT 버전을 사용하려면 다음 저장소를 추가합니다.

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

Spark의 셸 옵션(Spark SQL CLI, Spark Shell CLI, Spark Submit 명령)을 사용할 때는 필요한 JAR 파일을 지정하여
의존성을 등록할 수 있습니다.

```text
$SPARK_HOME/bin/spark-sql \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

Spark 클라이언트 노드로 JAR 파일을 복사하지 않으려면, 대신 다음을 사용할 수 있습니다.

```text
  --repositories https://{maven-central-mirror or private-nexus-repo} \
  --packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}
```

참고: SQL 전용 사용 사례의 프로덕션 환경에서는 [Apache Kyuubi](https://github.com/apache/kyuubi) 사용을 권장합니다.

</TabItem>
</Tabs>

### 라이브러리 다운로드 \{#download-the-library\}

바이너리 JAR 파일 이름 패턴은 다음과 같습니다:

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

모든 사용 가능한 릴리스 JAR 파일은
[Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/spark/)에서 확인할 수 있으며,
모든 데일리 빌드 SNAPSHOT JAR 파일은 [Sonatype OSS Snapshots Repository](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/)에서 확인할 수 있습니다.

:::important
커넥터는 [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)와
[clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)에 의존하며,
이 둘은 모두 clickhouse-jdbc:all에 포함되어 있으므로,
반드시 classifier가 &quot;all&quot;로 지정된
[clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)를 포함해야 합니다.
또는 전체 JDBC 패키지를 사용하지 않으려면,
[clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)와
[clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)를 개별적으로 추가해도 됩니다.

어떤 방식을 사용하든,
[Compatibility Matrix](#compatibility-matrix)에 따라 패키지 버전이 호환되는지 반드시 확인하십시오.
:::


## 카탈로그 등록(필수) \{#register-the-catalog-required\}

ClickHouse 테이블에 접근하려면 다음 설정으로 새로운 Spark 카탈로그를 구성해야 합니다:

| 속성                                           | 값                                        | 기본값         | 필수  |
| -------------------------------------------- | ---------------------------------------- | ----------- | --- |
| `spark.sql.catalog.<catalog_name>`           | `com.clickhouse.spark.ClickHouseCatalog` | N/A         | 예   |
| `spark.sql.catalog.<catalog_name>.host`      | `<clickhouse_host>`                      | `localhost` | 아니오 |
| `spark.sql.catalog.<catalog_name>.protocol`  | `http`                                   | `http`      | 아니오 |
| `spark.sql.catalog.<catalog_name>.http_port` | `<clickhouse_port>`                      | `8123`      | 아니오 |
| `spark.sql.catalog.<catalog_name>.user`      | `<clickhouse_username>`                  | `default`   | 아니오 |
| `spark.sql.catalog.<catalog_name>.password`  | `<clickhouse_password>`                  | (빈 문자열)     | 아니오 |
| `spark.sql.catalog.<catalog_name>.database`  | `<database>`                             | `default`   | 아니오 |
| `spark.<catalog_name>.write.format`          | `json`                                   | `arrow`     | 아니오 |

이 설정은 다음 방법 중 하나로 설정할 수 있습니다:

* `spark-defaults.conf`를 편집하거나 새로 작성합니다.
* `spark-submit` 명령(또는 `spark-shell`/`spark-sql` CLI 명령)에 설정을 전달합니다.
* 컨텍스트를 초기화할 때 설정을 추가합니다.

:::important
ClickHouse 클러스터에서 작업하는 경우 각 인스턴스마다 고유한 카탈로그 이름을 설정해야 합니다.
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

이 방식이면 Spark SQL에서 clickhouse1의 `<ck_db>.<ck_table>` 테이블에는 `clickhouse1.<ck_db>.<ck_table>` 형식으로, clickhouse2의 `<ck_db>.<ck_table>` 테이블에는 `clickhouse2.<ck_db>.<ck_table>` 형식으로 액세스할 수 있습니다.

:::


## TableProvider API 사용 (포맷 기반 액세스) \{#using-the-tableprovider-api\}

카탈로그 기반 방식 외에도 ClickHouse Spark 커넥터는 TableProvider API를 통해 **포맷 기반 접근 패턴**도 지원합니다.

### 포맷 기반 읽기 예시 \{#format-based-read\}

<Tabs groupId="spark_apis">
<TabItem value="Python" label="Python" default>

```python
from pyspark.sql import SparkSession

spark = SparkSession.builder.getOrCreate()

# format API를 사용하여 ClickHouse에서 데이터 읽기
df = spark.read \
    .format("clickhouse") \
    .option("host", "your-clickhouse-host") \
    .option("protocol", "https") \
    .option("http_port", "8443") \
    .option("database", "default") \
    .option("table", "your_table") \
    .option("user", "default") \
    .option("password", "your_password") \
    .option("ssl", "true") \
    .load()

df.show()
```

</TabItem>
<TabItem value="Scala" label="Scala">

```scala
val df = spark.read
  .format("clickhouse")
  .option("host", "your-clickhouse-host")
  .option("protocol", "https")
  .option("http_port", "8443")
  .option("database", "default")
  .option("table", "your_table")
  .option("user", "default")
  .option("password", "your_password")
  .option("ssl", "true")
  .load()

df.show()
```

</TabItem>
<TabItem value="Java" label="Java">

```java
Dataset<Row> df = spark.read()
    .format("clickhouse")
    .option("host", "your-clickhouse-host")
    .option("protocol", "https")
    .option("http_port", "8443")
    .option("database", "default")
    .option("table", "your_table")
    .option("user", "default")
    .option("password", "your_password")
    .option("ssl", "true")
    .load();

df.show();
```

</TabItem>
</Tabs>

### 포맷 기반 쓰기 예제 \{#format-based-write\}

<Tabs groupId="spark_apis">
<TabItem value="Python" label="Python" default>

```python
# format API를 사용해 ClickHouse에 기록합니다
df.write \
    .format("clickhouse") \
    .option("host", "your-clickhouse-host") \
    .option("protocol", "https") \
    .option("http_port", "8443") \
    .option("database", "default") \
    .option("table", "your_table") \
    .option("user", "default") \
    .option("password", "your_password") \
    .option("ssl", "true") \
    .mode("append") \
    .save()
```

</TabItem>
<TabItem value="Scala" label="Scala">

```scala
df.write
  .format("clickhouse")
  .option("host", "your-clickhouse-host")
  .option("protocol", "https")
  .option("http_port", "8443")
  .option("database", "default")
  .option("table", "your_table")
  .option("user", "default")
  .option("password", "your_password")
  .option("ssl", "true")
  .mode("append")
  .save()
```

</TabItem>
<TabItem value="Java" label="Java">

```java
df.write()
    .format("clickhouse")
    .option("host", "your-clickhouse-host")
    .option("protocol", "https")
    .option("http_port", "8443")
    .option("database", "default")
    .option("table", "your_table")
    .option("user", "default")
    .option("password", "your_password")
    .option("ssl", "true")
    .mode("append")
    .save();
```

</TabItem>
</Tabs>

### TableProvider 기능 \{#tableprovider-features\}

TableProvider API에는 여러 가지 강력한 기능이 있습니다.

#### 자동 테이블 생성 \{#automatic-table-creation\}

존재하지 않는 테이블로 데이터를 쓰는 경우 커넥터가 적절한 스키마로 테이블을 자동으로 생성합니다. 커넥터는 다음과 같은 지능적인 기본값을 제공합니다.

- **엔진(Engine)**: 지정하지 않은 경우 기본값은 `MergeTree()`입니다. `engine` 옵션을 사용해 다른 엔진을 지정할 수 있습니다(예: `ReplacingMergeTree()`, `SummingMergeTree()` 등).
- **ORDER BY**: **필수** - 새 테이블을 생성할 때 `order_by` 옵션을 명시적으로 지정해야 합니다. 커넥터는 지정된 모든 컬럼이 스키마에 존재하는지 검증합니다.
- **널 허용 키 지원(Nullable Key Support)**: ORDER BY에 널 허용 컬럼이 포함된 경우 `settings.allow_nullable_key=1`을 자동으로 추가합니다.

<Tabs groupId="spark_apis">
<TabItem value="Python" label="Python" default>

```python
# 명시적인 ORDER BY(필수)와 함께 테이블이 자동으로 생성됩니다.
df.write \
    .format("clickhouse") \
    .option("host", "your-host") \
    .option("database", "default") \
    .option("table", "new_table") \
    .option("order_by", "id") \
    .mode("append") \
    .save()

# 사용자 지정 엔진으로 테이블 생성 옵션을 지정합니다.
df.write \
    .format("clickhouse") \
    .option("host", "your-host") \
    .option("database", "default") \
    .option("table", "new_table") \
    .option("order_by", "id, timestamp") \
    .option("engine", "ReplacingMergeTree()") \
    .option("settings.allow_nullable_key", "1") \
    .mode("append") \
    .save()
```

</TabItem>
<TabItem value="Scala" label="Scala">

```scala
// 명시적인 ORDER BY(필수)와 함께 테이블이 자동으로 생성됩니다.
df.write
  .format("clickhouse")
  .option("host", "your-host")
  .option("database", "default")
  .option("table", "new_table")
  .option("order_by", "id")
  .mode("append")
  .save()

// 명시적인 테이블 생성 옵션과 사용자 지정 엔진을 사용합니다.
df.write
  .format("clickhouse")
  .option("host", "your-host")
  .option("database", "default")
  .option("table", "new_table")
  .option("order_by", "id, timestamp")
  .option("engine", "ReplacingMergeTree()")
  .option("settings.allow_nullable_key", "1")
  .mode("append")
  .save()
```

</TabItem>
<TabItem value="Java" label="Java">

```java
// 명시적인 ORDER BY(필수)와 함께 테이블이 자동으로 생성됩니다.
df.write()
    .format("clickhouse")
    .option("host", "your-host")
    .option("database", "default")
    .option("table", "new_table")
    .option("order_by", "id")
    .mode("append")
    .save();

// 명시적인 테이블 생성 옵션과 사용자 지정 엔진을 사용합니다.
df.write()
    .format("clickhouse")
    .option("host", "your-host")
    .option("database", "default")
    .option("table", "new_table")
    .option("order_by", "id, timestamp")
    .option("engine", "ReplacingMergeTree()")
    .option("settings.allow_nullable_key", "1")
    .mode("append")
    .save();
```

</TabItem>
</Tabs>

:::important
**ORDER BY 필수**: TableProvider API를 통해 새 테이블을 생성할 때 `order_by` 옵션은 **필수**입니다. ORDER BY 절에 사용할 컬럼을 명시적으로 지정해야 합니다. 커넥터는 지정된 모든 컬럼이 스키마에 존재하는지 검증하고, 일부 컬럼이 누락된 경우 오류를 발생시킵니다.

**엔진 선택**: 기본 엔진은 `MergeTree()`이지만, `engine` 옵션을 사용해 원하는 ClickHouse 테이블 엔진을 지정할 수 있습니다(예: `ReplacingMergeTree()`, `SummingMergeTree()`, `AggregatingMergeTree()` 등).
:::

### TableProvider 연결 옵션 \{#tableprovider-connection-options\}

포맷 기반 API를 사용할 때 사용할 수 있는 연결 옵션은 다음과 같습니다:

#### 연결 옵션 \{#connection-options\}

| Option       | Description                                      | Default Value  | Required |
|--------------|--------------------------------------------------|----------------|----------|
| `host`       | ClickHouse 서버 호스트명                         | `localhost`    | Yes      |
| `protocol`   | 연결 프로토콜 (`http` 또는 `https`)             | `http`         | No       |
| `http_port`  | HTTP/HTTPS 포트                                 | `8123`         | No       |
| `database`   | 데이터베이스 이름                               | `default`      | Yes      |
| `table`      | 테이블 이름                                     | N/A            | Yes      |
| `user`       | 인증에 사용할 사용자명                          | `default`      | No       |
| `password`   | 인증에 사용할 비밀번호                          | (빈 문자열)    | No       |
| `ssl`        | SSL 연결 사용 여부                              | `false`        | No       |
| `ssl_mode`   | SSL 모드 (`NONE`, `STRICT` 등)                  | `STRICT`       | No       |
| `timezone`   | 날짜/시간 연산에 사용할 시간대                  | `server`       | No       |

#### 테이블 생성 옵션 \{#table-creation-options\}

다음 옵션은 테이블이 존재하지 않아 새로 생성해야 할 때 사용합니다:

| Option                      | Description                                                                 | Default Value     | Required |
|-----------------------------|-----------------------------------------------------------------------------|-------------------|----------|
| `order_by`                  | ORDER BY 절에 사용할 컬럼. 여러 컬럼은 콤마로 구분합니다                     | N/A               | **예**   |
| `engine`                    | ClickHouse 테이블 엔진 (예: `MergeTree()`, `ReplacingMergeTree()`, `SummingMergeTree()` 등) | `MergeTree()`     | 아니요   |
| `settings.allow_nullable_key` | ORDER BY에서 널 허용 키를 활성화합니다 (ClickHouse Cloud용)               | 자동 감지**       | 아니요   |
| `settings.<key>`            | ClickHouse 테이블 설정 전체                                                 | N/A               | 아니요   |
| `cluster`                   | 분산 테이블용 클러스터 이름                                                | N/A               | 아니요   |
| `clickhouse.column.<name>.variant_types` | Variant 컬럼에 사용할 ClickHouse 타입의 콤마 구분 목록 (예: `String, Int64, Bool, JSON`). 타입 이름은 대소문자를 구분합니다. 콤마 뒤 공백은 선택 사항입니다. | N/A | 아니요 |

\* 새 테이블을 생성할 때는 `order_by` 옵션이 필수입니다. 지정된 모든 컬럼이 스키마에 존재해야 합니다.  
\** ORDER BY에 널 허용 컬럼이 포함되어 있고 명시적으로 설정되지 않은 경우 자동으로 `1`로 설정됩니다.

:::tip
**모범 사례**: ClickHouse Cloud에서는 ORDER BY 컬럼이 널 허용일 수 있는 경우, ClickHouse Cloud에서 이 설정을 요구하므로 `settings.allow_nullable_key=1`을 명시적으로 설정하는 것이 좋습니다.
:::

#### 쓰기 모드 \{#writing-modes\}

Spark 커넥터(TableProvider API와 Catalog API 모두)는 다음과 같은 Spark 쓰기 모드를 지원합니다.

- **`append`**: 기존 테이블에 데이터를 추가합니다.
- **`overwrite`**: 테이블의 모든 데이터를 대체합니다(테이블 내용을 모두 삭제함).

:::important
**파티션 덮어쓰기는 지원되지 않습니다**: 이 커넥터는 현재 파티션 단위의 덮어쓰기 작업(예: `partitionBy`와 함께 사용하는 `overwrite` 모드)을 지원하지 않습니다. 이 기능은 개발 중입니다. 진행 상황에 대한 추적은 [GitHub issue #34](https://github.com/ClickHouse/spark-clickhouse-connector/issues/34)를 참조하십시오.
:::

<Tabs groupId="spark_apis">
<TabItem value="Python" label="Python" default>

```python
# overwrite 모드(먼저 테이블 내용을 모두 삭제함)
df.write \
    .format("clickhouse") \
    .option("host", "your-host") \
    .option("database", "default") \
    .option("table", "my_table") \
    .mode("overwrite") \
    .save()
```

</TabItem>
<TabItem value="Scala" label="Scala">

```scala
// overwrite 모드(먼저 테이블 내용을 모두 삭제함)
df.write
  .format("clickhouse")
  .option("host", "your-host")
  .option("database", "default")
  .option("table", "my_table")
  .mode("overwrite")
  .save()
```

</TabItem>
<TabItem value="Java" label="Java">

```java
// overwrite 모드(먼저 테이블 내용을 모두 삭제함)
df.write()
    .format("clickhouse")
    .option("host", "your-host")
    .option("database", "default")
    .option("table", "my_table")
    .mode("overwrite")
    .save();
```

</TabItem>
</Tabs>

## ClickHouse 옵션 구성 \{#configuring-clickhouse-options\}

Catalog API와 TableProvider API 모두 ClickHouse 전용 옵션(커넥터 옵션이 아님) 구성을 지원합니다. 이러한 옵션은 테이블을 생성하거나 쿼리를 실행할 때 ClickHouse로 그대로 전달됩니다.

ClickHouse 옵션을 사용하면 `allow_nullable_key`, `index_granularity`와 같은 ClickHouse 전용 설정뿐만 아니라 기타 테이블 수준 또는 쿼리 수준 설정을 구성할 수 있습니다. 이는 `host`, `database`, `table`과 같이 커넥터가 ClickHouse에 연결되는 방식을 제어하는 커넥터 옵션과는 다릅니다.

### TableProvider API 사용 \{#using-tableprovider-api-options\}

TableProvider API를 사용할 때에는 `settings.&lt;key&gt;` 형식의 옵션을 사용합니다:

<Tabs groupId="spark_apis">
<TabItem value="Python" label="Python" default>

```python
df.write \
    .format("clickhouse") \
    .option("host", "your-host") \
    .option("database", "default") \
    .option("table", "my_table") \
    .option("order_by", "id") \
    .option("settings.allow_nullable_key", "1") \
    .option("settings.index_granularity", "8192") \
    .mode("append") \
    .save()
```

</TabItem>
<TabItem value="Scala" label="Scala">

```scala
df.write
  .format("clickhouse")
  .option("host", "your-host")
  .option("database", "default")
  .option("table", "my_table")
  .option("order_by", "id")
  .option("settings.allow_nullable_key", "1")
  .option("settings.index_granularity", "8192")
  .mode("append")
  .save()
```

</TabItem>
<TabItem value="Java" label="Java">

```java
df.write()
    .format("clickhouse")
    .option("host", "your-host")
    .option("database", "default")
    .option("table", "my_table")
    .option("order_by", "id")
    .option("settings.allow_nullable_key", "1")
    .option("settings.index_granularity", "8192")
    .mode("append")
    .save();
```

</TabItem>
</Tabs>

### Catalog API 사용 \{#using-catalog-api-options\}

Catalog API를 사용할 때는 Spark 구성에서 `spark.sql.catalog.<catalog_name>.option.<key>` 형식을 사용합니다.

```text
spark.sql.catalog.clickhouse.option.allow_nullable_key 1
spark.sql.catalog.clickhouse.option.index_granularity 8192
```

또는 Spark SQL로 테이블을 생성할 때 설정하십시오:

```sql
CREATE TABLE clickhouse.default.my_table (
  id INT,
  name STRING
) USING ClickHouse
TBLPROPERTIES (
  engine = 'MergeTree()',
  order_by = 'id',
  'settings.allow_nullable_key' = '1',
  'settings.index_granularity' = '8192'
)
```


## ClickHouse Cloud 설정 \{#clickhouse-cloud-settings\}

[ClickHouse Cloud](https://clickhouse.com)에 연결할 때는 SSL을 활성화하고 적절한 SSL 모드를 설정해야 합니다. 예를 들면 다음과 같습니다.

```text
spark.sql.catalog.clickhouse.option.ssl        true
spark.sql.catalog.clickhouse.option.ssl_mode   NONE
```


## 데이터 읽기 \{#read-data\}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
public static void main(String[] args) {
        // Spark 세션 생성
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

## 데이터 쓰기 \{#write-data\}

:::important
**파티션 덮어쓰기 미지원**: Catalog API는 현재 파티션 단위의 덮어쓰기 작업(예: `partitionBy`와 함께 사용하는 `overwrite` 모드)을 지원하지 않습니다. 이 기능은 개발 중입니다. 기능 진행 상황은 [GitHub issue #34](https://github.com/ClickHouse/spark-clickhouse-connector/issues/34)를 참고하십시오.
:::

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

## DDL 작업 \{#ddl-operations\}

Spark SQL을 사용하여 ClickHouse 인스턴스에서 DDL 작업을 수행할 수 있으며,
모든 변경 사항은 즉시 ClickHouse에 영구적으로 반영됩니다.
Spark SQL에서는 ClickHouse에서와 동일한 방식으로 쿼리를 작성할 수 있으므로,
예를 들어 CREATE TABLE, TRUNCATE 등의 명령을 수정 없이 바로 실행할 수 있습니다.

:::note
Spark SQL을 사용할 때는 한 번에 하나의 문만 실행할 수 있습니다.
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

위의 예제들은 Spark SQL 쿼리를 보여 주며, Java, Scala, PySpark 또는 셸 등 어떤 API를 사용하더라도 애플리케이션 내에서 실행할 수 있습니다.


## VariantType 사용하기 \{#working-with-varianttype\}

:::note
VariantType 지원은 Spark 4.0+에서 제공되며, 실험적 JSON/Variant 타입이 활성화된 ClickHouse 25.3+가 필요합니다.
:::

커넥터는 반정형 데이터 처리를 위해 Spark의 `VariantType`을 지원합니다. VariantType은 ClickHouse의 `JSON` 및 `Variant` 타입에 매핑되므로, 유연한 스키마를 가진 데이터를 효율적으로 저장하고 쿼리할 수 있습니다.

:::note
이 섹션은 VariantType 매핑과 사용 방법에 중점을 둡니다. 지원되는 모든 데이터 타입에 대한 전체 개요는 [Supported data types](#supported-data-types) 섹션을 참조하십시오.
:::

### ClickHouse 타입 매핑 \{#clickhouse-type-mapping\}

| ClickHouse Type | Spark Type | 설명 |
|----------------|------------|-------------|
| `JSON` | `VariantType` | JSON 객체만 저장합니다(반드시 `{`로 시작해야 합니다) |
| `Variant(T1, T2, ...)` | `VariantType` | 원시 타입, 배열, JSON을 포함한 여러 타입을 저장합니다 |

### VariantType 데이터 읽기 \{#reading-varianttype-data\}

ClickHouse에서 데이터를 읽을 때 `JSON` 및 `Variant` 컬럼은 자동으로 Spark의 `VariantType`으로 매핑됩니다.

<Tabs groupId="spark_apis">
<TabItem value="Scala" label="Scala" default>

```scala
// JSON 컬럼을 VariantType으로 읽기
val df = spark.sql("SELECT id, data FROM clickhouse.default.json_table")

// VariantType 데이터에 접근
df.show()

// 확인을 위해 VariantType 데이터를 JSON 문자열로 변환
import org.apache.spark.sql.functions._
df.select(
  col("id"),
  to_json(col("data")).as("data_json")
).show()
```

</TabItem>
<TabItem value="Python" label="Python">

```python
# JSON 컬럼을 VariantType으로 읽기
df = spark.sql("SELECT id, data FROM clickhouse.default.json_table")

# VariantType 데이터에 접근
df.show()

# 확인을 위해 VariantType 데이터를 JSON 문자열로 변환
from pyspark.sql.functions import to_json
df.select(
    "id",
    to_json("data").alias("data_json")
).show()
```

</TabItem>
<TabItem value="Java" label="Java">

```java
// JSON 컬럼을 VariantType으로 읽기
Dataset<Row> df = spark.sql("SELECT id, data FROM clickhouse.default.json_table");

// VariantType 데이터에 접근
df.show();

// 확인을 위해 VariantType 데이터를 JSON 문자열로 변환
import static org.apache.spark.sql.functions.*;
df.select(
    col("id"),
    to_json(col("data")).as("data_json")
).show();
```

</TabItem>
</Tabs>

### VariantType 데이터 쓰기 \{#writing-varianttype-data\}

JSON 또는 Variant 컬럼 타입을 사용하여 VariantType 데이터를 ClickHouse에 쓸 수 있습니다:

<Tabs groupId="spark_apis">
<TabItem value="Scala" label="Scala" default>

```scala
import org.apache.spark.sql.functions._

// JSON 데이터를 사용하여 DataFrame 생성
val jsonData = Seq(
  (1, """{"name": "Alice", "age": 30}"""),
  (2, """{"name": "Bob", "age": 25}"""),
  (3, """{"name": "Charlie", "city": "NYC"}""")
).toDF("id", "json_string")

// JSON 문자열을 VariantType으로 파싱
val variantDF = jsonData.select(
  col("id"),
  parse_json(col("json_string")).as("data")
)

// JSON 타입으로 ClickHouse에 쓰기 (JSON 객체만)
variantDF.writeTo("clickhouse.default.user_data").create()

// 또는 여러 타입을 허용하는 Variant를 지정
spark.sql("""
  CREATE TABLE clickhouse.default.mixed_data (
    id INT,
    data VARIANT
  ) USING clickhouse
  TBLPROPERTIES (
    'clickhouse.column.data.variant_types' = 'String, Int64, Bool, JSON',
    'engine' = 'MergeTree()',
    'order_by' = 'id'
  )
""")
```

</TabItem>
<TabItem value="Python" label="Python">

```python
from pyspark.sql.functions import parse_json

# JSON 데이터를 사용하여 DataFrame 생성
json_data = [
    (1, '{"name": "Alice", "age": 30}'),
    (2, '{"name": "Bob", "age": 25}'),
    (3, '{"name": "Charlie", "city": "NYC"}')
]
df = spark.createDataFrame(json_data, ["id", "json_string"])

# JSON 문자열을 VariantType으로 파싱
variant_df = df.select(
    "id",
    parse_json("json_string").alias("data")
)

# JSON 타입으로 ClickHouse에 쓰기
variant_df.writeTo("clickhouse.default.user_data").create()

# 또는 여러 타입을 허용하는 Variant를 지정
spark.sql("""
  CREATE TABLE clickhouse.default.mixed_data (
    id INT,
    data VARIANT
  ) USING clickhouse
  TBLPROPERTIES (
    'clickhouse.column.data.variant_types' = 'String, Int64, Bool, JSON',
    'engine' = 'MergeTree()',
    'order_by' = 'id'
  )
""")
```

</TabItem>
<TabItem value="Java" label="Java">

```java
import static org.apache.spark.sql.functions.*;

// JSON 데이터를 사용하여 DataFrame 생성
List<Row> jsonData = Arrays.asList(
    RowFactory.create(1, "{\"name\": \"Alice\", \"age\": 30}"),
    RowFactory.create(2, "{\"name\": \"Bob\", \"age\": 25}"),
    RowFactory.create(3, "{\"name\": \"Charlie\", \"city\": \"NYC\"}")
);
StructType schema = new StructType(new StructField[]{
    DataTypes.createStructField("id", DataTypes.IntegerType, false),
    DataTypes.createStructField("json_string", DataTypes.StringType, false)
});
Dataset<Row> jsonDF = spark.createDataFrame(jsonData, schema);

// JSON 문자열을 VariantType으로 파싱
Dataset<Row> variantDF = jsonDF.select(
    col("id"),
    parse_json(col("json_string")).as("data")
);

// JSON 타입으로 ClickHouse에 쓰기 (JSON 객체만)
variantDF.writeTo("clickhouse.default.user_data").create();

// 또는 여러 타입을 허용하는 Variant를 지정
spark.sql("CREATE TABLE clickhouse.default.mixed_data (" +
    "id INT, " +
    "data VARIANT" +
    ") USING clickhouse " +
    "TBLPROPERTIES (" +
    "'clickhouse.column.data.variant_types' = 'String, Int64, Bool, JSON', " +
    "'engine' = 'MergeTree()', " +
    "'order_by' = 'id'" +
    ")");
```

</TabItem>
</Tabs>

### Spark SQL로 VariantType 테이블 생성하기 \{#creating-varianttype-tables-spark-sql\}

Spark SQL DDL을 사용하여 VariantType 테이블을 CREATE할 수 있습니다:

```sql
-- Create table with JSON type (default)
CREATE TABLE clickhouse.default.json_table (
  id INT,
  data VARIANT
) USING clickhouse
TBLPROPERTIES (
  'engine' = 'MergeTree()',
  'order_by' = 'id'
)
```

```sql
-- Create table with Variant type supporting multiple types
CREATE TABLE clickhouse.default.flexible_data (
  id INT,
  data VARIANT
) USING clickhouse
TBLPROPERTIES (
  'clickhouse.column.data.variant_types' = 'String, Int64, Float64, Bool, Array(String), JSON',
  'engine' = 'MergeTree()',
  'order_by' = 'id'
)
```


### Variant 타입 설정 \{#configuring-variant-types\}

VariantType 컬럼을 사용해 테이블을 생성할 때 사용할 ClickHouse 타입을 지정할 수 있습니다.

#### JSON 타입(기본값) \{#json-type-default\}

`variant_types` 속성을 지정하지 않으면 컬럼은 기본적으로 JSON 객체만 허용하는 ClickHouse의 `JSON` 타입으로 설정됩니다:

```sql
CREATE TABLE clickhouse.default.json_table (
  id INT,
  data VARIANT
) USING clickhouse
TBLPROPERTIES (
  'engine' = 'MergeTree()',
  'order_by' = 'id'
)
```

다음 ClickHouse 쿼리를 생성합니다:

```sql
CREATE TABLE json_table (id Int32, data JSON) ENGINE = MergeTree() ORDER BY id
```


#### 여러 타입을 포함하는 VariantType \{#variant-type-multiple-types\}

프리미티브, 배열, JSON 객체를 지원하려면 `variant_types` 속성에 타입을 지정합니다.

```sql
CREATE TABLE clickhouse.default.flexible_data (
  id INT,
  data VARIANT
) USING clickhouse
TBLPROPERTIES (
  'clickhouse.column.data.variant_types' = 'String, Int64, Float64, Bool, Array(String), JSON',
  'engine' = 'MergeTree()',
  'order_by' = 'id'
)
```

다음 ClickHouse 쿼리를 생성합니다:

```sql
CREATE TABLE flexible_data (
  id Int32, 
  data Variant(String, Int64, Float64, Bool, Array(String), JSON)
) ENGINE = MergeTree() ORDER BY id
```


### 지원되는 Variant 타입 \{#supported-variant-types\}

다음 ClickHouse 타입을 `Variant()`에 사용할 수 있습니다:

- **기본형(Primitives)**: `String`, `Int8`, `Int16`, `Int32`, `Int64`, `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Float32`, `Float64`, `Bool`
- **배열(Arrays)**: `Array(T)` (T는 중첩 배열을 포함한 모든 지원 타입)
- **JSON**: JSON 객체를 저장하기 위한 `JSON`

### 읽기 포맷 설정 \{#read-format-configuration\}

기본적으로 JSON 및 Variant 컬럼은 `VariantType`으로 읽습니다. 필요하면 이 동작을 변경하여 문자열로 읽도록 설정할 수 있습니다:

<Tabs groupId="spark_apis">
<TabItem value="Scala" label="Scala" default>

```scala
// JSON/Variant를 VariantType 대신 문자열로 읽습니다
spark.conf.set("spark.clickhouse.read.jsonAs", "string")

val df = spark.sql("SELECT id, data FROM clickhouse.default.json_table")
// data 컬럼은 JSON 문자열을 포함하는 StringType이 됩니다
```

</TabItem>
<TabItem value="Python" label="Python">

```python
# JSON/Variant를 VariantType 대신 문자열로 읽습니다
spark.conf.set("spark.clickhouse.read.jsonAs", "string")

df = spark.sql("SELECT id, data FROM clickhouse.default.json_table")
# data 컬럼은 JSON 문자열을 포함하는 StringType이 됩니다
```

</TabItem>
<TabItem value="Java" label="Java">

```java
// JSON/Variant를 VariantType 대신 문자열로 읽습니다
spark.conf().set("spark.clickhouse.read.jsonAs", "string");

Dataset<Row> df = spark.sql("SELECT id, data FROM clickhouse.default.json_table");
// data 컬럼은 JSON 문자열을 포함하는 StringType이 됩니다
```

</TabItem>
</Tabs>

### 쓰기 포맷 지원 \{#write-format-support\}

VariantType 쓰기 지원은 포맷별로 다릅니다:

| Format | Support    | Notes                                                                                                                                                   |
| ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JSON   | ✅ Full     | `JSON` 및 `Variant` 타입을 모두 지원합니다. VariantType 데이터를 위한 권장 포맷입니다                                                                                           |
| Arrow  | ⚠️ Partial | ClickHouse `JSON` 타입으로의 쓰기를 지원합니다. ClickHouse `Variant` 타입은 지원하지 않습니다. 전체 지원은 https://github.com/ClickHouse/ClickHouse/issues/92752 이슈가 해결된 후 제공될 예정입니다 |

쓰기 포맷을 구성하십시오:

```scala
spark.conf.set("spark.clickhouse.write.format", "json")  // Recommended for Variant types
```

:::tip
ClickHouse의 `Variant` 타입으로 데이터를 기록해야 하는 경우 JSON 포맷을 사용하십시오. Arrow 포맷은 `JSON` 타입에 대한 기록만 지원합니다.
:::


### 모범 사례 \{#varianttype-best-practices\}

1. **JSON 전용 데이터에는 JSON 타입 사용**: JSON 객체만 저장하는 경우, 기본 JSON 타입(`variant_types` 속성 없음)을 사용합니다.
2. **타입을 명시적으로 지정**: `Variant()`를 사용할 때는 저장할 모든 타입을 명시적으로 나열합니다.
3. **실험적 기능 활성화**: ClickHouse에서 `allow_experimental_json_type = 1`이 활성화되어 있는지 확인합니다.
4. **쓰기에는 JSON 형식 사용**: 호환성을 높이기 위해 VariantType 데이터에는 JSON 형식 사용을 권장합니다.
5. **쿼리 패턴 고려**: JSON/Variant 타입은 효율적인 필터링을 위해 ClickHouse의 JSON 경로 쿼리를 지원합니다.
6. **성능을 위한 컬럼 힌트**: ClickHouse에서 JSON 필드를 사용할 때 컬럼 힌트를 추가하면 쿼리 성능이 향상됩니다. 현재 Spark를 통해 컬럼 힌트를 추가하는 기능은 지원되지 않습니다. 해당 기능은 [GitHub issue #497](https://github.com/ClickHouse/spark-clickhouse-connector/issues/497)에서 추적되고 있습니다.

### 예시: 전체 워크플로우 \{#varianttype-example-workflow\}

<Tabs groupId="spark_apis">
  <TabItem value="Scala" label="Scala" default>
    ```scala
    import org.apache.spark.sql.functions._

    // Enable experimental JSON type in ClickHouse
    spark.sql("SET allow_experimental_json_type = 1")

    // Create table with Variant column
    spark.sql("""
      CREATE TABLE clickhouse.default.events (
        event_id BIGINT,
        event_time TIMESTAMP,
        event_data VARIANT
      ) USING clickhouse
      TBLPROPERTIES (
        'clickhouse.column.event_data.variant_types' = 'String, Int64, Bool, JSON',
        'engine' = 'MergeTree()',
        'order_by' = 'event_time'
      )
    """)

    // Prepare data with mixed types
    val events = Seq(
      (1L, "2024-01-01 10:00:00", """{"action": "login", "user_id": 123}"""),
      (2L, "2024-01-01 10:05:00", """{"action": "purchase", "amount": 99.99}"""),
      (3L, "2024-01-01 10:10:00", """{"action": "logout", "duration": 600}""")
    ).toDF("event_id", "event_time", "json_data")

    // Convert to VariantType and write
    val variantEvents = events.select(
      col("event_id"),
      to_timestamp(col("event_time")).as("event_time"),
      parse_json(col("json_data")).as("event_data")
    )

    variantEvents.writeTo("clickhouse.default.events").append()

    // Read and query
    val result = spark.sql("""
      SELECT event_id, event_time, event_data
      FROM clickhouse.default.events
      WHERE event_time >= '2024-01-01'
      ORDER BY event_time
    """)

    result.show(false)
    ```
  </TabItem>

  <TabItem value="Python" label="Python">
    ```python
    from pyspark.sql.functions import parse_json, to_timestamp

    # Enable experimental JSON type in ClickHouse
    spark.sql("SET allow_experimental_json_type = 1")

    # Create table with Variant column
    spark.sql("""
      CREATE TABLE clickhouse.default.events (
        event_id BIGINT,
        event_time TIMESTAMP,
        event_data VARIANT
      ) USING clickhouse
      TBLPROPERTIES (
        'clickhouse.column.event_data.variant_types' = 'String, Int64, Bool, JSON',
        'engine' = 'MergeTree()',
        'order_by' = 'event_time'
      )
    """)

    # Prepare data with mixed types
    events = [
        (1, "2024-01-01 10:00:00", '{"action": "login", "user_id": 123}'),
        (2, "2024-01-01 10:05:00", '{"action": "purchase", "amount": 99.99}'),
        (3, "2024-01-01 10:10:00", '{"action": "logout", "duration": 600}')
    ]
    df = spark.createDataFrame(events, ["event_id", "event_time", "json_data"])

    # Convert to VariantType and write
    variant_events = df.select(
        "event_id",
        to_timestamp("event_time").alias("event_time"),
        parse_json("json_data").alias("event_data")
    )

    variant_events.writeTo("clickhouse.default.events").append()

    # Read and query
    result = spark.sql("""
      SELECT event_id, event_time, event_data
      FROM clickhouse.default.events
      WHERE event_time >= '2024-01-01'
      ORDER BY event_time
    """)

    result.show(truncate=False)
    ```
  </TabItem>

  <TabItem value="Java" label="Java">
    ```java
    import static org.apache.spark.sql.functions.*;

    // Enable experimental JSON type in ClickHouse
    spark.sql("SET allow_experimental_json_type = 1");

    // Create table with Variant column
    spark.sql("CREATE TABLE clickhouse.default.events (" +
        "event_id BIGINT, " +
        "event_time TIMESTAMP, " +
        "event_data VARIANT" +
        ") USING clickhouse " +
        "TBLPROPERTIES (" +
        "'clickhouse.column.event_data.variant_types' = 'String, Int64, Bool, JSON', " +
        "'engine' = 'MergeTree()', " +
        "'order_by' = 'event_time'" +
        ")");

    // Prepare data with mixed types
    List<Row> events = Arrays.asList(
        RowFactory.create(1L, "2024-01-01 10:00:00", "{\"action\": \"login\", \"user_id\": 123}"),
        RowFactory.create(2L, "2024-01-01 10:05:00", "{\"action\": \"purchase\", \"amount\": 99.99}"),
        RowFactory.create(3L, "2024-01-01 10:10:00", "{\"action\": \"logout\", \"duration\": 600}")
    );
    StructType eventSchema = new StructType(new StructField[]{
        DataTypes.createStructField("event_id", DataTypes.LongType, false),
        DataTypes.createStructField("event_time", DataTypes.StringType, false),
        DataTypes.createStructField("json_data", DataTypes.StringType, false)
    });
    Dataset<Row> eventsDF = spark.createDataFrame(events, eventSchema);

    // Convert to VariantType and write
    Dataset<Row> variantEvents = eventsDF.select(
        col("event_id"),
        to_timestamp(col("event_time")).as("event_time"),
        parse_json(col("json_data")).as("event_data")
    );

    variantEvents.writeTo("clickhouse.default.events").append();

    // Read and query
    Dataset<Row> result = spark.sql("SELECT event_id, event_time, event_data " +
        "FROM clickhouse.default.events " +
        "WHERE event_time >= '2024-01-01' " +
        "ORDER BY event_time");

    result.show(false);
    ```
  </TabItem>
</Tabs>

## 설정 \{#configurations\}

다음은 커넥터에서 조정 가능한 설정입니다.

:::note
**설정 사용**: 다음 옵션은 Catalog API와 TableProvider API 모두에 적용되는 Spark 레벨 설정 옵션입니다. 다음 두 가지 방식으로 설정할 수 있습니다.

1. **전역 Spark 설정** (모든 작업에 적용):
   ```python
   spark.conf.set("spark.clickhouse.write.batchSize", "20000")
   spark.conf.set("spark.clickhouse.write.compression.codec", "lz4")
   ```

2. **작업별 설정 재정의** (TableProvider API에만 해당 - 전역 설정을 재정의할 수 있음):
   ```python
   df.write \
       .format("clickhouse") \
       .option("host", "your-host") \
       .option("database", "default") \
       .option("table", "my_table") \
       .option("spark.clickhouse.write.batchSize", "20000") \
       .option("spark.clickhouse.write.compression.codec", "lz4") \
       .mode("append") \
       .save()
   ```

또는 `spark-defaults.conf` 파일이나 Spark 세션 생성 시에 설정할 수 있습니다.
:::

<br/>

| 키                                                                        | 기본값                                              | 설명                                                                                                                                                                                                                                                                                                                                                                                                                              | 도입 버전  |
| ------------------------------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| spark.clickhouse.ignoreUnsupportedTransform                              | true                                             | ClickHouse는 세그먼트 키나 파티션 값으로 복잡한 표현식을 사용할 수 있습니다(예: `cityHash64(col_1, col_2)`), 그러나 현재 Spark에서는 이를 지원하지 않습니다. `true`인 경우 지원되지 않는 표현식을 무시하고 경고를 기록하며, 그렇지 않으면 예외를 던지고 즉시 실패합니다. **경고**: `spark.clickhouse.write.distributed.convertLocal=true`인 경우, 지원되지 않는 세그먼트 키를 무시하면 데이터가 손상될 수 있습니다. 커넥터는 이를 검증하고 기본적으로 오류를 발생시킵니다. 이를 허용하려면 `spark.clickhouse.write.distributed.convertLocal.allowUnsupportedSharding=true`를 명시적으로 설정하십시오. | 0.4.0  |
| spark.clickhouse.read.compression.codec                                  | lz4                                              | 데이터를 읽을 때 압축을 해제하는 데 사용하는 코덱입니다. 지원 코덱: none, lz4.                                                                                                                                                                                                                                                                                                                                                                              | 0.5.0  |
| spark.clickhouse.read.distributed.convertLocal                           | true                                             | 분산 테이블을 읽을 때 분산 테이블 대신 로컬 테이블을 읽습니다. `true`로 설정하면 `spark.clickhouse.read.distributed.useClusterNodes`를 무시합니다.                                                                                                                                                                                                                                                                                                                   | 0.1.0  |
| spark.clickhouse.read.fixedStringAs                                      | binary                                           | ClickHouse의 FixedString 타입을 지정된 Spark 데이터 타입으로 읽습니다. 지원 타입: binary, string.                                                                                                                                                                                                                                                                                                                                                     | 0.8.0  |
| spark.clickhouse.read.format                                             | json                                             | 데이터를 읽을 때 사용하는 직렬화 형식입니다. 지원 형식: json, binary.                                                                                                                                                                                                                                                                                                                                                                                  | 0.6.0  |
| spark.clickhouse.read.runtimeFilter.enabled                              | false                                            | 데이터를 읽을 때 런타임 필터를 활성화할지 여부입니다.                                                                                                                                                                                                                                                                                                                                                                                                  | 0.8.0  |
| spark.clickhouse.read.splitByPartitionId                                 | true                                             | `true`인 경우, 파티션 값 대신 가상 컬럼 `_partition_id`로 입력 파티션 필터를 구성합니다. 파티션 값으로 SQL 조건식을 구성할 때는 알려진 문제가 있습니다. 이 기능을 사용하려면 ClickHouse Server v21.6+ 버전이 필요합니다.                                                                                                                                                                                                                                                                             | 0.4.0  |
| spark.clickhouse.useNullableQuerySchema                                  | false                                            | `true`인 경우 `CREATE/REPLACE TABLE ... AS SELECT ...`로 테이블을 생성할 때 쿼리 스키마의 모든 필드를 널 허용(Nullable)으로 표시합니다. 참고로 이 설정에는 SPARK-43390(Spark 3.5에서 제공됨)이 필요하며, 이 패치가 없으면 항상 `true`로 동작합니다.                                                                                                                                                                                                                                               | 0.8.0  |
| spark.clickhouse.write.batchSize                                         | 10000                                            | ClickHouse에 데이터를 쓸 때 배치 하나당 레코드 수입니다.                                                                                                                                                                                                                                                                                                                                                                                           | 0.1.0  |
| spark.clickhouse.write.compression.codec                                 | lz4                                              | 데이터를 쓸 때 사용하는 압축 코덱입니다. 지원 코덱: none, lz4.                                                                                                                                                                                                                                                                                                                                                                                       | 0.3.0  |
| spark.clickhouse.write.distributed.convertLocal                          | false                                            | Distributed 테이블에 쓸 때는 Distributed 테이블 자체 대신 로컬 테이블에 기록합니다. `true`이면 `spark.clickhouse.write.distributed.useClusterNodes`를 무시합니다. 이는 ClickHouse의 기본 라우팅을 우회하므로 Spark가 샤딩 키를 평가해야 합니다. 지원되지 않는 샤딩 표현식을 사용할 때는, 눈에 띄지 않게 발생하는 데이터 분배 오류를 방지하기 위해 `spark.clickhouse.ignoreUnsupportedTransform`를 `false`로 설정해야 합니다.                                                                                                                 | 0.1.0  |
| spark.clickhouse.write.distributed.convertLocal.allowUnsupportedSharding | false                                            | 샤딩 키가 지원되지 않는 경우에도 `convertLocal=true` 및 `ignoreUnsupportedTransform=true`로 설정된 상태에서 분산 테이블(Distributed table)에 대한 쓰기를 허용합니다. 이는 위험하며 잘못된 샤딩으로 인해 데이터 손상이 발생할 수 있습니다. `true`로 설정하면, Spark가 지원되지 않는 샤딩 표현식을 평가할 수 없으므로 쓰기 전에 데이터가 올바르게 정렬 및 샤딩되어 있는지 반드시 확인해야 합니다. 위험을 이해하고 데이터 분포를 이미 검증한 경우에만 `true`로 설정하십시오. 기본적으로 이 설정 조합은 눈에 띄지 않게 데이터가 손상되는 일을 방지하기 위해 오류를 발생시킵니다.                                                         | 0.10.0 |
| spark.clickhouse.write.distributed.useClusterNodes                       | true                                             | 분산 테이블에 쓸 때 클러스터의 모든 노드에 데이터를 기록합니다.                                                                                                                                                                                                                                                                                                                                                                                            | 0.1.0  |
| spark.clickhouse.write.format                                            | arrow                                            | 쓰기 시 사용할 직렬화 포맷입니다. 지원되는 포맷: json, arrow입니다.                                                                                                                                                                                                                                                                                                                                                                                    | 0.4.0  |
| spark.clickhouse.write.localSortByKey                                    | true                                             | `true` 값이면 쓰기 전에 정렬 키를 기준으로 로컬 정렬을 수행합니다.                                                                                                                                                                                                                                                                                                                                                                                       | 0.3.0  |
| spark.clickhouse.write.localSortByPartition                              | spark.clickhouse.write.repartitionByPartition의 값 | `true`이면 쓰기 전에 파티션별로 로컬 정렬을 수행합니다. 미설정 시 `spark.clickhouse.write.repartitionByPartition`와 동일하게 동작합니다.                                                                                                                                                                                                                                                                                                                           | 0.3.0  |
| spark.clickhouse.write.maxRetry                                          | 3                                                | 재시도 가능한 오류 코드로 인해 단일 배치 쓰기가 실패했을 때, 쓰기를 재시도하는 최대 횟수입니다.                                                                                                                                                                                                                                                                                                                                                                         | 0.1.0  |
| spark.clickhouse.write.repartitionByPartition                            | true                                             | 쓰기 전에 ClickHouse 파티션 키를 기준으로 데이터를 재파티션하여 ClickHouse 테이블의 분산 방식에 일치시킬지 여부입니다.                                                                                                                                                                                                                                                                                                                                                    | 0.3.0  |
| spark.clickhouse.write.repartitionNum                                    | 0                                                | 쓰기 전에 데이터를 ClickHouse 테이블의 분산 방식에 맞게 재파티션해야 하는 경우, 사용할 재파티션 개수를 지정하는 설정입니다. 값이 1보다 작으면 재파티션 개수에 대한 요구 사항이 없음을 의미합니다.                                                                                                                                                                                                                                                                                                            | 0.1.0  |
| spark.clickhouse.write.repartitionStrictly                               | false                                            | `true`이면 Spark는 기록을 데이터 소스 테이블에 쓰기 전에, 요구되는 분배 조건을 만족하도록 입력 레코드를 각 파티션에 엄격하게 분산합니다. 그렇지 않으면 Spark가 쿼리 속도를 높이기 위해 일부 최적화를 적용할 수 있지만, 이로 인해 분배 요구 사항이 깨질 수 있습니다. 참고로, 이 설정을 사용하려면 SPARK-37523(Spark 3.4에서 사용 가능)이 필요하며, 이 패치가 없으면 항상 `true`로 동작합니다.                                                                                                                                                                               | 0.3.0  |
| spark.clickhouse.write.retryInterval                                     | 10s                                              | 쓰기 재시도 간의 간격(초)입니다.                                                                                                                                                                                                                                                                                                                                                                                                             | 0.1.0  |
| spark.clickhouse.write.retryableErrorCodes                               | 241                                              | 쓰기 작업 실패 시 ClickHouse 서버에서 반환하는 재시도 가능한 오류 코드입니다.                                                                                                                                                                                                                                                                                                                                                                               | 0.1.0  |

## 지원되는 데이터 타입 \{#supported-data-types\}

이 섹션에서는 Spark와 ClickHouse 간 데이터 타입 매핑을 설명합니다. 아래 표는 ClickHouse에서 Spark로 데이터를 읽을 때와 Spark에서 ClickHouse로 데이터를 삽입할 때 데이터 타입을 변환하는 데 사용할 수 있는 빠른 참조용 정보를 제공합니다.

### ClickHouse에서 Spark로 데이터 읽기 \{#reading-data-from-clickhouse-into-spark\}

| ClickHouse Data Type                                              | Spark Data Type                | Supported | Is Primitive | Notes                                              |
|-------------------------------------------------------------------|--------------------------------|-----------|--------------|----------------------------------------------------|
| `Nothing`                                                         | `NullType`                     | ✅         | 예           |                                                    |
| `Bool`                                                            | `BooleanType`                  | ✅         | 예           |                                                    |
| `UInt8`, `Int16`                                                  | `ShortType`                    | ✅         | 예           |                                                    |
| `Int8`                                                            | `ByteType`                     | ✅         | 예           |                                                    |
| `UInt16`,`Int32`                                                  | `IntegerType`                  | ✅         | 예           |                                                    |
| `UInt32`,`Int64`, `UInt64`                                        | `LongType`                     | ✅         | 예           |                                                    |
| `Int128`,`UInt128`, `Int256`, `UInt256`                           | `DecimalType(38, 0)`           | ✅         | 예           |                                                    |
| `Float32`                                                         | `FloatType`                    | ✅         | 예           |                                                    |
| `Float64`                                                         | `DoubleType`                   | ✅         | 예           |                                                    |
| `String`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6`               | `StringType`                   | ✅         | 예           |                                                    |
| `FixedString`                                                     | `BinaryType`, `StringType`     | ✅         | 예           | 설정 `READ_FIXED_STRING_AS`로 제어됩니다           |
| `Decimal`                                                         | `DecimalType`                  | ✅         | 예           | 정밀도와 스케일은 `Decimal128`까지 지원됩니다      |
| `Decimal32`                                                       | `DecimalType(9, scale)`        | ✅         | 예           |                                                    |
| `Decimal64`                                                       | `DecimalType(18, scale)`       | ✅         | 예           |                                                    |
| `Decimal128`                                                      | `DecimalType(38, scale)`       | ✅         | 예           |                                                    |
| `Date`, `Date32`                                                  | `DateType`                     | ✅         | 예           |                                                    |
| `DateTime`, `DateTime32`, `DateTime64`                            | `TimestampType`                | ✅         | 예           |                                                    |
| `Array`                                                           | `ArrayType`                    | ✅         | 아니오       | 배열 요소 타입도 함께 변환됩니다                   |
| `Map`                                                             | `MapType`                      | ✅         | 아니오       | 키는 `StringType`로 제한됩니다                     |
| `IntervalYear`                                                    | `YearMonthIntervalType(Year)`  | ✅         | 예           |                                                    |
| `IntervalMonth`                                                   | `YearMonthIntervalType(Month)` | ✅         | 예           |                                                    |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`          | ✅         | 아니오       | 각 구간에 해당하는 interval 타입이 사용됩니다      |
| `JSON`, `Variant`                                                 | `VariantType`                  | ✅         | 아니오       | Spark 4.0+ 및 ClickHouse 25.3+가 필요합니다. `spark.clickhouse.read.jsonAs=string` 설정을 사용하면 `StringType`으로 읽을 수 있습니다 |
| `Object`                                                          |                                | ❌         |              |                                                    |
| `Nested`                                                          |                                | ❌         |              |                                                    |
| `Tuple`                                                           | `StructType`                   | ✅         | 아니오       | 이름이 있는 튜플과 이름이 없는 튜플을 모두 지원합니다. 이름이 있는 튜플은 이름으로 struct 필드에 매핑되고, 이름이 없는 튜플은 `_1`, `_2` 등의 이름을 사용합니다. 중첩 struct와 널 허용 필드를 지원합니다 |
| `Point`                                                           |                                | ❌         |              |                                                    |
| `Polygon`                                                         |                                | ❌         |              |                                                    |
| `MultiPolygon`                                                    |                                | ❌         |              |                                                    |
| `Ring`                                                            |                                | ❌         |              |                                                    |
| `IntervalQuarter`                                                 |                                | ❌         |              |                                                    |
| `IntervalWeek`                                                    |                                | ❌         |              |                                                    |
| `Decimal256`                                                      |                                | ❌         |              |                                                    |
| `AggregateFunction`                                               |                                | ❌         |              |                                                    |
| `SimpleAggregateFunction`                                         |                                | ❌         |              |                                                    |

### Spark에서 ClickHouse로 데이터 삽입하기 \{#inserting-data-from-spark-into-clickhouse\}

| Spark 데이터 타입                    | ClickHouse 데이터 타입 | 지원 여부 | 기본 타입 여부 | 비고                                   |
|-------------------------------------|------------------------|-----------|----------------|----------------------------------------|
| `BooleanType`                       | `Bool`                 | ✅         | 예             | 버전 0.9.0부터 `UInt8`가 아닌 `Bool` 타입으로 매핑됩니다. |
| `ByteType`                          | `Int8`                 | ✅         | 예             |                                        |
| `ShortType`                         | `Int16`                | ✅         | 예             |                                        |
| `IntegerType`                       | `Int32`                | ✅         | 예             |                                        |
| `LongType`                          | `Int64`                | ✅         | 예             |                                        |
| `FloatType`                         | `Float32`              | ✅         | 예             |                                        |
| `DoubleType`                        | `Float64`              | ✅         | 예             |                                        |
| `StringType`                        | `String`               | ✅         | 예             |                                        |
| `VarcharType`                       | `String`               | ✅         | 예             |                                        |
| `CharType`                          | `String`               | ✅         | 예             |                                        |
| `DecimalType`                       | `Decimal(p, s)`        | ✅         | 예             | 정밀도(precision)와 스케일(scale)은 `Decimal128`까지 지원됩니다. |
| `DateType`                          | `Date`                 | ✅         | 예             |                                        |
| `TimestampType`                     | `DateTime`             | ✅         | 예             |                                        |
| `ArrayType` (list, tuple, or array) | `Array`                | ✅         | 아니요         | Array 요소의 타입도 함께 변환됩니다.   |
| `MapType`                           | `Map`                  | ✅         | 아니요         | 키는 `StringType`으로 제한됩니다.      |
| `StructType`                        | `Tuple`                | ✅         | 아니요         | 필드 이름을 가진 이름 있는 Tuple로 변환됩니다. |
| `VariantType`                       | `JSON` or `Variant`    | ✅         | 아니요         | Spark 4.0+ 및 ClickHouse 25.3+가 필요합니다. 기본값은 `JSON` 타입입니다. 여러 타입이 있는 `Variant`를 지정하려면 `clickhouse.column.<name>.variant_types` 속성을 사용하십시오. |
| `Object`                            |                        | ❌         |                |                                        |
| `Nested`                            |                        | ❌         |                |                                        |

## 기여 및 지원 \{#contributing-and-support\}

프로젝트에 기여하거나 이슈를 보고하고자 한다면 언제든지 참여를 환영합니다.
[GitHub 저장소](https://github.com/ClickHouse/spark-clickhouse-connector)를 방문하여 이슈를 생성하고,
개선 사항을 제안하거나 Pull Request를 제출하십시오.
기여는 언제나 환영합니다. 시작하기 전에 저장소의 기여 가이드를 확인하십시오.
ClickHouse Spark 커넥터를 개선하는 데 도움을 주셔서 감사합니다.
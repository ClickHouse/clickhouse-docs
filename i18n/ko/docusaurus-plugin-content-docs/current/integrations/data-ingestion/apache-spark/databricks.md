---
sidebar_label: 'Databricks'
sidebar_position: 3
slug: /integrations/data-ingestion/apache-spark/databricks
description: 'ClickHouse를 Databricks와 통합합니다'
keywords: ['clickhouse', 'databricks', 'spark', 'unity catalog', 'data']
title: 'ClickHouse를 Databricks와 통합하기'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Databricks와 ClickHouse 통합 \{#integrating-clickhouse-with-databricks\}

<ClickHouseSupportedBadge/>

ClickHouse Spark 커넥터는 Databricks와 원활하게 연동됩니다. 이 가이드에서는 Databricks 환경에 특화된 구성, 설치 및 사용 패턴을 설명합니다.

## Databricks용 API 선택 \{#api-selection\}

기본적으로 Databricks는 Unity Catalog를 사용하며, 이로 인해 Spark 카탈로그 등록이 차단됩니다. 이 경우 **반드시** **TableProvider API**(포맷 기반 접근 방식)를 사용해야 합니다.

하지만 클러스터를 생성할 때 액세스 모드를 **No isolation shared**로 설정하여 Unity Catalog를 비활성화하면, 대신 **Catalog API**를 사용할 수 있습니다. Catalog API는 중앙 집중식 구성과 네이티브 Spark SQL 통합을 제공합니다.

| Unity Catalog 상태 | 권장 API | 비고 |
|---------------------|------------------|-------|
| **Enabled** (기본값) | TableProvider API (포맷 기반) | Unity Catalog가 Spark 카탈로그 등록을 차단함 |
| **Disabled** (No isolation shared) | Catalog API | 「No isolation shared」 액세스 모드의 클러스터가 필요함 |

## Databricks에 설치하기 \{#installation\}

### 옵션 1: Databricks UI를 통해 JAR 업로드 \{#installation-ui\}

1. 런타임 JAR을 빌드하거나 [다운로드](https://repo1.maven.org/maven2/com/clickhouse/spark/)합니다:
   ```bash
   clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar
   ```

2. Databricks 워크스페이스에 JAR을 업로드합니다:
   - **Workspace**로 이동 → 원하는 폴더로 이동합니다.
   - **Upload**를 클릭 → JAR 파일을 선택합니다.
   - JAR이 워크스페이스에 저장됩니다.

3. 클러스터에 라이브러리를 설치합니다:
   - **Compute**로 이동 → 클러스터를 선택합니다.
   - **Libraries** 탭을 클릭합니다.
   - **Install New**를 클릭합니다.
   - **DBFS** 또는 **Workspace**를 선택 → 업로드한 JAR 파일로 이동합니다.
   - **Install**을 클릭합니다.

<Image img={require('@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-libraries-tab.png')} alt="Databricks Libraries 탭" />

<Image img={require('@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-install-from-volume.png')} alt="워크스페이스 볼륨에서 라이브러리 설치" />

4. 라이브러리를 로드하기 위해 클러스터를 다시 시작합니다.

### 옵션 2: Databricks CLI를 사용하여 설치 \{#installation-cli\}

```bash
# Upload JAR to DBFS
databricks fs cp clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar \
  dbfs:/FileStore/jars/

# Install on cluster
databricks libraries install \
  --cluster-id <your-cluster-id> \
  --jar dbfs:/FileStore/jars/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar
```


### 옵션 3: Maven 좌표(권장) \{#installation-maven\}

1. Databricks 워크스페이스로 이동합니다.
   * **Compute**로 이동한 후 클러스터를 선택합니다.
   * **Libraries** 탭을 클릭합니다.
   * **Install New**를 클릭합니다.
   * **Maven** 탭을 선택합니다.

2. Maven 좌표를 추가합니다.

```text
com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}
```

<Image img={require('@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-maven-tab.png')} alt="Databricks Maven 라이브러리 구성" />

3. **Install**을 클릭한 후 클러스터를 다시 시작하여 라이브러리를 로드합니다


## TableProvider API 사용 \{#tableprovider-api\}

Unity Catalog가 활성화되어 있는 경우(기본값) Unity Catalog가 Spark 카탈로그 등록을 허용하지 않으므로 반드시 TableProvider API(포맷 기반 액세스)를 사용해야 합니다. 클러스터에서 "No isolation shared" 액세스 모드를 사용하여 Unity Catalog를 비활성화한 경우에는 대신 [Catalog API](/integrations/apache-spark/spark-native-connector#register-the-catalog-required)를 사용할 수 있습니다.

### 데이터 읽기 \{#reading-data-table-provider\}

<Tabs groupId="databricks_usage">
<TabItem value="Python" label="Python" default>

```python
# TableProvider API를 사용하여 ClickHouse에서 데이터를 읽습니다.
df = spark.read \
    .format("clickhouse") \
    .option("host", "your-clickhouse-cloud-host.clickhouse.cloud") \
    .option("protocol", "https") \
    .option("http_port", "8443") \
    .option("database", "default") \
    .option("table", "events") \
    .option("user", "default") \
    .option("password", dbutils.secrets.get(scope="clickhouse", key="password")) \
    .option("ssl", "true") \
    .load()

# 스키마가 자동으로 추론됩니다.
df.display()
```

</TabItem>
<TabItem value="Scala" label="Scala">

```scala
val df = spark.read
  .format("clickhouse")
  .option("host", "your-clickhouse-cloud-host.clickhouse.cloud")
  .option("protocol", "https")
  .option("http_port", "8443")
  .option("database", "default")
  .option("table", "events")
  .option("user", "default")
  .option("password", dbutils.secrets.get(scope="clickhouse", key="password"))
  .option("ssl", "true")
  .load()

df.show()
```

</TabItem>
</Tabs>

### 데이터 쓰기 \{#writing-data-unity\}

<Tabs groupId="databricks_usage">
<TabItem value="Python" label="Python" default>

```python
# ClickHouse에 쓰기 - 테이블이 존재하지 않으면 자동으로 생성됩니다
df.write \
    .format("clickhouse") \
    .option("host", "your-clickhouse-cloud-host.clickhouse.cloud") \
    .option("protocol", "https") \
    .option("http_port", "8443") \
    .option("database", "default") \
    .option("table", "events_copy") \
    .option("user", "default") \
    .option("password", dbutils.secrets.get(scope="clickhouse", key="password")) \
    .option("ssl", "true") \
    .option("order_by", "id") \  # 필수: 새 테이블을 생성할 때 ORDER BY를 지정해야 합니다
    .option("settings.allow_nullable_key", "1") \  # ORDER BY에 널 허용 컬럼이 포함된 경우 ClickHouse Cloud에서 필수입니다
    .mode("append") \
    .save()
```

</TabItem>
<TabItem value="Scala" label="Scala">

```scala
df.write
  .format("clickhouse")
  .option("host", "your-clickhouse-cloud-host.clickhouse.cloud")
  .option("protocol", "https")
  .option("http_port", "8443")
  .option("database", "default")
  .option("table", "events_copy")
  .option("user", "default")
  .option("password", dbutils.secrets.get(scope="clickhouse", key="password"))
  .option("ssl", "true")
  .option("order_by", "id")  // 필수: 새 테이블을 생성할 때 ORDER BY를 지정해야 합니다
  .option("settings.allow_nullable_key", "1")  // ORDER BY에 널 허용 컬럼이 포함된 경우 ClickHouse Cloud에서 필수입니다
  .mode("append")
  .save()
```

</TabItem>
</Tabs>

:::note
이 예제는 Databricks에서 secret scope가 사전에 구성되어 있다고 가정합니다. 설정 방법은 Databricks [Secret 관리 설명서](https://docs.databricks.com/aws/en/security/secrets/)를 참고하십시오.
:::

## Databricks별 고려 사항 \{#considerations\}

### 액세스 모드 요구 사항 \{#access-mode\}

ClickHouse Spark Connector에는 **Dedicated**(이전 이름: Single User) 액세스 모드가 필요합니다. Unity Catalog가 활성화된 경우 **Standard**(이전 이름: Shared) 액세스 모드는 지원되지 않습니다. 이 구성에서는 Databricks가 외부 DataSource V2 커넥터 사용을 차단하기 때문입니다.

| 액세스 모드 | Unity Catalog | 지원 여부 |
|-------------|---------------|-----------|
| Dedicated (Single User) | Enabled | ✅ 예 |
| Dedicated (Single User) | Disabled | ✅ 예 |
| Standard (Shared) | Enabled | ❌ 아니요 |
| Standard (Shared) | Disabled | ✅ 예 |

### 시크릿 관리 \{#secret-management\}

Databricks 시크릿 스코프를 사용하여 ClickHouse 자격 증명 정보를 안전하게 저장합니다:

```python
# Access secrets
password = dbutils.secrets.get(scope="clickhouse", key="password")
```

설정 지침은 Databricks의 [시크릿 관리 문서](https://docs.databricks.com/aws/en/security/secrets/)를 참조하십시오.

{/* TODO: Databricks secret scopes 구성 화면 스크린샷 추가 */ }


### ClickHouse Cloud 연결 \{#clickhouse-cloud\}

Databricks에서 ClickHouse Cloud에 연결할 때는 다음을 설정하십시오.

1. **HTTPS 프로토콜**을 사용합니다 (`protocol: https`, `http_port: 8443`)
2. **SSL**을 활성화합니다 (`ssl: true`)

## 예시 \{#examples\}

### 전체 워크플로 예시 \{#workflow-example\}

<Tabs groupId="databricks_usage">
<TabItem value="Python" label="Python" default>

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col

# ClickHouse 커넥터를 사용해 Spark를 초기화합니다.
spark = SparkSession.builder \
    .config("spark.jars.packages", "com.clickhouse.spark:clickhouse-spark-runtime-3.4_2.12:0.9.0") \
    .getOrCreate()

# ClickHouse에서 데이터 읽기
df = spark.read \
    .format("clickhouse") \
    .option("host", "your-host.clickhouse.cloud") \
    .option("protocol", "https") \
    .option("http_port", "8443") \
    .option("database", "default") \
    .option("table", "source_table") \
    .option("user", "default") \
    .option("password", dbutils.secrets.get(scope="clickhouse", key="password")) \
    .option("ssl", "true") \
    .load()

# 데이터 변환
transformed_df = df.filter(col("status") == "active")

# ClickHouse에 데이터 쓰기
transformed_df.write \
    .format("clickhouse") \
    .option("host", "your-host.clickhouse.cloud") \
    .option("protocol", "https") \
    .option("http_port", "8443") \
    .option("database", "default") \
    .option("table", "target_table") \
    .option("user", "default") \
    .option("password", dbutils.secrets.get(scope="clickhouse", key="password")) \
    .option("ssl", "true") \
    .option("order_by", "id") \
    .mode("append") \
    .save()
```

</TabItem>
<TabItem value="Scala" label="Scala">

```scala
import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions.col

// ClickHouse 커넥터를 사용해 Spark를 초기화합니다.
val spark = SparkSession.builder
  .config("spark.jars.packages", "com.clickhouse.spark:clickhouse-spark-runtime-3.4_2.12:0.9.0")
  .getOrCreate()

// ClickHouse에서 데이터 읽기
val df = spark.read
  .format("clickhouse")
  .option("host", "your-host.clickhouse.cloud")
  .option("protocol", "https")
  .option("http_port", "8443")
  .option("database", "default")
  .option("table", "source_table")
  .option("user", "default")
  .option("password", dbutils.secrets.get(scope="clickhouse", key="password"))
  .option("ssl", "true")
  .load()

// 데이터 변환
val transformedDF = df.filter(col("status") === "active")

// ClickHouse에 데이터 쓰기
transformedDF.write
  .format("clickhouse")
  .option("host", "your-host.clickhouse.cloud")
  .option("protocol", "https")
  .option("http_port", "8443")
  .option("database", "default")
  .option("table", "target_table")
  .option("user", "default")
  .option("password", dbutils.secrets.get(scope="clickhouse", key="password"))
  .option("ssl", "true")
  .option("order_by", "id")
  .mode("append")
  .save()
```

</TabItem>
</Tabs>

## 관련 문서 \{#related\}

- [Spark Native Connector 가이드](/integrations/apache-spark/spark-native-connector) - 커넥터에 대한 전체 문서
- [TableProvider API 문서](/integrations/apache-spark/spark-native-connector#using-the-tableprovider-api) - 포맷 기반 접근 방식 상세 정보
- [Catalog API 문서](/integrations/apache-spark/spark-native-connector#register-the-catalog-required) - 카탈로그 기반 접근 방식 상세 정보
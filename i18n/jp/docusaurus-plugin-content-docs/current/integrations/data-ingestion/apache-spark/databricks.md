---
sidebar_label: 'Databricks'
sidebar_position: 3
slug: /integrations/data-ingestion/apache-spark/databricks
description: 'ClickHouse を Databricks と連携させる'
keywords: ['clickhouse', 'databricks', 'spark', 'unity catalog', 'data']
title: 'ClickHouse と Databricks の連携'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# ClickHouse と Databricks の統合 {#integrating-clickhouse-with-databricks}

<ClickHouseSupportedBadge/>

ClickHouse Spark コネクタは Databricks とシームレスに連携します。このガイドでは、Databricks 向けのプラットフォーム固有の設定、インストール方法、および利用パターンについて説明します。

## Databricks における API の選択 {#api-selection}

デフォルトでは Databricks は Unity Catalog を使用しており、これにより Spark カタログへの登録がブロックされます。この場合、**必ず** **TableProvider API**（フォーマットベースのアクセス）を使用する必要があります。

ただし、**No isolation shared** アクセスモードでクラスタを作成して Unity Catalog を無効化した場合は、代わりに **Catalog API** を使用できます。Catalog API は、中央集約的な設定管理とネイティブな Spark SQL との統合を提供します。

| Unity Catalog の状態 | 推奨される API | 備考 |
|---------------------|------------------|-------|
| **有効**（デフォルト） | TableProvider API（フォーマットベース） | Unity Catalog が Spark カタログへの登録をブロックする |
| **無効**（No isolation shared） | Catalog API | 「No isolation shared」アクセスモードのクラスタが必要 |

## Databricks へのインストール {#installation}

### オプション 1: Databricks UI を使用して JAR をアップロードする {#installation-ui}

1. ランタイム JAR をビルドするか、[ダウンロード](https://repo1.maven.org/maven2/com/clickhouse/spark/)します。
   ```bash
   clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar
   ```

2. JAR を Databricks ワークスペースにアップロードします:
   - **Workspace** に移動し、目的のフォルダに移動します
   - **Upload** をクリックし、JAR ファイルを選択します
   - JAR はワークスペース内に保存されます

3. クラスターにライブラリをインストールします:
   - **Compute** に移動し、対象のクラスターを選択します
   - **Libraries** タブをクリックします
   - **Install New** をクリックします
   - **DBFS** または **Workspace** を選択し、アップロードした JAR ファイルに移動します
   - **Install** をクリックします

<Image img={require('@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-libraries-tab.png')} alt="Databricks の Libraries タブ" />

<Image img={require('@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-install-from-volume.png')} alt="ワークスペースのボリュームからライブラリをインストールする" />

4. ライブラリを読み込むため、クラスターを再起動します

### オプション 2: Databricks CLI を使用してインストールする {#installation-cli}

```bash
# Upload JAR to DBFS
databricks fs cp clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar \
  dbfs:/FileStore/jars/

# Install on cluster
databricks libraries install \
  --cluster-id <your-cluster-id> \
  --jar dbfs:/FileStore/jars/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar
```


### オプション 3: Maven Coordinates（推奨） {#installation-maven}

1. Databricks ワークスペースに移動します:
   * **Compute** に移動し、クラスタを選択します
   * **Libraries** タブをクリックします
   * **Install New** をクリックします
   * **Maven** タブを選択します

2. Maven coordinates を追加します:

```text
com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}
```

&lt;Image img=&#123;require(&#39;@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-maven-tab.png&#39;)&#125; alt=&quot;Databricks Maven ライブラリ構成&quot; /&gt;

3. **Install** をクリックし、ライブラリを読み込むためにクラスターを再起動します


## TableProvider API の使用 {#tableprovider-api}

Unity Catalog が有効な場合（既定）、Unity Catalog が Spark カタログへの登録をブロックするため、**必ず** TableProvider API（フォーマットベースのアクセス）を使用する必要があります。クラスターで "No isolation shared" アクセスモードを使用して Unity Catalog を無効にしている場合は、代わりに [Catalog API](/docs/integrations/data-ingestion/apache-spark/spark-native-connector#register-the-catalog-required) を使用できます。

### データの読み込み {#reading-data-table-provider}

<Tabs groupId="databricks_usage">
<TabItem value="Python" label="Python" default>

```python
# Read from ClickHouse using TableProvider API
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

# Schema is automatically inferred
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


### データの書き込み {#writing-data-unity}

<Tabs groupId="databricks_usage">
<TabItem value="Python" label="Python" default>

```python
# Write to ClickHouse - table will be created automatically if it doesn't exist
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
    .option("order_by", "id") \  # Required: specify ORDER BY when creating a new table
    .option("settings.allow_nullable_key", "1") \  # Required for ClickHouse Cloud if ORDER BY has nullable columns
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
  .option("order_by", "id")  // Required: specify ORDER BY when creating a new table
  .option("settings.allow_nullable_key", "1")  // Required for ClickHouse Cloud if ORDER BY has nullable columns
  .mode("append")
  .save()
```

</TabItem>
</Tabs>

:::note
この例では、Databricks でシークレットスコープがあらかじめ設定されていることを前提としています。設定手順については、Databricks の [Secret management documentation](https://docs.databricks.com/aws/en/security/secrets/) を参照してください。
:::


## Databricks 固有の注意事項 {#considerations}

### シークレット管理 {#secret-management}

ClickHouse の認証情報を安全に保存するには、Databricks のシークレットスコープを使用します。

```python
# Access secrets
password = dbutils.secrets.get(scope="clickhouse", key="password")
```

セットアップ方法については、Databricks の[シークレット管理ドキュメント](https://docs.databricks.com/aws/en/security/secrets/)を参照してください。

<!-- TODO: Databricks のシークレットスコープ構成のスクリーンショットを追加する -->


### ClickHouse Cloud 接続 {#clickhouse-cloud}

Databricks から ClickHouse Cloud に接続する場合は、次のように設定します。

1. **HTTPS プロトコル** を使用します（`protocol: https`, `http_port: 8443`）
2. **SSL** を有効にします（`ssl: true`）

## 例 {#examples}

### ワークフロー全体の例 {#workflow-example}

<Tabs groupId="databricks_usage">
<TabItem value="Python" label="Python" default>

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col

# Initialize Spark with ClickHouse connector
spark = SparkSession.builder \
    .config("spark.jars.packages", "com.clickhouse.spark:clickhouse-spark-runtime-3.4_2.12:0.9.0") \
    .getOrCreate()

# Read from ClickHouse
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

# Transform data
transformed_df = df.filter(col("status") == "active")

# Write to ClickHouse
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

// Initialize Spark with ClickHouse connector
val spark = SparkSession.builder
  .config("spark.jars.packages", "com.clickhouse.spark:clickhouse-spark-runtime-3.4_2.12:0.9.0")
  .getOrCreate()

// Read from ClickHouse
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

// Transform data
val transformedDF = df.filter(col("status") === "active")

// Write to ClickHouse
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


## 関連ドキュメント {#related}

- [Spark ネイティブコネクターガイド](/docs/integrations/data-ingestion/apache-spark/spark-native-connector) - コネクターに関する詳細なドキュメント
- [TableProvider API ドキュメント](/docs/integrations/data-ingestion/apache-spark/spark-native-connector#using-the-tableprovider-api-format-based-access) - フォーマットベースのアクセスに関する詳細
- [Catalog API ドキュメント](/docs/integrations/data-ingestion/apache-spark/spark-native-connector#register-the-catalog-required) - カタログベースのアクセスに関する詳細
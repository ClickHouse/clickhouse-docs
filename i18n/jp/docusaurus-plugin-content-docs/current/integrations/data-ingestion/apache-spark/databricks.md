---
sidebar_label: 'Databricks'
sidebar_position: 3
slug: /integrations/data-ingestion/apache-spark/databricks
description: 'ClickHouse を Databricks と連携する'
keywords: ['clickhouse', 'databricks', 'spark', 'unity catalog', 'data']
title: 'ClickHouse と Databricks の連携'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# ClickHouse と Databricks の統合 \{#integrating-clickhouse-with-databricks\}

<ClickHouseSupportedBadge/>

ClickHouse Spark コネクタは Databricks とシームレスに連携します。このガイドでは、Databricks 向けのプラットフォーム固有のセットアップ、インストール手順、および利用方法のパターンについて説明します。

## Databricks 向けの API 選択 \{#api-selection\}

デフォルトでは、Databricks は Unity Catalog を使用しており、これによって Spark カタログの登録がブロックされます。この場合は、**必ず** **TableProvider API**（フォーマットベースのアクセス）を使用する必要があります。

一方、**No isolation shared** アクセスモードでクラスターを作成して Unity Catalog を無効化した場合は、代わりに **Catalog API** を使用できます。Catalog API は集中管理された構成とネイティブな Spark SQL 連携を提供します。

| Unity Catalog の状態 | 推奨 API | 備考 |
|---------------------|------------------|-------|
| **有効**（デフォルト） | TableProvider API（フォーマットベース） | Unity Catalog により Spark カタログの登録がブロックされる |
| **無効**（No isolation shared） | Catalog API | "No isolation shared" アクセスモードのクラスターが必要 |

## Databricks でのインストール \{#installation\}

### オプション 1: Databricks UI から JAR をアップロードする \{#installation-ui\}

1. ランタイム JAR をビルドするか、[ダウンロード](https://repo1.maven.org/maven2/com/clickhouse/spark/) します:
   ```bash
   clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar
   ```

2. Databricks ワークスペースに JAR をアップロードします:
   - **Workspace** に移動し、目的のフォルダに移動します
   - **Upload** をクリックし、JAR ファイルを選択します
   - JAR はワークスペース内に保存されます

3. クラスターにライブラリをインストールします:
   - **Compute** に移動し、対象のクラスターを選択します
   - **Libraries** タブをクリックします
   - **Install New** をクリックします
   - **DBFS** または **Workspace** を選択し、アップロードした JAR ファイルを指定します
   - **Install** をクリックします

<Image img={require('@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-libraries-tab.png')} alt="Databricks の Libraries タブ" />

<Image img={require('@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-install-from-volume.png')} alt="ワークスペースボリュームからライブラリをインストール" />

4. ライブラリを読み込むためにクラスターを再起動します

### オプション 2: Databricks CLI を使用してインストールする \{#installation-cli\}

```bash
# Upload JAR to DBFS
databricks fs cp clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar \
  dbfs:/FileStore/jars/

# Install on cluster
databricks libraries install \
  --cluster-id <your-cluster-id> \
  --jar dbfs:/FileStore/jars/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar
```


### オプション 3: Maven Coordinates（推奨） \{#installation-maven\}

1. Databricks ワークスペースに移動します:
   * **Compute** を開き、クラスタを選択します
   * **Libraries** タブをクリックします
   * **Install New** をクリックします
   * **Maven** タブを選択します

2. Maven の座標を追加します:

```text
com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}
```

<Image img={require('@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-maven-tab.png')} alt="Databricks の Maven ライブラリ設定" />

3. **Install** をクリックし、ライブラリを有効にするためにクラスタを再起動します


## TableProvider API を使用する \{#tableprovider-api\}

Unity Catalog が有効な場合（デフォルト）には、Unity Catalog によって Spark カタログへの登録がブロックされるため、**必ず** TableProvider API（フォーマットベースのアクセス）を使用する必要があります。クラスターで "No isolation shared" アクセスモードを使用して Unity Catalog を無効化している場合は、代わりに [Catalog API](/integrations/apache-spark/spark-native-connector#register-the-catalog-required) を使用できます。

### データの読み込み \{#reading-data-table-provider\}

<Tabs groupId="databricks_usage">
<TabItem value="Python" label="Python" default>

```python
# TableProvider API を使用して ClickHouse から読み込む
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

# スキーマは自動的に推論されます
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

### データの書き込み \{#writing-data-unity\}

<Tabs groupId="databricks_usage">
<TabItem value="Python" label="Python" default>

```python
# ClickHouse に書き込み - テーブルが存在しない場合は自動的に作成されます
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
    .option("order_by", "id") \  # 必須: 新しいテーブルを作成する際に ORDER BY を指定します
    .option("settings.allow_nullable_key", "1") \  # ORDER BY 句に Nullable カラムが含まれる場合、ClickHouse Cloud では必須です
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
  .option("order_by", "id")  // 必須: 新しいテーブルを作成する際に ORDER BY を指定します
  .option("settings.allow_nullable_key", "1")  // ORDER BY 句に Nullable カラムが含まれる場合、ClickHouse Cloud では必須です
  .mode("append")
  .save()
```

</TabItem>
</Tabs>

:::note
この例では、Databricks でシークレットスコープが事前に構成されていることを前提としています。セットアップ方法については、Databricks の [Secret management documentation](https://docs.databricks.com/aws/en/security/secrets/) を参照してください。
:::

## Databricks 特有の考慮事項 \{#considerations\}

### シークレット管理 \{#secret-management\}

Databricks のシークレットスコープを利用して、ClickHouse の認証情報を安全に格納します。

```python
# Access secrets
password = dbutils.secrets.get(scope="clickhouse", key="password")
```

セットアップ手順については、Databricks の[シークレット管理に関するドキュメント](https://docs.databricks.com/aws/en/security/secrets/)を参照してください。

{/* TODO: Databricks のシークレットスコープ構成のスクリーンショットを追加 */ }


### ClickHouse Cloud への接続 \{#clickhouse-cloud\}

Databricks から ClickHouse Cloud に接続する場合には:

1. **HTTPS プロトコル** を使用します（`protocol: https`、`http_port: 8443`）
2. **SSL** を有効にします（`ssl: true`）

## 例 \{#examples\}

### ワークフロー全体の例 \{#workflow-example\}

<Tabs groupId="databricks_usage">
<TabItem value="Python" label="Python" default>

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col

# ClickHouse コネクタを使用して Spark を初期化
spark = SparkSession.builder \
    .config("spark.jars.packages", "com.clickhouse.spark:clickhouse-spark-runtime-3.4_2.12:0.9.0") \
    .getOrCreate()

# ClickHouse から読み込む
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

# データを変換する
transformed_df = df.filter(col("status") == "active")

# ClickHouse に書き込む
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

// ClickHouse コネクタを使用して Spark を初期化
val spark = SparkSession.builder
  .config("spark.jars.packages", "com.clickhouse.spark:clickhouse-spark-runtime-3.4_2.12:0.9.0")
  .getOrCreate()

// ClickHouse から読み込む
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

// データを変換する
val transformedDF = df.filter(col("status") === "active")

// ClickHouse に書き込む
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

## 関連ドキュメント \{#related\}

- [Spark ネイティブコネクタ ガイド](/integrations/apache-spark/spark-native-connector) - コネクタに関する包括的なドキュメント
- [TableProvider API ドキュメント](/integrations/apache-spark/spark-native-connector#using-the-tableprovider-api) - フォーマットベースのアクセス方法の詳細
- [Catalog API ドキュメント](/integrations/apache-spark/spark-native-connector#register-the-catalog-required) - カタログベースのアクセス方法の詳細
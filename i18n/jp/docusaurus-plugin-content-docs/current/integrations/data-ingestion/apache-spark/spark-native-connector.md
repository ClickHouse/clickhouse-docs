---
sidebar_label: 'Spark ネイティブコネクタ'
sidebar_position: 2
slug: /integrations/apache-spark/spark-native-connector
description: 'ClickHouse と連携する Apache Spark 入門'
keywords: ['clickhouse', 'Apache Spark', '移行', 'データ']
title: 'Spark コネクタ'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Spark connector {#spark-connector}

<ClickHouseSupportedBadge/>

このコネクタは、高度なパーティショニングや述語プッシュダウンなど、ClickHouse 固有の最適化を活用して、
クエリのパフォーマンスとデータ処理を向上させます。
このコネクタは [ClickHouse の公式 JDBC コネクタ](https://github.com/ClickHouse/clickhouse-java) をベースとしており、
独自のカタログを管理します。

Spark 3.0 以前は、Spark には組み込みのカタログという概念がなかったため、ユーザーは通常、
Hive Metastore や AWS Glue などの外部カタログシステムに依存していました。
これらの外部ソリューションを使用する場合、ユーザーは Spark でテーブルにアクセスする前に、
データソースのテーブルを手動で登録する必要がありました。
しかし、Spark 3.0 でカタログの概念が導入されたことで、カタログプラグインを登録することにより、
Spark がテーブルを自動的に検出できるようになりました。

Spark のデフォルトのカタログは `spark_catalog` であり、テーブルは `{catalog name}.{database}.{table}` という形式で識別されます。
新しいカタログ機能により、1 つの Spark アプリケーション内で複数のカタログを追加して利用することが可能になりました。

## Catalog API と TableProvider API の選択 {#choosing-between-apis}

ClickHouse の Spark コネクタは、**Catalog API** と **TableProvider API**（フォーマットベースのアクセス方式）の 2 つのアクセスパターンをサポートします。両者の違いを理解しておくことで、ユースケースに応じて適切なアプローチを選択できます。

### Catalog API と TableProvider API の比較 {#catalog-vs-tableprovider-comparison}

| 機能 | Catalog API | TableProvider API |
|---------|-------------|-------------------|
| **設定方法** | Spark の設定による一元管理 | オプションによる操作ごとの指定 |
| **テーブル検出** | Catalog による自動検出 | テーブルを明示的に指定 |
| **DDL 操作** | 完全サポート (CREATE, DROP, ALTER) | 制限あり (テーブルの自動作成のみ) |
| **Spark SQL 連携** | ネイティブ (`clickhouse.database.table`) | フォーマットの指定が必要 |
| **ユースケース** | 設定を集中管理した長期的かつ安定した接続 | アドホック、動的、一時的なアクセス |

<TOCInline toc={toc}></TOCInline>

## 前提条件 {#requirements}

- Java 8 または 17（Spark 4.0 には Java 17 以上が必須）
- Scala 2.12 または 2.13（Spark 4.0 は Scala 2.13 のみサポート）
- Apache Spark 3.3、3.4、3.5、または 4.0

## 互換性マトリックス {#compatibility-matrix}

| バージョン | 互換性のある Spark のバージョン | ClickHouse JDBC バージョン |
|---------|---------------------------|-------------------------|
| main    | Spark 3.3, 3.4, 3.5, 4.0  | 0.9.4                   |
| 0.9.0   | Spark 3.3, 3.4, 3.5, 4.0  | 0.9.4                   |
| 0.8.1   | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.7.3   | Spark 3.3, 3.4            | 0.4.6                   |
| 0.6.0   | Spark 3.3                 | 0.3.2-patch11           |
| 0.5.0   | Spark 3.2, 3.3            | 0.3.2-patch11           |
| 0.4.0   | Spark 3.2, 3.3            | 依存しない               |
| 0.3.0   | Spark 3.2, 3.3            | 依存しない               |
| 0.2.1   | Spark 3.2                 | 依存しない               |
| 0.1.2   | Spark 3.2                 | 依存しない               |

## インストールとセットアップ {#installation--setup}

ClickHouse を Spark と統合するには、プロジェクト構成に応じて複数のインストール方法があります。
Maven の `pom.xml` や SBT の `build.sbt` など、プロジェクトのビルドファイルに ClickHouse Spark コネクタを依存関係として直接追加できます。
あるいは、必要な JAR ファイルを `$SPARK_HOME/jars/` ディレクトリに配置するか、`spark-submit` コマンドで `--jars` フラグを使用して Spark のオプションとして直接渡すこともできます。
どちらの方法でも、Spark 環境で ClickHouse コネクタを利用できるようになります。

### 依存関係として追加する {#import-as-a-dependency}

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

SNAPSHOT バージョンを使用したい場合は、次のリポジトリを追加してください。

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

SNAPSHOT バージョンを使用する場合は、以下のリポジトリを追加してください。

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

Spark のシェルオプション（Spark SQL CLI、Spark Shell CLI、Spark Submit コマンド）を使用する場合、必要な JAR ファイルを引数として渡すことで依存関係を登録できます。

```text
$SPARK_HOME/bin/spark-sql \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

Spark クライアントノードに JAR ファイルをコピーせずに済ませたい場合は、代わりに次の方法を利用できます。

```text
  --repositories https://{maven-central-mirror or private-nexus-repo} \
  --packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}
```

Note: SQL のみを利用するユースケースでは、本番利用には [Apache Kyuubi](https://github.com/apache/kyuubi) の使用を推奨します。

</TabItem>
</Tabs>


### ライブラリをダウンロードする {#download-the-library}

バイナリ JAR のファイル名パターンは次のとおりです。

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

すべての利用可能なリリース済み JAR ファイルは
[Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/spark/) で確認でき、
すべての日次ビルド SNAPSHOT JAR ファイルは [Sonatype OSS Snapshots Repository](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/) で確認できます。

:::important
コネクタは [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)
および [clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client) に依存しており、
これらは両方とも clickhouse-jdbc:all にバンドルされているため、
classifier が「all」の [clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)
を含めることが重要です。
代わりに、JDBC パッケージ一式を使用したくない場合は、
[clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)
と [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client) を個別に追加することもできます。

いずれの場合も、[Compatibility Matrix](#compatibility-matrix) に従って
パッケージのバージョンに互換性があることを確認してください。
:::


## カタログを登録する（必須） {#register-the-catalog-required}

ClickHouse テーブルにアクセスするには、次の設定を用いて新しい Spark カタログを構成する必要があります。

| プロパティ                                   | 値                                       | デフォルト値    | 必須     |
|----------------------------------------------|------------------------------------------|-----------------|----------|
| `spark.sql.catalog.<catalog_name>`           | `com.clickhouse.spark.ClickHouseCatalog` | N/A             | はい     |
| `spark.sql.catalog.<catalog_name>.host`      | `<clickhouse_host>`                      | `localhost`     | いいえ   |
| `spark.sql.catalog.<catalog_name>.protocol`  | `http`                                   | `http`          | いいえ   |
| `spark.sql.catalog.<catalog_name>.http_port` | `<clickhouse_port>`                      | `8123`          | いいえ   |
| `spark.sql.catalog.<catalog_name>.user`      | `<clickhouse_username>`                  | `default`       | いいえ   |
| `spark.sql.catalog.<catalog_name>.password`  | `<clickhouse_password>`                  | (空文字列)      | いいえ   |
| `spark.sql.catalog.<catalog_name>.database`  | `<database>`                             | `default`       | いいえ   |
| `spark.<catalog_name>.write.format`          | `json`                                   | `arrow`         | いいえ   |

これらの設定は、次のいずれかの方法で指定できます。

* `spark-defaults.conf` を編集または作成する。
* 設定を `spark-submit` コマンド（または `spark-shell` / `spark-sql` の CLI コマンド）に渡す。
* コンテキストを初期化する際に設定を追加する。

:::important
ClickHouse クラスターで作業する場合は、各インスタンスごとに一意のカタログ名を設定する必要があります。
例：

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

このように設定することで、Spark SQL からは、clickhouse1 のテーブル `<ck_db>.<ck_table>` に
`clickhouse1.<ck_db>.<ck_table>` で、clickhouse2 のテーブル `<ck_db>.<ck_table>` には `clickhouse2.<ck_db>.<ck_table>` でアクセスできるようになります。

:::

## TableProvider API の使用（フォーマットベースのアクセス） {#using-the-tableprovider-api}

カタログベースのアプローチに加えて、ClickHouse Spark コネクタは TableProvider API を通じて、**フォーマットベースのアクセスパターン**もサポートしています。

### フォーマットベースの読み取りの例 {#format-based-read}

<Tabs groupId="spark_apis">
<TabItem value="Python" label="Python" default>

```python
from pyspark.sql import SparkSession

spark = SparkSession.builder.getOrCreate()

# Read from ClickHouse using format API
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


### フォーマットベースの書き込み例 {#format-based-write}

<Tabs groupId="spark_apis">
<TabItem value="Python" label="Python" default>

```python
# Write to ClickHouse using format API
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


### TableProvider の機能 {#tableprovider-features}

TableProvider API では、次のような強力な機能が利用できます。

#### テーブルの自動作成 {#automatic-table-creation}

存在しないテーブルに書き込むと、コネクタは適切なスキーマでテーブルを自動的に作成します。コネクタはいくつかのインテリジェントなデフォルトを提供します。

* **Engine**: 指定がない場合は `MergeTree()` がデフォルトになります。`engine` オプションを使用して別のエンジンを指定できます（例: `ReplacingMergeTree()`, `SummingMergeTree()` など）。
* **ORDER BY**: **必須** - 新しいテーブルを作成する際には `order_by` オプションを明示的に指定する必要があります。コネクタは、指定されたすべてのカラムがスキーマ内に存在することを検証します。
* **Nullable キーのサポート**: ORDER BY に Nullable なカラムが含まれている場合、自動的に `settings.allow_nullable_key=1` が追加されます。

<Tabs groupId="spark_apis">
<TabItem value="Python" label="Python" default>

```python
# Table will be created automatically with explicit ORDER BY (required)
df.write \
    .format("clickhouse") \
    .option("host", "your-host") \
    .option("database", "default") \
    .option("table", "new_table") \
    .option("order_by", "id") \
    .mode("append") \
    .save()

# Specify table creation options with custom engine
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
// Table will be created automatically with explicit ORDER BY (required)
df.write
  .format("clickhouse")
  .option("host", "your-host")
  .option("database", "default")
  .option("table", "new_table")
  .option("order_by", "id")
  .mode("append")
  .save()

// With explicit table creation options and custom engine
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
// Table will be created automatically with explicit ORDER BY (required)
df.write()
    .format("clickhouse")
    .option("host", "your-host")
    .option("database", "default")
    .option("table", "new_table")
    .option("order_by", "id")
    .mode("append")
    .save();

// With explicit table creation options and custom engine
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
**ORDER BY の必須指定**: TableProvider API 経由で新しいテーブルを作成する場合、`order_by` オプションは**必須**です。ORDER BY 句に使用するカラムを明示的に指定する必要があります。コネクタは、指定されたすべてのカラムがスキーマ内に存在することを検証し、いずれかのカラムが存在しない場合はエラーを送出します。

**エンジンの選択**: デフォルトのエンジンは `MergeTree()` ですが、`engine` オプションを使用して任意の ClickHouse テーブルエンジンを指定できます（例: `ReplacingMergeTree()`, `SummingMergeTree()`, `AggregatingMergeTree()` など）。
:::


### TableProvider 接続オプション {#tableprovider-connection-options}

フォーマットベースの API を使用する場合、次の接続オプションが利用できます。

#### 接続オプション {#connection-options}

| Option       | Description                                      | Default Value  | Required   |
|--------------|--------------------------------------------------|----------------|------------|
| `host`       | ClickHouse サーバーのホスト名                    | `localhost`    | Yes        |
| `protocol`   | 接続プロトコル（`http` または `https`）          | `http`         | No         |
| `http_port`  | HTTP/HTTPS のポート                              | `8123`         | No         |
| `database`   | データベース名                                   | `default`      | Yes        |
| `table`      | テーブル名                                       | N/A            | Yes        |
| `user`       | 認証に使用するユーザー名                         | `default`      | No         |
| `password`   | 認証に使用するパスワード                         | (空文字列)     | No         |
| `ssl`        | SSL 接続を有効にするかどうか                     | `false`        | No         |
| `ssl_mode`   | SSL モード（`NONE`、`STRICT` など）              | `STRICT`       | No         |
| `timezone`   | 日付/時刻処理に使用するタイムゾーン              | `server`       | No         |

#### テーブル作成オプション {#table-creation-options}

これらのオプションは、テーブルが存在せず、新規に作成する必要がある場合に使用します:

| Option                      | Description                                                                 | Default Value     | Required |
|-----------------------------|-----------------------------------------------------------------------------|-------------------|----------|
| `order_by`                  | ORDER BY 句に使用するカラム。複数カラムの場合はカンマ区切り                        | N/A               | **Yes**  |
| `engine`                    | ClickHouse のテーブルエンジン（例: `MergeTree()`, `ReplacingMergeTree()`, `SummingMergeTree()` など） | `MergeTree()`     | No       |
| `settings.allow_nullable_key` | ORDER BY で Nullable なキーを有効化（ClickHouse Cloud 向け）              | Auto-detected**   | No       |
| `settings.<key>`            | 任意の ClickHouse テーブル設定                                             | N/A               | No       |
| `cluster`                   | 分散テーブル用のクラスタ名                                                 | N/A               | No       |
| `clickhouse.column.<name>.variant_types` | Variant カラムに対する ClickHouse 型のカンマ区切りリスト（例: `String, Int64, Bool, JSON`）。型名は大文字・小文字を区別します。カンマの後のスペースは任意です。 | N/A | No |

\* 新しいテーブルを作成する場合、`order_by` オプションは必須です。指定したすべてのカラムがスキーマ内に存在している必要があります。  
\** ORDER BY に Nullable カラムが含まれており、明示的に指定されていない場合は、自動的に `1` に設定されます。

:::tip
**ベストプラクティス**: ClickHouse Cloud では、ORDER BY カラムが Nullable になる可能性がある場合、明示的に `settings.allow_nullable_key=1` を設定してください。ClickHouse Cloud ではこの設定が必須です。
:::

#### 書き込みモード {#writing-modes}

Spark コネクタ（TableProvider API と Catalog API の両方）は、次の Spark 書き込みモードをサポートします。

* **`append`**: 既存テーブルにデータを追加
* **`overwrite`**: テーブル内のすべてのデータを置き換え（テーブルをトランケート）

:::important
**パーティション単位の上書きは未サポート**: このコネクタは現時点ではパーティション単位の上書き操作（例: `partitionBy` を伴う `overwrite` モード）をサポートしていません。この機能は現在開発中です。この機能の進捗については [GitHub issue #34](https://github.com/ClickHouse/spark-clickhouse-connector/issues/34) を参照してください。
:::

<Tabs groupId="spark_apis">
<TabItem value="Python" label="Python" default>

```python
# Overwrite mode (truncates table first)
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
// Overwrite mode (truncates table first)
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
// Overwrite mode (truncates table first)
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


## ClickHouse オプションの設定 {#configuring-clickhouse-options}

Catalog API と TableProvider API の両方で、ClickHouse 固有のオプション（コネクタのオプションではない）を設定できます。これらはテーブル作成時やクエリ実行時に ClickHouse へそのまま渡されます。

ClickHouse オプションを使用すると、`allow_nullable_key`、`index_granularity` などの ClickHouse 固有の設定や、その他のテーブル単位またはクエリ単位の設定を行うことができます。これらは、ClickHouse への接続方法を制御するコネクタのオプション（`host`、`database`、`table` など）とは異なります。

### TableProvider API の使用 {#using-tableprovider-api-options}

TableProvider API を使用する場合は、`settings.&lt;key&gt;` 形式でオプションを指定します。

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


### Catalog API の使用 {#using-catalog-api-options}

Catalog API を使用する場合は、Spark 設定で `spark.sql.catalog.<catalog_name>.option.<key>` 形式を指定します。

```text
spark.sql.catalog.clickhouse.option.allow_nullable_key 1
spark.sql.catalog.clickhouse.option.index_granularity 8192
```

または Spark SQL でテーブルを作成する際に設定します：

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


## ClickHouse Cloud の設定 {#clickhouse-cloud-settings}

[ClickHouse Cloud](https://clickhouse.com) に接続する際は、SSL を有効にし、適切な SSL モードを設定してください。例えば、以下のとおりです。

```text
spark.sql.catalog.clickhouse.option.ssl        true
spark.sql.catalog.clickhouse.option.ssl_mode   NONE
```


## データの読み取り {#read-data}

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


## データを書き込む {#write-data}

:::important
**パーティションの上書きはサポートされていません**：Catalog API は現在、パーティション単位の上書き操作（例：`partitionBy` を伴う `overwrite` モード）をサポートしていません。この機能は開発中です。進捗状況については、[GitHub issue #34](https://github.com/ClickHouse/spark-clickhouse-connector/issues/34) を参照してください。
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

## DDL 操作 {#ddl-operations}

Spark SQL を使用して ClickHouse インスタンスに対して DDL 操作を実行でき、その変更はすべて即座に
ClickHouse に反映・永続化されます。
Spark SQL では、ClickHouse とまったく同じ構文でクエリを記述できるため、
たとえば CREATE TABLE や TRUNCATE などのコマンドを変更なしでそのまま実行できます。

:::note
Spark SQL を使用する場合、一度に実行できるステートメントは 1 つだけです。
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

上記の例は Spark SQL のクエリを示しており、Java、Scala、PySpark、シェルなど、いずれの API からでもアプリケーション内で実行できます。


## VariantType の利用 {#working-with-varianttype}

:::note
VariantType のサポートは Spark 4.0 以降で利用可能であり、実験的な JSON/Variant 型が有効化された ClickHouse 25.3 以降が必要です。
:::

このコネクタは、半構造化データを扱うために Spark の `VariantType` をサポートします。VariantType は ClickHouse の `JSON` および `Variant` 型にマッピングされ、柔軟なスキーマのデータを効率的に保存およびクエリ実行できます。

:::note
このセクションでは、特に VariantType のマッピングと使用方法に焦点を当てます。サポートされているすべてのデータ型の概要については、[Supported data types](#supported-data-types) セクションを参照してください。
:::

### ClickHouse 型マッピング {#clickhouse-type-mapping}

| ClickHouse 型 | Spark 型 | 説明 |
|----------------|------------|-------------|
| `JSON` | `VariantType` | JSON オブジェクトのみを格納します（`{` で始まる必要があります） |
| `Variant(T1, T2, ...)` | `VariantType` | プリミティブ型、配列、JSON など複数の型を格納します |

### VariantType データの読み取り {#reading-varianttype-data}

ClickHouse から読み取る際、`JSON` および `Variant` カラムは自動的に Spark の `VariantType` にマッピングされます。

<Tabs groupId="spark_apis">
<TabItem value="Scala" label="Scala" default>

```scala
// Read JSON column as VariantType
val df = spark.sql("SELECT id, data FROM clickhouse.default.json_table")

// Access variant data
df.show()

// Convert variant to JSON string for inspection
import org.apache.spark.sql.functions._
df.select(
  col("id"),
  to_json(col("data")).as("data_json")
).show()
```

</TabItem>
<TabItem value="Python" label="Python">

```python
# Read JSON column as VariantType
df = spark.sql("SELECT id, data FROM clickhouse.default.json_table")

# Access variant data
df.show()

# Convert variant to JSON string for inspection
from pyspark.sql.functions import to_json
df.select(
    "id",
    to_json("data").alias("data_json")
).show()
```

</TabItem>
<TabItem value="Java" label="Java">

```java
// Read JSON column as VariantType
Dataset<Row> df = spark.sql("SELECT id, data FROM clickhouse.default.json_table");

// Access variant data
df.show();

// Convert variant to JSON string for inspection
import static org.apache.spark.sql.functions.*;
df.select(
    col("id"),
    to_json(col("data")).as("data_json")
).show();
```

</TabItem>
</Tabs>


### VariantType データの書き込み {#writing-varianttype-data}

VariantType データは、JSON 型または Variant カラム型を使用して ClickHouse に書き込めます。

<Tabs groupId="spark_apis">
<TabItem value="Scala" label="Scala" default>

```scala
import org.apache.spark.sql.functions._

// Create DataFrame with JSON data
val jsonData = Seq(
  (1, """{"name": "Alice", "age": 30}"""),
  (2, """{"name": "Bob", "age": 25}"""),
  (3, """{"name": "Charlie", "city": "NYC"}""")
).toDF("id", "json_string")

// Parse JSON strings to VariantType
val variantDF = jsonData.select(
  col("id"),
  parse_json(col("json_string")).as("data")
)

// Write to ClickHouse with JSON type (JSON objects only)
variantDF.writeTo("clickhouse.default.user_data").create()

// Or specify Variant with multiple types
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

# Create DataFrame with JSON data
json_data = [
    (1, '{"name": "Alice", "age": 30}'),
    (2, '{"name": "Bob", "age": 25}'),
    (3, '{"name": "Charlie", "city": "NYC"}')
]
df = spark.createDataFrame(json_data, ["id", "json_string"])

# Parse JSON strings to VariantType
variant_df = df.select(
    "id",
    parse_json("json_string").alias("data")
)

# Write to ClickHouse with JSON type
variant_df.writeTo("clickhouse.default.user_data").create()

# Or specify Variant with multiple types
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

// Create DataFrame with JSON data
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

// Parse JSON strings to VariantType
Dataset<Row> variantDF = jsonDF.select(
    col("id"),
    parse_json(col("json_string")).as("data")
);

// Write to ClickHouse with JSON type (JSON objects only)
variantDF.writeTo("clickhouse.default.user_data").create();

// Or specify Variant with multiple types
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


### Spark SQL で VariantType テーブルを作成する {#creating-varianttype-tables-spark-sql}

Spark SQL の DDL を使用して VariantType テーブルを作成できます。

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


### VariantType の設定 {#configuring-variant-types}

VariantType カラムを持つテーブルを作成する際、使用する ClickHouse のデータ型を指定できます。

#### JSON 型 (デフォルト) {#json-type-default}

`variant_types` プロパティが指定されていない場合、カラムはデフォルトで ClickHouse の `JSON` 型となり、JSON オブジェクトのみを受け入れます。

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

これにより、次の ClickHouse クエリが生成されます。

```sql
CREATE TABLE json_table (id Int32, data JSON) ENGINE = MergeTree() ORDER BY id
```


#### 複数の型を持つ VariantType {#variant-type-multiple-types}

プリミティブ型、配列、JSON オブジェクトをサポートするには、`variant_types` プロパティでそれぞれの型を指定します。

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

これにより、次のような ClickHouse クエリが生成されます。

```sql
CREATE TABLE flexible_data (
  id Int32, 
  data Variant(String, Int64, Float64, Bool, Array(String), JSON)
) ENGINE = MergeTree() ORDER BY id
```


### サポートされている Variant 型 {#supported-variant-types}

`Variant()` で使用できる ClickHouse の型は次のとおりです。

- **プリミティブ型**: `String`, `Int8`, `Int16`, `Int32`, `Int64`, `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Float32`, `Float64`, `Bool`
- **配列**: `Array(T)`。T は、ネストされた配列を含むサポート対象の任意の型
- **JSON**: `JSON`。JSON オブジェクトを格納するための型

### 読み取りフォーマットの設定 {#read-format-configuration}

デフォルトでは、JSON と Variant のカラムは `VariantType` として読み取られます。この動作をオーバーライドして、文字列として読み取ることもできます。

<Tabs groupId="spark_apis">
<TabItem value="Scala" label="Scala" default>

```scala
// Read JSON/Variant as strings instead of VariantType
spark.conf.set("spark.clickhouse.read.jsonAs", "string")

val df = spark.sql("SELECT id, data FROM clickhouse.default.json_table")
// data column will be StringType containing JSON strings
```

</TabItem>
<TabItem value="Python" label="Python">

```python
# Read JSON/Variant as strings instead of VariantType
spark.conf.set("spark.clickhouse.read.jsonAs", "string")

df = spark.sql("SELECT id, data FROM clickhouse.default.json_table")
# data column will be StringType containing JSON strings
```

</TabItem>
<TabItem value="Java" label="Java">

```java
// Read JSON/Variant as strings instead of VariantType
spark.conf().set("spark.clickhouse.read.jsonAs", "string");

Dataset<Row> df = spark.sql("SELECT id, data FROM clickhouse.default.json_table");
// data column will be StringType containing JSON strings
```

</TabItem>
</Tabs>


### 書き込みフォーマットのサポート {#write-format-support}

VariantType の書き込みサポートはフォーマットごとに異なります:

| Format | サポート状況 | 備考                                                                                                                                             |
| ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| JSON   | ✅ 完全   | `JSON` 型と `Variant` 型の両方をサポートします。VariantType データにはこのフォーマットの使用を推奨します                                                                            |
| Arrow  | ⚠️ 一部  | ClickHouse の `JSON` 型への書き込みをサポートします。ClickHouse の `Variant` 型はサポートしません。完全なサポートは <https://github.com/ClickHouse/ClickHouse/issues/92752> の解決待ちです |

書き込みフォーマットを設定します:

```scala
spark.conf.set("spark.clickhouse.write.format", "json")  // Recommended for Variant types
```

:::tip
ClickHouse の `Variant` 型にデータを書き込む必要がある場合は、JSON 形式を使用してください。Arrow 形式は `JSON` 型への書き込みのみをサポートしています。
:::


### ベストプラクティス {#varianttype-best-practices}

1. **JSON のみのデータには JSON 型を使用する**: JSON オブジェクトだけを格納する場合は、デフォルトの JSON 型（`variant_types` プロパティなし）を使用する
2. **型を明示的に指定する**: `Variant()` を使用する場合、格納する予定のすべての型を明示的に列挙する
3. **実験的機能を有効にする**: ClickHouse で `allow_experimental_json_type = 1` が有効になっていることを確認する
4. **書き込みには JSON フォーマットを使用する**: 互換性の観点から、VariantType データには JSON フォーマットでの書き込みを推奨する
5. **クエリパターンを考慮する**: JSON/Variant 型は、効率的なフィルタリングのために ClickHouse の JSON パス クエリをサポートしている
6. **パフォーマンス向上のためのカラムヒント**: ClickHouse で JSON フィールドを使用する場合、カラムヒントを追加するとクエリ性能が向上する。現在、Spark 経由でのカラムヒントの追加はサポートされていない。この機能の追跡については [GitHub issue #497](https://github.com/ClickHouse/spark-clickhouse-connector/issues/497) を参照のこと。

### 例：ワークフロー全体 {#varianttype-example-workflow}

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

## 設定 {#configurations}

以下は、コネクタで利用可能な設定項目です。

:::note
**設定の利用方法**: これらは Catalog API と TableProvider API の両方に適用される、Spark レベルの設定オプションです。次の 2 通りの方法で指定できます。

1. **グローバルな Spark 設定**（すべての操作に適用）:
   ```python
   spark.conf.set("spark.clickhouse.write.batchSize", "20000")
   spark.conf.set("spark.clickhouse.write.compression.codec", "lz4")
   ```

2. **操作ごとの上書き**（TableProvider API のみ - グローバル設定を上書き可能）:
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

または、`spark-defaults.conf` に設定するか、Spark セッションを作成する際に指定します。
:::

<br/>

| キー                                                 | デフォルト値                                             | 説明                                                                                                                                                                                                                                                                    | 導入バージョン |
| -------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| spark.clickhouse.ignoreUnsupportedTransform        | false                                              | ClickHouse では、`cityHash64(col_1, col_2)` のような複雑な式をシャーディングキーやパーティション値として使用できますが、これらは現在 Spark ではサポートされていません。`true` の場合はサポートされていない式を無視し、それ以外の場合は例外を送出して直ちに失敗させます。なお、`spark.clickhouse.write.distributed.convertLocal` が有効なときにサポートされていないシャーディングキーを無視すると、データが破損する可能性があります。 | 0.4.0   |
| spark.clickhouse.read.compression.codec            | lz4                                                | 読み取り時にデータを解凍するために使用するコーデック。利用可能なコーデック: none, lz4。                                                                                                                                                                                                                     | 0.5.0   |
| spark.clickhouse.read.distributed.convertLocal     | true                                               | Distributed テーブルを読み込むときは、そのテーブル自体ではなくローカルテーブルを読み込みます。`true` の場合は、`spark.clickhouse.read.distributed.useClusterNodes` を無視します。                                                                                                                                          | 0.1.0   |
| spark.clickhouse.read.fixedStringAs                | binary                                             | ClickHouse の FixedString 型を指定された Spark データ型として読み取ります。サポートされる型: binary, string                                                                                                                                                                                         | 0.8.0   |
| spark.clickhouse.read.format                       | json                                               | 読み取り時に使用するシリアル化形式。対応形式: json、binary                                                                                                                                                                                                                                   | 0.6.0   |
| spark.clickhouse.read.runtimeFilter.enabled        | false                                              | 読み取り時にランタイムフィルターを有効化します。                                                                                                                                                                                                                                              | 0.8.0   |
| spark.clickhouse.read.splitByPartitionId           | true                                               | `true` の場合、パーティション値ではなく仮想カラム `_partition_id` を使って入力パーティションフィルターを構築します。パーティション値を用いて SQL 述語を組み立てる場合には、既知の問題があります。この機能には ClickHouse Server v21.6 以降が必要です。                                                                                                                | 0.4.0   |
| spark.clickhouse.useNullableQuerySchema            | false                                              | `true` の場合、テーブルを作成するときに `CREATE/REPLACE TABLE ... AS SELECT ...` を実行すると、クエリのスキーマ内のすべてのフィールドを Nullable に設定します。なお、この設定を有効にするには SPARK-43390（Spark 3.5 で利用可能）が必要です。このパッチが適用されていない場合は、常に `true` として動作します。                                                                  | 0.8.0   |
| spark.clickhouse.write.batchSize                   | 10000                                              | ClickHouse への書き込み時の 1 バッチあたりのレコード数。                                                                                                                                                                                                                                   | 0.1.0   |
| spark.clickhouse.write.compression.codec           | lz4                                                | 書き込み時のデータ圧縮に使用するコーデック。サポートされるコーデック: none、lz4。                                                                                                                                                                                                                         | 0.3.0   |
| spark.clickhouse.write.distributed.convertLocal    | false                                              | Distributed テーブルへの書き込み時に、Distributed テーブルではなくローカルテーブルに書き込みます。`true` の場合、`spark.clickhouse.write.distributed.useClusterNodes` を無視します。                                                                                                                                  | 0.1.0   |
| spark.clickhouse.write.distributed.useClusterNodes | true                                               | 分散テーブルへの書き込み時に、クラスター内のすべてのノードに書き込みます。                                                                                                                                                                                                                                 | 0.1.0   |
| spark.clickhouse.write.format                      | arrow                                              | 書き込み時のシリアル化形式。サポートされる形式: json, arrow                                                                                                                                                                                                                                  | 0.4.0   |
| spark.clickhouse.write.localSortByKey              | true                                               | `true` の場合、書き込み前にソートキーに基づいてローカルソートを実行します。                                                                                                                                                                                                                             | 0.3.0   |
| spark.clickhouse.write.localSortByPartition        | spark.clickhouse.write.repartitionByPartition の設定値 | `true` の場合、書き込み前にパーティション単位でローカルソートを行います。未設定の場合は、`spark.clickhouse.write.repartitionByPartition` と同じ値になります。                                                                                                                                                            | 0.3.0   |
| spark.clickhouse.write.maxRetry                    | 3                                                  | リトライ可能なエラーコードで失敗した単一のバッチ書き込みに対して再試行する最大回数。                                                                                                                                                                                                                            | 0.1.0   |
| spark.clickhouse.write.repartitionByPartition      | true                                               | ClickHouse テーブルのデータ分布に合わせるため、書き込み前に ClickHouse のパーティションキーでデータを再パーティションするかどうか。                                                                                                                                                                                         | 0.3.0   |
| spark.clickhouse.write.repartitionNum              | 0                                                  | 書き込み前に ClickHouse テーブルの分散に合わせてデータを再パーティション化する必要がある場合、この設定で再パーティション数を指定します。1 未満の値は再パーティション数の指定なしを意味します。                                                                                                                                                                | 0.1.0   |
| spark.clickhouse.write.repartitionStrictly         | false                                              | `true` の場合、Spark は書き込み時にレコードをデータソーステーブルへ渡す前に、要求されている分布要件を満たすよう、入力レコードをパーティション間に厳密に分配します。`false` の場合、Spark はクエリを高速化するための最適化を適用することがありますが、その結果として分布要件が満たされない可能性があります。なお、この設定には SPARK-37523（Spark 3.4 で利用可能）が必要であり、このパッチがない場合は常に `true` として動作します。                        | 0.3.0   |
| spark.clickhouse.write.retryInterval               | 10s                                                | 書き込み再試行の間隔（秒単位）。                                                                                                                                                                                                                                                      | 0.1.0   |
| spark.clickhouse.write.retryableErrorCodes         | 241                                                | 書き込み失敗時に ClickHouse サーバーが返す再試行可能なエラーコード。                                                                                                                                                                                                                              | 0.1.0   |

## サポートされているデータ型 {#supported-data-types}

このセクションでは、Spark と ClickHouse 間のデータ型マッピングについて説明します。以下のテーブルは、ClickHouse から Spark へデータを読み込む場合と Spark から ClickHouse へデータを挿入する場合のデータ型変換を確認するための早見表です。

### ClickHouse から Spark へのデータ読み込み {#reading-data-from-clickhouse-into-spark}

| ClickHouse Data Type                                              | Spark Data Type                | Supported | Is Primitive | Notes                                              |
|-------------------------------------------------------------------|--------------------------------|-----------|--------------|----------------------------------------------------|
| `Nothing`                                                         | `NullType`                     | ✅         | Yes          |                                                    |
| `Bool`                                                            | `BooleanType`                  | ✅         | Yes          |                                                    |
| `UInt8`, `Int16`                                                  | `ShortType`                    | ✅         | Yes          |                                                    |
| `Int8`                                                            | `ByteType`                     | ✅         | Yes          |                                                    |
| `UInt16`,`Int32`                                                  | `IntegerType`                  | ✅         | Yes          |                                                    |
| `UInt32`,`Int64`, `UInt64`                                        | `LongType`                     | ✅         | Yes          |                                                    |
| `Int128`,`UInt128`, `Int256`, `UInt256`                           | `DecimalType(38, 0)`           | ✅         | Yes          |                                                    |
| `Float32`                                                         | `FloatType`                    | ✅         | Yes          |                                                    |
| `Float64`                                                         | `DoubleType`                   | ✅         | Yes          |                                                    |
| `String`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6`              | `StringType`                   | ✅         | Yes          |                                                    |
| `FixedString`                                                     | `BinaryType`, `StringType`     | ✅         | Yes          | `READ_FIXED_STRING_AS` 設定で制御されます         |
| `Decimal`                                                         | `DecimalType`                  | ✅         | Yes          | `Decimal128` までの精度およびスケールをサポート   |
| `Decimal32`                                                       | `DecimalType(9, scale)`        | ✅         | Yes          |                                                    |
| `Decimal64`                                                       | `DecimalType(18, scale)`       | ✅         | Yes          |                                                    |
| `Decimal128`                                                      | `DecimalType(38, scale)`       | ✅         | Yes          |                                                    |
| `Date`, `Date32`                                                  | `DateType`                     | ✅         | Yes          |                                                    |
| `DateTime`, `DateTime32`, `DateTime64`                            | `TimestampType`                | ✅         | Yes          |                                                    |
| `Array`                                                           | `ArrayType`                    | ✅         | No           | 配列要素の型も変換されます                         |
| `Map`                                                             | `MapType`                      | ✅         | No           | キーは `StringType` に制限されます                 |
| `IntervalYear`                                                    | `YearMonthIntervalType(Year)`  | ✅         | Yes          |                                                    |
| `IntervalMonth`                                                   | `YearMonthIntervalType(Month)` | ✅         | Yes          |                                                    |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`          | ✅         | No           | 対応する interval 型が使用されます                 |
| `JSON`, `Variant`                                                 | `VariantType`                  | ✅         | No           | Spark 4.0+ および ClickHouse 25.3+ が必要です。`spark.clickhouse.read.jsonAs=string` を指定すると `StringType` として読み取れます |
| `Object`                                                          |                                | ❌         |              |                                                    |
| `Nested`                                                          |                                | ❌         |              |                                                    |
| `Tuple`                                                           | `StructType`                   | ✅         | No           | 名前付きおよび名前なしの Tuple をサポートします。名前付き Tuple はフィールド名で struct フィールドに対応し、名前なし Tuple は `_1`、`_2` などを使用します。入れ子の struct および Nullable フィールドをサポートします |
| `Point`                                                           |                                | ❌         |              |                                                    |
| `Polygon`                                                         |                                | ❌         |              |                                                    |
| `MultiPolygon`                                                    |                                | ❌         |              |                                                    |
| `Ring`                                                            |                                | ❌         |              |                                                    |
| `IntervalQuarter`                                                 |                                | ❌         |              |                                                    |
| `IntervalWeek`                                                    |                                | ❌         |              |                                                    |
| `Decimal256`                                                      |                                | ❌         |              |                                                    |
| `AggregateFunction`                                               |                                | ❌         |              |                                                    |
| `SimpleAggregateFunction`                                         |                                | ❌         |              |                                                    |

### Spark から ClickHouse へのデータ挿入 {#inserting-data-from-spark-into-clickhouse}

| Spark データ型                      | ClickHouse データ型 | サポート状況 | プリミティブ型か | 備考                                     |
|-------------------------------------|----------------------|-------------|------------------|----------------------------------------|
| `BooleanType`                       | `Bool`               | ✅           | はい             | バージョン 0.9.0 以降、`UInt8` ではなく `Bool` 型にマッピングされる |
| `ByteType`                          | `Int8`               | ✅           | はい             |                                        |
| `ShortType`                         | `Int16`              | ✅           | はい             |                                        |
| `IntegerType`                       | `Int32`              | ✅           | はい             |                                        |
| `LongType`                          | `Int64`              | ✅           | はい             |                                        |
| `FloatType`                         | `Float32`            | ✅           | はい             |                                        |
| `DoubleType`                        | `Float64`            | ✅           | はい             |                                        |
| `StringType`                        | `String`             | ✅           | はい             |                                        |
| `VarcharType`                       | `String`             | ✅           | はい             |                                        |
| `CharType`                          | `String`             | ✅           | はい             |                                        |
| `DecimalType`                       | `Decimal(p, s)`      | ✅           | はい             | 精度とスケールは `Decimal128` までサポート |
| `DateType`                          | `Date`               | ✅           | はい             |                                        |
| `TimestampType`                     | `DateTime`           | ✅           | はい             |                                        |
| `ArrayType` (list, tuple, or array) | `Array`              | ✅           | いいえ           | 配列要素の型も変換される                |
| `MapType`                           | `Map`                | ✅           | いいえ           | キーは `StringType` に限定              |
| `StructType`                        | `Tuple`              | ✅           | いいえ           | フィールド名付きの Tuple（named Tuple）に変換される |
| `VariantType`                       | `JSON` または `Variant` | ✅        | いいえ           | Spark 4.0 以降および ClickHouse 25.3 以降が必要。既定では `JSON` 型を使用。複数の型を持つ `Variant` を指定するには `clickhouse.column.<name>.variant_types` プロパティを使用する。 |
| `Object`                            |                      | ❌           |                  |                                        |
| `Nested`                            |                      | ❌           |                  |                                        |

## 貢献とサポート {#contributing-and-support}

このプロジェクトに貢献したり問題を報告したりしたい場合は、ぜひご参加ください。
[GitHub リポジトリ](https://github.com/ClickHouse/spark-clickhouse-connector)にアクセスし、Issue を作成したり、
改善案を提案したり、プルリクエストを送信したりしてください。
皆さまからの貢献を歓迎します。作業を始める前に、リポジトリ内の貢献ガイドラインをご確認ください。
ClickHouse Spark コネクタの改善にご協力いただき、ありがとうございます。
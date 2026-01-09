---
sidebar_label: 'Spark ネイティブコネクタ'
sidebar_position: 2
slug: /integrations/apache-spark/spark-native-connector
description: 'ClickHouse と Apache Spark 連携の概要'
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

このコネクタは、ClickHouse 固有の最適化機能（高度なパーティション分割や述語プッシュダウンなど）を活用して、
クエリのパフォーマンスとデータ処理を向上させます。
コネクタは [ClickHouse の公式 JDBC コネクタ](https://github.com/ClickHouse/clickhouse-java) を基盤としており、
独自のカタログを管理します。

Spark 3.0 より前は、Spark には組み込みのカタログという概念がなく、ユーザーは通常、
Hive Metastore や AWS Glue などの外部カタログシステムに依存していました。
これらの外部ソリューションでは、Spark でテーブルにアクセスする前に、ユーザーがデータソーステーブルを手動で登録する必要がありました。
しかし、Spark 3.0 でカタログの概念が導入されて以来、Spark はカタログプラグインを登録することでテーブルを自動的に検出できるようになりました。

Spark のデフォルトのカタログは `spark_catalog` であり、テーブルは `{catalog name}.{database}.{table}` で識別されます。
新しいカタログ機能により、1 つの Spark アプリケーション内で複数のカタログを追加して利用することが可能になりました。

## Catalog API と TableProvider API の選択 {#choosing-between-apis}

ClickHouse Spark connector は、**Catalog API** と **TableProvider API**（フォーマットベースのアクセス）の 2 つのアクセスパターンを提供しています。両者の違いを理解することで、ユースケースに適したアプローチを選択できます。

### Catalog API と TableProvider API の比較 {#catalog-vs-tableprovider-comparison}

| Feature | Catalog API | TableProvider API |
|---------|-------------|-------------------|
| **Configuration** | Spark の設定による一元管理 | 操作ごとのオプション指定 |
| **Table Discovery** | カタログ経由の自動検出 | テーブルを手動で指定 |
| **DDL Operations** | 完全対応（CREATE, DROP, ALTER） | 制限あり（テーブルの自動作成のみ） |
| **Spark SQL Integration** | ネイティブ（`clickhouse.database.table`） | フォーマットの指定が必要 |
| **Use Case** | 長期的かつ安定した接続および集中管理された設定向け | アドホック／動的／一時的なアクセス向け |

<TOCInline toc={toc}></TOCInline>

## 必要条件 {#requirements}

- Java 8 または 17（Spark 4.0 では Java 17 以上が必須）
- Scala 2.12 または 2.13（Spark 4.0 では Scala 2.13 のみをサポート）
- Apache Spark 3.3、3.4、3.5、または 4.0

## 互換性マトリックス {#compatibility-matrix}

| バージョン | 対応する Spark バージョン | ClickHouse JDBC バージョン |
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

Spark と ClickHouse を連携させるには、プロジェクトの構成に応じて複数のインストール方法があります。
`pom.xml`（Maven の場合）や `build.sbt`（SBT の場合）などのプロジェクトのビルドファイルに、ClickHouse Spark コネクタを依存関係として直接追加できます。
あるいは、必要な JAR ファイルを `$SPARK_HOME/jars/` フォルダに配置するか、`spark-submit` コマンドで `--jars` フラグを使用して Spark のオプションとして直接渡すこともできます。
いずれの方法でも、Spark 環境で ClickHouse コネクタを利用できるようになります。

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

SNAPSHOT バージョンを使用する場合は、次のリポジトリを追加してください。

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

SNAPSHOT バージョンを使用する場合は、次のリポジトリを追加してください。

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

Spark のシェルオプション（Spark SQL CLI、Spark Shell CLI、Spark Submit コマンド）を利用する場合は、必要な JAR ファイルを指定して依存関係を登録します。

```text
$SPARK_HOME/bin/spark-sql \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

Spark クライアントノードに JAR ファイルをコピーしたくない場合は、代わりに次の方法を利用できます。

```text
  --repositories https://{maven-central-mirror or private-nexus-repo} \
  --packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}
```

注: SQL のみのユースケースでは、本番利用には [Apache Kyuubi](https://github.com/apache/kyuubi) の使用を推奨します。

</TabItem>
</Tabs>


### ライブラリをダウンロードする {#download-the-library}

バイナリ JAR の命名パターンは次のとおりです。

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

すべてのリリース済み JAR ファイルは
[Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/spark/) から入手でき、
デイリービルドの SNAPSHOT JAR ファイルは
[Sonatype OSS Snapshots Repository](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/) にあります。

:::important
コネクタは [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)
および [clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client) に依存しており、
これらはどちらも clickhouse-jdbc:all にバンドルされているため、
「all」classifier を付けた [clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)
を必ず含めてください。
代わりに、フルの JDBC パッケージを使用したくない場合は、
[clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)
と [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client) を個別に追加してもかまいません。

いずれの場合も、パッケージのバージョンが
[Compatibility Matrix](#compatibility-matrix) に従って互換性を持つことを確認してください。
:::


## カタログを登録する（必須） {#register-the-catalog-required}

ClickHouse のテーブルにアクセスするには、次の設定で新しい Spark カタログを構成する必要があります。

| Property                                     | Value                                    | Default Value  | Required |
|----------------------------------------------|------------------------------------------|----------------|----------|
| `spark.sql.catalog.<catalog_name>`           | `com.clickhouse.spark.ClickHouseCatalog` | N/A            | Yes      |
| `spark.sql.catalog.<catalog_name>.host`      | `<clickhouse_host>`                      | `localhost`    | No       |
| `spark.sql.catalog.<catalog_name>.protocol`  | `http`                                   | `http`         | No       |
| `spark.sql.catalog.<catalog_name>.http_port` | `<clickhouse_port>`                      | `8123`         | No       |
| `spark.sql.catalog.<catalog_name>.user`      | `<clickhouse_username>`                  | `default`      | No       |
| `spark.sql.catalog.<catalog_name>.password`  | `<clickhouse_password>`                  | (empty string) | No       |
| `spark.sql.catalog.<catalog_name>.database`  | `<database>`                             | `default`      | No       |
| `spark.<catalog_name>.write.format`          | `json`                                   | `arrow`        | No       |

これらの設定は次のいずれかの方法で行えます。

* `spark-defaults.conf` を編集／作成する。
* `spark-submit` コマンド（または `spark-shell` / `spark-sql` の CLI コマンド）に設定を渡す。
* コンテキストの初期化時に設定を追加する。

:::important
ClickHouse クラスターを使用する場合は、各インスタンスごとに一意のカタログ名を設定する必要があります。
例:

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

このように設定すると、Spark SQL からは clickhouse1 のテーブル `<ck_db>.<ck_table>` を
`clickhouse1.<ck_db>.<ck_table>` として、clickhouse2 のテーブル `<ck_db>.<ck_table>` を `clickhouse2.<ck_db>.<ck_table>` として参照できるようになります。

:::

## TableProvider API の使用（フォーマットベースのアクセス） {#using-the-tableprovider-api}

カタログベースのアプローチに加えて、ClickHouse Spark コネクタでは TableProvider API を介した**フォーマットベースのアクセスパターン**もサポートしています。

### フォーマットベースの読み込み例 {#format-based-read}

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

TableProvider API は強力な機能をいくつか提供します。

#### テーブルの自動作成 {#automatic-table-creation}

存在しないテーブルに対して書き込みを行うと、コネクタは適切なスキーマでテーブルを自動作成します。コネクタはいくつかのインテリジェントなデフォルトを提供します。

* **Engine**: 指定がない場合は `MergeTree()` になります。`engine` オプションを使用して別のエンジンを指定できます（例: `ReplacingMergeTree()`, `SummingMergeTree()` など）。
* **ORDER BY**: **必須** - 新しいテーブルを作成する際は、必ず `order_by` オプションを明示的に指定する必要があります。コネクタは、指定されたすべてのカラムがスキーマ内に存在することを検証します。
* **Nullable キーのサポート**: ORDER BY に Nullable なカラムが含まれている場合は、自動的に `settings.allow_nullable_key=1` を追加します。

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
**ORDER BY が必須**: TableProvider API を使って新しいテーブルを作成する場合、`order_by` オプションは **必須** です。ORDER BY 句に使用するカラムを明示的に指定する必要があります。コネクタは、指定されたすべてのカラムがスキーマ内に存在することを検証し、いずれかのカラムが存在しない場合はエラーを返します。

**エンジンの選択**: デフォルトのエンジンは `MergeTree()` ですが、`engine` オプションで任意の ClickHouse テーブルエンジンを指定できます（例: `ReplacingMergeTree()`, `SummingMergeTree()`, `AggregatingMergeTree()` など）。
:::


### TableProvider 接続オプション {#tableprovider-connection-options}

フォーマットベースの API を使用する場合、次の接続オプションが利用できます。

#### 接続オプション {#connection-options}

| オプション   | 説明                                             | デフォルト値  | 必須     |
|--------------|--------------------------------------------------|----------------|----------|
| `host`       | ClickHouse サーバーのホスト名                   | `localhost`    | Yes      |
| `protocol`   | 接続プロトコル（`http` または `https`）         | `http`         | No       |
| `http_port`  | HTTP/HTTPS ポート                                | `8123`         | No       |
| `database`   | データベース名                                   | `default`      | Yes      |
| `table`      | テーブル名                                       | N/A            | Yes      |
| `user`       | 認証用ユーザー名                                 | `default`      | No       |
| `password`   | 認証用パスワード                                 | (空文字列)     | No       |
| `ssl`        | SSL 接続を有効にする                             | `false`        | No       |
| `ssl_mode`   | SSL モード（`NONE`、`STRICT` など）              | `STRICT`       | No       |
| `timezone`   | 日付/時刻処理で使用するタイムゾーン              | `server`       | No       |

#### テーブル作成オプション {#table-creation-options}

これらのオプションは、テーブルが存在せず、新規に作成する必要がある場合に使用します。

| Option                      | Description                                                                 | Default Value     | Required |
|-----------------------------|-----------------------------------------------------------------------------|-------------------|----------|
| `order_by`                  | ORDER BY 句に使用するカラム。複数カラムの場合はカンマ区切り                         | N/A               | **Yes**  |
| `engine`                    | ClickHouse のテーブルエンジン（例: `MergeTree()`, `ReplacingMergeTree()`, `SummingMergeTree()` など） | `MergeTree()`     | No       |
| `settings.allow_nullable_key` | ORDER BY で Nullable なキーを許可（ClickHouse Cloud 向け）                  | 自動検出**        | No       |
| `settings.<key>`            | 任意の ClickHouse テーブル設定                                             | N/A               | No       |
| `cluster`                   | 分散テーブル用のクラスタ名                                                  | N/A               | No       |
| `clickhouse.column.<name>.variant_types` | Variant カラムに対する ClickHouse 型のカンマ区切りリスト（例: `String, Int64, Bool, JSON`）。型名は大文字小文字を区別します。カンマの後のスペースは任意です。 | N/A | No |

\* 新しいテーブルを作成する場合、`order_by` オプションは必須です。指定されたすべてのカラムはスキーマ内に存在している必要があります。  
\** ORDER BY に Nullable カラムが含まれており、かつ明示的に指定されていない場合、自動的に `1` に設定されます。

:::tip
**ベストプラクティス**: ClickHouse Cloud では、ORDER BY カラムが Nullable となる可能性がある場合、`settings.allow_nullable_key=1` を明示的に設定してください。ClickHouse Cloud ではこの設定が必須です。
:::

#### 書き込みモード {#writing-modes}

Spark コネクタ（TableProvider API と Catalog API の両方）は、以下の Spark の書き込みモードをサポートします。

* **`append`**: 既存テーブルにデータを追加
* **`overwrite`**: テーブル内のすべてのデータを置き換え（テーブルを空にする）

:::important
**パーティション単位の上書きは未サポート**: このコネクタは現在、パーティションレベルの上書き操作（例: `partitionBy` を指定した `overwrite` モード）をサポートしていません。この機能は実装中です。この機能の進捗については [GitHub issue #34](https://github.com/ClickHouse/spark-clickhouse-connector/issues/34) を参照してください。
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

Catalog API と TableProvider API の両方で、ClickHouse 固有のオプション（コネクタオプションではない）を設定できます。これらはテーブルの作成やクエリの実行時に、そのまま ClickHouse に渡されます。

ClickHouse オプションを使用すると、`allow_nullable_key` や `index_granularity` などの ClickHouse 固有の設定や、その他のテーブルレベル／クエリレベルの設定を構成できます。これらは、ClickHouse への接続方法を制御するコネクタオプション（`host`、`database`、`table` など）とは異なります。

### TableProvider API の使用 {#using-tableprovider-api-options}

TableProvider API を使用する場合は、`settings.&lt;key&gt;` 形式のオプションを使用します。

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

Catalog API を使用する場合は、Spark の設定で `spark.sql.catalog.<catalog_name>.option.<key>` という形式を指定します。

```text
spark.sql.catalog.clickhouse.option.allow_nullable_key 1
spark.sql.catalog.clickhouse.option.index_granularity 8192
```

または、Spark SQL でテーブルを作成する際に設定します：

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

[ClickHouse Cloud](https://clickhouse.com) に接続する場合は、SSL を有効にし、適切な SSL モードを設定してください。例えば、次のようにします。

```text
spark.sql.catalog.clickhouse.option.ssl        true
spark.sql.catalog.clickhouse.option.ssl_mode   NONE
```


## データの読み込み {#read-data}

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


## データの書き込み {#write-data}

:::important
**パーティションの上書きは未サポート**: Catalog API は現在、パーティションレベルでの上書き操作（例: `partitionBy` と組み合わせた `overwrite` モード）をサポートしていません。この機能は開発中です。この機能の進捗については [GitHub issue #34](https://github.com/ClickHouse/spark-clickhouse-connector/issues/34) を参照してください。
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

## DDL operations {#ddl-operations}

Spark SQL を使用して ClickHouse インスタンスに対して DDL 操作を実行すると、そのすべての変更は即座に
ClickHouse に永続化されます。
Spark SQL では、ClickHouse とまったく同じようにクエリを記述できるため、
CREATE TABLE や TRUNCATE などのコマンドを変更なしでそのまま実行できます。例えば次のとおりです。

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

上記の例は Spark SQL のクエリを示しており、Java、Scala、PySpark、あるいはシェルなど任意の API を使用してアプリケーション内で実行できます。


## VariantType の扱い方 {#working-with-varianttype}

:::note
VariantType のサポートは Spark 4.0 以降で利用可能であり、実験的 JSON/Variant 型を有効化した ClickHouse 25.3 以降が必要です。
:::

このコネクタは、半構造化データを扱うために Spark の `VariantType` をサポートします。VariantType は ClickHouse の `JSON` および `Variant` 型にマッピングされ、柔軟なスキーマを持つデータを効率的に保存およびクエリできます。

:::note
このセクションでは、VariantType のマッピングと利用方法に特化して説明します。サポートされているすべてのデータ型の概要については、[サポート対象のデータ型](#supported-data-types) セクションを参照してください。
:::

### ClickHouse 型マッピング {#clickhouse-type-mapping}

| ClickHouse 型 | Spark 型 | 説明 |
|----------------|------------|-------------|
| `JSON` | `VariantType` | JSON オブジェクトのみを格納できます（`{` で始まる必要があります） |
| `Variant(T1, T2, ...)` | `VariantType` | プリミティブ型、配列、JSON など、複数の型を格納できます |

### VariantType データの読み取り {#reading-varianttype-data}

ClickHouse からデータを読み取ると、`JSON` および `Variant` カラムは自動的に Spark の `VariantType` にマッピングされます:

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

VariantType データは、JSON または Variant 型カラムを使用して ClickHouse に書き込むことができます。

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


### Spark SQL を使用した VariantType テーブルの作成 {#creating-varianttype-tables-spark-sql}

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


### Variant 型の設定 {#configuring-variant-types}

VariantType カラムを持つテーブルを作成する際、ClickHouse のどの型を使用するかを指定できます。

#### JSON タイプ (デフォルト) {#json-type-default}

`variant_types` プロパティが指定されていない場合、そのカラムはデフォルトで ClickHouse の `JSON` 型となり、JSON オブジェクトのみを受け付けます。

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


#### 複数の型を含む VariantType {#variant-type-multiple-types}

プリミティブ型、配列、JSON オブジェクトをサポートするには、`variant_types` プロパティで型を指定します。

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

これにより、次の ClickHouse クエリが生成されます。

```sql
CREATE TABLE flexible_data (
  id Int32, 
  data Variant(String, Int64, Float64, Bool, Array(String), JSON)
) ENGINE = MergeTree() ORDER BY id
```


### サポートされる Variant 型 {#supported-variant-types}

`Variant()` では、次の ClickHouse 型を使用できます。

- **プリミティブ型**: `String`, `Int8`, `Int16`, `Int32`, `Int64`, `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Float32`, `Float64`, `Bool`
- **配列**: `Array(T)`。ここでの T は、ネストされた配列を含む任意のサポート対象型です
- **JSON**: JSON オブジェクトを格納するための `JSON`

### 読み取りフォーマットの設定 {#read-format-configuration}

デフォルトでは、JSON カラムおよび Variant カラムは `VariantType` として読み取られます。これを変更して、文字列として読み取るように設定できます。

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

VariantType の書き込みサポートはフォーマットによって異なります。

| フォーマット | サポート状況     | 注記                                                                                                                                            |
| ------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| JSON   | ✅ Full     | `JSON` 型と `Variant` 型の両方をサポートします。VariantType データにはこのフォーマットを推奨します。                                                                             |
| Arrow  | ⚠️ Partial | ClickHouse の `JSON` 型への書き込みをサポートします。ClickHouse の `Variant` 型はサポートしません。完全なサポートは https://github.com/ClickHouse/ClickHouse/issues/92752 の解決待ちです。 |

書き込みフォーマットを設定します。

```scala
spark.conf.set("spark.clickhouse.write.format", "json")  // Recommended for Variant types
```

:::tip
ClickHouse の `Variant` 型に書き込む場合は、JSON フォーマットを使用してください。Arrow フォーマットでは、`JSON` 型への書き込みのみがサポートされています。
:::


### ベストプラクティス {#varianttype-best-practices}

1. **JSON のみのデータには JSON 型を使用する**: JSON オブジェクトのみを保存する場合は、デフォルトの JSON 型（`variant_types` プロパティなし）を使用する
2. **型を明示的に指定する**: `Variant()` を使用する場合、保存する予定のすべての型を明示的に列挙する
3. **実験的機能を有効化する**: ClickHouse で `allow_experimental_json_type = 1` が有効になっていることを確認する
4. **書き込みには JSON フォーマットを使用する**: 互換性を高めるため、VariantType データには JSON フォーマットでの書き込みを推奨する
5. **クエリパターンを考慮する**: JSON/Variant 型は、効率的なフィルタリングのために ClickHouse の JSON パスによるクエリをサポートしている
6. **パフォーマンス向上のためのカラムヒント**: ClickHouse で JSON フィールドを使用する場合、カラムヒントを追加するとクエリ性能が向上する。現在、Spark 経由でのカラムヒントの追加はサポートされていない。この機能の追跡については [GitHub issue #497](https://github.com/ClickHouse/spark-clickhouse-connector/issues/497) を参照。

### 例：完全なワークフロー {#varianttype-example-workflow}

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

以下は、コネクタで利用可能な調整可能な設定です。

:::note
**設定の利用方法**: これらは Catalog API と TableProvider API の両方に適用される Spark レベルの設定オプションです。次の 2 通りの方法で設定できます。

1. **グローバルな Spark 設定**（すべての操作に適用）:
   ```python
   spark.conf.set("spark.clickhouse.write.batchSize", "20000")
   spark.conf.set("spark.clickhouse.write.compression.codec", "lz4")
   ```

2. **操作単位での上書き**（TableProvider API のみ - グローバル設定を上書き可能）:
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

または、`spark-defaults.conf` で設定するか、Spark セッションを作成する際に設定します。
:::

<br/>

| キー                                                 | デフォルト値                                           | 説明                                                                                                                                                                                                                                                                                   | 導入バージョン |
| -------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| spark.clickhouse.ignoreUnsupportedTransform        | false                                            | ClickHouse は、シャーディングキーまたはパーティション値として、`cityHash64(col_1, col_2)` のような複雑な式を使用することをサポートしていますが、これらは現時点では Spark ではサポートされていません。`true` の場合はサポートされていない式を無視し、それ以外の場合は例外をスローして直ちに失敗させます。なお、`spark.clickhouse.write.distributed.convertLocal` が有効な場合、サポートされていないシャーディングキーを無視するとデータが破損する可能性があります。 | 0.4.0   |
| spark.clickhouse.read.compression.codec            | lz4                                              | 読み取り時にデータを解凍する際に使用するコーデック。サポートされているコーデックは none と lz4。                                                                                                                                                                                                                                | 0.5.0   |
| spark.clickhouse.read.distributed.convertLocal     | true                                             | Distributed テーブルを読み込む場合は、そのテーブル自体ではなく対応するローカルテーブルを読み込みます。`true` の場合は、`spark.clickhouse.read.distributed.useClusterNodes` は無視されます。                                                                                                                                                    | 0.1.0   |
| spark.clickhouse.read.fixedStringAs                | binary                                           | ClickHouse の FixedString 型を、指定した Spark データ型として読み込みます。サポートされる型: binary、string                                                                                                                                                                                                         | 0.8.0   |
| spark.clickhouse.read.format                       | json                                             | 読み取り時のシリアライズ形式を指定します。対応形式: json、binary                                                                                                                                                                                                                                               | 0.6.0   |
| spark.clickhouse.read.runtimeFilter.enabled        | false                                            | 読み込み時のランタイムフィルターを有効にします。                                                                                                                                                                                                                                                             | 0.8.0   |
| spark.clickhouse.read.splitByPartitionId           | true                                             | `true` の場合、パーティション値ではなく仮想カラム `_partition_id` によって入力パーティションフィルターを構築します。パーティション値に基づいて SQL 述語を組み立てる方法には、既知の問題があります。この機能には ClickHouse Server v21.6+ が必要です。                                                                                                                               | 0.4.0   |
| spark.clickhouse.useNullableQuerySchema            | false                                            | `true` の場合、テーブルを作成するときに `CREATE/REPLACE TABLE ... AS SELECT ...` を実行すると、クエリスキーマ内のすべてのフィールドを Nullable としてマークします。なお、この設定には SPARK-43390（Spark 3.5 で利用可能）が必要であり、このパッチがない場合、この設定は常に `true` として動作します。                                                                                      | 0.8.0   |
| spark.clickhouse.write.batchSize                   | 10000                                            | ClickHouse への書き込み時の 1 バッチあたりのレコード数。                                                                                                                                                                                                                                                  | 0.1.0   |
| spark.clickhouse.write.compression.codec           | lz4                                              | 書き込み時のデータ圧縮に使用するコーデック。サポートされるコーデックは none と lz4。                                                                                                                                                                                                                                      | 0.3.0   |
| spark.clickhouse.write.distributed.convertLocal    | false                                            | Distributed テーブルへの書き込み時に、分散テーブル自身ではなくローカルテーブルに書き込みます。`true` の場合、`spark.clickhouse.write.distributed.useClusterNodes` を無視します。                                                                                                                                                         | 0.1.0   |
| spark.clickhouse.write.distributed.useClusterNodes | true                                             | Distributed テーブルへの書き込み時に、クラスター内のすべてのノードに書き込みます。                                                                                                                                                                                                                                      | 0.1.0   |
| spark.clickhouse.write.format                      | arrow                                            | 書き込みに使用するシリアライズ形式。サポートされる形式: json, arrow                                                                                                                                                                                                                                             | 0.4.0   |
| spark.clickhouse.write.localSortByKey              | true                                             | `true` の場合、書き込み前にソートキーに基づいてローカルソートを行います。                                                                                                                                                                                                                                             | 0.3.0   |
| spark.clickhouse.write.localSortByPartition        | spark.clickhouse.write.repartitionByPartition の値 | `true` の場合、書き込み前にパーティション単位でローカルソートを行います。未設定の場合は、`spark.clickhouse.write.repartitionByPartition` の値が使用されます。                                                                                                                                                                           | 0.3.0   |
| spark.clickhouse.write.maxRetry                    | 3                                                | リトライ可能なエラーコードで失敗した単一バッチ書き込み処理に対して再試行する最大回数。                                                                                                                                                                                                                                          | 0.1.0   |
| spark.clickhouse.write.repartitionByPartition      | true                                             | 書き込み前に、ClickHouse テーブルの分布に合わせるために、ClickHouse のパーティションキーでデータを再パーティションするかどうか。                                                                                                                                                                                                          | 0.3.0   |
| spark.clickhouse.write.repartitionNum              | 0                                                | 書き込み前に ClickHouse テーブルの分散に合わせてデータを再パーティション化する必要がある場合、この設定を使用して再パーティション数を指定します。値が 1 未満の場合は、パーティション数の指定なし（要件なし）を意味します。                                                                                                                                                                 | 0.1.0   |
| spark.clickhouse.write.repartitionStrictly         | false                                            | `true` の場合、Spark は書き込み時にレコードをデータソーステーブルへ渡す前に、要求された分散要件を満たすよう、入力レコードをパーティション間に厳密に分散します。`false` の場合、Spark はクエリを高速化するためにいくつかの最適化を適用することがあり、その結果、分散要件が満たされない可能性があります。なお、この設定には SPARK-37523（Spark 3.4 で利用可能）が必要であり、このパッチがない場合は、常に `true` と同様に動作します。                                       | 0.3.0   |
| spark.clickhouse.write.retryInterval               | 10s                                              | 書き込みリトライの間隔（秒）。                                                                                                                                                                                                                                                                      | 0.1.0   |
| spark.clickhouse.write.retryableErrorCodes         | 241                                              | 書き込み処理が失敗した場合に ClickHouse サーバーから返される再試行可能なエラーコード。                                                                                                                                                                                                                                    | 0.1.0   |

## サポートされているデータ型 {#supported-data-types}

このセクションでは、Spark と ClickHouse 間のデータ型マッピングについて説明します。以下の表は、ClickHouse から Spark へデータを読み込む場合と、Spark から ClickHouse へデータを挿入する場合のデータ型変換に関するクイックリファレンスを提供します。

### ClickHouse から Spark へのデータ読み取り {#reading-data-from-clickhouse-into-spark}

| ClickHouse データ型                                              | Spark データ型                 | サポート | プリミティブ型 | 備考                                              |
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
| `FixedString`                                                     | `BinaryType`, `StringType`     | ✅         | Yes          | 設定項目 `READ_FIXED_STRING_AS` によって制御されます |
| `Decimal`                                                         | `DecimalType`                  | ✅         | Yes          | 精度およびスケールは `Decimal128` までサポート      |
| `Decimal32`                                                       | `DecimalType(9, scale)`        | ✅         | Yes          |                                                    |
| `Decimal64`                                                       | `DecimalType(18, scale)`       | ✅         | Yes          |                                                    |
| `Decimal128`                                                      | `DecimalType(38, scale)`       | ✅         | Yes          |                                                    |
| `Date`, `Date32`                                                  | `DateType`                     | ✅         | Yes          |                                                    |
| `DateTime`, `DateTime32`, `DateTime64`                            | `TimestampType`                | ✅         | Yes          |                                                    |
| `Array`                                                           | `ArrayType`                    | ✅         | No           | 配列要素の型も変換されます                         |
| `Map`                                                             | `MapType`                      | ✅         | No           | キーは `StringType` に制限されます                 |
| `IntervalYear`                                                    | `YearMonthIntervalType(Year)`  | ✅         | Yes          |                                                    |
| `IntervalMonth`                                                   | `YearMonthIntervalType(Month)` | ✅         | Yes          |                                                    |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`          | ✅         | No           | 対応する個別の interval 型が使用されます           |
| `JSON`, `Variant`                                                 | `VariantType`                  | ✅         | No           | Spark 4.0 以降および ClickHouse 25.3 以降が必要です。`spark.clickhouse.read.jsonAs=string` を指定すると、`StringType` として読み取ることができます |
| `Object`                                                          |                                | ❌         |              |                                                    |
| `Nested`                                                          |                                | ❌         |              |                                                    |
| `Tuple`                                                           | `StructType`                   | ✅         | No           | 名前付きタプルと無名タプルの両方をサポートします。名前付きタプルはフィールド名で struct のフィールドに対応付けられ、無名タプルでは `_1`、`_2` などが使用されます。ネストした struct および Nullable フィールドもサポートします |
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

| Spark Data Type                     | ClickHouse Data Type | サポート | プリミティブか | 備考                                  |
|-------------------------------------|----------------------|-----------|----------------|----------------------------------------|
| `BooleanType`                       | `Bool`               | ✅         | はい           | バージョン 0.9.0 以降、`UInt8` ではなく `Bool` 型にマッピングされます |
| `ByteType`                          | `Int8`               | ✅         | はい           |                                        |
| `ShortType`                         | `Int16`              | ✅         | はい           |                                        |
| `IntegerType`                       | `Int32`              | ✅         | はい           |                                        |
| `LongType`                          | `Int64`              | ✅         | はい           |                                        |
| `FloatType`                         | `Float32`            | ✅         | はい           |                                        |
| `DoubleType`                        | `Float64`            | ✅         | はい           |                                        |
| `StringType`                        | `String`             | ✅         | はい           |                                        |
| `VarcharType`                       | `String`             | ✅         | はい           |                                        |
| `CharType`                          | `String`             | ✅         | はい           |                                        |
| `DecimalType`                       | `Decimal(p, s)`      | ✅         | はい           | 精度とスケールは `Decimal128` までサポート |
| `DateType`                          | `Date`               | ✅         | はい           |                                        |
| `TimestampType`                     | `DateTime`           | ✅         | はい           |                                        |
| `ArrayType` (list, tuple, or array) | `Array`              | ✅         | いいえ         | 配列要素の型も変換されます             |
| `MapType`                           | `Map`                | ✅         | いいえ         | キーは `StringType` に制限されます     |
| `StructType`                        | `Tuple`              | ✅         | いいえ         | フィールド名付きの Tuple（named Tuple）に変換されます。 |
| `VariantType`                       | `JSON` or `Variant`  | ✅         | いいえ         | Spark 4.0+ と ClickHouse 25.3+ が必要です。デフォルトでは `JSON` 型になります。複数の型を持つ `Variant` を指定するには、`clickhouse.column.<name>.variant_types` プロパティを使用します。 |
| `Object`                            |                      | ❌         |                |                                        |
| `Nested`                            |                      | ❌         |                |                                        |

## 貢献とサポート {#contributing-and-support}

本プロジェクトへの貢献や不具合・課題の報告をご希望の場合は、ぜひご協力ください。
[GitHub リポジトリ](https://github.com/ClickHouse/spark-clickhouse-connector)にアクセスして、issue を作成したり、
改善案を提案したり、pull request を送信したりできます。
皆さまからの貢献を歓迎しています。作業を始める前に、リポジトリ内の貢献ガイドラインをご確認ください。
ClickHouse Spark コネクタの改善にご協力いただき、ありがとうございます。
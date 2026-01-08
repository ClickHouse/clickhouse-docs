---
sidebar_label: 'Spark ネイティブコネクタ'
sidebar_position: 2
slug: /integrations/apache-spark/spark-native-connector
description: 'ClickHouse と連携する Apache Spark の概要'
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

# Spark コネクタ {#spark-connector}

<ClickHouseSupportedBadge/>

このコネクタは、高度なパーティショニングや述語プッシュダウンなど、ClickHouse 固有の最適化機能を活用して、
クエリのパフォーマンスとデータ処理を向上させます。
このコネクタは [ClickHouse の公式 JDBC コネクタ](https://github.com/ClickHouse/clickhouse-java) をベースとしており、
独自のカタログを管理します。

Spark 3.0 以前、Spark には組み込みのカタログという概念がなかったため、ユーザーは通常、
Hive Metastore や AWS Glue などの外部カタログシステムに依存していました。
これらの外部ソリューションでは、Spark でアクセスする前に、ユーザーはデータソーステーブルを手動で登録する必要がありました。
しかし、Spark 3.0 でカタログの概念が導入されて以来、Spark はカタログプラグインを登録することでテーブルを自動的に検出できるようになりました。

Spark のデフォルトのカタログは `spark_catalog` であり、テーブルは `{catalog name}.{database}.{table}` という形式で識別されます。
新しいカタログ機能により、1 つの Spark アプリケーション内で複数のカタログを追加して利用できるようになりました。

## Catalog API と TableProvider API の選択 {#choosing-between-apis}

ClickHouse Spark コネクタは、**Catalog API** と **TableProvider API**（フォーマットベースのアクセス）の 2 種類のアクセスパターンをサポートしています。両者の違いを理解することで、ユースケースに適したアプローチを選択できます。

### Catalog API と TableProvider API の比較 {#catalog-vs-tableprovider-comparison}

| 機能 | Catalog API | TableProvider API |
|---------|-------------|-------------------|
| **設定** | Spark の設定による集中管理 | オプションによる操作ごとの設定 |
| **テーブル検出** | カタログによる自動検出 | 手動でのテーブル指定 |
| **DDL 操作** | 完全対応（CREATE、DROP、ALTER） | 制限あり（自動テーブル作成のみ） |
| **Spark SQL 統合** | ネイティブ（`clickhouse.database.table`） | フォーマットの指定が必要 |
| **ユースケース** | 集中管理された設定による長期的で安定した接続 | アドホック、動的、一時的なアクセス |

<TOCInline toc={toc}></TOCInline>

## 要件 {#requirements}

- Java 8 または 17（Spark 4.0 では Java 17 以上が必須）
- Scala 2.12 または 2.13（Spark 4.0 は Scala 2.13 のみをサポート）
- Apache Spark 3.3、3.4、3.5、または 4.0

## 互換性マトリックス {#compatibility-matrix}

| バージョン | 対応 Spark バージョン | ClickHouse JDBC バージョン |
|---------|-----------------------|---------------------------|
| main    | Spark 3.3, 3.4, 3.5, 4.0  | 0.9.4                   |
| 0.9.0   | Spark 3.3, 3.4, 3.5, 4.0  | 0.9.4                   |
| 0.8.1   | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.7.3   | Spark 3.3, 3.4            | 0.4.6                   |
| 0.6.0   | Spark 3.3                 | 0.3.2-patch11           |
| 0.5.0   | Spark 3.2, 3.3            | 0.3.2-patch11           |
| 0.4.0   | Spark 3.2, 3.3            | 依存なし                 |
| 0.3.0   | Spark 3.2, 3.3            | 依存なし                 |
| 0.2.1   | Spark 3.2                 | 依存なし                 |
| 0.1.2   | Spark 3.2                 | 依存なし                 |

## インストールとセットアップ {#installation--setup}

Spark と ClickHouse を統合するには、さまざまなプロジェクト構成に対応した複数のインストール方法が用意されています。
ClickHouse Spark コネクタを、プロジェクトのビルドファイル（Maven の `pom.xml` や SBT の `build.sbt` など）に
依存関係として直接追加できます。
あるいは、必要な JAR ファイルを `$SPARK_HOME/jars/` フォルダーに配置するか、`spark-submit` コマンドで
`--jars` フラグを使って Spark のオプションとして直接指定することもできます。
いずれの方法を用いても、Spark 環境で ClickHouse コネクタを利用できるようになります。

### 依存関係としてインポートする {#import-as-a-dependency}

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

SNAPSHOT バージョンを使用したい場合は、次のリポジトリを追加します。

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

SNAPSHOT バージョンを使用したい場合は、次のリポジトリを追加します。

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

Spark のシェルオプション（Spark SQL CLI、Spark Shell CLI、Spark Submit コマンド）を使用する場合、依存関係は
必要な JAR を引数として渡すことで解決できます。

```text
$SPARK_HOME/bin/spark-sql \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

JAR ファイルを Spark クライアントノードにコピーしたくない場合は、代わりに次のように指定できます。

```text
  --repositories https://{maven-central-mirror or private-nexus-repo} \
  --packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}
```

注: SQL のみのユースケースの場合、本番環境では [Apache Kyuubi](https://github.com/apache/kyuubi) の使用を推奨します。

</TabItem>
</Tabs>

### ライブラリをダウンロードする {#download-the-library}

バイナリ JAR のファイル名パターンは次のとおりです。

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

利用可能なすべてのリリース済み JAR ファイルは
[Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/spark/) から、
すべてのデイリービルド SNAPSHOT JAR ファイルは [Sonatype OSS Snapshots Repository](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/) から入手できます。

:::important
コネクタは [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)
および [clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client) に依存しており、
どちらも clickhouse-jdbc:all にバンドルされているため、
[classifier が &quot;all&quot; の clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc) を
必ず含める必要があります。
代わりに、完全な JDBC パッケージ一式を使用したくない場合は、
[clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)
および [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client) を
個別に追加することもできます。

いずれの場合も、
[Compatibility Matrix](#compatibility-matrix) に従ってパッケージのバージョン互換性が取れていることを確認してください。
:::

## カタログを登録する（必須） {#register-the-catalog-required}

ClickHouse のテーブルへアクセスするには、以下の設定で新しい Spark カタログを構成する必要があります。

| Property                                     | Value                                    | Default Value  | Required |
| -------------------------------------------- | ---------------------------------------- | -------------- | -------- |
| `spark.sql.catalog.<catalog_name>`           | `com.clickhouse.spark.ClickHouseCatalog` | N/A            | Yes      |
| `spark.sql.catalog.<catalog_name>.host`      | `<clickhouse_host>`                      | `localhost`    | No       |
| `spark.sql.catalog.<catalog_name>.protocol`  | `http`                                   | `http`         | No       |
| `spark.sql.catalog.<catalog_name>.http_port` | `<clickhouse_port>`                      | `8123`         | No       |
| `spark.sql.catalog.<catalog_name>.user`      | `<clickhouse_username>`                  | `default`      | No       |
| `spark.sql.catalog.<catalog_name>.password`  | `<clickhouse_password>`                  | (empty string) | No       |
| `spark.sql.catalog.<catalog_name>.database`  | `<database>`                             | `default`      | No       |
| `spark.<catalog_name>.write.format`          | `json`                                   | `arrow`        | No       |

これらの設定は、次のいずれかの方法で指定できます。

* `spark-defaults.conf` を編集または作成する。
* `spark-submit` コマンド（または `spark-shell` / `spark-sql` の CLI コマンド）に設定を渡す。
* コンテキストを初期化する際に設定を追加する。

:::important
ClickHouse クラスターで作業する場合は、各インスタンスごとに一意のカタログ名を設定する必要があります。
例えば、次のようにします。

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

このように設定すると、Spark SQL から `clickhouse1.<ck_db>.<ck_table>` を使用して clickhouse1 のテーブル `<ck_db>.<ck_table>` にアクセスでき、`clickhouse2.<ck_db>.<ck_table>` を使用して clickhouse2 のテーブル `<ck_db>.<ck_table>` にアクセスできるようになります。

:::

## TableProvider API の使用（フォーマットベースのアクセス） {#using-the-tableprovider-api}

カタログベースのアプローチに加えて、ClickHouse Spark コネクタは TableProvider API を介した**フォーマットベースのアクセスパターン**をサポートしています。

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

TableProvider API には、強力な機能がいくつかあります。

#### 自動テーブル作成 {#automatic-table-creation}

存在しないテーブルに書き込もうとすると、コネクタは適切なスキーマでテーブルを自動作成します。コネクタはいくつかのインテリジェントなデフォルト値を提供します:

* **Engine**: 指定がない場合はデフォルトで `MergeTree()` を使用します。`engine` オプションを使用して別のエンジンを指定できます（例: `ReplacingMergeTree()`, `SummingMergeTree()` など）。
* **ORDER BY**: **必須** - 新しいテーブルを作成する際には `order_by` オプションを明示的に指定する必要があります。コネクタは、指定されたすべてのカラムがスキーマに存在することを検証します。
* **Nullable キーのサポート**: ORDER BY に Nullable なカラムが含まれている場合、自動的に `settings.allow_nullable_key=1` を追加します。

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
**ORDER BY が必須**: TableProvider API を使用して新しいテーブルを作成する場合、`order_by` オプションは**必須**です。ORDER BY 句に使用するカラムを明示的に指定する必要があります。コネクタは、指定されたすべてのカラムがスキーマ内に存在することを検証し、いずれかのカラムが不足している場合はエラーを送出します。

**エンジンの選択**: デフォルトのエンジンは `MergeTree()` ですが、`engine` オプションを使用して任意の ClickHouse テーブルエンジンを指定できます（例: `ReplacingMergeTree()`, `SummingMergeTree()`, `AggregatingMergeTree()` など）。
:::


### TableProvider 接続オプション {#tableprovider-connection-options}

フォーマットベースの API を使用する場合、次の接続オプションが利用できます。

#### 接続オプション {#connection-options}

| Option       | 説明                                              | デフォルト値    | 必須     |
|--------------|--------------------------------------------------|----------------|----------|
| `host`       | ClickHouse サーバーのホスト名                    | `localhost`    | はい     |
| `protocol`   | 接続プロトコル（`http` または `https`）          | `http`         | いいえ   |
| `http_port`  | HTTP/HTTPS ポート番号                            | `8123`         | いいえ   |
| `database`   | データベース名                                   | `default`      | はい     |
| `table`      | テーブル名                                       | N/A            | はい     |
| `user`       | 認証用ユーザー名                                 | `default`      | いいえ   |
| `password`   | 認証用パスワード                                 | （空文字列）   | いいえ   |
| `ssl`        | SSL 接続を有効にする                             | `false`        | いいえ   |
| `ssl_mode`   | SSL モード（`NONE`、`STRICT` など）              | `STRICT`       | いいえ   |
| `timezone`   | 日付/時刻処理に使用するタイムゾーン              | `server`       | いいえ   |

#### テーブル作成オプション {#table-creation-options}

これらのオプションは、テーブルが存在せず、新規作成する必要がある場合に使用します。

| オプション                  | 説明                                                                      | デフォルト値      | 必須     |
|-----------------------------|-----------------------------------------------------------------------------|-------------------|----------|
| `order_by`                  | ORDER BY 句に使用するカラム。複数カラムの場合はカンマ区切り               | N/A               | **はい** |
| `engine`                    | ClickHouse のテーブルエンジン（例: `MergeTree()`, `ReplacingMergeTree()`, `SummingMergeTree()` など） | `MergeTree()`     | いいえ   |
| `settings.allow_nullable_key` | ORDER BY で Nullable なキーを有効化（ClickHouse Cloud 用）                | 自動検出**        | いいえ   |
| `settings.<key>`            | 任意の ClickHouse テーブルの設定                                          | N/A               | いいえ   |
| `cluster`                   | 分散テーブル用のクラスタ名                                                 | N/A               | いいえ   |
| `clickhouse.column.<name>.variant_types` | Variant カラムに対する ClickHouse 型のカンマ区切りリスト（例: `String, Int64, Bool, JSON`）。型名は大文字小文字を区別します。カンマの後のスペースは任意です。 | N/A | いいえ |

\* 新しいテーブルを作成する場合、`order_by` オプションは必須です。指定されたすべてのカラムはスキーマ内に存在している必要があります。  
\** ORDER BY に Nullable なカラムが含まれており、かつ明示的に指定されていない場合は、自動的に `1` に設定されます。

:::tip
**ベストプラクティス**: ClickHouse Cloud では、ORDER BY のカラムが Nullable になる可能性がある場合、`settings.allow_nullable_key=1` を明示的に設定してください。ClickHouse Cloud ではこの設定が必須です。
:::

#### 書き込みモード {#writing-modes}

Spark コネクタ（TableProvider API および Catalog API の両方）は、次の Spark の書き込みモードをサポートします。

* **`append`**: 既存テーブルにデータを追加
* **`overwrite`**: テーブル内のすべてのデータを置き換え（テーブルを空にする）

:::important
**パーティション単位の上書きは未サポート**: このコネクタは現在、パーティション単位での上書き操作（例: `partitionBy` と組み合わせた `overwrite` モード）をサポートしていません。この機能は開発中です。この機能の進捗は [GitHub issue #34](https://github.com/ClickHouse/spark-clickhouse-connector/issues/34) を参照してください。
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

Catalog API と TableProvider API の両方で、ClickHouse 固有のオプション（コネクタのオプションではありません）を設定できます。これらはテーブル作成時やクエリ実行時に、そのまま ClickHouse に渡されます。

ClickHouse オプションでは、`allow_nullable_key` や `index_granularity` などの ClickHouse 固有の設定、およびその他のテーブルレベルまたはクエリレベルの設定を構成できます。これらは、ClickHouse への接続方法を制御するコネクタオプション（`host`、`database`、`table` など）とは異なります。

### TableProvider API の使用 {#using-tableprovider-api-options}

TableProvider API を使用する場合は、`settings.<key>` 形式のオプションを指定します。

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

または、Spark SQL でテーブルを作成するときに設定することもできます。

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

[ClickHouse Cloud](https://clickhouse.com) に接続する際は、SSL を有効にし、適切な SSL モードを設定してください。例えば、次のように指定します。

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
**パーティションの上書きはサポートされていません**: Catalog API は現時点では、パーティション単位の上書き操作（例: `partitionBy` と併用した `overwrite` モード）をサポートしていません。この機能は現在開発中です。この機能の進捗については [GitHub issue #34](https://github.com/ClickHouse/spark-clickhouse-connector/issues/34) を参照してください。
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

Spark SQL を使用して ClickHouse インスタンスに対して DDL 操作を実行でき、そこで行ったすべての変更は即座に
ClickHouse に永続化されます。
Spark SQL では ClickHouse とまったく同じようにクエリを記述できるため、
たとえば CREATE TABLE や TRUNCATE などのコマンドを変更することなく、そのまま直接実行できます。

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

上記の例は Spark SQL クエリを示しており、Java や Scala、PySpark、シェルなどの任意の API からアプリケーション内で実行できます。

## VariantType の利用 {#working-with-varianttype}

:::note
VariantType のサポートは Spark 4.0 以降で利用可能であり、実験的な JSON / Variant 型を有効化した ClickHouse 25.3 以降が必要です。
:::

このコネクタは、半構造化データを扱うために Spark の `VariantType` をサポートします。VariantType は ClickHouse の `JSON` および `Variant` 型にマッピングされ、柔軟なスキーマを持つデータを効率的に保存し、クエリを実行できます。

:::note
このセクションでは、VariantType のマッピングと使用方法に焦点を当てて説明します。サポートされているすべてのデータ型の概要については、[サポートされているデータ型](#supported-data-types) セクションを参照してください。
:::

### ClickHouse 型マッピング {#clickhouse-type-mapping}

| ClickHouse 型 | Spark 型 | 説明 |
|----------------|------------|-------------|
| `JSON` | `VariantType` | JSON オブジェクトのみを格納できる（`{` で始まる必要がある） |
| `Variant(T1, T2, ...)` | `VariantType` | プリミティブ、配列、JSON を含む複数の型を格納できる |

### VariantType データの読み取り {#reading-varianttype-data}

ClickHouse からデータを読み込む際、`JSON` および `Variant` カラムは自動的に Spark の `VariantType` にマッピングされます:

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

VariantType データは、JSON 型または Variant カラム型のいずれかを使用して ClickHouse に書き込むことができます。

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

Spark SQL の DDL 文を使用して VariantType テーブルを作成できます。

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


### VariantType 型の設定 {#configuring-variant-types}

VariantType のカラムを持つテーブルを作成する際、使用する ClickHouse のデータ型を指定できます。

#### JSON 型 (デフォルト) {#json-type-default}

`variant_types` プロパティが指定されていない場合、カラムのデフォルトの型は ClickHouse の `JSON` 型となり、JSON オブジェクトのみを受け付けます。

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

これにより、次のような ClickHouse クエリが生成されます。

```sql
CREATE TABLE json_table (id Int32, data JSON) ENGINE = MergeTree() ORDER BY id
```


#### 複数の型を持つ VariantType {#variant-type-multiple-types}

プリミティブ、配列、および JSONオブジェクトをサポートするには、`variant_types` プロパティで型を指定します。

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


### サポートされている Variant 型 {#supported-variant-types}

`Variant()` で使用できる ClickHouse 型は次のとおりです。

- **プリミティブ型**: `String`, `Int8`, `Int16`, `Int32`, `Int64`, `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Float32`, `Float64`, `Bool`
- **配列**: `Array(T)`。ここで T は、ネストされた配列を含む任意のサポート対象型です
- **JSON**: JSON オブジェクトを格納するための `JSON`

### 読み取りフォーマットの設定 {#read-format-configuration}

デフォルトでは、JSON および Variant のカラムは `VariantType` として読み取られます。設定を変更して、これらを文字列として読み取るようにできます。

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

VariantType の書き込みサポート状況はフォーマットごとに異なります:

| Format | Support    | Notes                                                                                                                                          |
| ------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| JSON   | ✅ Full     | `JSON` 型と `Variant` 型の両方をサポートします。VariantType データにはこのフォーマットの利用を推奨します                                                                            |
| Arrow  | ⚠️ Partial | ClickHouse の `JSON` 型への書き込みをサポートします。ClickHouse の `Variant` 型はサポートしません。完全なサポートは <https://github.com/ClickHouse/ClickHouse/issues/92752> の解決待ちです |

書き込みフォーマットを設定します:

```scala
spark.conf.set("spark.clickhouse.write.format", "json")  // Recommended for Variant types
```

:::tip
ClickHouse の `Variant` 型にデータを書き込む必要がある場合は、JSON フォーマットを使用してください。Arrow フォーマットで書き込み可能なのは `JSON` 型のみです。
:::


### ベストプラクティス {#varianttype-best-practices}

1. **JSON のみのデータには JSON 型を使用する**: JSON オブジェクトのみを保存する場合は、デフォルトの JSON 型（`variant_types` プロパティなし）を使用します。
2. **型を明示的に指定する**: `Variant()` を使用する場合、保存する予定のすべての型を明示的に列挙します。
3. **実験的機能を有効化する**: ClickHouse で `allow_experimental_json_type = 1` が有効になっていることを確認します。
4. **書き込みには JSON 形式を使用する**: 互換性を高めるため、VariantType データには JSON 形式での書き込みを推奨します。
5. **クエリパターンを考慮する**: JSON/Variant 型は、効率的なフィルタリングのために ClickHouse の JSON パス クエリをサポートします。
6. **パフォーマンス向上のためのカラムヒント**: ClickHouse で JSON フィールドを使用する場合、カラムヒントを追加するとクエリパフォーマンスが向上します。現在、Spark 経由でのカラムヒントの追加はサポートされていません。この機能の追跡については [GitHub issue #497](https://github.com/ClickHouse/spark-clickhouse-connector/issues/497) を参照してください。

### 例：完全なワークフローの例 {#varianttype-example-workflow}

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

## Configurations {#configurations}

以下は、コネクタで利用可能な調整可能な設定項目です。

:::note
**設定の利用方法**: これらは Catalog API と TableProvider API の両方に適用される Spark レベルの設定オプションです。次の 2 通りの方法で設定できます。

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

あるいは、`spark-defaults.conf` や Spark セッションの作成時に設定することもできます。
:::

<br/>

| キー                                                 | デフォルト                                            | 概要                                                                                                                                                                                                                                                                     | 以降    |
| -------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| spark.clickhouse.ignoreUnsupportedTransform        | false                                            | ClickHouse は、シャーディングキーやパーティション値として複雑な式（例: `cityHash64(col_1, col_2)`）を使用できますが、これらは現在 Spark ではサポートされていません。`true` の場合はサポートされていない式を無視し、それ以外の場合は例外をスローして即座にエラー終了します。なお、`spark.clickhouse.write.distributed.convertLocal` が有効な場合、サポートされていないシャーディングキーを無視するとデータが破損するおそれがあります。 | 0.4.0 |
| spark.clickhouse.read.compression.codec            | lz4                                              | 読み取り時にデータを解凍するために使用するコーデック。サポートされるコーデック: none, lz4。                                                                                                                                                                                                                    | 0.5.0 |
| spark.clickhouse.read.distributed.convertLocal     | true                                             | Distributed テーブルを読み込む際は、自身ではなくローカルテーブルを読み込みます。`true` の場合、`spark.clickhouse.read.distributed.useClusterNodes` は無視されます。                                                                                                                                                  | 0.1.0 |
| spark.clickhouse.read.fixedStringAs                | バイナリ                                             | ClickHouse の FixedString 型を指定した Spark データ型として読み取ります。サポートされる型：binary、string                                                                                                                                                                                             | 0.8.0 |
| spark.clickhouse.read.format                       | json                                             | 読み取り用のシリアライズ形式。サポートされる形式: JSON, Binary                                                                                                                                                                                                                                 | 0.6.0 |
| spark.clickhouse.read.runtimeFilter.enabled        | false                                            | 読み取り用のランタイムフィルターを有効化します。                                                                                                                                                                                                                                               | 0.8.0 |
| spark.clickhouse.read.splitByPartitionId           | true                                             | `true` の場合、パーティション値ではなく仮想カラム `_partition_id` を使って入力パーティションフィルタを構成します。パーティション値によって SQL の述語を組み立てる場合には、既知の問題があります。この機能には ClickHouse Server v21.6 以降が必要です。                                                                                                                 | 0.4.0 |
| spark.clickhouse.useNullableQuerySchema            | false                                            | `true` の場合、テーブル作成時に `CREATE/REPLACE TABLE ... AS SELECT ...` を実行すると、クエリスキーマ内のすべてのフィールドを nullable としてマークします。なお、この設定には SPARK-43390（Spark 3.5 で利用可能）が必要であり、このパッチがない場合は設定値に関係なく常に `true` として動作します。                                                                         | 0.8.0 |
| spark.clickhouse.write.batchSize                   | 10000                                            | ClickHouse への書き込み時に、1 バッチあたりに含めるレコード数。                                                                                                                                                                                                                                 | 0.1.0 |
| spark.clickhouse.write.compression.codec           | lz4                                              | 書き込み時にデータを圧縮するためのコーデック。サポートされているコーデックは none と lz4 です。                                                                                                                                                                                                                  | 0.3.0 |
| spark.clickhouse.write.distributed.convertLocal    | false                                            | Distributed テーブルに書き込む際は、自身ではなくローカルテーブルに書き込みます。`true` の場合、`spark.clickhouse.write.distributed.useClusterNodes` を無視します。                                                                                                                                                  | 0.1.0 |
| spark.clickhouse.write.distributed.useClusterNodes | true                                             | Distributed テーブルへの書き込み時に、クラスタ内のすべてのノードに書き込む。                                                                                                                                                                                                                           | 0.1.0 |
| spark.clickhouse.write.format                      | 矢印                                               | 書き込み時のシリアル化形式。サポートされる形式: JSON、Arrow                                                                                                                                                                                                                                    | 0.4.0 |
| spark.clickhouse.write.localSortByKey              | true                                             | `true` の場合、書き込み前にソートキーに基づいてローカルでソートを行います。                                                                                                                                                                                                                              | 0.3.0 |
| spark.clickhouse.write.localSortByPartition        | spark.clickhouse.write.repartitionByPartition の値 | `true` の場合、書き込み前にローカルでパーティションごとにソートを行います。設定されていない場合は、`spark.clickhouse.write.repartitionByPartition` と同じ値になります。                                                                                                                                                        | 0.3.0 |
| spark.clickhouse.write.maxRetry                    | 3                                                | 再試行可能なエラーコードによって単一バッチ書き込みが失敗した場合に、その書き込みを再試行する最大回数。                                                                                                                                                                                                                    | 0.1.0 |
| spark.clickhouse.write.repartitionByPartition      | true                                             | 書き込み前に、ClickHouse テーブルのパーティション分布に合わせて ClickHouse のパーティションキーでデータを再パーティションするかどうか。                                                                                                                                                                                        | 0.3.0 |
| spark.clickhouse.write.repartitionNum              | 0                                                | 書き込み前に ClickHouse テーブルのディストリビューションに合うようデータを再パーティションする必要がある場合に、この設定で再パーティション数を指定します。値が 1 未満の場合は、再パーティションを要求しないことを意味します。                                                                                                                                                 | 0.1.0 |
| spark.clickhouse.write.repartitionStrictly         | false                                            | `true` の場合、Spark は書き込み時にデータソーステーブルへレコードを渡す前に、要求されるデータ分散を満たすよう、入力レコードを厳密にパーティション間へ分配します。`true` でない場合、Spark はクエリを高速化するために特定の最適化を適用することがありますが、その結果、分散要件が満たされないことがあります。なお、この設定は SPARK-37523（Spark 3.4 で利用可能）の適用が前提であり、このパッチがない場合は常に `true` として動作します。                       | 0.3.0 |
| spark.clickhouse.write.retryInterval               | 10秒                                              | 書き込み再試行間隔（秒）                                                                                                                                                                                                                                                           | 0.1.0 |
| spark.clickhouse.write.retryableErrorCodes         | 241                                              | 書き込み処理が失敗した際に ClickHouse サーバーから返される再試行可能なエラーコード。                                                                                                                                                                                                                       | 0.1.0 |

## サポートされているデータ型 {#supported-data-types}

このセクションでは、Spark と ClickHouse 間のデータ型マッピングについて説明します。以下の表は、ClickHouse から Spark へデータを読み込む場合、および Spark から ClickHouse へデータを挿入する場合のデータ型変換に関するクイックリファレンスです。

### ClickHouse から Spark へのデータの読み取り {#reading-data-from-clickhouse-into-spark}

| ClickHouse データ型                                              | Spark データ型                 | サポート状況 | プリミティブ型 | 備考                                               |
|-------------------------------------------------------------------|--------------------------------|-----------|--------------|----------------------------------------------------|
| `Nothing`                                                         | `NullType`                     | ✅         | はい          |                                                    |
| `Bool`                                                            | `BooleanType`                  | ✅         | はい          |                           |
| `UInt8`, `Int16`                                                  | `ShortType`                    | ✅         | はい          |                                                    |
| `Int8`                                                            | `ByteType`                     | ✅         | はい          |                                                    |
| `UInt16`,`Int32`                                                  | `IntegerType`                  | ✅         | はい          |                                                    |
| `UInt32`,`Int64`, `UInt64`                                        | `LongType`                     | ✅         | はい          |                                                    |
| `Int128`,`UInt128`, `Int256`, `UInt256`                           | `DecimalType(38, 0)`           | ✅         | はい          |                                                    |
| `Float32`                                                         | `FloatType`                    | ✅         | はい          |                                                    |
| `Float64`                                                         | `DoubleType`                   | ✅         | はい          |                                                    |
| `String`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6`              | `StringType`                   | ✅         | はい          |                                                    |
| `FixedString`                                                     | `BinaryType`, `StringType`     | ✅         | はい          | 設定 `READ_FIXED_STRING_AS` によって制御されます |
| `Decimal`                                                         | `DecimalType`                  | ✅         | はい          | `Decimal128` までの精度とスケール                 |
| `Decimal32`                                                       | `DecimalType(9, scale)`        | ✅         | はい          |                                                    |
| `Decimal64`                                                       | `DecimalType(18, scale)`       | ✅         | はい          |                                                    |
| `Decimal128`                                                      | `DecimalType(38, scale)`       | ✅         | はい          |                                                    |
| `Date`, `Date32`                                                  | `DateType`                     | ✅         | はい          |                                                    |
| `DateTime`, `DateTime32`, `DateTime64`                            | `TimestampType`                | ✅         | はい          |                                                    |
| `Array`                                                           | `ArrayType`                    | ✅         | いいえ        | 配列要素の型も変換されます                        |
| `Map`                                                             | `MapType`                      | ✅         | いいえ        | キーは `StringType` に制限されます                |
| `IntervalYear`                                                    | `YearMonthIntervalType(Year)`  | ✅         | はい          |                                                    |
| `IntervalMonth`                                                   | `YearMonthIntervalType(Month)` | ✅         | はい          |                                                    |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`          | ✅         | いいえ        | 対応する Interval 型が使用されます                |
| `JSON`, `Variant`                                                 | `VariantType`                  | ✅         | いいえ        | Spark 4.0 以降および ClickHouse 25.3 以降が必要です。`spark.clickhouse.read.jsonAs=string` を設定すると `StringType` として読み取ることができます |
| `Object`                                                          |                                | ❌         |              |                                                    |
| `Nested`                                                          |                                | ❌         |              |                                                    |
| `Tuple`                                                           | `StructType`                   | ✅         | いいえ        | 名前付きおよび名前なしのタプルをサポートします。名前付きタプルは構造体フィールドに名前で対応付けられ、名前なしタプルは `_1`、`_2` などを使用します。入れ子の構造体および Nullable フィールドをサポートします |
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

| Spark Data Type                     | ClickHouse Data Type | サポート有無 | プリミティブ型か | 備考                                   |
|-------------------------------------|----------------------|-------------|------------------|----------------------------------------|
| `BooleanType`                       | `Bool`               | ✅          | はい             | バージョン 0.9.0 以降、`Bool` 型（`UInt8` ではない）にマッピングされます |
| `ByteType`                          | `Int8`               | ✅          | はい             |                                        |
| `ShortType`                         | `Int16`              | ✅          | はい             |                                        |
| `IntegerType`                       | `Int32`              | ✅          | はい             |                                        |
| `LongType`                          | `Int64`              | ✅          | はい             |                                        |
| `FloatType`                         | `Float32`            | ✅          | はい             |                                        |
| `DoubleType`                        | `Float64`            | ✅          | はい             |                                        |
| `StringType`                        | `String`             | ✅          | はい             |                                        |
| `VarcharType`                       | `String`             | ✅          | はい             |                                        |
| `CharType`                          | `String`             | ✅          | はい             |                                        |
| `DecimalType`                       | `Decimal(p, s)`      | ✅          | はい             | 精度とスケールは `Decimal128` まで対応 |
| `DateType`                          | `Date`               | ✅          | はい             |                                        |
| `TimestampType`                     | `DateTime`           | ✅          | はい             |                                        |
| `ArrayType` (list, tuple, or array) | `Array`              | ✅          | いいえ           | 配列要素の型も変換されます             |
| `MapType`                           | `Map`                | ✅          | いいえ           | キーは `StringType` に制限されます     |
| `StructType`                        | `Tuple`              | ✅          | いいえ           | フィールド名付きの Tuple に変換されます |
| `VariantType`                       | `JSON` or `Variant`  | ✅          | いいえ           | Spark 4.0 以降および ClickHouse 25.3 以降が必要です。デフォルトでは `JSON` 型になります。複数の型を持つ `Variant` を指定するには `clickhouse.column.&lt;name&gt;.variant_types` プロパティを使用します。 |
| `Object`                            |                      | ❌          |                  |                                        |
| `Nested`                            |                      | ❌          |                  |                                        |

## 貢献とサポート {#contributing-and-support}

プロジェクトへの貢献や問題の報告をご希望の場合は、ぜひご協力ください。
[GitHub リポジトリ](https://github.com/ClickHouse/spark-clickhouse-connector)にアクセスして、issue の作成、改善提案、
または Pull Request の送信を行ってください。
コントリビューションは大歓迎です。作業を始める前に、リポジトリ内のコントリビューションガイドラインを確認してください。
ClickHouse Spark コネクタの改善にご協力いただき、ありがとうございます。
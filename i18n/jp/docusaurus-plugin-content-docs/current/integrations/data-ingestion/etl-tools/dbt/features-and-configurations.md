---
sidebar_label: '機能と設定'
slug: /integrations/dbt/features-and-configurations
sidebar_position: 2
description: '利用可能な機能および一般的な設定の概要'
keywords: ['clickhouse', 'dbt', 'features']
title: '機能と設定'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 機能と設定 \{#features-and-configurations\}

<ClickHouseSupportedBadge/>

このセクションでは、dbt で利用できる ClickHouse 向け機能の一部について説明します。

<TOCInline toc={toc}  maxHeadingLevel={3} />

## Profile.yml の構成 \{#profile-yml-configurations\}

dbt から ClickHouse に接続するには、`profiles.yml` ファイルに [プロファイル](https://docs.getdbt.com/docs/core/connect-data-platform/connection-profiles) を追加する必要があります。ClickHouse プロファイルは次の構文に従います。

```yaml
your_profile_name:
  target: dev
  outputs:
    dev:
      type: clickhouse

      # Optional
      schema: [default] # ClickHouse database for dbt models
      driver: [http] # http or native.  If not set this will be autodetermined based on port setting
      host: [localhost] 
      port: [8123]  # If not set, defaults to 8123, 8443, 9000, 9440 depending on the secure and driver settings 
      user: [default] # User for all database operations
      password: [<empty string>] # Password for the user
      cluster: [<empty string>] # If set, certain DDL/table operations will be executed with the `ON CLUSTER` clause using this cluster. Distributed materializations require this setting to work. See the following ClickHouse Cluster section for more details.
      verify: [True] # Validate TLS certificate if using TLS/SSL
      secure: [False] # Use TLS (native protocol) or HTTPS (http protocol)
      client_cert: [null] # Path to a TLS client certificate in .pem format
      client_cert_key: [null] # Path to the private key for the TLS client certificate
      retries: [1] # Number of times to retry a "retriable" database exception (such as a 503 'Service Unavailable' error)
      compression: [<empty string>] # Use gzip compression if truthy (http), or compression type for a native connection
      connect_timeout: [10] # Timeout in seconds to establish a connection to ClickHouse
      send_receive_timeout: [300] # Timeout in seconds to receive data from the ClickHouse server
      cluster_mode: [False] # Use specific settings designed to improve operation on Replicated databases (recommended for ClickHouse Cloud)
      use_lw_deletes: [False] # Use the strategy `delete+insert` as the default incremental strategy.
      check_exchange: [True] # Validate that clickhouse support the atomic EXCHANGE TABLES command.  (Not needed for most ClickHouse versions)
      local_suffix: [_local] # Table suffix of local tables on shards for distributed materializations.
      local_db_prefix: [<empty string>] # Database prefix of local tables on shards for distributed materializations. If empty, it uses the same database as the distributed table.
      allow_automatic_deduplication: [False] # Enable ClickHouse automatic deduplication for Replicated tables
      tcp_keepalive: [False] # Native client only, specify TCP keepalive configuration. Specify custom keepalive settings as [idle_time_sec, interval_sec, probes].
      custom_settings: [{}] # A dictionary/mapping of custom ClickHouse settings for the connection - default is empty.
      database_engine: '' # Database engine to use when creating new ClickHouse schemas (databases).  If not set (the default), new databases will use the default ClickHouse database engine (usually Atomic).
      threads: [1] # Number of threads to use when running queries. Before setting it to a number higher than 1, make sure to read the [read-after-write consistency](#read-after-write-consistency) section.
      
      # Native (clickhouse-driver) connection settings
      sync_request_timeout: [5] # Timeout for server ping
      compress_block_size: [1048576] # Compression block size if compression is enabled
```


### スキーマとデータベースの違い \{#schema-vs-database\}

dbt モデルのリレーション識別子 `database.schema.table` は、ClickHouse が `schema` をサポートしていないため、ClickHouse とは互換性がありません。
そのため、`schema` を ClickHouse のデータベースとみなす `schema.table` という単純化したアプローチを使用します。`default` データベースの使用は推奨されません。

### SET ステートメントに関する注意 \{#set-statement-warning\}

多くの環境では、すべての DBT クエリに対して ClickHouse の設定を有効にする目的で SET ステートメントを使用しても、その動作は必ずしも信頼できず、
思わぬ失敗を招く可能性があります。これは特に、クエリを複数ノードに分散するロードバランサー経由の HTTP 接続
（ClickHouse Cloud など）を使用している場合に顕著ですが、状況によってはネイティブな ClickHouse 接続でも発生し得ます。
そのため、必要な ClickHouse の設定は、一部で提案されているような pre-hook の "SET" ステートメントに依存するのではなく、
ベストプラクティスとして DBT プロファイルの "custom_settings" プロパティで設定することを推奨します。

### `quote_columns` の設定 \{#setting-quote_columns\}

警告が表示されないようにするには、`dbt_project.yml` 内で `quote_columns` の値を明示的に設定してください。詳細については、[quote&#95;columns のドキュメント](https://docs.getdbt.com/reference/resource-configs/quote_columns)を参照してください。

```yaml
seeds:
  +quote_columns: false  #or `true` if you have CSV column headers with spaces
```


### ClickHouse クラスターについて \{#about-the-clickhouse-cluster\}

ClickHouse クラスターを使用する場合は、次の 2 点を考慮する必要があります。

- `cluster` 設定を行うこと。
- 特に複数の `threads` を使用している場合に、書き込み直後の読み取り一貫性を確保すること。

#### クラスター設定 \{#cluster-setting\}

profile の `cluster` 設定を有効にすると、dbt-clickhouse は ClickHouse クラスターに対して実行されます。profile で `cluster` が設定されている場合、**Replicated エンジンを使用するものを除き、すべてのモデルはデフォルトで `ON CLUSTER` 句付きで作成されます。** これには次が含まれます:

* データベースの作成
* ビューのマテリアライゼーション
* テーブルおよびインクリメンタルのマテリアライゼーション
* Distributed のマテリアライゼーション

Replicated エンジンはレプリケーションを内部で管理するよう設計されているため、`ON CLUSTER` 句は**含まれません**。

特定のモデルについてクラスターベースの作成を**無効化**するには、`disable_on_cluster` 設定を追加します:

```sql
{{ config(
        engine='MergeTree',
        materialized='table',
        disable_on_cluster='true'
    )
}}

```

レプリケーションなしのエンジンを使用する table および incremental マテリアライゼーションは、`cluster` 設定の影響を受けません（モデルは
接続されているノード上にのみ作成されます）。

**互換性**

あるモデルが `cluster` 設定なしで作成されている場合、dbt-clickhouse はその状況を検出し、そのモデルに対しては `on cluster` 句を付けずにすべての DDL/DML を
実行します。


#### 書き込み直後の読み取り整合性 \{#read-after-write-consistency\}

dbt は、挿入直後読み取り（read-after-insert）整合性モデルに依存しています。これは、すべての操作が常に同じレプリカに送信されることを保証できない場合、複数のレプリカを持つ ClickHouse クラスターとは互換性がありません。日常的な dbt の利用では問題が発生しないかもしれませんが、この保証を満たすために、クラスター構成に応じていくつかの戦略があります。

- ClickHouse Cloud クラスターを使用している場合は、プロファイルの `custom_settings` プロパティで `select_sequential_consistency: 1` を設定するだけで済みます。この設定に関する詳細は[こちら](/operations/settings/settings#select_sequential_consistency)を参照してください。
- 自前でホストしているクラスターを使用している場合は、すべての dbt リクエストが同じ ClickHouse レプリカに送信されるようにしてください。その前段にロードバランサーがある場合は、常に同じレプリカに到達できるように、`replica aware routing` や `sticky sessions` といったメカニズムの利用を検討してください。ClickHouse Cloud 以外のクラスターで `select_sequential_consistency = 1` を設定として追加することは[推奨されません](/operations/settings/settings#select_sequential_consistency)。

## ClickHouse の追加マクロ \{#additional-clickhouse-macros\}

### モデルマテリアライゼーションユーティリティマクロ \{#model-materialization-utility-macros\}

次のマクロは、ClickHouse 固有のテーブルおよびビューの作成を容易にするために含まれています:

- `engine_clause` -- `engine` モデル構成プロパティを使用して、ClickHouse のテーブルエンジンを割り当てます。dbt-clickhouse はデフォルトで `MergeTree` エンジンを使用します。
- `partition_cols` -- `partition_by` モデル構成プロパティを使用して、ClickHouse のパーティションキーを割り当てます。デフォルトではパーティションキーは割り当てられません。
- `order_cols` -- `order_by` モデル構成プロパティを使用して、ClickHouse の ORDER BY／ソートキーを割り当てます。指定されない場合、ClickHouse は空の tuple() を使用し、テーブルはソートされません。
- `primary_key_clause` -- `primary_key` モデル構成プロパティを使用して、ClickHouse のプライマリキーを割り当てます。デフォルトではプライマリキーが設定され、ClickHouse は ORDER BY 句をプライマリキーとして使用します。
- `on_cluster_clause` -- `cluster` プロファイルプロパティを使用して、特定の dbt の操作に `ON CLUSTER` 句を追加します: 分散マテリアライゼーション、ビューの作成、データベースの作成。
- `ttl_config` -- `ttl` モデル構成プロパティを使用して、ClickHouse テーブルの有効期限 (TTL) 式を割り当てます。デフォルトでは TTL は割り当てられません。

### s3Source helper macro \{#s3source-helper-macro\}

`s3source` マクロは、ClickHouse の S3 テーブル関数を使用して、S3 上のデータを ClickHouse から直接参照する処理を簡略化します。名前付き設定 Dictionary（Dictionary 名は必ず `s3` で終わる必要があります）から S3 テーブル関数のパラメータを設定することで動作します。マクロは最初に
プロファイルの `vars` 内で Dictionary を探し、その後にモデル設定内を検索します。Dictionary には、S3 テーブル関数のパラメータを設定するために使用される、
以下のキーを含めることができます。

| Argument Name         | Description                                                                                                                                                                                  |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| bucket                | バケットのベース URL。例: `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi`。プロトコルが指定されていない場合は `https://` が使用されます。 |
| path                  | テーブルクエリに使用する S3 パス。例: `/trips_4.gz`。S3 のワイルドカードがサポートされています。                                                                                           |
| fmt                   | 対象となる S3 オブジェクトの想定される ClickHouse 入力フォーマット（`TSV` や `CSVWithNames` など）。                                                                                        |
| structure             | バケット内データのカラム構造。`['id UInt32', 'date DateTime', 'value String']` のような name/datatype ペアのリスト。指定されていない場合、ClickHouse が構造を推論します。 |
| aws_access_key_id     | S3 アクセスキー ID。                                                                                                                                                                         |
| aws_secret_access_key | S3 シークレットキー。                                                                                                                                                                       |
| role_arn              | S3 オブジェクトへ安全にアクセスするために使用する ClickHouseAccess IAM ロールの ARN。詳細はこの[ドキュメント](/cloud/data-sources/secure-s3)を参照してください。 |
| compression           | S3 オブジェクトで使用されている圧縮方式。指定されていない場合、ClickHouse はファイル名に基づいて圧縮方式を推定しようとします。                                                               |

このマクロの使用例については、
[S3 test file](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/clickhouse/test_clickhouse_s3.py)
を参照してください。

### クロスデータベースマクロのサポート \{#cross-database-macro-support\}

dbt-clickhouse は、現在 `dbt Core` に含まれているクロスデータベースマクロのほとんどを、次の例外を除いてサポートしています。

* `split_part` SQL 関数は ClickHouse では `splitByChar` 関数として実装されています。この関数では「分割」用のデリミタに定数文字列を使用する必要があるため、このマクロで使用される `delimeter` パラメータはカラム名ではなく文字列として解釈されます。
* 同様に、ClickHouse の `replace` SQL 関数では `old_chars` および `new_chars` パラメータに定数文字列を指定する必要があります。そのため、このマクロを呼び出す際、これらのパラメータはカラム名ではなく文字列として解釈されます。

## カタログ対応 \{#catalog-support\}

### dbt カタログ連携のステータス \{#dbt-catalog-integration-status\}

dbt Core v1.10 でカタログ連携機能が導入されました。これにより、アダプターは Apache Iceberg のようなオープンなテーブル形式を管理する外部カタログにモデルをマテリアライズできるようになります。**この機能は、現時点では dbt-clickhouse にネイティブには実装されていません。** この機能実装の進捗は [GitHub issue #489](https://github.com/ClickHouse/dbt-clickhouse/issues/489) で追跡できます。

### ClickHouse カタログサポート \{#clickhouse-catalog-support\}

ClickHouse は最近、Apache Iceberg テーブルおよびデータカタログのネイティブサポートを追加しました。多くの機能はまだ `experimental` ですが、最新バージョンの ClickHouse を使用していれば既に利用できます。

* ClickHouse では、[Iceberg table engine](/engines/table-engines/integrations/iceberg) と [iceberg table function](/sql-reference/table-functions/iceberg) を使用して、オブジェクトストレージ（S3、Azure Blob Storage、Google Cloud Storage）に保存された **Iceberg テーブルに対してクエリを実行** できます。

* さらに、ClickHouse は [DataLakeCatalog database engine](/engines/database-engines/datalakecatalog) を提供しており、AWS Glue Catalog、Databricks Unity Catalog、Hive Metastore、REST Catalogs などの **外部データカタログへの接続** を可能にします。これにより、データを複製することなく、外部カタログから直接、オープンテーブル形式のデータ（Iceberg、Delta Lake）に対してクエリを実行できます。

### Iceberg とカタログを扱うためのワークアラウンド \{#workarounds-iceberg-catalogs\}

前述のツールを使って ClickHouse クラスター内に Iceberg テーブルまたはカタログをすでに定義している場合、dbt プロジェクトからそれらのデータを読み取ることができます。dbt の `source` 機能を活用して、これらのテーブルを dbt プロジェクト内で参照できます。たとえば、REST Catalog 内のテーブルにアクセスしたい場合は、次のようにします。

1. **外部カタログを指すデータベースを作成する:**

```sql
-- Example with REST Catalog
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE iceberg_catalog
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS 
    catalog_type = 'rest', 
    storage_endpoint = 'http://minio:9000/lakehouse', 
    warehouse = 'demo'
```

2. **カタログデータベースとそのテーブルを dbt のソースとして定義します。** テーブルはあらかじめ ClickHouse 上で作成され、利用可能になっている必要があります

```yaml
version: 2

sources:
  - name: external_catalog
    database: iceberg_catalog
    tables:
      - name: orders
      - name: customers
```

3. **dbt モデルでカタログ テーブルを使用する:**

```sql
SELECT 
    o.order_id,
    c.customer_name,
    o.order_date
FROM {{ source('external_catalog', 'orders') }} o
INNER JOIN {{ source('external_catalog', 'customers') }} c
    ON o.customer_id = c.customer_id
```


### 回避策に関する注意事項 \{#benefits-workarounds\}

これらの回避策の利点は次のとおりです。

* ネイティブな dbt カタログ連携を待たずに、さまざまな外部テーブルタイプおよび外部カタログにすぐにアクセスできます。
* ネイティブなカタログサポートが利用可能になった際に、シームレスな移行パスが確保されます。

しかし、現時点ではいくつかの制限があります。

* **手動セットアップ:** Iceberg テーブルおよびカタログデータベースは、dbt から参照できるようにする前に、あらかじめ ClickHouse 上で手動作成しておく必要があります。
* **カタログレベルの DDL なし:** dbt は、外部カタログ内で Iceberg テーブルを作成・削除するといったカタログレベルの操作を管理できません。そのため、現時点では dbt コネクタからそれらを作成することはできません。Iceberg() エンジンを使ったテーブル作成は、将来的に追加される可能性があります。
* **書き込み操作:** 現在、Iceberg テーブルおよび Data Catalog テーブルへの書き込みは制限されています。どのオプションが利用可能かを確認するため、ClickHouse のドキュメントを参照してください。
---
sidebar_label: '機能と設定'
slug: /integrations/dbt/features-and-configurations
sidebar_position: 2
description: 'ClickHouse で dbt を使用する際の機能'
keywords: ['clickhouse', 'dbt', 'features']
title: '機能と設定'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 機能と設定 {#features-and-configurations}

<ClickHouseSupportedBadge/>

このセクションでは、dbt で ClickHouse を利用する際に使用できる機能の一部について説明します。

<TOCInline toc={toc}  maxHeadingLevel={3} />

## Profile.yml の設定 {#profile-yml-configurations}

dbt から ClickHouse に接続するには、`profiles.yml` ファイルに[プロファイル](https://docs.getdbt.com/docs/core/connect-data-platform/connection-profiles)を追加する必要があります。ClickHouse 用のプロファイルは、次の構文になります。

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


### スキーマとデータベースの違い {#schema-vs-database}

dbt モデルのリレーション識別子 `database.schema.table` は、ClickHouse が `schema` を
サポートしていないため、ClickHouse とは互換性がありません。
そのため、`schema.table` という単純化した方式を使用します。ここでの `schema` は ClickHouse のデータベースを表します。
`default` データベースの使用は推奨されません。

### SET ステートメントに関する注意事項 {#set-statement-warning}

多くの環境において、すべての DBT クエリに対して ClickHouse の設定を永続させる目的で SET ステートメントを使用する方法は信頼性が低く、
予期しない障害を引き起こす可能性があります。これは特に、複数ノード間でクエリを分散するロードバランサー経由の HTTP 接続
（ClickHouse Cloud など）を使用している場合に顕著ですが、状況によってはネイティブな ClickHouse 接続でも発生し得ます。
そのため、pre-hook の "SET" ステートメントに依存するのではなく、ベストプラクティスとして、必要な ClickHouse 設定は
DBT プロファイルの "custom_settings" プロパティで構成することを推奨します。

### `quote_columns` の設定 {#setting-quote_columns}

警告を回避するには、`dbt_project.yml` 内で `quote_columns` に値を明示的に設定してください。詳細については、[quote&#95;columns に関するドキュメント](https://docs.getdbt.com/reference/resource-configs/quote_columns)を参照してください。

```yaml
seeds:
  +quote_columns: false  #or `true` if you have CSV column headers with spaces
```


### ClickHouse クラスターについて {#about-the-clickhouse-cluster}

ClickHouse クラスターを使用する場合、次の 2 点を考慮する必要があります。

- `cluster` 設定の構成。
- 特に複数の `threads` を使用している場合に、書き込み直後の読み取り一貫性を確保すること。

#### クラスター設定 {#cluster-setting}

profile 内で `cluster` を設定すると、dbt-clickhouse は ClickHouse クラスターに対して実行されます。profile で `cluster` が設定されている場合、**Replicated エンジンを使用しているものを除き、すべてのモデルがデフォルトで `ON CLUSTER` 句付きで作成されます**。これには次が含まれます:

* データベースの作成
* View マテリアライゼーション
* Table および incremental マテリアライゼーション
* Distributed マテリアライゼーション

Replicated エンジンは、レプリケーションを内部的に管理するように設計されているため、`ON CLUSTER` 句は**含まれません**。

特定のモデルについてクラスター経由での作成を**無効化**するには、`disable_on_cluster` 設定を追加します:

```sql
{{ config(
        engine='MergeTree',
        materialized='table',
        disable_on_cluster='true'
    )
}}

```

非レプリケートエンジンを使用した table および incremental マテリアライゼーションは、`cluster` 設定の影響を受けません（モデルは接続中のノード上にのみ作成されます）。

**互換性**

モデルが `cluster` 設定なしで作成されている場合、dbt-clickhouse はその状況を検知し、そのモデルに対しては `on cluster` 句を付けずにすべての DDL/DML を実行します。


#### Read-after-write Consistency {#read-after-write-consistency}

dbt は、挿入後（書き込み直後）の読み取り一貫性モデルに依存しています。すべての操作が必ず同じレプリカに送信されることを保証できない場合、このモデルは複数のレプリカを持つ ClickHouse クラスターとは互換性がありません。日常的な dbt の利用では問題が発生しない場合もありますが、この保証を満たすための戦略がいくつかあり、クラスター構成に応じて選択できます。

- ClickHouse Cloud クラスターを使用している場合は、プロファイルの `custom_settings` プロパティに `select_sequential_consistency: 1` を設定するだけで済みます。この設定の詳細は[こちら](/operations/settings/settings#select_sequential_consistency)を参照してください。
- 自己ホスト型クラスターを使用している場合は、すべての dbt リクエストが同じ ClickHouse レプリカに送信されるようにしてください。その上にロードバランサーがある場合は、常に同じレプリカに到達できるように、`replica aware routing` や `sticky sessions` の仕組みを利用することを検討してください。ClickHouse Cloud 以外のクラスターで `select_sequential_consistency = 1` を設定に追加することは[推奨されません](/operations/settings/settings#select_sequential_consistency)。

## 機能の概要 {#general-information-about-features}

### 一般的なモデル設定 {#general-model-configurations}

次の表は、利用可能なマテリアライゼーションの一部で共通して使われる設定を示します。一般的な dbt モデル設定の詳細については、[dbt ドキュメント](https://docs.getdbt.com/category/general-configs) を参照してください。

| Option                 | Description                                                                                                                                                                                                                                                                                                          | Default if any |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| engine                 | テーブル作成時に使用するテーブルエンジン（テーブルの種類）                                                                                                                                                                                                                                                           | `MergeTree()`  |
| order_by               | カラム名または任意の式のタプル。小さなスパースな索引を作成してデータ検索を高速化できます。                                                                                                                                                                                                                          | `tuple()`      |
| partition_by           | パーティションは、指定された条件に基づいてテーブル内のレコードを論理的にまとめたものです。パーティションキーには、テーブルのカラムを用いた任意の式を使用できます。                                                                                                                                                    |                |
| primary_key            | order_by と同様の ClickHouse のプライマリキー式。指定されていない場合、ClickHouse は order_by の式をプライマリキーとして使用します。                                                                                                                                                                                 |                |
| settings               | このモデルで 'CREATE TABLE' などの DDL 文に使用される "TABLE" 設定のマップ／Dictionary                                                                                                                                                                                                                                 |                |
| query_settings         | このモデルと組み合わせて `INSERT` または `DELETE` 文で使用される、ClickHouse のユーザーレベル設定のマップ／Dictionary                                                                                                                                                                                                  |                |
| ttl                    | テーブルに対して使用される TTL 式。TTL 式は、テーブルの有効期限 (TTL) を指定するための文字列です。                                                                                                                                                                                                                   |                |
| indexes                | 作成する[データスキッピングインデックス](/optimize/skipping-indexes)のリスト。[データスキッピングインデックスについて](#data-skipping-indexes) を参照してください。                                                                                                                                                    |                |
| sql_security           | ビューの基礎となるクエリを実行する際に使用する ClickHouse ユーザー。[指定可能な値](/sql-reference/statements/create/view#sql_security): `definer`, `invoker`.                                                                                                                                                          |                |
| definer                | `sql_security` が `definer` に設定されている場合、`definer` 句で既存の任意のユーザーまたは `CURRENT_USER` を指定する必要があります。                                                                                                                                                                                 |                |
| projections            | 作成する [projections](/data-modeling/projections) のリスト。[projections について](#projections) を参照してください。                                                                                                                                                                                                |                |

#### データスキッピングインデックスについて {#data-skipping-indexes}

データスキッピングインデックスは、`table` マテリアライゼーションでのみ利用できます。テーブルにデータスキッピングインデックスの一覧を追加するには、`indexes` 構成を使用します。

```sql
{{ config(
        materialized='table',
        indexes=[{
          'name': 'your_index_name',
          'definition': 'your_column TYPE minmax GRANULARITY 2'
        }]
) }}
```


#### PROJECTION について {#projections}

`projections` 設定を使用して、`table` および `distributed_table` のマテリアライゼーションに [projections](/data-modeling/projections) を追加できます。

```sql
{{ config(
       materialized='table',
       projections=[
           {
               'name': 'your_projection_name',
               'query': 'SELECT department, avg(age) AS avg_age GROUP BY department'
           }
       ]
) }}
```

**注記**: 分散テーブルでは、PROJECTION は分散プロキシテーブルではなく `_local` テーブルに適用されます。


### サポートされているテーブルエンジン {#supported-table-engines}

| タイプ                | 詳細                                                                                       |
|------------------------|-------------------------------------------------------------------------------------------|
| MergeTree (default)    | https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/.         |
| HDFS                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs                    |
| MaterializedPostgreSQL | https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql |
| S3                     | https://clickhouse.com/docs/en/engines/table-engines/integrations/s3                      |
| EmbeddedRocksDB        | https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb        |
| Hive                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hive                    |

**注意**: materialized view で使用する場合、すべての *MergeTree エンジンがサポートされます。

### 実験的にサポートされているテーブルエンジン {#experimental-supported-table-engines}

| 種類             | 詳細                                                                      |
|------------------|---------------------------------------------------------------------------|
| Distributed Table | https://clickhouse.com/docs/en/engines/table-engines/special/distributed. |
| Dictionary        | https://clickhouse.com/docs/en/engines/table-engines/special/dictionary   |

上記のいずれかのエンジンを使用して dbt から ClickHouse へ接続する際に問題が発生した場合は、[こちら](https://github.com/ClickHouse/dbt-clickhouse/issues)から Issue を作成してください。

### モデル設定に関する注意事項 {#a-note-on-model-settings}

ClickHouse には、複数の種類／レベルの「設定 (settings)」があります。上記のモデル構成では、そのうち 2 種類が
設定可能です。`settings` は、DDL 文の `CREATE TABLE/VIEW` で使用される `SETTINGS`
句を指し、一般的に特定の ClickHouse テーブルエンジンに固有の設定を意味します。新しい
`query_settings` は、モデルのマテリアライゼーション（インクリメンタルマテリアライゼーションを含む）に使用される `INSERT` および `DELETE` クエリに `SETTINGS` 句を追加するために使用されます。
ClickHouse の設定は何百種類もあり、どれが「テーブル」の設定でどれが「ユーザー」の
設定なのかが常に明確とは限りません（もっとも、後者は一般的に
`system.settings` テーブルで参照できます）。一般的にはデフォルト値の使用が推奨され、これらのプロパティを利用する場合は、
事前に十分な調査とテストを行う必要があります。

### カラム設定 {#column-configuration}

> **_NOTE:_** 以下のカラム設定オプションを使用するには、[model contracts](https://docs.getdbt.com/docs/collaborate/govern/model-contracts) を有効にしておく必要があります。

| Option | Description                                                                                                                                                | Default if any |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| codec  | カラムの DDL 内で `CODEC()` に渡される引数を指定する文字列です。たとえば、`codec: "Delta, ZSTD"` は `CODEC(Delta, ZSTD)` としてコンパイルされます。    |    
| ttl    | カラムの DDL 内で有効期限 (TTL) のルールを定義する [TTL (time-to-live) 式](https://clickhouse.com/docs/guides/developer/ttl) を指定する文字列です。たとえば、`ttl: ts + INTERVAL 1 DAY` は `TTL ts + INTERVAL 1 DAY` としてコンパイルされます。 |

#### スキーマ構成の例 {#example-of-schema-configuration}

```yaml
models:
  - name: table_column_configs
    description: 'Testing column-level configurations'
    config:
      contract:
        enforced: true
    columns:
      - name: ts
        data_type: timestamp
        codec: ZSTD
      - name: x
        data_type: UInt8
        ttl: ts + INTERVAL 1 DAY
```


#### 複雑な型の追加 {#adding-complex-types}

dbt は、モデルを作成するために使用される SQL を解析して、各カラムのデータ型を自動的に判別します。しかし、場合によってはこの処理でデータ型を正確に判別できず、コントラクトの `data_type` プロパティで指定した型と競合してしまうことがあります。これに対処するため、モデルの SQL 内で `CAST()` 関数を使用して、必要な型を明示的に指定することを推奨します。例えば、次のようになります。

```sql
{{
    config(
        materialized="materialized_view",
        engine="AggregatingMergeTree",
        order_by=["event_type"],
    )
}}

select
  -- event_type may be infered as a String but we may prefer LowCardinality(String):
  CAST(event_type, 'LowCardinality(String)') as event_type,
  -- countState() may be infered as `AggregateFunction(count)` but we may prefer to change the type of the argument used:
  CAST(countState(), 'AggregateFunction(count, UInt32)') as response_count, 
  -- maxSimpleState() may be infered as `SimpleAggregateFunction(max, String)` but we may prefer to also change the type of the argument used:
  CAST(maxSimpleState(event_type), 'SimpleAggregateFunction(max, LowCardinality(String))') as max_event_type
from {{ ref('user_events') }}
group by event_type
```


## 機能 {#features}

### マテリアライゼーション: view {#materialization-view}

dbt モデルは [ClickHouse view](/sql-reference/table-functions/view/)
として作成でき、次の構文を使用して設定できます。

プロジェクトファイル (`dbt_project.yml`):

```yaml
models:
  <resource-path>:
    +materialized: view
```

もしくは config ブロック（`models/<model_name>.sql`）:

```python
{{ config(materialized = "view") }}
```


### マテリアライゼーション: テーブル {#materialization-table}

dbt モデルは [ClickHouse テーブル](/operations/system-tables/tables/) として作成でき、
次の構文で設定できます。

プロジェクトファイル (`dbt_project.yml`):

```yaml
models:
  <resource-path>:
    +materialized: table
    +order_by: [ <column-name>, ... ]
    +engine: <engine-type>
    +partition_by: [ <column-name>, ... ]
```

または config ブロック内（`models/<model_name>.sql`）:

```python
{{ config(
    materialized = "table",
    engine = "<engine-type>",
    order_by = [ "<column-name>", ... ],
    partition_by = [ "<column-name>", ... ],
      ...
    ]
) }}
```


### マテリアライゼーション: incremental {#materialization-incremental}

テーブルモデルは、dbt の各実行ごとに再構築されます。これは、結果セットが大きい場合や変換が複雑な場合には、実用的ではなくなったり、極めて高コストになったりする可能性があります。この課題に対応し、ビルド時間を短縮するために、dbt モデルを incremental な ClickHouse テーブルとして作成し、次の構文で設定できます:

`dbt_project.yml` 内でのモデル定義:

```yaml
models:
  <resource-path>:
    +materialized: incremental
    +order_by: [ <column-name>, ... ]
    +engine: <engine-type>
    +partition_by: [ <column-name>, ... ]
    +unique_key: [ <column-name>, ... ]
    +inserts_only: [ True|False ]
```

または `models/<model_name>.sql` の config ブロックで指定:

```python
{{ config(
    materialized = "incremental",
    engine = "<engine-type>",
    order_by = [ "<column-name>", ... ],
    partition_by = [ "<column-name>", ... ],
    unique_key = [ "<column-name>", ... ],
    inserts_only = [ True|False ],
      ...
    ]
) }}
```


#### 設定 {#incremental-configurations}

このマテリアライゼーションタイプに特有の設定は、以下のとおりです。

| Option                   | Description                                                                                                                                                                                                                                                       | Required?                                                                                         |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| `unique_key`             | 行を一意に識別するカラム名のタプル。ユニーク制約の詳細については[こちら](https://docs.getdbt.com/docs/build/incremental-models#defining-a-unique-key-optional)を参照してください。                                                                                       | 必須。指定しない場合、変更された行がインクリメンタルテーブルに重複して追加されます。            |
| `inserts_only`           | 同じ動作をする `append` インクリメンタル `strategy` に置き換えられ、非推奨となりました。インクリメンタルモデルで True に設定すると、中間テーブルを作成せずに、インクリメンタル更新が直接ターゲットテーブルに挿入されます。`inserts_only` が設定されている場合、`incremental_strategy` は無視されます。 | 任意（デフォルト: `False`）                                                                      |
| `incremental_strategy`   | インクリメンタルマテリアライゼーションに使用する戦略。`delete+insert`、`append`、`insert_overwrite`、`microbatch` がサポートされています。各戦略の詳細については[こちら](/integrations/dbt/features-and-configurations#incremental-model-strategies)を参照してください。 | 任意（デフォルト: 'default'）                                                                    |
| `incremental_predicates` | インクリメンタルマテリアライゼーションに適用される追加条件（`delete+insert` 戦略にのみ適用されます）。                                                                                                                                                                                    | 任意                                                                                             |                      

#### インクリメンタルモデルの戦略 {#incremental-model-strategies}

`dbt-clickhouse` は 3 つのインクリメンタルモデル戦略をサポートしています。

##### 既定（レガシー）戦略 {#default-legacy-strategy}

これまで ClickHouse では、非同期の「mutation」という仕組みでしか、更新や削除を限定的にしかサポートしていませんでした。
想定される dbt の動作を再現するために、
dbt-clickhouse はデフォルトで、影響を受けない（削除されず、変更されていない）「古い」
レコードすべてに加え、新規または更新されたレコードを含む新しい一時テーブルを作成し、
その後、この一時テーブルを既存のインクリメンタルモデルのリレーションと入れ替え（swap または exchange）ます。
これは、操作が完了する前に何か問題が発生した場合にも元のリレーションを保持できる唯一の戦略ですが、
元のテーブルのフルコピーを行う必要があるため、非常にコストが高く、実行に時間がかかる可能性があります。

##### Delete+Insert 戦略 {#delete-insert-strategy}

ClickHouse ではバージョン 22.8 から実験的機能として「論理削除 (lightweight delete)」が追加されました。論理削除は、
ClickHouse のデータパーツを書き換える必要がないため、ALTER TABLE ... DELETE
操作よりも大幅に高速です。インクリメンタル戦略である `delete+insert`
は、論理削除を活用して、
従来の ("legacy") 戦略と比べて大幅に優れたパフォーマンスを発揮するインクリメンタルマテリアライゼーションを実現します。ただし、この戦略を使用する際には重要な注意点があります。

- 論理削除は、ClickHouse サーバーで
  `allow_experimental_lightweight_delete=1` を使用して有効化するか、
  プロファイルで `use_lw_deletes=true` を設定しておく必要があります (これにより dbt セッションで当該 SETTING が有効になります)
- 論理削除は現在プロダクション利用が可能な状態ですが、ClickHouse バージョン 23.3 より前ではパフォーマンス上またはその他の問題が発生する可能性があります
- この戦略は、(中間テーブルや一時テーブルを作成せずに) 対象となるテーブル/リレーションを直接操作するため、
  処理中に問題が発生した場合、
  インクリメンタルモデル内のデータが不正な状態になる可能性があります
- 論理削除を使用する場合、dbt-clickhouse は `allow_nondeterministic_mutations` SETTING を有効にします。ごくまれなケースとして、非決定的な `incremental_predicates`
  を使用していると、
  更新/削除対象のアイテムに対してレースコンディションが発生する可能性があります (および ClickHouse ログに関連するログメッセージが出力されることがあります)。
  一貫した結果を保証するために、
  インクリメンタル述語には、インクリメンタルなマテリアライゼーション中に変更されないデータに対するサブクエリのみを含めるようにしてください。

##### マイクロバッチ戦略（dbt-core >= 1.9 が必要） {#microbatch-strategy}

インクリメンタル戦略 `microbatch` は、dbt-core バージョン 1.9 以降で利用できる機能であり、大規模な時系列データ変換を効率的に処理するために設計されています。dbt-clickhouse では、既存の `delete_insert`
インクリメンタル戦略を拡張し、`event_time` と `batch_size` モデル設定に基づいて増分処理をあらかじめ定義された時系列バッチに分割します。

大規模な変換処理への対応に加えて、microbatch には次のような利点があります。

- [失敗したバッチの再処理](https://docs.getdbt.com/docs/build/incremental-microbatch#retry)。
- [バッチの並列実行](https://docs.getdbt.com/docs/build/parallel-batch-execution)の自動検出。
- [バックフィル](https://docs.getdbt.com/docs/build/incremental-microbatch#backfills)における複雑な条件ロジックの不要化。

microbatch の詳細な使用方法については、[公式ドキュメント](https://docs.getdbt.com/docs/build/incremental-microbatch)を参照してください。

###### 利用可能なマイクロバッチ設定 {#available-microbatch-configurations}

| Option             | Description                                                                                                                                                                                                                                                                                                                                | Default if any |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| event_time         | 行が「いつ発生したか」を示すカラム。マイクロバッチモデルおよびフィルタ対象となる直接の親モデルに必須です。                                                                                                                                                                                                                                   |                |
| begin              | マイクロバッチモデルにおける「時間の起点」。初回ビルドまたはフルリフレッシュビルドにおける開始ポイントです。たとえば、2024-10-01 に実行される日次粒度のマイクロバッチモデルで begin = '2023-10-01' を指定した場合、366 個のバッチ（うるう年です）に加えて「今日」のバッチを処理します。                                              |                |
| batch_size         | バッチの粒度。サポートされている値は `hour`、`day`、`month`、`year` です。                                                                                                                                                                                                                                                                |                |
| lookback           | 遅延到着するレコードを取り込むために、最新のブックマークより前の X 個分のバッチも処理します。                                                                                                                                                                                                                                              | 1              |
| concurrent_batches | バッチを同時（並行）に実行するかどうかについて、dbt の自動検出を上書きします。詳しくは [concurrent_batches の設定](https://docs.getdbt.com/docs/build/incremental-microbatch#configure-concurrent_batches) を参照してください。true に設定するとバッチを同時（並行）に実行し、false に設定するとバッチを順次（1 つずつ）実行します。 |                |

##### Append 戦略 {#append-strategy}

この戦略は、以前のバージョンの dbt-clickhouse における `inserts_only` 設定を置き換えるものです。この戦略では、新しい行を既存のリレーションに単純に追加します。
その結果、重複行は排除されず、一時テーブルや中間テーブルも作成されません。データ内で重複が許容されている場合、あるいはインクリメンタルクエリの WHERE 句／フィルターによって重複が除外される場合には、最も高速なアプローチです。

##### insert_overwrite ストラテジー (実験的) {#insert-overwrite-strategy}

> [IMPORTANT]  
> 現在、insert_overwrite ストラテジーは分散マテリアライゼーションでは完全には動作しません。

以下の手順を実行します:

1. インクリメンタルモデルのリレーションと同じ構造を持つステージング（一時）テーブルを作成します:  
   `CREATE TABLE <staging> AS <target>`。
2. `SELECT` で生成された新規レコードのみをステージングテーブルに挿入します。
3. ステージングテーブルに存在する新規パーティションのみをターゲットテーブルに反映します。

このアプローチには次の利点があります:

- テーブル全体をコピーしないため、デフォルトのストラテジーより高速です。
- INSERT 操作が正常に完了するまで元のテーブルを変更しないため、他のストラテジーより安全です。
  途中で障害が発生した場合でも、元のテーブルは変更されません。
- 「パーティションの不変性」というデータエンジニアリングのベストプラクティスを実現します。これにより、
  インクリメンタル処理や並列データ処理、ロールバックなどが簡素化されます。

このストラテジーでは、モデル設定で `partition_by` が設定されている必要があります。モデル設定内の
他のストラテジー固有のパラメータはすべて無視されます。

### マテリアライゼーション: materialized&#95;view（実験的） {#materialized-view}

`materialized_view` マテリアライゼーションは、既存の（ソース）テーブルに対する `SELECT` である必要があります。アダプターは
モデル名を持つターゲットテーブルと、
名前が `<model_name>_mv` の ClickHouse MATERIALIZED VIEW を作成します。PostgreSQL とは異なり、ClickHouse の materialized view は
「静的」ではなく（対応する REFRESH 操作もありません）、代わりに「insert trigger」として動作し、
ソーステーブルに行が挿入された際に、ビュー定義内で定義された `SELECT`
の「変換」を使用して新しい行をターゲットテーブルに挿入します。この機能の使い方についての入門的な例については、[テストファイル](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py)
を参照してください。

ClickHouse では、複数の materialized view が同じターゲットテーブルにレコードを書き込むことができます。
dbt-clickhouse でこれをサポートするために、モデルファイル内で `UNION` を構成し、それぞれの
materialized view の SQL が `--my_mv_name:begin` および `--my_mv_name:end` という形式のコメントで囲まれるようにします。

たとえば、次の例では 2 つの materialized view を作成し、どちらも
モデルの同じ宛先テーブルにデータを書き込みます。materialized view の名前は `<model_name>_mv1` および `<model_name>_mv2` の形式になります。

```sql
--mv1:begin
select a,b,c from {{ source('raw', 'table_1') }}
--mv1:end
union all
--mv2:begin
select a,b,c from {{ source('raw', 'table_2') }}
--mv2:end
```

> 重要！
>
> 複数の materialized view (MV) を持つモデルを更新する際、特に MV 名の 1 つの名前を変更する場合、
> dbt-clickhouse は古い MV を自動的には削除しません。その代わりに、
> 次のような警告が表示されます:
> `Warning - Table <previous table name> was detected with the same pattern as model name <your model name> but was not found in this run. In case it is a renamed mv that was previously part of this model, drop it manually (!!!) `


#### データのキャッチアップ {#data-catch-up}

現在、materialized view (MV) を作成する際は、MV 自体が作成される前に、まずターゲットテーブルが履歴データで事前に埋められます。

言い換えると、dbt-clickhouse は最初にターゲットテーブルを作成し、MV 用に定義されたクエリに基づいて履歴データを事前ロードします。このステップの後になって初めて MV が作成されます。

MV 作成時に履歴データを事前ロードしたくない場合は、`catch-up` 設定を False に設定することで、この挙動を無効にできます。

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    catchup=False
)}}
```


#### リフレッシャブルmaterialized view {#refreshable-materialized-views}

[Refreshable Materialized View](/materialized-view/refreshable-materialized-view) を使用するには、
MV モデル内で必要に応じて以下の設定を調整します（これらの設定はすべて、
リフレッシャブルな config オブジェクト内で指定されることを想定しています）。

| Option                        | Description                                                                                | Required | Default Value |
| ----------------------------- | ------------------------------------------------------------------------------------------ | -------- | ------------- |
| refresh&#95;interval          | interval 句（必須）                                                                             | Yes      |               |
| randomize                     | ランダマイズを指定する句で、`RANDOMIZE FOR` の後に続きます                                                      |          |               |
| append                        | `True` に設定すると、各リフレッシュ時に既存の行を削除せずにテーブルへ行を挿入します。挿入は通常の INSERT SELECT と同様にアトミックではありません。       |          | False         |
| depends&#95;on                | リフレッシャブル MV の依存関係リストです。依存関係は `{schema}.{view_name}` の形式で指定してください                           |          |               |
| depends&#95;on&#95;validation | `depends_on` で指定された依存関係の存在を検証するかどうかを指定します。依存関係にスキーマが含まれていない場合、検証はスキーマ `default` に対して実行されます |          | False         |

リフレッシャブルmaterialized view の config 例:

```python
{{
    config(
        materialized='materialized_view',
        refreshable={
            "interval": "EVERY 5 MINUTE",
            "randomize": "1 MINUTE",
            "append": True,
            "depends_on": ['schema.depend_on_model'],
            "depends_on_validation": True
        }
    )
}}
```


#### 制限事項 {#limitations}

* ClickHouse で依存関係を持つリフレッシャブルmaterialized view (MV) を作成する際、指定した依存関係が作成時点で存在しなくても、ClickHouse はエラーにはなりません。その代わり、リフレッシャブル MV は非アクティブな状態のままとなり、依存関係が満たされるまで更新処理やリフレッシュを開始しません。
  この動作は設計によるものですが、必要な依存関係に速やかに対処しない場合、データの利用可能性が遅延する可能性があります。ユーザーは、リフレッシャブルmaterialized view を作成する前に、すべての依存関係が正しく定義され、存在していることを必ず確認してください。
* 現時点では、MV とその依存関係の間に実際の「dbt リンク」は存在しないため、作成順序は保証されません。
* refreshable 機能は、同じターゲットモデルに対して複数の MV が向く構成ではテストされていません。

### Materialization: dictionary (experimental) {#materialization-dictionary}

ClickHouse の Dictionary に対する materialization の実装方法の例については、
https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py にあるテストを参照してください。

### マテリアライゼーション: distributed_table（実験的） {#materialization-distributed-table}

分散テーブルは次の手順で作成されます:

1. 適切な構造を取得するための SQL クエリで一時ビューを作成する。
2. ビューに基づいて空のローカルテーブルを作成する。
3. ローカルテーブルに基づいて分散テーブルを作成する。
4. データは分散テーブルに挿入されるため、重複させることなく各分片に分散される。

注意事項:

- dbt-clickhouse のクエリには、下流の増分マテリアライゼーション処理が正しく実行されるように、
  自動的に `insert_distributed_sync = 1` という設定が含まれます。これにより、一部の分散テーブルへの
  挿入が想定より遅くなる可能性があります。

#### 分散テーブルモデルの例 {#distributed-table-model-example}

```sql
{{
    config(
        materialized='distributed_table',
        order_by='id, created_at',
        sharding_key='cityHash64(id)',
        engine='ReplacingMergeTree'
    )
}}

select id, created_at, item
from {{ source('db', 'table') }}
```


#### 生成済みマイグレーション {#distributed-table-generated-migrations}

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = ReplacingMergeTree
    ORDER BY (id, created_at);

CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```


#### 設定 {#distributed-table-configurations}

このマテリアライゼーションタイプに特有の設定項目は以下のとおりです。

| オプション            | 説明                                                                                                                                                                                                                                                                                                                   | 既定値 (ある場合) |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| sharding_key           | 分片キーは、Distributed エンジンテーブルへの挿入時に宛先サーバーを決定します。分片キーはランダム、またはハッシュ関数の出力として指定できます。                                                                                                                                                                            | `rand()`          |

### materialization: distributed_incremental (experimental) {#materialization-distributed-incremental}

分散テーブルと同じ考え方に基づくインクリメンタルモデルですが、主な難しさは、すべてのインクリメンタル
ストラテジーを正しく処理することにあります。

1. _Append Strategy_ は、単にデータを分散テーブルに挿入します。
2. _Delete+Insert Strategy_ は、すべての分片上のデータを処理するために分散一時テーブルを作成します。
3. _Default (Legacy) Strategy_ は、同じ理由で分散一時テーブルおよび中間テーブルを作成します。

分散テーブルはデータを保持しないため、置き換えられるのは分片テーブルのみです。
分散テーブルが再読み込みされるのは、`full_refresh` モードが有効な場合、またはテーブル構造が変更された可能性がある場合のみです。

#### 分散インクリメンタルモデルの例 {#distributed-incremental-model-example}

```sql
{{
    config(
        materialized='distributed_incremental',
        engine='MergeTree',
        incremental_strategy='append',
        unique_key='id,created_at'
    )
}}

select id, created_at, item
from {{ source('db', 'table') }}
```


#### 自動生成されたマイグレーション {#distributed-incremental-generated-migrations}

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = MergeTree;

CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```


### スナップショット {#snapshot}

dbt のスナップショットを使うと、変更可能なモデルの更新内容を時間の経過とともに記録できます。これにより、アナリストはモデルに対して任意の時点のクエリを実行し、モデルの過去の状態を「さかのぼって」確認できるようになります。この機能は ClickHouse コネクタでサポートされており、次の構文で設定します。

`snapshots/<model_name>.sql` 内の config ブロック:

```python
{{
   config(
     schema = "<schema-name>",
     unique_key = "<column-name>",
     strategy = "<strategy>",
     updated_at = "<updated-at-column-name>",
   )
}}
```

設定の詳細については、[snapshot configs](https://docs.getdbt.com/docs/build/snapshots#snapshot-configs) のリファレンスページを参照してください。


### コントラクトと制約 {#contracts-and-constraints}

カラム型に対する厳密なコントラクトのみがサポートされています。たとえば、UInt32 のカラム型を指定したコントラクトは、モデルが UInt64 など別の整数型を返した場合には失敗します。
また、ClickHouse ではテーブル／モデル全体に対する `CHECK` 制約のみがサポートされます。主キー、外部キー、一意制約、およびカラム単位の CHECK 制約はサポートされていません。
（PRIMARY / ORDER BY キーに関する ClickHouse のドキュメントを参照してください。）

### ClickHouse の追加マクロ {#additional-clickhouse-macros}

#### モデルマテリアライゼーション用ユーティリティマクロ {#model-materialization-utility-macros}

次のマクロは、ClickHouse 固有のテーブルおよびビューを作成しやすくするために用意されています。

- `engine_clause` -- `engine` モデル構成プロパティを使用して、ClickHouse のテーブルエンジンを割り当てます。dbt-clickhouse
  はデフォルトで `MergeTree` エンジンを使用します。
- `partition_cols` -- `partition_by` モデル構成プロパティを使用して、ClickHouse のパーティションキーを割り当てます。デフォルトでは
  パーティションキーは割り当てられません。
- `order_cols` -- `order_by` モデル構成プロパティを使用して、ClickHouse の ORDER BY/ソートキーを割り当てます。指定されていない場合、
  ClickHouse は空の tuple() を使用し、テーブルはソートされません。
- `primary_key_clause` -- `primary_key` モデル構成プロパティを使用して、ClickHouse のプライマリキーを割り当てます。
  デフォルトではプライマリキーが設定され、ClickHouse は ORDER BY 句をプライマリキーとして使用します。
- `on_cluster_clause` -- `cluster` プロファイルプロパティを使用して、特定の dbt 操作に `ON CLUSTER` 句を追加します：
  分散マテリアライゼーション、ビュー作成、データベース作成。
- `ttl_config` -- `ttl` モデル構成プロパティを使用して、ClickHouse テーブルの有効期限 (TTL) 式を割り当てます。デフォルトでは
  TTL は割り当てられません。

#### s3Source Helper Macro {#s3source-helper-macro}

`s3source` マクロは、ClickHouse の S3 テーブル関数を使用して S3 上の ClickHouse データを直接参照する処理を簡略化します。これは、
名前付き設定の Dictionary（Dictionary 名は必ず `s3` で終わる必要があります）から S3 テーブル関数のパラメータを
設定することで動作します。マクロは最初にプロファイルの `vars` 内で Dictionary を探し、その後にモデルの設定内を検索します。Dictionary には、
S3 テーブル関数のパラメータを設定するために使用される、以下のキーのいずれかを含めることができます。

| Argument Name         | Description                                                                                                                                                                                  |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| bucket                | バケットのベース URL。例: `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi`。プロトコルが指定されていない場合は `https://` が仮定されます。                                         |
| path                  | テーブルクエリで使用する S3 パス。例: `/trips_4.gz`。S3 のワイルドカードがサポートされています。                                                                                                  |
| fmt                   | 参照される S3 オブジェクトの ClickHouse の想定入力フォーマット（`TSV` や `CSVWithNames` など）。                                                                                         |
| structure             | バケット内データのカラム構造を、`['id UInt32', 'date DateTime', 'value String']` のような name/datatype ペアのリストで指定します。指定しない場合、ClickHouse が構造を推論します。 |
| aws_access_key_id     | S3 のアクセスキー ID。                                                                                                                                                                        |
| aws_secret_access_key | S3 のシークレットキー。                                                                                                                                                                           |
| role_arn              | S3 オブジェクトへ安全にアクセスするために使用する ClickHouseAccess IAM ロールの ARN。詳細については、この[ドキュメント](/cloud/data-sources/secure-s3)を参照してください。     |
| compression           | S3 オブジェクトで使用される圧縮方式。指定しない場合、ClickHouse はファイル名に基づいて圧縮方式の判別を試みます。                                                   |

このマクロの使用例については、
[S3 test file](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/clickhouse/test_clickhouse_s3.py)
を参照してください。

#### クロスデータベースマクロのサポート {#cross-database-macro-support}

dbt-clickhouse は、`dbt Core` に現在含まれているクロスデータベースマクロのほとんどをサポートしていますが、以下は例外です。

* `split_part` SQL 関数は、ClickHouse では `splitByChar` 関数を使って実装されています。この関数では
  分割用デリミタに定数文字列を使用する必要があるため、このマクロで使用される `delimeter` パラメータは
  カラム名ではなく文字列として解釈されます。
* 同様に、ClickHouse の `replace` SQL 関数は `old_chars` および `new_chars` パラメータに定数文字列を必要とするため、
  このマクロを呼び出す場合、これらのパラメータもカラム名ではなく文字列として解釈されます。

## カタログのサポート {#catalog-support}

### dbt カタログ統合のステータス {#dbt-catalog-integration-status}

dbt Core v1.10 ではカタログ統合サポートが導入されました。これにより、アダプターは Apache Iceberg のようなオープンテーブルフォーマットを管理する外部カタログにモデルをマテリアライズできるようになります。**この機能は、まだ dbt-clickhouse でネイティブにはサポートされていません。** この機能実装の進捗は、[GitHub issue #489](https://github.com/ClickHouse/dbt-clickhouse/issues/489) で確認できます。

### ClickHouse カタログサポート {#clickhouse-catalog-support}

ClickHouse には、Apache Iceberg テーブルおよびデータカタログのネイティブサポートが最近追加されました。多くの機能はまだ `experimental` ですが、最新の ClickHouse バージョンを使用していればすでに利用できます。

* ClickHouse を使用して、[Iceberg table engine](/engines/table-engines/integrations/iceberg) と [iceberg table function](/sql-reference/table-functions/iceberg) を用い、オブジェクトストレージ（S3、Azure Blob Storage、Google Cloud Storage）上に保存された **Iceberg テーブルに対してクエリを実行**できます。

* さらに、ClickHouse は [DataLakeCatalog database engine](/engines/database-engines/datalakecatalog) を提供しており、これにより AWS Glue Catalog、Databricks Unity Catalog、Hive Metastore、REST Catalogs などを含む **外部データカタログへの接続**が可能になります。これにより、データを複製することなく、外部カタログからオープンテーブルフォーマット（Iceberg、Delta Lake）のデータに対して直接クエリを実行できます。

### Iceberg とカタログを扱うためのワークアラウンド {#workarounds-iceberg-catalogs}

前述のツールを使って ClickHouse クラスター内に Iceberg テーブルやカタログをすでに定義している場合、dbt プロジェクトからそれらのデータを読み取ることができます。dbt の `source` 機能を利用して、これらのテーブルを dbt プロジェクト内で参照できます。たとえば、REST Catalog 内のテーブルにアクセスしたい場合は、次のようにします。

1. **外部カタログを参照するデータベースを作成する:**

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

2. **dbt でカタログ用データベースとそのテーブルをソースとして定義します:** テーブルはすでに ClickHouse 上に存在している必要があることを忘れないでください

```yaml
version: 2

sources:
  - name: external_catalog
    database: iceberg_catalog
    tables:
      - name: orders
      - name: customers
```

3. **dbt モデルでカタログテーブルを利用する:**

```sql
SELECT 
    o.order_id,
    c.customer_name,
    o.order_date
FROM {{ source('external_catalog', 'orders') }} o
INNER JOIN {{ source('external_catalog', 'customers') }} c
    ON o.customer_id = c.customer_id
```


### 回避策に関する注意事項 {#benefits-workarounds}

これらの回避策の優れている点は次のとおりです。

* ネイティブな dbt カタログ連携を待たずに、さまざまな外部テーブルタイプおよび外部カタログへ即座にアクセスできます。
* ネイティブなカタログサポートが利用可能になったときに、シームレスな移行パスを得ることができます。

一方、現時点ではいくつかの制限があります。

* **手動セットアップ:** Iceberg テーブルおよびカタログデータベースは、dbt から参照できるようにする前に、ClickHouse 上で手動で作成する必要があります。
* **カタログレベルの DDL 非対応:** dbt は、外部カタログ内で Iceberg テーブルを作成・削除するといったカタログレベルの操作を管理できません。そのため、現時点では dbt コネクタからそれらを作成することはできません。Iceberg() エンジンを使ったテーブル作成は、将来的に追加される可能性があります。
* **書き込み操作:** 現在、Iceberg / Data Catalog テーブルへの書き込みには制限があります。どのオプションが利用可能かを理解するために、ClickHouse のドキュメントを確認してください。
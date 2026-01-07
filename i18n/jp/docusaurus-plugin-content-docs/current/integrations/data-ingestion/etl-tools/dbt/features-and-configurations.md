---
sidebar_label: '機能と設定'
slug: /integrations/dbt/features-and-configurations
sidebar_position: 2
description: 'ClickHouse で dbt を使用するための機能'
keywords: ['clickhouse', 'dbt', 'features']
title: '機能と設定'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 機能と設定 {#features-and-configurations}

<ClickHouseSupportedBadge/>

このセクションでは、dbt で利用できる ClickHouse 向け機能の一部について説明します。

<TOCInline toc={toc}  maxHeadingLevel={3} />

## Profile.yml の構成 {#profile-yml-configurations}

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


### スキーマとデータベースの違い {#schema-vs-database}

dbt モデルのリレーション識別子 `database.schema.table` は、ClickHouse が `schema` をサポートしていないため、ClickHouse とは互換性がありません。
そのため、`schema` を ClickHouse のデータベースとみなす `schema.table` という単純化したアプローチを使用します。`default` データベースの使用は推奨されません。

### SET ステートメントに関する注意 {#set-statement-warning}

多くの環境では、すべての DBT クエリに対して ClickHouse の設定を有効にする目的で SET ステートメントを使用しても、その動作は必ずしも信頼できず、
思わぬ失敗を招く可能性があります。これは特に、クエリを複数ノードに分散するロードバランサー経由の HTTP 接続
（ClickHouse Cloud など）を使用している場合に顕著ですが、状況によってはネイティブな ClickHouse 接続でも発生し得ます。
そのため、必要な ClickHouse の設定は、一部で提案されているような pre-hook の "SET" ステートメントに依存するのではなく、
ベストプラクティスとして DBT プロファイルの "custom_settings" プロパティで設定することを推奨します。

### `quote_columns` の設定 {#setting-quote_columns}

警告が表示されないようにするには、`dbt_project.yml` 内で `quote_columns` の値を明示的に設定してください。詳細については、[quote&#95;columns のドキュメント](https://docs.getdbt.com/reference/resource-configs/quote_columns)を参照してください。

```yaml
seeds:
  +quote_columns: false  #or `true` if you have CSV column headers with spaces
```


### ClickHouse クラスターについて {#about-the-clickhouse-cluster}

ClickHouse クラスターを使用する場合は、次の 2 点を考慮する必要があります。

- `cluster` 設定を行うこと。
- 特に複数の `threads` を使用している場合に、書き込み直後の読み取り一貫性を確保すること。

#### クラスター設定 {#cluster-setting}

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

レプリケーションなしのエンジンを使用する table および incremental マテリアライゼーションは、`cluster` 設定の影響を受けません（モデルは接続されているノード上にのみ作成されます）。

**互換性**

あるモデルが `cluster` 設定なしで作成されている場合、dbt-clickhouse はその状況を検出し、そのモデルに対しては `on cluster` 句を付けずにすべての DDL/DML を実行します。


#### 書き込み直後の読み取り整合性 {#read-after-write-consistency}

dbt は、挿入直後読み取り（read-after-insert）整合性モデルに依存しています。これは、すべての操作が常に同じレプリカに送信されることを保証できない場合、複数のレプリカを持つ ClickHouse クラスターとは互換性がありません。日常的な dbt の利用では問題が発生しないかもしれませんが、この保証を満たすために、クラスター構成に応じていくつかの戦略があります。

- ClickHouse Cloud クラスターを使用している場合は、プロファイルの `custom_settings` プロパティで `select_sequential_consistency: 1` を設定するだけで済みます。この設定に関する詳細は[こちら](/operations/settings/settings#select_sequential_consistency)を参照してください。
- 自前でホストしているクラスターを使用している場合は、すべての dbt リクエストが同じ ClickHouse レプリカに送信されるようにしてください。その前段にロードバランサーがある場合は、常に同じレプリカに到達できるように、`replica aware routing` や `sticky sessions` といったメカニズムの利用を検討してください。ClickHouse Cloud 以外のクラスターで `select_sequential_consistency = 1` を設定として追加することは[推奨されません](/operations/settings/settings#select_sequential_consistency)。

## 機能の概要 {#general-information-about-features}

### 一般的なモデル設定 {#general-model-configurations}

次の表は、利用可能な一部のマテリアライゼーションで共通して使用される設定を示しています。dbt モデルの一般的な設定の詳細については、[dbt ドキュメント](https://docs.getdbt.com/category/general-configs)を参照してください。

| Option                 | Description                                                                                                                                                                                                                                                                                                          | Default if any |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| engine                 | テーブル作成時に使用するテーブルエンジン（テーブルの種類）                                                                                                                                                                                                                                                           | `MergeTree()`  |
| order_by               | カラム名または任意の式のタプル。これにより、小さなスパース索引を作成してデータ検索を高速化できます。                                                                                                                                                                                                                | `tuple()`      |
| partition_by           | パーティションとは、指定した条件に基づいてテーブル内のレコードを論理的にまとめたものです。パーティションキーには、テーブルのカラムからの任意の式を使用できます。                                                                                                                                                     |                |
| primary_key            | `order_by` と同様の ClickHouse のプライマリキー式。指定されていない場合、ClickHouse は `order_by` の式をプライマリキーとして使用します。                                                                                                                                                                             |                |
| settings               | このモデルで `CREATE TABLE` などの DDL 文を実行する際に使用される、"TABLE" 設定のマップ（Dictionary）                                                                                                                                                                                                               |                |
| query_settings         | このモデルと併せて `INSERT` または `DELETE` 文で使用される、ClickHouse のユーザーレベル設定のマップ（Dictionary）                                                                                                                                                                                                    |                |
| ttl                    | テーブルで使用される有効期限 (TTL) 式。有効期限 (TTL) 式は、テーブルの有効期限を指定する文字列です。                                                                                                                                                                                                                |                |
| indexes                | 作成する[データスキッピングインデックス](/optimize/skipping-indexes)のリスト。詳細については、[データスキッピングインデックスについて](#data-skipping-indexes)を参照してください。                                                                                                                                    |                |
| sql_security           | ビューの基礎となるクエリを実行する際に使用する ClickHouse USER。[指定できる値](/sql-reference/statements/create/view#sql_security): `definer`, `invoker`。                                                                                                                   |                |
| definer                | `sql_security` が `definer` に設定されている場合、`definer` 句で既存の任意の USER か `CURRENT_USER` を指定する必要があります。                                                                                                                                                                                       |                |
| projections            | 作成する [projections](/data-modeling/projections) のリスト。詳細については、[プロジェクションについて](#projections)を参照してください。                                                                                                                                                                             |                |

#### データスキッピングインデックスについて {#data-skipping-indexes}

データスキッピングインデックスは、`table` マテリアライゼーションでのみ利用できます。テーブルにデータスキッピングインデックスのリストを追加するには、`indexes` 構成を使用します。

```sql
{{ config(
        materialized='table',
        indexes=[{
          'name': 'your_index_name',
          'definition': 'your_column TYPE minmax GRANULARITY 2'
        }]
) }}
```


#### プロジェクションについて {#projections}

`projections` 構成を使用して、`table` および `distributed_table` のマテリアライゼーションに [プロジェクション](/data-modeling/projections) を追加できます。

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

**注**: 分散テーブルの場合、PROJECTION は分散プロキシテーブルではなく、対応する `_local` テーブルに適用されます。


### サポート対象のテーブルエンジン {#supported-table-engines}

| 種類                  | 詳細                                                                                       |
|------------------------|-------------------------------------------------------------------------------------------|
| MergeTree (default)    | https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/.         |
| HDFS                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs                    |
| MaterializedPostgreSQL | https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql |
| S3                     | https://clickhouse.com/docs/en/engines/table-engines/integrations/s3                      |
| EmbeddedRocksDB        | https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb        |
| Hive                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hive                    |

**注意**：materialized view では、すべての *MergeTree エンジンがサポートされています。

### 実験的にサポートされているテーブルエンジン {#experimental-supported-table-engines}

| 種類              | 詳細                                                                    |
|-------------------|-------------------------------------------------------------------------|
| Distributed Table | https://clickhouse.com/docs/en/engines/table-engines/special/distributed. |
| Dictionary        | https://clickhouse.com/docs/en/engines/table-engines/special/dictionary   |

上記のいずれかのエンジンを使用して dbt から ClickHouse へ接続する際に問題が発生した場合は、[こちら](https://github.com/ClickHouse/dbt-clickhouse/issues)から Issue を作成してください。

### モデル設定に関する注意事項 {#a-note-on-model-settings}

ClickHouse には複数の種類／レベルの「settings」が存在します。上記のモデル設定では、そのうち 2 種類が
設定可能です。`settings` は `CREATE TABLE/VIEW` 形式の DDL 文で使用される `SETTINGS`
句を指し、一般的に特定の ClickHouse テーブルエンジンに固有の設定を意味します。新しい
`query_settings` は、モデルのマテリアライゼーション（インクリメンタルマテリアライゼーションを含む）で使用される `INSERT` および `DELETE` クエリに `SETTINGS` 句を追加するために使用されます。
ClickHouse には何百もの設定項目があり、どれが「テーブル」設定でどれが「ユーザー」
設定なのかが常に明確とは限りません（もっとも、後者は一般的に
`system.settings` テーブルで利用可能です）。一般的にはデフォルト値の利用を推奨しており、これらのプロパティを使用する場合は、
十分に調査とテストを行うべきです。

### カラム設定 {#column-configuration}

> **_NOTE:_** 以下のカラム設定オプションを使用するには、[model contracts](https://docs.getdbt.com/docs/collaborate/govern/model-contracts) を適用している必要があります。

| Option | Description                                                                                                                                                | Default if any |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| codec  | カラムの DDL 内で `CODEC()` に渡される引数からなる文字列です。例えば、`codec: "Delta, ZSTD"` は `CODEC(Delta, ZSTD)` としてコンパイルされます。    |    
| ttl    | カラムの DDL 内で有効期限 (TTL) のルールを定義する、[TTL (time-to-live) 式](https://clickhouse.com/docs/guides/developer/ttl) を指定する文字列です。例えば、`ttl: ts + INTERVAL 1 DAY` は `TTL ts + INTERVAL 1 DAY` としてコンパイルされます。 |

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


#### 複合型の追加 {#adding-complex-types}

dbt は、モデルを作成するために使用される SQL を解析して、各カラムのデータ型を自動的に推定します。ただし、場合によってはこの処理でデータ型を正しく判定できず、コントラクトの `data_type` プロパティで指定された型と不整合が生じることがあります。これに対処するため、モデルの SQL 内で `CAST()` 関数を使用して、望ましい型を明示的に指定することを推奨します。例えば、次のようになります。

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

dbt モデルは [ClickHouse view](/sql-reference/table-functions/view/) として作成し、
次の構文で設定できます。

プロジェクトファイル (`dbt_project.yml`):

```yaml
models:
  <resource-path>:
    +materialized: view
```

または、設定ブロック（`models/<model_name>.sql`）:

```python
{{ config(materialized = "view") }}
```


### マテリアライゼーション: テーブル {#materialization-table}

dbt モデルは [ClickHouse テーブル](/operations/system-tables/tables/) として作成し、
次の構文で設定できます:

プロジェクトファイル (`dbt_project.yml`):

```yaml
models:
  <resource-path>:
    +materialized: table
    +order_by: [ <column-name>, ... ]
    +engine: <engine-type>
    +partition_by: [ <column-name>, ... ]
```

または設定ブロック（`models/<model_name>.sql`）：

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

テーブルモデルは、dbt の各実行ごとに再構築されます。これは、結果セットが大きい場合や変換処理が複雑な場合には、実行が現実的でなくなったり、非常に高コストになったりする可能性があります。この課題に対処してビルド時間を短縮するために、dbt モデルをインクリメンタルな ClickHouse テーブルとして作成し、次の構文で設定します。

`dbt_project.yml` におけるモデル定義:

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

または `models/&lt;model_name&gt;.sql` 内の config ブロックで指定します:

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


#### Configurations {#incremental-configurations}

このマテリアライゼーションタイプに固有の設定項目を以下に示します。

| Option                   | Description                                                                                                                                                                                                                                                       | Required?                                                                            |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| `unique_key`             | 行を一意に識別するカラム名のタプル。ユニーク制約の詳細については [こちら](https://docs.getdbt.com/docs/build/incremental-models#defining-a-unique-key-optional) を参照してください。                                                                                       | 必須。指定しない場合、変更された行がインクリメンタルテーブルに重複して追加されます。 |
| `inserts_only`           | 同じ動作をするインクリメンタル `strategy` の `append` が推奨されるため、非推奨となりました。インクリメンタルモデルで True に設定すると、中間テーブルを作成せずにインクリメンタル更新分が直接ターゲットテーブルに挿入されます。`inserts_only` が設定されている場合、`incremental_strategy` は無視されます。 | 任意（デフォルト: `False`）                                                          |
| `incremental_strategy`   | インクリメンタルマテリアライゼーションで使用する戦略。`delete+insert`、`append`、`insert_overwrite`、`microbatch` がサポートされています。戦略の詳細については [こちら](/integrations/dbt/features-and-configurations#incremental-model-strategies) を参照してください。 | 任意（デフォルト: `default`）                                                        |
| `incremental_predicates` | インクリメンタルマテリアライゼーションに適用する追加条件（`delete+insert` 戦略にのみ適用）                                                                                                                                                                                    | 任意                      

#### インクリメンタルモデルの戦略 {#incremental-model-strategies}

`dbt-clickhouse` では、インクリメンタルモデル用に 3 種類の戦略をサポートしています。

##### デフォルト（レガシー）戦略 {#default-legacy-strategy}

従来、ClickHouse は非同期の「mutation」という仕組みによってのみ、更新と削除を限定的にサポートしていました。
期待される dbt の動作を再現するために、
dbt-clickhouse はデフォルトで、影響を受けない（削除されていない・変更されていない）「古い」
レコードすべてに加えて、新規または更新されたレコードを含む新しい一時テーブルを作成し、
その後この一時テーブルと既存のインクリメンタルモデルのリレーションをスワップ（入れ替え）します。これは、
操作の完了前に問題が発生した場合でも元のリレーションを保持できる唯一の戦略です。ただし、元のテーブルの完全なコピーを伴うため、
非常にコストが高く、実行に時間がかかる可能性があります。

##### Delete+Insert 戦略 {#delete-insert-strategy}

ClickHouse はバージョン 22.8 で実験的機能として「論理削除 (lightweight delete)」を追加しました。論理削除は、
ClickHouse のデータパーツを書き換える必要がないため、ALTER TABLE ... DELETE
操作よりも大幅に高速です。インクリメンタル戦略 `delete+insert` は、
この論理削除を利用して、「レガシー」戦略よりも大幅に高いパフォーマンスで
インクリメンタル・マテリアライゼーションを実現します。ただし、この戦略を使用する際には重要な注意点があります。

- 論理削除を使用するには、ClickHouse サーバー上で
  `allow_experimental_lightweight_delete=1` を有効化するか、
  プロファイルで `use_lw_deletes=true` を設定する必要があります（これにより dbt セッションで当該設定が有効になります）
- 論理削除は現在プロダクション利用可能な状態ですが、ClickHouse バージョン 23.3 より前では、
  パフォーマンス上の問題やその他の不具合が発生する可能性があります
- この戦略は影響を受けるテーブル／リレーションに対して（中間テーブルや一時テーブルを作成せずに）
  直接操作を行うため、処理中に問題が発生すると、
  インクリメンタルモデル内のデータが不正な状態になる可能性があります
- 論理削除を使用する場合、dbt-clickhouse は `allow_nondeterministic_mutations` 設定を有効にします。ごく
  まれに、非決定的な incremental_predicates を使用していると、
  更新／削除対象のアイテムに対してレースコンディションが発生する可能性があります（および ClickHouse ログ内の関連ログメッセージ）。  
  一貫した結果を得るために、
  incremental_predicates には、インクリメンタル・マテリアライゼーションの実行中に変更されないデータに対するサブクエリのみを含めるようにしてください。

##### マイクロバッチ戦略（dbt-core >= 1.9 が必要） {#microbatch-strategy}

インクリメンタル戦略 `microbatch` は、dbt-core バージョン 1.9 以降で利用可能な機能であり、大規模な時系列データ変換を効率的に処理するために設計されています。dbt-clickhouse では、既存の `delete_insert` インクリメンタル戦略を拡張し、`event_time` と `batch_size` モデル設定に基づいて増分処理をあらかじめ定義された時系列バッチに分割します。

大規模な変換処理への対応に加えて、microbatch は次の機能を提供します:

- [失敗したバッチの再処理](https://docs.getdbt.com/docs/build/incremental-microbatch#retry)。
- [並列バッチ実行](https://docs.getdbt.com/docs/build/parallel-batch-execution)の自動検出。
- [バックフィル](https://docs.getdbt.com/docs/build/incremental-microbatch#backfills)における複雑な条件ロジックの不要化。

microbatch の詳細な使用方法については、[公式ドキュメント](https://docs.getdbt.com/docs/build/incremental-microbatch)を参照してください。

###### 利用可能なマイクロバッチ設定 {#available-microbatch-configurations}

| Option             | Description                                                                                                                                                                                                                                                                                                                                | Default if any |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| event_time         | 行が「いつ発生したか」を示すカラム。マイクロバッチモデルおよび、フィルタリング対象とする必要のある直接の親モデルに必須です。                                                                                                                                                                                                             |                |
| begin              | マイクロバッチモデルにおける「時間の起点」。初回実行やフルリフレッシュ実行時の開始ポイントです。たとえば、日次粒度のマイクロバッチモデルを 2024-10-01 に実行し、begin = '2023-10-01' の場合、366 個のバッチ（うるう年なので）に加えて「本日」分のバッチが処理されます。                                                            |                |
| batch_size         | バッチの粒度。指定できる値は `hour`、`day`、`month`、`year` です。                                                                                                                                                                                                                                                                        |                |
| lookback           | 遅延到着レコードを取り込むために、最新のブックマークより前の X 個分のバッチを追加で処理します。                                                                                                                                                                                                                                          | 1              |
| concurrent_batches | バッチを同時に実行するかどうかについて、dbt の自動検出を上書きします。[並列バッチの設定](https://docs.getdbt.com/docs/build/incremental-microbatch#configure-concurrent_batches)の詳細を参照してください。true に設定するとバッチを同時（並列）に実行し、false に設定するとバッチを順次（1 つずつ）実行します。                        |                |

##### Append 戦略 {#append-strategy}

この戦略は、以前のバージョンの dbt-clickhouse における `inserts_only` 設定を置き換えるものです。このアプローチでは、
新しい行を既存のリレーションに単純に追記します。
その結果、重複した行は排除されず、一時テーブルや中間テーブルも作成されません。データ内で重複が許容されている場合や、
インクリメンタルクエリの WHERE 句/フィルターによって重複が除外されている場合には、最も高速な方法です。

##### insert_overwrite 戦略 (実験的) {#insert-overwrite-strategy}

> [重要]  
> 現在、insert_overwrite 戦略は分散マテリアライゼーションでは完全には機能しません。

この戦略は次の手順を実行します。

1. 増分モデルのリレーションと同じ構造を持つステージング（一時）テーブルを作成します:  
   `CREATE TABLE <staging> AS <target>`。
2. `SELECT` によって生成された新規レコードのみをステージングテーブルに挿入します。
3. ステージングテーブルに存在する新しいパーティションのみを、ターゲットテーブルの対応するパーティションとして置き換えます。

このアプローチには次の利点があります。

- テーブル全体をコピーしないため、デフォルト戦略より高速です。
- INSERT 操作が正常に完了するまで元のテーブルを変更しないため、他の戦略より安全です。
  途中で失敗した場合でも、元のテーブルは変更されません。
- 「パーティション不変性」というデータエンジニアリングのベストプラクティスを実装しており、
  増分処理や並列処理、ロールバックなどを簡素化します。

この戦略では、モデル設定で `partition_by` を指定する必要があります。モデル設定におけるその他の
戦略固有のパラメータはすべて無視されます。

### Materialization: materialized&#95;view (Experimental) {#materialized-view}

`materialized_view` マテリアライゼーションは、既存（ソース）テーブルに対する `SELECT` である必要があります。アダプターはモデル名を持つ
ターゲットテーブルと、`<model_name>_mv` という名前の ClickHouse MATERIALIZED VIEW を作成します。PostgreSQL と異なり、ClickHouse の materialized view は
「静的」ではなく（対応する REFRESH 操作もありません）、代わりに「insert トリガー」として機能し、
ソーステーブルに行が挿入された際に、ビュー定義内で定義された `SELECT` の
「変換」を使用して、新しい行をターゲットテーブルに挿入します。 この機能の入門的な利用例については、[test file](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py)
を参照してください。

ClickHouse では、複数の materialized view から同じターゲットテーブルにレコードを書き込むことができます。
dbt-clickhouse でこれをサポートするために、モデルファイル内で `UNION` を構成し、それぞれの materialized view の SQL が
`--my_mv_name:begin` および `--my_mv_name:end` の形式のコメントでラップされるようにします。

例えば、次の例では 2 つの materialized view を作成し、どちらもモデルの同じ宛先テーブルにデータを書き込みます。
materialized view の名前は `<model_name>_mv1` および `<model_name>_mv2` の形式になります。

```sql
--mv1:begin
select a,b,c from {{ source('raw', 'table_1') }}
--mv1:end
union all
--mv2:begin
select a,b,c from {{ source('raw', 'table_2') }}
--mv2:end
```

> 重要!
>
> 複数の materialized view (MV) を持つモデルを更新する際、特に MV 名の一つの名前を変更する場合、
> dbt-clickhouse は古い MV を自動的には削除しません。その場合、
> 次のような警告が表示されます:
> `Warning - Table <previous table name> was detected with the same pattern as model name <your model name> but was not found in this run. In case it is a renamed mv that was previously part of this model, drop it manually (!!!) `


#### データのキャッチアップ {#data-catch-up}

現在、materialized view (MV) を作成する際は、MV 自体が作成される前に、まずターゲットテーブルが履歴データで満たされます。

言い換えると、dbt-clickhouse は最初にターゲットテーブルを作成し、MV に対して定義されたクエリに基づいて履歴データを事前にロードします。このステップが完了した後にのみ、MV が作成されます。

MV 作成時に履歴データを事前ロードしたくない場合は、`catch-up` 設定を False にすることで、この動作を無効化できます:

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
MV モデル内で必要に応じて以下のコンフィグを調整してください（これらのコンフィグはすべて、
refreshable コンフィグオブジェクト内で設定することを想定しています）:

| Option                        | Description                                                                          | Required | Default Value |
| ----------------------------- | ------------------------------------------------------------------------------------ | -------- | ------------- |
| refresh&#95;interval          | 必須の interval 句                                                                       | Yes      |               |
| randomize                     | `RANDOMIZE FOR` の後に続く randomization 句                                                |          |               |
| append                        | `True` に設定すると、各リフレッシュ時に既存の行を削除せずにテーブルに行を挿入します。挿入は通常の INSERT SELECT と同様にアトミックではありません。 |          | False         |
| depends&#95;on                | リフレッシャブルmaterialized view の依存関係リスト。依存関係は `{schema}.{view_name}` の形式で指定してください         |          |               |
| depends&#95;on&#95;validation | `depends_on` で指定された依存関係の存在を検証するかどうか。依存関係にスキーマが含まれていない場合、検証はスキーマ `default` に対して実行されます |          | False         |

リフレッシャブルmaterialized view 用のコンフィグ例:

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

* ClickHouse で依存関係を持つリフレッシャブルmaterialized view (MV) を作成する際、指定された依存関係が作成時点で存在しなくても、ClickHouse はエラーを発生させません。代わりに、そのリフレッシャブル MV は非アクティブな状態のままとなり、依存関係が満たされるまで更新処理やリフレッシュを開始しません。
  この挙動は仕様どおりですが、必要な依存関係にすぐに対処しない場合、データが利用可能になるまでに遅延が発生する可能性があります。ユーザーは、リフレッシャブルmaterialized view を作成する前に、すべての依存関係が正しく定義され、存在していることを必ず確認してください。
* 現時点では、MV とその依存関係の間に実際の「dbt リンク」は存在しないため、作成順序は保証されません。
* リフレッシャブル機能は、複数の MV が同じターゲットモデルを参照するケースではテストされていません。

### マテリアライゼーション: dictionary（実験的） {#materialization-dictionary}

ClickHouse の Dictionary マテリアライゼーションをどのように実装するかの例については、
https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py
にあるテストを参照してください。

### マテリアライゼーション: distributed_table（実験的） {#materialization-distributed-table}

分散テーブルは次の手順で作成されます:

1. 適切な構造を得るための SQL クエリを使って一時ビューを作成する
2. ビューに基づいて空のローカルテーブルを作成する
3. ローカルテーブルに基づいて分散テーブルを作成する
4. データは分散テーブルに挿入され、その結果、重複することなく分片間に分散される

注意事項:

- dbt-clickhouse のクエリには、下流のインクリメンタル・マテリアライゼーション処理が正しく実行されるようにするため、
  SETTING `insert_distributed_sync = 1` が自動的に含まれるようになりました。このため、一部の分散テーブルへの挿入が
  想定よりも遅くなる可能性があります。

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


#### 自動生成されたマイグレーション {#distributed-table-generated-migrations}

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

このマテリアライゼーションタイプに特有の設定は、以下のとおりです。

| オプション            | 説明                                                                                                                                                                                                                                                                                                                  | 既定値 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| sharding_key           | sharding_key は、Distributed エンジンテーブルに挿入する際の宛先サーバーを決定します。sharding_key は、ランダム値、またはハッシュ関数の出力として設定できます。                                                                                                                                                                      | `rand()`)      |

### materialization: distributed_incremental (experimental) {#materialization-distributed-incremental}

分散テーブルと同じ考え方に基づくインクリメンタルモデルであり、主な課題はすべてのインクリメンタル戦略を正しく処理することです。

1. _Append 戦略_ では、分散テーブルにデータを挿入するだけです。
2. _Delete+Insert 戦略_ では、各分片上のすべてのデータを扱うために分散一時テーブルを作成します。
3. _Default (レガシー) 戦略_ では、同じ理由で分散一時テーブルと中間テーブルを作成します。

分散テーブルはデータを保持しないため、置き換えられるのは分片テーブルだけです。
分散テーブルが再読み込みされるのは、`full_refresh` モードが有効になっている場合、またはテーブル構造が変更された可能性がある場合のみです。

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


### Snapshot {#snapshot}

dbt snapshots を使用すると、時間の経過とともに変化する更新可能なモデルの変更を記録できます。これにより、アナリストはモデルに対して時点指定クエリを実行し、モデルの過去の状態を「さかのぼって」参照できるようになります。この機能は ClickHouse コネクタでサポートされており、次の構文で設定します:

`snapshots/<model_name>.sql` 内の設定ブロック:

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

設定方法の詳細については、[snapshot configs](https://docs.getdbt.com/docs/build/snapshots#snapshot-configs) のリファレンスページを参照してください。


### コントラクトと制約 {#contracts-and-constraints}

カラム型が厳密に一致するコントラクトのみがサポートされます。たとえば、カラム型が UInt32 のコントラクトは、モデルが UInt64 や他の整数型を返す場合には失敗します。
ClickHouse がサポートするのは、テーブル／モデル全体に対する `CHECK` 制約のみです。主キー、外部キー、一意制約、および
カラムレベルの CHECK 制約はサポートされていません。
（主キーおよび ORDER BY キーについては ClickHouse のドキュメントを参照してください。）

### ClickHouse の追加マクロ {#additional-clickhouse-macros}

#### モデルマテリアライゼーションユーティリティマクロ {#model-materialization-utility-macros}

次のマクロは、ClickHouse 固有のテーブルおよびビューの作成を容易にするために含まれています:

- `engine_clause` -- `engine` モデル構成プロパティを使用して、ClickHouse のテーブルエンジンを割り当てます。dbt-clickhouse はデフォルトで `MergeTree` エンジンを使用します。
- `partition_cols` -- `partition_by` モデル構成プロパティを使用して、ClickHouse のパーティションキーを割り当てます。デフォルトではパーティションキーは割り当てられません。
- `order_cols` -- `order_by` モデル構成プロパティを使用して、ClickHouse の ORDER BY／ソートキーを割り当てます。指定されない場合、ClickHouse は空の tuple() を使用し、テーブルはソートされません。
- `primary_key_clause` -- `primary_key` モデル構成プロパティを使用して、ClickHouse のプライマリキーを割り当てます。デフォルトではプライマリキーが設定され、ClickHouse は ORDER BY 句をプライマリキーとして使用します。
- `on_cluster_clause` -- `cluster` プロファイルプロパティを使用して、特定の dbt の操作に `ON CLUSTER` 句を追加します: 分散マテリアライゼーション、ビューの作成、データベースの作成。
- `ttl_config` -- `ttl` モデル構成プロパティを使用して、ClickHouse テーブルの有効期限 (TTL) 式を割り当てます。デフォルトでは TTL は割り当てられません。

#### s3Source Helper Macro {#s3source-helper-macro}

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

#### クロスデータベースマクロのサポート {#cross-database-macro-support}

dbt-clickhouse は、現在 `dbt Core` に含まれているクロスデータベースマクロのほとんどを、次の例外を除いてサポートしています。

* `split_part` SQL 関数は ClickHouse では `splitByChar` 関数として実装されています。この関数では「分割」用のデリミタに定数文字列を使用する必要があるため、このマクロで使用される `delimeter` パラメータはカラム名ではなく文字列として解釈されます。
* 同様に、ClickHouse の `replace` SQL 関数では `old_chars` および `new_chars` パラメータに定数文字列を指定する必要があります。そのため、このマクロを呼び出す際、これらのパラメータはカラム名ではなく文字列として解釈されます。

## カタログ対応 {#catalog-support}

### dbt カタログ連携のステータス {#dbt-catalog-integration-status}

dbt Core v1.10 でカタログ連携機能が導入されました。これにより、アダプターは Apache Iceberg のようなオープンなテーブル形式を管理する外部カタログにモデルをマテリアライズできるようになります。**この機能は、現時点では dbt-clickhouse にネイティブには実装されていません。** この機能実装の進捗は [GitHub issue #489](https://github.com/ClickHouse/dbt-clickhouse/issues/489) で追跡できます。

### ClickHouse カタログサポート {#clickhouse-catalog-support}

ClickHouse は最近、Apache Iceberg テーブルおよびデータカタログのネイティブサポートを追加しました。多くの機能はまだ `experimental` ですが、最新バージョンの ClickHouse を使用していれば既に利用できます。

* ClickHouse では、[Iceberg table engine](/engines/table-engines/integrations/iceberg) と [iceberg table function](/sql-reference/table-functions/iceberg) を使用して、オブジェクトストレージ（S3、Azure Blob Storage、Google Cloud Storage）に保存された **Iceberg テーブルに対してクエリを実行** できます。

* さらに、ClickHouse は [DataLakeCatalog database engine](/engines/database-engines/datalakecatalog) を提供しており、AWS Glue Catalog、Databricks Unity Catalog、Hive Metastore、REST Catalogs などの **外部データカタログへの接続** を可能にします。これにより、データを複製することなく、外部カタログから直接、オープンテーブル形式のデータ（Iceberg、Delta Lake）に対してクエリを実行できます。

### Iceberg とカタログを扱うためのワークアラウンド {#workarounds-iceberg-catalogs}

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


### 回避策に関する注意事項 {#benefits-workarounds}

これらの回避策の利点は次のとおりです。

* ネイティブな dbt カタログ連携を待たずに、さまざまな外部テーブルタイプおよび外部カタログにすぐにアクセスできます。
* ネイティブなカタログサポートが利用可能になった際に、シームレスな移行パスが確保されます。

しかし、現時点ではいくつかの制限があります。

* **手動セットアップ:** Iceberg テーブルおよびカタログデータベースは、dbt から参照できるようにする前に、あらかじめ ClickHouse 上で手動作成しておく必要があります。
* **カタログレベルの DDL なし:** dbt は、外部カタログ内で Iceberg テーブルを作成・削除するといったカタログレベルの操作を管理できません。そのため、現時点では dbt コネクタからそれらを作成することはできません。Iceberg() エンジンを使ったテーブル作成は、将来的に追加される可能性があります。
* **書き込み操作:** 現在、Iceberg テーブルおよび Data Catalog テーブルへの書き込みは制限されています。どのオプションが利用可能かを確認するため、ClickHouse のドキュメントを参照してください。
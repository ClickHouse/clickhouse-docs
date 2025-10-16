---
'sidebar_label': '機能と設定'
'slug': '/integrations/dbt/features-and-configurations'
'sidebar_position': 2
'description': 'ClickHouseと一緒にdbtを使用するための機能'
'keywords':
- 'clickhouse'
- 'dbt'
- 'features'
'title': '機能と設定'
'doc_type': 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 機能と設定

<ClickHouseSupportedBadge/>

このセクションでは、ClickHouseを使用したdbtのためのいくつかの機能に関するドキュメントを提供します。

<TOCInline toc={toc} maxHeadingLevel={3} />
## Profile.yml 設定 {#profile-yml-configurations}

dbtからClickHouseに接続するには、`profiles.yml`ファイルに[プロファイル](https://docs.getdbt.com/docs/core/connect-data-platform/connection-profiles)を追加する必要があります。ClickHouseプロファイルは以下の構文に従います。

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

      # Native (clickhouse-driver) connection settings
      sync_request_timeout: [5] # Timeout for server ping
      compress_block_size: [1048576] # Compression block size if compression is enabled
```
### スキーマ vs データベース {#schema-vs-database}

dbtモデル関係識別子 `database.schema.table` はClickHouseと互換性がありません。なぜなら、ClickHouseは`schema`をサポートしていないからです。そのため、`schema.table`という簡略化されたアプローチを使用します。この場合、`schema`はClickHouseデータベースです。 `default`データベースを使用することは推奨されません。
### SET文の警告 {#set-statement-warning}

多くの環境で、SET文を使用してすべてのDBTクエリにわたってClickHouse設定を永続化することは信頼性が高くなく、予期しない失敗を引き起こす可能性があります。これは、複数のノード（例えばClickHouse Cloud）にクエリを分散するロードバランサを介したHTTP接続を使用する場合に特に当てはまりますが、場合によっては通常のClickHouse接続でも発生する可能性があります。したがって、ベストプラクティスとしてDBTプロファイルの「custom_settings」プロパティに必要なClickHouse設定を構成することをお勧めします。時折提案されている「SET」文のプリフックに依存しないようにしてください。
### `quote_columns`の設定 {#setting-quote_columns}

警告を防ぐために、`dbt_project.yml`内で`quote_columns`の明示的な値を設定してください。詳細については、[quote_columnsのドキュメント](https://docs.getdbt.com/reference/resource-configs/quote_columns)を参照してください。

```yaml
seeds:
  +quote_columns: false  #or `true` if you have CSV column headers with spaces
```
### ClickHouseクラスターについて {#about-the-clickhouse-cluster}

プロファイルの`cluster`設定は、dbt-clickhouseがClickHouseクラスターに対して実行されることを可能にします。プロファイルに`cluster`が設定されている場合、**すべてのモデルはデフォルトで`ON CLUSTER`句とともに作成されます** - **Replicated**エンジンを使用しているモデルを除きます。これには以下が含まれます：

- データベースの作成
- ビューのマテリアライズ
- テーブルおよびインクリメンタルのマテリアライズ
- 分散マテリアライズ

レプリカエンジンは`ON CLUSTER`句を含めません。これらは内部でレプリケーションを管理するために設計されています。

特定のモデルに対してクラスターに基づく作成を**オプトアウト**するには、`disable_on_cluster`設定を追加します：

```sql
{{ config(
        engine='MergeTree',
        materialized='table',
        disable_on_cluster='true'
    )
}}

```

レプリケートされていないエンジンを使用したテーブルおよびインクリメンタルのマテリアライズは、`cluster`設定の影響を受けません（モデルは接続されたノードのみで作成されます）。
#### 互換性 {#compatibility}

モデルが`cluster`設定なしで作成されている場合、dbt-clickhouseは状況を検出し、このモデルのすべてのDDL/DMLを`on cluster`句なしで実行します。
## 機能に関する一般的情報 {#general-information-about-features}
### 一般的なテーブル設定 {#general-table-configurations}

| オプション             | 説明                                                                                                                                                                                                                                                                                       | デフォルト値     |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|
| engine               | テーブルを作成する際に使用するテーブルエンジン（テーブルの種類）                                                                                                                                                                                                                         | `MergeTree()`     |
| order_by             | カラム名または任意の式のタプル。これにより、データをより迅速に見つけるのに役立つ小さなスパースインデックスを作成できます。                                                                                                                                                                      | `tuple()`         |
| partition_by         | パーティションは、指定された基準によるテーブル内のレコードの論理的な組み合わせです。パーティションキーはテーブルカラムからの任意の式であることができます。                                                                                                                                      |                  |
| sharding_key         | シャーディングキーは、分散エンジンテーブルに挿入する際の宛先サーバーを決定します。シャーディングキーはランダムであるかハッシュ関数の出力である可能性があります。                                                                                                                                 | `rand()`          |
| primary_key          | order_byと同様に、ClickHouseの主キー式。指定されていない場合、ClickHouseは主キーとしてorder by式を使用します。                                                                                                                                                                           |                  |
| unique_key           | 行を一意に識別するカラム名のタプル。インクリメンタルモデルの更新に使用されます。                                                                                                                                                                                                                   |                  |
| settings             | このモデルに対して`CREATE TABLE`のようなDDL文に使用される「テーブル」設定のマップ/辞書。                                                                                                                                                                                                 |                  |
| query_settings       | このモデルの`INSERT`または`DELETE`文と共に使用されるClickHouseユーザーレベル設定のマップ/辞書。                                                                                                                                                                                          |                  |
| ttl                  | テーブルに使用されるTTL式。TTL式は、テーブルのTTLを指定するために使用できる文字列です。                                                                                                                                                                                                  |                  |
| indexes              | `table`マテリアライズに対して作成するインデックスのリスト。例については、([#397](https://github.com/ClickHouse/dbt-clickhouse/pull/397))を参照してください。                                                                                                                                      |                  |
| sql_security         | ビューの基になるクエリを実行する際に使用するClickHouseユーザーを指定できます。 [`SQL SECURITY`](https://clickhouse.com/docs/sql-reference/statements/create/view#sql_security)には、`definer`または`invoker`の2つの法的値があります。                                                            |                  |
| definer              | `sql_security`が`definer`に設定されている場合、`definer`句で任意の既存ユーザーまたは`CURRENT_USER`を指定する必要があります。                                                                                                                                                                 |                  |
### サポートされるテーブルエンジン {#supported-table-engines}

| 種類                  | 詳細                                                                                     |
|-----------------------|------------------------------------------------------------------------------------------|
| MergeTree (デフォルト)  | https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/.        |
| HDFS                  | https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs                   |
| MaterializedPostgreSQL | https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql |
| S3                    | https://clickhouse.com/docs/en/engines/table-engines/integrations/s3                     |
| EmbeddedRocksDB       | https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb       |
| Hive                  | https://clickhouse.com/docs/en/engines/table-engines/integrations/hive                   |
### 実験的にサポートされるテーブルエンジン {#experimental-supported-table-engines}

| 種類                    | 詳細                                                                   |
|-------------------------|------------------------------------------------------------------------|
| Distributed Table       | https://clickhouse.com/docs/en/engines/table-engines/special/distributed. |
| Dictionary              | https://clickhouse.com/docs/en/engines/table-engines/special/dictionary   |

上記のエンジンのいずれかでdbtからClickHouseに接続する際に問題が発生した場合は、[こちら](https://github.com/ClickHouse/dbt-clickhouse/issues)に問題を報告してください。
### モデル設定に関する注意点 {#a-note-on-model-settings}

ClickHouseにはいくつかのタイプ/レベルの「設定」があります。上記のモデル設定では、これらの2つのタイプを構成可能です。`settings`は`CREATE TABLE/VIEW`タイプのDDL文で使用される`SETTINGS`句を意味します。したがって、これは一般的に特定のClickHouseテーブルエンジンに特有の設定です。新しい`query_settings`は、モデルのマテリアライズに使用される`INSERT`および`DELETE`クエリに`SETTINGS`句を追加するために使用されます（インクリメンタルマテリアライズを含む）。
ClickHouseの設定は数百種類あり、「テーブル」設定と「ユーザー」設定の区別が常に明確ではありません（後者は一般的に`system.settings`テーブルにあります）。一般的にデフォルトが推奨されており、これらのプロパティの使用は慎重に調査されテストされるべきです。
### カラム設定 {#column-configuration}

> **_注意:_** 以下のカラム設定オプションは、[モデル契約](https://docs.getdbt.com/docs/collaborate/govern/model-contracts)の施行を必要とします。

| オプション | 説明                                                                                                                                                                                                                                        | デフォルト値     |
|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|
| codec      | カラムのDDLにおいて`CODEC()`に渡される引数から構成される文字列。例えば、`codec: "Delta, ZSTD"`は`CODEC(Delta, ZSTD)`としてコンパイルされます。                                                                                             |                  |
| ttl        | カラムのDDLにおいてTTL（有効期限）ルールを定義する[TTL式](https://clickhouse.com/docs/guides/developer/ttl)から構成される文字列。例えば、`ttl: ts + INTERVAL 1 DAY`は`TTL ts + INTERVAL 1 DAY`としてコンパイルされます。                             |
#### 例 {#example}

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
## 機能 {#features}
### マテリアリゼーション: ビュー {#materialization-view}

dbtモデルは[ClickHouseビュー](https://clickhouse.com/docs/en/sql-reference/table-functions/view/)として作成でき、以下の構文を使用して設定されます：

プロジェクトファイル (`dbt_project.yml`)：
```yaml
models:
  <resource-path>:
    +materialized: view
```

または設定ブロック (`models/<model_name>.sql`)：
```python
{{ config(materialized = "view") }}
```
### マテリアリゼーション: テーブル {#materialization-table}

dbtモデルは[ClickHouseテーブル](https://clickhouse.com/docs/en/operations/system-tables/tables/)として作成でき、以下の構文を使用して設定されます：

プロジェクトファイル (`dbt_project.yml`)：
```yaml
models:
  <resource-path>:
    +materialized: table
    +order_by: [ <column-name>, ... ]
    +engine: <engine-type>
    +partition_by: [ <column-name>, ... ]
```

または設定ブロック (`models/<model_name>.sql`)：
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
### マテリアリゼーション: インクリメンタル {#materialization-incremental}

テーブルモデルは各dbt実行のために再構築されます。これは、大きな結果セットや複雑な変換に対しては実行不可能で非常にコストがかかる場合があります。この課題に対処し、ビルド時間を短縮するために、dbtモデルをインクリメンタルなClickHouseテーブルとして作成し、以下の構文を使用して設定できます：

`dbt_project.yml`内のモデル定義：
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

または設定ブロック (`models/<model_name>.sql`)：
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
#### 設定 {#configurations}
このマテリアリゼーションタイプに特有の設定は以下に示されます：

| オプション                   | 説明                                                                                                                                                                                                                                      | 必須？                                                                              |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------|
| `unique_key`                 | 行を一意に識別するカラム名のタプル。一意性制約の詳細については、[こちら](https://docs.getdbt.com/docs/build/incremental-models#defining-a-unique-key-optional)を参照してください。                                                                     | 必須。指定しないと変更された行がインクリメンタルテーブルに2回追加されます。        |
| `inserts_only`               | `append`インクリメンタル `strategy`の代わりに廃止されました。同じ方法で動作します。インクリメンタルモデルに対してTrueに設定した場合、インクリメンタルな更新は中間テーブルを作成せずにターゲットテーブルに直接挿入されます。`inserts_only`が設定されている場合、`incremental_strategy`は無視されます。 | オプション（デフォルト: `False`）                                                 |
| `incremental_strategy`       | インクリメンタルマテリアリゼーションに使用する戦略。 `delete+insert`、`append`、`insert_overwrite`、または`microbatch`がサポートされています。戦略に関する追加の詳細は、[こちら](/integrations/dbt/features-and-configurations#incremental-model-strategies)を参照してください。 | オプション（デフォルト: 'default'）                                               |
| `incremental_predicates`     | インクリメンタルマテリアリゼーションに適用される追加条件（`delete+insert`戦略にのみ適用されます）。                                                                                                                                                                                   | オプション                                                                         |
#### インクリメンタルモデル戦略 {#incremental-model-strategies}

`dbt-clickhouse`は3つのインクリメンタルモデル戦略をサポートしています。
##### デフォルト（レガシー）戦略 {#default-legacy-strategy}

歴史的にClickHouseは更新や削除に対して限定的なサポートを提供しており、非同期的な「変異」の形式で提供されていました。期待されるdbtの動作を模倣するために、dbt-clickhouseはデフォルトで影響を受けない（削除されていない、変更されていない）「古い」レコードのすべてを含む新しい一時テーブルを作成し、新しいまたは更新されたレコードを追加し、その後この一時テーブルを既存のインクリメンタルモデル関係と交換します。これは、操作が完了するまでに何かがうまくいかない場合でも元の関係を保持する唯一の戦略です。ただし、元のテーブルの完全なコピーを必要とするため、実行するのにかなり高価で遅くなります。
##### Delete+Insert戦略 {#delete-insert-strategy}

ClickHouseは、バージョン22.8で「軽量削除」を実験的機能として追加しました。軽量削除は、ClickHouseデータパーツの書き換えを必要としないため、ALTER TABLE ... DELETE操作よりもはるかに速くなります。インクリメンタル戦略`delete+insert`は、軽量削除を活用して、旧来の戦略よりもはるかに良好なパフォーマンスを発揮するインクリメンタルマテリアリゼーションを実装します。ただし、この戦略を使用する際には重要な注意点があります：

- 軽量削除は、`allow_experimental_lightweight_delete=1`を使用してClickHouseサーバーで有効にするか、プロファイルに`use_lw_deletes=true`を設定する必要があります（これにより、dbtセッションの設定が有効になります）。
- 軽量削除は現在本番用に準備されていますが、23.3以前のClickHouseバージョンではパフォーマンスやその他の問題が発生する可能性があります。
- この戦略は影響を受けるテーブル/関係に直接作用するため、中間または一時テーブルを作成せずに処理を行うため、操作中に問題が発生した場合、インクリメンタルモデルのデータは無効な状態になる可能性があります。
- 軽量削除を使用する際は、dbt-clickhouseは設定`allow_nondeterministic_mutations`を有効にします。非常にまれなケースで、非決定論的な`incremental_predicates`を使用することで、更新/削除されたアイテムに対してレース条件が発生する可能性があり（ClickHouseログに関連するログメッセージが表示される）、一貫した結果を保証するためには、インクリメンタルマテリアリゼーション中に変更されないデータに対するサブクエリのみを含めるべきです。
##### マイクロバッチ戦略（dbt-core >= 1.9が必要） {#microbatch-strategy}

インクリメンタル戦略`microbatch`は、バージョン1.9以来dbt-coreの機能であり、大規模な時系列データの変換を効率的に処理するように設計されています。dbt-clickhouseでは、既存の`delete_insert`インクリメンタル戦略に基づいており、`event_time`および`batch_size`モデル設定に基づいてインクリメントを既定の時系列バッチに分割します。

大規模な変換を処理する以上に、マイクロバッチは以下の機能を提供します：
- [失敗したバッチを再処理](https://docs.getdbt.com/docs/build/incremental-microbatch#retry)します。
- [並列バッチ実行を自動検出](https://docs.getdbt.com/docs/build/parallel-batch-execution)します。
- [バックフィリング](https://docs.getdbt.com/docs/build/incremental-microbatch#backfills)で複雑な条件ロジックを排除します。

マイクロバッチの詳細な使用法については、[公式ドキュメント](https://docs.getdbt.com/docs/build/incremental-microbatch)を参照してください。
###### 利用可能なマイクロバッチ設定 {#available-microbatch-configurations}

| オプション            | 説明                                                                                                                                                                                                                                                                           | デフォルト値     |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|
| event_time            | 「行がいつ発生したか」を示すカラム。マイクロバッチモデルとフィルタリングされるべき任意の直接親で必須です。                                                                                                                                                                 |                  |
| begin                 | マイクロバッチモデルの「時間の始まり」。これは初期またはフルリフレッシュビルドの開始点です。例えば、2024年10月1日に実行される日次グレインマイクロバッチモデルにおいて、beginが'2023-10-01'の時、366バッチ（うるう年のため！）に加えて「今日」のバッチが処理されます。                       |                  |
| batch_size            | バッチの粒度。サポートされる値は`hour`、`day`、`month`、および`year`です。                                                                                                                                                                                                 |                  |
| lookback              | 最新のブックマークの前のXバッチを処理し、遅れて到着したレコードをキャッチします。                                                                                                                                                                                                 | 1                |
| concurrent_batches    | バッチを同時に実行するためのdbtの自動検出をオーバーライドします。 [並行バッチの設定](https://docs.getdbt.com/docs/build/incremental-microbatch#configure-concurrent_batches)を詳しく読むことができます。trueに設定すると、バッチを並行して実行します（並行）。falseではバッチを逐次的に実行します（1つずつ）。 |                  |
##### アペンド戦略 {#append-strategy}

この戦略は、以前のバージョンのdbt-clickhouseにおける`inserts_only`設定を置き換えます。このアプローチは新しい行を既存の関係に単に追加するものです。その結果、重複行は除去されず、一時的または中間テーブルは存在しません。重複がデータに許可される場合またはインクリメンタルクエリWHERE節/フィルターで除外される場合、最も速いアプローチとなります。
##### insert_overwrite戦略（実験的） {#insert-overwrite-strategy}

> [重要]  
> 現在、insert_overwrite戦略は、分散マテリアリゼーションには完全に機能していません。

以下の手順を実行します：

1. インクリメンタルモデル関係と同じ構造のステージング（テンポラリー）テーブルを作成：`CREATE TABLE <staging> AS <target>`。
2. ステージングテーブルに新しいレコードのみ（`SELECT`によって生成されたもの）を挿入します。
3. ターゲットテーブルにステージングテーブルに存在する新しいパーティションのみを置き換えます。

このアプローチには以下の利点があります：

- 素早く、全テーブルのコピーを必要としないため、デフォルト戦略よりも速くなります。
- INSERT操作が正常に完了するまで、元のテーブルを変更しないため、他の戦略よりも安全です。中間的な失敗の場合、元のテーブルは変更されません。
- インクリメンタルおよび並行データ処理、ロールバックなどを簡素化するデータエンジニアリングのベストプラクティスを実装します。

この戦略には、モデル設定の`partition_by`を設定する必要があります。他の戦略固有のパラメータは無視されます。
### マテリアリゼーション: マテリアライズドビュー（実験的） {#materialized-view}

`materialized_view`マテリアリゼーションは、既存の（ソース）テーブルからの`SELECT`である必要があります。アダプターはモデル名を持つターゲットテーブルと、`<model_name>_mv`という名前のClickHouseマテリアライズドビューを作成します。PostgreSQLとは異なり、ClickHouseのマテリアライズドビューは「静的」ではなく（対応するREFRESH操作はありません）、代わりに「挿入トリガー」として機能し、定義された`SELECT`「変換」を使用してソーステーブルに挿入された行をターゲットテーブルに挿入します。この機能を使った導入例は、[テストファイル](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py)を参照してください。

Clickhouseは、1つ以上のマテリアライズドビューが同じターゲットテーブルにレコードを書き込む能力を提供します。これをdbt-clickhouseでサポートするために、モデルファイル内に`UNION`を構築することができます。モデルファイル内の各マテリアライズドビューのSQLは、`--my_mv_name:begin`および`--my_mv_name:end`という形式のコメントでラップされます。

例えば、以下はモデルの同じ宛先テーブルにデータを書き込む2つのマテリアライズドビューを構築します。マテリアライズドビューの名前は`<model_name>_mv1`および`<model_name>_mv2`の形式になります：

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
> 複数のマテリアライズドビュー（MV）を持つモデルを更新する際、特にMV名の1つを変更する場合、dbt-clickhouseは古いMVを自動的に削除しません。そのため、次の警告が表示されます：
`警告 - テーブル<previous table name>がモデル名<your model name>と同じパターンで検出されましたが、この実行では見つかりませんでした。以前にこのモデルの一部であったリネームされたmvである場合は、手動でドロップしてください（!!!）`
#### データキャッチアップ {#data-catch-up}

現在、マテリアライズドビュー（MV）を作成する際には、ターゲットテーブルは最初に既存のデータで満たされ、その後にMV自体が作成されます。

言い換えれば、dbt-clickhouseは最初にターゲットテーブルを作成し、それをMVのために定義されたクエリに基づいて歴史的データでプリロードします。このステップの後にのみMVが作成されます。

MV作成時に歴史的データをプリロードしたくない場合は、キャッチアップ設定をFalseに設定することでこの動作を無効にできます：

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    catchup=False
)}}
```
#### リフレッシュ可能なマテリアライズドビュー {#refreshable-materialized-views}

[リフレッシュ可能なマテリアライズドビュー](https://clickhouse.com/docs/en/materialized-view/refreshable-materialized-view)を使用するには、MVモデル内で以下の設定を適宜調整してください（これらのすべての設定はリフレッシュ可能な設定オブジェクト内に設定する必要があります）：

| オプション                | 説明                                                                                                                                                     | 必須 | デフォルト値     |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|------|------------------|
| refresh_interval           | インターバル句（必須）                                                                                                                                   | はい |                  |
| randomize                  | ランダム化句で、`RANDOMIZE FOR`の後に表示されます。                                                                                                         |      |                  |
| append                     | Trueに設定すると、各リフレッシュは既存の行を削除せずにテーブルに行を挿入します。挿入は、通常のINSERT SELECTと同じように原子的ではありません。                                            |      | False            |
| depends_on                 | リフレッシュ可能なmvの依存関係リスト。依存関係を`{schema}.{view_name}`形式で提供してください。                                                        |      |                  |
| depends_on_validation     | `depends_on`で提供された依存関係の存在を検証するかどうか。依存関係にスキーマが含まれていない場合は、デフォルトスキーマで検証が行われます。                                                     |      | False            |

リフレッシュ可能なマテリアライズドビューの設定例：

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

* 依存関係のあるリフレッシュ可能なマテリアライズドビュー（MV）をClickHouseで作成する場合、指定された依存関係が作成時に存在しない場合、ClickHouseはエラーをスローしません。代わりに、リフレッシュ可能なMVは非アクティブ状態のままで、依存関係が満たされるのを待ってから更新やリフレッシュを開始します。この動作は設計に基づくものですが、必要な依存関係が迅速に解決されない場合、データの可用性に遅延が生じる可能性があります。ユーザーは、リフレッシュ可能なマテリアライズドビューを作成する前に、すべての依存関係が正しく定義され、存在することを確認することをお勧めします。
* 現在、MVとその依存関係間の実際の「dbtリンケージ」は存在せず、そのため作成順序は保証されていません。
* リフレッシュ可能な機能は、同じターゲットモデルに向けた複数のMVでテストされていません。
### マテリアリゼーション: 辞書（実験的） {#materialization-dictionary}

ClickHouse辞書のマテリアリゼーションを実装する方法に関する例については、テストを参照してください https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py
### マテリアリゼーション: 分散テーブル（実験的） {#materialization-distributed-table}

分散テーブルは以下の手順で作成されます：

1. 正しい構造を取得するためのSQLクエリでテンポラリービューを作成します。
2. ビューに基づいて空のローカルテーブルを作成します。
3. ローカルテーブルに基づいて分散テーブルを作成します。
4. データは分散テーブルに挿入され、シャード間で重複することなく分散されます。

注意：
- dbt-clickhouseクエリは現在、自動的に`insert_distributed_sync = 1`の設定を含めて、下流のインクリメンタルマテリアリゼーション操作が正しく実行されるようにします。これにより、一部の分散テーブル挿入が予想よりも遅くなる可能性があります。
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
#### 生成されたマイグレーション {#distributed-table-generated-migrations}

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = ReplacingMergeTree
    ORDER BY (id, created_at)
    SETTINGS index_granularity = 8192;

CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```
### マテリアリゼーション: 分散インクリメンタル（実験的） {#materialization-distributed-incremental}

分散テーブルに基づくインクリメンタルモデルで、主な難しさはすべてのインクリメンタル戦略を正しく処理することです。

1. _アペンド戦略_は、新しいデータを分散テーブルに挿入します。
2. _Delete+Insert_戦略は、すべてのシャードのデータを操作するために分散一時テーブルを作成します。
3. _デフォルト（レガシー）戦略_は、同じ理由で分散一時テーブルおよび中間テーブルを作成します。

置き換えられるのはシャードテーブルのみです。分散テーブルはデータを保持しません。分散テーブルは、full_refreshモードが有効になっている場合や、テーブル構造が変更されている場合のみ再読み込みされます。
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
#### 生成されたマイグレーション {#distributed-incremental-generated-migrations}

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = MergeTree
    SETTINGS index_granularity = 8192;

CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```
### スナップショット {#snapshot}

dbt スナップショットを使用すると、可変モデルの変更を時間の経過とともに記録できます。これにより、アナリストがモデルの以前の状態を「時間を遡って」見ることができるポイントインタイムクエリが可能になります。この機能は ClickHouse コネクタによってサポートされており、以下の構文を使用して構成されます。

`snapshots/<model_name>.sql` の設定ブロック：
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

構成に関する詳細は、[スナップショット設定](https://docs.getdbt.com/docs/build/snapshots#snapshot-configs) のリファレンスページを確認してください。
### コントラクトと制約 {#contracts-and-constraints}

正確なカラム型のコントラクトのみがサポートされています。例えば、UInt32 カラム型のコントラクトは、モデルが UInt64 または他の整数型を返す場合に失敗します。
ClickHouse は、テーブル/モデル全体に対してのみ `CHECK` 制約をサポートしています。主キー、外部キー、一意性、カラムレベルの CHECK 制約はサポートされていません。
（主キー/順序キーに関する ClickHouse ドキュメントを参照してください。）
### 追加の ClickHouse マクロ {#additional-clickhouse-macros}
#### モデルマテリアリゼーションユーティリティマクロ {#model-materialization-utility-macros}

ClickHouse 特有のテーブルやビューを作成するために、次のマクロが含まれています：

- `engine_clause` -- `engine` モデル設定プロパティを使用して ClickHouse テーブルエンジンを割り当てます。dbt-clickhouse はデフォルトで `MergeTree` エンジンを使用します。
- `partition_cols` -- `partition_by` モデル設定プロパティを使用して ClickHouse パーティションキーを割り当てます。デフォルトではパーティションキーは割り当てられていません。
- `order_cols` -- `order_by` モデル設定を使用して ClickHouse の order by/ソートキーを割り当てます。指定されていない場合、ClickHouse は空のタプル() を使用し、テーブルはソートされません。
- `primary_key_clause` -- `primary_key` モデル設定プロパティを使用して ClickHouse 主キーを割り当てます。デフォルトでは、主キーが設定され、ClickHouse は order by 句を主キーとして使用します。
- `on_cluster_clause` -- `cluster` プロファイルプロパティを使用して、特定の dbt 操作に `ON CLUSTER` 句を追加します：分散マテリアリゼーション、ビューの作成、データベースの作成。
- `ttl_config` -- `ttl` モデル設定プロパティを使用して ClickHouse テーブルの TTL 表現を割り当てます。デフォルトでは TTL は割り当てられていません。
#### s3Source ヘルパーマクロ {#s3source-helper-macro}

`s3source` マクロは、ClickHouse S3 テーブル関数を使用して S3 から直接データを選択するプロセスを簡素化します。このマクロは、名前付き設定辞書から S3 テーブル関数のパラメーターを生成することによって機能します（辞書の名前は `s3` で終わる必要があります）。マクロは最初にプロファイルの `vars` で辞書を探し、その後モデル設定で探します。辞書には、S3 テーブル関数のパラメーターを生成するために使用される次のキーのいずれかを含めることができます：

| 引数名                   | 説明                                                                                                                                                                                    |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| bucket                | ベース URL のバケット、たとえば `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi`。プロトコルが指定されていない場合は `https://` が前提とされます。                                        |
| path                  | テーブルクエリに使用する S3 パス、たとえば `/trips_4.gz`。S3 ワイルドカードがサポートされています。                                                                                                  |
| fmt                   | 参照される S3 オブジェクトの期待される ClickHouse 入力形式（`TSV` や `CSVWithNames` など）。                                                                                         |
| structure             | バケット内のデータのカラム構造、名前/データ型ペアのリスト、たとえば `['id UInt32', 'date DateTime', 'value String']`。提供されない場合、ClickHouse は構造を推定します。 |
| aws_access_key_id     | S3 アクセスキー ID。                                                                                                                                                                        |
| aws_secret_access_key | S3 シークレットキー。                                                                                                                                                                           |
| role_arn              | S3 オブジェクトに安全にアクセスするために使用する ClickhouseAccess IAM ロールの ARN。この [ドキュメント](https://clickhouse.com/docs/en/cloud/security/secure-s3) で詳細を確認してください。     |
| compression           | S3 オブジェクトに使用される圧縮方法。提供されない場合、ClickHouse はファイル名に基づいて圧縮を決定しようとします。                                                   |

このマクロの使用例については、[S3 テストファイル](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/clickhouse/test_clickhouse_s3.py)を参照してください。
#### クロスデータベースマクロサポート {#cross-database-macro-support}

dbt-clickhouse は、以下の例外を除いて、現在 `dbt Core` に含まれているほとんどのクロスデータベースマクロをサポートしています：

* `split_part` SQL 関数は、ClickHouse では splitByChar 関数を使用して実装されています。この関数は「分割」区切り文字として定数文字列を必要とし、そのためこのマクロで使用される `delimeter` パラメーターはカラム名ではなく文字列として解釈されます。
* 同様に、ClickHouse の `replace` SQL 関数も `old_chars` および `new_chars` パラメーターに定数文字列を必要とするため、これらのパラメーターはこのマクロを呼び出す際にカラム名ではなく文字列として解釈されます。

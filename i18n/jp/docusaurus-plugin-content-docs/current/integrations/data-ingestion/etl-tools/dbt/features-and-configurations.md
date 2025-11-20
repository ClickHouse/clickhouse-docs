---
sidebar_label: '機能と構成'
slug: /integrations/dbt/features-and-configurations
sidebar_position: 2
description: 'ClickHouse で dbt を使用するための機能'
keywords: ['clickhouse', 'dbt', 'features']
title: '機能と構成'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 機能と設定

<ClickHouseSupportedBadge/>

このセクションでは、ClickHouse と連携した dbt で利用できる主な機能の一部について説明します。

<TOCInline toc={toc}  maxHeadingLevel={3} />



## Profile.yml の設定 {#profile-yml-configurations}

dbt から ClickHouse に接続するには、`profiles.yml` ファイルに [profile](https://docs.getdbt.com/docs/core/connect-data-platform/connection-profiles) を追加する必要があります。ClickHouse プロファイルは以下の構文に従います:

```yaml
your_profile_name:
  target: dev
  outputs:
    dev:
      type: clickhouse

      # オプション
      schema: [default] # dbt モデル用の ClickHouse データベース
      driver: [http] # http または native。未設定の場合、ポート設定に基づいて自動決定されます
      host: [localhost]
      port: [8123] # 未設定の場合、secure および driver 設定に応じて 8123、8443、9000、9440 がデフォルトになります
      user: [default] # すべてのデータベース操作用のユーザー
      password: [<empty string>] # ユーザーのパスワード
      cluster: [<empty string>] # 設定されている場合、特定の DDL/テーブル操作がこのクラスタを使用して `ON CLUSTER` 句で実行されます。分散マテリアライゼーションにはこの設定が必要です。詳細については、以下の ClickHouse クラスタセクションを参照してください。
      verify: [True] # TLS/SSL 使用時に TLS 証明書を検証します
      secure: [False] # TLS(ネイティブプロトコル)または HTTPS(http プロトコル)を使用します
      client_cert: [null] # .pem 形式の TLS クライアント証明書へのパス
      client_cert_key: [null] # TLS クライアント証明書の秘密鍵へのパス
      retries: [1] # 「再試行可能な」データベース例外(503 'Service Unavailable' エラーなど)を再試行する回数
      compression: [<empty string>] # 真の値の場合 gzip 圧縮を使用(http)、またはネイティブ接続の圧縮タイプ
      connect_timeout: [10] # ClickHouse への接続を確立するためのタイムアウト(秒)
      send_receive_timeout: [300] # ClickHouse サーバーからデータを受信するためのタイムアウト(秒)
      cluster_mode: [False] # レプリケートされたデータベースでの操作を改善するために設計された特定の設定を使用します(ClickHouse Cloud に推奨)
      use_lw_deletes: [False] # デフォルトのインクリメンタル戦略として `delete+insert` 戦略を使用します。
      check_exchange: [True] # ClickHouse がアトミックな EXCHANGE TABLES コマンドをサポートしていることを検証します。(ほとんどの ClickHouse バージョンでは不要)
      local_suffix: [_local] # 分散マテリアライゼーション用のシャード上のローカルテーブルのテーブルサフィックス。
      local_db_prefix: [<empty string>] # 分散マテリアライゼーション用のシャード上のローカルテーブルのデータベースプレフィックス。空の場合、分散テーブルと同じデータベースを使用します。
      allow_automatic_deduplication: [False] # レプリケートされたテーブルに対して ClickHouse の自動重複排除を有効にします
      tcp_keepalive: [False] # ネイティブクライアントのみ、TCP キープアライブ設定を指定します。カスタムキープアライブ設定を [idle_time_sec, interval_sec, probes] として指定します。
      custom_settings: [{}] # 接続用のカスタム ClickHouse 設定の辞書/マッピング - デフォルトは空です。
      database_engine: "" # 新しい ClickHouse スキーマ(データベース)を作成する際に使用するデータベースエンジン。未設定の場合(デフォルト)、新しいデータベースはデフォルトの ClickHouse データベースエンジン(通常は Atomic)を使用します。
      threads: [1] # クエリ実行時に使用するスレッド数。1 より大きい数値に設定する前に、[read-after-write 一貫性](#read-after-write-consistency) セクションを必ず読んでください。

      # ネイティブ(clickhouse-driver)接続設定
      sync_request_timeout: [5] # サーバー ping のタイムアウト
      compress_block_size: [1048576] # 圧縮が有効な場合の圧縮ブロックサイズ
```

### スキーマ vs データベース {#schema-vs-database}

dbt モデルのリレーション識別子 `database.schema.table` は ClickHouse と互換性がありません。これは ClickHouse が `schema` をサポートしていないためです。
そのため、簡略化されたアプローチ `schema.table` を使用します。ここで `schema` は ClickHouse データベースです。`default` データベースの使用は推奨されません。

### SET ステートメントの警告 {#set-statement-warning}

多くの環境では、SET ステートメントを使用してすべての dbt クエリにわたって ClickHouse 設定を永続化することは信頼性が低く、予期しない障害を引き起こす可能性があります。これは特に、複数のノードにクエリを分散するロードバランサーを介した HTTP 接続を使用する場合(ClickHouse Cloud など)に当てはまりますが、状況によってはネイティブ ClickHouse 接続でも発生する可能性があります。したがって、時折提案されているプリフック「SET」ステートメントに依存するのではなく、ベストプラクティスとして dbt プロファイルの「custom_settings」プロパティで必要な ClickHouse 設定を構成することを推奨します。

### `quote_columns` の設定 {#setting-quote_columns}


警告を回避するには、`dbt_project.yml`で`quote_columns`の値を明示的に設定してください。詳細については[quote_columnsのドキュメント](https://docs.getdbt.com/reference/resource-configs/quote_columns)を参照してください。

```yaml
seeds:
  +quote_columns: false #CSVカラムヘッダーにスペースが含まれる場合は`true`
```

### ClickHouseクラスタについて {#about-the-clickhouse-cluster}

ClickHouseクラスタを使用する際は、以下の2点を考慮する必要があります:

- `cluster`設定の指定
- 読み取り後書き込み一貫性の確保(特に複数の`threads`を使用する場合)

#### クラスタ設定 {#cluster-setting}

プロファイルの`cluster`設定により、dbt-clickhouseをClickHouseクラスタに対して実行できるようになります。プロファイルで`cluster`が設定されている場合、**Replicated**エンジンを使用するモデルを除き、デフォルトで**すべてのモデルが`ON CLUSTER`句付きで作成されます**。これには以下が含まれます:

- データベースの作成
- ビューのマテリアライゼーション
- テーブルおよびインクリメンタルのマテリアライゼーション
- 分散マテリアライゼーション

Replicatedエンジンは内部的にレプリケーションを管理するよう設計されているため、`ON CLUSTER`句は**含まれません**。

特定のモデルでクラスタベースの作成を**無効化**するには、`disable_on_cluster`設定を追加します:

```sql
{{ config(
        engine='MergeTree',
        materialized='table',
        disable_on_cluster='true'
    )
}}

```

非レプリケートエンジンを使用するテーブルおよびインクリメンタルのマテリアライゼーションは`cluster`設定の影響を受けません(モデルは接続されたノードのみに作成されます)。

**互換性**

`cluster`設定なしでモデルが作成されている場合、dbt-clickhouseはその状況を検出し、このモデルに対するすべてのDDL/DMLを`on cluster`句なしで実行します。

#### 読み取り後書き込み一貫性 {#read-after-write-consistency}

dbtは読み取り後挿入一貫性モデルに依存しています。すべての操作が同じレプリカに送信されることを保証できない場合、複数のレプリカを持つClickHouseクラスタとは互換性がありません。dbtの日常的な使用では問題に遭遇しない可能性がありますが、この保証を確保するためのクラスタに応じた戦略がいくつかあります:

- ClickHouse Cloudクラスタを使用している場合は、プロファイルの`custom_settings`プロパティで`select_sequential_consistency: 1`を設定するだけで済みます。この設定の詳細については[こちら](https://clickhouse.com/docs/operations/settings/settings#select_sequential_consistency)を参照してください。
- セルフホストクラスタを使用している場合は、すべてのdbtリクエストが同じClickHouseレプリカに送信されるようにしてください。ロードバランサーを使用している場合は、常に同じレプリカに到達できるように`replica aware routing`/`sticky sessions`メカニズムの使用を検討してください。ClickHouse Cloud以外のクラスタで`select_sequential_consistency = 1`設定を追加することは[推奨されません](https://clickhouse.com/docs/operations/settings/settings#select_sequential_consistency)。


## 機能に関する一般情報 {#general-information-about-features}

### 一般的なテーブル設定 {#general-table-configurations}

| オプション         | 説明                                                                                                                                                                                                   | デフォルト値 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| engine         | テーブル作成時に使用するテーブルエンジン（テーブルの種類）                                                                                                                                                  | `MergeTree()`  |
| order_by       | カラム名または任意の式のタプル。データをより高速に検索するための小さなスパースインデックスを作成できます。                                                                                 | `tuple()`      |
| partition_by   | パーティションは、指定された基準によるテーブル内のレコードの論理的な組み合わせです。パーティションキーは、テーブルカラムからの任意の式を指定できます。                                                          |                |
| sharding_key   | シャーディングキーは、分散エンジンテーブルへの挿入時に宛先サーバーを決定します。シャーディングキーはランダムまたはハッシュ関数の出力として指定できます                                                | `rand()`)      |
| primary_key    | order_byと同様に、ClickHouseのプライマリキー式です。指定されていない場合、ClickHouseはorder by式をプライマリキーとして使用します                                                                          |                |
| unique_key     | 行を一意に識別するカラム名のタプル。更新のためのインクリメンタルモデルで使用されます。                                                                                                                |                |
| settings       | このモデルで'CREATE TABLE'などのDDLステートメントに使用される「TABLE」設定のマップ/辞書                                                                                                         |                |
| query_settings | このモデルと組み合わせて`INSERT`または`DELETE`ステートメントで使用されるClickHouseユーザーレベル設定のマップ/辞書                                                                             |                |
| ttl            | テーブルで使用されるTTL式。TTL式は、テーブルのTTLを指定するために使用できる文字列です。                                                                                 |                |
| indexes        | 作成する[データスキッピングインデックス](/optimize/skipping-indexes)のリスト。詳細については以下を参照してください。                                                                                                    |                |
| sql_security   | ビューの基礎となるクエリを実行する際に使用するClickHouseユーザーを指定できます。`SQL SECURITY`には[2つの有効な値](/sql-reference/statements/create/view#sql_security)があります：`definer`、`invoker`。 |                |
| definer        | `sql_security`が`definer`に設定されている場合、`definer`句で既存のユーザーまたは`CURRENT_USER`を指定する必要があります。                                                                                      |                |
| projections    | 作成する[プロジェクション](/data-modeling/projections)のリスト。詳細については[プロジェクションについて](#projections)を参照してください。                                                                                       |                |

#### データスキッピングインデックスについて {#data-skipping-indexes}

データスキッピングインデックスは`table`マテリアライゼーションでのみ利用可能です。テーブルにデータスキッピングインデックスのリストを追加するには、`indexes`設定を使用します：

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

`projections`設定を使用して、`table`および`distributed_table`マテリアライゼーションに[プロジェクション](/data-modeling/projections)を追加できます：

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

**注意**：分散テーブルの場合、プロジェクションは分散プロキシテーブルではなく、`_local`テーブルに適用されます。

### サポートされているテーブルエンジン {#supported-table-engines}

| タイプ                   | 詳細                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| MergeTree（デフォルト）    | https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/.         |
| HDFS                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs                    |
| MaterializedPostgreSQL | https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql |
| S3                     | https://clickhouse.com/docs/en/engines/table-engines/integrations/s3                      |
| EmbeddedRocksDB        | https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb        |
| Hive                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hive                    |

### 実験的にサポートされているテーブルエンジン {#experimental-supported-table-engines}


| タイプ              | 詳細                                                                   |
| ----------------- | ------------------------------------------------------------------------- |
| Distributed Table | https://clickhouse.com/docs/en/engines/table-engines/special/distributed. |
| Dictionary        | https://clickhouse.com/docs/en/engines/table-engines/special/dictionary   |

上記のエンジンのいずれかを使用してdbtからClickHouseへの接続で問題が発生した場合は、[こちら](https://github.com/ClickHouse/dbt-clickhouse/issues)で問題を報告してください。

### モデル設定に関する注意事項 {#a-note-on-model-settings}

ClickHouseには複数のタイプ/レベルの「設定」があります。上記のモデル設定では、これらのうち2つのタイプが設定可能です。`settings`は`CREATE TABLE/VIEW`タイプのDDL文で使用される`SETTINGS`句を意味し、通常は特定のClickHouseテーブルエンジンに固有の設定です。新しい`query_settings`は、モデルのマテリアライゼーション(インクリメンタルマテリアライゼーションを含む)に使用される`INSERT`および`DELETE`クエリに`SETTINGS`句を追加するために使用されます。ClickHouseには数百の設定があり、どれが「テーブル」設定でどれが「ユーザー」設定なのかが必ずしも明確ではありません(ただし、後者は通常`system.settings`テーブルで利用可能です)。一般的にはデフォルト値の使用が推奨されており、これらのプロパティを使用する場合は慎重に調査とテストを行う必要があります。

### カラム設定 {#column-configuration}

> **_注意:_** 以下のカラム設定オプションを使用するには、[モデルコントラクト](https://docs.getdbt.com/docs/collaborate/govern/model-contracts)を適用する必要があります。

| オプション | 説明                                                                                                                                                                                                                                    | デフォルト値 |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| codec  | カラムのDDLで`CODEC()`に渡される引数で構成される文字列。例: `codec: "Delta, ZSTD"`は`CODEC(Delta, ZSTD)`としてコンパイルされます。                                                                                        |
| ttl    | カラムのDDLでTTLルールを定義する[TTL(生存時間)式](https://clickhouse.com/docs/guides/developer/ttl)で構成される文字列。例: `ttl: ts + INTERVAL 1 DAY`は`TTL ts + INTERVAL 1 DAY`としてコンパイルされます。 |

#### スキーマ設定の例 {#example-of-schema-configuration}

```yaml
models:
  - name: table_column_configs
    description: "カラムレベル設定のテスト"
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

dbtはモデルを作成するために使用されるSQLを分析することで、各カラムのデータ型を自動的に判定します。ただし、場合によってはこのプロセスがデータ型を正確に判定できず、コントラクトの`data_type`プロパティで指定された型と競合することがあります。これに対処するため、モデルSQLで`CAST()`関数を使用して目的の型を明示的に定義することを推奨します。例:

```sql
{{
    config(
        materialized="materialized_view",
        engine="AggregatingMergeTree",
        order_by=["event_type"],
    )
}}

select
  -- event_typeはStringとして推論される可能性がありますが、LowCardinality(String)を使用したい場合:
  CAST(event_type, 'LowCardinality(String)') as event_type,
  -- countState()は`AggregateFunction(count)`として推論される可能性がありますが、使用される引数の型を変更したい場合:
  CAST(countState(), 'AggregateFunction(count, UInt32)') as response_count,
  -- maxSimpleState()は`SimpleAggregateFunction(max, String)`として推論される可能性がありますが、使用される引数の型も変更したい場合:
  CAST(maxSimpleState(event_type), 'SimpleAggregateFunction(max, LowCardinality(String))') as max_event_type
from {{ ref('user_events') }}
group by event_type
```


## Features {#features}

### マテリアライゼーション: view {#materialization-view}

dbtモデルは[ClickHouse view](https://clickhouse.com/docs/en/sql-reference/table-functions/view/)として作成でき、以下の構文で設定します:

プロジェクトファイル (`dbt_project.yml`):

```yaml
models:
  <resource-path>:
    +materialized: view
```

または設定ブロック (`models/<model_name>.sql`):

```python
{{ config(materialized = "view") }}
```

### マテリアライゼーション: table {#materialization-table}

dbtモデルは[ClickHouse table](https://clickhouse.com/docs/en/operations/system-tables/tables/)として作成でき、以下の構文で設定します:

プロジェクトファイル (`dbt_project.yml`):

```yaml
models:
  <resource-path>:
    +materialized: table
    +order_by: [<column-name>, ...]
    +engine: <engine-type>
    +partition_by: [<column-name>, ...]
```

または設定ブロック (`models/<model_name>.sql`):

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

テーブルモデルはdbtの実行ごとに再構築されます。大規模な結果セットや複雑な変換では、これは実行不可能で非常にコストがかかる可能性があります。この課題に対処しビルド時間を短縮するため、dbtモデルをインクリメンタルなClickHouseテーブルとして作成でき、以下の構文で設定します:

`dbt_project.yml`でのモデル定義:

```yaml
models:
  <resource-path>:
    +materialized: incremental
    +order_by: [<column-name>, ...]
    +engine: <engine-type>
    +partition_by: [<column-name>, ...]
    +unique_key: [<column-name>, ...]
    +inserts_only: [True|False]
```

Or config block in `models/<model_name>.sql`:

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

このマテリアライゼーションタイプに固有の設定を以下に示します:

| オプション                   | 説明                                                                                                                                                                                                                                                                                                            | 必須?                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `unique_key`             | 行を一意に識別するカラム名のタプル。一意性制約の詳細については、[こちら](https://docs.getdbt.com/docs/build/incremental-models#defining-a-unique-key-optional)を参照してください。                                                                                                                     | 必須。指定しない場合、変更された行がインクリメンタルテーブルに2回追加されます。 |
| `inserts_only`           | 同じ動作をする`append`インクリメンタル`strategy`を優先するため非推奨となりました。インクリメンタルモデルでTrueに設定すると、中間テーブルを作成せずにインクリメンタル更新がターゲットテーブルに直接挿入されます。`inserts_only`が設定されている場合、`incremental_strategy`は無視されます。 | オプション (デフォルト: `False`)                                                          |
| `incremental_strategy`   | インクリメンタルマテリアライゼーションに使用する戦略。`delete+insert`、`append`、`insert_overwrite`、または`microbatch`がサポートされています。戦略の詳細については、[こちら](/integrations/dbt/features-and-configurations#incremental-model-strategies)を参照してください                                                        | オプション (デフォルト: 'default')                                                        |
| `incremental_predicates` | インクリメンタルマテリアライゼーションに適用する追加条件(`delete+insert`戦略にのみ適用)                                                                                                                                                                                                       | オプション                                                                             |

#### インクリメンタルモデル戦略 {#incremental-model-strategies}

`dbt-clickhouse`は3つのインクリメンタルモデル戦略をサポートしています。

##### デフォルト(レガシー)戦略 {#default-legacy-strategy}

歴史的に、ClickHouseは非同期の「ミューテーション」という形で、更新と削除に対する限定的なサポートしか提供していませんでした。
期待されるdbtの動作をエミュレートするため、
dbt-clickhouseはデフォルトで、影響を受けていない(削除されていない、変更されていない)「古い」レコードすべてと、新規または更新されたレコードを含む新しい一時テーブルを作成し、
その後、この一時テーブルを既存のインクリメンタルモデルリレーションとスワップまたは交換します。これは、操作が完了する前に何か問題が発生した場合に元のリレーションを保持する唯一の戦略です。ただし、元のテーブルの完全なコピーを伴うため、実行に非常にコストがかかり、遅くなる可能性があります。

##### Delete+Insert戦略 {#delete-insert-strategy}


ClickHouseはバージョン22.8で実験的機能として「軽量削除」を追加しました。軽量削除はClickHouseのデータパーツの書き換えが不要なため、ALTER TABLE ... DELETE操作よりも大幅に高速です。インクリメンタル戦略`delete+insert`は軽量削除を利用することで、「レガシー」戦略よりも大幅に優れたパフォーマンスを発揮するインクリメンタルマテリアライゼーションを実装します。ただし、この戦略を使用する際には以下の重要な注意点があります：

- 軽量削除を使用するには、ClickHouseサーバーで設定`allow_experimental_lightweight_delete=1`を有効にするか、プロファイルで`use_lw_deletes=true`を設定する必要があります（これによりdbtセッションでその設定が有効になります）
- 軽量削除は現在本番環境で使用可能ですが、23.3より前のClickHouseバージョンではパフォーマンスやその他の問題が発生する可能性があります。
- この戦略は影響を受けるテーブル/リレーションに対して直接動作します（中間テーブルや一時テーブルを作成しません）。そのため、操作中に問題が発生した場合、インクリメンタルモデルのデータが無効な状態になる可能性があります
- 軽量削除を使用する場合、dbt-clickhouseは設定`allow_nondeterministic_mutations`を有効にします。非決定的なincremental_predicatesを使用する非常に稀なケースでは、更新/削除されたアイテムに対して競合状態が発生する可能性があります（ClickHouseログに関連するログメッセージが記録されます）。一貫した結果を保証するために、インクリメンタル述語にはインクリメンタルマテリアライゼーション中に変更されないデータに対するサブクエリのみを含める必要があります。

##### マイクロバッチ戦略（dbt-core >= 1.9が必要） {#microbatch-strategy}

インクリメンタル戦略`microbatch`は、バージョン1.9以降のdbt-coreの機能であり、大規模な時系列データ変換を効率的に処理するように設計されています。dbt-clickhouseでは、既存の`delete_insert`インクリメンタル戦略をベースに、`event_time`と`batch_size`モデル設定に基づいて増分を事前定義された時系列バッチに分割します。

大規模な変換の処理に加えて、マイクロバッチは以下の機能を提供します：

- [失敗したバッチの再処理](https://docs.getdbt.com/docs/build/incremental-microbatch#retry)
- [並列バッチ実行](https://docs.getdbt.com/docs/build/parallel-batch-execution)の自動検出
- [バックフィル](https://docs.getdbt.com/docs/build/incremental-microbatch#backfills)における複雑な条件ロジックの排除

マイクロバッチの詳細な使用方法については、[公式ドキュメント](https://docs.getdbt.com/docs/build/incremental-microbatch)を参照してください。

###### 利用可能なマイクロバッチ設定 {#available-microbatch-configurations}

| オプション             | 説明                                                                                                                                                                                                                                                                                                                                | デフォルト値 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| event_time         | 「その行がいつ発生したか」を示すカラム。マイクロバッチモデルおよびフィルタリングする必要がある直接の親に必須です。                                                                                                                                                                                                                 |                |
| begin              | マイクロバッチモデルの「時間の始まり」。初期ビルドまたはフルリフレッシュビルドの開始点です。例えば、begin = '2023-10-01で2024-10-01に実行される日次粒度のマイクロバッチモデルは、366バッチ（閏年です！）と「今日」のバッチを処理します。                                                       |                |
| batch_size         | バッチの粒度。サポートされる値は`hour`、`day`、`month`、`year`です                                                                                                                                                                                                                                                   |                |
| lookback           | 遅延到着レコードをキャプチャするために、最新のブックマークより前のXバッチを処理します。                                                                                                                                                                                                                                           | 1              |
| concurrent_batches | バッチを同時実行するためのdbtの自動検出をオーバーライドします。[concurrent batchesの設定](https://docs.getdbt.com/docs/build/incremental-microbatch#configure-concurrent_batches)の詳細をご覧ください。trueに設定するとバッチが並列実行されます。falseに設定するとバッチが順次実行されます。 |                |

##### 追加戦略 {#append-strategy}

この戦略は、以前のバージョンのdbt-clickhouseの`inserts_only`設定を置き換えます。このアプローチは、既存のリレーションに新しい行を単純に追加します。その結果、重複行は削除されず、一時テーブルや中間テーブルも作成されません。データ内で重複が許可されている場合、またはインクリメンタルクエリのWHERE句/フィルタによって除外される場合、これが最も高速なアプローチです。

##### insert_overwrite戦略（実験的） {#insert-overwrite-strategy}

> [重要]  
> 現在、insert_overwrite戦略は分散マテリアライゼーションでは完全に機能しません。

以下のステップを実行します：


1. インクリメンタルモデルリレーションと同じ構造を持つステージング(一時)テーブルを作成します:
   `CREATE TABLE <staging> AS <target>`
2. `SELECT`によって生成された新しいレコードのみをステージングテーブルに挿入します。
3. ステージングテーブルに存在する新しいパーティションのみをターゲットテーブルに置き換えます。

このアプローチには以下の利点があります:

- テーブル全体をコピーしないため、デフォルト戦略よりも高速です。
- INSERT操作が正常に完了するまで元のテーブルを変更しないため、他の戦略よりも安全です:途中で障害が発生した場合でも、元のテーブルは変更されません。
- データエンジニアリングのベストプラクティスである「パーティションの不変性」を実装しています。これにより、インクリメンタルおよび並列データ処理、ロールバックなどが簡素化されます。

この戦略では、モデル設定で`partition_by`を設定する必要があります。モデル設定の他の戦略固有のパラメータはすべて無視されます。

### マテリアライゼーション: materialized_view (実験的機能) {#materialized-view}

`materialized_view`マテリアライゼーションは、既存の(ソース)テーブルからの`SELECT`である必要があります。アダプターは、モデル名を持つターゲットテーブルと、`<model_name>_mv`という名前のClickHouse MATERIALIZED VIEWを作成します。PostgreSQLとは異なり、ClickHouseのマテリアライズドビューは「静的」ではなく(対応するREFRESH操作もありません)、「挿入トリガー」として機能し、ソーステーブルに挿入された行に対してビュー定義で定義された`SELECT`「変換」を使用して、ターゲットテーブルに新しい行を挿入します。この機能の使用方法に関する入門的な例については、[テストファイル](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py)を参照してください。

ClickHouseは、複数のマテリアライズドビューが同じターゲットテーブルにレコードを書き込む機能を提供します。dbt-clickhouseでこれをサポートするには、モデルファイルで`UNION`を構築し、各マテリアライズドビューのSQLを`--my_mv_name:begin`と`--my_mv_name:end`の形式のコメントでラップします。

例えば、以下は2つのマテリアライズドビューを構築し、両方ともモデルの同じ宛先テーブルにデータを書き込みます。マテリアライズドビューの名前は`<model_name>_mv1`と`<model_name>_mv2`の形式になります:

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
> 複数のマテリアライズドビュー(MV)を持つモデルを更新する際、特にMV名の1つを変更する場合、
> dbt-clickhouseは古いMVを自動的に削除しません。代わりに、
> 以下の警告が表示されます:
> `Warning - Table <previous table name> was detected with the same pattern as model name <your model name> but was not found in this run. In case it is a renamed mv that was previously part of this model, drop it manually (!!!) `

#### データキャッチアップ {#data-catch-up}

現在、マテリアライズドビュー(MV)を作成する際、MV自体が作成される前に、まずターゲットテーブルに履歴データが投入されます。

つまり、dbt-clickhouseは最初にターゲットテーブルを作成し、MVに定義されたクエリに基づいて履歴データを事前にロードします。この手順の後にのみMVが作成されます。

MV作成時に履歴データを事前にロードしたくない場合は、catchup設定をFalseに設定することでこの動作を無効にできます:

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    catchup=False
)}}
```

#### リフレッシュ可能なマテリアライズドビュー {#refreshable-materialized-views}

[リフレッシュ可能なマテリアライズドビュー](https://clickhouse.com/docs/en/materialized-view/refreshable-materialized-view)を使用するには、
MVモデルで必要に応じて以下の設定を調整してください(これらの設定はすべてrefreshable設定オブジェクト内に設定する必要があります):


| オプション                | 説明                                                                                                                                                              | 必須 | デフォルト値 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------- |
| refresh_interval      | インターバル句（必須）                                                                                                                                           | Yes      |               |
| randomize             | ランダム化句。`RANDOMIZE FOR`の後に表示されます                                                                                                              |          |               |
| append                | `True`に設定すると、各リフレッシュ時に既存の行を削除せずにテーブルに行を挿入します。通常のINSERT SELECTと同様に、挿入はアトミックではありません。                  |          | False         |
| depends_on            | リフレッシュ可能なマテリアライズドビューの依存関係リスト。依存関係は`{schema}.{view_name}`の形式で指定してください                                               |          |               |
| depends_on_validation | `depends_on`で指定された依存関係の存在を検証するかどうか。依存関係にスキーマが含まれていない場合、検証は`default`スキーマで実行されます |          | False         |

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

- ClickHouseで依存関係を持つリフレッシュ可能なマテリアライズドビュー（MV）を作成する際、作成時に指定された依存関係が存在しない場合でも、ClickHouseはエラーをスローしません。代わりに、リフレッシュ可能なMVは非アクティブ状態のままとなり、依存関係が満たされるまで更新処理やリフレッシュを開始せずに待機します。
  この動作は設計によるものですが、必要な依存関係が速やかに対処されない場合、データの可用性に遅延が生じる可能性があります。リフレッシュ可能なマテリアライズドビューを作成する前に、すべての依存関係が正しく定義され存在することを確認してください。
- 現時点では、MVとその依存関係の間に実際の「dbt連携」は存在しないため、作成順序は保証されません。
- リフレッシュ可能機能は、同じターゲットモデルを指す複数のMVではテストされていません。

### マテリアライゼーション：dictionary（実験的） {#materialization-dictionary}

ClickHouseディクショナリのマテリアライゼーションを実装する方法の例については、https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py のテストを参照してください

### マテリアライゼーション：distributed_table（実験的） {#materialization-distributed-table}

分散テーブルは以下の手順で作成されます：

1. 正しい構造を取得するためにSQLクエリで一時ビューを作成
2. ビューに基づいて空のローカルテーブルを作成
3. ローカルテーブルに基づいて分散テーブルを作成
4. 分散テーブルにデータを挿入することで、重複なくシャード間でデータが分散されます

注意事項：

- dbt-clickhouseクエリは、下流の増分マテリアライゼーション操作が正しく実行されることを保証するために、`insert_distributed_sync = 1`設定を自動的に含むようになりました。これにより、一部の分散テーブルへの挿入が予想よりも遅く実行される可能性があります。

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

#### 生成されるマイグレーション {#distributed-table-generated-migrations}

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

### マテリアライゼーション：distributed_incremental（実験的） {#materialization-distributed-incremental}

分散テーブルと同じ考え方に基づく増分モデルで、主な課題はすべての増分戦略を正しく処理することです。

1. _追加戦略_は、分散テーブルにデータを挿入するだけです。
2. _削除+挿入戦略_は、すべてのシャード上のすべてのデータを処理するために分散一時テーブルを作成します。
3. _デフォルト（レガシー）戦略_は、同じ理由で分散一時テーブルと中間テーブルを作成します。

分散テーブルはデータを保持しないため、シャードテーブルのみが置き換えられます。
分散テーブルは、full_refreshモードが有効になっている場合、またはテーブル構造が変更された可能性がある場合にのみ再読み込みされます。

#### 分散増分モデルの例 {#distributed-incremental-model-example}


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

#### 生成されるマイグレーション {#distributed-incremental-generated-migrations}

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

dbtスナップショットを使用すると、可変モデルの経時的な変更を記録できます。これにより、モデルに対するポイントインタイムクエリが可能になり、アナリストはモデルの過去の状態を「時間を遡って」確認できます。この機能はClickHouseコネクタでサポートされており、以下の構文を使用して設定します:

`snapshots/<model_name>.sql`内の設定ブロック:

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

設定の詳細については、[スナップショット設定](https://docs.getdbt.com/docs/build/snapshots#snapshot-configs)のリファレンスページを参照してください。

### コントラクトと制約 {#contracts-and-constraints}

厳密な列型コントラクトのみがサポートされています。例えば、UInt32列型のコントラクトは、モデルがUInt64または他の整数型を返す場合に失敗します。
ClickHouseは、テーブル/モデル全体に対する`CHECK`制約_のみ_をサポートしています。主キー、外部キー、一意性制約、および列レベルのCHECK制約はサポートされていません。
(主キー/ORDER BYキーに関するClickHouseドキュメントを参照してください。)

### 追加のClickHouseマクロ {#additional-clickhouse-macros}

#### モデルマテリアライゼーションユーティリティマクロ {#model-materialization-utility-macros}

以下のマクロは、ClickHouse固有のテーブルとビューの作成を容易にするために提供されています:

- `engine_clause` -- `engine`モデル設定プロパティを使用してClickHouseテーブルエンジンを割り当てます。dbt-clickhouseはデフォルトで`MergeTree`エンジンを使用します。
- `partition_cols` -- `partition_by`モデル設定プロパティを使用してClickHouseパーティションキーを割り当てます。デフォルトではパーティションキーは割り当てられません。
- `order_cols` -- `order_by`モデル設定を使用してClickHouseのORDER BY/ソートキーを割り当てます。指定されていない場合、ClickHouseは空のtuple()を使用し、テーブルはソートされません。
- `primary_key_clause` -- `primary_key`モデル設定プロパティを使用してClickHouse主キーを割り当てます。デフォルトでは、主キーが設定され、ClickHouseはORDER BY句を主キーとして使用します。
- `on_cluster_clause` -- `cluster`プロファイルプロパティを使用して、特定のdbt操作に`ON CLUSTER`句を追加します:分散マテリアライゼーション、ビュー作成、データベース作成。
- `ttl_config` -- `ttl`モデル設定プロパティを使用してClickHouseテーブルのTTL式を割り当てます。デフォルトではTTLは割り当てられません。

#### s3Sourceヘルパーマクロ {#s3source-helper-macro}

`s3source`マクロは、ClickHouseのS3テーブル関数を使用してS3から直接ClickHouseデータを選択するプロセスを簡素化します。このマクロは、名前付き設定ディクショナリ(ディクショナリ名は`s3`で終わる必要があります)からS3テーブル関数のパラメータを設定することで機能します。マクロはまずプロファイルの`vars`でディクショナリを検索し、次にモデル設定で検索します。ディクショナリには、S3テーブル関数のパラメータを設定するために使用される以下のキーを含めることができます:


| 引数名         | 説明                                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bucket                | バケットのベースURL(例: `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi`)。プロトコルが指定されていない場合は `https://` が使用されます。                                        |
| path                  | テーブルクエリに使用するS3パス(例: `/trips_4.gz`)。S3ワイルドカードに対応しています。                                                                                                  |
| fmt                   | 参照されるS3オブジェクトに期待されるClickHouse入力フォーマット(例: `TSV` または `CSVWithNames`)。                                                                                        |
| structure             | バケット内のデータのカラム構造。名前とデータ型のペアのリストとして指定します(例: `['id UInt32', 'date DateTime', 'value String']`)。指定されていない場合、ClickHouseが構造を推測します。 |
| aws_access_key_id     | S3アクセスキーID。                                                                                                                                                                       |
| aws_secret_access_key | S3シークレットキー。                                                                                                                                                                          |
| role_arn              | S3オブジェクトに安全にアクセスするために使用するClickhouseAccess IAMロールのARN。詳細については、この[ドキュメント](https://clickhouse.com/docs/en/cloud/security/secure-s3)を参照してください。    |
| compression           | S3オブジェクトで使用される圧縮方式。指定されていない場合、ClickHouseはファイル名に基づいて圧縮方式を判定します。                                                   |

このマクロの使用例については、[S3テストファイル](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/clickhouse/test_clickhouse_s3.py)を参照してください。

#### クロスデータベースマクロのサポート {#cross-database-macro-support}

dbt-clickhouseは、`dbt Core`に含まれるクロスデータベースマクロのほとんどをサポートしていますが、以下の例外があります:

- `split_part` SQL関数は、ClickHouseではsplitByChar関数を使用して実装されています。この関数は分割区切り文字に定数文字列を使用する必要があるため、このマクロで使用される `delimeter` パラメータは、カラム名ではなく文字列として解釈されます
- 同様に、ClickHouseの `replace` SQL関数は `old_chars` および `new_chars` パラメータに定数文字列を必要とするため、このマクロを呼び出す際、これらのパラメータはカラム名ではなく文字列として解釈されます。

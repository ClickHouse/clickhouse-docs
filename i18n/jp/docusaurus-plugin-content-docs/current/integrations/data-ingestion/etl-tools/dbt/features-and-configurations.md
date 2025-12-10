---
sidebar_label: '機能と構成'
slug: /integrations/dbt/features-and-configurations
sidebar_position: 2
description: 'ClickHouse で dbt を利用するための機能'
keywords: ['clickhouse', 'dbt', 'features']
title: '機能と構成'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 機能と設定 {#features-and-configurations}

<ClickHouseSupportedBadge/>

このセクションでは、dbt と ClickHouse の組み合わせで利用できる機能の一部について説明します。

<TOCInline toc={toc}  maxHeadingLevel={3} />

## Profile.yml の設定 {#profile-yml-configurations}

dbt から ClickHouse に接続するには、`profiles.yml` ファイルに[プロファイル](https://docs.getdbt.com/docs/core/connect-data-platform/connection-profiles)を追加する必要があります。ClickHouse のプロファイルは、次の構文に従います。

```yaml
your_profile_name:
  target: dev
  outputs:
    dev:
      type: clickhouse

      # Optional
      schema: [default] # dbtモデル用のClickHouseデータベース
      driver: [http] # httpまたはnative。未設定の場合、ポート設定に基づいて自動判定されます
      host: [localhost] 
      port: [8123]  # 未設定の場合、secureとdriverの設定に応じて8123、8443、9000、9440のいずれかがデフォルトになります
      user: [default] # すべてのデータベース操作に使用するユーザー
      password: [<empty string>] # ユーザーのパスワード
      cluster: [<empty string>] # 設定されている場合、特定のDDL/テーブル操作がこのクラスタを使用して`ON CLUSTER`句で実行されます。分散マテリアライゼーションにはこの設定が必要です。詳細については、以下のClickHouseクラスタセクションを参照してください。
      verify: [True] # TLS/SSL使用時にTLS証明書を検証します
      secure: [False] # TLS(ネイティブプロトコル)またはHTTPS(httpプロトコル)を使用します
      client_cert: [null] # .pem形式のTLSクライアント証明書へのパス
      client_cert_key: [null] # TLSクライアント証明書の秘密鍵へのパス
      retries: [1] # 「再試行可能な」データベース例外(503 'Service Unavailable'エラーなど)の再試行回数
      compression: [<empty string>] # 真値の場合はgzip圧縮を使用(http)、またはネイティブ接続の圧縮タイプを指定
      connect_timeout: [10] # ClickHouseへの接続確立のタイムアウト(秒)
      send_receive_timeout: [300] # ClickHouseサーバーからのデータ受信のタイムアウト(秒)
      cluster_mode: [False] # レプリケートされたデータベースでの動作を改善するための特定の設定を使用します(ClickHouse Cloudで推奨)
      use_lw_deletes: [False] # デフォルトのインクリメンタル戦略として`delete+insert`戦略を使用します。
      check_exchange: [True] # ClickHouseがアトミックなEXCHANGE TABLESコマンドをサポートしていることを検証します。(ほとんどのClickHouseバージョンでは不要)
      local_suffix: [_local] # 分散マテリアライゼーション用のシャード上のローカルテーブルのテーブルサフィックス。
      local_db_prefix: [<empty string>] # 分散マテリアライゼーション用のシャード上のローカルテーブルのデータベースプレフィックス。空の場合、分散テーブルと同じデータベースを使用します。
      allow_automatic_deduplication: [False] # レプリケートされたテーブルに対してClickHouseの自動重複排除を有効にします
      tcp_keepalive: [False] # ネイティブクライアントのみ、TCP keepalive設定を指定します。カスタムkeepalive設定を[idle_time_sec, interval_sec, probes]として指定します。
      custom_settings: [{}] # 接続用のカスタムClickHouse設定の辞書/マッピング - デフォルトは空です。
      database_engine: '' # 新しいClickHouseスキーマ(データベース)作成時に使用するデータベースエンジン。未設定の場合(デフォルト)、新しいデータベースはデフォルトのClickHouseデータベースエンジン(通常はAtomic)を使用します。
      threads: [1] # クエリ実行時に使用するスレッド数。1より大きい数値に設定する前に、[read-after-write consistency](#read-after-write-consistency)セクションを必ず読んでください。
      
      # ネイティブ(clickhouse-driver)接続設定
      sync_request_timeout: [5] # サーバーpingのタイムアウト
      compress_block_size: [1048576] # 圧縮有効時の圧縮ブロックサイズ
```


### スキーマとデータベースの違い {#schema-vs-database}

dbt モデルのリレーション識別子 `database.schema.table` は ClickHouse では互換性がありません。これは、ClickHouse が
`schema` をサポートしていないためです。
そのため、`schema.table` という簡略化したアプローチを使用します。この場合の `schema` は ClickHouse のデータベースを意味します。
`default` データベースの使用は推奨されません。

### SET ステートメントに関する警告 {#set-statement-warning}

多くの環境では、すべての dbt クエリに対して ClickHouse の設定を永続させる目的で SET ステートメントを使用する方法は信頼性が低く、
予期しない失敗を引き起こす可能性があります。これは特に、ロードバランサーを介して複数ノードにクエリを分散する HTTP 接続
（ClickHouse Cloud など）を使用している場合に当てはまりますが、状況によってはネイティブな ClickHouse 接続でも発生し得ます。
したがって、事前フックの &quot;SET&quot; ステートメントに依存するのではなく、ベストプラクティスとして、dbt プロファイルの
&quot;custom&#95;settings&quot; プロパティで必要な ClickHouse の設定を構成することを推奨します。

### `quote_columns` の設定 {#setting-quote_columns}

警告が出ないようにするため、`dbt_project.yml` 内で `quote_columns` に値を明示的に設定してください。詳細については、[quote&#95;columns に関するドキュメント](https://docs.getdbt.com/reference/resource-configs/quote_columns) を参照してください。

```yaml
seeds:
  +quote_columns: false  # CSV列ヘッダーにスペースが含まれている場合は `true` に設定
```


### ClickHouse クラスターについて {#about-the-clickhouse-cluster}

ClickHouse クラスターを使用する場合、次の 2 点を考慮する必要があります。

- `cluster` 設定を行うこと
- 特に複数の `threads` を使用している場合に、書き込み直後の読み取り一貫性を確保すること

#### クラスター設定 {#cluster-setting}

プロファイル内の `cluster` 設定により、dbt-clickhouse は ClickHouse クラスターを対象に実行されます。プロファイルで `cluster` が設定されている場合、**すべてのモデルはデフォルトで `ON CLUSTER` 句付きで作成されます**（**Replicated** エンジンを使用するものを除く）。これには以下が含まれます。

* データベースの作成
* ビューのマテリアライゼーション
* テーブルおよびインクリメンタルのマテリアライゼーション
* Distributed マテリアライゼーション

Replicated エンジンでは、レプリケーションを内部で管理するよう設計されているため、`ON CLUSTER` 句は**含まれません**。

特定のモデルでクラスターを用いた作成を**無効化**するには、そのモデルに `disable_on_cluster` 設定を追加します。

```sql
{{ config(
        engine='MergeTree',
        materialized='table',
        disable_on_cluster='true'
    )
}}

```

non-replicated エンジンを使用するテーブルおよびインクリメンタルのマテリアライゼーションは、`cluster` 設定の影響を受けません（モデルは接続先のノードのみに作成されます）。

**互換性**

モデルが `cluster` 設定なしで作成されている場合、dbt-clickhouse はその状況を検知し、そのモデルに対するすべての DDL/DML を `on cluster` 句なしで実行します。


#### 書き込み直後の読み取り一貫性 {#read-after-write-consistency}

dbt は read-after-insert 一貫性モデルに依存しています。これは、すべての操作が同じレプリカに送られることを保証できない場合、複数レプリカを持つ ClickHouse クラスターとは互換性がありません。日常的な dbt の利用においては問題が発生しないこともありますが、この保証を満たすために、クラスターの種類に応じた戦略がいくつかあります。

- ClickHouse Cloud クラスターを使用している場合は、プロファイルの `custom_settings` プロパティに `select_sequential_consistency: 1` を設定するだけで構いません。この設定の詳細は[こちら](/operations/settings/settings#select_sequential_consistency)で確認できます。
- 自前でホストしているクラスターを使用している場合は、すべての dbt リクエストが同じ ClickHouse レプリカに送信されるようにしてください。その上にロードバランサーがある場合は、常に同じレプリカに到達できるように、`replica aware routing` / `sticky sessions` メカニズムの利用を検討してください。ClickHouse Cloud 以外のクラスターで `select_sequential_consistency = 1` 設定を追加することは[推奨されません](/operations/settings/settings#select_sequential_consistency)。

## 機能に関する一般情報 {#general-information-about-features}

### テーブルの一般的な設定 {#general-table-configurations}

| Option             | Description                                                                                                                                                     | Default if any |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| engine             | テーブル作成時に使用するテーブルエンジン（テーブルの種類）                                                                                                                                   | `MergeTree()`  |
| order&#95;by       | 列名または任意の式のタプル。小さなスパースインデックスを作成し、データ検索を高速化するために使用されます。                                                                                                           | `tuple()`      |
| partition&#95;by   | パーティションは、指定した条件でテーブル内のレコードを論理的にまとめたものです。パーティションキーには、テーブル列を用いた任意の式を指定できます。                                                                                       |                |
| sharding&#95;key   | Sharding key は、Distributed エンジンテーブルへの挿入時に、宛先サーバーを決定します。Sharding key はランダム、またはハッシュ関数の出力とすることができます。                                                               | `rand()`)      |
| primary&#95;key    | order&#95;by と同様の ClickHouse の primary key 式です。指定しない場合、ClickHouse は order by 式を primary key として使用します。                                                           |                |
| unique&#95;key     | 行を一意に識別する列名のタプル。インクリメンタルモデルでの更新に使用されます。                                                                                                                         |                |
| settings           | このモデルで &#39;CREATE TABLE&#39; などの DDL 文に使用される、&quot;TABLE&quot; 設定のマップ／ディクショナリ                                                                                  |                |
| query&#95;settings | このモデルと組み合わせて `INSERT` または `DELETE` 文で使用する、ClickHouse ユーザーレベル設定のマップ／ディクショナリ                                                                                      |                |
| ttl                | テーブルで使用する TTL 式。TTL 式は、テーブルの TTL を指定するための文字列です。                                                                                                                 |                |
| indexes            | 作成する[データスキッピングインデックスの一覧](/optimize/skipping-indexes)。詳細は以下を参照してください。                                                                                            |                |
| sql&#95;security   | ビューの基礎となるクエリを実行する際に使用する ClickHouse ユーザーを指定できます。`SQL SECURITY` [には 2 つの有効な値](/sql-reference/statements/create/view#sql_security) があり、`definer` または `invoker` です。 |                |
| definer            | `sql_security` に `definer` を設定した場合、`definer` 句で既存のユーザーまたは `CURRENT_USER` を指定する必要があります。                                                                          |                |
| projections        | 作成する[プロジェクション](/data-modeling/projections)の一覧。[プロジェクションについて](#projections)を参照してください。                                                                            |                |

#### データスキッピングインデックスについて {#data-skipping-indexes}

データスキッピングインデックスは `table` マテリアライゼーションでのみ利用可能です。テーブルにデータスキッピングインデックスの一覧を追加するには、`indexes` 設定を使用します。

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

`projections` 設定を使用して、`table` および `distributed_table` マテリアライゼーションに [プロジェクション](/data-modeling/projections) を追加できます。

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

**注記**: 分散テーブルでは、プロジェクションが適用されるのは分散プロキシテーブルではなく `_local` テーブルです。


### サポートされているテーブルエンジン {#supported-table-engines}

| 種類                     | 詳細                                                                                                                                                                                     |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| MergeTree (デフォルト)    | [https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/)                   |
| HDFS                   | [https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs](https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs)                                       |
| MaterializedPostgreSQL | [https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql](https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql) |
| S3                     | [https://clickhouse.com/docs/en/engines/table-engines/integrations/s3](https://clickhouse.com/docs/en/engines/table-engines/integrations/s3)                                           |
| EmbeddedRocksDB        | [https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb](https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb)               |
| Hive                   | [https://clickhouse.com/docs/en/engines/table-engines/integrations/hive](https://clickhouse.com/docs/en/engines/table-engines/integrations/hive)                                       |

### 実験的にサポートされているテーブルエンジン {#experimental-supported-table-engines}

| Type              | Details                                                                                                                                               |
|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| Distributed Table | [https://clickhouse.com/docs/en/engines/table-engines/special/distributed](https://clickhouse.com/docs/en/engines/table-engines/special/distributed). |
| Dictionary        | [https://clickhouse.com/docs/en/engines/table-engines/special/dictionary](https://clickhouse.com/docs/en/engines/table-engines/special/dictionary)    |

上記のいずれかのエンジンを使った dbt から ClickHouse への接続で問題が発生した場合は、
[こちら](https://github.com/ClickHouse/dbt-clickhouse/issues) から issue を報告してください。

### モデル設定についての注意事項 {#a-note-on-model-settings}

ClickHouse には複数の種類やレベルの「settings（設定）」があります。上記のモデル設定では、そのうち 2 種類を
設定できます。`settings` は、`CREATE TABLE/VIEW` タイプの DDL 文で使用される `SETTINGS`
句を意味し、一般的に特定の ClickHouse テーブルエンジンに固有の設定です。新しい
`query_settings` は、モデルのマテリアライゼーションに使用される `INSERT` および `DELETE` クエリ（インクリメンタルマテリアライゼーションを含む）に `SETTINGS` 句を追加するために使用されます。
ClickHouse の設定は数百個あり、「テーブル」設定と「ユーザー」設定のどちらに属するのか
必ずしも明確でないものもあります（ただし後者は一般的に `system.settings` テーブルで確認できます）。
一般的にはデフォルト値の使用が推奨され、これらのプロパティを利用する場合は、事前に十分な調査とテストを行ってください。

### カラム設定 {#column-configuration}

> ***NOTE:*** 以下のカラム設定オプションを利用するには、[model contracts](https://docs.getdbt.com/docs/collaborate/govern/model-contracts) が適用・強制されている必要があります。

| Option | Description                                                                                                                                                                  | Default if any |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| codec  | カラムの DDL 内で `CODEC()` に渡される引数からなる文字列。例: `codec: "Delta, ZSTD"` は `CODEC(Delta, ZSTD)` としてコンパイルされます。                                                                             |                |
| ttl    | カラムの DDL 内で TTL ルールを定義する [TTL（time-to-live）式](https://clickhouse.com/docs/guides/developer/ttl) を指定する文字列。例: `ttl: ts + INTERVAL 1 DAY` は `TTL ts + INTERVAL 1 DAY` としてコンパイルされます。 |                |

#### スキーマ設定の例 {#example-of-schema-configuration}

```yaml
models:
  - name: table_column_configs
    description: '列レベル設定のテスト'
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

dbt は、モデルの定義に用いられた SQL を解析して、各カラムのデータ型を自動的に判定します。ただし、場合によってはこの処理では正確にデータ型を判定できず、コントラクトの `data_type` プロパティで指定された型と矛盾が生じることがあります。これに対処するため、モデルの SQL 内で `CAST()` 関数を使用して、意図した型を明示的に指定することを推奨します。例えば、次のようになります。

```sql
{{
    config(
        materialized="materialized_view",
        engine="AggregatingMergeTree",
        order_by=["event_type"],
    )
}}

select
  -- event_type は String として推論されますが、LowCardinality(String) の使用を推奨します:
  CAST(event_type, 'LowCardinality(String)') as event_type,
  -- countState() は `AggregateFunction(count)` として推論されますが、引数の型を変更することを推奨します:
  CAST(countState(), 'AggregateFunction(count, UInt32)') as response_count, 
  -- maxSimpleState() は `SimpleAggregateFunction(max, String)` として推論されますが、引数の型も変更することを推奨します:
  CAST(maxSimpleState(event_type), 'SimpleAggregateFunction(max, LowCardinality(String))') as max_event_type
from {{ ref('user_events') }}
group by event_type
```


## 機能 {#features}

### マテリアライゼーション: view {#materialization-view}

dbt モデルは [ClickHouse view](/sql-reference/table-functions/view/)
として作成し、次の構文で設定できます。

プロジェクトファイル (`dbt_project.yml`):

```yaml
models:
  <resource-path>:
    +materialized: view
```

または `models/<model_name>.sql` の config ブロック:

```python
{{ config(materialized = "view") }}
```


### マテリアライゼーション: テーブル {#materialization-table}

dbt モデルは [ClickHouse のテーブル](/operations/system-tables/tables/) として作成し、
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

または、`models/&lt;model_name&gt;.sql` 内の設定ブロック：

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

テーブルモデルは、dbt が実行されるたびに再構築されます。これは、結果セットが大きい場合や変換処理が複雑な場合には、現実的でなかったり非常に高コストになることがあります。この課題に対処し、ビルド時間を短縮するために、dbt モデルをインクリメンタルな ClickHouse テーブルとして作成し、次の構文を用いて設定できます。

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

または、次の設定ブロック（`models/<model_name>.sql`）：

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

このマテリアライゼーションタイプに特有の設定は以下のとおりです。

| Option                   | Description                                                                                                                                                                                           | Required?                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `unique_key`             | 行を一意に識別するカラム名のタプル。ユニーク制約の詳細については[こちら](https://docs.getdbt.com/docs/build/incremental-models#defining-a-unique-key-optional)を参照してください。                                                                 | 必須。指定しない場合、変更された行がインクリメンタルテーブルに二重に追加されます。 |
| `inserts_only`           | 同じ動作を行うインクリメンタル `strategy` である `append` の利用が推奨されるようになり、非推奨となりました。インクリメンタルモデルに対して `True` を設定すると、中間テーブルを作成せずにインクリメンタル更新が直接ターゲットテーブルに挿入されます。`inserts_only` が設定されている場合、`incremental_strategy` は無視されます。    | 任意 (デフォルト: `False`)                       |
| `incremental_strategy`   | インクリメンタルマテリアライゼーションに使用する戦略。`delete+insert`、`append`、`insert_overwrite`、`microbatch` がサポートされています。戦略の詳細については[こちら](/integrations/dbt/features-and-configurations#incremental-model-strategies)を参照してください。 | 任意 (デフォルト: &#39;default&#39;)             |
| `incremental_predicates` | インクリメンタルマテリアライゼーションに適用される追加条件（`delete+insert` 戦略にのみ適用されます）                                                                                                                                            | 任意                                        |                      

#### インクリメンタルモデルの戦略 {#incremental-model-strategies}

`dbt-clickhouse` は 3 種類のインクリメンタルモデルの戦略をサポートしています。

##### デフォルト（レガシー）戦略 {#default-legacy-strategy}

これまで ClickHouse は、非同期の「mutations」という形式による、限定的な更新および削除のサポートしかありませんでした。
期待される dbt の挙動をエミュレートするために、
dbt-clickhouse はデフォルトで、影響を受けていない（削除されていない、変更されていない）「古い」
レコードすべてと、新規または更新されたレコードを含む新しい一時テーブルを作成し、
その後、この一時テーブルを既存のインクリメンタルモデルのリレーションとスワップ（入れ替え）します。これは、
処理が完了する前に問題が発生した場合でも元のリレーションを保持する唯一の戦略ですが、
元のテーブルの完全なコピーを伴うため、非常にコストが高く、実行が遅くなる可能性があります。

##### Delete+Insert 戦略 {#delete-insert-strategy}

ClickHouse はバージョン 22.8 で実験的機能として「lightweight deletes」を追加しました。Lightweight deletes は
ALTER TABLE ... DELETE
操作よりも大幅に高速であり、ClickHouse のデータパーツを書き換える必要がありません。インクリメンタル戦略 `delete+insert`
は、lightweight deletes を活用して、
「legacy」戦略よりもかなり高いパフォーマンスを発揮するインクリメンタルマテリアライゼーションを実装します。ただし、この戦略を
使用する際には重要な注意点があります。

- Lightweight deletes は、ClickHouse サーバー側で
  `allow_experimental_lightweight_delete=1` を設定して有効化するか、
  プロファイルで `use_lw_deletes=true` を設定する必要があります（これにより dbt セッションで該当設定が有効になります）
- Lightweight deletes は現在プロダクション利用が可能な状態ですが、ClickHouse バージョン 23.3 より前では、
  パフォーマンスやその他の問題が発生する可能性があります。
- この戦略は、（中間テーブルや一時テーブルを作成せずに）影響を受けるテーブル／リレーションを直接操作するため、
  処理中に問題が発生した場合、
  インクリメンタルモデル内のデータが不正な状態になる可能性があります
- Lightweight deletes を使用する場合、dbt-clickhouse は設定 `allow_nondeterministic_mutations` を有効にします。ごく
  まれなケースとして、非決定的な incremental_predicates を使用すると、
  更新／削除されるアイテムに対して競合状態が発生する可能性があります（および ClickHouse ログ内に関連するログメッセージが出力されます）。
  一貫した結果を確保するためには、
  インクリメンタル述語は、インクリメンタルマテリアライゼーション中に変更されないデータに対するサブクエリのみを含むようにする必要があります。

##### Microbatch 戦略（dbt-core >= 1.9 が必要） {#microbatch-strategy}

インクリメンタル戦略 `microbatch` は、バージョン 1.9 から dbt-core の機能として提供されており、大規模な
時系列データ変換を効率的に処理するために設計されています。dbt-clickhouse では、既存の `delete_insert`
インクリメンタル戦略の上に構築されており、`event_time` および
`batch_size` モデル設定に基づいて、増分部分を事前定義された時系列バッチに分割します。

大規模な変換を扱うことに加えて、microbatch は次の機能を提供します。
- [失敗したバッチの再処理](https://docs.getdbt.com/docs/build/incremental-microbatch#retry) が可能。
- [並列バッチ実行](https://docs.getdbt.com/docs/build/parallel-batch-execution) を自動検出。
- [バックフィル](https://docs.getdbt.com/docs/build/incremental-microbatch#backfills) における複雑な条件分岐ロジックの排除。

microbatch の詳細な使用方法については、[公式ドキュメント](https://docs.getdbt.com/docs/build/incremental-microbatch) を参照してください。

###### 利用可能な Microbatch 設定 {#available-microbatch-configurations}

| Option             | Description                                                                                                                                                                                                                                                                                                                                | Default if any |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| event_time         | 「その行がいつ発生したか」を示す列。microbatch モデルおよびフィルタリング対象となるすべての直接の親モデルに対して必須です。                                                                                                                                                                                                              |                |
| begin              | microbatch モデルにおける「時間の始まり」です。これは、初回または full-refresh ビルドの開始ポイントになります。たとえば、日次粒度の microbatch モデルを 2024-10-01 に実行し、begin = '2023-10-01' とした場合、366 個のバッチ（うるう年のため）と「本日」のバッチが処理されます。                                                   |                |
| batch_size         | バッチの粒度です。サポートされる値は `hour`、`day`、`month`、`year` です。                                                                                                                                                                                                                                                                 |                |
| lookback           | 最新のブックマークより前の X 個のバッチを処理し、遅延到着レコードを取り込みます。                                                                                                                                                                                                                                                            | 1              |
| concurrent_batches | バッチを同時に（同時刻に）実行するかどうかについて、dbt の自動検出を上書きします。[並列バッチの設定](https://docs.getdbt.com/docs/build/incremental-microbatch#configure-concurrent_batches) の詳細を参照してください。true に設定するとバッチが並列（同時）に実行されます。false はバッチを順次（1 つずつ）実行します。                     |                |

##### Append 戦略 {#append-strategy}

この戦略は、以前のバージョンの dbt-clickhouse における `inserts_only` 設定を置き換えるものです。このアプローチでは、
新しい行を既存のリレーションに単純に追加（append）します。
その結果、重複行は排除されず、一時テーブルや中間テーブルも使用されません。データ内の重複が許容される場合、またはインクリメンタルクエリの
WHERE 句／フィルタで除外される場合には、最も高速なアプローチです。

##### insert_overwrite 戦略 (Experimental) {#insert-overwrite-strategy}

> [IMPORTANT]  
> 現在、insert_overwrite 戦略は分散マテリアライゼーションでは完全には機能しません。

次の手順を実行します:

1. インクリメンタルモデルのリレーションと同じ構造を持つステージング（一時）テーブルを作成します:
   `CREATE TABLE <staging> AS <target>`。
2. `SELECT` によって生成された新規レコードのみをステージングテーブルに挿入します。
3. ステージングテーブルに存在する新しいパーティションのみをターゲットテーブルに置き換えます。

このアプローチには次の利点があります:

- テーブル全体をコピーしないため、デフォルトの戦略より高速です。
- INSERT 操作が正常に完了するまで元のテーブルを変更しないため、他の戦略より安全です。
  中間で失敗した場合でも、元のテーブルは変更されません。
- 「パーティション不変性」というデータエンジニアリングのベストプラクティスを実装しています。これにより、インクリメンタル処理や並列処理、ロールバックなどが簡素化されます。

この戦略では、モデル設定で `partition_by` を指定している必要があります。モデル設定におけるその他の戦略固有の
パラメータはすべて無視されます。

### Materialization: materialized&#95;view (Experimental) {#materialized-view}

`materialized_view` マテリアライゼーションは、既存の（ソース）テーブルを対象とした `SELECT` 文である必要があります。アダプターはモデル名を用いた
ターゲットテーブルと、`<model_name>_mv` という名前の ClickHouse MATERIALIZED VIEW を作成します。PostgreSQL と異なり、ClickHouse のマテリアライズドビューは
「静的」ではなく（対応する REFRESH 操作もありません）。代わりに「insert trigger」として機能し、
ソーステーブルに行が挿入された際に、ビュー定義で指定された `SELECT` の
「変換」を使用して新しい行をターゲットテーブルに挿入します。機能の入門的な例については [test file](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py)
を参照してください。

ClickHouse では、複数のマテリアライズドビューから同じターゲットテーブルにレコードを書き込むことができます。
dbt-clickhouse でこれをサポートするために、モデルファイル内で `UNION` を構成し、それぞれのマテリアライズドビューの SQL を
`--my_mv_name:begin` および `--my_mv_name:end` という形式のコメントで囲むことができます。

例えば、次の例では、モデルの同じ宛先テーブルにデータを書き込む 2 つのマテリアライズドビューが作成されます。
マテリアライズドビューの名前は `<model_name>_mv1` および `<model_name>_mv2` という形式になります:

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
> 複数のマテリアライズドビュー (MV) を持つモデルを更新する際、特に MV の名前の一つを変更した場合でも、
> dbt-clickhouse は古い MV を自動的には削除しません。その代わりに、
> 次の警告が表示されます:
> `Warning - Table <previous table name> was detected with the same pattern as model name <your model name> but was not found in this run. In case it is a renamed mv that was previously part of this model, drop it manually (!!!) `


#### データのキャッチアップ {#data-catch-up}

現在、マテリアライズドビュー (MV) を作成する場合、MV 自体が作成される前に、ターゲットテーブルはまず履歴データで埋められます。

言い換えると、dbt-clickhouse は最初にターゲットテーブルを作成し、MV 用に定義されたクエリに基づいて履歴データをプリロードします。このステップの後になって初めて MV が作成されます。

MV の作成時に履歴データをプリロードしたくない場合は、`catch-up` 設定を `False` にすることで、この動作を無効にできます:

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    catchup=False
)}}
```


#### リフレッシュ可能なマテリアライズドビュー {#refreshable-materialized-views}

[Refreshable Materialized View](/materialized-view/refreshable-materialized-view) を使用するには、
MV モデル内で必要に応じて次の設定を調整してください（これらの設定はすべて `refreshable` 設定オブジェクト内で指定する必要があります）。

| Option                        | Description                                                                               | Required | Default Value |
| ----------------------------- | ----------------------------------------------------------------------------------------- | -------- | ------------- |
| refresh&#95;interval          | 必須となる interval 句です                                                                        | Yes      |               |
| randomize                     | `RANDOMIZE FOR` の後に現れる randomization 句です                                                  |          |               |
| append                        | `True` に設定すると、各リフレッシュ時に既存行を削除せずにテーブルへ行を挿入します。通常の `INSERT SELECT` と同様に、この挿入はアトミックではありません。  |          | False         |
| depends&#95;on                | リフレッシュ可能なマテリアライズドビューの依存関係リストです。依存関係は `{schema}.{view_name}` の形式で指定してください                  |          |               |
| depends&#95;on&#95;validation | `depends_on` で指定された依存関係の存在を検証するかどうかを指定します。依存関係にスキーマが含まれていない場合、検証はスキーマ `default` に対して行われます |          | False         |

リフレッシュ可能なマテリアライズドビューの設定例:

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

* 依存関係を持つリフレッシュ可能なマテリアライズドビュー (MV) を ClickHouse で作成する際、指定した依存関係が作成時点で存在しなくても、ClickHouse はエラーをスローしません。代わりに、そのリフレッシュ可能な MV は非アクティブ状態のままとなり、依存関係が満たされるまで更新処理やリフレッシュを開始しません。この挙動は設計によるものですが、必要な依存関係への対応が遅れた場合、データの利用可能性に遅延が生じる可能性があります。ユーザーは、リフレッシュ可能なマテリアライズドビューを作成する前に、すべての依存関係が正しく定義され、実在していることを確認するよう推奨されます。
* 現時点では、MV とその依存関係の間に実際の「dbt linkage」は存在しないため、作成順序は保証されません。
* リフレッシュ可能機能は、同一のターゲットモデルを指す複数の MV に対してはテストされていません。

### マテリアライゼーション: dictionary（実験的） {#materialization-dictionary}

ClickHouse の dictionary 用マテリアライゼーションの実装例については、
[https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py)
のテストを参照してください。

### マテリアライゼーション: distributed_table（実験的） {#materialization-distributed-table}

分散テーブルは次の手順で作成されます:

1. 適切な構造を取得するための SQL クエリで一時ビューを作成する
2. ビューに基づいて空のローカルテーブルを作成する
3. ローカルテーブルに基づいて分散テーブルを作成する
4. データを分散テーブルに挿入し、その結果として、データが重複することなくシャード間に分散される

注意事項:

* 下流のインクリメンタルマテリアライゼーション処理が正しく実行されるようにするため、dbt-clickhouse のクエリには自動的に `insert_distributed_sync = 1` 設定が含まれるようになりました。これにより、一部の分散テーブルへの INSERT が想定より遅くなる可能性があります。

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


### materialization: distributed_incremental (experimental) {#materialization-distributed-incremental}

分散テーブルと同様の考え方に基づくインクリメンタルモデルであり、主な難しさはすべてのインクリメンタル戦略を正しく処理することにあります。

1. *Append Strategy* は、分散テーブルにデータを挿入するだけです。
2. *Delete+Insert Strategy* は、各シャード上のすべてのデータを扱うために分散一時テーブルを作成します。
3. *Default (Legacy) Strategy* は、同じ理由で分散一時テーブルおよび中間テーブルを作成します。

分散テーブルはデータを保持しないため、置き換えられるのはシャードテーブルのみです。
分散テーブルが再読み込みされるのは、`full_refresh` モードが有効になっている場合か、テーブル構造が変更された可能性がある場合のみです。

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

dbt のスナップショット機能を使用すると、可変なモデルに対する変更を時間の経過とともに記録できます。これにより、アナリストはモデルに対して、モデルの以前の状態を「過去にさかのぼって」確認できる時点指定クエリを実行できます。この機能は ClickHouse コネクタでサポートされており、次の構文で設定します。

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

厳密なカラム型コントラクトのみがサポートされます。たとえば、UInt32 カラム型のコントラクトがある場合、モデルが
UInt64 もしくはその他の整数型を返すと失敗します。
ClickHouse は、テーブル／モデル全体に対する `CHECK` 制約*のみ*をサポートします。プライマリキー、外部キー、一意制約、
およびカラムレベルの CHECK 制約はサポートされません。
（プライマリキー／ORDER BY キーについては ClickHouse のドキュメントを参照してください。）

### 追加の ClickHouse マクロ {#additional-clickhouse-macros}

#### モデルのマテリアライゼーション用ユーティリティマクロ {#model-materialization-utility-macros}

ClickHouse 固有のテーブルおよびビューを作成しやすくするために、次のマクロが含まれています。

- `engine_clause` -- `engine` モデル設定プロパティを使用して、ClickHouse のテーブルエンジンを割り当てます。dbt-clickhouse は
  デフォルトで `MergeTree` エンジンを使用します。
- `partition_cols` -- `partition_by` モデル設定プロパティを使用して、ClickHouse のパーティションキーを割り当てます。
  デフォルトではパーティションキーは割り当てられません。
- `order_cols` -- `order_by` モデル設定プロパティを使用して、ClickHouse の ORDER BY／ソートキーを割り当てます。指定されていない
  場合、ClickHouse は空の tuple() を使用し、テーブルはソートされません。
- `primary_key_clause` -- `primary_key` モデル設定プロパティを使用して、ClickHouse のプライマリキーを割り当てます。
  デフォルトではプライマリキーが設定され、ClickHouse は ORDER BY 句をプライマリキーとして使用します。
- `on_cluster_clause` -- `cluster` プロファイルプロパティを使用して、特定の dbt の操作（分散マテリアライゼーション、
  ビュー作成、データベース作成）に `ON CLUSTER` 句を追加します。
- `ttl_config` -- `ttl` モデル設定プロパティを使用して、ClickHouse のテーブル TTL 式を割り当てます。デフォルトでは
  TTL は割り当てられません。

#### s3Source Helper Macro {#s3source-helper-macro}

`s3source` マクロは、ClickHouse の S3 テーブル関数を使用して S3 から直接 ClickHouse のデータを取得する手順を簡素化します。これは、名前付き設定ディクショナリ（ディクショナリ名は必ず `s3` で終わる必要があります）から S3 テーブル関数のパラメータを設定することで動作します。マクロはまずプロファイルの `vars` 内でディクショナリを探し、その後にモデル設定内を検索します。ディクショナリには、S3 テーブル関数のパラメータを設定するために使用される、以下のいずれかのキーを含めることができます。

| Argument Name         | Description                                                                                                                                                                                  |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| bucket                | バケットのベース URL。例: `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi`。プロトコルが指定されていない場合は `https://` が前提となります。                                         |
| path                  | テーブルクエリで使用する S3 パス。例: `/trips_4.gz`。S3 のワイルドカードがサポートされています。                                                                                                  |
| fmt                   | 参照される S3 オブジェクトに対して期待される ClickHouse の入力フォーマット（`TSV` や `CSVWithNames` など）。                                                                                      |
| structure             | バケット内データのカラム構造。`['id UInt32', 'date DateTime', 'value String']` のような name/datatype ペアのリストで指定します。指定しない場合、ClickHouse が構造を推論します。 |
| aws_access_key_id     | S3 のアクセスキー ID。                                                                                                                                                                       |
| aws_secret_access_key | S3 のシークレットキー。                                                                                                                                                                      |
| role_arn              | S3 オブジェクトへ安全にアクセスするために使用する ClickhouseAccess IAM ロールの ARN。詳細は、この[ドキュメント](/cloud/data-sources/secure-s3)を参照してください。     |
| compression           | S3 オブジェクトで使用されている圧縮方式。指定しない場合、ClickHouse はファイル名に基づいて圧縮方式の判定を試みます。                                                                          |

このマクロの使用方法の例については、
[S3 test file](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/clickhouse/test_clickhouse_s3.py)
を参照してください。

#### Cross database macro support {#cross-database-macro-support}

dbt-clickhouse は、`dbt Core` に現在含まれているクロスデータベースマクロのほとんどをサポートしていますが、以下は例外です。

* `split_part` SQL 関数は、ClickHouse では `splitByChar` 関数を使って実装されています。この関数では「分割」デリミタに定数文字列を使用する必要があるため、このマクロで使用される `delimeter` パラメータはカラム名ではなく文字列として解釈されます。
* 同様に、ClickHouse の `replace` SQL 関数は `old_chars` と `new_chars` パラメータに定数文字列を指定する必要があるため、このマクロを呼び出す際にはそれらのパラメータはカラム名ではなく文字列として解釈されます。

## カタログ対応 {#catalog-support}

### dbt カタログ統合の状況 {#dbt-catalog-integration-status}

dbt Core v1.10 ではカタログ統合サポートが導入されました。これにより、アダプターは Apache Iceberg のようなオープンなテーブル形式を管理する外部カタログにモデルをマテリアライズできるようになります。**この機能は、まだ dbt-clickhouse にはネイティブサポートとして実装されていません。** この機能の実装状況は、[GitHub issue #489](https://github.com/ClickHouse/dbt-clickhouse/issues/489) で追跡できます。

### ClickHouse カタログのサポート {#clickhouse-catalog-support}

ClickHouse は最近、Apache Iceberg テーブルおよびデータカタログのネイティブサポートを追加しました。機能の多くはまだ `experimental` ですが、最新の ClickHouse バージョンを使用していればすでに利用可能です。

* ClickHouse では、[Iceberg table engine](/engines/table-engines/integrations/iceberg) および [iceberg table function](/sql-reference/table-functions/iceberg) を使用して、オブジェクトストレージ（S3、Azure Blob Storage、Google Cloud Storage）に保存された **Iceberg テーブルに対してクエリを実行** できます。

* さらに ClickHouse は、AWS Glue Catalog、Databricks Unity Catalog、Hive Metastore、REST Catalogs などを含む **外部データカタログへの接続** を可能にする [DataLakeCatalog database engine](/engines/database-engines/datalakecatalog) を提供します。これにより、データを複製することなく、外部カタログからオープンテーブル形式のデータ（Iceberg、Delta Lake）に直接クエリを実行できます。

### Iceberg とカタログを扱う際のワークアラウンド {#workarounds-iceberg-catalogs}

上記のツールを使用して ClickHouse クラスター内に Iceberg テーブルやカタログをすでに定義している場合、dbt プロジェクトからそれらの Iceberg テーブルやカタログのデータを読み取ることができます。dbt の `source` 機能を利用することで、これらのテーブルを dbt プロジェクト内で参照できます。たとえば、REST Catalog 内のテーブルにアクセスしたい場合は、次のようにします。

1. **外部カタログを参照するデータベースを作成します。**

```sql
-- REST カタログの例
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE iceberg_catalog
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS 
    catalog_type = 'rest', 
    storage_endpoint = 'http://minio:9000/lakehouse', 
    warehouse = 'demo'
```

2. **dbt 内でカタログ用データベースとそのテーブルをソースとして定義します:** テーブルはあらかじめ ClickHouse 上に存在している必要があります

```yaml
version: 2

sources:
  - name: external_catalog
    database: iceberg_catalog
    tables:
      - name: orders
      - name: customers
```

3. **dbt モデルでカタログテーブルを利用する。**

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

これらの回避策には、次のような利点があります。

* ネイティブな dbt カタログ連携を待たずに、さまざまな外部テーブルタイプや外部カタログにすぐにアクセスできます。
* ネイティブなカタログサポートが利用可能になった際に、スムーズに移行するためのパスが確保されます。

ただし、現時点ではいくつかの制限があります。

* **手動でのセットアップ:** Iceberg テーブルおよびカタログデータベースは、dbt から参照する前に ClickHouse 上で手動作成する必要があります。
* **カタログレベルの DDL なし:** dbt は、外部カタログ内で Iceberg テーブルを作成・削除するといったカタログレベルの操作を管理できません。そのため、現時点では dbt コネクタからそれらを作成することはできません。Iceberg() エンジンを使用したテーブル作成は、将来的に追加される可能性があります。
* **書き込み操作:** 現在、Iceberg / Data Catalog テーブルへの書き込みには制限があります。利用可能なオプションについては ClickHouse のドキュメントを確認してください。
---
sidebar_label: 'マテリアライゼーション'
slug: /integrations/dbt/materializations
sidebar_position: 3
description: '利用可能なマテリアライゼーションとその構成方法'
keywords: ['clickhouse', 'dbt', 'materializations', 'materialized view', 'incremental']
title: 'マテリアライゼーション'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# マテリアライゼーション \{#materializations\}

<ClickHouseSupportedBadge/>

このセクションでは、dbt-clickhouse で利用可能なすべてのマテリアライゼーション（実験的な機能を含む）について説明します。

<TOCInline toc={toc}  maxHeadingLevel={3} />

## 一般的なマテリアライゼーション設定 \{#general-materialization-configurations\}

次の表は、利用可能なマテリアライゼーションの一部で共通して使用される設定を示しています。一般的な dbt モデル設定の詳細については、[dbt ドキュメント](https://docs.getdbt.com/category/general-configs)を参照してください。

| Option         | Description                                                                                                                                                                      | Default if any          |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| engine         | テーブルを作成する際に使用するテーブルエンジン（テーブルの種類）                                                                                                                                  | `MergeTree()`           |
| order_by       | カラム名または任意の式からなるタプル。これにより、データ検索を高速化するための小さなスパース索引を作成できます。                                                                                             | `tuple()`               |
| partition_by   | パーティションとは、指定された条件でテーブル内のレコードを論理的にまとめたものです。パーティションキーには、テーブルのカラムを使った任意の式を指定できます。                                                     |                         |
| primary_key    | order_by と同様の、ClickHouse の primary key 式。指定されていない場合、ClickHouse は primary key として order_by の式を使用します。                                                          |                         |
| settings       | このモデルで `CREATE TABLE` などの DDL 文に使用される "TABLE" 設定の map/dictionary                                                                                              |                         |
| query_settings | このモデルと組み合わせて `INSERT` や `DELETE` 文で使用される、ClickHouse のユーザーレベル設定の map/dictionary                                                                          |                         |
| ttl            | テーブルに対して使用される有効期限 (TTL) の式。有効期限 (TTL) の式は、テーブルの有効期限 (TTL) を指定する文字列です。                                                                        |                         |
| sql_security   | ビューの基礎となるクエリを実行する際に使用する ClickHouse ユーザー。[使用可能な値](/sql-reference/statements/create/view#sql_security): `definer`, `invoker`。                   |                         |
| definer        | `sql_security` が `definer` に設定されている場合、`definer` 句で既存のユーザーまたは `CURRENT_USER` のいずれかを指定する必要があります。                                                       |                         |

### サポートされているテーブルエンジン \{#supported-table-engines\}

| 種類                  | 詳細                                                                                        |
|------------------------|-------------------------------------------------------------------------------------------|
| MergeTree (default)    | https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/.         |
| HDFS                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs                    |
| MaterializedPostgreSQL | https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql |
| S3                     | https://clickhouse.com/docs/en/engines/table-engines/integrations/s3                      |
| EmbeddedRocksDB        | https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb        |
| Hive                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hive                    |

**注意**: materialized view では、すべての *MergeTree エンジンがサポートされています。

#### 実験的にサポートされているテーブルエンジン \{#experimental-supported-table-engines\}

| 種類             | 詳細                                                                      |
|------------------|---------------------------------------------------------------------------|
| 分散テーブル     | https://clickhouse.com/docs/en/engines/table-engines/special/distributed. |
| Dictionary        | https://clickhouse.com/docs/en/engines/table-engines/special/dictionary   |

上記のいずれかのエンジンを使用して dbt から ClickHouse に接続する際に問題が発生した場合は、[こちら](https://github.com/ClickHouse/dbt-clickhouse/issues)から issue を登録してください。

### モデル設定に関する注意事項 \{#a-note-on-model-settings\}

ClickHouse には複数の種類・レベルの「settings」が存在します。上記のモデル設定では、そのうち 2 種類が
設定可能です。`settings` は、`CREATE TABLE/VIEW` タイプの DDL 文で使用される `SETTINGS`
句を指し、一般的に特定の ClickHouse テーブルエンジンに固有の設定です。新しい
`query_settings` は、モデルのマテリアライゼーション（インクリメンタルマテリアライゼーションを含む）に使用される `INSERT` および `DELETE` クエリに `SETTINGS` 句を追加するためのものです。
ClickHouse の設定は数百種類あり、どれが「テーブル」の設定で、どれが「ユーザー」
設定なのかが常に明確とは限りません（ただし後者は一般的に `system.settings` テーブルで
確認できます）。一般的にはデフォルト値の使用が推奨され、これらの設定を利用する場合は、
慎重に調査とテストを行う必要があります。

### カラム設定 \{#column-configuration\}

> **_NOTE:_** 以下のカラム設定オプションを使用するには、[model contracts](https://docs.getdbt.com/docs/collaborate/govern/model-contracts) を適用している必要があります。

| Option | Description                                                                                                                                                | Default if any |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| codec  | カラムの DDL 内で `CODEC()` に渡される引数からなる文字列。例: `codec: "Delta, ZSTD"` は `CODEC(Delta, ZSTD)` としてコンパイルされます。    |    
| ttl    | カラムの DDL 内で有効期限 (TTL) のルールを定義する [TTL (time-to-live) 式](https://clickhouse.com/docs/guides/developer/ttl) からなる文字列。例: `ttl: ts + INTERVAL 1 DAY` は `TTL ts + INTERVAL 1 DAY` としてコンパイルされます。 |

#### スキーマ構成の例 \{#example-of-schema-configuration\}

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


#### 複合データ型の追加 \{#adding-complex-types\}

dbt は、モデルを作成するために使用される SQL を解析して、各カラムのデータ型を自動的に判別します。しかし、一部のケースではこの処理によってデータ型が正確に判別されず、コントラクトの `data_type` プロパティで指定された型と不整合が生じる場合があります。これに対処するため、モデルの SQL 内で `CAST()` 関数を使用して、目的の型を明示的に定義することを推奨します。例えば次のようにします。

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


## マテリアライゼーション: ビュー \{#materialization-view\}

dbt モデルは [ClickHouse view](/sql-reference/table-functions/view/)
として作成でき、次の構文で構成します。

プロジェクトファイル (`dbt_project.yml`):

```yaml
models:
  <resource-path>:
    +materialized: view
```

または config ブロック（`models/<model_name>.sql`）：

```python
{{ config(materialized = "view") }}
```


## マテリアライゼーション: table \{#materialization-table\}

dbt モデルは [ClickHouse テーブル](/operations/system-tables/tables/) として作成でき、
次の構文で設定します。

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


### データスキッピングインデックス \{#data-skipping-indexes\}

`indexes` 構成を使用して、`table` マテリアライゼーションに [データスキッピングインデックス](/optimize/skipping-indexes) を追加できます。

```sql
{{ config(
        materialized='table',
        indexes=[{
          'name': 'your_index_name',
          'definition': 'your_column TYPE minmax GRANULARITY 2'
        }]
) }}
```


### プロジェクション \{#projections\}

`table` および `distributed_table` マテリアライゼーションには、`projections` 構成を使用して [プロジェクション](/data-modeling/projections) を追加できます。

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

**注意**: 分散テーブルの場合、PROJECTION は分散プロキシテーブルではなく `_local` テーブルに適用されます。


## マテリアライゼーション: incremental \{#materialization-incremental\}

テーブルモデルは、dbt の各実行ごとに再構築されます。これは、結果セットが大きい場合や変換が複雑な場合には、現実的ではないか、非常に高コストになる可能性があります。この課題に対処しビルド時間を短縮するために、dbt モデルをインクリメンタルな ClickHouse テーブルとして作成し、次の構文で設定できます。

`dbt_project.yml` でのモデル定義:

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

または `models/<model_name>.sql` の config ブロックで:

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


### Configurations \{#incremental-configurations\}

このマテリアライゼーションタイプに固有の設定は以下のとおりです。

| Option                   | Description                                                                                                                                                                                                                                                       | Required?                                                                            |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| `unique_key`             | 行を一意に識別するカラム名のタプルです。一意性制約の詳細については[こちら](https://docs.getdbt.com/docs/build/incremental-models#defining-a-unique-key-optional)を参照してください。                                                                                       | 必須。指定しない場合、変更された行がインクリメンタルテーブルに二重に追加されます。 |
| `inserts_only`           | 同じ動作をするインクリメンタル `strategy` である `append` が推奨されるようになったため、非推奨になりました。インクリメンタルモデルで True に設定すると、中間テーブルを作成せずに、インクリメンタルな更新が直接ターゲットテーブルに挿入されます。`inserts_only` が設定されている場合、`incremental_strategy` は無視されます。 | 任意（デフォルト: `False`）                                                          |
| `incremental_strategy`   | インクリメンタルマテリアライゼーションで使用する戦略です。`delete+insert`、`append`、`insert_overwrite`、または `microbatch` がサポートされています。各戦略の詳細については[こちら](#incremental-model-strategies)を参照してください。 | 任意（デフォルト: 'default'）                                                        |
| `incremental_predicates` | インクリメンタルマテリアライゼーションに適用される追加条件です（`delete+insert` 戦略に対してのみ適用されます）。                                                                                                                                                                                    | 任意 |                      

### インクリメンタルモデルの戦略 \{#incremental-model-strategies\}

`dbt-clickhouse` は、インクリメンタルモデルの戦略を 3 種類サポートしています。

#### デフォルト（レガシー）戦略 \{#default-legacy-strategy\}

これまで ClickHouse は、非同期の「mutation」という仕組みによってのみ、更新および削除を限定的にサポートしてきました。
dbt における期待される動作をエミュレートするために、
dbt-clickhouse はデフォルトで、影響を受けない（削除されていない、変更されていない）「古い」
レコードと、新規または更新されたレコードをすべて含む新しい一時テーブルを作成し、
その後、この一時テーブルと既存のインクリメンタルモデルのリレーションをスワップ（入れ替え）します。これは、
処理が完了する前に何か問題が発生した場合でも元のリレーションを保持できる唯一の戦略ですが、
元のテーブル全体をコピーする必要があるため、実行コストが高く、時間がかかる場合があります。

#### Delete+Insert ストラテジー \{#delete-insert-strategy\}

ClickHouse ではバージョン 22.8 から実験的機能として「論理削除 (lightweight deletes)」が追加されました。論理削除は、ALTER TABLE ... DELETE
操作よりも大幅に高速です。これは ClickHouse のデータパーツを書き換える必要がないためです。インクリメンタル戦略 `delete+insert` は、
論理削除を利用して、従来の ("legacy") 戦略と比べて大幅に高性能なインクリメンタルマテリアライゼーションを実現します。ただし、この戦略を使用するにあたっては重要な注意点があります。

- 論理削除を使用するには、ClickHouse サーバー側で `allow_experimental_lightweight_delete=1` を
  設定して有効化するか、プロファイル内で `use_lw_deletes=true` を設定する必要があります
  (これにより dbt セッションでその設定が有効になります)
- 論理削除は現在プロダクション利用可能な状態ですが、ClickHouse 23.3 より前のバージョンではパフォーマンス面などで問題が発生する可能性があります。
- この戦略は (中間テーブルや一時テーブルを作成せずに) 対象となるテーブル/リレーションに直接操作を行うため、
  処理中に問題が発生した場合、インクリメンタルモデル内のデータが不正な状態になる可能性があります
- 論理削除を使用する場合、dbt-clickhouse は `allow_nondeterministic_mutations` を有効にします。ごく稀なケースとして、
  非決定的な incremental_predicates を使用していると、更新/削除対象の行についてレースコンディションが発生する可能性があります
  (およびそれに関連するログメッセージが ClickHouse ログに出力される可能性があります)。一貫した結果を保証するために、
  インクリメンタルの述語には、インクリメンタルマテリアライゼーションの実行中に変更されないデータに対する
  サブクエリのみを含めるようにしてください。

#### マイクロバッチ戦略（dbt-core >= 1.9 が必要） \{#microbatch-strategy\}

インクリメンタル戦略 `microbatch` は、dbt-core バージョン 1.9 から追加された機能であり、大規模な
時系列データ変換を効率的に処理するために設計されています。dbt-clickhouse では、既存の `delete_insert`
インクリメンタル戦略を拡張したものであり、`event_time` および
`batch_size` モデル設定に基づいて、増分処理対象をあらかじめ定義された時系列バッチに分割します。

大規模な変換処理への対応に加えて、microbatch は次の機能を提供します。

- [失敗したバッチの再処理](https://docs.getdbt.com/docs/build/incremental-microbatch#retry)。
- [バッチの並列実行](https://docs.getdbt.com/docs/build/parallel-batch-execution)の自動検知。
- [バックフィル](https://docs.getdbt.com/docs/build/incremental-microbatch#backfills)時に複雑な条件ロジックを不要にすること。

microbatch の詳細な使用方法については、[公式ドキュメント](https://docs.getdbt.com/docs/build/incremental-microbatch)を参照してください。

##### 利用可能なマイクロバッチ設定 \{#available-microbatch-configurations\}

| Option             | Description                                                                                                                                                                                                                                                                                                                                | Default if any |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| event_time         | 行が「いつ発生したか」を示すカラム。マイクロバッチモデルおよび、フィルタリング対象となる直接の親モデルに必須です。                                                                                                                                                                                                                             |                |
| begin              | マイクロバッチモデルにおける「時間の始まり」です。これは初回ビルドやフルリフレッシュビルドの開始ポイントになります。例えば、日次粒度のマイクロバッチモデルを 2024-10-01 に実行し、begin = '2023-10-01 とした場合、366 個のバッチ（うるう年のため）に加えて「今日」のバッチが処理されます。                                           |                |
| batch_size         | バッチの粒度です。サポートされている値は `hour`、`day`、`month`、`year` です。                                                                                                                                                                                                                                                              |                |
| lookback           | 遅延到着するレコードを取り込むために、最新のブックマークより前のバッチを X 個分処理します。                                                                                                                                                                                                                                             | 1              |
| concurrent_batches | バッチを同時（並行）実行するかどうかについて、dbt の自動検出機能を上書きします。[concurrent_batches の設定](https://docs.getdbt.com/docs/build/incremental-microbatch#configure-concurrent_batches)の詳細を参照してください。true に設定するとバッチを同時（並行）に実行し、false に設定するとバッチを順次（1 つずつ）実行します。                     |                |

#### Append 戦略 \{#append-strategy\}

この戦略は、dbt-clickhouse の以前のバージョンにおける `inserts_only` 設定を置き換えるものです。このアプローチでは、
新しい行を既存のリレーションに単純に追加します。
その結果、重複した行は排除されず、一時テーブルや中間テーブルも作成されません。データ内の重複が許容されている場合や、
増分クエリの WHERE 句やフィルター条件によって重複が除外されている場合には、最も高速なアプローチです。

#### insert_overwrite ストラテジー (実験的) \{#insert-overwrite-strategy\}

> [IMPORTANT]  
> 現在、insert_overwrite ストラテジーは分散マテリアライゼーションでは完全にはサポートされていません。

次の手順を実行します:

1. インクリメンタルモデルのリレーションと同じ構造を持つステージング（一時）テーブルを作成します:  
   `CREATE TABLE <staging> AS <target>`。
2. `SELECT` によって生成された新規レコードのみをステージングテーブルに挿入します。
3. ステージングテーブルに存在する新規パーティションのみをターゲットテーブル側のパーティションと入れ替えます。

このアプローチには次の利点があります:

- テーブル全体をコピーしないため、デフォルトのストラテジーより高速です。
- INSERT 操作が正常に完了するまで元のテーブルを変更しないため、他のストラテジーより安全です。途中で失敗した場合でも、元のテーブルは変更されません。
- 「パーティションの不変性」というデータエンジニアリングにおけるベストプラクティスを実践しており、インクリメンタルおよび並列でのデータ処理やロールバックなどを容易にします。

このストラテジーでは、モデル設定で `partition_by` を指定する必要があります。モデル設定内のその他のストラテジー固有のパラメーターはすべて無視されます。

## Materialization: materialized_view \{#materialized-view\}

`materialized_view` materialization は、insert トリガーとして動作する ClickHouse の [materialized view](/sql-reference/statements/create/view#materialized-view) を作成し、ソーステーブルからターゲットテーブルへ、新しい行を自動的に変換して挿入します。これは、dbt-clickhouse で利用可能な materialization の中でも最も強力なものの 1 つです。

この materialization は内容が複雑であるため、専用のページが用意されています。完全なドキュメントについては、**[Materialized Views ガイド](/integrations/dbt/materialized-views)** を参照してください。

## マテリアライゼーション: dictionary (experimental) \{#materialization-dictionary\}

ClickHouse の Dictionary 向けマテリアライゼーションの実装例については、次のテストを参照してください。
https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py

## マテリアライゼーション: distributed_table（実験的） \{#materialization-distributed-table\}

分散テーブルは次の手順で作成されます:

1. 正しい構造を取得するための SQL クエリで一時ビューを作成する
2. ビューに基づいて空のローカルテーブルを作成する
3. ローカルテーブルに基づいて分散テーブルを作成する
4. データは分散テーブルに挿入され、その結果、重複することなく分片全体に分散される

注意:

- dbt-clickhouse のクエリには、下流のインクリメンタル
  マテリアライゼーション処理が正しく実行されるようにするため、
  設定 `insert_distributed_sync = 1` が自動的に含まれるようになりました。これにより、一部の分散テーブルへの挿入が
  予想よりも遅く実行される可能性があります。

### 分散テーブルモデルの例 \{#distributed-table-model-example\}

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


### 自動生成されたマイグレーション \{#distributed-table-generated-migrations\}

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


### 設定 \{#distributed-table-configurations\}

このマテリアライゼーションタイプに固有の設定は、次のとおりです。

| Option                 | Description                                                                                                                                                                                                                                                                                                          | Default if any |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| sharding_key           | 分片キー (sharding key) は、Distributed エンジンのテーブルにデータを挿入する際に、宛先サーバーを決定します。分片キーには、ランダムな値やハッシュ関数の出力を利用できます。                                                                                                                                                      | `rand()`)      |

## materialization: distributed_incremental (experimental) \{#materialization-distributed-incremental\}

分散テーブルと同じ考え方に基づいたインクリメンタルモデルであり、最大の課題はすべてのインクリメンタル戦略を正しく処理することです。

1. _Append 戦略_ は、単にデータを分散テーブルに挿入します。
2. _Delete+Insert 戦略_ は、すべての分片上のデータを扱うために分散一時テーブルを作成します。
3. _Default (Legacy) 戦略_ は、同じ理由で分散一時テーブルおよび中間テーブルを作成します。

分散テーブル自体はデータを保持しないため、差し替えられるのは分片テーブルのみです。
分散テーブルは、full_refresh モードが有効な場合、またはテーブル構造が変更された可能性がある場合にのみ再読み込みされます。

### 分散インクリメンタルモデルの例 \{#distributed-incremental-model-example\}

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


### 自動生成されたマイグレーション \{#distributed-incremental-generated-migrations\}

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


## Snapshot \{#snapshot\}

dbt の snapshot 機能を使用すると、更新可能なモデルへの変更を時間の経過とともに記録できます。これにより、アナリストはモデルに対して時点指定クエリを実行し、モデルの過去状態を「遡って」参照できるようになります。この機能は ClickHouse コネクタでサポートされており、以下の構文で設定します。

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

設定の詳細については、[snapshot configs](https://docs.getdbt.com/docs/build/snapshots#snapshot-configs) のリファレンスページを参照してください。


## コントラクトと制約 \{#contracts-and-constraints\}

カラム型が完全に一致するコントラクトのみがサポートされます。たとえば、カラム型が UInt32 のコントラクトは、モデルが UInt64 など別の整数型を返した場合には失敗します。
ClickHouse では、テーブル／モデル全体に対する `CHECK` 制約のみがサポートされています。主キー、外部キー、一意制約、カラム単位の CHECK 制約はサポートされません。
（主キーおよび ORDER BY キーに関する ClickHouse のドキュメントを参照してください。）
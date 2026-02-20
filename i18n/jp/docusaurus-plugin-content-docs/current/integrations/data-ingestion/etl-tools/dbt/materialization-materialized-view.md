---
sidebar_label: 'マテリアライゼーション: materialized_view'
slug: /integrations/dbt/materialization-materialized-view
sidebar_position: 4
description: 'materialized_view マテリアライゼーション専用のドキュメント'
keywords: ['ClickHouse', 'dbt', 'materialized_view', 'リフレッシュ可能', 'Materialized Views', 'キャッチアップ']
title: 'マテリアライゼーション: materialized_view'
doc_type: 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# materialized view \{#materialized-views\}

<ClickHouseSupportedBadge/>

`materialized_view` マテリアライゼーションは、既存の（ソース）テーブルに対する `SELECT` として定義する必要があります。PostgreSQL と異なり、ClickHouse の materialized view は「静的」ではなく（対応する REFRESH 操作もありません）。代わりに **INSERT トリガー** のように動作し、ソーステーブルに行が挿入されるたびに、その行に対して定義済みの `SELECT` 変換を適用し、その結果をターゲットテーブルに新たな行として挿入します。ClickHouse における materialized view の動作の詳細については、[ClickHouse materialized view documentation](/materialized-view) を参照してください。

:::note
一般的なマテリアライゼーションの概念や、共通設定（engine、order_by、partition_by など）については、[Materializations](/integrations/dbt/materializations) ページを参照してください。
:::

## ターゲットテーブルの管理方法 \{#target-table-management\}

`materialized_view` マテリアライゼーションを使用する場合、dbt-clickhouse は **materialized view (MV)** と、変換後の行が挿入される **ターゲットテーブル** の両方を作成する必要があります。ターゲットテーブルを管理する方法は 2 通りあります。

| Approach | Description | Status   |
|----------|-------------|----------|
| **Implicit target** | dbt-clickhouse が同一モデル内でターゲットテーブルを自動的に作成・管理します。ターゲットテーブルのスキーマは MV の SQL から推論されます。 | Stable   |
| **Explicit target** | ターゲットテーブルを別の `table` マテリアライゼーションとして定義し、`materialization_target_table()` マクロを使用して MV モデルから参照します。MV は、そのテーブルを指す `TO` 句付きで作成されます。この機能は **dbt-clickhouse バージョン 1.10** 以降で利用可能です。**注意**: この機能はベータ版であり、コミュニティからのフィードバックに基づいて API が変更される可能性があります。 | **Beta** |

どのアプローチを選択するかによって、スキーマ変更時の扱い、フルリフレッシュの挙動、および複数の MV を組み合わせた構成での動作が変わります。以下のセクションで、それぞれのアプローチについて詳しく説明します。

## 暗黙的ターゲットによるマテリアライゼーション \{#implicit-target\}

これはデフォルトの動作です。`materialized_view` モデルを定義すると、アダプターは次の処理を行います。

1. モデル名で **ターゲットテーブル** を作成する
2. `<model_name>_mv` という名前の ClickHouse の **materialized view** を作成する

ターゲットテーブルのスキーマは、MV の `SELECT` ステートメント内のカラムから推論されます。すべてのリソース（ターゲットテーブルと MV）は同じモデル設定を共有します。

```sql
-- models/events_mv.sql
{{
    config(
        materialized='materialized_view',
        engine='SummingMergeTree()',
        order_by='(event_date, event_type)'
    )
}}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'events') }}
GROUP BY event_date, event_type
```

ほかの例については、[テストファイル](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py)を参照してください。


### 複数の materialized view \{#multiple-materialized-views\}

ClickHouse では、複数の materialized view から同じターゲットテーブルにレコードを書き込むことができます。dbt-clickhouse で暗黙のターゲットアプローチを用いてこれをサポートするには、モデルファイル内で `UNION` を構築し、各 materialized view 用の SQL を、`--my_mv_name:begin` および `--my_mv_name:end` という形式のコメントで囲みます。

例えば、次の例では 2 つの materialized view を作成し、どちらもモデルの同じ宛先テーブルにデータを書き込みます。materialized view の名前は `<model_name>_mv1` および `<model_name>_mv2` という形式になります。

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
> 複数の materialized view (MV) を含むモデルを更新する際、特に MV 名の 1 つの名前を変更した場合でも、
> dbt-clickhouse は古い MV を自動的には削除しません。その代わりに、
> 次のような警告が表示されます:
> `Warning - Table <previous table name> was detected with the same pattern as model name <your model name> but was not found in this run. In case it is a renamed mv that was previously part of this model, drop it manually (!!!) `


### ターゲットテーブルのスキーマをどのように反復させるか \{#how-to-iterate-the-target-table-schema\}

**dbt-clickhouse バージョン 1.9.8** 以降では、`dbt run` 実行時に MV の SQL 内で異なるカラムが見つかった場合に、ターゲットテーブルのスキーマをどのように反復させるかを制御できます。

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    on_schema_change='fail'  # this setting
)}}
```

デフォルトでは、dbt はターゲットテーブルに対して変更を一切加えません（`ignore` 設定の値）。ただし、この設定を変更して、[インクリメンタルモデルにおける `on_schema_change` 設定](https://docs.getdbt.com/docs/build/incremental-models#what-if-the-columns-of-my-incremental-model-change)と同じ動作をさせることができます。

また、この設定を安全装置として利用することもできます。`fail` に設定すると、最初の `dbt run` によって作成されたターゲットテーブルと MV の SQL に定義されたカラムが異なる場合、ビルドは失敗します。


### データのキャッチアップ \{#data-catch-up\}

デフォルトでは、materialized view (MV) を作成または再作成する際、MV 自体が作成される前に、まずターゲットテーブルが履歴データで埋められます（`catchup=True`）。この動作は、設定項目 `catchup` を `False` に設定することで無効化できます。

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    catchup=False  # this setting
)}}
```

| Operation                               | `catchup: True` (default)           | `catchup: False`                    |
| --------------------------------------- | ----------------------------------- | ----------------------------------- |
| Initial deployment (`dbt run`)          | 対象テーブルが過去データでバックフィルされる              | 対象テーブルが空の状態で作成される                   |
| Full refresh (`dbt run --full-refresh`) | 対象テーブルが再構築され、過去データでバックフィルされる        | 対象テーブルが空の状態で再作成され、**既存データは失われる**    |
| Normal operation                        | materialized view が新規の INSERT を取り込む | materialized view が新規の INSERT を取り込む |

:::warning フルリフレッシュ時のデータ損失リスク
`catchup: False` を `dbt run --full-refresh` と組み合わせて使用すると、対象テーブル内の **既存データがすべて破棄されます**。テーブルは空の状態で再作成され、その後は新しいデータのみが取り込まれます。履歴データが後から必要になる可能性がある場合は、必ず事前にバックアップを取得してください。
:::


## 明示的ターゲットを用いたマテリアライゼーション (Beta) \{#explicit-target\}

:::warning Beta
この機能はベータ版であり、**dbt-clickhouse バージョン 1.10** 以降で利用可能です。API はコミュニティからのフィードバックに基づいて変更される可能性があります。
:::

デフォルトでは、dbt-clickhouse は単一のモデル内でターゲットテーブルと materialized view を両方とも作成および管理します（前述の [暗黙的ターゲット](#implicit-target) アプローチ）。このアプローチには次のような制限があります。

- すべてのリソース（ターゲットテーブル + MV）は同じ設定を共有します。複数の MV が同一のターゲットテーブルを参照している場合、それらは `UNION ALL` 構文を用いて一緒に定義しなければなりません。
- これらのリソースは個別に実行・管理することができず、同じモデルファイルを使ってまとめて管理する必要があります。
- 各 MV の名前を柔軟に制御することができません。
- すべての設定がターゲットテーブルと MV の間で共有されるため、各リソースを個別に設定したり、どの設定がどのリソースに属しているのかを明確に切り分けて考えることが困難になります。

**明示的ターゲット** 機能を使用すると、ターゲットテーブルを通常の `table` マテリアライゼーションとして個別に定義し、そのうえで materialized view モデルからそれを参照できます。

### 利点 \{#explicit-target-benefits\}

- **リソースを完全に分離可能**: 各リソースを個別に定義できるようになり、可読性が向上します。
- **dbt と CH 間で 1:1 のリソース対応**: dbt のツールを使って、それぞれを独立して管理し、イテレーションできるようになりました。
- **リソースごとに異なる設定が可能**: 各リソースに対して異なる設定を適用できるようになりました。
- **命名規則を維持する必要がない**: すべてのリソースは、MVs 用に _mv を付与したカスタム名ではなく、ユーザーが指定した名前で作成されます。

### 制限事項 \{#explicit-target-limitations\}

- ターゲットテーブルの定義は dbt にとって自然な形ではありません。これはソーステーブルから読み取るための SQL ではないため、この部分では dbt による検証が効かなくなります。MV の SQL 自体は引き続き dbt ユーティリティを使って検証され、ターゲットテーブルのカラムとの互換性は ClickHouse レベルで検証されます。
- **`ref()` 関数の制限に起因するいくつかの問題が見つかっています**。モデル同士を参照するために `ref()` を使う必要がありますが、これは下流ではなく上流のモデルのみを参照するためにしか使えません。このことが本実装でいくつかの問題を引き起こします。dbt-core リポジトリに issue を作成しており、現在 dbt チームと [可能な解決策を検討しています (dbt-labs/dbt-core#12319)](https://github.com/dbt-labs/dbt-core/issues/12319)。
  - `ref()` が config ブロック内から呼ばれた場合、共有されているモデルではなく、現在のモデルを返します。このため、config() セクション内で定義することができず、この依存関係を追加するためにコメントを使わざるを得ません。これは dbt ドキュメントで定義されている [“--depends_on:” アプローチ](https://docs.getdbt.com/reference/dbt-jinja-functions/ref#forcing-dependencies) と同じパターンに従っています。
  - `ref()` はターゲットテーブルを先に作成することを強制してくれるという意味では問題なく動作しますが、生成されたドキュメント内の依存関係チャートでは、ターゲットテーブルが下流ではなく別の上流の依存関係として描画されるため、やや理解しづらくなります。
  - `unit-test` では、そのテーブルから読み取らない想定であっても、ターゲットテーブル用のデータを定義する必要があります。回避策としては、このテーブルのデータを空にしておくことです。

### 使用方法 \{#explicit-target-usage\}

**ステップ 1: 通常のテーブルモデルとしてターゲットテーブルを定義する**

モデル `events_daily.sql`:

```sql
{{
    config(
        materialized='table',
        engine='SummingMergeTree()',
        order_by='(event_date, event_type)',
        partition_by='toYYYYMM(event_date)'
    )
}}

SELECT
    toDate(now()) AS event_date,
    '' AS event_type,
    toUInt64(0) AS total
WHERE 0  -- Creates empty table with correct schema
```

これは制限事項のセクションで言及した回避策です。ここでは一部の dbt バリデーションが失われる可能性がありますが、スキーマは引き続き ClickHouse レベルで検証されます。

**ステップ 2: ターゲットテーブルを指す materialized view を定義する**

例えば、同じターゲットテーブルを指していても、次のように異なるモデルで異なる MV を定義できます。`{{ materialization_target_table(ref('events_daily')) }}` という新しいマクロ呼び出しに注目してください。これは MV のターゲットテーブルを設定します。

モデル `page_events_aggregator.sql`:

```sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'page_events') }}
GROUP BY event_date, event_type
```

モデル `mobile_events_aggregator.sql`:

```sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'mobile_events') }}
GROUP BY event_date, event_type
```


### 設定オプション \{#explicit-target-configuration\}

明示的なターゲットテーブルを使用する場合、次の設定が適用されます。

**ターゲットテーブル（`materialized='table'`）側:**

| Option | Description | Default |
|--------|-------------|---------|
| `mv_on_schema_change` | テーブルが dbt 管理の materialized view によって使用されている場合のスキーマ変更の扱い方。インクリメンタルモデルにおける `on_schema_change` 設定と同じ動作に従います。[インクリメンタルモデル](https://docs.getdbt.com/docs/build/incremental-models#what-if-the-columns-of-my-incremental-model-change)を参照。| **注意**: `materialized='table'` のモデルに対して、それを参照する materialized view が存在しない場合は通常どおり動作するため、この設定が定義されていても無視されます。テーブルが materialized view のターゲットになっている場合、この設定はテーブル内のデータを保護するためにデフォルトで `mv_on_schema_change='fail'` となります。 |
| `repopulate_from_mvs_on_full_refresh` | `--full-refresh` 時にテーブルの SQL を実行する代わりに、そのテーブルを参照するすべての materialized view の SQL を用いた INSERT-SELECT 文を実行してテーブルを再構築します。 | `False` |

**materialized view（`materialized='materialized_view'`）側:**

| Option | Description | Default |
|--------|-------------|---------|
| `catchup` | materialized view 作成時に過去データをバックフィルするかどうか。 | `True` |

:::note
通常は、materialized view 側の `catchup` を `True` にするか、ターゲットテーブル側の `repopulate_from_mvs_on_full_refresh` を `True` にするかのいずれか一方のみを設定します。両方を `True` に設定すると、データが重複する可能性があります。
:::

### 一般的な操作 \{#explicit-target-common-operations\}

#### 明示的なターゲットを使ったフルリフレッシュ \{#explicit-target-full-refresh\}

`--full-refresh` を使用する場合、明示的に指定したターゲットテーブルは再作成されます（この処理中にインジェストが行われていると、データを失う可能性があります）。これは設定内容に応じて動作が変わります。

**オプション 1: デフォルトの `--full-refresh` の動作。すべてが再作成されますが、MV を再作成している間は、ターゲットテーブルは空、または一部のみ読み込まれた状態になります。**

すべてが DROP されて再作成されます。MV の SQL を使ってデータを再挿入したい場合は、`catchup=True` の設定を維持してください。

```sql
-- models/page_events_aggregator.sql
{{ config(
    materialized='materialized_view',
    catchup=True  -- this is the default value so you don't need to actully set it.
) }}
{{ materialization_target_table(ref('events_daily')) }}
...
```

**オプション 2: 対象テーブルを再作成したいが、MV の再作成中にデータが空の状態のテーブルを読み込みたくない場合**

まず MV の SQL を更新する必要がある場合は、それぞれに `catchup=False` を設定し、そのうえで MV に対して `dbt run` または `dbt run --full-refresh` を実行します。対象テーブルに対して `--full-refresh` を実行する前に MV が作成済みであることを必ず確認してください。対象テーブルの `--full-refresh` では ClickHouse の MV 定義が使用されるためです。

対象テーブルのモデルで `repopulate_from_mvs_on_full_refresh=True` を設定します。`dbt run --full-refresh` を実行すると、これは次の処理を行います:

1. 新しい一時テーブルを作成する
2. 各 MV の SQL を使用して INSERT-SELECT を実行する
3. テーブルをアトミックに入れ替える

これにより、MV が再作成されている間も、そのテーブルの利用者がデータの入っていない状態を見ることはありません。

```sql
-- models/events_daily.sql
{{
    config(
        materialized='table',
        engine='SummingMergeTree()',
        order_by='(event_date, event_type)',
        repopulate_from_mvs_on_full_refresh=True
    )
}}
...
```


#### ターゲットテーブルの変更 \{#explicit-target-changing\}

`--full-refresh` なしで MV のターゲットテーブルを変更することはできません。`materialization_target_table()` の参照を変更したあとに通常の `dbt run` を実行しようとすると、ターゲットが変更されたことを示すエラーメッセージが出力され、ビルドは失敗します。

ターゲットを変更するには:

1. `materialization_target_table()` の呼び出しを更新する
2. `dbt run --full-refresh -s your_mv_model` を実行する

### よくある問題のトラブルシューティング \{#explicit-target-troubleshooting\}

#### `run` 実行中または実行後にターゲットテーブルが空のままになる \{#target-table-empty\}

これが起こりうる理由はいくつかあります。

- materialized view が `catchup=False` で設定されているか、ターゲットテーブルが `repopulate_from_mvs_on_full_refresh=False` で設定されているために、materialized view の作成時やターゲットテーブルの再作成時にバックフィルが実行されない可能性があります。これは想定された動作です。そのため、materialized view の SQL を使ってデータを再投入したい場合は、materialized view で `catchup=True`（デフォルト値）を設定するか、ターゲットテーブルで `repopulate_from_mvs_on_full_refresh=True` を設定してください。重複を避けるため、両方を同時に有効にしないように注意してください。詳細については [configuration セクション](#explicit-target-configuration) を確認してください。
- `dbt run --full-refresh` を実行している間、materialized view がデフォルトの `catchup=True` を使用している場合、ターゲットテーブルは再作成され、MV がデータを順番に再投入します。この状況を避けるには、[Full refresh with explicit targets](#explicit-target-full-refresh) を確認してください。

#### `repopulate_from_mvs_on_full_refresh=True` が設定されたターゲットテーブルに対して `dbt run --full-refresh` を実行すると、プロジェクト内の現在の SQL ではなく、古い materialized view バージョンのロジックが使用される \{#full-refresh-with-repopulate-from-mvs-on-full-refresh\}

`repopulate_from_mvs_on_full_refresh=True` は、ClickHouse にすでに定義されている既存の MV（materialized view）の SQL を使用します。新しい materialized view 定義が使用されるようにするには、ターゲットテーブルで `dbt run --full-refresh` を実行する前に、各 materialized view に対して `dbt run` を実行してください。

#### 実行後に重複データが発生する \{#duplicate-data\}

考えられる原因:

- materialized view 側で `catchup=True` が有効になっており、かつターゲットテーブル側で `repopulate_from_mvs_on_full_refresh=True` も有効になっている場合: 実行したい処理に応じて、どちらか一方のみを有効にしてください。詳細については[設定セクション](#explicit-target-configuration)を参照してください。
- ターゲットテーブルが `WHERE 0` を付けずに定義されている場合: ターゲットテーブルは空で作成されるべきですが、`WHERE 0` が含まれていないと、内部クエリによってデータが挿入される可能性があります。この句が必ず含まれていることを確認してください。

#### アクティブなインジェスト中に `dbt run --full-refresh` が実行された場合のデータ損失 \{#data-loss-active-ingestion\}

`dbt run --full-refresh` を実行した後、ソーステーブルの一部の行がターゲットテーブルに存在しないことがあります。
ClickHouse の materialized view は insert トリガーとして動作し、存在している間にのみデータを取り込みます。フルリフレッシュ中には、MV が削除されて再作成される短時間の空白期間（「blind window」）が発生します。この期間中にソーステーブルに挿入された行は取り込まれません。詳細については、[アクティブなインジェスト中の動作](#behavior-during-active-ingestion) セクションを参照してください。

### デバッグ方法 \{#debugging-techniques\}

#### ClickHouse 内の MV の現在の出力先を確認する \{#check-mv-target\}

materialized view がどこに書き込んでいるかを確認するには、`system.tables` を照会します。

```sql
SELECT
    name as mv_name,
    replaceRegexpOne(
        create_table_query,
        '.*TO\\s+`?([^`\\s(]+)`?\\.`?([^`\\s(]+)`?.*',
        '\\1.\\2'
    ) AS target_table
FROM system.tables
WHERE database = 'your_schema'
  AND engine = 'MaterializedView'
```


#### dbt がテーブルを materialized view のターゲットとして認識しているか確認する \{#check-dbt-recognition\}

dbt の実行中に、次のログメッセージが出力されているか確認します:

>Table `<table_name>` is used as a target by a dbt-managed materialized view. Defaulting mv_on_schema_change to "fail" to prevent data loss.

このメッセージが表示される場合、そのテーブルが少なくとも 1 つの dbt 管理の materialized view のターゲットとして検出されたことを意味します。  
このメッセージが表示されるはずなのに出てこない場合は、次の点を確認してください:

- materialized view モデルで `{{ materialization_target_table(ref('your_target')) }}` が正しく定義されていること
- materialized view モデルの config に `materialized='materialized_view'` が指定されていること
- materialized view とターゲットテーブルの両方が少なくとも一度は実行されていること

### 暗黙的ターゲットから明示的ターゲットへの移行 \{#migration-implicit-to-explicit\}

暗黙的ターゲット方式を使用している既存の materialized view モデルを、明示的ターゲット方式へ移行したい場合は、次の手順に従ってください。

**1. ターゲットテーブルモデルを作成する**

現在の MV ターゲットテーブルと同じスキーマを定義する、`materialized='table'` を指定した新しいモデルファイルを作成します。空のテーブルを作成するために `WHERE 0` 句を使用します。現在の暗黙的 materialized view モデルと同じ名前を使用してください。これで、このモデルを使ってターゲットテーブルに対してイテレーションを行えるようになります。

```sql
-- models/events_daily.sql
{{
    config(
        materialized='table',
        engine='MergeTree()',
        order_by='(event_date, event_type)'
    )
}}

SELECT
    toDate(now()) AS event_date,
    '' AS event_type,
    toUInt64(0) AS total
WHERE 0
```

**2. MV モデルを更新する**

各 MV の SQL と、新しいターゲットテーブルを指す `materialization_target_table()` マクロ呼び出しをそれぞれ含む新しいモデルを作成します。以前に `UNION ALL` を使用していた場合は、その部分とコメントを削除してください。

モデル名については、次の命名規則に従う必要があります。

* MV が 1 つだけ定義されている場合、その名前は `<old_model_name>_mv` になります
* MV が複数定義されている場合、それぞれの名前は `<old_model_name>_mv_<name_in_comments>` になります

`my_model.sql` の変更前（暗黙的なターゲットテーブル、UNION ALL を用いた単一モデル）:

```sql
--mv1:begin
select a, b, c from {{ source('raw', 'table_1') }}
--mv1:end
union all
--mv2:begin
select a, b, c from {{ source('raw', 'table_2') }}
--mv2:end
```

（ターゲットを明示し、モデルファイルを分離した場合の結果）：

```sql
-- models/my_model_mv_mv1.sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

select a, b, c from {{ source('raw', 'table_1') }}
```

```sql
-- models/my_model_mv_mv2.sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

select a, b, c from {{ source('raw', 'table_2') }}
```

**3. 必要に応じて、[明示的なターゲット](#explicit-target) セクションの手順に従って反復的に更新します。**


## 暗黙的ターゲット方式と明示的ターゲット方式の動作比較\{#behavior-comparison\}

### 一般的な動作 \{#general-behavior\}

| Operation | Implicit target | Explicit target |
| --- | --- | --- |
| First dbt run | すべてのリソースが作成される | すべてのリソースが作成される |
| Next dbt run |  **個々のリソースを個別には管理できず、すべて一括で処理される:**<br /><br />**target table**: <br /> 変更は `on_schema_change` 設定で管理される。デフォルトでは `ignore` に設定されているため、新しいカラムは処理されない。<br /><br />**Materialized views**: すべてが `alter table modify query` 操作で更新される | **変更は個別に適用できる:<br /><br />target table**: <br />dbt で定義された materialized view によって生成された target table かどうかを自動検出する。該当する場合、スキーマ変更はデフォルトで `mv_on_schema_change` 設定の `fail` 値で管理されるため、カラムが変更されると失敗する。このデフォルト値は保護レイヤーとして追加されている。<br /><br />**Materialized views**: 各ビューの SQL が `alter table modify query` 操作で更新される。 |
| dbt run --full-refresh | **個々のリソースを個別には管理できず、すべて一括で処理される:<br /><br />target table**: <br />target table が空の状態で再作成される。すべての materialized view の SQL をまとめて用いたバックフィルを構成するために `catchup` を利用できる。`catchup` はデフォルトで `True`。<br /><br />**Materialized views**: すべて再作成される。 | **変更は個別に適用される:<br /><br />target table:** 通常どおり再作成される。<br /><br />**Materialized views**: drop して再作成する。初回バックフィルのために `catchup` を利用できる。`catchup` はデフォルトで `True`。 <br /><br />**注意: この処理の間、materialized view が再作成されるまでは target table は空、もしくは一部のみロードされた状態になる。これを避けるには、次のセクションで説明する target table の繰り返し更新の方法を確認すること。**|

### インジェスト実行中の挙動 \{#behavior-during-active-ingestion\}

モデルを反復的に更新する際には、さまざまな操作が挿入中のデータとどのように相互作用するかを理解しておく必要があります。

- ClickHouse の materialized view は **insert トリガー** として動作するため、存在している期間のデータしか取り込みません。materialized view が削除されて再作成された場合（たとえば `--full-refresh` 中など）、その時間枠にソーステーブルへ挿入された行は materialized view によって処理され **ません**。この状態は materialized view が「blind」であると呼ばれます。
- 各種 `catchup` プロセスはすべて、materialized view の SQL を用いた `INSERT INTO ... SELECT` 操作に基づいており、materialized view 自体の動作とは独立しています。いったん `INSERT` が開始されると、その処理によって新しいデータは取り込まれませんが、アタッチされている materialized view によって取り込まれます。

次の表は、ソーステーブルに対して挿入が継続的に行われているときに、各操作がどの程度安全かをまとめたものです。

#### 暗黙的なターゲット操作 \{#ingestion-implicit-target\}

| 操作 | 内部処理 | 挿入実行中の安全性 |
|-----------|------------------|------------------------------------|
| 最初の `dbt run` | 1. ターゲットテーブルを作成<br/>2. データを挿入（`catchup=True` の場合）<br/>3. materialized view を作成 | ⚠️ **ステップ 1〜3 の間、materialized view はソースへの挿入を検知できません。** この間にソースに挿入された行は取り込まれません。 |
| 2 回目以降の `dbt run` | `ALTER TABLE ... MODIFY QUERY` | ✅ 安全。materialized view はアトミックに更新されます。 |
| `dbt run --full-refresh` | 1. バックアップテーブルを作成<br/>2. データを挿入（`catchup=True` の場合）<br/>3. materialized view を DROP<br/>4. テーブルを交換<br/>5. materialized view を再作成 | ⚠️ **再作成中、materialized view はソースへの挿入を検知できません。** ステップ 3〜5 の間にソースに挿入されたデータは、新しいターゲットテーブルには反映されません。 |

#### 明示的なターゲット操作 \{#ingestion-explicit-target\}

**materialized view モデル:**

| Operation | Internal process | Safety while inserts are happening |
|-----------|------------------|------------------------------------|
| 最初の `dbt run` | 1. MV を作成（`TO` 句付き）<br/>2. catch-up を実行（`catchup=True` の場合） | ✅ MV が先に作成されるため、新規の insert は直ちに取り込まれます。<br/>⚠️ **catch-up によりデータが重複する可能性があります** — backfill クエリが、すでに MV によって処理中の行と重複する場合があります。重複排除エンジン（例: `ReplacingMergeTree`）を使用している場合は安全です。 |
| 2 回目以降の `dbt run` | `ALTER TABLE ... MODIFY QUERY` | ✅ 安全です。MV はアトミックに更新されます。 |
| MVs に対する `dbt run --full-refresh` | 1. MV を削除して再作成<br/>2. catch-up を実行（`catchup=True` の場合） | ⚠️ **再作成中、MV は新規データを認識できません**（drop と create の間）。<br/>⚠️ insert が同時進行している場合、**catch-up によりデータが重複する可能性があります**。 |

**ターゲットテーブルモデル:**

| Operation | Internal process | Safety while inserts are happening |
|-----------|------------------|------------------------------------|
| `dbt run` | スキーマ変更は `mv_on_schema_change` 設定に従って適用されます | ✅ 安全です。データの移動はありません。 |
| `dbt run --full-refresh`（デフォルト） | テーブルを再作成（空の状態のまま） | ⚠️ **ターゲットテーブルは空のまま** で、MV が backfill するまでデータは入りません。テーブルが存在すると、MV は新しいテーブルへの insert を継続します。 |
| `repopulate_from_mvs_on_full_refresh=True` を指定した `dbt run --full-refresh` | 1. バックアップテーブルを作成<br/>2. 各 MV の SQL を使ってデータを insert<br/>3. テーブルをアトミックに入れ替え | ⚠️ **再作成中、MV は新規データを認識できません。** ステップ 1 と 3 の間に insert されたデータは、新しいテーブルには反映されません。**これは今後のバージョンで変更される可能性があります**|

:::tip アクティブなインジェストがある本番環境向けの推奨事項

- **可能であれば、dbt の実行中はインジェストを一時停止してください**: これにより、すべての操作が安全になり、データ損失は発生しません。
- **可能であれば重複排除エンジン**（例: `ReplacingMergeTree`）をターゲットテーブルに使用し、catch-up によるオーバーラップで発生しうる重複データを処理できるようにします。
- **`ALTER TABLE ... MODIFY QUERY` を優先的に使用してください**（`--full-refresh` なしの通常の `dbt run`）— 常に安全です。
- dbt 実行中の**問題となりうる時間帯（ウィンドウ）**を把握しておいてください。
:::

## リフレッシャブルmaterialized view \{#refreshable-materialized-views\}

[Refreshable Materialized Views](/materialized-view/refreshable-materialized-view) は、ClickHouse における特別な種類の materialized view で、クエリを定期的に再実行して結果を保存します。これは、他のデータベースにおける materialized view の動作に似ています。リアルタイムな insert トリガーではなく、定期的なスナップショットや集約を行いたい場合に有用です。

:::tip
リフレッシャブルmaterialized view は、[暗黙的なターゲット](#implicit-target) アプローチと [明示的なターゲット](#explicit-target) アプローチの **両方** で使用できます。`refreshable` 設定は、ターゲットテーブルの管理方法とは独立しています。
:::

リフレッシャブルmaterialized view を使用するには、MV モデルに `refreshable` 設定オブジェクトを追加し、以下のオプションを指定します:

| Option                | Description                                                                                                                                                              | Required | Default Value |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|---------------|
| refresh_interval      | 必須の interval 句                                                                                                                                                       | Yes      |               |
| randomize             | ランダマイズ用の句で、`RANDOMIZE FOR` の後に指定されます                                                                                                                 |          |               |
| append                | `True` に設定すると、各リフレッシュ時に既存の行を削除せずにテーブルへ行を挿入します。通常の INSERT SELECT と同様に、この挿入はアトミックではありません。                 |          | False         |
| depends_on            | リフレッシャブル materialized view の依存関係リスト。依存関係は `{schema}.{view_name}` の形式で指定してください                                                            |          |               |
| depends_on_validation | `depends_on` で指定された依存関係の存在を検証するかどうか。依存関係にスキーマが含まれていない場合、検証はスキーマ `default` に対して行われます                              |          | False         |

### 暗黙のターゲットを使用する例 \{#refreshable-implicit-example\}

```python
{{
    config(
        materialized='materialized_view',
        engine='MergeTree()',
        order_by='(event_date)',
        refreshable={
            "interval": "EVERY 5 MINUTE",
            "randomize": "1 MINUTE",
            "append": True,
            "depends_on": ['schema.depend_on_model'],
            "depends_on_validation": True
        }
    )
}}

SELECT
    toStartOfDay(event_time) AS event_date,
    count() AS total
FROM {{ source('raw', 'events') }}
GROUP BY event_date
```


### 明示的なターゲット指定の例 \{#refreshable-explicit-example\}

```python
{{
    config(
        materialized='materialized_view',
        refreshable={
            "interval": "EVERY 1 HOUR",
            "append": False
        }
    )
}}
{{ materialization_target_table(ref('events_daily')) }}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'events') }}
GROUP BY event_date, event_type
```


### 制約事項 \{#refreshable-limitations\}

* 依存関係を持つ refreshable materialized view (MV) を ClickHouse で作成する際、指定した依存関係が作成時点で存在していなくても、ClickHouse はエラーにはなりません。その代わり、その refreshable MV は非アクティブな状態のままとなり、依存関係が満たされるまで更新処理やリフレッシュを開始しません。この挙動は設計どおりですが、必要な依存関係が速やかに解決されない場合、データの利用可能性に遅延を招くおそれがあります。ユーザーは、refreshable materialized view を作成する前に、すべての依存関係が正しく定義され、存在していることを確認することが推奨されます。
* 現時点では、MV とその依存関係の間に実際の「dbt linkage」は存在しないため、作成順序は保証されません。
* refreshable 機能は、複数の MV が同じターゲットモデルを参照する構成ではテストされていません。
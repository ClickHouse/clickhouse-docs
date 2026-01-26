---
description: 'CREATE VIEW のリファレンス'
sidebar_label: 'VIEW'
sidebar_position: 37
slug: /sql-reference/statements/create/view
title: 'CREATE VIEW'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# CREATE VIEW \{#create-view\}

新しいビューを作成します。ビューには[通常ビュー](#normal-view)、[マテリアライズドビュー](#materialized-view)、[リフレッシュ可能なマテリアライズドビュー](#refreshable-materialized-view)、および[ウィンドウビュー](/sql-reference/statements/create/view#window-view)の種類があります。

## 標準表示 \{#normal-view\}

構文:

```sql
CREATE [OR REPLACE] VIEW [IF NOT EXISTS] [db.]table_name [(alias1 [, alias2 ...])] [ON CLUSTER cluster_name]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

通常のビューはデータを一切保存しません。アクセスのたびに別のテーブルからの読み取りを実行するだけです。言い換えると、通常のビューは保存されたクエリに過ぎません。ビューから読み取る場合、この保存されたクエリは [FROM](../../../sql-reference/statements/select/from.md) 句内のサブクエリとして使用されます。

例として、ビューを作成したとします。

```sql
CREATE VIEW view AS SELECT ...
```

また、次のクエリを作成しました：

```sql
SELECT a, b, c FROM view
```

このクエリは、サブクエリを使用した場合と完全に同等です。

```sql
SELECT a, b, c FROM (SELECT ...)
```


## パラメータ化ビュー \{#parameterized-view\}

パラメータ化ビューは通常のビューと似ていますが、ただちには解決されないパラメータを指定して作成できます。これらのビューはテーブル関数で使用でき、その際はビュー名を関数名として指定し、パラメータ値をその引数として渡します。

```sql
CREATE VIEW view AS SELECT * FROM TABLE WHERE Column1={column1:datatype1} and Column2={column2:datatype2} ...
```

上記ではテーブルに対するビューを作成しており、以下のようにパラメータを指定することでテーブル関数として利用できます。

```sql
SELECT * FROM view(column1=value1, column2=value2 ...)
```


## マテリアライズドビュー \{#materialized-view\}

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster_name] [TO[db.]name [(columns)]] [ENGINE = engine] [POPULATE]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

:::tip
[マテリアライズドビュー](/guides/developer/cascading-materialized-views.md)のステップバイステップガイドがあります。
:::

マテリアライズドビューは、対応する[SELECT](../../../sql-reference/statements/select/index.md) クエリによって変換されたデータを保存します。

`TO [db].[table]` を指定せずにマテリアライズドビューを作成する場合は、データを保存するテーブルエンジンである `ENGINE` を指定する必要があります。

`TO [db].[table]` を指定してマテリアライズドビューを作成する場合、`POPULATE` を同時に使用することはできません。

マテリアライズドビューは次のように実装されています。`SELECT` で指定されたテーブルにデータを挿入すると、その挿入データの一部がこの `SELECT` クエリによって変換され、その結果がビューに挿入されます。

:::note
ClickHouse のマテリアライズドビューでは、デスティネーションテーブルへの挿入時に、列の並び順ではなく**列名**が使用されます。`SELECT` クエリ結果に一部の列名が存在しない場合、たとえその列が [Nullable](../../data-types/nullable.md) でなくても、ClickHouse はその列にデフォルト値を使用します。安全な方法としては、マテリアライズドビューを使用する際に、すべての列に対してエイリアスを追加することが推奨されます。

ClickHouse のマテリアライズドビューは、挿入トリガーに近い仕組みで実装されています。ビューのクエリに集約が含まれている場合、その集約は新たに挿入されたバッチデータに対してのみ適用されます。ソーステーブルの既存データに対する変更（update、delete、パーティションの drop など）は、マテリアライズドビューを変更しません。

ClickHouse のマテリアライズドビューは、エラー発生時の動作が決定的ではありません。つまり、すでに書き込まれたブロックはデスティネーションテーブルに保持されますが、エラー以降のブロックは書き込まれません。

デフォルトでは、いずれかのビューへのプッシュが失敗すると、INSERT クエリ自体も失敗し、一部のブロックがデスティネーションテーブルに書き込まれない可能性があります。これは `materialized_views_ignore_errors` 設定（`INSERT` クエリに対して設定する必要があります）を使用して変更できます。`materialized_views_ignore_errors=true` を設定すると、ビューへのプッシュ中のエラーはすべて無視され、すべてのブロックがデスティネーションテーブルに書き込まれます。

なお、`materialized_views_ignore_errors` は `system.*_log` テーブルに対してはデフォルトで `true` に設定されています。
:::

`POPULATE` を指定すると、`CREATE TABLE ... AS SELECT ...` を実行したかのように、既存のテーブルデータがビュー作成時にビューへ挿入されます。指定しない場合、ビューにはビュー作成後にテーブルに挿入されたデータのみが含まれます。ビュー作成中にテーブルへ挿入されたデータはビューへ挿入されないため、**`POPULATE` を使用することは推奨しません**。

:::note
`POPULATE` は `CREATE TABLE ... AS SELECT ...` のように動作するため、次の制約があります。

* Replicated database ではサポートされません
* ClickHouse Cloud ではサポートされません

代わりに、別途 `INSERT ... SELECT` を使用できます。
:::

`SELECT` クエリには `DISTINCT`、`GROUP BY`、`ORDER BY`、`LIMIT` を含めることができます。対応する変換は、挿入されたデータの各ブロックごとに独立して実行される点に注意してください。たとえば、`GROUP BY` が設定されている場合、データは挿入時に集約されますが、単一の挿入パケット内だけで集約されます。その後にさらに集約が行われることはありません。例外として、`SummingMergeTree` のように独立してデータ集約を実行する `ENGINE` を使用する場合があります。

マテリアライズドビューが `TO [db.]name` 構文を使用している場合は、ビューを `DETACH` し、対象テーブルに対して `ALTER` を実行し、その後で先ほど `DETACH` したビューを `ATTACH` できます。

マテリアライズドビューは、[optimize&#95;on&#95;insert](/operations/settings/settings#optimize_on_insert) 設定の影響を受ける点に注意してください。ビューへの挿入前にデータがマージされます。

ビューは通常のテーブルと同様に扱われます。たとえば、`SHOW TABLES` クエリの結果にも表示されます。

ビューを削除するには、[DROP VIEW](../../../sql-reference/statements/drop.md#drop-view) を使用します。`DROP TABLE` も VIEW に対して動作します。


## SQL セキュリティ \{#sql_security\}

`DEFINER` と `SQL SECURITY` を使用すると、ビューの背後で実行されるクエリを実行する際に、どの ClickHouse ユーザーを使用するかを指定できます。
`SQL SECURITY` には `DEFINER`、`INVOKER`、`NONE` の 3 つの有効な値があります。`DEFINER` 句では、既存の任意のユーザー、または `CURRENT_USER` を指定できます。

次の表では、ビューから `SELECT` するために、どのユーザーにどの権限が必要かを示します。
なお、SQL セキュリティオプションに関係なく、どの場合でもビューを読み取るには `GRANT SELECT ON <view>` が必要です。

| SQL security option | View                                               | Materialized View                                                                 |
| ------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------- |
| `DEFINER alice`     | `alice` はビューのソーステーブルに対する `SELECT` 権限を持っている必要があります。 | `alice` はビューのソーステーブルに対する `SELECT` 権限と、ビューのターゲットテーブルに対する `INSERT` 権限を持っている必要があります。 |
| `INVOKER`           | ユーザーはビューのソーステーブルに対する `SELECT` 権限を持っている必要があります。     | マテリアライズドビューでは `SQL SECURITY INVOKER` を指定できません。                                    |
| `NONE`              | -                                                  | -                                                                                 |

:::note
`SQL SECURITY NONE` は非推奨のオプションです。`SQL SECURITY NONE` でビューを作成する権限を持つ任意のユーザーは、任意のクエリを実行できてしまいます。
したがって、このオプションを使用してビューを作成するには、`GRANT ALLOW SQL SECURITY NONE TO <user>` が必要です。
:::

`DEFINER` / `SQL SECURITY` が指定されていない場合、デフォルト値が使用されます:

* `SQL SECURITY`: 通常のビューでは `INVOKER`、マテリアライズドビューでは `DEFINER`（[設定で変更可能](../../../operations/settings/settings.md#default_normal_view_sql_security)）
* `DEFINER`: `CURRENT_USER`（[設定で変更可能](../../../operations/settings/settings.md#default_view_definer)）

`DEFINER` / `SQL SECURITY` を指定せずにビューがアタッチされた場合、マテリアライズドビューではデフォルト値は `SQL SECURITY NONE`、通常のビューでは `SQL SECURITY INVOKER` になります。

既存のビューの SQL セキュリティを変更するには、次を使用します

```sql
ALTER TABLE MODIFY SQL SECURITY { DEFINER | INVOKER | NONE } [DEFINER = { user | CURRENT_USER }]
```


### 使用例 \{#examples\}

```sql
CREATE VIEW test_view
DEFINER = alice SQL SECURITY DEFINER
AS SELECT ...
```

```sql
CREATE VIEW test_view
SQL SECURITY INVOKER
AS SELECT ...
```


## ライブビュー \{#live-view\}

<DeprecatedBadge/>

この機能は非推奨となっており、将来削除される予定です。

参考までに、旧ドキュメントは[こちら](https://pastila.nl/?00f32652/fdf07272a7b54bda7e13b919264e449f.md)にあります。

## リフレッシャブルmaterialized view \{#refreshable-materialized-view\}

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
REFRESH EVERY|AFTER interval [OFFSET interval]
[RANDOMIZE FOR interval]
[DEPENDS ON [db.]name [, [db.]name [, ...]]]
[SETTINGS name = value [, name = value [, ...]]]
[APPEND]
[TO[db.]name] [(columns)] [ENGINE = engine]
[EMPTY]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

ここで、`interval` は一連の単純なインターバルです。

```sql
number SECOND|MINUTE|HOUR|DAY|WEEK|MONTH|YEAR
```

対応するクエリを定期的に実行し、その結果をテーブルに保存します。

* クエリに `APPEND` が指定されている場合、各リフレッシュで既存の行を削除せずにテーブルに行を挿入します。挿入は通常の INSERT SELECT と同様にアトミックではありません。
* それ以外の場合、各リフレッシュでテーブルの以前の内容をアトミックに置き換えます。

通常の（リフレッシュ非対応の）マテリアライズドビューとの違い:

* 挿入トリガーはありません。つまり、SELECT で指定されたテーブルに新しいデータが挿入されても、それが自動的にリフレッシュ可能なマテリアライズドビューに反映されることは *ありません*。定期的なリフレッシュ時に、クエリ全体が実行されます。
* SELECT クエリに制限はありません。テーブル関数（例: `url()`）、ビュー、UNION、JOIN などがすべて利用可能です。

:::note
クエリ中の `REFRESH ... SETTINGS` 部分にある設定はリフレッシュに関する設定（例: `refresh_retries`）であり、通常の設定（例: `max_threads`）とは異なります。通常の設定はクエリ末尾の `SETTINGS`で指定できます。
:::


### リフレッシュスケジュール \{#refresh-schedule\}

リフレッシュスケジュールの例:

```sql
REFRESH EVERY 1 DAY -- every day, at midnight (UTC)
REFRESH EVERY 1 MONTH -- on 1st day of every month, at midnight
REFRESH EVERY 1 MONTH OFFSET 5 DAY 2 HOUR -- on 6th day of every month, at 2:00 am
REFRESH EVERY 2 WEEK OFFSET 5 DAY 15 HOUR 10 MINUTE -- every other Saturday, at 3:10 pm
REFRESH EVERY 30 MINUTE -- at 00:00, 00:30, 01:00, 01:30, etc
REFRESH AFTER 30 MINUTE -- 30 minutes after the previous refresh completes, no alignment with time of day
-- REFRESH AFTER 1 HOUR OFFSET 1 MINUTE -- syntax error, OFFSET is not allowed with AFTER
REFRESH EVERY 1 WEEK 2 DAYS -- every 9 days, not on any particular day of the week or month;
                            -- specifically, when day number (since 1969-12-29) is divisible by 9
REFRESH EVERY 5 MONTHS -- every 5 months, different months each year (as 12 is not divisible by 5);
                       -- specifically, when month number (since 1970-01) is divisible by 5
```

`RANDOMIZE FOR` は各リフレッシュの実行時刻をランダム化します。例えば:

```sql
REFRESH EVERY 1 DAY OFFSET 2 HOUR RANDOMIZE FOR 1 HOUR -- every day at random time between 01:30 and 02:30
```

特定のビューについて、同時に実行できるリフレッシュは最大でも 1 つだけです。たとえば、`REFRESH EVERY 1 MINUTE` を指定したビューのリフレッシュに 2 分かかる場合、実際には 2 分ごとにリフレッシュされることになります。その後、処理が高速化されて 10 秒でリフレッシュできるようになった場合は、再び 1 分ごとのリフレッシュに戻ります。（特に、スケジュールどおりに行えなかったリフレッシュを取り戻すために 10 秒ごとにリフレッシュされることはなく、そのようなバックログの概念もありません。）

さらに、`CREATE` クエリで `EMPTY` が指定されていない限り、マテリアライズドビューが作成されると直ちにリフレッシュが開始されます。`EMPTY` が指定されている場合、最初のリフレッシュはスケジュールに従って行われます。


### Replicated DB において \{#in-replicated-db\}

リフレッシュ可能なマテリアライズドビューが [Replicated database](../../../engines/database-engines/replicated.md) 内にある場合、各レプリカは互いに調整し、各スケジュールされた時刻には 1 つのレプリカだけがリフレッシュを実行するようにします。[ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) テーブルエンジンが必須であり、これによりすべてのレプリカがリフレッシュによって生成されたデータを参照できます。

`APPEND` モードでは、`SETTINGS all_replicas = 1` を使用して調整を無効化できます。これにより、レプリカは互いに独立してリフレッシュを実行します。この場合、ReplicatedMergeTree は必須ではありません。

非 `APPEND` モードでは、協調リフレッシュのみがサポートされます。協調なしで実行したい場合は、`Atomic` データベースと `CREATE ... ON CLUSTER` クエリを使用して、すべてのレプリカ上にリフレッシュ可能なマテリアライズドビューを作成します。

調整は Keeper を通じて行われます。znode パスは、[default_replica_path](../../../operations/server-configuration-parameters/settings.md#default_replica_path) サーバー設定によって決まります。

### 依存関係 \{#refresh-dependencies\}

`DEPENDS ON` は、異なるテーブルのリフレッシュを同期します。例として、2 つのリフレッシュ可能なマテリアライズドビューが連なったチェーン構造になっているとします。

```sql
CREATE MATERIALIZED VIEW source REFRESH EVERY 1 DAY AS SELECT * FROM url(...)
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY AS SELECT ... FROM source
```

`DEPENDS ON` を指定しない場合、両方のビューは深夜にリフレッシュを開始し、`destination` には通常、`source` 内の前日分のデータが見えることになります。依存関係を追加すると、次のようになります：

```sql
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY DEPENDS ON source AS SELECT ... FROM source
```

この場合、その日の `source` のリフレッシュが完了してからでないと `destination` のリフレッシュは開始されないため、`destination` は最新のデータに基づくことになります。

別の方法として、同じ結果を次のようにしても得られます。

```sql
CREATE MATERIALIZED VIEW destination REFRESH AFTER 1 HOUR DEPENDS ON source AS SELECT ... FROM source
```

ここで、`1 HOUR` には `source` のリフレッシュ周期よりも短い任意の期間を指定できます。従属テーブルが、その依存先より高頻度でリフレッシュされることはありません。これは、実際のリフレッシュ周期を一度だけ指定して、リフレッシュ可能なビューのチェーンを構成する有効な方法です。

いくつか追加の例を示します:

* `REFRESH EVERY 1 DAY OFFSET 10 MINUTE` (`destination`) が `REFRESH EVERY 1 DAY` (`source`) に依存する場合<br />
  `source` のリフレッシュに 10 分以上かかると、`destination` はそれが終わるまで待機します。
* `REFRESH EVERY 1 DAY OFFSET 1 HOUR` が `REFRESH EVERY 1 DAY OFFSET 23 HOUR` に依存する場合<br />
  上記と同様ですが、対応するリフレッシュが異なる暦日で発生する点が異なります。
  日 X+1 における `destination` のリフレッシュは、日 X における `source` のリフレッシュが完了するまで待機します（それに 2 時間以上かかる場合）。
* `REFRESH EVERY 2 HOUR` が `REFRESH EVERY 1 HOUR` に依存する場合<br />
  2 HOUR のリフレッシュは、1 時間おきに 1 HOUR のリフレッシュの後で実行されます。例えば、真夜中の
  リフレッシュの後、その次は午前 2 時のリフレッシュの後、というように続きます。
* `REFRESH EVERY 1 MINUTE` が `REFRESH EVERY 2 HOUR` に依存する場合<br />
  `REFRESH AFTER 1 MINUTE` が `REFRESH EVERY 2 HOUR` に依存する場合<br />
  `REFRESH AFTER 1 MINUTE` が `REFRESH AFTER 2 HOUR` に依存する場合<br />
  `destination` は、すべての `source` のリフレッシュごとに 1 回リフレッシュされます。つまり 2 時間ごとです。`1 MINUTE` は実質的に無視されます。
* `REFRESH AFTER 1 HOUR` が `REFRESH AFTER 1 HOUR` に依存する場合<br />
  現在、これは推奨されません。

:::note
`DEPENDS ON` は、リフレッシュ可能なマテリアライズドビュー同士でのみ機能します。`DEPENDS ON` のリストに通常のテーブルを指定すると、そのビューは一度もリフレッシュされなくなります（依存関係は `ALTER` で削除できます。後述を参照してください）。
:::


### 設定 \{#settings\}

利用可能なリフレッシュ設定:

* `refresh_retries` - リフレッシュクエリが例外で失敗した場合に再試行する回数。すべての再試行が失敗した場合、次のスケジュールされたリフレッシュ時刻までスキップします。0 は再試行なし、-1 は無制限に再試行することを意味します。デフォルト: 0。
* `refresh_retry_initial_backoff_ms` - `refresh_retries` が 0 でない場合の、最初の再試行までの遅延。以降の再試行ごとに、この遅延は 2 倍になり、`refresh_retry_max_backoff_ms` まで増加します。デフォルト: 100 ms。
* `refresh_retry_max_backoff_ms` - リフレッシュ試行間の遅延の指数的な増加に対する上限。デフォルト: 60000 ms（1 分）。

### リフレッシュパラメータの変更 \{#changing-refresh-parameters\}

リフレッシュパラメータを変更するには、次のようにします。

```sql
ALTER TABLE [db.]name MODIFY REFRESH EVERY|AFTER ... [RANDOMIZE FOR ...] [DEPENDS ON ...] [SETTINGS ...]
```

:::note
これは、スケジュール、依存関係、設定、および APPEND モードかどうかを含む *すべて* のリフレッシュパラメータを一括で置き換えます。たとえばテーブルに `DEPENDS ON` がある状態で、`DEPENDS ON` を指定せずに `MODIFY REFRESH` を実行すると、その依存関係は削除されます。
:::


### その他の操作 \{#other-operations\}

すべてのリフレッシャブルmaterialized viewのステータスは、テーブル [`system.view_refreshes`](../../../operations/system-tables/view_refreshes.md) で確認できます。特に、（実行中であれば）リフレッシュの進捗状況、直近および次回のリフレッシュ時刻、リフレッシュが失敗した場合の例外メッセージが含まれます。

リフレッシュを手動で停止、開始、トリガー、キャンセルするには、[`SYSTEM STOP|START|REFRESH|WAIT|CANCEL VIEW`](../system.md#refreshable-materialized-views) を使用します。

リフレッシュが完了するまで待機するには、[`SYSTEM WAIT VIEW`](../system.md#refreshable-materialized-views) を使用します。特に、ビュー作成後の初回リフレッシュ完了を待つ場合に有用です。

:::note
豆知識: リフレッシュクエリは、リフレッシュ対象のビューから読み取ることができ、その場合はリフレッシュ前のバージョンのデータが見えます。これは、Conway's Game of Life（ライフゲーム）を実装できることを意味します: https://pastila.nl/?00021a4b/d6156ff819c83d490ad2dcec05676865#O0LGWTO7maUQIA4AcGUtlA==
:::

## ウィンドウビュー \{#window-view\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

:::info
これは実験的な機能であり、将来のリリースで後方互換性のない形で変更される可能性があります。ウィンドウビューおよび `WATCH` クエリを使用するには、[allow&#95;experimental&#95;window&#95;view](/operations/settings/settings#allow_experimental_window_view) 設定を有効にしてください。`set allow_experimental_window_view = 1` コマンドを実行します。
:::

```sql
CREATE WINDOW VIEW [IF NOT EXISTS] [db.]table_name [TO [db.]table_name] [INNER ENGINE engine] [ENGINE engine] [WATERMARK strategy] [ALLOWED_LATENESS interval_function] [POPULATE]
AS SELECT ...
GROUP BY time_window_function
[COMMENT 'comment']
```

Window view は、時間ウィンドウごとにデータを集約し、ウィンドウがトリガーされる準備が整った時点で結果を出力できます。レイテンシーを下げるために、中間の集約結果を内部（または指定された）テーブルに保存し、処理結果を指定したテーブルにプッシュしたり、WATCH クエリを使用して通知をプッシュしたりできます。

Window view の作成方法は `MATERIALIZED VIEW` の作成と似ています。Window view では、中間データを保存するための内部ストレージエンジンが必要です。`INNER ENGINE` 句を使用して内部ストレージを指定でき、指定がない場合は `AggregatingMergeTree` がデフォルトの内部エンジンとして使用されます。

`TO [db].[table]` を指定せずに window view を作成する場合は、データを保存するテーブルエンジンとして `ENGINE` を必ず指定する必要があります。


### Time Window Functions \{#time-window-functions\}

[Time window functions](../../functions/time-window-functions.md) は、レコードが属する時間ウィンドウの下限境界と上限境界を取得するために使用されます。Window view を使用する際は、time window function を必ず併用します。

### TIME ATTRIBUTES \{#time-attributes\}

Window view は **processing time** と **event time** の 2 種類の処理に対応しています。

**Processing time** は、ローカルマシンの時刻に基づいて window view が結果を生成できるようにするもので、デフォルトで使用されます。最も単純な時間の概念ですが、決定的な結果を保証するものではありません。Processing time 属性は、time window function の `time_attr` をテーブル列に設定するか、関数 `now()` を使用することで定義できます。次のクエリは、processing time を用いた window view を作成します。

```sql
CREATE WINDOW VIEW wv AS SELECT count(number), tumbleStart(w_id) as w_start from date GROUP BY tumble(now(), INTERVAL '5' SECOND) as w_id
```

**イベント時刻 (event time)** は、各イベントが生成元デバイス上で実際に発生した時刻です。この時刻は通常、レコードが生成される際にそのレコード内に埋め込まれます。イベント時刻に基づいて処理を行うことで、順序が前後したイベントや遅延して到着するイベントが存在する場合でも、一貫した結果を得ることができます。Window View は `WATERMARK` 構文を使用することで、イベント時刻処理をサポートします。

Window View では、次の 3 種類のウォーターマーク戦略を提供します。

* `STRICTLY_ASCENDING`: これまでに観測された最大のタイムスタンプをウォーターマークとして出力します。タイムスタンプがこの最大値より小さい行は、遅延したとはみなされません。
* `ASCENDING`: これまでに観測された最大のタイムスタンプから 1 を引いた値をウォーターマークとして出力します。タイムスタンプがこの最大値以下の行は、遅延したとはみなされません。
* `BOUNDED`: `WATERMARK=INTERVAL`。指定された遅延時間を、これまでに観測された最大のタイムスタンプから差し引いた値をウォーターマークとして出力します。

次のクエリは、`WATERMARK` を使用して Window View を作成する例です。

```sql
CREATE WINDOW VIEW wv WATERMARK=STRICTLY_ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=INTERVAL '3' SECOND AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
```

デフォルトでは、ウィンドウはウォーターマークが到達したときにトリガーされ、ウォーターマークより後に到着した要素は破棄されます。Window view は、`ALLOWED_LATENESS=INTERVAL` を設定することで遅延イベントの処理をサポートします。遅延イベント処理の例は次のとおりです。

```sql
CREATE WINDOW VIEW test.wv TO test.dst WATERMARK=ASCENDING ALLOWED_LATENESS=INTERVAL '2' SECOND AS SELECT count(a) AS count, tumbleEnd(wid) AS w_end FROM test.mt GROUP BY tumble(timestamp, INTERVAL '5' SECOND) AS wid;
```

遅延して発火した際に出力される要素は、以前の計算結果が更新されたものとして扱う必要があります。ウィンドウの終了時に発火するのではなく、ウィンドウビューは遅延イベントが到着したタイミングで即座に発火します。そのため、同じウィンドウに対して複数の出力が生成されます。ユーザーはこれらの重複した結果を考慮に入れるか、重複排除する必要があります。

`ALTER TABLE ... MODIFY QUERY` ステートメントを使用することで、window view で指定された `SELECT` クエリを変更できます。新しい `SELECT` クエリによって得られるデータ構造は、`TO [db.]name` 句の有無にかかわらず、元の `SELECT` クエリのデータ構造と同一である必要があります。中間状態を再利用できないため、現在のウィンドウ内のデータは失われる点に注意してください。


### 新しいウィンドウの監視 \{#monitoring-new-windows\}

ウィンドウビューでは、変更を監視するために [WATCH](../../../sql-reference/statements/watch.md) クエリを使用するか、`TO` 構文を用いて結果をテーブルに出力できます。

```sql
WATCH [db.]window_view
[EVENTS]
[LIMIT n]
[FORMAT format]
```

`LIMIT` を指定すると、クエリを終了するまでに受信する更新の回数を設定できます。`EVENTS` 句を使用すると、クエリ結果そのものではなく最新のクエリのウォーターマークのみを取得する、`WATCH` クエリの簡略版を利用できます。


### 設定 \{#settings-1\}

* `window_view_clean_interval`: 古いデータを削除するための、ウィンドウビューのクリーンアップ間隔（秒）です。システムは、システム時刻または `WATERMARK` の設定に従ってまだ完全にはトリガーされていないウィンドウを保持し、それ以外のデータを削除します。
* `window_view_heartbeat_interval`: `WATCH` クエリが実行中であることを示すためのハートビート送信間隔（秒）です。
* `wait_for_window_view_fire_signal_timeout`: イベントタイム処理において、ウィンドウビューの発火シグナルを待機する際のタイムアウトです。

### 例 \{#example\}

`data` というログテーブルで 10 秒ごとのクリックログの件数を集計する必要があるとし、そのテーブル構造は次のようになっているとします。

```sql
CREATE TABLE data ( `id` UInt64, `timestamp` DateTime) ENGINE = Memory;
```

まず、10 秒間隔のタンブリングウィンドウを持つウィンドウビューを作成します。

```sql
CREATE WINDOW VIEW wv as select count(id), tumbleStart(w_id) as window_start from data group by tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

次に、結果を取得するために `WATCH` クエリを実行します。

```sql
WATCH wv
```

ログが `data` テーブルに挿入されると、

```sql
INSERT INTO data VALUES(1,now())
```

`WATCH` クエリは、結果を次のように出力します。

```text
┌─count(id)─┬────────window_start─┐
│         1 │ 2020-01-14 16:56:40 │
└───────────┴─────────────────────┘
```

別の方法として、`TO` 構文を使用して結果を別のテーブルに出力することもできます。

```sql
CREATE WINDOW VIEW wv TO dst AS SELECT count(id), tumbleStart(w_id) as window_start FROM data GROUP BY tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

追加の例は ClickHouse の stateful テスト内にあり、そこでは `*window_view*` という名前が付けられています。


### Window View の使用方法 \{#window-view-usage\}

Window View は次のようなシナリオで有用です。

* **Monitoring**: メトリクスログを時間単位で集計・計算し、その結果をターゲットテーブルに出力します。ダッシュボードはターゲットテーブルをソーステーブルとして利用できます。
* **Analyzing**: 時間ウィンドウ内のデータを自動的に集計および前処理します。これは大量のログを分析する際に有用です。前処理によって複数のクエリにおける繰り返し計算が不要になり、クエリのレイテンシを低減できます。

## 関連コンテンツ \{#related-content\}

- ブログ: [ClickHouse における時系列データの扱い方](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- ブログ: [ClickHouse を用いたオブザーバビリティソリューションの構築 第2部: トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)

## 一時ビュー \{#temporary-views\}

ClickHouse は、以下の特徴を持つ **一時ビュー (temporary view)** をサポートします（該当する場合は一時テーブルと同様の挙動になります）。

* **セッションの存続期間**
  一時ビューは現在のセッションの期間中のみ存在します。セッション終了時に自動的に削除されます。

* **データベースなし**
  一時ビューをデータベース名で修飾することは **できません**。一時ビューはデータベースの外側（セッションのネームスペース）に存在します。

* **非レプリケート / ON CLUSTER 不可**
  一時オブジェクトはセッションローカルであり、`ON CLUSTER` を指定して作成することは **できません**。

* **名前解決**
  一時オブジェクト（テーブルまたはビュー）が永続オブジェクトと同じ名前を持ち、クエリがその名前をデータベース名 **なしで** 参照した場合は、**一時** オブジェクトが使用されます。

* **論理オブジェクト（ストレージなし）**
  一時ビューは、その `SELECT` テキストのみを保存します（内部的には `View` ストレージを使用します）。データは永続化されず、`INSERT` を受け付けることもできません。

* **Engine 句**
  `ENGINE` を指定する必要は **ありません**。`ENGINE = View` として指定された場合でも無視され、同じ論理ビューとして扱われます。

* **セキュリティ / 権限**
  一時ビューの作成には `CREATE TEMPORARY VIEW` 権限が必要ですが、これは `CREATE VIEW` によって暗黙的に付与されます。

* **SHOW CREATE**
  一時ビューの DDL を出力するには、`SHOW CREATE TEMPORARY VIEW view_name;` を使用します。

### 構文 \{#temporary-views-syntax\}

```sql
CREATE TEMPORARY VIEW [IF NOT EXISTS] view_name AS <select_query>
```

`OR REPLACE` は一時テーブルとの整合性を保つため、一時ビューでは**サポートされていません**。一時ビューを「置き換える」必要がある場合は、削除してから再作成してください。


### 例 \{#temporary-views-examples\}

一時ソーステーブルを作成し、その上に一時ビューを作成します:

```sql
CREATE TEMPORARY TABLE t_src (id UInt32, val String);
INSERT INTO t_src VALUES (1, 'a'), (2, 'b');

CREATE TEMPORARY VIEW tview AS
SELECT id, upper(val) AS u
FROM t_src
WHERE id <= 2;

SELECT * FROM tview ORDER BY id;
```

DDL を表示するには:

```sql
SHOW CREATE TEMPORARY VIEW tview;
```

削除します:

```sql
DROP TEMPORARY VIEW IF EXISTS tview;  -- temporary views are dropped with TEMPORARY TABLE syntax
```


### 禁止事項 / 制限事項 \{#temporary-views-limitations\}

* `CREATE OR REPLACE TEMPORARY VIEW ...` → **使用不可**（`DROP` + `CREATE` を使用してください）。
* `CREATE TEMPORARY MATERIALIZED VIEW ...` / `WINDOW VIEW` → **使用不可**。
* `CREATE TEMPORARY VIEW db.view AS ...` → **使用不可**（データベース修飾子は使用できません）。
* `CREATE TEMPORARY VIEW view ON CLUSTER 'name' AS ...` → **使用不可**（一時オブジェクトはセッションローカルなものです）。
* `POPULATE`、`REFRESH`、`TO [db.table]`、内部エンジン、およびすべての MV 固有の句 → 一時ビューには **適用されません**。

### 分散クエリに関する注意事項 \{#temporary-views-distributed-notes\}

一時 **ビュー** は単なる定義であり、実際に転送されるデータはありません。一時ビューが一時 **テーブル**（例: `Memory`）を参照している場合、そのデータは分散クエリの実行時に、一時テーブルと同様の方法でリモートサーバーに転送されます。

#### 例 \{#temporary-views-distributed-example\}

```sql
-- A session-scoped, in-memory table
CREATE TEMPORARY TABLE temp_ids (id UInt64) ENGINE = Memory;

INSERT INTO temp_ids VALUES (1), (5), (42);

-- A session-scoped view over the temp table (purely logical)
CREATE TEMPORARY VIEW v_ids AS
SELECT id FROM temp_ids;

-- Replace 'test' with your cluster name.
-- GLOBAL JOIN forces ClickHouse to *ship* the small join-side (temp_ids via v_ids)
-- to every remote server that executes the left side.
SELECT count()
FROM cluster('test', system.numbers) AS n
GLOBAL ANY INNER JOIN v_ids USING (id)
WHERE n.number < 100;

```

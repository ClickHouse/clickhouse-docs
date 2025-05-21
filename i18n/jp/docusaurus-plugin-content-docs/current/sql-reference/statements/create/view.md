---
description: 'CREATE VIEWに関するドキュメンテーション'
sidebar_label: 'VIEW'
sidebar_position: 37
slug: /sql-reference/statements/create/view
title: 'CREATE VIEW'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# CREATE VIEW

新しいビューを作成します。ビューは、[通常の](#normal-view)、[マテリアライズド](#materialized-view)、[リフレッシュ可能なマテリアライズド](#refreshable-materialized-view)、および[ウィンドウ](/sql-reference/statements/create/view#window-view)に分類されます（リフレッシュ可能なマテリアライズドビューとウィンドウビューは実験的な機能です）。

## Normal View {#normal-view}

構文:

```sql
CREATE [OR REPLACE] VIEW [IF NOT EXISTS] [db.]table_name [(alias1 [, alias2 ...])] [ON CLUSTER cluster_name]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

通常のビューはデータを保持しません。アクセスするたびに別のテーブルからの読み取りのみを行います。言い換えれば、通常のビューはただの保存されたクエリです。ビューから読み取るとき、この保存されたクエリは[FROM](../../../sql-reference/statements/select/from.md)句のサブクエリとして使用されます。

例として、ビューを作成したと仮定します:

```sql
CREATE VIEW view AS SELECT ...
```

そしてクエリを書きます:

```sql
SELECT a, b, c FROM view
```

このクエリは、サブクエリを使用する場合と完全に同等です:

```sql
SELECT a, b, c FROM (SELECT ...)
```

## Parameterized View {#parameterized-view}

パラメータ化されたビューは通常のビューに似ていますが、パラメータを指定することができ、これらは即座には解決されません。これらのビューはテーブル関数とともに使用することができ、テーブル関数はビューの名前を関数名として指定し、パラメータ値を引数として使用します。

```sql
CREATE VIEW view AS SELECT * FROM TABLE WHERE Column1={column1:datatype1} and Column2={column2:datatype2} ...
```
上記は、パラメータを置き換えることでテーブル関数として使用可能なビューを作成します。

```sql
SELECT * FROM view(column1=value1, column2=value2 ...)
```

## Materialized View {#materialized-view}

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster_name] [TO[db.]name [(columns)]] [ENGINE = engine] [POPULATE]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

:::tip
こちらは[マテリアライズドビュー](/guides/developer/cascading-materialized-views.md)の使用に関するステップバイステップガイドです。
:::

マテリアライズドビューは、対応する[SELECT](../../../sql-reference/statements/select/index.md)クエリによって変換されたデータを保持します。

`TO [db].[table]`なしでマテリアライズドビューを作成する場合、データを保持するためのテーブルエンジンを指定する必要があります。

`TO [db].[table]`を使用してマテリアライズドビューを作成する場合、`POPULATE`を使用することはできません。

マテリアライズドビューは次のように実装されます: `SELECT`で指定されたテーブルにデータを挿入する際、挿入されたデータの一部がこの`SELECT`クエリによって変換され、その結果がビューに挿入されます。

:::note
ClickHouseのマテリアライズドビューは、宛先テーブルへの挿入時に**カラム名**をカラムの順序の代わりに使用します。`SELECT`クエリの結果にカラム名が存在しない場合でも、ClickHouseはデフォルト値を使用します。コードが[Nullable](../../data-types/nullable.md)でない場合でも同様です。したがって、マテリアライズドビューを使用する際には、すべてのカラムにエイリアスを追加することをお勧めします。

ClickHouseのマテリアライズドビューは、挿入トリガーのように実装されています。ビュークエリに集約がある場合、それは新たに挿入されたデータのバッチにのみ適用されます。元のテーブルの既存データ（更新、削除、パーティションの削除など）に対する変更は、マテリアライズドビューには影響を与えません。

ClickHouseのマテリアライズドビューは、エラーが発生した場合に決定論的な動作をしません。これは、すでに書き込まれたブロックは宛先テーブルに保持されますが、エラー後のすべてのブロックは書き込まれなくなることを意味します。

デフォルトでは、ビューへのプッシュが失敗すると、INSERTクエリも失敗し、いくつかのブロックが宛先テーブルに書き込まれない可能性があります。これを変更するには、`materialized_views_ignore_errors`設定を使用します（INSERTクエリに対して設定する必要があります）。`materialized_views_ignore_errors=true`を設定すると、ビューへのプッシュ中のエラーは無視され、すべてのブロックが宛先テーブルに書き込まれます。

また、`materialized_views_ignore_errors`は`system.*_log`テーブルに対してデフォルトで`true`に設定されています。
:::

`POPULATE`を指定すると、ビュー作成時に既存のテーブルデータがビューに挿入され、`CREATE TABLE ... AS SELECT ...`のようになります。それ以外の場合、クエリにはビュー作成後にテーブルに挿入されたデータのみが含まれます。ビュー作成時にテーブルに挿入されたデータはビューには挿入されないため、`POPULATE`の使用は**推奨されません**。

:::note
`POPULATE`は、`CREATE TABLE ... AS SELECT ...`のように機能するため、制限があります：
- 複製データベースではサポートされていません
- ClickHouseクラウドではサポートされていません

その代わりに、別の`INSERT ... SELECT`を使用できます。
:::

`SELECT`クエリには`DISTINCT`、`GROUP BY`、`ORDER BY`、`LIMIT`を含むことができます。対応する変換は、挿入されたデータの各ブロックごとに独立して実行されます。たとえば、`GROUP BY`が設定されている場合、データは挿入中に集約されますが、挿入されたデータの単一のパケット内でのみ集約されます。さらに集約されることはありません。例外は、`SummingMergeTree`のように独自にデータ集約を実行する`ENGINE`を使用する場合です。

マテリアライズドビューに対する[ALTER](/sql-reference/statements/alter/view.md)クエリの実行には制限があります。たとえば、`SELECT`クエリを更新することはできません。このため、不便に感じるかもしれません。マテリアライズドビューが`TO [db.]name`構文を使用している場合、ビューを`DETACH`して、ターゲットテーブルの`ALTER`を実行し、その後、以前にデタッチされた（`DETACH`）ビューを`ATTACH`できます。

マテリアライズドビューは[optimize_on_insert](/operations/settings/settings#optimize_on_insert)設定の影響を受けることに注意してください。データはビュー挿入の前にマージされます。

ビューは通常のテーブルと同様に見えます。たとえば、`SHOW TABLES`クエリの結果にリストされます。

ビューを削除するには[DROP VIEW](../../../sql-reference/statements/drop.md#drop-view)を使用します。また、`DROP TABLE`はVIEWにも機能します。

## SQL security {#sql_security}

`DEFINER`と`SQL SECURITY`を使用して、ビューの基になるクエリを実行する際に使用するClickHouseユーザーを指定できます。
`SQL SECURITY`には、`DEFINER`、`INVOKER`、または`NONE`の3つの有効な値があります。`DEFINER`句で任意の既存のユーザーまたは`CURRENT_USER`を指定できます。

次の表は、ビューから選択するためにどのユーザーにどの権限が必要かを説明しています。SQLセキュリティオプションに関係なく、常に`GRANT SELECT ON <view>`を持っていることが必要です。

| SQL security option | View                                                            | Materialized View                                                                                                 |
|---------------------|-----------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| `DEFINER alice`     | `alice`はビューのソーステーブルに対して`SELECT`権限を持っている必要があります。 | `alice`はビューのソーステーブルに対して`SELECT`権限を持ち、ビューのターゲットテーブルに対して`INSERT`権限を持っている必要があります。 |
| `INVOKER`           | ユーザーはビューのソーステーブルに対して`SELECT`権限を持っている必要があります。    | `SQL SECURITY INVOKER`はマテリアライズドビューに対して指定できません。                                                 |
| `NONE`              | -                                                               | -                                                                                                                 |

:::note
`SQL SECURITY NONE`は非推奨のオプションです。`SQL SECURITY NONE`でビューを作成する権限がある任意のユーザーは、任意のクエリを実行できるようになります。
したがって、このオプションでビューを作成するには、`GRANT ALLOW SQL SECURITY NONE TO <user>`が必要です。
:::

`DEFINER`/`SQL SECURITY`が指定されていない場合、デフォルト値が使用されます：
- `SQL SECURITY`：通常のビューでは`INVOKER`、マテリアライズドビューでは`DEFINER`（[設定で構成可能](../../../operations/settings/settings.md#default_normal_view_sql_security)）
- `DEFINER`：`CURRENT_USER`（[設定で構成可能](../../../operations/settings/settings.md#default_view_definer)）

ビューが`DEFINER`/`SQL SECURITY`を指定せずに添付されている場合、デフォルト値はマテリアライズドビューに対して`SQL SECURITY NONE`、通常のビューに対して`SQL SECURITY INVOKER`です。

既存のビューのSQLセキュリティを変更するには、次のようにします:
```sql
ALTER TABLE MODIFY SQL SECURITY { DEFINER | INVOKER | NONE } [DEFINER = { user | CURRENT_USER }]
```

### Examples {#examples}
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

## Live View {#live-view}

<DeprecatedBadge/>

この機能は非推奨であり、今後削除される予定です。

旧ドキュメンテーションは[こちら](https://pastila.nl/?00f32652/fdf07272a7b54bda7e13b919264e449f.md)にあります。

## Refreshable Materialized View {#refreshable-materialized-view}

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
ここで、`interval`は単純なインターバルのシーケンスです:
```sql
number SECOND|MINUTE|HOUR|DAY|WEEK|MONTH|YEAR
```

一定間隔で対応するクエリを実行し、その結果をテーブルに保存します。
 * クエリが`APPEND`を指定している場合、各リフレッシュは既存の行を削除せずにテーブルに行を挿入します。この挿入は原子性を持たず、通常のINSERT SELECTと同様です。
 * それ以外の場合、各リフレッシュはテーブルの前回の内容を原子性を持って置き換えます。

通常のリフレッシュ可能でないマテリアライズドビューとの違い:
 * 挿入トリガーがありません。つまり、`SELECT`に指定されたテーブルに新しいデータが挿入されても、そのデータはリフレッシュ可能なマテリアライズドビューには自動的にプッシュされません。定期的なリフレッシュは、全体のクエリを実行します。
 * SELECTクエリに対する制限がありません。テーブル関数（例: `url()`）、ビュー、UNION、JOINはすべて許可されています。

:::note
クエリの`REFRESH ... SETTINGS`部分の設定はリフレッシュ設定（例: `refresh_retries`）であり、通常の設定（例: `max_threads`）とは異なります。通常の設定は、クエリの最後に`SETTINGS`を使用して指定できます。
:::

### Refresh Schedule {#refresh-schedule}

例: リフレッシュスケジュール:
```sql
REFRESH EVERY 1 DAY -- 毎日、真夜中（UTC）
REFRESH EVERY 1 MONTH -- 毎月の1日、真夜中
REFRESH EVERY 1 MONTH OFFSET 5 DAY 2 HOUR -- 毎月の6日、午前2時
REFRESH EVERY 2 WEEK OFFSET 5 DAY 15 HOUR 10 MINUTE -- 毎週土曜日、午後3時10分
REFRESH EVERY 30 MINUTE -- 00:00, 00:30, 01:00, 01:30など
REFRESH AFTER 30 MINUTE -- 前回のリフレッシュ完了から30分後、時間調整なし
-- REFRESH AFTER 1 HOUR OFFSET 1 MINUTE -- 構文エラー、OFFSETはAFTERで使用できません
REFRESH EVERY 1 WEEK 2 DAYS -- 9日ごと、特定の曜日や月ではなく
                            -- 特に、日数（1969-12-29からの）で9で割り切れる場合
REFRESH EVERY 5 MONTHS -- 毎月5ヶ月ごと、毎年異なる月（12は5で割り切れないため）
                       -- 特に、月数（1970-01からの）で5で割り切れる場合
```

`RANDOMIZE FOR`は各リフレッシュの時間をランダムに調整します、例:
```sql
REFRESH EVERY 1 DAY OFFSET 2 HOUR RANDOMIZE FOR 1 HOUR -- 毎日、01:30から02:30の間のランダムな時間
```

リフレッシュが一度に1つのみ実行できるビューに対して。たとえば、`REFRESH EVERY 1 MINUTE`のビューがリフレッシュに2分かかる場合、それは2分おきにリフレッシュします。もしそれが速くなり、10秒でリフレッシュされるようになると、再び1分間隔でリフレッシュされます（特に、失われたリフレッシュのバックログを埋めるために、10秒ごとにリフレッシュされることはありません - そのようなバックログはありません）。

さらに、マテリアライズドビュー作成後にすぐにリフレッシュが開始されますが、`CREATE`クエリで`EMPTY`が指定されている場合を除きます。`EMPTY`が指定されている場合、最初のリフレッシュはスケジュールに従って行われます。

### In Replicated DB {#in-replicated-db}

リフレッシュ可能なマテリアライズドビューが[複製データベース](../../../engines/database-engines/replicated.md)に存在する場合、レプリカは相互に調整し、各スケジュールされた時間に1つのレプリカだけがリフレッシュを実行します。[ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md)テーブルエンジンが必要なため、すべてのレプリカはリフレッシュにより生成されたデータを参照します。

`APPEND`モードでは、`SETTINGS all_replicas = 1`を使用してコーディネーションを無効にできます。これにより、レプリカは相互に独立してリフレッシュを実行します。この場合、ReplicatedMergeTreeは必要ありません。

非`APPEND`モードでは、調整されたリフレッシュのみがサポートされます。非調整を行うには、Atomicデータベースと`CREATE ... ON CLUSTER`クエリを使用して、すべてのレプリカにリフレッシュ可能なマテリアライズドビューを作成します。

調整はKeeperを通じて行われます。znodeパスは[default_replica_path](../../../operations/server-configuration-parameters/settings.md#default_replica_path)サーバー設定によって決定されます。

### Dependencies {#refresh-dependencies}

`DEPENDS ON`は異なるテーブルのリフレッシュを同期します。例として、2つのリフレッシュ可能なマテリアライズドビューのチェーンがあると仮定します:
```sql
CREATE MATERIALIZED VIEW source REFRESH EVERY 1 DAY AS SELECT * FROM url(...)
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY AS SELECT ... FROM source
```
`DEPENDS ON`なしでは、両方のビューが真夜中にリフレッシュを開始し、通常`destination`は`source`の昨日のデータを参照します。依存関係を追加すると:
```sql
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY DEPENDS ON source AS SELECT ... FROM source
```
この場合、`destination`のリフレッシュは、その日の`source`のリフレッシュが完了した後にのみ開始され、`destination`は新鮮なデータに基づくことになります。

同様の結果は次のように達成できます:
```sql
CREATE MATERIALIZED VIEW destination REFRESH AFTER 1 HOUR DEPENDS ON source AS SELECT ... FROM source
```
ここで、`1 HOUR`は`source`のリフレッシュ期間よりも短い任意の期間にすることができます。依存テーブルは、その依存関係よりも頻繁にはリフレッシュされません。これは依存関係の実際のリフレッシュ期間を何度も指定せずにリフレッシュ可能なビューのチェーンを設定する有効な方法です。

いくつかの例:
 * `REFRESH EVERY 1 DAY OFFSET 10 MINUTE`（`destination`）は`REFRESH EVERY 1 DAY`（`source`）に依存します。<br/>
   もし`source`のリフレッシュが10分以上かかる場合、`destination`はそれを待ちます。
 * `REFRESH EVERY 1 DAY OFFSET 1 HOUR`は`REFRESH EVERY 1 DAY OFFSET 23 HOUR`に依存します。<br/>
   上記のように、対応するリフレッシュは異なるカレンダー週に起こります。
   `destination`のリフレッシュはX+1日の`source`のリフレッシュを待っています（それが2時間以上かかる場合）。
 * `REFRESH EVERY 2 HOUR`は`REFRESH EVERY 1 HOUR`に依存します。<br/>
   2時間ごとのリフレッシュは、毎時1時間のリフレッシュ後に行われます（午前0時のリフレッシュ後、午前2時のリフレッシュ後など）。
 * `REFRESH EVERY 1 MINUTE`は`REFRESH EVERY 2 HOUR`に依存します。<br/>
   `REFRESH AFTER 1 MINUTE`は`REFRESH EVERY 2 HOUR`に依存します。<br/>
   `REFRESH AFTER 1 MINUTE`は`REFRESH AFTER 2 HOUR`に依存します。<br/>
   `destination`は、`source`のリフレッシュ後、つまり2時間ごとに1回リフレッシュされます。`1 MINUTE`は効果的に無視されます。
 * `REFRESH AFTER 1 HOUR`は`REFRESH AFTER 1 HOUR`に依存します。<br/>
   現在、これは推奨されていません。

:::note
`DEPENDS ON`はリフレッシュ可能なマテリアライズドビュー間でのみ機能します。リストに通常のテーブルが含まれている場合、ビューは決してリフレッシュされないことになります（依存関係は`ALTER`で削除できます、以下参照）。
:::

### Settings {#settings}

利用可能なリフレッシュ設定:
 * `refresh_retries` - リフレッシュクエリが例外で失敗した場合に再試行する回数。すべての再試行が失敗した場合、次の予定リフレッシュ時間にスキップします。0は再試行を行わない、-1は無限の再試行を意味します。デフォルト: 0。
 * `refresh_retry_initial_backoff_ms` - 最初の再試行前の遅延、`refresh_retries`がゼロでない場合。各再試行ごとに遅延が倍増し、`refresh_retry_max_backoff_ms`に達するまで遅延が続きます。デフォルト: 100 ms。
 * `refresh_retry_max_backoff_ms` - リフレッシュ試行の間の遅延の指数関数的増加に対する制限。デフォルト: 60000 ms（1分）。

### Changing Refresh Parameters {#changing-refresh-parameters}

リフレッシュパラメータを変更するには:
```sql
ALTER TABLE [db.]name MODIFY REFRESH EVERY|AFTER ... [RANDOMIZE FOR ...] [DEPENDS ON ...] [SETTINGS ...]
```

:::note
これはすべてのリフレッシュパラメータを一度に置き換えます：スケジュール、依存関係、設定、およびAPPEND状態。たとえば、テーブルに`DEPENDS ON`が含まれていた場合、`DEPENDS ON`なしで`MODIFY REFRESH`を実行すると依存関係は削除されます。
:::

### Other operations {#other-operations}

すべてのリフレッシュ可能なマテリアライズドビューのステータスはテーブル[`system.view_refreshes`](../../../operations/system-tables/view_refreshes.md)で確認できます。特に、リフレッシュ進行状況（実行中の場合）、最後のリフレッシュ時間、次のリフレッシュ時間、リフレッシュが失敗した場合の例外メッセージが含まれます。

手動でリフレッシュを停止、開始、トリガー、またはキャンセルするには[`SYSTEM STOP|START|REFRESH|WAIT|CANCEL VIEW`](../system.md#refreshable-materialized-views)を使用します。

リフレッシュが完了するまで待機するには[`SYSTEM WAIT VIEW`](../system.md#refreshable-materialized-views)を使用します。特に、ビュー作成後の最初のリフレッシュを待つ際に便利です。

:::note
面白い事実: リフレッシュクエリは、リフレッシュ中のビューから読むことを許可されており、データのプレリフレッシュバージョンを確認できます。これにより、コンウェイのライフゲームを実装できます: https://pastila.nl/?00021a4b/d6156ff819c83d490ad2dcec05676865#O0LGWTO7maUQIA4AcGUtlA==
:::

## Window View {#window-view}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::info
これは実験的な機能であり、今後のリリースにおいて後方互換性のない方法で変更される可能性があります。ウィンドウビューの使用と`WATCH`クエリを有効にするには、[allow_experimental_window_view](/operations/settings/settings#allow_experimental_window_view)設定を使用します。コマンド`set allow_experimental_window_view = 1`を入力します。
:::

```sql
CREATE WINDOW VIEW [IF NOT EXISTS] [db.]table_name [TO [db.]table_name] [INNER ENGINE engine] [ENGINE engine] [WATERMARK strategy] [ALLOWED_LATENESS interval_function] [POPULATE]
AS SELECT ...
GROUP BY time_window_function
[COMMENT 'comment']
```

ウィンドウビューは、時間ウィンドウによってデータを集約し、ウィンドウがトリガーされる準備が整ったときに結果を出力します。中間的な集約結果を内部（または指定された）テーブルに格納して待機時間を短縮し、処理結果を指定されたテーブルにプッシュしたり、`WATCH`クエリを使用して通知をプッシュできます。

ウィンドウビューの作成は`MATERIALIZED VIEW`の作成に似ています。ウィンドウビューには中間データを保持するための内部ストレージエンジンが必要です。内部ストレージは`INNER ENGINE`句を使用して指定可能で、デフォルトの内部エンジンとして`AggregatingMergeTree`が使用されます。

`TO [db].[table]`なしでウィンドウビューを作成する場合、データを保持するためのテーブルエンジンを指定する必要があります。

### Time Window Functions {#time-window-functions}

[時間ウィンドウ関数](../../functions/time-window-functions.md)は、レコードの下限と上限のウィンドウ境界を取得するために使用されます。ウィンドウビューは時間ウィンドウ関数と一緒に使用する必要があります。

### TIME ATTRIBUTES {#time-attributes}

ウィンドウビューは**処理時間**と**イベント時間**の処理をサポートします。

**処理時間**はウィンドウビューがローカルマシンの時間に基づいて結果を生成できるようにし、デフォルトで使用されます。これは最も単純な時間の概念ですが、決定論的ではありません。処理時間属性は、時間ウィンドウ関数の`time_attr`をテーブルのカラムに設定するか、`now()`関数を使用することで定義できます。次のクエリは処理時間のウィンドウビューを作成します。

```sql
CREATE WINDOW VIEW wv AS SELECT count(number), tumbleStart(w_id) as w_start from date GROUP BY tumble(now(), INTERVAL '5' SECOND) as w_id
```

**イベント時間**は、各イベントが生成デバイスで発生した時間です。この時間は通常、生成時にレコード内に埋め込まれます。イベント時間処理は、順序が乱れたイベントや遅れて到着するイベントが発生した場合でも、一貫した結果を提供します。ウィンドウビューは`WATERMARK`構文を使用してイベント時間処理をサポートします。

ウィンドウビューは、次の3つの水位戦略を提供します:

* `STRICTLY_ASCENDING`：これまでに観測された最大のタイムスタンプの水位を発出します。最大のタイムスタンプよりも小さいタイムスタンプを持つ行は遅れていないと見なされます。
* `ASCENDING`：これまでに観測された最大のタイムスタンプから1を引いた水位を発出します。最大のタイムスタンプと同じかそれよりも小さいタイムスタンプを持つ行は遅れていないと見なされます。
* `BOUNDED`：WATERMARK=INTERVAL。観測された最大のタイムスタンプから指定された遅延を引いた水位を発出します。

以下のクエリは`WATERMARK`を使用したウィンドウビューの作成例です:

```sql
CREATE WINDOW VIEW wv WATERMARK=STRICTLY_ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=INTERVAL '3' SECOND AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
```

デフォルトでは、水位が到達したときにウィンドウが発火し、水位を過ぎて到着した要素は破棄されます。ウィンドウビューは、`ALLOWED_LATENESS=INTERVAL`を設定して遅延イベント処理をサポートします。遅延処理の処理例は次のとおりです:

```sql
CREATE WINDOW VIEW test.wv TO test.dst WATERMARK=ASCENDING ALLOWED_LATENESS=INTERVAL '2' SECOND AS SELECT count(a) AS count, tumbleEnd(wid) AS w_end FROM test.mt GROUP BY tumble(timestamp, INTERVAL '5' SECOND) AS wid;
```

遅れて到着した要素が発出されると、それらは以前の計算の更新された結果として扱われることに注意してください。ウィンドウの終了時に発火するのではなく、遅延イベントが到着したときに直ちにウィンドウビューが発火します。したがって、同じウィンドウに対して複数の出力が生成されます。ユーザーはこれらの重複結果を考慮する必要があるか、重複を除去する必要があります。

ウィンドウビューで指定された`SELECT`クエリを変更するには、`ALTER TABLE ... MODIFY QUERY`ステートメントを使用します。新しい`SELECT`クエリの結果として得られるデータ構造は、`TO [db.]name`句の有無にかかわらず元の`SELECT`クエリと同じである必要があります。現在のウィンドウのデータは失われるため、中間状態を再利用することはできません。

### Monitoring New Windows {#monitoring-new-windows}

ウィンドウビューは、変更を監視するために[WATCH](../../../sql-reference/statements/watch.md)クエリをサポートします。また、`TO`構文を使用して結果をテーブルに出力することもできます。

```sql
WATCH [db.]window_view
[EVENTS]
[LIMIT n]
[FORMAT format]
```

`WATCH`クエリは、`LIVE VIEW`と似たような働きをします。受け取る更新の数を設定するために`LIMIT`を指定できます。その場合、クエリの結果の代わりに最新のクエリ水位が得られます。

### Settings {#settings-1}

- `window_view_clean_interval`：古いデータを解放するためのウィンドウビューのクリーンインターバル（秒単位）。システムは、システム時間や`WATERMARK`設定に従って完全にトリガーされていないウィンドウを保持し、その他のデータは削除されます。
- `window_view_heartbeat_interval`：ウォッチクエリが生存していることを示すフリクエンシー（秒単位）。
- `wait_for_window_view_fire_signal_timeout`：イベント時間処理においてウィンドウビューのトリガー信号を待機するためのタイムアウト。

### Example {#example}

10秒ごとにログテーブル`data`のクリックログの数をカウントする必要があるとします。このテーブルの構造は次のとおりです:

```sql
CREATE TABLE data ( `id` UInt64, `timestamp` DateTime) ENGINE = Memory;
```

最初に、10秒間隔のタムブルウィンドウを用いたウィンドウビューを作成します。

```sql
CREATE WINDOW VIEW wv as select count(id), tumbleStart(w_id) as window_start from data group by tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

次に、`WATCH`クエリを使用して結果を取得します。

```sql
WATCH wv
```

`data`テーブルにログを挿入するとき、

```sql
INSERT INTO data VALUES(1,now())
```

`WATCH`クエリは次のような結果を表示します。

```text
┌─count(id)─┬────────window_start─┐
│         1 │ 2020-01-14 16:56:40 │
└───────────┴─────────────────────┘
```

または、出力を別のテーブルに`TO`構文を用いて接続できます。

```sql
CREATE WINDOW VIEW wv TO dst AS SELECT count(id), tumbleStart(w_id) as window_start FROM data GROUP BY tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

追加の例はClickHouseのステートフルテストに見つけることができます（そこには`*window_view*`と名付けられています）。

### Window View Usage {#window-view-usage}

ウィンドウビューは以下のシナリオで有用です：

* **監視**：時間によってメトリクスログを集約および計算し、結果をターゲットテーブルに出力します。ダッシュボードはターゲットテーブルをソーステーブルとして使用できます。
* **分析**：時間ウィンドウでデータを自動的に集約および前処理します。これは、多数のログを分析する際に役立ちます。前処理により、複数のクエリで再計算する必要が排除され、クエリの待機時間が大幅に減少します。

## Related Content {#related-content}

- Blog: [ClickHouseにおける時系列データの操作](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- Blog: [ClickHouseを用いた可観測性ソリューションの構築 - パート 2 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)

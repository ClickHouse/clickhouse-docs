---
slug: /sql-reference/statements/create/view
sidebar_position: 37
sidebar_label: VIEW
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# CREATE VIEW

新しいビューを作成します。ビューは、[通常の](#normal-view)、[マテリアライズド](#materialized-view)、[リフレッシュ可能なマテリアライズド](#refreshable-materialized-view)、および[ウィンドウ](/sql-reference/statements/create/view#window-view)（リフレッシュ可能なマテリアライズドビューとウィンドウビューは実験的な機能です）として作成できます。

## Normal View {#normal-view}

構文：

``` sql
CREATE [OR REPLACE] VIEW [IF NOT EXISTS] [db.]table_name [(alias1 [, alias2 ...])] [ON CLUSTER cluster_name]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

通常のビューはデータを保存しません。アクセスのたびに他のテーブルから読み取るだけです。言い換えれば、通常のビューは保存されたクエリにすぎません。ビューから読み取るとき、保存されたクエリが[FROM](../../../sql-reference/statements/select/from.md)句のサブクエリとして使用されます。

例えば、以下のようにビューを作成したとします：

``` sql
CREATE VIEW view AS SELECT ...
```

そして、次のクエリを書いたとします：

``` sql
SELECT a, b, c FROM view
```

このクエリは次のサブクエリを使用するのと完全に同等です：

``` sql
SELECT a, b, c FROM (SELECT ...)
```

## Parameterized View {#parameterized-view}

パラメータ化されたビューは通常のビューに似ていますが、即座に解決されないパラメータで作成できます。これらのビューは、関数の名前としてビューの名前を指定し、引数としてパラメータ値を指定するテーブル関数で使用できます。

``` sql
CREATE VIEW view AS SELECT * FROM TABLE WHERE Column1={column1:datatype1} and Column2={column2:datatype2} ...
```
上記は、以下のようにパラメータを置き換えることでテーブル関数として使用できるビューを作成します。

``` sql
SELECT * FROM view(column1=value1, column2=value2 ...)
```

## Materialized View {#materialized-view}

``` sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster_name] [TO[db.]name [(columns)]] [ENGINE = engine] [POPULATE]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

:::tip
[マテリアライズドビュー](/guides/developer/cascading-materialized-views.md)の使用についてのステップバイステップガイドがあります。
:::

マテリアライズドビューは、対応する[SELECT](../../../sql-reference/statements/select/index.md)クエリによって変換されたデータを保存します。

`TO [db].[table]`なしでマテリアライズドビューを作成する場合は、データを保存するためのテーブルエンジンである`ENGINE`を指定する必要があります。

`TO [db].[table]`を指定してマテリアライズドビューを作成する場合、`POPULATE`を同時に使用することはできません。

マテリアライズドビューは次のように実装されます：`SELECT`で指定されたテーブルにデータを挿入する際、挿入されたデータの一部がこの`SELECT`クエリによって変換され、その結果がビューに挿入されます。

:::note
ClickHouseでは、マテリアライズドビューにおいて、目的のテーブルに挿入されるときに**カラム名**が列の順序の代わりに使用されます。`SELECT`クエリの結果に存在しないいくつかのカラム名がある場合、ClickHouseはデフォルト値を使用します。カラムが[Nullable](../../data-types/nullable.md)でない場合でも同様です。マテリアライズドビューを使用する場合は、すべてのカラムにエイリアスを追加することが安全な慣行です。

ClickHouseのマテリアライズドビューは、挿入トリガーに似た形で実装されています。ビューのクエリに集約が含まれている場合、それは新たに挿入されたデータのバッチに対してのみ適用されます。ソーステーブルの既存データへの変更（更新、削除、パーティションの削除など）は、マテリアライズドビューに影響を与えません。

ClickHouseのマテリアライズドビューは、エラーが発生した場合に決定論的な振る舞いを持ちません。これは、すでに書き込まれたブロックが目的のテーブルに保存されるが、エラー後のすべてのブロックは保存されないことを意味します。

デフォルトでは、いずれかのビューへのプッシュが失敗した場合、INSERTクエリも失敗し、いくつかのブロックが目的のテーブルに書き込まれない可能性があります。`materialized_views_ignore_errors`設定を使用すると、これを変更できます（`INSERT`クエリにもこの設定を設定する必要があります）。`materialized_views_ignore_errors=true`を設定すると、ビューへのプッシュ中のすべてのエラーが無視され、すべてのブロックが目的のテーブルに書き込まれます。

また、`materialized_views_ignore_errors`はデフォルトで`system.*_log`テーブルに対して`true`に設定されています。
:::

`POPULATE`を指定すると、既存のテーブルデータがビューに挿入され、`CREATE TABLE ... AS SELECT ...`を実行したかのようになります。そうでなければ、クエリにはビューを作成した後にテーブルに挿入されたデータのみが含まれます。`POPULATE`の使用は**推奨しません**。ビュー作成中にテーブルに挿入されたデータはその中に挿入されません。

:::note
`POPULATE`は`CREATE TABLE ... AS SELECT ...`のように動作するため、制限があります：
- 複製データベースではサポートされていません
- ClickHouse Cloudではサポートされていません

その代わりに、別の`INSERT ... SELECT`を使用できます。
:::

`SELECT`クエリには`DISTINCT`、`GROUP BY`、`ORDER BY`、`LIMIT`を含めることができます。挿入されたデータの各ブロックに対して対応する変換が独立して実行される点に注意してください。例えば、`GROUP BY`が設定されている場合、データは挿入中に集約されますが、唯一の挿入データのパケット内でのみ行われます。データはその後さらに集約されることはありません。例外は、`SummingMergeTree`のようにデータ集約を独立して実行する`ENGINE`を使用する場合です。

[ALTER](/sql-reference/statements/alter/view.md)クエリをマテリアライズドビューに対して実行するには制限があり、例えば`SELECT`クエリを更新することはできません。これは不便な場合があります。マテリアライズドビューが`TO [db.]name`構文を使用している場合、ビューを`DETACH`し、ターゲットテーブルに対して`ALTER`を実行し、その後以前にデタッチした（`DETACH`）ビューを`ATTACH`することができます。

マテリアライズドビューは[optimize_on_insert](../../../operations/settings/settings.md#optimize-on-insert)設定の影響を受ける点に注意してください。データはビューへの挿入の前にマージされます。

ビューは通常のテーブルと同じように見えます。例えば、`SHOW TABLES`クエリの結果にリストされます。

ビューを削除するには、[DROP VIEW](../../../sql-reference/statements/drop.md#drop-view)を使用します。ただし、`DROP TABLE`はビューにも適用されます。

## SQL security {#sql_security}

`DEFINER`と`SQL SECURITY`を使用すると、ビューの基になるクエリを実行する際に使用するClickHouseユーザーを指定できます。
`SQL SECURITY`には3つの合法的な値があります：`DEFINER`、`INVOKER`、または`NONE`。`DEFINER`句には、既存のユーザーまたは`CURRENT_USER`を指定できます。

以下のテーブルは、ビューから選択するために必要な権利をユーザーごとに説明します。
SQLセキュリティオプションに関係なく、すべてのケースで`GRANT SELECT ON <view>`を持っていることが必要です。

| SQL security option | View                                                            | Materialized View                                                                                                 |
|---------------------|-----------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| `DEFINER alice`     | `alice`はビューのソーステーブルに対する`SELECT`権限を持っている必要があります。 | `alice`はビューのソーステーブルに対する`SELECT`権限とビューのターゲットテーブルに対する`INSERT`権限を持っている必要があります。 |
| `INVOKER`           | ユーザーはビューのソーステーブルに対する`SELECT`権限を持っている必要があります。 | `SQL SECURITY INVOKER`はマテリアライズドビューには指定できません。                                                 |
| `NONE`              | -                                                               | -                                                                                                                 |

:::note
`SQL SECURITY NONE`は非推奨のオプションです。`SQL SECURITY NONE`でビューを作成する権限を持つユーザーは、任意のクエリを実行できます。
したがって、このオプションでビューを作成するには、`GRANT ALLOW SQL SECURITY NONE TO <user>`が必要です。
:::

`DEFINER`/`SQL SECURITY`が指定されていない場合、デフォルトの値が使用されます：
- `SQL SECURITY`: 通常のビューに対しては`INVOKER`、マテリアライズドビューに対しては`DEFINER`（[設定によって構成可能](../../../operations/settings/settings.md#default_normal_view_sql_security)）
- `DEFINER`: `CURRENT_USER`（[設定によって構成可能](../../../operations/settings/settings.md#default_view_definer)）

ビューが`DEFINER`/`SQL SECURITY`の指定なしでアタッチされる場合、デフォルト値はマテリアライズドビューに対しては`SQL SECURITY NONE`であり、通常のビューに対しては`SQL SECURITY INVOKER`です。

既存のビューのSQLセキュリティを変更するには、次のコマンドを使用します。
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

この機能は非推奨であり、将来的に削除される予定です。

旧文書は[こちら](https://pastila.nl/?00f32652/fdf07272a7b54bda7e13b919264e449f.md)にあります。

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
AS SELECT ...
[COMMENT 'comment']
```
ここで、`interval`は単純な間隔のシーケンスです：
```sql
number SECOND|MINUTE|HOUR|DAY|WEEK|MONTH|YEAR
```

定期的に対応するクエリを実行し、その結果をテーブルに保存します。
 * クエリが`APPEND`と指定されている場合、各リフレッシュで既存の行を削除せずに行をテーブルに挿入します。挿入は通常のINSERT SELECTのように原子的ではありません。
 * それ以外の場合、各リフレッシュでテーブルの以前の内容が原子的に置き換えられます。

通常のリフレッシュ不可のマテリアライズドビューとの違い：
 * 挿入トリガーがありません。つまり、`SELECT`で指定されたテーブルに新しいデータが挿入されたとき、それはリフレッシュ可能なマテリアライズドビューに自動的にプッシュされません。定期的なリフレッシュは全体のクエリを実行します。
 * `SELECT`クエリには制限がありません。テーブル関数（例：`url()`）、ビュー、UNION、JOINはすべて許可されます。

:::note
`REFRESH ... SETTINGS`クエリの一部の設定はリフレッシュ設定（例：`refresh_retries`）であり、通常の設定（例：`max_threads`）とは異なります。通常の設定は、クエリの末尾で`SETTINGS`を使用して指定できます。
:::

### Refresh Schedule {#refresh-schedule}

リフレッシュスケジュールの例：
```sql
REFRESH EVERY 1 DAY -- 毎日、真夜中（UTC）に
REFRESH EVERY 1 MONTH -- 毎月1日に、真夜中に
REFRESH EVERY 1 MONTH OFFSET 5 DAY 2 HOUR -- 毎月6日の午前2時
REFRESH EVERY 2 WEEK OFFSET 5 DAY 15 HOUR 10 MINUTE -- 毎週土曜日、午後3時10分に
REFRESH EVERY 30 MINUTE -- 00:00、00:30、01:00、01:30など
REFRESH AFTER 30 MINUTE -- 前回のリフレッシュが完了してから30分後、日中の時間には合わせません
-- REFRESH AFTER 1 HOUR OFFSET 1 MINUTE -- 構文エラー。AFTERにはOFFSETは許可されていません
REFRESH EVERY 1 WEEK 2 DAYS -- 9日ごと、特定の曜日や月ではない；
                           -- 特に、日付番号（1969-12-29以降）が9の倍数になるとき
REFRESH EVERY 5 MONTHS -- 毎5ヶ月、年によって異なる月（12は5で割り切れないため）；
                       -- 特に、月番号（1970-01以降）が5の倍数になるとき
```

`RANDOMIZE FOR`は、各リフレッシュの時間をランダムに調整します。例えば：
```sql
REFRESH EVERY 1 DAY OFFSET 2 HOUR RANDOMIZE FOR 1 HOUR -- 毎日01:30から02:30の間のランダムな時間に
```

リフレッシュは、与えられたビューについて同時に1つだけ実行できます。例：`REFRESH EVERY 1 MINUTE`のビューが2分間かかる場合、それは2分ごとにリフレッシュされます。その後、10秒でリフレッシュを開始するようになると、再び毎分リフレッシュされます（特に、見逃したリフレッシュのバックログについてはリフレッシュを行いません）。

さらに、マテリアライズドビューが作成されると、すぐにリフレッシュが開始されます。`CREATE`クエリで`EMPTY`が指定されている場合を除きます。`EMPTY`が指定されている場合、最初のリフレッシュはスケジュールに従って行われます。

### In Replicated DB {#in-replicated-db}

リフレッシュ可能なマテリアライズドビューが[複製データベース](../../../engines/database-engines/replicated.md)にある場合、複製が互いに調整されて、各スケジュールされた時間に1つの複製だけがリフレッシュを行います。[ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md)テーブルエンジンが必要で、すべての複製がリフレッシュによって生成されたデータを視認できます。

`APPEND`モードでは、`SETTINGS all_replicas = 1`を使用して調整を無効にできます。これにより、複製はそれぞれ独立してリフレッシュを行います。この場合、ReplicatedMergeTreeは必要ありません。

非`APPEND`モードでは、調整されたリフレッシュのみがサポートされます。調整されていない場合は、Atomicデータベースを使用し、すべての複製でリフレッシュ可能なマテリアライズドビューを作成するために`CREATE ... ON CLUSTER`クエリを使用します。

調整はKeeperを通じて行われます。znodeパスは[default_replica_path](../../../operations/server-configuration-parameters/settings.md#default_replica_path)サーバー設定によって決まります。

### Dependencies {#refresh-dependencies}

`DEPENDS ON`は異なるテーブルのリフレッシュを同期します。例として、2つのリフレッシュ可能なマテリアライズドビューのチェーンがあるとします：
```sql
CREATE MATERIALIZED VIEW source REFRESH EVERY 1 DAY AS SELECT * FROM url(...)
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY AS SELECT ... FROM source
```
`DEPENDS ON`を指定しない場合、両方のビューは真夜中にリフレッシュを開始し、通常は`destination`は`source`の前日のデータを見ます。依存関係を追加すると：
```sql
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY DEPENDS ON source AS SELECT ... FROM source
```
`destination`のリフレッシュは、その日の`source`のリフレッシュが終了した後にのみ開始され、従って`destination`は新しいデータに基づくことになります。

また、次のように同じ結果を達成することもできます：
```sql
CREATE MATERIALIZED VIEW destination REFRESH AFTER 1 HOUR DEPENDS ON source AS SELECT ... FROM source
```
ここで、`1 HOUR`は`source`のリフレッシュ期間より短い任意の期間です。依存するテーブルはその依存関係より頻繁にリフレッシュされません。これは、実際のリフレッシュ期間を1回以上指定せずにリフレッシュ可能なビューのチェーンを設定する有効な方法です。

いくつかの追加例：
 * `REFRESH EVERY 1 DAY OFFSET 10 MINUTE`（`destination`）は`REFRESH EVERY 1 DAY`（`source`）に依存しています。<br/>
   `source`のリフレッシュが10分以上かかる場合、`destination`はそれを待ちます。
 * `REFRESH EVERY 1 DAY OFFSET 1 HOUR`は`REFRESH EVERY 1 DAY OFFSET 23 HOUR`に依存しています。<br/>
   上記と同様で、対応するリフレッシュは異なるカレンダーの日に発生しますが、`destination`はX日で`source`のリフレッシュがX日に終了するのを待ちます（もしそれが2時間以上かかる場合）。
 * `REFRESH EVERY 2 HOUR`は`REFRESH EVERY 1 HOUR`に依存しています。<br/>
   2時間リフレッシュは毎時1時間リフレッシュの後に行われ、たとえば真夜中のリフレッシュの後、次に午前2時のリフレッシュの後に行われます。
 * `REFRESH EVERY 1 MINUTE`は`REFRESH EVERY 2 HOUR`に依存しています。<br/>
   `REFRESH AFTER 1 MINUTE`は`REFRESH EVERY 2 HOUR`に依存しています。<br/>
   `REFRESH AFTER 1 MINUTE`は`REFRESH AFTER 2 HOUR`に依存しています。<br/>
   `destination`は`source`のリフレッシュごとに1回リフレッシュされます。つまり、毎2時間ごとに。この`1 MINUTE`は実際には無視されます。
 * `REFRESH AFTER 1 HOUR`は`REFRESH AFTER 1 HOUR`に依存しています。<br/>
   現在、これは推奨されていません。

:::note
`DEPENDS ON`は、リフレッシュ可能なマテリアライズドビュー間でのみ機能します。`DEPENDS ON`リストに通常のテーブルをリストすることは、ビューがリフレッシュされないことを防ぎます（依存関係は`ALTER`で削除できます、以下を参照）。
:::

### Settings {#settings}

利用可能なリフレッシュ設定：
 * `refresh_retries` - リフレッシュクエリが例外で失敗した場合に、何回リトライするか。すべてのリトライが失敗した場合、次の予定されたリフレッシュ時間にスキップします。0はリトライなし、-1は無限リトライを意味します。デフォルト：0。
 * `refresh_retry_initial_backoff_ms` - 最初のリトライの前の遅延。`refresh_retries`がゼロでない場合。各リトライの遅延は倍増され、`refresh_retry_max_backoff_ms`まで成長します。デフォルト：100 ms。
 * `refresh_retry_max_backoff_ms` - リフレッシュ試行間の遅延の指数的成長の制限。デフォルト：60000 ms（1分）。

### Changing Refresh Parameters {#changing-refresh-parameters}

リフレッシュパラメータを変更するには：
```sql
ALTER TABLE [db.]name MODIFY REFRESH EVERY|AFTER ... [RANDOMIZE FOR ...] [DEPENDS ON ...] [SETTINGS ...]
```

:::note
これは、スケジュール、依存関係、設定、APPENDの性質を一度に*すべて*置き換えます。例えば、テーブルに`DEPENDS ON`があった場合、`DEPENDS ON`なしで`MODIFY REFRESH`を行うと、依存関係が削除されます。
:::

### Other operations {#other-operations}

すべてのリフレッシュ可能なマテリアライズドビューのステータスは、[`system.view_refreshes`](../../../operations/system-tables/view_refreshes.md)テーブルで確認できます。特に、リフレッシュの進行状況（実行中の場合）、最後のリフレッシュ時間、および次のリフレッシュ時間が含まれ、リフレッシュが失敗した場合の例外メッセージが表示されます。

リフレッシュを手動で停止、開始、トリガー、またはキャンセルするには、[`SYSTEM STOP|START|REFRESH|WAIT|CANCEL VIEW`](../system.md#refreshable-materialized-views)を使用します。

リフレッシュが完了するまで待つには、[`SYSTEM WAIT VIEW`](../system.md#refreshable-materialized-views)を使用します。特に、ビューの作成後の初期リフレッシュを待つために便利です。

:::note
余談ですが、リフレッシュクエリは、リフレッシュ中のビューから読み取ることが許可されています。これにより、データの前リフレッシュバージョンを確認できます。これを使用すれば、コンウェイのライフゲームを実装できます： https://pastila.nl/?00021a4b/d6156ff819c83d490ad2dcec05676865#O0LGWTO7maUQIA4AcGUtlA==
:::

## Window View {#window-view}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::info
これは実験的な機能であり、今後のリリースで後方互換性のない方法で変更される可能性があります。ウィンドウビューと`WATCH`クエリの使用を有効にするには、[allow_experimental_window_view](../../../operations/settings/settings.md#allow-experimental-window-view)設定を使用します。コマンド`set allow_experimental_window_view = 1`を入力してください。
:::

``` sql
CREATE WINDOW VIEW [IF NOT EXISTS] [db.]table_name [TO [db.]table_name] [INNER ENGINE engine] [ENGINE engine] [WATERMARK strategy] [ALLOWED_LATENESS interval_function] [POPULATE]
AS SELECT ...
GROUP BY time_window_function
[COMMENT 'comment']
```

ウィンドウビューは、時間ウィンドウでデータを集計し、ウィンドウが発火する準備ができたときに結果を出力できます。中間集計結果を内側（または指定の）テーブルに保存してレイテンシを減らし、結果を指定されたテーブルにプッシュしたり、WATCHクエリを使用して通知をプッシュできます。

ウィンドウビューの作成は、`MATERIALIZED VIEW`の作成に似ています。ウィンドウビューは中間データを保存するために内側のストレージエンジンが必要です。内側のストレージは`INNER ENGINE`句を使用して指定でき、ウィンドウビューはデフォルトの内側エンジンとして`AggregatingMergeTree`を使用します。

`TO [db].[table]`なしでウィンドウビューを作成する場合は、データを保存するためのテーブルエンジンである`ENGINE`を指定する必要があります。

### Time Window Functions {#time-window-functions}

[時間ウィンドウ関数](../../functions/time-window-functions.md)は、レコードの下限および上限ウィンドウ境界を取得するために使用されます。ウィンドウビューは、時間ウィンドウ関数と共に使用される必要があります。

### TIME ATTRIBUTES {#time-attributes}

ウィンドウビューは**処理時間**と**イベント時間**を処理します。

**処理時間**は、ウィンドウビューがローカルマシンの時間に基づいて結果を生成することを可能にし、デフォルトで使用されます。これは最も単純な時間の概念ですが、決定論を提供しません。処理時間属性は、時間ウィンドウ関数の`time_attr`をテーブルカラムに設定するか、`now()`関数を使用することで定義できます。次のクエリは、処理時間を使用してウィンドウビューを作成します。

``` sql
CREATE WINDOW VIEW wv AS SELECT count(number), tumbleStart(w_id) as w_start from date GROUP BY tumble(now(), INTERVAL '5' SECOND) as w_id
```

**イベント時間**は、各個別のイベントが生成デバイス上で発生した時間です。この時間は、生成されたときにレコード内に埋め込まれていることが通常です。イベント時間処理は、順不同のイベントや遅延イベントがあっても、一貫した結果を提供します。ウィンドウビューは、`WATERMARK`構文を使用してイベント時間処理をサポートします。

ウィンドウビューは、3つのウォーターマーク戦略を提供します：

* `STRICTLY_ASCENDING`：これまでに観測された最大タイムスタンプのウォーターマークを発信します。最大タイムスタンプより小さいタイムスタンプを持つ行は遅れていません。
* `ASCENDING`：これまでに観測された最大タイムスタンプから1を引いたウォーターマークを発信します。最大タイムスタンプと同じ、あるいはそれより小さいタイムスタンプを持つ行は遅れていません。
* `BOUNDED`：WATERMARK=INTERVAL。指定された遅延を引いた最大観測タイムスタンプのウォーターマークを発信します。

以下のクエリは、`WATERMARK`を使用してウィンドウビューを作成する例です：

``` sql
CREATE WINDOW VIEW wv WATERMARK=STRICTLY_ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=INTERVAL '3' SECOND AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
```

デフォルトでは、ウォーターマークが来るとウィンドウが発火し、ウォーターマークの背後に到着した要素は削除されます。ウィンドウビューは、`ALLOWED_LATENESS=INTERVAL`を設定することで遅延イベント処理をサポートします。遅延処理の一例は次のとおりです：

``` sql
CREATE WINDOW VIEW test.wv TO test.dst WATERMARK=ASCENDING ALLOWED_LATENESS=INTERVAL '2' SECOND AS SELECT count(a) AS count, tumbleEnd(wid) AS w_end FROM test.mt GROUP BY tumble(timestamp, INTERVAL '5' SECOND) AS wid;
```

遅延発火によって発信された要素は、前の計算の更新結果として扱われるべきであることに注意してください。ウィンドウの終わりで発火するのではなく、遅延イベントが到着した時点ですぐにウィンドウビューが発火します。これにより、同じウィンドウに対して複数の出力が生成されます。ユーザーは、これらの重複した結果を考慮するか、重複を解除する必要があります。

ウィンドウビューで指定された`SELECT`クエリを変更するには、`ALTER TABLE ... MODIFY QUERY`ステートメントを使用します。新しい`SELECT`クエリから得られるデータ構造は、`TO [db.]name`句の有無にかかわらず、元の`SELECT`クエリと同じである必要があります。現在のウィンドウ内のデータは失われます。中間状態は再利用できません。

### Monitoring New Windows {#monitoring-new-windows}

ウィンドウビューは、変更を監視するために[WATCH](../../../sql-reference/statements/watch.md)クエリをサポートしているか、`TO`構文を使用して結果をテーブルに出力します。

``` sql
WATCH [db.]window_view
[EVENTS]
[LIMIT n]
[FORMAT format]
```

`WATCH`クエリは、`LIVE VIEW`と同様に動作します。`LIMIT`を指定すると、クエリを終了する前に受け取る更新の数を設定できます。`EVENTS`句を使用すると、クエリ結果の代わりに最新のクエリウォーターマークを取得する短い形式の`WATCH`クエリを取得できます。

### Settings {#settings-1}

- `window_view_clean_interval`: 古いデータを解放するためのウィンドウビューのクリーン間隔（秒）。システムは、システム時間や`WATERMARK`設定に従って完全にトリガーされていないウィンドウを保持し、他のデータは削除されます。
- `window_view_heartbeat_interval`: WATCHクエリが生きていることを示すためのハートビート間隔（秒）。
- `wait_for_window_view_fire_signal_timeout`: イベント時間処理でのウィンドウビューの発信信号を待機するためのタイムアウト。

### Example {#example}

10秒ごとにクリックログの数をカウントする必要がある`data`というログテーブルのテーブル構造が次のようになっているとします：

``` sql
CREATE TABLE data ( `id` UInt64, `timestamp` DateTime) ENGINE = Memory;
```

まず、10秒間隔のタンブルウィンドウを持つウィンドウビューを作成します：

``` sql
CREATE WINDOW VIEW wv as select count(id), tumbleStart(w_id) as window_start from data group by tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

次に、`WATCH`クエリを使用して結果を取得します。

``` sql
WATCH wv
```

ログがテーブル`data`に挿入されるとき、

``` sql
INSERT INTO data VALUES(1,now())
```

`WATCH`クエリは以下のような結果を表示します：

``` text
┌─count(id)─┬────────window_start─┐
│         1 │ 2020-01-14 16:56:40 │
└───────────┴─────────────────────┘
```

あるいは、`TO`構文を使用して出力を別のテーブルにアタッチできます。

``` sql
CREATE WINDOW VIEW wv TO dst AS SELECT count(id), tumbleStart(w_id) as window_start FROM data GROUP BY tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

追加の例は、ClickHouseの状態を持つテストの中にあります（それらは`*window_view*`と名付けられています）。

### Window View Usage {#window-view-usage}

ウィンドウビューは以下のシナリオで役立ちます：

* **監視**：時間ごとにログのメトリックを集計および計算し、対象テーブルに結果を出力します。ダッシュボードは対象テーブルをソーステーブルとして使用できます。
* **分析**：時間ウィンドウでデータを自動的に集計および前処理します。多くのログを分析する際に役立ちます。前処理により、複数のクエリでの重複計算が排除され、クエリのレイテンシが軽減されます。

## Related Content {#related-content}

- ブログ: [ClickHouseでの時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- ブログ: [ClickHouseを使用した可観測性ソリューションの構築 - パート2 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)

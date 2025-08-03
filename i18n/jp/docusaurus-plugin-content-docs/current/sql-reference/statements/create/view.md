---
description: 'CREATE VIEW のドキュメント'
sidebar_label: 'ビュー'
sidebar_position: 37
slug: '/sql-reference/statements/create/view'
title: 'CREATE VIEW'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';



# CREATE VIEW

新しいビューを作成します。ビューは[通常の](#normal-view)、[マテリアライズド](#materialized-view)、[リフレッシュ可能なマテリアライズド](#refreshable-materialized-view)、および [ウィンドウ](/sql-reference/statements/create/view#window-view)（リフレッシュ可能なマテリアライズドビューとウィンドウビューは実験的な機能です）。

## Normal View {#normal-view}

構文:

```sql
CREATE [OR REPLACE] VIEW [IF NOT EXISTS] [db.]table_name [(alias1 [, alias2 ...])] [ON CLUSTER cluster_name]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

通常のビューはデータを保存しません。各アクセスで他のテーブルから読み取るだけです。つまり、通常のビューは保存されたクエリ以外の何物でもありません。ビューから読み取ると、保存されたこのクエリは[FROM](../../../sql-reference/statements/select/from.md)句のサブクエリとして使用されます。

例えば、あなたが次のようにビューを作成したとします:

```sql
CREATE VIEW view AS SELECT ...
```

そしてクエリを書いたとします:

```sql
SELECT a, b, c FROM view
```

このクエリは、次のサブクエリを使用することに完全に相当します:

```sql
SELECT a, b, c FROM (SELECT ...)
```

## Parameterized View {#parameterized-view}

パラメータ化されたビューは通常のビューに似ていますが、直ちに解決されないパラメータで作成できます。これらのビューは、ビューの名前を関数名、パラメータの値を引数として指定するテーブル関数と一緒に使用できます。

```sql
CREATE VIEW view AS SELECT * FROM TABLE WHERE Column1={column1:datatype1} and Column2={column2:datatype2} ...
```

上記は、パラメータを置き換えることでテーブル関数として使用できるビューを作成します。

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
こちらは[マテリアライズドビュー](/guides/developer/cascading-materialized-views.md)の利用に関する手順ガイドです。
:::

マテリアライズドビューは、対応する[SELECT](../../../sql-reference/statements/select/index.md)クエリによって変換されたデータを保存します。

`TO [db].[table]`なしでマテリアライズドビューを作成する場合、データを保存するためのテーブルエンジンである`ENGINE`を指定しなければなりません。

`TO [db].[table]`を使用してマテリアライズドビューを作成する場合、`POPULATE`も使用することはできません。

マテリアライズドビューは次のように実装されます: `SELECT`で指定されたテーブルにデータを挿入すると、挿入されたデータの一部がこの`SELECT`クエリによって変換され、その結果がビューに挿入されます。

:::note
ClickHouseのマテリアライズドビューは、宛先テーブルへの挿入時に**カラム名**を使用します。`SELECT`クエリ結果に存在しないカラム名がある場合、ClickHouseはデフォルト値を使用します。[Nullable](../../data-types/nullable.md)でない場合でもです。マテリアライズドビューを使用する際は、すべてのカラムにエイリアスを追加するのが安全なプラクティスです。

ClickHouseのマテリアライズドビューは、挿入トリガーのように実装されています。ビュークエリに集約が含まれている場合、それは新しく挿入されたデータのバッチにのみ適用されます。ソーステーブルの既存データへの変更（更新、削除、パーティション削除など）は、マテリアライズドビューを変更しません。

ClickHouseのマテリアライズドビューは、エラー発生時に決定論的な動作を持ちません。つまり、すでに書き込まれたブロックは宛先テーブルに保持されますが、エラー後のすべてのブロックは書き込まれません。

デフォルトでは、どれかのビューへのプッシュが失敗した場合、INSERTクエリも失敗し、一部のブロックが宛先テーブルに書き込まれない可能性があります。これを変更するには、`materialized_views_ignore_errors`設定を使用します（`INSERT`クエリ用に設定する必要があります）。`materialized_views_ignore_errors=true`に設定すると、ビューへのプッシュ中のエラーは無視され、すべてのブロックが宛先テーブルに書き込まれます。

また、`materialized_views_ignore_errors`は`system.*_log`テーブルに対してデフォルトで`true`に設定されています。
:::

`POPULATE`を指定すると、ビュー作成時に既存のテーブルデータがビューに挿入されます。 `CREATE TABLE ... AS SELECT ...`を作成するかのように。そうでなければ、クエリにはビュー作成後にテーブルに挿入されたデータのみが含まれます。`POPULATE`の使用は**推奨しません**。ビュー作成中にテーブルに挿入されたデータは、ビューに挿入されません。

:::note
`POPULATE`が`CREATE TABLE ... AS SELECT ...`のように動作するため、制限があります:
- レプリケートデータベースではサポートされていません
- ClickHouseクラウドではサポートされていません

代わりに、別の`INSERT ... SELECT`を使用できます。
:::

`SELECT`クエリは`DISTINCT`、`GROUP BY`、`ORDER BY`、`LIMIT`を含むことができます。挿入されるデータの各ブロックには、対応する変換が独立して実行されることに注意してください。たとえば、`GROUP BY`が設定されている場合、データは挿入時に集約されますが、単一のパケットの挿入データ内でのみ集約されます。データはさらに集約されません。例外は、`SummingMergeTree`のようにデータ集約を独立して実行する`ENGINE`を使用する場合です。

[ALTER](/sql-reference/statements/alter/view.md)クエリをマテリアライズドビューで実行する際には制限があります。たとえば、`SELECT`クエリを更新することはできないため、不便な場合があります。マテリアライズドビューが`TO [db.]name`構文を使用する場合、ビューを`DETACH`し、対象テーブルに対して`ALTER`を実行してから、以前に切り離した（`DETACH`した）ビューを`ATTACH`できます。

マテリアライズドビューは[optimize_on_insert](/operations/settings/settings#optimize_on_insert)設定の影響を受けます。データは、ビューへの挿入前にマージされます。

ビューは通常のテーブルと同様に見えます。たとえば、`SHOW TABLES`クエリの結果にリストされます。

ビューを削除するには、[DROP VIEW](../../../sql-reference/statements/drop.md#drop-view)を使用します。ただし、`DROP TABLE`はVIEWにも適用されます。

## SQL security {#sql_security}

`DEFINER`と`SQL SECURITY`を使用すると、ビューの基底クエリを実行するときに使用するClickHouseユーザーを指定できます。
`SQL SECURITY`には3つの合法的な値があります: `DEFINER`、`INVOKER`、または`NONE`。`DEFINER`句では、既存のユーザーまたは`CURRENT_USER`を指定できます。

次の表は、ビューから選択するためにどのユーザーがどの権利を必要とするかを説明します。
SQLセキュリティオプションに関係なく、すべてのケースで`GRANT SELECT ON <view>`を持っている必要があることに注意してください。

| SQL security option | View                                                            | Materialized View                                                                                                 |
|---------------------|-----------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| `DEFINER alice`     | `alice`はビューのソーステーブルに対して`SELECT`の権限を持っている必要があります。 | `alice`はビューのソーステーブルに対して`SELECT`の権限を持ち、ビューの対象テーブルに対して`INSERT`の権限を持っている必要があります。 |
| `INVOKER`           | ユーザーはビューのソーステーブルに対して`SELECT`の権限を持っている必要があります。    | `SQL SECURITY INVOKER`はマテリアライズドビューには指定できません。                                                 |
| `NONE`              | -                                                               | -                                                                                                                 |

:::note
`SQL SECURITY NONE`は廃止されたオプションです。`SQL SECURITY NONE`でビューを作成する権限を持つ任意のユーザーは、任意のクエリを実行できる可能性があります。
したがって、このオプションでビューを作成するには、`GRANT ALLOW SQL SECURITY NONE TO <user>`を持っている必要があります。
:::

`DEFINER`/`SQL SECURITY`が指定されていない場合、デフォルトの値が使用されます:
- `SQL SECURITY`: 通常のビューには`INVOKER`が、マテリアライズドビューには`DEFINER`が使用されます（[設定によって設定可能](../../../operations/settings/settings.md#default_normal_view_sql_security)）。
- `DEFINER`: `CURRENT_USER`（[設定によって設定可能](../../../operations/settings/settings.md#default_view_definer)）。

ビューが`DEFINER`/`SQL SECURITY`を指定せずに接続された場合、デフォルト値はマテリアライズドビューに対しては`SQL SECURITY NONE`、通常のビューに対しては`SQL SECURITY INVOKER`です。

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

この機能は廃止予定であり、将来削除される予定です。

便利のために、古いドキュメントは[こちら](https://pastila.nl/?00f32652/fdf07272a7b54bda7e13b919264e449f.md)にあります。

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
ここで`interval`は単純なインターバルのシーケンスです:
```sql
number SECOND|MINUTE|HOUR|DAY|WEEK|MONTH|YEAR
```

定期的に対応するクエリを実行し、その結果をテーブルに保存します。
 * クエリが`APPEND`と言う場合、各リフレッシュは既存の行を削除せず、テーブルに行を挿入します。挿入は原子的ではなく、通常のINSERT SELECTと同様です。
 * それ以外の場合、各リフレッシュはテーブルの以前の内容を原子的に置き換えます。

通常のリフレッシュ不可のマテリアライズドビューとの違い:
 * 挿入トリガーはありません。つまり、`SELECT`で指定されたテーブルに新しいデータが挿入されると、自動的にリフレッシュ可能なマテリアライズドビューにプッシュされることはありません。定期リフレッシュは、クエリ全体を実行します。
 * SELECTクエリに制限はありません。テーブル関数（例: `url()`）、ビュー、UNION、JOINはすべて許可されています。

:::note
`REFRESH ... SETTINGS`部分の設定はリフレッシュ設定（例: `refresh_retries`）であり、通常の設定（例: `max_threads`）とは異なります。通常の設定はクエリの最後で`SETTINGS`を使用して指定できます。
:::

### Refresh Schedule {#refresh-schedule}

リフレッシュスケジュールの例:
```sql
REFRESH EVERY 1 DAY -- 毎日、午前0時（UTC）
REFRESH EVERY 1 MONTH -- 毎月1日の午前0時
REFRESH EVERY 1 MONTH OFFSET 5 DAY 2 HOUR -- 毎月6日の午前2時に実行
REFRESH EVERY 2 WEEK OFFSET 5 DAY 15 HOUR 10 MINUTE -- 毎週土曜日午後3時10分に実行
REFRESH EVERY 30 MINUTE -- 00:00, 00:30, 01:00, 01:30など
REFRESH AFTER 30 MINUTE -- 前回のリフレッシュが完了した30分後、時間に合わせない
-- REFRESH AFTER 1 HOUR OFFSET 1 MINUTE -- 構文エラー、AFTERにはOFFSETは許可されていません
REFRESH EVERY 1 WEEK 2 DAYS -- 9日ごとに、特定の曜日や月ではなく;
                            -- 特に、起算日（1969-12-29）の日数が9で割り切れる時
REFRESH EVERY 5 MONTHS -- 5ヶ月ごとに、毎年異なる月（12は5で割り切れないため）;
                       -- 特に、起算月（1970-01）に基づいて月数が5で割り切れる時
```

`RANDOMIZE FOR`は各リフレッシュの時間をランダムに調整します。例えば：
```sql
REFRESH EVERY 1 DAY OFFSET 2 HOUR RANDOMIZE FOR 1 HOUR -- 毎日ランダムな時間の間に01:30〜02:30の間で実行
```

与えられたビューに対して、同時に1つのリフレッシュのみを実行できます。例えば、`REFRESH EVERY 1 MINUTE`のビューがリフレッシュに2分かかる場合、それは2分ごとにリフレッシュされます。もしそれが速くなって10秒でリフレッシュを開始するようになると、1分ごとにリフレッシュを再開します（特に、未実行のリフレッシュのバックログを追いつくために10秒ごとにリフレッシュすることはありません - そのようなバックログはありません）。

さらに、リフレッシュはマテリアライズドビューが作成された後すぐに開始されます。`CREATE`クエリで`EMPTY`が指定される場合を除きます。`EMPTY`が指定されている場合、最初のリフレッシュはスケジュールに従って発生します。

### In Replicated DB {#in-replicated-db}

リフレッシュ可能なマテリアライズドビューが[レプリケートデータベース](../../../engines/database-engines/replicated.md)にある場合、レプリカは互いに調整し、各スケジュール時に1つのレプリカのみがリフレッシュを実行します。[ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md)テーブルエンジンが必要であり、すべてのレプリカがリフレッシュによって生成されたデータを見ることができます。

`APPEND`モードでは、`SETTINGS all_replicas = 1`を使用して調整を無効にできます。これにより、レプリカは互いに独立してリフレッシュを行います。この場合、ReplicatedMergeTreeは必要ありません。

非`APPEND`モードでは、調整されたリフレッシュのみがサポートされます。未調整の場合は、Atomicデータベースと`CREATE ... ON CLUSTER`クエリを使用して、すべてのレプリカでリフレッシュ可能なマテリアライズドビューを作成します。

調整はKeeperを通じて実行されます。znodeパスは[default_replica_path](../../../operations/server-configuration-parameters/settings.md#default_replica_path)サーバ設定によって決定されます。

### Dependencies {#refresh-dependencies}

`DEPENDS ON`は異なるテーブルのリフレッシュを同期します。例として、2つのリフレッシュ可能なマテリアライズドビュー間の連鎖を考えます：
```sql
CREATE MATERIALIZED VIEW source REFRESH EVERY 1 DAY AS SELECT * FROM url(...)
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY AS SELECT ... FROM source
```
`DEPENDS ON`なしでは、両方のビューは午前0時にリフレッシュを開始します。通常、`destination`は`source`の前日のデータを見ることになります。依存関係を追加すると：
```sql
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY DEPENDS ON source AS SELECT ... FROM source
```
`destination`のリフレッシュは、その日の`source`のリフレッシュが完了した後にのみ開始され、したがって`destination`は新鮮なデータに基づくようになります。

または、次のようにして同様の結果を得ることもできます:
```sql
CREATE MATERIALIZED VIEW destination REFRESH AFTER 1 HOUR DEPENDS ON source AS SELECT ... FROM source
```
ここで`1 HOUR`は`source`のリフレッシュ期間よりも短い任意の期間に設定できます。依存するテーブルは、その依存関係よりも頻繁にはリフレッシュされません。これは、実際のリフレッシュ期間を1回だけ指定することでリフレッシュ可能なビューの連鎖を設定する有効な方法です。

いくつかの例：
 * `REFRESH EVERY 1 DAY OFFSET 10 MINUTE`（`destination`）は、`REFRESH EVERY 1 DAY`（`source`）に依存しています。<br/>
   もし`source`のリフレッシュが10分以上かかる場合、`destination`は待機します。
 * `REFRESH EVERY 1 DAY OFFSET 1 HOUR`は`REFRESH EVERY 1 DAY OFFSET 23 HOUR`に依存します。<br/>
   上記と似ていますが、対応するリフレッシュは異なるカレンダーの日に発生します。
   `destination`のリフレッシュは、`source`がX日目にリフレッシュされるまで待機します（2時間以上かかる場合）。
 * `REFRESH EVERY 2 HOUR`は`REFRESH EVERY 1 HOUR`に依存しています。<br/>
   2Hのリフレッシュは1Hのリフレッシュの後、毎時行われます。 例えば、午前0時のリフレッシュの後、午前2時のリフレッシュの後など。
 * `REFRESH EVERY 1 MINUTE`は`REFRESH EVERY 2 HOUR`に依存します。<br/>
   `REFRESH AFTER 1 MINUTE`は`REFRESH EVERY 2 HOUR`に依存しています。<br/>
   `REFRESH AFTER 1 MINUTE`は`REFRESH AFTER 2 HOUR`に依存しています。<br/>
   `destination`は、各`source`リフレッシュの後に1回リフレッシュされます。つまり、2時間ごとです。`1 MINUTE`は無視されます。
 * `REFRESH AFTER 1 HOUR`は`REFRESH AFTER 1 HOUR`に依存しています。<br/>
   現在、これは推奨されていません。

:::note
`DEPENDS ON`はリフレッシュ可能なマテリアライズドビュー間でのみ機能します。`DEPENDS ON`リストに通常のテーブルを含めると、そのビューは決してリフレッシュされません（依存関係は`ALTER`で削除できます。以下を参照してください）。
:::

### Settings {#settings}

利用可能なリフレッシュ設定:
 * `refresh_retries` - リフレッシュクエリが例外で失敗した場合、再試行する回数。すべての再試行が失敗した場合は、次のスケジュールリフレッシュ時間にスキップします。0は再試行をしないこと、-1は無限の再試行を意味します。デフォルト: 0。
 * `refresh_retry_initial_backoff_ms` - 最初の再試行前の遅延（`refresh_retries`がゼロでない場合）。次の再試行ごとに遅延が2倍になり、`refresh_retry_max_backoff_ms`に到達します。デフォルト: 100ミリ秒。
 * `refresh_retry_max_backoff_ms` - リフレッシュ試行間の遅延の指数成長の制限。デフォルト: 60000ミリ秒（1分）。

### Changing Refresh Parameters {#changing-refresh-parameters}

リフレッシュパラメータを変更するには：
```sql
ALTER TABLE [db.]name MODIFY REFRESH EVERY|AFTER ... [RANDOMIZE FOR ...] [DEPENDS ON ...] [SETTINGS ...]
```

:::note
これにより、すべてのリフレッシュパラメータが一度に置き換えられます：スケジュール、依存関係、設定、およびAPPEND状態。たとえば、テーブルに`DEPENDS ON`があった場合、`DEPENDS ON`なしで`REFRESH`を`MODIFY`を行うと、依存関係が削除されます。
:::

### Other operations {#other-operations}

すべてのリフレッシュ可能なマテリアライズドビューの状態は、[`system.view_refreshes`](../../../operations/system-tables/view_refreshes.md)テーブルで利用可能です。特に、リフレッシュの進行状況（実行中であれば）、最後のリフレッシュ時間、次のリフレッシュ時間、リフレッシュ失敗時の例外メッセージが含まれます。

手動でリフレッシュを停止、開始、トリガー、またはキャンセルするには、[`SYSTEM STOP|START|REFRESH|WAIT|CANCEL VIEW`](../system.md#refreshable-materialized-views)を使用します。

リフレッシュの完了を待機するには、[`SYSTEM WAIT VIEW`](../system.md#refreshable-materialized-views)を使用します。特に、ビュー作成後の初回リフレッシュを待機する際に便利です。

:::note
面白い事実: リフレッシュクエリは、そのリフレッシュされているビューから読み取ることが許可されており、リフレッシュ前のデータのバージョンを見ることができます。これにより、コナウェイのライフゲームを実装することが可能です：https://pastila.nl/?00021a4b/d6156ff819c83d490ad2dcec05676865#O0LGWTO7maUQIA4AcGUtlA==
:::

## Window View {#window-view}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::info
これは実験的な機能であり、将来のリリースで互換性のない方法で変更される可能性があります。ウィンドウビューと`WATCH`クエリの使用を許可するには、[allow_experimental_window_view](/operations/settings/settings#allow_experimental_window_view)設定を使用します。 コマンド`set allow_experimental_window_view = 1`を入力します。
:::

```sql
CREATE WINDOW VIEW [IF NOT EXISTS] [db.]table_name [TO [db.]table_name] [INNER ENGINE engine] [ENGINE engine] [WATERMARK strategy] [ALLOWED_LATENESS interval_function] [POPULATE]
AS SELECT ...
GROUP BY time_window_function
[COMMENT 'comment']
```

ウィンドウビューは、時間ウィンドウによってデータを集計し、ウィンドウが発火する準備ができると結果を出力します。ウィンドウビューは、部分的な集計結果を内部（または指定された）テーブルに保存し、遅延を削減し、処理結果を指定されたテーブルにプッシュするか、`WATCH`クエリを使用してプッシュ通知を行います。

ウィンドウビューの作成は`MATERIALIZED VIEW`の作成に似ています。ウィンドウビューは中間データを保存するための内部ストレージエンジンが必要です。内部ストレージは`INNER ENGINE`句を使用して指定でき、ウィンドウビューのデフォルト内部エンジンは`AggregatingMergeTree`です。

`TO [db].[table]`なしでウィンドウビューを作成する場合、データを保存するためのテーブルエンジンである`ENGINE`を指定しなければなりません。

### Time Window Functions {#time-window-functions}

[時間ウィンドウ関数](../../functions/time-window-functions.md)は、レコードの下限と上限ウィンドウバウンドを取得するために使用されます。ウィンドウビューは時間ウィンドウ関数と一緒に使用する必要があります。

### TIME ATTRIBUTES {#time-attributes}

ウィンドウビューは**処理時間**と**イベント時間**プロセスをサポートします。

**処理時間**は、ウィンドウビューがローカルマシンの時間に基づいて結果を生成することを許可し、デフォルトで使用されます。これは最も直接的な時間の概念ですが、決定論を提供しません。処理時間属性は、時間ウィンドウ関数の`time_attr`をテーブルのカラムに設定するか、関数`now()`を使用することで定義できます。次のクエリは処理時間を持つウィンドウビューを作成します。

```sql
CREATE WINDOW VIEW wv AS SELECT count(number), tumbleStart(w_id) as w_start from date GROUP BY tumble(now(), INTERVAL '5' SECOND) as w_id
```

**イベント時間**は、各個別イベントがその生成デバイスで発生した時間です。この時間は通常、生成されるときにレコード内に埋め込まれます。イベント時間の処理は、順番が狂ったイベントや遅れたイベントのケースでも一貫した結果を提供します。ウィンドウビューは`WATERMARK`構文を使ってイベント時間処理をサポートします。

ウィンドウビューは3つのウォーターマーク戦略を提供します：

* `STRICTLY_ASCENDING`: これまでに観測された最大タイムスタンプのウォーターマークを発行します。最大タイムスタンプよりも小さいタイムスタンプを持つ行は遅れていません。
* `ASCENDING`: これまでに観測された最大タイムスタンプから1を引いたウォーターマークを発行します。最大タイムスタンプと等しいかそれより小さいタイムスタンプを持つ行は遅れていません。
* `BOUNDED`: WATERMARK=INTERVAL。指定された遅延を差し引いた最大観測タイムスタンプのウォーターマークを発行します。

次のクエリは、`WATERMARK`を使用してウィンドウビューを作成する例です：

```sql
CREATE WINDOW VIEW wv WATERMARK=STRICTLY_ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=INTERVAL '3' SECOND AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
```

デフォルトでは、ウォーターマークが到着したときにウィンドウが発火し、ウォーターマークの後に到着した要素は破棄されます。ウィンドウビューは、`ALLOWED_LATENESS=INTERVAL`を設定することで遅れたイベント処理をサポートします。遅れを処理する例は次のとおりです：

```sql
CREATE WINDOW VIEW test.wv TO test.dst WATERMARK=ASCENDING ALLOWED_LATENESS=INTERVAL '2' SECOND AS SELECT count(a) AS count, tumbleEnd(wid) AS w_end FROM test.mt GROUP BY tumble(timestamp, INTERVAL '5' SECOND) AS wid;
```

遅れて発火した要素は、前回の計算の更新結果として扱うべきであることに注意してください。ウィンドウの最後ではなく、遅れたイベントが到着したときにウィンドウビューが発火します。したがって、同じウィンドウに対して複数の出力が結果として現れます。ユーザーは、これらの重複した結果を考慮するか、重複を排除する必要があります。

ウィンドウビューで指定された`SELECT`クエリを変更するには、`ALTER TABLE ... MODIFY QUERY`ステートメントを使用します。新しい`SELECT`クエリによって生成されるデータ構造は、`TO [db.]name`句の有無にかかわらず、元の`SELECT`クエリと同じでなければなりません。この場合、現在のウィンドウ内のデータは失われるため、中間状態を再利用することはできません。

### Monitoring New Windows {#monitoring-new-windows}

ウィンドウビューは、変更を監視するために[WATCH](../../../sql-reference/statements/watch.md)クエリをサポートしています。または、`TO`構文を使用して結果をテーブルに出力できます。

```sql
WATCH [db.]window_view
[EVENTS]
[LIMIT n]
[FORMAT format]
```

`WATCH`クエリは`LIVE VIEW`と同様に機能します。クエリ結果の代わりに、最新のクエリウォーターマークを取得する短縮形の`WATCH`クエリを使用することができます。

### Settings {#settings-1}

- `window_view_clean_interval`: 古いデータを解放するためのウィンドウビューのクリーン間隔（秒単位）。システムは、システム時間または`WATERMARK`設定に従って完全にトリガーされていないウィンドウを保持し、他のデータは削除します。
- `window_view_heartbeat_interval`: ウォッチクエリが生きていることを示すためのハートビート間隔（秒単位）。
- `wait_for_window_view_fire_signal_timeout`: イベント時間処理におけるウィンドウビュー発火信号を待つ際のタイムアウト。

### Example {#example}

クリックログの数を10秒ごとにカウントする必要がある`data`というログテーブルの構造は次の通りです。

```sql
CREATE TABLE data ( `id` UInt64, `timestamp` DateTime) ENGINE = Memory;
```

まず、10秒インターバルのタムブルウィンドウを持つウィンドウビューを作成します。

```sql
CREATE WINDOW VIEW wv as select count(id), tumbleStart(w_id) as window_start from data group by tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

次に、`WATCH`クエリを使用して結果を取得します。

```sql
WATCH wv
```

ログがテーブル`data`に挿入されると、

```sql
INSERT INTO data VALUES(1,now())
```

`WATCH`クエリは次の結果を印刷するはずです:

```text
┌─count(id)─┬────────window_start─┐
│         1 │ 2020-01-14 16:56:40 │
└───────────┴─────────────────────┘
```

または、出力を別のテーブルに`TO`構文を使用して接続することができます。

```sql
CREATE WINDOW VIEW wv TO dst AS SELECT count(id), tumbleStart(w_id) as window_start FROM data GROUP BY tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

ClickHouseのステートフルテストの中に追加の例が含まれています（そこでは`*window_view*`と名付けられています）。

### Window View Usage {#window-view-usage}

ウィンドウビューは以下のシナリオで有用です：

* **監視**: 時間に基づいてメトリックログを集計・計算し、対象テーブルに結果を出力します。ダッシュボードは対象テーブルをソーステーブルとして利用できます。
* **分析**: 自動的に時間ウィンドウ内のデータを集計・前処理します。これは、多数のログを分析する際に便利です。前処理により、複数のクエリでの再計算が排除され、クエリの遅延が減少します。

## Related Content {#related-content}

- Blog: [ClickHouseにおける時系列データの操作](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- Blog: [ClickHouseを用いた可観測性ソリューションの構築 - パート2 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)

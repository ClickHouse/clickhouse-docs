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


# CREATE VIEW

新しいビューを作成します。ビューには、[通常ビュー](#normal-view)、[マテリアライズドビュー](#materialized-view)、[リフレッシュ可能マテリアライズドビュー](#refreshable-materialized-view)、および [ウィンドウビュー](/sql-reference/statements/create/view#window-view) があります。



## 通常ビュー {#normal-view}

構文:

```sql
CREATE [OR REPLACE] VIEW [IF NOT EXISTS] [db.]table_name [(alias1 [, alias2 ...])] [ON CLUSTER cluster_name]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

通常ビューはデータを保存しません。アクセスごとに別のテーブルからの読み取りを実行するだけです。つまり、通常ビューは保存されたクエリに他なりません。ビューから読み取る際、この保存されたクエリは[FROM](../../../sql-reference/statements/select/from.md)句内のサブクエリとして使用されます。

例として、以下のようなビューを作成したとします:

```sql
CREATE VIEW view AS SELECT ...
```

そして以下のようなクエリを記述したとします:

```sql
SELECT a, b, c FROM view
```

このクエリは、以下のサブクエリを使用することと完全に等価です:

```sql
SELECT a, b, c FROM (SELECT ...)
```


## パラメータ化ビュー {#parameterized-view}

パラメータ化ビューは通常のビューと似ていますが、即座に解決されないパラメータを指定して作成できます。これらのビューはテーブル関数として使用でき、ビュー名を関数名として、パラメータ値を引数として指定します。

```sql
CREATE VIEW view AS SELECT * FROM TABLE WHERE Column1={column1:datatype1} and Column2={column2:datatype2} ...
```

上記はテーブルに対するビューを作成し、以下のようにパラメータを置き換えることでテーブル関数として使用できます。

```sql
SELECT * FROM view(column1=value1, column2=value2 ...)
```


## マテリアライズドビュー {#materialized-view}

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster_name] [TO[db.]name [(columns)]] [ENGINE = engine] [POPULATE]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

:::tip
[マテリアライズドビュー](/guides/developer/cascading-materialized-views.md)の使用に関するステップバイステップガイドはこちらです。
:::

マテリアライズドビューは、対応する[SELECT](../../../sql-reference/statements/select/index.md)クエリによって変換されたデータを保存します。

`TO [db].[table]`を指定せずにマテリアライズドビューを作成する場合、データを保存するためのテーブルエンジンである`ENGINE`を指定する必要があります。

`TO [db].[table]`を指定してマテリアライズドビューを作成する場合、`POPULATE`を同時に使用することはできません。

マテリアライズドビューは次のように実装されています。`SELECT`で指定されたテーブルにデータを挿入する際、挿入されたデータの一部がこの`SELECT`クエリによって変換され、その結果がビューに挿入されます。

:::note
ClickHouseのマテリアライズドビューは、宛先テーブルへの挿入時に列の順序ではなく**列名**を使用します。`SELECT`クエリの結果に一部の列名が存在しない場合、その列が[Nullable](../../data-types/nullable.md)でなくても、ClickHouseはデフォルト値を使用します。マテリアライズドビューを使用する際は、すべての列にエイリアスを追加することが安全な方法です。

ClickHouseのマテリアライズドビューは、挿入トリガーのように実装されています。ビュークエリに集約が含まれている場合、それは新しく挿入されたデータのバッチにのみ適用されます。ソーステーブルの既存データへの変更(更新、削除、パーティションの削除など)は、マテリアライズドビューに反映されません。

ClickHouseのマテリアライズドビューは、エラーが発生した場合に決定論的な動作をしません。これは、既に書き込まれたブロックは宛先テーブルに保持されますが、エラー後のすべてのブロックは保持されないことを意味します。

デフォルトでは、いずれかのビューへのプッシュが失敗すると、INSERTクエリも失敗し、一部のブロックが宛先テーブルに書き込まれない可能性があります。これは`materialized_views_ignore_errors`設定を使用して変更できます(`INSERT`クエリに対して設定する必要があります)。`materialized_views_ignore_errors=true`を設定すると、ビューへのプッシュ中のエラーはすべて無視され、すべてのブロックが宛先テーブルに書き込まれます。

また、`system.*_log`テーブルでは、`materialized_views_ignore_errors`がデフォルトで`true`に設定されていることに注意してください。
:::

`POPULATE`を指定すると、ビューの作成時に既存のテーブルデータがビューに挿入されます。これは`CREATE TABLE ... AS SELECT ...`を実行するのと同様です。それ以外の場合、クエリにはビュー作成後にテーブルに挿入されたデータのみが含まれます。ビュー作成中にテーブルに挿入されたデータはビューに挿入されないため、`POPULATE`の使用は**推奨しません**。

:::note
`POPULATE`は`CREATE TABLE ... AS SELECT ...`のように動作するため、次の制限があります。

- Replicatedデータベースではサポートされていません
- ClickHouse Cloudではサポートされていません

代わりに、別途`INSERT ... SELECT`を使用できます。
:::

`SELECT`クエリには`DISTINCT`、`GROUP BY`、`ORDER BY`、`LIMIT`を含めることができます。対応する変換は、挿入されたデータの各ブロックに対して独立して実行されることに注意してください。たとえば、`GROUP BY`が設定されている場合、データは挿入時に集約されますが、挿入されたデータの単一パケット内でのみ集約されます。データはそれ以上集約されません。例外は、`SummingMergeTree`のようにデータ集約を独立して実行する`ENGINE`を使用する場合です。

マテリアライズドビューに対する[ALTER](/sql-reference/statements/alter/view.md)クエリの実行には制限があります。たとえば、`SELECT`クエリを更新することはできないため、不便な場合があります。マテリアライズドビューが`TO [db.]name`構文を使用している場合、ビューを`DETACH`し、ターゲットテーブルに対して`ALTER`を実行してから、以前にデタッチした(`DETACH`)ビューを`ATTACH`することができます。

マテリアライズドビューは[optimize_on_insert](/operations/settings/settings#optimize_on_insert)設定の影響を受けることに注意してください。データはビューへの挿入前にマージされます。

ビューは通常のテーブルと同じように見えます。たとえば、`SHOW TABLES`クエリの結果に表示されます。

ビューを削除するには、[DROP VIEW](../../../sql-reference/statements/drop.md#drop-view)を使用します。ただし、`DROP TABLE`もビューに対して機能します。


## SQLセキュリティ {#sql_security}

`DEFINER`と`SQL SECURITY`を使用すると、ビューの基礎となるクエリを実行する際に使用するClickHouseユーザーを指定できます。
`SQL SECURITY`には3つの有効な値があります：`DEFINER`、`INVOKER`、または`NONE`。`DEFINER`句では、既存の任意のユーザーまたは`CURRENT_USER`を指定できます。

次の表は、ビューから選択するために、どのユーザーにどの権限が必要かを説明しています。
なお、SQLセキュリティオプションに関係なく、すべての場合において、ビューから読み取るには`GRANT SELECT ON <view>`が必要です。

| SQLセキュリティオプション | ビュー                                                            | マテリアライズドビュー                                                                                                 |
| ------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `DEFINER alice`     | `alice`はビューのソーステーブルに対する`SELECT`権限を持つ必要があります。 | `alice`はビューのソーステーブルに対する`SELECT`権限と、ビューのターゲットテーブルに対する`INSERT`権限を持つ必要があります。 |
| `INVOKER`           | ユーザーはビューのソーステーブルに対する`SELECT`権限を持つ必要があります。    | `SQL SECURITY INVOKER`はマテリアライズドビューには指定できません。                                                 |
| `NONE`              | -                                                               | -                                                                                                                 |

:::note
`SQL SECURITY NONE`は非推奨のオプションです。`SQL SECURITY NONE`でビューを作成する権限を持つユーザーは、任意のクエリを実行できるようになります。
したがって、このオプションでビューを作成するには、`GRANT ALLOW SQL SECURITY NONE TO <user>`が必要です。
:::

`DEFINER`/`SQL SECURITY`が指定されていない場合、デフォルト値が使用されます：

- `SQL SECURITY`：通常のビューでは`INVOKER`、マテリアライズドビューでは`DEFINER`（[設定で構成可能](../../../operations/settings/settings.md#default_normal_view_sql_security)）
- `DEFINER`：`CURRENT_USER`（[設定で構成可能](../../../operations/settings/settings.md#default_view_definer)）

`DEFINER`/`SQL SECURITY`を指定せずにビューがアタッチされた場合、デフォルト値はマテリアライズドビューでは`SQL SECURITY NONE`、通常のビューでは`SQL SECURITY INVOKER`となります。

既存のビューのSQLセキュリティを変更するには、次を使用します：

```sql
ALTER TABLE MODIFY SQL SECURITY { DEFINER | INVOKER | NONE } [DEFINER = { user | CURRENT_USER }]
```

### 例 {#examples}

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


## ライブビュー {#live-view}

<DeprecatedBadge />

この機能は非推奨であり、将来的に削除される予定です。

旧ドキュメントは[こちら](https://pastila.nl/?00f32652/fdf07272a7b54bda7e13b919264e449f.md)をご参照ください。


## リフレッシュ可能なマテリアライズドビュー {#refreshable-materialized-view}

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

ここで `interval` は単純な間隔のシーケンスです：

```sql
number SECOND|MINUTE|HOUR|DAY|WEEK|MONTH|YEAR
```

対応するクエリを定期的に実行し、その結果をテーブルに格納します。

- クエリに `APPEND` が指定されている場合、各リフレッシュは既存の行を削除せずにテーブルに行を挿入します。この挿入は通常のINSERT SELECTと同様にアトミックではありません。
- それ以外の場合、各リフレッシュはテーブルの以前の内容をアトミックに置き換えます。

通常のリフレッシュ不可能なマテリアライズドビューとの違い：

- 挿入トリガーがありません。つまり、SELECTで指定されたテーブルに新しいデータが挿入されても、リフレッシュ可能なマテリアライズドビューに自動的にプッシュされることは_ありません_。定期的なリフレッシュがクエリ全体を実行します。
- SELECTクエリに制限がありません。テーブル関数（例：`url()`）、ビュー、UNION、JOINなど、すべて使用可能です。

:::note
クエリの `REFRESH ... SETTINGS` 部分の設定はリフレッシュ設定（例：`refresh_retries`）であり、通常の設定（例：`max_threads`）とは異なります。通常の設定はクエリの最後に `SETTINGS` を使用して指定できます。
:::

### リフレッシュスケジュール {#refresh-schedule}

リフレッシュスケジュールの例：

```sql
REFRESH EVERY 1 DAY -- 毎日、午前0時（UTC）
REFRESH EVERY 1 MONTH -- 毎月1日、午前0時
REFRESH EVERY 1 MONTH OFFSET 5 DAY 2 HOUR -- 毎月6日、午前2時
REFRESH EVERY 2 WEEK OFFSET 5 DAY 15 HOUR 10 MINUTE -- 隔週土曜日、午後3時10分
REFRESH EVERY 30 MINUTE -- 00:00、00:30、01:00、01:30など
REFRESH AFTER 30 MINUTE -- 前回のリフレッシュ完了後30分、時刻との整合性なし
-- REFRESH AFTER 1 HOUR OFFSET 1 MINUTE -- 構文エラー、AFTERではOFFSETは使用できません
REFRESH EVERY 1 WEEK 2 DAYS -- 9日ごと、特定の曜日や月の日付ではない；
                            -- 具体的には、日数（1969-12-29以降）が9で割り切れる場合
REFRESH EVERY 5 MONTHS -- 5か月ごと、毎年異なる月（12は5で割り切れないため）；
                       -- 具体的には、月数（1970-01以降）が5で割り切れる場合
```

`RANDOMIZE FOR` は各リフレッシュの時刻をランダムに調整します。例：

```sql
REFRESH EVERY 1 DAY OFFSET 2 HOUR RANDOMIZE FOR 1 HOUR -- 毎日01:30から02:30の間のランダムな時刻
```

特定のビューに対して、同時に実行できるリフレッシュは最大1つです。例えば、`REFRESH EVERY 1 MINUTE` のビューがリフレッシュに2分かかる場合、2分ごとにリフレッシュされます。その後、高速化して10秒でリフレッシュできるようになった場合、1分ごとのリフレッシュに戻ります。（特に、未実行のリフレッシュのバックログに追いつくために10秒ごとにリフレッシュすることはありません - そのようなバックログは存在しません。）

さらに、`CREATE` クエリで `EMPTY` が指定されていない限り、マテリアライズドビューの作成直後にリフレッシュが開始されます。`EMPTY` が指定されている場合、最初のリフレッシュはスケジュールに従って実行されます。

### レプリケートされたデータベース内 {#in-replicated-db}

リフレッシュ可能なマテリアライズドビューが[レプリケートされたデータベース](../../../engines/database-engines/replicated.md)内にある場合、レプリカは互いに調整し、各スケジュールされた時刻に1つのレプリカのみがリフレッシュを実行します。すべてのレプリカがリフレッシュによって生成されたデータを参照できるように、[ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md)テーブルエンジンが必要です。

`APPEND` モードでは、`SETTINGS all_replicas = 1` を使用して調整を無効にできます。これにより、レプリカは互いに独立してリフレッシュを実行します。この場合、ReplicatedMergeTreeは必要ありません。


非`APPEND`モードでは、協調リフレッシュのみがサポートされています。非協調の場合は、`Atomic`データベースと`CREATE ... ON CLUSTER`クエリを使用して、すべてのレプリカにリフレッシュ可能なマテリアライズドビューを作成してください。

協調はKeeperを通じて行われます。znodeパスは[default_replica_path](../../../operations/server-configuration-parameters/settings.md#default_replica_path)サーバー設定によって決定されます。

### 依存関係 {#refresh-dependencies}

`DEPENDS ON`は異なるテーブルのリフレッシュを同期します。例として、2つのリフレッシュ可能なマテリアライズドビューのチェーンがあるとします:

```sql
CREATE MATERIALIZED VIEW source REFRESH EVERY 1 DAY AS SELECT * FROM url(...)
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY AS SELECT ... FROM source
```

`DEPENDS ON`がない場合、両方のビューは深夜にリフレッシュを開始し、`destination`は通常`source`の前日のデータを参照します。依存関係を追加すると:

```sql
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY DEPENDS ON source AS SELECT ... FROM source
```

`destination`のリフレッシュは、その日の`source`のリフレッシュが完了した後にのみ開始されるため、`destination`は最新のデータに基づくことになります。

あるいは、同じ結果を次のように達成できます:

```sql
CREATE MATERIALIZED VIEW destination REFRESH AFTER 1 HOUR DEPENDS ON source AS SELECT ... FROM source
```

ここで`1 HOUR`は`source`のリフレッシュ期間より短い任意の期間を指定できます。依存テーブルは、その依存関係のいずれよりも頻繁にリフレッシュされることはありません。これは、実際のリフレッシュ期間を複数回指定することなく、リフレッシュ可能なビューのチェーンを設定する有効な方法です。

さらにいくつかの例:

- `REFRESH EVERY 1 DAY OFFSET 10 MINUTE` (`destination`)が`REFRESH EVERY 1 DAY` (`source`)に依存<br/>
  `source`のリフレッシュが10分以上かかる場合、`destination`はそれを待ちます。
- `REFRESH EVERY 1 DAY OFFSET 1 HOUR`が`REFRESH EVERY 1 DAY OFFSET 23 HOUR`に依存<br/>
  上記と同様ですが、対応するリフレッシュが異なる暦日に発生します。
  X+1日目の`destination`のリフレッシュは、X日目の`source`のリフレッシュを待ちます(2時間以上かかる場合)。
- `REFRESH EVERY 2 HOUR`が`REFRESH EVERY 1 HOUR`に依存<br/>
  2時間ごとのリフレッシュは、1時間ごとのリフレッシュの後、1時間おきに発生します。例えば、深夜のリフレッシュの後、次に午前2時のリフレッシュの後、などです。
- `REFRESH EVERY 1 MINUTE`が`REFRESH EVERY 2 HOUR`に依存<br/>
  `REFRESH AFTER 1 MINUTE`が`REFRESH EVERY 2 HOUR`に依存<br/>
  `REFRESH AFTER 1 MINUTE`が`REFRESH AFTER 2 HOUR`に依存<br/>
  `destination`は各`source`のリフレッシュ後に1回リフレッシュされます。つまり2時間ごとです。`1 MINUTE`は事実上無視されます。
- `REFRESH AFTER 1 HOUR`が`REFRESH AFTER 1 HOUR`に依存<br/>
  現在、これは推奨されません。

:::note
`DEPENDS ON`はリフレッシュ可能なマテリアライズドビュー間でのみ機能します。`DEPENDS ON`リストに通常のテーブルを記載すると、ビューが一切リフレッシュされなくなります(依存関係は`ALTER`で削除できます。以下を参照)。
:::

### 設定 {#settings}

利用可能なリフレッシュ設定:

- `refresh_retries` - リフレッシュクエリが例外で失敗した場合の再試行回数。すべての再試行が失敗した場合、次のスケジュールされたリフレッシュ時刻にスキップします。0は再試行なし、-1は無限再試行を意味します。デフォルト: 0。
- `refresh_retry_initial_backoff_ms` - `refresh_retries`がゼロでない場合の最初の再試行前の遅延。その後の各再試行では遅延が2倍になり、`refresh_retry_max_backoff_ms`まで増加します。デフォルト: 100ミリ秒。
- `refresh_retry_max_backoff_ms` - リフレッシュ試行間の遅延の指数的増加の上限。デフォルト: 60000ミリ秒(1分)。

### リフレッシュパラメータの変更 {#changing-refresh-parameters}

リフレッシュパラメータを変更するには:

```sql
ALTER TABLE [db.]name MODIFY REFRESH EVERY|AFTER ... [RANDOMIZE FOR ...] [DEPENDS ON ...] [SETTINGS ...]
```

:::note
これは_すべての_リフレッシュパラメータを一度に置き換えます: スケジュール、依存関係、設定、およびAPPEND性。例えば、テーブルに`DEPENDS ON`があった場合、`DEPENDS ON`なしで`MODIFY REFRESH`を実行すると依存関係が削除されます。
:::

### その他の操作 {#other-operations}


すべてのリフレッシュ可能なマテリアライズドビューの状態は、テーブル [`system.view_refreshes`](../../../operations/system-tables/view_refreshes.md) で確認できます。特にこのテーブルには、（実行中であれば）リフレッシュの進捗状況、直近および次回のリフレッシュ時刻、リフレッシュが失敗した場合の例外メッセージが含まれます。

リフレッシュを手動で停止、開始、トリガー、キャンセルするには、[`SYSTEM STOP|START|REFRESH|WAIT|CANCEL VIEW`](../system.md#refreshable-materialized-views) を使用します。

リフレッシュが完了するまで待機するには、[`SYSTEM WAIT VIEW`](../system.md#refreshable-materialized-views) を使用します。特に、ビュー作成後の初回リフレッシュが完了するまで待つ場合に有用です。

:::note
余談ですが、リフレッシュクエリは、リフレッシュ対象のビューから読み取ることができ、その際はリフレッシュ前のバージョンのデータが見えます。つまり、Conway のライフゲームを実装できます: https://pastila.nl/?00021a4b/d6156ff819c83d490ad2dcec05676865#O0LGWTO7maUQIA4AcGUtlA==
:::



## ウィンドウビュー {#window-view}

<ExperimentalBadge />
<CloudNotSupportedBadge />

:::info
これは実験的機能であり、将来のリリースで後方互換性のない変更が行われる可能性があります。ウィンドウビューと`WATCH`クエリを使用するには、[allow_experimental_window_view](/operations/settings/settings#allow_experimental_window_view)設定を有効にしてください。コマンド`set allow_experimental_window_view = 1`を実行します。
:::

```sql
CREATE WINDOW VIEW [IF NOT EXISTS] [db.]table_name [TO [db.]table_name] [INNER ENGINE engine] [ENGINE engine] [WATERMARK strategy] [ALLOWED_LATENESS interval_function] [POPULATE]
AS SELECT ...
GROUP BY time_window_function
[COMMENT 'comment']
```

ウィンドウビューは時間ウィンドウごとにデータを集約し、ウィンドウの発火準備が整った時点で結果を出力します。レイテンシを削減するために部分集約結果を内部（または指定された）テーブルに格納し、処理結果を指定されたテーブルにプッシュしたり、WATCHクエリを使用して通知を送信したりできます。

ウィンドウビューの作成は`MATERIALIZED VIEW`の作成と似ています。ウィンドウビューは中間データを格納するための内部ストレージエンジンが必要です。内部ストレージは`INNER ENGINE`句を使用して指定でき、指定しない場合はデフォルトで`AggregatingMergeTree`が使用されます。

`TO [db].[table]`を指定せずにウィンドウビューを作成する場合は、データを格納するためのテーブルエンジンとして`ENGINE`を指定する必要があります。

### 時間ウィンドウ関数 {#time-window-functions}

[時間ウィンドウ関数](../../functions/time-window-functions.md)は、レコードのウィンドウの下限と上限を取得するために使用されます。ウィンドウビューは時間ウィンドウ関数と組み合わせて使用する必要があります。

### 時間属性 {#time-attributes}

ウィンドウビューは**処理時刻**と**イベント時刻**の処理をサポートしています。

**処理時刻**はローカルマシンの時刻に基づいてウィンドウビューが結果を生成することを可能にし、デフォルトで使用されます。これは最も単純な時刻の概念ですが、決定性は提供されません。処理時刻属性は、時間ウィンドウ関数の`time_attr`をテーブルカラムに設定するか、`now()`関数を使用することで定義できます。以下のクエリは処理時刻を使用したウィンドウビューを作成します。

```sql
CREATE WINDOW VIEW wv AS SELECT count(number), tumbleStart(w_id) as w_start from date GROUP BY tumble(now(), INTERVAL '5' SECOND) as w_id
```

**イベント時刻**は、各個別イベントがその生成デバイス上で発生した時刻です。この時刻は通常、生成時にレコード内に埋め込まれます。イベント時刻処理により、順序が乱れたイベントや遅延イベントの場合でも一貫した結果を得ることができます。ウィンドウビューは`WATERMARK`構文を使用してイベント時刻処理をサポートしています。

ウィンドウビューは3つのウォーターマーク戦略を提供します：

- `STRICTLY_ASCENDING`: これまでに観測された最大タイムスタンプのウォーターマークを発行します。最大タイムスタンプより小さいタイムスタンプを持つ行は遅延とみなされません。
- `ASCENDING`: これまでに観測された最大タイムスタンプから1を引いたウォーターマークを発行します。最大タイムスタンプ以下のタイムスタンプを持つ行は遅延とみなされません。
- `BOUNDED`: WATERMARK=INTERVAL。観測された最大タイムスタンプから指定された遅延時間を引いたウォーターマークを発行します。

以下のクエリは`WATERMARK`を使用したウィンドウビューの作成例です：

```sql
CREATE WINDOW VIEW wv WATERMARK=STRICTLY_ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=INTERVAL '3' SECOND AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
```

デフォルトでは、ウォーターマークが到達するとウィンドウが発火し、ウォーターマークより後に到着した要素は破棄されます。ウィンドウビューは`ALLOWED_LATENESS=INTERVAL`を設定することで遅延イベント処理をサポートします。遅延処理の例は以下の通りです：

```sql
CREATE WINDOW VIEW test.wv TO test.dst WATERMARK=ASCENDING ALLOWED_LATENESS=INTERVAL '2' SECOND AS SELECT count(a) AS count, tumbleEnd(wid) AS w_end FROM test.mt GROUP BY tumble(timestamp, INTERVAL '5' SECOND) AS wid;
```

遅延発火によって発行される要素は、以前の計算の更新結果として扱う必要があることに注意してください。ウィンドウの終了時に発火する代わりに、ウィンドウビューは遅延イベントが到着すると即座に発火します。したがって、同じウィンドウに対して複数の出力が生成されます。ユーザーはこれらの重複した結果を考慮するか、重複排除を行う必要があります。


`ALTER TABLE ... MODIFY QUERY`ステートメントを使用して、ウィンドウビューで指定された`SELECT`クエリを変更できます。新しい`SELECT`クエリの結果として得られるデータ構造は、`TO [db.]name`句の有無にかかわらず、元の`SELECT`クエリと同じである必要があります。中間状態を再利用できないため、現在のウィンドウ内のデータは失われることに注意してください。

### 新しいウィンドウの監視 {#monitoring-new-windows}

ウィンドウビューは、変更を監視するための[WATCH](../../../sql-reference/statements/watch.md)クエリをサポートしており、`TO`構文を使用して結果をテーブルに出力することもできます。

```sql
WATCH [db.]window_view
[EVENTS]
[LIMIT n]
[FORMAT format]
```

`LIMIT`を指定して、クエリを終了する前に受信する更新の数を設定できます。`EVENTS`句を使用すると、`WATCH`クエリの短縮形式を取得でき、クエリ結果の代わりに最新のクエリウォーターマークのみを取得できます。

### 設定 {#settings-1}

- `window_view_clean_interval`: 古いデータを解放するためのウィンドウビューのクリーン間隔(秒単位)。システムは、システム時刻または`WATERMARK`設定に従って完全にトリガーされていないウィンドウを保持し、その他のデータは削除されます。
- `window_view_heartbeat_interval`: watchクエリが有効であることを示すハートビート間隔(秒単位)。
- `wait_for_window_view_fire_signal_timeout`: イベント時刻処理におけるウィンドウビューのファイアシグナルを待機するためのタイムアウト。

### 例 {#example}

`data`というログテーブルで10秒ごとのクリックログの数をカウントする必要があるとします。そのテーブル構造は次のとおりです:

```sql
CREATE TABLE data ( `id` UInt64, `timestamp` DateTime) ENGINE = Memory;
```

まず、10秒間隔のタンブルウィンドウを持つウィンドウビューを作成します:

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

`WATCH`クエリは次のように結果を出力します:

```text
┌─count(id)─┬────────window_start─┐
│         1 │ 2020-01-14 16:56:40 │
└───────────┴─────────────────────┘
```

または、`TO`構文を使用して出力を別のテーブルに接続できます。

```sql
CREATE WINDOW VIEW wv TO dst AS SELECT count(id), tumbleStart(w_id) as window_start FROM data GROUP BY tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

追加の例は、ClickHouseのステートフルテストの中に見つけることができます(そこでは`*window_view*`という名前が付けられています)。

### ウィンドウビューの使用方法 {#window-view-usage}

ウィンドウビューは次のシナリオで有用です:

- **監視**: メトリクスログを時間ごとに集計および計算し、結果をターゲットテーブルに出力します。ダッシュボードはターゲットテーブルをソーステーブルとして使用できます。
- **分析**: 時間ウィンドウ内のデータを自動的に集計および前処理します。これは大量のログを分析する際に有用です。前処理により、複数のクエリでの繰り返し計算が排除され、クエリのレイテンシが削減されます。


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- ブログ: [ClickHouseで可観測性ソリューションを構築する - パート2 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)


## 一時ビュー {#temporary-views}

ClickHouseは**一時ビュー**をサポートしており、以下の特性を持ちます(該当する場合は一時テーブルと同様です):

- **セッション有効期間**
  一時ビューは現在のセッションの期間中のみ存在します。セッションが終了すると自動的に削除されます。

- **データベースなし**
  一時ビューにデータベース名を指定することは**できません**。データベースの外側(セッション名前空間)に存在します。

- **レプリケーションなし / ON CLUSTERなし**
  一時オブジェクトはセッションにローカルであり、`ON CLUSTER`で作成することは**できません**。

- **名前解決**
  一時オブジェクト(テーブルまたはビュー)が永続オブジェクトと同じ名前を持ち、クエリがデータベース**なし**でその名前を参照する場合、**一時**オブジェクトが使用されます。

- **論理オブジェクト(ストレージなし)**
  一時ビューは`SELECT`テキストのみを保存します(内部的に`View`ストレージを使用)。データを永続化せず、`INSERT`を受け付けることはできません。

- **エンジン句**
  `ENGINE`を指定する必要は**ありません**。`ENGINE = View`として指定された場合、無視されるか同じ論理ビューとして扱われます。

- **セキュリティ / 権限**
  一時ビューの作成には`CREATE TEMPORARY VIEW`権限が必要であり、これは`CREATE VIEW`によって暗黙的に付与されます。

- **SHOW CREATE**
  一時ビューのDDLを表示するには`SHOW CREATE TEMPORARY VIEW view_name;`を使用します。

### 構文 {#temporary-views-syntax}

```sql
CREATE TEMPORARY VIEW [IF NOT EXISTS] view_name AS <select_query>
```

一時ビューでは`OR REPLACE`は**サポートされていません**(一時テーブルと同様です)。一時ビューを「置き換える」必要がある場合は、削除してから再度作成してください。

### 例 {#temporary-views-examples}

一時ソーステーブルとその上に一時ビューを作成します:

```sql
CREATE TEMPORARY TABLE t_src (id UInt32, val String);
INSERT INTO t_src VALUES (1, 'a'), (2, 'b');

CREATE TEMPORARY VIEW tview AS
SELECT id, upper(val) AS u
FROM t_src
WHERE id <= 2;

SELECT * FROM tview ORDER BY id;
```

DDLを表示します:

```sql
SHOW CREATE TEMPORARY VIEW tview;
```

削除します:

```sql
DROP TEMPORARY VIEW IF EXISTS tview;  -- 一時ビューはTEMPORARY TABLE構文で削除されます
```

### 禁止事項 / 制限事項 {#temporary-views-limitations}

- `CREATE OR REPLACE TEMPORARY VIEW ...` → **許可されていません**(`DROP` + `CREATE`を使用してください)。
- `CREATE TEMPORARY MATERIALIZED VIEW ...` / `WINDOW VIEW` → **許可されていません**。
- `CREATE TEMPORARY VIEW db.view AS ...` → **許可されていません**(データベース修飾子なし)。
- `CREATE TEMPORARY VIEW view ON CLUSTER 'name' AS ...` → **許可されていません**(一時オブジェクトはセッションローカルです)。
- `POPULATE`、`REFRESH`、`TO [db.table]`、内部エンジン、およびすべてのマテリアライズドビュー固有の句 → 一時ビューには**適用されません**。

### 分散クエリに関する注意事項 {#temporary-views-distributed-notes}

一時**ビュー**は単なる定義であり、受け渡すデータはありません。一時ビューが一時**テーブル**(例:`Memory`)を参照している場合、分散クエリ実行中にそのデータは一時テーブルと同じ方法でリモートサーバーに送信されます。

#### 例 {#temporary-views-distributed-example}

```sql
-- セッションスコープのインメモリテーブル
CREATE TEMPORARY TABLE temp_ids (id UInt64) ENGINE = Memory;

INSERT INTO temp_ids VALUES (1), (5), (42);

-- 一時テーブル上のセッションスコープビュー(純粋に論理的)
CREATE TEMPORARY VIEW v_ids AS
SELECT id FROM temp_ids;

-- 'test'をクラスタ名に置き換えてください。
-- GLOBAL JOINはClickHouseに小さい結合側(v_ids経由のtemp_ids)を
-- 左側を実行するすべてのリモートサーバーに*送信*させます。
SELECT count()
FROM cluster('test', system.numbers) AS n
GLOBAL ANY INNER JOIN v_ids USING (id)
WHERE n.number < 100;

```

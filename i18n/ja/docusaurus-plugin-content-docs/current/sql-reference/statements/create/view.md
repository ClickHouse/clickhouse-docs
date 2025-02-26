---
slug: /sql-reference/statements/create/view
sidebar_position: 37
sidebar_label: VIEW
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# CREATE VIEW

新しいビューを作成します。ビューには、[通常の](#normal-view)、[マテリアライズド](#materialized-view)、[リフレッシュ可能なマテリアライズド](#refreshable-materialized-view)、および[ウィンドウ](/sql-reference/statements/create/view#window-view)（リフレッシュ可能なマテリアライズドビューとウィンドウビューは実験的な機能です）があります。

## Normal View {#normal-view}

構文:

``` sql
CREATE [OR REPLACE] VIEW [IF NOT EXISTS] [db.]table_name [(alias1 [, alias2 ...])] [ON CLUSTER cluster_name]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

通常のビューはデータを格納しません。アクセスのたびに別のテーブルから読み取るだけです。言い換えれば、通常のビューは保存されたクエリに他なりません。ビューから読み取るとき、この保存されたクエリは[FROM](../../../sql-reference/statements/select/from.md)句のサブクエリとして使用されます。

例えば、ビューを作成したと仮定します。

``` sql
CREATE VIEW view AS SELECT ...
```

そしてクエリを書きます。

``` sql
SELECT a, b, c FROM view
```

このクエリは次のようにサブクエリを使用することと完全に等しいです。

``` sql
SELECT a, b, c FROM (SELECT ...)
```

## Parameterized View {#parameterized-view}

パラメータ化されたビューは通常のビューに似ていますが、即座に解決されないパラメータを持つことができます。これらのビューは、ビューの名前を関数名、パラメータの値を引数として指定するテーブル関数と共に使用できます。

``` sql
CREATE VIEW view AS SELECT * FROM TABLE WHERE Column1={column1:datatype1} and Column2={column2:datatype2} ...
```
上記は、下記のようにパラメータを置き換えることでテーブル関数として使用できるビューを作成します。

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
こちらは[マテリアライズドビュー](/guides/developer/cascading-materialized-views.md)の使用に関するステップバイステップのガイドです。
:::

マテリアライズドビューは、対応する[SELECT](../../../sql-reference/statements/select/index.md)クエリによって変換されたデータを格納します。

`TO [db].[table]`なしでマテリアライズドビューを作成する場合は、データを格納するためのテーブルエンジンである`ENGINE`を指定する必要があります。

`TO [db].[table]`を持つマテリアライズドビューを作成する場合、`POPULATE`も使用することはできません。

マテリアライズドビューは以下のように実装されています: `SELECT`で指定されたテーブルにデータを挿入するときに、挿入されたデータの一部がこの`SELECT`クエリによって変換され、その結果がビューに挿入されます。

:::note
ClickHouseのマテリアライズドビューは、デスティネーションテーブルへの挿入時に**カラム名**をカラムの順序の代わりに使用します。`SELECT`クエリの結果にカラム名が存在しない場合、ClickHouseはデフォルト値を使用しますが、カラムが[Nullable](../../data-types/nullable.md)でなくても同様です。マテリアライズドビューを使用する際には、すべてのカラムにエイリアスを追加することをお勧めします。

ClickHouseのマテリアライズドビューは、挿入トリガーのように実装されています。ビューのクエリに集計が含まれている場合、それは新しく挿入されたデータのバッチにのみ適用されます。ソーステーブルの既存のデータに対する変更（更新、削除、パーティションの削除など）は、マテリアライズドビューを変更しません。

ClickHouseのマテリアライズドビューは、エラー発生時には決定論的な動作をしません。これは、すでに書き込まれたブロックはデスティネーションテーブルに保持されますが、エラー以降のすべてのブロックは保持されないことを意味します。

デフォルトでは、ビューの一つへのプッシュが失敗した場合、`INSERT`クエリも失敗し、いくつかのブロックがデスティネーションテーブルに書き込まれない可能性があります。これを変更するには、`materialized_views_ignore_errors`設定を使用します（この設定は`INSERT`クエリに対して設定する必要があります）。`materialized_views_ignore_errors=true`を設定すると、ビューへのプッシュ時に発生したエラーは無視され、すべてのブロックがデスティネーションテーブルに書き込まれます。

また、`materialized_views_ignore_errors`はデフォルトで`system.*_log`テーブルに対して`true`に設定されています。
:::

`POPULATE`を指定すると、既存のテーブルデータがビューに挿入されます。これは、`CREATE TABLE ... AS SELECT ...`を行っているかのようです。そうでない場合、クエリにはビュー作成後に挿入されたデータのみが含まれます。データ挿入時にビューの作成中に挿入されたデータは、ビューに挿入されないため、`POPULATE`の使用は**お勧めしません**。

:::note
`POPULATE`は`CREATE TABLE ... AS SELECT ...`のように動作するため、制限があります:
- 複製データベースではサポートされていません。
- ClickHouseクラウドではサポートされていません。

代わりに、`INSERT ... SELECT`を使用できます。
:::

`SELECT`クエリには`DISTINCT`、`GROUP BY`、`ORDER BY`、`LIMIT`を含めることができます。対応する変換は挿入されたデータの各ブロックで独立して実行されることに注意してください。例えば、`GROUP BY`が設定されている場合、データは挿入中に集計されますが、挿入されたデータのバッチ内だけで行われます。データはさらに集計されません。例外は、`SummingMergeTree`のように独自にデータ集計を行うエンジンを使用する場合です。

マテリアライズドビューに対する[ALTER](/sql-reference/statements/alter/view.md)クエリの実行には制限があります。例えば、`SELECT`クエリを更新することはできませんので、不便な場合があります。マテリアライズドビューが`TO [db.]name`構文を使っている場合、そのビューを`DETACH`して、対象テーブルに対して`ALTER`を実行し、その後に事前にデタッチ（`DETACH`）したビューを`ATTACH`できます。

マテリアライズドビューは[optimize_on_insert](../../../operations/settings/settings.md#optimize-on-insert)設定の影響を受けます。データはビューへの挿入前にマージされます。

ビューは通常のテーブルと同じように見えます。例えば、`SHOW TABLES`クエリの結果に表示されます。

ビューを削除するには、[DROP VIEW](../../../sql-reference/statements/drop.md#drop-view)を使用します。ただし、`DROP TABLE`でもVIEWに対して機能します。

## SQL security {#sql_security}

`DEFINER`と`SQL SECURITY`は、ビューの基になるクエリを実行する際にどのClickHouseユーザーを使用するかを指定できます。
`SQL SECURITY`には三つの有効な値があります: `DEFINER`、`INVOKER`、または`NONE`。`DEFINER`句では、既存のユーザーまたは`CURRENT_USER`を指定できます。

以下の表は、ビューからセレクトするために必要な各ユーザーの権限を説明します。
SQLセキュリティオプションに関係なく、読み取るためには常に`GRANT SELECT ON <view>`が必要です。

| SQLセキュリティオプション | ビュー                                                            | マテリアライズドビュー                                                                                                 |
|---------------------|-----------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| `DEFINER alice`     | `alice`はビューのソーステーブルに対して`SELECT`権限を持っている必要があります。 | `alice`はビューのソーステーブルとビューのターゲットテーブルに対してそれぞれ`SELECT`および`INSERT`権限を持っている必要があります。 |
| `INVOKER`           | ユーザーはビューのソーステーブルに対して`SELECT`権限を持っている必要があります。    | `SQL SECURITY INVOKER`はマテリアライズドビューに対して指定することができません。                                                 |
| `NONE`              | -                                                               | -                                                                                                                 |

:::note
`SQL SECURITY NONE`は廃止されたオプションです。`SQL SECURITY NONE`を使用してビューを作成する権利を持つユーザーは、任意のクエリを実行できるようになります。
したがって、これを作成するには、`GRANT ALLOW SQL SECURITY NONE TO <user>`が必要です。
:::

`DEFINER`/`SQL SECURITY`が指定されていない場合、デフォルト値が使用されます:
- `SQL SECURITY`: 通常のビューには`INVOKER`、マテリアライズドビューには`DEFINER`（[設定で変更可能](../../../operations/settings/settings.md#default_normal_view_sql_security)）
- `DEFINER`: `CURRENT_USER`（[設定で変更可能](../../../operations/settings/settings.md#default_view_definer)）

ビューを`DEFINER`/`SQL SECURITY`を指定せずにアタッチした場合、デフォルト値はマテリアライズドビューには`SQL SECURITY NONE`、通常のビューには`SQL SECURITY INVOKER`として設定されます。

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

この機能は廃止されていますので、将来的に削除されます。

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
AS SELECT ...
[COMMENT 'comment']
```
ここで`interval`は単純な間隔のシーケンスです:
```sql
number SECOND|MINUTE|HOUR|DAY|WEEK|MONTH|YEAR
```

定期的に対応するクエリを実行し、その結果をテーブルに格納します。
 * クエリが`APPEND`と指定している場合、各リフレッシュは既存の行を削除することなくテーブルに行を挿入します。この挿入は通常の`INSERT SELECT`と同様に原子的ではありません。
 * そうでない場合、各リフレッシュはテーブルの以前の内容を原子的に置き換えます。

通常のリフレッシュできないマテリアライズドビューとの違い:
 * 挿入トリガーはありません。つまり、`SELECT`で指定されたテーブルに新しいデータが挿入されると、そのデータはリフレッシュ可能なマテリアライズドビューに*自動的にプッシュ*されることはありません。定期的なリフレッシュは全体のクエリを実行します。
 * `SELECT`クエリに制限はありません。テーブル関数（例:`url()`）、ビュー、UNION、JOINはすべて許可されています。

:::note
`REFRESH ... SETTINGS`部分の設定はリフレッシュ設定であり（例:`refresh_retries`）、通常の設定（例:`max_threads`）とは異なります。通常の設定は、クエリの最後で`SETTINGS`を使用して指定できます。
:::

### Refresh Schedule {#refresh-schedule}

例リフレッシュスケジュール:
```sql
REFRESH EVERY 1 DAY -- 毎日、真夜中に (UTC)
REFRESH EVERY 1 MONTH -- 毎月1日の真夜中に
REFRESH EVERY 1 MONTH OFFSET 5 DAY 2 HOUR -- 毎月6日の午前2時に
REFRESH EVERY 2 WEEK OFFSET 5 DAY 15 HOUR 10 MINUTE -- 毎週土曜日、午後3:10に
REFRESH EVERY 30 MINUTE -- 00:00、00:30、01:00、01:30などに
REFRESH AFTER 30 MINUTE -- 前回のリフレッシュが完了した30分後に、時刻の整列は行われません
-- REFRESH AFTER 1 HOUR OFFSET 1 MINUTE -- 構文エラー、AFTERにはOFFSETは許可されていません
REFRESH EVERY 1 WEEK 2 DAYS --毎9日ごと、特定の日はなく;
                            --具体的には、日数（1969-12-29からの）が9で割り切れる場合
REFRESH EVERY 5 MONTHS -- 毎5ヶ月、毎年異なる月で（12は5で割り切れないため）;
                       --具体的には、月数（1970-01からの）が5で割り切れる場合
```

`RANDOMIZE FOR`は、各リフレッシュの時間をランダムに調整します。例えば：
```sql
REFRESH EVERY 1 DAY OFFSET 2 HOUR RANDOMIZE FOR 1 HOUR -- 毎日、01:30から02:30のランダムな時間に
```

指定されたビューに対して最も1つのリフレッシュしか同時に実行できません。例えば、`REFRESH EVERY 1 MINUTE`のビューがリフレッシュに2分かかる場合、実際には2分ごとにリフレッシュされます。それがより迅速になり、10秒でリフレッシュを開始した場合、再び1分ごとにリフレッシュされます（つまり、10秒ごとにリフレッシュしても遅れを取り戻すことはありません - そのような遅れは存在しません）。

さらに、マテリアライズドビューが作成された直後にリフレッシュが開始されますが、`EMPTY`が`CREATE`クエリに指定されている場合を除きます。`EMPTY`が指定されている場合、最初のリフレッシュはスケジュールに従います。

### In Replicated DB {#in-replicated-db}

リフレッシュ可能なマテリアライズドビューが[レプリケートデータベース](../../../engines/database-engines/replicated.md)にある場合、レプリカは互いに調整し、各スケジュール時に1つのレプリカのみがリフレッシュを行います。[ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md)テーブルエンジンが必要です。これにより、すべてのレプリカがリフレッシュによって生成されたデータを見ることができます。

`APPEND`モードでは、`SETTINGS all_replicas = 1`を使用して調整を無効にできます。これにより、レプリカは互いに独立してリフレッシュを行います。この場合、ReplicatedMergeTreeは必要ありません。

非`APPEND`モードでは、協調リフレッシュのみがサポートされています。非同期リフレッシュを実行するには、Atomicデータベースを使用し、すべてのレプリカでリフレッシュ可能なマテリアライズドビューを作成するために`CREATE ... ON CLUSTER`クエリを使用します。

調整はKeeperを通じて行われます。znodeのパスは、[default_replica_path](../../../operations/server-configuration-parameters/settings.md#default_replica_path)サーバー設定によって決まります。

### Dependencies {#refresh-dependencies}

`DEPENDS ON`は異なるテーブルのリフレッシュを同期します。例えば、リフレッシュ可能なマテリアライズドビューのチェーンがあると仮定します。
```sql
CREATE MATERIALIZED VIEW source REFRESH EVERY 1 DAY AS SELECT * FROM url(...)
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY AS SELECT ... FROM source
```
`DEPENDS ON`なしでは、両方のビューは真夜中にリフレッシュを開始し、`destination`は通常、`source`の昨日のデータを参照します。依存関係を追加した場合：
```sql
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY DEPENDS ON source AS SELECT ... FROM source
```
この場合、`destination`のリフレッシュは、その日の`source`のリフレッシュが完了した後にのみ開始されるため、`destination`は新鮮なデータに基づくことができます。

別の方法として、次のように実行できます：
```sql
CREATE MATERIALIZED VIEW destination REFRESH AFTER 1 HOUR DEPENDS ON source AS SELECT ... FROM source
```
ここで、`1 HOUR`は`source`のリフレッシュ期間より短い任意の期間にすることができます。依存するテーブルは、そのすべての依存関係よりも頻繁にリフレッシュされません。これは、実際のリフレッシュ期間を一度だけ指定してリフレッシュ可能なビューのチェーンを設定する有効な方法です。

さらにいくつかの例：
 * `REFRESH EVERY 1 DAY OFFSET 10 MINUTE`（`destination`）は`REFRESH EVERY 1 DAY`（`source`）に依存します。<br/>
   `source`のリフレッシュが10分以上かかる場合、`destination`はそれを待機します。
 * `REFRESH EVERY 1 DAY OFFSET 1 HOUR`は、`REFRESH EVERY 1 DAY OFFSET 23 HOUR`に依存します。<br/>
   上記と似てはいますが、対応するリフレッシュは異なるカレンダーの日に実行されます。
   `destination`のリフレッシュは、`source`のリフレッシュ（それが2時間以上かかる場合）を待機します。
 * `REFRESH EVERY 2 HOUR`は、`REFRESH EVERY 1 HOUR`に依存します。<br/>
   2時間のリフレッシュは1時間ごとに実行されたリフレッシュの後に行われます。例: 真夜中のリフレッシュの後、次は午前2時のリフレッシュ、などです。
 * `REFRESH EVERY 1 MINUTE`は、`REFRESH EVERY 2 HOUR`に依存します。<br/>
   `REFRESH AFTER 1 MINUTE`は、`REFRESH EVERY 2 HOUR`に依存します。<br/>
   `REFRESH AFTER 1 MINUTE`は、`REFRESH AFTER 2 HOUR`に依存します。<br/>
   `destination`は、各`source`リフレッシュごとに一度リフレッシュされます。つまり、毎2時間ごとです。`1 MINUTE`は効果的に無視されます。
 * `REFRESH AFTER 1 HOUR`は、`REFRESH AFTER 1 HOUR`に依存します。<br/>
   現在、これは推奨されていません。

:::note
`DEPENDS ON`はリフレッシュ可能なマテリアライズドビュー間でのみ機能します。`DEPENDS ON`リストに通常のテーブルをリストアップすると、ビューがリフレッシュされなくなります（依存関係は`ALTER`で削除できます。詳細は下記を参照）。
:::

### Settings {#settings}

利用可能なリフレッシュ設定:
 * `refresh_retries` - リフレッシュクエリが例外で失敗した場合にリトライする回数。すべてのリトライが失敗した場合、次の予定されたリフレッシュ時間にスキップします。0はリトライなし、-1は無限リトライを意味します。デフォルト: 0。
 * `refresh_retry_initial_backoff_ms` - 最初のリトライ前の遅延時間。`refresh_retries`が0でない場合。各次のリトライが遅延時間を2倍にし、`refresh_retry_max_backoff_ms`まで増加します。デフォルト: 100 ms。
 * `refresh_retry_max_backoff_ms` - リフレッシュ試行間の遅延時間の指数成長の制限。デフォルト: 60000 ms（1分）。

### Changing Refresh Parameters {#changing-refresh-parameters}

リフレッシュパラメータを変更するには：
```sql
ALTER TABLE [db.]name MODIFY REFRESH EVERY|AFTER ... [RANDOMIZE FOR ...] [DEPENDS ON ...] [SETTINGS ...]
```

:::note
これはすべてのリフレッシュパラメータを一度に置き換えます: スケジュール、依存関係、設定、およびAPPEND状況。例えば、テーブルに`DEPENDS ON`がある場合、`DEPENDS ON`なしで`MODIFY REFRESH`を実行すると、依存関係が削除されます。
:::

### Other operations {#other-operations}

すべてのリフレッシュ可能なマテリアライズドビューの状態は、テーブル[`system.view_refreshes`](../../../operations/system-tables/view_refreshes.md)で利用可能です。特に、リフレッシュの進捗（実行中の場合）、最後のリフレッシュ時間、次のリフレッシュ時間、リフレッシュが失敗した場合の例外メッセージが含まれます。

手動でリフレッシュを停止、開始、トリガー、またはキャンセルするには[`SYSTEM STOP|START|REFRESH|WAIT|CANCEL VIEW`](../system.md#refreshable-materialized-views)を使用します。

リフレッシュ完了を待つには[`SYSTEM WAIT VIEW`](../system.md#refreshable-materialized-views)を使用します。特に、ビュー作成後の初期リフレッシュの待機に便利です。

:::note
面白い事実: リフレッシュクエリは、リフレッシュ中のビューからの読み取りが許可されていて、データのプレリフレッシュバージョンを見ることができます。これにより、コナウェイのライフゲームを実装できます: https://pastila.nl/?00021a4b/d6156ff819c83d490ad2dcec05676865#O0LGWTO7maUQIA4AcGUtlA==
:::

## Window View {#window-view}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::info
これは実験的な機能であり、将来的なリリースで後方互換性を持たない方法で変更される可能性があります。ウィンドウビューと`WATCH`クエリの使用を有効にするには、[allow_experimental_window_view](../../../operations/settings/settings.md#allow-experimental-window-view)設定を使用します。コマンド`set allow_experimental_window_view = 1`を入力してください。
:::

``` sql
CREATE WINDOW VIEW [IF NOT EXISTS] [db.]table_name [TO [db.]table_name] [INNER ENGINE engine] [ENGINE engine] [WATERMARK strategy] [ALLOWED_LATENESS interval_function] [POPULATE]
AS SELECT ...
GROUP BY time_window_function
[COMMENT 'comment']
```

ウィンドウビューは、時間ウィンドウごとにデータを集約し、ウィンドウが準備できたときに結果を出力します。レイテンシを削減するために部分的な集約結果を内部（または指定された）テーブルに格納し、指定されたテーブルに処理結果をプッシュしたり、`WATCH`クエリを使用して通知をプッシュできます。

ウィンドウビューを作成することは、`MATERIALIZED VIEW`を作成することに似ています。ウィンドウビューには中間データを格納するための内部ストレージエンジンが必要です。内部ストレージは、`INNER ENGINE`句を使用して指定でき、ウィンドウビューはデフォルトの内部エンジンとして`AggregatingMergeTree`を使用します。

`TO [db].[table]`なしでウィンドウビューを作成する場合は、データを格納するためのテーブルエンジンである`ENGINE`を指定する必要があります。

### Time Window Functions {#time-window-functions}

[時間ウィンドウ関数](../../functions/time-window-functions.md)は、レコードの下限と上限のウィンドウ境界を取得するために使用されます。ウィンドウビューは時間ウィンドウ関数とともに使用する必要があります。

### TIME ATTRIBUTES {#time-attributes}

ウィンドウビューは、**処理時間**と**イベント時間**のプロセスをサポートします。

**処理時間**は、ローカルマシンの時間に基づいて結果を生成するウィンドウビューのデフォルトの動作です。これは、時間の最も単純な定義ですが、決定論を提供しません。処理時間属性は、時間ウィンドウ関数の`time_attr`をテーブルカラムに設定するか、または`now()`関数を使用することで定義できます。次のクエリは、処理時間でウィンドウビューを作成します。

``` sql
CREATE WINDOW VIEW wv AS SELECT count(number), tumbleStart(w_id) as w_start from date GROUP BY tumble(now(), INTERVAL '5' SECOND) as w_id
```

**イベント時間**は、各個別のイベントがその生成デバイスで発生した時間です。この時間は、生成されたときに通常レコードに埋め込まれています。イベント時間プロセシングは、順序が乱れたイベントや遅延イベントの場合でも一貫した結果が得られることを可能にします。ウィンドウビューは、`WATERMARK`構文を使用することで、イベント時間プロセシングをサポートしています。

ウィンドウビューは三つのウォーターマーク戦略を提供します:

* `STRICTLY_ASCENDING`: これまでに観測された最大タイムスタンプのウォーターマークを出力します。最大タイムスタンプより小さいタイムスタンプの行は遅延とは見なされません。
* `ASCENDING`: これまでに観測された最大タイムスタンプから1を引いたウォーターマークを出力します。最大タイムスタンプと等しいかそれ以下のタイムスタンプの行は遅延とは見なされません。
* `BOUNDED`: WATERMARK=INTERVAL。指定された遅延を考慮した最大観測タイムスタンプのウォーターマークを出力します。

次のクエリは、`WATERMARK`を使用したウィンドウビューの作成例です。

``` sql
CREATE WINDOW VIEW wv WATERMARK=STRICTLY_ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=INTERVAL '3' SECOND AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
```

デフォルトでは、ウィンドウはウォーターマークが到達したときに発火し、ウォーターマークの後に到着した要素は破棄されます。ウィンドウビューは、`ALLOWED_LATENESS=INTERVAL`を設定することで遅延イベントプロセシングをサポートします。遅延処理の例は以下の通りです。

``` sql
CREATE WINDOW VIEW test.wv TO test.dst WATERMARK=ASCENDING ALLOWED_LATENESS=INTERVAL '2' SECOND AS SELECT count(a) AS count, tumbleEnd(wid) AS w_end FROM test.mt GROUP BY tumble(timestamp, INTERVAL '5' SECOND) AS wid;
```

遅れて到着した要素は、以前の計算の更新された結果として扱われるべきです。ウィンドウの終わりに発火するのではなく、遅延イベント到着時にすぐにウィンドウビューが発火します。したがって、同じウィンドウに対して複数の出力が生成されます。ユーザーは、これらの重複した結果を考慮する必要があるか、重複を排除する必要があります。

ウィンドウビューで指定された`SELECT`クエリを変更するには、`ALTER TABLE ... MODIFY QUERY`文を使用します。新しい`SELECT`クエリが生成するデータ構造は、`TO [db.]name`句の有無にかかわらず、元の`SELECT`クエリと同じでなければなりません。現在のウィンドウ内のデータは失われるため、中間状態は再利用できません。

### Monitoring New Windows {#monitoring-new-windows}

ウィンドウビューは、変更をモニタリングするために[WATCH](../../../sql-reference/statements/watch.md)クエリをサポートし、また指定されたテーブルに結果を出力するために`TO`構文を使用します。

``` sql
WATCH [db.]window_view
[EVENTS]
[LIMIT n]
[FORMAT format]
```

`WATCH`クエリは`LIVE VIEW`と同様に機能します。`LIMIT`を指定して、クエリを終了する前に受け取る更新の数を設定できます。`EVENTS`句を使用して、`WATCH`クエリの短縮形を取得できます。ここでは、クエリ結果の代わりに最新のクエリウォーターマークのみが得られます。

### Settings {#settings-1}

- `window_view_clean_interval`: アウトデートデータを解放するためのウィンドウビューのクリーン間隔（秒単位）。システムは、システム時間または`WATERMARK`構成に従って完全に発火していないウィンドウを保持し、他のデータは削除されます。
- `window_view_heartbeat_interval`: WATCHクエリが生きていることを示すためのハートビート間隔（秒単位）。
- `wait_for_window_view_fire_signal_timeout`: イベント時間処理のウィンドウビュー発火信号を待つためのタイムアウト。

### Example {#example}

クリックログの数を10秒ごとに集計する必要があるとします。ログテーブルは`data`と呼ばれ、そのテーブル構造は次のようになります。

``` sql
CREATE TABLE data ( `id` UInt64, `timestamp` DateTime) ENGINE = Memory;
```

最初に、10秒間隔のタムブルウィンドウでウィンドウビューを作成します。

``` sql
CREATE WINDOW VIEW wv as select count(id), tumbleStart(w_id) as window_start from data group by tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

次に、`WATCH`クエリを使用して結果を取得します。

``` sql
WATCH wv
```

`data`テーブルにログを挿入すると、

``` sql
INSERT INTO data VALUES(1,now())
```

`WATCH`クエリは次のような結果を出力するはずです。

``` text
┌─count(id)─┬────────window_start─┐
│         1 │ 2020-01-14 16:56:40 │
└───────────┴─────────────────────┘
```

あるいは、出力を別のテーブルに`TO`構文を使用して接続することもできます。

``` sql
CREATE WINDOW VIEW wv TO dst AS SELECT count(id), tumbleStart(w_id) as window_start FROM data GROUP BY tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

追加の例は、ClickHouseの状態を持つテストの中に（それらは`*window_view*`と名付けられています）見つけることができます。

### Window View Usage {#window-view-usage}

ウィンドウビューは、以下のシナリオで有用です:

* **モニタリング**: 時間ごとのメトリクスログを集約および計算し、結果をターゲットテーブルに出力します。ダッシュボードはターゲットテーブルをソーステーブルとして使用できます。
* **分析**: 時間ウィンドウ内でデータを自動的に集約および前処理します。これは、大量のログを分析する時に有用です。前処理は、複数のクエリにおける繰り返し計算を排除し、クエリレイテンシを低減します。

## Related Content {#related-content}

- ブログ: [ClickHouseにおける時系列データの扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- ブログ: [ClickHouseでの可観測性ソリューションの構築 - パート2 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)

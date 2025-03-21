---
slug: '/sql-reference/statements/create/view'
sidebar_position: 37
sidebar_label: 'VIEW'
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# CREATE VIEW

新しいビューを作成します。ビューは、[通常の](#normal-view)、[物化つい](#materialized-view)、[リフレッシュ可能な物化ビュー](#refreshable-materialized-view)、および [ウィンドウ](/sql-reference/statements/create/view#window-view)（リフレッシュ可能な物化ビューとウィンドウビューは実験的機能です）として作成できます。

## Normal View {#normal-view}

構文:

``` sql
CREATE [OR REPLACE] VIEW [IF NOT EXISTS] [db.]table_name [(alias1 [, alias2 ...])] [ON CLUSTER cluster_name]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

通常のビューはデータを保存していません。アクセスのたびに別のテーブルから読み取るだけです。言い換えれば、通常のビューは保存されたクエリに過ぎません。ビューから読み取るとき、この保存されたクエリが[FROM](../../../sql-reference/statements/select/from.md)句のサブクエリとして使用されます。

例として、次のようにビューを作成したと仮定しましょう:

``` sql
CREATE VIEW view AS SELECT ...
```

そして、クエリを次のように書きます:

``` sql
SELECT a, b, c FROM view
```

このクエリは、サブクエリを使用した場合と完全に同等です:

``` sql
SELECT a, b, c FROM (SELECT ...)
```

## Parameterized View {#parameterized-view}

パラメータ化されたビューは通常のビューに似ていますが、すぐには解決されないパラメータと共に作成することができます。これらのビューは、テーブル関数と共に使用でき、ビューの名前を関数名として、パラメータ値を引数として指定します。

``` sql
CREATE VIEW view AS SELECT * FROM TABLE WHERE Column1={column1:datatype1} and Column2={column2:datatype2} ...
```
上記は、パラメータを次のように置き換えることで、テーブル関数として使用できるビューを作成します。

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
[物化ビュー](/guides/developer/cascading-materialized-views.md)の使用に関する手順ガイドです。
:::

物化ビューは、対応する[SELECT](../../../sql-reference/statements/select/index.md)クエリによって変換されたデータを格納します。

`TO [db].[table]`なしで物化ビューを作成する場合、データを格納するためのテーブルエンジンである`ENGINE`を指定する必要があります。

`TO [db].[table]`を使用して物化ビューを作成する場合、`POPULATE`を同時に使用することはできません。

物化ビューは次のように実装されます: `SELECT`で指定されたテーブルにデータを挿入するとき、挿入されたデータの一部はこの`SELECT`クエリによって変換され、結果はビューに挿入されます。

:::note
ClickHouseの物化ビューは、データを宛先テーブルに挿入する際に**カラム名**を使用します。`SELECT`クエリの結果に存在しないカラム名がある場合、ClickHouseはデフォルト値を使用します。たとえカラムが[Nullable](../../data-types/nullable.md)でなくても、これは変わりません。物化ビューを使用する際は、各カラムにエイリアスを追加するのが安全な作業です。

ClickHouseの物化ビューは、挿入トリガーとしてより実装されています。ビュークエリに集約が含まれている場合、それは新しく挿入されたデータのバッチにのみ適用されます。基のテーブルの既存のデータに対する変更（更新、削除、パーティションのドロップなど）は、物化ビューを変更しません。

ClickHouseの物化ビューは、エラーが発生した場合に決定的な動作を持ちません。これは、すでに書き込まれたブロックは宛先テーブルに保持されますが、エラー以降のすべてのブロックが保持されないことを意味します。

デフォルトでは、いずれかのビューへのプシュが失敗すると、INSERTクエリも失敗し、一部のブロックが宛先テーブルに書き込まれない可能性があります。これを`materialized_views_ignore_errors`設定を使用して変更できます（この設定は`INSERT`クエリに対して設定する必要があります）。`materialized_views_ignore_errors=true`を設定すると、ビューへのプッシュ中のすべてのエラーが無視され、すべてのブロックが宛先テーブルに書き込まれます。

また、`materialized_views_ignore_errors`は、デフォルトで`system.*_log`テーブルに対して`true`に設定されています。
:::

`POPULATE`を指定すると、既存のテーブルデータがビューに挿入され、`CREATE TABLE ... AS SELECT ...`を行うかのようになります。そうでない場合、クエリにはビュー作成後にテーブルに挿入されたデータのみが含まれます。データがビュー作成中にテーブルに挿入されるため、`POPULATE`の使用は**推奨しません**。

:::note
`POPULATE`は`CREATE TABLE ... AS SELECT ...`のように機能するため、制限があります：
- レプリケーションデータベースではサポートされていません。
- ClickHouseクラウドではサポートされていません。

代わりに、別の`INSERT ... SELECT`を使用できます。
:::

`SELECT`クエリは、`DISTINCT`、`GROUP BY`、`ORDER BY`、`LIMIT`を含めることができます。対応する変換は挿入されたデータの各ブロックに対して独立して実行されることに注意してください。たとえば、`GROUP BY`が設定されている場合、データは挿入中に集約されますが、挿入されたデータの単一のパケット内のみです。データはさらに集約されることはありません。例外は、`SummingMergeTree`のようにデータ集約を独自に実行する`ENGINE`を使用するときです。

物化ビューに対する[ALTER](/sql-reference/statements/alter/view.md)クエリの実行には制限があります。たとえば、`SELECT`クエリを更新することはできないため、不便な場合があります。物化ビューが`TO [db.]name`構造を使用している場合、ビューを`DETACH`し、ターゲットテーブルに対して`ALTER`を実行し、その後以前に`DETACH`したビューを`ATTACH`できます。

物化ビューは[optimize_on_insert](/operations/settings/settings#optimize_on_insert)設定の影響を受けることに注意してください。データはビューへの挿入前にマージされます。

ビューは通常のテーブルと同様に見えます。たとえば、`SHOW TABLES`クエリの結果にリストされます。

ビューを削除するには、[DROP VIEW](../../../sql-reference/statements/drop.md#drop-view)を使用します。`DROP TABLE`もビューに対して機能します。

## SQL security {#sql_security}

`DEFINER`および`SQL SECURITY`を使用すると、ビューの基となるクエリを実行する際に使用するClickHouseユーザーを指定できます。
`SQL SECURITY`には3つの合法的な値があります: `DEFINER`、`INVOKER`、または`NONE`。`DEFINER`句では、任意の既存のユーザーまたは`CURRENT_USER`を指定できます。

以下の表は、ビューから選択するために必要なユーザーごとの権限を説明します。
SQLセキュリティオプションに関係なく、読み取るには常に`GRANT SELECT ON <view>`が必要であることに注意してください。

| SQLセキュリティオプション | ビュー                                                        | 物化ビュー                                                                                                    |
|--------------------------|------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `DEFINER alice`          | `alice`はビューのソーステーブルに対して`SELECT`権限を持っている必要があります。 | `alice`はビューのソーステーブルに対して`SELECT`権限を持っていて、ビューのターゲットテーブルに対して`INSERT`権限も必要です。 |
| `INVOKER`                | ユーザーはビューのソーステーブルに対して`SELECT`権限を持っている必要があります。  | `SQL SECURITY INVOKER`は物化ビューに対して指定できません。                                           |
| `NONE`                   | -                                                          | -                                                                                                        |

:::note
`SQL SECURITY NONE`は非推奨のオプションです。`SQL SECURITY NONE`でビューを作成する権限を持つユーザーは、任意のクエリを実行することができます。
したがって、このオプションでビューを作成するには、`GRANT ALLOW SQL SECURITY NONE TO <user>`が必要です。
:::

`DEFINER`/`SQL SECURITY`が指定されていない場合、デフォルト値が使用されます：
- `SQL SECURITY`: 通常のビューのために`INVOKER`、物化ビューのために`DEFINER`（[設定によって構成可能](../../../operations/settings/settings.md#default_normal_view_sql_security)）
- `DEFINER`: `CURRENT_USER`（[設定によって構成可能](../../../operations/settings/settings.md#default_view_definer)）

`DEFINER`/`SQL SECURITY`が指定されていないビューがアタッチされている場合、物化ビューに対するデフォルト値は`SQL SECURITY NONE`、通常のビューに対するデフォルト値は`SQL SECURITY INVOKER`です。

既存のビューのSQLセキュリティを変更するには、次のように使用します。
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

お手数ですが、旧ドキュメントは[こちら](https://pastila.nl/?00f32652/fdf07272a7b54bda7e13b919264e449f.md)にあります。

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
ここで、`interval`は単純なインターバルのシーケンスです：
```sql
number SECOND|MINUTE|HOUR|DAY|WEEK|MONTH|YEAR
```

定期的に対応するクエリを実行し、その結果をテーブルに格納します。
* クエリが`APPEND`と言った場合、各リフレッシュは既存の行を削除せずにテーブルに行を挿入します。挿入は原子的ではなく、通常のINSERT SELECTと同様です。
* さもなくば、各リフレッシュはテーブルの以前の内容を原子的に置き換えます。

リフレッシュ可能な物化ビューの通常の非リフレッシュ可能な物化ビューとの違い：
* 挿入トリガーがありません。つまり、`SELECT`で指定されたテーブルに新しいデータが挿入されると、自動的にリフレッシュ可能な物化ビューにプッシュされません。定期的なリフレッシュはクエリ全体を実行します。
* `SELECT`クエリに制限はありません。テーブル関数（例：`url()`）、ビュー、UNION、JOINがすべて許可されています。

:::note
`REFRESH ... SETTINGS`部分のクエリ内の設定はリフレッシュ設定（例：`refresh_retries`）であり、通常の設定（例：`max_threads`）とは異なります。通常の設定は、クエリの最後に`SETTINGS`を使用して指定できます。
:::

### Refresh Schedule {#refresh-schedule}

リフレッシュスケジュールの例:
```sql
REFRESH EVERY 1 DAY -- 毎日、真夜中 (UTC)
REFRESH EVERY 1 MONTH -- 毎月の1日、真夜中に
REFRESH EVERY 1 MONTH OFFSET 5 DAY 2 HOUR -- 毎月6日の午前2時
REFRESH EVERY 2 WEEK OFFSET 5 DAY 15 HOUR 10 MINUTE -- 隔週土曜日の午後3時10分
REFRESH EVERY 30 MINUTE -- 00:00、00:30、01:00、01:30など
REFRESH AFTER 30 MINUTE -- 前のリフレッシュが完了してから30分後
-- REFRESH AFTER 1 HOUR OFFSET 1 MINUTE -- 構文エラー、OFFSETはAFTERで許可されていません
REFRESH EVERY 1 WEEK 2 DAYS -- 9日ごと、特定の週または月の日には該当しない；
                            -- 具体的には、日付番号（1969年12月29日以降）が9で割り切れるとき
REFRESH EVERY 5 MONTHS -- 5か月ごと、年間で異なる月（12は5で割り切れません）；
                       -- 具体的には、月番号（1970年1月以降）が5で割り切れるとき
```

`RANDOMIZE FOR`は、各リフレッシュの時間をランダムに調整します。例:
```sql
REFRESH EVERY 1 DAY OFFSET 2 HOUR RANDOMIZE FOR 1 HOUR -- 毎日、01:30と02:30の間のランダムな時間
```

与えられたビューに対しては、同時に1回だけリフレッシュを実行できます。例えば、`REFRESH EVERY 1 MINUTE`のビューがリフレッシュに2分かかると、リフレッシュは2分ごとに行われます。高速になり、10秒でリフレッシュを開始すると、再度毎分リフレッシュされます（特に、バックログのリフレッシュを追いかけるために毎10秒リフレッシュされるわけではない - そのようなバックログはありません）。

加えて、物化ビューが作成された直後にリフレッシュが開始されます。`CREATE`クエリに`EMPTY`が指定されている場合、最初のリフレッシュはスケジュールに従って行われます。

### In Replicated DB {#in-replicated-db}

リフレッシュ可能な物化ビューが[レプリケートデータベース](../../../engines/database-engines/replicated.md)にある場合、レプリカは調整し合い、毎回のスケジュールで1つのレプリカだけがリフレッシュを実行します。[ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md)テーブルエンジンが必要であり、すべてのレプリカはリフレッシュで生成されたデータを確認します。

`APPEND`モードでは、`SETTINGS all_replicas = 1`を使用して調整を無効にできます。これにより、レプリカは互いに独立してリフレッシュを行います。この場合、ReplicatedMergeTreeは必要ありません。

非`APPEND`モードでは、調整されたリフレッシュのみがサポートされています。非調整の場合は、Atomicデータベースおよび`CREATE ... ON CLUSTER`クエリを使用して、すべてのレプリカにリフレッシュ可能な物化ビューを作成します。

調整はKeeperを介して行われます。znodeのパスは[default_replica_path](../../../operations/server-configuration-parameters/settings.md#default_replica_path)サーバー設定によって決定されます。

### Dependencies {#refresh-dependencies}

`DEPENDS ON`は異なるテーブルのリフレッシュを同期させます。例として、次のような2つのリフレッシブルな物化ビューのチェーンを考えてみてください:
```sql
CREATE MATERIALIZED VIEW source REFRESH EVERY 1 DAY AS SELECT * FROM url(...)
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY AS SELECT ... FROM source
```
`DEPENDS ON`がない場合、両方のビューは真夜中にリフレッシュを開始し、`destination`は通常、`source`の昨日のデータを見ます。依存関係を追加すると:
```sql
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY DEPENDS ON source AS SELECT ... FROM source
```
この場合、`destination`のリフレッシュはその日の`source`のリフレッシュが終了した後にのみ開始されるため、`destination`は新しいデータに基づいて更新されます。

あるいは、次のように実現できます:
```sql
CREATE MATERIALIZED VIEW destination REFRESH AFTER 1 HOUR DEPENDS ON source AS SELECT ... FROM source
```
ここで、`1 HOUR`は`source`のリフレッシュ期間より短い任意の期間で構いません。依存しているテーブルは、その依存関係よりも頻繁にはリフレッシュされません。これは、実際のリフレッシュ期間を1回以上指定することなく、リフレッシュ可能なビューのチェーンを設定するための有効な方法です。

他のいくつかの例:
 * `REFRESH EVERY 1 DAY OFFSET 10 MINUTE`（`destination`）は`REFRESH EVERY 1 DAY`（`source`）に依存します。<br/>
   `source`のリフレッシュが10分以上かかる場合、`destination`はそれを待ちます。
 * `REFRESH EVERY 1 DAY OFFSET 1 HOUR`は`REFRESH EVERY 1 DAY OFFSET 23 HOUR`に依存します。<br/>
   上記のように、対応するリフレッシュが異なるカレンダーの日に発生しても、`destination`のリフレッシュはX+1の日で`source`のリフレッシュがXの日（2時間以上かかる場合）の完了を待ちます。
 * `REFRESH EVERY 2 HOUR`は`REFRESH EVERY 1 HOUR`に依存します。<br/>
   2 HOURリフレッシュは、毎時リフレッシュした後に行われます（真夜中のリフレッシュ後、次の2時のリフレッシュ後など）。
 * `REFRESH EVERY 1 MINUTE`は`REFRESH EVERY 2 HOUR`に依存します。<br/>
   `REFRESH AFTER 1 MINUTE`は`REFRESH EVERY 2 HOUR`に依存します。<br/>
   `REFRESH AFTER 1 MINUTE`は`REFRESH AFTER 2 HOUR`に依存します。<br/>
   `destination`は、毎回の`source`リフレッシュの後、すなわち2時間ごとに更新されます。`1 MINUTE`は実質的に無視されます。
 * `REFRESH AFTER 1 HOUR`は`REFRESH AFTER 1 HOUR`に依存します。<br/>
   現在これは推奨されていません。

:::note
`DEPENDS ON`は、リフレッシュ可能な物化ビューの間でのみ機能します。`DEPENDS ON`リストに通常のテーブルを記載すると、そのビューは永遠にリフレッシュしなくなります（依存関係は`ALTER`によって削除できます）。
:::

### Settings {#settings}

利用可能なリフレッシュ設定：
 * `refresh_retries` - リフレッシュクエリが例外で失敗した場合のリトライ回数。すべてのリトライが失敗した場合、次のスケジュールされたリフレッシュ時間にスキップします。0はリトライなし、-1は無限リトライを意味します。デフォルト：0。
 * `refresh_retry_initial_backoff_ms` - 最初のリトライ前の遅延で、`refresh_retries`がゼロでない場合。各次のリトライが遅延を2倍にし、`refresh_retry_max_backoff_ms`まで成長します。デフォルト：100 ms。
 * `refresh_retry_max_backoff_ms` - リフレッシュ試行間の遅延の指数的成長の制限。デフォルト：60000 ms（1分）。

### Changing Refresh Parameters {#changing-refresh-parameters}

リフレッシュパラメータを変更するには：
```sql
ALTER TABLE [db.]name MODIFY REFRESH EVERY|AFTER ... [RANDOMIZE FOR ...] [DEPENDS ON ...] [SETTINGS ...]
```

:::note
これにより、*すべての*リフレッシュパラメータ（スケジュール、依存関係、設定、およびAPPENDの有無）が一度に置き換えられます。たとえば、テーブルに`DEPENDS ON`があった場合、`DEPENDS ON`なしで`MODIFY REFRESH`を行うと、依存関係が削除されます。
:::

### Other operations {#other-operations}

すべてのリフレッシュ可能な物化ビューの状態は、テーブル[`system.view_refreshes`](../../../operations/system-tables/view_refreshes.md)で利用できます。特に、リフレッシュの進行状況（実行中の場合）、最後のリフレッシュ時間、次のリフレッシュ時間、リフレッシュが失敗した場合の例外メッセージが含まれます。

リフレッシュを手動で停止、開始、トリガー、またはキャンセルするには[`SYSTEM STOP|START|REFRESH|WAIT|CANCEL VIEW`](../system.md#refreshable-materialized-views)を使用します。

リフレッシュの完了を待つには[`SYSTEM WAIT VIEW`](../system.md#refreshable-materialized-views)を使用します。特に、ビュー作成後の初期リフレッシュの待機に役立ちます。

:::note
面白い事実：リフレッシュクエリは、リフレッシュされているビューから読み取ることが許可されています。つまり、データのリフレッシュ前のバージョンを見ることができます。これにより、コンウェイのライフゲームを実装できます：https://pastila.nl/?00021a4b/d6156ff819c83d490ad2dcec05676865#O0LGWTO7maUQIA4AcGUtlA==
:::

## Window View {#window-view}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::info
これは実験的な機能であり、将来のリリースで後方互換性のない方法で変更される可能性があります。ウィンドウビューと`WATCH`クエリの使用を有効にするには、[allow_experimental_window_view](/operations/settings/settings#allow_experimental_window_view)設定を使用します。コマンド `set allow_experimental_window_view = 1` を入力してください。
:::

``` sql
CREATE WINDOW VIEW [IF NOT EXISTS] [db.]table_name [TO [db.]table_name] [INNER ENGINE engine] [ENGINE engine] [WATERMARK strategy] [ALLOWED_LATENESS interval_function] [POPULATE]
AS SELECT ...
GROUP BY time_window_function
[COMMENT 'comment']
```

ウィンドウビューは、時間ウィンドウでデータを集約し、ウィンドウが発火する準備が整ったときにその結果を出力できます。レイテンシを削減するために中間集約結果を内側（または指定された）テーブルに保存し、指定されたテーブルに処理結果をプッシュしたり、WATCHクエリを使用してプッシュ通知を行ったりできます。

ウィンドウビューの作成は、`MATERIALIZED VIEW`の作成に似ています。ウィンドウビューには中間データを保存するための内側ストレージエンジンが必要です。内側ストレージは、`INNER ENGINE`句を使用して指定できます。デフォルトの内側エンジンは`AggregatingMergeTree`です。

`TO [db].[table]`なしでウィンドウビューを作成する場合、データを格納するためのテーブルエンジンである`ENGINE`を指定する必要があります。

### Time Window Functions {#time-window-functions}

[時間ウィンドウ関数](../../functions/time-window-functions.md)は、レコードの下限および上限ウィンドウを取得するために使用されます。ウィンドウビューは、時間ウィンドウ関数と共に使用する必要があります。

### TIME ATTRIBUTES {#time-attributes}

ウィンドウビューは**処理時間**と**イベント時間**の処理をサポートしています。

**処理時間**は、ウィンドウビューがローカルマシンの時間に基づいて結果を生成できるようにし、デフォルトで使用されます。これは最も直接的な時間の定義ですが、決定論的ではありません。処理時間属性は、時間ウィンドウ関数の`time_attr`をテーブルのカラムに設定することによって、または`now()`関数を使用することによって定義できます。以下のクエリは、処理時間でウィンドウビューを作成します。

``` sql
CREATE WINDOW VIEW wv AS SELECT count(number), tumbleStart(w_id) as w_start from date GROUP BY tumble(now(), INTERVAL '5' SECOND) as w_id
```

**イベント時間**は、各個別のイベントが生成装置で発生した時刻を指します。この時間は通常、生成されるときにレコードに埋め込まれます。イベント時間処理は、順序が乱れたイベントや遅延イベントが発生した場合でも一貫した結果を可能にします。ウィンドウビューは`WATERMARK`構文を使用することで、イベント時間処理をサポートします。

ウィンドウビューは3つのウォーターマーク戦略を提供します：

* `STRICTLY_ASCENDING`：これまでに観測された最大のタイムスタンプのウォーターマークを発行します。最大タイムスタンプよりも小さいタイムスタンプを持つ行は遅れたものではありません。
* `ASCENDING`：これまでに観測された最大のタイムスタンプのウォーターマークを発行しますが、1を引きます。最大タイムスタンプと同じか小さいタイムスタンプを持つ行は遅れたものではありません。
* `BOUNDED`：WATERMARK=INTERVAL。指定した遅延を引いた最大の観測されたタイムスタンプをウォーターマークとして発行します。

以下のクエリは、`WATERMARK`を使用してウィンドウビューを作成する例です：

``` sql
CREATE WINDOW VIEW wv WATERMARK=STRICTLY_ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=INTERVAL '3' SECOND AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
```

デフォルトでは、ウォーターマークが到達したときにウィンドウが発火し、ウォーターマークを超えて到着した要素は破棄されます。ウィンドウビューは、`ALLOWED_LATENESS=INTERVAL`を設定することで遅延イベント処理をサポートします。遅延処理の一例は以下の通りです：

``` sql
CREATE WINDOW VIEW test.wv TO test.dst WATERMARK=ASCENDING ALLOWED_LATENESS=INTERVAL '2' SECOND AS SELECT count(a) AS count, tumbleEnd(wid) AS w_end FROM test.mt GROUP BY tumble(timestamp, INTERVAL '5' SECOND) AS wid;
```

遅れて発生した要素から出力される結果は、以前の計算の更新された結果として処理されるべきです。ウィンドウの終了時ではなく、遅延イベントが到着したときにウィンドウビューは即座に発火します。このため、同じウィンドウに複数の出力が結果として生じます。ユーザーはこれらの重複結果を考慮するか、重複排除を行う必要があります。

ウィンドウビューで指定された`SELECT`クエリを変更するには、`ALTER TABLE ... MODIFY QUERY`ステートメントを使用します。更新された`SELECT`クエリから得られるデータ構造は、`TO [db.]name`句の有無にかかわらず元の`SELECT`クエリと同様である必要があります。中間状態が再利用できないため、現在のウィンドウのデータは失われることに注意してください。

### Monitoring New Windows {#monitoring-new-windows}

ウィンドウビューは、変更を監視するために[WATCH](../../../sql-reference/statements/watch.md)クエリをサポートします。また、結果をテーブルに出力するために`TO`構文を使用できます。

``` sql
WATCH [db.]window_view
[EVENTS]
[LIMIT n]
[FORMAT format]
```

`WATCH`クエリは、`LIVE VIEW`と似た動作をします。受信する更新の数を指定するために`LIMIT`を設定できます。`EVENTS`句を使用すると、クエリの結果の代わりに最新のクエリのウォーターマークのみを取得する短い形式の`WATCH`クエリを取得できます。

### Settings {#settings-1}

- `window_view_clean_interval`: 古いデータを解放するためのウィンドウビューのクリーン間隔（秒単位）。システムは、システム時間または`WATERMARK`設定に従って完全にトリガーされていないウィンドウを保持し、その他のデータは削除されます。
- `window_view_heartbeat_interval`: ウォッチクエリが生存していることを示すためのハートビート間隔（秒単位）。
- `wait_for_window_view_fire_signal_timeout`: イベント時間処理におけるウィンドウビューの発火信号を待つためのタイムアウト。

### Example {#example}

クリックログを10秒ごとにカウントする必要があると仮定し、ログテーブルの構造は次のようになります。

``` sql
CREATE TABLE data ( `id` UInt64, `timestamp` DateTime) ENGINE = Memory;
```

まず、10秒間隔のタンブルウィンドウでウィンドウビューを作成します。

``` sql
CREATE WINDOW VIEW wv as select count(id), tumbleStart(w_id) as window_start from data group by tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

次に、`WATCH`クエリを使用して結果を取得します。

``` sql
WATCH wv
```

データテーブルにログが挿入されるとき、

``` sql
INSERT INTO data VALUES(1,now())
```

`WATCH`クエリは、以下の結果を印刷するはずです：

``` text
┌─count(id)─┬────────window_start─┐
│         1 │ 2020-01-14 16:56:40 │
└───────────┴─────────────────────┘
```

代わりに、`TO`構文を使用して出力を別のテーブルに接続できます。

``` sql
CREATE WINDOW VIEW wv TO dst AS SELECT count(id), tumbleStart(w_id) as window_start FROM data GROUP BY tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

追加の例は、ClickHouseのステートフルテスト群の中にあります（それらは`*window_view*`という名前です）。

### Window View Usage {#window-view-usage}

ウィンドウビューは、以下のシナリオで役立ちます：

* **監視**: 時間ごとにメトリクスログを集約し計算し、結果をターゲットテーブルに出力します。ダッシュボードはターゲットテーブルをソーステーブルとして使用できます。
* **分析**: 時間ウィンドウ内でデータを自動的に集約し前処理します。これは、多くのログを分析する際に便利です。前処理は、複数のクエリでの計算の繰り返しを排除し、クエリのレイテンシを削減します。

## Related Content {#related-content}

- ブログ: [ClickHouseでの時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- ブログ: [ClickHouseでの可観測性ソリューションの構築 - パート2 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)

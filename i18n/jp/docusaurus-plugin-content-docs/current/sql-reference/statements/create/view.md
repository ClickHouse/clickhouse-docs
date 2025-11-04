---
'description': 'CREATE VIEW のためのドキュメント'
'sidebar_label': 'VIEW'
'sidebar_position': 37
'slug': '/sql-reference/statements/create/view'
'title': 'CREATE VIEW'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# CREATE VIEW

新しいビューを作成します。ビューは [通常](#normal-view)、[マテリアライズド](#materialized-view)、[リフレッシュ可能なマテリアライズド](#refreshable-materialized-view)、および [ウィンドウ](/sql-reference/statements/create/view#window-view)のいずれかになります。

## Normal View {#normal-view}

構文:

```sql
CREATE [OR REPLACE] VIEW [IF NOT EXISTS] [db.]table_name [(alias1 [, alias2 ...])] [ON CLUSTER cluster_name]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

通常のビューはデータを保存しません。アクセスごとに別のテーブルから読み取りを行うだけです。言い換えれば、通常のビューは保存されたクエリに他なりません。ビューから読込むとき、この保存されたクエリが [FROM](../../../sql-reference/statements/select/from.md) 句のサブクエリとして使用されます。

例として、ビューを作成したとします:

```sql
CREATE VIEW view AS SELECT ...
```

そしてクエリを書きました:

```sql
SELECT a, b, c FROM view
```

このクエリは、サブクエリを使用することと全く同等です:

```sql
SELECT a, b, c FROM (SELECT ...)
```

## Parameterized View {#parameterized-view}

パラメータ化されたビューは通常のビューに似ていますが、即座には解決されないパラメータを持って作成できます。これらのビューは、ビューの名前を関数名とし、パラメータの値をその引数とするテーブル関数と共に使用できます。

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
[マテリアライズドビュー](/guides/developer/cascading-materialized-views.md)の使用についてのステップバイステップガイドがあります。
:::

マテリアライズドビューは、対応する [SELECT](../../../sql-reference/statements/select/index.md) クエリによって変換されたデータを保存します。

`TO [db].[table]` がない場合にマテリアライズドビューを作成する場合、`ENGINE` – データを保存するためのテーブルエンジンを指定する必要があります。

`TO [db].[table]` を使ってマテリアライズドビューを作成する際に、`POPULATE` を使用することはできません。

マテリアライズドビューは次のように実装されます: `SELECT` で指定されたテーブルにデータを挿入すると、挿入されたデータの一部がこの `SELECT` クエリで変換され、その結果がビューに挿入されます。

:::note
ClickHouseのマテリアライズドビューは、デスティネーションテーブルへの挿入中に**カラム名**を使用します。`SELECT` クエリの結果に存在しないカラム名がある場合、ClickHouseはデフォルト値を使用します。たとえそのカラムが [Nullable](../../data-types/nullable.md) でなくてもです。マテリアライズドビューを使用する場合は、すべてのカラムにエイリアスを追加するのが安全なプラクティスです。

ClickHouseのマテリアライズドビューは、挿入トリガーのように実装されています。ビュークエリに集約がある場合、それは新しく追加されたデータのバッチに対してのみ適用されます。ソーステーブルの既存データに対する変更（更新、削除、パーティションの削除など）は、マテリアライズドビューに影響を与えません。

ClickHouseのマテリアライズドビューは、エラーが発生した場合、決定論的な動作を持ちません。これは、すでに書き込まれたブロックはデスティネーションテーブルに保持されますが、エラー後のすべてのブロックはそうでないことを意味します。

デフォルトでは、ビューのいずれかへのプッシュが失敗すると、INSERTクエリも失敗し、いくつかのブロックがデスティネーションテーブルに書き込まれない場合があります。これを変更するには、`materialized_views_ignore_errors` 設定を使用できます（`INSERT` クエリ用に設定する必要があります）。`materialized_views_ignore_errors=true` を設定すると、ビューへのプッシュ中のエラーは無視され、すべてのブロックがデスティネーションテーブルに書き込まれます。

また、`materialized_views_ignore_errors` は、`system.*_log` テーブルに対してデフォルトで `true` に設定されます。
:::

`POPULATE` を指定した場合、作成時に既存のテーブルデータがビューに挿入されます。作成後に挿入されたテーブルデータだけがクエリに含まれます。ビュー作成中にテーブルに挿入されたデータはビューに挿入されないため、`POPULATE` を使用することを**お勧めしません**。

:::note
`POPULATE` は `CREATE TABLE ... AS SELECT ...` のように動作するため、制限があります:
- レプリケートデータベースではサポートされていません
- ClickHouseクラウドではサポートされていません

その代わりに、別の `INSERT ... SELECT` を使用できます。
:::

`SELECT` クエリには `DISTINCT`、`GROUP BY`、`ORDER BY`、`LIMIT` を含めることができます。ここで、該当する変換は挿入された各データブロックで独立して実行されることに注意してください。たとえば、`GROUP BY` が設定されている場合、データは挿入中に集約されますが、単一の挿入データパケット内でのみ行われます。データはそれ以上集約されません。例外は、`SummingMergeTree` のように独立してデータ集約を実行する `ENGINE` を使用する場合です。

[ALTER](/sql-reference/statements/alter/view.md) クエリのマテリアライズドビューには制限があります。たとえば、`SELECT` クエリを更新することはできず、これが不便になることがあります。マテリアライズドビューが `TO [db.]name` を使用している場合、ビューを `DETACH` し、ターゲットテーブルに対して `ALTER` を実行し、その後に以前にデタッチされた（`DETACH`）ビューを `ATTACH` することができます。

マテリアライズドビューは [optimize_on_insert](/operations/settings/settings#optimize_on_insert) 設定によって影響を受けます。データはビューへの挿入前にマージされます。

ビューは通常のテーブルと同じように見えます。たとえば、`SHOW TABLES` クエリの結果にリストされます。

ビューを削除するには、[DROP VIEW](../../../sql-reference/statements/drop.md#drop-view) を使用します。`DROP TABLE` もビューに対して機能します。

## SQL security {#sql_security}

`DEFINER` と `SQL SECURITY` を使用すると、ビューの基礎クエリを実行するときに使用するClickHouseユーザーを指定できます。
`SQL SECURITY` には3つの合法的な値があります: `DEFINER`、`INVOKER`、または `NONE`。`DEFINER` 句では、既存のユーザーまたは `CURRENT_USER` を指定できます。

以下の表は、ビューから選択するために必要な権限を示します。
SQL セキュリティオプションに関係なく、すべてのケースで `GRANT SELECT ON <view>` を持つことが必要であることに注意してください。

| SQL security option | View                                                            | Materialized View                                                                                                 |
|---------------------|-----------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| `DEFINER alice`     | `alice` はビューのソーステーブルに対して `SELECT` の権限を持っている必要があります。 | `alice` はビューのソーステーブルに対して `SELECT` の権限と、ビューのターゲットテーブルに対して `INSERT` の権限を持っている必要があります。 |
| `INVOKER`           | ユーザーはビューのソーステーブルに対して `SELECT` の権限を持っている必要があります。    | `SQL SECURITY INVOKER` はマテリアライズドビューに指定することはできません。                                                 |
| `NONE`              | -                                                                | -                                                                                                                 |

:::note
`SQL SECURITY NONE` は廃止されたオプションです。 `SQL SECURITY NONE` でビューを作成する権利を持つユーザーは、任意のクエリを実行できることになります。
したがって、このオプションでビューを作成するには、`GRANT ALLOW SQL SECURITY NONE TO <user>` が必要です。
:::

`DEFINER`/`SQL SECURITY` が指定されていない場合、デフォルト値が使用されます:
- `SQL SECURITY`: 通常のビューには `INVOKER`、マテリアライズドビューには `DEFINER` が指定されます ([設定で構成可能](../../../operations/settings/settings.md#default_normal_view_sql_security))
- `DEFINER`: `CURRENT_USER` ([設定で構成可能](../../../operations/settings/settings.md#default_view_definer))

ビューが `DEFINER`/`SQL SECURITY` を指定せずにアタッチされた場合、デフォルト値はマテリアライズドビューに対して `SQL SECURITY NONE`、通常のビューに対して `SQL SECURITY INVOKER` となります。

既存のビューのSQLセキュリティを変更するには、次のようにします。
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

便利なことに、古いドキュメントは [こちら](https://pastila.nl/?00f32652/fdf07272a7b54bda7e13b919264e449f.md) にあります。

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
ここで `interval` は一連の単純な間隔を指します:
```sql
number SECOND|MINUTE|HOUR|DAY|WEEK|MONTH|YEAR
```

定期的に対応するクエリを実行し、その結果をテーブルに格納します。
* クエリが `APPEND` を指定している場合、各リフレッシュは既存の行を削除せずにテーブルに行を挿入します。この挿入は原子的ではなく、通常の INSERT SELECT と同様です。
* それ以外の場合、各リフレッシュはテーブルの前の内容を原子的に置き換えます。
リフレッシュ可能なマテリアライズドビューと通常のマテリアライズドビューの違い:
* 挿入トリガーはありません。すなわち、`SELECT` で指定されたテーブルに新しいデータが挿入されると、それは自動的にリフレッシュ可能なマテリアライズドビューにプッシュされることはありません。定期的なリフレッシュが全体のクエリを実行します。* SELECTクエリには制限はありません。テーブル関数（例: `url()`）、ビュー、UNION、JOIN すべてが許可されています。

:::note
クエリの `REFRESH ... SETTINGS` 部分の設定はリフレッシュ設定（例: `refresh_retries`）であり、通常の設定（例: `max_threads`）とは異なります。通常の設定はクエリの最後に `SETTINGS` を使用して指定できます。
:::

### Refresh Schedule {#refresh-schedule}

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

`RANDOMIZE FOR` は、各リフレッシュの時間をランダムに調整します。たとえば:
```sql
REFRESH EVERY 1 DAY OFFSET 2 HOUR RANDOMIZE FOR 1 HOUR -- every day at random time between 01:30 and 02:30
```

一度にリフレッシュを実行できるのは、特定のビューに対して1つだけです。たとえば、`REFRESH EVERY 1 MINUTE` のビューがリフレッシュに2分かかる場合、それは2分ごとにリフレッシュすることになります。その後、リフレッシュが速くなり、10秒で完了するようになると、再び1分ごとにリフレッシュします。（特に、未実行のリフレッシュのバックログを追いつくために10秒ごとにリフレッシュすることはありません - そのようなバックログは存在しません。）

さらに、マテリアライズドビューが作成された後、すぐにリフレッシュが開始されます。`CREATE` クエリで `EMPTY` が指定されていない限り、最初のリフレッシュはスケジュールに従って行われます。

### In Replicated DB {#in-replicated-db}

リフレッシュ可能なマテリアライズドビューが [レプリケイトデータベース](../../../engines/database-engines/replicated.md) に存在する場合、レプリカは相互に調整され、各スケジュールされた時刻にリフレッシュを行うのは1つのレプリカだけになります。[ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) テーブルエンジンが必要で、すべてのレプリカはリフレッシュによって生成されたデータを見られるようにします。

`APPEND` モードでは、`SETTINGS all_replicas = 1` を使用して調整を無効にできます。これにより、レプリカはそれぞれ独立してリフレッシュを行うことができます。この場合、ReplicatedMergeTree は必要ありません。

非 `APPEND` モードでは、協調されたリフレッシュのみがサポートされます。非協調の場合は、Atomicデータベースを使用し、`CREATE ... ON CLUSTER` クエリを使用してすべてのレプリカにリフレッシュ可能なマテリアライズドビューを作成します。

調整はKeeperを介して行われます。znodeのパスは [default_replica_path](../../../operations/server-configuration-parameters/settings.md#default_replica_path) サーバ設定によって決まります。

### Dependencies {#refresh-dependencies}

`DEPENDS ON` は異なるテーブルのリフレッシュを同期します。例として、2つのリフレッシュ可能なマテリアライズドビューのチェーンがあると仮定します:
```sql
CREATE MATERIALIZED VIEW source REFRESH EVERY 1 DAY AS SELECT * FROM url(...)
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY AS SELECT ... FROM source
```
`DEPENDS ON` がなければ、両方のビューは真夜中にリフレッシュを開始し、通常 `destination` は `source` に昨日のデータを見ることになります。依存関係を追加すると:
```sql
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY DEPENDS ON source AS SELECT ... FROM source
```
その時点で `destination` のリフレッシュは `source` のリフレッシュがその日終了した後に開始されるので、`destination` は新しいデータに基づくことになります。

また、同じ結果は次のように達成されます:
```sql
CREATE MATERIALIZED VIEW destination REFRESH AFTER 1 HOUR DEPENDS ON source AS SELECT ... FROM source
```
ここで `1 HOUR` は `source` のリフレッシュ期間よりも短い任意の期間にできます。依存するテーブルは、その依存関係のいずれよりも頻繁にはリフレッシュされません。これは、実際のリフレッシュ期間を1回以上指定することなく、リフレッシュ可能なビューのチェーンを設定する有効な方法です。

他の例をいくつか:
* `REFRESH EVERY 1 DAY OFFSET 10 MINUTE` (`destination`) は `REFRESH EVERY 1 DAY` (`source`) に依存します。<br/>
  `source` のリフレッシュが10分以上かかる場合、`destination` はそれを待ちます。
* `REFRESH EVERY 1 DAY OFFSET 1 HOUR` は `REFRESH EVERY 1 DAY OFFSET 23 HOUR` に依存します。<br/>
  上記と同様で、関連するリフレッシュは異なるカレンダーの日に行われます。
  `destination` のリフレッシュは、`source` のリフレッシュがX日目（2時間以上かかる場合）のX+1日に待機します。
* `REFRESH EVERY 2 HOUR` は `REFRESH EVERY 1 HOUR` に依存します。<br/>
  2時間リフレッシュは、他の毎時リフレッシュの後に行われます。たとえば真夜中のリフレッシュの後、次は2時のリフレッシュ、その後のリフレッシュなどです。
* `REFRESH EVERY 1 MINUTE` は `REFRESH EVERY 2 HOUR` に依存します。<br/>
  `REFRESH AFTER 1 MINUTE` は `REFRESH EVERY 2 HOUR` に依存します。<br/>
  `REFRESH AFTER 1 MINUTE`は`REFRESH AFTER 2 HOUR`に依存します。<br/>
  `destination`は `source` のリフレッシュごとに一度リフレッシュされます。つまり、2時間ごとです。`1 MINUTE` は実質的に無視されます。
* `REFRESH AFTER 1 HOUR` は `REFRESH AFTER 1 HOUR` に依存します。<br/>
現在これはお勧めできません。

:::note
`DEPENDS ON` はリフレッシュ可能なマテリアライズドビュー間でのみ機能します。`DEPENDS ON` リストに通常のテーブルをリストすると、そのビューのリフレッシュが行われなくなります（依存関係は `ALTER` で削除できます。下記を参照）。
:::

### Settings {#settings}

利用可能なリフレッシュ設定:
* `refresh_retries` - リフレッシュクエリが例外で失敗した場合、何回リトライするか。すべてのリトライが失敗した場合、次のスケジュールされたリフレッシュ時間にスキップします。0はリトライなし、-1は無限のリトライを意味します。デフォルト: 0。
* `refresh_retry_initial_backoff_ms` - 最初のリトライ前の遅延、`refresh_retries` がゼロでない場合。各後続のリトライは遅延を倍増し、`refresh_retry_max_backoff_ms` まで増加します。デフォルト: 100 ms。
* `refresh_retry_max_backoff_ms` - リフレッシュ試行間の遅延の指数的成長に制限を設けます。デフォルト: 60000 ms (1分)。

### Changing Refresh Parameters {#changing-refresh-parameters}

リフレッシュパラメータを変更するには:
```sql
ALTER TABLE [db.]name MODIFY REFRESH EVERY|AFTER ... [RANDOMIZE FOR ...] [DEPENDS ON ...] [SETTINGS ...]
```

:::note
これはすべてのリフレッシュパラメータを一度に置き換えます: スケジュール、依存関係、設定、および APPEND 状態。たとえば、テーブルに `DEPENDS ON` があった場合、`DEPENDS ON` なしで `MODIFY REFRESH` を行うと、依存関係が削除されます。
:::

### Other operations {#other-operations}

すべてのリフレッシュ可能なマテリアライズドビューのステータスはテーブル [`system.view_refreshes`](../../../operations/system-tables/view_refreshes.md) で確認できます。ここには特にリフレッシュ進捗（実行中の場合）、最後と次のリフレッシュ時刻、リフレッシュが失敗した場合の例外メッセージが含まれます。

リフレッシュを手動で停止、開始、トリガー、またはキャンセルするには [`SYSTEM STOP|START|REFRESH|WAIT|CANCEL VIEW`](../system.md#refreshable-materialized-views) を使用します。

リフレッシュが完了するのを待つには [`SYSTEM WAIT VIEW`](../system.md#refreshable-materialized-views) を使用します。特に、ビューを作成した後の初期リフレッシュの待機に便利です。

:::note
面白い事実: リフレッシュクエリは、リフレッシュ中のビューから読み取ることが許可されています。これはデータのプレリフレッシュ版を見ることを意味します。この機能を使用してコンウェイのライフゲームを実装することができます: https://pastila.nl/?00021a4b/d6156ff819c83d490ad2dcec05676865#O0LGWTO7maUQIA4AcGUtlA==
:::

## Window View {#window-view}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::info
これは実験的な機能であり、将来のリリースで非互換の変更が加えられる可能性があります。ウィンドウビューと `WATCH` クエリを使用するには、[allow_experimental_window_view](/operations/settings/settings#allow_experimental_window_view) 設定を有効にしてください。コマンド `set allow_experimental_window_view = 1` を入力します。
:::

```sql
CREATE WINDOW VIEW [IF NOT EXISTS] [db.]table_name [TO [db.]table_name] [INNER ENGINE engine] [ENGINE engine] [WATERMARK strategy] [ALLOWED_LATENESS interval_function] [POPULATE]
AS SELECT ...
GROUP BY time_window_function
[COMMENT 'comment']
```

ウィンドウビューは、時間ウィンドウごとにデータを集約し、ウィンドウが発火する準備が整ったときに結果を出力します。中間的な集約結果を内部（または指定された）テーブルに保存し、レイテンシを減らすことができ、処理結果を指定されたテーブルにプッシュするか、WATCH クエリを使用してプッシュ通知を送ることができます。

ウィンドウビューの作成は `MATERIALIZED VIEW` の作成に似ています。ウィンドウビューには、中間データを保存するための内部ストレージエンジンが必要です。内部ストレージは `INNER ENGINE` 句を使用して指定でき、ウィンドウビューはデフォルトで `AggregatingMergeTree` を内部エンジンとして使用します。

`TO [db].[table]` を指定せずにウィンドウビューを作成する場合、`ENGINE` – データを保存するためのテーブルエンジンを指定する必要があります。

### Time Window Functions {#time-window-functions}

[時間ウィンドウ関数](../../functions/time-window-functions.md)は、レコードの下限および上限ウィンドウ境界を取得するために使用されます。ウィンドウビューは、時間ウィンドウ関数と共に使用される必要があります。

### TIME ATTRIBUTES {#time-attributes}

ウィンドウビューは、**処理時間** と **イベント時間** の処理をサポートします。

**処理時間** は、ウィンドウビューがローカルマシンの時間に基づいて結果を生成することを可能にし、デフォルトで使用されます。これは最も直感的な時間の概念ですが、決定論を提供しません。処理時間属性は、時間ウィンドウ関数の `time_attr` をテーブルカラムに設定するか、`now()` 関数を使用することで定義できます。以下のクエリは、処理時間のウィンドウビューを作成します。

```sql
CREATE WINDOW VIEW wv AS SELECT count(number), tumbleStart(w_id) as w_start from date GROUP BY tumble(now(), INTERVAL '5' SECOND) as w_id
```

**イベント時間** は、各個別のイベントが生成デバイス上で発生した時間です。この時間は、生成時にレコードの中に通常埋め込まれています。イベント時間処理は、順序が乱れたイベントまたは遅延イベントの場合であっても、一貫した結果を許可します。ウィンドウビューは、`WATERMARK` 構文を使用してイベント時間処理をサポートします。

ウィンドウビューは、3つのウォーターマーク戦略を提供します:

* `STRICTLY_ASCENDING`: 現在までに観測された最大のタイムスタンプのウォーターマークを発行します。最大タイムスタンプよりも小さいタイムスタンプを持つ行は遅延していません。
* `ASCENDING`: 現在までに観測された最大のタイムスタンプよりも1少ないウォーターマークを発行します。最大タイムスタンプと等しいか小さいタイムスタンプを持つ行は遅延していません。
* `BOUNDED`: WATERMARK=INTERVAL。指定された遅延を引いた最大観測タイムスタンプのウォーターマークを発行します。

以下のクエリは、`WATERMARK` を使用してウィンドウビューを作成する例です:

```sql
CREATE WINDOW VIEW wv WATERMARK=STRICTLY_ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=INTERVAL '3' SECOND AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
```

デフォルトでは、ウォーターマークが来るとウィンドウが発火し、ウォーターマークの後に到着した要素は破棄されます。ウィンドウビューは、`ALLOWED_LATENESS=INTERVAL` を設定することで遅延イベント処理をサポートします。遅延処理の一例は次の通りです:

```sql
CREATE WINDOW VIEW test.wv TO test.dst WATERMARK=ASCENDING ALLOWED_LATENESS=INTERVAL '2' SECOND AS SELECT count(a) AS count, tumbleEnd(wid) AS w_end FROM test.mt GROUP BY tumble(timestamp, INTERVAL '5' SECOND) AS wid;
```

遅延発火によって発行された要素は、以前の計算の更新された結果と見なす必要があります。ウィンドウの終了時に発火するのではなく、ウィンドウビューは遅延イベントが到着するとすぐに発火します。したがって、同じウィンドウで複数の出力が生成されます。ユーザーはこれらの重複結果を考慮する必要があり、またはそれらを重複排除する必要があります。

ウィンドウビューで指定された `SELECT` クエリを `ALTER TABLE ... MODIFY QUERY` ステートメントを使用して変更できます。新しい `SELECT` クエリのデータ構造は、`TO [db.]name` 句の有無にかかわらず、元の `SELECT` クエリと同じである必要があります。現在のウィンドウ内のデータは失われるため、中間状態は再利用できません。

### Monitoring New Windows {#monitoring-new-windows}

ウィンドウビューは、変更を監視するための [WATCH](../../../sql-reference/statements/watch.md) クエリをサポートしています。または、`TO` 構文を使用して結果をテーブルに出力します。

```sql
WATCH [db.]window_view
[EVENTS]
[LIMIT n]
[FORMAT format]
```

`WATCH` クエリは、`LIVE VIEW` のように機能します。終了する前に受信する更新の数を設定するために `LIMIT` を指定できます。`EVENTS` 句を使用して、クエリ結果の代わりに最新のクエリウォーターマークを取得する短い形式の `WATCH` クエリを取得できます。

### Settings {#settings-1}

- `window_view_clean_interval`: 古いデータを解放するためにウィンドウビューのクリーンインターバル（秒）です。システムは、システム時間または `WATERMARK` 設定に基づいて完全にトリガーされていないウィンドウを保持し、他のデータは削除されます。
- `window_view_heartbeat_interval`: ウォッチクエリが生存していることを示すための心拍間隔（秒）です。
- `wait_for_window_view_fire_signal_timeout`: イベント時間処理におけるウィンドウビュー発火シグナル待機のタイムアウトです。

### Example {#example}

ログテーブル `data` で10秒ごとのクリックログの数をカウントするとします。そのテーブル構造は次のとおりです:

```sql
CREATE TABLE data ( `id` UInt64, `timestamp` DateTime) ENGINE = Memory;
```

最初に、10秒のインターバルでタンブルウィンドウを持つウィンドウビューを作成します:

```sql
CREATE WINDOW VIEW wv as select count(id), tumbleStart(w_id) as window_start from data group by tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

次に、`WATCH` クエリを使用して結果を取得します。

```sql
WATCH wv
```

ログがテーブル `data` に挿入されると、

```sql
INSERT INTO data VALUES(1,now())
```

`WATCH` クエリは次のように結果を出力します:

```text
┌─count(id)─┬────────window_start─┐
│         1 │ 2020-01-14 16:56:40 │
└───────────┴─────────────────────┘
```

また、結果をもう1つのテーブルに `TO` 構文を使ってアタッチすることができます。

```sql
CREATE WINDOW VIEW wv TO dst AS SELECT count(id), tumbleStart(w_id) as window_start FROM data GROUP BY tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

追加の例は、ClickHouse の状態を持つテストの中で見つけることができます（そこでは `*window_view*` と名付けられています）。

### Window View Usage {#window-view-usage}

ウィンドウビューは次のようなシナリオで役立ちます:

* **監視**: 時間ごとにメトリックログを集約および計算し、結果をターゲットテーブルに出力します。ダッシュボードはターゲットテーブルをソーステーブルとして使用できます。
* **分析**: 時間ウィンドウ内でデータを自動的に集約および前処理します。これは、大量のログを分析する際に便利です。前処理は、複数のクエリでの繰り返し計算を排除し、クエリのレイテンシを減少させます。

## Related Content {#related-content}

- ブログ: [ClickHouseでの時系列データの扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- ブログ: [ClickHouseを用いた可観測性ソリューションの構築 - パート2 - トレース](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)

## Temporary Views {#temporary-views}

ClickHouseは次の特性を持つ**一時ビュー**をサポートします（適用可能な通常のテーブルに従う）:

* **セッションの生涯**
  一時ビューは現在のセッションの間だけ存在します。セッションが終了すると自動的に削除されます。

* **データベースなし**
  一時ビューにデータベース名を付与することはできません。それはデータベースの外部に存在します（セッション名前空間）。

* **レプリケーションなし / ON CLUSTER不可**
  一時オブジェクトはセッションにローカルであり、`ON CLUSTER` で作成することはできません。

* **名前解決**
  一時オブジェクト（テーブルまたはビュー）が永続オブジェクトと同じ名前を持ち、クエリが名前を**データベースなし**で参照すると、**一時**オブジェクトが使用されます。

* **論理オブジェクト（ストレージなし）**
  一時ビューはその `SELECT` テキストのみを保存します（内部で `View` ストレージを使用します）。データを保持せず、`INSERT` を受け付けることはできません。

* **エンジンクラウズ**
  `ENGINE` を指定する必要はありません; `ENGINE = View` として提供されても、無視されるか同じ論理ビューとして扱われます。

* **セキュリティ / 権限**
  一時ビューの作成には `CREATE TEMPORARY VIEW` 権限が必要で、これは `CREATE VIEW` によって暗黙的に付与されます。

* **SHOW CREATE**
  `SHOW CREATE TEMPORARY VIEW view_name;` を使用して一時ビューのDDLを表示します。

### Syntax {#temporary-views-syntax}

```sql
CREATE TEMPORARY VIEW [IF NOT EXISTS] view_name AS <select_query>
```

`OR REPLACE` は一時ビューでは**サポートされていません**（通常のテーブルに合わせるため）。一時ビューを“置き換える”必要がある場合は、削除して再作成してください。

### Examples {#temporary-views-examples}

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

そのDDLを表示します:

```sql
SHOW CREATE TEMPORARY VIEW tview;
```

それを削除します:

```sql
DROP TEMPORARY VIEW IF EXISTS tview;  -- temporary views are dropped with TEMPORARY TABLE syntax
```

### Disallowed / limitations {#temporary-views-limitations}

* `CREATE OR REPLACE TEMPORARY VIEW ...` → **許可されていません**（`DROP` + `CREATE`を使用）。
* `CREATE TEMPORARY MATERIALIZED VIEW ...` / `LIVE VIEW` / `WINDOW VIEW` → **許可されていません**。
* `CREATE TEMPORARY VIEW db.view AS ...` → **許可されていません**（データベース修飾子なし）。
* `CREATE TEMPORARY VIEW view ON CLUSTER 'name' AS ...` → **許可されていません**（一時オブジェクトはセッションローカルです）。
* `POPULATE`、`REFRESH`、`TO [db.table]`、内部エンジン、および all MV 専用の句 → **一時ビューには適用されません。**

### Notes on distributed queries {#temporary-views-distributed-notes}

一時 **ビュー** は単なる定義です; データは渡されるものではありません。あなたの一時ビューが一時 **テーブル**（例: `Memory`）を参照している場合、そのデータは分散クエリの実行時にリモートサーバーに送信できます。これは通常のテーブルと同じ方法で動作します。

#### Example {#temporary-views-distributed-example}

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

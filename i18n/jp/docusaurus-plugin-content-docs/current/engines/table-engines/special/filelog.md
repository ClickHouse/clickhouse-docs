---
description: 'このエンジンは、アプリケーションログファイルをレコードのストリームとして処理できます。'
sidebar_label: 'FileLog'
sidebar_position: 160
slug: /engines/table-engines/special/filelog
title: 'FileLog テーブルエンジン'
doc_type: 'reference'
---



# FileLogテーブルエンジン {#filelog-engine}

このエンジンは、アプリケーションログファイルをレコードのストリームとして処理できます。

`FileLog`では以下のことが可能です:

- ログファイルを監視する。
- 監視対象のログファイルに追加された新しいレコードを処理する。


## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = FileLog('path_to_logs', 'format_name') SETTINGS
    [poll_timeout_ms = 0,]
    [poll_max_batch_size = 0,]
    [max_block_size = 0,]
    [max_threads = 0,]
    [poll_directory_watch_events_backoff_init = 500,]
    [poll_directory_watch_events_backoff_max = 32000,]
    [poll_directory_watch_events_backoff_factor = 2,]
    [handle_error_mode = 'default']
```

エンジン引数:

- `path_to_logs` – 購読するログファイルへのパス。ログファイルを含むディレクトリへのパス、または単一のログファイルへのパスを指定できます。ClickHouseは`user_files`ディレクトリ内のパスのみを許可することに注意してください。
- `format_name` - レコード形式。FileLogはファイル内の各行を個別のレコードとして処理するため、すべてのデータ形式が適しているわけではないことに注意してください。

オプションパラメータ:

- `poll_timeout_ms` - ログファイルからの単一ポーリングのタイムアウト。デフォルト: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `poll_max_batch_size` — 単一ポーリングでポーリングされるレコードの最大数。デフォルト: [max_block_size](/operations/settings/settings#max_block_size)。
- `max_block_size` — ポーリングの最大バッチサイズ(レコード数)。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `max_threads` - ファイルを解析する最大スレッド数。デフォルトは0で、この場合スレッド数はmax(1, physical_cpu_cores / 4)になります。
- `poll_directory_watch_events_backoff_init` - ディレクトリ監視スレッドの初期スリープ値。デフォルト: `500`。
- `poll_directory_watch_events_backoff_max` - ディレクトリ監視スレッドの最大スリープ値。デフォルト: `32000`。
- `poll_directory_watch_events_backoff_factor` - バックオフの速度。デフォルトでは指数関数的。デフォルト: `2`。
- `handle_error_mode` — FileLogエンジンのエラー処理方法。指定可能な値: default(メッセージの解析に失敗した場合に例外がスローされます)、stream(例外メッセージと生メッセージが仮想カラム`_error`と`_raw_message`に保存されます)。


## Description {#description}

配信されたレコードは自動的に追跡されるため、ログファイル内の各レコードは一度だけカウントされます。

`SELECT`はレコードの読み取りには特に有用ではありません(デバッグを除く)。各レコードは一度しか読み取ることができないためです。[マテリアライズドビュー](../../../sql-reference/statements/create/view.md)を使用してリアルタイムスレッドを作成する方が実用的です。これを行うには:

1.  エンジンを使用してFileLogテーブルを作成し、それをデータストリームとして扱います。
2.  必要な構造を持つテーブルを作成します。
3.  エンジンからデータを変換し、事前に作成したテーブルに格納するマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに接続されると、バックグラウンドでデータの収集が開始されます。これにより、ログファイルから継続的にレコードを受信し、`SELECT`を使用して必要な形式に変換できます。
1つのFileLogテーブルには任意の数のマテリアライズドビューを持つことができます。これらはテーブルから直接データを読み取るのではなく、新しいレコードを(ブロック単位で)受信するため、異なる詳細レベル(グループ化・集計ありまたはなし)で複数のテーブルに書き込むことができます。

例:

```sql
  CREATE TABLE logs (
    timestamp UInt64,
    level String,
    message String
  ) ENGINE = FileLog('user_files/my_app/app.log', 'JSONEachRow');

  CREATE TABLE daily (
    day Date,
    level String,
    total UInt64
  ) ENGINE = SummingMergeTree(day, (day, level), 8192);

  CREATE MATERIALIZED VIEW consumer TO daily
    AS SELECT toDate(toDateTime(timestamp)) AS day, level, count() AS total
    FROM queue GROUP BY day, level;

  SELECT level, sum(total) FROM daily GROUP BY level;
```

ストリームデータの受信を停止する、または変換ロジックを変更するには、マテリアライズドビューをデタッチします:

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER`を使用してターゲットテーブルを変更する場合は、ターゲットテーブルとビューからのデータ間の不整合を避けるため、マテリアライズドビューを無効にすることを推奨します。


## 仮想カラム {#virtual-columns}

- `_filename` - ログファイルの名前。データ型: `LowCardinality(String)`。
- `_offset` - ログファイル内のオフセット。データ型: `UInt64`。

`handle_error_mode='stream'` の場合の追加の仮想カラム:

- `_raw_record` - 正常に解析できなかった生レコード。データ型: `Nullable(String)`。
- `_error` - 解析失敗時に発生した例外メッセージ。データ型: `Nullable(String)`。

注意: `_raw_record` と `_error` の仮想カラムは、解析中に例外が発生した場合にのみ値が設定されます。メッセージが正常に解析された場合は常に `NULL` です。

---
slug: /engines/table-engines/special/filelog
sidebar_position: 160
sidebar_label: FileLog
title: "FileLogエンジン"
description: "このエンジンは、アプリケーションのログファイルをレコードのストリームとして処理することを可能にします。"
---

# FileLogエンジン {#filelog-engine}

このエンジンは、アプリケーションのログファイルをレコードのストリームとして処理することを可能にします。

`FileLog`を使用すると：

- ログファイルに購読できます。
- 購読したログファイルに新しいレコードが追加されると、それを処理できます。

## テーブルの作成 {#creating-a-table}

``` sql
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

エンジンの引数：

- `path_to_logs` – 購読するログファイルのパス。ログファイルのディレクトリへのパスや単一のログファイルへのパスが指定できます。ClickHouseは`user_files`ディレクトリ内のパスのみを許可します。
- `format_name` - レコード形式。FileLogはファイル内の各行を個別のレコードとして処理し、すべてのデータ形式が適しているわけではないことに注意してください。

オプションのパラメータ：

- `poll_timeout_ms` - ログファイルからの単一のポーリングのタイムアウト。デフォルト: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `poll_max_batch_size` — 単一のポーリングで取得する最大のレコード数。デフォルト: [max_block_size](../../../operations/settings/settings.md#setting-max_block_size)。
- `max_block_size` — ポーリングのための最大バッチサイズ（レコード単位）。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `max_threads` - ファイルを解析するための最大スレッド数。デフォルトは0で、これはmax(1, physical_cpu_cores / 4)を意味します。
- `poll_directory_watch_events_backoff_init` - ディレクトリ監視スレッドの初期スリープ値。デフォルト: `500`。
- `poll_directory_watch_events_backoff_max` - ディレクトリ監視スレッドの最大スリープ値。デフォルト: `32000`。
- `poll_directory_watch_events_backoff_factor` - バックオフの速度、デフォルトは指数関数的です。デフォルト: `2`。
- `handle_error_mode` — FileLogエンジンのエラー処理方法。可能な値: default（メッセージの解析に失敗した場合に例外がスローされる）、stream（例外メッセージと生のメッセージが仮想カラム`_error`と`_raw_message`に保存される）。

## 説明 {#description}

提供されたレコードは自動的に追跡されるため、ログファイル内の各レコードは一度だけカウントされます。

`SELECT`は特にレコードを読み取るために便利ではありません（デバッグを除く）。なぜなら、各レコードは一度だけ読み取ることができるからです。リアルタイムスレッドを作成するには、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md)を使用する方が実用的です。これを行うには：

1. エンジンを使用してFileLogテーブルを作成し、データストリームと見なします。
2. 希望の構造を持つテーブルを作成します。
3. エンジンからのデータを変換し、以前に作成されたテーブルに挿入するマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに接続すると、バックグラウンドでデータを収集し始めます。これにより、ログファイルからのレコードを継続的に受け取り、`SELECT`を使って必要なフォーマットに変換できます。
1つのFileLogテーブルは、好きなだけマテリアライズドビューを持つことができ、それらはテーブルから直接データを読み取るのではなく、新しいレコード（ブロック単位）を受け取ります。この方法で、異なる詳細レベル（集約を伴うものと伴わないもの）で複数のテーブルに書き込むことができます。

例：

``` sql
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
    AS SELECT toDate(toDateTime(timestamp)) AS day, level, count() as total
    FROM queue GROUP BY day, level;

  SELECT level, sum(total) FROM daily GROUP BY level;
```

ストリームデータの受信を停止するか、変換ロジックを変更するには、マテリアライズドビューをデタッチします：

``` sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER`を使用してターゲットテーブルを変更したい場合は、ターゲットテーブルとビューからのデータとの不一致を避けるために、マテリアルビューを無効にすることをお勧めします。

## 仮想カラム {#virtual-columns}

- `_filename` - ログファイルの名前。データ型: `LowCardinality(String)`。
- `_offset` - ログファイル内のオフセット。データ型: `UInt64`。

`handle_error_mode='stream'`の際の追加の仮想カラム：

- `_raw_record` - 正しく解析できなかった生のレコード。データ型: `Nullable(String)`。
- `_error` - 解析に失敗した際に発生した例外メッセージ。データ型: `Nullable(String)`。

注意: `_raw_record`と`_error`の仮想カラムは、解析中に例外が発生した場合のみ填充され、メッセージが正常に解析された場合は常に`NULL`となります。

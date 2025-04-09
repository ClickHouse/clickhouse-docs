---
slug: /engines/table-engines/special/filelog
sidebar_position: 160
sidebar_label: FileLog
title: "FileLogエンジン"
description: "このエンジンは、アプリケーションログファイルをレコードのストリームとして処理することを可能にします。"
---


# FileLogエンジン {#filelog-engine}

このエンジンは、アプリケーションログファイルをレコードのストリームとして処理することを可能にします。

`FileLog` を使用すると：

- ログファイルにサブスクライブできます。
- サブスクライブされたログファイルに新しいレコードが追加されると、それを処理できます。

## テーブルを作成する {#creating-a-table}

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

- `path_to_logs` – サブスクライブするログファイルへのパス。ログファイルが保存されているディレクトリへのパスか、単一のログファイルへのパスを指定できます。ClickHouseは`user_files`ディレクトリ内のパスのみを許可することに注意してください。
- `format_name` - レコードのフォーマット。`FileLog`はファイル内の各行を別々のレコードとして処理するため、すべてのデータフォーマットが適しているわけではありません。

オプションのパラメータ：

- `poll_timeout_ms` - ログファイルからの単一ポーリングのタイムアウト。デフォルト: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `poll_max_batch_size` — 単一ポーリングでポーリングされる最大レコード数。デフォルト: [max_block_size](/operations/settings/settings#max_block_size)。
- `max_block_size` — ポーリングの最大バッチサイズ（レコード単位）。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `max_threads` - ファイルを解析するための最大スレッド数。デフォルトは0で、これはmax(1, physical_cpu_cores / 4)の値になります。
- `poll_directory_watch_events_backoff_init` - ディレクトリ監視スレッドの初期スリープ値。デフォルト: `500`。
- `poll_directory_watch_events_backoff_max` - ディレクトリ監視スレッドの最大スリープ値。デフォルト: `32000`。
- `poll_directory_watch_events_backoff_factor` - バックオフの速度、デフォルトは指数的です。デフォルト: `2`。
- `handle_error_mode` — FileLogエンジンのエラー処理方法。可能な値: default（メッセージの解析に失敗した場合は例外がスローされる）、stream（例外メッセージと生のメッセージが仮想カラム`_error`および`_raw_message`に保存される）。

## 説明 {#description}

配信されるレコードは自動的に追跡されるため、ログファイル内の各レコードは一度のみカウントされます。

`SELECT`はレコードを読み取るためには特に役立ちません（デバッグを除く）。なぜなら、各レコードは一度だけ読み取れるからです。リアルタイムスレッドを作成するためには、[materialized views](../../../sql-reference/statements/create/view.md)を作成するのがより実用的です。これを行うには：

1. エンジンを使用してFileLogテーブルを作成し、それをデータストリームと見なします。
2. 希望する構造のテーブルを作成します。
3. エンジンからデータを変換し、事前に作成したテーブルに挿入するマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに接続すると、バックグラウンドでデータを収集し始めます。これにより、ログファイルからのレコードを継続的に受け取り、`SELECT`を使用して必要なフォーマットに変換できます。
1つのFileLogテーブルには、必要なだけのマテリアライズドビューを持つことができ、それらはテーブルからデータを直接読み取るのではなく、新しいレコード（バッチ単位）を受け取ります。この方法により、異なる詳細レベルの複数のテーブルに書き込むことができます（グループ化 - 集計ありおよびなしで）。

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

ストリームデータの受信を停止するか、変換ロジックを変更したい場合は、マテリアライズドビューを分離します：

``` sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

ターゲットテーブルを`ALTER`を使用して変更したい場合は、ターゲットテーブルとビューからのデータとの不一致を避けるために、マテリアルビューを無効にすることをお勧めします。

## 仮想カラム {#virtual-columns}

- `_filename` - ログファイルの名前。データ型: `LowCardinality(String)`。
- `_offset` - ログファイル内のオフセット。データ型: `UInt64`。

`handle_error_mode='stream'`の場合の追加の仮想カラム：

- `_raw_record` - 正常に解析できなかった生のレコード。データ型: `Nullable(String)`。
- `_error` - 解析に失敗した際に発生した例外メッセージ。データ型: `Nullable(String)`。

注意: `_raw_record` および `_error` 仮想カラムは、解析中に例外が発生した場合にのみ埋められ、メッセージが正常に解析された場合は常に`NULL`になります。

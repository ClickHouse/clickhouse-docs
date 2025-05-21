---
description: 'このエンジンは、アプリケーションのログファイルをレコードのストリームとして処理することを可能にします。'
sidebar_label: 'FileLog'
sidebar_position: 160
slug: /engines/table-engines/special/filelog
title: 'FileLogエンジン'
---


# FileLogエンジン {#filelog-engine}

このエンジンは、アプリケーションのログファイルをレコードのストリームとして処理することを可能にします。

`FileLog` を使用すると:

- ログファイルにサブスクライブできます。
- サブスクライブされたログファイルに新しいレコードが追加されると、それを処理できます。

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

- `path_to_logs` – サブスクライブするログファイルのパス。ログファイルがあるディレクトリのパスまたは単一のログファイルのパスを指定できます。ClickHouseは、`user_files` ディレクトリ内のパスのみを許可する点に注意してください。
- `format_name` - レコードフォーマット。Note that FileLogはファイル内の各行を別々のレコードとして処理し、すべてのデータ形式がこれに適しているわけではありません。

オプションのパラメータ:

- `poll_timeout_ms` - ログファイルからの単一ポーリングのタイムアウト。デフォルト: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `poll_max_batch_size` — 単一ポーリングで取得する最大レコード数。デフォルト: [max_block_size](/operations/settings/settings#max_block_size)。
- `max_block_size` — ポーリングの最大バッチサイズ（レコード数）。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `max_threads` - ファイルを解析するための最大スレッド数。デフォルトは0で、物理CPUコア数の4分の1の最大値が設定されます。
- `poll_directory_watch_events_backoff_init` - ディレクトリ監視スレッドの初期スリープ値。デフォルト: `500`。
- `poll_directory_watch_events_backoff_max` - ディレクトリ監視スレッドの最大スリープ値。デフォルト: `32000`。
- `poll_directory_watch_events_backoff_factor` - バックオフの速度。デフォルトは指数的。デフォルト: `2`。
- `handle_error_mode` — FileLogエンジンのエラー処理方法。可能な値: default (メッセージの解析に失敗した場合は例外がスローされます)、stream (例外メッセージと生のメッセージが仮想カラム `_error` と `_raw_message` に保存されます)。

## 説明 {#description}

配信されたレコードは自動的に追跡されるため、ログファイル内の各レコードは一度だけカウントされます。

`SELECT` はレコードを読み取るためにはあまり役に立たない（デバッグを除く）ですが、各レコードは一度しか読み取れません。リアルタイムスレッドを作成するためには、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md)を利用するのがより実用的です。これを実現する手順は以下の通りです：

1. エンジンを使用して FileLog テーブルを作成し、データストリームとして扱います。
2. 必要な構造を持つテーブルを作成します。
3. エンジンからデータを変換し、以前に作成したテーブルに挿入するマテリアライズドビューを作成します。

`MATERIALIZED VIEW` がエンジンに参加すると、バックグラウンドでデータの収集を開始します。これにより、ログファイルからのレコードを継続的に受け取り、`SELECT`を使用して必要な形式に変換することができます。
一つの FileLog テーブルには、好きなだけマテリアライズドビューを持つことができ、これらはテーブルから直接データを読み取るのではなく、新しいレコード（ブロック単位）を受け取ります。この方法では、異なる詳細レベル（集計や非集計）で複数のテーブルに書き込むことができます。

例：

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
    AS SELECT toDate(toDateTime(timestamp)) AS day, level, count() as total
    FROM queue GROUP BY day, level;

  SELECT level, sum(total) FROM daily GROUP BY level;
```

ストリームデータの受信を停止したり、変換ロジックを変更したりする場合は、マテリアライズドビューを切り離します：

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

ターゲットテーブルを `ALTER` を使用して変更したい場合は、ターゲットテーブルとビューからのデータの不一致を避けるために、マテリアライズドビューを無効にすることをお勧めします。

## 仮想カラム {#virtual-columns}

- `_filename` - ログファイルの名前。データ型: `LowCardinality(String)`。
- `_offset` - ログファイル内のオフセット。データ型: `UInt64`。

`handle_error_mode='stream'` の場合の追加の仮想カラム:

- `_raw_record` - 正しく解析できなかった生のレコード。データ型: `Nullable(String)`。
- `_error` - 解析中に発生した例外メッセージ。データ型: `Nullable(String)`。

注: `_raw_record` と `_error` の仮想カラムは、解析中に例外が発生した場合のみ入力され、メッセージが正常に解析された場合は常に `NULL` です。

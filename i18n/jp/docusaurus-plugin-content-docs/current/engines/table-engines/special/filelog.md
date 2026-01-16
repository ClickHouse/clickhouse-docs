---
description: 'このエンジンは、アプリケーションログファイルをレコードのストリームとして処理します。'
sidebar_label: 'FileLog'
sidebar_position: 160
slug: /engines/table-engines/special/filelog
title: 'FileLog テーブルエンジン'
doc_type: 'reference'
---

# FileLog テーブルエンジン \\{#filelog-engine\\}

このエンジンを使用すると、アプリケーションのログファイルをレコードのストリームとして処理できます。

`FileLog` を使用すると、次のことができます:

- ログファイルを監視する。
- 監視対象のログファイルに追記された新しいレコードを処理する。

## テーブルを作成する \\{#creating-a-table\\}

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

Engine 引数:

* `path_to_logs` – 購読対象とするログファイルへのパス。ログファイルを含むディレクトリへのパス、または単一のログファイルへのパスを指定できます。なお、ClickHouse は `user_files` ディレクトリ内のパスのみを許可します。
* `format_name` - レコードフォーマット。FileLog はファイル内の各行を個別のレコードとして処理するため、すべてのデータフォーマットが適しているわけではない点に注意してください。

オプションパラメータ:

* `poll_timeout_ms` - ログファイルからの 1 回のポーリングにおけるタイムアウト。デフォルト: [stream&#95;poll&#95;timeout&#95;ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
* `poll_max_batch_size` — 1 回のポーリングで取得される最大レコード数。デフォルト: [max&#95;block&#95;size](/operations/settings/settings#max_block_size)。
* `max_block_size` — ポーリング時のバッチサイズ（レコード数）の最大値。デフォルト: [max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size)。
* `max_threads` - ファイルをパースするための最大スレッド数。デフォルトは 0 で、その場合の実際の値は max(1, physical&#95;cpu&#95;cores / 4) となります。
* `poll_directory_watch_events_backoff_init` - ディレクトリ監視スレッドの初期待機時間。デフォルト: `500`。
* `poll_directory_watch_events_backoff_max` - ディレクトリ監視スレッドの最大待機時間。デフォルト: `32000`。
* `poll_directory_watch_events_backoff_factor` - バックオフの係数。デフォルトでは指数関数的に増加します。デフォルト: `2`。
* `handle_error_mode` — FileLog エンジンでエラーをどのように処理するか。指定可能な値: `default`（メッセージのパースに失敗した場合に例外をスロー）、`stream`（例外メッセージと元のメッセージを仮想カラム `_error` と `_raw_message` に保存）。

## 説明 \\{#description\\}

取り込まれたレコードは自動的に追跡されるため、ログファイル内の各レコードは一度だけカウントされます。

`SELECT` は（デバッグ用途を除き）レコードの読み取りにはあまり有用ではありません。各レコードは一度しか読み取れないためです。代わりに、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md) を使ってリアルタイム処理パイプラインを作成する方が実用的です。これを行うには、次のようにします。

1. FileLog エンジンを使用して FileLog テーブルを作成し、それをデータストリームと見なします。
2. 目的の構造を持つテーブルを作成します。
3. エンジンから読み取ったデータを変換して、事前に作成したテーブルに格納するマテリアライズドビューを作成します。

`MATERIALIZED VIEW` がエンジンに接続されると、バックグラウンドでデータの収集を開始します。これにより、ログファイルから継続的にレコードを受信し、`SELECT` を使用して必要な形式に変換できます。
1 つの FileLog テーブルには、必要な数だけマテリアライズドビューを作成できます。これらはテーブルから直接データを読み取るのではなく、新しいレコードを（ブロック単位で）受け取ります。この方法により、詳細度の異なる複数のテーブル（グループ化・集約あり／なし）に書き込むことができます。

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

ストリームデータの受信を停止するか、変換ロジックを変更するには、マテリアライズドビューをデタッチします。

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER` を使用してターゲットテーブルを変更する場合は、ターゲットテーブルとビューからのデータとの不整合を避けるため、マテリアルビューを無効化することを推奨します。

## 仮想カラム \\{#virtual-columns\\}

- `_filename` - ログファイル名。データ型: `LowCardinality(String)`。
- `_offset` - ログファイル内のオフセット。データ型: `UInt64`。

`handle_error_mode='stream'` の場合に追加される仮想カラム:

- `_raw_record` - 正常にパースできなかった生のレコード。データ型: `Nullable(String)`。
- `_error` - パース失敗時に発生した例外メッセージ。データ型: `Nullable(String)`。

注記: `_raw_record` と `_error` の仮想カラムには、パース中に例外が発生した場合のみ値が設定され、メッセージが正常にパースされた場合は常に `NULL` になります。

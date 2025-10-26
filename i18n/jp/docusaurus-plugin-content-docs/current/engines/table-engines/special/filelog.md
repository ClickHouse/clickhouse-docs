---
'description': 'このエンジンは、アプリケーションのログファイルをレコードのストリームとして処理することを可能にします。'
'sidebar_label': 'FileLog'
'sidebar_position': 160
'slug': '/engines/table-engines/special/filelog'
'title': 'FileLog エンジン'
'doc_type': 'reference'
---


# `FileLog`エンジン {#filelog-engine}

このエンジンは、アプリケーションのログファイルをレコードのストリームとして処理することを可能にします。

`FileLog`を使用すると:

- ログファイルを購読できます。
- 購読したログファイルに新しいレコードが追加されると、それを処理できます。

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

- `path_to_logs` – 購読するログファイルへのパス。ログファイルがあるディレクトリへのパスか、単一のログファイルへのパスである必要があります。ClickHouseは`user_files`ディレクトリ内のパスのみを許可します。
- `format_name` - レコード形式。FileLogはファイル内の各行を個別のレコードとして処理し、すべてのデータ形式が適しているわけではないことに注意してください。

オプションのパラメータ:

- `poll_timeout_ms` - ログファイルからの単一ポーリングのタイムアウト。デフォルト: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `poll_max_batch_size` — 単一ポーリングでポーリングされるレコードの最大数。デフォルト: [max_block_size](/operations/settings/settings#max_block_size)。
- `max_block_size` — ポーリングのための最大バッチサイズ（レコード単位）。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `max_threads` - ファイルを解析するための最大スレッド数。デフォルトは0で、これは最大(1, physical_cpu_cores / 4)となります。
- `poll_directory_watch_events_backoff_init` - ディレクトリウォッチスレッドの初期スリープ値。デフォルト: `500`。
- `poll_directory_watch_events_backoff_max` - ディレクトリウォッチスレッドの最大スリープ値。デフォルト: `32000`。
- `poll_directory_watch_events_backoff_factor` - バックオフの速度。デフォルトは指数的。デフォルト: `2`。
- `handle_error_mode` — FileLogエンジンのエラー処理方法。可能な値: default（メッセージの解析に失敗した場合は例外がスローされます）、stream（例外メッセージと生のメッセージが仮想カラム`_error`と`_raw_message`に保存されます）。

## 説明 {#description}

提供されるレコードは自動的に追跡されるため、ログファイル内の各レコードは一度だけカウントされます。

`SELECT`はレコードを読むための特に有用な手段ではありません（デバッグを除いて）。なぜなら、各レコードは一度しか読まれないからです。リアルタイムスレッドを作成する方が実用的であり、これには[materialized views](../../../sql-reference/statements/create/view.md)を使用します。これを行うには:

1. エンジンを使用してFileLogテーブルを作成し、データストリームと見なします。
2. 希望する構造のテーブルを作成します。
3. エンジンからデータを変換し、以前に作成したテーブルに配置するマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに結合されると、バックグラウンドでデータの収集が開始されます。これにより、ログファイルから継続的にレコードを受け取り、`SELECT`を使用して必要な形式に変換できます。
1つのFileLogテーブルには好きなだけマテリアライズドビューを持つことができ、それらはテーブルから直接データを読み取るのではなく、新しいレコード（ブロック単位）を受け取ります。この方法により、異なる詳細レベル（集約を伴うものと伴わないもの）で複数のテーブルに書き込むことができます。

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

ストリームデータの受信を停止したり、変換ロジックを変更したりするには、マテリアライズドビューの接続を解除します:

```sql
DETACH TABLE consumer;
ATTACH TABLE consumer;
```

`ALTER`を使用してターゲットテーブルを変更したい場合は、ターゲットテーブルとビューからのデータとの不一致を避けるために、マテリアルビューを無効にすることをお勧めします。

## 仮想カラム {#virtual-columns}

- `_filename` - ログファイルの名前。データ型: `LowCardinality(String)`。
- `_offset` - ログファイル内のオフセット。データ型: `UInt64`。

`handle_error_mode='stream'`の場合の追加の仮想カラム:

- `_raw_record` - 正常に解析されなかった生のレコード。データ型: `Nullable(String)`。
- `_error` - 解析に失敗した際に発生した例外メッセージ。データ型: `Nullable(String)`。

注意: `_raw_record`と`_error`の仮想カラムは、解析中に例外が発生した場合にのみ入力されます。メッセージが正常に解析された場合、これらは常に`NULL`です。

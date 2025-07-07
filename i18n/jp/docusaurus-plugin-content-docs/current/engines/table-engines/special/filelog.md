---
'description': 'This engine allows processing of application log files as a stream
  of records.'
'sidebar_label': 'FileLog'
'sidebar_position': 160
'slug': '/engines/table-engines/special/filelog'
'title': 'FileLog Engine'
---




# FileLog エンジン {#filelog-engine}

このエンジンは、アプリケーションのログファイルをレコードのストリームとして処理することを可能にします。

`FileLog` では次のことができます：

- ログファイルに対してサブスクライブする。
- サブスクライブしたログファイルに新しいレコードが追加されると、それを処理する。

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

エンジンの引数：

- `path_to_logs` – サブスクライブするログファイルのパス。ログファイルのディレクトリまたは単一のログファイルのパスであることができます。ClickHouse は `user_files` ディレクトリ内のパスのみを許可していることに注意してください。
- `format_name` - レコードフォーマット。FileLog はファイル内の各行を独立したレコードとして処理するため、すべてのデータフォーマットが適しているわけではありません。

オプションのパラメータ：

- `poll_timeout_ms` - ログファイルからの単一ポーリングのタイムアウト。デフォルト: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `poll_max_batch_size` — 単一ポーリングでポーリングされるレコードの最大数。デフォルト: [max_block_size](/operations/settings/settings#max_block_size)。
- `max_block_size` — ポーリング用の最大バッチサイズ（レコード数）。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `max_threads` - ファイルを解析するための最大スレッド数。デフォルトは 0 で、これは max(1, physical_cpu_cores / 4) を意味します。
- `poll_directory_watch_events_backoff_init` - ディレクトリ監視スレッドの初期スリープ値。デフォルト: `500`。
- `poll_directory_watch_events_backoff_max` - ディレクトリ監視スレッドの最大スリープ値。デフォルト: `32000`。
- `poll_directory_watch_events_backoff_factor` - バックオフの速さ。デフォルトは指数的です。デフォルト: `2`。
- `handle_error_mode` — FileLog エンジンのエラー処理方法。可能な値: default（メッセージの解析に失敗した場合は例外がスローされる）、stream（例外メッセージと生のメッセージが仮想カラム `_error` と `_raw_message` に保存される）。

## 説明 {#description}

配信されたレコードは自動的に追跡されるため、ログファイル内の各レコードは一度だけカウントされます。

`SELECT` はレコードを読むのには特に便利ではありません（デバッグを除いて）。なぜなら、各レコードは一度だけ読むことができるからです。リアルタイムスレッドを作成することがより実用的であり、そのためには [materialized views](../../../sql-reference/statements/create/view.md) を使用します。これを行うには：

1. エンジンを使用して FileLog テーブルを作成し、データストリームとして考えます。
2. 希望の構造を持つテーブルを作成します。
3. エンジンからデータを変換し、事前に作成したテーブルに格納する materialized view を作成します。

`MATERIALIZED VIEW` がエンジンに参加すると、バックグラウンドでデータの収集を開始します。これにより、ログファイルからレコードを継続的に受け取り、`SELECT` を使用して必要な形式に変換できます。
1 つの FileLog テーブルには、希望する数だけ materialized view を持つことができ、これらはテーブルから直接データを読み取るのではなく、新しいレコード（バッチで）を受け取ります。このようにして、異なる詳細レベル（グループ化 - 集約あり、なし）で複数のテーブルに書き込むことができます。

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

ストリームデータの受信を停止したり、変換ロジックを変更したりするには、materialized view を切り離します：

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER` を使用してターゲットテーブルを変更する場合は、ターゲットテーブルとビューからのデータの不一致を避けるために、materialized view を無効にすることを推奨します。

## 仮想カラム {#virtual-columns}

- `_filename` - ログファイルの名前。データ型：`LowCardinality(String)`。
- `_offset` - ログファイル内のオフセット。データ型：`UInt64`。

`handle_error_mode='stream'` の場合の追加の仮想カラム：

- `_raw_record` - 正しく解析できなかった生のレコード。データ型：`Nullable(String)`。
- `_error` - 解析失敗時に発生した例外メッセージ。データ型：`Nullable(String)`。

注意： `_raw_record` および `_error` の仮想カラムは、解析中に例外が発生した場合のみ充填され、メッセージが正常に解析された場合は常に `NULL` です。

---
description: 'This engine allows integrating ClickHouse with RabbitMQ.'
sidebar_label: 'RabbitMQ'
sidebar_position: 170
slug: '/engines/table-engines/integrations/rabbitmq'
title: 'RabbitMQ Engine'
---




# RabbitMQ エンジン

このエンジンは、ClickHouse と [RabbitMQ](https://www.rabbitmq.com) を統合することを可能にします。

`RabbitMQ` を利用すると：

- データフローを発行または購読できます。
- 流れが利用可能になると、それを処理できます。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = RabbitMQ SETTINGS
    rabbitmq_host_port = 'host:port' [or rabbitmq_address = 'amqp(s)://guest:guest@localhost/vhost'],
    rabbitmq_exchange_name = 'exchange_name',
    rabbitmq_format = 'data_format'[,]
    [rabbitmq_exchange_type = 'exchange_type',]
    [rabbitmq_routing_key_list = 'key1,key2,...',]
    [rabbitmq_secure = 0,]
    [rabbitmq_schema = '',]
    [rabbitmq_num_consumers = N,]
    [rabbitmq_num_queues = N,]
    [rabbitmq_queue_base = 'queue',]
    [rabbitmq_deadletter_exchange = 'dl-exchange',]
    [rabbitmq_persistent = 0,]
    [rabbitmq_skip_broken_messages = N,]
    [rabbitmq_max_block_size = N,]
    [rabbitmq_flush_interval_ms = N,]
    [rabbitmq_queue_settings_list = 'x-dead-letter-exchange=my-dlx,x-max-length=10,x-overflow=reject-publish',]
    [rabbitmq_queue_consume = false,]
    [rabbitmq_address = '',]
    [rabbitmq_vhost = '/',]
    [rabbitmq_username = '',]
    [rabbitmq_password = '',]
    [rabbitmq_commit_on_select = false,]
    [rabbitmq_max_rows_per_message = 1,]
    [rabbitmq_handle_error_mode = 'default']
```

必要なパラメータ：

- `rabbitmq_host_port` – host:port (例： `localhost:5672`)。
- `rabbitmq_exchange_name` – RabbitMQ のエクスチェンジ名。
- `rabbitmq_format` – メッセージフォーマット。SQL の `FORMAT` 関数と同じ記法を使用します。例えば、`JSONEachRow`。詳細については、[Formats](../../../interfaces/formats.md) セクションを参照してください。

オプションのパラメータ：

- `rabbitmq_exchange_type` – RabbitMQ のエクスチェンジのタイプ：`direct`, `fanout`, `topic`, `headers`, `consistent_hash`。デフォルト：`fanout`。
- `rabbitmq_routing_key_list` – カンマ区切りのルーティングキーのリスト。
- `rabbitmq_schema` – フォーマットがスキーマ定義を必要とする場合に使用するパラメータ。例えば、[Cap'n Proto](https://capnproto.org/) はスキーマファイルのパスとルートの `schema.capnp:Message` オブジェクトの名前を必要とします。
- `rabbitmq_num_consumers` – テーブルごとの消費者の数。一つの消費者のスループットが不足している場合はより多くの消費者を指定してください。デフォルト：`1`。
- `rabbitmq_num_queues` – キューの総数。この数を増やすことでパフォーマンスが大幅に向上する可能性があります。デフォルト：`1`。
- `rabbitmq_queue_base` - キュー名のヒントを指定します。この設定の使用事例は以下に記載されています。
- `rabbitmq_deadletter_exchange` - [デッドレターエクスチェンジ](https://www.rabbitmq.com/dlx.html) の名前を指定します。このエクスチェンジ名で別のテーブルを作成し、メッセージを収集できます。デフォルトではデッドレターエクスチェンジは指定されていません。
- `rabbitmq_persistent` - 1 (true) に設定すると、挿入クエリの配信モードが 2 に設定されます（メッセージを 'persistent' とマークします）。デフォルト：`0`。
- `rabbitmq_skip_broken_messages` – スキーマ不適合のメッセージのブロックごとの RabbitMQ メッセージパーサーの許容度。`rabbitmq_skip_broken_messages = N` の場合、エンジンは解析できない *N* の RabbitMQ メッセージをスキップします（メッセージはデータの行に相当します）。デフォルト：`0`。
- `rabbitmq_max_block_size` - RabbitMQ からデータをフラッシュする前に収集される行の数。デフォルト：[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `rabbitmq_flush_interval_ms` - RabbitMQ からデータをフラッシュするためのタイムアウト。デフォルト：[stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `rabbitmq_queue_settings_list` - キュー作成時に RabbitMQ 設定を設定するために使用されます。利用可能な設定：`x-max-length`, `x-max-length-bytes`, `x-message-ttl`, `x-expires`, `x-priority`, `x-max-priority`, `x-overflow`, `x-dead-letter-exchange`, `x-queue-type`。キューの `durable` 設定は自動的に有効になります。
- `rabbitmq_address` - 接続のためのアドレス。この設定または `rabbitmq_host_port` を使用します。
- `rabbitmq_vhost` - RabbitMQ の vhost。デフォルト： `'\''`。
- `rabbitmq_queue_consume` - ユーザー定義のキューを使用し、RabbitMQ の設定を行わない（エクスチェンジ、キュー、バインディングを宣言しない）。デフォルト：`false`。
- `rabbitmq_username` - RabbitMQ のユーザー名。
- `rabbitmq_password` - RabbitMQ のパスワード。
- `reject_unhandled_messages` - エラーが発生した場合にメッセージを拒否します（RabbitMQ に否定確認を送信します）。この設定は、`rabbitmq_queue_settings_list` に `x-dead-letter-exchange` が定義されている場合、自動的に有効になります。
- `rabbitmq_commit_on_select` - セレクトクエリが実行されたときにメッセージをコミットします。デフォルト：`false`。
- `rabbitmq_max_rows_per_message` — 行ベースフォーマットにおける一つの RabbitMQ メッセージあたりの最大行数。デフォルト : `1`。
- `rabbitmq_empty_queue_backoff_start` — RabbitMQ キューが空のときにリードを再スケジュールするための開始バックオフポイント。
- `rabbitmq_empty_queue_backoff_end` — RabbitMQ キューが空のときにリードを再スケジュールするための終了バックオフポイント。
- `rabbitmq_handle_error_mode` — RabbitMQ エンジンのエラー処理方法。可能な値：default（メッセージの解析に失敗した場合に例外がスローされる）、stream（例外メッセージと生のメッセージが仮想カラム `_error` と `_raw_message` に保存される）。

* [ ] SSL 接続：

`rabbitmq_secure = 1` または接続アドレスに `amqps` を使用します： `rabbitmq_address = 'amqps://guest:guest@localhost/vhost'`。
使用されるライブラリのデフォルトの動作は、生成された TLS 接続が十分に安全であることを確認しないことです。証明書が期限切れ、自己署名、存在しない、または無効である場合でも、接続は単に許可されます。証明書の厳格なチェックは、将来的に実装される可能性があります。

また、rabbitmq 関連の設定と一緒にフォーマット設定を追加することもできます。

例：

```sql
  CREATE TABLE queue (
    key UInt64,
    value UInt64,
    date DateTime
  ) ENGINE = RabbitMQ SETTINGS rabbitmq_host_port = 'localhost:5672',
                            rabbitmq_exchange_name = 'exchange1',
                            rabbitmq_format = 'JSONEachRow',
                            rabbitmq_num_consumers = 5,
                            date_time_input_format = 'best_effort';
```

RabbitMQ サーバーの設定は、ClickHouse の設定ファイルを使用して追加する必要があります。

必要な設定：

```xml
 <rabbitmq>
    <username>root</username>
    <password>clickhouse</password>
 </rabbitmq>
```

追加の設定：

```xml
 <rabbitmq>
    <vhost>clickhouse</vhost>
 </rabbitmq>
```

## 説明 {#description}

`SELECT` はメッセージを読むためには特に有用ではありません（デバッグを除く）、なぜなら各メッセージは一度しか読み取れないからです。リアルタイムスレッドを作成することがより実用的です。それには、[materialized views](../../../sql-reference/statements/create/view.md) を使用します。そのためには：

1. エンジンを利用して RabbitMQ のコンシューマーを作成し、それをデータストリームとみなします。
2. 希望する構造を持つテーブルを作成します。
3. エンジンからデータを変換し、以前に作成したテーブルに挿入する Materialized View を作成します。

`MATERIALIZED VIEW` がエンジンと結合すると、バックグラウンドでデータの収集を開始します。これにより、RabbitMQ からメッセージを継続的に受信し、`SELECT` を使用して必要なフォーマットに変換できます。
一つの RabbitMQ テーブルは、好きなだけの Materialized View を持つことができます。

データは `rabbitmq_exchange_type` と指定された `rabbitmq_routing_key_list` に基づいてチャネルされることがあります。
テーブルごとにエクスチェンジは 1 つまでしか存在できません。1 つのエクスチェンジは複数のテーブル間で共有でき、複数のテーブルへのルーティングを同時に可能にします。

エクスチェンジタイプのオプション：

- `direct` - ルーティングはキーの正確な一致に基づいています。例：テーブルキーリスト：`key1,key2,key3,key4,key5`、メッセージキーはそれらのいずれかに等しいことができます。
- `fanout` - キーに関わらず、すべてのテーブルにルーティング（エクスチェンジ名が同じ場合）。
- `topic` - ルーティングはドットで区切られたキーのパターンに基づいています。例：`*.logs`, `records.*.*.2020`, `*.2018,*.2019,*.2020`。
- `headers` - ルーティングは `key=value` の一致に基づき、設定 `x-match=all` または `x-match=any` があります。例：テーブルキーリスト：`x-match=all,format=logs,type=report,year=2020`。
- `consistent_hash` - データはすべてのバウンドテーブル間で均等に分配されます（エクスチェンジ名が同じ場合）。このエクスチェンジタイプは RabbitMQ プラグイン `rabbitmq-plugins enable rabbitmq_consistent_hash_exchange` を使って有効化する必要があります。

`rabbitmq_queue_base` を設定することで次のようなケースで使用できます：

- 異なるテーブルがキューを共有できるようにし、複数の消費者が同じキューに登録できるようにします。これによりパフォーマンスが向上します。 `rabbitmq_num_consumers` および/または `rabbitmq_num_queues` 設定を使用する場合、これらのパラメータが同じであればキューが正確に一致します。
- 全てのメッセージが正常に消費されなかった場合に、特定の耐久性キューからの読み取りを復元できるようにします。特定のキューからの消費を再開するには、その名前を `rabbitmq_queue_base` 設定に設定し、`rabbitmq_num_consumers` および `rabbitmq_num_queues` を指定しないでください（デフォルトは 1）。特定のテーブルに宣言された全てのキューからの消費を再開したい場合は、同じ設定：`rabbitmq_queue_base`, `rabbitmq_num_consumers`, `rabbitmq_num_queues` を指定してください。デフォルトでは、キュー名はテーブルに固有のものになります。
- キューが耐久性であり、自動的に削除されないため、再利用できます。（RabbitMQ CLI ツールを使用して削除できます。）

パフォーマンスを向上させるため、受信したメッセージは [max_insert_block_size](/operations/settings/settings#max_insert_block_size) のサイズのブロックにグループ化されます。ブロックが [stream_flush_interval_ms](../../../operations/server-configuration-parameters/settings.md) ミリ秒以内で形成されなかった場合、データはブロックの完全性に関係なく、テーブルにフラッシュされます。

`rabbitmq_num_consumers` および/または `rabbitmq_num_queues` 設定が `rabbitmq_exchange_type` とともに指定された場合：

- `rabbitmq-consistent-hash-exchange` プラグインを有効にする必要があります。
- 発行されたメッセージの `message_id` プロパティを指定する必要があります（各メッセージ/バッチに対して一意）。

挿入クエリには、各発行されたメッセージに対して追加されるメッセージメタデータがあります： `messageID` と `republished` フラグ（再発行された場合は true） - メッセージヘッダーを介してアクセスできます。

挿入と Materialized View に同じテーブルを使用しないでください。

例：

```sql
  CREATE TABLE queue (
    key UInt64,
    value UInt64
  ) ENGINE = RabbitMQ SETTINGS rabbitmq_host_port = 'localhost:5672',
                            rabbitmq_exchange_name = 'exchange1',
                            rabbitmq_exchange_type = 'headers',
                            rabbitmq_routing_key_list = 'format=logs,type=report,year=2020',
                            rabbitmq_format = 'JSONEachRow',
                            rabbitmq_num_consumers = 5;

  CREATE TABLE daily (key UInt64, value UInt64)
    ENGINE = MergeTree() ORDER BY key;

  CREATE MATERIALIZED VIEW consumer TO daily
    AS SELECT key, value FROM queue;

  SELECT key, value FROM daily ORDER BY key;
```

## 仮想カラム {#virtual-columns}

- `_exchange_name` - RabbitMQ エクスチェンジ名。データ型： `String`。
- `_channel_id` - メッセージを受信したコンシューマーが宣言された ChannelID。データ型： `String`。
- `_delivery_tag` - 受信したメッセージの DeliveryTag。チャネルごとにスコープが設定されています。データ型： `UInt64`。
- `_redelivered` - メッセージの `redelivered` フラグ。データ型： `UInt8`。
- `_message_id` - 受信したメッセージの messageID；発行時に設定されていれば非空です。データ型： `String`。
- `_timestamp` - 受信したメッセージのタイムスタンプ；発行時に設定されていれば非空です。データ型： `UInt64`。

`kafka_handle_error_mode='stream'` の場合の追加の仮想カラム：

- `_raw_message` - 正しく解析できなかった生のメッセージ。データ型： `Nullable(String)`。
- `_error` - 解析に失敗したときに発生した例外メッセージ。データ型： `Nullable(String)`。

注意： `_raw_message` と `_error` の仮想カラムは、解析中に例外が発生した場合のみ埋められ、メッセージが正常に解析された場合は常に `NULL` です。

## 注意点 {#caveats}

[デフォルトカラム式](/sql-reference/statements/create/table.md/#default_values)（`DEFAULT`、`MATERIALIZED`、`ALIAS` など）をテーブル定義に指定することができますが、これらは無視されます。その代わり、カラムはそれぞれの型のデフォルト値で埋められます。

## データフォーマットのサポート {#data-formats-support}

RabbitMQ エンジンは、ClickHouse でサポートされているすべての [フォーマット](../../../interfaces/formats.md) をサポートしています。
一つの RabbitMQ メッセージ内の行数は、フォーマットが行ベースかブロックベースかに依存します：

- 行ベースフォーマットの場合、一つの RabbitMQ メッセージ内の行数は `rabbitmq_max_rows_per_message` を設定することで制御できます。
- ブロックベースフォーマットの場合、ブロックを小さな部分に分割することはできませんが、ブロック内の行数は一般設定 [max_block_size](/operations/settings/settings#max_block_size) によって制御できます。

---
description: 'このエンジンを使用すると、ClickHouse を RabbitMQ と統合できます。'
sidebar_label: 'RabbitMQ'
sidebar_position: 170
slug: /engines/table-engines/integrations/rabbitmq
title: 'RabbitMQ テーブルエンジン'
doc_type: 'guide'
---

# RabbitMQ テーブルエンジン \{#rabbitmq-table-engine\}

このエンジンを使用すると、ClickHouse を [RabbitMQ](https://www.rabbitmq.com) と統合できます。

`RabbitMQ` を利用すると、次のことが可能です。

- データフローを公開または購読できる。
- ストリームを、利用可能になり次第処理できる。

## テーブルの作成 \{#creating-a-table\}

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

必須パラメータ:

* `rabbitmq_host_port` – host:port（例: `localhost:5672`）。
* `rabbitmq_exchange_name` – RabbitMQ のエクスチェンジ名。
* `rabbitmq_format` – メッセージフォーマット。SQL の `FORMAT` 関数と同じ表記を使用します（例: `JSONEachRow`）。詳細は [Formats](../../../interfaces/formats.md) セクションを参照してください。

オプションのパラメータ:


- `rabbitmq_exchange_type` – RabbitMQ exchange の種類。`direct`、`fanout`、`topic`、`headers`、`consistent_hash` のいずれか。デフォルト: `fanout`。
- `rabbitmq_routing_key_list` – ルーティングキーのカンマ区切りリスト。
- `rabbitmq_schema` – フォーマットがスキーマ定義を必要とする場合に使用するパラメータ。たとえば [Cap'n Proto](https://capnproto.org/) では、スキーマファイルへのパスとルート `schema.capnp:Message` オブジェクトの名前が必要です。
- `rabbitmq_num_consumers` – テーブルごとの consumer 数。1 つの consumer のスループットが不十分な場合は、より多くの consumer を指定します。デフォルト: `1`
- `rabbitmq_num_queues` – キューの総数。この値を増やすとパフォーマンスを大幅に向上できる場合があります。デフォルト: `1`。
- `rabbitmq_queue_base` - キュー名のヒントを指定します。この設定のユースケースは以下で説明します。
- `rabbitmq_persistent` - 1 (true) に設定すると、INSERT クエリで delivery mode が 2 に設定され (メッセージが「persistent」としてマークされます)。デフォルト: `0`。
- `rabbitmq_skip_broken_messages` – ブロックごとのスキーマ非互換メッセージに対する RabbitMQ メッセージパーサーの許容数。`rabbitmq_skip_broken_messages = N` の場合、パースできない RabbitMQ メッセージ *N* 件 (メッセージ 1 件はデータの 1 行に相当) をエンジンがスキップします。デフォルト: `0`。
- `rabbitmq_max_block_size` - RabbitMQ からフラッシュする前に収集する行数。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `rabbitmq_flush_interval_ms` - RabbitMQ からデータをフラッシュするためのタイムアウト。デフォルト: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `rabbitmq_queue_settings_list` - キュー作成時に RabbitMQ の設定を行えるようにします。利用可能な設定: `x-max-length`、`x-max-length-bytes`、`x-message-ttl`、`x-expires`、`x-priority`、`x-max-priority`、`x-overflow`、`x-dead-letter-exchange`、`x-queue-type`。`durable` 設定はキューに対して自動的に有効になります。
- `rabbitmq_address` - 接続先アドレス。この設定か `rabbitmq_host_port` のいずれかを使用します。
- `rabbitmq_vhost` - RabbitMQ vhost。デフォルト: `'\'`。
- `rabbitmq_queue_consume` - ユーザー定義キューを使用し、RabbitMQ のセットアップ (exchange、queue、binding の宣言) を行いません。デフォルト: `false`。
- `rabbitmq_username` - RabbitMQ のユーザー名。
- `rabbitmq_password` - RabbitMQ のパスワード。
- `reject_unhandled_messages` - エラー発生時にメッセージを reject し (RabbitMQ に negative acknowledgement を送信)、処理しません。`rabbitmq_queue_settings_list` に `x-dead-letter-exchange` が定義されている場合、この設定は自動的に有効になります。
- `rabbitmq_commit_on_select` - SELECT クエリが実行されたときにメッセージをコミットします。デフォルト: `false`。
- `rabbitmq_max_rows_per_message` — 行ベースのフォーマットで 1 件の RabbitMQ メッセージに書き込まれる最大行数。デフォルト: `1`。
- `rabbitmq_empty_queue_backoff_start_ms` — RabbitMQ キューが空の場合に再読み取りをスケジュールし直す際のバックオフ開始ポイント (ミリ秒)。
- `rabbitmq_empty_queue_backoff_end_ms` — RabbitMQ キューが空の場合に再読み取りをスケジュールし直す際のバックオフ終了ポイント (ミリ秒)。
- `rabbitmq_empty_queue_backoff_step_ms` — RabbitMQ キューが空の場合に再読み取りをスケジュールし直す際のバックオフステップ (ミリ秒)。
- `rabbitmq_handle_error_mode` — RabbitMQ エンジンにおけるエラーの処理方法。指定可能な値: `default` (メッセージのパースに失敗した場合に例外をスロー)、`stream` (例外メッセージと生メッセージを仮想カラム `_error` および `_raw_message` に保存)、`dead_letter_queue` (エラー関連データを system.dead_letter_queue に保存)。

### SSL 接続 \{#ssl-connection\}

`rabbitmq_secure = 1` を使用するか、接続アドレスに `amqps` を指定します: `rabbitmq_address = 'amqps://guest:guest@localhost/vhost'`。
使用しているライブラリのデフォルト動作では、確立された TLS 接続が十分に安全かどうかは検証されません。証明書の有効期限切れや自己署名、欠如、その他の無効な状態であっても、接続はそのまま許可されます。証明書のより厳密な検証は、将来的に実装される可能性があります。

また、RabbitMQ 関連の設定と併せてフォーマット設定を追加することもできます。

例:

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

RabbitMQ サーバーの設定は、ClickHouse の設定ファイルに追加する必要があります。

必須の設定:

```xml
 <rabbitmq>
    <username>root</username>
    <password>clickhouse</password>
 </rabbitmq>
```

追加設定:

```xml
 <rabbitmq>
    <vhost>clickhouse</vhost>
 </rabbitmq>
```


## 説明 \{#description\}

各メッセージは一度しか読み取れないため、メッセージの読み取りに `SELECT` を使うのは（デバッグ用途を除き）あまり有用ではありません。代わりに、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md) を使ってリアルタイム処理用のパイプラインを作成する方が実用的です。そのためには次の手順を実行します。

1. エンジンを使用して RabbitMQ コンシューマを作成し、それをデータストリームとして扱います。
2. 目的の構造を持つテーブルを作成します。
3. エンジンからのデータを変換して、前の手順で作成したテーブルに投入するマテリアライズドビューを作成します。

`MATERIALIZED VIEW` がエンジンに紐付けられると、バックグラウンドでデータ収集を開始します。これにより、RabbitMQ から継続的にメッセージを受信し、`SELECT` を使って必要な形式に変換できます。
1 つの RabbitMQ テーブルには、任意の数のマテリアライズドビューを作成できます。

データは `rabbitmq_exchange_type` と指定された `rabbitmq_routing_key_list` に基づいて振り分けることができます。
1 つのテーブルにつき、エクスチェンジは 1 つまでです。1 つのエクスチェンジを複数のテーブルで共有することができ、これにより同時に複数テーブルへのルーティングが可能になります。

エクスチェンジタイプの種類は次のとおりです。

* `direct` - ルーティングはキーの完全一致に基づきます。テーブル側のキーリスト例: `key1,key2,key3,key4,key5`。メッセージキーはそのいずれかと等しくなります。
* `fanout` - キーに関係なく（エクスチェンジ名が同じである）すべてのテーブルにルーティングします。
* `topic` - ドット区切りのキーを使ったパターンに基づいてルーティングします。例: `*.logs`, `records.*.*.2020`, `*.2018,*.2019,*.2020`。
* `headers` - `x-match=all` または `x-match=any` の設定とともに、`key=value` の一致に基づいてルーティングします。テーブル側のキーリスト例: `x-match=all,format=logs,type=report,year=2020`。
* `consistent_hash` - データはバインドされているすべてのテーブル（エクスチェンジ名が同じ）間で均等に分散されます。このエクスチェンジタイプは RabbitMQ プラグイン `rabbitmq-plugins enable rabbitmq_consistent_hash_exchange` によって有効化する必要がある点に注意してください。

`rabbitmq_queue_base` 設定は次のような場合に使用できます:

* 複数のテーブルでキューを共有し、同じキューに対して複数のコンシューマを登録してパフォーマンスを向上させる場合。`rabbitmq_num_consumers` および/または `rabbitmq_num_queues` 設定を使用する場合、これらのパラメータが同じであれば、キューの完全な一致が実現されます。
* すべてのメッセージが正常に消費されなかった場合に、特定の永続キューからの読み取りを復元できるようにする場合。特定の 1 つのキューからの読み取りを再開するには、そのキュー名を `rabbitmq_queue_base` 設定に指定し、`rabbitmq_num_consumers` と `rabbitmq_num_queues` は指定しないでください（デフォルトは 1）。特定のテーブルに対して宣言されたすべてのキューからの読み取りを再開するには、同じ設定 `rabbitmq_queue_base`, `rabbitmq_num_consumers`, `rabbitmq_num_queues` を指定します。デフォルトでは、キュー名はテーブルごとに一意になります。
* キューが durable で自動削除されないため、キューを再利用する場合。（任意の RabbitMQ CLI ツールから削除できます。）

パフォーマンス向上のため、受信したメッセージは [max&#95;insert&#95;block&#95;size](/operations/settings/settings#max_insert_block_size) のサイズのブロックにまとめられます。もしブロックが [stream&#95;flush&#95;interval&#95;ms](../../../operations/server-configuration-parameters/settings.md) ミリ秒以内に形成されなかった場合は、ブロックが完全でなくてもデータはテーブルにフラッシュされます。

`rabbitmq_exchange_type` と一緒に `rabbitmq_num_consumers` および/または `rabbitmq_num_queues` 設定が指定されている場合:

* `rabbitmq-consistent-hash-exchange` プラグインを有効化する必要があります。
* 公開されるメッセージの `message_id` プロパティを指定する必要があります（メッセージ/バッチごとに一意）。

INSERT クエリでは、公開された各メッセージに対して追加されるメッセージメタデータ `messageID` と `republished` フラグ（複数回公開された場合は true）が用意されており、メッセージヘッダー経由でアクセスできます。

同じテーブルを INSERT とマテリアライズドビューの両方に使用しないでください。

例:

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


## 仮想カラム \\{#virtual-columns\\}

- `_exchange_name` - RabbitMQ のエクスチェンジ名。データ型: `String`。
- `_channel_id` - メッセージを受信したコンシューマが宣言された ChannelID。データ型: `String`。
- `_delivery_tag` - 受信メッセージの DeliveryTag。チャネルごとのスコープ。データ型: `UInt64`。
- `_redelivered` - メッセージの `redelivered` フラグ。データ型: `UInt8`。
- `_message_id` - 受信メッセージの messageID。メッセージがパブリッシュされたときに設定されていれば非空。データ型: `String`。
- `_timestamp` - 受信メッセージの timestamp。メッセージがパブリッシュされたときに設定されていれば非空。データ型: `UInt64`。

`rabbitmq_handle_error_mode='stream'` の場合の追加の仮想カラム:

- `_raw_message` - 正常にパースできなかった生のメッセージ。データ型: `Nullable(String)`。
- `_error` - パースに失敗した際に発生した例外メッセージ。データ型: `Nullable(String)`。

注意: `_raw_message` および `_error` 仮想カラムは、パース中に例外が発生した場合にのみ値が設定され、メッセージが正常にパースされた場合は常に `NULL` です。

## 注意事項 \\{#caveats\\}

テーブル定義で [`DEFAULT`、`MATERIALIZED`、`ALIAS`] などの[デフォルトの列式](/sql-reference/statements/create/table.md/#default_values)を指定することはできますが、これらは無視されます。その代わり、各列には対応する型のデフォルト値が設定されます。

## データ形式のサポート \\{#data-formats-support\\}

RabbitMQ エンジンは、ClickHouse がサポートしているすべての[フォーマット](../../../interfaces/formats.md)をサポートします。
1 つの RabbitMQ メッセージ内の行数は、フォーマットが行ベースかブロックベースかによって異なります。

- 行ベースのフォーマットでは、1 つの RabbitMQ メッセージ内の行数は `rabbitmq_max_rows_per_message` の設定で制御できます。
- ブロックベースのフォーマットではブロックをより小さな部分に分割することはできませんが、1 つのブロック内の行数は一般設定 [max_block_size](/operations/settings/settings#max_block_size) によって制御できます。
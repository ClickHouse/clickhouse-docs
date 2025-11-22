---
description: 'ClickHouseをRabbitMQと統合するためのエンジンです。'
sidebar_label: 'RabbitMQ'
sidebar_position: 170
slug: /engines/table-engines/integrations/rabbitmq
title: 'RabbitMQ テーブルエンジン'
doc_type: 'guide'
---



# RabbitMQ テーブルエンジン

このエンジンを使用すると、ClickHouse を [RabbitMQ](https://www.rabbitmq.com) と統合できます。

`RabbitMQ` を使用すると、次のことができます。

- データフローのパブリッシュ（配信）またはサブスクライブ（購読）を行う。
- 利用可能になったストリームを順次処理する。



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

必須パラメータ:

- `rabbitmq_host_port` – host:port（例: `localhost:5672`）。
- `rabbitmq_exchange_name` – RabbitMQエクスチェンジ名。
- `rabbitmq_format` – メッセージフォーマット。SQL `FORMAT`関数と同じ表記法を使用します（例: `JSONEachRow`）。詳細については、[フォーマット](../../../interfaces/formats.md)セクションを参照してください。

オプションパラメータ:


- `rabbitmq_exchange_type` – RabbitMQ exchange の種類。`direct`、`fanout`、`topic`、`headers`、`consistent_hash`。デフォルト: `fanout`。
- `rabbitmq_routing_key_list` – ルーティングキーのカンマ区切りリスト。
- `rabbitmq_schema` – フォーマットがスキーマ定義を必要とする場合に使用しなければならないパラメータ。例えば [Cap'n Proto](https://capnproto.org/) は、スキーマファイルへのパスと root `schema.capnp:Message` オブジェクトの名前を必要とします。
- `rabbitmq_num_consumers` – テーブルごとの consumer 数。1 つの consumer のスループットが不十分な場合は、より多くの consumer を指定します。デフォルト: `1`。
- `rabbitmq_num_queues` – キューの合計数。この値を増やすとパフォーマンスが大幅に向上する場合があります。デフォルト: `1`。
- `rabbitmq_queue_base` - キュー名に対するヒントを指定します。この設定のユースケースは下記で説明します。
- `rabbitmq_deadletter_exchange` - [dead letter exchange](https://www.rabbitmq.com/dlx.html) の名前を指定します。この exchange 名を使って別のテーブルを作成し、メッセージが dead letter exchange に再公開された場合にそれらのメッセージを収集できます。デフォルトでは dead letter exchange は指定されていません。
- `rabbitmq_persistent` - 1 (true) が設定されている場合、INSERT クエリにおける delivery mode は 2 に設定されます（メッセージを「persistent」としてマークします）。デフォルト: `0`。
- `rabbitmq_skip_broken_messages` – RabbitMQ メッセージパーサが、ブロックごとにスキーマと互換性のないメッセージを許容する数。`rabbitmq_skip_broken_messages = N` の場合、パースできない *N* 個の RabbitMQ メッセージ（メッセージは 1 行のデータに相当）をエンジンがスキップします。デフォルト: `0`。
- `rabbitmq_max_block_size` - RabbitMQ からデータをフラッシュする前に収集する行数。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `rabbitmq_flush_interval_ms` - RabbitMQ からデータをフラッシュするためのタイムアウト。デフォルト: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `rabbitmq_queue_settings_list` - キュー作成時に RabbitMQ の設定を行うことができます。利用可能な設定: `x-max-length`, `x-max-length-bytes`, `x-message-ttl`, `x-expires`, `x-priority`, `x-max-priority`, `x-overflow`, `x-dead-letter-exchange`, `x-queue-type`。`durable` 設定はキューに対して自動的に有効化されます。
- `rabbitmq_address` - 接続先アドレス。この設定または `rabbitmq_host_port` のどちらか一方を使用します。
- `rabbitmq_vhost` - RabbitMQ vhost。デフォルト: `'\'`。
- `rabbitmq_queue_consume` - ユーザー定義キューを使用し、exchange、queue、binding の宣言など、RabbitMQ のセットアップを一切行いません。デフォルト: `false`。
- `rabbitmq_username` - RabbitMQ ユーザー名。
- `rabbitmq_password` - RabbitMQ パスワード。
- `reject_unhandled_messages` - エラー発生時にメッセージを拒否します（RabbitMQ に negative acknowledgement を送信）。`rabbitmq_queue_settings_list` に `x-dead-letter-exchange` が定義されている場合、この設定は自動的に有効になります。
- `rabbitmq_commit_on_select` - SELECT クエリ実行時にメッセージをコミットします。デフォルト: `false`。
- `rabbitmq_max_rows_per_message` — row ベースフォーマットで、1 つの RabbitMQ メッセージに書き込む最大行数。デフォルト: `1`。
- `rabbitmq_empty_queue_backoff_start` — RabbitMQ キューが空の場合に、読み取りを再スケジュールするためのバックオフの開始ポイント。
- `rabbitmq_empty_queue_backoff_end` — RabbitMQ キューが空の場合に、読み取りを再スケジュールするためのバックオフの終了ポイント。
- `rabbitmq_handle_error_mode` — RabbitMQ エンジンにおけるエラー処理方法。指定可能な値: default（メッセージのパースに失敗した場合、例外をスローする）、stream（例外メッセージと生のメッセージを仮想カラム `_error` および `_raw_message` に保存する）、dead_letter_queue（エラー関連データを system.dead_letter_queue に保存する）。

  * [ ] SSL connection:

`rabbitmq_secure = 1` か、接続アドレス内で `amqps` を使用します: `rabbitmq_address = 'amqps://guest:guest@localhost/vhost'`。
使用しているライブラリのデフォルトの挙動は、確立された TLS 接続の安全性が十分かどうかを検証しないことです。証明書が期限切れ、自署名、不足、あるいは無効であっても、接続は単に許可されます。証明書のより厳密なチェックは、将来実装される可能性があります。

また、RabbitMQ 関連の設定と一緒にフォーマット設定も追加できます。

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

追加の設定：

```xml
 <rabbitmq>
    <vhost>clickhouse</vhost>
 </rabbitmq>
```


## Description {#description}

`SELECT`はメッセージの読み取りには特に有用ではありません(デバッグを除く)。各メッセージは一度しか読み取ることができないためです。[マテリアライズドビュー](../../../sql-reference/statements/create/view.md)を使用してリアルタイム処理を行う方が実用的です。これを行うには:

1.  エンジンを使用してRabbitMQコンシューマーを作成し、それをデータストリームとして扱います。
2.  必要な構造のテーブルを作成します。
3.  エンジンからデータを変換し、事前に作成したテーブルに格納するマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに接続されると、バックグラウンドでデータの収集が開始されます。これにより、RabbitMQからメッセージを継続的に受信し、`SELECT`を使用して必要な形式に変換できます。
1つのRabbitMQテーブルには、任意の数のマテリアライズドビューを設定できます。

データは`rabbitmq_exchange_type`と指定された`rabbitmq_routing_key_list`に基づいて振り分けることができます。
テーブルごとに設定できるエクスチェンジは1つまでです。1つのエクスチェンジは複数のテーブル間で共有でき、複数のテーブルへの同時ルーティングが可能になります。

エクスチェンジタイプのオプション:

- `direct` - ルーティングはキーの完全一致に基づきます。テーブルキーリストの例: `key1,key2,key3,key4,key5`、メッセージキーはこれらのいずれかと一致できます。
- `fanout` - キーに関係なく、すべてのテーブル(エクスチェンジ名が同じ場合)にルーティングします。
- `topic` - ルーティングはドット区切りのキーを使用したパターンに基づきます。例: `*.logs`、`records.*.*.2020`、`*.2018,*.2019,*.2020`。
- `headers` - ルーティングは`x-match=all`または`x-match=any`の設定による`key=value`の一致に基づきます。テーブルキーリストの例: `x-match=all,format=logs,type=report,year=2020`。
- `consistent_hash` - データはすべてのバインドされたテーブル(エクスチェンジ名が同じ場合)間で均等に分散されます。このエクスチェンジタイプはRabbitMQプラグインで有効化する必要があります: `rabbitmq-plugins enable rabbitmq_consistent_hash_exchange`。

`rabbitmq_queue_base`設定は以下のケースで使用できます:

- 異なるテーブルがキューを共有できるようにし、同じキューに複数のコンシューマーを登録することで、パフォーマンスを向上させます。`rabbitmq_num_consumers`および/または`rabbitmq_num_queues`設定を使用する場合、これらのパラメータが同じであればキューの完全一致が実現されます。
- すべてのメッセージが正常に消費されなかった場合に、特定の永続キューからの読み取りを復元できるようにします。特定のキューから消費を再開するには、`rabbitmq_queue_base`設定にその名前を設定し、`rabbitmq_num_consumers`と`rabbitmq_num_queues`は指定しません(デフォルトは1)。特定のテーブルに対して宣言されたすべてのキューから消費を再開するには、同じ設定を指定します: `rabbitmq_queue_base`、`rabbitmq_num_consumers`、`rabbitmq_num_queues`。デフォルトでは、キュー名はテーブルごとに一意になります。
- キューは永続的として宣言され、自動削除されないため、再利用できます。(RabbitMQ CLIツールを使用して削除できます。)

パフォーマンスを向上させるため、受信したメッセージは[max_insert_block_size](/operations/settings/settings#max_insert_block_size)のサイズのブロックにグループ化されます。[stream_flush_interval_ms](../../../operations/server-configuration-parameters/settings.md)ミリ秒以内にブロックが形成されなかった場合、ブロックの完全性に関係なくデータはテーブルにフラッシュされます。

`rabbitmq_num_consumers`および/または`rabbitmq_num_queues`設定が`rabbitmq_exchange_type`と共に指定されている場合:

- `rabbitmq-consistent-hash-exchange`プラグインを有効化する必要があります。
- 公開されたメッセージの`message_id`プロパティを指定する必要があります(各メッセージ/バッチごとに一意)。

挿入クエリには、公開された各メッセージに追加されるメッセージメタデータがあります: `messageID`と`republished`フラグ(複数回公開された場合はtrue) - メッセージヘッダー経由でアクセスできます。

挿入とマテリアライズドビューに同じテーブルを使用しないでください。

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


## 仮想カラム {#virtual-columns}

- `_exchange_name` - RabbitMQエクスチェンジ名。データ型: `String`。
- `_channel_id` - メッセージを受信したコンシューマーが宣言されたChannelID。データ型: `String`。
- `_delivery_tag` - 受信メッセージのDeliveryTag。チャネルごとにスコープされます。データ型: `UInt64`。
- `_redelivered` - メッセージの`redelivered`フラグ。データ型: `UInt8`。
- `_message_id` - 受信メッセージのmessageID。メッセージ公開時に設定されていた場合は空でない値となります。データ型: `String`。
- `_timestamp` - 受信メッセージのタイムスタンプ。メッセージ公開時に設定されていた場合は空でない値となります。データ型: `UInt64`。

`rabbitmq_handle_error_mode='stream'`の場合の追加仮想カラム:

- `_raw_message` - 正常に解析できなかった生メッセージ。データ型: `Nullable(String)`。
- `_error` - 解析失敗時に発生した例外メッセージ。データ型: `Nullable(String)`。

注意: `_raw_message`と`_error`仮想カラムは、解析中に例外が発生した場合にのみ値が設定されます。メッセージが正常に解析された場合は常に`NULL`です。


## 注意事項 {#caveats}

テーブル定義で[デフォルトカラム式](/sql-reference/statements/create/table.md/#default_values)（`DEFAULT`、`MATERIALIZED`、`ALIAS`など）を指定した場合でも、これらは無視されます。代わりに、各カラムはそれぞれのデータ型に応じたデフォルト値で埋められます。


## データフォーマットのサポート {#data-formats-support}

RabbitMQエンジンは、ClickHouseでサポートされているすべての[フォーマット](../../../interfaces/formats.md)に対応しています。
1つのRabbitMQメッセージに含まれる行数は、フォーマットが行ベースかブロックベースかによって異なります:

- 行ベースフォーマットの場合、1つのRabbitMQメッセージに含まれる行数は`rabbitmq_max_rows_per_message`設定で制御できます。
- ブロックベースフォーマットの場合、ブロックをより小さな部分に分割することはできませんが、1つのブロックに含まれる行数は汎用設定[max_block_size](/operations/settings/settings#max_block_size)で制御できます。

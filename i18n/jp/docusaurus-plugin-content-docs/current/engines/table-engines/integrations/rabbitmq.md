---
slug: /engines/table-engines/integrations/rabbitmq
sidebar_position: 170
sidebar_label: RabbitMQ
title: "RabbitMQエンジン"
description: "このエンジンはClickHouseとRabbitMQの統合を可能にします。"
---


# RabbitMQエンジン

このエンジンはClickHouseと [RabbitMQ](https://www.rabbitmq.com) の統合を可能にします。

`RabbitMQ`を使用すると：

- データフローの発行または購読が可能になります。
- ストリームが利用可能になると即時に処理が行えます。

## テーブルの作成 {#creating-a-table}

``` sql
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

必須パラメータ：

- `rabbitmq_host_port` – host:port （例えば、`localhost:5672`）。
- `rabbitmq_exchange_name` – RabbitMQのエクスチェンジ名。
- `rabbitmq_format` – メッセージフォーマット。SQLの `FORMAT` 関数と同じ表記を使用します（例： `JSONEachRow`）。詳細については [Formats](../../../interfaces/formats.md) セクションを参照してください。

オプションのパラメータ：

- `rabbitmq_exchange_type` – RabbitMQエクスチェンジのタイプ： `direct`, `fanout`, `topic`, `headers`, `consistent_hash`。デフォルト： `fanout`。
- `rabbitmq_routing_key_list` – カンマ区切りのルーティングキーのリスト。
- `rabbitmq_schema` – フォーマットがスキーマ定義を必要とする場合に使用するパラメータ。例えば、[Cap'n Proto](https://capnproto.org/) はスキーマファイルのパスとルートの `schema.capnp:Message` オブジェクトの名前が必要です。
- `rabbitmq_num_consumers` – テーブルごとの消費者の数。1つの消費者のスループットが不十分な場合は、より多くの消費者を指定してください。デフォルト： `1`
- `rabbitmq_num_queues` – キューの総数。この数を増やすことでパフォーマンスが大幅に向上する可能性があります。デフォルト： `1`。
- `rabbitmq_queue_base` - キュー名のヒントを指定します。この設定の利用ケースは以下に記述されています。
- `rabbitmq_deadletter_exchange` - [デッドレター交換](https://www.rabbitmq.com/dlx.html) の名前を指定します。この交換名の別のテーブルを作成し、メッセージがデッドレター交換に再発行された場合にメッセージを収集できます。デフォルトではデッドレター交換は指定されていません。
- `rabbitmq_persistent` - 1（true）に設定すると、挿入クエリの配信モードが2に設定され（メッセージを「永続的」としてマークします）。デフォルト： `0`。
- `rabbitmq_skip_broken_messages` – スキーマと互換性がないメッセージに対するRabbitMQメッセージパーサの許容度。 `rabbitmq_skip_broken_messages = N` の場合、エンジンはパースできない *N* のRabbitMQメッセージ（メッセージはデータの行と等しい）をスキップします。デフォルト： `0`。
- `rabbitmq_max_block_size` - RabbitMQからデータをフラッシュする前に収集される行の数。デフォルト：[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `rabbitmq_flush_interval_ms` - RabbitMQからデータをフラッシュするタイムアウト。デフォルト：[stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `rabbitmq_queue_settings_list` – キュー作成時にRabbitMQ設定を行うための設定を提供します。利用可能な設定： `x-max-length`, `x-max-length-bytes`, `x-message-ttl`, `x-expires`, `x-priority`, `x-max-priority`, `x-overflow`, `x-dead-letter-exchange`, `x-queue-type`。キューの `durable` 設定は自動的に有効になります。
- `rabbitmq_address` - 接続用のアドレス。この設定のいずれかまたは `rabbitmq_host_port` を使用します。
- `rabbitmq_vhost` - RabbitMQのvhost。デフォルト： `'\'`。
- `rabbitmq_queue_consume` - ユーザー定義のキューを使用し、RabbitMQの設定（エクスチェンジ、キュー、バインディングの宣言）を行わない。デフォルト： `false`。
- `rabbitmq_username` - RabbitMQのユーザー名。
- `rabbitmq_password` - RabbitMQのパスワード。
- `reject_unhandled_messages` - エラーが発生した場合にメッセージを拒否します（RabbitMQの負の確認を送信）。この設定は `rabbitmq_queue_settings_list` に `x-dead-letter-exchange` が定義されている場合、自動的に有効になります。
- `rabbitmq_commit_on_select` - SELECTクエリが実行されたときにメッセージをコミットします。デフォルト： `false`。
- `rabbitmq_max_rows_per_message` — 行ベースのフォーマット用に1つのRabbitMQメッセージに書き込まれる最大行数。デフォルト： `1`。
- `rabbitmq_empty_queue_backoff_start` — RabbitMQキューが空のときに再スケジュールするためのバックオフの開始点。
- `rabbitmq_empty_queue_backoff_end` — RabbitMQキューが空のときに再スケジュールするためのバックオフの終了点。
- `rabbitmq_handle_error_mode` — RabbitMQエンジンのエラー処理方法。可能な値：default（メッセージのパースに失敗した場合は例外がスローされる）、stream（例外メッセージと生のメッセージが仮想カラム `_error` と `_raw_message` に保存される）。

* [ ] SSL接続：

`rabbitmq_secure = 1`または接続アドレスに`amqps`を使用します：`rabbitmq_address = 'amqps://guest:guest@localhost/vhost'`。  
使用されるライブラリのデフォルトの動作は、作成されたTLS接続が十分に安全かどうかをチェックしないことです。証明書が期限切れの場合、自己署名された場合、存在しない場合、または無効な場合でも、接続は単純に許可されます。証明書のより厳しいチェックは将来的に実装される可能性があります。

また、RabbitMQ関連の設定に加えてフォーマット設定を追加することもできます。

例：

``` sql
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

RabbitMQサーバーの設定はClickHouseの設定ファイルを使用して追加する必要があります。

必須設定：

``` xml
 <rabbitmq>
    <username>root</username>
    <password>clickhouse</password>
 </rabbitmq>
```

追加設定：

``` xml
 <rabbitmq>
    <vhost>clickhouse</vhost>
 </rabbitmq>
```

## 説明 {#description}

`SELECT` はメッセージを読み取るには特に役に立ちません（デバッグを除いて）、なぜなら各メッセージは一度だけ読まれるからです。実際には、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md) を使用してリアルタイムスレッドを作成する方が便利です。これを行うには:

1. エンジンを使用してRabbitMQ消費者を作成し、それをデータストリームと見なします。
2. 必要な構造を持つテーブルを作成します。
3. エンジンからデータを変換し、先に作成したテーブルに入れるマテリアライズドビューを作成します。

`MATERIALIZED VIEW` がエンジンに参加すると、バックグラウンドでデータを収集し始めます。これにより、RabbitMQからメッセージを継続的に受け取り、`SELECT`を使用して要求された形式に変換することができます。  
1つのRabbitMQテーブルには、好きなだけマテリアライズドビューを持つことができます。

データは `rabbitmq_exchange_type` と指定された `rabbitmq_routing_key_list` に基づいてチャネルされる可能性があります。一つのテーブルにつき一つのエクスチェンジしか存在できません。一つのエクスチェンジは複数のテーブルで共有できるため、同時に複数のテーブルにルーティングが可能です。

エクスチェンジタイプのオプション：

- `direct` - キーの完全一致に基づくルーティング。例：テーブルキーリスト：`key1,key2,key3,key4,key5`、メッセージキーはそれらのいずれかと等しいことができます。
- `fanout` - キーに関係なく、すべてのテーブル（エクスチェンジ名が同じ）にルーティングします。
- `topic` - ドットで区切られたキーのパターンに基づくルーティング。例：`*.logs`, `records.*.*.2020`, `*.2018,*.2019,*.2020`。
- `headers` - `key=value` マッチに基づくルーティング。設定 `x-match=all` または `x-match=any` を使用します。例：テーブルキーリスト：`x-match=all,format=logs,type=report,year=2020`。
- `consistent_hash` - データがすべてのバウンドテーブル（エクスチェンジ名が同じ）間で均等に分配されます。このエクスチェンジタイプはRabbitMQプラグインで有効にする必要があります： `rabbitmq-plugins enable rabbitmq_consistent_hash_exchange`。

`rabbitmq_queue_base`の設定は以下のケースで使用できます：

- 異なるテーブルがキューを共有できるようにし、同じキューに対して複数の消費者を登録できるため、パフォーマンスが向上します。 `rabbitmq_num_consumers` および/または `rabbitmq_num_queues` の設定を使用する場合、これらのパラメーターが同じであれば正確なキューの一致が達成されます。
- すべてのメッセージが正常に消費されなかった場合に、特定の耐久性のあるキューからの読み取りを復元できます。特定のキューからの消費を再開するには、その名前を `rabbitmq_queue_base` 設定に設定し、 `rabbitmq_num_consumers` および `rabbitmq_num_queues` を指定しないでください（デフォルトは1）。特定のテーブルのために宣言されたすべてのキューからの消費を再開するには、単に同じ設定を指定します： `rabbitmq_queue_base`, `rabbitmq_num_consumers`, `rabbitmq_num_queues`。デフォルトでは、キュー名はテーブルに対して一意になります。
- キューが耐久性があり、自動削除されないため、再利用できます。（RabbitMQ CLIツールのいずれかを使用して削除できます。）

パフォーマンスを向上させるために、受信したメッセージは [max_insert_block_size](/operations/settings/settings#max_insert_block_size) のサイズのブロックにグループ化されます。ブロックが [stream_flush_interval_ms](../../../operations/server-configuration-parameters/settings.md) ミリ秒以内に形成されなかった場合、データはブロックの完全性に関係なくテーブルにフラッシュされます。

`rabbitmq_num_consumers` および/または `rabbitmq_num_queues` の設定が `rabbitmq_exchange_type` とともに指定された場合：

- `rabbitmq-consistent-hash-exchange` プラグインは有効にする必要があります。
- 公開されたメッセージの `message_id` プロパティを指定する必要があります（メッセージ/バッチごとに一意）。

挿入クエリには各公開メッセージに追加されたメッセージメタデータがあります： `messageID` と `republished` フラグ（再発行された場合はtrue） - メッセージヘッダーを介してアクセスできます。

挿入とマテリアライズドビューに同じテーブルを使用しないでください。

例：

``` sql
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

- `_exchange_name` - RabbitMQエクスチェンジ名。データタイプ： `String`。
- `_channel_id` - メッセージを受信した消費者が宣言されたChannelID。データタイプ： `String`。
- `_delivery_tag` - 受け取ったメッセージのDeliveryTag。チャネルごとにスコープ。データタイプ： `UInt64`。
- `_redelivered` - メッセージの `redelivered` フラグ。データタイプ： `UInt8`。
- `_message_id` - 受信したメッセージのmessageID；メッセージが発行されたときに設定されていれば非空。データタイプ： `String`。
- `_timestamp` - 受信したメッセージのタイムスタンプ；メッセージが発行されたときに設定されていれば非空。データタイプ： `UInt64`。

`kafka_handle_error_mode='stream'` の場合の追加仮想カラム：

- `_raw_message` - 正しくパースできなかった生のメッセージ。データタイプ： `Nullable(String)`。
- `_error` - パース中に発生した例外メッセージ。データタイプ： `Nullable(String)`。

注意： `_raw_message` と `_error` の仮想カラムはパース中に例外が発生した場合のみ填充され、メッセージが正常にパースされた場合は常に `NULL` です。

## 注意事項 {#caveats}

テーブル定義に [デフォルトカラム式](/sql-reference/statements/create/table.md/#default_values)（ `DEFAULT`, `MATERIALIZED`, `ALIAS` など）を指定することはできるが、これらは無視されます。その代わり、カラムはそれぞれの型に対するデフォルト値で填充されます。

## サポートされるデータフォーマット {#data-formats-support}

RabbitMQエンジンはClickHouseでサポートされているすべての [フォーマット](../../../interfaces/formats.md) をサポートしています。  
1つのRabbitMQメッセージにおける行数は、フォーマットが行ベースかブロックベースかによって異なります：

- 行ベースのフォーマットの場合、1つのRabbitMQメッセージに含まれる行数は `rabbitmq_max_rows_per_message` を設定することで制御できます。
- ブロックベースのフォーマットの場合、ブロックを小さな部分に分割することはできませんが、1つのブロックに含まれる行数は一般設定 [max_block_size](/operations/settings/settings#max_block_size) で制御できます。

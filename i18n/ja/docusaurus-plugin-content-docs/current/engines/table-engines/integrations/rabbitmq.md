---
slug: /engines/table-engines/integrations/rabbitmq
sidebar_position: 170
sidebar_label: RabbitMQ
title: "RabbitMQエンジン"
description: "このエンジンは、ClickHouseとRabbitMQを統合することを可能にします。"
---

# RabbitMQエンジン

このエンジンは、ClickHouseと[RabbitMQ](https://www.rabbitmq.com)を統合することを可能にします。

`RabbitMQ`では次のことができます：

- データフローを公開または購読する。
- ストリームが利用可能になったときに処理する。

## テーブルの作成 {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = RabbitMQ SETTINGS
    rabbitmq_host_port = 'host:port' [または rabbitmq_address = 'amqp(s)://guest:guest@localhost/vhost'],
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

- `rabbitmq_host_port` – host:port（例：`localhost:5672`）。
- `rabbitmq_exchange_name` – RabbitMQのエクスチェンジ名。
- `rabbitmq_format` – メッセージフォーマット。SQLの`FORMAT`関数と同様の表記法を使用します。例えば、`JSONEachRow`。詳細については、[フォーマット](../../../interfaces/formats.md)セクションを参照してください。

オプションのパラメータ：

- `rabbitmq_exchange_type` – RabbitMQのエクスチェンジのタイプ：`direct`, `fanout`, `topic`, `headers`, `consistent_hash`。デフォルト：`fanout`。
- `rabbitmq_routing_key_list` – カンマ区切りのルーティングキーのリスト。
- `rabbitmq_schema` – フォーマットがスキーマ定義を必要とする場合に使用しなければならないパラメータ。例えば、[Cap'n Proto](https://capnproto.org/)はスキーマファイルのパスとルート`scehma.capnp:Message`オブジェクトの名前を要求します。
- `rabbitmq_num_consumers` – テーブルごとの消費者数。1つの消費者のスループットが不足している場合は、より多くの消費者を指定します。デフォルト：`1`。
- `rabbitmq_num_queues` – 合計キューの数。この数を増やすことでパフォーマンスが大幅に向上する可能性があります。デフォルト：`1`。
- `rabbitmq_queue_base` - キュー名のためのヒントを指定します。この設定の使用事例は以下で説明されています。
- `rabbitmq_deadletter_exchange` - [デッドレターエクスチェンジ](https://www.rabbitmq.com/dlx.html)のための名前を指定します。このエクスチェンジ名で別のテーブルを作成し、デッドレターエクスチェンジに再発行された場合のメッセージを収集できます。デフォルトではデッドレターエクスチェンジは指定されていません。
- `rabbitmq_persistent` - 1（真）に設定された場合、挿入クエリの配信モードは2に設定されます（メッセージを「永続的」としてマークします）。デフォルト：`0`。
- `rabbitmq_skip_broken_messages` – スキーマ不適合メッセージに対するRabbitMQメッセージパーサーのブロックごとの耐性。`rabbitmq_skip_broken_messages = N`の場合、エンジンは解析できない*N*のRabbitMQメッセージをスキップします（メッセージはデータの行に等しい）。デフォルト：`0`。
- `rabbitmq_max_block_size` - RabbitMQからデータをフラッシュする前に収集する行の数。デフォルト：[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `rabbitmq_flush_interval_ms` - RabbitMQからデータをフラッシュするためのタイムアウト。デフォルト：[stream_flush_interval_ms](../../../operations/settings/settings.md#stream-flush-interval-ms)。
- `rabbitmq_queue_settings_list` - キューを作成する際にRabbitMQの設定を設定することを可能にします。利用可能な設定：`x-max-length`, `x-max-length-bytes`, `x-message-ttl`, `x-expires`, `x-priority`, `x-max-priority`, `x-overflow`, `x-dead-letter-exchange`, `x-queue-type`。`durable`設定はキューに対して自動的に有効になります。
- `rabbitmq_address` - 接続のためのアドレス。この設定または`rabbitmq_host_port`のいずれかを使用します。
- `rabbitmq_vhost` - RabbitMQのvhost。デフォルト：`'/'`。
- `rabbitmq_queue_consume` - ユーザー定義のキューを使用し、RabbitMQのセットアップ（エクスチェンジ、キュー、バインディングの宣言）を行わない。デフォルト：`false`。
- `rabbitmq_username` - RabbitMQのユーザー名。
- `rabbitmq_password` - RabbitMQのパスワード。
- `reject_unhandled_messages` - エラーが発生した場合にメッセージを拒否する（RabbitMQに負の確認を送信します）。この設定は、`rabbitmq_queue_settings_list`に`x-dead-letter-exchange`が定義されている場合に自動的に有効になります。
- `rabbitmq_commit_on_select` - SELECTクエリが実行されたときにメッセージをコミットします。デフォルト：`false`。
- `rabbitmq_max_rows_per_message` — 行ベースフォーマットの1つのRabbitMQメッセージに書き込まれる最大行数。デフォルト：`1`。
- `rabbitmq_empty_queue_backoff_start` — RabbitMQキューが空のときに読み取りを再スケジュールするための開始バックオフポイント。
- `rabbitmq_empty_queue_backoff_end` — RabbitMQキューが空のときに読み取りを再スケジュールするための終了バックオフポイント。
- `rabbitmq_handle_error_mode` — RabbitMQエンジンのエラーを処理する方法。可能な値：デフォルト（メッセージの解析に失敗した場合は例外がスローされる）、ストリーム（例外メッセージと生メッセージが仮想カラム`_error`と`_raw_message`に保存される）。

* [ ] SSL接続：

`rabbitmq_secure = 1`または接続アドレスに`amqps`を使用します: `rabbitmq_address = 'amqps://guest:guest@localhost/vhost'`。
使用されるライブラリのデフォルトの動作は、作成されたTLS接続が十分に安全であるかどうかを確認しません。証明書が期限切れ、自署、欠落、または無効である場合：接続は単純に許可されます。将来的には、証明書のより厳格なチェックが実装される可能性があります。

また、RabbitMQ関連の設定と共にフォーマット設定を追加することができます。

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

RabbitMQサーバーの設定は、ClickHouseの設定ファイルを使用して追加する必要があります。

必要な設定：

``` xml
 <rabbitmq>
    <username>root</username>
    <password>clickhouse</password>
 </rabbitmq>
```

追加の設定：

``` xml
 <rabbitmq>
    <vhost>clickhouse</vhost>
 </rabbitmq>
```

## 説明 {#description}

`SELECT`はメッセージを読み取るのには特に便利ではありません（デバッグを除いて）、なぜなら各メッセージは一度しか読み取ることができないからです。リアルタイムスレッドを作成する方が実用的です。[マテリアライズドビュー](../../../sql-reference/statements/create/view.md)を使用してこれを行います。これを行うには：

1. エンジンを使用してRabbitMQの消費者を作成し、それをデータストリームと見なします。
2. 希望の構造を持つテーブルを作成します。
3. エンジンからデータを変換し、以前に作成されたテーブルに置くマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに参加すると、バックグラウンドでデータを収集し始めます。これにより、RabbitMQからメッセージを継続的に受信し、それを`SELECT`を使用して必要なフォーマットに変換することができます。
1つのRabbitMQテーブルには好きなだけマテリアライズドビューを持つことができます。

データは`rabbitmq_exchange_type`と指定された`rabbitmq_routing_key_list`に基づいてチャネル化することができます。
1つのテーブルあたりエクスチェンジは1つだけである必要があります。1つのエクスチェンジは複数のテーブル間で共有することができ、同時に複数のテーブルにルーティングすることを可能にします。

エクスチェンジタイプのオプション：

- `direct` - キーの正確な一致に基づいたルーティング。例：テーブルキーリスト：`key1,key2,key3,key4,key5`、メッセージキーはそのいずれかに等しいことができます。
- `fanout` - キーに関係なくすべてのテーブル（エクスチェンジ名が同じ）にルーティングします。
- `topic` - ドット区切りのキーによるパターンに基づいたルーティング。例：`*.logs`, `records.*.*.2020`, `*.2018,*.2019,*.2020`。
- `headers` - `key=value`の一致に基づいたルーティングで、設定`x-match=all`または`x-match=any`を使用します。例：テーブルキーリスト：`x-match=all,format=logs,type=report,year=2020`。
- `consistent_hash` - データはすべてのバウンドテーブル（エクスチェンジ名が同じ）に均等に分配されます。このエクスチェンジタイプは、RabbitMQプラグイン`rabbitmq-plugins enable rabbitmq_consistent_hash_exchange`を有効にする必要があります。

`rabbitmq_queue_base`を設定することで以下の事例に利用可能です：

- 異なるテーブルがキューを共有できるようにし、同じキューに複数の消費者を登録できるようにすることで、パフォーマンスが向上します。`rabbitmq_num_consumers`および/または`rabbitmq_num_queues`設定を使用する場合、これらのパラメータが一致する場合にキューが正確に一致します。
- すべてのメッセージが正常に消費されていない場合に、特定の耐久性のあるキューからの読み取りを復元できるようにします。特定のキューからの消費を再開するには、その名前を`rabbitmq_queue_base`設定に設定し、`rabbitmq_num_consumers`および`rabbitmq_num_queues`を指定しないでください（デフォルトは1）。特定のテーブルに宣言されたすべてのキューからの消費を再開するには、同じ設定：`rabbitmq_queue_base`、`rabbitmq_num_consumers`、`rabbitmq_num_queues`を指定します。デフォルトでは、キュー名はテーブルに対して一意のものになります。
- キューが耐久性があり、自動削除されないため、それらを再利用することができます（RabbitMQのCLIツールのいずれかを介して削除できます）。

パフォーマンスを向上させるために、受信したメッセージは[マックス挿入ブロックサイズ](../../../operations/server-configuration-parameters/settings.md#settings-max_insert_block_size)のサイズのブロックにグループ化されます。もしブロックが[stream_flush_interval_ms](../../../operations/server-configuration-parameters/settings.md)ミリ秒以内に形成されなかった場合、ブロックの完全性に関係なくデータはテーブルにフラッシュされます。

`rabbitmq_num_consumers`および/または`rabbitmq_num_queues`の設定が`rabbitmq_exchange_type`と一緒に指定されている場合：

- `rabbitmq-consistent-hash-exchange`プラグインを有効にする必要があります。
- 公開されたメッセージの`message_id`プロパティを指定する必要があります（メッセージ/バッチごとに一意です）。

挿入クエリには、公開された各メッセージのメタデータが含まれます：`messageID`および`republished`フラグ（もう一度公開された場合はtrue） - メッセージヘッダーを介してアクセスできます。

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

- `_exchange_name` - RabbitMQエクスチェンジ名。データ型：`String`。
- `_channel_id` - メッセージを受信したので、消費者が宣言されたチャンネルID。データ型：`String`。
- `_delivery_tag` - 受信メッセージのデリバリータグ。チャネルごとにスコープ。データ型：`UInt64`。
- `_redelivered` - メッセージの`redelivered`フラグ。データ型：`UInt8`。
- `_message_id` - 受信メッセージのmessageID；公開されたときに設定された場合は空でない。データ型：`String`。
- `_timestamp` - 受信メッセージのタイムスタンプ；公開されたときに設定された場合は空でない。データ型：`UInt64`。

`kafka_handle_error_mode='stream'`のときの追加の仮想カラム：

- `_raw_message` - 正常に解析できなかった生メッセージ。データ型：`Nullable(String)`。
- `_error` - 解析に失敗した場合に発生した例外メッセージ。データ型：`Nullable(String)`。

注意：`_raw_message`および`_error`の仮想カラムは、解析中に例外が発生した場合にのみ填充され、メッセージが正常に解析された場合は常にNULLのままです。

## 注意事項 {#caveats}

[デフォルトカラム式](/sql-reference/statements/create/table.md/#default_values)（`DEFAULT`、`MATERIALIZED`、`ALIAS`など）をテーブル定義に指定することができますが、これらは無視されます。その代わり、カラムにはその型に対するそれぞれのデフォルト値が填充されます。

## データフォーマットのサポート {#data-formats-support}

RabbitMQエンジンは、ClickHouseでサポートされているすべての[フォーマット](../../../interfaces/formats.md)をサポートしています。
1つのRabbitMQメッセージの行数は、フォーマットが行ベースかブロックベースかによって異なります：

- 行ベースのフォーマットの場合、1つのRabbitMQメッセージに含まれる行数は、`rabbitmq_max_rows_per_message`を設定することで制御できます。
- ブロックベースのフォーマットでは、ブロックを小さな部分に分割できませんが、1つのブロックに含まれる行数は一般的な設定[ max_block_size](../../../operations/settings/settings.md#setting-max_block_size)で制御できます。

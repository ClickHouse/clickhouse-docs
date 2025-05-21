description: 'このエンジンは ClickHouse と RabbitMQ を統合することを可能にします。'
sidebar_label: 'RabbitMQ'
sidebar_position: 170
slug: /engines/table-engines/integrations/rabbitmq
title: 'RabbitMQ エンジン'
```


# RabbitMQ エンジン

このエンジンは [RabbitMQ](https://www.rabbitmq.com) と ClickHouse を統合することを可能にします。

`RabbitMQ` を使って:

- データフローに公開または購読することができます。
- ストリームを利用可能になった時点で処理することができます。

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

必要なパラメータ:

- `rabbitmq_host_port` – host:port (例: `localhost:5672`)。
- `rabbitmq_exchange_name` – RabbitMQ エクスチェンジ名。
- `rabbitmq_format` – メッセージフォーマット。SQL `FORMAT` 関数と同じ表記法を使用します。例: `JSONEachRow`。詳細については [Formats](../../../interfaces/formats.md) セクションを参照してください。

オプションのパラメータ:

- `rabbitmq_exchange_type` – RabbitMQ エクスチェンジのタイプ: `direct`, `fanout`, `topic`, `headers`, `consistent_hash`。デフォルト: `fanout`。
- `rabbitmq_routing_key_list` – カンマ区切りのルーティングキーのリスト。
- `rabbitmq_schema` – フォーマットがスキーマ定義を必要とする場合に使用しなければならないパラメータ。例: [Cap'n Proto](https://capnproto.org/) はスキーマファイルのパスとルート `schema.capnp:Message` オブジェクトの名前を必要とします。
- `rabbitmq_num_consumers` – テーブルごとのコンシューマの数。スループットが不足している場合は、より多くのコンシューマを指定してください。デフォルト: `1`
- `rabbitmq_num_queues` – キューの総数。この数を増やすことでパフォーマンスが大幅に向上する可能性があります。デフォルト: `1`。
- `rabbitmq_queue_base` - キュー名のヒントを指定します。この設定の使用ケースは以下に示されています。
- `rabbitmq_deadletter_exchange` - [デッドレターエクスチェンジ](https://www.rabbitmq.com/dlx.html) のための名前を指定します。このエクスチェンジ名で別のテーブルを作成し、メッセージがデッドレターエクスチェンジに再公開された場合に収集できます。デフォルトではデッドレターエクスチェンジは指定されていません。
- `rabbitmq_persistent` - 1 (true) に設定されている場合、挿入クエリの配信モードは2に設定されます (メッセージは 'persistent' としてマークされます)。デフォルト: `0`。
- `rabbitmq_skip_broken_messages` – スキーマ不整合のメッセージに対する RabbitMQ メッセージパーサの耐性。`rabbitmq_skip_broken_messages = N` の場合、エンジンは解析できない *N* の RabbitMQ メッセージをスキップします (メッセージはデータの1行に相当します)。デフォルト: `0`。
- `rabbitmq_max_block_size` - RabbitMQからデータをフラッシュする前に収集される行の数。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `rabbitmq_flush_interval_ms` - RabbitMQ からのデータフラッシュのタイムアウト。デフォルト: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `rabbitmq_queue_settings_list` - キュー作成時に RabbitMQ 設定を設定できます。使用可能な設定: `x-max-length`, `x-max-length-bytes`, `x-message-ttl`, `x-expires`, `x-priority`, `x-max-priority`, `x-overflow`, `x-dead-letter-exchange`, `x-queue-type`。`durable` 設定はキューに自動的に有効になります。
- `rabbitmq_address` - 接続のためのアドレス。この設定または `rabbitmq_host_port` を使用してください。
- `rabbitmq_vhost` - RabbitMQ vhost。デフォルト: `'\'`。
- `rabbitmq_queue_consume` - ユーザー定義のキューを使用し、RabbitMQ のセットアップ（エクスチェンジ、キュー、バインディングの宣言）を行わない。デフォルト: `false`。
- `rabbitmq_username` - RabbitMQ ユーザー名。
- `rabbitmq_password` - RabbitMQ パスワード。
- `reject_unhandled_messages` - エラーが発生した場合、メッセージを拒否します (RabbitMQ への否定的確認を送信)。この設定は `rabbitmq_queue_settings_list` に `x-dead-letter-exchange` が定義されている場合、自動的に有効になります。
- `rabbitmq_commit_on_select` - SELECT クエリを実行した際にメッセージをコミットします。デフォルト: `false`。
- `rabbitmq_max_rows_per_message` — 行ベースのフォーマットに対して1つの RabbitMQ メッセージ内で書き込まれる最大行数。デフォルト: `1`。
- `rabbitmq_empty_queue_backoff_start` — RabbitMQ キューが空のときに読み取りを再スケジュールする開始バックオフポイント。
- `rabbitmq_empty_queue_backoff_end` — RabbitMQ キューが空のときに読み取りを再スケジュールする終了バックオフポイント。
- `rabbitmq_handle_error_mode` — RabbitMQ エンジンのエラー処理方法。可能な値: default (メッセージの解析に失敗した場合に例外がスローされます)、stream (例外メッセージと生のメッセージは仮想カラム `_error` と `_raw_message` に保存されます)。

  * [ ] SSL 接続:

`rabbitmq_secure = 1` または接続アドレスに `amqps` を使用します: `rabbitmq_address = 'amqps://guest:guest@localhost/vhost'`。
使用されているライブラリのデフォルトの動作は、作成された TLS 接続が十分に安全であるかどうかを確認しません。証明書が失効している、自署である、欠落している、または無効である場合、接続は許可されます。証明書のより厳格なチェックは将来的に実装される可能性があります。

また、RabbitMQ に関連する設定と共にフォーマット設定も追加できます。

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

RabbitMQ サーバー設定は ClickHouse 設定ファイルを使用して追加する必要があります。

必要な設定:

```xml
 <rabbitmq>
    <username>root</username>
    <password>clickhouse</password>
 </rabbitmq>
```

追加の設定:

```xml
 <rabbitmq>
    <vhost>clickhouse</vhost>
 </rabbitmq>
```

## 説明 {#description}

`SELECT` はメッセージの読み取りには特に便利ではありません (デバッグを除く)、なぜなら各メッセージは一度しか読み取ることができないからです。リアルタイムスレッドを作成するためには、[materialized views](../../../sql-reference/statements/create/view.md) を使用する方が実用的です。これを行う方法：

1.  エンジンを使用して RabbitMQ コンシューマを作成し、それをデータストリームと見なします。
2.  希望の構造を持つテーブルを作成します。
3.  エンジンからデータを変換し、以前に作成したテーブルに格納するマテリアライズドビューを作成します。

`MATERIALIZED VIEW` がエンジンに接続すると、バックグラウンドでデータの収集を開始します。これにより、RabbitMQ からメッセージを継続的に受信し、`SELECT` を使用して必要なフォーマットに変換することができます。
1 つの RabbitMQ テーブルは、任意の数のマテリアライズドビューを持つことができます。

データは `rabbitmq_exchange_type` と指定された `rabbitmq_routing_key_list` に基づいてチャネル化されます。
テーブルごとにエクスチェンジを1つしか持つことはできません。1つのエクスチェンジを複数のテーブルで共有することができるため、同時に複数のテーブルへのルーティングを可能にします。

エクスチェンジタイプのオプション:

- `direct` - ルーティングはキーの正確な一致に基づいています。例のテーブルキーリスト: `key1,key2,key3,key4,key5`、メッセージキーはそのいずれかと等しくできます。
- `fanout` - キーに関係なく、すべてのテーブル (エクスチェンジ名が同じ) へのルーティング。
- `topic` - パターンに基づいたルーティング、ドットで区切られたキールール。例: `*.logs`, `records.*.*.2020`, `*.2018,*.2019,*.2020`。
- `headers` - `key=value` に基づいたルーティング、設定 `x-match=all` または `x-match=any` とともに。例のテーブルキーリスト: `x-match=all,format=logs,type=report,year=2020`。
- `consistent_hash` - データがすべてのバウンドテーブル (エクスチェンジ名が同じ) の間で均等に分配されます。このエクスチェンジタイプは RabbitMQ プラグイン `rabbitmq-plugins enable rabbitmq_consistent_hash_exchange` で有効にする必要があります。

`rabbitmq_queue_base` の設定は、以下のケースで使用される可能性があります：

- 異なるテーブルがキューを共有できるようにし、同じキューに対して複数のコンシューマを登録できるようにすることで、パフォーマンスが向上します。 `rabbitmq_num_consumers` および/または `rabbitmq_num_queues` の設定を使用する場合、これらのパラメータが同じである場合にキューの正確な一致が達成されます。
- すべてのメッセージが正常に消費されなかった場合に、特定の耐久キューからの読み取りを元に戻すことができるようにします。1つの特定のキューからの消費を再開するには、その名前を `rabbitmq_queue_base` 設定に設定し、`rabbitmq_num_consumers` および `rabbitmq_num_queues` を指定しないでください (デフォルトは1)。特定のテーブルに対して宣言されたすべてのキューからの消費を再開するには、同じ設定を指定します: `rabbitmq_queue_base`, `rabbitmq_num_consumers`, `rabbitmq_num_queues`。デフォルトでは、キュー名はテーブルに対してユニークになります。
- キューが耐久性として宣言され、自動削除されないように再利用します。 (RabbitMQ CLI ツールのいずれかを使用して削除できます。)

パフォーマンスを向上させるために、受信したメッセージは [max_insert_block_size](/operations/settings/settings#max_insert_block_size) のサイズのブロックにグループ化されます。ブロックが [stream_flush_interval_ms](../../../operations/server-configuration-parameters/settings.md) ミリ秒内に形成されなかった場合、ブロックの完全性に関係なくデータがテーブルにフラッシュされます。

`rabbitmq_num_consumers` および/または `rabbitmq_num_queues` の設定を `rabbitmq_exchange_type` とともに指定した場合：

- `rabbitmq-consistent-hash-exchange` プラグインを有効にしなければなりません。
- 公開されたメッセージの `message_id` プロパティを指定する必要があります (各メッセージ/バッチに対して一意)。

挿入クエリには、公開された各メッセージに対して追加されるメッセージメタデータがあります: `messageID` と `republished` フラグ (2回以上公開されている場合はtrue) - メッセージヘッダーを介してアクセスできます。

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

- `_exchange_name` - RabbitMQ エクスチェンジ名。データ型: `String`。
- `_channel_id` - メッセージを受信したコンシューマが宣言した ChannelID。データ型: `String`。
- `_delivery_tag` - 受信メッセージの DeliveryTag。チャネルごとにスコープされます。データ型: `UInt64`。
- `_redelivered` - メッセージの `redelivered` フラグ。データ型: `UInt8`。
- `_message_id` - 受信メッセージの messageID。設定されている場合は空ではありません。データ型: `String`。
- `_timestamp` - 受信メッセージのタイムスタンプ。設定されている場合は空ではありません。データ型: `UInt64`。

`kafka_handle_error_mode='stream'` の場合の追加の仮想カラム:

- `_raw_message` - 正しく解析できなかった生のメッセージ。データ型: `Nullable(String)`。
- `_error` - 解析中に発生した例外メッセージ。データ型: `Nullable(String)`。

注意: `_raw_message` および `_error` の仮想カラムは、解析中に例外が発生した場合のみ埋められ、メッセージが正常に解析された場合は常に `NULL` です。

## 注意事項 {#caveats}

[default column expressions](/sql-reference/statements/create/table.md/#default_values) (例: `DEFAULT`, `MATERIALIZED`, `ALIAS`) をテーブル定義で指定することができますが、これらは無視されます。代わりに、カラムはそれぞれの型に対するデフォルト値で満たされます。

## データフォーマットのサポート {#data-formats-support}

RabbitMQ エンジンは ClickHouse でサポートされているすべての [formats](../../../interfaces/formats.md) をサポートしています。
1つの RabbitMQ メッセージ内の行数は、フォーマットが行ベースかブロックベースかによって異なります：

- 行ベースのフォーマットの場合、1つの RabbitMQ メッセージ内の行数は `rabbitmq_max_rows_per_message` を設定することで制御できます。
- ブロックベースのフォーマットでは、ブロックを小さな部分に分割することはできませんが、1つのブロック内の行数は一般設定の [max_block_size](/operations/settings/settings#max_block_size) で制御できます。

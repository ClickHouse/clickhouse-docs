---
'description': 'このエンジンはClickHouseとRabbitMQを統合することを可能にします。'
'sidebar_label': 'RabbitMQ'
'sidebar_position': 170
'slug': '/engines/table-engines/integrations/rabbitmq'
'title': 'RabbitMQエンジン'
'doc_type': 'guide'
---


# RabbitMQエンジン

このエンジンは、ClickHouseを[RabbitMQ](https://www.rabbitmq.com)と統合することを可能にします。

`RabbitMQ`では以下を行うことができます：

- データフローに対して発行または購読する。
- ストリームが利用可能になると処理する。

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

- `rabbitmq_host_port` – host:port（例：`localhost:5672`）。
- `rabbitmq_exchange_name` – RabbitMQエクスチェンジ名。
- `rabbitmq_format` – メッセージ形式。SQLの`FORMAT`関数と同様の表記を使用します（例：`JSONEachRow`）。詳しくは、[フォーマット](../../../interfaces/formats.md)セクションを参照してください。

オプションのパラメータ：

- `rabbitmq_exchange_type` – RabbitMQエクスチェンジのタイプ：`direct`, `fanout`, `topic`, `headers`, `consistent_hash`。デフォルト：`fanout`。
- `rabbitmq_routing_key_list` – ルーティングキーのカンマ区切りリスト。
- `rabbitmq_schema` – フォーマットがスキーマ定義を必要とする場合に使用すべきパラメータ。たとえば、[Cap'n Proto](https://capnproto.org/)はスキーマファイルへのパスとルート`schema.capnp:Message`オブジェクトの名前を必要とします。
- `rabbitmq_num_consumers` – テーブルごとのコンシューマの数。一つのコンシューマのスループットが不十分な場合は、より多くのコンシューマを指定します。デフォルト：`1`
- `rabbitmq_num_queues` – キューの合計数。この数を増やすことでパフォーマンスが大幅に向上する可能性があります。デフォルト：`1`。
- `rabbitmq_queue_base` - キュー名のヒントを指定します。この設定の使用例は下記に記述されています。
- `rabbitmq_deadletter_exchange` - [デッドレターエクスチェンジ](https://www.rabbitmq.com/dlx.html)の名前を指定します。このエクスチェンジ名を持つ別のテーブルを作成し、メッセージがデッドレターエクスチェンジに再公開される場合にメッセージを収集することができます。デフォルトではデッドレターエクスチェンジは指定されていません。
- `rabbitmq_persistent` - 1（true）に設定された場合、挿入クエリの配信モードが2に設定されます（メッセージを「永続的」とマークします）。デフォルト：`0`。
- `rabbitmq_skip_broken_messages` – スキーマと互換性のないメッセージに対するRabbitMQメッセージパーサの耐性。`rabbitmq_skip_broken_messages = N`の場合、エンジンは解析できない*N*のRabbitMQメッセージをスキップします（メッセージはデータの行に等しい）。デフォルト：`0`。
- `rabbitmq_max_block_size` - RabbitMQからデータをフラッシュする前に収集される行の数。デフォルト：[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `rabbitmq_flush_interval_ms` - RabbitMQからデータをフラッシュするタイムアウト。デフォルト：[stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `rabbitmq_queue_settings_list` - キューを作成する際にRabbitMQの設定を設定することを可能にします。利用可能な設定：`x-max-length`, `x-max-length-bytes`, `x-message-ttl`, `x-expires`, `x-priority`, `x-max-priority`, `x-overflow`, `x-dead-letter-exchange`, `x-queue-type`。`durable`設定は、自動的にキューに対して有効になります。
- `rabbitmq_address` - 接続のためのアドレス。これか`rabbitmq_host_port`のいずれかの設定を使用します。
- `rabbitmq_vhost` - RabbitMQのvhost。デフォルト：`'\'`。
- `rabbitmq_queue_consume` - ユーザー定義のキューを使用し、RabbitMQのセットアップ（エクスチェンジ、キュー、バインディングの宣言）を行わない。デフォルト：`false`。
- `rabbitmq_username` - RabbitMQのユーザー名。
- `rabbitmq_password` - RabbitMQのパスワード。
- `reject_unhandled_messages` - エラーが発生した場合にメッセージを拒否します（RabbitMQの否定確認を送信）。この設定は、`rabbitmq_queue_settings_list`に`x-dead-letter-exchange`が定義されている場合に自動的に有効になります。
- `rabbitmq_commit_on_select` - セレクトクエリが実行されたときにメッセージをコミットします。デフォルト：`false`。
- `rabbitmq_max_rows_per_message` — 行ベースのフォーマットの1つのRabbitMQメッセージに書き込まれる最大行数。デフォルト : `1`。
- `rabbitmq_empty_queue_backoff_start` — RabbitMQキューが空の場合の再スケジュールまでの開始バックオフポイント。
- `rabbitmq_empty_queue_backoff_end` — RabbitMQキューが空の場合の再スケジュールまでの終了バックオフポイント。
- `rabbitmq_handle_error_mode` — RabbitMQエンジンのエラー処理方法。可能な値：default（メッセージの解析に失敗した場合、例外がスローされる）、stream（例外メッセージと生のメッセージが仮想カラム`_error`と`_raw_message`に保存される）、dead_letter_queue（エラーに関連するデータがsystem.dead_letter_queueに保存される）。

  * [ ] SSL接続：

`rabbitmq_secure = 1`または接続アドレスで`amqps`を使用します：`rabbitmq_address = 'amqps://guest:guest@localhost/vhost'`。
使用されるライブラリのデフォルトの動作では、作成されたTLS接続が十分に安全であるかどうかをチェックしません。証明書が期限切れ、自己署名、欠如、または無効であっても、接続は単に許可されます。証明書のより厳格なチェックは将来的に実装される可能性があります。

また、RabbitMQ関連の設定に加えてフォーマット設定を追加することができます。

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

RabbitMQサーバーの設定はClickHouseの設定ファイルを使用して追加する必要があります。

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

`SELECT`はメッセージを読み取るためには特に有用ではありません（デバッグを除く）、なぜなら各メッセージは一度だけ読むことができるからです。リアルタイムスレッドを作成するには、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md)を使用する方が実用的です。これを行うには：

1.  エンジンを使用してRabbitMQコンシューマを作成し、それをデータストリームと見なします。
2.  必要な構造を持つテーブルを作成します。
3.  エンジンからのデータを変換して、以前に作成されたテーブルに入れるマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに結合すると、バックグラウンドでデータの収集を開始します。これにより、RabbitMQからのメッセージを継続して受信し、`SELECT`を使用して必要な形式に変換できます。
1つのRabbitMQテーブルには、好きなだけのマテリアライズドビューを持つことができます。

データは`rabbitmq_exchange_type`および指定された`rabbitmq_routing_key_list`に基づいてチャネル分けできます。
1つのテーブルにつき、エクスチェンジは1つまでしか存在できません。1つのエクスチェンジは複数のテーブル間で共有でき、同時に複数のテーブルへのルーティングを可能にします。

エクスチェンジタイプのオプション：

- `direct` - ルーティングはキーの正確な一致に基づきます。例：テーブルキーリスト：`key1,key2,key3,key4,key5`、メッセージキーはいずれかに等しくできます。
- `fanout` - キーに関係なく、すべてのテーブル（エクスチェンジ名が同じ）にルーティングします。
- `topic` - ルーティングはドットで区切ったキーのパターンに基づきます。例：`*.logs`, `records.*.*.2020`, `*.2018,*.2019,*.2020`。
- `headers` - ルーティングは`key=value`が`x-match=all`または`x-match=any`で一致することに基づきます。例：テーブルキーリスト：`x-match=all,format=logs,type=report,year=2020`。
- `consistent_hash` - データはすべてのバインドされたテーブル間で均等に分配されます（エクスチェンジ名が同じ場合）。このエクスチェンジタイプはRabbitMQプラグイン：`rabbitmq-plugins enable rabbitmq_consistent_hash_exchange`を有効にする必要があります。

`rabbitmq_queue_base`設定は以下のケースで使用できます：

- 異なるテーブルがキューを共有できるようにし、複数のコンシューマが同じキューに登録され、パフォーマンスが向上するようにします。`rabbitmq_num_consumers`および/または`rabbitmq_num_queues`設定を使用する場合、これらのパラメータが同じである場合にキューの正確な一致が実現されます。
- すべてのメッセージが正常に消費されなかった場合に、特定の耐久キューからの読み取りを再開できるようにします。特定のキューからの消費を再開するには、その名前を`rabbitmq_queue_base`設定に設定し、`rabbitmq_num_consumers`および`rabbitmq_num_queues`を指定しないでください（デフォルトは1です）。特定のテーブルに対して宣言されたすべてのキューからの消費を再開するには、同じ設定を指定するだけです：`rabbitmq_queue_base`, `rabbitmq_num_consumers`, `rabbitmq_num_queues`。デフォルトでは、キュー名はテーブルに対して一意になります。
- キューが耐久性であり自動削除されない場合に、キューを再利用できます。（RabbitMQのCLIツールのいずれかを通じて削除できます。）

パフォーマンスを向上させるために、受信したメッセージは[最大挿入ブロックサイズ](../../../operations/settings/settings#max_insert_block_size)のサイズでブロックにグループ化されます。ブロックが[ストリームフラッシュ間隔ミリ秒](../../../operations/server-configuration-parameters/settings.md)内に形成されなかった場合、データはブロックの完全性に関係なくテーブルにフラッシュされます。

`rabbitmq_num_consumers`および/または`rabbitmq_num_queues`の設定が`rabbitmq_exchange_type`とともに指定されている場合、次のことが必要です：

- `rabbitmq-consistent-hash-exchange`プラグインが有効でなければなりません。
- 公開メッセージの`message_id`プロパティが指定されている必要があります（各メッセージ/バッチに対してユニーク）。

挿入クエリには、発行された各メッセージに追加されるメッセージメタデータがあります：`messageID`と`republished`フラグ（複数回発行された場合はtrue）があります - メッセージヘッダーを介してアクセスできます。

挿入とマテリアライズドビューの同じテーブルを使用しないでください。

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

- `_exchange_name` - RabbitMQエクスチェンジ名。データ型：`String`。
- `_channel_id` - メッセージを受信したコンシューマが宣言されたChannelID。データ型：`String`。
- `_delivery_tag` - 受信したメッセージのDeliveryTag。チャネルごとにスコープ付き。データ型：`UInt64`。
- `_redelivered` - メッセージの`redelivered`フラグ。データ型：`UInt8`。
- `_message_id` - 受信したメッセージのmessageID；メッセージが発行されたときに設定されている場合は空ではありません。データ型：`String`。
- `_timestamp` - 受信したメッセージのタイムスタンプ；メッセージが発行されたときに設定されている場合は空ではありません。データ型：`UInt64`。

`rabbitmq_handle_error_mode='stream'`の場合の追加の仮想カラム：

- `_raw_message` - 正しく解析できなかった生のメッセージ。データ型：`Nullable(String)`。
- `_error` - 失敗した解析中に発生した例外メッセージ。データ型：`Nullable(String)`。

注：`_raw_message`および`_error`の仮想カラムは、解析中に例外が発生した場合のみ填充され、メッセージが正常に解析された場合は常に`NULL`です。

## 注意点 {#caveats}

テーブル定義で[デフォルトカラム式](https://sql-reference/statements/create/table.md/#default_values)（例えば`DEFAULT`, `MATERIALIZED`, `ALIAS`）を指定することができますが、これらは無視されます。代わりに、カラムにはそれぞれの型のデフォルト値が填充されます。

## データフォーマットサポート {#data-formats-support}

RabbitMQエンジンは、ClickHouseでサポートされているすべての[フォーマット](../../../interfaces/formats.md)をサポートします。
1つのRabbitMQメッセージ内の行の数は、フォーマットが行指向かブロック指向かによって異なります：

- 行指向フォーマットの場合、1つのRabbitMQメッセージ内の行の数は、`rabbitmq_max_rows_per_message`を設定することで制御できます。
- ブロック指向フォーマットの場合、ブロックを小さな部分に分割することはできませんが、1つのブロック内の行の数は一般設定[最大ブロックサイズ](../../../operations/settings/settings#max_block_size)によって制御できます。

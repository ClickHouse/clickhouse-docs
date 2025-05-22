---
'description': 'This engine allows integrating ClickHouse with NATS to publish or
  subscribe to message subjects, and process new messages as they become available.'
'sidebar_label': 'NATS'
'sidebar_position': 140
'slug': '/engines/table-engines/integrations/nats'
'title': 'NATS Engine'
---




# NATSエンジン {#redisstreams-engine}

このエンジンは、ClickHouseと [NATS](https://nats.io/) を統合することを可能にします。

`NATS` では次のことができます：

- メッセージサブジェクトの発行または購読。
- 新しいメッセージが利用可能になると処理。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = NATS SETTINGS
    nats_url = 'host:port',
    nats_subjects = 'subject1,subject2,...',
    nats_format = 'data_format'[,]
    [nats_schema = '',]
    [nats_num_consumers = N,]
    [nats_queue_group = 'group_name',]
    [nats_secure = false,]
    [nats_max_reconnect = N,]
    [nats_reconnect_wait = N,]
    [nats_server_list = 'host1:port1,host2:port2,...',]
    [nats_skip_broken_messages = N,]
    [nats_max_block_size = N,]
    [nats_flush_interval_ms = N,]
    [nats_username = 'user',]
    [nats_password = 'password',]
    [nats_token = 'clickhouse',]
    [nats_credential_file = '/var/nats_credentials',]
    [nats_startup_connect_tries = '5']
    [nats_max_rows_per_message = 1,]
    [nats_handle_error_mode = 'default']
```

必須パラメータ：

- `nats_url` – host:port (例: `localhost:5672`)..
- `nats_subjects` – 購読/発行するNATSテーブルのサブジェクトのリスト。ワイルドカードサブジェクト `foo.*.bar` や `baz.>` をサポート。
- `nats_format` – メッセージフォーマット。SQLの `FORMAT` 関数と同じ表記法を使用（例: `JSONEachRow`）。詳細は [Formats](../../../interfaces/formats.md) セクションを参照。

オプションパラメータ：

- `nats_schema` – フォーマットがスキーマ定義を必要とする場合に使用すべきパラメータ。たとえば、[Cap'n Proto](https://capnproto.org/) はスキーマファイルのパスとルート `schema.capnp:Message` オブジェクトの名前を必要とします。
- `nats_num_consumers` – テーブルごとの消費者数。デフォルト: `1`。1つの消費者のスループットが不十分な場合は、より多くの消費者を指定してください。
- `nats_queue_group` – NATS購読者のキューグループ名。デフォルトはテーブル名です。
- `nats_max_reconnect` – 廃止され、効果がありません。再接続は nats_reconnect_wait のタイムアウトで永久に行われます。
- `nats_reconnect_wait` – 各再接続試行の間にスリープするミリ秒単位の時間。デフォルト: `5000`。
- `nats_server_list` - 接続用のサーバーリスト。NATSクラスターに接続するために指定できます。
- `nats_skip_broken_messages` - スキーマと互換性のないメッセージをブロックごとにスキップするNATSメッセージパーサの許容度。デフォルト: `0`。`nats_skip_broken_messages = N` の場合、エンジンは解析できない *N* NATSメッセージをスキップします（メッセージはデータの行に等しい）。
- `nats_max_block_size` - NATSからデータをフラッシュするためにポーリングで収集された行の数。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `nats_flush_interval_ms` - NATSから読み取ったデータをフラッシュするためのタイムアウト。デフォルト: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `nats_username` - NATSユーザー名。
- `nats_password` - NATSパスワード。
- `nats_token` - NATS認証トークン。
- `nats_credential_file` - NATS資格情報ファイルへのパス。
- `nats_startup_connect_tries` - 起動時の接続試行回数。デフォルト: `5`。
- `nats_max_rows_per_message` — 行ベースのフォーマットで1つのNATSメッセージに書き込まれる最大行数。（デフォルト: `1`）。
- `nats_handle_error_mode` — NATSエンジンに対するエラー処理の方法。可能な値: default（メッセージの解析に失敗した場合に例外がスローされます）、stream（例外メッセージと生のメッセージが仮想カラム `_error` と `_raw_message` に保存されます）。

SSL接続：

安全な接続には `nats_secure = 1` を使用します。
使用されるライブラリのデフォルトの動作は、作成されたTLS接続が十分に安全かどうかを確認しません。証明書が期限切れ、自己署名、不足、または無効であっても、接続は単に許可されます。証明書のより厳格なチェックは将来的に実装される可能性があります。

NATSテーブルへの書き込み：

テーブルが1つのサブジェクトからのみ読み取る場合、挿入は同じサブジェクトに公開されます。
しかし、テーブルが複数のサブジェクトから読み取る場合、公開するサブジェクトを指定する必要があります。
そのため、複数のサブジェクトを持つテーブルに挿入する際には、`stream_like_engine_insert_queue` の設定が必要です。
テーブルが読み取るサブジェクトの1つを選択し、そこにデータを公開できます。例：

```sql
  CREATE TABLE queue (
    key UInt64,
    value UInt64
  ) ENGINE = NATS
    SETTINGS nats_url = 'localhost:4444',
             nats_subjects = 'subject1,subject2',
             nats_format = 'JSONEachRow';

  INSERT INTO queue
  SETTINGS stream_like_engine_insert_queue = 'subject2'
  VALUES (1, 1);
```

また、フォーマット設定をnats関連の設定と一緒に追加することができます。

例：

```sql
  CREATE TABLE queue (
    key UInt64,
    value UInt64,
    date DateTime
  ) ENGINE = NATS
    SETTINGS nats_url = 'localhost:4444',
             nats_subjects = 'subject1',
             nats_format = 'JSONEachRow',
             date_time_input_format = 'best_effort';
```

NATSサーバーの設定はClickHouseの設定ファイルを使用して追加できます。
具体的には、NATSエンジンのためのRedisパスワードを追加できます：

```xml
<nats>
    <user>click</user>
    <password>house</password>
    <token>clickhouse</token>
</nats>
```

## 説明 {#description}

`SELECT` はメッセージを読み取るには特に役に立ちません（デバッグを除いて）、なぜなら各メッセージは一度だけ読むことができるからです。リアルタイムスレッドを作成するには、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md)を使用するのがより実用的です。これを行うには：

1.  エンジンを使用してNATS消費者を作成し、それをデータストリームと見なします。
2.  必要な構造のテーブルを作成します。
3.  エンジンからのデータを変換し、以前に作成したテーブルに入れるマテリアライズドビューを作成します。

`MATERIALIZED VIEW` がエンジンに接続すると、バックグラウンドでデータを収集し始めます。これにより、NATSからメッセージを継続的に受け取り、`SELECT`を使用して必要なフォーマットに変換することができます。
1つのNATSテーブルには、任意の数のマテリアライズドビューを持つことができ、これらはテーブルから直接データを読み取るのではなく、新しいレコード（ブロック単位）を受け取ります。これにより、異なる詳細レベルの複数のテーブルに書き込むことができます（グループ化 - 集約ありおよびなし）。

例：

```sql
  CREATE TABLE queue (
    key UInt64,
    value UInt64
  ) ENGINE = NATS
    SETTINGS nats_url = 'localhost:4444',
             nats_subjects = 'subject1',
             nats_format = 'JSONEachRow',
             date_time_input_format = 'best_effort';

  CREATE TABLE daily (key UInt64, value UInt64)
    ENGINE = MergeTree() ORDER BY key;

  CREATE MATERIALIZED VIEW consumer TO daily
    AS SELECT key, value FROM queue;

  SELECT key, value FROM daily ORDER BY key;
```

ストリームデータの受信を停止したり、変換ロジックを変更したりするには、マテリアライズドビューを切り離します：

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

ターゲットテーブルを `ALTER` で変更したい場合は、ターゲットテーブルとビューからのデータの不一致を避けるために、マテリアルビューを無効にすることをお勧めします。

## 仮想カラム {#virtual-columns}

- `_subject` - NATSメッセージのサブジェクト。データ型: `String`。

`nats_handle_error_mode='stream'` の場合の追加仮想カラム：

- `_raw_message` - 正しく解析できなかった生のメッセージ。データ型: `Nullable(String)`。
- `_error` - 解析中に発生した例外メッセージ。データ型: `Nullable(String)`。

注意：`_raw_message` と `_error` の仮想カラムは、解析中に例外が発生した場合のみ埋められ、メッセージが正常に解析された場合は常に `NULL` です。

## データフォーマットのサポート {#data-formats-support}

NATSエンジンは、ClickHouseでサポートされているすべての [formats](../../../interfaces/formats.md) をサポートします。
1つのNATSメッセージの行数は、フォーマットが行ベースかブロックベースかによって異なります：

- 行ベースのフォーマットの場合、1つのNATSメッセージ内の行数は `nats_max_rows_per_message` を設定することで制御できます。
- ブロックベースのフォーマットではブロックをより小さな部分に分割することはできませんが、1つのブロックの行数は一般的な設定 [max_block_size](/operations/settings/settings#max_block_size) で制御できます。

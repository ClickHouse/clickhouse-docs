---
'description': 'このエンジンは、ClickHouseとNATSを統合し、メッセージのトピックに対して発行または購読し、新しいメッセージが利用可能になるとそれを処理することを可能にします。'
'sidebar_label': 'NATS'
'sidebar_position': 140
'slug': '/engines/table-engines/integrations/nats'
'title': 'NATS エンジン'
'doc_type': 'guide'
---


# NATSエンジン {#redisstreams-engine}

このエンジンは、ClickHouse を [NATS](https://nats.io/) と統合することを可能にします。

`NATS` を使用すると:

- メッセージの対象に公開または購読できます。
- 新しいメッセージが利用可能になると、処理できます。

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

必須パラメーター:

- `nats_url` – ホスト:ポート (例: `localhost:5672`)..
- `nats_subjects` – NATS テーブルが購読/公開する対象のリスト。ワイルドカード対象（例: `foo.*.bar` または `baz.>`）をサポートしています。
- `nats_format` – メッセージフォーマット。SQL の `FORMAT` 関数と同じ表記法を使用します。例: `JSONEachRow`。詳細については、[Formats](../../../interfaces/formats.md) セクションを参照してください。

オプションのパラメーター:

- `nats_schema` – フォーマットがスキーマ定義を必要とする場合に使用する必須パラメータ。例えば、[Cap'n Proto](https://capnproto.org/) はスキーマファイルへのパスと、ルート `schema.capnp:Message` オブジェクトの名前を必要とします。
- `nats_stream` – NATS JetStream のストリーム名。
- `nats_consumer` – NATS JetStream 用の耐久性消費者の名前。
- `nats_num_consumers` – テーブルあたりの消費者数。デフォルト: `1`。1 つの消費者のスループットが NATS コアのみで不十分な場合は、より多くの消費者を指定してください。
- `nats_queue_group` – NATS 購読者のキューグループの名前。デフォルトはテーブル名です。
- `nats_max_reconnect` – 廃止されており、効果はありません。再接続は nats_reconnect_wait タイムアウトで永続的に実行されます。
- `nats_reconnect_wait` – 各再接続試行の間にスリープする時間（ミリ秒）。デフォルト: `5000`。
- `nats_server_list` - 接続用のサーバーリスト。NATS クラスターに接続するために指定できます。
- `nats_skip_broken_messages` - ブロックごとのスキーマ不適合メッセージに対する NATS メッセージパーサーの許容度。デフォルト: `0`。`nats_skip_broken_messages = N` の場合、エンジンは解析できない *N* 件の NATS メッセージをスキップします（メッセージはデータの行に相当します）。
- `nats_max_block_size` - NATS からデータをフラッシュするためにポールで収集される最大行数。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `nats_flush_interval_ms` - NATS から読み取ったデータをフラッシュするためのタイムアウト。デフォルト: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `nats_username` - NATS のユーザー名。
- `nats_password` - NATS のパスワード。
- `nats_token` - NATS の認証トークン。
- `nats_credential_file` - NATS の認証情報ファイルへのパス。
- `nats_startup_connect_tries` - 起動時の接続試行回数。デフォルト: `5`。
- `nats_max_rows_per_message` — 行ベースのフォーマットの NATS メッセージ内に書き込まれる最大行数。(デフォルト: `1`)。
- `nats_handle_error_mode` — NATS エンジンのエラー処理方法。考えられる値: デフォルト（メッセージの解析に失敗した場合、例外がスローされます）、ストリーム（例外メッセージと生のメッセージが仮想カラム `_error` と `_raw_message` に保存されます）。

SSL接続:

安全な接続を使用するには、`nats_secure = 1` を使用します。
使用されるライブラリのデフォルトの動作は、作成された TLS 接続が十分に安全であるかどうかを確認しません。証明書が期限切れ、自己署名、不足、または無効である場合でも: 接続は単に許可されます。証明書のより厳格なチェックは将来的に実装される可能性があります。

NATS テーブルへの書き込み:

テーブルが1つの対象からのみ読み取る場合、任意の挿入は同じ対象に公開されます。
ただし、テーブルが複数の対象から読み取る場合、公開する対象を指定する必要があります。
したがって、複数の対象を持つテーブルに挿入する際は、`stream_like_engine_insert_queue` を設定する必要があります。
テーブルが読み取る対象の1つを選択し、そこにデータを公開できます。例えば:

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

また、nats 関連の設定と共にフォーマット設定を追加できます。

例:

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

NATS サーバーの設定は ClickHouse 設定ファイルを使用して追加できます。
具体的には、NATS エンジン用の Redis パスワードを追加できます:

```xml
<nats>
    <user>click</user>
    <password>house</password>
    <token>clickhouse</token>
</nats>
```

## 説明 {#description}

`SELECT` は、メッセージを読み取るには特に役に立ちません（デバッグを除いて）、なぜなら各メッセージは一度しか読まれないからです。より実用的なのは、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md) を使用してリアルタイムスレッドを作成することです。これを行うには:

1. エンジンを使って NATS 消費者を作成し、データストリームと見なします。
2. 必要な構造を持つテーブルを作成します。
3. エンジンからデータを変換し、あらかじめ作成したテーブルに格納するマテリアライズドビューを作成します。

`MATERIALIZED VIEW` がエンジンに結合されると、バックグラウンドでデータの収集が始まります。これにより、NATS からメッセージを継続的に受信し、`SELECT` を使用して必要なフォーマットに変換できます。
1 つの NATS テーブルには、何個でもマテリアライズドビューを持つことができ、これらはテーブルから直接データを読み取るのではなく、新しいレコード（ブロックで）を受信します。この方法で、異なる詳細レベルで複数のテーブルに書き込むことができます（グループ化 - 集約ありおよびなしで）。

例:

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

ストリームデータの受信を停止するか、変換ロジックを変更するには、マテリアライズドビューを切り離します:

```sql
DETACH TABLE consumer;
ATTACH TABLE consumer;
```

`ALTER` を使用してターゲットテーブルを変更したい場合は、ターゲットテーブルとビューからのデータ間の不一致を避けるために、マテリアライズドビューを無効にすることを推奨します。

## 仮想カラム {#virtual-columns}

- `_subject` - NATS メッセージ対象。データ型: `String`。

`nats_handle_error_mode='stream'` の場合の追加の仮想カラム:

- `_raw_message` - 成功裏に解析できなかった生メッセージ。データ型: `Nullable(String)`。
- `_error` - 解析に失敗したときに発生した例外メッセージ。データ型: `Nullable(String)`。

注: `_raw_message` および `_error` の仮想カラムは、解析中の例外が発生した場合のみ填充され、メッセージが正常に解析された場合は常に `NULL` です。

## データフォーマットのサポート {#data-formats-support}

NATS エンジンは、ClickHouse でサポートされているすべての [フォーマット](../../../interfaces/formats.md) をサポートしています。
1 つの NATS メッセージ内の行数は、フォーマットが行ベースかブロックベースかによって異なります。

- 行ベースのフォーマットの場合、1 つの NATS メッセージ内の行数は `nats_max_rows_per_message` を設定することで制御できます。
- ブロックベースのフォーマットの場合、ブロックを小さな部分に分割することはできませんが、1 つのブロック内の行数は一般設定 [max_block_size](/operations/settings/settings#max_block_size) で制御できます。

---
description: 'このエンジンは、ClickHouseとNATSを統合し、メッセージのサブジェクトを発行または購読し、新しいメッセージが利用可能になったときに処理することを可能にします。'
sidebar_label: 'NATS'
sidebar_position: 140
slug: /engines/table-engines/integrations/nats
title: 'NATSエンジン'
---


# NATSエンジン {#redisstreams-engine}

このエンジンは、ClickHouseと[NATS](https://nats.io/)を統合することを可能にします。

`NATS`を使用すると：

- メッセージのサブジェクトを発行または購読できます。
- 新しいメッセージが利用可能になったときに処理できます。

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

必要なパラメータ：

- `nats_url` – host:port（例: `localhost:5672`）。
- `nats_subjects` – NATSテーブルが購読/発行するためのサブジェクトのリスト。`foo.*.bar`や`baz.>`のようなワイルドカードサブジェクトをサポート。
- `nats_format` – メッセージフォーマット。SQLの`FORMAT`関数と同じ表記を使用します。例えば、`JSONEachRow`。詳細については、[Formats](../../../interfaces/formats.md)セクションを参照。

オプションパラメータ：

- `nats_schema` – フォーマットにスキーマ定義が必要な場合に使用するパラメータ。例えば、[Cap'n Proto](https://capnproto.org/)は、スキーマファイルのパスとルート`sсhema.capnp:Message`オブジェクトの名前が必要です。
- `nats_num_consumers` – テーブルごとのコンシューマ数。デフォルト: `1`。1つのコンシューマのスループットが不十分な場合には、より多くのコンシューマを指定します。
- `nats_queue_group` – NATSサブスクライバーのキューグループ名。デフォルトはテーブル名です。
- `nats_max_reconnect` – 非推奨で、効果はありません。再接続は`nats_reconnect_wait`タイムアウトで永続的に行われます。
- `nats_reconnect_wait` – 各再接続試行の間にスリープする時間（ミリ秒）。デフォルト: `5000`。
- `nats_server_list` - 接続用のサーバーリスト。NATSクラスターに接続するために指定できます。
- `nats_skip_broken_messages` - 各ブロック内のスキーマ非互換メッセージに対するNATSメッセージパーサーの耐性。デフォルト: `0`。`nats_skip_broken_messages = N`の場合、エンジンは解析できない*N*個のNATSメッセージをスキップします（メッセージはデータの行に相当）。
- `nats_max_block_size` - NATSからのデータをフラッシュするために収集される行の数。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `nats_flush_interval_ms` - NATSから読み取ったデータをフラッシュするためのタイムアウト。デフォルト: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `nats_username` - NATSユーザー名。
- `nats_password` - NATSパスワード。
- `nats_token` - NATS認証トークン。
- `nats_credential_file` - NATSの資格情報ファイルのパス。
- `nats_startup_connect_tries` - 起動時の接続試行回数。デフォルト: `5`。
- `nats_max_rows_per_message` — 行ベースのフォーマット用の1つのNATSメッセージに書き込まれる行の最大数。（デフォルト: `1`）。
- `nats_handle_error_mode` — NATSエンジンのエラー処理方法。可能な値: default（メッセージの解析に失敗すると例外が発生します）、stream（例外メッセージと生メッセージが仮想カラム`_error`と`_raw_message`に保存されます）。

SSL接続：

安全な接続のためには`nats_secure = 1`を使用します。
使用されるライブラリのデフォルトの動作は、作成されたTLS接続が十分に安全であるかどうかを確認しないことです。証明書が期限切れである、自己署名である、欠落している、または無効である場合でも、接続は単に許可されます。証明書のより厳格なチェックが将来的に実装される可能性があります。

NATSテーブルへの書き込み：

テーブルが1つのサブジェクトからのみ読み込む場合、挿入は同じサブジェクトに発行されます。
しかし、テーブルが複数のサブジェクトから読み込む場合、発行するサブジェクトを指定する必要があります。
そのため、複数のサブジェクトを持つテーブルに挿入する際には、`stream_like_engine_insert_queue`の設定が必要です。
テーブルが読み込むサブジェクトの1つを選択し、データをそこに発行できます。例えば：

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

また、フォーマットの設定はnats関連の設定と一緒に追加することができます。

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

NATSサーバーの設定はClickHouse設定ファイルを使用して追加できます。
より具体的には、NATSエンジン用のRedisパスワードを追加できます：

```xml
<nats>
    <user>click</user>
    <password>house</password>
    <token>clickhouse</token>
</nats>
```

## 説明 {#description}

`SELECT`はメッセージの読み取りには特に役立ちません（デバッグを除いて）。各メッセージは一度しか読み取れないためです。リアルタイムスレッドを作成する方が実用的です[materialized views](../../../sql-reference/statements/create/view.md)を使用して。これを行うには：

1. エンジンを使用してNATSコンシューマを作成し、それをデータストリームと見なします。
2. 目的の構造を持つテーブルを作成します。
3. エンジンからデータを変換し、事前に作成したテーブルに入れるマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに接続されると、バックグラウンドでデータの収集を開始します。これにより、NATSからメッセージを継続的に受信し、`SELECT`を使用して必要なフォーマットに変換することができます。
1つのNATSテーブルには、好きな数のマテリアライズドビューを持つことができ、これらはテーブルからデータを直接読み取るのではなく、新しいレコード（ブロック単位）を受け取ります。この方法で、異なる詳細レベル（集約を伴うものと伴わないもの）を持つ複数のテーブルに書き込むことができます。

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

ストリームデータの受信を停止するか、変換ロジックを変更するには、マテリアライズドビューをデタッチしてください：

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

ターゲットテーブルを`ALTER`を使用して変更したい場合は、マテリアライズドビューを無効にすることをお勧めします。データの不一致を避けるためです。

## 仮想カラム {#virtual-columns}

- `_subject` - NATSメッセージサブジェクト。データ型: `String`。

`nats_handle_error_mode='stream'`の場合の追加の仮想カラム：

- `_raw_message` - 解析に失敗した生メッセージ。データ型: `Nullable(String)`。
- `_error` - 解析に失敗した場合に発生した例外メッセージ。データ型: `Nullable(String)`。

注: `_raw_message`および`_error`仮想カラムは、解析中に例外が発生した場合にのみ埋められ、メッセージが正常に解析された場合は常に`NULL`です。

## データフォーマットのサポート {#data-formats-support}

NATSエンジンは、ClickHouseでサポートされているすべての[formats](../../../interfaces/formats.md)をサポートしています。
1つのNATSメッセージ内の行数は、フォーマットが行ベースかブロックベースかによって異なります：

- 行ベースフォーマットの場合、1つのNATSメッセージ内の行数は、`nats_max_rows_per_message`を設定することで制御できます。
- ブロックベースフォーマットの場合、ブロックを小さな部分に分割することはできませんが、1つのブロック内の行数は一般設定[max_block_size](/operations/settings/settings#max_block_size)で制御できます。

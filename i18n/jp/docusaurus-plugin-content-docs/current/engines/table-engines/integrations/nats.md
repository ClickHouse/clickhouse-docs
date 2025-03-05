---
slug: /engines/table-engines/integrations/nats
sidebar_position: 140
sidebar_label: NATS
title: "NATSエンジン"
description: "このエンジンは、ClickHouseとNATSを統合し、メッセージのサブジェクトを公開またはサブスクライブし、新しいメッセージが利用可能になると処理することを可能にします。"
---


# NATSエンジン {#redisstreams-engine}

このエンジンは、[NATS](https://nats.io/)とClickHouseを統合することを可能にします。

`NATS`を使用すると:

- メッセージのサブジェクトを公開またはサブスクライブできます。
- 新しいメッセージが利用可能になると、それを処理できます。

## テーブルの作成 {#creating-a-table}

``` sql
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

必要なパラメータ:

- `nats_url` – host:port (例えば、`localhost:5672`)..
- `nats_subjects` – NATSテーブルがサブスクライブ/公開するサブジェクトのリスト。ワイルドカードサブジェクト（例: `foo.*.bar` または `baz.>`）をサポートしています。
- `nats_format` – メッセージの形式。SQLの `FORMAT` 関数と同じ表記法を使用します（例: `JSONEachRow`）。詳細については、[フォーマット](../../../interfaces/formats.md) セクションを参照してください。

オプションのパラメータ:

- `nats_schema` – 形式がスキーマ定義を必要とする場合に使用しなければならないパラメータ。例えば、[Cap'n Proto](https://capnproto.org/)は、スキーマファイルのパスとルートオブジェクト `schema.capnp:Message` の名前が必要です。
- `nats_num_consumers` – テーブルあたりのコンシューマ数。デフォルト: `1`。1つのコンシューマのスループットが不十分な場合は、より多くのコンシューマを指定してください。
- `nats_queue_group` – NATSサブスクライバのキューグループ名。デフォルトはテーブル名です。
- `nats_max_reconnect` – NATSへの接続を試みる際の最大リトライ回数。デフォルト: `5`。
- `nats_reconnect_wait` – 各リトライ試行の間に待機する時間（ミリ秒単位）。デフォルト: `5000`。
- `nats_server_list` - 接続用のサーバーリスト。NATSクラスターに接続するために指定できます。
- `nats_skip_broken_messages` - スキーマと互換性のないメッセージに対するNATSメッセージパーサの耐障害性。デフォルト: `0`。`nats_skip_broken_messages = N` に設定すると、解析できない *N* 個のNATSメッセージをエンジンがスキップします（メッセージはデータの1行に相当します）。
- `nats_max_block_size` - NATSからデータをフラッシュするために収集される行の数。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `nats_flush_interval_ms` - NATSから読み取ったデータをフラッシュするためのタイムアウト。デフォルト: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `nats_username` - NATSのユーザー名。
- `nats_password` - NATSのパスワード。
- `nats_token` - NATSの認証トークン。
- `nats_credential_file` - NATS資格情報ファイルへのパス。
- `nats_startup_connect_tries` - 起動時の接続試行回数。デフォルト: `5`。
- `nats_max_rows_per_message` — 行ベースの形式の1つのNATSメッセージに書き込まれる最大行数。（デフォルト: `1`）。
- `nats_handle_error_mode` — NATSエンジンのエラー処理方法。可能な値: default（メッセージのパースに失敗した場合、例外がスローされます）、stream（例外メッセージと生のメッセージが仮想カラム `_error` と `_raw_message` に保存されます）。

SSL接続:

安全な接続を利用するには `nats_secure = 1` を使用します。
使用されるライブラリのデフォルトの動作は、作成したTLS接続が十分に安全であるかどうかをチェックしないことです。証明書が期限切れ、自己署名、不足している、または無効であっても、接続は単に許可されます。証明書のより厳格なチェックは、将来的に実装される可能性があります。

NATSテーブルへの書き込み:

テーブルが1つのサブジェクトからのみ読み取る場合、どんな挿入も同じサブジェクトに公開されます。
ただし、テーブルが複数のサブジェクトから読み取る場合、公開したいサブジェクトを指定する必要があります。
そのため、複数のサブジェクトを持つテーブルに挿入する際は、`stream_like_engine_insert_queue`を設定する必要があります。
テーブルが読み取るサブジェクトの1つを選択し、そこにデータを公開できます。例えば:

``` sql
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

また、nats関連の設定とともに形式設定を追加できます。

例:

``` sql
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

NATSサーバーの設定は、ClickHouseの設定ファイルを使用して追加できます。
具体的には、NATSエンジンのRedisパスワードを追加できます。

``` xml
<nats>
    <user>click</user>
    <password>house</password>
    <token>clickhouse</token>
</nats>
```

## 説明 {#description}

`SELECT`はメッセージを読み取るのには特に便利ではありません（デバッグを除いて）、なぜなら各メッセージは一度だけ読み取ることができるからです。実際には、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md)を使用してリアルタイムスレッドを作成する方が実用的です。これを行うには:

1. エンジンを使用してNATSコンシューマを作成し、それをデータストリームと見なします。
2. 希望の構造を持つテーブルを作成します。
3. エンジンからデータを変換し、事前に作成したテーブルに入れるマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに接続すると、バックグラウンドでデータを収集し始めます。これにより、NATSからメッセージを持続的に受信し、`SELECT`を使用して必要な形式に変換できます。
1つのNATSテーブルには、好きなだけマテリアライズドビューを持つことができ、これらは直接テーブルからデータを読み取ることはなく、新しいレコード（ブロック単位）を受信します。この方法で、異なる詳細レベル（集約やグルーピングの有無）で複数のテーブルに書き込むことができます。

例:

``` sql
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

ストリームデータの受信を停止するか、変換ロジックを変更したい場合は、マテリアライズドビューを切り離します。

``` sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER`を使用してターゲットテーブルを変更したい場合は、ターゲットテーブルとビューからのデータとの不一致を避けるために、マテリアライズドビューを無効にすることをお勧めします。

## 仮想カラム {#virtual-columns}

- `_subject` - NATSメッセージのサブジェクト。データ型: `String`。

`nats_handle_error_mode='stream'`の際の追加の仮想カラム:

- `_raw_message` - 正常に解析できなかった生のメッセージ。データ型: `Nullable(String)`。
- `_error` - 解析に失敗した際に発生した例外メッセージ。データ型: `Nullable(String)`。

注意: `_raw_message`および `_error`の仮想カラムは、解析中に例外が発生した場合にのみ埋められ、メッセージが正常に解析された場合は常に`NULL`です。


## データフォーマットのサポート {#data-formats-support}

NATSエンジンは、ClickHouseでサポートされているすべての[フォーマット](../../../interfaces/formats.md)をサポートしています。
1つのNATSメッセージの行数は、フォーマットが行ベースかブロックベースかによって異なります。

- 行ベースのフォーマットでは、1つのNATSメッセージの行数は `nats_max_rows_per_message` を設定することで制御できます。
- ブロックベースのフォーマットでは、ブロックを小さい部分に分割することはできませんが、1つのブロック内の行数は一般的な設定 [max_block_size](/operations/settings/settings#max_block_size) で制御できます。

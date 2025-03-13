---
slug: /engines/table-engines/integrations/nats
sidebar_position: 140
sidebar_label: NATS
title: 'NATSエンジン'
description: 'このエンジンは、ClickHouseをNATSと統合し、メッセージのサブジェクトに発行またはサブスクライブし、新しいメッセージが利用可能になると処理することを可能にします。'
---


# NATSエンジン {#redisstreams-engine}

このエンジンは、[NATS](https://nats.io/)とClickHouseを統合することを可能にします。

`NATS`を使用すると：

- メッセージのサブジェクトに発行またはサブスクライブできます。
- 新しいメッセージが利用可能になると処理できます。

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

必要なパラメーター：

- `nats_url` – host:port (例: `localhost:5672`)..
- `nats_subjects` – NATSテーブルがサブスクライブ/発行するサブジェクトのリスト。ワイルドカードサブジェクトのような `foo.*.bar` や `baz.>` もサポート。
- `nats_format` – メッセージ形式。SQLの `FORMAT` 関数と同様の表記法を使用します。例: `JSONEachRow`。詳細については、[フォーマット](../../../interfaces/formats.md)セクションを参照してください。

オプションのパラメーター：

- `nats_schema` – フォーマットがスキーマ定義を要求する場合に使用する必要があるパラメーター。例えば、[Cap'n Proto](https://capnproto.org/)はスキーマファイルのパスとルート `schema.capnp:Message` オブジェクトの名前を要求します。
- `nats_num_consumers` – テーブルごとの消費者の数。デフォルト: `1`。1つの消費者のスループットが不十分な場合は、より多くの消費者を指定してください。
- `nats_queue_group` – NATSサブスクライバーのキューグループ名。デフォルトはテーブル名です。
- `nats_max_reconnect` – 非推奨で、効果はありません。再接続はnats_reconnect_waitタイムアウトで永久に実行されます。
- `nats_reconnect_wait` – 各再接続試行の間にスリープする時間（ミリ秒）。デフォルト: `5000`。
- `nats_server_list` – 接続用のサーバーリスト。NATSクラスタに接続するために指定できます。
- `nats_skip_broken_messages` – ブロックごとのスキーマ不適合メッセージに対するNATSメッセージパーサーの耐性。デフォルト: `0`。`nats_skip_broken_messages = N` の場合、エンジンはパースできない *N* のNATSメッセージをスキップします（メッセージはデータ行に相当）。
- `nats_max_block_size` – NATSからデータをフラッシュするために収集された行の数。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `nats_flush_interval_ms` – NATSから読み取ったデータをフラッシュするためのタイムアウト。デフォルト: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `nats_username` – NATSのユーザー名。
- `nats_password` – NATSのパスワード。
- `nats_token` – NATSの認証トークン。
- `nats_credential_file` – NATSの資格情報ファイルへのパス。
- `nats_startup_connect_tries` – 起動時の接続試行回数。デフォルト: `5`。
- `nats_max_rows_per_message` — 行ベースのフォーマットの1つのNATSメッセージに書き込まれる最大行数。（デフォルト: `1`）。
- `nats_handle_error_mode` — NATSエンジンのエラー処理方法。可能な値: default（メッセージのパースに失敗した場合は例外がスローされます）、stream（例外メッセージと生メッセージが仮想カラム `_error` および `_raw_message` に保存されます）。

SSL接続:

セキュア接続を使用するには `nats_secure = 1` を設定します。使用されるライブラリのデフォルトの動作は、作成されたTLS接続が十分にセキュアであるかどうかを確認しないことです。証明書が失効している、自己署名されている、欠落している、または無効である場合でも、接続は単に許可されます。将来的に、証明書のより厳格なチェックが実装される可能性があります。

NATSテーブルへの書き込み:

テーブルが1つのサブジェクトからのみ読み取る場合、任意の挿入は同じサブジェクトに発行されます。しかし、テーブルが複数のサブジェクトから読み取る場合、どのサブジェクトに発行するかを指定する必要があります。そのため、複数のサブジェクトを持つテーブルに挿入する際には、`stream_like_engine_insert_queue` を設定する必要があります。テーブルが読み取るサブジェクトの1つを選択し、そこにデータを発行できます。例えば：

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

また、フォーマット設定はnats関連の設定とともに追加できます。

例：

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

NATSサーバーの構成は、ClickHouseの設定ファイルを使用して追加できます。具体的には、NATSエンジン用のRedisパスワードを追加できます：

``` xml
<nats>
    <user>click</user>
    <password>house</password>
    <token>clickhouse</token>
</nats>
```

## 説明 {#description}

`SELECT`はメッセージを読み取るのに特に便利ではありません（デバッグを除く）、なぜなら、各メッセージは一度しか読み取ることができないからです。実用的には、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md)を使用してリアルタイムスレッドを作成する方が良いです。そのためには：

1. エンジンを使用してNATS消費者を作成し、それをデータストリームと見なします。
2. 望ましい構造のテーブルを作成します。
3. エンジンからのデータを変換し、事前に作成したテーブルに配置するマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに接続されると、バックグラウンドでデータを収集し始めます。これにより、NATSからメッセージを継続的に受信し、`SELECT`を使用して必要な形式に変換できます。一つのNATSテーブルには、必要なだけのマテリアライズドビューを持つことができ、これらはテーブルから直接データを読み取るのではなく、新しいレコードを（ブロック単位で）受け取ります。この方法により、異なる詳細レベル（グルーピング - 集約あり、なし）で異なるテーブルに書き込むことができます。

例：

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

ストリームデータの受信を停止するか、変換ロジックを変更するには、マテリアライズドビューを切り離します：

``` sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER`を使用してターゲットテーブルを変更したい場合は、ターゲットテーブルとビューからのデータ間の不一致を避けるためにマテリアライズドビューを無効にすることをお勧めします。

## 仮想カラム {#virtual-columns}

- `_subject` - NATSメッセージのサブジェクト。データ型: `String`。

`nats_handle_error_mode='stream'`の際の追加の仮想カラム：

- `_raw_message` - 正常にパースできなかった生メッセージ。データ型: `Nullable(String)`。
- `_error` - パースに失敗した際に発生した例外メッセージ。データ型: `Nullable(String)`。

注意: `_raw_message` および `_error` の仮想カラムは、パース中に例外が発生した場合のみ埋められ、メッセージが正常にパースされた場合は常に `NULL` です。

## データフォーマットのサポート {#data-formats-support}

NATSエンジンは、ClickHouseでサポートされるすべての[フォーマット](../../../interfaces/formats.md)をサポートしています。1つのNATSメッセージの行数は、フォーマットが行ベースかブロックベースかによって異なります：

- 行ベースのフォーマットの場合、1つのNATSメッセージの行数は `nats_max_rows_per_message` を設定することで制御できます。
- ブロックベースのフォーマットでは、ブロックを小さな部分に分割することはできませんが、1つのブロック内での行数は一般設定の[max_block_size](/operations/settings/settings#max_block_size)によって制御できます。

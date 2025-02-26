---
slug: /engines/table-engines/integrations/nats
sidebar_position: 140
sidebar_label: NATS
title: "NATSエンジン"
description: "このエンジンはClickHouseとNATSを統合し、メッセージのトピックを発行または購読し、新しいメッセージが利用可能になると処理することを可能にします。"
---

# NATSエンジン {#redisstreams-engine}

このエンジンはClickHouseと[NATS](https://nats.io/)を統合します。

`NATS`では以下のことができます：

- メッセージのトピックを発行または購読する。
- 新しいメッセージが利用可能になると処理する。

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

必要なパラメータ：

- `nats_url` – host:port (例：`localhost:5672`)。
- `nats_subjects` – NATSテーブルが購読/発行するトピックのリスト。`foo.*.bar`や`baz.>`のようなワイルドカードトピックをサポートします。
- `nats_format` – メッセージフォーマット。SQLの`FORMAT`関数と同じ記法を使用します（例：`JSONEachRow`）。詳細については、[フォーマット](../../../interfaces/formats.md)のセクションを参照してください。

オプションのパラメータ：

- `nats_schema` – フォーマットがスキーマ定義を必要とする場合に使用するパラメータ。たとえば、[Cap'n Proto](https://capnproto.org/)はスキーマファイルのパスとルートの`schema.capnp:Message`オブジェクトの名前を必要とします。
- `nats_num_consumers` – テーブルあたりのコンシューマの数。デフォルト：`1`。1つのコンシューマのスループットが不十分な場合は、より多くのコンシューマを指定してください。
- `nats_queue_group` – NATS購読者のキューグループの名前。デフォルトはテーブル名です。
- `nats_max_reconnect` – NATSに接続するための再接続試行の最大回数。デフォルト：`5`。
- `nats_reconnect_wait` – 各再接続試行の間にスリープするミリ秒数。デフォルト：`5000`。
- `nats_server_list` - 接続用のサーバーリスト。NATSクラスタに接続するために指定できます。
- `nats_skip_broken_messages` - ブロックごとのスキーマ互換性のないメッセージに対するNATSメッセージパーサーの許容度。デフォルト：`0`。`nats_skip_broken_messages = N`の場合、パースできない*N*のNATSメッセージをスキップします（メッセージはデータの行に相当します）。
- `nats_max_block_size` - NATSからデータをフラッシュするために収集された行の数。デフォルト：[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `nats_flush_interval_ms` - NATSから読み取ったデータをフラッシュするためのタイムアウト。デフォルト：[stream_flush_interval_ms](../../../operations/settings/settings.md#stream-flush-interval-ms)。
- `nats_username` - NATSユーザー名。
- `nats_password` - NATSパスワード。
- `nats_token` - NATS認証トークン。
- `nats_credential_file` - NATS認証情報ファイルへのパス。
- `nats_startup_connect_tries` - スタートアップ時の接続試行回数。デフォルト：`5`。
- `nats_max_rows_per_message` — 行ベースフォーマットの1つのNATSメッセージに書き込まれる最大行数。（デフォルト：`1`）。
- `nats_handle_error_mode` — NATSエンジンのエラー処理方法。可能な値：default（メッセージのパースに失敗した場合に例外が投げられます）、stream（例外メッセージと生メッセージが仮想カラム `_error` と `_raw_message` に保存されます）。

SSL接続：

安全な接続を使用するには`nats_secure = 1`を使用します。
使用されるライブラリのデフォルトの動作は、作成されたTLS接続が十分に安全であるかどうかをチェックしません。証明書が期限切れ、自己署名、不足、または無効であっても、接続は単に許可されます。将来的には、証明書のより厳格なチェックが実装される可能性があります。

NATSテーブルへの書き込み：

テーブルが1つのトピックからのみ読み取る場合、任意の挿入は同じトピックに発行されます。
ただし、テーブルが複数のトピックから読み取る場合、どのトピックに発行するかを指定する必要があります。
そのため、複数のトピックを持つテーブルに挿入する際は、`stream_like_engine_insert_queue`を設定する必要があります。
テーブルが読み取るトピックの1つを選択し、データをそこに発行できます。例：

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

また、nats関連の設定とともにフォーマット設定を追加することもできます。

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

NATSサーバーの設定はClickHouseの設定ファイルを使用して追加できます。
具体的には、NATSエンジンのためにRedisパスワードを追加できます：

``` xml
<nats>
    <user>click</user>
    <password>house</password>
    <token>clickhouse</token>
</nats>
```

## 説明 {#description}

`SELECT`はメッセージを読み取るには特に便利ではありません（デバッグを除いて）、なぜなら各メッセージは一度しか読み取れないからです。リアルタイムのスレッドを作成するには、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md)を使用するのがより実用的です。これを行うには：

1. エンジンを使用してNATSコンシューマを作成し、それをデータストリームと見なします。
2. 希望の構造を持つテーブルを作成します。
3. エンジンからデータを変換し、事前に作成したテーブルに入れるマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに接続すると、それはバックグラウンドでデータを収集し始めます。これにより、NATSからメッセージを継続的に受信し、`SELECT`を使用して必要なフォーマットに変換できます。
1つのNATSテーブルには好みの数だけマテリアライズドビューを持つことができ、これらはテーブルから直接データを読み取るのではなく、新しいレコード（ブロック単位）を受信します。そのため、異なる詳細レベルで複数のテーブルに書き込むことができます（グルーピング - 集約ありとなし）。

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

ストリームデータの受信を停止するか、変換ロジックを変更するには、マテリアライズドビューの接続を解除します：

``` sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER`を使用してターゲットテーブルを変更したい場合は、ターゲットテーブルとビューからのデータとの不一致を避けるために、マテリアライズドビューを無効にすることを推奨します。

## 仮想カラム {#virtual-columns}

- `_subject` - NATSメッセージのトピック。データ型：`String`。

追加の仮想カラム（`nats_handle_error_mode='stream'`のとき）：

- `_raw_message` - 正常にパースできなかった生メッセージ。データ型：`Nullable(String)`。
- `_error` - パースに失敗した際に発生した例外メッセージ。データ型：`Nullable(String)`。

注意：`_raw_message`および`_error`の仮想カラムは、パース中に例外が発生した場合にのみ埋められ、メッセージが正常にパースされた場合には常に`NULL`になります。

## データフォーマットのサポート {#data-formats-support}

NATSエンジンはClickHouseでサポートされているすべての[フォーマット](../../../interfaces/formats.md)をサポートしています。
1つのNATSメッセージの行数は、フォーマットが行ベースかブロックベースかによって異なります：

- 行ベースフォーマットの場合、1つのNATSメッセージの行数は`nats_max_rows_per_message`を設定することで制御できます。
- ブロックベースフォーマットの場合、ブロックを小さな部分に分割することはできませんが、1つのブロックに含まれる行数は一般的な設定[max_block_size](../../../operations/settings/settings.md#setting-max_block_size)によって制御できます。

---
description: 'このエンジンを使用すると、ClickHouse を NATS と統合し、メッセージサブジェクトへのパブリッシュおよびサブスクライブを行い、新しいメッセージを到着次第処理できます。'
sidebar_label: 'NATS'
sidebar_position: 140
slug: /engines/table-engines/integrations/nats
title: 'NATS テーブルエンジン'
doc_type: 'guide'
---



# NATS テーブルエンジン {#redisstreams-engine}

このエンジンを使用すると、ClickHouse を [NATS](https://nats.io/) と統合できます。

`NATS` を使用すると、次のことができます。

- メッセージのサブジェクトをパブリッシュまたはサブスクライブする。
- 新しいメッセージを、到着し次第処理する。



## テーブルを作成する {#creating-a-table}

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

必須パラメータ:

* `nats_url` – host:port（例: `localhost:5672`）。
* `nats_subjects` – NATS テーブルが購読/公開する subject のリスト。`foo.*.bar` や `baz.>` のようなワイルドカード subject をサポートします。
* `nats_format` – メッセージ形式。SQL の `FORMAT` 関数と同じ表記を使用し、`JSONEachRow` などを指定します。詳細については、[Formats](../../../interfaces/formats.md) セクションを参照してください。

オプションパラメータ:

* `nats_schema` – フォーマットがスキーマ定義を必要とする場合に使用する必要があるパラメータです。たとえば [Cap&#39;n Proto](https://capnproto.org/) では、スキーマファイルへのパスと、ルート `schema.capnp:Message` オブジェクト名が必要です。
* `nats_stream` – NATS JetStream に既に存在するストリームの名前。
* `nats_consumer` – NATS JetStream に既に存在する永続的なプルコンシューマーの名前。
* `nats_num_consumers` – テーブルごとのコンシューマー数。デフォルト: `1`。NATS Core のみで 1 つのコンシューマーのスループットが不十分な場合は、より多くのコンシューマーを指定します。
* `nats_queue_group` – NATS サブスクライバーのキューグループ名。デフォルトはテーブル名です。
* `nats_max_reconnect` – 非推奨であり効果はありません。再接続は `nats_reconnect_wait` タイムアウトを用いて永続的に実行されます。
* `nats_reconnect_wait` – 各再接続試行の間にスリープする時間（ミリ秒）。デフォルト: `5000`。
* `nats_server_list` - 接続用のサーバーリスト。NATS クラスターに接続するために指定できます。
* `nats_skip_broken_messages` - ブロックごとのスキーマ非互換メッセージに対する NATS メッセージパーサーの許容数。デフォルト: `0`。`nats_skip_broken_messages = N` の場合、パースできない NATS メッセージを *N* 件スキップします（メッセージ 1 件はデータの行 1 件に相当します）。
* `nats_max_block_size` - NATS からデータをフラッシュするためにポーリングで収集される行数。デフォルト: [max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size)。
* `nats_flush_interval_ms` - NATS から読み取ったデータをフラッシュするタイムアウト。デフォルト: [stream&#95;flush&#95;interval&#95;ms](/operations/settings/settings#stream_flush_interval_ms)。
* `nats_username` - NATS ユーザー名。
* `nats_password` - NATS パスワード。
* `nats_token` - NATS 認証トークン。
* `nats_credential_file` - NATS 認証情報ファイルへのパス。
* `nats_startup_connect_tries` - 起動時の接続試行回数。デフォルト: `5`。
* `nats_max_rows_per_message` — 行ベースフォーマットにおいて 1 つの NATS メッセージに書き込まれる最大行数（デフォルト: `1`）。
* `nats_handle_error_mode` — NATS エンジンのエラー処理方法。利用可能な値: `default`（メッセージのパースに失敗した場合は例外をスロー）、`stream`（例外メッセージと生メッセージを仮想カラム `_error` と `_raw_message` に保存）。

SSL 接続:


安全な接続を行うには、`nats_secure = 1` を使用します。
使用しているライブラリのデフォルトの挙動では、確立された TLS 接続が十分に安全かどうかを検証しません。証明書が期限切れ、自署名、欠如、または無効である場合でも、接続はそのまま確立されてしまいます。証明書に対するより厳密な検証は、将来的に実装される可能性があります。

NATS テーブルへの書き込み:

テーブルが 1 つの subject からのみ読み取る場合、任意の INSERT は同じ subject への publish になります。
しかし、テーブルが複数の subject から読み取る場合は、どの subject に publish したいかを指定する必要があります。
そのため、複数の subject を持つテーブルに INSERT する場合は、`stream_like_engine_insert_queue` の設定が必要です。
テーブルが読み取っている subject の 1 つを選択し、そこにデータを publish できます。例えば、次のようになります:

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

また、フォーマット設定も nats 関連の設定と併せて追加できます。

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

NATS サーバーの設定は、ClickHouse の設定ファイルに追加できます。
より具体的には、NATS エンジン向けの Redis パスワードを指定できます。

```xml
<nats>
    <user>click</user>
    <password>house</password>
    <token>clickhouse</token>
</nats>
```


## 説明 {#description}

各メッセージは一度しか読み取れないため、（デバッグを除いて）メッセージの読み取りに `SELECT` を使ってもあまり有用ではありません。代わりに、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md) を使ってリアルタイムの処理フローを作成する方が実用的です。そのためには、次の手順を実行します。

1. エンジンを使用して NATS コンシューマを作成し、それをデータストリームとして扱います。
2. 目的の構造（スキーマ）を持つテーブルを作成します。
3. エンジンからのデータを変換し、あらかじめ作成したテーブルに書き込むマテリアライズドビューを作成します。

`MATERIALIZED VIEW` がエンジンにアタッチされると、バックグラウンドでデータの収集を開始します。これにより、NATS から継続的にメッセージを受信し、`SELECT` を使用して必要な形式に変換できます。
1 つの NATS テーブルに対して、必要なだけ多くのマテリアライズドビューを作成できます。これらはテーブルから直接データを読み取るのではなく、新しいレコード（ブロック単位）を受け取ります。この方法により、異なる詳細度（グルーピング・集約あり／なし）の複数のテーブルに書き込むことができます。

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

ストリームデータの取り込みを停止する、または変換ロジックを変更するには、マテリアライズドビューをデタッチします。

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER` を使用してターゲットテーブルを変更する場合は、ターゲットテーブルとビューからのデータとの不整合を避けるため、マテリアル化ビューを無効化しておくことを推奨します。


## 仮想列 {#virtual-columns}

- `_subject` - NATS メッセージのサブジェクト。データ型: `String`。

`nats_handle_error_mode='stream'` の場合に追加される仮想列:

- `_raw_message` - 正常にパースできなかった生メッセージ。データ型: `Nullable(String)`。
- `_error` - パースに失敗した際に発生した例外メッセージ。データ型: `Nullable(String)`。

注意: `_raw_message` と `_error` の仮想列は、パース中に例外が発生した場合にのみ値が設定され、メッセージのパースが成功した場合は常に `NULL` になります。



## データフォーマットのサポート {#data-formats-support}

NATS エンジンは、ClickHouse がサポートするすべての[フォーマット](../../../interfaces/formats.md)に対応しています。
1 つの NATS メッセージに含まれる行数は、フォーマットが行ベースかブロックベースかによって異なります。

- 行ベースのフォーマットでは、1 つの NATS メッセージ内の行数は、`nats_max_rows_per_message` の設定で制御できます。
- ブロックベースのフォーマットでは、ブロックをさらに小さな単位に分割することはできませんが、1 つのブロック内の行数は一般設定 [max_block_size](/operations/settings/settings#max_block_size) によって制御できます。



## JetStream の使用 {#using-jetstream}

NATS JetStream とともに NATS エンジンを使用する前に、NATS ストリームと永続プルコンシューマを作成する必要があります。これには、[NATS CLI](https://github.com/nats-io/natscli) パッケージに含まれる `nats` ユーティリティなどを使用できます。

<details>
  <summary>ストリームの作成</summary>

  ```bash
  $ nats stream add
  ? Stream Name stream_name
  ? Subjects stream_subject
  ? Storage file
  ? Replication 1
  ? Retention Policy Limits
  ? Discard Policy Old
  ? Stream Messages Limit -1
  ? Per Subject Messages Limit -1
  ? Total Stream Size -1
  ? Message TTL -1
  ? Max Message Size -1
  ? Duplicate tracking time window 2m0s
  ? Allow message Roll-ups No
  ? Allow message deletion Yes
  ? Allow purging subjects or the entire stream Yes
  Stream stream_name was created

  Information for Stream stream_name created 2025-10-03 14:12:51

                  Subjects: stream_subject
                  Replicas: 1
                   Storage: File

  Options:

                 Retention: Limits
           Acknowledgments: true
            Discard Policy: Old
          Duplicate Window: 2m0s
                Direct Get: true
         Allows Msg Delete: true
              Allows Purge: true
    Allows Per-Message TTL: false
            Allows Rollups: false

  Limits:

          Maximum Messages: unlimited
       Maximum Per Subject: unlimited
             Maximum Bytes: unlimited
               Maximum Age: unlimited
      Maximum Message Size: unlimited
         Maximum Consumers: unlimited

  State:

                  Messages: 0
                     Bytes: 0 B
            First Sequence: 0
             Last Sequence: 0
          Active Consumers: 0
  ```
</details>

<details>
  <summary>永続プルコンシューマの作成</summary>

  ```bash
  $ nats consumer add
  ? Select a Stream stream_name
  ? Consumer name consumer_name
  ? Delivery target (empty for Pull Consumers) 
  ? Start policy (all, new, last, subject, 1h, msg sequence) all
  ? Acknowledgment policy explicit
  ? Replay policy instant
  ? Filter Stream by subjects (blank for all) 
  ? Maximum Allowed Deliveries -1
  ? Maximum Acknowledgments Pending 0
  ? Deliver headers only without bodies No
  ? Add a Retry Backoff Policy No
  Information for Consumer stream_name > consumer_name created 2025-10-03T14:13:51+03:00

  Configuration:

                      Name: consumer_name
                 Pull Mode: true
            Deliver Policy: All
                Ack Policy: Explicit
                  Ack Wait: 30.00s
             Replay Policy: Instant
           Max Ack Pending: 1,000
         Max Waiting Pulls: 512

  State:

    Last Delivered Message: Consumer sequence: 0 Stream sequence: 0
      Acknowledgment Floor: Consumer sequence: 0 Stream sequence: 0
          Outstanding Acks: 0 out of maximum 1,000
      Redelivered Messages: 0
      Unprocessed Messages: 0
             Waiting Pulls: 0 of maximum 512
  ```
</details>

ストリームと永続プルコンシューマを作成したら、NATS エンジンを使用してテーブルを作成できます。このためには、`nats_stream`、`nats_consumer_name`、`nats_subjects` を初期化する必要があります。

```SQL
CREATE TABLE nats_jet_stream (
    key UInt64,
    value UInt64
  ) ENGINE NATS 
    SETTINGS  nats_url = 'localhost:4222',
              nats_stream = 'stream_name',
              nats_consumer_name = 'consumer_name',
              nats_subjects = 'stream_subject',
              nats_format = 'JSONEachRow';
```

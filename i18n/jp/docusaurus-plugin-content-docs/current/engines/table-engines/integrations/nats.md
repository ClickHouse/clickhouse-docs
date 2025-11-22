---
description: 'このエンジンにより、ClickHouse を NATS と統合してメッセージサブジェクトを公開・購読し、新しいメッセージを利用可能になり次第処理できます。'
sidebar_label: 'NATS'
sidebar_position: 140
slug: /engines/table-engines/integrations/nats
title: 'NATS テーブルエンジン'
doc_type: 'guide'
---



# NATSテーブルエンジン {#redisstreams-engine}

このエンジンは、ClickHouseを[NATS](https://nats.io/)と統合します。

`NATS`では以下のことができます:

- メッセージサブジェクトの公開または購読
- 新しいメッセージが利用可能になり次第の処理


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

必須パラメータ:

- `nats_url` – host:port(例: `localhost:5672`)。
- `nats_subjects` – NATSテーブルがサブスクライブ/パブリッシュするサブジェクトのリスト。`foo.*.bar`や`baz.>`のようなワイルドカードサブジェクトをサポートします。
- `nats_format` – メッセージフォーマット。`JSONEachRow`などのSQL `FORMAT`関数と同じ表記を使用します。詳細については、[フォーマット](../../../interfaces/formats.md)セクションを参照してください。

オプションパラメータ:

- `nats_schema` – フォーマットがスキーマ定義を必要とする場合に使用するパラメータ。例えば、[Cap'n Proto](https://capnproto.org/)では、スキーマファイルへのパスとルート`schema.capnp:Message`オブジェクトの名前が必要です。
- `nats_stream` – NATS JetStreamの既存ストリームの名前。
- `nats_consumer` – NATS JetStreamの既存の永続プルコンシューマーの名前。
- `nats_num_consumers` – テーブルあたりのコンシューマー数。デフォルト: `1`。NATS coreのみで1つのコンシューマーのスループットが不十分な場合は、より多くのコンシューマーを指定してください。
- `nats_queue_group` – NATSサブスクライバーのキューグループの名前。デフォルトはテーブル名です。
- `nats_max_reconnect` – 非推奨で効果はありません。再接続はnats_reconnect_waitタイムアウトで永続的に実行されます。
- `nats_reconnect_wait` – 各再接続試行の間にスリープするミリ秒単位の時間。デフォルト: `5000`。
- `nats_server_list` - 接続用のサーバーリスト。NATSクラスターに接続するために指定できます。
- `nats_skip_broken_messages` - ブロックごとのスキーマ非互換メッセージに対するNATSメッセージパーサーの許容度。デフォルト: `0`。`nats_skip_broken_messages = N`の場合、エンジンは解析できない_N_個のNATSメッセージをスキップします(1メッセージは1行のデータに相当します)。
- `nats_max_block_size` - NATSからデータをフラッシュするためにポーリングで収集される行数。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `nats_flush_interval_ms` - NATSから読み取ったデータをフラッシュするためのタイムアウト。デフォルト: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `nats_username` - NATSユーザー名。
- `nats_password` - NATSパスワード。
- `nats_token` - NATS認証トークン。
- `nats_credential_file` - NATS認証情報ファイルへのパス。
- `nats_startup_connect_tries` - 起動時の接続試行回数。デフォルト: `5`。
- `nats_max_rows_per_message` — 行ベースのフォーマットで1つのNATSメッセージに書き込まれる最大行数。(デフォルト: `1`)。
- `nats_handle_error_mode` — NATSエンジンのエラー処理方法。可能な値: default(メッセージの解析に失敗した場合に例外がスローされます)、stream(例外メッセージと生メッセージが仮想カラム`_error`と`_raw_message`に保存されます)。

SSL接続:


セキュアな接続には `nats_secure = 1` を使用します。
使用しているライブラリのデフォルトの動作では、確立された TLS 接続が十分にセキュアかどうかを検証しません。証明書が期限切れである、自署名である、存在しない、あるいは無効であっても、接続はそのまま許可されます。証明書のより厳密な検証は、将来的に実装される可能性があります。

NATS テーブルへの書き込み:

テーブルが 1 つの subject からのみ読み取る場合、任意の INSERT は同じ subject に publish されます。
一方、テーブルが複数の subject から読み取る場合は、どの subject に publish するかを指定する必要があります。
このため、複数の subject を持つテーブルに対して INSERT を行うときは、`stream_like_engine_insert_queue` を設定する必要があります。
テーブルが読み取っている subject の 1 つを選択し、その subject にデータを publish できます。例えば次のようになります:

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

また、`nats` 関連の設定と併せてフォーマット設定も指定できます。

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

NATS サーバーの設定は、ClickHouse の設定ファイルで行うことができます。
より具体的には、NATS エンジン用の Redis パスワードを追加できます。

```xml
<nats>
    <user>click</user>
    <password>house</password>
    <token>clickhouse</token>
</nats>
```


## Description {#description}

`SELECT`はメッセージの読み取りには特に有用ではありません（デバッグを除く）。各メッセージは一度しか読み取ることができないためです。[マテリアライズドビュー](../../../sql-reference/statements/create/view.md)を使用してリアルタイム処理を行う方が実用的です。これを行うには:

1.  エンジンを使用してNATSコンシューマーを作成し、それをデータストリームとして扱います。
2.  必要な構造を持つテーブルを作成します。
3.  エンジンからデータを変換し、事前に作成したテーブルに格納するマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに接続されると、バックグラウンドでデータの収集が開始されます。これにより、NATSからメッセージを継続的に受信し、`SELECT`を使用して必要な形式に変換することができます。
1つのNATSテーブルには任意の数のマテリアライズドビューを持つことができます。これらはテーブルから直接データを読み取るのではなく、新しいレコードを（ブロック単位で）受信するため、異なる詳細レベル（グループ化・集計ありまたはなし）で複数のテーブルに書き込むことができます。

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

ストリームデータの受信を停止する、または変換ロジックを変更するには、マテリアライズドビューをデタッチします:

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER`を使用してターゲットテーブルを変更する場合は、ターゲットテーブルとビューからのデータの間に不整合が生じないよう、マテリアライズドビューを無効にすることを推奨します。


## 仮想カラム {#virtual-columns}

- `_subject` - NATSメッセージのサブジェクト。データ型: `String`。

`nats_handle_error_mode='stream'`の場合の追加の仮想カラム:

- `_raw_message` - 正常に解析できなかった生メッセージ。データ型: `Nullable(String)`。
- `_error` - 解析失敗時に発生した例外メッセージ。データ型: `Nullable(String)`。

注意: `_raw_message`と`_error`の仮想カラムは、解析中に例外が発生した場合にのみ値が設定されます。メッセージが正常に解析された場合は常に`NULL`です。


## データフォーマットのサポート {#data-formats-support}

NATSエンジンは、ClickHouseでサポートされているすべての[フォーマット](../../../interfaces/formats.md)に対応しています。
1つのNATSメッセージに含まれる行数は、フォーマットが行ベースかブロックベースかによって異なります。

- 行ベースフォーマットの場合、1つのNATSメッセージに含まれる行数は`nats_max_rows_per_message`設定で制御できます。
- ブロックベースフォーマットの場合、ブロックをより小さな部分に分割することはできませんが、1つのブロックに含まれる行数は汎用設定[max_block_size](/operations/settings/settings#max_block_size)で制御できます。


## JetStreamの使用 {#using-jetstream}

NATSエンジンをNATS JetStreamと共に使用する前に、NATSストリームと永続的なプルコンシューマを作成する必要があります。これには、例えば[NATS CLI](https://github.com/nats-io/natscli)パッケージのnatsユーティリティを使用できます:

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
ストリーム stream_name が作成されました

2025-10-03 14:12:51に作成されたストリーム stream_name の情報

                サブジェクト: stream_subject
                レプリカ数: 1
                 ストレージ: File

オプション:

               保持ポリシー: Limits
         確認応答: true
          破棄ポリシー: Old
        重複ウィンドウ: 2m0s
              直接取得: true
       メッセージ削除許可: true
            パージ許可: true
  メッセージ毎のTTL許可: false
          ロールアップ許可: false

制限:

        最大メッセージ数: 無制限
     サブジェクト毎の最大数: 無制限
           最大バイト数: 無制限
             最大保持期間: 無制限
    最大メッセージサイズ: 無制限
       最大コンシューマ数: 無制限

状態:

                メッセージ数: 0
                   バイト数: 0 B
          最初のシーケンス: 0
           最後のシーケンス: 0
        アクティブなコンシューマ数: 0
```

</details>

<details>
<summary>永続的なプルコンシューマの作成</summary>

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
2025-10-03T14:13:51+03:00に作成されたコンシューマ stream_name > consumer_name の情報

設定:

                    名前: consumer_name
               プルモード: true
          配信ポリシー: All
              確認応答ポリシー: Explicit
                確認応答待機時間: 30.00s
           再生ポリシー: Instant
         最大保留確認応答数: 1,000
       最大待機プル数: 512

状態:

  最後に配信されたメッセージ: コンシューマシーケンス: 0 ストリームシーケンス: 0
    確認応答フロア: コンシューマシーケンス: 0 ストリームシーケンス: 0
        未処理の確認応答: 最大1,000のうち0
    再配信されたメッセージ: 0
    未処理のメッセージ: 0
           待機中のプル: 最大512のうち0
```

</details>

ストリームと永続的なプルコンシューマを作成した後、NATSエンジンを使用してテーブルを作成できます。これを行うには、nats_stream、nats_consumer_name、およびnats_subjectsを初期化する必要があります:

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

---
'description': 'The Kafka engine works with Apache Kafka and lets you publish or subscribe
  to data flows, organize fault-tolerant storage, and process streams as they become
  available.'
'sidebar_label': 'Kafka'
'sidebar_position': 110
'slug': '/engines/table-engines/integrations/kafka'
'title': 'Kafka'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Kafka

<CloudNotSupportedBadge/>

:::note
ClickHouse Cloud ユーザーには、[ClickPipes](/integrations/clickpipes) を使用して Kafka データを ClickHouse にストリーミングすることを推奨します。これは、高パフォーマンスの挿入をネイティブにサポートし、取り込みとクラスターリソースを独立してスケーリングできるように、関心の分離を保証します。
:::

このエンジンは [Apache Kafka](http://kafka.apache.org/) で動作します。

Kafka では以下が可能です：

- データフローの発行または購読。
- 障害耐性のあるストレージの整理。
- 利用可能になったストリームの処理。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [ALIAS expr1],
    name2 [type2] [ALIAS expr2],
    ...
) ENGINE = Kafka()
SETTINGS
    kafka_broker_list = 'host:port',
    kafka_topic_list = 'topic1,topic2,...',
    kafka_group_name = 'group_name',
    kafka_format = 'data_format'[,]
    [kafka_security_protocol = '',]
    [kafka_sasl_mechanism = '',]
    [kafka_sasl_username = '',]
    [kafka_sasl_password = '',]
    [kafka_schema = '',]
    [kafka_num_consumers = N,]
    [kafka_max_block_size = 0,]
    [kafka_skip_broken_messages = N,]
    [kafka_commit_every_batch = 0,]
    [kafka_client_id = '',]
    [kafka_poll_timeout_ms = 0,]
    [kafka_poll_max_batch_size = 0,]
    [kafka_flush_interval_ms = 0,]
    [kafka_thread_per_consumer = 0,]
    [kafka_handle_error_mode = 'default',]
    [kafka_commit_on_select = false,]
    [kafka_max_rows_per_message = 1];
```

必須パラメーター：

- `kafka_broker_list` — ブローカーのカンマ区切りリスト（例えば、`localhost:9092`）。
- `kafka_topic_list` — Kafka トピックのリスト。
- `kafka_group_name` — Kafka コンシューマーのグループ。読み取りマージンは各グループごとに個別に追跡されます。クラスターでメッセージが重複しないようにするには、どこでも同じグループ名を使用してください。
- `kafka_format` — メッセージフォーマット。SQL の `FORMAT` 関数と同じ表記を使用します。例：`JSONEachRow`。詳細については、[Formats](../../../interfaces/formats.md) セクションを参照してください。

オプションのパラメーター：

- `kafka_security_protocol` - ブローカーとの通信に使用されるプロトコル。可能な値：`plaintext`、`ssl`、`sasl_plaintext`、`sasl_ssl`。
- `kafka_sasl_mechanism` - 認証に使用する SASL メカニズム。可能な値：`GSSAPI`、`PLAIN`、`SCRAM-SHA-256`、`SCRAM-SHA-512`、`OAUTHBEARER`。
- `kafka_sasl_username` - `PLAIN` および `SASL-SCRAM-..` メカニズムで使用する SASL ユーザー名。
- `kafka_sasl_password` - `PLAIN` および `SASL-SCRAM-..` メカニズムで使用する SASL パスワード。
- `kafka_schema` — フォーマットがスキーマ定義を必要とする場合に使用する必要があるパラメーター。たとえば、[Cap'n Proto](https://capnproto.org/) では、スキーマファイルのパスとルート `schema.capnp:Message` オブジェクトの名前を要求します。
- `kafka_num_consumers` — テーブルごとのコンシューマーの数。1 つのコンシューマーのスループットが不十分な場合は、より多くのコンシューマーを指定してください。全コンシューマーの数はトピック内のパーティションの数を超えてはいけません。なぜなら、1 つのパーティションには 1 つのコンシューマーのみを割り当てることができ、ClickHouse がデプロイされているサーバーの物理コア数を超えてはいけないからです。デフォルト：`1`。
- `kafka_max_block_size` — ポーリングのための最大バッチサイズ（メッセージ単位）。デフォルト：[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `kafka_skip_broken_messages` — スキーマと互換性のないメッセージごとの Kafka メッセージパーサーの耐性。`kafka_skip_broken_messages = N` の場合、エンジンはパースできない *N* の Kafka メッセージをスキップします（メッセージはデータの行に等しい）。デフォルト：`0`。
- `kafka_commit_every_batch` — すべての消費されたおよび処理されたバッチをコミットし、全ブロックを書き込んだ後の単一コミットを避けます。デフォルト：`0`。
- `kafka_client_id` — クライアント識別子。デフォルトは空です。
- `kafka_poll_timeout_ms` — Kafka からの単一ポーリングのタイムアウト。デフォルト：[stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `kafka_poll_max_batch_size` — 単一の Kafka ポーリングでポーリングされる最大メッセージ数。デフォルト：[max_block_size](/operations/settings/settings#max_block_size)。
- `kafka_flush_interval_ms` — Kafka からのデータフラッシュのタイムアウト。デフォルト：[stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `kafka_thread_per_consumer` — 各コンシューマーに独立したスレッドを提供します。有効にすると、各コンシューマーは独立してデータをフラッシュし、並行して処理します（そうでなければ、いくつかのコンシューマーからの行が１つのブロックにまとめられます）。デフォルト：`0`。
- `kafka_handle_error_mode` — Kafka エンジンのエラー処理方法。可能な値：デフォルト（メッセージのパースに失敗した場合は例外がスローされます）、ストリーム（例外メッセージと生のメッセージが仮想カラム `_error` と `_raw_message` に保存されます）。
- `kafka_commit_on_select` — SELECT クエリが実行されたときにメッセージをコミットします。デフォルト：`false`。
- `kafka_max_rows_per_message` — 行ベースのフォーマットの単一 Kafka メッセージで書き込まれる最大行数。デフォルト : `1`。

例：

```sql
  CREATE TABLE queue (
    timestamp UInt64,
    level String,
    message String
  ) ENGINE = Kafka('localhost:9092', 'topic', 'group1', 'JSONEachRow');

  SELECT * FROM queue LIMIT 5;

  CREATE TABLE queue2 (
    timestamp UInt64,
    level String,
    message String
  ) ENGINE = Kafka SETTINGS kafka_broker_list = 'localhost:9092',
                            kafka_topic_list = 'topic',
                            kafka_group_name = 'group1',
                            kafka_format = 'JSONEachRow',
                            kafka_num_consumers = 4;

  CREATE TABLE queue3 (
    timestamp UInt64,
    level String,
    message String
  ) ENGINE = Kafka('localhost:9092', 'topic', 'group1')
              SETTINGS kafka_format = 'JSONEachRow',
                       kafka_num_consumers = 4;
```

<details markdown="1">

<summary>テーブルを作成するための非推奨メソッド</summary>

:::note
新しいプロジェクトではこの方法を使用しないでください。可能であれば、古いプロジェクトは上記の方法に移行してください。
:::

```sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
```

</details>

:::info
Kafka テーブルエンジンは、[default value](/sql-reference/statements/create/table#default_values) を持つカラムをサポートしていません。デフォルト値を持つカラムが必要な場合は、マテリアライズドビューのレベルで追加できます（下記を参照）。
:::

## 説明 {#description}

配信されたメッセージは自動的に追跡されるため、各グループの各メッセージは1 回だけカウントされます。データを二重に取得したい場合は、別のグループ名でテーブルのコピーを作成してください。

グループは柔軟で、クラスターで同期されています。たとえば、10 のトピックとクラスター内に 5 つのテーブルのコピーがある場合、各コピーは 2 つのトピックを取得します。コピーの数が変更されると、トピックは自動的にコピー間で再配分されます。このことについては、http://kafka.apache.org/intro で詳しく読むことができます。

`SELECT` は特にメッセージを読み取るためには便利ではありません（デバッグを除く）、なぜなら各メッセージは 1 回しか読み取れないからです。リアルタイムスレッドをマテリアライズドビューを使用して作成することがより実用的です。そのためには：

1. エンジンを使用して Kafka コンシューマーを作成し、それをデータストリームと見なします。
2. 必要な構造のテーブルを作成します。
3. エンジンからデータを変換し、事前に作成されたテーブルに配置するマテリアライズドビューを作成します。

`MATERIALIZED VIEW` がエンジンに参加すると、バックグラウンドでデータの集計を開始します。これにより、Kafka からメッセージを継続的に受信し、`SELECT` を使用して必要なフォーマットに変換できます。
1 つの Kafka テーブルには、好きなだけのマテリアライズドビューを持つことができ、これらは Kafka テーブルから直接データを読み取ることはなく、新しいレコード（ブロック単位）を受け取ります。この方法で、異なる詳細レベルで複数のテーブルに書き込むことができます（グルーピング - 集約ありおよびなし）。

例：

```sql
  CREATE TABLE queue (
    timestamp UInt64,
    level String,
    message String
  ) ENGINE = Kafka('localhost:9092', 'topic', 'group1', 'JSONEachRow');

  CREATE TABLE daily (
    day Date,
    level String,
    total UInt64
  ) ENGINE = SummingMergeTree(day, (day, level), 8192);

  CREATE MATERIALIZED VIEW consumer TO daily
    AS SELECT toDate(toDateTime(timestamp)) AS day, level, count() as total
    FROM queue GROUP BY day, level;

  SELECT level, sum(total) FROM daily GROUP BY level;
```
パフォーマンスを向上させるために、受信したメッセージは [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size) のサイズのブロックにグループ化されます。ブロックが [stream_flush_interval_ms](/operations/settings/settings.md#stream_flush_interval_ms) ミリ秒以内に形成されなかった場合は、ブロックの完全性に関係なくデータがテーブルにフラッシュされます。

トピックデータの受信を停止するか、変換ロジックを変更するには、マテリアライズドビューを切り離します：

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER` を使用してターゲットテーブルを変更する場合、ターゲットテーブルとビューからのデータ間の不一致を避けるために、マテリアルビューを無効にすることをお勧めします。

## 設定 {#configuration}

GraphiteMergeTree と同様に、Kafka エンジンは ClickHouse 設定ファイルを使用した拡張設定をサポートしています。使用できる設定キーは、グローバル（`<kafka>` の下）とトピックレベル（`<kafka><kafka_topic>` の下）の 2 つです。グローバル設定が最初に適用され、その後トピックレベルの設定が適用されます（存在する場合）。

```xml
  <kafka>
    <!-- Kafka エンジンタイプのすべてのテーブルのグローバル設定オプション -->
    <debug>cgrp</debug>
    <statistics_interval_ms>3000</statistics_interval_ms>

    <kafka_topic>
        <name>logs</name>
        <statistics_interval_ms>4000</statistics_interval_ms>
    </kafka_topic>

    <!-- コンシューマーの設定 -->
    <consumer>
        <auto_offset_reset>smallest</auto_offset_reset>
        <kafka_topic>
            <name>logs</name>
            <fetch_min_bytes>100000</fetch_min_bytes>
        </kafka_topic>

        <kafka_topic>
            <name>stats</name>
            <fetch_min_bytes>50000</fetch_min_bytes>
        </kafka_topic>
    </consumer>

    <!-- プロデューサーの設定 -->
    <producer>
        <kafka_topic>
            <name>logs</name>
            <retry_backoff_ms>250</retry_backoff_ms>
        </kafka_topic>

        <kafka_topic>
            <name>stats</name>
            <retry_backoff_ms>400</retry_backoff_ms>
        </kafka_topic>
    </producer>
  </kafka>
```


利用可能な設定オプションのリストについては、[librdkafka configuration reference](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md) を参照してください。ClickHouse 設定では、ドットの代わりにアンダースコア（`_`）を使用します。たとえば、`check.crcs=true` は `<check_crcs>true</check_crcs>` になります。

### Kerberos サポート {#kafka-kerberos-support}

Kerberos 対応 Kafka を扱うには、`sasl_plaintext` 値を持つ `security_protocol` 子要素を追加します。OS の機能によって Kerberos チケット授与チケットが取得され、キャッシュされていれば十分です。
ClickHouse はキータブファイルを使用して Kerberos 資格情報を管理できます。`sasl_kerberos_service_name`、`sasl_kerberos_keytab` および `sasl_kerberos_principal` 子要素を考慮してください。

例：

```xml
<!-- Kerberos 対応 Kafka -->
<kafka>
  <security_protocol>SASL_PLAINTEXT</security_protocol>
  <sasl_kerberos_keytab>/home/kafkauser/kafkauser.keytab</sasl_kerberos_keytab>
  <sasl_kerberos_principal>kafkauser/kafkahost@EXAMPLE.COM</sasl_kerberos_principal>
</kafka>
```

## 仮想カラム {#virtual-columns}

- `_topic` — Kafka トピック。データ型：`LowCardinality(String)`。
- `_key` — メッセージの鍵。データ型：`String`。
- `_offset` — メッセージのオフセット。データ型：`UInt64`。
- `_timestamp` — メッセージのタイムスタンプ データ型：`Nullable(DateTime)`。
- `_timestamp_ms` — メッセージのミリ秒単位のタイムスタンプ。データ型：`Nullable(DateTime64(3))`。
- `_partition` — Kafka トピックのパーティション。データ型：`UInt64`。
- `_headers.name` — メッセージのヘッダーキーの配列。データ型：`Array(String)`。
- `_headers.value` — メッセージのヘッダー値の配列。データ型：`Array(String)`。

`kafka_handle_error_mode='stream'` の場合の追加仮想カラム：

- `_raw_message` - 正しく解析できなかった生メッセージ。データ型：`String`。
- `_error` - 解析に失敗した際に発生した例外メッセージ。データ型：`String`。

注：`_raw_message` と `_error` の仮想カラムは、解析中の例外の場合にのみ埋められ、メッセージが正常に解析された場合は常に空です。

## データフォーマットのサポート {#data-formats-support}

Kafka エンジンは、ClickHouse でサポートされているすべての [formats](../../../interfaces/formats.md) をサポートしています。
1 つの Kafka メッセージの行数は、フォーマットが行ベースかブロックベースかによって異なります。

- 行ベースのフォーマットの場合、1 つの Kafka メッセージの行数は `kafka_max_rows_per_message` を設定して制御できます。
- ブロックベースのフォーマットの場合、ブロックを小さな部分に分割することはできませんが、1 つのブロックの行数は一般設定 [max_block_size](/operations/settings/settings#max_block_size) で制御できます。

## 提出済みオフセットを ClickHouse Keeper に保存するためのエンジン {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge/>

`allow_experimental_kafka_offsets_storage_in_keeper` が有効になっている場合、Kafka テーブルエンジンには 2 つの設定を指定できます：
 - `kafka_keeper_path` は、ClickHouse Keeper 内のテーブルのパスを指定します
 - `kafka_replica_name` は、ClickHouse Keeper 内のレプリカ名を指定します

どちらの設定も指定するか、どちらも指定しない必要があります。どちらの設定も指定された場合は、新しい実験的な Kafka エンジンが使用されます。この新しいエンジンは、コミットされたオフセットを Kafka に保存することに依存せず、ClickHouse Keeper に保存します。オフセットを Kafka にコミットしようとはしますが、テーブルが作成されるときにのみそのオフセットに依存します。他のすべての状況（テーブルが再起動されたり、エラーから回復された場合）では、ClickHouse Keeper に保存されたオフセットがメッセージの消費を続けるためのオフセットとして使用されます。コミットされたオフセットのほかに、最後のバッチで消費されたメッセージの数も保存されるので、挿入が失敗した場合には、必要に応じて同じ数のメッセージが消費され、重複排除が可能になります。

例：

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/experimental_kafka',
  kafka_replica_name = 'r1'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

または、`uuid` および `replica` マクロを ReplicatedMergeTree と同様に利用する：

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### 既知の制限 {#known-limitations}

新しいエンジンは実験的であるため、まだ本番環境には対応していません。実装の既知の制限がいくつかあります：
 - 最大の制限は、エンジンが直接読み取りをサポートしていないことです。マテリアライズドビューを使用してエンジンから読み取ることと、エンジンに書き込むことは機能しますが、直接読み取りは機能しません。その結果、すべての直接 `SELECT` クエリは失敗します。
 - テーブルを迅速に削除して再作成することや、異なるエンジンに同じ ClickHouse Keeper パスを指定することは問題を引き起こす可能性があります。ベストプラクティスとして、`kafka_keeper_path` に `{uuid}` を使用して衝突するパスを避けることができます。
 - 繰り返し可能な読み取りを行うには、メッセージを単一スレッドの複数パーティションから消費することはできません。これに対して、Kafka コンシューマーは定期的にポーリングして生存状態を維持する必要があります。これらの 2 つの目標の結果として、`kafka_thread_per_consumer` が有効な場合にのみ複数のコンシューマーの作成を許可することにしました。そうでなければ、コンシューマーを定期的にポーリングする際に問題を回避することが非常に複雑になります。
 - 新しいストレージエンジンによって作成されたコンシューマーは [`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md) テーブルには表示されません。

**関連情報**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)

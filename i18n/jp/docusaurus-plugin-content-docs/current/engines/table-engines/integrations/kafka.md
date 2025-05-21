---
description: 'KafkaエンジンはApache Kafkaと連携し、データフローの公開や購読、フォールトトレラントストレージの整理、利用可能になったストリームの処理を可能にします。'
sidebar_label: 'Kafka'
sidebar_position: 110
slug: /engines/table-engines/integrations/kafka
title: 'Kafka'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Kafka

<CloudNotSupportedBadge/>

:::note
ClickHouse Cloudのユーザーは、ClickHouseにストリーミングKafkaデータを取り込むために[ClickPipes](/integrations/clickpipes)を使用することを推奨します。これにより、高性能の挿入がネイティブでサポートされ、データ取り込みとクラスターリソースを独立してスケールさせることができます。
:::

このエンジンは[Apache Kafka](http://kafka.apache.org/)と連携します。

Kafkaを使用すると:

- データフローを公開または購読できます。
- フォールトトレラントストレージを整理できます。
- 利用可能になったストリームを処理できます。

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

必須のパラメータ:

- `kafka_broker_list` — ブローカーのカンマ区切りリスト（例: `localhost:9092`）。
- `kafka_topic_list` — Kafkaトピックのリスト。
- `kafka_group_name` — Kafkaコンシューマーのグループ。読み取りマージンは各グループごとに別々に追跡されます。クラスタ内でメッセージの重複を避けたい場合は、すべての場所で同じグループ名を使用してください。
- `kafka_format` — メッセージフォーマット。SQLの`FORMAT`関数と同じ表記法を使用します（例: `JSONEachRow`）。詳細については、[Formats](../../../interfaces/formats.md)セクションを参照してください。

オプションのパラメータ:

- `kafka_security_protocol` - ブローカーとの通信に使用するプロトコル。可能な値: `plaintext`, `ssl`, `sasl_plaintext`, `sasl_ssl`。
- `kafka_sasl_mechanism` - 認証に使用するSASLメカニズム。可能な値: `GSSAPI`, `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`, `OAUTHBEARER`。
- `kafka_sasl_username` - `PLAIN`および`SASL-SCRAM-..`メカニズムで使用するSASLユーザー名。
- `kafka_sasl_password` - `PLAIN`および`SASL-SCRAM-..`メカニズムで使用するSASLパスワード。
- `kafka_schema` — フォーマットがスキーマ定義を必要とする場合に必ず使用するパラメータ。例えば、[Cap'n Proto](https://capnproto.org/)では、スキーマファイルのパスとルート`schema.capnp:Message`オブジェクトの名前が必要です。
- `kafka_num_consumers` — テーブルごとのコンシューマーの数。一つのコンシューマーのスループットが不足している場合は、より多くのコンシューマーを指定してください。トピック内のパーティション数を超えてはいけません。トピックに対して一つのコンシューマーしか割り当てられず、ClickHouseが展開されているサーバー上の物理コアの数を超えてはなりません。デフォルト: `1`。
- `kafka_max_block_size` — pollにおける最大バッチサイズ（メッセージ単位）。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `kafka_skip_broken_messages` — スキーマと互換性のないメッセージに対するKafkaメッセージパーサーの許容度。`kafka_skip_broken_messages = N`の場合、エンジンは解析できない*N*のKafkaメッセージをスキップします（1メッセージは1行のデータに相当）。デフォルト: `0`。
- `kafka_commit_every_batch` — 全ブロックを書き込んだ後の一回のコミットではなく、消費され処理されたバッチごとにコミットします。デフォルト: `0`。
- `kafka_client_id` — クライアント識別子。デフォルトは空。
- `kafka_poll_timeout_ms` — Kafkaからの単一pollのタイムアウト。デフォルト: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `kafka_poll_max_batch_size` — 単一のKafka pollで取得するメッセージの最大数。デフォルト: [max_block_size](/operations/settings/settings#max_block_size)。
- `kafka_flush_interval_ms` — Kafkaからデータをフラッシュするためのタイムアウト。デフォルト: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `kafka_thread_per_consumer` — 各コンシューマーに独立したスレッドを提供します。有効にすると、各コンシューマーは独立してデータをフラッシュし、並行して処理します（そうでない場合は、複数のコンシューマーからの行が一つのブロックにまとめられます）。デフォルト: `0`。
- `kafka_handle_error_mode` — Kafkaエンジンのエラー処理方法。可能な値: default（メッセージの解析に失敗した場合は例外がスローされます）、stream（例外メッセージおよび生メッセージは仮想カラム`_error`および`_raw_message`に保存されます）。
- `kafka_commit_on_select` — SELECTクエリが実行される時にメッセージをコミットします。デフォルト: `false`。
- `kafka_max_rows_per_message` — 行ベースのフォーマット用に一つのKafkaメッセージに書き込む最大行数。デフォルト: `1`。

例:

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

<summary>テーブル作成のための非推奨メソッド</summary>

:::note
新しいプロジェクトではこの方法を使用しないでください。可能であれば、古いプロジェクトを上記の方法に切り替えてください。
:::

```sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
```

</details>

:::info
Kafkaテーブルエンジンは[デフォルト値](/sql-reference/statements/create/table#default_values)を持つカラムをサポートしていません。デフォルト値を持つカラムが必要な場合は、マテリアライズドビューのレベルで追加できます（以下を参照）。
:::

## 説明 {#description}

配信されたメッセージは自動的に追跡されるため、グループ内の各メッセージは一度だけカウントされます。データを2回取得したい場合は、別のグループ名でテーブルをコピーして作成してください。

グループは柔軟で、クラスター内で同期されます。たとえば、10のトピックと5つのテーブルのコピーがクラスター内にある場合、各コピーには2つのトピックが割り当てられます。コピーの数が変更されると、トピックは自動的にコピー間で再分配されます。詳細については、http://kafka.apache.org/introをお読みください。

`SELECT`はメッセージを読むためには特に便利ではありません（デバッグ以外は）、なぜなら各メッセージは一度しか読むことができないからです。リアルタイムスレッドを作成するには、マテリアライズドビューを使用する方が実用的です。これを行うには:

1. エンジンを使用してKafkaコンシューマーを作成し、データストリームとして考えます。
2. 必要な構造のテーブルを作成します。
3. エンジンからデータを変換し、事前に作成したテーブルに挿入するマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに接続すると、バックグラウンドでデータの収集が始まります。これにより、Kafkaからのメッセージを継続的に受信し、それらを`SELECT`を使用して必要なフォーマットに変換できます。
1つのKafkaテーブルには無限のマテリアライズドビューを持つことができ、これらはKafkaテーブルから直接データを読み込まず、新しいレコード（ブロック単位）を受け取ります。これにより、異なる詳細レベル（集約を伴うグルーピングとそうでないもの）で複数のテーブルに書き込むことができます。

例:

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
パフォーマンスを向上させるために、受信したメッセージは[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)のサイズのブロックにグループ化されます。ブロックが[stream_flush_interval_ms](/operations/settings/settings.md#stream_flush_interval_ms)ミリ秒以内に形成されなかった場合、ブロックの完全性にかかわらずデータがテーブルにフラッシュされます。

トピックデータの受信を停止するか、変換ロジックを変更するには、マテリアライズドビューを切り離します。

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

ターゲットテーブルを`ALTER`を使用して変更したい場合は、ビューとターゲットテーブル間の不一致を避けるためにマテリアルビューを無効にすることをお勧めします。

## 構成 {#configuration}

GraphiteMergeTreeに似て、KafkaエンジンはClickHouse設定ファイルを使用して拡張構成をサポートしています。使用できる構成キーは、グローバル（`<kafka>`の下）とトピックレベル（`<kafka><kafka_topic>`の下）の2つです。グローバル構成が最初に適用され、その後にトピックレベルの構成が適用されます（存在する場合）。

```xml
  <kafka>
    <!-- Kafkaエンジンタイプのすべてのテーブルのためのグローバル構成オプション -->
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

利用可能な設定オプションのリストについては、[librdkafkaの設定リファレンス](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)を参照してください。ClickHouse構成ではドットの代わりにアンダースコア（`_`）を使用します。例えば、`check.crcs=true`は`<check_crcs>true</check_crcs>`となります。

### Kerberosサポート {#kafka-kerberos-support}

Kerberos対応のKafkaを扱うには、`security_protocol`子要素を`sasl_plaintext`の値で追加します。OSの機能によってKerberosチケット授与チケットが取得され、キャッシュされるだけで十分です。
ClickHouseは、keytabファイルを使用してKerberosクレデンシャルを維持できます。`sasl_kerberos_service_name`、`sasl_kerberos_keytab`、および`sasl_kerberos_principal`子要素を考慮してください。

例:

```xml
<!-- Kerberos対応のKafka -->
<kafka>
  <security_protocol>SASL_PLAINTEXT</security_protocol>
  <sasl_kerberos_keytab>/home/kafkauser/kafkauser.keytab</sasl_kerberos_keytab>
  <sasl_kerberos_principal>kafkauser/kafkahost@EXAMPLE.COM</sasl_kerberos_principal>
</kafka>
```

## 仮想カラム {#virtual-columns}

- `_topic` — Kafkaトピック。データ型: `LowCardinality(String)`。
- `_key` — メッセージのキー。データ型: `String`。
- `_offset` — メッセージのオフセット。データ型: `UInt64`。
- `_timestamp` — メッセージのタイムスタンプ。データ型: `Nullable(DateTime)`。
- `_timestamp_ms` — メッセージのタイムスタンプ（ミリ秒）。データ型: `Nullable(DateTime64(3))`。
- `_partition` — Kafkaトピックのパーティション。データ型: `UInt64`。
- `_headers.name` — メッセージのヘッダキーの配列。データ型: `Array(String)`。
- `_headers.value` — メッセージのヘッダ値の配列。データ型: `Array(String)`。

`kafka_handle_error_mode='stream'`の際の追加仮想カラム:

- `_raw_message` - 正常にパースできなかった生メッセージ。データ型: `String`。
- `_error` - 解析に失敗した際に発生した例外メッセージ。データ型: `String`。

注意: `_raw_message`と`_error`の仮想カラムは、解析中に例外が発生した場合のみ埋められ、メッセージが正常に解析された場合は常に空です。

## データフォーマットのサポート {#data-formats-support}

Kafkaエンジンは、ClickHouseでサポートされているすべての[フォーマット](../../../interfaces/formats.md)をサポートしています。
1つのKafkaメッセージの行数は、フォーマットが行ベースかブロックベースかによって異なります:

- 行ベースのフォーマットでは、`kafka_max_rows_per_message`を設定することで一つのKafkaメッセージの行数を制御できます。
- ブロックベースのフォーマットでは、ブロックを小さい部分に分割することはできませんが、1つのブロックの行数は一般設定[max_block_size](/operations/settings/settings#max_block_size)で制御できます。

## ClickHouse Keeperにコミットされたオフセットを保存するためのエンジン {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge/>

`allow_experimental_kafka_offsets_storage_in_keeper`が有効になっている場合、Kafkaテーブルエンジンに追加の2つの設定を指定できます:
 - `kafka_keeper_path`はClickHouse Keeper内のテーブルのパスを指定します
 - `kafka_replica_name`はClickHouse Keeper内のレプリカ名を指定します

いずれの設定も両方とも指定する必要があり、または両方とも指定しない必要があります。両方が指定されると、新しい実験的Kafkaエンジンが使用されます。この新しいエンジンはコミットされたオフセットをKafkaに保存するのではなく、ClickHouse Keeperに保存します。オフセットをKafkaにコミットしようとしますが、テーブルが作成されるときにのみそのオフセットに依存します。それ以外の状況（テーブルが再起動された場合やエラー後に回復された場合）では、ClickHouse Keeperに保存されたオフセットがメッセージの消費を続けるためのオフセットとして使用されます。コミットされたオフセットに加えて、最後のバッチで消費されたメッセージ数も保存されるため、挿入が失敗した場合には、同じ数のメッセージが消費され、必要に応じて重複排除が可能になります。

例:

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/experimental_kafka',
  kafka_replica_name = 'r1'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

または、`uuid`と`replica`マクロをReplicatedMergeTreeに似て使用する場合:

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### 知られている制限 {#known-limitations}

新しいエンジンは実験的であり、まだ本番環境向けではありません。実装にはいくつかの既知の制限があります:
 - 最大の制限は、エンジンが直接読み込みをサポートしていないことです。マテリアライズドビューを使用してエンジンから読み込むことや、エンジンに書き込むことはできますが、直接読み込みはできません。その結果、すべての直接`SELECT`クエリは失敗します。
 - テーブルを迅速に削除して再作成することや、同じClickHouse Keeperのパスを異なるエンジンに指定することは、問題を引き起こす可能性があります。最善のプラクティスとしては、`kafka_keeper_path`で`{uuid}`を使用して、パスの衝突を避けることができます。
 - 繰り返し可能な読み込みを作成するために、単一スレッドで複数のパーティションからメッセージを消費することはできません。一方で、Kafkaコンシューマーは定期的にポーリングされる必要があります。これら二つの目標の結果として、`kafka_thread_per_consumer`が有効な場合のみ複数のコンシューマーの作成が許可され、それ以外の場合はコンシューマーを定期的にポーリングする際に問題を回避するのが難しくなります。
 - 新しいストレージエンジンによって作成されたコンシューマーは、[`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md)テーブルには表示されません。

**関連情報**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)

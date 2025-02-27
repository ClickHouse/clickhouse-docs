---
slug: /engines/table-engines/integrations/kafka
sidebar_position: 110
sidebar_label: Kafka
title: "Kafka"
description: "KafkaエンジンはApache Kafkaと連携し、データフローの公開や購読、フォールトトレラントなストレージの構成、ストリームの処理を行います。"
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Kafka

<CloudNotSupportedBadge/>

:::note
ClickHouse Cloudユーザーは、[ClickPipes](/integrations/clickpipes)を使用してKafkaデータをClickHouseにストリーミングすることを推奨します。これにより、高パフォーマンスの挿入をネイティブにサポートし、データ取り込みとクラスターリソースの独立したスケールの能力を保ちながら、関心の分離が確保されます。
:::

このエンジンは[Apache Kafka](http://kafka.apache.org/)と連携します。

Kafkaを使用すると：

- データフローの公開や購読ができます。
- フォールトトレラントストレージを構成できます。
- ストリームのデータを利用可能になると処理できます。

## テーブルの作成 {#creating-a-table}

``` sql
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

必須パラメータ：

- `kafka_broker_list` — テナントのリスト（例：`localhost:9092`）。
- `kafka_topic_list` — Kafkaトピックのリスト。
- `kafka_group_name` — Kafkaコンシューマのグループ。読み取りマージンは各グループごとに追跡されます。同じメッセージがクラスター内で重複しないようにするには、どこにも同じグループ名を使用してください。
- `kafka_format` — メッセージフォーマット。SQLの`FORMAT`関数と同じ表記を使用します（例：`JSONEachRow`）。詳細については、[フォーマット](../../../interfaces/formats.md)セクションを参照してください。

オプションのパラメータ：

- `kafka_schema` — フォーマットがスキーマ定義を必要とする場合に使用しなければならないパラメータ。たとえば、[Cap'n Proto](https://capnproto.org/)ではスキーマファイルのパスとルートの `schema.capnp:Message` オブジェクトの名前が必要です。
- `kafka_num_consumers` — テーブルごとのコンシューマの数。1つのコンシューマのスループットが不十分な場合は、より多くのコンシューマを指定します。総コンシューマ数はトピック内のパーティション数を超えてはならず、ClickHouseがデプロイされているサーバーの物理コア数を超えてはなりません。デフォルト：`1`。
- `kafka_max_block_size` — ポーリングの最大バッチサイズ（メッセージ数）。デフォルト：[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `kafka_skip_broken_messages` — スキーマ非互換メッセージに対するKafkaメッセージパーサの許容度。`kafka_skip_broken_messages = N` の場合、エンジンは解析できない*K* Kafkaメッセージ（メッセージはデータの行に等しい）をスキップします。デフォルト：`0`。
- `kafka_commit_every_batch` — 1つのブロックを書き込んだ後の単一コミットの代わりに、消費されたすべてのバッチをコミットします。デフォルト：`0`。
- `kafka_client_id` — クライアント識別子。デフォルトは空です。
- `kafka_poll_timeout_ms` — Kafkaからの単一ポーリングのタイムアウト。デフォルト：[stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `kafka_poll_max_batch_size` — 単一のKafkaポーリングで取得される最大メッセージ数。デフォルト：[max_block_size](../../../operations/settings/settings.md#setting-max_block_size)。
- `kafka_flush_interval_ms` — Kafkaからのデータフラッシングのタイムアウト。デフォルト：[stream_flush_interval_ms](../../../operations/settings/settings.md#stream-flush-interval-ms)。
- `kafka_thread_per_consumer` — 各コンシューマに独立したスレッドを提供します。有効にすると、各コンシューマは独立してデータをフラッシュし、並行して処理します（そうでなければ、複数のコンシューマの行が1つのブロックを形成するために圧縮されます）。デフォルト：`0`。
- `kafka_handle_error_mode` — Kafkaエンジンのエラー処理方法。可能な値：デフォルト（メッセージの解析に失敗すると例外がスローされます）、ストリーム（例外メッセージと生のメッセージは仮想カラム `_error` と `_raw_message` に保存されます）。
- `kafka_commit_on_select` — セレクトクエリが行われるときにメッセージをコミットします。デフォルト：`false`。
- `kafka_max_rows_per_message` — 行ベースフォーマットの1つのKafkaメッセージ内に書き込まれる最大行数。デフォルト: `1`。

例：

``` sql
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

<summary>テーブルを作成するための廃止された方法</summary>

:::note
新しいプロジェクトではこの方法を使用しないでください。可能であれば、古いプロジェクトを上記の方法に切り替えてください。
:::

``` sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size, kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
```

</details>

:::info
Kafkaテーブルエンジンは[デフォルト値](../../../sql-reference/statements/create/table.md#default_value)を持つカラムをサポートしていません。デフォルト値を持つカラムが必要な場合は、マテリアライズドビューのレベルで追加できます（以下を参照）。
:::

## 説明 {#description}

送信されたメッセージは自動的に追跡されるため、グループ内の各メッセージは一度だけカウントされます。データを二度取得したい場合は、別のグループ名でテーブルのコピーを作成してください。

グループは柔軟で、クラスター内で同期されます。たとえば、10のトピックと5つのテーブルのコピーがある場合、各コピーは2つのトピックを受け取ります。コピーの数が変更されると、トピックは自動的にコピー間で再配布されます。この点については、http://kafka.apache.org/introで詳しく読むことができます。

`SELECT`はメッセージを読み取るためには特に便利ではありません（デバッグ以外の目的では）、なぜなら各メッセージは一度しか読み取れないからです。リアルタイムスレッドをマテリアライズドビューを使用して作成する方が実用的です。これを行うには：

1. エンジンを使用してKafkaコンシューマを作成し、それをデータストリームと見なします。
2. 望ましい構造でテーブルを作成します。
3. エンジンからデータを変換し、以前に作成したテーブルに格納するマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに結合されると、バックグラウンドでデータの収集が開始されます。これにより、Kafkaから継続的にメッセージを受け取り、`SELECT`を使用して必要なフォーマットに変換することができます。
1つのKafkaテーブルには、必要に応じてマテリアライズドビューを作成できます。これらはKafkaテーブルから直接データを読み取るのではなく、新しいレコード（ブロック単位）を受け取ります。このようにして、異なる詳細レベルを持つ複数のテーブルに書き込むことができます（グルーピング - 集約ありおよびなし）。

例：

``` sql
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
パフォーマンスを向上させるために、受信したメッセージは[ max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)のサイズのブロックにグループ化されます。ブロックが[stream_flush_interval_ms](../../../operations/settings/settings.md/#stream-flush-interval-ms)ミリ秒以内に形成されていない場合、データはブロックの完成度にかかわらずテーブルにフラッシュされます。

トピックデータの受信を停止するか、変換ロジックを変更するには、マテリアライズドビューを切り離します：

``` sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER`を使用してターゲットテーブルを変更したい場合は、ターゲットテーブルとビューのデータ間の不一致を避けるために、マテリアルビューを無効にすることをお勧めします。

## 設定 {#configuration}

GraphiteMergeTreeに似て、KafkaエンジンはClickHouse設定ファイルを使用して拡張設定をサポートします。使用できる設定キーは2つあり、グローバル（`<kafka>`の下）とトピックレベル（`<kafka><kafka_topic>`の下）です。グローバル設定は最初に適用され、その後トピックレベルの設定が適用されます（存在する場合）。

``` xml
  <kafka>
    <!-- Kafkaエンジンタイプのすべてのテーブルに対するグローバル設定オプション -->
    <debug>cgrp</debug>
    <statistics_interval_ms>3000</statistics_interval_ms>

    <kafka_topic>
        <name>logs</name>
        <statistics_interval_ms>4000</statistics_interval_ms>
    </kafka_topic>

    <!-- コンシューマの設定 -->
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

    <!-- プロデューサの設定 -->
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

利用可能な設定オプションのリストについては、[librdkafka設定リファレンス](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)を参照してください。ClickHouse設定内ではドットの代わりにアンダースコア（`_`）を使用します。たとえば、`check.crcs=true`は`<check_crcs>true</check_crcs>`になります。

### Kerberosサポート {#kafka-kerberos-support}

Kerberos対応のKafkaを扱うには、`security_protocol`の子要素を`sasl_plaintext`の値に設定します。Kerberosチケット保障チケットが取得され、OS機能によってキャッシュされている場合で十分です。
ClickHouseは、keytabファイルを使用してKerberos資格情報を維持することができます。`sasl_kerberos_service_name`, `sasl_kerberos_keytab` и `sasl_kerberos_principal`の子要素を考慮してください。

例：

``` xml
  <!-- Kerberos対応のKafka -->
  <kafka>
    <security_protocol>SASL_PLAINTEXT</security_protocol>
	<sasl_kerberos_keytab>/home/kafkauser/kafkauser.keytab</sasl_kerberos_keytab>
	<sasl_kerberos_principal>kafkauser/kafkahost@EXAMPLE.COM</sasl_kerberos_principal>
  </kafka>
```

## 仮想カラム {#virtual-columns}

- `_topic` — Kafkaトピック。データタイプ：`LowCardinality(String)`。
- `_key` — メッセージのキー。データタイプ：`String`。
- `_offset` — メッセージのオフセット。データタイプ：`UInt64`。
- `_timestamp` — メッセージのタイムスタンプ。データタイプ：`Nullable(DateTime)`。
- `_timestamp_ms` — メッセージのミリ秒タイムスタンプ。データタイプ：`Nullable(DateTime64(3))`。
- `_partition` — Kafkaトピックのパーティション。データタイプ：`UInt64`。
- `_headers.name` — メッセージのヘッダーキーの配列。データタイプ：`Array(String)`。
- `_headers.value` — メッセージのヘッダー値の配列。データタイプ：`Array(String)`。

`kafka_handle_error_mode='stream'`時の追加仮想カラム：

- `_raw_message` - 正しく解析できなかった生のメッセージ。データタイプ：`String`。
- `_error` - 解析中に発生した例外メッセージ。データタイプ：`String`。

注意：`_raw_message`および`_error`の仮想カラムは、解析中に例外が発生した場合のみ埋められ、メッセージが正常に解析された場合は常に空です。

## サポートされるデータフォーマット {#data-formats-support}

KafkaエンジンはClickHouseでサポートされているすべての[フォーマット](../../../interfaces/formats.md)をサポートします。
1つのKafkaメッセージ内の行数は、フォーマットが行ベースかブロックベースかによって異なります：

- 行ベースフォーマットの場合、1つのKafkaメッセージ内の行数は`kafka_max_rows_per_message`を設定することで制御できます。
- ブロックベースフォーマットの場合は、ブロックを小さな部分に分けることはできませんが、1つのブロック内の行数は一般設定の[max_block_size](../../../operations/settings/settings.md#setting-max_block_size)で制御できます。

## ClickHouse Keeperにコミットされたオフセットを保存するためのエンジン {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge/>

`allow_experimental_kafka_offsets_storage_in_keeper`が有効になっている場合、Kafkaテーブルエンジンに2つの追加設定を指定できます：
 - `kafka_keeper_path`は、ClickHouse Keeper内のテーブルへのパスを指定します。
 - `kafka_replica_name`は、ClickHouse Keeper内のレプリカ名を指定します。

どちらの設定も指定する必要があり、ない場合は両方とも指定しなければなりません。両方の設定が指定されている場合、新しい実験的なKafkaエンジンが使用されます。この新しいエンジンは、コミットされたオフセットをKafkaに保存するのではなく、ClickHouse Keeperに保存します。オフセットをKafkaにコミットしようとしますが、テーブルが作成されたときのみそれらのオフセットに依存します。それ以外の状況（テーブルが再起動されたり、エラーから復旧したりするとき）では、ClickHouse Keeperに保存されたオフセットがメッセージを消費し続けるために使用されます。コミットされたオフセットの他にも、前回のバッチで消費されたメッセージ数も保存されるため、挿入が失敗した場合、必要に応じて重複排除を可能にするために同じ量のメッセージが消費されます。

例：

``` sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/experimental_kafka',
  kafka_replica_name = 'r1'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

または、`uuid`および`replica`マクロをReplicatedMergeTreeに似た方法で利用するためには：

``` sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### 既知の制限 {#known-limitations}

新しいエンジンは実験的であり、まだプロダクション準備が整っていません。実装にはいくつかの知られている制限があります：
 - 最大の制限は、エンジンが直接読み取りをサポートしていないことです。エンジンからの読み取りとマテリアライズドビューへの書き込みは機能しますが、直接読み取りは機能しません。その結果、すべての直接`SELECT`クエリは失敗します。
 - テーブルを迅速に削除したり再作成したりすることや、同じClickHouse Keeperパスを異なるエンジンに指定することは問題を引き起こす可能性があります。ベストプラクティスとして、`kafka_keeper_path`に`{uuid}`を使用してパスの衝突を避けることができます。
 - 再現可能な読み取りを行うために、メッセージは単一スレッドで複数のパーティションから消費することはできません。一方、Kafkaコンシューマは定期的にポーリングされて生存させる必要があります。これら2つの目的の結果、`kafka_thread_per_consumer`が有効な場合にのみ複数のコンシューマを作成できるように決定しました。そうでなければ、コンシューマを定期的にポーリングする際の問題を回避することが非常に複雑になります。
 - 新しいストレージエンジンによって作成されたコンシューマは[`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md)テーブルに表示されません。

**参照**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](../../../operations/server-configuration-parameters/settings.md#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)

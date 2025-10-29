---
'description': 'Kafka テーブルエンジンは Apache Kafka を使用して作品を発行し、データフローに公開または購読し、フォールトトレラントストレージを整理し、ストリームが利用可能になると処理することができます。'
'sidebar_label': 'Kafka'
'sidebar_position': 110
'slug': '/engines/table-engines/integrations/kafka'
'title': 'Kafka テーブルエンジン'
'keywords':
- 'Kafka'
- 'table engine'
'doc_type': 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Kafka テーブルエンジン

:::note
ClickHouse Cloud を利用している場合は、[ClickPipes](/integrations/clickpipes) の使用をお勧めします。ClickPipes はプライベートネットワーク接続をネイティブにサポートし、独立してインジェストとクラスターリソースをスケーリングし、ClickHouse へのストリーミング Kafka データの包括的なモニタリングを提供します。
:::

- データフローを公開または購読します。
- フォールトトレラントストレージを構成します。
- 利用可能になったストリームを処理します。

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

必要なパラメータ:

- `kafka_broker_list` — ブローカーのカンマ区切りリスト（例: `localhost:9092`）。
- `kafka_topic_list` — Kafka トピックのリスト。
- `kafka_group_name` — Kafka 消費者のグループ。読み取りマージンは各グループごとに個別に追跡されます。メッセージがクラスター内で重複しないようにするには、どこでも同じグループ名を使用してください。
- `kafka_format` — メッセージ形式です。`FORMAT` 関数と同じ表記法を使用し、例えば `JSONEachRow` などです。詳細については、[Formats](../../../interfaces/formats.md) セクションを参照してください。

オプションのパラメータ:

- `kafka_security_protocol` - ブローカーとの通信に使用されるプロトコル。可能な値: `plaintext`, `ssl`, `sasl_plaintext`, `sasl_ssl`。
- `kafka_sasl_mechanism` - 認証に使用する SASL メカニズム。可能な値: `GSSAPI`, `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`, `OAUTHBEARER`。
- `kafka_sasl_username` - `PLAIN` および `SASL-SCRAM-..` メカニズムで使用する SASL ユーザー名。
- `kafka_sasl_password` - `PLAIN` および `SASL-SCRAM-..` メカニズムで使用する SASL パスワード。
- `kafka_schema` — スキーマ定義が必要な形式の場合に使用するパラメータ。例えば、[Cap'n Proto](https://capnproto.org/) はスキーマファイルのパスとルートオブジェクト `schema.capnp:Message` の名前が必要です。
- `kafka_num_consumers` — テーブルごとの消費者の数。1 つの消費者のスループットが不十分な場合は、より多くの消費者を指定します。消費者の合計数はトピックのパーティション数を超えてはいけません。なぜなら、各パーティションに割り当てられる消費者は 1 つだけであり、ClickHouse がデプロイされているサーバー上の物理コア数を超えてはいけません。デフォルト: `1`。
- `kafka_max_block_size` — ポーリングの最大バッチサイズ（メッセージ単位）。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `kafka_skip_broken_messages` — 各ブロックでスキーマに互換性のないメッセージに対する Kafka メッセージパーサーの耐性。`kafka_skip_broken_messages = N` の場合、エンジンは解析できない *N* 個の Kafka メッセージをスキップします（メッセージはデータの行に等しい）。デフォルト: `0`。
- `kafka_commit_every_batch` — 全体のブロックを書き込んだ後の単一コミットの代わりに、扱ったバッチごとにコミットします。デフォルト: `0`。
- `kafka_client_id` — クライアント識別子。デフォルトは空です。
- `kafka_poll_timeout_ms` — Kafka からの単一ポーリングのタイムアウト。デフォルト: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `kafka_poll_max_batch_size` — 単一 Kafka ポーリングでポーリングされる最大メッセージ数。デフォルト: [max_block_size](/operations/settings/settings#max_block_size)。
- `kafka_flush_interval_ms` — Kafka からデータをフラッシュするためのタイムアウト。デフォルト: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `kafka_thread_per_consumer` — 各消費者に独立したスレッドを提供します。有効にすると、各消費者はデータを独立して、並行してフラッシュします（そうでなければ、複数の消費者からの行が結合されて 1 つのブロックを形成します）。デフォルト: `0`。
- `kafka_handle_error_mode` — Kafka エンジンのエラー処理方法。可能な値: デフォルト（メッセージの解析に失敗した場合は例外がスローされます）、ストリーム（例外メッセージと生メッセージは仮想カラム `_error` および `_raw_message` に保存されます）、デッドレターキュー（エラーに関するデータが system.dead_letter_queue に保存されます）。
- `kafka_commit_on_select` — SELECT クエリが作成されたときにメッセージをコミットします。デフォルト: `false`。
- `kafka_max_rows_per_message` — 行ベースの形式の 1 つの Kafka メッセージに書き込まれる最大行数。デフォルト: `1`。

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

<summary>テーブルを作成するための非推奨メソッド</summary>

:::note
新しいプロジェクトではこのメソッドを使用しないでください。可能であれば、古いプロジェクトを上記のメソッドに切り替えてください。
:::

```sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
```

</details>

:::info
Kafka テーブルエンジンは [default value](/sql-reference/statements/create/table#default_values) を持つカラムをサポートしていません。デフォルト値を持つカラムが必要な場合は、マテリアライズドビューレベルで追加できます（下記を参照）。
:::

## 説明 {#description}

配信されたメッセージは自動的に追跡されるため、グループ内の各メッセージは一度だけカウントされます。データを二度取得したい場合は、別のグループ名でテーブルのコピーを作成してください。

グループは柔軟でクラスター上で同期されます。たとえば、10 のトピックとクラスター内に 5 つのテーブルのコピーがある場合、各コピーは 2 つのトピックを取得します。コピーの数が変更されると、トピックは自動的にコピー間で再分配されます。これについての詳細は http://kafka.apache.org/intro でお読みください。

各 Kafka トピックには専用の消費者グループを持つことが推奨されており、特に動的にトピックが作成され、削除される環境（例: テストやステージング）では、トピックとグループの間で独占的なペアリングを確保しています。

`SELECT` はメッセージを読み取るには特に便利ではありません（デバッグを除いて）、なぜなら各メッセージは一度だけ読むことができるからです。リアルタイムスレッドを作成することがより実用的です。これを行うには:

1. エンジンを使用して Kafka 消費者を作成し、データストリームとして扱います。
2. 希望の構造を持つテーブルを作成します。
3. エンジンからのデータを変換し、既に作成したテーブルに入れるマテリアライズドビューを作成します。

`MATERIALIZED VIEW` がエンジンに接続すると、バックグラウンドでデータの収集が始まります。これにより、Kafka からメッセージを継続的に受信し、`SELECT` を使用して必要な形式に変換することができます。
1 つの Kafka テーブルには、好きなだけのマテリアライズドビューを持つことができ、それらは Kafka テーブルから直接データを読み取るのではなく、新しいレコード（ブロック単位）を受け取ります。これにより、異なる詳細レベルで複数のテーブルに書き込むことができます（集約を伴うグルーピングありとなしで）。

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
  AS SELECT toDate(toDateTime(timestamp)) AS day, level, count() AS total
  FROM queue GROUP BY day, level;

SELECT level, sum(total) FROM daily GROUP BY level;
```
パフォーマンスを向上させるため、受信したメッセージは [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size) のサイズのブロックにグループ化されます。ブロック内に [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms) ミリ秒の間にブロックが形成されなかった場合、データはブロックの完全性にかかわらずテーブルにフラッシュされます。

トピックデータの受信を停止するか、変換ロジックを変更するには、マテリアライズドビューを切り離します:

```sql
DETACH TABLE consumer;
ATTACH TABLE consumer;
```

`ALTER` を使用してターゲットテーブルを変更したい場合は、ターゲットテーブルとビューからのデータとの不一致を避けるためにマテリアルビューを無効にすることをお勧めします。

## 設定 {#configuration}

GraphiteMergeTree と同様に、Kafka エンジンは ClickHouse 設定ファイルを使用して拡張設定をサポートします。使用できる設定キーは 2 つあり、グローバル（`<kafka>` 以下）とトピックレベル（`<kafka><kafka_topic>` 以下）です。グローバル設定が最初に適用され、その後にトピックレベルの設定が適用されます（存在する場合）。

```xml
<kafka>
  <!-- Global configuration options for all tables of Kafka engine type -->
  <debug>cgrp</debug>
  <statistics_interval_ms>3000</statistics_interval_ms>

  <kafka_topic>
      <name>logs</name>
      <statistics_interval_ms>4000</statistics_interval_ms>
  </kafka_topic>

  <!-- Settings for consumer -->
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

  <!-- Settings for producer -->
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

利用可能な設定オプションのリストについては、[librdkafka 設定リファレンス](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)を参照してください。ClickHouse 設定では、ドットの代わりにアンダースコア（`_`）を使用します。例えば、`check.crcs=true` は `<check_crcs>true</check_crcs>` になります。

### Kerberos サポート {#kafka-kerberos-support}

Kerberos 対応の Kafka に対応するには、`sasl_plaintext` の値を持つ `security_protocol` 子要素を追加します。Kerberos チケットグラントチケットが OS 機能によって取得されキャッシュされるだけで十分です。
ClickHouse は keytab ファイルを使用して Kerberos 資格情報を維持することができます。`sasl_kerberos_service_name`、`sasl_kerberos_keytab`、`sasl_kerberos_principal` の子要素を考慮してください。

例:

```xml
<!-- Kerberos-aware Kafka -->
<kafka>
  <security_protocol>SASL_PLAINTEXT</security_protocol>
  <sasl_kerberos_keytab>/home/kafkauser/kafkauser.keytab</sasl_kerberos_keytab>
  <sasl_kerberos_principal>kafkauser/kafkahost@EXAMPLE.COM</sasl_kerberos_principal>
</kafka>
```

## 仮想カラム {#virtual-columns}

- `_topic` — Kafka トピック。データ型: `LowCardinality(String)`。
- `_key` — メッセージのキー。データ型: `String`。
- `_offset` — メッセージのオフセット。データ型: `UInt64`。
- `_timestamp` — メッセージのタイムスタンプ。データ型: `Nullable(DateTime)`。
- `_timestamp_ms` — メッセージのタイムスタンプ（ミリ秒）。データ型: `Nullable(DateTime64(3))`。
- `_partition` — Kafka トピックのパーティション。データ型: `UInt64`。
- `_headers.name` — メッセージのヘッダーキーの配列。データ型: `Array(String)`。
- `_headers.value` — メッセージのヘッダー値の配列。データ型: `Array(String)`。

`kafka_handle_error_mode='stream'` の場合の追加仮想カラム:

- `_raw_message` - 正しく解析できなかった生メッセージ。データ型: `String`。
- `_error` - 解析中に発生した例外メッセージ。データ型: `String`。

注意: `_raw_message` および `_error` 仮想カラムは、解析中に例外が発生した場合のみ埋め込まれ、メッセージが正常に解析された場合は常に空です。

## データ形式サポート {#data-formats-support}

Kafka エンジンは、ClickHouse でサポートされているすべての [formats](../../../interfaces/formats.md) をサポートしています。
1 つの Kafka メッセージの行数は、フォーマットが行ベースかブロックベースかによって異なります:

- 行ベースの形式では、1 つの Kafka メッセージに含まれる行数は `kafka_max_rows_per_message` を設定することで制御できます。
- ブロックベースの形式では、ブロックを小さな部分に分割することはできませんが、1 つのブロック内の行数は一般的な設定 [max_block_size](/operations/settings/settings#max_block_size) で制御できます。

## ClickHouse Keeper にコミット済みオフセットを保存するためのエンジン {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge/>

`allow_experimental_kafka_offsets_storage_in_keeper` が有効になっている場合、Kafka テーブルエンジンにさらに 2 つの設定を指定できます:
- `kafka_keeper_path` は、ClickHouse Keeper 内のテーブルへのパスを指定します。
- `kafka_replica_name` は、ClickHouse Keeper 内のレプリカ名を指定します。

どちらの設定も指定する必要があります。両方の設定が指定された場合、従来の Kafka エンジンとは独立して動作する、新しい実験的な Kafka エンジンが使用されます。この新しいエンジンは、コミット済みオフセットを Kafka に保存することに依存せず、ClickHouse Keeper に保存します。それでもオフセットを Kafka にコミットしようとしますが、テーブルが作成されるときだけそれらのオフセットに依存します。それ以外の場合（テーブルの再起動やエラー後の回復など）には、ClickHouse Keeper に保存されたオフセットがメッセージを消費し続けるために使用されます。コミットされたオフセットの他に、最後のバッチで消費されたメッセージの数も保存されるため、挿入が失敗した場合、同じ数のメッセージが消費され、必要に応じて重複排除が可能になります。

例:

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### 知られている制限事項 {#known-limitations}

新しいエンジンは実験的なため、まだ本番環境では準備が整っていません。実装の既知の制限事項はいくつかあります:
- 最大の制限は、エンジンが直接読み取りをサポートしていないことです。マテリアライズドビューを使用してエンジンを読み取り、エンジンに書き込むことは機能しますが、直接読み取りは機能しません。その結果、すべての直接 `SELECT` クエリは失敗します。
- テーブルを急速に削除して再作成するか、同じ ClickHouse Keeper パスを異なるエンジンに指定すると問題が発生する可能性があります。ベストプラクティスとして、衝突を避けるために `kafka_keeper_path` で `{uuid}` を使用することをお勧めします。
- 再現性のある読み取りを行うためには、メッセージを単一スレッドで複数のパーティションから消費することはできません。一方で、Kafka 消費者は定期的にポーリングを行う必要があります。これら二つの目的を達成するため、`kafka_thread_per_consumer` が有効な場合にのみ複数の消費者が作成できるようにしています。そうでないと、消費者を定期的にポーリングする際の問題を回避することが非常に複雑になります。
- 新しいストレージエンジンによって作成された消費者は [`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md) テーブルに表示されません。

**関連項目**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)

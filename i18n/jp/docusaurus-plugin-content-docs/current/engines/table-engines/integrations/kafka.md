---
description: 'Kafka テーブルエンジンは Apache Kafka と連携して使用でき、データフローへの publish/subscribe、フォールトトレラントなストレージの構成、およびストリームが利用可能になったタイミングでの順次処理を可能にします。'
sidebar_label: 'Kafka'
sidebar_position: 110
slug: /engines/table-engines/integrations/kafka
title: 'Kafka テーブルエンジン'
keywords: ['Kafka', 'table engine']
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Kafka テーブルエンジン {#kafka-table-engine}

:::tip
ClickHouse Cloud をご利用の場合は、代わりに [ClickPipes](/integrations/clickpipes) の利用を推奨します。ClickPipes は、プライベートネットワーク接続のネイティブサポート、インジェスト処理とクラスタリソースを独立してスケールさせる機能、そして Kafka のストリーミングデータを ClickHouse に取り込むための包括的なモニタリング機能を提供します。
:::

- データフローの publish および subscribe。
- フォールトトレラントなストレージの構成。
- ストリームを利用可能になり次第処理。

## テーブルを作成する {#creating-a-table}

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
    [kafka_max_rows_per_message = 1,]
    [kafka_compression_codec = '',]
    [kafka_compression_level = -1];
```

必須パラメータ:

* `kafka_broker_list` — ブローカーのカンマ区切りリスト（例: `localhost:9092`）。
* `kafka_topic_list` — Kafka トピックのリスト。
* `kafka_group_name` — Kafka コンシューマのグループ。読み取りオフセットはグループごとに個別に追跡されます。クラスター内でメッセージが重複しないようにするには、同じグループ名を一貫して使用してください。
* `kafka_format` — メッセージ形式。SQL の `FORMAT` 関数と同じ表記（`JSONEachRow` など）を使用します。詳細は [Formats](../../../interfaces/formats.md) セクションを参照してください。

オプションパラメータ:


- `kafka_security_protocol` - ブローカーとの通信に使用するプロトコル。指定可能な値: `plaintext`, `ssl`, `sasl_plaintext`, `sasl_ssl`。
- `kafka_sasl_mechanism` - 認証に使用する SASL メカニズム。指定可能な値: `GSSAPI`, `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`, `OAUTHBEARER`。
- `kafka_sasl_username` - `PLAIN` と `SASL-SCRAM-..` メカニズムで使用する SASL ユーザー名。
- `kafka_sasl_password` - `PLAIN` と `SASL-SCRAM-..` メカニズムで使用する SASL パスワード。
- `kafka_schema` — フォーマットがスキーマ定義を必要とする場合に必ず使用しなければならないパラメータ。たとえば [Cap'n Proto](https://capnproto.org/) では、スキーマファイルへのパスと、ルート `schema.capnp:Message` オブジェクトの名前が必要です。
- `kafka_schema_registry_skip_bytes` — エンベロープヘッダー付きのスキーマレジストリを使用する際に、各メッセージの先頭からスキップするバイト数（例: 19 バイトのエンベロープを含む AWS Glue Schema Registry）。範囲: `[0, 255]`。デフォルト: `0`。
- `kafka_num_consumers` — テーブルごとのコンシューマー数。1 つのコンシューマーのスループットが不十分な場合は、より多くのコンシューマーを指定します。総コンシューマー数はトピック内のパーティション数を超えてはなりません。これは 1 つのパーティションには 1 つのコンシューマーしか割り当てられないためであり、さらに ClickHouse がデプロイされているサーバーの物理コア数を超えてはなりません。デフォルト: `1`。
- `kafka_max_block_size` — poll における最大バッチサイズ（メッセージ数）。デフォルト: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `kafka_skip_broken_messages` — 1 ブロックあたりのスキーマ非互換メッセージに対する Kafka メッセージパーサーの許容数。`kafka_skip_broken_messages = N` の場合、エンジンはパースできない Kafka メッセージを *N* 件スキップします（メッセージは 1 行のデータに相当）。デフォルト: `0`。
- `kafka_commit_every_batch` — ブロック全体を書き込んだ後に 1 回だけコミットする代わりに、消費および処理された各バッチごとにコミットします。デフォルト: `0`。
- `kafka_client_id` — クライアント識別子。デフォルトは空。
- `kafka_poll_timeout_ms` — Kafka からの単一 poll のタイムアウト。デフォルト: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `kafka_poll_max_batch_size` — 1 回の Kafka poll で取得されるメッセージの最大数。デフォルト: [max_block_size](/operations/settings/settings#max_block_size)。
- `kafka_flush_interval_ms` — Kafka からのデータをフラッシュするまでのタイムアウト。デフォルト: [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `kafka_thread_per_consumer` — 各コンシューマーに独立したスレッドを割り当てます。有効にすると、各コンシューマーはデータを独立して並列にフラッシュします（無効な場合は、複数コンシューマーからの行が 1 ブロックにまとめられます）。デフォルト: `0`。
- `kafka_handle_error_mode` — Kafka エンジンのエラー処理方法。指定可能な値: `default`（メッセージのパースに失敗した場合に例外を投げる）、`stream`（例外メッセージと生のメッセージを仮想列 `_error` および `_raw_message` に保存する）、`dead_letter_queue`（エラー関連データを `system.dead_letter_queue` に保存する）。
- `kafka_commit_on_select` — `SELECT` クエリが実行されたときにメッセージをコミットします。デフォルト: `false`。
- `kafka_max_rows_per_message` — 行ベースフォーマットにおいて、1 つの Kafka メッセージに書き込まれる最大行数。デフォルト: `1`。
- `kafka_compression_codec` — メッセージ生成に使用される圧縮コーデック。サポートされる値: 空文字列、`none`, `gzip`, `snappy`, `lz4`, `zstd`。空文字列の場合、テーブル側では圧縮コーデックを設定しないため、設定ファイルで指定された値または `librdkafka` のデフォルト値が使用されます。デフォルト: 空文字列。
- `kafka_compression_level` — `kafka_compression_codec` で選択されたアルゴリズムの圧縮レベルパラメータ。値を大きくすると、CPU 使用量と引き換えに圧縮率が向上します。利用可能な範囲はアルゴリズムに依存します: `gzip` 用 `[0-9]`、`lz4` 用 `[0-12]`、`snappy` は `0` のみ、`zstd` 用 `[0-12]`、`-1` = コーデック依存のデフォルト圧縮レベル。デフォルト: `-1`。

Examples:

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
  <summary>非推奨のテーブル作成方法</summary>

  :::note
  新しいプロジェクトではこの方法を使用しないでください。可能であれば、既存のプロジェクトも上記で説明している方法へ移行してください。
  :::

  ```sql
  Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
        [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
  ```
</details>

:::info
Kafka テーブルエンジンは[デフォルト値](/sql-reference/statements/create/table#default_values)を持つカラムをサポートしていません。デフォルト値を持つカラムが必要な場合は、マテリアライズドビュー側で追加できます（下記参照）。
:::


## 説明 {#description}

配信されたメッセージは自動的に追跡されるため、グループ内の各メッセージは 1 回だけカウントされます。データを 2 回取得したい場合は、別のグループ名でテーブルのコピーを作成してください。

グループは柔軟で、クラスタ内で同期されます。たとえば、クラスタ内に 10 個のトピックと 5 個のテーブルのコピーがある場合、各コピーは 2 個のトピックを受け持ちます。コピー数が変化すると、トピックはコピー間で自動的に再分配されます。詳細については [http://kafka.apache.org/intro](http://kafka.apache.org/intro) を参照してください。

各 Kafka トピックに専用のコンシューマーグループを用意し、トピックとグループの間で排他的な対応関係を維持することを推奨します。特に、テスト環境やステージング環境など、トピックが動的に作成および削除される可能性がある場合は重要です。

`SELECT` は、各メッセージが 1 回しか読み取れないため（デバッグ用途を除き）メッセージの読み取りにはあまり有用ではありません。代わりに、マテリアライズドビューを使ってリアルタイム処理フローを構築する方が実用的です。そのためには次のようにします。

1. エンジンを使用して Kafka コンシューマーを作成し、それをデータストリームとして扱います。
2. 必要な構造のテーブルを作成します。
3. エンジンからのデータを変換し、事前に作成しておいたテーブルに投入するマテリアライズドビューを作成します。

`MATERIALIZED VIEW` がエンジンに接続されると、バックグラウンドでデータの収集を開始します。これにより、Kafka から継続的にメッセージを受信し、`SELECT` を使用して必要な形式に変換できます。
1 つの Kafka テーブルには、任意の数のマテリアライズドビューを関連付けることができます。これらは Kafka テーブルから直接データを読み取るのではなく、新しいレコード（ブロック単位）を受け取ります。この方法により、異なる詳細レベル（グループ化・集約あり／なし）の複数のテーブルに書き込むことができます。

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

パフォーマンスを向上させるため、受信したメッセージは [max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size) のサイズのブロックにまとめられます。[stream&#95;flush&#95;interval&#95;ms](/operations/settings/settings#stream_flush_interval_ms) ミリ秒以内にブロックが形成されなかった場合は、ブロックが完全であるかどうかにかかわらず、データはテーブルにフラッシュされます。

トピックデータの受信を停止するか変換ロジックを変更するには、マテリアライズドビューを DETACH します。

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER` を使用してターゲットテーブルを変更する場合は、ターゲットテーブルとビューからのデータとの不整合を避けるため、マテリアライズドビューを無効化することを推奨します。


## 設定 {#configuration}

GraphiteMergeTree と同様に、Kafka エンジンは ClickHouse の設定ファイルを用いた詳細な設定をサポートしています。使用できる設定キーは 2 種類あり、グローバル（`<kafka>` の下）とトピックレベル（`<kafka><kafka_topic>` の下）です。まずグローバル設定が適用され、その後にトピックレベルの設定（存在する場合）が適用されます。

```xml
  <kafka>
    <!-- Kafkaエンジンタイプの全テーブルに対するグローバル設定オプション -->
    <debug>cgrp</debug>
    <statistics_interval_ms>3000</statistics_interval_ms>

    <kafka_topic>
        <name>logs</name>
        <statistics_interval_ms>4000</statistics_interval_ms>
    </kafka_topic>

    <!-- コンシューマー設定 -->
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

    <!-- プロデューサー設定 -->
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

利用可能な設定オプションの一覧については、[librdkafka の configuration reference](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md) を参照してください。ClickHouse の設定では、ドットの代わりにアンダースコア（`_`）を使用します。たとえば、`check.crcs=true` は `<check_crcs>true</check_crcs>` に対応します。


### Kerberos サポート {#kafka-kerberos-support}

Kerberos 対応の Kafka を扱うには、`security_protocol` の子要素として `sasl_plaintext` を追加します。Kerberos のチケット授与チケット (TGT) が OS の機能によって取得・キャッシュされていれば十分です。
ClickHouse は keytab ファイルを使用して Kerberos 資格情報を管理できます。`sasl_kerberos_service_name`、`sasl_kerberos_keytab`、`sasl_kerberos_principal` の子要素を指定します。

例:

```xml
<!-- Kerberos対応Kafka -->
<kafka>
  <security_protocol>SASL_PLAINTEXT</security_protocol>
  <sasl_kerberos_keytab>/home/kafkauser/kafkauser.keytab</sasl_kerberos_keytab>
  <sasl_kerberos_principal>kafkauser/kafkahost@EXAMPLE.COM</sasl_kerberos_principal>
</kafka>
```


## 仮想カラム {#virtual-columns}

- `_topic` — Kafka のトピック。データ型: `LowCardinality(String)`。
- `_key` — メッセージのキー。データ型: `String`。
- `_offset` — メッセージのオフセット。データ型: `UInt64`。
- `_timestamp` — メッセージのタイムスタンプ。データ型: `Nullable(DateTime)`。
- `_timestamp_ms` — メッセージのミリ秒単位のタイムスタンプ。データ型: `Nullable(DateTime64(3))`。
- `_partition` — Kafka トピックのパーティション。データ型: `UInt64`。
- `_headers.name` — メッセージヘッダーのキーの配列。データ型: `Array(String)`。
- `_headers.value` — メッセージヘッダーの値の配列。データ型: `Array(String)`。

`kafka_handle_error_mode='stream'` の場合に追加される仮想カラム:

- `_raw_message` - 正しくパースできなかった生のメッセージ。データ型: `String`。
- `_error` - パース失敗時に発生した例外メッセージ。データ型: `String`。

注意: `_raw_message` と `_error` の仮想カラムに値が入るのは、パース中に例外が発生した場合のみです。メッセージが正常にパースされた場合は常に空になります。

## データ形式のサポート {#data-formats-support}

Kafka エンジンは、ClickHouse でサポートされているすべての[フォーマット](../../../interfaces/formats.md)をサポートします。
1 つの Kafka メッセージ内の行数は、フォーマットが行ベースかブロックベースかによって異なります。

- 行ベースのフォーマットでは、1 つの Kafka メッセージ内の行数は `kafka_max_rows_per_message` の設定で制御できます。
- ブロックベースのフォーマットでは、ブロックをより小さな部分に分割することはできませんが、1 ブロック内の行数は共通設定 [max_block_size](/operations/settings/settings#max_block_size) によって制御できます。

## ClickHouse Keeper にコミット済みオフセットを保存するエンジン {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge />

`allow_experimental_kafka_offsets_storage_in_keeper` が有効な場合、Kafka テーブルエンジンに対してさらに 2 つの設定を指定できます。

* `kafka_keeper_path` は ClickHouse Keeper 内のテーブルパスを指定します
* `kafka_replica_name` は ClickHouse Keeper 内のレプリカ名を指定します

これら 2 つの設定は、両方とも指定するか、どちらも指定しないかのいずれかでなければなりません。両方とも指定された場合、新しい実験的な Kafka エンジンが使用されます。この新しいエンジンは、コミット済みオフセットを Kafka に保存することには依存せず、代わりに ClickHouse Keeper に保存します。引き続き Kafka へのオフセットコミットは試みますが、そのオフセットに依存するのはテーブル作成時のみです。それ以外の状況（テーブルの再起動や、何らかのエラーからの復旧時）では、ClickHouse Keeper に保存されたオフセットが、メッセージの消費を継続するためのオフセットとして使用されます。コミット済みオフセットに加えて、最後のバッチで消費されたメッセージ数も保存するため、挿入に失敗した場合には同じ数のメッセージが再度消費され、必要に応じて重複排除を有効にできます。

例:

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```


### 既知の制限事項 {#known-limitations}

新しいエンジンは実験的なものであり、まだ本番運用の準備ができていません。実装には、いくつか既知の制限があります。

- 最大の制限は、エンジンが直接読み取りをサポートしていないことです。マテリアライズドビューを使ってエンジンから読み取り、エンジンへ書き込むことはできますが、直接読み取りはできません。その結果、すべての直接的な `SELECT` クエリは失敗します。
- テーブルを短時間に繰り返し削除および再作成したり、同じ ClickHouse Keeper のパスを異なるエンジンに指定したりすると問題が発生する可能性があります。ベストプラクティスとして、パスの衝突を回避するために `kafka_keeper_path` に `{uuid}` を使用することを推奨します。
- 再現可能な読み取りを行うためには、1 つのスレッドで複数パーティションからメッセージを消費することはできません。一方で、Kafka コンシューマは生存させるために定期的にポーリングする必要があります。これら 2 つの要件の結果として、`kafka_thread_per_consumer` が有効な場合にのみ複数のコンシューマの作成を許可することにしました。そうでない場合は、コンシューマを定期的にポーリングすることに関する問題を回避するのがあまりにも複雑になるためです。
- 新しいストレージエンジンによって作成されたコンシューマは、[`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md) テーブルには表示されません。

**関連項目**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)
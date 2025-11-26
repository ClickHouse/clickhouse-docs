---
alias: []
description: 'AvroConfluent 形式に関するドキュメント'
input_format: true
keywords: ['AvroConfluent']
output_format: false
slug: /interfaces/formats/AvroConfluent
title: 'AvroConfluent'
doc_type: 'reference'
---

import DataTypesMatching from './_snippets/data-types-matching.md'

| 入力 | 出力 | エイリアス |
| -- | -- | ----- |
| ✔  | ✗  |       |


## 説明 {#description}

[Apache Avro](https://avro.apache.org/) は、効率的なデータ処理のためにバイナリエンコードを使用する、行指向のシリアル化形式です。`AvroConfluent` フォーマットは、[Confluent Schema Registry](https://docs.confluent.io/current/schema-registry/index.html)（または API 互換サービス）を使用してシリアル化された、単一オブジェクト形式の Avro でエンコードされた Kafka メッセージのデコードをサポートします。

各 Avro メッセージにはスキーマ ID が埋め込まれており、ClickHouse は設定済みのスキーマレジストリに問い合わせて該当スキーマを自動的に取得します。一度取得されたスキーマは、パフォーマンス最適化のためにキャッシュされます。



<a id="data-types-matching"></a>
## データ型の対応 {#data-type-mapping}

<DataTypesMatching/>



## フォーマット設定 {#format-settings}

[//]: # "注意 これらの設定はセッション単位でも設定できますが、そのようなケースは一般的ではなく、あまり目立つ形で文書化するとユーザーを混乱させる可能性があります。"

| Setting                                     | Description                                                                                         | Default |
|---------------------------------------------|-----------------------------------------------------------------------------------------------------|---------|
| `input_format_avro_allow_missing_fields`    | スキーマ内にフィールドが見つからない場合にエラーとするのではなく、デフォルト値を使用するかどうか。 | `0`     |
| `input_format_avro_null_as_default`         | NULL 非許容列に `null` 値を挿入する際にエラーとするのではなく、デフォルト値を使用するかどうか。 |   `0`   |
| `format_avro_schema_registry_url`           | Confluent Schema Registry の URL。Basic 認証を利用する場合、URL エンコードした認証情報を URL に直接含めることができます。 |         |



## 例

### スキーマレジストリを使用する

[Kafka table engine](/engines/table-engines/integrations/kafka.md) を使用して Avro 形式でエンコードされた Kafka トピックを読み取るには、`format_avro_schema_registry_url` 設定でスキーマレジストリの URL を指定します。

```sql
CREATE TABLE topic1_stream
(
    field1 String,
    field2 String
)
ENGINE = Kafka()
SETTINGS
kafka_broker_list = 'kafka-broker',
kafka_topic_list = 'topic1',
kafka_group_name = 'group1',
kafka_format = 'AvroConfluent',
format_avro_schema_registry_url = 'http://schema-registry-url';

SELECT * FROM topic1_stream;
```

#### ベーシック認証の使用

スキーマレジストリでベーシック認証が必要な場合（例: Confluent Cloud を使用している場合）、`format_avro_schema_registry_url` 設定で URL エンコードされた認証情報を指定できます。

```sql
CREATE TABLE topic1_stream
(
    field1 String,
    field2 String
)
ENGINE = Kafka()
SETTINGS
kafka_broker_list = 'kafka-broker',
kafka_topic_list = 'topic1',
kafka_group_name = 'group1',
kafka_format = 'AvroConfluent',
format_avro_schema_registry_url = 'https://<username>:<password>@schema-registry-url';
```


## トラブルシューティング

インジェスト処理の進行状況を監視し、Kafka コンシューマーで発生したエラーをデバッグするには、[`system.kafka_consumers` システムテーブル](../../../operations/system-tables/kafka_consumers.md)をクエリできます。デプロイメントに複数のレプリカがある場合（例: ClickHouse Cloud）、[`clusterAllReplicas`](../../../sql-reference/table-functions/cluster.md) テーブル関数を使用する必要があります。

```sql
SELECT * FROM clusterAllReplicas('default',system.kafka_consumers)
ORDER BY assignments.partition_id ASC;
```

スキーマ解決に問題が生じた場合は、[kafkacat](https://github.com/edenhill/kafkacat) と [clickhouse-local](/operations/utilities/clickhouse-local.md) を使用してトラブルシューティングできます。

```bash
$ kafkacat -b kafka-broker  -C -t topic1 -o beginning -f '%s' -c 3 | clickhouse-local   --input-format AvroConfluent --format_avro_schema_registry_url 'http://schema-registry' -S "field1 Int64, field2 String"  -q 'select *  from table'
1 a
2 b
3 c
```

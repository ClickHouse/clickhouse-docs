---
alias: []
description: 'AvroConfluent フォーマットに関するドキュメント'
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


## Description {#description}

[Apache Avro](https://avro.apache.org/)は、効率的なデータ処理のためにバイナリエンコーディングを使用する行指向のシリアライゼーション形式です。`AvroConfluent`形式は、[Confluent Schema Registry](https://docs.confluent.io/current/schema-registry/index.html)（またはAPI互換サービス）を使用してシリアライズされた、単一オブジェクトのAvroエンコードKafkaメッセージのデコードをサポートします。

各AvroメッセージにはスキーマIDが埋め込まれており、ClickHouseは設定されたスキーマレジストリへの問い合わせによって自動的に解決します。解決されたスキーマは、最適なパフォーマンスを実現するためにキャッシュされます。


<a id="data-types-matching"></a>
## データ型のマッピング {#data-type-mapping}

<DataTypesMatching />


## フォーマット設定 {#format-settings}

[//]: # "NOTE These settings can be set at a session-level, but this isn't common and documenting it too prominently can be confusing to users."

| 設定                                  | 説明                                                                                                                    | デフォルト |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------- |
| `input_format_avro_allow_missing_fields` | スキーマ内にフィールドが見つからない場合に、エラーをスローせずにデフォルト値を使用するかどうか。                           | `0`     |
| `input_format_avro_null_as_default`      | NULL非許容カラムに`null`値を挿入する際に、エラーをスローせずにデフォルト値を使用するかどうか。          | `0`     |
| `format_avro_schema_registry_url`        | Confluent Schema RegistryのURL。基本認証の場合、URLエンコードされた認証情報をURLパスに直接含めることができます。 |         |


## 例 {#examples}

### スキーマレジストリの使用 {#using-a-schema-registry}

[Kafkaテーブルエンジン](/engines/table-engines/integrations/kafka.md)を使用してAvroエンコードされたKafkaトピックを読み取るには、`format_avro_schema_registry_url`設定でスキーマレジストリのURLを指定します。

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

#### 基本認証の使用 {#using-basic-authentication}

スキーマレジストリで基本認証が必要な場合(例: Confluent Cloudを使用している場合)、`format_avro_schema_registry_url`設定にURLエンコードされた認証情報を指定できます。

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


## トラブルシューティング {#troubleshooting}

Kafkaコンシューマーの取り込み進捗状況を監視し、エラーをデバッグするには、[`system.kafka_consumers`システムテーブル](../../../operations/system-tables/kafka_consumers.md)をクエリします。デプロイメントに複数のレプリカがある場合(例: ClickHouse Cloud)は、[`clusterAllReplicas`](../../../sql-reference/table-functions/cluster.md)テーブル関数を使用する必要があります。

```sql
SELECT * FROM clusterAllReplicas('default',system.kafka_consumers)
ORDER BY assignments.partition_id ASC;
```

スキーマ解決に関する問題が発生した場合は、[kafkacat](https://github.com/edenhill/kafkacat)と[clickhouse-local](/operations/utilities/clickhouse-local.md)を使用してトラブルシューティングを行うことができます:

```bash
$ kafkacat -b kafka-broker  -C -t topic1 -o beginning -f '%s' -c 3 | clickhouse-local   --input-format AvroConfluent --format_avro_schema_registry_url 'http://schema-registry' -S "field1 Int64, field2 String"  -q 'select *  from table'
1 a
2 b
3 c
```

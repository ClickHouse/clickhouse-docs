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

## 説明 \{#description\}

[Apache Avro](https://avro.apache.org/) は、効率的なデータ処理のためにバイナリエンコードを使用する行指向のシリアル化フォーマットです。`AvroConfluent` フォーマットは、[Confluent Schema Registry](https://docs.confluent.io/current/schema-registry/index.html)（またはその API 互換サービス）を用いてシリアル化された、単一オブジェクト形式の Avro でエンコードされた Kafka メッセージのデコードをサポートします。

各 Avro メッセージにはスキーマ ID が埋め込まれており、ClickHouse は設定済みの Schema Registry に対してクエリを実行することで自動的にスキーマを解決します。一度解決されたスキーマは、パフォーマンスを最適化するためにキャッシュされます。

<a id="data-types-matching"></a>

## データ型のマッピング \{#data-type-mapping\}

<DataTypesMatching/>

## フォーマット設定 \{#format-settings\}

[//]: # "NOTE これらの設定はセッション・レベルでも設定できますが、それが行われることはあまりなく、あまり目立つ形で文書化するとユーザーを混乱させる可能性があります。"

| Setting                                     | Description                                                                                         | Default |
|---------------------------------------------|-----------------------------------------------------------------------------------------------------|---------|
| `input_format_avro_allow_missing_fields`    | スキーマ内にフィールドが見つからない場合にエラーを発生させる代わりに、デフォルト値を使用するかどうか。 | `0`     |
| `input_format_avro_null_as_default`         | NULL を許容しないカラムに `null` 値を挿入する際にエラーを発生させる代わりに、デフォルト値を使用するかどうか。 |   `0`   |
| `format_avro_schema_registry_url`           | Confluent Schema Registry の URL。Basic 認証を利用する場合は、URL エンコードした認証情報を URL のパス部分に直接含めることができます。 |         |

## 例 \{#examples\}

### スキーマレジストリの使用 \{#using-a-schema-registry\}

[Kafka table engine](/engines/table-engines/integrations/kafka.md) を使用して Avro でエンコードされた Kafka トピックを読み取るには、`format_avro_schema_registry_url` 設定を使用してスキーマレジストリの URL を指定します。

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

#### Basic 認証の使用 \{#using-basic-authentication\}

スキーマレジストリが Basic 認証を必要とする場合（例：Confluent Cloud を使用している場合）、`format_avro_schema_registry_url` 設定に URL エンコード済みの認証情報を指定できます。

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

## トラブルシューティング \{#troubleshooting\}

インジェスト処理の進行状況を監視し、Kafka コンシューマーで発生するエラーをデバッグするには、[`system.kafka_consumers` システムテーブル](../../../operations/system-tables/kafka_consumers.md)に対してクエリを実行できます。デプロイメントに複数のレプリカがある場合（例：ClickHouse Cloud）、[`clusterAllReplicas`](../../../sql-reference/table-functions/cluster.md) テーブル関数を使用する必要があります。

```sql
SELECT * FROM clusterAllReplicas('default',system.kafka_consumers)
ORDER BY assignments.partition_id ASC;
```

スキーマの解決で問題が発生した場合は、[kafkacat](https://github.com/edenhill/kafkacat) と [clickhouse-local](/operations/utilities/clickhouse-local.md) を使用してトラブルシューティングできます。

```bash
$ kafkacat -b kafka-broker  -C -t topic1 -o beginning -f '%s' -c 3 | clickhouse-local   --input-format AvroConfluent --format_avro_schema_registry_url 'http://schema-registry' -S "field1 Int64, field2 String"  -q 'select *  from table'
1 a
2 b
3 c
```

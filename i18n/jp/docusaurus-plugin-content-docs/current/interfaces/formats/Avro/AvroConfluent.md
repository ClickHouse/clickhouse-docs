---
'alias': []
'description': 'AvroConfluentフォーマットのDocumentation'
'input_format': true
'keywords':
- 'AvroConfluent'
'output_format': false
'slug': '/interfaces/formats/AvroConfluent'
'title': 'AvroConfluent'
'doc_type': 'reference'
---

import DataTypesMatching from './_snippets/data-types-matching.md'

| 入力  | 出力  | エイリアス |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 {#description}

[Apache Avro](https://avro.apache.org/) は、効率的なデータ処理のためにバイナリエンコーディングを使用する行指向シリアル化フォーマットです。 `AvroConfluent` フォーマットは、[Confluent Schema Registry](https://docs.confluent.io/current/schema-registry/index.html)（またはAPI互換性のあるサービス）を使用してシリアル化された単一オブジェクトのAvroエンコードされたKafkaメッセージのデコードをサポートします。

各Avroメッセージには ClickHouse が自動的に構成されたスキーマレジストリをクエリして解決するスキーマIDが埋め込まれています。一度解決されると、スキーマは最適なパフォーマンスのためにキャッシュされます。

<a id="data-types-matching"></a>
## データ型マッピング {#data-type-mapping}

<DataTypesMatching/>

## フォーマット設定 {#format-settings}

[//]: # "NOTE これらの設定はセッションレベルで設定可能ですが、一般的ではなく、あまり目立たせるとユーザーを混乱させる可能性があります。"

| 設定                                      | 説明                                                                                               | デフォルト |
|-------------------------------------------|----------------------------------------------------------------------------------------------------|---------|
| `input_format_avro_allow_missing_fields`    | スキーマにフィールドが見つからない場合、エラーをスローする代わりにデフォルト値を使用するかどうか。            | `0`     |
| `input_format_avro_null_as_default`         | 非Nullableカラムに `null` 値を挿入する場合、エラーをスローする代わりにデフォルト値を使用するかどうか。   | `0`     |
| `format_avro_schema_registry_url`           | Confluent Schema Registry のURL。基本認証の場合、URLパスにURLエンコードされた資格情報を直接含めることができます。 |         |

## 例 {#examples}

### スキーマレジストリの使用 {#using-a-schema-registry}

[Kafkaテーブルエンジン](/engines/table-engines/integrations/kafka.md)を使用してAvroエンコードされたKafkaトピックを読み取るには、`format_avro_schema_registry_url` 設定を使用してスキーマレジストリのURLを提供します。

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

スキーマレジストリが基本認証を必要とする場合（例：Confluent Cloudを使用している場合）、 `format_avro_schema_registry_url` 設定にURLエンコードされた資格情報を提供できます。

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

Kafkaコンシューマーの取り込み進行状況を監視し、エラーをデバッグするには、[`system.kafka_consumers` システムテーブル](../../../operations/system-tables/kafka_consumers.md)をクエリできます。デプロイメントに複数のレプリカがある場合（例：ClickHouse Cloud）、[`clusterAllReplicas`](../../../sql-reference/table-functions/cluster.md) テーブル関数を使用する必要があります。

```sql
SELECT * FROM clusterAllReplicas('default',system.kafka_consumers)
ORDER BY assignments.partition_id ASC;
```

スキーマ解決の問題が発生した場合は、[kafkacat](https://github.com/edenhill/kafkacat)と[clickhouse-local](/operations/utilities/clickhouse-local.md)を使用してトラブルシューティングできます：

```bash
$ kafkacat -b kafka-broker  -C -t topic1 -o beginning -f '%s' -c 3 | clickhouse-local   --input-format AvroConfluent --format_avro_schema_registry_url 'http://schema-registry' -S "field1 Int64, field2 String"  -q 'select *  from table'
1 a
2 b
3 c
```

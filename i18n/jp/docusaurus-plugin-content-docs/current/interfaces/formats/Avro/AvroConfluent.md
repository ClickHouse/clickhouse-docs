---
title: AvroConfluent
slug: /interfaces/formats/AvroConfluent
keywords: [AvroConfluent]
input_format: true
output_format: false
alias: []
---

import DataTypesMatching from './_snippets/data-types-matching.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 {#description}

AvroConfluent は、[Kafka](https://kafka.apache.org/) および [Confluent Schema Registry](https://docs.confluent.io/current/schema-registry/index.html) と一般的に使用される単一オブジェクトの Avro メッセージのデコードをサポートしています。  
各 Avro メッセージはスキーマ ID を埋め込んでおり、スキーマレジストリの助けを借りて実際のスキーマに解決できます。  
スキーマは、一度解決されるとキャッシュされます。

## データ型のマッチング {#data_types-matching-1}

<DataTypesMatching/>

## 使用例 {#example-usage}

スキーマ解決を迅速に確認するために、[kafkacat](https://github.com/edenhill/kafkacat) を [clickhouse-local](/operations/utilities/clickhouse-local.md) と組み合わせて使用できます。

```bash
$ kafkacat -b kafka-broker  -C -t topic1 -o beginning -f '%s' -c 3 | clickhouse-local   --input-format AvroConfluent --format_avro_schema_registry_url 'http://schema-registry' -S "field1 Int64, field2 String"  -q 'select *  from table'
1 a
2 b
3 c
```

`AvroConfluent` を [Kafka](/engines/table-engines/integrations/kafka.md) で使用するには:

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
kafka_format = 'AvroConfluent';

-- デバッグ目的で、セッション内で format_avro_schema_registry_url を設定できます。
-- この方法は本番環境では使用できません
SET format_avro_schema_registry_url = 'http://schema-registry';

SELECT * FROM topic1_stream;
```

## フォーマット設定 {#format-settings}

スキーマレジストリ URL は [`format_avro_schema_registry_url`](/operations/settings/settings-formats.md/#format_avro_schema_registry_url) で設定されます。

:::note
`format_avro_schema_registry_url` の設定は、再起動後にその値を維持するために `users.xml` に設定する必要があります。また、 `Kafka` テーブルエンジンの `format_avro_schema_registry_url` 設定を使用することもできます。
:::

| 設定                                         | 説明                                                                                               | デフォルト |
|---------------------------------------------|----------------------------------------------------------------------------------------------------|---------|
| `input_format_avro_allow_missing_fields`    | Avro/AvroConfluent フォーマットの場合: スキーマにフィールドが見つからない場合はエラーの代わりにデフォルト値を使用する | `0`     |
| `input_format_avro_null_as_default`         | Avro/AvroConfluent フォーマットの場合: null および非 Nullable カラムの場合にデフォルトを挿入する         |   `0`   |
| `format_avro_schema_registry_url`           | AvroConfluent フォーマットの場合: Confluent Schema Registry の URL。                               |         |

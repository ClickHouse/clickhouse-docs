---
alias: []
description: 'AvroConfluentフォーマットのドキュメント'
input_format: true
keywords: ['AvroConfluent']
output_format: false
slug: /interfaces/formats/AvroConfluent
title: 'AvroConfluent'
---
```

import DataTypesMatching from './_snippets/data-types-matching.md'

| 入力 | 出力 | 別名 |
|------|------|------|
| ✔    | ✗    |      |

## 説明 {#description}

AvroConfluentは、[Kafka](https://kafka.apache.org/)および[Confluent Schema Registry](https://docs.confluent.io/current/schema-registry/index.html)で一般的に使用される単一オブジェクトのAvroメッセージのデコードをサポートします。
各Avroメッセージには、Schema Registryの助けを借りて解決できるスキーマIDが埋め込まれています。
スキーマは解決されるとキャッシュされます。

## データ型の一致 {#data_types-matching-1}

<DataTypesMatching/>

## 使用例 {#example-usage}

スキーマの解決を迅速に確認するには、[kafkacat](https://github.com/edenhill/kafkacat)を使用して、[clickhouse-local](/operations/utilities/clickhouse-local.md)と組み合わせることができます。

```bash
$ kafkacat -b kafka-broker -C -t topic1 -o beginning -f '%s' -c 3 | clickhouse-local --input-format AvroConfluent --format_avro_schema_registry_url 'http://schema-registry' -S "field1 Int64, field2 String" -q 'select * from table'
1 a
2 b
3 c
```

`AvroConfluent`を[Kafka](/engines/table-engines/integrations/kafka.md)で使用するには：

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

-- デバッグ目的で、セッション内でformat_avro_schema_registry_urlを設定できます。
-- この方法は本番環境で使用できません
SET format_avro_schema_registry_url = 'http://schema-registry';

SELECT * FROM topic1_stream;
```

## フォーマット設定 {#format-settings}

Schema RegistryのURLは[`format_avro_schema_registry_url`](/operations/settings/settings-formats.md/#format_avro_schema_registry_url)で構成されています。

:::note
`format_avro_schema_registry_url`を設定すると、再起動後にその値を保持するために`users.xml`に構成する必要があります。また、`Kafka`テーブルエンジンの`format_avro_schema_registry_url`設定を使用することもできます。
:::

| 設定                                          | 説明                                                                                     | デフォルト |
|-----------------------------------------------|------------------------------------------------------------------------------------------|-----------|
| `input_format_avro_allow_missing_fields`     | Avro/AvroConfluentフォーマットに対して: フィールドがスキーマ内に見つからない場合、エラーの代わりにデフォルト値を使用 | `0`       |
| `input_format_avro_null_as_default`          | Avro/AvroConfluentフォーマットに対して: NULLおよび非Nullableカラムの場合にデフォルトを挿入 | `0`       |
| `format_avro_schema_registry_url`            | AvroConfluentフォーマットに対して: Confluent Schema RegistryのURL。                           |           |

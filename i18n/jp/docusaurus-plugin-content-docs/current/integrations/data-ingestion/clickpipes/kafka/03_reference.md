---
sidebar_label: 'リファレンス'
description: 'Kafka ClickPipes がサポートする形式、ソース、配信セマンティクス、認証および実験的機能の詳細'
slug: /integrations/clickpipes/kafka/reference
sidebar_position: 1
title: 'リファレンス'
doc_type: 'reference'
keywords: ['kafka reference', 'clickpipes', 'data sources', 'avro', 'virtual columns']
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import Image from '@theme/IdealImage';
import ExperimentalBadge from '@site/src/theme/badges/ExperimentalBadge';


# リファレンス



## サポートされているデータソース {#supported-data-sources}

| 名前             | ロゴ                                                                                        | タイプ      | ステータス | 説明                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------- | --------- | ------ | ---------------------------------------------------------------------------------------------------- |
| Apache Kafka     | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/> | ストリーミング | 安定版 | ClickPipesを設定して、Apache KafkaからClickHouse Cloudへのストリーミングデータの取り込みを開始できます。     |
| Confluent Cloud  | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>            | ストリーミング | 安定版 | 直接統合を通じて、ConfluentとClickHouse Cloudの統合されたパワーを活用できます。          |
| Redpanda         | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>                                | ストリーミング | 安定版 | ClickPipesを設定して、RedpandaからClickHouse Cloudへのストリーミングデータの取り込みを開始できます。         |
| AWS MSK          | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>        | ストリーミング | 安定版 | ClickPipesを設定して、AWS MSKからClickHouse Cloudへのストリーミングデータの取り込みを開始できます。          |
| Azure Event Hubs | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>      | ストリーミング | 安定版 | ClickPipesを設定して、Azure Event HubsからClickHouse Cloudへのストリーミングデータの取り込みを開始できます。 |
| WarpStream       | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>                | ストリーミング | 安定版 | ClickPipesを設定して、WarpStreamからClickHouse Cloudへのストリーミングデータの取り込みを開始できます。       |


## サポートされているデータ形式 {#supported-data-formats}

サポートされている形式は以下の通りです：

- [JSON](/integrations/data-formats/json/overview)
- [AvroConfluent](/interfaces/formats/AvroConfluent)


## サポートされているデータ型 {#supported-data-types}

### 標準型 {#standard-types-support}

以下の標準ClickHouseデータ型が現在ClickPipesでサポートされています：

- 基本数値型 - \[U\]Int8/16/32/64、Float32/64、およびBFloat16
- 大整数型 - \[U\]Int128/256
- Decimal型
- Boolean
- String
- FixedString
- Date、Date32
- DateTime、DateTime64（UTCタイムゾーンのみ）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- すべてのClickHouse LowCardinality型
- 上記のいずれかの型を使用したキーと値を持つMap（Nullable型を含む）
- 上記のいずれかの型を使用した要素を持つTupleおよびArray（Nullable型を含む、深さ1レベルのみ）
- SimpleAggregateFunction型（AggregatingMergeTreeまたはSummingMergeTreeの宛先用）

### Avro {#avro}

#### サポートされているAvroデータ型 {#supported-avro-data-types}

ClickPipesは、すべてのAvro PrimitiveおよびComplex型、ならびに`time-millis`、`time-micros`、`local-timestamp-millis`、`local_timestamp-micros`、および`duration`を除くすべてのAvro Logical型をサポートしています。Avroの`record`型はTupleに、`array`型はArrayに、`map`はMap（文字列キーのみ）に変換されます。一般的に、[こちら](/interfaces/formats/Avro#data-type-mapping)に記載されている変換が利用可能です。ClickPipesは型変換時にオーバーフローや精度損失をチェックしないため、Avro数値型には正確な型マッチングを使用することを推奨します。
また、すべてのAvro型を`String`カラムに挿入することもでき、その場合は有効なJSON文字列として表現されます。

#### Nullable型とAvro union {#nullable-types-and-avro-unions}

AvroにおけるNullable型は、Tが基本Avro型である`(T, null)`または`(null, T)`のUnionスキーマを使用して定義されます。スキーマ推論時に、このようなunionはClickHouseの「Nullable」カラムにマッピングされます。ClickHouseは`Nullable(Array)`、`Nullable(Map)`、または`Nullable(Tuple)`型をサポートしていないことに注意してください。これらの型に対するAvro null unionは、非nullable版にマッピングされます（Avro Record型はClickHouseの名前付きTupleにマッピングされます）。これらの型に対するAvroの「null」は次のように挿入されます：

- nullのAvro配列に対しては空のArray
- nullのAvro Mapに対しては空のMap
- nullのAvro Recordに対してはすべてデフォルト/ゼロ値を持つ名前付きTuple

#### Variant型のサポート {#variant-type-support}

ClickPipesは以下の状況でVariant型をサポートします：

- Avro Union。Avroスキーマに複数の非null型を持つunionが含まれている場合、ClickPipesは適切なvariant型を推論します。Avroデータに対してVariant型はそれ以外ではサポートされていません。
- JSONフィールド。ソースデータストリーム内の任意のJSONフィールドに対して、Variant型（`Variant(String, Int64, DateTime)`など）を手動で指定できます。ClickPipesが使用する正しいvariantサブタイプを決定する方法により、Variant定義では整数型または日時型のいずれか1つのみを使用できます。たとえば、`Variant(Int64, UInt32)`はサポートされていません。

#### JSON型のサポート {#json-type-support}

ClickPipesは以下の状況でJSON型をサポートします：

- Avro Record型は常にJSONカラムに割り当てることができます。
- Avro StringおよびBytes型は、カラムが実際にJSON Stringオブジェクトを保持している場合、JSONカラムに割り当てることができます。
- 常にJSONオブジェクトであるJSONフィールドは、JSON宛先カラムに割り当てることができます。

固定パスやスキップされたパスを含め、宛先カラムを希望するJSON型に手動で変更する必要があることに注意してください。


## Kafka仮想カラム {#kafka-virtual-columns}

Kafka互換のストリーミングデータソースでは、以下の仮想カラムがサポートされています。新しい宛先テーブルを作成する際、`Add Column`ボタンを使用して仮想カラムを追加できます。

| 名前             | 説明                                     | 推奨データ型 |
| ---------------- | ----------------------------------------------- | --------------------- |
| `_key`           | Kafkaメッセージキー                               | `String`              |
| `_timestamp`     | Kafkaタイムスタンプ(ミリ秒精度)         | `DateTime64(3)`       |
| `_partition`     | Kafkaパーティション                                 | `Int32`               |
| `_offset`        | Kafkaオフセット                                    | `Int64`               |
| `_topic`         | Kafkaトピック                                     | `String`              |
| `_header_keys`   | レコードヘッダー内のキーの並列配列    | `Array(String)`       |
| `_header_values` | レコードヘッダー内の値の並列配列 | `Array(String)`       |
| `_raw_message`   | 完全なKafkaメッセージ                              | `String`              |

`_raw_message`カラムはJSONデータに対してのみ推奨されることに注意してください。
JSON文字列のみが必要なユースケース(下流のマテリアライズドビューにデータを投入するためにClickHouseの[`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions)関数を使用する場合など)では、すべての「非仮想」カラムを削除することでClickPipesのパフォーマンスが向上する可能性があります。

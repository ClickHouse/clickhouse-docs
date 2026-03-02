---
sidebar_label: 'リファレンス'
description: 'Kafka ClickPipes がサポートするフォーマット、ソース、配信セマンティクス、認証、および実験的機能の詳細'
slug: /integrations/clickpipes/kafka/reference
sidebar_position: 1
title: 'リファレンス'
doc_type: 'reference'
keywords: ['Kafka リファレンス', 'ClickPipes', 'データソース', 'avro', '仮想カラム']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import Image from '@theme/IdealImage';
import ExperimentalBadge from '@site/src/theme/badges/ExperimentalBadge';


# リファレンス \{#reference\}

## サポートされているデータソース \{#supported-data-sources\}

| Name                 |Logo|Type| Status          | Description                                                                                          |
|----------------------|----|----|-----------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Apache Kafka ロゴ" style={{width: '3rem', 'height': '3rem'}}/>|Streaming| Stable          | ClickPipes を構成し、Apache Kafka から ClickHouse Cloud へストリーミングデータの取り込みを開始します。     |
| Confluent Cloud      |<Confluentsvg class="image" alt="Confluent Cloud ロゴ" style={{width: '3rem'}}/>|Streaming| Stable          | 直接統合により、Confluent と ClickHouse Cloud を組み合わせた性能を最大限に引き出します。          |
| Redpanda             |<Image img={redpanda_logo} size="logo" alt="Redpanda ロゴ"/>|Streaming| Stable          | ClickPipes を構成し、Redpanda から ClickHouse Cloud へストリーミングデータの取り込みを開始します。         |
| AWS MSK              |<Msksvg class="image" alt="AWS MSK ロゴ" style={{width: '3rem', 'height': '3rem'}}/>|Streaming| Stable          | ClickPipes を構成し、AWS MSK から ClickHouse Cloud へストリーミングデータの取り込みを開始します。          |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Azure Event Hubs ロゴ" style={{width: '3rem'}}/>|Streaming| Stable          | ClickPipes を構成し、Azure Event Hubs から ClickHouse Cloud へストリーミングデータの取り込みを開始します。 |
| WarpStream           |<Warpstreamsvg class="image" alt="WarpStream ロゴ" style={{width: '3rem'}}/>|Streaming| Stable          | ClickPipes を構成し、WarpStream から ClickHouse Cloud へストリーミングデータの取り込みを開始します。       |

## サポートされているデータ形式 \{#supported-data-formats\}

サポートされているデータ形式は次のとおりです：

- [JSON](/integrations/data-formats/json/overview)
- [AvroConfluent](/interfaces/formats/AvroConfluent)

## サポート対象のデータ型 \{#supported-data-types\}

### 標準 \{#standard-types-support\}

現在、ClickPipes でサポートされている標準的な ClickHouse データ型は次のとおりです:

- 基本的な数値型 - \[U\]Int8/16/32/64、Float32/64、および BFloat16
- 拡張整数型 - \[U\]Int128/256
- Decimal 型
- Boolean
- String
- FixedString
- Date, Date32
- DateTime, DateTime64（UTC タイムゾーンのみ）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- すべての ClickHouse LowCardinality 型
- 上記のいずれかの型（Nullable を含む）をキーおよび値に使用する Map
- 上記のいずれかの型（Nullable を含む、1 階層のみ）を要素に使用する Tuple および Array
- SimpleAggregateFunction 型（AggregatingMergeTree または SummingMergeTree を出力先とする場合）

### Avro \{#avro\}

#### サポートされている Avro データ型 \{#supported-avro-data-types\}

ClickPipes は、すべての Avro プリミティブ型および複合型と、`time-millis`、`time-micros`、`local-timestamp-millis`、`local_timestamp-micros`、`duration` を除くすべての Avro 論理型をサポートします。Avro の `record` 型は Tuple に、`array` 型は Array に、`map` 型は Map（文字列キーのみ）に変換されます。一般に、[こちら](/interfaces/formats/Avro#data-type-mapping) に記載されている変換が利用可能です。ClickPipes は型変換時のオーバーフローや精度損失を検査しないため、Avro の数値型については ClickHouse 側の型を正確に対応させることを推奨します。
あるいは、すべての Avro 型を `String` カラムに挿入することも可能であり、その場合は有効な JSON 文字列として表現されます。

#### Nullable 型と Avro Union \{#nullable-types-and-avro-unions\}

Avro における Nullable 型は、ベースとなる Avro 型を T としたときに、`(T, null)` または `(null, T)` という Union スキーマを用いて定義されます。スキーマ推論の過程で、そのような Union は ClickHouse の Nullable カラムにマッピングされます。なお、ClickHouse は
`Nullable(Array)`、`Nullable(Map)`、`Nullable(Tuple)` 型をサポートしていません。これらの型に対する Avro の null Union は、非 Nullable 型にマッピングされます（Avro の Record 型は ClickHouse の名前付き Tuple にマッピングされます）。これらの型に対する Avro の "null" は、次のように挿入されます。

- null の Avro array には空の Array
- null の Avro Map には空の Map
- null の Avro Record には、すべてのフィールドがデフォルト値/ゼロ値を持つ名前付き Tuple

#### Variant 型のサポート \{#variant-type-support\}

ClickPipes は、以下の状況で Variant 型をサポートします。

- Avro Union。Avro スキーマに複数の非 null 型を含む Union がある場合、ClickPipes は
  適切な Variant 型を推論します。これ以外のケースでは、Avro データに対して Variant 型はサポートされません。
- JSON フィールド。ソースデータストリーム内の任意の JSON フィールドに対して、`Variant(String, Int64, DateTime)` のように
  Variant 型を手動で指定できます。複雑なサブタイプ（array/map/tuple）はサポートされません。さらに、ClickPipes が
  使用する適切な Variant のサブタイプを決定する方法の都合上、Variant 定義内で使用できる整数型または DateTime 型は 1 種類のみです。
  たとえば、`Variant(Int64, UInt32)` はサポートされません。

#### JSON 型のサポート \{#json-type-support\}

ClickPipes は、次のような場合に JSON 型をサポートします。

- Avro の Record 型は、常に JSON カラムに割り当てることができます。
- Avro の String 型および Bytes 型は、そのカラムが実際に JSON 文字列オブジェクトを保持している場合、JSON カラムに割り当てることができます。
- 常に JSON オブジェクトである JSON フィールドは、JSON の出力先カラムに割り当てることができます。

固定パスやスキップされたパスも含め、出力先カラムを目的の JSON 型に手動で変更する必要がある点に注意してください。

## Kafka 仮想カラム \{#kafka-virtual-columns\}

Kafka 互換のストリーミングデータソースでは、以下の仮想カラムがサポートされています。新しい宛先テーブルを作成する際は、`Add Column` ボタンを使用して仮想カラムを追加できます。

| Name             | Description                                       | Recommended Data Type  |
|------------------|---------------------------------------------------|------------------------|
| `_key`           | Kafka メッセージキー                              | `String`               |
| `_timestamp`     | Kafka タイムスタンプ（ミリ秒精度）                | `DateTime64(3)`        |
| `_partition`     | Kafka パーティション                              | `Int32`                |
| `_offset`        | Kafka オフセット                                  | `Int64`                |
| `_topic`         | Kafka トピック                                    | `String`               |
| `_header_keys`   | レコードヘッダー内のキーの対応配列                | `Array(String)`        |
| `_header_values` | レコードヘッダー内のヘッダー値の対応配列          | `Array(String)`        |
| `_raw_message`   | Kafka メッセージ全体                              | `String`               |

`_raw_message` カラムは JSON データに対してのみ推奨される点に注意してください。
JSON 文字列だけが必要なユースケース（下流の materialized view にデータを投入するために ClickHouse の [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 関数を使用する場合など）では、すべての「非仮想」カラムを削除することで ClickPipes のパフォーマンスが向上する可能性があります。
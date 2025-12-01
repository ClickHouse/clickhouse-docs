---
sidebar_label: 'リファレンス'
description: 'サポートされているフォーマット、ソース、配信セマンティクス、認証方式、および Kafka ClickPipes で利用可能な実験的機能の詳細を説明します'
slug: /integrations/clickpipes/kafka/reference
sidebar_position: 1
title: 'リファレンス'
doc_type: 'reference'
keywords: ['kafka リファレンス', 'clickpipes', 'データソース', 'avro', '仮想カラム']
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import Image from '@theme/IdealImage';
import ExperimentalBadge from '@site/src/theme/badges/ExperimentalBadge';


# リファレンス {#reference}

## サポートされているデータソース {#supported-data-sources}

| 名前                 |ロゴ|種類| ステータス      | 説明                                                                                                  |
|----------------------|----|----|-----------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Apache Kafkaのロゴ" style={{width: '3rem', 'height': '3rem'}}/>|ストリーミング| 安定版          | ClickPipes を構成して、Apache Kafka から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。     |
| Confluent Cloud      |<Confluentsvg class="image" alt="Confluent Cloudのロゴ" style={{width: '3rem'}}/>|ストリーミング| 安定版          | 直接統合により、Confluent と ClickHouse Cloud を組み合わせた強力な機能を引き出します。          |
| Redpanda             |<Image img={redpanda_logo} size="logo" alt="Redpandaのロゴ"/>|ストリーミング| 安定版          | ClickPipes を構成して、Redpanda から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。         |
| AWS MSK              |<Msksvg class="image" alt="AWS MSKのロゴ" style={{width: '3rem', 'height': '3rem'}}/>|ストリーミング| 安定版          | ClickPipes を構成して、AWS MSK から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。          |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Azure Event Hubsのロゴ" style={{width: '3rem'}}/>|ストリーミング| 安定版          | ClickPipes を構成して、Azure Event Hubs から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。 |
| WarpStream           |<Warpstreamsvg class="image" alt="WarpStreamのロゴ" style={{width: '3rem'}}/>|ストリーミング| 安定版          | ClickPipes を構成して、WarpStream から ClickHouse Cloud へのストリーミングデータの取り込みを開始します。       |

## サポートされているデータ形式 {#supported-data-formats}

サポートされている形式は次のとおりです。

- [JSON](/integrations/data-formats/json/overview)
- [AvroConfluent](/interfaces/formats/AvroConfluent)

## サポートされるデータ型 {#supported-data-types}

### 標準 {#standard-types-support}

現在、ClickPipes では次の標準的な ClickHouse データ型がサポートされています。

- 基本的な数値型 - \[U\]Int8/16/32/64、Float32/64、および BFloat16
- 大きな整数型 - \[U\]Int128/256
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

### Avro {#avro}

#### サポートされている Avro データ型 {#supported-avro-data-types}

ClickPipes は、すべての Avro プリミティブ型および複合型と、`time-millis`、`time-micros`、`local-timestamp-millis`、`local_timestamp-micros`、`duration` を除くすべての Avro 論理型をサポートします。Avro の `record` 型は Tuple に、`array` 型は Array に、`map` 型は Map（キーは文字列のみ）に変換されます。通常、[こちら](/interfaces/formats/Avro#data-type-mapping) に記載されている変換が利用可能です。ClickPipes は型変換時のオーバーフローや精度低下を検証しないため、Avro の数値型については型を厳密に一致させることを推奨します。
また、すべての Avro 型を `String` カラムに挿入することもでき、その場合は有効な JSON 文字列として表現されます。

#### Nullable 型と Avro ユニオン {#nullable-types-and-avro-unions}

Avro における Nullable 型は、ベースとなる Avro 型を T としたとき、`(T, null)` または `(null, T)` の Union スキーマを使用して定義されます。スキーマ推論時には、そのようなユニオンは ClickHouse の "Nullable" カラムにマッピングされます。なお、ClickHouse は
`Nullable(Array)`、`Nullable(Map)`、`Nullable(Tuple)` 型をサポートしません。これらの型に対する Avro の null ユニオンは、非 Nullable 型にマッピングされます（Avro の Record 型は ClickHouse の名前付き Tuple にマッピングされます）。これらの型に対する Avro の "null" は次のように挿入されます：

- null の Avro Array には空の Array
- null の Avro Map には空の Map
- null の Avro Record には、すべての要素がデフォルト値／ゼロ値の名前付き Tuple

#### Variant 型のサポート {#variant-type-support}

ClickPipes は、次の状況で Variant 型をサポートします:

- Avro Unions。Avro スキーマに複数の非 null 型を含む union がある場合、ClickPipes は
  適切な Variant 型を推論します。その他の Avro データでは Variant 型はサポートされません。
- JSON フィールド。ソース データストリーム内の任意の JSON フィールドに対して、`Variant(String, Int64, DateTime)` のように
  Variant 型を手動で指定できます。複合サブタイプ（array/map/tuple）はサポートされません。さらに、ClickPipes が
  使用する正しい Variant サブタイプを判定する方法の都合上、Variant の定義では整数型および datetime 型をそれぞれ 1 種類しか使用できません。
  たとえば、`Variant(Int64, UInt32)` はサポートされません。

#### JSON 型のサポート {#json-type-support}

ClickPipes は、次のような場合に JSON 型をサポートします:

- Avro の Record 型は、常に JSON カラムに割り当てることができます。
- Avro の String 型および Bytes 型は、そのカラムが実際に JSON の String オブジェクトを保持している場合、JSON カラムに割り当てることができます。
- 常に JSON オブジェクトである JSON フィールドは、宛先の JSON カラムに割り当てることができます。

なお、固定パスやスキップしたパスも含めて、宛先カラムを目的の JSON 型に手動で変更する必要があります。

## Kafka 仮想カラム {#kafka-virtual-columns}

Kafka 互換ストリーミングデータソースでは、次の仮想カラムがサポートされています。新しい宛先テーブルを作成する際は、`Add Column` ボタンを使用して仮想カラムを追加できます。

| Name             | Description                                          | Recommended Data Type  |
|------------------|------------------------------------------------------|------------------------|
| `_key`           | Kafka メッセージのキー                               | `String`               |
| `_timestamp`     | Kafka タイムスタンプ（ミリ秒精度）                   | `DateTime64(3)`        |
| `_partition`     | Kafka パーティション                                 | `Int32`                |
| `_offset`        | Kafka オフセット                                     | `Int64`                |
| `_topic`         | Kafka トピック                                       | `String`               |
| `_header_keys`   | レコードヘッダー内のキーの並列配列                  | `Array(String)`        |
| `_header_values` | レコードヘッダー内のヘッダー値の並列配列            | `Array(String)`        |
| `_raw_message`   | Kafka メッセージ全体                                 | `String`               |

`_raw_message` カラムは JSON データに対してのみ推奨される点に注意してください。
JSON 文字列だけが必要なユースケース（たとえば ClickHouse の [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 関数を使用して
下流の materialized view にデータを投入する場合など）では、すべての「非仮想」カラムを削除することで ClickPipes のパフォーマンスが向上する可能性があります。
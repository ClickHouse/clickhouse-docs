---
sidebar_label: 'リファレンス'
description: 'Kafka ClickPipes でサポートされるフォーマット、データソース、配信セマンティクス、認証方式、および実験的機能の詳細'
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

| Name                 |Logo|Type| Status          | Description                                                                                          |
|----------------------|----|----|-----------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Apache Kafka ロゴ" style={{width: '3rem', 'height': '3rem'}}/>|Streaming| 安定版          | ClickPipes を構成し、Apache Kafka のストリーミングデータを ClickHouse Cloud に取り込み始めます。     |
| Confluent Cloud      |<Confluentsvg class="image" alt="Confluent Cloud ロゴ" style={{width: '3rem'}}/>|Streaming| 安定版          | 直接統合を通じて、Confluent と ClickHouse Cloud を組み合わせた強力な機能を活用できます。          |
| Redpanda             |<Image img={redpanda_logo} size="logo" alt="Redpanda ロゴ"/>|Streaming| 安定版          | ClickPipes を構成し、Redpanda のストリーミングデータを ClickHouse Cloud に取り込み始めます。         |
| AWS MSK              |<Msksvg class="image" alt="AWS MSK ロゴ" style={{width: '3rem', 'height': '3rem'}}/>|Streaming| 安定版          | ClickPipes を構成し、AWS MSK のストリーミングデータを ClickHouse Cloud に取り込み始めます。          |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Azure Event Hubs ロゴ" style={{width: '3rem'}}/>|Streaming| 安定版          | ClickPipes を構成し、Azure Event Hubs のストリーミングデータを ClickHouse Cloud に取り込み始めます。 |
| WarpStream           |<Warpstreamsvg class="image" alt="WarpStream ロゴ" style={{width: '3rem'}}/>|Streaming| 安定版          | ClickPipes を構成し、WarpStream のストリーミングデータを ClickHouse Cloud に取り込み始めます。       |



## サポートされているデータ形式 {#supported-data-formats}

サポートされている形式は次のとおりです。
- [JSON](/integrations/data-formats/json/overview)
- [AvroConfluent](/interfaces/formats/AvroConfluent)



## サポートされているデータ型 {#supported-data-types}

### 標準 {#standard-types-support}

現在、ClickPipes でサポートされている標準の ClickHouse データ型は次のとおりです。

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
- 上記のいずれかの型（Nullable を含む、1 レベルの深さのみ）を要素に使用する Tuple および Array
- SimpleAggregateFunction 型（AggregatingMergeTree または SummingMergeTree を出力先とする場合）

### Avro {#avro}

#### サポートされている Avro データ型 {#supported-avro-data-types}
ClickPipes はすべての Avro Primitive 型および Complex 型、さらに Avro Logical 型のうち `time-millis`、`time-micros`、`local-timestamp-millis`、`local_timestamp-micros`、`duration` を除くすべてをサポートします。Avro の `record` 型は Tuple に、`array` 型は Array に、`map` 型は Map（キーは String のみ）に変換されます。一般的に、[こちら](/interfaces/formats/Avro#data-type-mapping) に記載されている変換が利用可能です。数値型については、ClickPipes は型変換時のオーバーフローや精度損失をチェックしないため、Avro の数値型については厳密な型一致を使用することを推奨します。
別の方法として、すべての Avro 型を `String` カラムに挿入することもでき、その場合は有効な JSON 文字列として表現されます。

#### Nullable 型と Avro ユニオン {#nullable-types-and-avro-unions}
Avro における Nullable 型は、ベースとなる Avro 型 T に対して `(T, null)` または `(null, T)` という Union スキーマを用いることで定義されます。スキーマ推論時には、このような Union は ClickHouse の "Nullable" カラムにマッピングされます。ClickHouse は
`Nullable(Array)`、`Nullable(Map)`、`Nullable(Tuple)` 型をサポートしない点に注意してください。これらの型に対する Avro の null Union は非 Nullable 型にマッピングされます（Avro Record 型は ClickHouse の名前付き Tuple にマッピングされます）。これらの型に対する Avro の "null" は次のように挿入されます。
- null の Avro array は空の Array
- null の Avro Map は空の Map
- null の Avro Record は、すべてのフィールドがデフォルト値／ゼロ値である名前付き Tuple

#### Variant 型のサポート {#variant-type-support}
ClickPipes は、次のような場合に Variant 型をサポートします。
- Avro ユニオン。Avro スキーマに複数の非 null 型を含む Union がある場合、ClickPipes は適切な Variant 型を推論します。それ以外の Avro データに対して Variant 型はサポートされません。
- JSON フィールド。ソースデータストリーム内の任意の JSON フィールドに対して、`Variant(String, Int64, DateTime)` のような Variant 型を手動で指定できます。ClickPipes が適切な Variant サブタイプを決定する仕組み上、Variant 定義内で使用できる整数型または datetime 型は 1 種類のみです。たとえば、`Variant(Int64, UInt32)` はサポートされません。

#### JSON 型のサポート {#json-type-support}
ClickPipes は、次のような場合に JSON 型をサポートします。
- Avro Record 型は常に JSON カラムに割り当てることができます。
- Avro String および Bytes 型は、カラムが実際に JSON String オブジェクトを保持している場合に JSON カラムに割り当てることができます。
- 常に JSON オブジェクトである JSON フィールドは、JSON の出力先カラムに割り当てることができます。

なお、出力先カラムについては、固定パスやスキップされたパスを含め、目的の JSON 型に手動で変更する必要があります。



## Kafka 仮想カラム {#kafka-virtual-columns}

Kafka 互換のストリーミングデータソースでは、次の仮想カラムがサポートされています。新しい宛先テーブルを作成する際には、`Add Column` ボタンを使用して仮想カラムを追加できます。

| Name             | Description                                          | Recommended Data Type  |
|------------------|------------------------------------------------------|------------------------|
| `_key`           | Kafka メッセージキー                                 | `String`               |
| `_timestamp`     | Kafka タイムスタンプ（ミリ秒精度）                   | `DateTime64(3)`        |
| `_partition`     | Kafka パーティション                                 | `Int32`                |
| `_offset`        | Kafka オフセット                                     | `Int64`                |
| `_topic`         | Kafka トピック                                       | `String`               |
| `_header_keys`   | レコードヘッダー内のキーの並列配列                   | `Array(String)`        |
| `_header_values` | レコードヘッダー内のヘッダー値の並列配列             | `Array(String)`        |
| `_raw_message`   | Kafka メッセージ全体                                 | `String`               |

`_raw_message` カラムは JSON データに対してのみ使用を推奨します。
JSON 文字列だけが必要なユースケース（ClickHouse の [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 関数を使用して
下流側のマテリアライズドビューにデータを投入する場合など）では、すべての「非仮想」カラムを削除すると ClickPipes のパフォーマンスが向上する可能性があります。

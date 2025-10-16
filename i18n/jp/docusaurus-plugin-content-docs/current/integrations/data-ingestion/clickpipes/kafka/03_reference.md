---
'sidebar_label': 'リファレンス'
'description': 'Kafka ClickPipesによってサポートされているフォーマット、ソース、配信セマンティクス、認証、実験的機能に関する詳細'
'slug': '/integrations/clickpipes/kafka/reference'
'sidebar_position': 1
'title': 'リファレンス'
'doc_type': 'reference'
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import Image from '@theme/IdealImage';
import ExperimentalBadge from '@site/src/theme/badges/ExperimentalBadge';


# 参照

## サポートされているデータソース {#supported-data-sources}

| 名称                   | ロゴ| 種類     | ステータス         | 説明                                                                                                |
|----------------------|----|---------|-------------------|-----------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>| ストリーミング | 安定           | ClickPipes を設定し、Apache Kafka から ClickHouse Cloud にストリーミングデータを取り込み始めます。        |
| Confluent Cloud      |<Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>| ストリーミング | 安定           | Confluent と ClickHouse Cloud の強力な統合を通じて、その力を解き放ちます。                          |
| Redpanda             |<Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>| ストリーミング | 安定           | ClickPipes を設定し、Redpanda から ClickHouse Cloud にストリーミングデータを取り込み始めます。        |
| AWS MSK              |<Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>| ストリーミング | 安定           | ClickPipes を設定し、AWS MSK から ClickHouse Cloud にストリーミングデータを取り込み始めます。         |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>| ストリーミング | 安定           | ClickPipes を設定し、Azure Event Hubs から ClickHouse Cloud にストリーミングデータを取り込み始めます。|
| WarpStream           |<Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>| ストリーミング | 安定           | ClickPipes を設定し、WarpStream から ClickHouse Cloud にストリーミングデータを取り込み始めます。      |

## サポートされているデータ形式 {#supported-data-formats}

サポートされている形式は次の通りです:
- [JSON](/integrations/data-formats/json/overview)
- [AvroConfluent](/interfaces/formats/AvroConfluent)

## サポートされているデータ型 {#supported-data-types}

### 標準 {#standard-types-support}

現在 ClickPipes でサポートされている標準の ClickHouse データ型は次の通りです:

- 基本的な数値型 - \[U\]Int8/16/32/64, Float32/64, および BFloat16
- 大きな整数型 - \[U\]Int128/256
- 小数タイプ
- ブーリアン
- 文字列
- 固定文字列
- 日付、Date32
- 日時、DateTime64（UTC タイムゾーンのみ）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- すべての ClickHouse LowCardinality 型
- 上記の任意の型を使用したキーと値のある Map（Nullable を含む）
- 上記の任意の型を使用した要素を持つ Tuple および Array（Nullable を含む、1 階層の深さのみ）
- SimpleAggregateFunction 型（AggregatingMergeTree または SummingMergeTree の宛先用）

### Avro {#avro}

#### サポートされている Avro データ型 {#supported-avro-data-types}
ClickPipes は、すべての Avro プリミティブおよび複合型、`time-millis`、`time-micros`、`local-timestamp-millis`、`local_timestamp-micros`、および `duration` を除くすべての Avro ロジカル型をサポートしています。Avro `record` 型は Tuple に変換され、`array` 型は Array に、`map` は Map（文字列キーのみ）に変換されます。一般的に、ここにリストされた変換 [here](/interfaces/formats/Avro#data-type-mapping) が利用可能です。ClickPipes は型変換時にオーバーフローや精度損失をチェックしないため、Avro 数値型については厳密な型一致を使用することをお勧めします。
また、すべての Avro 型は `String` カラムに挿入でき、その場合は有効な JSON 文字列として表されます。

#### Nullable 型と Avro ユニオン {#nullable-types-and-avro-unions}
Avro の Nullable 型は、`(T, null)` または `(null, T)` のユニオンスキーマを使用して定義され、ここで T は基本 Avro 型です。スキーマ推論の際には、そのようなユニオンは ClickHouse の「Nullable」カラムにマッピングされます。ClickHouse は `Nullable(Array)`、`Nullable(Map)`、または `Nullable(Tuple)` 型をサポートしないため注意してください。これらの型の Avro null ユニオンは、非 nullable バージョンにマッピングされます（Avro Record 型は ClickHouse の名前付き Tuple にマッピングされます）。これらの型の Avro "null" は次のように挿入されます:
- null の Avro 配列用の空の Array
- null の Avro Map 用の空の Map
- null の Avro Record 用のすべてのデフォルト/ゼロ値を持つ名前付き Tuple

#### Variant 型のサポート {#variant-type-support}
ClickPipes は次の条件下で Variant 型をサポートしています:
- Avro ユニオン。Avro スキーマに複数の非 nullable 型を持つユニオンが含まれている場合、ClickPipes は適切な Variant 型を推測します。それ以外の場合、Avro データに対する Variant 型はサポートされていません。
- JSON フィールド。ソースデータストリームの任意の JSON フィールドに対して手動で Variant 型（例: `Variant(String, Int64, DateTime)`）を指定できます。ClickPipes が正しい Variant サブタイプを判断する方法のため、Variant 定義には整数または日時型が1つだけ使用可能です - 例: `Variant(Int64, UInt32)` はサポートされていません。

#### JSON 型のサポート {#json-type-support}
ClickPipes は次の状況で JSON 型をサポートします:
- Avro Record 型は常に JSON カラムに割り当てることができます。
- Avro String および Bytes 型は、カラムが実際に JSON String オブジェクトを保持している場合に JSON カラムに割り当てることができます。
- 常に JSON オブジェクトである JSON フィールドは JSON 宛先カラムに割り当てることができます。

目的の JSON 型への宛先カラムは手動で変更する必要があることに注意してください。固定またはスキップされたパスを含みます。

## Kafka バーチャルカラム {#kafka-virtual-columns}

次のバーチャルカラムは Kafka 互換のストリーミングデータソースに対してサポートされています。新しい宛先テーブルを作成する際には、`Add Column` ボタンを使用してバーチャルカラムを追加できます。

| 名称              | 説明                                        | 推奨データ型     |
|------------------|-------------------------------------------|------------------|
| `_key`           | Kafka メッセージキー                      | `String`         |
| `_timestamp`     | Kafka タイムスタンプ（ミリ秒精度）        | `DateTime64(3)`  |
| `_partition`     | Kafka パーティション                       | `Int32`          |
| `_offset`        | Kafka オフセット                          | `Int64`          |
| `_topic`         | Kafka トピック                           | `String`         |
| `_header_keys`   | レコードヘッダのキーの並列配列            | `Array(String)`  |
| `_header_values` | レコードヘッダのヘッダの並列配列          | `Array(String)`  |
| `_raw_message`   | 完全な Kafka メッセージ                    | `String`         |

`_raw_message` カラムは JSON データにのみ推奨されることに注意してください。JSON 文字列のみが必要なユースケースでは（ClickHouse の [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 関数を使用して下流のマテリアライズドビューを補充する場合など）、すべての「非バーチャル」カラムを削除すると ClickPipes のパフォーマンスが向上する可能性があります。

---
description: '文字カラムのための LowCardinality 最適化に関するドキュメント'
sidebar_label: 'LowCardinality(T)'
sidebar_position: 42
slug: /sql-reference/data-types/lowcardinality
title: 'LowCardinality(T)'
---


# LowCardinality(T)

他のデータ型の内部表現をディクショナリーエンコードに変更します。

## 構文 {#syntax}

```sql
LowCardinality(data_type)
```

**パラメータ**

- `data_type` — [String](../../sql-reference/data-types/string.md)、[FixedString](../../sql-reference/data-types/fixedstring.md)、[Date](../../sql-reference/data-types/date.md)、[DateTime](../../sql-reference/data-types/datetime.md)、および [Decimal](../../sql-reference/data-types/decimal.md) を除く数値。`LowCardinality` はいくつかのデータ型に対して効率的ではありません。[allow_suspicious_low_cardinality_types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types) 設定の説明を参照してください。

## 説明 {#description}

`LowCardinality` はデータストレージ方式とデータ処理ルールを変更するスーパー構造体です。ClickHouse は `LowCardinality` - カラムに対して [ディクショナリーコーディング](https://en.wikipedia.org/wiki/Dictionary_coder) を適用します。ディクショナリーエンコードされたデータでの操作は、多くのアプリケーションにおける [SELECT](../../sql-reference/statements/select/index.md) クエリのパフォーマンスを大幅に向上させます。

`LowCardinality` データ型の使用効率はデータの多様性に依存します。ディクショナリーに10,000未満の異なる値が含まれている場合、ClickHouse は主にデータの読み取りおよび格納効率が高くなります。ディクショナリーに100,000を超える異なる値が含まれている場合、ClickHouse は通常のデータ型を使用した場合と比較してパフォーマンスが低下することがあります。

文字列を扱う際に `Enum` (../../sql-reference/data-types/enum.md) の代わりに `LowCardinality` を使用することを検討してください。`LowCardinality` は使用時により柔軟性を提供し、同等またはより高い効率をしばしば実現します。

## 例 {#example}

`LowCardinality` カラムを持つテーブルを作成します：

```sql
CREATE TABLE lc_t
(
    `id` UInt16,
    `strings` LowCardinality(String)
)
ENGINE = MergeTree()
ORDER BY id
```

## 関連設定および関数 {#related-settings-and-functions}

設定：

- [low_cardinality_max_dictionary_size](../../operations/settings/settings.md#low_cardinality_max_dictionary_size)
- [low_cardinality_use_single_dictionary_for_part](../../operations/settings/settings.md#low_cardinality_use_single_dictionary_for_part)
- [low_cardinality_allow_in_native_format](../../operations/settings/settings.md#low_cardinality_allow_in_native_format)
- [allow_suspicious_low_cardinality_types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types)
- [output_format_arrow_low_cardinality_as_dictionary](/operations/settings/formats#output_format_arrow_low_cardinality_as_dictionary)

関数：

- [toLowCardinality](../../sql-reference/functions/type-conversion-functions.md#tolowcardinality)

## 関連コンテンツ {#related-content}

- ブログ: [スキーマとコーデックを使用した ClickHouse の最適化](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- ブログ: [ClickHouse における時系列データの扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- [文字列最適化 (ロシア語のビデオプレゼンテーション)](https://youtu.be/rqf-ILRgBdY?list=PL0Z2YDlm0b3iwXCpEFiOOYmwXzVmjJfEt)。 [英語のスライド](https://github.com/ClickHouse/clickhouse-presentations/raw/master/meetup19/string_optimization.pdf)

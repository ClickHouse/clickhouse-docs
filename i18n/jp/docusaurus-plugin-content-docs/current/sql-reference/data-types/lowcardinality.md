---
description: 'Documentation for the LowCardinality optimization for string columns'
sidebar_label: 'LowCardinality(T)'
sidebar_position: 42
slug: '/sql-reference/data-types/lowcardinality'
title: 'LowCardinality(T)'
---




# LowCardinality(T)

他のデータタイプの内部表現を辞書エンコードに変更します。

## Syntax {#syntax}

```sql
LowCardinality(data_type)
```

**Parameters**

- `data_type` — [String](../../sql-reference/data-types/string.md)、[FixedString](../../sql-reference/data-types/fixedstring.md)、[Date](../../sql-reference/data-types/date.md)、[DateTime](../../sql-reference/data-types/datetime.md)、および [Decimal](../../sql-reference/data-types/decimal.md) を除く数値。いくつかのデータタイプでは `LowCardinality` は効率的ではありません。詳細は [allow_suspicious_low_cardinality_types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types) 設定の説明を参照してください。

## Description {#description}

`LowCardinality` はデータのストレージ方法とデータ処理のルールを変更するスーパー構造です。ClickHouse は `LowCardinality` カラムに [辞書コーディング](https://en.wikipedia.org/wiki/Dictionary_coder) を適用します。辞書エンコードされたデータを扱うことで、多くのアプリケーションにおける [SELECT](../../sql-reference/statements/select/index.md) クエリのパフォーマンスが大幅に向上します。

`LowCardinality` データタイプの使用効率は、データの多様性に依存します。辞書が10,000未満の異なる値を含む場合、ClickHouse は主にデータの読み取りおよび保存の効率が高くなります。辞書が100,000を超える異なる値を含む場合、ClickHouse は通常のデータタイプを使用する場合と比較して、パフォーマンスが低下する可能性があります。

文字列を扱う場合は、[Enum](../../sql-reference/data-types/enum.md) の代わりに `LowCardinality` を使用することを検討してください。`LowCardinality` は使用においてより高い柔軟性を提供し、同等またはより高い効率を示すことが多いです。

## Example {#example}

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

## Related Settings and Functions {#related-settings-and-functions}

Settings:

- [low_cardinality_max_dictionary_size](../../operations/settings/settings.md#low_cardinality_max_dictionary_size)
- [low_cardinality_use_single_dictionary_for_part](../../operations/settings/settings.md#low_cardinality_use_single_dictionary_for_part)
- [low_cardinality_allow_in_native_format](../../operations/settings/settings.md#low_cardinality_allow_in_native_format)
- [allow_suspicious_low_cardinality_types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types)
- [output_format_arrow_low_cardinality_as_dictionary](/operations/settings/formats#output_format_arrow_low_cardinality_as_dictionary)

Functions:

- [toLowCardinality](../../sql-reference/functions/type-conversion-functions.md#tolowcardinality)

## Related content {#related-content}

- Blog: [スキーマとコーデックを使用してClickHouseを最適化する](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- Blog: [ClickHouseでの時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- [文字列最適化 (ロシア語のビデオプレゼンテーション)](https://youtu.be/rqf-ILRgBdY?list=PL0Z2YDlm0b3iwXCpEFiOOYmwXzVmjJfEt)。 [英語のスライド](https://github.com/ClickHouse/clickhouse-presentations/raw/master/meetup19/string_optimization.pdf)

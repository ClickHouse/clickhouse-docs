---
slug: '/sql-reference/data-types/lowcardinality'
sidebar_position: 42
sidebar_label: 'LowCardinality(T)'
---


# LowCardinality(T)

他のデータ型の内部表現を辞書エンコードに変更します。

## Syntax {#syntax}

``` sql
LowCardinality(data_type)
```

**Parameters**

- `data_type` — [String](../../sql-reference/data-types/string.md)、[FixedString](../../sql-reference/data-types/fixedstring.md)、[Date](../../sql-reference/data-types/date.md)、[DateTime](../../sql-reference/data-types/datetime.md)、および [Decimal](../../sql-reference/data-types/decimal.md) を除く数値。`LowCardinality`は一部のデータ型には効率的ではありません。[allow_suspicious_low_cardinality_types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types) 設定の説明を参照してください。

## Description {#description}

`LowCardinality`は、データの保存方法とデータ処理のルールを変更するスーパー構造です。ClickHouseは`LowCardinality`カラムに[辞書コーディング](https://en.wikipedia.org/wiki/Dictionary_coder)を適用します。辞書エンコードされたデータを扱うことは、多くのアプリケーションにおける[SELECT](../../sql-reference/statements/select/index.md)クエリのパフォーマンスを大幅に向上させます。

`LowCardinality`データ型の使用効率は、データの多様性に依存します。辞書に10,000未満の異なる値が含まれている場合、ClickHouseはデータの読み取りと保存の効率が主に高くなります。辞書に100,000を超える異なる値が含まれている場合、ClickHouseは通常のデータ型を使用する場合と比較してパフォーマンスが低下する可能性があります。

文字列を扱う際には、[Enum](../../sql-reference/data-types/enum.md)の代わりに`LowCardinality`を使用することを検討してください。`LowCardinality`は使用時により柔軟性を提供し、同じかそれ以上の効率を示すことがよくあります。

## Example {#example}

`LowCardinality`カラムを持つテーブルを作成します：

``` sql
CREATE TABLE lc_t
(
    `id` UInt16,
    `strings` LowCardinality(String)
)
ENGINE = MergeTree()
ORDER BY id
```

## Related Settings and Functions {#related-settings-and-functions}

設定：

- [low_cardinality_max_dictionary_size](../../operations/settings/settings.md#low_cardinality_max_dictionary_size)
- [low_cardinality_use_single_dictionary_for_part](../../operations/settings/settings.md#low_cardinality_use_single_dictionary_for_part)
- [low_cardinality_allow_in_native_format](../../operations/settings/settings.md#low_cardinality_allow_in_native_format)
- [allow_suspicious_low_cardinality_types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types)
- [output_format_arrow_low_cardinality_as_dictionary](/operations/settings/formats#output_format_arrow_low_cardinality_as_dictionary)

関数：

- [toLowCardinality](../../sql-reference/functions/type-conversion-functions.md#tolowcardinality)

## Related content {#related-content}

- ブログ: [スキーマとコーデックを用いたClickHouseの最適化](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- ブログ: [ClickHouseにおける時系列データの処理](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- [文字列の最適化 (ロシア語の動画プレゼンテーション)](https://youtu.be/rqf-ILRgBdY?list=PL0Z2YDlm0b3iwXCpEFiOOYmwXzVmjJfEt)。 [英語のスライド](https://github.com/ClickHouse/clickhouse-presentations/raw/master/meetup19/string_optimization.pdf)

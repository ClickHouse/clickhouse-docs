---
description: '文字列列向け LowCardinality 最適化に関するドキュメント'
sidebar_label: 'LowCardinality(T)'
sidebar_position: 42
slug: /sql-reference/data-types/lowcardinality
title: 'LowCardinality(T)'
doc_type: 'reference'
---



# LowCardinality(T)

他のデータ型の内部表現を辞書エンコードされた形式に変更します。



## 構文 {#syntax}

```sql
LowCardinality(data_type)
```

**パラメータ**

- `data_type` — [String](../../sql-reference/data-types/string.md)、[FixedString](../../sql-reference/data-types/fixedstring.md)、[Date](../../sql-reference/data-types/date.md)、[DateTime](../../sql-reference/data-types/datetime.md)、および[Decimal](../../sql-reference/data-types/decimal.md)を除く数値型。一部のデータ型では`LowCardinality`は効率的ではありません。[allow_suspicious_low_cardinality_types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types)設定の説明を参照してください。


## Description {#description}

`LowCardinality`は、データの保存方式とデータ処理のルールを変更する上位構造です。ClickHouseは`LowCardinality`カラムに[辞書符号化](https://en.wikipedia.org/wiki/Dictionary_coder)を適用します。辞書符号化されたデータを操作することで、多くのアプリケーションにおいて[SELECT](../../sql-reference/statements/select/index.md)クエリのパフォーマンスが大幅に向上します。

`LowCardinality`データ型を使用する効率性は、データの多様性に依存します。辞書に含まれる個別値が10,000未満の場合、ClickHouseは主にデータの読み取りと保存において高い効率性を示します。辞書に含まれる個別値が100,000を超える場合、ClickHouseは通常のデータ型を使用する場合と比較してパフォーマンスが低下する可能性があります。

文字列を扱う際は、[Enum](../../sql-reference/data-types/enum.md)の代わりに`LowCardinality`の使用を検討してください。`LowCardinality`は使用においてより高い柔軟性を提供し、多くの場合、同等以上の効率性を実現します。


## 例 {#example}

`LowCardinality`カラムを持つテーブルを作成します:

```sql
CREATE TABLE lc_t
(
    `id` UInt16,
    `strings` LowCardinality(String)
)
ENGINE = MergeTree()
ORDER BY id
```


## 関連する設定と関数 {#related-settings-and-functions}

設定:

- [low_cardinality_max_dictionary_size](../../operations/settings/settings.md#low_cardinality_max_dictionary_size)
- [low_cardinality_use_single_dictionary_for_part](../../operations/settings/settings.md#low_cardinality_use_single_dictionary_for_part)
- [low_cardinality_allow_in_native_format](../../operations/settings/settings.md#low_cardinality_allow_in_native_format)
- [allow_suspicious_low_cardinality_types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types)
- [output_format_arrow_low_cardinality_as_dictionary](/operations/settings/formats#output_format_arrow_low_cardinality_as_dictionary)

関数:

- [toLowCardinality](../../sql-reference/functions/type-conversion-functions.md#tolowcardinality)


## 関連コンテンツ {#related-content}

- ブログ: [Optimizing ClickHouse with Schemas and Codecs](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- ブログ: [Working with time series data in ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- [String Optimization (ロシア語による動画プレゼンテーション)](https://youtu.be/rqf-ILRgBdY?list=PL0Z2YDlm0b3iwXCpEFiOOYmwXzVmjJfEt). [スライド (英語)](https://github.com/ClickHouse/clickhouse-presentations/raw/master/meetup19/string_optimization.pdf)

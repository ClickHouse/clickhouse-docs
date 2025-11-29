---
description: '文字列カラム向け LowCardinality 最適化に関するドキュメント'
sidebar_label: 'LowCardinality(T)'
sidebar_position: 42
slug: /sql-reference/data-types/lowcardinality
title: 'LowCardinality(T)'
doc_type: 'reference'
---



# LowCardinality(T) {#lowcardinalityt}

他のデータ型の内部表現を辞書エンコードされた形式に変更します。



## 構文 {#syntax}

```sql
LowCardinality(data_type)
```

**パラメータ**

* `data_type` — [String](../../sql-reference/data-types/string.md)、[FixedString](../../sql-reference/data-types/fixedstring.md)、[Date](../../sql-reference/data-types/date.md)、[DateTime](../../sql-reference/data-types/datetime.md)、および [Decimal](../../sql-reference/data-types/decimal.md) 以外の数値型。`LowCardinality` は一部のデータ型では効率的ではありません。詳細は [allow&#95;suspicious&#95;low&#95;cardinality&#95;types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types) 設定の説明を参照してください。


## 説明 {#description}

`LowCardinality` は、データの格納方式とデータ処理規則を変更するための上位構造です。ClickHouse は `LowCardinality` 列に対して [dictionary coding](https://en.wikipedia.org/wiki/Dictionary_coder) を適用します。辞書エンコードされたデータを扱うことで、多くのアプリケーションにおいて [SELECT](../../sql-reference/statements/select/index.md) クエリのパフォーマンスが大幅に向上します。

`LowCardinality` データ型の有効性は、データの多様性に依存します。辞書に含まれる異なる値が 10,000 未満である場合、ClickHouse は一般的にデータの読み取りおよび保存の効率が高くなります。辞書に 100,000 を超える異なる値が含まれている場合、通常のデータ型を使用した場合と比較して、ClickHouse のパフォーマンスが低下することがあります。

文字列を扱う際は、[Enum](../../sql-reference/data-types/enum.md) の代わりに `LowCardinality` の使用を検討してください。`LowCardinality` は利用時の柔軟性が高く、多くの場合、同等またはそれ以上の効率を発揮します。



## 例 {#example}

`LowCardinality` 列を持つテーブルを作成します。

```sql
CREATE TABLE lc_t
(
    `id` UInt16,
    `strings` LowCardinality(String)
)
ENGINE = MergeTree()
ORDER BY id
```


## 関連設定と関数 {#related-settings-and-functions}

設定:

- [low_cardinality_max_dictionary_size](../../operations/settings/settings.md#low_cardinality_max_dictionary_size)
- [low_cardinality_use_single_dictionary_for_part](../../operations/settings/settings.md#low_cardinality_use_single_dictionary_for_part)
- [low_cardinality_allow_in_native_format](../../operations/settings/settings.md#low_cardinality_allow_in_native_format)
- [allow_suspicious_low_cardinality_types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types)
- [output_format_arrow_low_cardinality_as_dictionary](/operations/settings/formats#output_format_arrow_low_cardinality_as_dictionary)

関数:

- [toLowCardinality](../../sql-reference/functions/type-conversion-functions.md#tolowcardinality)



## 関連コンテンツ {#related-content}

- ブログ： [Schemas と Codecs を用いた ClickHouse の最適化](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- ブログ： [ClickHouse における時系列データの扱い方](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- [String Optimization（ロシア語によるビデオプレゼンテーション）](https://youtu.be/rqf-ILRgBdY?list=PL0Z2YDlm0b3iwXCpEFiOOYmwXzVmjJfEt)。[英語スライド](https://github.com/ClickHouse/clickhouse-presentations/raw/master/meetup19/string_optimization.pdf)

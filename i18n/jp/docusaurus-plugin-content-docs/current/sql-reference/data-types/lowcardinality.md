---
slug: /sql-reference/data-types/lowcardinality
sidebar_position: 42
sidebar_label: LowCardinality(T)
---


# LowCardinality(T)

他のデータ型の内部表現を辞書エンコードに変更します。

## 構文 {#syntax}

``` sql
LowCardinality(data_type)
```

**パラメータ**

- `data_type` — [String](../../sql-reference/data-types/string.md)、[FixedString](../../sql-reference/data-types/fixedstring.md)、[Date](../../sql-reference/data-types/date.md)、[DateTime](../../sql-reference/data-types/datetime.md)、および [Decimal](../../sql-reference/data-types/decimal.md) を除く数値。`LowCardinality` は、一部のデータ型に対して効率的ではありません。詳細は [allow_suspicious_low_cardinality_types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types) 設定の説明を参照してください。

## 説明 {#description}

`LowCardinality` は、データの保存方法とデータ処理のルールを変更するスーパーストラクチャです。ClickHouse は `LowCardinality`-カラムに [辞書コーディング](https://en.wikipedia.org/wiki/Dictionary_coder) を適用します。辞書エンコードされたデータを操作することにより、多くのアプリケーションで [SELECT](../../sql-reference/statements/select/index.md) クエリのパフォーマンスが大幅に向上します。

`LowCardinality` データ型の使用効率はデータの多様性に依存します。辞書に 10,000 未満の異なる値が含まれている場合、ClickHouse は主にデータの読み込みと保存の効率が高まります。辞書に 100,000 を超える異なる値が含まれている場合、ClickHouse は通常のデータ型を使用する場合と比較してパフォーマンスが低下する可能性があります。

文字列を扱う際には、[Enum](../../sql-reference/data-types/enum.md) の代わりに `LowCardinality` を使用することを検討してください。`LowCardinality` は使用時の柔軟性が高く、同じかそれ以上の効率を示すことがよくあります。

## 例 {#example}

`LowCardinality`-カラムを持つテーブルを作成します。

``` sql
CREATE TABLE lc_t
(
    `id` UInt16,
    `strings` LowCardinality(String)
)
ENGINE = MergeTree()
ORDER BY id
```

## 関連設定および関数 {#related-settings-and-functions}

設定:

- [low_cardinality_max_dictionary_size](../../operations/settings/settings.md#low_cardinality_max_dictionary_size)
- [low_cardinality_use_single_dictionary_for_part](../../operations/settings/settings.md#low_cardinality_use_single_dictionary_for_part)
- [low_cardinality_allow_in_native_format](../../operations/settings/settings.md#low_cardinality_allow_in_native_format)
- [allow_suspicious_low_cardinality_types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types)
- [output_format_arrow_low_cardinality_as_dictionary](../../operations/settings/settings.md#output-format-arrow-low-cardinality-as-dictionary)

関数:

- [toLowCardinality](../../sql-reference/functions/type-conversion-functions.md#tolowcardinality)

## 関連コンテンツ {#related-content}

- ブログ: [スキーマとコーデックを使用したClickHouseの最適化](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- ブログ: [ClickHouseでの時系列データの扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- [文字列最適化 (ロシア語でのビデオプレゼンテーション)](https://youtu.be/rqf-ILRgBdY?list=PL0Z2YDlm0b3iwXCpEFiOOYmwXzVmjJfEt). [英語のスライド](https://github.com/ClickHouse/clickhouse-presentations/raw/master/meetup19/string_optimization.pdf)

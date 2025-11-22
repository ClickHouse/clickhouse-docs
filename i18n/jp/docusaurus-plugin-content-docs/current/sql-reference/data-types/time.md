---
description: '秒単位の精度で時間範囲を格納する ClickHouse の Time データ型に関するドキュメント'
slug: /sql-reference/data-types/time
sidebar_position: 15
sidebar_label: 'Time'
title: 'Time'
doc_type: 'reference'
---



# Time

データ型 `Time` は、時・分・秒の要素からなる時刻を表します。
これは暦上の日付とは独立しており、日・月・年といった要素を必要としない値に適しています。

構文:

```sql
時刻
```

テキスト表現可能な範囲: [-999:59:59, 999:59:59]。

精度: 1秒。


## 実装の詳細 {#implementation-details}

**表現とパフォーマンス**
データ型`Time`は内部的に秒数をエンコードした符号付き32ビット整数として格納されます。
`Time`型と`DateTime`型の値は同じバイトサイズを持つため、パフォーマンスは同等です。

**正規化**
文字列を`Time`として解析する際、時刻コンポーネントは正規化されますが、検証は行われません。
例えば、`25:70:70`は`26:11:10`として解釈されます。

**負の値**
先頭のマイナス記号はサポートされ、保持されます。
負の値は通常、`Time`値に対する算術演算から生じます。
`Time`型では、テキスト入力(例:`'-01:02:03'`)と数値入力(例:`-3723`)の両方で負の入力が保持されます。

**飽和処理**
時刻コンポーネントは[-999:59:59, 999:59:59]の範囲に制限されます。
時間が999を超える(または-999を下回る)値は、テキストを介して`999:59:59`(または`-999:59:59`)として表現され、往復変換されます。

**タイムゾーン**
`Time`はタイムゾーンをサポートしていません。つまり、`Time`値は地域的な文脈なしで解釈されます。
型パラメータとして、または値の作成時に`Time`にタイムゾーンを指定するとエラーが発生します。
同様に、`Time`カラムにタイムゾーンを適用または変更しようとする試みはサポートされておらず、エラーが発生します。
`Time`値は異なるタイムゾーン下で暗黙的に再解釈されることはありません。


## 例 {#examples}

**1.** `Time`型のカラムを持つテーブルを作成し、データを挿入する:

```sql
CREATE TABLE tab
(
    `event_id` UInt8,
    `time` Time
)
ENGINE = TinyLog;
```

```sql
-- Timeを解析
-- - 文字列から
-- - 00:00:00からの秒数として解釈される整数から
INSERT INTO tab VALUES (1, '14:30:25'), (2, 52225);

SELECT * FROM tab ORDER BY event_id;
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

**2.** `Time`値でのフィルタリング

```sql
SELECT * FROM tab WHERE time = toTime('14:30:25')
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

`Time`カラムの値は、`WHERE`述語で文字列値を使用してフィルタリングできます。文字列値は自動的に`Time`に変換されます:

```sql
SELECT * FROM tab WHERE time = '14:30:25'
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

**3.** 結果の型を検査する:

```sql
SELECT CAST('14:30:25' AS Time) AS column, toTypeName(column) AS type
```

```text
   ┌────column─┬─type─┐
1. │ 14:30:25 │ Time │
   └───────────┴──────┘
```


## 関連項目 {#see-also}

- [型変換関数](../functions/type-conversion-functions.md)
- [日付と時刻を扱う関数](../functions/date-time-functions.md)
- [配列を扱う関数](../functions/array-functions.md)
- [`date_time_input_format` 設定](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 設定](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` サーバー設定パラメータ](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 設定](../../operations/settings/settings.md#session_timezone)
- [`DateTime` データ型](datetime.md)
- [`Date` データ型](date.md)

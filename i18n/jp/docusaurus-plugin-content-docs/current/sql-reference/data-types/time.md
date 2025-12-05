---
description: '秒単位の精度で時間の範囲を保存する ClickHouse の Time データ型に関するドキュメント'
slug: /sql-reference/data-types/time
sidebar_position: 15
sidebar_label: 'Time'
title: 'Time'
doc_type: 'reference'
---



# Time {#time}

データ型 `Time` は、時・分・秒からなる時刻を表します。
カレンダーの日付情報とは独立しており、日・月・年といった日付コンポーネントを必要としない値に適しています。

構文:

```sql
Time
```

テキストでの表現範囲: [-999:59:59, 999:59:59]。

解像度: 1秒。


## 実装の詳細 {#implementation-details}

**表現とパフォーマンス**  
`Time` データ型は内部的に、秒数をエンコードした符号付き 32 ビット整数として格納します。  
`Time` 型と `DateTime` 型は同じバイトサイズであり、そのためパフォーマンスも同程度です。

**正規化**  
文字列を `Time` にパースする際、時刻コンポーネントは正規化されますが、妥当性検証は行われません。  
たとえば、`25:70:70` は `26:11:10` として解釈されます。

**負の値**  
先頭のマイナス記号はサポートされ、保持されます。  
負の値は通常、`Time` 値に対する算術演算から生じます。  
`Time` 型では、テキスト入力（例: `'-01:02:03'`）および数値入力（例: `-3723`）の両方について、負の入力がそのまま保持されます。

**飽和**  
一日の時刻コンポーネントは [-999:59:59, 999:59:59] の範囲に制限されます。  
時間が 999 を超える（または -999 未満の）値は、テキストによる表現および往復変換の際に `999:59:59`（または `-999:59:59`）として表現されます。

**タイムゾーン**  
`Time` はタイムゾーンをサポートしません。つまり、`Time` 値は地域的なコンテキストなしに解釈されます。  
`Time` に対して、型パラメータとして、または値の生成時にタイムゾーンを指定するとエラーになります。  
同様に、`Time` カラムにタイムゾーンを適用または変更しようとする操作もサポートされず、エラーになります。  
`Time` 値が異なるタイムゾーンの下で暗黙的に再解釈されることはありません。



## 例 {#examples}

**1.** `Time` 型カラムを持つテーブルを作成し、データを挿入する：

```sql
CREATE TABLE tab
(
    `event_id` UInt8,
    `time` Time
)
ENGINE = TinyLog;
```

```sql
-- Parse Time
-- - from string,
-- - from integer interpreted as number of seconds since 00:00:00.
INSERT INTO tab VALUES (1, '14:30:25'), (2, 52225);

SELECT * FROM tab ORDER BY event_id;
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

**2.** `Time` 値でのフィルタリング

```sql
SELECT * FROM tab WHERE time = toTime('14:30:25')
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

`Time` カラムの値は、`WHERE` 述語で文字列値を使ってフィルタリングできます。文字列は自動的に `Time` に変換されます。

```sql
SELECT * FROM tab WHERE time = '14:30:25'
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

**3.** 結果の型を確認する：

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
- [`timezone` サーバー構成パラメータ](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 設定](../../operations/settings/settings.md#session_timezone)
- [`DateTime` データ型](datetime.md)
- [`Date` データ型](date.md)

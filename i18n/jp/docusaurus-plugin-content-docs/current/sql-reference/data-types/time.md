---
description: '秒精度で時刻範囲を保存する ClickHouse の Time データ型に関するドキュメント'
slug: /sql-reference/data-types/time
sidebar_position: 15
sidebar_label: 'Time'
title: 'Time'
doc_type: 'reference'
---



# Time

データ型 `Time` は、時・分・秒の要素から成る時刻を表します。
これはカレンダーの日付とは独立しており、日・月・年の要素を必要としない値に適しています。

構文:

```sql
時間
```

テキスト表現可能な範囲: [-999:59:59, 999:59:59]。

精度: 1秒。


## 実装の詳細 {#implementation-details}

**表現とパフォーマンス**  
データ型 `Time` は内部的に、秒数を符号付き 32 ビット整数として保持します。  
`Time` 型と `DateTime` 型の値は同じバイトサイズであり、そのためパフォーマンスも同程度です。

**正規化**  
文字列を `Time` に解析する際、時刻成分は正規化されますが、妥当性検証は行われません。  
たとえば、`25:70:70` は `26:11:10` として解釈されます。

**負の値**  
先頭のマイナス記号はサポートされ、そのまま保持されます。  
負の値は通常、`Time` 値に対する算術演算から生じます。  
`Time` 型では、負の入力はテキスト入力（例: `'-01:02:03'`）および数値入力（例: `-3723`）の両方で保持されます。

**サチュレーション（飽和）**  
時刻の成分は [-999:59:59, 999:59:59] の範囲に制限されます。  
時間が 999 を超える（または -999 未満の）値は、テキストでの表現および往復変換の際には `999:59:59`（または `-999:59:59`）として扱われます。

**タイムゾーン**  
`Time` はタイムゾーンをサポートしません。すなわち、`Time` 値は地域的な文脈なしに解釈されます。  
型パラメータとして、または値の作成時に `Time` に対してタイムゾーンを指定するとエラーが発生します。  
同様に、`Time` 列に対してタイムゾーンを適用したり変更しようとする操作はサポートされず、エラーとなります。  
`Time` 値が異なるタイムゾーンの下で暗黙的に再解釈されることはありません。



## 例

**1.** `Time` 型の列を持つテーブルを作成し、そのテーブルにデータを挿入する:

```sql
CREATE TABLE tab
(
    `event_id` UInt8,
    `time` Time
)
ENGINE = TinyLog;
```

```sql
-- 時刻を解析
-- - 文字列から
-- - 00:00:00 からの経過秒数と解釈される整数から
INSERT INTO tab VALUES (1, '14:30:25'), (2, 52225);

SELECT * FROM tab ORDER BY event_id;
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

**2.** `Time` 値によるフィルタリング

```sql
SELECT * FROM tab WHERE time = toTime('14:30:25')
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

`Time` 列の値は、`WHERE` 述語で文字列値を使ってフィルタできます。文字列値は自動的に `Time` 型に変換されます。

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
   ┌────列────┬─型──┐
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

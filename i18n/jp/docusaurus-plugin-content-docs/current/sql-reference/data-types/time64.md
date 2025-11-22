---
description: 'サブ秒精度で時刻を保持する ClickHouse の Time64 データ型に関するドキュメント'
slug: /sql-reference/data-types/time64
sidebar_position: 17
sidebar_label: 'Time64'
title: 'Time64'
doc_type: 'reference'
---



# Time64

データ型 `Time64` は、小数秒を含む一日の時刻（時刻-of-day）を表します。
暦日（⽇・⽉・年）の要素は持ちません。
`precision` パラメータは小数部の桁数を定義し、それによってティックサイズが決まります。

ティックサイズ（精度）: 10<sup>-precision</sup> 秒。有効範囲: 0..9。一般的な値は 3（ミリ秒）、6（マイクロ秒）、9（ナノ秒）です。

**構文:**

```sql
Time64(精度)
```

`Time64` は内部的に、符号付き 64 ビット 10 進数 (Decimal64) として秒の小数部分を保持します。
ティックの解像度は `precision` パラメーターによって決まります。
タイムゾーンはサポートされていません。`Time64` でタイムゾーンを指定するとエラーが発生します。

`DateTime64` と異なり、`Time64` は日付成分を保持しません。
[`Time`](../../sql-reference/data-types/time.md) も参照してください。

テキスト表現可能な範囲は、`precision = 3` の場合 [-999:59:59.000, 999:59:59.999] です。一般に、最小値は `-999:59:59`、最大値は `999:59:59` で、小数部は最大 `precision` 桁まで表現できます (`precision = 9` の場合、最小値は `-999:59:59.999999999` です)。


## 実装の詳細 {#implementation-details}

**表現形式**
符号付き`Decimal64`値として、`precision`桁の小数部で秒の端数を計数します。

**正規化**
文字列を`Time64`に解析する際、時刻の構成要素は正規化されますが、検証は行われません。
例えば、`25:70:70`は`26:11:10`として解釈されます。

**負の値**
先頭のマイナス記号はサポートされ、保持されます。
負の値は通常、`Time64`値に対する算術演算から生じます。
`Time64`では、テキスト入力(例:`'-01:02:03.123'`)と数値入力(例:`-3723.123`)の両方で負の入力が保持されます。

**飽和処理**
構成要素への変換またはテキストへのシリアライズ時に、時刻部分は[-999:59:59.xxx, 999:59:59.xxx]の範囲に制限されます。
格納される数値はこの範囲を超える場合がありますが、構成要素の抽出(時、分、秒)およびテキスト表現では飽和処理された値が使用されます。

**タイムゾーン**
`Time64`はタイムゾーンをサポートしていません。
`Time64`型または値を作成する際にタイムゾーンを指定するとエラーが発生します。
同様に、`Time64`カラムにタイムゾーンを適用または変更しようとする試みはサポートされておらず、エラーが発生します。


## 例 {#examples}

1. `Time64`型のカラムを持つテーブルを作成し、データを挿入する:

```sql
CREATE TABLE tab64
(
    `event_id` UInt8,
    `time` Time64(3)
)
ENGINE = TinyLog;
```

```sql
-- Time64を解析
-- - 文字列から
-- - 00:00:00からの秒数(小数部分は精度に従う)から
INSERT INTO tab64 VALUES (1, '14:30:25'), (2, 52225.123), (3, '14:30:25');

SELECT * FROM tab64 ORDER BY event_id;
```

```text
   ┌─event_id─┬────────time─┐
1. │        1 │ 14:30:25.000 │
2. │        2 │ 14:30:25.123 │
3. │        3 │ 14:30:25.000 │
   └──────────┴──────────────┘
```

2. `Time64`値でのフィルタリング

```sql
SELECT * FROM tab64 WHERE time = toTime64('14:30:25', 3);
```

```text
   ┌─event_id─┬────────time─┐
1. │        1 │ 14:30:25.000 │
2. │        3 │ 14:30:25.000 │
   └──────────┴──────────────┘
```

```sql
SELECT * FROM tab64 WHERE time = toTime64(52225.123, 3);
```

```text
   ┌─event_id─┬────────time─┐
1. │        2 │ 14:30:25.123 │
   └──────────┴──────────────┘
```

注意: `toTime64`は数値リテラルを指定された精度に従って小数部分を持つ秒数として解析するため、意図した小数桁数を明示的に指定してください。

3. 結果の型を確認する:

```sql
SELECT CAST('14:30:25.250' AS Time64(3)) AS column, toTypeName(column) AS type;
```

```text
   ┌────────column─┬─type──────┐
1. │ 14:30:25.250 │ Time64(3) │
   └───────────────┴───────────┘
```

**関連項目**

- [型変換関数](../../sql-reference/functions/type-conversion-functions.md)
- [日付と時刻を扱う関数](../../sql-reference/functions/date-time-functions.md)
- [`date_time_input_format`設定](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format`設定](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone`サーバー設定パラメータ](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone`設定](../../operations/settings/settings.md#session_timezone)
- [日付と時刻を扱う演算子](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
- [`Date`データ型](../../sql-reference/data-types/date.md)
- [`Time`データ型](../../sql-reference/data-types/time.md)
- [`DateTime`データ型](../../sql-reference/data-types/datetime.md)

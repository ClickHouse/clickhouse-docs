---
description: 'サブ秒精度の時間範囲を保持する ClickHouse の Time64 データ型に関するドキュメント'
slug: /sql-reference/data-types/time64
sidebar_position: 17
sidebar_label: 'Time64'
title: 'Time64'
doc_type: 'reference'
---

# Time64 {#time64}

データ型 `Time64` は、小数秒を含む一日の時刻を表します。
日・月・年といった暦の要素は持ちません。
`precision` パラメータは小数部の桁数、すなわちティックサイズを定義します。

ティックサイズ（精度）: 10<sup>-precision</sup> 秒。有効範囲: 0..9。よく使われる値は 3（ミリ秒）、6（マイクロ秒）、9（ナノ秒）です。

**構文:**

```

Internally, `Time64` stores a signed 64-bit decimal (Decimal64) number of fractional seconds.
The tick resolution is determined by the `precision` parameter.
Time zones are not supported: specifying a time zone with `Time64` will throw an error.

Unlike `DateTime64`, `Time64` does not store a date component.
See also [`Time`](../../sql-reference/data-types/time.md).

Text representation range: [-999:59:59.000, 999:59:59.999] for `precision = 3`. In general, the minimum is `-999:59:59` and the maximum is `999:59:59` with up to `precision` fractional digits (for `precision = 9`, the minimum is `-999:59:59.999999999`).

## Implementation details {#implementation-details}

**Representation**.
Signed `Decimal64` value counting fractional second with `precision` fractional digits.

**Normalization**.
When parsing strings to `Time64`, the time components are normalized and not validated.
For example, `25:70:70` is interpreted as `26:11:10`.

**Negative values**.
Leading minus signs are supported and preserved.
Negative values typically arise from arithmetic operations on `Time64` values.
For `Time64`, negative inputs are preserved for both text (e.g., `'-01:02:03.123'`) and numeric inputs (e.g., `-3723.123`).

**Saturation**.
The time-of-day component is capped to the range [-999:59:59.xxx, 999:59:59.xxx] when converting to components or serialising to text.
The stored numeric value may exceed this range; however, any component extraction (hours, minutes, seconds) and textual representation use the saturated value.

**Time zones**.
`Time64` does not support time zones.
Specifying a time zone when creating a `Time64` type or value throws an error.
Likewise, attempts to apply or change the time zone on `Time64` columns is not supported and results in an error.

## Examples {#examples}

1. Creating a table with a `Time64`-type column and inserting data into it:

```

内部的には、`Time64` は符号付き 64 ビットの 10 進数 (Decimal64) で秒の小数部分を保持します。
刻み幅は `precision` パラメータによって決まります。
タイムゾーンはサポートされていません。`Time64` にタイムゾーンを指定するとエラーが発生します。

`DateTime64` と異なり、`Time64` は日付成分を保持しません。
[`Time`](../../sql-reference/data-types/time.md) も参照してください。

テキスト表現の範囲: `precision = 3` の場合は [-999:59:59.000, 999:59:59.999] です。一般に、最小値は `-999:59:59`、最大値は `999:59:59` で、`precision` で指定された桁数までの小数を持つことができます (`precision = 9` の場合、最小値は `-999:59:59.999999999` です)。

## 実装の詳細 {#implementation-details}

**表現**。  
小数点以下 `precision` 桁で表される小数秒をカウントする符号付き `Decimal64` 値。

**正規化**。  
文字列を `Time64` にパースする際、時刻コンポーネントは正規化されますが、検証は行われません。  
たとえば、`25:70:70` は `26:11:10` と解釈されます。

**負の値**。  
先頭のマイナス記号はサポートされ、そのまま保持されます。  
負の値は通常、`Time64` 値に対する算術演算から生じます。  
`Time64` では、テキスト入力（例: `'-01:02:03.123'`）および数値入力（例: `-3723.123`）のいずれの場合も、負の入力はそのまま保持されます。

**飽和**。  
時刻（time-of-day）コンポーネントは、コンポーネントへの変換やテキストへのシリアル化時に [-999:59:59.xxx, 999:59:59.xxx] の範囲に制限されます。  
保存されている数値自体はこの範囲を超える場合がありますが、コンポーネントの抽出（時、分、秒）およびテキスト表現では、飽和させた値が使用されます。

**タイムゾーン**。  
`Time64` はタイムゾーンをサポートしません。  
`Time64` 型または値を作成する際にタイムゾーンを指定するとエラーが発生します。  
同様に、`Time64` カラムに対してタイムゾーンを適用したり変更したりする試みもサポートされず、エラーになります。

## 例 {#examples}

1. `Time64` 型のカラムを持つテーブルを作成し、データを挿入する:

```

```

```

```

```

2. Filtering on `Time64` values

```

2. `Time64` 値によるフィルタリング

```

```

```

```

```

```

```

Note: `toTime64` parses numeric literals as seconds with a fractional part according to the specified precision, so provide the intended fractional digits explicitly.

3. Inspecting the resulting type:

```

Note: `toTime64` は、指定された精度に従って数値リテラルを小数部付きの秒として解釈するため、意図する小数桁数を明示的に指定してください。

3. 結果の型を確認する:

```

```

```text
   ┌────────column─┬─type──────┐
1. │ 14:30:25.250 │ Time64(3) │
   └───────────────┴───────────┘
```

**関連項目**

* [型変換関数](../../sql-reference/functions/type-conversion-functions.md)
* [日付と時刻を扱う関数](../../sql-reference/functions/date-time-functions.md)
* [`date_time_input_format` 設定](../../operations/settings/settings-formats.md#date_time_input_format)
* [`date_time_output_format` 設定](../../operations/settings/settings-formats.md#date_time_output_format)
* [`timezone` サーバー構成パラメータ](../../operations/server-configuration-parameters/settings.md#timezone)
* [`session_timezone` 設定](../../operations/settings/settings.md#session_timezone)
* [日付と時刻を扱うための演算子](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
* [`Date` データ型](../../sql-reference/data-types/date.md)
* [`Time` データ型](../../sql-reference/data-types/time.md)
* [`DateTime` データ型](../../sql-reference/data-types/datetime.md)

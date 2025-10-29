---
'description': 'ClickHouse の Time64 データ型に関するドキュメントで、サブセカンド精度の時間範囲を格納します'
'slug': '/sql-reference/data-types/time64'
'sidebar_position': 17
'sidebar_label': 'Time64'
'title': 'Time64'
'doc_type': 'reference'
---


# Time64

データ型 `Time64` は、時間帯を表し、小数秒を含んでいます。
カレンダーデータのコンポーネント（日、月、年）はありません。
`precision` パラメータは、小数点以下の桁数を定義し、したがってティックサイズを決定します。

ティックサイズ（精度）： 10<sup>-precision</sup> 秒。有効範囲：0..9。一般的な選択肢は3（ミリ秒）、6（マイクロ秒）、9（ナノ秒）です。

**構文:**

```sql
Time64(precision)
```

内部では、`Time64` は符号付き64ビット小数（Decimal64）形式で小数秒を格納します。
ティックの解像度は `precision` パラメータによって決まります。
タイムゾーンはサポートされておらず、`Time64` でタイムゾーンを指定するとエラーが発生します。

`DateTime64` と異なり、`Time64` は日付コンポーネントを保存しません。
詳細については、[`Time`](../../sql-reference/data-types/time.md)を参照してください。

テキスト表現の範囲： `precision = 3` の場合、[-999:59:59.000, 999:59:59.999]。一般的に、最小は `-999:59:59` で、最大は `999:59:59` であり、最大 `precision` の小数点以下の桁数（`precision = 9` の場合、最小は `-999:59:59.999999999`）があります。

## 実装の詳細 {#implementation-details}

**表現**。
符号付き `Decimal64` 値が小数秒をカウントし、`precision` 小数桁を持ちます。

**正規化**。
`Time64` に文字列を解析する際、時間コンポーネントは正規化され、検証は行われません。
例えば、`25:70:70` は `26:11:10` と解釈されます。

**負の値**。
先頭のマイナス記号はサポートされており、保持されます。
負の値は通常、`Time64` 値の算術操作から生じます。
`Time64` では、テキスト（例：`'-01:02:03.123'`）および数値入力（例：`-3723.123`）の両方で負の入力が保持されます。

**飽和**。
コンポーネントに変換したり、テキストにシリアル化する際、時間帯部分は範囲 [-999:59:59.xxx, 999:59:59.xxx] に制限されます。
格納されている数値はこの範囲を超える場合がありますが、コンポーネント抽出（時間、分、秒）およびテキスト表現は飽和値を使用します。

**タイムゾーン**。
`Time64` はタイムゾーンをサポートしていません。
`Time64` 型または値を作成する際にタイムゾーンを指定するとエラーが発生します。
同様に、`Time64` カラムにタイムゾーンを適用または変更しようとするとサポートされず、エラーが発生します。

## 例 {#examples}

1. `Time64` 型のカラムを持つテーブルを作成し、データを挿入する:

```sql
CREATE TABLE tab64
(
    `event_id` UInt8,
    `time` Time64(3)
)
ENGINE = TinyLog;
```

```sql
-- Parse Time64
-- - from string,
-- - from a number of seconds since 00:00:00 (fractional part according to precision).
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

2. `Time64` 値でのフィルタリング

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

注： `toTime64` は指定された精度に従って小数部を持つ秒として数値リテラルを解析するため、意図した小数桁を明示的に提供してください。

3. 結果の型を確認する:

```sql
SELECT CAST('14:30:25.250' AS Time64(3)) AS column, toTypeName(column) AS type;
```

```text
   ┌────────column─┬─type──────┐
1. │ 14:30:25.250 │ Time64(3) │
   └───────────────┴───────────┘
```

**関連情報**

- [型変換関数](../../sql-reference/functions/type-conversion-functions.md)
- [日付と時刻で作業するための関数](../../sql-reference/functions/date-time-functions.md)
- [設定 `date_time_input_format`](../../operations/settings/settings-formats.md#date_time_input_format)
- [設定 `date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format)
- [サーバー構成パラメータ `timezone`](../../operations/server-configuration-parameters/settings.md#timezone)
- [設定 `session_timezone`](../../operations/settings/settings.md#session_timezone)
- [日付と時刻で作業するための演算子](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
- [`Date` データ型](../../sql-reference/data-types/date.md)
- [`Time` データ型](../../sql-reference/data-types/time.md)
- [`DateTime` データ型](../../sql-reference/data-types/datetime.md)

---
'description': 'ClickHouse における Time データ型のドキュメントで、秒精度の時間範囲を保存します'
'slug': '/sql-reference/data-types/time'
'sidebar_position': 15
'sidebar_label': '時間'
'title': '時間'
'doc_type': 'reference'
---


# 時間

データ型 `Time` は、時間、分、および秒のコンポーネントを持つ時間を表します。
これは任意のカレンダー日付とは独立しており、日、月、年のコンポーネントを必要としない値に適しています。

構文:

```sql
Time
```

テキスト表現範囲: [-999:59:59, 999:59:59].

解像度: 1 秒.

## 実装の詳細 {#implementation-details}

**表現とパフォーマンス**.
データ型 `Time` は、内部的に秒をエンコードした符号付き32ビット整数を格納します。
`Time` 型と `DateTime` 型の値は同じバイトサイズを持ち、したがって同等のパフォーマンスを持ちます。

**正規化**.
文字列を `Time` に解析するとき、時間コンポーネントは正規化されるが、検証は行われません。
例えば、`25:70:70` は `26:11:10` と解釈されます。

**負の値**.
先頭のマイナス記号がサポートされ、保持されます。
負の値は通常、`Time` 値に対する算術演算から生じます。
`Time` 型については、負の入力がテキスト（例: `'-01:02:03'`）および数値入力（例: `-3723`）の両方で保持されます。

**飽和**.
時刻コンポーネントは範囲 [-999:59:59, 999:59:59] に制限されます。
999 時間（または -999 未満）の値は、テキストとして `999:59:59` （または `-999:59:59`）で表現され、元に戻されます。

**タイムゾーン**.
`Time` はタイムゾーンをサポートしておらず、つまり `Time` 値は地域的な文脈なしで解釈されます。
`Time` に型パラメーターとしてまたは値の作成時にタイムゾーンを指定するとエラーが発生します。
同様に、`Time` カラムにタイムゾーンを適用または変更しようとするとサポートされず、エラーが発生します。
`Time` 値は異なるタイムゾーンの下で静かに再解釈されることはありません。

## 例 {#examples}

**1.** `Time` 型カラムを持つテーブルを作成し、データを挿入する:

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

**2.** `Time` 値でフィルタリングする

```sql
SELECT * FROM tab WHERE time = toTime('14:30:25')
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

`Time` カラム値は、`WHERE` 述語内で文字列値を使用してフィルタリングできます。自動的に `Time` に変換されます:

```sql
SELECT * FROM tab WHERE time = '14:30:25'
```

```text
   ┌─event_id─┬──────time─┐
1. │        1 │ 14:30:25 │
2. │        2 │ 14:30:25 │
   └──────────┴───────────┘
```

**3.** 結果の型を確認する:

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
- [日付および時間を操作するための関数](../functions/date-time-functions.md)
- [配列を操作するための関数](../functions/array-functions.md)
- [`date_time_input_format` 設定](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 設定](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` サーバー構成パラメーター](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 設定](../../operations/settings/settings.md#session_timezone)
- [`DateTime` データ型](datetime.md)
- [`Date` データ型](date.md)

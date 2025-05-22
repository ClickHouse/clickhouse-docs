---
'description': 'ClickHouseにおけるTime64データ型のドキュメント。サブセカンド精度で時間範囲を格納します。'
'slug': '/sql-reference/data-types/time64'
'sidebar_position': 17
'sidebar_label': 'Time64'
'title': 'Time64'
---




# Time64

Time64 データ型は、サブ秒精度で時間値を格納することを可能にします。DateTime64 とは異なり、カレンダー日付は含まれず、時間のみを表します。精度は、格納された値の小数秒単位の解像度を定義します。

ティックサイズ（精度）：10<sup>-precision</sup> 秒。有効範囲：[ 0 : 9 ]。
通常は 3 (ミリ秒)、6 (マイクロ秒)、9 (ナノ秒) が使用されます。

**構文:**

``` sql
Time64(precision)
```

内部的に、Time64 は日付の開始からのティックの Int64 数値としてデータを格納します (000:00:00.000000000)。ティック解像度は精度パラメータによって決まります。オプションで、列レベルでタイムゾーンを指定することもでき、これは時間値の解釈とテキスト形式での表示に影響を与えます。

DateTime64 とは異なり、Time64 は日付コンポーネントを格納しないため、時間のみを表します。詳細は [Time](../../sql-reference/data-types/time.md) を参照してください。

サポートされている値の範囲: \[000:00:00, 999:59:59.99999999\]

## 例 {#examples}

1. `Time64` 型カラムを持つテーブルを作成し、データを挿入する:

``` sql
CREATE TABLE t64
(
    `timestamp` Time64(3),
    `event_id` UInt8
)
ENGINE = TinyLog;
```

``` sql
-- 時間を解析する
-- - 1970-01-01 からの秒数として解釈される整数から。
-- - 文字列から、
INSERT INTO t64 VALUES (15463123, 1), (154600.123, 2), ('100:00:00', 3);

SELECT * FROM t64;
```

``` text
   ┌─────timestamp─┬─event_id─┐
1. │ 004:17:43.123 │        1 │
2. │ 042:56:40.123 │        2 │
3. │ 100:00:00.000 │        3 │
   └───────────────┴──────────┘
```

2. `Time64` 値でフィルター処理する

``` sql
SELECT * FROM t64 WHERE timestamp = toTime64('100:00:00', 3);
```

``` text
   ┌─────timestamp─┬─event_id─┐
1. │ 100:00:00.000 │        3 │
   └───────────────┴──────────┘
```

`Time` と異なり、`Time64` 値は自動的に `String` から変換されません。

``` sql
SELECT * FROM t64 WHERE timestamp = toTime64(154600.123, 3);
```

``` text
   ┌─────timestamp─┬─event_id─┐
1. │ 042:56:40.123 │        2 │
   └───────────────┴──────────┘
```

挿入時とは異なり、`toTime64` 関数はすべての値を10進数版として扱うため、小数点の後に精度を指定する必要があります。

3. `Time64` 型値のタイムゾーンを取得する:

``` sql
SELECT toTime64(now(), 3) AS column, toTypeName(column) AS x;
```

``` text
   ┌────────column─┬─x─────────┐
1. │ 019:14:16.000 │ Time64(3) │
   └───────────────┴───────────┘
```


**参照**

- [型変換関数](../../sql-reference/functions/type-conversion-functions.md)
- [日付と時刻に関する関数](../../sql-reference/functions/date-time-functions.md)
- [`date_time_input_format` 設定](../../operations/settings/settings-formats.md#date_time_input_format)
- [`date_time_output_format` 設定](../../operations/settings/settings-formats.md#date_time_output_format)
- [`timezone` サーバー構成パラメータ](../../operations/server-configuration-parameters/settings.md#timezone)
- [`session_timezone` 設定](../../operations/settings/settings.md#session_timezone)
- [日付と時刻に関する演算子](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
- [`Date` データ型](../../sql-reference/data-types/date.md)
- [`Time` データ型](../../sql-reference/data-types/time.md)
- [`DateTime` データ型](../../sql-reference/data-types/datetime.md)

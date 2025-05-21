---
description: 'ClickHouseにおけるTime64データ型のドキュメントで、サブ秒精度で時間範囲を保存します'
slug: /sql-reference/data-types/time64
sidebar_position: 17
sidebar_label: 'Time64'
title: 'Time64'
---

# Time64

Time64データ型は、サブ秒精度で時間値を保存することを可能にします。DateTime64とは異なり、カレンダーの日付を含まず、時間のみを表現します。精度は、保存される値の分数秒における解像度を定義します。

ティックサイズ（精度）：10<sup>-precision</sup>秒。有効範囲：[ 0 : 9 ]。一般的に使用されるのは - 3（ミリ秒）、6（マイクロ秒）、9（ナノ秒）です。

**構文:**

``` sql
Time64(precision)
```

内部的に、Time64は日の始まりからのティックのInt64数としてデータを保存します（000:00:00.000000000）。ティックの解像度は精度パラメータによって決まります。オプションで、カラムレベルでタイムゾーンを指定でき、これにより時間値が解釈され、テキスト形式で表示される方法に影響を与えます。

DateTime64とは異なり、Time64は日付コンポーネントを保存せず、時間のみを表現します。詳細は[Time](../../sql-reference/data-types/time.md)を参照してください。

サポートされる値の範囲：\[000:00:00, 999:59:59.99999999\]

## 例 {#examples}

1. `Time64`型カラムを持つテーブルを作成し、データを挿入する：

``` sql
CREATE TABLE t64
(
    `timestamp` Time64(3),
    `event_id` UInt8
)
ENGINE = TinyLog;
```

``` sql
-- 時間を解析
-- - 1970-01-01からの秒数として解釈される整数から。
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

2. `Time64`値でのフィルタリング

``` sql
SELECT * FROM t64 WHERE timestamp = toTime64('100:00:00', 3);
```

``` text
   ┌─────timestamp─┬─event_id─┐
1. │ 100:00:00.000 │        3 │
   └───────────────┴──────────┘
```

`Time`とは異なり、`Time64`値は自動的に`String`から変換されません。

``` sql
SELECT * FROM t64 WHERE timestamp = toTime64(154600.123, 3);
```

``` text
   ┌─────timestamp─┬─event_id─┐
1. │ 042:56:40.123 │        2 │
   └───────────────┴──────────┘
```

挿入とは異なり、`toTime64`関数はすべての値を10進数のバリアントとして扱うため、精度は小数点の後に指定する必要があります。

3. `Time64`型値のタイムゾーンを取得する：

```sql
SELECT toTime64(now(), 3) AS column, toTypeName(column) AS x;
```

```text
   ┌────────column─┬─x─────────┐
1. │ 019:14:16.000 │ Time64(3) │
   └───────────────┴───────────┘
```


**参照**

- [型変換関数](../../sql-reference/functions/type-conversion-functions.md)
- [日付および時間に関する関数](../../sql-reference/functions/date-time-functions.md)
- [設定`date_time_input_format`](../../operations/settings/settings-formats.md#date_time_input_format)
- [設定`date_time_output_format`](../../operations/settings/settings-formats.md#date_time_output_format)
- [サーバー構成パラメータ`timezone`](../../operations/server-configuration-parameters/settings.md#timezone)
- [設定`session_timezone`](../../operations/settings.md#session_timezone)
- [日付および時間に関する演算子](../../sql-reference/operators/index.md#operators-for-working-with-dates-and-times)
- [`Date`データ型](../../sql-reference/data-types/date.md)
- [`Time`データ型](../../sql-reference/data-types/time.md)
- [`DateTime`データ型](../../sql-reference/data-types/datetime.md)

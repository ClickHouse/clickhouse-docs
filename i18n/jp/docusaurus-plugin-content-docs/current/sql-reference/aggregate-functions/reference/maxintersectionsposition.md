---
description: '最大交差数関数の出現位置を計算する集約関数。'
sidebar_position: 164
slug: /sql-reference/aggregate-functions/reference/maxintersectionsposition
title: 'maxIntersectionsPosition'
---


# maxIntersectionsPosition

[`maxIntersections`関数](./maxintersections.md)の出現位置を計算する集約関数です。

構文は次の通りです：

```sql
maxIntersectionsPosition(start_column, end_column)
```

**引数**

- `start_column` – 各インターバルの開始を表す数値カラム。`start_column`が`NULL`または0の場合、そのインターバルはスキップされます。

- `end_column` - 各インターバルの終了を表す数値カラム。`end_column`が`NULL`または0の場合、そのインターバルはスキップされます。

**返される値**

交差しているインターバルの最大数の開始位置を返します。

**例**

```sql
CREATE TABLE my_events (
    start UInt32,
    end UInt32
)
Engine = MergeTree
ORDER BY tuple();

INSERT INTO my_events VALUES
   (1, 3),
   (1, 6),
   (2, 5),
   (3, 7);
```

インターバルは次のようになります：

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

これらのインターバルのうち、3つは4の値を共有しており、2番目のインターバルから始まります：

```sql
SELECT maxIntersectionsPosition(start, end) FROM my_events;
```

レスポンス：
```response
2
```

言い換えれば、 `(1,6)` 行が交差する3つのインターバルの開始であり、3は交差するインターバルの最大数です。

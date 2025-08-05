---
description: 'maxIntersections 関数の出現位置を計算する集約関数です。'
sidebar_position: 164
slug: '/sql-reference/aggregate-functions/reference/maxintersectionsposition'
title: 'maxIntersectionsPosition'
---




# maxIntersectionsPosition

集約関数であり、[`maxIntersections`関数](./maxintersections.md)の出現位置を計算します。

構文は以下の通りです：

```sql
maxIntersectionsPosition(start_column, end_column)
```

**引数**

- `start_column` – 各区間の開始を示す数値カラム。`start_column`が`NULL`または0の場合、その区間はスキップされます。

- `end_column` - 各区間の終了を示す数値カラム。`end_column`が`NULL`または0の場合、その区間はスキップされます。

**戻り値**

最大の交差区間の開始位置を返します。

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

区間は以下のようになります：

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

これらの区間のうち、3つが共通して値4を持ち、これは2番目の区間から始まります：

```sql
SELECT maxIntersectionsPosition(start, end) FROM my_events;
```

レスポンス：
```response
2
```

言い換えれば、行 `(1,6)` が交差する3つの区間の開始点であり、3は交差する区間の最大数です。

---
description: '（すべての区間が少なくとも 1 回は互いに交差する場合に）ある区間群における相互の交差回数の最大値を計算する集約関数。'
sidebar_position: 163
slug: /sql-reference/aggregate-functions/reference/maxintersections
title: 'maxIntersections'
doc_type: 'reference'
---

# maxIntersections

すべての区間が少なくとも一度は互いに交差する場合に、区間群における交差回数の最大値を計算する集計関数です。

構文は次のとおりです。

```sql
maxIntersections(start_column, end_column)
```

**引数**

* `start_column` – 各区間の開始を表す数値列。`start_column` が `NULL` または 0 の場合、その区間はスキップされます。

* `end_column` - 各区間の終了を表す数値列。`end_column` が `NULL` または 0 の場合、その区間はスキップされます。

**戻り値**

互いに重なり合う区間数の最大値を返します。

**例**

```sql
CREATE TABLE my_events (
    start UInt32,
    end UInt32
)
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO my_events VALUES
   (1, 3),
   (1, 6),
   (2, 5),
   (3, 7);
```

インターバルは次のとおりです。

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

これらの区間のうち 3 つは共通の値を持ちます（その値は `4` ですが、どの値が共通かは重要ではなく、ここでは交差している個数を測定しています）。区間 `(1,3)` と `(3,7)` は端点を共有していますが、`maxIntersections` 関数では交差しているとは見なされません。

```sql
SELECT maxIntersections(start, end) FROM my_events;
```

レスポンス:

```response
3
```

最大区間が複数回出現する場合は、[`maxIntersectionsPosition` 関数](./maxintersectionsposition.md)を使用して、それらの出現回数と位置を特定できます。

---
description: '区間のグループにおいて、区間同士が互いに交差する回数の最大値を計算する集約関数（ただし、すべての区間が少なくとも 1 回は交差している場合）。'
sidebar_position: 163
slug: /sql-reference/aggregate-functions/reference/maxintersections
title: 'maxIntersections'
doc_type: 'reference'
---

# maxIntersections {#maxintersections}

区間のグループ内で、すべての区間が少なくとも一度は互いに交差する場合に、その交差回数の最大値を計算する集約関数です。

構文は次のとおりです。

```sql
maxIntersections(start_column, end_column)
```

**引数**

* `start_column` – 各インターバルの開始を表す数値カラム。`start_column` が `NULL` または 0 の場合、そのインターバルはスキップされます。

* `end_column` - 各インターバルの終了を表す数値カラム。`end_column` が `NULL` または 0 の場合、そのインターバルはスキップされます。

**戻り値**

交差するインターバルの最大数を返します。

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

間隔は次のようになります。

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

これらの区間のうち 3 つは共通の値を取ります（値は `4` ですが、どの値が共通かは重要ではなく、交差している区間の数を数えています）。区間 `(1,3)` と `(3,7)` は端点を共有していますが、`maxIntersections` 関数では交差しているとはみなされません。

```sql
SELECT maxIntersections(start, end) FROM my_events;
```

レスポンス:

```response
3
```

最大区間が複数回存在する場合は、[`maxIntersectionsPosition` 関数](./maxintersectionsposition.md)を使用して、その発生回数と位置を特定できます。

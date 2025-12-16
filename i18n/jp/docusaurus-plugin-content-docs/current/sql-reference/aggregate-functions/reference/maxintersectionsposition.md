---
description: 'maxIntersections 関数の結果が出現する位置を計算する集約関数。'
sidebar_position: 164
slug: /sql-reference/aggregate-functions/reference/maxintersectionsposition
title: 'maxIntersectionsPosition'
doc_type: 'reference'
---

# maxIntersectionsPosition {#maxintersectionsposition}

[`maxIntersections` 関数](./maxintersections.md) が出現する位置を計算する集計関数です。

構文は次のとおりです。

```sql
maxIntersectionsPosition(start_column, end_column)
```

**引数**

* `start_column` – 各インターバルの開始を表す数値型の列。`start_column` が `NULL` または 0 の場合、そのインターバルはスキップされます。

* `end_column` - 各インターバルの終了を表す数値型の列。`end_column` が `NULL` または 0 の場合、そのインターバルはスキップされます。

**戻り値**

最大数のインターバルが互いに重なり合う区間の開始位置を返します。

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

インターバルは以下のようになります。

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

これらの区間のうち 3 つはいずれも値 4 を含んでおり、それが 2 番目の区間から始まっていることに注目してください。

```sql
SELECT maxIntersectionsPosition(start, end) FROM my_events;
```

レスポンス:

```response
2
```

言い換えると、`(1,6)` の行は互いに交差する 3 つの区間が始まる位置であり、3 は交差する区間の最大本数です。

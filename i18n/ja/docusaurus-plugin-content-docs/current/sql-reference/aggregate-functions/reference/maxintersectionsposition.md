---
slug: /sql-reference/aggregate-functions/reference/maxintersectionsposition
sidebar_position: 164
title: maxIntersectionsPosition
---

# maxIntersectionsPosition

[`maxIntersections` 関数](./maxintersections.md) の出現位置を計算する集約関数です。

構文は以下の通りです：

```sql
maxIntersectionsPosition(start_column, end_column)
```

**引数**

- `start_column` – 各インターバルの開始を表す数値カラム。`start_column` が `NULL` または 0 の場合、インターバルはスキップされます。

- `end_column` - 各インターバルの終了を表す数値カラム。`end_column` が `NULL` または 0 の場合、インターバルはスキップされます。

**返される値**

最大数の交差したインターバルの開始位置を返します。

**例**

```sql
CREATE TABLE my_events (
    start UInt32,
    end UInt32
)
Engine = MergeTree
ORDER BY tuple();
```

以下の行を挿入します：

```sql
INSERT INTO my_events VALUES
   (1, 3),
   (1, 6),
   (2, 5),
   (3, 7);
```

インターバルは以下のようになります：

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

これらのインターバルのうち、3つのインターバルが値4で共通しており、2番目のインターバルから始まります：

```sql
SELECT maxIntersectionsPosition(start, end) FROM my_events;
```

レスポンス：
```response
2
```

言い換えれば、行 `(1,6)` は3つの交差するインターバルの開始点であり、3は交差するインターバルの最大数です。

---
'description': '集約関数で、maxIntersections 関数の発生位置を計算します。'
'sidebar_position': 164
'slug': '/sql-reference/aggregate-functions/reference/maxintersectionsposition'
'title': 'maxIntersectionsPosition'
'doc_type': 'reference'
---


# maxIntersectionsPosition

集約関数で、[`maxIntersections` 関数](./maxintersections.md) の出現位置を計算します。

構文は次のとおりです：

```sql
maxIntersectionsPosition(start_column, end_column)
```

**引数**

- `start_column` – 各インターバルの開始を表す数値カラム。`start_column` が `NULL` または 0 の場合、そのインターバルはスキップされます。

- `end_column` - 各インターバルの終了を表す数値カラム。`end_column` が `NULL` または 0 の場合、そのインターバルはスキップされます。

**戻り値**

交差するインターバルの最大数の開始位置を返します。

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

インターバルは次のようになります：

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

これらのインターバルのうち、3つが共通して値4を持ち、2番目のインターバルから始まっています：

```sql
SELECT maxIntersectionsPosition(start, end) FROM my_events;
```

応答：
```response
2
```

言い換えれば、 `(1,6)` 行は、交差する3つのインターバルの開始を示しており、3は交差するインターバルの最大数です。

---
'description': '聚合函数，计算 maxIntersections 函数的出现位置。'
'sidebar_position': 164
'slug': '/sql-reference/aggregate-functions/reference/maxintersectionsposition'
'title': 'maxIntersectionsPosition'
'doc_type': 'reference'
---


# maxIntersectionsPosition

聚合函数，计算[`maxIntersections`函数](./maxintersections.md)出现的位置。

语法为：

```sql
maxIntersectionsPosition(start_column, end_column)
```

**参数**

- `start_column` – 代表每个区间开始的数值列。如果`start_column`为`NULL`或0，则该区间将被跳过。

- `end_column` - 代表每个区间结束的数值列。如果`end_column`为`NULL`或0，则该区间将被跳过。

**返回值**

返回最大交叉区间的起始位置。

**示例**

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

这些区间如下所示：

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

注意，这三个区间都有值4，并且从第2个区间开始：

```sql
SELECT maxIntersectionsPosition(start, end) FROM my_events;
```

响应：
```response
2
```

换句话说，行`(1,6)`是3个交叉区间的开始，3是交叉的区间的最大数量。

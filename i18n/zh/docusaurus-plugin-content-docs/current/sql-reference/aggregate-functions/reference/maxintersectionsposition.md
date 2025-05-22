
# maxIntersectionsPosition

聚合函数，用于计算[`maxIntersections`函数](./maxintersections.md)的出现位置。

语法如下：

```sql
maxIntersectionsPosition(start_column, end_column)
```

**参数**

- `start_column` – 表示每个区间开始的数值列。如果`start_column`为`NULL`或0，则该区间将被跳过。

- `end_column` - 表示每个区间结束的数值列。如果`end_column`为`NULL`或0，则该区间将被跳过。

**返回值**

返回交集数量最多的区间的起始位置。

**示例**

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

这些区间如下所示：

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

请注意，这三个区间共同具有值4，并且它从第2个区间开始：

```sql
SELECT maxIntersectionsPosition(start, end) FROM my_events;
```

响应：
```response
2
```

换句话说， `(1,6)` 行是交集的3个区间的起始点，3是交集的区间数的最大值。


# maxIntersections

聚合函数，计算一组区间相互交叉的最大次数（如果所有区间至少交叉一次）。

语法如下：

```sql
maxIntersections(start_column, end_column)
```

**参数**

- `start_column` – 表示每个区间起始的数值列。如果 `start_column` 为 `NULL` 或 0，则该区间将被跳过。

- `end_column` - 表示每个区间结束的数值列。如果 `end_column` 为 `NULL` 或 0，则该区间将被跳过。

**返回值**

返回相交区间的最大数量。

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

这三个区间具有一个共同值（该值为 `4`，但共同值并不重要，我们测量的是交叉的数量）。区间 `(1,3)` 和 `(3,7)` 共享一个端点，但在 `maxIntersections` 函数中不被视为相交。

```sql
SELECT maxIntersections(start, end) FROM my_events;
```

响应：
```response
3
```

如果您有多个最大区间的出现，您可以使用 [`maxIntersectionsPosition` 函数](./maxintersectionsposition.md) 来定位这些出现的数量和位置。

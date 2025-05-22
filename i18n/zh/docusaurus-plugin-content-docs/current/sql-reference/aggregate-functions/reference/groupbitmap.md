
# groupBitmap

从无符号整数列中计算位图或聚合，返回 UInt64 类型的基数，如果添加后缀 -State，则返回 [bitmap object](../../../sql-reference/functions/bitmap-functions.md)。

```sql
groupBitmap(expr)
```

**参数**

`expr` – 结果为 `UInt*` 类型的表达式。

**返回值**

UInt64 类型的值。

**示例**

测试数据：

```text
UserID
1
1
2
3
```

查询：

```sql
SELECT groupBitmap(UserID) as num FROM t
```

结果：

```text
num
3
```

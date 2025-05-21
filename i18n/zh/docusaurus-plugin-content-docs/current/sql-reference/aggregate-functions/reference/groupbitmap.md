---
'description': '从无符号整数列进行位图或聚合计算，返回类型为 UInt64 的基数，如果添加后缀 -State，则返回一个位图对象'
'sidebar_position': 148
'slug': '/sql-reference/aggregate-functions/reference/groupbitmap'
'title': 'groupBitmap'
---




# groupBitmap

从无符号整数列生成位图或聚合计算，返回类型为 UInt64 的基数，如果添加后缀 -State，则返回 [位图对象](../../../sql-reference/functions/bitmap-functions.md)。

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

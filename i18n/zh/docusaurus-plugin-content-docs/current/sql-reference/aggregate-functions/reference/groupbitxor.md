---
'description': '对一系列数字应用按位`XOR`。'
'sidebar_position': 153
'slug': '/sql-reference/aggregate-functions/reference/groupbitxor'
'title': 'groupBitXor'
---




# groupBitXor

对一系列数字应用按位 `XOR` 操作。

```sql
groupBitXor(expr)
```

**参数**

`expr` – 结果为 `UInt*` 或 `Int*` 类型的表达式。

**返回值**

`UInt*` 或 `Int*` 类型的值。

**示例**

测试数据：

```text
binary     decimal
00101100 = 44
00011100 = 28
00001101 = 13
01010101 = 85
```

查询：

```sql
SELECT groupBitXor(num) FROM t
```

其中 `num` 是包含测试数据的列。

结果：

```text
binary     decimal
01101000 = 104
```

---
'description': '从一组字符串计算一个连接的字符串，可选地通过分隔符分隔，并可选地限制最大元素数量。'
'sidebar_label': 'groupConcat'
'sidebar_position': 363
'slug': '/sql-reference/aggregate-functions/reference/groupconcat'
'title': 'groupConcat'
---

计算从一组字符串中生成一个连接字符串，可以选择性地用分隔符分隔，和选择性地限制最多元素的数量。

**语法**

```sql
groupConcat[(delimiter [, limit])](expression);
```

**参数**

- `expression` — 输出要连接的字符串的表达式或列名。
- `delimiter` — 用于分隔连接值的 [字符串](../../../sql-reference/data-types/string.md)。此参数是可选的，如果未指定，将默认为空字符串或参数中的分隔符。

**参数**

- `delimiter` — 用于分隔连接值的 [字符串](../../../sql-reference/data-types/string.md)。此参数是可选的，如果未指定，将默认为空字符串。
- `limit` — 一个正的 [整数](../../../sql-reference/data-types/int-uint.md)，指定要连接的最大元素数量。如果存在更多元素，将忽略多余的元素。此参数是可选的。

:::note
如果指定了分隔符而没有限制，则必须将其作为第一个参数。如果同时指定了分隔符和限制，则分隔符必须在限制之前。

此外，如果将不同的分隔符指定为参数和参数，则只会使用参数中的分隔符。
:::

**返回值**

- 返回一个由列或表达式连接值构成的 [字符串](../../../sql-reference/data-types/string.md)。如果组没有元素或只有空元素，并且函数未指定对空值的处理，则结果是一个 Nullable 字符串，值为空。

**示例**

输入表：

```text
┌─id─┬─name─┐
│  1 │ John │
│  2 │ Jane │
│  3 │ Bob  │
└────┴──────┘
```

1.    基本用法，无分隔符：

查询：

```sql
SELECT groupConcat(Name) FROM Employees;
```

结果：

```text
JohnJaneBob
```

这将所有名称连接成一个连续字符串，没有任何分隔符。

2. 使用逗号作为分隔符：

查询：

```sql
SELECT groupConcat(', ')(Name)  FROM Employees;
```

或者

```sql
SELECT groupConcat(Name, ', ')  FROM Employees;
```

结果：

```text
John, Jane, Bob
```

此输出显示名称由逗号和空格分隔。

3. 限制连接元素的数量

查询：

```sql
SELECT groupConcat(', ', 2)(Name) FROM Employees;
```

结果：

```text
John, Jane
```

此查询将输出限制为前两个名称，即使表中有更多名称。

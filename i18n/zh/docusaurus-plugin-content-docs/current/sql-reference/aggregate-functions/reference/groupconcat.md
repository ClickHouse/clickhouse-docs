---
'description': 'Calculates a concatenated string from a group of strings, optionally
  separated by a delimiter, and optionally limited by a maximum number of elements.'
'sidebar_label': 'groupConcat'
'sidebar_position': 363
'slug': '/sql-reference/aggregate-functions/reference/groupconcat'
'title': 'groupConcat'
---



计算一个由一组字符串连接而成的字符串，可以选择性地通过分隔符分隔，且可以选择性地限制最大元素数量。

**语法**

```sql
groupConcat[(delimiter [, limit])](expression);
```

**参数**

- `expression` — 输出要连接字符串的表达式或列名。
- `delimiter` — 用于分隔连接值的 [字符串](../../../sql-reference/data-types/string.md)。此参数是可选的，默认为空字符串或从参数中指定的分隔符（如果未指定）。

**参数**

- `delimiter` — 用于分隔连接值的 [字符串](../../../sql-reference/data-types/string.md)。此参数是可选的，默认为空字符串（如果未指定）。
- `limit` — 一个正的 [整数](../../../sql-reference/data-types/int-uint.md)，指定要连接的最大元素数量。如果存在更多元素，则将忽略多余元素。此参数是可选的。

:::note
如果指定了分隔符而没有限制，则它必须是第一个参数。如果同时指定了分隔符和限制，则分隔符必须在限制之前。

此外，如果作为参数和参数指定了不同的分隔符，则仅使用来自参数的分隔符。
:::

**返回值**

- 返回一个由列或表达式的连接值组成的 [字符串](../../../sql-reference/data-types/string.md)。如果组没有元素或只有 null 元素，并且函数没有指定仅处理 null 值，结果将是一个带有 null 值的可空字符串。

**示例**

输入表：

```text
┌─id─┬─name─┐
│  1 │ John │
│  2 │ Jane │
│  3 │ Bob  │
└────┴──────┘
```

1.    基本用法，没有分隔符：

查询：

```sql
SELECT groupConcat(Name) FROM Employees;
```

结果：

```text
JohnJaneBob
```

这将所有名称连接成一个连续的字符串，没有任何分隔符。


2. 使用逗号作为分隔符：

查询：

```sql
SELECT groupConcat(', ')(Name)  FROM Employees;
```

或

```sql
SELECT groupConcat(Name, ', ')  FROM Employees;
```

结果：

```text
John, Jane, Bob
```

此输出显示了用逗号后跟空格分隔的名称。


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

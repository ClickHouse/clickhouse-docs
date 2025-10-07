---
'description': '计算来自字符串组的连接字符串，选项上可以用分隔符分隔，并且可以限制最大元素的数量。'
'sidebar_label': 'groupConcat'
'sidebar_position': 363
'slug': '/sql-reference/aggregate-functions/reference/groupconcat'
'title': 'groupConcat'
'doc_type': 'reference'
---

计算来自一组字符串的连接字符串，可以选择用分隔符分隔，并可选择限制最大元素数量。

**语法**

```sql
groupConcat[(delimiter [, limit])](expression);
```

别名: `group_concat`

**参数**

- `expression` — 输出要连接的字符串的表达式或列名。
- `delimiter` — 一个 [字符串](../../../sql-reference/data-types/string.md)，将用于分隔连接的值。该参数是可选的，默认为空字符串或未指定时从参数中提取的分隔符。

**参数说明**

- `delimiter` — 一个 [字符串](../../../sql-reference/data-types/string.md)，将用于分隔连接的值。该参数是可选的，默认为空字符串（如果未指定）。
- `limit` — 一个正的 [整数](../../../sql-reference/data-types/int-uint.md)，指定要连接的最大元素数量。如果存在多个元素，则多余的元素将被忽略。该参数是可选的。

:::note
如果只指定了分隔符而没有限制，则分隔符必须是第一个参数。如果同时指定了分隔符和限制，则分隔符必须在限制之前。

此外，如果作为参数和参数指定了不同的分隔符，则仅使用参数中的分隔符。
:::

**返回值**

- 返回由列或表达式的连接值组成的 [字符串](../../../sql-reference/data-types/string.md)。如果组没有元素或只有 null 元素，并且函数未指定对仅 null 值的处理，则结果是一个带有 null 值的 Nullable 字符串。

**示例**

输入表：

```text
┌─id─┬─name─┐
│  1 │ John │
│  2 │ Jane │
│  3 │ Bob  │
└────┴──────┘
```

1.    无分隔符的基本用法：

查询：

```sql
SELECT groupConcat(Name) FROM Employees;
```

结果：

```text
JohnJaneBob
```

这将所有名称连接成一个没有任何分隔符的连续字符串。

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

此输出显示名称用逗号后跟一个空格分隔。

3. 限制连接的元素数量

查询：

```sql
SELECT groupConcat(', ', 2)(Name) FROM Employees;
```

结果：

```text
John, Jane
```

此查询将输出限制为前两个名称，即使表中有更多名称。

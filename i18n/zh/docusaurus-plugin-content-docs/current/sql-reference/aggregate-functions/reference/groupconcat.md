计算来自字符串组的连接字符串，选项是用分隔符分隔，并可选地限制最大元素个数。

**语法**

```sql
groupConcat[(delimiter [, limit])](expression);
```

**参数**

- `expression` — 输出要连接字符串的表达式或列名称。
- `delimiter` — 用于分隔连接值的 [字符串](../../../sql-reference/data-types/string.md)。此参数是可选的，默认值为空字符串或未指定的参数中的分隔符。

**参数**

- `delimiter` — 用于分隔连接值的 [字符串](../../../sql-reference/data-types/string.md)。此参数是可选的，默认值为空字符串。
- `limit` — 一个正 [整数](../../../sql-reference/data-types/int-uint.md)，指定要连接的最大元素个数。如果存在更多元素，则多余的元素将被忽略。此参数是可选的。

:::note
如果指定了分隔符而未指定限制，则它必须是第一个参数。如果同时指定了分隔符和限制，则分隔符必须在限制之前。

此外，如果作为参数和参数指定了不同的分隔符，则只使用参数中的分隔符。
:::

**返回值**

- 返回一个 [字符串](../../../sql-reference/data-types/string.md)，由列或表达式的连接值组成。如果组没有元素或仅包含空元素，并且函数未指定对仅空值的处理，则结果是一个值为 null 的可空字符串。

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

这将所有名字连接为一个连续的字符串，没有任何分隔符。


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

此输出显示了用逗号后跟一个空格分开的名字。


3. 限制连接元素的数量

查询：

```sql
SELECT groupConcat(', ', 2)(Name) FROM Employees;
```

结果：

```text
John, Jane
```

此查询将输出限制为前两个名字，即使表中有更多名字。

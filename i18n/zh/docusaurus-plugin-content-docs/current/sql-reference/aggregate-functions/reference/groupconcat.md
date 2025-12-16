---
description: '从一组字符串生成拼接后的字符串，可选使用分隔符分隔，并可选限制元素的最大数量。'
sidebar_label: 'groupConcat'
sidebar_position: 363
slug: /sql-reference/aggregate-functions/reference/groupconcat
title: 'groupConcat'
doc_type: 'reference'
---

从一组字符串生成拼接后的字符串，可选使用分隔符分隔，并可选限制元素的最大数量。

**语法**

```sql
groupConcat[(delimiter [, limit])](expression);
```

Alias: `group_concat`

**Arguments**

* `expression` — 输出为要被连接字符串的表达式或列名。
* `delimiter` — 用于分隔被连接值的[字符串](../../../sql-reference/data-types/string.md)。此参数为可选项，未指定时默认为空字符串，或使用在 Parameters 中提供的分隔符。

**Parameters**

* `delimiter` — 用于分隔被连接值的[字符串](../../../sql-reference/data-types/string.md)。此参数为可选项，未指定时默认为空字符串。
* `limit` — 指定要连接的最大元素数量的正[整数](../../../sql-reference/data-types/int-uint.md)。如果存在更多元素，超出的元素将被忽略。此参数为可选项。

:::note
如果仅指定了 delimiter 而未指定 limit，则 delimiter 必须是第一个参数。如果同时指定了 delimiter 和 limit，则 delimiter 必须位于 limit 之前。

另外，如果在 Arguments 和 Parameters 中分别指定了不同的分隔符，将只使用 Arguments 中的分隔符。
:::

**Returned value**

* 返回由列或表达式的连接值组成的[字符串](../../../sql-reference/data-types/string.md)。如果分组中没有元素或仅包含 null 元素，并且函数未指定仅 null 值的处理方式，则结果为一个值为 null 的可空字符串。

**Examples**

输入表：

```text
┌─id─┬─name─┐
│  1 │ John │
│  2 │ Jane │
│  3 │ Bob  │
└────┴──────┘
```

1. 不带分隔符的基本用法：

查询：

```sql
SELECT groupConcat(Name) FROM Employees;
```

结果：

```text
JohnJaneBob
```

这会将所有名称连接成一个没有任何分隔符的连续字符串。

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

输出结果显示名称之间以逗号和空格分隔。

3. 限制拼接元素的数量

查询：

```sql
SELECT groupConcat(', ', 2)(Name) FROM Employees;
```

结果：

```text
John, Jane
```

此查询仅返回前两个名称，即使表中还有更多名称。

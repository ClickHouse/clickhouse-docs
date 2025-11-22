---
description: '从一组字符串生成一个拼接后的字符串，可选使用分隔符分隔，并可选限制元素的最大数量。'
sidebar_label: 'groupConcat'
sidebar_position: 363
slug: /sql-reference/aggregate-functions/reference/groupconcat
title: 'groupConcat'
doc_type: 'reference'
---

从一组字符串生成一个拼接后的字符串，可选使用分隔符分隔，并可选限制元素的最大数量。

**语法**

```sql
groupConcat[(delimiter [, limit])](expression);
```

Alias: `group_concat`

**参数**

* `expression` — 输出要连接字符串的表达式或列名。
* `delimiter` — 用于分隔连接值的[字符串](../../../sql-reference/data-types/string.md)。此参数为可选；如果未在此处指定，但在“参数说明”中的参数里指定了分隔符，则使用参数中的分隔符，否则默认为空字符串。

**参数说明**

* `delimiter` — 用于分隔连接值的[字符串](../../../sql-reference/data-types/string.md)。此参数为可选，未指定时默认为空字符串。
* `limit` — 指定最多要连接元素个数的正[整数](../../../sql-reference/data-types/int-uint.md)。如果存在更多元素，超出部分将被忽略。此参数为可选。

:::note
如果只指定了 delimiter 而未指定 limit，则 delimiter 必须是第一个参数。如果同时指定了 delimiter 和 limit，则 delimiter 必须在 limit 之前。

另外，如果在参数（parameters）和实参（arguments）中分别指定了不同的分隔符，将只使用 arguments 中的分隔符。
:::

**返回值**

* 返回一个由列或表达式的值连接而成的[字符串](../../../sql-reference/data-types/string.md)。如果分组中没有元素或只有 null 元素，且函数未对仅包含 null 值的情况进行特殊处理，则结果为带有 null 值的可为空字符串。

**示例**

输入表：

```text
┌─id─┬─name─┐
│  1 │ John │
│  2 │ Jane │
│  3 │ Bob  │
└────┴──────┘
```

1. 无分隔符的基本用法：

查询：

```sql
SELECT groupConcat(Name) FROM Employees;
```

结果：

```text
JohnJaneBob
```

这会将所有名称拼接为一个没有任何分隔符的连续字符串。

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

此输出显示名称之间以逗号和空格分隔。

3. 限制拼接元素的数量

查询：

```sql
SELECT groupConcat(', ', 2)(Name) FROM Employees;
```

结果：

```text
John, Jane
```

此查询只返回前两个名称，即使表中还有更多名称。

---
slug: /sql-reference/aggregate-functions/reference/groupconcat
sidebar_position: 363
sidebar_label: groupConcat
title: "groupConcat"
description: "从一组字符串中计算出一个连接字符串，可以选择用分隔符分开，并可选择限制最大元素数量。"
---

从一组字符串中计算出一个连接字符串，可以选择用分隔符分开，并可选择限制最大元素数量。

**语法**

``` sql
groupConcat[(delimiter [, limit])](expression);
```

**参数**

- `expression` — 输出要连接的字符串的表达式或列名。
- `delimiter` — 用于分隔连接值的 [字符串](../../../sql-reference/data-types/string.md)。该参数是可选的，默认为空字符串或参数中的分隔符（如果未指定）。

**参数说明**

- `delimiter` — 用于分隔连接值的 [字符串](../../../sql-reference/data-types/string.md)。该参数是可选的，默认为空字符串（如果未指定）。
- `limit` — 一个正的 [整数](../../../sql-reference/data-types/int-uint.md)，指定要连接的最大元素数量。如果存在更多元素，多余的元素将被忽略。该参数是可选的。

:::note
如果指定了分隔符而没有限制，它必须是第一个参数。如果同时指定了分隔符和限制，分隔符必须在限制之前。

此外，如果将不同的分隔符作为参数和参数指定，则仅使用参数中的分隔符。
:::

**返回值**

- 返回一个由列或表达式的连接值组成的 [字符串](../../../sql-reference/data-types/string.md)。如果组没有元素或仅有空元素，并且函数未指定仅处理空值，则结果是一个 nullable 字符串，值为 null。

**示例**

输入表：

``` text
┌─id─┬─name─┐
│  1 │ John │
│  2 │ Jane │
│  3 │ Bob  │
└────┴──────┘
```

1.	不使用分隔符的基本用法：

查询：

``` sql
SELECT groupConcat(Name) FROM Employees;
```

结果：

``` text
JohnJaneBob
```

这将所有名字连接成一个连续的字符串，没有任何分隔符。


2. 使用逗号作为分隔符：

查询：

``` sql
SELECT groupConcat(', ')(Name)  FROM Employees;
```

或

``` sql
SELECT groupConcat(Name, ', ')  FROM Employees;
```

结果：

``` text
John, Jane, Bob
```

该输出显示了用逗号后跟空格分隔的名字。


3. 限制连接元素的数量

查询：

``` sql
SELECT groupConcat(', ', 2)(Name) FROM Employees;
```

结果：

``` text
John, Jane
```

该查询将输出限制为前两个名字，即使表中有更多名字。

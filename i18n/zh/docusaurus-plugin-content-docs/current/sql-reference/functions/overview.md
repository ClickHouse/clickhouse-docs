---
description: '常规函数文档'
sidebar_label: '概述'
sidebar_position: 1
slug: /sql-reference/functions/overview
title: '常规函数'
doc_type: 'reference'
---

# 常规函数 {#regular-functions}

函数至少有\*两种类型 —— 常规函数（通常就直接称为“函数”）和聚合函数。这是完全不同的概念。常规函数的工作方式就像是对每一行单独应用（对于每一行，函数的结果不依赖于其他行）。聚合函数则会从多行中累积一组值（即它们依赖于整组行）。

本节讨论的是常规函数。关于聚合函数，请参阅“聚合函数”一节。

:::note 
还有第三类函数，其中 ['arrayJoin' 函数](../functions/array-join.md)就属于该类。另外，[表函数](../table-functions/index.md)也可以单独归为一类。
:::

## 强类型 {#strong-typing}

与标准 SQL 不同，ClickHouse 使用强类型。换句话说，它不会在类型之间进行隐式转换。每个函数仅适用于特定的一组类型。因此，有时需要使用类型转换函数。

## 公共子表达式消除 {#common-subexpression-elimination}

查询中所有具有相同 AST（相同的抽象语法树结构或相同的语法解析结果）的表达式都被视为具有相同的值。此类表达式会被合并后只执行一次。相同的子查询也会以这种方式被消除。

## 结果类型 {#types-of-results}

所有函数都返回单个值作为结果（既不会返回多个值，也不会不返回值）。结果类型通常仅由参数类型决定，而不是由参数值决定。例外是 `tupleElement` 函数（`a.N` 运算符）和 `toFixedString` 函数。

## 常量 {#constants}

为简化处理，某些函数在部分参数上只能使用常量。例如，LIKE 运算符的右侧参数必须是常量。
几乎所有函数在其参数是常量时都会返回常量。例外是生成随机数的函数。
`now` 函数对于在不同时间运行的查询会返回不同的值，但结果仍被视为常量，因为是否为常量只在单个查询内部才重要。
常量表达式也被视为常量（例如，LIKE 运算符的右半部分可以由多个常量拼接而成）。

对于常量参数和非常量参数，函数可以采用不同的实现方式（执行不同的代码）。但是，对于一个常量和一个仅包含相同值的实际列，它们的计算结果应当一致。

## NULL 处理 {#null-processing}

函数具有以下行为：

- 如果函数的至少一个参数为 `NULL`，则函数结果也为 `NULL`。
- 某些函数具有在各自描述中单独说明的特殊行为。在 ClickHouse 源代码中，这些函数将 `UseDefaultImplementationForNulls` 设为 `false`。

## 不变性 {#constancy}

函数不能更改其参数的值——任何修改都会通过返回结果体现出来。因此，单独计算各个函数的结果与这些函数在查询中的书写顺序无关。

## 高阶函数 {#higher-order-functions}

### `->` 运算符和 lambda(params, expr) 函数 {#arrow-operator-and-lambda}

高阶函数只能接受 lambda 函数作为其函数型参数。要将 lambda 函数传递给高阶函数，请使用 `->` 运算符。箭头左侧是形式参数，可以是任意 ID，或者多个形式参数——元组中的任意 ID。箭头右侧是一个表达式，该表达式可以使用这些形式参数以及任意表的列。

示例：

```python
x -> 2 * x
str -> str != Referer
```

接收多个参数的 lambda 函数也可以作为参数传递给高阶函数。在这种情况下，会将若干长度相同的数组传递给高阶函数，这些参数分别对应这些数组中的元素。

对于某些函数，可以省略第一个参数（lambda 函数）。在这种情况下，默认认为执行的是恒等映射。

## 用户自定义函数（UDF） {#user-defined-functions-udfs}

ClickHouse 支持用户自定义函数（UDF）。请参阅[用户自定义函数（UDF）](../functions/udf.md)。

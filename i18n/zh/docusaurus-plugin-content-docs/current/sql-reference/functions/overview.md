---
description: '常规函数文档'
sidebar_label: '概览'
sidebar_position: 1
slug: /sql-reference/functions/overview
title: '常规函数'
doc_type: 'reference'
---



# 常规函数

函数至少有\*两种类型——常规函数（通常直接称为“函数”）和聚合函数。这是两个完全不同的概念。常规函数可以看作是分别应用到每一行上（对于每一行，函数的结果不依赖于其他行）。聚合函数会从多行中累积一组值（即它们依赖于整组行）。

本节讨论常规函数。关于聚合函数，请参阅“聚合函数”一节。

:::note 
还有第三种类型的函数，即 ['arrayJoin' 函数](../functions/array-join.md) 所归属的类型。另外，[表函数](../table-functions/index.md) 通常也单独介绍。
:::



## 强类型 {#strong-typing}

与标准 SQL 不同,ClickHouse 具有强类型特性。换句话说,它不会在类型之间进行隐式转换。每个函数仅适用于特定的类型集合。这意味着有时需要使用类型转换函数。


## 公共子表达式消除 {#common-subexpression-elimination}

查询中所有具有相同 AST(相同记录或相同语法解析结果)的表达式被视为具有相同的值。这些表达式会被合并并仅执行一次。相同的子查询也会以这种方式被消除。


## 结果类型 {#types-of-results}

所有函数都返回单个值作为结果(既不返回多个值,也不返回零个值)。结果的类型通常仅由参数的类型决定,而非由参数的值决定。例外情况包括 tupleElement 函数(a.N 运算符)和 toFixedString 函数。


## 常量 {#constants}

为简化处理,某些函数的部分参数只能使用常量。例如,LIKE 运算符的右侧参数必须是常量。
几乎所有函数在接收常量参数时都会返回常量结果。例外情况是生成随机数的函数。
'now' 函数在不同时间运行的查询中会返回不同的值,但其结果仍被视为常量,因为常量性仅在单个查询范围内有意义。
常量表达式也被视为常量(例如,LIKE 运算符的右侧部分可以由多个常量构成)。

函数可以针对常量参数和非常量参数采用不同的实现方式(执行不同的代码)。但是,常量的结果应该与仅包含相同值的实际列的结果保持一致。


## NULL 处理 {#null-processing}

函数具有以下行为：

- 如果函数的任一参数为 `NULL`，则函数结果也为 `NULL`。
- 特殊行为在各函数的说明中单独指定。在 ClickHouse 源代码中，这些函数的 `UseDefaultImplementationForNulls=false`。


## 常量性 {#constancy}

函数不能修改其参数的值——任何修改都将作为结果返回。因此,各个函数的计算结果不依赖于它们在查询中的书写顺序。


## 高阶函数 {#higher-order-functions}

### `->` 运算符和 lambda(params, expr) 函数 {#arrow-operator-and-lambda}

高阶函数只能接受 lambda 函数作为其函数参数。要将 lambda 函数传递给高阶函数,需使用 `->` 运算符。箭头左侧为形式参数,可以是任意标识符,或多个形式参数——即元组中的任意标识符。箭头右侧为表达式,该表达式可以使用这些形式参数以及任何表列。

示例:

```python
x -> 2 * x
str -> str != Referer
```

接受多个参数的 lambda 函数也可以传递给高阶函数。在这种情况下,需要向高阶函数传递多个长度相同的数组,这些参数将分别与之对应。

对于某些函数,第一个参数(lambda 函数)可以省略。在这种情况下,将假定为恒等映射。


## 用户自定义函数 (UDF) {#user-defined-functions-udfs}

ClickHouse 支持用户自定义函数。详见 [UDF](../functions/udf.md)。

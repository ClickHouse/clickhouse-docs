---
'description': 'Regular Functions 的文档'
'sidebar_label': '概述'
'sidebar_position': 1
'slug': '/sql-reference/functions/overview'
'title': '常规函数'
'doc_type': 'reference'
---


# 常规函数

至少有两种类型的函数 - 常规函数（它们仅称为“函数”）和聚合函数。这是完全不同的概念。常规函数的工作方式是将其应用于每一行（对于每一行，函数的结果不依赖于其他行）。聚合函数从不同的行中累积一组值（即它们依赖于整个行集）。

在本节中，我们讨论常规函数。有关聚合函数，请参阅“聚合函数”部分。

:::note 
还有第三种类型的函数，属于 ['arrayJoin' 函数](../functions/array-join.md)。以及 [表函数](../table-functions/index.md) 也可单独提及。
:::

## 强类型 {#strong-typing}

与标准 SQL 相比，ClickHouse 具有强类型。换句话说，它不会在类型之间进行隐式转换。每个函数仅适用于特定类型集合。这意味着有时你需要使用类型转换函数。

## 公共子表达式消除 {#common-subexpression-elimination}

在查询中，所有具有相同 AST（相同记录或相同语法解析结果）的表达式被认为具有相同的值。这些表达式被合并并执行一次。同样，标识相同的子查询也以这种方式消除。

## 结果类型 {#types-of-results}

所有函数返回一个单一值作为结果（不是多个值，也不是零值）。结果的类型通常仅由参数的类型定义，而不是由值定义。例外情况是 tupleElement 函数（a.N 运算符）和 toFixedString 函数。

## 常量 {#constants}

为了简单起见，某些函数只能对一些参数使用常量。例如，LIKE 运算符的右侧参数必须是一个常量。几乎所有函数对于常量参数返回一个常量。唯一的例外是生成随机数的函数。'now' 函数对在不同时间运行的查询返回不同的值，但结果被视为常量，因为在单个查询中，常量性才是重要的。常量表达式也被视为常量（例如，LIKE 运算符的右半部分可以由多个常量构成）。

函数可以针对常量和非常量参数以不同的方式实现（执行不同的代码）。但是，对于包含相同值的常量和真正的列，其结果应相互匹配。

## NULL 处理 {#null-processing}

函数具有以下行为：

- 如果函数的至少一个参数是 `NULL`，则函数结果也为 `NULL`。
- 特殊行为在每个函数的描述中单独指定。在 ClickHouse 源代码中，这些函数具有 `UseDefaultImplementationForNulls=false`。

## 常量性 {#constancy}

函数无法改变其参数的值 - 任何更改都作为结果返回。因此，计算单独函数的结果不依赖于查询中函数书写的顺序。

## 高阶函数 {#higher-order-functions}

### `->` 运算符和 lambda(params, expr) 函数 {#arrow-operator-and-lambda}

高阶函数只能将 lambda 函数作为其功能参数。要将 lambda 函数传递给高阶函数，请使用 `->` 运算符。箭头的左侧有一个形式参数，可以是任何 ID，或者多个形式参数 - 任何元组中的 ID。箭头的右侧有一个可以使用这些形式参数以及任何表列的表达式。

示例：

```python
x -> 2 * x
str -> str != Referer
```

接受多个参数的 lambda 函数也可以传递给高阶函数。在这种情况下，传递给高阶函数的多个数组具有相同的长度，这些参数将与之对应。

对于某些函数，第一个参数（lambda 函数）可以省略。在这种情况下，假定相同的映射。

## 用户定义函数 (UDFs) {#user-defined-functions-udfs}

ClickHouse 支持用户定义函数。请参阅 [UDFs](../functions/udf.md)。

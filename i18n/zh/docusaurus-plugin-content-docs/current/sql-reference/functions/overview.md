---
'description': 'Documentation for Regular Functions'
'sidebar_label': '概述'
'sidebar_position': 1
'slug': '/sql-reference/functions/overview'
'title': '常规函数'
---


# 正规函数

至少有两种类型的函数 - 正规函数（它们被称为“函数”）和聚合函数。这是完全不同的概念。正规函数的工作方式是将其应用于每一行（对于每一行，函数的结果不依赖于其他行）。聚合函数从不同的行中累积一组值（即，它们依赖于整个行集）。

在本节中，我们讨论正规的函数。有关聚合函数，请参阅“聚合函数”部分。

:::note 
还有第三种函数类型，属于 ['arrayJoin' 函数](../functions/array-join.md)。另外，[表函数](../table-functions/index.md) 也可以单独提及。
:::

## 强类型 {#strong-typing}

与标准 SQL 相比，ClickHouse 具有强类型。换句话说，它不会在类型之间进行隐式转换。每个函数仅对特定类型集有效。这意味着有时您需要使用类型转换函数。

## 公共子表达式消除 {#common-subexpression-elimination}

在查询中，具有相同 AST（相同记录或相同语法解析结果）的所有表达式被认为具有相同值。这些表达式被合并并执行一次。相同的子查询也以这种方式被消除。

## 结果类型 {#types-of-results}

所有函数返回一个单一值作为结果（而不是多个值，也不是零值）。结果的类型通常仅由参数的类型定义，而不是由值定义。例外是 tupleElement 函数（a.N 运算符）和 toFixedString 函数。

## 常量 {#constants}

为了简化，某些函数只能使用常量作为某些参数。例如，LIKE 运算符的右侧参数必须是常量。
几乎所有函数在常量参数时返回常量。例外是生成随机数的函数。
'now' 函数对于在不同时刻运行的查询返回不同值，但由于恒定性只在单个查询中重要，因此结果被视为常量。
常量表达式也被视为常量（例如，LIKE 运算符的右半部分可以由多个常量构成）。

函数可以针对常量和非常量参数以不同方式实现（执行不同的代码）。但对于常量和只包含相同值的真实列，结果应彼此匹配。

## NULL 处理 {#null-processing}

函数具有以下行为：

- 如果函数的至少一个参数为 `NULL`，那么函数的结果也是 `NULL`。
- 在每个函数的描述中单独指定的特殊行为。在 ClickHouse 源代码中，这些函数的 `UseDefaultImplementationForNulls=false`。

## 恒定性 {#constancy}

函数不能更改其参数的值 - 任何更改都作为结果返回。因此，单个函数的计算结果不依赖于它们在查询中书写的顺序。

## 高阶函数 {#higher-order-functions}

### `->` 运算符和 lambda(params, expr) 函数 {#arrow-operator-and-lambda}

高阶函数只能接受 lambda 函数作为其功能参数。要将 lambda 函数传递给高阶函数，请使用 `->` 运算符。箭头的左侧有一个形式参数，可以是任何 ID，或多个形式参数 - 元组中的任何 ID。箭头的右侧有一个表达式，可以使用这些形式参数，以及任何表列。

示例：

```python
x -> 2 * x
str -> str != Referer
```

接受多个参数的 lambda 函数也可以传递给高阶函数。在这种情况下，高阶函数接收多个长度相同的数组，这些参数将与之对应。

对于某些函数，第一参数（lambda 函数）可以省略。在这种情况下，假定采用相同的映射。

## 用户定义函数 (UDFs) {#user-defined-functions-udfs}

ClickHouse 支持用户定义的函数。请参见 [UDFs](../functions/udf.md)。

---
'description': 'Regular Functions 文档'
'sidebar_label': '概述'
'sidebar_position': 1
'slug': '/sql-reference/functions/overview'
'title': '常规函数'
---




# 常规函数

至少有两种类型的函数 - 常规函数（它们通常被称为“函数”）和聚合函数。这是完全不同的概念。常规函数的工作方式是针对每一行单独应用（对于每一行，函数的结果不依赖于其他行）。聚合函数则从多个行中累积一组值（即，它们依赖于整组行）。

在本节中，我们讨论常规函数。有关聚合函数，请参见“聚合函数”部分。

:::note 
还有第三种类型的函数，即 ['arrayJoin' 函数](../functions/array-join.md)。同时也可以单独提到 [表函数](../table-functions/index.md)。
:::

## 强类型 {#strong-typing}

与标准 SQL 相比，ClickHouse 采用强类型。换句话说，它不会在类型之间进行隐式转换。每个函数都适用于特定的类型集。这意味着有时你需要使用类型转换函数。

## 公共子表达式消除 {#common-subexpression-elimination}

查询中所有具有相同 AST（相同记录或相同语法解析结果）的表达式被认为具有相同的值。这些表达式会被连接并执行一次。相同的子查询也以这种方式被消除。

## 结果类型 {#types-of-results}

所有函数返回单个值作为结果（不是多个值，也不是零值）。结果的类型通常仅由参数的类型定义，而不是由值定义。例外情况是 tupleElement 函数（a.N 操作符）和 toFixedString 函数。

## 常量 {#constants}

为了简化，某些函数只能对某些参数使用常量。例如，LIKE 操作符的右侧参数必须是常量。
几乎所有函数对于常量参数都返回常量。例外是生成随机数的函数。
'now' 函数对于不同时间运行的查询返回不同的值，但结果被视为常量，因为在单个查询中常量性才是重要的。
常量表达式也被视为常量（例如，LIKE 操作符的右半部分可以由多个常量构成）。

对于常量参数和非常量参数，函数的实现方式可能不同（执行不同的代码）。但对于常量和只包含相同值的实际列，结果应该彼此匹配。

## NULL 处理 {#null-processing}

函数具有以下行为：

- 如果函数的至少一个参数为 `NULL`，则函数结果也为 `NULL`。
- 具体在每个函数描述中指定的特殊行为。在 ClickHouse 源代码中，这些函数的 `UseDefaultImplementationForNulls=false`。

## 不变性 {#constancy}

函数不能改变其参数的值 - 任何变化都作为结果返回。因此，单独函数计算的结果不依赖于函数在查询中书写的顺序。

## 高阶函数 {#higher-order-functions}

### `->` 操作符和 lambda(params, expr) 函数 {#arrow-operator-and-lambda}

高阶函数只能接受 lambda 函数作为它们的功能参数。要将 lambda 函数传递给高阶函数，请使用 `->` 操作符。箭头的左侧是一个形式参数，可以是任何 ID，或多个形式参数 - 以元组的形式的任何 ID。箭头的右侧是一个可以使用这些形式参数的表达式，此外还可以使用任何表列。

示例：

```python
x -> 2 * x
str -> str != Referer
```

接受多个参数的 lambda 函数也可以传递给高阶函数。在这种情况下，将多个相同长度的数组传递给高阶函数，以对应这些参数。

对于某些函数，第一个参数（lambda 函数）可以被省略。在这种情况下，假定使用相同的映射。

## 用户定义函数 (UDFs) {#user-defined-functions-udfs}

ClickHouse 支持用户定义函数。请参阅 [UDFs](../functions/udf.md)。

---
description: '函数文档'
sidebar_label: 'FUNCTION'
sidebar_position: 38
slug: /sql-reference/statements/create/function
title: 'CREATE FUNCTION - 用户定义函数 (UDF)'
doc_type: 'reference'
---

基于 lambda 表达式创建用户定义函数 (UDF)。该表达式必须由函数参数、常量、运算符或其他函数调用组成。

**语法**

```sql
CREATE [OR REPLACE] FUNCTION name [ON CLUSTER cluster] AS (parameter0, ...) -> expression
```

一个函数可以有任意数量的参数。

有以下几点限制：

* 函数名称在用户自定义函数和系统函数中必须是唯一的。
* 不允许递归函数。
* 函数使用的所有变量都必须在其参数列表中明确指定。

如果违反任何限制，将抛出异常。

**示例**

查询：

```sql
CREATE FUNCTION linear_equation AS (x, k, b) -> k*x + b;
SELECT number, linear_equation(number, 2, 1) FROM numbers(3);
```

结果：

```text
┌─number─┬─plus(multiply(2, number), 1)─┐
│      0 │                            1 │
│      1 │                            3 │
│      2 │                            5 │
└────────┴──────────────────────────────┘
```

在下面的查询中，在一个用户定义函数中调用了[条件函数](../../../sql-reference/functions/conditional-functions.md)：

```sql
CREATE FUNCTION parity_str AS (n) -> if(n % 2, 'odd', 'even');
SELECT number, parity_str(number) FROM numbers(3);
```

结果：

```text
┌─number─┬─if(modulo(number, 2), 'odd', 'even')─┐
│      0 │ even                                 │
│      1 │ odd                                  │
│      2 │ even                                 │
└────────┴──────────────────────────────────────┘
```

替换现有 UDF：

```sql
CREATE FUNCTION exampleReplaceFunction AS frame -> frame;
SELECT create_query FROM system.functions WHERE name = 'exampleReplaceFunction';
CREATE OR REPLACE FUNCTION exampleReplaceFunction AS frame -> frame + 1;
SELECT create_query FROM system.functions WHERE name = 'exampleReplaceFunction';
```

结果：

```text
┌─create_query─────────────────────────────────────────────┐
│ CREATE FUNCTION exampleReplaceFunction AS frame -> frame │
└──────────────────────────────────────────────────────────┘

┌─create_query───────────────────────────────────────────────────┐
│ CREATE FUNCTION exampleReplaceFunction AS frame -> (frame + 1) │
└────────────────────────────────────────────────────────────────┘
```


## 相关内容 \\{#related-content\\}

### [可执行 UDF](/sql-reference/functions/udf.md). \\{#executable-udfs\\}

### [ClickHouse Cloud 中的用户自定义函数](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) \\{#user-defined-functions-in-clickhouse-cloud\\}
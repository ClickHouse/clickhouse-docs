---
description: '函数文档'
sidebar_label: '函数'
sidebar_position: 38
slug: /sql-reference/statements/create/function
title: 'CREATE FUNCTION - 用户自定义函数 (UDF)'
doc_type: 'reference'
---

从 Lambda 表达式创建用户自定义函数 (UDF)。该表达式只能由函数参数、常量、运算符或其他函数调用组成。

**语法**

```sql
创建 函数 name [在 集群 cluster 上] 为 (parameter0, ...) -> 表达式
```

函数可以具有任意数量的参数。

有以下几个限制：

* 函数名在用户自定义函数和系统函数中必须是唯一的。
* 不允许使用递归函数。
* 函数使用的所有变量必须在其参数列表中指定。

如果违反任一限制，将抛出异常。

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

下面这个查询在用户自定义函数中调用了一个[条件函数](../../../sql-reference/functions/conditional-functions.md)：

```sql
CREATE FUNCTION parity_str AS (n) -> if(n % 2, '奇数', '偶数');
SELECT number, parity_str(number) FROM numbers(3);
```

结果：

```text
┌─number─┬─if(modulo(number, 2), '奇数', '偶数')─┐
│      0 │ 偶数                                 │
│      1 │ 奇数                                 │
│      2 │ 偶数                                 │
└────────┴──────────────────────────────────────┘
```


## 相关内容 {#related-content}

### [可执行 UDF（用户自定义函数）](/sql-reference/functions/udf.md) {#executable-udfs}

### [ClickHouse Cloud 中的用户自定义函数](https://clickhouse.com/blog/user-defined-functions-clickhouse-udfs) {#user-defined-functions-in-clickhouse-cloud}

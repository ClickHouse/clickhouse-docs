---
title: 'ClickHouse 支持哪些 SQL 语法？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/sql
description: 'ClickHouse 完全支持 SQL 语法'
doc_type: 'reference'
keywords: ['SQL 语法', 'ANSI SQL']
---

# ClickHouse 支持哪些 SQL 语法？ \\{#what-sql-syntax-does-clickhouse-support\\}

ClickHouse 对 SQL 语法提供了完整支持，包括以下特性：

* SQL/JSON 和 JSON 数据类型（SQL-2023）
* 窗口函数（SQL-2003）
* 公用表表达式和递归查询（SQL-1999）
* ROLLUP、CUBE 和 GROUPING SETS（SQL-1999）
* 对 RBAC 的完整支持（SQL-1999）
* 关联子查询（SQL-1992）

这一支持已经通过 TPC-H 和 TPC-DS 基准测试以及 SQLTest 得到验证。

ClickHouse 在许多特性被 ISO/IEC 标准化之前就已经引入了它们，例如：

* 条件聚合函数
* `any` 聚合函数
* `least` 和 `greatest`
* `GROUP BY ALL`
* 对别名的扩展使用
* 数字字面量中的下划线

ClickHouse 通过引入大量提升使用体验的改进来扩展 SQL：

* 不受限制地使用别名
* WITH 子句中的别名
* 聚合函数组合器
* 参数化聚合函数
* 近似聚合函数
* 原生大整数数值类型和扩展精度小数类型
* 用于数组操作的高阶函数
* ARRAY JOIN 子句和 arrayJoin 函数
* 数组聚合
* LIMIT BY 子句
* GROUP BY WITH TOTALS
* AS OF JOIN
* ANY/ALL JOIN
* 更自然的 JSON 语法
* 列表中的尾随逗号
* FROM ... SELECT 子句顺序
* 类型安全的查询参数和参数化视图

其中一些特性有机会被纳入即将发布的 SQL 标准，而它们已经可以在 ClickHouse 中使用。
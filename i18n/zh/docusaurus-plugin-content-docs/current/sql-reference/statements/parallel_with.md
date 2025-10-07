---
'description': 'PARALLEL WITH 子句的文档'
'sidebar_label': 'PARALLEL WITH'
'sidebar_position': 53
'slug': '/sql-reference/statements/parallel_with'
'title': 'PARALLEL WITH 子句'
'doc_type': 'reference'
---


# PARALLEL WITH 子句

允许并行执行多个语句。

## 语法 {#syntax}

```sql
statement1 PARALLEL WITH statement2 [PARALLEL WITH statement3 ...]
```

并行执行语句 `statement1`、`statement2`、`statement3`，...。这些语句的输出被舍弃。

在许多情况下，使用并行执行语句可能比单纯顺序执行相同的语句更快。例如，`statement1 PARALLEL WITH statement2 PARALLEL WITH statement3` 可能比 `statement1; statement2; statement3` 更快。

## 示例 {#examples}

并行创建两个表：

```sql
CREATE TABLE table1(x Int32) ENGINE = MergeTree ORDER BY tuple()
PARALLEL WITH
CREATE TABLE table2(y String) ENGINE = MergeTree ORDER BY tuple();
```

并行删除两个表：

```sql
DROP TABLE table1
PARALLEL WITH
DROP TABLE table2;
```

## 设置 {#settings}

设置 [max_threads](../../operations/settings/settings.md#max_threads) 控制生成多少线程。

## 与 UNION 的比较 {#comparison-with-union}

`PARALLEL WITH` 子句与 [UNION](select/union.md) 有点相似，后者也并行执行其操作数。然而，有一些差异：
- `PARALLEL WITH` 不会返回其操作数执行的任何结果，如果有的话只能重新抛出异常；
- `PARALLEL WITH` 不要求其操作数具有相同的结果列集；
- `PARALLEL WITH` 可以执行任何语句（不仅限于 `SELECT`）。

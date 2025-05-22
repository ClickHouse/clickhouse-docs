
# PARALLEL WITH 从句

允许并行执行多个语句。

## 语法 {#syntax}

```sql
statement1 PARALLEL WITH statement2 [PARALLEL WITH statement3 ...]
```

并行执行语句 `statement1`、`statement2`、`statement3` 等等。这些语句的输出会被丢弃。

在许多情况下，平行执行语句可能比仅仅依次执行相同的语句更快。例如，`statement1 PARALLEL WITH statement2 PARALLEL WITH statement3` 很可能比 `statement1; statement2; statement3` 更快。

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

设置 [max_threads](../../operations/settings/settings.md#max_threads) 控制生成的线程数量。

## 与 UNION 的比较 {#comparison-with-union}

`PARALLEL WITH` 从句与 [UNION](select/union.md) 有点相似，后者也并行执行其操作数。然而，它们之间有一些区别：
- `PARALLEL WITH` 不会返回执行其操作数的任何结果，只能在出现异常时重新抛出异常；
- `PARALLEL WITH` 不要求其操作数具有相同的结果列集合；
- `PARALLEL WITH` 可以执行任何语句（不仅限于 `SELECT`）。

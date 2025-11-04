---
'description': '用于测试目的，作为生成许多行的最快方法。类似于 `system.zeros` 和 `system.zeros_mt` 系统表。'
'sidebar_label': '零'
'sidebar_position': 145
'slug': '/sql-reference/table-functions/zeros'
'title': '零'
'doc_type': 'reference'
---


# zeros 表函数

* `zeros(N)` – 返回一个包含单列 'zero'（UInt8）且包含整数 0 的表，长度为 `N`
* `zeros_mt(N)` – 与 `zeros` 相同，但使用多线程。

该函数用于测试目的，是生成许多行的最快方法。类似于 `system.zeros` 和 `system.zeros_mt` 系统表。

以下查询是等效的：

```sql
SELECT * FROM zeros(10);
SELECT * FROM system.zeros LIMIT 10;
SELECT * FROM zeros_mt(10);
SELECT * FROM system.zeros_mt LIMIT 10;
```

```response
┌─zero─┐
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
└──────┘
```

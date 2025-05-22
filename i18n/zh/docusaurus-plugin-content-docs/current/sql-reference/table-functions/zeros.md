
# zeros 表函数

* `zeros(N)` – 返回一个包含单列 'zero' (UInt8) 的表，该列包含整数 0 `N` 次
* `zeros_mt(N)` – 与 `zeros` 相同，但使用多个线程。

此函数用于测试目的，是生成许多行的最快方法。与 `system.zeros` 和 `system.zeros_mt` 系统表类似。

以下查询是等价的：

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

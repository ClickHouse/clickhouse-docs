生成随机数据表引擎生成指定表架构的随机数据。

使用示例：

- 用于测试，以填充可再现的大表。
- 生成模糊测试的随机输入。

## 在 ClickHouse 服务器中的使用 {#usage-in-clickhouse-server}

```sql
ENGINE = GenerateRandom([random_seed [,max_string_length [,max_array_length]]])
```

`max_array_length` 和 `max_string_length` 参数分别指定在生成的数据中所有数组或映射列和字符串的最大长度。

生成表引擎仅支持 `SELECT` 查询。

它支持所有可以存储在表中的 [DataTypes](../../../sql-reference/data-types/index.md)，但不包括 `AggregateFunction`。

## 示例 {#example}

**1.** 设置 `generate_engine_table` 表：

```sql
CREATE TABLE generate_engine_table (name String, value UInt32) ENGINE = GenerateRandom(1, 5, 3)
```

**2.** 查询数据：

```sql
SELECT * FROM generate_engine_table LIMIT 3
```

```text
┌─name─┬──────value─┐
│ c4xJ │ 1412771199 │
│ r    │ 1791099446 │
│ 7#$  │  124312908 │
└──────┴────────────┘
```

## 实现细节 {#details-of-implementation}

- 不支持：
    - `ALTER`
    - `SELECT ... SAMPLE`
    - `INSERT`
    - 索引
    - 复制

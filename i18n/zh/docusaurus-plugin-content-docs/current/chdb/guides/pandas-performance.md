---
title: '性能指南'
sidebar_label: '性能指南'
slug: /chdb/guides/pandas-performance
description: '针对 DataStore 与 pandas 的性能优化建议'
keywords: ['chdb', 'datastore', 'pandas', 'performance', 'benchmark', 'optimization']
doc_type: 'guide'
---

# 性能指南 \{#performance-guide\}

在许多操作场景下，DataStore 相较于 pandas 能提供显著的性能提升。本指南将解释其中原因，并介绍如何优化你的工作负载。

## 为什么 DataStore 更快 \{#why-faster\}

### 1. SQL 下推 \{#sql-pushdown\}

操作会被下推到数据源端执行：

```python
# pandas: Loads ALL data, then filters in memory
df = pd.read_csv("huge.csv")       # Load 10GB
df = df[df['year'] == 2024]        # Filter in Python

# DataStore: Filter at source
ds = pd.read_csv("huge.csv")       # Just metadata
ds = ds[ds['year'] == 2024]        # Filter in SQL
df = ds.to_df()                    # Only load filtered data
```


### 2. 列裁剪 \{#column-pruning\}

只读取所需的列：

```python
# DataStore: Only reads name, age columns
ds = pd.read_parquet("wide_table.parquet")
result = ds.select('name', 'age').to_df()

# vs pandas: Reads all 100 columns, then selects
```


### 3. 惰性计算 \{#lazy-evaluation\}

多个操作会被编译成单个查询：

```python
# DataStore: One optimized SQL query
result = (ds
    .filter(ds['amount'] > 100)
    .groupby('region')
    .agg({'amount': 'sum'})
    .sort('sum', ascending=False)
    .head(10)
    .to_df()
)

# Becomes:
# SELECT region, SUM(amount) FROM data
# WHERE amount > 100
# GROUP BY region ORDER BY sum DESC LIMIT 10
```

***


## 基准测试：DataStore 与 pandas \{#benchmark\}

### 测试环境 \{#test-environment\}

- 数据：1000 万行
- 硬件：一台标准笔记本电脑
- 文件格式：CSV

### 结果 \{#results\}

| 操作 | pandas (毫秒) | DataStore (毫秒) | 胜出者 |
|-----------|-------------|----------------|--------|
| GroupBy count | 347 | 17 | **DataStore (19.93x)** |
| 组合操作 | 1,535 | 234 | **DataStore (6.56x)** |
| 复杂流水线 | 2,047 | 380 | **DataStore (5.39x)** |
| 多重过滤 + 排序 + Head | 1,963 | 366 | **DataStore (5.36x)** |
| 过滤 + 排序 + Head | 1,537 | 350 | **DataStore (4.40x)** |
| Head/Limit | 166 | 45 | **DataStore (3.69x)** |
| 超复杂（10+ 个操作） | 1,070 | 338 | **DataStore (3.17x)** |
| GroupBy 聚合 | 406 | 141 | **DataStore (2.88x)** |
| Select + 过滤 + 排序 | 1,217 | 443 | **DataStore (2.75x)** |
| 过滤 + GroupBy + 排序 | 466 | 184 | **DataStore (2.53x)** |
| 过滤 + Select + 排序 | 1,285 | 533 | **DataStore (2.41x)** |
| 排序（单列） | 1,742 | 1,197 | **DataStore (1.45x)** |
| 过滤（单列） | 276 | 526 | 相近 |
| 排序（多列） | 947 | 1,477 | 相近 |

### 关键洞见 \{#insights\}

1. **GroupBy 操作**：DataStore 最多快 **19.93 倍**
2. **复杂流水线**：DataStore 快 **5–6 倍**（得益于 SQL pushdown）
3. **简单切片操作**：性能相当，差异可忽略
4. **最佳使用场景**：包含 GroupBy/Aggregation 的多步操作
5. **零拷贝（zero-copy）**：`to_df()` 不产生数据转换开销

---

## DataStore 更具优势的场景 \{#when-datastore-wins\}

### 大规模聚合 \{#heavy-aggregations\}

```python
# DataStore excels: 19.93x faster
result = ds.groupby('category')['amount'].sum()
```


### 复杂管道 \{#complex-pipelines\}

```python
# DataStore excels: 5-6x faster
result = (ds
    .filter(ds['date'] >= '2024-01-01')
    .filter(ds['amount'] > 100)
    .groupby('region')
    .agg({'amount': ['sum', 'mean', 'count']})
    .sort('sum', ascending=False)
    .head(20)
)
```


### 大型文件处理 \{#large-file-processing\}

```python
# DataStore: Only loads what you need
ds = pd.read_parquet("huge_file.parquet")
result = ds.filter(ds['id'] == 12345).to_df()  # Fast!
```


### 多列操作 \{#multiple-column-operations\}

```python
# DataStore: Combines into single SQL
ds['total'] = ds['price'] * ds['quantity']
ds['is_large'] = ds['total'] > 1000
ds = ds.filter(ds['is_large'])
```

***


## 何时 pandas 更占优 \{#when-pandas-wins\}

在大多数场景中，DataStore 的性能与 pandas 相当或更胜一筹。但在以下这些特定情形下，pandas 可能会略快一些：

### 小型数据集（&lt;1,000 行） \{#small-datasets\}

```python
# For very small datasets, overhead is minimal for both
# Performance difference is negligible
small_df = pd.DataFrame({'x': range(100)})
```


### 简单切片操作 \{#simple-slice-operations\}

```python
# Single slice operations without aggregation
df = df[df['x'] > 10]  # pandas slightly faster
ds = ds[ds['x'] > 10]  # DataStore comparable
```


### 自定义 Python Lambda 函数 \{#custom-python-functions\}

```python
# pandas required for custom Python code
def complex_function(row):
    return custom_logic(row)

df['result'] = df.apply(complex_function, axis=1)
```

:::note 重要
即使在 DataStore 看起来“更慢”的场景下，其性能通常也**与 pandas 持平**——在实际使用中差异可以忽略不计。DataStore 在复杂操作中的优势远远胜过这些极端情况。

若需要对执行过程进行更细粒度的控制，请参阅 [Execution Engine Configuration](../configuration/execution-engine.md)。
:::

***


## 零拷贝 DataFrame 集成 \{#zero-copy\}

DataStore 在读写 pandas DataFrame 时使用 **零拷贝**。这意味着：

```python
# to_df() does NOT copy data - it's a zero-copy operation
result = ds.filter(ds['x'] > 10).to_df()  # No data conversion overhead

# Same for creating DataStore from DataFrame
ds = DataStore(existing_df)  # No data copy
```

**关键要点：**

* `to_df()` 基本上是零成本的——无需序列化或内存拷贝
* 从 pandas DataFrame 创建 DataStore 几乎是瞬时完成的
* DataStore 与 pandas 视图之间共享内存

***


## 优化建议 \{#tips\}

### 1. 使用 Parquet 而非 CSV \{#use-parquet\}

```python
# CSV: Slower, reads entire file
ds = pd.read_csv("data.csv")

# Parquet: Faster, columnar, compressed
ds = pd.read_parquet("data.parquet")

# Convert once, benefit forever
df = pd.read_csv("data.csv")
df.to_parquet("data.parquet")
```

**预期改进**：读性能提升 3–10 倍


### 2. 尽早过滤 \{#filter-early\}

```python
# Good: Filter first, then aggregate
result = (ds
    .filter(ds['date'] >= '2024-01-01')  # Reduce data early
    .groupby('category')['amount'].sum()
)

# Less optimal: Process all data
result = (ds
    .groupby('category')['amount'].sum()
    .filter(ds['sum'] > 1000)  # Filter too late
)
```


### 3. 仅选择必要的列 \{#select-only-needed-columns\}

```python
# Good: Column pruning
result = ds.select('name', 'amount').filter(ds['amount'] > 100)

# Less optimal: All columns loaded
result = ds.filter(ds['amount'] > 100)  # Loads all columns
```


### 4. 利用 SQL 聚合函数 \{#leverage-sql-aggregations\}

```python
# GroupBy is where DataStore shines
# Up to 20x speedup!
result = ds.groupby('category').agg({
    'amount': ['sum', 'mean', 'count', 'max'],
    'quantity': 'sum'
})
```


### 5. 使用 head() 替代全量查询 \{#use-head\}

```python
# Don't load entire result if you only need a sample
result = ds.filter(ds['type'] == 'A').head(100)  # LIMIT 100

# Avoid this for large results
# result = ds.filter(ds['type'] == 'A').to_df()  # Loads everything
```


### 6. 批处理操作 \{#batch-operations\}

```python
# Good: Single execution
result = ds.filter(ds['x'] > 10).filter(ds['y'] < 100).to_df()

# Bad: Multiple executions
result1 = ds.filter(ds['x'] > 10).to_df()  # Execute
result2 = result1[result1['y'] < 100]       # Execute again
```


### 7. 使用 explain() 进行查询优化 \{#use-explain\}

```python
# View the query plan before executing
query = ds.filter(...).groupby(...).agg(...)
query.explain()  # Check if operations are pushed down

# Then execute
result = query.to_df()
```

***


## 分析工作负载性能 \{#profiling\}

### 启用性能分析 \{#enable-profiling\}

```python
from chdb.datastore.config import config, get_profiler

config.enable_profiling()

# Run your workload
result = your_pipeline()

# View report
profiler = get_profiler()
profiler.report()
```


### 找出瓶颈 \{#identify-bottlenecks\}

```text
Performance Report
==================
Step                    Duration    % Total
----                    --------    -------
SQL execution           2.5s        62.5%     <- Bottleneck!
read_csv                1.2s        30.0%
Other                   0.3s        7.5%
```


### 对比不同方案 \{#compare-approaches\}

```python
# Test approach 1
profiler.reset()
result1 = approach1()
time1 = profiler.get_steps()[-1]['duration_ms']

# Test approach 2
profiler.reset()
result2 = approach2()
time2 = profiler.get_steps()[-1]['duration_ms']

print(f"Approach 1: {time1:.0f}ms")
print(f"Approach 2: {time2:.0f}ms")
```

***


## 最佳实践总结 \{#summary\}

| 做法 | 效果 |
|----------|--------|
| 使用 Parquet 文件 | 读取速度提升 3-10 倍 |
| 尽早过滤 | 减少数据处理量 |
| 仅选择所需列 | 降低 I/O 和内存占用 |
| 使用 GroupBy/聚合操作 | 最高可快 20 倍 |
| 批量执行操作 | 避免重复执行 |
| 优化前先进行性能分析 | 找出真正瓶颈 |
| 使用 explain() | 验证查询优化效果 |
| 使用 head() 获取样本 | 避免全表扫描 |

---

## 快速决策指南 \{#decision\}

| 工作负载类型 | 建议 |
|---------------|----------------|
| GroupBy/aggregation | 使用 DataStore |
| 复杂的多步骤处理流水线 | 使用 DataStore |
| 带有过滤条件的大文件 | 使用 DataStore |
| 简单切片操作 | 均可（性能相当） |
| 自定义 Python lambda 函数 | 使用 pandas 或延后转换 |
| 非常小的数据（&lt;1,000 行） | 均可（差异可忽略） |

:::tip
如需自动选择最优引擎，请使用 `config.set_execution_engine('auto')`（默认）。
详见 [Execution Engine Configuration](../configuration/execution-engine.md)。
:::
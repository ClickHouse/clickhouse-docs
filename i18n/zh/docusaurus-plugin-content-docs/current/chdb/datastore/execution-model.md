---
title: 'DataStore 执行模型'
sidebar_label: '执行模型'
slug: /chdb/datastore/execution-model
description: '理解 DataStore 中的惰性求值、执行触发条件和缓存'
keywords: ['chdb', 'datastore', 'lazy', 'evaluation', 'execution', 'caching']
doc_type: 'guide'
---

# DataStore 执行模型 \{#datastore-execution-model\}

理解 DataStore 的惰性求值模型是充分利用它并实现最佳性能的关键。

## 惰性求值 \{#lazy-evaluation\}

DataStore 使用 **惰性求值**——操作不会立刻执行，而是被记录下来，并被编译为经过优化的 SQL 查询。只有在实际需要结果时才会执行。

### 示例：延迟求值 vs 立即求值 \{#lazy-vs-eager\}

```python
from chdb import datastore as pd

ds = pd.read_csv("sales.csv")

# These operations are NOT executed yet
result = (ds
    .filter(ds['amount'] > 1000)    # Recorded, not executed
    .select('region', 'amount')      # Recorded, not executed
    .groupby('region')               # Recorded, not executed
    .agg({'amount': 'sum'})          # Recorded, not executed
    .sort('sum', ascending=False)    # Recorded, not executed
)

# Still no execution - just building the query plan
print(result.to_sql())
# SELECT region, SUM(amount) AS sum
# FROM file('sales.csv', 'CSVWithNames')
# WHERE amount > 1000
# GROUP BY region
# ORDER BY sum DESC

# NOW execution happens
df = result.to_df()  # <-- Triggers execution
```


### 惰性求值的优势 \{#benefits\}

1. **查询优化**：多个操作会被编译为一个经过优化的 SQL 查询
2. **过滤下推（Filter Pushdown）**：在数据源层就应用过滤条件
3. **列裁剪（Column Pruning）**：只读取所需的列
4. **延迟决策**：可以在运行时选择执行引擎
5. **执行计划检查**：在执行前即可查看/调试查询计划

---

## 执行触发器 \{#triggers\}

在需要实际值时，会自动触发执行：

### 自动触发器 \{#automatic-triggers\}

| Trigger              | Example            | Description     |
| -------------------- | ------------------ | --------------- |
| `print()` / `repr()` | `print(ds)`        | 显示结果            |
| `len()`              | `len(ds)`          | 获取行数            |
| `.columns`           | `ds.columns`       | 获取列名            |
| `.dtypes`            | `ds.dtypes`        | 获取列类型           |
| `.shape`             | `ds.shape`         | 获取维度            |
| `.index`             | `ds.index`         | 获取行索引           |
| `.values`            | `ds.values`        | 获取 NumPy 数组     |
| Iteration            | `for row in ds`    | 逐行迭代            |
| `to_df()`            | `ds.to_df()`       | 转换为 pandas      |
| `to_pandas()`        | `ds.to_pandas()`   | `to&#95;df` 的别名 |
| `to_dict()`          | `ds.to_dict()`     | 转换为字典           |
| `to_numpy()`         | `ds.to_numpy()`    | 转换为数组           |
| `.equals()`          | `ds.equals(other)` | 比较 DataStore 对象 |

**示例：**

```python
# All these trigger execution
print(ds)              # Display
len(ds)                # 1000
ds.columns             # Index(['name', 'age', 'city'])
ds.shape               # (1000, 3)
list(ds)               # List of values
ds.to_df()             # pandas DataFrame
```


### 始终保持惰性的操作 \{#stay-lazy\}

| Operation              | Returns     | Description    |
| ---------------------- | ----------- | -------------- |
| `filter()`             | DataStore   | 添加 WHERE 子句    |
| `select()`             | DataStore   | 添加列选择          |
| `sort()`               | DataStore   | 添加 ORDER BY    |
| `groupby()`            | LazyGroupBy | 为 GROUP BY 做准备 |
| `join()`               | DataStore   | 添加 JOIN        |
| `ds['col']`            | ColumnExpr  | 列引用            |
| `ds[['col1', 'col2']]` | DataStore   | 列选择            |

**示例：**

```python
# These do NOT trigger execution - they stay lazy
result = ds.filter(ds['age'] > 25)      # Returns DataStore
result = ds.select('name', 'age')        # Returns DataStore
result = ds['name']                      # Returns ColumnExpr
result = ds.groupby('city')              # Returns LazyGroupBy
```

***


## 三阶段执行 \{#three-phase\}

DataStore 操作采用三阶段执行模型：

### 阶段 1：SQL 查询构建（惰性） \{#phase-1\}

可以用 SQL 表达的操作会被收集起来：

```python
result = (ds
    .filter(ds['status'] == 'active')   # WHERE
    .select('user_id', 'amount')         # SELECT
    .groupby('user_id')                  # GROUP BY
    .agg({'amount': 'sum'})              # SUM()
    .sort('sum', ascending=False)        # ORDER BY
    .limit(10)                           # LIMIT
)
# All compiled into one SQL query
```


### 阶段 2：执行时点 \{#phase-2\}

当触发条件满足时，会执行累积的 SQL：

```python
# Execution triggered here
df = result.to_df()  
# The single optimized SQL query runs now
```


### 阶段 3：DataFrame 操作（如果有） \{#phase-3\}

如果你在执行完成后继续链式调用仅使用 pandas 的操作：

```python
# Mixed operations
result = (ds
    .filter(ds['amount'] > 100)          # Phase 1: SQL
    .to_df()                             # Phase 2: Execute
    .pivot_table(...)                    # Phase 3: pandas
)
```

***


## 查看执行计划 \{#explain\}

使用 `explain()` 来查看实际将要执行的操作：

```python
ds = pd.read_csv("sales.csv")

query = (ds
    .filter(ds['amount'] > 1000)
    .groupby('region')
    .agg({'amount': ['sum', 'mean']})
)

# View execution plan
query.explain()
```

输出结果：

```text
Pipeline:
  1. Source: file('sales.csv', 'CSVWithNames')
  2. Filter: amount > 1000
  3. GroupBy: region
  4. Aggregate: sum(amount), avg(amount)

Generated SQL:
SELECT region, SUM(amount) AS sum, AVG(amount) AS mean
FROM file('sales.csv', 'CSVWithNames')
WHERE amount > 1000
GROUP BY region
```

使用 `verbose=True` 以获取更多详细信息：

```python
query.explain(verbose=True)
```

有关完整文档，请参见 [Debugging: explain()](../debugging/explain.md)。

***


## 缓存 \{#caching\}

DataStore 会缓存执行结果，以防止重复查询。

### 缓存的工作原理 \{#how-caching\}

```python
ds = pd.read_csv("data.csv")
result = ds.filter(ds['age'] > 25)

# First access - executes query
print(result.shape)  # Executes and caches

# Second access - uses cache
print(result.columns)  # Uses cached result

# Third access - uses cache
df = result.to_df()  # Uses cached result
```


### 缓存失效 \{#cache-invalidation\}

当有操作修改 DataStore 时，缓存将会失效：

```python
result = ds.filter(ds['age'] > 25)
print(result.shape)  # Executes, caches

# New operation invalidates cache
result2 = result.filter(result['city'] == 'NYC')
print(result2.shape)  # Re-executes (different query)
```


### 手动控制缓存 \{#cache-control\}

```python
# Clear cache
ds.clear_cache()

# Disable caching
from chdb.datastore.config import config
config.set_cache_enabled(False)
```

***


## 混合使用 SQL 和 Pandas 操作 \{#mixing\}

DataStore 能够智能处理同时使用 SQL 和 pandas 的操作：

### 兼容 SQL 的操作 \{#sql-ops\}

这些操作会被编译为 SQL 查询：

- `filter()`, `where()`
- `select()`
- `groupby()`, `agg()`
- `sort()`, `orderby()`
- `limit()`, `offset()`
- `join()`, `union()`
- `distinct()`
- 列级操作（算术运算、比较、字符串方法）

### 仅 Pandas 操作 \{#pandas-ops\}

这些操作会触发执行并使用 Pandas：

- 使用自定义函数的 `apply()`
- 带复杂聚合的 `pivot_table()`
- `stack()`, `unstack()`
- 针对已执行 DataFrame 的操作

### 混合型管线 \{#hybrid\}

```python
# SQL phase
result = (ds
    .filter(ds['amount'] > 100)      # SQL
    .groupby('category')              # SQL
    .agg({'amount': 'sum'})           # SQL
)

# Execution + pandas phase
result = (result
    .to_df()                          # Execute SQL
    .pivot_table(...)                 # pandas operation
)
```

***


## 执行引擎选择 \{#engine-selection\}

DataStore 支持使用不同的引擎来执行操作：

### 自动模式（默认） \{#auto-mode\}

```python
from chdb.datastore.config import config

config.set_execution_engine('auto')  # Default
# Automatically selects best engine per operation
```


### 强制使用 chDB 引擎 \{#chdb-engine\}

```python
config.set_execution_engine('chdb')
# All operations use ClickHouse SQL
```


### 强制使用 pandas 引擎 \{#pandas-engine\}

```python
config.set_execution_engine('pandas')
# All operations use pandas
```

详情请参阅[配置：执行引擎](../configuration/execution-engine.md)。

***


## 性能影响 \{#performance\}

### 良好实践：尽早过滤 \{#filter-early\}

```python
# Good: Filter in SQL, then aggregate
result = (ds
    .filter(ds['date'] >= '2024-01-01')  # Reduces data early
    .groupby('category')
    .agg({'amount': 'sum'})
)
```


### 不佳：过滤过晚 \{#filter-late\}

```python
# Bad: Aggregate all, then filter
result = (ds
    .groupby('category')
    .agg({'amount': 'sum'})
    .to_df()
    .query('sum > 1000')  # Pandas filter after aggregation
)
```


### 推荐做法：尽早选择列 \{#select-early\}

```python
# Good: Select columns in SQL
result = (ds
    .select('user_id', 'amount', 'date')
    .filter(ds['date'] >= '2024-01-01')
    .groupby('user_id')
    .agg({'amount': 'sum'})
)
```


### 更佳做法：把工作交给 SQL \{#sql-work\}

```python
# Good: Complex aggregation in SQL
result = (ds
    .groupby('category')
    .agg({
        'amount': ['sum', 'mean', 'count'],
        'quantity': 'sum'
    })
    .sort('sum', ascending=False)
    .limit(10)
)
# One SQL query does everything

# Bad: Multiple separate queries
sums = ds.groupby('category')['amount'].sum().to_df()
means = ds.groupby('category')['amount'].mean().to_df()
# Two queries instead of one
```

***


## 最佳实践总结 \{#best-practices\}

1. **在执行前串联操作** - 先构建完整查询，再一次性触发
2. **尽早过滤** - 在数据源端减少数据量
3. **只选择需要的列** - 列裁剪有助于提升性能
4. **使用 `explain()` 理解执行计划** - 在运行前进行调试
5. **让 SQL 处理聚合** - ClickHouse 针对这类操作做了优化
6. **注意执行触发机制** - 避免意外的提前执行
7. **明智使用缓存** - 理解缓存在何时会失效
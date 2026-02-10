---
title: '执行引擎配置'
sidebar_label: '执行引擎'
slug: /chdb/configuration/execution-engine
description: '配置 DataStore 执行引擎：auto、chdb 或 pandas'
keywords: ['chdb', 'datastore', 'execution', 'engine', 'chdb', 'pandas', 'auto']
doc_type: 'guide'
---

# 执行引擎配置 \{#execution-engine-configuration\}

DataStore 可以使用不同的后端来执行操作。本指南介绍如何配置并优化引擎选择。

## 可用引擎 \{#engines\}

| 引擎 | 描述 | 最适用场景 |
|--------|-------------|----------|
| `auto` | 为每个操作自动选择最优引擎 | 通用用途（默认） |
| `chdb` | 强制所有操作经由 ClickHouse SQL 处理 | 大型数据集、聚合 |
| `pandas` | 强制所有操作经由 pandas 处理 | 兼容性测试、pandas 特定功能 |

## 设置引擎 \{#setting\}

### 全局配置 \{#global\}

```python
from chdb.datastore.config import config

# Option 1: Using set method
config.set_execution_engine('auto')    # Default
config.set_execution_engine('chdb')    # Force ClickHouse
config.set_execution_engine('pandas')  # Force pandas

# Option 2: Using shortcuts
config.use_auto()     # Auto-select
config.use_chdb()     # Force ClickHouse
config.use_pandas()   # Force pandas
```


### 检查当前执行引擎 \{#checking\}

```python
print(config.execution_engine)  # 'auto', 'chdb', or 'pandas'
```

***


## 自动模式 \{#auto-mode\}

在默认的 `auto` 模式下，DataStore 会为每个操作自动选择最优引擎：

### 在 chDB 中执行的操作 \{#auto-chdb\}

- SQL 兼容的过滤（`filter()`, `where()`）
- 列选择（`select()`）
- 排序（`sort()`, `orderby()`）
- 分组与聚合（`groupby().agg()`）
- 连接（`join()`, `merge()`）
- 去重（`distinct()`, `drop_duplicates()`）
- 结果限制（`limit()`, `head()`, `tail()`）

### 在 pandas 中执行的操作 \{#auto-pandas\}

- 自定义 apply 函数（`apply(custom_func)`）
- 带有自定义聚合的复杂数据透视表
- 无法用 SQL 表示的操作
- 当输入已经是 pandas DataFrame 时

### 示例 \{#auto-example\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config

config.use_auto()  # Default

ds = pd.read_csv("data.csv")

# This uses chDB (SQL)
result = (ds
    .filter(ds['amount'] > 100)   # SQL: WHERE
    .groupby('region')            # SQL: GROUP BY
    .agg({'amount': 'sum'})       # SQL: SUM()
)

# This uses pandas (custom function)
result = ds.apply(lambda row: complex_calculation(row), axis=1)
```

***


## chDB 模式 \{#chdb-mode\}

将所有操作强制为通过 ClickHouse SQL 执行：

```python
config.use_chdb()
```


### 何时使用 \{#chdb-when\}

- 处理大型数据集（数百万行）
- 大量聚合计算的工作负载
- 需要最大化 SQL 优化效果时
- 需要在所有操作中保持一致行为时

### 性能特性 \{#chdb-performance\}

| 操作类型 | 性能表现 |
|----------------|-------------|
| GroupBy/Aggregation | 极佳（性能最高可提升 20 倍） |
| 复杂过滤 | 极佳 |
| 排序 | 很好 |
| 简单单列过滤 | 良好（有轻微开销） |

### 限制 \{#chdb-limitations\}

- 自定义 Python 函数可能不受支持
- 某些 pandas 特有功能需要进行转换

---

## pandas 模式 \{#pandas-mode\}

强制所有操作都通过 pandas 运行：

```python
config.use_pandas()
```


### 何时使用 \{#pandas-when\}

- 进行 pandas 兼容性测试时
- 需要使用 pandas 特有功能时
- 排查与 pandas 相关的问题时
- 数据已经以 pandas 格式存在时

### 性能特性 \{#pandas-performance\}

| 操作类型 | 性能表现 |
|----------------|-------------|
| 简单的单次操作 | 良好 |
| 自定义函数 | 优秀 |
| 复杂聚合 | 比 chDB 更慢 |
| 大规模数据集 | 内存占用高 |

---

## 跨 DataStore 引擎 \{#cross-datastore\}

为需要组合不同 DataStore 中列的操作配置该引擎：

```python
# Set cross-DataStore engine
config.set_cross_datastore_engine('auto')
config.set_cross_datastore_engine('chdb')
config.set_cross_datastore_engine('pandas')
```


### 示例 \{#cross-example\}

```python
ds1 = pd.read_csv("sales.csv")
ds2 = pd.read_csv("inventory.csv")

# This operation involves two DataStores
result = ds1.join(ds2, on='product_id')
# Uses cross_datastore_engine setting
```

***


## 引擎选择逻辑 \{#selection-logic\}

### 自动模式决策树 \{#decision-tree\}

```text
Operation requested
    │
    ├─ Can be expressed in SQL?
    │      │
    │      ├─ Yes → Use chDB
    │      │
    │      └─ No → Use pandas
    │
    └─ Cross-DataStore operation?
           │
           └─ Use cross_datastore_engine setting
```


### 函数级别引擎覆盖 \{#function-override\}

某些函数可以显式配置其所使用的引擎：

```python
from chdb.datastore.config import function_config

# Force specific functions to use specific engine
function_config.use_chdb('length', 'substring')
function_config.use_pandas('upper', 'lower')
```

详细信息请参见 [Function Config](function-config.md)。

***


## 性能对比 \{#performance-comparison\}

基于 1,000 万行数据的基准测试结果：

| Operation | pandas (ms) | chdb (ms) | Speedup |
|-----------|-------------|-----------|---------|
| GroupBy count | 347 | 17 | 19.93x |
| Combined ops | 1,535 | 234 | 6.56x |
| Complex pipeline | 2,047 | 380 | 5.39x |
| Filter+Sort+Head | 1,537 | 350 | 4.40x |
| GroupBy agg | 406 | 141 | 2.88x |
| Single filter | 276 | 526 | 0.52x |

**关键结论：**

- chDB 在聚合和复杂流水线上的表现更为突出
- 对于简单的单一操作，pandas 略快
- 使用 `auto` 模式以同时获得二者的优势

---

## 最佳实践 \{#best-practices\}

### 1. 优先使用 Auto 模式 \{#start-with-auto-mode\}

```python
config.use_auto()  # Let DataStore decide
```


### 2. 在强制指定前进行性能分析 \{#profile-before-forcing\}

```python
config.enable_profiling()
# Run your workload
# Check profiler report to see where time is spent
```


### 3. 为特定工作负载强制使用指定引擎 \{#force-engine-for-specific-workloads\}

```python
# For heavy aggregation workloads
config.use_chdb()

# For pandas compatibility testing
config.use_pandas()
```


### 4. 使用 explain() 分析执行过程 \{#use-explain-to-understand-execution\}

```python
ds = pd.read_csv("data.csv")
query = ds.filter(ds['age'] > 25).groupby('city').agg({'salary': 'sum'})

# See what SQL will be generated
query.explain()
```

***


## 故障排查 \{#troubleshooting\}

### 问题：执行速度低于预期 \{#issue-operation-slower\}

```python
# Check current engine
print(config.execution_engine)

# Enable debug to see what's happening
config.enable_debug()

# Try forcing specific engine
config.use_chdb()  # or config.use_pandas()
```


### 问题：chdb 模式下不支持的操作 \{#issue-unsupported-operation\}

```python
# Some pandas operations aren't supported in SQL
# Solution: use auto mode
config.use_auto()

# Or explicitly convert to pandas first
df = ds.to_df()
result = df.some_pandas_specific_operation()
```


### 问题：大数据量导致的内存问题 \{#issue-memory-issues\}

```python
# Use chdb engine to avoid loading all data into memory
config.use_chdb()

# Filter early to reduce data size
result = ds.filter(ds['date'] >= '2024-01-01').to_df()

# For maximum throughput on large datasets, use performance mode
# which enables parallel Parquet reading and single-SQL aggregation
config.use_performance_mode()
```

:::tip 性能模式（Performance Mode）
如果正在运行较重的聚合型工作负载，并且不需要与 pandas 输出完全兼容（行顺序、MultiIndex、dtype 更正），可以考虑使用 [Performance Mode](performance-mode.md)。它会自动将引擎设置为 `chdb`，并消除所有为兼容 pandas 所产生的开销。
:::

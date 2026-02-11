---
title: 'DataStore 性能分析'
sidebar_label: '性能分析'
slug: /chdb/debugging/profiling
description: '使用内置分析器评估 DataStore 性能'
keywords: ['chdb', 'datastore', '性能分析', '性能', '计时', '基准测试']
doc_type: 'guide'
---

# DataStore 性能分析 \{#datastore-profiling\}

DataStore 分析工具可帮助你测量执行时间并定位性能瓶颈。

## 快速入门 \{#quick-start\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config, get_profiler

# Enable profiling
config.enable_profiling()

# Run your operations
ds = pd.read_csv("large_data.csv")
result = (ds
    .filter(ds['amount'] > 100)
    .groupby('category')
    .agg({'amount': 'sum'})
    .sort('sum', ascending=False)
    .head(10)
    .to_df()
)

# View report
profiler = get_profiler()
print(profiler.report())
```


## 启用性能分析 \{#enabling\}

```python
from chdb.datastore.config import config

# Enable profiling
config.enable_profiling()

# Disable profiling
config.disable_profiling()

# Check if profiling is enabled
print(config.profiling_enabled)  # True or False
```

***


## Profiler API \{#api\}

### 获取 Profiler 实例 \{#get-profiler\}

```python
from chdb.datastore.config import get_profiler

profiler = get_profiler()
```


### report() \{#report\}

显示性能报告。

```python
profiler.report(min_duration_ms=0.1)
```

**参数：**

| 参数                | 类型    | 默认值   | 描述                  |
| ----------------- | ----- | ----- | ------------------- |
| `min_duration_ms` | float | `0.1` | 仅显示持续时间 &gt;= 此值的步骤 |

**示例输出：**

```text
======================================================================
EXECUTION PROFILE
======================================================================
   45.79ms (100.0%) Total Execution
     23.25ms ( 50.8%) Query Planning [ops_count=2]
     22.29ms ( 48.7%) SQL Segment 1 [ops=2]
       20.48ms ( 91.9%) SQL Execution
        1.74ms (  7.8%) Result to DataFrame
----------------------------------------------------------------------
      TOTAL:    45.79ms
======================================================================
```

报告显示：

* 每个步骤的持续时间（毫秒）
* 相对于父步骤/总时间的百分比
* 操作的分层嵌套结构
* 每个步骤的元数据（例如，`ops_count`、`ops`）


### step() \{#step\}

手动为一段代码计时。

```python
with profiler.step("custom_operation"):
    # Your code here
    expensive_operation()
```


### clear() \{#clear\}

清除所有性能分析数据。

```python
profiler.clear()
```


### summary() \{#summary\}

获取一个以步骤名称为键、持续时间（毫秒）为值的字典。

```python
summary = profiler.summary()
for name, duration in summary.items():
    print(f"{name}: {duration:.2f}ms")
```

示例输出：

```text
Total Execution: 45.79ms
Total Execution.Cache Check: 0.00ms
Total Execution.Query Planning: 23.25ms
Total Execution.SQL Segment 1: 22.29ms
Total Execution.SQL Segment 1.SQL Execution: 20.48ms
Total Execution.SQL Segment 1.Result to DataFrame: 1.74ms
```

***


## 理解报告 \{#understanding\}

### 步骤名称 \{#step-names\}

| 步骤名称 | 描述 |
|-----------|-------------|
| `Total Execution` | 总执行时间 |
| `Query Planning` | 查询规划耗时 |
| `SQL Segment N` | 执行第 N 个 SQL 段 |
| `SQL Execution` | 实际执行 SQL 查询 |
| `Result to DataFrame` | 将结果转换为 pandas DataFrame |
| `Cache Check` | 检查查询缓存 |
| `Cache Write` | 将结果写入缓存 |

### 耗时 \{#duration\}

- **Planning steps**（查询规划）：通常较快
- **Execution steps**（SQL 执行）：实际执行计算的阶段
- **Transfer steps**（结果到 DataFrame）：将数据转换为 pandas 的过程

### 定位瓶颈 \{#bottlenecks\}

```text
======================================================================
EXECUTION PROFILE
======================================================================
  200.50ms (100.0%) Total Execution
    10.25ms (  5.1%) Query Planning [ops_count=4]
   190.00ms ( 94.8%) SQL Segment 1 [ops=4]
     185.00ms ( 97.4%) SQL Execution    <- Main bottleneck
       5.00ms (  2.6%) Result to DataFrame
----------------------------------------------------------------------
      TOTAL:   200.50ms
======================================================================
```

***


## 分析模式 \{#patterns\}

### 分析单个查询 \{#single-query\}

```python
config.enable_profiling()
profiler = get_profiler()
profiler.clear()  # Clear previous data

# Run query
result = ds.filter(...).groupby(...).agg(...).to_df()

# View this query's profile
print(profiler.report())
```


### 分析多个查询的性能 \{#multiple-queries\}

```python
config.enable_profiling()
profiler = get_profiler()
profiler.clear()

# Query 1
with profiler.step("Query 1"):
    result1 = query1.to_df()

# Query 2
with profiler.step("Query 2"):
    result2 = query2.to_df()

print(profiler.report())
```


### 方法对比 \{#compare\}

```python
profiler = get_profiler()

# Approach 1: Filter then groupby
profiler.clear()
with profiler.step("filter_then_groupby"):
    result1 = ds.filter(ds['x'] > 10).groupby('y').sum().to_df()
summary1 = profiler.summary()
time1 = summary1.get('filter_then_groupby', 0)

# Approach 2: Groupby then filter
profiler.clear()
with profiler.step("groupby_then_filter"):
    result2 = ds.groupby('y').sum().filter(ds['x'] > 10).to_df()
summary2 = profiler.summary()
time2 = summary2.get('groupby_then_filter', 0)

print(f"Approach 1: {time1:.2f}ms")
print(f"Approach 2: {time2:.2f}ms")
print(f"Winner: {'Approach 1' if time1 < time2 else 'Approach 2'}")
```

***


## 优化提示 \{#optimization\}

### 1. 检查 SQL 执行时间 \{#check-sql\}

如果 `SQL 执行` 是瓶颈：

- 添加更多过滤条件以减少扫描的数据量
- 使用 Parquet 而不是 CSV
- 检查是否存在合适的索引（针对数据库数据源）

### 2. 检查 I/O 时间 \{#check-io\}

如果 `read_csv` 或 `read_parquet` 是瓶颈：

- 使用 Parquet（列式、压缩）
- 只读取所需的列
- 如有可能，在数据源端进行过滤

### 3. 检查数据传输 \{#check-transfer\}

如果 `to_df` 很慢：

- 结果集可能过大
- 添加更多过滤条件或限制返回的行数
- 使用 `head()` 进行数据预览

### 4. 引擎对比 \{#compare-engines\}

```python
from chdb.datastore.config import config

# Profile with chdb
config.use_chdb()
profiler.clear()
result_chdb = query.to_df()
time_chdb = profiler.total_duration_ms

# Profile with pandas
config.use_pandas()
profiler.clear()
result_pandas = query.to_df()
time_pandas = profiler.total_duration_ms

print(f"chdb: {time_chdb:.2f}ms")
print(f"pandas: {time_pandas:.2f}ms")
```

***


## 最佳实践 \{#best-practices\}

### 1. 在优化前先进行性能分析 \{#best-practice-1\}

```python
# Don't guess - measure!
config.enable_profiling()
result = your_query.to_df()
print(get_profiler().report())
```


### 2. 在测试之间进行清理 \{#best-practice-2\}

```python
profiler.clear()  # Clear previous data
# Run test
print(profiler.report())
```


### 3. 使用 min_duration_ms 进行聚焦 \{#best-practice-3\}

```python
# Only show operations >= 100ms
profiler.report(min_duration_ms=100)
```


### 4. 分析代表性数据 \{#best-practice-4\}

```python
# Profile with real-world data sizes
# Small test data may not show real bottlenecks
```


### 5. 在生产环境禁用 \{#best-practice-5\}

```python
# Development
config.enable_profiling()

# Production
config.set_profiling_enabled(False)  # Avoid overhead
```

***


## 示例：完整 Profiling 会话 \{#example\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config, get_profiler

# Setup
config.enable_profiling()
config.enable_debug()  # Also see what's happening
profiler = get_profiler()

# Load data
profiler.clear()
print("=== Loading Data ===")
ds = pd.read_csv("sales_2024.csv")  # 10M rows
print(profiler.report())

# Query 1: Simple filter
profiler.clear()
print("\n=== Query 1: Simple Filter ===")
result1 = ds.filter(ds['amount'] > 1000).to_df()
print(profiler.report())

# Query 2: Complex aggregation
profiler.clear()
print("\n=== Query 2: Complex Aggregation ===")
result2 = (ds
    .filter(ds['amount'] > 100)
    .groupby('region', 'category')
    .agg({
        'amount': ['sum', 'mean', 'count'],
        'quantity': 'sum'
    })
    .sort('sum', ascending=False)
    .head(20)
    .to_df()
)
print(profiler.report())

# Summary
print("\n=== Summary ===")
print(f"Query 1: {len(result1)} rows")
print(f"Query 2: {len(result2)} rows")
```

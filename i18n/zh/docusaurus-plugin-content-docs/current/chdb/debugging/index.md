---
title: 'DataStore 调试'
sidebar_label: '概览'
slug: /chdb/debugging
description: '借助 explain()、性能分析和日志对 DataStore 操作进行调试'
keywords: ['chdb', 'datastore', 'debug', 'explain', 'profiling', 'logging']
doc_type: 'guide'
---

# DataStore 调试 \{#datastore-debugging\}

DataStore 提供了一套全面的调试工具，用于帮助理解并优化数据管道。

## 调试工具概览 \{#overview\}

| 工具 | 用途 | 何时使用 |
|------|---------|-------------|
| `explain()` | 查看执行计划 | 了解将要执行的 SQL |
| Profiler | 测量性能 | 查找慢操作 |
| Logging | 查看执行细节 | 排查异常行为 |

## 快速决策矩阵 \{#decision-matrix\}

| 需求 | 工具 | 命令 |
|------|------|---------|
| 查看执行计划 | `explain()` | `ds.explain()` |
| 分析性能 | Profiler | `config.enable_profiling()` |
| 调试 SQL 查询 | Logging | `config.enable_debug()` |
| 同时满足以上需求 | 组合使用 | 见下文 |

## 快速设置 \{#quick-setup\}

### 启用全部调试功能 \{#enable-all\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config

# Enable all debugging
config.enable_debug()        # Verbose logging
config.enable_profiling()    # Performance tracking

ds = pd.read_csv("data.csv")
result = ds.filter(ds['age'] > 25).groupby('city').agg({'salary': 'mean'})

# View execution plan
result.explain()

# Get profiler report
from chdb.datastore.config import get_profiler
profiler = get_profiler()
profiler.report()
```

***


## explain() 方法 \{#explain\}

在运行查询前先查看执行计划。

```python
ds = pd.read_csv("data.csv")

query = (ds
    .filter(ds['amount'] > 1000)
    .groupby('region')
    .agg({'amount': ['sum', 'mean']})
)

# View plan
query.explain()
```

输出：

```text
Pipeline:
  Source: file('data.csv', 'CSVWithNames')
  Filter: amount > 1000
  GroupBy: region
  Aggregate: sum(amount), avg(amount)

Generated SQL:
SELECT region, SUM(amount) AS sum, AVG(amount) AS mean
FROM file('data.csv', 'CSVWithNames')
WHERE amount > 1000
GROUP BY region
```

有关详细信息，请参阅 [explain() 文档](explain.md)。

***


## 性能分析 \{#profiling\}

用于测量每个操作的执行时间。

```python
from chdb.datastore.config import config, get_profiler

# Enable profiling
config.enable_profiling()

# Run operations
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
profiler.report(min_duration_ms=0.1)
```

输出结果：

```text
Performance Report
==================
Step                          Duration    Calls
----                          --------    -----
read_csv                      1.234s      1
filter                        0.002s      1
groupby                       0.001s      1
agg                           0.089s      1
sort                          0.045s      1
head                          0.001s      1
to_df (SQL execution)         0.567s      1
----                          --------    -----
Total                         1.939s      7
```

有关详细信息，请参阅 [Profiling Guide](profiling.md)。

***


## 日志 \{#logging\}

查看详细的执行日志。

```python
from chdb.datastore.config import config

# Enable debug logging
config.enable_debug()

# Run operations - logs will show:
# - SQL queries generated
# - Execution engine used
# - Cache hits/misses
# - Timing information
```

日志输出示例：

```text
DEBUG - DataStore: Creating from file 'data.csv'
DEBUG - Query: SELECT region, SUM(amount) FROM ... WHERE amount > 1000 GROUP BY region
DEBUG - Engine: Using chdb for aggregation
DEBUG - Execution time: 0.089s
DEBUG - Cache: Storing result (key: abc123)
```

有关详细信息，请参阅[日志配置](logging.md)。

***


## 常见调试场景 \{#scenarios\}

### 1. 查询未返回预期的结果 \{#scenario-wrong-results\}

```python
# Step 1: View the execution plan
query = ds.filter(ds['age'] > 25).groupby('city').sum()
query.explain(verbose=True)

# Step 2: Enable logging to see SQL
config.enable_debug()

# Step 3: Run and check logs
result = query.to_df()
```


### 2. 查询执行缓慢 \{#scenario-slow\}

```python
# Step 1: Enable profiling
config.enable_profiling()

# Step 2: Run your query
result = process_data()

# Step 3: Check profiler report
profiler = get_profiler()
profiler.report()

# Step 4: Identify slow operations and optimize
```


### 3. 理解 Engine 选择 \{#scenario-engine\}

```python
# Enable verbose logging
config.enable_debug()

# Run operations
result = ds.filter(ds['x'] > 10).apply(custom_func)

# Logs will show which engine was used for each operation:
# DEBUG - filter: Using chdb engine
# DEBUG - apply: Using pandas engine (custom function)
```


### 4. 调试缓存问题 \{#scenario-cache\}

```python
# Enable debug to see cache operations
config.enable_debug()

# First run
result1 = ds.filter(ds['x'] > 10).to_df()
# LOG: Cache miss, executing query

# Second run (should use cache)
result2 = ds.filter(ds['x'] > 10).to_df()
# LOG: Cache hit, returning cached result

# If not caching when expected, check:
# - Are operations identical?
# - Is cache enabled? config.cache_enabled
```

***


## 最佳实践 \{#best-practices\}

### 1. 在开发环境中调试，而不要在生产环境中调试 \{#best-practice-1\}

```python
# Development
config.enable_debug()
config.enable_profiling()

# Production
config.set_log_level(logging.WARNING)
config.set_profiling_enabled(False)
```


### 2. 在执行大型查询之前使用 explain() \{#best-practice-2\}

```python
# Build query
query = ds.filter(...).groupby(...).agg(...)

# Check plan first
query.explain()

# If plan looks good, execute
result = query.to_df()
```


### 3. 优化前先做性能分析 \{#best-practice-3\}

```python
# Don't guess what's slow - measure it
config.enable_profiling()
result = your_pipeline()
get_profiler().report()
```


### 4. 当结果不符合预期时检查 SQL \{#best-practice-4\}

```python
# View generated SQL
print(query.to_sql())

# Compare with expected SQL
# Run SQL directly in ClickHouse to verify
```

***


## 调试工具概览 \{#summary\}

| 工具 | 命令 | 输出 |
|------|---------|--------|
| 执行计划 | `ds.explain()` | 执行步骤 + SQL |
| 详细执行计划 | `ds.explain(verbose=True)` | + 元数据 |
| 查看 SQL | `ds.to_sql()` | SQL 查询字符串 |
| 启用调试 | `config.enable_debug()` | 详细日志 |
| 启用性能剖析 | `config.enable_profiling()` | 耗时数据 |
| 性能剖析报告 | `get_profiler().report()` | 性能概要 |
| 重置性能剖析 | `get_profiler().reset()` | 清除耗时数据 |

---

## 后续步骤 \{#next-steps\}

- [explain() 方法](explain.md) - 执行计划的详细说明
- [Profiling 指南](profiling.md) - 性能分析
- [日志配置](logging.md) - 日志级别与格式设置
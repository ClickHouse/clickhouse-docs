---
title: '性能模式（compat_mode）'
sidebar_label: '性能模式'
slug: /chdb/configuration/performance-mode
description: 'SQL 优先的性能模式，通过禁用 pandas 兼容性相关开销以实现最大吞吐量'
keywords: ['chdb', 'datastore', 'performance', 'mode', 'compat', 'sql-first', 'optimization']
doc_type: 'guide'
---

# 性能模式 \{#performance-mode\}

DataStore 提供两种兼容模式，用于控制输出是面向 pandas 兼容性，还是针对原生 SQL 性能进行优化。

## 概览 \{#overview\}

| 模式 | `compat_mode` 值 | 描述 |
|------|------------------|------|
| **Pandas**（默认） | `"pandas"` | 与 pandas 行为完全兼容。保留行顺序、支持 MultiIndex、set_index、dtype 更正、稳定排序的并列打破规则、`-If`/`isNaN` 包装器。 |
| **性能** | `"performance"` | 以 SQL 优先的执行方式。移除所有 pandas 兼容性开销。在实现最大吞吐量的同时，结果在结构上可能与 pandas 不同。 |

### 性能模式禁用的功能 \{#what-it-disables\}

| 开销 | Pandas 模式行为 | 性能模式行为 |
|----------|---------------------|--------------------------|
| **按行顺序保留** | 通过注入 `_row_id`、`rowNumberInAllBlocks()`、`__orig_row_num__` 子查询 | 已禁用 — 不再保证行顺序 |
| **稳定排序的并列项决胜逻辑** | 在 ORDER BY 后追加 `rowNumberInAllBlocks() ASC` | 已禁用 — 相同值的顺序可能是任意的 |
| **Parquet preserve_order** | `input_format_parquet_preserve_order=1` | 已禁用 — 允许并行读取 Parquet |
| **GroupBy 自动 ORDER BY** | 添加 `ORDER BY group_key`（pandas 默认 `sort=True`） | 已禁用 — 分组以任意顺序返回 |
| **GroupBy dropna WHERE** | 添加 `WHERE key IS NOT NULL`（pandas 默认 `dropna=True`） | 已禁用 — 包含 NULL 分组 |
| **GroupBy set_index** | 分组键被设置为 index | 已禁用 — 分组键保留为列 |
| **MultiIndex 列** | `agg({'col': ['sum','mean']})` 返回 MultiIndex 列 | 已禁用 — 扁平列名（`col_sum`, `col_mean`） |
| **`-If`/`isNaN` 包装器** | 为 skipna 使用 `sumIf(col, NOT isNaN(col))` | 已禁用 — 直接使用 `sum(col)`（ClickHouse 原生跳过 NULL） |
| **在 count 上使用 `toInt64`** | 使用 `toInt64(count())` 以匹配 pandas 的 int64 | 已禁用 — 返回原生 SQL 数据类型 |
| **对全 NaN 求和的 `fillna(0)`** | 全为 NaN 的求和返回 0（pandas 行为） | 已禁用 — 返回 NULL |
| **Dtype 校正** | `abs()` 将无符号→有符号等 | 已禁用 — 使用原生 SQL 数据类型 |
| **Index 保留** | 在 SQL 执行后恢复原始 index | 已禁用 |
| **`first()`/`last()`** | 使用 `argMin/argMax(col, rowNumberInAllBlocks())` | 使用 `any(col)` / `anyLast(col)` — 更快但非确定性 |
| **单 SQL 聚合** | ColumnExpr groupby 会物化中间 DataFrame | 在惰性操作链中注入 `LazyGroupByAgg` — 单个 SQL 查询 |

---

## 启用性能模式 \{#enabling\}

### 使用配置对象 \{#using-config\}

```python
from chdb.datastore.config import config

# Enable performance mode
config.use_performance_mode()

# Back to pandas compatibility
config.use_pandas_compat()

# Check current mode
print(config.compat_mode)  # 'pandas' or 'performance'
```


### 使用模块级别的函数 \{#using-functions\}

```python
from chdb.datastore.config import set_compat_mode, CompatMode, is_performance_mode

# Enable performance mode
set_compat_mode(CompatMode.PERFORMANCE)

# Check
print(is_performance_mode())  # True

# Back to default
set_compat_mode(CompatMode.PANDAS)
```


### 使用简化导入方式 \{#using-imports\}

```python
from chdb import use_performance_mode, use_pandas_compat

use_performance_mode()
# ... high-performance operations ...
use_pandas_compat()
```

:::note
设置性能模式后，会自动将执行引擎设置为 `chdb`。无需另外调用 `config.use_chdb()`。
:::

***


## 何时使用性能模式 \{#when-to-use\}

**在以下情况下使用性能模式：**

- 处理大型数据集（几十万到数百万行）
- 运行聚合密集型工作负载（groupby、sum、mean、count）
- 行顺序无关紧要（例如聚合结果、报表、仪表盘）
- 你希望获得最大的 SQL 吞吐量和最小的开销
- 需要控制内存使用（并行读取 Parquet、无中间 DataFrame）

**在以下情况下继续使用 pandas 模式：**

- 你需要与 pandas 完全一致的行为（行顺序、MultiIndex、dtypes）
- 你依赖 `first()`/`last()` 返回真正的第一/最后一行
- 你使用 `shift()`、`diff()`、`cumsum()` 等依赖行顺序的操作
- 你在编写将 DataStore 输出与 pandas 进行对比的测试

## 行为差异 \{#behavior-differences\}

### 行顺序 \{#row-order\}

在性能模式下，任何操作的行顺序都**不保证**。这包括：

* 过滤结果
* GroupBy 聚合结果
* 未显式使用 `sort_values()` 的 `head()` / `tail()`
* `first()` / `last()` 聚合结果

如果需要有序的结果，请显式添加 `sort_values()`：

```python
config.use_performance_mode()

ds = pd.read_csv("data.csv")

# Unordered (fast)
result = ds.groupby("region")["revenue"].sum()

# Ordered (still fast, just adds ORDER BY)
result = ds.groupby("region")["revenue"].sum().sort_values()
```


### GroupBy 结果 \{#groupby-results\}

| 比较项 | Pandas 模式 | 性能模式 |
|--------|------------|-----------------|
| 分组键位置 | 索引（通过 `set_index`） | 普通列 |
| 分组顺序 | 按键排序（默认） | 任意顺序 |
| NULL 分组 | 排除（默认 `dropna=True`） | 包含 |
| 列格式 | 多重聚合时使用 MultiIndex | 扁平名称（`col_func`） |
| `first()`/`last()` | 结果确定（依赖行顺序） | 结果不确定（`any()`/`anyLast()`） |

### 聚合 \{#aggregation\}

```python
config.use_performance_mode()

# Sum of all-NaN group returns NULL (not 0)
# Count returns native uint64 (not forced int64)
# No -If wrappers: sum() instead of sumIf()
result = ds.groupby("cat")["val"].sum()
```


### 单 SQL 执行 \{#single-sql\}

在 performance 模式下，`ColumnExpr` 的 groupby 聚合（例如 `ds[condition].groupby('col')['val'].sum()`）会作为**单条 SQL 查询**执行，而不是像 pandas 模式那样采用两步流程：

```python
config.use_performance_mode()

# Pandas mode: two SQL queries (filter → materialize → groupby)
# Performance mode: one SQL query (WHERE + GROUP BY in same query)
result = ds[ds["rating"] > 3.5].groupby("category")["revenue"].sum()

# Generated SQL (single query):
# SELECT category, sum(revenue) FROM data WHERE rating > 3.5 GROUP BY category
```

这将消除中间的 DataFrame 物化，并可显著降低内存占用和执行时间。

***


## 与执行引擎的比较 \{#vs-execution-engine\}

Performance mode（`compat_mode`）和执行引擎（`execution_engine`）是**彼此独立的配置维度**：

| Config             | Controls               | Values                   |
| ------------------ | ---------------------- | ------------------------ |
| `execution_engine` | 控制**由哪个引擎**执行计算        | `auto`, `chdb`, `pandas` |
| `compat_mode`      | 控制**是否**调整输出以兼容 pandas | `pandas`, `performance`  |

当设置 `compat_mode='performance'` 时，会自动将 `execution_engine` 设为 `chdb`，因为 performance mode 是专为 SQL 执行设计的。

```python
from chdb.datastore.config import config

# These are independent
config.use_chdb()              # Force chDB engine, keep pandas compat
config.use_performance_mode()  # Force chDB + remove pandas overhead
```

***


## 使用 Performance 模式进行测试 \{#testing\}

在为 Performance 模式编写测试时，结果在行顺序和结构格式上可能会与 pandas 存在差异。请使用以下策略：

### 排序后比较（聚合、过滤） \{#sort-then-compare\}

```python
# Sort both sides by the same columns before comparing
ds_result = ds.groupby("cat")["val"].sum()
pd_result = pd_df.groupby("cat")["val"].sum()

ds_sorted = ds_result.sort_index()
pd_sorted = pd_result.sort_index()
np.testing.assert_array_equal(ds_sorted.values, pd_sorted.values)
```


### 数值范围校验（first/last） \{#value-range-check\}

```python
# first() with any() returns an arbitrary element from the group
result = ds.groupby("cat")["val"].first()
for group_key in groups:
    assert result.loc[group_key] in group_values[group_key]
```


### 模式与计数（不带 ORDER BY 的 LIMIT） \{#schema-and-count\}

```python
# head() without sort_values: row set is non-deterministic
result = ds.head(5)
assert len(result) == 5
assert set(result.columns) == expected_columns
```

***


## 最佳实践 \{#best-practices\}

### 1. 在脚本中尽早启用 \{#enable-early\}

```python
from chdb.datastore.config import config

config.use_performance_mode()

# All subsequent operations benefit
ds = pd.read_parquet("data.parquet")
result = ds[ds["amount"] > 100].groupby("region")["amount"].sum()
```


### 2. 在顺序有要求时显式添加排序 \{#explicit-sort\}

```python
# For display or downstream processing that expects order
result = (ds
    .groupby("region")["revenue"].sum()
    .sort_values(ascending=False)
)
```


### 3. 用于批处理/ETL 类型的工作负载 \{#batch-etl\}

```python
config.use_performance_mode()

# ETL pipeline — order doesn't matter, throughput does
summary = (ds
    .filter(ds["date"] >= "2024-01-01")
    .groupby(["region", "product"])
    .agg({"revenue": "sum", "quantity": "sum", "rating": "mean"})
)
summary.to_df().to_parquet("summary.parquet")
```


### 4. 在会话中切换模式 \{#switch-modes\}

```python
# Performance mode for heavy computation
config.use_performance_mode()
aggregated = ds.groupby("cat")["val"].sum()

# Back to pandas mode for exact-match comparison
config.use_pandas_compat()
detailed = ds[ds["val"] > 100].head(10)
```

***


## 相关文档 \{#related\}

- [Execution Engine](execution-engine.md) — 引擎选择（auto/chdb/pandas）
- [Performance Guide](../guides/pandas-performance.md) — 通用性能优化建议
- [Key Differences from pandas](../guides/pandas-differences.md) — 行为差异
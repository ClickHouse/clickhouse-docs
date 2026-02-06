---
title: '与 pandas 的关键差异'
sidebar_label: '关键差异'
slug: /chdb/guides/pandas-differences
description: 'DataStore 与 pandas 之间的重要差异'
keywords: ['chdb', 'datastore', 'pandas', 'differences', 'behavior']
doc_type: 'guide'
---

# 与 pandas 的主要区别 \{#key-differences-from-pandas\}

虽然 DataStore 与 pandas 高度兼容，但仍有一些重要区别需要了解。

## 摘要表 \{#summary\}

| 方面 | pandas | DataStore |
|--------|--------|-----------|
| **执行方式** | Eager（立即执行） | Lazy（延迟执行） |
| **返回类型** | DataFrame/Series | DataStore/ColumnExpr |
| **行顺序** | 保留 | 保留（自动） |
| **inplace** | 支持 | 不支持 |
| **索引** | 完全支持 | 简化实现 |
| **内存** | 所有数据驻留内存 | 数据驻留在数据源 |

## 1. 惰性执行 vs 急切执行 \{#lazy-execution\}

### pandas（立即执行） \{#pandas-eager\}

操作会立即执行：

```python
import pandas as pd

df = pd.read_csv("data.csv")  # Loads entire file NOW
result = df[df['age'] > 25]   # Filters NOW
grouped = result.groupby('city')['salary'].mean()  # Aggregates NOW
```


### DataStore（惰性执行） \{#datastore-lazy\}

操作会被延后，只有在需要结果时才会执行：

```python
from chdb import datastore as pd

ds = pd.read_csv("data.csv")  # Just records the source
result = ds[ds['age'] > 25]   # Just records the filter
grouped = result.groupby('city')['salary'].mean()  # Just records

# Execution happens here:
print(grouped)        # Executes when displaying
df = grouped.to_df()  # Or when converting to pandas
```


### 为什么重要 \{#why-lazy\}

惰性执行带来：

- **查询优化**：多个操作编译为一个 SQL 查询
- **列裁剪**：只读取所需的列
- **过滤下推**：在数据源处应用过滤条件
- **内存效率**：避免加载不需要的数据

---

## 2. 返回类型 \{#return-types\}

### pandas \{#pandas-return-types\}

```python
df['col']           # Returns pd.Series
df[['a', 'b']]      # Returns pd.DataFrame
df[df['x'] > 10]    # Returns pd.DataFrame
df.groupby('x')     # Returns DataFrameGroupBy
```


### DataStore（数据存储） \{#datastore-return-types\}

```python
ds['col']           # Returns ColumnExpr (lazy)
ds[['a', 'b']]      # Returns DataStore (lazy)
ds[ds['x'] > 10]    # Returns DataStore (lazy)
ds.groupby('x')     # Returns LazyGroupBy
```


### 转换为 pandas 数据类型 \{#converting-to-pandas-types\}

```python
# Get pandas DataFrame
df = ds.to_df()
df = ds.to_pandas()

# Get pandas Series from column
series = ds['col'].to_pandas()

# Or trigger execution
print(ds)  # Automatically converts for display
```

***


## 3. 执行触发器 \{#triggers\}

当你真正需要实际值时，DataStore 才会执行：

| 触发器 | 示例 | 说明 |
|---------|---------|-------|
| `print()` / `repr()` | `print(ds)` | 显示需要数据 |
| `len()` | `len(ds)` | 需要行数 |
| `.columns` | `ds.columns` | 需要列名 |
| `.dtypes` | `ds.dtypes` | 需要类型信息 |
| `.shape` | `ds.shape` | 需要维度信息 |
| `.values` | `ds.values` | 需要实际数据 |
| `.index` | `ds.index` | 需要索引 |
| `to_df()` | `ds.to_df()` | 显式转换 |
| Iteration | `for row in ds` | 需要进行迭代 |
| `equals()` | `ds.equals(other)` | 需要比较 |

### 保持惰性评估的操作 \{#stay-lazy\}

| 操作 | 返回 |
|-----------|---------|
| `filter()` | DataStore |
| `select()` | DataStore |
| `sort()` | DataStore |
| `groupby()` | LazyGroupBy |
| `join()` | DataStore |
| `ds['col']` | ColumnExpr |
| `ds[['a', 'b']]` | DataStore |
| `ds[condition]` | DataStore |

---

## 4. 行顺序 \{#row-order\}

### pandas \{#pandas-row-order\}

行的顺序始终保持不变：

```python
df = pd.read_csv("data.csv")
print(df.head())  # Always same order as file
```


### DataStore \{#datastore-row-order\}

在大多数操作中，行顺序会被**自动保留**：

```python
ds = pd.read_csv("data.csv")
print(ds.head())  # Matches file order

# Filter preserves order
ds_filtered = ds[ds['age'] > 25]  # Same order as pandas
```

DataStore 会在内部自动跟踪原始行的位置（使用 `rowNumberInAllBlocks()`），以确保与 pandas 保持相同的顺序。


### 何时会保留顺序 \{#order-preserved\}

- 文件数据源（CSV、Parquet、JSON 等）
- pandas DataFrame 数据源
- 过滤操作
- 列选择
- 显式调用 `sort()` 或 `sort_values()` 之后
- 定义顺序的操作（`nlargest()`、`nsmallest()`、`head()`、`tail()`）

### 何时顺序可能不同 \{#order-may-differ\}

- 在进行 `groupby()` 聚合之后（请使用 `sort_values()` 以确保顺序一致）
- 在使用某些连接类型执行 `merge()` / `join()` 操作之后

---

## 5. 无 inplace 参数 \{#no-inplace\}

### pandas \{#pandas-inplace\}

```python
df.drop(columns=['col'], inplace=True)  # Modifies df
df.fillna(0, inplace=True)              # Modifies df
df.rename(columns={'old': 'new'}, inplace=True)
```


### DataStore \{#datastore-inplace\}

不支持 `inplace=True`。请务必将返回结果重新赋值：

```python
ds = ds.drop(columns=['col'])           # Returns new DataStore
ds = ds.fillna(0)                       # Returns new DataStore
ds = ds.rename(columns={'old': 'new'})  # Returns new DataStore
```


### 为什么不支持 inplace？ \{#why-no-inplace\}

DataStore 使用不可变操作用于：

- 构建查询（延迟计算）
- 线程安全
- 便于调试
- 代码更整洁

---

## 6. 索引支持 \{#index\}

### pandas \{#pandas-index\}

全面的索引支持：

```python
df = df.set_index('id')
df.loc['user123']           # Label-based access
df.loc['a':'z']             # Label-based slicing
df.reset_index()
df.index.name = 'user_id'
```


### DataStore \{#datastore-index\}

简化的索引支持：

```python
# Basic operations work
ds.loc[0:10]               # Integer position
ds.iloc[0:10]              # Same as loc for DataStore

# For pandas-style index operations, convert first
df = ds.to_df()
df = df.set_index('id')
df.loc['user123']
```


### DataStore 数据源很重要 \{#datastore-source-matters\}

- **DataFrame 数据源**：保留 pandas 索引
- **文件数据源**：使用简单的整数型索引

---

## 7. 比较行为 \{#comparison\}

### 与 pandas 的比较 \{#comparing-with-pandas\}

pandas 无法识别 DataStore 对象：

```python
import pandas as pd
from chdb import datastore as ds

pdf = pd.DataFrame({'a': [1, 2, 3]})
dsf = ds.DataFrame({'a': [1, 2, 3]})

# This doesn't work as expected
pdf == dsf  # pandas doesn't know DataStore

# Solution: convert DataStore to pandas
pdf.equals(dsf.to_pandas())  # True
```


### 使用 equals() 方法 \{#using-equals\}

```python
# DataStore.equals() also works
dsf.equals(pdf)  # Compares with pandas DataFrame
```

***


## 8. 类型推断 \{#types\}

### pandas \{#pandas-types\}

采用 numpy/pandas 数据类型：

```python
df['col'].dtype  # int64, float64, object, datetime64, etc.
```


### DataStore \{#datastore-types\}

可以使用 ClickHouse 类型：

```python
ds['col'].dtype  # Int64, Float64, String, DateTime, etc.

# Types are converted when going to pandas
df = ds.to_df()
df['col'].dtype  # Now pandas type
```


### 显式类型转换 \{#explicit-casting\}

```python
# Force specific type
ds['col'] = ds['col'].astype('int64')
```

***


## 9. 内存模型 \{#memory\}

### pandas \{#pandas-memory\}

所有数据都保存在内存中：

```python
df = pd.read_csv("huge.csv")  # 10GB in memory!
```


### DataStore \{#datastore-memory\}

数据会保留在源端，只有在需要时才会被加载：

```python
ds = pd.read_csv("huge.csv")  # Just metadata
ds = ds.filter(ds['year'] == 2024)  # Still just metadata

# Only filtered result is loaded
df = ds.to_df()  # Maybe only 1GB now
```

***


## 10. 错误信息 \{#errors\}

### 不同错误来源 \{#different-error-sources\}

* **pandas 错误**：来自 pandas 库
* **DataStore 错误**：来自 chDB 或 ClickHouse

```python
# May see ClickHouse-style errors
# "Code: 62. DB::Exception: Syntax error..."
```


### 调试技巧 \{#debugging-tips\}

```python
# View the SQL to debug
print(ds.to_sql())

# See execution plan
ds.explain()

# Enable debug logging
from chdb.datastore.config import config
config.enable_debug()
```

***


## 迁移检查清单 \{#checklist\}

从 pandas 迁移时：

- [ ] 更改 import 语句
- [ ] 删除 `inplace=True` 参数
- [ ] 在需要 pandas DataFrame 的地方显式调用 `to_df()`
- [ ] 如果行顺序重要，则添加排序
- [ ] 使用 `to_pandas()` 进行对比测试
- [ ] 在具有代表性的数据规模下进行测试

---

## 快速参考 \{#quick-ref\}

| pandas | DataStore |
|--------|-----------|
| `df[condition]` | 相同（返回 DataStore） |
| `df.groupby()` | 相同（返回 LazyGroupBy） |
| `df.drop(inplace=True)` | `ds = ds.drop()` |
| `df.equals(other)` | `ds.to_pandas().equals(other)` |
| `df.loc['label']` | `ds.to_df().loc['label']` |
| `print(df)` | 相同（会触发执行） |
| `len(df)` | 相同（会触发执行） |
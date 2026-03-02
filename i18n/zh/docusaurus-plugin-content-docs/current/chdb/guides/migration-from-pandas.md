---
title: '从 pandas 迁移'
sidebar_label: '从 pandas 迁移'
slug: /chdb/guides/migration-from-pandas
description: '从 pandas 迁移到 DataStore 的分步指南'
keywords: ['chdb', 'datastore', 'pandas', 'migration', 'guide']
doc_type: 'guide'
---

# 从 pandas 迁移 \{#migration-from-pandas\}

本指南帮助你将现有的 pandas 代码迁移到 DataStore，在保持兼容性的同时提升性能。

## 一行代码迁移 \{#one-line\}

最简单的迁移方式是只需更改你的导入语句：

```python
# Before (pandas)
import pandas as pd

# After (DataStore)
from chdb import datastore as pd
```

就是这样！大多数 pandas 代码无需修改即可正常工作。


## 分步迁移 \{#step-by-step\}

<VerticalStepper headerLevel="h3">

### 安装 chDB \{#step-1\}

```bash
pip install "chdb>=4.0"
```

### 更改导入方式 \{#step-2\}

```python
# 将此：
import pandas as pd

# 改为：
from chdb import datastore as pd
```

### 测试代码 \{#step-3\}

直接运行你现有的代码。大多数操作无需修改即可正常运行：

```python
from chdb import datastore as pd

# 这些操作的行为都相同
df = pd.read_csv("data.csv")
result = df[df['age'] > 25]
grouped = df.groupby('city')['salary'].mean()
df.to_csv("output.csv")
```

### 处理行为差异 \{#step-4\}

少数操作的行为有所不同。请参见下方的[关键差异](#differences)。

</VerticalStepper>

---

## 无需修改即可使用的功能 \{#works-unchanged\}

### 数据加载 \{#loading-unchanged\}

```python
# All these work the same
df = pd.read_csv("data.csv")
df = pd.read_parquet("data.parquet")
df = pd.read_json("data.json")
df = pd.read_excel("data.xlsx")
```


### 过滤 \{#filtering-unchanged\}

```python
# Boolean indexing
df[df['age'] > 25]
df[(df['age'] > 25) & (df['city'] == 'NYC')]

# query() method
df.query('age > 25 and salary > 50000')
```


### 选择 \{#selection-unchanged\}

```python
# Column selection
df['name']
df[['name', 'age']]

# Row selection
df.head(10)
df.tail(10)
df.iloc[0:100]
```


### GroupBy 和聚合 \{#groupby-unchanged\}

```python
# GroupBy
df.groupby('city')['salary'].mean()
df.groupby(['city', 'dept']).agg({'salary': ['sum', 'mean']})
```


### 排序 \{#sorting-unchanged\}

```python
df.sort_values('salary', ascending=False)
df.sort_values(['city', 'age'])
```


### 字符串操作 \{#string-unchanged\}

```python
df['name'].str.upper()
df['name'].str.contains('John')
df['name'].str.len()
```


### 日期时间操作 \{#datetime-unchanged\}

```python
df['date'].dt.year
df['date'].dt.month
df['date'].dt.dayofweek
```


### I/O 操作 \{#io-unchanged\}

```python
df.to_csv("output.csv")
df.to_parquet("output.parquet")
df.to_json("output.json")
```

***


## 主要差异 \{#differences\}

### 1. 惰性求值 \{#lazy\}

DataStore 操作是延迟执行的——只有在需要结果时才会真正运行。

**pandas：**

```python
# Executes immediately
result = df[df['age'] > 25]
print(type(result))  # pandas.DataFrame
```

**DataStore:**

```python
# Builds query, doesn't execute yet
result = ds[ds['age'] > 25]
print(type(result))  # DataStore (lazy)

# Executes when you need the data
print(result)        # Triggers execution
df = result.to_df()  # Triggers execution
```


### 2. 返回类型 \{#return-types\}

| 操作 | pandas 返回值 | DataStore 返回值 |
|-----------|---------------|-------------------|
| `df['col']` | Series | ColumnExpr（惰性计算） |
| `df[['a', 'b']]` | DataFrame | DataStore（惰性计算） |
| `df[condition]` | DataFrame | DataStore（惰性计算） |
| `df.groupby('x')` | GroupBy | LazyGroupBy |

### 3. 无 inplace 参数 \{#no-inplace\}

DataStore 不支持 `inplace=True` 参数。始终使用返回值：

**pandas：**

```python
df.drop(columns=['col'], inplace=True)
```

**DataStore：**

```python
ds = ds.drop(columns=['col'])  # Assign the result
```


### 4. 比较 DataStore \{#comparing\}

pandas 无法识别 DataStore 对象，因此请使用 `to_pandas()` 进行比较：

```python
# This may not work as expected
df == ds  # pandas doesn't know DataStore

# Do this instead
df.equals(ds.to_pandas())
```


### 5. 行顺序 \{#row-order\}

对于文件类数据源（如 SQL 数据库），DataStore 可能不会保留行顺序。使用显式排序：

```python
# pandas preserves order
df = pd.read_csv("data.csv")

# DataStore - use sort for guaranteed order
ds = pd.read_csv("data.csv")
ds = ds.sort('id')  # Explicit ordering
```

***


## 迁移模式 \{#patterns\}

### 模式 1：读-分析-写 \{#pattern-1\}

```python
# pandas
import pandas as pd
df = pd.read_csv("data.csv")
result = df[df['amount'] > 100].groupby('category')['amount'].sum()
result.to_csv("output.csv")

# DataStore - same code works!
from chdb import datastore as pd
df = pd.read_csv("data.csv")
result = df[df['amount'] > 100].groupby('category')['amount'].sum()
result.to_csv("output.csv")
```


### 模式 2：使用 pandas 操作的 DataFrame \{#pattern-2\}

如果你需要依赖 pandas 特有的功能，可以在最后再进行转换：

```python
from chdb import datastore as pd

# Fast DataStore operations
ds = pd.read_csv("large_data.csv")
ds = ds.filter(ds['date'] >= '2024-01-01')
ds = ds.filter(ds['amount'] > 100)

# Convert to pandas for specific features
df = ds.to_df()
df_pivoted = df.pivot_table(...)  # pandas-specific
```


### 模式 3：混合工作流 \{#pattern-3\}

```python
from chdb import datastore as pd
import pandas

# Start with DataStore for fast filtering
ds = pd.read_csv("huge_file.csv")  # 10M rows
ds = ds.filter(ds['year'] == 2024)  # Fast SQL filter
ds = ds.select('col1', 'col2', 'col3')  # Column pruning

# Convert for pandas-specific operations
df = ds.to_df()  # Now only ~100K rows
result = df.apply(complex_custom_function)  # pandas
```

***


## 性能对比 \{#performance\}

在处理大型数据集时，DataStore 的速度显著更快：

| 操作 | pandas | DataStore | 加速倍数 |
|-----------|--------|-----------|---------|
| GroupBy count | 347ms | 17ms | **19.93x** |
| Complex pipeline | 2,047ms | 380ms | **5.39x** |
| Filter+Sort+Head | 1,537ms | 350ms | **4.40x** |
| GroupBy agg | 406ms | 141ms | **2.88x** |

*基于 1000 万行数据的基准测试*

---

## 迁移故障排查 \{#troubleshooting\}

### 问题：操作不起作用 \{#issue-op\}

某些 pandas 操作可能尚未受支持。请检查：

1. 该操作是否在[兼容性列表](../datastore/pandas-compat.md)中？
2. 尝试先转换为 pandas：`ds.to_df().operation()`

### 问题：结果不一致 \{#issue-results\}

启用调试日志以了解发生了什么：

```python
from chdb.datastore.config import config
config.enable_debug()

# View the SQL being generated
ds.filter(ds['x'] > 10).explain()
```


### 问题：性能较慢 \{#issue-slow\}

请检查执行方式：

```python
# Bad: Multiple small executions
for i in range(1000):
    result = ds.filter(ds['id'] == i).to_df()

# Good: Single execution
result = ds.filter(ds['id'].isin(ids)).to_df()
```


### 问题：类型不一致 \{#issue-types\}

DataStore 可能会对类型做出不同的推断：

```python
# Check types
print(ds.dtypes)

# Force conversion
ds['col'] = ds['col'].astype('int64')
```

***


## 逐步迁移策略 \{#gradual\}

### 第 1 周：兼容性测试 \{#week-1\}

```python
# Keep both imports
import pandas as pd
from chdb import datastore as ds

# Compare results
pdf = pd.read_csv("data.csv")
dsf = ds.read_csv("data.csv")

# Verify they match
assert pdf.equals(dsf.to_pandas())
```


### 第 2 周：迁移简单脚本 \{#week-2\}

首先从以下类型的脚本入手：

- 读取大文件
- 执行过滤和聚合
- 不使用自定义 apply 函数

### 第 3 周：处理复杂用例 \{#week-3\}

对于含有自定义函数的脚本：

```python
from chdb import datastore as pd

# Let DataStore handle the heavy lifting
ds = pd.read_csv("data.csv")
ds = ds.filter(ds['year'] == 2024)  # SQL

# Convert for custom work
df = ds.to_df()
result = df.apply(my_custom_function)
```


### 第 4 周：完整迁移 \{#week-4\}

将所有脚本全部改为通过 DataStore 导入。

## 常见问题 \{#faq\}

### 我可以同时使用 pandas 和 DataStore 吗？ \{#faq-both\}

可以！可以在二者之间自由转换：

```python
from chdb import datastore as ds
import pandas as pd

# DataStore to pandas
df = ds_result.to_pandas()

# pandas to DataStore  
ds = ds.DataFrame(pd_result)
```


### 我的测试还会通过吗？ \{#faq-tests\}

大多数测试应该仍然会通过。对于比较类测试，请先转换为 pandas：

```python
def test_my_function():
    result = my_function()
    expected = pd.DataFrame(...)
    pd.testing.assert_frame_equal(result.to_pandas(), expected)
```


### 我可以在 Jupyter 中使用 DataStore 吗？ \{#faq-jupyter\}

可以！DataStore 可以在 Jupyter Notebook 中使用：

```python
from chdb import datastore as pd

ds = pd.read_csv("data.csv")
ds.head()  # Displays nicely in Jupyter
```


### 我如何反馈问题？ \{#faq-issues\}

如果您遇到兼容性问题，请到以下地址反馈：
https://github.com/chdb-io/chdb/issues
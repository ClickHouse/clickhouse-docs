---
title: 'DataStore 类参考'
sidebar_label: '类参考'
slug: /chdb/datastore/class-reference
description: 'DataStore、ColumnExpr、LazyGroupBy 和 LazySeries 类的完整 API 参考文档'
keywords: ['chdb', 'datastore', 'class', 'reference', 'api', 'columnexpr', 'lazygroupby']
doc_type: 'reference'
---

# DataStore 类参考 \{#datastore-class-reference\}

本参考文档介绍了 DataStore API 中的核心类。

## DataStore \{#datastore\}

用于数据处理的主要 DataFrame 风格类。

```python
from chdb.datastore import DataStore
```


### 构造函数 \{#datastore-constructor\}

```python
DataStore(data=None, columns=None, index=None, dtype=None, copy=None)
```

**参数：**

| 参数        | 类型                            | 描述     |
| --------- | ----------------------------- | ------ |
| `data`    | dict/list/DataFrame/DataStore | 输入数据   |
| `columns` | list                          | 列名     |
| `index`   | Index                         | 行索引    |
| `dtype`   | dict                          | 列数据类型  |
| `copy`    | bool                          | 是否复制数据 |

**示例：**

```python
# From dictionary
ds = DataStore({'a': [1, 2, 3], 'b': ['x', 'y', 'z']})

# From pandas DataFrame
import pandas as pd
ds = DataStore(pd.DataFrame({'a': [1, 2, 3]}))

# Empty DataStore
ds = DataStore()
```


### 属性 \{#datastore-properties\}

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| `columns` | Index | 列名 |
| `dtypes` | Series | 列的数据类型 |
| `shape` | tuple | (行, 列) |
| `size` | int | 元素总数 |
| `ndim` | int | 维数（2） |
| `empty` | bool | DataFrame 是否为空 |
| `values` | ndarray | 底层数据（NumPy 数组形式） |
| `index` | Index | 行索引 |
| `T` | DataStore | 转置 |
| `axes` | list | 轴列表 |

### 工厂方法 \{#datastore-factory\}

| Method | Description |
|--------|-------------|
| `uri(uri)` | 基于 URI 的通用工厂方法 |
| `from_file(path, ...)` | 从文件创建 |
| `from_df(df)` | 从 pandas DataFrame 创建 |
| `from_s3(url, ...)` | 从 S3 创建 |
| `from_gcs(url, ...)` | 从 Google Cloud Storage 创建 |
| `from_azure(url, ...)` | 从 Azure Blob 创建 |
| `from_mysql(...)` | 从 MySQL 创建 |
| `from_postgresql(...)` | 从 PostgreSQL 创建 |
| `from_clickhouse(...)` | 从 ClickHouse 创建 |
| `from_mongodb(...)` | 从 MongoDB 创建 |
| `from_sqlite(...)` | 从 SQLite 创建 |
| `from_iceberg(path)` | 从 Iceberg 表创建 |
| `from_delta(path)` | 从 Delta Lake 创建 |
| `from_numbers(n)` | 使用连续数字创建 |
| `from_random(rows, cols)` | 使用随机数据创建 |
| `run_sql(query)` | 通过 SQL 查询创建 |

详细信息请参见 [工厂方法](factory-methods.md)。

### 查询方法 \{#datastore-query\}

| Method | Returns | Description |
|--------|---------|-------------|
| `select(*cols)` | DataStore | 选择列 |
| `filter(condition)` | DataStore | 过滤行 |
| `where(condition)` | DataStore | `filter` 的别名 |
| `sort(*cols, ascending=True)` | DataStore | 对行排序 |
| `orderby(*cols)` | DataStore | `sort` 的别名 |
| `limit(n)` | DataStore | 限制行数 |
| `offset(n)` | DataStore | 跳过行 |
| `distinct(subset=None)` | DataStore | 移除重复行 |
| `groupby(*cols)` | LazyGroupBy | 对行分组 |
| `having(condition)` | DataStore | 过滤分组 |
| `join(right, ...)` | DataStore | 连接 DataStore |
| `union(other, all=False)` | DataStore | 合并 DataStore |
| `when(cond, val)` | CaseWhen | CASE WHEN |

详见 [查询构建](query-building.md)。

### 兼容 Pandas 的方法 \{#datastore-pandas\}

有关完整的 209 个方法列表，请参阅 [Pandas 兼容性](pandas-compat.md)。

**索引：**
`head()`, `tail()`, `sample()`, `loc`, `iloc`, `at`, `iat`, `query()`, `isin()`, `where()`, `mask()`, `get()`, `xs()`, `pop()`

**聚合：**
`sum()`, `mean()`, `std()`, `var()`, `min()`, `max()`, `median()`, `count()`, `nunique()`, `quantile()`, `describe()`, `corr()`, `cov()`, `skew()`, `kurt()`

**数据操作：**
`drop()`, `drop_duplicates()`, `dropna()`, `fillna()`, `replace()`, `rename()`, `assign()`, `astype()`, `copy()`

**排序：**
`sort_values()`, `sort_index()`, `nlargest()`, `nsmallest()`, `rank()`

**重塑：**
`pivot()`, `pivot_table()`, `melt()`, `stack()`, `unstack()`, `transpose()`, `explode()`, `squeeze()`

**合并：**
`merge()`, `join()`, `concat()`, `append()`, `combine()`, `update()`, `compare()`

**应用/转换：**
`apply()`, `applymap()`, `map()`, `agg()`, `transform()`, `pipe()`, `groupby()`

**时间序列：**
`rolling()`, `expanding()`, `ewm()`, `shift()`, `diff()`, `pct_change()`, `resample()`

### I/O 方法 \{#datastore-io\}

| Method | Description |
|--------|-------------|
| `to_csv(path, ...)` | 导出为 CSV |
| `to_parquet(path, ...)` | 导出为 Parquet |
| `to_json(path, ...)` | 导出为 JSON |
| `to_excel(path, ...)` | 导出为 Excel |
| `to_df()` | 转换为 pandas DataFrame |
| `to_pandas()` | `to_df` 的别名 |
| `to_arrow()` | 转换为 Arrow 表 |
| `to_dict(orient)` | 转换为字典 |
| `to_records()` | 转换为记录 |
| `to_numpy()` | 转换为 NumPy 数组 |
| `to_sql()` | 生成 SQL 字符串 |
| `to_string()` | 字符串表示形式 |
| `to_markdown()` | Markdown 表 |
| `to_html()` | HTML 表 |

详情参见 [I/O Operations](io.md)。

### 调试方法 \{#datastore-debug\}

| 方法 | 描述 |
|--------|-------------|
| `explain(verbose=False)` | 显示执行计划 |
| `clear_cache()` | 清除缓存的结果 |

详见 [调试](../debugging/index.md)。

### 魔术方法 \{#datastore-magic\}

| 方法 | 示例 |
|--------|-------------|
| `__getitem__(key)` | `ds['col']`, `ds[['a', 'b']]`, `ds[condition]` |
| `__setitem__(key, value)` | `ds['col'] = value` |
| `__delitem__(key)` | `del ds['col']` |
| `__len__()` | `len(ds)` |
| `__iter__()` | `for col in ds` |
| `__contains__(key)` | `'col' in ds` |
| `__repr__()` | `repr(ds)` |
| `__str__()` | `str(ds)` |
| `__eq__(other)` | `ds == other` |
| `__ne__(other)` | `ds != other` |
| `__lt__(other)` | `ds < other` |
| `__le__(other)` | `ds <= other` |
| `__gt__(other)` | `ds > other` |
| `__ge__(other)` | `ds >= other` |
| `__add__(other)` | `ds + other` |
| `__sub__(other)` | `ds - other` |
| `__mul__(other)` | `ds * other` |
| `__truediv__(other)` | `ds / other` |
| `__floordiv__(other)` | `ds // other` |
| `__mod__(other)` | `ds % other` |
| `__pow__(other)` | `ds ** other` |
| `__and__(other)` | `ds & other` |
| `__or__(other)` | `ds | other` |
| `__invert__()` | `~ds` |
| `__neg__()` | `-ds` |
| `__pos__()` | `+ds` |
| `__abs__()` | `abs(ds)` |

---

## ColumnExpr \{#columnexpr\}

表示用于惰性求值的列表达式。在访问列时会返回它。

```python
# ColumnExpr is returned automatically
col = ds['name']  # Returns ColumnExpr
```


### 属性 \{#columnexpr-properties\}

| 属性 | 类型 | 说明 |
|----------|------|-------------|
| `name` | str | 列名 |
| `dtype` | dtype | 数据类型 |

### 访问器 \{#columnexpr-accessors\}

| 访问器 | 描述 | 方法 |
|----------|-------------|---------|
| `.str` | 字符串操作 | 56 个方法 |
| `.dt` | 日期时间操作 | 42+ 个方法 |
| `.arr` | 数组操作 | 37 个方法 |
| `.json` | JSON 解析 | 13 个方法 |
| `.url` | URL 解析 | 15 个方法 |
| `.ip` | IP 地址操作 | 9 个方法 |
| `.geo` | 地理/距离相关操作 | 14 个方法 |

有关访问器的完整说明，请参见 [访问器](accessors.md)。

### 算术运算 \{#columnexpr-arithmetic\}

```python
ds['total'] = ds['price'] * ds['quantity']
ds['profit'] = ds['revenue'] - ds['cost']
ds['ratio'] = ds['a'] / ds['b']
ds['squared'] = ds['value'] ** 2
ds['remainder'] = ds['value'] % 10
```


### 比较运算 \{#columnexpr-comparison\}

```python
ds[ds['age'] > 25]           # Greater than
ds[ds['age'] >= 25]          # Greater or equal
ds[ds['age'] < 25]           # Less than
ds[ds['age'] <= 25]          # Less or equal
ds[ds['name'] == 'Alice']    # Equal
ds[ds['name'] != 'Bob']      # Not equal
```


### 逻辑运算 \{#columnexpr-logical\}

```python
ds[(ds['age'] > 25) & (ds['city'] == 'NYC')]    # AND
ds[(ds['age'] > 25) | (ds['city'] == 'NYC')]    # OR
ds[~(ds['status'] == 'inactive')]               # NOT
```


### 方法 \{#columnexpr-methods\}

| Method | Description |
|--------|-------------|
| `as_(alias)` | 设置别名 |
| `cast(dtype)` | 转换为指定类型 |
| `astype(dtype)` | `cast` 的别名 |
| `isnull()` | 是否为 NULL |
| `notnull()` | 是否不为 NULL |
| `isna()` | `isnull` 的别名 |
| `notna()` | `notnull` 的别名 |
| `isin(values)` | 是否在值列表中 |
| `between(low, high)` | 是否介于两个值之间 |
| `fillna(value)` | 填充 NULL 值 |
| `replace(to_replace, value)` | 替换值 |
| `clip(lower, upper)` | 将值截取到给定范围内 |
| `abs()` | 绝对值 |
| `round(decimals)` | 按指定位数四舍五入 |
| `floor()` | 向下取整 |
| `ceil()` | 向上取整 |
| `apply(func)` | 应用函数 |
| `map(mapper)` | 按映射转换值 |

### 聚合方法 \{#columnexpr-aggregation\}

| Method | 描述 |
|--------|-------------|
| `sum()` | 求和 |
| `mean()` | 均值 |
| `avg()` | mean 的别名 |
| `min()` | 最小值 |
| `max()` | 最大值 |
| `count()` | 统计非空值数量 |
| `nunique()` | 去重计数 |
| `std()` | 标准差 |
| `var()` | 方差 |
| `median()` | 中位数 |
| `quantile(q)` | 分位数 |
| `first()` | 第一个值 |
| `last()` | 最后一个值 |
| `any()` | 是否存在为真值 |
| `all()` | 是否全部为真 |
---

## LazyGroupBy \{#lazygroupby\}

表示一个用于聚合操作的分组 DataStore。

```python
# LazyGroupBy is returned automatically
grouped = ds.groupby('category')  # Returns LazyGroupBy
```


### 方法 \{#lazygroupby-methods\}

| 方法 | 返回值 | 描述 |
|--------|---------|-------------|
| `agg(spec)` | DataStore | 聚合 |
| `aggregate(spec)` | DataStore | `agg` 的别名 |
| `sum()` | DataStore | 每组求和 |
| `mean()` | DataStore | 每组求均值 |
| `count()` | DataStore | 每组计数 |
| `min()` | DataStore | 每组最小值 |
| `max()` | DataStore | 每组最大值 |
| `std()` | DataStore | 每组标准差 |
| `var()` | DataStore | 每组方差 |
| `median()` | DataStore | 每组中位数 |
| `nunique()` | DataStore | 每组唯一值计数 |
| `first()` | DataStore | 每组第一个值 |
| `last()` | DataStore | 每组最后一个值 |
| `nth(n)` | DataStore | 每组第 n 个值 |
| `head(n)` | DataStore | 每组前 n 个值 |
| `tail(n)` | DataStore | 每组后 n 个值 |
| `apply(func)` | DataStore | 对每组应用函数 |
| `transform(func)` | DataStore | 对每组进行变换 |
| `filter(func)` | DataStore | 筛选分组 |

### 列选择 \{#lazygroupby-columns\}

```python
# Select column after groupby
grouped['amount'].sum()     # Returns DataStore
grouped[['a', 'b']].sum()   # Returns DataStore
```


### 聚合说明 \{#lazygroupby-agg\}

```python
# Single aggregation
grouped.agg({'amount': 'sum'})

# Multiple aggregations per column
grouped.agg({'amount': ['sum', 'mean', 'count']})

# Named aggregations
grouped.agg(
    total=('amount', 'sum'),
    average=('amount', 'mean'),
    count=('id', 'count')
)
```

***


## LazySeries \{#lazyseries\}

表示一个惰性 Series（单列）对象。

### 属性 \{#lazyseries-properties\}

| 属性 | 类型 | 说明 |
|----------|------|-------------|
| `name` | str | Series 名称 |
| `dtype` | dtype | 数据类型 |

### 方法 \{#lazyseries-methods\}

继承了 `ColumnExpr` 的大部分方法。主要方法包括：

| 方法 | 描述 |
|--------|-------------|
| `value_counts()` | 值频次统计 |
| `unique()` | 唯一值 |
| `nunique()` | 唯一值计数 |
| `mode()` | 众数 |
| `to_list()` | 转换为列表 |
| `to_numpy()` | 转换为数组 |
| `to_frame()` | 转换为 DataStore |

---

## 相关类 \{#related\}

### F（函数） \{#f-class\}

ClickHouse 函数的命名空间。

```python
from chdb.datastore import F, Field

# Aggregations
F.sum(Field('amount'))
F.avg(Field('price'))
F.count(Field('id'))
F.quantile(Field('value'), 0.95)

# Conditional
F.sum_if(Field('amount'), Field('status') == 'completed')
F.count_if(Field('active'))

# Window
F.row_number().over(order_by='date')
F.lag('price', 1).over(partition_by='product', order_by='date')
```

有关详情，请参见 [Aggregation](aggregation.md#f-namespace)。


### 字段 \{#field-class\}

按名称引用列。

```python
from chdb.datastore import Field

# Create field reference
amount = Field('amount')
price = Field('price')

# Use in expressions
F.sum(Field('amount'))
F.avg(Field('price'))
```


### CaseWhen \{#casewhen-class\}

用于构建 CASE WHEN 表达式的构造器。

```python
# Create case-when expression
result = (ds
    .when(ds['score'] >= 90, 'A')
    .when(ds['score'] >= 80, 'B')
    .when(ds['score'] >= 70, 'C')
    .otherwise('F')
)

# Assign to column
ds['grade'] = result
```


### Window \{#window-class\}

窗口函数的窗口定义。

```python
from chdb.datastore import F

# Create window
window = F.window(
    partition_by='category',
    order_by='date',
    rows_between=(-7, 0)
)

# Use with aggregation
ds['rolling_avg'] = F.avg('price').over(window)
```

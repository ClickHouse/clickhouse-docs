---
title: 'DataStore 与 Pandas 的兼容性'
sidebar_label: 'Pandas 兼容性'
slug: /chdb/datastore/pandas-compat
description: 'DataStore 中与 Pandas 兼容的方法完整列表（共 209 个 DataFrame 方法）'
keywords: ['chdb', 'datastore', 'pandas', '兼容性', 'dataframe', '方法']
doc_type: 'reference'
---

# Pandas 兼容性 \{#pandas-compatibility\}

DataStore 实现了 **209 个 pandas DataFrame 方法**，以实现完整的 API 兼容性。您现有的 pandas 代码几乎无需修改即可继续使用。

## 兼容性策略 \{#approach\}

```python
# Typical migration - just change the import
- import pandas as pd
+ from chdb import datastore as pd

# Your code works unchanged
df = pd.read_csv("data.csv")
result = df[df['age'] > 25].groupby('city')['salary'].mean()
```

**关键原则：**

* 已实现全部 209 个 pandas DataFrame 方法
* 使用惰性求值以进行 SQL 优化
* 自动类型包装（DataFrame → DataStore，Series → ColumnExpr）
* 不可变操作（无 `inplace=True`）

***


## 属性与特性 \{#attributes\}

| Property  | 描述             | 是否触发计算 |
| --------- | -------------- | ------ |
| `shape`   | （行, 列）元组       | 是      |
| `columns` | 列名（Index）      | 是      |
| `dtypes`  | 列数据类型          | 是      |
| `values`  | NumPy 数组       | 是      |
| `index`   | 行索引            | 是      |
| `size`    | 元素个数           | 是      |
| `ndim`    | 维度数            | 否      |
| `empty`   | DataFrame 是否为空 | 是      |
| `T`       | 转置             | 是      |
| `axes`    | 轴列表            | 是      |

**示例：**

```python
from chdb import datastore as pd

ds = pd.read_csv("data.csv")

print(ds.shape)      # (1000, 5)
print(ds.columns)    # Index(['name', 'age', 'city', 'salary', 'dept'])
print(ds.dtypes)     # name: object, age: int64, ...
print(ds.empty)      # False
```

***


## 索引和选择 \{#indexing\}

| Method | Description              | Example |
|--------|--------------------------|---------|
| `df['col']` | 选择列                  | `ds['age']` |
| `df[['col1', 'col2']]` | 选择多列                | `ds[['name', 'age']]` |
| `df[condition]` | 布尔索引                | `ds[ds['age'] > 25]` |
| `df.loc[...]` | 基于标签访问             | `ds.loc[0:10, 'name']` |
| `df.iloc[...]` | 基于整数位置访问          | `ds.iloc[0:10, 0:3]` |
| `df.at[...]` | 通过标签获取单个值        | `ds.at[0, 'name']` |
| `df.iat[...]` | 通过位置获取单个值        | `ds.iat[0, 0]` |
| `df.head(n)` | 前 n 行                | `ds.head(10)` |
| `df.tail(n)` | 后 n 行                | `ds.tail(10)` |
| `df.sample(n)` | 随机抽样                | `ds.sample(100)` |
| `df.select_dtypes()` | 按数据类型选择           | `ds.select_dtypes(include='number')` |
| `df.query()` | 查询表达式               | `ds.query('age > 25')` |
| `df.where()` | 条件替换                | `ds.where(ds['age'] > 0, 0)` |
| `df.mask()` | 反向 where 操作         | `ds.mask(ds['age'] < 0, 0)` |
| `df.isin()` | 判断值是否属于集合          | `ds['city'].isin(['NYC', 'LA'])` |
| `df.get()` | 安全列访问              | `ds.get('col', default=None)` |
| `df.xs()` | 截取横截面              | `ds.xs('key')` |
| `df.pop()` | 删除列                 | `ds.pop('col')` |

---

## 统计方法 \{#statistical\}

| Method           | Description   | SQL Equivalent |
| ---------------- | ------------- | -------------- |
| `mean()`         | 平均值           | `AVG()`        |
| `median()`       | 中位数           | `MEDIAN()`     |
| `mode()`         | 众数            | -              |
| `std()`          | 标准差           | `STDDEV()`     |
| `var()`          | 方差            | `VAR()`        |
| `min()`          | 最小值           | `MIN()`        |
| `max()`          | 最大值           | `MAX()`        |
| `sum()`          | 求和            | `SUM()`        |
| `prod()`         | 乘积            | -              |
| `count()`        | 非空计数          | `COUNT()`      |
| `nunique()`      | 去重计数          | `UNIQ()`       |
| `value_counts()` | 各值频数统计        | `GROUP BY`     |
| `quantile()`     | 分位数           | `QUANTILE()`   |
| `describe()`     | 描述性统计汇总       | -              |
| `corr()`         | 相关系数矩阵        | `CORR()`       |
| `cov()`          | 协方差矩阵         | `COV()`        |
| `corrwith()`     | 成对相关          | -              |
| `rank()`         | 排名（秩）值        | `RANK()`       |
| `abs()`          | 绝对值           | `ABS()`        |
| `round()`        | 四舍五入值         | `ROUND()`      |
| `clip()`         | 截断（裁剪）值       | -              |
| `cumsum()`       | 累积和           | 窗口函数           |
| `cumprod()`      | 累积乘积          | 窗口函数           |
| `cummin()`       | 累积最小值         | 窗口函数           |
| `cummax()`       | 累积最大值         | 窗口函数           |
| `diff()`         | 差分            | 窗口函数           |
| `pct_change()`   | 百分比变化         | 窗口函数           |
| `skew()`         | 偏度            | `SKEW()`       |
| `kurt()`         | 峰度            | `KURT()`       |
| `sem()`          | 标准误差          | -              |
| `all()`          | 是否全部为 true    | -              |
| `any()`          | 是否存在为 true 的值 | -              |
| `idxmin()`       | 最小值的索引        | -              |
| `idxmax()`       | 最大值的索引        | -              |

**示例：**

```python
ds = pd.read_csv("data.csv")

# Basic statistics
print(ds['salary'].mean())
print(ds['age'].std())
print(ds.describe())

# Group statistics
print(ds.groupby('department')['salary'].mean())
print(ds.groupby('city').agg({'salary': ['mean', 'std'], 'age': 'count'}))
```

***


## 数据操作 \{#manipulation\}

| Method              | Description  |
| ------------------- | ------------ |
| `drop()`            | 删除行/列        |
| `drop_duplicates()` | 删除重复项        |
| `duplicated()`      | 标记重复项        |
| `dropna()`          | 删除缺失值        |
| `fillna()`          | 填充缺失值        |
| `ffill()`           | 前向填充         |
| `bfill()`           | 后向填充         |
| `interpolate()`     | 插值填充         |
| `replace()`         | 替换值          |
| `rename()`          | 重命名列/索引      |
| `rename_axis()`     | 重命名轴         |
| `assign()`          | 添加新列         |
| `astype()`          | 转换类型         |
| `convert_dtypes()`  | 推断类型         |
| `copy()`            | 复制 DataFrame |

**示例：**

```python
ds = pd.read_csv("data.csv")

# Drop operations
result = ds.drop(columns=['unused_col'])
result = ds.drop_duplicates(subset=['user_id'])
result = ds.dropna(subset=['email'])

# Fill operations
result = ds.fillna(0)
result = ds.fillna({'age': 0, 'name': 'Unknown'})

# Transform operations
result = ds.rename(columns={'old_name': 'new_name'})
result = ds.assign(
    full_name=lambda x: x['first_name'] + ' ' + x['last_name'],
    age_group=lambda x: pd.cut(x['age'], bins=[0, 25, 50, 100])
)
```

***


## 排序和排名 \{#sorting\}

| Method          | Description |
| --------------- | ----------- |
| `sort_values()` | 按值排序        |
| `sort_index()`  | 按索引排序       |
| `nlargest()`    | 最大的 N 个值    |
| `nsmallest()`   | 最小的 N 个值    |

**示例：**

```python
# Sort by single column
result = ds.sort_values('salary', ascending=False)

# Sort by multiple columns
result = ds.sort_values(['department', 'salary'], ascending=[True, False])

# Get top/bottom N
result = ds.nlargest(10, 'salary')
result = ds.nsmallest(5, 'age')
```

***


## 重塑（Reshaping） \{#reshaping\}

| Method              | Description |
| ------------------- | ----------- |
| `pivot()`           | 透视表         |
| `pivot_table()`     | 带聚合的透视表     |
| `melt()`            | 逆透视         |
| `stack()`           | 将列堆叠为索引     |
| `unstack()`         | 将索引展开为列     |
| `transpose()` / `T` | 转置          |
| `explode()`         | 将列表展开为行     |
| `squeeze()`         | 降维          |
| `droplevel()`       | 删除索引层级      |
| `swaplevel()`       | 交换索引层级      |
| `reorder_levels()`  | 重新排序索引层级    |

**示例：**

```python
# Pivot table
result = ds.pivot_table(
    values='amount',
    index='region',
    columns='product',
    aggfunc='sum'
)

# Melt (unpivot)
result = ds.melt(
    id_vars=['name'],
    value_vars=['score1', 'score2', 'score3'],
    var_name='test',
    value_name='score'
)

# Explode arrays
result = ds.explode('tags')
```

***


## 合并 / 连接 \{#combining\}

| Method            | Description |
| ----------------- | ----------- |
| `merge()`         | SQL 风格的合并   |
| `join()`          | 按索引连接       |
| `concat()`        | 拼接          |
| `append()`        | 追加行         |
| `combine()`       | 通过函数合并      |
| `combine_first()` | 按优先级合并      |
| `update()`        | 更新值         |
| `compare()`       | 显示差异        |

**示例：**

```python
# Merge (join)
result = pd.merge(df1, df2, on='id', how='left')
result = df1.join(df2, on='id')

# Concatenate
result = pd.concat([df1, df2, df3])
result = pd.concat([df1, df2], axis=1)
```

***


## 二元运算 \{#binary\}

| Method                       | Description       |
| ---------------------------- | ----------------- |
| `add()` / `radd()`           | 加法                |
| `sub()` / `rsub()`           | 减法                |
| `mul()` / `rmul()`           | 乘法                |
| `div()` / `rdiv()`           | 除法                |
| `truediv()` / `rtruediv()`   | 真除（true division） |
| `floordiv()` / `rfloordiv()` | 向下取整除             |
| `mod()` / `rmod()`           | 取模                |
| `pow()` / `rpow()`           | 幂运算               |
| `dot()`                      | 矩阵乘法              |

**示例：**

```python
# Arithmetic operations
result = ds['col1'].add(ds['col2'])
result = ds['price'].mul(ds['quantity'])

# With fill_value for missing data
result = ds['col1'].add(ds['col2'], fill_value=0)
```

***


## 比较操作 \{#comparison\}

| 方法 | 说明 |
|--------|-------------|
| `eq()` | 等于 |
| `ne()` | 不等于 |
| `lt()` | 小于 |
| `le()` | 小于或等于 |
| `gt()` | 大于 |
| `ge()` | 大于或等于 |
| `equals()` | 判断是否相等 |
| `compare()` | 显示差异 |

---

## 函数应用 \{#application\}

| Method                  | Description |
| ----------------------- | ----------- |
| `apply()`               | 应用函数        |
| `applymap()`            | 对元素逐个应用     |
| `map()`                 | 映射值         |
| `agg()` / `aggregate()` | 聚合          |
| `transform()`           | 转换          |
| `pipe()`                | 管道函数        |
| `groupby()`             | 分组          |

**示例：**

```python
# Apply function
result = ds['name'].apply(lambda x: x.upper())
result = ds.apply(lambda row: row['a'] + row['b'], axis=1)

# Aggregate
result = ds.agg({'col1': 'sum', 'col2': 'mean'})
result = ds.agg(['sum', 'mean', 'std'])

# Pipe
result = (ds
    .pipe(filter_active)
    .pipe(calculate_metrics)
    .pipe(format_output)
)
```

***


## 时间序列 \{#timeseries\}

| Method               | Description |
| -------------------- | ----------- |
| `rolling()`          | 滚动窗口        |
| `expanding()`        | 扩展窗口        |
| `ewm()`              | 指数加权        |
| `resample()`         | 重采样时间序列     |
| `shift()`            | 偏移数值        |
| `asfreq()`           | 转换频率        |
| `asof()`             | 截至时间点的最新值   |
| `at_time()`          | 按时间点选择      |
| `between_time()`     | 按时间范围选择     |
| `first()` / `last()` | 首/末几个周期     |
| `to_period()`        | 转换为周期       |
| `to_timestamp()`     | 转换为时间戳      |
| `tz_convert()`       | 转换时区        |
| `tz_localize()`      | 设置本地时区      |

**示例：**

```python
# Rolling window
result = ds['value'].rolling(window=7).mean()

# Expanding window
result = ds['value'].expanding().sum()

# Shift
result = ds['value'].shift(1)  # Lag
result = ds['value'].shift(-1)  # Lead
```

***


## 缺失数据 \{#missing\}

| 方法 | 描述 |
|--------|-------------|
| `isna()` / `isnull()` | 检测缺失值 |
| `notna()` / `notnull()` | 检测非缺失值 |
| `dropna()` | 删除缺失值 |
| `fillna()` | 填充缺失值 |
| `ffill()` | 向前填充 |
| `bfill()` | 向后填充 |
| `interpolate()` | 插值 |
| `replace()` | 替换值 |

---

## I/O 方法 \{#io\}

| 方法 | 说明 |
|--------|-------------|
| `to_csv()` | 导出为 CSV |
| `to_json()` | 导出为 JSON |
| `to_excel()` | 导出为 Excel |
| `to_parquet()` | 导出为 Parquet |
| `to_feather()` | 导出为 Feather |
| `to_sql()` | 导出到 SQL 数据库 |
| `to_pickle()` | 序列化为 Pickle |
| `to_html()` | 导出为 HTML 表格 |
| `to_latex()` | 导出为 LaTeX 表格 |
| `to_markdown()` | 导出为 Markdown 表格 |
| `to_string()` | 字符串表示 |
| `to_dict()` | 字典 |
| `to_records()` | 记录 |
| `to_numpy()` | NumPy 数组 |
| `to_clipboard()` | 复制到剪贴板 |

有关详细文档，请参阅 [I/O 操作](io.md)。

---

## 迭代 \{#iteration\}

| 方法 | 描述              |
|--------|--------------------------|
| `items()` | 按（列，Series）迭代 |
| `iterrows()` | 按（索引，Series）迭代  |
| `itertuples()` | 以命名元组迭代  |

---

## 与 Pandas 的主要区别 \{#differences\}

### 1. 返回类型 \{#return-types\}

```python
# Pandas returns Series
pdf['col']  # → pd.Series

# DataStore returns ColumnExpr (lazy)
ds['col']   # → ColumnExpr
```


### 2. 延迟执行 \{#lazy-execution\}

```python
# DataStore operations are lazy
result = ds.filter(ds['age'] > 25)  # Not executed yet
df = result.to_df()  # Executed here
```


### 3. 没有 `inplace` 参数 \{#no-inplace-parameter\}

```python
# Pandas
df.drop(columns=['col'], inplace=True)

# DataStore (always returns new object)
ds = ds.drop(columns=['col'])
```


### 4. 结果对比 \{#comparing-results\}

```python
# Use to_pandas() for comparison
pd.testing.assert_frame_equal(
    ds.to_pandas(),
    expected_df
)
```

完整说明请参阅[关键差异](../guides/pandas-differences.md)。

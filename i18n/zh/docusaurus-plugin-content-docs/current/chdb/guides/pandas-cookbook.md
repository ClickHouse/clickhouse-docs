---
title: 'Pandas 实用手册'
sidebar_label: 'Pandas 实用手册'
slug: /chdb/guides/pandas-cookbook
description: '常见 pandas 模式及其在 DataStore 中的等价实现'
keywords: ['chdb', 'datastore', 'pandas', 'cookbook', 'patterns', 'examples']
doc_type: 'guide'
---

# Pandas 实用手册 \{#pandas-cookbook\}

常见的 pandas 用法模式及其在 DataStore 中的对应实现。大多数代码无需改动即可直接运行！

## 数据加载 \{#loading\}

### 读取 CSV 文件 \{#read-csv\}

```python
# Pandas
import pandas as pd
df = pd.read_csv("data.csv")

# DataStore - same!
from chdb import datastore as pd
df = pd.read_csv("data.csv")
```


### 读取多个文件 \{#read-multiple-files\}

```python
# Pandas
import glob
dfs = [pd.read_csv(f) for f in glob.glob("data/*.csv")]
df = pd.concat(dfs)

# DataStore - more efficient with glob pattern
df = pd.read_csv("data/*.csv")
```

***


## 筛选 \{#filtering\}

### 单个条件 \{#single-condition\}

```python
# Pandas and DataStore - identical
df[df['age'] > 25]
df[df['city'] == 'NYC']
df[df['name'].str.contains('John')]
```


### 多个条件 \{#multiple-conditions\}

```python
# AND
df[(df['age'] > 25) & (df['city'] == 'NYC')]

# OR
df[(df['age'] < 18) | (df['age'] > 65)]

# NOT
df[~(df['status'] == 'inactive')]
```


### 使用 query() 方法 \{#using-query\}

```python
# Pandas and DataStore - identical
df.query('age > 25 and city == "NYC"')
df.query('salary > 50000')
```


### isin() \{#isin\}

```python
# Pandas and DataStore - identical
df[df['city'].isin(['NYC', 'LA', 'SF'])]
```


### between() 方法 \{#between\}

```python
# Pandas and DataStore - identical
df[df['age'].between(18, 65)]
```

***


## 选择列 \{#selecting\}

### 单列 \{#single-column-select\}

```python
# Pandas and DataStore - identical
df['name']
df.name  # attribute access
```


### 多列 \{#multiple-columns-select\}

```python
# Pandas and DataStore - identical
df[['name', 'age', 'city']]
```


### 选择与过滤 \{#select-and-filter\}

```python
# Pandas and DataStore - identical
df[df['age'] > 25][['name', 'salary']]

# DataStore also supports SQL-style
df.filter(df['age'] > 25).select('name', 'salary')
```

***


## 排序 \{#sorting\}

### 单列 \{#single-column-sort\}

```python
# Pandas and DataStore - identical
df.sort_values('salary')
df.sort_values('salary', ascending=False)
```


### 多列 \{#multiple-columns-sort\}

```python
# Pandas and DataStore - identical
df.sort_values(['city', 'salary'], ascending=[True, False])
```


### 获取前/后 N 个 \{#get-top-bottom-n\}

```python
# Pandas and DataStore - identical
df.nlargest(10, 'salary')
df.nsmallest(5, 'age')
```

***


## GroupBy 和聚合 \{#groupby\}

### 简单的 GroupBy \{#simple-groupby\}

```python
# Pandas and DataStore - identical
df.groupby('city')['salary'].mean()
df.groupby('city')['salary'].sum()
df.groupby('city').size()  # count
```


### 多种聚合 \{#multiple-aggregations\}

```python
# Pandas and DataStore - identical
df.groupby('city')['salary'].agg(['sum', 'mean', 'count'])

df.groupby('city').agg({
    'salary': ['sum', 'mean'],
    'age': ['min', 'max']
})
```


### 命名聚合 \{#named-aggregations\}

```python
# Pandas and DataStore - identical
df.groupby('city').agg(
    total_salary=('salary', 'sum'),
    avg_salary=('salary', 'mean'),
    employee_count=('id', 'count')
)
```


### 多个分组键 \{#multiple-groupby-keys\}

```python
# Pandas and DataStore - identical
df.groupby(['city', 'department'])['salary'].mean()
```

***


## 数据连接 \{#joining\}

### 内连接 \{#inner-join\}

```python
# Pandas
pd.merge(df1, df2, on='id')

# DataStore - same API
pd.merge(df1, df2, on='id')

# DataStore also supports
df1.join(df2, on='id')
```


### 左连接 \{#left-join\}

```python
# Pandas and DataStore - identical
pd.merge(df1, df2, on='id', how='left')
```


### 按不同列进行连接 \{#join-on-different-columns\}

```python
# Pandas and DataStore - identical
pd.merge(df1, df2, left_on='emp_id', right_on='id')
```


### 连接 \{#concat\}

```python
# Pandas and DataStore - identical
pd.concat([df1, df2, df3])
pd.concat([df1, df2], axis=1)
```

***


## 字符串操作 \{#string\}

### 大小写转换 \{#case-conversion\}

```python
# Pandas and DataStore - identical
df['name'].str.upper()
df['name'].str.lower()
df['name'].str.title()
```


### 子字符串 \{#substring\}

```python
# Pandas and DataStore - identical
df['name'].str[:3]        # First 3 characters
df['name'].str.slice(0, 3)
```


### 查找 \{#search\}

```python
# Pandas and DataStore - identical
df['name'].str.contains('John')
df['name'].str.startswith('A')
df['name'].str.endswith('son')
```


### 替换 \{#replace\}

```python
# Pandas and DataStore - identical
df['text'].str.replace('old', 'new')
df['text'].str.replace(r'\d+', '', regex=True)  # Remove digits
```


### 分割 \{#split\}

```python
# Pandas and DataStore - identical
df['name'].str.split(' ')
df['name'].str.split(' ', expand=True)
```


### 长度 \{#length\}

```python
# Pandas and DataStore - identical
df['name'].str.len()
```

***


## 日期时间操作 \{#datetime\}

### 提取各个组件 \{#extract-components\}

```python
# Pandas and DataStore - identical
df['date'].dt.year
df['date'].dt.month
df['date'].dt.day
df['date'].dt.dayofweek
df['date'].dt.hour
```


### 格式设置 \{#formatting\}

```python
# Pandas and DataStore - identical
df['date'].dt.strftime('%Y-%m-%d')
```

***


## 缺失数据 \{#missing\}

### 检查缺失值 \{#check-missing\}

```python
# Pandas and DataStore - identical
df['col'].isna()
df['col'].notna()
df.isna().sum()
```


### 丢弃缺失值 \{#drop-missing\}

```python
# Pandas and DataStore - identical
df.dropna()
df.dropna(subset=['col1', 'col2'])
```


### 填充缺失值 \{#fill-missing\}

```python
# Pandas and DataStore - identical
df.fillna(0)
df.fillna({'col1': 0, 'col2': 'Unknown'})
df.fillna(method='ffill')
```

***


## 创建新列 \{#new-columns\}

### 简单赋值操作 \{#simple-assignment\}

```python
# Pandas and DataStore - identical
df['total'] = df['price'] * df['quantity']
df['age_group'] = df['age'] // 10 * 10
```


### 使用 assign() 方法 \{#using-assign\}

```python
# Pandas and DataStore - identical
df = df.assign(
    total=df['price'] * df['quantity'],
    is_adult=df['age'] >= 18
)
```


### 条件筛选（where/mask） \{#conditional-where-mask\}

```python
# Pandas and DataStore - identical
df['status'] = df['age'].where(df['age'] >= 18, 'minor')
```


### 使用 apply() 编写自定义逻辑 \{#apply-for-custom-logic\}

```python
# Works, but triggers pandas execution
df['category'] = df['amount'].apply(lambda x: 'high' if x > 1000 else 'low')

# DataStore alternative (stays lazy)
df['category'] = (
    df.when(df['amount'] > 1000, 'high')
      .otherwise('low')
)
```

***


## 数据重塑 \{#reshaping\}

### 数据透视表 \{#pivot-table\}

```python
# Pandas and DataStore - identical
df.pivot_table(
    values='amount',
    index='region',
    columns='product',
    aggfunc='sum'
)
```


### Melt（逆透视） \{#melt-unpivot\}

```python
# Pandas and DataStore - identical
df.melt(
    id_vars=['name'],
    value_vars=['score1', 'score2', 'score3'],
    var_name='test',
    value_name='score'
)
```


### Explode（展开） \{#explode\}

```python
# Pandas and DataStore - identical
df.explode('tags')  # Expand array column
```

***


## 窗口函数 \{#window\}

### 滚动窗口 \{#rolling\}

```python
# Pandas and DataStore - identical
df['rolling_avg'] = df['price'].rolling(window=7).mean()
df['rolling_sum'] = df['amount'].rolling(window=30).sum()
```


### 扩张窗口 \{#expanding\}

```python
# Pandas and DataStore - identical
df['cumsum'] = df['amount'].expanding().sum()
df['cummax'] = df['amount'].expanding().max()
```


### Shift（位移） \{#shift\}

```python
# Pandas and DataStore - identical
df['prev_value'] = df['value'].shift(1)   # Lag
df['next_value'] = df['value'].shift(-1)  # Lead
```


### 差分 \{#diff\}

```python
# Pandas and DataStore - identical
df['change'] = df['value'].diff()
df['pct_change'] = df['value'].pct_change()
```

***


## 输出 \{#output\}

### 输出为 CSV \{#to-csv\}

```python
# Pandas and DataStore - identical
df.to_csv("output.csv", index=False)
```


### 输出为 Parquet \{#to-parquet\}

```python
# Pandas and DataStore - identical
df.to_parquet("output.parquet")
```


### 转换为 pandas DataFrame \{#to-pandas-dataframe\}

```python
# DataStore specific
pandas_df = ds.to_df()
pandas_df = ds.to_pandas()
```

***


## DataStore 附加功能 \{#extras\}

### 查看 SQL 语句 \{#view-sql\}

```python
# DataStore only
print(ds.to_sql())
```


### 执行计划解析 \{#explain-plan\}

```python
# DataStore only
ds.explain()
```


### ClickHouse 函数 \{#clickhouse-functions\}

```python
# DataStore only - extra accessors
df['domain'] = df['url'].url.domain()
df['json_value'] = df['data'].json.get_string('key')
df['ip_valid'] = df['ip'].ip.is_ipv4_string()
```


### 通用 URI \{#universal-uri\}

```python
# DataStore only - read from anywhere
ds = DataStore.uri("s3://bucket/data.parquet")
ds = DataStore.uri("mysql://user:pass@host/db/table")
```

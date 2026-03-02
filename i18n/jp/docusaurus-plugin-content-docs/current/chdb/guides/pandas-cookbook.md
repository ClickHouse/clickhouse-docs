---
title: 'Pandas クックブック'
sidebar_label: 'Pandas クックブック'
slug: /chdb/guides/pandas-cookbook
description: '一般的な pandas のパターンと、それに対応する DataStore での同等表現'
keywords: ['chdb', 'datastore', 'pandas', 'cookbook', 'patterns', 'examples']
doc_type: 'guide'
---

# Pandas クックブック \{#pandas-cookbook\}

一般的な pandas のパターンと、それに対応する DataStore での書き方をまとめています。多くのコードはそのまま動作します。

## データの読み込み \{#loading\}

### CSV の読み込み \{#read-csv\}

```python
# Pandas
import pandas as pd
df = pd.read_csv("data.csv")

# DataStore - same!
from chdb import datastore as pd
df = pd.read_csv("data.csv")
```


### 複数ファイルを読み込む \{#read-multiple-files\}

```python
# Pandas
import glob
dfs = [pd.read_csv(f) for f in glob.glob("data/*.csv")]
df = pd.concat(dfs)

# DataStore - more efficient with glob pattern
df = pd.read_csv("data/*.csv")
```

***


## フィルタリング \{#filtering\}

### 単一条件 \{#single-condition\}

```python
# Pandas and DataStore - identical
df[df['age'] > 25]
df[df['city'] == 'NYC']
df[df['name'].str.contains('John')]
```


### 複数条件 \{#multiple-conditions\}

```python
# AND
df[(df['age'] > 25) & (df['city'] == 'NYC')]

# OR
df[(df['age'] < 18) | (df['age'] > 65)]

# NOT
df[~(df['status'] == 'inactive')]
```


### query() の利用 \{#using-query\}

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


### between() \{#between\}

```python
# Pandas and DataStore - identical
df[df['age'].between(18, 65)]
```

***


## カラムの選択 \{#selecting\}

### 単一のカラム \{#single-column-select\}

```python
# Pandas and DataStore - identical
df['name']
df.name  # attribute access
```


### 複数のカラム \{#multiple-columns-select\}

```python
# Pandas and DataStore - identical
df[['name', 'age', 'city']]
```


### 選択とフィルタリング \{#select-and-filter\}

```python
# Pandas and DataStore - identical
df[df['age'] > 25][['name', 'salary']]

# DataStore also supports SQL-style
df.filter(df['age'] > 25).select('name', 'salary')
```

***


## ソート \{#sorting\}

### 単一カラム \{#single-column-sort\}

```python
# Pandas and DataStore - identical
df.sort_values('salary')
df.sort_values('salary', ascending=False)
```


### 複数のカラム \{#multiple-columns-sort\}

```python
# Pandas and DataStore - identical
df.sort_values(['city', 'salary'], ascending=[True, False])
```


### 上位／下位 N 件を取得 \{#get-top-bottom-n\}

```python
# Pandas and DataStore - identical
df.nlargest(10, 'salary')
df.nsmallest(5, 'age')
```

***


## GroupBy と集約処理 \{#groupby\}

### 基本的な GroupBy \{#simple-groupby\}

```python
# Pandas and DataStore - identical
df.groupby('city')['salary'].mean()
df.groupby('city')['salary'].sum()
df.groupby('city').size()  # count
```


### 複数の集約 \{#multiple-aggregations\}

```python
# Pandas and DataStore - identical
df.groupby('city')['salary'].agg(['sum', 'mean', 'count'])

df.groupby('city').agg({
    'salary': ['sum', 'mean'],
    'age': ['min', 'max']
})
```


### 名前付き集約 \{#named-aggregations\}

```python
# Pandas and DataStore - identical
df.groupby('city').agg(
    total_salary=('salary', 'sum'),
    avg_salary=('salary', 'mean'),
    employee_count=('id', 'count')
)
```


### 複数の GroupBy キー \{#multiple-groupby-keys\}

```python
# Pandas and DataStore - identical
df.groupby(['city', 'department'])['salary'].mean()
```

***


## データの結合 \{#joining\}

### 内部結合 \{#inner-join\}

```python
# Pandas
pd.merge(df1, df2, on='id')

# DataStore - same API
pd.merge(df1, df2, on='id')

# DataStore also supports
df1.join(df2, on='id')
```


### 左外部結合 \{#left-join\}

```python
# Pandas and DataStore - identical
pd.merge(df1, df2, on='id', how='left')
```


### 異なるカラムを使った結合 \{#join-on-different-columns\}

```python
# Pandas and DataStore - identical
pd.merge(df1, df2, left_on='emp_id', right_on='id')
```


### 連結 \{#concat\}

```python
# Pandas and DataStore - identical
pd.concat([df1, df2, df3])
pd.concat([df1, df2], axis=1)
```

***


## 文字列操作 \{#string\}

### 大文字・小文字の変換 \{#case-conversion\}

```python
# Pandas and DataStore - identical
df['name'].str.upper()
df['name'].str.lower()
df['name'].str.title()
```


### 部分文字列 \{#substring\}

```python
# Pandas and DataStore - identical
df['name'].str[:3]        # First 3 characters
df['name'].str.slice(0, 3)
```


### 検索 \{#search\}

```python
# Pandas and DataStore - identical
df['name'].str.contains('John')
df['name'].str.startswith('A')
df['name'].str.endswith('son')
```


### 置換 \{#replace\}

```python
# Pandas and DataStore - identical
df['text'].str.replace('old', 'new')
df['text'].str.replace(r'\d+', '', regex=True)  # Remove digits
```


### 文字列の分割 \{#split\}

```python
# Pandas and DataStore - identical
df['name'].str.split(' ')
df['name'].str.split(' ', expand=True)
```


### 長さ \{#length\}

```python
# Pandas and DataStore - identical
df['name'].str.len()
```

***


## 日時の操作 \{#datetime\}

### 要素の抽出 \{#extract-components\}

```python
# Pandas and DataStore - identical
df['date'].dt.year
df['date'].dt.month
df['date'].dt.day
df['date'].dt.dayofweek
df['date'].dt.hour
```


### 書式設定 \{#formatting\}

```python
# Pandas and DataStore - identical
df['date'].dt.strftime('%Y-%m-%d')
```

***


## 欠損値 \{#missing\}

### 欠損値のチェック \{#check-missing\}

```python
# Pandas and DataStore - identical
df['col'].isna()
df['col'].notna()
df.isna().sum()
```


### 欠損値の削除 \{#drop-missing\}

```python
# Pandas and DataStore - identical
df.dropna()
df.dropna(subset=['col1', 'col2'])
```


### 欠損値の補完 \{#fill-missing\}

```python
# Pandas and DataStore - identical
df.fillna(0)
df.fillna({'col1': 0, 'col2': 'Unknown'})
df.fillna(method='ffill')
```

***


## 新しいカラムの作成 \{#new-columns\}

### シンプルな代入 \{#simple-assignment\}

```python
# Pandas and DataStore - identical
df['total'] = df['price'] * df['quantity']
df['age_group'] = df['age'] // 10 * 10
```


### assign() の利用 \{#using-assign\}

```python
# Pandas and DataStore - identical
df = df.assign(
    total=df['price'] * df['quantity'],
    is_adult=df['age'] >= 18
)
```


### 条件式（where/mask） \{#conditional-where-mask\}

```python
# Pandas and DataStore - identical
df['status'] = df['age'].where(df['age'] >= 18, 'minor')
```


### カスタムロジック用の apply() \{#apply-for-custom-logic\}

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


## 再構成 \{#reshaping\}

### ピボットテーブル \{#pivot-table\}

```python
# Pandas and DataStore - identical
df.pivot_table(
    values='amount',
    index='region',
    columns='product',
    aggfunc='sum'
)
```


### Melt（アンピボット） \{#melt-unpivot\}

```python
# Pandas and DataStore - identical
df.melt(
    id_vars=['name'],
    value_vars=['score1', 'score2', 'score3'],
    var_name='test',
    value_name='score'
)
```


### explode（配列の展開） \{#explode\}

```python
# Pandas and DataStore - identical
df.explode('tags')  # Expand array column
```

***


## ウィンドウ関数 \{#window\}

### ローリング \{#rolling\}

```python
# Pandas and DataStore - identical
df['rolling_avg'] = df['price'].rolling(window=7).mean()
df['rolling_sum'] = df['amount'].rolling(window=30).sum()
```


### 拡張ウィンドウ \{#expanding\}

```python
# Pandas and DataStore - identical
df['cumsum'] = df['amount'].expanding().sum()
df['cummax'] = df['amount'].expanding().max()
```


### Shift \{#shift\}

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


## 出力 \{#output\}

### CSV への書き出し \{#to-csv\}

```python
# Pandas and DataStore - identical
df.to_csv("output.csv", index=False)
```


### Parquet 形式への出力 \{#to-parquet\}

```python
# Pandas and DataStore - identical
df.to_parquet("output.parquet")
```


### pandas の DataFrame へ変換 \{#to-pandas-dataframe\}

```python
# DataStore specific
pandas_df = ds.to_df()
pandas_df = ds.to_pandas()
```

***


## DataStore 追加機能 \{#extras\}

### SQL の表示 \{#view-sql\}

```python
# DataStore only
print(ds.to_sql())
```


### 実行計画の説明 \{#explain-plan\}

```python
# DataStore only
ds.explain()
```


### ClickHouse 関数 \{#clickhouse-functions\}

```python
# DataStore only - extra accessors
df['domain'] = df['url'].url.domain()
df['json_value'] = df['data'].json.get_string('key')
df['ip_valid'] = df['ip'].ip.is_ipv4_string()
```


### 汎用 URI \{#universal-uri\}

```python
# DataStore only - read from anywhere
ds = DataStore.uri("s3://bucket/data.parquet")
ds = DataStore.uri("mysql://user:pass@host/db/table")
```

---
title: 'Pandas Cookbook'
sidebar_label: 'Pandas Cookbook'
slug: /chdb/guides/pandas-cookbook
description: '일반적인 pandas 패턴과 이에 해당하는 DataStore 표현'
keywords: ['chdb', 'datastore', 'pandas', 'cookbook', 'patterns', 'examples']
doc_type: 'guide'
---

# Pandas 활용 예제집 \{#pandas-cookbook\}

일반적인 pandas 패턴과 이에 상응하는 DataStore 연산을 정리합니다. 대부분의 코드는 수정 없이 그대로 동작합니다.

## 데이터 불러오기 \{#loading\}

### CSV 파일 읽기 \{#read-csv\}

```python
# Pandas
import pandas as pd
df = pd.read_csv("data.csv")

# DataStore - same!
from chdb import datastore as pd
df = pd.read_csv("data.csv")
```


### 여러 파일 읽기 \{#read-multiple-files\}

```python
# Pandas
import glob
dfs = [pd.read_csv(f) for f in glob.glob("data/*.csv")]
df = pd.concat(dfs)

# DataStore - more efficient with glob pattern
df = pd.read_csv("data/*.csv")
```

***


## 필터링 \{#filtering\}

### 단일 조건 \{#single-condition\}

```python
# Pandas and DataStore - identical
df[df['age'] > 25]
df[df['city'] == 'NYC']
df[df['name'].str.contains('John')]
```


### 다중 조건 \{#multiple-conditions\}

```python
# AND
df[(df['age'] > 25) & (df['city'] == 'NYC')]

# OR
df[(df['age'] < 18) | (df['age'] > 65)]

# NOT
df[~(df['status'] == 'inactive')]
```


### query() 함수 사용하기 \{#using-query\}

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


## 컬럼 선택 \{#selecting\}

### 단일 컬럼 \{#single-column-select\}

```python
# Pandas and DataStore - identical
df['name']
df.name  # attribute access
```


### 여러 개의 컬럼 \{#multiple-columns-select\}

```python
# Pandas and DataStore - identical
df[['name', 'age', 'city']]
```


### 선택 및 필터링 \{#select-and-filter\}

```python
# Pandas and DataStore - identical
df[df['age'] > 25][['name', 'salary']]

# DataStore also supports SQL-style
df.filter(df['age'] > 25).select('name', 'salary')
```

***


## 정렬 \{#sorting\}

### 단일 컬럼 \{#single-column-sort\}

```python
# Pandas and DataStore - identical
df.sort_values('salary')
df.sort_values('salary', ascending=False)
```


### 여러 컬럼 \{#multiple-columns-sort\}

```python
# Pandas and DataStore - identical
df.sort_values(['city', 'salary'], ascending=[True, False])
```


### 상위/하위 N 구하기 \{#get-top-bottom-n\}

```python
# Pandas and DataStore - identical
df.nlargest(10, 'salary')
df.nsmallest(5, 'age')
```

***


## GroupBy와 집계 \{#groupby\}

### 간단한 GroupBy \{#simple-groupby\}

```python
# Pandas and DataStore - identical
df.groupby('city')['salary'].mean()
df.groupby('city')['salary'].sum()
df.groupby('city').size()  # count
```


### 여러 집계 \{#multiple-aggregations\}

```python
# Pandas and DataStore - identical
df.groupby('city')['salary'].agg(['sum', 'mean', 'count'])

df.groupby('city').agg({
    'salary': ['sum', 'mean'],
    'age': ['min', 'max']
})
```


### 이름이 지정된 집계 \{#named-aggregations\}

```python
# Pandas and DataStore - identical
df.groupby('city').agg(
    total_salary=('salary', 'sum'),
    avg_salary=('salary', 'mean'),
    employee_count=('id', 'count')
)
```


### 여러 개의 GroupBy 키 \{#multiple-groupby-keys\}

```python
# Pandas and DataStore - identical
df.groupby(['city', 'department'])['salary'].mean()
```

***


## 데이터 조인 \{#joining\}

### 내부 조인(Inner Join) \{#inner-join\}

```python
# Pandas
pd.merge(df1, df2, on='id')

# DataStore - same API
pd.merge(df1, df2, on='id')

# DataStore also supports
df1.join(df2, on='id')
```


### 왼쪽 조인(Left Join) \{#left-join\}

```python
# Pandas and DataStore - identical
pd.merge(df1, df2, on='id', how='left')
```


### 서로 다른 컬럼으로 조인하기 \{#join-on-different-columns\}

```python
# Pandas and DataStore - identical
pd.merge(df1, df2, left_on='emp_id', right_on='id')
```


### 문자열 연결(Concat) \{#concat\}

```python
# Pandas and DataStore - identical
pd.concat([df1, df2, df3])
pd.concat([df1, df2], axis=1)
```

***


## 문자열 처리 \{#string\}

### 대소문자 변환 \{#case-conversion\}

```python
# Pandas and DataStore - identical
df['name'].str.upper()
df['name'].str.lower()
df['name'].str.title()
```


### 부분 문자열 \{#substring\}

```python
# Pandas and DataStore - identical
df['name'].str[:3]        # First 3 characters
df['name'].str.slice(0, 3)
```


### 검색 \{#search\}

```python
# Pandas and DataStore - identical
df['name'].str.contains('John')
df['name'].str.startswith('A')
df['name'].str.endswith('son')
```


### 치환 \{#replace\}

```python
# Pandas and DataStore - identical
df['text'].str.replace('old', 'new')
df['text'].str.replace(r'\d+', '', regex=True)  # Remove digits
```


### 분리 \{#split\}

```python
# Pandas and DataStore - identical
df['name'].str.split(' ')
df['name'].str.split(' ', expand=True)
```


### 길이 \{#length\}

```python
# Pandas and DataStore - identical
df['name'].str.len()
```

***


## DateTime 연산 \{#datetime\}

### 구성 요소 추출 \{#extract-components\}

```python
# Pandas and DataStore - identical
df['date'].dt.year
df['date'].dt.month
df['date'].dt.day
df['date'].dt.dayofweek
df['date'].dt.hour
```


### 서식 지정 \{#formatting\}

```python
# Pandas and DataStore - identical
df['date'].dt.strftime('%Y-%m-%d')
```

***


## 누락된 데이터 \{#missing\}

### 결측값 확인 \{#check-missing\}

```python
# Pandas and DataStore - identical
df['col'].isna()
df['col'].notna()
df.isna().sum()
```


### 결측값 삭제 \{#drop-missing\}

```python
# Pandas and DataStore - identical
df.dropna()
df.dropna(subset=['col1', 'col2'])
```


### 결측값 채우기 \{#fill-missing\}

```python
# Pandas and DataStore - identical
df.fillna(0)
df.fillna({'col1': 0, 'col2': 'Unknown'})
df.fillna(method='ffill')
```

***


## 새 컬럼 생성 \{#new-columns\}

### 간단한 할당 \{#simple-assignment\}

```python
# Pandas and DataStore - identical
df['total'] = df['price'] * df['quantity']
df['age_group'] = df['age'] // 10 * 10
```


### assign() 함수 사용하기 \{#using-assign\}

```python
# Pandas and DataStore - identical
df = df.assign(
    total=df['price'] * df['quantity'],
    is_adult=df['age'] >= 18
)
```


### 조건부 처리 (where/mask) \{#conditional-where-mask\}

```python
# Pandas and DataStore - identical
df['status'] = df['age'].where(df['age'] >= 18, 'minor')
```


### apply()를 활용한 사용자 정의 로직 \{#apply-for-custom-logic\}

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


## 재구조화 \{#reshaping\}

### 피벗 테이블 \{#pivot-table\}

```python
# Pandas and DataStore - identical
df.pivot_table(
    values='amount',
    index='region',
    columns='product',
    aggfunc='sum'
)
```


### Melt (언피벗) \{#melt-unpivot\}

```python
# Pandas and DataStore - identical
df.melt(
    id_vars=['name'],
    value_vars=['score1', 'score2', 'score3'],
    var_name='test',
    value_name='score'
)
```


### explode 함수 \{#explode\}

```python
# Pandas and DataStore - identical
df.explode('tags')  # Expand array column
```

***


## 윈도우 함수 \{#window\}

### 롤링 윈도우 \{#rolling\}

```python
# Pandas and DataStore - identical
df['rolling_avg'] = df['price'].rolling(window=7).mean()
df['rolling_sum'] = df['amount'].rolling(window=30).sum()
```


### Expanding 윈도우 \{#expanding\}

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


### Diff(차이) \{#diff\}

```python
# Pandas and DataStore - identical
df['change'] = df['value'].diff()
df['pct_change'] = df['value'].pct_change()
```

***


## 출력 \{#output\}

### CSV로 내보내기 \{#to-csv\}

```python
# Pandas and DataStore - identical
df.to_csv("output.csv", index=False)
```


### Parquet으로 출력 \{#to-parquet\}

```python
# Pandas and DataStore - identical
df.to_parquet("output.parquet")
```


### pandas DataFrame으로 변환 \{#to-pandas-dataframe\}

```python
# DataStore specific
pandas_df = ds.to_df()
pandas_df = ds.to_pandas()
```

***


## DataStore 추가 기능 \{#extras\}

### VIEW SQL \{#view-sql\}

```python
# DataStore only
print(ds.to_sql())
```


### 실행 계획 \{#explain-plan\}

```python
# DataStore only
ds.explain()
```


### ClickHouse 함수 \{#clickhouse-functions\}

```python
# DataStore only - extra accessors
df['domain'] = df['url'].url.domain()
df['json_value'] = df['data'].json.get_string('key')
df['ip_valid'] = df['ip'].ip.is_ipv4_string()
```


### 유니버설 URI \{#universal-uri\}

```python
# DataStore only - read from anywhere
ds = DataStore.uri("s3://bucket/data.parquet")
ds = DataStore.uri("mysql://user:pass@host/db/table")
```

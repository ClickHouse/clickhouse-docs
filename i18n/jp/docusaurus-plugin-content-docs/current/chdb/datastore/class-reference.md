---
title: 'DataStore クラスリファレンス'
sidebar_label: 'クラスリファレンス'
slug: /chdb/datastore/class-reference
description: 'DataStore、ColumnExpr、LazyGroupBy、LazySeries 各クラスの完全な API リファレンス'
keywords: ['chdb', 'datastore', 'class', 'reference', 'api', 'columnexpr', 'lazygroupby']
doc_type: 'reference'
---

# DataStore クラスリファレンス \{#datastore-class-reference\}

このリファレンスでは、DataStore API の中核となるクラスについて解説します。

## DataStore \{#datastore\}

データ操作を行うための、DataFrame に似た主要なクラスです。

```python
from chdb.datastore import DataStore
```


### コンストラクタ \{#datastore-constructor\}

```python
DataStore(data=None, columns=None, index=None, dtype=None, copy=None)
```

**パラメータ:**

| パラメータ     | 型                             | 説明            |
| --------- | ----------------------------- | ------------- |
| `data`    | dict/list/DataFrame/DataStore | 入力データ         |
| `columns` | list                          | カラム名          |
| `index`   | Index                         | 行の索引          |
| `dtype`   | dict                          | カラムのデータ型      |
| `copy`    | bool                          | データをコピーするかどうか |

**使用例:**

```python
# From dictionary
ds = DataStore({'a': [1, 2, 3], 'b': ['x', 'y', 'z']})

# From pandas DataFrame
import pandas as pd
ds = DataStore(pd.DataFrame({'a': [1, 2, 3]}))

# Empty DataStore
ds = DataStore()
```


### Properties \{#datastore-properties\}

| Property | Type | Description |
|----------|------|-------------|
| `columns` | Index | カラム名 |
| `dtypes` | Series | カラムのデータ型 |
| `shape` | tuple | (行数, カラム数) |
| `size` | int | 要素の総数 |
| `ndim` | int | 次元数 (2) |
| `empty` | bool | DataFrame が空かどうか |
| `values` | ndarray | 内部データ（NumPy 配列） |
| `index` | Index | 行インデックス |
| `T` | DataStore | 転置 |
| `axes` | list | 軸の一覧 |

### ファクトリーメソッド \{#datastore-factory\}

| Method | Description |
|--------|-------------|
| `uri(uri)` | URI からの汎用ファクトリーメソッド |
| `from_file(path, ...)` | ファイルから作成 |
| `from_df(df)` | pandas DataFrame から作成 |
| `from_s3(url, ...)` | S3 から作成 |
| `from_gcs(url, ...)` | Google Cloud Storage から作成 |
| `from_azure(url, ...)` | Azure Blob から作成 |
| `from_mysql(...)` | MySQL から作成 |
| `from_postgresql(...)` | PostgreSQL から作成 |
| `from_clickhouse(...)` | ClickHouse から作成 |
| `from_mongodb(...)` | MongoDB から作成 |
| `from_sqlite(...)` | SQLite から作成 |
| `from_iceberg(path)` | Iceberg テーブルから作成 |
| `from_delta(path)` | Delta Lake から作成 |
| `from_numbers(n)` | 連番データで作成 |
| `from_random(rows, cols)` | ランダムなデータで作成 |
| `run_sql(query)` | SQL クエリから作成 |

詳細は [ファクトリーメソッド](factory-methods.md) を参照してください。

### クエリメソッド \{#datastore-query\}

| Method | Returns | Description |
|--------|---------|-------------|
| `select(*cols)` | DataStore | カラムを選択 |
| `filter(condition)` | DataStore | 行を絞り込み |
| `where(condition)` | DataStore | `filter` のエイリアス |
| `sort(*cols, ascending=True)` | DataStore | 行をソート |
| `orderby(*cols)` | DataStore | `sort` のエイリアス |
| `limit(n)` | DataStore | 行数を制限 |
| `offset(n)` | DataStore | 行をスキップ |
| `distinct(subset=None)` | DataStore | 重複を削除 |
| `groupby(*cols)` | LazyGroupBy | 行をグループ化 |
| `having(condition)` | DataStore | グループを絞り込み |
| `join(right, ...)` | DataStore | DataStore を結合 |
| `union(other, all=False)` | DataStore | DataStore を結合（UNION） |
| `when(cond, val)` | CaseWhen | CASE WHEN |

詳細は [Query Building](query-building.md) を参照してください。

### Pandas 互換メソッド \{#datastore-pandas\}

全 209 個のメソッドの一覧は、[Pandas 互換性](pandas-compat.md) を参照してください。

**インデックス操作:**
`head()`, `tail()`, `sample()`, `loc`, `iloc`, `at`, `iat`, `query()`, `isin()`, `where()`, `mask()`, `get()`, `xs()`, `pop()`

**集約:**
`sum()`, `mean()`, `std()`, `var()`, `min()`, `max()`, `median()`, `count()`, `nunique()`, `quantile()`, `describe()`, `corr()`, `cov()`, `skew()`, `kurt()`

**データ操作:**
`drop()`, `drop_duplicates()`, `dropna()`, `fillna()`, `replace()`, `rename()`, `assign()`, `astype()`, `copy()`

**並べ替え:**
`sort_values()`, `sort_index()`, `nlargest()`, `nsmallest()`, `rank()`

**再構成:**
`pivot()`, `pivot_table()`, `melt()`, `stack()`, `unstack()`, `transpose()`, `explode()`, `squeeze()`

**結合:**
`merge()`, `join()`, `concat()`, `append()`, `combine()`, `update()`, `compare()`

**適用/変換:**
`apply()`, `applymap()`, `map()`, `agg()`, `transform()`, `pipe()`, `groupby()`

**時系列:**
`rolling()`, `expanding()`, `ewm()`, `shift()`, `diff()`, `pct_change()`, `resample()`

### I/O メソッド \{#datastore-io\}

| Method | Description |
|--------|-------------|
| `to_csv(path, ...)` | CSV にエクスポート |
| `to_parquet(path, ...)` | Parquet にエクスポート |
| `to_json(path, ...)` | JSON にエクスポート |
| `to_excel(path, ...)` | Excel にエクスポート |
| `to_df()` | pandas DataFrame に変換 |
| `to_pandas()` | `to_df` のエイリアス |
| `to_arrow()` | Arrow Table に変換 |
| `to_dict(orient)` | 辞書に変換 |
| `to_records()` | レコードに変換 |
| `to_numpy()` | NumPy 配列に変換 |
| `to_sql()` | SQL 文字列を生成 |
| `to_string()` | 文字列表現を生成 |
| `to_markdown()` | Markdown 形式のテーブルを生成 |
| `to_html()` | HTML 形式のテーブルを生成 |

詳細は [I/O Operations](io.md) を参照してください。

### デバッグメソッド \{#datastore-debug\}

| メソッド | 説明 |
|--------|-------------|
| `explain(verbose=False)` | 実行計画を表示します |
| `clear_cache()` | キャッシュされた結果をクリアします |

詳しくは [Debugging](../debugging/index.md) を参照してください。

### マジックメソッド \{#datastore-magic\}

| メソッド | 説明 |
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

遅延評価されるカラム式を表します。カラムにアクセスしたときに返されます。

```python
# ColumnExpr is returned automatically
col = ds['name']  # Returns ColumnExpr
```


### プロパティ \{#columnexpr-properties\}

| プロパティ | 型 | 説明 |
|----------|------|-------------|
| `name` | str | カラム名 |
| `dtype` | dtype | データ型 |

### アクセサ \{#columnexpr-accessors\}

| Accessor | 説明 | メソッド数 |
|----------|-------------|---------|
| `.str` | 文字列操作 | 56 メソッド |
| `.dt` | 日時操作 | 42+ メソッド |
| `.arr` | 配列操作 | 37 メソッド |
| `.json` | JSON 解析 | 13 メソッド |
| `.url` | URL 解析 | 15 メソッド |
| `.ip` | IP アドレス操作 | 9 メソッド |
| `.geo` | 地理/距離操作 | 14 メソッド |

詳細は [Accessors](accessors.md) を参照してください。

### 算術演算 \{#columnexpr-arithmetic\}

```python
ds['total'] = ds['price'] * ds['quantity']
ds['profit'] = ds['revenue'] - ds['cost']
ds['ratio'] = ds['a'] / ds['b']
ds['squared'] = ds['value'] ** 2
ds['remainder'] = ds['value'] % 10
```


### 比較演算 \{#columnexpr-comparison\}

```python
ds[ds['age'] > 25]           # Greater than
ds[ds['age'] >= 25]          # Greater or equal
ds[ds['age'] < 25]           # Less than
ds[ds['age'] <= 25]          # Less or equal
ds[ds['name'] == 'Alice']    # Equal
ds[ds['name'] != 'Bob']      # Not equal
```


### 論理演算 \{#columnexpr-logical\}

```python
ds[(ds['age'] > 25) & (ds['city'] == 'NYC')]    # AND
ds[(ds['age'] > 25) | (ds['city'] == 'NYC')]    # OR
ds[~(ds['status'] == 'inactive')]               # NOT
```


### メソッド \{#columnexpr-methods\}

| Method | Description |
|--------|-------------|
| `as_(alias)` | エイリアス名を設定 |
| `cast(dtype)` | 指定した型にキャスト |
| `astype(dtype)` | cast のエイリアス |
| `isnull()` | NULL かどうか |
| `notnull()` | NULL ではないかどうか |
| `isna()` | isnull のエイリアス |
| `notna()` | notnull のエイリアス |
| `isin(values)` | 値のリストに含まれるか |
| `between(low, high)` | 2 つの値の間かどうか |
| `fillna(value)` | NULL を指定値で埋める |
| `replace(to_replace, value)` | 値を置換 |
| `clip(lower, upper)` | 値を下限・上限でクリップ |
| `abs()` | 絶対値 |
| `round(decimals)` | 値を丸める |
| `floor()` | 小さい方の整数への切り捨て |
| `ceil()` | 大きい方の整数への切り上げ |
| `apply(func)` | 関数を適用 |
| `map(mapper)` | 値をマッピング |

### 集約メソッド \{#columnexpr-aggregation\}

| Method | 説明 |
|--------|-------------|
| `sum()` | 合計 |
| `mean()` | 平均 |
| `avg()` | mean の別名 |
| `min()` | 最小値 |
| `max()` | 最大値 |
| `count()` | null 以外の要素数 |
| `nunique()` | 一意な要素数 |
| `std()` | 標準偏差 |
| `var()` | 分散 |
| `median()` | 中央値 |
| `quantile(q)` | 分位数 |
| `first()` | 最初の値 |
| `last()` | 最後の値 |
| `any()` | どれか 1 つでも true |
| `all()` | すべてが true |

---

## LazyGroupBy \{#lazygroupby\}

集約処理を行うためのグループ化済み DataStore を表します。

```python
# LazyGroupBy is returned automatically
grouped = ds.groupby('category')  # Returns LazyGroupBy
```


### メソッド \{#lazygroupby-methods\}

| メソッド | 戻り値 | 説明 |
|--------|---------|-------------|
| `agg(spec)` | DataStore | 集約 |
| `aggregate(spec)` | DataStore | `agg` のエイリアス |
| `sum()` | DataStore | グループごとの合計 |
| `mean()` | DataStore | グループごとの平均 |
| `count()` | DataStore | グループごとの件数 |
| `min()` | DataStore | グループごとの最小値 |
| `max()` | DataStore | グループごとの最大値 |
| `std()` | DataStore | グループごとの標準偏差 |
| `var()` | DataStore | グループごとの分散 |
| `median()` | DataStore | グループごとの中央値 |
| `nunique()` | DataStore | グループごとのユニークな値の数 |
| `first()` | DataStore | グループごとの先頭値 |
| `last()` | DataStore | グループごとの末尾値 |
| `nth(n)` | DataStore | グループごとの n 番目の値 |
| `head(n)` | DataStore | グループごとの先頭 n 件 |
| `tail(n)` | DataStore | グループごとの末尾 n 件 |
| `apply(func)` | DataStore | グループごとに関数を適用 |
| `transform(func)` | DataStore | グループごとに変換 |
| `filter(func)` | DataStore | グループをフィルタリング |

### カラムの選択 \{#lazygroupby-columns\}

```python
# Select column after groupby
grouped['amount'].sum()     # Returns DataStore
grouped[['a', 'b']].sum()   # Returns DataStore
```


### 集約の仕様 \{#lazygroupby-agg\}

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

遅延評価される Series（単一カラム）を表します。

### プロパティ \{#lazyseries-properties\}

| プロパティ | 型 | 説明 |
|-----------|----|------|
| `name` | str | シリーズ名 |
| `dtype` | dtype | データ型 |

### メソッド \{#lazyseries-methods\}

ほとんどのメソッドを `ColumnExpr` から継承します。主なメソッドは次のとおりです。

| メソッド | 説明 |
|--------|-------------|
| `value_counts()` | 値の出現頻度 |
| `unique()` | 一意な値 |
| `nunique()` | 一意な値の数 |
| `mode()` | 最頻値 |
| `to_list()` | list への変換 |
| `to_numpy()` | NumPy 配列への変換 |
| `to_frame()` | DataStore への変換 |

---

## 関連クラス \{#related\}

### F（関数） \{#f-class\}

ClickHouse の関数用のネームスペース。

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

詳しくは [Aggregation](aggregation.md#f-namespace) を参照してください。


### フィールド \{#field-class\}

カラム名による参照。

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

CASE WHEN 式を構築するためのビルダー。

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

ウィンドウ関数におけるウィンドウの指定。

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

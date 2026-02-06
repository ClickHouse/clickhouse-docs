---
title: 'pandas との主な違い'
sidebar_label: '主な違い'
slug: /chdb/guides/pandas-differences
description: 'DataStore と pandas の主な相違点'
keywords: ['chdb', 'datastore', 'pandas', 'differences', 'behavior']
doc_type: 'guide'
---

# pandas との主な違い \{#key-differences-from-pandas\}

DataStore は pandas と非常に高い互換性がありますが、理解しておくべき重要な違いがいくつか存在します。

## 概要表 \{#summary\}

| 観点 | pandas | DataStore |
|--------|--------|-----------|
| **実行方式** | Eager（即時実行） | Lazy（遅延実行） |
| **戻り値の型** | DataFrame/Series | DataStore/ColumnExpr |
| **行の順序** | 保持される | 保持される（自動） |
| **inplace** | サポートあり | サポートなし |
| **索引** | フルサポート | 簡略化 |
| **メモリ** | すべてのデータをメモリ上に保持 | データはソース側に保持 |
---

## 1. 遅延評価と即時評価 \{#lazy-execution\}

### pandas（即時評価） \{#pandas-eager\}

処理はその場で即時に実行されます:

```python
import pandas as pd

df = pd.read_csv("data.csv")  # Loads entire file NOW
result = df[df['age'] > 25]   # Filters NOW
grouped = result.groupby('city')['salary'].mean()  # Aggregates NOW
```


### DataStore（遅延評価） \{#datastore-lazy\}

処理は、結果が必要になるまで実行されません。

```python
from chdb import datastore as pd

ds = pd.read_csv("data.csv")  # Just records the source
result = ds[ds['age'] > 25]   # Just records the filter
grouped = result.groupby('city')['salary'].mean()  # Just records

# Execution happens here:
print(grouped)        # Executes when displaying
df = grouped.to_df()  # Or when converting to pandas
```


### なぜ重要なのか \{#why-lazy\}

遅延実行によって、次のことが可能になります：

- **クエリの最適化**: 複数の操作を1つのSQLクエリにコンパイルできる
- **カラムのプルーニング**: 必要なカラムだけを読み込む
- **フィルターのプッシュダウン**: フィルターをデータソース側で適用する
- **メモリ効率**: 不要なデータを読み込まない

---

## 2. 戻り値の型 \{#return-types\}

### pandas \{#pandas-return-types\}

```python
df['col']           # Returns pd.Series
df[['a', 'b']]      # Returns pd.DataFrame
df[df['x'] > 10]    # Returns pd.DataFrame
df.groupby('x')     # Returns DataFrameGroupBy
```


### DataStore \{#datastore-return-types\}

```python
ds['col']           # Returns ColumnExpr (lazy)
ds[['a', 'b']]      # Returns DataStore (lazy)
ds[ds['x'] > 10]    # Returns DataStore (lazy)
ds.groupby('x')     # Returns LazyGroupBy
```


### pandas 型への変換 \{#converting-to-pandas-types\}

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


## 3. 実行トリガー \{#triggers\}

DataStore は、実際の値が必要になったタイミングで評価されます:

| Trigger | Example | Notes |
|---------|---------|-------|
| `print()` / `repr()` | `print(ds)` | 表示のためにデータが必要 |
| `len()` | `len(ds)` | 行数が必要 |
| `.columns` | `ds.columns` | カラム名が必要 |
| `.dtypes` | `ds.dtypes` | 型情報が必要 |
| `.shape` | `ds.shape` | 次元情報が必要 |
| `.values` | `ds.values` | 実データが必要 |
| `.index` | `ds.index` | 索引が必要 |
| `to_df()` | `ds.to_df()` | 明示的な変換が必要 |
| Iteration | `for row in ds` | 反復処理が必要 |
| `equals()` | `ds.equals(other)` | 比較が必要 |

### 遅延評価のまま残る操作 \{#stay-lazy\}

| Operation | 戻り値 |
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

## 4. 行順序 \{#row-order\}

### pandas \{#pandas-row-order\}

行の順序は常に保持されます。

```python
df = pd.read_csv("data.csv")
print(df.head())  # Always same order as file
```


### DataStore \{#datastore-row-order\}

多くの操作において、行の順序は**自動的に保たれます**。

```python
ds = pd.read_csv("data.csv")
print(ds.head())  # Matches file order

# Filter preserves order
ds_filtered = ds[ds['age'] > 25]  # Same order as pandas
```

DataStore は内部で元の行の位置を自動的に追跡（`rowNumberInAllBlocks()` を使用）し、pandas と同じ順序が保たれるようにします。


### 順序が保持される場合 \{#order-preserved\}

- ファイルソース（CSV、Parquet、JSON など）
- pandas DataFrame のソース
- フィルター操作
- カラム選択
- 明示的に `sort()` または `sort_values()` を実行した後
- 順序を定義する操作（`nlargest()`、`nsmallest()`、`head()`、`tail()`）

### 順序が異なる場合 \{#order-may-differ\}

- `groupby()` 集計の後（`sort_values()` を使用して順序を一貫させる）
- 特定の結合タイプでの `merge()` / `join()` の後

---

## 5. inplace パラメーターは存在しない \{#no-inplace\}

### pandas \{#pandas-inplace\}

```python
df.drop(columns=['col'], inplace=True)  # Modifies df
df.fillna(0, inplace=True)              # Modifies df
df.rename(columns={'old': 'new'}, inplace=True)
```


### DataStore \{#datastore-inplace\}

`inplace=True` はサポートされていません。必ず結果を変数に代入してください:

```python
ds = ds.drop(columns=['col'])           # Returns new DataStore
ds = ds.fillna(0)                       # Returns new DataStore
ds = ds.rename(columns={'old': 'new'})  # Returns new DataStore
```


### なぜ in-place 操作がないのか？ \{#why-no-inplace\}

DataStore は次のことを可能にするために、イミュータブルな操作を採用しています：

- クエリ構築（遅延評価）
- スレッドセーフ
- デバッグの容易さ
- よりクリーンなコード

---

## 6. 索引のサポート \{#index\}

### pandas \{#pandas-index\}

索引を完全にサポート：

```python
df = df.set_index('id')
df.loc['user123']           # Label-based access
df.loc['a':'z']             # Label-based slicing
df.reset_index()
df.index.name = 'user_id'
```


### DataStore \{#datastore-index\}

簡易的な索引サポート:

```python
# Basic operations work
ds.loc[0:10]               # Integer position
ds.iloc[0:10]              # Same as loc for DataStore

# For pandas-style index operations, convert first
df = ds.to_df()
df = df.set_index('id')
df.loc['user123']
```


### DataStore のソースが重要 \{#datastore-source-matters\}

- **DataFrame ソース**: pandas の索引を保持します
- **ファイル ソース**: 単純な整数の索引を使用します

---

## 7. 比較時の挙動 \{#comparison\}

### pandas との比較 \{#comparing-with-pandas\}

pandas は DataStore オブジェクトを認識できません。

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


### equals() の利用 \{#using-equals\}

```python
# DataStore.equals() also works
dsf.equals(pdf)  # Compares with pandas DataFrame
```

***


## 8. 型推論 \{#types\}

### pandas \{#pandas-types\}

numpy/pandas の型を利用します。

```python
df['col'].dtype  # int64, float64, object, datetime64, etc.
```


### DataStore \{#datastore-types\}

ClickHouse のデータ型を使用できます：

```python
ds['col'].dtype  # Int64, Float64, String, DateTime, etc.

# Types are converted when going to pandas
df = ds.to_df()
df['col'].dtype  # Now pandas type
```


### 明示的キャスト \{#explicit-casting\}

```python
# Force specific type
ds['col'] = ds['col'].astype('int64')
```

***


## 9. メモリモデル \{#memory\}

### pandas \{#pandas-memory\}

すべてのデータはメモリ上に常駐します:

```python
df = pd.read_csv("huge.csv")  # 10GB in memory!
```


### DataStore \{#datastore-memory\}

データは、必要になるまで元のデータソース上にとどまります:

```python
ds = pd.read_csv("huge.csv")  # Just metadata
ds = ds.filter(ds['year'] == 2024)  # Still just metadata

# Only filtered result is loaded
df = ds.to_df()  # Maybe only 1GB now
```

***


## 10. エラーメッセージ \{#errors\}

### エラー発生元の種類 \{#different-error-sources\}

* **pandas errors**: pandas ライブラリに起因するエラー
* **DataStore errors**: chDB または ClickHouse に起因するエラー

```python
# May see ClickHouse-style errors
# "Code: 62. DB::Exception: Syntax error..."
```


### デバッグのヒント \{#debugging-tips\}

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


## マイグレーションチェックリスト \{#checklist\}

pandas から移行する際は次を確認・実施してください:

- [ ] import 文を変更する
- [ ] `inplace=True` パラメータを削除する
- [ ] pandas の DataFrame が必要な箇所に明示的に `to_df()` を追加する
- [ ] 行の順序が重要な場合はソートを追加する
- [ ] 比較テストには `to_pandas()` を使用する
- [ ] 代表的なデータ量でテストする

---

## クイックリファレンス \{#quick-ref\}

| pandas | DataStore |
|--------|-----------|
| `df[condition]` | 同様（DataStore を返す） |
| `df.groupby()` | 同様（LazyGroupBy を返す） |
| `df.drop(inplace=True)` | `ds = ds.drop()` |
| `df.equals(other)` | `ds.to_pandas().equals(other)` |
| `df.loc['label']` | `ds.to_df().loc['label']` |
| `print(df)` | 同様（実行をトリガーする） |
| `len(df)` | 同様（実行をトリガーする） |
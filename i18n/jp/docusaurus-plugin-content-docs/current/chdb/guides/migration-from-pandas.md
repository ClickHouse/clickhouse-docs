---
title: 'pandasからの移行'
sidebar_label: 'pandasからの移行'
slug: /chdb/guides/migration-from-pandas
description: 'pandasからDataStoreへ移行するためのステップバイステップのガイド'
keywords: ['chdb', 'datastore', 'pandas', 'migration', 'guide']
doc_type: 'guide'
---

# pandas からの移行 \{#migration-from-pandas\}

このガイドでは、既存の pandas コードを、互換性を保ちつつより高いパフォーマンスを得るために DataStore へ移行する方法を説明します。

## 1行だけの移行 \{#one-line\}

最も簡単な移行方法は、`import` 文を変更することです。

```python
# Before (pandas)
import pandas as pd

# After (DataStore)
from chdb import datastore as pd
```

これで完了です！ほとんどの pandas コードは変更なしで動作します。


## ステップバイステップ移行 \{#step-by-step\}

<VerticalStepper headerLevel="h3">

### chDB をインストールする \{#step-1\}

```bash
pip install "chdb>=4.0"
```

### インポートを変更する \{#step-2\}

```python
# これを:
import pandas as pd

# 次のように変更:
from chdb import datastore as pd
```

### コードをテストする \{#step-3\}

既存のコードをそのまま実行します。ほとんどの操作は変更なしで動作します:

```python
from chdb import datastore as pd

# これらはすべて同じように動作します
df = pd.read_csv("data.csv")
result = df[df['age'] > 25]
grouped = df.groupby('city')['salary'].mean()
df.to_csv("output.csv")
```

### 動作の違いに対応する \{#step-4\}

一部の操作は動作が異なります。下記の [主な違い](#differences) を参照してください。

</VerticalStepper>

---

## そのまま動作するもの \{#works-unchanged\}

### データの読み込み \{#loading-unchanged\}

```python
# All these work the same
df = pd.read_csv("data.csv")
df = pd.read_parquet("data.parquet")
df = pd.read_json("data.json")
df = pd.read_excel("data.xlsx")
```


### フィルタリング \{#filtering-unchanged\}

```python
# Boolean indexing
df[df['age'] > 25]
df[(df['age'] > 25) & (df['city'] == 'NYC')]

# query() method
df.query('age > 25 and salary > 50000')
```


### データ選択 \{#selection-unchanged\}

```python
# Column selection
df['name']
df[['name', 'age']]

# Row selection
df.head(10)
df.tail(10)
df.iloc[0:100]
```


### GroupBy と集約 \{#groupby-unchanged\}

```python
# GroupBy
df.groupby('city')['salary'].mean()
df.groupby(['city', 'dept']).agg({'salary': ['sum', 'mean']})
```


### ソート \{#sorting-unchanged\}

```python
df.sort_values('salary', ascending=False)
df.sort_values(['city', 'age'])
```


### 文字列操作 \{#string-unchanged\}

```python
df['name'].str.upper()
df['name'].str.contains('John')
df['name'].str.len()
```


### 日時演算 \{#datetime-unchanged\}

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


## 主な違い \{#differences\}

### 1. 遅延評価 \{#lazy\}

DataStore の操作は遅延評価され、結果が必要になるまで実行されません。

**pandas:**

```python
# Executes immediately
result = df[df['age'] > 25]
print(type(result))  # pandas.DataFrame
```

**データストア:**

```python
# Builds query, doesn't execute yet
result = ds[ds['age'] > 25]
print(type(result))  # DataStore (lazy)

# Executes when you need the data
print(result)        # Triggers execution
df = result.to_df()  # Triggers execution
```


### 2. 戻り値の型 \{#return-types\}

| 操作 | pandas の戻り値 | DataStore の戻り値 |
|-----------|---------------|-------------------|
| `df['col']` | Series | ColumnExpr (遅延評価) |
| `df[['a', 'b']]` | DataFrame | DataStore (遅延評価) |
| `df[condition]` | DataFrame | DataStore (遅延評価) |
| `df.groupby('x')` | GroupBy | LazyGroupBy |

### 3. inplace パラメータは非対応 \{#no-inplace\}

DataStore は `inplace=True` をサポートしていません。常に戻り値を利用してください:

**pandas:**

```python
df.drop(columns=['col'], inplace=True)
```

**DataStore（データストア）：**

```python
ds = ds.drop(columns=['col'])  # Assign the result
```


### 4. DataStore の比較 \{#comparing\}

pandas は DataStore オブジェクトを認識しないため、比較には `to_pandas()` を使用します：

```python
# This may not work as expected
df == ds  # pandas doesn't know DataStore

# Do this instead
df.equals(ds.to_pandas())
```


### 5. 行の順序 \{#row-order\}

DataStore は、ファイルソース（SQL データベースなど）から読み込んだデータの行の順序を保持しない場合があります。必要に応じて明示的にソートしてください。

```python
# pandas preserves order
df = pd.read_csv("data.csv")

# DataStore - use sort for guaranteed order
ds = pd.read_csv("data.csv")
ds = ds.sort('id')  # Explicit ordering
```

***


## 移行パターン \{#patterns\}

### パターン 1: 読み取り・分析・書き込み \{#pattern-1\}

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


### パターン 2: pandas の操作を含む DataFrame \{#pattern-2\}

pandas 固有の機能が必要な場合は、最後に pandas へ変換します:

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


### パターン 3: 混在型ワークフロー \{#pattern-3\}

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


## パフォーマンス比較 \{#performance\}

DataStore は大規模なデータセットでは大幅に高速です：

| Operation | pandas | DataStore | 高速化倍率 |
|-----------|--------|-----------|------------|
| GroupBy count | 347ms | 17ms | **19.93x** |
| 複雑なパイプライン | 2,047ms | 380ms | **5.39x** |
| Filter+Sort+Head | 1,537ms | 350ms | **4.40x** |
| GroupBy agg | 406ms | 141ms | **2.88x** |

*1,000万行でのベンチマーク*

---

## 移行時のトラブルシューティング \{#troubleshooting\}

### 問題: 操作が実行できない \{#issue-op\}

一部の pandas の操作はサポートされていない場合があります。次を確認してください:

1. その操作は[互換性リスト](../datastore/pandas-compat.md)に含まれていますか？
2. まず pandas に変換してから実行してみてください: `ds.to_df().operation()`

### 問題: 結果が一致しない \{#issue-results\}

何が起きているのかを把握するために、デバッグログを有効にします。

```python
from chdb.datastore.config import config
config.enable_debug()

# View the SQL being generated
ds.filter(ds['x'] > 10).explain()
```


### 問題: パフォーマンスが遅い \{#issue-slow\}

実行パターンを確認してください。

```python
# Bad: Multiple small executions
for i in range(1000):
    result = ds.filter(ds['id'] == i).to_df()

# Good: Single execution
result = ds.filter(ds['id'].isin(ids)).to_df()
```


### 問題: 型の不整合 \{#issue-types\}

DataStore が異なる型を推論してしまう場合があります:

```python
# Check types
print(ds.dtypes)

# Force conversion
ds['col'] = ds['col'].astype('int64')
```

***


## 段階的移行戦略 \{#gradual\}

### 第1週：互換性のテスト \{#week-1\}

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


### 2週目: 単純なスクリプトに切り替える \{#week-2\}

次のようなスクリプトから始めます:

- 大規模なファイルを読み取る
- フィルタリングと集約を行う
- カスタムの apply 関数を使用しない

### 3週目: 複雑なケースを扱う \{#week-3\}

カスタム関数を含むスクリプトの場合:

```python
from chdb import datastore as pd

# Let DataStore handle the heavy lifting
ds = pd.read_csv("data.csv")
ds = ds.filter(ds['year'] == 2024)  # SQL

# Convert for custom work
df = ds.to_df()
result = df.apply(my_custom_function)
```


### 4週目: 完全移行 \{#week-4\}

すべてのスクリプトで DataStore インポートを使用するよう切り替えます。

---

## よくある質問 \{#faq\}

### pandas と DataStore を両方併用できますか？ \{#faq-both\}

はい、できます。相互に自由に変換できます。

```python
from chdb import datastore as ds
import pandas as pd

# DataStore to pandas
df = ds_result.to_pandas()

# pandas to DataStore  
ds = ds.DataFrame(pd_result)
```


### テストは引き続き通りますか？ \{#faq-tests\}

ほとんどのテストは問題なく通ります。比較テストの場合は、pandas に変換してください。

```python
def test_my_function():
    result = my_function()
    expected = pd.DataFrame(...)
    pd.testing.assert_frame_equal(result.to_pandas(), expected)
```


### Jupyter で DataStore を使えますか？ \{#faq-jupyter\}

はい。Jupyter ノートブック上でも DataStore を利用できます。

```python
from chdb import datastore as pd

ds = pd.read_csv("data.csv")
ds.head()  # Displays nicely in Jupyter
```


### 問題はどのように報告すればよいですか？ \{#faq-issues\}

互換性の問題を見つけた場合は、こちらに報告してください：
https://github.com/chdb-io/chdb/issues
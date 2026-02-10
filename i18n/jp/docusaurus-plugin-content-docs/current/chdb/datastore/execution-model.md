---
title: 'DataStore の実行モデル'
sidebar_label: '実行モデル'
slug: /chdb/datastore/execution-model
description: 'DataStore における遅延評価、実行トリガー、キャッシュの仕組みを理解する'
keywords: ['chdb', 'datastore', 'lazy', 'evaluation', 'execution', 'caching']
doc_type: 'guide'
---

# DataStore の実行モデル \{#datastore-execution-model\}

DataStore の遅延評価モデルを理解することは、DataStore を効果的に利用し、パフォーマンスを最大化するための鍵となります。

## 遅延評価 \{#lazy-evaluation\}

DataStore は **遅延評価 (lazy evaluation)** を採用しており、操作は即座には実行されず、記録されたうえで最適化された SQL クエリへとコンパイルされます。実行は、結果が実際に必要になったタイミングでのみ行われます。

### 例：Lazy 評価と Eager 評価の比較 \{#lazy-vs-eager\}

```python
from chdb import datastore as pd

ds = pd.read_csv("sales.csv")

# These operations are NOT executed yet
result = (ds
    .filter(ds['amount'] > 1000)    # Recorded, not executed
    .select('region', 'amount')      # Recorded, not executed
    .groupby('region')               # Recorded, not executed
    .agg({'amount': 'sum'})          # Recorded, not executed
    .sort('sum', ascending=False)    # Recorded, not executed
)

# Still no execution - just building the query plan
print(result.to_sql())
# SELECT region, SUM(amount) AS sum
# FROM file('sales.csv', 'CSVWithNames')
# WHERE amount > 1000
# GROUP BY region
# ORDER BY sum DESC

# NOW execution happens
df = result.to_df()  # <-- Triggers execution
```


### 遅延評価の利点 \{#benefits\}

1. **クエリ最適化**: 複数の処理を単一の最適化された SQL クエリとしてコンパイルできる
2. **フィルタープッシュダウン**: フィルターはデータソース側で適用される
3. **カラムプルーニング**: 必要なカラムだけを読み込む
4. **決定の遅延**: 実行エンジンを実行時に選択できる
5. **プランの確認**: 実行前にクエリを確認・デバッグできる

---

## Execution Triggers \{#triggers\}

実際の値が必要になったタイミングで、自動的に実行が開始されます。

### 自動トリガー \{#automatic-triggers\}

| Trigger              | Example            | Description    |
| -------------------- | ------------------ | -------------- |
| `print()` / `repr()` | `print(ds)`        | 結果を表示          |
| `len()`              | `len(ds)`          | 行数を取得          |
| `.columns`           | `ds.columns`       | カラム名を取得        |
| `.dtypes`            | `ds.dtypes`        | カラム型を取得        |
| `.shape`             | `ds.shape`         | 次元数を取得         |
| `.index`             | `ds.index`         | 行インデックスを取得     |
| `.values`            | `ds.values`        | NumPy 配列を取得    |
| Iteration            | `for row in ds`    | 行を繰り返し処理       |
| `to_df()`            | `ds.to_df()`       | pandas に変換     |
| `to_pandas()`        | `ds.to_pandas()`   | `to_df` のエイリアス |
| `to_dict()`          | `ds.to_dict()`     | dict に変換       |
| `to_numpy()`         | `ds.to_numpy()`    | 配列に変換          |
| `.equals()`          | `ds.equals(other)` | DataStore を比較  |

**例:**

```python
# All these trigger execution
print(ds)              # Display
len(ds)                # 1000
ds.columns             # Index(['name', 'age', 'city'])
ds.shape               # (1000, 3)
list(ds)               # List of values
ds.to_df()             # pandas DataFrame
```


### 遅延評価のまま実行される操作 \{#stay-lazy\}

| Operation              | Returns     | Description    |
| ---------------------- | ----------- | -------------- |
| `filter()`             | DataStore   | WHERE 句を追加する   |
| `select()`             | DataStore   | カラム選択を追加する     |
| `sort()`               | DataStore   | ORDER BY を追加する |
| `groupby()`            | LazyGroupBy | GROUP BY を準備する |
| `join()`               | DataStore   | JOIN を追加する     |
| `ds['col']`            | ColumnExpr  | カラムを参照する       |
| `ds[['col1', 'col2']]` | DataStore   | カラム選択を行う       |

**例:**

```python
# These do NOT trigger execution - they stay lazy
result = ds.filter(ds['age'] > 25)      # Returns DataStore
result = ds.select('name', 'age')        # Returns DataStore
result = ds['name']                      # Returns ColumnExpr
result = ds.groupby('city')              # Returns LazyGroupBy
```

***


## 3フェーズ実行 \{#three-phase\}

DataStore の操作は、3フェーズの実行モデルに従います。

### フェーズ 1: SQL クエリ構築（遅延実行） \{#phase-1\}

SQL で表現可能な操作が蓄積されていきます。

```python
result = (ds
    .filter(ds['status'] == 'active')   # WHERE
    .select('user_id', 'amount')         # SELECT
    .groupby('user_id')                  # GROUP BY
    .agg({'amount': 'sum'})              # SUM()
    .sort('sum', ascending=False)        # ORDER BY
    .limit(10)                           # LIMIT
)
# All compiled into one SQL query
```


### フェーズ 2: 実行ポイント \{#phase-2\}

トリガーが発生すると、これまでに蓄えられていた SQL が実行されます。

```python
# Execution triggered here
df = result.to_df()  
# The single optimized SQL query runs now
```


### フェーズ 3: DataFrame の操作（該当する場合） \{#phase-3\}

実行後に pandas のみの処理を後続でチェーンする場合:

```python
# Mixed operations
result = (ds
    .filter(ds['amount'] > 100)          # Phase 1: SQL
    .to_df()                             # Phase 2: Execute
    .pivot_table(...)                    # Phase 3: pandas
)
```

***


## 実行プランの表示 \{#explain\}

実行内容を確認するには、`explain()` を使用します：

```python
ds = pd.read_csv("sales.csv")

query = (ds
    .filter(ds['amount'] > 1000)
    .groupby('region')
    .agg({'amount': ['sum', 'mean']})
)

# View execution plan
query.explain()
```

出力例:

```text
Pipeline:
  1. Source: file('sales.csv', 'CSVWithNames')
  2. Filter: amount > 1000
  3. GroupBy: region
  4. Aggregate: sum(amount), avg(amount)

Generated SQL:
SELECT region, SUM(amount) AS sum, AVG(amount) AS mean
FROM file('sales.csv', 'CSVWithNames')
WHERE amount > 1000
GROUP BY region
```

詳細を確認するには、`verbose=True` を指定します:

```python
query.explain(verbose=True)
```

詳細については、[Debugging: explain()](../debugging/explain.md) を参照してください。

***


## キャッシュ \{#caching\}

DataStore は同じクエリを繰り返し実行しないよう、実行結果をキャッシュします。

### キャッシュの仕組み \{#how-caching\}

```python
ds = pd.read_csv("data.csv")
result = ds.filter(ds['age'] > 25)

# First access - executes query
print(result.shape)  # Executes and caches

# Second access - uses cache
print(result.columns)  # Uses cached result

# Third access - uses cache
df = result.to_df()  # Uses cached result
```


### キャッシュの無効化 \{#cache-invalidation\}

DataStore に対して変更を行う操作が実行された場合、キャッシュは無効化されます。

```python
result = ds.filter(ds['age'] > 25)
print(result.shape)  # Executes, caches

# New operation invalidates cache
result2 = result.filter(result['city'] == 'NYC')
print(result2.shape)  # Re-executes (different query)
```


### キャッシュの手動制御 \{#cache-control\}

```python
# Clear cache
ds.clear_cache()

# Disable caching
from chdb.datastore.config import config
config.set_cache_enabled(False)
```

***


## SQL と Pandas 操作の併用 \{#mixing\}

DataStore は、SQL と Pandas を組み合わせた操作を賢く処理します。

### SQL互換の操作 \{#sql-ops\}

次の操作は SQL に変換されます:

- `filter()`, `where()`
- `select()`
- `groupby()`, `agg()`
- `sort()`, `orderby()`
- `limit()`, `offset()`
- `join()`, `union()`
- `distinct()`
- カラム演算（数値演算、比較、文字列メソッド）

### Pandas 専用の操作 \{#pandas-ops\}

これらの操作は実行をトリガーし、pandas で処理されます:

- カスタム関数を使った `apply()`
- 複雑な集計を行う `pivot_table()`
- `stack()`, `unstack()`
- 実行済みの DataFrame に対する操作

### ハイブリッド パイプライン \{#hybrid\}

```python
# SQL phase
result = (ds
    .filter(ds['amount'] > 100)      # SQL
    .groupby('category')              # SQL
    .agg({'amount': 'sum'})           # SQL
)

# Execution + pandas phase
result = (result
    .to_df()                          # Execute SQL
    .pivot_table(...)                 # pandas operation
)
```

***


## 実行エンジンの選択 \{#engine-selection\}

DataStore では、さまざまなエンジンを使用して処理を実行できます。

### 自動モード（デフォルト） \{#auto-mode\}

```python
from chdb.datastore.config import config

config.set_execution_engine('auto')  # Default
# Automatically selects best engine per operation
```


### chDB エンジンを強制的に使用する \{#chdb-engine\}

```python
config.set_execution_engine('chdb')
# All operations use ClickHouse SQL
```


### pandas エンジンの強制使用 \{#pandas-engine\}

```python
config.set_execution_engine('pandas')
# All operations use pandas
```

詳細については、[Configuration: Execution Engine](../configuration/execution-engine.md) を参照してください。

***


## パフォーマンスへの影響 \{#performance\}

### 良い例: 早期にフィルタリングする \{#filter-early\}

```python
# Good: Filter in SQL, then aggregate
result = (ds
    .filter(ds['date'] >= '2024-01-01')  # Reduces data early
    .groupby('category')
    .agg({'amount': 'sum'})
)
```


### 悪い例: フィルタを遅い段階で行う \{#filter-late\}

```python
# Bad: Aggregate all, then filter
result = (ds
    .groupby('category')
    .agg({'amount': 'sum'})
    .to_df()
    .query('sum > 1000')  # Pandas filter after aggregation
)
```


### 良い: 早期にカラムを絞り込む \{#select-early\}

```python
# Good: Select columns in SQL
result = (ds
    .select('user_id', 'amount', 'date')
    .filter(ds['date'] >= '2024-01-01')
    .groupby('user_id')
    .agg({'amount': 'sum'})
)
```


### 良いパターン: SQL に仕事をさせる \{#sql-work\}

```python
# Good: Complex aggregation in SQL
result = (ds
    .groupby('category')
    .agg({
        'amount': ['sum', 'mean', 'count'],
        'quantity': 'sum'
    })
    .sort('sum', ascending=False)
    .limit(10)
)
# One SQL query does everything

# Bad: Multiple separate queries
sums = ds.groupby('category')['amount'].sum().to_df()
means = ds.groupby('category')['amount'].mean().to_df()
# Two queries instead of one
```

***


## ベストプラクティスの概要 \{#best-practices\}

1. **実行前に処理をチェーンする** - 完全なクエリを組み立ててから、一度だけ実行をトリガーする
2. **早期にフィルタを適用する** - データ量はソース側で削減する
3. **必要なカラムだけを選択する** - カラムのプルーニングはパフォーマンスを向上させる
4. **`explain()` を使って実行内容を把握する** - 実行前にデバッグする
5. **集約処理は SQL に任せる** - ClickHouse はこの用途に最適化されている
6. **実行が発生するトリガーを把握しておく** - 意図しない早期実行を避ける
7. **キャッシュを賢く使う** - キャッシュがいつ無効化されるかを理解する
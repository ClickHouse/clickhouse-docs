---
title: 'パフォーマンスガイド'
sidebar_label: 'パフォーマンスガイド'
slug: /chdb/guides/pandas-performance
description: 'DataStore と pandas のパフォーマンス最適化のためのヒント'
keywords: ['chdb', 'datastore', 'pandas', 'performance', 'benchmark', 'optimization']
doc_type: 'guide'
---

# パフォーマンスガイド \{#performance-guide\}

DataStore は、多くの処理で pandas と比べて大幅なパフォーマンス向上を実現します。本ガイドでは、その理由とワークロードを最適化する方法について説明します。

## DataStore が高速な理由 \{#why-faster\}

### 1. SQL プッシュダウン \{#sql-pushdown\}

処理はデータソース側にプッシュダウンされます。

```python
# pandas: Loads ALL data, then filters in memory
df = pd.read_csv("huge.csv")       # Load 10GB
df = df[df['year'] == 2024]        # Filter in Python

# DataStore: Filter at source
ds = pd.read_csv("huge.csv")       # Just metadata
ds = ds[ds['year'] == 2024]        # Filter in SQL
df = ds.to_df()                    # Only load filtered data
```


### 2. カラムプルーニング \{#column-pruning\}

必要なカラムのみが読み込まれます。

```python
# DataStore: Only reads name, age columns
ds = pd.read_parquet("wide_table.parquet")
result = ds.select('name', 'age').to_df()

# vs pandas: Reads all 100 columns, then selects
```


### 3. 遅延評価 \{#lazy-evaluation\}

複数の処理が1つのクエリにまとめてコンパイルされます。

```python
# DataStore: One optimized SQL query
result = (ds
    .filter(ds['amount'] > 100)
    .groupby('region')
    .agg({'amount': 'sum'})
    .sort('sum', ascending=False)
    .head(10)
    .to_df()
)

# Becomes:
# SELECT region, SUM(amount) FROM data
# WHERE amount > 100
# GROUP BY region ORDER BY sum DESC LIMIT 10
```

***


## ベンチマーク：DataStore と pandas \{#benchmark\}

### テスト環境 \{#test-environment\}

- データ: 1,000万行
- ハードウェア: 一般的なノートPC
- ファイル形式: CSV

### 結果 \{#results\}

| 操作 | pandas (ms) | DataStore (ms) | 優位 |
|-----------|-------------|----------------|--------|
| GroupBy count | 347 | 17 | **DataStore（19.93倍）** |
| Combined ops | 1,535 | 234 | **DataStore（6.56倍）** |
| Complex pipeline | 2,047 | 380 | **DataStore（5.39倍）** |
| MultiFilter+Sort+Head | 1,963 | 366 | **DataStore（5.36倍）** |
| Filter+Sort+Head | 1,537 | 350 | **DataStore（4.40倍）** |
| Head/Limit | 166 | 45 | **DataStore（3.69倍）** |
| Ultra-complex (10+ ops) | 1,070 | 338 | **DataStore（3.17倍）** |
| GroupBy agg | 406 | 141 | **DataStore（2.88倍）** |
| Select+Filter+Sort | 1,217 | 443 | **DataStore（2.75倍）** |
| Filter+GroupBy+Sort | 466 | 184 | **DataStore（2.53倍）** |
| Filter+Select+Sort | 1,285 | 533 | **DataStore（2.41倍）** |
| Sort (single) | 1,742 | 1,197 | **DataStore（1.45倍）** |
| Filter (single) | 276 | 526 | 同程度 |
| Sort (multiple) | 947 | 1,477 | 同程度 |

### 重要なポイント \{#insights\}

1. **GroupBy 処理**: DataStore は最大 **19.93 倍高速**
2. **複雑なパイプライン**: DataStore は **5〜6 倍高速**（SQL pushdown の効果）
3. **単純なスライス処理**: 性能は同程度で、差はごくわずか
4. **最適なユースケース**: groupby/aggregation を含むマルチステップ処理
5. **ゼロコピー**: `to_df()` ではデータ変換のオーバーヘッドなし

---

## DataStore が有利になるケース \{#when-datastore-wins\}

### 高負荷な集約処理 \{#heavy-aggregations\}

```python
# DataStore excels: 19.93x faster
result = ds.groupby('category')['amount'].sum()
```


### 複雑なパイプライン \{#complex-pipelines\}

```python
# DataStore excels: 5-6x faster
result = (ds
    .filter(ds['date'] >= '2024-01-01')
    .filter(ds['amount'] > 100)
    .groupby('region')
    .agg({'amount': ['sum', 'mean', 'count']})
    .sort('sum', ascending=False)
    .head(20)
)
```


### 大容量ファイルの処理 \{#large-file-processing\}

```python
# DataStore: Only loads what you need
ds = pd.read_parquet("huge_file.parquet")
result = ds.filter(ds['id'] == 12345).to_df()  # Fast!
```


### 複数カラムに対する操作 \{#multiple-column-operations\}

```python
# DataStore: Combines into single SQL
ds['total'] = ds['price'] * ds['quantity']
ds['is_large'] = ds['total'] > 1000
ds = ds.filter(ds['is_large'])
```

***


## pandas が優位になりうる場合 \{#when-pandas-wins\}

ほとんどのシナリオにおいて、DataStore は pandas のパフォーマンスに匹敵するか、それを上回ります。ただし、次のような特定のケースでは pandas の方がわずかに高速な場合があります。

### 小規模データセット（1,000 行未満） \{#small-datasets\}

```python
# For very small datasets, overhead is minimal for both
# Performance difference is negligible
small_df = pd.DataFrame({'x': range(100)})
```


### 単純なスライス操作 \{#simple-slice-operations\}

```python
# Single slice operations without aggregation
df = df[df['x'] > 10]  # pandas slightly faster
ds = ds[ds['x'] > 10]  # DataStore comparable
```


### カスタム Python Lambda 関数 \{#custom-python-functions\}

```python
# pandas required for custom Python code
def complex_function(row):
    return custom_logic(row)

df['result'] = df.apply(complex_function, axis=1)
```

:::note Important
DataStore が「遅い」ように見えるケースでも、パフォーマンスは通常 **pandas と同等** であり、実用上の影響はほとんどありません。複雑な処理における DataStore の利点は、これらの例外的なケースを大きく上回ります。

実行をよりきめ細かく制御したい場合は、[Execution Engine Configuration](../configuration/execution-engine.md) を参照してください。
:::

***


## ゼロコピー DataFrame 統合 \{#zero-copy\}

DataStore は pandas の DataFrame を読み書きする際に **ゼロコピー** を利用します。これは次のことを意味します。

```python
# to_df() does NOT copy data - it's a zero-copy operation
result = ds.filter(ds['x'] > 10).to_df()  # No data conversion overhead

# Same for creating DataStore from DataFrame
ds = DataStore(existing_df)  # No data copy
```

**主なポイント:**

* `to_df()` は本質的にコストほぼゼロ ― シリアライズやメモリコピーは発生しない
* pandas の DataFrame から DataStore を作成する処理は即時に完了する
* DataStore と pandas のビュー間でメモリが共有される

***


## 最適化のポイント \{#tips\}

### 1. CSV ではなく Parquet を使用する \{#use-parquet\}

```python
# CSV: Slower, reads entire file
ds = pd.read_csv("data.csv")

# Parquet: Faster, columnar, compressed
ds = pd.read_parquet("data.parquet")

# Convert once, benefit forever
df = pd.read_csv("data.csv")
df.to_parquet("data.parquet")
```

**想定される改善効果**: 読み取りが 3～10 倍高速化


### 2. 早い段階でフィルタする \{#filter-early\}

```python
# Good: Filter first, then aggregate
result = (ds
    .filter(ds['date'] >= '2024-01-01')  # Reduce data early
    .groupby('category')['amount'].sum()
)

# Less optimal: Process all data
result = (ds
    .groupby('category')['amount'].sum()
    .filter(ds['sum'] > 1000)  # Filter too late
)
```


### 3. 必要なカラムのみを選択 \{#select-only-needed-columns\}

```python
# Good: Column pruning
result = ds.select('name', 'amount').filter(ds['amount'] > 100)

# Less optimal: All columns loaded
result = ds.filter(ds['amount'] > 100)  # Loads all columns
```


### 4. SQLの集約機能を活用する \{#leverage-sql-aggregations\}

```python
# GroupBy is where DataStore shines
# Up to 20x speedup!
result = ds.groupby('category').agg({
    'amount': ['sum', 'mean', 'count', 'max'],
    'quantity': 'sum'
})
```


### 5. クエリ全体の実行ではなく head() を使用する \{#use-head\}

```python
# Don't load entire result if you only need a sample
result = ds.filter(ds['type'] == 'A').head(100)  # LIMIT 100

# Avoid this for large results
# result = ds.filter(ds['type'] == 'A').to_df()  # Loads everything
```


### 6. バッチ処理 \{#batch-operations\}

```python
# Good: Single execution
result = ds.filter(ds['x'] > 10).filter(ds['y'] < 100).to_df()

# Bad: Multiple executions
result1 = ds.filter(ds['x'] > 10).to_df()  # Execute
result2 = result1[result1['y'] < 100]       # Execute again
```


### 7. explain() を使用して最適化する \{#use-explain\}

```python
# View the query plan before executing
query = ds.filter(...).groupby(...).agg(...)
query.explain()  # Check if operations are pushed down

# Then execute
result = query.to_df()
```

***


## ワークロードのプロファイリング \{#profiling\}

### プロファイリングを有効にする \{#enable-profiling\}

```python
from chdb.datastore.config import config, get_profiler

config.enable_profiling()

# Run your workload
result = your_pipeline()

# View report
profiler = get_profiler()
profiler.report()
```


### ボトルネックを特定する \{#identify-bottlenecks\}

```text
Performance Report
==================
Step                    Duration    % Total
----                    --------    -------
SQL execution           2.5s        62.5%     <- Bottleneck!
read_csv                1.2s        30.0%
Other                   0.3s        7.5%
```


### 手法の比較 \{#compare-approaches\}

```python
# Test approach 1
profiler.reset()
result1 = approach1()
time1 = profiler.get_steps()[-1]['duration_ms']

# Test approach 2
profiler.reset()
result2 = approach2()
time2 = profiler.get_steps()[-1]['duration_ms']

print(f"Approach 1: {time1:.0f}ms")
print(f"Approach 2: {time2:.0f}ms")
```

***


## ベストプラクティスの概要 \{#summary\}

| プラクティス | 効果 |
|----------|--------|
| Parquet ファイルを使用する | 読み取りが 3〜10 倍高速 |
| 早期にフィルタリングする | データ処理量を削減 |
| 必要なカラムのみを選択する | I/O とメモリを削減 |
| GROUP BY／集約関数を使用する | 最大 20 倍高速 |
| バッチ処理を行う | 同じ処理の繰り返し実行を回避 |
| 最適化前にプロファイリングを行う | 実際のボトルネックを特定 |
| explain() を使用する | クエリ最適化を検証 |
| サンプルには head() を使用する | テーブル全体スキャンを回避 |

---

## クイック判断ガイド \{#decision\}

| ワークロード | 推奨 |
|---------------|----------------|
| GroupBy/集約 | DataStore を使用 |
| 複雑なマルチステップパイプライン | DataStore を使用 |
| フィルターを伴う大きなファイル | DataStore を使用 |
| 単純なスライス操作 | どちらでも可（性能は同程度） |
| カスタム Python lambda 関数 | pandas を使用するか、後段で変換する |
| ごく小さいデータ (&lt;1,000 行) | どちらでも可（差はごくわずか） |

:::tip
最適なエンジンを自動選択するには、`config.set_execution_engine('auto')`（デフォルト）を使用します。
詳細は [Execution Engine Configuration](../configuration/execution-engine.md) を参照してください。
:::
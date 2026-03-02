---
title: 'DataStore のプロファイリング'
sidebar_label: 'プロファイリング'
slug: /chdb/debugging/profiling
description: '内蔵プロファイラで DataStore のパフォーマンスを測定する'
keywords: ['chdb', 'datastore', 'profiling', 'performance', 'timing', 'benchmark']
doc_type: 'guide'
---

# DataStore プロファイリング \{#datastore-profiling\}

DataStore プロファイラを使用すると、実行時間を測定し、パフォーマンス上のボトルネックを特定するのに役立ちます。

## クイックスタート \{#quick-start\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config, get_profiler

# Enable profiling
config.enable_profiling()

# Run your operations
ds = pd.read_csv("large_data.csv")
result = (ds
    .filter(ds['amount'] > 100)
    .groupby('category')
    .agg({'amount': 'sum'})
    .sort('sum', ascending=False)
    .head(10)
    .to_df()
)

# View report
profiler = get_profiler()
print(profiler.report())
```


## プロファイリングを有効化する \{#enabling\}

```python
from chdb.datastore.config import config

# Enable profiling
config.enable_profiling()

# Disable profiling
config.disable_profiling()

# Check if profiling is enabled
print(config.profiling_enabled)  # True or False
```

***


## プロファイラ API \{#api\}

### プロファイラの取得 \{#get-profiler\}

```python
from chdb.datastore.config import get_profiler

profiler = get_profiler()
```


### report() \{#report\}

パフォーマンスレポートを表示します。

```python
profiler.report(min_duration_ms=0.1)
```

**パラメーター:**

| Parameter         | Type  | Default | Description           |
| ----------------- | ----- | ------- | --------------------- |
| `min_duration_ms` | float | `0.1`   | この時間（ミリ秒）以上のステップのみを表示 |

**出力例:**

```text
======================================================================
EXECUTION PROFILE
======================================================================
   45.79ms (100.0%) Total Execution
     23.25ms ( 50.8%) Query Planning [ops_count=2]
     22.29ms ( 48.7%) SQL Segment 1 [ops=2]
       20.48ms ( 91.9%) SQL Execution
        1.74ms (  7.8%) Result to DataFrame
----------------------------------------------------------------------
      TOTAL:    45.79ms
======================================================================
```

レポートには次の内容が表示されます：

* 各ステップの実行時間（ミリ秒）
* 親ステップ／全体時間に対する割合
* 処理の階層的なネスト構造
* 各ステップのメタデータ（例：`ops_count`、`ops`）


### step() \{#step\}

コードブロックの処理時間を手動で計測します。

```python
with profiler.step("custom_operation"):
    # Your code here
    expensive_operation()
```


### clear() \{#clear\}

すべてのプロファイリングデータを消去します。

```python
profiler.clear()
```


### summary() \{#summary\}

ステップ名をキー、処理時間（ミリ秒）を値とする Dictionary を取得します。

```python
summary = profiler.summary()
for name, duration in summary.items():
    print(f"{name}: {duration:.2f}ms")
```

出力結果の例：

```text
Total Execution: 45.79ms
Total Execution.Cache Check: 0.00ms
Total Execution.Query Planning: 23.25ms
Total Execution.SQL Segment 1: 22.29ms
Total Execution.SQL Segment 1.SQL Execution: 20.48ms
Total Execution.SQL Segment 1.Result to DataFrame: 1.74ms
```

***


## レポートの見方 \{#understanding\}

### ステップ名 \{#step-names\}

| ステップ名 | 説明 |
|-----------|-------------|
| `Total Execution` | 全体の実行時間 |
| `Query Planning` | クエリ計画の作成に要した時間 |
| `SQL Segment N` | SQL セグメント N の実行 |
| `SQL Execution` | 実際の SQL クエリ実行 |
| `Result to DataFrame` | 結果を pandas DataFrame に変換する処理 |
| `Cache Check` | クエリキャッシュのチェック |
| `Cache Write` | 結果をキャッシュに書き込む処理 |

### Duration \{#duration\}

- **Planning steps** (Query Planning): 通常は短時間で完了する
- **Execution steps** (SQL Execution): 実際の処理が行われる箇所
- **Transfer steps** (Result to DataFrame): 結果を pandas の DataFrame に変換する処理

### ボトルネックの特定 \{#bottlenecks\}

```text
======================================================================
EXECUTION PROFILE
======================================================================
  200.50ms (100.0%) Total Execution
    10.25ms (  5.1%) Query Planning [ops_count=4]
   190.00ms ( 94.8%) SQL Segment 1 [ops=4]
     185.00ms ( 97.4%) SQL Execution    <- Main bottleneck
       5.00ms (  2.6%) Result to DataFrame
----------------------------------------------------------------------
      TOTAL:   200.50ms
======================================================================
```

***


## プロファイリングのパターン \{#patterns\}

### 単一クエリのプロファイリング \{#single-query\}

```python
config.enable_profiling()
profiler = get_profiler()
profiler.clear()  # Clear previous data

# Run query
result = ds.filter(...).groupby(...).agg(...).to_df()

# View this query's profile
print(profiler.report())
```


### 複数のクエリをプロファイルする \{#multiple-queries\}

```python
config.enable_profiling()
profiler = get_profiler()
profiler.clear()

# Query 1
with profiler.step("Query 1"):
    result1 = query1.to_df()

# Query 2
with profiler.step("Query 2"):
    result2 = query2.to_df()

print(profiler.report())
```


### アプローチの比較 \{#compare\}

```python
profiler = get_profiler()

# Approach 1: Filter then groupby
profiler.clear()
with profiler.step("filter_then_groupby"):
    result1 = ds.filter(ds['x'] > 10).groupby('y').sum().to_df()
summary1 = profiler.summary()
time1 = summary1.get('filter_then_groupby', 0)

# Approach 2: Groupby then filter
profiler.clear()
with profiler.step("groupby_then_filter"):
    result2 = ds.groupby('y').sum().filter(ds['x'] > 10).to_df()
summary2 = profiler.summary()
time2 = summary2.get('groupby_then_filter', 0)

print(f"Approach 1: {time1:.2f}ms")
print(f"Approach 2: {time2:.2f}ms")
print(f"Winner: {'Approach 1' if time1 < time2 else 'Approach 2'}")
```

***


## 最適化のポイント \{#optimization\}

### 1. SQL の実行時間を確認する \{#check-sql\}

`SQL execution` がボトルネックになっている場合は:

- データ量を減らすためのフィルターを追加する
- CSV ではなく Parquet を使用する
- （データベースソースの場合）適切な索引があるか確認する

### 2. I/O 時間を確認する \{#check-io\}

`read_csv` や `read_parquet` がボトルネックになっている場合:

- Parquet 形式（列指向・圧縮）を使用する
- 必要なカラムのみを読み込む
- 可能であればソース側でフィルタリングする

### 3. データ転送を確認する \{#check-transfer\}

`to_df` が遅い場合は:

- 結果セットが大きすぎる可能性があります
- フィルタや LIMIT を追加します
- プレビューには `head()` を使用します

### 4. エンジンの比較 \{#compare-engines\}

```python
from chdb.datastore.config import config

# Profile with chdb
config.use_chdb()
profiler.clear()
result_chdb = query.to_df()
time_chdb = profiler.total_duration_ms

# Profile with pandas
config.use_pandas()
profiler.clear()
result_pandas = query.to_df()
time_pandas = profiler.total_duration_ms

print(f"chdb: {time_chdb:.2f}ms")
print(f"pandas: {time_pandas:.2f}ms")
```

***


## ベストプラクティス \{#best-practices\}

### 1. 最適化の前にプロファイルを行う \{#best-practice-1\}

```python
# Don't guess - measure!
config.enable_profiling()
result = your_query.to_df()
print(get_profiler().report())
```


### 2. テスト間で状態をクリアする \{#best-practice-2\}

```python
profiler.clear()  # Clear previous data
# Run test
print(profiler.report())
```


### 3. 絞り込みに `min_duration_ms` を使用する \{#best-practice-3\}

```python
# Only show operations >= 100ms
profiler.report(min_duration_ms=100)
```


### 4. 代表的なデータに対してプロファイリングを行う \{#best-practice-4\}

```python
# Profile with real-world data sizes
# Small test data may not show real bottlenecks
```


### 5. 本番環境では無効にする \{#best-practice-5\}

```python
# Development
config.enable_profiling()

# Production
config.set_profiling_enabled(False)  # Avoid overhead
```

***


## 例: 完全なプロファイリングセッション \{#example\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config, get_profiler

# Setup
config.enable_profiling()
config.enable_debug()  # Also see what's happening
profiler = get_profiler()

# Load data
profiler.clear()
print("=== Loading Data ===")
ds = pd.read_csv("sales_2024.csv")  # 10M rows
print(profiler.report())

# Query 1: Simple filter
profiler.clear()
print("\n=== Query 1: Simple Filter ===")
result1 = ds.filter(ds['amount'] > 1000).to_df()
print(profiler.report())

# Query 2: Complex aggregation
profiler.clear()
print("\n=== Query 2: Complex Aggregation ===")
result2 = (ds
    .filter(ds['amount'] > 100)
    .groupby('region', 'category')
    .agg({
        'amount': ['sum', 'mean', 'count'],
        'quantity': 'sum'
    })
    .sort('sum', ascending=False)
    .head(20)
    .to_df()
)
print(profiler.report())

# Summary
print("\n=== Summary ===")
print(f"Query 1: {len(result1)} rows")
print(f"Query 2: {len(result2)} rows")
```

---
title: 'DataStore デバッグ'
sidebar_label: '概要'
slug: /chdb/debugging
description: 'explain()、プロファイリング、ロギングを使用して DataStore の操作をデバッグする'
keywords: ['chdb', 'datastore', 'debug', 'explain', 'profiling', 'logging']
doc_type: 'guide'
---

# DataStore のデバッグ \{#datastore-debugging\}

DataStore は、データパイプラインを理解し、最適化するための包括的なデバッグツール群を提供します。

## デバッグツールの概要 \{#overview\}

| ツール | 目的 | 使用タイミング |
|------|---------|-------------|
| `explain()` | 実行計画を確認 | どの SQL が実行されるかを把握する |
| Profiler | パフォーマンスを測定 | 遅い処理を特定する |
| Logging | 実行の詳細を記録・確認 | 予期しない動作をデバッグする |

## クイック決定マトリックス \{#decision-matrix\}

| 目的 | ツール | コマンド |
|------|------|---------|
| 実行計画を確認する | `explain()` | `ds.explain()` |
| パフォーマンスを測定する | Profiler | `config.enable_profiling()` |
| SQL クエリをデバッグする | Logging | `config.enable_debug()` |
| 上記すべて | 組み合わせ | 以下を参照 |

## クイックセットアップ \{#quick-setup\}

### すべてのデバッグを有効にする \{#enable-all\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config

# Enable all debugging
config.enable_debug()        # Verbose logging
config.enable_profiling()    # Performance tracking

ds = pd.read_csv("data.csv")
result = ds.filter(ds['age'] > 25).groupby('city').agg({'salary': 'mean'})

# View execution plan
result.explain()

# Get profiler report
from chdb.datastore.config import get_profiler
profiler = get_profiler()
profiler.report()
```

***


## explain() メソッド \{#explain\}

実行前にクエリの実行計画を確認します。

```python
ds = pd.read_csv("data.csv")

query = (ds
    .filter(ds['amount'] > 1000)
    .groupby('region')
    .agg({'amount': ['sum', 'mean']})
)

# View plan
query.explain()
```

出力結果:

```text
Pipeline:
  Source: file('data.csv', 'CSVWithNames')
  Filter: amount > 1000
  GroupBy: region
  Aggregate: sum(amount), avg(amount)

Generated SQL:
SELECT region, SUM(amount) AS sum, AVG(amount) AS mean
FROM file('data.csv', 'CSVWithNames')
WHERE amount > 1000
GROUP BY region
```

詳細は [explain() のドキュメント](explain.md) を参照してください。

***


## プロファイリング \{#profiling\}

各処理の実行時間を計測します。

```python
from chdb.datastore.config import config, get_profiler

# Enable profiling
config.enable_profiling()

# Run operations
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
profiler.report(min_duration_ms=0.1)
```

出力:

```text
Performance Report
==================
Step                          Duration    Calls
----                          --------    -----
read_csv                      1.234s      1
filter                        0.002s      1
groupby                       0.001s      1
agg                           0.089s      1
sort                          0.045s      1
head                          0.001s      1
to_df (SQL execution)         0.567s      1
----                          --------    -----
Total                         1.939s      7
```

詳細は [Profiling Guide](profiling.md) を参照してください。

***


## ロギング \{#logging\}

詳細な実行ログを確認します。

```python
from chdb.datastore.config import config

# Enable debug logging
config.enable_debug()

# Run operations - logs will show:
# - SQL queries generated
# - Execution engine used
# - Cache hits/misses
# - Timing information
```

ログ出力例:

```text
DEBUG - DataStore: Creating from file 'data.csv'
DEBUG - Query: SELECT region, SUM(amount) FROM ... WHERE amount > 1000 GROUP BY region
DEBUG - Engine: Using chdb for aggregation
DEBUG - Execution time: 0.089s
DEBUG - Cache: Storing result (key: abc123)
```

詳細については、[ログ設定](logging.md) を参照してください。

***


## よくあるデバッグシナリオ \{#scenarios\}

### 1. クエリが想定どおりの結果を返さない \{#scenario-wrong-results\}

```python
# Step 1: View the execution plan
query = ds.filter(ds['age'] > 25).groupby('city').sum()
query.explain(verbose=True)

# Step 2: Enable logging to see SQL
config.enable_debug()

# Step 3: Run and check logs
result = query.to_df()
```


### 2. クエリの実行が遅い \{#scenario-slow\}

```python
# Step 1: Enable profiling
config.enable_profiling()

# Step 2: Run your query
result = process_data()

# Step 3: Check profiler report
profiler = get_profiler()
profiler.report()

# Step 4: Identify slow operations and optimize
```


### 3. エンジン選択を理解する \{#scenario-engine\}

```python
# Enable verbose logging
config.enable_debug()

# Run operations
result = ds.filter(ds['x'] > 10).apply(custom_func)

# Logs will show which engine was used for each operation:
# DEBUG - filter: Using chdb engine
# DEBUG - apply: Using pandas engine (custom function)
```


### 4. キャッシュ関連の問題のデバッグ \{#scenario-cache\}

```python
# Enable debug to see cache operations
config.enable_debug()

# First run
result1 = ds.filter(ds['x'] > 10).to_df()
# LOG: Cache miss, executing query

# Second run (should use cache)
result2 = ds.filter(ds['x'] > 10).to_df()
# LOG: Cache hit, returning cached result

# If not caching when expected, check:
# - Are operations identical?
# - Is cache enabled? config.cache_enabled
```

***


## ベストプラクティス \{#best-practices\}

### 1. デバッグは本番環境ではなく開発環境で行う \{#best-practice-1\}

```python
# Development
config.enable_debug()
config.enable_profiling()

# Production
config.set_log_level(logging.WARNING)
config.set_profiling_enabled(False)
```


### 2. 大きなクエリを実行する前に explain() を使う \{#best-practice-2\}

```python
# Build query
query = ds.filter(...).groupby(...).agg(...)

# Check plan first
query.explain()

# If plan looks good, execute
result = query.to_df()
```


### 3. 最適化の前にプロファイリングする \{#best-practice-3\}

```python
# Don't guess what's slow - measure it
config.enable_profiling()
result = your_pipeline()
get_profiler().report()
```


### 4. 結果が期待どおりでない場合は SQL を確認する \{#best-practice-4\}

```python
# View generated SQL
print(query.to_sql())

# Compare with expected SQL
# Run SQL directly in ClickHouse to verify
```

***


## デバッグツールの概要 \{#summary\}

| ツール | コマンド | 出力 |
|------|---------|--------|
| Explain plan | `ds.explain()` | 実行ステップ + SQL |
| Verbose explain | `ds.explain(verbose=True)` | + メタデータ |
| SQL の表示 | `ds.to_sql()` | SQL クエリ文字列 |
| デバッグ有効化 | `config.enable_debug()` | 詳細なログ |
| プロファイリング有効化 | `config.enable_profiling()` | タイミング情報 |
| Profiler レポート | `get_profiler().report()` | パフォーマンス概要 |
| Profiler クリア | `get_profiler().reset()` | タイミング情報をクリア |

---

## 次のステップ \{#next-steps\}

- [explain() メソッド](explain.md) - 実行計画の詳細なドキュメント
- [プロファイリングガイド](profiling.md) - パフォーマンス計測
- [ロギング設定](logging.md) - ログレベルとフォーマットの設定
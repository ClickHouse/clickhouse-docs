---
title: '実行エンジンの設定'
sidebar_label: '実行エンジン'
slug: /chdb/configuration/execution-engine
description: 'DataStore の実行エンジン（auto、chdb、pandas）の設定'
keywords: ['chdb', 'datastore', 'execution', 'engine', 'chdb', 'pandas', 'auto']
doc_type: 'guide'
---

# 実行エンジンの設定 \{#execution-engine-configuration\}

DataStore は、さまざまなバックエンドを使用して処理を実行できます。本ガイドでは、エンジンの選択および設定・最適化の方法について説明します。

## 利用可能なエンジン \{#engines\}

| エンジン | 説明 | 最適な用途 |
|--------|-------------|----------|
| `auto` | 操作ごとに最適なエンジンを自動選択 | 一般的な用途（デフォルト） |
| `chdb` | すべての操作を ClickHouse SQL で強制実行 | 大規模なデータセット、集計処理 |
| `pandas` | すべての操作を pandas で強制実行 | 互換性テスト、pandas 固有の機能の利用 |

## エンジンの設定 \{#setting\}

### グローバル設定 \{#global\}

```python
from chdb.datastore.config import config

# Option 1: Using set method
config.set_execution_engine('auto')    # Default
config.set_execution_engine('chdb')    # Force ClickHouse
config.set_execution_engine('pandas')  # Force pandas

# Option 2: Using shortcuts
config.use_auto()     # Auto-select
config.use_chdb()     # Force ClickHouse
config.use_pandas()   # Force pandas
```


### 現在使用中のエンジンの確認 \{#checking\}

```python
print(config.execution_engine)  # 'auto', 'chdb', or 'pandas'
```

***


## 自動モード \{#auto-mode\}

`auto` モード（デフォルト）では、DataStore は各処理に対して最適なエンジンを選択します。

### chDB で実行される操作 \{#auto-chdb\}

- SQL 互換のフィルタリング (`filter()`, `where()`)
- カラムの選択 (`select()`)
- ソート (`sort()`, `orderby()`)
- グループ化と集約 (`groupby().agg()`)
- 結合 (`join()`, `merge()`)
- 重複の除去 (`distinct()`, `drop_duplicates()`)
- 行数の制限 (`limit()`, `head()`, `tail()`)

### pandas で実行される処理 \{#auto-pandas\}

- カスタム関数の適用（`apply(custom_func)`）
- カスタム集計を伴う複雑なピボットテーブル
- SQL では表現できない処理
- 入力がすでに pandas の DataFrame である場合

### 例 \{#auto-example\}

```python
from chdb import datastore as pd
from chdb.datastore.config import config

config.use_auto()  # Default

ds = pd.read_csv("data.csv")

# This uses chDB (SQL)
result = (ds
    .filter(ds['amount'] > 100)   # SQL: WHERE
    .groupby('region')            # SQL: GROUP BY
    .agg({'amount': 'sum'})       # SQL: SUM()
)

# This uses pandas (custom function)
result = ds.apply(lambda row: complex_calculation(row), axis=1)
```

***


## chDB モード \{#chdb-mode\}

すべての操作を ClickHouse SQL 経由で行います:

```python
config.use_chdb()
```


### 使用するタイミング \{#chdb-when\}

- 大規模なデータセット（数百万行規模）の処理が必要な場合
- 集約処理が重いワークロードの場合
- SQL 最適化の効果を最大限に引き出したい場合
- すべての操作で一貫した動作が求められる場合

### パフォーマンス特性 \{#chdb-performance\}

| Operation Type | Performance |
|----------------|-------------|
| GroupBy/Aggregation | 非常に良好（最大 20 倍高速） |
| Complex Filtering | 非常に良好 |
| Sorting | とても良好 |
| Simple Single Filters | 良好（わずかなオーバーヘッド） |

### 制限事項 \{#chdb-limitations\}

- カスタム Python 関数はサポートされない可能性があります
- 一部の pandas 固有の機能は変換が必要です

---

## pandas モード \{#pandas-mode\}

すべての処理を強制的に pandas 経由で実行します。

```python
config.use_pandas()
```


### 利用するタイミング \{#pandas-when\}

- pandas との互換性テストを行う場合
- pandas 固有の機能を利用する場合
- pandas 関連の問題をデバッグする場合
- データがすでに pandas 形式になっている場合

### パフォーマンス特性 \{#pandas-performance\}

| 操作の種類 | パフォーマンス |
|----------------|-------------|
| 単純な単一操作 | 良好 |
| カスタム関数 | 非常に優れている |
| 複雑な集計処理 | chDB より遅い |
| 大規模データセット | メモリ使用量が多い |

---

## Cross-DataStore Engine \{#cross-datastore\}

異なる DataStore 間のカラムを組み合わせる処理を実行するエンジンを構成します：

```python
# Set cross-DataStore engine
config.set_cross_datastore_engine('auto')
config.set_cross_datastore_engine('chdb')
config.set_cross_datastore_engine('pandas')
```


### 例 \{#cross-example\}

```python
ds1 = pd.read_csv("sales.csv")
ds2 = pd.read_csv("inventory.csv")

# This operation involves two DataStores
result = ds1.join(ds2, on='product_id')
# Uses cross_datastore_engine setting
```

***


## エンジン選択ロジック \{#selection-logic\}

### 自動モードの決定木 \{#decision-tree\}

```text
Operation requested
    │
    ├─ Can be expressed in SQL?
    │      │
    │      ├─ Yes → Use chDB
    │      │
    │      └─ No → Use pandas
    │
    └─ Cross-DataStore operation?
           │
           └─ Use cross_datastore_engine setting
```


### 関数レベルのオーバーライド \{#function-override\}

一部の関数については、使用するエンジンを明示的に指定できます。

```python
from chdb.datastore.config import function_config

# Force specific functions to use specific engine
function_config.use_chdb('length', 'substring')
function_config.use_pandas('upper', 'lower')
```

詳細は [Function Config](function-config.md) を参照してください。

***


## パフォーマンス比較 \{#performance-comparison\}

1,000万行でのベンチマーク結果:

| Operation | pandas (ms) | chdb (ms) | Speedup |
|-----------|-------------|-----------|---------|
| GroupBy count | 347 | 17 | 19.93x |
| Combined ops | 1,535 | 234 | 6.56x |
| Complex pipeline | 2,047 | 380 | 5.39x |
| Filter+Sort+Head | 1,537 | 350 | 4.40x |
| GroupBy agg | 406 | 141 | 2.88x |
| Single filter | 276 | 526 | 0.52x |

**主なポイント:**

- chDB は集計処理や複雑なパイプラインで特に高い性能を発揮する
- pandas はシンプルな単一処理ではわずかに高速
- `auto` モードを使って両者の長所を活用する

---

## ベストプラクティス \{#best-practices\}

### 1. まずは自動モードを使用する \{#start-with-auto-mode\}

```python
config.use_auto()  # Let DataStore decide
```


### 2. エンジンを強制指定する前にプロファイルする \{#profile-before-forcing\}

```python
config.enable_profiling()
# Run your workload
# Check profiler report to see where time is spent
```


### 3. 特定のワークロード向けにエンジンを固定する \{#force-engine-for-specific-workloads\}

```python
# For heavy aggregation workloads
config.use_chdb()

# For pandas compatibility testing
config.use_pandas()
```


### 4. explain() を使って実行計画を理解する \{#use-explain-to-understand-execution\}

```python
ds = pd.read_csv("data.csv")
query = ds.filter(ds['age'] > 25).groupby('city').agg({'salary': 'sum'})

# See what SQL will be generated
query.explain()
```

***


## トラブルシューティング \{#troubleshooting\}

### 問題: 処理が想定よりも遅い \{#issue-operation-slower\}

```python
# Check current engine
print(config.execution_engine)

# Enable debug to see what's happening
config.enable_debug()

# Try forcing specific engine
config.use_chdb()  # or config.use_pandas()
```


### 問題: chdb モードで未サポートの操作 \{#issue-unsupported-operation\}

```python
# Some pandas operations aren't supported in SQL
# Solution: use auto mode
config.use_auto()

# Or explicitly convert to pandas first
df = ds.to_df()
result = df.some_pandas_specific_operation()
```


### 問題: 大規模データ処理時のメモリ問題 \{#issue-memory-issues\}

```python
# Use chdb engine to avoid loading all data into memory
config.use_chdb()

# Filter early to reduce data size
result = ds.filter(ds['date'] >= '2024-01-01').to_df()
```

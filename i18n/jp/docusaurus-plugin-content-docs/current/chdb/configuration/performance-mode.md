---
title: 'パフォーマンスモード (compat_mode)'
sidebar_label: 'パフォーマンスモード'
slug: /chdb/configuration/performance-mode
description: '最大スループットのために pandas 互換レイヤーによるオーバーヘッドを無効化する SQL ファーストのパフォーマンスモード'
keywords: ['chdb', 'datastore', 'パフォーマンス', 'モード', 'compat', 'sql-first', '最適化']
doc_type: 'guide'
---

# パフォーマンスモード \{#performance-mode\}

DataStore には 2 つの互換モードがあり、出力を pandas 互換の形式に整形するか、生の SQL によるパフォーマンスを最適化するかを制御します。

## 概要 \{#overview\}

| モード | `compat_mode` の値 | 説明 |
|------|---------------------|-------------|
| **Pandas** (デフォルト) | `"pandas"` | pandas の挙動と完全互換。行順の保持、MultiIndex、set_index、dtype の補正、安定ソート時のタイブレーク、`-If` / `isNaN` ラッパーなどを提供します。 |
| **Performance** | `"performance"` | SQL 優先の実行。pandas 互換性のためのオーバーヘッドをすべて削除します。スループットは最大になりますが、結果の構造が pandas と異なる場合があります。 |

### パフォーマンスモードが無効化するもの \{#what-it-disables\}

| オーバーヘッド | Pandas モードでの挙動 | パフォーマンスモードでの挙動 |
|----------|---------------------|--------------------------|
| **行順序の保持** | `_row_id` の挿入、`rowNumberInAllBlocks()`, `__orig_row_num__` サブクエリ | 無効化 — 行順序は保証されない |
| **安定ソート時の同順位タイブレーク** | `rowNumberInAllBlocks() ASC` を ORDER BY に付加 | 無効化 — 同順位は任意の順序になりうる |
| **Parquet preserve_order** | `input_format_parquet_preserve_order=1` | 無効化 — Parquet の並列読み取りを許可 |
| **GroupBy の自動 ORDER BY** | `ORDER BY group_key` を追加（pandas のデフォルト `sort=True`） | 無効化 — グループは任意の順序で返される |
| **GroupBy dropna WHERE** | `WHERE key IS NOT NULL` を追加（pandas のデフォルト `dropna=True`） | 無効化 — NULL グループも含まれる |
| **GroupBy set_index** | グループキーをインデックスに設定 | 無効化 — グループキーはカラムのまま保持 |
| **MultiIndex カラム** | `agg({'col': ['sum','mean']})` が MultiIndex カラムを返す | 無効化 — フラットなカラム名（`col_sum`, `col_mean`） |
| **`-If`/`isNaN` ラッパー** | skipna のために `sumIf(col, NOT isNaN(col))` を使用 | 無効化 — プレーンな `sum(col)`（ClickHouse は NULL をネイティブにスキップ） |
| **count への `toInt64`** | pandas の int64 に合わせるため `toInt64(count())` | 無効化 — ネイティブな SQL の dtype を返す |
| **全 NaN の sum に対する `fillna(0)`** | 全て NaN の合計は 0 を返す（pandas の挙動） | 無効化 — NULL を返す |
| **Dtype の補正** | `abs()` による unsigned→signed など | 無効化 — ネイティブな SQL の dtypes |
| **Index の保持** | SQL 実行後に元の index を復元 | 無効化 |
| **`first()`/`last()`** | `argMin/argMax(col, rowNumberInAllBlocks())` | `any(col)` / `anyLast(col)` — 高速だが非決定的 |
| **単一 SQL による集計** | ColumnExpr groupby が中間の DataFrame をマテリアライズ | lazy なオペレーションチェーンに `LazyGroupByAgg` を挿入 — 単一の SQL クエリ |

---

## パフォーマンスモードを有効にする \{#enabling\}

### config オブジェクトの使用 \{#using-config\}

```python
from chdb.datastore.config import config

# Enable performance mode
config.use_performance_mode()

# Back to pandas compatibility
config.use_pandas_compat()

# Check current mode
print(config.compat_mode)  # 'pandas' or 'performance'
```


### モジュールレベルの関数を使用する \{#using-functions\}

```python
from chdb.datastore.config import set_compat_mode, CompatMode, is_performance_mode

# Enable performance mode
set_compat_mode(CompatMode.PERFORMANCE)

# Check
print(is_performance_mode())  # True

# Back to default
set_compat_mode(CompatMode.PANDAS)
```


### 簡易インポートを利用する \{#using-imports\}

```python
from chdb import use_performance_mode, use_pandas_compat

use_performance_mode()
# ... high-performance operations ...
use_pandas_compat()
```

:::note
パフォーマンスモードを有効にすると、自動的に実行エンジンが `chdb` に設定されます。`config.use_chdb()` を明示的に呼び出す必要はありません。
:::

***


## パフォーマンスモードを使用すべきタイミング \{#when-to-use\}

**次のような場合はパフォーマンスモードを使用してください:**

- 大規模なデータセット（数十万～数百万行）を処理する場合
- 集約処理が重いワークロード（groupby、sum、mean、count）を実行する場合
- 行の順序が重要でない場合（例: 集計結果、レポート、ダッシュボード）
- SQL のスループットを最大化しつつオーバーヘッドを最小限に抑えたい場合
- メモリ使用量を抑えたい場合（Parquet の並列読み込み、中間的な DataFrame を生成しない）

**次のような場合は pandas モードを使用し続けてください:**

- pandas とまったく同じ挙動（行の順序、MultiIndex、dtypes）が必要な場合
- `first()` / `last()` が実際の先頭 / 末尾の行を返すことに依存している場合
- 行の順序に依存する `shift()`、`diff()`、`cumsum()` を使用している場合
- DataStore の出力を pandas と比較するテストを書いている場合

---

## 挙動の違い \{#behavior-differences\}

### 行の順序 \{#row-order\}

パフォーマンスモードでは、任意の操作において行の順序は**保証されません**。これには次が含まれます:

* フィルター結果
* GroupBy 集計結果
* 明示的な `sort_values()` を伴わない `head()` / `tail()`
* `first()` / `last()` 集計

順序が保証された結果が必要な場合は、明示的に `sort_values()` を追加してください:

```python
config.use_performance_mode()

ds = pd.read_csv("data.csv")

# Unordered (fast)
result = ds.groupby("region")["revenue"].sum()

# Ordered (still fast, just adds ORDER BY)
result = ds.groupby("region")["revenue"].sum().sort_values()
```


### GroupBy の結果 \{#groupby-results\}

| 観点 | Pandas モード | パフォーマンスモード |
|--------|------------|-----------------|
| グループキーの位置 | インデックス（`set_index` による） | 通常のカラム |
| グループの順序 | キーでソート（デフォルト） | 任意の順序 |
| NULL グループ | 除外（デフォルト `dropna=True`） | 含まれる |
| カラム形式 | 複数集約時は MultiIndex | フラットな名前（`col_func`） |
| `first()`/`last()` | 決定的（行の順序に依存） | 非決定的（`any()`/`anyLast()`） |

### 集約 \{#aggregation\}

```python
config.use_performance_mode()

# Sum of all-NaN group returns NULL (not 0)
# Count returns native uint64 (not forced int64)
# No -If wrappers: sum() instead of sumIf()
result = ds.groupby("cat")["val"].sum()
```


### 単一 SQL クエリでの実行 \{#single-sql\}

パフォーマンスモードでは、`ColumnExpr` の groupby 集約（例: `ds[condition].groupby('col')['val'].sum()`）は、pandas モードで用いられる 2 段階の処理ではなく、**単一の SQL クエリ** として実行されます。

```python
config.use_performance_mode()

# Pandas mode: two SQL queries (filter → materialize → groupby)
# Performance mode: one SQL query (WHERE + GROUP BY in same query)
result = ds[ds["rating"] > 3.5].groupby("category")["revenue"].sum()

# Generated SQL (single query):
# SELECT category, sum(revenue) FROM data WHERE rating > 3.5 GROUP BY category
```

これにより中間的な DataFrame のマテリアライズが不要になり、メモリ使用量と実行時間を大幅に削減できます。

***


## Execution Engine との比較 \{#vs-execution-engine\}

Performance モード（`compat_mode`）と execution engine（`execution_engine`）は、**互いに独立した設定軸**です：

| Config             | Controls                     | Values                   |
| ------------------ | ---------------------------- | ------------------------ |
| `execution_engine` | 計算を実行する**エンジン**              | `auto`, `chdb`, `pandas` |
| `compat_mode`      | 出力形式を pandas 互換に整形する**かどうか** | `pandas`, `performance`  |

`compat_mode='performance'` を設定すると、自動的に `execution_engine='chdb'` が設定されます。これは、パフォーマンスモードが SQL 実行向けに設計されているためです。

```python
from chdb.datastore.config import config

# These are independent
config.use_chdb()              # Force chDB engine, keep pandas compat
config.use_performance_mode()  # Force chDB + remove pandas overhead
```

***


## パフォーマンスモードでのテスト \{#testing\}

パフォーマンスモード用のテストを書く場合、結果の行の順序や構造がpandasと異なることがあります。次の方法を使用してください:

### ソート後に比較（集約・フィルタ） \{#sort-then-compare\}

```python
# Sort both sides by the same columns before comparing
ds_result = ds.groupby("cat")["val"].sum()
pd_result = pd_df.groupby("cat")["val"].sum()

ds_sorted = ds_result.sort_index()
pd_sorted = pd_result.sort_index()
np.testing.assert_array_equal(ds_sorted.values, pd_sorted.values)
```


### 値範囲チェック（先頭／末尾） \{#value-range-check\}

```python
# first() with any() returns an arbitrary element from the group
result = ds.groupby("cat")["val"].first()
for group_key in groups:
    assert result.loc[group_key] in group_values[group_key]
```


### スキーマと行数（ORDER BY なしの LIMIT） \{#schema-and-count\}

```python
# head() without sort_values: row set is non-deterministic
result = ds.head(5)
assert len(result) == 5
assert set(result.columns) == expected_columns
```

***


## ベストプラクティス \{#best-practices\}

### 1. スクリプトの冒頭で有効化する \{#enable-early\}

```python
from chdb.datastore.config import config

config.use_performance_mode()

# All subsequent operations benefit
ds = pd.read_parquet("data.parquet")
result = ds[ds["amount"] > 100].groupby("region")["amount"].sum()
```


### 2. 順序が重要な場合は明示的なソートを指定する \{#explicit-sort\}

```python
# For display or downstream processing that expects order
result = (ds
    .groupby("region")["revenue"].sum()
    .sort_values(ascending=False)
)
```


### 3. バッチ／ETL ワークロードでの利用 \{#batch-etl\}

```python
config.use_performance_mode()

# ETL pipeline — order doesn't matter, throughput does
summary = (ds
    .filter(ds["date"] >= "2024-01-01")
    .groupby(["region", "product"])
    .agg({"revenue": "sum", "quantity": "sum", "rating": "mean"})
)
summary.to_df().to_parquet("summary.parquet")
```


### 4. セッション中にモードを切り替える \{#switch-modes\}

```python
# Performance mode for heavy computation
config.use_performance_mode()
aggregated = ds.groupby("cat")["val"].sum()

# Back to pandas mode for exact-match comparison
config.use_pandas_compat()
detailed = ds[ds["val"] > 100].head(10)
```

***


## 関連ドキュメント \{#related\}

- [Execution Engine](execution-engine.md) — エンジン選択（auto/chdb/pandas）
- [Performance Guide](../guides/pandas-performance.md) — 一般的な最適化の指針
- [Key Differences from pandas](../guides/pandas-differences.md) — 挙動の違い
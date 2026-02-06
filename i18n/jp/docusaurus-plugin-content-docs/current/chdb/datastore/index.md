---
title: 'DataStore - pandas 互換 API'
sidebar_label: '概要'
slug: /chdb/datastore
description: 'DataStore は高性能なデータ分析のために SQL 最適化を備えた pandas 互換 API を提供します'
keywords: ['chdb', 'datastore', 'pandas', 'dataframe', 'sql', 'lazy evaluation']
doc_type: 'guide'
---

# DataStore: SQL 最適化を備えた pandas 互換 API \{#datastore-pandas-compatible-api-with-sql-optimization\}

DataStore は、chDB の pandas 互換 API であり、なじみのある pandas DataFrame インターフェイスに SQL クエリ最適化の強力な機能を組み合わせたものです。pandas スタイルのコードを書いて、ClickHouse レベルのパフォーマンスを得ることができます。

## 主な機能 \{#key-features\}

- **pandas 互換性**: 209 個の pandas DataFrame メソッド、56 個の `.str` メソッド、42 個以上の `.dt` メソッド
- **SQL 最適化**: 操作は自動的に最適化された SQL クエリにコンパイルされます
- **遅延評価**: 結果が必要になるまで処理を遅延評価します
- **630 以上の API メソッド**: データ操作のための包括的な API 群
- **ClickHouse 拡張機能**: pandas にはない追加アクセサ（`.arr`、`.json`、`.url`、`.ip`、`.geo`）

## アーキテクチャ \{#architecture\}

<div style={{textAlign: 'center'}}>
  <img src={require('../images/datastore_architecture.png').default} alt="DataStore アーキテクチャ" style={{maxWidth: '700px', width: '100%'}} />
</div>

DataStore は、**遅延評価 (lazy evaluation)** と **デュアルエンジン実行 (dual-engine execution)** を採用しています。

1. **遅延処理チェーン**: 処理は即時には実行されず、まず記録されるだけです
2. **スマートなエンジン選択**: QueryPlanner が各セグメントを最適なエンジン (SQL 用の chDB、複雑な処理用の Pandas) にルーティングします
3. **中間キャッシュ**: 各ステップの結果をキャッシュし、反復的な探索を高速化します

詳細は [Execution Model](execution-model.md) を参照してください。

## Pandas からの1行移行 \{#migration\}

```python
# Before (pandas)
import pandas as pd
df = pd.read_csv("data.csv")
result = df[df['age'] > 25].groupby('city')['salary'].mean()

# After (DataStore) - just change the import!
from chdb import datastore as pd
df = pd.read_csv("data.csv")
result = df[df['age'] > 25].groupby('city')['salary'].mean()
```

既存の pandas コードは一切変更せずにそのまま動作しますが、実行は ClickHouse エンジン上で行われます。


## パフォーマンス比較 \{#performance\}

DataStore は、特に集計や複雑なパイプライン処理において、pandas と比べて大幅なパフォーマンス向上を実現します。

| Operation | Pandas | DataStore | Speedup |
|-----------|--------|-----------|---------|
| GroupBy count | 347ms | 17ms | **19.93x** |
| Complex pipeline | 2,047ms | 380ms | **5.39x** |
| Filter+Sort+Head | 1,537ms | 350ms | **4.40x** |
| GroupBy agg | 406ms | 141ms | **2.88x** |

*1,000 万行のデータに対するベンチマーク。詳細は [benchmark script](https://github.com/chdb-io/chdb/blob/main/refs/benchmark_datastore_vs_pandas.py) および [Performance Guide](../guides/pandas-performance.md) を参照してください。*

## DataStore を使用するタイミング \{#when-to-use\}

**次のような場合は DataStore を使用します:**

- 大規模なデータセット（数百万行）を扱うとき
- 集計や groupby 操作を実行するとき
- ファイル、データベース、またはクラウドストレージからデータをクエリするとき
- 複雑なデータパイプラインを構築するとき
- pandas API と同等の操作性で、より高いパフォーマンスが必要なとき

**次のような場合は生の SQL API を使用します:**

- SQL を直接記述したいとき
- クエリの実行をきめ細かく制御する必要があるとき
- pandas API からは利用できない ClickHouse 固有の機能を扱うとき

## 機能比較 \{#comparison\}

| 機能 | Pandas | Polars  | DuckDB | DataStore |
|---------|--------|---------|--------|-----------|
| Pandas API 互換性 | -      | 部分的 | なし | **完全** |
| 遅延評価 | なし     | あり     | あり | **あり** |
| SQL クエリサポート | なし     | あり     | あり | **あり** |
| ClickHouse 関数 | なし     | なし      | なし | **あり** |
| 文字列/DateTime アクセサ | あり    | あり     | なし | **あり + 追加機能** |
| Array/JSON/URL/IP/Geo | なし     | 部分的 | なし | **あり** |
| ファイルへの直接クエリ実行 | なし     | あり     | あり | **あり** |
| Cloud ストレージサポート | なし     | 限定的 | あり | **あり** |

## API 統計 \{#api-stats\}

| カテゴリ | 件数 | カバレッジ |
|----------|-------|----------|
| DataFrame メソッド | 209 | pandas の 100% |
| Series.str アクセサ | 56 | pandas の 100% |
| Series.dt アクセサ | 42+ | 100%+（ClickHouse 拡張分を含む） |
| Series.arr アクセサ | 37 | ClickHouse 固有 |
| Series.json アクセサ | 13 | ClickHouse 固有 |
| Series.url アクセサ | 15 | ClickHouse 固有 |
| Series.ip アクセサ | 9 | ClickHouse 固有 |
| Series.geo アクセサ | 14 | ClickHouse 固有 |
| **API メソッド総数** | **630+** | - |

## ドキュメントのナビゲーション \{#navigation\}

### はじめに \{#getting-started\}

- [クイックスタート](quickstart.md) - インストールと基本的な使い方
- [Pandas からの移行](../guides/migration-from-pandas.md) - 手順を追った移行ガイド

### API リファレンス \{#api-reference\}

- [Factory Methods](factory-methods.md) - さまざまなソースからの DataStore の作成
- [Query Building](query-building.md) - SQL スタイルのクエリ構築
- [Pandas Compatibility](pandas-compat.md) - 209 個の pandas 互換メソッド
- [Accessors](accessors.md) - 文字列、DateTime、Array、JSON、URL、IP、Geo アクセサー
- [Aggregation](aggregation.md) - 集約関数とウィンドウ関数
- [I/O Operations](io.md) - データの読み取りと書き込み

### 高度なトピック \{#advanced-topics\}

- [Execution Model](execution-model.md) - 遅延評価とキャッシュ
- [Class Reference](class-reference.md) - 完全な API リファレンス

### 設定とデバッグ \{#configuration-debugging\}

- [設定](../configuration/index.md) - すべての設定オプション
- [デバッグ](../debugging/index.md) - EXPLAIN、プロファイリング、ログ出力

### Pandas ユーザーガイド \{#pandas-user-guides\}

- [Pandas Cookbook](../guides/pandas-cookbook.md) - 一般的なパターン
- [Key Differences](../guides/pandas-differences.md) - pandas との主な違い
- [Performance Guide](../guides/pandas-performance.md) - 最適化のためのガイド
- [SQL for Pandas Users](../guides/pandas-to-sql.md) - pandas の操作がどのような SQL に対応しているかを理解する

## 簡単な例 \{#quick-example\}

```python
from chdb import datastore as pd

# Read data from various sources
ds = pd.read_csv("sales.csv")
# or: ds = pd.DataStore.uri("s3://bucket/sales.parquet")
# or: ds = pd.DataStore.from_mysql("mysql://user:pass@host/db/table")

# Familiar pandas operations - automatically optimized to SQL
result = (ds
    .filter(ds['amount'] > 1000)           # WHERE amount > 1000
    .groupby('region')                      # GROUP BY region
    .agg({'amount': ['sum', 'mean']})       # SUM(amount), AVG(amount)
    .sort_values('sum', ascending=False)    # ORDER BY sum DESC
    .head(10)                               # LIMIT 10
)

# View the generated SQL
print(result.to_sql())

# Execute and get results
df = result.to_df()  # Returns pandas DataFrame
```


## 次のステップ \{#next-steps\}

- **DataStore は初めてですか？** まずは [クイックスタートガイド](quickstart.md) から始めてください
- **pandas から移行しますか？** [移行ガイド](../guides/migration-from-pandas.md) をお読みください
- **さらに詳しく知りたいですか？** [API リファレンス](class-reference.md) をご覧ください
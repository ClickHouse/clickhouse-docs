---
title: 'DataStore Pandas 互換性'
sidebar_label: 'Pandas 互換性'
slug: /chdb/datastore/pandas-compat
description: 'DataStore で pandas と互換性のあるメソッドの完全な一覧（DataFrame メソッド 209 個）'
keywords: ['chdb', 'datastore', 'pandas', 'compatibility', 'dataframe', 'methods']
doc_type: 'reference'
---

# Pandas 互換性 \{#pandas-compatibility\}

DataStore は、完全な API 互換性を実現するために **209 個の pandas DataFrame メソッド** を実装しています。既存の pandas コードは、最小限の変更でそのまま利用できます。

## 互換性へのアプローチ \{#approach\}

```python
# Typical migration - just change the import
- import pandas as pd
+ from chdb import datastore as pd

# Your code works unchanged
df = pd.read_csv("data.csv")
result = df[df['age'] > 25].groupby('city')['salary'].mean()
```

**主な特長:**

* pandas DataFrame メソッド 209 個すべてを実装
* SQL 最適化のための遅延評価
* 自動型ラッピング（DataFrame → DataStore、Series → ColumnExpr）
* 不変操作（`inplace=True` はサポートしない）

***


## 属性とプロパティ \{#attributes\}

| Property  | 説明               | 実行が行われるか |
| --------- | ---------------- | -------- |
| `shape`   | (行, カラム) のタプル    | はい       |
| `columns` | カラム名 (インデックス)    | はい       |
| `dtypes`  | カラムのデータ型         | はい       |
| `values`  | NumPy 配列         | はい       |
| `index`   | 行のインデックス         | はい       |
| `size`    | 要素数              | はい       |
| `ndim`    | 次元数              | いいえ      |
| `empty`   | DataFrame が空かどうか | はい       |
| `T`       | 転置               | はい       |
| `axes`    | 軸のリスト            | はい       |

**例:**

```python
from chdb import datastore as pd

ds = pd.read_csv("data.csv")

print(ds.shape)      # (1000, 5)
print(ds.columns)    # Index(['name', 'age', 'city', 'salary', 'dept'])
print(ds.dtypes)     # name: object, age: int64, ...
print(ds.empty)      # False
```

***


## インデックス作成と選択 \{#indexing\}

| Method | Description              | Example |
|--------|--------------------------|---------|
| `df['col']` | カラムを選択              | `ds['age']` |
| `df[['col1', 'col2']]` | カラムを複数選択         | `ds[['name', 'age']]` |
| `df[condition]` | ブールインデクシング       | `ds[ds['age'] > 25]` |
| `df.loc[...]` | ラベル指定アクセス         | `ds.loc[0:10, 'name']` |
| `df.iloc[...]` | 整数指定アクセス          | `ds.iloc[0:10, 0:3]` |
| `df.at[...]` | ラベルで単一値を取得       | `ds.at[0, 'name']` |
| `df.iat[...]` | 位置で単一値を取得        | `ds.iat[0, 0]` |
| `df.head(n)` | 先頭 n 行               | `ds.head(10)` |
| `df.tail(n)` | 末尾 n 行               | `ds.tail(10)` |
| `df.sample(n)` | ランダムサンプリング        | `ds.sample(100)` |
| `df.select_dtypes()` | データ型による選択        | `ds.select_dtypes(include='number')` |
| `df.query()` | クエリ式                | `ds.query('age > 25')` |
| `df.where()` | 条件による置換           | `ds.where(ds['age'] > 0, 0)` |
| `df.mask()` | where の反対条件         | `ds.mask(ds['age'] < 0, 0)` |
| `df.isin()` | 値が含まれるかを判定       | `ds['city'].isin(['NYC', 'LA'])` |
| `df.get()` | カラムを安全に取得         | `ds.get('col', default=None)` |
| `df.xs()` | クロスセクションの取得      | `ds.xs('key')` |
| `df.pop()` | カラムを削除             | `ds.pop('col')` |

---

## 統計メソッド \{#statistical\}

| Method           | Description   | SQL Equivalent |
| ---------------- | ------------- | -------------- |
| `mean()`         | 平均値           | `AVG()`        |
| `median()`       | 中央値           | `MEDIAN()`     |
| `mode()`         | 最頻値           | -              |
| `std()`          | 標準偏差          | `STDDEV()`     |
| `var()`          | 分散            | `VAR()`        |
| `min()`          | 最小値           | `MIN()`        |
| `max()`          | 最大値           | `MAX()`        |
| `sum()`          | 合計            | `SUM()`        |
| `prod()`         | 積             | -              |
| `count()`        | 非 NULL の件数    | `COUNT()`      |
| `nunique()`      | 一意な値の件数       | `UNIQ()`       |
| `value_counts()` | 値の出現頻度        | `GROUP BY`     |
| `quantile()`     | 分位点           | `QUANTILE()`   |
| `describe()`     | 統計量の概要        | -              |
| `corr()`         | 相関行列          | `CORR()`       |
| `cov()`          | 共分散行列         | `COV()`        |
| `corrwith()`     | ペアワイズ相関       | -              |
| `rank()`         | 順位            | `RANK()`       |
| `abs()`          | 絶対値           | `ABS()`        |
| `round()`        | 丸め            | `ROUND()`      |
| `clip()`         | 値の切り詰め        | -              |
| `cumsum()`       | 累積和           | ウィンドウ関数        |
| `cumprod()`      | 累積積           | ウィンドウ関数        |
| `cummin()`       | 累積最小値         | ウィンドウ関数        |
| `cummax()`       | 累積最大値         | ウィンドウ関数        |
| `diff()`         | 差分            | ウィンドウ関数        |
| `pct_change()`   | 変化率           | ウィンドウ関数        |
| `skew()`         | 歪度            | `SKEW()`       |
| `kurt()`         | 尖度            | `KURT()`       |
| `sem()`          | 標準誤差          | -              |
| `all()`          | すべてが true（真）  | -              |
| `any()`          | いずれかが true（真） | -              |
| `idxmin()`       | 最小値の索引        | -              |
| `idxmax()`       | 最大値の索引        | -              |

**例:**

```python
ds = pd.read_csv("data.csv")

# Basic statistics
print(ds['salary'].mean())
print(ds['age'].std())
print(ds.describe())

# Group statistics
print(ds.groupby('department')['salary'].mean())
print(ds.groupby('city').agg({'salary': ['mean', 'std'], 'age': 'count'}))
```

***


## データ操作 \{#manipulation\}

| Method              | Description      |
| ------------------- | ---------------- |
| `drop()`            | 行/カラムを削除する       |
| `drop_duplicates()` | 重複を削除する          |
| `duplicated()`      | 重複にフラグを立てる       |
| `dropna()`          | 欠損値を削除する         |
| `fillna()`          | 欠損値を埋める          |
| `ffill()`           | 前方に埋める           |
| `bfill()`           | 後方に埋める           |
| `interpolate()`     | 値を補間する           |
| `replace()`         | 値を置換する           |
| `rename()`          | カラム/索引名を変更する     |
| `rename_axis()`     | 軸名を変更する          |
| `assign()`          | 新しいカラムを追加する      |
| `astype()`          | 型を変換する           |
| `convert_dtypes()`  | 適切な型を推論する        |
| `copy()`            | DataFrame をコピーする |

**例:**

```python
ds = pd.read_csv("data.csv")

# Drop operations
result = ds.drop(columns=['unused_col'])
result = ds.drop_duplicates(subset=['user_id'])
result = ds.dropna(subset=['email'])

# Fill operations
result = ds.fillna(0)
result = ds.fillna({'age': 0, 'name': 'Unknown'})

# Transform operations
result = ds.rename(columns={'old_name': 'new_name'})
result = ds.assign(
    full_name=lambda x: x['first_name'] + ' ' + x['last_name'],
    age_group=lambda x: pd.cut(x['age'], bins=[0, 25, 50, 100])
)
```

***


## 並べ替えとランキング \{#sorting\}

| Method          | Description |
| --------------- | ----------- |
| `sort_values()` | 値でソート       |
| `sort_index()`  | 索引でソート      |
| `nlargest()`    | 上位 N 個の値    |
| `nsmallest()`   | 下位 N 個の値    |

**例:**

```python
# Sort by single column
result = ds.sort_values('salary', ascending=False)

# Sort by multiple columns
result = ds.sort_values(['department', 'salary'], ascending=[True, False])

# Get top/bottom N
result = ds.nlargest(10, 'salary')
result = ds.nsmallest(5, 'age')
```

***


## データ形状の変換 \{#reshaping\}

| Method              | Description   |
| ------------------- | ------------- |
| `pivot()`           | ピボットテーブル      |
| `pivot_table()`     | 集約付きピボット      |
| `melt()`            | 逆ピボット（アンピボット） |
| `stack()`           | カラムを索引に積み上げる  |
| `unstack()`         | 索引をカラムに展開     |
| `transpose()` / `T` | 転置            |
| `explode()`         | リストを行に展開      |
| `squeeze()`         | 次元を削減         |
| `droplevel()`       | 索引レベルを削除      |
| `swaplevel()`       | 索引レベルを入れ替え    |
| `reorder_levels()`  | 索引レベルを並べ替え    |

**例:**

```python
# Pivot table
result = ds.pivot_table(
    values='amount',
    index='region',
    columns='product',
    aggfunc='sum'
)

# Melt (unpivot)
result = ds.melt(
    id_vars=['name'],
    value_vars=['score1', 'score2', 'score3'],
    var_name='test',
    value_name='score'
)

# Explode arrays
result = ds.explode('tags')
```

***


## 結合 / ジョイン \{#combining\}

| Method            | Description |
| ----------------- | ----------- |
| `merge()`         | SQL 形式のマージ  |
| `join()`          | 索引に基づいて結合   |
| `concat()`        | 連結          |
| `append()`        | 行を追加        |
| `combine()`       | 関数を使って結合    |
| `combine_first()` | 優先順位を付けて結合  |
| `update()`        | 値を更新        |
| `compare()`       | 差分を表示       |

**例:**

```python
# Merge (join)
result = pd.merge(df1, df2, on='id', how='left')
result = df1.join(df2, on='id')

# Concatenate
result = pd.concat([df1, df2, df3])
result = pd.concat([df1, df2], axis=1)
```

***


## バイナリ演算 \{#binary\}

| Method                       | Description         |
| ---------------------------- | ------------------- |
| `add()` / `radd()`           | 加算                  |
| `sub()` / `rsub()`           | 減算                  |
| `mul()` / `rmul()`           | 乗算                  |
| `div()` / `rdiv()`           | 除算                  |
| `truediv()` / `rtruediv()`   | 実数除算（true division） |
| `floordiv()` / `rfloordiv()` | 切り捨て除算              |
| `mod()` / `rmod()`           | 剰余（モジュロ）            |
| `pow()` / `rpow()`           | 累乗                  |
| `dot()`                      | 行列積                 |

**例:**

```python
# Arithmetic operations
result = ds['col1'].add(ds['col2'])
result = ds['price'].mul(ds['quantity'])

# With fill_value for missing data
result = ds['col1'].add(ds['col2'], fill_value=0)
```

***


## 比較演算 \{#comparison\}

| Method | Description |
|--------|-------------|
| `eq()` | 等しい |
| `ne()` | 等しくない |
| `lt()` | より小さい |
| `le()` | 以下 |
| `gt()` | より大きい |
| `ge()` | 以上 |
| `equals()` | 等しいかどうかを判定 |
| `compare()` | 差分を表示 |

---

## 関数の適用 \{#application\}

| Method                  | 説明       |
| ----------------------- | -------- |
| `apply()`               | 関数を適用    |
| `applymap()`            | 要素ごとに適用  |
| `map()`                 | 値をマッピング  |
| `agg()` / `aggregate()` | 集約       |
| `transform()`           | 変換       |
| `pipe()`                | 関数をパイプ処理 |
| `groupby()`             | グループ化    |

**例:**

```python
# Apply function
result = ds['name'].apply(lambda x: x.upper())
result = ds.apply(lambda row: row['a'] + row['b'], axis=1)

# Aggregate
result = ds.agg({'col1': 'sum', 'col2': 'mean'})
result = ds.agg(['sum', 'mean', 'std'])

# Pipe
result = (ds
    .pipe(filter_active)
    .pipe(calculate_metrics)
    .pipe(format_output)
)
```

***


## 時系列 \{#timeseries\}

| Method               | Description    |
| -------------------- | -------------- |
| `rolling()`          | ローリングウィンドウ     |
| `expanding()`        | エクスパンディングウィンドウ |
| `ewm()`              | 指数加重ウィンドウ      |
| `resample()`         | 時系列の再サンプリング    |
| `shift()`            | 値をシフト          |
| `asfreq()`           | 頻度を変換          |
| `asof()`             | 指定時点までの最新値     |
| `at_time()`          | 指定時刻を選択        |
| `between_time()`     | 時刻範囲を選択        |
| `first()` / `last()` | 先頭／末尾の期間       |
| `to_period()`        | period 型に変換    |
| `to_timestamp()`     | timestamp 型に変換 |
| `tz_convert()`       | タイムゾーンを変換      |
| `tz_localize()`      | タイムゾーン情報を付与    |

**例:**

```python
# Rolling window
result = ds['value'].rolling(window=7).mean()

# Expanding window
result = ds['value'].expanding().sum()

# Shift
result = ds['value'].shift(1)  # Lag
result = ds['value'].shift(-1)  # Lead
```

***


## 欠損データ \{#missing\}

| メソッド | 説明 |
|--------|-------------|
| `isna()` / `isnull()` | 欠損値を検出 |
| `notna()` / `notnull()` | 非欠損値を検出 |
| `dropna()` | 欠損値を削除 |
| `fillna()` | 欠損値を埋める |
| `ffill()` | 前方に補完 |
| `bfill()` | 後方に補完 |
| `interpolate()` | 補間する |
| `replace()` | 値を置換 |

---

## I/O メソッド \{#io\}

| Method | Description |
|--------|-------------|
| `to_csv()` | CSV にエクスポート |
| `to_json()` | JSON にエクスポート |
| `to_excel()` | Excel にエクスポート |
| `to_parquet()` | Parquet にエクスポート |
| `to_feather()` | Feather にエクスポート |
| `to_sql()` | SQL データベースにエクスポート |
| `to_pickle()` | Pickle 形式にエクスポート |
| `to_html()` | HTML テーブルにエクスポート |
| `to_latex()` | LaTeX テーブルにエクスポート |
| `to_markdown()` | Markdown テーブルにエクスポート |
| `to_string()` | 文字列表現 |
| `to_dict()` | Dictionary 形式 |
| `to_records()` | レコード形式 |
| `to_numpy()` | NumPy 配列 |
| `to_clipboard()` | クリップボードへコピー |

詳細については [I/O Operations](io.md) を参照してください。

---

## 反復 \{#iteration\}

| メソッド | 説明              |
|--------|--------------------------|
| `items()` | (カラム, Series) を反復処理する |
| `iterrows()` | (インデックス, Series) を反復処理する  |
| `itertuples()` | 名前付きタプルとして反復処理する  |

---

## Pandas との主な相違点 \{#differences\}

### 1. 戻り値の型 \{#return-types\}

```python
# Pandas returns Series
pdf['col']  # → pd.Series

# DataStore returns ColumnExpr (lazy)
ds['col']   # → ColumnExpr
```


### 2. 遅延実行 \{#lazy-execution\}

```python
# DataStore operations are lazy
result = ds.filter(ds['age'] > 25)  # Not executed yet
df = result.to_df()  # Executed here
```


### 3. inplace パラメータが存在しない \{#no-inplace-parameter\}

```python
# Pandas
df.drop(columns=['col'], inplace=True)

# DataStore (always returns new object)
ds = ds.drop(columns=['col'])
```


### 4. 結果の比較 \{#comparing-results\}

```python
# Use to_pandas() for comparison
pd.testing.assert_frame_equal(
    ds.to_pandas(),
    expected_df
)
```

詳細については、[主な違い](../guides/pandas-differences.md)を参照してください。

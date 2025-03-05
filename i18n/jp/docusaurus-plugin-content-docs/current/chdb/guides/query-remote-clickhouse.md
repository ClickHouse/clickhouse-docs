---
title: リモートClickHouseサーバーへのクエリ方法
sidebar_label: リモートClickHouseのクエリ
slug: /chdb/guides/query-remote-clickhouse
description: このガイドでは、chDBからリモートClickHouseサーバーへのクエリ方法を学びます。
keywords: [chdb, clickhouse]
---

このガイドでは、chDBからリモートClickHouseサーバーへのクエリ方法を学びます。

## セットアップ {#setup}

まず、仮想環境を作成しましょう：

```bash
python -m venv .venv
source .venv/bin/activate
```

次に、chDBをインストールします。
バージョン2.0.2以上が必要です：

```bash
pip install "chdb>=2.0.2"
```

次に、pandasとipythonをインストールします：

```bash
pip install pandas ipython
```

`ipython`を使用して、残りのガイドでコマンドを実行します。起動するには次のコマンドを実行してください：

```bash
ipython
```

Pythonスクリプトやお気に入りのノートブックでコードを使用することもできます。

## ClickPyの紹介 {#an-intro-to-clickpy}

クエリを行うリモートClickHouseサーバーは[ClickPy](https://clickpy.clickhouse.com)です。
ClickPyは、PyPIパッケージのすべてのダウンロードを追跡し、UIを通じてパッケージの統計を探索できるようにします。
基盤となるデータベースは、`play`ユーザーを使用してクエリ可能です。

ClickPyの詳細については、[そのGitHubリポジトリ](https://github.com/ClickHouse/clickpy)を参照してください。

## ClickPy ClickHouseサービスへのクエリ {#querying-the-clickpy-clickhouse-service}

chDBをインポートしましょう：

```python
import chdb
```

`remoteSecure`関数を使用してClickPyにクエリを投げます。
この関数には、ホスト名、テーブル名、およびユーザー名を最低限指定する必要があります。

次のクエリを書いて、[`openai`パッケージ](https://clickpy.clickhouse.com/dashboard/openai)の日ごとのダウンロード数をPandasのDataFrameとして返します：

```python
query = """
SELECT
    toStartOfDay(date)::Date32 AS x,
    sum(count) AS y
FROM remoteSecure(
  'clickpy-clickhouse.clickhouse.com', 
  'pypi.pypi_downloads_per_day', 
  'play'
)
WHERE project = 'openai'
GROUP BY x
ORDER BY x ASC
"""

openai_df = chdb.query(query, "DataFrame")
openai_df.sort_values(by=["x"], ascending=False).head(n=10)
```

```text
               x        y
2392  2024-10-02  1793502
2391  2024-10-01  1924901
2390  2024-09-30  1749045
2389  2024-09-29  1177131
2388  2024-09-28  1157323
2387  2024-09-27  1688094
2386  2024-09-26  1862712
2385  2024-09-25  2032923
2384  2024-09-24  1901965
2383  2024-09-23  1777554
```

次に、[`scikit-learn`](https://clickpy.clickhouse.com/dashboard/scikit-learn)のダウンロード数を返すために同じことをしましょう：

```python
query = """
SELECT
    toStartOfDay(date)::Date32 AS x,
    sum(count) AS y
FROM remoteSecure(
  'clickpy-clickhouse.clickhouse.com', 
  'pypi.pypi_downloads_per_day', 
  'play'
)
WHERE project = 'scikit-learn'
GROUP BY x
ORDER BY x ASC
"""

sklearn_df = chdb.query(query, "DataFrame")
sklearn_df.sort_values(by=["x"], ascending=False).head(n=10)
```

```text
               x        y
2392  2024-10-02  1793502
2391  2024-10-01  1924901
2390  2024-09-30  1749045
2389  2024-09-29  1177131
2388  2024-09-28  1157323
2387  2024-09-27  1688094
2386  2024-09-26  1862712
2385  2024-09-25  2032923
2384  2024-09-24  1901965
2383  2024-09-23  1777554
```

## Pandas DataFrameのマージ {#merging-pandas-dataframes}

現在、2つのDataFrameがあるので、次のように日付（`x`カラム）を基にマージできます：

```python
df = openai_df.merge(
  sklearn_df, 
  on="x", 
  suffixes=("_openai", "_sklearn")
)
df.head(n=5)
```

```text
            x  y_openai  y_sklearn
0  2018-02-26        83      33971
1  2018-02-27        31      25211
2  2018-02-28         8      26023
3  2018-03-01         8      20912
4  2018-03-02         5      23842
```

次に、Open AIのダウンロード数と`scikit-learn`のダウンロード数の比率を次のように計算できます：

```python
df['ratio'] = df['y_openai'] / df['y_sklearn']
df.head(n=5)
```

```text
            x  y_openai  y_sklearn     ratio
0  2018-02-26        83      33971  0.002443
1  2018-02-27        31      25211  0.001230
2  2018-02-28         8      26023  0.000307
3  2018-03-01         8      20912  0.000383
4  2018-03-02         5      23842  0.000210
```

## Pandas DataFrameのクエリ {#querying-pandas-dataframes}

次に、最良および最悪の比率のある日付を見つけたいとしましょう。
chDBに戻り、これらの値を計算できます：

```python
chdb.query("""
SELECT max(ratio) AS bestRatio,
       argMax(x, ratio) AS bestDate,
       min(ratio) AS worstRatio,
       argMin(x, ratio) AS worstDate
FROM Python(df)
""", "DataFrame")
```

```text
   bestRatio    bestDate  worstRatio   worstDate
0   0.693855  2024-09-19    0.000003  2020-02-09
```

Pandas DataFramesへのクエリの詳細を学びたい場合は、[Pandas DataFrames開発者ガイド](querying-pandas.md)をご覧ください。

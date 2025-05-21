---
title: 'リモートの ClickHouse サーバーにクエリをかける方法'
sidebar_label: 'リモートの ClickHouse をクエリする'
slug: /chdb/guides/query-remote-clickhouse
description: 'このガイドでは、chDB からリモートの ClickHouse サーバーにクエリをかける方法を学びます。'
keywords: ['chdb', 'clickhouse']
---

このガイドでは、chDB からリモートの ClickHouse サーバーにクエリをかける方法を学びます。

## セットアップ {#setup}

まずは仮想環境を作成しましょう：

```bash
python -m venv .venv
source .venv/bin/activate
```

次に chDB をインストールします。
バージョン 2.0.2 以上であることを確認してください：

```bash
pip install "chdb>=2.0.2"
```

次に pandas と ipython をインストールします：

```bash
pip install pandas ipython
```

引き続き、`ipython` を使用してガイドの残りの部分でコマンドを実行します。以下のコマンドで起動できます：

```bash
ipython
```

Python スクリプトまたはお気に入りのノートブックでこのコードを使用することもできます。

## ClickPy の紹介 {#an-intro-to-clickpy}

私たちがクエリをかけるリモートの ClickHouse サーバーは [ClickPy](https://clickpy.clickhouse.com) です。
ClickPy は PyPI パッケージのすべてのダウンロードを追跡し、UI を通じてパッケージの統計を探索できるようにしています。
基盤となるデータベースは `play` ユーザーを使用してクエリが可能です。

ClickPy についての詳細は [GitHub リポジトリ](https://github.com/ClickHouse/clickpy) を参照してください。

## ClickPy ClickHouse サービスにクエリをかける {#querying-the-clickpy-clickhouse-service}

まず chDB をインポートします：

```python
import chdb
```

`remoteSecure` 関数を使って ClickPy にクエリをかけます。
この関数には、ホスト名、テーブル名、およびユーザー名を最低限指定します。

以下のクエリを記述して、[`openai` パッケージ](https://clickpy.clickhouse.com/dashboard/openai) の日ごとのダウンロード数を Pandas DataFrame として返すことができます：

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

次に、同様の手順で [`scikit-learn`](https://clickpy.clickhouse.com/dashboard/scikit-learn) のダウンロードを取得します：

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

## Pandas DataFrame のマージ {#merging-pandas-dataframes}

これで 2 つの DataFrame ができましたので、日付（`x` カラム）に基づいてマージできます：

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

次に、Open AI のダウンロード数と `scikit-learn` のダウンロード数の比率を計算します：

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

## Pandas DataFrame のクエリ {#querying-pandas-dataframes}

次に、最高および最低の比率を持つ日付を探したいとしましょう。
chDB に戻り、それらの値を計算できます：

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

Pandas DataFrame をクエリする方法について詳しく知りたい場合は、[Pandas DataFrames 開発者ガイド](querying-pandas.md)を参照してください。

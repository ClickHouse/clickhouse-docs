---
title: 'リモート ClickHouse サーバーへのクエリ実行方法'
sidebar_label: 'リモート ClickHouse へのクエリ実行'
slug: /chdb/guides/query-remote-clickhouse
description: 'このガイドでは、chDB からリモート ClickHouse サーバーにクエリを実行する方法を説明します。'
keywords: ['chdb', 'clickhouse']
doc_type: 'guide'
---

このガイドでは、chDB からリモート ClickHouse サーバーにクエリを実行する方法について説明します。

## セットアップ {#setup}

まずは仮想環境を作成します。

```bash
python -m venv .venv
source .venv/bin/activate
```

それでは、chDB をインストールします。
バージョン 2.0.2 以上であることを確認してください。

```bash
pip install "chdb>=2.0.2"
```

それでは、pandas と IPython をインストールします。

```bash
pip install pandas ipython
```

このガイドの以降の手順では、`ipython` を使ってコマンドを実行します。次を実行して起動してください:

```bash
ipython
```

このコードは、Python スクリプトやお使いのノートブック環境でも利用できます。

## ClickPy 入門 {#an-intro-to-clickpy}

これからクエリを実行する対象となるリモート ClickHouse サーバーは [ClickPy](https://clickpy.clickhouse.com) です。
ClickPy は PyPI パッケージのすべてのダウンロードを記録し、UI 上からパッケージの統計情報を探索できるようにします。
基盤となるデータベースは `play` ユーザーでクエリできます。

ClickPy について詳しくは、[GitHub リポジトリ](https://github.com/ClickHouse/clickpy)を参照してください。

## ClickPy ClickHouse サービスにクエリを実行する {#querying-the-clickpy-clickhouse-service}

chDB をインポートします：

```python
import chdb
```

`remoteSecure` 関数を使って ClickPy に対してクエリを実行します。
この関数は、少なくともホスト名、テーブル名、ユーザー名を引数として受け取ります。

次のクエリを実行することで、[`openai` package](https://clickpy.clickhouse.com/dashboard/openai) の 1 日あたりのダウンロード数を Pandas の DataFrame として取得できます。

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

では、同じ要領で [`scikit-learn`](https://clickpy.clickhouse.com/dashboard/scikit-learn) のダウンロード数を取得してみましょう。

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

## Pandas の DataFrame を結合する {#merging-pandas-dataframes}

これで 2 つの DataFrame が揃ったので、日付（`x` 列）をキーとして、次のように結合できます。

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

次に、OpenAI のダウンロード数と `scikit-learn` のダウンロード数の比率を、次のように計算します。

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

## Pandas DataFrame をクエリする {#querying-pandas-dataframes}

次に、最も良い比率と最も悪い比率となっている日付を見つけたいとします。
そのために chDB に戻り、それらの値を計算します。

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
   最良比率    最良日付  最悪比率   最悪日付
0   0.693855  2024-09-19    0.000003  2020-02-09
```

Pandas DataFrame へのクエリについて詳しく知りたい場合は、[Pandas DataFrame 開発者ガイド](querying-pandas.md) を参照してください。

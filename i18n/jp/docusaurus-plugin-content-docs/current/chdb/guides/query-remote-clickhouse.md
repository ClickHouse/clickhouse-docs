---
'title': 'リモートClickHouseサーバーのクエリ方法'
'sidebar_label': 'リモートClickHouseのクエリ'
'slug': '/chdb/guides/query-remote-clickhouse'
'description': 'このガイドでは、chDBからリモートClickHouseサーバーにクエリする方法について学びます。'
'keywords':
- 'chdb'
- 'clickhouse'
---



In this guide, we're going to learn how to query a remote ClickHouse server from chDB.

## Setup {#setup}

まず、仮想環境を作成します。

```bash
python -m venv .venv
source .venv/bin/activate
```

次に、chDBをインストールします。
バージョン2.0.2以上であることを確認してください：

```bash
pip install "chdb>=2.0.2"
```

次に、pandasとipythonをインストールします：

```bash
pip install pandas ipython
```

このガイドの残りの部分でコマンドを実行するために、`ipython`を使用します。これを起動するには、次のコマンドを実行します：

```bash
ipython
```

コードをPythonスクリプトやお気に入りのノートブックで使用することもできます。

## An intro to ClickPy {#an-intro-to-clickpy}

私たちがクエリを実行するリモートClickHouseサーバーは[ClickPy](https://clickpy.clickhouse.com)です。
ClickPyはPyPIパッケージのすべてのダウンロードを追跡し、UIを介してパッケージの統計を探索できます。
基礎データベースは`play`ユーザーを使用してクエリが可能です。

ClickPyの詳細については、[GitHubリポジトリ](https://github.com/ClickHouse/clickpy)を参照してください。

## Querying the ClickPy ClickHouse service {#querying-the-clickpy-clickhouse-service}

まずchDBをインポートします：

```python
import chdb
```

`remoteSecure`関数を使ってClickPyにクエリを実行します。
この関数は、ホスト名、テーブル名、ユーザー名を最低限必要とします。

次のクエリを記述して、[`openai`パッケージ](https://clickpy.clickhouse.com/dashboard/openai)の1日あたりのダウンロード数をPandas DataFrameとして返します：

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

次に、[`scikit-learn`](https://clickpy.clickhouse.com/dashboard/scikit-learn)のダウンロード数を返すために同じことを行います：

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

## Merging Pandas DataFrames {#merging-pandas-dataframes}

現在、2つのDataFrameができたので、日付（`x`列）に基づいてマージできます：

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

次に、Open AIのダウンロード数と`scikit-learn`のダウンロード数の比率を計算します：

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

## Querying Pandas DataFrames {#querying-pandas-dataframes}

次に、最高と最低の比率の日付を見つけたいとしましょう。
chDBに戻ってそれらの値を計算できます：

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

Pandas DataFramesのクエリについてさらに学ぶには、[Pandas DataFrames開発者ガイド](querying-pandas.md)を参照してください。

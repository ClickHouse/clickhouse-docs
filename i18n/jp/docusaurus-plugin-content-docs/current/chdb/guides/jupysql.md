---
title: 'JupySQL と chDB'
sidebar_label: 'JupySQL'
slug: /chdb/guides/jupysql
description: 'Bun 用 chDB のインストール方法'
keywords: ['chdb', 'JupySQL']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import PlayersPerRank from '@site/static/images/chdb/guides/players_per_rank.png';

[JupySQL](https://jupysql.ploomber.io/en/latest/quick-start.html) は、Jupyter Notebook と IPython シェル上で SQL を実行できる Python ライブラリです。
このガイドでは、chDB と JupySQL を使ってデータをクエリする方法を学びます。

<div class="vimeo-container">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/2wjl3OijCto?si=EVf2JhjS5fe4j6Cy" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />
</div>


## セットアップ {#setup}

まず、仮想環境を作成しましょう：

```bash
python -m venv .venv
source .venv/bin/activate
```

次に、JupySQL、IPython、Jupyter Labをインストールします：

```bash
pip install jupysql ipython jupyterlab
```

JupySQLはIPythonで使用できます。IPythonは以下のコマンドで起動します：

```bash
ipython
```

または、Jupyter Labで使用する場合は以下のコマンドで起動します：

```bash
jupyter lab
```

:::note
Jupyter Labを使用する場合は、このガイドの残りの手順を進める前にノートブックを作成してください。
:::


## データセットのダウンロード {#downloading-a-dataset}

[Jeff Sackmannのtennis_atp](https://github.com/JeffSackmann/tennis_atp)データセットを使用します。このデータセットには、選手のメタデータと時系列のランキング情報が含まれています。
まず、ランキングファイルをダウンロードします：

```python
from urllib.request import urlretrieve
```

```python
files = ['00s', '10s', '20s', '70s', '80s', '90s', 'current']
base = "https://raw.githubusercontent.com/JeffSackmann/tennis_atp/master"
for file in files:
  _ = urlretrieve(
    f"{base}/atp_rankings_{file}.csv",
    f"atp_rankings_{file}.csv",
  )
```


## chDBとJupySQLの設定 {#configuring-chdb-and-jupysql}

次に、chDB用の`dbapi`モジュールをインポートします：

```python
from chdb import dbapi
```

次に、chDB接続を作成します。
永続化されたデータはすべて`atp.chdb`ディレクトリに保存されます：

```python
conn = dbapi.connect(path="atp.chdb")
```

次に、`sql`マジックコマンドを読み込み、chDBへの接続を作成します：

```python
%load_ext sql
%sql conn --alias chdb
```

次に、クエリ結果が切り捨てられないように表示制限を解除します：

```python
%config SqlMagic.displaylimit = None
```


## CSVファイル内のデータのクエリ {#querying-data-in-csv-files}

`atp_rankings`プレフィックスを持つ複数のファイルをダウンロードしました。
`DESCRIBE`句を使用してスキーマを確認しましょう:

```python
%%sql
DESCRIBE file('atp_rankings*.csv')
SETTINGS describe_compact_output=1,
         schema_inference_make_columns_nullable=0
```

```text
+--------------+-------+
|     name     |  type |
+--------------+-------+
| ranking_date | Int64 |
|     rank     | Int64 |
|    player    | Int64 |
|    points    | Int64 |
+--------------+-------+
```

これらのファイルに対して直接`SELECT`クエリを実行し、データの内容を確認することもできます:

```python
%sql SELECT * FROM file('atp_rankings*.csv') LIMIT 1
```

```text
+--------------+------+--------+--------+
| ranking_date | rank | player | points |
+--------------+------+--------+--------+
|   20000110   |  1   | 101736 |  4135  |
+--------------+------+--------+--------+
```

データの形式が少し不規則です。
日付をクリーンアップし、`REPLACE`句を使用してクリーンアップされた`ranking_date`を返しましょう:

```python
%%sql
SELECT * REPLACE (
  toDate(parseDateTime32BestEffort(toString(ranking_date))) AS ranking_date
)
FROM file('atp_rankings*.csv')
LIMIT 10
SETTINGS schema_inference_make_columns_nullable=0
```

```text
+--------------+------+--------+--------+
| ranking_date | rank | player | points |
+--------------+------+--------+--------+
|  2000-01-10  |  1   | 101736 |  4135  |
|  2000-01-10  |  2   | 102338 |  2915  |
|  2000-01-10  |  3   | 101948 |  2419  |
|  2000-01-10  |  4   | 103017 |  2184  |
|  2000-01-10  |  5   | 102856 |  2169  |
|  2000-01-10  |  6   | 102358 |  2107  |
|  2000-01-10  |  7   | 102839 |  1966  |
|  2000-01-10  |  8   | 101774 |  1929  |
|  2000-01-10  |  9   | 102701 |  1846  |
|  2000-01-10  |  10  | 101990 |  1739  |
+--------------+------+--------+--------+
```


## CSVファイルをchDBにインポートする {#importing-csv-files-into-chdb}

次に、これらのCSVファイルのデータをテーブルに格納します。
デフォルトデータベースはディスク上にデータを永続化しないため、まず別のデータベースを作成する必要があります:

```python
%sql CREATE DATABASE atp
```

次に、CSVファイル内のデータ構造からスキーマが導出される`rankings`というテーブルを作成します:

```python
%%sql
CREATE TABLE atp.rankings
ENGINE=MergeTree
ORDER BY ranking_date AS
SELECT * REPLACE (
  toDate(parseDateTime32BestEffort(toString(ranking_date))) AS ranking_date
)
FROM file('atp_rankings*.csv')
SETTINGS schema_inference_make_columns_nullable=0
```

テーブル内のデータを簡単に確認してみましょう:

```python
%sql SELECT * FROM atp.rankings LIMIT 10
```

```text
+--------------+------+--------+--------+
| ranking_date | rank | player | points |
+--------------+------+--------+--------+
|  2000-01-10  |  1   | 101736 |  4135  |
|  2000-01-10  |  2   | 102338 |  2915  |
|  2000-01-10  |  3   | 101948 |  2419  |
|  2000-01-10  |  4   | 103017 |  2184  |
|  2000-01-10  |  5   | 102856 |  2169  |
|  2000-01-10  |  6   | 102358 |  2107  |
|  2000-01-10  |  7   | 102839 |  1966  |
|  2000-01-10  |  8   | 101774 |  1929  |
|  2000-01-10  |  9   | 102701 |  1846  |
|  2000-01-10  |  10  | 101990 |  1739  |
+--------------+------+--------+--------+
```

問題ありません。出力は予想通り、CSVファイルを直接クエリした場合と同じです。

選手メタデータについても同じプロセスを実行します。
今回はデータがすべて単一のCSVファイルに含まれているため、そのファイルをダウンロードしましょう:

```python
_ = urlretrieve(
    f"{base}/atp_players.csv",
    "atp_players.csv",
)
```

次に、CSVファイルの内容に基づいて`players`というテーブルを作成します。
また、`dob`フィールドを`Date32`型になるようにクリーンアップします。

> ClickHouseでは、`Date`型は1970年以降の日付のみをサポートします。`dob`カラムには1970年以前の日付が含まれているため、代わりに`Date32`型を使用します。

```python
%%sql
CREATE TABLE atp.players
Engine=MergeTree
ORDER BY player_id AS
SELECT * REPLACE (
  makeDate32(
    toInt32OrNull(substring(toString(dob), 1, 4)),
    toInt32OrNull(substring(toString(dob), 5, 2)),
    toInt32OrNull(substring(toString(dob), 7, 2))
  )::Nullable(Date32) AS dob
)
FROM file('atp_players.csv')
SETTINGS schema_inference_make_columns_nullable=0
```

実行が完了したら、取り込んだデータを確認できます:

```python
%sql SELECT * FROM atp.players LIMIT 10
```


```text
+-----------+------------+-----------+------+------------+-----+--------+-------------+
| player_id | name_first | name_last | hand |    dob     | ioc | height | wikidata_id |
+-----------+------------+-----------+------+------------+-----+--------+-------------+
|   100001  |  Gardnar   |   Mulloy  |  R   | 1913-11-22 | USA |  185   |    Q54544   |
|   100002  |   Pancho   |   Segura  |  R   | 1921-06-20 | ECU |  168   |    Q54581   |
|   100003  |   Frank    |  Sedgman  |  R   | 1927-10-02 | AUS |  180   |   Q962049   |
|   100004  |  Giuseppe  |   Merlo   |  R   | 1927-10-11 | ITA |   0    |   Q1258752  |
|   100005  |  Richard   |  Gonzalez |  R   | 1928-05-09 | USA |  188   |    Q53554   |
|   100006  |   Grant    |   Golden  |  R   | 1929-08-21 | USA |  175   |   Q3115390  |
|   100007  |    Abe     |   Segal   |  L   | 1930-10-23 | RSA |   0    |   Q1258527  |
|   100008  |    Kurt    |  Nielsen  |  R   | 1930-11-19 | DEN |   0    |   Q552261   |
|   100009  |   Istvan   |   Gulyas  |  R   | 1931-10-14 | HUN |   0    |    Q51066   |
|   100010  |    Luis    |   Ayala   |  R   | 1932-09-18 | CHI |  170   |   Q1275397  |
+-----------+------------+-----------+------+------------+-----+--------+-------------+
```


## chDBへのクエリ実行 {#querying-chdb}

データの取り込みが完了したので、次は楽しい部分であるデータのクエリ実行です！

テニス選手は、出場するトーナメントでの成績に基づいてポイントを獲得します。
各選手のポイントは52週間のローリング期間で集計されます。
ここでは、各選手が獲得した最大ポイントと、その時点でのランキングを取得するクエリを記述します:

```python
%%sql
SELECT name_first, name_last,
       max(points) as maxPoints,
       argMax(rank, points) as rank,
       argMax(ranking_date, points) as date
FROM atp.players
JOIN atp.rankings ON rankings.player = players.player_id
GROUP BY ALL
ORDER BY maxPoints DESC
LIMIT 10
```

```text
+------------+-----------+-----------+------+------------+
| name_first | name_last | maxPoints | rank |    date    |
+------------+-----------+-----------+------+------------+
|   Novak    |  Djokovic |   16950   |  1   | 2016-06-06 |
|   Rafael   |   Nadal   |   15390   |  1   | 2009-04-20 |
|    Andy    |   Murray  |   12685   |  1   | 2016-11-21 |
|   Roger    |  Federer  |   12315   |  1   | 2012-10-29 |
|   Daniil   |  Medvedev |   10780   |  2   | 2021-09-13 |
|   Carlos   |  Alcaraz  |    9815   |  1   | 2023-08-21 |
|  Dominic   |   Thiem   |    9125   |  3   | 2021-01-18 |
|   Jannik   |   Sinner  |    8860   |  2   | 2024-05-06 |
|  Stefanos  | Tsitsipas |    8350   |  3   | 2021-09-20 |
| Alexander  |   Zverev  |    8240   |  4   | 2021-08-23 |
+------------+-----------+-----------+------+------------+
```

興味深いことに、このリストには多くのポイントを獲得しながらも、そのポイント総数で1位になっていない選手が含まれています。


## クエリの保存 {#saving-queries}

`%%sql`マジックと同じ行で`--save`パラメータを使用することで、クエリを保存できます。
`--no-execute`パラメータを指定すると、クエリの実行がスキップされます。

```python
%%sql --save best_points --no-execute
SELECT name_first, name_last,
       max(points) as maxPoints,
       argMax(rank, points) as rank,
       argMax(ranking_date, points) as date
FROM atp.players
JOIN atp.rankings ON rankings.player = players.player_id
GROUP BY ALL
ORDER BY maxPoints DESC
```

保存されたクエリを実行すると、実行前に共通テーブル式(CTE)に変換されます。
次のクエリでは、ランク1の時に選手が達成した最大ポイントを計算します:

```python
%sql select * FROM best_points WHERE rank=1
```

```text
+-------------+-----------+-----------+------+------------+
|  name_first | name_last | maxPoints | rank |    date    |
+-------------+-----------+-----------+------+------------+
|    Novak    |  Djokovic |   16950   |  1   | 2016-06-06 |
|    Rafael   |   Nadal   |   15390   |  1   | 2009-04-20 |
|     Andy    |   Murray  |   12685   |  1   | 2016-11-21 |
|    Roger    |  Federer  |   12315   |  1   | 2012-10-29 |
|    Carlos   |  Alcaraz  |    9815   |  1   | 2023-08-21 |
|     Pete    |  Sampras  |    5792   |  1   | 1997-08-11 |
|    Andre    |   Agassi  |    5652   |  1   | 1995-08-21 |
|   Lleyton   |   Hewitt  |    5205   |  1   | 2002-08-12 |
|   Gustavo   |  Kuerten  |    4750   |  1   | 2001-09-10 |
| Juan Carlos |  Ferrero  |    4570   |  1   | 2003-10-20 |
|    Stefan   |   Edberg  |    3997   |  1   | 1991-02-25 |
|     Jim     |  Courier  |    3973   |  1   | 1993-08-23 |
|     Ivan    |   Lendl   |    3420   |  1   | 1990-02-26 |
|     Ilie    |  Nastase  |     0     |  1   | 1973-08-27 |
+-------------+-----------+-----------+------+------------+
```


## パラメータを使用したクエリ {#querying-with-parameters}

クエリでパラメータを使用することもできます。
パラメータは通常の変数です：

```python
rank = 10
```

クエリ内では `{{variable}}` 構文を使用できます。
以下のクエリは、初めてトップ10にランクインした日と最後にトップ10にランクインした日の間の日数が最も少ない選手を検索します：

```python
%%sql
SELECT name_first, name_last,
       MIN(ranking_date) AS earliest_date,
       MAX(ranking_date) AS most_recent_date,
       most_recent_date - earliest_date AS days,
       1 + (days/7) AS weeks
FROM atp.rankings
JOIN atp.players ON players.player_id = rankings.player
WHERE rank <= {{rank}}
GROUP BY ALL
ORDER BY days
LIMIT 10
```

```text
+------------+-----------+---------------+------------------+------+-------+
| name_first | name_last | earliest_date | most_recent_date | days | weeks |
+------------+-----------+---------------+------------------+------+-------+
|    Alex    | Metreveli |   1974-06-03  |    1974-06-03    |  0   |   1   |
|   Mikael   |  Pernfors |   1986-09-22  |    1986-09-22    |  0   |   1   |
|   Felix    |  Mantilla |   1998-06-08  |    1998-06-08    |  0   |   1   |
|   Wojtek   |   Fibak   |   1977-07-25  |    1977-07-25    |  0   |   1   |
|  Thierry   |  Tulasne  |   1986-08-04  |    1986-08-04    |  0   |   1   |
|   Lucas    |  Pouille  |   2018-03-19  |    2018-03-19    |  0   |   1   |
|    John    | Alexander |   1975-12-15  |    1975-12-15    |  0   |   1   |
|  Nicolas   |   Massu   |   2004-09-13  |    2004-09-20    |  7   |   2   |
|   Arnaud   |  Clement  |   2001-04-02  |    2001-04-09    |  7   |   2   |
|  Ernests   |   Gulbis  |   2014-06-09  |    2014-06-23    |  14  |   3   |
+------------+-----------+---------------+------------------+------+-------+
```


## ヒストグラムのプロット {#plotting-histograms}

JupySQLには限定的なグラフ作成機能もあります。
箱ひげ図やヒストグラムを作成できます。

ヒストグラムを作成しますが、まず各選手が達成したトップ100以内のランキングを計算するクエリを記述（および保存）しましょう。
これを使用して、各ランキングを達成した選手の数をカウントするヒストグラムを作成できます:

```python
%%sql --save players_per_rank --no-execute
select distinct player, rank
FROM atp.rankings
WHERE rank <= 100
```

次に、以下を実行してヒストグラムを作成できます:

```python
from sql.ggplot import ggplot, geom_histogram, aes

plot = (
  ggplot(
    table="players_per_rank",
    with_="players_per_rank",
    mapping=aes(x="rank", fill="#69f0ae", color="#fff"),
  ) + geom_histogram(bins=100)
)
```

<Image
  img={PlayersPerRank}
  size='md'
  alt='ATPデータセットにおける選手ランキングのヒストグラム'
/>

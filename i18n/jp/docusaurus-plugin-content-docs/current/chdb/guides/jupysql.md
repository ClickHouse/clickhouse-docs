---
'title': 'JupySQL と chDB'
'sidebar_label': 'JupySQL'
'slug': '/chdb/guides/jupysql'
'description': 'Bun 用の chDB をインストールする方法'
'keywords':
- 'chdb'
- 'JupySQL'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import PlayersPerRank from '@site/static/images/chdb/guides/players_per_rank.png';

[JupySQL](https://jupysql.ploomber.io/en/latest/quick-start.html) は、Jupyter ノートブックおよび IPython シェルで SQL を実行できる Python ライブラリです。このガイドでは、chDB と JupySQL を使用してデータをクエリする方法を学びます。

<div class='vimeo-container'>
<iframe width="560" height="315" src="https://www.youtube.com/embed/2wjl3OijCto?si=EVf2JhjS5fe4j6Cy" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## セットアップ {#setup}

まず、仮想環境を作成します：

```bash
python -m venv .venv
source .venv/bin/activate
```

次に、JupySQL、IPython、Jupyter Lab をインストールします：

```bash
pip install jupysql ipython jupyterlab
```

IPython で JupySQL を使用でき、以下のように起動できます：

```bash
ipython
```

または、Jupyter Lab で以下を実行できます：

```bash
jupyter lab
```

:::note
Jupyter Lab を使用している場合は、ガイドの残りの部分に従う前にノートブックを作成する必要があります。
:::

## データセットのダウンロード {#downloading-a-dataset}

[Jeff Sackmann の tennis_atp](https://github.com/JeffSackmann/tennis_atp) データセットの一つを使用します。このデータセットには、選手とそのランキングに関するメタデータが含まれています。まず、ランキングファイルをダウンロードします：

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

## chDB と JupySQL の設定 {#configuring-chdb-and-jupysql}

次に、chDB の `dbapi` モジュールをインポートします：

```python
from chdb import dbapi
```

そして、chDB 接続を作成します。永続化するデータは、`atp.chdb` ディレクトリに保存されます：

```python
conn = dbapi.connect(path="atp.chdb")
```

次に、`sql` マジックをロードし、chDB への接続を作成します：

```python
%load_ext sql
%sql conn --alias chdb
```

次に、クエリの結果が途中で切れないように表示制限を表示します：

```python
%config SqlMagic.displaylimit = None
```

## CSV ファイルでのデータクエリ {#querying-data-in-csv-files}

`atp_rankings` プレフィックスのファイルをいくつかダウンロードしました。`DESCRIBE` 句を使用してスキーマを理解しましょう：

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

これらのファイルに対して直接 `SELECT` クエリを書いて、データの内容を確認します：

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

データの形式は少し奇妙です。この日付をクリーンアップし、`REPLACE` 句を使用してクリーンアップされた `ranking_date` を返します：

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

## CSV ファイルを chDB にインポート {#importing-csv-files-into-chdb}

これらの CSV ファイルのデータをテーブルに保存します。デフォルトのデータベースはディスク上にデータを永続化しないため、まず別のデータベースを作成する必要があります：

```python
%sql CREATE DATABASE atp
```

次に、CSV ファイルの内容に基づいてスキーマを持つ `rankings` というテーブルを作成します：

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

テーブル内のデータの簡単なチェックを行います：

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

良い感じです - 出力は期待通り、CSV ファイルを直接クエリしたときと同じです。

選手メタデータについても同様のプロセスを行います。今回はデータが1つのCSVファイルにすべて含まれているため、そのファイルをダウンロードします：

```python
_ = urlretrieve(
    f"{base}/atp_players.csv",
    "atp_players.csv",
)
```

そして、CSVファイルの内容に基づいて `players` というテーブルを作成します。`dob` フィールドを `Date32` 型にクリーンアップします。

> ClickHouse では、`Date` 型は 1970 年以降の日付のみをサポートします。`dob` 列には 1970 年以前の日付が含まれているため、代わりに `Date32` 型を使用します。

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

それが完了したら、取り込んだデータを見てみましょう：

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

## chDB のクエリ {#querying-chdb}

データの取り込みが完了しました。さあ、データをクエリする楽しい部分に入ります！

テニス選手は、出場するトーナメントでのパフォーマンスに基づいてポイントを得ます。各選手の52週間のロール期間にわたってポイントを集計しています。各選手が獲得した最大ポイントとその時のランキングを見つけるクエリを書きます：

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

このリストにある選手の中には、ポイントの合計が 1 位ではないにもかかわらず、大量のポイントを獲得した選手がいるのは非常に興味深いです。

## クエリの保存 {#saving-queries}

クエリを保存するために、`%%sql` マジックと同じ行に `--save` パラメータを使用できます。`--no-execute` パラメータは、クエリの実行をスキップします。

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

保存したクエリを実行すると、それは実行前に共通テーブル式 (CTE) に変換されます。次のクエリでは、ランキング 1 位のときに選手が達成した最大ポイントを計算します：

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

## パラメータを持つクエリ {#querying-with-parameters}

クエリ内でパラメータを使用することもできます。パラメータは単なる通常の変数です：

```python
rank = 10
```

次に、クエリ内で `{{variable}}` 構文を使用します。以下のクエリは、選手が初めてトップ 10 にランクインしたときと最後にトップ 10 にランクインしたときの間の日数が最も少なかった選手を見つけます：

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

JupySQL には限られたチャート機能もあります。ボックスプロットやヒストグラムを作成できます。

ヒストグラムを作成しますが、その前に、各選手が達成したトップ 100 のランキングを計算するクエリを書いて（保存もします）、そのデータを使用して何人の選手が各ランクに達成したかをカウントするヒストグラムを作成します：

```python
%%sql --save players_per_rank --no-execute
select distinct player, rank
FROM atp.rankings
WHERE rank <= 100
```

次に、以下のコマンドを実行してヒストグラムを作成します：

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

<Image img={PlayersPerRank} size="md" alt="ATP データセットの選手ランキングのヒストグラム" />

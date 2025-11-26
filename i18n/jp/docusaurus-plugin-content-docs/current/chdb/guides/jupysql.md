---
title: 'JupySQL と chDB'
sidebar_label: 'JupySQL'
slug: /chdb/guides/jupysql
description: 'Bun 用の chDB をインストールする方法'
keywords: ['chdb', 'JupySQL']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import PlayersPerRank from '@site/static/images/chdb/guides/players_per_rank.png';

[JupySQL](https://jupysql.ploomber.io/en/latest/quick-start.html) は、Jupyter Notebook と IPython シェルで SQL を実行できる Python ライブラリです。
このガイドでは、chDB と JupySQL を使ってデータにクエリを実行する方法を学びます。

<div class="vimeo-container">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/2wjl3OijCto?si=EVf2JhjS5fe4j6Cy" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />
</div>


## セットアップ

まずは仮想環境を作成します。

```bash
python -m venv .venv
source .venv/bin/activate
```

次に、JupySQL、IPython、および JupyterLab をインストールします。

```bash
pip install jupysql ipython jupyterlab
```

次のコマンドを実行して起動する IPython で JupySQL を使用できます。

```bash
ipython
```

または JupyterLab で次を実行します：

```bash
jupyter lab
```

:::note
JupyterLab を使用している場合は、以降の手順を進める前にノートブックを作成する必要があります。
:::


## データセットのダウンロード

[Jeff Sackmann の tennis&#95;atp](https://github.com/JeffSackmann/tennis_atp) データセットのひとつを使用します。このデータセットには、選手と時間の経過とともに変化するランキングに関するメタデータが含まれています。
まずはランキングファイルをダウンロードしましょう。

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


## chDB と JupySQL の設定

次に、chDB 用の `dbapi` モジュールをインポートします。

```python
from chdb import dbapi
```

次に chDB 接続を作成します。
永続化されるデータはすべて `atp.chdb` ディレクトリに保存されます。

```python
conn = dbapi.connect(path="atp.chdb")
```

それでは `sql` マジックを読み込み、chDB への接続を作成しましょう。

```python
%load_ext sql
%sql conn --alias chdb
```

次に、クエリ結果が途中で切り捨てられないよう、表示制限を変更します。

```python
%config SqlMagic.displaylimit = None
```


## CSV ファイルのデータをクエリする

`atp_rankings` というプレフィックスを持つファイルをいくつかダウンロードしました。
スキーマを理解するために `DESCRIBE` 句を使って確認してみましょう。

```python
%%sql
DESCRIBE file('atp_rankings*.csv')
SETTINGS describe_compact_output=1,
         schema_inference_make_columns_nullable=0
```

```text
+--------------+-------+
|     名前     |  型   |
+--------------+-------+
| ranking_date | Int64 |
|     rank     | Int64 |
|    player    | Int64 |
|    points    | Int64 |
+--------------+-------+
```

これらのファイルに対して `SELECT` クエリを直接実行して、どのようなデータかを確認することもできます。

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

データの形式が少し変わっています。
その日付を整形し、`REPLACE` 句を使用して整形済みの `ranking_date` を返しましょう。

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


## CSV ファイルを chDB にインポートする

これらの CSV ファイルに含まれるデータをテーブルに保存していきます。
デフォルトのデータベースはディスク上にデータを永続化しないため、まず新しいデータベースを作成する必要があります。

```python
%sql CREATE DATABASE atp
```

次に、CSV ファイル内のデータ構造に基づいてスキーマを自動推論する `rankings` テーブルを作成します。

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

テーブル内のデータを簡単に確認してみましょう。

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

問題ありません。出力は期待どおり、CSV ファイルを直接クエリした場合と同じです。

同じ手順をプレイヤーのメタデータにも適用します。
今回はデータがすべて 1 つの CSV ファイルに含まれているので、そのファイルをダウンロードしましょう：

```python
_ = urlretrieve(
    f"{base}/atp_players.csv",
    "atp_players.csv",
)
```

次に、CSV ファイルの内容に基づいて `players` という名前のテーブルを作成します。
また、`dob` フィールドを整えて、`Date32` 型にします。

> ClickHouse では、`Date` 型は 1970 年以降の日付のみをサポートします。`dob` カラムには 1970 年より前の日付が含まれているため、代わりに `Date32` 型を使用します。

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

処理が完了したら、取り込んだデータを確認します。

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


## chDB をクエリする

データのインジェストが完了したので、ここからはいよいよデータをクエリしていきます。

テニス選手は、参加したトーナメントでの成績に応じてポイントを獲得します。
各選手のポイントは、直近 52 週間のローリング期間で管理されます。
各選手ごとに、その期間中に到達した累積ポイントの最大値と、その時点でのランキングを求めるクエリを書いていきます。

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
| 名 | 姓 | 最高ポイント | ランク |    日付    |
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

このリストの一部のプレイヤーは、その得点では1位になっていないにもかかわらず、多くのポイントを獲得しているというのは、なかなか興味深いことです。


## クエリの保存

`%%sql` マジックと同じ行で `--save` パラメータを使用して、クエリを保存できます。
`--no-execute` パラメータは、クエリの実行をスキップすることを意味します。

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

保存済みクエリを実行すると、実行前に共通テーブル式（CTE）に変換されます。
次のクエリでは、ランキングで 1 位だったときにプレイヤーが獲得した最大ポイントを計算します。

```python
%sql select * FROM best_points WHERE rank=1
```

```text
+-------------+-----------+-----------+------+------------+
|  名_first | 名_last | 最大ポイント | ランク |    日付    |
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


## パラメーターを使用したクエリ

クエリ内でパラメーターを使用することもできます。
パラメーターは通常の変数と同じように扱えます。

```python
rank = 10
```

そしてクエリ内で `{{variable}}` 構文を使用できるようになります。
次のクエリは、初めてトップ 10 にランクインした日から最後にトップ 10 にランクインした日までの「経過日数」が最も短い選手を検索します。

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
| 名 | 姓 | 最古の日付 | 最新の日付 | 日数 | 週数 |
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


## ヒストグラムのプロット

JupySQL には限定的ではありますが、グラフ描画機能もあります。
箱ひげ図やヒストグラムを作成できます。

ここではヒストグラムを作成しますが、その前に、各プレイヤーが達成したトップ 100 以内での順位を計算するクエリを作成して保存します。
これを使って、各順位を達成したプレイヤーの人数をカウントするヒストグラムを作成できるようになります。

```python
%%sql --save players_per_rank --no-execute
select distinct player, rank
FROM atp.rankings
WHERE rank <= 100
```

次に、以下のコマンドを実行してヒストグラムを作成します。

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

<Image img={PlayersPerRank} size="md" alt="ATP データセットにおける選手ランク分布のヒストグラム" />

---
'title': 'JupySQL 및 chDB'
'sidebar_label': 'JupySQL'
'slug': '/chdb/guides/jupysql'
'description': 'Bun에 대해 chDB를 설치하는 방법'
'keywords':
- 'chdb'
- 'JupySQL'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import PlayersPerRank from '@site/static/images/chdb/guides/players_per_rank.png';

[JupySQL](https://jupysql.ploomber.io/en/latest/quick-start.html)은 Jupyter 노트북 및 IPython 셸에서 SQL을 실행할 수 있게 해주는 Python 라이브러리입니다. 이 가이드에서는 chDB 및 JupySQL을 사용하여 데이터를 쿼리하는 방법을 배워볼 것입니다.

<div class='vimeo-container'>
<iframe width="560" height="315" src="https://www.youtube.com/embed/2wjl3OijCto?si=EVf2JhjS5fe4j6Cy" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## Setup {#setup}

먼저 가상 환경을 생성해 봅시다:

```bash
python -m venv .venv
source .venv/bin/activate
```

그리고 JupySQL, IPython 및 Jupyter Lab을 설치하겠습니다:

```bash
pip install jupysql ipython jupyterlab
```

JupySQL은 IPython에서 사용할 수 있으며, 다음 명령어를 실행하여 시작할 수 있습니다:

```bash
ipython
```

또는 Jupyter Lab에서 다음 명령어를 실행하여 시작할 수 있습니다:

```bash
jupyter lab
```

:::note
Jupyter Lab을 사용하는 경우 나머지 가이드를 따르기 전에 노트북을 생성해야 합니다.
:::

## Downloading a dataset {#downloading-a-dataset}

[Jeff Sackmann의 tennis_atp](https://github.com/JeffSackmann/tennis_atp) 데이터셋 중 하나를 사용할 것입니다. 이 데이터셋에는 선수와 그들의 순위에 대한 메타데이터가 포함되어 있습니다. 순위 파일부터 다운로드하겠습니다:

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

## Configuring chDB and JupySQL {#configuring-chdb-and-jupysql}

다음으로 chDB의 `dbapi` 모듈을 임포트하겠습니다:

```python
from chdb import dbapi
```

그리고 chDB 연결을 생성하겠습니다. 우리가 지속할 데이터는 `atp.chdb` 디렉토리에 저장됩니다:

```python
conn = dbapi.connect(path="atp.chdb")
```

이제 `sql` 매직을 로드하고 chDB에 대한 연결을 생성해봅시다:

```python
%load_ext sql
%sql conn --alias chdb
```

다음으로 쿼리의 결과가 잘리도록 제한을 표시하겠습니다:

```python
%config SqlMagic.displaylimit = None
```

## Querying data in CSV files {#querying-data-in-csv-files}

`atp_rankings` 접두사가 붙은 여러 파일을 다운로드했습니다. `DESCRIBE` 절을 사용하여 스키마를 이해해 보겠습니다:

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

이 파일들에 대해 직접 `SELECT` 쿼리를 작성하여 데이터가 어떻게 생겼는지 확인할 수 있습니다:

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

데이터 형식이 약간 이상합니다. 날짜를 정리하고 `REPLACE` 절을 사용하여 정리된 `ranking_date`를 반환해 보겠습니다:

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

## Importing CSV files into chDB {#importing-csv-files-into-chdb}

이제 이러한 CSV 파일의 데이터를 테이블에 저장할 것입니다. 기본 데이터베이스는 디스크에 데이터를 저장하지 않기 때문에, 먼저 다른 데이터베이스를 생성해야 합니다:

```python
%sql CREATE DATABASE atp
```

이제 CSV 파일의 데이터 구조에서 파생된 스키마를 가진 `rankings`라는 테이블을 생성하겠습니다:

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

테이블의 데이터에 대해 간단히 확인해 봅시다:

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

좋습니다 - 출력 결과는 예상한 대로 CSV 파일을 직접 쿼리할 때와 동일합니다.

선수 메타데이터에 대한 동일한 프로세스를 따를 것입니다. 이번에는 데이터가 하나의 CSV 파일에 모두 포함되어 있으므로 해당 파일을 다운로드하겠습니다:

```python
_ = urlretrieve(
    f"{base}/atp_players.csv",
    "atp_players.csv",
)
```

그리고 CSV 파일의 내용을 기반으로 `players`라는 테이블을 생성합니다. `dob` 필드를 정리하여 `Date32` 유형으로 만들겠습니다.

> ClickHouse에서 `Date` 유형은 1970년 이후의 날짜만 지원합니다. `dob` 열에는 1970년 이전의 날짜가 포함되어 있으므로 대신 `Date32` 유형을 사용하겠습니다.

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

작업이 완료되면 우리가 수집한 데이터를 살펴보겠습니다:

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

## Querying chDB {#querying-chdb}

데이터 수집이 완료되었습니다. 이제 재미있는 부분 - 데이터를 쿼리해 보겠습니다!

테니스 선수들은 자신이 참가한 토너먼트에서의 성과에 따라 포인트를 받습니다. 각각의 선수는 52주 롤링 기간 동안 획득한 포인트를 기록합니다. 각 선수의 최대 포인트와 그 시점의 순위를 찾는 쿼리를 작성하겠습니다:

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

흥미로운 점은 이 목록에 있는 일부 선수들이 총 포인트가 1위가 아님에도 불구하고 많은 포인트를 축적했다는 것입니다.

## Saving queries {#saving-queries}

`--save` 매개변수를 사용하여 쿼리를 저장할 수 있습니다. 이는 `%%sql` 매직과 동일한 줄에 위치해야 합니다. `--no-execute` 매개변수는 쿼리 실행이 건너뛰어진다는 것을 의미합니다.

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

저장된 쿼리를 실행하면 Common Table Expression (CTE)으로 변환된 후 실행됩니다. 다음 쿼리는 1위일 때 선수들이 얻은 최대 포인트를 계산합니다:

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

## Querying with parameters {#querying-with-parameters}

쿼리에서 매개변수를 사용할 수도 있습니다. 매개변수는 일반 변수입니다:

```python
rank = 10
```

그러면 쿼리에서 `{{variable}}` 구문을 사용할 수 있습니다. 다음 쿼리는 선수가 Top 10에 첫 번째 순위를 기록한 날과 마지막 순위를 기록한 날 사이의 최소 일수를 찾습니다:

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

## Plotting histograms {#plotting-histograms}

JupySQL은 제한된 차트 기능도 제공합니다. 박스 플롯이나 히스토그램을 생성할 수 있습니다.

히스토그램을 생성할 것이지만, 먼저 각 선수가 달성한 상위 100위 내 순위를 계산하는 쿼리를 작성 (및 저장) 하겠습니다. 이를 통해 얼마나 많은 선수가 각 순위를 달성했는지 세는 히스토그램을 만들 수 있을 것입니다:

```python
%%sql --save players_per_rank --no-execute
select distinct player, rank
FROM atp.rankings
WHERE rank <= 100
```

그런 다음 다음 명령어로 히스토그램을 생성할 수 있습니다:

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

<Image img={PlayersPerRank} size="md" alt="ATP 데이터셋에서 선수 순위의 히스토그램" />

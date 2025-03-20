---
title: JupySQL и chDB
sidebar_label: JupySQL
slug: /chdb/guides/jupysql
description: Как установить chDB для Bun
keywords: [chdb, JupySQL]
---

import PlayersPerRank from '@site/static/images/chdb/guides/players_per_rank.png';

[JupySQL](https://jupysql.ploomber.io/en/latest/quick-start.html) - это библиотека Python, которая позволяет выполнять SQL в Jupyter ноутбуках и оболочке IPython. 
В этом руководстве мы научимся выполнять запросы к данным, используя chDB и JupySQL. 

<div class='vimeo-container'>
<iframe width="560" height="315" src="https://www.youtube.com/embed/2wjl3OijCto?si=EVf2JhjS5fe4j6Cy" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

## Настройка {#setup}

Сначала создадим виртуальное окружение: 

```bash
python -m venv .venv
source .venv/bin/activate
```

А затем установим JupySQL, IPython и Jupyter Lab: 

```bash
pip install jupysql ipython jupyterlab
```

Мы можем использовать JupySQL в IPython, который можно запустить, выполнив: 

```bash
ipython
```

Или в Jupyter Lab, выполнив: 

```bash
jupyter lab
```

:::note
Если вы используете Jupyter Lab, вам необходимо создать ноутбук, прежде чем следовать остальной части руководства.
:::

## Скачивание набора данных {#downloading-a-dataset}

Мы будем использовать один из [наборов данных tennis_atp](https://github.com/JeffSackmann/tennis_atp) Джеффа Сакмана, который содержит метаданные о игроках и их рейтингах с течением времени. 
Начнем с загрузки файлов с рейтингами: 

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

## Конфигурирование chDB и JupySQL {#configuring-chdb-and-jupysql}

Следующим шагом импортируем модуль `dbapi` для chDB: 

```python
from chdb import dbapi
```

И создадим подключение к chDB. 
Любые данные, которые мы сохраним, будут сохранены в директории `atp.chdb`: 

```python
conn = dbapi.connect(path="atp.chdb")
```

Теперь загрузим магию `sql` и создадим подключение к chDB: 

```python
%load_ext sql
%sql conn --alias chdb
```

Затем отобразим лимит отображения, чтобы результаты запросов не обрезались: 

```python
%config SqlMagic.displaylimit = None
```

## Выполнение запросов к данным в CSV файлах {#querying-data-in-csv-files}

Мы скачали ряд файлов с префиксом `atp_rankings`. 
Давайте использовать оператор `DESCRIBE`, чтобы понять схему: 

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

Мы также можем написать запрос `SELECT` непосредственно к этим файлам, чтобы посмотреть, как выглядят данные: 

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

Формат данных немного странный. 
Давайте очистим эту дату и используем оператор `REPLACE`, чтобы вернуть отформатированную `ranking_date`: 

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

## Импорт CSV файлов в chDB {#importing-csv-files-into-chdb}

Теперь мы собираемся сохранить данные из этих CSV файлов в таблицу. 
По умолчанию база данных не сохраняет данные на диске, поэтому нам сначала нужно создать другую базу данных: 

```python
%sql CREATE DATABASE atp
```

А теперь создадим таблицу под названием `rankings`, структура которой будет определяться на основе содержимого CSV файлов: 

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

Давайте быстро проверим данные в нашей таблице: 

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

Выглядит неплохо - вывод, как и ожидалось, совпадает с выводом при запросе к CSV файлам напрямую.

Следующим шагом мы будем следовать тому же процессу для метаданных игроков. 
На этот раз данные находятся в одном CSV файле, поэтому давайте загрузим этот файл: 

```python
_ = urlretrieve(
    f"{base}/atp_players.csv",
    "atp_players.csv",
)
```

А затем создадим таблицу под названием `players` на основе содержимого CSV файла. 
Мы также очистим поле `dob`, чтобы оно имело тип `Date32`.

> В ClickHouse тип `Date` поддерживает только даты с 1970 года и позже. Поскольку колонка `dob` содержит даты до 1970 года, мы будем использовать тип `Date32`.

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

После завершения процесса мы можем взглянуть на данные, которые мы загрузили: 

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

## Запросы к chDB {#querying-chdb}

Загрузка данных завершена, теперь пришло время интересной части - выполнения запросов к данным!

Теннисные игроки получают очки в зависимости от того, насколько хорошо они выступают на турнирах, в которых участвуют. 
Очки для каждого игрока начисляются в течение 52-недельного периода. 
Мы напишем запрос, который находит максимальное количество очков, накопленных каждым игроком, вместе с их рейтингом на тот момент: 

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

Довольно интересно, что некоторые игроки из этого списка накопили много очков, не будучи номером 1 с этой суммой очков.

## Сохранение запросов {#saving-queries}

Мы можем сохранять запросы, используя параметр `--save` на одной строке с магией `%%sql`. 
Параметр `--no-execute` означает, что выполнение запроса будет пропущено.

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

Когда мы запускаем сохраненный запрос, он будет преобразован в Общий Табличный Выражение (CTE) перед выполнением. 
В следующем запросе мы вычисляем максимальные очки, достигнутые игроками, когда они были на первом месте:

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

## Запросы с параметрами {#querying-with-parameters}

Мы также можем использовать параметры в наших запросах. 
Параметры - это обычные переменные: 

```python
rank = 10
```

А затем мы можем использовать синтаксис `{{variable}}` в нашем запросе. 
Следующий запрос находит игроков, которые имели наименьшее количество дней между первым рейтингом в топ-10 и последним рейтингом в топ-10:

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

## Построение гистограмм {#plotting-histograms}

JupySQL также имеет ограниченные функции построения графиков. 
Мы можем создавать боковые диаграммы или гистограммы.

Мы собираемся создать гистограмму, но сначала давайте напишем (и сохраним) запрос, который вычисляет рейтинги в пределах топ-100, которых достиг каждый игрок. 
Мы сможем использовать это для создания гистограммы, которая подсчитывает, сколько игроков достигли каждого рейтинга:

```python
%%sql --save players_per_rank --no-execute
select distinct player, rank
FROM atp.rankings
WHERE rank <= 100
```

Затем мы можем создать гистограмму, выполнив следующее:

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

<img src={PlayersPerRank} alt="Гистограмма рейтингов игроков в наборе данных ATP" class="image" style={{width: '90%', padding: '30px'}} />

---
title: 如何使用 chDB 查询 Pandas DataFrame
sidebar_label: 查询 Pandas
slug: /chdb/guides/pandas
description: 学习如何使用 chDB 查询 Pandas DataFrame
keywords: [chdb, pandas]
---

[Pandas](https://pandas.pydata.org/) 是一个流行的 Python 数据处理和分析库。
在 chDB 的第 2 个版本中，我们提升了查询 Pandas DataFrame 的性能，并引入了 `Python` 表函数。
在本指南中，我们将学习如何使用 `Python` 表函数查询 Pandas。

## 设置 {#setup}

首先，让我们创建一个虚拟环境：

```bash
python -m venv .venv
source .venv/bin/activate
```

现在我们将安装 chDB。
确保您安装的版本为 2.0.2 或更高：

```bash
pip install "chdb>=2.0.2"
```

接下来，我们将安装 Pandas 和其他几个库：

```bash
pip install pandas requests ipython
```

我们将使用 `ipython` 来运行本指南中的命令，您可以通过运行以下命令启动：

```bash
ipython
```

您也可以在 Python 脚本或您喜欢的笔记本中使用这些代码。

## 从 URL 创建 Pandas DataFrame {#creating-a-pandas-dataframe-from-a-url}

我们将从 [StatsBomb GitHub 仓库](https://github.com/statsbomb/open-data/tree/master?tab=readme-ov-file) 查询一些数据。
首先，导入 requests 和 pandas：

```python
import requests
import pandas as pd
```

然后，我们将加载其中一个比赛的 JSON 文件到 DataFrame：

```python
response = requests.get(
  "https://raw.githubusercontent.com/statsbomb/open-data/master/data/matches/223/282.json"
)
matches_df = pd.json_normalize(response.json(), sep='_')
```

让我们看一下我们将要处理的数据：

```python
matches_df.iloc[0]
```

```text
match_id                                                                  3943077
match_date                                                             2024-07-15
kick_off                                                             04:15:00.000
home_score                                                                      1
away_score                                                                      0
match_status                                                            available
match_status_360                                                      unscheduled
last_updated                                           2024-07-15T15:50:08.671355
last_updated_360                                                             None
match_week                                                                      6
competition_competition_id                                                    223
competition_country_name                                            South America
competition_competition_name                                         Copa America
season_season_id                                                              282
season_season_name                                                           2024
home_team_home_team_id                                                        779
home_team_home_team_name                                                Argentina
home_team_home_team_gender                                                   male
home_team_home_team_group                                                    None
home_team_country_id                                                           11
home_team_country_name                                                  Argentina
home_team_managers              [{'id': 5677, 'name': 'Lionel Sebastián Scalon...
away_team_away_team_id                                                        769
away_team_away_team_name                                                 Colombia
away_team_away_team_gender                                                   male
away_team_away_team_group                                                    None
away_team_country_id                                                           49
away_team_country_name                                                   Colombia
away_team_managers              [{'id': 5905, 'name': 'Néstor Gabriel Lorenzo'...
metadata_data_version                                                       1.1.0
metadata_shot_fidelity_version                                                  2
metadata_xy_fidelity_version                                                    2
competition_stage_id                                                           26
competition_stage_name                                                      Final
stadium_id                                                                   5337
stadium_name                                                    Hard Rock Stadium
stadium_country_id                                                            241
stadium_country_name                                     United States of America
referee_id                                                                   2638
referee_name                                                        Raphael Claus
referee_country_id                                                             31
referee_country_name                                                       Brazil
Name: 0, dtype: object
```

接下来，我们将加载其中一个事件的 JSON 文件，并在 DataFrame 中添加一列 `match_id`：

```python
response = requests.get(
  "https://raw.githubusercontent.com/statsbomb/open-data/master/data/events/3943077.json"
)
events_df = pd.json_normalize(response.json(), sep='_')
events_df["match_id"] = 3943077
```

再一次，让我们看一下第一行的数据：

```python
with pd.option_context("display.max_rows", None):
    first_row = events_df.iloc[0]
    non_nan_columns = first_row[first_row.notna()].T
    display(non_nan_columns)
```

```text
id                                   279b7d66-92b5-4daa-8ff6-cba8fce271d9
index                                                                   1
period                                                                  1
timestamp                                                    00:00:00.000
minute                                                                  0
second                                                                  0
possession                                                              1
duration                                                              0.0
type_id                                                                35
type_name                                                     Starting XI
possession_team_id                                                    779
possession_team_name                                            Argentina
play_pattern_id                                                         1
play_pattern_name                                            Regular Play
team_id                                                               779
team_name                                                       Argentina
tactics_formation                                                   442.0
tactics_lineup          [{'player': {'id': 6909, 'name': 'Damián Emili...
match_id                                                          3943077
Name: 0, dtype: object
```

## 查询 Pandas DataFrames {#querying-pandas-dataframes}

接下来，让我们看看如何使用 chDB 查询这些 DataFrames。 
我们将导入该库：

```python
import chdb
```

我们可以通过使用 `Python` 表函数查询 Pandas DataFrames：

```sql
SELECT *
FROM Python(<name-of-variable>)
```

因此，如果我们想列出 `matches_df` 中的列，我们可以写如下：

```python
chdb.query("""
DESCRIBE Python(matches_df)
SETTINGS describe_compact_output=1
""", "DataFrame")
```

```text
                              name    type
0                         match_id   Int64
1                       match_date  String
2                         kick_off  String
3                       home_score   Int64
4                       away_score   Int64
5                     match_status  String
6                 match_status_360  String
7                     last_updated  String
8                 last_updated_360  String
9                       match_week   Int64
10      competition_competition_id   Int64
11        competition_country_name  String
12    competition_competition_name  String
13                season_season_id   Int64
14              season_season_name  String
15          home_team_home_team_id   Int64
16        home_team_home_team_name  String
17      home_team_home_team_gender  String
18       home_team_home_team_group  String
19            home_team_country_id   Int64
20          home_team_country_name  String
21              home_team_managers  String
22          away_team_away_team_id   Int64
23        away_team_away_team_name  String
24      away_team_away_team_gender  String
25       away_team_away_team_group  String
26            away_team_country_id   Int64
27          away_team_country_name  String
28              away_team_managers  String
29           metadata_data_version  String
30  metadata_shot_fidelity_version  String
31    metadata_xy_fidelity_version  String
32            competition_stage_id   Int64
33          competition_stage_name  String
34                      stadium_id   Int64
35                    stadium_name  String
36              stadium_country_id   Int64
37            stadium_country_name  String
38                      referee_id   Int64
39                    referee_name  String
40              referee_country_id   Int64
41            referee_country_name  String
```

然后我们可以找出哪些裁判执法了超过一场比赛，方法是写如下查询：

```python
chdb.query("""
SELECT referee_name, count() AS count
FROM Python(matches_df)
GROUP BY ALL
HAVING count > 1
ORDER BY count DESC
""", "DataFrame")
```

```text
                    referee_name  count
0  César Arturo Ramos Palazuelos      3
1               Maurizio Mariani      3
2               Piero Maza Gomez      3
3     Mario Alberto Escobar Toca      2
4  Wilmar Alexander Roldán Pérez      2
5          Jesús Valenzuela Sáez      2
6         Wilton Pereira Sampaio      2
7                  Darío Herrera      2
8                 Andrés Matonte      2
9                  Raphael Claus      2
```

现在，让我们探索一下 `events_df`。

```python
chdb.query("""
SELECT pass_recipient_name, count()
FROM Python(events_df)
WHERE type_name = 'Pass' AND pass_recipient_name <> ''
GROUP BY ALL
ORDER BY count() DESC
LIMIT 10
""", "DataFrame")
```

```text
               pass_recipient_name  count()
0            Davinson Sánchez Mina       76
1  Ángel Fabián Di María Hernández       64
2              Alexis Mac Allister       62
3                   Enzo Fernandez       57
4      James David Rodríguez Rubio       56
5      Johan Andrés Mojica Palacio       55
6           Rodrigo Javier De Paul       54
7     Jefferson Andrés Lerma Solís       53
8        Jhon Adolfo Arias Andrade       52
9  Carlos Eccehomo Cuesta Figueroa       50
```

## 连接 Pandas DataFrames {#joining-pandas-dataframes}

我们还可以在查询中将 DataFrames 连接在一起。
例如，若要获取比赛的概述，我们可以写如下查询：

```python
chdb.query("""
SELECT home_team_home_team_name, away_team_away_team_name, home_score, away_score,
       countIf(type_name = 'Pass' AND possession_team_id=home_team_home_team_id) AS home_passes,
       countIf(type_name = 'Pass' AND possession_team_id=away_team_away_team_id) AS away_passes,
       countIf(type_name = 'Shot' AND possession_team_id=home_team_home_team_id) AS home_shots,
       countIf(type_name = 'Shot' AND possession_team_id=away_team_away_team_id) AS away_shots
FROM Python(matches_df) AS matches
JOIN Python(events_df) AS events ON events.match_id = matches.match_id
GROUP BY ALL
LIMIT 5
""", "DataFrame").iloc[0]
```

```text
home_team_home_team_name    Argentina
away_team_away_team_name     Colombia
home_score                          1
away_score                          0
home_passes                       527
away_passes                       669
home_shots                         11
away_shots                         19
Name: 0, dtype: object
```

## 从 DataFrame 填充表格 {#populating-a-table-from-a-dataframe}

我们还可以从 DataFrames 创建并填充 ClickHouse 表。
如果我们想在 chDB 中创建一个表，我们需要使用状态会话 API。

让我们导入会话模块：

```python
from chdb import session as chs
```

初始化会话：

```python
sess = chs.Session()
```

接下来，我们将创建一个数据库：

```python
sess.query("CREATE DATABASE statsbomb")
```

然后，基于 `events_df` 创建一个 `events` 表：

```python
sess.query("""
CREATE TABLE statsbomb.events ORDER BY id AS
SELECT * 
FROM Python(events_df)
""")
```

然后，我们可以运行查询以获取接收最多传球的球员：

```python
sess.query("""
SELECT pass_recipient_name, count()
FROM statsbomb.events
WHERE type_name = 'Pass' AND pass_recipient_name <> ''
GROUP BY ALL
ORDER BY count() DESC
LIMIT 10
""", "DataFrame")
```

```text
               pass_recipient_name  count()
0            Davinson Sánchez Mina       76
1  Ángel Fabián Di María Hernández       64
2              Alexis Mac Allister       62
3                   Enzo Fernandez       57
4      James David Rodríguez Rubio       56
5      Johan Andrés Mojica Palacio       55
6           Rodrigo Javier De Paul       54
7     Jefferson Andrés Lerma Solís       53
8        Jhon Adolfo Arias Andrade       52
9  Carlos Eccehomo Cuesta Figueroa       50
```

## 连接 Pandas DataFrame 和表格 {#joining-a-pandas-dataframe-and-table}

最后，我们还可以更新我们的连接查询，将 `matches_df` DataFrame 与 `statsbomb.events` 表连接：

```python
sess.query("""
SELECT home_team_home_team_name, away_team_away_team_name, home_score, away_score,
       countIf(type_name = 'Pass' AND possession_team_id=home_team_home_team_id) AS home_passes,
       countIf(type_name = 'Pass' AND possession_team_id=away_team_away_team_id) AS away_passes,
       countIf(type_name = 'Shot' AND possession_team_id=home_team_home_team_id) AS home_shots,
       countIf(type_name = 'Shot' AND possession_team_id=away_team_away_team_id) AS away_shots
FROM Python(matches_df) AS matches
JOIN statsbomb.events AS events ON events.match_id = matches.match_id
GROUP BY ALL
LIMIT 5
""", "DataFrame").iloc[0]
```

```text
home_team_home_team_name    Argentina
away_team_away_team_name     Colombia
home_score                          1
away_score                          0
home_passes                       527
away_passes                       669
home_shots                         11
away_shots                         19
Name: 0, dtype: object
```

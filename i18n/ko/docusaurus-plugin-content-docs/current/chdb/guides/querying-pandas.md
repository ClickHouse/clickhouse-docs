---
'title': 'chDB로 Pandas DataFrame 쿼리하기'
'sidebar_label': 'Pandas 쿼리하기'
'slug': '/chdb/guides/pandas'
'description': 'chDB로 Pandas DataFrame을 쿼리하는 방법을 배우세요'
'keywords':
- 'chDB'
- 'Pandas'
'show_related_blogs': true
'doc_type': 'guide'
---

[Pandas](https://pandas.pydata.org/)는 Python에서 데이터 조작 및 분석을 위한 인기 있는 라이브러리입니다. chDB 버전 2에서는 Pandas DataFrame 쿼리 성능을 개선하고 `Python` 테이블 함수를 도입했습니다. 이 가이드를 통해 `Python` 테이블 함수를 사용하여 Pandas를 쿼리하는 방법을 배우게 됩니다.

## Setup {#setup}

먼저 가상 환경을 생성하겠습니다:

```bash
python -m venv .venv
source .venv/bin/activate
```

이제 chDB를 설치하겠습니다. 버전 2.0.2 이상이 설치되어 있는지 확인하세요:

```bash
pip install "chdb>=2.0.2"
```

그 다음 Pandas와 몇 가지 라이브러리를 설치하겠습니다:

```bash
pip install pandas requests ipython
```

이제 나머지 가이드의 명령을 실행하기 위해 `ipython`을 사용할 예정입니다. 아래 명령을 실행하여 시작할 수 있습니다:

```bash
ipython
```

또한 Python 스크립트나 좋아하는 노트북에서 코드를 사용할 수 있습니다.

## Creating a Pandas DataFrame from a URL {#creating-a-pandas-dataframe-from-a-url}

[StatsBomb GitHub repository](https://github.com/statsbomb/open-data/tree/master?tab=readme-ov-file)에서 데이터를 쿼리할 것입니다. 먼저 requests와 pandas를 임포트하겠습니다:

```python
import requests
import pandas as pd
```

그 후, 경기 JSON 파일 중 하나를 DataFrame으로 로드하겠습니다:

```python
response = requests.get(
  "https://raw.githubusercontent.com/statsbomb/open-data/master/data/matches/223/282.json"
)
matches_df = pd.json_normalize(response.json(), sep='_')
```

어떤 데이터를 사용할지 살펴보겠습니다:

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

다음으로, 이벤트 JSON 파일 중 하나를 로드하고 해당 DataFrame에 `match_id`라는 컬럼을 추가하겠습니다:

```python
response = requests.get(
  "https://raw.githubusercontent.com/statsbomb/open-data/master/data/events/3943077.json"
)
events_df = pd.json_normalize(response.json(), sep='_')
events_df["match_id"] = 3943077
```

다시 한 번 첫 번째 행을 살펴보겠습니다:

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

## Querying Pandas DataFrames {#querying-pandas-dataframes}

다음으로, chDB를 사용하여 이러한 DataFrame을 쿼리하는 방법을 살펴보겠습니다. 라이브러리를 임포트하겠습니다:

```python
import chdb
```

Pandas DataFrame을 `Python` 테이블 함수를 사용하여 쿼리할 수 있습니다:

```sql
SELECT *
FROM Python(<name-of-variable>)
```

따라서 `matches_df`의 컬럼 목록을 나열하고 싶다면 다음과 같이 작성할 수 있습니다:

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

그런 다음, 한 경기 이상 주심을 맡은 심판을 찾는 쿼리를 작성할 수 있습니다:

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

이제 `events_df`를 탐색해 보겠습니다.

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

## Joining Pandas DataFrames {#joining-pandas-dataframes}

쿼리에서 DataFrame을 함께 조인할 수도 있습니다. 예를 들어, 경기 개요를 얻기 위해 다음 쿼리를 작성할 수 있습니다:

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

## Populating a table from a DataFrame {#populating-a-table-from-a-dataframe}

DataFrame에서 ClickHouse 테이블을 생성하고 채울 수도 있습니다. chDB에서 테이블을 생성하려면 Stateful Session API를 사용해야 합니다.

세션 모듈을 임포트하겠습니다:

```python
from chdb import session as chs
```

세션을 초기화합니다:

```python
sess = chs.Session()
```

다음으로, 데이터베이스를 생성하겠습니다:

```python
sess.query("CREATE DATABASE statsbomb")
```

그런 다음, `events_df`를 기반으로 `events` 테이블을 생성합니다:

```python
sess.query("""
CREATE TABLE statsbomb.events ORDER BY id AS
SELECT * 
FROM Python(events_df)
""")
```

그 후, 최상위 패스 수신자를 반환하는 쿼리를 실행할 수 있습니다:

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

## Joining a Pandas DataFrame and table {#joining-a-pandas-dataframe-and-table}

마지막으로, `matches_df` DataFrame을 `statsbomb.events` 테이블과 조인하는 쿼리를 업데이트할 수 있습니다:

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

---
slug: '/interfaces/formats/CSVWithNamesAndTypes'
description: 'Документация для формата CSVWithNamesAndTypes'
title: CSVWithNamesAndTypes
keywords: ['CSVWithNamesAndTypes']
doc_type: reference
input_format: true
output_format: true
---
| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Также печатает две строки заголовка с названиями и типами колонок, аналогично [TabSeparatedWithNamesAndTypes](../formats/TabSeparatedWithNamesAndTypes).

## Пример использования {#example-usage}

### Вставка данных {#inserting-data}

:::tip
Начиная с [версии](https://github.com/ClickHouse/ClickHouse/releases) 23.1, ClickHouse будет автоматически определять заголовки в CSV-файлах при использовании формата `CSV`, поэтому нет необходимости использовать `CSVWithNames` или `CSVWithNamesAndTypes`.
:::

Используя следующий CSV-файл, названный `football_types.csv`:

```csv
date,season,home_team,away_team,home_team_goals,away_team_goals
Date,Int16,LowCardinality(String),LowCardinality(String),Int8,Int8
2022-04-30,2021,Sutton United,Bradford City,1,4
2022-04-30,2021,Swindon Town,Barrow,2,1
2022-04-30,2021,Tranmere Rovers,Oldham Athletic,2,0
2022-05-02,2021,Salford City,Mansfield Town,2,2
2022-05-02,2021,Port Vale,Newport County,1,2
2022-05-07,2021,Barrow,Northampton Town,1,3
2022-05-07,2021,Bradford City,Carlisle United,2,0
2022-05-07,2021,Bristol Rovers,Scunthorpe United,7,0
2022-05-07,2021,Exeter City,Port Vale,0,1
2022-05-07,2021,Harrogate Town A.F.C.,Sutton United,0,2
2022-05-07,2021,Hartlepool United,Colchester United,0,2
2022-05-07,2021,Leyton Orient,Tranmere Rovers,0,1
2022-05-07,2021,Mansfield Town,Forest Green Rovers,2,2
2022-05-07,2021,Newport County,Rochdale,0,2
2022-05-07,2021,Oldham Athletic,Crawley Town,3,3
2022-05-07,2021,Stevenage Borough,Salford City,4,2
2022-05-07,2021,Walsall,Swindon Town,0,3
```

Создайте таблицу:

```sql
CREATE TABLE football
(
    `date` Date,
    `season` Int16,
    `home_team` LowCardinality(String),
    `away_team` LowCardinality(String),
    `home_team_goals` Int8,
    `away_team_goals` Int8
)
ENGINE = MergeTree
ORDER BY (date, home_team);
```

Вставьте данные, используя формат `CSVWithNamesAndTypes`:

```sql
INSERT INTO football FROM INFILE 'football_types.csv' FORMAT CSVWithNamesAndTypes;
```

### Чтение данных {#reading-data}

Чтите данные, используя формат `CSVWithNamesAndTypes`:

```sql
SELECT *
FROM football
FORMAT CSVWithNamesAndTypes
```

Выход будет в формате CSV с двумя строками заголовка для названий и типов колонок:

```csv
"date","season","home_team","away_team","home_team_goals","away_team_goals"
"Date","Int16","LowCardinality(String)","LowCardinality(String)","Int8","Int8"
"2022-04-30",2021,"Sutton United","Bradford City",1,4
"2022-04-30",2021,"Swindon Town","Barrow",2,1
"2022-04-30",2021,"Tranmere Rovers","Oldham Athletic",2,0
"2022-05-02",2021,"Port Vale","Newport County",1,2
"2022-05-02",2021,"Salford City","Mansfield Town",2,2
"2022-05-07",2021,"Barrow","Northampton Town",1,3
"2022-05-07",2021,"Bradford City","Carlisle United",2,0
"2022-05-07",2021,"Bristol Rovers","Scunthorpe United",7,0
"2022-05-07",2021,"Exeter City","Port Vale",0,1
"2022-05-07",2021,"Harrogate Town A.F.C.","Sutton United",0,2
"2022-05-07",2021,"Hartlepool United","Colchester United",0,2
"2022-05-07",2021,"Leyton Orient","Tranmere Rovers",0,1
"2022-05-07",2021,"Mansfield Town","Forest Green Rovers",2,2
"2022-05-07",2021,"Newport County","Rochdale",0,2
"2022-05-07",2021,"Oldham Athletic","Crawley Town",3,3
"2022-05-07",2021,"Stevenage Borough","Salford City",4,2
"2022-05-07",2021,"Walsall","Swindon Town",0,3
```

## Настройки формата {#format-settings}

:::note
Если настройка [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в `1`, колонки из входных данных будут сопоставляться с колонками из таблицы по их названиям, колонки с неизвестными названиями будут пропущены, если настройка [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в `1`. В противном случае первая строка будет пропущена.
:::

:::note
Если настройка [input_format_with_types_use_header](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) установлена в `1`, типы из входных данных будут сравниваться с типами соответствующих колонок из таблицы. В противном случае вторая строка будет пропущена.
:::
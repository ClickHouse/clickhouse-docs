---
alias: ['TSVRawWithNamesAndTypes', 'RawWithNamesAndTypes']
description: 'Документация по формату TabSeparatedRawWithNamesAndTypes'
input_format: true
keywords: ['TabSeparatedRawWithNamesAndTypes', 'TSVRawWithNamesAndTypes', 'RawWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/TabSeparatedRawWithNamesAndTypes
title: 'TabSeparatedRawWithNamesAndTypes'
doc_type: 'reference'
---

| Вход | Выход | Псевдоним                                         |
|------|-------|----------------------------------------------------|
| ✔    | ✔     | `TSVRawWithNamesAndNames`, `RawWithNamesAndNames` |



## Описание {#description}

Отличается от формата [`TabSeparatedWithNamesAndTypes`](./TabSeparatedWithNamesAndTypes.md) тем,
что строки записываются без экранирования.

:::note
При разборе данных в этом формате символы табуляции и перевода строки не допускаются в полях.
:::


## Пример использования {#example-usage}

### Вставка данных {#inserting-data}

Используя следующий TSV-файл с именем `football.tsv`:

```tsv
date    season  home_team       away_team       home_team_goals away_team_goals
Date    Int16   LowCardinality(String)  LowCardinality(String)  Int8    Int8
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```

Вставка данных:

```sql
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparatedRawWithNamesAndTypes;
```

### Чтение данных {#reading-data}

Чтение данных в формате `TabSeparatedRawWithNamesAndTypes`:

```sql
SELECT *
FROM football
FORMAT TabSeparatedRawWithNamesAndTypes
```

Вывод будет представлен в формате с разделением табуляцией и двумя строками заголовков для имён и типов столбцов:


```tsv
date    season  home_team       away_team       home_team_goals away_team_goals
Date    Int16   LowCardinality(String)  LowCardinality(String)  Int8    Int8
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```


## Настройки формата {#format-settings}

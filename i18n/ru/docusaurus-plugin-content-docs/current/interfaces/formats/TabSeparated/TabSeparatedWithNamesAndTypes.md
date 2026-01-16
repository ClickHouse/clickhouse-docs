---
description: 'Документация по формату TabSeparatedWithNamesAndTypes'
keywords: ['TabSeparatedWithNamesAndTypes']
slug: /interfaces/formats/TabSeparatedWithNamesAndTypes
title: 'TabSeparatedWithNamesAndTypes'
doc_type: 'reference'
---

| Входные данные | Выходные данные | Псевдоним                                     |
|----------------|-----------------|-----------------------------------------------|
|       ✔        |        ✔        | `TSVWithNamesAndTypes`, `RawWithNamesAndTypes` |

## Описание \{#description\}

Отличается от формата [`TabSeparated`](./TabSeparated.md) тем, что имена столбцов записываются в первую строку, а типы столбцов — во вторую.

:::note
- Если настройка [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в значение `1`,
столбцы из входных данных будут сопоставляться со столбцами в таблице по их именам, а столбцы с неизвестными именами будут пропущены, если настройка [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в значение `1`.
В противном случае первая строка будет пропущена.
- Если настройка [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) установлена в значение `1`,
типы из входных данных будут сравниваться с типами соответствующих столбцов таблицы. В противном случае вторая строка будет пропущена.
:::

## Пример использования \{#example-usage\}

### Вставка данных \{#inserting-data\}

Используем следующий TSV-файл с именем `football.tsv`:

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

Вставьте данные:

```sql
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparatedWithNamesAndTypes;
```

### Чтение данных \{#reading-data\}

Прочитайте данные в формате `TabSeparatedWithNamesAndTypes`:

```sql
SELECT *
FROM football
FORMAT TabSeparatedWithNamesAndTypes
```

Вывод будет в формате с разделителями табуляции и двумя строками заголовков для имен столбцов и их типов:

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

## Параметры формата \{#format-settings\}
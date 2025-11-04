---
slug: '/interfaces/formats/TabSeparatedWithNamesAndTypes'
description: 'Документация для формата TabSeparatedWithNamesAndTypes'
title: TabSeparatedWithNamesAndTypes
keywords: ['TabSeparatedWithNamesAndTypes']
doc_type: reference
---
| Input | Output | Alias                                          |
|-------|--------|------------------------------------------------|
|     ✔    |     ✔     | `TSVWithNamesAndTypes`, `RawWithNamesAndTypes` |

## Описание {#description}

Отличается от формата [`TabSeparated`](./TabSeparated.md) тем, что имена колонок записываются в первую строку, а типы колонок находятся во второй строке.

:::note
- Если настройка [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в `1`,
колонки из входных данных будут сопоставлены с колонками в таблице по их именам, колонки с неизвестными именами будут пропущены, если настройка [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в 1.
В противном случае первая строка будет пропущена.
- Если настройка [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) установлена в `1`,
типы входных данных будут сравниваться с типами соответствующих колонок из таблицы. В противном случае вторая строка будет пропущена.
:::

## Пример использования {#example-usage}

### Вставка данных {#inserting-data}

Используя следующий tsv файл, названный `football.tsv`:

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

### Чтение данных {#reading-data}

Читать данные, используя формат `TabSeparatedWithNamesAndTypes`:

```sql
SELECT *
FROM football
FORMAT TabSeparatedWithNamesAndTypes
```

Вывод будет в формате с разделителями табуляции с двумя строками заголовков для имен колонок и типов:

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
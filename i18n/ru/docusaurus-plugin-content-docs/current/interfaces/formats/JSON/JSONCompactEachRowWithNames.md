---
alias: []
description: 'Документация по формату JSONCompactEachRowWithNames'
input_format: true
keywords: ['JSONCompactEachRowWithNames']
output_format: true
slug: /interfaces/formats/JSONCompactEachRowWithNames
title: 'JSONCompactEachRowWithNames'
doc_type: 'reference'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание \\{#description\\}

Отличается от формата [`JSONCompactEachRow`](./JSONCompactEachRow.md) тем, что также выводит строку заголовка с именами столбцов, аналогично формату [`TabSeparatedWithNames`](../TabSeparated/TabSeparatedWithNames.md).

## Пример использования \\{#example-usage\\}

### Вставка данных \\{#inserting-data\\}

Используйте JSON-файл со следующими данными с именем `football.json`:

```json
["date", "season", "home_team", "away_team", "home_team_goals", "away_team_goals"]
["2022-04-30", 2021, "Sutton United", "Bradford City", 1, 4]
["2022-04-30", 2021, "Swindon Town", "Barrow", 2, 1]
["2022-04-30", 2021, "Tranmere Rovers", "Oldham Athletic", 2, 0]
["2022-05-02", 2021, "Port Vale", "Newport County", 1, 2]
["2022-05-02", 2021, "Salford City", "Mansfield Town", 2, 2]
["2022-05-07", 2021, "Barrow", "Northampton Town", 1, 3]
["2022-05-07", 2021, "Bradford City", "Carlisle United", 2, 0]
["2022-05-07", 2021, "Bristol Rovers", "Scunthorpe United", 7, 0]
["2022-05-07", 2021, "Exeter City", "Port Vale", 0, 1]
["2022-05-07", 2021, "Harrogate Town A.F.C.", "Sutton United", 0, 2]
["2022-05-07", 2021, "Hartlepool United", "Colchester United", 0, 2]
["2022-05-07", 2021, "Leyton Orient", "Tranmere Rovers", 0, 1]
["2022-05-07", 2021, "Mansfield Town", "Forest Green Rovers", 2, 2]
["2022-05-07", 2021, "Newport County", "Rochdale", 0, 2]
["2022-05-07", 2021, "Oldham Athletic", "Crawley Town", 3, 3]
["2022-05-07", 2021, "Stevenage Borough", "Salford City", 4, 2]
["2022-05-07", 2021, "Walsall", "Swindon Town", 0, 3]
```

Добавьте данные:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONCompactEachRowWithNames;
```

### Чтение данных \\{#reading-data\\}

Считывайте данные в формате `JSONCompactEachRowWithNames`:

```sql
SELECT *
FROM football
FORMAT JSONCompactEachRowWithNames
```

Результат будет в формате JSON:

```json
["date", "season", "home_team", "away_team", "home_team_goals", "away_team_goals"]
["2022-04-30", 2021, "Sutton United", "Bradford City", 1, 4]
["2022-04-30", 2021, "Swindon Town", "Barrow", 2, 1]
["2022-04-30", 2021, "Tranmere Rovers", "Oldham Athletic", 2, 0]
["2022-05-02", 2021, "Port Vale", "Newport County", 1, 2]
["2022-05-02", 2021, "Salford City", "Mansfield Town", 2, 2]
["2022-05-07", 2021, "Barrow", "Northampton Town", 1, 3]
["2022-05-07", 2021, "Bradford City", "Carlisle United", 2, 0]
["2022-05-07", 2021, "Bristol Rovers", "Scunthorpe United", 7, 0]
["2022-05-07", 2021, "Exeter City", "Port Vale", 0, 1]
["2022-05-07", 2021, "Harrogate Town A.F.C.", "Sutton United", 0, 2]
["2022-05-07", 2021, "Hartlepool United", "Colchester United", 0, 2]
["2022-05-07", 2021, "Leyton Orient", "Tranmere Rovers", 0, 1]
["2022-05-07", 2021, "Mansfield Town", "Forest Green Rovers", 2, 2]
["2022-05-07", 2021, "Newport County", "Rochdale", 0, 2]
["2022-05-07", 2021, "Oldham Athletic", "Crawley Town", 3, 3]
["2022-05-07", 2021, "Stevenage Borough", "Salford City", 4, 2]
["2022-05-07", 2021, "Walsall", "Swindon Town", 0, 3]
```

## Настройки формата \\{#format-settings\\}

:::note
Если настройка [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) равна 1,
столбцы из входных данных будут сопоставлены со столбцами таблицы по их именам, а столбцы с неизвестными именами будут пропускаться, если настройка [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) равна 1.
В противном случае первая строка будет пропущена.
:::
---
alias: []
description: 'Документация по формату JSONCompactStringsEachRowWithNames'
input_format: true
keywords: ['JSONCompactStringsEachRowWithNames']
output_format: true
slug: /interfaces/formats/JSONCompactStringsEachRowWithNames
title: 'JSONCompactStringsEachRowWithNames'
doc_type: 'reference'
---

| Входные данные | Выходные данные | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |



## Description {#description}

Отличается от формата [`JSONCompactEachRow`](./JSONCompactEachRow.md) тем, что дополнительно выводит строку заголовка с именами столбцов, аналогично формату [TabSeparatedWithNames](../TabSeparated/TabSeparatedWithNames.md).


## Пример использования {#example-usage}

### Вставка данных {#inserting-data}

Используйте JSON-файл со следующими данными с именем `football.json`:

```json
["date", "season", "home_team", "away_team", "home_team_goals", "away_team_goals"]
["2022-04-30", "2021", "Sutton United", "Bradford City", "1", "4"]
["2022-04-30", "2021", "Swindon Town", "Barrow", "2", "1"]
["2022-04-30", "2021", "Tranmere Rovers", "Oldham Athletic", "2", "0"]
["2022-05-02", "2021", "Port Vale", "Newport County", "1", "2"]
["2022-05-02", "2021", "Salford City", "Mansfield Town", "2", "2"]
["2022-05-07", "2021", "Barrow", "Northampton Town", "1", "3"]
["2022-05-07", "2021", "Bradford City", "Carlisle United", "2", "0"]
["2022-05-07", "2021", "Bristol Rovers", "Scunthorpe United", "7", "0"]
["2022-05-07", "2021", "Exeter City", "Port Vale", "0", "1"]
["2022-05-07", "2021", "Harrogate Town A.F.C.", "Sutton United", "0", "2"]
["2022-05-07", "2021", "Hartlepool United", "Colchester United", "0", "2"]
["2022-05-07", "2021", "Leyton Orient", "Tranmere Rovers", "0", "1"]
["2022-05-07", "2021", "Mansfield Town", "Forest Green Rovers", "2", "2"]
["2022-05-07", "2021", "Newport County", "Rochdale", "0", "2"]
["2022-05-07", "2021", "Oldham Athletic", "Crawley Town", "3", "3"]
["2022-05-07", "2021", "Stevenage Borough", "Salford City", "4", "2"]
["2022-05-07", "2021", "Walsall", "Swindon Town", "0", "3"]
```

Вставка данных:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONCompactStringsEachRowWithNames;
```

### Чтение данных {#reading-data}

Чтение данных с использованием формата `JSONCompactStringsEachRowWithNames`:

```sql
SELECT *
FROM football
FORMAT JSONCompactStringsEachRowWithNames
```

Результат будет выведен в формате JSON:


```json
["date", "season", "home_team", "away_team", "home_team_goals", "away_team_goals"]
["2022-04-30", "2021", "Sutton United", "Bradford City", "1", "4"]
["2022-04-30", "2021", "Swindon Town", "Barrow", "2", "1"]
["2022-04-30", "2021", "Tranmere Rovers", "Oldham Athletic", "2", "0"]
["2022-05-02", "2021", "Port Vale", "Newport County", "1", "2"]
["2022-05-02", "2021", "Salford City", "Mansfield Town", "2", "2"]
["2022-05-07", "2021", "Barrow", "Northampton Town", "1", "3"]
["2022-05-07", "2021", "Bradford City", "Carlisle United", "2", "0"]
["2022-05-07", "2021", "Bristol Rovers", "Scunthorpe United", "7", "0"]
["2022-05-07", "2021", "Exeter City", "Port Vale", "0", "1"]
["2022-05-07", "2021", "Harrogate Town A.F.C.", "Sutton United", "0", "2"]
["2022-05-07", "2021", "Hartlepool United", "Colchester United", "0", "2"]
["2022-05-07", "2021", "Leyton Orient", "Tranmere Rovers", "0", "1"]
["2022-05-07", "2021", "Mansfield Town", "Forest Green Rovers", "2", "2"]
["2022-05-07", "2021", "Newport County", "Rochdale", "0", "2"]
["2022-05-07", "2021", "Oldham Athletic", "Crawley Town", "3", "3"]
["2022-05-07", "2021", "Stevenage Borough", "Salford City", "4", "2"]
["2022-05-07", "2021", "Walsall", "Swindon Town", "0", "3"]
```


## Настройки формата {#format-settings}

:::note
Если параметр [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) установлен в `1`,
столбцы из входных данных будут сопоставлены со столбцами таблицы по именам. Столбцы с неизвестными именами будут пропущены, если параметр [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлен в `1`.
В противном случае первая строка будет пропущена.
:::

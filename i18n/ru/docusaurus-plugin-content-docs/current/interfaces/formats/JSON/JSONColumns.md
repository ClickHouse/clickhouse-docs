---
alias: []
description: 'Документация по формату JSONColumns'
input_format: true
keywords: ['JSONColumns']
output_format: true
slug: /interfaces/formats/JSONColumns
title: 'JSONColumns'
doc_type: 'reference'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |



## Description {#description}

:::tip
Вывод форматов JSONColumns\* содержит имя поля ClickHouse, а затем содержимое каждой строки таблицы для этого поля;
визуально данные повёрнуты на 90 градусов влево.
:::

В этом формате все данные представлены в виде одного объекта JSON.

:::note
Формат `JSONColumns` буферизует все данные в памяти и затем выводит их единым блоком, что может привести к высокому потреблению памяти.
:::


## Пример использования {#example-usage}

### Вставка данных {#inserting-data}

Используем JSON-файл со следующими данными с именем `football.json`:

```json
{
  "date": [
    "2022-04-30",
    "2022-04-30",
    "2022-04-30",
    "2022-05-02",
    "2022-05-02",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07",
    "2022-05-07"
  ],
  "season": [
    2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021,
    2021, 2021, 2021, 2021, 2021
  ],
  "home_team": [
    "Sutton United",
    "Swindon Town",
    "Tranmere Rovers",
    "Port Vale",
    "Salford City",
    "Barrow",
    "Bradford City",
    "Bristol Rovers",
    "Exeter City",
    "Harrogate Town A.F.C.",
    "Hartlepool United",
    "Leyton Orient",
    "Mansfield Town",
    "Newport County",
    "Oldham Athletic",
    "Stevenage Borough",
    "Walsall"
  ],
  "away_team": [
    "Bradford City",
    "Barrow",
    "Oldham Athletic",
    "Newport County",
    "Mansfield Town",
    "Northampton Town",
    "Carlisle United",
    "Scunthorpe United",
    "Port Vale",
    "Sutton United",
    "Colchester United",
    "Tranmere Rovers",
    "Forest Green Rovers",
    "Rochdale",
    "Crawley Town",
    "Salford City",
    "Swindon Town"
  ],
  "home_team_goals": [1, 2, 2, 1, 2, 1, 2, 7, 0, 0, 0, 0, 2, 0, 3, 4, 0],
  "away_team_goals": [4, 1, 0, 2, 2, 3, 0, 0, 1, 2, 2, 1, 2, 2, 3, 2, 3]
}
```

Вставка данных:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONColumns;
```

### Чтение данных {#reading-data}

Чтение данных с использованием формата `JSONColumns`:

```sql
SELECT *
FROM football
FORMAT JSONColumns
```

Результат будет выведен в формате JSON:


```json
{
    "date": ["2022-04-30", "2022-04-30", "2022-04-30", "2022-05-02", "2022-05-02", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07"],
    "season": [2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021],
    "home_team": ["Sutton United", "Swindon Town", "Tranmere Rovers", "Port Vale", "Salford City", "Barrow", "Bradford City", "Bristol Rovers", "Exeter City", "Harrogate Town A.F.C.", "Hartlepool United", "Leyton Orient", "Mansfield Town", "Newport County", "Oldham Athletic", "Stevenage Borough", "Walsall"],
    "away_team": ["Bradford City", "Barrow", "Oldham Athletic", "Newport County", "Mansfield Town", "Northampton Town", "Carlisle United", "Scunthorpe United", "Port Vale", "Sutton United", "Colchester United", "Tranmere Rovers", "Forest Green Rovers", "Rochdale", "Crawley Town", "Salford City", "Swindon Town"],
    "home_team_goals": [1, 2, 2, 1, 2, 1, 2, 7, 0, 0, 0, 0, 2, 0, 3, 4, 0],
    "away_team_goals": [4, 1, 0, 2, 2, 3, 0, 0, 1, 2, 2, 1, 2, 2, 3, 2, 3]
}
```


## Настройки формата {#format-settings}

При импорте столбцы с неизвестными именами будут пропускаться, если настройка [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в `1`.
Столбцы, отсутствующие в блоке, будут заполнены значениями по умолчанию (для этого можно использовать настройку [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields))

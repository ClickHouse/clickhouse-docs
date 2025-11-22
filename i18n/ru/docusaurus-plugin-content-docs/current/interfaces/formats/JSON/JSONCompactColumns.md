---
alias: []
description: 'Документация по формату JSONCompactColumns'
input_format: true
keywords: ['JSONCompactColumns']
output_format: true
slug: /interfaces/formats/JSONCompactColumns
title: 'JSONCompactColumns'
doc_type: 'reference'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |



## Описание {#description}

В этом формате все данные представлены в виде одного JSON-массива.

:::note
Формат вывода `JSONCompactColumns` буферизует все данные в памяти для вывода единым блоком, что может привести к высокому потреблению памяти.
:::


## Пример использования {#example-usage}

### Вставка данных {#inserting-data}

Используйте JSON-файл со следующими данными с именем `football.json`:

```json
[
  [
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
  [
    2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021,
    2021, 2021, 2021, 2021, 2021
  ],
  [
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
  [
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
  [1, 2, 2, 1, 2, 1, 2, 7, 0, 0, 0, 0, 2, 0, 3, 4, 0],
  [4, 1, 0, 2, 2, 3, 0, 0, 1, 2, 2, 1, 2, 2, 3, 2, 3]
]
```

Вставьте данные:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONCompactColumns;
```

### Чтение данных {#reading-data}

Прочитайте данные в формате `JSONCompactColumns`:

```sql
SELECT *
FROM football
FORMAT JSONCompactColumns
```

Результат будет выведен в формате JSON:


```json
[
    ["2022-04-30", "2022-04-30", "2022-04-30", "2022-05-02", "2022-05-02", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07", "2022-05-07"],
    [2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021, 2021],
    ["Sutton United", "Swindon Town", "Tranmere Rovers", "Port Vale", "Salford City", "Barrow", "Bradford City", "Bristol Rovers", "Exeter City", "Harrogate Town A.F.C.", "Hartlepool United", "Leyton Orient", "Mansfield Town", "Newport County", "Oldham Athletic", "Stevenage Borough", "Walsall"],
    ["Bradford City", "Barrow", "Oldham Athletic", "Newport County", "Mansfield Town", "Northampton Town", "Carlisle United", "Scunthorpe United", "Port Vale", "Sutton United", "Colchester United", "Tranmere Rovers", "Forest Green Rovers", "Rochdale", "Crawley Town", "Salford City", "Swindon Town"],
    [1, 2, 2, 1, 2, 1, 2, 7, 0, 0, 0, 0, 2, 0, 3, 4, 0],
    [4, 1, 0, 2, 2, 3, 0, 0, 1, 2, 2, 1, 2, 2, 3, 2, 3]
]
```

Столбцы, отсутствующие в блоке, будут заполнены значениями по умолчанию (для этого можно использовать настройку [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields))


## Настройки формата {#format-settings}

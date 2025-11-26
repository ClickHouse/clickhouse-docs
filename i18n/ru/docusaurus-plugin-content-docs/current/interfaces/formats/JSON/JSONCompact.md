---
alias: []
description: 'Документация по формату JSONCompact'
input_format: true
keywords: ['JSONCompact']
output_format: true
slug: /interfaces/formats/JSONCompact
title: 'JSONCompact'
doc_type: 'reference'
---

| Входные данные | Выходные данные | Псевдоним |
|----------------|-----------------|-----------|
| ✔              | ✔               |           |



## Описание {#description}

Отличается от [JSON](./JSON.md) лишь тем, что строки данных выводятся в виде массивов, а не объектов.



## Пример использования

### Добавление данных

JSON-файл со следующими данными с именем `football.json`:

```json
{
    "meta":
    [
        {
            "name": "дата",
            "type": "Date"
        },
        {
            "name": "сезон",
            "type": "Int16"
        },
        {
            "name": "команда_хозяев",
            "type": "LowCardinality(String)"
        },
        {
            "name": "команда_гостей",
            "type": "LowCardinality(String)"
        },
        {
            "name": "голы_хозяев",
            "type": "Int8"
        },
        {
            "name": "голы_гостей",
            "type": "Int8"
        }
    ],
    "data":
    [
        ["2022-04-30", 2021, "Sutton United", "Bradford City", 1, 4],
        ["2022-04-30", 2021, "Swindon Town", "Barrow", 2, 1],
        ["2022-04-30", 2021, "Tranmere Rovers", "Oldham Athletic", 2, 0],
        ["2022-05-02", 2021, "Port Vale", "Newport County", 1, 2],
        ["2022-05-02", 2021, "Salford City", "Mansfield Town", 2, 2],
        ["2022-05-07", 2021, "Barrow", "Northampton Town", 1, 3],
        ["2022-05-07", 2021, "Bradford City", "Carlisle United", 2, 0],
        ["2022-05-07", 2021, "Bristol Rovers", "Scunthorpe United", 7, 0],
        ["2022-05-07", 2021, "Exeter City", "Port Vale", 0, 1],
        ["2022-05-07", 2021, "Harrogate Town A.F.C.", "Sutton United", 0, 2],
        ["2022-05-07", 2021, "Hartlepool United", "Colchester United", 0, 2],
        ["2022-05-07", 2021, "Leyton Orient", "Tranmere Rovers", 0, 1],
        ["2022-05-07", 2021, "Mansfield Town", "Forest Green Rovers", 2, 2],
        ["2022-05-07", 2021, "Newport County", "Rochdale", 0, 2],
        ["2022-05-07", 2021, "Oldham Athletic", "Crawley Town", 3, 3],
        ["2022-05-07", 2021, "Stevenage Borough", "Salford City", 4, 2],
        ["2022-05-07", 2021, "Walsall", "Swindon Town", 0, 3]
    ]
}
```

Вставьте данные:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONCompact;
```

### Чтение данных

Считайте данные в формате `JSONCompact`:

```sql
SELECT *
FROM football
FORMAT JSONCompact
```

Результат будет в формате JSON:

```json
{
    "meta":
    [
        {
            "name": "дата",
            "type": "Date"
        },
        {
            "name": "сезон",
            "type": "Int16"
        },
        {
            "name": "домашняя_команда",
            "type": "LowCardinality(String)"
        },
        {
            "name": "гостевая_команда",
            "type": "LowCardinality(String)"
        },
        {
            "name": "голы_домашней_команды",
            "type": "Int8"
        },
        {
            "name": "голы_гостевой_команды",
            "type": "Int8"
        }
    ],
```


    "data":
    [
        ["2022-04-30", 2021, "Sutton United", "Bradford City", 1, 4],
        ["2022-04-30", 2021, "Swindon Town", "Barrow", 2, 1],
        ["2022-04-30", 2021, "Tranmere Rovers", "Oldham Athletic", 2, 0],
        ["2022-05-02", 2021, "Port Vale", "Newport County", 1, 2],
        ["2022-05-02", 2021, "Salford City", "Mansfield Town", 2, 2],
        ["2022-05-07", 2021, "Barrow", "Northampton Town", 1, 3],
        ["2022-05-07", 2021, "Bradford City", "Carlisle United", 2, 0],
        ["2022-05-07", 2021, "Bristol Rovers", "Scunthorpe United", 7, 0],
        ["2022-05-07", 2021, "Exeter City", "Port Vale", 0, 1],
        ["2022-05-07", 2021, "Harrogate Town A.F.C.", "Sutton United", 0, 2],
        ["2022-05-07", 2021, "Hartlepool United", "Colchester United", 0, 2],
        ["2022-05-07", 2021, "Leyton Orient", "Tranmere Rovers", 0, 1],
        ["2022-05-07", 2021, "Mansfield Town", "Forest Green Rovers", 2, 2],
        ["2022-05-07", 2021, "Newport County", "Rochdale", 0, 2],
        ["2022-05-07", 2021, "Oldham Athletic", "Crawley Town", 3, 3],
        ["2022-05-07", 2021, "Stevenage Borough", "Salford City", 4, 2],
        ["2022-05-07", 2021, "Walsall", "Swindon Town", 0, 3]
    ],

    "rows": 17,

    "statistics":
    {
        "elapsed": 0.223690876,
        "rows_read": 0,
        "bytes_read": 0
    }

}

```

```


## Параметры форматирования {#format-settings}

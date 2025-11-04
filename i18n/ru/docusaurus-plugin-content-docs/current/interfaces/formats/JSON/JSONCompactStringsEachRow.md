---
slug: '/interfaces/formats/JSONCompactStringsEachRow'
description: 'Документация для формата JSONCompactStringsEachRow'
title: JSONCompactStringsEachRow
keywords: ['JSONCompactStringsEachRow']
doc_type: reference
input_format: true
output_format: true
---
| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Отличается от [`JSONCompactEachRow`](./JSONCompactEachRow.md) только тем, что поля данных выводятся в виде строк, а не как типизированные значения JSON.

## Пример использования {#example-usage}

### Вставка данных {#inserting-data}

Используя файл JSON со следующими данными, названный `football.json`:

```json
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

Вставить данные:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONCompactStringsEachRow;
```

### Чтение данных {#reading-data}

Читать данные, используя формат `JSONCompactStringsEachRow`:

```sql
SELECT *
FROM football
FORMAT JSONCompactStringsEachRow
```

Выходные данные будут в формате JSON:

```json
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
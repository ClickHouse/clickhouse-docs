---
slug: /guides/developer/dynamic-column-selection
sidebar_label: 'Динамический выбор столбцов'
title: 'Динамический выбор столбцов'
description: 'Использование альтернативных языков запросов в ClickHouse'
doc_type: 'guide'
keywords: ['динамический выбор столбцов', 'регулярные выражения', 'модификатор APPLY', 'сложные запросы', 'руководство для разработчиков']
---

[Динамический выбор столбцов](/docs/sql-reference/statements/select#dynamic-column-selection) — это мощная, но редко используемая функция ClickHouse, которая позволяет выбирать столбцы с помощью регулярных выражений вместо явного указания каждого столбца по имени. Вы также можете применять функции к столбцам, соответствующим регулярному выражению, используя модификатор `APPLY`, что делает этот механизм исключительно полезным для задач анализа и преобразования данных.

Мы изучим, как использовать эту функцию на примере [набора данных нью-йоркского такси](/docs/getting-started/example-datasets/nyc-taxi), который также доступен в [ClickHouse SQL playground](https://sql.clickhouse.com?query=LS0gRGF0YXNldCBjb250YWluaW5nIHRheGkgcmlkZSBkYXRhIGluIE5ZQyBmcm9tIDIwMDkuIE1vcmUgaW5mbyBoZXJlOiBodHRwczovL2NsaWNraG91c2UuY29tL2RvY3MvZW4vZ2V0dGluZy1zdGFydGVkL2V4YW1wbGUtZGF0YXNldHMvbnljLXRheGkKU0VMRUNUICogRlJPTSBueWNfdGF4aS50cmlwcyBMSU1JVCAxMDA).

<iframe width="768" height="432" src="https://www.youtube.com/embed/moabRqqHNo4?si=jgmInV-u3UxtLvMS" title="Проигрыватель видео YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>



## Выбор столбцов по шаблону {#selecting-columns}

Начнем с типичного сценария: выбор только тех столбцов, которые содержат `_amount`, из набора данных о такси Нью-Йорка. Вместо того чтобы вручную вводить имя каждого столбца, можно использовать выражение `COLUMNS` с регулярным выражением:

```sql
FROM nyc_taxi.trips
SELECT COLUMNS('.*_amount')
LIMIT 10;
```

> [Попробуйте этот запрос в SQL playground](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudCcpCkZST00gbnljX3RheGkudHJpcHMKTElNSVQgMTA7&run_query=true)

Этот запрос возвращает первые 10 строк, но только для столбцов, имена которых соответствуют шаблону `.*_amount` (любые символы, за которыми следует «\_amount»).

```text
    ┌─fare_amount─┬─tip_amount─┬─tolls_amount─┬─total_amount─┐
 1. │           9 │          0 │            0 │          9.8 │
 2. │           9 │          0 │            0 │          9.8 │
 3. │         3.5 │          0 │            0 │          4.8 │
 4. │         3.5 │          0 │            0 │          4.8 │
 5. │         3.5 │          0 │            0 │          4.3 │
 6. │         3.5 │          0 │            0 │          4.3 │
 7. │         2.5 │          0 │            0 │          3.8 │
 8. │         2.5 │          0 │            0 │          3.8 │
 9. │           5 │          0 │            0 │          5.8 │
10. │           5 │          0 │            0 │          5.8 │
    └─────────────┴────────────┴──────────────┴──────────────┘
```

Предположим, нам также нужно вернуть столбцы, содержащие термины `fee` или `tax`.
Можно обновить регулярное выражение, чтобы включить их:

```sql
SELECT COLUMNS('.*_amount|fee|tax')
FROM nyc_taxi.trips
ORDER BY rand()
LIMIT 3;
```

> [Попробуйте этот запрос в SQL playground](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykKRlJPTSBueWNfdGF4aS50cmlwcwpPUkRFUiBCWSByYW5kKCkgCkxJTUlUIDM7&run_query=true)

```text
   ┌─fare_amount─┬─mta_tax─┬─tip_amount─┬─tolls_amount─┬─ehail_fee─┬─total_amount─┐
1. │           5 │     0.5 │          1 │            0 │         0 │          7.8 │
2. │        12.5 │     0.5 │          0 │            0 │         0 │         13.8 │
3. │         4.5 │     0.5 │       1.66 │            0 │         0 │         9.96 │
   └─────────────┴─────────┴────────────┴──────────────┴───────────┴──────────────┘
```


## Выбор нескольких шаблонов {#selecting-multiple-patterns}

В одном запросе можно комбинировать несколько шаблонов столбцов:

```sql
SELECT
    COLUMNS('.*_amount'),
    COLUMNS('.*_date.*')
FROM nyc_taxi.trips
LIMIT 5;
```

> [Попробуйте этот запрос в SQL-песочнице](https://sql.clickhouse.com?query=U0VMRUNUIAogICAgQ09MVU1OUygnLipfYW1vdW50JyksCiAgICBDT0xVTU5TKCcuKl9kYXRlLionKQpGUk9NIG55Y190YXhpLnRyaXBzCkxJTUlUIDU7&run_query=true)

```text
   ┌─fare_amount─┬─tip_amount─┬─tolls_amount─┬─total_amount─┬─pickup_date─┬─────pickup_datetime─┬─dropoff_date─┬────dropoff_datetime─┐
1. │           9 │          0 │            0 │          9.8 │  2001-01-01 │ 2001-01-01 00:01:48 │   2001-01-01 │ 2001-01-01 00:15:47 │
2. │           9 │          0 │            0 │          9.8 │  2001-01-01 │ 2001-01-01 00:01:48 │   2001-01-01 │ 2001-01-01 00:15:47 │
3. │         3.5 │          0 │            0 │          4.8 │  2001-01-01 │ 2001-01-01 00:02:08 │   2001-01-01 │ 2001-01-01 01:00:02 │
4. │         3.5 │          0 │            0 │          4.8 │  2001-01-01 │ 2001-01-01 00:02:08 │   2001-01-01 │ 2001-01-01 01:00:02 │
5. │         3.5 │          0 │            0 │          4.3 │  2001-01-01 │ 2001-01-01 00:02:26 │   2001-01-01 │ 2001-01-01 00:04:49 │
   └─────────────┴────────────┴──────────────┴──────────────┴─────────────┴─────────────────────┴──────────────┴─────────────────────┘
```


## Применение функций ко всем столбцам {#applying-functions}

Мы также можем использовать модификатор [`APPLY`](/sql-reference/statements/select) для применения функций ко всем столбцам.
Например, если нужно найти максимальное значение для каждого из этих столбцов, можно выполнить следующий запрос:

```sql
SELECT COLUMNS('.*_amount|fee|tax') APPLY(max)
FROM nyc_taxi.trips;
```

> [Попробуйте этот запрос в SQL playground](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgQVBQTFkobWF4KQpGUk9NIG55Y190YXhpLnRyaXBzOw&run_query=true)

```text
   ┌─max(fare_amount)─┬─max(mta_tax)─┬─max(tip_amount)─┬─max(tolls_amount)─┬─max(ehail_fee)─┬─max(total_amount)─┐
1. │           998310 │     500000.5 │       3950588.8 │           7999.92 │           1.95 │         3950611.5 │
   └──────────────────┴──────────────┴─────────────────┴───────────────────┴────────────────┴───────────────────┘
```

Или, возможно, нужно увидеть среднее значение:

```sql
SELECT COLUMNS('.*_amount|fee|tax') APPLY(avg)
FROM nyc_taxi.trips
```

> [Попробуйте этот запрос в SQL playground](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgQVBQTFkoYXZnKQpGUk9NIG55Y190YXhpLnRyaXBzOw&run_query=true)

```text
   ┌─avg(fare_amount)─┬───────avg(mta_tax)─┬────avg(tip_amount)─┬──avg(tolls_amount)─┬──────avg(ehail_fee)─┬──avg(total_amount)─┐
1. │ 11.8044154834777 │ 0.4555942672733423 │ 1.3469850969211845 │ 0.2256511991414463 │ 3.37600560437412e-9 │ 14.423323722271563 │
   └──────────────────┴────────────────────┴────────────────────┴────────────────────┴─────────────────────┴────────────────────┘
```

Эти значения содержат много десятичных знаков, но, к счастью, это можно исправить, объединив функции в цепочку. В данном случае применим функцию avg, а затем функцию round:

```sql
SELECT COLUMNS('.*_amount|fee|tax') APPLY(avg) APPLY(round)
FROM nyc_taxi.trips;
```

> [Попробуйте этот запрос в SQL playground](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgQVBQTFkoYXZnKSBBUFBMWShyb3VuZCkKRlJPTSBueWNfdGF4aS50cmlwczs&run_query=true)

```text
   ┌─round(avg(fare_amount))─┬─round(avg(mta_tax))─┬─round(avg(tip_amount))─┬─round(avg(tolls_amount))─┬─round(avg(ehail_fee))─┬─round(avg(total_amount))─┐
1. │                      12 │                   0 │                      1 │                        0 │                     0 │                       14 │
   └─────────────────────────┴─────────────────────┴────────────────────────┴──────────────────────────┴───────────────────────┴──────────────────────────┘
```

Однако это округляет средние значения до целых чисел. Если нужно округлить, например, до 2 десятичных знаков, это также возможно. Помимо функций, модификатор `APPLY` принимает лямбда-выражения, что дает гибкость для округления средних значений функцией round до 2 десятичных знаков:

```sql
SELECT COLUMNS('.*_amount|fee|tax') APPLY(avg) APPLY(x -> round(x, 2))
FROM nyc_taxi.trips;
```


> [Попробуйте выполнить этот запрос в SQL Playground](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgQVBQTFkgYXZnIEFQUExZIHggLT4gcm91bmQoeCwgMikKRlJPTSBueWNfdGF4aS50cmlwcw\&run_query=true)

```text
   ┌─round(avg(fare_amount), 2)─┬─round(avg(mta_tax), 2)─┬─round(avg(tip_amount), 2)─┬─round(avg(tolls_amount), 2)─┬─round(avg(ehail_fee), 2)─┬─round(avg(total_amount), 2)─┐
1. │                       11.8 │                   0.46 │                      1.35 │                        0.23 │                        0 │                       14.42 │
   └────────────────────────────┴────────────────────────┴───────────────────────────┴─────────────────────────────┴──────────────────────────┴─────────────────────────────┘
```


## Замена столбцов {#replacing-columns}

Пока всё идёт хорошо. Но предположим, что нам нужно изменить одно из значений, оставив остальные без изменений. Например, мы хотим удвоить общую сумму и разделить налог MTA на 1.1. Это можно сделать с помощью модификатора [`REPLACE`](/sql-reference/statements/select), который заменяет указанные столбцы, оставляя остальные без изменений.

```sql
FROM nyc_taxi.trips
SELECT
  COLUMNS('.*_amount|fee|tax')
  REPLACE(
    total_amount*2 AS total_amount,
    mta_tax/1.1 AS mta_tax
  )
  APPLY(avg)
  APPLY(col -> round(col, 2));
```

> [Попробовать этот запрос в SQL playground](https://sql.clickhouse.com?query=RlJPTSBueWNfdGF4aS50cmlwcyAKU0VMRUNUIAogIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykKICBSRVBMQUNFKAogICAgdG90YWxfYW1vdW50KjIgQVMgdG90YWxfYW1vdW50LAogICAgbXRhX3RheC8xLjEgQVMgbXRhX3RheAogICkgCiAgQVBQTFkoYXZnKQogIEFQUExZKGNvbCAtPiByb3VuZChjb2wsIDIpKTs&run_query=true)

```text
   ┌─round(avg(fare_amount), 2)─┬─round(avg(di⋯, 1.1)), 2)─┬─round(avg(tip_amount), 2)─┬─round(avg(tolls_amount), 2)─┬─round(avg(ehail_fee), 2)─┬─round(avg(mu⋯nt, 2)), 2)─┐
1. │                       11.8 │                     0.41 │                      1.35 │                        0.23 │                        0 │                    28.85 │
   └────────────────────────────┴──────────────────────────┴───────────────────────────┴─────────────────────────────┴──────────────────────────┴──────────────────────────┘
```


## Исключение столбцов {#excluding-columns}

Мы также можем исключить поле с помощью модификатора [`EXCEPT`](/sql-reference/statements/select). Например, чтобы удалить столбец `tolls_amount`, необходимо написать следующий запрос:

```sql
FROM nyc_taxi.trips
SELECT
  COLUMNS('.*_amount|fee|tax') EXCEPT(tolls_amount)
  REPLACE(
    total_amount*2 AS total_amount,
    mta_tax/1.1 AS mta_tax
  )
  APPLY(avg)
  APPLY(col -> round(col, 2));
```

> [Попробуйте этот запрос в SQL playground](https://sql.clickhouse.com?query=RlJPTSBueWNfdGF4aS50cmlwcyAKU0VMRUNUIAogIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgRVhDRVBUKHRvbGxzX2Ftb3VudCkKICBSRVBMQUNFKAogICAgdG90YWxfYW1vdW50KjIgQVMgdG90YWxfYW1vdW50LAogICAgbXRhX3RheC8xLjEgQVMgbXRhX3RheAogICkgCiAgQVBQTFkoYXZnKQogIEFQUExZKGNvbCAtPiByb3VuZChjb2wsIDIpKTs&run_query=true)

```text
   ┌─round(avg(fare_amount), 2)─┬─round(avg(di⋯, 1.1)), 2)─┬─round(avg(tip_amount), 2)─┬─round(avg(ehail_fee), 2)─┬─round(avg(mu⋯nt, 2)), 2)─┐
1. │                       11.8 │                     0.41 │                      1.35 │                        0 │                    28.85 │
   └────────────────────────────┴──────────────────────────┴───────────────────────────┴──────────────────────────┴──────────────────────────┘
```

---
description: 'COVID-19 Open-Data — это большая открытая база эпидемиологических
  данных по COVID-19 и связанных факторов, таких как демография, экономика и меры правительств'
sidebar_label: 'COVID-19 open-data'
slug: /getting-started/example-datasets/covid19
title: 'COVID-19 Open-Data'
keywords: ['COVID-19 data', 'epidemiological data', 'health dataset', 'example dataset', 'getting started']
doc_type: 'guide'
---

COVID-19 Open-Data представляет собой попытку собрать крупнейшую эпидемиологическую базу данных по COVID-19, а также мощный набор дополнительных ковариат. В неё входят открытые, общедоступные лицензированные данные, относящиеся к демографии, экономике, эпидемиологии, географии, здравоохранению, госпитализациям, мобильности, реакции правительств, погоде и многому другому.

Подробности можно найти в GitHub [здесь](https://github.com/GoogleCloudPlatform/covid-19-open-data).

Загружать эти данные в ClickHouse очень просто...

:::note
Следующие команды были выполнены на **Production**-экземпляре [ClickHouse Cloud](https://clickhouse.cloud). Вы также можете легко выполнить их на локальной установке.
:::

1. Давайте посмотрим, как выглядят данные:

```sql
DESCRIBE url(
    'https://storage.googleapis.com/covid19-open-data/v3/epidemiology.csv',
    'CSVWithNames'
);
```

CSV‑файл содержит 10 столбцов:

```response
┌─name─────────────────┬─type─────────────┐
│ date                 │ Nullable(Date)   │
│ location_key         │ Nullable(String) │
│ new_confirmed        │ Nullable(Int64)  │
│ new_deceased         │ Nullable(Int64)  │
│ new_recovered        │ Nullable(Int64)  │
│ new_tested           │ Nullable(Int64)  │
│ cumulative_confirmed │ Nullable(Int64)  │
│ cumulative_deceased  │ Nullable(Int64)  │
│ cumulative_recovered │ Nullable(Int64)  │
│ cumulative_tested    │ Nullable(Int64)  │
└──────────────────────┴──────────────────┘

10 строк в наборе. Затрачено: 0.745 сек.
```

2. Теперь давайте выведем несколько строк:

```sql
SELECT *
FROM url('https://storage.googleapis.com/covid19-open-data/v3/epidemiology.csv')
LIMIT 100;
```

Обратите внимание, что функция `url` позволяет легко считывать данные из файла CSV:


```response
┌─c1─────────┬─c2───────────┬─c3────────────┬─c4───────────┬─c5────────────┬─c6─────────┬─c7───────────────────┬─c8──────────────────┬─c9───────────────────┬─c10───────────────┐
│ date       │ location_key │ new_confirmed │ new_deceased │ new_recovered │ new_tested │ cumulative_confirmed │ cumulative_deceased │ cumulative_recovered │ cumulative_tested │
│ 2020-04-03 │ AD           │ 24            │ 1            │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ       │ 466                  │ 17                  │ ᴺᵁᴸᴸ                 │ ᴺᵁᴸᴸ              │
│ 2020-04-04 │ AD           │ 57            │ 0            │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ       │ 523                  │ 17                  │ ᴺᵁᴸᴸ                 │ ᴺᵁᴸᴸ              │
│ 2020-04-05 │ AD           │ 17            │ 4            │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ       │ 540                  │ 21                  │ ᴺᵁᴸᴸ                 │ ᴺᵁᴸᴸ              │
│ 2020-04-06 │ AD           │ 11            │ 1            │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ       │ 551                  │ 22                  │ ᴺᵁᴸᴸ                 │ ᴺᵁᴸᴸ              │
│ 2020-04-07 │ AD           │ 15            │ 2            │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ       │ 566                  │ 24                  │ ᴺᵁᴸᴸ                 │ ᴺᵁᴸᴸ              │
│ 2020-04-08 │ AD           │ 23            │ 2            │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ       │ 589                  │ 26                  │ ᴺᵁᴸᴸ                 │ ᴺᵁᴸᴸ              │
└────────────┴──────────────┴───────────────┴──────────────┴───────────────┴────────────┴──────────────────────┴─────────────────────┴──────────────────────┴───────────────────┘
```

3. Теперь, когда мы знаем, как выглядят данные, создадим таблицу:

```sql
CREATE TABLE covid19 (
    date Date,
    location_key LowCardinality(String),
    new_confirmed Int32,
    new_deceased Int32,
    new_recovered Int32,
    new_tested Int32,
    cumulative_confirmed Int32,
    cumulative_deceased Int32,
    cumulative_recovered Int32,
    cumulative_tested Int32
)
ENGINE = MergeTree
ORDER BY (location_key, date);
```

4. Следующая команда загружает весь набор данных в таблицу `covid19`:

```sql
INSERT INTO covid19
   SELECT *
   FROM
      url(
        'https://storage.googleapis.com/covid19-open-data/v3/epidemiology.csv',
        CSVWithNames,
        'date Date,
        location_key LowCardinality(String),
        new_confirmed Int32,
        new_deceased Int32,
        new_recovered Int32,
        new_tested Int32,
        cumulative_confirmed Int32,
        cumulative_deceased Int32,
        cumulative_recovered Int32,
        cumulative_tested Int32'
    );
```

5. Это выполняется довольно быстро — давайте посмотрим, сколько строк было вставлено:

```sql
SELECT formatReadableQuantity(count())
FROM covid19;
```

```response
┌─formatReadableQuantity(count())─┐
│ 12,53 миллиона                  │
└─────────────────────────────────┘
```

6. Посмотрим, сколько всего случаев COVID-19 было зафиксировано:

```sql
SELECT formatReadableQuantity(sum(new_confirmed))
FROM covid19;
```

```response
┌─formatReadableQuantity(sum(new_confirmed))─┐
│ 1,39 миллиарда                             │
└────────────────────────────────────────────┘
```


7. Вы заметите, что в данных много нулей по датам — либо это выходные, либо дни, когда значения не сообщались ежедневно. Мы можем использовать оконную функцию, чтобы сгладить среднесуточные показатели по новым случаям:

```sql
SELECT
   AVG(new_confirmed) OVER (PARTITION BY location_key ORDER BY date ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING) AS cases_smoothed,
   new_confirmed,
   location_key,
   date
FROM covid19;
```

8. Этот запрос определяет последние значения для каждого местоположения. Мы не можем использовать `max(date)`, потому что не все страны отправляли отчёты каждый день, поэтому берём последнюю строку с помощью `ROW_NUMBER`:

```sql
WITH latest_deaths_data AS
   ( SELECT location_key,
            date,
            new_deceased,
            new_confirmed,
            ROW_NUMBER() OVER (PARTITION BY location_key ORDER BY date DESC) AS rn
     FROM covid19)
SELECT location_key,
       date,
       new_deceased,
       new_confirmed,
       rn
FROM latest_deaths_data
WHERE rn=1;
```

9. Мы можем использовать `lagInFrame`, чтобы вычислить `LAG` новых случаев за каждый день. В этом запросе мы фильтруем по местоположению `US_DC`:

```sql
SELECT
   new_confirmed - lagInFrame(new_confirmed,1) OVER (PARTITION BY location_key ORDER BY date) AS confirmed_cases_delta,
   new_confirmed,
   location_key,
   date
FROM covid19
WHERE location_key = 'US_DC';
```

Ответ будет выглядеть так:

```response
┌─confirmed_cases_delta─┬─new_confirmed─┬─location_key─┬───────date─┐
│                     0 │             0 │ US_DC        │ 2020-03-08 │
│                     2 │             2 │ US_DC        │ 2020-03-09 │
│                    -2 │             0 │ US_DC        │ 2020-03-10 │
│                     6 │             6 │ US_DC        │ 2020-03-11 │
│                    -6 │             0 │ US_DC        │ 2020-03-12 │
│                     0 │             0 │ US_DC        │ 2020-03-13 │
│                     6 │             6 │ US_DC        │ 2020-03-14 │
│                    -5 │             1 │ US_DC        │ 2020-03-15 │
│                     4 │             5 │ US_DC        │ 2020-03-16 │
│                     4 │             9 │ US_DC        │ 2020-03-17 │
│                    -1 │             8 │ US_DC        │ 2020-03-18 │
│                    24 │            32 │ US_DC        │ 2020-03-19 │
│                   -26 │             6 │ US_DC        │ 2020-03-20 │
│                    15 │            21 │ US_DC        │ 2020-03-21 │
│                    -3 │            18 │ US_DC        │ 2020-03-22 │
│                     3 │            21 │ US_DC        │ 2020-03-23 │
```

10. Этот запрос вычисляет процент изменения числа новых случаев по дням и добавляет в результирующий набор простой столбец `increase` или `decrease`:

```sql
WITH confirmed_lag AS (
  SELECT
    *,
    lagInFrame(new_confirmed) OVER(
      PARTITION BY location_key
      ORDER BY date
    ) AS confirmed_previous_day
  FROM covid19
),
confirmed_percent_change AS (
  SELECT
    *,
    COALESCE(ROUND((new_confirmed - confirmed_previous_day) / confirmed_previous_day * 100), 0) AS percent_change
  FROM confirmed_lag
)
SELECT
  date,
  new_confirmed,
  percent_change,
  CASE
    WHEN percent_change > 0 THEN 'увеличение'
    WHEN percent_change = 0 THEN 'без изменений'
    ELSE 'уменьшение'
  END AS trend
FROM confirmed_percent_change
WHERE location_key = 'US_DC';
```

Результаты выглядят так:


```response
┌───────дата─┬─нов_подтвержд─┬─процент_измен─┬─тренд─────┐
│ 2020-03-08 │             0 │            nan │ уменьшение  │
│ 2020-03-09 │             2 │            inf │ увеличение  │
│ 2020-03-10 │             0 │           -100 │ уменьшение  │
│ 2020-03-11 │             6 │            inf │ увеличение  │
│ 2020-03-12 │             0 │           -100 │ уменьшение  │
│ 2020-03-13 │             0 │            nan │ уменьшение  │
│ 2020-03-14 │             6 │            inf │ увеличение  │
│ 2020-03-15 │             1 │            -83 │ уменьшение  │
│ 2020-03-16 │             5 │            400 │ увеличение  │
│ 2020-03-17 │             9 │             80 │ увеличение  │
│ 2020-03-18 │             8 │            -11 │ уменьшение  │
│ 2020-03-19 │            32 │            300 │ увеличение  │
│ 2020-03-20 │             6 │            -81 │ уменьшение  │
│ 2020-03-21 │            21 │            250 │ увеличение  │
│ 2020-03-22 │            18 │            -14 │ уменьшение  │
│ 2020-03-23 │            21 │             17 │ увеличение  │
│ 2020-03-24 │            46 │            119 │ увеличение  │
│ 2020-03-25 │            48 │              4 │ увеличение  │
│ 2020-03-26 │            36 │            -25 │ уменьшение  │
│ 2020-03-27 │            37 │              3 │ увеличение  │
│ 2020-03-28 │            38 │              3 │ увеличение  │
│ 2020-03-29 │            59 │             55 │ увеличение  │
│ 2020-03-30 │            94 │             59 │ увеличение  │
│ 2020-03-31 │            91 │             -3 │ уменьшение  │
│ 2020-04-01 │            67 │            -26 │ уменьшение  │
│ 2020-04-02 │           104 │             55 │ увеличение  │
│ 2020-04-03 │           145 │             39 │ увеличение  │
```

:::note
Как указано в [репозитории GitHub](https://github.com/GoogleCloudPlatform/covid-19-open-data), набор данных с 15 сентября 2022 года больше не обновляется.
:::

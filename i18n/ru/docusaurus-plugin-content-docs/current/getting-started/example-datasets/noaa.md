---
description: '2.5 миллиарда строк климатических данных за последние 120 лет'
sidebar_label: 'Глобальная историческая климатологическая сеть NOAA'
sidebar_position: 1
slug: /getting-started/example-datasets/noaa
title: 'Глобальная историческая климатологическая сеть NOAA'
---

Этот набор данных содержит измерения погоды за последние 120 лет. Каждая строка представляет собой измерение для конкретного момента времени и станции.

Более точно и согласно [источнику этих данных](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn):

> GHCN-Daily — это набор данных, который содержит ежедневные наблюдения по глобальным земельным территориям. Он включает в себя данные с наземных станций по всему миру, около двух третей из которых предназначены только для измерений осадков (Menne et al., 2012). GHCN-Daily представляет собой композит климатических записей из многочисленных источников, которые были объединены и подвергнуты общему набору проверок качества (Durre et al., 2010). Архив включает следующие метеорологические элементы:

    - Максимальная температура за день
    - Минимальная температура за день
    - Температура на момент наблюдения
    - Осадки (т.е. дождь, растаявший снег)
    - Снегопад
    - Глубина снега
    - Другие элементы, если доступны

В следующих разделах представлен краткий обзор шагов, которые были предприняты для загрузки этого набора данных в ClickHouse. Если вас интересует более подробное описание каждого шага, рекомендуем ознакомиться с нашей публикацией в блоге под названием ["Изучение огромных наборов данных реального мира: 100+ лет записей погоды в ClickHouse"](https://clickhouse.com/blog/real-world-data-noaa-climate-data).

## Загрузка данных {#downloading-the-data}

- [Предварительно подготовленная версия](#pre-prepared-data) данных для ClickHouse, которая была очищена, переработана и обогащена. Эти данные охватывают период с 1900 по 2022 годы.
- [Загрузите оригинальные данные](#original-data) и преобразуйте их в формат, требуемый ClickHouse. Пользователи, желающие добавить свои собственные колонки, могут рассмотреть этот подход.

### Предварительно подготовленные данные {#pre-prepared-data}

Более конкретно, строки, которые не прошли проверки качества от Noaa, были удалены. Данные также были переработаны из формата "измерение в строке" в формат "строка для идентификатора станции и даты", т.е.

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

Это упрощает запросы и обеспечивает меньшую разреженность итоговой таблицы. Наконец, данные также были обогащены широтой и долготой.

Эти данные доступны по следующему расположению S3. Вы можете либо загрузить данные на локальную файловую систему (и вставить с помощью клиента ClickHouse), либо вставить данные напрямую в ClickHouse (см. [Вставка из S3](#inserting-from-s3)).

Для загрузки:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```

### Оригинальные данные {#original-data}

Ниже приведены шаги для загрузки и преобразования оригинальных данных в подготовку к загрузке в ClickHouse.

#### Загрузка {#download}

Для загрузки оригинальных данных:

```bash
for i in {1900..2023}; do wget https://noaa-ghcn-pds.s3.amazonaws.com/csv.gz/${i}.csv.gz; done
```

#### Выборка данных {#sampling-the-data}

```bash
$ clickhouse-local --query "SELECT * FROM '2021.csv.gz' LIMIT 10" --format PrettyCompact
┌─c1──────────┬───────c2─┬─c3───┬──c4─┬─c5───┬─c6───┬─c7─┬───c8─┐
│ AE000041196 │ 20210101 │ TMAX │ 278 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AE000041196 │ 20210101 │ PRCP │   0 │ D    │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AE000041196 │ 20210101 │ TAVG │ 214 │ H    │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041194 │ 20210101 │ TMAX │ 266 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041194 │ 20210101 │ TMIN │ 178 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041194 │ 20210101 │ PRCP │   0 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041194 │ 20210101 │ TAVG │ 217 │ H    │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041217 │ 20210101 │ TMAX │ 262 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041217 │ 20210101 │ TMIN │ 155 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
│ AEM00041217 │ 20210101 │ TAVG │ 202 │ H    │ ᴺᵁᴸᴸ │ S  │ ᴺᵁᴸᴸ │
└─────────────┴──────────┴──────┴─────┴──────┴──────┴────┴──────┘
```

Резюмируя [документацию по формату](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn):

Резюмируя документацию по формату и столбцам в порядке:

 - 11-значный код для идентификации станции. Это само по себе кодирует полезную информацию
 - ГОД/МЕСЯЦ/ДЕНЬ = 8-значная дата в формате YYYYMMDD (например, 19860529 = 29 мая 1986 года)
 - ЭЛЕМЕНТ = 4-значный индикатор типа элемента. Фактически, тип измерения. Хотя имеется много доступных измерений, мы выбираем следующие:
    - PRCP - Осадки (десятых долей мм)
    - SNOW - Снегопад (мм)
    - SNWD - Глубина снега (мм)
    - TMAX - Максимальная температура (десятых долей °C)
    - TAVG - Средняя температура (десятых долей °C)
    - TMIN - Минимальная температура (десятых долей °C)
    - PSUN - Дневной процент возможного солнечного света (процент)
    - AWND - Средняя дневная скорость ветра (десятых долей метра в секунду)
    - WSFG - Максимальная скорость порывов ветра (десятых долей метра в секунду)
    - WT** = Тип погоды, где ** определяет тип погоды. Полный список типов погоды можно найти здесь.
- ЗНАЧЕНИЕ ДАННЫХ = 5-значное значение данных для ЭЛЕМЕНТА, т.е. значение измерения.
- M-FLAG = 1-значный флаг измерения. У него 10 возможных значений. Некоторые из этих значений указывают на сомнительную точность данных. Мы принимаем данные, где этот флаг установлен в "P" - идентифицированные как отсутствующие, предполагаемые равными нулю, так как это имеет значение только для измерений PRCP, SNOW и SNWD.
- Q-FLAG — это флаг качества измерения с 14 возможными значениями. Нас интересуют только данные с пустым значением, т.е. данные не были отклонены по проверкам качества.
- S-FLAG — это флаг источника наблюдений. Не полезен для нашего анализа и игнорируется.
- OBS-TIME = 4-значный часовой показатель наблюдения в формате час-минута (например, 0700 = 7:00 утра). Обычно отсутствует в старых данных. Мы игнорируем это для наших целей.

Измерение в строке привело бы к разреженной структуре таблицы в ClickHouse. Мы должны преобразовать данные в строку на время и станцию, с измерениями в качестве столбцов. Сначала мы ограничиваем набор данных теми строками, которые не имеют проблем, т.е. где `qFlag` равно пустой строке.

#### Очистка данных {#clean-the-data}

С помощью [ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) мы можем отфильтровать строки, которые представляют собой интересующие нас измерения и соответствуют нашим требованиям к качеству:

```bash
clickhouse local --query "SELECT count() 
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

С более чем 2.6 миллиарда строк, этот запрос не быстрый, так как он включает парсинг всех файлов. На нашем 8-ядерном компьютере это занимает около 160 секунд.


### Пивотирование данных {#pivot-data}

Хотя структура "измерение в строке" может быть использована с ClickHouse, она усложнит будущие запросы. В идеале, нам нужна строка для идентификатора станции и даты, где каждый тип измерения и связанное значение являются столбцом т.е.

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

С помощью ClickHouse local и простого `GROUP BY`, мы можем изменить наши данные на эту структуру. Чтобы ограничить использование памяти, мы делаем это один файл за раз.

```bash
for i in {1900..2022}
do
clickhouse-local --query "SELECT station_id,
       toDate32(date) as date,
       anyIf(value, measurement = 'TAVG') as tempAvg,
       anyIf(value, measurement = 'TMAX') as tempMax,
       anyIf(value, measurement = 'TMIN') as tempMin,
       anyIf(value, measurement = 'PRCP') as precipitation,
       anyIf(value, measurement = 'SNOW') as snowfall,
       anyIf(value, measurement = 'SNWD') as snowDepth,
       anyIf(value, measurement = 'PSUN') as percentDailySun,
       anyIf(value, measurement = 'AWND') as averageWindSpeed,
       anyIf(value, measurement = 'WSFG') as maxWindSpeed,
       toUInt8OrZero(replaceOne(anyIf(measurement, startsWith(measurement, 'WT') AND value = 1), 'WT', '')) as weatherType
FROM file('$i.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String')
 WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))
GROUP BY station_id, date
ORDER BY station_id, date FORMAT CSV" >> "noaa.csv";
done
```

Этот запрос создаёт единый файл размером 50 ГБ `noaa.csv`.

### Обогащение данных {#enriching-the-data}

В данных нет указания местоположения, кроме идентификатора станции, который включает префикс код страны. В идеале, к каждой станции должны быть присвоены широта и долгота. Для этого NOAA предоставляет данные о каждой станции в отдельном [ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file). Этот файл имеет [несколько столбцов](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file), из которых пять полезны для нашего дальнейшего анализа: id, широта, долгота, высота и название.

```bash
wget http://noaa-ghcn-pds.s3.amazonaws.com/ghcnd-stations.txt
```

```bash
clickhouse local --query "WITH stations AS (SELECT id, lat, lon, elevation, splitByString(' GSN ',name)[1] as name FROM file('ghcnd-stations.txt', Regexp, 'id String, lat Float64, lon Float64, elevation Float32, name String'))
SELECT station_id,
       date,
       tempAvg,
       tempMax,
       tempMin,
       precipitation,
       snowfall,
       snowDepth,
       percentDailySun,
       averageWindSpeed,
       maxWindSpeed,
       weatherType,
       tuple(lon, lat) as location,
       elevation,
       name
FROM file('noaa.csv', CSV,
          'station_id String, date Date32, tempAvg Int32, tempMax Int32, tempMin Int32, precipitation Int32, snowfall Int32, snowDepth Int32, percentDailySun Int8, averageWindSpeed Int32, maxWindSpeed Int32, weatherType UInt8') as noaa LEFT OUTER
         JOIN stations ON noaa.station_id = stations.id INTO OUTFILE 'noaa_enriched.parquet' FORMAT Parquet SETTINGS format_regexp='^(.{11})\s+(\-?\d{1,2}\.\d{4})\s+(\-?\d{1,3}\.\d{1,4})\s+(\-?\d*\.\d*)\s+(.*)\s+(?:[\d]*)'" 
```
Этот запрос занимает несколько минут и создаёт файл размером 6.4 ГБ, `noaa_enriched.parquet`.

## Создание таблицы {#create-table}

Создайте таблицу MergeTree в ClickHouse (из клиента ClickHouse).

```sql
CREATE TABLE noaa
(
   `station_id` LowCardinality(String),
   `date` Date32,
   `tempAvg` Int32 COMMENT 'Средняя температура (десятых долей °C)',
   `tempMax` Int32 COMMENT 'Максимальная температура (десятых долей °C)',
   `tempMin` Int32 COMMENT 'Минимальная температура (десятых долей °C)',
   `precipitation` UInt32 COMMENT 'Осадки (десятых долей мм)',
   `snowfall` UInt32 COMMENT 'Снегопад (мм)',
   `snowDepth` UInt32 COMMENT 'Глубина снега (мм)',
   `percentDailySun` UInt8 COMMENT 'Дневной процент возможного солнечного света (процент)',
   `averageWindSpeed` UInt32 COMMENT 'Средняя дневная скорость ветра (десятых долей метра в секунду)',
   `maxWindSpeed` UInt32 COMMENT 'Максимальная скорость порывов ветра (десятых долей метра в секунду)',
   `weatherType` Enum8('Нормально' = 0, 'Туман' = 1, 'Сильный туман' = 2, 'Гроза' = 3, 'Небольшой град' = 4, 'Град' = 5, 'Гладь' = 6, 'Пыль/Пепел' = 7, 'Дым/Туман' = 8, 'Движущийся/Занос снега' = 9, 'Торнадо' = 10, 'Сильный ветер' = 11, 'Дождь' = 12, 'Мгла' = 13, 'Мелкий дождь' = 14, 'Ледяной дождь' = 15, 'Дождь' = 16, 'Ледяной дождь' = 17, 'Снег' = 18, 'Неизвестные осадки' = 19, 'Земляной туман' = 21, 'Ледяной туман' = 22),
   `location` Point,
   `elevation` Float32,
   `name` LowCardinality(String)
) ENGINE = MergeTree() ORDER BY (station_id, date);
```

## Вставка в ClickHouse {#inserting-into-clickhouse}

### Вставка из локального файла {#inserting-from-local-file}

Данные можно вставить из локального файла следующим образом (из клиента ClickHouse):

```sql
INSERT INTO noaa FROM INFILE '<path>/noaa_enriched.parquet'
```

где `<path>` представляет полный путь к локальному файлу на диске.

Смотрите [здесь](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data) информацию о том, как ускорить эту загрузку.

### Вставка из S3 {#inserting-from-s3}

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')
```

Узнайте, как ускорить это, в нашем блоге о [настройке больших загрузок данных](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2).

## Примеры запросов {#sample-queries}

### Высшая температура когда-либо зафиксированная {#highest-temperature-ever}

```sql
SELECT
    tempMax / 10 AS maxTemp,
    location,
    name,
    date
FROM blogs.noaa
WHERE tempMax > 500
ORDER BY
    tempMax DESC,
    date ASC
LIMIT 5

┌─maxTemp─┬─location──────────┬─name───────────────────────────────────────────┬───────date─┐
│    56.7 │ (-116.8667,36.45) │ CA GREENLAND RCH                               │ 1913-07-10 │
│    56.7 │ (-115.4667,32.55) │ MEXICALI (SMN)                                 │ 1949-08-20 │
│    56.7 │ (-115.4667,32.55) │ MEXICALI (SMN)                                 │ 1949-09-18 │
│    56.7 │ (-115.4667,32.55) │ MEXICALI (SMN)                                 │ 1952-07-17 │
│    56.7 │ (-115.4667,32.55) │ MEXICALI (SMN)                                 │ 1952-09-04 │
└─────────┴───────────────────┴────────────────────────────────────────────────┴────────────┘

5 строк в наборе. Время: 0.514 сек. Обработано 1.06 миллиарда строк, 4.27 ГБ (2.06 миллиарда строк/с., 8.29 ГБ/с.)
```

Успокаивает, что данные совпадают с [документированной записью](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded) в [Furnace Creek](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667) на 2023 год.

### Лучшие лыжные курорты {#best-ski-resorts}

Используя [список лыжных курортов](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv) в Соединенных Штатах и их соответствующие расположения, мы объединяем их с 1000 лучшими метеостанциями с наибольшими осадками за любой месяц за последние 5 лет. Сортируя это объединение по [geoDistance](/sql-reference/functions/geo/coordinates/#geodistance) и ограничивая результаты теми, где расстояние меньше 20 км, мы выбираем лучший результат для каждого курорта и сортируем их по общему количеству снега. Обратите внимание, что мы также ограничиваем курорты теми, что выше 1800 м, как общий индикатор хороших лыжных условий.

```sql
SELECT
   resort_name,
   total_snow / 1000 AS total_snow_m,
   resort_location,
   month_year
FROM
(
   WITH resorts AS
       (
           SELECT
               resort_name,
               state,
               (lon, lat) AS resort_location,
               'US' AS code
           FROM url('https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv', CSVWithNames)
       )
   SELECT
       resort_name,
       highest_snow.station_id,
       geoDistance(resort_location.1, resort_location.2, station_location.1, station_location.2) / 1000 AS distance_km,
       highest_snow.total_snow,
       resort_location,
       station_location,
       month_year
   FROM
   (
       SELECT
           sum(snowfall) AS total_snow,
           station_id,
           any(location) AS station_location,
           month_year,
           substring(station_id, 1, 2) AS code
       FROM noaa
       WHERE (date > '2017-01-01') AND (code = 'US') AND (elevation > 1800)
       GROUP BY
           station_id,
           toYYYYMM(date) AS month_year
       ORDER BY total_snow DESC
       LIMIT 1000
   ) AS highest_snow
   INNER JOIN resorts ON highest_snow.code = resorts.code
   WHERE distance_km < 20
   ORDER BY
       resort_name ASC,
       total_snow DESC
   LIMIT 1 BY
       resort_name,
       station_id
)
ORDER BY total_snow DESC
LIMIT 5

┌─resort_name──────────┬─total_snow_m─┬─resort_location─┬─month_year─┐
│ Sugar Bowl, CA       │        7.799 │ (-120.3,39.27)  │     201902 │
│ Donner Ski Ranch, CA │        7.799 │ (-120.34,39.31) │     201902 │
│ Boreal, CA           │        7.799 │ (-120.35,39.33) │     201902 │
│ Homewood, CA         │        4.926 │ (-120.17,39.08) │     201902 │
│ Alpine Meadows, CA   │        4.926 │ (-120.22,39.17) │     201902 │
└──────────────────────┴──────────────┴─────────────────┴────────────┘

5 строк в наборе. Время: 0.750 сек. Обработано 689.10 миллионов строк, 3.20 ГБ (918.20 миллионов строк/с., 4.26 ГБ/с.)
Максимальное использование памяти: 67.66 MiB.
```

## Благодарности {#credits}

Мы хотим поблагодарить усилия Глобальной исторической климатологической сети за подготовку, очистку и распространение этих данных. Мы ценим ваши усилия.

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E.Gleason, и T.G. Houston, 2012: Глобальная историческая климатологическая сеть - Ежедневно (GHCN-Daily), Версия 3. [укажите использованный поднабор, следуя десятичной дроби, напр. Версия 3.25]. NOAA Национальные центры экологической информации. http://doi.org/10.7289/V5D21VHZ [17/08/2020]

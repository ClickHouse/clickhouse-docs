---
description: '2.5 миллиарда строк данных о климате за последние 120 лет'
slug: /getting-started/example-datasets/noaa
sidebar_label: Глобальная историческая сеть климатологии NOAA 
sidebar_position: 1
title: 'Глобальная историческая сеть климатологии NOAA'
---

Этот набор данных содержит метеорологические измерения за последние 120 лет. Каждая строка представляет собой измерение для определенной временной точки и станции.

Более точно и согласно [происхождению этих данных](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn):

> GHCN-Daily — это набор данных, который содержит ежедневные наблюдения по глобальным наземным территориям. Он включает станции с измерениями из наземных станций по всему миру, около двух третей из которых являются только измерениями осадков (Menne et al., 2012). GHCN-Daily является композитом климатических записей из множества источников, которые были объединены и подвергнуты общей проверке качества (Durre et al., 2010). Архив включает следующие метеорологические элементы:

    - Максимальная температура за день
    - Минимальная температура за день
    - Температура в момент наблюдения
    - Осадки (т.е. дождь, растаявший снег)
    - Снегопад
    - Глубина снега
    - Другие элементы, где это возможно

В следующих разделах представлен краткий обзор шагов, которые были выполнены для добавления этого набора данных в ClickHouse. Если вас интересует более подробное описание каждого шага, мы рекомендуем ознакомиться с нашей статьей в блоге под названием ["Изучение массовых, реальных наборов данных: 100+ лет метеорологических записей в ClickHouse"](https://clickhouse.com/blog/real-world-data-noaa-climate-data).

## Загрузка данных {#downloading-the-data}

- [Предварительно подготовленная версия](#pre-prepared-data) данных для ClickHouse, которая была очищена, переработана и обогащена. Эти данные охватывают годы с 1900 по 2022.
- [Скачивание оригинальных данных](#original-data) и преобразование в формат, необходимый для ClickHouse. Пользователи, желающие добавить собственные колонки, могут рассмотреть этот подход.

### Предварительно подготовленные данные {#pre-prepared-data}

Более конкретно, были удалены строки, которые не прошли проверки качества Noaa. Данные также были переработаны из параметра на строку до строки на идентификатор станции и дату, т.е.

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

Это упрощает выполнение запросов и гарантирует, что результирующая таблица будет менее разреженной. Наконец, данные также были обогащены широтой и долготой.

Эти данные доступны по следующему месту в S3. Вы можете либо скачать данные на свой локальный файл (и вставить с помощью клиента ClickHouse), либо вставить их непосредственно в ClickHouse (см. [Вставка из S3](#inserting-from-s3)).

Чтобы скачать:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```

### Оригинальные данные {#original-data}

Следующий раздел описывает шаги по загрузке и преобразованию оригинальных данных в подготовку к загрузке в ClickHouse.

#### Загрузка {#download}

Чтобы загрузить оригинальные данные:

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

Резюмируя [документацию формата](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn):

Резюмируя документацию формата и колонки в порядке:

- Код идентификации станции из 11 символов. Это само по себе кодирует некоторую полезную информацию.
- ГОД/МЕСЯЦ/ДЕНЬ = 8-символьная дата в формате YYYYMMDD (например, 19860529 = 29 мая 1986 года).
- ЭЛЕМЕНТ = 4-символьный индикатор типа элемента. Фактически, тип измерения. Хотя доступно много измерений, мы выбираем следующие:
    - PRCP - Осадки (десятые доли мм)
    - SNOW - Снегопад (мм)
    - SNWD - Глубина снега (мм)
    - TMAX - Максимальная температура (десятые доли градуса Цельсия)
    - TAVG - Средняя температура (десятые доли градуса Цельсия)
    - TMIN - Минимальная температура (десятые доли градуса Цельсия)
    - PSUN - Дневной процент возможного солнечного света (процент)
    - AWND - Средняя скорость ветра за день (десятые доли метра в секунду)
    - WSFG - Максимальная скорость порыва ветра (десятые доли метра в секунду)
    - WT** = Тип погоды, где ** определяет тип погоды. Полный список типов погоды здесь.
- ЗНАЧЕНИЕ ДАННЫХ = 5-символьное значение данных для ЭЛЕМЕНТА, т.е. значение измерения.
- M-FLAG = 1-символьный Флаг измерения. У него есть 10 возможных значений. Некоторые из этих значений указывают на сомнительную точность данных. Мы принимаем данные, где это установлено на "P" - идентифицировано как пропущенное, предполагаемое нулевое, поскольку это касается только измерений PRCP, SNOW и SNWD.
- Q-FLAG - это флаг качества измерения с 14 возможными значениями. Нас интересуют только данные с пустым значением, т.е. которые не прошли ни одни проверки качества.
- S-FLAG - это флаг источника наблюдения. Не полезен для нашего анализа и игнорируется.
- OBS-TIME = 4-символьное время наблюдения в формате час-минуты (т.е. 0700 = 7:00). Обычно отсутствует в старых данных. Мы игнорируем это для наших целей.

Измерение на строку будет приводить к разреженной структуре таблицы в ClickHouse. Мы должны преобразовать это в строку на время и станцию, с измерениями в качестве колонок. Сначала мы ограничиваем набор данных строками без проблем, т.е. где `qFlag` равен пустой строке.

#### Очистите данные {#clean-the-data}

С помощью [ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) мы можем отфильтровать строки, которые представляют собой интересующие измерения и соответствуют нашим требованиям по качеству:

```bash
clickhouse local --query "SELECT count() 
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

С более чем 2.6 миллиарда строк, это не быстрый запрос, поскольку он включает парсинг всех файлов. На нашей 8-ядерной машине это занимает около 160 секунд.

### Свод данных {#pivot-data}

Хотя структура измерений на строку может использоваться с ClickHouse, она ненужным образом усложнит будущие запросы. В идеале, нам нужна строка на идентификатор станции и дату, где каждый тип измерения и соответствующее значение являются колонкой, т.е.

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

С помощью ClickHouse local и простого `GROUP BY` мы можем перевернуть наши данные в такую структуру. Чтобы ограничить использование памяти, мы делаем это по одному файлу за раз.

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

Этот запрос создает один файл объемом 50 ГБ `noaa.csv`.

### Обогащение данных {#enriching-the-data}

Данные не содержат никаких указаний на местоположение, кроме идентификатора станции, который включает префикс страны. В идеале, каждая станция должна иметь ассоциированные широту и долготу. Для этого NOAA удобно предоставляет детали каждой станции в отдельном [ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file). Этот файл имеет [несколько колонок](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file), из которых пять полезны для нашего будущего анализа: id, широта, долгота, высота и имя.

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
Этот запрос выполняется за несколько минут и создает файл объемом 6.4 ГБ `noaa_enriched.parquet`.

## Создание таблицы {#create-table}

Создайте таблицу MergeTree в ClickHouse (из клиента ClickHouse).

```sql
CREATE TABLE noaa
(
   `station_id` LowCardinality(String),
   `date` Date32,
   `tempAvg` Int32 COMMENT 'Средняя температура (десятые доли градуса Цельсия)',
   `tempMax` Int32 COMMENT 'Максимальная температура (десятые доли градуса Цельсия)',
   `tempMin` Int32 COMMENT 'Минимальная температура (десятые доли градуса Цельсия)',
   `precipitation` UInt32 COMMENT 'Осадки (десятые доли мм)',
   `snowfall` UInt32 COMMENT 'Снегопад (мм)',
   `snowDepth` UInt32 COMMENT 'Глубина снега (мм)',
   `percentDailySun` UInt8 COMMENT 'Дневной процент возможного солнечного света (процент)',
   `averageWindSpeed` UInt32 COMMENT 'Средняя скорость ветра за день (десятые доли метра в секунду)',
   `maxWindSpeed` UInt32 COMMENT 'Максимальная скорость порыва ветра (десятые доли метра в секунду)',
   `weatherType` Enum8('Нормально' = 0, 'Туман' = 1, 'Сильный туман' = 2, 'Гром' = 3, 'Небольшой град' = 4, 'Град' = 5, 'Ледяной дождь' = 6, 'Пыль/пепел' = 7, 'Дым/небольшая видимость' = 8, 'Двигающийся/развозимый снег' = 9, 'Торнадо' = 10, 'Сильные ветра' = 11, 'Летающие брызги' = 12, 'Мгла' = 13, 'Изморозь' = 14, 'Ливень' = 15, 'Ледяной дождь' = 16, 'Снег' = 17, 'Неизвестные осадки' = 19, 'Грунтовый туман' = 21, 'Ледяной туман' = 22),
   `location` Point,
   `elevation` Float32,
   `name` LowCardinality(String)
) ENGINE = MergeTree() ORDER BY (station_id, date);
```

## Вставка в ClickHouse {#inserting-into-clickhouse}

### Вставка из локального файла {#inserting-from-local-file}

Данные могут быть вставлены из локального файла следующим образом (из клиента ClickHouse):

```sql
INSERT INTO noaa FROM INFILE '<path>/noaa_enriched.parquet'
```

где `<path>` представляет собой полный путь к локальному файлу на диске. 

См. [здесь](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data) о том, как ускорить эту загрузку.

### Вставка из S3 {#inserting-from-s3}

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')
```

Чтобы ускорить это, смотрите нашу статью в блоге о [настройке загрузок больших данных](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2).

## Примеры запросов {#sample-queries}

### Максимальная температура за всю историю {#highest-temperature-ever}

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

5 строк в наборе. Затраченное время: 0.514 сек. Обработано 1.06 миллиарда строк, 4.27 ГБ (2.06 миллиарда строк/с., 8.29 ГБ/с.)
```

Утешительно соответствует [документированной записи](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded) в [Furnace Creek](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667) по состоянию на 2023 год.

### Лучшие горнолыжные курорты {#best-ski-resorts}

Используя [список горнолыжных курортов](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv) в Соединенных Штатах и их соответствующие местоположения, мы соединяем их с 1000 ведущими метеорологическими станциями с наибольшими осадками за любой месяц за последние 5 лет. Сортируя это соединение по [geoDistance](/sql-reference/functions/geo/coordinates/#geodistance) и ограничивая результаты теми, где расстояние менее 20 км, мы выбираем наилучший результат для каждого курорта и сортируем его по общему количеству снега. Обратите внимание, что мы также ограничиваем курорты теми, кто находится выше 1800 м, как общий индикатор хороших условий для катания на лыжах.

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

5 строк в наборе. Затраченное время: 0.750 сек. Обработано 689.10 миллионов строк, 3.20 ГБ (918.20 миллионов строк/с., 4.26 ГБ/с.)
Пиковое использование памяти: 67.66 MiB.
```

## Благодарности {#credits}

Мы хотели бы признать усилия Глобальной исторической сети климатологии за подготовку, очистку и распределение этих данных. Мы ценим ваши усилия.

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E.Gleason и T.G. Houston, 2012: Глобальная историческая сеть климатологии - ежедневно (GHCN-Daily), версия 3. [укажите использованный поднабор, следуя десятичной, например, версия 3.25]. NOAA Национальные центры информации о окружающей среде. http://doi.org/10.7289/V5D21VHZ [17/08/2020]

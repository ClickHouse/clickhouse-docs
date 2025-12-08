---
description: '2,5 миллиарда строк климатических данных за последние 120 лет'
sidebar_label: 'NOAA Global Historical Climatology Network '
slug: /getting-started/example-datasets/noaa
title: 'NOAA Global Historical Climatology Network'
doc_type: 'guide'
keywords: ['пример набора данных', 'noaa', 'погодные данные', 'образец данных', 'климат']
---

Этот набор данных содержит метеорологические наблюдения за последние 120 лет. Каждая строка — это измерение для определённого момента времени и станции.

Более точно и в соответствии с [источником этих данных](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn):

> GHCN-Daily — это набор данных, содержащий ежедневные наблюдения над сушей по всему миру. Он включает измерения, основанные на данных наземных метеостанций по всему миру, около двух третей которых предназначены только для измерения осадков (Menne et al., 2012). GHCN-Daily представляет собой сводный набор климатических данных из многочисленных источников, которые были объединены и подвергнуты единому набору процедур контроля качества (Durre et al., 2010). Архив включает следующие метеорологические элементы:

- Суточная максимальная температура
    - Суточная минимальная температура
    - Температура в момент наблюдения
    - Осадки (например, дождь, талый снег)
    - Снегопад
    - Глубина снежного покрова
    - Другие элементы, где это применимо

Разделы ниже дают краткий обзор шагов, которые были выполнены для загрузки этого набора данных в ClickHouse. Если вы хотите прочитать о каждом шаге подробнее, рекомендуем ознакомиться с нашей записью в блоге под названием ["Изучение массивных реальных наборов данных: более 100 лет погодных наблюдений в ClickHouse"](https://clickhouse.com/blog/real-world-data-noaa-climate-data).

## Загрузка данных {#downloading-the-data}

- [Предварительно подготовленная версия](#pre-prepared-data) данных для ClickHouse, очищенная, переработанная и обогащённая. Эти данные охватывают период с 1900 по 2022 годы.
- [Скачать исходные данные](#original-data) и преобразовать их в формат, требуемый ClickHouse. Пользователи, желающие добавить собственные столбцы, могут использовать этот подход.

### Предварительно подготовленные данные {#pre-prepared-data}

Более конкретно, были удалены строки, не провалившие ни одной проверки качества со стороны NOAA. Данные также были реструктурированы из формата «одно измерение на строку» в формат «одна строка на идентификатор станции и дату», т. е.

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

Запросы к таким данным проще, и это обеспечивает меньшую разреженность результирующей таблицы. Наконец, данные также были обогащены информацией о широте и долготе.

Эти данные доступны по следующему адресу в S3. Либо скачайте данные на локальную файловую систему (и затем выполните вставку с помощью клиента ClickHouse), либо вставьте их напрямую в ClickHouse (см. [Inserting from S3](#inserting-from-s3)).

Для скачивания:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```

### Исходные данные {#original-data}

Ниже приведены шаги по скачиванию и преобразованию исходных данных перед их загрузкой в ClickHouse.

#### Загрузка {#download}

Чтобы скачать исходные данные:

```bash
for i in {1900..2023}; do wget https://noaa-ghcn-pds.s3.amazonaws.com/csv.gz/${i}.csv.gz; done
```

#### Сэмплирование данных {#sampling-the-data}

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

Подытожим [документацию по формату](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn):

Подытожим документацию по формату и столбцы по порядку:

- 11-символьный код идентификации станции. Сам по себе он кодирует некоторую полезную информацию
- YEAR/MONTH/DAY = 8-символьная дата в формате YYYYMMDD (например, 19860529 = 29 мая 1986 г.)
- ELEMENT = 4-символьный индикатор типа элемента, фактически тип измерения. Хотя доступно много типов измерений, мы выбираем следующие:
  - PRCP — осадки (десятые доли мм)
  - SNOW — снегопад (мм)
  - SNWD — высота снежного покрова (мм)
  - TMAX — максимальная температура (десятые доли градуса C)
  - TAVG — средняя температура (десятые доли градуса C)
  - TMIN — минимальная температура (десятые доли градуса C)
  - PSUN — дневной процент возможной солнечной освещённости (процент)
  - AWND — средняя суточная скорость ветра (десятые доли метра в секунду)
  - WSFG — пиковая скорость порыва ветра (десятые доли метра в секунду)
  - WT** = тип погоды, где ** определяет тип погоды. Полный список типов погоды приведён здесь.
  - DATA VALUE = 5-символьное значение данных для ELEMENT, т.е. значение измерения.
  - M-FLAG = 1-символьный флаг измерения (Measurement Flag). Имеет 10 возможных значений. Некоторые из этих значений указывают на сомнительную точность данных. Мы принимаем данные, где этот флаг установлен в «P» — обозначающий отсутствующие, предполагаемые нулевыми (missing presumed zero), так как это относится только к измерениям PRCP, SNOW и SNWD.
- Q-FLAG — флаг качества измерения с 14 возможными значениями. Нас интересуют только данные с пустым значением, т.е. которые не провалили ни одной проверки контроля качества.
- S-FLAG — флаг источника наблюдения. Не полезен для нашего анализа и игнорируется.
- OBS-TIME = 4-символьное время наблюдения в формате часы-минуты (т.е. 0700 = 7:00 утра). Обычно отсутствует в более старых данных. Мы игнорируем его для наших целей.

Формат «одно измерение на строку» приведёт к разрежённой структуре таблицы в ClickHouse. Мы должны преобразовать данные к формату «одна строка на момент времени и станцию», с измерениями в виде столбцов. Сначала мы ограничим набор данных строками без проблем, т.е. где `qFlag` равен пустой строке.

#### Очистите данные {#clean-the-data}

Используя [ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local), мы можем отфильтровать строки, которые представляют интересующие нас измерения и соответствуют нашим требованиям к качеству:

```bash
clickhouse local --query "SELECT count() 
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

При объёме более 2,6 миллиарда строк этот запрос получается не очень быстрым, так как нужно разобрать все файлы. На нашей машине с 8 ядрами это занимает около 160 секунд.

### Преобразование данных (pivot) {#pivot-data}

Хотя структуру «одно измерение на строку» можно использовать с ClickHouse, она будет излишне усложнять будущие запросы. В идеале нам нужна одна строка по идентификатору станции и дате, где каждый тип измерения и соответствующее ему значение представлены отдельным столбцом, т. е.

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

Используя ClickHouse local и простой `GROUP BY`, мы можем перестроить наши данные в такую структуру. Чтобы ограничить расход памяти, мы делаем это по одному файлу за раз.

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

Этот запрос создаёт один файл `noaa.csv` размером 50 ГБ.

### Обогащение данных {#enriching-the-data}

В данных нет информации о местоположении, кроме идентификатора станции, который включает префикс с кодом страны. В идеале у каждой станции должны быть указаны широта и долгота. Для этого NOAA предоставляет сведения о каждой станции в отдельном файле [ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file). Этот файл содержит [несколько столбцов](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file), из которых пять пригодятся для нашего дальнейшего анализа: id, latitude, longitude, elevation и name.

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

Этот запрос выполняется в течение нескольких минут и создаёт файл размером 6,4 ГБ, `noaa_enriched.parquet`.

## Создание таблицы {#create-table}

Создайте таблицу MergeTree в ClickHouse (в клиенте ClickHouse).

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
   `snowDepth` UInt32 COMMENT 'Глубина снежного покрова (мм)',
   `percentDailySun` UInt8 COMMENT 'Дневной процент возможной инсоляции (проценты)',
   `averageWindSpeed` UInt32 COMMENT 'Средняя суточная скорость ветра (десятые доли метров в секунду)',
   `maxWindSpeed` UInt32 COMMENT 'Пиковая скорость порыва ветра (десятые доли метров в секунду)',
   `weatherType` Enum8('Нормальная' = 0, 'Туман' = 1, 'Густой туман' = 2, 'Гроза' = 3, 'Мелкий град' = 4, 'Град' = 5, 'Гололёд' = 6, 'Пыль/Пепел' = 7, 'Дым/Мгла' = 8, 'Метель/Поземка' = 9, 'Торнадо' = 10, 'Сильный ветер' = 11, 'Водяные брызги' = 12, 'Дымка' = 13, 'Морось' = 14, 'Ледяная морось' = 15, 'Дождь' = 16, 'Ледяной дождь' = 17, 'Снег' = 18, 'Неизвестные осадки' = 19, 'Приземный туман' = 21, 'Ледяной туман' = 22),
   `location` Point,
   `elevation` Float32,
   `name` LowCardinality(String)
) ENGINE = MergeTree() ORDER BY (station_id, date);

```

## Добавление данных в ClickHouse {#inserting-into-clickhouse}

### Вставка из локального файла {#inserting-from-local-file}

Данные можно вставить из локального файла следующим образом (в клиенте ClickHouse):

```sql
INSERT INTO noaa FROM INFILE '<путь>/noaa_enriched.parquet'
```

где `<path>` обозначает полный путь к локальному файлу на диске.

См. [здесь](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data), чтобы узнать, как ускорить загрузку данных.

### Вставка из S3 {#inserting-from-s3}

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')

```

Подробные рекомендации по ускорению этого процесса см. в нашей статье в блоге о [настройке загрузки больших объёмов данных](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2).

## Примеры запросов {#sample-queries}

### Максимальная температура за всё время {#highest-temperature-ever}

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

Получено 5 строк. Прошло: 0.514 сек. Обработано 1.06 млрд строк, 4.27 ГБ (2.06 млрд строк/с., 8.29 ГБ/с.)
```

Обнадеживающе соответствует [задокументированному рекорду](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded) в [Furnace Creek](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667) по состоянию на 2023 год.

### Лучшие горнолыжные курорты {#best-ski-resorts}

Используя [список горнолыжных курортов](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv) в США и их координаты, мы объединяем его с топ-1000 метеостанций с наибольшими снегопадами в любой месяц за последние 5 лет. Отсортировав результат этого объединения по [geoDistance](/sql-reference/functions/geo/coordinates/#geodistance) и ограничив выборку расстоянием менее 20 км, мы выбираем лучший результат для каждого курорта и затем сортируем полученный список по суммарному количеству снега. Обратите внимание, что мы также ограничиваем выборку курортами, расположенными выше 1800 м, как общим индикатором хороших условий для катания.

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

Получено 5 строк. Время выполнения: 0.750 сек. Обработано 689.10 млн строк, 3.20 ГБ (918.20 млн строк/сек., 4.26 ГБ/сек.)
Пиковое использование памяти: 67.66 МиБ.
```

## Благодарности {#credits}

Мы хотели бы отметить вклад Global Historical Climatology Network в подготовку, очистку и распространение этих данных. Мы благодарим их за проделанную работу.

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E. Gleason, and T.G. Houston, 2012: Global Historical Climatology Network - Daily (GHCN-Daily), Version 3. [укажите используемое подмножество после десятичной точки, например версию 3.25]. NOAA National Centers for Environmental Information. http://doi.org/10.7289/V5D21VHZ [17/08/2020]
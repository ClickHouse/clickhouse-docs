---
'description': '2,5 миллиарда строк климатических данных за последние 120 лет'
'sidebar_label': 'NOAA Глобальная Историческая Климатологическая Сеть'
'sidebar_position': 1
'slug': '/getting-started/example-datasets/noaa'
'title': 'NOAA Глобальная Историческая Климатологическая Сеть'
'doc_type': 'reference'
---

Этот набор данных содержит метеорологические измерения за последние 120 лет. Каждая строка представляет собой измерение для определенного момента времени и станции.

Более точно и согласно [источнику этих данных](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn):

> GHCN-Daily — это набор данных, который содержит ежедневные наблюдения по всему миру на суше. Он включает измерения на основе станций от наземных станций по всему миру, около двух третей из которых относятся только к измерениям осадков (Menne et al., 2012). GHCN-Daily является композитом климатических записей из множества источников, которые были объединены и подвергнуты общему набору проверок качества (Durre et al., 2010). Архив включает следующие метеорологические элементы:

    - Максимальная температура за день
    - Минимальная температура за день
    - Температура в момент наблюдения
    - Осадки (т.е. дождь, таяние снега)
    - Выпадение снега
    - Глубина снега
    - Другие элементы, где это возможно

Следующие разделы дают краткий обзор шагов, которые были предприняты для загрузки этого набора данных в ClickHouse. Если вас интересует детальное описание каждого шага, мы рекомендуем ознакомиться с нашим блогом под названием ["Изучение массивных реальных наборов данных: более 100 лет метеорологических записей в ClickHouse"](https://clickhouse.com/blog/real-world-data-noaa-climate-data).

## Загрузка данных {#downloading-the-data}

- [Предварительно подготовленная версия](#pre-prepared-data) данных для ClickHouse, которая была очищена, реорганизована и обогащена. Эти данные охватывают годы с 1900 по 2022.
- [Скачать оригинальные данные](#original-data) и конвертировать их в формат, необходимый для ClickHouse. Пользователи, желающие добавить свои собственные колонки, могут рассмотреть этот подход.

### Предварительно подготовленные данные {#pre-prepared-data}

Более конкретно, строки были удалены, которые не прошли проверку качества Noaa. Данные также были реорганизованы из записи на строку в строку по id станции и дате, т.е.

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

Это упрощает запросы и гарантирует, что результирующая таблица будет менее разреженной. Наконец, данные также были обогащены широтой и долготой.

Эти данные доступны по следующему местоположению S3. Вы можете либо скачать данные на свой локальный файловую систему (и вставить их с помощью клиента ClickHouse), либо вставить данные напрямую в ClickHouse (см. [Вставка из S3](#inserting-from-s3)).

Чтобы скачать:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```

### Оригинальные данные {#original-data}

Следующие детали описывают шаги для загрузки и преобразования оригинальных данных в подготовку к загрузке в ClickHouse.

#### Загрузка {#download}

Чтобы скачать оригинальные данные:

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

- 11-символьный код идентификации станции. Это само по себе кодирует полезную информацию.
- ГОД/МЕСЯЦ/ДЕНЬ = 8-символьная дата в формате YYYYMMDD (например, 19860529 = 29 мая 1986 года).
- ЭЛЕМЕНТ = 4-символьный индикатор типа элемента. Эффективно тип измерения. Хотя доступно много измерений, мы выбираем следующие:
  - PRCP - Осадки (десятые доли мм)
  - SNOW - Выпадение снега (мм)
  - SNWD - Глубина снега (мм)
  - TMAX - Максимальная температура (десятые доли градусов Цельсия)
  - TAVG - Средняя температура (десятые доли градуса Цельсия)
  - TMIN - Минимальная температура (десятые доли градусов Цельсия)
  - PSUN - Дневной процент возможного солнечного света (процент)
  - AWND - Средняя дневная скорость ветра (десятые доли метра в секунду)
  - WSFG - Пиковая скорость порывов ветра (десятые доли метра в секунду)
  - WT** = Тип погоды, где ** определяет тип погоды. Полный список типов погоды здесь.
  - ЗНАЧЕНИЕ ДАННЫХ = 5-символьное значение данных для ЭЛЕМЕНТА т.е. значение измерения.
  - M-FLAG = 1-символьный Флаг измерения. Это может принимать 10 возможных значений. Некоторые из этих значений указывают на сомнительную точность данных. Мы принимаем данные, где это значение установлено на "P" - идентифицировано как отсутствующее, предположительно ноль, так как это актуально только для измерений PRCP, SNOW и SNWD.
- Q-FLAG - это флаг качества измерения с 14 возможными значениями. Нас интересуют только данные с пустым значением т.е. которые не прошли проверку качества.
- S-FLAG - это флаг источника наблюдения. Не полезен для нашего анализа и игнорируется.
- OBS-TIME = 4-символьное время наблюдения в формате час-минуты (т.е. 0700 = 7:00 утра). Обычно отсутствует в более старых данных. Мы игнорируем это для наших целей.

Измерение на каждой строке привело бы к разреженной структуре таблицы в ClickHouse. Мы должны преобразовать данные в строки с временной отметкой и станцией, оставив измерения в качестве колонок. Сначала мы ограничиваем набор данных строками без проблем, т.е. где `qFlag` равно пустой строке.

#### Очистка данных {#clean-the-data}

С помощью [ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) мы можем отфильтровать строки, представляющие интересующие нас измерения и соответствующие нашим требованиям качества:

```bash
clickhouse local --query "SELECT count() 
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

С учетом более 2,6 миллиарда строк, этот запрос выполняется не быстро, так как включает парсинг всех файлов. На нашей 8-ядерной машине это занимает около 160 секунд.

### Пивот данных {#pivot-data}

Хотя структура измерения на строку может быть использована в ClickHouse, она усложнит будущие запросы. В идеале, нам нужны строки по id станции и дате, где каждое измерение и соответствующее значение являются колонками, т.е.

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

Используя ClickHouse local и простой `GROUP BY`, мы можем повторно преобразовать данные в эту структуру. Чтобы ограничить нагрузку на память, мы делаем это для одного файла за раз.

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

Этот запрос создает один файл размером 50 ГБ `noaa.csv`.

### Обогащение данных {#enriching-the-data}

Данные не содержат информации о месте, кроме как по id станции, который включает префикс страны. В идеале, каждой станции должен соответствовать набор широты и долготы. Для достижения этой цели NOAA удобно предоставляет информацию о каждой станции в отдельном [ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file). Этот файл имеет [несколько колонок](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file), из которых пять полезны для нашего дальнейшего анализа: id, широта, долгота, высота и название.

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
Этот запрос выполняется за несколько минут и создает файл размером 6.4 ГБ, `noaa_enriched.parquet`.

## Создание таблицы {#create-table}

Создайте таблицу MergeTree в ClickHouse (из клиента ClickHouse).

```sql
CREATE TABLE noaa
(
   `station_id` LowCardinality(String),
   `date` Date32,
   `tempAvg` Int32 COMMENT 'Average temperature (tenths of a degrees C)',
   `tempMax` Int32 COMMENT 'Maximum temperature (tenths of degrees C)',
   `tempMin` Int32 COMMENT 'Minimum temperature (tenths of degrees C)',
   `precipitation` UInt32 COMMENT 'Precipitation (tenths of mm)',
   `snowfall` UInt32 COMMENT 'Snowfall (mm)',
   `snowDepth` UInt32 COMMENT 'Snow depth (mm)',
   `percentDailySun` UInt8 COMMENT 'Daily percent of possible sunshine (percent)',
   `averageWindSpeed` UInt32 COMMENT 'Average daily wind speed (tenths of meters per second)',
   `maxWindSpeed` UInt32 COMMENT 'Peak gust wind speed (tenths of meters per second)',
   `weatherType` Enum8('Normal' = 0, 'Fog' = 1, 'Heavy Fog' = 2, 'Thunder' = 3, 'Small Hail' = 4, 'Hail' = 5, 'Glaze' = 6, 'Dust/Ash' = 7, 'Smoke/Haze' = 8, 'Blowing/Drifting Snow' = 9, 'Tornado' = 10, 'High Winds' = 11, 'Blowing Spray' = 12, 'Mist' = 13, 'Drizzle' = 14, 'Freezing Drizzle' = 15, 'Rain' = 16, 'Freezing Rain' = 17, 'Snow' = 18, 'Unknown Precipitation' = 19, 'Ground Fog' = 21, 'Freezing Fog' = 22),
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

где `<path>` представляет полный путь к локальному файлу на диске. 

См. [здесь](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data) для ускорения загрузки.

### Вставка из S3 {#inserting-from-s3}

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')

```
Что касается ускорения этого процесса, смотрите наш блог о [настройке больших загрузок данных](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2).

## Примеры запросов {#sample-queries}

### Наивысшая температура за всю историю {#highest-temperature-ever}

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

5 rows in set. Elapsed: 0.514 sec. Processed 1.06 billion rows, 4.27 GB (2.06 billion rows/s., 8.29 GB/s.)
```

Обнадеживающе согласуется с [документированными записями](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded) на [Furnace Creek](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667) по состоянию на 2023 год.

### Лучшие горнолыжные курорты {#best-ski-resorts}

Используя [список горнолыжных курортов](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv) в Соединенных Штатах и их соответствующие местоположения, мы связываем их с 1000 станциями погоды с наибольшим количеством осадков за любой месяц за последние 5 лет. Сортируя это соединение по [geoDistance](/sql-reference/functions/geo/coordinates/#geodistance) и ограничивая результаты теми, где расстояние меньше 20 км, мы выбираем лучший результат для каждого курорта и сортируем по общему количеству снега. Обратите внимание, что мы также ограничиваем курорты до тех, которые находятся на высоте выше 1800 м, как широкое показатель хороших условий для катания на лыжах.

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

5 rows in set. Elapsed: 0.750 sec. Processed 689.10 million rows, 3.20 GB (918.20 million rows/s., 4.26 GB/s.)
Peak memory usage: 67.66 MiB.
```

## Спасибо {#credits}

Мы хотели бы поблагодарить Global Historical Climatology Network за подготовку, очистку и распространение этих данных. Мы ценим ваши усилия.

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E.Gleason и T.G. Houston, 2012: Global Historical Climatology Network - Daily (GHCN-Daily), Версия 3. [указать использованную подсистему, следуя десятичной точке, например, Версия 3.25]. NOAA Национальные центры информации о окружающей среде. http://doi.org/10.7289/V5D21VHZ [17/08/2020]

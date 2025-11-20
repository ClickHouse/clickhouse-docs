---
description: '2.5 миллиарда строк климатических данных за последние 120 лет'
sidebar_label: 'NOAA Global Historical Climatology Network '
slug: /getting-started/example-datasets/noaa
title: 'NOAA Global Historical Climatology Network'
doc_type: 'guide'
keywords: ['example dataset', 'noaa', 'weather data', 'sample data', 'climate']
---

Этот набор данных содержит измерения погодных условий за последние 120 лет. Каждая строка представляет собой измерение для определённого момента времени и станции.

Более точно и в соответствии с [источником этих данных](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn):

> GHCN-Daily — это набор данных, содержащий ежедневные наблюдения над сушей по всему миру. Он включает измерения, выполняемые наземными станциями по всему миру, около двух третей которых относятся только к измерениям осадков (Menne et al., 2012). GHCN-Daily представляет собой совокупность климатических записей из многочисленных источников, которые были объединены и подвергнуты единому комплексу проверок качества (Durre et al., 2010). Архив включает следующие метеорологические элементы:

    - Максимальная суточная температура
    - Минимальная суточная температура
    - Температура на момент наблюдения
    - Осадки (т.е. дождь, растаявший снег)
    - Снегопад
    - Высота снежного покрова
    - Другие элементы, где они доступны

В следующих разделах приводится краткий обзор шагов, которые были выполнены для загрузки этого набора данных в ClickHouse. Если вы хотите подробнее ознакомиться с каждым шагом, рекомендуем посмотреть нашу публикацию в блоге под названием ["Исследование масштабных реальных наборов данных: более 100 лет погодных записей в ClickHouse"](https://clickhouse.com/blog/real-world-data-noaa-climate-data).



## Загрузка данных {#downloading-the-data}

- [Предварительно подготовленная версия](#pre-prepared-data) данных для ClickHouse, которая была очищена, реструктурирована и обогащена. Эти данные охватывают период с 1900 по 2022 год.
- [Загрузите исходные данные](#original-data) и преобразуйте их в формат, требуемый ClickHouse. Пользователи, желающие добавить собственные столбцы, могут использовать этот подход.

### Предварительно подготовленные данные {#pre-prepared-data}

В частности, были удалены строки, которые не прошли проверки контроля качества NOAA. Данные также были реструктурированы из формата «одно измерение на строку» в формат «одна строка на идентификатор станции и дату», т. е.

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

Это упрощает выполнение запросов и обеспечивает меньшую разреженность результирующей таблицы. Кроме того, данные были обогащены координатами широты и долготы.

Эти данные доступны в следующем расположении S3. Вы можете либо загрузить данные в локальную файловую систему (и вставить их с помощью клиента ClickHouse), либо вставить их непосредственно в ClickHouse (см. [Вставка из S3](#inserting-from-s3)).

Для загрузки:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```

### Исходные данные {#original-data}

Ниже описаны шаги по загрузке и преобразованию исходных данных для подготовки к загрузке в ClickHouse.

#### Загрузка {#download}

Для загрузки исходных данных:

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

Резюмируя документацию по формату и перечисляя столбцы по порядку:


- 11-символьный идентификационный код станции. Сам код содержит полезную информацию
- YEAR/MONTH/DAY = 8-символьная дата в формате YYYYMMDD (например, 19860529 = 29 мая 1986 г.)
- ELEMENT = 4-символьный индикатор типа элемента. По сути, это тип измерения. Хотя доступно множество измерений, мы выбираем следующие:
  - PRCP - Осадки (десятые доли мм)
  - SNOW - Снегопад (мм)
  - SNWD - Глубина снежного покрова (мм)
  - TMAX - Максимальная температура (десятые доли градусов C)
  - TAVG - Средняя температура (десятые доли градуса C)
  - TMIN - Минимальная температура (десятые доли градусов C)
  - PSUN - Дневной процент возможной продолжительности солнечного сияния (проценты)
  - AWND - Средняя дневная скорость ветра (десятые доли метров в секунду)
  - WSFG - Максимальная скорость порыва ветра (десятые доли метров в секунду)
  - WT** = Тип погоды, где ** определяет конкретный тип погоды. Полный список типов погоды доступен здесь.
  - DATA VALUE = 5-символьное значение данных для ELEMENT, т.е. значение измерения.
  - M-FLAG = 1-символьный флаг измерения. Имеет 10 возможных значений. Некоторые из этих значений указывают на сомнительную точность данных. Мы принимаем данные, где этот флаг установлен в "P" - идентифицируется как отсутствующее значение, предположительно равное нулю, поскольку это актуально только для измерений PRCP, SNOW и SNWD.
- Q-FLAG — флаг качества измерения с 14 возможными значениями. Нас интересуют только данные с пустым значением, т.е. те, которые прошли все проверки контроля качества.
- S-FLAG — флаг источника наблюдения. Не используется в нашем анализе и игнорируется.
- OBS-TIME = 4-символьное время наблюдения в формате часы-минуты (т.е. 0700 = 7:00 утра). Обычно отсутствует в старых данных. Мы игнорируем это поле для наших целей.

Структура с одним измерением на строку приведет к разреженной таблице в ClickHouse. Нам следует преобразовать данные так, чтобы каждая строка соответствовала времени и станции, а измерения стали столбцами. Сначала мы ограничиваем набор данных строками без проблем, т.е. где `qFlag` равен пустой строке.

#### Очистка данных {#clean-the-data}

Используя [ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local), мы можем отфильтровать строки, представляющие интересующие нас измерения и соответствующие нашим требованиям к качеству:

```bash
clickhouse local --query "SELECT count()
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

При более чем 2,6 миллиардах строк это не быстрый запрос, поскольку он требует разбора всех файлов. На нашей 8-ядерной машине это занимает около 160 секунд.

### Преобразование данных {#pivot-data}

Хотя структура с одним измерением на строку может использоваться в ClickHouse, она излишне усложнит будущие запросы. В идеале нам нужна одна строка на идентификатор станции и дату, где каждый тип измерения и связанное с ним значение представлены отдельным столбцом, т.е.

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

Используя ClickHouse local и простой `GROUP BY`, мы можем преобразовать наши данные в эту структуру. Чтобы ограничить потребление памяти, мы обрабатываем по одному файлу за раз.


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

Этот запрос создаёт один файл размером 50 ГБ — `noaa.csv`.

### Обогащение данных {#enriching-the-data}

В данных отсутствует информация о местоположении, кроме идентификатора станции, который включает префикс кода страны. В идеале каждая станция должна иметь связанные с ней широту и долготу. Для этого NOAA предоставляет информацию о каждой станции в отдельном файле [ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file). Этот файл содержит [несколько столбцов](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file), из которых пять полезны для дальнейшего анализа: id, latitude, longitude, elevation и name.

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

Выполнение этого запроса занимает несколько минут и создаёт файл размером 6,4 ГБ — `noaa_enriched.parquet`.


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
   `snowDepth` UInt32 COMMENT 'Глубина снежного покрова (мм)',
   `percentDailySun` UInt8 COMMENT 'Процент возможной солнечной активности за день (проценты)',
   `averageWindSpeed` UInt32 COMMENT 'Средняя скорость ветра за день (десятые доли метров в секунду)',
   `maxWindSpeed` UInt32 COMMENT 'Пиковая скорость порыва ветра (десятые доли метров в секунду)',
   `weatherType` Enum8('Normal' = 0, 'Fog' = 1, 'Heavy Fog' = 2, 'Thunder' = 3, 'Small Hail' = 4, 'Hail' = 5, 'Glaze' = 6, 'Dust/Ash' = 7, 'Smoke/Haze' = 8, 'Blowing/Drifting Snow' = 9, 'Tornado' = 10, 'High Winds' = 11, 'Blowing Spray' = 12, 'Mist' = 13, 'Drizzle' = 14, 'Freezing Drizzle' = 15, 'Rain' = 16, 'Freezing Rain' = 17, 'Snow' = 18, 'Unknown Precipitation' = 19, 'Ground Fog' = 21, 'Freezing Fog' = 22),
   `location` Point,
   `elevation` Float32,
   `name` LowCardinality(String)
) ENGINE = MergeTree() ORDER BY (station_id, date);

```


## Вставка данных в ClickHouse {#inserting-into-clickhouse}

### Вставка из локального файла {#inserting-from-local-file}

Данные можно вставить из локального файла следующим образом (из клиента ClickHouse):

```sql
INSERT INTO noaa FROM INFILE '<path>/noaa_enriched.parquet'
```

где `<path>` — это полный путь к локальному файлу на диске.

Как ускорить эту загрузку, см. [здесь](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data).

### Вставка из S3 {#inserting-from-s3}

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')

```

Как ускорить этот процесс, см. в нашей статье о [настройке загрузки больших объемов данных](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2).


## Примеры запросов {#sample-queries}

### Самая высокая температура за всё время {#highest-temperature-ever}

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

Результат полностью согласуется с [задокументированным рекордом](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded) в [Furnace Creek](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667) по состоянию на 2023 год.

### Лучшие горнолыжные курорты {#best-ski-resorts}

Используя [список горнолыжных курортов](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv) в США и их координаты, мы объединяем их с топ-1000 метеостанций с наибольшим количеством снега за любой месяц за последние 5 лет. Сортируя результат объединения по [geoDistance](/sql-reference/functions/geo/coordinates/#geodistance) и ограничивая результаты теми, где расстояние меньше 20 км, мы выбираем лучший результат для каждого курорта и сортируем по общему количеству снега. Обратите внимание, что мы также ограничиваем выборку курортами, расположенными выше 1800 м, что является общим индикатором хороших условий для катания на лыжах.


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
Пиковое потребление памяти: 67.66 МиБ.
```


## Благодарности {#credits}

Мы выражаем благодарность Global Historical Climatology Network за подготовку, очистку и распространение этих данных. Мы высоко ценим вашу работу.

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E.Gleason, and T.G. Houston, 2012: Global Historical Climatology Network - Daily (GHCN-Daily), Version 3. [укажите используемое подмножество после десятичной точки, например, Version 3.25]. NOAA National Centers for Environmental Information. http://doi.org/10.7289/V5D21VHZ [17/08/2020]

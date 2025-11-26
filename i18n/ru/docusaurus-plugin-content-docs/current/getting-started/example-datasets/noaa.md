---
description: '2,5 миллиарда строк климатических данных за последние 120 лет'
sidebar_label: 'NOAA Global Historical Climatology Network '
slug: /getting-started/example-datasets/noaa
title: 'NOAA Global Historical Climatology Network'
doc_type: 'guide'
keywords: ['пример набора данных', 'noaa', 'погодные данные', 'образец данных', 'климат']
---

Этот набор данных содержит метеонаблюдения за последние 120 лет. Каждая строка представляет собой измерение для конкретного момента времени и метеостанции.

Более точно, в соответствии с [источником этих данных](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn):

> GHCN-Daily — это набор данных, содержащий ежедневные наблюдения над сушей по всему миру. Он включает измерения с наземных метеостанций по всему миру, примерно две трети которых — только измерения осадков (Menne et al., 2012). GHCN-Daily представляет собой совокупность климатических записей из многочисленных источников, которые были объединены и подвергнуты единому набору процедур контроля качества (Durre et al., 2010). Архив включает следующие метеорологические элементы:
>
> - Ежедневная максимальная температура
> - Ежедневная минимальная температура
> - Температура на момент наблюдения
> - Осадки (например, дождь, талый снег)
> - Снегопад
> - Глубина снежного покрова
> - Другие элементы, где они доступны

Разделы ниже дают краткий обзор шагов, которые были выполнены для загрузки этого набора данных в ClickHouse. Если вы хотите прочитать о каждом шаге более подробно, рекомендуем ознакомиться с нашей записью в блоге под названием «Исследование массивных реальных наборов данных: более 100 лет погодных записей в ClickHouse» (["Exploring massive, real-world data sets: 100+ Years of Weather Records in ClickHouse"](https://clickhouse.com/blog/real-world-data-noaa-climate-data)).



## Загрузка данных

* [Предварительно подготовленная версия](#pre-prepared-data) данных для ClickHouse, которые были очищены, реструктурированы и обогащены. Эти данные охватывают период с 1900 по 2022 годы.
* [Загрузить исходные данные](#original-data) и преобразовать их в формат, требуемый ClickHouse. Пользователи, желающие добавить собственные столбцы, могут использовать этот подход.

### Предварительно подготовленные данные

Точнее, были удалены строки, которые не провалили ни одной проверки контроля качества NOAA. Данные также были реструктурированы из формата «одно измерение на строку» в формат «одна строка на идентификатор станции и дату», т.е.

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

Такой формат проще для запросов и гарантирует, что результирующая таблица будет менее разреженной. Кроме того, данные были дополнены координатами широты и долготы.

Эти данные доступны по следующему пути в S3. Либо скачайте данные в локальную файловую систему (и вставьте их с помощью клиента ClickHouse), либо вставьте их напрямую в ClickHouse (см. [Inserting from S3](#inserting-from-s3)).

Чтобы скачать:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet
```

### Исходные данные

Ниже приведены шаги по скачиванию и преобразованию исходных данных перед их загрузкой в ClickHouse.

#### Скачивание

Чтобы скачать исходные данные:

```bash
for i in {1900..2023}; do wget https://noaa-ghcn-pds.s3.amazonaws.com/csv.gz/${i}.csv.gz; done
```

#### Сэмплирование данных


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

Подводя итог [документации по формату](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn):

Подводя итог документации по формату и столбцам в порядке их следования:


* 11-символьный код идентификации станции. Сам по себе он кодирует некоторую полезную информацию.
* YEAR/MONTH/DAY = 8-символьная дата в формате YYYYMMDD (например, 19860529 = 29 мая 1986 г.)
* ELEMENT = 4-символьный индикатор типа элемента, фактически тип измерения. Хотя доступно много типов измерений, мы выбираем следующие:
  * PRCP — Осадки (десятые доли мм)
  * SNOW — Снегопад (мм)
  * SNWD — Высота снежного покрова (мм)
  * TMAX — Максимальная температура (десятые доли градуса °C)
  * TAVG — Средняя температура (десятые доли градуса °C)
  * TMIN — Минимальная температура (десятые доли градуса °C)
  * PSUN — Суточный процент возможной солнечной радиации (проценты)
  * AWND — Среднесуточная скорость ветра (десятые доли метра в секунду)
  * WSFG — Пиковая скорость порывов ветра (десятые доли метра в секунду)
  * WT** = Тип погоды, где ** определяет конкретный тип. Полный список типов погоды приведён здесь.
  * DATA VALUE = 5-символьное значение данных для ELEMENT, т.е. значение измерения.
  * M-FLAG = 1-символьный флаг измерения. Имеет 10 возможных значений. Некоторые из этих значений указывают на сомнительную точность данных. Мы принимаем данные, для которых это значение установлено в «P» — помечено как отсутствующее, предполагаемое нулевым, поскольку это относится только к измерениям PRCP, SNOW и SNWD.
* Q-FLAG — флаг качества измерения с 14 возможными значениями. Нас интересуют только данные с пустым значением, т.е. данные, прошедшие все проверки контроля качества.
* S-FLAG — флаг источника наблюдения. Для нашего анализа не представляет интереса и игнорируется.
* OBS-TIME = 4-символьное время наблюдения в формате часы-минуты (т.е. 0700 = 7:00 утра). Обычно отсутствует в более старых данных. Для наших целей мы его игнорируем.

Одно измерение на строку приведёт к разрежённой структуре таблицы в ClickHouse. Нам следует трансформировать данные к одной строке на момент времени и станцию, с измерениями в виде столбцов. Сначала ограничим набор данных строками без проблем, т.е. где `qFlag` равен пустой строке.

#### Очистка данных

Используя [ClickHouse local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local), мы можем отфильтровать строки, представляющие интересующие нас измерения и удовлетворяющие нашим требованиям к качеству:

```bash
clickhouse local --query "SELECT count() 
FROM file('*.csv.gz', CSV, 'station_id String, date String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String') WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))"

2679264563
```

При более чем 2,6 миллиарда строк этот запрос нельзя назвать быстрым, так как он требует парсинга всех файлов. На нашей машине с 8 ядрами это занимает около 160 секунд.

### Поворот данных

Хотя формат «одно измерение в строке» можно использовать с ClickHouse, он будет излишне усложнять будущие запросы. В идеале нам нужна одна строка на ID станции и дату, где каждый тип измерения и соответствующее значение представлены отдельным столбцом, то есть

```csv
"station_id","date","tempAvg","tempMax","tempMin","precipitation","snowfall","snowDepth","percentDailySun","averageWindSpeed","maxWindSpeed","weatherType"
"AEM00041194","2022-07-30",347,0,308,0,0,0,0,0,0,0
"AEM00041194","2022-07-31",371,413,329,0,0,0,0,0,0,0
"AEM00041194","2022-08-01",384,427,357,0,0,0,0,0,0,0
"AEM00041194","2022-08-02",381,424,352,0,0,0,0,0,0,0
```

Используя ClickHouse local и простой `GROUP BY`, мы можем преобразовать наши данные к такой структуре. Чтобы ограничить использование памяти, мы обрабатываем файлы по одному.


```bash
for i in {1900..2022}
do
clickhouse-local --query "SELECT station_id,
       toDate32(дата) as дата,
       anyIf(value, measurement = 'TAVG') as средняяТемп,
       anyIf(value, measurement = 'TMAX') as максТемп,
       anyIf(value, measurement = 'TMIN') as минТемп,
       anyIf(value, measurement = 'PRCP') as осадки,
       anyIf(value, measurement = 'SNOW') as снегопад,
       anyIf(value, measurement = 'SNWD') as глубинаСнега,
       anyIf(value, measurement = 'PSUN') as процентСолнца,
       anyIf(value, measurement = 'AWND') as средняяСкоростьВетра,
       anyIf(value, measurement = 'WSFG') as максСкоростьВетра,
       toUInt8OrZero(replaceOne(anyIf(measurement, startsWith(measurement, 'WT') AND value = 1), 'WT', '')) as типПогоды
FROM file('$i.csv.gz', CSV, 'station_id String, дата String, measurement String, value Int64, mFlag String, qFlag String, sFlag String, obsTime String')
 WHERE qFlag = '' AND (measurement IN ('PRCP', 'SNOW', 'SNWD', 'TMAX', 'TAVG', 'TMIN', 'PSUN', 'AWND', 'WSFG') OR startsWith(measurement, 'WT'))
GROUP BY station_id, дата
ORDER BY station_id, дата FORMAT CSV" >> "noaa.csv";
done
```

Этот запрос создаёт один файл `noaa.csv` размером 50 ГБ.

### Обогащение данных

В данных нет информации о местоположении, кроме идентификатора станции, который включает префикс с кодом страны. В идеале у каждой станции должны быть указаны широта и долгота. Для этого NOAA предоставляет сведения о каждой станции в отдельном файле [ghcnd-stations.txt](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file). Этот файл содержит [несколько столбцов](https://github.com/awslabs/open-data-docs/tree/main/docs/noaa/noaa-ghcn#format-of-ghcnd-stationstxt-file), из которых пять будут полезны для нашего последующего анализа: id, latitude, longitude, elevation и name.

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

Выполнение этого запроса занимает несколько минут и создает файл размером 6,4 ГБ `noaa_enriched.parquet`.


## Создание таблицы

Создайте таблицу MergeTree в ClickHouse (через клиент ClickHouse).

```sql
CREATE TABLE noaa
(
   `station_id` LowCardinality(String),
   `date` Date32,
   `tempAvg` Int32 COMMENT 'Средняя температура (десятые доли градуса Цельсия)',
   `tempMax` Int32 COMMENT 'Максимальная температура (десятые доли градуса Цельсия)',
   `tempMin` Int32 COMMENT 'Минимальная температура (десятые доли градуса Цельсия)',
   `precipitation` UInt32 COMMENT 'Осадки (десятые доли мм)',
   `snowfall` UInt32 COMMENT 'Количество выпавшего снега (мм)',
   `snowDepth` UInt32 COMMENT 'Глубина снежного покрова (мм)',
   `percentDailySun` UInt8 COMMENT 'Дневной процент возможной солнечной активности (%)',
   `averageWindSpeed` UInt32 COMMENT 'Средняя суточная скорость ветра (десятые доли м/с)',
   `maxWindSpeed` UInt32 COMMENT 'Пиковая скорость порыва ветра (десятые доли м/с)',
   `weatherType` Enum8('Normal' = 0, 'Fog' = 1, 'Heavy Fog' = 2, 'Thunder' = 3, 'Small Hail' = 4, 'Hail' = 5, 'Glaze' = 6, 'Dust/Ash' = 7, 'Smoke/Haze' = 8, 'Blowing/Drifting Snow' = 9, 'Tornado' = 10, 'High Winds' = 11, 'Blowing Spray' = 12, 'Mist' = 13, 'Drizzle' = 14, 'Freezing Drizzle' = 15, 'Rain' = 16, 'Freezing Rain' = 17, 'Snow' = 18, 'Unknown Precipitation' = 19, 'Ground Fog' = 21, 'Freezing Fog' = 22),
   `location` Point,
   `elevation` Float32,
   `name` LowCardinality(String)
) ENGINE = MergeTree() ORDER BY (station_id, date);

```


## Вставка данных в ClickHouse

### Вставка из локального файла

Данные можно вставить из локального файла следующим образом (с помощью клиента ClickHouse):

```sql
INSERT INTO noaa FROM INFILE '<path>/noaa_enriched.parquet'
```

где `<path>` означает полный путь к локальному файлу на диске.

См. [здесь](https://clickhouse.com/blog/real-world-data-noaa-climate-data#load-the-data), как ускорить загрузку данных.

### Вставка из S3

```sql
INSERT INTO noaa SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/noaa/noaa_enriched.parquet')

```

О том, как ускорить этот процесс, см. нашу статью в блоге о [настройке загрузки больших объёмов данных](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2).


## Примеры запросов

### Максимальная зарегистрированная температура

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

Обнадеживающе, данные полностью согласуются с [задокументированным рекордом](https://en.wikipedia.org/wiki/List_of_weather_records#Highest_temperatures_ever_recorded) в [Furnace Creek](https://www.google.com/maps/place/36%C2%B027'00.0%22N+116%C2%B052'00.1%22W/@36.1329666,-116.1104099,8.95z/data=!4m5!3m4!1s0x0:0xf2ed901b860f4446!8m2!3d36.45!4d-116.8667) по состоянию на 2023 год.

### Лучшие горнолыжные курорты

Используя [список горнолыжных курортов](https://gist.githubusercontent.com/gingerwizard/dd022f754fd128fdaf270e58fa052e35/raw/622e03c37460f17ef72907afe554cb1c07f91f23/ski_resort_stats.csv) в США и их координаты, мы выполняем соединение с 1000 метеостанциями, у которых за последние 5 лет в каком‑либо месяце фиксировалось наибольшее количество осадков. Отсортировав результат по [geoDistance](/sql-reference/functions/geo/coordinates/#geodistance) и ограничив выборку случаями, когда расстояние меньше 20 км, мы выбираем лучший результат для каждого курорта и сортируем их по общему количеству снега. Обратите внимание, что мы также ограничиваем выборку курортами, расположенными выше 1800 м, как приблизительным показателем хороших условий для катания на лыжах.


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

Мы выражаем признательность Global Historical Climatology Network за подготовку, очистку и распространение этих данных. Благодарим за проделанную работу.

Menne, M.J., I. Durre, B. Korzeniewski, S. McNeal, K. Thomas, X. Yin, S. Anthony, R. Ray, R.S. Vose, B.E. Gleason, and T.G. Houston, 2012: Global Historical Climatology Network - Daily (GHCN-Daily), Version 3. [укажите используемое подмножество после десятичной точки, например, Version 3.25]. NOAA National Centers for Environmental Information. http://doi.org/10.7289/V5D21VHZ [17/08/2020]

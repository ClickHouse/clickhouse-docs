---
description: 'Прием и запрос данных в формате Tab Separated Value за 5 шагов'
sidebar_label: 'Данные жалоб NYPD'
slug: /getting-started/example-datasets/nypd_complaint_data
title: 'Данные жалоб NYPD'
---

Файлы Tab Separated Value, или TSV, являются распространёнными и могут содержать заголовки полей в первой строке файла. ClickHouse может принимать TSV и также может запрашивать TSV без их загрузки. Этот гид охватывает оба этих случая. Если вам нужно запросить или загрузить CSV-файлы, те же техники работают, просто замените `TSV` на `CSV` в ваших аргументах формата.

Во время работы с этим гидом вы:
- **Изучите**: Запросите структуру и содержимое TSV-файла.
- **Определите целевую схему ClickHouse**: Выберите подходящие типы данных и сопоставьте существующие данные с этими типами.
- **Создайте таблицу ClickHouse**.
- **Предобработайте и отправьте** данные в ClickHouse.
- **Запустите некоторые запросы** к ClickHouse.

Данный набор данных был получен из команды NYC Open Data и содержит данные о "всех действительных delitos, проступках и правонарушениях, сообщённых в Полицейский департамент Нью-Йорка (NYPD)". На момент написания размер файла данных составляет 166 МБ, но он регулярно обновляется.

**Источник**: [data.cityofnewyork.us](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)  
**Условия использования**: https://www1.nyc.gov/home/terms-of-use.page

## Предварительные требования {#prerequisites}
- Скачайте набор данных, посетив страницу [NYPD Complaint Data Current (Year To Date)](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243), нажав кнопку Экспорт и выбрав **TSV для Excel**.
- Установите [сервер и клиент ClickHouse](../../getting-started/install/install.mdx)

### Примечание о командах, описанных в этом руководстве {#a-note-about-the-commands-described-in-this-guide}
В этом руководстве есть два типа команд:
- Некоторые команды запрашивают файлы TSV, эти команды выполняются в командной строке.
- Остальные команды запрашивают ClickHouse, и эти команды выполняются в `clickhouse-client` или Play UI.

:::note
Примеры в этом руководстве предполагают, что вы сохранили файл TSV в `${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`, пожалуйста, при необходимости скорректируйте команды.
:::

## Ознакомьтесь с файлом TSV {#familiarize-yourself-with-the-tsv-file}

Перед тем как начать работу с базой данных ClickHouse, ознакомьтесь с данными.

### Просмотрите поля в исходном TSV файле {#look-at-the-fields-in-the-source-tsv-file}

Это пример команды для запроса TSV-файла, но не выполняйте её пока.
```sh
clickhouse-local --query \
"describe file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')"
```

Пример результата
```response
CMPLNT_NUM                  Nullable(Float64)
ADDR_PCT_CD                 Nullable(Float64)
BORO_NM                     Nullable(String)
CMPLNT_FR_DT                Nullable(String)
CMPLNT_FR_TM                Nullable(String)
```

:::tip
Чаще всего приведенная выше команда сообщит вам, какие поля в входных данных являются числовыми, а какие строковыми, а также какие являются кортежами. Это не всегда так. Поскольку ClickHouse обычно используется с наборами данных, содержащими миллиарды записей, по умолчанию проверяется 100 строк для [вывода схемы](/integrations/data-formats/json/inference), чтобы избежать разбора миллиардов строк для вывода схемы. Ответ ниже может не совпадать с тем, что вы видите, так как набор данных обновляется несколько раз в год. Посмотрев на словарь данных, вы можете увидеть, что CMPLNT_NUM указан как текст, а не как числовой. Путём переопределения значения по умолчанию в 100 строк для вывода при помощи установки `SETTINGS input_format_max_rows_to_read_for_schema_inference=2000`
вы сможете лучше понять содержимое.

Примечание: начиная с версии 22.5, значение по умолчанию теперь 25 000 строк для вывода схемы, поэтому изменяйте это значение только если вы используете более старую версию или если вам нужно более 25 000 строк для выборки.
:::

Выполните эту команду в командной строке. Вы будете использовать `clickhouse-local` для запроса данных в TSV-файле, который вы загрузили.
```sh
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"describe file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')"
```

Результат:
```response
CMPLNT_NUM        Nullable(String)
ADDR_PCT_CD       Nullable(Float64)
BORO_NM           Nullable(String)
CMPLNT_FR_DT      Nullable(String)
CMPLNT_FR_TM      Nullable(String)
CMPLNT_TO_DT      Nullable(String)
CMPLNT_TO_TM      Nullable(String)
CRM_ATPT_CPTD_CD  Nullable(String)
HADEVELOPT        Nullable(String)
HOUSING_PSA       Nullable(Float64)
JURISDICTION_CODE Nullable(Float64)
JURIS_DESC        Nullable(String)
KY_CD             Nullable(Float64)
LAW_CAT_CD        Nullable(String)
LOC_OF_OCCUR_DESC Nullable(String)
OFNS_DESC         Nullable(String)
PARKS_NM          Nullable(String)
PATROL_BORO       Nullable(String)
PD_CD             Nullable(Float64)
PD_DESC           Nullable(String)
PREM_TYP_DESC     Nullable(String)
RPT_DT            Nullable(String)
STATION_NAME      Nullable(String)
SUSP_AGE_GROUP    Nullable(String)
SUSP_RACE         Nullable(String)
SUSP_SEX          Nullable(String)
TRANSIT_DISTRICT  Nullable(Float64)
VIC_AGE_GROUP     Nullable(String)
VIC_RACE          Nullable(String)
VIC_SEX           Nullable(String)
X_COORD_CD        Nullable(Float64)
Y_COORD_CD        Nullable(Float64)
Latitude          Nullable(Float64)
Longitude         Nullable(Float64)
Lat_Lon           Tuple(Nullable(Float64), Nullable(Float64))
New Georeferenced Column Nullable(String)
```

На этом этапе вам следует проверить, что колонки в файле TSV соответствуют именам и типам, указанным в разделе **Columns in this Dataset** на [веб-странице набора данных](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243). Типы данных не очень специфичны, все числовые поля установлены как `Nullable(Float64)`, а все остальные поля — как `Nullable(String)`. Когда вы создадите таблицу ClickHouse для хранения данных, вы сможете указать более подходящие и производительные типы.

### Определите правильную схему {#determine-the-proper-schema}

Чтобы выяснить, какие типы следует использовать для полей, необходимо знать, как выглядят данные. Например, поле `JURISDICTION_CODE` является числовым: должен ли оно быть `UInt8`, или `Enum`, или же `Float64` подходит?

```sql
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select JURISDICTION_CODE, count() FROM
 file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
 GROUP BY JURISDICTION_CODE
 ORDER BY JURISDICTION_CODE
 FORMAT PrettyCompact"
```

Результат:
```response
┌─JURISDICTION_CODE─┬─count()─┐
│                 0 │  188875 │
│                 1 │    4799 │
│                 2 │   13833 │
│                 3 │     656 │
│                 4 │      51 │
│                 6 │       5 │
│                 7 │       2 │
│                 9 │      13 │
│                11 │      14 │
│                12 │       5 │
│                13 │       2 │
│                14 │      70 │
│                15 │      20 │
│                72 │     159 │
│                87 │       9 │
│                88 │      75 │
│                97 │     405 │
└───────────────────┴─────────┘
```

Ответ запроса показывает, что `JURISDICTION_CODE` хорошо помещается в `UInt8`.

Аналогично, посмотрите на некоторые поля `String` и проверьте, подходят ли они для типов `DateTime` или [`LowCardinality(String)`](../../sql-reference/data-types/lowcardinality.md).

Например, поле `PARKS_NM` описывается как "Название парка, игровой площадки или зеленого пространства NYC, если применимо (государственные парки не включены)". Названия парков в Нью-Йорке могут быть хорошим кандидатом для `LowCardinality(String)`:

```sh
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select count(distinct PARKS_NM) FROM
 file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
 FORMAT PrettyCompact"
```

Результат:
```response
┌─uniqExact(PARKS_NM)─┐
│                 319 │
└─────────────────────┘
```

Посмотрите на некоторые названия парков:
```sql
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select distinct PARKS_NM FROM
 file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
 LIMIT 10
 FORMAT PrettyCompact"
```

Результат:
```response
┌─PARKS_NM───────────────────┐
│ (null)                     │
│ ASSER LEVY PARK            │
│ JAMES J WALKER PARK        │
│ BELT PARKWAY/SHORE PARKWAY │
│ PROSPECT PARK              │
│ MONTEFIORE SQUARE          │
│ SUTTON PLACE PARK          │
│ JOYCE KILMER PARK          │
│ ALLEY ATHLETIC PLAYGROUND  │
│ ASTORIA PARK               │
└────────────────────────────┘
```

Набор данных, использованный на момент написания, содержит всего несколько сотен уникальных парков и игровых площадок в колонке `PARK_NM`. Это небольшое количество, согласно рекомендации [LowCardinality](/sql-reference/data-types/lowcardinality#description) оставаться ниже 10,000 уникальных строк в поле `LowCardinality(String)`.

### Поля DateTime {#datetime-fields}
Согласно разделу **Columns in this Dataset** на [веб-странице набора данных](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243), есть поля даты и времени для начала и окончания зарегистрированного события. Посмотрев на минимум и максимум полей `CMPLNT_FR_DT` и `CMPLT_TO_DT`, мы можем получить представление о том, всегда ли эти поля заполнены:

```sh title="CMPLNT_FR_DT"
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select min(CMPLNT_FR_DT), max(CMPLNT_FR_DT) FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
FORMAT PrettyCompact"
```

Результат:
```response
┌─min(CMPLNT_FR_DT)─┬─max(CMPLNT_FR_DT)─┐
│ 01/01/1973        │ 12/31/2021        │
└───────────────────┴───────────────────┘
```

```sh title="CMPLNT_TO_DT"
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select min(CMPLNT_TO_DT), max(CMPLNT_TO_DT) FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
FORMAT PrettyCompact"
```

Результат:
```response
┌─min(CMPLNT_TO_DT)─┬─max(CMPLNT_TO_DT)─┐
│                   │ 12/31/2021        │
└───────────────────┴───────────────────┘
```

```sh title="CMPLNT_FR_TM"
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select min(CMPLNT_FR_TM), max(CMPLNT_FR_TM) FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
FORMAT PrettyCompact"
```

Результат:
```response
┌─min(CMPLNT_FR_TM)─┬─max(CMPLNT_FR_TM)─┐
│ 00:00:00          │ 23:59:00          │
└───────────────────┴───────────────────┘
```

```sh title="CMPLNT_TO_TM"
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select min(CMPLNT_TO_TM), max(CMPLNT_TO_TM) FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
FORMAT PrettyCompact"
```

Результат:
```response
┌─min(CMPLNT_TO_TM)─┬─max(CMPLNT_TO_TM)─┐
│ (null)            │ 23:59:00          │
└───────────────────┴───────────────────┘
```

## Постройте план {#make-a-plan}

Основываясь на вышеизложенном исследовании:
- `JURISDICTION_CODE` следует отобразить как `UInt8`.
- `PARKS_NM` следует отобразить на `LowCardinality(String)`
- `CMPLNT_FR_DT` и `CMPLNT_FR_TM` всегда заполнены (возможно, со значением времени по умолчанию `00:00:00`)
- `CMPLNT_TO_DT` и `CMPLNT_TO_TM` могут быть пустыми
- Даты и время хранятся в отдельных полях в источнике
- Даты имеют формат `mm/dd/yyyy`
- Время имеет формат `hh:mm:ss`
- Даты и время можно объединить в типы DateTime
- Некоторые даты находятся до 1 января 1970 года, что означает, что нам нужен 64-битный тип DateTime

:::note
Есть много других изменений, которые следует внести в типы, все они могут быть определены, следуя тем же шагам по исследованию. Посмотрите на количество уникальных строк в поле, минимальные и максимальные значения чисел и принимайте ваши решения. Схема таблицы, приведенная позже в руководстве, содержит много строк с низкой кардинальностью и полей беззнаковых целых чисел, и очень мало числа с плавающей точкой.
:::

## Объедините поля даты и времени {#concatenate-the-date-and-time-fields}

Чтобы объединить поля даты и времени `CMPLNT_FR_DT` и `CMPLNT_FR_TM` в одну строку `String`, которую можно привести к типу `DateTime`, выберите два поля, соединённых оператором конкатенации: `CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM`. Поля `CMPLNT_TO_DT` и `CMPLNT_TO_TM` обрабатываются аналогично.

```sh
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM AS complaint_begin FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
LIMIT 10
FORMAT PrettyCompact"
```

Результат:
```response
┌─complaint_begin─────┐
│ 07/29/2010 00:01:00 │
│ 12/01/2011 12:00:00 │
│ 04/01/2017 15:00:00 │
│ 03/26/2018 17:20:00 │
│ 01/01/2019 00:00:00 │
│ 06/14/2019 00:00:00 │
│ 11/29/2021 20:00:00 │
│ 12/04/2021 00:35:00 │
│ 12/05/2021 12:50:00 │
│ 12/07/2021 20:30:00 │
└─────────────────────┘
```

## Преобразуйте строку даты и времени в тип DateTime64 {#convert-the-date-and-time-string-to-a-datetime64-type}

Ранее в руководстве мы обнаружили, что в файле TSV есть даты до 1 января 1970 года, что означает, что нам нужен 64-битный тип DateTime для хранения дат. Даты также необходимо преобразовать из формата `MM/DD/YYYY` в формат `YYYY/MM/DD`. Оба этих преобразования можно выполнить с помощью [`parseDateTime64BestEffort()`](../../sql-reference/functions/type-conversion-functions.md#parsedatetime64besteffort).

```sh
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"WITH (CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM) AS CMPLNT_START,
      (CMPLNT_TO_DT || ' ' || CMPLNT_TO_TM) AS CMPLNT_END
select parseDateTime64BestEffort(CMPLNT_START) AS complaint_begin,
       parseDateTime64BestEffortOrNull(CMPLNT_END) AS complaint_end
FROM file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
ORDER BY complaint_begin ASC
LIMIT 25
FORMAT PrettyCompact"
```

В строках 2 и 3 выше содержится конкатенация из предыдущего шага, а строки 4 и 5 выше разбирают строки в `DateTime64`. Поскольку время окончания жалобы не гарантировано, используется `parseDateTime64BestEffortOrNull`.

Результат:
```response
┌─────────complaint_begin─┬───────────complaint_end─┐
│ 1925-01-01 10:00:00.000 │ 2021-02-12 09:30:00.000 │
│ 1925-01-01 11:37:00.000 │ 2022-01-16 11:49:00.000 │
│ 1925-01-01 15:00:00.000 │ 2021-12-31 00:00:00.000 │
│ 1925-01-01 15:00:00.000 │ 2022-02-02 22:00:00.000 │
│ 1925-01-01 19:00:00.000 │ 2022-04-14 05:00:00.000 │
│ 1955-09-01 19:55:00.000 │ 2022-08-01 00:45:00.000 │
│ 1972-03-17 11:40:00.000 │ 2022-03-17 11:43:00.000 │
│ 1972-05-23 22:00:00.000 │ 2022-05-24 09:00:00.000 │
│ 1972-05-30 23:37:00.000 │ 2022-05-30 23:50:00.000 │
│ 1972-07-04 02:17:00.000 │                    ᴺᵁᴸᴸ │
│ 1973-01-01 00:00:00.000 │                    ᴺᵁᴸᴸ │
│ 1975-01-01 00:00:00.000 │                    ᴺᵁᴸᴸ │
│ 1976-11-05 00:01:00.000 │ 1988-10-05 23:59:00.000 │
│ 1977-01-01 00:00:00.000 │ 1977-01-01 23:59:00.000 │
│ 1977-12-20 00:01:00.000 │                    ᴺᵁᴸᴸ │
│ 1981-01-01 00:01:00.000 │                    ᴺᵁᴸᴸ │
│ 1981-08-14 00:00:00.000 │ 1987-08-13 23:59:00.000 │
│ 1983-01-07 00:00:00.000 │ 1990-01-06 00:00:00.000 │
│ 1984-01-01 00:01:00.000 │ 1984-12-31 23:59:00.000 │
│ 1985-01-01 12:00:00.000 │ 1987-12-31 15:00:00.000 │
│ 1985-01-11 09:00:00.000 │ 1985-12-31 12:00:00.000 │
│ 1986-03-16 00:05:00.000 │ 2022-03-16 00:45:00.000 │
│ 1987-01-07 00:00:00.000 │ 1987-01-09 00:00:00.000 │
│ 1988-04-03 18:30:00.000 │ 2022-08-03 09:45:00.000 │
│ 1988-07-29 12:00:00.000 │ 1990-07-27 22:00:00.000 │
└─────────────────────────┴─────────────────────────┘
```
:::note
Даты, показанные как `1925`, являются следствием ошибок в данных. В оригинальных данных есть несколько записей с датами в годах `1019` - `1022`, которые должны быть `2019` - `2022`. Они хранятся как 1 января 1925 года, поскольку это самая ранняя дата с 64-битным DateTime.
:::

## Создайте таблицу {#create-a-table}

Решения, принятые выше относительно типов данных для столбцов, отражены в схеме таблицы ниже. Нам также нужно решить, каковы будут `ORDER BY` и `PRIMARY KEY`, используемые для таблицы. Должен быть указан хотя бы один из `ORDER BY` или `PRIMARY KEY`. Вот некоторые рекомендации по выбору столбцов для включения в `ORDER BY`, а более подробная информация приведена в разделе *Next Steps* в конце этого документа.

### Clauses ORDER BY и PRIMARY KEY {#order-by-and-primary-key-clauses}

- Кортеж `ORDER BY` должен включать поля, которые используются в фильтрах запросов
- Чтобы максимизировать сжатие на диске, кортеж `ORDER BY` должен быть упорядочен по возрастанию кардинальности
- Если он существует, кортеж `PRIMARY KEY` должен быть подмножеством кортежа `ORDER BY`
- Если указан только `ORDER BY`, тогда будет использоваться тот же самый кортеж как `PRIMARY KEY`
- Индекс первичного ключа создаётся с использованием кортежа `PRIMARY KEY`, если он указан, в противном случае используется кортеж `ORDER BY`
- Индекс `PRIMARY KEY` хранится в основной памяти

С учетом набора данных и вопросов, на которые можно ответить, запрашивая его, мы можем решить, что хотим рассмотреть виды преступлений, сообщаемых за всё время в пяти районах Нью-Йорка. Эти поля могут быть включены в `ORDER BY`:

| Столбец      | Описание (из словаря данных)                 |
| ----------- | --------------------------------------------------- |
| OFNS_DESC   | Описание правонарушения, соответствующее ключевому коду     |
| RPT_DT      | Дата, когда событие было сообщено полиции                      |
| BORO_NM     | Название района, в котором случился инцидент |


Запрашивая файл TSV для кардинальности трёх кандидатов:

```bash
clickhouse-local --input_format_max_rows_to_read_for_schema_inference=2000 \
--query \
"select formatReadableQuantity(uniq(OFNS_DESC)) as cardinality_OFNS_DESC,
        formatReadableQuantity(uniq(RPT_DT)) as cardinality_RPT_DT,
        formatReadableQuantity(uniq(BORO_NM)) as cardinality_BORO_NM
  FROM
  file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')
  FORMAT PrettyCompact"
```

Результат:
```response
┌─cardinality_OFNS_DESC─┬─cardinality_RPT_DT─┬─cardinality_BORO_NM─┐
│ 60.00                 │ 306.00             │ 6.00                │
└───────────────────────┴────────────────────┴─────────────────────┘
```
Упорядочивая по кардинальности, `ORDER BY` становится:

```sql
ORDER BY ( BORO_NM, OFNS_DESC, RPT_DT )
```
:::note
Таблица ниже будет использовать более удобочитаемые названия колонок, вышеуказанные имена будут сопоставлены с
```sql
ORDER BY ( borough, offense_description, date_reported )
```
:::

Собирая изменения в типах данных и кортеж `ORDER BY`, мы получаем такую структуру таблицы:

```sql
CREATE TABLE NYPD_Complaint (
    complaint_number     String,
    precinct             UInt8,
    borough              LowCardinality(String),
    complaint_begin      DateTime64(0,'America/New_York'),
    complaint_end        DateTime64(0,'America/New_York'),
    was_crime_completed  String,
    housing_authority    String,
    housing_level_code   UInt32,
    jurisdiction_code    UInt8,
    jurisdiction         LowCardinality(String),
    offense_code         UInt8,
    offense_level        LowCardinality(String),
    location_descriptor  LowCardinality(String),
    offense_description  LowCardinality(String),
    park_name            LowCardinality(String),
    patrol_borough       LowCardinality(String),
    PD_CD                UInt16,
    PD_DESC              String,
    location_type        LowCardinality(String),
    date_reported        Date,
    transit_station      LowCardinality(String),
    suspect_age_group    LowCardinality(String),
    suspect_race         LowCardinality(String),
    suspect_sex          LowCardinality(String),
    transit_district     UInt8,
    victim_age_group     LowCardinality(String),
    victim_race          LowCardinality(String),
    victim_sex           LowCardinality(String),
    NY_x_coordinate      UInt32,
    NY_y_coordinate      UInt32,
    Latitude             Float64,
    Longitude            Float64
) ENGINE = MergeTree
  ORDER BY ( borough, offense_description, date_reported )
```

### Поиск первичного ключа таблицы {#finding-the-primary-key-of-a-table}

База данных ClickHouse `system`, в частности `system.tables`, содержит всю информацию о таблице, которую вы только что создали. Этот запрос показывает `ORDER BY` (ключ сортировки) и `PRIMARY KEY`:
```sql
SELECT
    partition_key,
    sorting_key,
    primary_key,
    table
FROM system.tables
WHERE table = 'NYPD_Complaint'
FORMAT Vertical
```

Ответ
```response
Query id: 6a5b10bf-9333-4090-b36e-c7f08b1d9e01

Row 1:
──────
partition_key:
sorting_key:   borough, offense_description, date_reported
primary_key:   borough, offense_description, date_reported
table:         NYPD_Complaint

1 row in set. Elapsed: 0.001 sec.
```

## Предобработка и импорт данных {#preprocess-import-data}

Мы будем использовать инструмент `clickhouse-local` для предобработки данных и `clickhouse-client` для их загрузки.

### Используемые аргументы `clickhouse-local` {#clickhouse-local-arguments-used}

:::tip
`table='input'` появляется в аргументах к clickhouse-local ниже.  clickhouse-local принимает представленный ввод (`cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`) и вставляет ввод в таблицу. По умолчанию таблица называется `table`. В этом руководстве название таблицы устанавливается как `input`, чтобы сделать поток данных более понятным. Последний аргумент для clickhouse-local — это запрос, который выбирает из таблицы (`FROM input`), который затем передаётся в `clickhouse-client` для заполнения таблицы `NYPD_Complaint`.
:::

```sql
cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv \
  | clickhouse-local --table='input' --input-format='TSVWithNames' \
  --input_format_max_rows_to_read_for_schema_inference=2000 \
  --query "
    WITH (CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM) AS CMPLNT_START,
     (CMPLNT_TO_DT || ' ' || CMPLNT_TO_TM) AS CMPLNT_END
    SELECT
      CMPLNT_NUM                                  AS complaint_number,
      ADDR_PCT_CD                                 AS precinct,
      BORO_NM                                     AS borough,
      parseDateTime64BestEffort(CMPLNT_START)     AS complaint_begin,
      parseDateTime64BestEffortOrNull(CMPLNT_END) AS complaint_end,
      CRM_ATPT_CPTD_CD                            AS was_crime_completed,
      HADEVELOPT                                  AS housing_authority_development,
      HOUSING_PSA                                 AS housing_level_code,
      JURISDICTION_CODE                           AS jurisdiction_code,
      JURIS_DESC                                  AS jurisdiction,
      KY_CD                                       AS offense_code,
      LAW_CAT_CD                                  AS offense_level,
      LOC_OF_OCCUR_DESC                           AS location_descriptor,
      OFNS_DESC                                   AS offense_description,
      PARKS_NM                                    AS park_name,
      PATROL_BORO                                 AS patrol_borough,
      PD_CD,
      PD_DESC,
      PREM_TYP_DESC                               AS location_type,
      toDate(parseDateTimeBestEffort(RPT_DT))     AS date_reported,
      STATION_NAME                                AS transit_station,
      SUSP_AGE_GROUP                              AS suspect_age_group,
      SUSP_RACE                                   AS suspect_race,
      SUSP_SEX                                    AS suspect_sex,
      TRANSIT_DISTRICT                            AS transit_district,
      VIC_AGE_GROUP                               AS victim_age_group,
      VIC_RACE                                    AS victim_race,
      VIC_SEX                                     AS victim_sex,
      X_COORD_CD                                  AS NY_x_coordinate,
      Y_COORD_CD                                  AS NY_y_coordinate,
      Latitude,
      Longitude
    FROM input" \
  | clickhouse-client --query='INSERT INTO NYPD_Complaint FORMAT TSV'
```

## Проверьте данные {#validate-data}

:::note
Набор данных меняется один или несколько раз в год, ваши подсчёты могут не совпадать с тем, что указано в этом документе.
:::

Запрос:

```sql
SELECT count()
FROM NYPD_Complaint
```

Результат:

```text
┌─count()─┐
│  208993 │
└─────────┘

1 row in set. Elapsed: 0.001 sec.
```

Размер набора данных в ClickHouse составляет всего 12% от оригинального TSV-файла, сравните размер оригинального TSV-файла с размером таблицы:

Запрос:

```sql
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'NYPD_Complaint'
```

Результат:
```text
┌─formatReadableSize(total_bytes)─┐
│ 8.63 MiB                        │
└─────────────────────────────────┘
```

## Выполните некоторые запросы {#run-queries}

### Запрос 1. Сравните количество жалоб по месяцам {#query-1-compare-the-number-of-complaints-by-month}

Запрос:

```sql
SELECT
    dateName('month', date_reported) AS month,
    count() AS complaints,
    bar(complaints, 0, 50000, 80)
FROM NYPD_Complaint
GROUP BY month
ORDER BY complaints DESC
```

Результат:
```response
Query id: 7fbd4244-b32a-4acf-b1f3-c3aa198e74d9

┌─month─────┬─complaints─┬─bar(count(), 0, 50000, 80)───────────────────────────────┐
│ March     │      34536 │ ███████████████████████████████████████████████████████▎ │
│ May       │      34250 │ ██████████████████████████████████████████████████████▋  │
│ April     │      32541 │ ████████████████████████████████████████████████████     │
│ January   │      30806 │ █████████████████████████████████████████████████▎       │
│ February  │      28118 │ ████████████████████████████████████████████▊            │
│ November  │       7474 │ ███████████▊                                             │
│ December  │       7223 │ ███████████▌                                             │
│ October   │       7070 │ ███████████▎                                             │
│ September │       6910 │ ███████████                                              │
│ August    │       6801 │ ██████████▊                                              │
│ June      │       6779 │ ██████████▋                                              │
│ July      │       6485 │ ██████████▍                                              │
└───────────┴────────────┴──────────────────────────────────────────────────────────┘

12 rows in set. Elapsed: 0.006 sec. Processed 208.99 thousand rows, 417.99 KB (37.48 million rows/s., 74.96 MB/s.)
```

### Запрос 2. Сравните общее количество жалоб по району {#query-2-compare-total-number-of-complaints-by-borough}

Запрос:

```sql
SELECT
    borough,
    count() AS complaints,
    bar(complaints, 0, 125000, 60)
FROM NYPD_Complaint
GROUP BY borough
ORDER BY complaints DESC
```

Результат:
```response
Query id: 8cdcdfd4-908f-4be0-99e3-265722a2ab8d

┌─borough───────┬─complaints─┬─bar(count(), 0, 125000, 60)──┐
│ BROOKLYN      │      57947 │ ███████████████████████████▋ │
│ MANHATTAN     │      53025 │ █████████████████████████▍   │
│ QUEENS        │      44875 │ █████████████████████▌       │
│ BRONX         │      44260 │ █████████████████████▏       │
│ STATEN ISLAND │       8503 │ ████                         │
│ (null)        │        383 │ ▏                            │
└───────────────┴────────────┴──────────────────────────────┘

6 rows in set. Elapsed: 0.008 sec. Processed 208.99 thousand rows, 209.43 KB (27.14 million rows/s., 27.20 MB/s.)
```

## Следующие шаги {#next-steps}

[Практическое введение в разреженные первичные индексы в ClickHouse](/guides/best-practices/sparse-primary-indexes.md) обсуждает различия в индексировании ClickHouse по сравнению с традиционными реляционными базами данных, как ClickHouse строит и использует разреженный первичный индекс, а также лучшие практики индексации.

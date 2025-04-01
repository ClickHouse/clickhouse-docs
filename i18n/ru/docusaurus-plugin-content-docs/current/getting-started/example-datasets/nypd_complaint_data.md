---
description: 'Прием и запрос данных в формате Tab Separated Value за 5 шагов'
sidebar_label: 'Данные о жалобах NYPD'
slug: /getting-started/example-datasets/nypd_complaint_data
title: 'Данные о жалобах NYPD'
---

Файлы формата Tab Separated Value или TSV часто используются и могут содержать заголовки полей в первой строке файла. ClickHouse может принимать TSV-файлы и также может запрашивать их без предварительного импорта файлов. Этот гид охватывает оба случая. Если вам нужно запрашивать или загружать файлы CSV, те же методы работают, просто замените `TSV` на `CSV` в ваших аргументах формата.

Во время работы с этим руководством вы будете:
- **Исследовать**: Запрашивать структуру и содержимое файла TSV.
- **Определять целевую схему ClickHouse**: Выбирать подходящие типы данных и сопоставлять существующие данные с этими типами.
- **Создавать таблицу ClickHouse**.
- **Подготавливать и передавать** данные в ClickHouse.
- **Запускать некоторые запросы** к ClickHouse.

Набор данных, используемый в этом руководстве, поступает от команды NYC Open Data и содержит данные о "всех действительных преступлениях, преступлениях низкой тяжести и правонарушениях, сообщенных в Департамент полиции Нью-Йорка (NYPD)". На момент написания файл данных имеет размер 166 МБ, но регулярно обновляется.

**Источник**: [data.cityofnewyork.us](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)  
**Условия использования**: https://www1.nyc.gov/home/terms-of-use.page

## Предварительные требования {#prerequisites}
- Загрузите набор данных, посетив страницу [NYPD Complaint Data Current (Year To Date)](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243), нажмите кнопку Экспорт и выберите **TSV for Excel**.
- Установите [сервер и клиент ClickHouse](../../getting-started/install.md).
- [Запустите](../../getting-started/install.md#launch) сервер ClickHouse и подключитесь с помощью `clickhouse-client`

### Замечание о командах, описанных в этом руководстве {#a-note-about-the-commands-described-in-this-guide}
В этом руководстве есть два типа команд:
- Некоторые команды запрашивают файлы TSV, эти команды выполняются на командной строке.
- Остальные команды запрашивают ClickHouse и выполняются в `clickhouse-client` или Play UI.

:::note
Примеры в этом руководстве предполагают, что вы сохранили файл TSV в `${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`, пожалуйста, при необходимости скорректируйте команды.
:::

## Ознакомьтесь с файлом TSV {#familiarize-yourself-with-the-tsv-file}

Перед тем как начать работать с базой данных ClickHouse, ознакомьтесь с данными.

### Ознакомьтесь с полями в исходном файле TSV {#look-at-the-fields-in-the-source-tsv-file}

Это пример команды для запроса файла TSV, но пока не запускайте ее.
```sh
clickhouse-local --query \
"describe file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TSVWithNames')"
```

Пример ответа
```response
CMPLNT_NUM                  Nullable(Float64)
ADDR_PCT_CD                 Nullable(Float64)
BORO_NM                     Nullable(String)
CMPLNT_FR_DT                Nullable(String)
CMPLNT_FR_TM                Nullable(String)
```

:::tip
Чаще всего вышеуказанная команда даст вам знать, какие поля во входных данных являются числовыми, какие строками, а какие кортежами. Это не всегда так. Поскольку ClickHouse обычно используется с наборами данных, содержащими миллиарды записей, существует значение по умолчанию (100) для количества рассматриваемых строк для [вывода схемы](/integrations/data-formats/json/inference), чтобы избежать парсинга миллиардов строк для инференса схемы. Ответ ниже может не совпадать с тем, что вы видите, так как набор данных обновляется несколько раз в год. Обратясь к Словарю данных, вы увидите, что CMPLNT_NUM указан как текст, а не как числовой. Переопределив значение по умолчанию в 100 строк для инференса, установив `SETTINGS input_format_max_rows_to_read_for_schema_inference=2000`, вы сможете лучше понять содержимое.

Примечание: начиная с версии 22.5, значение по умолчанию теперь 25 000 строк для вывода схемы, поэтому изменяйте настройки только если вы используете более старую версию или если вам нужно, чтобы было выбрано более 25 000 строк.
:::

Запустите эту команду в командной строке. Вы будете использовать `clickhouse-local`, чтобы запросить данные в загруженном файле TSV.
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

На этом этапе вы должны проверить, что столбцы в файле TSV соответствуют именам и типам, указанным в разделе **Столбцы в этом наборе данных** на [веб-странице набора данных](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243). Типы данных не очень специфичны, все числовые поля установлены на `Nullable(Float64)`, а все остальные - на `Nullable(String)`. Когда вы создаете таблицу ClickHouse для хранения данных, вы можете указать более подходящие и производительные типы.

### Определите правильную схему {#determine-the-proper-schema}

Для того, чтобы понять, какие типы следует использовать для полей, необходимо знать, как выглядят данные. Например, поле `JURISDICTION_CODE` является числовым: должно ли оно быть `UInt8`, или `Enum`, или подойдет `Float64`?

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

Ответ на запрос показывает, что `JURISDICTION_CODE` хорошо подходит для `UInt8`.

Аналогично посмотрите некоторые поля типа `String` и проверьте, подходят ли они для использования в качестве полей типа `DateTime` или [`LowCardinality(String)`](../../sql-reference/data-types/lowcardinality.md).

Например, поле `PARKS_NM` описывается как "Имя парка NYC, игровой площадки или зеленого пространства, если применимо (государственные парки не включены)". Имена парков в Нью-Йорке могут быть хорошим кандидатом для `LowCardinality(String)`:

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

Посмотрите на некоторые имена парков:
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

Набор данных, используемый на момент написания, содержит всего несколько сотен различных парков и игровых площадок в колонке `PARK_NM`. Это небольшое число, опираясь на рекомендации [LowCardinality](/sql-reference/data-types/lowcardinality#description) оставаться ниже 10,000 уникальных строк в поле `LowCardinality(String)`.

### Поля DateTime {#datetime-fields}
Согласно разделу **Столбцы в этом наборе данных** на [веб-странице набора данных](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) существуют поля даты и времени для начала и конца зарегистрированного события. Посмотрев на min и max значений для `CMPLNT_FR_DT` и `CMPLT_TO_DT`, можно понять, всегда ли эти поля заполнены:

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

## Построение плана {#make-a-plan}

Основываясь на вышеупомянутом исследовании:
- `JURISDICTION_CODE` следует использовать как `UInt8`.
- `PARKS_NM` следует использовать как `LowCardinality(String)`
- `CMPLNT_FR_DT` и `CMPLNT_FR_TM` всегда заполнены (возможно, с умолчательным временем `00:00:00`)
- `CMPLNT_TO_DT` и `CMPLNT_TO_TM` могут быть пустыми
- Даты и времена хранятся в отдельных полях в источнике
- Даты имеют формат `mm/dd/yyyy`
- Времена имеют формат `hh:mm:ss`
- Даты и времена можно объединить в типы DateTime
- Есть несколько дат до 1 января 1970 года, что означает, что нам нужен 64-битный DateTime

:::note
Существует много других изменений, которые нужно внести в типы данных; их все можно определить, следуя тем же шагам исследования. Обратите внимание на количество уникальных строк в поле, на минимальные и максимальные значения чисел, и принимайте свои решения. Схема таблицы, представленная позже в руководстве, будет содержать много строк с низкой кардинальностью и полей беззнаковых целых чисел и очень мало чисел с плавающей точкой.
:::

## Объедините поля даты и времени {#concatenate-the-date-and-time-fields}

Чтобы объединить поля даты и времени `CMPLNT_FR_DT` и `CMPLNT_FR_TM` в одну строку, которую можно привести к типу `DateTime`, выберите два поля, соединенные оператором конкатенации: `CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM`.  Похожим образом обрабатываются поля `CMPLNT_TO_DT` и `CMPLNT_TO_TM`.

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

Ранее в руководстве мы обнаружили, что в файле TSV есть даты, предшествующие 1 января 1970 года, что означает, что нам нужен 64-битный тип DateTime для дат. Даты также нужно преобразовать из формата `MM/DD/YYYY` в формат `YYYY/MM/DD`. Оба эти действия можно выполнить с помощью [`parseDateTime64BestEffort()`](../../sql-reference/functions/type-conversion-functions.md#parsedatetime64besteffort).

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

Строки 2 и 3 выше содержат конкатенацию из предыдущего шага, а строки 4 и 5 выше разбирают строки в `DateTime64`. Поскольку время конца жалобы не гарантируется, используется `parseDateTime64BestEffortOrNull`.

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
Даты, показанные как `1925`, являются результатом ошибок в данных. В оригинальных данных есть несколько записей с датами лет `1019` - `1022`, которые должны быть `2019` - `2022`. Они хранятся как 1 января 1925 года, так как это самая ранняя дата с 64-битным DateTime.
:::

## Создайте таблицу {#create-a-table}

Решения, принятые выше для типов данных, используемых для столбцов, отражаются в схеме таблицы ниже. Нам также нужно определить `ORDER BY` и `PRIMARY KEY`, используемые для таблицы. Должен быть указан хотя бы один из `ORDER BY` или `PRIMARY KEY`. Вот некоторые рекомендации по выбору столбцов для включения в `ORDER BY`, а более подробная информация находится в разделе *Следующие шаги* в конце этого документа.

### Условия Order By и Primary Key {#order-by-and-primary-key-clauses}

- Кортеж `ORDER BY` должен включать поля, которые используются в фильтрах запросов
- Для максимизации сжатия на диске кортеж `ORDER BY` должен быть упорядочен по возрастающей кардинальности
- Если он есть, кортеж `PRIMARY KEY` должен быть подмножеством кортежа `ORDER BY`
- Если указан только `ORDER BY`, то тот же кортеж будет использован в качестве `PRIMARY KEY`
- Индекс первичного ключа создается с использованием кортежа `PRIMARY KEY`, если он указан, иначе используется кортеж `ORDER BY`
- Индекс `PRIMARY KEY` хранится в основной памяти

Изучая набор данных и вопросы, на которые можно ответить с помощью запросов, мы можем решить, что будем смотреть на виды преступлений, зарегистрированных с течением времени в пяти районах Нью-Йорка. Эти поля могут быть затем включены в `ORDER BY`:

| Столбец      | Описание (из словаря данных)                                 |
| ------------ | ------------------------------------------------------------ |
| OFNS_DESC    | Описание правонарушения, соответствующего ключевому коду     |
| RPT_DT       | Дата, когда событие было зарегистрировано в полицию          |
| BORO_NM      | Название района, в котором произошло событие                  |


Запрос к файлу TSV для кардинальности трех кандидатов:

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
Таблица ниже будет использовать более удобочитаемые имена столбцов, вышеуказанные имена будут сопоставлены с
```sql
ORDER BY ( borough, offense_description, date_reported )
```
:::

Собрав изменения в типах данных и кортеж `ORDER BY`, мы получаем следующую структуру таблицы:

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

### Нахождение первичного ключа таблицы {#finding-the-primary-key-of-a-table}

База данных ClickHouse `system`, в частности `system.tables`, содержит всю информацию о только что созданной таблице. Этот запрос показывает `ORDER BY` (ключ сортировки) и `PRIMARY KEY`:
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

### Аргументы `clickhouse-local`, используемые {#clickhouse-local-arguments-used}

:::tip
`table='input'` появляется в аргументах для clickhouse-local ниже.  clickhouse-local принимает предоставленный ввод (`cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`) и вставляет ввод в таблицу. По умолчанию таблица называется `table`. В этом руководстве имя таблицы установлено в `input`, чтобы сделать поток данных более понятным. Последний аргумент к clickhouse-local - это запрос, который выбирает из таблицы (`FROM input`), который затем передается в `clickhouse-client` для заполнения таблицы `NYPD_Complaint`.
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
Набор данных меняется один или несколько раз в год, ваши подсчеты могут не совпадать с тем, что указано в этом документе.
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

Размер набора данных в ClickHouse составляет всего 12% от оригинального файла TSV, сравните размер оригинального TSV файла с размером таблицы:

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

## Запустите несколько запросов {#run-queries}

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

12 строк в наборе. Затрачено: 0.006 сек. Обработано 208.99 тысяч строк, 417.99 КБ (37.48 миллиона строк/с, 74.96 МБ/с).
```

### Запрос 2. Сравните общее количество жалоб по районам {#query-2-compare-total-number-of-complaints-by-borough}

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

6 строк в наборе. Затрачено: 0.008 сек. Обработано 208.99 тысяч строк, 209.43 КБ (27.14 миллиона строк/с, 27.20 МБ/с).
```

## Следующие шаги {#next-steps}

[Практическое введение в разреженные первичные индексы в ClickHouse](/guides/best-practices/sparse-primary-indexes.md) обсуждает различия в индексировании ClickHouse по сравнению с традиционными реляционными базами данных, как ClickHouse строит и использует разреженный первичный индекс, и лучшие практики индексирования.

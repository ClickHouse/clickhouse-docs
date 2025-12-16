---
description: 'Приём и запрос данных в формате Tab Separated Value за 5 шагов'
sidebar_label: 'Данные о жалобах NYPD'
slug: /getting-started/example-datasets/nypd_complaint_data
title: 'Данные о жалобах NYPD'
doc_type: 'guide'
keywords: ['пример набора данных', 'nypd', 'данные о преступности', 'образец данных', 'открытые данные']
---

Файлы формата Tab Separated Value (TSV) широко распространены и могут содержать заголовки полей в первой строке файла. ClickHouse может выполнять приём TSV-файлов, а также выполнять запросы к TSV без предварительного приёма файлов. В этом руководстве рассматриваются оба варианта. Если вам нужно выполнять запросы к CSV-файлам или принимать их, можно использовать те же методы, просто замените `TSV` на `CSV` в аргументах формата.

Работая с этим руководством, вы будете:

- **Исследовать**: выполнять запросы к структуре и содержимому TSV-файла.
- **Определять целевую схему ClickHouse**: выбирать подходящие типы данных и сопоставлять им существующие данные.
- **Создавать таблицу ClickHouse**.
- **Предварительно обрабатывать и потоково загружать** данные в ClickHouse.
- **Выполнять несколько запросов** к ClickHouse.

Набор данных, используемый в этом руководстве, предоставлен командой NYC Open Data и содержит данные обо «всех действительных преступлениях категорий felony, misdemeanor и violation, о которых было сообщено в Департамент полиции города Нью-Йорка (NYPD)». На момент написания размер файла данных составляет 166 МБ, но он регулярно обновляется.

**Источник**: [data.cityofnewyork.us](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)  
**Условия использования**: https://www1.nyc.gov/home/terms-of-use.page

## Предварительные требования {#prerequisites}

- Загрузите набор данных, перейдя на страницу [NYPD Complaint Data Current (Year To Date)](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243), нажав кнопку Export и выбрав формат **TSV for Excel**.
- Установите [сервер и клиент ClickHouse](../../getting-started/install/install.mdx)

### Примечание о командах, описанных в этом руководстве {#a-note-about-the-commands-described-in-this-guide}

В этом руководстве используются два типа команд:

- Некоторые команды выполняют запросы к TSV-файлам и запускаются из командной строки.
- Остальные команды выполняют запросы к ClickHouse и запускаются в `clickhouse-client` или Play UI.

:::note
В примерах этого руководства предполагается, что вы сохранили TSV-файл в `${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`. При необходимости скорректируйте команды.
:::

## Ознакомьтесь с TSV-файлом {#familiarize-yourself-with-the-tsv-file}

Перед началом работы с базой данных ClickHouse ознакомьтесь с данными.

### Посмотрите на поля из исходного TSV-файла {#look-at-the-fields-in-the-source-tsv-file}

Это пример команды для выполнения запроса к TSV-файлу, но пока не запускайте её.

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
В большинстве случаев приведённая выше команда подскажет вам, какие поля во входных данных являются числовыми, какие — строками, а какие — кортежами. Однако так бывает не всегда. Поскольку ClickHouse часто используется с наборами данных, содержащими миллиарды записей, по умолчанию для [определения схемы](/integrations/data-formats/json/inference) анализируются только первые 100 строк, чтобы избежать разбора миллиардов строк для вывода схемы. Приведённый ниже ответ может не совпадать с тем, что видите вы, так как набор данных обновляется несколько раз в год. В словаре данных (Data Dictionary) вы можете увидеть, что CMPLNT&#95;NUM указан как текст, а не как числовое значение. Переопределив значение по умолчанию в 100 строк для определения схемы с помощью настройки `SETTINGS input_format_max_rows_to_read_for_schema_inference=2000`,
вы можете получить лучшее представление о содержимом.

Примечание: начиная с версии 22.5 значение по умолчанию для вывода схемы — 25 000 строк, поэтому изменяйте эту настройку только в том случае, если вы используете более старую версию или если вам нужно, чтобы было проанализировано более 25 000 строк.
:::

Выполните эту команду в командной строке. Вы будете использовать `clickhouse-local` для выполнения запроса к данным в загруженном вами TSV-файле.

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

На этом этапе вам следует проверить, что столбцы в TSV‑файле совпадают по названиям и типам с указанными в разделе **Columns in this Dataset** на [веб‑странице набора данных](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243). Типы данных заданы не очень строго: все числовые поля имеют тип `Nullable(Float64)`, а все остальные поля — `Nullable(String)`. При создании таблицы ClickHouse для хранения этих данных вы можете задать более подходящие и эффективные типы.

### Определите подходящую схему {#determine-the-proper-schema}

Чтобы определить, какие типы следует использовать для полей, необходимо понимать, как выглядят данные. Например, поле `JURISDICTION_CODE` представляет собой числовое значение: должно ли оно иметь тип `UInt8`, `Enum` или подойдет `Float64`?

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

Ответ запроса показывает, что `JURISDICTION_CODE` хорошо подходит для хранения в типе `UInt8`.

Аналогично, посмотрите на некоторые поля типа `String` и оцените, подходят ли они для представления в виде `DateTime` или полей типа [`LowCardinality(String)`](../../sql-reference/data-types/lowcardinality.md).

Например, поле `PARKS_NM` описано как «Name of NYC park, playground or greenspace of occurrence, if applicable (state parks are not included)». Названия парков Нью‑Йорка могут быть хорошим кандидатом для хранения в типе `LowCardinality(String)`:

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

Вот несколько названий парков:

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

В используемом на момент написания наборе данных всего несколько сотен уникальных парков и игровых площадок в столбце `PARK_NM`. Это небольшое количество и оно укладывается в рекомендацию для [LowCardinality](/sql-reference/data-types/lowcardinality#description) — не превышать 10 000 различных строк в поле типа `LowCardinality(String)`.

### Поля DateTime {#datetime-fields}

Согласно разделу **Columns in this Dataset** на [веб‑странице набора данных](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243), в этом наборе данных есть поля даты и времени для начала и окончания зарегистрированного события. Анализ минимальных и максимальных значений полей `CMPLNT_FR_DT` и `CMPLT_TO_DT` позволяет понять, всегда ли эти поля заполняются:

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

## Составьте план {#make-a-plan}

Основываясь на вышеописанном анализе:

- `JURISDICTION_CODE` следует привести к типу `UInt8`.
- `PARKS_NM` следует привести к типу `LowCardinality(String)`.
- `CMPLNT_FR_DT` и `CMPLNT_FR_TM` всегда заполнены (возможно, значением по умолчанию `00:00:00`).
- `CMPLNT_TO_DT` и `CMPLNT_TO_TM` могут быть пустыми.
- Даты и время в исходных данных хранятся в отдельных полях.
- Даты имеют формат `mm/dd/yyyy`.
- Время имеет формат `hh:mm:ss`.
- Даты и время можно объединить в типы DateTime.
- Есть некоторые даты до 1 января 1970 года, что означает, что нам нужен 64-битный DateTime.

:::note
Требуется внести ещё множество изменений в типы; все их можно определить, следуя тем же шагам анализа. Посмотрите на количество различных строковых значений в поле, минимальные и максимальные значения числовых полей и принимайте решения. Схема таблицы, которая приводится далее в руководстве, содержит много строковых полей с низкой кардинальностью и полей с беззнаковыми целыми числами и очень мало чисел с плавающей точкой.
:::

## Объединение полей даты и времени {#concatenate-the-date-and-time-fields}

Чтобы объединить поля даты и времени `CMPLNT_FR_DT` и `CMPLNT_FR_TM` в одну строку (`String`), которую затем можно привести к типу `DateTime`, выберите выражение с двумя полями, соединёнными оператором конкатенации: `CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM`. Поля `CMPLNT_TO_DT` и `CMPLNT_TO_TM` обрабатываются аналогичным образом.

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

## Преобразование строкового значения даты и времени в тип DateTime64 {#convert-the-date-and-time-string-to-a-datetime64-type}

Ранее в этом руководстве мы обнаружили, что в TSV-файле есть даты до 1 января 1970 года, что означает, что нам нужен 64-битный тип DateTime64 для хранения дат. Даты также нужно преобразовать из формата `MM/DD/YYYY` в формат `YYYY/MM/DD`. Оба этих действия можно выполнить с помощью функции [`parseDateTime64BestEffort()`](../../sql-reference/functions/type-conversion-functions.md#parsedatetime64besteffort).

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

Строки 2 и 3 выше содержат конкатенацию из предыдущего шага, а строки 4 и 5 преобразуют эти строки в `DateTime64`. Поскольку время окончания жалобы не гарантированно существует, используется `parseDateTime64BestEffortOrNull`.

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
Даты, показанные выше как `1925`, являются результатом ошибок в данных. В исходных данных есть несколько записей с датами в годах `1019`–`1022`, которые на самом деле должны быть `2019`–`2022`. Они сохраняются как 1 января 1925 года, так как это самая ранняя дата, поддерживаемая 64-битным `DateTime`.
:::

## Создание таблицы {#create-a-table}

Принятые выше решения относительно типов данных, используемых для столбцов, отражены в приведённой ниже схеме таблицы. Нам также необходимо определить `ORDER BY` и `PRIMARY KEY`, которые будут использоваться в таблице. Должен быть указан как минимум один из `ORDER BY` или `PRIMARY KEY`. Ниже приведены некоторые рекомендации по выбору столбцов для включения в `ORDER BY`; дополнительная информация приведена в разделе *Next Steps* в конце этого документа.

### Операторы `ORDER BY` и `PRIMARY KEY` {#order-by-and-primary-key-clauses}

* Кортеж `ORDER BY` должен включать поля, которые используются в фильтрах запросов
* Для максимального сжатия на диске кортеж `ORDER BY` должен быть упорядочен по возрастанию кардинальности полей
* Если кортеж `PRIMARY KEY` задан, он должен быть подмножеством кортежа `ORDER BY`
* Если указан только `ORDER BY`, тот же кортеж будет использоваться как `PRIMARY KEY`
* Индекс первичного ключа создаётся с использованием кортежа `PRIMARY KEY`, если он задан, иначе — кортежа `ORDER BY`
* Индекс `PRIMARY KEY` хранится в основной памяти

Рассматривая набор данных и вопросы, на которые мы хотим получить ответы с помощью запросов, мы можем
решить, что нас будет интересовать динамика типов зарегистрированных преступлений во времени по пяти боро
города Нью-Йорка. Эти поля тогда можно включить в `ORDER BY`:

| Column        | Description (from the data dictionary)                  |
| ------------- | ------------------------------------------------------- |
| OFNS&#95;DESC | Описание правонарушения, соответствующее ключевому коду |
| RPT&#95;DT    | Дата, когда о событии было сообщено в полицию           |
| BORO&#95;NM   | Название боро, в котором произошёл инцидент             |

Выполним запрос к TSV-файлу, чтобы определить кардинальность трёх кандидатных столбцов:

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

Если упорядочить по кардинальности, выражение `ORDER BY` будет выглядеть так:

```sql
ORDER BY ( BORO_NM, OFNS_DESC, RPT_DT )
```

:::note
В приведённой ниже таблице будут использованы более удобочитаемые имена столбцов, а вышеуказанные имена будут сопоставлены с ними.

```sql
ORDER BY ( borough, offense_description, date_reported )
```

:::

Объединив изменения типов данных и кортежа `ORDER BY`, мы получаем следующую структуру таблицы:

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

Системная база данных ClickHouse `system`, в частности таблица `system.table`, содержит всю информацию о таблице, которую вы только что создали. Этот запрос показывает `ORDER BY` (ключ сортировки) и `PRIMARY KEY`:

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

## Предварительная обработка и импорт данных {#preprocess-import-data}

Используем утилиту `clickhouse-local` для предварительной обработки данных и `clickhouse-client` для их загрузки.

### Используемые аргументы `clickhouse-local` {#clickhouse-local-arguments-used}

:::tip
`table='input'` присутствует в аргументах clickhouse-local ниже. clickhouse-local принимает переданные входные данные (`cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`) и вставляет их в таблицу. По умолчанию таблица называется `table`. В этом руководстве имя таблицы задано как `input`, чтобы сделать поток данных более наглядным. Последний аргумент clickhouse-local — это запрос, который выбирает данные из таблицы (`FROM input`), после чего результат перенаправляется в `clickhouse-client` для заполнения таблицы `NYPD_Complaint`.
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

## Проверка данных {#validate-data}

:::note
Набор данных обновляется один или несколько раз в год, поэтому ваши результаты подсчёта могут отличаться от приведённых в этом документе.
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

Размер набора данных в ClickHouse составляет всего 12 % от размера исходного TSV‑файла; сравните размер исходного TSV‑файла с размером таблицы:

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

## Выполните несколько запросов {#run-queries}

### Запрос 1. Сравнение количества жалоб по месяцам {#query-1-compare-the-number-of-complaints-by-month}

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

### Запрос 2. Сравнение общего числа жалоб по районам {#query-2-compare-total-number-of-complaints-by-borough}

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

## Дальнейшие шаги {#next-steps}

[A Practical Introduction to Sparse Primary Indexes in ClickHouse](/guides/best-practices/sparse-primary-indexes.md) рассматривает, чем индексирование в ClickHouse отличается от традиционных реляционных баз данных, как ClickHouse строит и использует разреженный первичный индекс, а также лучшие практики индексирования.
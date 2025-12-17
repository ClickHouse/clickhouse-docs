---
description: 'Приём и выполнение запросов к данным Tab Separated Value за 5 шагов'
sidebar_label: 'Данные по жалобам NYPD'
slug: /getting-started/example-datasets/nypd_complaint_data
title: 'Данные по жалобам NYPD'
doc_type: 'guide'
keywords: ['пример набора данных', 'nypd', 'данные о преступности', 'пример данных', 'открытые данные']
---

Файлы Tab Separated Value (TSV) широко распространены и могут включать заголовки полей в первой строке файла. ClickHouse может выполнять приём данных из TSV, а также выполнять запросы к TSV без предварительного приёма файлов. В этом руководстве рассматриваются оба случая. Если вам нужно выполнять запросы к файлам CSV или выполнять их приём, можно использовать те же подходы, просто замените `TSV` на `CSV` в аргументах формата.

Работая по этому руководству, вы:

- **Исследуете** структуру и содержимое файла TSV с помощью запросов.
- **Определите целевую схему ClickHouse**: выберите подходящие типы данных и сопоставите имеющиеся данные с этими типами.
- **Создадите таблицу ClickHouse**.
- **Предобработаете и организуете потоковую загрузку данных** в ClickHouse.
- **Выполните несколько запросов** к ClickHouse.

Набор данных, используемый в этом руководстве, предоставлен командой NYC Open Data и содержит данные обо «всех действительных преступлениях категорий felony, misdemeanor и violation, о которых было сообщено в Департамент полиции города Нью-Йорка (NYPD)». На момент написания размер файла данных составлял 166 МБ, но он регулярно обновляется.

**Источник**: [data.cityofnewyork.us](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)
**Условия использования**: https://www1.nyc.gov/home/terms-of-use.page

## Предварительные требования {#prerequisites}

- Загрузите набор данных, перейдя на страницу [NYPD Complaint Data Current (Year To Date)](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243), нажав кнопку «Export» и выбрав **TSV for Excel**.
- Установите [ClickHouse server and client](../../getting-started/install/install.mdx)

### Примечание о командах, описанных в этом руководстве {#a-note-about-the-commands-described-in-this-guide}

В этом руководстве используются два типа команд:

- Некоторые команды выполняют запросы к TSV-файлам и запускаются в командной строке.
- Остальные команды выполняют запросы к ClickHouse и запускаются в `clickhouse-client` или в интерфейсе Play.

:::note
В примерах в этом руководстве предполагается, что вы сохранили TSV-файл по пути `${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`. При необходимости скорректируйте команды.
:::

## Ознакомьтесь с TSV‑файлом {#familiarize-yourself-with-the-tsv-file}

Перед началом работы с базой данных ClickHouse ознакомьтесь с данными.

### Посмотрите на поля в исходном TSV-файле {#look-at-the-fields-in-the-source-tsv-file}

Это пример команды для выполнения запроса к TSV-файлу, но пока не выполняйте её.

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
В большинстве случаев приведённая выше команда покажет, какие поля во входных данных являются числовыми, какие — строковыми, а какие — кортежами. Однако это не всегда так. Поскольку ClickHouse регулярно используется с наборами данных, содержащими миллиарды записей, по умолчанию проверяется ограниченное число (100) строк для [определения схемы](/integrations/data-formats/json/inference), чтобы избежать разбора миллиардов строк для вывода схемы. Ответ ниже может не совпадать с тем, что видите вы, поскольку набор данных обновляется несколько раз в год. Просматривая словарь данных (Data Dictionary), вы можете увидеть, что CMPLNT&#95;NUM указано как текстовое поле, а не числовое. Переопределив значение по умолчанию в 100 строк для вывода схемы с помощью настройки `SETTINGS input_format_max_rows_to_read_for_schema_inference=2000`, вы можете получить более точное представление о структуре данных.

Примечание: начиная с версии 22.5 значение по умолчанию для вывода схемы — 25 000 строк, поэтому изменяйте эту настройку только в том случае, если вы используете более старую версию или если вам нужно проанализировать более 25 000 строк.
:::

Выполните эту команду в командной строке. Вы будете использовать `clickhouse-local`, чтобы выполнять запросы к данным в загруженном TSV-файле.

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

На этом этапе вам следует проверить, что столбцы в файле TSV совпадают по именам и типам с указанными в разделе **Columns in this Dataset** на [веб‑странице набора данных](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243). Типы данных заданы не очень строго: все числовые поля имеют тип `Nullable(Float64)`, а все остальные поля — `Nullable(String)`. При создании таблицы ClickHouse для хранения данных вы можете указать более подходящие и эффективные типы.


### Определите подходящую схему {#determine-the-proper-schema}

Чтобы определить, какие типы данных следует использовать для полей, необходимо понимать, как выглядят сами данные. Например, поле `JURISDICTION_CODE` является числовым: должно ли оно быть `UInt8`, или `Enum`, или же больше подходит `Float64`?

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

Ответ запроса показывает, что значение `JURISDICTION_CODE` хорошо укладывается в тип `UInt8`.

Аналогично, посмотрите на некоторые поля типа `String` и оцените, можно ли их лучше представить в виде полей типов `DateTime` или [`LowCardinality(String)`](../../sql-reference/data-types/lowcardinality.md).

Например, поле `PARKS_NM` описывается как «Name of NYC park, playground or greenspace of occurrence, if applicable (state parks are not included)». Названия парков Нью-Йорка могут быть хорошим кандидатом для хранения в типе `LowCardinality(String)`:

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

Посмотрите на некоторые примеры названий парков:

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

В наборе данных, используемом на момент написания, содержится лишь несколько сотен различных парков и детских площадок в столбце `PARK_NM`. Это небольшое количество по сравнению с рекомендацией для [LowCardinality](/sql-reference/data-types/lowcardinality#description) — иметь менее 10 000 различных строковых значений в поле `LowCardinality(String)`.


### Поля DateTime {#datetime-fields}

Судя по разделу **Columns in this Dataset** на [веб‑странице набора данных](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243), в наборе данных есть поля даты и времени для начала и окончания зарегистрированного события. Просмотр минимальных и максимальных значений полей `CMPLNT_FR_DT` и `CMPLT_TO_DT` даёт представление о том, всегда ли эти поля заполняются:

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

Исходя из проведённого выше анализа:

- `JURISDICTION_CODE` должен быть приведён к типу `UInt8`.
- `PARKS_NM` должно быть приведено к `LowCardinality(String)`.
- `CMPLNT_FR_DT` и `CMPLNT_FR_TM` всегда заполнены (возможно, значением времени по умолчанию `00:00:00`).
- `CMPLNT_TO_DT` и `CMPLNT_TO_TM` могут быть пустыми.
- Даты и время в исходных данных хранятся в отдельных полях.
- Даты имеют формат `mm/dd/yyyy`.
- Время имеет формат `hh:mm:ss`.
- Даты и время могут быть объединены в значения типов DateTime.
- В данных встречаются даты до 1 января 1970 года, что означает, что нам нужен 64-битный DateTime.

:::note
Необходимо внести ещё много изменений в типы; все их можно определить, следуя тем же шагам анализа. Оценивайте количество различных строковых значений в поле, минимумы и максимумы числовых значений и принимайте решения. Схема таблицы, приведённая далее в руководстве, содержит много строковых значений с низкой кардинальностью и беззнаковых целочисленных полей и очень мало чисел с плавающей запятой.
:::

## Объединение полей даты и времени {#concatenate-the-date-and-time-fields}

Чтобы объединить поля даты и времени `CMPLNT_FR_DT` и `CMPLNT_FR_TM` в одну строку (`String`), которую затем можно привести к типу `DateTime`, выберите эти два поля, соединённые оператором конкатенации: `CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM`. Поля `CMPLNT_TO_DT` и `CMPLNT_TO_TM` обрабатываются аналогичным образом.

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


## Преобразование строки с датой и временем в тип DateTime64 {#convert-the-date-and-time-string-to-a-datetime64-type}

Ранее в руководстве мы обнаружили, что в TSV-файле есть даты до 1 января 1970 года, поэтому для них нам нужен 64-битный тип DateTime64. Даты также необходимо преобразовать из формата `MM/DD/YYYY` в `YYYY/MM/DD`. Оба этих действия можно выполнить с помощью [`parseDateTime64BestEffort()`](../../sql-reference/functions/type-conversion-functions.md#parseDateTime64BestEffort).

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

Строки 2 и 3 выше содержат результат конкатенации из предыдущего шага, а строки 4 и 5 выше преобразуют строки в `DateTime64`. Поскольку время окончания обращения может отсутствовать, используется `parseDateTime64BestEffortOrNull`.

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
Даты, показанные выше как `1925`, являются результатом ошибок в данных. В исходных данных есть несколько записей с датами в годах `1019`–`1022`, которые на самом деле должны быть `2019`–`2022`. Они сохраняются как 1 января 1925 года, поскольку это самая ранняя дата, представимая 64-битным типом DateTime.
:::


## Создание таблицы {#create-a-table}

Принятые выше решения о типах данных, используемых для столбцов, отражены в схеме таблицы, приведённой ниже. Нам также необходимо выбрать `ORDER BY` и `PRIMARY KEY`, которые будут использоваться для таблицы. Должна быть указана как минимум одна из директив: `ORDER BY` или `PRIMARY KEY`. Ниже приведены некоторые рекомендации по выбору столбцов, которые следует включить в `ORDER BY`. Дополнительная информация приведена в разделе *Next Steps* в конце этого документа.

### Операторы `ORDER BY` и `PRIMARY KEY` {#order-by-and-primary-key-clauses}

* Кортеж `ORDER BY` должен включать поля, которые используются в фильтрах запросов
* Для максимального сжатия на диске кортеж `ORDER BY` должен быть упорядочен по возрастанию кардинальности
* Если кортеж `PRIMARY KEY` существует, он должен быть подмножеством кортежа `ORDER BY`
* Если указан только `ORDER BY`, тот же кортеж будет использоваться как `PRIMARY KEY`
* Индекс первичного ключа создаётся с использованием кортежа `PRIMARY KEY`, если он указан, иначе — кортежа `ORDER BY`
* Индекс `PRIMARY KEY` хранится в основной памяти

Рассматривая набор данных и вопросы, на которые можно ответить с его помощью, мы можем
решить, что нас интересуют типы регистрируемых преступлений по времени в пяти боро
Нью‑Йорка. Тогда эти поля можно включить в `ORDER BY`:

| Столбец       | Описание (из словаря данных)                            |
| ------------- | ------------------------------------------------------- |
| OFNS&#95;DESC | Описание правонарушения, соответствующее ключевому коду |
| RPT&#95;DT    | Дата, когда событие было сообщено в полицию             |
| BORO&#95;NM   | Название боро, в котором произошёл инцидент             |

Выполним запрос к TSV‑файлу, чтобы определить кардинальность трёх кандидатных столбцов:

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

При сортировке по кардинальности выражение `ORDER BY` будет следующим:

```sql
ORDER BY ( BORO_NM, OFNS_DESC, RPT_DT )
```

:::note
В таблице ниже будут использоваться более удобочитаемые имена столбцов; имена, приведённые выше, будут сопоставлены с ними.

```sql
ORDER BY ( borough, offense_description, date_reported )
```

:::

Если объединить изменения типов данных и кортеж `ORDER BY`, получается следующая структура таблицы:

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

База данных ClickHouse `system`, а именно таблица `system.table`, содержит всю информацию о таблице, которую вы только что создали. Этот запрос показывает `ORDER BY` (ключ сортировки) и `PRIMARY KEY`:

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

Мы будем использовать утилиту `clickhouse-local` для предварительной обработки данных и `clickhouse-client` для их загрузки.

### Аргументы, используемые с `clickhouse-local` {#clickhouse-local-arguments-used}

:::tip
`table='input'` используется в аргументах для clickhouse-local ниже. clickhouse-local принимает предоставленные входные данные (`cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`) и вставляет их в таблицу. По умолчанию таблица называется `table`. В этом руководстве имя таблицы задано как `input`, чтобы сделать поток данных более наглядным. Последний аргумент для clickhouse-local — это запрос, который выбирает данные из таблицы (`FROM input`), после чего результат передаётся по конвейеру в `clickhouse-client` для заполнения таблицы `NYPD_Complaint`.
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
Набор данных меняется один или несколько раз в год, поэтому полученные вами значения (подсчёты) могут не совпадать с приведёнными в этом документе.
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

Размер набора данных в ClickHouse составляет всего 12 % от исходного TSV-файла. Сравните размер исходного TSV-файла с размером таблицы:

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


## Выполнение нескольких запросов {#run-queries}

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


### Запрос 2. Сравнение общего количества жалоб по районам {#query-2-compare-total-number-of-complaints-by-borough}

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

[A Practical Introduction to Sparse Primary Indexes in ClickHouse](/guides/best-practices/sparse-primary-indexes.md) рассматривает отличия индексирования в ClickHouse по сравнению с традиционными реляционными базами данных, то, как ClickHouse строит и использует разреженный первичный индекс, а также практики индексирования, которых следует придерживаться.
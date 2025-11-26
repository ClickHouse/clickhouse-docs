---
description: 'Приём и запрос данных в формате Tab Separated Value за 5 шагов'
sidebar_label: 'Данные по жалобам NYPD'
slug: /getting-started/example-datasets/nypd_complaint_data
title: 'Данные по жалобам NYPD'
doc_type: 'guide'
keywords: ['пример набора данных', 'nypd', 'данные о преступности', 'пример данных', 'публичные данные']
---

Файлы формата TSV (Tab Separated Values) широко распространены и могут включать заголовки полей в первой строке файла. ClickHouse может принимать TSV-файлы, а также выполнять запросы к данным в формате TSV без приёма этих файлов. В этом руководстве рассматриваются оба варианта. Если вам нужно выполнять запросы к файлам CSV или приём таких файлов, можно использовать те же приёмы, просто замените `TSV` на `CSV` в аргументах формата.

В ходе работы с этим руководством вы будете:
- **Исследовать** структуру и содержимое TSV-файла.
- **Определять целевую схему ClickHouse**: подбирать подходящие типы данных и сопоставлять им существующие данные.
- **Создавать таблицу ClickHouse**.
- **Предварительно обрабатывать и потоково загружать** данные в ClickHouse.
- **Запускать запросы** к ClickHouse.

Набор данных, используемый в этом руководстве, предоставлен командой NYC Open Data и содержит данные о «всех подтверждённых преступлениях категорий felony, misdemeanor и violation, о которых сообщено в Департамент полиции города Нью-Йорка (NYPD)». На момент написания размер файла данных составляет 166 МБ, но он регулярно обновляется.

**Источник**: [data.cityofnewyork.us](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)
**Условия использования**: https://www1.nyc.gov/home/terms-of-use.page



## Предварительные требования {#prerequisites}
- Загрузите набор данных, перейдя на страницу [NYPD Complaint Data Current (Year To Date)](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243), нажав кнопку Export и выбрав **TSV for Excel**.
- Установите [сервер и клиент ClickHouse](../../getting-started/install/install.mdx)

### Примечание о командах, описанных в этом руководстве {#a-note-about-the-commands-described-in-this-guide}
В этом руководстве используются два типа команд:
- Одни команды выполняют запросы к TSV-файлам, они запускаются в командной строке.
- Остальные команды выполняют запросы к ClickHouse и запускаются в `clickhouse-client` или Play UI.

:::note
В примерах в этом руководстве предполагается, что вы сохранили TSV-файл по пути `${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`. При необходимости скорректируйте команды.
:::



## Ознакомьтесь с файлом TSV

Прежде чем приступить к работе с базой данных ClickHouse, ознакомьтесь с данными.

### Посмотрите на поля в исходном файле TSV

Это пример команды для выполнения запроса к файлу TSV, но пока не запускайте её.

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
В большинстве случаев приведённая выше команда покажет вам, какие поля во входных данных являются числовыми, какие — строковыми, а какие — кортежами. Однако так бывает не всегда. Поскольку ClickHouse регулярно используется с наборами данных, содержащими миллиарды записей, по умолчанию для [определения схемы](/integrations/data-formats/json/inference) просматривается ограниченное число строк (100), чтобы избежать парсинга миллиардов строк. Приведённый ниже ответ может не совпадать с тем, что видите вы, так как набор данных обновляется несколько раз в год. Если обратиться к Data Dictionary, можно увидеть, что CMPLNT&#95;NUM указано как текст, а не как числовой тип. Переопределив значение по умолчанию в 100 строк для определения схемы с помощью настройки `SETTINGS input_format_max_rows_to_read_for_schema_inference=2000`,
вы можете получить более точное представление о содержимом.

Примечание: начиная с версии 22.5 по умолчанию просматривается 25 000 строк для определения схемы, поэтому изменяйте эту настройку только если вы используете более старую версию или если вам нужно проанализировать более 25 000 строк.
:::

Выполните эту команду в командной строке. Вы будете использовать `clickhouse-local` для выполнения запроса к данным в TSV‑файле, который вы загрузили.

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

На этом этапе следует проверить, что столбцы в TSV‑файле соответствуют именам и типам, указанным в разделе **Columns in this Dataset** на [веб‑странице набора данных](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243). Типы данных заданы довольно обобщённо: все числовые поля имеют тип `Nullable(Float64)`, а все остальные поля — `Nullable(String)`. При создании таблицы ClickHouse для хранения данных вы можете указать более подходящие и эффективные типы.

### Определение подходящей схемы

Чтобы понять, какие типы следует использовать для полей, необходимо знать, как выглядят данные. Например, поле `JURISDICTION_CODE` является числовым: должно ли оно иметь тип `UInt8`, или `Enum`, или же более уместен `Float64`?


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

Ответ запроса показывает, что значение `JURISDICTION_CODE` хорошо умещается в тип `UInt8`.

Аналогично, посмотрите на некоторые поля типа `String` и определите, подходят ли они для использования в качестве полей типа `DateTime` или [`LowCardinality(String)`](../../sql-reference/data-types/lowcardinality.md).

Например, поле `PARKS_NM` описано как «Название парка, игровой площадки или зелёной зоны Нью‑Йорка, где произошло событие, если применимо (парки штата не включаются)». Названия парков в Нью‑Йорке могут быть хорошим кандидатом для `LowCardinality(String)`:

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

Посмотрите на названия некоторых парков:

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
│ ПАРК АССЕР ЛЕВИ            │
│ ПАРК ДЖЕЙМСА Дж. УОКЕРА        │
│ БЕЛЬТ-ПАРКВЕЙ/ШОР-ПАРКВЕЙ │
│ ПРОСПЕКТ-ПАРК              │
│ ПЛОЩАДЬ МОНТЕФИОРЕ          │
│ ПАРК САТТОН-ПЛЕЙС          │
│ ПАРК ДЖОЙС КИЛМЕР          │
│ СПОРТИВНАЯ ПЛОЩАДКА ЭЛЛИ  │
│ ПАРК АСТОРИЯ               │
└────────────────────────────┘
```

На момент подготовки этого материала используется набор данных, в котором в столбце `PARK_NM` содержится всего несколько сотен различных парков и детских площадок. Это небольшое количество с точки зрения рекомендации [LowCardinality](/sql-reference/data-types/lowcardinality#description) держаться ниже 10 000 различных строковых значений в поле `LowCardinality(String)`.

### Поля DateTime

Согласно разделу **Columns in this Dataset** на [веб‑странице набора данных](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243), есть поля даты и времени для начала и окончания зарегистрированного события. Просмотр минимальных и максимальных значений `CMPLNT_FR_DT` и `CMPLT_TO_DT` позволяет понять, всегда ли эти поля заполнены:

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

Основываясь на описанном выше анализе:
- `JURISDICTION_CODE` следует привести к типу `UInt8`.
- `PARKS_NM` следует привести к типу `LowCardinality(String)`
- `CMPLNT_FR_DT` и `CMPLNT_FR_TM` всегда заполнены (возможно, со временем по умолчанию `00:00:00`)
- `CMPLNT_TO_DT` и `CMPLNT_TO_TM` могут быть пустыми
- Даты и время в исходных данных хранятся в отдельных полях
- Даты имеют формат `mm/dd/yyyy`
- Время имеет формат `hh:mm:ss`
- Даты и время можно объединить в значения типа DateTime
- Есть некоторые даты до 1 января 1970 года, что означает, что нам нужен 64-битный DateTime

:::note
Изменений в типах, которые нужно внести, значительно больше; все их можно определить, следуя тем же шагам анализа. Обращайте внимание на количество различных строковых значений в поле, минимумы и максимумы числовых значений и принимайте решения. Схема таблицы, приведённая далее в руководстве, содержит много строковых полей с низкой кардинальностью (`LowCardinality(String)`), беззнаковых целочисленных полей и очень мало чисел с плавающей запятой.
:::



## Объединение полей даты и времени

Чтобы объединить поля даты и времени `CMPLNT_FR_DT` и `CMPLNT_FR_TM` в одну строку типа `String`, которую затем можно привести к типу `DateTime`, выберите два поля, соединённые оператором конкатенации: `CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM`. Поля `CMPLNT_TO_DT` и `CMPLNT_TO_TM` обрабатываются аналогичным образом.

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


## Преобразование строки с датой и временем в тип DateTime64

Ранее в этом руководстве мы обнаружили, что в TSV-файле есть даты до 1 января 1970 года, а значит, для них нам нужен 64-битный тип DateTime64. Даты также необходимо преобразовать из формата `MM/DD/YYYY` в формат `YYYY/MM/DD`. Обе эти операции можно выполнить с помощью [`parseDateTime64BestEffort()`](../../sql-reference/functions/type-conversion-functions.md#parsedatetime64besteffort).

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

Строки 2 и 3 выше содержат результат конкатенации из предыдущего шага, а строки 4 и 5 выше преобразуют эти значения в `DateTime64`. Поскольку время окончания жалобы может отсутствовать, используется `parseDateTime64BestEffortOrNull`.


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
Даты, показанные выше как `1925`, являются результатом ошибок в данных. В исходных данных есть несколько записей с датами в годах `1019`–`1022`, которые на самом деле должны быть `2019`–`2022`. Они сохраняются как 1 января 1925 года, поскольку это самая ранняя возможная дата для 64-битного типа `DateTime`.
:::


## Создание таблицы

Принятые выше решения по типам данных, используемым для столбцов, отражены в схеме таблицы
ниже. Нам также нужно определить `ORDER BY` и `PRIMARY KEY`, которые будут использоваться для таблицы. Должен быть указан как минимум один
из `ORDER BY` или `PRIMARY KEY`. Ниже приведены некоторые рекомендации по выбору
столбцов, которые следует включить в `ORDER BY`; дополнительная информация находится в разделе *Next Steps* в конце
этого документа.

### Предложения `ORDER BY` и `PRIMARY KEY`

* Кортеж `ORDER BY` должен включать поля, которые используются в фильтрах запросов
* Для максимизации сжатия на диске кортеж `ORDER BY` должен быть упорядочен в порядке возрастания кардинальности
* Если он задан, кортеж `PRIMARY KEY` должен быть подмножеством кортежа `ORDER BY`
* Если указан только `ORDER BY`, тот же кортеж будет использован как `PRIMARY KEY`
* Индекс первичного ключа создаётся на основе кортежа `PRIMARY KEY`, если он задан, иначе используется кортеж `ORDER BY`
* Индекс `PRIMARY KEY` хранится в оперативной памяти

Анализируя набор данных и вопросы, на которые можно ответить, выполняя по нему запросы, мы можем
решить, что нас интересуют типы зарегистрированных преступлений в динамике по пяти боро
Нью-Йорка. Тогда в `ORDER BY` могут быть включены следующие поля:

| Column        | Description (from the data dictionary)                  |
| ------------- | ------------------------------------------------------- |
| OFNS&#95;DESC | Описание правонарушения, соответствующее ключевому коду |
| RPT&#95;DT    | Дата, когда о событии было сообщено в полицию           |
| BORO&#95;NM   | Название боро, в котором произошло происшествие         |

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
В таблице ниже будут использоваться более удобочитаемые имена столбцов, а приведённые выше имена будут сопоставлены им.

```sql
ORDER BY ( borough, offense_description, date_reported )
```

:::

Собрав вместе изменения типов данных и кортежа `ORDER BY`, мы получаем следующую структуру таблицы:

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

### Определение первичного ключа таблицы


База данных `system` в ClickHouse, в частности `system.table`, содержит всю информацию о таблице, которую вы только что создали. Этот запрос показывает `ORDER BY` (ключ сортировки) и `PRIMARY KEY`:

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

Строка 1:
─────────
partition_key:
sorting_key:   borough, offense_description, date_reported
primary_key:   borough, offense_description, date_reported
table:         NYPD_Complaint

1 строка. Затрачено: 0.001 сек.
```


## Предварительная обработка и импорт данных

Мы будем использовать инструмент `clickhouse-local` для предварительной обработки данных и `clickhouse-client` для их загрузки.

### Используемые аргументы `clickhouse-local`

:::tip
`table='input'` встречается в аргументах clickhouse-local ниже. clickhouse-local принимает переданные данные (`cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`) и загружает их во временную таблицу. По умолчанию эта таблица называется `table`. В этом руководстве имя таблицы устанавливается в значение `input`, чтобы сделать поток данных более наглядным. Последний аргумент для clickhouse-local — это запрос, который выбирает данные из этой таблицы (`FROM input`), после чего результат перенаправляется в `clickhouse-client` для заполнения таблицы `NYPD_Complaint`.
:::

```sql
cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv \
  | clickhouse-local --table='input' --input-format='TSVWithNames' \
  --input_format_max_rows_to_read_for_schema_inference=2000 \
  --query "
    WITH (CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM) AS CMPLNT_START,
     (CMPLNT_TO_DT || ' ' || CMPLNT_TO_TM) AS CMPLNT_END
    SELECT
      CMPLNT_NUM                                  AS номер_жалобы,
      ADDR_PCT_CD                                 AS участок,
      BORO_NM                                     AS район,
      parseDateTime64BestEffort(CMPLNT_START)     AS начало_жалобы,
      parseDateTime64BestEffortOrNull(CMPLNT_END) AS окончание_жалобы,
      CRM_ATPT_CPTD_CD                            AS преступление_завершено,
      HADEVELOPT                                  AS жилищное_управление,
      HOUSING_PSA                                 AS код_жилищного_уровня,
      JURISDICTION_CODE                           AS код_юрисдикции,
      JURIS_DESC                                  AS юрисдикция,
      KY_CD                                       AS код_правонарушения,
      LAW_CAT_CD                                  AS уровень_правонарушения,
      LOC_OF_OCCUR_DESC                           AS описание_места,
      OFNS_DESC                                   AS описание_правонарушения,
      PARKS_NM                                    AS название_парка,
      PATROL_BORO                                 AS патрульный_район,
      PD_CD,
      PD_DESC,
      PREM_TYP_DESC                               AS тип_места,
      toDate(parseDateTimeBestEffort(RPT_DT))     AS дата_сообщения,
      STATION_NAME                                AS станция_метро,
      SUSP_AGE_GROUP                              AS возрастная_группа_подозреваемого,
      SUSP_RACE                                   AS раса_подозреваемого,
      SUSP_SEX                                    AS пол_подозреваемого,
      TRANSIT_DISTRICT                            AS транспортный_округ,
      VIC_AGE_GROUP                               AS возрастная_группа_жертвы,
      VIC_RACE                                    AS раса_жертвы,
      VIC_SEX                                     AS пол_жертвы,
      X_COORD_CD                                  AS координата_x_NY,
      Y_COORD_CD                                  AS координата_y_NY,
      Latitude,
      Longitude
    FROM input" \
  | clickhouse-client --query='INSERT INTO NYPD_Complaint FORMAT TSV'
```


## Проверьте данные

:::note
Набор данных меняется один или более раз в год, поэтому ваши результаты могут отличаться от приведённых в этом документе.
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

Размер данных в ClickHouse составляет лишь 12 % размера исходного файла TSV. Сравните размер исходного файла TSV с размером таблицы:

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


## Выполните несколько запросов

### Запрос 1. Сравнение количества жалоб по месяцам

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

┌─месяц─────┬─жалобы─────┬─bar(count(), 0, 50000, 80)───────────────────────────────┐
│ Март      │      34536 │ ███████████████████████████████████████████████████████▎ │
│ Май       │      34250 │ ██████████████████████████████████████████████████████▋  │
│ Апрель    │      32541 │ ████████████████████████████████████████████████████     │
│ Январь    │      30806 │ █████████████████████████████████████████████████▎       │
│ Февраль   │      28118 │ ████████████████████████████████████████████▊            │
│ Ноябрь    │       7474 │ ███████████▊                                             │
│ Декабрь   │       7223 │ ███████████▌                                             │
│ Октябрь   │       7070 │ ███████████▎                                             │
│ Сентябрь  │       6910 │ ███████████                                              │
│ Август    │       6801 │ ██████████▊                                              │
│ Июнь      │       6779 │ ██████████▋                                              │
│ Июль      │       6485 │ ██████████▍                                              │
└───────────┴────────────┴──────────────────────────────────────────────────────────┘

12 строк в наборе. Время выполнения: 0.006 сек. Обработано 208.99 тысяч строк, 417.99 KB (37.48 млн строк/с., 74.96 MB/s.)
```

### Запрос 2. Сравнение общего числа жалоб по районам

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

6 строк в наборе. Затрачено: 0.008 сек. Обработано 208.99 тыс. строк, 209.43 КБ (27.14 млн. строк/сек., 27.20 МБ/сек.)
```


## Дальнейшие шаги {#next-steps}

[A Practical Introduction to Sparse Primary Indexes in ClickHouse](/guides/best-practices/sparse-primary-indexes.md) рассматривает различия в подходах к индексированию в ClickHouse по сравнению с традиционными реляционными базами данных, то, как ClickHouse строит и использует разреженный первичный индекс, а также лучшие практики индексирования.

---
description: 'Загрузка и запрос данных TSV (разделенные табуляцией) в 5 шагов'
slug: /getting-started/example-datasets/nypd_complaint_data
sidebar_label: 'Данные о жалобах NYPD'
title: 'Данные о жалобах NYPD'
---

Файлы с разделением на табуляцию или TSV являются распространенными и могут включать заголовки полей в первой строке файла. ClickHouse может загружать TSV и также может выполнять запросы к TSV без загрузки файлов. Этот гид охватывает оба этих случая. Если вам нужно выполнить запрос или загрузить файлы CSV, те же методы работают, просто замените `TSV` на `CSV` в ваших аргументах формата.

Во время работы с этим гидом вы:
- **Исследуете**: Выполняйте запрос к структуре и содержимому TSV файла.
- **Определите целевую схему ClickHouse**: Выберите правильные типы данных и сопоставьте существующие данные с этими типами.
- **Создайте таблицу ClickHouse**.
- **Предобработайте и передайте** данные в ClickHouse.
- **Выполните несколько запросов** к ClickHouse.

Набор данных, использованный в этом руководстве, предоставлен командой NYC Open Data и содержит данные о "всех действительных преступлениях фелонии, правонарушениях и нарушениях, о которых сообщил Департамент полиции Нью-Йорка (NYPD)". На момент написания размер файла данных составляет 166 МБ, но он регулярно обновляется.

**Источник**: [data.cityofnewyork.us](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)  
**Условия использования**: https://www1.nyc.gov/home/terms-of-use.page

## Пререквизиты {#пререквизиты}
- Скачайте набор данных, посетив страницу [Текущие данные о жалобах NYPD (на сегодня)](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243), нажав кнопку Экспорт и выбрав **TSV для Excel**.
- Установите [сервер и клиент ClickHouse](../../getting-started/install.md).
- [Запустите](../../getting-started/install.md#launch) сервер ClickHouse и подключитесь с помощью `clickhouse-client`.

### Примечание о командах, описанных в этом руководстве {#примечание-о-командах-описанных-в-этом-руководстве}
В этом руководстве есть два типа команд:
- Некоторые команды выполняют запросы к файлам TSV, они запускаются в командной строке.
- Остальные команды выполняют запросы к ClickHouse и запускаются в `clickhouse-client` или Play UI.

:::note
Примеры в этом руководстве предполагают, что вы сохранили файл TSV в `${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`, пожалуйста, скорректируйте команды при необходимости.
:::

## Ознакомьтесь с файлом TSV {#ознакомьтесь-с-файлом-tsv}

Перед тем как начать работу с базой данных ClickHouse, ознакомьтесь с данными.

### Посмотрите на поля в исходном файле TSV {#посмотрите-на-поля-в-исходном-файле-tsv}

Это пример команды для выполнения запроса к файлу TSV, но не запускайте её пока.
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
Чаще всего вышеуказанная команда даст вам знать, какие поля во входных данных являются числовыми, а какие строковыми, а какие являются кортежами. Это не всегда так. Поскольку ClickHouse часто используется с наборами данных, содержащими миллиарды записей, по умолчанию проверяется количество (100) строк для [вывода схемы](/integrations/data-formats/json/inference), чтобы избежать парсинга миллиардов строк для определения схемы. Ответ ниже может не совпадать с тем, что вы видите, поскольку набор данных обновляется несколько раз в год. Посмотрев на Справочник данных, вы можете увидеть, что CMPLNT_NUM указан как текст, а не как числовой. Переопределив значение по умолчанию для 100 строк для вывода с помощью настройки `SETTINGS input_format_max_rows_to_read_for_schema_inference=2000`, вы можете лучше понять содержимое.

Примечание: начиная с версии 22.5 по умолчанию теперь 25 000 строк для вывода схемы, поэтому изменяйте настройку только если вы используете более старую версию или если вам нужно более 25 000 строк для выборки.
:::

Запустите эту команду в командной строке. Вы будете использовать `clickhouse-local` для выполнения запроса к данным в TSV файле, который вы скачали.
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

На этом этапе вы должны проверить, что колонки в файле TSV совпадают с именами и типами, указанными в разделе **Columns in this Dataset** на [веб-странице набора данных](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243). Типы данных не очень специфичны, все числовые поля установлены на `Nullable(Float64)`, а все остальные поля - на `Nullable(String)`. Когда вы создаете таблицу ClickHouse для хранения данных, вы можете указать более подходящие и эффективные типы.

### Определите правильную схему {#определите-правильную-схему}

Чтобы выяснить, какие типы следует использовать для полей, необходимо знать, как выглядят данные. Например, поле `JURISDICTION_CODE` является числовым: должно ли это быть `UInt8`, `Enum` или `Float64` подходит?

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

Ответ запроса показывает, что `JURISDICTION_CODE` хорошо вписывается в `UInt8`.

Точно так же посмотрите некоторые поля `String` и посмотрите, подходят ли они для представления `DateTime` или [`LowCardinality(String)`](../../sql-reference/data-types/lowcardinality.md) полей.

Например, поле `PARKS_NM` описывается как "Имя парка, игровой площадки или зеленого пространства NYC, если применимо (государственные парки не включены)". Имена парков в Нью-Йорке могут стать хорошим кандидатом для `LowCardinality(String)`:

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

Набор данных, используемый на момент написания, имеет только несколько сотен различных парков и игровых площадок в столбце `PARK_NM`. Это небольшое число на основании рекомендации [LowCardinality](/sql-reference/data-types/lowcardinality#description) оставаться ниже 10 000 различных строк в поле `LowCardinality(String)`.

### Поля DateTime {#поля-datetime}
Согласно разделу **Columns in this Dataset** на [веб-странице набора данных](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243), существуют поля даты и времени для начала и окончания сообщенного события. Просмотр min и max `CMPLNT_FR_DT` и `CMPLT_TO_DT` дает представление о том, заполняются ли эти поля всегда:

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

## Построение плана {#построение-плана}

На основе вышеизложенного:
- `JURISDICTION_CODE` следует привести к `UInt8`.
- `PARKS_NM` следует привести к `LowCardinality(String)`.
- `CMPLNT_FR_DT` и `CMPLNT_FR_TM` всегда заполняются (возможно, со значением по умолчанию `00:00:00`).
- `CMPLNT_TO_DT` и `CMPLNT_TO_TM` могут быть пустыми.
- Даты и времени хранятся в отдельных полях в источнике.
- Даты в формате `mm/dd/yyyy`.
- Время в формате `hh:mm:ss`.
- Даты и время могут быть объединены в типы DateTime.
- Есть некоторые даты до 1 января 1970 года, что значит, что нам нужен 64-битный DateTime.

:::note
Существует много других изменений, которые необходимо внести в типы, они все могут быть определены, следуя тем же шагам исследования. Рассмотрите количество различных строк в поле, min и max чисел и примите свои решения. Структура таблицы, приведенная позже в руководстве, имеет много строк с низкой кардинальностью и полей беззнакового целого числа и очень мало числовых значений с плавающей точкой.
:::

## Объедините поля даты и времени {#объедините-поля-даты-и-времени}

Чтобы объединить поля даты и времени `CMPLNT_FR_DT` и `CMPLNT_FR_TM` в одну `String`, которую можно привести к типу `DateTime`, выберите два поля, соединенных оператором объединения: `CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM`. Поля `CMPLNT_TO_DT` и `CMPLNT_TO_TM` обрабатываются аналогичным образом.

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

## Преобразование строки даты и времени в тип DateTime64 {#преобразование-строки-даты-и-времени-в-тип-datetime64}

Ранее в руководстве мы обнаружили, что в файле TSV есть даты до 1 января 1970 года, что означает, что нам нужен 64-битный тип DateTime для дат. Даты также нужно преобразовать из формата `MM/DD/YYYY` в `YYYY/MM/DD`. Всё это можно сделать с помощью функции [`parseDateTime64BestEffort()`](../../sql-reference/functions/type-conversion-functions.md#parsedatetime64besteffort).

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

Строки 2 и 3 выше содержат объединение из предыдущего шага, а строки 4 и 5 выше парсируют строки в `DateTime64`. Поскольку время окончания жалобы не гарантировано, используется `parseDateTime64BestEffortOrNull`.

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
│ 1975-01-01 00:00:00.000 │                    ᴺᵁᴺᴺ │
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
Даты, указанные как `1925`, выше являются результатом ошибок в данных. В оригинальных данных есть несколько записей с датами в годах `1019` - `1022`, которые должны быть `2019` - `2022`. Они сохраняются как 1 января 1925 года, так как это самое раннее значение, соответствующее 64-битному DateTime.
:::

## Создайте таблицу {#создайте-таблицу}

Принятые выше решения о типах данных для столбцов отражены в следующей структуре таблицы. Также необходимо решить, какие поля следует использовать для `ORDER BY` и `PRIMARY KEY`. По крайней мере, одно из `ORDER BY` или `PRIMARY KEY` должно быть указано. Вот некоторые рекомендации по выбору столбцов для включения в `ORDER BY`, и более подробная информация содержится в разделе *Следующие шаги* в конце этого документа.

### Условия Order By и Primary Key {#условия-order-by-и-primary-key}

- Кортеж `ORDER BY` должен включать поля, которые используются в фильтрах запросов.
- Чтобы максимизировать сжатие на диске, кортеж `ORDER BY` следует упорядочить по возрастающей кардинальности.
- Если он существует, кортеж `PRIMARY KEY` должен быть подсетом кортежа `ORDER BY`.
- Если указан только `ORDER BY`, то тот же кортеж будет использоваться как `PRIMARY KEY`.
- Индекс первичного ключа создается с использованием кортежа `PRIMARY KEY`, если он указан; в противном случае — кортежа `ORDER BY`.
- Индекс `PRIMARY KEY` хранится в основной памяти.

Посмотрев на набор данных и на вопросы, на которые могут быть даны ответы запросами, мы можем решить, что будем рассматривать типы преступлений, о которых сообщалось с течением времени в пяти районах Нью-Йорка. Эти поля могут быть включены в `ORDER BY`:

| Столбец      | Описание (из справочника данных)                 |
| ------------ | --------------------------------------------- |
| OFNS_DESC    | Описание правонарушения, соответствующего ключевому коду     |
| RPT_DT       | Дата, когда событие было сообщено в полицию                      |
| BORO_NM      | Название района, в котором произошло происшествие |


Выполните запрос к файлу TSV для кардинальности трех кандидатных столбцов:

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
В таблице ниже будут использоваться более удобные для чтения имена столбцов, вышеуказанные имена будут сопоставлены с
```sql
ORDER BY ( borough, offense_description, date_reported )
```
:::

Составив изменения типов данных и кортеж `ORDER BY`, мы получаем следующую структуру таблицы:

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

### Поиск первичного ключа таблицы {#поиск-первичного-ключа-таблицы}

База данных ClickHouse `system`, а именно `system.table`, содержит всю информацию о только что созданной таблице. Этот запрос показывает `ORDER BY` (ключ сортировки) и `PRIMARY KEY`:
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

## Предобработка и импорт данных {#предобработка-и-импорт-данных}

Мы будем использовать инструмент `clickhouse-local` для предобработки данных и `clickhouse-client` для их загрузки.

### Аргументы clickhouse-local, используемые для {#аргументы-clickhouse-local-используемые-для}
:::tip
`table='input'` появляется в аргументах к `clickhouse-local` ниже. `clickhouse-local` принимает предоставленный ввод (`cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`) и вставляет вход в таблицу. По умолчанию таблица называется `table`. В этом руководстве имя таблицы установлено на `input`, чтобы сделать поток данных более ясным. Последний аргумент для `clickhouse-local` — это запрос, который выбирает из таблицы (`FROM input`), который затем передается в `clickhouse-client` для заполнения таблицы `NYPD_Complaint`.
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

## Проверьте данные {#проверьте-данные}

:::note
Набор данных меняется один или несколько раз в год, ваши подсчеты могут не совпадать с теми, что приведены в этом документе.
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

Размер набора данных в ClickHouse составляет всего 12% от оригинального файла TSV, сравните размер оригинального файла TSV с размером таблицы:

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


## Выполните несколько запросов {#выполните-несколько-запросов}

### Запрос 1. Сравните количество жалоб по месяцам {#запрос-1-сравните-количество-жалоб-по-месяцам}

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

### Запрос 2. Сравните общее количество жалоб по району {#запрос-2-сравните-общее-количество-жалоб-по-району}

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

## Следующие шаги {#следующие-шаги}

[Практическое введение в разреженные первичные индексы в ClickHouse](/guides/best-practices/sparse-primary-indexes.md) обсуждает различия в индексации ClickHouse по сравнению с традиционными реляционными базами данных, как ClickHouse создает и использует разреженный первичный индекс, а также лучшие практики индексирования.

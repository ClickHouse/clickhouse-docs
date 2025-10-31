---
slug: '/integrations/data-formats/csv-tsv'
sidebar_label: 'CSV и TSV'
description: 'Страница, описывающая, как работать с данными CSV и TSV в ClickHouse'
title: 'Работа с данными CSV и TSV в ClickHouse'
doc_type: guide
---
# Работа с данными CSV и TSV в ClickHouse

ClickHouse поддерживает импорт данных из файлов CSV и экспорт данных в формат CSV. Поскольку файлы CSV могут иметь различные особенности формата, включая строки заголовков, пользовательские разделители и символы экранирования, ClickHouse предоставляет форматы и настройки для эффективного решения каждой из этих задач.

## Импорт данных из CSV файла {#importing-data-from-a-csv-file}

Перед импортом данных давайте создадим таблицу с соответствующей структурой:

```sql
CREATE TABLE sometable
(
    `path` String,
    `month` Date,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY tuple(month, path)
```

Чтобы импортировать данные из [CSV файла](assets/data_small.csv) в таблицу `sometable`, мы можем передать наш файл напрямую в clickhouse-client:

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSV" < data_small.csv
```

Обратите внимание, что мы используем [FORMAT CSV](/interfaces/formats.md/#csv), чтобы сообщить ClickHouse, что мы загружаем данные в формате CSV. В качестве альтернативы мы можем загрузить данные из локального файла, используя оператор [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file):

```sql
INSERT INTO sometable
FROM INFILE 'data_small.csv'
FORMAT CSV
```

Здесь мы используем оператор `FORMAT CSV`, чтобы ClickHouse понимал формат файла. Мы также можем загружать данные непосредственно из URL, используя функцию [url()](/sql-reference/table-functions/url.md) или из файлов S3, используя функцию [s3()](/sql-reference/table-functions/s3.md).

:::tip
Мы можем пропустить явную настройку формата для `file()` и `INFILE`/`OUTFILE`.
В этом случае ClickHouse автоматически определит формат на основе расширения файла.
:::

### CSV файлы с заголовками {#csv-files-with-headers}

Предположим, что наш [CSV файл содержит заголовки](assets/data_small_headers.csv):

```bash
head data-small-headers.csv
```
```response
"path","month","hits"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
```

Чтобы импортировать данные из этого файла, мы можем использовать формат [CSVWithNames](/interfaces/formats.md/#csvwithnames):

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSVWithNames" < data_small_headers.csv
```

В этом случае ClickHouse пропустит первую строку при импорте данных из файла.

:::tip
Начиная с [версии](https://github.com/ClickHouse/ClickHouse/releases) 23.1, ClickHouse автоматически будет определять заголовки в файлах CSV при использовании формата `CSV`, поэтому нет необходимости использовать `CSVWithNames` или `CSVWithNamesAndTypes`.
:::

### CSV файлы с пользовательскими разделителями {#csv-files-with-custom-delimiters}

Если файл CSV использует разделитель, отличный от запятой, мы можем использовать опцию [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) для установки соответствующего символа:

```sql
SET format_csv_delimiter = ';'
```

Теперь, когда мы импортируем из CSV файла, символ `;` будет использоваться в качестве разделителя вместо запятой.

### Пропуск строк в CSV файле {#skipping-lines-in-a-csv-file}

Иногда нам может понадобиться пропустить определенное количество строк при импорте данных из CSV файла. Это можно сделать с помощью опции [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines):

```sql
SET input_format_csv_skip_first_lines = 10
```

В этом случае мы собираемся пропустить первые десять строк из файла CSV:

```sql
SELECT count(*) FROM file('data-small.csv', CSV)
```
```response
┌─count()─┐
│     990 │
└─────────┘
```

Файл [file](assets/data_small.csv) содержит 1k строк, но ClickHouse загрузил только 990, так как мы попросили пропустить первые 10.

:::tip
При использовании функции `file()`, с ClickHouse Cloud вам потребуется выполнять команды в `clickhouse client` на машине, где находится файл. Другой вариант — использовать [`clickhouse-local`](/operations/utilities/clickhouse-local.md) для изучения файлов локально.
:::

### Обработка значений NULL в CSV файлах {#treating-null-values-in-csv-files}

Значения NULL могут быть закодированы по-разному в зависимости от приложения, которое сгенерировало файл. По умолчанию ClickHouse использует `\N` как значение NULL в CSV. Но мы можем изменить это, используя опцию [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation).

Предположим, у нас есть следующий CSV файл:

```bash
> cat nulls.csv
Donald,90
Joe,Nothing
Nothing,70
```

Если мы загрузим данные из этого файла, ClickHouse будет рассматривать `Nothing` как строку (что правильно):

```sql
SELECT * FROM file('nulls.csv')
```
```response
┌─c1──────┬─c2──────┐
│ Donald  │ 90      │
│ Joe     │ Nothing │
│ Nothing │ 70      │
└─────────┴─────────┘
```

Если мы хотим, чтобы ClickHouse рассматривал `Nothing` как `NULL`, мы можем определить это с помощью следующей опции:

```sql
SET format_csv_null_representation = 'Nothing'
```

Теперь у нас есть `NULL`, где мы этого ожидаем:

```sql
SELECT * FROM file('nulls.csv')
```
```response
┌─c1─────┬─c2───┐
│ Donald │ 90   │
│ Joe    │ ᴺᵁᴸᴸ │
│ ᴺᵁᴸᴸ   │ 70   │
└────────┴──────┘
```

## TSV (разделенные табуляцией) файлы {#tsv-tab-separated-files}

Формат данных, разделенных табуляцией, широко используется в качестве формата обмена данными. Чтобы загрузить данные из [TSV файла](assets/data_small.tsv) в ClickHouse, используется формат [TabSeparated](/interfaces/formats.md/#tabseparated):

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT TabSeparated" < data_small.tsv
```

Также существует формат [TabSeparatedWithNames](/interfaces/formats.md/#tabseparatedwithnames) для работы с TSV файлами, содержащими заголовки. И, как для CSV, мы можем пропустить первые X строк, используя опцию [input_format_tsv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines).

### Необработанные TSV {#raw-tsv}

Иногда TSV файлы сохраняются без экранирования табуляций и переносов строк. Мы должны использовать [TabSeparatedRaw](/interfaces/formats.md/#tabseparatedraw) для обработки таких файлов.

## Экспорт в CSV {#exporting-to-csv}

Любой из форматов, упомянутых в наших предыдущих примерах, также может быть использован для экспорта данных. Чтобы экспортировать данные из таблицы (или запроса) в формат CSV, мы используем тот же оператор `FORMAT`:

```sql
SELECT *
FROM sometable
LIMIT 5
FORMAT CSV
```
```response
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
"1971-72_Utah_Stars_season","2016-10-01",1
"2015_UEFA_European_Under-21_Championship_qualification_Group_8","2015-12-01",73
"2016_Greater_Western_Sydney_Giants_season","2017-05-01",86
```

Чтобы добавить заголовок в CSV файл, мы используем формат [CSVWithNames](/interfaces/formats.md/#csvwithnames):

```sql
SELECT *
FROM sometable
LIMIT 5
FORMAT CSVWithNames
```
```response
"path","month","hits"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
"1971-72_Utah_Stars_season","2016-10-01",1
"2015_UEFA_European_Under-21_Championship_qualification_Group_8","2015-12-01",73
"2016_Greater_Western_Sydney_Giants_season","2017-05-01",86
```

### Сохранение экспортированных данных в CSV файл {#saving-exported-data-to-a-csv-file}

Чтобы сохранить экспортированные данные в файл, мы можем использовать оператор [INTO...OUTFILE](/sql-reference/statements/select/into-outfile.md):

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.csv'
FORMAT CSVWithNames
```
```response
36838935 rows in set. Elapsed: 1.304 sec. Processed 36.84 million rows, 1.42 GB (28.24 million rows/s., 1.09 GB/s.)
```

Обратите внимание, что ClickHouse потребовалось **~1** секунда, чтобы сохранить 36m строк в CSV файл.

### Экспорт CSV с пользовательскими разделителями {#exporting-csv-with-custom-delimiters}

Если мы хотим использовать разделители, отличные от запятой, для этого мы можем использовать опцию настройки [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter):

```sql
SET format_csv_delimiter = '|'
```

Теперь ClickHouse будет использовать `|` в качестве разделителя для формата CSV:

```sql
SELECT *
FROM sometable
LIMIT 5
FORMAT CSV
```
```response
"Akiba_Hebrew_Academy"|"2017-08-01"|241
"Aegithina_tiphia"|"2018-02-01"|34
"1971-72_Utah_Stars_season"|"2016-10-01"|1
"2015_UEFA_European_Under-21_Championship_qualification_Group_8"|"2015-12-01"|73
"2016_Greater_Western_Sydney_Giants_season"|"2017-05-01"|86
```

### Экспорт CSV для Windows {#exporting-csv-for-windows}

Если мы хотим, чтобы CSV файл корректно работал в среде Windows, мы должны рассмотреть возможность включения опции [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line). Это будет использовать `\r\n` в качестве переносов строк вместо `\n`:

```sql
SET output_format_csv_crlf_end_of_line = 1;
```

## Вывод схемы для CSV файлов {#schema-inference-for-csv-files}

В многих случаях мы можем работать с неизвестными файлами CSV, поэтому нам нужно исследовать, какие типы использовать для столбцов. ClickHouse по умолчанию попытается угадать форматы данных на основе своего анализа данного CSV файла. Это называется "Вывод схемы". Обнаруженные типы данных можно изучить, используя оператор `DESCRIBE` в паре с функцией [file()](/sql-reference/table-functions/file.md):

```sql
DESCRIBE file('data-small.csv', CSV)
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(Date)   │              │                    │         │                  │                │
│ c3   │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Здесь ClickHouse эффективно смог угадать типы столбцов для нашего CSV файла. Если мы не хотим, чтобы ClickHouse угадывал, мы можем отключить это с помощью следующей опции:

```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
```

Все типы столбцов в этом случае будут рассматриваться как `String`.

### Экспорт и импорт CSV с явными типами столбцов {#exporting-and-importing-csv-with-explicit-column-types}

ClickHouse также позволяет явно задавать типы столбцов при экспорте данных, используя [CSVWithNamesAndTypes](/interfaces/formats.md/#csvwithnamesandtypes) (и другие форматы из семейства *WithNames):

```sql
SELECT *
FROM sometable
LIMIT 5
FORMAT CSVWithNamesAndTypes
```
```response
"path","month","hits"
"String","Date","UInt32"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
"1971-72_Utah_Stars_season","2016-10-01",1
"2015_UEFA_European_Under-21_Championship_qualification_Group_8","2015-12-01",73
"2016_Greater_Western_Sydney_Giants_season","2017-05-01",86
```

Этот формат будет включать две строки заголовков - одну с именами столбцов и другую с типами столбцов. Это позволит ClickHouse (и другим приложениям) определять типы столбцов при загрузке данных из [таких файлов](assets/data_csv_types.csv):

```sql
DESCRIBE file('data_csv_types.csv', CSVWithNamesAndTypes)
```
```response
┌─name──┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path  │ String │              │                    │         │                  │                │
│ month │ Date   │              │                    │         │                  │                │
│ hits  │ UInt32 │              │                    │         │                  │                │
└───────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Теперь ClickHouse идентифицирует типы столбцов на основе (второй) строки заголовка вместо того, чтобы угадывать.

## Пользовательские разделители, разделители и правила экранирования {#custom-delimiters-separators-and-escaping-rules}

В сложных случаях текстовые данные могут быть отформатированы в высоко настроенном виде, но при этом оставаться структурированными. ClickHouse имеет специальный формат [CustomSeparated](/interfaces/formats.md/#format-customseparated) для таких случаев, который позволяет устанавливать пользовательские правила экранирования, разделители, разделители строк и символы начала/конца.

Предположим, у нас есть следующие данные в файле:

```text
row('Akiba_Hebrew_Academy';'2017-08-01';241),row('Aegithina_tiphia';'2018-02-01';34),...
```

Мы можем видеть, что отдельные строки обернуты в `row()`, строки разделяются с помощью `,`, а отдельные значения разделены `;`. В этом случае мы можем использовать следующие настройки для чтения данных из этого файла:

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

Теперь мы можем загружать данные из нашего пользовательского [файла](assets/data_small_custom.txt):

```sql
SELECT *
FROM file('data_small_custom.txt', CustomSeparated)
LIMIT 3
```
```response
┌─c1────────────────────────┬─────────c2─┬──c3─┐
│ Akiba_Hebrew_Academy      │ 2017-08-01 │ 241 │
│ Aegithina_tiphia          │ 2018-02-01 │  34 │
│ 1971-72_Utah_Stars_season │ 2016-10-01 │   1 │
└───────────────────────────┴────────────┴─────┘
```

Мы также можем использовать [CustomSeparatedWithNames](/interfaces/formats.md/#customseparatedwithnames), чтобы заголовки экспортировались и импортировались корректно. Изучите форматы [regex и template](templates-regex.md), чтобы справляться с еще более сложными случаями.

## Работа с большими файлами CSV {#working-with-large-csv-files}

CSV файлы могут быть большими, и ClickHouse работает эффективно с файлами любого размера. Большие файлы обычно поставляются в сжатом виде, и ClickHouse обрабатывает это без необходимости разжатия перед обработкой. Мы можем использовать оператор `COMPRESSION` во время вставки:

```sql
INSERT INTO sometable
FROM INFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

Если оператор `COMPRESSION` пропущен, ClickHouse все равно будет пытаться угадать сжатие файла на основе его расширения. Тот же подход можно использовать для экспорта файлов напрямую в сжатые форматы:

```sql
SELECT *
FROM for_csv
INTO OUTFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

Это создаст сжатый файл `data_csv.csv.gz`.

## Другие форматы {#other-formats}

ClickHouse вводит поддержку многих форматов, как текстовых, так и бинарных, чтобы охватить различные сценарии и платформы. Изучите больше форматов и способы работы с ними в следующих статьях:

- **Форматы CSV и TSV**
- [Parquet](parquet.md)
- [Форматы JSON](/integrations/data-ingestion/data-formats/json/intro.md)
- [Regex и шаблоны](templates-regex.md)
- [Нативные и бинарные форматы](binary.md)
- [SQL форматы](sql.md)

И также ознакомьтесь с [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - портативным полноценным инструментом для работы с локальными/удалёнными файлами без необходимости в сервере ClickHouse.
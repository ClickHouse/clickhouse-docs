---
sidebar_label: 'CSV и TSV'
slug: /integrations/data-formats/csv-tsv
title: 'Работа с данными в форматах CSV и TSV в ClickHouse'
description: 'Страница, описывающая работу с данными в форматах CSV и TSV в ClickHouse'
keywords: ['CSV format', 'TSV format', 'comma separated values', 'tab separated values', 'data import']
doc_type: 'guide'
---



# Работа с данными CSV и TSV в ClickHouse

ClickHouse поддерживает импорт данных из CSV и экспорт данных в CSV. Поскольку файлы CSV могут иметь разные особенности формата, включая строки заголовков, пользовательские разделители и символы экранирования, ClickHouse предоставляет форматы и настройки для эффективной обработки каждого варианта.



## Импорт данных из CSV-файла {#importing-data-from-a-csv-file}

Перед импортом данных создадим таблицу с соответствующей структурой:

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

Для импорта данных из [CSV-файла](assets/data_small.csv) в таблицу `sometable` можно передать файл напрямую в clickhouse-client через конвейер:

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSV" < data_small.csv
```

Обратите внимание, что мы используем [FORMAT CSV](/interfaces/formats/CSV), чтобы сообщить ClickHouse о том, что загружаются данные в формате CSV. Альтернативно можно загрузить данные из локального файла с помощью конструкции [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file):

```sql
INSERT INTO sometable
FROM INFILE 'data_small.csv'
FORMAT CSV
```

Здесь мы используем конструкцию `FORMAT CSV`, чтобы ClickHouse понимал формат файла. Также можно загружать данные напрямую из URL с помощью функции [url()](/sql-reference/table-functions/url.md) или из файлов S3 с помощью функции [s3()](/sql-reference/table-functions/s3.md).

:::tip
Можно не указывать формат явно для `file()` и `INFILE`/`OUTFILE`.
В этом случае ClickHouse автоматически определит формат на основе расширения файла.
:::

### CSV-файлы с заголовками {#csv-files-with-headers}

Предположим, что наш [CSV-файл содержит заголовки](assets/data_small_headers.csv):

```bash
head data-small-headers.csv
```

```response
"path","month","hits"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
```

Для импорта данных из этого файла можно использовать формат [CSVWithNames](/interfaces/formats/CSVWithNames):

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSVWithNames" < data_small_headers.csv
```

В этом случае ClickHouse пропускает первую строку при импорте данных из файла.

:::tip
Начиная с [версии](https://github.com/ClickHouse/ClickHouse/releases) 23.1, ClickHouse автоматически определяет заголовки в CSV-файлах при использовании формата `CSV`, поэтому нет необходимости использовать `CSVWithNames` или `CSVWithNamesAndTypes`.
:::

### CSV-файлы с пользовательскими разделителями {#csv-files-with-custom-delimiters}

Если в CSV-файле используется разделитель, отличный от запятой, можно использовать параметр [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) для установки соответствующего символа:

```sql
SET format_csv_delimiter = ';'
```

Теперь при импорте из CSV-файла в качестве разделителя будет использоваться символ `;` вместо запятой.

### Пропуск строк в CSV-файле {#skipping-lines-in-a-csv-file}

Иногда может потребоваться пропустить определённое количество строк при импорте данных из CSV-файла. Это можно сделать с помощью параметра [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines):

```sql
SET input_format_csv_skip_first_lines = 10
```

В этом случае мы пропустим первые десять строк из CSV-файла:

```sql
SELECT count(*) FROM file('data-small.csv', CSV)
```

```response
┌─count()─┐
│     990 │
└─────────┘
```

[Файл](assets/data_small.csv) содержит 1000 строк, но ClickHouse загрузил только 990, так как мы указали пропустить первые 10.

:::tip
При использовании функции `file()` в ClickHouse Cloud необходимо выполнять команды в `clickhouse client` на машине, где находится файл. Другой вариант — использовать [`clickhouse-local`](/operations/utilities/clickhouse-local.md) для работы с файлами локально.
:::

### Обработка значений NULL в CSV-файлах {#treating-null-values-in-csv-files}

Значения Null могут кодироваться по-разному в зависимости от приложения, которое создало файл. По умолчанию ClickHouse использует `\N` в качестве значения Null в CSV. Но это можно изменить с помощью параметра [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation).

Предположим, у нас есть следующий CSV-файл:

```bash
> cat nulls.csv
Donald,90
Joe,Nothing
Nothing,70
```


Если мы загрузим данные из этого файла, ClickHouse будет интерпретировать `Nothing` как String (и это корректно):

```sql
SELECT * FROM file('nulls.csv')
```

```response
┌─c1──────┬─c2──────┐
│ Donald  │ 90      │
│ Joe     │ Ничего │
│ Ничего │ 70      │
└─────────┴─────────┘
```

Если мы хотим, чтобы ClickHouse трактовал `Nothing` как `NULL`, можно задать это с помощью следующей опции:

```sql
SET format_csv_null_representation = 'Nothing'
```

Теперь `NULL` находится там, где мы его ожидаем:

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


## TSV-файлы (с разделителями-табуляциями) {#tsv-tab-separated-files}

Формат данных с разделителями-табуляциями широко используется для обмена данными. Для загрузки данных из [TSV-файла](assets/data_small.tsv) в ClickHouse используется формат [TabSeparated](/interfaces/formats/TabSeparated):

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT TabSeparated" < data_small.tsv
```

Также существует формат [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames), позволяющий работать с TSV-файлами, которые содержат заголовки. Как и для CSV, можно пропустить первые X строк с помощью параметра [input_format_tsv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines).

### Необработанный TSV {#raw-tsv}

Иногда TSV-файлы сохраняются без экранирования символов табуляции и переводов строк. Для обработки таких файлов следует использовать формат [TabSeparatedRaw](/interfaces/formats/TabSeparatedRaw).


## Экспорт в CSV {#exporting-to-csv}

Любой формат из предыдущих примеров можно использовать для экспорта данных. Чтобы экспортировать данные из таблицы (или запроса) в формат CSV, используется то же предложение `FORMAT`:

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

Чтобы добавить заголовок в CSV-файл, используется формат [CSVWithNames](/interfaces/formats/CSVWithNames):

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

### Сохранение экспортированных данных в CSV-файл {#saving-exported-data-to-a-csv-file}

Для сохранения экспортированных данных в файл используется предложение [INTO...OUTFILE](/sql-reference/statements/select/into-outfile.md):

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.csv'
FORMAT CSVWithNames
```

```response
36838935 rows in set. Elapsed: 1.304 sec. Processed 36.84 million rows, 1.42 GB (28.24 million rows/s., 1.09 GB/s.)
```

Обратите внимание, что ClickHouse потребовалась **~1** секунда для сохранения 36 млн строк в CSV-файл.

### Экспорт CSV с пользовательскими разделителями {#exporting-csv-with-custom-delimiters}

Если требуется использовать разделители, отличные от запятой, можно применить параметр настройки [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter):

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

Если требуется, чтобы CSV-файл корректно работал в среде Windows, следует включить параметр [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line). Это позволит использовать `\r\n` в качестве разрывов строк вместо `\n`:

```sql
SET output_format_csv_crlf_end_of_line = 1;
```


## Автоматическое определение схемы для CSV-файлов {#schema-inference-for-csv-files}

Во многих случаях приходится работать с неизвестными CSV-файлами, поэтому необходимо определить, какие типы использовать для столбцов. ClickHouse по умолчанию пытается определить типы данных на основе анализа заданного CSV-файла. Это называется «автоматическим определением схемы» (Schema Inference). Определённые типы данных можно изучить с помощью оператора `DESCRIBE` в паре с функцией [file()](/sql-reference/table-functions/file.md):

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

Здесь ClickHouse успешно определил типы столбцов для нашего CSV-файла. Если не требуется, чтобы ClickHouse определял типы автоматически, это можно отключить следующей настройкой:

```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
```

В этом случае все типы столбцов будут обрабатываться как `String`.

### Экспорт и импорт CSV с явным указанием типов столбцов {#exporting-and-importing-csv-with-explicit-column-types}

ClickHouse также позволяет явно задавать типы столбцов при экспорте данных с использованием формата [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes) (и других форматов семейства \*WithNames):

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

Этот формат включает две строки заголовка — одну с именами столбцов, а другую с типами столбцов. Это позволяет ClickHouse (и другим приложениям) определять типы столбцов при загрузке данных из [таких файлов](assets/data_csv_types.csv):

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

Теперь ClickHouse определяет типы столбцов на основе (второй) строки заголовка, а не путём автоматического определения.


## Пользовательские разделители, сепараторы и правила экранирования {#custom-delimiters-separators-and-escaping-rules}

В сложных случаях текстовые данные могут быть отформатированы нестандартным образом, но при этом иметь структуру. ClickHouse предоставляет специальный формат [CustomSeparated](/interfaces/formats/CustomSeparated) для таких случаев, который позволяет задавать пользовательские правила экранирования, разделители, сепараторы строк и начальные/конечные символы.

Предположим, у нас есть следующие данные в файле:

```text
row('Akiba_Hebrew_Academy';'2017-08-01';241),row('Aegithina_tiphia';'2018-02-01';34),...
```

Мы видим, что отдельные строки обёрнуты в `row()`, строки разделены запятой `,`, а отдельные значения разделены точкой с запятой `;`. В этом случае мы можем использовать следующие настройки для чтения данных из этого файла:

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

Теперь мы можем загрузить данные из нашего [файла](assets/data_small_custom.txt) с пользовательским форматированием:

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

Мы также можем использовать [CustomSeparatedWithNames](/interfaces/formats/CustomSeparatedWithNames) для корректного экспорта и импорта заголовков. Изучите форматы [regex и template](templates-regex.md) для работы с ещё более сложными случаями.


## Работа с большими CSV-файлами {#working-with-large-csv-files}

CSV-файлы могут быть большими, и ClickHouse эффективно работает с файлами любого размера. Большие файлы обычно поставляются сжатыми, и ClickHouse обрабатывает их без необходимости предварительной распаковки. Можно использовать параметр `COMPRESSION` при вставке данных:

```sql
INSERT INTO sometable
FROM INFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

Если параметр `COMPRESSION` не указан, ClickHouse всё равно попытается определить тип сжатия файла по его расширению. Тот же подход можно использовать для экспорта файлов непосредственно в сжатом виде:

```sql
SELECT *
FROM for_csv
INTO OUTFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

Эта команда создаст сжатый файл `data_csv.csv.gz`.


## Другие форматы {#other-formats}

ClickHouse поддерживает множество форматов — как текстовых, так и бинарных — для работы в различных сценариях и на разных платформах. Подробнее о форматах и способах работы с ними читайте в следующих статьях:

- **Форматы CSV и TSV**
- [Parquet](parquet.md)
- [Форматы JSON](/integrations/data-ingestion/data-formats/json/intro.md)
- [Регулярные выражения и шаблоны](templates-regex.md)
- [Нативные и бинарные форматы](binary.md)
- [Форматы SQL](sql.md)

Также обратите внимание на [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) — портативный полнофункциональный инструмент для работы с локальными и удалёнными файлами без необходимости запуска сервера ClickHouse.

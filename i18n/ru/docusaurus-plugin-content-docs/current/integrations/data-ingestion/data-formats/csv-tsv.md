---
sidebar_label: 'CSV и TSV'
slug: /integrations/data-formats/csv-tsv
title: 'Работа с данными в форматах CSV и TSV в ClickHouse'
description: 'Страница, описывающая работу с данными в форматах CSV и TSV в ClickHouse'
keywords: ['формат CSV', 'формат TSV', 'значения, разделённые запятыми', 'значения, разделённые табуляцией', 'импорт данных']
doc_type: 'guide'
---



# Работа с данными CSV и TSV в ClickHouse {#working-with-csv-and-tsv-data-in-clickhouse}

ClickHouse поддерживает импорт данных из CSV и экспорт в CSV. Поскольку CSV‑файлы могут иметь различные особенности формата, включая строки заголовков, пользовательские разделители и escape‑символы, ClickHouse предоставляет форматы и настройки для эффективной обработки всех таких вариантов.



## Импорт данных из CSV‑файла {#importing-data-from-a-csv-file}

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

Чтобы импортировать данные из [CSV-файла](assets/data_small.csv) в таблицу `sometable`, можно передать содержимое файла напрямую в clickhouse-client через конвейер (pipe):

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSV" < data_small.csv
```

Обратите внимание, что мы используем [FORMAT CSV](/interfaces/formats/CSV), чтобы указать ClickHouse, что мы выполняем приём данных в формате CSV. В качестве альтернативы мы можем загрузить данные из локального файла с помощью предложения [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file):

```sql
INSERT INTO sometable
FROM INFILE 'data_small.csv'
FORMAT CSV
```

Здесь мы используем конструкцию `FORMAT CSV`, чтобы ClickHouse мог интерпретировать формат файла. Мы также можем загружать данные напрямую из URL с помощью функции [url()](/sql-reference/table-functions/url.md) или из файлов в S3-хранилище с помощью функции [s3()](/sql-reference/table-functions/s3.md).

:::tip
Мы можем не указывать формат явно для `file()` и `INFILE`/`OUTFILE`.
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

Чтобы импортировать данные из этого файла, можно использовать формат [CSVWithNames](/interfaces/formats/CSVWithNames):

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSVWithNames" < data_small_headers.csv
```

В этом случае ClickHouse пропускает первую строку при импорте данных из файла.

:::tip
Начиная с [версии](https://github.com/ClickHouse/ClickHouse/releases) 23.1, ClickHouse автоматически определяет заголовки в CSV-файлах при использовании формата `CSV`, поэтому нет необходимости использовать `CSVWithNames` или `CSVWithNamesAndTypes`.
:::

### CSV-файлы с пользовательскими разделителями {#csv-files-with-custom-delimiters}

Если в CSV-файле используется разделитель, отличный от запятой, мы можем использовать опцию [format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter), чтобы задать соответствующий символ:

```sql
SET format_csv_delimiter = ';'
```

Теперь при импорте из CSV-файла символ `;` будет использоваться как разделитель вместо запятой.

### Пропуск строк в CSV-файле {#skipping-lines-in-a-csv-file}

Иногда при импорте данных из CSV-файла может потребоваться пропустить определённое количество строк. Это можно сделать с помощью опции [input&#95;format&#95;csv&#95;skip&#95;first&#95;lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines):

```sql
SET input_format_csv_skip_first_lines = 10
```

В этом примере мы пропустим первые десять строк CSV-файла:

```sql
SELECT count(*) FROM file('data-small.csv', CSV)
```

```response
┌─count()─┐
│     990 │
└─────────┘
```

Файл [file](assets/data_small.csv) содержит 1k строк, но ClickHouse загрузил только 990, так как мы указали пропустить первые 10.

:::tip
При использовании функции `file()` в ClickHouse Cloud вам потребуется выполнять команды в `clickhouse client` на машине, где находится файл. Другой вариант — использовать [`clickhouse-local`](/operations/utilities/clickhouse-local.md) для локального анализа файлов.
:::

### Обработка значений NULL в CSV-файлах {#treating-null-values-in-csv-files}

Значения NULL могут кодироваться по-разному в зависимости от приложения, которое сгенерировало файл. По умолчанию ClickHouse использует `\N` как представление NULL в CSV. Это поведение можно изменить с помощью опции [format&#95;csv&#95;null&#95;representation](/operations/settings/settings-formats.md/#format_tsv_null_representation).

Предположим, у нас есть следующий CSV-файл:

```bash
> cat nulls.csv
Donald,90
Joe,Nothing
Nothing,70
```


Если мы загрузим данные из этого файла, ClickHouse будет интерпретировать `Nothing` как `String` (что корректно):

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

Если мы хотим, чтобы ClickHouse воспринимал `Nothing` как `NULL`, мы можем задать это с помощью следующего параметра:

```sql
SET format_csv_null_representation = 'Nothing'
```

Теперь значение `NULL` находится там, где мы его и ожидаем:

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


## TSV‑файлы (со значениями, разделёнными табуляцией) {#tsv-tab-separated-files}

Формат данных с разделителями табуляции широко используется в качестве формата обмена данными. Для загрузки данных из [TSV‑файла](assets/data_small.tsv) в ClickHouse используется формат [TabSeparated](/interfaces/formats/TabSeparated):

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT TabSeparated" < data_small.tsv
```

Существует также формат [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames), который позволяет работать с TSV‑файлами, содержащими заголовки. Аналогично CSV, мы можем пропустить первые X строк с помощью опции [input&#95;format&#95;tsv&#95;skip&#95;first&#95;lines](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines).

### Необработанный TSV {#raw-tsv}

Иногда TSV‑файлы сохраняются без экранирования табуляций и символов перевода строки. Для обработки таких файлов следует использовать [TabSeparatedRaw](/interfaces/formats/TabSeparatedRaw).


## Экспорт в CSV {#exporting-to-csv}

Любой формат, использованный в наших предыдущих примерах, можно также использовать для экспорта данных. Чтобы экспортировать данные из таблицы (или результата запроса) в формат CSV, мы используем ту же конструкцию `FORMAT`:

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

Чтобы добавить строку заголовка в CSV‑файл, используем формат [CSVWithNames](/interfaces/formats/CSVWithNames):

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

### Сохранение экспортированных данных в CSV‑файл {#saving-exported-data-to-a-csv-file}

Чтобы сохранить экспортированные данные в файл, можно использовать конструкцию [INTO...OUTFILE](/sql-reference/statements/select/into-outfile.md):

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.csv'
FORMAT CSVWithNames
```

```response
Получено 36838935 строк. Время выполнения: 1.304 сек. Обработано 36.84 млн строк, 1.42 ГБ (28.24 млн строк/сек., 1.09 ГБ/сек.)
```

Обратите внимание, что ClickHouse потребовалась всего **~1** секунда, чтобы сохранить 36 млн строк в файл CSV.

### Экспорт CSV с пользовательскими разделителями {#exporting-csv-with-custom-delimiters}

Если мы хотим использовать разделители, отличные от запятых, мы можем воспользоваться параметром [format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) в настройках:

```sql
SET format_csv_delimiter = '|'
```

Теперь ClickHouse будет использовать `|` в качестве разделителя в формате CSV:

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

Если нам нужен файл CSV, корректно работающий в среде Windows, следует включить настройку [output&#95;format&#95;csv&#95;crlf&#95;end&#95;of&#95;line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line). В этом случае в качестве символов конца строки будет использоваться `\r\n` вместо `\n`:

```sql
SET output_format_csv_crlf_end_of_line = 1;
```


## Автоматическое определение схемы для файлов CSV {#schema-inference-for-csv-files}

Во многих случаях нам приходится работать с неизвестными CSV-файлами, поэтому необходимо определить, какие типы данных использовать для столбцов. По умолчанию ClickHouse пытается определить форматы данных на основе анализа заданного CSV-файла. Это называется «автоматическим определением схемы». Обнаруженные типы данных можно изучить с помощью оператора `DESCRIBE` в сочетании с функцией [file()](/sql-reference/table-functions/file.md):

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

Здесь ClickHouse смог эффективно угадать типы столбцов для нашего CSV-файла. Если мы не хотим, чтобы ClickHouse делал это, мы можем отключить эту возможность с помощью следующей опции:

```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
```

Во всех столбцах тип данных будет интерпретироваться как `String`.

### Экспорт и импорт CSV с явным указанием типов столбцов {#exporting-and-importing-csv-with-explicit-column-types}

ClickHouse также позволяет явно задавать типы столбцов при экспорте данных с помощью формата [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes) (и других форматов семейства *WithNames*):

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

Этот формат включает две строки заголовка — одну с именами столбцов и другую с их типами. Это позволяет ClickHouse (и другим приложениям) определять типы столбцов при загрузке данных из [подобных файлов](assets/data_csv_types.csv):

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

Теперь ClickHouse определяет типы столбцов по (второй) строке заголовка, а не пытается их угадывать.


## Пользовательские разделители, сепараторы и правила экранирования {#custom-delimiters-separators-and-escaping-rules}

В сложных случаях текстовые данные могут быть отформатированы в сильно кастомизированном виде, но при этом сохранять структуру. В ClickHouse есть специальный формат [CustomSeparated](/interfaces/formats/CustomSeparated) для таких случаев, который позволяет задавать собственные правила экранирования, разделители, разделители строк и начальные/конечные символы.

Предположим, что у нас есть следующие данные в файле:

```text
row('Akiba_Hebrew_Academy';'2017-08-01';241),row('Aegithina_tiphia';'2018-02-01';34),...
```

Мы видим, что отдельные записи заключены в `row()`, строки разделены запятыми (`,`), а отдельные значения внутри строк — точкой с запятой (`;`). В этом случае мы можем использовать следующие настройки для чтения данных из этого файла:

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

Теперь мы можем загрузить данные из нашего файла [file](assets/data_small_custom.txt) с пользовательским форматом:

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

Мы также можем использовать [CustomSeparatedWithNames](/interfaces/formats/CustomSeparatedWithNames), чтобы корректно экспортировать и импортировать заголовки. Изучите форматы [regex and template](templates-regex.md) для работы с ещё более сложными случаями.


## Работа с большими CSV‑файлами {#working-with-large-csv-files}

CSV‑файлы могут быть большими, и ClickHouse эффективно работает с файлами любого размера. Крупные файлы обычно бывают сжаты, и ClickHouse умеет работать с ними без предварительной распаковки. Мы можем использовать предложение `COMPRESSION` при вставке:

```sql
INSERT INTO sometable
FROM INFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

Если клауза `COMPRESSION` опущена, ClickHouse всё равно попытается определить тип сжатия файла по его расширению. Тем же способом можно экспортировать файлы непосредственно в сжатые форматы:

```sql
SELECT *
FROM for_csv
INTO OUTFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

В результате будет создан сжатый файл `data_csv.csv.gz`.


## Другие форматы {#other-formats}

ClickHouse поддерживает множество форматов, как текстовых, так и бинарных, чтобы охватить различные сценарии и платформы. Узнайте больше о форматах и способах работы с ними в следующих статьях:

- **Форматы CSV и TSV**
- [Parquet](parquet.md)
- [Форматы JSON](/integrations/data-ingestion/data-formats/json/intro.md)
- [Регулярные выражения и шаблоны](templates-regex.md)
- [Нативные и бинарные форматы](binary.md)
- [SQL-форматы](sql.md)

Также ознакомьтесь с [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) — переносимым полнофункциональным инструментом для работы с локальными и удалёнными файлами без необходимости в сервере ClickHouse.

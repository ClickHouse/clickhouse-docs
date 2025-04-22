---
title: 'Экспорт JSON'
slug: /integrations/data-formats/json/exporting
description: 'Как экспортировать данные JSON из ClickHouse'
keywords: ['json', 'clickhouse', 'formats', 'exporting']
---


# Экспорт JSON

Практически любой формат JSON, используемый для импорта, может быть использован и для экспорта. Самый популярный формат — это [`JSONEachRow`](/interfaces/formats.md/#jsoneachrow):

```sql
SELECT * FROM sometable FORMAT JSONEachRow
```
```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
```

Или мы можем использовать [`JSONCompactEachRow`](/interfaces/formats#jsoncompacteachrow), чтобы сэкономить место на диске, пропуская имена колонок:

```sql
SELECT * FROM sometable FORMAT JSONCompactEachRow
```
```response
["Bob_Dolman", "2016-11-01", 245]
["1-krona", "2017-01-01", 4]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]
```

## Переопределение типов данных как строк {#overriding-data-types-as-strings}

ClickHouse учитывает типы данных и будет экспортировать JSON в соответствии со стандартами. Но в случаях, когда нам нужно, чтобы все значения кодировались как строки, мы можем использовать формат [JSONStringsEachRow](/interfaces/formats.md/#jsonstringseachrow):

```sql
SELECT * FROM sometable FORMAT JSONStringsEachRow
```
```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":"245"}
{"path":"1-krona","month":"2017-01-01","hits":"4"}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":"3"}
```

Теперь числовая колонка `hits` закодирована как строка. Экспорт в виде строк поддерживается для всех форматов JSON*, просто исследуйте форматы `JSONStrings\*` и `JSONCompactStrings\*`:

```sql
SELECT * FROM sometable FORMAT JSONCompactStringsEachRow
```
```response
["Bob_Dolman", "2016-11-01", "245"]
["1-krona", "2017-01-01", "4"]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", "3"]
```

## Экспорт метаданных вместе с данными {#exporting-metadata-together-with-data}

Общий [JSON](/interfaces/formats.md/#json) формат, который популярен в приложениях, будет экспортировать не только результирующие данные, но и типы колонок и статистику запросов:

```sql
SELECT * FROM sometable FORMAT JSON
```
```response
{
        "meta":
        [
                {
                        "name": "path",
                        "type": "String"
                },
                ...
        ],

        "data":
        [
                {
                        "path": "Bob_Dolman",
                        "month": "2016-11-01",
                        "hits": 245
                },
                ...
        ],

        "rows": 3,

        "statistics":
        {
                "elapsed": 0.000497457,
                "rows_read": 3,
                "bytes_read": 87
        }
}
```

Формат [JSONCompact](/interfaces/formats.md/#jsoncompact) будет печатать ту же метаинформацию, но использовать компактную форму для самих данных:

```sql
SELECT * FROM sometable FORMAT JSONCompact
```
```response
{
        "meta":
        [
                {
                        "name": "path",
                        "type": "String"
                },
                ...
        ],

        "data":
        [
                ["Bob_Dolman", "2016-11-01", 245],
                ["1-krona", "2017-01-01", 4],
                ["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]
        ],

        "rows": 3,

        "statistics":
        {
                "elapsed": 0.00074981,
                "rows_read": 3,
                "bytes_read": 87
        }
}
```

Рассмотрите варианты [`JSONStrings`](/interfaces/formats.md/#jsonstrings) или [`JSONCompactStrings`](/interfaces/formats.md/#jsoncompactstrings), чтобы закодировать все значения как строки.

## Компактный способ экспорта данных и структуры JSON {#compact-way-to-export-json-data-and-structure}

Более эффективный способ получить данные, а также их структуру, — использовать формат [`JSONCompactEachRowWithNamesAndTypes`](/interfaces/formats.md/#jsoncompacteachrowwithnamesandtypes):

```sql
SELECT * FROM sometable FORMAT JSONCompactEachRowWithNamesAndTypes
```
```response
["path", "month", "hits"]
["String", "Date", "UInt32"]
["Bob_Dolman", "2016-11-01", 245]
["1-krona", "2017-01-01", 4]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]
```

Этот формат использует компактный JSON, предваряемый двумя строками заголовка с именами и типами колонок. Этот формат может быть использован для приема данных в другую инстанцию ClickHouse (или в другие приложения).

## Экспорт JSON в файл {#exporting-json-to-a-file}

Чтобы сохранить экспортируемые данные JSON в файл, мы можем использовать конструкцию [INTO OUTFILE](/sql-reference/statements/select/into-outfile.md):

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json' FORMAT JSONEachRow
```
```response
36838935 rows in set. Elapsed: 2.220 sec. Processed 36.84 million rows, 1.27 GB (16.60 million rows/s., 572.47 MB/s.)
```

ClickHouse потребовалось всего 2 секунды, чтобы экспортировать почти 37 миллионов записей в файл JSON. Мы также можем экспортировать с помощью конструкции `COMPRESSION`, чтобы включить сжатие на лету:

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json.gz' FORMAT JSONEachRow
```
```response
36838935 rows in set. Elapsed: 22.680 sec. Processed 36.84 million rows, 1.27 GB (1.62 million rows/s., 56.02 MB/s.)
```

На это уходит больше времени, но создается намного меньший сжатый файл:

```bash
2.2G    out.json
576M    out.json.gz
```

---
slug: '/integrations/data-formats/json/exporting'
description: 'Как экспортировать JSON данные из ClickHouse'
title: 'Экспорт JSON'
keywords: ['json', 'clickhouse', 'formats', 'exporting']
doc_type: guide
---
# Экспорт JSON

Практически любой формат JSON, используемый для импорта, можно использовать и для экспорта. Наиболее популярным является [`JSONEachRow`](/interfaces/formats.md/#jsoneachrow):

```sql
SELECT * FROM sometable FORMAT JSONEachRow
```
```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
```

Или мы можем использовать [`JSONCompactEachRow`](/interfaces/formats#jsoncompacteachrow), чтобы сэкономить место на диске, пропуская названия колонок:

```sql
SELECT * FROM sometable FORMAT JSONCompactEachRow
```
```response
["Bob_Dolman", "2016-11-01", 245]
["1-krona", "2017-01-01", 4]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]
```

## Переопределение типов данных как строк {#overriding-data-types-as-strings}

ClickHouse уважает типы данных и будет экспортировать JSON в соответствии с стандартами. Но в случаях, когда нам нужно закодировать все значения как строки, мы можем использовать формат [JSONStringsEachRow](/interfaces/formats.md/#jsonstringseachrow):

```sql
SELECT * FROM sometable FORMAT JSONStringsEachRow
```
```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":"245"}
{"path":"1-krona","month":"2017-01-01","hits":"4"}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":"3"}
```

Теперь числовая колонка `hits` закодирована как строка. Экспорт в виде строк поддерживается для всех форматов JSON*, просто изучите форматы `JSONStrings\*` и `JSONCompactStrings\*`:

```sql
SELECT * FROM sometable FORMAT JSONCompactStringsEachRow
```
```response
["Bob_Dolman", "2016-11-01", "245"]
["1-krona", "2017-01-01", "4"]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", "3"]
```

## Экспорт метаданных вместе с данными {#exporting-metadata-together-with-data}

Общий [JSON](/interfaces/formats.md/#json) формат, который популярен в приложениях, экспортирует не только результирующие данные, но и типы колонок и статистику запросов:

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

Формат [JSONCompact](/interfaces/formats.md/#jsoncompact) выведет ту же метаданные, но использует компактную форму для самих данных:

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

Рассмотрите варианты [`JSONStrings`](/interfaces/formats.md/#jsonstrings) или [`JSONCompactStrings`](/interfaces/formats.md/#jsoncompactstrings) для кодирования всех значений как строк.

## Компактный способ экспорта данных и структуры JSON {#compact-way-to-export-json-data-and-structure}

Более эффективный способ иметь данные, а также их структуру, - использовать формат [`JSONCompactEachRowWithNamesAndTypes`](/interfaces/formats.md/#jsoncompacteachrowwithnamesandtypes):

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

Этот формат будет использовать компактный JSON, предваряемый двумя строками заголовка с названиями колонок и их типами. Этот формат затем можно использовать для загрузки данных в другую инстанцию ClickHouse (или другие приложения).

## Экспорт JSON в файл {#exporting-json-to-a-file}

Чтобы сохранить экспортированные данные JSON в файл, мы можем использовать оператор [INTO OUTFILE](/sql-reference/statements/select/into-outfile.md):

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json' FORMAT JSONEachRow
```
```response
36838935 rows in set. Elapsed: 2.220 sec. Processed 36.84 million rows, 1.27 GB (16.60 million rows/s., 572.47 MB/s.)
```

Экспорт почти 37 миллионов записей в JSON файл занял у ClickHouse всего 2 секунды. Мы также можем экспортировать, используя оператор `COMPRESSION`, чтобы включить сжатие на лету:

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json.gz' FORMAT JSONEachRow
```
```response
36838935 rows in set. Elapsed: 22.680 sec. Processed 36.84 million rows, 1.27 GB (1.62 million rows/s., 56.02 MB/s.)
```

Это занимает больше времени, но генерирует гораздо меньший сжатый файл:

```bash
2.2G    out.json
576M    out.json.gz
```
---
title: 'Экспорт данных JSON'
slug: /integrations/data-formats/json/exporting
description: 'Как экспортировать данные в формате JSON из ClickHouse'
keywords: ['json', 'clickhouse', 'formats', 'exporting']
doc_type: 'guide'
---

# Экспорт JSON {#exporting-json}

Почти любой формат JSON, используемый для импорта, может использоваться и для экспорта. Наиболее популярный — [`JSONEachRow`](/interfaces/formats/JSONEachRow):

```sql
SELECT * FROM sometable FORMAT JSONEachRow
```

```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
```

Или мы можем использовать [`JSONCompactEachRow`](/interfaces/formats/JSONCompactEachRow), чтобы сэкономить место на диске за счёт опускания имён столбцов:

```sql
SELECT * FROM sometable FORMAT JSONCompactEachRow
```

```response
["Bob_Dolman", "2016-11-01", 245]
["1-krona", "2017-01-01", 4]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]
```

## Переопределение типов данных строковым типом {#overriding-data-types-as-strings}

ClickHouse строго следует типам данных и экспортирует JSON в соответствии со стандартами. В случаях, когда требуется, чтобы все значения были закодированы в виде строк, можно использовать формат [JSONStringsEachRow](/interfaces/formats/JSONStringsEachRow):

```sql
SELECT * FROM sometable FORMAT JSONStringsEachRow
```

```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":"245"}
{"path":"1-krona","month":"2017-01-01","hits":"4"}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":"3"}
```

Теперь числовой столбец `hits` представлен в виде строки. Экспорт в виде строк поддерживается для всех форматов семейства JSON*, см. форматы `JSONStrings\*` и `JSONCompactStrings\*`:

```sql
SELECT * FROM sometable FORMAT JSONCompactStringsEachRow
```

```response
["Bob_Dolman", "2016-11-01", "245"]
["1-krona", "2017-01-01", "4"]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", "3"]
```

## Экспорт метаданных вместе с данными {#exporting-metadata-together-with-data}

Формат [JSON](/interfaces/formats/JSON), распространённый в приложениях, экспортирует не только результирующие данные, но и типы столбцов, а также статистику запроса:

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

Формат [JSONCompact](/interfaces/formats/JSONCompact) выводит те же метаданные, но использует более компактный формат самих данных:

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

Рассмотрите использование вариантов [`JSONStrings`](/interfaces/formats/JSONStrings) или [`JSONCompactStrings`](/interfaces/formats/JSONCompactStrings) для кодирования всех значений в виде строк.

## Компактный способ экспорта данных и их структуры в формате JSON {#compact-way-to-export-json-data-and-structure}

Более эффективный способ получить данные вместе с их структурой — использовать формат [`JSONCompactEachRowWithNamesAndTypes`](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes):

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

Будет использован компактный формат JSON, в начале которого будут две строки заголовка с именами столбцов и их типами. Затем этот формат можно использовать для приёма данных в другой экземпляр ClickHouse (или другие приложения).

## Экспорт JSON в файл {#exporting-json-to-a-file}

Чтобы сохранить экспортируемые данные в формате JSON в файл, можно использовать клаузу [INTO OUTFILE](/sql-reference/statements/select/into-outfile.md):

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json' FORMAT JSONEachRow
```

```response
36838935 rows in set. Elapsed: 2.220 sec. Processed 36.84 million rows, 1.27 GB (16.60 million rows/s., 572.47 MB/s.)
```

ClickHouse потребовалось всего 2 секунды, чтобы экспортировать почти 37 миллионов записей в JSON-файл. Мы также можем выполнить экспорт, используя оператор `COMPRESSION`, чтобы включить сжатие на лету:

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json.gz' FORMAT JSONEachRow
```

```response
36838935 rows in set. Elapsed: 22.680 sec. Processed 36.84 million rows, 1.27 GB (1.62 million rows/s., 56.02 MB/s.)
```

Требует больше времени на выполнение, но создаёт значительно меньший сжатый файл:

```bash
2.2G    out.json
576M    out.json.gz
```

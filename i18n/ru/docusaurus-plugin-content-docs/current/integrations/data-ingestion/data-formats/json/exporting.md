---
title: 'Экспорт JSON'
slug: /integrations/data-formats/json/exporting
description: 'Как экспортировать данные JSON из ClickHouse'
keywords: ['json', 'clickhouse', 'formats', 'exporting']
doc_type: 'guide'
---



# Экспорт JSON

Почти любой формат JSON, используемый для импорта, может использоваться и для экспорта. Наиболее популярным является формат [`JSONEachRow`](/interfaces/formats/JSONEachRow):

```sql
SELECT * FROM sometable FORMAT JSONEachRow
```

```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
```

Или можно использовать формат [`JSONCompactEachRow`](/interfaces/formats/JSONCompactEachRow), чтобы сэкономить место на диске за счёт опущенных имён столбцов:

```sql
SELECT * FROM sometable FORMAT JSONCompactEachRow
```

```response
["Bob_Dolman", "2016-11-01", 245]
["1-krona", "2017-01-01", 4]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]
```


## Переопределение типов данных как строк {#overriding-data-types-as-strings}

ClickHouse соблюдает типы данных и экспортирует JSON в соответствии со стандартами. Однако в случаях, когда необходимо представить все значения в виде строк, можно использовать формат [JSONStringsEachRow](/interfaces/formats/JSONStringsEachRow):

```sql
SELECT * FROM sometable FORMAT JSONStringsEachRow
```

```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":"245"}
{"path":"1-krona","month":"2017-01-01","hits":"4"}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":"3"}
```

Теперь числовой столбец `hits` представлен в виде строки. Экспорт в виде строк поддерживается для всех форматов JSON\*. Для этого используйте форматы `JSONStrings\*` и `JSONCompactStrings\*`:

```sql
SELECT * FROM sometable FORMAT JSONCompactStringsEachRow
```

```response
["Bob_Dolman", "2016-11-01", "245"]
["1-krona", "2017-01-01", "4"]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", "3"]
```


## Экспорт метаданных вместе с данными {#exporting-metadata-together-with-data}

Стандартный формат [JSON](/interfaces/formats/JSON), широко используемый в приложениях, экспортирует не только результирующие данные, но также типы столбцов и статистику выполнения запроса:

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

Формат [JSONCompact](/interfaces/formats/JSONCompact) выводит те же метаданные, но использует компактное представление для самих данных:

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

Рассмотрите варианты [`JSONStrings`](/interfaces/formats/JSONStrings) или [`JSONCompactStrings`](/interfaces/formats/JSONCompactStrings) для кодирования всех значений в виде строк.


## Компактный способ экспорта данных и структуры JSON {#compact-way-to-export-json-data-and-structure}

Более эффективный способ экспортировать данные вместе с их структурой — использовать формат [`JSONCompactEachRowWithNamesAndTypes`](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes):

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

В этом формате используется компактное представление JSON с двумя заголовочными строками, содержащими имена и типы столбцов. Этот формат можно использовать для загрузки данных в другой экземпляр ClickHouse (или другие приложения).


## Экспорт JSON в файл {#exporting-json-to-a-file}

Чтобы сохранить экспортируемые данные JSON в файл, можно использовать конструкцию [INTO OUTFILE](/sql-reference/statements/select/into-outfile.md):

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json' FORMAT JSONEachRow
```

```response
36838935 rows in set. Elapsed: 2.220 sec. Processed 36.84 million rows, 1.27 GB (16.60 million rows/s., 572.47 MB/s.)
```

ClickHouse потребовалось всего 2 секунды для экспорта почти 37 миллионов записей в JSON-файл. Также можно экспортировать данные с использованием конструкции `COMPRESSION` для включения сжатия на лету:

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json.gz' FORMAT JSONEachRow
```

```response
36838935 rows in set. Elapsed: 22.680 sec. Processed 36.84 million rows, 1.27 GB (1.62 million rows/s., 56.02 MB/s.)
```

Это занимает больше времени, но создаёт значительно меньший сжатый файл:

```bash
2.2G    out.json
576M    out.json.gz
```

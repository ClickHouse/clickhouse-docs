---
title: '导出 JSON'
slug: /integrations/data-formats/json/exporting
description: '如何从 ClickHouse 导出 JSON 数据'
keywords: ['json', 'clickhouse', 'formats', 'exporting']
doc_type: 'guide'
---



# 导出 JSON

几乎所有用于导入的 JSON 格式也都可以用于导出。其中最常用的是 [`JSONEachRow`](/interfaces/formats/JSONEachRow)：

```sql
SELECT * FROM sometable FORMAT JSONEachRow
```

```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
```

或者，我们可以使用 [`JSONCompactEachRow`](/interfaces/formats/JSONCompactEachRow) 格式，通过不写入列名来节省磁盘空间：

```sql
SELECT * FROM sometable FORMAT JSONCompactEachRow
```

```response
["Bob_Dolman", "2016-11-01", 245]
["1-krona", "2017-01-01", 4]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]
```


## 将数据类型覆盖为字符串 {#overriding-data-types-as-strings}

ClickHouse 遵循数据类型规范,并按照标准导出 JSON。但在需要将所有值编码为字符串的情况下,可以使用 [JSONStringsEachRow](/interfaces/formats/JSONStringsEachRow) 格式:

```sql
SELECT * FROM sometable FORMAT JSONStringsEachRow
```

```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":"245"}
{"path":"1-krona","month":"2017-01-01","hits":"4"}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":"3"}
```

现在,`hits` 数值列被编码为字符串。所有 JSON\* 格式都支持以字符串形式导出,可以使用 `JSONStrings\*` 和 `JSONCompactStrings\*` 格式:

```sql
SELECT * FROM sometable FORMAT JSONCompactStringsEachRow
```

```response
["Bob_Dolman", "2016-11-01", "245"]
["1-krona", "2017-01-01", "4"]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", "3"]
```


## 导出元数据和数据 {#exporting-metadata-together-with-data}

通用的 [JSON](/interfaces/formats/JSON) 格式在应用程序中广泛使用,它不仅导出结果数据,还会导出列类型和查询统计信息:

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

[JSONCompact](/interfaces/formats/JSONCompact) 格式会输出相同的元数据,但数据本身采用紧凑形式:

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

可以考虑使用 [`JSONStrings`](/interfaces/formats/JSONStrings) 或 [`JSONCompactStrings`](/interfaces/formats/JSONCompactStrings) 变体将所有值编码为字符串。


## 导出 JSON 数据和结构的紧凑方式 {#compact-way-to-export-json-data-and-structure}

要同时导出数据及其结构,更高效的方式是使用 [`JSONCompactEachRowWithNamesAndTypes`](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes) 格式:

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

该格式使用紧凑的 JSON 格式,并在开头添加两行标题,分别包含列名和数据类型。此格式可用于将数据导入到另一个 ClickHouse 实例(或其他应用程序)中。


## 将 JSON 导出到文件 {#exporting-json-to-a-file}

要将导出的 JSON 数据保存到文件,可以使用 [INTO OUTFILE](/sql-reference/statements/select/into-outfile.md) 子句:

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json' FORMAT JSONEachRow
```

```response
36838935 rows in set. Elapsed: 2.220 sec. Processed 36.84 million rows, 1.27 GB (16.60 million rows/s., 572.47 MB/s.)
```

ClickHouse 仅用 2 秒就将近 3700 万条记录导出到 JSON 文件。我们还可以使用 `COMPRESSION` 子句在导出时启用即时压缩:

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json.gz' FORMAT JSONEachRow
```

```response
36838935 rows in set. Elapsed: 22.680 sec. Processed 36.84 million rows, 1.27 GB (1.62 million rows/s., 56.02 MB/s.)
```

虽然耗时更长,但生成的压缩文件要小得多:

```bash
2.2G    out.json
576M    out.json.gz
```

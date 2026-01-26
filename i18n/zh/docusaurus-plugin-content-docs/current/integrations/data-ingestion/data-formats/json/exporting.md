---
title: '导出 JSON'
slug: /integrations/data-formats/json/exporting
description: '如何从 ClickHouse 导出 JSON 格式的数据'
keywords: ['json', 'clickhouse', 'formats', 'exporting']
doc_type: 'guide'
---

# 导出 JSON \{#exporting-json\}

几乎所有用于导入的 JSON 格式也都可以用于导出。最常用的是 [`JSONEachRow`](/interfaces/formats/JSONEachRow)：

```sql
SELECT * FROM sometable FORMAT JSONEachRow
```

```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
```

或者我们可以使用 [`JSONCompactEachRow`](/interfaces/formats/JSONCompactEachRow) 通过省略列名来节省磁盘空间：

```sql
SELECT * FROM sometable FORMAT JSONCompactEachRow
```

```response
["Bob_Dolman", "2016-11-01", 245]
["1-krona", "2017-01-01", 4]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]
```

## 将数据类型强制为字符串 \{#overriding-data-types-as-strings\}

ClickHouse 会遵循列的数据类型，并按规范导出 JSON。但在某些情况下，如果需要将所有值都编码为字符串，可以使用 [JSONStringsEachRow](/interfaces/formats/JSONStringsEachRow) 格式：

```sql
SELECT * FROM sometable FORMAT JSONStringsEachRow
```

```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":"245"}
{"path":"1-krona","month":"2017-01-01","hits":"4"}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":"3"}
```

现在，`hits` 数值列已被编码为字符串。以字符串形式导出适用于所有 JSON* 格式，可以查看 `JSONStrings\*` 和 `JSONCompactStrings\*` 格式：

```sql
SELECT * FROM sometable FORMAT JSONCompactStringsEachRow
```

```response
["Bob_Dolman", "2016-11-01", "245"]
["1-krona", "2017-01-01", "4"]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", "3"]
```

## 将元数据与数据一起导出 \{#exporting-metadata-together-with-data\}

通用的 [JSON](/interfaces/formats/JSON) 格式在应用中非常流行，它不仅会导出结果数据，还会导出列类型和查询统计信息：

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

[JSONCompact](/interfaces/formats/JSONCompact) 格式会输出相同的元数据，但对数据本身使用更加紧凑的形式：

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

可以考虑使用 [`JSONStrings`](/interfaces/formats/JSONStrings) 或 [`JSONCompactStrings`](/interfaces/formats/JSONCompactStrings) 这两种变体，将所有值编码为字符串。

## 导出 JSON 数据及其结构的紧凑方式 \{#compact-way-to-export-json-data-and-structure\}

获取数据及其结构的一种更高效方式是使用 [`JSONCompactEachRowWithNamesAndTypes`](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes) 格式：

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

这将使用一种紧凑的 JSON 格式，并在开头附加两行包含列名和类型的表头。之后即可使用这种格式将数据摄取到另一个 ClickHouse 实例（或其他应用）中。

## 将 JSON 导出为文件 \{#exporting-json-to-a-file\}

要将导出的 JSON 数据保存到文件中，我们可以使用 [INTO OUTFILE](/sql-reference/statements/select/into-outfile.md) 子句：

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json' FORMAT JSONEachRow
```

```response
36838935 rows in set. Elapsed: 2.220 sec. Processed 36.84 million rows, 1.27 GB (16.60 million rows/s., 572.47 MB/s.)
```

ClickHouse 仅用 2 秒就将将近 3700 万条记录导出为一个 JSON 文件。我们也可以在导出时使用 `COMPRESSION` 子句来启用实时压缩：

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json.gz' FORMAT JSONEachRow
```

```response
36838935 rows in set. Elapsed: 22.680 sec. Processed 36.84 million rows, 1.27 GB (1.62 million rows/s., 56.02 MB/s.)
```

这虽然耗时更长，但会生成一个小得多的压缩文件：

```bash
2.2G    out.json
576M    out.json.gz
```

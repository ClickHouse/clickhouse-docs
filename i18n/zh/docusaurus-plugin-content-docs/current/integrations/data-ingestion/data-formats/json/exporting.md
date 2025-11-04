---
'title': '导出 JSON'
'slug': '/integrations/data-formats/json/exporting'
'description': '如何从 ClickHouse 导出 JSON 数据'
'keywords':
- 'json'
- 'clickhouse'
- 'formats'
- 'exporting'
'doc_type': 'guide'
---


# 导出 JSON

几乎任何用于导入的 JSON 格式都可以用于导出。最常用的是 [`JSONEachRow`](/interfaces/formats.md/#jsoneachrow):

```sql
SELECT * FROM sometable FORMAT JSONEachRow
```
```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
```

或者我们可以使用 [`JSONCompactEachRow`](/interfaces/formats#jsoncompacteachrow) 来通过跳过列名来节省磁盘空间：

```sql
SELECT * FROM sometable FORMAT JSONCompactEachRow
```
```response
["Bob_Dolman", "2016-11-01", 245]
["1-krona", "2017-01-01", 4]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]
```

## 以字符串重写数据类型 {#overriding-data-types-as-strings}

ClickHouse 尊重数据类型，并将 JSON 导出按标准操作。但在某些情况下，我们需要将所有值编码为字符串，可以使用 [JSONStringsEachRow](/interfaces/formats.md/#jsonstringseachrow) 格式：

```sql
SELECT * FROM sometable FORMAT JSONStringsEachRow
```
```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":"245"}
{"path":"1-krona","month":"2017-01-01","hits":"4"}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":"3"}
```

现在，`hits` 数字列被编码为字符串。将值导出为字符串是所有 JSON* 格式都支持的，只需探索 `JSONStrings\*` 和 `JSONCompactStrings\*` 格式：

```sql
SELECT * FROM sometable FORMAT JSONCompactStringsEachRow
```
```response
["Bob_Dolman", "2016-11-01", "245"]
["1-krona", "2017-01-01", "4"]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", "3"]
```

## 导出元数据和数据一起 {#exporting-metadata-together-with-data}

通用 [JSON](/interfaces/formats.md/#json) 格式，在应用程序中很流行，不仅导出结果数据，还包括列类型和查询统计信息：

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

[JSONCompact](/interfaces/formats.md/#jsoncompact) 格式将打印相同的元数据，但对数据本身使用压缩过的形式：

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

考虑使用 [`JSONStrings`](/interfaces/formats.md/#jsonstrings) 或 [`JSONCompactStrings`](/interfaces/formats.md/#jsoncompactstrings) 变体将所有值编码为字符串。

## 稀疏导出 JSON 数据和结构的方式 {#compact-way-to-export-json-data-and-structure}

有一种更有效的方法可以获取数据及其结构，即使用 [`JSONCompactEachRowWithNamesAndTypes`](/interfaces/formats.md/#jsoncompacteachrowwithnamesandtypes) 格式：

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

这将使用一个压缩的 JSON 格式，在前面加上两行带有列名和类型的标题行。此格式随后可以用于将数据导入到另一个 ClickHouse 实例（或其他应用程序）中。

## 导出 JSON 到文件 {#exporting-json-to-a-file}

要将导出的 JSON 数据保存到文件，我们可以使用 [INTO OUTFILE](/sql-reference/statements/select/into-outfile.md) 子句：

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json' FORMAT JSONEachRow
```
```response
36838935 rows in set. Elapsed: 2.220 sec. Processed 36.84 million rows, 1.27 GB (16.60 million rows/s., 572.47 MB/s.)
```

ClickHouse 在 2 秒内导出了近 3700 万条记录到 JSON 文件。我们还可以使用 `COMPRESSION` 子句来启用实时压缩：

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json.gz' FORMAT JSONEachRow
```
```response
36838935 rows in set. Elapsed: 22.680 sec. Processed 36.84 million rows, 1.27 GB (1.62 million rows/s., 56.02 MB/s.)
```

虽然这需要更多时间来完成，但生成的压缩文件小得多：

```bash
2.2G    out.json
576M    out.json.gz
```

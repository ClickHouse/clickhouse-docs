---
'title': '导出 JSON'
'slug': '/integrations/data-formats/json/exporting'
'description': '如何从 ClickHouse 导出 JSON 数据'
'keywords':
- 'json'
- 'clickhouse'
- 'formats'
- 'exporting'
---


# 导出 JSON

几乎所有用于导入的 JSON 格式也可以用于导出。最受欢迎的是 [`JSONEachRow`](/interfaces/formats.md/#jsoneachrow):

```sql
SELECT * FROM sometable FORMAT JSONEachRow
```
```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
```

或者我们可以使用 [`JSONCompactEachRow`](/interfaces/formats#jsoncompacteachrow) 通过跳过列名来节省磁盘空间：

```sql
SELECT * FROM sometable FORMAT JSONCompactEachRow
```
```response
["Bob_Dolman", "2016-11-01", 245]
["1-krona", "2017-01-01", 4]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]
```

## 将数据类型重写为字符串 {#overriding-data-types-as-strings}

ClickHouse 遵循数据类型，并将 JSON 根据标准导出。但是在需要所有值编码为字符串的情况下，我们可以使用 [JSONStringsEachRow](/interfaces/formats.md/#jsonstringseachrow) 格式：

```sql
SELECT * FROM sometable FORMAT JSONStringsEachRow
```
```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":"245"}
{"path":"1-krona","month":"2017-01-01","hits":"4"}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":"3"}
```

现在，`hits` 数值列被编码为字符串。将所有值导出为字符串的功能支持所有 JSON* 格式，只需探索 `JSONStrings\*` 和 `JSONCompactStrings\*` 格式：

```sql
SELECT * FROM sometable FORMAT JSONCompactStringsEachRow
```
```response
["Bob_Dolman", "2016-11-01", "245"]
["1-krona", "2017-01-01", "4"]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", "3"]
```

## 将元数据与数据一起导出 {#exporting-metadata-together-with-data}

通用的 [JSON](/interfaces/formats.md/#json) 格式，在应用中很流行，将导出不止是结果数据，还包括列类型和查询统计：

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

[JSONCompact](/interfaces/formats.md/#jsoncompact) 格式将打印相同的元数据，但对数据本身使用压缩形式：

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

考虑 [`JSONStrings`](/interfaces/formats.md/#jsonstrings) 或 [`JSONCompactStrings`](/interfaces/formats.md/#jsoncompactstrings) 变体以将所有值编码为字符串。

## 导出 JSON 数据和结构的紧凑方式 {#compact-way-to-export-json-data-and-structure}

更有效的获取数据及其结构的方法是使用 [`JSONCompactEachRowWithNamesAndTypes`](/interfaces/formats.md/#jsoncompacteachrowwithnamesandtypes) 格式：

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

这将使用紧凑的 JSON 格式，并在前面加上两行标题，包含列名和类型。此格式随后可用于将数据摄入另一个 ClickHouse 实例（或其他应用）。

## 导出 JSON 到文件 {#exporting-json-to-a-file}

要将导出的 JSON 数据保存到文件中，我们可以使用 [INTO OUTFILE](/sql-reference/statements/select/into-outfile.md) 子句：

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json' FORMAT JSONEachRow
```
```response
36838935 rows in set. Elapsed: 2.220 sec. Processed 36.84 million rows, 1.27 GB (16.60 million rows/s., 572.47 MB/s.)
```

ClickHouse 仅用了 2 秒钟即可将近 3700 万条记录导出到 JSON 文件中。我们还可以使用 `COMPRESSION` 子句来动态启用压缩：

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json.gz' FORMAT JSONEachRow
```
```response
36838935 rows in set. Elapsed: 22.680 sec. Processed 36.84 million rows, 1.27 GB (1.62 million rows/s., 56.02 MB/s.)
```

虽然实现所需时间更多，但会生成更小的压缩文件：

```bash
2.2G    out.json
576M    out.json.gz
```

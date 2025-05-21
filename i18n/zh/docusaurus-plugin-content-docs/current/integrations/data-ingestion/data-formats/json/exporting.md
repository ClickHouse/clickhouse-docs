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

几乎所有用于导入的 JSON 格式都可以用于导出。最受欢迎的是 [`JSONEachRow`](/interfaces/formats.md/#jsoneachrow)：

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

## 将数据类型覆盖为字符串 {#overriding-data-types-as-strings}

ClickHouse 尊重数据类型，并会根据标准相应导出 JSON。但在我们需要将所有值编码为字符串的情况下，我们可以使用 [JSONStringsEachRow](/interfaces/formats.md/#jsonstringseachrow) 格式：

```sql
SELECT * FROM sometable FORMAT JSONStringsEachRow
```
```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":"245"}
{"path":"1-krona","month":"2017-01-01","hits":"4"}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":"3"}
```

现在，`hits` 数字列被编码为字符串。字符串导出支持所有 JSON* 格式，只需探索 `JSONStrings\*` 和 `JSONCompactStrings\*` 格式：

```sql
SELECT * FROM sometable FORMAT JSONCompactStringsEachRow
```
```response
["Bob_Dolman", "2016-11-01", "245"]
["1-krona", "2017-01-01", "4"]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", "3"]
```

## 将元数据与数据一起导出 {#exporting-metadata-together-with-data}

通用的 [JSON](/interfaces/formats.md/#json) 格式，在应用中非常流行，将导出不仅是结果数据，还有列类型和查询统计：

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

[JSONCompact](/interfaces/formats.md/#jsoncompact) 格式将打印相同的元数据，但对数据本身使用紧凑的形式：

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

## 紧凑的方式导出 JSON 数据和结构 {#compact-way-to-export-json-data-and-structure}

更有效的方式同时拥有数据及其结构是使用 [`JSONCompactEachRowWithNamesAndTypes`](/interfaces/formats.md/#jsoncompacteachrowwithnamesandtypes) 格式：

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

这将使用一个紧凑的 JSON 格式，并在前面添加两行包含列名和类型的头部。该格式随后可以用于将数据导入到另一个 ClickHouse 实例（或其他应用）中。

## 导出 JSON 到文件 {#exporting-json-to-a-file}

要将导出的 JSON 数据保存到文件中，我们可以使用 [INTO OUTFILE](/sql-reference/statements/select/into-outfile.md) 子句：

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json' FORMAT JSONEachRow
```
```response
36838935 rows in set. Elapsed: 2.220 sec. Processed 36.84 million rows, 1.27 GB (16.60 million rows/s., 572.47 MB/s.)
```

ClickHouse 仅用 2 秒就导出了近 3700 万条记录到一个 JSON 文件中。我们还可以使用 `COMPRESSION` 子句在导出时启用压缩：

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json.gz' FORMAT JSONEachRow
```
```response
36838935 rows in set. Elapsed: 22.680 sec. Processed 36.84 million rows, 1.27 GB (1.62 million rows/s., 56.02 MB/s.)
```

这需要更多的时间来完成，但会生成一个更小的压缩文件：

```bash
2.2G    out.json
576M    out.json.gz
```

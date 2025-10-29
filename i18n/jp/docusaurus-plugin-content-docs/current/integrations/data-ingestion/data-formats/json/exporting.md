---
'title': 'JSONのエクスポート'
'slug': '/integrations/data-formats/json/exporting'
'description': 'ClickHouseからJSONデータをエクスポートする方法'
'keywords':
- 'json'
- 'clickhouse'
- 'formats'
- 'exporting'
'doc_type': 'guide'
---


# JSONのエクスポート

インポートに使用されるほぼすべてのJSON形式は、エクスポートにも使用できます。最も一般的なのは[`JSONEachRow`](/interfaces/formats.md/#jsoneachrow)です：

```sql
SELECT * FROM sometable FORMAT JSONEachRow
```
```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
```

また、カラム名をスキップしてディスクスペースを節約するために[`JSONCompactEachRow`](/interfaces/formats#jsoncompacteachrow)を使用することもできます：

```sql
SELECT * FROM sometable FORMAT JSONCompactEachRow
```
```response
["Bob_Dolman", "2016-11-01", 245]
["1-krona", "2017-01-01", 4]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]
```

## 文字列としてのデータ型の上書き {#overriding-data-types-as-strings}

ClickHouseはデータ型を尊重し、標準に応じてJSONをエクスポートします。しかし、すべての値を文字列としてエンコードする必要がある場合は、[JSONStringsEachRow](/interfaces/formats.md/#jsonstringseachrow)形式を使用できます：

```sql
SELECT * FROM sometable FORMAT JSONStringsEachRow
```
```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":"245"}
{"path":"1-krona","month":"2017-01-01","hits":"4"}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":"3"}
```

これで、`hits`の数値カラムが文字列としてエンコードされます。文字列としてのエクスポートはすべてのJSON*形式でサポートされており、`JSONStrings\*`および`JSONCompactStrings\*`形式を探索できます：

```sql
SELECT * FROM sometable FORMAT JSONCompactStringsEachRow
```
```response
["Bob_Dolman", "2016-11-01", "245"]
["1-krona", "2017-01-01", "4"]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", "3"]
```

## データと一緒にメタデータをエクスポートする {#exporting-metadata-together-with-data}

アプリで人気のある一般的な[JSON](/interfaces/formats.md/#json)形式は、結果データだけでなく、カラムの型やクエリの統計もエクスポートします：

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

[JSONCompact](/interfaces/formats.md/#jsoncompact)形式は、同じメタデータを印刷しますが、データ自体には圧縮された形式を使用します：

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

すべての値を文字列としてエンコードするには、[`JSONStrings`](/interfaces/formats.md/#jsonstrings)または[`JSONCompactStrings`](/interfaces/formats.md/#jsoncompactstrings)のバリアントを考慮してください。

## JSONデータと構造をエクスポートするコンパクトな方法 {#compact-way-to-export-json-data-and-structure}

データとその構造をより効率的に持つ方法は、[`JSONCompactEachRowWithNamesAndTypes`](/interfaces/formats.md/#jsoncompacteachrowwithnamesandtypes)形式を使用することです：

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

この形式は、カラム名と型の2つのヘッダ行が前に付いたコンパクトなJSON形式を使用します。この形式は、他のClickHouseインスタンス（または他のアプリ）にデータを取り込むために使用できます。

## ファイルにJSONをエクスポートする {#exporting-json-to-a-file}

エクスポートしたJSONデータをファイルに保存するには、[INTO OUTFILE](/sql-reference/statements/select/into-outfile.md)句を使用します：

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json' FORMAT JSONEachRow
```
```response
36838935 rows in set. Elapsed: 2.220 sec. Processed 36.84 million rows, 1.27 GB (16.60 million rows/s., 572.47 MB/s.)
```

ClickHouseは、約3700万レコードをJSONファイルにエクスポートするのにわずか2秒かかりました。また、圧縮をオンザフライで有効にするために`COMPRESSION`句を使用してエクスポートすることもできます：

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json.gz' FORMAT JSONEachRow
```
```response
36838935 rows in set. Elapsed: 22.680 sec. Processed 36.84 million rows, 1.27 GB (1.62 million rows/s., 56.02 MB/s.)
```

達成するにはより多くの時間がかかりますが、はるかに小さな圧縮ファイルが生成されます：

```bash
2.2G    out.json
576M    out.json.gz
```

---
title: 'JSONのエクスポート'
slug: /integrations/data-formats/json/exporting
description: 'ClickHouseからJSONデータをエクスポートする方法'
keywords: ['json', 'clickhouse', 'formats', 'exporting']
---
```


# JSONのエクスポート

ほとんどのインポート用に使用されるJSONフォーマットは、エクスポートにも使用できます。最も一般的なのは[`JSONEachRow`](/interfaces/formats.md/#jsoneachrow)です：

```sql
SELECT * FROM sometable FORMAT JSONEachRow
```
```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
```

また、[`JSONCompactEachRow`](/interfaces/formats#jsoncompacteachrow)を使用して、カラム名を省略することでディスクスペースを節約することもできます：

```sql
SELECT * FROM sometable FORMAT JSONCompactEachRow
```
```response
["Bob_Dolman", "2016-11-01", 245]
["1-krona", "2017-01-01", 4]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]
```

## データ型を文字列としてオーバーライドする {#overriding-data-types-as-strings}

ClickHouseはデータ型を尊重し、基準に従ってJSONをエクスポートします。しかし、すべての値を文字列としてエンコードする必要がある場合は、[JSONStringsEachRow](/interfaces/formats.md/#jsonstringseachrow)フォーマットを使用できます：

```sql
SELECT * FROM sometable FORMAT JSONStringsEachRow
```
```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":"245"}
{"path":"1-krona","month":"2017-01-01","hits":"4"}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":"3"}
```

これで、`hits`の数値カラムが文字列としてエンコードされています。文字列としてのエクスポートは、すべてのJSON*フォーマットでサポートされており、`JSONStrings\*`および`JSONCompactStrings\*`フォーマットを探ってください：

```sql
SELECT * FROM sometable FORMAT JSONCompactStringsEachRow
```
```response
["Bob_Dolman", "2016-11-01", "245"]
["1-krona", "2017-01-01", "4"]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", "3"]
```

## メタデータをデータと一緒にエクスポートする {#exporting-metadata-together-with-data}

一般的な[JSON](/interfaces/formats.md/#json)フォーマットは、アプリで人気があり、結果データだけでなくカラムタイプやクエリ統計もエクスポートします：

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

[JSONCompact](/interfaces/formats.md/#jsoncompact)フォーマットは、同じメタデータを印刷しますが、データ自体にはコンパクトな形式を使用します：

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

すべての値を文字列としてエンコードするには、[`JSONStrings`](/interfaces/formats.md/#jsonstrings)または[`JSONCompactStrings`](/interfaces/formats.md/#jsoncompactstrings)のバリアントを検討してください。

## データと構造をコンパクトにエクスポートする方法 {#compact-way-to-export-json-data-and-structure}

データ及びその構造を持つより効率的な方法は、[`JSONCompactEachRowWithNamesAndTypes`](/interfaces/formats.md/#jsoncompacteachrowwithnamesandtypes)フォーマットを使用することです：

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

これにより、カラム名とタイプを含む2つのヘッダー行が前置されたコンパクトなJSON形式が使用されます。この形式は、別のClickHouseインスタンス（または他のアプリ）にデータを取り込むために使用できます。

## JSONをファイルにエクスポートする {#exporting-json-to-a-file}

エクスポートしたJSONデータをファイルに保存するには、[INTO OUTFILE](/sql-reference/statements/select/into-outfile.md)句を使用できます：

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json' FORMAT JSONEachRow
```
```response
36838935 rows in set. Elapsed: 2.220 sec. Processed 36.84 million rows, 1.27 GB (16.60 million rows/s., 572.47 MB/s.)
```

ClickHouseは、ほぼ3700万件のレコードをJSONファイルにエクスポートするのにわずか2秒しかかかりませんでした。また、`COMPRESSION`句を使用してオンザフライで圧縮を有効にしてエクスポートすることもできます：

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json.gz' FORMAT JSONEachRow
```
```response
36838935 rows in set. Elapsed: 22.680 sec. Processed 36.84 million rows, 1.27 GB (1.62 million rows/s., 56.02 MB/s.)
```

実行するのにもっと時間がかかりますが、より小さい圧縮ファイルが生成されます：

```bash
2.2G    out.json
576M    out.json.gz

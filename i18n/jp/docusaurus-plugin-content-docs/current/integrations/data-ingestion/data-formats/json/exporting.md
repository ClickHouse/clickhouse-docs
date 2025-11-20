---
title: 'JSON のエクスポート'
slug: /integrations/data-formats/json/exporting
description: 'ClickHouse から JSON データをエクスポートする方法'
keywords: ['json', 'clickhouse', 'formats', 'exporting']
doc_type: 'guide'
---



# JSON のエクスポート

インポートに使用できる JSON 形式のほとんどは、エクスポートにも使用できます。最も一般的なのは [`JSONEachRow`](/interfaces/formats/JSONEachRow) です。

```sql
SELECT * FROM sometable FORMAT JSONEachRow
```

```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
```

あるいは、[`JSONCompactEachRow`](/interfaces/formats/JSONCompactEachRow) を使用して、列名を省略することでディスク使用量を削減できます。

```sql
SELECT * FROM sometable FORMAT JSONCompactEachRow
```

```response
["Bob_Dolman", "2016-11-01", 245]
["1-krona", "2017-01-01", 4]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]
```


## データ型を文字列としてオーバーライドする {#overriding-data-types-as-strings}

ClickHouseはデータ型を尊重し、標準に従ってJSONをエクスポートします。ただし、すべての値を文字列としてエンコードする必要がある場合は、[JSONStringsEachRow](/interfaces/formats/JSONStringsEachRow)フォーマットを使用できます：

```sql
SELECT * FROM sometable FORMAT JSONStringsEachRow
```

```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":"245"}
{"path":"1-krona","month":"2017-01-01","hits":"4"}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":"3"}
```

これで、数値カラムである`hits`が文字列としてエンコードされます。文字列としてのエクスポートはすべてのJSON\*フォーマットでサポートされています。`JSONStrings\*`および`JSONCompactStrings\*`フォーマットをご利用ください：

```sql
SELECT * FROM sometable FORMAT JSONCompactStringsEachRow
```

```response
["Bob_Dolman", "2016-11-01", "245"]
["1-krona", "2017-01-01", "4"]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", "3"]
```


## データと共にメタデータをエクスポートする {#exporting-metadata-together-with-data}

アプリケーションで広く使用されている一般的な[JSON](/interfaces/formats/JSON)フォーマットは、結果データだけでなく、カラムの型とクエリの統計情報もエクスポートします:

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

[JSONCompact](/interfaces/formats/JSONCompact)フォーマットは同じメタデータを出力しますが、データ自体はコンパクトな形式で表現されます:

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

すべての値を文字列としてエンコードする場合は、[`JSONStrings`](/interfaces/formats/JSONStrings)または[`JSONCompactStrings`](/interfaces/formats/JSONCompactStrings)の使用を検討してください。


## JSONデータと構造をエクスポートするコンパクトな方法 {#compact-way-to-export-json-data-and-structure}

データとその構造を効率的に出力するには、[`JSONCompactEachRowWithNamesAndTypes`](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes)フォーマットを使用します:

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

このフォーマットでは、カラム名と型を含む2つのヘッダー行が先頭に付加されたコンパクトなJSON形式が使用されます。このフォーマットは、別のClickHouseインスタンス(または他のアプリケーション)へのデータ取り込みに利用できます。


## JSONをファイルにエクスポートする {#exporting-json-to-a-file}

エクスポートしたJSONデータをファイルに保存するには、[INTO OUTFILE](/sql-reference/statements/select/into-outfile.md)句を使用できます:

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json' FORMAT JSONEachRow
```

```response
36838935 rows in set. Elapsed: 2.220 sec. Processed 36.84 million rows, 1.27 GB (16.60 million rows/s., 572.47 MB/s.)
```

ClickHouseは約3700万件のレコードをJSONファイルにエクスポートするのにわずか2秒しかかかりませんでした。`COMPRESSION`句を使用することで、エクスポート時に圧縮を有効にすることもできます:

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json.gz' FORMAT JSONEachRow
```

```response
36838935 rows in set. Elapsed: 22.680 sec. Processed 36.84 million rows, 1.27 GB (1.62 million rows/s., 56.02 MB/s.)
```

処理時間は長くなりますが、はるかに小さい圧縮ファイルが生成されます:

```bash
2.2G    out.json
576M    out.json.gz
```

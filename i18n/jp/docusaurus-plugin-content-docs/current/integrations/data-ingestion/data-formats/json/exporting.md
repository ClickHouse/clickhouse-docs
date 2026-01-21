---
title: 'JSONのエクスポート'
slug: /integrations/data-formats/json/exporting
description: 'ClickHouseからJSONデータをエクスポートする方法'
keywords: ['json', 'clickhouse', 'formats', 'exporting']
doc_type: 'guide'
---

# JSON のエクスポート \{#exporting-json\}

インポートに使用可能なほとんどの JSON 形式は、エクスポートにも使用できます。最も一般的なのは [`JSONEachRow`](/interfaces/formats/JSONEachRow) です。

```sql
SELECT * FROM sometable FORMAT JSONEachRow
```

```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
```

または、列名を出力せずにディスク使用量を節約するために、[`JSONCompactEachRow`](/interfaces/formats/JSONCompactEachRow) を使用できます：

```sql
SELECT * FROM sometable FORMAT JSONCompactEachRow
```

```response
["Bob_Dolman", "2016-11-01", 245]
["1-krona", "2017-01-01", 4]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]
```

## データ型を文字列として出力する \{#overriding-data-types-as-strings\}

ClickHouse はデータ型を尊重し、標準に従って JSON をエクスポートします。ただし、すべての値を文字列としてエンコードする必要がある場合は、[JSONStringsEachRow](/interfaces/formats/JSONStringsEachRow) 形式を使用できます。

```sql
SELECT * FROM sometable FORMAT JSONStringsEachRow
```

```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":"245"}
{"path":"1-krona","month":"2017-01-01","hits":"4"}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":"3"}
```

これにより、`hits` 数値型カラムは文字列としてエンコードされます。文字列としてのエクスポートはすべての JSON* フォーマットでサポートされているため、`JSONStrings\*` および `JSONCompactStrings\*` フォーマットを利用してください。

```sql
SELECT * FROM sometable FORMAT JSONCompactStringsEachRow
```

```response
["Bob_Dolman", "2016-11-01", "245"]
["1-krona", "2017-01-01", "4"]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", "3"]
```

## データと一緒にメタデータをエクスポートする \{#exporting-metadata-together-with-data\}

多くのアプリケーションで一般的に利用される [JSON](/interfaces/formats/JSON) 形式では、結果データだけでなく、列の型やクエリの統計情報もエクスポートされます。

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

[JSONCompact](/interfaces/formats/JSONCompact) フォーマットは同じメタデータを出力しますが、データ本体にはよりコンパクトな形式を使用します：

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

すべての値を文字列としてエンコードするには、[`JSONStrings`](/interfaces/formats/JSONStrings) または [`JSONCompactStrings`](/interfaces/formats/JSONCompactStrings) バリアントの使用を検討してください。

## JSON データと構造をエクスポートするコンパクトな方法 \{#compact-way-to-export-json-data-and-structure\}

データ本体とその構造をより効率的に取得するには、[`JSONCompactEachRowWithNamesAndTypes`](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes) フォーマットを使用します。

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

これは、先頭に列名と型を含む 2 行のヘッダー行を付加したコンパクトな JSON 形式を使用します。この形式は、その後、別の ClickHouse インスタンス（または他のアプリケーション）にデータを取り込むために使用できます。

## JSON をファイルにエクスポートする \{#exporting-json-to-a-file\}

エクスポートした JSON データをファイルに保存するには、[INTO OUTFILE](/sql-reference/statements/select/into-outfile.md) 句を使用できます。

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json' FORMAT JSONEachRow
```

```response
36838935 rows in set. Elapsed: 2.220 sec. Processed 36.84 million rows, 1.27 GB (16.60 million rows/s., 572.47 MB/s.)
```

ClickHouse は約 3,700 万件のレコードを JSON ファイルにエクスポートするのに、わずか 2 秒しかかかりませんでした。`COMPRESSION` 句を使用して、その場で圧縮しながらエクスポートすることもできます。

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json.gz' FORMAT JSONEachRow
```

```response
36838935 rows in set. Elapsed: 22.680 sec. Processed 36.84 million rows, 1.27 GB (1.62 million rows/s., 56.02 MB/s.)
```

完了までに時間はかかりますが、圧縮後のファイルサイズは大幅に小さくなります。

```bash
2.2G    out.json
576M    out.json.gz
```

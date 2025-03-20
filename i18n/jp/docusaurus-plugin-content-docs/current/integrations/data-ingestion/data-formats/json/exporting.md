---
title: JSONのエクスポート
slug: /integrations/data-formats/json/exporting
description: ClickHouseからJSONデータをエクスポートする方法
keywords: [json, clickhouse, formats, exporting]
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

または、カラム名をスキップすることでディスクスペースを節約できる[`JSONCompactEachRow`](/interfaces/formats#jsoncompacteachrow)を使用できます：

```sql
SELECT * FROM sometable FORMAT JSONCompactEachRow
```
```response
["Bob_Dolman", "2016-11-01", 245]
["1-krona", "2017-01-01", 4]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]
```

## データ型を文字列としてオーバーライドする {#overriding-data-types-as-strings}

ClickHouseはデータ型を尊重し、それに応じてJSONを標準に従ってエクスポートします。しかし、すべての値を文字列としてエンコードする必要がある場合は、[JSONStringsEachRow](/interfaces/formats.md/#jsonstringseachrow)形式を使用できます：

```sql
SELECT * FROM sometable FORMAT JSONStringsEachRow
```
```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":"245"}
{"path":"1-krona","month":"2017-01-01","hits":"4"}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":"3"}
```

これで、`hits`の数値カラムは文字列としてエンコードされます。文字列としてのエクスポートは、すべてのJSON*形式でサポートされており、`JSONStrings\*`および`JSONCompactStrings\*`形式を探求できます：

```sql
SELECT * FROM sometable FORMAT JSONCompactStringsEachRow
```
```response
["Bob_Dolman", "2016-11-01", "245"]
["1-krona", "2017-01-01", "4"]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", "3"]
```

## データと一緒にメタデータをエクスポートする {#exporting-metadata-together-with-data}

一般的な[JSON](/interfaces/formats.md/#json)形式は、アプリで人気があり、結果データだけでなくカラムの型やクエリの統計もエクスポートします：

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
		…
	],

	"data":
	[
		{
			"path": "Bob_Dolman",
			"month": "2016-11-01",
			"hits": 245
		},
		…
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

[JSONCompact](/interfaces/formats.md/#jsoncompact)形式は、同じメタデータを表示しますが、データ自体はコンパクトな形式を使用します：

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
		…
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

## JSONデータと構造をコンパクトにエクスポートする方法 {#compact-way-to-export-json-data-and-structure}

データとその構造を効率的に得るには、[`JSONCompactEachRowWithNamesAndTypes`](/interfaces/formats.md/#jsoncompacteachrowwithnamesandtypes)形式を使用します：

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

これにより、カラム名と型の2つのヘッダー行を前置したコンパクトなJSON形式が使用されます。この形式は、別のClickHouseインスタンスや他のアプリにデータを取り込むために使用できます。

## JSONをファイルにエクスポートする {#exporting-json-to-a-file}

エクスポートされたJSONデータをファイルに保存するには、[INTO OUTFILE](/sql-reference/statements/select/into-outfile.md)句を使用できます：

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json' FORMAT JSONEachRow
```
```response
36838935 rows in set. Elapsed: 2.220 sec. Processed 36.84 million rows, 1.27 GB (16.60 million rows/s., 572.47 MB/s.)
```

ClickHouseは、ほぼ3700万件のレコードをJSONファイルにエクスポートするのにわずか2秒しかかかりません。また、`COMPRESSION`句を使用して、オンザフライで圧縮することもできます：

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json.gz' FORMAT JSONEachRow
```
```response
36838935 rows in set. Elapsed: 22.680 sec. Processed 36.84 million rows, 1.27 GB (1.62 million rows/s., 56.02 MB/s.)
```

こちらは実行に時間がかかりますが、はるかに小さい圧縮ファイルを生成します：

```bash
2.2G	out.json
576M	out.json.gz
```

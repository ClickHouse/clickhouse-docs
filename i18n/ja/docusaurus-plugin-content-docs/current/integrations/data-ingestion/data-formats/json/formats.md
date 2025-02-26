---
title: 他のJSONフォーマットの取り扱い
slug: /integrations/data-formats/json/other-formats
description: 他のJSONフォーマットの取り扱い
keywords: [json, formats, json formats]
---

# 他のフォーマットの取り扱い

以前のJSONデータをロードする例では、[`JSONEachRow`](/interfaces/formats#jsoneachrow)（ndjson）の使用を前提としています。以下に、他の一般的なフォーマットでのJSONのロード例を示します。

## JSONオブジェクトの配列 {#array-of-json-objects}

JSONデータの最も一般的な形式の1つは、JSON配列内にJSONオブジェクトのリストを持つことです。例えば、[この例](../assets/list.json)のようになります：

```bash
> cat list.json
[
  {
    "path": "Akiba_Hebrew_Academy",
    "month": "2017-08-01",
    "hits": 241
  },
  {
    "path": "Aegithina_tiphia",
    "month": "2018-02-01",
    "hits": 34
  },
  ...
]
```

この種類のデータ用にテーブルを作成しましょう：

```sql
CREATE TABLE sometable
(
    `path` String,
    `month` Date,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY tuple(month, path)
```

JSONオブジェクトのリストをインポートするには、[`JSONEachRow`](/interfaces/formats.md/#jsoneachrow) フォーマットを使用します（[list.json](../assets/list.json)ファイルからデータを挿入）：

```sql
INSERT INTO sometable
FROM INFILE 'list.json'
FORMAT JSONEachRow
```

ローカルファイルからデータを読み込むために、[FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file)句を使用しましたが、インポートが成功したことを確認できます：

```sql
SELECT *
FROM sometable
```
```response
┌─path──────────────────────┬──────month─┬─hits─┐
│ 1971-72_Utah_Stars_season │ 2016-10-01 │    1 │
│ Akiba_Hebrew_Academy      │ 2017-08-01 │  241 │
│ Aegithina_tiphia          │ 2018-02-01 │   34 │
└───────────────────────────┴────────────┴──────┘
```

## NDJSON（行区切りJSON）の取り扱い {#handling-ndjson-line-delimited-json}

多くのアプリは、ログデータをJSON形式で記録でき、各ログ行が個別のJSONオブジェクトとなっている場合があります。例えば、[このファイル](../assets/object-per-line.json)のようになります：

```bash
cat object-per-line.json
```
```response
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
```

同じ`JSONEachRow`フォーマットは、このようなファイルでも動作します：

```sql
INSERT INTO sometable FROM INFILE 'object-per-line.json' FORMAT JSONEachRow;
SELECT * FROM sometable;
```
```response
┌─path──────────────────────┬──────month─┬─hits─┐
│ Bob_Dolman                │ 2016-11-01 │  245 │
│ 1-krona                   │ 2017-01-01 │    4 │
│ Ahmadabad-e_Kalij-e_Sofla │ 2017-01-01 │    3 │
└───────────────────────────┴────────────┴──────┘
```

## JSONオブジェクトのキー {#json-object-keys}

場合によっては、JSONオブジェクトのリストが配列要素ではなくオブジェクトプロパティとしてエンコードされていることがあります（例えば[objects.json](../assets/objects.json)を参照してください）：

```bash
cat objects.json
```

```response
{
  "a": {
    "path":"April_25,_2017",
    "month":"2018-01-01",
    "hits":2
  },
  "b": {
    "path":"Akahori_Station",
    "month":"2016-06-01",
    "hits":11
  },
  ...
}
```

ClickHouseは、この種のデータを[`JSONObjectEachRow`](/interfaces/formats.md/#jsonobjecteachrow)フォーマットを使用して読み込むことができます：

```sql
INSERT INTO sometable FROM INFILE 'objects.json' FORMAT JSONObjectEachRow;
SELECT * FROM sometable;
```
```response
┌─path────────────┬──────month─┬─hits─┐
│ Abducens_palsy  │ 2016-05-01 │   28 │
│ Akahori_Station │ 2016-06-01 │   11 │
│ April_25,_2017  │ 2018-01-01 │    2 │
└─────────────────┴────────────┴──────┘
```

### 親オブジェクトキーの値の指定 {#specifying-parent-object-key-values}

親オブジェクトキーの値もテーブルに保存したいとします。この場合、[以下のオプション](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name)を使用して、キー値を保存するカラムの名前を定義できます：

```sql
SET format_json_object_each_row_column_for_object_name = 'id'
```

これで、[`file()`](/sql-reference/functions/files.md/#file)関数を使用して、元のJSONファイルからどのデータがロードされるかを確認できます：

```sql
SELECT * FROM file('objects.json', JSONObjectEachRow)
```
```response
┌─id─┬─path────────────┬──────month─┬─hits─┐
│ a  │ April_25,_2017  │ 2018-01-01 │    2 │
│ b  │ Akahori_Station │ 2016-06-01 │   11 │
│ c  │ Abducens_palsy  │ 2016-05-01 │   28 │
└────┴─────────────────┴────────────┴──────┘
```

`id`カラムがキー値で正しく埋められていることに注意してください。

## JSON配列 {#json-arrays}

時には、スペースを節約するために、JSONファイルがオブジェクトではなく配列でエンコードされることがあります。この場合、[JSON配列のリスト](../assets/arrays.json)に対処します：

```bash
cat arrays.json
```
```response
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```

この場合、ClickHouseはこのデータを読み込み、配列内の順序に基づいて各値を適切なカラムに割り当てます。これには、[`JSONCompactEachRow`](/interfaces/formats.md/#jsoncompacteachrow)フォーマットを使用します：

```sql
SELECT * FROM sometable
```
```response
┌─c1────────────────────────┬─────────c2─┬──c3─┐
│ Akiba_Hebrew_Academy      │ 2017-08-01 │ 241 │
│ Aegithina_tiphia          │ 2018-02-01 │  34 │
│ 1971-72_Utah_Stars_season │ 2016-10-01 │   1 │
└───────────────────────────┴────────────┴─────┘
```

### JSON配列から個々のカラムをインポートする {#importing-individual-columns-from-json-arrays}

場合によっては、データが行単位ではなくカラム単位でエンコードされることがあります。この場合、親JSONオブジェクトが値を持つカラムを含みます。次の[ファイル](../assets/columns.json)を見てみましょう：

```bash
cat columns.json
```
```response
{
  "path": ["2007_Copa_America", "Car_dealerships_in_the_USA", "Dihydromyricetin_reductase"],
  "month": ["2016-07-01", "2015-07-01", "2015-07-01"],
  "hits": [178, 11, 1]
}
```

ClickHouseは、[`JSONColumns`](/interfaces/formats.md/#jsoncolumns)フォーマットを使用して、そのようにフォーマットされたデータを解析します：

```sql
SELECT * FROM file('columns.json', JSONColumns)
```
```response
┌─path───────────────────────┬──────month─┬─hits─┐
│ 2007_Copa_America          │ 2016-07-01 │  178 │
│ Car_dealerships_in_the_USA │ 2015-07-01 │   11 │
│ Dihydromyricetin_reductase │ 2015-07-01 │    1 │
└────────────────────────────┴────────────┴──────┘
```

オブジェクトの代わりに[カラムの配列](../assets/columns-array.json)で作業する場合、[`JSONCompactColumns`](/interfaces/formats.md/#jsoncompactcolumns)フォーマットを使用して、よりコンパクトな形式もサポートされています：

```sql
SELECT * FROM file('columns-array.json', JSONCompactColumns)
```
```response
┌─c1──────────────┬─────────c2─┬─c3─┐
│ Heidenrod       │ 2017-01-01 │ 10 │
│ Arthur_Henrique │ 2016-11-01 │ 12 │
│ Alan_Ebnother   │ 2015-11-01 │ 66 │
└─────────────────┴────────────┴────┘
```

## JSONオブジェクトを解析せずに保存する {#saving-json-objects-instead-of-parsing}

JSONオブジェクトを解析する代わりに、単一の`String`（またはJSON）カラムに保存したい場合があります。これは、異なる構造のJSONオブジェクトのリストを扱う際に便利です。[このファイル](../assets/custom.json)を見てみましょう。ここには、親リストの中に複数の異なるJSONオブジェクトがあります：

```bash
cat custom.json
```
```response
[
  {"name": "Joe", "age": 99, "type": "person"},
  {"url": "/my.post.MD", "hits": 1263, "type": "post"},
  {"message": "Warning on disk usage", "type": "log"}
]
```

次のテーブルに元のJSONオブジェクトを保存したいとします：

```sql
CREATE TABLE events
(
    `data` String
)
ENGINE = MergeTree
ORDER BY ()
```

次に、[`JSONAsString`](/interfaces/formats.md/#jsonasstring)フォーマットを使用して、JSONオブジェクトを解析するのではなく、このテーブルにファイルからデータをロードできます：

```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```

そして、[JSON関数](/sql-reference/functions/json-functions.md)を使用して保存されたオブジェクトをクエリできます：

```sql
SELECT
    JSONExtractString(data, 'type') AS type,
    data
FROM events
```
```response
┌─type───┬─data─────────────────────────────────────────────────┐
│ person │ {"name": "Joe", "age": 99, "type": "person"}         │
│ post   │ {"url": "/my.post.MD", "hits": 1263, "type": "post"} │
│ log    │ {"message": "Warning on disk usage", "type": "log"}  │
└────────┴──────────────────────────────────────────────────────┘
```

`JSONAsString`は、通常`JSONEachRow`フォーマットで使用されるJSONオブジェクト毎の行形式のファイルでも問題なく機能します。

## ネストされたオブジェクトのためのスキーマ {#schema-for-nested-objects}

[ネストされたJSONオブジェクト](../assets/list-nested.json)を扱う場合、スキーマを追加で定義し、複雑な型（[`Array`](/sql-reference/data-types/array.md)、[`Object Data Type`](/sql-reference/data-types/object-data-type)または[`Tuple`](/sql-reference/data-types/tuple.md)）を使用してデータをロードできます：

```sql
SELECT *
FROM file('list-nested.json', JSONEachRow, 'page Tuple(path String, title String, owner_id UInt16), month Date, hits UInt32')
LIMIT 1
```
```response
┌─page───────────────────────────────────────────────┬──────month─┬─hits─┐
│ ('Akiba_Hebrew_Academy','Akiba Hebrew Academy',12) │ 2017-08-01 │  241 │
└────────────────────────────────────────────────────┴────────────┴──────┘
```

## ネストされたJSONオブジェクトへのアクセス {#accessing-nested-json-objects}

[ネストされたJSONキー](../assets/list-nested.json)を参照するためには、[以下の設定オプション](/operations/settings/settings-formats.md/#input_format_import_nested_json)を有効にする必要があります：

```sql
SET input_format_import_nested_json = 1
```

これにより、ドット表記を使用してネストされたJSONオブジェクトのキーを参照できるようになります（バックティック記号で囲むことを忘れないでください）：

```sql
SELECT *
FROM file('list-nested.json', JSONEachRow, '`page.owner_id` UInt32, `page.title` String, month Date, hits UInt32')
LIMIT 1
```
```results
┌─page.owner_id─┬─page.title───────────┬──────month─┬─hits─┐
│            12 │ Akiba Hebrew Academy │ 2017-08-01 │  241 │
└───────────────┴──────────────────────┴────────────┴──────┘
```

この方法でネストされたJSONオブジェクトをフラット化したり、いくつかのネストされた値を別のカラムとして保存したりできます。

## 不明なカラムのスキップ {#skipping-unknown-columns}

デフォルトでは、ClickHouseはJSONデータのインポート時に不明なカラムを無視します。例えば、`month`カラムなしで元のファイルをテーブルにインポートしてみましょう：

```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```

3つのカラムからなる[元のJSONデータ](../assets/list.json)をこのテーブルに挿入できます：

```sql
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
SELECT * FROM shorttable
```
```response
┌─path──────────────────────┬─hits─┐
│ 1971-72_Utah_Stars_season │    1 │
│ Aegithina_tiphia          │   34 │
│ Akiba_Hebrew_Academy      │  241 │
└───────────────────────────┴──────┘
```

ClickHouseはインポート時に不明なカラムを無視します。これは、[input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)設定オプションで無効にできます：

```sql
SET input_format_skip_unknown_fields = 0;
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
```
```response
Ok.
Exception on client:
Code: 117. DB::Exception: JSONEachRowフォーマットを解析中に不明なフィールドが見つかりました: month: (in file/uri /data/clickhouse/user_files/list.json): (at row 1)
```

ClickHouseは、JSONとテーブルカラムの構造が不一致な場合に例外をスローします。

## BSON {#bson}

ClickHouseは、[BSON](https://bsonspec.org/)エンコードされたファイルへのエクスポートとインポートをサポートしています。このフォーマットは、一部のDBMS（例えば、[MongoDB](https://github.com/mongodb/mongo)データベース）で使用されています。

BSONデータをインポートするには、[BSONEachRow](/interfaces/formats.md/#bsoneachrow)フォーマットを使用します。次に、[このBSONファイル](../assets/data.bson)からデータをインポートしてみましょう：

```sql
SELECT * FROM file('data.bson', BSONEachRow)
```
```response
┌─path──────────────────────┬─month─┬─hits─┐
│ Bob_Dolman                │ 17106 │  245 │
│ 1-krona                   │ 17167 │    4 │
│ Ahmadabad-e_Kalij-e_Sofla │ 17167 │    3 │
└───────────────────────────┴───────┴──────┘
```

同じフォーマットを使用してBSONファイルにエクスポートすることもできます：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.bson'
FORMAT BSONEachRow
```

その後、データは`out.bson`ファイルにエクスポートされます。

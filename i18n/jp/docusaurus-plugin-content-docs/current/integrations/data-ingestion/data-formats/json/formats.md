---
title: 他のJSONフォーマットの処理
slug: /integrations/data-formats/json/other-formats
description: 他のJSONフォーマットの処理
keywords: [json, formats, json formats]
---


# 他のフォーマットの処理

以前のJSONデータのロードの例では、[`JSONEachRow`](/interfaces/formats#jsoneachrow) (ndjson)の使用を前提としています。以下に、他の一般的なフォーマットのJSONをロードする例を示します。

## JSONオブジェクトの配列 {#array-of-json-objects}

JSONデータの最も一般的な形式の1つは、JSON配列の中にJSONオブジェクトのリストがあることです。次の[例](../assets/list.json)をご覧ください：

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

この種のデータのためのテーブルを作成しましょう：

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

JSONオブジェクトのリストをインポートするには、[`JSONEachRow`](/interfaces/formats.md/#jsoneachrow)フォーマット（[list.json](../assets/list.json)ファイルからデータを挿入）を使用します：

```sql
INSERT INTO sometable
FROM INFILE 'list.json'
FORMAT JSONEachRow
```

ローカルファイルからデータをロードするために[FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file)句を使用しました。インポートが成功したことが確認できます：

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

## NDJSON（行区切りJSON）の処理 {#handling-ndjson-line-delimited-json}

多くのアプリは、ログデータをJSON形式で記録し、各ログ行が個別のJSONオブジェクトであるようにします。次の[ファイル](../assets/object-per-line.json)のように：

```bash
cat object-per-line.json
```
```response
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
```

同じ`JSONEachRow`フォーマットは、これらのファイルで機能することができます：

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

場合によっては、JSONオブジェクトのリストが配列要素の代わりにオブジェクトのプロパティとしてエンコードされていることがあります（例として[objects.json](../assets/objects.json)を参照）：

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

ClickHouseは、この種のデータからデータをロードするために[`JSONObjectEachRow`](/interfaces/formats.md/#jsonobjecteachrow)フォーマットを使用できます：

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

### 親オブジェクトキーの値を指定する {#specifying-parent-object-key-values}

親オブジェクトキーの値もテーブルに保存したいとしましょう。この場合、[次のオプション](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name)を使用して、キーの値を保存するためのカラム名を定義できます：

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

`id`カラムは正しくキーの値で埋められていることに注意してください。

## JSON配列 {#json-arrays}

時には、スペース節約のためにJSONファイルがオブジェクトの代わりに配列としてエンコードされます。この場合、[JSON配列のリスト](../assets/arrays.json)に対処します：

```bash
cat arrays.json
```
```response
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```

この場合、ClickHouseはこのデータをロードし、各値を配列内の順序に基づいて対応するカラムに割り当てます。このために[`JSONCompactEachRow`](/interfaces/formats.md/#jsoncompacteachrow)フォーマットを使用します：

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

場合によっては、データが行単位ではなくカラム単位でエンコードされることがあります。この場合、親JSONオブジェクトには値を持つカラムが含まれます。次の[ファイル](../assets/columns.json)を見てみましょう：

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

ClickHouseは、このようにフォーマットされたデータを解析するために[`JSONColumns`](/interfaces/formats.md/#jsoncolumns)フォーマットを使用します：

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

オブジェクトの代わりに[カラムの配列](../assets/columns-array.json)を処理する際には、よりコンパクトな形式も[`JSONCompactColumns`](/interfaces/formats.md/#jsoncompactcolumns)フォーマットを使用してサポートされています：

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

## JSONオブジェクトを解析するのではなく保存する {#saving-json-objects-instead-of-parsing}

場合によっては、解析するのではなく単一の`String`（またはJSON）カラムにJSONオブジェクトを保存したいことがあります。これは、異なる構造のJSONオブジェクトのリストを扱う場合に便利です。[このファイル](../assets/custom.json)を見てみましょう。親リスト内に複数の異なるJSONオブジェクトがあります：

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

元のJSONオブジェクトを次のテーブルに保存したいと考えています：

```sql
CREATE TABLE events
(
    `data` String
)
ENGINE = MergeTree
ORDER BY ()
```

次に、JSONオブジェクトを解析するのではなく保存するために[`JSONAsString`](/interfaces/formats.md/#jsonasstring)フォーマットを使用して、このテーブルにファイルからデータをロードできます：

```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```

保存したオブジェクトにクエリを実行するために[JSON関数](/sql-reference/functions/json-functions.md)を使用できます：

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

`JSONAsString`は、通常は`JSONEachRow`フォーマットと共に使用されるJSONオブジェクト毎行の形式のファイルでも問題なく機能します。

## ネストされたオブジェクトのスキーマ {#schema-for-nested-objects}

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

[ネストされたJSONキー](../assets/list-nested.json)に簡単にアクセスできるように[次の設定オプション](/operations/settings/settings-formats.md/#input_format_import_nested_json)を有効にします：

```sql
SET input_format_import_nested_json = 1
```

これにより、ドット記法を使用してネストされたJSONオブジェクトキーにアクセスできるようになります（バッククォートで囲むことを忘れないでください）：

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

これにより、ネストされたJSONオブジェクトをフラット化したり、いくつかのネストされた値を別々のカラムとして保存することができます。

## 不明なカラムのスキップ {#skipping-unknown-columns}

デフォルトでは、ClickHouseはJSONデータをインポートする際に不明なカラムを無視します。次のように、`month`カラムがない状態で元のファイルをインポートしてみましょう：

```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```

3つのカラムを持つ[元のJSONデータ](../assets/list.json)をこのテーブルにまだ挿入できます：

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

ClickHouseはインポート時に不明なカラムを無視します。これを無効にするには、[input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)設定オプションを使用します：

```sql
SET input_format_skip_unknown_fields = 0;
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
```
```response
Ok.
Exception on client:
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: month: (in file/uri /data/clickhouse/user_files/list.json): (at row 1)
```

ClickHouseは、JSONとテーブルカラムの構造が不一致の場合に例外をスローします。

## BSON {#bson}

ClickHouseは、[BSON](https://bsonspec.org/)エンコードされたファイルへのエクスポートおよびインポートを許可します。この形式は、一部のDBMS（例： [MongoDB](https://github.com/mongodb/mongo)データベース）で使用されます。

BSONデータをインポートするには、[BSONEachRow](/interfaces/formats.md/#bsoneachrow)フォーマットを使用します。次の[BSONファイル](../assets/data.bson)からデータをインポートしてみましょう：

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

これで、データが`out.bson`ファイルにエクスポートされます。

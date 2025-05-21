---
title: 'その他のJSONフォーマットの取り扱い'
slug: /integrations/data-formats/json/other-formats
description: 'その他のJSONフォーマットの取り扱い'
sidebar_label: 'その他のフォーマットの取り扱い'
keywords: ['json', 'formats', 'json formats']
---


# その他のJSONフォーマットの取り扱い

以前のJSONデータのロード例は、[`JSONEachRow`](/interfaces/formats/JSONEachRow)（`NDJSON`）の使用を想定しています。このフォーマットは、各JSON行のキーをカラムとして読み取ります。例えば：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
LIMIT 5

┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

5 rows in set. Elapsed: 0.449 sec.
```

これは一般的には最もよく使用されるJSONフォーマットですが、ユーザーは他のフォーマットに出くわすか、JSONを単一のオブジェクトとして読み取る必要があります。

以下では、一般的な他のフォーマットでのJSONの読み取りとロードの例を示します。

## JSONをオブジェクトとして読み取る {#reading-json-as-an-object}

前述の例では、`JSONEachRow`が改行で区切られたJSONを読み取り、各行がテーブルの行にマップされ、各キーがカラムにマップされる方法を示しています。これは、JSONが各カラムに対して単一のタイプで予測可能な場合に理想的です。

対照的に、`JSONAsObject`は各行を単一の`JSON`オブジェクトとして扱い、[`JSON`](/sql-reference/data-types/newjson)タイプの単一カラムに格納します。これにより、ネストされたJSONペイロードや、キーが動的で複数のタイプを持つ可能性がある場合に適しています。

行ごとの挿入には`JSONEachRow`を使用し、柔軟または動的なJSONデータを格納する場合は[`JSONAsObject`](/interfaces/formats/JSONAsObject)を使用します。

上記の例と対照的に、以下のクエリは各行をJSONオブジェクトとして同じデータを読み取ります：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONAsObject)
LIMIT 5

┌─json─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

5 rows in set. Elapsed: 0.338 sec.
```

`JSONAsObject`は、単一のJSONオブジェクトカラムを使用してテーブルに行を挿入する際にも便利です。例えば：

```sql
CREATE TABLE pypi
(
    `json` JSON
)
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO pypi SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONAsObject)
LIMIT 5;

SELECT *
FROM pypi
LIMIT 2;

┌─json─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

2 rows in set. Elapsed: 0.003 sec.
```

`JSONAsObject`フォーマットは、オブジェクトの構造が不一致である場合にも改行で区切られたJSONを読み取るのに役立ちます。例えば、行ごとにキーのタイプが異なる場合（ある時は文字列で、別の時はオブジェクトであることがあります）。そのような場合、ClickHouseは`JSONEachRow`を使用して安定したスキーマを推測できず、`JSONAsObject`はデータを厳密なタイプの強制なしに取り込むことを可能にし、各JSON行を単一カラムに全体として格納します。以下の例では、`JSONEachRow`が失敗することに注目してください：

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONEachRow')

Elapsed: 1.198 sec.

Received exception from server (version 24.12.1):
Code: 636. DB::Exception: Received from sql-clickhouse.clickhouse.com:9440. DB::Exception: The table structure cannot be extracted from a JSONEachRow format file. Error:
Code: 117. DB::Exception: JSON objects have ambiguous data: in some objects path 'record.subject' has type 'String' and in some - 'Tuple(`$type` String, cid String, uri String)'. You can enable setting input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects to use String type for path 'record.subject'. (INCORRECT_DATA) (version 24.12.1.18239 (official build))
To increase the maximum number of rows/bytes to read for structure determination, use setting input_format_max_rows_to_read_for_schema_inference/input_format_max_bytes_to_read_for_schema_inference.
You can specify the structure manually: (in file/uri bluesky/file_0001.json.gz). (CANNOT_EXTRACT_TABLE_STRUCTURE)
```

逆に、`JSONAsObject`はこの場合に使用でき、`JSON`タイプは同じサブカラムに対して複数のタイプをサポートします。

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONAsObject')

┌─count()─┐
│ 1000000 │
└─────────┘

1 row in set. Elapsed: 0.480 sec. Processed 1.00 million rows, 256.00 B (2.08 million rows/s., 533.76 B/s.)
```

## JSONオブジェクトの配列 {#array-of-json-objects}

JSONデータの最も一般的な形式の1つは、JSON配列内にJSONオブジェクトのリストを持つことです。例えば[この例](../assets/list.json)のように：

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

JSONオブジェクトのリストをインポートするには、[`JSONEachRow`](/interfaces/formats.md/#jsoneachrow)フォーマットを使用します（[list.json](../assets/list.json)ファイルからデータを挿入）：

```sql
INSERT INTO sometable
FROM INFILE 'list.json'
FORMAT JSONEachRow
```

ローカルファイルからデータをロードするために[FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file)句を使用し、インポートが成功したことを確認できます：

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

## JSONオブジェクトのキー {#json-object-keys}

場合によっては、JSONオブジェクトのリストが配列要素の代わりにオブジェクトプロパティとしてエンコードされることがあります（例として[objects.json](../assets/objects.json)を参照）：

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

ClickHouseは、[`JSONObjectEachRow`](/interfaces/formats.md/#jsonobjecteachrow)フォーマットを使用してこの種のデータからデータをロードできます：

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

### 親オブジェクトのキー値を指定する {#specifying-parent-object-key-values}

親オブジェクトのキー値をテーブルに保存したい場合、次のオプションを使用して、キー値を保存したいカラムの名前を定義できます：

```sql
SET format_json_object_each_row_column_for_object_name = 'id'
```

次に、[`file()`](/sql-reference/functions/files.md/#file)関数を使用して、元のJSONファイルから読み込まれるデータを確認できます：

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

時々、スペースを節約するために、JSONファイルはオブジェクトの代わりに配列でエンコードされます。この場合、[JSON配列のリスト](../assets/arrays.json)を扱います：

```bash
cat arrays.json
```
```response
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```

この場合、ClickHouseはこのデータをロードし、配列内の順序に基づいて各値を対応するカラムに割り当てます。このために、[`JSONCompactEachRow`](/interfaces/formats.md/#jsoncompacteachrow)フォーマットを使用します。

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

### JSON配列からの個別カラムのインポート {#importing-individual-columns-from-json-arrays}

場合によっては、データが行指向ではなくカラム指向にエンコードされることがあります。この場合、親JSONオブジェクトは値のあるカラムを含みます。以下のファイルを見てみましょう[../assets/columns.json]：

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

よりコンパクトなフォーマットも、オブジェクトを使用するのではなく[カラムの配列](../assets/columns-array.json)を扱う場合にサポートされています。以下のように[`JSONCompactColumns`](/interfaces/formats.md/#jsoncompactcolumns)フォーマットを使用します：

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

場合によっては、JSONオブジェクトを解析するのではなく単一の`String`（または`JSON`）カラムに保存したいことがあります。これは、異なる構造のJSONオブジェクトのリストを扱う場合に便利です。例えば、親リスト内に複数の異なるJSONオブジェクトを含む[このファイル](../assets/custom.json)を見てみましょう：

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

元のJSONオブジェクトを以下のテーブルに保存したいとします：

```sql
CREATE TABLE events
(
    `data` String
)
ENGINE = MergeTree
ORDER BY ()
```

次に、[`JSONAsString`](/interfaces/formats.md/#jsonasstring)フォーマットを使用して、このテーブルにファイルからデータをロードし、JSONオブジェクトを解析するのではなく保持します：

```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```

そして、保存されたオブジェクトを問合せるために[JSON関数](/sql-reference/functions/json-functions.md)を使用します：

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

`JSONAsString`は、通常`JSONEachRow`フォーマットで使用されるJSONオブジェクトごとに1行のフォーマットファイルの場合でも問題なく機能します。

## ネストされたオブジェクトのスキーマ {#schema-for-nested-objects}

[ネストされたJSONオブジェクト](../assets/list-nested.json)を扱う場合、さらに明示的なスキーマを定義し、複雑なタイプ（[`Array`](/sql-reference/data-types/array.md)、[`Object Data Type`](/sql-reference/data-types/object-data-type)または[`Tuple`](/sql-reference/data-types/tuple.md)）を使用してデータをロードすることができます：

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

[ネストされたJSONキー](../assets/list-nested.json)にアクセスするためには、[次の設定オプション](/operations/settings/settings-formats.md/#input_format_import_nested_json)を有効にします：

```sql
SET input_format_import_nested_json = 1
```

これにより、ドット表記を使用してネストされたJSONオブジェクトキーを参照できるようになります（機能させるにはバックスラッシュで囲むことを忘れないでください）：

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

このようにして、ネストされたJSONオブジェクトをフラット化したり、いくつかのネストされた値を参照して別のカラムとして保存することができます。

## 不明なカラムのスキップ {#skipping-unknown-columns}

デフォルトでは、ClickHouseはJSONデータをインポートする際に不明なカラムを無視します。元のファイルを`month`カラムなしでテーブルにインポートしてみましょう：

```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```

3カラムを持つ[元のJSONデータ](../assets/list.json)をこのテーブルに挿入できます：

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

ClickHouseはインポートの際に不明なカラムを無視します。これは、[input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)設定オプションを使用して無効にできます：

```sql
SET input_format_skip_unknown_fields = 0;
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
```
```response
Ok.
Exception on client:
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: month: (in file/uri /data/clickhouse/user_files/list.json): (at row 1)
```

ClickHouseは、JSONとテーブルカラムの構造が一致しない場合に例外をスローします。

## BSON {#bson}

ClickHouseは、[BSON](https://bsonspec.org/)エンコードされたファイルへのエクスポートとインポートをサポートしています。このフォーマットは、一部のDBMS、例えば[MongoDB](https://github.com/mongodb/mongo)データベースによって使用されています。

BSONデータをインポートするには、[BSONEachRow](/interfaces/formats.md/#bsoneachrow)フォーマットを使用します。[このBSONファイル](../assets/data.bson)からデータをインポートしてみましょう：

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

同じフォーマットを使用してBSONファイルへのエクスポートも可能です：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.bson'
FORMAT BSONEachRow
```

その後、`out.bson`ファイルにデータがエクスポートされます。

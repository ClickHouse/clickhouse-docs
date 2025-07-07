---
'title': '他のJSON形式の取り扱い'
'slug': '/integrations/data-formats/json/other-formats'
'description': '他のJSON形式の取り扱い'
'sidebar_label': '他の形式の取り扱い'
'keywords':
- 'json'
- 'formats'
- 'json formats'
---





# その他のJSONフォーマットの取り扱い

以前のJSONデータの読み込みの例では、[`JSONEachRow`](/interfaces/formats/JSONEachRow) (`NDJSON`) の使用を前提としています。このフォーマットは、各JSON行のキーをカラムとして読み込みます。例えば：

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

このフォーマットは一般的にJSONで最もよく使用される形式ですが、ユーザーは他の形式に出会ったり、JSONを単一オブジェクトとして読み取る必要があります。

以下に、他の一般的な形式でのJSONの読み込みとロードの例を示します。

## JSONをオブジェクトとして読み込む {#reading-json-as-an-object}

これまでの例は、`JSONEachRow` が改行区切りのJSONを読み込み、各行がテーブルの行にマッピングされ、各キーがカラムに対応する方法を示しています。これは、JSONが予測可能で各カラムのタイプが単一である場合に理想的です。

対照的に、`JSONAsObject` は各行を単一の `JSON` オブジェクトとして扱い、それを [`JSON`](/sql-reference/data-types/newjson) 型の単一カラムに保存します。これにより、ネストされたJSONペイロードや、キーが動的で潜在的に複数のタイプを持つ場合により適しています。

`JSONEachRow` を行単位の挿入用として使用し、柔軟または動的なJSONデータを格納する際には [`JSONAsObject`](/interfaces/formats/JSONAsObject) を使用してください。

前述の例と対照的に、以下のクエリでは同じデータを1行のJSONオブジェクトとして読み取ります：

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

`JSONAsObject` フォーマットは、単一のJSONオブジェクトカラムを使用してテーブルに行を挿入するのに便利です。例：

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

`JSONAsObject` フォーマットは、オブジェクトの構造が不一致な場合の改行区切りJSONを読み取るのにも役立ちます。例えば、キーが行ごとに型が変わる（時には文字列、時にはオブジェクトになる）場合です。そのような場合、ClickHouseは `JSONEachRow` を使用して安定したスキーマを推測できず、`JSONAsObject` により厳密な型制約なしでデータを取り込むことができ、各JSON行を単一のカラムに全体として保存します。以下の例では `JSONEachRow` が失敗することに注意してください：

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
 
逆に、`JSONAsObject` はこの場合に使用でき、`JSON` 型は同じサブカラムに対して複数の型をサポートします。

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONAsObject')

┌─count()─┐
│ 1000000 │
└─────────┘

1 row in set. Elapsed: 0.480 sec. Processed 1.00 million rows, 256.00 B (2.08 million rows/s., 533.76 B/s.)
```

## JSONオブジェクトの配列 {#array-of-json-objects}

JSONデータの最も一般的な形式の一つは、JSON配列内にJSONオブジェクトのリストを持つことです。この例を見てみましょう。[この例](../assets/list.json):

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

このようなデータのためのテーブルを作成しましょう：

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

JSONオブジェクトのリストをインポートするには、[`JSONEachRow`](/interfaces/formats.md/#jsoneachrow) フォーマットを使用します（[list.json](../assets/list.json) ファイルからデータを挿入します）：

```sql
INSERT INTO sometable
FROM INFILE 'list.json'
FORMAT JSONEachRow
```

ローカルファイルからデータをロードするために [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) 節を使用しました。インポートが成功したことが確認できます：

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

場合によっては、JSONオブジェクトのリストが配列要素ではなくオブジェクトプロパティとしてエンコードされることがあります（例えば、[objects.json](../assets/objects.json) を見てください）：

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

ClickHouseは、この種のデータから読み込むために[`JSONObjectEachRow`](/interfaces/formats.md/#jsonobjecteachrow) フォーマットを使用できます：

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

親オブジェクトキーの値もテーブルに保存したいとします。その場合、以下のオプションを使用してキーの値を保存するカラムの名前を定義できます：[以下のオプション](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name)：

```sql
SET format_json_object_each_row_column_for_object_name = 'id'
```

現在、[`file()`](/sql-reference/functions/files.md/#file) 関数を使用して元のJSONファイルから読み込まれるデータを確認できます：

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

`id` カラムがキー値で正しく埋め込まれていることに注意してください。

## JSON配列 {#json-arrays}

時には、スペースを節約するために、JSONファイルがオブジェクトの代わりに配列でエンコードされます。この場合、[JSON配列のリスト](../assets/arrays.json)を扱います：

```bash
cat arrays.json
```
```response
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```

この場合、ClickHouseはこのデータをロードし、配列内の順序に基づいて各値を対応するカラムに割り当てます。これには[`JSONCompactEachRow`](/interfaces/formats.md/#jsoncompacteachrow)フォーマットを使用します：

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

### JSON配列から個別カラムをインポートする {#importing-individual-columns-from-json-arrays}

場合によっては、データが行単位ではなくカラム単位でエンコードされることがあります。この場合、親JSONオブジェクトには値を持つカラムが含まれています。[以下のファイル](../assets/columns.json)を見てみましょう：

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

ClickHouseは[`JSONColumns`](/interfaces/formats.md/#jsoncolumns)フォーマットを使用してそのようなデータを解析します：

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

カラムの配列を扱う際には、[`JSONCompactColumns`](/interfaces/formats.md/#jsoncompactcolumns)フォーマットを使用することもできます：

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

JSONオブジェクトを解析するのではなく、単一の `String` (または `JSON`) カラムに保存したい場合があります。これは、異なる構造のJSONオブジェクトのリストを扱う際に便利です。[このファイル](../assets/custom.json)を例に取りますが、親リスト内に複数の異なるJSONオブジェクトがあります：

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

このテーブルにファイルからデータをロードするために、[`JSONAsString`](/interfaces/formats.md/#jsonasstring)フォーマットを使用してJSONオブジェクトを解析せずに保持します：

```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```

そして、保存されたオブジェクトをクエリするために[JSON関数](/sql-reference/functions/json-functions.md)を使用できます：

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

`JSONAsString` は、通常 `JSONEachRow` フォーマットで使用されるJSONオブジェクト・パー・ライン形式のファイルにおいても問題なく機能することに注意してください。

## ネストされたオブジェクトのスキーマ {#schema-for-nested-objects}

ネストされたJSONオブジェクト（例：[list-nested.json](../assets/list-nested.json)）を扱う場合、明示的なスキーマを定義し、複雑な型 （[`Array`](/sql-reference/data-types/array.md)、[`Object Data Type`](/sql-reference/data-types/object-data-type)または [`Tuple`](/sql-reference/data-types/tuple.md)）を使用してデータをロードできます：

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

[ネストされたJSONキー](../assets/list-nested.json)に参照するには、[以下の設定オプション](/operations/settings/settings-formats.md/#input_format_import_nested_json)を有効にします：

```sql
SET input_format_import_nested_json = 1
```

これにより、ドット記法を使用してネストされたJSONオブジェクトキーにアクセスできるようになります（機能させるためにはバックティック記号で囲むことを忘れないでください）：

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

これにより、ネストされたJSONオブジェクトをフラット化したり、いくつかのネストされた値を別のカラムとして保存したりできます。

## 不明なカラムのスキップ {#skipping-unknown-columns}

デフォルトでは、ClickHouseはJSONデータをインポートする際に不明なカラムを無視します。`month` カラムなしで元のファイルをテーブルにインポートしてみましょう：

```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```

3カラムの[元のJSONデータ](../assets/list.json)をこのテーブルに挿入できます：

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

ClickHouseはインポート時に不明なカラムを無視します。この挙動は、[input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 設定オプションで無効にできます：

```sql
SET input_format_skip_unknown_fields = 0;
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
```
```response
Ok.
Exception on client:
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: month: (in file/uri /data/clickhouse/user_files/list.json): (at row 1)
```

ClickHouseは不一致なJSONとテーブルカラム構造のケースで例外をスローします。

## BSON {#bson}

ClickHouseは、[BSON](https://bsonspec.org/) エンコードファイルからのエクスポートとインポートをサポートしています。このフォーマットは、[MongoDB](https://github.com/mongodb/mongo) データベースなど、一部のDBMSで使用されます。

BSONデータをインポートするには、[BSONEachRow](/interfaces/formats.md/#bsoneachrow)フォーマットを使用します。以下の[BSONファイル](../assets/data.bson)からデータをインポートします：

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

同じフォーマットを使用してBSONファイルへのエクスポートも行えます：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.bson'
FORMAT BSONEachRow
```

その後、データは `out.bson` ファイルにエクスポートされます。

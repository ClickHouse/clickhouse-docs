---
title: 'その他の JSON 形式の扱い'
slug: /integrations/data-formats/json/other-formats
description: 'その他の JSON 形式の扱い'
sidebar_label: 'その他の形式の扱い'
keywords: ['json', 'formats', 'json formats']
doc_type: 'guide'
---



# その他の JSON フォーマットの扱い

これまでの JSON データの読み込み例では、[`JSONEachRow`](/interfaces/formats/JSONEachRow)（`NDJSON`）の使用を前提としています。このフォーマットでは、各 JSON 行内のキーを列として読み取ります。たとえば次のようになります：

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

5行のセット。経過時間: 0.449秒
```

これは一般的に JSON で最もよく使われる形式ですが、他の形式に出会ったり、JSON 全体を 1 つのオブジェクトとして読み取る必要が生じる場合があります。

以下では、他の一般的な形式の JSON を読み込んだりロードしたりする例を示します。


## JSONをオブジェクトとして読み取る {#reading-json-as-an-object}

これまでの例では、`JSONEachRow`が改行区切りのJSONを読み取り、各行を個別のオブジェクトとしてテーブルの行にマッピングし、各キーを列にマッピングする方法を示しました。これは、各列が単一の型を持つ予測可能なJSONの場合に最適です。

対照的に、`JSONAsObject`は各行を単一の`JSON`オブジェクトとして扱い、[`JSON`](/sql-reference/data-types/newjson)型の単一列に格納します。これにより、ネストされたJSONペイロードや、キーが動的で複数の型を持つ可能性がある場合により適しています。

行単位の挿入には`JSONEachRow`を使用し、柔軟または動的なJSONデータを格納する場合は[`JSONAsObject`](/interfaces/formats/JSONAsObject)を使用してください。

上記の例と対比して、以下のクエリは同じデータを1行あたり1つのJSONオブジェクトとして読み取ります:

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

`JSONAsObject`は、単一のJSONオブジェクト列を使用してテーブルに行を挿入する場合に便利です。例:

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

`JSONAsObject`形式は、オブジェクトの構造が一貫していない場合に改行区切りのJSONを読み取る際にも有用です。例えば、キーの型が行によって異なる場合(文字列の場合もあれば、オブジェクトの場合もある)などです。このような場合、ClickHouseは`JSONEachRow`を使用して安定したスキーマを推論できず、`JSONAsObject`を使用することで厳密な型の強制なしにデータを取り込み、各JSON行を単一列に全体として格納できます。例えば、以下の例で`JSONEachRow`が失敗することに注目してください:

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONEachRow')

Elapsed: 1.198 sec.

```


サーバー (バージョン 24.12.1) から例外を受信しました:
コード: 636. DB::Exception: sql-clickhouse.clickhouse.com:9440 から受信しました。DB::Exception: JSONEachRow 形式のファイルからはテーブル構造を抽出できません。エラー:
コード: 117. DB::Exception: JSON オブジェクトにあいまいなデータがあります: 一部のオブジェクトではパス &#39;record.subject&#39; の型は &#39;String&#39; ですが、別のオブジェクトでは &#39;Tuple(`$type` String, cid String, uri String)&#39; になっています。パス &#39;record.subject&#39; に対して String 型を使用するには、設定 input&#95;format&#95;json&#95;use&#95;string&#95;type&#95;for&#95;ambiguous&#95;paths&#95;in&#95;named&#95;tuples&#95;inference&#95;from&#95;objects を有効にしてください。 (INCORRECT&#95;DATA) (バージョン 24.12.1.18239 (official build))
構造の推論に使用する行数/バイト数の上限を増やすには、設定 input&#95;format&#95;max&#95;rows&#95;to&#95;read&#95;for&#95;schema&#95;inference/input&#95;format&#95;max&#95;bytes&#95;to&#95;read&#95;for&#95;schema&#95;inference を使用します。
構造は手動で指定することもできます (ファイル/URI bluesky/file&#95;0001.json.gz 内)。 (CANNOT&#95;EXTRACT&#95;TABLE&#95;STRUCTURE)

````
 
逆に、この場合は`JSONAsObject`を使用できます。`JSON`型は同じサブカラムに対して複数の型をサポートしているためです。

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONAsObject')

┌─count()─┐
│ 1000000 │
└─────────┘

1 row in set. Elapsed: 0.480 sec. Processed 1.00 million rows, 256.00 B (2.08 million rows/s., 533.76 B/s.)
````


## JSON オブジェクトの配列 {#array-of-json-objects}

JSON データの最も一般的な形式の一つは、[この例](../assets/list.json)のように、JSON 配列内に JSON オブジェクトのリストを含む形式です:

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

この種のデータ用のテーブルを作成しましょう:

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

JSON オブジェクトのリストをインポートするには、[`JSONEachRow`](/interfaces/formats/JSONEachRow) 形式を使用します([list.json](../assets/list.json) ファイルからデータを挿入):

```sql
INSERT INTO sometable
FROM INFILE 'list.json'
FORMAT JSONEachRow
```

ローカルファイルからデータを読み込むために [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) 句を使用しました。インポートが成功したことを確認できます:

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


## JSONオブジェクトキー {#json-object-keys}

場合によっては、JSONオブジェクトのリストを配列要素ではなく、オブジェクトのプロパティとしてエンコードすることができます（例として[objects.json](../assets/objects.json)を参照）：

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

ClickHouseは[`JSONObjectEachRow`](/interfaces/formats/JSONObjectEachRow)フォーマットを使用して、この種のデータを読み込むことができます：

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

### 親オブジェクトのキー値の指定 {#specifying-parent-object-key-values}

親オブジェクトのキー値もテーブルに保存したい場合を考えてみましょう。この場合、[次のオプション](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name)を使用して、キー値を保存する列の名前を定義できます：

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

`id`列がキー値によって正しく入力されていることに注目してください。


## JSON配列 {#json-arrays}

スペースを節約するため、JSONファイルがオブジェクトではなく配列としてエンコードされることがあります。この場合、[JSON配列のリスト](../assets/arrays.json)を扱います：

```bash
cat arrays.json
```

```response
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```

この場合、ClickHouseはデータを読み込み、配列内の順序に基づいて各値を対応するカラムに割り当てます。これには[`JSONCompactEachRow`](/interfaces/formats/JSONCompactEachRow)フォーマットを使用します：

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

### JSON配列から個別のカラムをインポートする {#importing-individual-columns-from-json-arrays}

場合によっては、データが行単位ではなくカラム単位でエンコードされることがあります。この場合、親JSONオブジェクトが値を持つカラムを含んでいます。[次のファイル](../assets/columns.json)を見てみましょう：

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

ClickHouseは、このようにフォーマットされたデータを解析するために[`JSONColumns`](/interfaces/formats/JSONColumns)フォーマットを使用します：

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

オブジェクトの代わりに[カラムの配列](../assets/columns-array.json)を扱う場合、[`JSONCompactColumns`](/interfaces/formats/JSONCompactColumns)フォーマットを使用したより簡潔なフォーマットもサポートされています：

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


## パースせずにJSONオブジェクトを保存する {#saving-json-objects-instead-of-parsing}

JSONオブジェクトをパースせずに単一の`String`(または`JSON`)カラムに保存したい場合があります。これは、異なる構造を持つJSONオブジェクトのリストを扱う際に便利です。例として[このファイル](../assets/custom.json)を見てみましょう。親リストの中に複数の異なるJSONオブジェクトが含まれています:

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

元のJSONオブジェクトを次のテーブルに保存します:

```sql
CREATE TABLE events
(
    `data` String
)
ENGINE = MergeTree
ORDER BY ()
```

次に、[`JSONAsString`](/interfaces/formats/JSONAsString)フォーマットを使用してファイルからこのテーブルにデータをロードし、JSONオブジェクトをパースせずに保持できます:

```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```

そして、[JSON関数](/sql-reference/functions/json-functions.md)を使用して保存されたオブジェクトをクエリできます:

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

なお、`JSONAsString`は1行に1つのJSONオブジェクトが記述されたファイル(通常は`JSONEachRow`フォーマットで使用される)の場合でも問題なく動作します。


## ネストされたオブジェクトのスキーマ {#schema-for-nested-objects}

[ネストされたJSONオブジェクト](../assets/list-nested.json)を扱う場合、明示的なスキーマを定義し、複合型([`Array`](/sql-reference/data-types/array.md)、[`JSON`](/integrations/data-formats/json/overview)、または[`Tuple`](/sql-reference/data-types/tuple.md))を使用してデータを読み込むことができます:

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

[以下の設定オプション](/operations/settings/settings-formats.md/#input_format_import_nested_json)を有効にすることで、[ネストされたJSONキー](../assets/list-nested.json)を参照できます:

```sql
SET input_format_import_nested_json = 1
```

これにより、ドット記法を使用してネストされたJSONオブジェクトのキーを参照できます(バッククォート記号で囲む必要があることに注意してください):

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

この方法により、ネストされたJSONオブジェクトをフラット化したり、ネストされた値の一部を個別のカラムとして保存したりすることができます。


## 未知のカラムのスキップ {#skipping-unknown-columns}

デフォルトでは、ClickHouseはJSONデータをインポートする際に未知のカラムを無視します。`month`カラムを持たないテーブルに元のファイルをインポートしてみましょう：

```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```

3つのカラムを持つ[元のJSONデータ](../assets/list.json)を、このテーブルに挿入することができます：

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

ClickHouseはインポート時に未知のカラムを無視します。この動作は[input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)設定オプションで無効化できます：

```sql
SET input_format_skip_unknown_fields = 0;
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
```

```response
Ok.
Exception on client:
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: month: (in file/uri /data/clickhouse/user_files/list.json): (at row 1)
```

ClickHouseは、JSONとテーブルのカラム構造が一致しない場合に例外をスローします。


## BSON {#bson}

ClickHouseは、[BSON](https://bsonspec.org/)エンコードされたファイルからのデータのインポートおよびエクスポートに対応しています。この形式は、[MongoDB](https://github.com/mongodb/mongo)データベースなど、一部のDBMSで使用されています。

BSONデータをインポートするには、[BSONEachRow](/interfaces/formats/BSONEachRow)形式を使用します。[このBSONファイル](../assets/data.bson)からデータをインポートしてみましょう:

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

同じ形式を使用してBSONファイルへエクスポートすることもできます:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.bson'
FORMAT BSONEachRow
```

これにより、データが`out.bson`ファイルにエクスポートされます。

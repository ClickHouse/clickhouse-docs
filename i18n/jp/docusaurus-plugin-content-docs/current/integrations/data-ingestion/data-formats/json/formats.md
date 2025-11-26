---
title: 'その他のJSON形式の取り扱い'
slug: /integrations/data-formats/json/other-formats
description: 'その他のJSON形式の取り扱い'
sidebar_label: 'その他の形式の取り扱い'
keywords: ['json', 'formats', 'json 形式']
doc_type: 'guide'
---



# その他の JSON フォーマットの扱い方

これまでの JSON データの読み込み例では、[`JSONEachRow`](/interfaces/formats/JSONEachRow)（`NDJSON`）の利用を想定してきました。このフォーマットでは、各 JSON 行のキーを列として解釈します。例えば次のようになります。

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

これは一般的に JSON で最もよく使われる形式ですが、他の形式に出会ったり、JSON 全体を 1 つのオブジェクトとして扱う必要が生じる場合もあります。

以下では、他の一般的な形式の JSON を読み取ったりロードしたりする例を示します。


## JSON をオブジェクトとして読み込む

前の例では、`JSONEachRow` が改行区切りの JSON をどのように読み込み、各行をテーブルの 1 行に対応する個別のオブジェクトとして扱い、各キーを列に対応付けるかを示しました。これは、JSON の構造が予測可能で、各列に単一の型が対応しているケースに最適です。

これに対して `JSONAsObject` は、各行を 1 つの `JSON` オブジェクトとして扱い、型 [`JSON`](/sql-reference/data-types/newjson) の単一列に格納します。このため、ネストされた JSON ペイロードや、キーが動的であり、かつ 1 つのキーに複数の型が存在しうるケースにより適しています。

行単位の挿入には `JSONEachRow` を使用し、柔軟または動的な JSON データを保存する場合は [`JSONAsObject`](/interfaces/formats/JSONAsObject) を使用してください。

上記の例と比較すると、次のクエリでは同じデータを 1 行ごとに JSON オブジェクトとして読み取ります。

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

5行のセット。経過時間: 0.338秒
```

`JSONAsObject` は、1 つの JSON オブジェクト型カラムだけを使ってテーブルに行を挿入する場合に便利です。例:

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

`JSONAsObject` フォーマットは、オブジェクトの構造が一貫していない場合の改行区切り JSON の読み取りにも有用です。例えば、あるキーの型が行ごとに異なる場合（あるときは文字列だが、別のときはオブジェクトであるなど）です。このようなケースでは、ClickHouse は `JSONEachRow` を使って安定したスキーマを推論できませんが、`JSONAsObject` を使うと、厳密な型の制約なしにデータを取り込むことができ、各 JSON 行をそのまま 1 つのカラムに保存できます。例えば、`JSONEachRow` が次の例でどのように失敗するかを確認してください。

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONEachRow')

Elapsed: 1.198 sec.
```


サーバー (バージョン 24.12.1) から例外を受信しました:
Code: 636. DB::Exception: sql-clickhouse.clickhouse.com:9440 から受信しました。DB::Exception: JSONEachRow 形式のファイルからはテーブル構造を抽出できません。エラー:
Code: 117. DB::Exception: JSON オブジェクトにあいまいなデータがあります: 一部のオブジェクトではパス &#39;record.subject&#39; の型が &#39;String&#39; であり、別のものでは &#39;Tuple(`$type` String, cid String, uri String)&#39; になっています。パス &#39;record.subject&#39; に対して String 型を使用するには、設定 input&#95;format&#95;json&#95;use&#95;string&#95;type&#95;for&#95;ambiguous&#95;paths&#95;in&#95;named&#95;tuples&#95;inference&#95;from&#95;objects を有効にできます。 (INCORRECT&#95;DATA) (version 24.12.1.18239 (official build))
構造推論のために読み取る行数やバイト数の上限を増やすには、設定 input&#95;format&#95;max&#95;rows&#95;to&#95;read&#95;for&#95;schema&#95;inference / input&#95;format&#95;max&#95;bytes&#95;to&#95;read&#95;for&#95;schema&#95;inference を使用してください。
構造を手動で指定することもできます (ファイル/URI bluesky/file&#95;0001.json.gz 内)。 (CANNOT&#95;EXTRACT&#95;TABLE&#95;STRUCTURE)

````
 
逆に、`JSON`型は同一のサブカラムに対して複数の型をサポートするため、このケースでは`JSONAsObject`を使用できます。

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONAsObject')

┌─count()─┐
│ 1000000 │
└─────────┘

1 row in set. Elapsed: 0.480 sec. Processed 1.00 million rows, 256.00 B (2.08 million rows/s., 533.76 B/s.)
````


## JSON オブジェクトの配列

最も一般的な JSON データ形式の 1 つは、[この例](../assets/list.json) のように、JSON 配列の中に JSON オブジェクトのリストを持つ形式です。

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

この種のデータを格納するテーブルを作成しましょう。

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

JSON オブジェクトのリストをインポートするには、[`JSONEachRow`](/interfaces/formats/JSONEachRow) フォーマットを使用します（[list.json](../assets/list.json) ファイルからデータを挿入します）:

```sql
INSERT INTO sometable
FROM INFILE 'list.json'
FORMAT JSONEachRow
```

ローカルファイルからデータを読み込むために [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) 句を使用し、インポートが正常に完了したことを確認できます。

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


## JSON オブジェクトキー

場合によっては、JSON オブジェクトのリストを、配列の要素ではなくオブジェクトのプロパティとしてエンコードすることもできます（例については [objects.json](../assets/objects.json) を参照してください）。

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

ClickHouse は、この種のデータを [`JSONObjectEachRow`](/interfaces/formats/JSONObjectEachRow) フォーマットで読み込むことができます。

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

### 親オブジェクトのキー値を指定する

テーブルに親オブジェクトのキー値も保存したいとします。この場合、キー値を保存する列名を定義するために、[次のオプション](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name)を使用できます。

```sql
SET format_json_object_each_row_column_for_object_name = 'id'
```

次に、[`file()`](/sql-reference/functions/files.md/#file) 関数を使用して、元の JSON ファイルからどのデータが読み込まれるかを確認できます。

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

`id` 列にキーの値が正しく格納されていることに注目してください。


## JSON 配列

場合によっては、容量を節約するために、JSON ファイルがオブジェクトではなく配列としてエンコードされていることがあります。この場合、[JSON 配列のリスト](../assets/arrays.json) を扱うことになります。

```bash
cat arrays.json
```

```response
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```

この場合、ClickHouse はこのデータを読み込み、配列内での順序に従って各値を対応する列に割り当てます。これには [`JSONCompactEachRow`](/interfaces/formats/JSONCompactEachRow) フォーマットを使用します。

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

### JSON 配列から個々のカラムをインポートする

場合によっては、データが行単位ではなく列単位でエンコードされていることがあります。この場合、親 JSON オブジェクトに、値が格納されたカラムが含まれます。[次のファイル](../assets/columns.json)を参照してください。

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

ClickHouse は、次のような形式のデータを解析するために、[`JSONColumns`](/interfaces/formats/JSONColumns) フォーマットを使用します。

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

オブジェクトではなく[カラムの配列](../assets/columns-array.json)を扱う場合には、[`JSONCompactColumns`](/interfaces/formats/JSONCompactColumns) フォーマットを使用することで、よりコンパクトな形式も利用できます。

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


## JSON オブジェクトをパースせずに保存する

場合によっては、JSON オブジェクトをパースせずに、単一の `String`（または `JSON`）カラムに保存したい場合があります。これは、構造が異なる複数の JSON オブジェクトのリストを扱う際に有用です。例として、親リスト内に複数の異なる JSON オブジェクトが含まれている [このファイル](../assets/custom.json) を見てみましょう。

```bash
cat custom.json
```

```response
[
  {"name": "Joe", "age": 99, "type": "person"},
  {"url": "/my.post.MD", "hits": 1263, "type": "post"},
  {"message": "ディスク使用量の警告", "type": "log"}
]
```

元の JSON オブジェクトを次のテーブルに保存します。

```sql
CREATE TABLE events
(
    `data` String
)
ENGINE = MergeTree
ORDER BY ()
```

これで、ファイルからこのテーブルにデータを読み込む際に、JSON オブジェクトをパースせずそのまま保持するためのフォーマットとして [`JSONAsString`](/interfaces/formats/JSONAsString) を使用できます。

```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```

保存されたオブジェクトに対してクエリを実行するには、[JSON functions](/sql-reference/functions/json-functions.md) を使用できます。

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

`JSONAsString` は、1 行につき 1 つの JSON オブジェクトが含まれる形式のファイル（通常は `JSONEachRow` フォーマットとともに使用されます）の場合には、問題なく動作することに注意してください。


## ネストされたオブジェクト用のスキーマ

[ネストされた JSON オブジェクト](../assets/list-nested.json) を扱う場合には、明示的なスキーマをさらに定義し、複合型（[`Array`](/sql-reference/data-types/array.md)、[`JSON`](/integrations/data-formats/json/overview)、[`Tuple`](/sql-reference/data-types/tuple.md)）を使用してデータを読み込むことができます。

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


## ネストされた JSON オブジェクトへのアクセス

[ネストされた JSON キー](../assets/list-nested.json) には、[次の設定オプション](/operations/settings/settings-formats.md/#input_format_import_nested_json) を有効にすることでアクセスできます。

```sql
SET input_format_import_nested_json = 1
```

これにより、ネストされた JSON オブジェクトのキーをドット記法で参照できます（そのまま利用するには、これらのキーをバッククォート記号で囲むことを忘れないでください）:

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

この方法により、ネストされた JSON オブジェクトをフラット化したり、ネスト内の一部の値を取り出して個別のカラムとして保存したりできます。


## 未知のカラムをスキップする

デフォルトでは、ClickHouse は JSON データをインポートする際に、未知のカラムをスキップします。`month` カラムなしで元のファイルをテーブルにインポートしてみましょう。

```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```

3 列を持つ[元の JSON データ](../assets/list.json)を、このテーブルにそのまま挿入できます。

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

ClickHouse はインポート時に不明なカラムを無視します。この動作は [input&#95;format&#95;skip&#95;unknown&#95;fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 設定オプションで無効化できます。

```sql
SET input_format_skip_unknown_fields = 0;
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
```

```response
Ok.
クライアント側の例外:
Code: 117. DB::Exception: JSONEachRow形式の解析中に不明なフィールドが検出されました: month: (ファイル/URI: /data/clickhouse/user_files/list.json): (1行目)
```

ClickHouse は、JSON とテーブル列の構造が一致しない場合、例外をスローします。


## BSON

ClickHouse は、[BSON](https://bsonspec.org/) 形式でエンコードされたファイルへのエクスポートおよびそこからのインポートをサポートしています。この形式は、[MongoDB](https://github.com/mongodb/mongo) データベースなど、いくつかの DBMS で使用されています。

BSON データをインポートするには、[BSONEachRow](/interfaces/formats/BSONEachRow) 形式を使用します。[この BSON ファイル](../assets/data.bson) からデータをインポートしてみましょう：

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

同じフォーマットで BSON ファイルにエクスポートすることもできます。

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.bson'
FORMAT BSONEachRow
```

その後、データは `out.bson` ファイルにエクスポートされます。

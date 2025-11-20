---
'title': '다른 JSON 형식 처리'
'slug': '/integrations/data-formats/json/other-formats'
'description': '다른 JSON 형식 처리'
'sidebar_label': '다른 형식 처리'
'keywords':
- 'json'
- 'formats'
- 'json formats'
'doc_type': 'guide'
---


# 다른 JSON 형식 처리하기

이전 JSON 데이터 로딩 예제는 [`JSONEachRow`](/interfaces/formats/JSONEachRow) (`NDJSON`) 사용을 가정합니다. 이 형식은 각 JSON 행의 키를 컬럼으로 읽습니다. 예를 들어:

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

일반적으로 이는 JSON에 가장 많이 사용되는 형식이지만, 사용자들은 다른 형식을 만나거나 JSON을 단일 객체로 읽어야 할 수 있습니다.

아래에서 다른 일반적인 형식으로 JSON을 읽고 로드하는 예제를 제공합니다.

## JSON을 객체로 읽기 {#reading-json-as-an-object}

이전 예제에서는 `JSONEachRow`가 줄 구분 JSON을 읽는 방법을 보여주며, 각 행은 테이블 행에 매핑된 별도의 객체로 읽히고 각 키는 컬럼에 매핑됩니다. 이는 각 컬럼에 대해 단일 유형이 예측 가능한 JSON의 경우 이상적입니다. 

대조적으로, `JSONAsObject`는 각 행을 단일 `JSON` 객체로 처리하고 이를 [`JSON`](/sql-reference/data-types/newjson) 유형의 단일 컬럼에 저장합니다. 이는 중첩된 JSON 페이로드와 키가 동적이고 여러 유형을 가질 수 있는 경우에 더 적합합니다.

행 단위 삽입에는 `JSONEachRow`를 사용하고, 유연하거나 동적 JSON 데이터를 저장할 때는 [`JSONAsObject`](/interfaces/formats/JSONAsObject)를 사용하십시오.

위의 예제와 대조되는 쿼리에서는 동일한 데이터를 라인별 JSON 객체로 읽습니다:

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

`JSONAsObject`는 단일 JSON 객체 컬럼을 사용하여 테이블에 행을 삽입하는 데 유용합니다. 예를 들어:

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

`JSONAsObject` 형식은 객체 구조가 일관되지 않은 경우 줄 구분 JSON을 읽는 데도 유용할 수 있습니다. 예를 들어, 키가 행별로 유형이 다를 수 있는 경우 (때로는 문자열이고 다른 경우에는 객체일 수 있음). 이러한 경우 ClickHouse는 `JSONEachRow`를 사용하여 안정적인 스키마를 추론할 수 없으며, `JSONAsObject`는 데이터가 엄격한 유형 검사를 받지 않고도 수집될 수 있게 하여 각 JSON 행을 단일 컬럼에 전체로 저장할 수 있게 합니다. 다음의 예에서 `JSONEachRow`가 실패한 것을 주목하십시오:

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
 
반대로, `JSONAsObject`는 이 경우 사용될 수 있으며 `JSON` 유형이 동일한 하위 컬럼에 대해 여러 유형을 지원합니다.

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONAsObject')

┌─count()─┐
│ 1000000 │
└─────────┘

1 row in set. Elapsed: 0.480 sec. Processed 1.00 million rows, 256.00 B (2.08 million rows/s., 533.76 B/s.)
```

## JSON 객체의 배열 {#array-of-json-objects}

JSON 데이터의 가장 인기 있는 형식 중 하나는 JSON 배열에 JSON 객체 목록이 있는 것입니다. 예를 들어 [이 예제](../assets/list.json)와 같습니다:

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

이러한 데이터 유형에 대한 테이블을 만들어 보겠습니다:

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

JSON 객체 목록을 가져오기 위해 [`JSONEachRow`](/interfaces/formats/JSONEachRow) 형식을 사용할 수 있습니다 (파일 [list.json](../assets/list.json)에서 데이터 삽입):

```sql
INSERT INTO sometable
FROM INFILE 'list.json'
FORMAT JSONEachRow
```

로컬 파일에서 데이터를 로드하기 위해 [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) 절을 사용했으며 가져오기가 성공했음을 알 수 있습니다:

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

## JSON 객체 키 {#json-object-keys}

어떤 경우에는 JSON 객체 목록을 배열 요소 대신 객체 속성으로 인코딩할 수 있습니다 (예: [objects.json](../assets/objects.json) 참조):

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

ClickHouse는 [`JSONObjectEachRow`](/interfaces/formats/JSONObjectEachRow) 형식을 사용하여 이러한 데이터를 로드할 수 있습니다:

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

### 부모 객체 키 값 지정하기 {#specifying-parent-object-key-values}

부모 객체 키에 값을 테이블에 저장하고 싶다고 가정해 보겠습니다. 이 경우, 키 값을 저장할 컬럼의 이름을 정의하기 위해 [다음 옵션](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name)을 사용할 수 있습니다:

```sql
SET format_json_object_each_row_column_for_object_name = 'id'
```

이제 [`file()`](/sql-reference/functions/files.md/#file) 함수를 사용하여 원본 JSON 파일에서 로드될 데이터를 확인할 수 있습니다:

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

`id` 컬럼이 키 값으로 정확하게 채워졌음을 주목하십시오.

## JSON 배열 {#json-arrays}

종종 공간을 절약하기 위해 JSON 파일은 객체 대신 배열로 인코딩됩니다. 이 경우, 우리는 [JSON 배열 목록](../assets/arrays.json)을 다룹니다:

```bash
cat arrays.json
```
```response
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```

이 경우 ClickHouse는 이 데이터를 로드하고 각 값을 배열에서의 순서에 따라 해당 컬럼에 매핑합니다. 우리는 이를 위해 [`JSONCompactEachRow`](/interfaces/formats/JSONCompactEachRow) 형식을 사용합니다:

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

### JSON 배열에서 개별 컬럼 가져오기 {#importing-individual-columns-from-json-arrays}

어떤 경우에는 데이터가 행 단위 대신 컬럼 단위로 인코딩될 수 있습니다. 이 경우, 부모 JSON 객체는 값이 있는 컬럼을 포함합니다. [다음 파일](../assets/columns.json)을 살펴보세요:

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

ClickHouse는 이러한 형식으로 데이터를 구문 분석하기 위해 [`JSONColumns`](/interfaces/formats/JSONColumns) 형식을 사용합니다:

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

객체 대신 [컬럼 배열](../assets/columns-array.json)을 다룰 때 더 컴팩트한 형식이 [`JSONCompactColumns`](/interfaces/formats/JSONCompactColumns) 형식으로 지원됩니다:

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

## 파싱 대신 JSON 객체 저장하기 {#saving-json-objects-instead-of-parsing}

JSON 객체를 단일 `String` (또는 `JSON`) 컬럼에 저장하고 싶을 수 있는 경우도 있습니다. 이는 구조가 다른 여러 JSON 객체 목록을 다룰 때 유용할 수 있습니다. 예를 들어, 여러 서로 다른 JSON 객체가 있는 부모 목록을 가정해 보겠습니다. [이 파일](../assets/custom.json)을 참조하십시오:

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

원본 JSON 객체를 다음 테이블에 저장하고 싶습니다:

```sql
CREATE TABLE events
(
    `data` String
)
ENGINE = MergeTree
ORDER BY ()
```

이제 JSON 객체 대신 파싱하지 않고 [`JSONAsString`](/interfaces/formats/JSONAsString) 형식을 사용하여 파일에서 이 테이블로 데이터를 로드할 수 있습니다:

```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```

또한 저장된 객체를 쿼리하기 위해 [JSON 함수](/sql-reference/functions/json-functions.md)를 사용할 수 있습니다:

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

`JSONAsString`는 일반적으로 `JSONEachRow` 형식과 함께 사용되는 JSON 객체-per-line 형식의 파일에서 잘 작동함을 주목하십시오.

## 중첩 객체의 스키마 {#schema-for-nested-objects}

중첩된 JSON 객체를 다루는 경우 [명시적 스키마](../assets/list-nested.json)를 추가로 정의하고 복합 유형 ([`Array`](/sql-reference/data-types/array.md), [`JSON`](/integrations/data-formats/json/overview) 또는 [`Tuple`](/sql-reference/data-types/tuple.md))을 사용하여 데이터를 로드할 수 있습니다:

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

## 중첩 JSON 객체 접근하기 {#accessing-nested-json-objects}

[중첩 JSON 키](../assets/list-nested.json)에 접근하기 위해 [다음 설정 옵션](/operations/settings/settings-formats.md/#input_format_import_nested_json)을 활성화할 수 있습니다:

```sql
SET input_format_import_nested_json = 1
```

이렇게 하면 점 표기법을 사용하여 중첩 JSON 객체 키를 참조할 수 있습니다 (작동하려면 그들을 백틱 기호로 감싸는 것을 잊지 마십시오):

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

이렇게 하면 중첩된 JSON 객체를 평면화하거나 일부 중첩 값을 별도의 컬럼으로 저장하는 데 사용할 수 있습니다.

## 알 수 없는 컬럼 스킵하기 {#skipping-unknown-columns}

기본적으로 ClickHouse는 JSON 데이터를 가져올 때 알 수 없는 컬럼을 무시합니다. `month` 컬럼 없이 원본 파일을 테이블에 가져오려고 해 보겠습니다:

```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```

여전히 이 테이블에 3 개의 컬럼을 갖는 [원본 JSON 데이터](../assets/list.json)를 삽입할 수 있습니다:

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

ClickHouse는 가져오는 동안 알 수 없는 컬럼을 무시합니다. 이는 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 설정 옵션으로 비활성화할 수 있습니다:

```sql
SET input_format_skip_unknown_fields = 0;
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
```
```response
Ok.
Exception on client:
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: month: (in file/uri /data/clickhouse/user_files/list.json): (at row 1)
```

ClickHouse는 JSON과 테이블 컬럼 구조가 일치하지 않을 때 예외를 발생시킵니다.

## BSON {#bson}

ClickHouse는 [BSON](https://bsonspec.org/) 인코딩 파일로 데이터 내보내기 및 가져오기를 허용합니다. 이 형식은 일부 DBMS, 예를 들어 [MongoDB](https://github.com/mongodb/mongo) 데이터베이스에서 사용됩니다.

BSON 데이터를 가져오기 위해 [BSONEachRow](/interfaces/formats/BSONEachRow) 형식을 사용합니다. [이 BSON 파일](../assets/data.bson)에서 데이터를 가져와 보겠습니다:

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

동일한 형식을 사용하여 BSON 파일로 내보낼 수도 있습니다:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.bson'
FORMAT BSONEachRow
```

그 후 `out.bson` 파일로 데이터가 내보내집니다.

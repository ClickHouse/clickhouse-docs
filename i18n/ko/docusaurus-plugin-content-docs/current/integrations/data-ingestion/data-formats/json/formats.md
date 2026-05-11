---
title: '기타 JSON 형식 처리'
slug: /integrations/data-formats/json/other-formats
description: '기타 JSON 형식 처리'
sidebar_label: '기타 형식 처리'
keywords: ['json', 'formats', 'json formats']
doc_type: 'guide'
---

# 기타 JSON 형식 처리 \{#handling-other-json-formats\}

앞에서 JSON 데이터를 로드하는 예제에서는 [`JSONEachRow`](/interfaces/formats/JSONEachRow) (`NDJSON`) 사용을 가정합니다. 이 형식은 각 JSON 행의 키를 컬럼으로 읽습니다. 예를 들어:

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

일반적으로 이는 JSON에서 가장 흔히 사용되는 형식이지만, 다른 형식을 접하거나 JSON을 하나의 객체로 읽어야 하는 경우가 있습니다.

아래에서는 다른 일반적인 JSON 형식을 읽고 로드하는 예제를 제공합니다.

## JSON을 객체로 읽기 \{#reading-json-as-an-object\}

앞선 예제에서는 `JSONEachRow`가 줄바꿈으로 구분된 JSON을 어떻게 읽는지 보여 주었습니다. 각 줄은 개별 객체로 읽혀 테이블의 행에 매핑되고, 각 키는 컬럼에 매핑됩니다. 이는 JSON 구조가 예측 가능하고 각 컬럼에 단일 타입만 존재할 때에 적합합니다.

반대로 `JSONAsObject`는 각 줄을 하나의 `JSON` 객체로 취급하여 [`JSON`](/sql-reference/data-types/newjson) 타입의 단일 컬럼에 저장하므로, 중첩된 JSON 페이로드나 키가 동적이고 하나 이상의 타입을 가질 수 있는 경우에 더 적합합니다.

행 단위 삽입에는 `JSONEachRow`를 사용하고, 유연하거나 동적인 JSON 데이터를 저장할 때는 [`JSONAsObject`](/interfaces/formats/JSONAsObject)를 사용하십시오.

위 예제와 비교하면, 다음 쿼리는 동일한 데이터를 한 줄당 하나의 JSON 객체로 읽습니다.

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

`JSONAsObject`는 하나의 JSON 객체 컬럼을 사용하여 테이블에 행을 삽입할 때 유용합니다. 예를 들어:

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

`JSONAsObject` 포맷은 객체 구조가 일관되지 않은 경우 줄 단위(newline-delimited) JSON을 읽을 때에도 유용합니다. 예를 들어 어떤 키의 타입이 행마다 달라져서 어떤 때는 문자열이고 다른 때는 객체인 경우가 있을 수 있습니다. 이러한 상황에서는 ClickHouse가 `JSONEachRow`를 사용해 안정적인 스키마를 유추할 수 없으며, `JSONAsObject`를 사용하면 엄격한 타입 강제 없이 데이터를 수집하고 각 JSON 행 전체를 하나의 값으로 단일 컬럼에 저장할 수 있습니다. 예를 들어, 다음 예제에서 `JSONEachRow`가 어떻게 실패하는지 확인하십시오:

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

반대로, `JSON` 타입은 동일한 서브컬럼에 대해 여러 타입을 지원하므로 이 경우에는 `JSONAsObject`를 사용할 수 있습니다.

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONAsObject')

┌─count()─┐
│ 1000000 │
└─────────┘

1 row in set. Elapsed: 0.480 sec. Processed 1.00 million rows, 256.00 B (2.08 million rows/s., 533.76 B/s.)
```

## JSON 객체 배열 \{#array-of-json-objects\}

가장 널리 사용되는 JSON 데이터 형식 중 하나는 [이 예시](../assets/list.json)와 같이 JSON 배열 안에 JSON 객체들의 목록을 두는 방식입니다.

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

이러한 유형의 데이터를 저장할 테이블을 만들어 보겠습니다:

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

JSON 객체 목록을 가져오려면 [`JSONEachRow`](/interfaces/formats/JSONEachRow) 형식을 사용할 수 있습니다([list.json](../assets/list.json) 파일의 데이터를 삽입하는 경우):

```sql
INSERT INTO sometable
FROM INFILE 'list.json'
FORMAT JSONEachRow
```

로컬 파일에서 데이터를 로드하기 위해 [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) 절을 사용했습니다. 가져오기가 성공적으로 완료된 것을 확인할 수 있습니다.

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

## JSON 객체 키 \{#json-object-keys\}

일부 상황에서는 JSON 객체 목록이 배열 요소가 아니라 객체 속성으로 인코딩될 수 있습니다(예시는 [objects.json](../assets/objects.json)을 참조하십시오):

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

ClickHouse에서는 이러한 종류의 데이터를 [`JSONObjectEachRow`](/interfaces/formats/JSONObjectEachRow) 포맷으로 로드할 수 있습니다.

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

### 상위 객체 키 값 지정 \{#specifying-parent-object-key-values\}

상위 객체 키의 값도 테이블에 저장하려는 경우를 가정해 보겠습니다. 이때는 키 값이 저장될 컬럼 이름을 정의하기 위해 [다음 옵션](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name)을 사용할 수 있습니다.

```sql
SET format_json_object_each_row_column_for_object_name = 'id'
```

이제 [`file()`](/sql-reference/functions/files.md/#file) FUNCTION을 사용하여 원본 JSON 파일에서 어떤 데이터가 로드되는지 확인할 수 있습니다.

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

다음과 같이 `id` 컬럼이 키 값으로 올바르게 채워진 것을 확인할 수 있습니다.

## JSON 배열 \{#json-arrays\}

공간을 절약하기 위해 JSON 파일이 객체 대신 배열로 인코딩되는 경우가 있습니다. 이 경우 [JSON 배열 목록](../assets/arrays.json)을 다루게 됩니다:

```bash
cat arrays.json
```

```response
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```

이 경우 ClickHouse는 이 데이터를 불러와 배열 내 순서에 따라 각 값을 해당 컬럼에 매핑합니다. 이를 위해 [`JSONCompactEachRow`](/interfaces/formats/JSONCompactEachRow) 포맷을 사용합니다:

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

### JSON 배열에서 개별 컬럼 가져오기 \{#importing-individual-columns-from-json-arrays\}

일부 경우에는 데이터가 행 단위가 아니라 컬럼 단위로 인코딩될 수 있습니다. 이 경우 상위 JSON 객체에 값이 포함된 컬럼들이 들어 있습니다. [다음 파일](../assets/columns.json)을 살펴보십시오:

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

ClickHouse는 다음과 같은 형식으로 작성된 데이터를 파싱하기 위해 [`JSONColumns`](/interfaces/formats/JSONColumns) 형식을 사용합니다.

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

객체 대신 [컬럼 배열](../assets/columns-array.json)을 다룰 때는 [`JSONCompactColumns`](/interfaces/formats/JSONCompactColumns) 포맷을 사용할 경우 더 간결한 형식도 지원합니다:

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

## JSON 객체를 파싱하지 않고 그대로 저장하기 \{#saving-json-objects-instead-of-parsing\}

JSON 객체를 파싱하지 않고 단일 `String`(또는 `JSON`) 컬럼에 그대로 저장하고자 하는 경우가 있습니다. 서로 다른 구조를 가진 JSON 객체 목록을 처리할 때 유용합니다. 예를 들어, 상위 목록 안에 서로 다른 JSON 객체가 여러 개 들어 있는 [이 파일](../assets/custom.json)을 살펴보겠습니다.

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

다음 테이블에 원본 JSON 객체를 저장하려고 합니다:

```sql
CREATE TABLE events
(
    `data` String
)
ENGINE = MergeTree
ORDER BY ()
```

이제 [`JSONAsString`](/interfaces/formats/JSONAsString) 포맷을 사용하여 파일의 데이터를 이 테이블에 로드하면서, JSON 객체를 파싱하는 대신 그대로 보존할 수 있습니다.

```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```

저장된 객체를 쿼리할 때는 [JSON 함수](/sql-reference/functions/json-functions.md)를 사용할 수 있습니다:

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

참고로 `JSONAsString`은 JSON 객체 하나가 한 줄(행)마다 있는 형식의 파일(일반적으로 `JSONEachRow` 포맷과 함께 사용됨)을 사용할 때에도 문제없이 동작합니다.

## 중첩 객체를 위한 스키마 \{#schema-for-nested-objects\}

[중첩 JSON 객체](../assets/list-nested.json)를 다루는 경우, 명시적인 스키마를 별도로 정의하고 복합 타입([`Array`](/sql-reference/data-types/array.md), [`JSON`](/integrations/data-formats/json/overview), [`Tuple`](/sql-reference/data-types/tuple.md))을 사용하여 데이터를 로드할 수 있습니다:

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

## 중첩된 JSON 객체에 접근하기 \{#accessing-nested-json-objects\}

[다음 설정 옵션](/operations/settings/settings-formats.md/#input_format_import_nested_json)을 활성화하면 [중첩된 JSON 키](../assets/list-nested.json)를 참조할 수 있습니다:

```sql
SET input_format_import_nested_json = 1
```

이를 통해 점 표기법(dot notation)을 사용하여 중첩된 JSON 객체 키를 참조할 수 있습니다(정상적으로 동작하도록 해당 키를 반드시 백틱(역따옴표) 기호로 감싸야 합니다).

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

이렇게 하면 중첩된 JSON 객체를 평탄화하거나 중첩된 값 일부를 별도의 컬럼으로 저장할 수 있습니다.

## 알 수 없는 컬럼 건너뛰기 \{#skipping-unknown-columns\}

기본적으로 ClickHouse는 JSON 데이터를 가져올 때 알 수 없는 컬럼을 무시합니다. `month` 컬럼 없이 원본 파일을 테이블로 가져와 보겠습니다.

```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```

이 테이블에는 3개의 컬럼을 가진 [원본 JSON 데이터](../assets/list.json)를 그대로 삽입할 수 있습니다:

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

ClickHouse는 데이터를 가져올 때 알 수 없는 컬럼을 무시합니다. 이 동작은 [input&#95;format&#95;skip&#95;unknown&#95;fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 설정 옵션으로 비활성화할 수 있습니다:

```sql
SET input_format_skip_unknown_fields = 0;
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
```

```response
Ok.
Exception on client:
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: month: (in file/uri /data/clickhouse/user_files/list.json): (at row 1)
```

ClickHouse는 JSON 구조와 테이블 컬럼 구조가 일치하지 않는 경우 예외를 발생시킵니다.

## BSON \{#bson\}

ClickHouse는 [BSON](https://bsonspec.org/) 인코딩된 파일로 데이터를 내보내고 가져오기를 지원합니다. 이 형식은 예를 들어 [MongoDB](https://github.com/mongodb/mongo) 데이터베이스와 같은 일부 DBMS에서 사용됩니다.

BSON 데이터를 가져올 때는 [BSONEachRow](/interfaces/formats/BSONEachRow) 형식을 사용합니다. [이 BSON 파일](../assets/data.bson)에서 데이터를 가져오겠습니다:

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

같은 형식을 사용하여 BSON 파일로도 내보낼 수 있습니다:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.bson'
FORMAT BSONEachRow
```

그다음에는 데이터가 `out.bson` 파일로 내보내집니다.

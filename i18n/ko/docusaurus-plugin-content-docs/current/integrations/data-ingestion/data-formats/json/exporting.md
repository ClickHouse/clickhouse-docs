---
'title': 'JSON 내보내기'
'slug': '/integrations/data-formats/json/exporting'
'description': 'ClickHouse에서 JSON 데이터를 내보내는 방법'
'keywords':
- 'json'
- 'clickhouse'
- 'formats'
- 'exporting'
'doc_type': 'guide'
---


# JSON 내보내기

가장 일반적으로 사용되는 JSON 형식은 거의 모든 가져오기 형식과 함께 내보내기에도 사용할 수 있습니다. 가장 인기 있는 형식은 [`JSONEachRow`](/interfaces/formats/JSONEachRow)입니다:

```sql
SELECT * FROM sometable FORMAT JSONEachRow
```
```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
```

또는 [`JSONCompactEachRow`](/interfaces/formats/JSONCompactEachRow)를 사용하여 컬럼 이름을 생략하여 디스크 공간을 절약할 수 있습니다:

```sql
SELECT * FROM sometable FORMAT JSONCompactEachRow
```
```response
["Bob_Dolman", "2016-11-01", 245]
["1-krona", "2017-01-01", 4]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]
```

## 문자열로 데이터 유형 재정의하기 {#overriding-data-types-as-strings}

ClickHouse는 데이터 유형을 존중하고 표준에 따라 JSON을 내보냅니다. 하지만 모든 값을 문자열로 인코딩해야 하는 경우 [JSONStringsEachRow](/interfaces/formats/JSONStringsEachRow) 형식을 사용할 수 있습니다:

```sql
SELECT * FROM sometable FORMAT JSONStringsEachRow
```
```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":"245"}
{"path":"1-krona","month":"2017-01-01","hits":"4"}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":"3"}
```

이제 `hits` 숫자형 컬럼이 문자열로 인코딩됩니다. 문자열로 내보내기는 모든 JSON* 형식에 대해 지원되며, `JSONStrings\*` 및 `JSONCompactStrings\*` 형식을 탐색하면 됩니다:

```sql
SELECT * FROM sometable FORMAT JSONCompactStringsEachRow
```
```response
["Bob_Dolman", "2016-11-01", "245"]
["1-krona", "2017-01-01", "4"]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", "3"]
```

## 데이터와 함께 메타데이터 내보내기 {#exporting-metadata-together-with-data}

일반 [JSON](/interfaces/formats/JSON) 형식은 앱에서 인기가 있으며, 결과 데이터뿐만 아니라 컬럼 유형 및 쿼리 통계도 내보냅니다:

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

[JSONCompact](/interfaces/formats/JSONCompact) 형식은 동일한 메타데이터를 출력하지만 데이터 자체에 대해 압축된 형식을 사용합니다:

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

모든 값을 문자열로 인코딩하기 위해 [`JSONStrings`](/interfaces/formats/JSONStrings) 또는 [`JSONCompactStrings`](/interfaces/formats/JSONCompactStrings) 변형을 고려하십시오.

## JSON 데이터와 구조를 내보내는 효율적인 방법 {#compact-way-to-export-json-data-and-structure}

데이터와 구조를 한 번에 처리하는 더 효율적인 방법은 [`JSONCompactEachRowWithNamesAndTypes`](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes) 형식을 사용하는 것입니다:

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

이 형식은 컬럼 이름과 유형을 포함한 두 개의 헤더 행이 선행된 압축 JSON 형식을 사용합니다. 이 형식은 다른 ClickHouse 인스턴스(또는 다른 앱)로 데이터를 삽입하는 데 사용할 수 있습니다.

## 파일로 JSON 내보내기 {#exporting-json-to-a-file}

내보낸 JSON 데이터를 파일로 저장하려면 [INTO OUTFILE](/sql-reference/statements/select/into-outfile.md) 절을 사용할 수 있습니다:

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json' FORMAT JSONEachRow
```
```response
36838935 rows in set. Elapsed: 2.220 sec. Processed 36.84 million rows, 1.27 GB (16.60 million rows/s., 572.47 MB/s.)
```

ClickHouse는 거의 3700만 개의 레코드를 JSON 파일로 내보내는 데 단 2초밖에 걸리지 않았습니다. `COMPRESSION` 절을 사용하여 즉석에서 압축을 활성화하여 내보낼 수도 있습니다:

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json.gz' FORMAT JSONEachRow
```
```response
36838935 rows in set. Elapsed: 22.680 sec. Processed 36.84 million rows, 1.27 GB (1.62 million rows/s., 56.02 MB/s.)
```

더 많은 시간이 소요되지만, 훨씬 더 작은 압축 파일을 생성합니다:

```bash
2.2G    out.json
576M    out.json.gz
```

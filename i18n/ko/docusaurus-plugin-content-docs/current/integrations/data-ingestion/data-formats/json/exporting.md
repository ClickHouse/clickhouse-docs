---
title: 'JSON 데이터 내보내기'
slug: /integrations/data-formats/json/exporting
description: 'ClickHouse에서 JSON 데이터를 내보내는 방법'
keywords: ['json', 'clickhouse', 'formats', 'exporting']
doc_type: 'guide'
---

# JSON 내보내기 \{#exporting-json\}

가져오기에 사용되는 거의 모든 JSON 형식은 내보내기에도 사용할 수 있습니다. 가장 널리 사용되는 형식은 [`JSONEachRow`](/interfaces/formats/JSONEachRow)입니다:

```sql
SELECT * FROM sometable FORMAT JSONEachRow
```

```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
```

또는 컬럼 이름을 생략하여 디스크 공간 사용량을 줄이기 위해 [`JSONCompactEachRow`](/interfaces/formats/JSONCompactEachRow)를 사용할 수도 있습니다.

```sql
SELECT * FROM sometable FORMAT JSONCompactEachRow
```

```response
["Bob_Dolman", "2016-11-01", 245]
["1-krona", "2017-01-01", 4]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]
```

## 문자열로 데이터 타입 재정의 \{#overriding-data-types-as-strings\}

ClickHouse는 데이터 타입을 준수하며 JSON을 표준에 맞게 내보냅니다. 그러나 모든 값을 문자열로 인코딩해야 하는 경우 [JSONStringsEachRow](/interfaces/formats/JSONStringsEachRow) 형식을 사용할 수 있습니다:

```sql
SELECT * FROM sometable FORMAT JSONStringsEachRow
```

```response
{"path":"Bob_Dolman","month":"2016-11-01","hits":"245"}
{"path":"1-krona","month":"2017-01-01","hits":"4"}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":"3"}
```

이제 `hits` 숫자 컬럼은 문자열로 인코딩됩니다. 문자열로 내보내기는 모든 JSON* 포맷에서 지원되며, `JSONStrings\*` 및 `JSONCompactStrings\*` 포맷을 살펴보십시오:

```sql
SELECT * FROM sometable FORMAT JSONCompactStringsEachRow
```

```response
["Bob_Dolman", "2016-11-01", "245"]
["1-krona", "2017-01-01", "4"]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", "3"]
```

## 데이터와 함께 메타데이터 내보내기 \{#exporting-metadata-together-with-data\}

애플리케이션에서 널리 사용되는 일반적인 [JSON](/interfaces/formats/JSON) 포맷은 결과 데이터뿐만 아니라 컬럼 타입과 쿼리 통계도 함께 내보냅니다.

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

[JSONCompact](/interfaces/formats/JSONCompact) 포맷은 동일한 메타데이터를 출력하지만, 데이터 자체는 보다 간결한 형식으로 표현합니다:

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

모든 값을 문자열로 인코딩하려면 [`JSONStrings`](/interfaces/formats/JSONStrings) 또는 [`JSONCompactStrings`](/interfaces/formats/JSONCompactStrings) 변형 형식을 사용하는 방안을 고려하십시오.

## JSON 데이터와 구조를 내보내는 간결한 방법 \{#compact-way-to-export-json-data-and-structure\}

데이터와 그 구조를 함께 보다 효율적으로 내보내려면 [`JSONCompactEachRowWithNamesAndTypes`](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes) 포맷을 사용하십시오:

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

이 방법은 컬럼 이름과 타입이 포함된 두 개의 헤더 행이 앞에 붙은 compact JSON 형식을 사용합니다. 이 형식은 이후 다른 ClickHouse 인스턴스(또는 다른 애플리케이션)로 데이터를 수집하는 데 사용할 수 있습니다.

## JSON을 파일로 내보내기 \{#exporting-json-to-a-file\}

내보낸 JSON 데이터를 파일에 저장하려면 [INTO OUTFILE](/sql-reference/statements/select/into-outfile.md) 절을 사용합니다:

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json' FORMAT JSONEachRow
```

```response
36838935 rows in set. Elapsed: 2.220 sec. Processed 36.84 million rows, 1.27 GB (16.60 million rows/s., 572.47 MB/s.)
```

ClickHouse는 약 3,700만 개의 레코드를 JSON 파일로 내보내는 데 단 2초가 걸렸습니다. 또한 `COMPRESSION` 절을 사용해 내보내면서 압축을 즉시 적용할 수도 있습니다:

```sql
SELECT * FROM sometable INTO OUTFILE 'out.json.gz' FORMAT JSONEachRow
```

```response
36838935 rows in set. Elapsed: 22.680 sec. Processed 36.84 million rows, 1.27 GB (1.62 million rows/s., 56.02 MB/s.)
```

수행하는 데는 시간이 더 오래 걸리지만, 훨씬 더 작은 크기의 압축 파일이 생성됩니다.

```bash
2.2G    out.json
576M    out.json.gz
```

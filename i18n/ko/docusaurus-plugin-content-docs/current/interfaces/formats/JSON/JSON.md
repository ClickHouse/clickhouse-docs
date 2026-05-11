---
alias: []
description: 'JSON 형식에 대한 문서'
input_format: true
keywords: ['JSON']
output_format: true
slug: /interfaces/formats/JSON
title: 'JSON'
doc_type: 'reference'
---

| 입력 | 출력 | 별칭 |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description \{#description\}

`JSON` 형식은 데이터를 JSON 형식으로 읽고 출력합니다. 

`JSON` 형식은 다음과 같은 내용을 반환합니다: 

| Parameter                    | Description                                                                                                                                                                                                                                |
|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `meta`                       | 컬럼 이름과 자료형.                                                                                                                                                                                                                        |
| `data`                       | 데이터 테이블.                                                                                                                                                                                                                             |
| `rows`                       | 출력 행의 총 개수.                                                                                                                                                                                                                         |
| `rows_before_limit_at_least` | LIMIT이 없었다면 존재했을 행 개수에 대한 하한 추정치. 쿼리에 LIMIT이 포함된 경우에만 출력됩니다. 이 추정치는 limit 변환 이전에 쿼리 파이프라인에서 처리된 데이터 블록들로부터 계산되지만, 이후 limit 변환에 의해 폐기될 수 있습니다. 쿼리 파이프라인에서 해당 블록들이 limit 변환에 도달하지 못한 경우, 추정에 포함되지 않습니다. |
| `statistics`                 | `elapsed`, `rows_read`, `bytes_read`와 같은 통계 정보.                                                                                                                                                                                     |
| `totals`                     | (WITH TOTALS를 사용하는 경우의) 총합 값.                                                                                                                                                                                                   |
| `extremes`                   | (extremes를 1로 설정한 경우의) 최소/최대 값.                                                                                                                                                                                               |

`JSON` 타입은 JavaScript와 호환됩니다. 이를 보장하기 위해 일부 문자는 추가로 이스케이프됩니다: 

- 슬래시 `/`는 `\/`로 이스케이프됩니다.
- 일부 브라우저에서 문제를 일으키는 대체 줄바꿈 `U+2028` 및 `U+2029`는 `\uXXXX`로 이스케이프됩니다. 
- ASCII 제어 문자는 이스케이프됩니다. 백스페이스, 폼 피드, 라인 피드, 캐리지 리턴, 수평 탭은 각각 `\b`, `\f`, `\n`, `\r`, `\t`로 대체되며, 00-1F 범위에 있는 나머지 바이트는 `\uXXXX` 시퀀스를 사용하여 이스케이프됩니다. 
- 잘못된 UTF-8 시퀀스는 대체 문자 �로 변경되어, 출력 텍스트가 유효한 UTF-8 시퀀스로만 구성되도록 합니다. 

JavaScript와의 호환성을 위해 Int64 및 UInt64 정수는 기본적으로 큰따옴표로 둘러싸여 출력됩니다. 
따옴표를 제거하려면 설정 파라미터 [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)를 `0`으로 설정하면 됩니다.

ClickHouse는 [NULL](/sql-reference/syntax.md)을 지원하며, JSON 출력에서는 `null`로 표시됩니다. 출력에서 `+nan`, `-nan`, `+inf`, `-inf` 값을 허용하려면 [output_format_json_quote_denormals](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)를 `1`로 설정합니다.

## 사용 예 \{#example-usage\}

예:

```sql
SELECT SearchPhrase, count() AS c FROM test.hits GROUP BY SearchPhrase WITH TOTALS ORDER BY c DESC LIMIT 5 FORMAT JSON
```

```json
{
        "meta":
        [
                {
                        "name": "num",
                        "type": "Int32"
                },
                {
                        "name": "str",
                        "type": "String"
                },
                {
                        "name": "arr",
                        "type": "Array(UInt8)"
                }
        ],

        "data":
        [
                {
                        "num": 42,
                        "str": "hello",
                        "arr": [0,1]
                },
                {
                        "num": 43,
                        "str": "hello",
                        "arr": [0,1,2]
                },
                {
                        "num": 44,
                        "str": "hello",
                        "arr": [0,1,2,3]
                }
        ],

        "rows": 3,

        "rows_before_limit_at_least": 3,

        "statistics":
        {
                "elapsed": 0.001137687,
                "rows_read": 3,
                "bytes_read": 24
        }
}
```


## 포맷 설정 \{#format-settings\}

JSON 입력 포맷의 경우, 설정 [`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata)이 `1`로 설정되어 있으면
입력 데이터 메타데이터에 있는 타입이 테이블의 해당 컬럼 타입과 비교됩니다.

## 함께 보기 \{#see-also\}

- [JSONEachRow](/interfaces/formats/JSONEachRow) 형식
- [output_format_json_array_of_rows](/operations/settings/settings-formats.md/#output_format_json_array_of_rows) 설정
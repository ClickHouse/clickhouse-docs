---
alias: []
description: 'JSONColumnsWithMetadata 형식에 대한 설명서'
input_format: true
keywords: ['JSONColumnsWithMetadata']
output_format: true
slug: /interfaces/formats/JSONColumnsWithMetadata
title: 'JSONColumnsWithMetadata'
doc_type: 'reference'
---

| 입력 | 출력 | 별칭 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 \{#description\}

[`JSONColumns`](./JSONColumns.md) 포맷과는 달리 메타데이터와 통계 정보를 함께 포함한다는 점에서 [`JSON`](./JSON.md) 포맷과 유사합니다.

:::note
`JSONColumnsWithMetadata` 포맷은 모든 데이터를 메모리에 버퍼링한 후 하나의 블록으로 출력하므로 메모리 사용량이 매우 높아질 수 있습니다.
:::

## 사용 예시 \{#example-usage\}

예시:

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
        {
                "num": [42, 43, 44],
                "str": ["hello", "hello", "hello"],
                "arr": [[0,1], [0,1,2], [0,1,2,3]]
        },

        "rows": 3,

        "rows_before_limit_at_least": 3,

        "statistics":
        {
                "elapsed": 0.000272376,
                "rows_read": 3,
                "bytes_read": 24
        }
}
```

`JSONColumnsWithMetadata` 입력 형식에서 [`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata) 설정 값이 `1`이면,
입력 데이터 메타데이터에 지정된 타입이 테이블의 해당 컬럼 타입과 비교됩니다.


## 형식 설정 \{#format-settings\}
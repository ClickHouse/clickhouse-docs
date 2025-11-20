---
'alias': []
'description': 'JSONColumnsWithMetadata 형식에 대한 Documentation'
'input_format': true
'keywords':
- 'JSONColumnsWithMetadata'
'output_format': true
'slug': '/interfaces/formats/JSONColumnsWithMetadata'
'title': 'JSONColumnsWithMetadata'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 설명 {#description}

[`JSONColumns`](./JSONColumns.md) 포맷과 달리 메타데이터와 통계 정보를 포함하고 있습니다 (이는 [`JSON`](./JSON.md) 포맷과 유사합니다).

:::note
`JSONColumnsWithMetadata` 포맷은 모든 데이터를 메모리에 버퍼링한 후 단일 블록으로 출력하므로, 높은 메모리 소비를 초래할 수 있습니다.
:::

## 사용 예시 {#example-usage}

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

`JSONColumnsWithMetadata` 입력 포맷의 경우, [`input_format_json_validate_types_from_metadata`](/operations/settings/settings-formats.md/#input_format_json_validate_types_from_metadata) 설정이 `1`로 설정되면,
입력 데이터의 메타데이터에서 유형이 테이블의 해당 컬럼의 유형과 비교됩니다.

## 포맷 설정 {#format-settings}

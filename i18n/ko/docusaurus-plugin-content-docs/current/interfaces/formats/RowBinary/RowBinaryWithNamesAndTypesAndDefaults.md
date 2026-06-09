---
alias: []
description: 'RowBinaryWithNamesAndTypesAndDefaults 포맷 문서'
input_format: true
keywords: ['RowBinaryWithNamesAndTypesAndDefaults']
output_format: false
slug: /interfaces/formats/RowBinaryWithNamesAndTypesAndDefaults
title: 'RowBinaryWithNamesAndTypesAndDefaults'
doc_type: '참고'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 입력 | 출력 | 별칭 |
| -- | -- | -- |
| ✔  | ✗  |    |

## 설명 \{#description\}

[`RowBinaryWithNamesAndTypes`](./RowBinaryWithNamesAndTypes.md) 포맷과 유사하지만, 각 셀 앞에 해당 컬럼의 `DEFAULT` 값을 사용해야 하는지를 나타내는 추가 바이트가 있습니다. 이는 [`RowBinaryWithDefaults`](./RowBinaryWithDefaults.md) 포맷과 정확히 동일합니다. 이 조합은 스키마가 변경되는 상황의 `INSERT`를 지원합니다. 즉, 작성기는 헤더에서 컬럼을 생략할 수 있으며(이 경우 대상 컬럼의 `DEFAULT`가 적용됨), 전송하는 컬럼에 대해서도 각 셀을 `NULL`과 혼동하지 않고 &quot;컬럼의 `DEFAULT` 사용&quot;으로 표시할 수 있습니다.

이 포맷은 입력 전용입니다.

## wire 형식 \{#wire-format\}

헤더는 [`RowBinaryWithNamesAndTypes`](./RowBinaryWithNamesAndTypes.md)와 동일합니다:

1. 컬럼 수 `N`을 나타내는 `VarUInt` 1개.
2. 컬럼 이름이 담긴 길이 접두사가 붙은 `String` `N`개.
3. `N`개의 컬럼 타입 — 텍스트 이름 또는 간결한 바이너리 인코딩 중 하나이며, `output_format_binary_encode_types_in_binary_format` / `input_format_binary_decode_types_in_binary_format` 설정으로 제어됩니다.

헤더 다음에는 각 행이 `N`개의 셀로 구성됩니다. 각 셀에는 다음이 포함됩니다:

* `UInt8` 마커 바이트 1개.
  * `0x01` — 대상 컬럼의 `DEFAULT` 표현식을 사용합니다. 뒤따르는 값 바이트는 없습니다.
  * `0x00` — 값이 뒤따르며, 컬럼 타입의 `RowBinary` 직렬화기를 통해 직렬화됩니다. `Nullable(T)`의 경우 값 바이트는 `Nullable` null 바이트(널이 아니면 `0`, `NULL`이면 `1`)로 시작하고, 널이 아닌 경우 그 뒤에 내부 값이 이어집니다.

## 기본값과 NULL \{#defaults-vs-null\}

셀 단위 기본값 마커와 `Nullable`의 내장 NULL 바이트는 서로 독립적입니다. `Nullable(UInt32) DEFAULT 42` 컬럼은 각 행에서 세 가지 방식으로 전송될 수 있습니다:

| 바이트       | 의미                                            |
| --------- | --------------------------------------------- |
| `01`      | `DEFAULT 42`를 사용합니다.                          |
| `00 01`   | 값 경로를 사용한 뒤, `Nullable` 유형을 통해 `NULL`을 나타냅니다. |
| `00 00 …` | 값 경로를 사용한 뒤, null이 아닌 내부 값을 나타냅니다.            |

## 스키마 진화 \{#schema-evolution\}

| 경우                            | 동작                                                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 파일의 헤더에 컬럼이 완전히 없는 경우         | `insertDefaultsForNotSeenColumns`를 통해 대상에 채워지며, `defaults_for_omitted_fields` 설정의 적용을 받습니다.                          |
| 헤더에 컬럼이 있고, 셀 마커가 `0x01`인 경우  | 각 행에 `insertDefault`가 적용됩니다.                                                                                         |
| 헤더에 컬럼이 있고, 셀 마커가 `0x00`인 경우  | 값이 일반적으로 파싱됩니다.                                                                                                      |
| 헤더에 추가 컬럼이 있지만 대상 테이블에는 없는 경우 | `input_format_skip_unknown_fields = 1`이면 자동으로 무시됩니다(먼저 마커를 읽으며, `0x01`이면 추가 작업은 없고, `0x00`이면 지정된 유형의 값을 파싱한 뒤 버립니다). |

## 사용 예시 \{#example-usage\}

```sql title="Query"
SELECT * FROM format(
    'RowBinaryWithNamesAndTypesAndDefaults',
    'x Nullable(UInt32) DEFAULT 42',
    unhex('01' || '0178' || '10' || hex('Nullable(UInt32)') || '01')
);
```

```response title="Response"
┌──x─┐
│ 42 │
└────┘
```

* 헤더에는 `Nullable(UInt32)` 유형의 `x`라는 이름의 컬럼 1개가 있습니다.
* 단일 셀은 `0x01` 마커를 사용하며, 이는 &quot;`DEFAULT 42` 사용&quot;을 의미합니다.

## 포맷 설정 \{#format-settings\}

<RowBinaryFormatSettings />
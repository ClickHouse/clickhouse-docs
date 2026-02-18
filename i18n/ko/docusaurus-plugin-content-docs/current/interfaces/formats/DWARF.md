---
alias: []
description: 'DWARF 형식 문서'
input_format: true
keywords: ['DWARF']
output_format: false
slug: /interfaces/formats/DWARF
title: 'DWARF'
doc_type: 'reference'
---

| 입력 | 출력  | 별칭 |
|-------|---------|-------|
| ✔     | ✗       |       |

## 설명 \{#description\}

`DWARF` 형식은 ELF 파일(실행 파일, 라이브러리, 오브젝트 파일)에서 DWARF 디버그 심볼을 파싱합니다.  
`dwarfdump`와 유사하지만 훨씬 빠르며(초당 수백 MB) SQL을 지원합니다.  
`.debug_info` 섹션 내 각 Debug Information Entry(DIE)마다 하나의 행을 생성하며,  
DWARF 인코딩이 트리에서 자식 목록을 종료하기 위해 사용하는 "null" 엔트리도 포함합니다.

:::info
`.debug_info`는 컴파일 단위에 대응하는 *unit*들로 구성됩니다:

- 각 unit은 `compile_unit` DIE를 루트로 하는 *DIE* 트리입니다.  
- 각 DIE에는 *tag*와 *attribute* 목록이 있습니다.  
- 각 attribute에는 *name*과 *value*가 있으며, value가 어떻게 인코딩되는지 지정하는 *form*도 있습니다.  

DIE는 소스 코드의 다양한 요소를 나타내며, 그 *tag*가 어떤 종류의 요소인지 알려줍니다. 예를 들어 다음과 같습니다:

- 함수(tag = `subprogram`)
- 클래스/구조체/열거형(`class_type`/`structure_type`/`enumeration_type`)
- 변수(`variable`)
- 함수 인자(`formal_parameter`).

트리 구조는 해당 소스 코드 구조를 그대로 반영합니다. 예를 들어, `class_type` DIE는 클래스의 메서드를 나타내는 `subprogram` DIE들을 포함할 수 있습니다.
:::

`DWARF` 형식은 다음과 같은 컬럼을 출력합니다:

- `offset` - `.debug_info` 섹션에서 DIE의 위치
- `size` - 인코딩된 DIE의 바이트 수(attribute 포함)
- `tag` - DIE의 타입; 관례적인 "DW_TAG_" 접두사는 생략됩니다
- `unit_name` - 이 DIE를 포함하는 컴파일 단위 이름
- `unit_offset` - 이 DIE를 포함하는 컴파일 단위의 `.debug_info` 섹션 내 위치
- `ancestor_tags` - 트리에서 현재 DIE의 조상 태그 배열로, 가장 안쪽에서 바깥쪽 순서로 나열됩니다
- `ancestor_offsets` - 조상들의 offset 배열로, `ancestor_tags`와 1:1로 대응합니다
- 편의를 위해 속성(attributes) 배열에서 일부 공통 attribute를 복제한 컬럼:
  - `name`
  - `linkage_name` - 망글링된 완전 한정 이름; 일반적으로 함수에만 존재하지만 모든 함수에 있는 것은 아닙니다
  - `decl_file` - 이 엔티티가 선언된 소스 코드 파일 이름
  - `decl_line` - 이 엔티티가 선언된 소스 코드의 행 번호
- attribute를 설명하는 병렬 배열:
  - `attr_name` - attribute 이름; 관례적인 "DW_AT_" 접두사는 생략됩니다
  - `attr_form` - attribute가 어떻게 인코딩되고 해석되는지; 관례적인 DW_FORM_ 접두사는 생략됩니다
  - `attr_int` - attribute의 정수 값; 숫자 값이 없는 attribute인 경우 0
  - `attr_str` - attribute의 문자열 값; 문자열 값이 없는 attribute인 경우 빈 문자열

## 사용 예시 \{#example-usage\}

`DWARF` 형식은 템플릿 인스턴스화 및 포함된 헤더 파일의 함수까지 포함하여 가장 많은 함수 정의를 가진 컴파일 단위를 찾는 데 사용할 수 있습니다:

```sql title="Query"
SELECT
    unit_name,
    count() AS c
FROM file('programs/clickhouse', DWARF)
WHERE tag = 'subprogram' AND NOT has(attr_name, 'declaration')
GROUP BY unit_name
ORDER BY c DESC
LIMIT 3
```

```text title="Response"
┌─unit_name──────────────────────────────────────────────────┬─────c─┐
│ ./src/Core/Settings.cpp                                    │ 28939 │
│ ./src/AggregateFunctions/AggregateFunctionSumMap.cpp       │ 23327 │
│ ./src/AggregateFunctions/AggregateFunctionUniqCombined.cpp │ 22649 │
└────────────────────────────────────────────────────────────┴───────┘

3 rows in set. Elapsed: 1.487 sec. Processed 139.76 million rows, 1.12 GB (93.97 million rows/s., 752.77 MB/s.)
Peak memory usage: 271.92 MiB.
```


## 형식 설정 \{#format-settings\}
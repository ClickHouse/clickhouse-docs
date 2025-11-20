---
'alias': []
'description': 'DWARF 형식에 대한 Documentation'
'input_format': true
'keywords':
- 'DWARF'
'output_format': false
'slug': '/interfaces/formats/DWARF'
'title': 'DWARF'
'doc_type': 'reference'
---

| Input | Output  | Alias |
|-------|---------|-------|
| ✔     | ✗       |       |

## 설명 {#description}

`DWARF` 포맷은 ELF 파일(실행 파일, 라이브러리 또는 오브젝트 파일)에서 DWARF 디버그 심볼을 구문 분석합니다. 
이 포맷은 `dwarfdump`와 유사하지만 훨씬 빠르며(수백 MB/s) SQL을 지원합니다. 
`.debug_info` 섹션의 각 디버그 정보 항목(DIE)에 대해 하나의 행을 생성하며 
트리 구조에서 자식 목록을 종료하는 데 DWARF 인코딩이 사용하는 "null" 항목을 포함합니다.

:::info
`.debug_info`는 컴파일 유닛에 해당하는 *units*로 구성됩니다: 
- 각 유닛은 `compile_unit` DIE를 루트로 가지는 *DIE*의 트리입니다. 
- 각 DIE는 *tag*와 *attributes* 목록을 가집니다. 
- 각 속성에는 *name*과 *value*가 있으며(그리고 *form*도 있어, 값이 어떻게 인코딩되는지 명시합니다). 

DIE는 소스 코드의 내용을 나타내며, *tag*는 그것이 어떤 종류인지 알려줍니다. 예를 들어, 다음과 같은 것들이 있습니다:

- 함수(tag = `subprogram`)
- 클래스/구조체/열거형(`class_type`/`structure_type`/`enumeration_type`)
- 변수(`variable`)
- 함수 인자(`formal_parameter`).

트리 구조는 해당 소스 코드를 반영합니다. 예를 들어, `class_type` DIE는 클래스의 메서드를 나타내는 `subprogram` DIE를 포함할 수 있습니다.
:::

`DWARF` 포맷은 다음과 같은 컬럼을 출력합니다:

- `offset` - `.debug_info` 섹션에서 DIE의 위치
- `size` - 인코딩된 DIE의 바이트 수(속성 포함)
- `tag` - DIE의 타입; 일반적인 "DW_TAG_" 접두사는 생략됩니다
- `unit_name` - 이 DIE를 포함하는 컴파일 유닛의 이름
- `unit_offset` - `.debug_info` 섹션에서 이 DIE를 포함하는 컴파일 유닛의 위치
- `ancestor_tags` - 트리에서 현재 DIE의 조상 태그 배열, 내부에서 외부로의 순서
- `ancestor_offsets` - `ancestor_tags`에 평행한 조상의 오프셋
- 편의를 위해 속성 배열에서 복제된 몇 가지 공통 속성:
  - `name`
  - `linkage_name` - 난독화된 완전한 자격 이름; 일반적으로 함수만 가지며(하지만 모든 함수는 아닙니다)
  - `decl_file` - 이 엔티티가 선언된 소스 코드 파일의 이름
  - `decl_line` - 이 엔티티가 선언된 소스 코드의 줄 번호
- 속성을 설명하는 평행 배열:
  - `attr_name` - 속성의 이름; 일반적인 "DW_AT_" 접두사는 생략됩니다
  - `attr_form` - 속성이 인코딩되고 해석되는 방식; 일반적인 DW_FORM_ 접두사는 생략됩니다
  - `attr_int` - 속성의 정수 값; 속성이 숫자 값을 가지지 않으면 0
  - `attr_str` - 속성의 문자열 값; 속성이 문자열 값을 가지지 않으면 비어 있음

## 예제 사용 {#example-usage}

`DWARF` 포맷은 템플릿 인스턴스화 및 포함된 헤더 파일에서의 함수를 포함하여 가장 많은 함수 정의를 가진 컴파일 유닛을 찾는 데 사용할 수 있습니다:

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

## 포맷 설정 {#format-settings}

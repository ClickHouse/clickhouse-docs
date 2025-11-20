---
'alias': []
'description': 'One 포맷에 대한 Documentation'
'input_format': true
'keywords':
- 'One'
'output_format': false
'slug': '/interfaces/formats/One'
'title': '하나'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## 설명 {#description}

`One` 포맷은 파일에서 어떤 데이터도 읽지 않고, `dummy`라는 이름의 [`UInt8`](../../sql-reference/data-types/int-uint.md) 타입 컬럼이 있는 단일 행만 반환하는 특별한 입력 포맷입니다 (예: `system.one` 테이블처럼). 실제 데이터를 읽지 않고도 `_file/_path`와 같은 가상 컬럼을 사용하여 모든 파일을 나열할 수 있습니다.

## 사용 예시 {#example-usage}

예시:

```sql title="Query"
SELECT _file FROM file('path/to/files/data*', One);
```

```text title="Response"
┌─_file────┐
│ data.csv │
└──────────┘
┌─_file──────┐
│ data.jsonl │
└────────────┘
┌─_file────┐
│ data.tsv │
└──────────┘
┌─_file────────┐
│ data.parquet │
└──────────────┘
```

## 포맷 설정 {#format-settings}

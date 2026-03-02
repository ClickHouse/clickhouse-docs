---
alias: []
description: 'One 포맷에 대한 문서'
input_format: true
keywords: ['One']
output_format: false
slug: /interfaces/formats/One
title: 'One'
doc_type: 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |



## 설명 \{#description\}

`One` 포맷은 파일에서 어떤 데이터도 읽지 않고 [`UInt8`](../../sql-reference/data-types/int-uint.md) 타입의 컬럼 하나를 가진 한 행(row)만을 반환하는 특수 입력 포맷입니다. 이 컬럼의 이름은 `dummy`이고 값은 `0`으로, `system.one` 테이블과 동일합니다.
가상 컬럼 `_file/_path`와 함께 사용하여 실제 데이터를 읽지 않고도 모든 파일을 나열하는 데 사용할 수 있습니다.



## 사용 예시 \{#example-usage\}

예제:

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


## 형식 설정 \{#format-settings\}
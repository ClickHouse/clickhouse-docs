---
alias: []
description: 'Regexp 형식에 대한 문서'
input_format: true
keywords: ['Regexp']
output_format: false
slug: /interfaces/formats/Regexp
title: 'Regexp'
doc_type: 'reference'
---

| 입력 | 출력 | 별칭 |
|-------|--------|-------|
| ✔     | ✗      |       |



## 설명 \{#description\}

`Regex` 포맷은 제공된 정규 표현식에 따라 가져온 데이터의 각 행을 파싱합니다.

**사용 방법**

[format_regexp](/operations/settings/settings-formats.md/#format_regexp) 설정에 지정된 정규 표현식이 가져온 데이터의 각 행에 적용됩니다. 정규 표현식의 서브패턴 개수는 가져온 데이터셋의 컬럼 개수와 같아야 합니다.

가져온 데이터의 행은 개행 문자 `'\n'` 또는 DOS 스타일 개행 `"\r\n"`으로 구분되어야 합니다.

매칭된 각 서브패턴의 내용은 [format_regexp_escaping_rule](/operations/settings/settings-formats.md/#format_regexp_escaping_rule) 설정에 따라, 해당 데이터 타입에 맞는 방식으로 파싱됩니다.

정규 표현식이 행과 매칭되지 않고 [format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_escaping_rule)이 1로 설정된 경우 해당 행은 별도의 오류 없이 건너뜁니다. 그렇지 않으면 예외가 발생합니다.



## 사용 예시 \{#example-usage\}

`data.tsv` 파일을 예로 들어 보겠습니다:

```text title="data.tsv"
id: 1 array: [1,2,3] string: str1 date: 2020-01-01
id: 2 array: [1,2,3] string: str2 date: 2020-01-02
id: 3 array: [1,2,3] string: str3 date: 2020-01-03
```

및 `imp_regex_table` 테이블:

```sql
CREATE TABLE imp_regex_table (id UInt32, array Array(UInt32), string String, date Date) ENGINE = Memory;
```

앞에서 언급한 파일의 데이터를 다음 쿼리를 사용하여 위 테이블에 삽입합니다:

```bash
$ cat data.tsv | clickhouse-client  --query "INSERT INTO imp_regex_table SETTINGS format_regexp='id: (.+?) array: (.+?) string: (.+?) date: (.+?)', format_regexp_escaping_rule='Escaped', format_regexp_skip_unmatched=0 FORMAT Regexp;"
```

이제 테이블에서 데이터를 `SELECT`하여 `Regex` 포맷을 사용해 파일의 데이터가 어떻게 파싱되었는지 확인할 수 있습니다:

```sql title="Query"
SELECT * FROM imp_regex_table;
```

```text title="Response"
┌─id─┬─array───┬─string─┬───────date─┐
│  1 │ [1,2,3] │ str1   │ 2020-01-01 │
│  2 │ [1,2,3] │ str2   │ 2020-01-02 │
│  3 │ [1,2,3] │ str3   │ 2020-01-03 │
└────┴─────────┴────────┴────────────┘
```


## 포맷 설정 \{#format-settings\}

`Regexp` 포맷으로 작업할 때는 다음 설정을 사용할 수 있습니다:

- `format_regexp` — [String](/sql-reference/data-types/string.md). [re2](https://github.com/google/re2/wiki/Syntax) 포맷의 정규 표현식을 포함합니다.
- `format_regexp_escaping_rule` — [String](/sql-reference/data-types/string.md). 다음 이스케이프 규칙을 지원합니다:

  - CSV ([CSV](/interfaces/formats/CSV)와 유사)
  - JSON ([JSONEachRow](/interfaces/formats/JSONEachRow)와 유사)
  - Escaped ([TSV](/interfaces/formats/TabSeparated)와 유사)
  - Quoted ([Values](/interfaces/formats/Values)와 유사)
  - Raw (하위 패턴을 전체로 추출하며, 이스케이프 규칙은 없고 [TSVRaw](/interfaces/formats/TabSeparated)와 유사)

- `format_regexp_skip_unmatched` — [UInt8](/sql-reference/data-types/int-uint.md). `format_regexp` 표현식이 가져온 데이터와 일치하지 않는 경우 예외를 발생시켜야 하는지를 지정합니다. `0` 또는 `1`로 설정할 수 있습니다.

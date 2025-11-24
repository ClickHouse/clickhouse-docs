---
'alias': []
'description': 'Regexp 형식에 대한 Documentation'
'input_format': true
'keywords':
- 'Regexp'
'output_format': false
'slug': '/interfaces/formats/Regexp'
'title': 'Regexp'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## 설명 {#description}

`Regex` 포맷은 제공된 정규 표현식에 따라 가져온 데이터의 각 행을 구문 분석합니다.

**사용법**

[format_regexp](/operations/settings/settings-formats.md/#format_regexp) 설정의 정규 표현식이 가져온 데이터의 각 행에 적용됩니다. 정규 표현식의 서브패턴 수는 가져온 데이터 세트의 컬럼 수와 같아야 합니다.

가져온 데이터의 행은 줄 바꿈 문자 `'\n'` 또는 DOS 스타일 줄 바꿈 `"\r\n"`으로 구분되어야 합니다.

각 일치하는 서브패턴의 내용은 해당 데이터 유형의 메소드로 구문 분석되며, 이는 [format_regexp_escaping_rule](/operations/settings/settings-formats.md/#format_regexp_escaping_rule) 설정에 따릅니다.

정규 표현식이 행과 일치하지 않으며 [format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_escaping_rule) 가 1로 설정된 경우, 해당 행은 조용히 건너뛰어집니다. 그렇지 않으면 예외가 발생합니다.

## 예제 사용법 {#example-usage}

`data.tsv` 파일과:

```text title="data.tsv"
id: 1 array: [1,2,3] string: str1 date: 2020-01-01
id: 2 array: [1,2,3] string: str2 date: 2020-01-02
id: 3 array: [1,2,3] string: str3 date: 2020-01-03
```
`imp_regex_table` 테이블:

```sql
CREATE TABLE imp_regex_table (id UInt32, array Array(UInt32), string String, date Date) ENGINE = Memory;
```

위에서 언급한 파일의 데이터를 위 테이블에 삽입하기 위한 쿼리는 다음과 같습니다:

```bash
$ cat data.tsv | clickhouse-client  --query "INSERT INTO imp_regex_table SETTINGS format_regexp='id: (.+?) array: (.+?) string: (.+?) date: (.+?)', format_regexp_escaping_rule='Escaped', format_regexp_skip_unmatched=0 FORMAT Regexp;"
```

이제 `SELECT` 쿼리를 사용하여 테이블에서 데이터를 조회하고 `Regex` 포맷이 파일에서 데이터를 어떻게 구문 분석했는지 확인할 수 있습니다:

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

## 포맷 설정 {#format-settings}

`Regexp` 포맷으로 작업할 때 다음 설정을 사용할 수 있습니다:

- `format_regexp` — [문자열](/sql-reference/data-types/string.md). [re2](https://github.com/google/re2/wiki/Syntax) 포맷의 정규 표현식을 포함합니다.
- `format_regexp_escaping_rule` — [문자열](/sql-reference/data-types/string.md). 다음의 이스케이프 규칙이 지원됩니다:

  - CSV (유사하게 [CSV](/interfaces/formats/CSV))
  - JSON (유사하게 [JSONEachRow](/interfaces/formats/JSONEachRow))
  - 이스케이프 (유사하게 [TSV](/interfaces/formats/TabSeparated))
  - 인용 (유사하게 [Values](/interfaces/formats/Values))
  - 원시 (서브패턴을 통째로 추출, 이스케이프 규칙 없음, 유사하게 [TSVRaw](/interfaces/formats/TabSeparated))

- `format_regexp_skip_unmatched` — [UInt8](/sql-reference/data-types/int-uint.md). `format_regexp` 표현식이 가져온 데이터와 일치하지 않는 경우 예외를 발생시킬 필요를 정의합니다. `0` 또는 `1`로 설정할 수 있습니다.

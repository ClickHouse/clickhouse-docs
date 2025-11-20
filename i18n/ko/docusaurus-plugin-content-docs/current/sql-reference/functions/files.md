---
'description': '문서화된 Files'
'sidebar_label': '파일'
'slug': '/sql-reference/functions/files'
'title': '파일'
'doc_type': 'reference'
---

## file {#file}

파일을 문자열로 읽고 지정된 컬럼에 데이터를 로드합니다. 파일 내용은 해석되지 않습니다.

또한 테이블 함수 [file](../table-functions/file.md)를 참조하십시오.

**구문**

```sql
file(path[, default])
```

**인수**

- `path` — [user_files_path](../../operations/server-configuration-parameters/settings.md#user_files_path)에 상대적인 파일의 경로입니다. 와일드카드 `*`, `**`, `?`, `{abc,def}` 및 `{N..M}`을 지원합니다. 여기서 `N` 및 `M`은 숫자이고, `'abc', 'def'`는 문자열입니다.
- `default` — 파일이 존재하지 않거나 접근할 수 없는 경우 반환되는 값입니다. 지원되는 데이터 유형: [String](../data-types/string.md) 및 [NULL](/operations/settings/formats#input_format_null_as_default).

**예시**

a.txt 및 b.txt 파일에서 문자열로 데이터를 테이블에 삽입하는 예시:

```sql
INSERT INTO table SELECT file('a.txt'), file('b.txt');
```

---
description: 'Files 문서'
sidebar_label: 'Files'
slug: /sql-reference/functions/files
title: 'Files'
doc_type: 'reference'
---

## file \{#file\}

파일을 문자열로 읽어 지정된 컬럼에 데이터를 적재합니다. 이때 파일 내용은 해석되지 않습니다.

테이블 함수 [file](../table-functions/file.md)도 참고하십시오.

**구문**

```sql
file(path[, default])
```

**인수**

* `path` — [user&#95;files&#95;path](../../operations/server-configuration-parameters/settings.md#user_files_path)를 기준으로 한 파일의 상대 경로입니다. 와일드카드 `*`, `**`, `?`, `{abc,def}`, `{N..M}`을 지원하며, 여기서 `N`, `M`은 숫자이고 `'abc'`, `'def'`는 문자열입니다.
* `default` — 파일이 존재하지 않거나 접근할 수 없을 때 반환되는 값입니다. 지원하는 데이터 타입: [String](../data-types/string.md) 및 [NULL](/operations/settings/formats#input_format_null_as_default).

**예시**

파일 a.txt와 b.txt에서 문자열 형태로 데이터를 읽어 테이블에 삽입합니다:

```sql
INSERT INTO table SELECT file('a.txt'), file('b.txt');
```

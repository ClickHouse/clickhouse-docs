---
'description': 'INTO OUTFILE 절에 대한 문서'
'sidebar_label': 'INTO OUTFILE'
'slug': '/sql-reference/statements/select/into-outfile'
'title': 'INTO OUTFILE 절'
'doc_type': 'reference'
---


# INTO OUTFILE 절

`INTO OUTFILE` 절은 `SELECT` 쿼리의 결과를 **클라이언트** 측의 파일로 리다이렉트합니다.

압축 파일이 지원됩니다. 압축 유형은 파일 이름의 확장자에 의해 감지됩니다 (기본값으로 `'auto'` 모드가 사용됩니다). 또는 `COMPRESSION` 절에서 명시적으로 지정할 수 있습니다. 특정 압축 유형에 대한 압축 수준은 `LEVEL` 절에서 지정할 수 있습니다.

**문법**

```sql
SELECT <expr_list> INTO OUTFILE file_name [AND STDOUT] [APPEND | TRUNCATE] [COMPRESSION type [LEVEL level]]
```

`file_name` 및 `type`은 문자열 리터럴입니다. 지원되는 압축 유형은 다음과 같습니다: `'none'`, `'gzip'`, `'deflate'`, `'br'`, `'xz'`, `'zstd'`, `'lz4'`, `'bz2'`.

`level`은 숫자 리터럴입니다. 다음 범위의 양의 정수가 지원됩니다: `1-12`는 `lz4` 유형, `1-22`는 `zstd` 유형 및 `1-9`는 기타 압축 유형에 대해 사용됩니다.

## 구현 세부 사항 {#implementation-details}

- 이 기능은 [명령줄 클라이언트](../../../interfaces/cli.md)와 [clickhouse-local](../../../operations/utilities/clickhouse-local.md)에서 사용할 수 있습니다. 따라서 [HTTP 인터페이스](../../../interfaces/http.md)를 통해 전송된 쿼리는 실패합니다.
- 동일한 파일 이름을 가진 파일이 이미 존재하는 경우 쿼리는 실패합니다.
- 기본 [출력 형식](../../../interfaces/formats.md)은 `TabSeparated`입니다 (명령줄 클라이언트 배치 모드와 유사). 이를 변경하려면 [FORMAT](format.md) 절을 사용하세요.
- 쿼리에 `AND STDOUT`가 언급되면 파일에 기록된 출력이 표준 출력에도 표시됩니다. 압축과 함께 사용되는 경우 평문이 표준 출력에 표시됩니다.
- 쿼리에 `APPEND`가 언급되면 출력이 기존 파일에 추가됩니다. 압축을 사용할 경우 추가 기능은 사용할 수 없습니다.
- 이미 존재하는 파일에 쓸 때는 `APPEND` 또는 `TRUNCATE`를 사용해야 합니다.

**예제**

다음 쿼리를 [명령줄 클라이언트](../../../interfaces/cli.md)를 사용하여 실행합니다:

```bash
clickhouse-client --query="SELECT 1,'ABC' INTO OUTFILE 'select.gz' FORMAT CSV;"
zcat select.gz 
```

결과:

```text
1,"ABC"
```

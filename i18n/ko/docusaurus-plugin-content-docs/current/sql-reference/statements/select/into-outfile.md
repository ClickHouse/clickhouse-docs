---
description: 'INTO OUTFILE 절 문서'
sidebar_label: 'INTO OUTFILE'
slug: /sql-reference/statements/select/into-outfile
title: 'INTO OUTFILE 절'
doc_type: 'reference'
---

# INTO OUTFILE 절 \{#into-outfile-clause\}

`INTO OUTFILE` 절은 `SELECT` 쿼리의 결과를 **클라이언트** 측 파일로 리디렉션합니다.

압축 파일도 지원합니다. 압축 유형은 파일 이름의 확장자로 감지되며(기본값은 `'auto'` 모드), `COMPRESSION` 절에서 명시적으로 지정할 수도 있습니다. 특정 압축 유형에 대한 압축 수준은 `LEVEL` 절에서 지정할 수 있습니다.

**구문**

```sql
SELECT <expr_list> INTO OUTFILE file_name [AND STDOUT] [APPEND | TRUNCATE] [COMPRESSION type [LEVEL level]]
```

`file_name`과 `type`은 문자열 리터럴입니다. 지원되는 압축 유형은 다음과 같습니다: `'none'`, `'gzip'`, `'deflate'`, `'br'`, `'xz'`, `'zstd'`, `'lz4'`, `'bz2'`.

`level`은 숫자 리터럴입니다. 지원되는 양의 정수 범위는 다음과 같습니다: `lz4` 유형은 `1-12`, `zstd` 유형은 `1-22`, 그 밖의 다른 압축 유형은 `1-9`입니다.

## 구현 세부 사항 \{#implementation-details\}

* 이 기능은 [command-line client](../../../interfaces/cli.md) 및 [clickhouse-local](../../../operations/utilities/clickhouse-local.md)에서 사용할 수 있습니다. 따라서 [HTTP 인터페이스](/interfaces/http)를 통해 전송된 쿼리는 실패합니다.
* 동일한 파일 이름의 파일이 이미 존재하는 경우 쿼리는 실패합니다.
* 기본 [출력 형식](../../../interfaces/formats.md)은 `TabSeparated`입니다 (command-line client 배치 모드와 동일합니다). 이를 변경하려면 [FORMAT](format.md) 절을 사용하십시오.
* 쿼리에 `AND STDOUT`가 지정되면 파일로 기록되는 출력이 표준 출력에도 표시됩니다. 압축을 사용하는 경우 평문이 표준 출력에 표시됩니다.
* 쿼리에 `APPEND`가 지정되면 출력이 기존 파일에 이어서 기록됩니다. 압축을 사용하는 경우에는 `APPEND`를 사용할 수 없습니다.
* 이미 존재하는 파일에 기록할 때에는 `APPEND` 또는 `TRUNCATE`를 사용해야 합니다.

**예시**

다음 쿼리를 [command-line client](../../../interfaces/cli.md)를 사용하여 실행하십시오:

```bash
clickhouse-client --query="SELECT 1,'ABC' INTO OUTFILE 'select.gz' FORMAT CSV;"
zcat select.gz 
```

결과:

```text
1,"ABC"
```

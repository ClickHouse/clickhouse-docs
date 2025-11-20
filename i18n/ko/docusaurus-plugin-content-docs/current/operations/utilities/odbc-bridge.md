---
'description': 'Odbc Bridge에 대한 문서'
'slug': '/operations/utilities/odbc-bridge'
'title': 'clickhouse-odbc-bridge'
'doc_type': 'reference'
---

간단한 HTTP 서버로 ODBC 드라이버에 대한 프록시 역할을 하는 툴입니다. 주요 동기는 ODBC 구현에서 발생할 수 있는 세그멘트 오류나 다른 오류로 인해 전체 clickhouse-server 프로세스가 중단될 수 있기 때문입니다.

이 도구는 HTTP를 통해 작동하며, 파이프, 공유 메모리 또는 TCP를 사용하지 않는 이유는 다음과 같습니다:
- 구현이 더 간단합니다.
- 디버깅이 더 간단합니다.
- jdbc-bridge를 같은 방식으로 구현할 수 있습니다.

## 사용법 {#usage}

`clickhouse-server`는 ODBC 테이블 함수와 StorageODBC 안에서 이 도구를 사용합니다. 그러나 다음 매개변수를 포함한 POST 요청 URL을 통해 독립형 도구로도 사용할 수 있습니다:
- `connection_string` -- ODBC 연결 문자열.
- `sample_block` -- ClickHouse NamesAndTypesList 형식의 컬럼 설명, 백틱으로 감싸인 이름,
  문자열로서의 타입. 이름과 타입은 공백으로 구분되며, 행은 개행으로 구분됩니다.
- `max_block_size` -- 선택적 매개변수로, 단일 블록의 최대 크기를 설정합니다. 쿼리는 POST 본문에 전송됩니다. 응답은 RowBinary 형식으로 반환됩니다.

## 예제: {#example}

```bash
$ clickhouse-odbc-bridge --http-port 9018 --daemon

$ curl -d "query=SELECT PageID, ImpID, AdType FROM Keys ORDER BY PageID, ImpID" --data-urlencode "connection_string=DSN=ClickHouse;DATABASE=stat" --data-urlencode "sample_block=columns format version: 1
3 columns:
\`PageID\` String
\`ImpID\` String
\`AdType\` String
"  "http://localhost:9018/" > result.txt

$ cat result.txt
12246623837185725195925621517
```

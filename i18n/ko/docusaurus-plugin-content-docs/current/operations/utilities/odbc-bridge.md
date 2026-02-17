---
description: 'Odbc Bridge에 대한 문서'
slug: /operations/utilities/odbc-bridge
title: 'clickhouse-odbc-bridge'
doc_type: 'reference'
---

ODBC 드라이버에 대한 프록시처럼 동작하는 단순한 HTTP 서버입니다. 이 도구를 사용하는 주된 이유는
ODBC 구현에서 발생할 수 있는 세그멘테이션 폴트(segmentation fault)나 기타 오류로 인해
전체 clickhouse-server 프로세스가 크래시될 수 있기 때문입니다.

이 도구는 파이프, 공유 메모리, TCP가 아니라 HTTP를 통해 동작합니다. 그 이유는 다음과 같습니다.
- 구현이 더 간단합니다.
- 디버깅이 더 간단합니다.
- jdbc-bridge를 동일한 방식으로 구현할 수 있습니다.



## Usage \{#usage\}

`clickhouse-server`는 ODBC table function과 StorageODBC 내부에서 이 도구를 사용합니다.
그러나 다음과 같은 매개변수를 포함한 POST 요청 URL을 사용하여
명령줄에서 독립 실행형 도구로도 사용할 수 있습니다:
- `connection_string` -- ODBC 연결 문자열.
- `sample_block` -- ClickHouse NamesAndTypesList 형식의 컬럼 설명으로, 이름은 백틱(`)으로 감싸고
  타입은 문자열로 작성합니다. 이름과 타입은 공백으로 구분하고, 행은
  줄바꿈으로 구분합니다.
- `max_block_size` -- 선택적인 매개변수로, 단일 블록의 최대 크기를 설정합니다.
쿼리는 POST 요청 본문으로 전송합니다. 응답은 RowBinary 형식으로 반환됩니다.



## 예제: \{#example\}

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

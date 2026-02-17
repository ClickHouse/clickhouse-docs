---
description: '지정된 클러스터의 여러 노드에서 URL에 있는 파일을 병렬로 처리합니다.'
sidebar_label: 'urlCluster'
sidebar_position: 201
slug: /sql-reference/table-functions/urlCluster
title: 'urlCluster'
doc_type: 'reference'
---



# urlCluster 테이블 함수 \{#urlcluster-table-function\}

지정된 클러스터의 여러 노드에서 URL을 통해 파일을 병렬로 처리할 수 있습니다. 이니시에이터 노드에서는 클러스터의 모든 노드에 대한 연결을 생성하고, URL 파일 경로에 있는 별표(*)를 전개한 뒤 각 파일을 동적으로 분배합니다. 워커 노드에서는 이니시에이터 노드에 다음에 처리할 작업을 요청하고, 전달받은 작업을 처리합니다. 모든 작업이 완료될 때까지 이 과정을 반복합니다.



## 구문 \{#syntax\}

```sql
urlCluster(cluster_name, URL, format, structure)
```


## Arguments \{#arguments\}

| Argument       | Description                                                                                                                                                     |
|----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name` | 원격 및 로컬 서버에 대한 주소와 연결 파라미터 집합을 구성하는 데 사용되는 클러스터 이름입니다.                                                                   |
| `URL`          | `GET` 요청을 수락할 수 있는 HTTP 또는 HTTPS 서버 주소입니다. 타입: [String](../../sql-reference/data-types/string.md).                                          |
| `format`       | 데이터의 [Format](/sql-reference/formats)입니다. 타입: [String](../../sql-reference/data-types/string.md).                                                      |
| `structure`    | `'UserID UInt64, Name String'` 형식의 테이블 구조입니다. 컬럼 이름과 타입을 결정합니다. 타입: [String](../../sql-reference/data-types/string.md).              |



## 반환값 \{#returned_value\}

지정된 형식과 구조를 가지며, 정의된 `URL`에서 가져온 데이터를 포함하는 테이블입니다.



## 예시 \{#examples\}

`String`과 [UInt32](../../sql-reference/data-types/int-uint.md) 타입의 컬럼을 포함한 테이블에서 [CSV](/interfaces/formats/CSV) 형식으로 응답하는 HTTP 서버를 통해 처음 3개 행을 가져옵니다.

1. 표준 Python 3 도구를 사용하여 기본 HTTP 서버를 생성한 후 시작합니다.

```python
from http.server import BaseHTTPRequestHandler, HTTPServer

class CSVHTTPServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/csv')
        self.end_headers()

        self.wfile.write(bytes('Hello,1\nWorld,2\n', "utf-8"))

if __name__ == "__main__":
    server_address = ('127.0.0.1', 12345)
    HTTPServer(server_address, CSVHTTPServer).serve_forever()
```

```sql
SELECT * FROM urlCluster('cluster_simple','http://127.0.0.1:12345', CSV, 'column1 String, column2 UInt32')
```


## URL의 글롭(glob) 패턴 \{#globs-in-url\}

중괄호 `{ }` 안의 패턴은 세그먼트 집합을 생성하거나 페일오버 주소를 지정하는 데 사용됩니다. 지원되는 패턴 유형과 예시는 [remote](remote.md#globs-in-addresses) 함수 설명을 참고하십시오.
패턴 안의 문자 `|`는 페일오버 주소를 지정하는 데 사용됩니다. 해당 주소들은 패턴에 나열된 순서대로 순회됩니다. 생성되는 주소 수는 [glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 설정으로 제한됩니다.



## 관련 항목 \{#related\}

-   [HDFS 엔진](/engines/table-engines/integrations/hdfs)
-   [URL 테이블 함수](/engines/table-engines/special/url)

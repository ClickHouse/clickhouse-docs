---
'description': '지정된 클러스터의 여러 노드에서 URL의 파일을 병렬로 처리할 수 있습니다.'
'sidebar_label': 'urlCluster'
'sidebar_position': 201
'slug': '/sql-reference/table-functions/urlCluster'
'title': 'urlCluster'
'doc_type': 'reference'
---


# urlCluster 테이블 함수

지정된 클러스터 내의 여러 노드에서 URL의 파일을 병렬로 처리할 수 있습니다. 시작자에서 모든 노드에 대한 연결을 생성하고, URL 파일 경로에서 별표를 공개하며, 각 파일을 동적으로 분배합니다. 작업자 노드에서는 다음 처리해야 할 작업에 대해 시작자에게 요청하고 이를 처리합니다. 모든 작업이 완료될 때까지 이 과정이 반복됩니다.

## 구문 {#syntax}

```sql
urlCluster(cluster_name, URL, format, structure)
```

## 인수 {#arguments}

| 인수             | 설명                                                                                                                                                      |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`   | 원격 및 지역 서버에 대한 주소 및 연결 매개변수를 구성하는 데 사용되는 클러스터의 이름입니다.                                                                |
| `URL`            | `GET` 요청을 수락할 수 있는 HTTP 또는 HTTPS 서버 주소입니다. 유형: [String](../../sql-reference/data-types/string.md).                                 |
| `format`         | 데이터의 [형식](/sql-reference/formats)입니다. 유형: [String](../../sql-reference/data-types/string.md).                                                     |
| `structure`      | `'UserID UInt64, Name String'` 형식의 테이블 구조입니다. 컬럼 이름 및 유형을 결정합니다. 유형: [String](../../sql-reference/data-types/string.md). |

## 반환 값 {#returned_value}

지정된 형식과 구조 및 정의된 `URL`의 데이터를 포함하는 테이블입니다.

## 예제 {#examples}

HTTP 서버에서 `String` 및 [UInt32](../../sql-reference/data-types/int-uint.md) 유형의 컬럼을 포함하는 테이블의 첫 3줄을 가져오는 것입니다. 이 서버는 [CSV](/interfaces/formats/CSV) 형식으로 응답합니다.

1. 표준 Python 3 도구를 사용하여 기본 HTTP 서버를 생성하고 시작합니다:

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

## URL의 Globs {#globs-in-url}

중괄호 `{ }` 내의 패턴은 샤드 세트를 생성하거나 장애 조치 주소를 지정하는 데 사용됩니다. 지원되는 패턴 유형 및 예시는 [remote](remote.md#globs-in-addresses) 함수의 설명에서 확인할 수 있습니다. 패턴 내의 문자 `|`는 장애 조치 주소를 지정하는 데 사용됩니다. 이들은 패턴에 나열된 순서대로 반복됩니다. 생성된 주소의 수는 [glob_expansion_max_elements](../../operations/settings/settings.md#glob_expansion_max_elements) 설정에 의해 제한됩니다.

## 관련 {#related}

-   [HDFS 엔진](/engines/table-engines/integrations/hdfs)
-   [URL 테이블 함수](/engines/table-engines/special/url)

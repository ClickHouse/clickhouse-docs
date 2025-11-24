---
'description': '원격 HTTP/HTTPS 서버에서 데이터를 쿼리합니다. 이 엔진은 File 엔진과 유사합니다.'
'sidebar_label': 'URL'
'sidebar_position': 80
'slug': '/engines/table-engines/special/url'
'title': 'URL 테이블 엔진'
'doc_type': 'reference'
---


# URL 테이블 엔진

원격 HTTP/HTTPS 서버에서 데이터를 쿼리합니다. 이 엔진은 [File](../../../engines/table-engines/special/file.md) 엔진과 유사합니다.

구문: `URL(URL [,Format] [,CompressionMethod])`

- `URL` 매개변수는 고유 리소스 위치의 구조를 준수해야 합니다. 지정된 URL은 HTTP 또는 HTTPS를 사용하는 서버를 가리켜야 합니다. 서버로부터 응답을 받기 위해 추가 헤더가 필요하지 않습니다.

- `Format`은 ClickHouse가 `SELECT` 쿼리와 필요한 경우 `INSERT`에 사용할 수 있는 형식이어야 합니다. 지원되는 형식의 전체 목록은 [Formats](/interfaces/formats#formats-overview)를 참조하십시오.

    이 인수가 지정되지 않으면 ClickHouse는 `URL` 매개변수의 접미사에서 형식을 자동으로 감지합니다. `URL` 매개변수의 접미사가 지원되는 형식과 일치하지 않는다면, 테이블 생성에 실패합니다. 예를 들어, 엔진 표현 `URL('http://localhost/test.json')`의 경우, `JSON` 형식이 적용됩니다.

- `CompressionMethod`는 HTTP 본문이 압축되어야 하는지 여부를 나타냅니다. 압축이 활성화된 경우, URL 엔진에서 전송한 HTTP 패킷은 어떤 압축 방법이 사용되는지를 나타내는 'Content-Encoding' 헤더를 포함합니다.

압축을 활성화하려면, 먼저 `URL` 매개변수에 의해 표시된 원격 HTTP 엔드포인트가 해당 압축 알고리즘을 지원하는지 확인하십시오.

지원되는 `CompressionMethod`는 다음 중 하나여야 합니다:
- gzip 또는 gz
- deflate
- brotli 또는 br
- lzma 또는 xz
- zstd 또는 zst
- lz4
- bz2
- snappy
- none
- auto

`CompressionMethod`가 지정되지 않으면 기본값은 `auto`로 설정됩니다. 이는 ClickHouse가 `URL` 매개변수의 접미사에서 압축 방법을 자동으로 감지함을 의미합니다. 접미사가 위의 압축 방법 중 어느 것과 일치하면 해당 압축이 적용되며, 그렇지 않으면 압축이 활성화되지 않습니다.

예를 들어, 엔진 표현 `URL('http://localhost/test.gzip')`의 경우, `gzip` 압축 방법이 적용되지만, `URL('http://localhost/test.fr')`의 경우, 접미사 `fr`이 위의 압축 방법과 일치하지 않기 때문에 압축이 활성화되지 않습니다.

## 사용법 {#using-the-engine-in-the-clickhouse-server}

`INSERT` 및 `SELECT` 쿼리는 각각 `POST` 및 `GET` 요청으로 변환됩니다. `POST` 요청을 처리하기 위해 원격 서버는 [Chunked transfer encoding](https://en.wikipedia.org/wiki/Chunked_transfer_encoding)을 지원해야 합니다.

최대 HTTP GET 리다이렉트 홉 수를 [max_http_get_redirects](/operations/settings/settings#max_http_get_redirects) 설정을 사용하여 제한할 수 있습니다.

## 예제 {#example}

**1.** 서버에 `url_engine_table` 테이블 생성:

```sql
CREATE TABLE url_engine_table (word String, value UInt64)
ENGINE=URL('http://127.0.0.1:12345/', CSV)
```

**2.** 표준 Python 3 도구를 사용하여 기본 HTTP 서버를 생성하고 시작합니다:

```python3
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

```bash
$ python3 server.py
```

**3.** 데이터 요청:

```sql
SELECT * FROM url_engine_table
```

```text
┌─word──┬─value─┐
│ Hello │     1 │
│ World │     2 │
└───────┴───────┘
```

## 구현 세부 사항 {#details-of-implementation}

- 읽기 및 쓰기는 병렬로 수행될 수 있습니다.
- 지원되지 않는 항목:
  - `ALTER` 및 `SELECT...SAMPLE` 작업.
  - 인덱스.
  - 복제.

## 가상 컬럼 {#virtual-columns}

- `_path` — `URL` 경로. 유형: `LowCardinality(String)`.
- `_file` — `URL` 리소스 이름. 유형: `LowCardinality(String)`.
- `_size` — 리소스 크기(바이트). 유형: `Nullable(UInt64)`. 크기가 알려지지 않은 경우 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시간. 유형: `Nullable(DateTime)`. 시간이 알려지지 않은 경우 값은 `NULL`입니다.
- `_headers` - HTTP 응답 헤더. 유형: `Map(LowCardinality(String), LowCardinality(String))`.

## 저장소 설정 {#storage-settings}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 읽기 시 빈 파일을 건너뛸 수 있도록 허용합니다. 기본값은 비활성화되어 있습니다.
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - URI에서 경로 인코딩/디코딩을 활성화/비활성화할 수 있도록 합니다. 기본값은 활성화되어 있습니다.

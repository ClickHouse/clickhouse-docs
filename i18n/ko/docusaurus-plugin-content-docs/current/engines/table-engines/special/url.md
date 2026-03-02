---
description: '원격 HTTP/HTTPS 서버로부터 데이터를 조회하거나 해당 서버로 데이터를 보냅니다. 이 엔진은 File 엔진과 유사합니다.'
sidebar_label: 'URL'
sidebar_position: 80
slug: /engines/table-engines/special/url
title: 'URL 테이블 엔진'
doc_type: 'reference'
---



# URL table engine \{#url-table-engine\}

원격 HTTP/HTTPS 서버에서/서버로 데이터를 조회합니다. 이 엔진은 [File](../../../engines/table-engines/special/file.md) 엔진과 유사합니다.

구문: `URL(URL [,Format] [,CompressionMethod])`

- `URL` 매개변수는 Uniform Resource Locator 구조를 따라야 합니다. 지정된 URL은 HTTP 또는 HTTPS를 사용하는 서버를 가리켜야 합니다. 서버로부터 응답을 받기 위해 추가 헤더는 필요하지 않습니다.

- `Format`은 ClickHouse가 `SELECT` 쿼리에서, 그리고 필요하다면 `INSERT`에서도 사용할 수 있는 포맷이어야 합니다. 지원되는 포맷 전체 목록은 [Formats](/interfaces/formats#formats-overview)를 참조하십시오.

    이 인자를 지정하지 않으면 ClickHouse는 `URL` 매개변수의 접미사로부터 포맷을 자동으로 감지합니다. `URL` 매개변수의 접미사가 지원되는 포맷과 일치하지 않으면 테이블 생성에 실패합니다. 예를 들어, 엔진 표현식 `URL('http://localhost/test.json')`의 경우 `JSON` 포맷이 적용됩니다.

- `CompressionMethod`는 HTTP 본문을 압축할지 여부를 나타냅니다. 압축이 활성화되면 URL 엔진이 전송하는 HTTP 패킷에는 어떤 압축 방식이 사용되었는지 나타내기 위해 「Content-Encoding」 헤더가 포함됩니다.

압축을 활성화하려면 먼저 `URL` 매개변수로 지정한 원격 HTTP 엔드포인트가 해당 압축 알고리즘을 지원하는지 확인해야 합니다.

지원되는 `CompressionMethod`는 다음 중 하나입니다:
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

`CompressionMethod`를 지정하지 않으면 기본값은 `auto`입니다. 이는 ClickHouse가 `URL` 매개변수의 접미사로부터 압축 방식을 자동으로 감지한다는 의미입니다. 접미사가 위에 나열된 압축 방식 중 하나와 일치하면 해당 압축이 적용되고, 일치하지 않으면 압축이 활성화되지 않습니다.

예를 들어, 엔진 표현식 `URL('http://localhost/test.gzip')`의 경우 `gzip` 압축 방식이 적용되지만, `URL('http://localhost/test.fr')`의 경우에는 접미사 `fr`이 위의 어떤 압축 방식과도 일치하지 않으므로 압축이 활성화되지 않습니다.



## Usage \{#using-the-engine-in-the-clickhouse-server\}

`INSERT` 및 `SELECT` 쿼리는 각각 `POST` 및 `GET` 요청으로 변환됩니다.
`POST` 요청을 처리하려면 원격 서버에서 [Chunked transfer encoding](https://en.wikipedia.org/wiki/Chunked_transfer_encoding)을 지원해야 합니다.

[max_http_get_redirects](/operations/settings/settings#max_http_get_redirects) 설정을 사용하여 HTTP GET 리디렉션 홉 수의 최대값을 제한할 수 있습니다.



## 예시 \{#example\}

**1.** 서버에서 `url_engine_table` 테이블을 생성합니다:

```sql
CREATE TABLE url_engine_table (word String, value UInt64)
ENGINE=URL('http://127.0.0.1:12345/', CSV)
```

**2.** 표준 Python 3 도구를 사용하여 기본 HTTP 서버를 생성한 다음
시작합니다:

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


## 구현 세부 내용 \{#details-of-implementation\}

- 읽기와 쓰기는 병렬로 수행될 수 있습니다.
- 다음 기능은 지원되지 않습니다:
  - `ALTER` 및 `SELECT...SAMPLE` 연산.
  - 인덱스.
  - 복제.



## 가상 컬럼 \{#virtual-columns\}

- `_path` — `URL`의 경로입니다. 타입: `LowCardinality(String)`.
- `_file` — `URL`의 리소스 이름입니다. 타입: `LowCardinality(String)`.
- `_size` — 리소스의 크기(바이트 단위)입니다. 타입: `Nullable(UInt64)`. 크기를 알 수 없는 경우 값은 `NULL`입니다.
- `_time` — 파일이 마지막으로 수정된 시각입니다. 타입: `Nullable(DateTime)`. 시각을 알 수 없는 경우 값은 `NULL`입니다.
- `_headers` - HTTP 응답 헤더입니다. 타입: `Map(LowCardinality(String), LowCardinality(String))`.



## Storage settings \{#storage-settings\}

- [engine_url_skip_empty_files](/operations/settings/settings.md#engine_url_skip_empty_files) - 읽을 때 비어 있는 파일을 건너뛸 수 있습니다. 기본값은 비활성화입니다.
- [enable_url_encoding](/operations/settings/settings.md#enable_url_encoding) - URI 경로의 인코딩/디코딩을 활성화하거나 비활성화할 수 있습니다. 기본값은 활성화입니다.

---
'sidebar_label': '추가 옵션'
'sidebar_position': 3
'keywords':
- 'clickhouse'
- 'python'
- 'options'
- 'settings'
'description': 'ClickHouse Connect에 대한 추가 옵션'
'slug': '/integrations/language-clients/python/additional-options'
'title': '추가 옵션'
'doc_type': 'reference'
---



# Additional options {#additional-options}

ClickHouse Connect는 고급 사용 사례를 위한 여러 가지 추가 옵션을 제공합니다.

## Global settings {#global-settings}

ClickHouse Connect 동작을 전역적으로 제어하는 소수의 설정이 있습니다. 이들은 최상위 `common` 패키지에서 액세스할 수 있습니다:

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

:::note
이러한 일반 설정인 `autogenerate_session_id`, `product_name`, 및 `readonly`는 _항상_ `clickhouse_connect.get_client` 메서드를 사용하여 클라이언트를 생성하기 전에 수정해야 합니다. 클라이언트 생성 후 이 설정을 변경해도 기존 클라이언트의 동작에는 영향을 미치지 않습니다.
:::

현재 정의된 전역 설정은 다음과 같습니다:

| 설정 이름                           | 기본값  | 옵션                    | 설명                                                                                                                                                                                                                                                     |
|-------------------------------------|---------|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| autogenerate_session_id             | True    | True, False             | 각 클라이언트 세션에 대해 새로운 UUID(1) 세션 ID를 자동으로 생성합니다(제공되지 않은 경우). 세션 ID가 제공되지 않으면(클라이언트 또는 쿼리 레벨 모두) ClickHouse는 각 쿼리에 대해 무작위 내부 ID를 생성합니다.                                      |
| dict_parameter_format               | 'json'  | 'json', 'map'           | 이 설정은 매개변수화된 쿼리가 Python 딕셔너리를 JSON 또는 ClickHouse Map 구문으로 변환할지를 제어합니다. `json`은 JSON 컬럼에 대한 삽입에 사용해야 하며, `map`은 ClickHouse Map 컬럼에 사용해야 합니다.                                          |
| invalid_setting_action              | 'error' | 'drop', 'send', 'error' | 잘못된 설정이나 읽기 전용 설정이 제공될 때 취할 작업(클라이언트 세션 또는 쿼리에 대해). `drop`을 선택하면 설정이 무시되고, `send`를 선택하면 설정이 ClickHouse로 전송되며, `error`를 선택하면 클라이언트 측 ProgrammingError가 발생합니다.               |
| max_connection_age                  | 600     |                         | HTTP Keep Alive 연결이 열리거나 재사용되는 최대 초 수입니다. 이는 로드 발란서/proxy 뒤의 단일 ClickHouse 노드에 대한 연결이 몰리는 것을 방지합니다. 기본값은 10분입니다.                                                                                         |
| product_name                        |         |                         | ClickHouse Connect를 사용하여 앱을 추적하기 위해 쿼리와 함께 전달되는 문자열입니다. 형식은 &lt;product name;&gl/&lt;product version&gt;이어야 합니다.                                                                                               |
| readonly                            | 0       | 0, 1                    | 19.17 이전 버전의 ClickHouse에 대해 묵시적인 "read_only" ClickHouse 설정입니다. 이 설정을 ClickHouse "read_only" 값과 일치하도록 설정하면 매우 오래된 ClickHouse 버전에서도 작동할 수 있습니다.                                                  |
| send_os_user                        | True    | True, False             | 클라이언트가 ClickHouse로 전송하는 클라이언트 정보에서 감지된 운영 체제 사용자를 포함합니다(HTTP User-Agent 문자열).                                                                                                                                  |
| send_integration_tags               | True    | True, False             | ClickHouse로 전송되는 클라이언트 정보에 사용된 통합 라이브러리/버전(예: Pandas/SQLAlchemy/기타)을 포함합니다(HTTP User-Agent 문자열).                                                                                                             |
| use_protocol_version                | True    | True, False             | 클라이언트 프로토콜 버전을 사용합니다. 이는 `DateTime` 타임 존 컬럼에 필요하지만 현재 chproxy 버전과 호환되지 않습니다.                                                                                                                             |
| max_error_size                      | 1024    |                         | 클라이언트 오류 메시지에서 반환될 최대 문자 수입니다. 이 설정에 0을 사용하면 전체 ClickHouse 오류 메시지를 얻을 수 있습니다. 기본값은 1024자입니다.                                                                                                   |
| http_buffer_size                    | 10MB    |                         | HTTP 스트리밍 쿼리에 사용되는 "메모리 내" 버퍼의 크기(바이트 단위)입니다.                                                                                                                                                                                |
| preserve_pandas_datetime_resolution | False   | True, False             | True일 경우 pandas 2.x를 사용할 때 datetime64/timedelta64 dtype 해상도를 보존합니다(예: 's', 'ms', 'us', 'ns'). False일 경우(pandas &lt;2.x 일 경우)는 호환성을 위해 나노초('ns') 해상도로 강제됩니다.                                           |

## Compression {#compression}

ClickHouse Connect는 쿼리 결과 및 삽입 모두에 대해 lz4, zstd, brotli 및 gzip 압축을 지원합니다. 압축 사용은 일반적으로 네트워크 대역폭/전송 속도와 CPU 사용량(클라이언트 및 서버 모두) 간의 거래가 포함된다는 점을 항상 염두에 두십시오.

압축된 데이터를 수신하려면 ClickHouse 서버의 `enable_http_compression`을 1로 설정해야 하며, 사용자가 "쿼리별"로 이 설정을 변경할 권한이 있어야 합니다.

압축은 `clickhouse_connect.get_client` 팩토리 메서드를 호출할 때 `compress` 매개변수로 제어됩니다. 기본적으로 `compress`는 `True`로 설정되어 있으며, 이는 기본 압축 설정을 트리거합니다. `query`, `query_np`, 및 `query_df` 클라이언트 메서드로 실행된 쿼리의 경우 ClickHouse Connect는 `Accept-Encoding` 헤더에 `lz4`, `zstd`, `br`(brotli, brotli 라이브러리가 설치된 경우), `gzip`, 및 `deflate` 인코딩을 추가합니다. (대부분의 요청에 대해 ClickHouse 서버는 `zstd`로 압축된 페이로드를 반환합니다.) 삽입의 경우, 기본적으로 ClickHouse Connect는 삽입 블록을 `lz4` 압축으로 압축하고 `Content-Encoding: lz4` HTTP 헤더를 전송합니다.

`get_client` `compress` 매개변수는 `lz4`, `zstd`, `br`, 또는 `gzip` 중 하나의 특정 압축 방법으로 설정할 수 있습니다. 그 방법은 이후 삽입과 쿼리 결과 모두에 사용됩니다(ClickHouse 서버에서 지원하는 경우). 필요한 `zstd` 및 `lz4` 압축 라이브러리는 이제 ClickHouse Connect에 기본적으로 설치되어 있습니다. `br`/brotli가 지정된 경우, brotli 라이브러리는 별도로 설치해야 합니다.

`raw*` 클라이언트 메서드는 클라이언트 구성에서 지정한 압축을 사용하지 않음을 유의하십시오.

또한 `gzip` 압축 사용은 권장하지 않으며, 데이터 압축 및 압축 해제 모두에서 대안보다 훨씬 느립니다.

## HTTP proxy support {#http-proxy-support}

ClickHouse Connect는 `urllib3` 라이브러리를 사용하여 기본 HTTP 프록시 지원을 추가합니다. 이는 표준 `HTTP_PROXY` 및 `HTTPS_PROXY` 환경 변수를 인식합니다. 이러한 환경 변수를 사용하는 것은 `clickhouse_connect.get_client` 메서드로 생성된 모든 클라이언트에 적용된다는 점을 유의하십시오. 또는 각 클라이언트에 대해 구성하려면 `get_client` 메서드에 `http_proxy` 또는 `https_proxy` 인수를 사용할 수 있습니다. HTTP 프록시 지원 구현에 대한 자세한 내용은 [urllib3](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#http-and-https-proxies) 문서를 참조하십시오.

SOCKS 프록시를 사용하려면 `urllib3` `SOCKSProxyManager`를 `get_client`의 `pool_mgr` 인수로 보낼 수 있습니다. 이 경우 PySocks 라이브러리를 직접 설치하거나 `urllib3` 종속성을 위한 `[socks]` 옵션을 사용해야 합니다.

## "Old" JSON data type {#old-json-data-type}

실험적인 `Object`(또는 `Object('json')`) 데이터 유형은 더 이상 사용되지 않으며 생산 환경에서는 피해야 합니다. ClickHouse Connect는 하위 호환성을 위해 데이터 유형에 대한 제한된 지원을 계속 제공합니다. 이 지원에는 사전 또는 동등한 형태로 "최상위" 또는 "상위" JSON 값을 반환할 것으로 예상되는 쿼리가 포함되지 않으며, 이러한 쿼리는 예외를 발생시킵니다.

## "New" Variant/Dynamic/JSON datatypes (experimental feature) {#new-variantdynamicjson-datatypes-experimental-feature}

0.8.0 릴리스부터 `clickhouse-connect`는 새로운(또한 실험적인) ClickHouse 유형인 Variant, Dynamic, 및 JSON에 대한 실험적 지원을 제공합니다.

### Usage notes {#usage-notes}
- JSON 데이터는 Python 딕셔너리 또는 JSON 객체 `{}`를 포함하는 JSON 문자열로 삽입할 수 있습니다. 다른 형태의 JSON 데이터는 지원되지 않습니다.
- 이러한 유형의 하위 열/경로를 사용하는 쿼리는 하위 열의 유형을 반환합니다.
- 다른 사용법에 대해서는 주요 ClickHouse [문서](https://clickhouse.com/docs)를 참조하십시오.

### Known limitations {#known-limitations}
- 이러한 유형 각각은 사용하기 전에 ClickHouse 설정에서 활성화해야 합니다.
- "새로운" JSON 유형은 ClickHouse 24.8 릴리스부터 사용할 수 있습니다.
- 내부 형식 변경으로 인해 `clickhouse-connect`는 ClickHouse 24.7 릴리스부터 Variant 유형과만 호환됩니다.
- 반환된 JSON 객체는 `max_dynamic_paths` 수의 요소만 반환합니다(기본값은 1024입니다). 이는 향후 릴리스에서 수정될 예정입니다.
- `Dynamic` 컬럼에 대한 삽입은 항상 Python 값의 문자열 표현이 됩니다. 이는 https://github.com/ClickHouse/ClickHouse/issues/70395가 수정된 후 향후 릴리스에서 수정될 예정입니다.
- 새로운 유형에 대한 구현은 C 코드에서 최적화되지 않았으므로, 성능이 더 간단하고 확립된 데이터 유형보다 다소 느릴 수 있습니다.

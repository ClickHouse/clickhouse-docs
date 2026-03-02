---
sidebar_label: '추가 옵션'
sidebar_position: 3
keywords: ['clickhouse', 'python', 'options', 'settings']
description: 'ClickHouse Connect를 위한 추가 옵션'
slug: /integrations/language-clients/python/additional-options
title: '추가 옵션'
doc_type: 'reference'
---

# 추가 옵션 \{#additional-options\}

ClickHouse Connect는 고급 활용 시나리오를 위한 다양한 추가 옵션을 제공합니다.

## 전역 설정 \{#global-settings\}

ClickHouse Connect 동작을 전역적으로 제어하는 설정은 몇 가지뿐입니다. 이러한 설정은 최상위 `common` 패키지에서 사용할 수 있습니다:

```python
from clickhouse_connect import common

common.set_setting('autogenerate_session_id', False)
common.get_setting('invalid_setting_action')
'drop'
```

:::note
이 공통 설정값 `autogenerate_session_id`, `product_name`, `readonly`는 `clickhouse_connect.get_client` 메서드로 클라이언트를 생성하기 전에 *반드시* 변경해야 합니다. 클라이언트를 생성한 이후에 이 설정을 변경해도 기존 클라이언트의 동작에는 영향을 주지 않습니다.
:::

현재 다음과 같은 전역 설정이 정의되어 있습니다:

| Setting Name                                    | Default         | Options                                         | Description                                                                                                                                                                                             |
| ----------------------------------------------- | --------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| autogenerate&#95;session&#95;id                 | True            | True, False                                     | 각 클라이언트 세션마다 (제공되지 않은 경우) 새 UUID(1) 세션 ID를 자동 생성합니다. 세션 ID가 (클라이언트 또는 쿼리 수준에서) 제공되지 않으면 ClickHouse는 각 쿼리에 대해 임의의 내부 ID를 생성합니다.                                                                          |
| dict&#95;parameter&#95;format                   | &#39;json&#39;  | &#39;json&#39;, &#39;map&#39;                   | 매개변수화된 쿼리가 Python 딕셔너리를 JSON으로 변환할지, 아니면 ClickHouse Map 구문으로 변환할지를 제어합니다. `json`은 JSON 컬럼에 데이터를 삽입할 때 사용하고, `map`은 ClickHouse 맵 컬럼에 사용할 때 사용합니다.                                                        |
| invalid&#95;setting&#95;action                  | &#39;error&#39; | &#39;drop&#39;, &#39;send&#39;, &#39;error&#39; | 잘못되었거나 readonly인 설정이 제공되었을 때(클라이언트 세션 또는 쿼리에 대해) 취할 동작입니다. `drop`인 경우 설정이 무시되고, `send`인 경우 설정이 ClickHouse로 전송되며, `error`인 경우 클라이언트 측에서 ProgrammingError가 발생합니다.                                         |
| max&#95;connection&#95;age                      | 600             |                                                 | HTTP Keep Alive 연결을 열어 두고 재사용할 최대 시간(초)입니다. 이를 통해 로드 밸런서/프록시 뒤의 단일 ClickHouse 노드에 연결이 몰리는 현상을 방지합니다. 기본값은 10분입니다.                                                                                       |
| product&#95;name                                |                 |                                                 | ClickHouse Connect를 사용하는 앱을 추적하기 위해 쿼리와 함께 ClickHouse로 전달되는 문자열입니다. &lt;product name;&amp;gl/&lt;product version&gt; 형식이어야 합니다.                                                                         |
| readonly                                        | 0               | 0, 1                                            | 19.17 이전 버전에 대한 암시적인 &quot;read&#95;only&quot; ClickHouse 설정입니다. 매우 오래된 ClickHouse 버전과의 동작을 허용하기 위해 ClickHouse 설정의 &quot;read&#95;only&quot; 값과 일치하도록 설정할 수 있습니다.                                       |
| send&#95;os&#95;user                            | True            | True, False                                     | ClickHouse로 전송되는 클라이언트 정보(HTTP User-Agent 문자열)에 감지된 운영 체제 사용자를 포함합니다.                                                                                                                                   |
| send&#95;integration&#95;tags                   | True            | True, False                                     | ClickHouse로 전송되는 클라이언트 정보(HTTP User-Agent 문자열)에 사용된 통합 라이브러리/버전(예: Pandas/SQLAlchemy/기타)을 포함합니다.                                                                                                        |
| use&#95;protocol&#95;version                    | True            | True, False                                     | 클라이언트 프로토콜 버전을 사용합니다. 이는 `DateTime` 타임존 컬럼에 필요하지만, 현재 버전의 chproxy와는 호환되지 않습니다.                                                                                                                          |
| max&#95;error&#95;size                          | 1024            |                                                 | 클라이언트 오류 메시지에서 반환되는 최대 문자 수입니다. 전체 ClickHouse 오류 메시지를 받으려면 이 설정을 0으로 설정합니다. 기본값은 1024자입니다.                                                                                                              |
| http&#95;buffer&#95;size                        | 10MB            |                                                 | HTTP 스트리밍 쿼리에 사용되는 in-memory 버퍼의 크기(바이트 단위)입니다.                                                                                                                                                         |
| preserve&#95;pandas&#95;datetime&#95;resolution | False           | True, False                                     | True이고 pandas 2.x를 사용하는 경우, datetime64/timedelta64 dtype 해상도(예: &#39;s&#39;, &#39;ms&#39;, &#39;us&#39;, &#39;ns&#39;)를 유지합니다. False인 경우(또는 pandas &lt;2.x에서는) 호환성을 위해 나노초(&#39;ns&#39;) 해상도로 강제 변환합니다. |


## Compression \{#compression\}

ClickHouse Connect는 쿼리 결과와 insert 모두에 대해 lz4, zstd, brotli, gzip 압축을 지원합니다. 압축을 사용하면 일반적으로 네트워크 대역폭/전송 속도와 CPU 사용량(클라이언트와 서버 모두) 사이에 절충이 필요하다는 점을 항상 유념해야 합니다.

압축된 데이터를 수신하려면 ClickHouse 서버의 `enable_http_compression`을 1로 설정하거나, 사용자에게 「쿼리 단위」로 해당 SETTING을 변경할 수 있는 권한이 있어야 합니다.

압축은 `clickhouse_connect.get_client` 팩토리 메서드를 호출할 때 사용하는 `compress` 매개변수로 제어합니다. 기본적으로 `compress`는 `True`로 설정되어 있으며, 이 값은 기본 압축 설정을 사용하도록 합니다. `query`, `query_np`, `query_df` 클라이언트 메서드로 쿼리를 실행하면 ClickHouse Connect는 `Accept-Encoding` 헤더를 추가하고,
`query` 클라이언트 메서드(그리고 간접적으로 `query_np`, `query_df`)로 실행되는 쿼리에 `lz4`, `zstd`, `br`(brotli 라이브러리가 설치된 경우), `gzip`, `deflate` 인코딩을 포함합니다. (대부분의 요청에서 ClickHouse
서버는 `zstd`로 압축된 페이로드를 반환합니다.) insert의 경우, 기본적으로 ClickHouse Connect는 insert 블록을 `lz4` 방식으로 압축하고 `Content-Encoding: lz4` HTTP 헤더를 전송합니다.

`get_client`의 `compress` 매개변수는 `lz4`, `zstd`, `br`, `gzip` 중 하나의 특정 압축 방식으로 설정할 수도 있습니다. 이렇게 지정하면 해당 방식이 insert와 쿼리 결과 모두에 사용됩니다(ClickHouse 서버가 지원하는 경우). 필요한 `zstd`와 `lz4` 압축 라이브러리는 이제 ClickHouse Connect와 함께 기본으로 설치됩니다. `br`/brotli를 지정하는 경우 brotli 라이브러리는 별도로 설치해야 합니다.

`raw*` 클라이언트 메서드는 클라이언트 구성에서 지정한 압축 설정을 사용하지 않는다는 점에 유의하십시오.

또한 데이터 압축 및 압축 해제 모두에서 다른 방식에 비해 현저히 느리므로 `gzip` 압축 사용은 권장하지 않습니다.

## HTTP 프록시 지원 \{#http-proxy-support\}

ClickHouse Connect는 `urllib3` 라이브러리를 사용하여 기본적인 HTTP 프록시 지원을 제공합니다. 표준 환경 변수인 `HTTP_PROXY` 및 `HTTPS_PROXY`를 인식합니다. 이 환경 변수를 설정하면 `clickhouse_connect.get_client` 메서드로 생성되는 모든 클라이언트에 해당 설정이 적용됩니다. 클라이언트별로 개별 설정을 하려면 `get_client` 메서드에 `http_proxy` 또는 `https_proxy` 인수를 사용할 수 있습니다. HTTP 프록시 지원 구현에 대한 자세한 내용은 [urllib3](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#http-and-https-proxies) 문서를 참조하십시오.

SOCKS 프록시를 사용하려면 `urllib3`의 `SOCKSProxyManager`를 `pool_mgr` 인수로 `get_client`에 전달하면 됩니다. 이 기능을 사용하려면 PySocks 라이브러리를 직접 설치하거나, `urllib3` 종속성 설치 시 `[socks]` 옵션을 사용해야 합니다.

## "Old" JSON 데이터 타입 \{#old-json-data-type\}

실험적 데이터 타입인 `Object`(또는 `Object('json')`)는 사용이 중단(deprecated)되었으며, 운영 환경에서는 사용을 피해야 합니다. ClickHouse Connect는 하위 호환성을 위해 이 데이터 타입을 제한적으로만 지원합니다. 단, 이 지원에는 "최상위" 또는 "부모" JSON 값을 딕셔너리 또는 이와 동등한 형태로 반환하는 쿼리는 포함되지 않으며, 이러한 쿼리는 예외가 발생합니다.

## "New" Variant/Dynamic/JSON 데이터 타입(실험적 기능) \{#new-variantdynamicjson-datatypes-experimental-feature\}

0.8.0 릴리스부터 `clickhouse-connect`은 새로 도입된(역시 실험적인) ClickHouse 타입인 Variant, Dynamic, JSON에 대한 실험적 지원을 제공합니다.

### 사용 참고 사항 \{#usage-notes\}

- JSON 데이터는 Python 딕셔너리이거나 JSON 객체 `{}`를 포함하는 JSON 문자열 형태로만 삽입할 수 있습니다. 다른 형태의 JSON 데이터는 지원되지 않습니다.
- 이러한 타입에서 서브컬럼/경로를 사용하는 쿼리는 해당 서브컬럼의 타입을 반환합니다.
- 기타 사용 참고 사항은 ClickHouse [공식 문서](https://clickhouse.com/docs)를 참조하십시오.

### 알려진 제한 사항 \{#known-limitations\}

- 이러한 각 타입은 사용하기 전에 ClickHouse 설정에서 활성화해야 합니다.
- "새로운" JSON 타입은 ClickHouse 24.8 릴리스부터 사용할 수 있습니다.
- 내부 포맷 변경으로 인해 `clickhouse-connect`는 ClickHouse 24.7 릴리스부터 도입된 Variant 타입과만 호환됩니다.
- 반환되는 JSON 객체는 요소를 `max_dynamic_paths` 개수(기본값 1024)까지만 반환합니다. 이는 향후 릴리스에서 수정될 예정입니다.
- `Dynamic` 컬럼에 대한 INSERT 작업은 항상 Python 값의 String 표현으로 저장됩니다. 이는 https://github.com/ClickHouse/ClickHouse/issues/70395 가 해결된 이후의 향후 릴리스에서 수정될 예정입니다.
- 새로운 타입에 대한 구현은 C 코드에서 아직 최적화되지 않았으므로, 단순하고 이미 검증된 데이터 타입에 비해 성능이 다소 느릴 수 있습니다.
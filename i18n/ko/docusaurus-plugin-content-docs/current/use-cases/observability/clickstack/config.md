---
slug: /use-cases/observability/clickstack/config
title: '구성 옵션'
pagination_prev: null
pagination_next: null
description: 'ClickStack - ClickHouse 관측성 스택의 구성 옵션'
keywords: ['ClickStack 구성', '관측성 구성', 'HyperDX 설정', '수집기 구성', '환경 변수']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import hyperdx_25 from '@site/static/images/use-cases/observability/hyperdx-25.png';
import hyperdx_26 from '@site/static/images/use-cases/observability/hyperdx-26.png';
import highlighted_attributes_config from '@site/static/images/use-cases/observability/hyperdx-highlighted-attributes-config.png';
import highlighted_attributes from '@site/static/images/use-cases/observability/hyperdx-highlighted-attributes.png';
import highlighted_attributes_search from '@site/static/images/use-cases/observability/hyperdx-highlighted-attributes-search.png';

ClickStack의 각 구성 요소에는 다음과 같은 구성 옵션이 있습니다.


## 오픈 소스 배포판용 설정 \{#modifying-settings\}

### Docker \{#docker\}

[All in One](/use-cases/observability/clickstack/deployment/all-in-one), [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only) 또는 [Local Mode](/use-cases/observability/clickstack/deployment/local-mode-only)를 사용하는 경우 원하는 설정을 환경 변수로 전달하면 됩니다. 예를 들면 다음과 같습니다.

```shell
docker run  -e HYPERDX_LOG_LEVEL='debug' -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```


### Docker Compose \{#docker-compose\}

[Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) 배포 가이드를 사용하는 경우, [`.env`](https://github.com/hyperdxio/hyperdx/blob/main/.env) 파일을 사용하여 설정을 수정할 수 있습니다.

또는 [`docker-compose.yaml`](https://github.com/hyperdxio/hyperdx/blob/main/docker-compose.yml) 파일에서 설정 값을 명시적으로 재정의할 수도 있습니다. 예:

예시:

```yaml
services:
  app:
    environment:
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
      # ... other settings
```


### Helm \{#helm\}

#### 값 사용자 지정(선택 사항) \{#customizing-values\}

`--set` 플래그를 사용하여 설정을 사용자 지정할 수 있습니다. 예:

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2 \
  --set replicaCount=2 \
  --set resources.limits.cpu=500m \
  --set resources.limits.memory=512Mi \
  --set resources.requests.cpu=250m \
  --set resources.requests.memory=256Mi \
  --set ingress.enabled=true \
  --set ingress.annotations."kubernetes\.io/ingress\.class"=nginx \
  --set ingress.hosts[0].host=hyperdx.example.com \
  --set ingress.hosts[0].paths[0].path=/ \
  --set ingress.hosts[0].paths[0].pathType=ImplementationSpecific \
  --set env[0].name=CLICKHOUSE_USER \
  --set env[0].value=abc
```

또는 `values.yaml` 파일을 편집하십시오. 기본값을 가져오려면 다음을 실행하십시오:

```shell
helm show values hyperdx/hdx-oss-v2 > values.yaml
```

예제 구성:

```yaml
replicaCount: 2
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: nginx
  hosts:
    - host: hyperdx.example.com
      paths:
        - path: /
          pathType: ImplementationSpecific
  env:
    - name: CLICKHOUSE_USER
      value: abc
```


## ClickStack UI(HyperDX) 애플리케이션 \{#hyperdx\}

### 데이터 소스 설정 \{#datasource-settings\}

ClickStack UI는 각 관측성(Observability) 데이터 유형/축(pillar)에 대해 데이터 소스를 정의해 두어야 합니다:

- `Logs`
- `Traces`
- `Metrics`
- `Sessions`

이 설정은 아래 `Logs` 예시에서 보이는 것처럼 애플리케이션 내 `Team Settings -> Sources` 메뉴에서 수행할 수 있습니다:

<Image img={hyperdx_25} alt="HyperDX Source configuration" size="lg"/>

각 데이터 소스는 생성 시 최소 하나의 테이블과 HyperDX가 데이터를 쿼리할 수 있도록 하는 컬럼 집합을 지정해야 합니다.

ClickStack에 함께 배포되는 [기본 OpenTelemetry (OTel) 스키마](/observability/integrating-opentelemetry#out-of-the-box-schema)를 사용하는 경우, 각 데이터 소스에 필요한 컬럼은 자동으로 추론됩니다. [스키마를 수정](#clickhouse)하거나 커스텀 스키마를 사용하는 경우에는, 사용자가 이 매핑을 직접 지정하고 업데이트해야 합니다.

:::note
ClickStack에 함께 배포되는 ClickHouse 기본 스키마는 [OTel collector용 ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)가 생성하는 스키마입니다. 이 컬럼 이름들은 [여기](https://opentelemetry.io/docs/specs/otel/logs/data-model/)에 문서화된 OTel 공식 스펙과 일치합니다.
:::

각 데이터 소스에는 다음과 같은 설정이 제공됩니다:

#### Logs \{#logs\}

| Setting                        | Description                                                                                                             | Required | Inferred in Default Schema        | Inferred Value                                      |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------------|-----------------------------------------------------|
| `Name`                        | 소스 이름입니다.                                                                                                            | Yes      | No                                | –                                                   |
| `Server Connection`           | 서버 연결 이름입니다.                                                                                                | Yes      | No                                | `Default`                                             |
| `Database`                    | ClickHouse 데이터베이스 이름입니다.                                                                                              | Yes      | Yes                               | `default`                                             |
| `Table`                       | 대상 테이블 이름입니다. 기본 스키마를 사용할 때는 `otel_logs` 로 설정합니다.                                                                                                     | Yes      | No                               |                                            |
| `Timestamp Column`            | 기본 키의 일부인 datetime 컬럼 또는 표현식입니다.                                                        | Yes       | Yes                               | `TimestampTime`                                       |
| `Default Select`              | 기본 검색 결과에 표시되는 컬럼입니다.                                                                               | Yes       | Yes                               | `Timestamp`, `ServiceName`, `SeverityText`, `Body`         |
| `Service Name Expression`     | 서비스 이름을 위한 표현식 또는 컬럼입니다.                                                                             | Yes       | Yes                               | `ServiceName`                                         |
| `Log Level Expression`        | 로그 레벨을 위한 표현식 또는 컬럼입니다.                                                                                | Yes       | Yes                               | `SeverityText`                                        |
| `Body Expression`             | 로그 메시지를 위한 표현식 또는 컬럼입니다.                                                                              | Yes       | Yes                               | `Body`                                                |
| `Log Attributes Expression`   | 사용자 정의 로그 속성을 위한 표현식 또는 컬럼입니다.                                                                        | Yes       | Yes                               | `LogAttributes`                                       |
| `Resource Attributes Expression` | 리소스 수준의 속성을 위한 표현식 또는 컬럼입니다.                                                                  | Yes       | Yes                               | `ResourceAttributes`                                  |
| `Displayed Timestamp Column`  | UI에 표시할 때 사용되는 타임스탬프 컬럼입니다.                                                                                   | Yes       | Yes                               | `ResourceAttributes`                                  |
| `Correlated Metric Source`    | 연관된 메트릭 소스입니다(예: HyperDX 메트릭).                                                                           | No       | No                                | –                                                   |
| `Correlated Trace Source`     | 연관된 트레이스 소스입니다(예: HyperDX 트레이스).                                                                             | No       | No                                | –                                                   |
| `Trace Id Expression`         | Trace ID를 추출하는 데 사용되는 표현식 또는 컬럼입니다.                                                                         | Yes       | Yes                               | `TraceId`                                             |
| `Span Id Expression`          | Span ID를 추출하는 데 사용되는 표현식 또는 컬럼입니다.                                                                          | Yes       | Yes                               | `SpanId`                                              |
| `Implicit Column Expression`  | 필드가 지정되지 않은 경우 전문 검색(Lucene 스타일)에 사용되는 컬럼입니다. 일반적으로 로그 본문입니다.                      | Yes       | Yes                               | `Body`                                                |
| `Highlighted Attributes`      | 로그 상세를 열 때 표시되는 표현식 또는 컬럼입니다. URL을 반환하는 표현식은 링크로 표시됩니다.          | No        | No                                |  –                                                  |
| `Highlighted Trace Attributes` | 트레이스 내 각 로그에서 추출되어 트레이스 워터폴 상단에 표시되는 표현식 또는 컬럼입니다. URL을 반환하는 표현식은 링크로 표시됩니다. | No  | No   |  –                                                  |

#### 트레이스 \{#traces\}

| Setting                          | Description                                                                                                             | Required | Inferred in Default Schema | Inferred Value         |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------|------------------------|
| `Name`                           | 소스 이름입니다.                                                                                                            | Yes      | No                          | –                      |
| `Server Connection`              | 서버 연결 이름입니다.                                                                                                | Yes      | No                          | `Default`              |
| `Database`                       | ClickHouse 데이터베이스 이름입니다.                                                                                              | Yes      | Yes                         | `default`                |
| `Table`                          | 대상 테이블 이름입니다. 기본 스키마를 사용하는 경우 `otel_traces`로 설정합니다.                                                                                                    | Yes      | Yes                         |      -       |
| `Timestamp Column`              | 기본 키의 일부인 DateTime 컬럼 또는 표현식입니다.                                                        | Yes      | Yes                         | `Timestamp`              |
| `Timestamp`                      | `Timestamp Column`의 별칭입니다.                                                                                          | Yes      | Yes                         | `Timestamp`              |
| `Default Select`                | 기본 검색 결과에 표시되는 컬럼들입니다.                                                                               | Yes      | Yes                         | `Timestamp, ServiceName as service, StatusCode as level, round(Duration / 1e6) as duration, SpanName` |
| `Duration Expression`           | span duration을 계산하기 위한 표현식입니다.                                                                              | Yes      | Yes                         | `Duration`               |
| `Duration Precision`            | duration 표현식의 정밀도입니다(예: 나노초, 마이크로초).                                                | Yes      | Yes                         | ns                     |
| `Trace Id Expression`           | trace ID용 표현식 또는 컬럼입니다.                                                                                    | Yes      | Yes                         | `TraceId`                |
| `Span Id Expression`            | span ID용 표현식 또는 컬럼입니다.                                                                                     | Yes      | Yes                         | `SpanId`                 |
| `Parent Span Id Expression`     | 부모 span ID용 표현식 또는 컬럼입니다.                                                                              | Yes      | Yes                         | `ParentSpanId`           |
| `Span Name Expression`          | span 이름용 표현식 또는 컬럼입니다.                                                                                   | Yes      | Yes                         | `SpanName`               |
| `Span Kind Expression`          | span kind(예: client, server)용 표현식 또는 컬럼입니다.                                                              | Yes      | Yes                         | `SpanKind`               |
| `Correlated Log Source`         | 선택 사항입니다. 연결된 로그 소스입니다(예: HyperDX 로그).                                                                       | No       | No                          | –                      |
| `Correlated Session Source`     | 선택 사항입니다. 연결된 세션 소스입니다.                                                                                       | No       | No                          | –                      |
| `Correlated Metric Source`      | 선택 사항입니다. 연결된 메트릭 소스입니다(예: HyperDX 메트릭).                                                                  | No       | No                          | –                      |
| `Status Code Expression`        | span 상태 코드용 표현식입니다.                                                                                   | Yes      | Yes                         | `StatusCode`             |
| `Status Message Expression`     | span 상태 메시지용 표현식입니다.                                                                                | Yes      | Yes                         | `StatusMessage`          |
| `Service Name Expression`       | 서비스 이름용 표현식 또는 컬럼입니다.                                                                             | Yes      | Yes                         | `ServiceName`            |
| `Resource Attributes Expression`| 리소스 수준 속성용 표현식 또는 컬럼입니다.                                                                    | Yes      | Yes                         | `ResourceAttributes`     |
| `Event Attributes Expression`   | 이벤트 속성용 표현식 또는 컬럼입니다.                                                                             | Yes      | Yes                         | `SpanAttributes`         |
| `Span Events Expression`        | span 이벤트를 추출하기 위한 표현식입니다. 일반적으로 `Nested` 타입 컬럼입니다. 지원되는 언어 SDK에서 예외 스택 트레이스를 렌더링할 수 있게 합니다.                                                   | Yes      | Yes                         | `Events`                 |
| `Implicit Column Expression`   | 필드가 지정되지 않은 경우 전문 검색에 사용되는 컬럼입니다(Lucene 스타일). 일반적으로 로그 본문입니다.  | Yes  | Yes  | `SpanName`|
| `Highlighted Attributes`        | span 세부 정보를 열 때 표시되는 표현식 또는 컬럼입니다. URL을 반환하는 표현식은 링크로 표시됩니다.         | No       | No                          |  –                       |
| `Highlighted Trace Attributes` | 트레이스의 각 span에서 추출되어 트레이스 워터폴 위에 표시되는 표현식 또는 컬럼입니다. URL을 반환하는 표현식은 링크로 표시됩니다. | No  | No   |  –                       |

#### Metrics \{#metrics\}

| Setting               | Description                                                                                   | Required | Inferred in Default Schema | Inferred Value              |
|------------------------|-----------------------------------------------------------------------------------------------|----------|-----------------------------|-----------------------------|
| `Name`                 | 소스 이름입니다.                                                                                | Yes      | No                          | –                           |
| `Server Connection`    | 서버 연결 이름입니다.                                                                            | Yes      | No                          | `Default`                   |
| `Database`             | ClickHouse 데이터베이스 이름입니다.                                                             | Yes      | Yes                         | `default`                   |
| `Gauge Table`          | 게이지(gauge) 유형 메트릭을 저장하는 테이블입니다.                                              | Yes      | No                         | `otel_metrics_gauge`        |
| `Histogram Table`      | 히스토그램(histogram) 유형 메트릭을 저장하는 테이블입니다.                                      | Yes      | No                         | `otel_metrics_histogram`    |
| `Sum Table`            | 합계(sum) 유형(카운터) 메트릭을 저장하는 테이블입니다.                                          | Yes      | No                         | `otel_metrics_sum`          |
| `Correlated Log Source`| 선택 사항입니다. 연결할 로그 소스(예: HyperDX 로그)입니다.                                       | No       | No                          | –                           |

#### 세션 \{#settings\}

| Setting                        | Description                                                                                         | Required | Inferred in Default Schema | Inferred Value         |
|-------------------------------|-----------------------------------------------------------------------------------------------------|----------|-----------------------------|------------------------|
| `Name`                        | 소스 이름입니다.                                                                                     | Yes      | No                          | –                      |
| `Server Connection`           | 서버 연결 이름입니다.                                                                                 | Yes      | No                          | `Default`              |
| `Database`                    | ClickHouse 데이터베이스 이름입니다.                                                                   | Yes      | Yes                         | `default`              |
| `Table`                       | 세션 데이터를 저장할 대상 테이블입니다. 기본 스키마를 사용하는 경우 대상 테이블 이름은 `hyperdx_sessions`입니다. | Yes      | Yes                         | -                      |
| `Timestamp Column`           | 기본 키의 일부인 DateTime 컬럼 또는 표현식입니다.                                                  | Yes      | Yes                         | `TimestampTime`            |
| `Log Attributes Expression`   | 세션 데이터에서 로그 레벨 속성을 추출하기 위한 표현식입니다.                                         | Yes      | Yes                         | `LogAttributes`        |
| `LogAttributes`               | 로그 속성을 저장하는 데 사용되는 별칭 또는 필드 참조입니다.                                          | Yes      | Yes                         | `LogAttributes`        |
| `Resource Attributes Expression` | 리소스 레벨 메타데이터를 추출하기 위한 표현식입니다.                                             | Yes      | Yes                         | `ResourceAttributes`   |
| `Correlated Trace Source`     | 선택 사항입니다. 세션과 연관시키는 데 사용되는 연결된 trace 소스입니다.                              | No       | No                          | –                      |
| `Implicit Column Expression`  | 필드가 지정되지 않았을 때 전문 검색에 사용되는 컬럼입니다(예: Lucene 스타일 쿼리 파싱).             | Yes      | Yes                         | `Body` |

#### Highlighted Attributes \{#highlighted-attributes\}

Highlighted Attributes와 Highlighted Trace Attributes는 Log 및 Trace 데이터 소스에서 구성할 수 있습니다.

- Highlighted Attributes는 로그 또는 span 세부 정보를 볼 때 각 로그 또는 span에 대해 표시되는 컬럼이나 표현식입니다.
- Highlighted Trace Attributes는 트레이스 내 각 로그 또는 span에서 쿼리되고 트레이스 워터폴 상단에 표시되는 컬럼이나 표현식입니다.

이러한 속성은 소스 구성에서 정의되며 임의의 SQL 표현식이 될 수 있습니다. SQL 표현식이 URL 형식의 값을 반환하는 경우 해당 속성은 링크로 표시됩니다. 빈 값은 표시되지 않습니다.

예를 들어, 다음 트레이스 소스에는 Highlighted Attribute와 Highlighted Trace Attribute가 구성되어 있습니다:

<Image img={highlighted_attributes_config} alt="Highlighted Attributes 구성" size="md"/>

이러한 속성은 로그 또는 span을 클릭한 후 사이드 패널에 표시됩니다:

<Image img={highlighted_attributes} alt="Highlighted Attributes" size="md"/>

속성을 클릭하면 해당 속성을 검색 값으로 사용하는 옵션이 제공됩니다. 속성 구성에서 선택적인 Lucene 표현식이 제공된 경우, 검색에는 SQL 표현식 대신 Lucene 표현식이 사용됩니다.

<Image img={highlighted_attributes_search} alt="Highlighted Attributes 검색" size="md"/>

### 상관관계 소스 \{#correlated-sources\}

ClickStack에서 완전한 소스 간 상관관계를 활성화하려면 로그, 트레이스, 메트릭, 세션에 대해 상관관계 소스를 구성해야 합니다. 이렇게 하면 HyperDX가 관련 데이터를 연관시키고 이벤트를 렌더링할 때 풍부한 컨텍스트를 제공할 수 있습니다.

- `Logs`: 트레이스 및 메트릭과 상관관계를 가질 수 있습니다.
- `Traces`: 로그, 세션, 메트릭과 상관관계를 가질 수 있습니다.
- `Metrics`: 로그와 상관관계를 가질 수 있습니다.
- `Sessions`: 트레이스와 상관관계를 가질 수 있습니다.

이러한 상관관계를 설정하면 여러 기능을 사용할 수 있습니다. 예를 들어, HyperDX는 트레이스와 함께 관련 로그를 표시하거나, 세션과 연관된 메트릭 이상 징후를 노출할 수 있습니다.

예를 들어, 아래는 상관관계 소스로 구성된 Logs 소스입니다:

<Image img={hyperdx_26} alt="HyperDX 소스 상관관계 구성" size="md"/>

### 애플리케이션 구성 설정 \{#application-configuration-settings\}

:::note ClickHouse Cloud에서 HyperDX
HyperDX가 ClickHouse Cloud에서 관리되는 경우 이 설정은 수정할 수 없습니다.
:::

* `HYPERDX_API_KEY`
  * **기본값:** 없음(필수)
  * **설명:** HyperDX API에 대한 인증 키입니다.
  * **안내:**
  * 텔레메트리 및 로깅에 필수입니다.
  * 로컬 개발 환경에서는 빈 값이 아니기만 하면 어떤 값이든 사용할 수 있습니다.
  * 운영 환경에서는 안전하고 고유한 키를 사용해야 합니다.
  * 계정 생성 후 팀 설정 페이지에서 발급받을 수 있습니다.

* `HYPERDX_LOG_LEVEL`
  * **기본값:** `info`
  * **설명:** 로그 상세(verbosity) 수준을 설정합니다.
  * **옵션:** `debug`, `info`, `warn`, `error`
  * **안내:**
  * 자세한 문제 해결을 위해서는 `debug`를 사용합니다.
  * 일반 운영에는 `info`를 사용합니다.
  * 운영 환경에서는 로그 양을 줄이기 위해 `warn` 또는 `error`를 사용합니다.

* `HYPERDX_API_PORT`
  * **기본값:** `8000`
  * **설명:** HyperDX API 서버의 포트입니다.
  * **안내:**
  * 이 포트를 호스트에서 사용할 수 있는지 확인하십시오.
  * 포트 충돌이 있는 경우 다른 포트로 변경하십시오.
  * API 클라이언트 설정에서 지정한 포트와 일치해야 합니다.

* `HYPERDX_APP_PORT`
  * **기본값:** `8000`
  * **설명:** HyperDX 프론트엔드 애플리케이션용 포트입니다.
  * **안내:**
  * 이 포트를 호스트에서 사용할 수 있는지 확인하십시오.
  * 포트 충돌이 있는 경우 다른 포트로 변경하십시오.
  * 웹 브라우저에서 이 포트에 접근할 수 있어야 합니다.

* `HYPERDX_APP_URL`
  * **기본값:** `http://localhost`
  * **설명:** 프런트엔드 애플리케이션의 기본 URL입니다.
  * **안내:**
  * 프로덕션 환경에서는 서비스 도메인으로 설정하십시오.
  * 프로토콜(http/https)을 포함하십시오.
  * 마지막에 슬래시(/)는 포함하지 마십시오.

* `MONGO_URI`
  * **기본값:** `mongodb://db:27017/hyperdx`
  * **설명:** MongoDB 연결 문자열입니다.
  * **안내:**
  * Docker를 사용하는 로컬 개발 환경에서는 기본값을 사용하십시오.
  * 프로덕션 환경에서는 보안이 적용된 연결 문자열을 사용하십시오.
  * 필요한 경우 인증 정보를 포함하십시오.
  * 예시: `mongodb://user:pass@host:port/db`

* `MINER_API_URL`
  * **기본값:** `http://miner:5123`
  * **설명:** 로그 패턴 마이닝 서비스의 URL입니다.
  * **안내:**
  * Docker를 사용하는 로컬 개발 환경에서는 기본값을 사용하십시오.
  * 운영 환경에서는 miner 서비스의 URL로 설정하십시오.
  * API 서비스에서 접근할 수 있어야 합니다.

* `FRONTEND_URL`
  * **기본값:** `http://localhost:3000`
  * **설명:** 프론트엔드 앱의 URL입니다.
  * **안내:**
  * 로컬 개발 환경에서는 기본값을 사용하십시오.
  * 프로덕션 환경에서는 서비스 도메인으로 설정하십시오.
  * API 서비스에서 이 URL에 접근할 수 있어야 합니다.

* `OTEL_SERVICE_NAME`
  * **기본값:** `hdx-oss-api`
  * **설명:** OpenTelemetry 계측을 위한 서비스 이름입니다.
  * **가이드라인:**
  * HyperDX가 자체적으로 계측되는 경우, HyperDX 서비스에 대해 식별하기 쉬운 이름을 사용합니다.
  * 텔레메트리 데이터에서 HyperDX 서비스를 구분하는 데 도움이 됩니다.

* `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT`
  * **기본값:** `http://localhost:4318`
  * **설명:** OpenTelemetry collector 엔드포인트입니다.
  * **안내:**
  * HyperDX를 자체 계측(self-instrumentation)하는 경우에 적용됩니다.
  * 로컬 개발 환경에서는 기본값을 사용합니다.
  * 프로덕션 환경에서는 사용 중인 collector의 URL로 설정합니다.
  * HyperDX 서비스에서 해당 주소에 접근할 수 있어야 합니다.

* `USAGE_STATS_ENABLED`
  * **기본값:** `true`
  * **설명:** 사용 통계 수집 기능을 켜거나 끕니다.
  * **가이드:**
  * 사용 추적을 비활성화하려면 `false`로 설정합니다
  * 프라이버시 요구사항이 높은 배포 환경에서 유용합니다
  * 제품 개선을 위해 기본값은 `true`로 설정되어 있습니다

* `IS_OSS`
  * **기본값:** `true`
  * **설명:** OSS 모드로 실행되는지 여부를 나타냅니다.
  * **안내:**
  * 오픈 소스 배포에서는 `true`로 유지하십시오.
  * 엔터프라이즈 배포에서는 `false`로 설정하십시오.
  * 사용 가능한 기능에 영향을 미칩니다.

* `IS_LOCAL_MODE`
  * **기본값:** `false`
  * **설명:** 로컬 모드로 실행 중인지 나타냅니다.
  * **가이드:**
  * 로컬 개발 시 `true`로 설정합니다.
  * 일부 프로덕션 기능이 비활성화됩니다.
  * 테스트 및 개발 환경에서 유용합니다.

* `EXPRESS_SESSION_SECRET`
  * **기본값:** `hyperdx is cool 👋`
  * **설명:** Express 세션 관리를 위한 시크릿입니다.
  * **가이드라인:**
  * 운영 환경에서는 반드시 변경하십시오
  * 강력한 난수 문자열을 사용하십시오
  * 시크릿을 안전하게 보호하십시오

* `ENABLE_SWAGGER`
  * **기본값:** `false`
  * **설명:** Swagger API 문서화를 활성화/비활성화합니다.
  * **안내:**
  * API 문서화를 활성화하려면 `true`로 설정합니다
  * 개발 및 테스트 환경에서 유용합니다
  * 운영 환경에서는 비활성화하는 것이 좋습니다

* `BETA_CH_OTEL_JSON_SCHEMA_ENABLED`
  * **기본값:** `false`
  * **설명:** HyperDX에서 JSON 타입에 대한 베타 기능 지원을 활성화합니다. OTel collector에서 JSON 지원을 활성화하려면 [`OTEL_AGENT_FEATURE_GATE_ARG`](#otel-collector)도 참조하십시오.
  * **안내:**
  * ClickStack에서 JSON 지원을 활성화하려면 `true`로 설정하십시오.

## OpenTelemetry collector \{#otel-collector\}

자세한 내용은 「[ClickStack OpenTelemetry Collector](/use-cases/observability/clickstack/ingesting-data/otel-collector)」를 참고하십시오.

- `CLICKHOUSE_ENDPOINT`
  - **기본값:** 독립 실행형 이미지인 경우 *없음(필수)*. All-in-one 또는 Docker Compose 배포판인 경우 통합 ClickHouse 인스턴스로 설정됩니다.
  - **설명:** 텔레메트리 데이터를 내보낼 ClickHouse 인스턴스의 HTTPS URL입니다.
  - **안내:**
    - 포트를 포함한 전체 HTTPS 엔드포인트여야 합니다(예: `https://clickhouse.example.com:8443`)
    - 수집기가 ClickHouse로 데이터를 전송하려면 필수입니다

- `CLICKHOUSE_USER`
  - **기본값:** `default`
  - **설명:** ClickHouse 인스턴스에 인증할 때 사용하는 사용자 이름입니다.
  - **안내:**
    - 사용자에게 `INSERT` 및 `CREATE TABLE` 권한이 있는지 확인하십시오
    - 수집용 전용 사용자를 생성하는 것을 권장합니다

- `CLICKHOUSE_PASSWORD`
  - **기본값:** *없음(인증이 활성화된 경우 필수)*
  - **설명:** 지정된 ClickHouse 사용자의 비밀번호입니다.
  - **안내:**
    - 사용자 계정에 비밀번호가 설정되어 있는 경우 필수입니다
    - 운영 환경 배포에서는 secret을 통해 안전하게 저장하십시오

- `HYPERDX_LOG_LEVEL`
  - **기본값:** `info`
  - **설명:** 수집기의 로그 상세 수준입니다.
  - **안내:**
    - `debug`, `info`, `warn`, `error` 등의 값을 허용합니다
    - 문제 해결 시에는 `debug`를 사용하십시오

- `OPAMP_SERVER_URL`
  - **기본값:** 독립 실행형 이미지인 경우 *없음(필수)*. All-in-one 또는 Docker Compose 배포판인 경우 배포된 HyperDX 인스턴스를 가리킵니다.
  - **설명:** 수집기를 관리하는 데 사용되는 OpAMP 서버의 URL입니다(예: HyperDX 인스턴스). 기본 포트는 `4320`입니다.
  - **안내:**
    - HyperDX 인스턴스를 가리키도록 설정해야 합니다
    - 동적 구성 및 보안 수집이 가능해집니다
    - 생략하는 경우, `OTLP_AUTH_TOKEN` 값을 지정하지 않으면 보안 수집이 비활성화됩니다

- `OTLP_AUTH_TOKEN`
  - **기본값:** *없음*. 독립 실행형 이미지에만 사용됩니다. 
  - **설명:** OTLP 인증 토큰을 지정합니다. 설정된 경우 모든 통신에 이 bearer 토큰이 필요합니다.
  - **안내:**
    - 운영 환경에서 독립 실행형 수집기 이미지를 사용하는 경우 설정을 권장합니다
    
- `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`
  - **기본값:** `default`
  - **설명:** 수집기가 텔레메트리 데이터를 기록하는 ClickHouse 데이터베이스입니다.
  - **안내:**
    - 사용자 정의 데이터베이스 이름을 사용하는 경우 설정하십시오
    - 지정된 사용자가 이 데이터베이스에 접근할 수 있는지 확인하십시오

- `OTEL_AGENT_FEATURE_GATE_ARG`
  - **기본값:** `<empty string>`
  - **설명:** 수집기에서 활성화할 기능 플래그를 설정합니다. `--feature-gates=clickhouse.json`으로 설정하면 수집기에서 JSON 타입에 대한 베타(Beta) 지원이 활성화되어 스키마가 해당 타입으로 생성되도록 합니다. HyperDX에서 JSON 지원을 활성화하려면 [`BETA_CH_OTEL_JSON_SCHEMA_ENABLED`](#hyperdx)도 참고하십시오.
  - **안내:**
    - ClickStack에서 JSON 지원을 활성화하려면 `true`로 설정하십시오.

## ClickHouse \{#clickhouse\}

ClickStack Open Source에는 수 테라바이트 규모를 염두에 두고 설계된 기본 ClickHouse 구성이 포함되어 있지만, 사용자는 워크로드에 맞게 자유롭게 수정하고 최적화할 수 있습니다.

ClickHouse를 효과적으로 튜닝하려면 [parts(파트)](/parts), [partitions(파티션)](/partitions), [shards and replicas(세그먼트와 레플리카)](/shards)와 같은 핵심 스토리지 개념과 [merges(머지)](/merges)가 데이터 삽입 시점에 어떻게 발생하는지 이해해야 합니다. 또한 [primary indices(프라이머리 인덱스)](/primary-indexes), [sparse secondary indices(희소 세컨더리 인덱스)](/optimize/skipping-indexes), 데이터 스키핑 인덱스에 대한 기초와 TTL을 활용한 [데이터 라이프사이클 관리](/observability/managing-data) 기법을 함께 검토할 것을 권장합니다.

ClickStack은 [스키마 사용자 정의](/use-cases/observability/schema-design)를 지원하므로 컬럼 타입을 변경하고(예: 로그에서 새로운 필드를 추출), 코덱과 딕셔너리를 적용하며, 프로젝션을 사용하여 쿼리 성능을 향상시킬 수 있습니다.

또한 materialized view는 뷰의 소스 테이블로 데이터가 기록되고 애플리케이션이 대상 테이블에서 읽는다는 전제하에, [수집 중 데이터 변환 또는 필터링](/use-cases/observability/schema-design#materialized-columns)에 사용할 수 있습니다. materialized view는 ClickStack에서 [쿼리 성능을 직접 가속](/use-cases/observability/clickstack/materialized_views)하는 데에도 활용할 수 있습니다.

자세한 내용은 스키마 설계, 인덱싱 전략, 데이터 관리 모범 사례에 대한 ClickHouse 문서를 참고하십시오. 이들 대부분은 ClickStack 배포 환경에 그대로 적용됩니다.
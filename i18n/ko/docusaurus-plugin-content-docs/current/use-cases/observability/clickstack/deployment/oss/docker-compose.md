---
slug: /use-cases/observability/clickstack/deployment/docker-compose
title: 'Docker Compose'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Docker Compose를 사용한 ClickStack 오픈 소스 배포 - ClickHouse 관측성 스택'
doc_type: 'guide'
keywords: ['ClickStack Docker Compose', 'Docker Compose ClickHouse', 'HyperDX Docker 배포', 'ClickStack 배포 가이드', 'OpenTelemetry Docker Compose']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import JSONSupport from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

모든 ClickStack 오픈 소스 컴포넌트는 개별 Docker 이미지로 각각 배포됩니다:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB**

이 이미지들은 Docker Compose를 사용해 조합하여 로컬에 배포할 수 있습니다.

Docker Compose는 기본 `otel-collector` 설정을 기준으로 관측성과 수집을 위한 추가 포트를 노출합니다:

* `13133`: `health_check` 확장 기능용 상태 확인 엔드포인트
* `24225`: 로그 수집을 위한 Fluentd 수신기
* `4317`: OTLP gRPC 수신기(트레이스, 로그, 메트릭용 표준)
* `4318`: OTLP HTTP 수신기(gRPC 대안)
* `8888`: 콜렉터 자체를 모니터링하기 위한 Prometheus 메트릭 엔드포인트

이 포트들은 다양한 텔레메트리 소스와의 연동을 가능하게 하며, OpenTelemetry collector를 다양한 수집 요구사항에 대응 가능한 프로덕션 준비 상태로 만듭니다.


### 적합한 경우 \{#suitable-for\}

* 로컬 환경 테스트
* 개념 증명(Proof of Concept)
* 장애 허용이 필요 없고 단일 서버로 모든 ClickHouse 데이터를 호스팅할 수 있는 프로덕션 배포
* ClickStack은 배포하지만 ClickHouse는 별도로 호스팅하는 경우(예: ClickHouse Cloud 사용)

## 배포 단계 \{#deployment-steps\}

<br/>

<VerticalStepper headerLevel="h3">

### 리포지토리 클론하기 \{#clone-the-repo\}

Docker Compose로 배포하려면 ClickStack 리포지토리를 클론하고 해당 디렉터리로 이동한 후 `docker-compose up`을 실행합니다:

```shell
git clone https://github.com/ClickHouse/ClickStack.git
docker compose up
```

### HyperDX UI로 이동 \{#navigate-to-hyperdx-ui\}

[http://localhost:8080](http://localhost:8080)에 접속해 HyperDX UI를 엽니다.

요구사항을 충족하는 사용자 이름과 비밀번호를 입력해 사용자를 생성합니다. 

`Create`를 클릭하면 Docker Compose로 배포된 ClickHouse 인스턴스에 대한 데이터 소스가 생성됩니다.

:::note Overriding default connection
통합된 ClickHouse 인스턴스에 대한 기본 연결을 재정의할 수 있습니다. 자세한 내용은 ["Using ClickHouse Cloud"](#using-clickhouse-cloud)를 참고하십시오.
:::

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

대체 ClickHouse 인스턴스를 사용하는 예시는 ["Using ClickHouse Cloud"](#using-clickhouse-cloud)를 참고하십시오.

### 연결 정보 입력 완료 \{#complete-connection-details\}

배포된 ClickHouse 인스턴스에 연결하려면 **Create**를 클릭하고 기본 설정을 그대로 사용하면 됩니다.  

**외부 ClickHouse 클러스터**(예: ClickHouse Cloud)에 연결하려는 경우, 연결 자격 증명을 수동으로 입력할 수 있습니다.

소스를 생성하라는 메시지가 표시되면 기본값은 모두 유지하고 `Table` 필드를 `otel_logs` 값으로 채우십시오. 나머지 설정은 자동으로 감지되므로 **Save New Source**를 클릭해 저장하면 됩니다.

<Image img={hyperdx_logs} alt="로그 소스 생성" size="md"/>

</VerticalStepper>

## Compose 설정 수정 \{#modifying-settings\}

환경 변수 파일을 통해 사용 버전 등 스택 설정을 수정할 수 있습니다.

```shell
user@example-host clickstack % cat .env

# Used by docker-compose.yml
IMAGE_NAME_DOCKERHUB=clickhouse/clickstack-all-in-one
LOCAL_IMAGE_NAME_DOCKERHUB=clickhouse/clickstack-local
ALL_IN_ONE_IMAGE_NAME_DOCKERHUB=clickhouse/clickstack-all-in-one
OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB=clickhouse/clickstack-otel-collector
CODE_VERSION=2.8.0
IMAGE_VERSION_SUB_TAG=.8.0
IMAGE_VERSION=2
IMAGE_NIGHTLY_TAG=2-nightly
IMAGE_LATEST_TAG=latest

# Set up domain URLs
HYPERDX_API_PORT=8000 #optional (should not be taken by other services)
HYPERDX_APP_PORT=8080
HYPERDX_APP_URL=http://localhost
HYPERDX_LOG_LEVEL=debug
HYPERDX_OPAMP_PORT=4320

# Otel/Clickhouse config
HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE=default
```


### OpenTelemetry collector 구성 \{#configuring-collector\}

필요한 경우 OTel collector 구성을 변경할 수 있습니다. 자세한 내용은 ["구성 수정하기"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)를 참조하십시오.

## ClickHouse Cloud 사용 \{#using-clickhouse-cloud\}

이 배포판은 ClickHouse Cloud와 함께 사용할 수 있지만, [Managed ClickStack](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud)과는 다릅니다. 이 구성에서는 ClickStack UI는 직접 관리하면서 ClickHouse Cloud는 컴퓨트와 스토리지용으로만 사용합니다. UI를 독립적으로 운영해야 하는 특별한 이유가 없다면, 통합 인증과 추가 엔터프라이즈 기능을 제공하고 ClickStack UI를 직접 관리할 필요를 제거해 주는 Managed ClickStack 사용을 권장합니다.

다음 작업을 수행해야 합니다:

* `docker-compose.yml` 파일에서 ClickHouse 서비스를 제거합니다. 테스트 목적이라면 선택 사항이며, 배포된 ClickHouse 인스턴스는 단순히 무시되지만 로컬 리소스를 불필요하게 사용하게 됩니다. 서비스를 제거하는 경우, `depends_on`과 같은 해당 서비스에 대한 모든 참조가 삭제되었는지 확인합니다.

* OTel collector가 ClickHouse Cloud 인스턴스를 사용하도록 `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD` 환경 변수를 compose 파일에 설정합니다. 구체적으로, OTel collector 서비스에 다음 환경 변수를 추가합니다:

  ```shell
  otel-collector:
      image: ${OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
      environment:
        CLICKHOUSE_ENDPOINT: '<CLICKHOUSE_ENDPOINT>' # 여기에 HTTPS 엔드포인트 입력
        CLICKHOUSE_USER: '<CLICKHOUSE_USER>'
        CLICKHOUSE_PASSWORD: '<CLICKHOUSE_PASSWORD>'
        HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE: ${HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE}
        HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
        OPAMP_SERVER_URL: 'http://app:${HYPERDX_OPAMP_PORT}'
      ports:
        - '13133:13133' # health_check 확장 기능
        - '24225:24225' # fluentd 수신기
        - '4317:4317' # OTLP gRPC 수신기
        - '4318:4318' # OTLP http 수신기
        - '8888:8888' # metrics 확장 기능
      restart: always
      networks:
        - internal
  ```

  `CLICKHOUSE_ENDPOINT`는 포트 `8443`을 포함한 ClickHouse Cloud HTTPS 엔드포인트여야 합니다. 예를 들어 `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443` 와 같습니다.

* HyperDX UI에 연결하여 ClickHouse 연결을 생성할 때 Cloud 자격 증명을 사용합니다.

<JSONSupport />

이를 설정하려면 `docker-compose.yml`에서 관련 서비스를 수정하십시오:

```yaml
  app:
    image: ${IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
    ports:
      - ${HYPERDX_API_PORT}:${HYPERDX_API_PORT}
      - ${HYPERDX_APP_PORT}:${HYPERDX_APP_PORT}
    environment:
      BETA_CH_OTEL_JSON_SCHEMA_ENABLED: true # enable JSON
      FRONTEND_URL: ${HYPERDX_APP_URL}:${HYPERDX_APP_PORT}
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_API_PORT: ${HYPERDX_API_PORT}
    # truncated for brevity

  otel-collector:
    image: ${OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
    environment:
      OTEL_AGENT_FEATURE_GATE_ARG: '--feature-gates=clickhouse.json' # enable JSON
      CLICKHOUSE_ENDPOINT: 'tcp://ch-server:9000?dial_timeout=10s' 
      # truncated for brevity
```

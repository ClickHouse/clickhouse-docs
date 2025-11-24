---
'slug': '/use-cases/observability/clickstack/deployment/docker-compose'
'title': 'Docker Compose'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 3
'description': 'Docker Compose로 ClickStack 배포하기 - ClickHouse 가시성 스택'
'doc_type': 'guide'
'keywords':
- 'ClickStack Docker Compose'
- 'Docker Compose ClickHouse'
- 'HyperDX Docker deployment'
- 'ClickStack deployment guide'
- 'OpenTelemetry Docker Compose'
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import JSONSupport from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

모든 ClickStack 구성 요소는 개별 Docker 이미지로 별도로 배포됩니다:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) 수집기**
* **MongoDB**

이 이미지들은 Docker Compose를 사용하여 로컬에서 결합하고 배포할 수 있습니다.

Docker Compose는 기본 `otel-collector` 설정에 따라 가시성 및 데이터 수집을 위한 추가 포트를 노출합니다:

- `13133`: `health_check` 확장을 위한 상태 검사 엔드포인트
- `24225`: 로그 수집을 위한 Fluentd 수신기
- `4317`: OTLP gRPC 수신기 (추적, 로그 및 메트릭에 대한 표준)
- `4318`: OTLP HTTP 수신기 (gRPC 대안)
- `8888`: 수집기 자체 모니터링을 위한 Prometheus 메트릭 엔드포인트

이 포트는 다양한 텔레메트리 소스와의 통합을 가능하게 하며 OpenTelemetry 수집기를 다양한 데이터 수집 요구를 충족할 수 있도록 준비합니다.

### 적합한 경우 {#suitable-for}

* 로컬 테스트
* 개념 증명
* 내결함성이 필요하지 않고 하나의 서버에서 모든 ClickHouse 데이터를 호스팅하는 데 충분한 생산 배포
* ClickStack을 배포하지만 ClickHouse를 별도로 호스팅하는 경우(예: ClickHouse Cloud 사용).

## 배포 단계 {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### 레포지토리 복제 {#clone-the-repo}

Docker Compose로 배포하려면 HyperDX 레포지토리를 복제하고 해당 디렉토리로 변경한 후 `docker-compose up`을 실행합니다:

```shell
git clone git@github.com:hyperdxio/hyperdx.git
cd hyperdx

# switch to the v2 branch
git checkout v2
docker compose up
```

### HyperDX UI로 이동 {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080)에 방문하여 HyperDX UI에 액세스합니다.

사용자를 생성하며, 요구사항을 충족하는 사용자 이름과 비밀번호를 제공합니다. 

`Create`를 클릭하면 Helm 차트로 배포된 ClickHouse 인스턴스에 대한 데이터 소스가 생성됩니다.

:::note 기본 연결 재정의
통합된 ClickHouse 인스턴스에 대한 기본 연결을 재정의할 수 있습니다. 자세한 내용은 ["ClickHouse Cloud 사용"](#using-clickhouse-cloud)를 참조하십시오.
:::

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

대체 ClickHouse 인스턴스를 사용하는 예제는 ["ClickHouse Cloud 연결 생성"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)를 참조하십시오.

### 연결 세부정보 완료 {#complete-connection-details}

배포된 ClickHouse 인스턴스에 연결하려면 **Create**를 클릭하고 기본 설정을 수락합니다.  

자신의 **외부 ClickHouse 클러스터**(예: ClickHouse Cloud)에 연결하려면 연결 자격 증명을 수동으로 입력할 수 있습니다.

소스를 생성하라는 메시지가 표시되면 모든 기본값을 유지하고 `Table` 필드에 `otel_logs` 값을 입력합니다. 다른 모든 설정은 자동으로 감지되어 `Save New Source`를 클릭할 수 있게 됩니다.

<Image img={hyperdx_logs} alt="Create logs source" size="md"/>

</VerticalStepper>

## compose 설정 수정 {#modifying-settings}

사용자는 환경 변수 파일을 통해 스택의 설정(사용된 버전 등)을 수정할 수 있습니다:

```shell
user@example-host hyperdx % cat .env

# Used by docker-compose.yml

# Used by docker-compose.yml
HDX_IMAGE_REPO=docker.hyperdx.io
IMAGE_NAME=ghcr.io/hyperdxio/hyperdx
IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx
LOCAL_IMAGE_NAME=ghcr.io/hyperdxio/hyperdx-local
LOCAL_IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx-local
ALL_IN_ONE_IMAGE_NAME=ghcr.io/hyperdxio/hyperdx-all-in-one
ALL_IN_ONE_IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx-all-in-one
OTEL_COLLECTOR_IMAGE_NAME=ghcr.io/hyperdxio/hyperdx-otel-collector
OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx-otel-collector
CODE_VERSION=2.0.0-beta.16
IMAGE_VERSION_SUB_TAG=.16
IMAGE_VERSION=2-beta
IMAGE_NIGHTLY_TAG=2-nightly


# Set up domain URLs
HYPERDX_API_PORT=8000 #optional (should not be taken by other services)
HYPERDX_APP_PORT=8080
HYPERDX_APP_URL=http://localhost
HYPERDX_LOG_LEVEL=debug
HYPERDX_OPAMP_PORT=4320


# Otel/Clickhouse config
HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE=default
```

### OpenTelemetry 수집기 구성 {#configuring-collector}

필요한 경우 OTel 수집기 구성을 수정할 수 있습니다 - 자세한 내용은 ["구성 수정"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)를 참조하십시오.

## ClickHouse Cloud 사용 {#using-clickhouse-cloud}

이 배포는 ClickHouse Cloud와 함께 사용할 수 있습니다. 사용자는 다음을 수행해야 합니다:

- `docker-compose.yaml` 파일에서 ClickHouse 서비스를 제거합니다. 테스트 중이라면 필수는 아니며, 배포된 ClickHouse 인스턴스는 무시됩니다 - 하지만 로컬 자원을 낭비할 수 있습니다. 서비스를 제거할 경우 `depends_on`과 같은 서비스에 대한 참조도 제거해야 합니다.
- OTel 수집기를 ClickHouse Cloud 인스턴스를 사용하도록 수정하려면 compose 파일에서 환경 변수 `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`를 설정합니다. 특히, OTel 수집기 서비스에 환경 변수를 추가합니다:

```shell
otel-collector:
    image: ${OTEL_COLLECTOR_IMAGE_NAME}:${IMAGE_VERSION}
    environment:
      CLICKHOUSE_ENDPOINT: '<CLICKHOUSE_ENDPOINT>' # https endpoint here
      CLICKHOUSE_USER: '<CLICKHOUSE_USER>'
      CLICKHOUSE_PASSWORD: '<CLICKHOUSE_PASSWORD>'
      HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE: ${HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE}
      HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
      OPAMP_SERVER_URL: 'http://app:${HYPERDX_OPAMP_PORT}'
    ports:
      - '13133:13133' # health_check extension
      - '24225:24225' # fluentd receiver
      - '4317:4317' # OTLP gRPC receiver
      - '4318:4318' # OTLP http receiver
      - '8888:8888' # metrics extension
    restart: always
    networks:
      - internal
```

    `CLICKHOUSE_ENDPOINT`는 ClickHouse Cloud HTTPS 엔드포인트여야 하며, 포트 `8443`를 포함해야 합니다. 예: `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

- HyperDX UI에 연결하고 ClickHouse와의 연결을 만들 때 Cloud 자격 증명을 사용합니다.

<JSONSupport/>

이를 설정하려면 `docker-compose.yaml`의 관련 서비스를 수정합니다:

```yaml
app:
  image: ${HDX_IMAGE_REPO}/${IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
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
  image: ${HDX_IMAGE_REPO}/${OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
  environment:
    OTEL_AGENT_FEATURE_GATE_ARG: '--feature-gates=clickhouse.json' # enable JSON
    CLICKHOUSE_ENDPOINT: 'tcp://ch-server:9000?dial_timeout=10s' 
    # truncated for brevity
```

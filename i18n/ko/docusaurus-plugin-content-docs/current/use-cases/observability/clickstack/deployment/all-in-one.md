---
'slug': '/use-cases/observability/clickstack/deployment/all-in-one'
'title': '모두 하나로'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 0
'description': 'ClickStack를 배포하는 방법 ClickHouse Observability Stack - All In One'
'doc_type': 'guide'
'keywords':
- 'ClickStack'
- 'observability'
- 'all-in-one'
- 'deployment'
---

import JSONSupport from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';

이 포괄적인 Docker 이미지는 모든 ClickStack 구성 요소를 포함합니다:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) 수집기** (포트 `4317` 및 `4318`에서 OTLP 노출)
* **MongoDB** (지속적인 애플리케이션 상태를 위한)

이 옵션은 인증을 지원하며, 대시보드, 경고, 저장된 검색의 지속성을 세션 및 사용자 간에 가능하게 합니다.

### 적합한 {#suitable-for}

* 데모
* 전체 스택의 로컬 테스트

## 배포 단계 {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Docker로 배포하기 {#deploy-with-docker}

다음 명령은 OpenTelemetry 수집기(포트 4317 및 4318에서)와 HyperDX UI(포트 8080에서)를 실행합니다.

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### HyperDX UI로 이동 {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080) 를 방문하여 HyperDX UI에 접근합니다.

사용자를 생성하고 요구 사항을 충족하는 사용자 이름과 비밀번호를 제공하세요.

`Create`를 클릭하면 통합된 ClickHouse 인스턴스를 위한 데이터 소스가 생성됩니다.

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

대체 ClickHouse 인스턴스를 사용하는 예시는 ["ClickHouse Cloud 연결 만들기"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)를 참조하세요.

### 데이터 수집하기 {#ingest-data}

데이터 수집에 대한 내용은 ["데이터 수집"](/use-cases/observability/clickstack/ingesting-data)를 참조하세요.

</VerticalStepper>

## 데이터 및 설정 유지하기 {#persisting-data-and-settings}

컨테이너 재시작 간 데이터와 설정을 유지하기 위해 사용자는 위의 docker 명령어를 수정하여 `/data/db`, `/var/lib/clickhouse`, `/var/log/clickhouse-server` 경로를 마운트할 수 있습니다. 예를 들어:

```shell

# ensure directories exist
mkdir -p .volumes/db .volumes/ch_data .volumes/ch_logs

# modify command to mount paths
docker run \
  -p 8080:8080 \
  -p 4317:4317 \
  -p 4318:4318 \
  -v "$(pwd)/.volumes/db:/data/db" \
  -v "$(pwd)/.volumes/ch_data:/var/lib/clickhouse" \
  -v "$(pwd)/.volumes/ch_logs:/var/log/clickhouse-server" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

## 프로덕션에 배포하기 {#deploying-to-production}

다음과 같은 이유로 이 옵션은 프로덕션에 배포되어서는 안 됩니다:

- **비지속적 스토리지:** 모든 데이터는 Docker 기본 오버레이 파일 시스템을 사용하여 저장됩니다. 이 설정은 대규모 성능을 지원하지 않으며, 컨테이너가 제거되거나 재시작되면 데이터가 손실됩니다 - 사용자가 [필요한 파일 경로를 마운트](#persisting-data-and-settings)하지 않는 한.
- **구성 요소 격리 부족:** 모든 구성 요소가 단일 Docker 컨테이너 내에서 실행됩니다. 이는 독립적인 확장 및 모니터링을 방해하며 모든 프로세스에 `cgroup` 제한을 전역적으로 적용합니다. 결과적으로 구성 요소가 CPU 및 메모리를 경쟁할 수 있습니다.

## 포트 사용자 정의하기 {#customizing-ports-deploy}

HyperDX 로컬에서 실행되는 응용 프로그램(8080) 또는 API(8000) 포트를 사용자 정의해야 하는 경우, 적절한 포트를 전달하고 몇 가지 환경 변수를 설정하기 위해 `docker run` 명령을 수정해야 합니다.

OpenTelemetry 포트는 포트 포워딩 플래그를 수정하여 간단히 변경할 수 있습니다. 예를 들어, `-p 4318:4318`을 `-p 4999:4318`로 바꾸어 OpenTelemetry HTTP 포트를 4999로 변경할 수 있습니다.

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4999:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

## ClickHouse Cloud 사용하기 {#using-clickhouse-cloud}

이 배포는 ClickHouse Cloud와 함께 사용할 수 있습니다. 로컬 ClickHouse 인스턴스는 여전히 배포되지만(무시됨), OTel 수집기는 환경 변수 `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`를 설정하여 ClickHouse Cloud 인스턴스를 사용하는 것으로 구성할 수 있습니다. 

예를 들어:

```shell
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

`CLICKHOUSE_ENDPOINT`는 포트 `8443`를 포함하는 ClickHouse Cloud HTTPS 엔드포인트여야 하며, 예를 들면 `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`와 같습니다.

HyperDX UI에 연결될 때, [`팀 설정`](http://localhost:8080/team)으로 이동하여 ClickHouse Cloud 서비스에 대한 연결을 생성하고 필요한 소스를 확인하십시오. 예시 흐름은 [여기]( /use-cases/observability/clickstack/getting-started#create-a-cloud-connection)를 참조하세요.

## OpenTelemetry 수집기 구성하기 {#configuring-collector}

OTel 수집기 구성을 필요시 수정할 수 있습니다 - ["구성 수정하기"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)를 참조하세요.

<JSONSupport/>

예를 들어:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

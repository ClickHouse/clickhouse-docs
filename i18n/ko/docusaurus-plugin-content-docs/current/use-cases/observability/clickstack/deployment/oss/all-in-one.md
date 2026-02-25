---
slug: /use-cases/observability/clickstack/deployment/all-in-one
title: '올인원(All in One)'
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: 'All-in-one 구성을 사용하여 ClickStack Open Source를 배포 - ClickHouse 관측성 스택'
doc_type: 'guide'
keywords: ['ClickStack Open Source ', '관측성', 'all-in-one', '배포']
---

import JSONSupport from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';

이 포괄적인 Docker 이미지는 모든 ClickStack 오픈 소스 컴포넌트를 포함합니다:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector** (`4317` 및 `4318` 포트에서 OTLP를 노출)
* **MongoDB** (애플리케이션 상태를 영구적으로 저장하기 위한 용도)

이 옵션에는 인증 기능이 포함되어 있어, 세션 및 사용자 전반에 걸쳐 대시보드, 알림, 저장된 검색을 지속적으로 유지할 수 있습니다.


### 적합한 사용 사례 \{#suitable-for\}

* 데모
* 전체 스택 로컬 테스트

## 배포 단계 \{#deployment-steps\}

<br/>

<VerticalStepper headerLevel="h3">

### Docker로 배포 \{#deploy-with-docker\}

다음 명령은 OpenTelemetry collector(포트 4317 및 4318)와 HyperDX UI(포트 8080)를 실행합니다.

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

:::note 이미지 이름 업데이트
ClickStack 이미지는 이제 `clickhouse/clickstack-*`(이전에는 `docker.hyperdx.io/hyperdx/*`)로 게시됩니다.
:::

### HyperDX UI로 이동 \{#navigate-to-hyperdx-ui\}

[http://localhost:8080](http://localhost:8080)으로 이동하여 HyperDX UI에 접속합니다.

요구 사항을 충족하는 사용자 이름과 비밀번호를 입력하여 사용자를 생성합니다. 

`Create`를 클릭하면 통합된 ClickHouse 인스턴스용 데이터 소스가 생성됩니다.

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

다른 ClickHouse 인스턴스를 사용하는 예시는 「[ClickHouse Cloud 사용하기](#using-clickhouse-cloud)」를 참조하십시오.

### 데이터 수집 \{#ingest-data\}

데이터를 수집하는 방법은 「[데이터 수집](/use-cases/observability/clickstack/ingesting-data)」을 참조하십시오.

</VerticalStepper>

## 데이터와 설정 유지 \{#persisting-data-and-settings\}

컨테이너를 다시 시작하더라도 데이터와 설정을 유지하려면, 위의 Docker 명령을 수정하여 `/data/db`, `/var/lib/clickhouse`, `/var/log/clickhouse-server` 경로를 마운트하면 됩니다. 예를 들어 다음과 같습니다:

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
  clickhouse/clickstack-all-in-one:latest
```


## 운영 환경 배포 \{#deploying-to-production\}

다음과 같은 이유로 이 옵션은 운영 환경에 배포해서는 안 됩니다.

- **비영구 스토리지:** 모든 데이터가 Docker 기본 오버레이 파일 시스템을 사용해 저장됩니다. 이 구성은 대규모 환경에서의 성능을 보장하지 못하며, 컨테이너가 제거되거나 재시작되면 (사용자가 [필요한 파일 경로를 마운트](#persisting-data-and-settings)하지 않는 한) 데이터가 손실됩니다.
- **컴포넌트 격리 부족:** 모든 컴포넌트가 하나의 Docker 컨테이너 내에서 실행됩니다. 이로 인해 개별적인 확장 및 모니터링이 불가능해지고, 모든 프로세스에 `cgroup` 제한이 전역적으로 적용됩니다. 그 결과, 컴포넌트 간에 CPU와 메모리를 두고 경쟁이 발생할 수 있습니다.

## 포트 커스터마이징 \{#customizing-ports-deploy\}

HyperDX Local이 사용하는 애플리케이션 포트(8080) 또는 API 포트(8000)를 커스터마이징하려면, 적절한 포트를 포워딩하도록 `docker run` 명령을 수정하고 몇 가지 환경 변수를 설정해야 합니다.

OpenTelemetry 포트는 포트 포워딩 옵션만 수정하여 간단히 변경할 수 있습니다. 예를 들어 OpenTelemetry HTTP 포트를 4999로 변경하려면 `-p 4318:4318` 대신 `-p 4999:4318`로 교체하면 됩니다.

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4999:4318 clickhouse/clickstack-all-in-one:latest
```


## ClickHouse Cloud 사용하기 \{#using-clickhouse-cloud\}

이 배포본은 ClickHouse Cloud와 함께 사용할 수 있습니다. 로컬 ClickHouse 인스턴스도 여전히 배포되지만 사용되지는 않으며, 환경 변수 `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`를 설정하여 OTel collector가 ClickHouse Cloud 인스턴스를 사용하도록 구성할 수 있습니다.

예를 들면 다음과 같습니다.

```shell
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

`CLICKHOUSE_ENDPOINT`는 포트 `8443`을 포함한 ClickHouse Cloud HTTPS 엔드포인트여야 합니다. 예를 들어 `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`와 같습니다.

HyperDX UI에 접속한 후 [`Team Settings`](http://localhost:8080/team)로 이동하여 ClickHouse Cloud 서비스에 대한 연결을 생성하고, 이어서 필요한 소스를 추가합니다.


## OpenTelemetry collector 구성 \{#configuring-collector\}

필요한 경우 OTel collector 구성을 수정할 수 있습니다. 자세한 내용은 [「구성 수정」](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)을 참조하십시오.

<JSONSupport />

예를 들어 다음과 같습니다.

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

---
slug: /use-cases/observability/clickstack/deployment/hyperdx-only
title: 'HyperDX 전용'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'HyperDX만 배포하기'
doc_type: 'guide'
keywords: ['HyperDX 단독 배포', 'HyperDX ClickHouse 통합', 'HyperDX만 배포', 'HyperDX Docker 설치', 'ClickHouse 시각화 도구']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

이 옵션은 이미 관측성 또는 이벤트 데이터가 적재된 상태로 실행 중인 ClickHouse 인스턴스를 보유한 경우를 위해 설계되었습니다.

HyperDX는 스택의 나머지 구성 요소와 독립적으로 사용할 수 있으며 OpenTelemetry(OTel)뿐만 아니라 모든 데이터 스키마와 호환됩니다. 따라서 이미 ClickHouse 위에 구축된 커스텀 관측성 파이프라인에도 적합합니다.

전체 기능을 활성화하려면 대시보드, 저장된 검색, 사용자 설정, 알림 등 애플리케이션 상태를 저장할 MongoDB 인스턴스를 별도로 제공해야 합니다.

이 모드에서는 데이터 수집이 전적으로 사용자에게 맡겨집니다. 자체 호스팅한 OpenTelemetry collector, 클라이언트 라이브러리에서의 직접 수집, Kafka 또는 S3와 같은 ClickHouse 기본 테이블 엔진(table engines), ETL 파이프라인, ClickPipes와 같은 관리형 수집 서비스를 사용하여 ClickHouse로 데이터를 수집할 수 있습니다. 이러한 접근 방식은 최대한의 유연성을 제공하며, 이미 ClickHouse를 운영 중이고 그 위에 HyperDX를 추가하여 시각화, 검색, 알림 기능을 제공하려는 팀에 적합합니다.


### 적합한 대상 \{#suitable-for\}

- 기존 ClickHouse 사용자
- 사용자 정의 이벤트 파이프라인

## 배포 단계 \{#deployment-steps\}

<br/>

<VerticalStepper headerLevel="h3">

### Docker로 배포 \{#deploy-hyperdx-with-docker\}

다음 명령을 실행하고, 필요에 따라 `YOUR_MONGODB_URI` 값을 수정합니다. 

```shell
docker run -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```

### HyperDX UI로 이동 \{#navigate-to-hyperdx-ui\}

[http://localhost:8080](http://localhost:8080)에 접속하여 HyperDX UI를 엽니다.

요구 사항을 충족하는 사용자 이름과 비밀번호를 입력해 사용자를 생성합니다. 

`Create`를 클릭하면 연결 세부 정보를 입력하라는 프롬프트가 표시됩니다.

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

### 연결 세부 정보 입력 완료 \{#complete-connection-details\}

예를 들어 ClickHouse Cloud와 같이 외부에 있는 자체 ClickHouse 클러스터에 연결합니다.

<Image img={hyperdx_2} alt="HyperDX 로그인" size="md"/>

소스 생성을 요청받은 경우 기본값은 모두 유지하고, `Table` 필드에 `otel_logs` 값을 입력합니다. 나머지 설정은 자동으로 감지되므로 `Save New Source`를 클릭하면 됩니다.

:::note 소스 생성
소스를 생성하려면 ClickHouse에 테이블이 이미 존재해야 합니다. 데이터가 없는 경우, 테이블을 생성하기 위해 ClickStack OpenTelemetry collector를 배포할 것을 권장합니다.
:::

</VerticalStepper>

## Docker Compose 사용하기 \{#using-docker-compose\}

[Docker Compose 구성](/use-cases/observability/clickstack/deployment/docker-compose)을 수정하면, 이 가이드와 동일한 구성을 구현하면서 매니페스트에서 OTel collector와 ClickHouse 인스턴스를 제거할 수 있습니다.

## ClickStack OpenTelemetry collector \{#otel-collector\}

스택의 다른 구성 요소와는 독립적으로 OpenTelemetry collector를 운영하는 경우에도 ClickStack 배포판 collector 사용을 권장합니다. 이렇게 하면 기본 스키마가 사용되고 수집에 대한 모범 사례가 적용됩니다.

독립 실행형 collector 배포 및 구성에 대한 자세한 내용은 [「Ingesting with OpenTelemetry」](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)를 참고하십시오.

<JSONSupport />

HyperDX 전용 이미지의 경우에는 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` 파라미터만 설정하면 됩니다. 예:

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```

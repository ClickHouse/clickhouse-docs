---
'slug': '/use-cases/observability/clickstack/deployment/hyperdx-only'
'title': 'HyperDX 전용'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 4
'description': 'HyperDX만 배포하기'
'doc_type': 'guide'
'keywords':
- 'HyperDX standalone deployment'
- 'HyperDX ClickHouse integration'
- 'deploy HyperDX only'
- 'HyperDX Docker installation'
- 'ClickHouse visualization tool'
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

This option is designed for users who already have a running ClickHouse instance populated with observability or event data.

HyperDX는 나머지 스택과 독립적으로 사용될 수 있으며, 데이터 스키마와 호환됩니다 - OpenTelemetry (OTel)뿐만 아니라. 이는 ClickHouse 위에 이미 구축된 커스텀 관측성 파이프라인에 적합합니다.

전체 기능을 활성화하려면 대시보드, 저장된 검색, 사용자 설정 및 알림을 포함한 애플리케이션 상태를 저장할 MongoDB 인스턴스를 제공해야 합니다.

이 모드에서는 데이터 수집이 전적으로 사용자에게 맡겨집니다. 자신이 호스팅하는 OpenTelemetry 수집기를 사용하거나, 클라이언트 라이브러리에서 직접 수집하거나, ClickHouse 고유 테이블 엔진(예: Kafka 또는 S3), ETL 파이프라인 또는 ClickPipes와 같은 관리형 수집 서비스를 통해 ClickHouse로 데이터를 수집할 수 있습니다. 이 접근 방식은 최대의 유연성을 제공하며 ClickHouse를 이미 운영하고 있는 팀이 HyperDX를 시각화, 검색 및 알림을 위하여 추가할 수 있도록 적합합니다.

### Suitable for {#suitable-for}

- 기존 ClickHouse 사용자
- 커스텀 이벤트 파이프라인

## Deployment steps {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Deploy with Docker {#deploy-hyperdx-with-docker}

다음 명령을 실행하고, 필요한 경우 `YOUR_MONGODB_URI`를 수정하십시오.

```shell
docker run -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```

### Navigate to the HyperDX UI {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080)에 방문하여 HyperDX UI에 접속하십시오.

사용자를 생성하고, 요구 사항을 충족하는 사용자 이름과 비밀번호를 제공하십시오.

`Create`를 클릭하면 연결 세부정보를 입력하라는 메시지가 표시됩니다.

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

### Complete connection details {#complete-connection-details}

자신의 외부 ClickHouse 클러스터에 연결하십시오. 예: ClickHouse Cloud.

<Image img={hyperdx_2} alt="HyperDX Login" size="md"/>

소스를 생성하라는 메시지가 표시되면, 모든 기본값을 유지하고 `Table` 필드를 `otel_logs` 값으로 완성하십시오. 다른 모든 설정은 자동으로 감지되어 `Save New Source`를 클릭할 수 있습니다.

:::note 소스 생성
소스를 생성하려면 ClickHouse에 테이블이 존재해야 합니다. 데이터가 없는 경우, 테이블을 생성하기 위해 ClickStack OpenTelemetry 수집기를 배포하는 것을 추천합니다.
:::

</VerticalStepper>

## Using Docker Compose {#using-docker-compose}

사용자는 [Docker Compose 구성](/use-cases/observability/clickstack/deployment/docker-compose)을 수정하여 이 가이드와 동일한 효과를 얻을 수 있으며, 매니페스트에서 OTel 수집기와 ClickHouse 인스턴스를 제거할 수 있습니다.

## ClickStack OpenTelemetry collector {#otel-collector}

독립적으로 다른 구성 요소와 관계없이 자체 OpenTelemetry 수집기를 관리하는 경우에도 ClickStack 배포판의 수집기를 사용하는 것을 권장합니다. 이는 기본 스키마가 사용되도록 하고 수집에 대한 모범 사례가 적용되도록 보장합니다.

독립형 수집기를 배포하고 구성하는 방법에 대한 자세한 내용은 ["OpenTelemetry로 데이터 수집하기"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)를 참조하십시오.

<JSONSupport/>

HyperDX 전용 이미지의 경우 사용자는 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` 매개변수만 설정하면 됩니다. 예:

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```

---
'slug': '/use-cases/observability/clickstack/deployment/local-mode-only'
'title': '로컬 모드 전용'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 5
'description': '로컬 모드 전용 ClickStack 배포 - ClickHouse 관찰 가능성 스택'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'deployment'
- 'setup'
- 'configuration'
- 'observability'
---

import Image from '@theme/IdealImage';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

비슷하게 [일체형 이미지](/use-cases/observability/clickstack/deployment/docker-compose), 이 종합적인 Docker 이미지는 모든 ClickStack 구성 요소를 포함합니다:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) 수집기** (포트 `4317` 및 `4318`에서 OTLP 노출)
* **MongoDB** (영구적인 애플리케이션 상태를 위한)

**하지만, 이 HyperDX 배포판에서는 사용자 인증이 비활성화되어 있습니다.**

### 적합한 경우 {#suitable-for}

* 데모
* 디버깅
* HyperDX가 사용되는 개발

## 배포 단계 {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Docker로 배포 {#deploy-with-docker}

로컬 모드는 포트 8080에서 HyperDX UI를 배포합니다.

```shell
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

### HyperDX UI에 접속 {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080)에 방문하여 HyperDX UI에 접근하세요.

**이 배포 모드에서는 인증이 활성화되어 있지 않으므로 사용자 생성 프롬프트가 표시되지 않습니다.**

자신의 외부 ClickHouse 클러스터에 연결합니다. 예: ClickHouse Cloud.

<Image img={hyperdx_2} alt="로그인 생성" size="md"/>

소스를 생성하고 모든 기본값을 유지하며 `Table` 필드를 `otel_logs`로 완성합니다. 다른 모든 설정은 자동으로 감지되므로 `새로운 소스 저장`을 클릭할 수 있습니다.

<Image img={hyperdx_logs} alt="로그 소스 생성" size="md"/>

</VerticalStepper>

<JSONSupport/>

로컬 모드 전용 이미지의 경우, 사용자는 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` 파라미터만 설정하면 됩니다. 예:

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

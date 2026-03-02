---
slug: /use-cases/observability/clickstack/deployment/local-mode-only
title: '로컬 모드만 사용'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: '로컬 모드만 사용하는 ClickStack 배포 - ClickHouse 관측성 스택'
doc_type: 'guide'
keywords: ['clickstack', '배포', '설정', '구성', '관측성']
---

import Image from '@theme/IdealImage';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

[all-in-one 이미지](/use-cases/observability/clickstack/deployment/docker-compose)와 마찬가지로, 이 포괄적인 Docker 이미지는 모든 ClickStack 컴포넌트를 함께 제공합니다:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector** (`4317` 및 `4318` 포트에서 OTLP를 노출)
* **MongoDB** (애플리케이션 상태 영구 저장용)

**그러나 이 HyperDX 배포에서는 사용자 인증이 비활성화되어 있습니다**


### 적합한 용도 \{#suitable-for\}

* 데모
* 디버깅
* HyperDX를 사용하는 개발

## 배포 단계 \{#deployment-steps\}

<br />

<VerticalStepper headerLevel="h3">
  ### Docker로 배포

  로컬 모드에서는 HyperDX UI가 포트 8080에서 실행됩니다.

  ```shell
  docker run -p 8080:8080 clickhouse/clickstack-local:latest
  ```

  ### HyperDX UI로 이동

  HyperDX UI에 접속하려면 [http://localhost:8080](http://localhost:8080)을 방문합니다.

  **이 배포 모드에서는 인증이 활성화되어 있지 않으므로, 사용자 생성 화면이 표시되지 않습니다.**

  보유 중인 외부 ClickHouse 클러스터(예: ClickHouse Cloud)에 연결합니다.

  <Image img={hyperdx_2} alt="로그인 생성" size="md" />

  소스를 생성한 다음, 기본값은 모두 유지하고 `Table` 필드에 `otel_logs` 값을 입력합니다. 다른 설정은 모두 자동으로 감지되므로 `Save New Source`를 클릭하면 됩니다.

  <Image img={hyperdx_logs} alt="로그 소스 생성" size="md" />
</VerticalStepper>

<JSONSupport />

로컬 모드 전용 이미지의 경우에는 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` 파라미터만 설정하면 됩니다. 예를 들어:

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 clickhouse/clickstack-local:latest
```

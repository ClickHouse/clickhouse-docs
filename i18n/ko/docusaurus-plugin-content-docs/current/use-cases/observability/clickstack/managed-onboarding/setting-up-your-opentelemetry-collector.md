---
slug: /use-cases/observability/clickstack/setting-up-your-opentelemetry-collector
title: 'OpenTelemetry Collector 설정하기'
description: 'Managed ClickStack용 OpenTelemetry Collector 설정하기'
doc_type: 'guide'
keywords: ['clickstack', 'opentelemetry', 'collector', 'managed', 'observability', 'gateway', 'otelgen']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

import Image from '@theme/IdealImage';
import clickhouse_cloud_connection from '@site/static/images/use-cases/observability/clickstack-cloud-connect.png';
import clickstack_cloud from '@site/static/images/use-cases/observability/clickstack-cloud-first-time.png';
import clickstack_start_ingestion from '@site/static/images/use-cases/observability/clickstack-start-ingestion.png';
import clickstack_start_exploring from '@site/static/images/use-cases/observability/clickstack-start-exploring.png';
import clickstack_search from '@site/static/images/use-cases/observability/clickstack-search.png';

이 가이드는 기존 Managed ClickStack 서비스에 OpenTelemetry(OTel) collector를 배포한 다음, 이를 통해 데이터가 정상적으로 흐르는지 확인하는 방법을 안내합니다.

collector는 **gateway**로 실행됩니다. 즉, 애플리케이션, SDK, agent collector가 전송 대상으로 사용하는 단일 OTLP 엔드포인트입니다. gateway는 이벤트를 배치로 묶고, 구성된 processing을 적용한 다음, [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)를 통해 ClickHouse에 기록합니다. 이 패턴을 사용하면 수집 로직을 애플리케이션 코드에서 분리할 수 있고, 데이터를 생성하는 workload와 독립적으로 수집 규모를 확장할 수 있습니다. gateway와 agent 역할에 대한 자세한 내용은 [Collector roles](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)를 참조하십시오.

이 가이드는 [Managed ClickStack 시작하기](/use-cases/observability/clickstack/getting-started/managed) 가이드를 완료했으며 연결 자격 증명을 준비해 두었다고 가정합니다.

<VerticalStepper headerLevel="h2">
  ## 자격 증명 수집 \{#gather-credentials\}

  다음이 필요합니다:

  * 프로토콜과 포트를 포함한 ClickHouse Cloud 서비스의 HTTPS endpoint입니다. 예를 들어 `https://abc123xyz.us-central1.gcp.clickhouse.cloud:8443`와 같습니다.
  * 수집에 사용할 ClickHouse 사용자 이름과 비밀번호.

  이 정보를 기록해 두지 않으셨다면, [ClickHouse Cloud 콘솔](https://console.clickhouse.cloud)에서 서비스를 열고 **Connect**를 선택하십시오. 이후 표시되는 대화 상자에서 URL을 확인하여 기록해 두십시오. 수집 전용 사용자는 아래에서 생성합니다.

  <Image img={clickhouse_cloud_connection} size="lg" alt="HTTPS endpoint 및 비밀번호가 표시된 서비스 연결 패널" border />

  ## 수집 사용자 생성 \{#create-ingestion-user\}

  `default`를 재사용하는 대신 collector 전용 사용자를 생성하는 것을 권장합니다. SQL 콘솔을 통해 서비스에 연결한 후 다음 명령을 실행하십시오:

  ```sql
  CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
  GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
  ```

  :::tip
  위 코드 조각의 비밀번호를 강력한 값으로 변경하십시오.
  :::

  collector는 처음 사용 시 `otel` 데이터베이스 내에 로그, 트레이스, 메트릭의 스키마를 생성합니다. 프로덕션 사용자 설정에 대한 자세한 안내는 [프로덕션으로 전환](/use-cases/observability/clickstack/production#create-a-database-ingestion-user-managed)을 참조하십시오.

  ## collector 배포 \{#deploy-the-collector\}

  OpenTelemetry 데이터를 전송하는 애플리케이션과 인프라에서 접근할 수 있는 위치에 collector를 배포하십시오. 아래 예시에서는 설명을 단순화하기 위해 collector를 로컬에서 실행하고 동일한 머신에서 임의의 텔레메트리 데이터를 생성합니다.

  :::note info
  프로덕션 환경에서는 일반적으로 Kubernetes 클러스터 또는 OpenTelemetry SDK, 에이전트, 다른 collector에서 접근할 수 있는 가상 머신에 collector를 배포합니다. 이렇게 하면 환경 전반의 텔레메트리 데이터를 중앙에서 수집하여 ClickStack으로 전달할 수 있습니다.
  :::

  collector로 데이터를 전송하는 클라이언트를 인증할 공유 시크릿을 선택한 후, 접속 정보 및 `hyperdx_ingest` 사용자에 대해 선택한 비밀번호와 함께 내보내십시오:

  ```shell
  export CLICKHOUSE_ENDPOINT=<HTTPS_ENDPOINT>
  export CLICKHOUSE_USER=hyperdx_ingest
  export CLICKHOUSE_PASSWORD=ClickH0u3eRocks123!
  export OTLP_AUTH_TOKEN="a-strong-shared-secret"
  ```

  ClickStack OTel collector를 실행합니다:

  ```shell
  docker run -d \
    -e OTLP_AUTH_TOKEN=${OTLP_AUTH_TOKEN} \
    -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
    -e CLICKHOUSE_USER=${CLICKHOUSE_USER} \
    -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
    -e HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE=otel \
    -p 4317:4317 \
    -p 4318:4318 \
    clickhouse/clickstack-otel-collector:latest
  ```

  이제 collector가 `4317` 포트에서 OTLP gRPC를, `4318` 포트에서 OTLP HTTP를 노출합니다. 애플리케이션, SDK, agent collector는 요청 헤더에 `authorization: $OTLP_AUTH_TOKEN`을 포함하여 해당 포트로 데이터를 전송해야 합니다.

  :::note[프로덕션 배포]
  프로덕션 환경에서는 OTLP 엔드포인트에 TLS를 활성화하는 것을 권장합니다. [collector 보안 설정](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector)을 참조하십시오.
  :::

  ## 엔드포인트 확인 \{#verify-the-endpoint\}

  전체 파이프라인이 정상적으로 작동하는지 확인하기 위해 collector에 합성 트래픽을 생성합니다. OTLP 로그, 트레이스, 메트릭을 전송하는 소형 CLI 도구인 [`otelgen`](https://github.com/krzko/otelgen)을 사용합니다.

  Homebrew를 사용하여 `otelgen`을 설치하세요:

  ```shell
  brew install krzko/tap/otelgen
  ```

  또는 Go를 사용하는 경우:

  ```shell
  go install github.com/krzko/otelgen@latest
  ```

  collector에 로그를 짧게 전송하십시오:

  ```shell
   otelgen \
    --otel-exporter-otlp-endpoint localhost:4317 \
    --insecure \
    --protocol grpc \
    --header "authorization=${OTLP_AUTH_TOKEN}" \
    --rate 5 \
    --duration 60 \
    logs multi
  ```

  동일한 트레이스 및 메트릭 명령어와 기타 `otelgen` 하위 명령어에 대한 안내는 [otelgen을 활용한 합성 데이터](/use-cases/observability/clickstack/getting-started/otelgen)를 참조하십시오.

  ## ClickStack UI에서 확인 \{#confirm-in-ui\}

  [ClickHouse Cloud 콘솔](https://console.clickhouse.cloud)에서 서비스를 열고 왼쪽 메뉴에서 **ClickStack**을 선택한 다음 **Start Ingestion**을 선택하십시오.

  <Image img={clickstack_cloud} size="lg" alt="ClickStack 시작하기" border />

  collector를 이미 구성했으므로 다음 단계는 건너뛰어도 됩니다. **Launch ClickStack**을 클릭하여 계속 진행하십시오.

  ClickStack이 새 탭에서 열리면 **시작하기** 페이지로 자동으로 이동됩니다. 그렇지 않은 경우 왼쪽 메뉴에서 **시작하기**를 선택한 다음 **Start Ingestion**을 클릭하고 **다음**을 클릭하십시오.

  <Image img={clickstack_start_ingestion} size="lg" alt="ClickStack 수집 시작하기" border />

  ClickStack이 테이블과 텔레메트리 데이터를 자동으로 감지하면 다음 단계로 진행할 수 있습니다. **Start Exploring**을 선택하여 트레이스 데이터 탐색을 시작하세요.

  <Image img={clickstack_start_exploring} size="lg" alt="ClickStack 둘러보기 시작하기" border />

  소스를 `Logs`로 전환하고 시간 범위를 **Last 15 minutes**로 설정하십시오. `otelgen`에서 생성된 합성 로그가 몇 초 안에 표시됩니다.

  <Image img={clickstack_search} size="lg" alt="로그가 표시되는 ClickStack Search view" />

  아무것도 표시되지 않는 경우:

  * `otelgen`에 전달한 `OTLP_AUTH_TOKEN` 값이 collector에 설정된 값과 일치하는지 확인하십시오.
  * `docker logs -f <container-id>`로 collector 로그를 실시간으로 확인하고 내보내기 오류가 있는지 살펴보십시오.
  * `CLICKHOUSE_ENDPOINT`에 프로토콜과 포트(`https://...:8443`)가 모두 포함되어 있는지 확인하세요.

  ## 추가 자료 \{#further-reading\}

  이 가이드는 가장 단순한 형태의 단일 collector 인스턴스를 다룹니다. 다음 단계에 대한 자세한 내용은 [OpenTelemetry Collector 참고](/use-cases/observability/clickstack/ingesting-data/otel-collector)를 참조하십시오.

  * [OTLP endpoint에서 TLS를 사용하고 최소 권한 수집 사용자로 collector 보호하기](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector)
  * [gateway에서 이벤트 처리, 필터링 및 보강](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching)
  * [사용자 지정 수신기, 프로세서, 파이프라인을 사용해 collector 구성 확장하기](/use-cases/observability/clickstack/ingesting-data/otel-collector#extending-collector-config).
  * [리소스 산정](/use-cases/observability/clickstack/ingesting-data/otel-collector#estimating-resources): 예상 처리량에 맞춰 gateway 및 agent 배포에 필요한 리소스를 추정합니다.
  * [프로덕션 환경으로 전환하기](/use-cases/observability/clickstack/production)에서 프로덕션 전환 시 권장 사항을 확인하십시오.
</VerticalStepper>
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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import GatherCredentials from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managed-onboarding/_snippets/_gather_credentials.md';
import CreateIngestionUser from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managed-onboarding/_snippets/_create_ingestion_user.md';
import ConfirmInUI from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managed-onboarding/_snippets/_confirm_in_ui.md';

이 가이드는 기존 Managed ClickStack 서비스에 OpenTelemetry collector를 배포하거나 기존 collector를 조정한 다음, 이를 통해 데이터가 정상적으로 흐르는지 확인하는 방법을 안내합니다.

collector는 **gateway**로 실행됩니다. 즉, 애플리케이션, SDK, agent collector가 전송 대상으로 사용하는 단일 OTLP 엔드포인트입니다. gateway는 이벤트를 배치로 묶고, 구성된 processing을 적용한 다음, [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)를 통해 ClickHouse에 기록합니다. 이 패턴을 사용하면 수집 로직을 애플리케이션 코드에서 분리할 수 있고, 데이터를 생성하는 workload와 독립적으로 수집 규모를 확장할 수 있습니다. gateway와 agent 역할에 대한 자세한 내용은 [Collector roles](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles)를 참조하십시오.

:::note 기존 collector
기존 OpenTelemetry collector를 사용 중인 경우 이미 **gateway** 역할로 구성되어 있다고 가정합니다. **agent** 역할의 collector를 재구성하는 데 이 과정을 사용하는 것은 권장하지 않습니다.
:::

상황에 맞는 탭을 선택하십시오:

<Tabs groupId="otel-collector-setup">
  <TabItem value="new-collector" label="collector가 없습니다" default>
    <VerticalStepper headerLevel="h2">
      ## 자격 증명 수집 \{#gather-credentials\}

      <GatherCredentials />

      ## 수집 사용자 생성 \{#create-ingestion-user\}

      <CreateIngestionUser />

      ## collector 배포 \{#deploy-the-collector\}

      Managed ClickStack에 맞게 사전 구성된 **OpenTelemetry collector의 ClickStack 배포판**을 배포하십시오. 아래 예시에서는 설명을 단순화하기 위해 collector를 로컬에서 실행하고 동일한 머신에서 임의의 텔레메트리 데이터를 생성합니다.

      :::note
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

      <ConfirmInUI />
    </VerticalStepper>
  </TabItem>

  <TabItem value="existing-collector" label="collector가 있습니다">
    <VerticalStepper headerLevel="h2">
      ## 자격 증명 수집 \{#gather-credentials-existing\}

      <GatherCredentials />

      ## 수집 사용자 생성 \{#create-ingestion-user-existing\}

      <CreateIngestionUser />

      ## collector 구성 조정 \{#adapt-collector\}

      [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)를 통해 Managed ClickStack에 데이터를 기록하도록 기존 collector 구성을 확장하십시오.

      :::note ClickHouse exporter 필요
      자체 배포판을 사용하는 경우 ClickHouse exporter가 포함되어 있는지 확인하십시오. 업스트림 [contrib 이미지](https://github.com/open-telemetry/opentelemetry-collector-contrib)에는 이미 포함되어 있습니다.
      :::

      아래는 ClickStack UI에서 요구하는 수신기, 프로세서, 파이프라인과 함께 ClickHouse exporter를 사용하는 구성 예시입니다. 세션 리플레이(`rrweb`) 라우팅 경로를 포함하여 ClickStack 배포판의 동작과 일치합니다. `<clickhouse_cloud_endpoint>`와 `<your_password_here>`를 위에서 생성한 `hyperdx_ingest` 사용자의 자격 증명으로 대체하십시오:

      ```yaml
      receivers:
        otlp/hyperdx:
          protocols:
            grpc:
              include_metadata: true
              endpoint: "0.0.0.0:4317"
            http:
              cors:
                allowed_origins: ["*"]
                allowed_headers: ["*"]
              include_metadata: true
              endpoint: "0.0.0.0:4318"

      processors:
        batch:
        memory_limiter:
          # 80% of maximum memory up to 2G, adjust for low memory environments
          limit_mib: 1500
          # 25% of limit up to 2G, adjust for low memory environments
          spike_limit_mib: 512
          check_interval: 5s

      connectors:
        routing/logs:
          default_pipelines: [logs/out-default]
          error_mode: ignore
          table:
            - context: log
              statement: route() where IsMatch(attributes["rr-web.event"], ".*")
              pipelines: [logs/out-rrweb]

      exporters:
        clickhouse:
          database: otel
          endpoint: <clickhouse_cloud_endpoint>
          username: hyperdx_ingest
          password: <your_password_here>
          ttl: 720h
          timeout: 5s
          retry_on_failure:
            enabled: true
            initial_interval: 5s
            max_interval: 30s
            max_elapsed_time: 300s
        clickhouse/rrweb:
          database: otel
          endpoint: <clickhouse_cloud_endpoint>
          username: hyperdx_ingest
          password: <your_password_here>
          ttl: 720h
          logs_table_name: hyperdx_sessions
          timeout: 5s
          retry_on_failure:
            enabled: true
            initial_interval: 5s
            max_interval: 30s
            max_elapsed_time: 300s

      service:
        pipelines:
          traces:
            receivers: [otlp/hyperdx]
            processors: [memory_limiter, batch]
            exporters: [clickhouse]
          metrics:
            receivers: [otlp/hyperdx]
            processors: [memory_limiter, batch]
            exporters: [clickhouse]
          logs/in:
            receivers: [otlp/hyperdx]
            exporters: [routing/logs]
          logs/out-default:
            receivers: [routing/logs]
            processors: [memory_limiter, batch]
            exporters: [clickhouse]
          logs/out-rrweb:
            receivers: [routing/logs]
            processors: [memory_limiter, batch]
            exporters: [clickhouse/rrweb]
      ```

      몇 가지 참고 사항:

      * `otlp/hyperdx` 수신기는 gRPC (`4317`)와 HTTP (`4318`) 모두에서 수신 대기합니다; 애플리케이션과 agent는 collector 호스트의 이 포트로 전송해야 합니다.
      * `clickhouse` exporter는 ClickStack UI에서 기대하는 레이아웃에 맞게 로그, 트레이스, 메트릭을 `otel` 데이터베이스에 저장합니다. `clickhouse/rrweb` exporter는 `routing/logs` connector를 통해 `otel.hyperdx_sessions`로 라우팅된 세션 리플레이 이벤트를 처리합니다.
      * OTLP 수신기의 인증은 기존 설정을 사용합니다. 수집 토큰을 필수로 적용해야 하는 경우 collector [extensions](https://opentelemetry.io/docs/collector/configuration/#extensions) (예: `bearertokenauth`) 또는 TLS를 적용한 리버스 프록시를 통해 구성하십시오.

      새 구성으로 collector를 다시 로드하십시오. 이후 애플리케이션, SDK, agent collector는 설정에서 요구하는 인증 헤더를 포함하여 collector가 노출하는 OTLP 엔드포인트로 데이터를 전송해야 합니다.

      Managed ClickStack에 대한 OpenTelemetry collector 구성에 관한 자세한 내용은 [OpenTelemetry를 사용한 수집](/use-cases/observability/clickstack/ingesting-data/opentelemetry)을 참조하십시오.

      ## 엔드포인트 확인 \{#verify-the-endpoint-existing\}

      전체 파이프라인이 정상적으로 작동하는지 확인하기 위해 collector에 합성 트래픽을 생성합니다. OTLP 로그, 트레이스, 메트릭을 전송하는 소형 CLI 도구인 [`otelgen`](https://github.com/krzko/otelgen)을 사용합니다.

      Homebrew를 사용하여 `otelgen`을 설치하세요:

      ```shell
      brew install krzko/tap/otelgen
      ```

      또는 Go를 사용하는 경우:

      ```shell
      go install github.com/krzko/otelgen@latest
      ```

      collector에 로그를 짧게 전송하십시오. `<your-collector-host>`를 collector가 수신 대기 중인 호스트로 대체하고, `authorization` 헤더(또는 대체 인증 방법)를 collector가 요구하는 값으로 설정하십시오:

      ```shell
       otelgen \
        --otel-exporter-otlp-endpoint <your-collector-host>:4317 \
        --insecure \
        --protocol grpc \
        --header "authorization=<your-auth-token>" \
        --rate 5 \
        --duration 60 \
        logs multi
      ```

      동일한 트레이스 및 메트릭 명령어와 기타 `otelgen` 하위 명령어에 대한 안내는 [otelgen을 활용한 합성 데이터](/use-cases/observability/clickstack/getting-started/otelgen)를 참조하십시오.

      ## ClickStack UI에서 확인 \{#confirm-in-ui-existing\}

      <ConfirmInUI />
    </VerticalStepper>
  </TabItem>
</Tabs>

## 추가 읽을거리 \{#further-reading\}

이 가이드는 가장 단순한 형태의 단일 collector 인스턴스를 다룹니다. 다음 단계는 [OpenTelemetry collector 참고](/use-cases/observability/clickstack/ingesting-data/otel-collector)에서 확인하십시오.

* OTLP endpoint에서 TLS를 사용하고 최소 권한 수집 사용자를 적용하여 [collector 보안 강화](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector)하기
* gateway에서 이벤트 [처리, 필터링 및 보강](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching)하기
* 사용자 지정 수신기, processor 및 pipeline을 사용해 [collector 구성 확장](/use-cases/observability/clickstack/ingesting-data/otel-collector#extending-collector-config)하기
* 예상 처리량에 맞는 gateway 및 agent 배포의 [리소스 추정](/use-cases/observability/clickstack/ingesting-data/otel-collector#estimating-resources)하기
* [프로덕션 환경으로 전환](/use-cases/observability/clickstack/production)하기
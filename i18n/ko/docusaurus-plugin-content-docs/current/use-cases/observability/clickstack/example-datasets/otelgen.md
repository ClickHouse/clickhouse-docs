---
slug: /use-cases/observability/clickstack/getting-started/otelgen
title: 'otelgen으로 합성 OpenTelemetry 데이터 생성'
sidebar_label: 'otelgen으로 합성 데이터 생성'
sidebar_position: 5
pagination_prev: null
pagination_next: null
description: 'otelgen을 사용해 합성 로그, trace, 메트릭을 ClickStack OpenTelemetry collector로 전송합니다'
doc_type: 'guide'
toc_max_heading_level: 2
keywords: ['clickstack', 'otelgen', 'synthetic data', 'OpenTelemetry', 'test', 'logs', 'traces', 'metrics', 'observability']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[`otelgen`](https://github.com/krzko/otelgen)은 합성 OTLP 로그, 트레이스, 메트릭을 생성하는 소규모 Go CLI입니다. 이를 사용하면 기존 ClickStack OpenTelemetry collector가 데이터를 수신하고 있는지, 그리고 이벤트가 ClickStack UI에 표시되는지 확인할 수 있습니다.

이 가이드는 collector가 이미 실행 중이며 `4317`(gRPC) 및 `4318`(HTTP)에서 OTLP endpoint를 노출하고 있다고 가정합니다.

<Tabs groupId="sample-logs">
  <TabItem value="managed-clickstack" label="Managed ClickStack" default>
    <VerticalStepper headerLevel="h3">
      ### 사전 요구 사항 \{#prerequisites-managed\}

      이 가이드는 [Managed ClickStack 시작하기 가이드](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud)를 완료했으며, `otelgen`을 실행하는 머신에서 OTLP gRPC (`4317`) 및 HTTP (`4318`) 엔드포인트에 접근할 수 있는 OpenTelemetry collector가 실행 중이라고 가정합니다. [`OTLP_AUTH_TOKEN`으로 collector를 보호](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector)했다면 해당 값을 준비해 두십시오.

      ### otelgen 설치 \{#install-otelgen-managed\}

      Homebrew로 설치합니다:

      ```shell
      brew install krzko/tap/otelgen
      ```

      또는 Go로 설치합니다:

      ```shell
      go install github.com/krzko/otelgen@latest
      ```

      ### 환경 변수 설정 \{#set-env-vars-managed\}

      collector 엔드포인트와, collector가 보호되어 있다면 인증 토큰을 export합니다:

      ```shell
      export OTEL_ENDPOINT=<host>:4317
      export OTLP_AUTH_TOKEN=<your_otlp_auth_token>
      ```

      collector의 호스트와 포트를 사용하십시오. 동일한 머신에서 collector가 실행 중이라면 `localhost:4317`입니다.

      :::note[보호되지 않은 collector]
      ClickStack OpenTelemetry collector는 기본적으로 인증이 설정되어 있지 않습니다. `OTLP_AUTH_TOKEN`을 설정하기 위해 [collector 보호](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector)를 따르지 않았다면, 여기서는 `OTLP_AUTH_TOKEN`을 생략하고 아래 명령에서 `--header` 플래그를 제거하십시오.
      :::

      ### traces 생성 \{#generate-traces-managed\}

      여러 스팬으로 구성된 traces를 짧게 전송합니다:

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${OTLP_AUTH_TOKEN}" \
        --protocol grpc --insecure \
        --rate 2 --duration 10 \
        traces multi
      ```

      `--rate`는 초당 traces 수이고 `--duration`은 초 단위 실행 시간입니다. `--insecure`는 gRPC connection에서 TLS를 비활성화하며, `otelgen`을 collector의 plaintext OTLP 포트로 지정할 때 필요합니다.

      ### logs 생성 \{#generate-logs-managed\}

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${OTLP_AUTH_TOKEN}" \
        --protocol grpc --insecure \
        --rate 2 --duration 10 \
        logs multi
      ```

      ### 메트릭 생성 \{#generate-metrics-managed\}

      metrics 하위 명령은 `--duration`을 지원하지 않습니다. 명령을 실행한 뒤 몇 초 후 `Ctrl+C`를 눌러 중지하십시오.

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${OTLP_AUTH_TOKEN}" \
        --protocol grpc --insecure \
        --rate 2 \
        metrics sum
      ```

      `otelgen`은 `metrics` 아래에서 `gauge`, `histogram`, `up-down-counter`, `exponential-histogram` 하위 명령도 지원합니다.

      ### ClickStack에서 확인 \{#verify-managed\}

      ClickHouse Cloud 콘솔에서 ClickStack UI를 엽니다. `Search` 보기에서 source를 `Logs`와 `Traces` 사이에서 전환해 새 이벤트를 확인하십시오. 시간 범위를 `Last 15 minutes`로 설정합니다. `Chart Explorer`를 열고 `Metrics`를 선택한 다음, `otelgen`이 생성한 메트릭 이름 중 하나(예: `otelgen.metrics.sum`)를 차트로 표시해 메트릭 수집을 확인하십시오.
    </VerticalStepper>
  </TabItem>

  <TabItem value="oss-clickstack" label="ClickStack 오픈 소스">
    <VerticalStepper headerLevel="h3">
      ### 사전 요구 사항 \{#prerequisites-oss\}

      이 가이드는 [all-in-one 이미지 안내](/use-cases/observability/clickstack/getting-started/oss)에 따라 Open Source ClickStack을 시작했으며, OTLP endpoint(`4317` gRPC 및 `4318` HTTP)에 도달할 수 있다고 가정합니다. 또한 HyperDX UI의 `Team Settings > API Keys`에서 수집 API key를 확인해야 합니다.

      ### otelgen 설치 \{#install-otelgen-oss\}

      Homebrew로 설치합니다.

      ```shell
      brew install krzko/tap/otelgen
      ```

      또는 Go로 설치합니다.

      ```shell
      go install github.com/krzko/otelgen@latest
      ```

      ### 환경 변수 설정 \{#set-env-vars-oss\}

      collector endpoint와 수집 API key를 환경 변수로 내보냅니다.

      ```shell
      export OTEL_ENDPOINT=localhost:4317
      export CLICKSTACK_API_KEY=<your_ingestion_api_key>
      ```

      ### traces 생성 \{#generate-traces-oss\}

      여러 스팬으로 구성된 traces를 짧게 전송합니다.

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${CLICKSTACK_API_KEY}" \
        --protocol grpc --insecure \
        --rate 2 --duration 10 \
        traces multi
      ```

      `--rate`는 초당 trace 수이고 `--duration`은 실행 시간(초)입니다. `--insecure`는 로컬 collector에 대해 plaintext gRPC를 사용하도록 설정합니다.

      ### logs 생성 \{#generate-logs-oss\}

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${CLICKSTACK_API_KEY}" \
        --protocol grpc --insecure \
        --rate 2 --duration 10 \
        logs multi
      ```

      ### 메트릭 생성 \{#generate-metrics-oss\}

      메트릭 하위 명령은 `--duration`을 지원하지 않습니다. 명령을 실행한 후 몇 초 뒤 `Ctrl+C`를 눌러 중지하십시오.

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${CLICKSTACK_API_KEY}" \
        --protocol grpc --insecure \
        --rate 2 \
        metrics sum
      ```

      `otelgen`은 `metrics` 아래에서 `gauge`, `histogram`, `up-down-counter`, `exponential-histogram` 하위 명령도 지원합니다.

      ### ClickStack에서 확인 \{#verify-oss\}

      ClickStack UI를 열려면 [http://localhost:8080](http://localhost:8080)에 접속합니다. `Search` 보기에서 `Logs`와 `Traces` 사이에서 source를 전환하여 새 이벤트를 확인합니다. 시간 범위는 `Last 15 minutes`로 설정합니다. `Chart Explorer`를 열고 `Metrics`를 선택한 다음 `otelgen`이 생성한 메트릭 이름 중 하나(예: `otelgen.metrics.sum`)를 차트로 표시하여 메트릭 수집을 확인합니다.
    </VerticalStepper>
  </TabItem>
</Tabs>
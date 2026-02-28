---
slug: /use-cases/observability/clickstack/integrations/temporal-metrics
title: 'ClickStack으로 Temporal Cloud 모니터링'
sidebar_label: 'Temporal Cloud 메트릭'
pagination_prev: null
pagination_next: null
description: 'ClickStack으로 Temporal Cloud 메트릭 모니터링'
doc_type: 'guide'
keywords: ['Temporal', 'metrics', 'OTEL', 'ClickStack']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import temporal_metrics from '@site/static/images/clickstack/temporal/temporal-metrics.png';
import finish_import from '@site/static/images/clickstack/temporal/import-temporal-metrics-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/temporal/temporal-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

:::note Warning
Temporal 플랫폼의 OpenMetrics 지원은 [Public Preview](https://docs.temporal.io/evaluate/development-production-features/release-stages#public-preview) 단계에서 제공됩니다. 자세한 내용은 [해당 문서](https://docs.temporal.io/cloud/metrics/openmetrics)를 참고하십시오.
:::

Temporal은 단순하면서도 정교하고 복원력이 높은 애플리케이션을 구축하기 위한 추상화 계층을 제공합니다.


# ClickStack로 Temporal Cloud 메트릭 모니터링하기 \{#temporal-metrics-clickstack\}

:::note[요약]
이 가이드는 OpenTelemetry collector의 Prometheus receiver를 구성하여 ClickStack으로 Temporal Cloud를 모니터링하는 방법을 설명합니다. 다음 내용을 학습하게 됩니다:

- Temporal Cloud 메트릭을 수집하도록 OTel collector를 구성합니다.
- 사용자 정의 구성을 사용하여 ClickStack을 배포합니다.
- 미리 만들어진 대시보드를 사용해 Temporal Cloud 성능(열려 있는 워크플로, 초당 actions 수, 활성 네임스페이스, 태스크 대기열)을 시각화합니다.

소요 시간: 5~10분
:::

## 기존 Temporal Cloud와의 통합 \{#existing-temporal\}

이 섹션에서는 Prometheus receiver를 사용하도록 ClickStack OTel collector를 구성하여 ClickStack을 설정하는 방법을 다룹니다.

## 사전 준비 사항 \{#prerequisites\}

- 실행 중인 ClickStack 인스턴스
- 기존 Temporal Cloud 계정
- ClickStack에서 Temporal Cloud로의 HTTP 네트워크 연결

<VerticalStepper headerLevel="h4">
  #### Temporal Cloud 키 생성하기

  Temporal Cloud API 키를 보유하고 있는지 확인하세요. API 키는 Temporal 문서의 [Authentication guide](https://docs.temporal.io/production-deployment/cloud/metrics/openmetrics/api-reference#authentication)를 따라 생성할 수 있습니다.

  :::important 키 파일
  이 자격 증명은 아래에서 생성할 설정 파일과 동일한 디렉터리의 `temporal.key` 파일에 저장하십시오. 이 키는 앞뒤 공백 없이 텍스트로만 저장해야 합니다.
  :::

  #### 사용자 정의 OTel collector 구성 만들기

  ClickStack을 사용하면 사용자 정의 구성 파일을 마운트하고 환경 변수를 설정하여 기본 OpenTelemetry 수집기 구성을 확장할 수 있습니다. 사용자 정의 구성은 HyperDX가 OpAMP를 통해 관리하는 기본 구성과 병합됩니다.

  다음 구성으로 `temporal-metrics.yaml` 파일을 생성하세요:

  ```yaml title="temporal-metrics.yaml"
  receivers:
    prometheus/temporal:
      config:
        scrape_configs:
        - job_name: 'temporal-cloud'
          scrape_interval: 60s
          scrape_timeout: 30s
          honor_timestamps: true
          scheme: https
          authorization:
            type: Bearer
            credentials_file: /etc/otelcol-contrib/temporal.key
          static_configs:
            - targets: ['metrics.temporal.io']
          metrics_path: '/v1/metrics'

  processors:
    resource:
      attributes:
        - key: service.name
          value: "temporal"
          action: upsert

  service:
    pipelines:
      metrics/temporal:
        receivers: [prometheus/temporal]
        processors:
          - resource
          - memory_limiter
          - batch
        exporters:
          - clickhouse
  ```

  이 구성:

  * Temporal Cloud에 `metrics.temporal.io` 엔드포인트로 연결합니다
  * 60초마다 메트릭을 수집합니다.
  * [핵심 성능 메트릭](https://docs.temporal.io/production-deployment/cloud/metrics/openmetrics/metrics-reference)을 수집합니다
  * **[OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/semconv/resource/#service)에 따라 필수 `service.name` 리소스 속성을 설정합니다.**
  * 전용 파이프라인을 통해 메트릭을 ClickHouse exporter로 전달합니다

  :::note

  * 사용자 정의 구성에서는 새로운 receiver, processor, pipeline만을 정의합니다
  * `memory_limiter` 및 `batch` 프로세서와 `clickhouse` exporter는 이미 기본 ClickStack 구성에 정의되어 있으므로 이름으로만 참조하면 됩니다
  * `resource` 프로세서는 OpenTelemetry 시맨틱 컨벤션에 따라 필수 `service.name` 속성 값을 설정합니다
  * 여러 Temporal Cloud 계정이 있는 경우, 이를 구분할 수 있도록 `service.name` 값을 다르게 설정하십시오(예: `"temporal-prod"`, `"temporal-dev"`).

  :::

  #### ClickStack에서 사용자 정의 구성 로드 설정하기

  기존 ClickStack 배포에서 사용자 정의 수집기 구성을 활성화하려면 다음 작업을 수행하십시오:

  1. 사용자 정의 구성 파일을 `/etc/otelcol-contrib/custom.config.yaml`에 마운트합니다.
  2. 환경 변수 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`을 설정하십시오.
  3. `temporal.key` 파일을 `/etc/otelcol-contrib/temporal.key` 경로에 마운트합니다.
  4. ClickStack와 Temporal 사이에 네트워크 연결이 되어 있어야 합니다

  모든 명령은 `temporal-metrics.yaml` 및 `temporal.key`가 저장된 샘플 디렉터리에서 실행되는 것으로 가정합니다.

  ##### 옵션 1: Docker Compose

  ClickStack 배포 구성을 업데이트하세요:

  ```yaml
  services:
    clickstack:
      # ... existing configuration ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      volumes:
        - ./temporal-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - ./temporal.key:/etc/otelcol-contrib/temporal.key:ro
        # ... other volumes ...
  ```

  ##### 옵션 2: Docker run (올인원 이미지)

  `docker run`으로 올인원(all-in-one) 이미지를 사용하는 경우:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/temporal-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v "$(pwd)/temporal.key:/etc/otelcol-contrib/temporal.key:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  #### HyperDX에서 메트릭 확인

  구성을 완료한 후 HyperDX에 로그인하여 메트릭이 정상적으로 수집되는지 확인하세요:

  1. Metrics Explorer로 이동하십시오
  2. `temporal`로 시작하는 메트릭(예: `temporal_cloud_v1_workflow_success_count`, `temporal_cloud_v1_poll_timeout_count`)을 검색하십시오
  3. 설정한 수집 주기마다 메트릭 데이터 포인트가 나타나는 것을 볼 수 있습니다

  <Image img={temporal_metrics} alt="Temporal 메트릭" size="md" />
</VerticalStepper>

## 대시보드와 시각화 {#dashboards}

Temporal Cloud를 ClickStack으로 모니터링하기 시작하는 데 도움이 되도록 Temporal Metrics용 예시 시각화를 제공합니다.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/temporal-metrics-dashboard.json')} download="temporal-metrics-dashboard.json" eventName="docs.temporal_metrics_monitoring.dashboard_download">대시보드 구성 다운로드</TrackedLink> \{#download\}

#### 미리 구성된 대시보드 가져오기 \{#import-dashboard\}

1. HyperDX를 열고 「Dashboards」 섹션으로 이동합니다.
2. 오른쪽 상단의 줄임표(…) 메뉴에서 **Import Dashboard**를 클릭합니다.

<Image img={import_dashboard} alt="대시보드 가져오기 버튼"/>

3. `temporal-metrics-dashboard.json` 파일을 업로드한 후 **Finish Import**를 클릭합니다.

<Image img={finish_import} alt="가져오기 완료 대화 상자"/>

#### 대시보드 보기 {#created-dashboard}

모든 시각화가 사전 구성된 상태로 대시보드가 생성됩니다.

<Image img={example_dashboard} alt="Temporal Metrics 대시보드"/>

</VerticalStepper>

## 문제 해결 {#troubleshooting}

### 사용자 정의 구성 로드되지 않음

환경 변수 `CUSTOM_OTELCOL_CONFIG_FILE`가 올바르게 설정되어 있는지 확인하십시오:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

사용자 정의 설정 파일이 `/etc/otelcol-contrib/custom.config.yaml`에 마운트되어 있는지 확인합니다:

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
# usually, docker exec clickstack ls -lh /etc/otelcol-contrib/custom.config.yaml
```

사용자 정의 구성 내용을 열어 사람이 읽을 수 있는지 확인하십시오:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
# usually, docker exec clickstack cat /etc/otelcol-contrib/custom.config.yaml
```

`temporal.key`가 컨테이너에 마운트되어 있는지 확인하십시오:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/temporal.key
# usually, docker exec clickstack cat /etc/otelcol-contrib/temporal.key
# This should output your temporal.key
```


### HyperDX에 메트릭이 표시되지 않음

수집기에서 Temporal Cloud에 연결할 수 있는지 확인하십시오:

```bash
# From the ClickStack container
docker exec <container-name> curl -H "Authorization: Bearer <API_KEY>" https://metrics.temporal.io/v1/metrics
```

Prometheus 메트릭들이 예를 들어 다음과 같이 출력됩니다.

```text
temporal_cloud_v1_workflow_success_count{operation="CompletionStats",region="aws-us-east-2",temporal_account="l2c4n",temporal_namespace="clickpipes-aws-prd-apps-us-east-2.l2c4n",temporal_task_queue="clickpipes-svc-dc118d12-b397-4975-a33e-c2888ac12ac4-peer-flow-task-queue",temporal_workflow_type="QRepPartitionWorkflow"} 0.067 1765894320
```

최종 적용된 설정에 Prometheus receiver가 포함되어 있는지 확인하십시오:

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "Prometheus:"
## usually, docker exec clickstack cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "prometheus:"
```

collector 에이전트 로그에서 오류를 확인하십시오:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i Prometheus
# Look for connection errors or authentication failures
# docker exec clickstack cat /etc/otel/supervisor-data/agent.log | grep -i Prometheus
```

수집기 로그를 확인하세요:

```bash
docker exec <container> cat /var/log/otel-collector.log | grep -i error
# Look for config parsing errors - early supervisor.opamp-client can be ignored 
# docker exec clickstack cat /var/log/otel-collector.log | grep -i error
```


### 인증 오류 {#auth-errors}

로그에 인증 오류가 나타나면 API 키를 확인하십시오.

### 네트워크 연결 문제 {#network-issues}

ClickStack가 Temporal Cloud에 연결할 수 없는 경우 Docker Compose 파일이나 `docker run` 명령에서 [외부 네트워킹](https://docs.docker.com/engine/network/#drivers)을 허용하도록 구성되어 있는지 확인하십시오.

## 다음 단계 {#next-steps}

추가로 살펴보고 싶다면, 모니터링을 실험해 볼 다음 단계를 수행하십시오.

- 중요한 메트릭(메모리 사용량 임계값, 연결 제한, 캐시 적중률 하락)에 대한 [알림](/use-cases/observability/clickstack/alerts)을 설정하십시오.
- 특정 사용 사례(복제 지연, 영속성 성능)에 대한 추가 대시보드를 생성하십시오.
- 서로 다른 엔드포인트와 서비스 이름을 사용해 리시버 구성을 복제하여 여러 Temporal Cloud 계정을 모니터링하십시오.
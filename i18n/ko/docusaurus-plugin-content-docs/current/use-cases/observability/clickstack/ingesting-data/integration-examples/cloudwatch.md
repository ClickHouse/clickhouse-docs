---
slug: /use-cases/observability/clickstack/integrations/aws-cloudwatch-logs
title: 'ClickStack로 AWS CloudWatch Logs 모니터링'
sidebar_label: 'AWS CloudWatch Logs'
pagination_prev: null
pagination_next: null
description: 'ClickStack로 AWS CloudWatch Logs 모니터링'
doc_type: 'guide'
keywords: ['AWS', 'CloudWatch', 'OTEL', 'ClickStack', 'logs']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/cloudwatch/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/cloudwatch/logs-dashboard.png';
import log_search_view from '@site/static/images/clickstack/cloudwatch/log-search-view.png';
import demo_search_view from '@site/static/images/clickstack/cloudwatch/demo-search-view.png';
import error_log_overview from '@site/static/images/clickstack/cloudwatch/error-log-overview.png';
import error_log_column_values from '@site/static/images/clickstack/cloudwatch/error-log-column-values.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack로 AWS CloudWatch 로그 모니터링하기 \{#cloudwatch-clickstack\}

:::note[TL;DR]
이 가이드는 OpenTelemetry Collector의 AWS CloudWatch receiver를 사용하여 AWS CloudWatch 로그를 ClickStack으로 전송하는 방법을 설명합니다. 다음 작업을 수행하도록 구성하는 방법을 학습합니다:

- OpenTelemetry Collector를 구성하여 CloudWatch에서 로그를 수집
- AWS 자격 증명과 IAM 권한 설정
- OTLP를 통해 CloudWatch 로그를 ClickStack으로 전송
- 로그 그룹 필터링 및 자동 검색(autodiscover)
- 미리 준비된 대시보드를 사용해 CloudWatch 로그 패턴 시각화

운영 AWS 환경을 구성하기 전에 통합을 미리 테스트하려는 경우, 샘플 로그가 포함된 데모 데이터셋을 사용할 수 있습니다.

소요 시간: 10-15분
:::

## 개요 \{#overview\}

AWS CloudWatch는 AWS 리소스와 애플리케이션을 위한 모니터링 서비스입니다. CloudWatch가 로그 집계 기능을 제공하지만, 로그를 ClickStack으로 전달하면 다음과 같은 이점이 있습니다:

- 통합된 플랫폼에서 로그를 메트릭 및 트레이스와 함께 분석할 수 있습니다.
- ClickHouse의 SQL 인터페이스를 사용하여 로그를 쿼리할 수 있습니다.
- 로그를 아카이빙하거나 CloudWatch 보존 기간을 단축하여 비용을 절감할 수 있습니다.

이 가이드는 OpenTelemetry Collector를 사용하여 CloudWatch 로그를 ClickStack으로 전달하는 방법을 설명합니다.

## 기존 CloudWatch 로그 그룹과의 통합 \{#existing-cloudwatch\}

이 섹션에서는 기존 CloudWatch 로그 그룹에서 로그를 수집해 ClickStack으로 전달하도록 OpenTelemetry Collector를 구성하는 방법을 설명합니다.

프로덕션 환경을 구성하기 전에 통합을 미리 테스트하려면, [데모 데이터셋 섹션](#demo-dataset)에서 제공되는 데모 데이터셋으로 테스트할 수 있습니다.

### 사전 요구 사항 \{#prerequisites\}

- 실행 중인 ClickStack 인스턴스
- CloudWatch 로그 그룹이 있는 AWS 계정
- 적절한 IAM 권한이 부여된 AWS 자격 증명

:::note
파일 기반 로그 통합(nginx, Redis)과는 달리 CloudWatch는 CloudWatch API를 폴링하는 별도의 OpenTelemetry Collector가 필요합니다. 이 Collector는 AWS 자격 증명과 API 액세스가 필요하므로 ClickStack의 all-in-one 이미지 내부에서는 실행할 수 없습니다.
:::

<VerticalStepper headerLevel="h4">
  #### ClickStack API 키 받기

  OpenTelemetry Collector는 ClickStack의 OTLP 엔드포인트로 데이터를 전송하며, 이 엔드포인트는 인증이 필요합니다.

  1. ClickStack URL에서 HyperDX를 여십시오(예: http://localhost:8080)
  2. 계정이 없으면 생성하고, 있으면 로그인하십시오
  3. **Team Settings → API Keys**로 이동하십시오
  4. **수집 API key**를 복사하세요

  <Image img={api_key} alt="ClickStack API 키" />

  이를 환경 변수로 저장하세요:

  ```bash
  export CLICKSTACK_API_KEY="your-api-key-here"
  ```

  #### AWS 자격 증명 구성하기

  AWS 자격 증명을 환경 변수로 내보내세요. 방법은 인증 유형에 따라 다릅니다:

  **AWS SSO 사용자용 (대부분의 조직에 권장):**

  ```bash
  # Login to SSO
  aws sso login --profile YOUR_PROFILE_NAME

  # Export credentials to environment variables
  eval $(aws configure export-credentials --profile YOUR_PROFILE_NAME --format env)

  # Verify credentials work
  aws sts get-caller-identity
  ```

  `YOUR_PROFILE_NAME`을 AWS SSO 프로필 이름으로 교체하세요(예: `AccountAdministrators-123456789`).

  **장기 자격 증명을 사용하는 IAM 사용자:**

  ```bash
  export AWS_ACCESS_KEY_ID="your-access-key-id"
  export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
  export AWS_REGION="us-east-1"

  # Verify credentials work
  aws sts get-caller-identity
  ```

  **필수 IAM 권한:**

  해당 자격 증명과 연결된 AWS 계정에는 CloudWatch 로그를 읽기 위해 다음 IAM 정책이 필요합니다:

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "CloudWatchLogsRead",
        "Effect": "Allow",
        "Action": [
          "logs:DescribeLogGroups",
          "logs:FilterLogEvents"
        ],
        "Resource": "arn:aws:logs:*:YOUR_ACCOUNT_ID:log-group:*"
      }
    ]
  }
  ```

  `YOUR_ACCOUNT_ID`를 사용자의 AWS 계정 ID로 교체하세요.

  #### CloudWatch 수신기 구성하기

  CloudWatch 리시버 구성이 포함된 `otel-collector-config.yaml` 파일을 생성하세요.

  **예제 1: 이름이 지정된 로그 그룹(권장)**

  이 구성은 특정 이름의 로그 그룹에서 로그를 수집합니다:

  ```yaml
  receivers:
    awscloudwatch:
      region: us-east-1
      logs:
        poll_interval: 1m
        max_events_per_request: 100
        groups:
          named:
            /aws/lambda/my-function:
            /aws/ecs/my-service:
            /aws/eks/my-cluster/cluster:

  processors:
    batch:
      timeout: 10s

  exporters:
    otlphttp:
      endpoint: http://localhost:4318
      headers:
        authorization: ${CLICKSTACK_API_KEY}

  service:
    pipelines:
      logs:
        receivers: [awscloudwatch]
        processors: [batch]
        exporters: [otlphttp]
  ```

  **예제 2: 접두사로 로그 그룹 자동 검색**

  이 구성은 `/aws/lambda` 접두사로 시작하는 최대 100개의 로그 그룹에서 로그를 자동으로 검색하고 수집합니다:

  ```yaml
  receivers:
    awscloudwatch:
      region: us-east-1
      logs:
        poll_interval: 1m
        max_events_per_request: 100
        groups:
          autodiscover:
            limit: 100
            prefix: /aws/lambda

  processors:
    batch:
      timeout: 10s

  exporters:
    otlphttp:
      endpoint: http://localhost:4318
      headers:
        authorization: ${CLICKSTACK_API_KEY}

  service:
    pipelines:
      logs:
        receivers: [awscloudwatch]
        processors: [batch]
        exporters: [otlphttp]
  ```

  **구성 파라미터:**

  * `region`: 로그 그룹이 있는 AWS 리전
  * `poll_interval`: 새 로그를 확인할 간격(예: `1m`, `5m`)
  * `max_events_per_request`: 요청마다 가져오는 로그 이벤트의 최대 개수
  * `groups.autodiscover.limit`: 자동으로 검색할 로그 그룹의 최대 개수
  * `groups.autodiscover.prefix`: 지정한 접두사로 시작하는 로그 그룹만 필터링합니다
  * `groups.named`: 수집할 로그 그룹 이름을 명시적으로 지정합니다

  추가 구성 옵션에 대해서는 [CloudWatch receiver 문서](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/awscloudwatchreceiver)를 참조하세요.

  **다음 항목을 교체하세요:**

  * `${CLICKSTACK_API_KEY}` → 이전에 설정한 환경 변수를 사용합니다
  * `http://localhost:4318` → 사용 중인 ClickStack 엔드포인트(원격에서 실행 중인 경우 해당 ClickStack 호스트 사용)
  * `us-east-1` → 사용 중인 AWS 리전
  * 로그 그룹 이름/접두사 → 실제 CloudWatch 로그 그룹

  :::note
  CloudWatch 수신기는 최근 시간 범위의 로그만 가져옵니다(`poll_interval` 기반). 처음 시작 시 현재 시간부터 시작합니다. 기본적으로 과거 로그는 가져오지 않습니다.
  :::

  #### 컬렉터 시작하기

  `docker-compose.yaml` 파일을 생성합니다:

  ```yaml
  services:
    otel-collector:
      image: otel/opentelemetry-collector-contrib:latest
      command: ["--config=/etc/otel-config.yaml"]
      volumes:
        - ./otel-collector-config.yaml:/etc/otel-config.yaml
      environment:
        - AWS_ACCESS_KEY_ID
        - AWS_SECRET_ACCESS_KEY
        - AWS_SESSION_TOKEN
        - AWS_REGION
        - CLICKSTACK_API_KEY
      restart: unless-stopped
      extra_hosts:
        - "host.docker.internal:host-gateway"
  ```

  그런 다음 컬렉터를 시작하세요:

  ```bash
  docker compose up -d
  ```

  수집기 로그 보기:

  ```bash
  docker compose logs -f otel-collector
  ```

  #### HyperDX에서 로그 확인하기

  컬렉터가 실행되고 나면:

  1. http://localhost:8080(또는 사용 중인 ClickStack URL)에서 HyperDX를 여십시오.
  2. **Logs** 뷰로 이동합니다
  3. 로그가 표시될 때까지 1~2분 정도 기다리십시오(설정한 폴링 간격에 따라 달라집니다).
  4. CloudWatch 로그 그룹에서 로그를 검색합니다

  <Image img={log_search_view} alt="로그 검색 화면" />

  로그에서 다음 주요 속성을 찾으십시오:

  * `ResourceAttributes['aws.region']`: 사용 중인 AWS 리전(예: &quot;us-east-1&quot;)
  * `ResourceAttributes['cloudwatch.log.group.name']`: CloudWatch 로그 그룹의 이름
  * `ResourceAttributes['cloudwatch.log.stream']`: 로그 스트림 이름
  * `Body`: 실제 로그 메시지 본문

  <Image img={error_log_column_values} alt="오류 로그 컬럼 값" />
</VerticalStepper>

## 데모 데이터셋 {#demo-dataset}

운영 AWS 환경을 구성하기 전에 CloudWatch 로그 연동을 테스트하려는 사용자를 위해, 여러 AWS 서비스에서 발생하는 현실적인 패턴을 보여주는 사전에 생성된 로그가 포함된 샘플 데이터셋을 제공합니다.

<VerticalStepper headerLevel="h4">

#### 샘플 데이터셋 다운로드 \{#download-sample\}

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/aws/cloudwatch/cloudwatch-logs.jsonl
```

이 데이터셋에는 여러 서비스에서 수집된 24시간 분량의 CloudWatch 로그가 포함되어 있습니다:
- **Lambda 함수**: 결제 처리, 주문 관리, 인증
- **ECS 서비스**: 레이트 리미팅과 타임아웃이 설정된 API 게이트웨이
- **백그라운드 작업**: 재시도 패턴을 포함한 배치 처리

#### ClickStack 시작 \{#start-clickstack\}

ClickStack이 이미 실행 중이 아니라면:

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

ClickStack이 완전히 시작될 때까지 잠시 기다리십시오.

#### 데모 데이터셋 가져오기 \{#import-demo-data\}

```bash
docker exec -i clickstack clickhouse-client --query="
  INSERT INTO default.otel_logs FORMAT JSONEachRow
" < cloudwatch-logs.jsonl
```

이 명령은 로그를 ClickStack의 로그 테이블로 직접 가져옵니다.

#### 데모 데이터 확인 \{#verify-demo-logs\}

가져오기가 완료되면:

1. http://localhost:8080 에서 HyperDX를 열고 로그인합니다(필요한 경우 계정을 생성합니다).
2. **Logs** 뷰로 이동합니다.
3. 시간 범위를 **2025-12-07 00:00:00 - 2025-12-08 00:00:00 (UTC)** 로 설정합니다.
4. `cloudwatch-demo` 를 검색하거나 `LogAttributes['source'] = 'cloudwatch-demo'` 로 필터링합니다.

여러 CloudWatch 로그 그룹에서 생성된 로그가 표시됩니다.

<Image img={demo_search_view} alt="데모 검색 화면"/>

:::note[Timezone Display]
HyperDX는 타임스탬프를 브라우저의 로컬 시간대로 표시합니다. 데모 데이터는 **2025-12-07 00:00:00 - 2025-12-08 00:00:00 (UTC)** 구간에 걸쳐 있습니다. 위치와 관계없이 데모 로그를 볼 수 있도록 시간 범위를 **2025-12-06 00:00:00 - 2025-12-09 00:00:00** 로 설정하십시오. 로그가 보이면, 더 명확한 시각화를 위해 범위를 24시간으로 좁힐 수 있습니다.
:::

</VerticalStepper>

## 대시보드와 시각화 \{#dashboards\}

ClickStack으로 CloudWatch 로그를 모니터링할 수 있도록, 필수 시각화가 포함된 기본 제공 대시보드를 제공합니다.

<VerticalStepper headerLevel="h4">

#### 대시보드 구성 파일을 <TrackedLink href={useBaseUrl('/examples/cloudwatch-logs-dashboard.json')} download="cloudwatch-logs-dashboard.json" eventName="docs.cloudwatch_logs_monitoring.dashboard_download">다운로드</TrackedLink>하세요 \{#download\}

#### 대시보드 가져오기 \{#import-dashboard\}

1. HyperDX를 열고 Dashboards 섹션으로 이동합니다.
2. 오른쪽 상단의 줄임표 메뉴에서 **Import Dashboard**를 클릭합니다.

<Image img={import_dashboard} alt="대시보드 가져오기 버튼"/>

3. `cloudwatch-logs-dashboard.json` 파일을 업로드하고 **Finish Import**를 클릭합니다.

<Image img={finish_import} alt="가져오기 완료 대화 상자"/>

#### 대시보드 보기 \{#created-dashboard\}

대시보드는 모든 시각화가 미리 구성된 상태로 생성됩니다.

<Image img={example_dashboard} alt="CloudWatch Logs 대시보드"/>

:::note
데모 데이터셋에는 시간 범위를 **2025-12-07 00:00:00 - 2025-12-08 00:00:00 (UTC)**로 설정하십시오(로컬 시간대에 따라 조정하십시오). 가져온 대시보드는 기본적으로 시간 범위가 지정되어 있지 않습니다.
:::

</VerticalStepper>

## 문제 해결 {#troubleshooting}

### HyperDX에 로그가 표시되지 않음

**AWS 자격 증명이 구성되어 있는지 확인하십시오.**

```bash
aws sts get-caller-identity
```

이 단계가 실패하면 자격 증명이 잘못되었거나 만료된 것입니다.

**IAM 권한 확인:**
AWS 자격 증명에 필요한 `logs:DescribeLogGroups` 및 `logs:FilterLogEvents` 권한이 있는지 확인합니다.

**수집기 로그에서 오류 확인:**

```bash
# If using Docker directly, logs appear in stdout
# If using Docker Compose:
docker compose logs otel-collector
```

공통 오류:

* `The security token included in the request is invalid`: 자격 증명이 올바르지 않거나 만료되었습니다. 일시적 자격 증명(SSO)을 사용하는 경우 `AWS_SESSION_TOKEN`이 설정되어 있는지 확인하십시오.
* `operation error CloudWatch Logs: FilterLogEvents, AccessDeniedException`: IAM 권한이 충분하지 않습니다.
* `failed to refresh cached credentials, no EC2 IMDS role found`: AWS 자격 증명 환경 변수가 설정되어 있지 않습니다.
* `connection refused`: ClickStack 엔드포인트에 연결할 수 없습니다.

**CloudWatch 로그 그룹이 존재하며 최근 로그가 있는지 확인하십시오:**

```bash
# List your log groups
aws logs describe-log-groups --region us-east-1

# Check if a specific log group has recent logs (last hour)
aws logs filter-log-events \
  --log-group-name /aws/lambda/my-function \
  --region us-east-1 \
  --start-time $(date -u -v-1H +%s)000 \
  --max-items 5
```


### 오래된 로그만 보이거나 최근 로그가 누락되는 경우

**CloudWatch receiver는 기본적으로 「지금(now)」부터 수집을 시작합니다:**

Collector가 처음 시작될 때 현재 시각을 기준으로 체크포인트를 생성하고, 그 시점 이후의 로그만 가져옵니다. 그 이전의 과거 로그는 가져오지 않습니다.

**최근 시점의 과거 로그를 수집하려면:**

Collector의 체크포인트를 중지하고 제거한 다음, Collector를 다시 시작하십시오:

```bash
# Stop the collector
docker stop <container-id>

# Restart fresh (checkpoints are stored in container, so removing it resets)
docker run --rm ...
```

리시버는 새로운 체크포인트를 생성하고 현재 시점 이후의 로그를 가져옵니다.


### 보안 토큰 무효 / 자격 증명 만료

임시 자격 증명(AWS SSO, assumed role 등)을 사용하는 경우 일정 시간이 지나면 만료됩니다.

**새 자격 증명을 다시 export하십시오:**

```bash
# For SSO users:
aws sso login --profile YOUR_PROFILE_NAME
eval $(aws configure export-credentials --profile YOUR_PROFILE_NAME --format env)

# For IAM users:
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"

# Restart the collector
docker restart <container-id>
```


### 지연 시간이 크거나 최근 로그가 누락되는 경우

**폴링 주기 줄이기:**
기본 `poll_interval` 값은 1분입니다. 거의 실시간 로그가 필요하면 값을 줄입니다:

```yaml
logs:
  poll_interval: 30s  # Poll every 30 seconds
```

**참고:** 폴링 간격을 더 짧게 설정하면 AWS API 호출 횟수가 증가하여 CloudWatch API 비용이 더 높아질 수 있습니다.


### Collector가 메모리를 과도하게 사용하는 경우

**배치 크기를 줄이거나 타임아웃을 늘리십시오.**

```yaml
processors:
  batch:
    timeout: 5s
    send_batch_size: 100
```

**자동 검색 범위 제한:**

```yaml
groups:
  autodiscover:
    limit: 50  # Reduce from 100 to 50
```


## 다음 단계 {#next-steps}

이제 CloudWatch 로그가 ClickStack으로 전송되도록 설정했으므로 다음 작업을 진행하십시오:

- 중요 이벤트(연결 실패, 오류 급증)에 대한 [경보](/use-cases/observability/clickstack/alerts)를 설정합니다
- 로그가 ClickStack에 저장되었으므로, 보존 기간을 조정하거나 S3로 아카이빙하여 CloudWatch 비용을 절감합니다
- 수집기 구성에서 불필요한 로그 그룹을 제거하여 불필요한 로그를 줄이고 수집량을 줄입니다

## 운영 환경으로 이전하기 {#going-to-production}

이 가이드는 테스트 목적을 위해 Docker Compose를 사용해 로컬에서 OpenTelemetry Collector를 실행하는 방법을 보여 줍니다. 운영 환경 배포에서는 액세스 키를 별도로 관리할 필요가 없도록 AWS 액세스 권한이 있는 인프라(IAM 역할이 있는 EC2, IRSA가 있는 EKS, 태스크 역할이 있는 ECS)에서 Collector를 실행하십시오. 지연 시간과 비용을 줄이기 위해 CloudWatch 로그 그룹과 동일한 AWS 리전에 Collector를 배포하십시오.

운영 환경 배포 패턴과 Collector 구성 예시는 [OpenTelemetry를 사용한 수집](/use-cases/observability/clickstack/ingesting-data/opentelemetry)을 참고하십시오.
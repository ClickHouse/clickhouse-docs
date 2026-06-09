---
slug: /use-cases/observability/clickstack/monitoring-aws-cloudwatch-logs
title: 'Managed ClickStack으로 AWS CloudWatch 로그 모니터링'
description: 'OpenTelemetry CloudWatch 수신기를 통해 AWS CloudWatch 로그를 Managed ClickStack으로 전달'
doc_type: 'guide'
keywords: ['clickstack', 'aws', 'cloudwatch', 'logs', 'managed', 'observability', 'otel']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import clickstack_cloud from '@site/static/images/use-cases/observability/clickstack-cloud-v2.png';
import log_search_view from '@site/static/images/clickstack/cloudwatch/log-search-view-clickstack.png';
import log_search_attributes_view from '@site/static/images/clickstack/cloudwatch/log-search-attributes-clickstack.png';
import error_log_column_values from '@site/static/images/clickstack/cloudwatch/error-log-column-values-clickstack.png';
import import_dashboard from '@site/static/images/clickstack/clickstack-import-dashboard.png';
import finish_import from '@site/static/images/clickstack/cloudwatch/finish-clickstack-import.png';
import example_dashboard from '@site/static/images/clickstack/cloudwatch/logs-dashboard.png';

이 가이드는 OpenTelemetry [`awscloudwatch` 수신기](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/awscloudwatchreceiver)를 사용해 AWS CloudWatch 로그를 Managed ClickStack으로 전달한 뒤, ClickStack UI에서 확인하는 방법을 안내합니다.

이 과정에서는 AWS API를 통해 CloudWatch를 폴링하고, 이벤트를 OTLP를 통해 ClickStack collector로 전달하는 별도의 collector를 실행합니다. API 지연 시간과 비용을 최소화하려면 이 collector를 log groups와 동일한 AWS 계정 및 Region에 두십시오.

이 가이드는 [OpenTelemetry Collector 설정](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector)을 완료했으며 ClickStack collector가 실행 중이라고 가정합니다.

ClickStack collector는 **Docker 컨테이너**로 배포하거나([OpenTelemetry Collector 설정](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector) 참조), Kubernetes에서 업스트림 OpenTelemetry Helm 차트와 ClickStack collector 이미지를 사용해 **Helm 릴리스**로 배포할 수 있습니다([collector 배포](/use-cases/observability/clickstack/ingesting-data/otel-collector#configuring-the-collector) 참조). 배포 시 설정한 `OTLP_AUTH_TOKEN`과 해당 **OTLP endpoint를 반드시 기록해 두십시오**.

<VerticalStepper headerLevel="h2">
  ## 사전 요구 사항 확인 \{#gather-prerequisites\}

  다음이 필요합니다:

  * 하나 이상의 CloudWatch 로그 그룹과 아래 나열된 IAM 권한이 있는 자격 증명을 보유한 **AWS 계정**.
  * **Docker**가 설치되어 있고 AWS API에 액세스할 수 있으며, ClickStack collector로 나가는 아웃바운드 네트워크 액세스가 가능한 호스트입니다. 일반적으로 log groups와 동일한 AWS 계정 및 리전에 있는 EC2 인스턴스입니다.
  * 이 호스트에서 접근 가능한 ClickStack collector의 **OTLP 엔드포인트**입니다. 동일한 머신에서 Docker로 실행 중이면 `http://host.docker.internal:4318`을 사용하세요([CloudWatch receiver 구성](#configure-receiver)의 안내 상자 참조). 원격 collector의 경우 전체 URL을 사용하십시오. 예를 들어 `https://otel.example.com:4318`입니다.
  * ClickStack collector에 설정된 `OTLP_AUTH_TOKEN` 값입니다. 보안 설정을 하지 않았다면 아래 구성에서 `authorization` 헤더를 생략해도 됩니다.

  ## AWS 자격 증명 구성 \{#configure-aws\}

  수신기는 표준 환경 변수에서 AWS 자격 증명을 읽어옵니다. collector를 실행할 호스트에서 해당 환경 변수를 내보내십시오.

  **AWS SSO 사용자:**

  ```shell
  aws sso login --profile YOUR_PROFILE_NAME
  eval $(aws configure export-credentials --profile YOUR_PROFILE_NAME --format env)
  aws sts get-caller-identity
  ```

  **장기 자격 증명을 사용하는 IAM 사용자:**

  ```shell
  export AWS_ACCESS_KEY_ID="your-access-key-id"
  export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
  export AWS_REGION="us-east-1"
  aws sts get-caller-identity
  ```

  자격 증명에는 CloudWatch Logs를 읽기 위해 다음 IAM 정책이 필요합니다:

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

  `YOUR_ACCOUNT_ID`를 실제 AWS 계정 ID로 교체하십시오.

  :::note 프로덕션 자격 증명
  프로덕션 환경에서는 장기 키 대신 인스턴스에 연결된 자격 증명을 사용하는 것을 권장합니다. EC2의 IAM role, EKS의 IRSA, ECS의 task role이 이에 해당합니다. 수신기가 인스턴스 메타데이터 서비스에서 자격 증명을 확인할 수 있는 경우, 아래의 동일한 collector 설정은 자격 증명 환경 변수 없이도 동작합니다.
  :::

  ## CloudWatch 수신기 구성 \{#configure-receiver\}

  ClickStack collector endpoint와 인증 토큰을 환경 변수로 내보낸 후 `otel-collector-config.yaml`을 생성하십시오.

  :::note 동일 호스트 설정
  아래 예시는 ClickStack collector와 이 CloudWatch collector가 동일한 호스트에서 실행된다고 가정합니다. 따라서 수신기는 `host.docker.internal`(컨테이너 내부에서 Docker 호스트에 접근하는 주소)을 통해 연결됩니다. ClickStack collector가 다른 위치(클러스터 내 서비스, 공개 URL, 사설 IP 등)에 있는 경우, 아래 `OTEL_COLLECTOR_ENDPOINT`에 해당 주소를 대신 입력하십시오.
  :::

  ```shell
  export OTEL_COLLECTOR_ENDPOINT="http://host.docker.internal:4318"
  export OTLP_AUTH_TOKEN="a-strong-shared-secret"
  ```

  <details>
    <summary>계정에서 사용 가능한 로그 그룹을 확인합니다</summary>

    config를 편집하기 전에, 실제 이름을 선택할 수 있도록 현재 리전에 있는 로그 그룹을 먼저 나열하고 리전이 올바른지도 확인하십시오:

    ```shell
    aws logs describe-log-groups --region eu-central-1 \
      --query 'logGroups[].logGroupName' --output table
    ```

    예시 출력:

    ```text
    -------------------------------
    |      DescribeLogGroups      |
    +-----------------------------+
    |  /aws-glue/jobs/error       |
    |  /aws-glue/jobs/logs-v2     |
    |  /aws-glue/jobs/output      |
    |  /aws-glue/sessions/error   |
    |  /aws-glue/sessions/output  |
    +-----------------------------+
    ```

    아래 예시 1의 `groups.named` 블록에 이 목록의 이름을 그대로 사용하십시오. 위 계정의 경우 `named-groups` 섹션은 다음과 같이 바뀝니다:

    ```yaml
    groups:
      named:
        /aws-glue/jobs/error:
        /aws-glue/jobs/logs-v2:
        /aws-glue/jobs/output:
        /aws-glue/sessions/error:
        /aws-glue/sessions/output:
    ```

    또는 원하는 그룹 이름이 공통 접두사(여기서는 `/aws-glue/`)로 시작한다면, 각각을 일일이 나열하는 대신 `prefix: /aws-glue/`를 사용하는 예시 2를 사용하세요.
  </details>

  **예시 1: 이름이 지정된 로그 그룹(log groups) (권장)**

  ```shell
  cat > otel-collector-config.yaml <<'EOF'
  receivers:
    awscloudwatch:
      region: eu-central-1
      logs:
        poll_interval: 1m
        max_events_per_request: 100
        groups:
          named:
            /aws-glue/jobs/error:
            /aws-glue/jobs/output:
            /aws-glue/sessions/error:

  processors:
    batch:
      timeout: 10s

  exporters:
    otlphttp:
      endpoint: ${OTEL_COLLECTOR_ENDPOINT}
      headers:
        authorization: ${OTLP_AUTH_TOKEN}

  service:
    pipelines:
      logs:
        receivers: [awscloudwatch]
        processors: [batch]
        exporters: [otlphttp]
  EOF
  ```

  **예시 2: 접두사(prefix)로 로그 그룹 자동 검색**

  ```shell
  cat > otel-collector-config.yaml <<'EOF'
  receivers:
    awscloudwatch:
      region: eu-central-1
      logs:
        poll_interval: 1m
        max_events_per_request: 100
        groups:
          autodiscover:
            limit: 100
            prefix: /aws-glue/

  processors:
    batch:
      timeout: 10s

  exporters:
    otlphttp:
      endpoint: ${OTEL_COLLECTOR_ENDPOINT}
      headers:
        authorization: ${OTLP_AUTH_TOKEN}

  service:
    pipelines:
      logs:
        receivers: [awscloudwatch]
        processors: [batch]
        exporters: [otlphttp]
  EOF
  ```

  조정할 주요 설정:

  * 로그 그룹이 위치한 리전에 맞게 `region`을 설정하십시오.
  * `poll_interval` (`1m` 기본값). 값을 낮추면 AWS API 호출 수가 늘어나는 대신 로그를 거의 실시간으로 수집할 수 있습니다.
  * `groups.named`는 명시적 목록에 사용하고, 특정 접두사와 일치하는 모든 그룹을 가져오려면 `groups.autodiscover.prefix`를 사용합니다.

  전체 옵션 목록은 [CloudWatch 수신기 문서](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/awscloudwatchreceiver)를 참조하십시오.

  :::note 최근 로그만 수집
  처음 실행 시 수신기는 현재 시점을 체크포인트로 설정하고 이후의 로그만 가져옵니다. 이전 로그는 소급하여 수집(backfill)되지 않습니다.
  :::

  ## 수신기 collector 시작하기 \{#start-collector\}

  `otel-collector-config.yaml`와 함께 `docker-compose.yaml`을 생성하십시오. `extra_hosts` 항목을 통해 컨테이너가 `host.docker.internal`을 경유하여 동일한 호스트에서 실행 중인 ClickStack collector에 접근할 수 있습니다. 긴 형식의 바인드 마운트는 설정 파일이 없을 경우, 빈 디렉터리를 자동으로 생성하는 대신 명시적으로 오류를 발생시킵니다.

  ```shell
  cat > docker-compose.yaml <<'EOF'
  services:
    otel-collector:
      image: otel/opentelemetry-collector-contrib:latest
      command: ["--config=/etc/otel-config.yaml"]
      volumes:
        - type: bind
          source: ./otel-collector-config.yaml
          target: /etc/otel-config.yaml
          read_only: true
      environment:
        - AWS_ACCESS_KEY_ID
        - AWS_SECRET_ACCESS_KEY
        - AWS_SESSION_TOKEN
        - AWS_REGION
        - OTEL_COLLECTOR_ENDPOINT
        - OTLP_AUTH_TOKEN
      extra_hosts:
        - "host.docker.internal:host-gateway"
      restart: unless-stopped
  EOF
  ```

  collector를 시작하세요:

  ```shell
  docker compose up -d
  ```

  logs를 tail하여 CloudWatch를 폴링하고 ClickStack collector로 내보내고 있는지 확인하십시오:

  ```shell
  docker compose logs -f otel-collector
  ```

  ## ClickStack UI에서 확인 \{#confirm-in-ui\}

  [ClickHouse Cloud 콘솔](https://console.clickhouse.cloud)에서 서비스를 열고 왼쪽 메뉴에서 **ClickStack**을 선택하십시오.

  <Image img={clickstack_cloud} size="lg" alt="ClickStack 시작하기" border />

  **Search** 뷰에서 소스를 `Logs`로 전환하고 시간 범위를 **Last 15 minutes**로 설정하십시오. CloudWatch 이벤트는 몇 번의 폴링 주기 안에 표시됩니다.

  <Image img={log_search_view} size="lg" alt="CloudWatch Logs가 포함된 ClickStack Search view" />

  각 이벤트는 소스 그룹과 스트림을 리소스 속성(resource attributes)으로 포함합니다:

  * `ResourceAttributes['aws.region']`: AWS 리전(예: `eu-central-1`)
  * `ResourceAttributes['cloudwatch.log.group.name']`: 로그 소스 그룹
  * `ResourceAttributes['cloudwatch.log.stream']`: 원본 로그 스트림
  * `Body`: 원본 로그 한 줄

  다음 속성들을 포함하려면 검색을 `Timestamp, SeverityText as level, ResourceAttributes['aws.region'], ResourceAttributes['cloudwatch.log.group.name'], ResourceAttributes['cloudwatch.log.stream'], Body`로 수정하십시오:

  <Image img={log_search_attributes_view} size="lg" alt="CloudWatch Logs 및 속성이 포함된 ClickStack Search view" />

  로그 항목을 선택하여 메타데이터를 확인하십시오:

  <Image img={error_log_column_values} size="lg" alt="로그 상세 보기 내 CloudWatch 속성" />

  아무것도 표시되지 않는 경우:

  * 자격 증명이 유효한지 확인하려면 collector 호스트에서 `aws sts get-caller-identity`를 실행하십시오.
  * `docker compose logs -f otel-collector`로 collector 로그를 확인하고, `AccessDeniedException`(IAM), `security token` 오류(만료된 SSO 자격 증명), `ResourceNotFoundException`(로그 그룹 이름 오타 또는 잘못된 리전), 또는 `connection refused`(컨테이너 내부에서 ClickStack collector endpoint에 연결할 수 없는 경우, [CloudWatch 수신기 구성](#configure-receiver)의 `host.docker.internal` 참고)가 있는지 살펴보십시오.
  * 컨테이너 내부에서 `OTEL_COLLECTOR_ENDPOINT`에 도달할 수 있는지 확인하세요: `docker compose exec otel-collector wget -qO- ${OTEL_COLLECTOR_ENDPOINT}/v1/logs -S 2>&1 | head -5`.
  * `OTLP_AUTH_TOKEN`이 ClickStack collector에 설정한 값과 일치하는지 확인하세요.

  ## CloudWatch 대시보드 가져오기 (선택 사항) \{#import-dashboard\}

  로그 볼륨, 심각도 분류, 오류 분포가 포함된 사전 구축된 대시보드를 다운로드할 수 있습니다.

  <TrackedLink href={useBaseUrl('/examples/cloudwatch-logs-dashboard.json')} download="cloudwatch-logs-dashboard.json" eventName="docs.cloudwatch_logs_monitoring.dashboard_download">`cloudwatch-logs-dashboard.json`을 다운로드</TrackedLink>한 후, ClickStack UI에서 **Dashboards**로 이동하여 **Import**를 클릭하십시오.

  <Image img={import_dashboard} size="lg" alt="대시보드 가져오기 버튼" />

  JSON 파일을 업로드한 후 **Finish Import**를 클릭하십시오.

  <Image img={finish_import} size="lg" alt="가져오기 완료 대화 상자" />

  ## 추가 자료 \{#further-reading\}

  * 데모 데이터세트, 자세한 문제 해결 방법 및 튜닝 옵션은 [AWS CloudWatch Logs 통합 참고](/use-cases/observability/clickstack/integrations/aws-cloudwatch-logs)를 참조하십시오.
  * [OTLP 엔드포인트에서 TLS를 사용해 collector 보호](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector) 및 최소 권한 원칙을 적용한 수집 사용자.
  * [collector에서 이벤트를 처리, 필터링, 보강](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching).
  * 프로덕션 환경으로 전환할 때의 권장 사항은 [프로덕션 환경으로 전환하기](/use-cases/observability/clickstack/production)를 참조하십시오.
</VerticalStepper>
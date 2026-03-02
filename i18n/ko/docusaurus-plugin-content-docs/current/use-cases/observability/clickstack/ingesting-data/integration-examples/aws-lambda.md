---
slug: /use-cases/observability/clickstack/integrations/aws-lambda
title: "ClickStack과 Rotel을 사용하여 AWS Lambda 로그 모니터링하기"
sidebar_label: "AWS Lambda 로그"
pagination_prev: null
pagination_next: null
description: "ClickStack과 Rotel을 사용하여 AWS Lambda 로그 모니터링하기"
doc_type: 'guide'
keywords: ['AWS', 'Lambda', 'OTEL', 'ClickStack', 'logs', 'CloudWatch']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import log_view from '@site/static/images/clickstack/lambda/lambda-log-view.png';
import log from '@site/static/images/clickstack/lambda/lambda-log.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Rotel을 사용하여 ClickStack으로 AWS Lambda 로그 모니터링 \{#lambda-clickstack\}

<CommunityMaintainedBadge/>

:::note[요약]
이 가이드는 Rotel Lambda Extension을 사용해 함수 로그, 익스텐션 로그, OpenTelemetry 데이터를 직접 ClickHouse로 수집·전송하여 ClickStack으로 AWS Lambda 함수를 모니터링하는 방법을 설명합니다. 이 가이드를 통해 다음 내용을 학습합니다:

- Rotel Lambda Extension 레이어를 Lambda 함수에 배포합니다
- 익스텐션을 구성하여 로그와 트레이스를 ClickStack으로 전송합니다
- 선택적으로 CloudWatch Logs를 비활성화하여 비용을 절감합니다

이 방법을 사용하면 CloudWatch Logs를 완전히 우회함으로써 Lambda 관측성 비용을 크게 줄일 수 있습니다.

소요 시간: 5~10분
:::

## 기존 Lambda 함수와의 통합 \{#existing-lambda\}

이 섹션에서는 기존 AWS Lambda 함수를 설정하여 Rotel Lambda Extension을 사용해 로그 및 트레이스를 ClickStack으로 전송하는 방법을 설명합니다.

### 사전 준비사항 \{#prerequisites\}

- 실행 중인 ClickStack 인스턴스
- 모니터링할 AWS Lambda 함수(들)
- 적절한 권한으로 구성된 AWS CLI
- 레이어를 추가할 수 있는 권한이 있는 Lambda 실행 역할

<VerticalStepper headerLevel="h4">
  #### 적절한 Rotel Lambda Extension 레이어를 선택하세요

  Lambda 런타임 아키텍처에 맞는 Lambda 레이어를 선택하세요. `{version}` 필드는
  배포할 AWS 리전에 따라 달라집니다. 리전별 최신 버전 번호는 [releases](https://github.com/streamfold/rotel-lambda-extension/releases)
  페이지에서 확인하세요.

  | 아키텍처         | ARN                                                                          |
  | ------------ | ---------------------------------------------------------------------------- |
  | x86-64/amd64 | `arn:aws:lambda:{region}:418653438961:layer:rotel-extension-amd64:{version}` |
  | arm64        | `arn:aws:lambda:{region}:418653438961:layer:rotel-extension-arm64:{version}` |

  **사용 가능한 지역:**

  * us-east-{1, 2}, us-west-{1, 2}
  * eu-central-1, eu-north-1, eu-west-{1, 2, 3}
  * ca-central-1
  * ap-southeast-{1, 2}, ap-northeast-{1, 2}
  * ap-south-1
  * sa-east-1

  #### Lambda 함수에 Rotel 레이어를 추가하세요

  *이 예제에서 `{arch}`, `{region}`, `{version}`을 위의 적절한 값으로 교체하세요.*

  ##### 옵션 1: AWS 콘솔

  1. AWS Lambda 콘솔을 여십시오
  2. Lambda 함수로 이동하십시오
  3. **Layers** 섹션까지 스크롤한 다음 **Add a layer**를 클릭하십시오
  4. **Specify an ARN**을 선택하십시오
  5. Rotel 레이어의 ARN을 입력하십시오:
     ```text
     arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}:{version}
     ```
  6. **Add**를 클릭합니다.

  ##### 옵션 2: AWS CLI

  ```bash
  aws lambda update-function-configuration \
    --function-name my-function \
    --layers arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}:{version}
  ```

  ##### 옵션 3: AWS SAM

  ```yaml
  Resources:
    MyFunction:
      Type: AWS::Serverless::Function
      Properties:
        # ... other configuration ...
        Layers:
          - arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}:{version}
  ```

  #### ClickStack으로 내보내기 위한 확장 구성

  Rotel Lambda Extension은 환경 변수를 사용하여 구성합니다. OTLP 익스포터 엔드포인트가 ClickStack 인스턴스를 가리키도록 구성하세요. 예제는 AWS Lambda 함수가 ClickStack 인스턴스에 접근할 수 있다고 가정합니다.

  ##### 기본 구성(환경 변수)

  Lambda 함수에 다음 환경 변수를 추가하세요:

  ```bash
  # Required: ClickStack OTLP endpoint
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317

  # Optional: Authentication headers
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=<YOUR_INGESTION_API_KEY>"

  # Optional: Service name (defaults to Lambda function name)
  ROTEL_OTEL_RESOURCE_ATTRIBUTES="service.name=my-lambda-api,service.version=1.0.0"
  ```

  ##### 고급 구성(.env 파일 사용)

  더 복잡한 구성을 위해서는 Lambda 함수 번들에 `rotel.env` 파일을 생성하세요:

  **rotel.env:**

  ```bash
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=<YOUR_INGESTION_API_KEY>"
  ROTEL_OTEL_RESOURCE_ATTRIBUTES="service.name=my-lambda-api,deployment.environment=production"
  ```

  그런 다음 환경 변수가 이 파일을 가리키도록 설정하세요:

  ```bash
  ROTEL_ENV_FILE=/var/task/rotel.env
  ```

  ##### AWS Secrets Manager 또는 Parameter Store 사용하기

  프로덕션 배포 환경에서는 API 키와 같은 민감한 값을 AWS Secrets Manager 또는 Parameter Store에 저장하세요:

  **AWS Secrets Manager 예제:**

  ```bash
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=${arn:aws:secretsmanager:us-east-1:123456789012:secret:clickstack-api-key-abc123}"
  ```

  **AWS Parameter Store 예제:**

  ```bash
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=${arn:aws:ssm:us-east-1:123456789012:parameter/clickstack-api-key}"
  ```

  **필수 IAM 권한:**

  Lambda 실행 역할에 다음 권한을 추가하세요:

  Secrets Manager를 사용하는 경우:

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "secretsmanager:GetSecretValue",
          "secretsmanager:BatchGetSecretValue"
        ],
        "Resource": "arn:aws:secretsmanager:us-east-1:123456789012:secret:clickstack-api-key-*"
      }
    ]
  }
  ```

  Parameter Store를 사용하는 경우:

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "ssm:GetParameters"
        ],
        "Resource": "arn:aws:ssm:us-east-1:123456789012:parameter/clickstack-api-key"
      }
    ]
  }
  ```

  :::note
  시크릿 조회를 위한 AWS API 호출은 콜드 스타트 지연 시간에 100-150ms를 추가합니다. 시크릿은 배치 단위(최대 10개)로 조회되며 초기화 시에만 수행되므로, 이후 호출에는 영향을 주지 않습니다.
  :::

  #### 통합 테스트하기

  Lambda 함수를 호출하여 로그가 ClickStack으로 전송되는지 확인하세요:

  ```bash
  aws lambda invoke \
    --function-name my-function \
    --payload '{"test": "data"}' \
    response.json
  ```

  Lambda 로그에서 오류가 있는지 확인하세요:

  ```bash
  aws logs tail /aws/lambda/my-function --follow
  ```

  #### HyperDX에서 로그 확인하기

  구성이 완료되면 HyperDX(ClickStack의 UI)에 로그인하여 로그가 수집되는지 확인하세요:

  <Image img={log_view} alt="Lambda 로그 뷰" />

  <Image img={log} alt="Lambda 로그 상세 정보" />

  로그에서 다음 주요 속성을 찾으십시오:

  * `service.name`: 해당 Lambda 함수 이름
  * `faas.name`: AWS Lambda 함수 이름
  * `faas.invocation_id`: 고유 호출 ID
  * `cloud.provider`: &quot;aws&quot;
  * `cloud.platform`: &quot;aws&#95;lambda&quot;
</VerticalStepper>

## CloudWatch Logs 비활성화 (비용 최적화) {#disable-cloudwatch}

기본적으로 AWS Lambda는 모든 로그를 CloudWatch Logs로 전송하며, 대규모 환경에서는 비용이 많이 들 수 있습니다. 로그가 ClickStack으로 정상적으로 수집되는 것을 확인한 후에는 비용을 절감하기 위해 CloudWatch 로깅을 비활성화할 수 있습니다.

<VerticalStepper headerLevel="h4">

#### 실행 역할에서 CloudWatch 권한 제거 \{#remove-permissions\}

1. AWS Management Console을 열고 **AWS Lambda**로 이동합니다.
2. Lambda 함수 상세 페이지로 이동합니다.
3. **Configuration** → **Permissions**를 선택합니다.
4. 실행 역할 이름을 클릭하여 IAM 콘솔을 엽니다.
5. 역할을 편집하여 `logs:*` 작업을 모두 제거합니다.
   - 커스텀 정책을 사용하는 경우 `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`를 제거하도록 수정합니다.
   - AWS 관리형 정책 `AWSLambdaBasicExecutionRole`을 사용하는 경우 역할에서 제거합니다.
6. 역할을 저장합니다.

#### CloudWatch 로깅 비활성화 확인 {#verify-disabled}

함수를 다시 호출한 후 다음을 확인합니다.
1. 새로운 CloudWatch 로그 스트림이 생성되지 않습니다.
2. 로그가 계속 ClickStack/HyperDX에 표시됩니다.

```bash
# 정책 변경 후 새로운 로그 스트림이 없어야 합니다.
aws logs describe-log-streams \
  --log-group-name /aws/lambda/my-function \
  --order-by LastEventTime \
  --descending \
  --max-items 5
```

</VerticalStepper>

## OpenTelemetry 자동 계측 추가 {#auto-instrumentation}

Rotel Lambda Extension은 로그뿐 아니라 분산 트레이스와 메트릭을 수집하기 위해 OpenTelemetry 자동 계측 레이어와 원활하게 연동됩니다.

<VerticalStepper headerLevel="h4">

#### 언어별 계측 레이어 선택 {#choose-instrumentation}

AWS는 여러 언어용 OpenTelemetry 자동 계측 레이어를 제공합니다:

| Language | Layer ARN 패턴 |
|----------|----------------|
| Node.js  | `arn:aws:lambda:{region}:901920570463:layer:aws-otel-nodejs-{arch}-ver-{version}` |
| Python   | `arn:aws:lambda:{region}:901920570463:layer:aws-otel-python-{arch}-ver-{version}` |
| Java     | `arn:aws:lambda:{region}:901920570463:layer:aws-otel-java-agent-{arch}-ver-{version}` |

[AWS OpenTelemetry Lambda 저장소](https://github.com/aws-observability/aws-otel-lambda)에서 최신 버전을 확인하십시오.

#### 두 레이어를 모두 함수에 추가 \{#add-both-layers\}

Rotel Extension 레이어와 계측 레이어 **두 가지 모두**를 추가합니다:

```bash
aws lambda update-function-configuration \
  --function-name my-function \
  --layers \
    arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}:{version} \
    arn:aws:lambda:{region}:901920570463:layer:aws-otel-nodejs-{arch}-ver-1-30-2:1
```

#### 자동 계측 구성 {#configure-instrumentation}

자동 계측을 활성화하려면 `AWS_LAMBDA_EXEC_WRAPPER` 환경 변수를 설정합니다:

**Node.js의 경우:**
```bash
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
```

**Python의 경우:**
```bash
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-instrument
```

**Java의 경우:**
```bash
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
```

#### HyperDX에서 트레이스 확인 {#verify-traces}

함수를 호출한 후 다음을 수행합니다:

1. HyperDX에서 **Traces** 뷰로 이동합니다.
2. Lambda 함수에서 생성된 span을 포함하는 트레이스를 확인할 수 있습니다.
3. 트레이스는 `trace_id` 및 `span_id` 속성을 통해 로그와 연관되어 표시됩니다.

</VerticalStepper>

## 예시 애플리케이션 {#examples}

Rotel Lambda Extension을 시연하는 Python 앱 예제를 확인하십시오:

- **[Python + ClickHouse](https://github.com/streamfold/python-aws-lambda-clickhouse-example)**: 수동 OpenTelemetry 계측을 사용하는 Python 애플리케이션으로, 트레이스와 로그를 ClickHouse로 직접 전송합니다

## Rotel 커뮤니티에 참여하기 {#join-rotel-community}

Rotel에 대해 궁금한 점이 있으면 [Rotel Discord 서버](https://rotel.dev)에 참여해 의견이나 질문을 나누십시오. 개선에 기여하고 싶다면 [Rotel Lambda Extension](https://github.com/streamfold/rotel-lambda-extension)을 살펴보십시오.

## 추가 리소스 {#resources}

- **[Rotel Lambda Extension](https://github.com/streamfold/rotel-lambda-extension)**: 소스 코드와 자세한 문서
- **[Rotel Core](https://github.com/streamfold/rotel)**: 이 확장을 구동하는 경량 OTel 데이터 플레인
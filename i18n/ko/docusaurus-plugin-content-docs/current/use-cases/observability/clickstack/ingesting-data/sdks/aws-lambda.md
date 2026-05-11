---
slug: /use-cases/observability/clickstack/sdks/aws_lambda
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: 'ClickStack용 AWS Lambda - ClickHouse 관측성 스택'
title: 'AWS Lambda'
doc_type: 'guide'
keywords: ['ClickStack', 'observability', 'aws-lambda', 'lambda-layers']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

**이 가이드에서 통합하는 항목:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 로그(Logs)</td>
      <td className="pe-2">✅ 메트릭(Metrics)</td>
      <td className="pe-2">✅ 트레이스(Traces)</td>
    </tr>
  </tbody>
</table>


## OpenTelemetry Lambda 레이어 설치 \{#installing-the-otel-lambda-layers\}

OpenTelemetry 프로젝트에서는 다음 목적을 위해 별도의 Lambda 레이어를 제공합니다:

1. OpenTelemetry 자동 계측으로 Lambda 함수 코드를 자동으로 계측하기.
2. 수집된 로그, 메트릭, 트레이스를 ClickStack으로 전달하기.

### 언어별 자동 계측 레이어 추가 \{#adding-language-specific-auto-instrumentation\}

언어별 자동 계측 Lambda 레이어는 해당 언어용 OpenTelemetry 자동 계측 패키지를 사용하여 Lambda 함수 코드를 자동으로 계측합니다. 

각 언어와 리전마다 고유한 레이어 ARN이 있습니다.

Lambda가 이미 OpenTelemetry SDK로 계측되어 있는 경우, 이 단계는 건너뛰어도 됩니다.

**시작하려면**:

1. Layers 섹션에서 "Add a layer"를 클릭합니다.
2. ARN을 직접 지정하는 옵션을 선택한 후 언어에 맞는 ARN을 선택합니다. 이때 `<region>`을 사용 중인 리전으로 교체해야 합니다 (예: `us-east-2`):

<Tabs groupId="install-language-options">
<TabItem value="javascript" label="JavaScript" default>

```shell
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-nodejs-0_7_0:1
```

</TabItem>
<TabItem value="python" label="Python" default>

```shell copy
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-python-0_7_0:1
```

</TabItem>

<TabItem value="java" label="Java" default>

```shell copy
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-javaagent-0_6_0:1
```

</TabItem>

<TabItem value="ruby" label="Ruby" default>

```shell copy
arn:aws:lambda:<region>:184161586896:layer:opentelemetry-ruby-0_1_0:1
```

</TabItem>

</Tabs>

_레이어의 최신 릴리스는 [OpenTelemetry Lambda Layers GitHub 저장소](https://github.com/open-telemetry/opentelemetry-lambda/releases)에서 확인할 수 있습니다._

3. Lambda 함수에서 "Configuration" > "Environment variables" 아래에 다음 환경 변수를 설정합니다.

<Tabs groupId="install-language-env">
<TabItem value="javascript" label="JavaScript" default>

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
OTEL_PROPAGATORS=tracecontext
OTEL_TRACES_SAMPLER=always_on
```

</TabItem>
<TabItem value="python" label="Python" default>

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-instrument
OTEL_PROPAGATORS=tracecontext
OTEL_TRACES_SAMPLER=always_on
```

</TabItem>

<TabItem value="java" label="Java" default>

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
OTEL_PROPAGATORS=tracecontext
OTEL_TRACES_SAMPLER=always_on
```

</TabItem>

<TabItem value="ruby" label="Ruby" default>

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
OTEL_PROPAGATORS=tracecontext
OTEL_TRACES_SAMPLER=always_on
```

</TabItem>

</Tabs>

### OpenTelemetry collector Lambda 레이어 설치 \{#installing-the-otel-collector-layer\}

collector Lambda 레이어를 사용하면 exporter 지연(latency)으로 인한 응답 시간 영향 없이 Lambda 함수에서 ClickStack으로 로그, 메트릭, 트레이스를 전달할 수 있습니다.

**collector 레이어를 설치하려면**:

1. Layers 섹션에서 「Add a layer」를 클릭합니다.
2. 「Specify an ARN」을 선택한 다음 아키텍처에 맞는 ARN을 선택합니다. 이때 `<region>`을 사용하는 리전으로 교체해야 합니다(예: `us-east-2`):

<Tabs groupId="install-language-layer">
  <TabItem value="x86_64" label="x86_64" default>
    ```shell
    arn:aws:lambda:<region>:184161586896:layer:opentelemetry-collector-amd64-0_8_0:1
    ```
  </TabItem>

  <TabItem value="arm64" label="arm64" default>
    ```shell
    arn:aws:lambda:<region>:184161586896:layer:opentelemetry-collector-arm64-0_8_0:1
    ```
  </TabItem>
</Tabs>

3. 다음 `collector.yaml` 파일을 프로젝트에 추가하여 collector가 데이터를 ClickStack으로 전송하도록 구성합니다:

<Tabs groupId="service-type">
  <TabItem value="clickstack-managed" label="Managed ClickStack" default>
    ```yaml
    # collector.yaml
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 'localhost:4317'
          http:
            endpoint: 'localhost:4318'

    processors:
      batch:
      decouple:

    exporters:
      otlphttp:
        endpoint: "<YOU_OTEL_COLLECTOR_HTTP_ENDPOINT>"
        compression: gzip

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [batch, decouple]
          exporters: [otlphttp]
        metrics:
          receivers: [otlp]
          processors: [batch, decouple]
          exporters: [otlphttp]
        logs:
          receivers: [otlp]
          processors: [batch, decouple]
          exporters: [otlphttp]
    ```
  </TabItem>

  <TabItem value="clickstack-oss" label="ClickStack Open Source">
    ```yaml
    # collector.yaml
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 'localhost:4317'
          http:
            endpoint: 'localhost:4318'

    processors:
      batch:
      decouple:

    exporters:
      otlphttp:
        endpoint: "<YOU_OTEL_COLLECTOR_HTTP_ENDPOINT>"
        headers:
          authorization: <YOUR_INGESTION_API_KEY>
        compression: gzip

    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [batch, decouple]
          exporters: [otlphttp]
        metrics:
          receivers: [otlp]
          processors: [batch, decouple]
          exporters: [otlphttp]
        logs:
          receivers: [otlp]
          processors: [batch, decouple]
          exporters: [otlphttp]
    ```
  </TabItem>
</Tabs>

4. 다음 환경 변수를 추가합니다:

```shell
OPENTELEMETRY_COLLECTOR_CONFIG_FILE=/var/task/collector.yaml
```


## 설치 확인 \{#checking-the-installation\}

레이어를 배포한 후에는 이제 Lambda 함수에서 발생한 트레이스가 HyperDX에서 자동으로 수집되어 표시됩니다. `decouple` 및 `batching` 
processor는 텔레메트리 수집에 지연을 유발할 수 있으므로, 트레이스가 표시되는 데 시간이 걸릴 수 있습니다. 사용자 정의 로그나 메트릭을 전송하려면, 사용 중인 언어 전용 
OpenTelemetry SDKS를 사용해 코드를 계측해야 합니다.

## 문제 해결 \{#troubleshoting\}

### 사용자 정의 계측이 전송되지 않음 \{#custom-instrumentation-not-sending\}

수동으로 정의한 trace 또는 다른 텔레메트리 데이터가 표시되지 않는다면,
호환되지 않는 버전의 OpenTelemetry API 패키지를 사용하고 있을 수 있습니다.
OpenTelemetry API 패키지의 버전이 AWS Lambda에 포함된 버전과 같거나
더 낮은 버전인지 확인하십시오.

### SDK 디버그 로그 활성화 \{#enabling-sdk-debug-logs\}

OpenTelemetry SDK의 디버그 로그를 활성화하려면 `OTEL_LOG_LEVEL` 환경 변수를 `DEBUG`로 설정합니다. 이렇게 하면 자동 계측 계층이 애플리케이션을 정상적으로 계측하고 있는지 확인하는 데 도움이 됩니다.

### 콜렉터 디버그 로그 활성화 \{#enabling-collector-debug-logs\}

콜렉터 관련 문제를 디버깅하려면 콜렉터 설정 파일을 수정하여 `logging` exporter를 추가하고,
텔레메트리 로그 레벨을 `debug`로 설정하여 콜렉터 람다 레이어에서 더 자세한 로그가 출력되도록 할 수 있습니다.

<Tabs groupId="service-type">
<TabItem value="clickstack-managed" label="Managed ClickStack" default>

```yaml
# collector.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 'localhost:4317'
      http:
        endpoint: 'localhost:4318'

exporters:
  logging:
    verbosity: detailed
  otlphttp:
    endpoint: "<YOU_OTEL_COLLECTOR_HTTP_ENDPOINT>"
    compression: gzip

service:
  telemetry:
    logs:
      level: "debug"
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp, logging]
    metrics:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp, logging]
    logs:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp, logging]
```

</TabItem>

<TabItem value="clickstack-oss" label="ClickStack 오픈 소스">

```yaml
# collector.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 'localhost:4317'
      http:
        endpoint: 'localhost:4318'

exporters:
  logging:
    verbosity: detailed
  otlphttp:
    endpoint: "<YOU_OTEL_COLLECTOR_HTTP_ENDPOINT>"
    headers:
      authorization: <YOUR_INGESTION_API_KEY>
    compression: gzip

service:
  telemetry:
    logs:
      level: "debug"
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp, logging]
    metrics:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp, logging]
    logs:
      receivers: [otlp]
      processors: [batch, decouple]
      exporters: [otlphttp, logging]
```

</TabItem>
</Tabs>
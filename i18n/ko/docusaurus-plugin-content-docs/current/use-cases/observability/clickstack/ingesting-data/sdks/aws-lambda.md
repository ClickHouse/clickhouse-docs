---
'slug': '/use-cases/observability/clickstack/sdks/aws_lambda'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 6
'description': 'AWS Lambda for ClickStack - ClickHouse 관측 가능성 스택'
'title': 'AWS Lambda'
'doc_type': 'guide'
'keywords':
- 'ClickStack'
- 'observability'
- 'aws-lambda'
- 'lambda-layers'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

**이 가이드는 다음을 통합합니다:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 로그</td>
      <td className="pe-2">✅ 메트릭</td>
      <td className="pe-2">✅ 트레이스</td>
    </tr>
  </tbody>
</table>

## OpenTelemetry Lambda 레이어 설치하기 {#installing-the-otel-lambda-layers}

OpenTelemetry 프로젝트는 다음과 같은 별도의 lambda 레이어를 제공합니다:

1. OpenTelemetry 자동 계측을 사용하여 Lambda 함수 코드를 자동으로 계측합니다.
2. 수집된 로그, 메트릭 및 트레이스를 ClickStack으로 전달합니다.

### 언어별 자동 계측 레이어 추가하기 {#adding-language-specific-auto-instrumentation}

언어별 자동 계측 lambda 레이어는 특정 언어에 대한 OpenTelemetry 자동 계측 패키지를 사용하여 Lambda 함수 코드를 자동으로 계측합니다.

각 언어 및 지역에는 고유한 레이어 ARN이 있습니다.

이미 OpenTelemetry SDK로 계측된 Lambda인 경우, 이 단계를 건너뛸 수 있습니다.

**시작하려면**:

1. Layers 섹션에서 "Add a layer"를 클릭합니다.
2. ARN을 지정하고 언어에 따라 올바른 ARN을 선택합니다. `<region>` 부분을 귀하의 지역으로 교체합니다(예: `us-east-2`):

<Tabs groupId="install-language-options">
<TabItem value="javascript" label="Javascript" default>

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

_레イヤ의 최신 릴리스는 [OpenTelemetry Lambda Layers GitHub 저장소](https://github.com/open-telemetry/opentelemetry-lambda/releases)에서 확인할 수 있습니다._

3. "Configuration" > "Environment variables"에서 Lambda 함수의 다음 환경 변수를 구성합니다.

<Tabs groupId="install-language-env">
<TabItem value="javascript" label="Javascript" default>

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

### OpenTelemetry 수집기 Lambda 레이어 설치하기 {#installing-the-otel-collector-layer}

수집기 Lambda 레이어를 사용하면 Lambda 함수에서 ClickStack으로 로그, 메트릭 및 트레이스를 전달할 수 있으며, 수출자 지연으로 인한 응답 시간에 영향을 주지 않습니다.

**수집기 레이어 설치하기**:

1. Layers 섹션에서 "Add a layer"를 클릭합니다.
2. ARN을 지정하고 아키텍처에 따라 올바른 ARN을 선택합니다. `<region>` 부분을 귀하의 지역으로 교체합니다(예: `us-east-2`):

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

3. ClickStack으로 전송하기 위해 수집기를 구성하는 `collector.yaml` 파일을 프로젝트에 추가합니다:

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
    endpoint: "<YOU_OTEL_COLLECTOR_HTTP_ENDPOINT>
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

4. 다음 환경 변수를 추가합니다:

```shell
OPENTELEMETRY_COLLECTOR_CONFIG_FILE=/var/task/collector.yaml
```

## 설치 확인하기 {#checking-the-installation}

레이어를 배포한 후, 이제 HyperDX에서 Lambda 함수에서 자동으로 수집된 트레이스를 볼 수 있습니다. `decouple` 및 `batching` 처리기는 텔레메트리 수집에 지연을 초래할 수 있으므로, 트레이스가 나타나기까지 지연이 있을 수 있습니다. 사용자 정의 로그 또는 메트릭을 방출하려면 언어별 OpenTelemetry SDK로 코드를 계측해야 합니다.

## 문제 해결 {#troubleshoting}

### 사용자 정의 계측이 전송되지 않음 {#custom-instrumentation-not-sending}

수동으로 정의한 트레이스나 다른 텔레메트리가 보이지 않는 경우, OpenTelemetry API 패키지의 비호환 버전을 사용하고 있을 수 있습니다. OpenTelemetry API 패키지가 AWS lambda에 포함된 버전과 같거나 낮은 버전인지 확인하세요.

### SDK 디버그 로그 활성화 {#enabling-sdk-debug-logs}

OpenTelemetry SDK의 디버그 로그를 활성화하려면 `OTEL_LOG_LEVEL` 환경 변수를 `DEBUG`로 설정합니다. 이렇게 하면 자동 계측 레이어가 애플리케이션을 올바르게 계측하고 있는지 확인하는 데 도움이 됩니다.

### 수집기 디버그 로그 활성화 {#enabling-collector-debug-logs}

수집기 문제를 디버그하려면, 수집기 구성 파일을 수정하여 `logging` 수출자를 추가하고 텔레메트리 로그 수준을 `debug`로 설정하여 수집기 lambda 레이어에서 더 자세한 로그를 활성화할 수 있습니다.

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
    endpoint: "https://in-otel.hyperdx.io"
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

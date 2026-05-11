---
slug: /use-cases/observability/clickstack/sdks/java
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'ClickStack용 Java SDK - ClickHouse 관측성 스택'
title: 'Java'
doc_type: 'guide'
keywords: ['Java용 ClickStack SDK', 'Java OpenTelemetry ClickStack 연동', 'Java 관측성 SDK', 'ClickStack Java 통합', 'Java 애플리케이션 모니터링']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack는 텔레메트리 데이터(로그와 트레이스)를 수집하기 위해 OpenTelemetry 표준을 사용합니다. 트레이스는 자동 계측으로 자동 생성되므로, 트레이싱을 효과적으로 활용하기 위해 수동 계측을 할 필요는 없습니다.

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


## 시작하기 \{#getting-started\}

:::note
현재 이 통합은 **Java 8+** 환경에서만 지원됩니다.
:::

### OpenTelemetry Java 에이전트 다운로드 \{#download-opentelemetry-java-agent\}

[`opentelemetry-javaagent.jar`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar)을
다운로드한 다음, 원하는 디렉터리에 JAR 파일을 저장합니다. 이 JAR 파일에는 에이전트와
계측 라이브러리가 포함되어 있습니다. 다음 명령을 사용하여 에이전트를
다운로드할 수도 있습니다:

```shell
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
```


### 환경 변수 구성 \{#configure-environment-variables\}

이후 OpenTelemetry collector를 통해 ClickStack으로 텔레메트리를 전송하려면 셸에서 다음 환경 변수를 설정해야 합니다.

<Tabs groupId="service-type">
<TabItem value="clickstack-managed" label="관리형 ClickStack" default>

```shell
export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-otel-collector:4318 \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_LOGS_EXPORTER=otlp \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

</TabItem>

<TabItem value="clickstack-oss" label="ClickStack 오픈 소스" >

```shell
export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-otel-collector:4318 \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>' \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_LOGS_EXPORTER=otlp \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

</TabItem>
</Tabs>

_`OTEL_SERVICE_NAME` 환경 변수는 HyperDX 앱에서 서비스를 식별하는 데 사용되며, 원하는 이름을 자유롭게 지정할 수 있습니다._

`OTEL_EXPORTER_OTLP_HEADERS` 환경 변수에는 HyperDX 앱의 `Team Settings → API Keys`에서 확인할 수 있는 API Key가 포함됩니다.

### OpenTelemetry Java 에이전트를 사용하여 애플리케이션 실행하기 \{#run-the-application-with-otel-java-agent\}

```shell
java -jar target/<APPLICATION_JAR_FILE>
```

<br />

Java OpenTelemetry 계측에 대한 자세한 내용은 다음 문서를 참고하십시오: [https://opentelemetry.io/docs/instrumentation/java/](https://opentelemetry.io/docs/instrumentation/java/)

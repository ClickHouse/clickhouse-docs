---
'slug': '/use-cases/observability/clickstack/sdks/java'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 3
'description': 'Java SDK for ClickStack - ClickHouse 관찰 가능성 스택'
'title': 'Java'
'doc_type': 'guide'
'keywords':
- 'Java SDK ClickStack'
- 'Java OpenTelemetry ClickStack'
- 'Java observability SDK'
- 'ClickStack Java integration'
- 'Java application monitoring'
---

ClickStack은 텔레메트리 데이터(로그 및 트레이스)를 수집하기 위해 OpenTelemetry 표준을 사용합니다. 트레이스는 자동 계측으로 자동 생성되므로, 트레이싱의 가치를 얻기 위해 수동 계측이 필요하지 않습니다.

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

## 시작하기 {#getting-started}

:::note
현재 통합은 오직 **Java 8+**와 호환됩니다.
:::

### OpenTelemetry Java 에이전트 다운로드 {#download-opentelemtry-java-agent}

[`opentelemetry-javaagent.jar`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar)를 다운로드하고 선호하는 디렉터리에 JAR 파일을 배치하십시오. JAR 파일에는 에이전트와 계측 라이브러리가 포함되어 있습니다. 다음 명령어를 사용하여 에이전트를 다운로드할 수도 있습니다:

```shell
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
```

### 환경 변수 구성 {#configure-environment-variables}

그 후, ClickStack으로 텔레메트리를 전송하기 위해 셸에서 다음 환경 변수를 구성해야 합니다:

```shell
export JAVA_TOOL_OPTIONS="-javaagent:PATH/TO/opentelemetry-javaagent.jar" \
OTEL_EXPORTER_OTLP_ENDPOINT=https://localhost:4318 \
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>' \
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf \
OTEL_LOGS_EXPORTER=otlp \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

_`OTEL_SERVICE_NAME` 환경 변수는 HyperDX 앱에서 서비스를 식별하는 데 사용되며, 원하시는 이름으로 설정할 수 있습니다._

`OTEL_EXPORTER_OTLP_HEADERS` 환경 변수는 `Team Settings → API Keys`에서 HyperDX 앱을 통해 제공되는 API 키를 포함합니다.

### OpenTelemetry Java 에이전트로 애플리케이션 실행 {#run-the-application-with-otel-java-agent}

```shell
java -jar target/<APPLICATION_JAR_FILE>
```
<br/>
자세한 Java OpenTelemetry 계측 정보는 여기에서 확인하세요: [https://opentelemetry.io/docs/instrumentation/java/](https://opentelemetry.io/docs/instrumentation/java/)

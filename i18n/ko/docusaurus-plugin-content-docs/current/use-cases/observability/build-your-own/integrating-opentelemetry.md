---
'title': 'OpenTelemetry 통합'
'description': 'OpenTelemetry와 ClickHouse의 관찰 가능성 통합'
'slug': '/observability/integrating-opentelemetry'
'keywords':
- 'Observability'
- 'OpenTelemetry'
'show_related_blogs': true
'doc_type': 'guide'
---

import observability_3 from '@site/static/images/use-cases/observability/observability-3.png';
import observability_4 from '@site/static/images/use-cases/observability/observability-4.png';
import observability_5 from '@site/static/images/use-cases/observability/observability-5.png';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_7 from '@site/static/images/use-cases/observability/observability-7.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import observability_9 from '@site/static/images/use-cases/observability/observability-9.png';
import Image from '@theme/IdealImage';



# OpenTelemetry 통합을 통한 데이터 수집

모든 관측 가능성 솔루션은 로그와 추적을 수집하고 내보낼 수 있는 수단이 필요합니다. 이를 위해 ClickHouse는 [OpenTelemetry (OTel) 프로젝트](https://opentelemetry.io/)를 권장합니다.

"OpenTelemetry는 쿼리, 메트릭 및 로그와 같은 원거리 데이터를 생성하고 관리하기 위해 설계된 관측 가능성 프레임워크 및 도구 모음입니다."

ClickHouse나 Prometheus와는 달리 OpenTelemetry는 관측 가능성 백엔드가 아니며, 원거리 데이터의 생성, 수집, 관리 및 내보내기에 중점을 두고 있습니다. OpenTelemetry의 초기 목표는 사용자가 언어별 SDK를 사용하여 애플리케이션이나 시스템을 쉽게 계측할 수 있도록 하는 것이었지만, OpenTelemetry 수집기를 통해 로그 수집을 포함하도록 확장되었습니다. 수집기는 원거리 데이터를 수신, 처리 및 내보내는 에이전트 또는 프록시입니다.
## ClickHouse 관련 구성 요소 {#clickhouse-relevant-components}

OpenTelemetry는 여러 구성 요소로 구성되어 있습니다. 데이터 및 API 사양, 표준화된 프로토콜, 필드/컬럼의 명명 규칙을 제공할 수 있을 뿐만 아니라, OTel은 ClickHouse와 함께 관측 가능한 솔루션을 구축하는 데 있어 근본적으로 중요한 두 가지 기능을 제공합니다.

- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)는 원거리 데이터를 수신, 처리 및 내보내는 프록시입니다. ClickHouse 기반 솔루션은 이 구성 요소를 로그 수집 및 이벤트 처리를 위해 사용하여 배치 및 삽입 전에 사용합니다.
- [언어 SDK](https://opentelemetry.io/docs/languages/)는 사양, API 및 원거리 데이터 내보내기를 구현합니다. 이러한 SDK는 애플리케이션 코드 내에서 트레이트가 올바르게 기록되도록 하고, 구성 요소 스팬을 생성하며 메타데이터를 통해 서비스 간에 컨텍스트가 전파되도록 보장함으로써 분산 추적을 형성하고 스팬을 상관관계할 수 있도록 합니다. 이러한 SDK는 공통 라이브러리 및 프레임 워크를 자동으로 구현하는 생태계로 보완되어 코드를 변경할 필요 없이 기본 제공 계측을 얻을 수 있습니다.

ClickHouse 기반 관측 가능성 솔루션은 이 두 가지 도구를 모두 활용합니다.
## 배포판 {#distributions}

OpenTelemetry 수집기는 [여러 배포판](https://github.com/open-telemetry/opentelemetry-collector-releases?tab=readme-ov-file)을 가지고 있습니다. ClickHouse 솔루션에 필요한 filelog 수신기와 ClickHouse 내보내기는 [OpenTelemetry Collector Contrib Distro](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)에서만 제공됩니다.

이 배포판은 많은 구성 요소를 포함하고 있으며 사용자가 다양한 구성을 실험할 수 있도록 합니다. 그러나 프로덕션 환경에서 실행할 때는 환경에 필요한 구성 요소만 포함하도록 수집기를 제한하는 것이 좋습니다. 다음은 이를 수행할 몇 가지 이유입니다:

- 수집기의 크기를 줄여 배포 시간을 단축합니다.
- 사용 가능한 공격 면적을 줄여 수집기의 보안을 향상시킵니다.

[커스텀 수집기](https://opentelemetry.io/docs/collector/custom-collector/)를 구축하려면 [OpenTelemetry Collector Builder](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder)를 사용할 수 있습니다.
## OTel로 데이터 수집하기 {#ingesting-data-with-otel}
### 수집기 배포 역할 {#collector-deployment-roles}

로그를 수집하고 ClickHouse에 삽입하려면 OpenTelemetry Collector를 사용하는 것을 권장합니다. OpenTelemetry Collector는 두 가지 주요 역할로 배포될 수 있습니다:

- **에이전트** - 에이전트 인스턴스는 엣지에서 데이터 수집을 수행하며, 예를 들어 서버나 Kubernetes 노드에서 실행되거나 OpenTelemetry SDK로 계측된 애플리케이션으로부터 직접 이벤트를 수신합니다. 후자의 경우, 에이전트 인스턴스는 애플리케이션과 함께 또는 애플리케이션과 동일한 호스트에서 실행됩니다(예: 사이드카 또는 DaemonSet). 에이전트는 데이터를 ClickHouse에 직접 보내거나 게이트웨이 인스턴스에 보낼 수 있습니다. 전자의 경우, 이를 [에이전트 배포 패턴](https://opentelemetry.io/docs/collector/deployment/agent/)이라고 합니다.
- **게이트웨이**  - 게이트웨이 인스턴스는 독립형 서비스(예: Kubernetes의 배포)를 제공합니다. 일반적으로 클러스터별, 데이터 센터별 또는 지역별로 배포됩니다. 이들은 하나의 OTLP 엔드포인트를 통해 애플리케이션(또는 에이전트로서 다른 수집기)으로부터 이벤트를 수신합니다. 일반적으로 몇 개의 게이트웨이 인스턴스가 배포되며, 이들 사이의 부하를 분산시키기 위해 기본 제공 부하 분산기가 사용됩니다. 모든 에이전트 및 애플리케이션이 이 단일 엔드포인트로 신호를 보낼 경우, 이를 [게이트웨이 배포 패턴](https://opentelemetry.io/docs/collector/deployment/gateway/)이라고 합니다.

아래에서는 ClickHouse에 직접 이벤트를 보내는 간단한 에이전트 수집기를 가정합니다. 게이트웨이 사용 및 적용 가능성에 대한 자세한 내용은 [게이트웨이와의 스케일링](#scaling-with-gateways)을 참조하십시오.
### 로그 수집하기 {#collecting-logs}

수집기를 사용하는 주요 장점은 서비스가 데이터를 신속하게 오프로드할 수 있도록 하여 추가 처리를 수집기가 처리하도록 할 수 있다는 점입니다. 여기에는 재시도, 배치, 암호화 또는 민감한 데이터 필터링 등이 포함됩니다.

수집기는 세 가지 주요 처리 단계에 대해 [수신기](https://opentelemetry.io/docs/collector/configuration/#receivers), [프로세서](https://opentelemetry.io/docs/collector/configuration/#processors) 및 [내보내기](https://opentelemetry.io/docs/collector/configuration/#exporters)라는 용어를 사용합니다. 수신기는 데이터 수집에 사용되며 풀 또는 푸시 기반일 수 있습니다. 프로세서는 메시지의 변환 및 보강 기능을 제공합니다. 내보내기는 데이터를 하류 서비스로 전송할 책임이 있습니다. 이 서비스는 이론적으로 다른 수집기가 될 수 있지만, 아래의 초기 논의에서는 모든 데이터가 ClickHouse로 직접 전송된다고 가정합니다.

<Image img={observability_3} alt="로그 수집" size="md"/>

사용자는 수신기, 프로세서 및 내보내기 세트를 숙지하는 것이 좋습니다.

수집기는 로그 수집을 위한 두 가지 주요 수신기를 제공합니다:

**OTLP를 통한 수집** - 이 경우, 로그는 OpenTelemetry SDK로부터 OTLP 프로토콜을 통해 수집기로 직접 보내집니다. [OpenTelemetry 데모](https://opentelemetry.io/docs/demo/)는 이 접근 방식을 사용하며, 각 언어의 OTLP 내보내기는 로컬 수집기 엔드포인트를 가정합니다. 수집기는 이 경우 OTLP 수신기로 구성되어야 합니다 — [구성에 대한 데모](https://github.com/ClickHouse/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config.yml#L5-L12)를 참조하십시오. 이 접근 방식의 장점은 로그 데이터에 자동으로 Trace Id가 포함되므로 사용자가 특정 로그에 대한 트레이스를 나중에 식별할 수 있도록 한다는 것입니다.

<Image img={observability_4} alt="OTLP를 통한 로그 수집" size="md"/>

이 접근 방식은 사용자가 [적절한 언어 SDK](https://opentelemetry.io/docs/languages/)로 코드를 계측해야 합니다.

- **Filelog 수신기를 통한 스크래핑** - 이 수신기는 디스크의 파일을 추적하고 로그 메시지를 형성하여 ClickHouse에 전송합니다. 이 수신기는 다중 행 메시지 감지, 로그 롤오버 처리, 강력성을 위한 체크포인팅 및 구조 추출과 같은 복잡한 작업을 처리합니다. 이 수신기는 또한 Docker 및 Kubernetes 컨테이너 로그를 추적할 수 있으며 헬름 차트로 배포 가능하며, [이로부터 구조를 추출](https://opentelemetry.io/blog/2024/otel-collector-container-log-parser/)하고 포드 세부 정보로 풍부하게 할 수 있습니다.

<Image img={observability_5} alt="File log receiver" size="md"/>

**대부분의 배포에서는 위 수신기를 조합하여 사용할 것입니다. 사용자는 [수집기 문서](https://opentelemetry.io/docs/collector/)를 읽고 기본 개념을 숙지하며, [구성 구조](https://opentelemetry.io/docs/collector/configuration/) 및 [설치 방법](https://opentelemetry.io/docs/collector/installation/)에 익숙해지는 것을 권장합니다.**

:::note 팁: `otelbin.io`
[`otelbin.io`](https://www.otelbin.io/)는 구성을 검증하고 시각화하는 데 유용합니다.
:::
## 구조화된 로그 vs 비구조화된 로그 {#structured-vs-unstructured}

로그는 구조화되거나 비구조화될 수 있습니다.

구조화된 로그는 JSON과 같은 데이터 형식을 사용하며, http 코드 및 원본 IP 주소와 같은 메타데이터 필드를 정의합니다.

```json
{
    "remote_addr":"54.36.149.41",
    "remote_user":"-","run_time":"0","time_local":"2019-01-22 00:26:14.000","request_type":"GET",
    "request_path":"\/filter\/27|13 ,27|  5 ,p53","request_protocol":"HTTP\/1.1",
    "status":"200",
    "size":"30577",
    "referer":"-",
    "user_agent":"Mozilla\/5.0 (compatible; AhrefsBot\/6.1; +http:\/\/ahrefs.com\/robot\/)"
}
```

비구조화된 로그는 일반적으로 정규 표현식 패턴을 통해 추출할 수 있는 고유한 구조를 가지면서도 로그를 순수하게 문자열로 표현합니다.

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

가능한 경우, 사용자가 구조화된 로그를 사용하고 JSON(예: ndjson)으로 기록하는 것을 권장합니다. 이렇게 하면 나중에 ClickHouse로 전송하기 전에 [수집기 프로세서](https://opentelemetry.io/docs/collector/configuration/#processors)를 사용하여 로그를 처리하거나 삽입 시간에 물리화된 뷰를 사용할 때 로그 처리가 단순화됩니다. 구조화된 로그는 궁극적으로 나중에 처리 리소스를 절약하며, ClickHouse 솔루션에서 필요한 CPU를 감소시킬 수 있습니다.
### 예제 {#example}

예를 들어, 약 10m 행을 가진 구조화된(JSON) 및 비구조화된 로그 데이터 세트를 제공하며, 이는 다음 링크에서 사용할 수 있습니다:

- [비구조화된](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)
- [구조화된](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)

아래 예제를 위해 구조화된 데이터 세트를 사용합니다. 아래 예제를 재현하려면 이 파일을 다운로드하고 추출해야 합니다.

아래는 filelog 수신기를 사용하여 디스크의 이러한 파일을 읽고 결과 메시지를 stdout으로 출력하는 OTel Collector에 대한 간단한 구성입니다. 우리의 로그가 구조화되어 있으므로 [`json_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/json_parser.md) 연산자를 사용합니다. access-structured.log 파일의 경로를 수정해야 합니다.

:::note ClickHouse를 통한 파싱 고려
아래 예제는 로그에서 타임스탬프를 추출합니다. 이는 전체 로그 라인을 JSON 문자열로 변환하여 `LogAttributes`에 결과를 배치하는 `json_parser` 연산자의 사용을 요구합니다. 이는 계산적으로 비싼 작업이며 [ClickHouse에서 더 효율적으로 수행할 수 있습니다](https://clickhouse.com/blog/worlds-fastest-json-querying-tool-clickhouse-local) - [SQL로 구조 추출](/use-cases/observability/schema-design#extracting-structure-with-sql). 이 목표에 도달하기 위해 [`regex_parser`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/regex_parser.md)를 사용하는 비구조화된 예제는 [여기](https://pastila.nl/?01da7ee2/2ffd3ba8124a7d6e4ddf39422ad5b863#swBkiAXvGP7mRPgbuzzHFA==)에서 찾을 수 있습니다.
:::

**[config-structured-logs.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N*N*Nprocessors%3A*N__batch%3A*N____timeout%3A_5s*N____send*_batch*_size%3A_1*N*N*Nexporters%3A*N_logging%3A*N___loglevel%3A_debug*N*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Blogging%5D%7E)**

```yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
processors:
  batch:
    timeout: 5s
    send_batch_size: 1
exporters:
  logging:
    loglevel: debug
service:
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [logging]
```

사용자는 [공식 지침](https://opentelemetry.io/docs/collector/installation/)을 따라 수집기를 로컬에 설치할 수 있습니다. 중요한 점은 지침을 [contrib 배포](https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions/otelcol-contrib)를 사용하도록 수정해야 한다는 것입니다(여기에는 `filelog` 수신기가 포함되어 있습니다). 예를 들어 `otelcol_0.102.1_darwin_arm64.tar.gz` 대신 사용자는 `otelcol-contrib_0.102.1_darwin_arm64.tar.gz`를 다운로드해야 합니다. 릴리스는 [여기](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)에서 확인할 수 있습니다.

설치가 완료되면 OTel Collector는 다음 명령으로 실행할 수 있습니다:

```bash
./otelcol-contrib --config config-logs.yaml
```

구조화된 로그를 사용하는 경우 출력에서 메시지는 다음과 같은 형식을 가집니다:

```response
LogRecord #98
ObservedTimestamp: 2024-06-19 13:21:16.414259 +0000 UTC
Timestamp: 2019-01-22 01:12:53 +0000 UTC
SeverityText:
SeverityNumber: Unspecified(0)
Body: Str({"remote_addr":"66.249.66.195","remote_user":"-","run_time":"0","time_local":"2019-01-22 01:12:53.000","request_type":"GET","request_path":"\/product\/7564","request_protocol":"HTTP\/1.1","status":"301","size":"178","referer":"-","user_agent":"Mozilla\/5.0 (Linux; Android 6.0.1; Nexus 5X Build\/MMB29P) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/41.0.2272.96 Mobile Safari\/537.36 (compatible; Googlebot\/2.1; +http:\/\/www.google.com\/bot.html)"})
Attributes:
        -> remote_user: Str(-)
        -> request_protocol: Str(HTTP/1.1)
        -> time_local: Str(2019-01-22 01:12:53.000)
        -> user_agent: Str(Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.96 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html))
        -> log.file.name: Str(access.log)
        -> status: Str(301)
        -> size: Str(178)
        -> referer: Str(-)
        -> remote_addr: Str(66.249.66.195)
        -> request_type: Str(GET)
        -> request_path: Str(/product/7564)
        -> run_time: Str(0)
Trace ID:
Span ID:
Flags: 0
```

위 는 OTel 수집기에서 생성한 단일 로그 메시지를 나타냅니다. 후속 섹션에서 동일한 메시지를 ClickHouse로 수집합니다.

로그 메시지의 전체 스키마는 다른 수신기를 사용할 경우 존재할 수 있는 추가 열과 함께 [여기](https://opentelemetry.io/docs/specs/otel/logs/data-model/)에서 유지됩니다. **사용자가 이 스키마에 익숙해지는 것을 강력히 권장합니다.**

여기서 중요한 점은 로그 라인 자체가 `Body` 필드 내에서 문자열로 보관되지만, JSON은 `json_parser` 덕분에 속성 필드에 자동으로 추출된다는 것입니다. 동일한 [연산자](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md#what-operators-are-available)를 사용하여 타임스탬프를 적절한 `Timestamp` 열로 추출했습니다. OTel로 로그를 처리하는 것에 대한 권장 사항은 [처리](#processing---filtering-transforming-and-enriching)를 참조하십시오.

:::note 연산자
연산자는 로그 처리의 가장 기본 단위입니다. 각 연산자는 파일에서 행을 읽거나 필드에서 JSON을 구문 분석하는 등의 단일 책임을 수행합니다. 연산자는 원하는 결과를 얻기 위해 파이프라인에 연결됩니다.
:::

위 메시지에는 `TraceID` 또는 `SpanID` 필드가 없습니다. 사용자들이 [분산 추적](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces)을 구현하는 경우와 같이 이러한 필드가 존재할 경우, 위에서 보인 기술을 사용하여 JSON에서 추출할 수 있습니다.

로컬 또는 Kubernetes 로그 파일을 수집해야 하는 사용자에게는 [filelog 수신기](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/filelogreceiver/README.md#configuration)에서 사용할 수 있는 구성 옵션과 [오프셋](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#offset-tracking) 및 [다중행 로그 파싱 처리 방법](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver#example---multiline-logs-parsing)에 익숙해지는 것을 권장합니다.
## Kubernetes 로그 수집하기 {#collecting-kubernetes-logs}

Kubernetes 로그를 수집하기 위해서는 [OpenTelemetry 문서 가이드](https://opentelemetry.io/docs/kubernetes/)를 권장합니다. 로그와 메트릭에 포드 메타데이터를 풍부하게 하기 위해 [Kubernetes 속성 프로세서](https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor)를 사용하는 것이 좋습니다. 이는 잠재적으로 동적 메타데이터(예: 레이블)를 생성할 수 있으며, 이는 `ResourceAttributes` 열에 저장됩니다. ClickHouse는 현재 이 열에 대해 `Map(String, String)` 유형을 사용합니다. 이 유형의 처리 및 최적화에 대한 자세한 내용은 [맵 사용하기](/use-cases/observability/schema-design#using-maps) 및 [맵에서 추출하기](/use-cases/observability/schema-design#extracting-from-maps)를 참조하십시오.
## 추적 수집하기 {#collecting-traces}

코드를 계측하고 추적을 수집하려는 사용자에게는 공식 [OTel 문서](https://opentelemetry.io/docs/languages/)를 따르도록 권장합니다.

ClickHouse에 이벤트를 전달하려면 사용자는 적절한 수신기를 통해 OTLP 프로토콜로 추적 이벤트를 수신할 OTel 수집기를 배포해야 합니다. OpenTelemetry 데모는 [각 언어를 계측하는 예제](https://opentelemetry.io/docs/demo/)를 제공하며, 수집기에 이벤트를 전송합니다. 이벤트를 stdout으로 출력하는 적절한 수집기 구성의 예는 아래와 같습니다:
### 예제 {#example-1}

추적은 OTLP를 통해 수신해야 하므로 [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) 도구를 사용하여 추적 데이터를 생성합니다. 설치 지침은 [여기](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)를 따르십시오.

아래 구성은 OTLP 수신기에서 추적 이벤트를 수신한 후 stdout으로 전송합니다.

[config-traces.xml](https://www.otelbin.io/#config=receivers%3A*N_otlp%3A*N___protocols%3A*N_____grpc%3A*N_______endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N_batch%3A*N__timeout%3A_1s*N*Nexporters%3A*N_logging%3A*N___loglevel%3A_debug*N*N*Nservice%3A*N_pipelines%3A*N__traces%3A*N____receivers%3A_%5Botlp%5D*N____processors%3A_%5Bbatch%5D*N____exporters%3A_%5Blogging%5D%7E)

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
processors:
  batch:
    timeout: 1s
exporters:
  logging:
    loglevel: debug
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [logging]
```

이 구성을 다음과 같이 실행하십시오:

```bash
./otelcol-contrib --config config-traces.yaml
```

`telemetrygen`을 사용하여 수집기에 추적 이벤트를 전송합니다:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

이는 아래 예제와 유사한 추적 메시지를 stdout으로 출력합니다:

```response
Span #86
        Trace ID        : 1bb5cdd2c9df5f0da320ca22045c60d9
        Parent ID       : ce129e5c2dd51378
        ID              : fbb14077b5e149a0
        Name            : okey-dokey-0
        Kind            : Server
        Start time      : 2024-06-19 18:03:41.603868 +0000 UTC
        End time        : 2024-06-19 18:03:41.603991 +0000 UTC
        Status code     : Unset
        Status message :
Attributes:
        -> net.peer.ip: Str(1.2.3.4)
        -> peer.service: Str(telemetrygen-client)
```

위 내용은 OTel 수집기에서 생성한 단일 추적 메시지를 나타냅니다. 후속 섹션에서 동일한 메시지를 ClickHouse로 수집합니다.

추적 메시지의 전체 스키마는 [여기](https://opentelemetry.io/docs/concepts/signals/traces/)에서 유지됩니다. 사용자가 이 스키마에 익숙해지는 것을 강력히 권장합니다.
## 처리 - 필터링, 변환 및 보강 {#processing---filtering-transforming-and-enriching}

앞서 로그 이벤트의 타임스탬프를 설정하는 예제에서 설명한 바와 같이, 사용자는 이벤트 메시지를 필터링하고, 변환하고, 보강하고자 할 것입니다. 이는 OpenTelemetry의 여러 기능을 사용하여 수행할 수 있습니다:

- **프로세서** - 프로세서는 [수신기가 수집한 데이터를 수정하거나 변환](https://opentelemetry.io/docs/collector/transforming-telemetry/)하여 내보내기 전 재전송합니다. 프로세서는 수집기 구성의 `processors` 섹션에서 구성된 순서대로 적용됩니다. 이는 선택적이지만 최소 세트는 [일반적으로 권장됩니다](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors). ClickHouse와 함께 OTel 수집기를 사용할 때는 프로세서를 다음과 같이 제한하는 것이 좋습니다:

  - [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md)를 사용하여 수집기에서의 메모리 부족 상황을 방지합니다. [자원 추정](#estimating-resources)에 대한 권장 사항을 참조하십시오.
  - 컨텍스트 기반으로 보강하는 프로세서. 예를 들어, [Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)는 스팬, 메트릭 및 로그 리소스 속성을 k8s 메타데이터로 자동으로 설정할 수 있도록 합니다. 여기에는 이벤트의 출처 포드 ID로 풍부하게 만들 수 있습니다.
  - 필요할 경우 추적을 위한 [테일 또는 헤드 샘플링](https://opentelemetry.io/docs/concepts/sampling/)이 필요합니다.
  - [기본 필터링](https://opentelemetry.io/docs/collector/transforming-telemetry/) - 필요하지 않은 이벤트를 드롭합니다. 이것이 가능한 경우에는 연산자(아래 참조)를 통해 수행해야 합니다.
  - [배치 처리](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - ClickHouse와 함께 작업할 때 이벤트가 배치로 전송되도록 보장합니다. ["ClickHouse로 내보내기"](//#exporting-to-clickhouse)를 참조하십시오.

- **연산자** - [연산자](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)는 수신기에서 사용할 수 있는 가장 기본적인 처리 단위를 제공합니다. 날짜 및 타임스탬프와 같은 필드를 설정할 수 있는 기본 파싱이 지원됩니다. JSON 및 정규 표현식 파싱이 지원되며, 이벤트 필터링 및 기본 변환도 가능합니다. 여기서 이벤트 필터링을 수행하는 것을 권장합니다.

사용자는 연산자나 [변환 프로세서](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md)를 사용하여 과도한 이벤트 처리를 피하는 것이 좋습니다. 이는 상당한 메모리 및 CPU 오버헤드를 초래할 수 있으며, 특히 JSON 파싱에서 더욱 그렇습니다. 삽입 시 ClickHouse에서 물리화된 뷰와 열을 사용하여 모든 처리가 가능하며, 일부 예외가 있습니다. 특히, k8s 메타데이터 추가와 같은 문맥 인식 보강이 그 예입니다. 더 자세한 사항은 [SQL로 구조 추출](/use-cases/observability/schema-design#extracting-structure-with-sql)을 참조하십시오.

프로세싱이 OTel 수집기를 사용하여 수행되는 경우 게이트웨이 인스턴스에서 변환을 수행하고 에이전트 인스턴스의 작업량을 최소화하는 것이 좋습니다. 이는 서버에서 실행되는 엣지의 에이전트에 필요한 리소스가 최소화되도록 보장합니다. 일반적으로 사용자는 필터링(불필요한 네트워크 사용을 최소화하기 위해), 타임스탬프 설정(연산자를 통해) 및 컨텍스트가 필요한 보강만 수행합니다. 예를 들어, 게이트웨이 인스턴스가 다른 Kubernetes 클러스터에 있는 경우, k8s 보강은 에이전트에서 발생해야 합니다.
### 예제 {#example-2}

다음 구성은 비구조화된 로그 파일을 수집하는 예시입니다. 연산자를 사용하여 로그 라인에서 구조를 추출하고(`regex_parser`) 이벤트를 필터링하며, 이벤트를 배치하고 메모리 사용량을 제한하는 프로세서를 사용합니다.

[config-unstructured-logs-with-processor.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-unstructured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_regex*_parser*N_______regex%3A_*%22%5E*C*QP*Lip*G%5B*Bd.%5D*P*D*Bs*P-*Bs*P-*Bs*P*B%5B*C*QP*Ltimestamp*G%5B%5E*B%5D%5D*P*D*B%5D*Bs*P%22*C*QP*Lmethod*G%5BA-Z%5D*P*D*Bs*P*C*QP*Lurl*G%5B%5E*Bs%5D*P*D*Bs*PHTTP%2F%5B%5E*Bs%5D*P%22*Bs*P*C*QP*Lstatus*G*Bd*P*D*Bs*P*C*QP*Lsize*G*Bd*P*D*Bs*P%22*C*QP*Lreferrer*G%5B%5E%22%5D***D%22*Bs*P%22*C*QP*Luser*_agent*G%5B%5E%22%5D***D%22*%22*N_______timestamp%3A*N_________parse*_from%3A_attributes.timestamp*N_________layout%3A_*%22*.d%2F*.b%2F*.Y%3A*.H%3A*.M%3A*.S_*.z*%22*N_________*H22%2FJan%2F2019%3A03%3A56%3A14_*P0330*N*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_1s*N___send*_batch*_size%3A_100*N_memory*_limiter%3A*N___check*_interval%3A_1s*N___limit*_mib%3A_2048*N___spike*_limit*_mib%3A_256*N*N*Nexporters%3A*N_logging%3A*N___loglevel%3A_debug*N*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%2C_memory*_limiter%5D*N_____exporters%3A_%5Blogging%5D%7E)

```yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-unstructured.log
    start_at: beginning
    operators:
      - type: regex_parser
        regex: '^(?P<ip>[\d.]+)\s+-\s+-\s+\[(?P<timestamp>[^\]]+)\]\s+"(?P<method>[A-Z]+)\s+(?P<url>[^\s]+)\s+HTTP/[^\s]+"\s+(?P<status>\d+)\s+(?P<size>\d+)\s+"(?P<referrer>[^"]*)"\s+"(?P<user_agent>[^"]*)"'
        timestamp:
          parse_from: attributes.timestamp
          layout: '%d/%b/%Y:%H:%M:%S %z'
          #22/Jan/2019:03:56:14 +0330
processors:
  batch:
    timeout: 1s
    send_batch_size: 100
  memory_limiter:
    check_interval: 1s
    limit_mib: 2048
    spike_limit_mib: 256
exporters:
  logging:
    loglevel: debug
service:
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch, memory_limiter]
      exporters: [logging]
```

```bash
./otelcol-contrib --config config-unstructured-logs-with-processor.yaml
```
## ClickHouse로 내보내기 {#exporting-to-clickhouse}

내보내기는 데이터를 하나 이상의 백엔드 또는 목적지로 전송합니다. 내보내기는 풀 또는 푸시 기반일 수 있습니다. ClickHouse에 이벤트를 전송하기 위해서는 사용자가 푸시 기반 [ClickHouse 내보내기](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md)를 사용해야 합니다.

:::note OpenTelemetry Collector Contrib 사용
ClickHouse 내보내기는 [OpenTelemetry Collector Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main)의 일부로, 코어 배포판이 아닙니다. 사용자는 contrib 배포판을 사용하거나 [자체 수집기를 구축할 수 있습니다](https://opentelemetry.io/docs/collector/custom-collector/).
:::

전체 구성 파일은 아래와 같습니다.

[clickhouse-config.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N_otlp%3A*N____protocols%3A*N______grpc%3A*N________endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_5s*N___send*_batch*_size%3A_5000*N*Nexporters%3A*N_clickhouse%3A*N___endpoint%3A_tcp%3A%2F%2Flocalhost%3A9000*Qdial*_timeout*E10s*Acompress*Elz4*Aasync*_insert*E1*N___*H_ttl%3A_72h*N___traces*_table*_name%3A_otel*_traces*N___logs*_table*_name%3A_otel*_logs*N___create*_schema%3A_true*N___timeout%3A_5s*N___database%3A_default*N___sending*_queue%3A*N_____queue*_size%3A_1000*N___retry*_on*_failure%3A*N_____enabled%3A_true*N_____initial*_interval%3A_5s*N_____max*_interval%3A_30s*N_____max*_elapsed*_time%3A_300s*N*Nservice%3A*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Bclickhouse%5D*N___traces%3A*N____receivers%3A_%5Botlp%5D*N____processors%3A_%5Bbatch%5D*N____exporters%3A_%5Bclickhouse%5D%7E&distro=otelcol-contrib%7E&distroVersion=v0.103.1%7E)

```yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
processors:
  batch:
    timeout: 5s
    send_batch_size: 5000
exporters:
  clickhouse:
    endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
    # ttl: 72h
    traces_table_name: otel_traces
    logs_table_name: otel_logs
    create_schema: true
    timeout: 5s
    database: default
    sending_queue:
      queue_size: 1000
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s

service:
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [clickhouse]
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [clickhouse]
```

다음의 주요 설정 사항에 유의하세요:

- **파이프라인** - 위 구성은 [파이프라인](https://opentelemetry.io/docs/collector/configuration/#pipelines)의 사용을 강조합니다. 여기에는 로그 및 추적 각각을 위한 수신기, 프로세서 및 내보내기로 구성됩니다.
- **endpoint** - ClickHouse와의 통신은 `endpoint` 매개변수를 통해 구성됩니다. 연결 문자열 `tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1`은 TCP를 통한 통신을 발생시킵니다. 사용자들이 통신 전환으로 인해 HTTP를 선호하는 경우, 이러한 연결 문자열을 [여기](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)에 설명된 대로 수정하십시오. 사용자 이름과 비밀번호를 이 연결 문자열 내에서 지정할 수 있는 전체 연결 세부정보는 [여기](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)에 설명되어 있습니다.

**중요:** 위의 연결 문자열은 압축(lz4)과 비동기 삽입을 모두 활성화합니다. 둘 다 항상 활성화하는 것을 권장합니다. 비동기 삽입에 대한 더 자세한 설명은 [배치 처리](#batching)를 참조하십시오. 압축은 항상 지정해야 하며, 구식 버전의 내보내기에서는 기본적으로 활성화되지 않습니다.

- **ttl** - 여기서의 값은 데이터가 유지되는 시간을 결정합니다. "데이터 관리"에서 더 많은 세부정보를 확인하십시오. 이는 시간 단위로 지정되어야 하며 예: 72h로 설정해야 합니다. 예제에서는 데이터가 2019년의 것이고 ClickHouse에 의해 즉시 삭제되므로 TTL을 비활성화합니다.
- **traces_table_name** 및 **logs_table_name** - 로그 및 추적 테이블의 이름을 결정합니다.
- **create_schema** - 시작 시 기본 스키마로 테이블이 생성될지 여부를 결정합니다. 시작을 위해 기본값은 true입니다. 사용자는 false로 설정하고 자신의 스키마를 정의해야 합니다.
- **database** - 대상 데이터베이스입니다.
- **retry_on_failure** - 실패한 배치가 재시도되는지 여부를 결정하는 설정입니다.
- **batch** - 배치 프로세서는 이벤트가 배치로 전송되도록 보장합니다. 우리는 약 5000의 값을 추천하며, 타임아웃은 5s입니다. 이 중 먼저 도달하는 값이 내보내기로 플러시하는 배치를 시작합니다. 이러한 값을 낮추면 지연이 적은 파이프라인이 생성되어 데이터가 더 빨리 쿼리 가능한 상태가 되지만, ClickHouse에 대한 더 많은 연결과 배치가 전송됩니다. 사용자가 [비동기 삽입](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)을 사용하지 않는 경우 이를 권장하지 않습니다 . 이것은 ClickHouse에서 [파트가 너무 많음](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#1-too-many-parts) 문제를 일으킬 수 있습니다. 반대로 사용자가 비동기 삽입을 사용하는 경우 비동기 삽입 설정에 따라 데이터 쿼리 가능성도 달라질 것입니다 - 그러나 데이터가 먼저 커넥터에서 플러시됩니다. 더 많은 세부사항은 [배치 처리](#batching)를 참조하십시오.
- **sending_queue** - 전송 큐의 크기를 제어합니다. 큐의 각 항목은 배치를 포함합니다. 이 큐가 초과된 경우(예: ClickHouse에 접근할 수 없지만 이벤트가 계속 도착할 경우), 배치는 드롭됩니다.

사용자가 구조화된 로그 파일을 추출하였고 [ClickHouse의 로컬 인스턴스](/install)가 실행 중(기본 인증으로)이라고 가정하면, 사용자는 다음 명령으로 이 구성을 실행할 수 있습니다:

```bash
./otelcol-contrib --config clickhouse-config.yaml
```

추적 데이터를 이 수집기에 전송하려면, `telemetrygen` 도구를 사용하여 다음 명령을 실행하십시오:

```bash
$GOBIN/telemetrygen traces --otlp-insecure --traces 300
```

실행 중일 때 단순한 쿼리를 사용하여 로그 이벤트가 있는지 확인합니다:

```sql
SELECT *
FROM otel_logs
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp:              2019-01-22 06:46:14.000000000
TraceId:
SpanId:
TraceFlags:             0
SeverityText:
SeverityNumber:         0
ServiceName:
Body:                   {"remote_addr":"109.230.70.66","remote_user":"-","run_time":"0","time_local":"2019-01-22 06:46:14.000","request_type":"GET","request_path":"\/image\/61884\/productModel\/150x150","request_protocol":"HTTP\/1.1","status":"200","size":"1684","referer":"https:\/\/www.zanbil.ir\/filter\/p3%2Cb2","user_agent":"Mozilla\/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko\/20100101 Firefox\/64.0"}
ResourceSchemaUrl:
ResourceAttributes: {}
ScopeSchemaUrl:
ScopeName:
ScopeVersion:
ScopeAttributes:        {}
LogAttributes:          {'referer':'https://www.zanbil.ir/filter/p3%2Cb2','log.file.name':'access-structured.log','run_time':'0','remote_user':'-','request_protocol':'HTTP/1.1','size':'1684','user_agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0','remote_addr':'109.230.70.66','request_path':'/image/61884/productModel/150x150','status':'200','time_local':'2019-01-22 06:46:14.000','request_type':'GET'}

1 row in set. Elapsed: 0.012 sec. Processed 5.04 thousand rows, 4.62 MB (414.14 thousand rows/s., 379.48 MB/s.)
Peak memory usage: 5.41 MiB.

Likewise, for trace events, users can check the `otel_traces` table:

SELECT *
FROM otel_traces
LIMIT 1
FORMAT Vertical

Row 1:
──────
Timestamp:              2024-06-20 11:36:41.181398000
TraceId:                00bba81fbd38a242ebb0c81a8ab85d8f
SpanId:                 beef91a2c8685ace
ParentSpanId:
TraceState:
SpanName:               lets-go
SpanKind:               SPAN_KIND_CLIENT
ServiceName:            telemetrygen
ResourceAttributes: {'service.name':'telemetrygen'}
ScopeName:              telemetrygen
ScopeVersion:
SpanAttributes:         {'peer.service':'telemetrygen-server','net.peer.ip':'1.2.3.4'}
Duration:               123000
StatusCode:             STATUS_CODE_UNSET
StatusMessage:
Events.Timestamp:   []
Events.Name:            []
Events.Attributes:  []
Links.TraceId:          []
Links.SpanId:           []
Links.TraceState:   []
Links.Attributes:   []
```

## 기본 제공 스키마 {#out-of-the-box-schema}

기본적으로 ClickHouse 내보내기는 로그 및 추적을 위한 대상 로그 테이블을 생성합니다. 이는 `create_schema` 설정을 통해 비활성화할 수 있습니다. 또한, 로그 및 추적 테이블의 이름은 위에 언급된 설정을 통해 기본값인 `otel_logs` 및 `otel_traces`에서 수정할 수 있습니다.

:::note
아래 스키마에서는 TTL이 72시간으로 설정되어 있다고 가정합니다.
:::

로그에 대한 기본 스키마는 아래에 나타나 있습니다 (`otelcol-contrib v0.102.1`):

```sql
CREATE TABLE default.otel_logs
(
    `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `TraceId` String CODEC(ZSTD(1)),
    `SpanId` String CODEC(ZSTD(1)),
    `TraceFlags` UInt32 CODEC(ZSTD(1)),
    `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
    `SeverityNumber` Int32 CODEC(ZSTD(1)),
    `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
    `Body` String CODEC(ZSTD(1)),
    `ResourceSchemaUrl` String CODEC(ZSTD(1)),
    `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `ScopeSchemaUrl` String CODEC(ZSTD(1)),
    `ScopeName` String CODEC(ZSTD(1)),
    `ScopeVersion` String CODEC(ZSTD(1)),
    `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_key mapKeys(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_value mapValues(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_log_attr_key mapKeys(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_log_attr_value mapValues(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_body Body TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(3)
SETTINGS ttl_only_drop_parts = 1
```

여기서 컬럼은 [여기](https://opentelemetry.io/docs/specs/otel/logs/data-model/) 문서화된 OTel 공식 명세의 로그와 관련이 있습니다.

이 스키마에 대한 몇 가지 중요한 사항:

- 기본적으로, 테이블은 `PARTITION BY toDate(Timestamp)`를 통해 날짜별로 파티션화됩니다. 이는 만료된 데이터를 효율적으로 삭제할 수 있게 만듭니다.
- TTL은 `TTL toDateTime(Timestamp) + toIntervalDay(3)`를 통해 설정되며, 이는 수집기 구성에서 설정된 값에 해당합니다. [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)은 포함된 모든 행이 만료되었을 때만 전체 파트가 삭제됨을 의미합니다. 이는 부분 내에서 행을 삭제하는 것보다 더 효율적이며, 삭제 비용이 많이 듭니다. 이는 항상 설정하는 것이 좋습니다. 자세한 사항은 [TTL을 통한 데이터 관리](/observability/managing-data#data-management-with-ttl-time-to-live)를 참조하세요.
- 테이블은 고전적인 [`MergeTree` 엔진](/engines/table-engines/mergetree-family/mergetree)을 사용합니다. 이는 로그 및 추적에 추천되며 변경할 필요가 없습니다.
- 테이블은 `ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)`로 정렬됩니다. 이는 쿼리를 `ServiceName`, `SeverityText`, `Timestamp`, `TraceId` 필터링에 최적화하게 만듭니다 - 리스트의 앞쪽에 있는 컬럼이 뒤쪽보다 더 빠르게 필터링됩니다. 예를 들어, `ServiceName`으로 필터링하는 것이 `TraceId`로 필터링하는 것보다 훨씬 빠릅니다. 사용자는 예상되는 접근 패턴에 따라 이 정렬을 수정해야 합니다 - [기본 키 선택](/use-cases/observability/schema-design#choosing-a-primary-ordering-key)을 참조하십시오.
- 위의 스키마는 열에 `ZSTD(1)`을 적용합니다. 이는 로그에 대해 최상의 압축을 제공합니다. 사용자는 더 나은 압축을 위해 ZSTD 압축 수준(기본값인 1 이상)을 높일 수 있지만, 이는 드물게 유익합니다. 이 값을 높이면 삽입 시 CPU 오버헤드가 커지지만, 압축 해제(및 따라서 쿼리)는 비교 가능한 상태로 유지되어야 합니다. 자세한 내용은 [여기](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)를 참조하세요. 추가적인 [델타 인코딩](/sql-reference/statements/create/table#delta)이 타임스탬프에 적용되어 디스크에서의 크기를 줄이는 것을 목표로 합니다.
- [`ResourceAttributes`](https://opentelemetry.io/docs/specs/otel/resource/sdk/), [`LogAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-attributes), [`ScopeAttributes`](https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-instrumentationscope)가 맵임을 주목하세요. 사용자는 이들 간의 차이에 익숙해져야 합니다. 이러한 맵을 접근하는 방법 및 맵 내 키 접근을 최적화하는 방법은 [맵 사용하기](/use-cases/observability/schema-design#using-maps)를 참조하세요.
- 여기의 대부분의 다른 유형, 예를 들어 `ServiceName`으로 설정된 LowCardinality는 최적화되어 있습니다. 예시 로그에서 JSON인 `Body`는 문자열로 저장됩니다.
- 맵 키 및 값뿐만 아니라 `Body` 컬럼에 블룸 필터가 적용됩니다. 이는 이러한 컬럼에 접근하는 쿼리의 시간을 개선하는 것을 목표로 하지만, 일반적으로 필요하지 않습니다. [보조/데이터 스킵 인덱스](/use-cases/observability/schema-design#secondarydata-skipping-indices)를 참조하세요.

```sql
CREATE TABLE default.otel_traces
(
        `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
        `TraceId` String CODEC(ZSTD(1)),
        `SpanId` String CODEC(ZSTD(1)),
        `ParentSpanId` String CODEC(ZSTD(1)),
        `TraceState` String CODEC(ZSTD(1)),
        `SpanName` LowCardinality(String) CODEC(ZSTD(1)),
        `SpanKind` LowCardinality(String) CODEC(ZSTD(1)),
        `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
        `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `ScopeName` String CODEC(ZSTD(1)),
        `ScopeVersion` String CODEC(ZSTD(1)),
        `SpanAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
        `Duration` Int64 CODEC(ZSTD(1)),
        `StatusCode` LowCardinality(String) CODEC(ZSTD(1)),
        `StatusMessage` String CODEC(ZSTD(1)),
        `Events.Timestamp` Array(DateTime64(9)) CODEC(ZSTD(1)),
        `Events.Name` Array(LowCardinality(String)) CODEC(ZSTD(1)),
        `Events.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
        `Links.TraceId` Array(String) CODEC(ZSTD(1)),
        `Links.SpanId` Array(String) CODEC(ZSTD(1)),
        `Links.TraceState` Array(String) CODEC(ZSTD(1)),
        `Links.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
        INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
        INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_span_attr_key mapKeys(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_span_attr_value mapValues(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
        INDEX idx_duration Duration TYPE minmax GRANULARITY 1
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(3)
SETTINGS ttl_only_drop_parts = 1
```

다시 말하지만, 이는 [여기](https://opentelemetry.io/docs/specs/otel/trace/api/)에서 문서화된 OTel 공식 명세에 해당하는 열과 상관관계가 있습니다. 이 스키마는 위의 로그 스키마와 동일한 설정을 많이 사용하며, 스팬에 특정한 추가 링크 열이 포함되어 있습니다.

우리는 사용자가 자동 스키마 생성을 비활성화하고 테이블을 수동으로 생성할 것을 권장합니다. 이는 기본 및 보조 키를 수정할 수 있게 하며, 쿼리 성능을 최적화하기 위한 추가 열을 도입할 기회를 제공합니다. 자세한 내용은 [스키마 설계](/use-cases/observability/schema-design)를 참조하세요.
## 삽입 최적화 {#optimizing-inserts}

ClickHouse를 통해 관측 데이터의 높은 삽입 성능을 achieved하면서 강력한 일관성 보장을 받으려면, 사용자는 수집기를 통해 삽입할 때 간단한 규칙을 준수해야 합니다. OTel 수집기의 올바른 구성으로 인해, 다음 규칙을 따르기 쉽습니다. 이는 또한 ClickHouse를 처음 사용할 때 사용자가 겪는 [일반적인 문제](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)를 피할 수 있습니다.
### 배치 처리 {#batching}

기본적으로 ClickHouse에 전송된 각 삽입은 ClickHouse가 삽입에서 데이터를 포함하는 저장 파트를 즉시 생성하도록 합니다. 따라서 각각 더 적은 데이터를 포함하는 더 많은 삽입을 전송하는 것보다 더 많은 데이터를 포함하는 적은 수의 삽입을 전송하는 것이 쓰기 횟수를 줄이는 데 도움이 됩니다. 우리는 데이터가 1,000행 이상으로 구성된 충분히 큰 배치로 삽입할 것을 권장합니다. 더 상세한 정보는 [여기](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)를 참조하세요.

기본적으로 ClickHouse에 대한 삽입은 동기적이며 동일한 경우에는 멱등적입니다. MergeTree 엔진 계열의 테이블에 대해 ClickHouse는 기본적으로 [삽입 중 중복 제거](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)를 자동으로 수행합니다. 이는 삽입이 다음과 같은 경우에 내구성이 있다는 것을 의미합니다:

- (1) 데이터를 받는 노드에 문제가 있는 경우, 삽입 쿼리는 시간 초과가 발생하거나(또는 더 구체적인 오류가 발생) 확인을 받지 않습니다.
- (2) 데이터가 노드에 기록되었지만, 네트워크 중단으로 인해 쿼리 발신자에게 확인서를 반환할 수 없는 경우, 발신자는 시간 초과 또는 네트워크 오류를 받을 것입니다.

수집기의 관점에서, (1) 및 (2)는 구별하기 어려울 수 있습니다. 그러나 두 경우 모두 확인되지 않은 삽입은 즉시 재시도할 수 있습니다. 재시도된 삽입 쿼리가 동일한 데이터와 동일한 순서를 포함하는 이상, ClickHouse는(확인되지 않은) 원래 삽입이 성공한 경우 재시도된 삽입을 자동으로 무시합니다.

우리는 사용자가 위의 요구 사항을 충족하는 일관된 행 배치로 삽입을 보장하기 위해 이전 구성에서 보여준 [배치 프로세서](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)를 사용할 것을 권장합니다. 수집기가 높은 처리량(초당 이벤트)을 가지며 각 삽입에서 최소 5,000 이벤트를 전송할 수 있다면, 일반적으로 파이프라인에서 유일하게 필요한 배치 처리입니다. 이 경우, 수집기는 배치 프로세서의 `timeout`에 도달하기 전에 배치를 플러시하여 파이프라인의 종단 간 대기 시간이 낮고 배치의 크기가 일관되도록 합니다.
### 비동기 삽입 사용 {#use-asynchronous-inserts}

일반적으로 사용자는 수집기의 처리량이 낮을 때 작은 배치를 보내야 하지만, 여전히 데이터가 최소한의 종단 간 대기 시간 내에 ClickHouse에 도달하기를 기대합니다. 이 경우, 배치 프로세서의 `timeout`이 만료되면 작은 배치가 전송됩니다. 이는 문제를 일으킬 수 있으며, 비동기 삽입이 필요합니다. 이 경우는 일반적으로 **에이전트 역할의 수집기가 ClickHouse에 직접 데이터를 보내도록 구성된 경우** 발생합니다. 게이트웨이는 집합체 역할을 하여 이 문제를 완화할 수 있습니다 - [게이트웨이를 통한 확장](#scaling-with-gateways)을 참조하십시오.

큰 배치를 보장할 수 없는 경우, 사용자는 [비동기 삽입](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)을 통해 ClickHouse에 배치 처리를 위임할 수 있습니다. 비동기 삽입을 사용하면 데이터가 먼저 버퍼에 삽입되고, 이후에 데이터베이스 저장소에 비동기적으로 기록됩니다.

<Image img={observability_6} alt="비동기 삽입" size="md"/>

[비동기 삽입 활성화](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)를 통해 ClickHouse가 ① 삽입 쿼리를 수신하면, 쿼리의 데이터가 ② 먼저 인메모리 버퍼에 즉시 기록됩니다. ③ 다음 버퍼 플러시가 발생할 때, 버퍼의 데이터는 [정렬](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)되고 데이터베이스 저장소에 파트로 기록됩니다. 데이터가 데이터베이스 저장소에 플러시되기 전까지 쿼리로 검색할 수 없음을 유의하세요; 버퍼 플러시는 [구성 가능](/optimize/asynchronous-inserts)합니다.

수집기에 대해 비동기 삽입을 활성화하려면 연결 문자열에 `async_insert=1`을 추가하세요. 사용자는 만족스러운 배달 보장을 받을 수 있도록 `wait_for_async_insert=1` (기본값)을 사용하는 것이 좋습니다 - 자세한 내용은 [여기](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)를 참조하세요.

비동기 삽입의 데이터는 ClickHouse 버퍼가 플러시될 때 삽입됩니다. 이는 [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size)를 초과하거나 첫 번째 INSERT 쿼리 이후 [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) 밀리초가 경과한 경우 발생합니다. `async_insert_stale_timeout_ms`가 0이 아닌 값으로 설정된 경우, 데이터는 마지막 쿼리 이후 `async_insert_stale_timeout_ms 밀리초`가 경과한 후에 삽입됩니다. 사용자는 이러한 설정을 조정하여 파이프라인의 종단 간 대기 시간을 제어할 수 있습니다. 버퍼 플러시를 조정하는 데 사용할 수 있는 추가 설정은 [여기](/operations/settings/settings#async_insert)에 문서화되어 있습니다. 일반적으로 기본값이 적절합니다.

:::note 적응형 비동기 삽입 고려
적은 수의 에이전트가 사용되고 처리량이 낮지만 엄격한 종단 간 대기 시간 요구 사항이 있는 경우, [적응형 비동기 삽입](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts)이 유용할 수 있습니다. 일반적으로, ClickHouse와 함께 볼 수 있는 고 처리량 관측 사용 사례에는 적용되지 않습니다.
:::

마지막으로, 비동기 삽입을 사용할 때 ClickHouse에 대한 동기 삽입과 관련된 이전의 중복 제거 동작은 기본적으로 활성화되지 않으며, 필요할 경우 설정 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate)를 참조하세요.

이 기능을 구성하는 방법에 대한 전체 세부정보는 [여기](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)에서 찾을 수 있으며, 깊이 있는 설명은 [여기](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)에서 제공합니다.
## 배포 아키텍처 {#deployment-architectures}

OTel 수집기를 ClickHouse와 사용할 때 여러 가지 배포 아키텍처를 구성할 수 있습니다. 우리는 아래에서 각각을 설명하고 언제 적합할지에 대해 논의합니다.
### 에이전트 전용 {#agents-only}

에이전트 전용 아키텍처에서는 사용자가 OTel 수집기를 에지에 에이전트로 배포합니다. 이러한 에이전트는 로컬 애플리케이션에서 추적을 수신하고 서버 및 Kubernetes 노드에서 로그를 수집합니다. 이 모드에서는 에이전트가 데이터를 ClickHouse에 직접 전송합니다.

<Image img={observability_7} alt="에이전트 전용" size="md"/>

이 아키텍처는 소규모에서 중간 규모의 배포에 적합합니다. 주요 이점은 추가 하드웨어가 필요 없으며 ClickHouse 관측 솔루션의 전체 리소스 풋프린트를 최소화하고 애플리케이션과 수집기 간의 간단한 매핑을 유지한다는 점입니다.

사용자는 에이전트 수가 수백 개를 초과하면 게이트웨이 기반 아키텍처로 마이그레이션을 고려해야 합니다. 이 아키텍처는 확장하기 어렵게 만드는 몇 가지 단점이 있습니다:

- **연결 확장** - 각 에이전트는 ClickHouse에 연결을 설정합니다. ClickHouse는 수백(수천) 개의 동시 삽입 연결을 유지할 수 있지만, 이는 궁극적으로 제한 요소가 되어 삽입의 효율성을 낮춥니다. 즉, ClickHouse가 연결을 유지하는 데 더 많은 리소스가 사용됩니다. 게이트웨이를 사용하면 연결 수가 최소화되어 삽입이 더 효율적입니다.
- **에지에서의 처리** - 이 아키텍처에서는 모든 변환이나 이벤트 처리를 에지 또는 ClickHouse에서 수행해야 합니다. 제한적일 뿐만 아니라 이는 복잡한 ClickHouse 물리화된 뷰 또는 에지에 중요한 서비스에 영향을 줄 수 있는 상당한 계산을 밀어넣는 것을 의미할 수 있습니다.
- **작은 배치 및 대기 시간** - 에이전트 수집기는 개별적으로 매우 적은 이벤트를 수집할 수 있습니다. 이는 일반적으로 전달 SLA를 충족하기 위해 설정된 간격으로 플러시되도록 구성해야 함을 의미합니다. 이는 수집기가 ClickHouse에 작은 배치를 전송하는 결과를 초래할 수 있습니다. 단점이지만, 비동기 삽입으로 완화될 수 있습니다 - [삽입 최적화](#optimizing-inserts)를 참조합니다.
### 게이트웨이를 통한 확장 {#scaling-with-gateways}

OTel 수집기는 위의 제한 사항을 해결하기 위해 게이트웨이 인스턴스로 배포할 수 있습니다. 이러한 인스턴스는 일반적으로 데이터 센터나 지역별로 독립형 서비스를 제공합니다. 이들은 애플리케이션(또는 에이전트 역할의 다른 수집기)으로부터 단일 OTLP 엔드포인트를 통해 이벤트를 수신합니다. 일반적으로 여러 게이트웨이 인스턴스가 배포되며, 기본 제공 로드 밸런서를 사용하여 그들 사이에 로드를 분배합니다.

<Image img={observability_8} alt="게이트웨이를 통한 확장" size="md"/>

이 아키텍처의 목표는 에이전트로부터 계산 집약적인 처리를 오프로드하여 리소스 사용을 최소화하는 것입니다. 이 게이트웨이는 에이전트가 수행해야 하는 변환 작업을 수행할 수 있습니다. 뿐만 아니라 여러 에이전트로부터 이벤트를 집계하여, 게이트웨이는 ClickHouse에 큰 배치를 보낼 수 있도록 하여 효율적인 삽입을 가능하게 합니다. 이러한 게이트웨이 수집기는 더 많은 에이전트가 추가되고 이벤트 처리량이 증가함에 따라 쉽게 확장할 수 있습니다. 아래에는 예시 게이트웨이 구성과 예시 구조화된 로그 파일을 소비하는 관련 에이전트 구성 예시가 나와 있습니다. 수집기와 게이트웨이 간의 통신을 위해 OTLP를 사용하는 것을 주목하세요.

[clickhouse-agent-config.yaml](https://www.otelbin.io/#config=receivers%3A*N_filelog%3A*N___include%3A*N_____-_%2Fopt%2Fdata%2Flogs%2Faccess-structured.log*N___start*_at%3A_beginning*N___operators%3A*N_____-_type%3A_json*_parser*N_______timestamp%3A*N_________parse*_from%3A_attributes.time*_local*N_________layout%3A_*%22*.Y-*.m-*.d_*.H%3A*.M%3A*.S*%22*N*Nprocessors%3A*N_batch%3A*N___timeout%3A_5s*N___send*_batch*_size%3A_1000*N*Nexporters%3A*N_otlp%3A*N___endpoint%3A_localhost%3A4317*N___tls%3A*N_____insecure%3A_true_*H_Set_to_false_if_you_are_using_a_secure_connection*N*Nservice%3A*N_telemetry%3A*N___metrics%3A*N_____address%3A_0.0.0.0%3A9888_*H_Modified_as_2_collectors_running_on_same_host*N_pipelines%3A*N___logs%3A*N_____receivers%3A_%5Bfilelog%5D*N_____processors%3A_%5Bbatch%5D*N_____exporters%3A_%5Botlp%5D%7E&distro=otelcol-contrib%7E&distroVersion=v0.103.1%7E)

```yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
processors:
  batch:
    timeout: 5s
    send_batch_size: 1000
exporters:
  otlp:
    endpoint: localhost:4317
    tls:
      insecure: true # Set to false if you are using a secure connection
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # Modified as 2 collectors running on same host
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlp]
```

[clickhouse-gateway-config.yaml](https://www.otelbin.io/#config=receivers%3A*N__otlp%3A*N____protocols%3A*N____grpc%3A*N____endpoint%3A_0.0.0.0%3A4317*N*Nprocessors%3A*N__batch%3A*N____timeout%3A_5s*N____send*_batch*_size%3A_10000*N*Nexporters%3A*N__clickhouse%3A*N____endpoint%3A_tcp%3A%2F%2Flocalhost%3A9000*Qdial*_timeout*E10s*Acompress*Elz4*N____ttl%3A_96h*N____traces*_table*_name%3A_otel*_traces*N____logs*_table*_name%3A_otel*_logs*N____create*_schema%3A_true*N____timeout%3A_10s*N____database%3A_default*N____sending*_queue%3A*N____queue*_size%3A_10000*N____retry*_on*_failure%3A*N____enabled%3A_true*N____initial*_interval%3A_5s*N____max*_interval%3A_30s*N____max*_elapsed*_time%3A_300s*N*Nservice%3A*N__pipelines%3A*N____logs%3A*N______receivers%3A_%5Botlp%5D*N______processors%3A_%5Bbatch%5D*N______exporters%3A_%5Bclickhouse%5D%7E&distro=otelcol-contrib%7E&distroVersion=v0.103.1%7E)

```yaml
receivers:
  otlp:
    protocols:
    grpc:
    endpoint: 0.0.0.0:4317
processors:
  batch:
    timeout: 5s
    send_batch_size: 10000
exporters:
  clickhouse:
    endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4
    ttl: 96h
    traces_table_name: otel_traces
    logs_table_name: otel_logs
    create_schema: true
    timeout: 10s
    database: default
    sending_queue:
      queue_size: 10000
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s
service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [clickhouse]
```

다음 명령어로 이 설정을 실행할 수 있습니다.

```bash
./otelcol-contrib --config clickhouse-gateway-config.yaml
./otelcol-contrib --config clickhouse-agent-config.yaml
```

이 아키텍처의 주요 단점은 수집기 집합을 관리하는 데 따른 비용 및 오버헤드입니다.

관련 학습이 포함된 대규모 게이트웨이 기반 아키텍처를 관리하는 예시로 [이 블로그 포스트](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog)를 추천합니다.
### Kafka 추가 {#adding-kafka}

읽는 이들은 위의 아키텍처가 메시지 큐로 Kafka를 사용하지 않는 것을 주목할 수 있습니다.

Kafka 큐를 메시지 버퍼로 사용하는 것은 로깅 아키텍처에서 사용되는 인기 있는 설계 패턴으로, ELK 스택에 의해 대중화되었습니다. 이 방식은 몇 가지 이점을 제공합니다. 주로 더 강력한 메시지 배달 보장을 통해 백프레셔를 처리하는 데 도움을 줍니다. 메시지는 수집 에이전트에서 Kafka로 전송되어 디스크에 기록됩니다. 이론적으로 클러스터화된 Kafka 인스턴스는 데이터를 디스크에 선형으로 작성하는 것이 메시지를 구문 분석하고 처리하는 것보다 계산 오버헤드가 적으므로 높은 처리량 메시지 버퍼를 제공해야 합니다. 예를 들어 Elastic에서는 토큰화 및 인덱싱에서 상당한 오버헤드가 발생합니다. 에이전트에서 데이터를 분리함으로써 소스에서의 로그 회전으로 인해 메시지를 잃어버릴 위험도 줄어듭니다. 마지막으로, 특정 사용 사례에 유용할 수 있는 메시지 재전송 및 교차 지역 복제 기능을 제공합니다.

그러나 ClickHouse는 데이터를 매우 빠르게 삽입할 수 있습니다 - 중간 하드웨어에서 초당 수백만 행을 처리합니다. ClickHouse의 백프레셔는 **드물게** 발생합니다. 종종 Kafka 큐를 활용하면 더 많은 아키텍처 복잡성과 비용이 발생합니다. 로그가 은행 거래 및 기타 미션 크리티컬 데이터와 동일한 배달 보장이 필요하지 않다는 원칙을 수용할 수 있다면, Kafka의 복잡성을 피하는 것을 권장합니다.

하지만 높은 배달 보장 또는 여러 소스로의 데이터 재전송 능력이 필요한 경우 Kafka는 유용한 아키텍처 추가 요소가 될 수 있습니다.

<Image img={observability_9} alt="Kafka 추가" size="md"/>

이 경우, OTel 에이전트는 [Kafka 내보내기](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md)를 통해 데이터를 Kafka로 전송하도록 구성될 수 있습니다. 게이트웨이 인스턴스는 [Kafka 수신기](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md)를 사용해 메시지를 수신합니다. 추가 세부 사항에 대해서는 Confluent 및 OTel 문서를 참조하는 것을 권장합니다.
### 자원 추정 {#estimating-resources}

OTel 수집기의 자원 요구 사항은 이벤트 처리량, 메시지 크기 및 수행되는 처리량에 따라 달라집니다. OpenTelemetry 프로젝트는 사용자가 자원 요구 사항을 추정하는 데 사용할 수 있는 [벤치마크](https://opentelemetry.io/docs/collector/benchmarks/)를 유지합니다.

[우리의 경험에 따르면](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview), 3코어 및 12GB의 RAM을 가진 게이트웨이 인스턴스는 초당 약 60,000개의 이벤트를 처리할 수 있습니다. 이는 필드를 이름 변경하는 최소한의 처리 파이프라인을 책임지며 정규 표현식은 포함되지 않습니다.

게이트웨이로 이벤트를 전송하는 역할을 하는 에이전트 인스턴스의 경우, 이벤트의 타임스탬프만 설정하면서 사용자는 예상되는 로그 수 초에 따라 규모를 조정할 것을 권장합니다. 다음은 사용자가 시작점으로 사용할 수 있는 대략적인 수치를 나타냅니다:

| 로깅 속도 | 수집기 에이전트의 자원 |
|--------------|------------------------------|
| 1k/초    | 0.2CPU, 0.2GiB              |
| 5k/초    | 0.5 CPU, 0.5GiB             |
| 10k/초   | 1 CPU, 1GiB                 |

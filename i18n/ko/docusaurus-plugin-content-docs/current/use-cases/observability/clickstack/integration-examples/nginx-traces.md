---
'slug': '/use-cases/observability/clickstack/integrations/nginx-traces'
'title': 'ClickStack으로 Nginx 추적 모니터링하기'
'sidebar_label': 'Nginx 추적'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack으로 Nginx 추적 모니터링하기'
'doc_type': 'guide'
'keywords':
- 'ClickStack'
- 'Nginx'
- 'traces'
- 'otel'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/finish-nginx-traces-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/nginx-traces-dashboard.png';
import view_traces from '@site/static/images/clickstack/nginx-traces-search-view.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Monitoring Nginx Traces with ClickStack {#nginx-traces-clickstack}

:::note[TL;DR]
이 가이드는 기존 Nginx 설치에서 분산 트레이스를 캡처하고 ClickStack에서 시각화하는 방법을 보여줍니다. 다음을 배울 것입니다:

- OpenTelemetry 모듈을 Nginx에 추가하기
- Nginx를 구성하여 ClickStack의 OTLP 엔드포인트에 트레이스를 전송하기
- HyperDX에서 트레이스가 나타나는지 확인하기
- 요청 성능(지연 시간, 오류, 처리량)을 시각화하는 미리 제작된 대시보드 사용하기

생산 Nginx를 구성하기 전에 통합을 테스트할 수 있는 샘플 트레이스가 포함된 데모 데이터 세트가 제공됩니다.

필요한 시간: 5-10분
::::

## Integration with existing Nginx {#existing-nginx}

이 섹션에서는 OpenTelemetry 모듈을 설치하고 ClickStack에 트레이스를 전송하도록 구성하여 기존의 Nginx 설치에 분산 트레이싱을 추가하는 방법을 다룹니다.
기존 설정을 구성하기 전에 통합을 테스트하고 싶다면 [다음 섹션](/use-cases/observability/clickstack/integrations/nginx-traces#demo-dataset)에서 미리 구성된 설정과 샘플 데이터로 테스트할 수 있습니다.

##### Prerequisites {#prerequisites}
- OTLP 엔드포인트에 접근 가능한 ClickStack 인스턴스 (포트 4317/4318)
- 기존 Nginx 설치 (버전 1.18 이상)
- Nginx 구성 수정을 위한 root 또는 sudo 접근 권한
- ClickStack 호스트 이름 또는 IP 주소

<VerticalStepper headerLevel="h4">

#### Install OpenTelemetry Nginx module {#install-module}

Nginx에 트레이싱을 추가하는 가장 쉬운 방법은 OpenTelemetry 지원이 내장된 공식 Nginx 이미지를 사용하는 것입니다.

##### Using the nginx:otel image {#using-otel-image}

현재 Nginx 이미지를 OpenTelemetry 활성화 버전으로 교체하십시오:

```yaml

# In your docker-compose.yml or Dockerfile
image: nginx:1.27-otel
```

이 이미지에는 `ngx_otel_module.so`가 미리 설치되어 있으며 바로 사용할 수 있습니다.

:::note
Docker 외부에서 Nginx를 실행하는 경우, 수동 설치 지침은 [OpenTelemetry Nginx 문서](https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/nginx)를 참조하십시오.
:::

#### Configure Nginx to send traces to ClickStack {#configure-nginx}

OpenTelemetry 구성을 `nginx.conf` 파일에 추가하십시오. 이 구성은 모듈을 로드하고 ClickStack의 OTLP 엔드포인트로 트레이스를 전송하도록 지시합니다.

먼저, API 키를 가져옵니다:
1. ClickStack URL에서 HyperDX 열기
2. 설정 → API 키로 이동  
3. **Ingestion API Key** 복사
4. 환경 변수로 설정: `export CLICKSTACK_API_KEY=your-api-key-here`

다음과 같이 `nginx.conf`에 추가하십시오:

```yaml
load_module modules/ngx_otel_module.so;

events {
    worker_connections 1024;
}

http {
    # OpenTelemetry exporter configuration
    otel_exporter {
        endpoint <clickstack-host>:4317;
        header authorization ${CLICKSTACK_API_KEY};
    }

    # Service name for identifying this nginx instance
    otel_service_name "nginx-proxy";

    # Enable tracing
    otel_trace on;

    server {
        listen 80;

        location / {
            # Enable tracing for this location
            otel_trace_context propagate;
            otel_span_name "$request_method $uri";

            # Add request details to traces
            otel_span_attr http.status_code $status;
            otel_span_attr http.request.method $request_method;
            otel_span_attr http.route $uri;

            # Your existing proxy or application configuration
            proxy_pass http://your-backend;
        }
    }
}
```

Docker에서 Nginx를 실행하는 경우, 환경 변수를 컨테이너에 전달하십시오:

```yaml
services:
  nginx:
    image: nginx:1.27-otel
    environment:
      - CLICKSTACK_API_KEY=${CLICKSTACK_API_KEY}
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

`<clickstack-host>`를 ClickStack 인스턴스의 호스트 이름 또는 IP 주소로 교체하십시오.

:::note
- **Port 4317**는 Nginx 모듈에서 사용하는 gRPC 엔드포인트입니다.
- **otel_service_name**은 Nginx 인스턴스를 설명해야 합니다 (예: "api-gateway", "frontend-proxy").
- HyperDX에서 쉽게 식별할 수 있도록 **otel_service_name**을 환경에 맞게 변경하십시오.
:::

##### Understanding the configuration {#understanding-configuration}

**트레이스되는 내용:**
Nginx에 대한 각 요청은 다음을 보여주는 트레이스 스팬을 생성합니다:
- 요청 방법 및 경로
- HTTP 상태 코드
- 요청 지속 시간
- 타임스탬프

**스팬 속성:**
`otel_span_attr` 지시문은 각 트레이스에 메타데이터를 추가하여 HyperDX에서 상태 코드, 방법, 경로 등에 따라 요청을 필터링하고 분석할 수 있게 합니다.

이러한 변경을 만든 후, Nginx 구성을 테스트하십시오:
```bash
nginx -t
```

테스트가 통과하면 Nginx를 다시 불러옵니다:
```bash

# For Docker
docker-compose restart nginx


# For systemd
sudo systemctl reload nginx
```

#### Verifying traces in HyperDX {#verifying-traces}

구성이 완료되면 HyperDX에 로그인하고 트레이스가 흐르는지 확인하십시오. 다음과 같은 내용을 볼 수 있어야 하며, 트레이스가 보이지 않으면 시간 범위를 조정해 보십시오:

<Image img={view_traces} alt="View Traces"/>

</VerticalStepper>

## Demo dataset {#demo-dataset}

생산 시스템을 구성하기 전에 nginx 트레이스 통합을 테스트하려는 사용자에게는 현실적인 트래픽 패턴이 있는 미리 생성된 Nginx 트레이스의 샘플 데이터 세트를 제공합니다.

<VerticalStepper headerLevel="h4">

#### Start ClickStack {#start-clickstack}

아직 ClickStack이 실행되지 않았다면, 다음으로 시작하십시오:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

ClickStack이 완전히 초기화될 때까지 약 30초 기다립니다.

- 포트 8080: HyperDX 웹 인터페이스
- 포트 4317: Nginx 모듈에서 사용하는 OTLP gRPC 엔드포인트
- 포트 4318: 데모 트레이스에 사용되는 OTLP HTTP 엔드포인트

#### Download the sample dataset {#download-sample}

샘플 트레이스 파일을 다운로드하고 타임스탬프를 현재 시간으로 업데이트하십시오:

```bash

# Download the traces
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nginx-traces-sample.json
```

데이터 세트에는 다음이 포함됩니다:
- 현실적인 타이밍을 가진 1,000개의 트레이스 스팬
- 다양한 트래픽 패턴을 가진 9개의 서로 다른 엔드포인트
- 약 93%의 성공률 (200), 약 3%의 클라이언트 오류 (404), 약 4%의 서버 오류 (500)
- 10ms에서 800ms까지의 지연 시간
- 원래 트래픽 패턴이 보존되며 현재 시간으로 이동됨

#### Send traces to ClickStack {#send-traces}

API 키를 환경 변수로 설정합니다(아직 설정하지 않았다면):

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

**API 키를 가져옵니다:**
1. ClickStack URL에서 HyperDX 열기
2. 설정 → API 키로 이동
3. **Ingestion API Key** 복사

그런 다음 ClickStack에 트레이스를 전송하십시오:

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nginx-traces-sample.json
```

:::note[Running on localhost]
이 데모는 ClickStack이 `localhost:4318`에서 로컬로 실행되고 있다고 가정합니다. 원격 인스턴스의 경우, `localhost`를 ClickStack 호스트 이름으로 교체하십시오.
:::

`{"partialSuccess":{}}`와 같은 응답이 표시되어야 하며, 이는 트레이스가 성공적으로 전송되었음을 나타냅니다. 모든 1,000개의 트레이스가 ClickStack에 수집됩니다.

#### Verify traces in HyperDX {#verify-demo-traces}

1. [데모 시간 범위와 함께 HyperDX 열기](http://localhost:8080/search?from=1761501600000&to=1761588000000&isLive=false&source=69023d1b4f1d41a964641b09&where=&select=Timestamp,ServiceName,StatusCode,round(Duration/1e6),SpanName&whereLanguage=lucene&orderBy=&filters=[])

검색 뷰에서 다음과 같은 내용을 볼 수 있어야 합니다:

:::note
로그가 표시되지 않으면 시간 범위가 2025-10-26 13:00:00 - 2025-10-27 13:00:00으로 설정되어 있고 'Logs'가 소스로 선택되어 있는지 확인하십시오. 링크를 사용하는 것이 정확한 시간 범위 결과를 얻는 데 중요합니다.
:::

<Image img={view_traces} alt="View Traces"/>

</VerticalStepper>

## Dashboards and visualization {#dashboards}

ClickStack으로 트레이스를 모니터링하는 데 도움이 되는 필수 시각화를 제공하여 시작할 수 있도록 합니다.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-traces-dashboard.json')} download="nginx-traces-dashboard.json" eventName="docs.nginx_traces_monitoring.dashboard_download">대시보드 구성 다운로드</TrackedLink> {#download}

#### Import the pre-built dashboard {#import-dashboard}
1. HyperDX를 열고 대시보드 섹션으로 이동합니다.
2. 오른쪽 상단의 점 3개 아래에서 "Import Dashboard"를 클릭합니다.

<Image img={import_dashboard} alt="Import Dashboard"/>

3. nginx-trace-dashboard.json 파일을 업로드하고 가져오기를 완료하려면 클릭합니다.

<Image img={finish_import} alt="Finish Import"/>

#### 대시보드는 모든 시각화가 미리 구성된 상태로 생성됩니다. {#created-dashboard}

:::note
시간 범위는 2025-10-26 13:00:00 - 2025-10-27 13:00:00으로 설정되어 있는지 확인하십시오. 가져온 대시보드는 기본적으로 시간 범위가 지정되지 않습니다.
:::

<Image img={example_dashboard} alt="Example Dashboard"/>

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### No traces appearing in HyperDX {#no-traces}

**nginx 모듈이 로드되었는지 확인:**
```bash
nginx -V 2>&1 | grep otel
```
OpenTelemetry 모듈에 대한 참조가 표시되어야 합니다.

**네트워크 연결 확인:**
```bash
telnet <clickstack-host> 4317
```
OTLP gRPC 엔드포인트에 성공적으로 연결되어야 합니다.

**API 키가 설정되었는지 확인:**
```bash
echo $CLICKSTACK_API_KEY
```
API 키가 출력되어야 하며(비어 있지 않음) 합니다.

**nginx 오류 로그 확인:**
```bash

# For Docker
docker logs <nginx-container> 2>&1 | grep -i otel


# For systemd
sudo tail -f /var/log/nginx/error.log | grep -i otel
```
OpenTelemetry 관련 오류를 찾으십시오.

**nginx가 요청을 수신 중인지 확인:**
```bash

# Check access logs to confirm traffic
tail -f /var/log/nginx/access.log
```

## Next steps {#next-steps}
더 탐색하고 싶다면, 대시보드 실험을 위한 몇 가지 다음 단계를 소개합니다.

- 중요한 메트릭(오류 비율, 지연 임계값)에 대한 경고 설정하기
- 특정 사용 사례(API 모니터링, 보안 이벤트)를 위한 추가 대시보드 생성하기

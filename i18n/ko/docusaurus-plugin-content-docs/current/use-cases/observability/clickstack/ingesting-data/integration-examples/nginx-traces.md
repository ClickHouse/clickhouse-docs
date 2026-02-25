---
slug: /use-cases/observability/clickstack/integrations/nginx-traces
title: 'ClickStack를 사용한 Nginx 트레이스 모니터링'
sidebar_label: 'Nginx 트레이스'
pagination_prev: null
pagination_next: null
description: 'ClickStack를 사용한 Nginx 트레이스 모니터링'
doc_type: 'guide'
keywords: ['ClickStack', 'Nginx', 'traces', 'otel']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/finish-nginx-traces-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/nginx-traces-dashboard.png';
import view_traces from '@site/static/images/clickstack/nginx-traces-search-view.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack로 Nginx 트레이스 모니터링하기 \{#nginx-traces-clickstack\}

:::note[요약]
이 가이드는 기존에 운영 중인 Nginx 환경에서 분산 트레이스를 수집하고, 이를 ClickStack에서 시각화하는 방법을 설명합니다. 다음 내용을 학습하게 됩니다:

- Nginx에 OpenTelemetry 모듈 추가하기
- Nginx를 구성하여 트레이스를 ClickStack의 OTLP 엔드포인트로 전송하도록 설정하기
- HyperDX에 트레이스가 정상적으로 표시되는지 확인하기
- 미리 만들어진 대시보드를 사용하여 요청 성능(지연 시간, 오류, 처리량)을 시각화하기

운영 중인 Nginx를 구성하기 전에 통합을 먼저 테스트하고자 하는 경우, 샘플 트레이스가 포함된 데모 데이터셋을 사용할 수 있습니다.

소요 시간: 약 5~10분
::::

## 기존 Nginx와의 통합 \{#existing-nginx\}

이 섹션에서는 OpenTelemetry 모듈을 설치하고 ClickStack으로 트레이스를 전송하도록 구성하여, 기존에 운영 중인 Nginx에 분산 트레이싱을 추가하는 방법을 다룹니다.
기존 환경을 직접 구성하기 전에 통합을 시험해 보고자 한다면, [다음 섹션](/use-cases/observability/clickstack/integrations/nginx-traces#demo-dataset)에 있는 사전 구성된 예제 환경과 샘플 데이터를 사용해 테스트할 수 있습니다.

##### 사전 준비 사항 \{#prerequisites\}

- OTLP 엔드포인트(포트 4317/4318)에 접근 가능한 ClickStack 인스턴스
- Nginx 설치(버전 1.18 이상)
- Nginx 설정을 변경할 수 있는 root 또는 sudo 권한
- ClickStack 호스트 이름 또는 IP 주소

<VerticalStepper headerLevel="h4">

#### OpenTelemetry Nginx 모듈 설치 \{#install-module\}

Nginx에 트레이싱을 추가하는 가장 쉬운 방법은 OpenTelemetry 지원이 내장된 공식 Nginx 이미지를 사용하는 것입니다.

##### nginx:otel 이미지 사용 \{#using-otel-image\}

현재 사용 중인 Nginx 이미지를 OpenTelemetry 지원 버전으로 교체합니다:

```yaml
# docker-compose.yml 또는 Dockerfile에서
image: nginx:1.27-otel
```

이 이미지는 `ngx_otel_module.so`가 미리 설치되어 있어 바로 사용할 수 있습니다.

:::note
Docker 외부에서 Nginx를 실행 중인 경우, 수동 설치 방법은 [OpenTelemetry Nginx 문서](https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/nginx)를 참고하십시오.
:::

#### Nginx를 ClickStack으로 트레이스를 전송하도록 설정 \{#configure-nginx\}

`nginx.conf` 파일에 OpenTelemetry 설정을 추가합니다. 이 설정은 모듈을 로드하고 트레이스를 ClickStack의 OTLP 엔드포인트로 전송합니다.

먼저 API 키를 가져옵니다:
1. ClickStack URL에서 HyperDX를 엽니다.
2. Settings → API Keys로 이동합니다.  
3. **Ingestion API Key**를 복사합니다.
4. 환경 변수로 설정합니다: `export CLICKSTACK_API_KEY=your-api-key-here`

`nginx.conf`에 다음을 추가합니다:

```yaml
load_module modules/ngx_otel_module.so;

events {
    worker_connections 1024;
}

http {
    # OpenTelemetry exporter 설정
    otel_exporter {
        endpoint <clickstack-host>:4317;
        header authorization ${CLICKSTACK_API_KEY};
    }
    
    # 이 nginx 인스턴스를 식별하기 위한 서비스 이름
    otel_service_name "nginx-proxy";
    
    # 트레이싱 활성화
    otel_trace on;
    
    server {
        listen 80;
        
        location / {
            # 이 location에 대해 트레이싱 활성화
            otel_trace_context propagate;
            otel_span_name "$request_method $uri";
            
            # 요청 세부 정보를 트레이스에 추가
            otel_span_attr http.status_code $status;
            otel_span_attr http.request.method $request_method;
            otel_span_attr http.route $uri;
            
            # 기존 프록시 또는 애플리케이션 설정
            proxy_pass http://your-backend;
        }
    }
}
```

Nginx를 Docker에서 실행 중인 경우, 컨테이너에 환경 변수를 전달합니다:

```yaml
services:
  nginx:
    image: nginx:1.27-otel
    environment:
      - CLICKSTACK_API_KEY=${CLICKSTACK_API_KEY}
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

`<clickstack-host>`를 ClickStack 인스턴스의 호스트 이름 또는 IP 주소로 교체합니다.

:::note
- **포트 4317**은 Nginx 모듈에서 사용하는 gRPC 엔드포인트입니다.
- **otel_service_name**은 Nginx 인스턴스를 잘 설명하도록 지정하는 것이 좋습니다(예: "api-gateway", "frontend-proxy").
- HyperDX에서 더 쉽게 식별할 수 있도록 **otel_service_name**을 환경에 맞게 변경하십시오.
:::

##### 설정 이해하기 \{#understanding-configuration\}

**트레이싱되는 내용:**
각 Nginx 요청마다 다음 정보를 포함하는 트레이스 스팬이 생성됩니다:
- 요청 메서드와 경로
- HTTP 상태 코드
- 요청 소요 시간
- 타임스탬프

**Span 속성:**
`otel_span_attr` 디렉티브는 각 트레이스에 메타데이터를 추가하여 HyperDX에서 상태 코드, 메서드, 라우트 등을 기준으로 요청을 필터링하고 분석할 수 있도록 합니다.

이 변경을 적용한 후 Nginx 설정을 테스트합니다:
```bash
nginx -t
```

테스트가 통과하면 Nginx를 다시 로드합니다:
```bash
# Docker 환경
docker-compose restart nginx

# systemd 환경
sudo systemctl reload nginx
```

#### HyperDX에서 트레이스 확인 \{#verifying-traces\}

설정을 완료한 후 HyperDX에 로그인하여 트레이스가 정상적으로 전송되는지 확인합니다. 트레이스가 표시되어야 하며, 보이지 않는 경우 시간 범위를 조정해 보십시오:

<Image img={view_traces} alt="트레이스 보기"/>

</VerticalStepper>

## 데모 데이터셋 \{#demo-dataset\}

프로덕션 환경을 구성하기 전에 nginx 트레이스 연동을 테스트하려는 사용자를 위해, 현실적인 트래픽 패턴을 가진 사전 생성된 Nginx 트레이스 샘플 데이터셋을 제공합니다.

<VerticalStepper headerLevel="h4">

#### ClickStack 시작하기 \{#start-clickstack\}

아직 ClickStack이 실행 중이 아니라면, 다음 명령으로 시작합니다:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

ClickStack이 완전히 초기화될 때까지 약 30초 정도 기다린 후 다음 단계를 진행합니다.

- 포트 8080: HyperDX 웹 인터페이스
- 포트 4317: OTLP gRPC 엔드포인트 (nginx 모듈에서 사용)
- 포트 4318: OTLP HTTP 엔드포인트 (데모 트레이스에 사용)

#### 샘플 데이터셋 다운로드 \{#download-sample\}

샘플 트레이스 파일을 다운로드한 뒤 타임스탬프를 현재 시각 기준으로 업데이트합니다:

```bash
# Download the traces
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nginx-traces-sample.json
```

이 데이터셋에는 다음이 포함됩니다:
- 현실적인 타이밍을 가진 1,000개의 트레이스 스팬(trace span)
- 서로 다른 9개의 엔드포인트와 다양한 트래픽 패턴
- 약 93% 성공률(200), 약 3% 클라이언트 오류(404), 약 4% 서버 오류(500)
- 10ms에서 800ms까지의 지연 시간 범위
- 원본 트래픽 패턴을 유지하되 현재 시각으로 이동된 데이터

#### ClickStack으로 트레이스 전송 \{#send-traces\}

API key가 아직 설정되지 않았다면 환경 변수로 API key를 설정합니다:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

**API key 가져오기:**
1. ClickStack URL에서 HyperDX를 엽니다.
2. Settings → API Keys로 이동합니다.
3. **Ingestion API Key**(수집 API key)를 복사합니다.

그런 다음 트레이스를 ClickStack으로 전송합니다:

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nginx-traces-sample.json
```

:::note[Running on localhost]
이 데모는 ClickStack이 `localhost:4318`에서 로컬로 실행 중이라고 가정합니다. 원격 인스턴스에서는 `localhost`를 ClickStack 호스트명으로 교체해야 합니다.
:::

`{"partialSuccess":{}}`와 같은 응답이 표시되면 트레이스가 성공적으로 전송되었음을 의미합니다. 모든 1,000개의 트레이스가 ClickStack으로 수집됩니다.

#### HyperDX에서 트레이스 확인 \{#verify-demo-traces\}

1. [HyperDX](http://localhost:8080/)를 열고 계정으로 로그인합니다(먼저 계정을 생성해야 할 수도 있습니다).
2. Search 뷰로 이동하여 source 값을 `Traces`로 설정합니다.
3. 시간 범위를 **2025-10-25 13:00:00 - 2025-10-28 13:00:00**으로 설정합니다.

Search 뷰에서 다음과 같은 화면을 확인할 수 있습니다:

:::note[Timezone Display]
HyperDX는 타임스탬프를 브라우저의 로컬 타임존으로 표시합니다. 데모 데이터는 **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** 범위를 포함합니다. 넓은 시간 범위를 사용하면 위치에 관계없이 데모 트레이스를 확인할 수 있습니다. 트레이스가 표시되면, 더 명확한 시각화를 위해 시간 범위를 24시간 정도로 좁힐 수 있습니다.
:::

<Image img={view_traces} alt="트레이스 보기"/>

</VerticalStepper>

## 대시보드와 시각화 \{#dashboards\}

ClickStack으로 트레이스 모니터링을 시작할 수 있도록, 트레이스 데이터에 대한 필수 시각화를 제공합니다.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-traces-dashboard.json')} download="nginx-traces-dashboard.json" eventName="docs.nginx_traces_monitoring.dashboard_download">대시보드 구성 파일을 다운로드</TrackedLink> \{#download\}

#### 미리 구성된 대시보드 가져오기 \{#import-dashboard\}
1. HyperDX를 열고 Dashboards 섹션으로 이동합니다.
2. 오른쪽 상단의 줄임표(…) 아래에서 「Import Dashboard」를 클릭합니다.

<Image img={import_dashboard} alt="대시보드 가져오기"/>

3. nginx-trace-dashboard.json 파일을 업로드한 후 「Finish Import」를 클릭합니다.

<Image img={finish_import} alt="가져오기 완료"/>

#### 모든 시각화가 미리 구성된 상태로 대시보드가 생성됩니다. \{#created-dashboard\}

:::note
데모 데이터셋의 경우 시간 범위를 **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** 로 설정하십시오(로컬 시간대에 맞게 조정하십시오). 가져온 대시보드는 기본적으로 시간 범위가 지정되어 있지 않습니다.
:::

<Image img={example_dashboard} alt="예시 대시보드"/>

</VerticalStepper>

## 문제 해결 \{#troubleshooting\}

### HyperDX에 트레이스가 나타나지 않는 경우 \{#no-traces\}

**nginx 모듈이 로드되었는지 확인하십시오.**

```bash
nginx -V 2>&1 | grep otel
```

OpenTelemetry 모듈에 대한 참조가 표시되어야 합니다.

**네트워크 연결 상태를 확인하십시오.**

```bash
telnet <clickstack-host> 4317
```

OTLP gRPC 엔드포인트에 성공적으로 연결되어야 합니다.

**API 키가 설정되었는지 확인하십시오:**

```bash
echo $CLICKSTACK_API_KEY
```

API key가 비어 있지 않은 값으로 출력되어야 합니다.

**nginx 오류 로그를 확인하십시오.**

```bash
# For Docker
docker logs <nginx-container> 2>&1 | grep -i otel

# For systemd
sudo tail -f /var/log/nginx/error.log | grep -i otel
```

OpenTelemetry와 관련된 오류가 있는지 확인하십시오.

**nginx가 요청을 수신하는지 확인하십시오.**

```bash
# Check access logs to confirm traffic
tail -f /var/log/nginx/access.log
```


## 다음 단계 \{#next-steps\}

더 살펴보고 싶다면, 대시보드를 활용하여 다음과 같은 작업을 시도해 보십시오.

- 중요한 메트릭(오류율, 지연 시간 임계값)에 대한 알림을 설정하십시오.
- 특정 사용 사례(API 모니터링, 보안 이벤트)를 위한 추가 대시보드를 구성하십시오.
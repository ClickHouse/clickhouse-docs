---
'slug': '/use-cases/observability/clickstack/integrations/nginx'
'title': 'ClickStack로 Nginx 로그 모니터링'
'sidebar_label': 'Nginx 로그'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack로 Nginx 모니터링'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/finish-nginx-logs-import.png';
import example_dashboard from '@site/static/images/clickstack/nginx-logs-dashboard.png';
import log_view from '@site/static/images/clickstack/log-view.png';
import search_view from '@site/static/images/clickstack/nginx-logs-search-view.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Monitoring Nginx Logs with ClickStack {#nginx-clickstack}

:::note[TL;DR]
이 가이드는 OpenTelemetry 수집기를 구성하여 Nginx 액세스 로그를 수집하여 ClickStack으로 Nginx를 모니터링하는 방법을 보여줍니다. 다음을 학습하게 됩니다:

- Nginx를 JSON 형식의 로그를 출력하도록 구성하기
- 로그 수집을 위한 사용자 정의 OTel 수집기 구성 생성하기
- 사용자 정의 구성으로 ClickStack 배포하기
- Nginx 메트릭을 시각화하기 위한 사전 구축된 대시보드 사용하기

프로덕션 Nginx를 구성하기 전에 통합을 테스트하고 싶다면 샘플 로그가 포함된 데모 데이터 세트를 사용할 수 있습니다.

소요 시간: 5-10 분
:::

## Integration with existing Nginx {#existing-nginx}

이 섹션에서는 ClickStack OTel 수집기 구성을 수정하여 기존 Nginx 설치가 로그를 ClickStack으로 보내도록 구성하는 방법을 다룹니다. 기존 설정을 구성하기 전에 통합을 테스트하고 싶으면 [다음 섹션](/use-cases/observability/clickstack/integrations/nginx#demo-dataset)에서 미리 구성된 설정 및 샘플 데이터로 테스트할 수 있습니다.

##### Prerequisites {#prerequisites}
- ClickStack 인스턴스가 실행 중입니다.
- 기존 Nginx 설치
- Nginx 구성 파일 수정을 위한 접근 권한

<VerticalStepper headerLevel="h4">

#### Configure Nginx log format {#configure-nginx}
먼저, Nginx가 로그를 JSON 형식으로 출력하도록 구성하여 보다 쉽게 파싱할 수 있도록 합니다. nginx.conf에 다음 로그 형식 정의를 추가하세요:

`nginx.conf` 파일은 일반적으로 다음 경로에 위치합니다:
- **Linux (apt/yum)**: `/etc/nginx/nginx.conf`
- **macOS (Homebrew)**: `/usr/local/etc/nginx/nginx.conf` 또는 `/opt/homebrew/etc/nginx/nginx.conf`
- **Docker**: 구성은 일반적으로 볼륨으로 마운트됩니다.

다음 로그 형식 정의를 `http` 블록에 추가합니다:

```nginx
http {
    log_format json_combined escape=json
    '{'
      '"time_local":"$time_local",'
      '"remote_addr":"$remote_addr",'
      '"request_method":"$request_method",'
      '"request_uri":"$request_uri",'
      '"status":$status,'
      '"body_bytes_sent":$body_bytes_sent,'
      '"request_time":$request_time,'
      '"upstream_response_time":"$upstream_response_time",'
      '"http_referer":"$http_referer",'
      '"http_user_agent":"$http_user_agent"'
    '}';

    access_log /var/log/nginx/access.log json_combined;
    error_log /var/log/nginx/error.log warn;
}
```

이 변경사항을 적용한 후 Nginx를 다시 로드합니다.

#### Create custom OTel collector configuration {#custom-otel}

ClickStack은 사용자 정의 구성 파일을 마운트하고 환경 변수를 설정하여 기본 OpenTelemetry Collector 구성을 확장할 수 있습니다. 사용자 정의 구성은 OpAMP를 통해 HyperDX가 관리하는 기본 구성과 병합됩니다.

다음 구성으로 nginx-monitoring.yaml이라는 파일을 생성합니다:

```yaml
receivers:
  filelog:
    include:
      - /var/log/nginx/access.log
      - /var/log/nginx/error.log
    start_at: end 
    operators:
      - type: json_parser
        parse_from: body
        parse_to: attributes
      - type: time_parser
        parse_from: attributes.time_local
        layout: '%d/%b/%Y:%H:%M:%S %z'
      - type: add
        field: attributes.source
        value: "nginx"

service:
  pipelines:
    logs/nginx:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
```

이 구성은:
- Nginx 로그를 표준 위치에서 읽습니다.
- JSON 로그 항목을 파싱합니다.
- 원래 로그 타임스탬프를 추출하고 보존합니다.
- HyperDX에서 필터링을 위해 source: Nginx 속성을 추가합니다.
- 전용 파이프라인을 통해 ClickHouse 수출기로 로그를 라우팅합니다.

:::note
- 사용자 정의 구성에서는 새 수신기와 파이프라인만 정의합니다.
- 프로세서(memory_limiter, transform, batch)와 수출업자(clickhouse)는 기본 ClickStack 구성에서 이미 정의되어 있으며, 이름으로 참조합니다.
- time_parser 연산자는 Nginx의 time_local 필드에서 타임스탬프를 추출하여 원래 로그 타이밍을 보존합니다.
- 파이프라인은 수신기에서 ClickHouse 수출기로 데이터를 라우팅합니다.
:::

#### Configure ClickStack to load custom configuration {#load-custom}

기존 ClickStack 배포에서 사용자 정의 수집기 구성을 활성화하려면 다음을 수행해야 합니다:

1. 사용자 정의 구성 파일을 /etc/otelcol-contrib/custom.config.yaml에 마운트합니다.
2. 환경 변수 CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml을 설정합니다.
3. 수집기가 로그를 읽을 수 있도록 Nginx 로그 디렉토리를 마운트합니다.

##### Option 1: Docker Compose {#docker-compose}

ClickStack 배포 구성 업데이트:
```yaml
services:
  clickstack:
    # ... existing configuration ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # ... other environment variables ...
    volumes:
      - ./nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/log/nginx:/var/log/nginx:ro
      # ... other volumes ...
```

##### Option 2: Docker Run (All-in-One Image) {#all-in-one}

docker run을 사용할 경우 모든 이미지로:
```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log/nginx:/var/log/nginx:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
ClickStack 수집기에 Nginx 로그 파일을 읽을 적절한 권한이 있는지 확인하세요. 프로덕션에서는 읽기 전용 마운트(:ro)를 사용하고 최소 권한 원칙을 따릅니다.
:::

#### Verifying Logs in HyperDX {#verifying-logs}
구성이 완료되면 HyperDX에 로그인하여 로그가 흐르고 있는지 확인합니다:

1. 검색 보기로 이동합니다.
2. 소스를 Logs로 설정하고 request, request_time, upstream_response_time 등의 필드가 있는 로그 항목이 표시되는지 확인합니다.

다음은 확인할 수 있는 예시입니다:

<Image img={search_view} alt="Log view"/>

<Image img={log_view} alt="Log view"/>

</VerticalStepper>

## Demo dataset {#demo-dataset}

생산 시스템을 구성하기 전에 nginx 통합을 테스트하려는 사용자에게는 실제 트래픽 패턴을 갖춘 미리 생성된 nginx 액세스 로그 샘플 데이터 세트를 제공합니다.

<VerticalStepper headerLevel="h4">

#### Download the sample dataset {#download-sample}

```bash

# Download the logs
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/access.log
```

데이터 세트에는 다음이 포함됩니다:
- 실제 트래픽 패턴의 로그 항목
- 다양한 엔드포인트 및 HTTP 메서드
- 성공적인 요청과 오류의 혼합
- 현실적인 응답 시간 및 바이트 수

#### Create test collector configuration {#test-config}

다음 구성으로 `nginx-demo.yaml`이라는 파일을 생성합니다:

```yaml
cat > nginx-demo.yaml << 'EOF'
receivers:
  filelog:
    include:
      - /tmp/nginx-demo/access.log
    start_at: beginning  # Read from beginning for demo data
    operators:
      - type: json_parser
        parse_from: body
        parse_to: attributes
      - type: time_parser
        parse_from: attributes.time_local
        layout: '%d/%b/%Y:%H:%M:%S %z'
      - type: add
        field: attributes.source
        value: "nginx-demo"

service:
  pipelines:
    logs/nginx-demo:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

#### Run ClickStack with demo configuration {#run-demo}

데모 로그 및 구성으로 ClickStack을 실행합니다:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/nginx-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/access.log:/tmp/nginx-demo/access.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

#### Verify logs in HyperDX {#verify-demo-logs}

ClickStack이 실행 중이라면 (먼저 계정을 생성하고 로그인해야 할 수도 있습니다):

1. [데모 시간 범위로 HyperDX 열기](http://localhost:8080/search?from=1760976000000&to=1761062400000&isLive=false&source=690235c1a9b7fc5a7c0fffc7&select=Timestamp,ServiceName,SeverityText,Body&where=&whereLanguage=lucene&filters=[]&orderBy=)

다음은 검색 보기에서 확인할 수 있는 내용입니다:

:::note
로그가 표시되지 않으면 시간 범위가 2025-10-20 11:00:00 - 2025-10-21 11:00:00으로 설정되고 'Logs'가 소스로 선택되었는지 확인하세요. 적절한 결과 시간 범위를 얻으려면 링크를 사용하는 것이 중요합니다.
:::

<Image img={search_view} alt="Log view"/>

<Image img={log_view} alt="Log view"/>

</VerticalStepper>

## Dashboards and visualization {#dashboards}

ClickStack으로 nginx 모니터링을 시작하는 데 도움이 되도록 Nginx 로그를 위한 필수 시각화를 제공합니다.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-logs-dashboard.json')} download="nginx-logs-dashboard.json" eventName="docs.nginx_logs_monitoring.dashboard_download">대시보드 구성 파일 다운로드</TrackedLink> {#download}

#### Import the pre-built dashboard {#import-dashboard}
1. HyperDX를 열고 대시보드 섹션으로 이동합니다.
2. 오른쪽 상단의 점3개에서 "Import Dashboard"를 클릭합니다.

<Image img={import_dashboard} alt="Import Dashboard"/>

3. nginx-logs-dashboard.json 파일을 업로드하고 가져오기를 완료합니다.

<Image img={finish_import} alt="Finish Import"/>

#### 대시보드가 모든 시각화가 사전 구성되어 생성됩니다. {#created-dashboard}

:::note
시간 범위가 2025-10-20 11:00:00 - 2025-10-21 11:00:00으로 설정되어 있는지 확인하세요. 가져온 대시보드는 기본적으로 시간 범위가 지정되지 않습니다.
:::

<Image img={example_dashboard} alt="Example Dashboard"/>

</VerticalStepper>

## Troubleshooting {#troubleshooting}

### Custom config not loading {#troubleshooting-not-loading}

- 환경 변수 CUSTOM_OTELCOL_CONFIG_FILE이 올바르게 설정되어 있는지 확인합니다.

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

- 사용자 정의 구성 파일이 /etc/otelcol-contrib/custom.config.yaml에 마운트되어 있는지 확인합니다.

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

- 사용자 정의 구성 내용을 보기 위해 읽을 수 있는지 확인합니다.

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```

### No logs appearing in HyperDX {#no-logs}

- nginx가 JSON 로그를 쓰고 있는지 확인합니다. 
```bash
tail -f /var/log/nginx/access.log
```
- 수집기가 로그를 읽을 수 있는지 확인합니다. 
```bash
docker exec `<container>` cat /var/log/nginx/access.log
```

- 유효한 구성이 filelog 수신기를 포함하는지 확인합니다. 
```bash
docker exec `<container>` cat /etc/otel/supervisor-data/effective.yaml | grep filelog
```

- 수집기 로그에서 오류를 확인합니다.
```bash
docker exec `<container>` cat /etc/otel/supervisor-data/agent.log
```

## Next steps {#next-steps}
더 탐색하고 싶다면 대시보드 실험을 위한 몇 가지 다음 단계를 여기에서 제공하겠습니다.

- 중요한 메트릭(오류 비율, 대기 시간 임계값)에 대한 경고 설정하기
- 특정 사용 사례(API 모니터링, 보안 이벤트)를 위한 추가 대시보드 생성하기

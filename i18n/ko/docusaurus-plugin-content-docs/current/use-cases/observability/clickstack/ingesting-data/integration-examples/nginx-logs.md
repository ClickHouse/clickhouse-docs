---
slug: /use-cases/observability/clickstack/integrations/nginx
title: 'ClickStack를 사용한 Nginx 로그 모니터링'
sidebar_label: 'Nginx 로그'
pagination_prev: null
pagination_next: null
description: 'ClickStack를 사용한 Nginx 모니터링'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/finish-nginx-logs-import.png';
import example_dashboard from '@site/static/images/clickstack/nginx-logs-dashboard.png';
import log_view from '@site/static/images/clickstack/log-view.png';
import search_view from '@site/static/images/clickstack/nginx-logs-search-view.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack로 Nginx 로그 모니터링하기 \{#nginx-clickstack\}

:::note[요약]
이 가이드는 OpenTelemetry collector를 구성하여 Nginx 액세스 로그를 수집하고, 이를 통해 ClickStack으로 Nginx를 모니터링하는 방법을 설명합니다. 다음 내용을 학습하게 됩니다:

- Nginx가 JSON 형식으로 로그를 출력하도록 구성하기
- 로그 수집을 위한 사용자 정의 OTel collector 설정 생성하기
- 사용자 정의 설정으로 ClickStack 배포하기
- 미리 준비된 대시보드를 사용하여 Nginx 메트릭 시각화하기

운영 환경의 Nginx를 구성하기 전에 연동을 테스트하고자 하는 경우, 샘플 로그가 포함된 데모 데이터셋을 사용할 수 있습니다.

소요 시간: 5-10분
:::

## 기존 Nginx와의 통합 \{#existing-nginx\}

이 섹션에서는 기존에 설치된 Nginx에서 로그를 ClickStack으로 전송할 수 있도록 ClickStack OTel collector 구성을 수정하는 방법을 설명합니다.
기존 환경을 구성하기 전에 통합을 먼저 테스트하고자 하는 경우, [다음 섹션](/use-cases/observability/clickstack/integrations/nginx#demo-dataset)에 있는 사전 구성된 환경과 샘플 데이터를 사용해 테스트할 수 있습니다.

##### 사전 요구 사항 \{#prerequisites\}

- 실행 중인 ClickStack 인스턴스
- 기존 Nginx 설치
- Nginx 설정 파일을 수정할 수 있는 권한

<VerticalStepper headerLevel="h4">
  #### Nginx 로그 형식 구성하기

  먼저, 파싱을 용이하게 하기 위해 Nginx가 JSON 형식으로 로그를 출력하도록 구성하세요. nginx.conf에 다음 로그 형식 정의를 추가하세요:

  `nginx.conf` 파일은 일반적으로 다음 위치에 있습니다:

  * **Linux (apt/yum)**: `/etc/nginx/nginx.conf`
  * **macOS (Homebrew)**: `/usr/local/etc/nginx/nginx.conf` 또는 `/opt/homebrew/etc/nginx/nginx.conf`
  * **Docker**: 구성은 보통 볼륨으로 마운트됩니다

  `http` 블록에 다음 로그 형식 정의를 추가하세요:

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

  이 변경 사항을 적용한 후 Nginx를 다시 로드하세요.

  #### 사용자 정의 OTel collector 구성 생성하기

  ClickStack은 사용자 정의 구성 파일을 마운트하고 환경 변수를 설정하여 기본 OpenTelemetry Collector 구성을 확장할 수 있습니다. 사용자 정의 구성은 OpAMP를 통해 HyperDX가 관리하는 기본 구성과 병합됩니다.

  다음 구성으로 nginx-monitoring.yaml이라는 파일을 생성하세요:

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

  이 구성:

  * 표준 경로에서 Nginx 로그를 읽습니다
  * JSON 형식의 로그 항목을 파싱합니다
  * 원본 로그의 타임스탬프를 추출해 보존합니다
  * HyperDX에서 필터링에 사용할 `source: Nginx` 속성을 추가합니다
  * 전용 파이프라인을 통해 로그를 ClickHouse exporter로 전달합니다

  :::note

  * 사용자 정의 구성에서는 새 receiver와 pipeline만 정의하면 됩니다
  * processor(memory&#95;limiter, transform, batch)와 exporter(clickhouse)는 기본 ClickStack 구성에 이미 정의되어 있으므로, 이름으로만 참조하면 됩니다
  * `time_parser` 연산자는 원본 로그의 시간 정보를 보존하기 위해 Nginx의 `time_local` 필드에서 타임스탬프를 추출합니다
  * 파이프라인은 기존 프로세서를 거쳐 리시버에서 ClickHouse exporter로 데이터를 라우팅합니다
    :::

  #### 사용자 지정 구성을 로드하도록 ClickStack 구성하기

  기존 ClickStack 배포에서 사용자 정의 수집기 구성을 활성화하려면 다음을 수행하십시오:

  1. 사용자 정의 구성 파일을 /etc/otelcol-contrib/custom.config.yaml 경로에 마운트하십시오.
  2. 환경 변수 CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE=/etc/otelcol-contrib/custom.config.yaml을 설정합니다.
  3. 수집기가 로그를 읽을 수 있게 Nginx 로그 디렉터리를 마운트합니다

  ##### 옵션 1: Docker Compose

  ClickStack 배포 구성을 업데이트하세요:

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

  ##### 옵션 2: Docker Run (올인원 이미지)

  docker run으로 올인원 이미지를 사용하는 경우:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/log/nginx:/var/log/nginx:ro \
    clickhouse/clickstack-all-in-one:latest
  ```

  :::note
  ClickStack 수집기가 nginx 로그 파일을 읽을 수 있는 적절한 권한을 보유하고 있는지 확인하세요. 프로덕션 환경에서는 읽기 전용 마운트(:ro)를 사용하고 최소 권한 원칙을 준수하세요.
  :::

  #### HyperDX에서 로그 확인

  구성을 완료한 후 HyperDX에 로그인하여 로그가 수집되는지 확인하세요:

  1. 검색 화면으로 이동하십시오
  2. Source를 Logs로 설정한 다음, `request`, `request_time`, `upstream_response_time` 등과 같은 필드를 포함한 로그 항목이 표시되는지 확인합니다.

  다음과 같이 표시됩니다:

  <Image img={search_view} alt="로그 보기" />

  <Image img={log_view} alt="로그 보기" />
</VerticalStepper>

## 데모 데이터셋 {#demo-dataset}

프로덕션 환경을 구성하기 전에 nginx 통합을 테스트하려는 사용자를 위해, 실제와 유사한 트래픽 패턴을 가진 사전 생성 nginx 액세스 로그 샘플 데이터셋을 제공합니다.

<VerticalStepper headerLevel="h4">

#### 샘플 데이터셋 다운로드 \{#download-sample\}

```bash
# 로그 다운로드
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/access.log
```

이 데이터셋에는 다음이 포함됩니다:
- 실제와 유사한 트래픽 패턴을 가진 로그 항목
- 다양한 엔드포인트와 HTTP 메서드
- 성공한 요청과 오류가 혼합된 데이터
- 실제와 유사한 응답 시간 및 바이트 수

#### 테스트 Collector 구성 생성 \{#test-config\}

다음 내용을 사용하여 `nginx-demo.yaml`이라는 파일을 생성합니다:

```yaml
cat > nginx-demo.yaml << 'EOF'
receivers:
  filelog:
    include:
      - /tmp/nginx-demo/access.log
    start_at: beginning  # 데모 데이터의 처음부터 읽기
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

#### 데모 구성으로 ClickStack 실행 {#run-demo}

데모 로그와 구성을 사용하여 ClickStack을 실행합니다:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/nginx-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/access.log:/tmp/nginx-demo/access.log:ro" \
  clickhouse/clickstack-all-in-one:latest
```

#### HyperDX에서 로그 확인 {#verify-demo-logs}

ClickStack이 실행되면 다음을 수행합니다:

1. [HyperDX](http://localhost:8080/)를 열고 계정에 로그인합니다(먼저 계정을 생성해야 할 수 있습니다)
2. Search 뷰로 이동하여 source를 `Logs`로 설정합니다
3. 시간 범위를 **2025-10-19 11:00:00 - 2025-10-22 11:00:00**으로 설정합니다

Search 뷰에서 다음과 같은 화면이 표시됩니다:

:::note[Timezone Display]
HyperDX는 브라우저의 로컬 시간대를 기준으로 타임스탬프를 표시합니다. 데모 데이터는 2025-10-20 11:00:00 - 2025-10-21 11:00:00 UTC 구간에 해당합니다. 넓은 시간 범위를 사용하면 위치와 관계없이 데모 로그를 확인할 수 있습니다. 로그가 표시되면, 더 명확한 시각화를 위해 범위를 24시간으로 좁힐 수 있습니다.
:::

<Image img={search_view} alt="로그 뷰"/>

<Image img={log_view} alt="로그 뷰"/>

</VerticalStepper>

## 대시보드 및 시각화 {#dashboards}

ClickStack으로 nginx 모니터링을 시작하는 데 도움이 되도록, Nginx 로그를 위한 핵심 시각화를 제공합니다.

<VerticalStepper headerLevel="h4">

#### 대시보드 구성 파일을 <TrackedLink href={useBaseUrl('/examples/nginx-logs-dashboard.json')} download="nginx-logs-dashboard.json" eventName="docs.nginx_logs_monitoring.dashboard_download">다운로드</TrackedLink> {#download}

#### 사전 구성된 대시보드 가져오기 \{#import-dashboard\}
1. HyperDX를 열고 Dashboards 섹션으로 이동합니다.
2. 오른쪽 상단의 줄임표 메뉴에서 「Import Dashboard」를 클릭합니다.

<Image img={import_dashboard} alt="Import Dashboard"/>

3. nginx-logs-dashboard.json 파일을 업로드하고 「Finish Import」를 클릭합니다.

<Image img={finish_import} alt="Finish Import"/>

#### 모든 시각화가 미리 구성된 상태로 대시보드가 생성됩니다 \{#created-dashboard\}

:::note
데모 데이터셋에서는 시간 범위를 **2025-10-20 11:00:00 - 2025-10-21 11:00:00 (UTC)** 로 설정하십시오(로컬 시간대에 맞게 조정할 수 있습니다). 가져온 대시보드는 기본적으로 시간 범위가 지정되어 있지 않습니다.
:::

<Image img={example_dashboard} alt="Example Dashboard"/>

</VerticalStepper>

## 문제 해결 {#troubleshooting}

### 사용자 지정 구성이 로드되지 않음

* 환경 변수 CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE이 올바르게 설정되어 있는지 확인하십시오

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

* 사용자 정의 구성 파일이 /etc/otelcol-contrib/custom.config.yaml 경로에 마운트되어 있는지 확인하십시오

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

* 사용자 정의 구성 내용을 열어 사람이 읽을 수 있는지 확인하십시오

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```


### HyperDX에 로그가 표시되지 않는 경우

* nginx에서 JSON 형식으로 로그를 남기고 있는지 확인하십시오

```bash
tail -f /var/log/nginx/access.log
```

* 컬렉터가 로그를 정상적으로 읽을 수 있는지 확인하십시오

```bash
docker exec `<container>` cat /var/log/nginx/access.log
```

* 실제 적용 중인 구성에 filelog 수신기가 포함되어 있는지 확인합니다

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/effective.yaml | grep filelog
```

* 수집기 로그에 오류가 있는지 확인하십시오

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/agent.log
```


## 다음 단계 {#next-steps}

더 살펴보고 싶다면, 대시보드를 활용하여 다음과 같은 작업을 추가로 시도해 볼 수 있습니다.

- 중요 메트릭(에러율, 지연 시간 임계값)에 대한 알림을 설정해 보십시오.
- 특정 사용 사례(API 모니터링, 보안 이벤트)에 대한 추가 대시보드를 생성해 보십시오.
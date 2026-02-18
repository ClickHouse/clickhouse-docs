---
slug: /use-cases/observability/clickstack/integrations/systemd-logs
title: 'ClickStack를 사용한 Systemd 로그 모니터링'
sidebar_label: 'Systemd/Journald 로그'
pagination_prev: null
pagination_next: null
description: 'ClickStack를 사용한 Systemd 및 Journald 로그 모니터링'
doc_type: 'guide'
keywords: ['systemd', 'journald', 'journal', 'OTEL', 'ClickStack', '시스템 로그', 'systemctl']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/systemd/finish-import-systemd.png';
import example_dashboard from '@site/static/images/clickstack/systemd/systemd-logs-dashboard.png';
import search_view from '@site/static/images/clickstack/systemd/systemd-search-view.png';
import log_view from '@site/static/images/clickstack/systemd/systemd-log-view.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack으로 Systemd 로그 모니터링하기 \{#systemd-logs-clickstack\}

:::note[요약]
이 가이드는 OpenTelemetry Collector를 `journald` receiver와 함께 실행하여 ClickStack으로 systemd 저널 로그를 모니터링하는 방법을 설명합니다. 다음 내용을 학습하게 됩니다:

- OpenTelemetry Collector를 배포하여 systemd 저널 항목을 읽는 방법
- OTLP를 통해 systemd 로그를 ClickStack으로 전송하는 방법
- 미리 구성된 대시보드를 사용해 systemd 로그 통찰(서비스 상태, 오류, 인증 이벤트)을 시각화하는 방법

프로덕션 시스템을 구성하기 전에 통합을 테스트하려는 경우 사용할 수 있는 샘플 로그가 포함된 데모 데이터 세트가 제공됩니다.

소요 시간: 10–15분
:::

## 기존 시스템과의 통합 \{#existing-systems\}

OpenTelemetry Collector를 journald receiver와 함께 실행하여 기존 Linux 시스템의 journald 로그를 모니터링하고, 시스템 로그를 수집해 OTLP를 통해 ClickStack으로 전송합니다.

기존 설정을 변경하지 않고 먼저 이 통합을 테스트해 보고 싶다면 [데모 데이터 세트 섹션](#demo-dataset)으로 이동하십시오.

##### 사전 준비 사항 \{#prerequisites\}

- ClickStack 인스턴스가 실행 중일 것
- systemd를 사용하는 Linux 시스템 (Ubuntu 16.04+, CentOS 7+, Debian 8+)
- 모니터링 대상 시스템에 Docker 또는 Docker Compose가 설치되어 있을 것

<VerticalStepper headerLevel="h4">

#### ClickStack API key 가져오기 \{#get-api-key\}

OpenTelemetry Collector는 인증이 필요한 ClickStack의 OTLP 엔드포인트로 데이터를 전송합니다.

1. ClickStack URL에서 HyperDX를 엽니다 (예: http://localhost:8080)
2. 필요하다면 계정을 생성하거나 로그인합니다.
3. **Team Settings → API Keys**로 이동합니다.
4. **Ingestion API Key**를 복사합니다.

<Image img={api_key} alt="ClickStack API Key"/>

5. 복사한 값을 환경 변수로 설정합니다:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

#### systemd journal 실행 여부 확인 \{#verify-systemd\}

시스템이 systemd를 사용하고 있으며 journal 로그가 존재하는지 확인합니다:

```bash
# systemd 버전 확인
systemctl --version

# 최근 journal 항목 보기
journalctl -n 20

# journal 디스크 사용량 확인
journalctl --disk-usage
```

journal 저장소가 메모리 전용인 경우, 영구 저장을 활성화합니다:

```bash
sudo mkdir -p /var/log/journal
sudo systemd-tmpfiles --create --prefix /var/log/journal
sudo systemctl restart systemd-journald
```

#### OpenTelemetry Collector 설정 생성 \{#create-otel-config\}

OpenTelemetry Collector용 설정 파일을 생성합니다:

```yaml
cat > otel-config.yaml << 'EOF'
receivers:
  journald:
    directory: /var/log/journal
    priority: info
    units:
      - sshd
      - nginx
      - docker
      - containerd
      - systemd

processors:
  batch:
    timeout: 10s
    send_batch_size: 1024
  
  resource:
    attributes:
      - key: service.name
        value: systemd-logs
        action: insert
      - key: host.name
        from_attribute: _HOSTNAME
        action: upsert
  
  attributes:
    actions:
      - key: unit
        from_attribute: _SYSTEMD_UNIT
        action: upsert
      - key: priority
        from_attribute: PRIORITY
        action: upsert

exporters:
  otlphttp:
    endpoint: ${CLICKSTACK_ENDPOINT}
    headers:
      authorization: ${CLICKSTACK_API_KEY}

service:
  pipelines:
    logs:
      receivers: [journald]
      processors: [resource, attributes, batch]
      exporters: [otlphttp]
EOF
```

#### Docker Compose로 배포 \{#deploy-docker-compose\}

:::note
`journald` receiver는 journal 파일을 읽기 위해 `journalctl` 바이너리가 필요합니다. 공식 `otel/opentelemetry-collector-contrib` 이미지는 기본적으로 `journalctl`을 포함하지 않습니다.

컨테이너 기반 배포의 경우 collector를 호스트에 직접 설치하거나 systemd 유틸리티가 포함된 커스텀 이미지를 빌드할 수 있습니다. 자세한 내용은 [문제 해결 섹션](#journalctl-not-found)을 참고하십시오.
:::

다음 예시는 ClickStack과 함께 OTel Collector를 배포하는 방법을 보여줍니다:

```yaml
services:
  clickstack:
    image: clickhouse/clickstack-all-in-one:latest
    ports:
      - "8080:8080"
      - "4317:4317"
      - "4318:4318"
    networks:
      - monitoring
  
  otel-collector:
    image: otel/opentelemetry-collector-contrib:0.115.1
    depends_on:
      - clickstack
    environment:
      - CLICKSTACK_API_KEY=${CLICKSTACK_API_KEY}
      - CLICKSTACK_ENDPOINT=http://clickstack:4318
    volumes:
      - ./otel-config.yaml:/etc/otelcol/config.yaml:ro
      - /var/log/journal:/var/log/journal:ro
      - /run/log/journal:/run/log/journal:ro
      - /etc/machine-id:/etc/machine-id:ro
    command: ["--config=/etc/otelcol/config.yaml"]
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge
```

서비스를 시작합니다:

```bash
docker compose up -d
```

#### HyperDX에서 로그 확인 \{#verifying-logs\}

구성이 완료되면 HyperDX에 로그인하여 로그가 정상적으로 수집되는지 확인합니다:

1. 「Search」 뷰로 이동합니다.
2. 「Source」를 「Logs」로 설정합니다.
3. `service.name:systemd-logs`로 필터링합니다.
4. `unit`, `priority`, `MESSAGE`, `_HOSTNAME`와 같은 필드를 포함한 구조화된 로그 항목이 표시됩니다.

<Image img={search_view} alt="로그 검색 뷰"/>

<Image img={log_view} alt="로그 뷰"/>

</VerticalStepper>

## 데모 데이터 세트 \{#demo-dataset\}

프로덕션 시스템을 구성하기 전에 systemd 로그 연동을 테스트하려는 사용자를 위해, 현실적인 패턴을 반영한 미리 생성된 systemd 로그 샘플 데이터 세트를 제공합니다.

<VerticalStepper headerLevel="h4">

#### 샘플 데이터 세트 다운로드 \{#download-sample\}

샘플 로그 파일을 다운로드합니다:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/systemd/systemd-demo.log
```

#### 데모 수집기 구성 파일 생성 \{#demo-config\}

데모용 구성 파일을 생성합니다:

```bash
cat > systemd-demo.yaml << 'EOF'
receivers:
  filelog:
    include:
      - /tmp/systemd-demo/systemd-demo.log
    start_at: beginning
    operators:
      - type: regex_parser
        regex: '^(?P<timestamp>\S+) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
        parse_from: body
        parse_to: attributes
      - type: time_parser
        parse_from: attributes.timestamp
        layout: '%Y-%m-%dT%H:%M:%S%z'
      - type: add
        field: attributes.source
        value: "systemd-demo"

service:
  pipelines:
    logs/systemd-demo:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

#### 데모 데이터로 ClickStack 실행 \{#run-demo\}

데모 로그와 함께 ClickStack을 실행합니다:

```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/systemd-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/systemd-demo.log:/tmp/systemd-demo/systemd-demo.log:ro" \
  clickhouse/clickstack-all-in-one:latest
```

:::note
이 데모에서는 컨테이너 안에 `journalctl`이 필요 없도록 `journald` 대신 텍스트 로그와 함께 `filelog` receiver를 사용합니다.
:::

#### HyperDX에서 로그 확인 \{#verify-demo-logs\}

ClickStack이 실행되면 다음을 수행합니다.

1. [HyperDX](http://localhost:8080/)를 열고 계정에 로그인합니다.
2. Search 보기로 이동한 뒤 소스를 `Logs`로 설정합니다.
3. 시간 범위를 **2025-11-14 00:00:00 - 2025-11-17 00:00:00**으로 설정합니다.

<Image img={search_view} alt="로그 검색 화면"/>

<Image img={log_view} alt="로그 뷰"/>

:::note[시간대 표시]
HyperDX는 브라우저의 로컬 시간대에 맞춰 타임스탬프를 표시합니다. 데모 데이터는 **2025-11-15 00:00:00 - 2025-11-16 00:00:00 (UTC)** 구간에 걸쳐 있습니다. 넓은 시간 범위를 설정하면 사용자의 위치와 관계없이 데모 로그를 확인할 수 있습니다.
:::

</VerticalStepper>

## 대시보드와 시각화 \{#dashboards\}

ClickStack으로 systemd 로그 모니터링을 시작할 수 있도록, systemd journal 데이터에 대한 기본적인 시각화를 제공합니다.

<VerticalStepper headerLevel="h4">

#### 대시보드 구성 파일을 <TrackedLink href={useBaseUrl('/examples/systemd-logs-dashboard.json')} download="systemd-logs-dashboard.json" eventName="docs.systemd_logs_monitoring.dashboard_download">다운로드</TrackedLink>합니다 \{#download\}

#### 미리 준비된 대시보드를 가져옵니다 \{#import-dashboard\}

1. HyperDX를 열고 Dashboards 섹션으로 이동합니다.
2. 오른쪽 상단의 줄임표 메뉴에서 **Import Dashboard**를 클릭합니다.

<Image img={import_dashboard} alt="대시보드 가져오기 버튼"/>

3. `systemd-logs-dashboard.json` 파일을 업로드하고 **Finish Import**를 클릭합니다.

<Image img={finish_import} alt="가져오기 완료"/>

#### 대시보드를 확인합니다 \{#created-dashboard\}

이 대시보드에는 다음과 같은 시각화가 포함됩니다:
- 시간 경과에 따른 로그량
- 로그 개수 기준 상위 systemd 유닛
- SSH 인증 이벤트
- 서비스 장애
- 오류 비율

<Image img={example_dashboard} alt="예시 대시보드"/>

:::note
데모 데이터셋의 경우, 시간 범위를 **2025-11-15 00:00:00 - 2025-11-16 00:00:00 (UTC)**로 설정하십시오(로컬 시간대에 따라 조정하십시오).
:::

</VerticalStepper>

## 문제 해결 \{#troubleshooting\}

### HyperDX에 로그가 표시되지 않습니다 \{#no-logs\}

로그가 ClickHouse로 전송되고 있는지 확인하십시오:

```bash
docker exec clickstack clickhouse-client --query "
SELECT COUNT(*) as log_count
FROM otel_logs
WHERE ServiceName = 'systemd-logs'
"
```

결과가 없으면 컬렉터 로그를 확인하십시오.

```bash
docker logs otel-collector | grep -i "error\|journald" | tail -20
```


### journalctl not found 오류 \{#journalctl-not-found\}

`exec: "journalctl": executable file not found in $PATH` 메시지가 표시되면:

`otel/opentelemetry-collector-contrib` 이미지는 `journalctl`을 포함하지 않습니다. 다음 두 가지 중 하나를 수행할 수 있습니다.

1. **호스트에 collector를 설치**:

```bash
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.115.0/otelcol-contrib_0.115.0_linux_amd64.tar.gz
tar -xzf otelcol-contrib_0.115.0_linux_amd64.tar.gz
sudo mv otelcol-contrib /usr/local/bin/
otelcol-contrib --config=otel-config.yaml
```

2. journald 내보내기 파일을 `filelog` 리시버로 읽는 **텍스트 내보내기 방식**(데모와 유사)을 사용합니다


## 프로덕션 환경으로 전환하기 \{#going-to-production\}

이 가이드는 별도의 OpenTelemetry Collector를 사용하여 systemd 로그를 읽고 ClickStack의 OTLP 엔드포인트로 전송하며, 이는 프로덕션 환경에서 권장되는 패턴입니다.

여러 호스트가 있는 프로덕션 환경에서는 다음 옵션을 고려하십시오.

- Kubernetes에서 수집기를 데몬셋으로 배포
- 각 호스트에서 수집기를 systemd 서비스로 실행
- 자동 배포를 위해 OpenTelemetry Operator를 사용

프로덕션 배포 패턴은 [OpenTelemetry로 수집하기](/use-cases/observability/clickstack/ingesting-data/opentelemetry)를 참조하십시오.
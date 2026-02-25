---
slug: /use-cases/observability/clickstack/integrations/host-logs/ec2
title: 'ClickStack를 사용한 EC2 호스트 로그 모니터링'
sidebar_label: 'EC2 호스트 로그'
pagination_prev: null
pagination_next: null
description: 'ClickStack를 사용한 EC2 호스트 로그 모니터링'
doc_type: 'guide'
keywords: ['EC2', 'AWS', '호스트 로그', 'systemd', 'syslog', 'OTel', 'ClickStack', '시스템 모니터링', '클라우드 메타데이터']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import search_view from '@site/static/images/clickstack/host-logs/ec2/search-view.png';
import log_view from '@site/static/images/clickstack/host-logs/ec2/log-view.png';
import search_view_demo from '@site/static/images/clickstack/host-logs/ec2/search-view-demo.png';
import log_view_demo from '@site/static/images/clickstack/host-logs/ec2/log-view-demo.png';
import logs_dashboard from '@site/static/images/clickstack/host-logs/host-logs-dashboard.png';
import finish_import from '@site/static/images/clickstack/host-logs/import-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# ClickStack로 EC2 호스트 로그 모니터링 \{#ec2-host-logs-clickstack\}

:::note[요약]
인스턴스에 OpenTelemetry Collector를 설치하여 ClickStack을 사용해 EC2 시스템 로그를 모니터링할 수 있습니다. Collector는 EC2 메타데이터(인스턴스 ID, 리전, 가용 영역, 인스턴스 유형)를 로그에 자동으로 추가합니다. 이 안내서에서는 다음 내용을 다룹니다:

- EC2 인스턴스에 OpenTelemetry Collector를 설치하고 구성하는 방법
- EC2 메타데이터를 사용해 로그를 자동으로 보강하는 방법
- OTLP를 통해 로그를 ClickStack으로 전송하는 방법
- 미리 구축된 대시보드를 사용해 클라우드 컨텍스트와 함께 EC2 호스트 로그를 시각화하는 방법

샘플 로그와 시뮬레이션된 EC2 메타데이터를 포함한 데모 데이터셋이 테스트용으로 제공됩니다.

소요 시간: 10-15분
:::

## 기존 EC2 인스턴스와의 통합 \{#existing-ec2\}

이 섹션에서는 EC2 인스턴스에 OpenTelemetry Collector를 설치하여 시스템 로그를 수집하고, EC2 메타데이터를 자동으로 보강한 뒤 ClickStack으로 전송하는 방법을 다룹니다. 이 분산 아키텍처는 프로덕션 환경에 바로 사용할 수 있으며 여러 인스턴스로 확장 가능합니다.

:::note[동일한 EC2 인스턴스에서 ClickStack을 실행 중인 경우]
모니터링하려는 로그가 있는 EC2 인스턴스에서 ClickStack을 함께 실행 중이라면, [Generic Host Logs 가이드](/use-cases/observability/clickstack/integrations/host-logs)와 유사한 올인원(all-in-one) 접근 방식을 사용할 수 있습니다. `/var/log`를 ClickStack 컨테이너에 마운트하고, 사용자 정의 구성에 `resourcedetection` processor를 추가하여 EC2 메타데이터를 자동으로 수집하십시오. 이 가이드는 프로덕션 배포에서 보다 일반적인 분산 아키텍처에 초점을 맞춥니다.
:::

프로덕션 인스턴스를 구성하기 전에 EC2 호스트 로그 통합을 먼저 테스트하려면, ["Demo dataset"](/use-cases/observability/clickstack/integrations/host-logs/ec2#demo-dataset) 섹션에서 미리 구성된 설정과 샘플 데이터를 사용하여 테스트할 수 있습니다.

##### 사전 준비 사항 \{#prerequisites\}

- 실행 중인 ClickStack 인스턴스(온프레미스, Cloud, 로컬 환경 모두 가능)
- 실행 중인 EC2 인스턴스(Ubuntu, Amazon Linux 또는 기타 Linux 배포판)
- EC2 인스턴스에서 ClickStack의 OTLP 엔드포인트로의 네트워크 연결(HTTP의 경우 포트 4318, gRPC의 경우 포트 4317)
- EC2 인스턴스 메타데이터 서비스에 대한 접근이 가능한 상태(기본적으로 활성화됨)

<VerticalStepper headerLevel="h4">
  #### EC2 메타데이터 접근 가능 여부 확인하기

  EC2 인스턴스에서 메타데이터 서비스에 접근할 수 있는지 확인하세요:

  ```bash
  # Get metadata token (IMDSv2)
  TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

  # Verify instance metadata
  curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id
  curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/region
  curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-type
  ```

  인스턴스 ID, 리전, 인스턴스 유형이 표시됩니다. 명령이 실패할 경우 다음을 확인하세요:

  * 인스턴스 메타데이터 서비스가 활성화되어 있어야 합니다
  * IMDSv2는 보안 그룹이나 네트워크 ACL에 의해 차단되지 않습니다.
  * 이 명령들은 EC2 인스턴스 자체에서 실행해야 합니다

  :::note
  EC2 메타데이터는 인스턴스 내부에서 `http://169.254.169.254`를 통해 사용할 수 있습니다. OpenTelemetry `resourcedetection` 프로세서는 이 엔드포인트를 사용하여 로그에 클라우드 컨텍스트를 자동으로 추가합니다.
  :::

  #### syslog 파일 존재 여부 확인

  EC2 인스턴스가 syslog 파일을 기록하고 있는지 확인하세요:

  ```bash
  # Ubuntu instances
  ls -la /var/log/syslog

  # Amazon Linux / RHEL instances
  ls -la /var/log/messages

  # View recent entries
  tail -20 /var/log/syslog
  # or
  tail -20 /var/log/messages
  ```

  #### OpenTelemetry Collector 설치하기

  EC2 인스턴스에 OpenTelemetry Collector Contrib 배포판을 설치하세요:

  ```bash
  # Download the latest release
  wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.114.0/otelcol-contrib_0.114.0_linux_amd64.tar.gz

  # Extract and install
  tar -xvf otelcol-contrib_0.114.0_linux_amd64.tar.gz
  sudo mv otelcol-contrib /usr/local/bin/

  # Verify installation
  otelcol-contrib --version
  ```

  #### 수집기 구성 생성하기

  `/etc/otelcol-contrib/config.yaml` 경로에 OpenTelemetry Collector 구성 파일을 생성하세요:

  ```bash
  sudo mkdir -p /etc/otelcol-contrib
  ```

  사용 중인 Linux 배포판에 맞는 구성을 선택하세요:

  <Tabs groupId="os-type">
    <TabItem value="modern-linux" label="최신 Linux (Ubuntu 24.04+)" default>
      ```yaml
      sudo tee /etc/otelcol-contrib/config.yaml > /dev/null << 'EOF'
      receivers:
        filelog/syslog:
          include:
            - /var/log/syslog
            - /var/log/**/*.log
          start_at: end
          operators:
            - type: regex_parser
              regex: '^(?P<timestamp>\S+) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
              parse_from: body
              parse_to: attributes
            
            - type: time_parser
              parse_from: attributes.timestamp
              layout_type: gotime
              layout: '2006-01-02T15:04:05.999999-07:00'
            
            - type: add
              field: attributes.source
              value: "ec2-host-logs"

      processors:
        resourcedetection:
          detectors: [ec2, system]
          timeout: 5s
          override: false
          ec2:
            tags:
              - ^Name
              - ^Environment
              - ^Team
        
        batch:
          timeout: 10s
          send_batch_size: 1024

      exporters:
        otlphttp:
          endpoint: "http://YOUR_CLICKSTACK_HOST:4318"
          headers:
            authorization: "${env:CLICKSTACK_API_KEY}"

      service:
        pipelines:
          logs:
            receivers: [filelog/syslog]
            processors: [resourcedetection, batch]
            exporters: [otlphttp]
      EOF
      ```
    </TabItem>

    <TabItem value="legacy-linux" label="레거시 Linux (Amazon Linux 2, RHEL, 이전 Ubuntu 버전)">
      ```yaml
      sudo tee /etc/otelcol-contrib/config.yaml > /dev/null << 'EOF'
      receivers:
        filelog/syslog:
          include:
            - /var/log/messages
            - /var/log/**/*.log
          start_at: end
          operators:
            - type: regex_parser
              regex: '^(?P<timestamp>\w+ \d+ \d{2}:\d{2}:\d{2}) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
              parse_from: body
              parse_to: attributes
            
            - type: time_parser
              parse_from: attributes.timestamp
              layout: '%b %d %H:%M:%S'
            
            - type: add
              field: attributes.source
              value: "ec2-host-logs"

      processors:
        resourcedetection:
          detectors: [ec2, system]
          timeout: 5s
          override: false
          ec2:
            tags:
              - ^Name
              - ^Environment
              - ^Team
        
        batch:
          timeout: 10s
          send_batch_size: 1024

      exporters:
        otlphttp:
          endpoint: "http://YOUR_CLICKSTACK_HOST:4318"
          headers:
            authorization: "${env:CLICKSTACK_API_KEY}"

      service:
        pipelines:
          logs:
            receivers: [filelog/syslog]
            processors: [resourcedetection, batch]
            exporters: [otlphttp]
      EOF
      ```
    </TabItem>
  </Tabs>

  <br />

  **구성에서 다음을 교체하세요:**

  * `YOUR_CLICKSTACK_HOST`: ClickStack가 실행되고 있는 호스트명 또는 IP 주소
  * 로컬 테스트 시 SSH 터널을 사용할 수 있습니다(자세한 내용은 [문제 해결](#troubleshooting) 섹션을 참조하십시오).

  이 구성:

  * 표준 위치(Ubuntu의 `/var/log/syslog`, Amazon Linux/RHEL의 `/var/log/messages`)에서 시스템 로그 파일을 읽습니다.
  * syslog 형식을 파싱하여 구조화된 필드(타임스탬프, 호스트 이름, 유닛/서비스, PID, 메시지)를 추출합니다.
  * `resourcedetection` 프로세서를 사용하여 **EC2 메타데이터를 자동으로 감지하고 추가합니다**
  * 해당 태그가 있는 경우 EC2 태그(Name, Environment, Team)를 선택적으로 포함합니다
  * OTLP over HTTP를 통해 로그를 ClickStack으로 전송합니다

  :::note[EC2 메타데이터 보강]
  `resourcedetection` 프로세서는 모든 로그에 다음 속성을 자동으로 추가합니다:

  * `cloud.provider`: &quot;aws&quot;
  * `cloud.platform`: &quot;aws&#95;ec2&quot;
  * `cloud.region`: AWS 리전 (예: &quot;us-east-1&quot;)
  * `cloud.availability_zone`: AZ (예: &quot;us-east-1a&quot;)
  * `cloud.account.id`: AWS 계정 ID
  * `host.id`: EC2 인스턴스 ID (예: &quot;i-1234567890abcdef0&quot;)
  * `host.type`: 인스턴스 유형 (예: &quot;t3.medium&quot;)
  * `host.name`: 인스턴스의 호스트 이름
    :::

  #### ClickStack API 키 설정

  ClickStack API 키를 환경 변수로 내보내세요:

  ```bash
  export CLICKSTACK_API_KEY="your-api-key-here"
  ```

  재부팅 후에도 유지되도록 하려면 셸 프로필에 추가하세요:

  ```bash
  echo 'export CLICKSTACK_API_KEY="your-api-key-here"' >> ~/.bashrc
  source ~/.bashrc
  ```

  #### 컬렉터 실행하기

  OpenTelemetry Collector를 시작하세요:

  ```bash
  CLICKSTACK_API_KEY="your-api-key-here" /usr/local/bin/otelcol-contrib --config /etc/otelcol-contrib/config.yaml
  ```

  :::note[프로덕션 환경 사용 시]
  부팅 시 자동으로 시작되고 장애 발생 시 재시작되도록 collector를 systemd 서비스로 실행하도록 구성하세요. 자세한 내용은 [OpenTelemetry Collector 문서](https://opentelemetry.io/docs/collector/deployment/)를 참조하세요.
  :::

  #### HyperDX에서 로그 확인

  수집기가 실행되면 HyperDX에 로그인하여 EC2 메타데이터가 포함된 로그가 정상적으로 수집되는지 확인하십시오:

  1. 검색 화면으로 이동하십시오
  2. Source 값을 `Logs`로 설정하십시오
  3. `source:ec2-host-logs`로 필터링하십시오
  4. 로그 항목을 클릭하여 펼쳐 보십시오
  5. 리소스 속성에 EC2 메타데이터가 표시되는지 확인하십시오.
     * `cloud.provider`
     * `cloud.region`
     * `host.id` (인스턴스 ID)
     * `host.type` (인스턴스 유형)
     * `cloud.availability_zone`

  <Image img={search_view} alt="EC2 로그 검색 화면" />

  <Image img={log_view} alt="메타데이터를 포함한 EC2 로그 상세 정보" />
</VerticalStepper>

## 데모 데이터세트 {#demo-dataset}

프로덕션 인스턴스를 구성하기 전에 EC2 호스트 로그 연동을 시험해 보고자 하는 사용자를 위해 시뮬레이션된 EC2 메타데이터가 포함된 샘플 데이터세트를 제공합니다.

<VerticalStepper headerLevel="h4">
  #### 샘플 데이터셋 다운로드하기

  샘플 로그 파일을 다운로드하세요:

  ```bash
  curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/host-logs/journal.log
  ```

  데이터셋에는 다음이 포함됩니다:

  * 시스템 부팅 순서
  * SSH 로그인 활동(성공 및 실패한 접속 시도)
  * 보안 인시던트(무차별 대입 공격에 대한 fail2ban 대응)
  * 정기 유지 관리(cron 작업, anacron)
  * 서비스 재시작 (rsyslog)
  * 커널 메시지 및 방화벽 활동 로그
  * 일반 운영 로그와 주요 이벤트가 섞여 있는 데이터

  #### 테스트 수집기 구성 생성하기

  다음 구성으로 `ec2-host-logs-demo.yaml` 파일을 생성하세요:

  ```yaml
  cat > ec2-host-logs-demo.yaml << 'EOF'
  receivers:
    filelog/journal:
      include:
        - /tmp/host-demo/journal.log
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
          value: "ec2-demo"

  processors:
    # Simulate EC2 metadata for demo (no real EC2 instance required)
    resource:
      attributes:
        - key: service.name
          value: "ec2-demo"
          action: insert
        - key: cloud.provider
          value: "aws"
          action: insert
        - key: cloud.platform
          value: "aws_ec2"
          action: insert
        - key: cloud.region
          value: "us-east-1"
          action: insert
        - key: cloud.availability_zone
          value: "us-east-1a"
          action: insert
        - key: host.id
          value: "i-0abc123def456789"
          action: insert
        - key: host.type
          value: "t3.medium"
          action: insert
        - key: host.name
          value: "prod-web-01"
          action: insert

  service:
    pipelines:
      logs/ec2-demo:
        receivers: [filelog/journal]
        processors:
          - resource
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  EOF
  ```

  :::note
  데모 목적으로 `resource` 프로세서를 사용하여 EC2 메타데이터를 수동으로 추가합니다. 실제 EC2 인스턴스가 있는 프로덕션 환경에서는 EC2 메타데이터 API를 자동으로 조회하는 `resourcedetection` 프로세서를 사용하세요.
  :::

  #### 데모 구성으로 ClickStack 실행

  데모 로그 및 구성을 사용하여 ClickStack을 실행하세요:

  ```bash
  docker run --name clickstack-demo \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/ec2-host-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v "$(pwd)/journal.log:/tmp/host-demo/journal.log:ro" \
    docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
  ```

  #### HyperDX에서 로그 확인하기

  컬렉터가 실행되고 나면:

  1. [HyperDX](http://localhost:8080/)를 열고 계정에 로그인합니다(먼저 계정을 생성해야 할 수도 있습니다)
  2. 검색 화면으로 이동한 다음 소스를 `Logs`로 설정합니다.
  3. 시간 범위를 **2025-11-10 00:00:00 - 2025-11-13 00:00:00**로 설정하십시오
  4. `source:ec2-demo`로 필터링하세요
  5. 리소스 속성에서 EC2 메타데이터를 확인하려면 로그 항목을 확장하십시오

  <Image img={search_view_demo} alt="EC2 로그 검색 화면" />

  <Image img={log_view_demo} alt="메타데이터가 포함된 EC2 로그 세부 정보" />

  :::note[타임존 표시]
  HyperDX는 브라우저의 로컬 타임존으로 타임스탬프를 표시합니다. 데모 데이터는 **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)** 기간을 포함합니다. 넓은 시간 범위로 인해 위치에 관계없이 데모 로그를 확인할 수 있습니다. 로그를 확인한 후에는 더 명확한 시각화를 위해 범위를 24시간으로 좁히십시오.
  :::

  시뮬레이션된 EC2 컨텍스트가 포함된 로그를 확인할 수 있으며, 여기에는 다음이 포함됩니다:

  * 인스턴스 ID: `i-0abc123def456789`
  * 리전: `us-east-1`
  * 가용 영역(Availability Zone): `us-east-1a`
  * 인스턴스 유형: `t3.medium`
</VerticalStepper>

## 대시보드와 시각화 {#dashboards}

ClickStack으로 EC2 호스트 로그 모니터링을 시작할 수 있도록, 클라우드 컨텍스트가 포함된 기본 시각화를 제공합니다.

<VerticalStepper headerLevel="h4">

#### 대시보드 구성 파일을 <TrackedLink href={useBaseUrl('/examples/host-logs-dashboard.json')} download="host-logs-dashboard.json" eventName="docs.ec2_host_logs_monitoring.dashboard_download">다운로드</TrackedLink>합니다 \{#download\}

#### 사전 구성된 대시보드를 가져옵니다 \{#import-dashboard\}

1. HyperDX를 열고 Dashboards 섹션으로 이동합니다.
2. 오른쪽 상단의 줄임표(…​) 메뉴에서 **Import Dashboard**를 클릭합니다.

<Image img={import_dashboard} alt="대시보드 가져오기 버튼"/>

3. `host-logs-dashboard.json` 파일을 업로드하고 **Finish Import**를 클릭합니다.

<Image img={finish_import} alt="가져오기 완료"/>

#### 대시보드를 확인합니다 \{#created-dashboard\}

대시보드는 모든 시각화가 사전 구성된 상태로 생성됩니다.

<Image img={logs_dashboard} alt="EC2 로그 대시보드"/>

EC2 컨텍스트별로 대시보드 시각화를 필터링할 수 있습니다.
- `cloud.region:us-east-1` - 특정 리전의 로그만 표시합니다.
- `host.type:t3.medium` - 인스턴스 타입별로 필터링합니다.
- `host.id:i-0abc123def456` - 특정 인스턴스의 로그만 표시합니다.

:::note
데모 데이터셋을 사용하는 경우, 시간 범위를 **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)** 로 설정하십시오(로컬 시간대에 맞게 조정). 가져온 대시보드는 기본적으로 시간 범위가 지정되어 있지 않습니다.
:::

</VerticalStepper>

## 문제 해결 {#troubleshooting}

### 로그에 EC2 메타데이터가 나타나지 않음

**EC2 메타데이터 서비스에 접근할 수 있는지 확인하십시오.**

```bash
# Get metadata token
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# Test metadata endpoint
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id
```

이 과정이 실패하면 다음을 확인하십시오:

* 인스턴스 메타데이터 서비스가 활성화되어 있는지
* IMDSv2가 보안 그룹에 의해 차단되지 않았는지
* 수집기를 EC2 인스턴스 자체에서 실행 중인지

**메타데이터 관련 오류가 있는지 수집기 로그를 확인하십시오.**

```bash
# If running as systemd service
sudo journalctl -u otelcol-contrib -f | grep -i "ec2\|metadata\|resourcedetection"

# If running in foreground, check stdout
```


### HyperDX에 로그가 표시되지 않습니다

**syslog 파일이 존재하고 실제로 기록되고 있는지 확인하십시오.**

```bash
ls -la /var/log/syslog /var/log/messages
tail -f /var/log/syslog
```

**Collector가 로그 파일을 읽을 수 있는지 확인합니다:**

```bash
cat /var/log/syslog | head -20
```

**ClickStack으로의 네트워크 연결을 확인하십시오:**

```bash
# Test OTLP endpoint
curl -v http://YOUR_CLICKSTACK_HOST:4318/v1/logs

# Should get a response (even if error, means endpoint is reachable)
```

**수집기 로그에 오류가 있는지 확인하십시오.**

```bash
# If running in foreground
# Look for error messages in stdout

# If running as systemd service
sudo journalctl -u otelcol-contrib -f | grep -i "error\|failed"
```


### 로그가 올바르게 파싱되지 않음

**syslog 형식을 확인하십시오.**

Ubuntu 24.04 이상에서:

```bash
# Should show ISO8601 format: 2025-11-17T20:55:44.826796+00:00
tail -5 /var/log/syslog
```

Amazon Linux 2 / Ubuntu 20.04에서:

```bash
# Should show traditional format: Nov 17 14:16:16
tail -5 /var/log/messages
```

형식이 일치하지 않는 경우, 사용하는 배포판에 따라 [수집기 구성 생성](#create-config) 섹션에서 해당 구성 탭을 사용하십시오.


### Collector가 systemd 서비스로 시작되지 않는 경우

**서비스 상태 확인:**

```bash
sudo systemctl status otelcol-contrib
```

**상세 로그를 확인하세요:**

```bash
sudo journalctl -u otelcol-contrib -n 50
```

**일반적인 문제:**

* 환경에서 API 키가 올바르게 설정되지 않음
* 설정 파일의 구문 오류
* 로그 파일 읽기 권한 문제


## 다음 단계 {#next-steps}

EC2 호스트 로그 모니터링 설정을 완료한 후 다음 작업을 수행합니다.

- 중요한 시스템 이벤트(서비스 장애, 인증 실패, 디스크 경고)에 대한 [알림](/use-cases/observability/clickstack/alerts)을 설정합니다.
- 특정 리소스를 모니터링하기 위해 EC2 메타데이터 속성(리전, 인스턴스 유형, 인스턴스 ID)으로 필터링합니다.
- 포괄적인 트러블슈팅을 위해 EC2 호스트 로그를 애플리케이션 로그와 연관시킵니다.
- 보안 모니터링(SSH 시도, sudo 사용, 방화벽 차단)을 위한 사용자 정의 대시보드를 생성합니다.
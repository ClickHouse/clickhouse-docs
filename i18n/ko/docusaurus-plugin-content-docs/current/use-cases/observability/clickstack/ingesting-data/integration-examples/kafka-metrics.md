---
slug: /use-cases/observability/clickstack/integrations/kafka-metrics
title: 'ClickStack를 사용한 Kafka 메트릭 모니터링'
sidebar_label: 'Kafka 메트릭'
pagination_prev: null
pagination_next: null
description: 'ClickStack를 사용한 Kafka 메트릭 모니터링'
doc_type: 'guide'
keywords: ['Kafka', 'metrics', 'OTEL', 'ClickStack', 'JMX']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/kafka/import-kafka-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/kafka/kafka-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack로 Kafka 메트릭 모니터링하기 \{#kafka-metrics-clickstack\}

:::note[TL;DR]
이 가이드는 OpenTelemetry JMX Metric Gatherer를 사용하여 ClickStack으로 Apache Kafka 성능 메트릭을 모니터링하는 방법을 다룹니다. 이 가이드를 통해 다음 작업을 수행할 수 있습니다.

- Kafka 브로커에서 JMX를 활성화하고 JMX Metric Gatherer를 구성하는 방법
- OTLP를 통해 Kafka 메트릭을 ClickStack으로 전송하는 방법
- 미리 구성된 대시보드를 사용하여 Kafka 성능(브로커 처리량, 컨슈머 지연, 파티션 상태, 요청 지연 시간)을 시각화하는 방법

프로덕션 Kafka 클러스터를 구성하기 전에 통합을 테스트하려는 경우, 샘플 메트릭이 포함된 데모 데이터셋을 사용할 수 있습니다.

소요 시간: 10–15분
:::

## 기존 Kafka 배포와의 통합 \{#existing-kafka\}

OpenTelemetry JMX Metric Gatherer 컨테이너를 실행하여 메트릭을 수집하고 OTLP를 통해 ClickStack으로 전송하면 기존 Kafka 배포를 모니터링할 수 있습니다.

먼저 기존 구성을 변경하지 않고 이 통합을 테스트하려면 [데모 데이터셋 섹션](#demo-dataset)으로 이동하십시오.

##### 사전 준비사항 \{#prerequisites\}

- 실행 중인 ClickStack 인스턴스
- JMX가 활성화된 기존 Kafka 설치(버전 2.0 이상)
- ClickStack과 Kafka 간 네트워크 액세스(JMX 포트 9999, Kafka 포트 9092)
- OpenTelemetry JMX Metric Gatherer JAR 파일(다운로드 방법은 아래 참고)

<VerticalStepper headerLevel="h4">
  #### ClickStack API 키 받기

  JMX Metric Gatherer는 ClickStack의 OTLP 엔드포인트로 데이터를 전송하며, 이 엔드포인트는 인증을 필요로 합니다.

  1. ClickStack URL(예: `http://localhost:8080`)에서 HyperDX를 엽니다
  2. 계정이 없으면 새로 만들고, 있으면 로그인하십시오
  3. **Team Settings → API Keys**로 이동하십시오
  4. **수집 API key**를 복사하십시오

  <Image img={api_key} alt="ClickStack API 키" />

  5. 환경 변수로 설정하십시오:

  ```bash
  export CLICKSTACK_API_KEY=your-api-key-here
  ```

  #### OpenTelemetry JMX Metric Gatherer 다운로드하기

  JMX Metric Gatherer JAR 파일을 다운로드하세요:

  ```bash
  curl -L -o opentelemetry-jmx-metrics.jar \
    https://github.com/open-telemetry/opentelemetry-java-contrib/releases/download/v1.32.0/opentelemetry-jmx-metrics.jar
  ```

  #### Kafka JMX가 활성화되어 있는지 확인하세요

  Kafka 브로커에서 JMX가 활성화되어 있는지 확인하세요. Docker 배포의 경우:

  ```yaml
  services:
    kafka:
      image: confluentinc/cp-kafka:latest
      environment:
        JMX_PORT: 9999
        KAFKA_JMX_HOSTNAME: kafka
        # ... other Kafka configuration
      ports:
        - "9092:9092"
        - "9999:9999"
  ```

  Docker를 사용하지 않는 배포의 경우, Kafka 시작 시 다음을 설정하세요:

  ```bash
  export JMX_PORT=9999
  ```

  JMX 접근 가능 여부를 확인하세요:

  ```bash
  netstat -an | grep 9999
  ```

  #### Docker Compose를 사용한 JMX Metric Gatherer 배포

  이 예제는 Kafka, JMX Metric Gatherer 및 ClickStack을 사용한 전체 설정을 보여줍니다. 기존 배포 환경에 맞게 서비스 이름과 엔드포인트를 조정하세요:

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

    kafka:
      image: confluentinc/cp-kafka:latest
      hostname: kafka
      container_name: kafka
      environment:
        KAFKA_NODE_ID: 1
        KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT'
        KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://kafka:9092'
        KAFKA_PROCESS_ROLES: 'broker,controller'
        KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka:29093'
        KAFKA_LISTENERS: 'PLAINTEXT://kafka:9092,CONTROLLER://kafka:29093'
        KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
        KAFKA_LOG_DIRS: '/tmp/kraft-combined-logs'
        KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
        KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
        KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
        CLUSTER_ID: 'MkU3OEVBNTcwNTJENDM2Qk'
        JMX_PORT: 9999
        KAFKA_JMX_HOSTNAME: kafka
        KAFKA_JMX_OPTS: '-Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false -Djava.rmi.server.hostname=kafka -Dcom.sun.management.jmxremote.rmi.port=9999'
      ports:
        - "9092:9092"
        - "9999:9999"
      networks:
        - monitoring

    kafka-jmx-exporter:
      image: eclipse-temurin:11-jre
      depends_on:
        - kafka
        - clickstack
      environment:
        - CLICKSTACK_API_KEY=${CLICKSTACK_API_KEY}
      volumes:
        - ./opentelemetry-jmx-metrics.jar:/app/opentelemetry-jmx-metrics.jar
      command: >
        sh -c "java
        -Dotel.jmx.service.url=service:jmx:rmi:///jndi/rmi://kafka:9999/jmxrmi
        -Dotel.jmx.target.system=kafka
        -Dotel.metrics.exporter=otlp
        -Dotel.exporter.otlp.protocol=http/protobuf
        -Dotel.exporter.otlp.endpoint=http://clickstack:4318
        -Dotel.exporter.otlp.headers=authorization=\${CLICKSTACK_API_KEY}
        -Dotel.resource.attributes=service.name=kafka,kafka.broker.id=broker-0
        -Dotel.jmx.interval.milliseconds=10000
        -jar /app/opentelemetry-jmx-metrics.jar"
      networks:
        - monitoring

  networks:
    monitoring:
      driver: bridge
  ```

  **주요 구성 파라미터:**

  * `service:jmx:rmi:///jndi/rmi://kafka:9999/jmxrmi` - JMX 연결 URL(사용 중인 Kafka 호스트 이름을 사용하십시오)
  * `otel.jmx.target.system=kafka` - Kafka 전용 메트릭을 활성화합니다
  * `http://clickstack:4318` - OTLP HTTP 엔드포인트 (사용 중인 ClickStack 호스트 이름 사용)
  * `authorization=\${CLICKSTACK_API_KEY}` - 인증용 API 키(필수)
  * `service.name=kafka,kafka.broker.id=broker-0` - 필터링에 사용할 리소스 속성
  * `10000` - 수집 간격(밀리초, 10초)

  #### HyperDX에서 메트릭 확인하기

  HyperDX에 로그인하여 메트릭이 정상적으로 수집되는지 확인하세요:

  1. 「Chart Explorer」로 이동하십시오
  2. `kafka.message.count` 또는 `kafka.partition.count`를 검색하십시오
  3. 메트릭은 10초 간격으로 표시되어야 합니다.

  **확인할 주요 메트릭:**

  * `kafka.message.count` - 처리된 메시지의 총 개수
  * `kafka.partition.count` - 전체 파티션 수
  * `kafka.partition.under_replicated` - 정상적인 클러스터에서는 0이어야 합니다
  * `kafka.network.io` - 네트워크 처리량
  * `kafka.request.time.*` - 요청 지연 시간의 백분위수

  활동을 생성하고 더 많은 메트릭을 수집하려면:

  ```bash
  # Create a test topic
  docker exec kafka bash -c "unset JMX_PORT && kafka-topics --create --topic test-topic --bootstrap-server kafka:9092 --partitions 3 --replication-factor 1"

  # Send test messages
  echo -e "Message 1\nMessage 2\nMessage 3" | docker exec -i kafka bash -c "unset JMX_PORT && kafka-console-producer --topic test-topic --bootstrap-server kafka:9092"
  ```

  :::note
  Kafka 컨테이너 내에서 Kafka 클라이언트 명령어(kafka-topics, kafka-console-producer 등)를 실행할 때 JMX 포트 충돌을 방지하려면 `unset JMX_PORT &&`를 명령어 앞에 추가하세요.
  :::
</VerticalStepper>

## 데모 데이터세트 {#demo-dataset}

운영 시스템을 구성하기 전에 Kafka Metrics 통합을 시험해 보고 싶은 사용자를 위해, 현실적인 Kafka 메트릭 패턴이 포함된 미리 생성된 데이터세트를 제공합니다.

<VerticalStepper headerLevel="h4">

#### 샘플 메트릭 데이터세트 다운로드 \{#download-sample\}

미리 생성된 메트릭 파일(현실적인 패턴이 포함된 29시간 분량의 Kafka 메트릭)을 다운로드합니다:
```bash
# 게이지 메트릭 다운로드 (파티션 개수, 큐 크기, 지연 시간, consumer lag)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-gauge.csv

# 합계 메트릭 다운로드 (메시지율, 바이트 전송률, 요청 개수)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-sum.csv
```

이 데이터세트에는 단일 브로커 전자상거래 Kafka 클러스터에 대한 현실적인 패턴이 포함됩니다:
- **06:00-08:00: Morning surge** - 야간 기준선에서 트래픽이 급격히 증가
- **10:00-10:15: Flash sale** - 평소 트래픽의 3.5배까지 극적인 스파이크
- **11:30: Deployment event** - 복제 부족 파티션과 함께 consumer lag이 12배로 급증
- **14:00-15:30: Peak shopping** - 기준선의 2.8배 수준에서 트래픽이 지속적으로 높게 유지
- **17:00-17:30: After-work surge** - 퇴근 이후 2차 트래픽 피크
- **18:45: Consumer rebalance** - 리밸런싱 동안 6배 수준의 lag 스파이크
- **20:00-22:00: Evening drop** - 트래픽이 야간 수준으로 가파르게 감소

#### ClickStack 시작 \{#start-clickstack\}

ClickStack 인스턴스를 시작합니다:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

#### 메트릭을 ClickStack에 적재 \{#load-metrics\}

메트릭을 ClickHouse에 직접 적재합니다:
```bash
# 게이지 메트릭 적재 (파티션 개수, 큐 크기, 지연 시간, consumer lag)
cat kafka-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# 합계 메트릭 적재 (메시지율, 바이트 전송률, 요청 개수)
cat kafka-metrics-sum.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### HyperDX에서 메트릭 확인 \{#verify-demo-metrics\}

적재가 완료되면 메트릭을 확인하는 가장 빠른 방법은 미리 만들어진 대시보드를 사용하는 것입니다.

대시보드를 가져와 모든 Kafka 메트릭을 한 번에 확인하려면 [Dashboards and visualization](#dashboards) 섹션으로 이동하십시오.

:::note[Timezone Display]
HyperDX는 브라우저의 로컬 시간대(local timezone)로 타임스탬프를 표시합니다. 데모 데이터는 **2025-11-05 16:00:00 - 2025-11-06 16:00:00 (UTC)** 구간에 걸쳐 있습니다. 위치와 관계없이 데모 메트릭이 보이도록 시간 범위를 **2025-11-04 16:00:00 - 2025-11-07 16:00:00**로 설정하십시오. 메트릭이 보이면, 시각화를 더 명확하게 하기 위해 범위를 24시간 구간으로 좁혀서 조정할 수 있습니다.
:::

</VerticalStepper>

## 대시보드와 시각화 \{#dashboards\}

ClickStack으로 Kafka 모니터링을 시작할 수 있도록 Kafka 메트릭에 대한 기본 대시보드와 시각화를 제공합니다.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/kafka-metrics-dashboard.json')} download="kafka-metrics-dashboard.json" eventName="docs.kafka_metrics_monitoring.dashboard_download">대시보드 구성 파일 다운로드</TrackedLink> \{#download\}

#### 미리 준비된 대시보드 가져오기 \{#import-dashboard\}

1. HyperDX를 열고 Dashboards 섹션으로 이동합니다.
2. 오른쪽 상단의 줄임표 아이콘 메뉴에서 **Import Dashboard**를 클릭합니다.

<Image img={import_dashboard} alt="대시보드 가져오기 버튼"/>

3. `kafka-metrics-dashboard.json` 파일을 업로드한 후 **Finish Import**를 클릭합니다.

<Image img={finish_import} alt="가져오기 완료 대화 상자"/>

#### 대시보드 보기 \{#created-dashboard\}

모든 시각화가 미리 구성된 상태의 대시보드가 생성됩니다.

<Image img={example_dashboard} alt="Kafka 메트릭 대시보드"/>

:::note
데모 데이터셋에는 시간 범위를 **2025-11-05 16:00:00 - 2025-11-06 16:00:00 (UTC)** 로 설정하십시오(로컬 시간대에 맞게 조정). 가져온 대시보드는 기본적으로 시간 범위가 지정되어 있지 않습니다.
:::

</VerticalStepper>

## 문제 해결 {#troubleshooting}

#### HyperDX에 메트릭이 표시되지 않음

**API 키가 설정되어 컨테이너에 전달되고 있는지 확인하십시오.**

```bash
# Check environment variable
echo $CLICKSTACK_API_KEY

# Verify it's in the container
docker exec <jmx-exporter-container> env | grep CLICKSTACK_API_KEY
```

없다면 해당 값을 설정한 후 다시 시작하십시오:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
docker compose up -d kafka-jmx-exporter
```

**메트릭이 ClickHouse에 수집되고 있는지 확인하십시오.**

```bash
docker exec <clickstack-container> clickhouse-client --query "
SELECT DISTINCT MetricName 
FROM otel_metrics_sum 
WHERE ServiceName = 'kafka' 
LIMIT 10
"
```

결과가 나타나지 않으면 JMX exporter 로그를 확인하십시오.

```bash
docker compose logs kafka-jmx-exporter | grep -i "error\|connection" | tail -10
```

**메트릭 수집을 위한 Kafka 트래픽 생성:**

```bash
# Create a test topic
docker exec kafka bash -c "unset JMX_PORT && kafka-topics --create --topic test-topic --bootstrap-server kafka:9092 --partitions 3 --replication-factor 1"

# Send test messages
echo -e "Message 1\nMessage 2\nMessage 3" | docker exec -i kafka bash -c "unset JMX_PORT && kafka-console-producer --topic test-topic --bootstrap-server kafka:9092"
```


#### 인증 오류 \{#download\}

`Authorization failed` 또는 `401 Unauthorized`가 표시되면:

1. HyperDX UI에서 Settings → API Keys → Ingestion API Key로 이동하여 수집 API key를 확인하십시오.
2. 다시 export한 후 재시작하십시오:

```bash
export CLICKSTACK_API_KEY=your-correct-api-key
docker compose down
docker compose up -d
```


#### Kafka 클라이언트 명령 사용 시 포트 충돌 \{#import-dashboard\}

Kafka 컨테이너 내부에서 Kafka 명령을 실행할 때, 다음과 같은 메시지가 표시될 수 있습니다:

```bash
Error: Port already in use: 9999
```

명령어 앞에 `unset JMX_PORT &&`를 붙이십시오:

```bash
docker exec kafka bash -c "unset JMX_PORT && kafka-topics --list --bootstrap-server kafka:9092"
```


#### 네트워크 연결 문제 \{#created-dashboard\}

JMX exporter 로그에 `Connection refused`가 표시된다면:

모든 컨테이너가 동일한 Docker 네트워크에 있는지 확인하십시오.

```bash
docker compose ps
docker network inspect <network-name>
```

연결 테스트:

```bash
# From JMX exporter to ClickStack
docker exec <jmx-exporter-container> sh -c "timeout 2 bash -c 'cat < /dev/null > /dev/tcp/clickstack/4318' && echo 'Connected' || echo 'Failed'"
```


## 운영 환경 적용 \{#going-to-production\}

이 가이드는 JMX Metric Gatherer에서 ClickStack의 OTLP 엔드포인트로 메트릭을 직접 전송하는 방식을 설명하며, 테스트 및 소규모 환경에 적합합니다. 

운영 환경에서는 자체 OpenTelemetry Collector를 에이전트로 배포하여 JMX Exporter로부터 메트릭을 수신하고 이를 ClickStack으로 전달하십시오. 이렇게 하면 배치 처리, 내결함성, 구성의 중앙 집중 관리가 가능해집니다.

운영 환경의 배포 패턴과 Collector 구성 예시는 [OpenTelemetry를 통한 수집](/use-cases/observability/clickstack/ingesting-data/opentelemetry)을 참조하십시오.
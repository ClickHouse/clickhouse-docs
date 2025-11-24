---
'slug': '/use-cases/observability/clickstack/integrations/kafka-metrics'
'title': 'ClickStack로 Kafka 메트릭 모니터링'
'sidebar_label': 'Kafka 메트릭'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack로 Kafka 메트릭 모니터링'
'doc_type': 'guide'
'keywords':
- 'Kafka'
- 'metrics'
- 'OTEL'
- 'ClickStack'
- 'JMX'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/kafka/import-kafka-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/kafka/kafka-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Monitoring Kafka Metrics with ClickStack {#kafka-metrics-clickstack}

:::note[TL;DR]
이 가이드는 OpenTelemetry JMX Metric Gatherer를 사용하여 ClickStack으로 Apache Kafka 성능 메트릭을 모니터링하는 방법을 보여줍니다. 다음을 배우게 됩니다:

- Kafka 브로커에서 JMX를 활성화하고 JMX Metric Gatherer를 구성하는 방법
- OTLP를 통해 ClickStack으로 Kafka 메트릭을 보내는 방법
- Kafka 성능을 시각화하는 미리 제작된 대시보드를 사용하는 방법 (브로커 처리량, 소비자 지연, 파티션 상태, 요청 대기 시간)

프로덕션 Kafka 클러스터를 구성하기 전에 통합을 테스트하고 싶다면 샘플 메트릭이 포함된 데모 데이터세트를 사용할 수 있습니다.

필요한 시간: 10-15분
:::

## Integration with an existing Kafka deployment {#existing-kafka}

OpenTelemetry JMX Metric Gatherer 컨테이너를 실행하여 메트릭을 수집하고 이를 ClickStack으로 OTLP를 통해 전송하여 기존의 Kafka 배포를 모니터링합니다.

기존 설정을 수정하지 않고 먼저 이 통합을 테스트하려면 [데모 데이터세트 섹션](#demo-dataset)으로 건너뛰십시오.

##### Prerequisites {#prerequisites}
- ClickStack 인스턴스 실행 중
- JMX가 활성화된 기존 Kafka 설치 (버전 2.0 이상)
- ClickStack과 Kafka 간의 네트워크 접근 (JMX 포트 9999, Kafka 포트 9092)
- OpenTelemetry JMX Metric Gatherer JAR (다운로드 지침 아래)

<VerticalStepper headerLevel="h4">

#### Get ClickStack API key {#get-api-key}

JMX Metric Gatherer는 ClickStack의 OTLP 엔드포인트에 데이터를 전송하며, 이는 인증이 필요합니다.

1. ClickStack URL에서 HyperDX를 엽니다 (예: http://localhost:8080)
2. 계정을 생성하거나 필요시 로그인합니다
3. **팀 설정 → API 키**로 이동합니다
4. **Ingestion API Key**를 복사합니다

<Image img={api_key} alt="ClickStack API Key"/>

5. 이를 환경 변수로 설정합니다:
```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

#### Download the OpenTelemetry JMX Metric Gatherer {#download-jmx}

JMX Metric Gatherer JAR를 다운로드합니다:
```bash
curl -L -o opentelemetry-jmx-metrics.jar \
  https://github.com/open-telemetry/opentelemetry-java-contrib/releases/download/v1.32.0/opentelemetry-jmx-metrics.jar
```

#### Verify Kafka JMX is enabled {#verify-jmx}

Kafka 브로커에서 JMX가 활성화되어 있는지 확인합니다. Docker 배포의 경우:
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

비-Docker 배포의 경우, Kafka 시작 시 다음을 설정합니다:
```bash
export JMX_PORT=9999
```

JMX에 접근 가능한지 확인합니다:
```bash
netstat -an | grep 9999
```

#### Deploy JMX Metric Gatherer with Docker Compose {#deploy-jmx}

이 예제는 Kafka, JMX Metric Gatherer 및 ClickStack이 포함된 전체 설정을 보여줍니다. 기존 배포와 일치하도록 서비스 이름과 엔드포인트를 조정하십시오:
```yaml
services:
  clickstack:
    image: docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
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

**주요 구성 매개변수:**

- `service:jmx:rmi:///jndi/rmi://kafka:9999/jmxrmi` - JMX 연결 URL (자신의 Kafka 호스트 이름 사용)
- `otel.jmx.target.system=kafka` - Kafka 전용 메트릭 활성화
- `http://clickstack:4318` - OTLP HTTP 엔드포인트 (자신의 ClickStack 호스트 이름 사용)
- `authorization=\${CLICKSTACK_API_KEY}` - 인증을 위한 API 키 (필수)
- `service.name=kafka,kafka.broker.id=broker-0` - 필터링을 위한 리소스 속성
- `10000` - 밀리초 단위의 수집 간격 (10초)

#### Verify metrics in HyperDX {#verify-metrics}

HyperDX에 로그인하고 메트릭이 흐르고 있는지 확인합니다:

1. 차트 탐색기로 이동합니다
2. `kafka.message.count` 또는 `kafka.partition.count`를 검색합니다
3. 메트릭은 10초 간격으로 나타나야 합니다

**확인해야 할 주요 메트릭:**
- `kafka.message.count` - 처리된 총 메시지 수
- `kafka.partition.count` - 총 파티션 수
- `kafka.partition.under_replicated` - 건강한 클러스터에서 0이어야 합니다
- `kafka.network.io` - 네트워크 처리량
- `kafka.request.time.*` - 요청 지연 백분위수

활동을 생성하고 더 많은 메트릭을 채우려면:
```bash

# Create a test topic
docker exec kafka bash -c "unset JMX_PORT && kafka-topics --create --topic test-topic --bootstrap-server kafka:9092 --partitions 3 --replication-factor 1"


# Send test messages
echo -e "Message 1\nMessage 2\nMessage 3" | docker exec -i kafka bash -c "unset JMX_PORT && kafka-console-producer --topic test-topic --bootstrap-server kafka:9092"
```

:::note
Kafka 컨테이너 내에서 Kafka 클라이언트 명령(kafka-topics, kafka-console-producer 등)을 실행할 때 `unset JMX_PORT &&`로 접두사를 붙여 JMX 포트 충돌을 방지하십시오.
:::

</VerticalStepper>

## Demo dataset {#demo-dataset}

생산 시스템을 구성하기 전에 Kafka Metrics 통합을 테스트하려는 사용자를 위해 현실적인 Kafka 메트릭 패턴이 포함된 미리 생성된 데이터세트를 제공합니다.

<VerticalStepper headerLevel="h4">

#### Download the sample metrics dataset {#download-sample}

현실적인 패턴의 Kafka 메트릭이 포함된 미리 생성된 메트릭 파일을 다운로드합니다 (29시간 분량):
```bash

# Download gauge metrics (partition counts, queue sizes, latencies, consumer lag)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-gauge.csv


# Download sum metrics (message rates, byte rates, request counts)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-sum.csv
```

이 데이터세트는 단일 브로커 전자상거래 Kafka 클러스터에 대한 현실적인 패턴을 포함합니다:
- **06:00-08:00: 아침 급증** - 전날 밤의 기준선에서 급작스러운 트래픽 증가
- **10:00-10:15: 플래시 세일** - 정상 트래픽의 3.5배로 급증
- **11:30: 배포 이벤트** - 복제되지 않은 파티션과 함께 소비자 지연이 12배 급증
- **14:00-15:30: 정점 쇼핑** - 2.8배 기준선에서 지속적인 높은 트래픽
- **17:00-17:30: 퇴근 후 급증** - 두 번째 트래픽 피크
- **18:45: 소비자 재조정** - 재조정 중 6배 지연 급증
- **20:00-22:00: 저녁 하락** - 밤 시간 수준으로 급격히 하락

#### Start ClickStack {#start-clickstack}

ClickStack 인스턴스를 시작합니다:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

#### Load metrics into ClickStack {#load-metrics}

메트릭을 ClickHouse로 직접 로드합니다:
```bash

# Load gauge metrics (partition counts, queue sizes, latencies, consumer lag)
cat kafka-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"


# Load sum metrics (message rates, byte rates, request counts)
cat kafka-metrics-sum.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### Verify metrics in HyperDX {#verify-demo-metrics}

로드가 완료되면 미리 제작된 대시보드를 통해 메트릭을 가장 빠르게 확인할 수 있습니다.

대시보드를 가져와 모든 Kafka 메트릭을 한 번에 보려면 [Dashboards and visualization](#dashboards) 섹션으로 진행하십시오.

:::note
데모 데이터세트의 시간 범위는 2025-11-05 16:00:00부터 2025-11-06 16:00:00까지입니다. HyperDX에서 시간 범위가 이 창과 일치하는지 확인하십시오.
:::

</VerticalStepper>

## Dashboards and visualization {#dashboards}

ClickStack으로 Kafka 모니터링을 시작할 수 있도록 Kafka 메트릭에 대한 필수 시각화를 제공합니다.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/kafka-metrics-dashboard.json')} download="kafka-metrics-dashboard.json" eventName="docs.kafka_metrics_monitoring.dashboard_download">대시보드 구성 다운로드</TrackedLink> {#download}

#### Import the pre-built dashboard {#import-dashboard}

1. HyperDX를 열고 대시보드 섹션으로 이동합니다
2. 오른쪽 상단의 점 3개 아래에서 **대시보드 가져오기**를 클릭합니다

<Image img={import_dashboard} alt="Import dashboard button"/>

3. `kafka-metrics-dashboard.json` 파일을 업로드하고 **가져오기 완료**를 클릭합니다

<Image img={finish_import} alt="Finish import dialog"/>

#### View the dashboard {#created-dashboard}

대시보드는 모든 시각화가 미리 구성된 상태로 생성됩니다:

<Image img={example_dashboard} alt="Kafka Metrics dashboard"/>

:::note
데모 데이터세트의 경우, 시간 범위가 2025-11-05 16:00:00부터 2025-11-06 16:00:00으로 설정되어 있는지 확인하십시오.
:::

</VerticalStepper>

## Troubleshooting {#troubleshooting}

#### No metrics appearing in HyperDX {#no-metrics}

**API 키가 설정되고 컨테이너에 전달되었는지 확인하십시오:**

```bash

# Check environment variable
echo $CLICKSTACK_API_KEY


# Verify it's in the container
docker exec <jmx-exporter-container> env | grep CLICKSTACK_API_KEY
```

누락된 경우, 설정하고 다시 시작하십시오:
```bash
export CLICKSTACK_API_KEY=your-api-key-here
docker compose up -d kafka-jmx-exporter
```

**ClickHouse로 메트릭이 도달하는지 확인하십시오:**
```bash
docker exec <clickstack-container> clickhouse-client --query "
SELECT DISTINCT MetricName 
FROM otel_metrics_sum 
WHERE ServiceName = 'kafka' 
LIMIT 10
"
```

결과가 보이지 않는 경우, JMX 내보내기 로그를 확인하십시오:

```bash
docker compose logs kafka-jmx-exporter | grep -i "error\|connection" | tail -10
```

**Kafka 활동을 생성하여 메트릭을 채우십시오:**

```bash

# Create a test topic
docker exec kafka bash -c "unset JMX_PORT && kafka-topics --create --topic test-topic --bootstrap-server kafka:9092 --partitions 3 --replication-factor 1"


# Send test messages
echo -e "Message 1\nMessage 2\nMessage 3" | docker exec -i kafka bash -c "unset JMX_PORT && kafka-console-producer --topic test-topic --bootstrap-server kafka:9092"
```

#### Authentication errors {#auth-errors}

`Authorization failed` 또는 `401 Unauthorized`를 보았다면:

1. HyperDX UI에서 API 키를 확인하십시오 (설정 → API 키 → Ingestion API Key)
2. 다시 내보내고 재시작하십시오:

```bash
export CLICKSTACK_API_KEY=your-correct-api-key
docker compose down
docker compose up -d
```

#### Port conflicts with Kafka client commands {#port-conflicts}

Kafka 컨테이너 내에서 Kafka 명령을 실행할 때 다음과 같은 메시지가 표시될 수 있습니다:

```bash
Error: Port already in use: 9999
```

명령 앞에 `unset JMX_PORT &&`로 접두사를 붙이십시오:
```bash
docker exec kafka bash -c "unset JMX_PORT && kafka-topics --list --bootstrap-server kafka:9092"
```

#### Network connectivity issues {#network-issues}

JMX 내보내기 로그에 `Connection refused`가 나타나면:

모든 컨테이너가 동일한 Docker 네트워크에 있는지 확인하십시오:
```bash
docker compose ps
docker network inspect <network-name>
```

연결을 테스트하십시오:
```bash

# From JMX exporter to ClickStack
docker exec <jmx-exporter-container> sh -c "timeout 2 bash -c 'cat < /dev/null > /dev/tcp/clickstack/4318' && echo 'Connected' || echo 'Failed'"
```

## Going to production {#going-to-production}

이 가이드는 JMX Metric Gatherer에서 ClickStack의 OTLP 엔드포인트로 메트릭을 직접 전송하는 방법을 설명하며, 이는 테스트와 소규모 배포에 적합합니다.

운영 환경에서는 JMX Exporter에서 메트릭을 수신하고 이를 ClickStack으로 전달하기 위해 OpenTelemetry Collector를 에이전트로 배포하십시오. 이로 인해 배치 처리, 복원력 및 중앙 집중식 구성 관리가 가능합니다.

생산 배포 패턴 및 수집기 구성 예제를 보려면 [Ingesting with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry)를 참조하십시오.

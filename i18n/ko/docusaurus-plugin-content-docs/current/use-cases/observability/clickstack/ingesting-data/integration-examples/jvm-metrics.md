---
slug: /use-cases/observability/clickstack/integrations/jvm-metrics
title: 'ClickStack를 이용한 JVM 메트릭 모니터링'
sidebar_label: 'JVM 메트릭'
pagination_prev: null
pagination_next: null
description: 'ClickStack를 이용한 JVM 모니터링'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/jvm/jvm-metrics-import.png';
import example_dashboard from '@site/static/images/clickstack/jvm/jvm-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack로 JVM 메트릭 모니터링하기 \{#jvm-clickstack\}

:::note[TL;DR]
이 가이드는 OpenTelemetry Java agent를 사용해 메트릭을 수집하고 ClickStack로 JVM 애플리케이션을 모니터링하는 방법을 설명합니다. 다음 내용을 다룹니다.

- JVM 애플리케이션에 OpenTelemetry Java agent를 연결하는 방법
- agent가 OTLP를 통해 ClickStack로 메트릭을 전송하도록 설정하는 방법
- 미리 구성된 대시보드를 사용해 힙 메모리, 가비지 컬렉션, 스레드, CPU를 시각화하는 방법

운영 애플리케이션에 계측을 적용하기 전에 통합을 테스트해 볼 수 있도록 샘플 메트릭이 포함된 데모 데이터셋이 제공됩니다.

소요 시간: 5~10분
:::

## 기존 JVM 애플리케이션과의 통합 \{#existing-jvm\}

이 섹션에서는 기존 JVM 애플리케이션이 OpenTelemetry Java agent를 사용하여 ClickStack으로 메트릭을 전송하도록 구성하는 방법을 설명합니다.

프로덕션 환경을 구성하기 전에 통합을 미리 테스트해 보고자 한다면, [데모 데이터세트 섹션](#demo-dataset)에 제공된 데모 데이터세트를 사용하여 테스트할 수 있습니다.

##### 사전 준비 사항 \{#prerequisites\}

- 실행 중인 ClickStack 인스턴스
- 기존 Java 애플리케이션(Java 8 이상)
- JVM 시작 인자를 수정할 수 있는 권한

<VerticalStepper headerLevel="h4">

#### ClickStack API key 가져오기 \{#get-api-key\}

OpenTelemetry Java 에이전트는 인증이 필요한 ClickStack의 OTLP 엔드포인트로 데이터를 전송합니다.

1. ClickStack URL에서 HyperDX를 엽니다(예: http://localhost:8080)
2. 필요한 경우 계정을 생성하거나 로그인합니다.
3. **Team Settings → API Keys**로 이동합니다.
4. **Ingestion API Key**를 복사합니다.

<Image img={api_key} alt="ClickStack API Key"/>

#### OpenTelemetry Java 에이전트 다운로드 \{#download-agent\}

OpenTelemetry Java 에이전트 JAR 파일을 다운로드합니다:

```bash
curl -L -O https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v2.22.0/opentelemetry-javaagent.jar
```

이 명령은 현재 디렉터리에 에이전트를 다운로드합니다. 배포 환경에 맞게 적절한 위치(예: `/opt/opentelemetry/` 또는 애플리케이션 JAR와 동일한 위치)에 둘 수 있습니다.

#### JVM 시작 인자 구성 \{#configure-jvm\}

JVM 시작 명령에 Java 에이전트를 추가합니다. 에이전트는 JVM 메트릭을 자동으로 수집하여 ClickStack으로 전송합니다.

##### 옵션 1: 명령줄 플래그 \{#command-line-flags\}

```bash
java -javaagent:opentelemetry-javaagent.jar \
  -Dotel.service.name=my-java-app \
  -Dotel.exporter.otlp.endpoint=http://localhost:4318 \
  -Dotel.exporter.otlp.protocol=http/protobuf \
  -Dotel.exporter.otlp.headers="authorization=YOUR_API_KEY" \
  -Dotel.metrics.exporter=otlp \
  -Dotel.logs.exporter=none \
  -Dotel.traces.exporter=none \
  -jar my-application.jar
```

**다음을 교체하십시오.**
- `opentelemetry-javaagent.jar` → 에이전트 JAR의 전체 경로(예: `/opt/opentelemetry/opentelemetry-javaagent.jar`)
- `my-java-app` → 서비스에 대한 의미 있는 이름(예: `payment-service`, `user-api`)
- `YOUR_API_KEY` → 위 단계에서 복사한 ClickStack 수집 API key
- `my-application.jar` → 애플리케이션 JAR 파일 이름
- `http://localhost:4318` → ClickStack 엔드포인트(ClickStack이 동일한 머신에서 실행 중이면 `localhost:4318`을 사용하고, 그렇지 않으면 `http://your-clickstack-host:4318`을 사용하십시오)

##### 옵션 2: 환경 변수 \{#env-vars\}

또는 환경 변수를 사용할 수 있습니다:

```bash
export JAVA_TOOL_OPTIONS="-javaagent:opentelemetry-javaagent.jar"
export OTEL_SERVICE_NAME="my-java-app"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_HEADERS="authorization=YOUR_API_KEY"
export OTEL_METRICS_EXPORTER="otlp"
export OTEL_LOGS_EXPORTER="none"
export OTEL_TRACES_EXPORTER="none"

java -jar my-application.jar
```

**다음을 교체하십시오.**
- `opentelemetry-javaagent.jar` → 에이전트 JAR의 전체 경로
- `my-java-app` → 서비스 이름
- `YOUR_API_KEY` → ClickStack 수집 API key
- `http://localhost:4318` → ClickStack 엔드포인트
- `my-application.jar` → 애플리케이션 JAR 파일 이름

:::tip
OpenTelemetry Java 에이전트는 다음 JVM 메트릭을 자동으로 수집합니다.

- **메모리**: `jvm.memory.used`, `jvm.memory.limit`, `jvm.memory.committed`, `jvm.memory.used_after_last_gc`
- **가비지 컬렉션**: `jvm.gc.duration`
- **스레드**: `jvm.thread.count`
- **클래스**: `jvm.class.count`, `jvm.class.loaded`, `jvm.class.unloaded`
- **CPU**: `jvm.cpu.time`, `jvm.cpu.count`
:::

#### HyperDX에서 메트릭 확인 \{#verifying-metrics\}

애플리케이션이 에이전트와 함께 실행 중이면, 메트릭이 ClickStack으로 전송되는지 확인합니다.

1. http://localhost:8080(또는 ClickStack URL)에서 HyperDX를 엽니다.
2. **Chart Explorer**로 이동합니다.
3. `jvm.`으로 시작하는 메트릭을 검색합니다(예: `jvm.memory.used`, `jvm.gc.duration`, `jvm.thread.count`).

</VerticalStepper>

## 데모 데이터셋 \{#demo-dataset\}

애플리케이션을 계측하기 전에 JVM 메트릭 통합을 먼저 시험해 보고자 하는 사용자를 위해, 중간 규모 마이크로서비스에서 안정적인 중간 수준 트래픽이 있는 현실적인 JVM 동작을 보여 주는, 사전 생성된 메트릭이 포함된 샘플 데이터셋을 제공합니다.

<VerticalStepper headerLevel="h4">

#### 샘플 데이터셋 다운로드 \{#download-sample\}

```bash
# 게이지 메트릭(메모리, 스레드, CPU, 클래스) 다운로드
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/jvm/jvm-metrics-gauge.jsonl

# 합계 메트릭(GC 이벤트) 다운로드
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/jvm/jvm-metrics-sum.jsonl
```

이 데이터셋에는 다음과 같은 JVM 메트릭 24시간치가 포함됩니다:
- 주기적인 가비지 컬렉션 이벤트가 있는 힙 메모리 증가
- 스레드 수 변동
- 현실적인 GC 정지 시간
- 클래스 로딩 활동
- CPU 사용 패턴

#### ClickStack 시작 \{#start-clickstack\}

아직 ClickStack이 실행 중이 아니라면:

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

ClickStack이 완전히 시작될 때까지 잠시 기다립니다.

#### 데모 데이터셋 가져오기 \{#import-demo-data\}

```bash
# 게이지 메트릭(메모리, 스레드, CPU, 클래스) 가져오기
docker exec -i clickstack clickhouse-client --query="
  INSERT INTO default.otel_metrics_gauge FORMAT JSONEachRow
" < jvm-metrics-gauge.jsonl

# 합계 메트릭(GC 이벤트) 가져오기
docker exec -i clickstack clickhouse-client --query="
  INSERT INTO default.otel_metrics_sum FORMAT JSONEachRow
" < jvm-metrics-sum.jsonl
```

이 명령은 메트릭을 ClickStack의 메트릭 테이블에 직접 가져옵니다.

#### 데모 데이터 확인 \{#verify-demo-metrics\}

가져오기가 완료되면:

1. http://localhost:8080 에서 HyperDX를 열고 로그인합니다(필요하면 계정을 생성합니다)
2. Search 뷰로 이동하여 source를 **Metrics**로 설정합니다
3. 시간 범위를 **2025-12-06 14:00:00 - 2025-12-09 14:00:00**으로 설정합니다
4. `jvm.memory.used` 또는 `jvm.gc.duration`을 검색합니다

데모 서비스에 대한 메트릭이 표시됩니다.

:::note[Timezone Display]
HyperDX는 브라우저의 로컬 시간대를 기준으로 타임스탬프를 표시합니다. 데모 데이터는 **2025-12-07 14:00:00 - 2025-12-08 14:00:00 (UTC)**에 해당하는 24시간 구간을 포함합니다. 위치와 관계없이 데모 메트릭을 볼 수 있도록 시간 범위를 **2025-12-06 14:00:00 - 2025-12-09 14:00:00**으로 설정하십시오. 메트릭이 보이면, 더 명확한 시각화를 위해 범위를 24시간으로 좁힐 수 있습니다.
:::

</VerticalStepper>

## 대시보드와 시각화 \{#dashboards\}

ClickStack으로 JVM 애플리케이션을 모니터링할 수 있도록, JVM 메트릭에 필요한 핵심 시각화가 포함된 사전 구성 대시보드를 제공합니다.

<VerticalStepper headerLevel="h4">

#### 대시보드 구성 파일을 <TrackedLink href={useBaseUrl('/examples/jvm-metrics-dashboard.json')} download="jvm-metrics-dashboard.json" eventName="docs.kafka_metrics_monitoring.dashboard_download">다운로드</TrackedLink> \{#download\}

#### 사전 구성된 대시보드 가져오기 \{#import-dashboard\}

1. HyperDX를 열고 Dashboards 섹션으로 이동합니다.
2. 오른쪽 상단 말줄임표 메뉴에서 **Import Dashboard**를 클릭합니다.

<Image img={import_dashboard} alt="대시보드 가져오기 버튼"/>

3. `jvm-metrics-dashboard.json` 파일을 업로드하고 **Finish Import**를 클릭합니다.

<Image img={finish_import} alt="가져오기 완료"/>

#### 대시보드 보기 \{#created-dashboard\}

모든 시각화가 미리 구성된 상태로 대시보드가 생성됩니다.

<Image img={example_dashboard} alt="Kafka 메트릭 대시보드"/>

:::note
데모 데이터셋에 대해서는 시간 범위를 **2025-12-07 14:00:00 - 2025-12-08 14:00:00 (UTC)**로 설정하십시오. 로컬 시간대에 맞게 조정하십시오.
:::

</VerticalStepper>

## 문제 해결 \{#troubleshooting\}

### 에이전트가 시작되지 않는 경우 \{#troubleshooting-not-loading\}

**에이전트 JAR 파일이 존재하는지 확인:**

```bash
ls -lh /path/to/opentelemetry-javaagent.jar
```

**Java 버전 호환성 확인 (Java 8 이상 필요):**

```bash
java -version
```

**에이전트 시작 로그 메시지를 확인하십시오:**
애플리케이션이 시작되면 다음과 같은 메시지가 출력되어야 합니다.

```text
[otel.javaagent] OpenTelemetry Javaagent v2.22.0 started
```


### HyperDX에 메트릭이 표시되지 않음 \{#no-metrics\}

**ClickStack이 실행 중이며 액세스할 수 있는지 확인하십시오.**

```bash
docker ps | grep clickstack
curl -v http://localhost:4318/v1/metrics
```

**메트릭 익스포터가 구성되어 있는지 확인하십시오:**

```bash
# If using environment variables, verify:
echo $OTEL_METRICS_EXPORTER
# Should output: otlp
```

**OpenTelemetry 오류에 대한 애플리케이션 로그 확인:**
애플리케이션 로그에서 OpenTelemetry 또는 OTLP 내보내기 실패와 관련된 오류 메시지가 있는지 확인합니다.

**네트워크 연결 확인:**
ClickStack이 원격 호스트에 있는 경우, 애플리케이션 서버에서 포트 4318로의 접속이 가능한지 확인합니다.

**에이전트 버전 확인:**
최신 안정 버전의 에이전트(현재 2.22.0)를 사용 중인지 확인합니다. 최신 버전에는 성능 개선 사항이 포함되는 경우가 많습니다.


## 다음 단계 \{#next-steps\}

이제 JVM 메트릭이 ClickStack으로 수집되도록 구성했으므로, 다음 단계를 고려하십시오:

- 높은 힙 사용량, 잦은 GC 일시 중지, 스레드 고갈과 같은 중요 메트릭에 대한 [알림](/use-cases/observability/clickstack/alerts)을 설정하십시오
- 관측성 데이터를 통합하기 위해 [다른 ClickStack 연동](/use-cases/observability/clickstack/integration-guides)을 살펴보십시오

## 프로덕션 환경으로 이동 \{#going-to-production\}

이 가이드는 로컬 테스트를 위해 OpenTelemetry Java 에이전트를 구성하는 방법을 설명합니다. 프로덕션 배포에서는 컨테이너 이미지에 에이전트 JAR을 포함하고 환경 변수를 통해 구성하여 관리하기 쉽도록 합니다. 많은 JVM 인스턴스가 있는 대규모 환경에서는 여러 애플리케이션에서 수집되는 메트릭을 직접 ClickStack으로 전송하는 대신, 중앙 집중식 OpenTelemetry Collector를 배포하여 메트릭을 배치 처리하고 전달하도록 합니다.

프로덕션 배포 패턴 및 Collector 구성 예시는 [OpenTelemetry를 사용한 수집](/use-cases/observability/clickstack/ingesting-data/opentelemetry)을 참고하십시오.
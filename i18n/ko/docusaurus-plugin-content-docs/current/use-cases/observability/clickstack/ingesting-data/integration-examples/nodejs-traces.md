---
slug: /use-cases/observability/clickstack/integrations/nodejs-traces
title: 'ClickStack를 사용한 Node.js 트레이스 모니터링'
sidebar_label: 'Node.js 트레이스'
pagination_prev: null
pagination_next: null
description: 'ClickStack를 사용하여 Node.js 애플리케이션 트레이스를 모니터링합니다'
doc_type: 'guide'
keywords: ['Node.js', 'traces', 'OTEL', 'ClickStack', 'distributed tracing']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import api_key from '@site/static/images/clickstack/api-key.png';
import search_view from '@site/static/images/clickstack/nodejs/traces-search-view.png';
import trace_view from '@site/static/images/clickstack/nodejs/trace-view.png';
import finish_import from '@site/static/images/clickstack/nodejs/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/nodejs/example-traces-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack로 Node.js 트레이스 모니터링하기 \{#nodejs-traces-clickstack\}

:::note[TL;DR]
이 가이드는 Node.js 애플리케이션에서 분산 트레이스를 수집하고, OpenTelemetry 자동 계측을 사용하여 ClickStack에서 이를 시각화하는 방법을 안내합니다. 다음 내용을 학습하게 됩니다:

- 자동 계측을 사용하여 Node.js용 OpenTelemetry를 설치하고 구성하기
- 트레이스를 ClickStack의 OTLP 엔드포인트로 전송하기
- HyperDX에서 트레이스가 정상적으로 표시되는지 확인하기
- 미리 준비된 대시보드를 사용해 애플리케이션 성능 시각화하기

프로덕션 애플리케이션을 계측하기 전에 연동을 테스트해 보고 싶은 경우, 샘플 트레이스가 포함된 데모 데이터셋이 제공됩니다.

소요 시간: 10-15분
:::

## 기존 Node.js 애플리케이션과의 통합 \{#existing-nodejs\}

이 섹션에서는 OpenTelemetry 자동 계측을 사용하여 기존 Node.js 애플리케이션에 분산 추적을 추가하는 방법을 다룹니다.

기존 환경을 직접 구성하기 전에 통합을 미리 테스트하고자 하는 경우, [데모 데이터셋 섹션](#demo-dataset)에서 미리 구성된 환경과 샘플 데이터를 사용해 테스트할 수 있습니다.

##### 준비 사항 \{#prerequisites\}

- OTLP 엔드포인트에 접근 가능한 상태로 실행 중인 ClickStack 인스턴스 (포트 4317/4318)
- 기존 Node.js 애플리케이션 (Node.js 14 이상)
- npm 또는 yarn 패키지 관리자
- ClickStack 호스트 이름 또는 IP 주소

<VerticalStepper headerLevel="h4">

#### OpenTelemetry 설치 및 구성 \{#install-configure\}

애플리케이션 시작 부분에서 `@hyperdx/node-opentelemetry` 패키지를 설치하고 초기화합니다. 자세한 설치 단계는 [Node.js SDK 가이드](/use-cases/observability/clickstack/sdks/nodejs#getting-started)를 참고하십시오.

#### ClickStack API key 가져오기 \{#get-api-key\}

ClickStack의 OTLP 엔드포인트로 트레이스를 전송하기 위한 수집 API key입니다.

1. ClickStack URL에서 HyperDX를 엽니다 (예: http://localhost:8080)
2. 필요하면 계정을 생성하거나 로그인합니다.
3. **Team Settings → API Keys**로 이동합니다.
4. **Ingestion API Key**를 복사합니다.

<Image img={api_key} alt="ClickStack API Key"/>

#### 애플리케이션 실행 \{#run-application\}

환경 변수를 설정한 뒤 Node.js 애플리케이션을 시작합니다:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

#### 트래픽 생성 \{#generate-traffic\}

애플리케이션에 요청을 보내 트레이스를 생성합니다:

```bash
# 간단한 요청
curl http://localhost:3000/
curl http://localhost:3000/api/users
curl http://localhost:3000/api/products

# 부하 시뮬레이션
for i in {1..100}; do curl -s http://localhost:3000/ > /dev/null; done
```

#### HyperDX에서 트레이스 확인 \{#verify-traces\}

구성이 완료되면 HyperDX에 로그인하여 트레이스가 수집되는지 확인합니다. 다음과 비슷한 화면이 표시됩니다. 트레이스가 보이지 않으면 시간 범위를 조정해 보십시오:

<Image img={search_view} alt="트레이스 검색 화면"/>

임의의 트레이스를 클릭하여 span, 타이밍, 속성이 포함된 상세 보기를 확인합니다:

<Image img={trace_view} alt="개별 트레이스 상세 화면"/>

</VerticalStepper>

## 데모 데이터셋 \{#demo-dataset\}

프로덕션 애플리케이션을 계측하기 전에 ClickStack으로 Node.js 트레이싱을 테스트해 보려는 사용자를 위해, 현실적인 트래픽 패턴을 반영한 미리 생성된 Node.js 애플리케이션 트레이스 샘플 데이터셋을 제공합니다.

<VerticalStepper headerLevel="h4">

#### 샘플 데이터셋 다운로드 \{#download-sample\}

샘플 트레이스 파일을 다운로드하십시오:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nodejs/nodejs-traces-sample.json
```

#### ClickStack 시작하기 \{#start-clickstack\}

아직 ClickStack이 실행되고 있지 않다면, 다음 명령으로 시작하십시오:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD= \
  clickhouse/clickstack-all-in-one:latest
```

#### ClickStack API key 가져오기 \{#get-api-key-demo\}

ClickStack의 OTLP 엔드포인트로 트레이스를 전송하려면 API key가 필요합니다.

1. ClickStack URL(예: http://localhost:8080)에서 HyperDX를 엽니다.
2. 필요하다면 계정을 생성하거나 로그인합니다.
3. **Team Settings → API Keys**로 이동합니다.
4. **Ingestion API Key(수집 API key)**를 복사합니다.

<Image img={api_key} alt="ClickStack API Key"/>

환경 변수로 API key를 설정하십시오:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

#### 트레이스를 ClickStack으로 전송하기 \{#send-traces\}

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nodejs-traces-sample.json
```

`{"partialSuccess":{}}`와 같은 응답이 표시되면 트레이스가 성공적으로 전송된 것입니다.

#### HyperDX에서 트레이스 확인 \{#verify-demo-traces\}

1. [HyperDX](http://localhost:8080/)를 열고 계정으로 로그인합니다(먼저 계정을 생성해야 할 수도 있습니다).
2. **Search** 뷰로 이동한 후, 소스를 **Traces**로 설정합니다.
3. 시간 범위를 **2025-10-25 13:00:00 - 2025-10-28 13:00:00**으로 설정합니다.

<Image img={search_view} alt="트레이스 검색 화면"/>

<Image img={trace_view} alt="개별 트레이스 화면"/>

:::note[타임존 표시]
HyperDX는 브라우저의 로컬 타임존으로 타임스탬프를 표시합니다. 데모 데이터는 **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** 구간에 걸쳐 있습니다. 넓은 시간 범위를 사용하면 위치와 관계없이 데모 트레이스를 볼 수 있습니다. 트레이스를 확인한 후에는 더 명확한 시각화를 위해 시간 범위를 24시간 구간으로 좁힐 수 있습니다.
:::

</VerticalStepper>

## 대시보드와 시각화 \{#dashboards\}

Node.js 애플리케이션 성능 모니터링을 바로 시작할 수 있도록, 주요 트레이스 시각화가 포함된 사전 구성 대시보드를 제공합니다.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nodejs-traces-dashboard.json')} download="nodejs-traces-dashboard.json" eventName="docs.node_traces_monitoring.dashboard_download">대시보드 구성 파일 다운로드</TrackedLink> \{#download-dashboard\}

#### 사전 구성된 대시보드 가져오기 \{#import-dashboard\}

1. HyperDX를 열고 **Dashboards** 섹션으로 이동합니다.
2. 오른쪽 상단의 줄임표 메뉴에서 **Import Dashboard**를 클릭합니다.

<Image img={import_dashboard} alt="대시보드 가져오기"/>

3. `nodejs-traces-dashboard.json` 파일을 업로드하고 **Finish Import**를 클릭합니다.

<Image img={finish_import} alt="가져오기 완료"/>

#### 모든 시각화가 사전 구성된 상태로 대시보드가 생성됩니다. \{#created-dashboard\}

<Image img={example_dashboard} alt="예시 대시보드"/>

:::note
데모 데이터셋의 경우, 시간 범위를 **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** 로 설정하십시오(로컬 시간대에 맞게 조정하십시오). 가져온 대시보드에는 기본적으로 시간 범위가 지정되어 있지 않습니다.
:::

</VerticalStepper>

## 문제 해결 \{#troubleshooting\}

### curl로 데모 트레이스가 표시되지 않는 경우 \{#demo-traces-not-appearing\}

curl로 트레이스를 전송했지만 HyperDX에 표시되지 않는다면, 트레이스를 한 번 더 전송해 보십시오:

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nodejs-traces-sample.json
```

이는 데모용 curl 방식을 사용할 때 발생하는 것으로 알려진 문제이며, 계측이 적용된 프로덕션 애플리케이션에는 영향을 주지 않습니다.


### HyperDX에 트레이스가 표시되지 않는 경우 \{#no-traces\}

**환경 변수가 올바르게 설정되어 있는지 확인하십시오.**

```bash
echo $CLICKSTACK_API_KEY
# Should output your API key

echo $OTEL_EXPORTER_OTLP_ENDPOINT
# Should output http://localhost:4318 or your ClickStack host
```

**네트워크 연결 확인:**

```bash
curl -v http://localhost:4318/v1/traces
```

OTLP 엔드포인트에 성공적으로 연결되어야 합니다.

**애플리케이션 로그 확인:**
애플리케이션이 시작될 때 OpenTelemetry 초기화 메시지가 출력되는지 확인하십시오. HyperDX SDK가 초기화되었음을 나타내는 확인 메시지를 출력해야 합니다.


## 다음 단계 \{#next-steps\}

더 살펴보고자 한다면, 대시보드를 기반으로 다음과 같은 작업을 시도해 볼 수 있습니다:

- 중요 메트릭(에러 비율, 지연 시간 임계값)에 대한 [알림](/use-cases/observability/clickstack/alerts)을 설정합니다.
- 특정 사용 사례(API 모니터링, 보안 이벤트)에 대한 추가 대시보드를 생성합니다.

## 프로덕션 환경으로 전환하기 \{#going-to-production\}

이 가이드에서는 HyperDX SDK를 사용하여 트레이스를 ClickStack의 OTLP 엔드포인트로 직접 전송합니다. 이는 개발, 테스트, 소규모~중규모 프로덕션 배포 환경에 적합합니다.
프로덕션 환경 규모가 더 크거나 텔레메트리 데이터에 대한 추가 제어가 필요한 경우, 에이전트 방식으로 자체 OpenTelemetry Collector를 배포하는 방안을 고려하십시오. 
프로덕션 배포 패턴과 Collector 구성 예시는 [OpenTelemetry를 사용한 수집](/use-cases/observability/clickstack/ingesting-data/opentelemetry)을 참고하십시오.
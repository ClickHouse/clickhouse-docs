---
slug: /use-cases/observability/clickstack/text-to-chart
title: 'Text-to-Chart'
sidebar_label: 'Text-to-Chart'
pagination_prev: null
pagination_next: null
description: 'ClickStack에서 AI 기반 Text-to-Chart 기능을 사용하여 자연어 프롬프트로 차트를 생성합니다.'
doc_type: 'guide'
keywords: ['clickstack', 'text-to-chart', 'AI', '시각화', 'Chart Explorer', '자연어', '관측성']
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import text_to_chart from '@site/static/images/clickstack/text-to-chart/text-to-chart.png';
import chart_explorer from '@site/static/images/clickstack/text-to-chart/chart-explorer.png';
import create_connection from '@site/static/images/clickstack/text-to-chart/create-connection.png';

ClickStack의 Text-to-Chart 기능을 사용하면 보고 싶은 내용을 일반 텍스트로 설명하여 시각화를 만들 수 있습니다. 메트릭, 필터, 그룹화 기준 필드를 수동으로 선택하는 대신 &quot;지난 24시간 동안 서비스별 오류율&quot;과 같은 프롬프트를 입력하면 ClickStack이 해당 차트를 자동으로 생성합니다.

이 기능은 대규모 언어 모델(LLM)을 사용해 텍스트 프롬프트를 쿼리로 변환한 다음, [Chart Explorer](/use-cases/observability/clickstack/dashboards#navigate-chart-explorer)에서 시각화를 생성합니다. 구성된 모든 데이터 소스에서 사용할 수 있습니다.


## 사전 요구 사항 \{#prerequisites\}

Text-to-Chart를 사용하려면 [Anthropic API 키](https://console.anthropic.com/)가 필요합니다. ClickStack을 시작할 때 `ANTHROPIC_API_KEY` 환경 변수를 설정하십시오.

오픈 소스 배포에서는 키를 환경 변수로 전달하십시오. 방법은 배포 유형에 따라 달라집니다.

<Tabs groupId="deployMethod">
  <TabItem value="docker-aio" label="Docker (All-in-One 또는 로컬 모드)" default>
    ```bash
    docker run -e ANTHROPIC_API_KEY='<YOUR_KEY>' -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
    ```
  </TabItem>

  <TabItem value="docker-hyperdx" label="Docker (HyperDX 전용)">
    ```bash
    docker run -e ANTHROPIC_API_KEY='<YOUR_KEY>' -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
    ```
  </TabItem>

  <TabItem value="docker-compose" label="Docker Compose">
    `.env` 파일에 변수를 추가하거나 `docker-compose.yaml`에서 직접 설정하십시오.

    ```yaml
    services:
      app:
        environment:
          ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    ```
  </TabItem>

  <TabItem value="helm" label="Helm">
    `--set`을 사용해 키를 전달하십시오.

    ```bash
    helm install my-hyperdx hyperdx/hdx-oss-v2 \
      --set env[0].name=ANTHROPIC_API_KEY \
      --set env[0].value=<YOUR_KEY>
    ```
  </TabItem>
</Tabs>

## Text-to-Chart 사용하기 \{#using-text-to-chart\}

<VerticalStepper headerLevel="h3">

### Chart Explorer로 이동 \{#navigate-chart-explorer\}

HyperDX의 왼쪽 메뉴에서 **Chart Explorer**를 선택합니다.

### 데이터 소스 선택 \{#select-data-source\}

시각화할 데이터 소스를 선택합니다. 예를 들어 **로그**, **트레이스** 또는 **Metrics**를 선택할 수 있습니다.

<Image img={chart_explorer} alt="Chart explorer" />

### 텍스트 프롬프트 입력 \{#enter-text-prompt\}

Chart Explorer 상단에서 **AI Assistant** 입력란을 찾습니다. 만들려는 차트를 자연어로 설명해 입력합니다. 예를 들어 다음과 같습니다.

- `Show error rates by service over the last 24 hours`
- `Latency breakdown by endpoint`
- `Count of events over time grouped by severity`

ClickStack은 프롬프트를 쿼리로 변환하고 시각화를 자동으로 렌더링합니다.

<Image img={text_to_chart} alt="Text to chart" />

</VerticalStepper>

## 데모 데이터로 사용해 보기 \{#demo-data\}

Text-to-Chart를 가장 빠르게 체험하는 방법은 [Local Mode](/use-cases/observability/clickstack/deployment/local-mode-only) Docker 이미지와 [원격 데모 데이터셋](/use-cases/observability/clickstack/getting-started/remote-demo-data)을 사용하는 것입니다:

```bash
docker run -e ANTHROPIC_API_KEY='<YOUR_KEY>' -p 8080:8080 clickhouse/clickstack-local:latest
```

`localhost:8080`으로 이동하세요. 데모 데이터에 연결하려면 **Team Settings**로 이동한 다음, 다음 정보로 새 연결을 생성하세요:

* **Connection Name**: `Demo`
* **Host**: `https://sql-clickhouse.clickhouse.com`
* **Username**: `otel_demo`
* **Password**: 비워 두세요

<Image img={create_connection} alt="연결 생성" />

그런 다음 각 소스인 **Logs**, **Traces**, **Metrics**, **Sessions**가 `otel_v2` 데이터베이스를 사용하도록 수정하세요. 소스 구성에 대한 자세한 내용은 [원격 데모 데이터세트 가이드](/use-cases/observability/clickstack/getting-started/remote-demo-data)를 참조하세요.

연결이 완료되면 **Chart Explorer**를 열고 사용 가능한 로그, 트레이스, 메트릭에 대해 프롬프트를 시도해 보세요.


## 예시 프롬프트 \{#example-prompts\}

다음 프롬프트는 관측성 데이터를 사용할 때의 일반적인 활용 사례를 보여줍니다:

| 프롬프트                                              | 데이터 소스 | 설명                                 |
| ------------------------------------------------- | ------ | ---------------------------------- |
| `Error count by service over time`                | 로그     | 시간 경과에 따른 서비스별 오류 발생 빈도를 차트로 표시합니다 |
| `Average request duration grouped by endpoint`    | 트레이스   | 엔드포인트별 지연 시간 패턴을 보여줍니다             |
| `P99 latency by service`                          | 트레이스   | 서비스 전반의 tail latency를 식별합니다        |
| `Count of 5xx status codes over the last 6 hours` | 로그     | 최근 6시간 동안의 서버 오류 추세를 추적합니다         |

프롬프트에서는 구성된 데이터 소스에서 사용할 수 있는 모든 컬럼 또는 속성을 참조할 수 있습니다. 프롬프트를 구체적으로 작성할수록 생성되는 차트의 정확도가 높아집니다.

## 제한 사항 \{#limitations\}

* Text-to-Chart는 현재 Anthropic만 LLM 제공업체로 지원합니다. OpenAI를 포함한 추가 제공업체 지원은 향후 릴리스에서 제공될 예정입니다.
* 데이터 소스로는 로그와 트레이스만 지원됩니다. Prometheus 메트릭은 아직 지원되지 않습니다.
* 차트의 정확도는 프롬프트의 명확성과 기반 데이터의 구조에 따라 달라집니다. 생성된 차트가 예상과 다를 경우, 프롬프트를 다시 작성하거나 컬럼 이름을 명시적으로 지정해 보십시오.

## 추가 자료 \{#further-reading\}

* [텍스트에서 차트까지: ClickStack으로 더 빠르게 시각화하는 방법](https://clickhouse.com/blog/text-to-charts-faster-way-to-visualize-clickstack) — 기능을 소개하는 블로그 글
* [대시보드 및 시각화](/use-cases/observability/clickstack/dashboards) — Chart Explorer를 사용해 차트를 수동으로 생성하는 방법
* [검색](/use-cases/observability/clickstack/search) — 전문 검색 및 속성 검색 구문
* [구성](/use-cases/observability/clickstack/config) — ClickStack의 모든 환경 변수
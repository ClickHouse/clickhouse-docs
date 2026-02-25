---
sidebar_label: 'Langfuse'
slug: /cloud/features/ai-ml/langfuse
title: 'Langfuse'
description: 'Langfuse는 팀이 LLM 애플리케이션을 디버깅, 분석 및 반복적으로 개선하기 위해 협업할 수 있도록 돕는 오픈 소스 LLM 엔지니어링 플랫폼입니다.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Langfuse \{#langfuse\}

## Langfuse란 무엇입니까? \{#what-is-langfuse\}

[Langfuse](https://langfuse.com)는 팀이 LLM 애플리케이션을 협업하여 디버깅하고, 분석하고, 반복 개선할 수 있도록 돕는 오픈 소스 LLM 엔지니어링 플랫폼입니다. ClickHouse 생태계의 일부이며, 핵심에 **ClickHouse**를 사용하여 확장 가능하고 고성능인 관측성 관측성 백엔드를 제공합니다.

ClickHouse의 열 지향 스토리지와 빠른 분석 기능을 활용하여 Langfuse는 수십억 개의 트레이스와 이벤트를 낮은 지연 시간으로 처리할 수 있어, 높은 처리량이 필요한 프로덕션 워크로드에도 적합합니다.

## Langfuse를 선택해야 하는 이유 \{#why-langfuse\}

- **오픈 소스:** 커스텀 통합을 위한 공개 API를 포함한 완전한 오픈 소스입니다.
- **프로덕션 최적화:** 성능 오버헤드를 최소화하도록 설계되었습니다.
- **최고 수준 SDKS:** Python 및 JavaScript용 네이티브 SDK를 제공합니다.
- **프레임워크 지원:** OpenAI SDK, LangChain, LlamaIndex 등 인기 있는 프레임워크와 통합됩니다.
- **멀티 모달:** 텍스트, 이미지 및 기타 모달리티에 대한 트레이싱을 지원합니다.
- **완전한 플랫폼:** LLM 애플리케이션 전체 개발 수명 주기를 위한 종합 도구 모음을 제공합니다.

## 배포 옵션 \{#deployment-options\}

Langfuse는 다양한 보안 및 인프라 요구 사항을 충족할 수 있도록 유연한 배포 옵션을 제공합니다.

**[Langfuse Cloud](https://cloud.langfuse.com)**는 최적의 성능을 위해 관리형 ClickHouse 클러스터를 기반으로 한 완전 관리형 서비스입니다. SOC 2 Type II 및 ISO 27001 인증을 받았으며, GDPR을 준수하고 미국(AWS us-west-2)과 EU(AWS eu-west-1) 데이터 리전에서 제공됩니다.

**[Self-hosted](https://langfuse.com/self-hosting)** Langfuse는 완전 오픈 소스(MIT 라이선스)이며 Docker 또는 Kubernetes를 사용하여 자체 인프라에 무료로 배포할 수 있습니다. 관측성 데이터를 저장하기 위해 자체 ClickHouse 인스턴스를 운영하거나 ClickHouse Cloud를 사용할 수 있으며, 이를 통해 데이터에 대한 완전한 통제권을 유지할 수 있습니다. 

## 아키텍처 \{#architecture\}

Langfuse는 오픈 소스 구성 요소에만 의존하며 로컬, 클라우드 인프라 또는 온프레미스 환경에 배포할 수 있습니다:

* **ClickHouse**: 대량의 관측성 데이터(트레이스, 스팬, 생성 결과, 점수)를 저장합니다. 대시보드를 위한 빠른 집계와 분석을 제공합니다.
* **Postgres**: 사용자 계정, 프로젝트 설정, 프롬프트 정의와 같은 트랜잭션 데이터를 저장합니다.
* **Redis**: 이벤트 큐잉과 캐싱을 처리합니다.
* **S3/Blob Storage**: 대용량 페이로드와 원시 이벤트 데이터를 저장합니다.

```mermaid
flowchart TB
    User["UI, API, SDKs"]
    subgraph vpc["VPC"]
        Web["Web Server<br/>(langfuse/langfuse)"]
        Worker["Async Worker<br/>(langfuse/worker)"]
        Postgres@{ img: "https://langfuse.com/images/logos/postgres_icon.svg", label: "Postgres - OLTP\n(Transactional Data)", pos: "b", w: 60, h: 60, constraint: "on" }
        Cache@{ img: "https://langfuse.com/images/logos/redis_icon.png", label: "Redis\n(Cache, Queue)", pos: "b", w: 60, h: 60, constraint: "on" }
        Clickhouse@{ img: "https://langfuse.com/images/logos/clickhouse_icon.svg", label: "Clickhouse - OLAP\n(Observability Data)", pos: "b", w: 60, h: 60, constraint: "on" }
        S3@{ img: "https://langfuse.com/images/logos/s3_icon.svg", label: "S3 / Blob Storage\n(Raw events, multi-modal attachments)", pos: "b", w: 60, h: 60, constraint: "on" }
    end
    LLM["LLM API/Gateway<br/>(optional; BYO; can be same VPC or VPC-peered)"]

    User --> Web
    Web --> S3
    Web --> Postgres
    Web --> Cache
    Web --> Clickhouse
    Web -..->|"optional for playground"| LLM

    Cache --> Worker
    Worker --> Clickhouse
    Worker --> Postgres
    Worker --> S3
    Worker -..->|"optional for evals"| LLM
```


## 기능 \{#features\}

### 관측성 \{#observability\}

[관측성](/docs/observability/overview)은 LLM 애플리케이션을 이해하고 디버깅하는 데 필수적입니다. 전통적인 소프트웨어와 달리 LLM 애플리케이션은 복잡하고 비결정적인 상호작용을 포함하므로 모니터링과 디버깅이 어렵습니다. Langfuse는 애플리케이션에서 실제로 어떤 일이 발생하는지 정확히 파악할 수 있도록 포괄적인 트레이싱 기능을 제공합니다.

_📹 더 자세히 알고 싶다면, Langfuse 관측성 기능과 이를 애플리케이션에 통합하는 방법을 다룬 [**엔드 투 엔드 데모 영상**](https://langfuse.com/watch-demo?tab=observability)을 시청하십시오._

<Tabs groupId="observability">
<TabItem value="trace-details" label="Trace 세부 정보">

트레이스를 사용하여 모든 LLM 호출과 애플리케이션의 기타 관련 로직을 추적할 수 있습니다.

<video src="https://static.langfuse.com/docs-videos/trace-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="sessions" label="세션">

세션을 사용하면 다단계 대화나 에이전트 기반 워크플로를 추적할 수 있습니다.

<video src="https://static.langfuse.com/docs-videos/sessions-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="timeline" label="타임라인">

타임라인 뷰를 확인하여 지연(latency) 문제를 디버깅하십시오.

<video src="https://static.langfuse.com/docs-videos/timeline-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="users" label="사용자">

각 사용자에 대한 비용과 사용량을 모니터링할 수 있도록 `userId`를 추가하십시오. 필요에 따라 시스템에서 이 뷰로 바로 이동하는 딥 링크를 생성할 수 있습니다.

<video src="https://static.langfuse.com/docs-videos/users-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="agent-graphs" label="에이전트 그래프">

LLM 에이전트를 그래프로 시각화하여 복잡한 에이전트 워크플로의 흐름을 보여줄 수 있습니다.

<video src="https://static.langfuse.com/docs-videos/langgraph-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="dashboard" label="대시보드">

대시보드에서 품질, 비용, 지연 시간과 관련된 메트릭을 확인하여 LLM 애플리케이션을 모니터링하십시오.

<video src="https://static.langfuse.com/docs-videos/dashboard.mp4%20MOVED%20TO%20R2.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
</Tabs>

### 프롬프트 관리 \{#prompt-management\}

[프롬프트 관리](/docs/prompt-management/overview)는 효과적인 LLM 애플리케이션을 구축하는 데 매우 중요합니다. Langfuse는 개발 수명 주기 전반에 걸쳐 프롬프트를 관리하고, 버전 관리하며, 최적화하는 데 도움이 되는 도구를 제공합니다.

_📹 더 자세히 알고 싶다면 Langfuse 프롬프트 관리와 애플리케이션에 통합하는 방법을 보여주는 [**엔드 투 엔드 데모 영상**](https://langfuse.com/watch-demo?tab=prompt)을 시청하십시오._

<Tabs groupId="prompt-management">
<TabItem value="create" label="Create">

UI, SDKs 또는 API를 통해 새 프롬프트를 생성하십시오.

<video src="https://static.langfuse.com/docs-videos/create-update-prompts.mp4%20MOVED%20TO%20R2.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="version-control" label="Version Control">

UI, API 또는 SDKs를 통해 협업 방식으로 프롬프트를 버전 관리하고 수정하십시오.

<video src="https://static.langfuse.com/docs-videos/create-prompt-version.mp4%20MOVED%20TO%20R2.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="deploy" label="Deploy">

코드 변경 없이 레이블을 통해 프롬프트를 프로덕션 또는 임의의 환경에 배포하십시오.

<video src="https://static.langfuse.com/docs-videos/deploy-prompt.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="metrics" label="Metrics">

서로 다른 프롬프트 버전 간의 지연 시간, 비용 및 평가 지표를 비교하십시오.

<video src="https://static.langfuse.com/docs-videos/prompt-metrics.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="test-in-playground" label="Test in Playground">

Playground에서 프롬프트를 즉시 테스트하십시오.

<video src="https://static.langfuse.com/docs-videos/prompt-to-playground.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="link-with-traces" label="Link with Traces">

프롬프트를 트레이스와 연결하여 LLM 애플리케이션 맥락에서 어떻게 동작하는지 파악하십시오.

<video src="https://static.langfuse.com/docs-videos/linked-generations.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="track-changes" label="Track Changes">

프롬프트 변경 사항을 추적하여 시간이 지남에 따라 어떻게 발전하는지 파악하십시오.

<video src="https://static.langfuse.com/docs-videos/track-changes.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
</Tabs>

### 평가 & 데이터셋 \{#evaluation\}

[평가](/docs/evaluation/overview)는 LLM 애플리케이션의 품질과 신뢰성을 보장하는 데 매우 중요합니다. Langfuse는 개발 환경에서의 테스트부터 프로덕션 성능 모니터링까지, 구체적인 요구사항에 맞게 사용할 수 있는 유연한 평가 도구를 제공합니다.

_📹 더 알고 싶다면 Langfuse Evaluation과 이를 활용해 LLM 애플리케이션을 개선하는 방법에 대한 [**엔드 투 엔드 워크스루 데모 영상**](https://langfuse.com/watch-demo?tab=evaluation)을 시청하십시오._

<Tabs groupId="evaluation">
<TabItem value="analytics" label="Analytics">

Langfuse Dashboard에서 평가 결과를 시각화합니다.

<video src="https://static.langfuse.com/docs-videos/scores-dashboard.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="user-feedback" label="User Feedback">

사용자로부터 피드백을 수집합니다. Browser SDK를 사용하는 프론트엔드나 SDKS 또는 API를 사용하는 서버 측에서 캡처할 수 있습니다. 영상에는 예시 애플리케이션이 포함되어 있습니다.

<video src="https://static.langfuse.com/docs-videos/scores-user-feedback.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="llm-as-a-judge" label="LLM-as-a-Judge">

프로덕션 또는 개발 트레이스에서 완전 관리형 LLM-as-a-judge 평가를 실행합니다. 애플리케이션 내 임의의 단계에 적용하여 단계별(step-wise) 평가를 수행할 수 있습니다.

<video src="https://static.langfuse.com/docs-videos/scores-llm-as-a-judge.mp4%20MOVED%20TO%20R2.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="experiments" label="Experiments">

데이터셋에 대해 프롬프트와 모델을 사용자 인터페이스에서 직접 평가합니다. 별도의 커스텀 코드는 필요하지 않습니다.

<video src="https://static.langfuse.com/docs-videos/prompt-experiments.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="annotation-queue" label="Annotation Queue">

Annotation Queue를 통한 사람 기반 어노테이션으로 평가 워크플로의 기준선을 마련합니다.

<video src="https://static.langfuse.com/docs-videos/scores-annotation-queue.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="custom-evals" label="Custom Evals">

사용자 정의 평가 결과를 추가합니다. 숫자형, 불리언(boolean), 범주형 값을 지원합니다.

```bash
POST /api/public/scores
```

Python 또는 JS SDK를 통해 점수를 추가합니다.

```python title="Example (Python)"
langfuse.score(
  trace_id="123",
  name="my_custom_evaluator",
  value=0.5,
)
```

</TabItem>
</Tabs>

## 빠른 시작 \{#quickstarts\}

몇 분이면 Langfuse를 시작할 수 있습니다. 현재 필요에 가장 잘 맞는 경로를 선택하십시오:

- [LLM 애플리케이션/에이전트 트레이싱 통합](https://langfuse.com/docs/observability/get-started)
- [프롬프트 관리 통합](https://langfuse.com/docs/prompt-management/get-started)
- [평가 설정](https://langfuse.com/docs/evaluation/overview)

## 더 알아보기 \{#learn-more\}

- [Langfuse 문서](https://langfuse.com/docs)
- [Langfuse GitHub 저장소](https://github.com/langfuse/langfuse)
- [데모 영상 보기](https://langfuse.com/watch-demo)
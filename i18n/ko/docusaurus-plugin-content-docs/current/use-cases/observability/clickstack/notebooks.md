---
slug: /use-cases/observability/clickstack/notebooks
title: 'ClickStack용 AI 노트북'
sidebar_label: 'AI 노트북'
pagination_prev: null
pagination_next: null
description: 'ClickStack용 AI 기반 조사 노트북'
doc_type: 'guide'
keywords: ['clickstack', 'AI 노트북', '조사', '관측성', 'HyperDX']
---

import Image from '@theme/IdealImage';
import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import notebook_hero from '@site/static/images/use-cases/observability/hyperdx-notebook-hero.png';
import notebook_list from '@site/static/images/use-cases/observability/hyperdx-notebook-list.png';
import notebook_tiles from '@site/static/images/use-cases/observability/hyperdx-notebook-tiles.png';
import notebook_branching from '@site/static/images/use-cases/observability/hyperdx-notebook-branching.png';
import notebook_branch_modal from '@site/static/images/use-cases/observability/hyperdx-notebook-branch-modal.png';
import notebook_manual_tiles from '@site/static/images/use-cases/observability/hyperdx-notebook-manual-tiles.png';
import notebook_agent_context from '@site/static/images/use-cases/observability/hyperdx-notebook-agent-context.png';
import notebook_ai_consent from '@site/static/images/use-cases/observability/hyperdx-notebook-ai-consent.png';

<PrivatePreviewBadge />

AI 노트북은 ClickStack에서 AI 에이전트와 수동 분석을 결합한 대화형 조사 도구입니다. 자연어로 문제를 설명하면 AI 에이전트가 대신 로그, 트레이스, 메트릭을 쿼리하여 관련 데이터, 차트, 요약을 일련의 타일 형태로 표시합니다. 또한 AI가 생성한 결과와 함께 직접 타일(차트, 테이블, 검색, Markdown 메모)을 추가하여 조사 내용을 완전한 기록으로 남길 수도 있습니다.

<Image img={notebook_hero} alt="Visa cache full 장애를 조사하는 AI Notebook" size="lg" />

:::note Managed ClickStack 전용
AI 노트북은 Managed ClickStack 배포에서만 사용할 수 있습니다.
:::

## 설정 \{#setup\}

AI 노트북은 현재 ClickHouse Cloud에서 비공개 프리뷰로 제공됩니다. AI 모델과 제공업체는 플랫폼에서 자동으로 관리됩니다.

AI 노트북을 사용하기 전에 다음 사항을 확인하십시오:

1. **생성형 AI 활성화** — 팀 관리자가 생성형 AI 동의 토글을 활성화해야 합니다. [생성형 AI 활성화](#enabling-generative-ai)를 참조하십시오.
2. **Notebook 접근 권한** — 역할에 Notebooks에 대한 읽기/쓰기 권한이 있어야 합니다.

활성화되면 적절한 역할이 있는 모든 사용자에게 왼쪽 사이드바에 **Notebooks** 항목이 표시됩니다.

## 생성형 AI 활성화 \{#enabling-generative-ai\}

노트북(및 기타 AI 기능)을 사용하려면 팀 관리자가 먼저 생성형 AI 동의 토글을 활성화해야 합니다.

1. **Team Settings &gt; Security Policies**로 이동합니다.
2. **Generative AI**를 켭니다.
3. 동의 대화상자를 검토하고 동의합니다.

<Image img={notebook_ai_consent} alt="Team Settings의 Generative AI 토글" size="lg" />

## AI 노트북 사용하기 \{#using-notebooks\}

### 노트북 만들기 \{#creating-a-notebook\}

1. 왼쪽 사이드바에서 **Notebooks**를 선택합니다.
2. **New Private Notebook**(본인에게만 표시됨) 또는 **New Shared Notebook**(팀원에게 표시됨)을 클릭합니다.

노트북 목록 페이지에는 액세스할 수 있는 모든 노트북이 표시됩니다. 이름이나 태그로 필터링하거나 **My Notebooks**와 **All Notebooks** 사이에서 전환할 수 있습니다.

<Image img={notebook_list} alt="노트북 목록 페이지" size="lg" />

### AI 조사 실행하기 \{#running-investigation\}

노트북 하단에서 조사하려는 내용을 설명하는 프롬프트를 입력하십시오. 예를 들어, *&quot;지난 1시간 동안 checkout service에서 오류율이 급증한 이유는 무엇인가요?&quot;*

**Send**를 누르거나 Enter 키를 누르십시오. AI 에이전트는 다음을 수행합니다.

1. 사용 가능한 데이터 소스를 확인합니다.
2. 로그, 트레이스, 메트릭을 대상으로 검색 및 집계 쿼리를 실행합니다.
3. 추론 과정, 실행한 쿼리, 중간 차트, 그리고 결론이 포함된 최종 요약을 보여주는 일련의 타일을 생성합니다.

각 단계는 노트북에 타일 형태로 표시됩니다. **사고 과정** 타일은 각 쿼리의 추론 근거를 보여주고, **출력** 타일에는 에이전트의 결론과 선택적 차트가 포함됩니다. 일반적인 AI 채팅과 달리, 노트북에서는 각 단계에서 AI가 정확히 어떤 데이터로 작업하는지 확인할 수 있으므로 추론을 검증하고, AI가 놓쳤을 수 있는 흥미로운 단서를 찾아내고, 조사를 다른 방향으로 유도하기 위해 [분기](#branching)할 수 있습니다.

조사가 실행 중인 동안에는 **Stop**을 클릭하여 취소할 수 있습니다.

<Image img={notebook_tiles} alt="AI가 생성한 타일이 있는 노트북" size="lg" />

### 조사 분기하기 \{#branching\}

AI가 조사를 진행하는 중에 중간 단계에서 흥미로운 내용이 드러났는데도 에이전트가 다른 경로로 계속 진행하는 경우가 있습니다. **분기**를 사용하면 원래 조사 경로를 유지한 채 해당 지점에서 다른 프롬프트로 다시 시작할 수 있습니다.

분기를 생성하려면 다음과 같이 하십시오:

1. 사고 과정 타일을 펼친 다음 **Restart from Here**를 클릭합니다.
2. 대화 상자에서 조사를 새로운 방향으로 이끌 수정된 프롬프트를 입력합니다.
3. **Interrupt &amp; Create Branch**를 클릭합니다. AI가 해당 지점에서 새 조사 분기를 시작합니다.

<Image img={notebook_branch_modal} alt="새 분기 생성 대화 상자" size="md" />

타일에 분기가 여러 개 생기면 타일 헤더에 왼쪽 및 오른쪽 화살표 버튼이 표시되고, 분기 수를 나타내는 배지(예: **1/2**)도 함께 나타납니다. 화살표를 클릭하여 분기 사이를 전환합니다.

<Image img={notebook_branching} alt="타일의 분기 탐색 화살표와 1/2 배지" size="lg" />

### 수동 타일 추가 \{#manual-tiles\}

AI가 생성한 타일 외에도, 노트북 하단의 버튼을 사용하여 분석 블록을 직접 추가할 수 있습니다:

| Button       | Shortcut | Description                                                                           |
| ------------ | -------- | ------------------------------------------------------------------------------------- |
| **Search**   | `S`      | 검색 페이지와 동일한 로그/트레이스 검색 보기입니다.                                                         |
| **Chart**    | `L`      | [대시보드](/use-cases/observability/clickstack/dashboards)와 동일한 시각화 빌더를 사용하는 시계열 선 차트입니다. |
| **Table**    | `T`      | 표 형식의 집계 보기입니다.                                                                       |
| **Markdown** | `M`      | 메모, 가설 또는 결론을 작성할 수 있는 자유 형식 텍스트입니다.                                                  |

타일을 추가하면 인라인 편집 모드로 열리며, 여기서 데이터 소스, 필터, 집계를 구성할 수 있습니다. 이때 사용하는 인터페이스는 [대시보드 시각화](/use-cases/observability/clickstack/dashboards#creating-visualizations)를 구축할 때와 동일합니다. 타일 추가를 완료하려면 **Save**를 클릭하십시오.

수동 타일은 현재 분기에서 마지막으로 표시된 타일 아래에 추가됩니다. 타일 하단 가장자리를 끌어 세로 크기를 조정할 수 있습니다.

<Image img={notebook_manual_tiles} alt="노트북 하단의 수동 타일 버튼" size="lg" />

:::note
현재 AI 조사가 실행 중이면 수동 타일을 추가하거나 편집할 때 해당 조사가 취소됩니다. 계속 진행하기 전에 확인 대화상자가 표시됩니다.
:::

### 공유 및 정리 \{#sharing-organizing\}

* **비공개 vs. 공유** — 노트북 헤더의 자물쇠 아이콘을 눌러 비공개(본인만 볼 수 있음)와 공유(팀에서 볼 수 있음) 사이를 전환합니다. 이 설정은 노트북 생성자만 변경할 수 있습니다.
* **태그** — 목록 페이지에서 쉽게 필터링할 수 있도록 노트북에 태그를 추가합니다.
* **이름 지정** — 노트북 제목을 클릭해 이름을 바꿉니다. 제목 없는 노트북에서 조사를 시작하면 AI가 자동으로 이름을 제안합니다.

### 사용자 지정 에이전트 컨텍스트 \{#custom-agent-context\}

팀 관리자는 팀의 모든 AI 노트북 조사에 포함되는 추가 컨텍스트를 제공할 수 있습니다. 이는 시스템 아키텍처, 명명 규칙, 알려진 문제 등에 대한 배경 정보를 AI에 제공할 때 유용합니다.

구성하려면 다음 단계를 수행하십시오:

1. 왼쪽 사이드바에서 **Notebooks**로 이동합니다.
2. **Agent Settings**를 엽니다(팀 관리자만 사용할 수 있음).
3. 사용자 지정 컨텍스트를 입력한 다음(최대 50,000자) 저장합니다.

이 컨텍스트는 팀 전체의 모든 노트북 조사에 대해 AI의 시스템 프롬프트에 추가됩니다.

<Image img={notebook_agent_context} alt="사용자 지정 컨텍스트용 Agent Settings 패널" size="lg" />
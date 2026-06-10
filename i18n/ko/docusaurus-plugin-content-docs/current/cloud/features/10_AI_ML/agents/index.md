---
sidebar_label: '개요'
slug: /cloud/features/ai-ml/agents
title: 'ClickHouse Agents'
description: 'ClickHouse Cloud의 ClickHouse Agents에 대한 개요'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'agent builder']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse Agents를 사용하면 SQL이나 오케스트레이션 로직을 직접 작성하지 않고도 대화를 통해 ClickHouse 데이터를 쿼리하고 탐색할 수 있습니다.
에이전트가 의도를 해석하고, 단계를 계획하며, 구성한 도구를 호출하고, 결과를 반환합니다.
이 기능은 현재 베타 단계이며, 동작 방식과 기능은 일반 제공 전에 변경될 수 있습니다.

## 이 기능으로 할 수 있는 작업 \{#what-you-can-do\}

ClickHouse Agents를 사용하면 다음 작업을 수행할 수 있습니다:

* 코드 작성 없이 사용자 지정 에이전트를 만들 수 있습니다. 지침을 작성하고, 모델을 선택하고, 도구를 추가할 수 있습니다.
* ClickHouse 서비스에서 대화를 실행할 수 있으며, 에이전트가 필요에 따라 도구를 호출합니다.
* 에이전트를 팀원과 공유하거나 마켓플레이스에 게시할 수 있습니다.

## 이 섹션에서는 \{#in-this-section\}

아래 페이지에서 ClickHouse Agents의 기능을 자세히 알아보십시오.

| 페이지                                                         | 다루는 내용                                        |
| ----------------------------------------------------------- | --------------------------------------------- |
| [빠른 시작](/cloud/features/ai-ml/agents/quickstart)            | 첫 번째 에이전트를 만들고 예시 쿼리를 실행합니다                   |
| [Chat](/cloud/features/ai-ml/agents/chat)                   | 대화, 북마크, 포크, 멀티 대화 및 공유                       |
| [Agent Builder](/cloud/features/ai-ml/agents/builder)       | 에이전트 구성, 모델 매개변수, 연결된 도구, MCP 서버, 스킬 및 서브에이전트 |
| [Prompts](/cloud/features/ai-ml/agents/prompts)             | 저장된 프롬프트 라이브러리                                |
| [Memory](/cloud/features/ai-ml/agents/memory)               | 대화 전반에 걸쳐 유지되는 컨텍스트                           |
| [마켓플레이스](/cloud/features/ai-ml/agents/marketplace)          | 조직 내에서 에이전트를 공유하고 찾아보기                        |
| [공유 및 액세스](/cloud/features/ai-ml/agents/sharing-and-access) | 에이전트에 대한 권한 모델                                |
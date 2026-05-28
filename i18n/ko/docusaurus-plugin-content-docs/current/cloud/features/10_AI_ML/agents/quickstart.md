---
sidebar_label: '빠른 시작'
sidebar_position: 1
slug: /cloud/features/ai-ml/agents/quickstart
title: '빠른 시작'
description: 'ClickHouse Cloud 서비스에 연결할 첫 번째 ClickHouse Agent를 빌드하고 실행합니다'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'quickstart', 'agent builder']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import agentBuilder from '@site/static/images/cloud/agent-builder/agent-builder.png';
import capabilities from '@site/static/images/cloud/agent-builder/capabilities.png';
import toolsButton from '@site/static/images/cloud/agent-builder/tools-button.png';
import toolsModal from '@site/static/images/cloud/agent-builder/tools-modal.png';
import chatQuery from '@site/static/images/cloud/agent-builder/chat-query.png';
import launchAgents from '@site/static/images/cloud/agent-builder/launch-ch-agents.png';

<BetaBadge />

Cloud Console에서 사용자 지정 에이전트를 만들고 서비스에 대해 자연어 쿼리를 실행합니다.

## 사전 요구 사항 \{#prerequisites\}

* 쿼리를 실행할 수 있는 ClickHouse Cloud 서비스.
* Agent Builder의 **에이전트 만들기** 옵션. 이 옵션이 보이지 않으면 [sharing and access](/cloud/features/ai-ml/agents/sharing-and-access)에 설명된 대로 조직 관리자에게 Admin Settings에서 에이전트 생성 권한을 부여해 달라고 요청하십시오.

## 에이전트 만들기 \{#build-the-agent\}

<VerticalStepper headerLevel="h3">
  ### ClickHouse Agents 실행 \{#launch-agents\}

  Cloud service에서 왼쪽 사이드바의 **ClickHouse agents**를 클릭해 에이전트 런치패드를 여십시오. **Launch ClickHouse agents**를 클릭하면 Agent Builder가 열립니다.

  <Image img={launchAgents} alt="ClickHouse agents(베타)가 선택된 Cloud service 탐색 화면으로, Launch ClickHouse agents 버튼이 있는 런치패드를 보여줍니다" size="lg" />

  ### 에이전트 생성 \{#create-the-agent\}

  Agent Builder에서 왼쪽 패널 상단의 **Create New Agent**를 클릭하십시오. 다음 핵심 필드를 입력하십시오.

  * **Name** - 에이전트의 짧은 식별자입니다.
  * **Description** - 에이전트의 용도를 설명하는 내용으로, 팀원에게 표시됩니다.
  * **Category** - 에이전트의 카테고리입니다. 조직에 사용자 지정 카테고리가 없다면 `General`로 두어도 됩니다.
  * **Instructions** - 시스템 프롬프트로, 에이전트의 역할, 답변해야 하는 질문, 따라야 하는 비즈니스 규칙을 설명합니다.
  * **Model** - 드롭다운에서 모델을 선택합니다.

  <Image img={agentBuilder} alt="Create New Agent 드롭다운, 양식 필드(Name, Description, Category, Instructions, Model), 그리고 Capabilities 섹션을 보여주는 Agent Builder 패널" size="lg" />

  ### 기능과 도구 연결 \{#attach-tools\}

  에이전트의 기능과 도구는 두 곳에서 설정할 수 있습니다.

  메인 패널의 **Capabilities** — [Run Code](/cloud/features/ai-ml/agents/builder/code-interpreter), [웹 검색](/cloud/features/ai-ml/agents/builder/web-search), File Context, Artifacts, [MCP 서버](/cloud/features/ai-ml/agents/builder/mcp-servers), [Skills](/cloud/features/ai-ml/agents/builder/skills)와 같은 퍼스트파티 기능입니다. 에이전트에 필요한 항목을 켜십시오.

  <Image img={capabilities} alt="Run Code, 웹 검색, File Context, Artifacts, MCP 서버, Skills 토글을 보여주는 Agent Builder 패널의 Capabilities 섹션" size="sm" />

  패널 하단의 **Add Tools** 버튼에서 여는 **Tools** — [이미지 생성](/cloud/features/ai-ml/agents/builder/image-generation), [비전](/cloud/features/ai-ml/agents/builder/vision), 검색 API, 외부 서비스와 같은 서드파티 통합입니다.

  <Image img={toolsButton} alt="Add Tools 버튼이 강조 표시된 Agent Builder 패널 하단" size="sm" />

  **Add Tools**를 클릭해 카탈로그를 살펴보십시오.

  <Image img={toolsModal} alt="Google, OpenAI Image Tools, Wolfram, DALL-E-3, Tavily Search, Calculator, Stable Diffusion을 포함한 서드파티 통합 그리드를 보여주는 Agent Tools 모달" size="lg" />

  [서브에이전트](/cloud/features/ai-ml/agents/builder/subagents)는 **Advanced settings**에서 설정합니다. 자세한 내용은 서브에이전트 페이지를 참조하십시오.

  연결된 기능과 도구는 언제든지 변경할 수 있습니다.

  ### 쿼리 실행 \{#run-a-query\}

  에이전트를 저장한 다음 새 대화를 열고 에이전트 선택기에서 해당 에이전트를 선택하십시오. 예를 들어 *&quot;What are my top 10 tables by row count this week?&quot;* 와 같은 질문을 입력하면, 에이전트가 계획을 세우고 필요에 따라 도구를 호출한 뒤 답변을 반환합니다.

  <Image img={chatQuery} alt="'What are my top 10 tables by row count this week?'라는 질문과 에이전트의 응답을 보여주는 채팅 화면으로, 행 수 기준으로 서비스 전반의 상위 10개 테이블 순위가 담긴 Markdown 표와 그 아래 Key Observations가 표시됩니다" size="lg" />
</VerticalStepper>

## 다음 단계 \{#next-steps\}

* 팀원과 [에이전트를 공유하세요](/cloud/features/ai-ml/agents/sharing-and-access).
* 에이전트가 안정화되면 [마켓플레이스](/cloud/features/ai-ml/agents/marketplace)에 게시하세요.
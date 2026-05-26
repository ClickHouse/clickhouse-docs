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

<BetaBadge />

Cloud Console에서 사용자 지정 에이전트를 만들고 서비스에 대해 자연어 쿼리를 실행합니다.

## 사전 요구 사항 \{#prerequisites\}

* 쿼리를 실행할 수 있는 ClickHouse Cloud 서비스.
* Agent Builder의 **에이전트 만들기** 옵션. 이 옵션이 보이지 않으면 [sharing and access](/cloud/features/ai-ml/agents/sharing-and-access)에 설명된 대로 조직 관리자에게 Admin Settings에서 에이전트 생성 권한을 부여해 달라고 요청하십시오.

## 에이전트 만들기 \{#create-the-agent\}

Cloud Console에서 Agents를 열고 Agent Builder 사이드 패널에서 **에이전트 만들기**를 클릭하십시오. 다음 기본 필드를 입력하십시오:

* **이름** — 짧은 식별자입니다.
* **설명** — 팀원이 에이전트의 용도를 알 수 있도록 한 줄로 작성합니다.
* **지침** — 시스템 프롬프트입니다. 에이전트의 역할, 답변해야 할 질문, 따라야 할 비즈니스 규칙을 설명합니다.
* **모델** — 드롭다운에서 모델을 선택합니다. [모델 매개변수](/cloud/features/ai-ml/agents/builder/model-parameters)에서 temperature와 기타 생성 설정을 조정합니다.

## 도구 연결 \{#attach-tools\}

에이전트에 필요한 기능을 결정합니다. Builder에서 다음을 추가할 수 있습니다.

* [Code interpreter](/cloud/features/ai-ml/agents/builder/code-interpreter) — 계산 및 데이터 변환을 위한 샌드박스 코드 실행.
* [Web search](/cloud/features/ai-ml/agents/builder/web-search) — 공개 웹 검색.
* [Image generation](/cloud/features/ai-ml/agents/builder/image-generation) and [vision](/cloud/features/ai-ml/agents/builder/vision) — 시각적 출력 및 입력 처리.
* [MCP servers](/cloud/features/ai-ml/agents/builder/mcp-servers) — Model Context Protocol을 통한 서드파티 도구.
* [Skills](/cloud/features/ai-ml/agents/builder/skills) and [Subagents](/cloud/features/ai-ml/agents/builder/subagents) — 재사용 가능한 지침 묶음과 작업 위임.

연결된 도구는 언제든지 변경할 수 있습니다.

## 쿼리 실행하기 \{#run-a-query\}

에이전트를 저장한 다음 새 대화를 열고, 에이전트 선택기에서 해당 에이전트를 선택합니다. 질문을 입력하십시오 — 예를 들어, *&quot;이번 주에 행 수 기준 상위 10개 테이블은 무엇인가요?&quot;* — 그러면 에이전트가 작업을 계획하고 필요에 따라 도구를 호출해 답변을 반환합니다.

## 다음 단계 \{#next-steps\}

* 팀원과 [에이전트를 공유하세요](/cloud/features/ai-ml/agents/sharing-and-access).
* 에이전트가 안정화되면 [마켓플레이스](/cloud/features/ai-ml/agents/marketplace)에 게시하세요.
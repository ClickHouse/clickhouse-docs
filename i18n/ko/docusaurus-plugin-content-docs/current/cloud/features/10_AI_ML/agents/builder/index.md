---
sidebar_label: '개요'
slug: /cloud/features/ai-ml/agents/builder
title: 'Agent Builder'
description: 'Agent Builder에서 ClickHouse Agents를 생성하고 구성합니다'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'Agent Builder', '도구', '지침']
doc_type: '참고'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

Agent Builder는 에이전트를 생성하고 구성하는 곳입니다. Cloud 콘솔에서 사이드 패널로 열립니다.

패널은 세 개의 섹션으로 구성됩니다.

* 상단의 **아이덴티티** — 이름, 설명, 아바타, 지침 필드(시스템 프롬프트)
* 중간의 **모델 구성** — provider, 모델, 생성 매개변수
* 하단의 **기능** — 연결하는 도구, MCP 서버, 스킬, 하위 에이전트

푸터의 버튼을 클릭하여 저장하십시오. 변경 사항은 다음 대화부터 적용되며, 진행 중인 실행은 중단되지 않습니다.

## 아이덴티티 \{#identity\}

`instructions` 필드는 에이전트의 시스템 프롬프트입니다. 에이전트의 역할, 답변해야 하는 질문 유형, 따라야 하는 규칙을 설명하십시오. 에이전트가 ClickHouse 서비스에 쿼리하는 경우 스키마 규약, 계산된 메트릭, 용어를 구체적으로 명시하십시오 — 모델은 비즈니스 정의를 스스로 추론할 수 없습니다.

## 핵심 설정 \{#core-configuration\}

* [모델 매개변수](/cloud/features/ai-ml/agents/builder/model-parameters) — 모델을 선택하고 생성 매개변수를 조정합니다. 구성을 이름 있는 프리셋으로 저장해 재사용할 수 있습니다.

## 기본 제공 도구 \{#built-in-tools\}

* [Code interpreter](/cloud/features/ai-ml/agents/builder/code-interpreter) — 샌드박스 환경에서 코드를 실행합니다.
* [Web search](/cloud/features/ai-ml/agents/builder/web-search) — 공개 웹을 검색합니다.
* [Image generation](/cloud/features/ai-ml/agents/builder/image-generation) — 텍스트에서 이미지를 생성합니다.
* [Vision](/cloud/features/ai-ml/agents/builder/vision) — 이미지 입력을 처리합니다.

## 확장성 \{#extensibility\}

* [MCP servers](/cloud/features/ai-ml/agents/builder/mcp-servers) — 타사 MCP 서버를 에이전트에 연결합니다.
* [Skills](/cloud/features/ai-ml/agents/builder/skills) — 재사용 가능한 지침 패키지입니다.
* [Subagents](/cloud/features/ai-ml/agents/builder/subagents) — 작업을 하위 에이전트에 위임합니다.
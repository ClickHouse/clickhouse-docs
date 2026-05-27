---
sidebar_label: '프롬프트'
sidebar_position: 5
slug: /cloud/features/ai-ml/agents/prompts
title: '프롬프트'
description: 'ClickHouse Agents용 저장 프롬프트 라이브러리'
keywords: ['AI', 'ClickHouse Cloud', 'agents', '프롬프트', '템플릿']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

프롬프트 라이브러리는 반복해서 입력하게 되는 자연어 프롬프트를 저장하고 재사용할 수 있는 공간입니다. 컴포저에 사용하는 스니펫처럼 생각하면 됩니다. 동일한 분석 질문이나 포맷 지시가 여러 대화에서 반복될 때 유용합니다.

## 프롬프트 만들기 \{#create-a-prompt\}

프롬프트 패널을 열고 **New prompt**를 클릭하십시오. 다음을 지정합니다:

* **제목** — 선택기에 표시되는 이름입니다. 구체적으로 작성하십시오: *&quot;WAU&quot;*보다 *&quot;지역별 주간 활성 사용자&quot;*가 더 좋습니다.
* **본문** — 컴포저에 실제로 삽입되는 텍스트입니다.
* **선택적 변수** — 삽입할 때 값을 입력하는 본문의 플레이스홀더입니다. `{{name}}` 형식의 마커를 사용하십시오. 삽입 전에 값을 입력하라는 메시지가 표시됩니다.

라이브러리가 커져도 쉽게 탐색할 수 있도록 관련 프롬프트를 카테고리나 태그로 그룹화하십시오.

## 프롬프트 사용하기 \{#use-a-prompt\}

대화에서 컴포저의 프롬프트 선택기를 열고, 사용할 프롬프트를 검색하거나 찾아보십시오. 프롬프트에 변수가 있으면 값을 입력하십시오. 본문이 컴포저에 삽입되며, 전송하기 전에 그곳에서 편집할 수 있습니다.

## 프롬프트 공유 \{#share-prompts\}

프롬프트는 에이전트와 동일한 접근 권한 모델을 따릅니다. 기본적으로 비공개이며, 특정 사용자 또는 그룹과 공유할 수 있고 조직 전체에 공개할 수도 있습니다. [공유 및 접근](/cloud/features/ai-ml/agents/sharing-and-access)을 참조하십시오.

## 프롬프트 vs. Skills vs. 지침 \{#prompts-vs-skills-vs-instructions\}

* **프롬프트**는 사용자가 삽입한 뒤 편집할 수 있는 일회성 텍스트 조각입니다. 문구는 사용자가 직접 조정합니다.
* **[Skills](/cloud/features/ai-ml/agents/builder/skills)**는 에이전트가 스스로 활성화하는 지침 패키지입니다.
* **에이전트 지침**은 에이전트에 지속적으로 적용되는 system prompt입니다.

표현을 재사용하되 매번 문구를 직접 제어하려면 프롬프트를 사용하십시오.
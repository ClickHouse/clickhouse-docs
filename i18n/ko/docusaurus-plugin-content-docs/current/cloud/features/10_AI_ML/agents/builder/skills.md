---
sidebar_label: 'Skills'
sidebar_position: 9
slug: /cloud/features/ai-ml/agents/builder/skills
title: 'Skills'
description: 'ClickHouse Agents용으로 재사용할 수 있는 지침 패키지'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'skills', 'SKILL.md']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

스킬은 에이전트가 필요할 때 적용할 수 있는 재사용 가능한 지침 묶음입니다. 각 에이전트의 system prompt에 지침을 중복해서 넣기보다는, 브랜드 스타일 가이드, 코드 리뷰 체크리스트, 특정 워크플로용 런북처럼 여러 에이전트에서 반복적으로 사용하는 절차에 스킬을 사용하십시오.

## 스킬의 구성 \{#anatomy-of-a-skill\}

스킬은 간단한 프론트매터 헤더를 포함한 Markdown 파일입니다:

```markdown
---
name: revenue-report
description: Generates the weekly revenue report using our standard segments
always-apply: false
user-invocable: true
---

When asked to generate a revenue report:
1. Filter to the requested period.
2. Apply the standard MRR formula:
     SUM(CASE
       WHEN billing_cycle = 'monthly' THEN amount
       WHEN billing_cycle = 'yearly'  THEN amount / 12
       ELSE 0
     END)
3. Break down by segment: Enterprise, Mid-Market, SMB.
4. Render the result as a Markdown table.
```

프론트매터에서 가장 중요한 설정은 다음과 같습니다:

* **`name`** - 케밥 케이스 식별자입니다.
* **`description`** - 이 스킬이 언제 적절한지 모델이 판단할 때 사용하는 짧은 요약입니다. 가장 중요한 필드로 취급하십시오. 구체적으로 작성하세요. 설명이 모호하면 잘못된 스킬이 호출될 수 있습니다.
* **`always-apply`** - `true`이면 선택되는 대신 모든 턴에 이 스킬이 항상 적용됩니다. 꼭 필요한 경우에만 사용하십시오. `always-apply` 스킬은 모든 메시지에서 컨텍스트를 소비합니다.
* **`user-invocable`** - `true`이면(기본값) 이 스킬이 수동 선택용 `$` 팝오버에 표시됩니다.

`SKILL.md`와 관련 에셋이 포함된 `.zip` 파일을 업로드하면 참고 문서, 예제 쿼리, 작은 스크립트 같은 지원 파일을 스킬과 함께 묶을 수 있습니다.

## 스킬 사용 \{#use-a-skill\}

대화 중 에이전트가 스킬을 사용하는 방법은 세 가지입니다.

* **사용자 호출** - 작성 창에서 `$`를 누르고 팝오버에서 스킬을 선택하십시오. 그러면 다음 턴에 사용할 수 있도록 스킬 내용이 미리 적용됩니다.
* **모델 자동 선택** - 스킬의 `description`을 바탕으로, 에이전트가 언제 이를 적용할지 스스로 결정합니다.
* **항상 적용** - 이렇게 구성된 스킬은 모든 턴에 미리 적용됩니다.

## Skills 관리 \{#manage-skills\}

Cloud Console의 Skills 패널에서는 인라인으로 Skills를 생성하고, `.md` 또는 `.zip` 파일을 업로드하며, 사용자 계정에서 어떤 Skills를 활성화할지 관리할 수 있습니다. 소유한 Skills는 기본적으로 활성화되어 있습니다. 하나를 비활성화하면 삭제하지 않고도 팝오버와 모델 카탈로그에서 제거됩니다.

Skills는 다른 사용자와 공유할 수 있습니다([공유 및 액세스](/cloud/features/ai-ml/agents/sharing-and-access) 참조).

## 스킬와 지침 \{#skills-vs-instructions\}

* **에이전트 지침**은 에이전트가 무엇인지, 그리고 전반적으로 어떻게 동작하는지를 정의합니다. 해당 에이전트에서 항상 활성화됩니다.
* **스킬**는 상황에 따라 적용됩니다 — 관련이 있을 때만 적용되며, 특정 워크플로에 한정됩니다.

여러 에이전트에서 동일한 단계별 지침이 반복해서 필요하거나, 모든 상호작용이 아니라 특정 사용자 요청에서만 실행되도록 하려면 스킬을 사용하십시오.
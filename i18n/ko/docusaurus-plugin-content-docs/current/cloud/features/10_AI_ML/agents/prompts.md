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
import Image from '@theme/IdealImage';
import createPrompt from '@site/static/images/cloud/agent-builder/prompts/create-prompt.png';
import preview from '@site/static/images/cloud/agent-builder/prompts/preview.png';
import usePromptModal from '@site/static/images/cloud/agent-builder/prompts/use-prompt-modal.png';

<BetaBadge />

프롬프트 라이브러리는 반복해서 입력하게 되는 자연어 프롬프트를 저장하고 재사용할 수 있는 공간입니다. 컴포저에 사용하는 스니펫처럼 생각하면 됩니다. 동일한 분석 질문이나 포맷 지시가 여러 대화에서 반복될 때 유용합니다.

## 프롬프트 만들기 \{#create-a-prompt\}

왼쪽 탐색의 **프롬프트** 아이콘에서 **프롬프트** 패널을 열고 **+** 버튼을 클릭하여 **프롬프트 만들기** 양식을 여십시오. 다음 필드를 입력하십시오.

* **프롬프트 이름**(필수) - 선택기에 표시되는 이름입니다. 알아보기 쉽게 작성하십시오. *&quot;지역별 주간 활성 사용자 수&quot;*는 *&quot;WAU&quot;*보다 더 적절합니다.
* **텍스트**(필수) - 컴포저에 실제로 삽입될 텍스트입니다.
* **특수 변수** - **특수 변수** 버튼을 클릭하여 플레이스홀더를 삽입하거나 `{{name}}` 형식의 마커를 직접 입력하십시오. 선택기에서는 삽입 전에 값을 입력하라는 메시지가 표시됩니다.
* **카테고리**, **설명**, **명령어**(선택 사항) - 라이브러리 구성, 선택기 미리보기 텍스트, 빠른 실행 바로가기에 사용됩니다.

그런 다음 오른쪽 아래의 **프롬프트 만들기**를 클릭하십시오.

<Image img={createPrompt} alt="왼쪽에서 + 버튼이 강조 표시된 프롬프트 패널과, 오른쪽에서 프롬프트 이름, 텍스트, 카테고리, 특수 변수, 설명, 명령어 필드 및 프롬프트 만들기 버튼이 표시된 열린 프롬프트 만들기 양식" size="lg" />

## 프롬프트 사용하기 \{#use-a-prompt\}

프롬프트 패널에서 프롬프트 카드의 **...** 메뉴를 열고 **Preview**를 선택하십시오:

<Image img={preview} alt="프롬프트가 선택되어 있고 오른쪽에 세부 정보가 표시되며, Preview 및 Edit 옵션이 있는 컨텍스트 메뉴가 열린 프롬프트 패널" size="lg" />

미리 보기에는 프롬프트 텍스트와 함께 작성자 및 날짜가 표시됩니다. **Use Prompt**를 클릭하여 본문을 컴포저에 넣으십시오. 프롬프트에 변수가 있으면 먼저 값을 입력하십시오.

<Image img={usePromptModal} alt="프롬프트 제목, 작성자, 날짜, 본문 텍스트, Use Prompt 버튼이 표시된 프롬프트 미리 보기 모달" size="md" />

## 프롬프트 공유 \{#share-prompts\}

기본적으로 프롬프트는 작성자만 사용할 수 있습니다. 소유자는 프롬프트의 공개 범위를 다음과 같이 변경할 수 있습니다.

* **특정 사용자 또는 그룹** - 지정한 사용자라면 누구나 프롬프트를 찾아 사용할 수 있습니다.
* **조직 전체** - ClickHouse Cloud 조직의 모든 사용자가 프롬프트를 찾아 사용할 수 있습니다.

프롬프트는 에이전트와 동일한 권한 모델을 사용합니다. 역할별 전체 권한 매트릭스와 각 역할에서 수행할 수 있는 작업은 [공유 및
액세스](/cloud/features/ai-ml/agents/sharing-and-access)를 참조하십시오.

## 프롬프트 vs. 스킬 vs. 지침 \{#prompts-vs-skills-vs-instructions\}

프롬프트, 스킬, 에이전트 지침은 모두 모델에 텍스트를 추가하지만, 무엇이 이를 실행하게 하는지와 얼마나 오래 유지되는지에서 차이가 있습니다.

* **프롬프트** - 사용자가 직접 컴포저에 삽입하는 텍스트로, 매 턴마다 편집합니다.
* **[스킬](/cloud/features/ai-ml/agents/builder/skills)** - 에이전트가 작업과 관련이 있다고 판단할 때 자체적으로 불러오는 지침 모음입니다.
* **에이전트 지침** - 모든 대화에 적용되는 에이전트의 지속적인 시스템 프롬프트입니다.

표현을 재사용하되 매번 문구는 직접 조정하려면 프롬프트를 사용하십시오. 직접 입력하지 않아도 특정 작업 유형 전반에 걸쳐 동일한 지침이 일관되게 적용되도록 하려면 스킬을 사용하십시오. 에이전트의
전체 수명 동안 동일한 동작이 유지되어야 한다면 에이전트 지침을 사용하십시오.
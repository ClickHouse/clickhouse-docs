---
sidebar_label: '메모리'
sidebar_position: 6
slug: /cloud/features/ai-ml/agents/memory
title: '메모리'
description: 'ClickHouse Agents의 메모리와 개인화'
keywords: ['AI', 'ClickHouse Cloud', 'agents', '메모리', '개인화']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import memories from '@site/static/images/cloud/agent-builder/memory/memories.png';
import create from '@site/static/images/cloud/agent-builder/memory/create.png';
import edit from '@site/static/images/cloud/agent-builder/memory/edit.png';
import deleteMemory from '@site/static/images/cloud/agent-builder/memory/delete.png';
import filter from '@site/static/images/cloud/agent-builder/memory/filter.png';
import toggle from '@site/static/images/cloud/agent-builder/memory/toggle.png';

<BetaBadge />

메모리는 여러 대화에 걸쳐 에이전트가 참조할 수 있는 사용자별 저장소입니다. 이는 여러 항목으로 구성되며, 각 항목은 키-값 쌍입니다 - 선호하는
날짜 포맷, 주로 쿼리하는 데이터베이스, 응답을 얼마나 간결하게 받을지와 같은 정보입니다. 에이전트는 이러한 정보가 관련 있을 때 이를 Context로 불러옵니다.

## 메모리 작동 방식 \{#how-it-works\}

작은 메모리 에이전트가 주 대화와 함께 실행됩니다. 이 에이전트는 최근 메시지를 읽고, 무엇을 기억해 둘 가치가 있는지 판단한 다음, 사용자별 저장소에 항목을 기록합니다.
다음 대화에서는 이러한 항목을 맥락 정보로 사용할 수 있으므로, 같은 내용을 반복할 필요 없이 주 에이전트가 이를 참조할 수 있습니다.

사용자에게는 이것이 대화의 연속성으로 느껴집니다. 예를 들어 SQL 출력은 소문자로 표시하는 것을 선호하고 회계연도는 3월에 끝난다고 한 번만 알려두면, 이후 대화에서는 그에 맞게 동작합니다.

## 메모리 관리 \{#manage-your-memories\}

왼쪽 탐색 메뉴에서 **Memories**(뇌) 아이콘을 열어 메모리 패널을 여십시오. 이 패널에는 저장된 메모리가 나열되며, 항목을 생성, 편집, 삭제하고 필터링하는 컨트롤이 제공됩니다.

<Image img={memories} alt="왼쪽 탐색 메뉴에서 뇌 아이콘이 강조 표시되어 있고, 필터 입력란, Add 버튼, 메모리 사용 체크박스, 편집 및 삭제 컨트롤이 있는 메모리 항목, Admin Settings 버튼이 표시된 Memories 패널" size="sm" />

메모리는 사용자에게만 비공개로 제공됩니다. 다른 사용자의 에이전트는 해당 항목을 볼 수 없으며, 사용자의 에이전트도 다른 사용자의 항목을 볼 수 없습니다.

### 메모리 생성 \{#create-memory\}

패널 상단의 **+** 버튼을 클릭하여 **메모리 생성** 대화 상자를 여십시오. **키**(소문자와 밑줄만 사용)와 **값**을 입력한 다음 **생성**을 클릭하십시오.

<Image img={create} alt="메모리 패널에서 메모리 생성 + 버튼이 강조 표시된 모습" size="sm" />

### 메모리 필터 \{#filter-memories\}

패널 상단의 **메모리 필터** 입력란을 사용하여 키를 기준으로 항목을 찾으십시오.

<Image img={filter} alt="메모리 패널에서 메모리 필터 입력란이 강조 표시되어 있고 'demo'가 입력된 모습" size="sm" />

### 메모리 편집 \{#edit-memory\}

메모리 항목의 연필 아이콘을 클릭하여 **메모리 편집** 대화 상자를 여십시오. 키 또는 값을 수정한 다음 **저장**을 클릭하십시오.

<Image img={edit} alt="메모리 항목에서 연필 아이콘이 강조 표시된 모습" size="sm" />

### 메모리 삭제 \{#delete-memory\}

삭제하려는 메모리의 휴지통 아이콘을 클릭하세요.

<Image img={deleteMemory} alt="삭제용 휴지통 아이콘이 강조 표시된 메모리 항목" size="sm" />

## 메모리 토글 \{#toggle-memory\}

메모리 패널 상단의 **메모리 사용** 체크박스로 메모리를 켜거나 끌 수 있습니다. 저장하고 싶지 않은 민감한 주제이거나 개인화가 도움이 되지 않는 일회성 대화인 경우 이 기능을 끄세요.

메모리가 꺼져 있으면 에이전트는 메모리 저장소를 읽거나 쓰지 않습니다.

<Image img={toggle} alt="상단의 메모리 사용 체크박스가 강조 표시된 메모리 패널" size="sm" />

## 메모리 모범 사례 \{#memory-best-practices\}

메모리는 다음과 같은 경우에 도움이 됩니다:

* 반복되는 관례: 선호하는 날짜 포맷, 비즈니스 정의, 명명 패턴.
* 프로젝트 맥락: 주로 쿼리하는 서비스 또는 데이터베이스, 중요하게 보는 대시보드.
* 커뮤니케이션 스타일: 간결한 응답을 선호하는지, 대화형 응답을 선호하는지, 코드 중심 응답을 선호하는지, 설명 중심 응답을 선호하는지.

메모리는 데이터베이스처럼 사용하는 용도로 설계된 기능이 아닙니다. 예를 들어, 방대한 참고 자료를 쌓아두는 곳이 아닙니다.
그런 용도라면 [스킬](/cloud/features/ai-ml/agents/builder/skills)을 사용하거나 해당 자료를 에이전트의 지침에 포함하는 것이 좋습니다.
또한 메모리는 과거 채팅을 검색하기 위한 용도도 아닙니다. 그 역할은 대화 이력 자체가 수행합니다.
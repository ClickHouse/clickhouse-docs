---
'slug': '/use-cases/AI_ML/AIChat'
'sidebar_label': 'AI 채팅'
'title': 'ClickHouse Cloud에서 AI Chat 사용하기'
'pagination_prev': null
'pagination_next': null
'description': 'ClickHouse Cloud Console에서 AI Chat 기능을 활성화하고 사용하는 방법에 대한 가이드'
'keywords':
- 'AI'
- 'ClickHouse Cloud'
- 'Chat'
- 'SQL Console'
- 'Agent'
- 'Docs AI'
'show_related_blogs': true
'sidebar_position': 2
'doc_type': 'guide'
---

import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import img_open from '@site/static/images/use-cases/AI_ML/AIChat/1_open_chat.png';
import img_consent from '@site/static/images/use-cases/AI_ML/AIChat/2_consent.png';
import img_modes from '@site/static/images/use-cases/AI_ML/AIChat/3_modes.png';
import img_thinking from '@site/static/images/use-cases/AI_ML/AIChat/4_thinking.png';
import img_history from '@site/static/images/use-cases/AI_ML/AIChat/5_history.png';
import img_result_actions from '@site/static/images/use-cases/AI_ML/AIChat/6_result_actions.png';
import img_new_tab from '@site/static/images/use-cases/AI_ML/AIChat/7_open_in_editor.png';


# ClickHouse Cloud에서 AI Chat 사용하기

> 이 가이드는 ClickHouse Cloud Console에서 AI Chat 기능을 활성화하고 사용하는 방법을 설명합니다.

<VerticalStepper headerLevel="h2">

## 필수 조건 {#prerequisites}

1. AI 기능이 활성화된 ClickHouse Cloud 조직에 접근할 수 있어야 합니다 (사용 불가능한 경우 조직 관리자 또는 지원팀에 문의하십시오).

## AI Chat 패널 열기 {#open-panel}

1. ClickHouse Cloud 서비스로 이동합니다.
2. 왼쪽 사이드바에서 “Ask AI”로 라벨이 붙은 반짝이 아이콘을 클릭합니다.
3. (단축키) <kbd>⌘</kbd> + <kbd>'</kbd> (macOS) 또는 <kbd>Ctrl</kbd> + <kbd>'</kbd> (Linux/Windows)를 눌러 열기 전환합니다.

<Image img={img_open} alt="AI Chat 플라이아웃 열기" size="md"/>

## 데이터 사용 동의 수락하기 (첫 실행) {#consent}

1. 첫 사용 시 데이터 처리 및 타사 LLM 하위 프로세서에 대한 설명이 포함된 동의 대화 상자가 표시됩니다.
2. 검토 후 수락하여 진행합니다. 거부하는 경우 패널이 열리지 않습니다.

<Image img={img_consent} alt="동의 대화 상자" size="md"/>

## 채팅 모드 선택하기 {#modes}

AI Chat은 현재 다음 모드를 지원합니다:

- **Agent**: 스키마 및 메타데이터에 대한 다단계 추론 (서비스가 활성 상태여야 함).
- **Docs AI (Ask)**: 공식 ClickHouse 문서 및 모범 사례 참조에 기반한 집중된 Q&A.

플라이아웃의 왼쪽 하단에 있는 모드 선택기를 사용하여 전환합니다.

<Image img={img_modes} alt="모드 선택" size="sm"/>

## 메시지 작성 및 전송하기 {#compose}

1. 질문을 입력합니다 (예: “사용자별로 일일 이벤트를 집계하는 물리화된 뷰 생성”).  
2. <kbd>Enter</kbd>를 눌러 전송합니다 (새 줄을 위해 <kbd>Shift</kbd> + <kbd>Enter</kbd> 사용).  
3. 모델이 처리 중일 때 “중지”를 클릭하여 중단할 수 있습니다.

## “Agent” 사고 단계 이해하기 {#thinking-steps}

Agent 모드에서는 확장 가능한 중간 “사고” 또는 계획 단계가 표시될 수 있습니다. 이는 보조 도구가 답변을 형성하는 방식을 투명하게 제공합니다. 필요에 따라 축소 또는 확장할 수 있습니다.

<Image img={img_thinking} alt="사고 단계" size="md"/>

## 새 채팅 시작하기 {#new-chats}

“새 채팅” 버튼을 클릭하여 맥락을 지우고 새 세션을 시작합니다.

## 채팅 기록 보기 {#history}

1. 하단 섹션에 최근 채팅 목록이 표시됩니다.
2. 이전 채팅을 선택하여 메시지를 불러옵니다.
3. 휴지통 아이콘을 사용하여 대화를 삭제합니다.

<Image img={img_history} alt="채팅 기록 목록" size="md"/>

## 생성된 SQL 작업하기 {#sql-actions}

보조 도구가 SQL을 반환할 때:

- 올바른지 검토합니다.
- “편집기에서 열기”를 클릭하여 쿼리를 새로운 SQL 탭으로 불러옵니다.
- 콘솔 내에서 수정하고 실행합니다.

<Image img={img_result_actions} alt="결과 작업" size="md"/>

<Image img={img_new_tab} alt="편집기에서 생성된 쿼리 열기" size="md"/>

## 응답 중지 또는 중단하기 {#interrupt}

응답이 너무 오래 걸리거나 다른 방향으로 나아가는 경우:

1. “중지” 버튼을 클릭합니다 (처리 중일 때 표시됨).
2. 메시지가 중단된 것으로 표시되며, 프롬프트를 수정하고 다시 전송할 수 있습니다.

## 키보드 단축키 {#shortcuts}

| 작업 | 단축키 |
| ------ | -------- |
| AI Chat 열기 | `⌘ + '` / `Ctrl + '` |
| 메시지 전송 | `Enter` |
| 새 줄 | `Shift + Enter` |

</VerticalStepper>

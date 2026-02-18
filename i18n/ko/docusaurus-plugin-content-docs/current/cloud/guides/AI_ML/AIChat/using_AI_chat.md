---
slug: /use-cases/AI_ML/AIChat
sidebar_label: 'ClickHouse Cloud에서 Ask AI 채팅 사용하기'
title: 'ClickHouse Cloud에서 Ask AI 채팅 사용하기'
pagination_prev: null
pagination_next: null
description: 'ClickHouse Cloud Console에서 AI Chat 기능을 활성화하고 사용하는 방법을 설명하는 가이드'
keywords: ['AI', 'ClickHouse Cloud', 'Chat', 'SQL Console', 'Agent', 'Docs AI']
show_related_blogs: true
sidebar_position: 2
doc_type: 'guide'
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


# ClickHouse Cloud에서 Ask AI 채팅 사용하기 \{#use-ask-ai-chat-in-clickhouse-cloud\}

> 이 가이드는 ClickHouse Cloud Console에서 AI Chat 기능을 활성화하고 사용하는 방법을 설명합니다.

<VerticalStepper headerLevel="h2">

## 사전 준비 사항 \{#prerequisites\}

1. AI 기능이 활성화된 ClickHouse Cloud 조직에 대한 액세스 권한이 있어야 합니다(없을 경우 조직 관리자 또는 지원팀에 문의하십시오).

## AI Chat 패널 열기 \{#open-panel\}

1. ClickHouse Cloud 서비스로 이동합니다.
2. 왼쪽 사이드바에서 「Ask AI」라고 표시된 반짝이 아이콘을 클릭합니다.
3. (단축키) <kbd>⌘</kbd> + <kbd>'</kbd> (macOS) 또는 <kbd>Ctrl</kbd> + <kbd>'</kbd> (Linux/Windows)를 눌러 열기/닫기를 전환합니다.

<Image img={img_open} alt="AI Chat 플라이아웃 열기" size="md"/>

## 데이터 사용 동의 수락(첫 실행 시) \{#consent\}

1. 처음 사용할 때 데이터 처리 방식과 서드파티 LLM 서브 프로세서를 설명하는 동의 대화 상자가 표시됩니다.
2. 내용을 검토한 후 동의하면 계속 진행됩니다. 동의하지 않으면 패널이 열리지 않습니다.

<Image img={img_consent} alt="동의 대화 상자" size="md"/>

## 채팅 모드 선택하기 \{#modes\}

AI Chat은 현재 다음 모드를 지원합니다:

- **Agent**: 스키마와 메타데이터에 대한 다단계 추론(서비스가 활성 상태여야 합니다).
- **Docs AI (Ask)**: 공식 ClickHouse 문서와 모범 사례 참고 자료를 기반으로 하는 Q&A에 최적화된 모드입니다.

플라이아웃 왼쪽 하단의 모드 선택기를 사용해 모드를 전환합니다.

<Image img={img_modes} alt="모드 선택" size="sm"/>

## 메시지 작성 및 전송 \{#compose\}

1. 질문을 입력합니다(예: "사용자별 일별 이벤트를 집계하는 materialized view를 생성해 주세요").  
2. <kbd>Enter</kbd>를 눌러 전송합니다(<kbd>Shift</kbd> + <kbd>Enter</kbd>는 새 줄 입력).  
3. 모델이 처리 중일 때는 「Stop」을 클릭하여 중단할 수 있습니다.

## 「Agent」 사고 단계 이해하기 \{#thinking-steps\}

Agent 모드에서는 확장 가능한 중간 「사고(생각)」 또는 계획 단계가 표시될 수 있습니다. 이는 어시스턴트가 답변을 구성하는 방식을 투명하게 보여 줍니다. 필요에 따라 접거나 펼칠 수 있습니다.

<Image img={img_thinking} alt="사고(생각) 단계" size="md"/>

## 새 채팅 시작하기 \{#new-chats\}

「New Chat」 버튼을 클릭하여 대화 컨텍스트를 지우고 새 세션을 시작합니다.

## 채팅 기록 보기 \{#history\}

1. 하단 영역에 최근 채팅이 나열됩니다.
2. 이전 채팅을 선택하면 해당 메시지가 로드됩니다.
3. 휴지통 아이콘을 사용해 대화를 삭제할 수 있습니다.

<Image img={img_history} alt="채팅 기록 목록" size="md"/>

## 생성된 SQL 활용하기 \{#sql-actions\}

어시스턴트가 SQL을 반환한 경우:

- 올바른지 검토합니다.
- 「Open in editor」를 클릭하여 쿼리를 새 SQL 탭에서 엽니다.
- Console 내에서 수정 후 실행합니다.

<Image img={img_result_actions} alt="결과 작업" size="md"/>

<Image img={img_new_tab} alt="에디터에서 생성된 쿼리 열기" size="md"/>

## 응답 중지 또는 중단하기 \{#interrupt\}

응답이 너무 오래 걸리거나 원치 않는 방향으로 진행되는 경우:

1. 「Stop」 버튼을 클릭합니다(처리 중에만 표시됨).
2. 메시지는 중단된 것으로 표시되며, 프롬프트를 다듬어 다시 보낼 수 있습니다.

## 키보드 단축키 \{#shortcuts\}

| 동작 | 단축키 |
| ------ | -------- |
| AI Chat 열기 | `⌘ + '` / `Ctrl + '` |
| 메시지 전송 | `Enter` |
| 새 줄 | `Shift + Enter` |

</VerticalStepper>
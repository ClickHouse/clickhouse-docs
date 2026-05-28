---
sidebar_label: '채팅'
sidebar_position: 2
slug: /cloud/features/ai-ml/agents/chat
title: '채팅'
description: 'ClickHouse Agents의 대화, 북마크, 포크, 멀티 대화 및 채팅 공유'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'chat', '대화', '북마크', '포크', '공유', '멀티 대화']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import chat from '@site/static/images/cloud/agent-builder/chat/chat.png';
import conversation from '@site/static/images/cloud/agent-builder/chat/conversation.png';
import bookmark from '@site/static/images/cloud/agent-builder/chat/bookmark.png';
import fork from '@site/static/images/cloud/agent-builder/chat/fork.png';
import multiConversation from '@site/static/images/cloud/agent-builder/chat/multi-conversation.png';
import multiConversation2 from '@site/static/images/cloud/agent-builder/chat/multi-conversation-2.png';
import share from '@site/static/images/cloud/agent-builder/chat/share.png';
import shareModal from '@site/static/images/cloud/agent-builder/chat/share-modal.png';

<BetaBadge />

ClickHouse Agents의 채팅 화면에서는 대화, 분기, 나란히 비교, 공유를 지원합니다.

<Image img={chat} alt="왼쪽 탐색, 에이전트 아이덴티티 헤더, 메시지 컴포저가 표시된 ClickHouse Agent 채팅 화면" size="lg" />

## 대화 \{#conversations\}

왼쪽 탐색 메뉴에서 작성 아이콘을 클릭하여 새 대화를 시작합니다.
대화 창 왼쪽 상단의 에이전트 선택 대화상자에서 사용할 에이전트를 선택하십시오. 기본적으로 **ClickHouse Agent**가 선택되어 있습니다.
이제 컴포저에 메시지를 입력한 다음 전송을 누르십시오. 각 대화는 사이드바 이력에 저장되며, 나중에 다시 열거나 이름을 바꾸거나 삭제할 수 있습니다.

<Image img={conversation} alt="왼쪽 탐색 메뉴에서 작성 아이콘이 강조 표시된 채팅 화면, 저장된 Top 10 Tables Ranked 대화가 표시된 Chats 이력 사이드바, 그리고 예시 질문이 입력된 컴포저" size="lg" />

메시지는 해당 위치에서 바로 수정할 수 있으며, 에이전트는 대화 이력의 그 지점부터 응답을 다시 생성합니다.
메시지를 다시 보내지 않고도 에이전트의 마지막 응답만 다시 생성할 수도 있습니다.

## 북마크 \{#bookmarks\}

메시지나 전체 대화를 북마크해 두면 나중에 빠르게 다시 찾을 수 있습니다. 북마크는 사용자에게만 보이며, 대화 이름을 변경해도 그대로 유지됩니다.

<Image img={bookmark} alt="북마크 아이콘이 강조 표시되고 「북마크 추가」 툴팁이 표시된 채팅 헤더" size="lg" />

## 분기 만들기 \{#forking\}

분기 만들기를 사용하면 특정 메시지에서 분기된 새 대화를 만들 수 있습니다. 원래 스레드에 영향을 주지 않고 다른 경로를 탐색할 때 유용합니다.
사용할 수 있는 분기 모드는 세 가지입니다:

* **표시된 메시지만** - 분기된 메시지까지의 직접 경로만 복사합니다.
* **관련 분기 포함** - 기본 경로와 기존 분기를 함께 복사합니다.
* **여기까지 모두 포함** - 분기된 메시지까지의 모든 내용을 복사합니다.

분기된 대화는 서로 독립적이므로 변경 사항이 원래 대화에 동기화되지 않습니다.

<Image img={fork} alt="세 가지 분기 모드 아이콘, 「Start fork here」 및 「Remember」 체크박스, 그리고 아래쪽의 메시지 작업 도구 모음을 보여 주는 분기 옵션 선택 대화상자" size="lg" />

## 멀티 대화 \{#multi-conversation\}

멀티 대화는 두 개의 대화를 나란히 실행하고 동일한 프롬프트를 두 대화에 모두 보냅니다. 모델별 응답을 비교하거나 서로 다른 agent 구성으로 A/B 테스트를 수행할 때 사용합니다.

현재 대화 옆에 병렬 대화를 만들려면 채팅 헤더의 **+** 버튼을 클릭하세요.

<Image img={multiConversation} alt="멀티 대화 추가 버튼이 강조 표시된 채팅 헤더와 컴포저 위의 + ClickHouse Agent 표시기" size="lg" />

그러면 두 대화가 나란히 표시되고 동일한 프롬프트를 받습니다:

<Image img={multiConversation2} alt="두 개의 ClickHouse Agent 대화가 나란히 실행되며, 둘 다 동일한 run_select_query 도구 호출을 실행하는 멀티 대화 보기" size="lg" />

## 채팅 공유 \{#sharing-chats\}

어떤 대화에서든 공유 가능한 링크를 생성해 팀원에게 보내거나 참고용으로 저장할 수 있습니다. 링크를 받은 사용자는 아티팩트와 표시되는 분기를 포함한 읽기 전용 보기를 볼 수 있습니다. 공유 dashboard에서 언제든지 링크를 해제할 수 있습니다.

기존 메시지를 수정하면 공유 보기에도 반영되지만, 링크를 생성한 뒤에 추가된 메시지는 반영되지 않습니다.

대화를 공유하려면 사이드바에서 해당 대화의 메뉴를 열고 **Share**를 선택하세요:

<Image img={share} alt="사이드바의 대화 메뉴에 Share, Rename, Duplicate, Archive, Delete 옵션이 표시된 모습" size="lg" />

그런 다음 공유 대화상자에서 **Create link**를 클릭하세요:

<Image img={shareModal} alt="채팅 공유 링크 대화상자에 Create link 버튼과 이름 및 공유 후 추가된 메시지는 비공개로 유지된다는 안내가 표시된 모습" size="md" />
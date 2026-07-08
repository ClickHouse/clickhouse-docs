---
sidebar_label: 'MCP 서버'
sidebar_position: 8
slug: /cloud/features/ai-ml/agents/builder/mcp-servers
title: 'MCP 서버'
description: 'ClickHouse Agent에 타사 MCP 서버 연결하기'
keywords: ['AI', 'ClickHouse Cloud', 'agents', 'MCP', 'Model Context Protocol']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

Model Context Protocol(MCP)은 도구와 데이터 소스를 AI 모델에 노출하기 위한 개방형 표준입니다. MCP 서버를 ClickHouse Agent에 연결하면 해당 서버가 제공하는 모든 기능에 agent가 액세스할 수 있습니다 — 이슈 추적기, 관측성 백엔드, 내부 API, 서드파티 SaaS 또는 MCP 엔드포인트가 있는 그 밖의 모든 대상이 여기에 포함됩니다.

## MCP 서버 연결 \{#attach-an-mcp-server\}

Agent Builder에서 **MCP 서버** 섹션을 열고 **Add server**를 클릭하십시오. 서버의 URL과 인증 설정을 입력한 다음, 이 에이전트가 사용할 서버의 도구를 선택하십시오. 에이전트를 저장하십시오.

하나의 에이전트에 여러 서버를 연결할 수 있습니다. 에이전트가 호출하는 각 도구는 대화에 기록되므로 사용자는 에이전트가 수행한 작업을 확인할 수 있습니다.

## 전송 \{#transport\}

ClickHouse Agents는 프로덕션 환경용 MCP 전송 방식인 Streamable HTTP를 사용합니다. 연결할 서버는 ClickHouse Cloud에서 HTTP(S)로 접근할 수 있어야 합니다.

## 인증 \{#authentication\}

MCP 서버는 자격 증명을 요구할 수 있습니다. ClickHouse Agents는 다음을 지원합니다.

* **Bearer 토큰** 및 기타 정적 헤더 - 서버를 구성할 때 제공하는 고정값입니다.
* **OAuth 2.0** - 대화형 인증 흐름입니다. 서버에서 도구를 처음 호출할 때(또는 액세스 권한이 있는 다른 사용자가 처음 호출할 때) 브라우저에 로그인 창이 열리며, 토큰은 자동으로 관리되고 갱신됩니다.
* **사용자별 자격 증명** - 서버 구성의 변수를 호출한 사용자의 프로필 값으로 치환하므로, 각 사용자는 공유 서비스 계정이 아니라 자신의 아이덴티티로 인증합니다.

사용자가 제공한 자격 증명은 암호화되어 저장되며, 입력한 사용자에게만 적용됩니다. 한 사용자의 자격 증명이 다른 사용자의 에이전트 실행에 표시되는 일은 절대 없습니다.

## 제한 사항 \{#limits\}

단일 에이전트 실행에서는 요청당 최대 50개의 서로 다른 MCP 서버 대상과 최대 100개의 확장된 도구 구성을 참조할 수 있습니다. 이보다 더 많이 필요한 경우 [하위 에이전트](/cloud/features/ai-ml/agents/builder/subagents)로 분해하십시오.
---
sidebar_label: '원격 MCP 서버'
slug: /cloud/features/ai-ml/remote-mcp
title: 'Cloud의 원격 MCP'
description: 'ClickHouse Cloud의 원격 MCP 기능 설명'
doc_type: 'reference'
---

# Cloud의 원격 MCP 서버 \{#remote-mcp-server-in-cloud\}

모든 사용자가 ClickHouse를 Cloud 콘솔을 통해서만 사용하는 것은 아닙니다.
예를 들어, 많은 개발자는 선호하는 코드 편집기, CLI 에이전트에서 직접 작업하거나 사용자 정의 설정을 통해 데이터베이스에 연결하며, 다른 사용자들은 대부분의 탐색 작업에 Anthropic Claude와 같은 범용 AI 어시스턴트에 의존합니다.
이러한 사용자와 이들을 대신해 동작하는 에이전트 기반 워크로드에는 복잡한 설정이나 별도 인프라 없이도 ClickHouse Cloud에 안전하게 접근하고 쿼리할 수 있는 방법이 필요합니다.

ClickHouse Cloud의 원격 MCP 서버 기능은 외부 에이전트가 분석 컨텍스트를 조회할 수 있도록 표준 인터페이스를 제공함으로써 이를 해결합니다.
MCP(Model Context Protocol)는 LLM으로 구동되는 AI 애플리케이션이 구조화된 데이터에 접근하기 위한 표준입니다.
이 통합을 통해 외부 에이전트는 데이터베이스와 테이블을 나열하고, 스키마를 검사하며, 범위가 제한된 읽기 전용 `SELECT` 쿼리를 실행할 수 있습니다.
인증은 OAuth를 통해 처리되며, 서버는 ClickHouse Cloud에서 완전 관리형으로 운영되므로 별도의 설정이나 유지 관리가 필요하지 않습니다.

이를 통해 에이전트 기반 도구가 ClickHouse에 보다 쉽게 연결하여 분석, 요약, 코드 생성, 탐색 등 필요한 작업에 사용할 데이터를 가져올 수 있습니다.

자세한 내용은 [가이드](/use-cases/AI/MCP/remote_mcp) 섹션을 참고하십시오.
---
sidebar_label: 'Notion'
slug: /integrations/notion
keywords: ['clickhouse', 'notion', 'mcp', 'custom agents', 'ai', 'integrate', 'connect']
description: 'ClickHouse 원격 MCP 서버를 통해 ClickHouse Cloud를 Notion 사용자 지정 에이전트에 연결합니다.'
title: 'Notion과 ClickHouse 연결하기'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_integration'
---

import Image from '@theme/IdealImage';
import PartnerBadge from '@theme/badges/PartnerBadge';
import addClickHouseConnection from '@site/static/images/integrations/tools/data-integration/notion/add-clickhouse-connection.png';
import clickhouseToolsToggles from '@site/static/images/integrations/tools/data-integration/notion/clickhouse-tools-toggles.png';

<PartnerBadge />

[Notion](https://www.notion.com/)은 메모, 문서, 프로젝트, AI 기반 사용자 지정 에이전트를 위한 통합 워크스페이스입니다.

ClickHouse Cloud를 Notion [사용자 지정 에이전트](https://www.notion.com/help/mcp-connections-for-custom-agents)에 연결할 수 있습니다. 연결되면 Notion을 벗어나지 않고도 에이전트가 데이터를 탐색하고, 읽기 전용 분석 쿼리를 실행하며, ClickHouse Cloud의 서비스 정보와 비용 정보를 확인할 수 있습니다.

## 사전 요구사항 \{#prerequisites\}

* [원격 MCP 서버를 활성화한](/use-cases/AI/MCP/remote_mcp#enable-remote-mcp-server) 상태의 [ClickHouse Cloud 서비스](/getting-started/quick-start/cloud)
* **Business** 또는 **Enterprise** 플랜의 Notion 워크스페이스

## ClickHouse를 Notion 사용자 지정 에이전트에 연결하기 \{#connect-clickhouse-to-notion\}

ClickHouse는 Notion에서 사전 구성된 연결로 제공됩니다(현재 베타). 별도의 사용자 지정 MCP Server 설정이나 URL을 붙여 넣을 필요가 없습니다.

1. Notion에서 확장할 사용자 지정 에이전트를 열고 **Settings**를 클릭합니다.
2. **Add connection**을 클릭한 다음, 사용 가능한 연결 목록에서 **ClickHouse**를 선택합니다.

<Image img={addClickHouseConnection} size="md" alt="Notion의 Add connection 선택기에서 ClickHouse를 선택하는 모습" />

3. **Connect**를 클릭하고 ClickHouse Cloud 자격 증명을 사용해 OAuth 흐름을 완료합니다. 액세스 범위는 계정이 이미 접근할 수 있는 조직과 서비스로 제한됩니다.

4. 에이전트 설정에서 새 ClickHouse 연결을 확장한 다음, 이 에이전트가 사용할 도구를 켭니다. 각 도구마다 에이전트가 자동으로 실행할지, 아니면 항상 승인을 요청할지도 선택할 수 있습니다. ClickHouse 원격 MCP 서버에서 제공하는 모든 도구는 읽기 전용입니다. 전체 최신 목록은 [사용 가능한 도구](/cloud/features/ai-ml/remote-mcp#available-tools) 참고 문서를 확인하십시오.

<Image img={clickhouseToolsToggles} size="md" alt="도구별 토글이 표시된 Notion의 확장된 ClickHouse 연결" />

:::note
각 사용자 지정 에이전트에는 자체 ClickHouse 연결이 필요하며, 연결 인증을 완료한 사용자만 해당 도구 설정을 변경할 수 있습니다. 자세한 내용은 Notion의 [에이전트 연결을 위한 보안 모범 사례](https://www.notion.com/help/security-best-practices-for-agent-connections)를 참조하십시오.
:::

## 관련 콘텐츠 \{#related-content\}

* [ClickHouse Cloud 원격 MCP 서버 활성화 및 연결](/use-cases/AI/MCP/remote_mcp)
* [Cloud 원격 MCP: 도구 참고](/cloud/features/ai-ml/remote-mcp)
* Notion: [사용자 지정 에이전트용 MCP 연결](https://www.notion.com/help/mcp-connections-for-custom-agents)
* Notion: [MCP 통합을 사용해 사용자 지정 에이전트를 도구 스택에 연결](https://www.notion.com/help/guides/connect-custom-agents-to-mcp-integrations)
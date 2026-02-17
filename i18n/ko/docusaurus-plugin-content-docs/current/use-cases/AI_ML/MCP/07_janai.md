---
slug: /use-cases/AI/MCP/janai
sidebar_label: 'Jan.ai 통합'
title: 'Jan.ai와 함께 ClickHouse MCP 서버 설정하기'
pagination_prev: null
pagination_next: null
description: '이 가이드는 Jan.ai와 ClickHouse MCP 서버를 함께 사용하도록 설정하는 방법을 설명합니다.'
keywords: ['AI', 'Jan.ai', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';

import OpenAIModels from '@site/static/images/use-cases/AI_ML/MCP/0_janai_openai.png';
import MCPServers from '@site/static/images/use-cases/AI_ML/MCP/1_janai_mcp_servers.png';
import MCPServersList from '@site/static/images/use-cases/AI_ML/MCP/2_janai_mcp_servers_list.png';
import MCPForm from '@site/static/images/use-cases/AI_ML/MCP/3_janai_add_mcp_server.png';
import MCPEnabled from '@site/static/images/use-cases/AI_ML/MCP/4_janai_toggle.png';
import MCPTool from '@site/static/images/use-cases/AI_ML/MCP/5_jani_tools.png';
import Question from '@site/static/images/use-cases/AI_ML/MCP/6_janai_question.png';
import MCPToolConfirm from '@site/static/images/use-cases/AI_ML/MCP/7_janai_tool_confirmation.png';
import ToolsCalled from '@site/static/images/use-cases/AI_ML/MCP/8_janai_tools_called.png';  
import ToolsCalledExpanded from '@site/static/images/use-cases/AI_ML/MCP/9_janai_tools_called_expanded.png';  
import Result from '@site/static/images/use-cases/AI_ML/MCP/10_janai_result.png';


# Jan.ai와 함께 ClickHouse MCP 서버 사용하기 \{#using-clickhouse-mcp-server-with-janai\}

> 이 가이드는 ClickHouse MCP Server를 [Jan.ai](https://jan.ai/docs)와 함께 사용하는 방법을 설명합니다.

<VerticalStepper headerLevel="h2">

## Jan.ai 설치 \{#install-janai\}

Jan.ai는 100% 오프라인으로 실행되는 오픈 소스 ChatGPT 대체 도구입니다.
[Mac](https://jan.ai/docs/desktop/mac), [Windows](https://jan.ai/docs/desktop/windows), [Linux](https://jan.ai/docs/desktop/linux)용 Jan.ai를 다운로드할 수 있습니다.

네이티브 앱이므로 다운로드가 완료되면 바로 실행할 수 있습니다.

## Jan.ai에 LLM 추가 \{#add-llm-to-janai\}

설정 메뉴를 통해 모델을 활성화할 수 있습니다. 

OpenAI를 활성화하려면 아래와 같이 API 키를 입력해야 합니다:

<Image img={OpenAIModels} alt="OpenAI 모델 활성화" size="md"/>

## MCP 서버 활성화 \{#enable-mcp-servers\}

현재 기준으로 MCP Servers는 Jan.ai에서 실험적 기능입니다.
실험적 기능 토글을 사용해 MCP Servers를 활성화할 수 있습니다:

<Image img={MCPServers} alt="MCP 서버 활성화" size="md"/>

해당 토글을 켜면 왼쪽 메뉴에 `MCP Servers`가 표시됩니다.

## ClickHouse MCP 서버 구성 \{#configure-clickhouse-mcp-server\}

`MCP Servers` 메뉴를 클릭하면 연결할 수 있는 MCP 서버 목록이 표시됩니다:

<Image img={MCPServersList} alt="MCP 서버 목록" size="md"/>

이 서버들은 기본적으로 모두 비활성화되어 있지만, 토글을 클릭하여 활성화할 수 있습니다.

ClickHouse MCP Server를 설치하려면 `+` 아이콘을 클릭한 다음 다음과 같이 양식을 채웁니다:

<Image img={MCPForm} alt="MCP 서버 추가" size="md"/>

작업을 완료한 후 아직 토글되어 있지 않다면 ClickHouse Server 토글을 켜야 합니다:

<Image img={MCPEnabled} alt="MCP 서버 활성화" size="md"/>

이제 ClickHouse MCP Server의 도구가 채팅 대화 상자에 표시됩니다:

<Image img={MCPTool} alt="ClickHouse MCP Server 도구" size="md"/>

## Jan.ai로 ClickHouse MCP 서버와 대화하기 \{#chat-to-clickhouse-mcp-server\}

이제 ClickHouse에 저장된 데이터에 대해 대화를 진행해 보겠습니다.
질문을 입력해 보십시오:

<Image img={Question} alt="질문" size="md"/>

Jan.ai는 도구를 호출하기 전에 확인을 요청합니다:

<Image img={MCPToolConfirm} alt="도구 호출 확인" size="md"/>

그런 다음 수행된 도구 호출 목록을 표시합니다:

<Image img={ToolsCalled} alt="호출된 도구" size="md"/>

도구 호출을 클릭하면 호출의 세부 정보를 확인할 수 있습니다:

<Image img={ToolsCalledExpanded} alt="호출된 도구 상세" size="md"/>    

그리고 그 아래에 결과가 표시됩니다:

<Image img={Result} alt="결과" size="md"/>    

</VerticalStepper>
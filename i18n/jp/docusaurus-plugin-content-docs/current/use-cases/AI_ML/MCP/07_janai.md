---
slug: /use-cases/AI/MCP/janai
sidebar_label: 'Jan.ai との連携'
title: 'Jan.ai と ClickHouse MCP サーバーのセットアップ'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、Jan.ai を ClickHouse MCP サーバーと連携させるためのセットアップ方法について説明します。'
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


# Jan.ai で ClickHouse MCP server を使用する \{#using-clickhouse-mcp-server-with-janai\}

> このガイドでは、[Jan.ai](https://jan.ai/docs) で ClickHouse MCP Server を使用する方法を説明します。

<VerticalStepper headerLevel="h2">

## Jan.ai をインストールする \{#install-janai\}

Jan.ai は 100% オフラインで動作するオープンソースの ChatGPT 代替です。
[Mac](https://jan.ai/docs/desktop/mac)、[Windows](https://jan.ai/docs/desktop/windows)、または [Linux](https://jan.ai/docs/desktop/linux) 向けの Jan.ai をダウンロードできます。

ネイティブアプリなので、ダウンロード後はそのまま起動できます。

## Jan.ai に LLM を追加する \{#add-llm-to-janai\}

設定メニューからモデルを有効化できます。

OpenAI を有効にするには、以下のように API キーを入力する必要があります。

<Image img={OpenAIModels} alt="OpenAI モデルを有効化" size="md"/>

## MCP Servers を有効化する \{#enable-mcp-servers\}

執筆時点では、MCP Servers は Jan.ai における実験的機能です。
実験的機能のトグルをオンにすることで有効化できます。

<Image img={MCPServers} alt="MCP servers を有効化" size="md"/>

トグルをオンにすると、左側のメニューに `MCP Servers` が表示されます。

## ClickHouse MCP Server を構成する \{#configure-clickhouse-mcp-server\}

`MCP Servers` メニューをクリックすると、接続可能な MCP サーバーの一覧が表示されます。

<Image img={MCPServersList} alt="MCP サーバー一覧" size="md"/>

これらのサーバーはすべてデフォルトで無効になっていますが、トグルをクリックして有効化できます。

ClickHouse MCP Server をインストールするには、`+` アイコンをクリックし、次の情報でフォームに入力します。

<Image img={MCPForm} alt="MCP サーバーを追加" size="md"/>

入力が完了したら、まだ有効になっていない場合は ClickHouse Server のトグルをオンにする必要があります。

<Image img={MCPEnabled} alt="ClickHouse MCP Server を有効化" size="md"/>

これで、ClickHouse MCP Server のツールがチャットダイアログ上に表示されるようになります。

<Image img={MCPTool} alt="ClickHouse MCP Server ツール" size="md"/>

## Jan.ai で ClickHouse MCP Server と対話する \{#chat-to-clickhouse-mcp-server\}

ClickHouse に保存されたデータについて会話してみましょう。
まずは質問を投げかけます。

<Image img={Question} alt="質問" size="md"/>

Jan.ai はツールを呼び出す前に確認を求めます。

<Image img={MCPToolConfirm} alt="ツール呼び出しの確認" size="md"/>

その後、実行されたツール呼び出しの一覧が表示されます。

<Image img={ToolsCalled} alt="呼び出されたツール一覧" size="md"/>

ツール呼び出しをクリックすると、その詳細を確認できます。

<Image img={ToolsCalledExpanded} alt="展開されたツール呼び出し" size="md"/>    

その下に、ツールの実行結果が表示されます。

<Image img={Result} alt="結果" size="md"/>    

</VerticalStepper>
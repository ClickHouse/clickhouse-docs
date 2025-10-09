---
'slug': '/use-cases/AI/MCP/janai'
'sidebar_label': 'Jan.aiを統合する'
'title': 'Jan.aiとClickHouse MCPサーバーを設定する'
'pagination_prev': null
'pagination_next': null
'description': 'このガイドでは、ClickHouse MCPサーバーとJan.aiを設定する方法を説明します。'
'keywords':
- 'AI'
- 'Jan.ai'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
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


# ClickHouse MCPサーバーをJan.aiで使用する

> このガイドでは、[Jan.ai](https://jan.ai/docs)とClickHouse MCPサーバーを使用する方法について説明します。

<VerticalStepper headerLevel="h2">

## Jan.aiのインストール {#install-janai}

Jan.aiは、100%オフラインで動作するオープンソースのChatGPTの代替です。  
Jan.aiは[Mac](https://jan.ai/docs/desktop/mac)、[Windows](https://jan.ai/docs/desktop/windows)、または[Linux](https://jan.ai/docs/desktop/linux)用にダウンロードできます。

これはネイティブアプリケーションなので、ダウンロードが完了したら起動できます。

## Jan.aiにLLMを追加 {#add-llm-to-janai}

設定メニューからモデルを有効にすることができます。

OpenAIを有効にするには、以下に示すようにAPIキーを提供する必要があります：

<Image img={OpenAIModels} alt="OpenAIモデルを有効にする" size="md"/>

## MCPサーバーを有効にする {#enable-mcp-servers}

この文書の執筆時点では、MCPサーバーはJan.aiの実験的機能です。  
実験的機能を切り替えることで、MCPサーバーを有効にすることができます：

<Image img={MCPServers} alt="MCPサーバーを有効にする" size="md"/>

このトグルを押すと、左側のメニューに`MCP Servers`が表示されます。

## ClickHouse MCPサーバーを構成する {#configure-clickhouse-mcp-server}

`MCP Servers`メニューをクリックすると、接続可能なMCPサーバーのリストが表示されます：

<Image img={MCPServersList} alt="MCPサーバーのリスト" size="md"/>

これらのサーバーはすべてデフォルトで無効になっていますが、トグルをクリックすることで有効にできます。

ClickHouse MCPサーバーをインストールするには、`+`アイコンをクリックし、次に以下の情報をフォームに入力します：

<Image img={MCPForm} alt="MCPサーバーを追加" size="md"/>

それが完了したら、まだトグルされていない場合はClickHouseサーバーのトグルを切り替える必要があります：

<Image img={MCPEnabled} alt="MCPサーバーを有効にする" size="md"/>

ClickHouse MCPサーバーのツールがチャットダイアログで表示されるようになります：

<Image img={MCPTool} alt="ClickHouse MCPサーバーツール" size="md"/>

## Jan.aiを使用してClickHouse MCPサーバーとチャットする {#chat-to-clickhouse-mcp-server}

ClickHouseに保存されているデータについて会話を始める時間です！  
質問をしてみましょう：

<Image img={Question} alt="質問" size="md"/>

Jan.aiはツールを呼び出す前に確認を求めます：

<Image img={MCPToolConfirm} alt="ツール確認" size="md"/>

その後、行われたツール呼び出しのリストを表示します：

<Image img={ToolsCalled} alt="呼び出したツール" size="md"/>

ツール呼び出しをクリックすると、呼び出しの詳細が表示されます：

<Image img={ToolsCalledExpanded} alt="呼び出したツール（詳細）" size="md"/>    

その下には、結果があります：

<Image img={Result} alt="結果" size="md"/>    

</VerticalStepper>

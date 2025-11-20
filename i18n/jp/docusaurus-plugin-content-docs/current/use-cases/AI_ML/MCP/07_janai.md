---
slug: /use-cases/AI/MCP/janai
sidebar_label: 'Jan.ai を統合する'
title: 'Jan.ai と ClickHouse MCP サーバーのセットアップ'
pagination_prev: null
pagination_next: null
description: 'このガイドでは、Jan.ai を ClickHouse MCP サーバーと連携してセットアップする方法を説明します。'
keywords: ['AI', 'Jan.ai', 'MCP']
show_related_blogs: true
doc_type: 'ガイド'
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


# Jan.aiでClickHouse MCPサーバーを使用する

> このガイドでは、[Jan.ai](https://jan.ai/docs)でClickHouse MCPサーバーを使用する方法を説明します。

<VerticalStepper headerLevel="h2">


## Jan.aiのインストール {#install-janai}

Jan.aiは、完全オフラインで動作するオープンソースのChatGPT代替ツールです。
Jan.aiは[Mac](https://jan.ai/docs/desktop/mac)、[Windows](https://jan.ai/docs/desktop/windows)、[Linux](https://jan.ai/docs/desktop/linux)向けにダウンロード可能です。

ネイティブアプリケーションのため、ダウンロード後すぐに起動できます。


## Jan.aiにLLMを追加する {#add-llm-to-janai}

設定メニューからモデルを有効化できます。

OpenAIを有効化するには、以下のようにAPIキーを指定する必要があります:

<Image img={OpenAIModels} alt='OpenAIモデルを有効化' size='md' />


## MCPサーバーの有効化 {#enable-mcp-servers}

本ドキュメント執筆時点では、MCPサーバーはJan.aiの実験的機能です。
実験的機能のトグルを切り替えることで有効化できます：

<Image img={MCPServers} alt='MCPサーバーの有効化' size='md' />

トグルを切り替えると、左側のメニューに`MCP Servers`が表示されます。


## ClickHouse MCP Serverの設定 {#configure-clickhouse-mcp-server}

`MCP Servers`メニューをクリックすると、接続可能なMCPサーバーのリストが表示されます:

<Image img={MCPServersList} alt='MCPサーバーリスト' size='md' />

これらのサーバーはデフォルトですべて無効になっていますが、トグルをクリックすることで有効化できます。

ClickHouse MCP Serverをインストールするには、`+`アイコンをクリックし、以下の内容でフォームを入力します:

<Image img={MCPForm} alt='MCPサーバーの追加' size='md' />

入力が完了したら、ClickHouse Serverがまだ有効になっていない場合はトグルを切り替えます:

<Image img={MCPEnabled} alt='MCPサーバーの有効化' size='md' />

これでClickHouse MCP Serverのツールがチャットダイアログに表示されるようになります:

<Image img={MCPTool} alt='ClickHouse MCP Serverツール' size='md' />


## Jan.aiを使用したClickHouse MCPサーバーとの対話 {#chat-to-clickhouse-mcp-server}

それでは、ClickHouseに保存されているデータについて対話してみましょう。
質問を投げかけてみます：

<Image img={Question} alt='質問' size='md' />

Jan.aiはツールを呼び出す前に確認を求めます：

<Image img={MCPToolConfirm} alt='ツール確認' size='md' />

次に、実行されたツール呼び出しのリストが表示されます：

<Image img={ToolsCalled} alt='呼び出されたツール' size='md' />

ツール呼び出しをクリックすると、呼び出しの詳細を確認できます：

<Image img={ToolsCalledExpanded} alt='呼び出されたツール（展開）' size='md' />

その下に結果が表示されます：

<Image img={Result} alt='結果' size='md' />

</VerticalStepper>

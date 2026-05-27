---
sidebar_label: 'MCPサーバー'
sidebar_position: 8
slug: /cloud/features/ai-ml/agents/builder/mcp-servers
title: 'MCPサーバー'
description: 'ClickHouse Agentにサードパーティ製MCPサーバーを接続する'
keywords: ['AI', 'ClickHouse Cloud', 'エージェント', 'MCP', 'Model Context Protocol']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

Model Context Protocol (MCP) は、AIモデルにツールやデータソースを公開するためのオープン標準です。MCPサーバーをClickHouse Agentに接続すると、そのサーバーが公開するあらゆる機能にAgentからアクセスできるようになります。たとえば、課題追跡システム、オブザーバビリティバックエンド、内部API、サードパーティのSaaS、またはMCPエンドポイントを備えたその他あらゆるものです。

## MCPサーバーを追加する \{#attach-an-mcp-server\}

Agent Builder で **MCPサーバー** セクションを開き、**Add server** をクリックします。サーバーの URL と認証設定を入力し、そのサーバーのツールのうち、このエージェントで使用するものを選択して、エージェントを保存します。

1 つのエージェントに複数のサーバーを追加できます。エージェントが呼び出した各ツールは会話内に記録されるため、ユーザーはエージェントが何を行ったかを確認できます。

## トランスポート \{#transport\}

ClickHouse Agents は、実運用に対応した MCP トランスポートである Streamable HTTP を使用します。接続するサーバーは、ClickHouse Cloud から HTTP(S) 経由で到達可能である必要があります。

## 認証 \{#authentication\}

MCPサーバーでは認証情報が必要になる場合があります。ClickHouse Agents は次をサポートしています。

* **Bearer tokens** とその他の静的ヘッダー — サーバーの設定時に指定する固定値です。
* **OAuth 2.0** — 対話型フローです。サーバー上のツールをあなた (またはアクセス権を持つ任意のユーザー) が初めて呼び出すと、ブラウザーでサインインウィンドウが開き、トークンは自動的に管理・更新されます。
* **ユーザーごとの認証情報** — サーバー設定内の変数が、呼び出し元ユーザーのプロファイルの値で置き換えられるため、各ユーザーは共有のサービスアカウントではなく、自分自身のIDで認証されます。

ユーザーが指定した認証情報は暗号化して保存され、入力したユーザーに紐づけられます。あるユーザーの認証情報が、別のユーザーのエージェント実行から見えることはありません。

## 制限 \{#limits\}

1回のエージェント実行で参照できる個別のMCPサーバーターゲットは最大50件、1リクエストあたりの展開後のツール設定は最大100件です。これを超える場合は、[サブエージェント](/cloud/features/ai-ml/agents/builder/subagents)を使って分割してください。
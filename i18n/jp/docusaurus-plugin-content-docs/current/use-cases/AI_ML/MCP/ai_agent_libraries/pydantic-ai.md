---
slug: /use-cases/AI/MCP/ai-agent-libraries/pydantic-ai
sidebar_label: 'PydanticAI を統合する'
title: 'ClickHouse MCP Server を使用して PydanticAI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'ClickHouse MCP Server と対話できる PydanticAI エージェントの構築方法を学びます。'
keywords: ['ClickHouse', 'MCP', 'PydanticAI']
show_related_blogs: true
doc_type: 'guide'
---

# ClickHouse MCP Server を使用して PydanticAI エージェントを構築する方法 \\{#how-to-build-a-pydanticai-agent-using-clickhouse-mcp-server\\}

このガイドでは、[ClickHouse の MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を使って [ClickHouse の SQL playground](https://sql.clickhouse.com/) と対話できる [PydanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1) エージェントを構築する方法を学びます。

:::note 例のノートブック
この例は、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/pydanticai/pydantic.ipynb) にあるノートブックとして提供されています。
:::

## 前提条件 \\{#prerequisites\\}

- システムにPythonがインストールされていること
- システムに`pip`がインストールされていること
- AnthropicのAPIキー、または他のLLMプロバイダーのAPIキー

以下の手順は、Python REPLまたはスクリプトから実行できます。

<VerticalStepper headerLevel="h2">

## ライブラリをインストールする \\{#install-libraries\\}

次のコマンドを実行して、必要なライブラリをインストールします。

```python
pip install -q --upgrade pip
pip install -q "pydantic-ai-slim[mcp]"
pip install -q "pydantic-ai-slim[anthropic]" # replace with the appropriate package if using a different LLM provider
```

## 資格情報の設定 \\{#setup-credentials\\}

次に、Anthropic の API キーを指定する必要があります。

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
Enter Anthropic API Key: ········
```

:::note 別の LLM プロバイダーを使用する場合
Anthropic の API キーをお持ちでなく、別の LLM プロバイダーを使用したい場合は、
認証情報の設定手順を [PydanticAI のドキュメント](https://ai.pydantic.dev/models/) で確認できます。
:::

次に、ClickHouse SQL Playground に接続するために必要な認証情報を定義します。

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```

## MCP Server と PydanticAI エージェントの初期化 \\{#initialize-mcp\\}

次に、ClickHouse MCP Server を設定し、ClickHouse SQL playground を参照するようにします。

```python
from pydantic_ai import Agent
from pydantic_ai.mcp import MCPServerStdio
from pydantic_ai.messages import ToolCallPart, ToolReturnPart

server = MCPServerStdio(
    'uv',
    args=[
        'run',
        '--with', 'mcp-clickhouse',
        '--python', '3.13',
        'mcp-clickhouse'
    ],
    env=env
)
agent = Agent('anthropic:claude-sonnet-4-0', mcp_servers=[server])
```

## エージェントに質問する \\{#ask-agent\\}

最後に、エージェントに質問できます：

```python
async with agent.run_mcp_servers():
    result = await agent.run("Who's done the most PRs for ClickHouse?")
    print(result.output)
```

以下のような応答が返されます：

```response title="Response"
Based on the data from the ClickHouse GitHub repository, here are the top contributors by number of pull requests created:

**Top contributors to ClickHouse by PRs opened:**

1. **alexey-milovidov** - 3,370 PRs opened
2. **azat** - 1,905 PRs opened  
3. **rschu1ze** - 979 PRs opened
4. **alesapin** - 947 PRs opened
5. **tavplubix** - 896 PRs opened
6. **kssenii** - 871 PRs opened
7. **Avogar** - 805 PRs opened
8. **KochetovNicolai** - 700 PRs opened
9. **Algunenano** - 658 PRs opened
10. **kitaisreal** - 630 PRs opened

**Alexey Milovidov** stands out as by far the most active contributor with over 3,370 pull requests opened, which is significantly more than any other contributor. This makes sense as Alexey Milovidov is one of the founders and lead developers of ClickHouse.

The data also shows that alexey-milovidov has been very active in managing PRs, with 12,818 "closed" events (likely reviewing and closing PRs from other contributors) in addition to creating his own PRs.

It's worth noting that I filtered out various robot/bot accounts that handle automated processes, focusing on human contributors to give you the most meaningful answer about who has contributed the most PRs to ClickHouse.
```

</VerticalStepper>

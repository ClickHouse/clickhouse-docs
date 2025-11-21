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



# ClickHouse MCP Server を使用して PydanticAI エージェントを構築する方法

このガイドでは、[ClickHouse SQL playground](https://sql.clickhouse.com/) と [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を使用して対話できる [PydanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1) エージェントの構築方法を説明します。

:::note サンプルノートブック
このサンプルは、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/pydanticai/pydantic.ipynb) 内のノートブックとしても参照できます。
:::



## 前提条件 {#prerequisites}

- システムにPythonがインストールされている必要があります。
- システムに`pip`がインストールされている必要があります。
- Anthropic APIキー、または他のLLMプロバイダーのAPIキーが必要です。

以下の手順は、Python REPLまたはスクリプトから実行できます。

<VerticalStepper headerLevel="h2">


## ライブラリのインストール {#install-libraries}

以下のコマンドを実行して、必要なライブラリをインストールします:

```python
pip install -q --upgrade pip
pip install -q "pydantic-ai-slim[mcp]"
pip install -q "pydantic-ai-slim[anthropic]" # 別のLLMプロバイダーを使用する場合は、適切なパッケージに置き換えてください
```


## 認証情報の設定 {#setup-credentials}

次に、Anthropic APIキーを指定する必要があります：

```python
import os, getpass
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

```response title="Response"
Enter Anthropic API Key: ········
```

:::note 別のLLMプロバイダーを使用する場合
Anthropic APIキーをお持ちでない場合や、別のLLMプロバイダーを使用したい場合は、
[PydanticAIドキュメント](https://ai.pydantic.dev/models/)で認証情報の設定手順を確認できます
:::

次に、ClickHouse SQLプレイグラウンドへの接続に必要な認証情報を定義します：

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## MCPサーバーとPydanticAIエージェントの初期化 {#initialize-mcp}

次に、ClickHouse MCPサーバーがClickHouse SQLプレイグラウンドを参照するように設定します:

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


## エージェントに質問する {#ask-agent}

最後に、エージェントに質問できます：

```python
async with agent.run_mcp_servers():
    result = await agent.run("ClickHouseに最も多くのPRを行ったのは誰ですか？")
    print(result.output)
```

以下のような応答が返されます：

```response title="応答"
ClickHouse GitHubリポジトリのデータに基づくと、プルリクエスト作成数による上位貢献者は以下の通りです：

**PR作成数によるClickHouseへの上位貢献者：**

1. **alexey-milovidov** - 3,370件のPRを作成
2. **azat** - 1,905件のPRを作成
3. **rschu1ze** - 979件のPRを作成
4. **alesapin** - 947件のPRを作成
5. **tavplubix** - 896件のPRを作成
6. **kssenii** - 871件のPRを作成
7. **Avogar** - 805件のPRを作成
8. **KochetovNicolai** - 700件のPRを作成
9. **Algunenano** - 658件のPRを作成
10. **kitaisreal** - 630件のPRを作成

**Alexey Milovidov**は、3,370件を超えるプルリクエストを作成しており、他のどの貢献者よりも圧倒的に活発な貢献者として際立っています。Alexey MilovidovはClickHouseの創設者の一人であり、主要開発者であるため、これは納得のいく結果です。

データはまた、alexey-milovidovが自身のPRを作成することに加えて、12,818件の「クローズ」イベント（おそらく他の貢献者からのPRをレビューしてクローズしている）を持ち、PRの管理においても非常に活発であることを示しています。

なお、自動化プロセスを処理する様々なロボット/ボットアカウントは除外し、人間の貢献者に焦点を当てることで、ClickHouseに最も多くのPRを貢献したのは誰かについて最も意味のある回答を提供しています。
```

</VerticalStepper>

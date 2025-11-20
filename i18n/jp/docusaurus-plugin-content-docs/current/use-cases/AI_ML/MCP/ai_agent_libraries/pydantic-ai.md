---
slug: /use-cases/AI/MCP/ai-agent-libraries/pydantic-ai
sidebar_label: 'PydanticAI を統合する'
title: 'ClickHouse MCP Server を使用して PydanticAI エージェントを構築する方法'
pagination_prev: null
pagination_next: null
description: 'ClickHouse MCP Server と連携して動作する PydanticAI エージェントの構築方法を学びます。'
keywords: ['ClickHouse', 'MCP', 'PydanticAI']
show_related_blogs: true
doc_type: 'guide'
---



# ClickHouse MCP Server を使用して PydanticAI エージェントを構築する方法

このガイドでは、[ClickHouse の SQL playground](https://sql.clickhouse.com/) と [ClickHouse の MCP Server](https://github.com/ClickHouse/mcp-clickhouse) を使って対話できる [PydanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1) エージェントの構築方法を説明します。

:::note 例のノートブック
この例は、[examples リポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/pydanticai/pydantic.ipynb) 内のノートブックとして参照できます。
:::



## 前提条件 {#prerequisites}

- システムにPythonがインストールされている必要があります。
- システムに`pip`がインストールされている必要があります。
- Anthropic APIキー、または他のLLMプロバイダーのAPIキーが必要です。

以下の手順は、Python REPLまたはスクリプトから実行できます。

<VerticalStepper headerLevel="h2">


## ライブラリのインストール {#install-libraries}

以下のコマンドを実行して、必要なライブラリをインストールします：

```python
pip install -q --upgrade pip
pip install -q "pydantic-ai-slim[mcp]"
pip install -q "pydantic-ai-slim[anthropic]" # 別のLLMプロバイダーを使用する場合は、適切なパッケージに置き換えてください
```


## 認証情報の設定 {#setup-credentials}

次に、Anthropic APIキーを入力します：

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

次に、ClickHouse MCPサーバーをClickHouse SQLプレイグラウンドに接続するように設定します：

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

最後に、エージェントに質問できます:

```python
async with agent.run_mcp_servers():
    result = await agent.run("ClickHouseに最も多くのPRを行ったのは誰ですか?")
    print(result.output)
```

以下のような応答が返されます:

```response title="応答"
ClickHouse GitHubリポジトリのデータに基づくと、プルリクエスト作成数による上位コントリビューターは以下の通りです:

**PRオープン数によるClickHouseの上位コントリビューター:**

1. **alexey-milovidov** - 3,370件のPRをオープン
2. **azat** - 1,905件のPRをオープン
3. **rschu1ze** - 979件のPRをオープン
4. **alesapin** - 947件のPRをオープン
5. **tavplubix** - 896件のPRをオープン
6. **kssenii** - 871件のPRをオープン
7. **Avogar** - 805件のPRをオープン
8. **KochetovNicolai** - 700件のPRをオープン
9. **Algunenano** - 658件のPRをオープン
10. **kitaisreal** - 630件のPRをオープン

**Alexey Milovidov**は、3,370件以上のプルリクエストをオープンしており、他のコントリビューターを大きく引き離して最も活発なコントリビューターとなっています。これは、Alexey MilovidovがClickHouseの創設者の一人であり、主要開発者であることを考えると納得できます。

データはまた、alexey-milovidovが自身のPRを作成することに加えて、12,818件の「クローズ」イベント(おそらく他のコントリビューターからのPRをレビューしてクローズしている)を持ち、PRの管理においても非常に活発であることを示しています。

なお、自動化されたプロセスを処理する各種ロボット/ボットアカウントは除外し、人間のコントリビューターに焦点を当てることで、ClickHouseに最も多くのPRを貢献した人物について最も有意義な回答を提供しています。
```

</VerticalStepper>

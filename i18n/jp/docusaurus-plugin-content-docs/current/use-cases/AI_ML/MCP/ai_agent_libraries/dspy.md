---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/DSPy'
'sidebar_label': 'DSPyを統合する'
'title': 'DSPyとClickHouse MCPサーバーを使用してAIエージェントを構築する方法'
'pagination_prev': null
'pagination_next': null
'description': 'DSPyとClickHouse MCPサーバーを使用してAIエージェントを構築する方法を学ぶ'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'DSPy'
'show_related_blogs': true
'doc_type': 'guide'
---


# AIエージェントをDSPyとClickHouse MCPサーバーで構築する方法

このガイドでは、[DSPy](https://github.com/langchain-ai/langgraph)を使用して、[ClickHouseのSQLプレイグラウンド](https://sql.clickhouse.com/)と相互作用できるAIエージェントを構築する方法を説明します。このエージェントは、[ClickHouseのMCPサーバー](https://github.com/ClickHouse/mcp-clickhouse)を使用します。

## 前提条件 {#prerequisites}

- システムにPythonがインストールされている必要があります。
- システムに`pip`がインストールされている必要があります。
- AnthropicのAPIキー、または別のLLMプロバイダーのAPIキーが必要です。

次の手順は、Python REPLまたはスクリプトを介して実行できます。

:::note 例のノートブック
この例は、[例のリポジトリ](https://github.com/ClickHouse/examples/blob/main/ai/mcp/dspy/dspy.ipynb)のノートブックとして見つけることができます。
:::

<VerticalStepper headerLevel="h2">

## ライブラリをインストールする {#install-libraries}

次のコマンドを`pip`を使用して実行し、必要なライブラリをインストールします。

```shell
!pip install -q --upgrade pip
!pip install -q dspy
!pip install -q mcp
```

## 資格情報を設定する {#setup-credentials}

次に、AnthropicのAPIキーを提供する必要があります：

```python
import os
os.environ["ANTHROPIC_API_KEY"] = getpass.getpass("Enter Anthropic API Key:")
```

:::note 別のLLMプロバイダーを使用する
AnthropicのAPIキーがなく、別のLLMプロバイダーを使用したい場合は、
[ DSPyのドキュメント](https://dspy.ai/#__tabbed_1_1)で資格情報の設定に関する手順を見つけることができます。
:::

次に、ClickHouse SQLプレイグラウンドに接続するために必要な資格情報を定義します：

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```

## MCPサーバーを初期化する {#initialize-mcp}

次に、ClickHouse MCPサーバーをClickHouse SQLプレイグラウンドを指すように構成します。

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import dspy

server_params = StdioServerParameters(
    command="uv",
    args=[
        'run',
        '--with', 'mcp-clickhouse',
        '--python', '3.13',
        'mcp-clickhouse'
    ],
    env=env
)
```

## LLMを初期化する {#initialize-llm}

次に、以下の行を使用してLLMを初期化します：

```python
dspy.configure(lm=dspy.LM("anthropic/claude-sonnet-4-20250514"))
```

## エージェントを実行する {#run-the-agent}

最後に、エージェントを初期化して実行します：

```python
class DataAnalyst(dspy.Signature):
    """You are a data analyst. You'll be asked questions and you need to try to answer them using the tools you have access to. """

    user_request: str = dspy.InputField()
    process_result: str = dspy.OutputField(
        desc=(
            "Answer to the query"
        )
    )

from utils import print_dspy_result

async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        await session.initialize()
        tools = await session.list_tools()

        dspy_tools = []
        for tool in tools.tools:
            dspy_tools.append(dspy.Tool.from_mcp_tool(session, tool))

        react = dspy.ReAct(DataAnalyst, tools=dspy_tools)
        result = await react.acall(user_request="What's the most popular Amazon product category")
        print_dspy_result(result)
```

```response title="Response"
================================================================================
🤖 DSPy ReAct Result
================================================================================

📍 STEP 1
----------------------------------------
🧠 THINKING: I need to find information about Amazon product categories and determine which one is most popular. First, I should explore what databases are available to see if there's any Amazon-related data.

🔧 TOOL: list_databases

📊 RESULT:
   amazon
bluesky
country
covid
default
dns
environmental
food
forex
geo
git
github
hackernews
imdb
logs
metrica
mgbench
mta
noaa
nyc_taxi
nypd
ontime
opensky
otel
otel_v2
pypi
random
reddit
rubygems
sta...

📍 STEP 2
----------------------------------------
🧠 THINKING: Great! I can see there's an "amazon" database available. This is exactly what I need to find information about Amazon product categories. Let me explore the tables in the amazon database to see what data is available.

🔧 TOOL: list_tables
   Args: {'database': 'amazon'}

📊 RESULT:
   {
  "database": "amazon",
  "name": "amazon_reviews",
  "comment": "",
  "columns": [
    {
      "name": "review_date",
      "type": "Date",
      "default_type": "",
      "default_expression": "",...

📍 STEP 3
----------------------------------------
🧠 THINKING: Perfect! I found the amazon_reviews table which contains a product_category column. This table has over 150 million rows of Amazon review data, which should give me a good representation of product popularity. To find the most popular Amazon product category, I need to count the number of reviews per category and order them by count in descending order. The category with the most reviews would be considered the most popular.

🔧 TOOL: run_select_query
   Args: {'query': 'SELECT product_category, COUNT(*) as review_count FROM amazon.amazon_reviews GROUP BY product_category ORDER BY review_count DESC LIMIT 10'}

📊 RESULT:
   1. Books: 19,530,930 reviews
   2. Digital_Ebook_Purchase: 17,622,107 reviews
   3. Wireless: 9,001,567 reviews
   4. PC: 6,908,245 reviews
   5. Home: 6,221,321 reviews
   ... and 5 more

📍 STEP 4
----------------------------------------
🧠 THINKING: Perfect! I have found the answer to the user's question. Based on the Amazon reviews data, I can clearly see that "Books" is the most popular Amazon product category with 19,530,930 reviews, followed by "Digital_Ebook_Purchase" with 17,622,107 reviews. The data shows a clear ranking of product categories by popularity based on the number of reviews each category has received. I now have all the information needed to answer the user's question.

🔧 TOOL: finish

📊 RESULT:
   Completed.

🎯 REASONING
----------------------------------------
To answer the question about the most popular Amazon product category, I accessed the Amazon database and found a table called "amazon_reviews" with over 150 million review records. This table contains a "product_category" column that allows me to analyze product popularity based on review volume. I ran a query to count the number of reviews per product category and ordered them by count in descending order. The assumption here is that categories with more reviews indicate higher popularity, as more reviews typically correlate with more purchases and customer engagement.

✅ FINAL RESULT
----------------------------------------
Based on Amazon review data containing over 150 million records, the most popular Amazon product category is **Books** with 19,530,930 reviews. 

Here are the top 10 most popular Amazon product categories by review count:

1. **Books** - 19,530,930 reviews
2. **Digital_Ebook_Purchase** - 17,622,107 reviews  
3. **Wireless** - 9,001,567 reviews
4. **PC** - 6,908,245 reviews
5. **Home** - 6,221,321 reviews
6. **Apparel** - 5,906,085 reviews
7. **Health & Personal Care** - 5,331,239 reviews
8. **Beauty** - 5,115,462 reviews
9. **Video DVD** - 5,069,014 reviews
10. **Mobile_Apps** - 5,033,164 reviews

It's interesting to note that Books and Digital Ebook Purchase (which are related categories) together account for over 37 million reviews, showing the strong popularity of reading materials on Amazon's platform.
================================================================================
```
</VerticalStepper>

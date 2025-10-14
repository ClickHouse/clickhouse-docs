---
'slug': '/use-cases/AI/MCP/librechat'
'sidebar_label': '集成 LibreChat'
'title': '使用 Docker 设置 LibreChat 与 ClickHouse MCP 服务器'
'pagination_prev': null
'pagination_next': null
'description': '本指南解释了如何使用 Docker 设置 LibreChat 与 ClickHouse MCP 服务器。'
'keywords':
- 'AI'
- 'Librechat'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import LibreInterface from '@site/static/images/use-cases/AI_ML/MCP/librechat.png';


# 使用 ClickHouse MCP 服务器与 LibreChat

> 本指南解释了如何使用 Docker 设置 LibreChat 和 ClickHouse MCP 服务器，并将其连接到 ClickHouse 示例数据集。

<VerticalStepper headerLevel="h2">

## 安装 Docker {#install-docker}

您需要 Docker 来运行 LibreChat 和 MCP 服务器。要获取 Docker：
1. 访问 [docker.com](https://www.docker.com/products/docker-desktop)
2. 下载适用于您的操作系统的 Docker desktop
3. 按照操作系统的说明安装 Docker
4. 打开 Docker Desktop 并确保其正在运行
<br/>
有关更多信息，请参见 [Docker 文档](https://docs.docker.com/get-docker/)。

## 克隆 LibreChat 仓库 {#clone-librechat-repo}

打开终端（命令提示符、终端或 PowerShell），并使用以下命令克隆 
LibreChat 仓库：

```bash
git clone https://github.com/danny-avila/LibreChat.git
cd LibreChat
```

## 创建并编辑 .env 文件 {#create-and-edit-env-file}

从 `.env.example` 复制示例配置文件到 `.env`：

```bash
cp .env.example .env
```

在您喜欢的文本编辑器中打开 `.env` 文件。您将看到许多流行 LLM 提供者的部分，包括 OpenAI、Anthropic、AWS bedrock 等，例如：

```text title=".venv"
#============#

# Anthropic  #
#============#
#highlight-next-line
ANTHROPIC_API_KEY=user_provided

# ANTHROPIC_MODELS=claude-opus-4-20250514,claude-sonnet-4-20250514,claude-3-7-sonnet-20250219,claude-3-5-sonnet-20241022,claude-3-5-haiku-20241022,claude-3-opus-20240229,claude-3-sonnet-20240229,claude-3-haiku-20240307

# ANTHROPIC_REVERSE_PROXY=
```

用您的 LLM 提供者的 API 密钥替换 `user_provided`。

:::note 使用本地 LLM
如果您没有 API 密钥，可以使用本地 LLM，例如 Ollama。稍后您将看到如何执行此操作，步骤为 ["安装 Ollama"](#add-local-llm-using-ollama)。现在不要修改 .env 文件，继续下一步。
:::

## 创建一个 librechat.yaml 文件 {#create-librechat-yaml-file}

运行以下命令来创建一个新的 `librechat.yaml` 文件：

```bash
cp librechat.example.yaml librechat.yaml
```

这创建了 LibreChat 的主要 [配置文件](https://www.librechat.ai/docs/configuration/librechat_yaml)。

## 将 ClickHouse MCP 服务器添加到 Docker compose {#add-clickhouse-mcp-server-to-docker-compose}

接下来，我们将 ClickHouse MCP 服务器添加到 LibreChat Docker compose 文件中，以便 LLM 可以与 
[ClickHouse SQL playground](https://sql.clickhouse.com/) 进行交互。

创建一个名为 `docker-compose.override.yml` 的文件，并将以下配置添加到其中：

```yml title="docker-compose.override.yml"
services:
  api:
    volumes:
      - ./librechat.yaml:/app/librechat.yaml
  mcp-clickhouse:
    image: mcp/clickhouse
    container_name: mcp-clickhouse
    ports:
      - 8001:8000
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
      - CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com
      - CLICKHOUSE_USER=demo
      - CLICKHOUSE_PASSWORD=
      - CLICKHOUSE_MCP_SERVER_TRANSPORT=sse
      - CLICKHOUSE_MCP_BIND_HOST=0.0.0.0
```

如果您想探索自己的数据，可以使用 
[您自己的 ClickHouse Cloud 服务的主机、用户名和密码](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app)。

<Link to="https://cloud.clickhouse.com/">
<CardHorizontal
badgeIcon="cloud"
badgeIconDir=""
badgeState="default"
badgeText=""
description="
如果您还没有 Cloud 帐户，今天就开始使用 ClickHouse Cloud 并
获得 $300 的信用额度。在 30 天的免费试用结束时，继续使用按需付款计划，或联系我们了解有关基于使用量的折扣的更多信息。
请访问我们的定价页面以获取详细信息。
"
icon="cloud"
infoText=""
infoUrl=""
title="开始使用 ClickHouse Cloud"
isSelected={true}
/>
</Link>

## 在 librechat.yaml 中配置 MCP 服务器 {#configure-mcp-server-in-librechat-yaml}

打开 `librechat.yaml` 并在文件末尾放置以下配置：

```yml
mcpServers:
  clickhouse-playground:
    type: sse
    url: http://host.docker.internal:8001/sse
```

这将配置 LibreChat 连接到运行在 Docker 上的 MCP 服务器。

找到以下行：

```text title="librechat.yaml"
socialLogins: ['github', 'google', 'discord', 'openid', 'facebook', 'apple', 'saml']
```

为了简化起见，我们暂时移除身份验证的要求：

```text title="librechat.yaml"
socialLogins: []
```

## 使用 Ollama 添加本地 LLM（可选） {#add-local-llm-using-ollama}

### 安装 Ollama {#install-ollama}

访问 [Ollama 网站](https://ollama.com/download)，并为您的系统安装 Ollama。

安装完成后，您可以这样运行一个模型：

```bash
ollama run qwen3:32b
```

如果模型尚不存在，这将把模型拉取到您的本地机器。

有关模型的列表，请参见 [Ollama library](https://ollama.com/library)。

### 在 librechat.yaml 中配置 Ollama {#configure-ollama-in-librechat-yaml}

一旦模型下载完成，在 `librechat.yaml` 中配置它：

```text title="librechat.yaml"
custom:
  - name: "Ollama"
    apiKey: "ollama"
    baseURL: "http://host.docker.internal:11434/v1/"
    models:
      default:
        [
          "qwen3:32b"
        ]
      fetch: false
    titleConvo: true
    titleModel: "current_model"
    summarize: false
    summaryModel: "current_model"
    forcePrompt: false
    modelDisplayLabel: "Ollama"
```

## 启动所有服务 {#start-all-services}

在 LibreChat 项目文件的根目录中，运行以下命令以启动服务：

```bash
docker compose up
```

等待所有服务完全运行。

## 在浏览器中打开 LibreChat {#open-librechat-in-browser}

一旦所有服务都已启动并运行，打开浏览器并访问 `http://localhost:3080/`

如果您还没有账户，请创建一个免费的 LibreChat 账户并登录。您现在应该 
看到连接到 ClickHouse MCP 服务器的 LibreChat 界面，另外，还可以连接您的本地 LLM。

在聊天界面中，选择 `clickhouse-playground` 作为您的 MCP 服务器：

<Image img={LibreInterface} alt="选择您的 MCP 服务器" size="md"/>

您现在可以提示 LLM 探索 ClickHouse 示例数据集。试试吧：

```text title="Prompt"
What datasets do you have access to?
```

</VerticalStepper>

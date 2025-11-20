---
slug: /use-cases/AI/MCP/librechat
sidebar_label: '集成 LibreChat'
title: '使用 LibreChat 和 ClickHouse Cloud 搭建 ClickHouse MCP 服务器'
pagination_prev: null
pagination_next: null
description: '本指南介绍如何使用 Docker 将 LibreChat 与 ClickHouse MCP 服务器进行集成。'
keywords: ['AI', 'Librechat', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import LibreInterface from '@site/static/images/use-cases/AI_ML/MCP/librechat.png';


# 在 LibreChat 中使用 ClickHouse MCP 服务器

> 本指南说明如何使用 Docker 设置 LibreChat 与 ClickHouse MCP 服务器，
> 并将其连接到 ClickHouse 示例数据集。

<VerticalStepper headerLevel="h2">


## 安装 Docker {#install-docker}

您需要 Docker 来运行 LibreChat 和 MCP 服务器。获取 Docker 的步骤如下:

1. 访问 [docker.com](https://www.docker.com/products/docker-desktop)
2. 下载适用于您操作系统的 Docker Desktop
3. 按照您操作系统的相应说明安装 Docker
4. 打开 Docker Desktop 并确保其正在运行
   <br />
   有关更多信息,请参阅 [Docker
   文档](https://docs.docker.com/get-docker/)。


## 克隆 LibreChat 仓库 {#clone-librechat-repo}

打开终端(命令提示符、终端或 PowerShell),使用以下命令克隆 LibreChat 仓库:

```bash
git clone https://github.com/danny-avila/LibreChat.git
cd LibreChat
```


## 创建并编辑 .env 文件 {#create-and-edit-env-file}

将示例配置文件 `.env.example` 复制为 `.env`:

```bash
cp .env.example .env
```

使用您常用的文本编辑器打开 `.env` 文件。您将看到多个主流 LLM 提供商的配置部分,包括 OpenAI、Anthropic、AWS Bedrock 等,例如:


```text title=".venv"
#============#
# Anthropic  #
#============#
#highlight-next-line
ANTHROPIC_API_KEY=user_provided
# ANTHROPIC_MODELS=claude-opus-4-20250514,claude-sonnet-4-20250514,claude-3-7-sonnet-20250219,claude-3-5-sonnet-20241022,claude-3-5-haiku-20241022,claude-3-opus-20240229,claude-3-sonnet-20240229,claude-3-haiku-20240307
# ANTHROPIC_REVERSE_PROXY=
```

将 `user_provided` 替换为你要使用的 LLM 提供商的 API 密钥。

:::note 使用本地 LLM
如果你没有 API 密钥，可以使用像 Ollama 这样的本地 LLM。你会在后面的步骤 [&quot;Install Ollama&quot;](#add-local-llm-using-ollama) 中看到具体做法。现在先不要修改 .env 文件，继续进行接下来的步骤。
:::


## 创建 librechat.yaml 文件 {#create-librechat-yaml-file}

运行以下命令以创建新的 `librechat.yaml` 文件:

```bash
cp librechat.example.yaml librechat.yaml
```

此操作将创建 LibreChat 的主要[配置文件](https://www.librechat.ai/docs/configuration/librechat_yaml)。


## 将 ClickHouse MCP 服务器添加到 Docker Compose {#add-clickhouse-mcp-server-to-docker-compose}

接下来,我们将把 ClickHouse MCP 服务器添加到 LibreChat Docker Compose 文件中,
以便 LLM 可以与
[ClickHouse SQL playground](https://sql.clickhouse.com/) 进行交互。

创建一个名为 `docker-compose.override.yml` 的文件,并添加以下配置:

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

如果您想探索自己的数据,可以使用您的 ClickHouse Cloud 服务的
[主机地址、用户名和密码](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app)。

<Link to='https://cloud.clickhouse.com/'>
  <CardHorizontal
    badgeIcon='cloud'
    badgeIconDir=''
    badgeState='default'
    badgeText=''
    description="
如果您还没有 Cloud 账户,立即开始使用 ClickHouse Cloud,
即可获得 $300 积分。30 天免费试用结束后,您可以继续使用
按量付费计划,或联系我们了解更多批量折扣信息。
访问我们的定价页面了解详情。
"
    icon='cloud'
    infoText=''
    infoUrl=''
    title='开始使用 ClickHouse Cloud'
    isSelected={true}
  />
</Link>


## 在 librechat.yaml 中配置 MCP 服务器 {#configure-mcp-server-in-librechat-yaml}

打开 `librechat.yaml` 文件,并在文件末尾添加以下配置:

```yml
mcpServers:
  clickhouse-playground:
    type: sse
    url: http://host.docker.internal:8001/sse
```

此配置使 LibreChat 能够连接到运行在 Docker 上的 MCP 服务器。

找到以下配置行:

```text title="librechat.yaml"
socialLogins: ['github', 'google', 'discord', 'openid', 'facebook', 'apple', 'saml']
```

为简化操作,我们暂时移除身份验证需求:

```text title="librechat.yaml"
socialLogins: []
```


## 使用 Ollama 添加本地 LLM(可选) {#add-local-llm-using-ollama}

### 安装 Ollama {#install-ollama}

访问 [Ollama 网站](https://ollama.com/download)并为您的系统安装 Ollama。

安装完成后,可以通过以下方式运行模型:

```bash
ollama run qwen3:32b
```

如果本地不存在该模型,此命令将自动拉取模型到本地机器。

有关模型列表,请参阅 [Ollama 模型库](https://ollama.com/library)

### 在 librechat.yaml 中配置 Ollama {#configure-ollama-in-librechat-yaml}

模型下载完成后,在 `librechat.yaml` 中进行配置:

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

在 LibreChat 项目文件夹的根目录下,运行以下命令启动服务:

```bash
docker compose up
```

等待所有服务完全启动。


## 在浏览器中打开 LibreChat {#open-librechat-in-browser}

所有服务启动并运行后,打开浏览器并访问 `http://localhost:3080/`

如果您还没有 LibreChat 账户,请创建一个免费账户并登录。此时您应该能看到
LibreChat 界面已连接到 ClickHouse MCP 服务器,以及可选的本地 LLM。

在聊天界面中,选择 `clickhouse-playground` 作为您的 MCP 服务器:

<Image img={LibreInterface} alt='选择您的 MCP 服务器' size='md' />

现在您可以通过提示词让 LLM 探索 ClickHouse 示例数据集。试试看:

```text title="提示词"
您可以访问哪些数据集?
```

</VerticalStepper>

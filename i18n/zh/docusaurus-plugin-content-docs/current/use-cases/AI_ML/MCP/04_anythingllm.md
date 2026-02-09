---
slug: /use-cases/AI/MCP/anythingllm
sidebar_label: '集成 AnythingLLM'
title: '使用 AnythingLLM 和 ClickHouse Cloud 设置 ClickHouse MCP 服务器'
pagination_prev: null
pagination_next: null
description: '本指南介绍如何使用 Docker 将 AnythingLLM 与 ClickHouse MCP 服务器集成。'
keywords: ['AI', 'AnythingLLM', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';

import Conversation from '@site/static/images/use-cases/AI_ML/MCP/allm_conversation.png';
import MCPServers from '@site/static/images/use-cases/AI_ML/MCP/allm_mcp-servers.png';
import ToolIcon from '@site/static/images/use-cases/AI_ML/MCP/alm_tool-icon.png';

# 在 AnythingLLM 中使用 ClickHouse MCP 服务器 \{#using-clickhouse-mcp-server-with-anythingllm\}

> 本指南介绍如何使用 Docker 设置 [AnythingLLM](https://anythingllm.com/) 与 ClickHouse MCP 服务器，
> 并将其连接到 ClickHouse 示例数据集。

<VerticalStepper headerLevel="h2">

## 安装 Docker \{#install-docker\}

要运行 LibreChat 和 MCP 服务器，需要先安装 Docker。获取 Docker 的步骤如下：
1. 访问 [docker.com](https://www.docker.com/products/docker-desktop)
2. 下载适用于所用操作系统的 Docker Desktop
3. 按照对应操作系统的说明安装 Docker
4. 打开 Docker Desktop，并确认其正在运行
<br/>
更多信息请参阅 [Docker 文档](https://docs.docker.com/get-docker/)。

## 拉取 AnythingLLM Docker 镜像 \{#pull-anythingllm-docker-image\}

运行以下命令，将 AnythingLLM Docker 镜像拉取到本地机器：

```bash
docker pull anythingllm/anythingllm
```

## 设置存储位置 \{#setup-storage-location\}

创建一个用于存储数据的目录，并初始化环境文件：

```bash
export STORAGE_LOCATION=$PWD/anythingllm && \
mkdir -p $STORAGE_LOCATION && \
touch "$STORAGE_LOCATION/.env" 
```

## 配置 MCP Server 的配置文件 \{#configure-mcp-server-config-file\}

创建 `plugins` 目录：

```bash
mkdir -p "$STORAGE_LOCATION/plugins"
```

在 `plugins` 目录中创建一个名为 `anythingllm_mcp_servers.json` 的文件，并将以下内容添加到其中：

```json
{
  "mcpServers": {
    "mcp-clickhouse": {
      "command": "uv",
      "args": [
        "run",
        "--with",
        "mcp-clickhouse",
        "--python",
        "3.10",
        "mcp-clickhouse"
      ],
      "env": {
        "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
        "CLICKHOUSE_USER": "demo",
        "CLICKHOUSE_PASSWORD": ""
      }
    }
  }
}
```

如果你想探索自己的数据，可以使用你自己的 ClickHouse Cloud 服务的
[主机地址、用户名和密码](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app)。

## 启动 AnythingLLM Docker 容器 \{#start-anythingllm-docker-container\}

运行以下命令来启动 AnythingLLM Docker 容器：

```bash
docker run -p 3001:3001 \
--cap-add SYS_ADMIN \
-v ${STORAGE_LOCATION}:/app/server/storage \
-v ${STORAGE_LOCATION}/.env:/app/server/.env \
-e STORAGE_DIR="/app/server/storage" \
mintplexlabs/anythingllm
```

启动完成后，在浏览器中访问 `http://localhost:3001`。
选择要使用的模型，并提供您的 API 密钥。

## 等待 MCP 服务器启动 \{#wait-for-mcp-servers-to-start-up\}

点击界面左下角的工具图标：

<Image img={ToolIcon} alt="Tool icon" size="md"/>

点击 `Agent Skills`，然后在 `MCP Servers` 部分中查看。  
请等待，直到看到 `Mcp ClickHouse` 的状态为 `On`。

<Image img={MCPServers} alt="MCP servers ready" size="md"/>

## 使用 AnythingLLM 与 ClickHouse MCP Server 对话 \{#chat-with-clickhouse-mcp-server-with-anythingllm\}

现在可以开始对话了。
要在对话中使用 MCP Server,需要在会话的第一条消息前添加 `@agent` 前缀。

<Image img={Conversation} alt='对话' size='md' />

</VerticalStepper>

---
'slug': '/use-cases/AI/MCP/anythingllm'
'sidebar_label': '集成 AnythingLLM'
'title': '设置 ClickHouse MCP 服务器与 AnythingLLM 和 ClickHouse Cloud'
'pagination_prev': null
'pagination_next': null
'description': '本指南解释了如何使用 Docker 设置 AnythingLLM 与 ClickHouse MCP 服务器。'
'keywords':
- 'AI'
- 'AnythingLLM'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import Conversation from '@site/static/images/use-cases/AI_ML/MCP/allm_conversation.png';
import MCPServers from '@site/static/images/use-cases/AI_ML/MCP/allm_mcp-servers.png';
import ToolIcon from '@site/static/images/use-cases/AI_ML/MCP/alm_tool-icon.png';


# 使用 ClickHouse MCP 服务器与 AnythingLLM

> 本指南说明如何使用 Docker 设置 [AnythingLLM](https://anythingllm.com/) 与 ClickHouse MCP 服务器，并将其连接到 ClickHouse 示例数据集。

<VerticalStepper headerLevel="h2">

## 安装 Docker {#install-docker}

您需要 Docker 才能运行 LibreChat 和 MCP 服务器。获取 Docker 的步骤如下：
1. 访问 [docker.com](https://www.docker.com/products/docker-desktop)
2. 下载适合您操作系统的 Docker desktop
3. 按照您操作系统的说明安装 Docker
4. 打开 Docker Desktop 并确保其正在运行
<br/>
有关更多信息，请参见 [Docker 文档](https://docs.docker.com/get-docker/)。

## 拉取 AnythingLLM Docker 镜像 {#pull-anythingllm-docker-image}

运行以下命令，将 AnythingLLM Docker 镜像拉取到您的计算机上：

```bash
docker pull anythingllm/anythingllm
```

## 设置存储位置 {#setup-storage-location}

创建用于存储的目录并初始化环境文件：

```bash
export STORAGE_LOCATION=$PWD/anythingllm && \
mkdir -p $STORAGE_LOCATION && \
touch "$STORAGE_LOCATION/.env" 
```

## 配置 MCP 服务器配置文件 {#configure-mcp-server-config-file}

创建 `plugins` 目录：

```bash
mkdir -p "$STORAGE_LOCATION/plugins"
```

在 `plugins` 目录中创建名为 `anythingllm_mcp_servers.json` 的文件，并添加以下内容：

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

如果您想要浏览自己的数据，可以使用您自己的 ClickHouse Cloud 服务的 [主机、用户名和密码](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app) 进行操作。

## 启动 AnythingLLM Docker 容器 {#start-anythingllm-docker-container}

运行以下命令以启动 AnythingLLM Docker 容器：

```bash
docker run -p 3001:3001 \
--cap-add SYS_ADMIN \
-v ${STORAGE_LOCATION}:/app/server/storage \
-v ${STORAGE_LOCATION}/.env:/app/server/.env \
-e STORAGE_DIR="/app/server/storage" \
mintplexlabs/anythingllm
```

一旦启动，您可以在浏览器中导航到 `http://localhost:3001`。
选择您要使用的模型并提供您的 API 密钥。

## 等待 MCP 服务器启动 {#wait-for-mcp-servers-to-start-up}

点击用户界面左下角的工具图标：

<Image img={ToolIcon} alt="工具图标" size="md"/>

点击 `Agent Skills`，并查看 `MCP Servers` 部分。
等待直到您看到 `Mcp ClickHouse` 设置为 `On`

<Image img={MCPServers} alt="MCP 服务器准备就绪" size="md"/>

## 使用 AnythingLLM 聊天 ClickHouse MCP 服务器 {#chat-with-clickhouse-mcp-server-with-anythingllm}

现在我们准备开始聊天。
要使 MCP 服务器可用于聊天，您需要在对话的第一条消息前加上 `@agent` 前缀。

<Image img={Conversation} alt="对话" size="md"/>

</VerticalStepper>

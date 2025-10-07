---
'slug': '/use-cases/AI/MCP/claude-desktop'
'sidebar_label': '集成 Claude Desktop'
'title': '设置 ClickHouse MCP 服务器与 Claude Desktop'
'pagination_prev': null
'pagination_next': null
'description': '本指南解释如何将 Claude Desktop 设置为 ClickHouse MCP 服务器。'
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
import ClaudeDesktopConfig from '@site/static/images/use-cases/AI_ML/MCP/claude-desktop-config.png';
import FindMCPServers from '@site/static/images/use-cases/AI_ML/MCP/find-mcp-servers.gif';
import MCPPermission from '@site/static/images/use-cases/AI_ML/MCP/mcp-permission.png';
import ClaudeConversation from '@site/static/images/use-cases/AI_ML/MCP/claude-conversation.png';


# 使用 ClickHouse MCP 服务器与 Claude Desktop

> 本指南解释了如何使用 uv 设置 Claude Desktop 与 ClickHouse MCP 服务器并连接到 ClickHouse 示例数据集。

<iframe width="768" height="432" src="https://www.youtube.com/embed/y9biAm_Fkqw?si=9PP3-1Y1fvX8xy7q" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<VerticalStepper headerLevel="h2">

## 安装 uv {#install-uv}

您需要安装 [uv](https://docs.astral.sh/uv/) 才能按照本指南中的说明进行操作。
如果您不想使用 uv，则需要更新 MCP 服务器配置以使用其他软件包管理器。

## 下载 Claude Desktop {#download-claude-desktop}

您还需要安装 Claude Desktop 应用程序，可以从 [Claude Desktop 网站](https://claude.ai/desktop) 下载。

## 配置 ClickHouse MCP 服务器 {#configure-clickhouse-mcp-server}

安装好 Claude Desktop 后，接下来是配置 [ClickHouse MCP 服务器](https://github.com/ClickHouse/mcp-clickhouse)。
我们可以通过 [Claude Desktop 配置文件](https://claude.ai/docs/configuration) 来实现这一点。

要找到此文件，首先转到设置页面（在 Mac 上按 `Cmd+,`），然后单击左侧菜单中的 `Developer` 选项卡。
您将看到以下屏幕，您需要单击 `Edit config` 按钮：

<Image img={ClaudeDesktopConfig} alt="Claude Desktop 配置" size="md" />

这将带您进入包含配置文件 (`claude_desktop_config.json`) 的目录。
第一次打开该文件时，它可能包含以下内容：

```json
{
  "mcpServers": {}
}
```

`mcpServers` 字典以 MCP 服务器的名称作为键，以配置选项的字典作为值。  
例如，连接到 ClickHouse Playground 的 ClickHouse MCP 服务器配置如下所示：

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
        "CLICKHOUSE_PORT": "8443",
        "CLICKHOUSE_USER": "demo",
        "CLICKHOUSE_PASSWORD": "",
        "CLICKHOUSE_SECURE": "true",
        "CLICKHOUSE_VERIFY": "true",
        "CLICKHOUSE_CONNECT_TIMEOUT": "30",
        "CLICKHOUSE_SEND_RECEIVE_TIMEOUT": "30"
      }
    }
  }
}
```

更新配置后，您需要重启 Claude Desktop 以使更改生效。

:::warning
根据您安装 `uv` 的方式，重启 Claude Desktop 时可能会收到以下错误：

```text
MCP mcp-clickhouse: spawn uv ENOENT
```

如果发生这种情况，您需要更新 `command` 以包含 `uv` 的完整路径。例如，如果您是通过 Cargo 安装的，则路径为 `/Users/<username>/.cargo/bin/uv`
:::

## 使用 ClickHouse MCP 服务器 {#using-clickhouse-mcp-server}

重启 Claude Desktop 后，您可以通过单击 `Search and tools` 图标来找到 ClickHouse MCP 服务器：

<Image img={FindMCPServers} alt="查找 MCP 服务器" size="md" />
<br/>

您可以选择禁用所有或某些工具。

现在我们准备向 Claude 提问，这将导致它使用 ClickHouse MCP 服务器。
例如，我们可以问它 `SQL playground 中最有趣的数据集是什么？`。

Claude 第一次调用 MCP 服务器时会要求我们确认使用每个工具：

<Image img={MCPPermission} alt="授权使用 list_databases 工具" size="md" />

下面您可以看到一部分对话，其中包括对 ClickHouse MCP 服务器的一些工具调用：

<Image img={ClaudeConversation} alt="Claude 对话" size="md" />

</VerticalStepper>

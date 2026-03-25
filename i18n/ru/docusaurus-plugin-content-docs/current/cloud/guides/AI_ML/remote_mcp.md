---
slug: /use-cases/AI/MCP/remote_mcp
sidebar_label: 'Включить удалённый MCP-сервер'
title: 'Включение и подключение удалённого MCP-сервера ClickHouse Cloud'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве объясняется, как включить и использовать удалённый MCP-сервер ClickHouse Cloud'
keywords: ['AI', 'ClickHouse Cloud', 'MCP']
show_related_blogs: true
sidebar_position: 1
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import img1 from '@site/static/images/use-cases/AI_ML/MCP/1connectmcpmodal.png';
import img2 from '@site/static/images/use-cases/AI_ML/MCP/2enable_mcp.png';
import img3 from '@site/static/images/use-cases/AI_ML/MCP/3oauth.png';
import img4 from '@site/static/images/use-cases/AI_ML/MCP/4oauth_success.png';
import img5 from '@site/static/images/use-cases/AI_ML/MCP/5connected_mcp_claude.png';
import img6 from '@site/static/images/use-cases/AI_ML/MCP/6slash_mcp_claude.png';
import img7 from '@site/static/images/use-cases/AI_ML/MCP/7usage_mcp.png';

В этом руководстве описано, как включить ClickHouse Cloud Remote MCP Server и настроить его для использования с распространёнными инструментами разработки.

**Предварительные требования**

* Работающий [сервис ClickHouse Cloud](/getting-started/quick-start/cloud)
* IDE или выбранный вами инструмент для agentic-разработки


## Включение удалённого MCP-сервера для Cloud \{#enable-remote-mcp-server\}

Подключитесь к сервису ClickHouse Cloud, для которого нужно включить удалённый MCP-сервер, и нажмите кнопку `Connect` в левом меню.
Откроется окно с параметрами подключения.

Выберите &quot;Connect with MCP&quot;:

<Image img={img1} alt="Выбор MCP в окне Connect" size="md" />

Включите переключатель, чтобы включить MCP для сервиса:

<Image img={img2} alt="Включение сервера MCP" size="md" />

Скопируйте отображаемый URL — он совпадает с приведённым ниже:

```bash
https://mcp.clickhouse.cloud/mcp
```


## Настройка удалённого MCP для разработки \{#setup-clickhouse-cloud-remote-mcp-server\}

Выберите ниже свою IDE или инструмент и следуйте соответствующим инструкциям по настройке.

### Claude Code \{#claude-code\}

В рабочем каталоге выполните следующую команду, чтобы добавить конфигурацию MCP-сервера ClickHouse Cloud в Claude Code:

```bash
claude mcp add --transport http clickhouse-cloud https://mcp.clickhouse.cloud/mcp
```

Затем запустите Claude Code:

```bash
claude
```

Выполните следующую команду, чтобы получить список MCP-серверов:

```bash
/mcp
```

Выберите `clickhouse-cloud` и пройдите аутентификацию через OAuth, используя свои учетные данные ClickHouse Cloud.

### Веб-интерфейс Claude \{#claude-web\}

1. Перейдите в **Customize** &gt; **Connectors**
2. Нажмите значок &quot;+&quot; и выберите **Add custom connector**
3. Укажите имя для пользовательского connector, например `clickhouse-cloud`, и добавьте его
4. Нажмите на только что добавленный connector `clickhouse-cloud`, затем нажмите **Connect**
5. Пройдите аутентификацию через OAuth, используя свои учетные данные ClickHouse Cloud

### Cursor \{#cursor\}

1. Откройте [Cursor Marketplace](https://cursor.com/marketplace), чтобы найти и установить MCP-серверы.
2. Найдите ClickHouse и нажмите «Add to Cursor» на любом сервере, чтобы установить его.
3. Пройдите аутентификацию через OAuth.

### Visual Studio Code \{#visual-studio-code\}

Добавьте следующую конфигурацию в `.vscode/mcp.json`:

```json
{
  "servers": {
    "clickhouse-cloud": {
      "type": "http",
      "url": "https://mcp.clickhouse.cloud/mcp"
    }
  }
}
```

Подробнее см. в [документации Visual Studio Code](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)

### Windsurf \{#windsurf\}

Отредактируйте файл `mcp_config.json`, добавив в него следующую конфигурацию:

```json
{
  "mcpServers": {
    "clickhouse-cloud": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.clickhouse.cloud/mcp"]
    }
  }
}
```

Подробнее см. в [документации Windsurf](https://docs.windsurf.com/windsurf/cascade/mcp#adding-a-new-mcp)


### Zed \{#zed\}

Добавьте ClickHouse в качестве пользовательского сервера.
Добавьте в настройки Zed следующее в разделе **context_servers**:

```json
{
  "context_servers": {
    "clickhouse-cloud": {
      "url": "https://mcp.clickhouse.cloud/mcp"
    }
  }
}
```

При первом подключении к серверу Zed должен предложить вам пройти аутентификацию через OAuth.
Подробнее см. в [документации Zed](https://zed.dev/docs/ai/mcp#as-custom-servers)

### Codex \{#codex\}

Выполните следующую команду, чтобы добавить MCP-сервер ClickHouse Cloud с помощью CLI:

```bash
codex mcp add clickhouse-cloud --url https://mcp.clickhouse.cloud/mcp
```


## Связанные материалы \{#related-content\}

* [Навыки agent для ClickHouse](https://github.com/ClickHouse/agent-skills)
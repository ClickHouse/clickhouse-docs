---
slug: /use-cases/AI/MCP/remote_mcp
sidebar_label: 'Удалённый MCP в ClickHouse Cloud'
title: 'Включение удалённого MCP-сервера в ClickHouse Cloud'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве объясняется, как включить и использовать удалённый MCP в ClickHouse Cloud'
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

# Включение удалённого MCP‑сервера ClickHouse Cloud {#enabling-the-clickhouse-cloud-remote-mcp-server}

> В этом руководстве описано, как включить и использовать удалённый MCP‑сервер ClickHouse Cloud. В качестве примера мы будем использовать Claude Code в роли MCP‑клиента, но можно использовать любой LLM‑клиент с поддержкой MCP.

<VerticalStepper headerLevel="h2">

## Включение удалённого MCP-сервера для вашего сервиса ClickHouse Cloud {#enable-remote-mcp-server}

1. Подключитесь к сервису ClickHouse Cloud, нажмите кнопку `Connect` и включите удалённый MCP-сервер для этого сервиса

<Image img={img1} alt="Выбор MCP в модальном окне Connect" size="md" />

<Image img={img2} alt="Включение MCP-сервера" size="md" />

2. Скопируйте URL-адрес MCP-сервера ClickHouse Cloud из окна `Connect` или из блока ниже

```bash
https://mcp.clickhouse.cloud/mcp
```

## Добавление сервера ClickHouse MCP в Claude Code {#add-clickhouse-mcp-server-claude-code}

1. В рабочем каталоге выполните следующую команду, чтобы добавить конфигурацию MCP-сервера ClickHouse Cloud в Claude Code. В этом примере мы назвали MCP-сервер в конфигурации Claude Code `clickhouse_cloud`.

```bash
claude mcp add --transport http clickhouse_cloud https://mcp.clickhouse.cloud/mcp
```

1b. В зависимости от используемого MCP Client вы также можете напрямую редактировать JSON-конфигурацию

```json
{
  "mcpServers": {
    "clickhouse-remote": {
      "url": "https://mcp.clickhouse.cloud/mcp"
    }
  }
}
```

2. Запустите Claude Code в вашем рабочем каталоге

```bash
[user@host ~/Documents/repos/mcp_test] $ claude
```

## Аутентификация в ClickHouse Cloud через OAuth {#authenticate-via-oauth}

1. При первом сеансе Claude Code откроет окно браузера. В противном случае вы можете инициировать подключение, выполнив команду `/mcp` в Claude Code и выбрав MCP-сервер `clickhouse_cloud`.

2. Войдите, используя свои учетные данные ClickHouse Cloud.

<Image img={img3} alt="Процесс подключения через OAuth" size="sm"/>

<Image img={img4} alt="Успешное подключение через OAuth" size="sm"/>

## Использование удалённого сервера MCP ClickHouse Cloud в Claude Code {#use-rempte-mcp-from-claude-code}

1. В Claude Code убедитесь, что удалённый сервер MCP подключён

<Image img={img5} alt='Успешное подключение MCP в Claude Code' size='md' />

<Image img={img6} alt='Подробная информация о MCP в Claude Code' size='md' />

2. Поздравляем! Теперь вы можете использовать удалённый сервер MCP ClickHouse Cloud в Claude Code

<Image img={img7} alt='Использование MCP в Claude Code' size='md' />

Хотя в этом примере используется Claude Code, вы можете использовать любой LLM‑клиент с поддержкой MCP, выполнив аналогичные шаги.

</VerticalStepper>

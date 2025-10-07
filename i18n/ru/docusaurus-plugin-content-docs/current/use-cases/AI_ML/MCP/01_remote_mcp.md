---
'slug': '/use-cases/AI/MCP/remote_mcp'
'sidebar_label': 'ClickHouse Cloud Remote MCP'
'title': 'Включение ClickHouse Cloud Remote MCP сервера'
'pagination_prev': null
'pagination_next': null
'description': 'Это руководство объясняет, как включить и использовать ClickHouse
  Cloud Remote MCP'
'keywords':
- 'AI'
- 'ClickHouse Cloud'
- 'MCP'
'show_related_blogs': true
'sidebar_position': 1
'doc_type': 'guide'
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


# Включение удаленного сервера MCP ClickHouse Cloud

> Этот гид объясняет, как включить и использовать удаленный сервер MCP ClickHouse Cloud. В этом примере мы будем использовать Claude Code в качестве клиента MCP, но можно использовать любой клиент LLM, который поддерживает MCP.

<VerticalStepper headerLevel="h2">

## Включите удаленный сервер MCP для вашего сервиса ClickHouse Cloud {#enable-remote-mcp-server}

1. Подключитесь к вашему сервису ClickHouse Cloud, нажмите кнопку `Connect` и включите удаленный сервер MCP для вашего сервиса.

<Image img={img1} alt="Выберите MCP в модальном окне подключения" size="md"/>

<Image img={img2} alt="Включить сервер MCP" size="md"/>

2. Скопируйте URL удаленного сервера MCP ClickHouse Cloud из окна `Connect` или ниже.

```bash
https://mcp.clickhouse.cloud/mcp
```

## Добавьте сервер MCP ClickHouse в Claude Code {#add-clickhouse-mcp-server-claude-code}

1. В вашей рабочей директории выполните следующую команду, чтобы добавить конфигурацию сервера MCP ClickHouse Cloud в Claude Code. В этом примере мы назвали сервер MCP в конфигурации Claude Code `clickhouse_cloud`.

```bash
claude mcp add --transport http clickhouse_cloud https://mcp.clickhouse.cloud/mcp
```

1b. В зависимости от используемого клиента MCP вы также можете редактировать JSON конфигурацию напрямую.

```json
{
  "mcpServers": {
    "clickhouse-remote": {
      "url": "https://mcp.clickhouse.cloud/mcp"
    }
  }
}
```

2. Запустите Claude Code в вашей рабочей директории.

```bash
[user@host ~/Documents/repos/mcp_test] $ claude
```

## Аутентификация в ClickHouse Cloud через OAuth {#authenticate-via-oauth}

1. Claude Code откроет окно браузера при первой сессии. В противном случае вы также можете инициировать подключение, выполнив команду `/mcp` в Claude Code и выбрав сервер MCP `clickhouse_cloud`.

2. Аутентифицируйтесь, используя свои учетные данные ClickHouse Cloud.

<Image img={img3} alt="Процесс подключения OAuth" size="sm"/>

<Image img={img4} alt="Успех процесса подключения OAuth" size="sm"/>

## Использование удаленного сервера MCP ClickHouse Cloud из Claude Code {#use-rempte-mcp-from-claude-code}

1. Убедитесь в Claude Code, что удаленный сервер MCP подключен.

<Image img={img5} alt="Успех MCP в Claude Code" size="md"/>

<Image img={img6} alt="Подробности MCP в Claude Code" size="md"/>

2. Поздравляем! Теперь вы можете использовать удаленный сервер MCP ClickHouse Cloud из Claude Code.

<Image img={img7} alt="Использование MCP в Claude Code" size="md"/>

Хотя в этом примере использовался Claude Code, вы можете использовать любой клиент LLM, который поддерживает MCP, следуя аналогичным шагам.

</VerticalStepper>

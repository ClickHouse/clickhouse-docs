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

В этом руководстве описано, как включить удалённый MCP-сервер ClickHouse Cloud и настроить его для использования с распространёнными инструментами разработки.

**Предварительные требования**

* Работающий [сервис ClickHouse Cloud](/getting-started/quick-start/cloud)
* IDE или выбранный вами инструмент для agentic-разработки


## Включение удалённого MCP-сервера для Cloud \{#enable-remote-mcp-server\}

Подключитесь к сервису ClickHouse Cloud, для которого нужно включить удалённый MCP-сервер.
В левом меню нажмите **Connect**. Откроется окно с параметрами подключения.

Выберите **Connect with MCP**:

<Image img={img1} alt="Выбор MCP в окне Connect" size="md" />

Включите переключатель, чтобы включить MCP для сервиса:

<Image img={img2} alt="Включение MCP-сервера" size="md" />

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

Подробнее см. в [документации Visual Studio Code](https://code.visualstudio.com/docs/copilot/customization/mcp-servers).


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

Подробнее см. в [документации Windsurf](https://docs.windsurf.com/windsurf/cascade/mcp#adding-a-new-mcp).


### Zed \{#zed\}

Добавьте ClickHouse в качестве пользовательского сервера.
Добавьте в настройки Zed следующее в разделе **context&#95;servers**:

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
Подробнее см. в [документации Zed](https://zed.dev/docs/ai/mcp#as-custom-servers).


### Codex \{#codex\}

Выполните следующую команду, чтобы добавить MCP-сервер ClickHouse Cloud с помощью CLI:

```bash
codex mcp add clickhouse-cloud --url https://mcp.clickhouse.cloud/mcp
```


## Пример использования \{#example-usage\}

После подключения вы можете взаимодействовать с ClickHouse Cloud с помощью запросов на естественном языке.
Ниже приведены типовые сценарии работы и инструменты, которые ваш MCP-клиент будет вызывать в фоновом режиме.
Полный список доступных инструментов см. в разделе [справочник по инструментам](/cloud/features/ai-ml/remote-mcp#available-tools).

### Изучение ваших данных \{#exploring-data\}

Начните с просмотра доступных данных:

| Запрос                                                                  | Вызываемый инструмент             |
| ----------------------------------------------------------------------- | --------------------------------- |
| &quot;К каким организациям у меня есть доступ?&quot;                    | `get_organizations`               |
| &quot;Какие базы данных доступны в моём сервисе?&quot;                  | `list_databases`                  |
| &quot;Покажи таблицы в базе данных `default`&quot;                      | `list_tables`                     |
| &quot;Выведи список всех таблиц, чьи имена начинаются с `events_`&quot; | `list_tables` (с фильтром `like`) |

### Выполнение аналитических запросов \{#running-queries\}

Задавайте вопросы обычным языком, и агент преобразует их в SQL:

| Запрос                                                                              | вызываемый инструмент |
| ----------------------------------------------------------------------------------- | ----------------------- |
| &quot;Покажи 10 первых строк из таблицы `hits`&quot;                                | `run_select_query`      |
| &quot;Какова средняя продолжительность сессии по странам за последние 7 дней?&quot; | `run_select_query`      |
| &quot;Сколько строк в каждой таблице базы данных `analytics`?&quot;                 | `run_select_query`      |

Инструмент `run_select_query` разрешает выполнять только команды `SELECT`. Все запросы выполняются только на чтение.

### Управление сервисами и инфраструктурой \{#managing-services\}

Получите представление о своих ресурсах в ClickHouse Cloud:

| запрос                                                                 | вызываемый инструмент                       |
| ---------------------------------------------------------------------- | ---------------------------------- |
| &quot;Покажи все мои сервисы&quot;                                     | `get_services_list`                |
| &quot;Каков статус моего сервиса в промышленной эксплуатации?&quot;    | `get_service_details`              |
| &quot;Покажи расписание резервного копирования для этого сервиса&quot; | `get_service_backup_configuration` |
| &quot;Покажи недавние резервные копии&quot;                            | `list_service_backups`             |
| &quot;Какие ClickPipes настроены для этого сервиса?&quot;              | `list_clickpipes`                  |

### Затраты на мониторинг \{#monitoring-costs\}

| Запрос                                                              | вызываемый инструмент                             |
| ------------------------------------------------------------------- | --------------------------------------------------- |
| &quot;Каковы были расходы моей организации за прошлую неделю?&quot; | `get_organization_cost`                             |
| &quot;Покажи ежедневные расходы с 1 по 15 марта&quot;               | `get_organization_cost` (с `from_date` и `to_date`) |

## Связанные материалы \{#related-content\}

* [Навыки agent для ClickHouse](https://github.com/ClickHouse/agent-skills)
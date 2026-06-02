---
sidebar_label: 'Notion'
slug: /integrations/notion
keywords: ['clickhouse', 'notion', 'mcp', 'пользовательские агенты', 'ai', 'интеграция', 'подключение']
description: 'Подключите ClickHouse Cloud к Custom Agent в Notion через удалённый MCP-сервер ClickHouse.'
title: 'Подключение Notion к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_integration'
---

import Image from '@theme/IdealImage';
import PartnerBadge from '@theme/badges/PartnerBadge';
import addClickHouseConnection from '@site/static/images/integrations/tools/data-integration/notion/add-clickhouse-connection.png';
import clickhouseToolsToggles from '@site/static/images/integrations/tools/data-integration/notion/clickhouse-tools-toggles.png';

<PartnerBadge />

[Notion](https://www.notion.com/) — это единое рабочее пространство для заметок, документов, проектов и Custom Agents на базе ИИ.

Вы можете подключить ClickHouse Cloud к [Custom Agent](https://www.notion.com/help/mcp-connections-for-custom-agents) в Notion. После подключения агент сможет просматривать ваши данные, выполнять аналитические запросы в режиме только для чтения, а также показывать сведения о сервисе и затратах в ClickHouse Cloud, не покидая Notion.

## Предварительные требования \{#prerequisites\}

* Запущенный [сервис ClickHouse Cloud](/getting-started/quick-start/cloud) с [включенным удаленным MCP-сервером](/use-cases/AI/MCP/remote_mcp#enable-remote-mcp-server)
* Рабочее пространство Notion на тарифе **Business** или **Enterprise**

## Подключите ClickHouse к пользовательскому агенту Notion \{#connect-clickhouse-to-notion\}

В Notion ClickHouse доступен как предварительно настроенное подключение (пока в бета-версии). Настраивать собственный MCP-сервер или вставлять URL не требуется.

1. В Notion создайте новый Custom Agent из раздела **Agents** на боковой панели.
2. В разделе **Settings** вашего агента, в подразделе **Tools and Access**, выберите **Add connection** и добавьте **ClickHouse** из списка доступных подключений.

<Image img={addClickHouseConnection} size="md" alt="Выбор ClickHouse в окне Add connection в Notion" />

3. Нажмите **Connect** и завершите процедуру OAuth, используя свои учетные данные ClickHouse Cloud. Доступ будет ограничен теми организациями и сервисами, к которым у вашей учетной записи уже есть доступ.

4. Разверните новое подключение ClickHouse в настройках агента и включите инструменты, которые должен использовать этот агент. Для каждого инструмента также можно выбрать, должен ли агент запускать его автоматически или всегда запрашивать подтверждение. Все инструменты, предоставляемые удалённым MCP-сервером ClickHouse, доступны только для чтения. Полный актуальный список см. в разделе [available tools](/cloud/features/ai-ml/remote-mcp#available-tools).

<Image img={clickhouseToolsToggles} size="md" alt="Развернутое подключение ClickHouse в Notion с переключателями для отдельных инструментов" />

:::note
Для каждого Custom Agent требуется отдельное подключение ClickHouse, и только пользователь, выполнивший аутентификацию подключения, может изменять настройки его инструментов. Подробнее см. в Notion: [security best practices for Agent connections](https://www.notion.com/help/security-best-practices-for-agent-connections).
:::

## См. также \{#related-content\}

* [Включить и подключить удалённый MCP-сервер ClickHouse Cloud](/use-cases/AI/MCP/remote_mcp)
* [Удалённый MCP в Cloud: справочник по инструментам](/cloud/features/ai-ml/remote-mcp)
* Notion: [MCP-подключения для Custom Agents](https://www.notion.com/help/mcp-connections-for-custom-agents)
* Notion: [Подключение Custom Agents к вашему набору инструментов с помощью интеграций MCP](https://www.notion.com/help/guides/connect-custom-agents-to-mcp-integrations)
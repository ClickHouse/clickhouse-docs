---
slug: /use-cases/AI/MCP/anythingllm
sidebar_label: 'Интеграция AnythingLLM'
title: 'Настройка сервера ClickHouse MCP с AnythingLLM и ClickHouse Cloud'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве описано, как развернуть AnythingLLM с сервером ClickHouse MCP с использованием Docker.'
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


# Использование MCP-сервера ClickHouse с AnythingLLM

> В этом руководстве описывается, как настроить [AnythingLLM](https://anythingllm.com/) с MCP-сервером ClickHouse с помощью Docker
> и подключить его к примерам наборов данных ClickHouse.

<VerticalStepper headerLevel="h2">


## Установка Docker {#install-docker}

Для запуска LibreChat и сервера MCP необходим Docker. Чтобы установить Docker:

1. Перейдите на сайт [docker.com](https://www.docker.com/products/docker-desktop)
2. Скачайте Docker Desktop для вашей операционной системы
3. Установите Docker, следуя инструкциям для вашей операционной системы
4. Запустите Docker Desktop и убедитесь, что приложение работает
   <br />
   Подробнее см. в [документации Docker](https://docs.docker.com/get-docker/).


## Загрузка Docker-образа AnythingLLM {#pull-anythingllm-docker-image}

Выполните следующую команду для загрузки Docker-образа AnythingLLM на ваш компьютер:

```bash
docker pull anythingllm/anythingllm
```


## Настройка расположения хранилища {#setup-storage-location}

Создайте каталог для хранения данных и инициализируйте файл окружения:

```bash
export STORAGE_LOCATION=$PWD/anythingllm && \
mkdir -p $STORAGE_LOCATION && \
touch "$STORAGE_LOCATION/.env"
```


## Настройка конфигурационного файла MCP Server {#configure-mcp-server-config-file}

Создайте директорию `plugins`:

```bash
mkdir -p "$STORAGE_LOCATION/plugins"
```

Создайте файл `anythingllm_mcp_servers.json` в директории `plugins` и добавьте следующее содержимое:

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

Если вы хотите работать с собственными данными, используйте [хост, имя пользователя и пароль](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app) вашего сервиса ClickHouse Cloud.


## Запуск Docker-контейнера AnythingLLM {#start-anythingllm-docker-container}

Выполните следующую команду для запуска Docker-контейнера AnythingLLM:

```bash
docker run -p 3001:3001 \
--cap-add SYS_ADMIN \
-v ${STORAGE_LOCATION}:/app/server/storage \
-v ${STORAGE_LOCATION}/.env:/app/server/.env \
-e STORAGE_DIR="/app/server/storage" \
mintplexlabs/anythingllm
```

После запуска перейдите по адресу `http://localhost:3001` в браузере.
Выберите модель, которую хотите использовать, и укажите API-ключ.


## Ожидание запуска MCP-серверов {#wait-for-mcp-servers-to-start-up}

Нажмите на значок инструментов в левом нижнем углу интерфейса:

<Image img={ToolIcon} alt='Значок инструментов' size='md' />

Нажмите на `Agent Skills` и перейдите в раздел `MCP Servers`.
Дождитесь, пока для `Mcp ClickHouse` не отобразится статус `On`

<Image img={MCPServers} alt='MCP-серверы готовы' size='md' />


## Чат с ClickHouse MCP Server через AnythingLLM {#chat-with-clickhouse-mcp-server-with-anythingllm}

Теперь можно начать работу с чатом.
Чтобы сделать MCP-серверы доступными в чате, необходимо добавить префикс `@agent` к первому сообщению в беседе.

<Image img={Conversation} alt='Conversation' size='md' />

</VerticalStepper>

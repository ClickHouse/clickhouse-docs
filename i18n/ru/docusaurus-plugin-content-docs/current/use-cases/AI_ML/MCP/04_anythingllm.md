---
slug: /use-cases/AI/MCP/anythingllm
sidebar_label: 'Интеграция AnythingLLM'
title: 'Настройка сервера ClickHouse MCP с AnythingLLM и ClickHouse Cloud'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве описано, как настроить работу AnythingLLM с сервером ClickHouse MCP с использованием Docker.'
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


# Использование сервера MCP ClickHouse с AnythingLLM {#using-clickhouse-mcp-server-with-anythingllm}

> В этом руководстве описано, как настроить [AnythingLLM](https://anythingllm.com/) с сервером MCP ClickHouse с использованием Docker
> и подключить его к демонстрационным наборам данных ClickHouse.

<VerticalStepper headerLevel="h2">


## Установите Docker {#install-docker}

Вам понадобится Docker, чтобы запустить LibreChat и MCP-сервер. Чтобы установить Docker:
1. Перейдите на сайт [docker.com](https://www.docker.com/products/docker-desktop)
2. Скачайте Docker Desktop для вашей операционной системы
3. Установите Docker Desktop, следуя инструкциям для вашей операционной системы
4. Откройте Docker Desktop и убедитесь, что он запущен
<br/>
Для получения дополнительной информации см. [документацию Docker](https://docs.docker.com/get-docker/).



## Загрузка Docker-образа AnythingLLM {#pull-anythingllm-docker-image}

Выполните следующую команду, чтобы загрузить Docker-образ AnythingLLM на локальную машину:

```bash
docker pull anythingllm/anythingllm
```


## Настройка расположения хранилища {#setup-storage-location}

Создайте каталог для хранилища и инициализируйте файл окружения:

```bash
export STORAGE_LOCATION=$PWD/anythingllm && \
mkdir -p $STORAGE_LOCATION && \
touch "$STORAGE_LOCATION/.env" 
```


## Настройка файла конфигурации сервера MCP {#configure-mcp-server-config-file}

Создайте каталог `plugins`:

```bash
mkdir -p "$STORAGE_LOCATION/plugins"
```

Создайте файл с именем `anythingllm_mcp_servers.json` в каталоге `plugins` и добавьте в него следующее содержимое:

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

Если вы хотите изучить свои данные, вы можете сделать это, используя
[host, имя пользователя и пароль](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app)
собственного сервиса ClickHouse Cloud.


## Запустите Docker-контейнер AnythingLLM {#start-anythingllm-docker-container}

Запустите Docker-контейнер AnythingLLM следующей командой:

```bash
docker run -p 3001:3001 \
--cap-add SYS_ADMIN \
-v ${STORAGE_LOCATION}:/app/server/storage \
-v ${STORAGE_LOCATION}/.env:/app/server/.env \
-e STORAGE_DIR="/app/server/storage" \
mintplexlabs/anythingllm
```

После запуска откройте в браузере адрес `http://localhost:3001`.
Выберите модель, которую хотите использовать, и укажите свой API-ключ.


## Дождитесь запуска MCP Servers {#wait-for-mcp-servers-to-start-up}

Нажмите значок инструмента в левой нижней части интерфейса:

<Image img={ToolIcon} alt="Значок инструмента" size="md"/>

Нажмите `Agent Skills` и перейдите к разделу `MCP Servers`. 
Дождитесь, пока состояние `Mcp ClickHouse` не изменится на `On`.

<Image img={MCPServers} alt="MCP servers готовы" size="md"/>



## Чат с ClickHouse MCP Server в AnythingLLM {#chat-with-clickhouse-mcp-server-with-anythingllm}

Теперь мы готовы начать чат.
Чтобы серверы MCP были доступны в чате, необходимо предварить первое сообщение в диалоге префиксом `@agent`.

<Image img={Conversation} alt='Чат' size='md' />

</VerticalStepper>

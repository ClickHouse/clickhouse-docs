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

# Использование сервера ClickHouse MCP с AnythingLLM \{#using-clickhouse-mcp-server-with-anythingllm\}

> В этом руководстве объясняется, как настроить [AnythingLLM](https://anythingllm.com/) для работы с сервером ClickHouse MCP с использованием Docker
> и подключить его к примерным датасетам ClickHouse.

<VerticalStepper headerLevel="h2">
  ## Установка Docker \{#install-docker\}

  Для запуска LibreChat и сервера MCP вам понадобится Docker. Чтобы установить Docker:

  1. Перейдите на [docker.com](https://www.docker.com/products/docker-desktop)
  2. Загрузите Docker Desktop для своей операционной системы
  3. Установите Docker, следуя инструкциям для своей операционной системы
  4. Откройте Docker Desktop и убедитесь, что он запущен

  <br />

  Дополнительная информация: [документация Docker](https://docs.docker.com/get-docker/).

  ## Загрузка Docker-образа AnythingLLM \{#pull-anythingllm-docker-image\}

  Выполните следующую команду, чтобы загрузить Docker-образ AnythingLLM на свой компьютер:

  ```bash
  docker pull anythingllm/anythingllm
  ```

  ## Настройка расположения хранилища \{#setup-storage-location\}

  Создайте каталог для хранения и инициализируйте файл окружения:

  ```bash
  export STORAGE_LOCATION=$PWD/anythingllm && \
  mkdir -p $STORAGE_LOCATION && \
  touch "$STORAGE_LOCATION/.env" 
  ```

  ## Настройка файла конфигурации сервера MCP \{#configure-mcp-server-config-file\}

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

  ## Запуск контейнера Docker AnythingLLM \{#start-anythingllm-docker-container\}

  Выполните следующую команду, чтобы запустить контейнер Docker AnythingLLM:

  ```bash
  docker run -p 3001:3001 \
  --cap-add SYS_ADMIN \
  -v ${STORAGE_LOCATION}:/app/server/storage \
  -v ${STORAGE_LOCATION}/.env:/app/server/.env \
  -e STORAGE_DIR="/app/server/storage" \
  mintplexlabs/anythingllm
  ```

  После запуска откройте в браузере `http://localhost:3001`.
  Выберите модель, которую хотите использовать, и укажите свой ключ API.

  ## Подождите, пока запустятся серверы MCP \{#wait-for-mcp-servers-to-start-up\}

  Нажмите на значок инструмента в левом нижнем углу UI:

  <Image img={ToolIcon} alt="Значок инструмента" size="md" />

  Нажмите `Agent Skills` и найдите раздел `MCP servers`.
  Подождите, пока для `Mcp ClickHouse` не будет установлено значение `On`

  <Image img={MCPServers} alt="Серверы MCP готовы" size="md" />

  ## Общение с сервером ClickHouse MCP с AnythingLLM \{#chat-with-clickhouse-mcp-server-with-anythingllm\}

  Теперь всё готово для начала чата.
  Чтобы серверы MCP были доступны в чате, вам нужно добавить префикс `@agent` к первому сообщению в разговоре.

  <Image img={Conversation} alt="Разговор" size="md" />
</VerticalStepper>
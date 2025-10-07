---
'slug': '/use-cases/AI/MCP/anythingllm'
'sidebar_label': 'Интеграция AnythingLLM'
'title': 'Настройка ClickHouse MCP сервера с AnythingLLM и ClickHouse Cloud'
'pagination_prev': null
'pagination_next': null
'description': 'Этот гид объясняет, как настроить AnythingLLM с сервером ClickHouse
  MCP, используя Docker.'
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


# Использование ClickHouse MCP сервера с AnythingLLM

> Этот гайд объясняет, как настроить [AnythingLLM](https://anythingllm.com/) с ClickHouse MCP сервером, используя Docker, и подключить его к примерам данных ClickHouse.

<VerticalStepper headerLevel="h2">

## Установка Docker {#install-docker}

Вам понадобится Docker для запуска LibreChat и MCP сервера. Чтобы установить Docker:
1. Перейдите на [docker.com](https://www.docker.com/products/docker-desktop)
2. Скачайте Docker desktop для вашей операционной системы
3. Установите Docker, следуя инструкциям для вашей операционной системы
4. Откройте Docker Desktop и убедитесь, что он запущен
<br/>
Для получения дополнительной информации смотрите [документацию Docker](https://docs.docker.com/get-docker/).

## Загрузка Docker образа AnythingLLM {#pull-anythingllm-docker-image}

Выполните следующую команду, чтобы загрузить Docker образ AnythingLLM на ваш компьютер:

```bash
docker pull anythingllm/anythingllm
```

## Настройка каталога хранения {#setup-storage-location}

Создайте каталог для хранения и инициализируйте файл окружения:

```bash
export STORAGE_LOCATION=$PWD/anythingllm && \
mkdir -p $STORAGE_LOCATION && \
touch "$STORAGE_LOCATION/.env" 
```

## Настройка конфигурационного файла MCP сервера {#configure-mcp-server-config-file}

Создайте директорию `plugins`:

```bash
mkdir -p "$STORAGE_LOCATION/plugins"
```

Создайте файл с именем `anythingllm_mcp_servers.json` в директории `plugins` и добавьте следующее содержимое:

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

Если вы хотите исследовать свои данные, вы можете сделать это, используя 
[хост, имя пользователя и пароль](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app) 
вашей службы ClickHouse Cloud.

## Запуск контейнера AnythingLLM Docker {#start-anythingllm-docker-container}

Выполните следующую команду, чтобы запустить контейнер AnythingLLM Docker:

```bash
docker run -p 3001:3001 \
--cap-add SYS_ADMIN \
-v ${STORAGE_LOCATION}:/app/server/storage \
-v ${STORAGE_LOCATION}/.env:/app/server/.env \
-e STORAGE_DIR="/app/server/storage" \
mintplexlabs/anythingllm
```

После того как это будет сделано, перейдите в `http://localhost:3001` в вашем браузере.
Выберите модель, которую хотите использовать, и предоставьте свой API ключ.

## Подождите, пока MCP сервера запустятся {#wait-for-mcp-servers-to-start-up}

Нажмите на иконку инструмента в левом нижнем углу интерфейса:

<Image img={ToolIcon} alt="Icon инструмента" size="md"/>

Нажмите на `Навыки агента` и посмотрите в разделе `MCP Servers`. 
Подождите, пока вы не увидите `Mcp ClickHouse`, установленный в `On`

<Image img={MCPServers} alt="MCP сервера готовы" size="md"/>

## Общение с ClickHouse MCP сервером с AnythingLLM {#chat-with-clickhouse-mcp-server-with-anythingllm}

Теперь мы готовы начать разговор. 
Чтобы сделать MCP серверы доступными для чата, вам нужно префиксировать первое сообщение в разговоре `@agent`.

<Image img={Conversation} alt="Разговор" size="md"/>

</VerticalStepper>

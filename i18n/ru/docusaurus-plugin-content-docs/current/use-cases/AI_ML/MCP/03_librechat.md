---
slug: /use-cases/AI/MCP/librechat
sidebar_label: 'Интеграция LibreChat'
title: 'Настройка сервера ClickHouse MCP с LibreChat и ClickHouse Cloud'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве показано, как настроить LibreChat с сервером ClickHouse MCP с использованием Docker.'
keywords: ['AI', 'Librechat', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import LibreInterface from '@site/static/images/use-cases/AI_ML/MCP/librechat.png';


# Использование MCP-сервера ClickHouse с LibreChat

> В этом руководстве описывается, как настроить LibreChat с MCP-сервером ClickHouse с помощью Docker
> и подключить его к примерам наборов данных ClickHouse.

<VerticalStepper headerLevel="h2">


## Установка Docker {#install-docker}

Для запуска LibreChat и сервера MCP необходим Docker. Чтобы установить Docker:

1. Перейдите на сайт [docker.com](https://www.docker.com/products/docker-desktop)
2. Скачайте Docker Desktop для вашей операционной системы
3. Установите Docker, следуя инструкциям для вашей операционной системы
4. Запустите Docker Desktop и убедитесь, что он работает
   <br />
   Дополнительную информацию см. в [документации Docker](https://docs.docker.com/get-docker/).


## Клонирование репозитория LibreChat {#clone-librechat-repo}

Откройте терминал (командную строку или PowerShell) и клонируйте
репозиторий LibreChat с помощью следующей команды:

```bash
git clone https://github.com/danny-avila/LibreChat.git
cd LibreChat
```


## Создание и редактирование файла .env {#create-and-edit-env-file}

Скопируйте файл с примером конфигурации из `.env.example` в `.env`:

```bash
cp .env.example .env
```

Откройте файл `.env` в любом текстовом редакторе. Вы увидите разделы для
различных популярных провайдеров LLM, включая OpenAI, Anthropic, AWS Bedrock и другие,
например:


```text title=".venv"
#============#
# Anthropic  #
#============#
#highlight-next-line
ANTHROPIC_API_KEY=user_provided
# ANTHROPIC_MODELS=claude-opus-4-20250514,claude-sonnet-4-20250514,claude-3-7-sonnet-20250219,claude-3-5-sonnet-20241022,claude-3-5-haiku-20241022,claude-3-opus-20240229,claude-3-sonnet-20240229,claude-3-haiku-20240307
# ANTHROPIC_REVERSE_PROXY=
```

Замените `user_provided` на ваш API-ключ для провайдера LLM, которого вы хотите использовать.

:::note Использование локальной LLM
Если у вас нет API-ключа, вы можете использовать локальную LLM, например Ollama. Вы увидите,
как это сделать позже на шаге [&quot;Install Ollama&quot;](#add-local-llm-using-ollama). Пока
не изменяйте файл .env и переходите к следующим шагам.
:::


## Создание файла librechat.yaml {#create-librechat-yaml-file}

Выполните следующую команду для создания нового файла `librechat.yaml`:

```bash
cp librechat.example.yaml librechat.yaml
```

Эта команда создаст основной [файл конфигурации](https://www.librechat.ai/docs/configuration/librechat_yaml) для LibreChat.


## Добавление MCP-сервера ClickHouse в Docker Compose {#add-clickhouse-mcp-server-to-docker-compose}

Далее мы добавим MCP-сервер ClickHouse в файл Docker Compose для LibreChat,
чтобы LLM мог взаимодействовать с
[песочницей ClickHouse SQL](https://sql.clickhouse.com/).

Создайте файл `docker-compose.override.yml` и добавьте в него следующую конфигурацию:

```yml title="docker-compose.override.yml"
services:
  api:
    volumes:
      - ./librechat.yaml:/app/librechat.yaml
  mcp-clickhouse:
    image: mcp/clickhouse
    container_name: mcp-clickhouse
    ports:
      - 8001:8000
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
      - CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com
      - CLICKHOUSE_USER=demo
      - CLICKHOUSE_PASSWORD=
      - CLICKHOUSE_MCP_SERVER_TRANSPORT=sse
      - CLICKHOUSE_MCP_BIND_HOST=0.0.0.0
```

Если вы хотите работать с собственными данными, используйте
[хост, имя пользователя и пароль](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app)
вашего сервиса ClickHouse Cloud.

<Link to='https://cloud.clickhouse.com/'>
  <CardHorizontal
    badgeIcon='cloud'
    badgeIconDir=''
    badgeState='default'
    badgeText=''
    description="
Если у вас еще нет учетной записи Cloud, начните работу с ClickHouse Cloud сегодня и
получите $300 в виде кредитов. По окончании 30-дневного бесплатного пробного периода продолжите работу с 
тарифом с оплатой по факту использования или свяжитесь с нами, чтобы узнать больше о наших скидках на объем.
Подробности на странице с ценами.
"
    icon='cloud'
    infoText=''
    infoUrl=''
    title='Начало работы с ClickHouse Cloud'
    isSelected={true}
  />
</Link>


## Настройка MCP-сервера в librechat.yaml {#configure-mcp-server-in-librechat-yaml}

Откройте `librechat.yaml` и добавьте следующую конфигурацию в конец файла:

```yml
mcpServers:
  clickhouse-playground:
    type: sse
    url: http://host.docker.internal:8001/sse
```

Эта конфигурация позволяет LibreChat подключаться к MCP-серверу, запущенному в Docker.

Найдите следующую строку:

```text title="librechat.yaml"
socialLogins: ['github', 'google', 'discord', 'openid', 'facebook', 'apple', 'saml']
```

Для упрощения временно отключим аутентификацию:

```text title="librechat.yaml"
socialLogins: []
```


## Добавление локальной LLM с использованием Ollama (опционально) {#add-local-llm-using-ollama}

### Установка Ollama {#install-ollama}

Перейдите на [сайт Ollama](https://ollama.com/download) и установите Ollama для вашей системы.

После установки вы можете запустить модель следующим образом:

```bash
ollama run qwen3:32b
```

Эта команда загрузит модель на локальный компьютер, если она ещё не установлена.

Список моделей доступен в [библиотеке Ollama](https://ollama.com/library)

### Настройка Ollama в librechat.yaml {#configure-ollama-in-librechat-yaml}

После загрузки модели настройте её в файле `librechat.yaml`:

```text title="librechat.yaml"
custom:
  - name: "Ollama"
    apiKey: "ollama"
    baseURL: "http://host.docker.internal:11434/v1/"
    models:
      default:
        [
          "qwen3:32b"
        ]
      fetch: false
    titleConvo: true
    titleModel: "current_model"
    summarize: false
    summaryModel: "current_model"
    forcePrompt: false
    modelDisplayLabel: "Ollama"
```


## Запуск всех сервисов {#start-all-services}

Из корневой директории проекта LibreChat выполните следующую команду для запуска сервисов:

```bash
docker compose up
```

Дождитесь полного запуска всех сервисов.


## Откройте LibreChat в браузере {#open-librechat-in-browser}

Когда все сервисы запущены и работают, откройте браузер и перейдите по адресу `http://localhost:3080/`

Создайте бесплатную учетную запись LibreChat, если у вас ее еще нет, и войдите в систему. Вы должны
увидеть интерфейс LibreChat, подключенный к серверу ClickHouse MCP и, опционально,
к вашей локальной LLM.

В интерфейсе чата выберите `clickhouse-playground` в качестве MCP-сервера:

<Image img={LibreInterface} alt='Выберите MCP-сервер' size='md' />

Теперь вы можете отправить запрос LLM для исследования примеров наборов данных ClickHouse. Попробуйте:

```text title="Запрос"
К каким наборам данных у вас есть доступ?
```

</VerticalStepper>

---
slug: /use-cases/AI/MCP/librechat
sidebar_label: 'Интеграция LibreChat'
title: 'Настройка сервера ClickHouse MCP для LibreChat и ClickHouse Cloud'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве показано, как настроить LibreChat с сервером ClickHouse MCP, используя Docker.'
keywords: ['AI', 'Librechat', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import LibreInterface from '@site/static/images/use-cases/AI_ML/MCP/librechat.png';


# Использование MCP-сервера ClickHouse с LibreChat

> В данном руководстве описывается настройка LibreChat с MCP-сервером ClickHouse с использованием Docker
> и подключение к примерам наборов данных ClickHouse.

<VerticalStepper headerLevel="h2">


## Установите Docker {#install-docker}

Вам потребуется Docker для запуска LibreChat и MCP-сервера. Чтобы установить Docker:
1. Перейдите на [docker.com](https://www.docker.com/products/docker-desktop)
2. Скачайте Docker Desktop для вашей операционной системы
3. Установите Docker, следуя инструкциям для вашей операционной системы
4. Откройте Docker Desktop и убедитесь, что он запущен
<br/>
Для получения дополнительной информации см. [документацию по Docker](https://docs.docker.com/get-docker/).



## Клонируйте репозиторий LibreChat

Откройте консоль (Command Prompt, терминал или PowerShell) и клонируйте
репозиторий LibreChat с помощью следующей команды:

```bash
git clone https://github.com/danny-avila/LibreChat.git
cd LibreChat
```


## Создайте и отредактируйте файл .env

Скопируйте пример конфигурационного файла из `.env.example` в `.env`:

```bash
cp .env.example .env
```

Откройте файл `.env` в вашем любимом текстовом редакторе. Вы увидите разделы для
многих популярных провайдеров LLM, включая OpenAI, Anthropic, AWS Bedrock и др.,
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

Замените `user_provided` на ваш API-ключ для используемого провайдера LLM.

:::note Использование локальной LLM
Если у вас нет API-ключа, вы можете использовать локальную LLM, например Ollama. Вы увидите,
как это сделать позже на шаге [&quot;Install Ollama&quot;](#add-local-llm-using-ollama). Пока
не изменяйте файл .env и переходите к следующим шагам.
:::


## Создайте файл librechat.yaml

Выполните следующую команду, чтобы создать новый файл `librechat.yaml`:

```bash
cp librechat.example.yaml librechat.yaml
```

Это создаёт основной [конфигурационный файл](https://www.librechat.ai/docs/configuration/librechat_yaml) для LibreChat.


## Добавление сервера ClickHouse MCP в Docker Compose

Теперь мы добавим сервер ClickHouse MCP в файл Docker Compose LibreChat,
чтобы LLM мог взаимодействовать с
[ClickHouse SQL Playground](https://sql.clickhouse.com/).

Создайте файл с именем `docker-compose.override.yml` и добавьте в него следующую конфигурацию:

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

Если вы хотите исследовать собственные данные, вы можете сделать это,
используя [host, username и password](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app)
вашего сервиса ClickHouse Cloud.

<Link to="https://cloud.clickhouse.com/">
  <CardHorizontal
    badgeIcon="cloud"
    badgeIconDir=""
    badgeState="default"
    badgeText=""
    description="
Если у вас еще нет аккаунта в ClickHouse Cloud, начните работу уже сегодня и
получите $300 в виде бонусных кредитов. По окончании 30-дневного бесплатного пробного периода вы можете продолжить использовать
тариф с оплатой по мере использования или связаться с нами, чтобы узнать больше о наших скидках при больших объемах.
Подробности смотрите на нашей странице с тарифами.
"
    icon="cloud"
    infoText=""
    infoUrl=""
    title="Начните работу с ClickHouse Cloud"
    isSelected={true}
  />
</Link>


## Настройка сервера MCP в librechat.yaml

Откройте `librechat.yaml` и разместите следующую конфигурацию в конце файла:

```yml
mcpServers:
  clickhouse-playground:
    type: sse
    url: http://host.docker.internal:8001/sse
```

Эта конфигурация настраивает LibreChat для подключения к MCP-серверу, запущенному в Docker-контейнере.

Найдите следующую строку:

```text title="librechat.yaml"
socialLogins: ['github', 'google', 'discord', 'openid', 'facebook', 'apple', 'saml']
```

Чтобы упростить задачу, мы временно отключим аутентификацию:

```text title="librechat.yaml"
socialLogins: []
```


## Добавление локальной LLM‑модели с помощью Ollama (необязательно)

### Установка Ollama

Перейдите на [сайт Ollama](https://ollama.com/download) и установите Ollama для своей системы.

После установки вы можете запустить модель следующим образом:

```bash
ollama run qwen3:32b
```

Это загрузит модель на ваш локальный компьютер, если она ещё не загружена.

Список моделей смотрите в [библиотеке Ollama](https://ollama.com/library)

### Настройка Ollama в librechat.yaml

После загрузки модели настройте её в `librechat.yaml`:

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


## Запустите все сервисы

Из корневого каталога проекта LibreChat выполните следующую команду, чтобы запустить сервисы:

```bash
docker compose up
```

Дождитесь, пока все сервисы будут полностью запущены.


## Откройте LibreChat в браузере {#open-librechat-in-browser}

После запуска всех сервисов откройте браузер и перейдите по адресу `http://localhost:3080/`

Создайте бесплатную учетную запись LibreChat, если у вас ее еще нет, и войдите в систему. Теперь вы должны
увидеть интерфейс LibreChat, подключенный к серверу ClickHouse MCP и, при необходимости,
к вашей локальной LLM.

В интерфейсе чата выберите `clickhouse-playground` в качестве MCP-сервера:

<Image img={LibreInterface} alt='Выберите MCP-сервер' size='md' />

Теперь вы можете отправить запрос LLM для исследования примеров наборов данных ClickHouse. Попробуйте:

```text title="Запрос"
К каким наборам данных у вас есть доступ?
```

</VerticalStepper>

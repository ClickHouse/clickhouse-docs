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

# Использование MCP-сервера ClickHouse с LibreChat \{#using-clickhouse-mcp-server-with-librechat\}

> В этом руководстве объясняется, как настроить LibreChat с MCP-сервером ClickHouse с использованием Docker
> и подключить его к примерным наборам данных ClickHouse.

<VerticalStepper headerLevel="h2">
  ## Установка Docker \{#install-docker\}

  Для запуска LibreChat и сервера MCP потребуется Docker. Чтобы установить Docker:

  1. Перейдите на [docker.com](https://www.docker.com/products/docker-desktop)
  2. Скачайте Docker Desktop для своей операционной системы
  3. Установите Docker в соответствии с инструкциями для вашей операционной системы
  4. Откройте Docker Desktop и убедитесь, что он запущен.

  <br />

  Для получения дополнительной информации см. [документацию Docker](https://docs.docker.com/get-docker/).

  ## Клонируйте репозиторий LibreChat \{#clone-librechat-repo\}

  Откройте терминал (командную строку или PowerShell) и клонируйте
  репозиторий LibreChat с помощью следующей команды:

  ```bash
  git clone https://github.com/danny-avila/LibreChat.git
  cd LibreChat
  ```

  ## Создайте и отредактируйте файл .env \{#create-and-edit-env-file\}

  Скопируйте файл примера конфигурации из `.env.example` в `.env`:

  ```bash
  cp .env.example .env
  ```

  Откройте файл `.env` в вашем текстовом редакторе. Вы увидите разделы для
  многих популярных провайдеров LLM, включая OpenAI, Anthropic, AWS Bedrock и другие,
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

  Замените `user_provided` на ваш API-ключ провайдера LLM, который вы хотите использовать.

  :::note Использование локальной LLM
  Если у вас нет API-ключа, вы можете использовать локальную LLM, например Ollama. Как
  это сделать, описано далее в шаге [&quot;Установка Ollama&quot;](#add-local-llm-using-ollama). Пока
  не изменяйте файл .env и продолжайте выполнение следующих шагов.
  :::

  ## Создайте файл librechat.yaml \{#create-librechat-yaml-file\}

  Выполните следующую команду для создания нового файла `librechat.yaml`:

  ```bash
  cp librechat.example.yaml librechat.yaml
  ```

  Это создаёт основной [файл конфигурации](https://www.librechat.ai/docs/configuration/librechat_yaml) для LibreChat.

  ## Добавление сервера ClickHouse MCP в Docker Compose \{#add-clickhouse-mcp-server-to-docker-compose\}

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

  ## Настройка сервера MCP в librechat.yaml \{#configure-mcp-server-in-librechat-yaml\}

  Откройте `librechat.yaml` и добавьте следующую конфигурацию в конец файла:

  ```yml
  mcpServers:
    clickhouse-playground:
      type: sse
      url: http://host.docker.internal:8001/sse
  ```

  Это настраивает LibreChat для подключения к серверу MCP, работающему на Docker.

  Найдите следующую строку:

  ```text title="librechat.yaml"
  socialLogins: ['github', 'google', 'discord', 'openid', 'facebook', 'apple', 'saml']
  ```

  Для упрощения мы временно отключим необходимость аутентификации:

  ```text title="librechat.yaml"
  socialLogins: []
  ```

  ## Добавление локальной LLM с помощью Ollama (опционально) \{#add-local-llm-using-ollama\}

  ### Установите Ollama \{#install-ollama\}

  Перейдите на [сайт Ollama](https://ollama.com/download) и установите Ollama для вашей системы.

  После установки можно запустить модель следующим образом:

  ```bash
  ollama run qwen3:32b
  ```

  Это загрузит модель на локальную машину, если она отсутствует.

  Список моделей см. в [библиотеке Ollama](https://ollama.com/library)

  ### Настройка Ollama в librechat.yaml \{#configure-ollama-in-librechat-yaml\}

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

  ## Запуск всех сервисов \{#start-all-services\}

  Из корневой директории проекта LibreChat выполните следующую команду для запуска сервисов:

  ```bash
  docker compose up
  ```

  Дождитесь полного запуска всех сервисов.

  ## Откройте LibreChat в браузере \{#open-librechat-in-browser\}

  После того как все сервисы запущены и работают, откройте браузер и перейдите по адресу `http://localhost:3080/`

  Создайте бесплатный аккаунт LibreChat, если у вас его еще нет, и войдите в систему. Теперь вы должны
  увидеть интерфейс LibreChat, подключенный к серверу ClickHouse MCP и, при необходимости,
  к вашей локальной LLM.

  В интерфейсе чата выберите `clickhouse-playground` в качестве MCP-сервера:

  <Image img={LibreInterface} alt="Выберите сервер MCP" size="md" />

  Теперь вы можете предложить LLM исследовать примеры наборов данных ClickHouse. Попробуйте:

  ```text title="Prompt"
  What datasets do you have access to?
  ```
</VerticalStepper>

:::note
Если параметр MCP server не отображается в интерфейсе LibreChat,
убедитесь, что в файле `librechat.yaml` заданы корректные права доступа.
:::

Если для `use` в разделе `mcpServers` внутри `interface` установлено значение `false`, выпадающий список выбора MCP не будет отображаться в чате:

```yml title="librechat.yaml"
interface:
  mcpServers:
    use: true
    share: false
    create: false
    public: false
```

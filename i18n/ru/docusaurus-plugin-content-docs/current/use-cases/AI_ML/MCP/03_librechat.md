---
'slug': '/use-cases/AI/MCP/librechat'
'sidebar_label': 'Интеграция LibreChat'
'title': 'Настройка сервера ClickHouse MCP с LibreChat и ClickHouse Cloud'
'pagination_prev': null
'pagination_next': null
'description': 'В этом руководстве объясняется, как настроить LibreChat с сервером
  ClickHouse MCP с использованием Docker.'
'keywords':
- 'AI'
- 'Librechat'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import LibreInterface from '@site/static/images/use-cases/AI_ML/MCP/librechat.png';


# Использование сервера ClickHouse MCP с LibreChat

> Этот гид объясняет, как установить LibreChat с сервером ClickHouse MCP, используя Docker, и подключить его к примерам наборов данных ClickHouse.

<VerticalStepper headerLevel="h2">

## Установка docker {#install-docker}

Вам потребуется Docker для запуска LibreChat и сервера MCP. Чтобы получить Docker:
1. Посетите [docker.com](https://www.docker.com/products/docker-desktop)
2. Скачайте Docker desktop для вашей операционной системы
3. Установите Docker, следуя инструкциям для вашей операционной системы
4. Откройте Docker Desktop и убедитесь, что он запущен
<br/>
Для получения дополнительной информации смотрите [документацию Docker](https://docs.docker.com/get-docker/).

## Клонирование репозитория LibreChat {#clone-librechat-repo}

Откройте терминал (командную строку, терминал или PowerShell) и выполните команду для клонирования репозитория 
LibreChat:

```bash
git clone https://github.com/danny-avila/LibreChat.git
cd LibreChat
```

## Создание и редактирование файла .env {#create-and-edit-env-file}

Скопируйте файл конфигурации-примера из `.env.example` в `.env`:

```bash
cp .env.example .env
```

Откройте файл `.env` в вашем любимом текстовом редакторе. Вы увидите секции для 
многих популярных провайдеров LLM, включая OpenAI, Anthropic, AWS bedrock и т.д., например:

```text title=".venv"
#============#

# Anthropic  #
#============#
#highlight-next-line
ANTHROPIC_API_KEY=user_provided

# ANTHROPIC_MODELS=claude-opus-4-20250514,claude-sonnet-4-20250514,claude-3-7-sonnet-20250219,claude-3-5-sonnet-20241022,claude-3-5-haiku-20241022,claude-3-opus-20240229,claude-3-sonnet-20240229,claude-3-haiku-20240307

# ANTHROPIC_REVERSE_PROXY=
```

Замените `user_provided` на ваш API-ключ для выбранного провайдера LLM.

:::note Использование локального LLM
Если у вас нет API-ключа, вы можете использовать локальный LLM, такой как Ollama. Вы увидите, как 
это сделать позже в шаге ["Установить Ollama"](#add-local-llm-using-ollama). Пока что
не изменяйте файл .env и продолжайте с следующими шагами.
:::

## Создание файла librechat.yaml {#create-librechat-yaml-file}

Выполните следующую команду, чтобы создать новый файл `librechat.yaml`:

```bash
cp librechat.example.yaml librechat.yaml
```

Это создаст основной [файл конфигурации](https://www.librechat.ai/docs/configuration/librechat_yaml) для LibreChat.

## Добавление сервера ClickHouse MCP в Docker compose {#add-clickhouse-mcp-server-to-docker-compose}

Далее мы добавим сервер ClickHouse MCP в файл Docker compose LibreChat, чтобы LLM могла взаимодействовать с 
[игровой площадкой SQL ClickHouse](https://sql.clickhouse.com/).

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

Если вы хотите исследовать свои собственные данные, вы можете сделать это, используя 
[хост, имя пользователя и пароль](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app) 
вашей службы ClickHouse Cloud.

<Link to="https://cloud.clickhouse.com/">
<CardHorizontal
badgeIcon="cloud"
badgeIconDir=""
badgeState="default"
badgeText=""
description="
Если у вас еще нет облачной учетной записи, начните работу с ClickHouse Cloud сегодня и
получите 300 долларов в кредитах. В конце вашего 30-дневного бесплатного периода следуйте плану 
оплаты по факту, или свяжитесь с нами, чтобы узнать больше о наших объемных скидках.
Посетите нашу страницу с тарифами для получения всех подробностей.
"
icon="cloud"
infoText=""
infoUrl=""
title="Начните работу с ClickHouse Cloud"
isSelected={true}
/>
</Link>

## Настройка сервера MCP в librechat.yaml {#configure-mcp-server-in-librechat-yaml}

Откройте `librechat.yaml` и добавьте следующую конфигурацию в конце файла:

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

Для простоты мы временно удалим необходимость аутентификации:

```text title="librechat.yaml"
socialLogins: []
```

## Добавление локального LLM с помощью Ollama (по желанию) {#add-local-llm-using-ollama}

### Установка Ollama {#install-ollama}

Перейдите на [сайт Ollama](https://ollama.com/download) и установите Ollama для вашей системы.

После установки вы можете запустить модель следующим образом:

```bash
ollama run qwen3:32b
```

Это загрузит модель на ваш локальный компьютер, если она еще не присутствует.

Для получения списка моделей смотрите [библиотеку Ollama](https://ollama.com/library)

### Настройка Ollama в librechat.yaml {#configure-ollama-in-librechat-yaml}

После завершения загрузки модели настройте ее в `librechat.yaml`:

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

Из корневой папки проекта LibreChat выполните следующую команду для запуска сервисов:

```bash
docker compose up
```

Подождите, пока все сервисы полностью запустятся.

## Открытие LibreChat в вашем браузере {#open-librechat-in-browser}

Как только все сервисы будут запущены, откройте ваш браузер и перейдите по адресу `http://localhost:3080/`

Создайте бесплатную учетную запись LibreChat, если у вас ее еще нет, и войдите в систему. Теперь вы должны 
увидеть интерфейс LibreChat, подключенный к серверу ClickHouse MCP, и, при желании,
вашему локальному LLM.

В интерфейсе чата выберите `clickhouse-playground` в качестве вашего сервера MCP:

<Image img={LibreInterface} alt="Выберите ваш MCP сервер" size="md"/>

Теперь вы можете задавать вопросы LLM, чтобы исследовать примеры наборов данных ClickHouse. Попробуйте:

```text title="Prompt"
What datasets do you have access to?
```

</VerticalStepper>

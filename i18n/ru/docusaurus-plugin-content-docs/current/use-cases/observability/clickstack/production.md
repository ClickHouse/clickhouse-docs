---
slug: /use-cases/observability/clickstack/production
title: 'Переход к промышленной эксплуатации'
sidebar_label: 'Промышленная эксплуатация'
pagination_prev: null
pagination_next: null
description: 'Переход к промышленной эксплуатации с ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'production', 'deployment', 'best practices', 'operations']
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';

При развертывании ClickStack в рабочей (production) среде необходимо учитывать ряд дополнительных факторов, чтобы обеспечить безопасность, стабильность и правильную конфигурацию.

## Безопасность сети и портов {#network-security}

По умолчанию Docker Compose пробрасывает порты на хост, делая их доступными извне контейнеров — даже если включены такие инструменты, как `ufw` (Uncomplicated Firewall). Такое поведение связано с сетевой подсистемой Docker, которая может обходить правила файрвола на уровне хоста, если явно не настроена иначе.

**Рекомендация:**

Открывайте только те порты, которые необходимы для работы в продакшене. Как правило, это OTLP-эндпоинты, API-сервер и фронтенд.

Например, удалите или закомментируйте лишние сопоставления портов в вашем файле `docker-compose.yml`:

```yaml
ports:
  - "4317:4317"  # OTLP gRPC
  - "4318:4318"  # OTLP HTTP
  - "8080:8080"  # Только при необходимости для API
# Не открывайте внутренние порты, такие как ClickHouse 8123 или MongoDB 27017. {#avoid-exposing-internal-ports-like-clickhouse-8123-or-mongodb-27017}
```

Обратитесь к [документации по сетевому взаимодействию Docker](https://docs.docker.com/network/), чтобы узнать подробности об изоляции контейнеров и повышении безопасности доступа.

## Настройка секрета сессии {#session-secret}

В продуктивной среде необходимо задать надёжное случайное значение для переменной окружения `EXPRESS_SESSION_SECRET`, чтобы защитить данные сессий и предотвратить их подделку.

Вот как добавить её в файл `docker-compose.yml` для сервиса приложения:

```yaml
  app:
    image: ${IMAGE_NAME_HDX}:${IMAGE_VERSION}
    ports:
      - ${HYPERDX_API_PORT}:${HYPERDX_API_PORT}
      - ${HYPERDX_APP_PORT}:${HYPERDX_APP_PORT}
    environment:
      FRONTEND_URL: ${HYPERDX_APP_URL}:${HYPERDX_APP_PORT}
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_API_PORT: ${HYPERDX_API_PORT}
      HYPERDX_APP_PORT: ${HYPERDX_APP_PORT}
      HYPERDX_APP_URL: ${HYPERDX_APP_URL}
      HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
      MINER_API_URL: 'http://miner:5123'
      MONGO_URI: 'mongodb://db:27017/hyperdx'
      NEXT_PUBLIC_SERVER_URL: http://127.0.0.1:${HYPERDX_API_PORT}
      OTEL_SERVICE_NAME: 'hdx-oss-api'
      USAGE_STATS_ENABLED: ${USAGE_STATS_ENABLED:-true}
      EXPRESS_SESSION_SECRET: "super-secure-random-string"
    networks:
      - internal
    depends_on:
      - ch-server
      - db1
```

Вы можете сгенерировать надёжный секретный ключ с помощью `openssl`:

```shell
openssl rand -hex 32
```

Не добавляйте секреты в систему контроля версий. В продуктивной среде рекомендуется использовать инструменты управления переменными окружения (например, Docker Secrets, HashiCorp Vault или конфигурации CI/CD, зависящие от окружения).


## Безопасная ингестия {#secure-ingestion}

Вся ингестия должна выполняться через OTLP‑порты, которые предоставляет дистрибутив ClickStack с коллектором OpenTelemetry (OTel). По умолчанию для этого требуется защищённый ключ API для приёма данных, который генерируется при запуске. Этот ключ необходим при отправке данных на порты OTel и его можно найти в интерфейсе HyperDX в разделе `Team Settings → API Keys`.

<Image img={ingestion_key} alt="Ключи для ингестии" size="lg"/>

Кроме того, рекомендуется включить TLS для OTLP‑эндпоинтов и создать [выделенного пользователя для ингестии в ClickHouse](#database-ingestion-user).

## ClickHouse {#clickhouse}

Для производственных развертываний мы рекомендуем использовать [ClickHouse Cloud](https://clickhouse.com/cloud), который по умолчанию применяет отраслевые [меры безопасности](/cloud/security), включая усиленное шифрование, аутентификацию и сетевое подключение, а также управляемое разграничение доступа. См. раздел ["ClickHouse Cloud"](#clickhouse-cloud-production) для пошагового руководства по использованию ClickHouse Cloud в соответствии с лучшими практиками.

### Права пользователя {#user-permissions}

#### Пользователь HyperDX {#hyperdx-user}

Для HyperDX в ClickHouse достаточно пользователя с правами `readonly`, который имеет возможность изменять следующие настройки:

- `max_rows_to_read` (не менее 1 миллиона)
- `read_overflow_mode`
- `cancel_http_readonly_queries_on_client_close`
- `wait_end_of_query`

По умолчанию пользователь `default` как в OSS, так и в ClickHouse Cloud обладает этими правами, но мы рекомендуем создать отдельного пользователя с такими правами.

#### Пользователь для базы данных и ингестии {#database-ingestion-user}

Мы рекомендуем создать отдельного пользователя, которого OTel collector будет использовать для ингестии в ClickHouse, и убедиться, что данные отправляются в конкретную базу данных, например `otel`. Подробности см. в разделе ["Создание пользователя для ингестии"](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user).

### Самостоятельное управление безопасностью {#self-managed-security}

Если вы управляете собственным экземпляром ClickHouse, важно включить **TLS**, обеспечить обязательную аутентификацию и следовать передовым практикам по укреплению защиты доступа. См. [эту запись в блоге](https://www.wiz.io/blog/clickhouse-and-wiz) о типичных ошибках конфигурации в реальных системах и способах их избежать.

ClickHouse OSS предоставляет мощные средства безопасности «из коробки». Однако они требуют настройки:

- **Используйте TLS** через `tcp_port_secure` и `<openSSL>` в `config.xml`. См. [guides/sre/configuring-tls](/guides/sre/tls/configuring-tls).
- **Задайте надёжный пароль** для пользователя `default` или отключите его.
- **Избегайте внешней публикации ClickHouse**, если это не требуется явно. По умолчанию ClickHouse привязывается только к `localhost`, пока не изменён `listen_host`.
- **Используйте методы аутентификации**, такие как пароли, сертификаты, SSH-ключи или [external authenticators](/operations/external-authenticators).
- **Ограничивайте доступ** с помощью фильтрации по IP и предложения `HOST`. См. [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host).
- **Включите управление доступом на основе ролей (RBAC)** для выдачи тонко настраиваемых привилегий. См. [operations/access-rights](/operations/access-rights).
- **Применяйте квоты и лимиты** с помощью [quotas](/operations/quotas), [settings profiles](/operations/settings/settings-profiles) и режимов только для чтения.
- **Шифруйте данные на диске** и используйте защищённое внешнее хранилище. См. [operations/storing-data](/operations/storing-data) и [cloud/security/CMEK](/cloud/security/cmek).
- **Не жёстко прописывайте учётные данные.** Используйте [named collections](/operations/named-collections) или IAM-роли в ClickHouse Cloud.
- **Аудируйте доступ и запросы** с помощью [system logs](/operations/system-tables/query_log) и [session logs](/operations/system-tables/session_log).

См. также [external authenticators](/operations/external-authenticators) и [query complexity settings](/operations/settings/query-complexity) для управления пользователями и обеспечения ограничений на запросы и использование ресурсов.

### Настройка Time To Live (TTL) {#configure-ttl}

Убедитесь, что параметр [Time To Live (TTL)](/use-cases/observability/clickstack/ttl) [правильно настроен](/use-cases/observability/clickstack/ttl#modifying-ttl) для вашего развертывания ClickStack. Он определяет срок хранения данных: значение по умолчанию — 3 дня, и его часто требуется изменить.

## Рекомендации по MongoDB {#mongodb-guidelines}

Следуйте официальному [контрольному списку мер безопасности MongoDB](https://www.mongodb.com/docs/manual/administration/security-checklist/).

## ClickHouse Cloud {#clickhouse-cloud-production}

Ниже представлен простой вариант развертывания ClickStack с использованием ClickHouse Cloud, соответствующий лучшим практикам.

<VerticalStepper headerLevel="h3">

### Создайте сервис {#create-a-service}

Следуйте [руководству по началу работы с ClickHouse Cloud](/getting-started/quick-start/cloud/#1-create-a-clickhouse-service), чтобы создать сервис.

### Скопируйте данные для подключения {#copy-connection-details}

Чтобы найти параметры подключения для HyperDX, перейдите в консоль ClickHouse Cloud и нажмите кнопку <b>Connect</b> на боковой панели, после чего зафиксируйте параметры HTTP-подключения, в частности URL.

**Хотя вы можете использовать имя пользователя и пароль по умолчанию, показанные на этом шаге, для подключения HyperDX, мы рекомендуем создать отдельного пользователя — см. ниже**

<Image img={connect_cloud} alt="Подключение к Cloud" size="md" background/>

### Создайте пользователя HyperDX {#create-a-user}

Мы рекомендуем создать отдельного пользователя для HyperDX. Выполните следующие SQL-команды в [SQL-консоли Cloud](/cloud/get-started/sql-console), указав надёжный пароль, соответствующий требованиям к сложности:

```sql
CREATE USER hyperdx IDENTIFIED WITH sha256_password BY '<YOUR_PASSWORD>' SETTINGS PROFILE 'readonly';
GRANT sql_console_read_only TO hyperdx;
```

### Подготовьте пользователя для ингестии {#prepare-for-ingestion}

Создайте базу данных `otel` для данных и пользователя `hyperdx_ingest` для ингестии с ограниченными правами.

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

### Разверните ClickStack {#deploy-clickstack}

Разверните ClickStack — предпочтительны модели развертывания [Helm](/use-cases/observability/clickstack/deployment/helm) или [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) (модифицированный для исключения ClickHouse). 

:::note Развёртывание компонентов по отдельности
Опытные пользователи могут развернуть [OTel collector](/use-cases/observability/clickstack/ingesting-data/opentelemetry#standalone) и [HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only) отдельно, используя их автономные режимы развертывания.
:::

Инструкции по использованию ClickHouse Cloud с Helm-чартом можно найти [здесь](/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud). Эквивалентные инструкции для Docker Compose можно найти [здесь](/use-cases/observability/clickstack/deployment/docker-compose).

### Перейдите в интерфейс HyperDX {#navigate-to-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы получить доступ к интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующие требованиям. 

<Image img={hyperdx_login} alt="Интерфейс HyperDX" size="lg"/>

После нажатия `Create` вам будет предложено ввести параметры подключения.

### Подключитесь к ClickHouse Cloud {#connect-to-clickhouse-cloud}

Используя ранее созданные учётные данные, заполните параметры подключения и нажмите `Create`.

<Image img={hyperdx_cloud} alt="HyperDX Cloud" size="md"/>

### Отправьте данные в ClickStack {#send-data}

Чтобы отправить данные в ClickStack, см. раздел ["Sending OpenTelemetry data"](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data).

</VerticalStepper>
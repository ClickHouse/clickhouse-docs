---
slug: /use-cases/observability/clickstack/production
title: 'Вывод в продакшн'
sidebar_label: 'Продакшн'
pagination_prev: null
pagination_next: null
description: 'Вывод в продакшн с ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'продакшн', 'развертывание', 'лучшие практики', 'эксплуатация']
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';

При развертывании ClickStack в продуктивной среде существует ряд дополнительных аспектов, которые необходимо учесть, чтобы обеспечить безопасность, стабильность и корректную конфигурацию.


## Безопасность сети и портов \{#network-security\}

По умолчанию Docker Compose пробрасывает порты на хост, делая их доступными извне контейнера — даже если включены такие инструменты, как `ufw` (Uncomplicated Firewall). Такое поведение связано с сетевым стеком Docker, который может обходить правила файрвола на уровне хоста, если специально не настроен.

**Рекомендация:**

Открывайте только те порты, которые необходимы в продакшн-среде. Как правило, это конечные точки OTLP, сервер API и frontend.

Например, удалите или закомментируйте лишние сопоставления портов в файле `docker-compose.yml`:

```yaml
ports:
  - "4317:4317"  # OTLP gRPC
  - "4318:4318"  # OTLP HTTP
  - "8080:8080"  # Only if needed for the API
# Avoid exposing internal ports like ClickHouse 8123 or MongoDB 27017.
```

Обратитесь к [документации по сетевому взаимодействию Docker](https://docs.docker.com/network/) для получения подробной информации об изоляции контейнеров и повышении безопасности доступа.


## Настройка секрета сессии \{#session-secret\}

В рабочей среде необходимо задать надёжное, случайное значение для переменной окружения `EXPRESS_SESSION_SECRET`, чтобы защитить данные сессии и предотвратить их подделку.

Ниже показано, как добавить его в файл `docker-compose.yml` для сервиса приложения:

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

Вы можете сгенерировать надёжный секрет с помощью `openssl`:

```shell
openssl rand -hex 32
```

Не размещайте секреты в системе контроля версий. В продуктивной среде рекомендуется использовать инструменты управления переменными окружения (например, Docker Secrets, HashiCorp Vault или конфигурации CI/CD, зависящие от окружения).


## Безопасная ингестия \\{#secure-ingestion\\}

Вся ингестия должна выполняться через OTLP-порты, которые предоставляет дистрибутив ClickStack с коллектором OpenTelemetry (OTel). По умолчанию для этого используется защищённый ключ API для приёма данных, который генерируется при запуске. Этот ключ необходим при отправке данных на порты OTel и доступен в интерфейсе HyperDX в разделе `Team Settings → API Keys`.

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

Дополнительно мы рекомендуем включить TLS для OTLP-эндпоинтов и создать [выделенного пользователя для ингестии в ClickHouse](#database-ingestion-user).

## ClickHouse \\{#clickhouse\\}

Для боевых развертываний мы рекомендуем использовать [ClickHouse Cloud](https://clickhouse.com/cloud), который по умолчанию применяет отраслевые [практики безопасности](/cloud/security) — включая усиленное шифрование, аутентификацию и сетевое взаимодействие, а также управляемое разграничение доступа. См. раздел ["ClickHouse Cloud"](#clickhouse-cloud-production) для подробного пошагового руководства по использованию ClickHouse Cloud в соответствии с лучшими практиками.

### Права доступа пользователя \\{#user-permissions\\}

#### Пользователь HyperDX \\{#hyperdx-user\\}

Пользователю ClickHouse для HyperDX достаточно быть пользователем `readonly` с доступом к изменению следующих настроек:

- `max_rows_to_read` (как минимум до 1&nbsp;миллиона)
- `read_overflow_mode`
- `cancel_http_readonly_queries_on_client_close`
- `wait_end_of_query`

По умолчанию пользователь `default` как в OSS, так и в ClickHouse Cloud обладает этими правами, но мы рекомендуем создать отдельного пользователя с таким набором прав.

#### Пользователь базы данных и ингестии \\{#database-ingestion-user\\}

Рекомендуем создать отдельного пользователя для OTel collector для ингестии данных в ClickHouse и направлять эти данные в определённую базу данных, например `otel`. Подробности см. в разделе ["Создание пользователя для ингестии"](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user).

### Безопасность в самоуправляемой инфраструктуре \\{#self-managed-security\\}

Если вы управляете собственным экземпляром ClickHouse, крайне важно включить **TLS**, настроить аутентификацию и следовать лучшим практикам по усилению контроля доступа. См. [эту запись в блоге](https://www.wiz.io/blog/clickhouse-and-wiz) для контекста по реальным ошибкам настройки и способам их избежать.

ClickHouse OSS предоставляет надежные средства безопасности «из коробки». Однако их необходимо сконфигурировать:

- **Используйте TLS** через `tcp_port_secure` и `<openSSL>` в `config.xml`. См. [guides/sre/configuring-tls](/guides/sre/tls/configuring-tls).
- **Задайте надежный пароль** для пользователя `default` или отключите его.
- **Избегайте внешней публикации ClickHouse**, если это не требуется явно. По умолчанию ClickHouse привязывается только к `localhost`, пока не изменен `listen_host`.
- **Используйте методы аутентификации**, такие как пароли, сертификаты, SSH-ключи или [внешние аутентификаторы](/operations/external-authenticators).
- **Ограничивайте доступ** с помощью фильтрации по IP и предложения `HOST`. См. [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host).
- **Включите управление доступом на основе ролей (RBAC)** для предоставления более тонко настроенных прав доступа. См. [operations/access-rights](/operations/access-rights).
- **Применяйте квоты и лимиты** с помощью [квот](/operations/quotas), [профилей настроек](/operations/settings/settings-profiles) и режимов только для чтения.
- **Шифруйте данные в состоянии покоя (at rest)** и используйте защищенное внешнее хранилище. См. [operations/storing-data](/operations/storing-data) и [cloud/security/CMEK](/cloud/security/cmek).
- **Избегайте жестко прописанных учетных данных.** Используйте [именованные коллекции](/operations/named-collections) или IAM-роли в ClickHouse Cloud.
- **Проводите аудит доступа и запросов** с помощью [системных логов](/operations/system-tables/query_log) и [логов сессий](/operations/system-tables/session_log).

См. также [внешние аутентификаторы](/operations/external-authenticators) и [настройки сложности запросов](/operations/settings/query-complexity) для управления пользователями и обеспечения ограничений на запросы и использование ресурсов.

### Настройте Time To Live (TTL) \\{#configure-ttl\\}

Убедитесь, что для вашего развертывания ClickStack [Time To Live (TTL)](/use-cases/observability/clickstack/ttl) [корректно настроен](/use-cases/observability/clickstack/ttl#modifying-ttl). Этот параметр определяет срок хранения данных — значение по умолчанию 3 дня часто требуется изменить.

## Рекомендации по MongoDB \\{#mongodb-guidelines\\}

Следуйте официальному [контрольному списку по безопасности MongoDB](https://www.mongodb.com/docs/manual/administration/security-checklist/).

## ClickHouse Cloud \\{#clickhouse-cloud-production\\}

Ниже приведён простой вариант развертывания ClickStack с использованием ClickHouse Cloud, соответствующий рекомендациям по лучшим практикам.

<VerticalStepper headerLevel="h3">

### Создайте сервис \\{#create-a-service\\}

Следуйте [руководству по началу работы с ClickHouse Cloud](/getting-started/quick-start/cloud/#1-create-a-clickhouse-service), чтобы создать сервис.

### Скопируйте параметры подключения \\{#copy-connection-details\\}

Чтобы найти параметры подключения для HyperDX, перейдите в консоль ClickHouse Cloud и нажмите кнопку <b>Connect</b> на боковой панели, обратив внимание на параметры HTTP-подключения, в частности URL.

**Хотя вы можете использовать имя пользователя и пароль по умолчанию, показанные на этом шаге для подключения HyperDX, мы рекомендуем создать отдельного пользователя — см. ниже.**

<Image img={connect_cloud} alt="Подключение к ClickHouse Cloud" size="md" background/>

### Создайте пользователя HyperDX \\{#create-a-user\\}

Мы рекомендуем создать отдельного пользователя для HyperDX. Выполните следующие SQL-команды в [консоли Cloud SQL](/cloud/get-started/sql-console), указав надёжный пароль, соответствующий требованиям к сложности:

```sql
CREATE USER hyperdx IDENTIFIED WITH sha256_password BY '<YOUR_PASSWORD>' SETTINGS PROFILE 'readonly';
GRANT sql_console_read_only TO hyperdx;
```

### Подготовьте пользователя для ингестии \\{#prepare-for-ingestion\\}

Создайте базу данных `otel` для данных и пользователя `hyperdx_ingest` для ингестии с ограниченными правами.

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

### Разверните ClickStack \\{#deploy-clickstack\\}

Разверните ClickStack — предпочтительны варианты развертывания с помощью [Helm](/use-cases/observability/clickstack/deployment/helm) или [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) (модифицированного для исключения ClickHouse). 

:::note Раздельное развертывание компонентов
Если у вас достаточно опыта, вы можете развернуть [OTel collector](/use-cases/observability/clickstack/ingesting-data/opentelemetry#standalone) и [HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only) отдельно, используя соответствующие автономные режимы развертывания.
:::

Инструкции по использованию ClickHouse Cloud с Helm-чартом приведены [здесь](/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud). Аналогичные инструкции для Docker Compose приведены [здесь](/use-cases/observability/clickstack/deployment/docker-compose).

### Перейдите в интерфейс HyperDX \\{#navigate-to-hyperdx-ui\\}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы открыть интерфейс HyperDX.

Создайте пользователя, указав имя пользователя и пароль, которые соответствуют требованиям. 

<Image img={hyperdx_login} alt="Интерфейс HyperDX" size="lg"/>

После нажатия `Create` вам будет предложено ввести параметры подключения.

### Подключитесь к ClickHouse Cloud \\{#connect-to-clickhouse-cloud\\}

Используя ранее созданные учётные данные, заполните параметры подключения и нажмите `Create`.

<Image img={hyperdx_cloud} alt="HyperDX Cloud" size="md"/>

### Отправьте данные в ClickStack \\{#send-data\\}

Чтобы отправить данные в ClickStack, см. раздел «[Sending OpenTelemetry data](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data)».

</VerticalStepper>
---
slug: /use-cases/observability/clickstack/production
title: 'Выход в продакшн'
sidebar_label: 'Продакшн'
pagination_prev: null
pagination_next: null
description: 'Выход в продакшн с ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'продакшн', 'развертывание', 'лучшие практики', 'эксплуатация']
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';

При развертывании ClickStack в производственной среде необходимо учитывать ряд дополнительных аспектов, чтобы обеспечить безопасность, стабильность и корректную настройку.


## Безопасность сети и портов {#network-security}

По умолчанию Docker Compose пробрасывает порты на хост, делая их доступными извне контейнера — даже если включены такие инструменты, как `ufw` (Uncomplicated Firewall). Такое поведение связано с сетевым стеком Docker, который может обходить правила файрвола на уровне хоста, если явно не настроен иначе.

**Рекомендация:**

Открывайте только те порты, которые необходимы в продакшене. Как правило, это OTLP-эндпоинты, сервер API и фронтенд.

Например, удалите или закомментируйте ненужный проброс портов в файле `docker-compose.yml`:

```yaml
ports:
  - "4317:4317"  # OTLP gRPC
  - "4318:4318"  # OTLP HTTP
  - "8080:8080"  # Only if needed for the API
# Avoid exposing internal ports like ClickHouse 8123 or MongoDB 27017.
```

Обратитесь к [документации по сетевому взаимодействию в Docker](https://docs.docker.com/network/) для получения подробной информации об изоляции контейнеров и укреплении безопасности доступа.


## Настройка секрета сессии {#session-secret}

В продуктивной среде необходимо задать надёжное случайное значение для переменной окружения `EXPRESS_SESSION_SECRET`, чтобы защитить данные сессии и предотвратить их подделку.

Ниже показано, как добавить её в файл `docker-compose.yml` для сервиса приложения:

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

Не коммитьте секреты в систему контроля версий. В продакшене рассмотрите использование инструментов управления переменными окружения (например, Docker Secrets, HashiCorp Vault или окружения-зависимых CI/CD-конфигураций).


## Безопасная ингестия {#secure-ingestion}

Вся ингестия должна выполняться через OTLP‑порты, которые предоставляет ClickStack‑дистрибутив коллектора OpenTelemetry (OTel). По умолчанию для этого требуется защищённый ключ API для приёма данных (ingestion API key), который генерируется при запуске. Этот ключ необходим при отправке данных на OTel‑порты и доступен в интерфейсе HyperDX в разделе `Team Settings → API Keys`.

<Image img={ingestion_key} alt="Ключи ингестии" size="lg"/>

Дополнительно мы рекомендуем включить TLS для OTLP‑эндпоинтов и создать [выделенного пользователя для ингестии в ClickHouse](#database-ingestion-user).

## ClickHouse {#clickhouse}

Для production-развертываний мы рекомендуем использовать [ClickHouse Cloud](https://clickhouse.com/cloud), который по умолчанию реализует отраслевые [стандарты безопасности](/cloud/security), включая расширенное шифрование, аутентификацию и сетевое подключение, а также управляемое разграничение доступа. См. раздел ["ClickHouse Cloud"](#clickhouse-cloud-production) для пошагового руководства по использованию ClickHouse Cloud в соответствии с передовыми практиками.

### Права пользователя {#user-permissions}

#### Пользователь HyperDX {#hyperdx-user}

Пользователю ClickHouse для HyperDX достаточно быть пользователем `readonly` с доступом к изменению следующих настроек:

- `max_rows_to_read` (не менее 1 миллиона)
- `read_overflow_mode`
- `cancel_http_readonly_queries_on_client_close`
- `wait_end_of_query`

По умолчанию пользователь `default` как в OSS, так и в ClickHouse Cloud имеет эти права доступа, но мы рекомендуем создать отдельного пользователя с этими правами.

#### Пользователь базы данных и ингестии {#database-ingestion-user}

Мы рекомендуем создать отдельного пользователя для OTel collector, выполняющего ингестию в ClickHouse, и убедиться, что данные направляются в отдельную базу данных, например `otel`. Подробности см. в разделе ["Создание пользователя для ингестии"](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user).

### Безопасность в самоуправляемой среде {#self-managed-security}

Если вы управляете собственным экземпляром ClickHouse, важно включить **TLS**, обеспечить аутентификацию и соблюдать передовые практики по усилению защиты доступа. Для примеров реальных ошибок конфигурации и способов их избежать см. [эту запись в блоге](https://www.wiz.io/blog/clickhouse-and-wiz).

ClickHouse OSS «из коробки» предоставляет мощные средства безопасности. Однако они требуют настройки:

- **Используйте TLS** через `tcp_port_secure` и `<openSSL>` в `config.xml`. См. [guides/sre/configuring-tls](/guides/sre/tls/configuring-tls).
- **Задайте надежный пароль** для пользователя `default` или отключите его.
- **Избегайте внешней публикации ClickHouse**, если это не требуется явно. По умолчанию ClickHouse привязывается только к `localhost`, если не изменен параметр `listen_host`.
- **Используйте методы аутентификации**, такие как пароли, сертификаты, SSH-ключи или [внешние аутентификаторы](/operations/external-authenticators).
- **Ограничивайте доступ** с помощью фильтрации по IP-адресам и предложения `HOST`. См. [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host).
- **Включите управление доступом на основе ролей (RBAC)** для предоставления более точных (гранулярных) привилегий. См. [operations/access-rights](/operations/access-rights).
- **Применяйте квоты и лимиты** с помощью [квот](/operations/quotas), [профилей настроек](/operations/settings/settings-profiles) и режимов только для чтения.
- **Шифруйте данные на носителях** и используйте защищенное внешнее хранилище. См. [operations/storing-data](/operations/storing-data) и [cloud/security/CMEK](/cloud/security/cmek).
- **Избегайте жёсткого кодирования учетных данных.** Используйте [именованные коллекции](/operations/named-collections) или роли IAM в ClickHouse Cloud.
- **Аудируйте доступ и запросы** с помощью [системных журналов](/operations/system-tables/query_log) и [журналов сеансов](/operations/system-tables/session_log).

См. также [внешние аутентификаторы](/operations/external-authenticators) и [настройки сложности запросов](/operations/settings/query-complexity) для управления пользователями и обеспечения лимитов на запросы и ресурсы.

### Настройка Time To Live (TTL) {#configure-ttl}

Убедитесь, что для вашего развертывания ClickStack параметр [Time To Live (TTL)](/use-cases/observability/clickstack/ttl) [правильно настроен](/use-cases/observability/clickstack/ttl#modifying-ttl). Этот параметр определяет, как долго будут храниться данные: значение по умолчанию — 3 дня — часто требует изменения.

## Рекомендации по MongoDB {#mongodb-guidelines}

Следуйте рекомендациям из официального [контрольного списка безопасности MongoDB](https://www.mongodb.com/docs/manual/administration/security-checklist/).

## ClickHouse Cloud {#clickhouse-cloud-production}

Ниже приведён простой вариант развертывания ClickStack с использованием ClickHouse Cloud, соответствующий лучшим практикам.

<VerticalStepper headerLevel="h3">

### Создание сервиса {#create-a-service}

Следуйте [руководству по началу работы с ClickHouse Cloud](/getting-started/quick-start/cloud/#1-create-a-clickhouse-service), чтобы создать сервис.

### Копирование параметров подключения {#copy-connection-details}

Чтобы найти параметры подключения для HyperDX, перейдите в консоль ClickHouse Cloud и нажмите кнопку <b>Connect</b> на боковой панели, записав параметры HTTP‑подключения, в частности URL.

**Хотя вы можете использовать показанные на этом шаге имя пользователя и пароль по умолчанию для подключения HyperDX, мы рекомендуем создать отдельного пользователя — см. ниже.**

<Image img={connect_cloud} alt="Подключение к Cloud" size="md" background/>

### Создание пользователя HyperDX {#create-a-user}

Рекомендуем создать отдельного пользователя для HyperDX. Выполните следующие SQL‑команды в [консоли Cloud SQL](/cloud/get-started/sql-console), указав надёжный пароль, соответствующий требованиям к сложности:

```sql
CREATE USER hyperdx IDENTIFIED WITH sha256_password BY '<YOUR_PASSWORD>' SETTINGS PROFILE 'readonly';
GRANT sql_console_read_only TO hyperdx;
```

### Подготовка пользователя для ингестии {#prepare-for-ingestion}

Создайте базу данных `otel` для данных и пользователя `hyperdx_ingest` для ингестии с ограниченными правами.

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

### Развертывание ClickStack {#deploy-clickstack}

Разверните ClickStack — предпочтительны модели развертывания [Helm](/use-cases/observability/clickstack/deployment/helm) или [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) (с модификациями для исключения ClickHouse). 

:::note Раздельное развертывание компонентов
Если вы продвинутый пользователь, вы можете развернуть [OTel collector](/use-cases/observability/clickstack/ingesting-data/opentelemetry#standalone) и [HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only) отдельно, используя их соответствующие автономные режимы развертывания.
:::

Инструкции по использованию ClickHouse Cloud с Helm-чартом можно найти [здесь](/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud). Аналогичные инструкции для Docker Compose можно найти [здесь](/use-cases/observability/clickstack/deployment/docker-compose).

### Переход к интерфейсу HyperDX {#navigate-to-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы открыть интерфейс HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующие требованиям. 

<Image img={hyperdx_login} alt="Интерфейс HyperDX" size="lg"/>

После нажатия `Create` вам будет предложено ввести параметры подключения.

### Подключение к ClickHouse Cloud {#connect-to-clickhouse-cloud}

Используя ранее созданные учётные данные, заполните параметры подключения и нажмите `Create`.

<Image img={hyperdx_cloud} alt="HyperDX Cloud" size="md"/>

### Отправка данных в ClickStack {#send-data}

Чтобы отправлять данные в ClickStack, см. раздел ["Sending OpenTelemetry data"](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data).

</VerticalStepper>
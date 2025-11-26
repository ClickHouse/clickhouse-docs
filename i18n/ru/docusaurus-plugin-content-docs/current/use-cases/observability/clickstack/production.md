---
slug: /use-cases/observability/clickstack/production
title: 'Переход к промышленной эксплуатации'
sidebar_label: 'Промышленная эксплуатация'
pagination_prev: null
pagination_next: null
description: 'Переход к промышленной эксплуатации с ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'продакшн', 'развертывание', 'лучшие практики', 'эксплуатация']
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';

При развертывании ClickStack в продуктивной среде необходимо учесть ряд дополнительных аспектов, чтобы обеспечить безопасность, стабильность и корректную настройку.


## Безопасность сети и портов {#network-security}

По умолчанию Docker Compose прокидывает порты на хост, делая их доступными извне контейнера — даже если включены такие инструменты, как `ufw` (Uncomplicated Firewall). Такое поведение обусловлено сетевым стеком Docker, который может обходить правила брандмауэра на уровне хоста, если явно не настроен иначе.

**Рекомендация:**

Открывайте только те порты, которые необходимы для продакшн-использования. Обычно это OTLP-эндпоинты, API-сервер и фронтенд.

Например, удалите или закомментируйте лишние пробросы портов в файле `docker-compose.yml`:



```yaml
ports:
  - "4317:4317"  # OTLP gRPC
  - "4318:4318"  # OTLP HTTP
  - "8080:8080"  # Только при необходимости для API
# Не открывайте внутренние порты, такие как ClickHouse 8123 или MongoDB 27017.
```

См. [документацию по сетевым возможностям Docker](https://docs.docker.com/network/) для получения подробной информации об изоляции контейнеров и усилении безопасности доступа.


## Настройка секретного ключа сессии

В продакшене необходимо задать надёжное случайное значение для переменной окружения `EXPRESS_SESSION_SECRET`, чтобы защитить данные сессии и предотвратить их подделку.

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

Вы можете сгенерировать надежный секрет с помощью openssl:

```shell
openssl rand -hex 32
```

Не добавляйте секреты в систему контроля версий. В продуктивной среде используйте инструменты управления переменными окружения (например, Docker Secrets, HashiCorp Vault или конфигурации CI/CD для конкретных сред).


## Безопасная ингестия {#secure-ingestion}

Вся ингестия должна выполняться через OTLP-порты, которые предоставляет дистрибутив ClickStack с коллектором OpenTelemetry (OTel). По умолчанию для этого требуется безопасный ключ API для приёма данных, генерируемый при запуске. Этот ключ необходим при отправке данных на порты OTel и его можно найти в интерфейсе HyperDX в разделе `Team Settings → API Keys`.

<Image img={ingestion_key} alt="Ключи для ингестии" size="lg"/>

Кроме того, мы рекомендуем включить TLS для OTLP-эндпоинтов и создать [специального пользователя для ингестии в ClickHouse](#database-ingestion-user).



## ClickHouse {#clickhouse}

Для продукционных развертываний мы рекомендуем использовать [ClickHouse Cloud](https://clickhouse.com/cloud), который по умолчанию применяет отраслевые [практики безопасности](/cloud/security) — включая усиленное шифрование, аутентификацию и параметры подключения, а также управляемый контроль доступа. См. раздел ["ClickHouse Cloud"](#clickhouse-cloud-production) для пошагового руководства по использованию ClickHouse Cloud в соответствии с лучшими практиками.

### Права пользователя {#user-permissions}

#### Пользователь HyperDX {#hyperdx-user}

Пользователю ClickHouse для HyperDX достаточно быть пользователем `readonly` с доступом к изменению следующих настроек:

- `max_rows_to_read` (как минимум до 1 миллиона)
- `read_overflow_mode`
- `cancel_http_readonly_queries_on_client_close`
- `wait_end_of_query`

По умолчанию пользователь `default` как в OSS, так и в ClickHouse Cloud имеет эти права, но мы рекомендуем создать нового пользователя с такими разрешениями.

#### Пользователь для базы данных и ингестии {#database-ingestion-user}

Мы рекомендуем создать отдельного пользователя для OTel collector для ингестии данных в ClickHouse и убедиться, что ингестия отправляется в конкретную базу данных, например `otel`. Подробности см. в разделе ["Creating an ingestion user"](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user).

### Самостоятельное управление безопасностью {#self-managed-security}

Если вы управляете собственным экземпляром ClickHouse, крайне важно включить **SSL/TLS**, обеспечить обязательную аутентификацию и следовать лучшим практикам по ужесточению доступа. См. [эту запись в блоге](https://www.wiz.io/blog/clickhouse-and-wiz) для примеров реальных ошибок конфигурации и способов их избежать.

ClickHouse OSS предоставляет расширенные функции безопасности «из коробки». Однако они требуют настройки:

- **Используйте SSL/TLS** через `tcp_port_secure` и `<openSSL>` в `config.xml`. См. [guides/sre/configuring-ssl](/guides/sre/configuring-ssl).
- **Установите надёжный пароль** для пользователя `default` или отключите его.
- **Избегайте публикации ClickHouse во внешнюю сеть**, если это не требуется явно. По умолчанию ClickHouse привязывается только к `localhost`, если `listen_host` не изменён.
- **Используйте методы аутентификации**, такие как пароли, сертификаты, SSH-ключи или [внешние аутентификаторы](/operations/external-authenticators).
- **Ограничивайте доступ** с помощью фильтрации по IP и предложения `HOST`. См. [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host).
- **Включите ролевую модель контроля доступа (RBAC)** для выдачи детализированных привилегий. См. [operations/access-rights](/operations/access-rights).
- **Применяйте квоты и лимиты** с помощью [quotas](/operations/quotas), [профилей настроек](/operations/settings/settings-profiles) и режимов только для чтения.
- **Шифруйте данные в состоянии покоя** и используйте безопасное внешнее хранилище. См. [operations/storing-data](/operations/storing-data) и [cloud/security/CMEK](/cloud/security/cmek).
- **Избегайте жёсткого кодирования учётных данных.** Используйте [именованные коллекции](/operations/named-collections) или роли IAM в ClickHouse Cloud.
- **Аудируйте доступ и запросы** с помощью [системных логов](/operations/system-tables/query_log) и [журналов сессий](/operations/system-tables/session_log).

Также см. [внешние аутентификаторы](/operations/external-authenticators) и [настройки сложности запросов](/operations/settings/query-complexity) для управления пользователями и обеспечения лимитов на запросы и ресурсы.

### Настройка Time To Live (TTL) {#configure-ttl}

Убедитесь, что для вашего развертывания ClickStack [Time To Live (TTL)](/use-cases/observability/clickstack/ttl) был [корректно настроен](/use-cases/observability/clickstack/ttl#modifying-ttl). Это определяет срок хранения данных — значение по умолчанию в 3 дня часто требует изменения.



## Рекомендации по MongoDB {#mongodb-guidelines}

Следуйте официальному [контрольному списку по безопасности MongoDB](https://www.mongodb.com/docs/manual/administration/security-checklist/).



## ClickHouse Cloud {#clickhouse-cloud-production}

Ниже приведён простой пример развертывания ClickStack с использованием ClickHouse Cloud, который соответствует передовым практикам.

<VerticalStepper headerLevel="h3">

### Создайте сервис {#create-a-service}

Следуйте [руководству по началу работы с ClickHouse Cloud](/getting-started/quick-start/cloud/#1-create-a-clickhouse-service), чтобы создать сервис.

### Скопируйте параметры подключения {#copy-connection-details}

Чтобы найти параметры подключения для HyperDX, перейдите в консоль ClickHouse Cloud и нажмите кнопку <b>Connect</b> на боковой панели, зафиксировав HTTP‑параметры подключения, в частности URL.

**Хотя вы можете использовать имя пользователя и пароль по умолчанию, показанные на этом шаге, для подключения HyperDX, мы рекомендуем создать отдельного пользователя — см. ниже**

<Image img={connect_cloud} alt="Подключение к ClickHouse Cloud" size="md" background/>

### Создайте пользователя HyperDX {#create-a-user}

Мы рекомендуем создать отдельного пользователя для HyperDX. Выполните следующие SQL-команды в [консоли Cloud SQL](/cloud/get-started/sql-console), указав надёжный пароль, удовлетворяющий требованиям по сложности:

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

Разверните ClickStack — предпочтительны модели развертывания [Helm](/use-cases/observability/clickstack/deployment/helm) или [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) (изменённая для исключения ClickHouse). 

:::note Раздельное развертывание компонентов
Продвинутые пользователи могут развернуть [OTel collector](/use-cases/observability/clickstack/ingesting-data/opentelemetry#standalone) и [HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only) отдельно с использованием их автономных режимов развертывания.
:::

Инструкции по использованию ClickHouse Cloud с Helm-чартом можно найти [здесь](/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud). Аналогичные инструкции для Docker Compose можно найти [здесь](/use-cases/observability/clickstack/deployment/docker-compose).

### Перейдите в интерфейс HyperDX {#navigate-to-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы получить доступ к интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, которые удовлетворяют требованиям. 

<Image img={hyperdx_login} alt="Интерфейс HyperDX" size="lg"/>

После нажатия `Create` будет предложено ввести параметры подключения.

### Подключитесь к ClickHouse Cloud {#connect-to-clickhouse-cloud}

Используя ранее созданные учётные данные, заполните параметры подключения и нажмите `Create`.

<Image img={hyperdx_cloud} alt="HyperDX Cloud" size="md"/>

### Отправьте данные в ClickStack {#send-data}

Чтобы отправить данные в ClickStack, см. раздел [«Sending OpenTelemetry data»](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data).

</VerticalStepper>

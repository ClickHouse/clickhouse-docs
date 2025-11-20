---
slug: /use-cases/observability/clickstack/production
title: 'Выход в продакшн'
sidebar_label: 'Продакшн'
pagination_prev: null
pagination_next: null
description: 'Выход в продакшн с ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'production', 'deployment', 'best practices', 'operations']
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';

При развертывании ClickStack в промышленной среде необходимо учесть несколько дополнительных аспектов, чтобы обеспечить безопасность, стабильность и корректную конфигурацию.


## Безопасность сети и портов {#network-security}

По умолчанию Docker Compose открывает порты на хосте, делая их доступными извне контейнера — даже если включены такие инструменты, как `ufw` (Uncomplicated Firewall). Такое поведение обусловлено сетевым стеком Docker, который может обходить правила межсетевого экрана на уровне хоста, если не настроен явным образом.

**Рекомендация:**

Открывайте только те порты, которые необходимы для работы в production-окружении. Обычно это конечные точки OTLP, API-сервер и фронтенд.

Например, удалите или закомментируйте ненужные сопоставления портов в файле `docker-compose.yml`:


```yaml
ports:
  - "4317:4317"  # OTLP gRPC
  - "4318:4318"  # OTLP HTTP
  - "8080:8080"  # Только при необходимости для API
# Избегайте открытия внутренних портов, таких как ClickHouse 8123 или MongoDB 27017.
```

Дополнительные сведения об изоляции контейнеров и усилении защиты доступа см. в [документации по сетевым возможностям Docker](https://docs.docker.com/network/).


## Конфигурация секрета сессии {#session-secret}

В production-окружении необходимо установить надёжное случайное значение для переменной окружения `EXPRESS_SESSION_SECRET`, чтобы защитить данные сессии и предотвратить их подделку.

Вот как добавить её в файл `docker-compose.yml` для сервиса app:

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
    MINER_API_URL: "http://miner:5123"
    MONGO_URI: "mongodb://db:27017/hyperdx"
    NEXT_PUBLIC_SERVER_URL: http://127.0.0.1:${HYPERDX_API_PORT}
    OTEL_SERVICE_NAME: "hdx-oss-api"
    USAGE_STATS_ENABLED: ${USAGE_STATS_ENABLED:-true}
    EXPRESS_SESSION_SECRET: "super-secure-random-string"
  networks:
    - internal
  depends_on:
    - ch-server
    - db1
```

Вы можете сгенерировать надёжный секрет с помощью openssl:

```shell
openssl rand -hex 32
```

Избегайте фиксации секретов в системе контроля версий. В production-окружении рекомендуется использовать инструменты управления переменными окружения (например, Docker Secrets, HashiCorp Vault или конфигурации CI/CD для конкретных окружений).


## Безопасный прием данных {#secure-ingestion}

Весь прием данных должен осуществляться через порты OTLP, предоставляемые дистрибутивом ClickStack коллектора OpenTelemetry (OTel). По умолчанию требуется защищенный API-ключ для приема данных, который генерируется при запуске. Этот ключ необходим при отправке данных на порты OTel и находится в интерфейсе HyperDX в разделе `Team Settings → API Keys`.

<Image img={ingestion_key} alt='Ключи приема данных' size='lg' />

Кроме того, рекомендуется включить TLS для конечных точек OTLP и создать [выделенного пользователя для приема данных в ClickHouse](#database-ingestion-user).


## ClickHouse {#clickhouse}

Для промышленных развертываний мы рекомендуем использовать [ClickHouse Cloud](https://clickhouse.com/cloud), который по умолчанию применяет отраслевые стандарты [практик безопасности](/cloud/security) — включая усиленное шифрование, аутентификацию и подключение, а также управляемый контроль доступа. См. раздел ["ClickHouse Cloud"](#clickhouse-cloud-production) для пошагового руководства по использованию ClickHouse Cloud с соблюдением лучших практик.

### Права пользователей {#user-permissions}

#### Пользователь HyperDX {#hyperdx-user}

Пользователь ClickHouse для HyperDX должен иметь права `readonly` с возможностью изменения следующих настроек:

- `max_rows_to_read` (не менее 1 миллиона)
- `read_overflow_mode`
- `cancel_http_readonly_queries_on_client_close`
- `wait_end_of_query`

По умолчанию пользователь `default` как в OSS, так и в ClickHouse Cloud имеет эти права, но мы рекомендуем создать отдельного пользователя с этими правами.

#### Пользователь базы данных и приема данных {#database-ingestion-user}

Мы рекомендуем создать выделенного пользователя для коллектора OTel для приема данных в ClickHouse и обеспечить отправку данных в конкретную базу данных, например `otel`. См. раздел ["Создание пользователя для приема данных"](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user) для получения дополнительной информации.

### Безопасность при самостоятельном управлении {#self-managed-security}

Если вы управляете собственным экземпляром ClickHouse, необходимо включить **SSL/TLS**, обеспечить аутентификацию и следовать лучшим практикам для усиления защиты доступа. См. [эту статью в блоге](https://www.wiz.io/blog/clickhouse-and-wiz) для понимания реальных ошибок конфигурации и способов их избежать.

ClickHouse OSS предоставляет надежные функции безопасности из коробки. Однако они требуют настройки:

- **Используйте SSL/TLS** через `tcp_port_secure` и `<openSSL>` в `config.xml`. См. [guides/sre/configuring-ssl](/guides/sre/configuring-ssl).
- **Установите надежный пароль** для пользователя `default` или отключите его.
- **Избегайте внешнего доступа к ClickHouse**, если это не предусмотрено явно. По умолчанию ClickHouse привязывается только к `localhost`, если не изменен параметр `listen_host`.
- **Используйте методы аутентификации**, такие как пароли, сертификаты, SSH-ключи или [внешние аутентификаторы](/operations/external-authenticators).
- **Ограничьте доступ** с помощью фильтрации IP и предложения `HOST`. См. [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host).
- **Включите управление доступом на основе ролей (RBAC)** для предоставления детализированных привилегий. См. [operations/access-rights](/operations/access-rights).
- **Применяйте квоты и ограничения** с помощью [квот](/operations/quotas), [профилей настроек](/operations/settings/settings-profiles) и режимов только для чтения.
- **Шифруйте данные в состоянии покоя** и используйте безопасное внешнее хранилище. См. [operations/storing-data](/operations/storing-data) и [cloud/security/CMEK](/cloud/security/cmek).
- **Избегайте жесткого кодирования учетных данных.** Используйте [именованные коллекции](/operations/named-collections) или роли IAM в ClickHouse Cloud.
- **Проводите аудит доступа и запросов** с помощью [системных журналов](/operations/system-tables/query_log) и [журналов сеансов](/operations/system-tables/session_log).

См. также [внешние аутентификаторы](/operations/external-authenticators) и [настройки сложности запросов](/operations/settings/query-complexity) для управления пользователями и обеспечения ограничений запросов и ресурсов.

### Настройка времени жизни (TTL) {#configure-ttl}

Убедитесь, что [время жизни (TTL)](/use-cases/observability/clickstack/ttl) было [правильно настроено](/use-cases/observability/clickstack/ttl#modifying-ttl) для вашего развертывания ClickStack. Это определяет, как долго хранятся данные — значение по умолчанию в 3 дня часто требует изменения.


## Рекомендации по MongoDB {#mongodb-guidelines}

Следуйте официальному [контрольному списку безопасности MongoDB](https://www.mongodb.com/docs/manual/administration/security-checklist/).


## ClickHouse Cloud {#clickhouse-cloud-production}

Ниже представлено простое развертывание ClickStack с использованием ClickHouse Cloud, соответствующее рекомендуемым практикам.

<VerticalStepper headerLevel="h3">

### Создание сервиса {#create-a-service}

Следуйте [руководству по началу работы с ClickHouse Cloud](/getting-started/quick-start/cloud/#1-create-a-clickhouse-service), чтобы создать сервис.

### Копирование параметров подключения {#copy-connection-details}

Чтобы найти параметры подключения для HyperDX, перейдите в консоль ClickHouse Cloud и нажмите кнопку <b>Connect</b> на боковой панели, зафиксировав параметры HTTP-подключения, в частности URL.

**Хотя вы можете использовать имя пользователя и пароль по умолчанию, показанные на этом шаге, для подключения HyperDX, мы рекомендуем создать отдельного пользователя — см. ниже**

<Image img={connect_cloud} alt='Подключение к Cloud' size='md' background />

### Создание пользователя HyperDX {#create-a-user}

Мы рекомендуем создать отдельного пользователя для HyperDX. Выполните следующие SQL-команды в [консоли Cloud SQL](/cloud/get-started/sql-console), указав надежный пароль, соответствующий требованиям сложности:

```sql
CREATE USER hyperdx IDENTIFIED WITH sha256_password BY '<YOUR_PASSWORD>' SETTINGS PROFILE 'readonly';
GRANT sql_console_read_only TO hyperdx;
```

### Подготовка пользователя для приема данных {#prepare-for-ingestion}

Создайте базу данных `otel` для данных и пользователя `hyperdx_ingest` для приема данных с ограниченными правами.

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

### Развертывание ClickStack {#deploy-clickstack}

Разверните ClickStack — предпочтительны модели развертывания [Helm](/use-cases/observability/clickstack/deployment/helm) или [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) (модифицированная для исключения ClickHouse).

:::note Раздельное развертывание компонентов
Опытные пользователи могут развернуть [коллектор OTel](/use-cases/observability/clickstack/ingesting-data/opentelemetry#standalone) и [HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only) раздельно, используя соответствующие автономные режимы развертывания.
:::

Инструкции по использованию ClickHouse Cloud с Helm-чартом можно найти [здесь](/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud). Аналогичные инструкции для Docker Compose можно найти [здесь](/use-cases/observability/clickstack/deployment/docker-compose).

### Переход к интерфейсу HyperDX {#navigate-to-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080) для доступа к интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующие требованиям.

<Image img={hyperdx_login} alt='Интерфейс HyperDX' size='lg' />

После нажатия `Create` вам будет предложено ввести параметры подключения.

### Подключение к ClickHouse Cloud {#connect-to-clickhouse-cloud}

Используя учетные данные, созданные ранее, заполните параметры подключения и нажмите `Create`.

<Image img={hyperdx_cloud} alt='HyperDX Cloud' size='md' />

### Отправка данных в ClickStack {#send-data}

Для отправки данных в ClickStack см. раздел [«Отправка данных OpenTelemetry»](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data).

</VerticalStepper>

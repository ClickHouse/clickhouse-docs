---
'slug': '/use-cases/observability/clickstack/production'
'title': 'В выходе на производство'
'sidebar_label': 'Производство'
'pagination_prev': null
'pagination_next': null
'description': 'Выход на производство с ClickStack'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';

Когда вы разворачиваете ClickStack в продакшене, необходимо учитывать несколько дополнительных факторов для обеспечения безопасности, стабильности и корректной конфигурации.

## Сетевая и портовая безопасность {#network-security}

По умолчанию Docker Compose открывает порты на хосте, что делает их доступными снаружи контейнера - даже если такие инструменты, как `ufw` (Uncomplicated Firewall), включены. Это поведение обусловлено стеком сетей Docker, который может обойти правила фаервола на уровне хоста, если не настроено явно.

**Рекомендация:**

Открывайте только те порты, которые необходимы для использования в продакшене. Обычно это конечные точки OTLP, API сервер и фронтенд.

Например, удалите или закомментируйте ненужные сопоставления портов в вашем `docker-compose.yml` файле:

```yaml
ports:
  - "4317:4317"  # OTLP gRPC
  - "4318:4318"  # OTLP HTTP
  - "8080:8080"  # Only if needed for the API

# Avoid exposing internal ports like ClickHouse 8123 or MongoDB 27017.
```

Обратитесь к [документации по сетевым технологиям Docker](https://docs.docker.com/network/) для получения подробной информации о изоляции контейнеров и укреплении доступа.

## Конфигурация секрета сессии {#session-secret}

В продакшене необходимо установить сильное, случайное значение для переменной окружения `EXPRESS_SESSION_SECRET`, чтобы защитить данные сессии и предотвратить их подделку.

Вот как добавить его в ваш `docker-compose.yml` файл для службы приложения:

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

Избегайте коммитинга секретов в систему контроля версий. В продакшене рекомендуется использовать инструменты управления переменными окружения (например, Docker Secrets, HashiCorp Vault или конфиги CI/CD, специфичные для окружения).

## Безопасный инжект данных {#secure-ingestion}

Все инъекции должны происходить через порты OTLP, открытые дистрибуцией ClickStack коллектора OpenTelemetry (OTel). По умолчанию это требует наличия защищенного ключа API инъекции, генерируемого при старте. Этот ключ необходим при отправке данных на порты OTel и может быть найден в интерфейсе HyperDX в разделе `Настройки команды → API ключи`.

<Image img={ingestion_key} alt="Ключи инъекции" size="lg"/>

Кроме того, мы рекомендуем включить TLS для конечных точек OTLP и создать [посвященного пользователя для инъекции в ClickHouse](#database-ingestion-user).

## ClickHouse {#clickhouse}

Для развертываний в продакшене мы рекомендуем использовать [ClickHouse Cloud](https://clickhouse.com/cloud), который по умолчанию применяет стандарты [безопасности](/cloud/security/shared-responsibility-model), включая [улучшенное шифрование](/cloud/security/cmek), [аутентификацию и подключение](/cloud/security/connectivity) и [управление доступом](/cloud/security/cloud-access-management). Смотрите ["ClickHouse Cloud"](#clickhouse-cloud-production) для пошагового руководства по использованию ClickHouse Cloud с лучшими практиками.

### Разрешения пользователей {#user-permissions}

#### Пользователь HyperDX {#hyperdx-user}

Пользователь ClickHouse для HyperDX должен быть только `readonly` пользователем с доступом для изменения следующих настроек:

- `max_rows_to_read` (минимум до 1 миллиона)
- `read_overflow_mode`
- `cancel_http_readonly_queries_on_client_close`
- `wait_end_of_query`

По умолчанию пользователь `default` как в OSS, так и в ClickHouse Cloud будет иметь эти разрешения, но мы рекомендуем создать нового пользователя с этими разрешениями.

#### Пользователь базы данных и инъекции {#database-ingestion-user}

Мы рекомендуем создать отдельного пользователя для коллектора OTel для инъекции в ClickHouse и обеспечить отправку инъекции в конкретную базу данных, например `otel`. Смотрите ["Создание пользователя для инъекции"](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user) для получения дополнительной информации.

### Самоуправляемая безопасность {#self-managed-security}

Если вы управляете своим экземпляром ClickHouse, крайне важно включить **SSL/TLS**, обеспечить аутентификацию и следовать лучшим практикам по усилению безопасности. Смотрите [этот блог-пост](https://www.wiz.io/blog/clickhouse-and-wiz) для понимания реальных ошибок конфигурации и того, как избежать их.

ClickHouse OSS предоставляет надежные функции безопасности из коробки. Тем не менее, их необходимо настроить:

- **Используйте SSL/TLS** через `tcp_port_secure` и `<openSSL>` в `config.xml`. Смотрите [guides/sre/configuring-ssl](/guides/sre/configuring-ssl).
- **Установите надежный пароль** для пользователя `default` или отключите его.
- **Избегайте внешнего доступа к ClickHouse**, если это не предусмотрено. По умолчанию ClickHouse связывается только с `localhost`, если `listen_host` не изменен.
- **Используйте методы аутентификации**, такие как пароли, сертификаты, SSH-ключи или [внешние аутентификаторы](/operations/external-authenticators).
- **Ограничьте доступ**, используя фильтрацию IP и оператор `HOST`. Смотрите [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host).
- **Включите контроль доступа на основе ролей (RBAC)** для предоставления детализированных привилегий. Смотрите [operations/access-rights](/operations/access-rights).
- **Принудительно применяйте квоты и лимиты** с помощью [квот](/operations/quotas), [профилей настроек](/operations/settings/settings-profiles) и режимов только для чтения.
- **Шифруйте данные в покое** и используйте безопасное внешнее хранилище. Смотрите [operations/storing-data](/operations/storing-data) и [cloud/security/CMEK](/cloud/security/cmek).
- **Избегайте жесткого кодирования учетных данных.** Используйте [именованные коллекции](/operations/named-collections) или IAM роли в ClickHouse Cloud.
- **Аудит доступа и запросов** с помощью [системных логов](/operations/system-tables/query_log) и [сессионных логов](/operations/system-tables/session_log).

Смотрите также [внешние аутентификаторы](/operations/external-authenticators) и [настройки сложности запросов](/operations/settings/query-complexity) для управления пользователями и обеспечения лимитов на запросы/ресурсы.

### Настройка времени жизни (TTL) {#configure-ttl}

Убедитесь, что [время жизни (TTL)](/use-cases/observability/clickstack/ttl) было [соответствующим образом настроено](/use-cases/observability/clickstack/ttl#modifying-ttl) для вашего развертывания ClickStack. Это контролирует, как долго данные хранятся - значение по умолчанию в 3 дня часто нуждается в модификации.

## Рекомендации по MongoDB {#mongodb-guidelines}

Следуйте официальному [контрольному списку безопасности MongoDB](https://www.mongodb.com/docs/manual/administration/security-checklist/).

## ClickHouse Cloud {#clickhouse-cloud-production}

Следующее представляет собой простое развертывание ClickStack с использованием ClickHouse Cloud, которое соответствует лучшим практикам.

<VerticalStepper headerLevel="h3">

### Создайте службу {#create-a-service}

Следуйте [руководству по началу работы с ClickHouse Cloud](/getting-started/quick-start/cloud/#1-create-a-clickhouse-service), чтобы создать службу.

### Скопируйте детали подключения {#copy-connection-details}

Чтобы найти детали подключения для HyperDX, перейдите в консоль ClickHouse Cloud и нажмите кнопку <b>Подключиться</b> на боковой панели, записав детали HTTP подключения, особенно URL.

**Хотя вы можете использовать имя пользователя и пароль по умолчанию, указанные на этом этапе для подключения HyperDX, мы рекомендуем создать посвященного пользователя - см. ниже**

<Image img={connect_cloud} alt="Подключение к облаку" size="md" background/>

### Создайте пользователя HyperDX {#create-a-user}

Мы рекомендуем создать выделенного пользователя для HyperDX. Выполните следующие SQL команды в [консоли Cloud SQL](/cloud/get-started/sql-console), указав надежный пароль, который соответствует требованиям сложности:

```sql
CREATE USER hyperdx IDENTIFIED WITH sha256_password BY '<YOUR_PASSWORD>' SETTINGS PROFILE 'readonly';
GRANT sql_console_read_only TO hyperdx;
```

### Подготовьтесь к пользователю инъекции {#prepare-for-ingestion}

Создайте базу данных `otel` для данных и пользователя `hyperdx_ingest` для инъекции с ограниченными правами.

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

### Разверните ClickStack {#deploy-clickstack}

Разверните ClickStack - предпочтительными являются модели развертывания [Helm](/use-cases/observability/clickstack/deployment/helm) или [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) (измененные для исключения ClickHouse).

:::note Развертывание компонентов отдельно
Продвинутые пользователи могут развернуть [OTel коллектор](/use-cases/observability/clickstack/ingesting-data/opentelemetry#standalone) и [HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only) отдельно с их соответствующими режимами самостоятельного развертывания.
:::

Инструкции по использованию ClickHouse Cloud с Helm chart можно найти [здесь](/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud). Эквивалентные инструкции для Docker Compose можно найти [здесь](/use-cases/observability/clickstack/deployment/docker-compose).

### Перейдите к интерфейсу HyperDX {#navigate-to-hyperdx-ui}

Посетите [http://localhost:8080](http://localhost:8080) для доступа к интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, которые соответствуют требованиям.

<Image img={hyperdx_login} alt="Интерфейс HyperDX" size="lg"/>

При нажатии `Создать` вам будут предложены детали подключения.

### Подключитесь к ClickHouse Cloud {#connect-to-clickhouse-cloud}

Используя учетные данные, созданные ранее, заполните детали подключения и нажмите `Создать`.

<Image img={hyperdx_cloud} alt="HyperDX Cloud" size="md"/>

### Отправьте данные в ClickStack {#send-data}

Чтобы отправить данные в ClickStack, смотрите ["Отправка данных OpenTelemetry"](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data).

</VerticalStepper>

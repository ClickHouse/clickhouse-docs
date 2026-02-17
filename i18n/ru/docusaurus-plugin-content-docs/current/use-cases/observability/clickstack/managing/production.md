---
slug: /use-cases/observability/clickstack/production
title: 'Переход в продакшен'
sidebar_label: 'Продакшен'
pagination_prev: null
pagination_next: null
description: 'Переход в продакшен на ClickStack'
doc_type: 'guide'
toc_max_heading_level: 2
keywords: ['clickstack', 'продакшен', 'развертывание', 'лучшие практики', 'эксплуатация']
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

При развертывании ClickStack в продакшн-среде необходимо учитывать ряд дополнительных аспектов, чтобы обеспечить безопасность, стабильность и корректную конфигурацию. Эти аспекты зависят от используемого дистрибутива — Open Source или Managed.

<Tabs groupId="architectures">
  <TabItem value="managed-clickstack" label="Управляемый ClickStack" default>
    Для продуктивных развертываний рекомендуется использовать [Managed ClickStack](/use-cases/observability/clickstack/getting-started/managed). Он по умолчанию применяет отраслевые [практики безопасности](/cloud/security) — включая усиленное шифрование, аутентификацию и сетевое подключение, а также управляемый контроль доступа, — а также предоставляет следующие преимущества:

    * Автоматическое масштабирование вычислительных ресурсов независимо от хранилища
    * Низкая стоимость и практически неограниченный срок хранения на основе объектного хранилища
    * Возможность независимо изолировать нагрузки чтения и записи с помощью Warehouses
    * Интегрированная аутентификация
    * Автоматизированные [резервные копии](/cloud/features/backups)
    * Бесшовные обновления

    **Следуйте этим [передовым практикам](/cloud/guides/production-readiness) для ClickHouse Cloud при использовании Managed ClickStack.**

    ### Защита ингестии \{#secure-ingestion-managed\}

    По умолчанию ClickStack OpenTelemetry Collector не защищён при развертывании вне Open Source-дистрибутивов и не требует аутентификации на своих OTLP-портах.

    Чтобы защитить ингестию, укажите токен аутентификации при развертывании коллектора с использованием переменной окружения `OTLP_AUTH_TOKEN`. Подробности см. в разделе [&quot;Securing the collector&quot;](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector).

    #### Создание пользователя для ингестии \{#create-a-database-ingestion-user-managed\}

    Рекомендуется создать выделенного пользователя для OTel collector для приёма данных в Managed ClickHouse и обеспечить, чтобы ингестия выполнялась в конкретную базу данных, например `otel`. Подробности см. в разделе [&quot;Creating an ingestion user&quot;](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user).

    ### Настройка Time To Live (TTL) \{#configure-ttl-managed\}

    Убедитесь, что [Time To Live (TTL)](/use-cases/observability/clickstack/ttl) [корректно настроен](/use-cases/observability/clickstack/ttl#modifying-ttl) для вашего развертывания Managed ClickStack. Это управляет сроком хранения данных — значение по умолчанию в 3 дня часто требует изменения.

    ### Оценка ресурсов \{#estimating-resources\}

    При развертывании **Managed ClickStack** важно выделить достаточно вычислительных ресурсов для обработки как ингестии, так и запросов. Приведённые ниже оценки представляют собой **базовую отправную точку** в зависимости от объёма данных обсервабилити, которые вы планируете направлять на приём.

    Эти рекомендации основаны на следующих допущениях:

    * Объём данных относится к **несжатому объёму приёма** в месяц и применим как к логам, так и к трейсам.
    * Характер запросов типичен для сценариев обсервабилити, при этом большинство запросов направлено на **свежие данные**, обычно за последние 24 часа.
    * Ингестия относительно **равномерна в течение месяца**. Если вы ожидаете всплески трафика или пики нагрузки, следует заложить дополнительный запас.
    * Хранилище обрабатывается отдельно через объектное хранилище ClickHouse Cloud и не является ограничивающим фактором для срока хранения. Мы предполагаем, что данные, хранящиеся длительное время, запрашиваются редко.

    Больше вычислительных ресурсов может потребоваться для шаблонов доступа, которые регулярно выполняют запросы за длительные периоды времени, выполняют тяжёлые агрегирования или поддерживают большое число одновременных пользователей.

    #### Рекомендованные базовые размеры \{#recommended-sizing\}

    | Ежемесячный объём ингестии | Рекомендуемые вычислительные ресурсы |
    | -------------------------- | ------------------------------------ |
    | &lt; 10 TB / месяц         | 2 vCPU × 3 реплики                   |
    | 10–50 TB / месяц           | 4 vCPU × 3 реплики                   |
    | 50–100 TB / месяц          | 8 vCPU × 3 реплики                   |
    | 100–500 TB / месяц         | 30 vCPU × 3 реплики                  |
    | 1 PB+ / месяц              | 59 vCPU × 3 реплики                  |

    :::note
    Эти значения являются **лишь оценками** и должны использоваться как начальная база. Фактические требования зависят от сложности запросов, уровня параллелизма, политик хранения и вариаций пропускной способности ингестии. Всегда мониторьте использование ресурсов и масштабируйте по мере необходимости.
    :::

    #### Изоляция нагрузок обсервабилити \{#isolating-workloads\}

    Если вы добавляете ClickStack к **существующему сервису ClickHouse Cloud**, который уже обслуживает другие нагрузки, например аналитику приложений в реальном времени, настоятельно рекомендуется изолировать трафик обсервабилити.

    Используйте [**Managed Warehouses**](/cloud/reference/warehouses), чтобы создать **дочерний сервис**, посвящённый ClickStack. Это позволит вам:

    * Изолировать нагрузку на приём и запросы от существующих приложений
    * Масштабировать нагрузки обсервабилити независимо
    * Не допустить влияния запросов обсервабилити на продуктивную аналитику
    * При необходимости совместно использовать одни и те же базовые датасеты между сервисами

    Такой подход гарантирует, что ваши существующие нагрузки останутся незатронутыми, при этом ClickStack сможет независимо масштабироваться по мере роста данных обсервабилити.

    Для более крупных развертываний или получения рекомендаций по кастомным размерам обратитесь в службу поддержки для более точной оценки.
  </TabItem>

  <TabItem value="oss-clickstack" label="ClickStack с открытым исходным кодом">
    ### Безопасность сети и портов \{#network-security\}

    По умолчанию Docker Compose открывает порты на хосте, делая их доступными извне контейнера — даже при включённых инструментах, таких как `ufw` (Uncomplicated Firewall). Это поведение обусловлено сетевым стеком Docker, который может обходить правила межсетевого экрана на уровне хоста, если не настроено явным образом.

    **Рекомендация:**

    Открывайте только те порты, которые необходимы для использования в production-окружении. Обычно это OTLP-эндпоинты, API-сервер и фронтенд.

    Например, удалите или закомментируйте ненужные маппинги портов в файле `docker-compose.yml`:

    ```yaml
    ports:
      - "4317:4317"  # OTLP gRPC
      - "4318:4318"  # OTLP HTTP
      - "8080:8080"  # Only if needed for the API
    # Avoid exposing internal ports like ClickHouse 8123 or MongoDB 27017.
    ```

    Подробнее об изоляции контейнеров и усилении защиты доступа см. в [документации по сетям Docker](https://docs.docker.com/network/).

    ### Конфигурация секрета сеанса \{#session-secret\}

    В продакшене необходимо задать надёжное случайное значение для переменной окружения `EXPRESS_SESSION_SECRET` для UI ClickStack (HyperDX) — это защитит данные сеанса и предотвратит их подделку.

    Добавьте это в файл `docker-compose.yml` для сервиса приложения следующим образом:

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

    Для генерации надёжного секрета используйте `openssl`:

    ```shell
    openssl rand -hex 32
    ```

    Не фиксируйте секреты в системе контроля версий. В продакшене используйте инструменты управления переменными окружения (например, Docker Secrets, HashiCorp Vault или конфигурации CI/CD для конкретных окружений).

    ### Защита ингестии \{#secure-ingestion\}

    Весь приём данных должен осуществляться через порты OTLP, предоставляемые дистрибутивом ClickStack коллектора OpenTelemetry (OTel). По умолчанию для этого требуется защищённый ключ API для приёма данных, сгенерированный при запуске. Этот ключ необходим при отправке данных на порты OTel и находится в интерфейсе HyperDX в разделе `Team Settings → API Keys`.

    <Image img={ingestion_key} alt="Ключи ингестии" size="lg" />

    Кроме того, рекомендуется включить TLS для конечных точек OTLP.

    #### Создание пользователя для ингестии \{#create-a-database-ingestion-user-oss\}

    Рекомендуется создать выделенного пользователя для OTel collector для ингестии в ClickHouse и обеспечить, чтобы данные ингестии отправлялись в конкретную базу данных, например `otel`. Подробнее см. [&quot;Создание пользователя для ингестии&quot;](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user).

    ### ClickHouse \{#clickhouse\}

    Пользователи, управляющие собственным экземпляром ClickHouse, должны придерживаться следующих рекомендаций.

    #### Рекомендации по обеспечению безопасности \{#self-managed-security\}

    Если вы управляете собственным экземпляром ClickHouse, необходимо включить **TLS**, настроить аутентификацию и следовать рекомендациям по усилению защиты доступа. См. [эту статью в блоге](https://www.wiz.io/blog/clickhouse-and-wiz) для ознакомления с реальными примерами неправильных конфигураций и способами их предотвращения.

    ClickHouse OSS предоставляет надёжные функции безопасности «из коробки». Однако для их использования требуется настройка:

    * **Используйте TLS** с помощью `tcp_port_secure` и `<openSSL>` в `config.xml`. См. раздел [guides/sre/configuring-tls](/guides/sre/tls/configuring-tls).
    * **Установите надежный пароль** для пользователя `default` или отключите этого пользователя.
    * **Не открывайте доступ к ClickHouse извне**, если только это не требуется явно. По умолчанию ClickHouse слушает только `localhost`, пока не будет изменён параметр `listen_host`.
    * **Используйте методы аутентификации**, например пароли, сертификаты, SSH-ключи или [внешние аутентификаторы](/operations/external-authenticators).
    * **Ограничьте доступ** с помощью фильтрации по IP и предложения `HOST`. См. [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host).
    * **Включите ролевое управление доступом (RBAC)**, чтобы предоставлять детализированные права доступа. См. [operations/access-rights](/operations/access-rights).
    * **Устанавливайте квоты и ограничения** с помощью [квот](/operations/quotas), [профилей настроек](/operations/settings/settings-profiles) и режимов «только для чтения».
    * **Шифруйте данные при хранении** и используйте безопасное внешнее хранилище. См. [operations/storing-data](/operations/storing-data) и [cloud/security/CMEK](/cloud/security/cmek).
    * **Не размещайте учетные данные в коде.** Используйте [именованные коллекции](/operations/named-collections) или роли IAM в ClickHouse Cloud.
    * **Проводите аудит доступа и запросов** с помощью [системных журналов](/operations/system-tables/query_log) и [журналов сессий](/operations/system-tables/session_log).

    См. также [внешние аутентификаторы](/operations/external-authenticators) и [настройки сложности запросов](/operations/settings/query-complexity) для управления пользователями и установки ограничений на запросы и ресурсы.

    #### Разрешения пользователя для интерфейса ClickStack \{#user-permissions\}

    Пользователю ClickHouse для интерфейса ClickStack достаточно иметь права `readonly` с доступом к изменению следующих настроек:

    * `max_rows_to_read` (как минимум до 1 000 000)
    * `read_overflow_mode`
    * `cancel_http_readonly_queries_on_client_close`
    * `wait_end_of_query`

    По умолчанию пользователь `default` как в OSS, так и в ClickHouse Cloud имеет эти разрешения, однако рекомендуется создать нового пользователя с этими разрешениями.

    ### Настройка Time To Live (TTL) \{#configure-ttl\}

    Убедитесь, что [Time To Live (TTL)](/use-cases/observability/clickstack/ttl) [корректно настроен](/use-cases/observability/clickstack/ttl#modifying-ttl) для вашего развертывания ClickStack. Это управляет сроком хранения данных — значение по умолчанию в 3 дня часто требует изменения.

    ### Рекомендации MongoDB \{#mongodb-guidelines\}

    Следуйте официальному [контрольному списку безопасности MongoDB](https://www.mongodb.com/docs/manual/administration/security-checklist/).
  </TabItem>
</Tabs>
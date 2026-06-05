---
slug: /use-cases/observability/clickstack/setting-up-your-opentelemetry-collector
title: 'Настройка OpenTelemetry Collector'
description: 'Настройка OpenTelemetry Collector для Управляемого ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'opentelemetry', 'collector', 'managed', 'observability', 'gateway', 'otelgen']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

import Image from '@theme/IdealImage';
import clickhouse_cloud_connection from '@site/static/images/use-cases/observability/clickstack-cloud-connect.png';
import clickstack_cloud from '@site/static/images/use-cases/observability/clickstack-cloud-first-time.png';
import clickstack_start_ingestion from '@site/static/images/use-cases/observability/clickstack-start-ingestion.png';
import clickstack_start_exploring from '@site/static/images/use-cases/observability/clickstack-start-exploring.png';
import clickstack_search from '@site/static/images/use-cases/observability/clickstack-search.png';

Это руководство поможет вам развернуть коллектор OpenTelemetry (OTel) для существующего сервиса Управляемого ClickStack, а затем проверить, что данные проходят через него.

Коллектор работает как **шлюз**: это единая конечная точка OTLP, в которую отправляют данные ваши приложения, SDK и коллекторы-агенты. Шлюз объединяет события в батчи, применяет настроенную вами обработку и записывает их в ClickHouse через [экспортер ClickHouse](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter). Такой подход позволяет вынести логику сбора из прикладного кода и масштабировать ингестию независимо от рабочих нагрузок, создающих данные. Подробнее о ролях шлюза и агента см. в разделе [Роли коллектора](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles).

В этом руководстве предполагается, что вы уже выполнили шаги из руководства [Начало работы с Управляемым ClickStack](/use-cases/observability/clickstack/getting-started/managed) и у вас под рукой есть учётные данные для подключения.

<VerticalStepper headerLevel="h2">
  ## Получите учётные данные \{#gather-credentials\}

  Вам потребуется:

  * HTTPS-конечная точка вашего сервиса ClickHouse Cloud, включая протокол и порт, например `https://abc123xyz.us-central1.gcp.clickhouse.cloud:8443`.
  * Имя пользователя ClickHouse и пароль для ингестии.

  Если у вас нет этих данных, откройте свой сервис в [консоли ClickHouse Cloud](https://console.clickhouse.cloud) и выберите **Connect**. Скопируйте URL из появившегося диалогового окна. Ниже мы создадим отдельного пользователя для ингестии.

  <Image img={clickhouse_cloud_connection} size="lg" alt="Панель подключения к сервису с конечной точкой HTTPS и паролем" border />

  ## Создание пользователя для ингестии \{#create-ingestion-user\}

  Рекомендуется создать отдельного пользователя для коллектора вместо использования `default`. Подключитесь к своему сервису через SQL-консоль и выполните:

  ```sql
  CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
  GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
  ```

  :::tip
  Замените пароль в приведённом выше фрагменте на надёжный
  :::

  Коллектор создаёт схему для журналов, трассировок и метрик в базе данных `otel` при первом запуске. Дополнительные сведения о настройке пользователя для production-среды см. в разделе [Переход в production](/use-cases/observability/clickstack/production#create-a-database-ingestion-user-managed).

  ## Развёртывание коллектора \{#deploy-the-collector\}

  Разверните коллектор в месте, доступном для приложений и инфраструктуры, отправляющих данные OpenTelemetry. В примере ниже мы запускаем коллектор локально и для простоты генерируем искусственные данные телеметрии на той же машине.

  :::note info
  В производственной среде коллектор, как правило, развёртывается в кластере Kubernetes или на виртуальной машине, доступной для ваших OpenTelemetry SDK, агентов и других коллекторов. Это позволяет централизованно собирать телеметрию со всей среды и пересылать её в ClickStack.
  :::

  Выберите общий секрет для аутентификации клиентов, отправляющих данные в коллектор, затем экспортируйте его вместе со сведениями о подключении и паролем для пользователя `hyperdx_ingest`:

  ```shell
  export CLICKHOUSE_ENDPOINT=<HTTPS_ENDPOINT>
  export CLICKHOUSE_USER=hyperdx_ingest
  export CLICKHOUSE_PASSWORD=ClickH0u3eRocks123!
  export OTLP_AUTH_TOKEN="a-strong-shared-secret"
  ```

  Запустите ClickStack OTel collector:

  ```shell
  docker run -d \
    -e OTLP_AUTH_TOKEN=${OTLP_AUTH_TOKEN} \
    -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
    -e CLICKHOUSE_USER=${CLICKHOUSE_USER} \
    -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
    -e HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE=otel \
    -p 4317:4317 \
    -p 4318:4318 \
    clickhouse/clickstack-otel-collector:latest
  ```

  Теперь коллектор принимает OTLP gRPC на порту `4317` и OTLP HTTP на порту `4318`. Приложения, SDK и агентские коллекторы должны отправлять данные на эти порты, передавая заголовок `authorization: $OTLP_AUTH_TOKEN` в запросе.

  :::note[Производственные развертывания]
  Для производственных сред рекомендуется включить TLS на конечной точке OTLP. См. раздел [Защита коллектора](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector).
  :::

  ## Проверка конечной точки \{#verify-the-endpoint\}

  Сгенерируйте синтетический трафик на коллектор, чтобы убедиться в корректной работе всего конвейера. Для этого используется [`otelgen`](https://github.com/krzko/otelgen) — небольшой CLI-инструмент, который отправляет журналы, трассировки и метрики по протоколу OTLP.

  Установите `otelgen` с помощью Homebrew:

  ```shell
  brew install krzko/tap/otelgen
  ```

  Или с Go:

  ```shell
  go install github.com/krzko/otelgen@latest
  ```

  Отправьте небольшую серию записей журнала в collector:

  ```shell
   otelgen \
    --otel-exporter-otlp-endpoint localhost:4317 \
    --insecure \
    --protocol grpc \
    --header "authorization=${OTLP_AUTH_TOKEN}" \
    --rate 5 \
    --duration 60 \
    logs multi
  ```

  Аналогичные команды для трассировок и метрик, а также обзор остальных подкоманд `otelgen` см. в разделе [Синтетические данные с otelgen](/use-cases/observability/clickstack/getting-started/otelgen).

  ## Подтверждение в интерфейсе ClickStack \{#confirm-in-ui\}

  Откройте свой сервис в [консоли ClickHouse Cloud](https://console.clickhouse.cloud), выберите **ClickStack** в левом меню и нажмите **Start Ingestion**.

  <Image img={clickstack_cloud} size="lg" alt="Запустите ClickStack" border />

  Следующий шаг можно пропустить, так как вы уже настроили коллектор. Нажмите **Launch ClickStack**, чтобы продолжить.

  ClickStack откроется в новой вкладке, и вы будете автоматически перенаправлены на страницу **Getting Started**. Если этого не произошло, выберите **Getting Started** в меню слева, затем нажмите **Start Ingestion**, а затем — **Next**.

  <Image img={clickstack_start_ingestion} size="lg" alt="Запуск ингестии в ClickStack" border />

  ClickStack автоматически обнаружит ваши таблицы и данные телеметрии, после чего вы сможете продолжить работу. Нажмите **Start Exploring**, чтобы приступить к анализу данных трассировки.

  <Image img={clickstack_start_exploring} size="lg" alt="ClickStack Начать изучение" border />

  Переключите источник на `Logs` и задайте временной диапазон **Last 15 minutes**. Синтетические журналы из `otelgen` должны появиться в течение нескольких секунд.

  <Image img={clickstack_search} size="lg" alt="Представление Search в ClickStack с отображением журналов" />

  Если ничего не отображается:

  * Убедитесь, что значение `OTLP_AUTH_TOKEN`, переданное в `otelgen`, совпадает со значением, заданным для коллектора.
  * Просматривайте журналы коллектора с помощью `docker logs -f <container-id>` и проверяйте наличие ошибок экспорта.
  * Убедитесь, что `CLICKHOUSE_ENDPOINT` содержит и протокол, и порт (`https://...:8443`).

  ## Дополнительные материалы \{#further-reading\}

  В этом руководстве рассматривается один экземпляр коллектора в простейшей форме. О дальнейших шагах рассказывается в [справочнике по OpenTelemetry Collector](/use-cases/observability/clickstack/ingesting-data/otel-collector):

  * [Защита коллектора](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector) с TLS на конечной точке OTLP и пользователями для ингестии с минимально необходимыми привилегиями.
  * [Обработка, фильтрация и обогащение событий](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching) на шлюзе.
  * [Расширение конфигурации коллектора](/use-cases/observability/clickstack/ingesting-data/otel-collector#extending-collector-config) за счёт добавления пользовательских приёмников, процессоров и конвейеров.
  * [Оценка ресурсов](/use-cases/observability/clickstack/ingesting-data/otel-collector#estimating-resources) для развертываний шлюза и агента при ожидаемой пропускной способности.
  * [Вывод в production](/use-cases/observability/clickstack/production) — рекомендации по выводу в production.
</VerticalStepper>
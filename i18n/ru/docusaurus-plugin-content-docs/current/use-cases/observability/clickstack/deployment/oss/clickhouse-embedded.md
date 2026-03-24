---
slug: /use-cases/observability/clickstack/deployment/clickhouse-embedded
title: 'Встроенный в ClickHouse'
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: 'Использование ClickStack, встроенного в сервер ClickHouse — стек обсервабилити ClickHouse'
doc_type: 'guide'
keywords: ['встроенный ClickStack', 'встроенный ClickHouse', 'ClickStack в сервере ClickHouse', 'встроенная обсервабилити']
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import authenticate from '@site/static/images/clickstack/deployment/embedded/authenticate.png';
import inferred_source from '@site/static/images/clickstack/deployment/embedded/inferred-source.png';

ClickStack встроен непосредственно в бинарный файл сервера ClickHouse. Это означает, что вы можете получить доступ к пользовательскому интерфейсу ClickStack (HyperDX) из своего экземпляра ClickHouse без развертывания каких-либо дополнительных компонентов. Такое развертывание аналогично публичной демонстрации на [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com), но работает с вашим собственным экземпляром ClickHouse и вашими данными.


### Подходит для \{#suitable-for\}

* Быстрого знакомства с ClickStack с минимальными настройками
* Исследования собственных данных ClickHouse в интерфейсе обсервабилити
* Демонстраций и оценки решений

### Ограничения \{#limitations\}

Эта встраиваемая версия **не предназначена для использования в продакшене**. По сравнению с [готовыми к продакшену OSS-развертываниями](/use-cases/observability/clickstack/deployment/oss) в ней недоступны следующие возможности:

- [Оповещения](/use-cases/observability/clickstack/alerts)
- Сохранение [дашбордов](/use-cases/observability/clickstack/dashboards) и [поиска](/use-cases/observability/clickstack/search) — дашборды и сохранённые поисковые запросы не сохраняются между сессиями
- Настраиваемые параметры запросов
- [Шаблоны событий](/use-cases/observability/clickstack/event_patterns)

## Шаги развертывания \{#deployment-steps\}

<Tabs groupId="install-method">
  <TabItem value="docker" label="Docker" default>
    <VerticalStepper headerLevel="h3">
      ### Запустите ClickHouse

      Скачайте и запустите образ сервера ClickHouse с заданным паролем:

      ```shell
      docker run --rm -it -p 8123:8123 -e CLICKHOUSE_PASSWORD=password clickhouse/clickhouse-server:head-alpine
      ```

      :::tip Запуск без пароля
      Если вы предпочитаете запускать без пароля, необходимо явно включить управление доступом по умолчанию:

      ```shell
      docker run --rm -it -p 8123:8123 -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 clickhouse/clickhouse-server:head-alpine
      ```

      :::

      ### Откройте интерфейс ClickStack

      Откройте [http://localhost:8123](http://localhost:8123) в браузере и нажмите **ClickStack**.

      Введите имя пользователя `default` и пароль `password`, чтобы подключиться к локальному экземпляру.

      <Image img={authenticate} alt="Аутентификация" size="lg" />

      ### Создайте источник

      Если у вас уже есть таблицы OpenTelemetry, ClickStack обнаружит их и создаст источники автоматически.

      При новой установке вам будет предложено создать источник. Заполните поле **Table** соответствующим именем таблицы (например, `otel_logs`) и нажмите **Save New Source**.

      <Image img={inferred_source} alt="Создание источника" size="lg" />

      Если у вас ещё нет данных, см. раздел [Ingesting data](/use-cases/observability/clickstack/ingesting-data) для доступных вариантов.
    </VerticalStepper>
  </TabItem>

  <TabItem value="binary" label="Binary">
    <VerticalStepper headerLevel="h3">
      ### Запустите ClickHouse

      Скачайте и запустите ClickHouse:

      ```shell
      curl https://clickhouse.com/ | sh
      ```

      <details>
        <summary>Необязательно: включите системные таблицы логов</summary>

        Чтобы исследовать внутренние логи и метрики самого ClickHouse, создайте конфигурационный фрагмент в рабочем каталоге перед запуском сервера:

        ```shell
        mkdir -p config.d && cat > config.d/query_logs.xml << 'EOF'
        <clickhouse>
            <query_log>
                <database>system</database>
                <table>query_log</table>
            </query_log>
            <query_thread_log>
                <database>system</database>
                <table>query_thread_log</table>
            </query_thread_log>
            <query_views_log>
                <database>system</database>
                <table>query_views_log</table>
            </query_views_log>
            <metric_log>
                <database>system</database>
                <table>metric_log</table>
            </metric_log>
            <asynchronous_metric_log>
                <database>system</database>
                <table>asynchronous_metric_log</table>
            </asynchronous_metric_log>
        </clickhouse>
        EOF
        ```

        После этого вы можете создать **Log Source**, указывающий на `system.query_log`, после открытия ClickStack:

        | Setting              | Value                                                                                                                                   |
        | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
        | **Name**             | `Query Logs`                                                                                                                            |
        | **Database**         | `system`                                                                                                                                |
        | **Table**            | `query_log`                                                                                                                             |
        | **Timestamp Column** | `event_time`                                                                                                                            |
        | **Default Select**   | `event_time, query_kind, query, databases, tables, initial_user, projections, memory_usage, written_rows, read_rows, query_duration_ms` |
      </details>

      Запустите сервер:

      ```shell
      ./clickhouse server
      ```

      ### Откройте интерфейс ClickStack

      Откройте [http://localhost:8123](http://localhost:8123) в браузере и нажмите **ClickStack**. Подключение к локальному экземпляру создаётся автоматически.

      ### Создайте источник

      Если у вас уже есть таблицы OpenTelemetry, ClickStack обнаружит их и создаст источники автоматически.

      Если у вас ещё нет данных, см. раздел [Ingesting data](/use-cases/observability/clickstack/ingesting-data) для доступных вариантов.

      <Image img={inferred_source} alt="Создание источника" size="lg" />
    </VerticalStepper>
  </TabItem>
</Tabs>

## Дальнейшие шаги {#next-steps}

Если вы готовы перейти от оценки к эксплуатации, рассмотрите готовые к продакшену варианты развертывания:

- [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one) — один контейнер со всеми компонентами, включая хранилище данных и аутентификацию
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) — отдельные компоненты для более точного контроля
- [Helm](/use-cases/observability/clickstack/deployment/helm) — рекомендуемый вариант для production-развертывания в Kubernetes
- [Managed ClickStack](/use-cases/observability/clickstack/getting-started/managed) — полностью управляемый вариант в ClickHouse Cloud
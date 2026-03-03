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
import create_source from '@site/static/images/clickstack/deployment/embedded/create-source.png';

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

## Этапы развертывания \{#deployment-steps\}

<VerticalStepper headerLevel="h3">

### Запустите ClickHouse \{#start-clickhouse\}

<Tabs groupId="install-method">
<TabItem value="docker" label="Docker" default>

Загрузите и запустите образ сервера ClickHouse, указав пароль:

```shell
docker run --rm -it -p 8123:8123 -e CLICKHOUSE_PASSWORD=password clickhouse/clickhouse-server:head-alpine
```

:::tip Запуск без пароля
Если вы предпочитаете запуск без пароля, необходимо явно включить управление доступом по умолчанию:

```shell
docker run --rm -it -p 8123:8123 -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 clickhouse/clickhouse-server:head-alpine
```
:::

</TabItem>
<TabItem value="binary" label="Binary">

Скачайте и запустите ClickHouse:

```shell
curl https://clickhouse.com/ | sh

./clickhouse server
```

У пользователя `default` нет пароля при запуске из бинарного файла.

</TabItem>
</Tabs>

### Перейдите в интерфейс ClickStack \{#navigate-to-clickstack-ui\}

Откройте [http://localhost:8123](http://localhost:8123) в браузере и нажмите **ClickStack**.

Введите свои учетные данные. Если вы используете пример с Docker выше, имя пользователя — `default`, пароль — `password`. Если вы используете бинарный файл, для пользователя `default` пароль не требуется.

<Image img={authenticate} alt="Аутентификация" size="lg"/>

### Создайте источник \{#create-a-source\}

После входа в систему вам будет предложено создать источник данных. Если у вас уже есть таблицы OpenTelemetry, оставьте значения по умолчанию и заполните поле `Table` соответствующим именем таблицы (например, `otel_logs`). Все остальные настройки будут определены автоматически, после чего вы сможете нажать `Save New Source`.

Если у вас пока нет данных, см. раздел ["Приём данных"](/use-cases/observability/clickstack/ingesting-data) для доступных вариантов.

<Image img={create_source} alt="Создание источника" size="lg"/>

</VerticalStepper>

## Дальнейшие шаги \{#next-steps\}

Если вы готовы перейти от оценки к эксплуатации, рассмотрите готовые к продакшену варианты развертывания:

- [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one) — один контейнер со всеми компонентами, включая хранилище данных и аутентификацию
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) — отдельные компоненты для более точного контроля
- [Helm](/use-cases/observability/clickstack/deployment/helm) — рекомендуемый вариант для production-развертывания в Kubernetes
- [Managed ClickStack](/use-cases/observability/clickstack/getting-started/managed) — полностью управляемый вариант в ClickHouse Cloud
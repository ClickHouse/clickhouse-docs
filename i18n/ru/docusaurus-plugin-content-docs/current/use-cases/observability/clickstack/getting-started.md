---
slug: /use-cases/observability/clickstack/getting-started
title: 'Начало работы с ClickStack'
sidebar_label: 'Начало работы'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'Начало работы с ClickStack — стек наблюдаемости ClickHouse'
doc_type: 'guide'
keywords: ['ClickStack', 'начало работы', 'развертывание в Docker', 'HyperDX UI', 'ClickHouse Cloud', 'локальное развертывание']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx-1.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud-creds.png';
import add_connection from '@site/static/images/use-cases/observability/add_connection.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import edit_cloud_connection from '@site/static/images/use-cases/observability/edit_cloud_connection.png';
import delete_source from '@site/static/images/use-cases/observability/delete_source.png';
import delete_connection from '@site/static/images/use-cases/observability/delete_connection.png';
import created_sources from '@site/static/images/use-cases/observability/created_sources.png';
import edit_connection from '@site/static/images/use-cases/observability/edit_connection.png';

Благодаря готовым Docker-образам начать работу с **ClickStack** очень просто. Эти образы собраны на основе официального Debian-пакета ClickHouse и доступны в нескольких вариантах для разных сценариев использования.

## Локальное развертывание {#local-deployment}

Самый простой вариант — это **дистрибутив в виде одного образа (single-image)**, который включает все основные компоненты стека в одном образе:

- **HyperDX UI**
- **OpenTelemetry (OTel) collector**
- **ClickHouse**

Этот «всё-в-одном» образ позволяет запустить полный стек одной командой, что делает его идеальным для тестирования, экспериментов или быстрых локальных развертываний.

<VerticalStepper headerLevel="h3">

### Развертывание стека с помощью Docker {#deploy-stack-with-docker}

Следующая команда запустит OTel collector (на портах 4317 и 4318) и HyperDX UI (на порту 8080).

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

:::note Обновление имени образа
Образы ClickStack теперь публикуются как `clickhouse/clickstack-*` (ранее `docker.hyperdx.io/hyperdx/*`).
:::

:::tip Сохранение данных и настроек
Чтобы сохранять данные и настройки между перезапусками контейнера, пользователи могут изменить приведённую выше команду docker, чтобы примонтировать пути `/data/db`, `/var/lib/clickhouse` и `/var/log/clickhouse-server`. 

Например:

```shell
# измените команду, чтобы примонтировать пути {#modify-command-to-mount-paths}
docker run \
  -p 8080:8080 \
  -p 4317:4317 \
  -p 4318:4318 \
  -v "$(pwd)/.volumes/db:/data/db" \
  -v "$(pwd)/.volumes/ch_data:/var/lib/clickhouse" \
  -v "$(pwd)/.volumes/ch_logs:/var/log/clickhouse-server" \
  clickhouse/clickstack-all-in-one:latest
```
:::

### Переход в HyperDX UI {#navigate-to-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы открыть HyperDX UI.

Создайте пользователя, указав имя пользователя и пароль, удовлетворяющие требованиям к сложности. 

<Image img={hyperdx_login} alt="Интерфейс HyperDX" size="lg"/>

HyperDX автоматически подключится к локальному кластеру и создаст источники данных для логов, трейсов, метрик и сессий — это позволит вам сразу начать работу с продуктом.

### Изучение продукта {#explore-the-product}

После развертывания стека попробуйте один из наших примерных наборов данных.

Чтобы продолжить работу с локальным кластером:

- [Пример набора данных](/use-cases/observability/clickstack/getting-started/sample-data) — Загрузите пример набора данных из нашего публичного демо и продиагностируйте простую проблему.
- [Локальные файлы и метрики](/use-cases/observability/clickstack/getting-started/local-data) — Загрузите локальные файлы и осуществляйте мониторинг системы на OSX или Linux с использованием локального OTel collector.

<br/>
Либо вы можете подключиться к демо-кластеру и исследовать более крупный набор данных: 

- [Удалённый демонстрационный набор данных](/use-cases/observability/clickstack/getting-started/remote-demo-data) — Исследуйте демонстрационный набор данных в нашем демо-сервисе ClickHouse.

</VerticalStepper>

## Развёртывание с ClickHouse Cloud {#deploy-with-clickhouse-cloud}

Пользователи могут разворачивать ClickStack поверх ClickHouse Cloud, получая полностью управляемый и защищённый бэкенд при сохранении полного контроля над ингестией, схемой и процессами обсервабилити.

<VerticalStepper headerLevel="h3">

### Создание сервиса ClickHouse Cloud {#create-a-service}

Следуйте [руководству по началу работы с ClickHouse Cloud](/getting-started/quick-start/cloud#1-create-a-clickhouse-service), чтобы создать сервис.

### Копирование параметров подключения {#copy-cloud-connection-details}

Чтобы найти параметры подключения для HyperDX, перейдите в консоль ClickHouse Cloud и нажмите кнопку <b>Connect</b> в боковой панели. 

Скопируйте параметры HTTP-подключения, в частности HTTPS endpoint (`endpoint`) и пароль.

<Image img={connect_cloud} alt="Подключение к Cloud" size="md"/>

:::note Развёртывание в продакшен
Хотя мы будем использовать пользователя `default` для подключения HyperDX, мы рекомендуем создать выделенного пользователя при [переходе в продакшен](/use-cases/observability/clickstack/production#create-a-user).
:::

### Развёртывание с помощью docker {#deploy-with-docker}

Откройте терминал и экспортируйте скопированные выше учётные данные:

```shell
export CLICKHOUSE_USER=default
export CLICKHOUSE_ENDPOINT=<YOUR HTTPS ENDPOINT>
export CLICKHOUSE_PASSWORD=<YOUR_PASSWORD>
```

Выполните следующую docker-команду:

```shell
docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

Это откроет OTel collector (на портах 4317 и 4318) и веб-интерфейс HyperDX (на порту 8080).

### Переход в интерфейс HyperDX UI {#navigate-to-hyperdx-ui-cloud}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы открыть HyperDX UI.

Создайте пользователя, указав имя пользователя и пароль, соответствующие требованиям к сложности. 

<Image img={hyperdx_login} alt="Вход в HyperDX" size="lg"/>

### Создание подключения к ClickHouse Cloud {#create-a-cloud-connection}

Перейдите в `Team Settings` и нажмите `Edit` для `Local Connection`:

<Image img={edit_connection} alt="Редактирование подключения" size="lg"/>

Переименуйте подключение в `Cloud` и заполните форму учётными данными вашего сервиса ClickHouse Cloud, затем нажмите `Save`:

<Image img={edit_cloud_connection} alt="Создание подключения к Cloud" size="lg"/>

### Изучение продукта {#explore-the-product-cloud}

После развёртывания стека попробуйте один из наших примерных наборов данных.

- [Пример набора данных](/use-cases/observability/clickstack/getting-started/sample-data) — загрузите пример набора данных из нашего публичного демо и разберите простую проблему.
- [Локальные файлы и метрики](/use-cases/observability/clickstack/getting-started/local-data) — загрузите локальные файлы и мониторьте систему в OSX или Linux с использованием локального OTel collector.

</VerticalStepper>

## Локальный режим {#local-mode}

Локальный режим — это способ развернуть HyperDX без необходимости проходить аутентификацию. 

Аутентификация в этом режиме не поддерживается. 

Этот режим предназначен для быстрого тестирования, разработки, демонстраций и отладки, когда аутентификация и сохранение настроек не требуются.

### Облачная версия {#hosted-version}

Вы можете использовать облачную версию HyperDX в локальном режиме, доступную по адресу [play.hyperdx.io](https://play.hyperdx.io).

### Self-hosted‑версия {#self-hosted-version}

<VerticalStepper headerLevel="h3">

### Запуск с помощью Docker {#run-local-with-docker}

Локальный self-hosted образ включает заранее сконфигурированные OpenTelemetry Collector и сервер ClickHouse. Это упрощает приём телеметрических данных из ваших приложений и их визуализацию в HyperDX при минимальной внешней настройке. Чтобы начать работу с self-hosted версией, просто запустите контейнер Docker с пробросом соответствующих портов:

```shell
docker run -p 8080:8080 clickhouse/clickstack-local:latest
```

Система не предложит вам создать пользователя, так как локальный режим не включает аутентификацию.

### Полные учётные данные подключения {#complete-connection-credentials}

Чтобы подключиться к собственному **внешнему кластеру ClickHouse**, вы можете вручную ввести учётные данные подключения.

Либо, для быстрого ознакомления с продуктом, вы можете нажать **Connect to Demo Server**, чтобы получить доступ к предварительно загруженным наборам данных и опробовать ClickStack без какой-либо настройки.

<Image img={hyperdx_2} alt="Учётные данные" size="md"/>

При подключении к demo-серверу пользователи могут изучать данные, используя [инструкции по демонстрационным данным](/use-cases/observability/clickstack/getting-started/remote-demo-data).

</VerticalStepper>
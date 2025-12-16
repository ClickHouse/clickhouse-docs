---
slug: /use-cases/observability/clickstack/getting-started
title: 'Начало работы с ClickStack'
sidebar_label: 'Начало работы'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'Начало работы с ClickStack — стек обсервабилити ClickHouse'
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

Начать работу с **ClickStack** достаточно просто благодаря наличию готовых Docker-образов. Эти образы основаны на официальном Debian-пакете ClickHouse и доступны в нескольких вариантах дистрибутивов для различных сценариев использования.


## Локальное развертывание {#local-deployment}

Самый простой вариант — **единый образ**, который включает все основные компоненты стека в одном пакете:

- **HyperDX UI**
- **OpenTelemetry (OTel) collector**
- **ClickHouse**

Этот образ «всё-в-одном» позволяет запустить полный стек одной командой, что делает его удобным для тестирования, экспериментов или быстрых локальных развертываний.

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
Чтобы сохранять данные и настройки между перезапусками контейнера, вы можете изменить приведённую выше команду Docker, чтобы примонтировать пути `/data/db`, `/var/lib/clickhouse` и `/var/log/clickhouse-server`. 

Например:

```shell
# измените команду, чтобы примонтировать пути
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

Создайте пользователя, указав имя пользователя и пароль, соответствующий требованиям к сложности. 

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

HyperDX автоматически подключится к локальному кластеру и создаст источники данных для логов, трейсов, метрик и сессий, что позволит вам сразу приступить к работе с продуктом.

### Изучение продукта {#explore-the-product}

После развертывания стека попробуйте один из наших примерных датасетов.

Чтобы продолжить работу с локальным кластером:

- [Примерный датасет](/use-cases/observability/clickstack/getting-started/sample-data) — Загрузите примерный датасет из нашего публичного демо и продиагностируйте простую проблему.
- [Локальные файлы и метрики](/use-cases/observability/clickstack/getting-started/local-data) — Загрузите локальные файлы и отслеживайте состояние системы на OSX или Linux с использованием локального OTel collector.

<br/>
В качестве альтернативы вы можете подключиться к демо-кластеру, где доступен более крупный датасет: 

- [Удалённый демонстрационный датасет](/use-cases/observability/clickstack/getting-started/remote-demo-data) — Изучите демонстрационный датасет в нашем демонстрационном сервисе ClickHouse.

</VerticalStepper>

## Развёртывание с ClickHouse Cloud {#deploy-with-clickhouse-cloud}

Вы можете развернуть ClickStack с ClickHouse Cloud, получая преимущества полностью управляемого и безопасного бэкенда, при этом сохраняя полный контроль над приёмом данных, схемой и рабочими процессами обсервабилити.

<VerticalStepper headerLevel="h3">

### Создайте сервис ClickHouse Cloud {#create-a-service}

Следуйте [руководству по началу работы с ClickHouse Cloud](/getting-started/quick-start/cloud#1-create-a-clickhouse-service), чтобы создать сервис.

### Скопируйте параметры подключения {#copy-cloud-connection-details}

Чтобы найти параметры подключения для HyperDX, перейдите в консоль ClickHouse Cloud и нажмите кнопку <b>Connect</b> на боковой панели. 

Скопируйте параметры HTTP-подключения, в частности HTTPS endpoint (`endpoint`) и пароль.

<Image img={connect_cloud} alt="Подключение к Cloud" size="md"/>

:::note Развёртывание в продакшн
Хотя для подключения HyperDX мы будем использовать пользователя `default`, мы рекомендуем создать отдельного пользователя при [переходе в продакшн](/use-cases/observability/clickstack/production#create-a-user).
:::

### Развёртывание с помощью Docker {#deploy-with-docker}

Откройте терминал и экспортируйте скопированные выше учётные данные:

```shell
export CLICKHOUSE_USER=default
export CLICKHOUSE_ENDPOINT=<YOUR HTTPS ENDPOINT>
export CLICKHOUSE_PASSWORD=<YOUR_PASSWORD>
```

Выполните следующую команду Docker:

```shell
docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

Эта команда запустит OTel collector (на портах 4317 и 4318) и интерфейс HyperDX (на порту 8080).

### Перейдите в интерфейс HyperDX {#navigate-to-hyperdx-ui-cloud}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы получить доступ к интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, удовлетворяющие требованиям к сложности. 

<Image img={hyperdx_login} alt="Вход в HyperDX" size="lg"/>

### Создайте подключение к ClickHouse Cloud {#create-a-cloud-connection}

Перейдите в `Team Settings` и нажмите `Edit` для `Local Connection`:

<Image img={edit_connection} alt="Редактирование подключения" size="lg"/>

Переименуйте подключение в `Cloud` и заполните форму на следующем экране учётными данными вашего сервиса ClickHouse Cloud, затем нажмите `Save`:

<Image img={edit_cloud_connection} alt="Создание подключения к Cloud" size="lg"/>

### Изучите продукт {#explore-the-product-cloud}

После развёртывания стека попробуйте один из наших примерных датасетов.

- [Пример датасета](/use-cases/observability/clickstack/getting-started/sample-data) — загрузите пример датасета из нашего публичного демо и продиагностируйте простую проблему.
- [Локальные файлы и метрики](/use-cases/observability/clickstack/getting-started/local-data) — загрузите локальные файлы и мониторьте систему на macOS или Linux с помощью локального OTel collector.

</VerticalStepper>

## Локальный режим {#local-mode}

Локальный режим — это способ развернуть HyperDX без аутентификации. 

Аутентификация не поддерживается. 

Этот режим предназначен для быстрого тестирования, разработки, демонстраций и отладки, когда аутентификация и сохранение настроек не нужны.

### Облачная версия {#hosted-version}

Вы можете использовать облачную версию HyperDX в локальном режиме, доступную по адресу [play.hyperdx.io](https://play.hyperdx.io).

### Самостоятельно размещаемая версия {#self-hosted-version}

<VerticalStepper headerLevel="h3">

### Запуск в Docker {#run-local-with-docker}

Образ локального режима в самостоятельном развертывании поставляется с уже настроенными коллектором OpenTelemetry и сервером ClickHouse. Это упрощает приём телеметрических данных из ваших приложений и их визуализацию в HyperDX при минимальной внешней настройке. Чтобы начать работу с самостоятельно размещаемой версией, просто запустите контейнер Docker с пробросом соответствующих портов:

```shell
docker run -p 8080:8080 clickhouse/clickstack-local:latest
```

Вам не будет предложено создать пользователя, так как в локальном режиме аутентификация отсутствует.

### Полные реквизиты подключения {#complete-connection-credentials}

Чтобы подключиться к вашему собственному **внешнему кластеру ClickHouse**, вы можете вручную ввести реквизиты подключения.

Либо, для быстрой ознакомительной работы с продуктом, вы можете нажать **Connect to Demo Server**, чтобы получить доступ к предзагруженным наборам данных и опробовать ClickStack без какой-либо настройки.

<Image img={hyperdx_2} alt="Реквизиты подключения" size="md"/>

При подключении к демо-серверу вы можете исследовать датасет, следуя [инструкциям по демо-датасету](/use-cases/observability/clickstack/getting-started/remote-demo-data).

</VerticalStepper>
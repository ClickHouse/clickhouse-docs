---
slug: /use-cases/observability/clickstack/getting-started
title: 'Начало работы с ClickStack'
sidebar_label: 'Начало работы'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'Начало работы с ClickStack — стеком наблюдаемости ClickHouse'
doc_type: 'guide'
keywords: ['ClickStack', 'начало работы', 'развертывание в Docker', 'интерфейс HyperDX', 'ClickHouse Cloud', 'локальное развертывание']
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

Начать работу с **ClickStack** несложно: доступны готовые образы Docker. Эти образы основаны на официальном Debian-пакете ClickHouse и поставляются в нескольких вариантах дистрибутивов для разных сценариев использования.


## Локальное развертывание {#local-deployment}

Самый простой вариант — **дистрибутив в виде одного образа**, который включает все основные компоненты стека, собранные вместе:

- **HyperDX UI**
- **Сборщик OpenTelemetry (OTel)**
- **ClickHouse**

Этот универсальный образ позволяет запустить весь стек одной командой, что делает его идеальным для тестирования, экспериментов или быстрых локальных развертываний.

<VerticalStepper headerLevel="h3">

### Развертывание стека с помощью Docker {#deploy-stack-with-docker}

Следующая команда запустит сборщик OpenTelemetry (на портах 4317 и 4318) и HyperDX UI (на порту 8080).

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

:::note Сохранение данных и настроек
Чтобы сохранять данные и настройки при перезапусках контейнера, пользователи могут изменить приведённую выше команду Docker, чтобы примонтировать пути `/data/db`, `/var/lib/clickhouse` и `/var/log/clickhouse-server`.

Например:


```shell
# измените команду, чтобы примонтировать каталоги
docker run \
  -p 8080:8080 \
  -p 4317:4317 \
  -p 4318:4318 \
  -v "$(pwd)/.volumes/db:/data/db" \
  -v "$(pwd)/.volumes/ch_data:/var/lib/clickhouse" \
  -v "$(pwd)/.volumes/ch_logs:/var/log/clickhouse-server" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

:::

### Перейдите к интерфейсу HyperDX {#navigate-to-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы открыть интерфейс HyperDX.

Создайте пользователя, указав имя и пароль, соответствующие требованиям к сложности.

<Image img={hyperdx_login} alt='Интерфейс HyperDX' size='lg' />

HyperDX автоматически подключится к локальному кластеру и создаст источники данных для логов, трассировок, метрик и сеансов, что позволит вам сразу начать работать с продуктом.

### Ознакомьтесь с продуктом {#explore-the-product}

После развертывания стека попробуйте один из наших примерных наборов данных.

Чтобы продолжить использование локального кластера:

- [Примерный набор данных](/use-cases/observability/clickstack/getting-started/sample-data) — загрузите примерный набор данных из нашего публичного демо и проведите диагностику простой проблемы.
- [Локальные файлы и метрики](/use-cases/observability/clickstack/getting-started/local-data) — загрузите локальные файлы и отслеживайте состояние системы на macOS или Linux с помощью локального OTel collector.

<br />
Кроме того, вы можете подключиться к демонстрационному кластеру, где сможете изучать более крупный
набор данных:

- [Удалённый демонстрационный набор данных](/use-cases/observability/clickstack/getting-started/remote-demo-data) — изучите демонстрационный набор данных в нашем демонстрационном сервисе ClickHouse.

</VerticalStepper>


## Развёртывание с ClickHouse Cloud {#deploy-with-clickhouse-cloud}

Пользователи могут развёртывать ClickStack, используя ClickHouse Cloud, получая преимущества полностью управляемого и безопасного бэкенда, при этом сохраняя полный контроль над ингестией, схемой и сценариями наблюдаемости.

<VerticalStepper headerLevel="h3">

### Создайте сервис ClickHouse Cloud {#create-a-service}

Следуйте [руководству по началу работы с ClickHouse Cloud](/getting-started/quick-start/cloud#1-create-a-clickhouse-service), чтобы создать сервис.

### Скопируйте параметры подключения {#copy-cloud-connection-details}

Чтобы найти параметры подключения для HyperDX, перейдите в консоль ClickHouse Cloud и нажмите кнопку <b>Connect</b> на боковой панели. 

Скопируйте параметры HTTP‑подключения, в частности HTTPS endpoint (`endpoint`) и пароль.

<Image img={connect_cloud} alt="Подключение к Cloud" size="md"/>

:::note Развёртывание в продакшн
Хотя в этом примере мы будем использовать пользователя `default` для подключения HyperDX, мы рекомендуем создать отдельного пользователя при [переходе в продакшн](/use-cases/observability/clickstack/production#create-a-user).
:::

### Развёртывание с помощью docker {#deploy-with-docker}

Откройте терминал и экспортируйте скопированные выше учётные данные:

```shell
export CLICKHOUSE_USER=default
export CLICKHOUSE_ENDPOINT=<YOUR HTTPS ENDPOINT>
export CLICKHOUSE_PASSWORD=<YOUR_PASSWORD>
```

Выполните следующую команду docker:

```shell
docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

Будет запущен OTel collector (на портах 4317 и 4318) и веб‑интерфейс HyperDX (на порту 8080).

### Перейдите в интерфейс HyperDX {#navigate-to-hyperdx-ui-cloud}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы получить доступ к интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующий требованиям к сложности. 

<Image img={hyperdx_login} alt="Вход в HyperDX" size="lg"/>

### Создайте подключение к ClickHouse Cloud {#create-a-cloud-connection}

Перейдите в `Team Settings` и нажмите `Edit` для `Local Connection`:

<Image img={edit_connection} alt="Редактирование подключения" size="lg"/>

Переименуйте подключение в `Cloud` и заполните форму, указав учётные данные вашего сервиса ClickHouse Cloud, затем нажмите `Save`:

<Image img={edit_cloud_connection} alt="Создание подключения к Cloud" size="lg"/>

### Изучите продукт {#explore-the-product-cloud}

После развёртывания стека попробуйте один из наших примерных наборов данных.

- [Пример набора данных](/use-cases/observability/clickstack/getting-started/sample-data) — загрузите пример набора данных из нашего публичного демо и продиагностируйте простую проблему.
- [Локальные файлы и метрики](/use-cases/observability/clickstack/getting-started/local-data) — загрузите локальные файлы и отслеживайте состояние системы на OSX или Linux с использованием локального OTel collector.

</VerticalStepper>



## Локальный режим {#local-mode}

Локальный режим — это способ развернуть HyperDX без необходимости аутентификации. 

Аутентификация не поддерживается. 

Этот режим предназначен для быстрого тестирования, разработки, демонстраций и отладки, когда аутентификация и сохранение настроек не требуются.

### Хостируемая версия {#hosted-version}

Вы можете использовать хостируемую версию HyperDX в локальном режиме, доступную по адресу [play.hyperdx.io](https://play.hyperdx.io).

### Самостоятельно размещаемая версия {#self-hosted-version}

<VerticalStepper headerLevel="h3">

### Запуск с помощью Docker {#run-local-with-docker}

Образ локального режима для самостоятельного размещения поставляется с предварительно настроенными коллектором OpenTelemetry и сервером ClickHouse. Это упрощает приём телеметрических данных из ваших приложений и их визуализацию в HyperDX с минимальной внешней настройкой. Чтобы начать работу с самостоятельно размещаемой версией, просто запустите Docker-контейнер с проброшенными нужными портами:

```shell
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

Вам не будет предложено создать пользователя, так как локальный режим не включает аутентификацию.

### Укажите учётные данные для подключения {#complete-connection-credentials}

Чтобы подключиться к собственному **внешнему кластеру ClickHouse**, вы можете вручную ввести свои учётные данные для подключения.

Или, для быстрого ознакомления с продуктом, вы также можете нажать **Connect to Demo Server**, чтобы получить доступ к предварительно загруженным наборам данных и опробовать ClickStack без какой-либо настройки.

<Image img={hyperdx_2} alt="Учётные данные" size="md"/>

При подключении к демонстрационному серверу пользователи могут исследовать набор данных, следуя [инструкциям по демонстрационному набору данных](/use-cases/observability/clickstack/getting-started/remote-demo-data).

</VerticalStepper>

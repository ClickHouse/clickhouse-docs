---
slug: /use-cases/observability/clickstack/getting-started
title: 'Начало работы с ClickStack'
sidebar_label: 'Начало работы'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'Начало работы с ClickStack — стек наблюдаемости ClickHouse'
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

Начать работу с **ClickStack** несложно благодаря готовым Docker-образам. Эти образы созданы на основе официального Debian-пакета ClickHouse и доступны в нескольких вариантах, подходящих для разных сценариев использования.


## Локальное развертывание {#local-deployment}

Самый простой вариант — **дистрибутив в виде одного образа**, который включает все основные компоненты стека:

- **HyperDX UI**
- **Коллектор OpenTelemetry (OTel)**
- **ClickHouse**

Этот универсальный образ позволяет запустить весь стек одной командой, что делает его идеальным для тестирования, экспериментов или быстрого локального развертывания.

<VerticalStepper headerLevel="h3">

### Развертывание стека с помощью Docker {#deploy-stack-with-docker}

Следующая команда запустит коллектор OpenTelemetry (на портах 4317 и 4318) и интерфейс HyperDX UI (на порту 8080).

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

:::note Сохранение данных и настроек
Для сохранения данных и настроек при перезапуске контейнера можно изменить приведенную выше команду docker, добавив монтирование путей `/data/db`, `/var/lib/clickhouse` и `/var/log/clickhouse-server`.

Например:


```shell
# измените команду для монтирования путей
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

### Переход к интерфейсу HyperDX {#navigate-to-hyperdx-ui}

Откройте [http://localhost:8080](http://localhost:8080) для доступа к интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующие требованиям сложности.

<Image img={hyperdx_login} alt='Интерфейс HyperDX' size='lg' />

HyperDX автоматически подключится к локальному кластеру и создаст источники данных для журналов, трассировок, метрик и сессий, что позволит вам сразу же приступить к работе с продуктом.

### Изучение продукта {#explore-the-product}

После развертывания стека попробуйте один из наших примеров наборов данных.

Для продолжения работы с локальным кластером:

- [Пример набора данных](/use-cases/observability/clickstack/getting-started/sample-data) — загрузите пример набора данных из нашей публичной демонстрации. Диагностируйте простую проблему.
- [Локальные файлы и метрики](/use-cases/observability/clickstack/getting-started/local-data) — загрузите локальные файлы и отслеживайте систему на OSX или Linux с помощью локального коллектора OTel.

<br />
В качестве альтернативы вы можете подключиться к демонстрационному кластеру для работы с более крупным набором данных:

- [Удаленный демонстрационный набор данных](/use-cases/observability/clickstack/getting-started/remote-demo-data) — изучите демонстрационный набор данных в нашем демонстрационном сервисе ClickHouse.

</VerticalStepper>


## Развертывание с ClickHouse Cloud {#deploy-with-clickhouse-cloud}

Пользователи могут развернуть ClickStack с ClickHouse Cloud, получая преимущества полностью управляемого защищенного бэкенда при сохранении полного контроля над процессами приема данных, схемой и рабочими процессами наблюдаемости.

<VerticalStepper headerLevel="h3">

### Создание сервиса ClickHouse Cloud {#create-a-service}

Следуйте [руководству по началу работы с ClickHouse Cloud](/getting-started/quick-start/cloud#1-create-a-clickhouse-service), чтобы создать сервис.

### Копирование параметров подключения {#copy-cloud-connection-details}

Чтобы найти параметры подключения для HyperDX, перейдите в консоль ClickHouse Cloud и нажмите кнопку <b>Connect</b> на боковой панели.

Скопируйте параметры HTTP-подключения, а именно HTTPS-эндпоинт (`endpoint`) и пароль.

<Image img={connect_cloud} alt='Подключение к Cloud' size='md' />

:::note Развертывание в продакшене
Хотя мы будем использовать пользователя `default` для подключения HyperDX, рекомендуется создать выделенного пользователя при [переходе в продакшен](/use-cases/observability/clickstack/production#create-a-user).
:::

### Развертывание с помощью Docker {#deploy-with-docker}

Откройте терминал и экспортируйте скопированные выше учетные данные:

```shell
export CLICKHOUSE_USER=default
export CLICKHOUSE_ENDPOINT=<YOUR HTTPS ENDPOINT>
export CLICKHOUSE_PASSWORD=<YOUR_PASSWORD>
```

Выполните следующую команду Docker:

```shell
docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

Это откроет доступ к коллектору OpenTelemetry (на портах 4317 и 4318) и пользовательскому интерфейсу HyperDX (на порту 8080).

### Переход к пользовательскому интерфейсу HyperDX {#navigate-to-hyperdx-ui-cloud}

Перейдите по адресу [http://localhost:8080](http://localhost:8080) для доступа к пользовательскому интерфейсу HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующие требованиям сложности.

<Image img={hyperdx_login} alt='Вход в HyperDX' size='lg' />

### Создание подключения к ClickHouse Cloud {#create-a-cloud-connection}

Перейдите в `Team Settings` и нажмите `Edit` для `Local Connection`:

<Image img={edit_connection} alt='Редактирование подключения' size='lg' />

Переименуйте подключение в `Cloud` и заполните форму учетными данными вашего сервиса ClickHouse Cloud, затем нажмите `Save`:

<Image img={edit_cloud_connection} alt='Создание подключения к Cloud' size='lg' />

### Изучение продукта {#explore-the-product-cloud}

После развертывания стека попробуйте один из наших наборов данных.

- [Пример набора данных](/use-cases/observability/clickstack/getting-started/sample-data) — загрузите пример набора данных из нашей публичной демонстрации. Диагностируйте простую проблему.
- [Локальные файлы и метрики](/use-cases/observability/clickstack/getting-started/local-data) — загрузите локальные файлы и отслеживайте систему на macOS или Linux с помощью локального коллектора OTel.

</VerticalStepper>


## Локальный режим {#local-mode}

Локальный режим — это способ развертывания HyperDX без необходимости аутентификации.

Аутентификация не поддерживается.

Этот режим предназначен для быстрого тестирования, разработки, демонстраций и отладки в сценариях, где аутентификация и сохранение настроек не требуются.

### Размещенная версия {#hosted-version}

Вы можете использовать размещенную версию HyperDX в локальном режиме, доступную по адресу [play.hyperdx.io](https://play.hyperdx.io).

### Самостоятельно размещаемая версия {#self-hosted-version}

<VerticalStepper headerLevel="h3">

### Запуск с Docker {#run-local-with-docker}

Образ локального режима для самостоятельного размещения поставляется с предварительно настроенными OpenTelemetry collector и сервером ClickHouse. Это упрощает получение телеметрических данных из ваших приложений и их визуализацию в HyperDX при минимальной внешней настройке. Чтобы начать работу с самостоятельно размещаемой версией, просто запустите контейнер Docker с проброшенными соответствующими портами:

```shell
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

Вам не будет предложено создать пользователя, так как локальный режим не включает аутентификацию.

### Заполнение учетных данных подключения {#complete-connection-credentials}

Чтобы подключиться к вашему собственному **внешнему кластеру ClickHouse**, вы можете вручную ввести учетные данные подключения.

В качестве альтернативы, для быстрого ознакомления с продуктом вы также можете нажать **Connect to Demo Server**, чтобы получить доступ к предварительно загруженным наборам данных и попробовать ClickStack без необходимости настройки.

<Image img={hyperdx_2} alt='Учетные данные' size='md' />

При подключении к демонстрационному серверу пользователи могут изучить набор данных с помощью [инструкций по демонстрационному набору данных](/use-cases/observability/clickstack/getting-started/remote-demo-data).

</VerticalStepper>

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

Самый простой вариант — **единый образ** (single-image distribution), который включает все основные компоненты стека, упакованные вместе:

- **HyperDX UI**
- **OTel collector**
- **ClickHouse**

Этот образ «все-в-одном» позволяет запустить полный стек одной командой, что делает его удобным для тестирования, экспериментов или быстрых локальных развертываний.

<VerticalStepper headerLevel="h3">

### Развертывание стека с помощью Docker {#deploy-stack-with-docker}

Следующая команда запустит OTel collector (на портах 4317 и 4318) и HyperDX UI (на порту 8080).

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

:::note Сохранение данных и настроек
Чтобы сохранять данные и настройки между перезапусками контейнера, вы можете изменить приведённую выше команду Docker, чтобы примонтировать пути `/data/db`, `/var/lib/clickhouse` и `/var/log/clickhouse-server`. 

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
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```
:::

### Перейдите в HyperDX UI {#navigate-to-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы получить доступ к HyperDX UI.

Создайте пользователя, указав имя пользователя и пароль, удовлетворяющий требованиям к сложности. 

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

HyperDX автоматически подключится к локальному кластеру и создаст источники данных для логов, трассировок, метрик и сеансов, что позволит вам сразу начать изучать продукт.

### Изучите продукт {#explore-the-product}

После развертывания стека попробуйте один из наших примерных наборов данных.

Чтобы продолжить работу с локальным кластером:

- [Пример набора данных](/use-cases/observability/clickstack/getting-started/sample-data) — загрузите пример набора данных из нашего публичного демо и продиагностируйте простую проблему.
- [Локальные файлы и метрики](/use-cases/observability/clickstack/getting-started/local-data) — загрузите локальные файлы и настройте мониторинг системы на OSX или Linux с использованием локального OTel collector.

<br/>
Либо вы можете подключиться к демо-кластеру, где доступен более крупный набор данных: 

- [Удалённый демонстрационный набор данных](/use-cases/observability/clickstack/getting-started/remote-demo-data) — изучите демо-набор данных в нашем демо-сервисе ClickHouse.

</VerticalStepper>

## Развертывание с ClickHouse Cloud {#deploy-with-clickhouse-cloud}

Пользователи могут развернуть ClickStack с использованием ClickHouse Cloud, получая полностью управляемый и защищённый бэкенд при сохранении полного контроля над ингестией, схемой и процессами наблюдаемости.

<VerticalStepper headerLevel="h3">

### Создание сервиса ClickHouse Cloud {#create-a-service}

Следуйте [руководству по началу работы с ClickHouse Cloud](/getting-started/quick-start/cloud#1-create-a-clickhouse-service), чтобы создать сервис.

### Копирование параметров подключения {#copy-cloud-connection-details}

Чтобы найти параметры подключения для HyperDX, перейдите в консоль ClickHouse Cloud и нажмите кнопку <b>Connect</b> на боковой панели. 

Скопируйте параметры HTTP-подключения, в частности HTTPS-эндпойнт (`endpoint`) и пароль.

<Image img={connect_cloud} alt="Connect Cloud" size="md"/>

:::note Развертывание в продакшене
Хотя для подключения HyperDX мы будем использовать пользователя `default`, мы рекомендуем создать выделенного пользователя при [переходе в продакшн](/use-cases/observability/clickstack/production#create-a-user).
:::

### Развертывание с помощью Docker {#deploy-with-docker}

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

Будет запущен OTel collector (на портах 4317 и 4318), а также интерфейс HyperDX (на порту 8080).

### Переход в интерфейс HyperDX {#navigate-to-hyperdx-ui-cloud}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы открыть интерфейс HyperDX.

Создайте пользователя, указав имя пользователя и пароль, соответствующий требованиям к сложности. 

<Image img={hyperdx_login} alt="HyperDX Login" size="lg"/>

### Создание подключения к ClickHouse Cloud {#create-a-cloud-connection}

Перейдите в `Team Settings` и нажмите `Edit` для `Local Connection`:

<Image img={edit_connection} alt="Edit Connection" size="lg"/>

Переименуйте подключение в `Cloud` и заполните форму учётными данными вашего сервиса ClickHouse Cloud, затем нажмите `Save`:

<Image img={edit_cloud_connection} alt="Create Cloud connection" size="lg"/>

### Изучение продукта {#explore-the-product-cloud}

После развертывания стека попробуйте один из наших примерных наборов данных.

- [Пример набора данных](/use-cases/observability/clickstack/getting-started/sample-data) — загрузите пример набора данных из нашего публичного демо и продиагностируйте простую проблему.
- [Локальные файлы и метрики](/use-cases/observability/clickstack/getting-started/local-data) — загрузите локальные файлы и отслеживайте состояние системы на OSX или Linux, используя локальный OTel collector.

</VerticalStepper>

## Локальный режим {#local-mode}

Локальный режим — это способ развернуть HyperDX без необходимости проходить аутентификацию. 

Аутентификация в этом режиме не поддерживается. 

Этот режим предназначен для быстрого тестирования, разработки, демонстраций и отладки, когда аутентификация и сохранение настроек не требуются.

### Облачная версия {#hosted-version}

Вы можете использовать облачную версию HyperDX в локальном режиме, доступную по адресу [play.hyperdx.io](https://play.hyperdx.io).

### Самостоятельно размещаемая версия {#self-hosted-version}

<VerticalStepper headerLevel="h3">

### Запуск с помощью Docker {#run-local-with-docker}

Локальный образ в режиме самостоятельного размещения также поставляется с преднастроенными коллектором OpenTelemetry и сервером ClickHouse. Это упрощает приём телеметрических данных из ваших приложений и их визуализацию в HyperDX при минимальных внешних настройках. Чтобы начать работу с этой версией, просто запустите контейнер Docker с пробросом необходимых портов:

```shell
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

Вам не будет предложено создать пользователя, так как локальный режим не включает аутентификацию.

### Полные реквизиты подключения {#complete-connection-credentials}

Чтобы подключиться к своему **внешнему кластеру ClickHouse**, вы можете вручную ввести реквизиты подключения.

Либо, для быстрой оценки продукта, вы можете нажать **Connect to Demo Server**, чтобы получить доступ к предзагруженным наборам данных и опробовать ClickStack без какой-либо настройки.

<Image img={hyperdx_2} alt="Реквизиты подключения" size="md"/>

При подключении к демо-серверу пользователи могут изучать набор данных, следуя [инструкциям по демонстрационному набору данных](/use-cases/observability/clickstack/getting-started/remote-demo-data).

</VerticalStepper>
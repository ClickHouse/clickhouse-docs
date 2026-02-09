---
slug: /use-cases/observability/clickstack/getting-started/oss
title: 'Начало работы с Open Source ClickStack'
sidebar_label: 'Open Source'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'Начало работы с Open Source ClickStack'
doc_type: 'guide'
keywords: ['ClickStack Open Source', 'начало работы', 'развертывание в Docker', 'HyperDX UI', 'локальное развертывание']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx-1.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import add_connection from '@site/static/images/use-cases/observability/add_connection.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import edit_cloud_connection from '@site/static/images/use-cases/observability/edit_cloud_connection.png';
import delete_source from '@site/static/images/use-cases/observability/delete_source.png';
import delete_connection from '@site/static/images/use-cases/observability/delete_connection.png';
import created_sources from '@site/static/images/use-cases/observability/created_sources.png';
import edit_connection from '@site/static/images/use-cases/observability/edit_connection.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Для развертывания **ClickStack Open Source**, при котором вы самостоятельно запускаете и управляете ClickHouse и интерфейсом ClickStack, мы предоставляем предварительно собранные образы Docker, которые объединяют UI, коллектор OpenTelemetry и ClickHouse в один контейнер, что упрощает старт локальной разработки, тестирования и самоуправляемых развертываний.

Эти образы основаны на официальном Debian-пакете ClickHouse и доступны в нескольких вариантах дистрибутивов для разных сценариев использования.

Самый простой вариант — это дистрибутив с единым образом, который включает все основные компоненты стека, объединённые вместе:

* **HyperDX UI**
* **коллектор OpenTelemetry (OTel)**
* **ClickHouse**

Этот образ «всё-в-одном» позволяет запустить полный стек одной командой, что делает его идеальным для тестирования, экспериментов или быстрых локальных развертываний.


<VerticalStepper headerLevel="h2">

## Развертывание стека с помощью Docker \{#deploy-stack-with-docker\}

Следующая команда запустит OTel collector (на портах 4317 и 4318), интерфейс HyperDX (на порту 8080) и ClickHouse (на порту 8123).

```shell
docker run --name clickstack -p 8123:8123 -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest clickstack
```

:::note Обновление имени образа
Образы ClickStack теперь публикуются как `clickhouse/clickstack-*` (ранее `docker.hyperdx.io/hyperdx/*`).
:::

:::tip Сохранение данных и настроек
Чтобы сохранять данные и настройки между перезапусками контейнера, вы можете изменить указанную выше команду docker run, примонтировав каталоги `/data/db`, `/var/lib/clickhouse` и `/var/log/clickhouse-server`. 

Например:

```shell
# modify command to mount paths
docker run \
  --name clickstack
  -p 8123:8123 \
  -p 8080:8080 \
  -p 4317:4317 \
  -p 4318:4318 \
  -v "$(pwd)/.volumes/db:/data/db" \
  -v "$(pwd)/.volumes/ch_data:/var/lib/clickhouse" \
  -v "$(pwd)/.volumes/ch_logs:/var/log/clickhouse-server" \
  clickhouse/clickstack-all-in-one:latest
```
:::

## Перейдите в ClickStack UI \{#navigate-to-hyperdx-ui\}

Откройте [http://localhost:8080](http://localhost:8080), чтобы перейти в ClickStack UI (HyperDX).

Создайте пользователя, указав имя и пароль, соответствующие требованиям к сложности. 

<Image img={hyperdx_login} alt="Интерфейс HyperDX" size="lg"/>

HyperDX автоматически подключится к локальному кластеру и создаст источники данных для логов, трейсов, метрик и сессий, что позволит вам сразу же начать работать с продуктом.

## Изучите продукт \{#explore-the-product\}

После развертывания стека попробуйте один из наших примерных наборов данных.

Чтобы продолжить работу с локальным кластером:

- [Примерный набор данных](/use-cases/observability/clickstack/getting-started/sample-data) — загрузите примерный набор данных из нашего публичного демо и диагностируйте простую проблему.
- [Локальные файлы и метрики](/use-cases/observability/clickstack/getting-started/local-data) — загрузите локальные файлы и мониторьте систему на macOS или Linux с использованием локального OTel collector.

<br/>
Либо вы можете подключиться к демо-кластеру, чтобы изучить более крупный набор данных: 

- [Удалённый демо-набор данных](/use-cases/observability/clickstack/getting-started/remote-demo-data) — изучите демо-набор данных в нашем демо-сервисе ClickHouse.

</VerticalStepper>

## Альтернативные варианты развертывания \{#alternative-deployment-models\}

### Локальный режим \{#local-mode\}

Локальный режим — это вариант развертывания HyperDX, не требующий аутентификации. 

**Аутентификация не поддерживается**. 

Этот режим предназначен для быстрого тестирования, разработки, демонстраций и отладки в сценариях, когда аутентификация и сохранение настроек не требуются.

Для получения дополнительной информации об этой модели развертывания см. раздел ["Только локальный режим"](/use-cases/observability/clickstack/deployment/local-mode-only).

### Облачная версия \{#hosted-version\}

Вы можете использовать облачную версию ClickStack в локальном режиме, доступную по адресу [play-clickstack.clickhouse.com](https://play-clickstack.clickstack.com).

### Самостоятельно развёртываемая версия \{#self-hosted-version\}

<VerticalStepper headerLevel="h3">

### Запуск с помощью Docker \{#run-local-with-docker\}

Образ локального режима для самостоятельного развёртывания включает OpenTelemetry collector, ClickStack UI и заранее сконфигурированный сервер ClickHouse. Это упрощает приём телеметрии из ваших приложений и её визуализацию при минимальной внешней настройке. Чтобы начать работу с самостоятельно развёртываемой версией, просто запустите Docker-контейнер с проброшенными соответствующими портами:

```shell
docker run -p 8080:8080 clickhouse/clickstack-local:latest
```

В отличие от образа «All in one», вам не будет предложено создать пользователя, так как **в локальном режиме аутентификация отсутствует**.

### Указание реквизитов подключения \{#complete-connection-credentials\}

Чтобы подключиться к **внешнему кластеру ClickHouse**, вы можете вручную ввести реквизиты подключения.

Либо для быстрого знакомства с продуктом вы можете нажать **Connect to Demo Server**, чтобы получить доступ к заранее загруженным наборам данных и опробовать ClickStack без необходимости настройки.

<Image img={hyperdx_2} alt="Credentials" size="md"/>

При подключении к демонстрационному серверу вы можете исследовать набор данных, используя [инструкции по демонстрационному набору данных](/use-cases/observability/clickstack/getting-started/remote-demo-data).

</VerticalStepper>
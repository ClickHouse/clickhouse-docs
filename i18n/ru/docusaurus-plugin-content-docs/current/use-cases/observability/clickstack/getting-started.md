---
'slug': '/use-cases/observability/clickstack/getting-started'
'title': 'Начало работы с ClickStack'
'sidebar_label': 'Начало работы'
'pagination_prev': null
'pagination_next': 'use-cases/observability/clickstack/example-datasets/index'
'description': 'Начало работы с ClickStack - Стек мониторинга ClickHouse'
'doc_type': 'guide'
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

Начало работы с **ClickStack** просто благодаря доступности предустановленных образов Docker. Эти образы основаны на официальном Debian пакете ClickHouse и доступны в нескольких дистрибутивах, чтобы соответствовать различным сценариям использования.

## Локальное развертывание {#local-deployment}

Самый простой вариант - это **дистрибутив с одним образом**, который включает все основные компоненты стека в одном пакете:

- **HyperDX UI**
- **OpenTelemetry (OTel) collector**
- **ClickHouse**

Этот универсальный образ позволяет вам запустить весь стек одной командой, что делает его идеальным для тестирования, экспериментов или быстрого развертывания локально.

<VerticalStepper headerLevel="h3">

### Развертывание стека с помощью docker {#deploy-stack-with-docker}

Следующая команда запустит collector OpenTelemetry (на портах 4317 и 4318) и HyperDX UI (на порту 8080).

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

:::note Сохранение данных и настроек
Чтобы сохранить данные и настройки между перезапусками контейнера, пользователи могут изменить вышеуказанную команду docker, чтобы смонтировать пути `/data/db`, `/var/lib/clickhouse` и `/var/log/clickhouse-server`. 

Например:

```shell

# modify command to mount paths
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

### Переход к HyperDX UI {#navigate-to-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы получить доступ к HyperDX UI.

Создайте пользователя, указав имя пользователя и пароль, соответствующие требованиям к сложности. 

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

HyperDX автоматически подключится к локальному кластеру и создаст источники данных для логов, трассировок, метрик и сессий - позволяя вам сразу же исследовать продукт.

### Исследуйте продукт {#explore-the-product}

С развернутым стеком попробуйте один из наших наборов данных.

Чтобы продолжить использование локального кластера:

- [Пример набора данных](/use-cases/observability/clickstack/getting-started/sample-data) - Загрузите пример набора данных из нашей публичной демонстрации. Диагностируйте простую проблему.
- [Локальные файлы и метрики](/use-cases/observability/clickstack/getting-started/local-data) - Загрузите локальные файлы и мониторьте систему на OSX или Linux, используя локальный OTel collector.

<br/>
Кроме того, вы можете подключиться к демо-кластеру, где вы сможете исследовать более крупный набор данных: 

- [Дистанционный демонстрационный набор данных](/use-cases/observability/clickstack/getting-started/remote-demo-data) - Исследуйте демонстрационный набор данных в нашем демонстрационном сервисе ClickHouse.

</VerticalStepper>

## Развертывание с ClickHouse Cloud {#deploy-with-clickhouse-cloud}

Пользователи могут развернуть ClickStack в ClickHouse Cloud, извлекая выгоду от полностью управляемого, безопасного бэкенда, сохраняя полный контроль над потоками приема данных, схемами и рабочими процессами наблюдаемости.

<VerticalStepper headerLevel="h3">

### Создание сервиса ClickHouse Cloud {#create-a-service}

Следуйте [руководству по началу работы с ClickHouse Cloud](/getting-started/quick-start/cloud#1-create-a-clickhouse-service), чтобы создать сервис.

### Скопируйте детали подключения {#copy-cloud-connection-details}

Чтобы найти детали подключения для HyperDX, перейдите в консоль ClickHouse Cloud и нажмите кнопку <b>Connect</b> на боковой панели. 

Скопируйте детали HTTP подключения, в частности, HTTPS конечную точку (`endpoint`) и пароль.

<Image img={connect_cloud} alt="Connect Cloud" size="md"/>

:::note Развертывание в производственной среде
Хотя мы будем использовать пользователя `default` для подключения HyperDX, мы рекомендуем создать выделенного пользователя, когда [вы переходите в производство](/use-cases/observability/clickstack/production#create-a-user).
:::

### Развертывание с помощью docker {#deploy-with-docker}

Откройте терминал и экспортируйте учетные данные, скопированные выше:

```shell
export CLICKHOUSE_USER=default
export CLICKHOUSE_ENDPOINT=<YOUR HTTPS ENDPOINT>
export CLICKHOUSE_PASSWORD=<YOUR_PASSWORD>
```

Запустите следующую команду docker:

```shell
docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

Это откроет collector OpenTelemetry (на портах 4317 и 4318) и HyperDX UI (на порту 8080).

### Переход к HyperDX UI {#navigate-to-hyperdx-ui-cloud}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы получить доступ к HyperDX UI.

Создайте пользователя, указав имя пользователя и пароль, которые соответствуют требованиям к сложности. 

<Image img={hyperdx_login} alt="HyperDX Login" size="lg"/>

### Создание соединения ClickHouse Cloud {#create-a-cloud-connection}

Перейдите в `Team Settings` и нажмите `Edit` для `Local Connection`:

<Image img={edit_connection} alt="Edit Connection" size="lg"/>

Переименуйте соединение в `Cloud` и заполните последующую форму с вашими учетными данными сервиса ClickHouse Cloud перед нажатием `Save`:

<Image img={edit_cloud_connection} alt="Create Cloud connection" size="lg"/>

### Исследуйте продукт {#explore-the-product-cloud}

С развернутым стеком попробуйте один из наших наборов данных.

- [Пример набора данных](/use-cases/observability/clickstack/getting-started/sample-data) - Загрузите пример набора данных из нашей публичной демонстрации. Диагностируйте простую проблему.
- [Локальные файлы и метрики](/use-cases/observability/clickstack/getting-started/local-data) - Загрузите локальные файлы и мониторьте систему на OSX или Linux, используя локальный OTel collector.

</VerticalStepper>

## Локальный режим {#local-mode}

Локальный режим - это способ развертывания HyperDX без необходимости аутентификации. 

Аутентификация не поддерживается. 

Этот режим предназначен для быстрого тестирования, разработки, демонстраций и отладки случаев, когда аутентификация и сохранение настроек не являются необходимыми.

### Хостимая версия {#hosted-version}

Вы можете использовать хостимую версию HyperDX в локальном режиме, доступную по адресу [play.hyperdx.io](https://play.hyperdx.io).

### Самостоятельно размещаемая версия {#self-hosted-version}

<VerticalStepper headerLevel="h3">

### Запуск с помощью docker {#run-local-with-docker}

Образ локального режима самоуправляемой версии поставляется с предварительно настроенным OpenTelemetry collector и сервером ClickHouse. Это упрощает прием телеметрических данных из ваших приложений и их визуализацию в HyperDX с минимальной настройкой. Чтобы начать работу с самоуправляемой версией, просто запустите контейнер Docker с нужными перенаправлениями портов:

```shell
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

Вас не попросят создать пользователя, поскольку локальный режим не включает аутентификацию.

### Завершение учетных данных подключения {#complete-connection-credentials}

Чтобы подключиться к своему **внешнему кластеру ClickHouse**, вы можете вручную ввести свои учетные данные подключения.

Кроме того, для быстрого исследования продукта вы также можете нажать **Connect to Demo Server**, чтобы получить доступ к предзагруженным наборам данных и попробовать ClickStack без необходимости в настройке.

<Image img={hyperdx_2} alt="Credentials" size="md"/>

Если вы подключаетесь к демо-серверу, пользователи могут исследовать набор данных с помощью [инструкций по демонстрационному набору данных](/use-cases/observability/clickstack/getting-started/remote-demo-data).

</VerticalStepper>

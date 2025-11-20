---
slug: /use-cases/observability/clickstack/sdks/python
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'Python для ClickStack — стека наблюдаемости ClickHouse'
title: 'Python'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack использует стандарт OpenTelemetry для сбора телеметрических данных (логов и
трейсов). Трейсы генерируются автоматически с помощью автоматической инструментации, поэтому ручная
инструментация не требуется, чтобы извлечь пользу из трассировки.

Это руководство охватывает:

* **Логи**
* **Метрики**
* **Трейсы**


## Начало работы {#getting-started}

### Установка пакета инструментирования ClickStack OpenTelemetry {#install-clickstack-otel-instrumentation-package}

Используйте следующую команду для установки [пакета ClickStack OpenTelemetry](https://pypi.org/project/hyperdx-opentelemetry/).

```shell
pip install hyperdx-opentelemetry
```

Установите библиотеки автоматического инструментирования OpenTelemetry для пакетов, используемых вашим Python-приложением. Рекомендуется использовать
инструмент `opentelemetry-bootstrap`, входящий в состав OpenTelemetry Python SDK, для сканирования пакетов приложения и формирования списка доступных библиотек.

```shell
opentelemetry-bootstrap -a install
```

### Настройка переменных окружения {#configure-environment-variables}

После этого необходимо настроить следующие переменные окружения в вашей оболочке для отправки телеметрии в ClickStack:

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

_Переменная окружения `OTEL_SERVICE_NAME` используется для идентификации вашего сервиса в приложении HyperDX. Вы можете указать любое имя._

### Запуск приложения с агентом OpenTelemetry Python {#run-the-application-with-otel-python-agent}

Теперь можно запустить приложение с агентом OpenTelemetry Python (`opentelemetry-instrument`).

```shell
opentelemetry-instrument python app.py
```

#### Если вы используете `Gunicorn`, `uWSGI` или `uvicorn` {#using-uvicorn-gunicorn-uwsgi}

В этом случае для работы агента OpenTelemetry Python потребуются дополнительные изменения.

Для настройки OpenTelemetry на серверах приложений, использующих режим веб-сервера с предварительным форком (pre-fork), необходимо вызвать метод `configure_opentelemetry` внутри хука post-fork.

<Tabs groupId="python-alternative">
<TabItem value="gunicorn" label="Gunicorn" default>

```python
from hyperdx.opentelemetry import configure_opentelemetry

def post_fork(server, worker):
    configure_opentelemetry()
```

</TabItem>
<TabItem value="uwsgi" label="uWSGI" default>

```python
from hyperdx.opentelemetry import configure_opentelemetry
from uwsgidecorators import postfork

@postfork
def init_tracing():
    configure_opentelemetry()
```

</TabItem>

<TabItem value="uvicorn" label="uvicorn" default>

OpenTelemetry [в настоящее время не работает](https://github.com/open-telemetry/opentelemetry-python-contrib/issues/385) с `uvicorn` при запуске с флагом `--reload`
или с несколькими воркерами (`--workers`). Рекомендуется отключить эти флаги во время тестирования или использовать Gunicorn.

</TabItem>

</Tabs>


## Расширенная конфигурация {#advanced-configuration}

#### Захват сетевого трафика {#network-capture}

Включив функции захвата сетевого трафика, разработчики получают возможность эффективно отлаживать
заголовки HTTP-запросов и содержимое тела запросов. Для этого достаточно
установить флаг `HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE` в значение 1.

```shell
export HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE=1
```


## Устранение неполадок {#troubleshooting}

### Логи не отображаются из-за уровня логирования {#logs-not-appearing-due-to-log-level}

По умолчанию обработчик логирования OpenTelemetry использует уровень `logging.NOTSET`, который
по умолчанию соответствует уровню WARNING. Вы можете указать уровень логирования при создании
логгера:

```python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
```

### Экспорт в консоль {#exporting-to-the-console}

OpenTelemetry Python SDK обычно выводит ошибки в консоль при их
возникновении. Однако если вы не сталкиваетесь с ошибками, но замечаете, что данные
не появляются в HyperDX, как ожидалось, вы можете включить режим отладки.
При активации режима отладки вся телеметрия будет выводиться в консоль,
что позволит вам проверить, правильно ли инструментировано ваше приложение и содержит ли оно
ожидаемые данные.

```shell
export DEBUG=true
```

Подробнее об инструментировании Python с помощью OpenTelemetry читайте здесь:
[https://opentelemetry.io/docs/instrumentation/python/manual/](https://opentelemetry.io/docs/instrumentation/python/manual/)

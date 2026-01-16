---
slug: /use-cases/observability/clickstack/sdks/python
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'Python для ClickStack — стек наблюдаемости ClickHouse'
title: 'Python'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'логирование', 'интеграция', 'мониторинг приложений']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack использует стандарт OpenTelemetry для сбора телеметрических данных (логов и
трассировок). Трассировки генерируются автоматически при помощи автоматической инструментализации, поэтому ручная
инструментализация не нужна, чтобы извлечь пользу из трассировки.

В этом руководстве рассматривается интеграция:

* **Логи**
* **Метрики**
* **Трассировки**

## Начало работы \\{#getting-started\\}

### Установите пакет инструментирования ClickStack OpenTelemetry \\{#install-clickstack-otel-instrumentation-package\\}

Выполните следующую команду, чтобы установить [пакет ClickStack OpenTelemetry](https://pypi.org/project/hyperdx-opentelemetry/).

```shell
pip install hyperdx-opentelemetry
```

Установите библиотеки автоматической инструментации OpenTelemetry для пакетов, используемых вашим Python‑приложением. Мы рекомендуем использовать инструмент `opentelemetry-bootstrap`, который поставляется с OpenTelemetry Python SDK, для сканирования пакетов вашего приложения и генерации списка доступных библиотек.

```shell
opentelemetry-bootstrap -a install
```

### Настройте переменные окружения \\{#configure-environment-variables\\}

Далее в оболочке необходимо задать следующие переменные окружения, чтобы отправлять телеметрию в ClickStack:

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 
```

*Переменная окружения `OTEL_SERVICE_NAME` используется для идентификации вашего сервиса в приложении HyperDX. Вы можете задать ей любое удобное вам имя.*

### Запуск приложения с Python-агентом OpenTelemetry \\{#run-the-application-with-otel-python-agent\\}

Теперь вы можете запустить приложение с Python-агентом OpenTelemetry (`opentelemetry-instrument`).

```shell
opentelemetry-instrument python app.py
```

#### Если вы используете `Gunicorn`, `uWSGI` или `uvicorn` \\{#using-uvicorn-gunicorn-uwsgi\\}

В этом случае для корректной работы агента OpenTelemetry для Python потребуются дополнительные изменения. 

Чтобы настроить OpenTelemetry для серверов приложений, использующих режим веб-сервера pre-fork, убедитесь, что вызываете метод `configure_opentelemetry` внутри хука post-fork.

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

OpenTelemetry [в настоящее время не работает](https://github.com/open-telemetry/opentelemetry-python-contrib/issues/385) с `uvicorn`, запущенным с флагом `--reload` 
или при использовании нескольких воркеров (`--workers`). Рекомендуем отключить эти флаги во время тестирования или использовать Gunicorn.

</TabItem>

</Tabs>

## Расширенная конфигурация \\{#advanced-configuration\\}

#### Захват сетевого трафика \\{#network-capture\\}

Включив функции захвата сетевого трафика, разработчики получают возможность эффективно отлаживать заголовки и тела HTTP‑запросов. Это можно сделать, просто установив флаг `HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE` в 1.

```shell
export HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE=1
```

## Устранение неполадок \\{#troubleshooting\\}

### Логи не отображаются из-за уровня логирования \\{#logs-not-appearing-due-to-log-level\\}

По умолчанию обработчик логирования OpenTelemetry использует уровень `logging.NOTSET`,
который фактически соответствует уровню WARNING. Вы можете указать уровень
логирования при создании логгера:

```python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
```

### Экспорт в консоль \\{#exporting-to-the-console\\}

OpenTelemetry Python SDK обычно отображает ошибки в консоли при их возникновении. Однако если вы не сталкиваетесь с какими-либо ошибками, но замечаете, что ваши данные не появляются в HyperDX, как ожидалось, вы можете включить режим отладки. Когда режим отладки активирован, вся телеметрия будет выводиться в консоль, что позволяет проверить, корректно ли ваше приложение проинструментировано и передаёт ожидаемые данные.

```shell
export DEBUG=true
```

Подробнее об инструментировании Python с OpenTelemetry см. здесь:
[https://opentelemetry.io/docs/instrumentation/python/manual/](https://opentelemetry.io/docs/instrumentation/python/manual/)

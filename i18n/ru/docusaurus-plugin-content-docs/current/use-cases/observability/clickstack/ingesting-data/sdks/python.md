---
'slug': '/use-cases/observability/clickstack/sdks/python'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 7
'description': 'Python для ClickStack - Стек мониторинга ClickHouse'
'title': 'Python'
'doc_type': 'guide'
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack использует стандарт OpenTelemetry для сбора телеметрических данных (журналов и трассировок). Трассировки автоматически генерируются с помощью автоматической инструментировки, поэтому ручная инструментировка не требуется для получения ценности от трассировки.

Этот гид интегрирует:

- **Журналы**
- **Метрики**
- **Трассировки**

## Введение {#getting-started}

### Установка пакета инструментировки ClickStack OpenTelemetry {#install-clickstack-otel-instrumentation-package}

Используйте следующую команду для установки [пакета ClickStack OpenTelemetry](https://pypi.org/project/hyperdx-opentelemetry/).

```shell
pip install hyperdx-opentelemetry
```

Установите библиотеки автоматической инструментировки OpenTelemetry для пакетов, используемых вашим Python приложением. Рекомендуем использовать инструмент `opentelemetry-bootstrap`, который входит в состав OpenTelemetry Python SDK, для сканирования пакетов вашего приложения и генерации списка доступных библиотек.

```shell
opentelemetry-bootstrap -a install
```

### Настройка переменных окружения {#configure-environment-variables}

После этого вам нужно будет настроить следующие переменные окружения в вашей оболочке для отправки телеметрии в ClickStack:

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 
```

_Переменная окружения `OTEL_SERVICE_NAME` используется для идентификации вашего сервиса в приложении HyperDX, она может иметь любое имя, которое вы хотите._

### Запуск приложения с Python-агентом OpenTelemetry {#run-the-application-with-otel-python-agent}

Теперь вы можете запустить приложение с Python-агентом OpenTelemetry (`opentelemetry-instrument`).

```shell
opentelemetry-instrument python app.py
```

#### Если вы используете `Gunicorn`, `uWSGI` или `uvicorn` {#using-uvicorn-gunicorn-uwsgi}

В этом случае Python-агент OpenTelemetry потребует дополнительных изменений для корректной работы. 

Чтобы настроить OpenTelemetry для серверов приложений, использующих режим веб-сервера pre-fork, убедитесь, что вы вызываете метод `configure_opentelemetry` внутри хука post-fork.

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

OpenTelemetry [в настоящее время не работает](https://github.com/open-telemetry/opentelemetry-python-contrib/issues/385) с `uvicorn`, запущенным с флагом `--reload` или с многопоточностью (`--workers`). Мы рекомендуем отключить эти флаги во время тестирования или использовать Gunicorn.

</TabItem>

</Tabs>

## Расширенная настройка {#advanced-configuration}

#### Сетевое захватывание {#network-capture}

Включив функции сетевого захвата, разработчики получают возможность эффективно отлаживать HTTP-заголовки запросов и полезную нагрузку тела. Это можно сделать, просто установив флаг `HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE` в 1.

```shell
export HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE=1
```

## Устранение неполадок {#troubleshooting}

### Журналы не появляются из-за уровня журнала {#logs-not-appearing-due-to-log-level}

По умолчанию обработчик журналирования OpenTelemetry использует уровень `logging.NOTSET`, который по умолчанию соответствует уровню WARNING. Вы можете указать уровень журналирования, когда создаете журнализатор:

```python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
```

### Экспорт в консоль {#exporting-to-the-console}

OpenTelemetry Python SDK обычно отображает ошибки в консоли, когда они возникают. Однако, если вы не сталкиваетесь с ошибками, но замечаете, что ваши данные не появляются в HyperDX, как ожидалось, вы можете включить режим отладки. Когда режим отладки активирован, вся телеметрия будет выводиться в консоль, что позволит вам проверить, правильно ли ваше приложение инструментировано с ожидаемыми данными.

```shell
export DEBUG=true
```

Читать больше о инструментировке OpenTelemetry для Python можно здесь:
[https://opentelemetry.io/docs/instrumentation/python/manual/](https://opentelemetry.io/docs/instrumentation/python/manual/)
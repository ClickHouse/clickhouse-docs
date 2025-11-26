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

ClickStack использует стандарт OpenTelemetry для сбора телеметрических данных (логов и трассировок). Трассировки автоматически создаются с помощью автоинструментирования, поэтому ручное инструментирование не требуется, чтобы извлечь из них пользу.

В этом руководстве рассматривается интеграция:

* **Логов**
* **Метрик**
* **Трассировок**


## Начало работы

### Установите пакет инструментирования OpenTelemetry для ClickStack

Используйте следующую команду, чтобы установить [пакет OpenTelemetry для ClickStack](https://pypi.org/project/hyperdx-opentelemetry/).

```shell
pip install hyperdx-opentelemetry
```

Установите библиотеки автоматической инструментации OpenTelemetry для пакетов, используемых вашим приложением на Python. Мы рекомендуем использовать
инструмент `opentelemetry-bootstrap`, входящий в состав OpenTelemetry Python SDK, чтобы просканировать пакеты вашего приложения и сгенерировать список доступных библиотек.

```shell
opentelemetry-bootstrap -a install
```

### Настройте переменные окружения

Далее необходимо настроить в вашей оболочке следующие переменные окружения для передачи телеметрии в ClickStack:

```shell
export HYPERDX_API_KEY='<ВАШ_КЛЮЧ_API_ИНГЕСТИИ>' \
OTEL_SERVICE_NAME='<НАЗВАНИЕ_ВАШЕГО_ПРИЛОЖЕНИЯ_ИЛИ_СЕРВИСА>' \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 
```

*Переменная окружения `OTEL_SERVICE_NAME` используется для идентификации вашего сервиса в приложении HyperDX, она может иметь любое удобное для вас имя.*

### Запуск приложения с агентом OpenTelemetry для Python

Теперь вы можете запустить приложение с агентом OpenTelemetry для Python (`opentelemetry-instrument`).

```shell
opentelemetry-instrument python app.py
```

#### Если вы используете `Gunicorn`, `uWSGI` или `uvicorn`

В этом случае для корректной работы агент OpenTelemetry для Python потребует дополнительных изменений.

Чтобы настроить OpenTelemetry для серверов приложений, использующих префорк‑режим веб-сервера, обязательно вызывайте метод `configure_opentelemetry` в post-fork хуке.

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
    или с несколькими рабочими процессами (`--workers`). Мы рекомендуем отключить эти флаги во время тестирования или использовать Gunicorn.
  </TabItem>
</Tabs>


## Расширенная конфигурация

#### Перехват сетевого трафика

Включение функций перехвата сетевого трафика позволяет разработчикам эффективно отлаживать HTTP-запросы — как заголовки, так и тело. Это можно сделать, просто установив флаг `HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE` в 1.

```shell
export HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE=1
```


## Устранение неполадок

### Логи не появляются из‑за уровня логирования

По умолчанию обработчик логирования OpenTelemetry использует уровень `logging.NOTSET`,
который по умолчанию соответствует уровню WARNING. Вы можете задать уровень
логирования при создании логгера:

```python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
```

### Экспорт в консоль

OpenTelemetry Python SDK обычно выводит ошибки в консоль по мере их возникновения. Однако если ошибок нет, но вы замечаете, что ваши данные не появляются в HyperDX, как ожидается, вы можете включить режим отладки. Когда режим отладки активирован, все телеметрические данные будут выводиться в консоль, что позволит вам проверить, корректно ли инструментировано ваше приложение и содержит ли оно ожидаемые данные.

```shell
export DEBUG=true
```

Подробнее об инструментировании Python с помощью OpenTelemetry см. по ссылке:
[https://opentelemetry.io/docs/instrumentation/python/manual/](https://opentelemetry.io/docs/instrumentation/python/manual/)

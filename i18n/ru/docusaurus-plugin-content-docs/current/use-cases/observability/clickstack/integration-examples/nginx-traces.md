---
slug: /use-cases/observability/clickstack/integrations/nginx-traces
title: 'Мониторинг трассировок Nginx с помощью ClickStack'
sidebar_label: 'Трассировки Nginx'
pagination_prev: null
pagination_next: null
description: 'Мониторинг трассировок Nginx с помощью ClickStack'
doc_type: 'guide'
keywords: ['ClickStack', 'Nginx', 'traces', 'otel']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/finish-nginx-traces-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/nginx-traces-dashboard.png';
import view_traces from '@site/static/images/clickstack/nginx-traces-search-view.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Мониторинг трассировок Nginx с помощью ClickStack {#nginx-traces-clickstack}

:::note[Краткое содержание]
Это руководство показывает, как собирать распределённые трассировки из существующей установки Nginx и визуализировать их в ClickStack. Вы узнаете:

- Как добавить модуль OpenTelemetry в Nginx
- Как настроить Nginx для отправки трассировок на OTLP-эндпоинт ClickStack
- Как проверить, что трассировки отображаются в HyperDX
- Как использовать готовый дашборд для визуализации производительности запросов (задержка, ошибки, пропускная способность)

Демонстрационный набор данных с примерами трассировок доступен, если вы хотите протестировать интеграцию перед настройкой продакшн-окружения Nginx.

Требуемое время: 5–10 минут
::::


## Интеграция с существующим Nginx {#existing-nginx}

В этом разделе рассматривается добавление распределённой трассировки в существующую установку Nginx путём установки модуля OpenTelemetry и его настройки для отправки трассировок в ClickStack.
Если вы хотите протестировать интеграцию перед настройкой собственной конфигурации, можно воспользоваться нашей предварительно настроенной конфигурацией и тестовыми данными в [следующем разделе](/use-cases/observability/clickstack/integrations/nginx-traces#demo-dataset).

##### Предварительные требования {#prerequisites}

- Запущенный экземпляр ClickStack с доступными конечными точками OTLP (порты 4317/4318)
- Установленный Nginx (версия 1.18 или выше)
- Доступ root или sudo для изменения конфигурации Nginx
- Имя хоста или IP-адрес ClickStack

<VerticalStepper headerLevel="h4">

#### Установка модуля OpenTelemetry для Nginx {#install-module}

Самый простой способ добавить трассировку в Nginx — использовать официальный образ Nginx со встроенной поддержкой OpenTelemetry.

##### Использование образа nginx:otel {#using-otel-image}

Замените текущий образ Nginx на версию с поддержкой OpenTelemetry:


```yaml
# В файле docker-compose.yml или Dockerfile
image: nginx:1.27-otel
```

Этот образ включает предварительно установленный модуль `ngx_otel_module.so`, готовый к использованию.

:::note
Если вы запускаете Nginx вне Docker, обратитесь к [документации OpenTelemetry для Nginx](https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/nginx) за инструкциями по ручной установке.
:::

#### Настройка Nginx для отправки трейсов в ClickStack {#configure-nginx}

Добавьте конфигурацию OpenTelemetry в файл `nginx.conf`. Эта конфигурация загружает модуль и направляет трейсы на OTLP‑эндпоинт ClickStack.

Сначала получите API‑ключ:

1. Откройте HyperDX по URL вашего ClickStack
2. Перейдите в Settings → API Keys
3. Скопируйте **Ingestion API Key**
4. Задайте его в переменной окружения: `export CLICKSTACK_API_KEY=your-api-key-here`

Добавьте следующее в `nginx.conf`:

```yaml
load_module modules/ngx_otel_module.so;

events {
    worker_connections 1024;
}

http {
    # Конфигурация экспортера OpenTelemetry
    otel_exporter {
        endpoint <clickstack-host>:4317;
        header authorization ${CLICKSTACK_API_KEY};
    }

    # Имя сервиса для идентификации этого экземпляра nginx
    otel_service_name "nginx-proxy";

    # Включить трассировку
    otel_trace on;

    server {
        listen 80;

        location / {
            # Включить трассировку для этого location
            otel_trace_context propagate;
            otel_span_name "$request_method $uri";

            # Добавить детали запроса в трейсы
            otel_span_attr http.status_code $status;
            otel_span_attr http.request.method $request_method;
            otel_span_attr http.route $uri;

            # Ваша текущая конфигурация прокси или приложения
            proxy_pass http://your-backend;
        }
    }
}
```

Если вы запускаете Nginx в Docker, передайте переменную окружения в контейнер:

```yaml
services:
  nginx:
    image: nginx:1.27-otel
    environment:
      - CLICKSTACK_API_KEY=${CLICKSTACK_API_KEY}
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

Замените `<clickstack-host>` на имя хоста или IP‑адрес вашего экземпляра ClickStack.

:::note

- **Порт 4317** — это gRPC‑эндпоинт, используемый модулем Nginx
- **otel_service_name** должен описывать ваш экземпляр Nginx (например, «api-gateway», «frontend-proxy»)
- Измените **otel_service_name** в соответствии с вашей средой, чтобы упростить идентификацию в HyperDX
  :::

##### Разбор конфигурации {#understanding-configuration}

**Что попадает в трассировку:**
Каждый запрос к Nginx создаёт спан трассировки, который показывает:

- Метод и путь запроса
- Код состояния HTTP
- Длительность запроса
- Метку времени

**Атрибуты спанов:**
Директивы `otel_span_attr` добавляют метаданные к каждому трейсу, что позволяет фильтровать и анализировать запросы в HyperDX по коду состояния, методу, маршруту и т.д.

После внесения этих изменений проверьте конфигурацию Nginx:

```bash
nginx -t
```


Если проверка прошла успешно, перезагрузите Nginx:

```bash
# Для Docker
docker-compose restart nginx
```


# Для systemd

sudo systemctl reload nginx

```

#### Проверка трассировок в HyperDX {#verifying-traces}

После настройки войдите в HyperDX и убедитесь, что трассировки поступают. Вы должны увидеть примерно следующее. Если трассировки не отображаются, попробуйте настроить временной диапазон:

<Image img={view_traces} alt="Просмотр трассировок"/>

</VerticalStepper>
```


## Демонстрационный набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию трассировки nginx перед настройкой производственных систем, мы предоставляем демонстрационный набор данных с предварительно сгенерированными трассировками Nginx, имитирующими реалистичные паттерны трафика.

<VerticalStepper headerLevel="h4">

#### Запуск ClickStack {#start-clickstack}

Если ClickStack еще не запущен, запустите его следующей командой:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

Подождите около 30 секунд, пока ClickStack полностью инициализируется, прежде чем продолжить.

- Порт 8080: веб-интерфейс HyperDX
- Порт 4317: конечная точка OTLP gRPC (используется модулем nginx)
- Порт 4318: конечная точка OTLP HTTP (используется для демонстрационных трассировок)

#### Загрузка демонстрационного набора данных {#download-sample}

Загрузите файл с демонстрационными трассировками и обновите временные метки до текущего времени:


```bash
# Download the traces
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nginx-traces-sample.json
```

Набор данных включает:

- 1000 спанов трассировки с реалистичными временными характеристиками
- 9 различных эндпоинтов с разнообразными паттернами трафика
- ~93% успешных запросов (200), ~3% клиентских ошибок (404), ~4% серверных ошибок (500)
- Задержки в диапазоне от 10 мс до 800 мс
- Исходные паттерны трафика сохранены и смещены к текущему времени

#### Отправка трассировок в ClickStack {#send-traces}

Установите ваш API-ключ в качестве переменной окружения (если он еще не установлен):

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

**Получение API-ключа:**

1. Откройте HyperDX по URL вашего ClickStack
2. Перейдите в Settings → API Keys
3. Скопируйте ваш **Ingestion API Key**

Затем отправьте трассировки в ClickStack:

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nginx-traces-sample.json
```

:::note[Запуск на localhost]
В этой демонстрации предполагается, что ClickStack запущен локально на `localhost:4318`. Для удаленных экземпляров замените `localhost` на имя хоста вашего ClickStack.
:::

Вы должны увидеть ответ вида `{"partialSuccess":{}}`, указывающий на успешную отправку трассировок. Все 1000 трассировок будут загружены в ClickStack.

#### Проверка трассировок в HyperDX {#verify-demo-traces}

1. Откройте [HyperDX](http://localhost:8080/) и войдите в свою учетную запись (возможно, сначала потребуется создать учетную запись)
2. Перейдите в представление Search и установите источник `Traces`
3. Установите временной диапазон **2025-10-25 13:00:00 - 2025-10-28 13:00:00**

Вот что вы должны увидеть в представлении поиска:

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демонстрационные данные охватывают период **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)**. Широкий временной диапазон гарантирует, что вы увидите демонстрационные трассировки независимо от вашего местоположения. После того как вы увидите трассировки, вы можете сузить диапазон до 24-часового периода для более четкой визуализации.
:::

<Image img={view_traces} alt='Просмотр трассировок' />

</VerticalStepper>


## Панели мониторинга и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг трассировок с помощью ClickStack, мы предоставляем основные визуализации для данных трассировки.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-traces-dashboard.json')} download="nginx-traces-dashboard.json" eventName="docs.nginx_traces_monitoring.dashboard_download">Скачайте</TrackedLink> конфигурацию панели мониторинга {#download}

#### Импортируйте готовую панель мониторинга {#import-dashboard}

1. Откройте HyperDX и перейдите в раздел Dashboards.
2. Нажмите «Import Dashboard» в правом верхнем углу под многоточием.

<Image img={import_dashboard} alt='Импорт панели мониторинга' />

3. Загрузите файл nginx-trace-dashboard.json и нажмите «finish import».

<Image img={finish_import} alt='Завершение импорта' />

#### Панель мониторинга будет создана со всеми предварительно настроенными визуализациями. {#created-dashboard}

:::note
Для демонстрационного набора данных установите временной диапазон **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** (скорректируйте в соответствии с вашим часовым поясом). Импортированная панель мониторинга по умолчанию не будет иметь указанного временного диапазона.
:::

<Image img={example_dashboard} alt='Пример панели мониторинга' />

</VerticalStepper>


## Устранение неполадок {#troubleshooting}

### Трассировки не отображаются в HyperDX {#no-traces}

**Проверьте, что модуль nginx загружен:**

```bash
nginx -V 2>&1 | grep otel
```

Вы должны увидеть упоминания модуля OpenTelemetry.

**Проверьте сетевое подключение:**

```bash
telnet <clickstack-host> 4317
```

Команда должна успешно подключиться к конечной точке OTLP gRPC.

**Проверьте, что API-ключ установлен:**

```bash
echo $CLICKSTACK_API_KEY
```

Команда должна вывести ваш API-ключ (не пустое значение).


**Проверьте журнал ошибок nginx:**

```bash
# Для Docker
docker logs <nginx-container> 2>&1 | grep -i otel
```


# Для systemd

sudo tail -f /var/log/nginx/error.log | grep -i otel

```
Проверьте наличие ошибок, связанных с OpenTelemetry.
```


**Проверьте, что Nginx принимает запросы:**

```bash
# Проверьте журналы доступа для подтверждения трафика
tail -f /var/log/nginx/access.log
```


## Следующие шаги {#next-steps}

Если вы хотите продолжить изучение, вот несколько следующих шагов для экспериментов с вашим дашбордом

- Настройте оповещения для критических метрик (частота ошибок, пороговые значения задержки)
- Создайте дополнительные дашборды для конкретных сценариев использования (мониторинг API, события безопасности)

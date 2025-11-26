---
slug: /use-cases/observability/clickstack/integrations/nginx-traces
title: 'Мониторинг трассировок Nginx с помощью ClickStack'
sidebar_label: 'Трассировки Nginx'
pagination_prev: null
pagination_next: null
description: 'Мониторинг трассировок Nginx с помощью ClickStack'
doc_type: 'guide'
keywords: ['ClickStack', 'Nginx', 'traces', 'OTel']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/finish-nginx-traces-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/nginx-traces-dashboard.png';
import view_traces from '@site/static/images/clickstack/nginx-traces-search-view.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# Мониторинг трасс Nginx с помощью ClickStack {#nginx-traces-clickstack}

:::note[TL;DR]
В этом руководстве показано, как собирать распределённые трассы из существующей установки Nginx и визуализировать их в ClickStack. Вы узнаете, как:

- Добавить модуль OpenTelemetry в Nginx
- Настроить Nginx на отправку трасс на OTLP-эндпоинт ClickStack
- Проверить, что трассы появляются в HyperDX
- Использовать готовую панель для визуализации характеристик запросов (задержка, ошибки, пропускная способность)

Доступен демонстрационный набор данных с примерами трасс, если вы хотите протестировать интеграцию до настройки вашего production Nginx.

Требуемое время: 5–10 минут
::::

## Интеграция с существующим Nginx {#existing-nginx}

В этом разделе рассматривается, как добавить распределённое трассирование в вашу существующую установку Nginx, установив модуль OpenTelemetry и настроив его на отправку трейсов в ClickStack.
Если вы хотите протестировать интеграцию до настройки собственной установки, вы можете воспользоваться нашим предварительно настроенным стендом и примером данных в [следующем разделе](/use-cases/observability/clickstack/integrations/nginx-traces#demo-dataset).

##### Предварительные требования {#prerequisites}

- Запущенный экземпляр ClickStack с доступными OTLP-эндпоинтами (порты 4317/4318)
- Установленный Nginx (версии 1.18 или выше)
- Доступ root или sudo для изменения конфигурации Nginx
- Имя хоста или IP-адрес экземпляра ClickStack

<VerticalStepper headerLevel="h4">

#### Установка модуля OpenTelemetry для Nginx {#install-module}

Проще всего добавить трассировку в Nginx с помощью официального образа Nginx со встроенной поддержкой OpenTelemetry.

##### Использование образа nginx:otel {#using-otel-image}

Замените ваш текущий образ Nginx версией с поддержкой OpenTelemetry:

```yaml
# В вашем docker-compose.yml или Dockerfile
image: nginx:1.27-otel
```

Этот образ включает предустановленный модуль `ngx_otel_module.so`, готовый к использованию.

:::note
Если вы запускаете Nginx вне Docker, обратитесь к [документации OpenTelemetry для Nginx](https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/nginx) для инструкций по ручной установке.
:::

#### Настройка Nginx для отправки трейсов в ClickStack {#configure-nginx}

Добавьте конфигурацию OpenTelemetry в файл `nginx.conf`. Конфигурация загружает модуль и направляет трейсы в OTLP-эндпоинт ClickStack.

Сначала получите ваш ключ API:
1. Откройте HyperDX по вашему URL ClickStack
2. Перейдите в Settings → API Keys  
3. Скопируйте ваш **Ingestion API Key**
4. Установите его как переменную окружения: `export CLICKSTACK_API_KEY=your-api-key-here`

Добавьте это в ваш `nginx.conf`:

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
    
    # Включение трассировки
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
            
            # Ваша существующая конфигурация прокси или приложения
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

Замените `<clickstack-host>` на имя хоста или IP-адрес вашего экземпляра ClickStack.

:::note
- **Порт 4317** — это gRPC-эндпоинт, используемый модулем Nginx
- **otel_service_name** должен описательно отражать ваш экземпляр Nginx (например, «api-gateway», «frontend-proxy»)
- Измените **otel_service_name** в соответствии с вашей средой для более удобной идентификации в HyperDX
:::

##### Разбор конфигурации {#understanding-configuration}

**Что трассируется:**
Каждый запрос к Nginx создаёт спан трассировки, в котором отображаются:
- метод и путь запроса;
- HTTP-код состояния;
- длительность запроса;
- метка времени.

**Атрибуты спана:**
Директивы `otel_span_attr` добавляют метаданные к каждому трейсу, что позволяет фильтровать и анализировать запросы в HyperDX по коду состояния, методу, маршруту и т. д.

После внесения этих изменений протестируйте конфигурацию Nginx:
```bash
nginx -t
```

Если тест прошёл успешно, перезагрузите Nginx:
```bash
# Для Docker
docker-compose restart nginx

# Для systemd
sudo systemctl reload nginx
```

#### Проверка трейсов в HyperDX {#verifying-traces}

После настройки войдите в HyperDX и убедитесь, что трейсы поступают. Вы должны увидеть примерно следующее; если вы не видите трейсы, попробуйте изменить диапазон времени:

<Image img={view_traces} alt="Просмотр трассировок"/>

</VerticalStepper>

## Демо-набор данных {#demo-dataset}

Для пользователей, которые хотят протестировать интеграцию трасс nginx до настройки своих production-систем, мы предоставляем пример набора предварительно сгенерированных трасс nginx с реалистическими паттернами трафика.

<VerticalStepper headerLevel="h4">

#### Запустите ClickStack {#start-clickstack}

Если у вас ещё не запущен ClickStack, запустите его командой:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

Подождите около 30 секунд, чтобы ClickStack полностью инициализировался, прежде чем продолжить.

- Порт 8080: веб-интерфейс HyperDX
- Порт 4317: OTLP gRPC endpoint (используется модулем nginx)
- Порт 4318: OTLP HTTP endpoint (используется для демо-трасс)

#### Загрузите демонстрационный набор данных {#download-sample}

Загрузите файл с демонстрационными трассами и обновите временные метки до текущего времени:

```bash
# Загрузить трассы
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nginx-traces-sample.json
```

Набор данных включает:
- 1 000 спанов трасс с реалистическими временными характеристиками
- 9 различных конечных точек (endpoints) с разными паттернами трафика
- ~93% успешных ответов (200), ~3% клиентских ошибок (404), ~4% серверных ошибок (500)
- Задержки в диапазоне от 10 мс до 800 мс
- Исходные паттерны трафика сохранены и сдвинуты к текущему времени

#### Отправьте трассы в ClickStack {#send-traces}

Установите значение вашего API key в переменную окружения (если это ещё не сделано):

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

**Как получить ваш API key:**
1. Откройте HyperDX по вашему URL ClickStack
2. Перейдите в Settings → API Keys
3. Скопируйте ваш **ключ API для приёма данных API key**

Затем отправьте трассы в ClickStack:

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nginx-traces-sample.json
```

:::note[Запуск на localhost]
В этом демо предполагается, что ClickStack запущен локально на `localhost:4318`. Для удалённых экземпляров замените `localhost` на ваш hostname ClickStack.
:::

Вы должны увидеть ответ вида `{"partialSuccess":{}}`, указывающий, что трассы были успешно отправлены. Все 1 000 трасс будут приняты (ингестированы) в ClickStack.

#### Проверьте трассы в HyperDX {#verify-demo-traces}

1. Откройте [HyperDX](http://localhost:8080/) и войдите в свою учётную запись (при необходимости сначала создайте её)
2. Перейдите в представление Search и установите источник `Traces`
3. Установите диапазон времени на **2025-10-25 13:00:00 - 2025-10-28 13:00:00**

Вот что вы должны увидеть в окне поиска:

:::note[Отображение часового пояса]
HyperDX отображает временные метки в локальном часовом поясе вашего браузера. Демо-данные покрывают период **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)**. Широкий диапазон времени гарантирует, что вы увидите демо-трассы независимо от вашего местоположения. После того как вы увидите трассы, вы можете сузить диапазон до 24 часов для более наглядной визуализации.
:::

<Image img={view_traces} alt="View Traces"/>

</VerticalStepper>

## Дашборды и визуализация {#dashboards}

Чтобы помочь вам начать мониторинг трейсов с помощью ClickStack, мы предоставляем основные визуализации для данных трейсов.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-traces-dashboard.json')} download="nginx-traces-dashboard.json" eventName="docs.nginx_traces_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию дашборда {#download}

#### Импортируйте готовый дашборд {#import-dashboard}
1. Откройте HyperDX и перейдите в раздел Dashboards.
2. Нажмите «Import Dashboard» в правом верхнем углу под значком с многоточием.

<Image img={import_dashboard} alt="Импорт дашборда"/>

3. Загрузите файл nginx-trace-dashboard.json и нажмите «Finish import».

<Image img={finish_import} alt="Завершение импорта"/>

#### Дашборд будет создан со всеми преднастроенными визуализациями. {#created-dashboard}

:::note
Для демонстрационного набора данных установите диапазон времени **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** (скорректируйте в соответствии с вашим часовым поясом). Импортированный дашборд по умолчанию не будет иметь заданного диапазона времени.
:::

<Image img={example_dashboard} alt="Пример дашборда"/>

</VerticalStepper>

## Поиск и устранение неисправностей {#troubleshooting}

### Трейсы не отображаются в HyperDX

**Убедитесь, что модуль Nginx загружен:**

```bash
nginx -V 2>&1 | grep otel
```

Вы должны увидеть упоминания модуля OpenTelemetry.

**Проверьте сетевое подключение:**

```bash
telnet <clickstack-host> 4317
```

Подключение к конечной точке OTLP gRPC должно пройти успешно.

**Проверьте, что API-ключ задан:**

```bash
echo $CLICKSTACK_API_KEY
```

В результате вы должны увидеть ваш API‑ключ (не пустой).

**Проверьте логи ошибок nginx:**

```bash
# Для Docker
docker logs <nginx-container> 2>&1 | grep -i otel

# Для systemd
sudo tail -f /var/log/nginx/error.log | grep -i otel
```

Проверьте, нет ли ошибок, связанных с OpenTelemetry.

**Проверьте, что nginx получает запросы:**

```bash
# Проверьте журналы доступа для подтверждения трафика
tail -f /var/log/nginx/access.log
```


## Следующие шаги {#next-steps}

Если вы хотите продолжить изучение возможностей, ниже приведены варианты для экспериментов с вашей панелью мониторинга:

- Настройте оповещения для критически важных метрик (частота ошибок, пороговые значения задержки)
- Создайте дополнительные панели мониторинга для конкретных сценариев (мониторинг API, события безопасности)
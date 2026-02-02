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


# Мониторинг трассировок Nginx с помощью ClickStack \{#nginx-traces-clickstack\}

:::note[Кратко]
В этом руководстве показано, как собирать распределённые трассировки из вашей существующей установки Nginx и визуализировать их в ClickStack. Вы узнаете, как:

- Добавить модуль OpenTelemetry в Nginx
- Настроить Nginx на отправку трассировок в конечную точку OTLP ClickStack
- Проверить, что трассировки появляются в HyperDX
- Использовать готовую панель мониторинга для визуализации производительности запросов (задержки, ошибки, пропускная способность)

Демонстрационный набор данных с примерами трассировок доступен, если вы хотите протестировать интеграцию перед настройкой боевого Nginx.

Требуемое время: 5–10 минут
::::

## Интеграция с существующим Nginx \{#existing-nginx\}

В этом разделе описывается, как добавить распределённый трассинг в вашу текущую установку Nginx, установив модуль OpenTelemetry и настроив его на отправку трейсов в ClickStack.
Если вы хотите протестировать интеграцию до настройки собственной среды, вы можете использовать нашу предварительно настроенную инсталляцию и пример данных в [следующем разделе](/use-cases/observability/clickstack/integrations/nginx-traces#demo-dataset).

##### Предварительные требования \{#prerequisites\}

- Запущенный экземпляр ClickStack с доступными OTLP endpoint'ами (порты 4317/4318)
- Установленный Nginx (версии 1.18 или выше)
- root-доступ или права sudo для изменения конфигурации Nginx
- Имя хоста или IP-адрес ClickStack

<VerticalStepper headerLevel="h4">

#### Установите модуль OpenTelemetry для Nginx \{#install-module\}

Самый простой способ добавить трассировку в Nginx — использовать официальный образ Nginx со встроенной поддержкой OpenTelemetry.

##### Использование образа nginx:otel \{#using-otel-image\}

Замените ваш текущий образ Nginx на версию с поддержкой OpenTelemetry:

```yaml
# В вашем docker-compose.yml или Dockerfile
image: nginx:1.27-otel
```

Этот образ включает `ngx_otel_module.so`, предварительно установленный и готовый к использованию.

:::note
Если вы запускаете Nginx вне Docker, обратитесь к [документации OpenTelemetry для Nginx](https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/nginx) для инструкций по ручной установке.
:::

#### Настройте Nginx для отправки трассировок в ClickStack \{#configure-nginx\}

Добавьте конфигурацию OpenTelemetry в файл `nginx.conf`. Эта конфигурация загружает модуль и направляет трассировки на OTLP endpoint ClickStack.

Сначала получите ваш API key:
1. Откройте HyperDX по вашему URL ClickStack
2. Перейдите в Settings → API Keys  
3. Скопируйте ваш **ключ API для приёма данных API key**
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
    
    # Включить трассировку
    otel_trace on;
    
    server {
        listen 80;
        
        location / {
            # Включить трассировку для этого location
            otel_trace_context propagate;
            otel_span_name "$request_method $uri";
            
            # Добавить детали запроса в трассировки
            otel_span_attr http.status_code $status;
            otel_span_attr http.request.method $request_method;
            otel_span_attr http.route $uri;
            
            # Ваша существующая конфигурация proxy или приложения
            proxy_pass http://your-backend;
        }
    }
}
```

Если Nginx запущен в Docker, передайте переменную окружения в контейнер:

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
- **Порт 4317** — это gRPC endpoint, используемый модулем Nginx
- **otel_service_name** должен быть информативным и описывать ваш экземпляр Nginx (например, "api-gateway", "frontend-proxy")
- Измените **otel_service_name** в соответствии с вашей средой для более простой идентификации в HyperDX
:::

##### Разбор конфигурации \{#understanding-configuration\}

**Что попадает в трассировку:**
Каждый запрос к Nginx создает span трассировки, показывающий:
- Метод и путь запроса
- Код состояния HTTP
- Длительность запроса
- Метку времени

**Атрибуты span:**
Директивы `otel_span_attr` добавляют метаданные к каждой трассировке, позволяя фильтровать и анализировать запросы в HyperDX по коду состояния, методу, маршруту и т.д.

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

#### Проверка трассировок в HyperDX \{#verifying-traces\}

После настройки войдите в HyperDX и убедитесь, что трассировки поступают; вы должны увидеть что-то похожее на это. Если вы не видите трассировок, попробуйте изменить диапазон времени:

<Image img={view_traces} alt="Просмотр трассировок"/>

</VerticalStepper>

## Демо-набор данных \{#demo-dataset\}

Для пользователей, которые хотят протестировать интеграцию трассировок nginx до настройки продакшен-систем, мы предоставляем пример набора данных с заранее сгенерированными трассами Nginx и реалистичными паттернами трафика.

<VerticalStepper headerLevel="h4">

#### Запустите ClickStack \{#start-clickstack\}

Если у вас ещё не запущен ClickStack, запустите его командой:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

Подождите около 30 секунд, чтобы ClickStack полностью инициализировался, прежде чем продолжить.

- Порт 8080: веб-интерфейс HyperDX
- Порт 4317: OTLP gRPC endpoint (используется модулем nginx)
- Порт 4318: OTLP HTTP endpoint (используется для демо-трасс)

#### Загрузите демонстрационный набор данных \{#download-sample\}

Загрузите файл с демо-трассами и обновите временные метки до текущего времени:

```bash
# Download the traces
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nginx-traces-sample.json
```

Набор данных включает:
- 1 000 спанов трасс с реалистичными таймингами
- 9 различных конечных точек (endpoints) с разными паттернами трафика
- ~93% успешных запросов (200), ~3% клиентских ошибок (404), ~4% серверных ошибок (500)
- Задержки в диапазоне от 10 мс до 800 мс
- Исходные паттерны трафика сохранены и сдвинуты к текущему времени

#### Отправьте трассы в ClickStack \{#send-traces\}

Установите ваш API key в переменную окружения (если он ещё не установлен):

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

**Получение вашего API key:**
1. Откройте HyperDX по URL вашего экземпляра ClickStack
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
В этом демо предполагается, что ClickStack запущен локально на `localhost:4318`. Для удалённых экземпляров замените `localhost` на имя хоста вашего ClickStack.
:::

Вы должны увидеть ответ вида `{"partialSuccess":{}}`, указывающий на то, что трассы были успешно отправлены. Все 1 000 трасс будут приняты (ингестированы) в ClickStack.

#### Проверьте трассы в HyperDX \{#verify-demo-traces\}

1. Откройте [HyperDX](http://localhost:8080/) и войдите в свою учётную запись (при необходимости сначала создайте её)
2. Перейдите в раздел Search и установите источник `Traces`
3. Установите диапазон времени на **2025-10-25 13:00:00 - 2025-10-28 13:00:00**

Вот что вы должны увидеть в своём окне поиска:

:::note[Отображение часового пояса]
HyperDX отображает временные метки в часовом поясе, настроенном в вашем браузере. Демо-данные покрывают период **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)**. Широкий диапазон времени гарантирует, что вы увидите демо-трассы независимо от вашего местоположения. После того как вы увидите трассы, вы можете сузить диапазон до 24 часов для более наглядной визуализации.
:::

<Image img={view_traces} alt="Просмотр трасс"/>

</VerticalStepper>

## Панели и визуализация \{#dashboards\}

Чтобы помочь вам начать мониторинг трассировок с помощью ClickStack, мы предоставляем основные визуализации для данных трассировки.

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-traces-dashboard.json')} download="nginx-traces-dashboard.json" eventName="docs.nginx_traces_monitoring.dashboard_download">Скачать</TrackedLink> конфигурацию панели \{#download\}

#### Импорт готовой панели \{#import-dashboard\}
1. Откройте HyperDX и перейдите в раздел Dashboards.
2. Нажмите "Import Dashboard" в правом верхнем углу под значком многоточия.

<Image img={import_dashboard} alt="Импорт панели"/>

3. Загрузите файл nginx-trace-dashboard.json и нажмите "Finish import".

<Image img={finish_import} alt="Завершение импорта"/>

#### Панель будет создана со всеми преднастроенными визуализациями. \{#created-dashboard\}

:::note
Для демонстрационного набора данных установите диапазон времени **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)** (скорректируйте в соответствии с вашим часовым поясом). По умолчанию импортированная панель не содержит заданного диапазона времени.
:::

<Image img={example_dashboard} alt="Пример панели"/>

</VerticalStepper>

## Устранение неполадок \{#troubleshooting\}

### В HyperDX не отображаются трассировки \{#no-traces\}

**Проверьте, что модуль nginx загружен:**

```bash
nginx -V 2>&1 | grep otel
```

Вы должны увидеть упоминания модуля OpenTelemetry.

**Проверьте сетевое подключение:**

```bash
telnet <clickstack-host> 4317
```

Это должно успешно подключиться к конечной точке OTLP gRPC.

**Проверьте, что API-ключ задан:**

```bash
echo $CLICKSTACK_API_KEY
```

Должен быть выведен ваш ключ API (не пустой).

**Проверьте журналы ошибок nginx:**

```bash
# For Docker
docker logs <nginx-container> 2>&1 | grep -i otel

# For systemd
sudo tail -f /var/log/nginx/error.log | grep -i otel
```

Проверьте наличие ошибок, связанных с OpenTelemetry.

**Проверьте, получает ли nginx запросы:**

```bash
# Check access logs to confirm traffic
tail -f /var/log/nginx/access.log
```


## Дальнейшие шаги \{#next-steps\}

Если вы хотите продолжить изучение, вот несколько следующих шагов, с которыми можно поэкспериментировать на вашей панели мониторинга:

- Настройте оповещения для критически важных метрик (уровень ошибок, пороговые значения задержки)
- Создайте дополнительные панели мониторинга для отдельных сценариев (мониторинг API, события безопасности)
---
slug: /use-cases/observability/clickstack/getting-started/sample-data
title: 'Пример журналов, трассировок и метрик'
sidebar_position: 0
pagination_prev: null
pagination_next: null
description: 'Начало работы с ClickStack и образцом набора данных с журналами, сеансами, трассировками и метриками'
doc_type: 'guide'
keywords: ['clickstack', 'пример данных', 'образец набора данных', 'журналы', 'наблюдаемость']
---

import Image from '@theme/IdealImage';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import hyperdx_3 from '@site/static/images/use-cases/observability/hyperdx-3.png';
import hyperdx_4 from '@site/static/images/use-cases/observability/hyperdx-4.png';
import hyperdx_5 from '@site/static/images/use-cases/observability/hyperdx-5.png';
import hyperdx_6 from '@site/static/images/use-cases/observability/hyperdx-6.png';
import hyperdx_7 from '@site/static/images/use-cases/observability/hyperdx-7.png';
import hyperdx_8 from '@site/static/images/use-cases/observability/hyperdx-8.png';
import hyperdx_9 from '@site/static/images/use-cases/observability/hyperdx-9.png';
import hyperdx_10 from '@site/static/images/use-cases/observability/hyperdx-10.png';
import hyperdx_11 from '@site/static/images/use-cases/observability/hyperdx-11.png';
import hyperdx_12 from '@site/static/images/use-cases/observability/hyperdx-12.png';
import hyperdx_13 from '@site/static/images/use-cases/observability/hyperdx-13.png';
import hyperdx_14 from '@site/static/images/use-cases/observability/hyperdx-14.png';
import hyperdx_15 from '@site/static/images/use-cases/observability/hyperdx-15.png';
import hyperdx_16 from '@site/static/images/use-cases/observability/hyperdx-16.png';
import hyperdx_17 from '@site/static/images/use-cases/observability/hyperdx-17.png';
import hyperdx_18 from '@site/static/images/use-cases/observability/hyperdx-18.png';
import hyperdx_19 from '@site/static/images/use-cases/observability/hyperdx-19.png';
import copy_api_key from '@site/static/images/use-cases/observability/copy_api_key.png';


# ClickStack — Примеры логов, трассировок и метрик {#clickstack-sample-dataset}

В следующем примере предполагается, что вы запустили ClickStack согласно [инструкциям для универсального образа](/use-cases/observability/clickstack/getting-started) и подключились к [локальному экземпляру ClickHouse](/use-cases/observability/clickstack/getting-started#complete-connection-credentials) или [экземпляру ClickHouse Cloud](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

:::note HyperDX в ClickHouse Cloud
Этот набор примеров данных также может использоваться с HyperDX в ClickHouse Cloud с незначительными корректировками процесса, как указано. При использовании HyperDX в ClickHouse Cloud необходимо, чтобы сборщик OpenTelemetry был запущен локально, как описано в [руководстве по началу работы для данной модели развертывания](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud).
:::

<VerticalStepper>


## Перейдите в интерфейс HyperDX {#navigate-to-the-hyperdx-ui}

Перейдите по адресу [http://localhost:8080](http://localhost:8080), чтобы открыть интерфейс HyperDX при локальном развертывании. Если вы используете HyperDX в ClickHouse Cloud, выберите свой сервис и `HyperDX` в левом меню.

<Image img={hyperdx} alt="Интерфейс HyperDX" size="lg"/>



## Скопировать ключ API для приёма данных {#copy-ingestion-api-key}

:::note HyperDX в ClickHouse Cloud
Этот шаг не требуется, если вы используете HyperDX в ClickHouse Cloud, где в настоящее время не поддерживаются ключи API для приёма данных.
:::

Перейдите в [`Team Settings`](http://localhost:8080/team) и скопируйте `Ingestion API Key` из раздела `API Keys`. Этот ключ API обеспечивает безопасный приём данных через коллектор OpenTelemetry.

<Image img={copy_api_key} alt="Скопировать ключ API" size="lg"/>



## Загрузка примерных данных {#download-sample-data}

Чтобы заполнить пользовательский интерфейс примерными данными, загрузите следующий файл:

[Примерные данные](https://storage.googleapis.com/hyperdx/sample.tar.gz)



```shell
# curl
curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz
# или
# wget https://storage.googleapis.com/hyperdx/sample.tar.gz
```

Этот файл содержит примеры логов, метрик и трейсов из нашего публичного [демо OpenTelemetry](https://github.com/ClickHouse/opentelemetry-demo) — простого интернет-магазина с микросервисной архитектурой. Скопируйте этот файл в выбранный вами каталог.


## Загрузка примеров данных {#load-sample-data}

Чтобы загрузить эти данные, просто отправьте их на HTTP-эндпоинт развёрнутого коллектора OpenTelemetry (OTel). 

Сначала экспортируйте скопированный выше API-ключ.

:::note HyperDX в ClickHouse Cloud
Этот шаг не требуется при использовании HyperDX в ClickHouse Cloud, где поддержка ключей ингестии пока не реализована.
:::



```shell
# экспортируем ключ API
export CLICKSTACK_API_KEY=<YOUR_INGESTION_API_KEY>
```

Выполните следующую команду для отправки данных в OTel collector:

```shell
for filename in $(tar -tf sample.tar.gz); do
  endpoint="http://localhost:4318/v1/${filename%.json}"
  echo "loading ${filename%.json}"
  tar -xOf sample.tar.gz "$filename" | while read -r line; do
    printf '%s\n' "$line" | curl -s -o /dev/null -X POST "$endpoint" \
    -H "Content-Type: application/json" \
    -H "authorization: ${CLICKSTACK_API_KEY}" \
    --data-binary @-
  done
done
```

Это имитирует источники логов, трейсов и метрик по протоколу OTLP, отправляющие данные в OTel collector. В продуктивной среде такими источниками могут быть клиентские библиотеки для разных языков или даже другие экземпляры OTel collector.

Вернувшись к представлению `Search`, вы должны увидеть, что данные начали загружаться (при необходимости измените интервал времени на `Last 1 hour`, если данные не отображаются):

<Image img={hyperdx_10} alt="HyperDX search" size="lg" />

Загрузка данных займет несколько минут. Дождитесь завершения загрузки, прежде чем переходить к следующим шагам.


## Исследование сессий {#explore-sessions}

Предположим, мы получили сообщения о том, что наши пользователи испытывают проблемы с оплатой товаров. Мы можем посмотреть, что происходило с их стороны, используя возможности HyperDX по воспроизведению сессий (session replay). 

Выберите [`Client Sessions`](http://localhost:8080/sessions?from=1747312320000&to=1747312920000&sessionSource=l1324572572) в левом меню.

<Image img={hyperdx_11} alt="Сессии" size="lg"/>

Это представление позволяет нам видеть фронтенд-сессии нашего интернет-магазина. Сессии остаются анонимными, пока пользователи не оформят заказ и не попытаются завершить покупку.

Обратите внимание, что некоторые сессии с email-адресами имеют связанную с ними ошибку, что потенциально подтверждает сообщения о неудачных транзакциях.

Выберите трейс с неуспешным завершением и связанным с ним email. На следующем экране можно воспроизвести сессию пользователя и проанализировать его проблему. Нажмите «Play», чтобы просмотреть сессию.

<Image img={hyperdx_12} alt="Воспроизведение сессии" size="lg"/>

При воспроизведении видно, как пользователь перемещается по сайту и добавляет товары в корзину. При необходимости перейдите к более позднему моменту сессии, где он пытается завершить оплату.

:::tip
Все ошибки помечаются на временной шкале красным цветом. 
:::

Пользователю не удалось оформить заказ, при этом явной ошибки не наблюдается. Пролистайте до нижней части левой панели, содержащей сетевые и консольные события из браузера пользователя. Вы заметите, что при вызове `/api/checkout` вернулась ошибка с кодом `500`. 

<Image img={hyperdx_13} alt="Ошибка в сессии" size="lg"/>

Выберите эту ошибку `500`. Ни `Overview`, ни `Column Values` не указывают источник проблемы, кроме того факта, что ошибка является неожиданной и приводит к возникновению `Internal Error`.



## Изучение трассировок {#explore-traces}

Перейдите на вкладку `Trace`, чтобы увидеть полную распределённую трассировку. 

<Image img={hyperdx_14} alt="Трассировка сессии" size="lg"/>

Прокрутите трассировку вниз, чтобы увидеть источник ошибки — спан сервиса `checkout`. Выберите спан сервиса `Payment`. 

<Image img={hyperdx_15} alt="Спан" size="lg"/>

Выберите вкладку `Column Values` и прокрутите вниз. Мы видим, что проблема связана с переполнением кэша.

<Image img={hyperdx_16} alt="Значения столбцов" size="lg"/>

Прокрутив вверх и вернувшись к трассировке, мы видим, что логи коррелированы со спаном благодаря нашей предварительной настройке. Они обеспечивают дополнительный контекст.

<Image img={hyperdx_17} alt="Скоррелированный лог" size="lg"/>

Мы установили, что в сервисе платежей происходит заполнение кэша, что мешает успешно завершать платежи. 



## Изучение логов {#explore-logs}

Для получения дополнительных сведений мы можем вернуться в раздел [`Search`](http://localhost:8080/search):

Выберите `Logs` в списке источников и примените фильтр по сервису `payment`.

<Image img={hyperdx_18} alt="Журналы" size="lg"/>

Мы видим, что проблема возникла недавно, но количество затронутых платежей уже велико. Кроме того, по‑видимому, проблемы вызывает кэш, связанный с платежами Visa.



## Метрики на графике {#chart-metrics}

Хотя в код явно была внесена ошибка, мы можем использовать метрики для проверки размера кэша. Перейдите в представление `Chart Explorer`.

Выберите `Metrics` в качестве источника данных. Настройте построитель графика для отображения значения `Maximum` метрики `visa_validation_cache.size (Gauge)` и нажмите кнопку воспроизведения. Кэш явно увеличивался до достижения максимального размера, после чего начали возникать ошибки.

<Image img={hyperdx_19} alt='Metrics' size='lg' />

</VerticalStepper>

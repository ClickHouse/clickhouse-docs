---
slug: /use-cases/observability/clickstack/getting-started/sample-data
title: 'Пример логов, трассировок и метрик'
sidebar_position: 0
pagination_prev: null
pagination_next: null
description: 'Начало работы с ClickStack и примерным набором данных с логами, сессиями, трассировками и метриками'
doc_type: 'guide'
keywords: ['clickstack', 'example data', 'sample dataset', 'logs', 'observability']
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


# ClickStack - Примеры логов, трассировок и метрик {#clickstack-sample-dataset}

В следующем примере предполагается, что вы запустили ClickStack, используя [инструкции для универсального образа](/use-cases/observability/clickstack/getting-started), и подключились к [локальному экземпляру ClickHouse](/use-cases/observability/clickstack/getting-started#complete-connection-credentials) или к [экземпляру ClickHouse Cloud](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

:::note HyperDX в ClickHouse Cloud
Этот набор примеров данных также можно использовать с HyperDX в ClickHouse Cloud, внеся лишь незначительные изменения в процесс, как указано ниже. При использовании HyperDX в ClickHouse Cloud потребуется локально запущенный коллектор OpenTelemetry, как описано в [руководстве по началу работы для данной модели развертывания](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud).
:::

<VerticalStepper>


## Переход к интерфейсу HyperDX {#navigate-to-the-hyperdx-ui}

Откройте [http://localhost:8080](http://localhost:8080) для доступа к интерфейсу HyperDX при локальном развертывании. Если вы используете HyperDX в ClickHouse Cloud, выберите ваш сервис и `HyperDX` в меню слева.

<Image img={hyperdx} alt='Интерфейс HyperDX' size='lg' />


## Копирование ключа API для приёма данных {#copy-ingestion-api-key}

:::note HyperDX в ClickHouse Cloud
Этот шаг не требуется при использовании HyperDX в ClickHouse Cloud, где поддержка ключей приёма данных в настоящее время не реализована.
:::

Перейдите в [`Team Settings`](http://localhost:8080/team) и скопируйте `Ingestion API Key` из раздела `API Keys`. Этот ключ API обеспечивает безопасный приём данных через коллектор OpenTelemetry.

<Image img={copy_api_key} alt='Копирование ключа API' size='lg' />


## Загрузка тестовых данных {#download-sample-data}

Чтобы заполнить интерфейс тестовыми данными, скачайте следующий файл:

[Тестовые данные](https://storage.googleapis.com/hyperdx/sample.tar.gz)


```shell
# curl
curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz
# или
# wget https://storage.googleapis.com/hyperdx/sample.tar.gz
```

Этот файл содержит примеры логов, метрик и трасс из нашего публичного [демо OpenTelemetry](https://github.com/ClickHouse/opentelemetry-demo) — простого интернет‑магазина с микросервисной архитектурой. Скопируйте этот файл в произвольный каталог.


## Загрузка примера данных {#load-sample-data}

Для загрузки этих данных их нужно просто отправить на HTTP-эндпоинт развернутого коллектора OpenTelemetry (OTel).

Сначала экспортируйте скопированный выше API-ключ.

:::note HyperDX в ClickHouse Cloud
Этот шаг не требуется при использовании HyperDX в ClickHouse Cloud, где поддержка ключей приема данных в настоящее время отсутствует.
:::


```shell
# экспортировать API-ключ
export CLICKSTACK_API_KEY=<YOUR_INGESTION_API_KEY>
```

Выполните следующую команду, чтобы отправить данные в коллектор OTel:

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

Это эмулирует источники OTLP‑логов, трейсов и метрик, отправляющие данные в OTel collector. В продакшене этими источниками могут быть клиентские библиотеки на разных языках или даже другие OTel collectors.

Вернувшись к представлению `Search`, вы должны увидеть, что данные начали загружаться (при необходимости измените диапазон времени на `Last 1 hour`, если данные не отображаются):

<Image img={hyperdx_10} alt="Поиск в HyperDX" size="lg" />

Загрузка данных займет несколько минут. Дождитесь ее завершения, прежде чем переходить к следующим шагам.


## Изучение сессий {#explore-sessions}

Предположим, что поступили сообщения о проблемах пользователей при оплате товаров. Мы можем изучить их опыт, используя возможности воспроизведения сессий HyperDX.

Выберите [`Client Sessions`](http://localhost:8080/sessions?from=1747312320000&to=1747312920000&sessionSource=l1324572572) в левом меню.

<Image img={hyperdx_11} alt='Sessions' size='lg' />

Это представление позволяет просматривать клиентские сессии нашего интернет-магазина. Сессии остаются анонимными до тех пор, пока пользователи не перейдут к оформлению заказа и не попытаются завершить покупку.

Обратите внимание, что некоторые сессии с email-адресами имеют связанные ошибки, что потенциально подтверждает сообщения о неудачных транзакциях.

Выберите трассировку с ошибкой и связанным email-адресом. В открывшемся представлении можно воспроизвести сессию пользователя и изучить его проблему. Нажмите кнопку воспроизведения для просмотра сессии.

<Image img={hyperdx_12} alt='Session replay' size='lg' />

Воспроизведение показывает, как пользователь перемещается по сайту и добавляет товары в корзину. Можно перемотать к более позднему моменту сессии, где он пытается завершить оплату.

:::tip
Все ошибки отмечены на временной шкале красным цветом.
:::

Пользователь не смог разместить заказ, при этом явная ошибка отсутствовала. Прокрутите вниз левую панель, содержащую сетевые события и события консоли из браузера пользователя. Вы заметите, что при выполнении вызова `/api/checkout` была возвращена ошибка 500.

<Image img={hyperdx_13} alt='Error in session' size='lg' />

Выберите эту ошибку `500`. Ни `Overview`, ни `Column Values` не указывают на источник проблемы, кроме того факта, что ошибка является неожиданной и вызывает `Internal Error`.


## Изучение трассировок {#explore-traces}

Перейдите на вкладку `Trace`, чтобы просмотреть полную распределённую трассировку.

<Image img={hyperdx_14} alt='Трассировка сессии' size='lg' />

Прокрутите трассировку вниз, чтобы найти источник ошибки — спан сервиса `checkout`. Выберите спан сервиса `Payment`.

<Image img={hyperdx_15} alt='Спан' size='lg' />

Выберите вкладку `Column Values` и прокрутите вниз. Видно, что проблема связана с переполнением кеша.

<Image img={hyperdx_16} alt='Значения столбцов' size='lg' />

Прокрутив вверх и вернувшись к трассировке, можно увидеть, что логи коррелируют со спаном благодаря выполненной ранее конфигурации. Они предоставляют дополнительный контекст.

<Image img={hyperdx_17} alt='Коррелированный лог' size='lg' />

Мы установили, что кеш в сервисе платежей переполняется, что препятствует завершению платежей.


## Изучение логов {#explore-logs}

Для получения дополнительной информации вернитесь к [представлению `Search`](http://localhost:8080/search):

Выберите `Logs` из источников и примените фильтр для сервиса `payment`.

<Image img={hyperdx_18} alt='Logs' size='lg' />

Видно, что несмотря на недавнее возникновение проблемы, количество затронутых платежей велико. Кроме того, проблемы, по-видимому, вызваны кешем, связанным с платежами Visa.


## Метрики графика {#chart-metrics}

Хотя в код явно была внесена ошибка, мы можем использовать метрики для проверки размера кеша. Перейдите в представление `Chart Explorer`.

Выберите `Metrics` в качестве источника данных. Настройте построитель графика для отображения значения `Maximum` метрики `visa_validation_cache.size (Gauge)` и нажмите кнопку воспроизведения. Кеш явно увеличивался до достижения максимального размера, после чего начали возникать ошибки.

<Image img={hyperdx_19} alt='Metrics' size='lg' />

</VerticalStepper>

---
'slug': '/use-cases/observability/clickstack/getting-started/sample-data'
'title': 'Пример журналов, трассировок и метрик'
'sidebar_position': 0
'pagination_prev': null
'pagination_next': null
'description': 'Начало работы с ClickStack и набором данных с журналами, сессиями,
  трассировками и метриками'
'doc_type': 'guide'
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


# ClickStack - Примеры логов, трасс и метрик {#clickstack-sample-dataset}

Следующий пример предполагает, что вы запустили ClickStack, следуя [инструкциям для образа all-in-one](/use-cases/observability/clickstack/getting-started), и подключились к [локальной инстанции ClickHouse](/use-cases/observability/clickstack/getting-started#complete-connection-credentials) или [инстанции ClickHouse Cloud](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

:::note HyperDX в ClickHouse Cloud
Этот набор данных также можно использовать с HyperDX в ClickHouse Cloud с незначительными изменениями в процессе, как указано. Если вы используете HyperDX в ClickHouse Cloud, пользователям потребуется запустить локальный сборщик Open Telemetry, как описано в [руководстве по началу работы с этой моделью развертывания](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud).
:::

<VerticalStepper>

## Перейдите в интерфейс HyperDX {#navigate-to-the-hyperdx-ui}

Посетите [http://localhost:8080](http://localhost:8080), чтобы получить доступ к интерфейсу HyperDX, если вы развертываете локально. Если вы используете HyperDX в ClickHouse Cloud, выберите свой сервис и `HyperDX` в левом меню.

<Image img={hyperdx} alt="HyperDX UI" size="lg"/>

## Скопируйте ключ API для приема данных {#copy-ingestion-api-key}

:::note HyperDX в ClickHouse Cloud
Этот шаг не требуется, если вы используете HyperDX в ClickHouse Cloud, где поддержка ключей приема данных в настоящее время не реализована.
:::

Перейдите в раздел [`Настройки команды`](http://localhost:8080/team) и скопируйте `Ключ API для приема данных` из раздела `API Keys`. Этот API ключ обеспечивает безопасный прием данных через сборщик OpenTelemetry.

<Image img={copy_api_key} alt="Копировать ключ API" size="lg"/>

## Скачайте образец данных {#download-sample-data}

Для того чтобы заполнить интерфейс образцами данных, скачайте следующий файл:

[Образец данных](https://storage.googleapis.com/hyperdx/sample.tar.gz)

```shell

# curl
curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz

# or

# wget https://storage.googleapis.com/hyperdx/sample.tar.gz
```

Этот файл содержит примеры логов, метрик и трасс из нашего публичного [демо OpenTelemetry](https://github.com/ClickHouse/opentelemetry-demo) - простого интернет-магазина с микросервисами. Скопируйте этот файл в желаемый каталог.

## Загрузите образец данных {#load-sample-data}

Чтобы загрузить эти данные, мы просто отправим их на HTTP-эндпоинт развернутого сборщика OpenTelemetry (OTel).

Сначала экспортируйте скопированный ранее API ключ.

:::note HyperDX в ClickHouse Cloud
Этот шаг не требуется, если вы используете HyperDX в ClickHouse Cloud, где поддержка ключей приема данных в настоящее время не реализована.
:::

```shell

# export API key
export CLICKSTACK_API_KEY=<YOUR_INGESTION_API_KEY>
```

Запустите следующую команду, чтобы отправить данные на OTel сборщик:

```shell
for filename in $(tar -tf sample.tar.gz); do
  endpoint="http://localhost:4318/v1/${filename%.json}"
  echo "loading ${filename%.json}"
  tar -xOf sample.tar.gz "$filename" | while read -r line; do
    echo "$line" | curl -s -o /dev/null -X POST "$endpoint" \
    -H "Content-Type: application/json" \
    -H "authorization: ${CLICKSTACK_API_KEY}" \
    --data-binary @-
  done
done
```

Это имитирует источники логов, трасс и метрик OTLP, отправляющие данные на OTel сборщик. В производственной среде эти источники могут быть клиентами языка или даже другими OTel сборщиками.

Вернувшись к просмотру `Поиск`, вы должны увидеть, что данные начали загружаться (откорректируйте временной интервал на `Последний 1 час`, если данные не отображаются):

<Image img={hyperdx_10} alt="Поиск в HyperDX" size="lg"/>

Загрузка данных займет несколько минут. Подождите завершения загрузки перед тем, как перейти к следующему шагу.

## Изучите сессии {#explore-sessions}

Предположим, у нас есть сообщения о том, что пользователи испытывают проблемы с оплатой товаров. Мы можем просмотреть их опыт, используя функции воспроизведения сессий HyperDX.

Выберите [`Клиентские сессии`](http://localhost:8080/sessions?from=1747312320000&to=1747312920000&sessionSource=l1324572572) в левом меню.

<Image img={hyperdx_11} alt="Сессии" size="lg"/>

Этот вид позволяет нам увидеть фронтовые сессии нашего интернет-магазина. Сессии остаются анонимными, пока пользователи не перейдут к оформлению заказа и не попробуют завершить покупку.

Обратите внимание, что некоторые сессии с электронными адресами имеют связанные ошибки, что может подтверждать сообщения о неудачных транзакциях.

Выберите трассу с ошибкой и связанным электронным адресом. Последующий вид позволяет нам воспроизвести сессию пользователя и просмотреть их проблему. Нажмите "воспроизвести", чтобы посмотреть сессию.

<Image img={hyperdx_12} alt="Воспроизведение сессии" size="lg"/>

Воспроизведение показывает, как пользователь перемещается по сайту, добавляя товары в свою корзину. Не стесняйтесь перемотать на более поздний этап сессии, где они пытаются завершить платеж.

:::tip
Любые ошибки помечаются на временной шкале красным цветом.
:::

Пользователь не смог оформить заказ, при этом не было явных ошибок. Прокрутите вниз по левому панелю, где содержатся события сети и консоли из браузера пользователя. Вы заметите, что ошибка 500 была вызвана при вызове `/api/checkout`.

<Image img={hyperdx_13} alt="Ошибка в сессии" size="lg"/>

Выберите эту ошибку `500`. Ни `Обзор`, ни `Значения колонок` не указывают на источник проблемы, кроме того факта, что ошибка неожиданна, что вызывает `Внутреннюю ошибку`.

## Изучите трассы {#explore-traces}

Перейдите на вкладку `Трасса`, чтобы увидеть полную распределенную трассу.

<Image img={hyperdx_14} alt="Трасса сессии" size="lg"/>

Прокрутите трассу вниз, чтобы увидеть источник ошибки - промежуток сервиса `checkout`. Выберите промежуток сервиса `Payment`.

<Image img={hyperdx_15} alt="Промежуток" size="lg"/>

Выберите вкладку `Значения колонок` и прокрутите вниз. Мы можем увидеть, что проблема связана с переполнением кэша.

<Image img={hyperdx_16} alt="Значения колонок" size="lg"/>

Прокручивая вверх и возвращаясь к трассе, мы видим, что логи коррелируют с промежутком, благодаря нашей предыдущей настройке. Это дает дополнительный контекст.

<Image img={hyperdx_17} alt="Сопоставленный лог" size="lg"/>

Мы установили, что кэш заполняется в сервисе платежей, что мешает завершению платежей.

## Изучите логи {#explore-logs}

Для получения дополнительных деталей мы можем вернуться к [`Просмотр` ](http://localhost:8080/search):

Выберите `Логи` из источников и примените фильтр к сервису `payment`.

<Image img={hyperdx_18} alt="Логи" size="lg"/>

Мы видим, что, хотя проблема недавняя, количество затронутых платежей высоко. Более того, кэш, связанный с платежами по визе, похоже, вызывает проблемы.

## Постройте графики метрик {#chart-metrics}

Хотя в коде явно была введена ошибка, мы можем использовать метрики для подтверждения размера кэша. Перейдите в вид `Chart Explorer`.

Выберите `Метрики` в качестве источника данных. Завершите построитель графиков, чтобы отобразить `Максимум` `visa_validation_cache.size (Gauge)` и нажмите кнопку воспроизведения. Кэш явно увеличивался, прежде чем достичь максимального размера, после чего были сгенерированы ошибки.

<Image img={hyperdx_19} alt="Метрики" size="lg"/>

</VerticalStepper>
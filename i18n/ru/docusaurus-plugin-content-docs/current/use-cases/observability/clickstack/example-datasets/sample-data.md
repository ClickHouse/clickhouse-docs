---
slug: /use-cases/observability/clickstack/getting-started/sample-data
title: 'Примеры логов, трассировок и метрик'
sidebar_position: 0
pagination_prev: null
pagination_next: null
description: 'Знакомство с ClickStack и демонстрационным набором данных с логами, сессиями, трассировками и метриками'
doc_type: 'guide'
keywords: ['clickstack', 'пример данных', 'демонстрационный набор данных', 'логи', 'наблюдаемость']
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


# ClickStack - примеры логов, трассировок и метрик \{#clickstack-sample-dataset\}

В следующем примере предполагается, что вы запустили ClickStack, используя [инструкции для образа «всё-в-одном»](/use-cases/observability/clickstack/getting-started) и подключились к [локальному экземпляру ClickHouse](/use-cases/observability/clickstack/getting-started#complete-connection-credentials) или экземпляру [ClickHouse Cloud](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection). 

:::note HyperDX в ClickHouse Cloud
Этот демонстрационный набор данных также может использоваться с HyperDX в ClickHouse Cloud, с незначительными изменениями в последовательности действий, отмеченными ниже. При использовании HyperDX в ClickHouse Cloud вам потребуется локально запущенный коллектор OpenTelemetry, как описано в [руководстве по началу работы для этой модели развертывания](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud).
:::

<VerticalStepper>
  ## Перейдите в интерфейс HyperDX

  Перейдите по адресу [http://localhost:8080](http://localhost:8080) для доступа к интерфейсу HyperDX при локальном развёртывании. При использовании HyperDX в ClickHouse Cloud выберите ваш сервис и пункт `HyperDX` в меню слева.

  <Image img={hyperdx} alt="Интерфейс HyperDX" size="lg" />

  ## Скопируйте ключ API для приёма данных

  :::note HyperDX в ClickHouse Cloud
  Этот шаг не требуется при использовании HyperDX в ClickHouse Cloud, где поддержка ключей ингестии в настоящее время отсутствует.
  :::

  Перейдите в [`Team Settings`](http://localhost:8080/team) и скопируйте `Ingestion API Key` из раздела `API Keys`. Этот ключ API для приёма данных обеспечивает безопасность ингестии данных через коллектор OpenTelemetry.

  <Image img={copy_api_key} alt="Копировать ключ API" size="lg" />

  ## Загрузка образцов данных

  Для заполнения интерфейса тестовыми данными загрузите следующий файл:

  [Образцы данных](https://storage.googleapis.com/hyperdx/sample.tar.gz)

  ```shell
  # curl
  curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz
  # или
  # wget https://storage.googleapis.com/hyperdx/sample.tar.gz
  ```

  Этот файл содержит примеры логов, метрик и трейсов из нашего публичного [OpenTelemetry demo](https://github.com/ClickHouse/opentelemetry-demo) — простого интернет-магазина с микросервисами. Скопируйте этот файл в выбранную директорию.

  ## Загрузка тестовых данных

  Для загрузки этих данных просто отправьте их на HTTP-эндпоинт развёрнутого коллектора OpenTelemetry (OTel).

  Сначала экспортируйте скопированный выше API-ключ.

  :::note HyperDX в ClickHouse Cloud
  Этот шаг не требуется при использовании HyperDX в ClickHouse Cloud, где поддержка ключей ингестии в настоящее время отсутствует.
  :::

  ```shell
  # экспортируйте API-ключ
  export CLICKSTACK_API_KEY=<YOUR_INGESTION_API_KEY>
  ```

  Выполните следующую команду для отправки данных в OTel collector:

  ```shell
  for filename in $(tar -tf sample.tar.gz); do
    endpoint="http://localhost:4318/v1/${filename%.json}"
    echo "загружается ${filename%.json}"
    tar -xOf sample.tar.gz "$filename" | while read -r line; do
      printf '%s\n' "$line" | curl -s -o /dev/null -X POST "$endpoint" \
      -H "Content-Type: application/json" \
      -H "authorization: ${CLICKSTACK_API_KEY}" \
      --data-binary @-
    done
  done
  ```

  Это имитирует источники логов, трейсов и метрик OTLP, отправляющие данные в OTel collector. В production-среде такими источниками могут быть языковые клиенты или даже другие OTel collector.

  Вернувшись к представлению `Search`, вы должны увидеть, что данные начали загружаться (если данные не отображаются, установите временной диапазон `Last 1 hour`):

  <Image img={hyperdx_10} alt="Поиск в HyperDX" size="lg" />

  Загрузка данных займет несколько минут. Дождитесь завершения загрузки, прежде чем переходить к следующим шагам.

  ## Изучение сессий

  Предположим, поступили сообщения о том, что пользователи испытывают проблемы при оплате товаров. Мы можем изучить их действия с помощью функции воспроизведения сеансов HyperDX.

  Выберите [`Client Sessions`](http://localhost:8080/sessions?from=1747312320000\&to=1747312920000\&sessionSource=l1324572572) в левом меню.

  <Image img={hyperdx_11} alt="Сеансы" size="lg" />

  Это представление позволяет просматривать фронтенд-сеансы нашего интернет-магазина. Сеансы остаются анонимными до тех пор, пока пользователи не перейдут к оформлению заказа и не попытаются завершить покупку.

  Обратите внимание, что для некоторых сессий с электронной почтой зафиксированы ошибки, что может подтверждать сообщения о неудачных транзакциях.

  Выберите трассировку с ошибкой и связанным email. В открывшемся представлении можно воспроизвести сеанс пользователя и изучить его проблему. Нажмите кнопку воспроизведения, чтобы просмотреть сеанс.

  <Image img={hyperdx_12} alt="Повтор сессий" size="lg" />

  Воспроизведение показывает, как пользователь перемещается по сайту и добавляет товары в корзину. При необходимости можно перейти к более поздней части сеанса, где выполняется попытка завершить оплату.

  :::tip
  Ошибки отмечены на временной шкале красным цветом.
  :::

  Пользователь не смог оформить заказ, при этом явная ошибка не отображалась. Прокрутите левую панель вниз до конца — она содержит сетевые события и события консоли из браузера пользователя. Вы увидите, что при выполнении запроса `/api/checkout` возникла ошибка 500.

  <Image img={hyperdx_13} alt="Ошибка сеанса" size="lg" />

  Выберите эту ошибку `500`. Ни `Overview`, ни `Column Values` не указывают на источник проблемы — только то, что ошибка является неожиданной и вызывает `Internal Error`.

  ## Изучение трассировок

  Перейдите на вкладку `Trace`, чтобы просмотреть полную распределенную трассировку.

  <Image img={hyperdx_14} alt="Трассировка сессии" size="lg" />

  Прокрутите трассировку вниз, чтобы увидеть источник ошибки — спан сервиса `checkout`. Выберите спан сервиса `Payment`.

  <Image img={hyperdx_15} alt="Спан" size="lg" />

  Выберите вкладку `Column Values` и прокрутите вниз. Видно, что проблема связана с переполнением кеша.

  <Image img={hyperdx_16} alt="Значения столбцов" size="lg" />

  Прокрутив страницу вверх и вернувшись к трассировке, можно увидеть, что логи коррелированы со спаном благодаря выполненной ранее конфигурации. Это обеспечивает дополнительный контекст.

  <Image img={hyperdx_17} alt="Связанный лог" size="lg" />

  Установлено, что кэш в платёжном сервисе переполняется, что блокирует завершение платежей.

  ## Изучение логов

  Для получения дополнительной информации можно вернуться к [представлению `Search`](http://localhost:8080/search):

  Выберите `Logs` из источников и примените фильтр к сервису `payment`.

  <Image img={hyperdx_18} alt="Логи" size="lg" />

  Видно, что несмотря на недавнее возникновение проблемы, количество затронутых платежей значительно. Кроме того, похоже, что проблемы вызывает кэш, связанный с платежами Visa.

  ## Метрики диаграммы

  Хотя в код явно была внесена ошибка, мы можем использовать метрики для проверки размера кэша. Перейдите в представление `Chart Explorer`.

  Выберите `Metrics` в качестве источника данных. Заполните конструктор графика для построения `Maximum` метрики `visa_validation_cache.size (Gauge)` и нажмите кнопку воспроизведения. Кэш явно увеличивался до достижения максимального размера, после чего начали возникать ошибки.

  <Image img={hyperdx_19} alt="Метрики" size="lg" />
</VerticalStepper>
---
slug: /use-cases/observability/clickstack/getting-started/sample-data
title: 'Пример логов, трейсов и метрик'
sidebar_position: 0
pagination_prev: null
pagination_next: null
description: 'Начало работы с ClickStack и примером набора данных, включающим логи, сессии, трейсы и метрики'
doc_type: 'guide'
toc_max_heading_level: 2
keywords: ['clickstack', 'пример данных', 'пример набора данных', 'логи', 'обсервабилити']
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
import select_service from '@site/static/images/clickstack/select_service.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# ClickStack - Пример журналов, трассировок и метрик \{#clickstack-sample-dataset\}

В этом руководстве на примере тестового набора данных рассматриваются как ClickStack Open Source, так и управляемый ClickStack.

<Tabs groupId="sample-logs">
  <TabItem value="managed-clickstack" label="Управляемый ClickStack" default>
    <VerticalStepper headerLevel="h3">
      Данное руководство предполагает, что вы выполнили [Руководство по началу работы с управляемым ClickStack](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud) и [зафиксировали учетные данные для подключения](/use-cases/observability/clickstack/getting-started/managed#next-steps).

      ### Выберите сервис

      Выберите сервис с Managed ClickStack на главной странице ClickHouse Cloud.

      <Image img={select_service} alt="Выберите сервис" size="lg" />

      ### Перейдите к пользовательскому интерфейсу ClickStack (HyperDX)

      Выберите `ClickStack` в левом меню, чтобы перейти к интерфейсу ClickStack, где вы будете автоматически авторизованы.

      <Image img={hyperdx} alt="Интерфейс ClickStack" size="lg" />

      ### Загрузка образцов данных

      Чтобы заполнить интерфейс примерными данными, загрузите следующий файл:

      [Тестовые данные](https://storage.googleapis.com/hyperdx/sample.tar.gz)

      ```shell
      # curl
      curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz
      # or
      # wget https://storage.googleapis.com/hyperdx/sample.tar.gz
      ```

      Этот файл содержит примеры логов, метрик и трейсов из нашего публичного [OpenTelemetry demo](https://github.com/ClickHouse/opentelemetry-demo) — простого интернет-магазина с микросервисами. Скопируйте этот файл в директорию по вашему выбору.

      ### Загрузка тестовых данных

      Чтобы загрузить эти данные, отправьте их на HTTP-эндпоинт развёрнутого коллектора OpenTelemetry (OTel).

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

      Это имитирует источники логов, трассировок и метрик OTLP, отправляющие данные в OTel collector. В продакшене такими источниками могут быть клиентские библиотеки для различных языков программирования или даже другие OTel collector.

      Вернувшись в представление `Search`, вы увидите, что данные начали загружаться (если данные не отображаются, измените временной интервал на `Last 1 hour`):

      <Image img={hyperdx_10} alt="Поиск в HyperDX" size="lg" />

      Загрузка данных займёт несколько минут. Дождитесь завершения загрузки, прежде чем переходить к следующим шагам.

      ### Просмотр сессий

      Предположим, что поступили сообщения о проблемах пользователей при оплате товаров. Мы можем просмотреть их действия, используя возможности воспроизведения сеансов HyperDX.

      Выберите `Client Sessions` в левом меню.

      <Image img={hyperdx_11} alt="Сеансы" size="lg" />

      Это представление позволяет просматривать фронтенд-сеансы нашего интернет-магазина. Сеансы остаются анонимными до тех пор, пока пользователи не перейдут к оформлению заказа и не попытаются завершить покупку.

      Обратите внимание, что некоторые сессии с электронной почтой имеют связанную ошибку, что потенциально подтверждает отчёты о неудачных транзакциях.

      Выберите трассировку с ошибкой и связанным email. В открывшемся представлении можно воспроизвести сеанс пользователя и изучить его проблему. Нажмите кнопку воспроизведения для просмотра сеанса.

      <Image img={hyperdx_12} alt="Воспроизведение сеанса" size="lg" />

      Воспроизведение показывает, как пользователь перемещается по сайту и добавляет товары в корзину. При необходимости можно перейти к более поздней части сеанса, где он пытается завершить оплату.

      :::tip
      Все ошибки отмечены на временной шкале красным цветом.
      :::

      Пользователь не смог оформить заказ, при этом явная ошибка отсутствовала. Прокрутите вниз левую панель, содержащую сетевые события и события консоли из браузера пользователя. Вы увидите, что при выполнении вызова `/api/checkout` возникла ошибка 500.

      <Image img={hyperdx_13} alt="Ошибка сеанса" size="lg" />

      Выберите эту ошибку `500`. Ни раздел `Overview`, ни `Column Values` не указывают на источник проблемы — известно лишь то, что ошибка является неожиданной и вызывает `Internal Error`.

      ### Изучение трассировок

      Перейдите на вкладку `Trace`, чтобы увидеть полную распределённую трассировку.

      <Image img={hyperdx_14} alt="Трассировка сессии" size="lg" />

      Прокрутите трассировку вниз, чтобы увидеть источник ошибки — спан сервиса `checkout`. Выберите спан сервиса `Payment`.

      <Image img={hyperdx_15} alt="спан" size="lg" />

      Выберите вкладку `Column Values` и прокрутите вниз. Видно, что проблема связана с переполнением кеша.

      <Image img={hyperdx_16} alt="Значения столбца" size="lg" />

      Прокрутив страницу вверх и вернувшись к трассировке, мы видим, что логи коррелированы со спаном благодаря выполненной ранее конфигурации. Они предоставляют дополнительный контекст.

      <Image img={hyperdx_17} alt="Коррелированный лог" size="lg" />

      Установлено, что кеш в сервисе платежей переполняется, что блокирует завершение платежей.

      ### Просмотр логов

      Для получения дополнительной информации можно вернуться к `Search`:

      Выберите `Logs` в списке источников и примените фильтр для сервиса `payment`.

      <Image img={hyperdx_18} alt="Логи" size="lg" />

      Видно, что несмотря на недавнее возникновение проблемы, количество затронутых платежей велико. Кроме того, кеш, связанный с платежами Visa, судя по всему, является источником проблем.

      ### Метрики диаграммы

      Хотя в код явно была внесена ошибка, мы можем использовать метрики для проверки размера кэша. Перейдите в представление `Chart Explorer`.

      Выберите `Metrics` в качестве источника данных. Заполните конструктор графика для построения `Maximum` метрики `visa_validation_cache.size (Gauge)` и нажмите кнопку воспроизведения. Кэш явно увеличивался до достижения максимального размера, после чего начали генерироваться ошибки.

      <Image img={hyperdx_19} alt="Метрики" size="lg" />
    </VerticalStepper>
  </TabItem>

  <TabItem value="oss-clickstack" label="ClickStack с открытым исходным кодом">
    В следующем примере предполагается, что вы запустили Open Source ClickStack, следуя [инструкциям для универсального образа](/use-cases/observability/clickstack/getting-started/oss), и подключились к [локальному экземпляру ClickHouse](/use-cases/observability/clickstack/getting-started/oss#complete-connection-credentials).

    <VerticalStepper headerLevel="h3">
      ### Перейдите к пользовательскому интерфейсу ClickStack (HyperDX)

      Откройте [http://localhost:8080](http://localhost:8080) для доступа к интерфейсу ClickStack.

      <Image img={hyperdx} alt="Интерфейс ClickStack" size="lg" />

      ### Скопируйте ключ API для приёма данных

      Перейдите в [`Team Settings`](http://localhost:8080/team) и скопируйте `Ingestion API Key` из раздела `API Keys`. Этот ключ API для приёма данных обеспечивает безопасную ингестию данных через коллектор OpenTelemetry.

      <Image img={copy_api_key} alt="Копировать ключ API" size="lg" />

      ### Загрузка образцов данных

      Чтобы заполнить интерфейс примерными данными, загрузите следующий файл:

      [Тестовые данные](https://storage.googleapis.com/hyperdx/sample.tar.gz)

      ```shell
      # curl
      curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz
      # or
      # wget https://storage.googleapis.com/hyperdx/sample.tar.gz
      ```

      Этот файл содержит примеры логов, метрик и трейсов из нашего публичного [OpenTelemetry demo](https://github.com/ClickHouse/opentelemetry-demo) — простого интернет-магазина с микросервисами. Скопируйте этот файл в директорию по вашему выбору.

      ### Загрузка тестовых данных

      Чтобы загрузить эти данные, отправьте их на HTTP-эндпоинт развёрнутого коллектора OpenTelemetry (OTel).

      Сначала экспортируйте API-ключ, скопированный выше.

      ```shell
      # export API key
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

      Это имитирует источники логов, трассировок и метрик OTLP, отправляющие данные в OTel collector. В продакшене такими источниками могут быть клиентские библиотеки для различных языков программирования или даже другие OTel collector.

      Вернувшись в представление `Search`, вы увидите, что данные начали загружаться (если данные не отображаются, измените временной интервал на `Last 1 hour`):

      <Image img={hyperdx_10} alt="Поиск в HyperDX" size="lg" />

      Загрузка данных займёт несколько минут. Дождитесь завершения загрузки, прежде чем переходить к следующим шагам.

      ### Просмотр сессий

      Предположим, что поступили сообщения о проблемах пользователей при оплате товаров. Мы можем просмотреть их действия, используя возможности воспроизведения сеансов HyperDX.

      Выберите [`Client Sessions`](http://localhost:8080/sessions?from=1747312320000\&to=1747312920000\&sessionSource=l1324572572) из левого меню.

      <Image img={hyperdx_11} alt="Сессии" size="lg" />

      Это представление позволяет просматривать фронтенд-сеансы нашего интернет-магазина. Сеансы остаются анонимными до тех пор, пока пользователи не перейдут к оформлению заказа и не попытаются завершить покупку.

      Обратите внимание, что некоторые сессии с электронной почтой имеют связанную ошибку, что потенциально подтверждает отчёты о неудачных транзакциях.

      Выберите трассировку с ошибкой и связанным email. В открывшемся представлении можно воспроизвести сеанс пользователя и изучить его проблему. Нажмите кнопку воспроизведения для просмотра сеанса.

      <Image img={hyperdx_12} alt="Воспроизведение сессии" size="lg" />

      Воспроизведение показывает, как пользователь перемещается по сайту и добавляет товары в корзину. При необходимости можно перейти к более поздней части сеанса, где он пытается завершить оплату.

      :::tip
      Все ошибки отмечены на временной шкале красным цветом.
      :::

      Пользователь не смог оформить заказ, при этом явная ошибка отсутствовала. Прокрутите вниз левую панель, содержащую сетевые события и события консоли из браузера пользователя. Вы увидите, что при выполнении вызова `/api/checkout` возникла ошибка 500.

      <Image img={hyperdx_13} alt="Ошибка сеанса" size="lg" />

      Выберите эту ошибку `500`. Ни раздел `Overview`, ни `Column Values` не указывают на источник проблемы — известно лишь то, что ошибка является неожиданной и вызывает `Internal Error`.

      ### Изучение трассировок

      Перейдите на вкладку `Trace`, чтобы увидеть полную распределённую трассировку.

      <Image img={hyperdx_14} alt="Трассировка сессии" size="lg" />

      Прокрутите трассировку вниз, чтобы увидеть источник ошибки — спан сервиса `checkout`. Выберите спан сервиса `Payment`.

      <Image img={hyperdx_15} alt="Спан" size="lg" />

      Выберите вкладку `Column Values` и прокрутите вниз. Видно, что проблема связана с переполнением кеша.

      <Image img={hyperdx_16} alt="Значения столбца" size="lg" />

      Прокрутив страницу вверх и вернувшись к трассировке, мы видим, что логи коррелированы со спаном благодаря выполненной ранее конфигурации. Они предоставляют дополнительный контекст.

      <Image img={hyperdx_17} alt="Коррелированный лог" size="lg" />

      Установлено, что кеш в сервисе платежей переполняется, что блокирует завершение платежей.

      ### Просмотр логов

      Для получения дополнительной информации можно вернуться к [представлению `Search`](http://localhost:8080/search):

      Выберите `Logs` в списке источников и примените фильтр для сервиса `payment`.

      <Image img={hyperdx_18} alt="Логи" size="lg" />

      Видно, что несмотря на недавнее возникновение проблемы, количество затронутых платежей велико. Кроме того, кеш, связанный с платежами Visa, судя по всему, является источником проблем.

      ### Метрики диаграммы

      Хотя в код явно была внесена ошибка, мы можем использовать метрики для проверки размера кэша. Перейдите в представление `Chart Explorer`.

      Выберите `Metrics` в качестве источника данных. Заполните конструктор графика для построения `Maximum` метрики `visa_validation_cache.size (Gauge)` и нажмите кнопку воспроизведения. Кэш явно увеличивался до достижения максимального размера, после чего начали генерироваться ошибки.

      <Image img={hyperdx_19} alt="Метрики" size="lg" />
    </VerticalStepper>
  </TabItem>
</Tabs>
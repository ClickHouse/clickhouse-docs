---
slug: /use-cases/observability/clickstack/example-datasets/chrome-extension
title: 'Расширение для Chrome'
sidebar_position: 5
pagination_prev: null
pagination_next: null
description: 'Настройте ClickStack воспроизведение сеанса и RUM для любого веб-сайта с помощью расширения HyperDX для Chrome'
doc_type: 'guide'
keywords: ['clickstack', 'расширение для Chrome', 'воспроизведение сеанса', 'browser sdk', 'rum', 'обсервабилити', 'hyperdx']
---

import Image from '@theme/IdealImage';
import extension_config from '@site/static/images/clickstack/chrome-extension/extension-config.png';

:::note[Кратко]
В этом руководстве показано, как подключить ClickStack Browser SDK к любому сайту с помощью [расширения HyperDX для Chrome](https://github.com/kyreddie/hyperdx-chrome-extension). Вносить изменения в исходный код целевого приложения не нужно — один раз настройте расширение, откройте сайт и просматривайте воспроизведения сеансов в ClickStack.

Требуемое время: 10–15 минут
:::

## Обзор \{#overview\}

[Расширение HyperDX для Chrome](https://github.com/kyreddie/hyperdx-chrome-extension) внедряет SDK [@hyperdx/browser](https://github.com/hyperdxio/hyperdx-js) в страницы, которые вы посещаете. Это полезно, если вам нужно отлаживать воспроизведение сеанса, RUM или распространение трассировки на сайте без изменения его кода — например, в стороннем приложении, продакшн-сборке или на локальном dev-сервере со строгой Content Security Policy (CSP).

SDK встроен в расширение (~480 КБ), поэтому страницам не нужно загружать скрипты с CDN во время выполнения. Сначала расширение пытается внедрить внешний скрипт через `chrome-extension://`, а если CSP блокирует скрипты из источника расширения, переключается на встроенное внедрение.

В отличие от [Session Replay Demo](session-replay.md), где инструментируется демо-приложение под вашим контролем, этот подход работает с **любым** URL, который вы открываете в Chrome. Вы генерируете данные сеанса, взаимодействуя с сайтом как обычный пользователь.

Подробнее о воспроизведении сеанса и о том, как оно вписывается в ClickStack, см. на странице возможности [Session Replay](/use-cases/observability/clickstack/session-replay).

## Предварительные требования \{#prerequisites\}

* Google Chrome или браузер на базе Chromium (Edge, Brave и т. д.)
* Установленный [Docker](https://docs.docker.com/get-docker/), если вы запускаете ClickStack локально
* Свободные порты 4317, 4318 и 8080 (для локального ClickStack)

## Запуск демо \{#running-the-demo\}

<VerticalStepper headerLevel="h3">
  ### Клонируйте репозиторий расширения \{#clone-extension\}

  ```shell
  git clone https://github.com/kyreddie/hyperdx-chrome-extension
  cd hyperdx-chrome-extension
  ```

  ### Установите расширение \{#install-extension\}

  1. Откройте Chrome и перейдите на `chrome://extensions`.
  2. Включите **Developer mode** (в правом верхнем углу).
  3. Нажмите **Load unpacked**.
  4. Выберите каталог `hyperdx-chrome-extension`, который вы клонировали.

  Расширение появится на панели инструментов как **HyperDX Browser Extension**.

  ### Запустите ClickStack \{#start-clickstack\}

  Если у вас уже есть конечная точка для ингестии ClickStack или HyperDX, перейдите к разделу [Настройте расширение](#configure-extension).

  Для локального стека ClickStack запустите OpenTelemetry Collector. Замените `{{CLICKHOUSE_ENDPOINT}}` и `{{CLICKHOUSE_PASSWORD}}` своими сведениями о подключении к ClickHouse:

  ```shell
  export CLICKHOUSE_ENDPOINT={{CLICKHOUSE_ENDPOINT}}
  export CLICKHOUSE_PASSWORD={{CLICKHOUSE_PASSWORD}}

  docker run \
    -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
    -e CLICKHOUSE_USER=default \
    -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
    -p 8080:8080 \
    -p 4317:4317 \
    -p 4318:4318 \
    clickhouse/clickstack-otel-collector:latest
  ```

  Откройте HyperDX по адресу [http://localhost:8080](http://localhost:8080), чтобы убедиться, что интерфейс запущен.

  Полное локальное развертывание с ClickHouse и интерфейсом HyperDX описано в разделе [Getting started with ClickStack](/use-cases/observability/clickstack/getting-started/oss).

  ### Получите свой ключ API \{#get-api-key\}

  Для локального ClickStack ключ API может не потребоваться — оставьте это поле пустым в расширении при отправке телеметрии в самоуправляемый коллектор на `http://localhost:4318`.

  Для ингестии в ClickStack Cloud или HyperDX Cloud откройте HyperDX, перейдите в **Team Settings → API Keys** и скопируйте свой **Ingestion API Key**.

  ### Настройте расширение \{#configure-extension\}

  Нажмите значок **HyperDX Browser Extension** на панели инструментов Chrome и заполните настройки:

  | Поле                             | Пример для локального ClickStack      | Примечания                                                                                  |
  | -------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------- |
  | **Enable HyperDX Monitoring**    | On                                    | Основной переключатель для инъекции                                                         |
  | **Service Name**                 | `my-frontend-app`                     | Обязательно — определяет сервис в ClickStack                                                |
  | **API Key**                      | *(пусто)*                             | Требуется для облачной ингестии; необязательно для некоторых самоуправляемых конфигураций   |
  | **Collector URL**                | `http://localhost:4318`               | Конечная точка OTLP HTTP; значение по умолчанию для Cloud — `https://in-otel.hyperdx.io`    |
  | **Environment**                  | `development`                         | Необязательно — задаёт атрибут ресурса `deployment.environment`                             |
  | **Trace Propagation Targets**    | `/api\.myapp\.domain/i, /localhost/i` | Необязательно — разделённые запятыми шаблоны regex JavaScript для передачи trace-заголовков |
  | **Only inject on matching URLs** | Off                                   | Включите, чтобы ограничить список сайтов, на которых выполняется инструментирование         |
  | **Capture console logs**         | Off                                   | Включите, чтобы передавать вывод консоли браузера                                           |
  | **Advanced network capture**     | Off                                   | Включите для подробного захвата сетевых запросов                                            |

  Нажмите **Save Configuration**, затем перезагрузите все вкладки, которые хотите инструментировать.

  <Image img={extension_config} alt="Всплывающее окно конфигурации расширения HyperDX для Chrome с локальными настройками ClickStack" size="sm" />

  На снимке экрана выше показана типичная локальная конфигурация: мониторинг включён, имя сервиса задано, коллектор указывает на `http://localhost:4318`, а распространение trace ограничено URL-адресами API и localhost.

  ### Откройте сайт и создайте сеанс \{#browse-site\}

  Откройте в Chrome любой веб-сайт или локальное приложение — например, [http://localhost:3000](http://localhost:3000) для локального frontend-сервера разработки.

  Взаимодействуйте со страницей как обычно: переходите по ссылкам, отправляйте формы, вызывайте ошибки и переключайтесь между представлениями. Расширение автоматически внедряет Browser SDK при каждой загрузке страницы, если конфигурация корректна.

  ### Просмотрите воспроизведение сеанса \{#view-session-replay\}

  Вернитесь в HyperDX по адресу [http://localhost:8080](http://localhost:8080) и перейдите в **Client Sessions** на левой боковой панели.

  Вы должны увидеть свой сеанс в списке с его длительностью и количеством событий. Нажмите кнопку ▶️, чтобы воспроизвести его.

  Переключайтесь между режимами **Highlighted** и **All Events**, чтобы настроить уровень детализации на временной шкале.
</VerticalStepper>

## Фильтрация URL \{#url-filtering\}

По умолчанию расширение внедряет SDK на каждой посещаемой странице, когда включен мониторинг. Чтобы ограничить внедрение только определёнными сайтами, включите **Only inject on matching URLs** и добавьте по одному шаблону на строку (или перечислите их через запятую):

| Шаблон                     | Совпадает с                               |
| -------------------------- | ----------------------------------------- |
| `http://homedepot.com/*`   | Только HTTP на `homedepot.com`            |
| `*://homedepot.com/*`      | HTTP и HTTPS на `homedepot.com`           |
| `*://*.homedepot.com/*`    | Поддомены, например `www.homedepot.com`   |
| `https://localhost:3000/*` | Локальный сервер разработки на порту 3000 |

После сохранения шаблонов URL перезагрузите вкладку.

## Проверка внедрения \{#verify-injection\}

Откройте DevTools на странице, для которой настроен мониторинг (**Консоль**), перезагрузите страницу и проверьте наличие:

```text
[HyperDX Extension] Configuration valid, injecting HyperDX
[HyperDX Extension] Injected via extension scripts
[HyperDX Extension] HyperDX initialized
```

Если CSP блокирует скрипты, загружаемые из расширения, расширение выводит сообщение о переходе на резервный вариант и повторяет попытку, используя инлайн-внедрение.

## Устранение неполадок \{#troubleshooting\}

<details>
  <summary>Сеансы не отображаются в HyperDX</summary>

  1. Проверьте консоль браузера на наличие сообщений `[HyperDX Extension]` или ошибок
  2. Убедитесь, что параметр **Enable HyperDX Monitoring** включен и задано имя сервиса
  3. Проверьте, что ClickStack запущен и URL коллектора указан верно (например, `http://localhost:4318`)
  4. Измените временной диапазон в представлении Client Sessions (попробуйте **Last 15 minutes**)
  5. Выполните принудительное обновление браузера: `Cmd+Shift+R` (Mac) или `Ctrl+Shift+R` (Windows/Linux)
</details>

<details>
  <summary>Ошибки `chrome-extension://invalid/` </summary>

  Перезагрузите расширение на странице `chrome://extensions`, затем принудительно обновите вкладку. Это происходит, когда расширение было обновлено или перезагружено, пока вкладки ещё оставались открытыми.
</details>

<details>
  <summary>На сайте не выполняется инъекция</summary>

  1. Проверьте, что мониторинг включен и имя сервиса указано
  2. Если включен параметр **Only inject on matching URLs**, убедитесь, что URL текущей страницы соответствует одному из ваших шаблонов
  3. Некоторые сайты блокируют через CSP как инъекцию из расширения, так и инъекцию встроенных скриптов — на таких страницах инъекция может быть невозможна
  4.
</details>

<details>
  <summary>`HyperDX: Missing apiKey` в консоли </summary>

  Это ожидаемо, если поле API key пустое. Добавьте в HyperDX ключ API для приёма данных для конечных точек Cloud или проигнорируйте это сообщение, если ваш самоуправляемый коллектор принимает неаутентифицированный локальный трафик.
</details>

## Конфиденциальность \{#privacy\}

Расширение внедряет код для обсервабилити на страницы, которые вы посещаете. Используйте его только на сайтах, отладку которых вам разрешено выполнять. Не передавайте ключи API и не добавляйте их в систему контроля версий.

## Узнайте больше \{#learn-more\}

* [Воспроизведение сеанса](/use-cases/observability/clickstack/session-replay) — обзор возможности, варианты SDK и средства защиты конфиденциальности
* [Справочник по Browser SDK](/use-cases/observability/clickstack/sdks/browser) — полный набор параметров SDK и расширенная конфигурация
* [Демо воспроизведения сеанса](session-replay.md) — инструментируйте демоприложение из исходного кода
* [Начало работы с ClickStack](/use-cases/observability/clickstack/getting-started) — разверните ClickStack и настройте приём первых данных
* [Расширение HyperDX для Chrome на GitHub](https://github.com/kyreddie/hyperdx-chrome-extension) — исходный код и трекер ошибок
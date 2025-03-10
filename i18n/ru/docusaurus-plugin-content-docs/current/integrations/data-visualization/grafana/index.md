---
sidebar_label: Быстрый старт
sidebar_position: 1
slug: /integrations/grafana
description: Введение в использование ClickHouse с Grafana
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import search from '@site/static/images/integrations/data-visualization/grafana/search.png';
import install from '@site/static/images/integrations/data-visualization/grafana/install.png';
import add_new_ds from '@site/static/images/integrations/data-visualization/grafana/add_new_ds.png';
import quick_config from '@site/static/images/integrations/data-visualization/grafana/quick_config.png';
import valid_ds from '@site/static/images/integrations/data-visualization/grafana/valid_ds.png';


# Плагин источника данных ClickHouse для Grafana

С помощью Grafana вы можете исследовать и делиться всеми вашими данными через дашборды. 
Grafana требует плагин для подключения к ClickHouse, который легко устанавливается через их интерфейс.

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/bRce9xWiqQM"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

## 1. Соберите ваши данные для подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Создание пользователя только для чтения {#2-making-a-read-only-user}

При подключении ClickHouse к инструменту визуализации данных, такому как Grafana, рекомендуется создать пользователя только для чтения, чтобы защитить ваши данные от нежелательных изменений.

Grafana не проверяет, безопасны ли запросы. Запросы могут содержать любые SQL операторы, включая `DELETE` и `INSERT`.

Чтобы настроить пользователя только для чтения, выполните следующие шаги:
1. Создайте профиль пользователя `readonly`, следуя руководству [Создание пользователей и ролей в ClickHouse](/operations/access-rights).
2. Убедитесь, что у пользователя `readonly` достаточно прав для изменения настройки `max_execution_time`, необходимой для используемого [клиента clickhouse-go](https://github.com/ClickHouse/clickhouse-go).
3. Если вы используете общую инстанцию ClickHouse, не рекомендуется устанавливать `readonly=2` в профиле `readonly`. Вместо этого оставьте `readonly=1` и установите тип ограничения для `max_execution_time` на [changeable_in_readonly](/operations/settings/constraints-on-settings), чтобы разрешить изменение этой настройки.

## 3. Установить плагин ClickHouse для Grafana {#3--install-the-clickhouse-plugin-for-grafana}

Перед подключением Grafana к ClickHouse вам необходимо установить соответствующий плагин Grafana. Предполагая, что вы вошли в Grafana, выполните следующие шаги:

1. На странице **Подключения** в боковой панели выберите вкладку **Добавить новое подключение**.

2. Найдите **ClickHouse** и нажмите на подписанный плагин от Grafana Labs:

    <img src={search} class="image" alt="Выберите плагин ClickHouse на странице подключений" />

3. На следующем экране нажмите кнопку **Установить**:

    <img src={install} class="image" alt="Установка плагина ClickHouse" />

## 4. Определите источник данных ClickHouse {#4-define-a-clickhouse-data-source}

1. После завершения установки нажмите кнопку **Добавить новый источник данных**. (Также вы можете добавить источник данных на вкладке **Источники данных** на странице **Подключения**.)

    <img src={add_new_ds} class="image" alt="Создайте источник данных ClickHouse" />

2. Либо прокрутите вниз и найдите тип источника данных **ClickHouse**, либо поищите его в строке поиска на странице **Добавить источник данных**. Выберите источник данных **ClickHouse**, и появится следующая страница:

  <img src={quick_config} class="image" alt="Страница настройки подключения" />

3. Введите настройки вашего сервера и учетные данные. Ключевые настройки:

- **Адрес хоста сервера:** имя хоста вашего сервиса ClickHouse.
- **Порт сервера:** порт для вашего сервиса ClickHouse. Будет отличаться в зависимости от конфигурации сервера и протокола.
- **Протокол:** протокол, используемый для подключения к вашему сервису ClickHouse.
- **Безопасное соединение:** включите, если ваш сервер требует безопасного соединения.
- **Имя пользователя** и **Пароль**: введите ваши учетные данные пользователя ClickHouse. Если вы еще не настроили никаких пользователей, попробуйте `default` для имени пользователя. Рекомендуется [настроить пользователя только для чтения](#2-making-a-read-only-user).

Для получения дополнительных настроек ознакомьтесь с документацией по [конфигурации плагина](./config.md).

4. Нажмите кнопку **Сохранить и протестировать**, чтобы убедиться, что Grafana может подключиться к вашему сервису ClickHouse. Если все прошло успешно, вы увидите сообщение **Источник данных работает**:

    <img src={valid_ds} class="image" alt="Выберите Сохранить и протестировать" />

## 5. Следующие шаги {#5-next-steps}

Ваш источник данных теперь готов к использованию! Узнайте больше о том, как строить запросы с помощью [конструктора запросов](./query-builder.md).

Для получения дополнительной информации о конфигурации ознакомьтесь с документацией по [конфигурации плагина](./config.md).

Если вы ищете дополнительную информацию, которая не включена в эту документацию, ознакомьтесь с [репозиторием плагина на GitHub](https://github.com/grafana/clickhouse-datasource).

## Обновление версий плагинов {#upgrading-plugin-versions}

Начиная с версии 4, конфигурации и запросы могут быть обновлены по мере выпуска новых версий.

Конфигурации и запросы из версии 3 мигрируют в версию 4 по мере их открытия. Хотя старые конфигурации и дашборды будут загружаться в версии 4, миграция не сохраняется, пока они не будут снова сохранены в новой версии. Если вы заметили какие-либо проблемы при открытии старой конфигурации/запроса, отмените изменения и [сообщите об этом на GitHub](https://github.com/grafana/clickhouse-datasource/issues).

Плагин не может понизить версию до предыдущих версий, если конфигурация/запрос был создан с помощью более новой версии.

## Связанный контент {#related-content}

- [Репозиторий плагина на GitHub](https://github.com/grafana/clickhouse-datasource)
- Блог: [Визуализация данных с ClickHouse - Часть 1 - Grafana](https://clickhouse.com/blog/visualizing-data-with-grafana)
- Блог: [Визуализация данных ClickHouse с Grafana - Видео](https://www.youtube.com/watch?v=Ve-VPDxHgZU)
- Блог: [Плагин ClickHouse для Grafana 4.0 - Повышение уровней SQL наблюдаемости](https://clickhouse.com/blog/clickhouse-grafana-plugin-4-0)
- Блог: [Загрузка данных в ClickHouse - Часть 3 - Использование S3](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)
- Блог: [Создание решения для наблюдаемости с ClickHouse - Часть 1 - Логи](https://clickhouse.com/blog/storing-log-data-in-clickhouse-fluent-bit-vector-open-telemetry)
- Блог: [Создание решения для наблюдаемости с ClickHouse - Часть 2 - Трейсы](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
- Блог и вебинар: [История активности с открытым исходным кодом на GitHub с использованием ClickHouse + Grafana](https://clickhouse.com/blog/introduction-to-clickhouse-and-grafana-webinar)

---
sidebar_label: 'Быстрый старт'
sidebar_position: 1
slug: /integrations/grafana
description: 'Введение в использование ClickHouse с Grafana'
title: 'Плагин источника данных ClickHouse для Grafana'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';
import search from '@site/static/images/integrations/data-visualization/grafana/search.png';
import install from '@site/static/images/integrations/data-visualization/grafana/install.png';
import add_new_ds from '@site/static/images/integrations/data-visualization/grafana/add_new_ds.png';
import quick_config from '@site/static/images/integrations/data-visualization/grafana/quick_config.png';
import valid_ds from '@site/static/images/integrations/data-visualization/grafana/valid_ds.png';
import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Плагин источника данных ClickHouse для Grafana

<ClickHouseSupportedBadge/>

С помощью Grafana вы можете исследовать и делиться всеми вашими данными через информационные панели. Grafana требует плагин для подключения к ClickHouse, который легко устанавливается в их интерфейсе.

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

## 2. Создание пользователя с правами только для чтения {#2-making-a-read-only-user}

При подключении ClickHouse к инструменту визуализации данных, такому как Grafana, рекомендуется создать пользователя с правами только для чтения, чтобы защитить ваши данные от нежелательных модификаций.

Grafana не проверяет безопасность запросов. Запросы могут содержать любые SQL-операторы, включая `DELETE` и `INSERT`.

Чтобы настроить пользователя с правами только для чтения, выполните следующие шаги:
1. Создайте профиль пользователя `readonly` согласно [Создание пользователей и ролей в ClickHouse](/operations/access-rights).
2. Убедитесь, что у пользователя `readonly` достаточно прав для изменения настройки `max_execution_time`, необходимой для клиентского приложения [clickhouse-go](https://github.com/ClickHouse/clickhouse-go).
3. Если вы используете общественный экземпляр ClickHouse, не рекомендуется устанавливать `readonly=2` в профиле `readonly`. Вместо этого оставьте `readonly=1` и установите тип ограничения `max_execution_time` на [changeable_in_readonly](/operations/settings/constraints-on-settings), чтобы разрешить изменение этой настройки.

## 3. Установка плагина ClickHouse для Grafana {#3--install-the-clickhouse-plugin-for-grafana}

Перед тем как Grafana сможет подключиться к ClickHouse, вам нужно установить соответствующий плагин для Grafana. Предполагая, что вы вошли в систему Grafana, выполните следующие шаги:

1. На странице **Соединения** в боковом меню выберите вкладку **Добавить новое соединение**.

2. Найдите **ClickHouse** и кликните на подписи плагин от Grafana Labs:

    <Image size="md" img={search} alt="Выбор плагина ClickHouse на странице соединений" border />

3. На следующем экране нажмите кнопку **Установить**:

    <Image size="md" img={install} alt="Установить плагин ClickHouse" border />

## 4. Определите источник данных ClickHouse {#4-define-a-clickhouse-data-source}

1. После завершения установки нажмите кнопку **Добавить новый источник данных**. (Вы также можете добавить источник данных на вкладке **Источники данных** на странице **Соединения**.)

    <Image size="md" img={add_new_ds} alt="Создание источника данных ClickHouse" border />

2. Либо прокрутите вниз и найдите тип источника данных **ClickHouse**, либо можете найти его в строке поиска страницы **Добавить источник данных**. Выберите источник данных **ClickHouse**, и появится следующая страница:

  <Image size="md" img={quick_config} alt="Страница настройки подключения" border />

3. Введите настройки вашего сервера и учетные данные. Ключевые настройки:

- **Адрес хоста сервера:** имя хоста вашего сервиса ClickHouse.
- **Порт сервера:** порт вашего сервиса ClickHouse. Может отличаться в зависимости от конфигурации сервера и протокола.
- **Протокол** протокол, используемый для подключения к вашему сервису ClickHouse.
- **Безопасное соединение** включите, если ваш сервер требует безопасного соединения.
- **Имя пользователя** и **Пароль**: введите учетные данные вашего пользователя ClickHouse. Если вы не настроили никаких пользователей, попробуйте `default` для имени пользователя. Рекомендуется [настроить пользователя с правами только для чтения](#2-making-a-read-only-user).

Для получения дополнительных настроек ознакомьтесь с документацией по [конфигурации плагина](./config.md).

4. Нажмите кнопку **Сохранить и протестировать**, чтобы проверить, может ли Grafana подключиться к вашему сервису ClickHouse. В случае успеха вы увидите сообщение **Источник данных работает**:

    <Image size="md" img={valid_ds} alt="Выбор Сохранить и протестировать" border />

## 5. Следующие шаги {#5-next-steps}

Ваш источник данных теперь готов к использованию! Узнайте больше о том, как создавать запросы с помощью [конструктора запросов](./query-builder.md).

Для получения дополнительных сведений о конфигурации обратитесь к документации по [конфигурации плагина](./config.md).

Если вы ищете дополнительную информацию, которая не включена в эту документацию, ознакомьтесь с [репозиторием плагина на GitHub](https://github.com/grafana/clickhouse-datasource).

## Обновление версий плагина {#upgrading-plugin-versions}

Начиная с версии 4, конфигурации и запросы могут быть обновлены по мере выхода новых версий.

Конфигурации и запросы из версии 3 перекладываются на версию 4 по мере их открытия. Хотя старые конфигурации и панели будут загружены в версии 4, миграция не сохраняется до тех пор, пока они не будут снова сохранены в новой версии. Если вы заметили какие-либо проблемы при открытии старой конфигурации/запроса, отклоните ваши изменения и [сообщите об ошибке на GitHub](https://github.com/grafana/clickhouse-datasource/issues).

Плагин не может быть понижен до предыдущих версий, если конфигурация/запрос был создан с помощью более новой версии.

## Связанный контент {#related-content}

- [Репозиторий плагина на GitHub](https://github.com/grafana/clickhouse-datasource)
- Блог: [Визуализация данных с ClickHouse - Часть 1 - Grafana](https://clickhouse.com/blog/visualizing-data-with-grafana)
- Блог: [Визуализация данных ClickHouse с помощью Grafana - Видео](https://www.youtube.com/watch?v=Ve-VPDxHgZU)
- Блог: [Плагин ClickHouse для Grafana 4.0 - Повышение визуализации SQL](https://clickhouse.com/blog/clickhouse-grafana-plugin-4-0)
- Блог: [Передача данных в ClickHouse - Часть 3 - Использование S3](https://clickhouse.com/blog/getting-data-into-clickhouse-part-3-s3)
- Блог: [Создание решения для мониторинга с ClickHouse - Часть 1 - Журналы](https://clickhouse.com/blog/storing-log-data-in-clickhouse-fluent-bit-vector-open-telemetry)
- Блог: [Создание решения для мониторинга с ClickHouse - Часть 2 - Трассировки](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)
- Блог и вебинар: [История открытого кода активности GitHub с использованием ClickHouse + Grafana](https://clickhouse.com/blog/introduction-to-clickhouse-and-grafana-webinar)

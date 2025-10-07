---
'sidebar_label': 'Быстрый старт'
'sidebar_position': 1
'slug': '/integrations/grafana'
'description': 'Введение в использование ClickHouse с Grafana'
'title': 'Плагин источника данных ClickHouse для Grafana'
'show_related_blogs': true
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import search from '@site/static/images/integrations/data-visualization/grafana/search.png';
import install from '@site/static/images/integrations/data-visualization/grafana/install.png';
import add_new_ds from '@site/static/images/integrations/data-visualization/grafana/add_new_ds.png';
import quick_config from '@site/static/images/integrations/data-visualization/grafana/quick_config.png';
import valid_ds from '@site/static/images/integrations/data-visualization/grafana/valid_ds.png';
import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Плагин источника данных ClickHouse для Grafana

<ClickHouseSupportedBadge/>

С помощью Grafana вы можете исследовать и делиться всеми своими данными через панели мониторинга. Grafana требует плагин для подключения к ClickHouse, который легко устанавливается через их интерфейс.

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

## 1. Соберите данные для подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Создание пользователя с правами только на чтение {#2-making-a-read-only-user}

При подключении ClickHouse к инструменту визуализации данных, такому как Grafana, рекомендуется создать пользователя с правами только на чтение, чтобы защитить ваши данные от нежелательных изменений.

Grafana не проверяет безопасность запросов. Запросы могут содержать любые SQL операторы, включая `DELETE` и `INSERT`.

Чтобы настроить пользователя с правами только на чтение, выполните следующие шаги:
1. Создайте профиль пользователя `readonly`, следуя руководству [Создание пользователей и ролей в ClickHouse](/operations/access-rights).
2. Убедитесь, что у пользователя `readonly` достаточно прав для изменения настройки `max_execution_time`, необходимой для используемого клиентского приложения [clickhouse-go](https://github.com/ClickHouse/clickhouse-go).
3. Если вы используете публичный экземпляр ClickHouse, не рекомендуется устанавливать `readonly=2` в профиле `readonly`. Вместо этого оставьте `readonly=1` и установите тип ограничения для `max_execution_time` на [changeable_in_readonly](/operations/settings/constraints-on-settings), чтобы разрешить изменение этой настройки.

## 3. Установка плагина ClickHouse для Grafana {#3--install-the-clickhouse-plugin-for-grafana}

Прежде чем Grafana сможет подключиться к ClickHouse, вам необходимо установить соответствующий плагин Grafana. Если вы вошли в систему Grafana, выполните следующие шаги:

1. На странице **Подключения** в боковом меню выберите вкладку **Добавить новое соединение**.

2. Найдите **ClickHouse** и нажмите на подписанный плагин от Grafana Labs:

    <Image size="md" img={search} alt="Выберите плагин ClickHouse на странице соединений" border />

3. На следующем экране нажмите кнопку **Установить**:

    <Image size="md" img={install} alt="Установите плагин ClickHouse" border />

## 4. Определение источника данных ClickHouse {#4-define-a-clickhouse-data-source}

1. После завершения установки нажмите кнопку **Добавить новый источник данных**. (Вы также можете добавить источник данных на вкладке **Источники данных** на странице **Подключения**.)

    <Image size="md" img={add_new_ds} alt="Создать источник данных ClickHouse" border />

2. Либо прокрутите вниз и найдите тип источника данных **ClickHouse**, либо вы можете искать его в строке поиска на странице **Добавить источник данных**. Выберите источник данных **ClickHouse**, и появится следующая страница:

  <Image size="md" img={quick_config} alt="Страница конфигурации соединения" border />

3. Введите настройки вашего сервера и учетные данные. Ключевые параметры:

- **Адрес хоста сервера:** имя хоста вашего сервиса ClickHouse.
- **Порт сервера:** порт для вашего сервиса ClickHouse. Будет отличаться в зависимости от конфигурации сервера и протокола.
- **Протокол:** протокол, используемый для подключения к вашему сервису ClickHouse.
- **Безопасное соединение:** включите, если ваш сервер требует безопасного соединения.
- **Имя пользователя** и **Пароль**: введите учетные данные вашего пользователя ClickHouse. Если вы не настроили пользователей, попробуйте `default` для имени пользователя. Рекомендуется [настроить пользователя с правами только на чтение](#2-making-a-read-only-user).

Для получения дополнительных настроек ознакомьтесь с документацией по [конфигурации плагина](./config.md).

4. Нажмите кнопку **Сохранить и протестировать**, чтобы проверить, может ли Grafana подключиться к вашему сервису ClickHouse. Если успешно, вы увидите сообщение **Источник данных работает**:

    <Image size="md" img={valid_ds} alt="Выберите Сохранить и протестировать" border />

## 5. Следующие шаги {#5-next-steps}

Ваш источник данных теперь готов к использованию! Узнайте больше о том, как строить запросы с помощью [конструктора запросов](./query-builder.md).

Для получения более подробной информации о конфигурации ознакомьтесь с документацией по [конфигурации плагина](./config.md).

Если вы ищете дополнительную информацию, которой нет в этой документации, посмотрите [репозиторий плагина на GitHub](https://github.com/grafana/clickhouse-datasource).

## Обновление версий плагинов {#upgrading-plugin-versions}

Начиная с версии 4, конфигурации и запросы могут быть обновлены при выходе новых версий.

Конфигурации и запросы из версии 3 мигрируют на версию 4 по мере их открытия. Хотя старые конфигурации и панели будут загружаться в версии 4, миграция не будет сохранена до тех пор, пока они не будут снова сохранены в новой версии. Если вы заметили какие-либо проблемы при открытии старой конфигурации/запроса, отмените изменения и [сообщите о проблеме на GitHub](https://github.com/grafana/clickhouse-datasource/issues).

Плагин не может быть понижен до предыдущих версий, если конфигурация/запрос был создан с новой версией.

---
sidebar_label: 'Быстрый старт'
sidebar_position: 1
slug: /integrations/grafana
description: 'Введение в работу с ClickHouse в Grafana'
title: 'Плагин источника данных ClickHouse для Grafana'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
  - website: 'https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/'
keywords: ['Grafana', 'визуализация данных', 'дашборд', 'плагин', 'источник данных']
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

С помощью Grafana вы можете исследовать и визуализировать все свои данные в дашбордах.
Для подключения к ClickHouse в Grafana требуется плагин, который легко установить через её интерфейс.

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


## 2. Создание пользователя только для чтения {#2-making-a-read-only-user}

При подключении ClickHouse к инструменту визуализации данных, такому как Grafana, рекомендуется создать пользователя только для чтения, чтобы защитить ваши данные от нежелательных изменений.

Grafana не проверяет безопасность запросов. Запросы могут содержать любые SQL-инструкции, включая `DELETE` и `INSERT`.

Чтобы настроить пользователя только для чтения, выполните следующие действия:

1. Создайте профиль пользователя `readonly`, следуя руководству [Создание пользователей и ролей в ClickHouse](/operations/access-rights).
2. Убедитесь, что пользователь `readonly` имеет достаточные права для изменения настройки `max_execution_time`, которая требуется базовому [клиенту clickhouse-go](https://github.com/ClickHouse/clickhouse-go).
3. Если вы используете публичный экземпляр ClickHouse, не рекомендуется устанавливать `readonly=2` в профиле `readonly`. Вместо этого оставьте `readonly=1` и установите тип ограничения для `max_execution_time` как [changeable_in_readonly](/operations/settings/constraints-on-settings), чтобы разрешить изменение этой настройки.


## 3. Установка плагина ClickHouse для Grafana {#3--install-the-clickhouse-plugin-for-grafana}

Перед подключением Grafana к ClickHouse необходимо установить соответствующий плагин Grafana. Предполагается, что вы уже вошли в систему Grafana. Выполните следующие шаги:

1. На странице **Connections** в боковой панели выберите вкладку **Add new connection**.

2. Найдите **ClickHouse** и нажмите на подписанный плагин от Grafana Labs:

   <Image
     size='md'
     img={search}
     alt='Выберите плагин ClickHouse на странице подключений'
     border
   />

3. На следующем экране нажмите кнопку **Install**:

   <Image size='md' img={install} alt='Установите плагин ClickHouse' border />


## 4. Определение источника данных ClickHouse {#4-define-a-clickhouse-data-source}

1. После завершения установки нажмите кнопку **Add new data source**. (Источник данных также можно добавить на вкладке **Data sources** страницы **Connections**.)

   <Image
     size='md'
     img={add_new_ds}
     alt='Создание источника данных ClickHouse'
     border
   />

2. Прокрутите вниз и найдите тип источника данных **ClickHouse** или воспользуйтесь строкой поиска на странице **Add data source**. Выберите источник данных **ClickHouse** — откроется следующая страница:

<Image
  size='md'
  img={quick_config}
  alt='Страница настройки подключения'
  border
/>

3. Введите настройки сервера и учетные данные. Основные параметры:

- **Server host address:** имя хоста вашего сервиса ClickHouse.
- **Server port:** порт вашего сервиса ClickHouse. Зависит от конфигурации сервера и используемого протокола.
- **Protocol:** протокол, используемый для подключения к вашему сервису ClickHouse.
- **Secure connection:** включите, если сервер требует защищенного соединения.
- **Username** и **Password**: введите учетные данные пользователя ClickHouse. Если пользователи не настроены, попробуйте использовать `default` в качестве имени пользователя. Рекомендуется [настроить пользователя с правами только для чтения](#2-making-a-read-only-user).

Дополнительные настройки см. в документации по [конфигурации плагина](./config.md).

4. Нажмите кнопку **Save & test**, чтобы проверить возможность подключения Grafana к вашему сервису ClickHouse. При успешном подключении вы увидите сообщение **Data source is working**:

   <Image size='md' img={valid_ds} alt='Нажмите Save & test' border />


## 5. Следующие шаги {#5-next-steps}

Источник данных готов к использованию! Подробнее о создании запросов см. в разделе [конструктор запросов](./query-builder.md).

Дополнительную информацию о конфигурации см. в документации по [настройке плагина](./config.md).

Если вам требуется информация, не представленная в данной документации, обратитесь к [репозиторию плагина на GitHub](https://github.com/grafana/clickhouse-datasource).


## Обновление версий плагина {#upgrading-plugin-versions}

Начиная с версии 4, конфигурации и запросы могут обновляться по мере выхода новых версий.

Конфигурации и запросы из версии 3 мигрируются в версию 4 при их открытии. Хотя старые конфигурации и дашборды загружаются в версии 4, миграция не сохраняется до тех пор, пока они не будут сохранены повторно в новой версии. Если вы заметите какие-либо проблемы при открытии старой конфигурации или запроса, отмените изменения и [сообщите о проблеме на GitHub](https://github.com/grafana/clickhouse-datasource/issues).

Плагин не может выполнить откат к предыдущим версиям, если конфигурация или запрос были созданы в более новой версии.

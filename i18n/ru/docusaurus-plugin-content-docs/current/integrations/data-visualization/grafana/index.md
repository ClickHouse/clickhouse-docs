---
sidebar_label: 'Быстрый старт'
sidebar_position: 1
slug: /integrations/grafana
description: 'Введение в использование ClickHouse с Grafana'
title: 'Плагин источника данных ClickHouse для Grafana'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/'
keywords: ['Grafana', 'визуализация данных', 'дашборд', 'плагин', 'источник данных']
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import search from '@site/static/images/integrations/data-visualization/grafana/search.png';
import install from '@site/static/images/integrations/data-visualization/grafana/install.png';
import add_new_ds from '@site/static/images/integrations/data-visualization/grafana/add_new_ds.png';
import quick_config from '@site/static/images/integrations/data-visualization/grafana/quick_config.png';
import valid_ds from '@site/static/images/integrations/data-visualization/grafana/valid_ds.png';
import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Плагин источника данных ClickHouse для Grafana {#clickhouse-data-source-plugin-for-grafana}

<ClickHouseSupportedBadge/>

С помощью Grafana вы можете исследовать свои данные и делиться ими с помощью дашбордов.
Для подключения к ClickHouse в Grafana требуется плагин, который можно легко установить через интерфейс Grafana.

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

## 1. Соберите сведения о подключении {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Создание пользователя только для чтения {#2-making-a-read-only-user}

При подключении ClickHouse к инструменту визуализации данных, например Grafana, рекомендуется создать пользователя только для чтения, чтобы защитить данные от нежелательных изменений.

Grafana не проверяет, что выполняемые запросы безопасны. Запросы могут содержать любые SQL-операторы, включая `DELETE` и `INSERT`.

Чтобы настроить пользователя только для чтения, выполните следующие шаги:

1. Создайте профиль пользователя `readonly` в соответствии с руководством [Создание пользователей и ролей в ClickHouse](/operations/access-rights).
2. Убедитесь, что у пользователя `readonly` достаточно прав для изменения настройки `max_execution_time`, требуемой используемым [клиентом clickhouse-go](https://github.com/ClickHouse/clickhouse-go).
3. Если вы используете публичный экземпляр ClickHouse, не рекомендуется устанавливать `readonly=2` в профиле `readonly`. Вместо этого оставьте `readonly=1` и установите тип ограничения параметра `max_execution_time` в значение [changeable_in_readonly](/operations/settings/constraints-on-settings), чтобы разрешить изменение этой настройки.

## 3.  Установите плагин ClickHouse для Grafana {#3--install-the-clickhouse-plugin-for-grafana}

Прежде чем Grafana сможет подключиться к ClickHouse, необходимо установить соответствующий плагин Grafana. Если вы уже вошли в Grafana, выполните следующие шаги:

1. На странице **Connections** в боковой панели выберите вкладку **Add new connection**.

2. Найдите **ClickHouse** и нажмите на подписанный Grafana Labs плагин:

    <Image size="md" img={search} alt="Выберите плагин ClickHouse на странице подключений" border />

3. На следующем экране нажмите кнопку **Install**:

    <Image size="md" img={install} alt="Установите плагин ClickHouse" border />

## 4. Определите источник данных ClickHouse {#4-define-a-clickhouse-data-source}

1. После завершения установки нажмите кнопку **Add new data source**. (Вы также можете добавить источник данных на вкладке **Data sources** на странице **Connections**.)

    <Image size="md" img={add_new_ds} alt="Создание источника данных ClickHouse" border />

2. Прокрутите вниз и найдите тип источника данных **ClickHouse** или воспользуйтесь строкой поиска на странице **Add data source**. Выберите источник данных **ClickHouse**, после чего откроется следующая страница:

<Image size="md" img={quick_config} alt="Страница конфигурации подключения" border />

3. Введите настройки сервера и учетные данные. Основные параметры:

- **Server host address:** имя хоста сервиса ClickHouse.
- **Server port:** порт сервиса ClickHouse. Значение зависит от конфигурации сервера и используемого протокола.
- **Protocol:** протокол, используемый для подключения к сервису ClickHouse.
- **Secure connection:** включите, если для вашего сервера требуется защищённое соединение.
- **Username** и **Password**: введите учётные данные пользователя ClickHouse. Если пользователи не настроены, попробуйте `default` в качестве имени пользователя. Рекомендуется [настроить пользователя только для чтения](#2-making-a-read-only-user).

Дополнительные параметры приведены в документации по [конфигурации плагина](./config.md).

4. Нажмите кнопку **Save & test**, чтобы убедиться, что Grafana может подключиться к вашему сервису ClickHouse. В случае успеха вы увидите сообщение **Data source is working**:

    <Image size="md" img={valid_ds} alt="Выбор Save & test" border />

## 5. Следующие шаги {#5-next-steps}

Ваш источник данных готов к использованию! Узнайте больше о том, как составлять запросы с помощью [конструктора запросов](./query-builder.md).

Для получения дополнительных сведений о конфигурации см. документацию по [конфигурации плагина](./config.md).

Если вы ищете информацию, которая не включена в эту документацию, ознакомьтесь с [репозиторием плагина на GitHub](https://github.com/grafana/clickhouse-datasource).

## Обновление версий плагина {#upgrading-plugin-versions}

Начиная с v4, конфигурации и запросы можно обновлять по мере выхода новых версий.

Конфигурации и запросы из v3 автоматически преобразуются в формат v4 при их открытии. Хотя старые конфигурации и дашборды будут загружаться в v4, результаты миграции не сохраняются, пока вы не сохраните их заново в новой версии. Если вы заметите какие-либо проблемы при открытии старой конфигурации или запроса, отмените изменения и [сообщите о проблеме на GitHub](https://github.com/grafana/clickhouse-datasource/issues).

Плагин не поддерживает откат на предыдущие версии, если конфигурация или запрос были созданы в более новой версии.
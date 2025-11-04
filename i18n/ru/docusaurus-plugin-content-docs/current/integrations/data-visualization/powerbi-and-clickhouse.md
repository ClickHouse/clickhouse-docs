---
slug: '/integrations/powerbi'
sidebar_label: 'Power BI'
description: 'Microsoft Power BI — это продукт программного обеспечения для визуализации'
title: 'Power BI'
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui']
doc_type: guide
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import powerbi_odbc_install from '@site/static/images/integrations/data-visualization/powerbi_odbc_install.png';
import powerbi_odbc_search from '@site/static/images/integrations/data-visualization/powerbi_odbc_search.png';
import powerbi_odbc_verify from '@site/static/images/integrations/data-visualization/powerbi_odbc_verify.png';
import powerbi_get_data from '@site/static/images/integrations/data-visualization/powerbi_get_data.png';
import powerbi_search_clickhouse from '@site/static/images/integrations/data-visualization/powerbi_search_clickhouse.png';
import powerbi_connect_db from '@site/static/images/integrations/data-visualization/powerbi_connect_db.png';
import powerbi_connect_user from '@site/static/images/integrations/data-visualization/powerbi_connect_user.png';
import powerbi_table_navigation from '@site/static/images/integrations/data-visualization/powerbi_table_navigation.png';
import powerbi_add_dsn from '@site/static/images/integrations/data-visualization/powerbi_add_dsn.png';
import powerbi_select_unicode from '@site/static/images/integrations/data-visualization/powerbi_select_unicode.png';
import powerbi_connection_details from '@site/static/images/integrations/data-visualization/powerbi_connection_details.png';
import powerbi_select_odbc from '@site/static/images/integrations/data-visualization/powerbi_select_odbc.png';
import powerbi_select_dsn from '@site/static/images/integrations/data-visualization/powerbi_select_dsn.png';
import powerbi_dsn_credentials from '@site/static/images/integrations/data-visualization/powerbi_dsn_credentials.png';
import powerbi_16 from '@site/static/images/integrations/data-visualization/powerbi_16.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Power BI

<ClickHouseSupportedBadge/>

Microsoft Power BI может запрашивать или загружать данные из [ClickHouse Cloud](https://clickhouse.com/cloud) или из самоуправляемого развертывания.

Существует несколько версий Power BI, которые вы можете использовать для визуализации ваших данных:

* Power BI Desktop: настольное приложение для Windows для создания панелей мониторинга и визуализаций
* Power BI Service: доступен в Azure как SaaS для хостинга панелей мониторинга, созданных в Power BI Desktop

Power BI требует, чтобы вы создавали свои панели мониторинга в настольной версии и публиковали их в Power BI Service.

Этот урок проведет вас через процесс:

* [Установки драйвера ClickHouse ODBC](#install-the-odbc-driver)
* [Установки соединителя ClickHouse для Power BI в Power BI Desktop](#power-bi-installation)
* [Запроса данных из ClickHouse для визуализации в Power BI Desktop](#query-and-visualise-data)
* [Настройки локального шлюза данных для Power BI Service](#power-bi-service)

## Предварительные требования {#prerequisites}

### Установка Power BI {#power-bi-installation}

В этом руководстве предполагается, что у вас установлена Microsoft Power BI Desktop на вашем компьютере с Windows. Вы можете скачать и установить Power BI Desktop [здесь](https://www.microsoft.com/en-us/download/details.aspx?id=58494).

Мы рекомендуем обновиться до последней версии Power BI. Соединитель ClickHouse доступен по умолчанию с версии `2.137.751.0`.

### Соберите свои данные подключения ClickHouse {#gather-your-clickhouse-connection-details}

Вам понадобятся следующие данные для подключения к вашему экземпляру ClickHouse:

* Имя хоста - ClickHouse
* Имя пользователя - учетные данные пользователя
* Пароль - пароль пользователя
* База данных - имя базы данных на экземпляре, к которому вы хотите подключиться

## Power BI Desktop {#power-bi-desktop}

Чтобы начать работу с запросами данных в Power BI Desktop, вам необходимо выполнить следующие шаги:

1. Установить драйвер ClickHouse ODBC
2. Найти соединитель ClickHouse
3. Подключиться к ClickHouse
4. Запросить и визуализировать ваши данные

### Установите ODBC драйвер {#install-the-odbc-driver}

Скачайте последнюю [версию ClickHouse ODBC](https://github.com/ClickHouse/clickhouse-odbc/releases).

Запустите поставленный установщик `.msi` и следуйте указаниям мастера.

<Image size="md" img={powerbi_odbc_install} alt="Мастер установки драйвера ClickHouse ODBC, показывающий варианты установки" border />
<br/>

:::note
`Символы отладки` являются необязательными и не требуются
:::

#### Проверьте ODBC драйвер {#verify-odbc-driver}

Когда установка драйвера завершена, вы можете проверить, была ли установка успешной, выполнив:

Поиск ODBC в меню Пуск и выберите "ODBC Data Sources **(64-bit)**".

<Image size="md" img={powerbi_odbc_search} alt="Поиск Windows, показывающий вариант ODBC Data Sources (64-bit)" border />
<br/>

Проверьте, что драйвер ClickHouse отображается в списке.

<Image size="md" img={powerbi_odbc_verify} alt="Администратор источников данных ODBC, показывающий драйверы ClickHouse на вкладке Драйверы" border />
<br/>

### Найдите соединитель ClickHouse {#find-the-clickhouse-connector}

:::note
Доступен в версии `2.137.751.0` Power BI Desktop
:::
На стартовом экране Power BI Desktop нажмите "Получить данные".

<Image size="md" img={powerbi_get_data} alt="Главный экран Power BI Desktop, показывающий кнопку Получить данные" border />
<br/>

Поиск по запросу "ClickHouse"

<Image size="md" img={powerbi_search_clickhouse} alt="Диалог Получить данные Power BI с поиском ClickHouse в строке поиска" border />
<br/>

### Подключитесь к ClickHouse {#connect-to-clickhouse}

Выберите соединитель и введите учетные данные экземпляра ClickHouse:

* Хост (обязательный) - Ваш домен/адрес экземпляра. Убедитесь, что добавили его без префиксов/суффиксов.
* Порт (обязательный) - Порт вашего экземпляра.
* База данных - Название вашей базы данных.
* Параметры - Любая опция ODBC, как указано
  в [странице ClickHouse ODBC на GitHub](https://github.com/ClickHouse/clickhouse-odbc#configuration)
* Режим подключения данных - DirectQuery

<Image size="md" img={powerbi_connect_db} alt="Диалог подключения ClickHouse, показывающий поля хоста, порта, базы данных и режима подключения" border />
<br/>

:::note
Мы советуем выбирать DirectQuery для прямых запросов к ClickHouse.

Если у вас есть случай использования с небольшим объемом данных, вы можете выбрать режим импорта, и все данные будут загружены в Power BI.
:::

* Укажите имя пользователя и пароль

<Image size="md" img={powerbi_connect_user} alt="Диалог учетных данных подключения ClickHouse для имени пользователя и пароля" border />
<br/>

### Запрос и визуализация данных {#query-and-visualise-data}

Наконец, вы должны увидеть базы данных и таблицы в представлении Навигатор. Выберите нужную таблицу и нажмите "Загрузить", чтобы
импортировать данные из ClickHouse.

<Image size="md" img={powerbi_table_navigation} alt="Представление Навигатор Power BI, показывающее таблицы базы данных ClickHouse и образец данных" border />
<br/>

После завершения импорта ваши данные ClickHouse должны быть доступны в Power BI как обычно.
<br/>

## Power BI Service {#power-bi-service}

Чтобы использовать Microsoft Power BI Service, вам нужно создать [локальный шлюз данных](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem).

Для получения дополнительной информации о том, как настроить пользовательские соединители, пожалуйста, обратитесь к документации Microsoft о том, как [использовать пользовательские соединители данных с локальным шлюзом данных](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors).

## ODBC драйвер (только импорт) {#odbc-driver-import-only}

Мы рекомендуем использовать соединитель ClickHouse, который использует DirectQuery.

Установите [ODBC драйвер](#install-the-odbc-driver) на экземпляр локального шлюза данных и [проверьте](#verify-odbc-driver), как описано выше.

### Создание нового пользовательского DSN {#create-a-new-user-dsn}

Когда установка драйвера завершена, можно создать источник данных ODBC. Поиск ODBC в меню Пуск и выберите "ODBC Data Sources (64-bit)".

<Image size="md" img={powerbi_odbc_search} alt="Поиск Windows, показывающий вариант ODBC Data Sources (64-bit)" border />
<br/>

Нам нужно добавить новый пользовательский DSN здесь. Нажмите кнопку "Добавить" слева.

<Image size="md" img={powerbi_add_dsn} alt="Администратор источников данных ODBC с выделенной кнопкой Добавить для создания нового DSN" border />
<br/>

Выберите юникодную версию ODBC драйвера.

<Image size="md" img={powerbi_select_unicode} alt="Диалог создания нового источника данных, показывающий выбор юникодного драйвера ClickHouse" border />
<br/>

Заполните данные подключения.

<Image size="sm" img={powerbi_connection_details} alt="Диалог конфигурации драйвера ClickHouse ODBC с параметрами подключения" border />
<br/>

:::note
Если вы используете развертывание, в котором включен SSL (например, ClickHouse Cloud или самоуправляемый экземпляр), в поле `SSLMode` вы должны указать `require`.

- `Host` всегда должен иметь протокол (т.е. `http://` или `https://`) без него.
- `Timeout` - это целое число, представляющее секунды. Значение по умолчанию: `30 секунд`.
:::

### Получите данные в Power BI {#get-data-into-power-bi}

Если у вас еще не установлен Power BI,
[скачайте и установите Power BI Desktop](https://www.microsoft.com/en-us/download/details.aspx?id=58494).

На стартовом экране Power BI Desktop нажмите "Получить данные".

<Image size="md" img={powerbi_get_data} alt="Главный экран Power BI Desktop, показывающий кнопку Получить данные" border />
<br/>

Выберите "Другое" -> "ODBC".

<Image size="md" img={powerbi_select_odbc} alt="Диалог Получить данные Power BI с выбранной опцией ODBC в категории Другое" border />
<br/>

Выберите ваш ранее созданный источник данных из списка.

<Image size="md" img={powerbi_select_dsn} alt="Диалог выбора драйвера ODBC, показывающий сконфигурированный DSN ClickHouse" border />
<br/>

:::note
Если вы не указали учетные данные во время создания источника данных, вам будет предложено указать имя пользователя и пароль.
:::

<Image size="md" img={powerbi_dsn_credentials} alt="Диалог учетных данных для подключения ODBC DSN" border />
<br/>

Наконец, вы должны увидеть базы данных и таблицы в представлении Навигатор. Выберите нужную таблицу и нажмите "Загрузить", чтобы импортировать данные из ClickHouse.

<Image size="md" img={powerbi_table_navigation} alt="Представление Навигатор Power BI, показывающее таблицы базы данных ClickHouse и образец данных" border />
<br/>

После завершения импорта ваши данные ClickHouse должны быть доступны в Power BI как обычно.

## Известные ограничения {#known-limitations}

### UInt64 {#uint64}

Беззнаковые целочисленные типы, такие как UInt64 или больше, не будут загружены в набор данных автоматически, так как Int64 является максимальным целочисленным типом, поддерживаемым Power BI.

:::note
Чтобы правильно импортировать данные, прежде чем нажимать кнопку "Загрузить" в Навигаторе, сначала нажмите "Преобразовать данные".
:::

В этом примере в таблице `pageviews` есть столбец UInt64, который по умолчанию распознается как "Binary".
"Преобразовать данные" открывает редактор Power Query, где мы можем переназначить тип столбца, установив его, например, как текст.

<Image size="md" img={powerbi_16} alt="Редактор Power Query, показывающий преобразование типа данных для столбца UInt64" border />
<br/>

По завершении нажмите "Закрыть и применить" в верхнем левом углу и продолжайте загрузку данных.
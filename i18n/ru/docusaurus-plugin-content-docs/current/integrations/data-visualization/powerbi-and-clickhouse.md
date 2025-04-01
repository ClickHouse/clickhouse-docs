---
sidebar_label: 'Power BI'
slug: /integrations/powerbi
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui']
description: 'Microsoft Power BI — это интерактивный продукт для визуализации данных, разработанный Microsoft, основное внимание в котором уделяется бизнес-аналитике.'
title: 'Power BI'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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

Microsoft Power BI может выполнять запросы к данным или загружать их в память из [ClickHouse Cloud](https://clickhouse.com/cloud) или самоуправляемого развертывания.

Существует несколько версий Power BI, которые вы можете использовать для визуализации ваших данных:

* Power BI Desktop: настольное приложение для Windows для создания панелей и визуализаций
* Power BI Service: доступно в Azure как SaaS для размещения панелей, созданных в Power BI Desktop

Power BI требует, чтобы вы создавали свои панели в настольной версии и публиковали их в Power BI Service.

Этот учебник проведет вас через следующие этапы:

* [Установка драйвера ClickHouse ODBC](#install-the-odbc-driver)
* [Установка соединителя ClickHouse Power BI в Power BI Desktop](#power-bi-installation)
* [Запрос данных из ClickHouse для визуализации в Power BI Desktop](#query-and-visualise-data)
* [Настройка локального шлюза данных для Power BI Service](#power-bi-service)

## Prerequisites {#prerequisites}

### Power BI Installation {#power-bi-installation}

Этот учебник предполагает, что у вас установлена Microsoft Power BI Desktop на вашем компьютере с Windows. Вы можете скачать и установить Power BI Desktop [здесь](https://www.microsoft.com/en-us/download/details.aspx?id=58494)

Мы рекомендуем обновить Power BI до последней версии. Соединитель ClickHouse доступен по умолчанию с версии `2.137.751.0`.

### Gather your ClickHouse connection details {#gather-your-clickhouse-connection-details}

Вам понадобятся следующие данные для подключения к вашему экземпляру ClickHouse:

* Хост - ClickHouse
* Имя пользователя - Учетные данные пользователя
* Пароль - Пароль пользователя
* База данных - Имя базы данных на экземпляре, к которому вы хотите подключиться

## Power BI Desktop {#power-bi-desktop}

Чтобы начать запрашивать данные в Power BI Desktop, вам нужно выполнить следующие шаги:

1. Установить драйвер ClickHouse ODBC
2. Найти соединитель ClickHouse
3. Подключиться к ClickHouse
4. Запрашивать и визуализировать ваши данные

### Install the ODBC Driver {#install-the-odbc-driver}

Скачайте последнюю [версии ClickHouse ODBC](https://github.com/ClickHouse/clickhouse-odbc/releases).

Выполните поставленный установщик `.msi` и следуйте инструкциям мастера.


<Image size="md" img={powerbi_odbc_install} alt="Мастер установки драйвера ClickHouse ODBC с вариантами установки" border />
<br/>

:::note
`Отладочные символы` являются необязательными и не требуются
:::

#### Verify ODBC Driver {#verify-odbc-driver}

После завершения установки драйвера вы можете проверить успешность установки:

Поиск ODBC в меню Пуск и выберите "ODBC Data Sources **(64-bit)**".

<Image size="md" img={powerbi_odbc_search} alt="Поиск Windows, показывающий вариант ODBC Data Sources (64-bit)" border />
<br/>

Убедитесь, что драйвер ClickHouse находится в списке.

<Image size="md" img={powerbi_odbc_verify} alt="Администраторы источников данных ODBC, показываемые драйверами ClickHouse на вкладке Драйверы" border />
<br/>

### Find the ClickHouse Connector {#find-the-clickhouse-connector}

:::note
Доступно в версии `2.137.751.0` Power BI Desktop
:::
На начальном экране Power BI Desktop нажмите "Получить данные".

<Image size="md" img={powerbi_get_data} alt="Главный экран Power BI Desktop с кнопкой Получить данные" border />
<br/>

Поиск по "ClickHouse"

<Image size="md" img={powerbi_search_clickhouse} alt="Диалоговое окно Power BI Получить данные с ClickHouse в строке поиска" border />
<br/>

### Connect to ClickHouse {#connect-to-clickhouse}

Выберите соединитель и введите учетные данные экземпляра ClickHouse:

* Хост (обязательный) - Домен/адрес вашего экземпляра. Убедитесь, что он указан без префиксов/суффиксов.
* Порт (обязательный) - Порт вашего экземпляра.
* База данных - Имя вашей базы данных.
* Опции - Любая ODBC опция, указанная на [странице ClickHouse ODBC GitHub](https://github.com/ClickHouse/clickhouse-odbc#configuration)
* Режим подключения к данным - DirectQuery

<Image size="md" img={powerbi_connect_db} alt="Диалог подключения ClickHouse с полями хоста, порта, базы данных и режима подключения" border />
<br/>

:::note
Мы рекомендуем выбирать DirectQuery для выполнения запросов к ClickHouse напрямую.

Если у вас есть случай использования, связанный с небольшим объемом данных, вы можете выбрать режим импорта, и вся информация будет загружена в Power BI.
:::

* Укажите имя пользователя и пароль

<Image size="md" img={powerbi_connect_user} alt="Диалог.credentials для подключения ClickHouse для имени пользователя и пароля" border />
<br/>

### Query and Visualise Data {#query-and-visualise-data}

В конечном итоге вы должны увидеть базы данных и таблицы в представлении Навигатор. Выберите нужную таблицу и нажмите "Загрузить", чтобы импортировать данные из ClickHouse.

<Image size="md" img={powerbi_table_navigation} alt="Представление Навигатор Power BI, показывающее таблицы базы данных ClickHouse и образец данных" border />
<br/>

После завершения импорта ваши данные ClickHouse должны быть доступны в Power BI, как обычно.
<br/>

## Power BI Service {#power-bi-service}

Чтобы использовать Microsoft Power BI Service, вам нужно создать [локальный шлюз данных](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem).

Для получения дополнительной информации о том, как настроить пользовательские соединители, пожалуйста, обратитесь к документации Microsoft о том, как [использовать пользовательские соединители данных с локальным шлюзом данных](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors).

## ODBC Driver (Import Only) {#odbc-driver-import-only}

Мы рекомендуем использовать соединитель ClickHouse, который использует DirectQuery.

Установите [драйвер ODBC](#install-the-odbc-driver) на локальный шлюз данных и [проверьте](#verify-odbc-driver), как описано выше.

### Create a new User DSN {#create-a-new-user-dsn}

После завершения установки драйвера можно создать источник данных ODBC. Поиск ODBC в меню Пуск и выберите "ODBC Data Sources (64-bit)".

<Image size="md" img={powerbi_odbc_search} alt="Поиск Windows, показывающий вариант ODBC Data Sources (64-bit)" border />
<br/>

Нам нужно добавить новый пользовательский DSN. Нажмите кнопку "Добавить" слева.

<Image size="md" img={powerbi_add_dsn} alt="Администраторы источников данных ODBC с выделенной кнопкой Добавить для создания нового DSN" border />
<br/>

Выберите версию драйвера ODBC для Unicode.

<Image size="md" img={powerbi_select_unicode} alt="Диалог создания нового источника данных с выбором драйвера ClickHouse Unicode" border />
<br/>

Заполните данные подключения.


<Image size="sm" img={powerbi_connection_details} alt="Диалог конфигурации драйвера ClickHouse ODBC с параметрами подключения" border />
<br/>

:::note
Если вы используете развертывание с включенным SSL (например, ClickHouse Cloud или самоуправляемый экземпляр), в поле `SSLMode` вы должны указать `require`.

- `Host` всегда должен указываться без протокола (т.е. `http://` или `https://`).
- `Timeout` — это целое число, представляющее секунды. Значение по умолчанию: `30 секунд`.
:::

### Get Data Into Power BI {#get-data-into-power-bi}

Если у вас еще не установлен Power BI
[скачайте и установите Power BI Desktop](https://www.microsoft.com/en-us/download/details.aspx?id=58494).

На начальном экране Power BI Desktop нажмите "Получить данные".

<Image size="md" img={powerbi_get_data} alt="Главный экран Power BI Desktop с кнопкой Получить данные" border />
<br/>

Выберите "Другое" -> "ODBC".

<Image size="md" img={powerbi_select_odbc} alt="Диалог Power BI Получить данные с выбранной опцией ODBC в категории Другое" border />
<br/>

Выберите ранее созданный вами источник данных из списка.

<Image size="md" img={powerbi_select_dsn} alt="Диалог выбора драйвера ODBC с настроенным DSN ClickHouse" border />
<br/>

:::note
Если вы не указали учетные данные во время создания источника данных, вам будет предложено указать имя пользователя и пароль.
:::

<Image size="md" img={powerbi_dsn_credentials} alt="Диалог ввода учетных данных для подключения ODBC DSN" border />
<br/>

В конечном итоге вы должны увидеть базы данных и таблицы в представлении Навигатор. Выберите нужную таблицу и нажмите "Загрузить", чтобы импортировать данные из ClickHouse.

<Image size="md" img={powerbi_table_navigation} alt="Представление Навигатор Power BI, показывающее таблицы базы данных ClickHouse и образец данных" border />
<br/>

После завершения импорта ваши данные ClickHouse должны быть доступны в Power BI, как обычно.


## Known Limitations {#known-limitations}

### UInt64 {#uint64}

Беззнаковые целочисленные типы, такие как UInt64 или большие, не будут загружены в набор данных автоматически, поскольку Int64 является максимальным целым числом, поддерживаемым Power BI.

:::note
Чтобы правильно импортировать данные, перед нажатием кнопки "Загрузить" в Навигаторе сначала нажмите "Преобразовать данные".
:::

В этом примере таблица `pageviews` содержит столбец UInt64, который по умолчанию распознается как "Binary".
"Преобразовать данные" открывает редактор Power Query, где мы можем переназначить тип столбца, установив его, например, как текст.

<Image size="md" img={powerbi_16} alt="Редактор Power Query, показывающий преобразование типа данных для столбца UInt64" border />
<br/>

После завершения нажмите "Закрыть и применить" в верхнем левом углу и продолжите загрузку данных.

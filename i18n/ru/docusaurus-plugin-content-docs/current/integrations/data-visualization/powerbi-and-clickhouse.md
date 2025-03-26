---
sidebar_label: 'Power BI'
slug: /integrations/powerbi
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui']
description: 'Microsoft Power BI - это интерактивный продукт для визуализации данных, разработанный Microsoft, с акцентом на бизнес-аналитику.'
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

Microsoft Power BI может запрашивать или загружать данные из [ClickHouse Cloud](https://clickhouse.com/cloud) или самоуправляемой версии.

Существует несколько вариантов Power BI, которые вы можете использовать для визуализации ваших данных:

* Power BI Desktop: настольное приложение для Windows для создания информационных панелей и визуализаций
* Power BI Service: доступно в Azure как SaaS для хостинга панелей управления, созданных в Power BI Desktop

Power BI требует от вас создания панелей управления в настольной версии и их публикации в Power BI Service.

Этот учебник проведет вас через следующие этапы:

* [Установка драйвера ClickHouse ODBC](#install-the-odbc-driver)
* [Установка соединителя ClickHouse Power BI в Power BI Desktop](#power-bi-installation)
* [Запрос данных из ClickHouse для визуализации в Power BI Desktop](#query-and-visualise-data)
* [Настройка локального шлюза данных для Power BI Service](#power-bi-service)

## Требования {#prerequisites}

### Установка Power BI {#power-bi-installation}

Этот учебник предполагает, что у вас установлен Microsoft Power BI Desktop на вашем компьютере с Windows. Вы можете скачать и установить Power BI Desktop [здесь](https://www.microsoft.com/en-us/download/details.aspx?id=58494).

Мы рекомендуем обновиться до последней версии Power BI. Соединитель ClickHouse доступен по умолчанию начиная с версии `2.137.751.0`.

### Соберите свои данные для подключения к ClickHouse {#gather-your-clickhouse-connection-details}

Вам потребуются следующие данные для подключения к вашему экземпляру ClickHouse:

* Имя хоста - ClickHouse
* Имя пользователя - учетные данные пользователя
* Пароль - пароль пользователя
* База данных - имя базы данных на экземпляре, к которому вы хотите подключиться

## Power BI Desktop {#power-bi-desktop}

Чтобы начать делать запросы в Power BI Desktop, вам необходимо выполнить следующие шаги:

1. Установить драйвер ClickHouse ODBC
2. Найти соединитель ClickHouse
3. Подключиться к ClickHouse
4. Запросить и визуализировать ваши данные

### Установка драйвера ODBC {#install-the-odbc-driver}

Скачайте последнюю [версию ClickHouse ODBC](https://github.com/ClickHouse/clickhouse-odbc/releases).

Запустите поставленный установщик `.msi` и следуйте инструкциям мастера.

<Image size="md" img={powerbi_odbc_install} alt="Мастер установки драйвера ClickHouse ODBC с параметрами установки" border />
<br/>

:::note
`Символы для отладки` являются необязательными и не требуются
:::

#### Проверьте драйвер ODBC {#verify-odbc-driver}

Когда установка драйвера завершена, вы можете проверить успешность установки, выполнив следующие шаги:

Поиск ODBC в меню Пуск и выберите "ODBC Data Sources **(64-bit)**".

<Image size="md" img={powerbi_odbc_search} alt="Поиск в Windows, показывающий вариант ODBC Data Sources (64-bit)" border />
<br/>

Убедитесь, что драйвер ClickHouse указан в списке.

<Image size="md" img={powerbi_odbc_verify} alt="Администратор источников данных ODBC с драйверами ClickHouse на вкладке Драйверы" border />
<br/>

### Найдите соединитель ClickHouse {#find-the-clickhouse-connector}

:::note
Доступно в версии `2.137.751.0` Power BI Desktop
:::
На начальном экране Power BI Desktop нажмите "Получить данные".

<Image size="md" img={powerbi_get_data} alt="Начальный экран Power BI Desktop с кнопкой Получить данные" border />
<br/>

Поиск "ClickHouse"

<Image size="md" img={powerbi_search_clickhouse} alt="Диалоговое окно Power BI Получить данные с ClickHouse в строке поиска" border />
<br/>

### Подключение к ClickHouse {#connect-to-clickhouse}

Выберите соединитель и введите учетные данные экземпляра ClickHouse:

* Хост (обязательно) - ваш домен/адрес экземпляра. Убедитесь, что добавили его без префиксов/суффиксов.
* Порт (обязательно) - порт вашего экземпляра.
* База данных - имя вашей базы данных.
* Опции - любые параметры ODBC, как указано
  на [странице ClickHouse ODBC на GitHub](https://github.com/ClickHouse/clickhouse-odbc#configuration)
* Режим подключения данных - DirectQuery

<Image size="md" img={powerbi_connect_db} alt="Диалог подключения ClickHouse с полями хоста, порта, базы данных и режима подключения" border />
<br/>

:::note
Мы советуем выбрать DirectQuery для прямого запроса к ClickHouse.

Если у вас есть случай использования с небольшим объемом данных, вы можете выбрать режим импорта, и все данные будут загружены в Power BI.
:::

* Укажите имя пользователя и пароль

<Image size="md" img={powerbi_connect_user} alt="Диалог с учетными данными подключения ClickHouse для имени пользователя и пароля" border />
<br/>

### Запрос и визуализация данных {#query-and-visualise-data}

Наконец, вы должны увидеть базы данных и таблицы в представлении Навигатор. Выберите нужную таблицу и нажмите "Загрузить", чтобы импортировать данные из ClickHouse.

<Image size="md" img={powerbi_table_navigation} alt="Представление Навигатор Power BI с таблицами базы данных ClickHouse и образцами данных" border />
<br/>

После завершения импорта ваши данные ClickHouse должны быть доступны в Power BI как обычно.
<br/>

## Power BI Service {#power-bi-service}

Чтобы использовать Microsoft Power BI Service, вам необходимо создать [локальный шлюз данных](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem).

Для получения дополнительных сведений о том, как настроить пользовательские соединители, пожалуйста, ознакомьтесь с документацией Microsoft о том, как [использовать пользовательские соединители данных с локальным шлюзом данных](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors).

## Драйвер ODBC (только импорт) {#odbc-driver-import-only}

Мы рекомендуем использовать соединитель ClickHouse, который использует DirectQuery.

Установите [драйвер ODBC](#install-the-odbc-driver) на экземпляр локального шлюза данных и [проверьте](#verify-odbc-driver) как указано выше.

### Создайте новый пользовательский DSN {#create-a-new-user-dsn}

Когда установка драйвера завершена, можно создать источник данных ODBC. Поиск ODBC в меню Пуск и выберите "ODBC Data Sources (64-bit)".

<Image size="md" img={powerbi_odbc_search} alt="Поиск в Windows, показывающий вариант ODBC Data Sources (64-bit)" border />
<br/>

Нам нужно добавить новый пользовательский DSN. Нажмите кнопку "Добавить" слева.

<Image size="md" img={powerbi_add_dsn} alt="Администратор источников данных ODBC с выделенной кнопкой Добавить для создания нового DSN" border />
<br/>

Выберите версию ODBC драйвера Unicode.

<Image size="md" img={powerbi_select_unicode} alt="Диалог Создать новый источник данных с выбором драйвера Unicode ClickHouse" border />
<br/>

Заполните данные для подключения.

<Image size="sm" img={powerbi_connection_details} alt="Диалог конфигурации драйвера ClickHouse ODBC с параметрами подключения" border />
<br/>

:::note
Если вы используете развертывание с включенным SSL (например, ClickHouse Cloud или самоуправляемый экземпляр), в поле `SSLMode` вы должны указать `require`.

- `Host` всегда должен иметь протокол (т.е. `http://` или `https://`) без него.
- `Timeout` - это целое число, представляющее секунды. Значение по умолчанию: `30 секунд`.
:::

### Загрузите данные в Power BI {#get-data-into-power-bi}

В случае, если у вас еще не установлен Power BI,
[скачайте и установите Power BI Desktop](https://www.microsoft.com/en-us/download/details.aspx?id=58494).

На начальном экране Power BI Desktop нажмите "Получить данные".

<Image size="md" img={powerbi_get_data} alt="Начальный экран Power BI Desktop с кнопкой Получить данные" border />
<br/>

Выберите "Другие" -> "ODBC".

<Image size="md" img={powerbi_select_odbc} alt="Диалог Получить данные Power BI с выбранным вариантом ODBC в категории Другие" border />
<br/>

Выберите ранее созданный источник данных из списка.

<Image size="md" img={powerbi_select_dsn} alt="Диалог выбора драйвера ODBC, показывающий настроенный DSN ClickHouse" border />
<br/>

:::note
Если вы не указали учетные данные во время создания источника данных, вам будет предложено указать имя пользователя и пароль.
:::

<Image size="md" img={powerbi_dsn_credentials} alt="Диалог учетных данных для подключения ODBC DSN" border />
<br/>

В конце концов, вы должны увидеть базы данных и таблицы в представлении Навигатор. Выберите нужную таблицу и нажмите "Загрузить", чтобы импортировать данные из ClickHouse.

<Image size="md" img={powerbi_table_navigation} alt="Представление Навигатор Power BI с таблицами базы данных ClickHouse и образцами данных" border />
<br/>

После завершения импорта ваши данные ClickHouse должны быть доступны в Power BI как обычно.


## Известные ограничения {#known-limitations}

### UInt64 {#uint64}

Беззнаковые целые типы, такие как UInt64 или больше, не будут загружены в набор данных автоматически, так как Int64 является максимальным целым числом, поддерживаемым Power BI.

:::note
Чтобы правильно импортировать данные, прежде чем нажимать кнопку "Загрузить" в Навигаторе, сначала нажмите "Преобразовать данные".
:::

В этом примере таблица `pageviews` имеет столбец UInt64, который по умолчанию распознается как "Binary".
"Преобразовать данные" открывает редактор Power Query, где мы можем изменить тип столбца, установив его, например, как текст.

<Image size="md" img={powerbi_16} alt="Редактор Power Query показывает преобразование типа данных для столбца UInt64" border />
<br/>

Когда закончите, нажмите "Закрыть и применить" в верхнем левом углу и продолжайте с загрузкой данных.

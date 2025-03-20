---
sidebar_label: Power BI
slug: /integrations/powerbi
keywords: [ 'clickhouse', 'Power BI', 'connect', 'integrate', 'ui' ]
description: 'Microsoft Power BI — это интерактивное программное обеспечение для визуализации данных, разработанное Microsoft, с первоочередным акцентом на бизнес-аналитику.'
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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


# Power BI

Microsoft Power BI может выполнять запросы или загружать данные из [ClickHouse Cloud](https://clickhouse.com/cloud) или из самоуправляемой установки.

Существует несколько версий Power BI, которые вы можете использовать для визуализации ваших данных:

* Power BI Desktop: настольное приложение для Windows для создания информационных панелей и визуализаций
* Power BI Service: доступно в Azure как SaaS для размещения информационных панелей, созданных в Power BI Desktop 

Power BI требует, чтобы вы создавали свои информационные панели в настольной версии и публиковали их в Power BI Service. 

Этот учебник проведет вас через процесс:

* [Установка ClickHouse ODBC драйвера](#install-the-odbc-driver)
* [Установка ClickHouse Power BI Connector в Power BI Desktop](#power-bi-installation)
* [Запрос данных из ClickHouse для визуализации в Power BI Desktop](#query-and-visualise-data)
* [Настройка локального шлюза данных для Power BI Service](#power-bi-service)

## Предварительные требования {#prerequisites}

### Установка Power BI {#power-bi-installation}

Этот учебник предполагает, что у вас установлена Microsoft Power BI Desktop на вашем компьютере с Windows. Вы можете скачать и установить Power BI Desktop [здесь](https://www.microsoft.com/en-us/download/details.aspx?id=58494)

Мы рекомендуем обновиться до последней версии Power BI. ClickHouse Connector доступен по умолчанию с версии `2.137.751.0`.

### Соберите данные вашего подключения к ClickHouse {#gather-your-clickhouse-connection-details}

Вам понадобятся следующие данные для подключения к вашему экземпляру ClickHouse:

* Хост - ClickHouse 
* Имя пользователя - Учетные данные пользователя
* Пароль - Пароль пользователя
* База данных - Имя базы данных в экземпляре, к которому вы хотите подключиться 

## Power BI Desktop {#power-bi-desktop}

Чтобы начать запрашивать данные в Power BI Desktop, вам необходимо выполнить следующие шаги:

1. Установить ClickHouse ODBC драйвер
2. Найти ClickHouse Connector
3. Подключиться к ClickHouse
4. Запросить и визуализировать ваши данные

### Установка ODBC драйвера {#install-the-odbc-driver}

Скачайте последнюю [версию ClickHouse ODBC](https://github.com/ClickHouse/clickhouse-odbc/releases).

Запустите предоставленный установщик `.msi` и следуйте указаниям мастера.

<img src={powerbi_odbc_install} class="image" alt="Установка ODBC драйвера" style={{width: 
'50%', 'background-color': 'transparent'}}/>
<br/>

:::note
`Отладочные символы` являются опциональными и не обязательны.
:::

#### Проверить ODBC драйвер {#verify-odbc-driver}

Когда установка драйвера завершена, вы можете подтвердить, что установка прошла успешно, выполнив следующие действия:

Поиск ODBC в меню Пуск и выберите "ODBC Data Sources **(64-bit)**".

<img src={powerbi_odbc_search} class="image" alt="Создание нового ODBC источника данных"
style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Проверьте, что драйвер ClickHouse указан в списке.

<img src={powerbi_odbc_verify} class="image" alt="Проверка существования ODBC" style={{width: '50%', 
'background-color': 'transparent'}}/>
<br/>

### Найти ClickHouse Connector {#find-the-clickhouse-connector}

:::note
Доступно в версии `2.137.751.0` Power BI Desktop
:::
На начальном экране Power BI Desktop нажмите "Получить данные".

<img src={powerbi_get_data} class="image" alt="Начало работы с Power BI Desktop"
style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Ищите "ClickHouse"

<img src={powerbi_search_clickhouse} class="image" alt="Выбор источника данных" style={{width: 
'50%', 'background-color': 'transparent'}}/>
<br/>

### Подключиться к ClickHouse {#connect-to-clickhouse}

Выберите коннектор и введите учетные данные экземпляра ClickHouse:

* Хост (обязательный) - Домен/адрес вашего экземпляра. Убедитесь, что вы добавили его без префиксов/суффиксов.
* Порт (обязательный) - Порт вашего экземпляра.
* База данных - Имя вашей базы данных.
* Опции - Любая ODBC опция, как указано на
  [ClickHouse ODBC GitHub Page](https://github.com/ClickHouse/clickhouse-odbc#configuration)
* Режим подключения данных - DirectQuery

<img src={powerbi_connect_db} class="image" alt="Заполнение информации о экземпляре ClickHouse"
style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

:::note
Мы советуем выбрать DirectQuery для прямого запроса к ClickHouse. 

Если ваш случай использования имеет небольшое количество данных, вы можете выбрать режим импорта, и все данные будут загружены в Power BI.
:::

* Укажите имя пользователя и пароль

<img src={powerbi_connect_user} class="image" alt="Запрос имени пользователя и пароля" style={{width:
'50%', 'background-color': 'transparent'}}/>
<br/>

### Запрос и визуализация данных {#query-and-visualise-data}

В конце концов, вы должны увидеть базы данных и таблицы в представлении Навигатора. Выберите желаемую таблицу и нажмите "Загрузить", чтобы
импортировать данные из ClickHouse.

<img src={powerbi_table_navigation} class="image" alt="Представление Навигатора" style={{width: '50%',
'background-color': 'transparent'}}/>
<br/>

После завершения импорта ваши данные ClickHouse должны быть доступны в Power BI как обычно.
<br/>

## Power BI Service {#power-bi-service}

Чтобы использовать Microsoft Power BI Service, вам необходимо создать [локальный шлюз данных](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem).

Для получения более подробной информации о том, как настроить пользовательские коннекторы, пожалуйста, обратитесь к документации Microsoft о том, как [использовать пользовательские коннекторы данных с локальным шлюзом данных](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors).

## ODBC Драйвер (только импорт) {#odbc-driver-import-only}

Мы рекомендуем использовать ClickHouse Connector, который использует DirectQuery.

Установите [ODBC Драйвер](#install-the-odbc-driver) на экземпляр локального шлюза данных и [проверьте](#verify-odbc-driver), как указано выше.

### Создать новый пользовательский DSN {#create-a-new-user-dsn}

Когда установка драйвера завершена, можно создать источник данных ODBC. Найдите ODBC в меню Пуск и выберите "ODBC Data Sources (64-bit)".

<img src={powerbi_odbc_search} class="image" alt="Создание нового ODBC источника данных"
style={{width: '40%', 'background-color': 'transparent'}}/>
<br/>

Нам необходимо добавить новый пользовательский DSN здесь. Нажмите кнопку "Добавить" слева.

<img src={powerbi_add_dsn} class="image" alt="Добавление нового пользовательского DSN" style={{width: '40%', 
'background-color': 'transparent'}}/>
<br/>

Выберите версию ODBC драйвера Unicode.

<img src={powerbi_select_unicode} class="image" alt="Выбор версии Unicode" style={{width: 
'40%', 'background-color': 'transparent'}}/>
<br/>

Заполните данные подключения. 

<img src={powerbi_connection_details} class="image" alt="Данные подключения" style={{width: '30%', 
'background-color': 'transparent'}}/>
<br/>

:::note
Если вы используете установку с включенным SSL (например, ClickHouse Cloud или самоуправляемый экземпляр), в поле `SSLMode` вам следует указать `require`. 

- `Host` всегда должен быть без протокола (т.е. `http://` или `https://`).
- `Timeout` — это целое число, представляющее секунды. Значение по умолчанию: `30 секунд`.
:::

### Получить данные в Power BI {#get-data-into-power-bi}

Если у вас еще не установлена Power BI
, [скачайте и установите Power BI Desktop](https://www.microsoft.com/en-us/download/details.aspx?id=58494).

На начальном экране Power BI Desktop щелкните "Получить данные".

<img src={powerbi_get_data} class="image" alt="Начало работы с Power BI Desktop"
style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

Выберите "Другое" -> "ODBC".

<img src={powerbi_select_odbc} class="image" alt="Меню источников данных" style={{width: '50%', 
'background-color': 'transparent'}}/>
<br/>

Выберите ранее созданный источник данных из списка.

<img src={powerbi_select_dsn} class="image" alt="Выбор ODBC источника данных" style={{width: 
'50%', 'background-color': 'transparent'}}/>
<br/>

:::note
Если вы не указали учетные данные при создании источника данных, вам будет предложено указать имя пользователя и пароль.
:::

<img src={powerbi_dsn_credentials} class="image" alt="Представление Навигатора" style={{width: '50%', 
'background-color': 'transparent'}}/>
<br/>

Наконец, вы должны увидеть базы данных и таблицы в представлении Навигатора. Выберите желаемую таблицу и нажмите "Загрузить", чтобы импортировать данные из ClickHouse.

<img src={powerbi_table_navigation} class="image" alt="Представление Навигатора" style={{width: '50%', 
'background-color': 'transparent'}}/>
<br/>

После завершения импорта ваши данные ClickHouse должны быть доступны в Power BI как обычно.


## Известные ограничения {#known-limitations}

### UInt64 {#uint64}

Беззнаковые целочисленные типы, такие как UInt64 или больше, не будут загружены в набор данных автоматически, так как Int64 является максимальным целым числом, поддерживаемым Power BI.

:::note
Чтобы правильно импортировать данные, перед нажатием кнопки "Загрузить" в Навигаторе сначала нажмите "Преобразовать данные".
:::

В этом примере таблица `pageviews` имеет колонку UInt64, которая по умолчанию распознается как "Binary".
"Преобразовать данные" открывает редактор Power Query, где мы можем переназначить тип колонки, установив его как, например,
Text.

<img src={powerbi_16} class="image" alt="Представление Навигатора" style={{width: '50%', 
'background-color': 'transparent'}}/>
<br/>

Когда закончите, нажмите "Закрыть и применить" в левом верхнем углу и продолжите загрузку данных.

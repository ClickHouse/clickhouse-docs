---
sidebar_label: 'Power BI'
slug: /integrations/powerbi
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui']
description: 'Microsoft Power BI — это интерактивный программный продукт для визуализации данных, разработанный компанией Microsoft с основным фокусом на задачах бизнес-аналитики.'
title: 'Power BI'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
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

Microsoft Power BI может выполнять запросы к данным в [ClickHouse Cloud](https://clickhouse.com/cloud) или в самостоятельном развёртывании, а также загружать эти данные в память.

Существует несколько вариантов Power BI, которые вы можете использовать для визуализации данных:

* Power BI Desktop: настольное приложение для Windows для создания дашбордов и визуализаций
* Power BI Service: сервис в Azure (SaaS) для размещения дашбордов, созданных в Power BI Desktop

В Power BI дашборды необходимо создавать в версии Desktop и публиковать в Power BI Service.

В этом руководстве вы узнаете, как:

* [установить драйвер ClickHouse ODBC](#install-the-odbc-driver)
* [установить коннектор ClickHouse Power BI в Power BI Desktop](#power-bi-installation)
* [выполнять запросы к данным в ClickHouse для визуализации в Power BI Desktop](#query-and-visualise-data)
* [настроить локальный (on-premise) шлюз данных для Power BI Service](#power-bi-service)



## Предварительные требования {#prerequisites}

### Установка Power BI {#power-bi-installation}

В этом руководстве предполагается, что на вашем компьютере с Windows установлен Microsoft Power BI Desktop. Скачать и установить Power BI Desktop можно [здесь](https://www.microsoft.com/en-us/download/details.aspx?id=58494)

Рекомендуется использовать последнюю версию Power BI. Коннектор ClickHouse доступен по умолчанию начиная с версии `2.137.751.0`.

### Подготовка данных для подключения к ClickHouse {#gather-your-clickhouse-connection-details}

Для подключения к экземпляру ClickHouse потребуются следующие данные:

- Hostname — имя хоста ClickHouse
- Username — имя пользователя
- Password — пароль пользователя
- Database — имя базы данных на экземпляре, к которому требуется подключиться


## Power BI Desktop {#power-bi-desktop}

Чтобы начать работу с запросами данных в Power BI Desktop, выполните следующие шаги:

1. Установите драйвер ClickHouse ODBC
2. Найдите коннектор ClickHouse
3. Подключитесь к ClickHouse
4. Выполните запросы и визуализируйте данные

### Установка драйвера ODBC {#install-the-odbc-driver}

Скачайте последнюю версию [ClickHouse ODBC](https://github.com/ClickHouse/clickhouse-odbc/releases).

Запустите установщик `.msi` и следуйте инструкциям мастера установки.

<Image
  size='md'
  img={powerbi_odbc_install}
  alt='Мастер установки драйвера ClickHouse ODBC с параметрами установки'
  border
/>
<br />

:::note
`Debug symbols` являются необязательными и не требуются
:::

#### Проверка драйвера ODBC {#verify-odbc-driver}

После завершения установки драйвера проверьте успешность установки следующим образом:

Найдите ODBC в меню «Пуск» и выберите «Источники данных ODBC **(64-разрядная версия)**».

<Image
  size='md'
  img={powerbi_odbc_search}
  alt='Поиск Windows с параметром «Источники данных ODBC (64-разрядная версия)»'
  border
/>
<br />

Убедитесь, что драйвер ClickHouse присутствует в списке.

<Image
  size='md'
  img={powerbi_odbc_verify}
  alt='Администратор источников данных ODBC с драйверами ClickHouse на вкладке «Драйверы»'
  border
/>
<br />

### Поиск коннектора ClickHouse {#find-the-clickhouse-connector}

:::note
Доступно в версии `2.137.751.0` Power BI Desktop
:::
На начальном экране Power BI Desktop нажмите «Получить данные».

<Image
  size='md'
  img={powerbi_get_data}
  alt='Главный экран Power BI Desktop с кнопкой «Получить данные»'
  border
/>
<br />

Найдите «ClickHouse»

<Image
  size='md'
  img={powerbi_search_clickhouse}
  alt='Диалоговое окно «Получить данные» Power BI с поиском ClickHouse в строке поиска'
  border
/>
<br />

### Подключение к ClickHouse {#connect-to-clickhouse}

Выберите коннектор и введите учетные данные экземпляра ClickHouse:

- Host (обязательно) — домен/адрес вашего экземпляра. Указывайте его без префиксов и суффиксов.
- Port (обязательно) — порт вашего экземпляра.
- Database — имя вашей базы данных.
- Options — любые параметры ODBC, перечисленные
  на [странице ClickHouse ODBC на GitHub](https://github.com/ClickHouse/clickhouse-odbc#configuration)
- Data Connectivity mode — DirectQuery

<Image
  size='md'
  img={powerbi_connect_db}
  alt='Диалоговое окно подключения ClickHouse с полями host, port, database и режима подключения'
  border
/>
<br />

:::note
Рекомендуется выбирать DirectQuery для прямых запросов к ClickHouse.

Если у вас сценарий использования с небольшим объемом данных, можно выбрать режим импорта — в этом случае все данные будут загружены в Power BI.
:::

- Укажите имя пользователя и пароль

<Image
  size='md'
  img={powerbi_connect_user}
  alt='Диалоговое окно учетных данных подключения ClickHouse для имени пользователя и пароля'
  border
/>
<br />

### Запросы и визуализация данных {#query-and-visualise-data}

В итоге вы увидите базы данных и таблицы в представлении «Навигатор». Выберите нужную таблицу и нажмите «Загрузить», чтобы
импортировать данные из ClickHouse.

<Image
  size='md'
  img={powerbi_table_navigation}
  alt='Представление «Навигатор» Power BI с таблицами базы данных ClickHouse и примерами данных'
  border
/>
<br />

После завершения импорта данные ClickHouse будут доступны в Power BI в обычном режиме.

<br />


## Сервис Power BI {#power-bi-service}

Для использования Microsoft Power BI Service необходимо создать [локальный шлюз данных](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem).

Подробнее о настройке пользовательских коннекторов см. в документации Microsoft: [использование пользовательских коннекторов данных с локальным шлюзом данных](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors).


## Драйвер ODBC (только импорт) {#odbc-driver-import-only}

Рекомендуется использовать коннектор ClickHouse с поддержкой DirectQuery.

Установите [драйвер ODBC](#install-the-odbc-driver) на экземпляр локального шлюза данных и [выполните проверку](#verify-odbc-driver), как описано выше.

### Создание нового пользовательского DSN {#create-a-new-user-dsn}

После завершения установки драйвера можно создать источник данных ODBC. Найдите ODBC в меню «Пуск» и выберите «Источники данных ODBC (64-разрядная версия)».

<Image
  size='md'
  img={powerbi_odbc_search}
  alt='Поиск Windows с отображением опции «Источники данных ODBC (64-разрядная версия)»'
  border
/>
<br />

Необходимо добавить новый пользовательский DSN. Нажмите кнопку «Добавить» слева.

<Image
  size='md'
  img={powerbi_add_dsn}
  alt='Администратор источников данных ODBC с выделенной кнопкой «Добавить» для создания нового DSN'
  border
/>
<br />

Выберите версию драйвера ODBC с поддержкой Unicode.

<Image
  size='md'
  img={powerbi_select_unicode}
  alt='Диалоговое окно создания нового источника данных с выбором драйвера ClickHouse Unicode'
  border
/>
<br />

Заполните параметры подключения.

<Image
  size='sm'
  img={powerbi_connection_details}
  alt='Диалоговое окно конфигурации драйвера ODBC ClickHouse с параметрами подключения'
  border
/>
<br />

:::note
Если вы используете развертывание с включенным SSL (например, ClickHouse Cloud или самостоятельно управляемый экземпляр), в поле `SSLMode` необходимо указать значение `require`.

- В поле `Host` всегда следует опускать протокол (т. е. `http://` или `https://`).
- `Timeout` — целое число, представляющее секунды. Значение по умолчанию: `30 seconds`.
  :::

### Загрузка данных в Power BI {#get-data-into-power-bi}

Если у вас еще не установлен Power BI, [загрузите и установите Power BI Desktop](https://www.microsoft.com/en-us/download/details.aspx?id=58494).

На начальном экране Power BI Desktop нажмите «Получить данные».

<Image
  size='md'
  img={powerbi_get_data}
  alt='Главный экран Power BI Desktop с отображением кнопки «Получить данные»'
  border
/>
<br />

Выберите «Другое» → «ODBC».

<Image
  size='md'
  img={powerbi_select_odbc}
  alt='Диалоговое окно получения данных Power BI с выбранной опцией ODBC в категории «Другое»'
  border
/>
<br />

Выберите ранее созданный источник данных из списка.

<Image
  size='md'
  img={powerbi_select_dsn}
  alt='Диалоговое окно выбора драйвера ODBC с отображением настроенного DSN ClickHouse'
  border
/>
<br />

:::note
Если вы не указали учетные данные при создании источника данных, вам будет предложено указать имя пользователя и пароль.
:::

<Image
  size='md'
  img={powerbi_dsn_credentials}
  alt='Диалоговое окно учетных данных для подключения ODBC DSN'
  border
/>
<br />

Наконец, вы увидите базы данных и таблицы в представлении «Навигатор». Выберите нужную таблицу и нажмите «Загрузить», чтобы импортировать данные из ClickHouse.

<Image
  size='md'
  img={powerbi_table_navigation}
  alt='Представление «Навигатор» Power BI с отображением таблиц базы данных ClickHouse и примеров данных'
  border
/>
<br />

После завершения импорта данные ClickHouse будут доступны в Power BI в обычном режиме.


## Известные ограничения {#known-limitations}

### UInt64 {#uint64}

Беззнаковые целочисленные типы, такие как UInt64 и больше, не загружаются в набор данных автоматически, так как Int64 — это максимальный целочисленный тип, поддерживаемый Power BI.

:::note
Для корректного импорта данных перед нажатием кнопки «Load» в навигаторе сначала нажмите «Transform Data».
:::

В этом примере таблица `pageviews` содержит столбец UInt64, который по умолчанию распознается как «Binary».
Кнопка «Transform Data» открывает редактор Power Query Editor, где можно изменить тип столбца, установив его, например, как
Text.

<Image
  size='md'
  img={powerbi_16}
  alt='Редактор Power Query Editor с преобразованием типа данных для столбца UInt64'
  border
/>
<br />

После завершения нажмите «Close & Apply» в верхнем левом углу и продолжите загрузку данных.

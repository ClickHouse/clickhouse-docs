---
sidebar_label: 'Power BI'
slug: /integrations/powerbi
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui']
description: 'Microsoft Power BI — это интерактивное программное обеспечение для визуализации данных, разработанное компанией Microsoft и ориентированное на бизнес-аналитику.'
title: 'Power BI'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
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


# Power BI \{#power-bi\}

<ClickHouseSupportedBadge/>

Microsoft Power BI может выполнять запросы к данным в [ClickHouse Cloud](https://clickhouse.com/cloud) или в самостоятельно управляемом развертывании, а также загружать эти данные в память.

Существует несколько вариантов Power BI, которые вы можете использовать для визуализации данных:

* Power BI Desktop: настольное приложение для Windows для создания дашбордов и визуализаций
* Power BI Service: доступен в Azure как SaaS-сервис для размещения дашбордов, созданных в Power BI Desktop

В Power BI дашборды необходимо создавать в версии Desktop и публиковать в Power BI Service.

В этом руководстве вы выполните следующие шаги:

* [Установка драйвера ClickHouse ODBC](#install-the-odbc-driver)
* [Установка коннектора ClickHouse Power BI в Power BI Desktop](#power-bi-installation)
* [Выполнение запросов к данным из ClickHouse для визуализации в Power BI Desktop](#query-and-visualise-data)
* [Настройка локального шлюза данных для Power BI Service](#power-bi-service)

## Предварительные требования \{#prerequisites\}

### Установка Power BI \{#power-bi-installation\}

В этом руководстве предполагается, что на вашем компьютере с Windows установлен Microsoft Power BI Desktop. Вы можете загрузить и установить Power BI Desktop [здесь](https://www.microsoft.com/en-us/download/details.aspx?id=58494)

Рекомендуется обновить Power BI до последней версии. Коннектор ClickHouse доступен по умолчанию, начиная с версии `2.137.751.0`.

### Сбор данных для подключения к ClickHouse \{#gather-your-clickhouse-connection-details\}

Вам потребуются следующие данные для подключения к вашему экземпляру ClickHouse:

* Hostname — имя хоста ClickHouse
* Username — имя пользователя
* Password — пароль пользователя
* Database — имя базы данных на экземпляре, к которому вы хотите подключиться

## Power BI Desktop \{#power-bi-desktop\}

Чтобы начать выполнять запросы к данным в Power BI Desktop, выполните следующие шаги:

1. Установите драйвер ClickHouse ODBC
2. Найдите коннектор ClickHouse
3. Подключитесь к ClickHouse
4. Выполняйте запросы и визуализируйте данные

### Установка драйвера ODBC \{#install-the-odbc-driver\}

Скачайте последнюю версию [ClickHouse ODBC](https://github.com/ClickHouse/clickhouse-odbc/releases).

Запустите загруженный установщик `.msi` и следуйте инструкциям мастера.

<Image size="md" img={powerbi_odbc_install} alt="Мастер установки драйвера ClickHouse ODBC с отображением параметров установки" border />

<br/>

:::note
`Debug symbols` являются необязательными и не требуются.
:::

#### Проверка драйвера ODBC \{#verify-odbc-driver\}

После завершения установки драйвера вы можете убедиться, что установка прошла успешно, выполнив следующее:

Найдите ODBC в меню «Пуск» и выберите «ODBC Data Sources **(64-bit)**».

<Image size="md" img={powerbi_odbc_search} alt="Поиск в Windows с отображением пункта ODBC Data Sources (64-bit)" border />

<br/>

Убедитесь, что драйвер ClickHouse присутствует в списке.

<Image size="md" img={powerbi_odbc_verify} alt="ODBC Data Source Administrator с драйверами ClickHouse на вкладке Drivers" border />

<br/>

### Поиск коннектора ClickHouse \{#find-the-clickhouse-connector\}

:::note
Доступно в версии Power BI Desktop `2.137.751.0`.
:::
На стартовом экране Power BI Desktop нажмите «Get Data».

<Image size="md" img={powerbi_get_data} alt="Стартовый экран Power BI Desktop с кнопкой Get Data" border />

<br/>

Введите в поле поиска «ClickHouse».

<Image size="md" img={powerbi_search_clickhouse} alt="Диалог Power BI Get Data с ClickHouse, введённым в строку поиска" border />

<br/>

### Подключение к ClickHouse \{#connect-to-clickhouse\}

Выберите коннектор и введите учётные данные экземпляра ClickHouse:

* Host (required) — домен/адрес вашего экземпляра. Убедитесь, что он указан без префиксов и суффиксов.
* Port (required) — порт вашего экземпляра.
* Database — имя вашей базы данных.
* Options — любые параметры ODBC, перечисленные
  на [странице ClickHouse ODBC в GitHub](https://github.com/ClickHouse/clickhouse-odbc#configuration)
* Data Connectivity mode — DirectQuery

<Image size="md" img={powerbi_connect_db} alt="Диалог подключения к ClickHouse с полями host, port, database и connectivity mode" border />

<br/>

:::note
Рекомендуем выбрать DirectQuery для прямого выполнения запросов к ClickHouse.

Если ваш сценарий предполагает небольшой объём данных, можно выбрать режим импорта, и все данные будут загружены в Power BI.
:::

* Укажите имя пользователя и пароль.

<Image size="md" img={powerbi_connect_user} alt="Диалог ввода учётных данных подключения к ClickHouse с полями username и password" border />

<br/>

### Выполнение запросов и визуализация данных \{#query-and-visualise-data\}

В результате вы должны увидеть базы данных и таблицы в окне Navigator. Выберите нужную таблицу и нажмите «Load»,
чтобы импортировать данные из ClickHouse.

<Image size="md" img={powerbi_table_navigation} alt="Окно Power BI Navigator с таблицами базы данных ClickHouse и примерами данных" border />

<br/>

После завершения импорта данные ClickHouse будут доступны в Power BI как обычно.

<br/>

## Сервис Power BI \{#power-bi-service\}

Чтобы использовать Microsoft Power BI Service, необходимо создать [локальный шлюз данных](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem).

Подробную информацию по настройке пользовательских коннекторов см. в документации Microsoft о том, как [использовать пользовательские коннекторы данных с локальным шлюзом данных](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors).

## Драйвер ODBC (только импорт) \{#odbc-driver-import-only\}

Мы рекомендуем использовать ClickHouse Connector, который использует DirectQuery.

Установите [драйвер ODBC](#install-the-odbc-driver) на экземпляр локального шлюза данных и [проверьте его работу](#verify-odbc-driver), как описано выше.

### Создание нового пользовательского DSN \{#create-a-new-user-dsn\}

После завершения установки драйвера можно создать источник данных ODBC. Найдите ODBC в меню «Пуск» и выберите "ODBC Data Sources (64-bit)".

<Image size="md" img={powerbi_odbc_search} alt="Поиск в Windows с вариантом ODBC Data Sources (64-bit)" border />
<br/>

Здесь нужно добавить новый пользовательский DSN. Нажмите кнопку "Add" слева.

<Image size="md" img={powerbi_add_dsn} alt="ODBC Data Source Administrator с выделенной кнопкой Add для создания нового DSN" border />
<br/>

Выберите Unicode-версию драйвера ODBC.

<Image size="md" img={powerbi_select_unicode} alt="Диалог Create New Data Source с выбранным ClickHouse Unicode Driver" border />
<br/>

Заполните параметры подключения.

<Image size="sm" img={powerbi_connection_details} alt="Диалог конфигурации ClickHouse ODBC Driver с параметрами подключения" border />
<br/>

:::note
Если вы используете развертывание с включенным SSL (например, ClickHouse Cloud или самостоятельный экземпляр), в поле `SSLMode` следует указать `require`.

- В `Host` всегда должен отсутствовать протокол (то есть `http://` или `https://`).
- `Timeout` — целое число, задающее тайм-аут в секундах. Значение по умолчанию: `30` секунд.
:::

### Загрузка данных в Power BI \{#get-data-into-power-bi\}

Если у вас еще не установлен Power BI,
[скачайте и установите Power BI Desktop](https://www.microsoft.com/en-us/download/details.aspx?id=58494).

На стартовом экране Power BI Desktop нажмите "Get Data".

<Image size="md" img={powerbi_get_data} alt="Стартовый экран Power BI Desktop с кнопкой Get Data" border />

<br/>

Выберите "Other" -> "ODBC".

<Image size="md" img={powerbi_select_odbc} alt="Диалог Power BI Get Data с выбранным вариантом ODBC в категории Other" border />

<br/>

Выберите ранее созданный источник данных из списка.

<Image size="md" img={powerbi_select_dsn} alt="Диалог выбора драйвера ODBC с настроенным ClickHouse DSN" border />

<br/>

:::note
Если вы не указали учетные данные при создании источника данных, вам будет предложено ввести имя пользователя и пароль.
:::

<Image size="md" img={powerbi_dsn_credentials} alt="Диалог ввода учетных данных для подключения к ODBC DSN" border />

<br/>

В итоге вы должны увидеть базы данных и таблицы в окне Navigator. Выберите нужную таблицу и нажмите "Load", чтобы импортировать данные из ClickHouse.

<Image size="md" img={powerbi_table_navigation} alt="Окно Power BI Navigator с таблицами базы данных ClickHouse и примером данных" border />

<br/>

После завершения импорта данные из ClickHouse будут доступны в Power BI как обычно.

## Оптимизация работы с большими наборами данных \{#optimizing-work-with-large-datasets\}

PowerBI разработан для традиционных строчно-ориентированных баз данных с умеренными объемами данных. При работе с ClickHouse на больших объемах (миллиарды строк) для достижения оптимальной производительности требуется использование специальных архитектурных шаблонов.

PowerBI автоматически генерирует SQL-запросы с вложенными подзапросами, сложными соединениями и трансформациями «на лету». Эти подходы хорошо работают с традиционными SQL-базами данных, но могут быть неэффективны при выполнении запросов к крупномасштабным столбцовым базам данных, таким как ClickHouse.

**Рекомендуемый подход для больших наборов данных:** вместо того чтобы обращаться напрямую к «сырым» таблицам, создавайте в ClickHouse отдельные `materialized views` для каждой визуализации дашборда. Это обеспечивает:

- Стабильную, высокую производительность независимо от объема данных
- Более низкую нагрузку на кластер ClickHouse
- Более предсказуемые затраты

:::warning
Если ваши дашборды работают медленно, проверьте [`query_log`](/operations/system-tables/query_log) в ClickHouse, чтобы увидеть, какие SQL-запросы фактически выполняет Power BI. Распространенные проблемы включают вложенные подзапросы, сканирование всех таблиц или неэффективные соединения. После того как вы определите проблему, создайте [materialized views](/materialized-views), которые устраняют эти конкретные проблемы.
:::

### Рекомендации по реализации \{#implementation-best-practices\}

####  Стратегия предагрегации \{#pre-aggregation-strategy\}

Создавайте materialized view на нескольких уровнях агрегации:

- Почасовые агрегации для недавних, детализированных дашбордов
- Дневные агрегации для анализа исторических тенденций
- Месячные сводки для долгосрочной отчетности
- Храните сырые данные с подходящим TTL для разовых аналитических запросов

#### Оптимизация моделирования данных \{#data-modelling-optimization\}

- Определяйте ключи `ORDER BY`, соответствующие вашим шаблонам запросов
- Используйте разбиение на партиции для данных временных рядов
- Преобразуйте небольшие таблицы измерений в словари для эффективного поиска
- Используйте проекции для дополнительной оптимизации запросов

## Известные ограничения \{#known-limitations\}

### UInt64 \{#uint64\}

Беззнаковые целочисленные типы, такие как UInt64 и старше, не будут автоматически загружены в набор данных, так как Int64 — максимальный целочисленный тип, поддерживаемый Power BI.

:::note
Чтобы корректно импортировать данные, перед нажатием кнопки "Load" в окне Navigator сначала нажмите "Transform Data".
:::

В этом примере таблица `pageviews` содержит столбец UInt64, который по умолчанию определяется как тип "Binary".
"Transform Data" открывает Power Query Editor, где мы можем изменить тип столбца, установив его, например, как
Text.

<Image size="md" img={powerbi_16} alt="Power Query Editor, показывающий преобразование типа данных для столбца UInt64" border />

<br/>

По завершении нажмите "Close & Apply" в левом верхнем углу и продолжите загрузку данных.
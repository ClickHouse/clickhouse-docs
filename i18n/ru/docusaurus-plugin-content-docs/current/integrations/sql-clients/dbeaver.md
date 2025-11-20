---
slug: /integrations/dbeaver
sidebar_label: 'DBeaver'
description: 'DBeaver — это кроссплатформенный инструмент для работы с базами данных.'
title: 'Подключение DBeaver к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'sql_client'
  - website: 'https://github.com/dbeaver/dbeaver'
keywords: ['DBeaver', 'database management', 'SQL client', 'JDBC connection', 'multi-platform']
---

import Image from '@theme/IdealImage';
import dbeaver_add_database from '@site/static/images/integrations/sql-clients/dbeaver-add-database.png';
import dbeaver_host_port from '@site/static/images/integrations/sql-clients/dbeaver-host-port.png';
import dbeaver_use_ssl from '@site/static/images/integrations/sql-clients/dbeaver-use-ssl.png';
import dbeaver_test_connection from '@site/static/images/integrations/sql-clients/dbeaver-test-connection.png';
import dbeaver_download_driver from '@site/static/images/integrations/sql-clients/dbeaver-download-driver.png';
import dbeaver_sql_editor from '@site/static/images/integrations/sql-clients/dbeaver-sql-editor.png';
import dbeaver_query_log_select from '@site/static/images/integrations/sql-clients/dbeaver-query-log-select.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Подключение DBeaver к ClickHouse

<ClickHouseSupportedBadge/>

DBeaver доступен в нескольких вариантах. В данном руководстве используется [DBeaver Community](https://dbeaver.io/). С различными редакциями и их возможностями можно ознакомиться [здесь](https://dbeaver.com/edition/). DBeaver подключается к ClickHouse с помощью JDBC.

:::note
Используйте DBeaver версии 23.1.0 или выше для улучшенной поддержки столбцов `Nullable` в ClickHouse.
:::



## 1. Соберите данные для подключения к ClickHouse {#1-gather-your-clickhouse-details}

DBeaver использует JDBC через HTTP(S) для подключения к ClickHouse; вам потребуются:

- адрес сервера (endpoint)
- номер порта
- имя пользователя
- пароль


## 2. Загрузите DBeaver {#2-download-dbeaver}

DBeaver можно скачать по адресу https://dbeaver.io/download/


## 3. Добавление базы данных {#3-add-a-database}

- Используйте меню **Database > New Database Connection** или значок **New Database Connection** в **Database Navigator**, чтобы открыть диалоговое окно **Connect to a database**:

<Image img={dbeaver_add_database} size='md' border alt='Добавление новой базы данных' />

- Выберите **Analytical**, затем **ClickHouse**:

- Сформируйте JDBC URL. На вкладке **Main** укажите Host, Port, Username, Password и Database:

<Image
  img={dbeaver_host_port}
  size='md'
  border
  alt='Указание имени хоста, порта, пользователя, пароля и имени базы данных'
/>

- По умолчанию свойство **SSL > Use SSL** отключено. Если вы подключаетесь к ClickHouse Cloud или к серверу, требующему SSL на HTTP-порту, включите **SSL > Use SSL**:

<Image img={dbeaver_use_ssl} size='md' border alt='Включение SSL при необходимости' />

- Проверьте соединение:

<Image
  img={dbeaver_test_connection}
  size='md'
  border
  alt='Проверка соединения'
/>

Если DBeaver обнаружит, что драйвер ClickHouse не установлен, он предложит загрузить его:

<Image
  img={dbeaver_download_driver}
  size='md'
  border
  alt='Загрузка драйвера ClickHouse'
/>

- После загрузки драйвера снова проверьте соединение с помощью **Test**:

<Image
  img={dbeaver_test_connection}
  size='md'
  border
  alt='Проверка соединения'
/>


## 4. Выполнение запросов к ClickHouse {#4-query-clickhouse}

Откройте редактор запросов и выполните запрос.

- Щелкните правой кнопкой мыши по вашему подключению и выберите **SQL Editor > Open SQL Script**, чтобы открыть редактор запросов:

<Image img={dbeaver_sql_editor} size='md' border alt='Открытие редактора SQL' />

- Пример запроса к `system.query_log`:

<Image img={dbeaver_query_log_select} size='md' border alt='Пример запроса' />


## Следующие шаги {#next-steps}

Изучите [вики DBeaver](https://github.com/dbeaver/dbeaver/wiki), чтобы узнать о возможностях DBeaver, и [документацию ClickHouse](https://clickhouse.com/docs), чтобы узнать о возможностях ClickHouse.

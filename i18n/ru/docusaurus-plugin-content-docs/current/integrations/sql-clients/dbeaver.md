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
keywords: ['DBeaver', 'управление базами данных', 'SQL-клиент', 'JDBC-подключение', 'кроссплатформенный']
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

# Подключение DBeaver к ClickHouse {#connect-dbeaver-to-clickhouse}

<ClickHouseSupportedBadge/>

DBeaver доступен в нескольких редакциях. В этом руководстве используется [DBeaver Community](https://dbeaver.io/). С различными редакциями и их возможностями можно ознакомиться [здесь](https://dbeaver.com/edition/). DBeaver подключается к ClickHouse с помощью JDBC.

:::note
Пожалуйста, используйте DBeaver версии 23.1.0 или новее для улучшенной поддержки столбцов `Nullable` в ClickHouse.
:::

## 1. Соберите информацию о вашем ClickHouse {#1-gather-your-clickhouse-details}

DBeaver использует JDBC поверх HTTP(S) для подключения к ClickHouse; для этого вам потребуются:

- endpoint
- номер порта
- имя пользователя
- пароль

## 2. Скачайте DBeaver {#2-download-dbeaver}

DBeaver можно скачать по адресу https://dbeaver.io/download/

## 3. Добавление базы данных {#3-add-a-database}

- Используйте меню **Database > New Database Connection** или значок **New Database Connection** в **Database Navigator**, чтобы открыть диалоговое окно **Connect to a database**:

<Image img={dbeaver_add_database} size="md" border alt="Добавить новую базу данных" />

- Выберите **Analytical**, а затем **ClickHouse**:

- Сформируйте JDBC URL. На вкладке **Main** задайте Host, Port, Username, Password и Database:

<Image img={dbeaver_host_port} size="md" border alt="Укажите имя хоста, порт, пользователя, пароль и имя базы данных" />

- По умолчанию свойство **SSL > Use SSL** не установлено. Если вы подключаетесь к ClickHouse Cloud или серверу, который требует SSL на HTTP-порту, включите **SSL > Use SSL**:

<Image img={dbeaver_use_ssl} size="md" border alt="Включите SSL, если это требуется" />

- Протестируйте подключение:

<Image img={dbeaver_test_connection} size="md" border alt="Протестировать подключение" />

Если DBeaver обнаружит, что у вас не установлен драйвер ClickHouse, он предложит загрузить его:

<Image img={dbeaver_download_driver} size="md" border alt="Загрузить драйвер ClickHouse" />

- После загрузки драйвера снова нажмите **Test** для проверки подключения:

<Image img={dbeaver_test_connection} size="md" border alt="Протестировать подключение" />

## 4. Запрос к ClickHouse {#4-query-clickhouse}

Откройте редактор SQL-запросов и выполните запрос.

- Щёлкните правой кнопкой мыши по подключению и выберите команду **SQL Editor > Open SQL Script**, чтобы открыть редактор запросов:

<Image img={dbeaver_sql_editor} size="md" border alt="Открыть редактор SQL" />

- Пример запроса к `system.query_log`:

<Image img={dbeaver_query_log_select} size="md" border alt="Пример запроса" />

## Дальнейшие шаги {#next-steps}

Подробную информацию о возможностях DBeaver см. в его [wiki](https://github.com/dbeaver/dbeaver/wiki), а о возможностях ClickHouse — в [документации ClickHouse](https://clickhouse.com/docs).

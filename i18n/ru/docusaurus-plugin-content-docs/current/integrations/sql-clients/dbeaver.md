---
slug: /integrations/dbeaver
sidebar_label: 'DBeaver'
description: 'DBeaver — кроссплатформенный инструмент работы с базами данных.'
title: 'Подключение DBeaver к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'sql_client'
  - website: 'https://github.com/dbeaver/dbeaver'
keywords: ['DBeaver', 'управление базами данных', 'SQL-клиент', 'подключение JDBC', 'кроссплатформенный']
---

import Image from '@theme/IdealImage';
import dbeaver_add_database from '@site/static/images/integrations/sql-clients/dbeaver-add-database.png';
import dbeaver_host_port from '@site/static/images/integrations/sql-clients/dbeaver-host-port.png';
import dbeaver_use_ssl from '@site/static/images/integrations/sql-clients/dbeaver-use-ssl.png';
import dbeaver_test_connection from '@site/static/images/integrations/sql-clients/dbeaver-test-connection.png';
import dbeaver_download_driver from '@site/static/images/integrations/sql-clients/dbeaver-download-driver.png';
import dbeaver_sql_editor from '@site/static/images/integrations/sql-clients/dbeaver-sql-editor.png';
import dbeaver_query_log_select from '@site/static/images/integrations/sql-clients/dbeaver-query-log-select.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Подключение DBeaver к ClickHouse \{#connect-dbeaver-to-clickhouse\}

<PartnerBadge/>

DBeaver доступен в нескольких редакциях. В этом руководстве используется [DBeaver Community](https://dbeaver.io/). С различными редакциями и их возможностями можно ознакомиться [здесь](https://dbeaver.com/edition/). DBeaver подключается к ClickHouse с помощью JDBC.

:::note
Используйте DBeaver версии 23.1.0 или новее для улучшенной поддержки столбцов типа `Nullable` в ClickHouse.
:::

## 1. Соберите информацию о вашем экземпляре ClickHouse \{#1-gather-your-clickhouse-details\}

DBeaver использует JDBC поверх HTTP(S) для подключения к ClickHouse, для этого вам понадобятся:

- конечная точка (endpoint)
- номер порта
- имя пользователя
- пароль

## 2. Скачайте DBeaver \{#2-download-dbeaver\}

DBeaver доступен для загрузки по адресу https://dbeaver.io/download/

## 3. Добавьте базу данных \{#3-add-a-database\}

- Используйте меню **Database > New Database Connection** либо значок **New Database Connection** в **Database Navigator**, чтобы открыть диалоговое окно **Connect to a database**:

<Image img={dbeaver_add_database} size="md" border alt="Добавление новой базы данных" />

- Выберите **Analytical**, затем **ClickHouse**:

- Сформируйте JDBC URL. На вкладке **Main** укажите Host, Port, Username, Password и Database:

<Image img={dbeaver_host_port} size="md" border alt="Указание имени хоста, порта, пользователя, пароля и имени базы данных" />

- По умолчанию свойство **SSL > Use SSL** отключено. Если вы подключаетесь к ClickHouse Cloud или серверу, который требует SSL на HTTP-порту, включите **SSL > Use SSL**:

<Image img={dbeaver_use_ssl} size="md" border alt="Включение SSL при необходимости" />

- Проверьте соединение:

<Image img={dbeaver_test_connection} size="md" border alt="Проверка соединения" />

Если DBeaver обнаружит, что драйвер ClickHouse не установлен, он предложит загрузить его:

<Image img={dbeaver_download_driver} size="md" border alt="Загрузка драйвера ClickHouse" />

- После загрузки драйвера снова нажмите **Test**, чтобы проверить соединение:

<Image img={dbeaver_test_connection} size="md" border alt="Проверка соединения" />

## 4. Выполнение запросов к ClickHouse \{#4-query-clickhouse\}

Откройте редактор запросов и выполните запрос.

- Щёлкните правой кнопкой мыши по подключению и выберите **SQL Editor > Open SQL Script**, чтобы открыть редактор запросов:

<Image img={dbeaver_sql_editor} size="md" border alt="Открытие редактора SQL" />

- Пример запроса к `system.query_log`:

<Image img={dbeaver_query_log_select} size="md" border alt="Пример запроса" />

## Дальнейшие шаги \{#next-steps\}

Подробнее о возможностях DBeaver см. в [DBeaver wiki](https://github.com/dbeaver/dbeaver/wiki), а о возможностях ClickHouse — в [документации ClickHouse](https://clickhouse.com/docs).
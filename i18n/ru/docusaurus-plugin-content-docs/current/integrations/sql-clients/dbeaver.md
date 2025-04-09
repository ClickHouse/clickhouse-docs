---
slug: /integrations/dbeaver
sidebar_label: 'DBeaver'
description: 'DBeaver — это многофункциональный инструмент для работы с базами данных.'
title: 'Подключение DBeaver к ClickHouse'
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

DBeaver доступен в нескольких версиях. В этом руководстве используется [DBeaver Community](https://dbeaver.io/). Ознакомьтесь с различными предложениями и возможностями [здесь](https://dbeaver.com/edition/). DBeaver подключается к ClickHouse с помощью JDBC.

:::note
Пожалуйста, используйте DBeaver версии 23.1.0 или выше для улучшенной поддержки `Nullable` колонок в ClickHouse.
:::

## 1. Соберите данные ClickHouse {#1-gather-your-clickhouse-details}

DBeaver использует JDBC через HTTP(S) для подключения к ClickHouse. Вам потребуется:

- конечная точка
- номер порта
- имя пользователя
- пароль

## 2. Скачайте DBeaver {#2-download-dbeaver}

DBeaver доступен на https://dbeaver.io/download/

## 3. Добавьте базу данных {#3-add-a-database}

- Используйте меню **Database > New Database Connection** или иконку **New Database Connection** в **Database Navigator**, чтобы открыть диалог **Подключиться к базе данных**:

<Image img={dbeaver_add_database} size="md" border alt="Добавить новую базу данных" />

- Выберите **Analytical**, а затем **ClickHouse**:

- Постройте JDBC URL. На вкладке **Main** укажите Host, Port, Username, Password и Database:

<Image img={dbeaver_host_port} size="md" border alt="Установите имя хоста, порт, пользователя, пароль и имя базы данных" />

- По умолчанию свойство **SSL > Use SSL** будет отключено. Если вы подключаетесь к ClickHouse Cloud или к серверу, который требует SSL на HTTP-порту, тогда установите **SSL > Use SSL** в положение включено:

<Image img={dbeaver_use_ssl} size="md" border alt="Включите SSL, если это необходимо" />

- Протестируйте подключение:

<Image img={dbeaver_test_connection} size="md" border alt="Проверить подключение" />

Если DBeaver обнаружит отсутствие драйвера ClickHouse, он предложит скачать его для вас:

<Image img={dbeaver_download_driver} size="md" border alt="Скачать драйвер ClickHouse" />

- После загрузки драйвера снова **Проверьте** подключение:

<Image img={dbeaver_test_connection} size="md" border alt="Проверить подключение" />

## 4. Запрос к ClickHouse {#4-query-clickhouse}

Откройте редактор запросов и выполните запрос.

- Щелкните правой кнопкой мыши на вашем соединении и выберите **SQL Editor > Open SQL Script**, чтобы открыть редактор запросов:

<Image img={dbeaver_sql_editor} size="md" border alt="Открыть SQL редактор" />

- Пример запроса к `system.query_log`:

<Image img={dbeaver_query_log_select} size="md" border alt="Пример запроса" />

## Следующие шаги {#next-steps}

Посмотрите [wiki DBeaver](https://github.com/dbeaver/dbeaver/wiki), чтобы узнать о возможностях DBeaver, и [документацию ClickHouse](https://clickhouse.com/docs), чтобы узнать о возможностях ClickHouse.

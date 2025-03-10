---
slug: /integrations/dbeaver
sidebar_label: DBeaver
description: 'DBeaver is a multi-platform database tool.'
---

import dbeaver_add_database from '@site/static/images/integrations/sql-clients/dbeaver-add-database.png';
import dbeaver_host_port from '@site/static/images/integrations/sql-clients/dbeaver-host-port.png';
import dbeaver_use_ssl from '@site/static/images/integrations/sql-clients/dbeaver-use-ssl.png';
import dbeaver_test_connection from '@site/static/images/integrations/sql-clients/dbeaver-test-connection.png';
import dbeaver_download_driver from '@site/static/images/integrations/sql-clients/dbeaver-download-driver.png';
import dbeaver_sql_editor from '@site/static/images/integrations/sql-clients/dbeaver-sql-editor.png';
import dbeaver_query_log_select from '@site/static/images/integrations/sql-clients/dbeaver-query-log-select.png';


# Подключение DBeaver к ClickHouse

DBeaver доступен в нескольких версиях. В этом руководстве используется [DBeaver Community](https://dbeaver.io/). Ознакомьтесь с различными версиями и возможностями [здесь](https://dbeaver.com/edition/). DBeaver подключается к ClickHouse с использованием JDBC.

:::note
Пожалуйста, используйте DBeaver версии 23.1.0 или выше для улучшенной поддержки `Nullable` колонок в ClickHouse.
:::

## 1. Соберите данные ClickHouse {#1-gather-your-clickhouse-details}

DBeaver использует JDBC через HTTP(S) для подключения к ClickHouse; вам необходимо:

- конечная точка
- номер порта
- имя пользователя
- пароль

## 2. Загрузите DBeaver {#2-download-dbeaver}

DBeaver доступен по адресу https://dbeaver.io/download/

## 3. Добавьте базу данных {#3-add-a-database}

- Либо используйте меню **Database > New Database Connection**, либо значок **New Database Connection** в **Database Navigator**, чтобы открыть диалог **Connect to a database**:

<img src={dbeaver_add_database} class="image" alt="Добавить новую базу данных" />

- Выберите **Analytical**, затем **ClickHouse**:

- Постройте JDBC URL. На вкладке **Main** задайте Host, Port, Username, Password и Database:

<img src={dbeaver_host_port} class="image" alt="Установите имя хоста, порт, пользователя, пароль и имя базы данных" />

- По умолчанию свойство **SSL > Use SSL** будет отключено, если вы подключаетесь к ClickHouse Cloud или серверу, который требует SSL на HTTP порту, тогда установите **SSL > Use SSL** в положение "включено":

<img src={dbeaver_use_ssl} class="image" alt="Включите SSL при необходимости" />

- Проверьте соединение:

<img src={dbeaver_test_connection} class="image" alt="Проверьте соединение" />

Если DBeaver обнаружит, что драйвер ClickHouse не установлен, он предложит скачать его для вас:

<img src={dbeaver_download_driver} class="image" alt="Скачать драйвер ClickHouse" />

- После загрузки драйвера снова **Проверьте** соединение:

<img src={dbeaver_test_connection} class="image" alt="Проверьте соединение" />

## 4. Запрос к ClickHouse {#4-query-clickhouse}

Откройте редактор запросов и выполните запрос.

- Щелкните правой кнопкой мыши на вашем соединении и выберите **SQL Editor > Open SQL Script**, чтобы открыть редактор запросов:

<img src={dbeaver_sql_editor} class="image" alt="Откройте SQL редактор" />

- Пример запроса к `system.query_log`:

<img src={dbeaver_query_log_select} class="image" alt="Пример запроса" />

## Следующие шаги {#next-steps}

Посмотрите [вики DBeaver](https://github.com/dbeaver/dbeaver/wiki), чтобы узнать о возможностях DBeaver, и [документацию ClickHouse](https://clickhouse.com/docs), чтобы узнать о возможностях ClickHouse.

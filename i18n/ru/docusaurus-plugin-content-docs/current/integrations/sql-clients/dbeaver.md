---
slug: '/integrations/dbeaver'
sidebar_label: DBeaver
description: 'DBeaver является многоплатформенным инструментом для работы с базами'
title: 'Подключение DBeaver к ClickHouse'
doc_type: guide
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

DBeaver доступен в нескольких вариантах. В этом руководстве используется [DBeaver Community](https://dbeaver.io/). Ознакомьтесь с различными предложениями и возможностями [здесь](https://dbeaver.com/edition/). DBeaver подключается к ClickHouse с помощью JDBC.

:::note
Пожалуйста, используйте версию DBeaver 23.1.0 или выше для лучшей поддержки `Nullable` колонок в ClickHouse.
:::

## 1. Соберите ваши данные для ClickHouse {#1-gather-your-clickhouse-details}

DBeaver использует JDBC через HTTP(S) для подключения к ClickHouse; вам понадобятся:

- конечная точка
- номер порта
- имя пользователя
- пароль

## 2. Загрузите DBeaver {#2-download-dbeaver}

DBeaver доступен по адресу https://dbeaver.io/download/

## 3. Добавьте базу данных {#3-add-a-database}

- Либо используйте меню **База данных > Новое соединение с базой данных**, либо нажмите на иконку **Новое соединение с базой данных** в **Обозревателе базы данных**, чтобы открыть диалоговое окно **Подключение к базе данных**:

<Image img={dbeaver_add_database} size="md" border alt="Добавить новую базу данных" />

- Выберите **Аналитическая** и затем **ClickHouse**:

- Постройте JDBC URL. На вкладке **Основное** укажите Хост, Порт, Имя пользователя, Пароль и Базу данных:

<Image img={dbeaver_host_port} size="md" border alt="Установите имя хоста, порт, пользователя, пароль и имя базы данных" />

- По умолчанию свойство **SSL > Использовать SSL** будет снято. Если вы подключаетесь к ClickHouse Cloud или к серверу, который требует SSL на HTTP порту, установите **SSL > Использовать SSL** на:

<Image img={dbeaver_use_ssl} size="md" border alt="Включите SSL, если это необходимо" />

- Протестируйте соединение:

<Image img={dbeaver_test_connection} size="md" border alt="Проверить соединение" />

Если DBeaver обнаружит, что драйвер ClickHouse не установлен, он предложит скачать его для вас:

<Image img={dbeaver_download_driver} size="md" border alt="Скачать драйвер ClickHouse" />

- После загрузки драйвера снова **Проверьте** соединение:

<Image img={dbeaver_test_connection} size="md" border alt="Проверить соединение" />

## 4. Выполнение запросов к ClickHouse {#4-query-clickhouse}

Откройте редактор запросов и выполните запрос.

- Щелкните правой кнопкой мыши на вашем соединении и выберите **SQL редактор > Открыть SQL скрипт**, чтобы открыть редактор запросов:

<Image img={dbeaver_sql_editor} size="md" border alt="Открыть SQL редактор" />

- Пример запроса к `system.query_log`:

<Image img={dbeaver_query_log_select} size="md" border alt="Пример запроса" />

## Следующие шаги {#next-steps}

Посмотрите [вики DBeaver](https://github.com/dbeaver/dbeaver/wiki), чтобы узнать о возможностях DBeaver, и [документацию ClickHouse](https://clickhouse.com/docs), чтобы узнать о функциях ClickHouse.
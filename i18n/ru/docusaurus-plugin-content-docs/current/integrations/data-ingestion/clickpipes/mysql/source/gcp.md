---
sidebar_label: 'Руководство по настройке Cloud SQL for MySQL'
description: 'Пошаговое руководство по настройке Cloud SQL for MySQL в качестве источника для ClickPipes'
slug: /integrations/clickpipes/mysql/source/gcp
title: 'Руководство по настройке источника Cloud SQL for MySQL'
keywords: ['google cloud sql', 'mysql', 'clickpipes', 'pitr', 'корневой сертификат ЦС']
doc_type: 'guide'
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import gcp_pitr from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-pitr.png';
import gcp_mysql_flags from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-flags.png';
import gcp_mysql_ip from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-ip.png';
import gcp_mysql_edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-edit-button.png';
import gcp_mysql_cert from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-cert.png';
import rootca from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/rootca.png';
import Image from '@theme/IdealImage';


# Руководство по настройке источника Cloud SQL for MySQL \{#cloud-sql-for-mysql-source-setup-guide\}

Это пошаговое руководство по настройке экземпляра Cloud SQL for MySQL для репликации данных с помощью ClickPipe для MySQL.

## Включение хранения двоичного журнала \{#enable-binlog-retention-gcp\}

Двоичный журнал — это набор файлов журнала, содержащих информацию об изменениях данных, внесённых в экземпляр сервера MySQL. Эти файлы двоичного журнала необходимы для репликации.

### Включение двоичного логирования через PITR \{#enable-binlog-logging-gcp\}

Функция PITR определяет, включено или отключено двоичное логирование для MySQL в Google Cloud. Ее можно настроить в Cloud console, отредактировав экземпляр Cloud SQL и прокрутив страницу до следующего раздела.

<Image img={gcp_pitr} alt="Включение PITR в Cloud SQL" size="lg" border/>

Рекомендуется установить значение достаточно большим, в зависимости от сценария использования репликации.

Если это еще не настроено, убедитесь, что вы задали следующие параметры в разделе флагов базы данных, отредактировав Cloud SQL:

1. `binlog_expire_logs_seconds` — значение >= `86400` (1 день).
2. `binlog_row_metadata` — `FULL`
3. `binlog_row_image` — `FULL`

Для этого нажмите кнопку `Edit` в правом верхнем углу страницы обзора экземпляра.

<Image img={gcp_mysql_edit_button} alt="Кнопка Edit в GCP MySQL" size="lg" border/>

Затем прокрутите вниз до раздела `Flags` и добавьте указанные выше флаги.

<Image img={gcp_mysql_flags} alt="Настройка binlog-флагов в GCP" size="lg" border/>

## Настройка пользователя базы данных \{#configure-database-user-gcp\}

Подключитесь к экземпляру Cloud SQL for MySQL под пользователем root и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. Предоставьте права на схему. В следующем примере показаны права для базы данных `clickpipes`. Повторите эти команды для каждой базы данных и каждого хоста, с которых вы хотите выполнять репликацию:

    ```sql
    GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'host';
    ```

3. Предоставьте пользователю права на репликацию:

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## Настройка сетевого доступа \{#configure-network-access-gcp-mysql\}

Если вы хотите ограничить трафик к экземпляру Cloud SQL, добавьте [задокументированные статические IP-адреса NAT](../../index.md#list-of-static-ips) в список разрешённых IP-адресов экземпляра Cloud SQL MySQL.
Это можно сделать либо, отредактировав экземпляр, либо перейдя во вкладку `Connections` в боковом меню консоли Cloud.

<Image img={gcp_mysql_ip} alt="Разрешение IP-адресов в GCP MySQL" size="lg" border/>

## Загрузка и использование корневого сертификата центра сертификации \{#download-root-ca-certificate-gcp-mysql\}

Чтобы подключиться к вашему экземпляру Cloud SQL, необходимо скачать корневой сертификат центра сертификации (CA).

1. Перейдите к вашему экземпляру Cloud SQL в консоли Cloud.
2. Нажмите `Connections` в боковой панели.
3. Нажмите вкладку `Security`.
4. В разделе `Manage server CA certificates` нажмите кнопку `DOWNLOAD CERTIFICATES` внизу.

<Image img={gcp_mysql_cert} alt="Загрузка сертификата GCP MySQL" size="lg" border/>

5. В интерфейсе ClickPipes загрузите скачанный сертификат при создании нового MySQL ClickPipe.

<Image img={rootca} alt="Использование сертификата GCP MySQL" size="lg" border/>
---
sidebar_label: 'Cloud SQL для MySQL'
description: 'Пошаговое руководство по настройке Cloud SQL для MySQL в качестве источника для ClickPipes'
slug: /integrations/clickpipes/mysql/source/gcp
title: 'Руководство по настройке источника Cloud SQL для MySQL'
keywords: ['google cloud sql', 'mysql', 'clickpipes', 'pitr', 'root ca certificate']
doc_type: 'guide'
---

import gcp_pitr from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-pitr.png';
import gcp_mysql_flags from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-flags.png';
import gcp_mysql_ip from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-ip.png';
import gcp_mysql_edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-edit-button.png';
import gcp_mysql_cert from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-cert.png';
import rootca from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/rootca.png';
import Image from '@theme/IdealImage';


# Руководство по настройке источника Cloud SQL for MySQL

Это пошаговое руководство по настройке экземпляра Cloud SQL for MySQL для репликации данных через MySQL ClickPipe.



## Включение хранения бинарного лога {#enable-binlog-retention-gcp}
Бинарный лог — это набор файлов журнала, которые содержат информацию об изменениях данных, произведённых в экземпляре сервера MySQL. Файлы бинарного лога необходимы для репликации.

### Включение бинарного логирования через PITR{#enable-binlog-logging-gcp}
Функция PITR определяет, включено или выключено бинарное логирование для MySQL в Google Cloud. Она настраивается в консоли Cloud Console при редактировании экземпляра Cloud SQL и прокрутке до следующего раздела.

<Image img={gcp_pitr} alt="Включение PITR в Cloud SQL" size="lg" border/>

Рекомендуется установить достаточно длительный период хранения в зависимости от сценария использования репликации.

Если это ещё не настроено, убедитесь, что в разделе флагов базы данных при редактировании Cloud SQL заданы следующие параметры:
1. `binlog_expire_logs_seconds` со значением >= `86400` (1 день).
2. `binlog_row_metadata` со значением `FULL`
3. `binlog_row_image` со значением `FULL`

Чтобы сделать это, нажмите кнопку `Edit` в правом верхнем углу страницы обзора экземпляра.
<Image img={gcp_mysql_edit_button} alt="Кнопка Edit в GCP MySQL" size="lg" border/>

Затем прокрутите вниз до раздела `Flags` и добавьте указанные выше флаги.

<Image img={gcp_mysql_flags} alt="Настройка флагов binlog в GCP" size="lg" border/>



## Настройка пользователя базы данных {#configure-database-user-gcp}

Подключитесь к экземпляру Cloud SQL MySQL от имени пользователя root и выполните следующие команды:

1. Создайте выделенного пользователя для ClickPipes:

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. Выдайте права на схему. В следующем примере показаны права для базы данных `clickpipes`. Повторите эти команды для каждой базы данных и хоста, которые вы хотите реплицировать:

    ```sql
    GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'host';
    ```

3. Выдайте пользователю права на репликацию:

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```



## Настройка сетевого доступа {#configure-network-access-gcp-mysql}

Если вы хотите ограничить трафик к экземпляру Cloud SQL, добавьте [указанные статические NAT IP-адреса](../../index.md#list-of-static-ips) в список разрешённых IP-адресов вашего экземпляра Cloud SQL MySQL.
Это можно сделать, отредактировав экземпляр или перейдя на вкладку `Connections` в боковой панели консоли Cloud.

<Image img={gcp_mysql_ip} alt="Добавление IP-адресов в allowlist в GCP MySQL" size="lg" border/>



## Загрузка и использование корневого сертификата ЦС {#download-root-ca-certificate-gcp-mysql}
Чтобы подключиться к экземпляру Cloud SQL, необходимо скачать корневой сертификат центра сертификации (ЦС).

1. Перейдите на страницу экземпляра Cloud SQL в Cloud Console.
2. В боковой панели нажмите `Connections`.
3. Откройте вкладку `Security`.
4. В разделе `Manage server CA certificates` нажмите кнопку `DOWNLOAD CERTIFICATES` внизу.

<Image img={gcp_mysql_cert} alt="Загрузка сертификата GCP MySQL" size="lg" border/>

5. В интерфейсе ClickPipes загрузите скачанный сертификат при создании нового MySQL ClickPipe.

<Image img={rootca} alt="Использование сертификата GCP MySQL" size="lg" border/>

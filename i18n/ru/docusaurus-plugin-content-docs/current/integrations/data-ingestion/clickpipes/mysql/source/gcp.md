---
sidebar_label: 'Контроль доступа Cloud SQL для MySQL'
description: 'Пошаговое руководство по настройке Cloud SQL для MySQL в качестве источника для ClickPipes'
slug: /integrations/clickpipes/mysql/source/gcp
title: 'Руководство по настройке источника Cloud SQL для MySQL'
---

import gcp_pitr from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-pitr.png';
import gcp_mysql_flags from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-flags.png';
import gcp_mysql_ip from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-ip.png';
import gcp_mysql_edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-edit-button.png';
import gcp_mysql_cert from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-cert.png';
import rootca from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/rootca.png';
import Image from '@theme/IdealImage';


# Руководство по настройке источника Cloud SQL для MySQL

Это пошаговое руководство по настройке вашего экземпляра Cloud SQL для MySQL для репликации его данных через MySQL ClickPipe.

## Включение хранения бинарного лога {#enable-binlog-retention-gcp}
Бинарный лог - это набор лог-файлов, которые содержат информацию о модификациях данных, внесенных в экземпляр MySQL, и файлы бинарного лога необходимы для репликации.

### Включение бинарного логирования через PITR {#enable-binlog-logging-gcp}
Функция PITR определяет, включено ли бинарное логирование для MySQL в Google Cloud. Это можно настроить в консоли Cloud, отредактировав ваш экземпляр Cloud SQL и прокрутив вниз до следующего раздела.

<Image img={gcp_pitr} alt="Включение PITR в Cloud SQL" size="lg" border/>

Рекомендуется установить значение на разумно длинный срок в зависимости от сценария репликации.

Если это еще не настроено, убедитесь, что вы установили следующие параметры в разделе флагов базы данных, отредактировав Cloud SQL:
1. `binlog_expire_logs_seconds` на значение >= `86400` (1 день).
2. `binlog_row_metadata` на `FULL`
3. `binlog_row_image` на `FULL`

Для этого нажмите кнопку `Edit` в верхнем правом углу страницы обзора экземпляра.
<Image img={gcp_mysql_edit_button} alt="Кнопка редактирования в GCP MySQL" size="lg" border/>

Затем прокрутите вниз до раздела `Flags` и добавьте вышеуказанные флаги.

<Image img={gcp_mysql_flags} alt="Настройка флагов binlog в GCP" size="lg" border/>

## Настройка пользователя базы данных {#configure-database-user-gcp}

Подключитесь к вашему экземпляру Cloud SQL MySQL как пользователь root и выполните следующие команды:

1. Создайте специального пользователя для ClickPipes:

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. Предоставьте права на схему. В следующем примере показываются права для базы данных `clickpipes`. Повторите эти команды для каждой базы данных и хоста, которые вы хотите реплицировать:

    ```sql
    GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'host';
    ```

3. Предоставьте права на репликацию пользователю:

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## Настройка сетевого доступа {#configure-network-access-gcp-mysql}

Если вы хотите ограничить трафик к вашему экземпляру Cloud SQL, добавьте [документированные статические NAT IP-адреса](../../index.md#list-of-static-ips) в белый список IP-адресов вашего экземпляра Cloud SQL для MySQL.
Это можно сделать, отредактировав экземпляр или перейдя на вкладку `Connections` в боковом меню в Cloud Console.

<Image img={gcp_mysql_ip} alt="Разрешение IP в GCP MySQL" size="lg" border/>

## Загрузка и использование сертификата корневого CA {#download-root-ca-certificate-gcp-mysql}
Чтобы подключиться к вашему экземпляру Cloud SQL, необходимо загрузить сертификат корневого CA.

1. Перейдите к вашему экземпляру Cloud SQL в консоли Cloud.
2. Нажмите на `Connections` в боковом меню.
3. Нажмите на вкладку `Security`.
4. В разделе `Manage server CA certificates` нажмите на кнопку `DOWNLOAD CERTIFICATES` внизу.

<Image img={gcp_mysql_cert} alt="Загрузка сертификата GCP MySQL" size="lg" border/>

5. В интерфейсе ClickPipes загрузите загруженный сертификат при создании нового MySQL ClickPipe.

<Image img={rootca} alt="Использование сертификата GCP MySQL" size="lg" border/>

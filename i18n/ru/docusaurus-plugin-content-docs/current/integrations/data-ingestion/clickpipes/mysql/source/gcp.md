---
sidebar_label: 'Cloud SQL для MySQL '
description: 'Пошаговое руководство по настройке Cloud SQL for MySQL в качестве источника для ClickPipes'
slug: /integrations/clickpipes/mysql/source/gcp
title: 'Руководство по настройке источника Cloud SQL for MySQL'
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

Пошаговое руководство по настройке экземпляра Cloud SQL for MySQL для репликации данных через MySQL ClickPipe.



## Включение хранения бинарного журнала {#enable-binlog-retention-gcp}

Бинарный журнал — это набор файлов журналов, содержащих информацию об изменениях данных в экземпляре сервера MySQL. Файлы бинарного журнала необходимы для репликации.

### Включение бинарного журналирования через PITR {#enable-binlog-logging-gcp}

Функция PITR определяет, включено или выключено бинарное журналирование для MySQL в Google Cloud. Её можно настроить в консоли Cloud, отредактировав экземпляр Cloud SQL и прокрутив вниз до нужного раздела.

<Image img={gcp_pitr} alt='Включение PITR в Cloud SQL' size='lg' border />

Рекомендуется установить достаточно большое значение в зависимости от сценария использования репликации.

Если эти параметры ещё не настроены, обязательно установите их в разделе флагов базы данных, отредактировав Cloud SQL:

1. `binlog_expire_logs_seconds` to a value >= `86400` (1 day).
2. `binlog_row_metadata` to `FULL`
3. `binlog_row_image` to `FULL`

Для этого нажмите кнопку `Edit` в правом верхнем углу страницы обзора экземпляра.

<Image
  img={gcp_mysql_edit_button}
  alt='Кнопка Edit в GCP MySQL'
  size='lg'
  border
/>

Затем прокрутите вниз до раздела `Flags` и добавьте указанные выше флаги.

<Image
  img={gcp_mysql_flags}
  alt='Установка флагов binlog в GCP'
  size='lg'
  border
/>


## Настройка пользователя базы данных {#configure-database-user-gcp}

Подключитесь к экземпляру Cloud SQL MySQL от имени пользователя root и выполните следующие команды:

1. Создайте выделенного пользователя для ClickPipes:

   ```sql
   CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
   ```

2. Предоставьте права доступа к схеме. В следующем примере показаны права для базы данных `clickpipes`. Повторите эти команды для каждой базы данных и хоста, которые требуется реплицировать:

   ```sql
   GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'host';
   ```

3. Предоставьте пользователю права на репликацию:

   ```sql
   GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
   GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
   ```


## Настройка сетевого доступа {#configure-network-access-gcp-mysql}

Если вы хотите ограничить трафик к экземпляру Cloud SQL, добавьте [документированные статические NAT IP-адреса](../../index.md#list-of-static-ips) в список разрешённых IP-адресов экземпляра Cloud SQL MySQL.
Это можно сделать либо путём редактирования экземпляра, либо перейдя на вкладку `Connections` на боковой панели в консоли Cloud.

<Image img={gcp_mysql_ip} alt='Список разрешённых IP-адресов в GCP MySQL' size='lg' border />


## Загрузка и использование корневого сертификата CA {#download-root-ca-certificate-gcp-mysql}

Для подключения к экземпляру Cloud SQL необходимо загрузить корневой сертификат CA.

1. Перейдите к экземпляру Cloud SQL в консоли Cloud.
2. Нажмите на `Connections` на боковой панели.
3. Перейдите на вкладку `Security`.
4. В разделе `Manage server CA certificates` нажмите на кнопку `DOWNLOAD CERTIFICATES` внизу.

<Image img={gcp_mysql_cert} alt='Загрузка сертификата GCP MySQL' size='lg' border />

5. В интерфейсе ClickPipes загрузите скачанный сертификат при создании нового MySQL ClickPipe.

<Image img={rootca} alt='Использование сертификата GCP MySQL' size='lg' border />

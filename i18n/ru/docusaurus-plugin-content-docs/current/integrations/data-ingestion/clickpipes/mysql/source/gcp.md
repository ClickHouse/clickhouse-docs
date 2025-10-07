---
'sidebar_label': 'Cloud SQL Для MySQL'
'description': 'Пошаговое руководство по настройке Cloud SQL для MySQL в качестве
  источника для ClickPipes'
'slug': '/integrations/clickpipes/mysql/source/gcp'
'title': 'Руководство по настройке источника Cloud SQL для MySQL'
'doc_type': 'guide'
---

import gcp_pitr from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-pitr.png';
import gcp_mysql_flags from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-flags.png';
import gcp_mysql_ip from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-ip.png';
import gcp_mysql_edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-edit-button.png';
import gcp_mysql_cert from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-cert.png';
import rootca from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/rootca.png';
import Image from '@theme/IdealImage';


# Руководство по настройке источника Cloud SQL для MySQL

Это пошаговое руководство о том, как настроить ваш экземпляр Cloud SQL для MySQL для репликации его данных через MySQL ClickPipe.

## Включите хранение бинарного журнала {#enable-binlog-retention-gcp}
Бинарный журнал — это набор файлов журнала, которые содержат информацию о модификациях данных, выполненных на экземпляре MySQL, и файлы бинарного журнала необходимы для репликации.

### Включите бинарное логирование через PITR {#enable-binlog-logging-gcp}
Функция PITR определяет, включено или выключено бинарное логирование для MySQL в Google Cloud. Это можно установить в консоли Cloud, отредактировав ваш экземпляр Cloud SQL и прокрутив вниз до следующего раздела.

<Image img={gcp_pitr} alt="Включение PITR в Cloud SQL" size="lg" border/>

Рекомендуется установить значение на разумно долгий срок в зависимости от сценария репликации.

Если это еще не настроено, убедитесь, что установлены следующие параметры в разделе флагов базы данных, редактируя Cloud SQL:
1. `binlog_expire_logs_seconds` на значение >= `86400` (1 день).
2. `binlog_row_metadata` на `FULL`
3. `binlog_row_image` на `FULL`

Для этого нажмите кнопку `Edit` в правом верхнем углу страницы обзора экземпляра.
<Image img={gcp_mysql_edit_button} alt="Кнопка редактирования в GCP MySQL" size="lg" border/>

Затем прокрутите вниз до раздела `Flags` и добавьте указанные выше флаги.

<Image img={gcp_mysql_flags} alt="Установка флагов binlog в GCP" size="lg" border/>

## Настройте пользователя базы данных {#configure-database-user-gcp}

Подключитесь к вашему экземпляру Cloud SQL MySQL как корневой пользователь и выполните следующие команды:

1. Создайте выделенного пользователя для ClickPipes:

```sql
CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
```

2. Предоставьте права доступа к схеме. Следующий пример показывает права для базы данных `clickpipes`. Повторите эти команды для каждой базы данных и хоста, которые вы хотите реплицировать:

```sql
GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'host';
```

3. Предоставьте пользователю права на репликацию:

```sql
GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
```

## Настройте сетевой доступ {#configure-network-access-gcp-mysql}

Если вы хотите ограничить трафик к вашему экземпляру Cloud SQL, добавьте [документированные статические NAT IP](../../index.md#list-of-static-ips) в список разрешенных IP адресов вашего экземпляра Cloud SQL для MySQL. Это можно сделать либо редактируя экземпляр, либо перейдя на вкладку `Connections` в боковой панели консоли Cloud.

<Image img={gcp_mysql_ip} alt="Разрешение IP в GCP MySQL" size="lg" border/>

## Скачайте и используйте корневой сертификат CA {#download-root-ca-certificate-gcp-mysql}
Чтобы подключиться к вашему экземпляру Cloud SQL, вы должны скачать корневой сертификат CA.

1. Перейдите к вашему экземпляру Cloud SQL в консоли Cloud.
2. Нажмите на `Connections` в боковой панели.
3. Нажмите на вкладку `Security`.
4. В разделе `Manage server CA certificates` нажмите кнопку `DOWNLOAD CERTIFICATES` внизу.

<Image img={gcp_mysql_cert} alt="Скачивание сертификата GCP MySQL" size="lg" border/>

5. В интерфейсе ClickPipes загрузите загруженный сертификат при создании нового MySQL ClickPipe.

<Image img={rootca} alt="Использование сертификата GCP MySQL" size="lg" border/>

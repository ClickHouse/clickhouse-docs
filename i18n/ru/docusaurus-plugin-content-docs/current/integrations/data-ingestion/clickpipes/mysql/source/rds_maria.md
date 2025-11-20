---
sidebar_label: 'Amazon RDS MariaDB'
description: 'Пошаговое руководство по настройке Amazon RDS MariaDB как источника для ClickPipes'
slug: /integrations/clickpipes/mysql/source/rds_maria
title: 'Руководство по настройке источника RDS MariaDB'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import rds_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/rds_config.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';


# Руководство по настройке источника RDS MariaDB

Это пошаговое руководство по настройке экземпляра RDS MariaDB для репликации его данных через MySQL ClickPipe.
<br/>
:::info
Рекомендуем также ознакомиться с разделом часто задаваемых вопросов по MySQL [здесь](/integrations/data-ingestion/clickpipes/mysql/faq.md). Страница с вопросами и ответами регулярно обновляется.
:::



## Включение хранения бинарных логов {#enable-binlog-retention-rds}

Бинарный лог — это набор файлов журналов, содержащих информацию об изменениях данных, выполненных на экземпляре сервера MySQL. Файлы бинарных логов необходимы для репликации. Необходимо выполнить оба следующих шага:

### 1. Включение бинарного логирования через автоматическое резервное копирование{#enable-binlog-logging-rds}

Функция автоматического резервного копирования определяет, включено или выключено бинарное логирование для MySQL. Настройка выполняется в консоли AWS:

<Image
  img={rds_backups}
  alt='Включение автоматического резервного копирования в RDS'
  size='lg'
  border
/>

Рекомендуется установить достаточно длительный период хранения резервных копий в зависимости от сценария использования репликации.

### 2. Время хранения бинарных логов{#binlog-retention-hours-rds}

Amazon RDS для MariaDB использует другой метод установки длительности хранения бинарных логов, которая определяет, как долго хранится файл бинарного лога, содержащий изменения. Если некоторые изменения не будут прочитаны до удаления файла бинарного лога, репликация не сможет продолжиться. Значение по умолчанию для времени хранения бинарных логов — NULL, что означает, что бинарные логи не сохраняются.

Чтобы указать количество часов для хранения бинарных логов на экземпляре БД, используйте функцию mysql.rds_set_configuration с периодом хранения бинарных логов, достаточным для выполнения репликации. Рекомендуемый минимум — `24 часа`.

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```


## Настройка параметров binlog в группе параметров {#binlog-parameter-group-rds}

Группу параметров можно найти, щелкнув по экземпляру MariaDB в консоли RDS и перейдя на вкладку `Configurations`.

<Image
  img={rds_config}
  alt='Где найти группу параметров в RDS'
  size='lg'
  border
/>

После перехода по ссылке группы параметров откроется страница группы параметров. В правом верхнем углу вы увидите кнопку Edit:

<Image img={edit_button} alt='Редактирование группы параметров' size='lg' border />

Параметры `binlog_format`, `binlog_row_metadata` и `binlog_row_image` необходимо установить следующим образом:

1. `binlog_format` to `ROW`.

<Image img={binlog_format} alt='Формат binlog установлен в ROW' size='lg' border />

2. `binlog_row_metadata` to `FULL`

<Image
  img={binlog_row_metadata}
  alt='Метаданные строк binlog установлены в FULL'
  size='lg'
  border
/>

3. `binlog_row_image` to `FULL`

<Image img={binlog_row_image} alt='Образ строк binlog установлен в FULL' size='lg' border />

Затем нажмите `Save Changes` в правом верхнем углу. Для применения изменений может потребоваться перезагрузка экземпляра. Если рядом со ссылкой на группу параметров на вкладке Configurations экземпляра RDS отображается статус `Pending reboot`, это означает, что необходима перезагрузка экземпляра.

<br />
:::tip Если у вас кластер MariaDB, указанные выше параметры находятся в группе параметров
[DB
Cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html),
а не в группе параметров экземпляра БД. :::


## Включение режима GTID {#gtid-mode-rds}

Глобальные идентификаторы транзакций (GTID) — это уникальные идентификаторы, присваиваемые каждой зафиксированной транзакции в MySQL/MariaDB. Они упрощают репликацию binlog и облегчают диагностику проблем. MariaDB включает режим GTID по умолчанию, поэтому никаких действий со стороны пользователя не требуется.


## Настройка пользователя базы данных {#configure-database-user-rds}

Подключитесь к экземпляру RDS MariaDB от имени администратора и выполните следующие команды:

1. Создайте выделенного пользователя для ClickPipes:

   ```sql
   CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
   ```

2. Предоставьте права доступа к схеме. В следующем примере показаны права для базы данных `mysql`. Повторите эти команды для каждой базы данных и хоста, которые требуется реплицировать:

   ```sql
   GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
   ```

3. Предоставьте пользователю права на репликацию:

   ```sql
   GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
   GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
   ```


## Настройка сетевого доступа {#configure-network-access}

### Контроль доступа на основе IP-адресов {#ip-based-access-control}

Если вы хотите ограничить трафик к вашему экземпляру RDS, добавьте [документированные статические NAT IP-адреса](../../index.md#list-of-static-ips) в правила входящего трафика (`Inbound rules`) группы безопасности вашего RDS.

<Image
  img={security_group_in_rds_mysql}
  alt='Где найти группу безопасности в RDS?'
  size='lg'
  border
/>

<Image
  img={edit_inbound_rules}
  alt='Редактирование правил входящего трафика для указанной группы безопасности'
  size='lg'
  border
/>

### Приватный доступ через AWS PrivateLink {#private-access-via-aws-privatelink}

Для подключения к экземпляру RDS через приватную сеть можно использовать AWS PrivateLink. Следуйте нашему [руководству по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes), чтобы настроить соединение.

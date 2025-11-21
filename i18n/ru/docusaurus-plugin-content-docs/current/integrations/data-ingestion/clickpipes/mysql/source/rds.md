---
sidebar_label: 'Amazon RDS MySQL'
description: 'Пошаговое руководство по настройке Amazon RDS MySQL в качестве источника для ClickPipes'
slug: /integrations/clickpipes/mysql/source/rds
title: 'Руководство по настройке источника RDS MySQL'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'загрузка данных', 'синхронизация в реальном времени']
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import rds_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/rds_config.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import enable_gtid from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/enable_gtid.png';
import Image from '@theme/IdealImage';


# Руководство по настройке источника данных RDS MySQL

В этом пошаговом руководстве показано, как настроить Amazon RDS MySQL для репликации данных в ClickHouse Cloud с помощью [MySQL ClickPipe](../index.md). Ответы на распространенные вопросы о MySQL CDC см. на странице [часто задаваемых вопросов по MySQL](/integrations/data-ingestion/clickpipes/mysql/faq.md).



## Включение хранения бинарного журнала {#enable-binlog-retention-rds}

Бинарный журнал представляет собой набор файлов журналов, содержащих информацию об изменениях данных в экземпляре сервера MySQL. Файлы бинарного журнала необходимы для репликации. Чтобы настроить хранение бинарного журнала в RDS MySQL, необходимо [включить ведение бинарного журнала](#enable-binlog-logging) и [увеличить интервал хранения бинарного журнала](#binlog-retention-interval).

### 1. Включение ведения бинарного журнала через автоматическое резервное копирование {#enable-binlog-logging}

Функция автоматического резервного копирования определяет, включено или выключено ведение бинарного журнала для MySQL. Автоматическое резервное копирование можно настроить для вашего экземпляра в консоли RDS, перейдя в **Modify** > **Additional configuration** > **Backup** и установив флажок **Enable automated backups** (если он ещё не установлен).

<Image
  img={rds_backups}
  alt='Включение автоматического резервного копирования в RDS'
  size='lg'
  border
/>

Рекомендуется установить параметр **Backup retention period** на достаточно длительное значение в зависимости от сценария использования репликации.

### 2. Увеличение интервала хранения бинарного журнала {#binlog-retention-interval}

:::warning
Если ClickPipes попытается возобновить репликацию, а необходимые файлы бинарного журнала были удалены из-за настроенного значения хранения бинарного журнала, ClickPipe перейдёт в состояние ошибки и потребуется повторная синхронизация.
:::

По умолчанию Amazon RDS удаляет бинарный журнал как можно скорее (т. е. _отложенная очистка_). Рекомендуется увеличить интервал хранения бинарного журнала как минимум до **72 часов**, чтобы обеспечить доступность файлов бинарного журнала для репликации в случае сбоев. Чтобы установить интервал хранения бинарного журнала ([`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours)), используйте процедуру [`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration):

[//]: # "NOTE Most CDC providers recommend the maximum retention period for RDS (7 days/168 hours). Since this has an impact on disk usage, we conservatively recommend a minimum of 3 days/72 hours."

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

Если эта конфигурация не установлена или установлена на низкий интервал, это может привести к пропускам в бинарных журналах, что нарушит способность ClickPipes возобновлять репликацию.


## Настройка параметров binlog {#binlog-settings}

Группу параметров можно найти, щелкнув по экземпляру MySQL в консоли RDS и перейдя на вкладку **Configuration**.

:::tip
Если у вас кластер MySQL, указанные ниже параметры находятся в группе параметров [кластера БД](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html), а не в группе параметров экземпляра БД.
:::

<Image
  img={rds_config}
  alt='Где найти группу параметров в RDS'
  size='lg'
  border
/>

<br />
Щелкните по ссылке группы параметров — откроется её страница. В правом верхнем углу должна быть кнопка **Edit**.

<Image img={edit_button} alt='Редактирование группы параметров' size='lg' border />

Необходимо задать следующие параметры:

1. `binlog_format` — значение `ROW`.

<Image img={binlog_format} alt='Формат binlog — ROW' size='lg' border />

2. `binlog_row_metadata` — значение `FULL`

<Image
  img={binlog_row_metadata}
  alt='Метаданные строк binlog — FULL'
  size='lg'
  border
/>

3. `binlog_row_image` — значение `FULL`

<Image img={binlog_row_image} alt='Образ строк binlog — FULL' size='lg' border />

<br />
Затем нажмите **Save Changes** в правом верхнем углу. Для применения изменений может потребоваться перезагрузка экземпляра — об этом свидетельствует надпись `Pending reboot` рядом со ссылкой на группу параметров на вкладке **Configuration** экземпляра RDS.


## Включение режима GTID {#gtid-mode}

:::tip
MySQL ClickPipe также поддерживает репликацию без режима GTID. Однако для повышения производительности и упрощения диагностики рекомендуется включить режим GTID.
:::

[Глобальные идентификаторы транзакций (GTID)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) — это уникальные идентификаторы, присваиваемые каждой зафиксированной транзакции в MySQL. Они упрощают репликацию binlog и делают диагностику более простой. Мы **рекомендуем** включить режим GTID, чтобы MySQL ClickPipe мог использовать репликацию на основе GTID.

Репликация на основе GTID поддерживается для Amazon RDS for MySQL версий 5.7, 8.0 и 8.4. Чтобы включить режим GTID для вашего экземпляра Aurora MySQL, выполните следующие шаги:

1. В консоли RDS выберите ваш экземпляр MySQL.
2. Перейдите на вкладку **Configuration**.
3. Нажмите на ссылку группы параметров.
4. Нажмите кнопку **Edit** в правом верхнем углу.
5. Установите для `enforce_gtid_consistency` значение `ON`.
6. Установите для `gtid-mode` значение `ON`.
7. Нажмите **Save Changes** в правом верхнем углу.
8. Перезагрузите экземпляр, чтобы изменения вступили в силу.

<Image img={enable_gtid} alt='GTID включен' size='lg' border />

<br />
:::tip The MySQL ClickPipe also supports replication without GTID mode. However,
enabling GTID mode is recommended for better performance and easier
troubleshooting. :::


## Настройка пользователя базы данных {#configure-database-user}

Подключитесь к экземпляру RDS MySQL от имени администратора и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

   ```sql
   CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
   ```

2. Предоставьте права доступа к схеме. В следующем примере показаны права доступа для базы данных `mysql`. Повторите эти команды для каждой базы данных и хоста, которые требуется реплицировать:

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

Чтобы ограничить трафик к экземпляру Aurora MySQL, добавьте [документированные статические NAT IP-адреса](../../index.md#list-of-static-ips) в **правила входящих подключений** группы безопасности RDS.

<Image
  img={security_group_in_rds_mysql}
  alt='Где найти группу безопасности в RDS MySQL?'
  size='lg'
  border
/>

<Image
  img={edit_inbound_rules}
  alt='Редактирование правил входящих подключений для группы безопасности'
  size='lg'
  border
/>

### Частный доступ через AWS PrivateLink {#private-access-via-aws-privatelink}

Для подключения к экземпляру RDS через частную сеть можно использовать AWS PrivateLink. Следуйте [руководству по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes), чтобы настроить подключение.


## Следующие шаги {#next-steps}

Теперь, когда ваш экземпляр Amazon RDS MySQL настроен для репликации binlog и безопасно подключается к ClickHouse Cloud, вы можете [создать свой первый MySQL ClickPipe](/integrations/clickpipes/mysql/#create-your-clickpipe). Ответы на часто задаваемые вопросы о MySQL CDC см. на [странице FAQ по MySQL](/integrations/data-ingestion/clickpipes/mysql/faq.md).

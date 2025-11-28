---
sidebar_label: 'Amazon RDS MySQL'
description: 'Пошаговое руководство по настройке Amazon RDS MySQL в качестве источника для ClickPipes'
slug: /integrations/clickpipes/mysql/source/rds
title: 'Руководство по настройке источника данных RDS MySQL'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'ингестия данных', 'синхронизация в режиме реального времени']
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


# Руководство по настройке источника RDS MySQL

Это пошаговое руководство описывает, как настроить Amazon RDS MySQL для репликации данных в ClickHouse Cloud с помощью [MySQL ClickPipe](../index.md). Ответы на распространённые вопросы по CDC для MySQL см. на [странице часто задаваемых вопросов по MySQL](/integrations/data-ingestion/clickpipes/mysql/faq.md).



## Включение хранения бинарного лога

Бинарный лог — это набор файлов журнала, содержащих информацию об изменениях данных, внесённых в экземпляр сервера MySQL; файлы бинарного лога необходимы для репликации. Чтобы настроить хранение бинарного лога в RDS MySQL, необходимо [включить бинарное логирование](#enable-binlog-logging) и [увеличить интервал хранения binlog](#binlog-retention-interval).

### 1. Включите бинарное логирование через автоматическое резервное копирование

Функция автоматического резервного копирования определяет, включено или отключено бинарное логирование для MySQL. Автоматическое резервное копирование можно настроить для вашего экземпляра в консоли RDS, перейдя в **Modify** &gt; **Additional configuration** &gt; **Backup** и установив флажок **Enable automated backups** (если он ещё не установлен).

<Image img={rds_backups} alt="Включение автоматических резервных копий в RDS" size="lg" border />

Рекомендуется задать для параметра **Backup retention period** достаточно большое значение в зависимости от сценария использования репликации.

### 2. Увеличьте интервал хранения binlog

:::warning
Если ClickPipes попытается возобновить репликацию и нужные файлы binlog будут удалены из-за настроенного значения хранения binlog, ClickPipe перейдёт в состояние ошибки, и потребуется повторная синхронизация.
:::

По умолчанию Amazon RDS очищает бинарный лог как можно скорее (т. е. использует *lazy purging*). Рекомендуется увеличить интервал хранения binlog как минимум до **72 часов**, чтобы обеспечить доступность файлов бинарного лога для репликации в аварийных сценариях. Чтобы задать интервал хранения бинарного лога ([`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours)), используйте процедуру [`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration):

[//]: # "ПРИМЕЧАНИЕ Большинство провайдеров CDC рекомендуют максимальный период хранения для RDS (7 дней/168 часов). Поскольку это влияет на использование диска, мы консервативно рекомендуем минимум 3 дня/72 часа."

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

Если эта конфигурация не задана или для неё установлен слишком малый интервал, это может привести к пропускам в бинарных логах, что нарушит возможность ClickPipes возобновлять репликацию.


## Настройка параметров binlog {#binlog-settings}

Группу параметров можно найти, выбрав экземпляр MySQL в консоли RDS, а затем перейдя на вкладку **Configuration**.

:::tip
Если у вас кластер MySQL, параметры ниже можно найти в группе параметров [DB cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html), а не в группе параметров экземпляра БД.
:::

<Image img={rds_config} alt="Где найти группу параметров в RDS" size="lg" border/>

<br/>
Нажмите на ссылку группы параметров — откроется её отдельная страница. В правом верхнем углу вы увидите кнопку **Edit**.

<Image img={edit_button} alt="Редактирование группы параметров" size="lg" border/>

Следующие параметры необходимо настроить следующим образом:

1. `binlog_format` — `ROW`.

<Image img={binlog_format} alt="Binlog format со значением ROW" size="lg" border/>

2. `binlog_row_metadata` — `FULL`

<Image img={binlog_row_metadata} alt="Binlog row metadata со значением FULL" size="lg" border/>

3. `binlog_row_image` — `FULL`

<Image img={binlog_row_image} alt="Binlog row image со значением FULL" size="lg" border/>

<br/>
Затем нажмите **Save Changes** в правом верхнем углу. Возможно, потребуется перезагрузить экземпляр, чтобы изменения вступили в силу — о необходимости этого будет свидетельствовать статус `Pending reboot` рядом со ссылкой на группу параметров на вкладке **Configuration** экземпляра RDS.



## Включение режима GTID {#gtid-mode}

:::tip
MySQL ClickPipe также поддерживает репликацию без режима GTID. Однако включение режима GTID рекомендуется для повышения производительности и упрощения устранения неполадок.
:::

[Глобальные идентификаторы транзакций (GTID)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) — это уникальные идентификаторы, назначаемые каждой зафиксированной транзакции в MySQL. Они упрощают репликацию на основе binlog и делают процесс устранения неполадок более простым. Мы **рекомендуем** включить режим GTID, чтобы MySQL ClickPipe мог использовать репликацию на основе GTID.

Репликация на основе GTID поддерживается для Amazon RDS for MySQL версий 5.7, 8.0 и 8.4. Чтобы включить режим GTID для экземпляра Aurora MySQL, выполните следующие действия:

1. В консоли RDS выберите экземпляр MySQL.
2. Перейдите на вкладку **Configuration**.
3. Нажмите на ссылку группы параметров (parameter group).
4. Нажмите кнопку **Edit** в правом верхнем углу.
5. Установите для `enforce_gtid_consistency` значение `ON`.
6. Установите для `gtid-mode` значение `ON`.
7. Нажмите **Save Changes** в правом верхнем углу.
8. Перезагрузите экземпляр, чтобы изменения вступили в силу.

<Image img={enable_gtid} alt="GTID включён" size="lg" border/>

<br/>
:::tip
MySQL ClickPipe также поддерживает репликацию без режима GTID. Однако включение режима GTID рекомендуется для повышения производительности и упрощения устранения неполадок.
:::



## Настройка пользователя базы данных {#configure-database-user}

Подключитесь к экземпляру RDS MySQL под учетной записью с правами администратора и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. Предоставьте права на схему. В следующем примере показаны права для базы данных `mysql`. Повторите эти команды для каждой базы данных и каждого хоста, которые нужно реплицировать:

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. Предоставьте пользователю права на репликацию:

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```



## Настройка сетевого доступа {#configure-network-access}

### Управление доступом на основе IP-адресов {#ip-based-access-control}

Чтобы ограничить трафик к экземпляру Aurora MySQL, добавьте [задокументированные статические IP-адреса NAT](../../index.md#list-of-static-ips) в **Inbound rules** группы безопасности RDS.

<Image img={security_group_in_rds_mysql} alt="Где найти группу безопасности в RDS MySQL?" size="lg" border/>

<Image img={edit_inbound_rules} alt="Изменение правил входящего трафика (Inbound rules) для этой группы безопасности" size="lg" border/>

### Частный доступ через AWS PrivateLink {#private-access-via-aws-privatelink}

Чтобы подключиться к экземпляру RDS через частную сеть, используйте AWS PrivateLink. Следуйте [руководству по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes), чтобы настроить подключение.



## Дальнейшие шаги {#next-steps}

Теперь, когда ваш экземпляр Amazon RDS MySQL настроен для репликации через binlog и безопасно подключается к ClickHouse Cloud, вы можете [создать свой первый MySQL ClickPipe](/integrations/clickpipes/mysql/#create-your-clickpipe). Ответы на распространённые вопросы по MySQL CDC см. на [странице MySQL FAQs](/integrations/data-ingestion/clickpipes/mysql/faq.md).
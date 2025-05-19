---
sidebar_label: 'Amazon RDS MariaDB'
description: 'Пошаговое руководство по настройке Amazon RDS MariaDB как источника для ClickPipes'
slug: /integrations/clickpipes/mysql/source/rds_maria
title: 'Руководство по настройке источника RDS MariaDB'
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

Это пошаговое руководство о том, как настроить вашу экземпляр RDS MariaDB для репликации данных через ClickPipe MySQL.
<br/>
:::info
Также рекомендуем ознакомиться с часто задаваемыми вопросами по MySQL [здесь](/integrations/data-ingestion/clickpipes/mysql/faq.md). Страница с вопросами активно обновляется.
:::

## Включение хранения бинарных логов {#enable-binlog-retention-rds}
Бинарный лог — это набор файлов журналов, содержащих информацию о модификациях данных, внесенных в экземпляр MySQL. Файлы бинарных логов необходимы для репликации. Необходимо выполнить оба следующих шага:

### 1. Включите бинарное логирование через автоматическое резервное копирование {#enable-binlog-logging-rds}

Функция автоматического резервного копирования определяет, включено ли бинарное логирование для MySQL. Это можно установить в консоли AWS:

<Image img={rds_backups} alt="Включение автоматического резервного копирования в RDS" size="lg" border/>

Рекомендуется установить длительность хранения резервных копий на разумно длинный срок в зависимости от сценария использования репликации.

### 2. Часы хранения бинарных логов {#binlog-retention-hours-rds}
Amazon RDS для MariaDB имеет другой метод установки продолжительности хранения бинарных логов, что означает, как долго файл бинарного лога, содержащий изменения, будет храниться. Если некоторые изменения не будут прочитаны до удаления файла бинарного лога, репликация не сможет продолжаться. Значение по умолчанию для количества часов хранения бинарных логов — NULL, что означает, что бинарные логи не хранятся.

Чтобы указать количество часов, в течение которых следует хранить бинарные логи на экземпляре БД, используйте функцию mysql.rds_set_configuration с длительностью хранения бинарного лога, достаточной для выполнения репликации. Рекомендуемый минимум — `24 часа`.

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```

## Настройка параметров бинарного лога в группе параметров {#binlog-parameter-group-rds}

Группу параметров можно найти, если вы щелкнете на вашем экземпляре MariaDB в консоли RDS и затем перейдете на вкладку `Configurations`.

<Image img={rds_config} alt="Где найти группу параметров в RDS" size="lg" border/>

При щелчке по ссылке группы параметров вы попадете на страницу ссылки группы параметров. Вы увидите кнопку Изменить в правом верхнем углу:

<Image img={edit_button} alt="Изменить группу параметров" size="lg" border/>

Параметры `binlog_format`, `binlog_row_metadata` и `binlog_row_image` необходимо установить следующим образом:

1. `binlog_format` на `ROW`.

<Image img={binlog_format} alt="Формат бинарного лога ROW" size="lg" border/>

2. `binlog_row_metadata` на `FULL`

<Image img={binlog_row_metadata} alt="Метаданные строки бинарного лога FULL" size="lg" border/>

3. `binlog_row_image` на `FULL`

<Image img={binlog_row_image} alt="Изображение строки бинарного лога FULL" size="lg" border/>

Далее нажмите на кнопку `Сохранить изменения` в правом верхнем углу. Возможно, потребуется перезагрузить ваш экземпляр, чтобы изменения вступили в силу. Если вы видите `Ожидает перезагрузку` рядом со ссылкой на группу параметров на вкладке Configurations вашего экземпляра RDS, это хороший признак того, что перезагрузка вашего экземпляра необходима.

<br/>
:::tip
Если у вас есть кластер MariaDB, вышеуказанные параметры будут находиться в [параметрах кластера БД](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html), а не в группе экземпляра БД.
:::

## Включение режима GTID {#gtid-mode-rds}
Глобальные идентификаторы транзакций (GTID) — это уникальные идентификаторы, присвоенные каждой завершенной транзакции в MySQL/MariaDB. Они упрощают репликацию бинарных логов и делают устранение неполадок более простым. Режим GTID включен по умолчанию в MariaDB, поэтому никаких действий от пользователя не требуется.

## Настройка пользователя базы данных {#configure-database-user-rds}

Подключитесь к вашему экземпляру RDS MariaDB как администратор и выполните следующие команды:

1. Создайте выделенного пользователя для ClickPipes:

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. Предоставьте разрешения на схему. В следующем примере показаны разрешения для базы данных `mysql`. Повторите эти команды для каждой базы данных и хоста, которые вы хотите реплицировать:

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. Предоставьте пользователю разрешения на репликацию:

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## Настройка сетевого доступа {#configure-network-access}

### Контроль доступа на основе IP {#ip-based-access-control}

Если вы хотите ограничить трафик к вашему экземпляру RDS, пожалуйста, добавьте [документированные статические IP NAT](../../index.md#list-of-static-ips) в `Inbound rules` вашей группы безопасности RDS.

<Image img={security_group_in_rds_mysql} alt="Где найти группу безопасности в RDS?" size="lg" border/>

<Image img={edit_inbound_rules} alt="Редактировать входящие правила для вышеуказанной группы безопасности" size="lg" border/>

### Приватный доступ через AWS PrivateLink {#private-access-via-aws-privatelink}

Чтобы подключиться к вашему экземпляру RDS через частную сеть, вы можете использовать AWS PrivateLink. Следуйте нашему [руководству по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes) для настройки соединения.

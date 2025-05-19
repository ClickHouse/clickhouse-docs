---
sidebar_label: 'Amazon RDS MySQL'
description: 'Пошаговое руководство по настройке Amazon RDS MySQL в качестве источника для ClickPipes'
slug: /integrations/clickpipes/mysql/source/rds
title: 'Руководство по настройке источника RDS MySQL'
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

Это пошаговое руководство по конфигурации вашего экземпляра RDS MySQL для репликации его данных через MySQL ClickPipe.
<br/>
:::info
Мы также рекомендуем ознакомиться с часто задаваемыми вопросами по MySQL [здесь](/integrations/data-ingestion/clickpipes/mysql/faq.md). Страница с часто задаваемыми вопросами активно обновляется.
:::

## Включите удержание двоичных логов {#enable-binlog-retention-rds}
Двоичный лог — это набор файлов логов, содержащих информацию о модификациях данных, сделанных на экземпляре сервера MySQL, а файлы двоичных логов необходимы для репликации. Необходимо выполнить оба следующих шага:

### 1. Включите двоичное логирование через автоматическое резервное копирование {#enable-binlog-logging-rds}
Функция автоматического резервного копирования определяет, включено ли двоичное логирование для MySQL. Это можно настроить в консоли AWS:

<Image img={rds_backups} alt="Включение автоматического резервного копирования в RDS" size="lg" border/>

Рекомендуется устанавливать значение удержания резервных копий достаточно большим в зависимости от случая использования репликации.

### 2. Часы удержания двоичных логов {#binlog-retention-hours-rds}
Amazon RDS для MySQL имеет другой метод установки продолжительности удержания двоичных логов, который обозначает время, в течение которого файл двоичного лога с изменениями хранится. Если некоторые изменения не будут прочитаны перед удалением файла двоичного лога, репликация не сможет продолжаться. Значение по умолчанию для часов удержания двоичных логов равно NULL, что означает, что двоичные логи не сохраняются.

Чтобы указать количество часов для удержания двоичных логов на экземпляре БД, используйте функцию mysql.rds_set_configuration с периодом удержания двоичных логов, достаточным для выполнения репликации. Рекомендуется минимальное значение `24 часа`.

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```

## Настройка параметров двоичных логов в параметрической группе {#binlog-parameter-group-rds}

Параметрическая группа может быть найдена, когда вы нажмете на ваш экземпляр MySQL в консоли RDS, а затем перейдете на вкладку `Конфигурации`.

<Image img={rds_config} alt="Где найти параметрическую группу в RDS" size="lg" border/>

После нажатия на ссылку параметрической группы вы перейдете на ее страницу. В правом верхнем углу будет кнопка Изменить.

<Image img={edit_button} alt="Изменить параметрическую группу" size="lg" border/>

Следующие параметры необходимо установить следующим образом:

1. `binlog_format` на `ROW`.

<Image img={binlog_format} alt="Формат двоичных логов на ROW" size="lg" border/>

2. `binlog_row_metadata` на `FULL`

<Image img={binlog_row_metadata} alt="Метаданные строк двоичных логов на FULL" size="lg" border/>

3. `binlog_row_image` на `FULL`

<Image img={binlog_row_image} alt="Изображение строки двоичных логов на FULL" size="lg" border/>

Затем нажмите на `Сохранить изменения` в правом верхнем углу. Вам может потребоваться перезагрузить ваш экземпляр, чтобы изменения вступили в силу — об этом можно узнать, если рядом со ссылкой на параметрическую группу в вкладке Конфигурации экземпляра RDS вы увидите `Ожидает перезагрузки`.

<br/>
:::tip
Если у вас есть кластер MySQL, вышеупомянутые параметры будут находиться в параметрической группе [DB Cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) , а не в группе экземпляра БД.
:::

## Включение режима GTID {#gtid-mode-rds}
Глобальные идентификаторы транзакций (GTID) — это уникальные идентификаторы, присвоенные каждой зафиксированной транзакции в MySQL. Они упрощают репликацию двоичных логов и делают устранение неполадок более простым.

Если ваш экземпляр MySQL — это MySQL 5.7, 8.0 или 8.4, мы рекомендуем включить режим GTID, чтобы MySQL ClickPipe мог использовать репликацию GTID.

Чтобы включить режим GTID для вашего экземпляра MySQL, выполните следующие шаги:
1. В консоли RDS нажмите на ваш экземпляр MySQL.
2. Нажмите на вкладку `Конфигурации`.
3. Нажмите на ссылку параметрической группы.
4. Нажмите на кнопку `Изменить` в правом верхнем углу.
5. Установите `enforce_gtid_consistency` на `ON`.
6. Установите `gtid-mode` на `ON`.
7. Нажмите на `Сохранить изменения` в правом верхнем углу.
8. Перезагрузите ваш экземпляр, чтобы изменения вступили в силу.

<Image img={enable_gtid} alt="GTID включен" size="lg" border/>

<br/>
:::tip
MySQL ClickPipe также поддерживает репликацию без режима GTID. Однако рекомендуется включать режим GTID для обеспечения лучшей производительности и упрощения устранения неполадок.
:::


## Настройка пользователя базы данных {#configure-database-user-rds}

Подключитесь к вашему экземпляру RDS MySQL как администратор и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. Предоставьте права на схему. Пример ниже показывает права для базы данных `mysql`. Повторите эти команды для каждой базы данных и хоста, которые вы хотите реплицировать:

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

Если вы хотите ограничить трафик к вашему экземпляру RDS, добавьте [документированные статические IP NAT](../../index.md#list-of-static-ips) в `Правила входящего трафика` вашей группы безопасности RDS.

<Image img={security_group_in_rds_mysql} alt="Где найти группу безопасности в RDS MySQL?" size="lg" border/>

<Image img={edit_inbound_rules} alt="Изменить правила входящего трафика для вышеуказанной группы безопасности" size="lg" border/>

### Приватный доступ через AWS PrivateLink {#private-access-via-aws-privatelink}

Чтобы подключиться к вашему экземпляру RDS через частную сеть, вы можете использовать AWS PrivateLink. Ознакомьтесь с нашим [руководством по настройке AWS PrivateLink для ClickPipes](/knowledgebase/aws-privatelink-setup-for-clickpipes) для установки соединения.

---
sidebar_label: 'Azure Flexible Server for MySQL'
description: 'Настройка Azure Flexible Server for MySQL в качестве источника для ClickPipes'
slug: /integrations/clickpipes/mysql/source/azure-flexible-server-mysql
title: 'Руководство по настройке Azure Flexible Server for MySQL в качестве источника'
keywords: ['azure', 'flexible server', 'mysql', 'clickpipes', 'binlog']
doc_type: 'guide'
---

import configure_network_security from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/azure-flexible-server-mysql/1_configure_network_security.png';
import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Руководство по настройке источника Azure Flexible Server for MySQL \{#azure-flexible-server-for-mysql-source-setup-guide\}

В этом пошаговом руководстве показано, как настроить Azure Flexible Server for MySQL для репликации данных в ClickHouse Cloud с использованием [MySQL ClickPipe](../index.md). Для этого сервиса поддерживается только **однократная ингестия**. Ответы на распространённые вопросы по MySQL CDC смотрите на странице [MySQL FAQs](/integrations/data-ingestion/clickpipes/mysql/faq.md).

:::warning
Непрерывная ингестия через **CDC не поддерживается** для этого сервиса. Azure Flexible Server for MySQL не позволяет настроить системную переменную [`binlog_row_metadata`](https://dev.mysql.com/doc/refman/en/replication-options-binary-log.html#sysvar_binlog_row_metadata) в значение `FULL`, что требуется для полнофункциональной CDC для MySQL в ClickPipes.

Отправьте запрос на добавление этой возможности на [форуме обратной связи Azure](https://feedback.azure.com/d365community/forum/47b1e71d-ee24-ec11-b6e6-000d3a4f0da0), проголосуйте за [этот вопрос](https://learn.microsoft.com/en-us/answers/questions/766047/setting-binlog-row-metadata-to-full-in-azure-db-fo) или [свяжитесь со службой поддержки Azure](https://azure.microsoft.com/en-us/support/create-ticket/), чтобы запросить эту возможность.
:::

## Настройте пользователя базы данных \{#configure-database-user\}

Подключитесь к экземпляру Azure Flexible Server for MySQL от имени пользователя-администратора и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
    ```

2. Назначьте привилегии для схемы. В следующем примере показаны привилегии для базы данных `mysql`. Повторите эти команды для каждой базы данных и хоста, которые вы хотите реплицировать:

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'%';
    ```

3. Примените изменения привилегий:

   ```sql
   FLUSH PRIVILEGES;
   ```

## Настройте сетевой доступ \{#configure-network-access\}

:::note
ClickPipes не поддерживает подключения через Azure Private Link. Если вы не разрешаете публичный доступ к экземпляру Azure Flexible Server for MySQL, вы можете [использовать SSH‑туннель](#configure-network-security) для безопасного подключения. Поддержка Azure Private Link будет добавлена в будущем.
:::

Далее необходимо разрешить подключения к вашему экземпляру Azure Flexible Server for MySQL из ClickPipes.

<Tabs groupId="network-configuration">
<TabItem value="public-ip" label="Разрешить IP‑адреса ClickPipes">

1. В Azure Portal перейдите в **All resources**. Выберите свой экземпляр Azure Flexible Server for MySQL, чтобы открыть страницу **Overview**.

2. В разделе **Settings** выберите **Networking**. Убедитесь, что **Public access** включён.

3. В разделе **Firewall rules** введите [список статических IP‑адресов ClickPipes](../../index.md#list-of-static-ips) для региона, в котором развернут ваш сервис.

   <Image img={configure_network_security} alt="Настройка сети для публичного доступа с использованием списка разрешённых IP‑адресов" size="lg" border/>

4. Нажмите **Save**, чтобы сохранить изменения конфигурации сетевой безопасности.

</TabItem>
<TabItem value="ssh-tunnel" label="Использовать SSH‑туннель">

Если вы не разрешаете публичный доступ к экземпляру Azure Flexible Server for MySQL, сначала необходимо развернуть SSH‑бастион‑хост для безопасного туннелирования соединения. Чтобы настроить SSH‑бастион‑хост в Azure:

1. Создайте и запустите виртуальную машину Azure (VM), следуя [официальной документации](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-portal?tabs=ubuntu).
   - Убедитесь, что VM находится в той же виртуальной сети (VNet), что и ваш экземпляр Azure Flexible Server for MySQL, или в пиринговой VNet с настроенной связностью.
   - Убедитесь, что у VM есть [статический публичный IP‑адрес](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/virtual-network-public-ip-address). Этот IP‑адрес потребуется при подключении ClickPipes к вашему SSH‑бастион‑хосту.

2. Обновите правила группы безопасности сети (Network Security Group, NSG) для SSH‑бастион‑хоста, чтобы разрешить трафик из [списка статических IP‑адресов ClickPipes](../../index.md#list-of-static-ips) для региона, в котором развернут ваш сервис.

3. Обновите правила брандмауэра для экземпляра Azure Flexible Server for MySQL, чтобы разрешить трафик от [частного IP‑адреса](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/private-ip-addresses) SSH‑бастион‑хоста.

</TabItem>
</Tabs>

## Что дальше? \{#whats-next\}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из экземпляра Azure Flexible Server for MySQL в ClickHouse Cloud. Обязательно сохраните параметры подключения, которые вы использовали при настройке экземпляра, так как они понадобятся вам в процессе создания ClickPipe.
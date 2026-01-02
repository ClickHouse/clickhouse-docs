---
sidebar_label: 'AlloyDB Postgres'
description: 'Настройка экземпляра AlloyDB Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/alloydb
title: 'Руководство по настройке источника AlloyDB Postgres'
doc_type: 'guide'
---

import edit_instance from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/1_edit_instance.png';
import set_flags from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/2_set_flags.png';
import verify_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/3_verify_logical_replication.png';
import configure_network_security from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/4_configure_network_security.png';
import configure_network_security2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/5_configure_network_security.png';
import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Руководство по настройке источника данных AlloyDB Postgres {#alloydb-postgres-source-setup-guide}

## Поддерживаемые версии {#supported-versions}

Чтобы передавать данные из экземпляра AlloyDB в ClickHouse Cloud с помощью ClickPipes, экземпляр должен быть настроен для **логической репликации**. Это поддерживается **начиная с AlloyDB версии 14**.

## Включение логической репликации {#enable-logical-replication}

Чтобы проверить, включена ли логическая репликация в вашем экземпляре AlloyDB, выполните следующий запрос на основном экземпляре:

```sql
SHOW  wal_level;
```

Если результат — `logical`, логическая репликация уже включена, и вы можете перейти к [следующему шагу](#create-a-clickpipes-user-and-manage-replication-permissions). Если результат — `replica`, необходимо установить флаги [`alloydb.enable_pglogical`](https://cloud.google.com/alloydb/docs/reference/alloydb-flags#alloydb.enable_pglogical) и [`alloydb.logical_decoding`](https://cloud.google.com/alloydb/docs/reference/alloydb-flags#alloydb.logical_decoding) в значение `on` на основном экземпляре.

:::warning
Как указано в [документации по флагам AlloyDB](https://cloud.google.com/alloydb/docs/reference/alloydb-flags), изменение флагов, включающих логическую репликацию, требует перезапуска основного экземпляра.
:::

Чтобы включить эти флаги:

1. В Google Cloud Console перейдите на страницу AlloyDB [Clusters](https://console.cloud.google.com/alloydb/clusters). В меню **Actions** для вашего основного экземпляра нажмите **Edit**.

   <Image img={edit_instance} alt="Редактирование конфигурации основного экземпляра" size="lg" border />

2. Пролистайте вниз до **Advanced configuration options** и раскройте этот раздел. В разделе **Flags** нажмите **Add a database flag**.

   * Добавьте флаг [`allowdb.enable_pglogical`](https://cloud.google.com/alloydb/docs/reference/alloydb-flags#alloydb.enable_pglogical) и установите его значение в `on`
   * Добавьте флаг [`alloydb.logical_decoding`](https://cloud.google.com/alloydb/docs/reference/alloydb-flags#alloydb.logical_decoding) и установите его значение в `on`

   <Image img={set_flags} alt="Установка флагов allowdb.enable_pglogical и alloydb.logical_decoding в значение on" size="lg" border />

3. Нажмите **Update instance**, чтобы сохранить изменения конфигурации. Важно отметить, что это действие **приведёт к перезапуску основного экземпляра.**

4. После того как статус экземпляра изменится с `Updating` на `Ready`, выполните следующий запрос к вашему основному экземпляру, чтобы убедиться, что логическая репликация включена:

   ```sql
   SHOW  wal_level;
   ```

   Результатом должно быть значение `logical`.

   <Image img={verify_logical_replication} alt="Проверка того, что логическая репликация включена" size="lg" border />


## Создайте пользователя ClickPipes и настройте права для репликации {#create-a-clickpipes-user-and-manage-replication-permissions}

Подключитесь к экземпляру AlloyDB под учётной записью администратора и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Предоставьте пользователю, созданному на предыдущем шаге, права только на чтение на уровне схем. В следующем примере показаны права для схемы `public`. Повторите эту последовательность команд для каждой схемы, содержащей таблицы, которые вы хотите реплицировать:
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. Предоставьте этому пользователю права для управления репликацией:

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. Создайте [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) с таблицами, которые вы хотите реплицировать. Настоятельно рекомендуется включать в publication только необходимые таблицы, чтобы избежать лишней нагрузки на производительность.

   :::warning
   Все таблицы, включённые в publication, должны либо иметь определённый **primary key**, _либо_ иметь настроенную **replica identity** со значением `FULL`. См. раздел [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) для рекомендаций по выбору области действия публикаций.
   :::

   - Чтобы создать publication для конкретных таблиц:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - Чтобы создать publication для всех таблиц в определённой схеме:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   Publication `clickpipes` будет содержать набор событий изменений, сформированных указанными таблицами, и позднее будет использоваться для приёма репликационного потока.

## Настройка сетевого доступа {#configure-network-access}

:::note
ClickPipes не поддерживает подключения через Private Service Connect (PSC). Если у вас не разрешён публичный доступ к экземпляру AlloyDB, вы можете [использовать SSH-туннель](#configure-network-access) для безопасного подключения. Поддержка PSC будет добавлена в будущем.
:::

Далее необходимо разрешить подключения к вашему экземпляру AlloyDB из ClickPipes.

<Tabs groupId="network-configuration">
<TabItem value="public-ip" label="Разрешить IP-адреса ClickPipes">

1. В консоли Google Cloud перейдите на страницу AlloyDB [Clusters](https://console.cloud.google.com/alloydb/clusters). Выберите основной экземпляр (primary instance), чтобы открыть страницу **Overview**.

2. Прокрутите вниз до раздела **Instances in your cluster** и нажмите **Edit primary**.

3. Установите флажок **Enable Public IP**, чтобы разрешить подключения к экземпляру через общедоступный интернет. В разделе **Authorized external networks** введите [список статических IP-адресов ClickPipes](../../index.md#list-of-static-ips) для региона, в котором развернут ваш сервис.

   <Image img={configure_network_security} alt="Настройка сети для публичного доступа с использованием списка разрешённых IP-адресов" size="lg" border/>

   :::note
   AlloyDB ожидает, что адреса будут указаны в [CIDR-нотации](https://cloud.google.com/alloydb/docs/connection-overview#public-ip). Вы можете адаптировать предоставленный список статических IP-адресов ClickPipes к этой нотации, добавив `/32` к каждому адресу.
   :::

4. В разделе **Network Security** выберите **Require SSL Encryption (default)** (если ещё не выбрано).

5. Нажмите **Update instance**, чтобы сохранить изменения конфигурации сетевой безопасности.

</TabItem>
<TabItem value="ssh-tunnel" label="Использовать SSH-туннель">

Если вы не разрешаете публичный доступ к вашему экземпляру AlloyDB, сначала необходимо настроить SSH-бастион (bastion host) для безопасного туннелирования подключения. Чтобы настроить SSH-бастион в Google Cloud Platform:

1. Создайте и запустите экземпляр Google Compute Engine (GCE), следуя [официальной документации](https://cloud.google.com/compute/docs/instances/create-start-instance).
   - Убедитесь, что экземпляр GCE находится в той же виртуальной частной сети (VPC), что и ваш экземпляр AlloyDB.
   - Убедитесь, что экземпляр GCE имеет [статический публичный IP-адрес](https://cloud.google.com/compute/docs/ip-addresses/reserve-static-external-ip-address). Вы будете использовать этот IP-адрес при подключении ClickPipes к вашему SSH-бастиону.

2. Обновите правила брандмауэра SSH-бастиона, чтобы разрешить трафик из [списка статических IP-адресов ClickPipes](../../index.md#list-of-static-ips) для региона, в котором развернут ваш сервис.

3. Обновите правила брандмауэра AlloyDB, чтобы разрешить трафик от SSH-бастиона.

</TabItem>
</Tabs>

## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из вашего экземпляра Postgres в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке Postgres, так как они понадобятся вам при создании ClickPipe.
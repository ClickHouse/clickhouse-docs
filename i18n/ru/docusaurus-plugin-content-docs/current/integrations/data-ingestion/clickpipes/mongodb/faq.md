---
sidebar_label: 'Частые вопросы'
description: 'Часто задаваемые вопросы о ClickPipes для MongoDB.'
slug: /integrations/clickpipes/mongodb/faq
sidebar_position: 2
title: 'Часто задаваемые вопросы по ClickPipes для MongoDB'
doc_type: 'reference'
keywords: ['clickpipes', 'mongodb', 'CDC', 'ингестия данных', 'синхронизация в режиме реального времени']
---



# ClickPipes для MongoDB: часто задаваемые вопросы {#clickpipes-for-mongodb-faq}

### Могу ли я выполнять запросы к отдельным полям JSON? {#can-i-query-for-individual-fields-in-the-json-datatype}

Для прямого обращения к полям, таким как `{"user_id": 123}`, вы можете использовать **точечную нотацию**:

```sql
SELECT doc.user_id as user_id FROM your_table;
```

Для прямого доступа к вложенным полям объекта, например `{"address": { "city": "San Francisco", "state": "CA" }}`, используйте оператор `^`:

```sql
SELECT doc.^address.city AS city FROM your_table;
```

Для агрегаций приведите поле к соответствующему типу данных с помощью функции `CAST` или синтаксиса `::`:

```sql
SELECT sum(doc.shipping.cost::Float32) AS total_shipping_cost FROM t1;
```

Чтобы узнать больше о работе с JSON, см. наше руководство [Работа с JSON](./quickstart).

### Как мне развернуть (flatten) вложенные документы MongoDB в ClickHouse? {#how-do-i-flatten-the-nested-mongodb-documents-in-clickhouse}

Документы MongoDB по умолчанию реплицируются в ClickHouse как тип JSON с сохранением вложенной структуры. У вас есть несколько вариантов для их развёртывания. Если вы хотите развернуть данные в колонки, вы можете использовать обычные представления, материализованные представления или доступ во время выполнения запроса.

1. **Обычные представления**: Используйте обычные представления для инкапсуляции логики развёртывания.
2. **Материализованные представления**: Для небольших наборов данных вы можете использовать обновляемые материализованные представления с [модификатором `FINAL`](/sql-reference/statements/select/from#final-modifier) для периодического развёртывания и дедупликации данных. Для больших наборов данных мы рекомендуем использовать инкрементальные материализованные представления без `FINAL` для развёртывания данных в реальном времени, а затем выполнять дедупликацию данных во время выполнения запроса.
3. **Доступ во время выполнения запроса**: Вместо развёртывания используйте точечную (dot) нотацию для прямого доступа к вложенным полям в запросах.

Подробные примеры приведены в нашем руководстве [Работа с JSON](./quickstart).

### Могу ли я подключить базы данных MongoDB без публичного IP или в приватных сетях? {#can-i-connect-mongodb-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

Мы поддерживаем AWS PrivateLink для подключения к базам данных MongoDB, у которых нет публичного IP или которые находятся в приватных сетях. Azure Private Link и GCP Private Service Connect в данный момент не поддерживаются.

### Что происходит, если я удаляю базу данных или таблицу из моей базы данных MongoDB? {#what-happens-if-i-delete-a-database-table-from-my-mongodb-database}

Когда вы удаляете базу данных или таблицу из MongoDB, ClickPipes продолжит работу, но удалённая база данных или таблица перестанет реплицировать изменения. Соответствующие таблицы в ClickHouse сохраняются.

### Как коннектор MongoDB CDC обрабатывает транзакции? {#how-does-mongodb-cdc-connector-handle-transactions}

Каждое изменение документа внутри транзакции обрабатывается в ClickHouse как отдельное изменение. Изменения применяются в том порядке, в котором они появляются в oplog, и только зафиксированные изменения реплицируются в ClickHouse. Если транзакция MongoDB откатывается, эти изменения не появятся в потоке изменений (change stream).

Для дополнительных примеров см. наше руководство [Работа с JSON](./quickstart).

### Как обрабатывать ошибку `resume of change stream was not possible, as the resume point may no longer be in the oplog.`? {#resume-point-may-no-longer-be-in-the-oplog-error}

Эта ошибка обычно возникает, когда oplog был усечён, и ClickPipe не может возобновить поток изменений в ожидаемой точке. Чтобы устранить эту проблему, [повторно синхронизируйте ClickPipe](./resync.md). Чтобы избежать повторения этой проблемы, мы рекомендуем увеличить период хранения oplog. См. инструкции для [MongoDB Atlas](./source/atlas#enable-oplog-retention), [самостоятельно управляемой MongoDB](./source/generic#enable-oplog-retention) или [Amazon DocumentDB](./source/documentdb#configure-change-stream-log-retention).

### Как управляется репликация? {#how-is-replication-managed}

Мы используем родной API MongoDB Change Streams для отслеживания изменений в базе данных. Change Streams API предоставляет возобновляемый поток изменений базы данных, используя oplog MongoDB (журнал операций). ClickPipe использует токены возобновления MongoDB для отслеживания позиции в oplog и обеспечивает репликацию каждого изменения в ClickHouse.

### Какой read preference мне следует использовать? {#which-read-preference-should-i-use}

Выбор режима read preference зависит от вашего конкретного варианта использования. Если вы хотите минимизировать нагрузку на основной (primary) узел, мы рекомендуем использовать режим `secondaryPreferred`. Если вы хотите оптимизировать задержку ингестии, мы рекомендуем использовать режим `primaryPreferred`. Подробности см. в [документации MongoDB](https://www.mongodb.com/docs/manual/core/read-preference/#read-preference-modes-1).


### Поддерживает ли MongoDB ClickPipe шардированный кластер? {#does-the-mongodb-clickpipe-support-sharded-cluster}

Да, MongoDB ClickPipe поддерживает как Replica Set, так и шардированный кластер.

### Поддерживает ли MongoDB ClickPipe Amazon DocumentDB? {#documentdb-support}

Да, MongoDB ClickPipe поддерживает Amazon DocumentDB 5.0. Подробности см. в разделе [руководство по настройке источника Amazon DocumentDB](./source/documentdb.md).

### Поддерживает ли MongoDB ClickPipe PrivateLink? {#privatelink-support}

Мы поддерживаем PrivateLink для кластеров MongoDB (и DocumentDB) только в AWS. 

Обратите внимание, что в отличие от одноузловой реляционной базы данных, клиент MongoDB требует успешного обнаружения Replica Set, чтобы соблюдать настроенный `ReadPreference`. Для этого необходимо настроить PrivateLink для всех узлов кластера, чтобы клиент MongoDB смог успешно установить подключение к Replica Set, а также переключиться на другой узел, когда текущий узел становится недоступным.

Если вы предпочитаете подключаться к одному узлу в кластере, вы можете пропустить обнаружение Replica Set, указав `/?directConnection=true` в строке подключения при настройке ClickPipes. В этом случае настройка PrivateLink будет аналогична одноузловой реляционной базе данных и является самым простым вариантом поддержки PrivateLink.

Для подключения к Replica Set вы можете настроить PrivateLink для MongoDB либо с использованием VPC Resource, либо с использованием VPC Endpoint Service. Если вы выбираете VPC Resource, вам нужно создать конфигурацию ресурса `GROUP`, а также конфигурацию ресурса `CHILD` для каждого узла в кластере. Если вы выбираете VPC Endpoint Service, вам нужно создать отдельный Endpoint Service (и отдельный NLB) для каждого узла в кластере. 

За дополнительными сведениями обратитесь к документации [AWS PrivateLink для ClickPipes](../aws-privatelink.md). За помощью свяжитесь со службой поддержки ClickHouse.

---
sidebar_label: 'FAQ'
description: 'Часто задаваемые вопросы о ClickPipes для MongoDB.'
slug: /integrations/clickpipes/mongodb/faq
sidebar_position: 2
title: 'FAQ по ClickPipes для MongoDB'
doc_type: 'справочник'
keywords: ['clickpipes', 'mongodb', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

### Можно ли обращаться в запросах к отдельным полям типа JSON? \{#can-i-query-for-individual-fields-in-the-json-datatype\}

Для прямого доступа к полям, например в `{"user_id": 123}`, Вы можете использовать **точечную нотацию**:

```sql
SELECT doc.user_id as user_id FROM your_table;
```

Для прямого обращения к вложенным полям объекта, например `{"address": { "city": "San Francisco", "state": "CA" }}`, используйте оператор `^`:

```sql
SELECT doc.^address.city AS city FROM your_table;
```

Для агрегаций приведите поле к нужному типу с помощью функции `CAST` или синтаксиса `::`:

```sql
SELECT sum(doc.shipping.cost::Float32) AS total_shipping_cost FROM t1;
```

Чтобы узнать больше о работе с JSON, см. [руководство по работе с JSON](./quickstart).

### Как развернуть вложенные документы MongoDB в ClickHouse? \{#how-do-i-flatten-the-nested-mongodb-documents-in-clickhouse\}

По умолчанию документы MongoDB реплицируются в ClickHouse как данные типа JSON, сохраняя вложенную структуру. Есть несколько способов развернуть эти данные. Если вы хотите развернуть данные в столбцы, можно использовать обычные представления, materialized views или доступ к данным на уровне запроса.

1. **Обычные представления**: Используйте обычные представления, чтобы инкапсулировать логику разворачивания.
2. **Materialized Views**: Для небольших наборов данных можно использовать обновляемые materialized views с [модификатором `FINAL`](/sql-reference/statements/select/from#final-modifier), чтобы периодически разворачивать данные и удалять дубликаты. Для больших наборов данных мы рекомендуем использовать incremental materialized views без `FINAL`, чтобы разворачивать данные в реальном времени, а затем удалять дубликаты на уровне запроса.
3. **Доступ на уровне запроса**: Вместо разворачивания используйте точечную нотацию для прямого доступа к вложенным полям в запросах.

Подробные примеры см. в нашем [руководстве по работе с JSON](./quickstart).

### Можно ли подключиться к базам данных MongoDB, у которых нет публичного IP-адреса или которые находятся в частных сетях? \{#can-i-connect-mongodb-databases-that-dont-have-a-public-ip-or-are-in-private-networks\}

Мы поддерживаем AWS PrivateLink для подключения к базам данных MongoDB, у которых нет публичного IP-адреса или которые находятся в частных сетях. Azure Private Link и GCP Private Service Connect пока не поддерживаются.

### Что произойдет, если я удалю базу данных/таблицу в моей базе данных MongoDB? \{#what-happens-if-i-delete-a-database-table-from-my-mongodb-database\}

Когда вы удаляете базу данных/таблицу из MongoDB, ClickPipes продолжит работу, но для удаленной базы данных/таблицы изменения больше не будут реплицироваться. Соответствующие таблицы в ClickHouse будут сохранены.

### Как MongoDB CDC Connector обрабатывает транзакции? \{#how-does-mongodb-cdc-connector-handle-transactions\}

Каждое изменение документа в рамках транзакции обрабатывается отдельно и передается в ClickHouse. Изменения применяются в том порядке, в котором они появляются в oplog, и только зафиксированные изменения реплицируются в ClickHouse. Если транзакция MongoDB откатывается, эти изменения не появятся в потоке изменений.

Дополнительные примеры см. в нашем [руководстве по работе с JSON](./quickstart).

### Как устранить ошибку `resume of change stream was not possible, as the resume point may no longer be in the oplog.`? \{#resume-point-may-no-longer-be-in-the-oplog-error\}

Эта ошибка обычно возникает, когда oplog обрезается и ClickPipe не может возобновить поток изменений с ожидаемой позиции. Чтобы устранить эту проблему, [повторно синхронизируйте ClickPipe](./resync.md). Чтобы эта проблема не возникала снова, рекомендуем увеличить срок хранения oplog. См. инструкции для [MongoDB Atlas](./source/atlas#enable-oplog-retention), [самоуправляемой MongoDB](./source/generic#enable-oplog-retention) или [Amazon DocumentDB](./source/documentdb#configure-change-stream-log-retention).

### Как управляется репликация? \{#how-is-replication-managed\}

Мы используем нативный API Change Streams в MongoDB для отслеживания изменений в базе данных. API Change Streams предоставляет поток изменений базы данных, который можно возобновлять, используя oplog (журнал операций) MongoDB. ClickPipe использует токены возобновления MongoDB, чтобы отслеживать позицию в oplog и гарантировать репликацию всех изменений в ClickHouse.

### Какое предпочтение чтения выбрать? \{#which-read-preference-should-i-use\}

Выбор предпочтения чтения зависит от вашего сценария использования. Если вы хотите минимизировать нагрузку на первичный узел, мы рекомендуем использовать предпочтение чтения `secondaryPreferred`. Если вы хотите уменьшить задержку ингестии, мы рекомендуем использовать предпочтение чтения `primaryPreferred`. Подробнее см. в [документации MongoDB](https://www.mongodb.com/docs/manual/core/read-preference/#read-preference-modes-1).

### Поддерживает ли ClickPipe для MongoDB кластер с сегментированием? \{#does-the-mongodb-clickpipe-support-sharded-cluster\}

Да, ClickPipe для MongoDB поддерживает как Replica Set, так и кластер с сегментированием.

### Поддерживает ли ClickPipe для MongoDB Amazon DocumentDB? \{#documentdb-support\}

Да, ClickPipe для MongoDB поддерживает Amazon DocumentDB 5.0. Подробности см. в [руководстве по настройке источника Amazon DocumentDB](./source/documentdb.md).

### Поддерживает ли ClickPipe для MongoDB PrivateLink? \{#privatelink-support\}

Мы поддерживаем PrivateLink для кластера MongoDB (и DocumentDB) только в AWS.

Обратите внимание: в отличие от однузловой реляционной базы данных, клиент MongoDB требует успешного обнаружения набора реплик, чтобы учитывать настроенный `ReadPreference`. Для этого необходимо настроить PrivateLink для всех узлов кластера, чтобы клиент MongoDB мог успешно установить соединение с набором реплик, а также переключаться на другой узел при отказе текущего узла.

Если вы предпочитаете подключаться к одному узлу в кластере, можно пропустить обнаружение набора реплик, указав `/?directConnection=true` в строке подключения при настройке ClickPipes. В этом случае настройка PrivateLink будет аналогична настройке для однузловой реляционной базы данных и является самым простым вариантом поддержки PrivateLink.

Для соединения с набором реплик вы можете настроить PrivateLink для MongoDB либо через VPC Resource, либо через VPC Endpoint Service. Если вы выберете VPC Resource, потребуется создать конфигурацию ресурса `GROUP`, а также конфигурацию ресурса `CHILD` для каждого узла в кластере. Если вы выберете VPC Endpoint Service, потребуется создать отдельный Endpoint Service (и отдельный NLB) для каждого узла в кластере.

Дополнительные сведения см. в документации [AWS PrivateLink for ClickPipes](../aws-privatelink.md). За помощью обращайтесь в службу поддержки ClickHouse.
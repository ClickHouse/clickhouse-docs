---
sidebar_label: 'Часто задаваемые вопросы'
description: 'Часто задаваемые вопросы о ClickPipes для MongoDB.'
slug: /integrations/clickpipes/mongodb/faq
sidebar_position: 2
title: 'Часто задаваемые вопросы о ClickPipes для MongoDB'
doc_type: 'reference'
keywords: ['clickpipes', 'mongodb', 'cdc', 'загрузка данных', 'синхронизация в реальном времени']
---



# Часто задаваемые вопросы по ClickPipes для MongoDB

### Могу ли я запрашивать отдельные поля в типе данных JSON? {#can-i-query-for-individual-fields-in-the-json-datatype}

Для прямого доступа к полям, таким как `{"user_id": 123}`, можно использовать **точечную нотацию**:

```sql
SELECT doc.user_id as user_id FROM your_table;
```

Для прямого доступа к полям вложенных объектов, таким как `{"address": { "city": "San Francisco", "state": "CA" }}`, используйте оператор `^`:

```sql
SELECT doc.^address.city AS city FROM your_table;
```

Для агрегаций приведите поле к соответствующему типу с помощью функции `CAST` или синтаксиса `::`:

```sql
SELECT sum(doc.shipping.cost::Float32) AS total_shipping_cost FROM t1;
```

Чтобы узнать больше о работе с JSON, см. наше [руководство по работе с JSON](./quickstart).

### Как преобразовать вложенные документы MongoDB в плоскую структуру в ClickHouse? {#how-do-i-flatten-the-nested-mongodb-documents-in-clickhouse}

Документы MongoDB по умолчанию реплицируются в ClickHouse как тип JSON с сохранением вложенной структуры. У вас есть несколько вариантов преобразования этих данных в плоскую структуру. Если вы хотите преобразовать данные в столбцы, можно использовать обычные представления, материализованные представления или доступ во время выполнения запроса.

1. **Обычные представления**: используйте обычные представления для инкапсуляции логики преобразования в плоскую структуру.
2. **Материализованные представления**: для небольших наборов данных можно использовать обновляемые материализованные представления с [модификатором `FINAL`](/sql-reference/statements/select/from#final-modifier) для периодического преобразования в плоскую структуру и дедупликации данных. Для больших наборов данных рекомендуется использовать инкрементные материализованные представления без `FINAL` для преобразования данных в плоскую структуру в реальном времени с последующей дедупликацией данных во время выполнения запроса.
3. **Доступ во время выполнения запроса**: вместо преобразования в плоскую структуру используйте точечную нотацию для прямого доступа к вложенным полям в запросах.

Подробные примеры см. в нашем [руководстве по работе с JSON](./quickstart).

### Могу ли я подключить базы данных MongoDB, не имеющие публичного IP-адреса или находящиеся в частных сетях? {#can-i-connect-mongodb-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

Мы поддерживаем AWS PrivateLink для подключения к базам данных MongoDB, не имеющим публичного IP-адреса или находящимся в частных сетях. Azure Private Link и GCP Private Service Connect в настоящее время не поддерживаются.

### Что произойдет, если я удалю базу данных/таблицу из моей базы данных MongoDB? {#what-happens-if-i-delete-a-database-table-from-my-mongodb-database}

При удалении базы данных/таблицы из MongoDB ClickPipes продолжит работу, но удаленная база данных/таблица прекратит репликацию изменений. Соответствующие таблицы в ClickHouse сохраняются.

### Как коннектор MongoDB CDC обрабатывает транзакции? {#how-does-mongodb-cdc-connector-handle-transactions}

Каждое изменение документа в рамках транзакции обрабатывается в ClickHouse индивидуально. Изменения применяются в том порядке, в котором они появляются в oplog; в ClickHouse реплицируются только зафиксированные изменения. Если транзакция MongoDB откатывается, эти изменения не появятся в потоке изменений.

Дополнительные примеры см. в нашем [руководстве по работе с JSON](./quickstart).

### Как обработать ошибку `resume of change stream was not possible, as the resume point may no longer be in the oplog.`? {#resume-point-may-no-longer-be-in-the-oplog-error}

Эта ошибка обычно возникает, когда oplog усекается и ClickPipe не может возобновить поток изменений в ожидаемой точке. Чтобы устранить эту проблему, [выполните повторную синхронизацию ClickPipe](./resync.md). Чтобы избежать повторения этой проблемы, рекомендуется увеличить период хранения oplog. См. инструкции для [MongoDB Atlas](./source/atlas#enable-oplog-retention), [самостоятельно управляемого MongoDB](./source/generic#enable-oplog-retention) или [Amazon DocumentDB](./source/documentdb#configure-change-stream-log-retention).

### Как управляется репликация? {#how-is-replication-managed}

Мы используем нативный API Change Streams MongoDB для отслеживания изменений в базе данных. API Change Streams предоставляет возобновляемый поток изменений базы данных, используя oplog MongoDB (журнал операций). ClickPipe использует токены возобновления MongoDB для отслеживания позиции в oplog и обеспечения репликации каждого изменения в ClickHouse.

### Какое предпочтение чтения следует использовать? {#which-read-preference-should-i-use}

Выбор предпочтения чтения зависит от вашего конкретного сценария использования. Если вы хотите минимизировать нагрузку на основной узел, рекомендуется использовать предпочтение чтения `secondaryPreferred`. Если вы хотите оптимизировать задержку приема данных, рекомендуется использовать предпочтение чтения `primaryPreferred`. Подробнее см. в [документации MongoDB](https://www.mongodb.com/docs/manual/core/read-preference/#read-preference-modes-1).


### Поддерживает ли MongoDB ClickPipe шардированные кластеры? {#does-the-mongodb-clickpipe-support-sharded-cluster}

Да, MongoDB ClickPipe поддерживает как наборы реплик (Replica Set), так и шардированные кластеры (Sharded Cluster).

### Поддерживает ли MongoDB ClickPipe Amazon DocumentDB? {#documentdb-support}

Да, MongoDB ClickPipe поддерживает Amazon DocumentDB 5.0. Подробнее см. в [руководстве по настройке источника Amazon DocumentDB](./source/documentdb.md).

### Поддерживает ли MongoDB ClickPipe PrivateLink? {#privatelink-support}

Мы поддерживаем PrivateLink для кластеров MongoDB (и DocumentDB) только в AWS.

Обратите внимание, что в отличие от однонодовых реляционных баз данных, клиенту MongoDB требуется успешное обнаружение набора реплик для соблюдения настроенного параметра `ReadPreference`. Для этого необходимо настроить PrivateLink для всех узлов кластера, чтобы клиент MongoDB мог успешно установить соединение с набором реплик, а также переключиться на другой узел при отказе текущего узла.

Если вы предпочитаете подключаться к одному узлу кластера, можно пропустить обнаружение набора реплик, указав `/?directConnection=true` в строке подключения при настройке ClickPipes. В этом случае настройка PrivateLink будет аналогична настройке для однонодовой реляционной базы данных и является самым простым вариантом поддержки PrivateLink.

Для подключения к набору реплик можно настроить PrivateLink для MongoDB с помощью VPC Resource или VPC Endpoint Service. При использовании VPC Resource необходимо создать конфигурацию ресурса `GROUP`, а также конфигурацию ресурса `CHILD` для каждого узла кластера. При использовании VPC Endpoint Service необходимо создать отдельный Endpoint Service (и отдельный NLB) для каждого узла кластера.

Подробнее см. в документации [AWS PrivateLink для ClickPipes](../aws-privatelink.md). Для получения помощи обратитесь в службу поддержки ClickHouse.

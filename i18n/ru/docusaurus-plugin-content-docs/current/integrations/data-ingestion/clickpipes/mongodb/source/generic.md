---
sidebar_label: 'Универсальный MongoDB'
description: 'Настройка любого экземпляра MongoDB в качестве источника для ClickPipes'
slug: /integrations/clickpipes/mongodb/source/generic
title: 'Руководство по настройке универсального источника MongoDB'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---



# Общие рекомендации по настройке источника MongoDB

:::info

Если вы используете MongoDB Atlas, воспользуйтесь отдельным руководством [здесь](./atlas).

:::



## Включение хранения oplog {#enable-oplog-retention}

Для репликации требуется минимальный период хранения oplog в 24 часа. Рекомендуется устанавливать период хранения oplog на 72 часа или более, чтобы гарантировать, что oplog не будет усечён до завершения начального снимка.

Вы можете проверить текущий период хранения oplog, выполнив следующую команду в оболочке MongoDB (для выполнения этой команды необходима роль `clusterMonitor`):

```javascript
db.getSiblingDB("admin").serverStatus().oplogTruncation.oplogMinRetentionHours
```

Чтобы установить период хранения oplog на 72 часа, выполните следующую команду на каждом узле набора реплик от имени администратора:

```javascript
db.adminCommand({
  replSetResizeOplog: 1,
  minRetentionHours: 72
})
```

Для получения дополнительной информации о команде `replSetResizeOplog` и хранении oplog см. [документацию MongoDB](https://www.mongodb.com/docs/manual/reference/command/replSetResizeOplog/).


## Настройка пользователя базы данных {#configure-database-user}

Подключитесь к экземпляру MongoDB от имени администратора и выполните следующую команду для создания пользователя для MongoDB CDC ClickPipes:

```javascript
db.getSiblingDB("admin").createUser({
  user: "clickpipes_user",
  pwd: "some_secure_password",
  roles: ["readAnyDatabase", "clusterMonitor"]
})
```

:::note

Обязательно замените `clickpipes_user` и `some_secure_password` на нужные имя пользователя и пароль.

:::


## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать загружать данные из вашего экземпляра MongoDB в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке экземпляра MongoDB — они понадобятся вам при создании ClickPipe.

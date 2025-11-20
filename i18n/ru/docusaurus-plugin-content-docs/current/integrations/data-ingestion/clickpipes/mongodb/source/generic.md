---
sidebar_label: 'Произвольный MongoDB'
description: 'Настройка любого экземпляра MongoDB как источника для ClickPipes'
slug: /integrations/clickpipes/mongodb/source/generic
title: 'Руководство по настройке произвольного источника MongoDB'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---



# Общее руководство по настройке источника MongoDB

:::info

Если вы используете MongoDB Atlas, воспользуйтесь отдельным руководством [по этой ссылке](./atlas).

:::



## Включение хранения oplog {#enable-oplog-retention}

Для репликации требуется минимальный период хранения oplog в 24 часа. Рекомендуется устанавливать период хранения oplog на 72 часа или более, чтобы гарантировать, что oplog не будет усечён до завершения начального снимка данных.

Вы можете проверить текущий период хранения oplog, выполнив следующую команду в оболочке MongoDB (для выполнения этой команды требуется роль `clusterMonitor`):

```javascript
db.getSiblingDB("admin").serverStatus().oplogTruncation.oplogMinRetentionHours
```

Чтобы установить период хранения oplog на 72 часа, выполните следующую команду на каждом узле набора реплик от имени пользователя с правами администратора:

```javascript
db.adminCommand({
  replSetResizeOplog: 1,
  minRetentionHours: 72
})
```

Подробнее о команде `replSetResizeOplog` и хранении oplog см. в [документации MongoDB](https://www.mongodb.com/docs/manual/reference/command/replSetResizeOplog/).


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

Замените `clickpipes_user` и `some_secure_password` на нужные имя пользователя и пароль.

:::


## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать загружать данные из вашего экземпляра MongoDB в ClickHouse Cloud.
Обязательно сохраните параметры подключения, которые вы использовали при настройке экземпляра MongoDB, так как они понадобятся при создании ClickPipe.

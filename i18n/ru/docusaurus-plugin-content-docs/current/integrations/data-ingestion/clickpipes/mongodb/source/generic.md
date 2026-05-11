---
sidebar_label: 'Универсальный MongoDB'
description: 'Настройте любой экземпляр MongoDB в качестве источника для ClickPipes'
slug: /integrations/clickpipes/mongodb/source/generic
title: 'Руководство по настройке источника Generic MongoDB'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# Общее руководство по настройке источника данных MongoDB \{#generic-mongodb-source-setup-guide\}

:::info

Если вы используете MongoDB Atlas, см. отдельное руководство [здесь](./atlas).

:::

## Включите хранение oplog \{#enable-oplog-retention\}

Для репликации требуется минимальное время хранения oplog в 24 часа. Мы рекомендуем установить время хранения oplog на 72 часа или дольше, чтобы гарантировать, что oplog не будет усечён до завершения первоначального снимка.

Вы можете проверить текущее время хранения oplog, выполнив следующую команду в оболочке MongoDB (для этого у вас должна быть роль `clusterMonitor`):

```javascript
db.getSiblingDB("admin").serverStatus().oplogTruncation.oplogMinRetentionHours
```

Чтобы установить период хранения журнала oplog на 72 часа, выполните следующую команду на каждом узле в наборе реплик от имени пользователя с правами администратора:

```javascript
db.adminCommand({
    "replSetResizeOplog" : 1,
    "minRetentionHours": 72
})
```

Дополнительные сведения о команде `replSetResizeOplog` и политике хранения oplog см. в [документации MongoDB](https://www.mongodb.com/docs/manual/reference/command/replSetResizeOplog/).


## Настройка пользователя базы данных \{#configure-database-user\}

Подключитесь к экземпляру MongoDB под учетной записью администратора и выполните следующую команду, чтобы создать пользователя для ClickPipes MongoDB CDC:

```javascript
db.getSiblingDB("admin").createUser({
    user: "clickpipes_user",
    pwd: "some_secure_password",
    roles: ["readAnyDatabase", "clusterMonitor"],
})
```

:::note

Обязательно замените `clickpipes_user` и `some_secure_password` на выбранные вами имя пользователя и пароль.

:::


## Что дальше? \{#whats-next\}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из экземпляра MongoDB в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке экземпляра MongoDB, так как они понадобятся вам в процессе создания ClickPipe.
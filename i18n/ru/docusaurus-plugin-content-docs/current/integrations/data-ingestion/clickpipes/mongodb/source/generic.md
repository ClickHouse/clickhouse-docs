---
sidebar_label: 'Произвольный экземпляр MongoDB'
description: 'Настройка любого экземпляра MongoDB в качестве источника для ClickPipes'
slug: /integrations/clickpipes/mongodb/source/generic
title: 'Руководство по настройке произвольного источника MongoDB'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'ингестия данных', 'синхронизация в режиме реального времени']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# Общее руководство по настройке источника данных MongoDB {#generic-mongodb-source-setup-guide}

:::info

Если вы используете MongoDB Atlas, обратитесь к специальному руководству [здесь](./atlas).

:::

## Включение хранения oplog {#enable-oplog-retention}

Для репликации требуется минимальный срок хранения oplog в 24 часа. Рекомендуется устанавливать срок хранения oplog на 72 часа или больше, чтобы избежать его усечения до завершения начального снимка.

Вы можете проверить текущий срок хранения oplog, выполнив следующую команду в оболочке MongoDB (для выполнения этой команды у вас должна быть роль `clusterMonitor`):

```javascript
db.getSiblingDB("admin").serverStatus().oplogTruncation.oplogMinRetentionHours
```

Чтобы установить время хранения oplog на 72 часа, выполните следующую команду на каждом узле набора реплик от имени пользователя с правами администратора:

```javascript
db.adminCommand({
    "replSetResizeOplog" : 1,
    "minRetentionHours": 72
})
```

Подробнее о команде `replSetResizeOplog` и хранении журнала операций (oplog) см. [документацию MongoDB](https://www.mongodb.com/docs/manual/reference/command/replSetResizeOplog/).


## Настройте пользователя базы данных {#configure-database-user}

Подключитесь к экземпляру MongoDB как пользователь с правами администратора и выполните следующую команду, чтобы создать пользователя для MongoDB CDC ClickPipes:

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


## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из экземпляра MongoDB в ClickHouse Cloud.
Обязательно сохраните параметры подключения, которые вы использовали при настройке MongoDB, так как они понадобятся вам в процессе создания ClickPipe.
---
'sidebar_label': 'Универсальное MongoDB'
'description': 'Настройте любой экземпляр MongoDB в качестве источника для ClickPipes'
'slug': '/integrations/clickpipes/mongodb/source/generic'
'title': 'Универсальное руководство по настройке источника MongoDB'
'doc_type': 'guide'
---
# Общий гид по настройке источника MongoDB

:::info

Если вы используете MongoDB Atlas, пожалуйста, обратитесь к специальному руководству [здесь](./atlas).

:::

## Включите удержание oplog {#enable-oplog-retention}

Минимальное удержание oplog в 24 часа требуется для репликации. Рекомендуем установить удержание oplog на 72 часа или более, чтобы убедиться, что oplog не обрезается до завершения начального снимка.

Вы можете проверить текущее удержание oplog, выполнив следующую команду в оболочке MongoDB (вы должны иметь роль `clusterMonitor`, чтобы выполнить эту команду):

```javascript
db.getSiblingDB("admin").serverStatus().oplogTruncation.oplogMinRetentionHours
```

Чтобы установить удержание oplog на 72 часа, выполните следующую команду на каждом узле в наборе реплик в качестве администратора:

```javascript
db.adminCommand({
    "replSetResizeOplog" : 1,
    "minRetentionHours": 72
})
```

Для получения дополнительной информации о команде `replSetResizeOplog` и удержании oplog смотрите [документацию MongoDB](https://www.mongodb.com/docs/manual/reference/command/replSetResizeOplog/).

## Настройте пользователя базы данных {#configure-database-user}

Подключитесь к вашей инстанции MongoDB в качестве администратора и выполните следующую команду для создания пользователя для MongoDB CDC ClickPipes:

```javascript
db.getSiblingDB("admin").createUser({
    user: "clickpipes_user",
    pwd: "some_secure_password",
    roles: ["readAnyDatabase", "clusterMonitor"],
})
```

:::note

Не забудьте заменить `clickpipes_user` и `some_secure_password` на желаемое имя пользователя и пароль.

:::

## Что дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать прием данных из вашей инстанции MongoDB в ClickHouse Cloud. 
Не забудьте записать сведения о подключении, которые вы использовали при настройке вашей инстанции MongoDB, так как они понадобятся вам в процессе создания ClickPipe.
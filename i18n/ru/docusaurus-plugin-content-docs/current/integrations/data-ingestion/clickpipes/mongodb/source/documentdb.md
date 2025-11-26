---
sidebar_label: 'Amazon DocumentDB'
description: 'Пошаговое руководство по настройке Amazon DocumentDB в качестве источника для ClickPipes'
slug: /integrations/clickpipes/mongodb/source/documentdb
title: 'Руководство по настройке источника Amazon DocumentDB'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'documentdb', 'cdc', 'ингестия данных', 'синхронизация в режиме реального времени']
---

import docdb_select_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-select-parameter-group.png'
import docdb_modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-modify-parameter-group.png'
import docdb_apply_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-apply-parameter-group.png'
import docdb_parameter_group_status from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-parameter-group-status.png'
import Image from '@theme/IdealImage';


# Руководство по настройке источника данных Amazon DocumentDB



## Поддерживаемые версии DocumentDB {#supported-documentdb-versions}

ClickPipes поддерживает DocumentDB версии 5.0.



## Настройка периода хранения журналов потока изменений

По умолчанию в Amazon DocumentDB период хранения журналов потока изменений составляет 3 часа, тогда как первоначальная загрузка может занять значительно больше времени в зависимости от объёма имеющихся данных в вашем DocumentDB. Рекомендуется установить период хранения журналов потока изменений на 72 часа или дольше, чтобы журналы не были усечены до завершения создания первоначального снимка.

### Обновление периода хранения журналов потока изменений через AWS Console

1. Нажмите `Parameter groups` в левой панели и найдите группу параметров, используемую вашим кластером DocumentDB (если вы используете группу параметров по умолчанию, вам сначала нужно создать новую группу параметров, чтобы иметь возможность её изменить).

<Image img={docdb_select_parameter_group} alt="Выбор группы параметров" size="lg" border />

2. Найдите `change_stream_log_retention_duration`, выберите этот параметр и измените его значение на `259200` (72 часа).

<Image img={docdb_modify_parameter_group} alt="Изменение группы параметров" size="lg" border />

3. Нажмите `Apply Changes`, чтобы немедленно применить изменённую группу параметров к вашему кластеру DocumentDB. Статус группы параметров должен измениться на `applying`, а затем на `in-sync` после применения изменений.

<Image img={docdb_apply_parameter_group} alt="Применение группы параметров" size="lg" border />

<Image img={docdb_parameter_group_status} alt="Статус группы параметров" size="lg" border />

### Обновление периода хранения журналов потока изменений через AWS CLI

Также вы можете настроить это через AWS CLI.

Чтобы проверить текущий период хранения журналов потока изменений:

```shell
aws docdb describe-db-cluster-parameters --db-cluster-parameter-group-name <PARAMETER_GROUP_NAME> --query "Parameters[?ParameterName=='change_stream_log_retention_duration'].{Name:ParameterName,Value:ParameterValue}"
```

Чтобы установить срок хранения журнала потока изменений на 72 часа:

```shell
aws docdb modify-db-cluster-parameter-group --db-cluster-parameter-group-name <PARAMETER_GROUP_NAME> --parameters "ParameterName=change_stream_log_retention_duration,ParameterValue=259200,ApplyMethod=immediate"
```


## Настройте пользователя базы данных

Подключитесь к своему кластеру DocumentDB с учетной записью администратора и выполните следующую команду, чтобы создать пользователя базы данных для MongoDB CDC ClickPipes:

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

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из экземпляра DocumentDB в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке кластера DocumentDB, так как они понадобятся вам при создании ClickPipe.

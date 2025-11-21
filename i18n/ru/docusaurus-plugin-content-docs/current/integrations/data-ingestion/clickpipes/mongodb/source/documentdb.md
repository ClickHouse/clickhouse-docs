---
sidebar_label: 'Amazon DocumentDB'
description: 'Пошаговое руководство по настройке Amazon DocumentDB в качестве источника для ClickPipes'
slug: /integrations/clickpipes/mongodb/source/documentdb
title: 'Руководство по настройке источника Amazon DocumentDB'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'documentdb', 'cdc', 'data ingestion', 'real-time sync']
---

import docdb_select_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-select-parameter-group.png'
import docdb_modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-modify-parameter-group.png'
import docdb_apply_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-apply-parameter-group.png'
import docdb_parameter_group_status from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-parameter-group-status.png'
import Image from '@theme/IdealImage';


# Руководство по настройке источника данных Amazon DocumentDB



## Поддерживаемые версии DocumentDB {#supported-documentdb-versions}

ClickPipes поддерживает DocumentDB версии 5.0.


## Настройка срока хранения журнала потока изменений {#configure-change-stream-log-retention}

По умолчанию в Amazon DocumentDB срок хранения журнала потока изменений составляет 3 часа, тогда как начальная загрузка может занять значительно больше времени в зависимости от объёма существующих данных в вашей DocumentDB. Рекомендуется установить срок хранения журнала потока изменений на 72 часа или более, чтобы гарантировать, что он не будет усечён до завершения начального снимка.

### Обновление срока хранения журнала потока изменений через консоль AWS {#update-change-stream-log-retention-via-aws-console}

1. Нажмите `Parameter groups` на левой панели, найдите группу параметров, используемую вашим кластером DocumentDB (если вы используете группу параметров по умолчанию, вам сначала потребуется создать новую группу параметров, чтобы иметь возможность её изменить).

   <Image
     img={docdb_select_parameter_group}
     alt='Выбор группы параметров'
     size='lg'
     border
   />

2. Найдите параметр `change_stream_log_retention_duration`, выберите его и измените значение на `259200` (72 часа)

   <Image
     img={docdb_modify_parameter_group}
     alt='Изменение группы параметров'
     size='lg'
     border
   />

3. Нажмите `Apply Changes`, чтобы немедленно применить изменённую группу параметров к вашему кластеру DocumentDB. Вы должны увидеть, как статус группы параметров изменится на `applying`, а затем на `in-sync` после применения изменений.
   <Image
     img={docdb_apply_parameter_group}
     alt='Применение группы параметров'
     size='lg'
     border
   />

<Image
  img={docdb_parameter_group_status}
  alt='Статус группы параметров'
  size='lg'
  border
/>

### Обновление срока хранения журнала потока изменений через AWS CLI {#update-change-stream-log-retention-via-aws-cli}

Также вы можете настроить это через AWS CLI.

Чтобы проверить текущий срок хранения журнала потока изменений:

```shell
aws docdb describe-db-cluster-parameters --db-cluster-parameter-group-name <PARAMETER_GROUP_NAME> --query "Parameters[?ParameterName=='change_stream_log_retention_duration'].{Name:ParameterName,Value:ParameterValue}"
```

Чтобы установить срок хранения журнала потока изменений на 72 часа:

```shell
aws docdb modify-db-cluster-parameter-group --db-cluster-parameter-group-name <PARAMETER_GROUP_NAME> --parameters "ParameterName=change_stream_log_retention_duration,ParameterValue=259200,ApplyMethod=immediate"
```


## Настройка пользователя базы данных {#configure-database-user}

Подключитесь к кластеру DocumentDB с правами администратора и выполните следующую команду для создания пользователя базы данных для MongoDB CDC ClickPipes:

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

Теперь вы можете [создать ClickPipe](../index.md) и начать загрузку данных из вашего экземпляра DocumentDB в ClickHouse Cloud.
Обязательно сохраните параметры подключения, которые вы использовали при настройке кластера DocumentDB, так как они понадобятся при создании ClickPipe.

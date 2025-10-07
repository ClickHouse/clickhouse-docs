---
'sidebar_label': 'MongoDB Atlas'
'description': 'Пошаговое руководство о том, как настроить MongoDB Atlas в качестве
  источника для ClickPipes'
'slug': '/integrations/clickpipes/mongodb/source/atlas'
'title': 'Настройка источника MongoDB Atlas'
'doc_type': 'guide'
---

import mongo_atlas_configuration from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-cluster-overview-configuration.png'
import mngo_atlas_additional_settings from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-expand-additional-settings.png'
import mongo_atlas_retention_hours from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-set-retention-hours.png'
import mongo_atlas_add_user from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-add-new-database-user.png'
import mongo_atlas_add_roles from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-database-user-privilege.png'
import mongo_atlas_restrict_access from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-restrict-access.png'
import Image from '@theme/IdealImage';


# Руководство по настройке источника MongoDB Atlas

## Настройка хранения oplog {#enable-oplog-retention}

Минимальное время хранения oplog составляет 24 часа и требуется для репликации. Мы рекомендуем установить время хранения oplog на 72 часа или дольше, чтобы гарантировать, что oplog не будет обрезан до завершения начального снимка. Чтобы установить время хранения oplog через интерфейс:

1. Перейдите на вкладку `Обзор` вашего кластера в консоли MongoDB Atlas и нажмите на вкладку `Конфигурация`.
<Image img={mongo_atlas_configuration} alt="Перейдите к конфигурации кластера" size="lg" border/>

2. Нажмите `Дополнительные настройки` и прокрутите вниз до `Больше параметров конфигурации`.
<Image img={mngo_atlas_additional_settings} alt="Расширьте дополнительные настройки" size="lg" border/>

3. Нажмите `Больше параметров конфигурации` и установите минимальное время хранения oplog на `72 часа` или дольше.
<Image img={mongo_atlas_retention_hours} alt="Установите часы хранения oplog" size="lg" border/>

4. Нажмите `Просмотр изменений`, чтобы просмотреть изменения, а затем `Применить изменения`, чтобы развернуть изменения.

## Настройка пользователя базы данных {#configure-database-user}

После входа в консоль MongoDB Atlas нажмите `Доступ к базе данных` в разделе Безопасность в левой навигационной панели. Нажмите "Добавить нового пользователя базы данных".

ClickPipes требует аутентификации по паролю:

<Image img={mongo_atlas_add_user} alt="Добавить пользователя базы данных" size="lg" border/>

ClickPipes требует пользователя с следующими ролями:

- `readAnyDatabase`
- `clusterMonitor`

Вы можете найти их в разделе `Специфические права`:

<Image img={mongo_atlas_add_roles} alt="Настройка ролей пользователя" size="lg" border/>

Вы можете дополнительно указать кластеры/экземпляры, к которым вы хотите предоставить доступ пользователю ClickPipes:

<Image img={mongo_atlas_restrict_access} alt="Ограничить доступ к кластеру/экземпляру" size="lg" border/>

## Что дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать загружать данные из вашего экземпляра MongoDB в ClickHouse Cloud.
Обязательно запишите данные для подключения, которые вы использовали при настройке вашего экземпляра MongoDB, так как они понадобятся вам во время процесса создания ClickPipe.

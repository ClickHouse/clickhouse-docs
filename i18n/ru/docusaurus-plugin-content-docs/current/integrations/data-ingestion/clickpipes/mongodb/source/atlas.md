---
sidebar_label: 'MongoDB Atlas'
description: 'Пошаговое руководство по настройке MongoDB Atlas в качестве источника для ClickPipes'
slug: /integrations/clickpipes/mongodb/source/atlas
title: 'Пошаговое руководство по настройке MongoDB Atlas как источника'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'загрузка данных', 'синхронизация в реальном времени']
---

import mongo_atlas_configuration from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-cluster-overview-configuration.png'
import mngo_atlas_additional_settings from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-expand-additional-settings.png'
import mongo_atlas_retention_hours from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-set-retention-hours.png'
import mongo_atlas_add_user from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-add-new-database-user.png'
import mongo_atlas_add_roles from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-database-user-privilege.png'
import mongo_atlas_restrict_access from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-restrict-access.png'
import Image from '@theme/IdealImage';


# Руководство по настройке источника данных MongoDB Atlas



## Настройка хранения oplog {#enable-oplog-retention}

Для репликации требуется минимальное время хранения oplog 24 часа. Рекомендуется установить время хранения oplog на 72 часа или более, чтобы гарантировать, что oplog не будет усечён до завершения начального снимка. Чтобы настроить хранение oplog через пользовательский интерфейс:

1. Перейдите на вкладку `Overview` вашего кластера в консоли MongoDB Atlas и нажмите на вкладку `Configuration`.

   <Image
     img={mongo_atlas_configuration}
     alt='Переход к конфигурации кластера'
     size='lg'
     border
   />

2. Нажмите `Additional Settings` и прокрутите вниз до `More Configuration Options`.

   <Image
     img={mngo_atlas_additional_settings}
     alt='Раскрытие дополнительных настроек'
     size='lg'
     border
   />

3. Нажмите `More Configuration Options` и установите минимальное окно oplog на `72 hours` или более.

   <Image
     img={mongo_atlas_retention_hours}
     alt='Установка времени хранения oplog'
     size='lg'
     border
   />

4. Нажмите `Review Changes` для проверки, затем `Apply Changes` для применения изменений.


## Настройка пользователя базы данных {#configure-database-user}

После входа в консоль MongoDB Atlas нажмите `Database Access` в разделе Security на левой панели навигации. Нажмите «Add New Database User».

ClickPipes требует аутентификацию по паролю:

<Image img={mongo_atlas_add_user} alt='Добавление пользователя базы данных' size='lg' border />

ClickPipes требует пользователя со следующими ролями:

- `readAnyDatabase`
- `clusterMonitor`

Их можно найти в разделе `Specific Privileges`:

<Image
  img={mongo_atlas_add_roles}
  alt='Настройка ролей пользователя'
  size='lg'
  border
/>

Вы можете дополнительно указать кластер(ы)/экземпляр(ы), к которым необходимо предоставить доступ пользователю ClickPipes:

<Image
  img={mongo_atlas_restrict_access}
  alt='Ограничение доступа к кластеру/экземпляру'
  size='lg'
  border
/>


## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать загружать данные из вашего экземпляра MongoDB в ClickHouse Cloud.
Обязательно сохраните параметры подключения, которые вы использовали при настройке экземпляра MongoDB, так как они понадобятся при создании ClickPipe.

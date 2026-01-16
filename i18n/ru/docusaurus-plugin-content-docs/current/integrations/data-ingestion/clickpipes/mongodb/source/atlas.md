---
sidebar_label: 'MongoDB Atlas'
description: 'Пошаговое руководство по настройке MongoDB Atlas как источника для ClickPipes'
slug: /integrations/clickpipes/mongodb/source/atlas
title: 'Руководство по настройке источника MongoDB Atlas'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'ингестия данных', 'синхронизация в режиме реального времени']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import mongo_atlas_configuration from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-cluster-overview-configuration.png'
import mngo_atlas_additional_settings from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-expand-additional-settings.png'
import mongo_atlas_retention_hours from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-set-retention-hours.png'
import mongo_atlas_add_user from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-add-new-database-user.png'
import mongo_atlas_add_roles from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-database-user-privilege.png'
import mongo_atlas_restrict_access from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-restrict-access.png'
import Image from '@theme/IdealImage';

# Руководство по настройке источника данных MongoDB Atlas \\{#mongodb-atlas-source-setup-guide\\}

## Настроить хранение oplog \\{#enable-oplog-retention\\}

Для репликации требуется минимальное время хранения oplog не менее 24 часов. Рекомендуется установить время хранения oplog на 72 часа или дольше, чтобы гарантировать, что он не будет усечён до завершения начального снимка. Чтобы настроить хранение oplog через интерфейс:

1. Перейдите на вкладку `Overview` вашего кластера в консоли MongoDB Atlas и нажмите на вкладку `Configuration`.

<Image img={mongo_atlas_configuration} alt="Перейдите к конфигурации кластера" size="lg" border/>

2. Нажмите `Additional Settings` и прокрутите вниз до `More Configuration Options`.

<Image img={mngo_atlas_additional_settings} alt="Раскройте дополнительные настройки" size="lg" border/>

3. Нажмите `More Configuration Options` и установите минимальное окно oplog равным `72 hours` или больше.

<Image img={mongo_atlas_retention_hours} alt="Установите количество часов хранения oplog" size="lg" border/>

4. Нажмите `Review Changes` для проверки, затем `Apply Changes` для применения изменений.

## Настройка пользователя базы данных \\{#configure-database-user\\}

После входа в консоль MongoDB Atlas нажмите `Database Access` на вкладке **Security** в левой панели навигации. Затем нажмите **Add New Database User**.

Для ClickPipes требуется аутентификация по паролю:

<Image img={mongo_atlas_add_user} alt="Добавление пользователя базы данных" size="lg" border/>

Для ClickPipes нужен пользователь со следующими ролями:

- `readAnyDatabase`
- `clusterMonitor`

Вы можете найти их в разделе `Specific Privileges`:

<Image img={mongo_atlas_add_roles} alt="Настройка ролей пользователя" size="lg" border/>

Вы также можете дополнительно указать кластеры/экземпляры, к которым хотите предоставить доступ пользователю ClickPipes:

<Image img={mongo_atlas_restrict_access} alt="Ограничение доступа к кластерам/экземплярам" size="lg" border/>

## Что дальше? \\{#whats-next\\}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из экземпляра MongoDB в ClickHouse Cloud.
Обязательно сохраните параметры подключения, которые вы использовали при настройке экземпляра MongoDB, — они понадобятся вам при создании ClickPipe.
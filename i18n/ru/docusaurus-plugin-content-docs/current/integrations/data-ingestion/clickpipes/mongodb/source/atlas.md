---
sidebar_label: 'MongoDB Atlas'
description: 'Пошаговое руководство по настройке MongoDB Atlas в качестве источника для ClickPipes'
slug: /integrations/clickpipes/mongodb/source/atlas
title: 'Руководство по настройке источника MongoDB Atlas'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'CDC', 'ингестия данных', 'синхронизация в режиме реального времени']
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


# Руководство по настройке источника данных MongoDB Atlas \{#mongodb-atlas-source-setup-guide\}

## Настройка времени хранения oplog \{#enable-oplog-retention\}

Для репликации требуется минимальное время хранения oplog в 24 часа. Рекомендуется установить время хранения oplog на 72 часа или дольше, чтобы гарантировать, что oplog не будет усечён до завершения первоначального снимка данных. Чтобы задать время хранения oplog через UI:

1. Перейдите на вкладку `Overview` вашего кластера в консоли MongoDB Atlas и нажмите вкладку `Configuration`.

<Image img={mongo_atlas_configuration} alt="Перейдите к конфигурации кластера" size="lg" border/>

2. Нажмите `Additional Settings` и прокрутите вниз до `More Configuration Options`.

<Image img={mngo_atlas_additional_settings} alt="Разверните дополнительные настройки" size="lg" border/>

3. Нажмите `More Configuration Options` и установите минимальное окно oplog на `72 hours` или дольше.

<Image img={mongo_atlas_retention_hours} alt="Задайте количество часов хранения oplog" size="lg" border/>

4. Нажмите `Review Changes` для проверки, затем `Apply Changes`, чтобы применить изменения.

## Настройка пользователя базы данных \{#configure-database-user\}

После входа в консоль MongoDB Atlas нажмите `Database Access` на вкладке **Security** в левой панели навигации. Нажмите «Add New Database User».

Для ClickPipes требуется аутентификация по паролю:

<Image img={mongo_atlas_add_user} alt="Добавить пользователя базы данных" size="lg" border/>

Для ClickPipes нужен пользователь со следующими ролями:

- `readAnyDatabase`
- `clusterMonitor`

Вы можете найти их в разделе `Specific Privileges`:

<Image img={mongo_atlas_add_roles} alt="Настройка ролей пользователя" size="lg" border/>

Вы также можете указать кластеры/инстансы, к которым хотите предоставить доступ пользователю ClickPipes:

<Image img={mongo_atlas_restrict_access} alt="Ограничение доступа к кластерам/инстансам" size="lg" border/>

## Что дальше? \{#whats-next\}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать приём данных из своего экземпляра MongoDB в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке экземпляра MongoDB, так как они понадобятся вам при создании ClickPipe.
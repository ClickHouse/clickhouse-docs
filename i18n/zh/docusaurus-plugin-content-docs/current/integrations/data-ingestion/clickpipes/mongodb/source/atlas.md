---
sidebar_label: 'MongoDB Atlas'
description: '关于如何将 MongoDB Atlas 设置为 ClickPipes 源的分步指南'
slug: /integrations/clickpipes/mongodb/source/atlas
title: 'MongoDB Atlas 源设置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', '数据摄取', '实时同步']
---

import mongo_atlas_configuration from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-cluster-overview-configuration.png'
import mngo_atlas_additional_settings from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-expand-additional-settings.png'
import mongo_atlas_retention_hours from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-set-retention-hours.png'
import mongo_atlas_add_user from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-add-new-database-user.png'
import mongo_atlas_add_roles from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-database-user-privilege.png'
import mongo_atlas_restrict_access from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-restrict-access.png'
import Image from '@theme/IdealImage';

# MongoDB Atlas 数据源设置指南 {#mongodb-atlas-source-setup-guide}

## 配置 oplog 保留时间 {#enable-oplog-retention}

复制至少需要 24 小时的 oplog 保留时间。我们建议将 oplog 保留时间设置为 72 小时或更长，以确保在完成初始快照之前不会截断 oplog。通过 UI 设置 oplog 保留时间的步骤如下：

1. 在 MongoDB Atlas 控制台中进入集群的 `Overview` 选项卡，然后单击 `Configuration` 选项卡。
<Image img={mongo_atlas_configuration} alt="导航到集群配置" size="lg" border/>

2. 单击 `Additional Settings`，然后向下滚动到 `More Configuration Options`。
<Image img={mngo_atlas_additional_settings} alt="展开更多设置" size="lg" border/>

3. 单击 `More Configuration Options`，并将最小 oplog 窗口设置为 `72 hours` 或更长。
<Image img={mongo_atlas_retention_hours} alt="设置 oplog 保留时长（小时）" size="lg" border/>

4. 单击 `Review Changes` 进行检查，然后单击 `Apply Changes` 来部署这些更改。

## 配置数据库用户 {#configure-database-user}

登录 MongoDB Atlas 控制台后，在左侧导航栏的 Security 选项卡下点击 `Database Access`，然后点击“Add New Database User”。

ClickPipes 要求使用密码身份验证：

<Image img={mongo_atlas_add_user} alt="添加数据库用户" size="lg" border/>

ClickPipes 需要一个具备以下角色的用户：

- `readAnyDatabase`
- `clusterMonitor`

你可以在 `Specific Privileges` 部分找到这些角色：

<Image img={mongo_atlas_add_roles} alt="配置用户角色" size="lg" border/>

你还可以进一步指定要授予 ClickPipes 用户访问权限的集群/实例：

<Image img={mongo_atlas_restrict_access} alt="限制集群/实例访问" size="lg" border/>

## 接下来？ {#whats-next}

你现在可以[创建 ClickPipe](../index.md)，并开始将 MongoDB 实例中的数据摄取到 ClickHouse Cloud 中。
请务必记录你在设置 MongoDB 实例时使用的连接信息，因为在创建 ClickPipe 的过程中你将需要用到这些信息。

---
'sidebar_label': 'MongoDB Atlas'
'description': '逐步指南，介绍如何将 MongoDB Atlas 设置为 ClickPipes 的数据源'
'slug': '/integrations/clickpipes/mongodb/source/atlas'
'title': 'MongoDB Atlas 源设置指南'
'doc_type': 'guide'
---

import mongo_atlas_configuration from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-cluster-overview-configuration.png'
import mngo_atlas_additional_settings from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-expand-additional-settings.png'
import mongo_atlas_retention_hours from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-set-retention-hours.png'
import mongo_atlas_add_user from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-add-new-database-user.png'
import mongo_atlas_add_roles from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-database-user-privilege.png'
import mongo_atlas_restrict_access from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-restrict-access.png'
import Image from '@theme/IdealImage';


# MongoDB Atlas 源设置指南

## 配置 oplog 保留时间 {#enable-oplog-retention}

复制需要最低 24 小时的 oplog 保留时间。我们建议将 oplog 保留时间设置为 72 小时或更长时间，以确保在初始快照完成之前不会截断 oplog。通过用户界面设置 oplog 保留时间的步骤如下：

1. 在 MongoDB Atlas 控制台中，导航到集群的 `Overview` 标签页，并点击 `Configuration` 标签页。
<Image img={mongo_atlas_configuration} alt="导航到集群配置" size="lg" border/>

2. 点击 `Additional Settings` 并向下滚动到 `More Configuration Options`。
<Image img={mngo_atlas_additional_settings} alt="展开附加设置" size="lg" border/>

3. 点击 `More Configuration Options` 并将最小 oplog 窗口设置为 `72 hours` 或更长。
<Image img={mongo_atlas_retention_hours} alt="设置 oplog 保留时间" size="lg" border/>

4. 点击 `Review Changes` 进行审查，然后点击 `Apply Changes` 部署更改。

## 配置数据库用户 {#configure-database-user}

登录到 MongoDB Atlas 控制台后，在左侧导航栏的 Security 标签下点击 `Database Access`。然后点击 “Add New Database User”。

ClickPipes 需要密码验证：

<Image img={mongo_atlas_add_user} alt="添加数据库用户" size="lg" border/>

ClickPipes 需要具有以下角色的用户：

- `readAnyDatabase`
- `clusterMonitor`

您可以在 `Specific Privileges` 部分找到这些角色：

<Image img={mongo_atlas_add_roles} alt="配置用户角色" size="lg" border/>

您可以进一步指定希望授予 ClickPipes 用户访问权限的集群（/实例）：

<Image img={mongo_atlas_restrict_access} alt="限制集群/实例访问" size="lg" border/>

## 接下来会发生什么？ {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md)，并开始从您的 MongoDB 实例向 ClickHouse Cloud 导入数据。
请确保记下设置 MongoDB 实例时使用的连接详细信息，因为在创建 ClickPipe 的过程中将需要这些信息。

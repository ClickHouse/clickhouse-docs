---
sidebar_label: 'MongoDB Atlas'
description: '将 MongoDB Atlas 配置为 ClickPipes 数据源的分步指南'
slug: /integrations/clickpipes/mongodb/source/atlas
title: 'MongoDB Atlas 数据源配置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---

import mongo_atlas_configuration from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-cluster-overview-configuration.png'
import mngo_atlas_additional_settings from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-expand-additional-settings.png'
import mongo_atlas_retention_hours from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-set-retention-hours.png'
import mongo_atlas_add_user from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-add-new-database-user.png'
import mongo_atlas_add_roles from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-database-user-privilege.png'
import mongo_atlas_restrict_access from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-restrict-access.png'
import Image from '@theme/IdealImage';


# MongoDB Atlas 源配置指南



## 配置 oplog 保留期 {#enable-oplog-retention}

复制功能要求 oplog 保留期至少为 24 小时。我们建议将 oplog 保留期设置为 72 小时或更长,以确保在初始快照完成之前 oplog 不会被截断。通过 UI 设置 oplog 保留期:

1. 在 MongoDB Atlas 控制台中导航到集群的 `Overview` 选项卡,然后点击 `Configuration` 选项卡。

   <Image
     img={mongo_atlas_configuration}
     alt='导航到集群配置'
     size='lg'
     border
   />

2. 点击 `Additional Settings`,然后向下滚动到 `More Configuration Options`。

   <Image
     img={mngo_atlas_additional_settings}
     alt='展开附加设置'
     size='lg'
     border
   />

3. 点击 `More Configuration Options`,将最小 oplog 窗口设置为 `72 hours` 或更长。

   <Image
     img={mongo_atlas_retention_hours}
     alt='设置 oplog 保留小时数'
     size='lg'
     border
   />

4. 点击 `Review Changes` 进行审查,然后点击 `Apply Changes` 部署更改。


## 配置数据库用户 {#configure-database-user}

登录 MongoDB Atlas 控制台后,在左侧导航栏的 Security 选项卡下点击 `Database Access`,然后点击 "Add New Database User"。

ClickPipes 需要密码身份验证:

<Image img={mongo_atlas_add_user} alt='添加数据库用户' size='lg' border />

ClickPipes 需要具有以下角色的用户:

- `readAnyDatabase`
- `clusterMonitor`

您可以在 `Specific Privileges` 部分找到它们:

<Image
  img={mongo_atlas_add_roles}
  alt='配置用户角色'
  size='lg'
  border
/>

您可以进一步指定要授予 ClickPipes 用户访问权限的集群/实例:

<Image
  img={mongo_atlas_restrict_access}
  alt='限制集群/实例访问'
  size='lg'
  border
/>


## 下一步 {#whats-next}

现在您可以[创建 ClickPipe](../index.md) 并开始将 MongoDB 实例中的数据导入到 ClickHouse Cloud。
请务必记录设置 MongoDB 实例时使用的连接详细信息,因为在创建 ClickPipe 过程中需要用到这些信息。

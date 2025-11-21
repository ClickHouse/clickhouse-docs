---
sidebar_label: 'Amazon DocumentDB'
description: '将 Amazon DocumentDB 配置为 ClickPipes 数据源的分步指南'
slug: /integrations/clickpipes/mongodb/source/documentdb
title: 'Amazon DocumentDB 数据源设置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'documentdb', 'cdc', '数据摄取', '实时同步']
---

import docdb_select_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-select-parameter-group.png'
import docdb_modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-modify-parameter-group.png'
import docdb_apply_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-apply-parameter-group.png'
import docdb_parameter_group_status from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-parameter-group-status.png'
import Image from '@theme/IdealImage';


# Amazon DocumentDB 数据源设置指南



## 支持的 DocumentDB 版本 {#supported-documentdb-versions}

ClickPipes 支持 DocumentDB 5.0 版本。


## 配置变更流日志保留期 {#configure-change-stream-log-retention}

默认情况下,Amazon DocumentDB 的变更流日志保留期为 3 小时,而初始加载所需时间可能会更长,具体取决于 DocumentDB 中的现有数据量。我们建议将变更流日志保留期设置为 72 小时或更长,以确保在初始快照完成之前不会被截断。

### 通过 AWS 控制台更新变更流日志保留期 {#update-change-stream-log-retention-via-aws-console}

1. 在左侧面板中点击 `Parameter groups`,找到您的 DocumentDB 集群所使用的参数组(如果您使用的是默认参数组,则需要先创建一个新的参数组才能进行修改)。

   <Image
     img={docdb_select_parameter_group}
     alt='选择参数组'
     size='lg'
     border
   />

2. 搜索 `change_stream_log_retention_duration`,选择并将其编辑为 `259200`(72 小时)

   <Image
     img={docdb_modify_parameter_group}
     alt='修改参数组'
     size='lg'
     border
   />

3. 点击 `Apply Changes` 立即将修改后的参数组应用到您的 DocumentDB 集群。您应该会看到参数组的状态转换为 `applying`,然后在更改应用后转换为 `in-sync`。
   <Image
     img={docdb_apply_parameter_group}
     alt='应用参数组'
     size='lg'
     border
   />

<Image
  img={docdb_parameter_group_status}
  alt='参数组状态'
  size='lg'
  border
/>

### 通过 AWS CLI 更新变更流日志保留期 {#update-change-stream-log-retention-via-aws-cli}

或者,您也可以通过 AWS CLI 进行配置。

检查当前变更流日志保留期:

```shell
aws docdb describe-db-cluster-parameters --db-cluster-parameter-group-name <PARAMETER_GROUP_NAME> --query "Parameters[?ParameterName=='change_stream_log_retention_duration'].{Name:ParameterName,Value:ParameterValue}"
```

将变更流日志保留期设置为 72 小时:

```shell
aws docdb modify-db-cluster-parameter-group --db-cluster-parameter-group-name <PARAMETER_GROUP_NAME> --parameters "ParameterName=change_stream_log_retention_duration,ParameterValue=259200,ApplyMethod=immediate"
```


## 配置数据库用户 {#configure-database-user}

以管理员用户身份连接到您的 DocumentDB 集群，并执行以下命令为 MongoDB CDC ClickPipes 创建数据库用户：

```javascript
db.getSiblingDB("admin").createUser({
  user: "clickpipes_user",
  pwd: "some_secure_password",
  roles: ["readAnyDatabase", "clusterMonitor"]
})
```

:::note
请确保将 `clickpipes_user` 和 `some_secure_password` 替换为您期望使用的用户名和密码。
:::


## 下一步操作 {#whats-next}

现在您可以[创建 ClickPipe](../index.md) 并开始将 DocumentDB 实例中的数据导入到 ClickHouse Cloud。
请务必记录您在设置 DocumentDB 集群时使用的连接详细信息,在创建 ClickPipe 过程中将需要用到这些信息。

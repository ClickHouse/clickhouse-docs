---
sidebar_label: 'Amazon DocumentDB'
description: '分步指南，介绍如何将 Amazon DocumentDB 配置为 ClickPipes 的源'
slug: /integrations/clickpipes/mongodb/source/documentdb
title: 'Amazon DocumentDB 源配置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'documentdb', 'CDC', '数据摄取', '实时同步']
---

import docdb_select_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-select-parameter-group.png'
import docdb_modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-modify-parameter-group.png'
import docdb_apply_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-apply-parameter-group.png'
import docdb_parameter_group_status from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-parameter-group-status.png'
import Image from '@theme/IdealImage';

# Amazon DocumentDB 数据源配置指南 {#amazon-documentdb-source-setup-guide}

## 支持的 DocumentDB 版本 {#supported-documentdb-versions}

ClickPipes 支持 DocumentDB 5.0 版本。

## 配置变更流日志保留期 {#configure-change-stream-log-retention}

默认情况下，Amazon DocumentDB 的变更流日志保留期为 3 小时，而初始加载过程可能会根据 DocumentDB 中现有数据量的不同耗时更长。我们建议将变更流日志保留期设置为 72 小时或更长，以确保在初始快照完成之前日志不会被截断。

### 通过 AWS 控制台更新变更流日志保留期 {#update-change-stream-log-retention-via-aws-console}

1. 在左侧面板中点击 `Parameter groups`，找到您的 DocumentDB 集群所使用的参数组（如果您正在使用默认参数组，则需要先创建一个新的参数组才能进行修改）。

<Image img={docdb_select_parameter_group} alt="选择参数组" size="lg" border />

2. 搜索 `change_stream_log_retention_duration`，选择并将其编辑为 `259200`（72 小时）

<Image img={docdb_modify_parameter_group} alt="修改参数组" size="lg" border />

3. 点击 `Apply Changes` 以立即将修改后的参数组应用到您的 DocumentDB 集群。您应该看到参数组的状态先变为 `applying`，在更改生效后再变为 `in-sync`。

<Image img={docdb_apply_parameter_group} alt="应用参数组" size="lg" border />

<Image img={docdb_parameter_group_status} alt="参数组状态" size="lg" border />

### 通过 AWS CLI 更新变更流日志保留期 {#update-change-stream-log-retention-via-aws-cli}

或者，您也可以通过 AWS CLI 进行配置。

要检查当前的变更流日志保留期：

```shell
aws docdb describe-db-cluster-parameters --db-cluster-parameter-group-name <PARAMETER_GROUP_NAME> --query "Parameters[?ParameterName=='change_stream_log_retention_duration'].{Name:ParameterName,Value:ParameterValue}"
```

要将变更流日志保留时间设置为 72 小时：

```shell
aws docdb modify-db-cluster-parameter-group --db-cluster-parameter-group-name <PARAMETER_GROUP_NAME> --parameters "ParameterName=change_stream_log_retention_duration,ParameterValue=259200,ApplyMethod=immediate"
```

## 配置数据库用户 {#configure-database-user}

以管理员用户身份连接到 DocumentDB 集群，并执行以下命令，为 MongoDB CDC ClickPipes 创建一个数据库用户：

```javascript
db.getSiblingDB("admin").createUser({
    user: "clickpipes_user",
    pwd: "some_secure_password",
    roles: ["readAnyDatabase", "clusterMonitor"],
})
```

:::note
请确保将 `clickpipes_user` 和 `some_secure_password` 替换为你要使用的用户名和密码。
:::

## 接下来 {#whats-next}

现在可以[创建 ClickPipe](../index.md)，并开始将 DocumentDB 实例中的数据摄取到 ClickHouse Cloud 中。
请务必记录下在设置 DocumentDB 集群时使用的连接信息，因为在创建 ClickPipe 的过程中将需要这些信息。

---
sidebar_label: '控制台审计日志'
slug: /cloud/security/audit-logging/console-audit-log
title: '控制台审计日志'
description: '本页介绍用户如何查看云端审计日志'
doc_type: 'guide'
keywords: ['审计日志']
---

import Image from '@theme/IdealImage';
import activity_log_1 from '@site/static/images/cloud/security/activity_log1.png';
import activity_log_2 from '@site/static/images/cloud/security/activity_log2.png';
import activity_log_3 from '@site/static/images/cloud/security/activity_log3.png';


# 控制台审计日志 {#console-audit-log}

用户在控制台中的操作会记录到审计日志中，具有 Admin 或 Developer 组织角色的用户可以查看这些日志并将其与日志系统集成。控制台审计日志中包含的具体事件如下所示 



## 通过用户界面访问控制台日志 {#console-audit-log-ui}

<VerticalStepper>


## 选择组织 {#select-org}

在 ClickHouse Cloud 中，进入您的组织详情页面。

<Image img={activity_log_1} size="md" alt="ClickHouse Cloud activity tab" border />

<br/>



## 选择审计 {#select-audit}

在左侧菜单中选择 **Audit** 选项卡，以查看对你的 ClickHouse Cloud 组织所做的更改，包括是谁进行了更改以及发生的时间。

**Activity** 页面显示一个表格，其中包含与你的组织相关的已记录事件列表。默认情况下，此列表按时间倒序排序（最新事件在最上方）。你可以通过点击列标题来更改表格的排序顺序。表格中的每一项包含以下字段：

- **Activity：** 描述该事件的文本片段
- **User：** 触发该事件的用户
- **IP Address：** 如适用，此字段列出触发该事件用户的 IP 地址
- **Time：** 该事件的时间戳

<Image img={activity_log_2} size="md" alt="ClickHouse Cloud Activity Table" border />

<br/>



## 使用搜索栏 {#use-search-bar}

您可以使用搜索栏根据特定条件(如服务名称或 IP 地址)筛选事件。您还可以将这些信息导出为 CSV 格式,以便分发或在外部工具中进行分析。

</VerticalStepper>

<div class='eighty-percent'>
  <Image
    img={activity_log_3}
    size='lg'
    alt='ClickHouse Cloud 活动日志 CSV 导出'
    border
  />
</div>


## 通过 API 访问控制台审计日志 {#console-audit-log-api}

用户可以使用 ClickHouse Cloud API 的 `activity` 端点来导出审计事件。更多详细信息请参阅 [API 参考](https://clickhouse.com/docs/cloud/manage/api/swagger)。



## 日志集成 {#log-integrations}

用户可以使用 API 与任意日志平台进行集成。当前支持以下开箱即用的连接器：
- [ClickHouse Cloud Splunk 审计附加组件](/integrations/audit-splunk)

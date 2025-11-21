---
sidebar_label: '控制台审计日志'
slug: /cloud/security/audit-logging/console-audit-log
title: '控制台审计日志'
description: '本页面介绍如何查看云审计日志'
doc_type: '指南'
keywords: ['审计日志']
---

import Image from '@theme/IdealImage';
import activity_log_1 from '@site/static/images/cloud/security/activity_log1.png';
import activity_log_2 from '@site/static/images/cloud/security/activity_log2.png';
import activity_log_3 from '@site/static/images/cloud/security/activity_log3.png';


# 控制台审计日志 {#console-audit-log}

用户控制台活动记录在审计日志中，拥有管理员或开发者组织角色的用户可以查看并将其集成到日志系统。控制台审计日志包含的具体事件如下所示


## 通过用户界面访问控制台日志 {#console-audit-log-ui}

<VerticalStepper>


## 选择组织 {#select-org}

在 ClickHouse Cloud 中,导航到您的组织详情页面。

<Image
  img={activity_log_1}
  size='md'
  alt='ClickHouse Cloud 活动选项卡'
  border
/>

<br />


## 选择审计 {#select-audit}

在左侧菜单中选择 **Audit** 选项卡,查看对您的 ClickHouse Cloud 组织所做的更改,包括更改者和更改时间。

**Activity** 页面显示一个表格,其中包含有关您组织的事件日志列表。默认情况下,此列表按时间倒序排列(最新事件在顶部)。单击列标题可更改表格的排序顺序。表格中的每一项包含以下字段:

- **Activity:** 描述事件的文本片段
- **User:** 发起事件的用户
- **IP Address:** 如适用,此字段列出发起事件的用户的 IP 地址
- **Time:** 事件的时间戳

<Image
  img={activity_log_2}
  size='md'
  alt='ClickHouse Cloud 活动表'
  border
/>

<br />


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

用户可以使用 ClickHouse Cloud API 的 `activity` 端点获取审计事件的导出数据。更多详细信息请参阅 [API 参考文档](https://clickhouse.com/docs/cloud/manage/api/swagger)。


## 日志集成 {#log-integrations}

用户可以使用 API 与所选的日志平台进行集成。以下平台支持开箱即用的连接器:

- [ClickHouse Cloud Audit Splunk 插件](/integrations/audit-splunk)

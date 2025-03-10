---
sidebar_label: '审计日志'
slug: '/cloud/security/audit-logging'
title: '审计日志'
---

import activity_log_1 from '@site/static/images/cloud/security/activity_log1.png';
import activity_log_2 from '@site/static/images/cloud/security/activity_log2.png';
import activity_log_3 from '@site/static/images/cloud/security/activity_log3.png';

在 ClickHouse Cloud 中，导航到您的组织详情。

<img src={activity_log_1} alt="ClickHouse Cloud 活动标签" class="image" style={{width: '30%'}}/>

<br/>

在左侧菜单中选择 **审计** 标签，以查看对您的 ClickHouse Cloud 组织所做的更改，包括是谁进行了更改以及更改发生的时间。

**活动** 页面显示一个包含关于您组织的事件日志记录的表格。默认情况下，该列表按倒序排列（最近的事件在顶部）。您可以通过点击列标题来改变表格的排序。表中的每个项目包含以下字段：

- **活动：** 描述事件的文本片段
- **用户：** 发起事件的用户
- **IP 地址：** 在适用的情况下，该字段列出发起事件的用户的 IP 地址
- **时间：** 事件的时间戳

<img src={activity_log_2} alt="ClickHouse Cloud 活动表" />

<br/>

您可以使用提供的搜索栏根据某些标准（例如服务名称或 IP 地址）来隔离事件。您还可以将此信息导出为 CSV 格式，以便在外部工具中进行分发或分析。

<div class="eighty-percent">
    <img src={activity_log_3} alt="ClickHouse Cloud 活动 CSV 导出" />
</div>

## 记录的事件列表 {#list-of-events-logged}

为组织捕获的不同类型事件分为 3 类：**服务**、**组织** 和 **用户**。记录的事件列表包括：

### 服务 {#service}

- 服务创建
- 服务删除
- 服务停止
- 服务启动
- 服务名称更改
- 服务 IP 访问列表更改
- 服务密码重置

### 组织 {#organization}

- 组织创建
- 组织删除
- 组织名称更改

### 用户 {#user}

- 用户角色更改
- 用户从组织中移除
- 用户被邀请加入组织
- 用户加入组织
- 用户邀请被删除
- 用户离开组织

## 审计事件的 API {#api-for-audit-events}

用户可以使用 ClickHouse Cloud API 的 `activity` 端点获取审计事件的导出。更多详细信息可以在 [这里](/cloud/manage/api/organizations-api-reference#list-of-organization-activities) 找到。

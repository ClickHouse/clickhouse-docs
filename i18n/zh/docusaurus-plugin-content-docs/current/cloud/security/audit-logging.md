---
'sidebar_label': '审核日志'
'slug': '/cloud/security/audit-logging'
'title': '审核日志'
'description': '本页面描述了 ClickHouse Cloud 中的审核日志。它解释了如何访问和解释审核日志，这些日志记录了对 ClickHouse
  Cloud 组织所做的更改。'
---

import Image from '@theme/IdealImage';
import activity_log_1 from '@site/static/images/cloud/security/activity_log1.png';
import activity_log_2 from '@site/static/images/cloud/security/activity_log2.png';
import activity_log_3 from '@site/static/images/cloud/security/activity_log3.png';

在 ClickHouse Cloud 中，导航到您的组织详情。

<Image img={activity_log_1} size="md" alt="ClickHouse Cloud 活动选项卡" border />

<br/>

在左侧菜单中选择 **Audit** 选项卡，以查看对您的 ClickHouse Cloud 组织所做的更改，包括是谁进行了更改以及何时发生的更改。

**Activity** 页面显示包含有关您组织的事件日志的表格。默认情况下，该列表按时间倒序排序（最新事件在顶部）。通过点击列标题可以改变表格的排序。表格中的每个项目包含以下字段：

- **Activity:** 描述事件的文本片段
- **User:** 发起事件的用户
- **IP Address:** 如果适用，此字段列出了发起事件的用户的 IP 地址
- **Time:** 事件的时间戳

<Image img={activity_log_2} size="md" alt="ClickHouse Cloud 活动表" border />

<br/>

您可以使用提供的搜索栏根据服务名称或 IP 地址等某些条件来隔离事件。您还可以将此信息以 CSV 格式导出以便分发或在外部工具中进行分析。

<div class="eighty-percent">
    <Image img={activity_log_3} size="lg" alt="ClickHouse Cloud 活动 CSV 导出" border />
</div>

## 记录的事件列表 {#list-of-events-logged}

为组织捕获的不同类型的事件被分为三个类别：**Service**、**Organization** 和 **User**。记录的事件列表包含：

### Service {#service}

- 创建服务
- 删除服务
- 停止服务
- 启动服务
- 更改服务名称
- 更改服务 IP 访问列表
- 重置服务密码

### Organization {#organization}

- 创建组织
- 删除组织
- 更改组织名称

### User {#user}

- 更改用户角色
- 从组织中移除用户
- 邀请用户加入组织
- 用户加入组织
- 删除用户邀请
- 用户离开组织

## 审计事件的 API {#api-for-audit-events}

用户可以使用 ClickHouse Cloud API 的 `activity` 端点来获取审计事件的导出。更多详细信息请参见 [API 参考](https://clickhouse.com/docs/cloud/manage/api/swagger)。

---
'sidebar_label': 'Audit Logging'
'slug': '/cloud/security/audit-logging'
'title': '审计日志'
'description': '本页面描述了 ClickHouse Cloud 中的审计日志。它解释了如何访问和解释审计日志，这些日志记录了对 ClickHouse
  Cloud 组织所做的更改。'
---

import Image from '@theme/IdealImage';
import activity_log_1 from '@site/static/images/cloud/security/activity_log1.png';
import activity_log_2 from '@site/static/images/cloud/security/activity_log2.png';
import activity_log_3 from '@site/static/images/cloud/security/activity_log3.png';

在 ClickHouse Cloud 中，导航到您的组织详情。

<Image img={activity_log_1} size="md" alt="ClickHouse Cloud activity tab" border />

<br/>

在左侧菜单中选择 **Audit** 标签，以查看对您的 ClickHouse Cloud 组织所做的更改 - 包括谁做的更改及其发生的时间。

**Activity** 页面显示包含关于您组织的事件列表的表格。默认情况下，此列表按时间倒序排列（最新事件在顶部）。通过点击列标题更改表格的排序。表格中的每个项目包含以下字段：

- **Activity:** 描述事件的文本片段
- **User:** 发起事件的用户
- **IP Address:** 如果适用，此字段列出发起事件的用户的 IP 地址
- **Time:** 事件的时间戳

<Image img={activity_log_2} size="md" alt="ClickHouse Cloud Activity Table" border />

<br/>

您可以使用提供的搜索栏根据某些标准（例如服务名称或 IP 地址）隔离事件。您还可以将此信息导出为 CSV 格式，以便在外部工具中分发或分析。

<div class="eighty-percent">
    <Image img={activity_log_3} size="lg" alt="ClickHouse Cloud Activity CSV export" border />
</div>

## 记录的事件列表 {#list-of-events-logged}

为组织捕获的不同类型事件被分为 3 类：**Service**、**Organization** 和 **User**。记录的事件列表包含：

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

用户可以使用 ClickHouse Cloud API `activity` 端点获取审计事件的导出。更多详细信息请参考 [API reference](https://clickhouse.com/docs/cloud/manage/api/swagger)。

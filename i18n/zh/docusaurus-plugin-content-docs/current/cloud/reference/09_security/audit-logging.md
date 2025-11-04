---
'sidebar_label': '审计日志'
'slug': '/cloud/security/audit-logging'
'title': '审计日志'
'description': '此页面描述了ClickHouse Cloud中的审计日志。它解释了如何访问和解读审计日志，这些日志记录了对ClickHouse Cloud组织所做的更改。'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import activity_log_1 from '@site/static/images/cloud/security/activity_log1.png';
import activity_log_2 from '@site/static/images/cloud/security/activity_log2.png';
import activity_log_3 from '@site/static/images/cloud/security/activity_log3.png';

在 ClickHouse Cloud 中，导航到您的组织详情。

<Image img={activity_log_1} size="md" alt="ClickHouse Cloud activity tab" border />

<br/>

在左侧菜单中选择 **Audit** 选项卡，以查看对您的 ClickHouse Cloud 组织所做的更改，包括更改的执行者及其发生的时间。

**Activity** 页面显示一个包含关于您组织的事件日志的表格。默认情况下，此列表按逆时间顺序排序（最新事件在顶部）。通过点击列标题可以更改表格的顺序。表格的每个条目包含以下字段：

- **Activity:** 描述事件的文本片段
- **User:** 发起事件的用户
- **IP Address:** 如果适用，此字段列出发起事件的用户的 IP 地址
- **Time:** 事件的时间戳

<Image img={activity_log_2} size="md" alt="ClickHouse Cloud Activity Table" border />

<br/>

您可以使用提供的搜索栏根据某些标准（如服务名称或 IP 地址）来隔离事件。您还可以将此信息导出为 CSV 格式，以便在外部工具中进行分发或分析。

<div class="eighty-percent">
    <Image img={activity_log_3} size="lg" alt="ClickHouse Cloud Activity CSV export" border />
</div>

## 记录的事件列表 {#list-of-events-logged}

为组织捕获的不同类型事件分为三个类别：**Service**、**Organization** 和 **User**。记录的事件列表包括：

### Service {#service}

- 创建服务
- 删除服务
- 停止服务
- 启动服务
- 服务名称更改
- 服务 IP 访问列表更改
- 服务密码重置

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

用户可以使用 ClickHouse Cloud API 的 `activity` 端点获取审计事件的导出。详细信息请参阅 [API reference](https://clickhouse.com/docs/cloud/manage/api/swagger)。

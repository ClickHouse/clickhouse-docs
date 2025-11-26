---
sidebar_label: '控制台审计日志事件'
slug: /cloud/security/audit-logging
title: '控制台审计日志事件'
description: '本页介绍记录到控制台审计日志中的事件。'
doc_type: 'reference'
keywords: ['审计日志', '安全', '合规', '日志', '监控']
---



## 控制台审计日志事件 {#console-audit-log-events}

为组织记录的不同类型事件分为 3 类：**Organization**、**Service** 和 **User**。有关审计日志以及如何导出或添加 API 集成的更多信息，请查看上方“指南”（Guides）部分中的[控制台审计日志](/cloud/security/audit-logging/console-audit-log)文档。

以下事件会记录到审计日志中。

### Organization {#organization}

- 创建组织
- 删除组织
- 修改组织名称

### Service {#service}

- 创建服务
- 删除服务
- 停止服务
- 启动服务
- 修改服务名称
- 修改服务 IP 访问列表
- 重置服务密码

### User {#user}

- 更改用户角色
- 将用户从组织中移除
- 邀请用户加入组织
- 用户加入组织
- 删除用户邀请
- 用户离开组织

---
sidebar_label: 'Splunk'
slug: /integrations/audit-splunk
keywords: ['clickhouse', 'Splunk', 'audit', 'cloud']
description: '在 Splunk 中存储 ClickHouse Cloud 审计日志。'
title: '在 Splunk 中存储 ClickHouse Cloud 审计日志'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import splunk_001 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_001.png';
import splunk_002 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_002.png';
import splunk_003 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_003.png';
import splunk_004 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_004.png';
import splunk_005 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_005.png';
import splunk_006 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_006.png';
import splunk_007 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_007.png';
import splunk_008 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_008.png';
import splunk_009 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_009.png';
import splunk_010 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_010.png';
import splunk_011 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_011.png';
import splunk_012 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_012.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# 将 ClickHouse Cloud 审计日志存储到 Splunk 中 \{#storing-clickhouse-cloud-audit-logs-into-splunk\}

<PartnerBadge/>

[Splunk](https://www.splunk.com/) 是一个数据分析和监控平台。

此附加组件允许您将 [ClickHouse Cloud 审计日志](/cloud/security/audit-logging) 存储到 Splunk 中。它通过 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 下载审计日志。

此附加组件仅包含模块化输入，不提供任何额外的 UI。

# 安装 \\{#installation\\}

## 适用于 Splunk Enterprise \\{#for-splunk-enterprise\\}

从 [Splunkbase](https://splunkbase.splunk.com/app/7709) 下载 ClickHouse Cloud Audit Add-on for Splunk。

<Image img={splunk_001} size="lg" alt="Splunkbase 网站，展示 ClickHouse Cloud Audit Add-on for Splunk 的下载页面" border />

在 Splunk Enterprise 中，依次进入 Apps -> Manage，然后单击“Install app from file”。

<Image img={splunk_002} size="lg" alt="Splunk Enterprise 界面，展示带有“Install app from file”选项的 Apps 管理页面" border />

选择从 Splunkbase 下载的压缩包文件并单击“Upload”。

<Image img={splunk_003} size="lg" alt="用于上传 ClickHouse 插件的 Splunk 应用安装对话框" border />

如果一切正常，此时应能看到已安装的 ClickHouse Audit logs 应用。否则，请检查 Splunkd 日志以定位错误。

# 模块化输入配置 \\{#modular-input-configuration\\}

要配置模块化输入，首先需要从您的 ClickHouse Cloud 部署中获取以下信息：

- 组织 ID
- 管理员 [API Key](/cloud/manage/openapi)

## 从 ClickHouse Cloud 获取信息 \\{#getting-information-from-clickhouse-cloud\\}

登录 [ClickHouse Cloud 控制台](https://console.clickhouse.cloud/)。

进入你的 Organization -> Organization details。在该页面可以复制 Organization ID。

<Image img={splunk_004} size="lg" alt="ClickHouse Cloud 控制台展示包含 Organization ID 的 Organization details 页面" border />

然后，从左侧菜单中选择 API Keys。

<Image img={splunk_005} size="lg" alt="ClickHouse Cloud 控制台展示左侧导航菜单中的 API Keys 部分" border />

创建一个 API Key，为其指定一个有意义的名称，并选择 `Admin` 权限。点击 Generate API Key。

<Image img={splunk_006} size="lg" alt="ClickHouse Cloud 控制台展示已选择 Admin 权限的 API Key 创建界面" border />

将 API Key 和 secret 保存在安全的位置。

<Image img={splunk_007} size="lg" alt="ClickHouse Cloud 控制台展示需要保存的已生成 API Key 和 secret" border />

## 在 Splunk 中配置数据输入 \\{#configure-data-input-in-splunk\\}

回到 Splunk，依次进入 Settings -> Data inputs。

<Image img={splunk_008} size="lg" alt="Splunk 界面中显示包含 Data inputs 选项的 Settings 菜单" border />

选择 ClickHouse Cloud Audit Logs 数据输入。

<Image img={splunk_009} size="lg" alt="Splunk Data inputs 页面中显示 ClickHouse Cloud Audit Logs 选项" border />

点击 "New" 来配置一个新的数据输入实例。

<Image img={splunk_010} size="lg" alt="用于配置新的 ClickHouse Cloud Audit Logs 数据输入的 Splunk 界面" border />

填写完所有信息后，点击 "Next"。

<Image img={splunk_011} size="lg" alt="已完成 ClickHouse 数据输入设置的 Splunk 配置页面" border />

数据输入已配置完成，现在可以开始浏览审计日志。

# 用法 \\{#usage\\}

模块化输入会将数据存储在 Splunk 中。要查看这些数据，可以在 Splunk 中使用通用搜索视图。

<Image img={splunk_012} size="lg" alt="Splunk 搜索界面展示 ClickHouse 审计日志数据" border />
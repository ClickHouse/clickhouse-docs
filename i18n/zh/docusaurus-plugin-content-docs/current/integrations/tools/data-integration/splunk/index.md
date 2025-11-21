---
sidebar_label: 'Splunk'
slug: /integrations/audit-splunk
keywords: ['clickhouse', 'Splunk', 'audit', 'cloud']
description: '将 ClickHouse Cloud 审计日志存入 Splunk。'
title: '将 ClickHouse Cloud 审计日志存入 Splunk'
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


# 将 ClickHouse Cloud 审计日志存储到 Splunk

<PartnerBadge/>

[Splunk](https://www.splunk.com/) 是一个数据分析与监控平台。

此附加组件允许用户将 [ClickHouse Cloud 审计日志](/cloud/security/audit-logging) 存储到 Splunk 中。它使用 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 下载审计日志。

此附加组件仅包含一个模块化输入，不提供任何额外的 UI 界面。



# 安装



## 适用于 Splunk Enterprise {#for-splunk-enterprise}

从 [Splunkbase](https://splunkbase.splunk.com/app/7709) 下载适用于 Splunk 的 ClickHouse Cloud Audit 附加组件。

<Image
  img={splunk_001}
  size='lg'
  alt='Splunkbase 网站显示 ClickHouse Cloud Audit Add-on for Splunk 下载页面'
  border
/>

在 Splunk Enterprise 中,导航至 Apps -> Manage,然后点击 Install app from file。

<Image
  img={splunk_002}
  size='lg'
  alt='Splunk Enterprise 界面显示应用管理页面及 Install app from file 选项'
  border
/>

选择从 Splunkbase 下载的归档文件,然后点击 Upload。

<Image
  img={splunk_003}
  size='lg'
  alt='用于上传 ClickHouse 附加组件的 Splunk 应用安装对话框'
  border
/>

如果一切顺利,您现在应该能看到 ClickHouse Audit logs 应用已安装。如果未成功安装,请查阅 Splunkd 日志以排查错误。


# 模块化输入配置

要配置模块化输入，首先需要从 ClickHouse Cloud 部署中获取以下信息：

- 组织 ID
- 管理员 [API 密钥](/cloud/manage/openapi)



## 从 ClickHouse Cloud 获取信息 {#getting-information-from-clickhouse-cloud}

登录 [ClickHouse Cloud 控制台](https://console.clickhouse.cloud/)。

导航至您的组织 -> 组织详情。您可以在此处复制组织 ID。

<Image
  img={splunk_004}
  size='lg'
  alt='ClickHouse Cloud 控制台显示组织详情页面及组织 ID'
  border
/>

然后,从左侧菜单导航至 API 密钥。

<Image
  img={splunk_005}
  size='lg'
  alt='ClickHouse Cloud 控制台显示左侧导航菜单中的 API 密钥部分'
  border
/>

创建一个 API 密钥,为其指定一个有意义的名称并选择 `Admin` 权限。点击生成 API 密钥。

<Image
  img={splunk_006}
  size='lg'
  alt='ClickHouse Cloud 控制台显示 API 密钥创建界面,已选择管理员权限'
  border
/>

将 API 密钥和密文保存在安全的地方。

<Image
  img={splunk_007}
  size='lg'
  alt='ClickHouse Cloud 控制台显示生成的 API 密钥和密文以供保存'
  border
/>


## 在 Splunk 中配置数据输入 {#configure-data-input-in-splunk}

返回 Splunk,导航至 Settings -> Data inputs。

<Image
  img={splunk_008}
  size='lg'
  alt='Splunk 界面显示带有 Data inputs 选项的 Settings 菜单'
  border
/>

选择 ClickHouse Cloud Audit Logs 数据输入。

<Image
  img={splunk_009}
  size='lg'
  alt='Splunk Data inputs 页面显示 ClickHouse Cloud Audit Logs 选项'
  border
/>

点击"New"配置新的数据输入实例。

<Image
  img={splunk_010}
  size='lg'
  alt='用于配置新 ClickHouse Cloud Audit Logs 数据输入的 Splunk 界面'
  border
/>

输入所有信息后,点击 Next。

<Image
  img={splunk_011}
  size='lg'
  alt='显示已完成 ClickHouse 数据输入设置的 Splunk 配置页面'
  border
/>

数据输入配置完成,您现在可以开始浏览审计日志。


# 使用方法

模块化输入会将数据存储在 Splunk 中。要查看这些数据，可以在 Splunk 中使用通用搜索视图进行查看。

<Image img={splunk_012} size="lg" alt="Splunk 搜索界面显示 ClickHouse 审计日志数据" border />

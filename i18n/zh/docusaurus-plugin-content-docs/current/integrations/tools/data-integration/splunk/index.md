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


# 将 ClickHouse Cloud 审计日志存储到 Splunk

<PartnerBadge/>

[Splunk](https://www.splunk.com/) 是一款数据分析与监控平台。

此附加组件允许用户将 [ClickHouse Cloud 审计日志](/cloud/security/audit-logging) 存储到 Splunk 中。它通过 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 下载审计日志。

此附加组件仅包含一个模块化输入，不提供任何额外的 UI。



# 安装



## 适用于 Splunk Enterprise {#for-splunk-enterprise}

从 [Splunkbase](https://splunkbase.splunk.com/app/7709) 下载适用于 Splunk 的 ClickHouse Cloud 审计插件。

<Image
  img={splunk_001}
  size='lg'
  alt='Splunkbase 网站显示 ClickHouse Cloud 审计插件的 Splunk 下载页面'
  border
/>

在 Splunk Enterprise 中,导航至"应用" -> "管理"。然后点击"从文件安装应用"。

<Image
  img={splunk_002}
  size='lg'
  alt='Splunk Enterprise 界面显示应用管理页面及"从文件安装应用"选项'
  border
/>

选择从 Splunkbase 下载的压缩文件,然后点击"上传"。

<Image
  img={splunk_003}
  size='lg'
  alt='用于上传 ClickHouse 插件的 Splunk 应用安装对话框'
  border
/>

如果一切顺利,您现在应该能看到 ClickHouse 审计日志应用已安装。如果没有,请查阅 Splunkd 日志以排查错误。


# 模块化输入配置

要配置模块化输入，首先需要从 ClickHouse Cloud 部署中获取以下信息：

- 组织 ID
- 管理员 [API Key](/cloud/manage/openapi)



## 从 ClickHouse Cloud 获取信息 {#getting-information-from-clickhouse-cloud}

登录 [ClickHouse Cloud 控制台](https://console.clickhouse.cloud/)。

导航至您的组织 -> 组织详情。在此页面可以复制组织 ID。

<Image
  img={splunk_004}
  size='lg'
  alt='ClickHouse Cloud 控制台显示包含组织 ID 的组织详情页面'
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
  alt='ClickHouse Cloud 控制台显示已选择管理员权限的 API 密钥创建界面'
  border
/>

将 API 密钥和密文保存在安全的地方。

<Image
  img={splunk_007}
  size='lg'
  alt='ClickHouse Cloud 控制台显示需要保存的已生成 API 密钥和密文'
  border
/>


## 在 Splunk 中配置数据输入 {#configure-data-input-in-splunk}

返回 Splunk,导航至 Settings -> Data inputs。

<Image
  img={splunk_008}
  size='lg'
  alt='Splunk 界面显示 Settings 菜单和 Data inputs 选项'
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

数据输入配置完成,现在可以开始浏览审计日志。


# 使用方法

模块化输入会将数据存储在 Splunk 中。要查看这些数据，可以在 Splunk 中使用通用搜索视图。

<Image img={splunk_012} size="lg" alt="显示 ClickHouse 审计日志数据的 Splunk 搜索界面" border />

---
sidebar_label: Splunk
slug: /integrations/audit-splunk
keywords: [clickhouse, Splunk, audit, cloud]
description: 将 ClickHouse Cloud 审计日志存储到 Splunk 中。
---

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



# 将 ClickHouse Cloud 审计日志存储到 Splunk

[Splunk](https://www.splunk.com/) 是一个数据分析和监控平台。

此附加组件允许用户将 [ClickHouse Cloud 审计日志](/cloud/security/audit-logging) 存储到 Splunk 中。它使用 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 下载审计日志。

此附加组件仅包含一个模块化输入，不提供额外的用户界面。


# 安装

## 对于 Splunk Enterprise {#for-splunk-enterprise}

从 [Splunkbase](https://splunkbase.splunk.com/app/7709) 下载 ClickHouse Cloud 审计附加组件。

<img src={splunk_001} className="image" alt="从 Splunkbase 下载" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

在 Splunk Enterprise 中，导航到 应用 -> 管理。然后点击 从文件安装应用。

<img src={splunk_002} className="image" alt="管理应用" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

选择从 Splunkbase 下载的压缩文件并点击 上传。

<img src={splunk_003} className="image" alt="管理应用" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

如果一切顺利，您现在应该看到 ClickHouse 审计日志应用程序已安装。如果没有，请检查 Splunkd 日志以查找任何错误。


# 模块化输入配置

要配置模块化输入，您首先需要您的 ClickHouse Cloud 部署中的信息：

- 组织 ID
- 管理员 [API 密钥](/cloud/manage/openapi)

## 从 ClickHouse Cloud 获取信息 {#getting-information-from-clickhouse-cloud}

登录到 [ClickHouse Cloud 控制台](https://console.clickhouse.cloud/)。

导航到您的组织 -> 组织详细信息。在那里您可以复制组织 ID。

<img src={splunk_004} className="image" alt="管理应用" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

然后，从左侧菜单导航到 API 密钥。

<img src={splunk_005} className="image" alt="管理应用" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

创建一个 API 密钥，给它一个有意义的名称，并选择 `管理员` 权限。点击 生成 API 密钥。

<img src={splunk_006} className="image" alt="管理应用" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

将 API 密钥和密钥安全地保存到某个地方。

<img src={splunk_007} className="image" alt="管理应用" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

## 在 Splunk 中配置数据输入 {#configure-data-input-in-splunk}

返回 Splunk，导航到 设置 -> 数据输入。

<img src={splunk_008} className="image" alt="管理应用" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

选择 ClickHouse Cloud 审计日志数据输入。

<img src={splunk_009} className="image" alt="管理应用" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

点击 "新建" 来配置新的数据输入实例。

<img src={splunk_010} className="image" alt="管理应用" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

输入所有信息后，点击 下一步。

<img src={splunk_011} className="image" alt="管理应用" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

输入已配置，您可以开始浏览审计日志。


# 用法

模块化输入将数据存储在 Splunk 中。要查看数据，您可以使用 Splunk 中的一般搜索视图。

<img src={splunk_012} className="image" alt="管理应用" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

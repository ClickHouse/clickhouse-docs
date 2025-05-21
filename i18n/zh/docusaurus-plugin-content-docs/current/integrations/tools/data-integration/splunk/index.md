---
'sidebar_label': 'Splunk'
'slug': '/integrations/audit-splunk'
'keywords':
- 'clickhouse'
- 'Splunk'
- 'audit'
- 'cloud'
'description': 'Store ClickHouse Cloud audit logs into Splunk.'
'title': 'Storing ClickHouse Cloud Audit logs into Splunk'
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
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 将 ClickHouse Cloud 审计日志存储到 Splunk

<ClickHouseSupportedBadge/>

[Splunk](https://www.splunk.com/) 是一个数据分析和监控平台。

该附加组件允许用户将 [ClickHouse Cloud 审计日志](/cloud/security/audit-logging) 存储到 Splunk。它使用 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 下载审计日志。

该附加组件仅包含一个模块化输入，不提供其他用户界面。


# 安装

## 对于 Splunk Enterprise {#for-splunk-enterprise}

从 [Splunkbase](https://splunkbase.splunk.com/app/7709) 下载 ClickHouse Cloud 审计附加组件。

<Image img={splunk_001} size="lg" alt="Splunkbase 网站显示 ClickHouse Cloud 审计附加组件的下载页面" border />

在 Splunk Enterprise 中，导航至 Apps -> Manage。然后点击从文件安装应用程序。

<Image img={splunk_002} size="lg" alt="Splunk Enterprise 界面显示应用程序管理页面，包含从文件安装应用的选项" border />

选择从 Splunkbase 下载的压缩文件，然后点击上传。

<Image img={splunk_003} size="lg" alt="Splunk 应用安装对话框用于上传 ClickHouse 附加组件" border />

如果一切顺利，您现在应该看到 ClickHouse 审计日志应用程序已安装。如果没有，请查阅 Splunkd 日志以获取错误信息。


# 模块化输入配置

要配置模块化输入，您首先需要从 ClickHouse Cloud 部署获取信息：

- 组织 ID
- 一个管理员 [API Key](/cloud/manage/openapi)

## 获取 ClickHouse Cloud 中的信息 {#getting-information-from-clickhouse-cloud}

登录到 [ClickHouse Cloud 控制台](https://console.clickhouse.cloud/)。

导航至您的组织 -> 组织详细信息。在那里您可以复制组织 ID。

<Image img={splunk_004} size="lg" alt="ClickHouse Cloud 控制台显示组织详细信息页面及组织 ID" border />

然后，从左侧菜单导航至 API Keys。

<Image img={splunk_005} size="lg" alt="ClickHouse Cloud 控制台显示左侧导航菜单中的 API Keys 部分" border />

创建一个 API Key，给它一个有意义的名称，并选择 `Admin` 权限。点击生成 API Key。

<Image img={splunk_006} size="lg" alt="ClickHouse Cloud 控制台显示选择 Admin 权限的 API Key 创建界面" border />

将 API Key 和密钥保存到安全的位置。

<Image img={splunk_007} size="lg" alt="ClickHouse Cloud 控制台显示生成的 API Key 和密钥" border />

## 在 Splunk 中配置数据输入 {#configure-data-input-in-splunk}

返回到 Splunk，导航至 Settings -> Data inputs。

<Image img={splunk_008} size="lg" alt="Splunk 界面显示包含数据输入选项的设置菜单" border />

选择 ClickHouse Cloud 审计日志数据输入。

<Image img={splunk_009} size="lg" alt="Splunk 数据输入页面显示 ClickHouse Cloud 审计日志选项" border />

点击“新建”以配置数据输入的新实例。

<Image img={splunk_010} size="lg" alt="Splunk 界面用于配置新的 ClickHouse Cloud 审计日志数据输入" border />

输入所有信息后，点击下一步。

<Image img={splunk_011} size="lg" alt="Splunk 配置页面显示完成的 ClickHouse 数据输入设置" border />

输入已配置，可以开始浏览审计日志。


# 使用

模块化输入将数据存储在 Splunk 中。要查看数据，您可以使用 Splunk 中的一般搜索视图。

<Image img={splunk_012} size="lg" alt="Splunk 搜索界面显示 ClickHouse 审计日志数据" border />

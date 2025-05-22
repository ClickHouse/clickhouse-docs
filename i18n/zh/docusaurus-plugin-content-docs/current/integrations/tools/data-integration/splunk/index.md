---
'sidebar_label': 'Splunk'
'slug': '/integrations/audit-splunk'
'keywords':
- 'clickhouse'
- 'Splunk'
- 'audit'
- 'cloud'
'description': '将 ClickHouse Cloud 审计日志存储到 Splunk。'
'title': '将 ClickHouse Cloud 审计日志存储到 Splunk'
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

此附加组件允许用户将 [ClickHouse Cloud 审计日志](/cloud/security/audit-logging) 存储到 Splunk。它使用 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 下载审计日志。

此附加组件仅包含一个模块化输入，不提供其他 UI。


# 安装

## 对于 Splunk Enterprise {#for-splunk-enterprise}

从 [Splunkbase](https://splunkbase.splunk.com/app/7709) 下载适用于 Splunk 的 ClickHouse Cloud 审计附加组件。

<Image img={splunk_001} size="lg" alt="Splunkbase 网站展示 ClickHouse Cloud 审计附加组件下载页面" border />

在 Splunk Enterprise 中，导航到应用 -> 管理。然后点击从文件安装应用。

<Image img={splunk_002} size="lg" alt="Splunk Enterprise 界面展示应用管理页面，带有从文件安装应用的选项" border />

选择从 Splunkbase 下载的压缩文件，然后点击上传。

<Image img={splunk_003} size="lg" alt="Splunk 应用安装对话框，用于上传 ClickHouse 附加组件" border />

如果一切顺利，您现在应该看到已安装 ClickHouse 审计日志应用。如果没有，请查阅 Splunkd 日志以获取任何错误。


# 模块化输入配置

要配置模块化输入，您首先需要从 ClickHouse Cloud 部署获取信息：

- 组织 ID
- 一个管理员 [API 密钥](/cloud/manage/openapi)

## 从 ClickHouse Cloud 获取信息 {#getting-information-from-clickhouse-cloud}

登录到 [ClickHouse Cloud 控制台](https://console.clickhouse.cloud/)。

导航到您的组织 -> 组织详情。在那里，您可以复制组织 ID。

<Image img={splunk_004} size="lg" alt="ClickHouse Cloud 控制台展示组织详情页面，带有组织 ID" border />

然后，从左侧菜单导航到 API 密钥。

<Image img={splunk_005} size="lg" alt="ClickHouse Cloud 控制台展示左侧导航菜单中的 API 密钥部分" border />

创建一个 API 密钥，给出一个有意义的名称并选择 `Admin` 权限。点击生成 API 密钥。

<Image img={splunk_006} size="lg" alt="ClickHouse Cloud 控制台展示 API 密钥创建界面，选择了 Admin 权限" border />

将 API 密钥和秘密保存在安全的地方。

<Image img={splunk_007} size="lg" alt="ClickHouse Cloud 控制台展示生成的 API 密钥和需要保存的秘密" border />

## 在 Splunk 中配置数据输入 {#configure-data-input-in-splunk}

回到 Splunk，导航到设置 -> 数据输入。

<Image img={splunk_008} size="lg" alt="Splunk 界面展示设置菜单，带有数据输入选项" border />

选择 ClickHouse Cloud 审计日志数据输入。

<Image img={splunk_009} size="lg" alt="Splunk 数据输入页面展示 ClickHouse Cloud 审计日志选项" border />

点击 "新建" 以配置数据输入的新实例。

<Image img={splunk_010} size="lg" alt="Splunk 界面用于配置新的 ClickHouse Cloud 审计日志数据输入" border />

输入所有信息后，点击下一步。

<Image img={splunk_011} size="lg" alt="Splunk 配置页面，完成 ClickHouse 数据输入设置" border />

输入已配置，您可以开始浏览审计日志。


# 使用

此模块化输入将数据存储在 Splunk 中。要查看数据，您可以使用 Splunk 中的常规搜索视图。

<Image img={splunk_012} size="lg" alt="Splunk 搜索界面显示 ClickHouse 审计日志数据" border />

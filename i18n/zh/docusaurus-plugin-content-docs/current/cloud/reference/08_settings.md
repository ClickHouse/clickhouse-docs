---
'sidebar_label': '配置设置'
'slug': '/manage/settings'
'title': '配置设置'
'description': '如何为特定用户或角色配置您的 ClickHouse Cloud 服务的设置'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import cloud_settings_sidebar from '@site/static/images/cloud/manage/cloud-settings-sidebar.png';


# 配置设置

要为特定的 [用户](/operations/access-rights#user-account-management) 或 [角色](/operations/access-rights#role-management) 指定 ClickHouse Cloud 服务的设置，您必须使用 [基于 SQL 的设置配置文件](/operations/access-rights#settings-profiles-management)。应用设置配置文件可确保您配置的设置在服务停止、空闲和升级时依然有效。要了解有关设置配置文件的更多信息，请参阅 [此页面](/operations/settings/settings-profiles.md)。

请注意，基于 XML 的设置配置文件和 [配置文件](/operations/configuration-files.md) 当前不支持 ClickHouse Cloud。

要了解您可以为 ClickHouse Cloud 服务指定的设置，请在 [我们的文档](/operations/settings) 中查看按类别列出的所有可能设置。

<Image img={cloud_settings_sidebar} size="sm" alt="Cloud settings sidebar" border/>

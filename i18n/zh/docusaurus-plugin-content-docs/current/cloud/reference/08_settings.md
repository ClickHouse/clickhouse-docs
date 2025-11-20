---
sidebar_label: '配置设置'
slug: /manage/settings
title: '配置设置'
description: '如何为特定用户或角色配置 ClickHouse Cloud 服务的设置'
keywords: ['ClickHouse Cloud', 'settings configuration', 'cloud settings', 'user settings', 'role settings']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import cloud_settings_sidebar from '@site/static/images/cloud/manage/cloud-settings-sidebar.png';


# 配置设置

若要为特定的 [用户](/operations/access-rights#user-account-management) 或 [角色](/operations/access-rights#role-management) 指定 ClickHouse Cloud 服务的设置，必须使用 [基于 SQL 的 Settings Profiles](/operations/access-rights#settings-profiles-management)。应用 Settings Profiles 可以确保您配置的设置在服务停止、空闲或升级时依然保持不变。要了解有关 Settings Profiles 的更多信息，请参阅[本页](/operations/settings/settings-profiles.md)。

请注意，基于 XML 的 Settings Profiles 和[配置文件](/operations/configuration-files.md) 目前在 ClickHouse Cloud 中尚不受支持。

要了解可以为 ClickHouse Cloud 服务指定的更多设置，请在[我们的文档](/operations/settings)中按类别查看所有可用设置。

<Image img={cloud_settings_sidebar} size="sm" alt="Cloud settings sidebar" border/>
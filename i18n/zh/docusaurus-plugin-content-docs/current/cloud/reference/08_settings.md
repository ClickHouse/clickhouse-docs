---
sidebar_label: '配置参数'
slug: /manage/settings
title: '配置参数'
description: '如何为特定用户或角色配置 ClickHouse Cloud 服务参数'
keywords: ['ClickHouse Cloud', '配置参数', '云端参数', '用户参数', '角色参数']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import cloud_settings_sidebar from '@site/static/images/cloud/manage/cloud-settings-sidebar.png';


# 配置设置

要为特定的[用户](/operations/access-rights#user-account-management)或[角色](/operations/access-rights#role-management)配置 ClickHouse Cloud 服务的设置，必须使用[基于 SQL 的 Settings Profile](/operations/access-rights#settings-profiles-management)。应用 Settings Profile 可以确保你配置的设置在服务停止、空闲或升级时仍然保持不变。要了解有关 Settings Profile 的更多信息，请参阅[此页面](/operations/settings/settings-profiles.md)。

请注意，ClickHouse Cloud 目前不支持基于 XML 的 Settings Profile 和[配置文件](/operations/configuration-files.md)。

要了解可以为 ClickHouse Cloud 服务配置哪些设置，请在[我们的文档](/operations/settings)中按类别查看所有可用设置。

<Image img={cloud_settings_sidebar} size="sm" alt="Cloud settings sidebar" border/>
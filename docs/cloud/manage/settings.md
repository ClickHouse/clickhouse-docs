---
sidebar_label: 'Configuring Settings'
slug: /manage/settings
title: 'Configuring Settings'
description: 'How to configure settings for your ClickHouse Cloud service for a specific user or role'
---

import Image from '@theme/IdealImage';
import cloud_settings_sidebar from '@site/static/images/cloud/manage/cloud-settings-sidebar.png';

# Configuring settings

To specify settings for your ClickHouse Cloud service for a specific [user](/operations/access-rights#user-account-management) or [role](/operations/access-rights#role-management), you must use [SQL-driven Settings Profiles](/operations/access-rights#settings-profiles-management). Applying Settings Profiles ensures that the settings you configure persist, even when your services stop, idle, and upgrade. To learn more about Settings Profiles, please see [this page](/operations/settings/settings-profiles.md).

Please note that XML-based Settings Profiles and [configuration files](/operations/configuration-files.md) are currently not supported for ClickHouse Cloud.

To learn more about the settings you can specify for your ClickHouse Cloud service, please see all possible settings by category in [our docs](/operations/settings).

<Image img={cloud_settings_sidebar} size="sm" alt="Cloud settings sidebar" border/>

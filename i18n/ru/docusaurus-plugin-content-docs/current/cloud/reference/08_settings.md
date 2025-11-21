---
sidebar_label: 'Настройка параметров'
slug: /manage/settings
title: 'Настройка параметров'
description: 'Как настроить параметры сервиса ClickHouse Cloud для конкретного пользователя или роли'
keywords: ['ClickHouse Cloud', 'настройка параметров', 'облачные настройки', 'пользовательские настройки', 'настройки ролей']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import cloud_settings_sidebar from '@site/static/images/cloud/manage/cloud-settings-sidebar.png';


# Настройка параметров

Чтобы задать параметры для вашего сервиса ClickHouse Cloud для конкретного [пользователя](/operations/access-rights#user-account-management) или [роли](/operations/access-rights#role-management), необходимо использовать [профили настроек на основе SQL](/operations/access-rights#settings-profiles-management). Применение профилей настроек гарантирует, что настроенные вами параметры сохраняются даже при остановке, простое и обновлении ваших сервисов. Чтобы узнать больше о профилях настроек, обратитесь к [этой странице](/operations/settings/settings-profiles.md).

Обратите внимание, что профили настроек на основе XML и [файлы конфигурации](/operations/configuration-files.md) в данный момент не поддерживаются в ClickHouse Cloud.

Чтобы узнать больше о параметрах, которые можно задать для вашего сервиса ClickHouse Cloud, ознакомьтесь с полным перечнем возможных настроек по категориям в [нашей документации](/operations/settings).

<Image img={cloud_settings_sidebar} size="sm" alt="Боковая панель настроек в Cloud" border/>
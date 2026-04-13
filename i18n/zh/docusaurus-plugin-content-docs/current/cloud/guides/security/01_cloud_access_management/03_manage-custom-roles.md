---
sidebar_label: '管理自定义角色'
slug: /cloud/guides/security/manage-custom-roles
title: '管理自定义角色'
description: '本页面介绍管理员如何添加、修改和删除自定义角色'
doc_type: 'guide'
keywords: ['自定义角色', '安全', '权限']
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/control_plane/1_users_and_roles.png'
import step_2 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/2_custom_role.png'
import step_3 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/3_custom_role.png'
import step_4 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/4_custom_role.png'
import step_5 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/5_custom_role.png'
import step_6 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/6_custom_role.png'

这个指南适用于在 ClickHouse Cloud 中拥有 Admin 角色的用户。

ClickHouse Cloud 客户可以选择预定义的系统角色，也可以创建自定义角色并将其分配给用户。有关系统角色及其对应权限的更多信息，请参阅 [控制台角色和权限](/cloud/security/console-roles)。这个指南介绍了如何管理自定义角色。

## 创建自定义角色 \{#create-custom-role\}

自定义角色可包含组织、服务和数据库权限的任意组合。权限可应用于全部服务和数据库，或其子集。

<VerticalStepper headerLevel="h3">
  ### 进入组织设置并选择 Users and roles \{#users-and-roles-1\}

  在服务页面中，选择您的组织名称。然后在弹出菜单中选择 `Users and roles` 菜单项。

  <Image img={step_1} size="lg" />

  ### 选择 `Roles` 选项卡 \{#roles-tab\}

  在屏幕顶部中间位置选择 `Roles` 选项卡。

  <Image img={step_2} size="lg" />

  ### 在右上角选择 `Create new role` \{#create-new-role\}

  点击屏幕右上角的 `Create new role` 按钮。

  <Image img={step_3} size="lg" />

  ### 为角色命名 \{#name-the-role\}

  输入一个便于识别的角色名称。为用户和 API 密钥分配角色时，您将看到此名称。

  <Image img={step_4} size="md" />

  ### 点击 `Allow` 并选择权限范围 \{#scope-permissions\}

  点击 `Allow` 按钮，然后从组织、服务和/或数据库权限中进行选择。有关所有权限的说明，请参见 [控制台角色和权限](/cloud/security/console-roles)。

  :::tip
  请确保需要登录控制台的用户至少具有“组织 &gt; 访问组织”权限。
  :::

  <Image img={step_5} size="md" />

  ### 检查新角色 \{#review-role\}

  在最终确认前，检查分配给新角色的权限。完成后，点击 `Create role`。

  <Image img={step_6} size="md" />
</VerticalStepper>

## 更新自定义角色 \{#update-custom-role\}

自定义角色在创建后仍可更新。用户会失去从该角色中移除的所有权限，也会获得新增的权限。

:::tip
用户权限具有叠加性。如果某个用户通过多个角色拥有执行某项操作的权限，那么仅从其中一个角色中移除该权限时，他们可能不会立即失去访问权限。
:::

1. 进入组织设置，然后选择 `Users and roles`
2. 选择 `Roles` 选项卡
3. 选择要更新的角色旁边的三个点
4. 选择 `Edit`
5. 修改权限
6. 选择 `Edit role`

## 删除自定义角色 \{#delete-custom-role\}

自定义角色可以随时删除。

:::warning
组织中必须至少有一位用户具有管理权限。如果删除该角色会导致最后一位用户失去管理权限，则无法删除该角色。要解决此问题，请先为至少一位用户分配 Admin 系统角色，然后再删除自定义角色。
:::

1. 进入组织设置，然后选择 `Users and roles`
2. 选择 `Roles` 选项卡
3. 选择要删除的角色旁边的三个点
4. 查看移除该角色后将失去访问权限的用户和 API 密钥，并根据需要调整分配。
5. 选择 `Delete role` 以完成删除
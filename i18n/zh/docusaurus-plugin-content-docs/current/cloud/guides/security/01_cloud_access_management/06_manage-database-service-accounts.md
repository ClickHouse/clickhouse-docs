---
sidebar_label: '管理数据库服务账号'
slug: /cloud/security/manage-database-service-accounts
title: '管理数据库服务账号'
description: '本页面介绍管理员如何添加数据库服务账号'
doc_type: 'guide'
keywords: ['数据库服务账号', '访问管理', '安全', '权限']
---

数据库服务账号可以很简单，例如为用户单独设置一个用于身份验证的密码或证书。更进阶的用户可能希望创建这样的账户：可使用 SET ROLE 动态修改权限范围，从而无需退出登录或重新加载页面内容，即可在不同 profile 之间快速切换。

## 概述 \{#overview\}

[SET ROLE](/docs/sql-reference/statements/set-role) 可用于在会话期间动态限定服务账号的权限范围。其原理是将用户的有效权限限制为仅包含已激活角色授予的权限。这种方法有几个优势：

* 服务账号可以被授予多个角色，但仅激活特定查询所需的角色。
* 如果服务账号被入侵，攻击者也只能使用当前激活角色的权限。
* 单个账户可以通过切换角色执行不同任务，而不必为每项任务分别使用不同的凭据。
* 通过修改一个角色，而不是逐个更新用户，可以为整类服务账号统一更新权限。
* 日志可以跟踪执行查询时具体激活的是哪个角色，从而为安全审计提供更清晰的上下文。

实际使用时，请按以下步骤操作：

1. 设计用于定义允许边界的角色 (`read_only`、`maintenance` 等)
2. 将这些角色授予服务账号
3. 在连接时，通过 `SET ROLE` (或角色参数) 选择激活的角色，从而限制该会话可执行的操作

## 设置服务角色 \{#setup-service-roles\}

<VerticalStepper headerLevel="h3">
  ### 向服务账号授予角色 \{#grant-roles-to-service-account\}

  首先，创建具有所需特权/设置的角色，然后将这些角色授予服务账号。

  ```sql
  CREATE ROLE read_only_role;
  GRANT SELECT ON db1.* TO read_only_role;

  CREATE ROLE maint_role;
  GRANT SELECT, INSERT, ALTER on db1.* TO maint_role;

  GRANT read_only_role, maint_role TO service_user;
  ```

  ### 使用 SET ROLE 定义会话边界 \{#define-permission-boundaries\}

  在会话开始时，服务账号可以选择启用哪些角色：

  ```sql
  -- 此会话仅启用只读行为
  SET ROLE read_only_role;
  ```

  或：

  ```sql
  -- 使用所有已授予的角色（完整权限）
  SET ROLE ALL;
  ```

  `SET ROLE` 会为当前用户激活角色；生效的特权是所有活动角色特权的并集，再加上直接授予该用户的任何特权。

  您也可以停用所有角色：

  ```sql
  SET ROLE NONE;
  ```

  或激活多个角色：

  ```sql
  SET ROLE read_only_role, maint_role;
  ```

  当前激活的角色可通过 `system.current_roles` 查看。

  ### 为服务账号设置默认角色 \{#set-default-role\}

  为确保服务账号始终以受限模式启动，请配置默认角色：

  ```sql
  SET DEFAULT ROLE read_only_role TO service_user;
  ```

  或

  ```sql
  SET DEFAULT ROLE ALL EXCEPT maint_role TO service_user;
  ```

  ### 通过 HTTP / 以编程方式使用 SET ROLE \{#use-set-role-programmatically\}

  如果服务账号通过 HTTP 连接，则不能将 SET ROLE; SELECT ... 作为多语句请求发送。请改为通过查询参数传递角色：

  ```shell
  curl "https://host:8123?user=service_user&password=...&role=read_only_role" \
   --data-binary "SELECT * FROM db1.table1"
  ```

  `?role=`... 等同于在执行该语句前先执行 `SET ROLE read_only_role`。多个 role 参数的行为类似于 `SET ROLE role 1, role 2`。

  某些驱动程序 (例如适用于 Python 的 ClickHouse Connect) 也提供 role 设置，并会随每个请求一同发送，服务器会将其用作该会话的角色。
</VerticalStepper>
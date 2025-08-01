---
description: 'System table containing information about configured roles.'
keywords:
- 'system table'
- 'roles'
slug: '/operations/system-tables/roles'
title: 'system.roles'
---




# system.roles

設定された [roles](../../guides/sre/user-management/index.md#role-management) に関する情報を含みます。

カラム:

- `name` （[String](../../sql-reference/data-types/string.md)） — 役割名。
- `id` （[UUID](../../sql-reference/data-types/uuid.md)） — 役割ID。
- `storage` （[String](../../sql-reference/data-types/string.md)） — 役割のストレージへのパス。 `access_control_path` パラメータで設定されています。

## See Also {#see-also}

- [SHOW ROLES](/sql-reference/statements/show#show-roles)

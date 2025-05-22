---
'description': '设置的目录页'
'sidebar_position': 1
'slug': '/operations/settings/'
'title': '设置'
---

<!-- 该页面的目录表由 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh 
根据 YAML 前置字段：slug，description，title 自动生成。

如果您发现错误，请编辑页面本身的 YML 前置数据。 -->
| 页面 | 描述 |
|-----|-----|
| [可组合协议](/operations/settings/composable-protocols) | 可组合协议允许对 ClickHouse 服务器的 TCP 访问进行更灵活的配置。 |
| [设置配置文件](/operations/settings/settings-profiles) | 一组在同一名称下分组的设置。 |
| [会话设置](/operations/settings/settings) | 在 ``system.settings`` 表中找到的设置。 |
| [设置概述](/operations/settings/overview) | 设置的概述页面。 |
| [用户和角色设置](/operations/settings/settings-users) | 配置用户和角色的设置。 |
| [查询级会话设置](/operations/settings/query-level) | 查询级别的设置。 |
| [服务器过载](/operations/settings/server-overload) | 控制服务器 CPU 过载时的行为。 |
| [格式设置](/operations/settings/formats) | 控制输入和输出格式的设置。 |
| [查询复杂度限制](/operations/settings/query-complexity) | 限制查询复杂度的设置。 |
| [MergeTree 表设置](/operations/settings/merge-tree-settings) | 在 `system.merge_tree_settings` 中的 MergeTree 设置。 |
| [设置约束](/operations/settings/constraints-on-settings) | 设置约束可以在 `user.xml` 配置文件的 `profiles` 部分定义，并禁止用户使用 `SET` 查询更改某些设置。 |
| [内存超分配](/operations/settings/memory-overcommit) | 一种实验性技术，旨在允许为查询设置更灵活的内存限制。 |
| [查询权限](/operations/settings/permissions-for-queries) | 查询权限的设置。 |

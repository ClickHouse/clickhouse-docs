---
title: 设置
description: 设置的目录页面
sidebar_position: 1
slug: /operations/settings/
---

<!-- 该页面的目录表由 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
根据YAML前言字段自动生成：slug、description、title。

如果您发现错误，请编辑页面本身的YML前言。 -->
| 页面 | 描述 |
|-----|-----|
| [可组合协议](/operations/settings/composable-protocols) | 可组合协议允许对ClickHouse服务器的TCP访问进行更灵活的配置。 |
| [设置配置文件](/operations/settings/settings-profiles) | 一组按同一名称分组的设置。 |
| [会话设置](/operations/settings/settings) | 在system.settings表中找到的设置。 |
| [设置概述](/operations/settings/overview) | 设置的概述页面。 |
| [用户和角色设置](/operations/settings/settings-users) | 用于配置用户和角色的设置。 |
| [查询级别会话设置](/operations/settings/query-level) | 查询级别的设置 |
| [格式设置](/operations/settings/formats) | 控制输入和输出格式的设置。 |
| [查询复杂性限制](/operations/settings/query-complexity) | 限制查询复杂性的设置。 |
| [MergeTree表设置](/operations/settings/merge-tree-settings) | 在`system.merge_tree_settings`中的MergeTree设置 |
| [设置约束](/operations/settings/constraints-on-settings) | 设置的约束可以在`user.xml`配置文件的`profiles`部分定义，并禁止用户使用`SET`查询更改某些设置。 |
| [内存过度提交](/operations/settings/memory-overcommit) | 一种实验性技术，旨在允许为查询设置更灵活的内存限制。 |
| [查询权限](/operations/settings/permissions-for-queries) | 查询权限的设置。 |

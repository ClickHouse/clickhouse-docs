---
description: 'ClickHouse 中内置的 geobase 字典'
sidebar_label: '嵌入式字典'
sidebar_position: 6
slug: /sql-reference/statements/create/dictionary/embedded
title: '嵌入式（geobase）字典'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouse 包含一个用于处理地理库（geobase）的内置功能。

这使你可以：

* 使用区域的 ID 获取其在所需语言中的名称。
* 使用区域的 ID 获取城市、地区、联邦区、国家或大洲的 ID。
* 检查某个区域是否属于另一个区域。
* 获取父区域链。

所有函数都支持“translocality”（跨地域性），即能够同时采用关于区域归属的不同视角。更多信息，参阅 “Functions for working with web analytics dictionaries” 一节。

在默认安装包中，内部字典是禁用的。
要启用它们，请在服务器配置文件中取消注释参数 `path_to_regions_hierarchy_file` 和 `path_to_regions_names_files`。

地理库从文本文件加载。

将 `regions_hierarchy*.txt` 文件放入 `path_to_regions_hierarchy_file` 目录。该配置参数必须包含指向 `regions_hierarchy.txt` 文件（默认区域层级）的路径，其余文件（如 `regions_hierarchy_ua.txt`）必须位于同一目录中。

将 `regions_names_*.txt` 文件放入 `path_to_regions_names_files` 目录。

你也可以自行创建这些文件。文件格式如下：

`regions_hierarchy*.txt`：TabSeparated（无表头），列：

* 区域 ID（`UInt32`）
* 父区域 ID（`UInt32`）
* 区域类型（`UInt8`）：1 - 大洲，3 - 国家，4 - 联邦区，5 - 地区，6 - 城市；其他类型没有取值
* 人口（`UInt32`）— 可选列

`regions_names_*.txt`：TabSeparated（无表头），列：

* 区域 ID（`UInt32`）
* 区域名称（`String`）— 不能包含制表符或换行符，即使是转义后的。

在 RAM 中使用扁平数组结构进行存储。出于这个原因，ID 不应超过一百万。

字典可以在不重启服务器的情况下更新。但是，可用字典的集合不会发生变化。
在更新时，会检查文件的修改时间。如果文件发生变化，则更新字典。
检查变更的时间间隔通过 `builtin_dictionaries_reload_interval` 参数进行配置。
字典更新（首次使用时的加载除外）不会阻塞查询。在更新期间，查询会使用旧版本的字典。如果在更新过程中发生错误，该错误会被写入服务器日志中，查询将继续使用旧版本的字典。

我们建议定期使用地理库更新字典。在执行更新时，生成新文件并将其写入单独的位置。当一切准备就绪后，将它们重命名为服务器正在使用的文件名。

还有一些用于处理操作系统标识符和搜索引擎的函数，但不建议使用。

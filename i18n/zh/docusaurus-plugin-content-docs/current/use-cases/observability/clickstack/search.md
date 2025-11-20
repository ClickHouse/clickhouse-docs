---
slug: /use-cases/observability/clickstack/search
title: '使用 ClickStack 搜索'
sidebar_label: '搜索'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 搜索'
doc_type: 'guide'
keywords: ['clickstack', 'search', 'logs', 'observability', 'full-text search']
---

import Image from '@theme/IdealImage';
import hyperdx_27 from '@site/static/images/use-cases/observability/hyperdx-27.png';
import saved_search from '@site/static/images/use-cases/observability/clickstack-saved-search.png';
import Tagging from '@site/docs/_snippets/_clickstack_tagging.mdx';

ClickStack 允许你对事件（日志和追踪）进行全文搜索。你只需输入与事件匹配的关键词即可开始搜索。例如，如果日志中包含 “Error”，只需在搜索栏中输入 “Error” 即可将其找到。

同样的搜索语法也适用于在 Dashboards 和 Charts 中筛选事件。


## 搜索功能 {#search-features}

### 自然语言搜索语法 {#natural-language-syntax}

- 搜索不区分大小写
- 默认按整词匹配(例如 `Error` 会匹配 `Error here`,但不会匹配 `Errors here`)。可以在词语两侧使用通配符来匹配部分词语(例如 `*Error*` 会匹配 `AnyError` 和 `AnyErrors`)
- 搜索词可以按任意顺序匹配(例如 `Hello World` 会匹配包含 `Hello World` 和 `World Hello` 的日志)
- 可以使用 `NOT` 或 `-` 排除关键词(例如 `Error NOT Exception` 或 `Error -Exception`)
- 可以使用 `AND` 和 `OR` 组合多个关键词(例如 `Error OR Exception`)
- 可以使用双引号进行精确匹配(例如 `"Error tests not found"`)

<Image img={hyperdx_27} alt='搜索' size='md' />

#### 列/属性搜索 {#column-search}

- 可以使用 `column:value` 格式搜索列和 JSON/map 属性(例如 `level:Error`、`service:app`)
- 可以使用比较运算符(`>`、`<`、`>=`、`<=`)搜索值范围(例如 `Duration:>1000`)
- 可以使用 `property:*` 搜索属性是否存在(例如 `duration:*`)

### 时间输入 {#time-input}

- 时间输入支持自然语言输入(例如 `1 hour ago`、`yesterday`、`last week`)
- 指定单个时间点将从该时间点搜索至当前时间
- 搜索时,时间范围会自动转换为解析后的时间范围,便于调试时间查询
- 还可以高亮直方图柱状图以缩放到特定时间范围

### SQL 搜索语法 {#sql-syntax}

可以选择将搜索输入切换为 SQL 模式。该模式接受任何有效的 SQL WHERE 子句进行搜索。这对于无法用 Lucene 语法表达的复杂查询非常有用。

### Select 语句 {#select-statement}

要指定搜索结果中显示的列,可以使用 `SELECT` 输入。这是一个 SQL SELECT 表达式,用于选择搜索页面中要显示的列。目前不支持别名(例如不能使用 `column as "alias"`)。


## 保存的搜索 {#saved-searches}

您可以保存搜索以便后续快速访问。保存后,搜索将显示在左侧边栏中,便于您重新访问常用的搜索查询,无需重新构建。

要保存搜索,只需配置搜索查询并点击保存按钮。您可以为保存的搜索指定一个描述性名称,便于日后识别。

<Image img={saved_search} alt='保存搜索' size='md' />

### 为保存的搜索添加告警 {#alerts-on-saved-searches}

可以为保存的搜索配置告警监控,在满足特定条件时通知您。您可以设置告警,当匹配保存搜索的事件数量超过或低于指定阈值时触发。

有关设置和配置告警的更多信息,请参阅[告警文档](/use-cases/observability/clickstack/alerts)。

### 标签 {#tagging}

<Tagging />

---
slug: /use-cases/observability/clickstack/search
title: '使用 ClickStack 进行搜索'
sidebar_label: '搜索'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 进行搜索'
doc_type: 'guide'
keywords: ['clickstack', '搜索', '日志', '可观测性', '全文搜索']
---

import Image from '@theme/IdealImage';
import hyperdx_27 from '@site/static/images/use-cases/observability/hyperdx-27.png';
import saved_search from '@site/static/images/use-cases/observability/clickstack-saved-search.png';
import Tagging from '@site/docs/_snippets/_clickstack_tagging.mdx';

ClickStack 允许你对事件（日志和链路追踪）执行全文搜索。你可以直接输入与事件匹配的关键字来开始搜索。比如，如果你的日志中包含 “Error”，你只需在搜索栏中输入 “Error” 就可以找到它。

同样的搜索语法也适用于在 Dashboards 和 Charts 中过滤事件。


## 搜索功能 {#search-features}

### 自然语言搜索语法 {#natural-language-syntax}

- 搜索不区分大小写
- 默认按完整单词进行匹配（例如，`Error` 会匹配 `Error here`，但不会匹配
  `Errors here`）。你可以在单词前后添加通配符以匹配部分单词（例如，`*Error*`
  会匹配 `AnyError` 和 `AnyErrors`）
- 搜索词的顺序不影响匹配结果（例如，`Hello World` 会匹配包含 `Hello World` 和
  `World Hello` 的日志）
- 你可以使用 `NOT` 或 `-` 排除关键字（例如，`Error NOT Exception` 或
  `Error -Exception`）
- 你可以使用 `AND` 和 `OR` 组合多个关键字（例如，
  `Error OR Exception`）
- 可以通过双引号进行精确匹配（例如，`"Error tests not found"`）

<Image img={hyperdx_27} alt="搜索" size="md"/>

#### 列/属性搜索 {#column-search}

- 你可以通过 `column:value` 搜索列和 JSON/map 属性（例如，`level:Error`、
  `service:app`）
- 你可以使用比较运算符（`>`, `<`, `>=`, `<=`）搜索一个数值范围（例如，
  `Duration:>1000`）
- 你可以使用 `property:*` 搜索属性是否存在（例如，
  `duration:*`）

### 时间输入 {#time-input}

- 时间输入支持自然语言（例如，`1 hour ago`、`yesterday`、
  `last week`）
- 指定单个时间点时，将从该时间点搜索到当前时间。
- 每次搜索后，时间范围都会被转换为解析后的时间范围，便于调试时间查询。
- 你也可以高亮直方图中的某一条柱状条，以放大到特定时间范围。

### SQL 搜索语法 {#sql-syntax}

你可以选择将搜索输入切换为 SQL 模式。此时会接受任意有效的
SQL WHERE 子句作为搜索条件。这对于无法用 Lucene 语法表达的复杂查询非常有用。

### Select 语句  {#select-statement}

要指定在搜索结果中显示的列，可以使用 `SELECT`
输入。这是一个用于在搜索页面中选择列的 SQL SELECT 表达式。
目前不支持别名（例如，你不能使用 `column as "alias"`）。



## 已保存搜索 {#saved-searches}

你可以将搜索保存起来，以便稍后快速访问。保存后，你的搜索会显示在左侧边栏中，这样就可以轻松重新访问常用的搜索条件，而无需重新构建它们。

要保存搜索，只需配置好搜索条件并点击保存按钮。你可以为已保存搜索指定一个具有描述性的名称，方便后续识别。

<Image img={saved_search} alt="保存搜索" size="md" />

### 为已保存搜索添加告警 {#alerts-on-saved-searches}

已保存搜索可以通过告警进行监控，当满足特定条件时会向你发出通知。你可以设置告警，在与已保存搜索匹配的事件数量超过或低于指定阈值时触发。

有关设置和配置告警的更多信息，请参阅[告警文档](/use-cases/observability/clickstack/alerts)。

### 标签 {#tagging}
<Tagging />
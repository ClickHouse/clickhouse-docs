---
slug: /use-cases/observability/clickstack/search
title: '使用 ClickStack 进行搜索'
sidebar_label: '搜索'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 进行搜索'
doc_type: 'guide'
keywords: ['clickstack', 'search', 'logs', 'observability', 'full-text search']
---

import Image from '@theme/IdealImage';
import hyperdx_27 from '@site/static/images/use-cases/observability/hyperdx-27.png';
import saved_search from '@site/static/images/use-cases/observability/clickstack-saved-search.png';
import Tagging from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_clickstack_tagging.mdx';

ClickStack 允许您对事件（日志和跟踪）执行全文搜索。您只需输入与事件匹配的关键词即可开始搜索。例如，如果您的日志中包含 “Error”，您只需在搜索栏中输入 “Error” 即可将其查找出来。

同样的搜索语法也适用于在仪表板和图表中对事件进行过滤。


## 搜索功能 {#search-features}

### 自然语言搜索语法 {#natural-language-syntax}

- 搜索不区分大小写
- 搜索默认按整词匹配（例如，`Error` 会匹配 `Error here`，但不会匹配 `Errors here`）。可以在单词前后加通配符来匹配部分单词（例如，`*Error*` 会匹配 `AnyError` 和 `AnyErrors`）
- 搜索词的出现顺序不限（例如，`Hello World` 会匹配包含 `Hello World` 和 `World Hello` 的日志）
- 可以使用 `NOT` 或 `-` 排除关键字（例如，`Error NOT Exception` 或 `Error -Exception`）
- 可以使用 `AND` 和 `OR` 组合多个关键字（例如，`Error OR Exception`）
- 使用双引号可以进行精确匹配（例如，`"Error tests not found"`）

<Image img={hyperdx_27} alt="搜索" size="md"/>

#### 列/属性搜索 {#column-search}

- 可以使用 `column:value` 查找列以及 JSON/map 属性（例如 `level:Error`、`service:app`）
- 可以使用比较运算符（`>`, `<`, `>=`, `<=`）查找某个取值范围（例如 `Duration:>1000`）
- 可以使用 `property:*` 查找某个属性是否存在（例如 `duration:*`）

### 时间输入 {#time-input}

- 时间输入支持自然语言（例如 `1 hour ago`、`yesterday`、`last week`）
- 指定单个时间点时，将从该时间点搜索到当前时间。
- 搜索时，时间范围会自动转换为解析后的时间范围，便于调试时间查询。
- 你也可以高亮直方图中的某个柱子，以放大到特定的时间范围。

### SQL 搜索语法 {#sql-syntax}

你可以选择将搜索输入切换到 SQL 模式。此模式会接受任意有效的
SQL WHERE 子句作为搜索条件。这对于那些无法用 Lucene 语法
表达的复杂查询尤其有用。

### SELECT 语句  {#select-statement}

要指定在搜索结果中显示的列，可以使用 `SELECT` 输入项。它是一个在搜索页面中用于选择列的 SQL SELECT 表达式。目前不支持别名（例如，不能使用 `column as "alias"`）。

## 已保存的搜索 {#saved-searches}

你可以将搜索保存起来，以便稍后快速访问。保存后，你的搜索会显示在左侧边栏中，这样就能轻松再次使用常用的搜索条件，而无需重新构建它们。

要保存搜索，只需先配置好搜索条件，然后点击保存按钮。你可以为已保存的搜索指定一个便于描述和识别的名称，方便之后查找。

<Image img={saved_search} alt="保存搜索" size="md" />

### 为已保存的搜索添加告警 {#alerts-on-saved-searches}

可以为已保存的搜索配置告警，以便在满足特定条件时收到通知。你可以设置当与已保存搜索匹配的事件数量超过或低于指定阈值时触发告警。

有关告警的设置和配置的更多信息，请参阅[告警文档](/use-cases/observability/clickstack/alerts)。

### 标记 {#tagging}

<Tagging />
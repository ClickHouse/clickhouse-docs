---
description: '用于操作 ClickHouse 的第三方图形界面 (GUI) 工具和应用程序列表'
sidebar_label: '图形界面'
sidebar_position: 28
slug: /interfaces/third-party/gui
title: '第三方开发者提供的图形界面'
doc_type: 'reference'
---



# 第三方开发的可视化界面



## 开源 {#open-source}

### agx {#agx}

[agx](https://github.com/agnosticeng/agx) 是一个使用 Tauri 和 SvelteKit 构建的桌面应用程序,提供现代化界面,用于通过 ClickHouse 的嵌入式数据库引擎 (chdb) 探索和查询数据。

- 运行原生应用程序时使用 ch-db。
- 运行 Web 实例时可连接到 ClickHouse 实例。
- 集成 Monaco 编辑器,提供熟悉的使用体验。
- 多种且持续演进的数据可视化功能。

### ch-ui {#ch-ui}

[ch-ui](https://github.com/caioricciuti/ch-ui) 是一个简洁的 React.js 应用程序界面,专为 ClickHouse 数据库设计,用于执行查询和可视化数据。基于 React 和 ClickHouse Web 客户端构建,提供简洁友好的用户界面,便于进行数据库交互。

功能特性:

- ClickHouse 集成:轻松管理连接并执行查询。
- 响应式标签管理:动态处理多个标签,如查询标签和表格标签。
- 性能优化:利用 Indexed DB 实现高效缓存和状态管理。
- 本地数据存储:所有数据均存储在浏览器本地,确保数据不会发送到其他任何地方。

### ChartDB {#chartdb}

[ChartDB](https://chartdb.io) 是一个免费开源工具,用于通过单个查询可视化和设计数据库模式,包括 ClickHouse。基于 React 构建,提供流畅且用户友好的体验,无需数据库凭据或注册即可开始使用。

功能特性:

- 模式可视化:即时导入并可视化您的 ClickHouse 模式,包括带有物化视图和标准视图的 ER 图,显示表之间的引用关系。
- AI 驱动的 DDL 导出:轻松生成 DDL 脚本,便于模式管理和文档编制。
- 多 SQL 方言支持:兼容多种 SQL 方言,适用于各种数据库环境。
- 无需注册或凭据:所有功能均可直接在浏览器中访问,使用便捷且安全。

[ChartDB 源代码](https://github.com/chartdb/chartdb)。

### DataPup {#datapup}

[DataPup](https://github.com/DataPupOrg/DataPup) 是一个现代化的 AI 辅助跨平台数据库客户端,原生支持 ClickHouse。

功能特性:

- AI 驱动的 SQL 查询辅助,提供智能建议
- 原生 ClickHouse 连接支持,具备安全的凭据处理机制
- 美观易用的界面,提供多种主题(浅色、深色和彩色变体)
- 高级查询结果过滤和探索功能
- 跨平台支持(macOS、Windows、Linux)
- 快速响应的性能表现
- 开源且采用 MIT 许可证

### ClickHouse Schema Flow Visualizer {#clickhouse-schemaflow-visualizer}

[ClickHouse Schema Flow Visualizer](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer) 是一个功能强大的开源 Web 应用程序,使用 Mermaid.js 图表可视化 ClickHouse 表关系。通过直观的界面浏览数据库和表,探索表元数据(可选行数和大小信息),并导出交互式模式图。

功能特性:

- 通过直观的界面浏览 ClickHouse 数据库和表
- 使用 Mermaid.js 图表可视化表关系
- 与表类型匹配的颜色编码图标,便于更好地可视化
- 查看表之间的数据流向
- 将图表导出为独立的 HTML 文件
- 切换元数据可见性(表行数和大小信息)
- 通过 TLS 支持安全连接到 ClickHouse
- 适用于所有设备的响应式 Web 界面

[ClickHouse Schema Flow Visualizer - 源代码](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer)

### Tabix {#tabix}

[Tabix](https://github.com/tabixio/tabix) 项目中的 ClickHouse Web 界面。

功能特性:

- 直接从浏览器使用 ClickHouse,无需安装额外软件。
- 带有语法高亮的查询编辑器。
- 命令自动补全。
- 用于查询执行图形分析的工具。
- 配色方案选项。

[Tabix 文档](https://tabix.io/doc/)。

### HouseOps {#houseops}

[HouseOps](https://github.com/HouseOps/HouseOps) 是适用于 OSX、Linux 和 Windows 的 UI/IDE。

功能特性:

- 带有语法高亮的查询构建器。以表格或 JSON 视图查看响应。
- 将查询结果导出为 CSV 或 JSON。
- 带有描述的进程列表。写入模式。能够停止 (`KILL`) 进程。
- 数据库图。显示所有表及其列以及附加信息。
- 快速查看列大小。
- 服务器配置。

计划开发的功能:

- 数据库管理。
- 用户管理。
- 实时数据分析。
- 集群监控。
- 集群管理。
- 监控复制表和 Kafka 表。

### LightHouse {#lighthouse}


[LightHouse](https://github.com/VKCOM/lighthouse) 是一个用于 ClickHouse 的轻量级 Web 界面。

功能特性:

- 带有过滤和元数据的表列表。
- 带有过滤和排序的表预览。
- 只读查询执行。

### Redash {#redash}

[Redash](https://github.com/getredash/redash) 是一个数据可视化平台。

支持包括 ClickHouse 在内的多种数据源,Redash 可以将来自不同数据源的查询结果合并到一个最终数据集中。

功能特性:

- 强大的查询编辑器。
- 数据库浏览器。
- 可视化工具,允许您以不同形式展示数据。

### Grafana {#grafana}

[Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) 是一个用于监控和可视化的平台。

"Grafana 允许您查询、可视化、告警和理解您的指标,无论它们存储在何处。创建、探索和与您的团队共享仪表板,培养数据驱动的文化。受到社区的信任和喜爱" &mdash; grafana.com。

ClickHouse 数据源插件提供对 ClickHouse 作为后端数据库的支持。

### qryn {#qryn}

[qryn](https://metrico.in) 是一个用于 ClickHouse 的多语言、高性能可观测性堆栈 _(原名 cLoki)_,具有原生 Grafana 集成,允许用户从支持 Loki/LogQL、Prometheus/PromQL、OTLP/Tempo、Elastic、InfluxDB 等的任何代理中采集和分析日志、指标和遥测追踪。

功能特性:

- 内置 Explore UI 和 LogQL CLI,用于查询、提取和可视化数据
- 原生 Grafana API 支持,无需插件即可进行查询、处理、采集、追踪和告警
- 强大的管道,可从日志、事件、追踪等动态搜索、过滤和提取数据
- 采集和 PUSH API 透明兼容 LogQL、PromQL、InfluxDB、Elastic 等
- 可直接与 Promtail、Grafana-Agent、Vector、Logstash、Telegraf 等代理配合使用

### DBeaver {#dbeaver}

[DBeaver](https://dbeaver.io/) - 支持 ClickHouse 的通用桌面数据库客户端。

功能特性:

- 带有语法高亮和自动完成的查询开发。
- 带有过滤器和元数据搜索的表列表。
- 表数据预览。
- 全文搜索。

默认情况下,DBeaver 不使用会话连接(例如 CLI 会使用)。如果您需要会话支持(例如为会话设置配置),请编辑驱动程序连接属性并将 `session_id` 设置为随机字符串(它在底层使用 http 连接)。然后您可以从查询窗口使用任何设置。

### clickhouse-cli {#clickhouse-cli}

[clickhouse-cli](https://github.com/hatarist/clickhouse-cli) 是 ClickHouse 的替代命令行客户端,使用 Python 3 编写。

功能特性:

- 自动完成。
- 查询和数据输出的语法高亮。
- 数据输出的分页器支持。
- 自定义类 PostgreSQL 命令。

### clickhouse-flamegraph {#clickhouse-flamegraph}

[clickhouse-flamegraph](https://github.com/Slach/clickhouse-flamegraph) 是一个专门的工具,用于将 `system.trace_log` 可视化为[火焰图](http://www.brendangregg.com/flamegraphs.html)。

### clickhouse-plantuml {#clickhouse-plantuml}

[cickhouse-plantuml](https://pypi.org/project/clickhouse-plantuml/) 是一个用于生成表结构的 [PlantUML](https://plantuml.com/) 图表的脚本。

### ClickHouse table graph {#clickhouse-table-graph}

[ClickHouse table graph](https://github.com/mbaksheev/clickhouse-table-graph) 是一个用于可视化 ClickHouse 表之间依赖关系的简单 CLI 工具。该工具从 `system.tables` 表中检索表之间的连接,并以 [mermaid](https://mermaid.js.org/syntax/flowchart.html) 格式构建依赖关系流程图。使用此工具,您可以轻松可视化表依赖关系并了解 ClickHouse 数据库中的数据流。得益于 mermaid,生成的流程图外观美观,可以轻松添加到您的 markdown 文档中。

### xeus-clickhouse {#xeus-clickhouse}

[xeus-clickhouse](https://github.com/wangfenjin/xeus-clickhouse) 是一个用于 ClickHouse 的 Jupyter 内核,支持在 Jupyter 中使用 SQL 查询 CH 数据。

### MindsDB Studio {#mindsdb}


[MindsDB](https://mindsdb.com/) 是一个面向数据库(包括 ClickHouse)的开源 AI 层,可让您轻松开发、训练和部署最先进的机器学习模型。MindsDB Studio(GUI)允许您从数据库训练新模型、解释模型做出的预测、识别潜在的数据偏差,并使用可解释 AI 功能评估和可视化模型准确性,从而更快地适配和调优您的机器学习模型。

### DBM {#dbm}

[DBM](https://github.com/devlive-community/dbm) 是一个用于 ClickHouse 的可视化管理工具!

功能特性:

- 支持查询历史(分页、全部清除等)
- 支持选定 SQL 子句查询
- 支持终止查询
- 支持表管理(元数据、删除、预览)
- 支持数据库管理(删除、创建)
- 支持自定义查询
- 支持多数据源管理(连接测试、监控)
- 支持监控(处理器、连接、查询)
- 支持数据迁移

### Bytebase {#bytebase}

[Bytebase](https://bytebase.com) 是一个基于 Web 的开源 Schema 变更和版本控制工具,面向团队使用。它支持包括 ClickHouse 在内的多种数据库。

功能特性:

- 开发人员和 DBA 之间的 Schema 审查。
- 数据库即代码,在 VCS(如 GitLab)中对 Schema 进行版本控制,并在代码提交时触发部署。
- 通过按环境策略简化部署流程。
- 完整的迁移历史记录。
- Schema 漂移检测。
- 备份和恢复。
- 基于角色的访问控制(RBAC)。

### Zeppelin-Interpreter-for-ClickHouse {#zeppelin-interpreter-for-clickhouse}

[Zeppelin-Interpreter-for-ClickHouse](https://github.com/SiderZhang/Zeppelin-Interpreter-for-ClickHouse) 是一个用于 ClickHouse 的 [Zeppelin](https://zeppelin.apache.org) 解释器。与 JDBC 解释器相比,它可以为长时间运行的查询提供更好的超时控制。

### ClickCat {#clickcat}

[ClickCat](https://github.com/clickcat-project/ClickCat) 是一个友好的用户界面,可让您搜索、探索和可视化 ClickHouse 数据。

功能特性:

- 在线 SQL 编辑器,无需安装即可运行 SQL 代码。
- 可以观察所有进程和 Mutation 操作。对于未完成的进程,可以在界面中终止它们。
- 指标包含集群分析、数据分析和查询分析。

### ClickVisual {#clickvisual}

[ClickVisual](https://clickvisual.net/) 是一个轻量级的开源日志查询、分析和告警可视化平台。

功能特性:

- 支持一键创建分析日志库
- 支持日志采集配置管理
- 支持用户自定义索引配置
- 支持告警配置
- 支持库和表级别的权限粒度配置

### ClickHouse-Mate {#clickmate}

[ClickHouse-Mate](https://github.com/metrico/clickhouse-mate) 是一个基于 Angular 的 Web 客户端和用户界面,用于在 ClickHouse 中搜索和探索数据。

功能特性:

- ClickHouse SQL 查询自动补全
- 快速的数据库和表树形导航
- 高级结果过滤和排序
- 内联 ClickHouse SQL 文档
- 查询预设和历史记录
- 100% 基于浏览器,无需服务器/后端

该客户端可通过 GitHub Pages 立即使用:https://metrico.github.io/clickhouse-mate/

### Uptrace {#uptrace}

[Uptrace](https://github.com/uptrace/uptrace) 是一个 APM 工具,提供由 OpenTelemetry 和 ClickHouse 驱动的分布式追踪和指标功能。

功能特性:

- [OpenTelemetry 追踪](https://uptrace.dev/opentelemetry/distributed-tracing.html)、指标和日志。
- 使用 AlertManager 的 Email/Slack/PagerDuty 通知。
- 类 SQL 查询语言用于聚合 Span。
- 类 PromQL 语言用于查询指标。
- 预构建的指标仪表板。
- 通过 YAML 配置支持多用户/多项目。

### clickhouse-monitoring {#clickhouse-monitoring}

[clickhouse-monitoring](https://github.com/duyet/clickhouse-monitoring) 是一个简单的 Next.js 仪表板,依赖于 `system.*` 表来帮助监控并提供 ClickHouse 集群的概览。

功能特性:

- 查询监控:当前查询、查询历史、查询资源(内存、读取的 Part、打开的文件等)、最昂贵的查询、最常用的表或列等。
- 集群监控:总内存/CPU 使用率、分布式队列、全局设置、MergeTree 设置、指标等。
- 表和 Part 信息:大小、行数、压缩、Part 大小等,以及列级别的详细信息。
- 实用工具:ZooKeeper 数据探索、查询 EXPLAIN、终止查询等。
- 可视化指标图表:查询和资源使用情况、Merge/Mutation 操作数量、Merge 性能、查询性能等。

### CKibana {#ckibana}


[CKibana](https://github.com/TongchengOpenSource/ckibana) 是一个轻量级服务,可让您使用原生 Kibana UI 轻松搜索、探索和可视化 ClickHouse 数据。

功能特性:

- 将原生 Kibana UI 的图表请求转换为 ClickHouse 查询语法。
- 支持采样和缓存等高级功能,以提升查询性能。
- 最大限度地降低用户从 ElasticSearch 迁移到 ClickHouse 后的学习成本。

### Telescope {#telescope}

[Telescope](https://iamtelescope.net/) 是一个用于探索存储在 ClickHouse 中日志的现代化 Web 界面。它提供了用户友好的 UI,用于查询、可视化和管理日志数据,并具有细粒度的访问控制。

功能特性:

- 简洁、响应式的 UI,具有强大的过滤器和可自定义的字段选择功能。
- FlyQL 语法,用于直观且富有表现力的日志过滤。
- 基于时间的图表,支持分组功能,包括嵌套 JSON、Map 和 Array 字段。
- 可选的原始 SQL `WHERE` 查询支持,用于高级过滤(带权限检查)。
- 保存的视图:持久化并共享查询和布局的自定义 UI 配置。
- 基于角色的访问控制 (RBAC) 和 GitHub 身份验证集成。
- ClickHouse 端无需额外的代理或组件。

[Telescope 源代码](https://github.com/iamtelescope/telescope) · [在线演示](https://demo.iamtelescope.net)


## 商业产品 {#commercial}

### DataGrip {#datagrip}

[DataGrip](https://www.jetbrains.com/datagrip/) 是 JetBrains 推出的数据库 IDE,对 ClickHouse 提供专门支持。它也集成在其他基于 IntelliJ 的工具中:PyCharm、IntelliJ IDEA、GoLand、PhpStorm 等。

功能特性:

- 极快的代码补全。
- ClickHouse 语法高亮。
- 支持 ClickHouse 特有功能,例如嵌套列、表引擎。
- 数据编辑器。
- 重构功能。
- 搜索和导航。

### Yandex DataLens {#yandex-datalens}

[Yandex DataLens](https://cloud.yandex.ru/services/datalens) 是一个数据可视化和分析服务。

功能特性:

- 提供广泛的可视化选项,从简单的柱状图到复杂的仪表板。
- 仪表板可以公开访问。
- 支持包括 ClickHouse 在内的多种数据源。
- 基于 ClickHouse 的物化数据存储。

DataLens 对于低负载项目[免费提供](https://cloud.yandex.com/docs/datalens/pricing),即使用于商业用途也是如此。

- [DataLens 文档](https://cloud.yandex.com/docs/datalens/)。
- 关于从 ClickHouse 数据库可视化数据的[教程](https://cloud.yandex.com/docs/solutions/datalens/data-from-ch-visualization)。

### Holistics Software {#holistics-software}

[Holistics](https://www.holistics.io/) 是一个全栈数据平台和商业智能工具。

功能特性:

- 自动化的电子邮件、Slack 和 Google Sheet 报告调度。
- 带有可视化、版本控制、自动补全、可重用查询组件和动态过滤器的 SQL 编辑器。
- 通过 iframe 嵌入报告和仪表板分析。
- 数据准备和 ETL 功能。
- 支持数据关系映射的 SQL 数据建模。

### Looker {#looker}

[Looker](https://looker.com) 是一个数据平台和商业智能工具,支持包括 ClickHouse 在内的 50 多种数据库方言。Looker 提供 SaaS 平台和自托管版本。用户可以通过浏览器使用 Looker 来探索数据、构建可视化和仪表板、调度报告,并与同事分享见解。Looker 提供了丰富的工具集,可将这些功能嵌入到其他应用程序中,并提供 API 以便与其他应用程序集成数据。

功能特性:

- 使用 LookML 进行简单敏捷的开发,该语言支持精心设计的[数据建模](https://looker.com/platform/data-modeling),以支持报告编写者和最终用户。
- 通过 Looker 的[数据操作](https://looker.com/platform/actions)实现强大的工作流集成。

[如何在 Looker 中配置 ClickHouse。](https://docs.looker.com/setup-and-management/database-config/clickhouse)

### SeekTable {#seektable}

[SeekTable](https://www.seektable.com) 是一个用于数据探索和运营报告的自助式 BI 工具。它既提供云服务,也提供自托管版本。SeekTable 的报告可以嵌入到任何 Web 应用程序中。

功能特性:

- 面向业务用户的友好报告构建器。
- 强大的报告参数,用于 SQL 过滤和特定报告的查询自定义。
- 可以通过原生 TCP/IP 端点和 HTTP(S) 接口(2 种不同的驱动程序)连接到 ClickHouse。
- 可以在维度/度量定义中充分利用 ClickHouse SQL 方言的所有功能。
- 用于自动化报告生成的 [Web API](https://www.seektable.com/help/web-api-integration)。
- 支持带有账户数据[备份/恢复](https://www.seektable.com/help/self-hosted-backup-restore)的报告开发流程;数据模型(立方体)/报告配置采用人类可读的 XML 格式,可以存储在版本控制系统中。

SeekTable 对于个人/个体使用是[免费的](https://www.seektable.com/help/cloud-pricing)。

[如何在 SeekTable 中配置 ClickHouse 连接。](https://www.seektable.com/help/clickhouse-pivot-table)

### Chadmin {#chadmin}

[Chadmin](https://github.com/bun4uk/chadmin) 是一个简单的用户界面,可以可视化 ClickHouse 集群上当前正在运行的查询及其相关信息,并可根据需要终止这些查询。

### TABLUM.IO {#tablum_io}

[TABLUM.IO](https://tablum.io/) — 一个用于 ETL 和可视化的在线查询和分析工具。它允许连接到 ClickHouse,通过多功能 SQL 控制台查询数据,以及从静态文件和第三方服务加载数据。TABLUM.IO 可以将数据结果可视化为图表和表格。


功能：

- ETL：从常见数据库、本地和远程文件加载数据，以及通过 API 调用加载数据。
- 多功能 SQL 控制台，支持语法高亮和可视化查询构建。
- 以图表和数据表形式进行数据可视化。
- 支持数据物化和子查询。
- 将数据报表发送到 Slack、Telegram 或电子邮件。
- 通过专有 API 构建数据管道。
- 支持以 JSON、CSV、SQL、HTML 格式导出数据。
- 基于 Web 的界面。

TABLUM.IO 可以作为自托管方案运行（以 Docker 镜像形式），也可以在云端运行。
许可：带有 3 个月免费试用期的[商业](https://tablum.io/pricing)产品。

在[云端免费试用](https://tablum.io/try)。
在 [TABLUM.IO](https://tablum.io/) 了解更多产品信息。

### CKMAN {#ckman}

[CKMAN](https://www.github.com/housepower/ckman) 是一款用于管理和监控 ClickHouse 集群的工具！

功能：

- 通过浏览器界面快速便捷地实现集群自动化部署
- 支持对集群进行扩容或缩容
- 对集群中的数据进行负载均衡
- 在线升级集群
- 在页面上修改集群配置
- 提供集群节点监控和 ZooKeeper 监控
- 监控表和分区状态，并监控慢 SQL 语句
- 提供易用的 SQL 执行页面

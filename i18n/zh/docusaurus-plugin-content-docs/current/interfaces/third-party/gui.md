---
description: '用于操作 ClickHouse 的第三方图形界面（GUI）工具和应用程序列表'
sidebar_label: '图形界面'
sidebar_position: 28
slug: /interfaces/third-party/gui
title: '第三方开发者提供的图形界面'
doc_type: 'reference'
---



# 第三方开发者的可视化界面 {#visual-interfaces-from-third-party-developers}



## 开源 {#open-source}

### agx {#agx}

[agx](https://github.com/agnosticeng/agx) 是一款使用 Tauri 和 SvelteKit 构建的桌面应用程序，为使用 ClickHouse 内置数据库引擎（chdb）进行数据探索和查询提供了现代化界面。

- 在运行原生应用时利用 chdb。
- 在运行 Web 实例时可以连接到 ClickHouse 实例。
- 集成 Monaco 编辑器，带来熟悉的编辑体验。
- 提供多种且持续演进的数据可视化方式。

### ch-ui {#ch-ui}

[ch-ui](https://github.com/caioricciuti/ch-ui) 是一个为 ClickHouse 数据库设计的简洁 React.js 应用界面，用于执行查询和可视化数据。基于 React 和 ClickHouse Web 客户端构建，提供简洁且易用的 UI，便于进行数据库交互。

功能特性：

- ClickHouse 集成：轻松管理连接并执行查询。
- 响应式标签页管理：可动态处理多个标签页，例如查询标签页和数据表标签页。
- 性能优化：使用 IndexedDB 进行高效缓存和状态管理。
- 本地数据存储：所有数据都存储在浏览器本地，不会发送到任何其他地方。

### ChartDB {#chartdb}

[ChartDB](https://chartdb.io) 是一个免费开源工具，可通过单条查询对包括 ClickHouse 在内的数据库 schema 进行可视化和设计。基于 React 构建，提供无缝且易用的体验，无需数据库凭证或注册即可开始使用。

功能特性：

- schema 可视化：即时导入并可视化你的 ClickHouse schema，包括带有物化视图和标准视图的 ER 图，并展示对数据表的引用关系。
- AI 驱动的 DDL 导出：轻松生成 DDL 脚本，以改进 schema 管理和文档化。
- 多 SQL 方言支持：兼容多种 SQL 方言，可用于不同的数据库环境。
- 无需注册或凭证：所有功能都可直接在浏览器中使用，体验顺畅且安全。

[ChartDB 源代码](https://github.com/chartdb/chartdb)。

### DataPup {#datapup}

[DataPup](https://github.com/DataPupOrg/DataPup) 是一款现代的、AI 辅助的跨平台数据库客户端，对 ClickHouse 提供原生支持。

功能特性：

- AI 驱动的 SQL 查询辅助，提供智能建议
- 原生 ClickHouse 连接支持，并安全处理凭证
- 美观、易用且无障碍的界面，支持多种主题（浅色、深色及多彩变体）
- 高级查询结果过滤与探索能力
- 跨平台支持（macOS、Windows、Linux）
- 快速且响应灵敏的性能
- 开源并采用 MIT 许可证

### ClickHouse Schema Flow Visualizer {#clickhouse-schemaflow-visualizer}

[ClickHouse Schema Flow Visualizer](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer) 是一个用于通过 Mermaid.js 图表可视化 ClickHouse 表关系的强大开源 Web 应用。你可以通过直观界面浏览数据库和数据表，利用可选的行数与大小信息探索表元数据，并导出交互式 schema 图。

功能特性：

- 通过直观界面浏览 ClickHouse 数据库和数据表
- 使用 Mermaid.js 图表可视化表之间的关系
- 使用与表类型匹配的颜色编码图标，以获得更佳可视化效果
- 查看数据在数据表之间流动的方向
- 将图表导出为独立的 HTML 文件
- 切换元数据可见性（表行数和大小信息）
- 通过 TLS 与 ClickHouse 建立安全连接
- 适配所有设备的响应式 Web 界面

[ClickHouse Schema Flow Visualizer - 源代码](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer)

### Tabix {#tabix}

[Tabix](https://github.com/tabixio/tabix) 项目中的 ClickHouse Web 界面。

功能特性：

- 直接通过浏览器与 ClickHouse 交互，无需安装额外软件。
- 带语法高亮的查询编辑器。
- 命令自动补全。
- 用于图形化分析查询执行情况的工具。
- 多种配色方案选项。

[Tabix 文档](https://tabix.io/doc/)。

### HouseOps {#houseops}

[HouseOps](https://github.com/HouseOps/HouseOps) 是适用于 macOS、Linux 和 Windows 的 UI/IDE。

功能特性：

- 带语法高亮的查询构建器，可通过表格或 JSON 视图查看响应。
- 将查询结果导出为 CSV 或 JSON。
- 带描述的进程列表，支持写入模式，并可停止（`KILL`）进程。
- 数据库拓扑图，展示所有数据表及其列，并附带额外信息。
- 快速查看列大小。
- 服务器配置管理。

以下功能计划后续开发：

- 数据库管理。
- 用户管理。
- 实时数据分析。
- 集群监控。
- 集群管理。
- 监控复制表和 Kafka 表。

### LightHouse {#lighthouse}



[LightHouse](https://github.com/VKCOM/lighthouse) 是一个适用于 ClickHouse 的轻量级 Web 界面。

功能：

- 带有过滤和元数据的表列表。
- 带有过滤和排序功能的表预览。
- 只读查询执行。

### Redash {#redash}

[Redash](https://github.com/getredash/redash) 是一个数据可视化平台。

Redash 支持包括 ClickHouse 在内的多种数据源，可以将来自不同数据源的查询结果关联为一个最终数据集。

功能：

- 功能强大的查询编辑器。
- 数据库浏览器。
- 可视化工具，允许你以不同形式呈现数据。

### Grafana {#grafana}

[Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) 是一个监控和可视化平台。

“Grafana allows you to query, visualize, alert on and understand your metrics no matter where they are stored. Create, explore, and share dashboards with your team and foster a data-driven culture. Trusted and loved by the community” &mdash; grafana.com。

ClickHouse 数据源插件为 ClickHouse 作为后端数据库提供支持。

### qryn {#qryn}

[qryn](https://metrico.in) 是一个基于 ClickHouse 的多协议高性能可观测性栈 _(前身为 cLoki)_，与 Grafana 原生集成，允许用户从任何支持 Loki/LogQL、Prometheus/PromQL、OTLP/Tempo、Elastic、InfluxDB 等众多代理中摄取并分析日志、指标和遥测追踪。

功能：

- 内置 Explore UI 和 LogQL CLI，用于查询、提取和可视化数据
- 原生 Grafana API 支持，无需插件即可完成查询、处理、摄取、追踪和告警
- 功能强大的流水线，可动态搜索、过滤并从日志、事件、追踪等中提取数据
- 摄取和 PUSH API 与 LogQL、PromQL、InfluxDB、Elastic 等透明兼容
- 开箱即用，可与 Promtail、Grafana-Agent、Vector、Logstash、Telegraf 等多种 Agent 搭配使用

### DBeaver {#dbeaver}

[DBeaver](https://dbeaver.io/) —— 通用桌面数据库客户端，支持 ClickHouse。

功能：

- 支持语法高亮和自动补全的查询开发。
- 带过滤器和元数据搜索的表列表。
- 表数据预览。
- 全文搜索。

默认情况下，DBeaver 连接时不使用会话（例如 CLI 会使用会话）。如果你需要会话支持（例如为你的会话设置参数），请编辑驱动连接属性并将 `session_id` 设置为一个随机字符串（其底层使用 HTTP 连接）。然后你就可以在查询窗口中使用任意设置。

### clickhouse-cli {#clickhouse-cli}

[clickhouse-cli](https://github.com/hatarist/clickhouse-cli) 是一个用 Python 3 编写的 ClickHouse 命令行客户端替代工具。

功能：

- 自动补全。
- 查询和数据输出的语法高亮。
- 数据输出的分页器支持。
- 自定义类似 PostgreSQL 的命令。

### clickhouse-flamegraph {#clickhouse-flamegraph}

[clickhouse-flamegraph](https://github.com/Slach/clickhouse-flamegraph) 是一个专门用于将 `system.trace_log` 可视化为 [flamegraph](http://www.brendangregg.com/flamegraphs.html) 的工具。

### clickhouse-plantuml {#clickhouse-plantuml}

[cickhouse-plantuml](https://pypi.org/project/clickhouse-plantuml/) 是一个用于生成表结构 [PlantUML](https://plantuml.com/) 图的脚本。

### ClickHouse table graph {#clickhouse-table-graph}

[ClickHouse table graph](https://github.com/mbaksheev/clickhouse-table-graph) 是一个用于可视化 ClickHouse 表之间依赖关系的简单 CLI 工具。该工具从 `system.tables` 表中检索表之间的连接关系，并以 [mermaid](https://mermaid.js.org/syntax/flowchart.html) 格式构建依赖流程图。借助该工具，你可以轻松可视化表依赖关系，并理解 ClickHouse 数据库中的数据流。得益于 mermaid，生成的流程图十分美观，并且可以轻松添加到你的 Markdown 文档中。

### xeus-clickhouse {#xeus-clickhouse}

[xeus-clickhouse](https://github.com/wangfenjin/xeus-clickhouse) 是一个适用于 ClickHouse 的 Jupyter 内核，支持在 Jupyter 中使用 SQL 查询 ClickHouse 数据。

### MindsDB Studio {#mindsdb}



[MindsDB](https://mindsdb.com/) 是一个面向包括 ClickHouse 在内的数据库的开源 AI 层，可以让你轻松开发、训练和部署最先进的机器学习模型。MindsDB Studio（GUI）可以从数据库中训练新模型、解释模型生成的预测结果、识别潜在的数据偏差，并使用可解释 AI 功能评估和可视化模型精度，从而更快速地调整和优化你的机器学习模型。

### DBM {#dbm}

[DBM](https://github.com/devlive-community/dbm) DBM 是一个用于 ClickHouse 的可视化管理工具！

特性：

- 支持查询历史（分页、清空等）
- 支持选中 SQL 片段执行查询
- 支持终止查询
- 支持表管理（元数据、删除、预览）
- 支持数据库管理（删除、创建）
- 支持自定义查询
- 支持多数据源管理（连接测试、监控）
- 支持监控（处理器、连接、查询）
- 支持数据迁移

### Bytebase {#bytebase}

[Bytebase](https://bytebase.com) 是一个基于 Web 的开源架构变更和版本控制工具，面向团队使用。它支持包括 ClickHouse 在内的多种数据库。

特性：

- 支持开发人员与 DBA 之间的架构评审。
- Database-as-Code，将架构在 GitLab 等 VCS 中进行版本控制，并在代码提交时触发部署。
- 基于环境策略的简化部署流程。
- 完整的迁移历史。
- 架构漂移检测。
- 备份与恢复。
- RBAC（基于角色的访问控制）。

### Zeppelin-Interpreter-for-ClickHouse {#zeppelin-interpreter-for-clickhouse}

[Zeppelin-Interpreter-for-ClickHouse](https://github.com/SiderZhang/Zeppelin-Interpreter-for-ClickHouse) 是一个适用于 ClickHouse 的 [Zeppelin](https://zeppelin.apache.org) 解释器。与 JDBC 解释器相比，它可以为长时间运行的查询提供更好的超时控制。

### ClickCat {#clickcat}

[ClickCat](https://github.com/clickcat-project/ClickCat) 是一个直观友好的用户界面，可用于搜索、探索和可视化你的 ClickHouse 数据。

特性：

- 一个在线 SQL 编辑器，无需任何安装即可运行你的 SQL 代码。
- 你可以查看所有进程和变更（mutations）。对于尚未完成的进程，可以在 UI 中将其终止。
- 指标包括集群分析、数据分析和查询分析。

### ClickVisual {#clickvisual}

[ClickVisual](https://clickvisual.net/) ClickVisual 是一个轻量级的开源日志查询、分析与告警可视化平台。

特性：

- 支持一键创建分析日志库
- 支持日志采集配置管理
- 支持用户自定义索引配置
- 支持告警配置
- 支持将权限粒度细化到库级和表级的权限配置

### ClickHouse-Mate {#clickmate}

[ClickHouse-Mate](https://github.com/metrico/clickhouse-mate) 是一个 Angular Web 客户端和用户界面，用于在 ClickHouse 中搜索和探索数据。

特性：

- ClickHouse SQL 查询自动补全
- 快速的数据库与数据表树状导航
- 高级结果过滤与排序
- 内联 ClickHouse SQL 文档
- 查询预设和历史记录
- 100% 基于浏览器，无需服务器/后端

该客户端可通过 GitHub Pages 即时使用：https://metrico.github.io/clickhouse-mate/

### Uptrace {#uptrace}

[Uptrace](https://github.com/uptrace/uptrace) 是一个 APM（应用性能监控）工具，基于 OpenTelemetry 和 ClickHouse 提供分布式追踪和指标能力。

特性：

- [OpenTelemetry 追踪](https://uptrace.dev/opentelemetry/distributed-tracing.html)、指标与日志。
- 通过 AlertManager 实现 Email/Slack/PagerDuty 通知。
- 类 SQL 查询语言用于聚合 span。
- 类 PromQL 的语言用于查询指标。
- 预构建的指标仪表盘。
- 通过 YAML 配置支持多用户/多项目。

### clickhouse-monitoring {#clickhouse-monitoring}

[clickhouse-monitoring](https://github.com/duyet/clickhouse-monitoring) 是一个基于 Next.js 的简单仪表盘，依赖 `system.*` 表来帮助监控并提供 ClickHouse 集群的概览。

特性：

- 查询监控：当前查询、查询历史、查询资源（内存、读取的 part、file_open 等）、最耗资源的查询、最常使用的表或列等。
- 集群监控：总内存/CPU 使用、分布式队列、全局设置、MergeTree 设置、各种指标等。
- 表和 part 信息：大小、行数、压缩情况、part 大小等，细化到列级别的详细信息。
- 实用工具：Zookeeper 数据探索、查询 EXPLAIN、终止查询等。
- 指标可视化图表：查询和资源使用、合并/变更数量、合并性能、查询性能等。

### CKibana {#ckibana}



[CKibana](https://github.com/TongchengOpenSource/ckibana) 是一款轻量级服务，可让你使用原生 Kibana UI 轻松搜索、探索和可视化 ClickHouse 数据。

功能特性：

- 将来自原生 Kibana UI 的图表请求转换为 ClickHouse 查询语法。
- 支持采样与缓存等高级特性，以提升查询性能。
- 从 Elasticsearch 迁移到 ClickHouse 后，可将用户的学习成本降到最低。

### Telescope {#telescope}

[Telescope](https://iamtelescope.net/) 是一个用于探索存储在 ClickHouse 中日志的现代 Web 界面。它提供用户友好的 UI，可对日志数据进行查询、可视化和管理，并支持细粒度的访问控制。

功能特性：

- 简洁、响应式的 UI，提供强大的过滤器和可自定义字段选择。
- 使用 FlyQL 语法，实现直观且表达力强的日志过滤。
- 基于时间的图表，支持 group by，包括嵌套 JSON、Map 和 Array 字段。
- 可选的原生 SQL `WHERE` 查询支持，用于高级过滤（带权限检查）。
- 已保存视图：持久化并分享查询和布局的自定义 UI 配置。
- 基于角色的访问控制（RBAC）以及 GitHub 身份验证集成。
- 在 ClickHouse 端无需额外的 Agent 或组件。

[Telescope 源码](https://github.com/iamtelescope/telescope) · [在线演示](https://demo.iamtelescope.net)



## 商业版 {#commercial}

### DataGrip {#datagrip}

[DataGrip](https://www.jetbrains.com/datagrip/) 是 JetBrains 出品的数据库 IDE，对 ClickHouse 提供专门支持。它也集成在其他基于 IntelliJ 的工具中：PyCharm、IntelliJ IDEA、GoLand、PhpStorm 等。

功能特性：

- 极快的代码补全。
- ClickHouse 语法高亮。
- 支持 ClickHouse 特有功能，例如嵌套列、表引擎。
- 数据编辑器。
- 重构功能。
- 搜索与导航。

### Yandex DataLens {#yandex-datalens}

[Yandex DataLens](https://cloud.yandex.ru/services/datalens) 是一个数据可视化与分析服务。

功能特性：

- 提供广泛的可视化形式，从简单的条形图到复杂的仪表板。
- 仪表板可以公开访问。
- 支持多种数据源，包括 ClickHouse。
- 基于 ClickHouse 的物化数据存储。

对于低负载项目，即使是商业用途，DataLens 也[可免费使用](https://cloud.yandex.com/docs/datalens/pricing)。

- [DataLens 文档](https://cloud.yandex.com/docs/datalens/)。
- [教程](https://cloud.yandex.com/docs/solutions/datalens/data-from-ch-visualization)：可视化来自 ClickHouse 数据库的数据。

### Holistics Software {#holistics-software}

[Holistics](https://www.holistics.io/) 是一套全栈数据平台与商业智能工具。

功能特性：

- 支持通过邮件、Slack 和 Google Sheet 自动定时发送报表。
- 带有可视化、版本控制、自动补全、可复用查询组件和动态过滤器的 SQL 编辑器。
- 通过 iframe 嵌入的报表和仪表板分析。
- 数据准备和 ETL 能力。
- 支持 SQL 数据建模，用于数据的关系映射。

### Looker {#looker}

[Looker](https://looker.com) 是一个数据平台和商业智能工具，支持 50 多种数据库方言，包括 ClickHouse。Looker 既可作为 SaaS 平台使用，也可自托管。用户可以通过浏览器使用 Looker 来探索数据、构建可视化和仪表板、调度报表，并与同事分享分析洞见。Looker 提供了一套丰富的工具，将这些功能嵌入到其他应用程序中，并提供 API 以便与其他应用集成数据。

功能特性：

- 使用 LookML 进行轻量敏捷的开发，这是一门支持精心设计[数据建模](https://looker.com/platform/data-modeling)的语言，可帮助报表作者和终端用户。
- 通过 Looker 的 [Data Actions](https://looker.com/platform/actions) 实现强大的工作流集成。

[如何在 Looker 中配置 ClickHouse。](https://docs.looker.com/setup-and-management/database-config/clickhouse)

### SeekTable {#seektable}

[SeekTable](https://www.seektable.com) 是一款用于数据探索和运营报表的自助式 BI 工具，既提供云服务，也提供自托管版本。SeekTable 生成的报表可以嵌入到任意 Web 应用中。

功能特性：

- 面向业务用户的友好报表构建器。
- 强大的报表参数，用于 SQL 过滤和报表级查询定制。
- 既可以通过原生 TCP/IP 端点，也可以通过 HTTP(S) 接口连接 ClickHouse（2 种不同驱动）。
- 在维度/度量定义中可以充分发挥 ClickHouse SQL 方言的全部能力。
- 提供用于自动生成报表的 [Web API](https://www.seektable.com/help/web-api-integration)。
- 支持带有账号数据[备份/恢复](https://www.seektable.com/help/self-hosted-backup-restore)的报表开发流程；数据模型（多维立方体）/报表配置采用人类可读的 XML 格式，可以存放在版本控制系统中。

SeekTable 对于个人/个体使用是[免费的](https://www.seektable.com/help/cloud-pricing)。

[如何在 SeekTable 中配置 ClickHouse 连接。](https://www.seektable.com/help/clickhouse-pivot-table)

### Chadmin {#chadmin}

[Chadmin](https://github.com/bun4uk/chadmin) 是一个简单的 UI，用于可视化你在 ClickHouse 集群上当前正在运行的查询及其相关信息，并在需要时终止这些查询。

### TABLUM.IO {#tablum_io}

[TABLUM.IO](https://tablum.io/) 是一款用于 ETL 和可视化的在线查询与分析工具。它支持连接 ClickHouse，可通过通用的 SQL 控制台查询数据，也可以从静态文件和第三方服务加载数据。TABLUM.IO 可以将查询结果可视化为图表和表格。



功能：
- ETL：从常见数据库、本地和远程文件以及 API 调用中加载数据。
- 功能强大的 SQL 控制台，支持语法高亮和可视化查询构建器。
- 以图表和表格形式进行数据可视化。
- 数据物化和子查询。
- 向 Slack、Telegram 或电子邮件发送数据报表。
- 通过专有 API 构建数据流水线。
- 以 JSON、CSV、SQL、HTML 格式导出数据。
- 基于 Web 的界面。

TABLUM.IO 既可以以 Docker 镜像形式自托管部署，也可以在云端运行。  
许可证：[商业版](https://tablum.io/pricing) 产品，提供 3 个月免费试用期。

在[云端免费试用](https://tablum.io/try)。  
在 [TABLUM.IO](https://tablum.io/) 了解更多产品信息。

### CKMAN {#ckman}

[CKMAN](https://www.github.com/housepower/ckman) 是一个用于管理和监控 ClickHouse 集群的工具！

功能：

- 通过浏览器界面实现快速便捷的集群自动化部署
- 集群可灵活扩缩容
- 对集群数据进行负载均衡
- 在线升级集群
- 在页面上修改集群配置
- 提供集群节点监控和 ZooKeeper 监控
- 监控表和分区状态，并监控慢 SQL 语句
- 提供易于使用的 SQL 执行页面

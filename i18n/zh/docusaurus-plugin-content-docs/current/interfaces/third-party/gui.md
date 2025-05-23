---
'description': '用于与 ClickHouse 一起工作的第三方 GUI 工具和应用程序列表'
'sidebar_label': '可视化接口'
'sidebar_position': 28
'slug': '/interfaces/third-party/gui'
'title': '第三方开发者的可视化接口'
---


# 来自第三方开发者的可视化接口

## 开源 {#open-source}

### agx {#agx}

[agx](https://github.com/agnosticeng/agx) 是一款利用 Tauri 和 SvelteKit 构建的桌面应用程序，提供现代化的界面用于探索和查询使用 ClickHouse 嵌入式数据库引擎（chdb）处理的数据。

- 在运行本地应用时利用 ch-db。
- 在运行 Web 实例时可以连接到 Clickhouse 实例。
- Monaco 编辑器让你感到熟悉。
- 多种不断发展的数据可视化。

### ch-ui {#ch-ui}

[ch-ui](https://github.com/caioricciuti/ch-ui) 是一个简单的 React.js 应用界面，旨在执行查询和可视化 ClickHouse 数据库的数据。它是使用 React 和 ClickHouse Web 客户端构建的，提供简洁且用户友好的 UI，方便数据库交互。

特点：

- ClickHouse 集成：轻松管理连接并执行查询。
- 响应式标签管理：动态处理多个标签，如查询和表标签。
- 性能优化：利用 Indexed DB 实现高效的缓存和状态管理。
- 本地数据存储：所有数据都在浏览器中本地存储，确保没有数据被发送到其他地方。

### ChartDB {#chartdb}

[ChartDB](https://chartdb.io) 是一款免费的开源工具，用于可视化和设计数据库架构，包括 ClickHouse，使用单个查询构建。它使用 React 构建，提供无缝且用户友好的体验，无需数据库凭据或注册即可开始使用。

特点：

- 架构可视化：即时导入和可视化你的 ClickHouse 架构，包括含有物化视图和标准视图的 ER 图，并展示表的引用。
- AI 驱动的 DDL 导出：轻松生成 DDL 脚本以改善架构管理和文档编制。
- 多 SQL 方言支持：兼容多种 SQL 方言，适用于不同数据库环境。
- 无需注册或凭据：所有功能直接在浏览器中访问，保持无障碍和安全。

[ChartDB 源代码](https://github.com/chartdb/chartdb)。

### ClickHouse Schema Flow Visualizer {#clickhouse-schemaflow-visualizer}

一款强大的 Web 应用程序，用于使用 Mermaid.js 图表可视化 ClickHouse 表关系。

特点：

- 通过直观的界面浏览 ClickHouse 数据库和表
- 使用 Mermaid.js 图表可视化表关系
- 查看表之间数据流的方向
- 将图表导出为独立的 HTML 文件
- 使用 TLS 支持安全连接到 ClickHouse
- 适用于所有设备的响应式 Web 界面

[ClickHouse Schema Flow Visualizer - 源代码](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer)

### Tabix {#tabix}

Tabix 项目的 ClickHouse Web 界面。

特点：

- 从浏览器直接与 ClickHouse 交互，无需安装其他软件。
- 带语法高亮的查询编辑器。
- 命令的自动完成。
- 查询执行的图形分析工具。
- 颜色方案选项。

[Tabix 文档](https://tabix.io/doc/)。

### HouseOps {#houseops}

[HouseOps](https://github.com/HouseOps/HouseOps) 是一个适用于 OSX、Linux 和 Windows 的 UI/IDE。

特点：

- 带语法高亮的查询构建器。以表格或 JSON 视图查看响应。
- 将查询结果导出为 CSV 或 JSON。
- 包含描述的进程列表。写模式。能够停止（`KILL`）进程。
- 数据库图，显示所有表及其列的额外信息。
- 快速查看列大小。
- 服务器配置。

以下功能正在计划开发中：

- 数据库管理。
- 用户管理。
- 实时数据分析。
- 集群监控。
- 集群管理。
- 监控复制和 Kafka 表。

### LightHouse {#lighthouse}

[LightHouse](https://github.com/VKCOM/lighthouse) 是一款轻量级的 ClickHouse Web 界面。

特点：

- 带过滤和元数据的表列表。
- 带过滤和排序的表预览。
- 只读查询执行。

### Redash {#redash}

[Redash](https://github.com/getredash/redash) 是一款数据可视化平台。

支持包括 ClickHouse 在内的多种数据源，Redash 可以将来自不同数据源的查询结果合并为一个最终数据集。

特点：

- 强大的查询编辑器。
- 数据库浏览器。
- 可视化工具，可以以不同的形式表示数据。

### Grafana {#grafana}

[Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) 是一款监控和可视化平台。

"Grafana 允许你查询、可视化、警报和理解你的指标，无论它们存储在哪里。创建、探索并与团队共享仪表板，培养数据驱动的文化。受到社区的信任和喜爱" &mdash; grafana.com。

ClickHouse 数据源插件支持 ClickHouse 作为后端数据库。

### qryn {#qryn}

[qryn](https://metrico.in) 是一个多语言高性能可观察性栈用于 ClickHouse _(原名 cLoki)_，支持 Grafana 原生集成，允许用户获取和分析来自任何支持 Loki/LogQL、Prometheus/PromQL、OTLP/Tempo、Elastic、InfluxDB 等的代理的日志、指标和遥测跟踪。

特点：

- 内置探索 UI 和 LogQL CLI 用于查询、提取和可视化数据
- 原生 Grafana API 支持查询、处理、摄取、追踪和无插件告警
- 强大的管道，用于动态搜索、过滤和提取日志、事件、跟踪等数据
- 与 LogQL、PromQL、InfluxDB、Elastic 等透明兼容的摄取和 PUSH API
- 可与 Promtail、Grafana-Agent、Vector、Logstash、Telegraf 等代理一起使用

### DBeaver {#dbeaver}

[DBeaver](https://dbeaver.io/) - 通用的桌面数据库客户端，支持 ClickHouse。

特点：

- 带语法高亮和自动完成功能的查询开发。
- 带过滤器的表列表和元数据搜索。
- 表数据预览。
- 完整文本搜索。

默认情况下，DBeaver 不使用会话连接（例如 CLI 是如此）。如果需要会话支持（例如为会话设置设置），请编辑驱动连接属性并将 `session_id` 设置为随机字符串（它在后台使用 http 连接）。然后可以在查询窗口中使用任何设置。

### clickhouse-cli {#clickhouse-cli}

[clickhouse-cli](https://github.com/hatarist/clickhouse-cli) 是一个替代的 Command-line 客户端，用于 ClickHouse，使用 Python 3 编写。

特点：

- 自动完成。
- 查询和数据输出的语法高亮。
- 数据输出的分页支持。
- 自定义 PostgreSQL 风格的命令。

### clickhouse-flamegraph {#clickhouse-flamegraph}

[clickhouse-flamegraph](https://github.com/Slach/clickhouse-flamegraph) 是一个用于可视化 `system.trace_log` 的专用工具，呈现为 [flamegraph](http://www.brendangregg.com/flamegraphs.html)。

### clickhouse-plantuml {#clickhouse-plantuml}

[cickhouse-plantuml](https://pypi.org/project/clickhouse-plantuml/) 是生成表架构的 [PlantUML](https://plantuml.com/) 图的脚本。

### ClickHouse table graph {#clickhouse-table-graph}

[ClickHouse table graph](https://github.com/mbaksheev/clickhouse-table-graph) 是一个简单的 CLI 工具，用于可视化 ClickHouse 表之间的依赖关系。该工具从 `system.tables` 表中检索表之间的连接，并按 [mermaid](https://mermaid.js.org/syntax/flowchart.html) 格式构建依赖流图。使用此工具可以轻松可视化表依赖关系并理解 ClickHouse 数据库中的数据流。得益于 mermaid，生成的流图看起来美观，并且可以轻松添加到你的 markdown 文档中。

### xeus-clickhouse {#xeus-clickhouse}

[xeus-clickhouse](https://github.com/wangfenjin/xeus-clickhouse) 是一个 Jupyter 核心，用于 ClickHouse，支持在 Jupyter 中使用 SQL 查询 CH 数据。

### MindsDB Studio {#mindsdb}

[MindsDB](https://mindsdb.com/) 是一个开源的 AI 层，适用于包括 ClickHouse 在内的数据库，允许你轻松开发、训练和部署最先进的机器学习模型。MindsDB Studio (GUI) 允许你从数据库中训练新模型，解释模型的预测，识别潜在的数据偏见，并使用可解释 AI 功能评估和可视化模型准确性，以更快地调整和优化你的机器学习模型。

### DBM {#dbm}

[DBM](https://github.com/devlive-community/dbm) 是一个可视化管理工具，专为 ClickHouse 设计！

特点：

- 支持查询历史（分页、清除所有等）。
- 支持选择的 SQL 子句查询。
- 支持终止查询。
- 支持表管理（元数据、删除、预览）。
- 支持数据库管理（删除、创建）。
- 支持自定义查询。
- 支持多数据源管理（连接测试、监控）。
- 支持监控（处理器、连接、查询）。
- 支持数据迁移。

### Bytebase {#bytebase}

[Bytebase](https://bytebase.com) 是一个基于 Web 的开源架构变更和版本控制工具，适用于团队。它支持多种数据库，包括 ClickHouse。

特点：

- 开发人员和 DBA 之间的架构审查。
- Data-as-Code，将架构在 VCS 中版本控制，比如 GitLab，并在代码提交时触发部署。
- 提供每个环境策略的流线化部署。
- 完整的迁移历史。
- 检测架构漂移。
- 备份与恢复。
- RBAC。

### Zeppelin-Interpreter-for-ClickHouse {#zeppelin-interpreter-for-clickhouse}

[Zeppelin-Interpreter-for-ClickHouse](https://github.com/SiderZhang/Zeppelin-Interpreter-for-ClickHouse) 是一个用于 ClickHouse 的 [Zeppelin](https://zeppelin.apache.org) 解释器。与 JDBC 解释器相比，它可以提供更好的超时控制来处理长时间运行的查询。

### ClickCat {#clickcat}

[ClickCat](https://github.com/clickcat-project/ClickCat) 是一个友好的用户界面，让你搜索、探索和可视化你的 ClickHouse 数据。

特点：

- 一个在线 SQL 编辑器，可以在不安装任何软件的情况下运行你的 SQL 代码。
- 你可以观察所有进程和变更。对于那些未完成的进程，你可以在 UI 中将其终止。
- 指标包括集群分析、数据分析和查询分析。

### ClickVisual {#clickvisual}

[ClickVisual](https://clickvisual.net/) ClickVisual 是一个轻量级的开源日志查询、分析和报警可视化平台。

特点：

- 支持一键创建分析日志库
- 支持日志收集配置管理
- 支持用户定义的索引配置
- 支持报警配置
- 支持库和表的权限配置

### ClickHouse-Mate {#clickmate}

[ClickHouse-Mate](https://github.com/metrico/clickhouse-mate) 是一个 Angular Web 客户端 + 用户界面，用于搜索和探索 ClickHouse 中的数据。

特点：

- ClickHouse SQL 查询自动完成
- 快速数据库和表树导航
- 高级结果过滤和排序
- 内联 ClickHouse SQL 文档
- 查询预设和历史记录
- 100% 基于浏览器，无需服务器/后端

该客户端可通过 GitHub 页面即时使用：https://metrico.github.io/clickhouse-mate/

### Uptrace {#uptrace}

[Uptrace](https://github.com/uptrace/uptrace) 是一款 APM 工具，提供分布式追踪和由 OpenTelemetry 和 ClickHouse 支持的指标。

特点：

- [OpenTelemetry 追踪](https://uptrace.dev/opentelemetry/distributed-tracing.html)、指标和日志。
- 使用 AlertManager 发送电子邮件/Slack/PagerDuty 通知。
- 类似 SQL 的查询语言来聚合跨度。
- 类似 PromQL 的语言来查询指标。
- 预构建的指标仪表板。
- 通过 YAML 配置支持多个用户/项目。

### clickhouse-monitoring {#clickhouse-monitoring}

[clickhouse-monitoring](https://github.com/duyet/clickhouse-monitoring) 是一个简单的 Next.js 仪表板，依赖于 `system.*` 表来帮助监控和提供 ClickHouse 集群的概览。

特点：

- 查询监控：当前查询、查询历史、查询资源（内存、读取的分区、文件打开等）、最昂贵的查询、使用最多的表或列等。
- 集群监控：总内存/CPU 使用情况、分布式队列、全局设置、mergetree 设置、指标等。
- 表和分区信息：大小、行数、压缩、分区大小等，按列级别详细展示。
- 有用的工具：Zookeeper 数据探索、查询 EXPLAIN、终止查询等。
- 可视化指标图：查询和资源使用情况、合并/变更的数量、合并性能、查询性能等。

### CKibana {#ckibana}

[CKibana](https://github.com/TongchengOpenSource/ckibana) 是一个轻量级服务，允许你轻松搜索、探索和可视化 ClickHouse 数据，使用原生 Kibana UI。

特点：

- 将原生 Kibana UI 的图表请求转换为 ClickHouse 查询语法。
- 支持高级功能，如抽样和缓存，以增强查询性能。
- 将用户从 ElasticSearch 迁移到 ClickHouse 后的学习成本降至最低。

## 商业 {#commercial}

### DataGrip {#datagrip}

[DataGrip](https://www.jetbrains.com/datagrip/) 是 JetBrains 的数据库 IDE，专门支持 ClickHouse。它还嵌入在其他基于 IntelliJ 的工具中：PyCharm、IntelliJ IDEA、GoLand、PhpStorm 等。

特点：

- 非常快速的代码完成。
- ClickHouse 语法高亮。
- 支持 ClickHouse 特有的功能，例如嵌套列、表引擎。
- 数据编辑器。
- 重构功能。
- 搜索和导航。

### Yandex DataLens {#yandex-datalens}

[Yandex DataLens](https://cloud.yandex.ru/services/datalens) 是一项数据可视化和分析服务。

特点：

- 提供广泛的可用可视化，从简单的条形图到复杂的仪表板。
- 仪表板可以公开发布。
- 支持多种数据源，包括 ClickHouse。
- 基于 ClickHouse 的物化数据存储。

DataLens 对于低负载项目，即使是商业用途，也是[免费](https://cloud.yandex.com/docs/datalens/pricing)的。

- [DataLens 文档](https://cloud.yandex.com/docs/datalens/)。
- [教程](https://cloud.yandex.com/docs/solutions/datalens/data-from-ch-visualization) 关于从 ClickHouse 数据库可视化数据。

### Holistics Software {#holistics-software}

[Holistics](https://www.holistics.io/) 是一个全栈数据平台和商业智能工具。

特点：

- 自动化的电子邮件、Slack 和 Google Sheet 报告调度。
- 具备可视化、版本控制、自动完成、可重用查询组件和动态过滤的 SQL 编辑器。
- 通过 iframe 嵌入报告和仪表板的分析。
- 数据准备和 ETL 能力。
- 支持关系数据映射的 SQL 数据建模。

### Looker {#looker}

[Looker](https://looker.com) 是一个数据平台和商业智能工具，支持 50 多种数据库方言，包括 ClickHouse。Looker 可用作 SaaS 平台和自托管。用户可以通过浏览器使用 Looker 探索数据、构建可视化和仪表板、安排报告并与同事分享他们的见解。Looker 提供了一整套丰富的工具用于在其他应用程序中嵌入这些功能，并提供 API 来将数据与其他应用程序集成。

特点：

- 使用 LookML 进行简单灵活的开发，该语言支持策划的
    [数据建模](https://looker.com/platform/data-modeling)，为报告编写者和最终用户提供支持。
- 通过 Looker 的 [数据操作](https://looker.com/platform/actions) 进行强大的工作流集成。

[如何在 Looker 中配置 ClickHouse](https://docs.looker.com/setup-and-management/database-config/clickhouse)。

### SeekTable {#seektable}

[SeekTable](https://www.seektable.com) 是一个自助式 BI 工具，用于数据探索和操作报告。它既提供云服务，也提供自托管版本。来自 SeekTable 的报告可以嵌入到任何 Web 应用中。

特点：

- 适合业务用户的报告构建器。
- 强大的报告参数，用于 SQL 过滤和特定报告查询的自定义。
- 可以通过原生 TCP/IP 端点和 HTTP(S) 接口（2 个不同的驱动程序）连接到 ClickHouse。
- 可以在维度/度量定义中使用 ClickHouse SQL 方言的所有强大功能。
- [Web API](https://www.seektable.com/help/web-api-integration) 用于自动报告生成。
- 支持报告开发流程的账户数据 [备份/恢复](https://www.seektable.com/help/self-hosted-backup-restore)；数据模型（立方体）/报告配置为可人读的 XML，并可以存储在版本控制系统中。

SeekTable 对于个人/个体使用是[免费的](https://www.seektable.com/help/cloud-pricing)。

[如何在 SeekTable 中配置 ClickHouse 连接](https://www.seektable.com/help/clickhouse-pivot-table)。

### Chadmin {#chadmin}

[Chadmin](https://github.com/bun4uk/chadmin) 是一个简单的 UI，您可以在其中可视化您当前正在 ClickHouse 集群上运行的查询及其相关信息，并在需要时终止它们。

### TABLUM.IO {#tablum_io}

[TABLUM.IO](https://tablum.io/) — 一个用于 ETL 和可视化的在线查询和分析工具。它允许连接到 ClickHouse，通过多功能 SQL 控制台查询数据，同时也可以从静态文件和第三方服务加载数据。TABLUM.IO 可以将数据结果可视化为图表和表格。

特点：
- ETL：从流行数据库、本地和远程文件、API 调用加载数据。
- 多功能 SQL 控制台，带有语法高亮和可视化查询构建器。
- 数据可视化为图表和表格。
- 数据物化和子查询。
- 通过 Slack、Telegram 或电子邮件的数据报告。
- 通过专有 API 的数据流水线。
- 数据导出为 JSON、CSV、SQL、HTML 格式。
- 基于 Web 的界面。

TABLUM.IO 可以作为自托管解决方案（作为 Docker 镜像）或云中运行。
许可证：[商业](https://tablum.io/pricing) 产品，提供 3 个月的免费期。

在云中免费试用[直接体验](https://tablum.io/try)。
在 [TABLUM.IO](https://tablum.io/) 上了解更多关于该产品的信息。

### CKMAN {#ckman}

[CKMAN](https://www.github.com/housepower/ckman) 是一个管理和监控 ClickHouse 集群的工具！

特点：

- 通过浏览器界面快速便捷地自动部署集群。
- 集群可以进行快速扩展或收缩。
- 对集群数据进行负载均衡。
- 在线升级集群。
- 在页面上修改集群配置。
- 提供集群节点和 Zookeeper 监控。
- 监控表和分区的状态，并监控慢 SQL 语句。
- 提供易于使用的 SQL 执行页面。

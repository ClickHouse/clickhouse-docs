---
'description': '与 ClickHouse 一起使用的第三方 GUI 工具和应用程序的列表'
'sidebar_label': '视觉界面'
'sidebar_position': 28
'slug': '/interfaces/third-party/gui'
'title': '来自第三方开发者的视觉界面'
'doc_type': 'reference'
---


# 第三方开发者的可视化接口

## 开源 {#open-source}

### agx {#agx}

[agx](https://github.com/agnosticeng/agx) 是一个使用 Tauri 和 SvelteKit 构建的桌面应用程序，提供了一个现代化的基于 ClickHouse 嵌入式数据库引擎 (chdb) 的数据探索和查询接口。

- 在运行本地应用程序时利用 ch-db。
- 在运行 web 实例时可以连接到 ClickHouse 实例。
- Monaco 编辑器，让您感到熟悉。
- 多种不断发展的数据可视化。

### ch-ui {#ch-ui}

[ch-ui](https://github.com/caioricciuti/ch-ui) 是一个简单的 React.js 应用界面，旨在为 ClickHouse 数据库执行查询和可视化数据。它使用 React 和 ClickHouse 的 web 客户端构建，提供了一个流畅且用户友好的 UI，便于数据库交互。

功能：

- ClickHouse 集成：轻松管理连接并执行查询。
- 响应式标签管理：动态处理多个标签，如查询和表标签。
- 性能优化：利用 Indexed DB 进行高效缓存和状态管理。
- 本地数据存储：所有数据保存在浏览器本地，确保数据不被发送到其他地方。

### ChartDB {#chartdb}

[ChartDB](https://chartdb.io) 是一个免费的开源工具，允许您通过单个查询可视化和设计数据库模式，包括 ClickHouse。它使用 React 构建，提供无缝的用户体验，无需数据库凭据或注册即可开始使用。

功能：

- 模式可视化：即时导入并可视化您的 ClickHouse 模式，包括带物化视图和标准视图的 ER 图，显示对表的引用。
- AI 驱动的 DDL 导出：轻松生成 DDL 脚本，以便更好地管理模式和文档。
- 多 SQL 方言支持：兼容多种 SQL 方言，适用于各种数据库环境。
- 无需注册或凭据：所有功能在浏览器中直接访问，方便又安全。

[ChartDB 源代码](https://github.com/chartdb/chartdb)。

### DataPup {#datapup}

[DataPup](https://github.com/DataPupOrg/DataPup) 是一个现代的 AI 辅助跨平台数据库客户端，支持本地 ClickHouse。

功能：

- AI 驱动的 SQL 查询助手，提供智能建议
- 原生 ClickHouse 连接支持，安全凭据处理
- 美观，易于访问的界面，提供多种主题（浅色、深色和彩色变体）
- 高级查询结果过滤和探索
- 跨平台支持（macOS、Windows、Linux）
- 快速响应的性能
- 开源且 MIT 许可

### ClickHouse Schema Flow Visualizer {#clickhouse-schemaflow-visualizer}

[ClickHouse Schema Flow Visualizer](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer) 是一个强大的开源网络应用程序，使用 Mermaid.js 图表可视化 ClickHouse 表关系。可以通过直观的界面浏览数据库和表，探索表元数据，查看可选的行数和大小信息，并导出交互式模式图。

功能：

- 通过直观的界面浏览 ClickHouse 数据库和表
- 使用 Mermaid.js 图表可视化表关系
- 颜色编码的图标匹配表类型，以便更好地可视化
- 查看表之间数据流的方向
- 将图表导出为独立的 HTML 文件
- 切换元数据可见性（表行和大小信息）
- 使用 TLS 支持与 ClickHouse 的安全连接
- 支持所有设备的响应式网络界面

[ClickHouse Schema Flow Visualizer - 源代码](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer)

### Tabix {#tabix}

[Tabix](https://github.com/tabixio/tabix) 项目的 ClickHouse 网络界面。

功能：

- 直接通过浏览器与 ClickHouse 交互，无需安装额外软件。
- 带语法高亮的查询编辑器。
- 命令自动补全。
- 查询执行的图形分析工具。
- 颜色方案选项。

[Tabix 文档](https://tabix.io/doc/)。

### HouseOps {#houseops}

[HouseOps](https://github.com/HouseOps/HouseOps) 是一款适用于 OSX、Linux 和 Windows 的 UI/IDE。

功能：

- 带语法高亮的查询构建器。可以以表格或 JSON 视图查看响应。
- 将查询结果导出为 CSV 或 JSON。
- 进程列表和描述。写入模式。可以停止 (`KILL`) 进程。
- 数据库图。展示所有表及其列的附加信息。
- 快速查看列大小。
- 服务器配置。

以下功能计划开发：

- 数据库管理。
- 用户管理。
- 实时数据分析。
- 集群监控。
- 集群管理。
- 监控复制和 Kafka 表。

### LightHouse {#lighthouse}

[LightHouse](https://github.com/VKCOM/lighthouse) 是一个轻量级的 ClickHouse 网络界面。

功能：

- 带过滤和元数据的表列表。
- 表预览，支持过滤和排序。
- 只读查询执行。

### Redash {#redash}

[Redash](https://github.com/getredash/redash) 是一个数据可视化平台。

支持多种数据源，包括 ClickHouse，Redash 可以将来自不同数据源的查询结果合并为一个最终数据集。

功能：

- 强大的查询编辑器。
- 数据库浏览器。
- 可视化工具，让您以不同形式展示数据。

### Grafana {#grafana}

[Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) 是一个监控和可视化平台。

“Grafana 允许您查询、可视化、警报和理解您的度量，无论它们存储在哪里。创建、探索和与您的团队共享仪表板，培养数据驱动的文化。受到社区的信任和喜爱” &mdash; grafana.com。

ClickHouse 数据源插件为 ClickHouse 作为后台数据库提供支持。

### qryn {#qryn}

[qryn](https://metrico.in) 是一个多语言、高性能的 ClickHouse 观察堆栈 _(前称 cLoki)_，支持与 Grafana 的原生集成，允许用户从任何支持 Loki/LogQL、Prometheus/PromQL、OTLP/Tempo、Elastic、InfluxDB 等代理中摄取和分析日志、度量和遥测迹。

功能：

- 内置 Explore UI 和 LogQL CLI 用于查询、提取和可视化数据
- 原生 Grafana API 支持查询、处理、摄取、追踪和警报，无需插件
- 强大的管道，动态搜索、过滤和提取日志、事件、追踪及更多数据
- 摄取和 PUSH API 与 LogQL、PromQL、InfluxDB、Elastic 及更多透明兼容
- 与 Promtail、Grafana-Agent、Vector、Logstash、Telegraf 等代理即用即用

### DBeaver {#dbeaver}

[DBeaver](https://dbeaver.io/) 是一个通用的桌面数据库客户端，支持 ClickHouse。

功能：

- 带语法高亮和自动补全的查询开发。
- 带过滤器和元数据搜索的表列表。
- 表数据预览。
- 全文搜索。

默认情况下，DBeaver 不使用会话连接（例如 CLI 会连接）。如果您需要会话支持（例如设置会话的设置），请编辑驱动程序连接属性，并将 `session_id` 设置为随机字符串（它在内部使用 http 连接）。然后，您可以从查询窗口使用任何设置。

### clickhouse-cli {#clickhouse-cli}

[clickhouse-cli](https://github.com/hatarist/clickhouse-cli) 是一个替代的 ClickHouse 命令行客户端，使用 Python 3 编写。

功能：

- 自动补全。
- 查询和数据输出的语法高亮。
- 数据输出的分页支持。
- 自定义的 PostgreSQL 风格命令。

### clickhouse-flamegraph {#clickhouse-flamegraph}

[clickhouse-flamegraph](https://github.com/Slach/clickhouse-flamegraph) 是一个专门用于将 `system.trace_log` 可视化为 [flamegraph](http://www.brendangregg.com/flamegraphs.html) 的工具。

### clickhouse-plantuml {#clickhouse-plantuml}

[cickhouse-plantuml](https://pypi.org/project/clickhouse-plantuml/) 是一个生成表模式图的 [PlantUML](https://plantuml.com/) 脚本。

### ClickHouse 表图 {#clickhouse-table-graph}

[ClickHouse table graph](https://github.com/mbaksheev/clickhouse-table-graph) 是一个简单的 CLI 工具，用于可视化 ClickHouse 表之间的依赖关系。该工具从 `system.tables` 表中检索表之间的连接，并以 [mermaid](https://mermaid.js.org/syntax/flowchart.html) 格式构建依赖关系流程图。使用此工具，您可以轻松地可视化表依赖关系并理解 ClickHouse 数据库中的数据流。得益于 mermaid，生成的流程图看起来美观且可以轻松地添加到您的 markdown 文档中。

### xeus-clickhouse {#xeus-clickhouse}

[xeus-clickhouse](https://github.com/wangfenjin/xeus-clickhouse) 是用于 ClickHouse 的 Jupyter 内核，支持在 Jupyter 中使用 SQL 查询 CH 数据。

### MindsDB Studio {#mindsdb}

[MindsDB](https://mindsdb.com/) 是一个针对包括 ClickHouse 在内的数据库的开源 AI 层，允许您轻松开发、训练和部署最先进的机器学习模型。 MindsDB Studio（GUI）允许您从数据库训练新模型，解释模型做出的预测，识别潜在数据偏差，并使用可解释 AI 功能评估和可视化模型准确性，以更快地调整和优化机器学习模型。

### DBM {#dbm}

[DBM](https://github.com/devlive-community/dbm) 是一个 ClickHouse 的可视化管理工具！

功能：

- 支持查询历史（分页、清空等）
- 支持选定 SQL 子句的查询
- 支持终止查询
- 支持表管理（元数据、删除、预览）
- 支持数据库管理（删除、创建）
- 支持自定义查询
- 支持多个数据源管理（连接测试、监控）
- 支持监控（处理器、连接、查询）
- 支持数据迁移

### Bytebase {#bytebase}

[Bytebase](https://bytebase.com) 是一个基于 web 的开源模式变更和版本控制工具，支持包括 ClickHouse 在内的各种数据库。

功能：

- 开发者和 DBA 之间的模式审查。
- 数据库即代码，版本控制模式在版本控制系统（如 GitLab）中，并在代码提交时触发部署。
- 根据环境策略简化部署。
- 完整的迁移历史。
- 模式漂移检测。
- 备份与恢复。
- 基于角色的访问控制（RBAC）。

### Zeppelin-Interpreter-for-ClickHouse {#zeppelin-interpreter-for-clickhouse}

[Zeppelin-Interpreter-for-ClickHouse](https://github.com/SiderZhang/Zeppelin-Interpreter-for-ClickHouse) 是一个 ClickHouse 的 [Zeppelin](https://zeppelin.apache.org) 解释器。与 JDBC 解释器相比，可以为长时间运行的查询提供更好的超时控制。

### ClickCat {#clickcat}

[ClickCat](https://github.com/clickcat-project/ClickCat) 是一个友好的用户界面，让您搜索、探索和可视化 ClickHouse 数据。

功能：

- 一个在线 SQL 编辑器，可以运行您的 SQL 代码，无需安装。
- 您可以观察所有进程和变更。对于那些未完成的进程，您可以在 UI 中终止它们。
- 指标包含集群分析、数据分析和查询分析。

### ClickVisual {#clickvisual}

[ClickVisual](https://clickvisual.net/) ClickVisual 是一个轻量级开源日志查询、分析和报警可视化平台。

功能：

- 支持一键创建分析日志库
- 支持日志收集配置管理
- 支持用户定义的索引配置
- 支持报警配置
- 支持权限粒度到库和表权限配置

### ClickHouse-Mate {#clickmate}

[ClickHouse-Mate](https://github.com/metrico/clickhouse-mate) 是一个 Angular 网络客户端 + 用于在 ClickHouse 中搜索和探索数据的用户界面。

功能：

- ClickHouse SQL 查询自动补全
- 快速的数据库和表树导航
- 高级结果过滤和排序
- 内联 ClickHouse SQL 文档
- 查询预设和历史记录
- 100% 基于浏览器，无需服务器/后端

该客户端可通过 GitHub 页面即时使用：https://metrico.github.io/clickhouse-mate/

### Uptrace {#uptrace}

[Uptrace](https://github.com/uptrace/uptrace) 是一个 APM 工具，提供分布式追踪和由 OpenTelemetry 与 ClickHouse 支持的度量。

功能：

- [OpenTelemetry 追踪](https://uptrace.dev/opentelemetry/distributed-tracing.html)、度量和日志。
- 使用 AlertManager 的电子邮件/Slack/PagerDuty 通知。
- 类 SQL 的查询语言来聚合跨度。
- 类 PromQL 的语言来查询度量。
- 预构建的度量仪表板。
- 通过 YAML 配置支持多个用户/项目。

### clickhouse-monitoring {#clickhouse-monitoring}

[clickhouse-monitoring](https://github.com/duyet/clickhouse-monitoring) 是一个简单的 Next.js 仪表板，依赖于 `system.*` 表以帮助监视并提供您的 ClickHouse 集群的概览。

功能：

- 查询监视：当前查询、查询历史、查询资源（内存、读取的部分、文件打开等）、最昂贵的查询、使用最多的表或列等。
- 集群监视：总内存/CPU 使用、分布式队列、全局设置、mergetree 设置、度量等。
- 表和部分信息：在列级的详细信息、大小、行数、压缩、部分大小等。
- 实用工具：Zookeeper 数据探索、查询 EXPLAIN、终止查询等。
- 可视化度量图表：查询和资源使用情况、合并/变更次数、合并性能、查询性能等。

### CKibana {#ckibana}

[CKibana](https://github.com/TongchengOpenSource/ckibana) 是一个轻量级服务，允许您轻松搜索、探索和可视化 ClickHouse 数据，使用原生的 Kibana UI。

功能：

- 将原生 Kibana UI 的图表请求转换为 ClickHouse 查询语法。
- 支持采样和缓存等高级功能以增强查询性能。
- 降低从 ElasticSearch 迁移到 ClickHouse 后用户的学习成本。

### Telescope {#telescope}

[Telescope](https://iamtelescope.net/) 是一个现代化的网络界面，用于探索存储在 ClickHouse 中的日志。它提供了一个用户友好的界面，用于查询、可视化和管理日志数据，并具备细粒度的访问控制。

功能：

- 干净、响应迅速的 UI，配有强大的过滤器和可定制的字段选择。
- FlyQL 语法，便于直观和表达性的日志过滤。
- 基于时间的图表，支持分组，包括嵌套 JSON、Map 和 Array 字段。
- 可选的原始 SQL `WHERE` 查询支持用于高级过滤（带权限检查）。
- 保存的视图：保存并共享查询和布局的自定义 UI 配置。
- 基于角色的访问控制（RBAC）和 GitHub 认证集成。
- ClickHouse 端无需额外代理或组件。

[Telescope 源代码](https://github.com/iamtelescope/telescope) · [在线演示](https://demo.iamtelescope.net)

## 商业 {#commercial}

### DataGrip {#datagrip}

[DataGrip](https://www.jetbrains.com/datagrip/) 是 JetBrains 的数据库 IDE，专门支持 ClickHouse。它还嵌入在其他基于 IntelliJ 的工具中：PyCharm、IntelliJ IDEA、GoLand、PhpStorm 等。

功能：

- 非常快速的代码补全。
- ClickHouse 语法高亮。
- 支持 ClickHouse 特有的功能，例如嵌套列、表引擎。
- 数据编辑器。
- 重构。
- 搜索和导航。

### Yandex DataLens {#yandex-datalens}

[Yandex DataLens](https://cloud.yandex.ru/services/datalens) 是一个数据可视化和分析服务。

功能：

- 广泛范围的可用可视化，涵盖简单的条形图到复杂的仪表板。
- 仪表板可以公开可用。
- 支持多个数据源，包括 ClickHouse。
- 基于 ClickHouse 的物化数据存储。

DataLens 对于低负载项目（甚至商用）[免费提供](https://cloud.yandex.com/docs/datalens/pricing)。

- [DataLens 文档](https://cloud.yandex.com/docs/datalens/)。
- [教程](https://cloud.yandex.com/docs/solutions/datalens/data-from-ch-visualization) 分享如何可视化 ClickHouse 数据库中的数据。

### Holistics Software {#holistics-software}

[Holistics](https://www.holistics.io/) 是一个全栈数据平台和商业智能工具。

功能：

- 自动电子邮件、Slack 和 Google Sheet 报告的调度。
- 带可视化、版本控制、自动补全、可重用查询组件和动态过滤器的 SQL 编辑器。
- 通过 iframe 嵌入报告和仪表板的分析。
- 数据准备和 ETL 能力。
- 支持关系数据的 SQL 数据建模。

### Looker {#looker}

[Looker](https://looker.com) 是一个数据平台和商业智能工具，支持 50 多种数据库方言，包括 ClickHouse。Looker 作为 SaaS 平台和自托管的版本可用。用户可以通过浏览器使用 Looker 探索数据、构建可视化和仪表板、安排报告，并与同事分享见解。Looker 提供丰富的工具，将这些功能嵌入到其他应用程序中，以及一个 API 用于将数据集成到其他应用程序。

功能：

- 使用 LookML 轻松而灵活的开发，这是一种支持策划 [数据建模](https://looker.com/platform/data-modeling) 的语言，以支持报告撰写者和最终用户。
- 通过 Looker 的 [数据操作](https://looker.com/platform/actions) 实现强大的工作流集成。

[如何在 Looker 中配置 ClickHouse。](https://docs.looker.com/setup-and-management/database-config/clickhouse)

### SeekTable {#seektable}

[SeekTable](https://www.seektable.com) 是一款自助 BI 工具，用于数据探索和操作报告。它同时提供云服务和自托管版本。SeekTable 的报告可以嵌入到任何网络应用程序中。

功能：

- 适合业务用户的友好报告构建器。
- 强大的报告参数，用于 SQL 过滤和报告特定查询的自定义。
- 可以通过原生 TCP/IP 端点和 HTTP(S) 接口连接到 ClickHouse（两种不同的驱动）。
- 借助 ClickHouse SQL 方言的所有强大能力，可以在维度/度量定义中使用。
- [Web API](https://www.seektable.com/help/web-api-integration) 用于自动生成报告。
- 支持报告开发流程的帐户数据 [备份/恢复](https://www.seektable.com/help/self-hosted-backup-restore)；数据模型（立方体）/报告配置是可读的 XML，可以存储在版本控制系统中。

SeekTable 对于个人/个人使用是 [免费的](https://www.seektable.com/help/cloud-pricing)。

[如何在 SeekTable 中配置 ClickHouse 连接。](https://www.seektable.com/help/clickhouse-pivot-table)

### Chadmin {#chadmin}

[Chadmin](https://github.com/bun4uk/chadmin) 是一个简单的 UI，您可以在其中可视化当前正在运行的 ClickHouse 集群查询及其信息，并根据需要终止它们。

### TABLUM.IO {#tablum_io}

[TABLUM.IO](https://tablum.io/) 是一个在线查询和分析工具，用于 ETL 和可视化。它允许连接到 ClickHouse，通过多功能 SQL 控制台查询数据，以及从静态文件和第三方服务加载数据。TABLUM.IO 可以将数据结果可视化为图表和表格。

功能：
- ETL：从流行数据库、本地和远程文件、API 调用加载数据。
- 多功能 SQL 控制台，带语法高亮和可视化查询构建器。
- 数据可视化为图表和表格。
- 数据物化和子查询。
- 向 Slack、Telegram 或电子邮件报告数据。
- 通过专有 API 进行数据管道处理。
- 以 JSON、CSV、SQL、HTML 格式导出数据。
- 基于 Web 的界面。

TABLUM.IO 可以作为自托管解决方案（作为 docker 镜像）或云端运行。
许可证：[商业](https://tablum.io/pricing) 产品，提供 3 个月的免费期。

在[云中](https://tablum.io/try)免费试用。
了解更多关于该产品的信息，请访问 [TABLUM.IO](https://tablum.io/)。

### CKMAN {#ckman}

[CKMAN](https://www.github.com/housepower/ckman) 是一个工具，用于管理和监控 ClickHouse 集群！

功能：

- 通过浏览器接口快速方便地自动部署集群
- 集群可以扩展或缩减
- 负载均衡集群的数据
- 在线升级集群
- 在页面上修改集群配置
- 提供集群节点监控和 Zookeeper 监控
- 监控表和分区的状态，监控慢 SQL 语句
- 提供一个易于使用的 SQL 执行页面

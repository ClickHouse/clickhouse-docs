---
'description': '用于使用ClickHouse的第三方GUI工具和应用程序的列表'
'sidebar_label': '视觉界面'
'sidebar_position': 28
'slug': '/interfaces/third-party/gui'
'title': '第三方开发者的视觉界面'
---




# 来自第三方开发者的可视化界面

## 开源 {#open-source}

### agx {#agx}

[agx](https://github.com/agnosticeng/agx) 是一款使用 Tauri 和 SvelteKit 构建的桌面应用程序，它为使用 ClickHouse 嵌入式数据库引擎 (chdb) 探索和查询数据提供了现代界面。

- 在运行本地应用程序时利用 ch-db。
- 在运行 Web 实例时可以连接到 ClickHouse 实例。
- Monaco 编辑器，让您感觉更加熟悉。
- 多种与不断演变的数据可视化。

### ch-ui {#ch-ui}

[ch-ui](https://github.com/caioricciuti/ch-ui) 是一款简单的 React.js 应用程序界面，专为 ClickHouse 数据库设计，旨在执行查询和可视化数据。它由 React 和 ClickHouse Web 客户端构建，提供了一个时尚且用户友好的 UI，以便于数据库交互。

功能：

- ClickHouse 集成：轻松管理连接和执行查询。
- 响应式标签管理：动态处理多个标签，例如查询标签和表格标签。
- 性能优化：利用 Indexed DB 进行高效缓存和状态管理。
- 本地数据存储：所有数据都存储在浏览器中，确保不会将数据发送到其他地方。

### ChartDB {#chartdb}

[ChartDB](https://chartdb.io) 是一个免费的开源工具，用于可视化和设计数据库模式，包括 ClickHouse，通过单个查询构建。它采用 React 构建，提供无缝且用户友好的体验，不需要数据库凭据或注册即可开始。

功能：

- 模式可视化：即时导入和可视化您的 ClickHouse 模式，包括带有物化视图和标准视图的 ER 图，显示表的引用。
- AI 驱动的 DDL 导出：轻松生成 DDL 脚本，以便更好地管理和记录模式。
- 多 SQL 方言支持：兼容多种 SQL 方言，适用于各种数据库环境。
- 无需注册或凭据：所有功能直接在浏览器中可用，确保流畅且安全。

[ChartDB 源代码](https://github.com/chartdb/chartdb)。

### ClickHouse Schema Flow Visualizer {#clickhouse-schemaflow-visualizer}

一个强大的 Web 应用程序，用于使用 Mermaid.js 图表可视化 ClickHouse 表关系。

功能：

- 使用直观的界面浏览 ClickHouse 数据库和表
- 使用 Mermaid.js 图表可视化表关系
- 查看表之间的数据流向
- 将图表导出为独立的 HTML 文件
- 使用 TLS 支持与 ClickHouse 的安全连接
- 适用于所有设备的响应式 Web 界面

[ClickHouse Schema Flow Visualizer - 源代码](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer)

### Tabix {#tabix}

Tabix 项目的 ClickHouse Web 界面。

功能：

- 直接从浏览器与 ClickHouse 一起工作，无需安装其他软件。
- 带有语法高亮的查询编辑器。
- 命令的自动补全。
- 用于图形分析查询执行的工具。
- 颜色方案选项。

[Tabix 文档](https://tabix.io/doc/)。

### HouseOps {#houseops}

[HouseOps](https://github.com/HouseOps/HouseOps) 是一款适用于 OSX、Linux 和 Windows 的 UI/IDE。

功能：

- 带有语法高亮的查询构建器。在表格或 JSON 视图中查看响应。
- 以 CSV 或 JSON 格式导出查询结果。
- 带有描述的进程列表。写入模式。有能力停止（`KILL`）进程。
- 数据库图。显示所有表及其列，并附带额外信息。
- 列大小的快速视图。
- 服务器配置。

计划开发的功能如下：

- 数据库管理。
- 用户管理。
- 实时数据分析。
- 集群监控。
- 集群管理。
- 监控复制和 Kafka 表。

### LightHouse {#lighthouse}

[LightHouse](https://github.com/VKCOM/lighthouse) 是一款轻量级的 ClickHouse Web 界面。

功能：

- 带有过滤和元数据的表格列表。
- 带有过滤和排序的表格预览。
- 只读查询执行。

### Redash {#redash}

[Redash](https://github.com/getredash/redash) 是一个数据可视化平台。

支持多种数据源，包括 ClickHouse，Redash 可以将来自不同数据源的查询结果合并为一个最终数据集。

功能：

- 强大的查询编辑器。
- 数据库浏览器。
- 可视化工具，允许您以不同形式表示数据。

### Grafana {#grafana}

[Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) 是一个用于监控和可视化的平台。

“Grafana 允许您查询、可视化、警报和理解您的指标，无论它们存储在哪里。与您的团队共同创建、探索和分享仪表板，推动数据驱动的文化。社区信任并喜爱。” &mdash; grafana.com。

ClickHouse 数据源插件提供了对 ClickHouse 作为后端数据库的支持。

### qryn {#qryn}

[qryn](https://metrico.in) 是一款多语言、高性能的 ClickHouse 可观察性栈 _(前称 cLoki)_，具有原生 Grafana 集成，允许用户摄取和分析来自任何支持 Loki/LogQL、Prometheus/PromQL、OTLP/Tempo、Elastic、InfluxDB 等的代理的日志、指标和遥测跟踪。

功能：

- 内置 Explore UI 和 LogQL CLI，用于查询、提取和可视化数据
- 原生 Grafana API 支持查询、处理、摄取、追踪和警报，无需插件
- 强大的管道用于动态搜索、过滤和从日志、事件、跟踪中提取数据
- 摄取和推送 API 与 LogQL、PromQL、InfluxDB、Elastic 等兼容
- 准备与 Promtail、Grafana-Agent、Vector、Logstash、Telegraf 等代理一起使用

### DBeaver {#dbeaver}

[DBeaver](https://dbeaver.io/) - 具有 ClickHouse 支持的通用桌面数据库客户端。

功能：

- 带有语法高亮和自动补全的查询开发。
- 带过滤器和元数据搜索的表格列表。
- 表格数据预览。
- 全文搜索。

默认情况下，DBeaver 不使用会话连接（例如 CLI 会这样做）。如果您需要会话支持（例如为会话设置设置），请编辑驱动程序连接属性，并将 `session_id` 设置为随机字符串（它在底层使用 http 连接）。然后您可以使用查询窗口中的任何设置。

### clickhouse-cli {#clickhouse-cli}

[clickhouse-cli](https://github.com/hatarist/clickhouse-cli) 是 ClickHouse 的替代命令行客户端，使用 Python 3 编写。

功能：

- 自动补全。
- 查询和数据输出的语法高亮。
- 数据输出的分页支持。
- 自定义 PostgreSQL 风格的命令。

### clickhouse-flamegraph {#clickhouse-flamegraph}

[clickhouse-flamegraph](https://github.com/Slach/clickhouse-flamegraph) 是一个专门用于可视化 `system.trace_log` 的工具，呈现为 [flamegraph](http://www.brendangregg.com/flamegraphs.html)。

### clickhouse-plantuml {#clickhouse-plantuml}

[cickhouse-plantuml](https://pypi.org/project/clickhouse-plantuml/) 是一个脚本，用于生成表模式的 [PlantUML](https://plantuml.com/) 图。

### ClickHouse table graph {#clickhouse-table-graph}

[ClickHouse table graph](https://github.com/mbaksheev/clickhouse-table-graph) 是一个简单的 CLI 工具，用于可视化 ClickHouse 表之间的依赖关系。此工具从 `system.tables` 表中检索表之间的连接，并以 [mermaid](https://mermaid.js.org/syntax/flowchart.html) 格式构建依赖关系流程图。通过这个工具，您可以轻松可视化表之间的依赖关系并理解 ClickHouse 数据库中的数据流。得益于 mermaid，生成的流程图看起来很美观，可以轻松添加到您的 markdown 文档中。

### xeus-clickhouse {#xeus-clickhouse}

[xeus-clickhouse](https://github.com/wangfenjin/xeus-clickhouse) 是一个 Jupyter 核心，用于 ClickHouse，支持在 Jupyter 中使用 SQL 查询 CH 数据。

### MindsDB Studio {#mindsdb}

[MindsDB](https://mindsdb.com/) 是一款开源 AI 层，适用于包括 ClickHouse 在内的数据库，使您能够轻松开发、训练和部署最先进的机器学习模型。MindsDB Studio（GUI）允许您从数据库中训练新模型，解释模型做出的预测，识别潜在的数据偏见，并使用可解释的 AI 功能评估和可视化模型的准确性，加速适应和调整您的机器学习模型。

### DBM {#dbm}

[DBM](https://github.com/devlive-community/dbm) 是 ClickHouse 的可视化管理工具！

功能：

- 支持查询历史（分页、全部清除等）
- 支持选定 SQL 子句查询
- 支持终止查询
- 支持表管理（元数据、删除、预览）
- 支持数据库管理（删除、创建）
- 支持自定义查询
- 支持多数据源管理（连接测试、监控）
- 支持监控（处理器、连接、查询）
- 支持数据迁移

### Bytebase {#bytebase}

[Bytebase](https://bytebase.com) 是一款基于 Web 的开源架构变更和版本控制工具，支持多种数据库，包括 ClickHouse。

功能：

- 开发者与 DBA 之间的架构审查。
- 数据库即代码，在 VCS（如 GitLab）中对架构进行版本控制并在代码提交时触发部署。
- 按环境策略简化部署。
- 完整的迁移历史。
- 架构漂移检测。
- 备份和恢复。
- 基于角色的访问控制（RBAC）。

### Zeppelin-Interpreter-for-ClickHouse {#zeppelin-interpreter-for-clickhouse}

[Zeppelin-Interpreter-for-ClickHouse](https://github.com/SiderZhang/Zeppelin-Interpreter-for-ClickHouse) 是一个用于 ClickHouse 的 [Zeppelin](https://zeppelin.apache.org) 解释器。与 JDBC 解释器相比，它可以为长时间运行的查询提供更好的超时控制。

### ClickCat {#clickcat}

[ClickCat](https://github.com/clickcat-project/ClickCat) 是一个友好的用户界面，允许您搜索、探索和可视化 ClickHouse 数据。

功能：

- 一个在线 SQL 编辑器，可以在不安装任何软件的情况下运行您的 SQL 代码。
- 您可以观察所有进程和变更。对于那些未完成的进程，您可以在 UI 中终止它们。
- 指标包含集群分析、数据分析和查询分析。

### ClickVisual {#clickvisual}

[ClickVisual](https://clickvisual.net/) ClickVisual 是一个轻量级的开源日志查询、分析和报警可视化平台。

功能：

- 支持一键创建分析日志库
- 支持日志收集配置管理
- 支持用户定义的索引配置
- 支持报警配置
- 支持库和表的权限粒度配置

### ClickHouse-Mate {#clickmate}

[ClickHouse-Mate](https://github.com/metrico/clickhouse-mate) 是一个 Angular Web 客户端 + 用户界面，用于搜索和探索 ClickHouse 中的数据。

功能：

- ClickHouse SQL 查询自动补全
- 快速的数据库和表树导航
- 高级结果筛选和排序
- 内联 ClickHouse SQL 文档
- 查询预设和历史
- 100% 基于浏览器，无需服务器/后端

客户可以通过 GitHub 页面立即使用：https://metrico.github.io/clickhouse-mate/

### Uptrace {#uptrace}

[Uptrace](https://github.com/uptrace/uptrace) 是一款 APM 工具，提供基于 OpenTelemetry 和 ClickHouse 的分布式跟踪和指标。

功能：

- [OpenTelemetry 跟踪](https://uptrace.dev/opentelemetry/distributed-tracing.html)、指标和日志。
- 使用 AlertManager 的电子邮件/Slack/PagerDuty 通知。
- 类 SQL 的查询语言以聚合跨度。
- 类 Promql 的语言用于查询指标。
- 预构建的指标仪表板。
- 通过 YAML 配置多个用户/项目。

### clickhouse-monitoring {#clickhouse-monitoring}

[clickhouse-monitoring](https://github.com/duyet/clickhouse-monitoring) 是一个简单的 Next.js 仪表板，依赖于 `system.*` 表来帮助监控并提供 ClickHouse 集群的概述。

功能：

- 查询监控：当前查询、查询历史、查询资源（内存、读取的部分、打开的文件等）、最耗费资源的查询、最常用的表或列等。
- 集群监控：总内存/CPU 使用情况、分布式队列、全局设置、mergetree 设置、指标等。
- 表和部分信息：大小、行计数、压缩、部分大小等，按列级详细信息。
- 实用工具：Zookeeper 数据探索、查询 EXPLAIN、终止查询等。
- 可视化指标图表：查询和资源使用情况、合并/变更次数、合并性能、查询性能等。

### CKibana {#ckibana}

[CKibana](https://github.com/TongchengOpenSource/ckibana) 是一项轻量级服务，允许您轻松搜索、探索和可视化 ClickHouse 数据，使用原生 Kibana UI。

功能：

- 将原生 Kibana UI 的图表请求转换为 ClickHouse 查询语法。
- 支持高级功能，如采样和缓存，以增强查询性能。
- 在从 ElasticSearch 迁移到 ClickHouse 后，最小化用户的学习成本。

## 商业 {#commercial}

### DataGrip {#datagrip}

[DataGrip](https://www.jetbrains.com/datagrip/) 是 JetBrains 的一个数据库 IDE，专门支持 ClickHouse。它也嵌入在其他基于 IntelliJ 的工具中：PyCharm、IntelliJ IDEA、GoLand、PhpStorm 等。

功能：

- 非常快的代码完成。
- ClickHouse 语法高亮。
- 支持 ClickHouse 特定的功能，例如嵌套列、表引擎。
- 数据编辑器。
- 重构功能。
- 搜索和导航。

### Yandex DataLens {#yandex-datalens}

[Yandex DataLens](https://cloud.yandex.ru/services/datalens) 是一项数据可视化和分析服务。

功能：

- 可用的可视化范围广，从简单的条形图到复杂的仪表板。
- 仪表板可以公开可用。
- 支持多种数据源，包括 ClickHouse。
- 基于 ClickHouse 的物化数据存储。

DataLens [免费提供](https://cloud.yandex.com/docs/datalens/pricing) 供低负载项目使用，即使是商业用途。

- [DataLens 文档](https://cloud.yandex.com/docs/datalens/)。
- [教程](https://cloud.yandex.com/docs/solutions/datalens/data-from-ch-visualization)关于可视化 ClickHouse 数据库中的数据。

### Holistics Software {#holistics-software}

[Holistics](https://www.holistics.io/) 是一个全栈数据平台和商业智能工具。

功能：

- 自动的电子邮件、Slack 和 Google 表格的报告调度。
- 带有可视化、版本控制、自动补全、可重用查询组件和动态过滤器的 SQL 编辑器。
- 通过 iframe 嵌入报告和仪表板的分析。
- 数据准备和 ETL 功能。
- SQL 数据建模支持，便于关系映射。

### Looker {#looker}

[Looker](https://looker.com) 是一个数据平台和商业智能工具，支持超过 50 种数据库方言，包括 ClickHouse。Looker 作为 SaaS 平台和自托管的方式提供。用户可以通过浏览器使用 Looker 探索数据、构建可视化和仪表板、调度报告，并与同事分享他们的见解。Looker 提供了一整套工具，可以将这些功能嵌入其他应用程序，并提供 API 将数据与其他应用程序集成。

功能：

- 使用 LookML 进行简单而灵活的开发，这是一种支持策划的 [数据建模](https://looker.com/platform/data-modeling) 的语言，以支持报告编写者和最终用户。
- 通过 Looker 的 [数据操作](https://looker.com/platform/actions) 强大的工作流集成。

[如何在 Looker 中配置 ClickHouse。](https://docs.looker.com/setup-and-management/database-config/clickhouse)

### SeekTable {#seektable}

[SeekTable](https://www.seektable.com) 是一款自助 BI 工具，用于数据探索和操作报告。它既可以作为云服务使用，也可以使用自托管版本。SeekTable 的报告可以嵌入到任何 Web 应用中。

功能：

- 适合业务用户的报告生成器。
- 强大的报告参数，用于 SQL 过滤和报告特定的查询自定义。
- 可以通过本地 TCP/IP 端点和 HTTP(S) 接口连接到 ClickHouse（2 个不同驱动程序）。
- 在维度/度量定义中可以使用 ClickHouse SQL 方言的全部功能。
- [Web API](https://www.seektable.com/help/web-api-integration) 用于自动生成报告。
- 支持带有帐户数据 [备份/恢复](https://www.seektable.com/help/self-hosted-backup-restore) 的报告开发流程；数据模型（数据立方体）/报告配置为人类可读的 XML，并可以存储在版本控制系统中。

SeekTable 对个人/独立用户 [免费](https://www.seektable.com/help/cloud-pricing)。

[如何在 SeekTable 中配置 ClickHouse 连接。](https://www.seektable.com/help/clickhouse-pivot-table)

### Chadmin {#chadmin}

[Chadmin](https://github.com/bun4uk/chadmin) 是一个简单的 UI，您可以在其中可视化您在 ClickHouse 集群上当前运行的查询及其信息，并如有需要可以终止它们。

### TABLUM.IO {#tablum_io}

[TABLUM.IO](https://tablum.io/) — 一款在线查询和分析工具，适用于 ETL 和可视化。它允许连接到 ClickHouse，通过多功能 SQL 控制台查询数据，并从静态文件和第三方服务加载数据。TABLUM.IO 可以将数据结果可视化为图表和表格。

功能：
- ETL：从流行数据库、本地和远程文件、API 调用加载数据。
- 多功能 SQL 控制台，带语法高亮和可视化查询生成器。
- 数据可视化为图表和表格。
- 数据物化和子查询。
- 通过 Slack、Telegram 或电子邮件生成数据报告。
- 通过专有 API 处理数据管道。
- 数据以 JSON、CSV、SQL、HTML 格式导出。
- 基于 Web 的界面。

TABLUM.IO 可以作为自托管解决方案（作为 docker 镜像）或在云中运行。
许可证： [商业](https://tablum.io/pricing) 产品，提供 3 个月的免费试用期。

在 [云中免费试用](https://tablum.io/try)。
在 [TABLUM.IO](https://tablum.io/) 上了解更多关于该产品的信息。

### CKMAN {#ckman}

[CKMAN](https://www.github.com/housepower/ckman) 是用于管理和监控 ClickHouse 集群的工具！

功能：

- 通过浏览器界面快速方便地自动部署集群
- 集群可以扩展或缩减
- 平衡集群的数据负载
- 在线升级集群
- 在页面上修改集群配置
- 提供集群节点监控和 zookeeper 监控
- 监控表和分区的状态，监控慢 SQL 语句
- 提供易于使用的 SQL 执行页面

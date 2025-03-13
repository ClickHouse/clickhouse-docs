---
slug: /interfaces/third-party/gui
sidebar_position: 28
sidebar_label: 可视化界面
---


# 第三方开发者的可视化界面

## 开源 {#open-source}

### ch-ui {#ch-ui}

[ch-ui](https://github.com/caioricciuti/ch-ui) 是一个简单的 React.js 应用程序接口，旨在为 ClickHouse 数据库执行查询和可视化数据。它基于 React 和用于 Web 的 ClickHouse 客户端构建，提供了一个流畅且用户友好的界面，方便数据库交互。

功能：

- ClickHouse 集成：轻松管理连接并执行查询。
- 响应式标签管理：动态处理多个标签，如查询和表格标签。
- 性能优化：利用 Indexed DB 进行高效缓存和状态管理。
- 本地数据存储：所有数据都存储在浏览器中，确保不向其他地方发送数据。

### ChartDB {#chartdb}

[ChartDB](https://chartdb.io) 是一个免费的开源工具，用于可视化和设计数据库模式（包括 ClickHouse），只需一个查询即可实现。它基于 React 构建，提供无缝且用户友好的体验，无需数据库凭据或注册即可开始使用。

功能：

- 模式可视化：即时导入并可视化您的 ClickHouse 模式，包括带有物化视图和标准视图的 ER 图，显示对表的引用。
- AI 驱动的 DDL 导出：轻松生成 DDL 脚本，以更好地进行模式管理和文档编制。
- 多 SQL 方言支持：与多种 SQL 方言兼容，使其适用于各种数据库环境。
- 无需注册或凭据：所有功能直接在浏览器中可用，保持无摩擦和安全。

[ChartDB 源代码](https://github.com/chartdb/chartdb)。

### Tabix {#tabix}

Tabix 项目的 ClickHouse 网页界面 [Tabix](https://github.com/tabixio/tabix)。

功能：

- 直接从浏览器与 ClickHouse 交互，无需安装额外的软件。
- 带语法高亮的查询编辑器。
- 命令自动完成。
- 查询执行的图形分析工具。
- 颜色方案选项。

[Tabix 文档](https://tabix.io/doc/)。

### HouseOps {#houseops}

[HouseOps](https://github.com/HouseOps/HouseOps) 是一个适用于 OSX、Linux 和 Windows 的 UI/IDE。

功能：

- 带语法高亮的查询构建器。以表格或 JSON 视图查看响应。
- 将查询结果导出为 CSV 或 JSON。
- 进程列表及其描述。写入模式。能终止（`KILL`）进程。
- 数据库图。显示所有表及其列以及附加信息。
- 字段大小的快速查看。
- 服务器配置。

计划开发的功能包括：

- 数据库管理。
- 用户管理。
- 实时数据分析。
- 集群监控。
- 集群管理。
- 监控复制的和 Kafka 表。

### LightHouse {#lighthouse}

[LightHouse](https://github.com/VKCOM/lighthouse) 是一个轻量级的 ClickHouse 网页界面。

功能：

- 带过滤和元数据的表列表。
- 带过滤和排序的表预览。
- 只读查询执行。

### Redash {#redash}

[Redash](https://github.com/getredash/redash) 是一个数据可视化平台。

支持包括 ClickHouse 的多种数据源，Redash 可以将来自不同数据源的查询结果合并为一个最终数据集。

功能：

- 强大的查询编辑器。
- 数据库浏览器。
- 可视化工具，允许您以不同形式表示数据。

### Grafana {#grafana}

[Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) 是一个监控和可视化平台。

“Grafana 允许您查询、可视化、警报和理解您的指标，无论它们存储在何处。创建、探索和与团队共享仪表板，培养以数据为驱动的文化。受到社区的信任和喜爱” &mdash; grafana.com。

ClickHouse 数据源插件为 ClickHouse 提供支持作为后端数据库。

### qryn {#qryn}

[qryn](https://metrico.in) 是一个多语言、高性能的 ClickHouse 可观察性堆栈 _(formerly cLoki)_，与 Grafana 原生集成，允许用户从任何支持 Loki/LogQL、Prometheus/PromQL、OTLP/Tempo、Elastic、InfluxDB 等代理中摄取和分析日志、指标和遥测跟踪。

功能：

- 内置 Explore UI 和 LogQL CLI 用于查询、提取和可视化数据
- 原生 Grafana API 支持查询、处理、摄取、跟踪和警报，无需插件
- 强大的管道可以动态搜索、过滤和提取日志、事件、跟踪和其他数据
- 摄取和 PUSH API 透明兼容 LogQL、PromQL、InfluxDB、Elastic 等多种格式
- 随时准备与 Promtail、Grafana-Agent、Vector、Logstash、Telegraf 等代理一起使用

### DBeaver {#dbeaver}

[DBeaver](https://dbeaver.io/) - 通用桌面数据库客户端，支持 ClickHouse。

功能：

- 带语法高亮和自动完成功能的查询开发。
- 带过滤器和元数据搜索的表列表。
- 表数据预览。
- 全文搜索。

默认情况下，DBeaver 不使用会话连接（例如 CLI 会使用）。如果需要会话支持（例如为了为您的会话设置设置），请编辑驱动程序连接属性，并将 `session_id` 设置为随机字符串（它在后台使用 http 连接）。然后您可以在查询窗口中使用任何设置。

### clickhouse-cli {#clickhouse-cli}

[clickhouse-cli](https://github.com/hatarist/clickhouse-cli) 是一个替代的 ClickHouse 命令行客户端，用 Python 3 编写。

功能：

- 自动完成。
- 对查询和数据输出的语法高亮。
- 数据输出的分页支持。
- 自定义 PostgreSQL 风格的命令。

### clickhouse-flamegraph {#clickhouse-flamegraph}

[clickhouse-flamegraph](https://github.com/Slach/clickhouse-flamegraph) 是一个用于可视化 `system.trace_log` 的专业工具，呈现为 [flamegraph](http://www.brendangregg.com/flamegraphs.html)。

### clickhouse-plantuml {#clickhouse-plantuml}

[cickhouse-plantuml](https://pypi.org/project/clickhouse-plantuml/) 是一个用于生成 [PlantUML](https://plantuml.com/) 表模式的图表的脚本。

### xeus-clickhouse {#xeus-clickhouse}

[xeus-clickhouse](https://github.com/wangfenjin/xeus-clickhouse) 是一个 Jupyter 内核，用于 ClickHouse，支持在 Jupyter 中使用 SQL 查询 CH 数据。

### MindsDB Studio {#mindsdb}

[MindsDB](https://mindsdb.com/) 是一个开源 AI 层，支持包括 ClickHouse 在内的数据库，允许您轻松开发、训练和部署最先进的机器学习模型。MindsDB Studio（图形用户界面）允许您从数据库中训练新模型，解释模型的预测，识别潜在的数据偏见，并使用可解释 AI 功能评估和可视化模型准确性，以更快地调整和调整您的机器学习模型。

### DBM {#dbm}

[DBM](https://github.com/devlive-community/dbm) 是一个可视化的 ClickHouse 管理工具！

功能：

- 支持查询历史（分页、清空全部等）
- 支持选定 SQL 子句查询
- 支持终止查询
- 支持表管理（元数据、删除、预览）
- 支持数据库管理（删除、创建）
- 支持自定义查询
- 支持多数据源管理（连接测试、监控）
- 支持监控（处理器、连接、查询）
- 支持数据迁移

### Bytebase {#bytebase}

[Bytebase](https://bytebase.com) 是一个基于 Web 的开源模式变更和版本控制工具，支持多个数据库，包括 ClickHouse。

功能：

- 开发者和 DBA 之间的模式审查。
- 数据库即代码，在 VCS（如 GitLab）中版本控制模式，并在代码提交时触发部署。
- 针对每个环境的政策进行流畅的部署。
- 完整的迁移历史。
- 模式漂移检测。
- 备份和恢复。
- RBAC。

### Zeppelin-Interpreter-for-ClickHouse {#zeppelin-interpreter-for-clickhouse}

[Zeppelin-Interpreter-for-ClickHouse](https://github.com/SiderZhang/Zeppelin-Interpreter-for-ClickHouse) 是一个 ClickHouse 的 [Zeppelin](https://zeppelin.apache.org) 解释器。与 JDBC 解释器相比，它可以为长时间运行的查询提供更好的超时控制。

### ClickCat {#clickcat}

[ClickCat](https://github.com/clickcat-project/ClickCat) 是一个友好的用户界面，让您搜索、探索和可视化 ClickHouse 数据。

功能：

- 一个在线 SQL 编辑器，可以运行您的 SQL 代码，无需安装。
- 您可以观察所有进程和变更。对于那些未完成的进程，您可以通过 UI 将其杀死。
- 指标包含集群分析、数据分析和查询分析。

### ClickVisual {#clickvisual}

[ClickVisual](https://clickvisual.net/) 是一个轻量级的开源日志查询、分析和报警可视化平台。

功能：

- 支持一键创建分析日志库
- 支持日志收集配置管理
- 支持用户定义索引配置
- 支持报警配置
- 支持库和表权限配置的权限粒度

### ClickHouse-Mate {#clickmate}

[ClickHouse-Mate](https://github.com/metrico/clickhouse-mate) 是一个 Angular Web 客户端 + 用户界面，用于搜索和探索 ClickHouse 中的数据。

功能：

- ClickHouse SQL 查询自动完成
- 快速数据库和表树导航
- 高级结果过滤和排序
- 内联 ClickHouse SQL 文档
- 查询预设和历史记录
- 100% 基于浏览器，无需服务器/后端

该客户端可通过 GitHub 页面即时使用：https://metrico.github.io/clickhouse-mate/

### Uptrace {#uptrace}

[Uptrace](https://github.com/uptrace/uptrace) 是一个 APM 工具，提供分布式跟踪和由 OpenTelemetry 和 ClickHouse 提供的指标。

功能：

- [OpenTelemetry 跟踪](https://uptrace.dev/opentelemetry/distributed-tracing.html)、指标和日志。
- 使用 AlertManager 进行电子邮件/Slack/PagerDuty 通知。
- 类 SQL 查询语言来聚合跨度。
- 类 Promql 的语言查询指标。
- 预构建的指标仪表板。
- 通过 YAML 配置多个用户/项目。

### clickhouse-monitoring {#clickhouse-monitoring}

[clickhouse-monitoring](https://github.com/duyet/clickhouse-monitoring) 是一个简单的 Next.js 仪表板，依赖于 `system.*` 表来帮助监控并提供 ClickHouse 集群的概述。

功能：

- 查询监控：当前查询、查询历史、查询资源（内存、已读取分区、文件打开等）、最昂贵的查询、最常用的表或列等。
- 集群监控：内存/CPU 总使用情况、分布式队列、全局设置、mergetree 设置、指标等。
- 表和分区信息：按列级别详细的大小、行计数、压缩、分区大小等。
- 有用的工具：Zookeeper 数据探索、查询 EXPLAIN、杀死查询等。
- 可视化度量图表：查询和资源使用、合并/变更数量、合并性能、查询性能等。

### CKibana {#ckibana}

[CKibana](https://github.com/TongchengOpenSource/ckibana) 是一个轻量级服务，允许您轻松搜索、探索和可视化 ClickHouse 数据，使用原生的 Kibana 用户界面。

功能：

- 将原生 Kibana UI 的图表请求转换为 ClickHouse 查询语法。
- 支持高级功能，如取样和缓存，以提高查询性能。
- 最小化用户从 ElasticSearch 迁移到 ClickHouse 的学习成本。

## 商业 {#commercial}

### DataGrip {#datagrip}

[DataGrip](https://www.jetbrains.com/datagrip/) 是 JetBrains 的一个数据库 IDE，专门支持 ClickHouse。它也嵌入在其他基于 IntelliJ 的工具中：PyCharm、IntelliJ IDEA、GoLand、PhpStorm 等。

功能：

- 非常快速的代码补全。
- ClickHouse 语法高亮。
- 支持 ClickHouse 特有的功能，例如，嵌套列、表引擎。
- 数据编辑器。
- 重构。
- 搜索与导航。

### Yandex DataLens {#yandex-datalens}

[Yandex DataLens](https://cloud.yandex.ru/services/datalens) 是一个数据可视化和分析的服务。

功能：

- 提供广泛的可用可视化，从简单的条形图到复杂的仪表板。
- 仪表板可以公开。
- 支持多种数据源，包括 ClickHouse。
- 基于 ClickHouse 的物化数据存储。

DataLens 对低负载项目[免费提供](https://cloud.yandex.com/docs/datalens/pricing)，甚至可用于商业用途。

- [DataLens 文档](https://cloud.yandex.com/docs/datalens/)。
- [教程](https://cloud.yandex.com/docs/solutions/datalens/data-from-ch-visualization) 用于可视化 ClickHouse 数据库中的数据。

### Holistics Software {#holistics-software}

[Holistics](https://www.holistics.io/) 是一款全栈数据平台和商业智能工具。

功能：

- 自动化电子邮件、Slack 和 Google Sheet 报告的调度。
- 带可视化的 SQL 编辑器、版本控制、自动完成、可重用查询组件和动态过滤器。
- 通过 iframe 嵌入报告和仪表板的分析。
- 数据准备和 ETL 能力。
- SQL 数据建模支持，用于数据的关系映射。

### Looker {#looker}

[Looker](https://looker.com) 是一个数据平台和商业智能工具，支持 50 多种数据库方言，包括 ClickHouse。Looker 作为 SaaS 平台和自托管版本提供。用户可以通过浏览器使用 Looker 探索数据、构建可视化和仪表板、安排报告，并与同事分享见解。Looker 提供了一整套工具，可将这些功能嵌入到其他应用程序中，并提供 API 以将数据与其他应用程序集成。

功能：

- 使用 LookML 进行简单灵活的开发，这是一种支持策划的 
    [数据建模](https://looker.com/platform/data-modeling) 的语言，以支持报告撰写者和最终用户。
- 通过 Looker 的 [Data Actions](https://looker.com/platform/actions) 强大的工作流集成。

[如何在 Looker 中配置 ClickHouse。](https://docs.looker.com/setup-and-management/database-config/clickhouse)

### SeekTable {#seektable}

[SeekTable](https://www.seektable.com) 是一个自助式 BI 工具，用于数据探索和操作报告。它既可以作为云服务提供，也可以作为自托管版本。SeekTable 的报告可以嵌入到任何 Web 应用中。

功能：

- 无需专业知识的商务用户友好型报告构建器。
- 强大的报告参数，用于 SQL 过滤和特定报告的查询自定义。
- 可以通过本地 TCP/IP 端点和 HTTP(S) 接口（2 个不同驱动程序）同时连接到 ClickHouse。
- 在维度/度量定义中可以使用 ClickHouse SQL 方言的全部功能。
- [Web API](https://www.seektable.com/help/web-api-integration) 用于自动生成报告。
- 支持使用帐户数据 [备份/恢复](https://www.seektable.com/help/self-hosted-backup-restore) 的报告开发流程；数据模型（立方体）/报告配置为人类可读的 XML，并可以存储在版本控制系统中。

SeekTable 对个人/个人使用[免费](https://www.seektable.com/help/cloud-pricing)。

[如何在 SeekTable 中配置 ClickHouse 连接。](https://www.seektable.com/help/clickhouse-pivot-table)

### Chadmin {#chadmin}

[Chadmin](https://github.com/bun4uk/chadmin) 是一个简单的用户界面，您可以在其中可视化当前在 ClickHouse 集群上运行的查询及其信息，并在需要时终止它们。

### TABLUM.IO {#tablum_io}

[TABLUM.IO](https://tablum.io/) — 一款在线查询和分析工具，用于 ETL 和可视化。它允许连接到 ClickHouse，通过多功能 SQL 控制台查询数据，同时从静态文件和第三方服务加载数据。 TABLUM.IO 可以将数据结果可视化为图表和表格。

功能：
- ETL：从流行的数据库、本地和远程文件、API 调用加载数据。
- 多功能 SQL 控制台，具备语法高亮和可视化查询构建器。
- 作为图表和表格的数据可视化。
- 数据物化和子查询。
- 将数据报告发送到 Slack、Telegram 或电子邮件。
- 通过专有 API 进行数据管道。
- 数据以 JSON、CSV、SQL、HTML 格式导出。
- 基于 Web 的界面。

TABLUM.IO 可以作为自托管解决方案（作为 Docker 镜像）或在云中运行。
许可证： [商业](https://tablum.io/pricing) 产品，提供 3 个月的免费试用期。

免费试用[云服务](https://tablum.io/try)。
了解更多产品信息，请访问 [TABLUM.IO](https://tablum.io/)

### CKMAN {#ckman}

[CKMAN](https://www.github.com/housepower/ckman) 是一个用于管理和监控 ClickHouse 集群的工具！

功能：

- 通过浏览器界面快速便捷地自动部署集群
- 集群可以缩放或放大
- 负载均衡集群的数据
- 在线升级集群
- 在页面上修改集群配置
- 提供集群节点监控和 ZooKeeper 监控
- 监控表和分区的状态，监控慢 SQL 语句
- 提供易用的 SQL 执行页面

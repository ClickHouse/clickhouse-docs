---
'description': '用于与ClickHouse配合使用的第三方GUI工具和应用程序的列表'
'sidebar_label': '可视化界面'
'sidebar_position': 28
'slug': '/interfaces/third-party/gui'
'title': '第三方开发者的可视化界面'
---


# 第三方开发者的可视化接口

## 开源 {#open-source}

### agx {#agx}

[agx](https://github.com/agnosticeng/agx) 是一个使用 Tauri 和 SvelteKit 构建的桌面应用程序，提供现代界面，用于使用 ClickHouse 的嵌入式数据库引擎 (chdb) 探索和查询数据。

- 使用本地应用程序时利用 ch-db 。
- 运行 Web 实例时可以连接到 ClickHouse 实例。
- Monaco 编辑器，让你倍感自在。
- 多种不断发展的数据可视化。

### ch-ui {#ch-ui}

[ch-ui](https://github.com/caioricciuti/ch-ui) 是一个为 ClickHouse 数据库设计的简单 React.js 应用接口，旨在执行查询和可视化数据。它是用 React 和 ClickHouse 的 Web 客户端构建的，提供了一个简洁和用户友好的 UI，以便轻松进行数据库交互。

特点：

- ClickHouse 集成：轻松管理连接并执行查询。
- 响应式标签管理：动态处理多个标签，如查询和表标签。
- 性能优化：利用索引数据库进行高效缓存和状态管理。
- 本地数据存储：所有数据均存储在浏览器的本地，确保不会将数据发送到其他地方。

### ChartDB {#chartdb}

[ChartDB](https://chartdb.io) 是一个免费和开源的工具，可以使用单个查询可视化和设计数据库模式，包括 ClickHouse。它是用 React 构建的，提供无缝且用户友好的体验，无需数据库凭证或注册即可开始使用。

特点：

- 模式可视化：即时导入和可视化你的 ClickHouse 模式，包括图形化概念图和标准视图，显示与表的引用。
- AI 驱动的 DDL 导出：轻松生成 DDL 脚本，以便更好地管理和记录模式。
- 多 SQL 方言支持：兼容多种 SQL 方言，使其在各种数据库环境中灵活应用。
- 无需注册或凭证：所有功能均可直接在浏览器中访问，实现无缝和安全体验。

[ChartDB 源代码](https://github.com/chartdb/chartdb)。

### ClickHouse 模式流可视化工具 {#clickhouse-schemaflow-visualizer}

一个强大的 Web 应用程序，用于使用 Mermaid.js 图表可视化 ClickHouse 表关系。

特点：

- 使用直观的界面浏览 ClickHouse 数据库和表。
- 使用 Mermaid.js 图表可视化表关系。
- 查看表之间的数据流向。
- 将图表导出为独立的 HTML 文件。
- 使用 TLS 支持安全连接到 ClickHouse。
- 所有设备均支持响应式 Web 界面。

[ClickHouse 模式流可视化工具 - 源代码](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer)

### Tabix {#tabix}

ClickHouse 的 Web 接口，属于 [Tabix](https://github.com/tabixio/tabix) 项目。

特点：

- 直接从浏览器使用 ClickHouse，无需安装额外软件。
- 带语法高亮的查询编辑器。
- 命令自动补全。
- 图形化分析查询执行的工具。
- 颜色方案选项。

[Tabix 文档](https://tabix.io/doc/)。

### HouseOps {#houseops}

[HouseOps](https://github.com/HouseOps/HouseOps) 是一个适用于 OSX、Linux 和 Windows 的 UI/IDE。

特点：

- 带语法高亮的查询构建器。以表格或 JSON 视图查看响应。
- 将查询结果导出为 CSV 或 JSON。
- 进程列表和描述。写入模式。能够停止 (`KILL`) 进程。
- 数据库图。显示所有表及其列，并提供额外信息。
- 列大小的快速查看。
- 服务器配置。

以下功能计划开发中：

- 数据库管理。
- 用户管理。
- 实时数据分析。
- 集群监控。
- 集群管理。
- 监控复制和 Kafka 表。

### LightHouse {#lighthouse}

[LightHouse](https://github.com/VKCOM/lighthouse) 是一个轻量级的 ClickHouse Web 界面。

特点：

- 带过滤和元数据的表列表。
- 带过滤和排序的表预览。
- 只读查询执行。

### Redash {#redash}

[Redash](https://github.com/getredash/redash) 是一个数据可视化平台。

支持多种数据源，包括 ClickHouse，Redash 能够将来自不同数据源的查询结果合并为一个最终数据集。

特点：

- 强大的查询编辑器。
- 数据库浏览器。
- 允许以不同形式展示数据的可视化工具。

### Grafana {#grafana}

[Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) 是一个用于监控和可视化的平台。

“Grafana 使您能够查询、可视化、告警和理解您的指标，无论它们存储在哪里。创建、探索和与团队分享仪表盘，培养以数据为驱动的文化。受到社区的信任和喜爱。” &mdash; grafana.com。

ClickHouse 数据源插件为 ClickHouse 提供了后端数据库支持。

### qryn {#qryn}

[qryn](https://metrico.in) 是一个多语言、高性能的 ClickHouse 可观察性堆栈 _(以前称为 cLoki)_，支持与 Grafana 的原生集成，允许用户从支持 Loki/LogQL、Prometheus/PromQL、OTLP/Tempo、Elastic、InfluxDB 等任何代理中摄取和分析日志、指标和遥测踪迹。

特点：

- 内置的 Explore UI 和 LogQL CLI 用于查询、提取和可视化数据。
- 原生 Grafana API 支持用于查询、处理、摄取、追踪和告警，无需插件。
- 强大的管道能够动态搜索、过滤和提取日志、事件、踪迹等中的数据。
- 摄取和 PUSH API 与 LogQL、PromQL、InfluxDB、Elastic 等透明兼容。
- 与 Promtail、Grafana-Agent、Vector、Logstash、Telegraf 等代理轻松使用。

### DBeaver {#dbeaver}

[DBeaver](https://dbeaver.io/) - 支持 ClickHouse 的通用桌面数据库客户端。

特点：

- 带语法高亮和自动补全的查询开发。
- 带过滤器和元搜索的表列表。
- 表数据预览。
- 全文搜索。

默认情况下，DBeaver 不使用会话连接（例如，CLI 是会话的）。如果需要会话支持（例如设置会话的设置），请编辑驱动程序连接属性并将 `session_id` 设置为随机字符串（底层使用 http 连接）。然后您可以使用查询窗口中的任何设置。

### clickhouse-cli {#clickhouse-cli}

[clickhouse-cli](https://github.com/hatarist/clickhouse-cli) 是一个为 ClickHouse 编写的替代命令行客户端，使用 Python 3。

特点：

- 自动补全。
- 查询和数据输出的语法高亮。
- 数据输出的分页支持。
- 自定义类似 PostgreSQL 的命令。

### clickhouse-flamegraph {#clickhouse-flamegraph}

[clickhouse-flamegraph](https://github.com/Slach/clickhouse-flamegraph) 是一个用于可视化 `system.trace_log` 的专用工具，形式为 [flamegraph](http://www.brendangregg.com/flamegraphs.html)。

### clickhouse-plantuml {#clickhouse-plantuml}

[cickhouse-plantuml](https://pypi.org/project/clickhouse-plantuml/) 是一个生成表模式 [PlantUML](https://plantuml.com/) 图的脚本。

### ClickHouse 表图 {#clickhouse-table-graph}

[ClickHouse 表图](https://github.com/mbaksheev/clickhouse-table-graph) 是一个简单的 CLI 工具，用于可视化 ClickHouse 表之间的依赖关系。该工具从 `system.tables` 表中检索表之间的连接，并构建 [mermaid](https://mermaid.js.org/syntax/flowchart.html) 格式的依赖关系流程图。使用这个工具你可以轻松地可视化表依赖关系并理解 ClickHouse 数据库中的数据流。借助 mermaid，生成的流程图显得美观，并且可以轻松加入你的 markdown 文档。

### xeus-clickhouse {#xeus-clickhouse}

[xeus-clickhouse](https://github.com/wangfenjin/xeus-clickhouse) 是一个 Jupyter 内核，支持用 SQL 在 Jupyter 中查询 CH 数据。

### MindsDB Studio {#mindsdb}

[MindsDB](https://mindsdb.com/) 是一个开源的 AI 层，适用于包括 ClickHouse 在内的数据库，允许您轻松开发、训练和部署最先进的机器学习模型。 MindsDB Studio(GUI) 允许您从数据库中训练新模型，解释模型做出的预测，识别潜在的数据偏见，并使用可解释 AI 功能评估和可视化模型准确性，以更快地适应和调整机器学习模型。

### DBM {#dbm}

[DBM](https://github.com/devlive-community/dbm) 是一个 ClickHouse 的可视化管理工具！

特点：

- 支持查询历史（分页、清除全部等）。
- 支持选定 SQL 子句查询。
- 支持终止查询。
- 支持表管理（元数据、删除、预览）。
- 支持数据库管理（删除、创建）。
- 支持自定义查询。
- 支持多个数据源管理（连接测试、监控）。
- 支持监控（处理器、连接、查询）。
- 支持数据迁移。

### Bytebase {#bytebase}

[Bytebase](https://bytebase.com) 是一个基于 Web 的开源架构变更和版本控制工具，支持包括 ClickHouse 在内的各种数据库。

特点：

- 开发人员和 DBA 之间的架构审查。
- 数据库即代码，在 VCS 中版本控制架构，如 GitLab，并在代码提交时触发部署。
- 具有每个环境策略的流线型部署。
- 完整的迁移历史。
- 架构漂移检测。
- 备份和恢复。
- RBAC。

### Zeppelin-Interpreter-for-ClickHouse {#zeppelin-interpreter-for-clickhouse}

[Zeppelin-Interpreter-for-ClickHouse](https://github.com/SiderZhang/Zeppelin-Interpreter-for-ClickHouse) 是一个用于 ClickHouse 的 [Zeppelin](https://zeppelin.apache.org) 解释器。与 JDBC 解释器相比，它可以为长时间运行的查询提供更好的超时控制。

### ClickCat {#clickcat}

[ClickCat](https://github.com/clickcat-project/ClickCat) 是一个友好的用户界面，让您搜索、探索和可视化 ClickHouse 数据。

特点：

- 在线 SQL 编辑器，可以运行 SQL 代码而无需任何安装。
- 您可以观察所有过程和突变。对于那些未完成的过程，您可以在 UI 中杀掉它们。
- 指标包含集群分析、数据分析和查询分析。

### ClickVisual {#clickvisual}

[ClickVisual](https://clickvisual.net/) ClickVisual 是一个轻量级的开源日志查询、分析和告警可视化平台。

特点：

- 支持一键创建分析日志库。
- 支持日志收集配置管理。
- 支持用户自定义索引配置。
- 支持告警配置。
- 支持库和表权限配置的权限粒度管理。

### ClickHouse-Mate {#clickmate}

[ClickHouse-Mate](https://github.com/metrico/clickhouse-mate) 是一个 Angular Web 客户端 + 用户界面，用于搜索和探索 ClickHouse 中的数据。

特点：

- ClickHouse SQL 查询自动补全。
- 快速的数据库和表树导航。
- 高级结果过滤和排序。
- 内联 ClickHouse SQL 文档。
- 查询预设和历史记录。
- 100% 基于浏览器，无需服务器/后端。

该客户端可通过 GitHub 页面即时使用： https://metrico.github.io/clickhouse-mate/

### Uptrace {#uptrace}

[Uptrace](https://github.com/uptrace/uptrace) 是一款 APM 工具，提供分布式跟踪和指标，由 OpenTelemetry 和 ClickHouse 驱动。

特点：

- [OpenTelemetry 跟踪](https://uptrace.dev/opentelemetry/distributed-tracing.html)、指标和日志。
- 使用 AlertManager 进行电子邮件/Slack/PagerDuty 通知。
- 类 SQL 的查询语言用于聚合跨度。
- 类 PromQL 的语言用于查询指标。
- 预构建的指标仪表板。
- 通过 YAML 配置多个用户/项目。

### clickhouse-monitoring {#clickhouse-monitoring}

[clickhouse-monitoring](https://github.com/duyet/clickhouse-monitoring) 是一个简单的 Next.js 仪表板，依赖于 `system.*` 表，以帮助监控并提供 ClickHouse 集群的概述。

特点：

- 查询监控：当前查询、查询历史、查询资源（内存、读取的片段、文件打开等）、最耗费的查询、最常用的表或列等。
- 集群监控：总内存/CPU 使用率、分布式队列、全局设置、MergeTree 设置、指标等。
- 表和片段信息：大小、行计数、压缩、片段大小等，列级详细信息。
- 有用的工具：Zookeeper 数据浏览、查询 EXPLAIN、终止查询等。
- 可视化指标图表：查询和资源使用、合并/突变次数、合并性能、查询性能等。

### CKibana {#ckibana}

[CKibana](https://github.com/TongchengOpenSource/ckibana) 是一个轻量级服务，让您能够轻松搜索、探索和可视化 ClickHouse 数据，使用本地 Kibana UI。

特点：

- 将来自本地 Kibana UI 的图表请求转换为 ClickHouse 查询语法。
- 支持采样和缓存等高级功能，以提高查询性能。
- 在从 ElasticSearch 迁移到 ClickHouse 后，最小化用户学习成本。

## 商业 {#commercial}

### DataGrip {#datagrip}

[DataGrip](https://www.jetbrains.com/datagrip/) 是 JetBrains 的数据库 IDE，专门支持 ClickHouse。它也被嵌入到其他基于 IntelliJ 的工具中：PyCharm、IntelliJ IDEA、GoLand、PhpStorm 等。

特点：

- 非常快速的代码补全。
- ClickHouse 语法高亮。
- 支持 ClickHouse 特有的功能，例如嵌套列、表引擎。
- 数据编辑器。
- 重构功能。
- 搜索和导航。

### Yandex DataLens {#yandex-datalens}

[Yandex DataLens](https://cloud.yandex.ru/services/datalens) 是一个数据可视化和分析服务。

特点：

- 可用可视化范围广泛，从简单的条形图到复杂的仪表板。
- 仪表板可以公开可用。
- 支持多种数据源，包括 ClickHouse。
- 基于 ClickHouse 的物化数据存储。

DataLens [可以免费使用](https://cloud.yandex.com/docs/datalens/pricing)，适用于低负载项目，甚至用于商业用途。

- [DataLens 文档](https://cloud.yandex.com/docs/datalens/)。
- [教程](https://cloud.yandex.com/docs/solutions/datalens/data-from-ch-visualization) 介绍如何将 ClickHouse 数据可视化。

### Holistics Software {#holistics-software}

[Holistics](https://www.holistics.io/) 是一个全栈数据平台和商业智能工具。

特点：

- 自动化电子邮件、Slack 和 Google Sheets 报告调度。
- 带有可视化、版本控制、自动补全、可重用查询组件和动态筛选器的 SQL 编辑器。
- 通过 iframe 嵌入报告和仪表板的分析。
- 数据准备和 ETL 能力。
- SQL 数据建模支持，用于关系映射数据。

### Looker {#looker}

[Looker](https://looker.com) 是一个数据平台和商业智能工具，支持超过 50 种数据库方言，包括 ClickHouse。Looker 可作为 SaaS 平台和自托管版本使用。用户可以通过浏览器使用 Looker 来探索数据，构建可视化和仪表板，安排报告，并与同事分享见解。Looker 提供了一套丰富的工具，可以将这些功能嵌入到其他应用程序中，并提供 API 将数据与其他应用程序集成。

特点：

- 使用 LookML 进行简单且灵活的开发，这是一种支持精心策划的 [数据建模](https://looker.com/platform/data-modeling) 的语言，旨在支持报告编写者和最终用户。
- 通过 Looker 的 [数据操作](https://looker.com/platform/actions) 实现强大的工作流集成。

[如何在 Looker 中配置 ClickHouse。](https://docs.looker.com/setup-and-management/database-config/clickhouse)

### SeekTable {#seektable}

[SeekTable](https://www.seektable.com) 是一个自助 BI 工具，用于数据探索和操作报告。它既提供云服务版，也提供自托管版本。SeekTable 的报告可以嵌入到任何 Web 应用中。

特点：

- 面向业务用户的友好报告构建器。
- 强大的报告参数，用于 SQL 筛选和报告特定查询自定义。
- 可以通过原生 TCP/IP 端点和 HTTP(S) 接口连接 ClickHouse（2 个不同驱动程序）。
- 在维度/度量定义中可以使用 ClickHouse SQL 方言的全部功能。
- [Web API](https://www.seektable.com/help/web-api-integration) 用于自动报告生成。
- 支持通过账户数据 [备份/恢复](https://www.seektable.com/help/self-hosted-backup-restore) 的报告开发流程；数据模型（立方体）/报告配置为人类可读的 XML，可以在版本控制系统中存储。

SeekTable 对个人/个体使用是 [免费的](https://www.seektable.com/help/cloud-pricing)。

[如何在 SeekTable 中配置 ClickHouse 连接。](https://www.seektable.com/help/clickhouse-pivot-table)

### Chadmin {#chadmin}

[Chadmin](https://github.com/bun4uk/chadmin) 是一个简单的 UI，可以可视化您当前在 ClickHouse 集群上运行的查询及其信息，并可以根据需要终止这些查询。

### TABLUM.IO {#tablum_io}

[TABLUM.IO](https://tablum.io/) — 一个在线查询和分析工具，用于 ETL 和可视化。它允许连接到 ClickHouse，通过多功能 SQL 控制台查询数据，并从静态文件和第三方服务加载数据。TABLUM.IO 可以将数据结果可视化为图表和表格。

特点：
- ETL：从流行数据库、本地和远程文件、API 调用加载数据。
- 多功能 SQL 控制台，带语法高亮和可视化查询构建器。
- 数据可视化为图表和表格。
- 数据物化和子查询。
- 通过 Slack、Telegram 或电子邮件进行数据报告。
- 通过专有 API 进行数据流水线。
- 支持以 JSON、CSV、SQL、HTML 格式导出数据。
- 基于 Web 的界面。

TABLUM.IO 可以作为自托管解决方案（作为 Docker 镜像）运行或在云中运行。
许可证： [商业](https://tablum.io/pricing) 产品，具有 3 个月的免费期。

在云中免费试用 [https://tablum.io/try](https://tablum.io/try)。
在 [TABLUM.IO](https://tablum.io/) 上了解更多关于该产品的信息。

### CKMAN {#ckman}

[CKMAN](https://www.github.com/housepower/ckman) 是一个管理和监控 ClickHouse 集群的工具！

特点：

- 通过浏览器界面的快速便捷的自动化集群部署。
- 集群可以扩展或缩减。
- 对集群数据进行负载均衡。
- 在线升级集群。
- 在页面上修改集群配置。
- 提供集群节点监控和 zookeeper 监控。
- 监控表和分区的状态，监控慢 SQL 语句。
- 提供易于使用的 SQL 执行页面。

---
'slug': '/deployment-modes'
'sidebar_label': 'Deployment modes'
'description': 'ClickHouse提供四种部署选项，它们都使用同一强大的数据库引擎，只是以不同方式打包，以满足您的特定需求。'
'title': 'Deployment modes'
---

import chServer from '@site/static/images/deployment-modes/ch-server.png';
import chCloud from '@site/static/images/deployment-modes/ch-cloud.png';
import chLocal from '@site/static/images/deployment-modes/ch-local.png';
import chDB from '@site/static/images/deployment-modes/chdb.png';
import Image from '@theme/IdealImage';

ClickHouse 是一个多功能的数据库系统，可以根据您的需求以多种不同的方式进行部署。其核心是，所有部署选项 **都使用相同强大的 ClickHouse 数据库引擎**——不同之处在于您与它的交互方式和运行位置。

无论您是在生产环境中运行大规模分析，进行本地数据分析，还是构建应用程序，都有针对您用例的部署选项。基础引擎的一致性意味着您在所有部署模式中都能获得相同的高性能和 SQL 兼容性。
本指南探讨了部署和使用 ClickHouse 的四种主要方式：

* ClickHouse 服务器，用于传统的客户端/服务器部署
* ClickHouse Cloud，提供完全托管的数据库操作
* clickhouse-local，用于命令行数据处理
* chDB，用于将 ClickHouse 直接嵌入应用程序

每种部署模式具有独特的优势和理想的使用案例，我们将在下面详细探讨。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## ClickHouse 服务器 {#clickhouse-server}

ClickHouse 服务器代表传统的客户端/服务器架构，理想用于生产部署。此部署模式提供全面的 OLAP 数据库功能，以高吞吐量和低延迟查询著称。

<Image img={chServer} alt="ClickHouse 服务器" size="sm"/>

<br/>

在部署灵活性方面，ClickHouse 服务器可以安装在您的本地机器上进行开发或测试，也可以部署到 AWS、GCP 或 Azure 等主要云提供商用于基于云的操作，或在您自己的本地硬件上设置。对于更大规模的操作，可以配置为分布式集群以应对增加的负载并提供高可用性。

此部署模式是生产环境的首选选择，可靠性、性能和全面功能访问至关重要。

## ClickHouse Cloud {#clickhouse-cloud}

[ClickHouse Cloud](/cloud/overview) 是 ClickHouse 的完全托管版本，消除了运行您自己部署的操作开销。虽然它保持了 ClickHouse 服务器的所有核心功能，但通过旨在简化开发和操作的附加特性提升了体验。

<Image img={chCloud} alt="ClickHouse Cloud" size="sm"/>

ClickHouse Cloud 的一个主要优势是其集成工具。 [ClickPipes](/cloud/get-started/cloud-quick-start#clickpipes) 提供了强大的数据摄取框架，使您能够轻松连接和流式传输来自各种来源的数据，而无需管理复杂的 ETL 管道。该平台还提供专用的 [查询 API](/cloud/get-started/query-endpoints)，使构建应用程序变得极为简单。

ClickHouse Cloud 中的 SQL 控制台包括强大的 [仪表板](/cloud/manage/dashboards) 功能，可以让您将查询转换为交互式可视化。您可以创建和共享基于您保存的查询构建的仪表板，并通过查询参数添加交互元素。这些仪表板可以通过全局过滤器动态生成，使用户能够通过可自定义的视图探索数据——不过，重要的是要注意，用户至少需要对基础保存查询的读取访问权限才能查看可视化效果。

为了监控和优化，ClickHouse Cloud 包括内置图表和 [查询洞察](/cloud/get-started/query-insights)。这些工具提供了对集群性能的深度可见性，帮助您理解查询模式、资源利用率和潜在的优化机会。这种可观察性的水平对于需要维持高性能分析操作而不专门分配资源进行基础设施管理的团队尤其宝贵。

该服务的托管性质意味着您无需担心更新、备份、扩展或安全补丁——这些均由系统自动处理。这使它成为想要专注于其数据和应用程序的组织的理想选择，而不是数据库管理。

## clickhouse-local {#clickhouse-local}

[clickhouse-local](/operations/utilities/clickhouse-local) 是一个强大的命令行工具，提供 ClickHouse 的完整功能，作为独立可执行文件。它本质上与 ClickHouse 服务器相同，但以一种让您直接从命令行利用 ClickHouse 所有能力的方式打包，而无需运行服务器实例。

<Image img={chLocal} alt="clickhouse-local" size="sm"/>

此工具在临时数据分析方面表现出色，特别是在处理本地文件或存储在云存储服务中的数据时。您可以直接使用 ClickHouse 的 SQL 方言查询各种格式的文件（CSV、JSON、Parquet 等），使其成为快速数据探索或一次性分析任务的极佳选择。

由于 clickhouse-local 包含了 ClickHouse 的所有功能，您可以用它进行数据转换、格式转换或任何其他您通常在 ClickHouse 服务器上执行的数据库操作。尽管主要用于临时操作，但在需要时它也可以使用与 ClickHouse 服务器相同的存储引擎来持久保存数据。

远程表函数和访问本地文件系统的组合使得 clickhouse-local 在需要连接 ClickHouse 服务器和本地机器上的文件的数据时特别有用。当处理敏感或临时本地数据时，这尤其宝贵，因为您不想将其上传到服务器。

## chDB {#chdb}

[chDB](/chdb) 是将 ClickHouse 嵌入为内部过程数据库引擎，其主要实现为 Python，此外还可用于 Go、Rust、NodeJS 和 Bun。此部署选项将 ClickHouse 强大的 OLAP 能力直接引入您的应用程序进程，消除了单独数据库安装的需要。

<Image img={chDB} alt="chDB - 嵌入式 ClickHouse" size="sm"/>

chDB 提供与您的应用程序生态系统的无缝集成。例如，在 Python 中，它优化了与常见数据科学工具（如 Pandas 和 Arrow）高效协作，最小化了通过 Python memoryview 进行数据复制的开销。这使其对于希望在现有工作流程中利用 ClickHouse 查询性能的数据科学家和分析师尤为宝贵。

chDB 还可以连接到使用 clickhouse-local 创建的数据库，为您处理数据的方式提供灵活性。这意味着您可以无缝地在本地开发、Python 中的数据探索和更持久的存储解决方案之间切换，而无需改变您的数据访问模式。

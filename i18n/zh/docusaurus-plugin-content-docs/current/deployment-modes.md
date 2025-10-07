---
'slug': '/deployment-modes'
'sidebar_label': '部署模式'
'description': 'ClickHouse 提供四种部署选项，所有选项均使用相同强大的 DATABASE 引擎，只是以不同的方式打包，以满足您的特定需求。'
'title': '部署模式'
'keywords':
- 'Deployment Modes'
- 'chDB'
'show_related_blogs': true
'doc_type': 'guide'
---

import chServer from '@site/static/images/deployment-modes/ch-server.png';
import chCloud from '@site/static/images/deployment-modes/ch-cloud.png';
import chLocal from '@site/static/images/deployment-modes/ch-local.png';
import chDB from '@site/static/images/deployment-modes/chdb.png';
import Image from '@theme/IdealImage';

ClickHouse 是一个灵活的数据库系统，根据您的需求可以以多种方式部署。在其核心，所有部署选项 **使用相同强大的 ClickHouse 数据库引擎** – 不同之处在于您如何与其交互以及它运行的位置。

无论您是在生产中运行大规模分析、进行本地数据分析，还是构建应用程序，都有一个针对您用例的部署选项。底层引擎的一致性意味着您在所有部署模式中都能获得相同的高性能和 SQL 兼容性。
本指南探讨了使用 ClickHouse 的四种主要部署方式：

* ClickHouse Server 适用于传统的客户端/服务器部署
* ClickHouse Cloud 适用于完全托管的数据库操作
* clickhouse-local 用于命令行数据处理
* chDB 适用于直接在应用程序中嵌入 ClickHouse

每种部署模式都有其自身的优势和理想用例，我们将在下面详细探讨。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## ClickHouse Server {#clickhouse-server}

ClickHouse Server 代表传统的客户端/服务器架构，适用于生产部署。此部署模式提供完整的 OLAP 数据库功能，具备 ClickHouse 所以闻名的高吞吐量和低延迟查询。

<Image img={chServer} alt="ClickHouse Server" size="sm"/>

<br/>

在部署灵活性方面，ClickHouse Server 可以安装在您的本地计算机上以进行开发或测试，或者部署到 AWS、GCP 或 Azure 等主要云服务提供商的云环境，或在您自己的本地硬件上设置。对于大规模操作，它可以配置为分布式集群，以处理增加的负载并提供高可用性。

这种部署模式是生产环境的首选，可靠性、性能和完整功能访问至关重要。

## ClickHouse Cloud {#clickhouse-cloud}

[ClickHouse Cloud](/cloud/overview) 是 ClickHouse 的一个完全托管版本，消除了运行自己部署的操作开销。虽然它保持了 ClickHouse Server 的所有核心功能，但通过旨在简化开发和运营的额外功能增强了用户体验。

<Image img={chCloud} alt="ClickHouse Cloud" size="sm"/>

ClickHouse Cloud 的一个主要优势是其集成工具。[ClickPipes](/getting-started/quick-start/cloud/#clickpipes) 提供了一个强大的数据摄取框架，允许您轻松连接并从各种来源流式传输数据，而无需管理复杂的 ETL 流水线。该平台还提供专用的 [查询 API](/cloud/get-started/query-endpoints)，让构建应用程序变得更加轻松。

ClickHouse Cloud 中的 SQL 控制台包括一个强大的 [仪表板](/cloud/manage/dashboards) 功能，让您可以将查询转化为交互式可视化。您可以创建并共享由保存的查询构建的仪表板，并通过查询参数添加交互元素。这些仪表板可以通过全局过滤器动态生成，允许用户通过可定制的视图探索数据 – 不过需要注意的是，用户至少需要对基础的保存查询有读取访问权限才能查看可视化。

为了监控和优化，ClickHouse Cloud 包括内置图表和 [查询洞察](/cloud/get-started/query-insights)。这些工具提供了对您的集群性能的深刻可见性，帮助您理解查询模式、资源利用率和潜在的优化机会。这种可观察性对需要维持高性能分析操作的团队尤其重要，而无需分配资源用于基础设施管理。

该服务的托管性质意味着您无需担心更新、备份、扩展或安全补丁 – 这些都将自动处理。这使其成为希望专注于数据和应用程序而非数据库管理的组织的理想选择。

## clickhouse-local {#clickhouse-local}

[clickhouse-local](/operations/utilities/clickhouse-local) 是一个强大的命令行工具，提供 ClickHouse 的完整功能，作为一个独立的可执行文件。它本质上是与 ClickHouse Server 相同的数据库，但以一种让您可以直接从命令行利用 ClickHouse 的所有功能而无需运行服务器实例的方式打包。

<Image img={chLocal} alt="clickHouse-local" size="sm"/>

该工具在临时数据分析中表现出色，特别是在处理本地文件或存储在云存储服务中的数据时。您可以使用 ClickHouse 的 SQL 方言直接查询各种格式的文件（CSV、JSON、Parquet 等），使其成为快速数据探索或一次性分析任务的极佳选择。

由于 clickhouse-local 包含 ClickHouse 的所有功能，您可以用于数据转换、格式转换或您通常使用 ClickHouse Server 进行的任何其他数据库操作。虽然主要用于临时操作，但在需要时也可以使用与 ClickHouse Server 相同的存储引擎持久化数据。

通过远程表函数和对本地文件系统的访问，使得 clickhouse-local 在需要将数据连接到 ClickHouse Server 和本地计算机上的文件之间的场景中特别有用。这在处理敏感或临时本地数据时特别有价值，因为您不想将其上传到服务器。

## chDB {#chdb}

[chDB](/chdb) 是将 ClickHouse 嵌入为进程内数据库引擎，主要实现为 Python，此外还可用于 Go、Rust、NodeJS 和 Bun。此部署选项将 ClickHouse 强大的 OLAP 功能直接带入您的应用程序进程中，消除了单独安装数据库的需要。

<Image img={chDB} alt="chDB - Embedded ClickHouse" size="sm"/>

chDB 与您的应用程序生态系统无缝集成。例如，在 Python 中，它优化了与常用的数据科学工具如 Pandas 和 Arrow 的高效工作，最小化数据复制开销通过 Python memoryview。这对希望在现有工作流中利用 ClickHouse 查询性能的数据科学家和分析师特别有价值。

chDB 还可以连接使用 clickhouse-local 创建的数据库，为您处理数据提供灵活性。这意味着您可以在本地开发、Python 中的数据探索和更持久的存储解决方案之间无缝过渡，而无需更改数据访问模式。

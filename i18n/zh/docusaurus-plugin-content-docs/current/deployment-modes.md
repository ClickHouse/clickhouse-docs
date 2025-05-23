---
'slug': '/deployment-modes'
'sidebar_label': '部署模式'
'description': 'ClickHouse 提供四种部署选项，均使用相同的强大 DATABASE 引擎，只是根据您的特定需求以不同的方式打包。'
'title': '部署模式'
---

import chServer from '@site/static/images/deployment-modes/ch-server.png';
import chCloud from '@site/static/images/deployment-modes/ch-cloud.png';
import chLocal from '@site/static/images/deployment-modes/ch-local.png';
import chDB from '@site/static/images/deployment-modes/chdb.png';
import Image from '@theme/IdealImage';

ClickHouse 是一个多功能的数据库系统，可以根据您的需求以多种不同方式部署。其核心是，所有部署选项 **使用相同强大的 ClickHouse 数据库引擎** —— 不同之处在于您如何与其互动以及它运行的地点。

无论您是在生产中运行大规模分析、进行本地数据分析还是构建应用程序，都有一个专为您的用例设计的部署选项。底层引擎的一致性意味着您可以在所有部署模式中获得相同的高性能和 SQL 兼容性。
本指南探讨了部署和使用 ClickHouse 的四种主要方式：

* ClickHouse Server 用于传统的客户端/服务器部署
* ClickHouse Cloud 用于完全托管的数据库操作
* clickhouse-local 用于命令行数据处理
* chDB 用于将 ClickHouse 直接嵌入到应用程序中

每种部署模式都有其自身的优势和理想用例，下面我们将详细探讨。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## ClickHouse Server {#clickhouse-server}

ClickHouse Server 代表了传统的客户端/服务器架构，适用于生产部署。此部署模式提供了完整的 OLAP 数据库功能，具有 ClickHouse 所以著称的高吞吐量和低延迟查询性能。

<Image img={chServer} alt="ClickHouse Server" size="sm"/>

<br/>

在部署灵活性方面，ClickHouse Server 可以在您的本地机器上进行开发或测试，部署到 AWS、GCP 或 Azure 等主要云提供商以进行基于云的操作，或在您自己的本地硬件上进行设置。对于更大规模的操作，它可以配置为分布式集群，以处理增加的负载并提供高可用性。

此部署模式是生产环境中可靠性、性能和完全功能访问至关重要的首选选择。

## ClickHouse Cloud {#clickhouse-cloud}

[ClickHouse Cloud](/cloud/overview) 是 ClickHouse 的完全托管版本，消除了运行您自己部署的操作开销。虽然它保持了 ClickHouse Server 的所有核心功能，但通过设计旨在简化开发和操作的附加功能来增强体验。

<Image img={chCloud} alt="ClickHouse Cloud" size="sm"/>

ClickHouse Cloud 的一个关键优势是其集成工具。[ClickPipes](/cloud/get-started/cloud-quick-start#clickpipes) 提供了强大的数据摄取框架，使您能够轻松连接和流式传输来自各种来源的数据，而无需管理复杂的 ETL 流水线。该平台还提供了专用的 [查询 API](/cloud/get-started/query-endpoints)，使构建应用程序变得更加容易。

ClickHouse Cloud 中的 SQL 控制台包括强大的 [仪表板](/cloud/manage/dashboards) 功能，让您可以将查询转化为交互式可视化。您可以创建和共享基于已保存查询的仪表板，并通过查询参数添加交互元素。这些仪表板可以使用全局过滤器动态化，允许用户通过可自定义的视图探索数据——不过需要注意的是，用户至少需要对底层已保存查询的读取访问权限才能查看可视化效果。

为了监控和优化，ClickHouse Cloud 包含内置图表和 [查询洞察](/cloud/get-started/query-insights)。这些工具为您的集群性能提供了深度可见性，帮助您了解查询模式、资源利用率以及潜在的优化机会。这种观察能力对于需要维持高性能分析操作而不需要投入资源于基础设施管理的团队尤其有价值。

服务的托管特性意味着您无需担心更新、备份、扩展或安全修补程序——这些都将自动处理。这使其成为希望专注于数据和应用程序，而不是数据库管理的组织的理想选择。

## clickhouse-local {#clickhouse-local}

[clickhouse-local](/operations/utilities/clickhouse-local) 是一个强大的命令行工具，提供 ClickHouse 的完整功能，作为独立的可执行文件。它本质上是与 ClickHouse Server 相同的数据库，但以一种让您可以直接从命令行访问 ClickHouse 的所有功能，而不需要运行服务器实例的方式打包。

<Image img={chLocal} alt="clickHouse-local" size="sm"/>

该工具在临时数据分析方面表现出色，特别是在处理本地文件或存储在云存储服务中的数据时。您可以使用 ClickHouse 的 SQL 方言直接查询各种格式（CSV、JSON、Parquet 等）的文件，使其成为快速数据探索或一次性分析任务的优选。

由于 clickhouse-local 包含 ClickHouse 的所有功能，您可以用于数据转换、格式转换或您通常使用 ClickHouse Server 进行的任何其他数据库操作。尽管主要用于临时操作，但在需要时，它也可以使用与 ClickHouse Server 相同的存储引擎持久化数据。

远程表函数与本地文件系统的访问组合使得 clickhouse-local 在需要在 ClickHouse Server 和您本地机器上的文件之间进行数据连接的场景中特别有用。这在处理您不想上传到服务器的敏感或临时本地数据时尤其有价值。

## chDB {#chdb}

[chDB](/chdb) 是 ClickHouse 作为进程内数据库引擎的嵌入版本，主要实现语言为 Python，不过也支持 Go、Rust、NodeJS 和 Bun。这个部署选项将 ClickHouse 强大的 OLAP 能力直接引入您的应用程序进程，消除了单独数据库安装的需要。

<Image img={chDB} alt="chDB - Embedded ClickHouse" size="sm"/>

chDB 与您的应用程序生态系统无缝集成。例如，在 Python 中，优化了与 Pandas 和 Arrow 等常用数据科学工具高效协作，最小化通过 Python memoryview 的数据复制开销。这对希望在现有工作流中利用 ClickHouse 查询性能的数据科学家和分析师特别有价值。

chDB 还可以连接到使用 clickhouse-local 创建的数据库，为您处理数据提供了灵活性。这意味着您可以无缝地在本地开发、在 Python 中进行数据探索和更持久的存储解决方案之间过渡，而无需改变数据访问模式。

---
'slug': '/deployment-modes'
'sidebar_label': '部署模式'
'description': 'ClickHouse 提供四种部署选项，所有选项均使用相同强大的数据库引擎，只是以不同的方式打包以满足您的特定需求。'
'title': '部署模式'
---

import chServer from '@site/static/images/deployment-modes/ch-server.png';
import chCloud from '@site/static/images/deployment-modes/ch-cloud.png';
import chLocal from '@site/static/images/deployment-modes/ch-local.png';
import chDB from '@site/static/images/deployment-modes/chdb.png';
import Image from '@theme/IdealImage';

ClickHouse 是一个多功能的数据库系统，可以根据您的需求以多种不同方式部署。其核心是所有部署选项 **使用相同强大的 ClickHouse 数据库引擎** —— 不同之处在于您如何与其互动以及它在哪里运行。

无论您是在生产中运行大规模分析、进行本地数据分析，还是构建应用程序，都有一个为您的用例设计的部署选项。底层引擎的一致性意味着您可以在所有部署模式之间获得相同的高性能和 SQL 兼容性。  
本指南探讨了四种主要的 ClickHouse 部署和使用方式：

* ClickHouse Server 用于传统的客户端/服务器部署
* ClickHouse Cloud 用于完全托管的数据库操作
* clickhouse-local 用于命令行数据处理
* chDB 用于直接在应用程序中嵌入 ClickHouse

每种部署模式都有其自身的优点和理想的用例，我们将在下面详细探讨。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## ClickHouse Server {#clickhouse-server}

ClickHouse Server 代表传统的客户端/服务器架构，理想用于生产部署。此部署模式提供完整的 OLAP 数据库功能，具有 ClickHouse 所知的高吞吐量和低延迟查询能力。

<Image img={chServer} alt="ClickHouse Server" size="sm"/>

<br/>

在部署灵活性方面，ClickHouse Server 可以安装在您的本地机器上进行开发或测试，部署到主要云提供商如 AWS、GCP 或 Azure 进行基于云的操作，或在您自己的本地硬件上设置。对于更大规模的操作，可以将其配置为分布式集群，以处理增加的负载并提供高可用性。

此部署模式是在生产环境中对可靠性、性能和全面功能访问至关重要的首选。

## ClickHouse Cloud {#clickhouse-cloud}

[ClickHouse Cloud](/cloud/overview) 是 ClickHouse 的完全托管版本，消除了运行您自己部署的运营开销。它保持了 ClickHouse Server 的所有核心功能，并通过其他旨在简化开发和操作的特点增强了体验。

<Image img={chCloud} alt="ClickHouse Cloud" size="sm"/>

ClickHouse Cloud 的一个主要优势是其集成工具。 [ClickPipes](/cloud/get-started/cloud-quick-start#clickpipes) 提供了强大的数据摄取框架，使您能够轻松地从各种来源连接和流式传输数据，而无需管理复杂的 ETL 管道。该平台还提供专用的 [查询 API](/cloud/get-started/query-endpoints)，使构建应用程序变得更加容易。

ClickHouse Cloud 中的 SQL 控制台包含强大的 [仪表板](/cloud/manage/dashboards) 功能，让您将查询转换为交互式可视化。您可以创建和共享基于已保存查询构建的仪表板，并能够通过查询参数添加交互式元素。这些仪表板可以使用全局过滤器动态生成，允许用户通过可定制的视图探索数据——尽管需要注意的是，用户必须至少具备对底层已保存查询的读取访问权限才能查看可视化效果。

为了监控和优化，ClickHouse Cloud 包含内置图表和 [查询洞察](/cloud/get-started/query-insights)。这些工具提供了对集群性能的深层次可视性，帮助您理解查询模式、资源利用率和潜在的优化机会。对于需要维持高性能分析操作而不愿投入资源于基础设施管理的团队，这种观察能力尤其有价值。

该服务的托管性质意味着您无需担心更新、备份、扩展或安全补丁——这些都由系统自动处理。这使其成为希望关注数据和应用程序而不是数据库管理的组织的理想选择。

## clickhouse-local {#clickhouse-local}

[clickhouse-local](/operations/utilities/clickhouse-local) 是一个强大的命令行工具，提供 ClickHouse 的完整功能，作为单独的可执行文件。它本质上与 ClickHouse Server 相同，但以一种让您无需运行服务器实例即可直接从命令行使用 ClickHouse 所有功能的方式进行打包。

<Image img={chLocal} alt="clickHouse-local" size="sm"/>

该工具在进行临时数据分析时表现出色，特别是在处理本地文件或存储在云存储服务中的数据时。您可以使用 ClickHouse 的 SQL 方言直接查询各种格式的文件（CSV、JSON、Parquet 等），使其成为快速数据探索或一次性分析任务的绝佳选择。

由于 clickhouse-local 包含了 ClickHouse 的所有功能，您可以使用它进行数据转换、格式转换或任何其他通常与 ClickHouse Server 一起进行的数据库操作。尽管主要用于临时操作，但在需要时它也可以使用与 ClickHouse Server 相同的存储引擎来持久化数据。

远程表函数与本地文件系统访问的结合使得 clickhouse-local 在需要在 ClickHouse Server 和本地机器上的文件之间连接数据的场景中特别有用。这在处理敏感或临时本地数据时尤为珍贵，您不希望将其上传到服务器。

## chDB {#chdb}

[chDB](/chdb) 是 ClickHouse 作为一个内嵌的过程数据库引擎，Python 是主要的实现，此外还可以用于 Go、Rust、NodeJS 和 Bun。此部署选项将 ClickHouse 强大的 OLAP 功能直接引入您应用程序的进程中，消除了单独安装数据库的需要。

<Image img={chDB} alt="chDB - Embedded ClickHouse" size="sm"/>

chDB 提供与您应用生态系统的无缝集成。例如，在 Python 中，它被优化为与常见的数据科学工具如 Pandas 和 Arrow 高效工作，通过 Python内存视图最小化数据复制开销。这对希望在现有工作流中利用 ClickHouse 查询性能的数据科学家和分析师尤其有价值。

chDB 还可以连接使用 clickhouse-local 创建的数据库，为您处理数据的方式提供灵活性。这意味着您可以在本地开发、Python 中的数据探索和更长期的存储解决方案之间无缝过渡，而无需更改数据访问模式。

---
'slug': '/deployment-modes'
'sidebar_label': '部署模式'
'description': 'ClickHouse 提供四种部署选项，所有选项都使用相同强大的 DATABASE 引擎，只是为满足您的特定需求而以不同方式打包。'
'title': '部署模式'
'keywords':
- 'Deployment Modes'
- 'chDB'
'show_related_blogs': true
---

import chServer from '@site/static/images/deployment-modes/ch-server.png';
import chCloud from '@site/static/images/deployment-modes/ch-cloud.png';
import chLocal from '@site/static/images/deployment-modes/ch-local.png';
import chDB from '@site/static/images/deployment-modes/chdb.png';
import Image from '@theme/IdealImage';

ClickHouse 是一个多功能的数据库系统，可以根据您的需求以多种不同方式部署。在其核心，所有部署选项 **都使用相同强大的 ClickHouse 数据库引擎** —— 不同之处在于您如何与其互动以及它运行的位置。

无论您是在生产中运行大规模分析，进行本地数据分析，还是构建应用程序，都有针对您用例设计的部署选项。底层引擎的一致性意味着您可以在所有部署模式中获得相同的高性能和 SQL 兼容性。
本指南探讨了部署和使用 ClickHouse 的四种主要方式：

* ClickHouse Server 用于传统的客户端/服务器部署
* ClickHouse Cloud 用于完全托管的数据库操作
* clickhouse-local 用于命令行数据处理
* chDB 用于在应用程序中直接嵌入 ClickHouse

每种部署模式都有其自身的优势和理想用例，我们将在下面详细探讨。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## ClickHouse Server {#clickhouse-server}

ClickHouse Server 代表传统的客户端/服务器架构，非常适合生产部署。这种部署模式提供了完整的 OLAP 数据库功能，具有 ClickHouse 所以以闻名的高吞吐量和低延迟查询。

<Image img={chServer} alt="ClickHouse Server" size="sm"/>

<br/>

在部署灵活性方面，ClickHouse Server 可以在您的本地机器上安装以进行开发或测试，部署到主要云提供商如 AWS、GCP 或 Azure 进行云操作，或在您自己的本地硬件上设置。对于大规模操作，它可以配置为分布式集群，以处理增加的负载并提供高可用性。

这种部署模式是需要可靠性、性能和全面功能访问的生产环境的首选。

## ClickHouse Cloud {#clickhouse-cloud}

[ClickHouse Cloud](/cloud/overview) 是 ClickHouse 的完全托管版本，消除了运行自己部署的操作开销。尽管它维护了 ClickHouse Server 的所有核心功能，但它通过额外的功能增强了开发和操作的体验。

<Image img={chCloud} alt="ClickHouse Cloud" size="sm"/>

ClickHouse Cloud 的一个主要优势是其集成工具。[ClickPipes](/cloud/get-started/cloud-quick-start#clickpipes) 提供了一个强大的数据摄取框架，使您能够轻松连接并从各种源流数据，而无需管理复杂的 ETL 流水线。该平台还提供了专用的 [查询 API](/cloud/get-started/query-endpoints)，大大简化了构建应用程序的过程。

ClickHouse Cloud 中的 SQL 控制台包括强大的 [仪表盘](/cloud/manage/dashboards) 功能，让您可以将查询转化为交互式可视化。您可以创建和共享由保存的查询构建的仪表盘，能够通过查询参数添加交互元素。这些仪表盘可以通过全局过滤器动态生成，让用户通过可自定义的视图探索数据——尽管需要指出的是，用户需要至少读取访问权限才能查看可视化的底层保存查询。

对于监控和优化，ClickHouse Cloud 包含内置图表和 [查询洞察](/cloud/get-started/query-insights)。这些工具提供了深度的集群性能可见性，帮助您理解查询模式、资源利用率和潜在的优化机会。这种可观察性的水平对需要维持高性能分析操作而不分配资源进行基础设施管理的团队特别有价值。

该服务的托管特性意味着您无需担心更新、备份、扩展或安全补丁——这些都由系统自动处理。这使得它成为希望集中精力于数据和应用程序而不是数据库管理的组织的理想选择。

## clickhouse-local {#clickhouse-local}

[clickhouse-local](/operations/utilities/clickhouse-local) 是一个强大的命令行工具，提供了 ClickHouse 的完整功能，打包为一个独立的可执行文件。它本质上与 ClickHouse Server 是相同的数据库，但以一种方式打包，使您可以直接从命令行利用 ClickHouse 的所有能力，而无需运行服务器实例。

<Image img={chLocal} alt="clickHouse-local" size="sm"/>

该工具在临时数据分析方面表现出色，特别是在处理本地文件或存储在云存储服务中的数据时。您可以使用 ClickHouse 的 SQL 方言直接查询各种格式（CSV、JSON、Parquet 等）的文件，是快速数据探索或单次分析任务的绝佳选择。

由于 clickhouse-local 包含了 ClickHouse 的所有功能，您可以用它进行数据转换、格式转换或任何您通常用 ClickHouse Server 完成的数据库操作。虽然主要用于临时操作，但在需要时它也可以使用与 ClickHouse Server 相同的存储引擎持久化数据。

远程表函数的组合与对本地文件系统的访问使得 clickhouse-local 在需要在 ClickHouse Server 和本地计算机上的文件之间连接数据的场景中特别有用。这在处理您不想上传到服务器的敏感或临时本地数据时尤为有价值。

## chDB {#chdb}

[chDB](/chdb) 是 ClickHouse 嵌入的进程内数据库引擎，Python 是主要实现语言，此外还支持 Go、Rust、NodeJS 和 Bun。这种部署选项将 ClickHouse 强大的 OLAP 功能直接带入应用程序的进程中，消除了单独安装数据库的需要。

<Image img={chDB} alt="chDB - Embedded ClickHouse" size="sm"/>

chDB 与您应用程序的生态系统无缝集成。例如，在 Python 中，它已优化为有效地与常见数据科学工具如 Pandas 和 Arrow 一起工作，通过 Python memoryview 最小化数据复制开销。这使得它在希望在现有工作流程中利用 ClickHouse 查询性能的数据科学家和分析师中尤为有价值。

chDB 还可以连接使用 clickhouse-local 创建的数据库，为您处理数据提供灵活性。这意味着您可以在本地开发、在 Python 中进行数据探索以及更永久的存储解决方案之间无缝过渡，而无需更改数据访问模式。

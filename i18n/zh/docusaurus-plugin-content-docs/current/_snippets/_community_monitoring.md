## 社区监控解决方案 {#community-monitoring}

ClickHouse 社区开发了全面的监控解决方案,可与主流可观测性技术栈集成。[ClickHouse Monitoring](https://github.com/duyet/clickhouse-monitoring) 提供了完整的监控配置和预构建仪表板。该开源项目为希望基于成熟最佳实践和经过验证的仪表板配置来实施 ClickHouse 监控的团队提供了快速启动方案。

:::note
与其他直接数据库监控方式一样,该解决方案会直接查询 ClickHouse 系统表,这将导致实例无法进入空闲状态,从而影响成本优化。
:::

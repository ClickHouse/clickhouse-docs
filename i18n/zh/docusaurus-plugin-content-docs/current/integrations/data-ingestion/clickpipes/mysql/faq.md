---
'sidebar_label': '常见问题'
'description': '关于 ClickPipes for MySQL 的常见问题。'
'slug': '/integrations/clickpipes/mysql/faq'
'sidebar_position': 2
'title': 'ClickPipes for MySQL 常见问题解答'
---


# ClickPipes for MySQL 常见问题解答

### MySQL ClickPipe 是否支持 MariaDB? {#does-the-clickpipe-support-mariadb}
是的，MySQL ClickPipe 支持 MariaDB 10.0 及以上版本。它的配置与 MySQL 非常相似，GTID 行为默认启用。

### MySQL ClickPipe 是否支持 Planetscale、Vitess? {#does-the-clickpipe-support-planetscale-vitess}
当前，我们仅支持标准 MySQL。由于 PlanetScale 是基于 Vitess 构建的，因此需要集成 Vitess 的 VStream API，并处理 VGtids（Vitess 全局事务 ID）以跟踪增量更改。这与原生 MySQL 中 CDC 的工作方式有所不同。我们正在积极开发对该功能的支持。

### 在连接 MySQL 时，为什么会出现 TLS 证书验证错误? {#tls-certificate-validation-error}
如果您看到类似 `failed to verify certificate: x509: certificate is not valid for any names` 的错误，这通常是因为您 MySQL 服务器上的 SSL/TLS 证书没有将连接的主机名（例如，EC2 实例 DNS 名称）包含在其有效名称列表中。ClickPipes 默认启用 TLS，以提供安全的加密连接。

要解决此问题，您有三种选择：

1. 在连接设置中使用 IP 地址而不是主机名，同时将 "TLS Host (optional)" 字段留空。虽然这是最简单的解决方案，但因为跳过了主机名验证，所以并不是最安全的。

2. 将 "TLS Host (optional)" 字段设置为与证书的主题备用名称（SAN）字段中的实际主机名匹配 - 这维持了适当的验证。

3. 更新您的 MySQL 服务器的 SSL 证书，以将您用于连接的实际主机名包含在其证书中。

这是一个常见的 MySQL TLS 证书配置问题，特别是在连接自托管在云环境中的数据库时（或通过终端服务使用 AWS Private Link 时），此时公共 DNS 名称与证书中的内容不同。

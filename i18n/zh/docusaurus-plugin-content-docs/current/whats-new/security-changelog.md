---
slug: /whats-new/security-changelog
sidebar_position: 20
sidebar_label: '安全更新日志'
title: '安全更新日志'
description: '安全更新日志，详细说明与安全相关的更新与变更'
doc_type: 'changelog'
keywords: ['security', 'CVE', 'vulnerabilities', 'security fixes', 'patches']
---



# 安全更新日志



## 已在 ClickHouse v25.1.5.5 中修复,2025-01-05 {#fixed-in-clickhouse-release-2025-01-05}

### [CVE-2025-1385](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-5phv-x8x4-83x5) {#CVE-2025-1385}

当启用 library bridge 功能时,clickhouse-library-bridge 会在 localhost 上暴露 HTTP API。这使得 clickhouse-server 能够从指定路径动态加载库并在隔离进程中执行。结合 ClickHouse 表引擎允许将文件上传到特定目录的功能,配置不当的服务器可能被拥有访问这两种表引擎权限的攻击者利用,从而在 ClickHouse 服务器上执行任意代码。

修复已推送至以下开源版本:v24.3.18.6、v24.8.14.27、v24.11.5.34、v24.12.5.65、v25.1.5.5

ClickHouse Cloud 不受此漏洞影响。

致谢:[Arseniy Dugin](https://github.com/ZerLes)


## 已在 ClickHouse v24.5 中修复,2024-08-01 {#fixed-in-clickhouse-release-2024-08-01}

### [CVE-2024-6873](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-432f-r822-j66f) {#CVE-2024-6873}

攻击者可以通过向 ClickHouse 服务器原生接口发送特制请求,在未经身份验证的情况下重定向 ClickHouse 服务器进程的执行流。此重定向仅限于执行时 256 字节内存范围内的可用内容。该漏洞是通过我们的漏洞赏金计划发现的,目前尚未发现已被制作或利用的概念验证远程代码执行 (RCE) 代码。

修复已推送至以下开源版本:v23.8.15.35-lts、v24.3.4.147-lts、v24.4.2.141-stable、v24.5.1.1763、v24.6.1.4423-stable

ClickHouse Cloud 使用不同的版本控制方式,此漏洞的修复已应用于所有运行 v24.2 及更高版本的实例。

致谢:malacupa(独立研究员)


## 已在 ClickHouse v24.1 中修复，2024-01-30 {#fixed-in-clickhouse-release-24-01-30}

### [CVE-2024-22412](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r) {#CVE-2024-22412}

在启用查询缓存的情况下使用 ClickHouse 时，如果在用户角色之间切换，存在获取不准确数据的风险。ClickHouse 建议使用存在此漏洞版本的用户，在其应用程序动态切换不同角色时不要使用查询缓存功能。

修复已推送至以下开源版本：v24.1.1.2048、v24.1.8.22-stable、v23.12.6.19-stable、v23.8.12.13-lts、v23.3.22.3-lts

ClickHouse Cloud 使用不同的版本编号，此漏洞的修复已应用于 v24.0.2.54535 版本。

致谢：Runreveal 团队的 Evan Johnson 和 Alan Braithwaite — 更多信息请参阅[他们的博客文章](https://blog.runreveal.com/cve-2024-22412-behind-the-bug-a-classic-caching-problem-in-the-clickhouse-query-cache/)。


## 已在 ClickHouse v23.10.5.20（2023-11-26）中修复 {#fixed-in-clickhouse-release-23-10-5-20-2023-11-26}

### [CVE-2023-47118](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-g22g-p6q2-x39v) {#CVE-2023-47118}

在默认运行于 9000/tcp 端口的原生接口中存在堆缓冲区溢出漏洞。攻击者可以通过触发 T64 压缩编解码器中的缺陷，导致 ClickHouse 服务器进程崩溃。利用此漏洞无需进行身份验证。

修复已推送至以下开源版本：v23.10.2.13、v23.9.4.11、v23.8.6.16、v23.3.16.7

ClickHouse Cloud 使用不同的版本号体系，针对该漏洞的修复已在 v23.9.2.47475 中应用。

致谢：malacupa（独立研究员）

### [CVE-2023-48298](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-qw9f-qv29-8938) {#CVE-2023-48298}

在 FPC 压缩编解码器中存在整数下溢漏洞。攻击者可以利用该漏洞导致 ClickHouse 服务器进程崩溃。利用此漏洞无需进行身份验证。

修复已推送至以下开源版本：v23.10.4.25、v23.9.5.29、v23.8.7.24、v23.3.17.13。

ClickHouse Cloud 使用不同的版本号体系，针对该漏洞的修复已在 v23.9.2.47475 中应用。

致谢：malacupa（独立研究员）

### [CVE-2023-48704](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-5rmf-5g48-xv63) {#CVE-2023-48704}

在默认运行于 9000/tcp 端口的原生接口中存在堆缓冲区溢出漏洞。攻击者可以通过触发 Gorilla 编解码器中的缺陷，导致 ClickHouse 服务器进程崩溃。利用此漏洞无需进行身份验证。

修复已推送至以下开源版本：v23.10.5.20、v23.9.6.20、v23.8.8.20、v23.3.18.15。

ClickHouse Cloud uses different versioning and a fix for this vulnerability was applied at v23.9.2.47551.

致谢：malacupa（独立研究员）


## 在 ClickHouse 22.9.1.2603 中修复,2022-09-22 {#fixed-in-clickhouse-release-22-9-1-2603-2022-9-22}

### CVE-2022-44011 {#CVE-2022-44011}

ClickHouse 服务器中发现了堆缓冲区溢出漏洞。具有数据加载权限的恶意用户可以通过插入格式错误的 CapnProto 对象导致 ClickHouse 服务器崩溃。

该修复已发布至版本 22.9.1.2603、22.8.2.11、22.7.4.16、22.6.6.16、22.3.12.19

致谢:Kiojj(独立研究员)

### CVE-2022-44010 {#CVE-2022-44010}

ClickHouse 服务器中发现了堆缓冲区溢出漏洞。攻击者可以向 HTTP 端点(默认监听端口 8123)发送特制的 HTTP 请求,导致基于堆的缓冲区溢出,从而使 ClickHouse 服务器进程崩溃。此攻击无需身份验证。

该修复已发布至版本 22.9.1.2603、22.8.2.11、22.7.4.16、22.6.6.16、22.3.12.19

致谢:Kiojj(独立研究员)


## 在 ClickHouse 21.10.2.15 中修复,2021-10-18 {#fixed-in-clickhouse-release-21-10-2-215-2021-10-18}

### CVE-2021-43304 {#cve-2021-43304}

解析恶意查询时,ClickHouse 的 LZ4 压缩编解码器存在堆缓冲区溢出漏洞。LZ4::decompressImpl 循环中的复制操作,特别是任意复制操作 `wildCopy<copy_amount>(op, ip, copy_end)`,未验证是否超出目标缓冲区的边界。

致谢:JFrog 安全研究团队

### CVE-2021-43305 {#cve-2021-43305}

解析恶意查询时,ClickHouse 的 LZ4 压缩编解码器存在堆缓冲区溢出漏洞。LZ4::decompressImpl 循环中的复制操作,特别是任意复制操作 `wildCopy<copy_amount>(op, ip, copy_end)`,未验证是否超出目标缓冲区的边界。此问题与 CVE-2021-43304 非常相似,但存在漏洞的复制操作位于不同的 wildCopy 调用中。

致谢:JFrog 安全研究团队

### CVE-2021-42387 {#cve-2021-42387}

解析恶意查询时,ClickHouse 的 LZ4 压缩编解码器存在堆越界读取漏洞。在 LZ4::decompressImpl() 循环中,从压缩数据读取一个 16 位无符号用户提供的值('offset')。该偏移量随后用于复制操作的长度计算,但未检查复制操作源的上界。

致谢:JFrog 安全研究团队

### CVE-2021-42388 {#cve-2021-42388}

解析恶意查询时,ClickHouse 的 LZ4 压缩编解码器存在堆越界读取漏洞。在 LZ4::decompressImpl() 循环中,从压缩数据读取一个 16 位无符号用户提供的值('offset')。该偏移量随后用于复制操作的长度计算,但未检查复制操作源的下界。

致谢:JFrog 安全研究团队

### CVE-2021-42389 {#cve-2021-42389}

解析恶意查询时,ClickHouse 的 Delta 压缩编解码器存在除零错误。压缩缓冲区的第一个字节用于模运算,但未检查其是否为 0。

致谢:JFrog 安全研究团队

### CVE-2021-42390 {#cve-2021-42390}

解析恶意查询时,ClickHouse 的 DeltaDouble 压缩编解码器存在除零错误。压缩缓冲区的第一个字节用于模运算,但未检查其是否为 0。

致谢:JFrog 安全研究团队

### CVE-2021-42391 {#cve-2021-42391}

解析恶意查询时,ClickHouse 的 Gorilla 压缩编解码器存在除零错误。压缩缓冲区的第一个字节用于模运算,但未检查其是否为 0。

致谢:JFrog 安全研究团队


## 在 ClickHouse 21.4.3.21 中修复,2021-04-12 {#fixed-in-clickhouse-release-21-4-3-21-2021-04-12}

### CVE-2021-25263 {#cve-2021-25263}

拥有 CREATE DICTIONARY 权限的攻击者可以读取允许目录之外的任意文件。

该修复已发布到 20.8.18.32-lts、21.1.9.41-stable、21.2.9.41-stable、21.3.6.55-lts、21.4.3.21-stable 及更高版本。

致谢:[Vyacheslav Egoshin](https://twitter.com/vegoshin)


## ClickHouse 19.14.3.3 版本修复内容,2019-09-10 {#fixed-in-clickhouse-release-19-14-3-3-2019-09-10}

### CVE-2019-15024 {#cve-2019-15024}

拥有 ZooKeeper 写入权限且能够在 ClickHouse 运行的网络中运行自定义服务器的攻击者,可以创建一个恶意服务器,该服务器将伪装成 ClickHouse 副本并在 ZooKeeper 中注册。当其他副本从该恶意副本获取数据分片时,攻击者可以强制 clickhouse-server 向文件系统的任意路径写入数据。

致谢:Yandex 信息安全团队 Eldar Zaitov

### CVE-2019-16535 {#cve-2019-16535}

解压缩算法中的越界读取、越界写入和整数下溢漏洞可被利用,通过原生协议实现远程代码执行(RCE)或拒绝服务(DoS)攻击。

致谢:Yandex 信息安全团队 Eldar Zaitov

### CVE-2019-16536 {#cve-2019-16536}

恶意的已认证客户端可以触发栈溢出,导致拒绝服务(DoS)。

致谢:Yandex 信息安全团队 Eldar Zaitov


## 在 ClickHouse 19.13.6.1 版本中修复,2019-09-20 {#fixed-in-clickhouse-release-19-13-6-1-2019-09-20}

### CVE-2019-18657 {#cve-2019-18657}

表函数 `url` 存在漏洞,允许攻击者在请求中注入任意 HTTP 请求头。

致谢:[Nikita Tikhomirov](https://github.com/NSTikhomirov)


## 在 ClickHouse 版本 18.12.13 中修复,2018-09-10 {#fixed-in-clickhouse-release-18-12-13-2018-09-10}

### CVE-2018-14672 {#cve-2018-14672}

用于加载 CatBoost 模型的函数存在路径遍历漏洞,允许通过错误消息读取任意文件。

致谢:Yandex 信息安全团队的 Andrey Krasichkov


## 在 ClickHouse 18.10.3 版本中修复,2018-08-13 {#fixed-in-clickhouse-release-18-10-3-2018-08-13}

### CVE-2018-14671 {#cve-2018-14671}

unixODBC 允许从文件系统加载任意共享对象,导致了远程代码执行漏洞。

致谢:Yandex 信息安全团队的 Andrey Krasichkov 和 Evgeny Sidorov


## 在 ClickHouse 1.1.54388 版本中修复,2018-06-28 {#fixed-in-clickhouse-release-1-1-54388-2018-06-28}

### CVE-2018-14668 {#cve-2018-14668}

"remote" 表函数允许在 "user"、"password" 和 "default_database" 字段中使用任意字符,导致跨协议请求伪造攻击。

致谢:Yandex 信息安全团队的 Andrey Krasichkov


## 在 ClickHouse 1.1.54390 版本中修复,2018-07-06 {#fixed-in-clickhouse-release-1-1-54390-2018-07-06}

### CVE-2018-14669 {#cve-2018-14669}

ClickHouse MySQL 客户端启用了 "LOAD DATA LOCAL INFILE" 功能,该功能允许恶意 MySQL 数据库从已连接的 ClickHouse 服务器读取任意文件。

致谢:Yandex 信息安全团队的 Andrey Krasichkov 和 Evgeny Sidorov


## 在 ClickHouse 版本 1.1.54131 中修复，2017-01-10 {#fixed-in-clickhouse-release-1-1-54131-2017-01-10}

### CVE-2018-14670 {#cve-2018-14670}

deb 软件包中的配置错误可能导致数据库被未经授权使用。

致谢：英国国家网络安全中心（NCSC）

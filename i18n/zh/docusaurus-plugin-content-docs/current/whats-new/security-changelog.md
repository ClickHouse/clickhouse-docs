---
slug: /whats-new/security-changelog
sidebar_position: 20
sidebar_label: '安全更新日志'
title: '安全更新日志'
description: '记录安全相关更新与变更的更新日志'
doc_type: 'changelog'
keywords: ['安全', 'CVE', '漏洞', '安全修复', '补丁']
---

# 安全更新日志 {#security-changelog}

## 已在 ClickHouse v25.1.5.5 修复，2025-01-05 {#fixed-in-clickhouse-release-2025-01-05}

### [CVE-2025-1385](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-5phv-x8x4-83x5) {#CVE-2025-1385}

当启用 library bridge 功能时，clickhouse-library-bridge 会在 localhost 上暴露一个 HTTP API。这样一来，clickhouse-server 就可以从指定路径动态加载库，并在隔离的进程中执行它。结合 ClickHouse 表引擎中允许将文件上传到特定目录的相关功能，如果服务器配置不当，具有访问这两种表引擎权限的攻击者就可以利用该错误配置，在 ClickHouse 服务器上执行任意代码。

修复已推送到以下开源版本：v24.3.18.6、v24.8.14.27、v24.11.5.34、v24.12.5.65、v25.1.5.5

ClickHouse Cloud 不受此漏洞影响。

致谢：[Arseniy Dugin](https://github.com/ZerLes)

## 已在 ClickHouse v24.5 修复，2024-08-01 {#fixed-in-clickhouse-release-2024-08-01}

### [CVE-2024-6873](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-432f-r822-j66f) {#CVE-2024-6873}

攻击者可以通过向 ClickHouse 服务器的原生接口发送特制请求，在未通过身份验证的情况下重定向 ClickHouse 服务器进程的执行流。该重定向仅限于执行时内存中 256 字节范围内可用的内容。此漏洞通过我们的漏洞奖励计划（Bug Bounty）发现，目前尚无已知的远程代码执行（RCE）概念验证代码被编写或利用。

修复已推送到以下开源版本：v23.8.15.35-lts、v24.3.4.147-lts、v24.4.2.141-stable、v24.5.1.1763、v24.6.1.4423-stable

ClickHouse Cloud 使用不同的版本号体系，本漏洞的修复已应用到所有运行 v24.2 及更高版本的实例。

致谢：malacupa（独立研究员）

## 已在 ClickHouse v24.1 中修复，2024-01-30 {#fixed-in-clickhouse-release-24-01-30}

### [CVE-2024-22412](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r) {#CVE-2024-22412}

在启用 query cache 的 ClickHouse 中在不同用户角色之间切换时，存在获取不准确数据的风险。对于存在该漏洞的 ClickHouse 版本，ClickHouse 建议用户在其应用会在多个角色之间动态切换时不要使用 query cache。

修复已发布到以下开源版本：v24.1.1.2048、v24.1.8.22-stable、v23.12.6.19-stable、v23.8.12.13-lts、v23.3.22.3-lts

ClickHouse Cloud 使用不同的版本编号体系，对此漏洞的修复已在 v24.0.2.54535 中应用。

致谢：Runreveal 团队的 Evan Johnson 和 Alan Braithwaite —— 更多信息可在[他们的博客文章](https://blog.runreveal.com/cve-2024-22412-behind-the-bug-a-classic-caching-problem-in-the-clickhouse-query-cache/)中查看。

## 已在 ClickHouse v23.10.5.20（2023-11-26）中修复 {#fixed-in-clickhouse-release-23-10-5-20-2023-11-26}

### [CVE-2023-47118](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-g22g-p6q2-x39v) {#CVE-2023-47118}

一个影响原生接口的堆缓冲区溢出漏洞，该接口默认监听 9000/tcp 端口。攻击者可以通过触发 T64 压缩编解码器中的缺陷，使 ClickHouse 服务器进程崩溃。利用此漏洞不需要身份验证。

修复已推送到以下开源版本：v23.10.2.13、v23.9.4.11、v23.8.6.16、v23.3.16.7。

ClickHouse Cloud 使用不同的版本号体系，该漏洞已在 v23.9.2.47475 中修复。

致谢：malacupa（独立研究员）

### [CVE-2023-48298](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-qw9f-qv29-8938) {#CVE-2023-48298}

FPC 压缩编解码器中的一个整数下溢漏洞。攻击者可以利用该漏洞导致 ClickHouse 服务器进程崩溃。利用此漏洞不需要身份验证。

修复已推送到以下开源版本：v23.10.4.25、v23.9.5.29、v23.8.7.24、v23.3.17.13。

ClickHouse Cloud 使用不同的版本号体系，该漏洞已在 v23.9.2.47475 中修复。

致谢：malacupa（独立研究员）

### [CVE-2023-48704](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-5rmf-5g48-xv63) {#CVE-2023-48704}

一个影响原生接口的堆缓冲区溢出漏洞，该接口默认监听 9000/tcp 端口。攻击者可以通过触发 Gorilla 编解码器中的缺陷，使 ClickHouse 服务器进程崩溃。利用此漏洞不需要身份验证。

修复已推送到以下开源版本：v23.10.5.20、v23.9.6.20、v23.8.8.20、v23.3.18.15。

ClickHouse Cloud 使用不同的版本号体系，该漏洞已在 v23.9.2.47551 中修复。

致谢：malacupa（独立研究员）

## 已在 ClickHouse 22.9.1.2603 中修复，2022-09-22 {#fixed-in-clickhouse-release-22-9-1-2603-2022-9-22}

### CVE-2022-44011 {#CVE-2022-44011}

在 ClickHouse 服务器中发现了堆缓冲区溢出问题。能够向 ClickHouse 服务器加载数据的恶意用户，可以通过插入格式不正确的 CapnProto 对象使 ClickHouse 服务器崩溃。

修复已发布到版本 22.9.1.2603、22.8.2.11、22.7.4.16、22.6.6.16、22.3.12.19

致谢：Kiojj（独立研究人员）

### CVE-2022-44010 {#CVE-2022-44010}

在 ClickHouse 服务器中发现了堆缓冲区溢出问题。攻击者可以向 HTTP 端点（默认监听端口 8123）发送特制的 HTTP 请求，从而导致基于堆的缓冲区溢出，并使 ClickHouse 服务器进程崩溃。此攻击不需要身份验证。

修复已发布到版本 22.9.1.2603、22.8.2.11、22.7.4.16、22.6.6.16、22.3.12.19

致谢：Kiojj（独立研究人员）

## 已在 ClickHouse 21.10.2.15 修复，2021-10-18 {#fixed-in-clickhouse-release-21-10-2-215-2021-10-18}

### CVE-2021-43304 {#cve-2021-43304}

在解析恶意查询时，ClickHouse 的 LZ4 压缩编解码器中存在堆缓冲区溢出。在 LZ4::decompressImpl 循环中，尤其是在不受约束的拷贝操作 `wildCopy<copy_amount>(op, ip, copy_end)` 中，未验证这些拷贝操作是否会超出目标缓冲区的边界。

致谢：JFrog Security Research Team

### CVE-2021-43305 {#cve-2021-43305}

在解析恶意查询时，ClickHouse 的 LZ4 压缩编解码器中存在堆缓冲区溢出。在 LZ4::decompressImpl 循环中，尤其是在不受约束的拷贝操作 `wildCopy<copy_amount>(op, ip, copy_end)` 中，未验证这些拷贝操作是否会超出目标缓冲区的边界。该问题与 CVE-2021-43304 非常相似，但存在漏洞的拷贝操作位于不同的 wildCopy 调用中。

致谢：JFrog Security Research Team

### CVE-2021-42387 {#cve-2021-42387}

在解析恶意查询时，ClickHouse 的 LZ4 压缩编解码器中存在堆越界读取。作为 LZ4::decompressImpl() 循环的一部分，会从压缩数据中读取一个 16 位无符号、由用户提供的值（“offset”）。该 offset 随后被用于计算拷贝操作的长度，但未检查拷贝源的上界。

致谢：JFrog Security Research Team

### CVE-2021-42388 {#cve-2021-42388}

在解析恶意查询时，ClickHouse 的 LZ4 压缩编解码器中存在堆越界读取。作为 LZ4::decompressImpl() 循环的一部分，会从压缩数据中读取一个 16 位无符号、由用户提供的值（“offset”）。该 offset 随后被用于计算拷贝操作的长度，但未检查拷贝源的下界。

致谢：JFrog Security Research Team

### CVE-2021-42389 {#cve-2021-42389}

在解析恶意查询时，ClickHouse 的 Delta 压缩编解码器中存在除零错误。压缩缓冲区的首字节在未检查是否为 0 的情况下，被用于取模运算。

致谢：JFrog Security Research Team

### CVE-2021-42390 {#cve-2021-42390}

在解析恶意查询时，ClickHouse 的 DeltaDouble 压缩编解码器中存在除零错误。压缩缓冲区的首字节在未检查是否为 0 的情况下，被用于取模运算。

致谢：JFrog Security Research Team

### CVE-2021-42391 {#cve-2021-42391}

在解析恶意查询时，ClickHouse 的 Gorilla 压缩编解码器中存在除零错误。压缩缓冲区的首字节在未检查是否为 0 的情况下，被用于取模运算。

致谢：JFrog Security Research Team

## 在 ClickHouse 21.4.3.21 中修复，2021-04-12 {#fixed-in-clickhouse-release-21-4-3-21-2021-04-12}

### CVE-2021-25263 {#cve-2021-25263}

拥有 `CREATE DICTIONARY` 权限的攻击者，可以读取允许的目录之外的任意文件。

修复已推送至 20.8.18.32-lts、21.1.9.41-stable、21.2.9.41-stable、21.3.6.55-lts、21.4.3.21-stable 及后续版本。

致谢：[Vyacheslav Egoshin](https://twitter.com/vegoshin)

## 已在 ClickHouse 版本 19.14.3.3 中修复，2019-09-10 {#fixed-in-clickhouse-release-19-14-3-3-2019-09-10}

### CVE-2019-15024 {#cve-2019-15024}

拥有 ZooKeeper 写入权限，并且能够在运行 ClickHouse 的网络中运行自定义服务器的攻击者，可以创建一个自定义构建的恶意服务器，使其作为 ClickHouse 副本并在 ZooKeeper 中注册。当其他副本从该恶意副本拉取数据分片时，可以强制 clickhouse-server 向文件系统中的任意路径写入数据。

致谢：Yandex Information Security Team 的 Eldar Zaitov

### CVE-2019-16535 {#cve-2019-16535}

解压缩算法中的 OOB 读、OOB 写和整数下溢可被利用，通过 native protocol 实现 RCE 或 DoS。

致谢：Yandex Information Security Team 的 Eldar Zaitov

### CVE-2019-16536 {#cve-2019-16536}

恶意的已认证客户端可以触发栈溢出，从而导致 DoS。

致谢：Yandex Information Security Team 的 Eldar Zaitov

## 已在 ClickHouse 版本 19.13.6.1 中修复，2019-09-20 {#fixed-in-clickhouse-release-19-13-6-1-2019-09-20}

### CVE-2019-18657 {#cve-2019-18657}

表函数 `url` 存在一个漏洞，该漏洞允许攻击者在请求中注入任意 HTTP 头部。

致谢： [Nikita Tikhomirov](https://github.com/NSTikhomirov)

## 已在 ClickHouse 版本 18.12.13（2018-09-10）中修复 {#fixed-in-clickhouse-release-18-12-13-2018-09-10}

### CVE-2018-14672 {#cve-2018-14672}

用于加载 CatBoost 模型的函数允许进行路径遍历，并可能通过错误信息读取任意文件内容。

致谢：Yandex 信息安全团队的 Andrey Krasichkov

## 已在 ClickHouse 18.10.3 版本（2018-08-13）中修复 {#fixed-in-clickhouse-release-18-10-3-2018-08-13}

### CVE-2018-14671 {#cve-2018-14671}

unixODBC 允许从文件系统中加载任意共享库，从而导致远程代码执行（Remote Code Execution）漏洞。

致谢：Yandex 信息安全团队的 Andrey Krasichkov 和 Evgeny Sidorov

## 已在 ClickHouse 版本 1.1.54388（2018-06-28）中修复 {#fixed-in-clickhouse-release-1-1-54388-2018-06-28}

### CVE-2018-14668 {#cve-2018-14668}

"remote" 表函数在 "user"、"password" 和 "default_database" 字段中允许任意字符，从而可能被利用发起跨协议请求伪造攻击（Cross Protocol Request Forgery Attacks）。

致谢：Yandex 信息安全团队的 Andrey Krasichkov

## 已在 ClickHouse 版本 1.1.54390（2018-07-06）中修复 {#fixed-in-clickhouse-release-1-1-54390-2018-07-06}

### CVE-2018-14669 {#cve-2018-14669}

ClickHouse MySQL 客户端启用了 “LOAD DATA LOCAL INFILE” 功能，这使得恶意的 MySQL 数据库可以从已连接的 ClickHouse 服务器读取任意文件。

致谢：Yandex 信息安全团队的 Andrey Krasichkov 和 Evgeny Sidorov

## 已在 ClickHouse 版本 1.1.54131（2017-01-10）中修复 {#fixed-in-clickhouse-release-1-1-54131-2017-01-10}

### CVE-2018-14670 {#cve-2018-14670}

deb 软件包中的不当配置可能导致数据库被未授权访问和使用。

致谢：英国国家网络安全中心（NCSC）


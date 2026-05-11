---
description: 'ClickHouse 回移策略与自动化概览'
sidebar_label: '回移系统'
sidebar_position: 56
slug: /development/backports
title: '回移系统'
doc_type: 'reference'
---

# 回移系统 \{#backport-system\}

本文档介绍 ClickHouse 的回移策略以及实现该策略的自动化系统。

## 发布模型 \{#release-model\}

ClickHouse 版本遵循 `YY.M.patch.build-type` 格式，其中 `YY` 表示两位数年份，`M` 表示发布月份 (不带前导零) ，`patch` 表示该分支中的补丁号，`build` 表示单调递增的构建号，`type` 则为 `stable` 或 `lts`。

示例：`25.3.8.23-lts` —— 表示 2025 年 3 月的 LTS 版本，补丁号为 8，构建号为 23。

有两个发布通道：

* **Stable** 版本大致按月发布。最近三个 stable 版本会持续接收补丁，因此每个版本大约有三个月的活跃支持期。
* **LTS (长期支持)&#x20;**&#x20;版本每年在 3 月和 8 月发布。同时会支持两个 LTS 版本，每个版本的支持期至少为 12 个月。

建议运行生产环境工作负载的用户使用最新的 stable 版本或 LTS 版本，并及时升级到新的补丁版本，因为补丁版本不会引入破坏性变更。

## 回移策略 \{#backport-policy\}

并非所有变更都会回移。目标是保持发布分支的稳定性，因此回移范围被有意限定得较窄：

* **安全修复** — 始终回移。
* **关键缺陷修复** (异常 (逻辑错误) 、数据丢失、结果错误、RBAC 问题) — 按照通用回移规则自动纳入回移范围；通过 `pr-critical-bugfix` 标签识别，该标签会自动添加 `pr-must-backport`。
* **稳定性和回归修复** — 当修改带来的风险低于保留该缺陷不修复的风险时，会进行回移；通过维护者手动添加 `pr-must-backport` 进行标识。
* **有可用变通方案的次要缺陷修复** — 通常不回移，以避免影响发布分支的稳定性。
* **新功能、改进、性能相关工作** — 不回移。

标签 `pr-must-backport` 是维护者用于将 PR 标记为需要回移的手动重写标记。标签 `pr-critical-bugfix` 会通过 CI hook 自动添加 `pr-must-backport` (参见 `pr_labels_and_category.py`) 。

**冲突升级处理。** 当自动回移无法解决合并冲突时，仍必须创建一个 cherry-pick PR，并将其分配给原始 PR 的作者、合并者以及现有受分配人，以便由人工解决冲突并完成回移。

## 回移工具 \{#backport-tool\}

上文描述的回移策略由 `tests/ci/cherry_pick.py` 中的自动化工具实现。该工具以 GitHub Actions 工作流的形式运行在 ClickHouse 基础设施上，并涵盖了所有要求：发现活跃的发布分支、筛选符合回移条件的 PR、执行两阶段的 cherry-pick 和回移流程、处理冲突、强制执行延迟策略，以及保持标签同步。

长期目标是将这一实现提炼为一个独立运行的开源 Python 工具，供其他项目采用。目标设计如下：

* **可配置** — 所有策略参数 (符合条件的标签、延迟窗口、陈旧 PR 阈值、逐步推广行为等) 都通过配置文件来表达，使该工具无需修改代码即可适配任何项目的回移要求。
* **可分发** — 打包为可从 PyPI 安装的自包含 Python wheel，不依赖 ClickHouse 的 CI 基础设施。
* **可编程** — 为拉取请求、标签和发布分支提供清晰的对象模型，以便用户在核心引擎之上编写自定义工作流脚本。

### 测试 \{#testing\}

独立运行工具计划包含一个专用测试套件和一套轻量级测试基础设施。该基础设施将能够创建临时 GitHub 代码仓库 (或本地等效环境) ，并预先填充以下内容：

* 一组可配置的分支，用于表示各条发布线，
* 带有不同 回移 标签组合的拉取请求，
* 带有 `release` 标签并指向发布分支的发布 PR。

这样，测试就可以在不触及生产状态的前提下，针对一个真实但可随时丢弃的代码仓库，覆盖完整的自动化闭环——标签检测、cherry-pick 分支创建、冲突处理、回移 PR 创建、assignee 逻辑、跳过发布以及延迟策略。同一套基础设施还可以在策略变更部署前复用，用于进行回归测试。

## 活跃发布分支 \{#active-release-branches\}

活跃发布分支是指其对应的发布 PR (带有 `release` 标签) 在 GitHub 上仍处于打开状态的分支。回移自动化会在每次运行时动态发现这些分支，因此当创建新版本或旧版本生命周期结束时，无需修改任何配置。

发布分支在新版本部署期间，可能处于**滚动发布中**状态 (其发布 PR 带有 `rolling-out` 标签) 。为避免增加发布过程的复杂性，处于滚动发布中的分支会暂停常规回移。特定版本标签 (例如 `v25.3-must-backport`) 会重写这一行为，即使在发布期间也会强制执行回移。

## 实现 \{#implementation\}

### 概述 \{#overview\}

回移自动化作为 `CherryPick` GitHub Actions 工作流 (`.github/workflows/cherry_pick.yml`) 每小时运行一次，由 `tests/ci/cherry_pick.py` 实现。它通过 GitHub API 以及在自托管的 `style-checker-aarch64` runner 上执行的本地 git 操作来工作。

对于每一组 (原始 PR、发布分支) 组合，该流程分为两个阶段：

1. 创建一个 **cherry-pick PR**，用于将冲突解决与实际合并目标隔离开来。如果没有冲突，则会自动合并。
2. 针对实际发布分支创建一个 **回移 PR**，并将 cherry-pick 的变更压缩成一个提交。

### 标签 \{#labels\}

原始 PR 上的标签用于控制是否执行回移，以及回移到哪些位置。

| Label                                               | Effect                                                                       |
| --------------------------------------------------- | ---------------------------------------------------------------------------- |
| `pr-must-backport`                                  | 回移到所有活跃的发布分支 (跳过标记为 `rolling-out` 的分支)                                       |
| `pr-must-backport-force`                            | 回移到所有活跃的发布分支，忽略 `rolling-out` 限制                                             |
| `pr-critical-bugfix`                                | 自动触发 `pr-must-backport` (通过 `pr_labels_and_category.py` 中的 `AUTO_BACKPORT`)  |
| `v{VER}-must-backport` (e.g. `v25.3-must-backport`) | 仅回移到该特定发布分支；对该分支会重写 `rolling-out` 的跳过规则                                      |
| `pr-backports-created`                              | 当所有必需的回移 PR 都已创建时由机器人设置；如果某个 cherry-pick PR 被重新打开，则会清除                       |
| `pr-cherrypick`                                     | 用于机器人创建的 cherry-pick PR                                                      |
| `pr-backport`                                       | 用于机器人创建的回移 PR                                                                |
| `do not test`                                       | 用于 cherry-pick PR，以便 CI 不会在其上运行                                              |
| `rolling-out`                                       | 设置在**发布 PR**上，表示其分支当前正在滚动发布；常规回移会跳过该分支                                       |

### 分支和 PR 的命名 \{#branch-and-pr-naming\}

对于每个原始 PR 编号 `N` 和发布分支 `release/X.Y`：

* Cherry-pick 分支：`cherrypick/release/X.Y/N`
* 回移 分支：`backport/release/X.Y/N`
* Cherry-pick PR 标题：`Cherry pick #N to release/X.Y: <original title>`
* 回移 PR 标题：`Backport #N to release/X.Y: <original title>`

### 分步流程 \{#step-by-step-process\}

#### 1. 识别活跃的发布版本 \{#discover-active-releases\}

`BackportPRs.receive_release_prs` 会在 GitHub 上查询所有带有 `release` 标签的未关闭 PR。这些 PR 的 head ref 就是发布分支名 (例如 `release/25.3`) 。随后会据此生成一组兼容性标签，如 `v25.3-must-backport` 等。

#### 2. 查找需要回移的 PR \{#find-prs-to-backport\}

`BackportPRs.receive_prs_for_backport` 使用 GitHub 搜索 API 查找满足以下条件的已合并 PR：

* 至少带有一个 回移 标签 (`pr-must-backport`、`pr-must-backport-force`、`pr-critical-bugfix` 或特定版本标签) ，并且
* **尚未**带有 `pr-backports-created`，并且
* 在任意发布分支上找到的最早提交日期之后被合并，并且
* 在最近 90 天内有更新 (以保证搜索查询的效率) 。

#### 3. `rolling-out` 分支处理 \{#rolling-out-branch-handling\}

当发布 PR 带有 `rolling-out` 标签时，通用 回移 标签 (`pr-must-backport`、`pr-critical-bugfix`) 会跳过该分支。机器人会关闭此前为该分支创建的所有 cherry-pick 或 回移 PR，并附上说明原因的评论。特定版本标签 (例如 `v25.3-must-backport`) 始终会重写这一规则。`pr-must-backport-force` 会对所有分支绕过 `rolling-out` 检查。

#### 4. Cherry-pick 阶段 (`ReleaseBranch.create_cherrypick`) \{#cherry-pick-stage\}

对于每一对尚未存在 cherry-pick PR 的 (原始 PR、发布分支) 组合：

1. 检出发布分支，并基于该分支创建一个 **backport 分支** (`backport/release/X.Y/N`) 。
2. 对合并提交的第一个父提交执行 `git merge -s ours`，以创建一个不包含内容变更的合成合并基。
3. 强制创建一个 **cherry-pick 分支** (`cherrypick/release/X.Y/N`) ，使其直接指向原始 PR 的合并提交。
4. 尝试使用 `git merge --no-commit --no-ff` 将 cherry-pick 分支合并到 backport 分支：
   * 如果已经是最新状态，则表示该变更已存在于发布分支中——标记为已完成并跳过。
   * 否则 (无论是否有冲突) ，重置并推送这两个分支。
5. 创建一个 cherry-pick PR，以 `cherrypick/release/X.Y/N` 为源分支、`backport/release/X.Y/N` 为目标分支，并添加 `pr-cherrypick` 和 `do not test` 标签。
6. 如果适用，从原始 PR 继承 `pr-bugfix` 或 `pr-critical-bugfix` 标签。
7. 此时**不会**设置负责人；只有在检测到冲突时才会添加。

#### 5. 无冲突 cherry-pick PR 的自动合并 \{#auto-merge-conflict-free-cherry-pick-prs\}

如果 cherry-pick PR 可以合并 (无冲突) ，机器人会通过 GitHub API 自动合并，并立即进入 回移 阶段。

#### 6. 回移阶段 (`ReleaseBranch.create_backport`) \{#backport-stage\}

在 cherry-pick PR 合并后：

1. 检出并拉取 backport 分支。
2. 找到 release 分支与 backport 分支之间的 merge-base。
3. 执行 `git reset --soft` 回退到该 merge-base，将所有通过 cherry-pick 引入的提交压成一个提交。
4. 使用 backport PR 的标题作为提交信息进行提交。
5. 强制推送 backport 分支，并创建一个目标为实际 release 分支的 backport PR。
6. 为 PR 添加 `pr-backport` 标签 (如适用，再添加 `pr-bugfix` / `pr-critical-bugfix`) 。
7. 将 PR 分配给原始 PR 的作者、合并者以及现有受分配人 (不包括机器人账户) 。

#### 7. 完成 \{#completion\}

当某个原始 PR 对应的所有发布分支都已完成回移后，机器人会在该原始 PR 上添加 `pr-backports-created`。

#### 8. 预检查 \{#pre-check\}

在开始处理 PR 之前，`ReleaseBranch.pre_check` 会运行 `git merge-base --is-ancestor`，以验证该合并提交是否尚未被发布分支包含。如果已经包含，则该 PR 会被视为已完成回移并跳过。

### 过时的 Cherry-pick PR 处理 \{#stale-cherry-pick-pr-handling\}

`CherryPickPRs` class 会在每小时执行开始时运行，并处理以下两种情况：

* **孤立的 cherry-pick PR**：如果某个 cherry-pick PR 的发布分支已不再有处于打开状态的发布 PR (即该发布已关闭) ，该 cherry-pick PR 就会被自动关闭。
* **重新打开的 cherry-pick PR**：如果原始 PR 已带有 `pr-backports-created`，但对应的 cherry-pick PR 仍处于打开状态，则会从原始 PR 上移除 `pr-backports-created` 标签，以便重新处理。

对于等待人工解决冲突的 cherry-pick PR：

* **3 天**内没有任何更新后，机器人会发布一条提醒评论，并提及受分配人。
* **7 天**内没有任何更新后，机器人会发布一条关闭评论，然后关闭该 PR。

### 解决冲突 \{#conflict-resolution\}

当 cherry-pick 出现冲突时，cherry-pick PR 会保持打开状态，等待人工处理。机器人会将其分配给原始 PR 的作者、合并者和受分配人。冲突解决后，待 cherry-pick PR 合并完成，机器人会在下一次每小时运行时创建 回移 PR。

如果要彻底放弃某个 回移，请关闭该 cherry-pick PR。机器人会将其视为有意跳过。

要从头重新创建一个损坏的 cherry-pick PR：

1. 从 cherry-pick PR 中移除 `pr-cherrypick` 标签。
2. 删除 `cherrypick/...` 分支。
3. 如果存在，从原始 PR 中移除 `pr-backports-created`。

### 回移 PR 的 CI \{#ci-for-backport-prs\}

回移 PR 以发布分支为目标，因此使用专用的 CI 工作流 (`BackportPR`，定义在 `ci/workflows/backport_branches.py` 中) ，而不是标准的拉取请求工作流。该工作流会运行一组具有代表性的 CI 子集：ASan/UBSan 和 TSan 构建、发布构建、macOS 构建、在 ASan 下执行的功能测试、在 TSan 下执行的压力测试，以及集成测试。它还会验证 回移 分支包含 1 到 50 个提交，且至少有一个已修改的文件 (由 `check_backport_branch.py` 强制检查) 。

### 身份验证 \{#authentication\}

该工作流使用 SSH 密钥 (`ROBOT_CLICKHOUSE_SSH_KEY`) 执行 git push 操作。GitHub API 调用通过 `get_best_robot_token` 进行身份验证；该方法会从存储在 SSM (`/github-tokens`) 中的令牌池中选择剩余配额最多的令牌。`ROBOT_CLICKHOUSE_COMMIT_TOKEN` 用于 Actions 工作流中的 checkout 步骤，而非 API 调用。在分配负责人时，会排除机器人账户 (`robot-clickhouse`、`clickhouse-gh`) 。

### GitHub API 缓存 \{#github-api-cache\}

`GitHubCache` (来自 `cache_utils.py`) 会将 PyGithub 对象缓存持久化到 S3，以减少每小时运行时的 API 调用。缓存会在每次运行开始时下载，并在结束时上传。

### 错误处理 \{#error-handling\}

单个 PR 处理过程中出现的错误会被捕获并记录日志，但不会中止整个运行。所有 PR 处理完成后，如果期间出现过任何错误，则会引发 `BackportException`。在 CI 中，这会通过 `CIBuddy` 向团队聊天发送通知。
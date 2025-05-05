---
sidebar_position: 1
sidebar_label: 'Beta Features and Experimental'
title: 'Beta and Experimental Features'
description: 'ClickHouse has beta and experimental features. This documentation page discusses definition.'
slug: /beta-and-experimental-features
---

Because ClickHouse is open-source, it receives many contributions not only from ClickHouse employees but also from the community. These contributions are often developed at different speeds; certain features may require a lengthy prototyping phase or more time for sufficient community feedback and iteration to be considered generally available (GA).

Due to the uncertainty of when features are classified as generally available, we delineate features into two categories: **Beta** and **Experimental**.

**Beta** features are officially supported by the ClickHouse team. **Experimental** features are early prototypes driven by either the ClickHouse team or the community and are not officially supported.

The sections below explicitly describe the properties of **Beta** and **Experimental** features:

## Beta Features {#beta-features}

- Under active development to make them generally available (GA)
- Main known issues can be tracked on GitHub
- Functionality may change in the future
- Possibly enabled in ClickHouse Cloud
- The ClickHouse team supports beta features

The following features are considered Beta in ClickHouse Cloud and are available for use in ClickHouse Cloud Services, even though they may be currently under a ClickHouse SETTING named ```allow_experimental_*```:

Note: please be sure to be using a current version of the ClickHouse [compatibility](/operations/settings/settings#compatibility) setting to be using a recently introduced feature.

## Experimental Features {#experimental-features}

- May never become GA
- May be removed
- Can introduce breaking changes
- Functionality may change in the feature
- Need to be deliberately enabled
- The ClickHouse team **does not support** experimental features
- May lack important functionality and documentation
- Cannot be enabled in the cloud

Please note: no additional experimental features are allowed to be enabled in ClickHouse Cloud other than those listed above as Beta.

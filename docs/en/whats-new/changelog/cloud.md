---
slug: /en/whats-new/cloud
sidebar_position: 1
sidebar_label:  Cloud
title: Cloud Changelog
---

## October 25, 2022

The ClickHouse Cloud version is based on ClickHouse core v22.10. For a list of compatible features, refer to the [Cloud Compatibility](/docs/en/whats-new/cloud-capabilities.md) guide.

This release significantly lowers compute consumption for small workloads, improves stability through better defaults, and enhances the Billing and Usage views in the ClickHouse Cloud console. 

### General changes

- Reduced minimum service memory allocation to 24G
- Reduced service idle timeout from 30 minutes to 5 minutes

### Configuration changes

- Reduced max_parts_in_total from 100k to 10k. The default value of the `max_parts_in_total` setting for MergeTree tables has been lowered from 100,000 to 10,000. The reason for this change is that we observed that a large number of data parts is likely to cause a slow startup time of services in the cloud. A large number of parts usually indicate a choice of too granular partition key, which is typically done accidentally and should be avoided. The change of default will allow the detection of these cases earlier. 

### Console changes

- Enhanced credit usage details in the Billing view for trial users
- Improved tooltips and help text, and added a link to the pricing page in the Usage view
- Improved workflow when switching options for IP filtering
- Added resend email confirmation button to the cloud console

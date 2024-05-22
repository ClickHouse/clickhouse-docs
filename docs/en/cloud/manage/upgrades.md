---
sidebar_label: Upgrades
slug: /en/manage/updates
---

# Upgrades

With ClickHouse Cloud you never have to worry about patching and upgrades. We roll out upgrades that include fixes, new features and performance improvements on a periodic basis. For the full list of what is new with ClickHouse refer to our [Cloud changelog](/docs/en/cloud/reference/changelog.md).

## Use the default settings of a ClickHouse release

If you want to specify that a ClickHouse Cloud service has the setting defaults of a particular ClickHouse version, then you can set the compatibility setting to the desired version.  For example, to specify version `22.8` you could use: `ALTER USER default SETTINGS compatibility = '22.8'`. This changes other settings according to the provided ClickHouse version. This compatibility setting allows you to use default values from previous versions for all the settings that were not set by the user.

## Maintenance mode

At times, it may be necessary for us to update your service, which could require us to disable certain features such as scaling or idling. In rare cases, we may need to take action on a service that is experiencing issues and bring it back to a healthy state. During such maintenance, you will see a banner on the service page that says _"Maintenance in progress"_. You may still be able to use the service for queries during this time. 

You will not be charged for the time that the service is under maintenance. _Maintenance mode_ is a rare occurrence and should not be confused with regular service upgrades.

## Release channels (upgrade schedule)

You are able to specify the upgrade schedule for your ClickHouse Cloud service by subscribing to a specific release channel. Besides the regular upgrade schedule, we offer a **Fast release** channel if you would like your services to receive updates ahead of the regular release schedule. Subscribing to the **Fast release** channel for early upgrades is recommended only for non-production environments and can be requested by logging a support ticket.

### Fast release channel (early upgrades)

- Receive the latest ClickHouse releases
- More frequent upgrades as new releases are tested
- Recommended for non-production environments
- Supported for both the **Production** and **Development** tiers

## Regular release channel

- Recommended for production environments
- New minor versions are released at least two weeks after the **Fast release** channel
- New patch versions are released at least two days after the **Fast release** channel

---
slug: /cloud/get-started/cloud/use-cases/real-time-analytics
title: 'Real-time analytics'
keywords: ['use cases', 'real-time analytics']
sidebar_label: 'Real-time analytics'
---

import Image from '@theme/IdealImage';
import rta_0 from '@site/static/images/cloud/onboard/discover/use_cases/0_rta.png';
import rta_1 from '@site/static/images/cloud/onboard/discover/use_cases/1_rta.png';

## What is real-time analytics?

Real-time analytics refers to data processing that delivers insights to end users
and customers as soon as the data is generated. It differs from traditional or 
batch analytics, where data is collected in batches and processed, often a long 
time after it was generated.

Real-time analytics systems are built on top of event streams, which consist of 
a series of events ordered in time. An event is something that’s already happened.
It could be the addition of an item to the shopping cart on an e-commerce website,
the emission of a reading from an Internet of Things (IoT) sensor, or a shot on 
goal in a football (soccer) match.

An event (from an imaginary IoT sensor) is shown below, as an example:

```json
{
  "deviceId": "sensor-001",
  "timestamp": "2023-10-05T14:30:00Z",
  "eventType": "temperatureAlert",
  "data": {
    "temperature": 28.5,
    "unit": "Celsius",
    "thresholdExceeded": true
  }
}
```

Organizations can discover insights about their customers by aggregating and 
analyzing events like this. This has traditionally been done using batch analytics,
and in the next section, we’ll compare batch and real-time analytics.

## Real-Time analytics vs batch analytics

The diagram below shows what a typical batch analytics system would look like 
from the perspective of an individual event:

<Image img={rta_0} size="md" border alt="batch analytics diagram" />

You can see that there’s quite a big gap from when the event happens until we 
process and gain some insight from it. Traditionally, this was the only means of
data analysis, and we’d need to create artificial time boundaries to process 
the data in batches. For example, we might process all the data collected at the
end of a day. This worked for many use cases, but for others, it’s sub-optimal 
because we’re working with stale data, and it doesn’t allow us to react to the 
data quickly enough.

By contrast, in real-time analytics systems, we react to an event as soon as it 
happens, as shown in the following diagram:

<Image img={rta_1} size="md" border alt="Real-time analytics diagram" />

We can now derive insights from events almost as soon as they’re generated. But 
why is this useful?

## Benefits of real-time analytics {#benefits-of-real-time-analytics}

In today's fast-paced world, organizations rely on real-time analytics to stay 
agile and responsive to ever-changing conditions. A real-time analytics system 
can benefit a business in many ways.

### Better decision-making {#better-decision-making}

Decision-making can be improved by having access to actionable insights via 
real-time analytics. When business operators can see events as they’re happening,
it makes it much easier to make timely interventions.

For example, if we make changes to an application and want to know whether it’s
having a detrimental effect on the user experience, we want to know this as 
quickly as possible so that we can revert the changes if necessary. With a less
real-time approach, we might have to wait until the next day to do this 
analysis, by which type we’ll have a lot of unhappy users.

### New products and revenue streams {#new-products-and-revenue-streams}

Real-time analytics can help businesses generate new revenue streams. Organizations
can develop new data-centered products and services that give users access to 
analytical querying capabilities. These products are often compelling enough for 
users to pay for access.

In addition, existing applications can be made stickier, increasing user 
engagement and retention. This will result in more application use, creating more
revenue for the organization.

### Improved customer experience {#improved-customer-experience}

With real-time analytics, businesses can gain instant insights into customer 
behavior, preferences, and needs. This lets businesses offer timely assistance, 
personalize interactions, and create more engaging experiences that keep 
customers returning.








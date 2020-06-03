---
layout: post
title: "How to access Deep web in 3 minutes"
author: "Vinh VO"
meta_keywords: "onion network, deep web, dark web"
meta_description: ""
---

_\* depends on your internet connection_

This article will guide you on how to dive as fast as possible into the huge [hidden part of the Internet][3]. It should be short enough to read. Since all the instructions are easy to replicate in several minutes, a long story will definitely make no sense.

## Why?

There are already uncountable articles which did the same. But this one **focuses on keeping your system as vanilla as possible** and **avoids to degrade your web browsing experience**: it _ONLY_ routes all your onion sites accessing via tor.

## Prerequisite

0. A (good) browser. Firefox is a recommended choice. Firefox Developer Edition was used. And the SwtichyOmega extension.
0. Docker.

## Let's dive

### The first 1 minute: Tor

Summon the magic door:

```
$ docker run -p 9050:9050 voldedore/tor
```

That command will pull the [docker image][1] if it was not pulled before. It then starts our tor client which is exposed on the default port: 9050. We were mapping it to the host port 9050 also.

>
> The docker image is open-sourced [here][2].
>

The result:

```
[...]
Jun 02 02:48:43.000 [notice] Bootstrapped 71%: Loading relay descriptors
Jun 02 02:48:43.000 [notice] Bootstrapped 78%: Loading relay descriptors
Jun 02 02:48:44.000 [notice] Bootstrapped 80%: Connecting to the Tor network
Jun 02 02:48:44.000 [notice] Bootstrapped 85%: Finishing handshake with first hop
Jun 02 02:48:45.000 [notice] Bootstrapped 90%: Establishing a Tor circuit
Jun 02 02:48:46.000 [notice] Tor has successfully opened a circuit. Looks like client functionality is working.
Jun 02 02:48:46.000 [notice] Bootstrapped 100%: Done
```

Almost done! Next step is to configure our browser to use that as the proxy for web surfing.

### The next 2 minutes: Firefox configuration

Open Firefox, go to SwitchyOmega > Options.

Create a new Proxy profile. **Proxy profiles will tunnel all your traffic via the proxy**.

Let's name it, says Onion. (Optional: Change its colour to purple). Since Tor is not an http proxy, so you have to select SOCK5. Let others as default.

![New onion profile]({{ '/assets/images/deep_web/new_onion_profile.png' | relative_url }})

Next, create a new Switch profile. Switch profiles are the art of our effort. **It doesn't route all your traffic via the proxy, but only some URLs by matching them as wildcard or RegExp**. So the rest of your website accessing still go directly. For some reasons, this scenario is realistic: Tor proxy is slow and some websites block tor traffic.

This time, name it Onion_switch. Let's add two conditions.

0. URL wildcard for https://check.torproject.org/
0. Host wildcard for any website that ends with `.onion`.

![New switch profile]({{ '/assets/images/deep_web/new_switch_profile.png' | relative_url }})

Everything is theorically nicely done. Go back to Firefox, and click on the extension icon, then choose the profile `Onion_switch`. The icon will change its colour. 

Go to https://check.torproject.org/ 

> Congratulation. This browser is configured to use Tor.

This should tunnel all your traffic from any deep website via tor proxy.

Go to https://www.jsonip.com/. Your public IP should be the same as you don't use tor at all.

Then, enjoy.

[1]: https://hub.docker.com/r/voldedore/tor
[2]: https://github.com/voldedore/docker-tor
[3]: https://i0.kym-cdn.com/photos/images/original/001/085/082/12e.png


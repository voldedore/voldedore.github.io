---
layout: post
title:  "Sự phối hợp nhịp nhàng của Resin và Raspberry Pi"
author: "Vinh VO"
published: true
---

*Mấy nay do hội nghị APEC nên mạng hơi chậm... à không, do đứt cable quang biển nên mạng hơi chậm. Nhờ vậy mới có dịp ngồi viết trong lúc chờ đợi docker nó build. Do bài này khá dài nên có lẽ mình sẽ làm 1 series.*

## Mở bài

Cách đây 3 năm, mình có dịp được tiếp xúc với board Raspberry Pi lần đầu. Lúc đó model mới nhất là Pi 1 B+. Cảm giác lúc đó rất thích thú và khâm phục ai đã biến ý tưởng đem nguyên cái PC thu nhỏ thành 1 cái card visit thành hiện thực.

Sau dự án đó mình không có dịp làm về RPi nữa. Nhưng trái đất vẫn cứ quay và tiền lương mỗi tháng vẫn cứ hết... à không và công nghệ vẫn cứ phát triển để một ngày như hôm nay chúng ta có dịp để bàn về cách mà RPi, ResinOS và Docker phối hợp với nhau nhịp nhàng như thế nào.

## Nói sơ về quá khứ

Lúc đó, nhu cầu chính của đa số dân sử dụng RPi là lấy nó gắn cable HDMI vào cái TV và chúng ta có 1 con HTPC với giá $35. Mình không (dám) đề cập tới dân điện tử và những dự án với RPi của họ vì đây không phải lĩnh vực của mình. Vì tốt nhất là cái gì không biết thì không nên nói.

Và nói về lĩnh vực IT thì, **workflow chủ yếu hay giống như sau:** 1) đầu tiên, phải flash cái image Raspbian (được Raspberry custom lại dựa trên Debian) vào thẻ nhớ microSD (tầm 4GB là chạy ngon) bằng lệnh `dd` trên PC. 2) Sau đó gắn thẻ nhớ vào board, ghim cable HDMI vào màn hình, ghim nguồn vào, 4) set ip tĩnh cho nó và cấu hình 1 số thứ rồi mới `ssh` vào làm việc được.

Còn bây giờ thì với Resin + với built-in wifi của model 3 B , mọi việc đơn giản và nhanh chóng hơn khá nhiều. Mà resin OS có sẵn docker, [git](/2017-09-28/do-not-host-your-git-folder.html), ... mọi thứ thiết yếu khác chứ không phải `apt-get update` rồi cài đặt gì tùm lum như trên Raspbian.

Resin đã đơn giản hóa workflow của chúng ta như thế nào?
Nhưng trước hết chúng ta hãy xem Resin là gì?

## Resin là...

...một cloud quản lý các thiết bị tương tự như RPI. Danh sách các board đã hỗ trợ các bạn quá dễ dàng tìm thấy ở trang chủ của họ nên mình không đem vào đây chi cho dài bài viết. Nhưng quản lý RPI của mình bằng cách nào? Có phải là install package gì đó của họ, rồi login này nọ kia không?

Câu trả lời gần đúng. Chính xác là Resin.io quản lý RPI của chúng ta qua một OS được cung cấp bởi Resin, chúng ta chỉ việc burn file image của OS này vào thẻ nhớ, ghim điện RPI (à tất nhiên phải cắm thẻ nhớ vào RPI trước) là trên cloud Resin sẽ xuất hiện thiết bị của mình.

Nhưng nếu mình không muốn xài cloud mà chỉ xài local thôi thì sao? OK, không sao, đã có local mode. Thời điểm viết bài này local mode đang ở beta nên chưa có gì đặc sắc lắm, nhưng mình đi sơ qua cho mọi người cùng rõ.

## Sử dụng Resin ở Local mode

Khi sử dụng resin ở local, chúng ta cũng flash OS resin vào thẻ (trong OS đó có sẵn những thứ để có thể build docker nhanh chóng mà không cần ssh)

### Dùng Resin CLI để chuẩn bị image cho RPi

*Bài này đuợc viết dựa trên [doc](https://resinos.io/docs/raspberrypi3/gettingstarted/) có sẵn của Resin OS, trừ 1 cái khác là sử dụng [docker image resin CLI](https://hub.docker.com/r/voldedore/resin-cli/) thay vì phải cài từ `npm`*

Nói sơ về Resin CLI: Công cụ dòng lệnh hỗ trợ thiết lập các cài đặt ban đầu, flash image và push Dockerfile qua RPi trong mạng nội bộ và còn hơn thế nữa.

**Bước 1:** Đầu tiên, tải về file Image của Resin OS từ trang chủ của [Resin](https://resinos.io). Nhớ chọn đúng phiên bản của board sẽ cài. Giải nén và bỏ vào 1 chỗ. VD: `~/img/resin.img`

**Bước 2:** Sau đó `pull` image docker về

```
$ docker pull voldedore/resin-cli

Using default tag: latest
latest: Pulling from voldedore/resin-cli
49388a8c9c86: Pull complete
ef4153b1e785: Pull complete
c1789382641e: Pull complete
419f0e1449d9: Pull complete
bbc3fc315608: Pull complete
Digest: sha256:46f1de717d3608b2b9779e3ad2857ddef198ebbf8b531edc9416f569f39f48b9
Status: Downloaded newer image for voldedore/resin-cli:latest
```

**Bước 3:** Run container từ image vừa pull, với volume mount từ `~/img` của máy host và /opt/img của container bằng lệnh:

```
$ docker run -it -v ~/img:/opt/img voldedore/resin-cli
```

**Bước 4:** Trong container, cd tới /opt/img và sử dụng lệnh sau để thiết lập Wifi và hostname, đồng thời ghi những thiết lập vào file

```
$ resin local configure resin.img
? Network SSID tên_wifi
? Network Key mật_mã_wifi
? Do you want to set advanced settings? Yes
? Device Hostname resin
? Do you want to enable persistent logging? no
Done!
```

**Bước 5:** Sau đó dùng Etcher để burn resin.img vào 1 cái microSD. Đối với thẻ class 10 thì thời gian burn tầm 3 phút và tốn thêm 3 phút để validate cái thẻ.

Đối với ai có sẵn node 6 và khôgn muốn xài docker image trên thì có thể cài Resin CLI bằng lệnh `npm install --global --production resin-cli` và skip bước 2-3, thực hiện từ bước 4. Do máy mình không có sẵn Node, mà mình cũng không muốn cài thêm quá nhiều thứ cũng như muốn tận dụng thế mạnh của docker nên mình build cái image ra, ai chưa tin tưởng thì có thể xem source cho biết :D

Sau khi Etcher burn xong image vào thẻ. Rút ra ghim vào board, cắm điện lên, chờ đền xanh nhấp nháy vài cái và ping thử

```
$ ping resin.local
PING 192.168.1.111 (192.168.1.111): 56 data bytes
64 bytes from 192.168.1.111: icmp_seq=0 ttl=64 time=103.674 ms
64 bytes from 192.168.1.111: icmp_seq=1 ttl=64 time=9.723 ms
^C
--- 192.168.1.111 ping statistics ---
6 packets transmitted, 6 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 7.378/24.032/103.674/35.626 ms
```

Good. Mọi thứ tự động hết chứ k phải như xưa là phải sắm thêm cái màn hình để cài IP tĩnh cho nó. Thử ssh vào xem sao.

```
$ ssh root@resin.local -p22222
root@resin:~# uname -a
Linux resin 4.1.21 #1 SMP Fri Oct 7 23:37:01 CEST 2016 armv7l GNU/Linux
```

*Nếu mình đổi mạng wifi mà không muốn phải burn OS lại thì thế nào?*

Đơn giản lắm, chỉ việc cắm thẻ nhớ vào host machine, truy cập vào `resin-boot`, file config.json chứa 1 số thứ liên quan tới hostname, uid@resin.io, app_id,... ngoài ra ở thư mục connection/wifi sẽ chưa credentials cho việc này.

### Dùng Resin CLI để build docker images & chạy container trên RPi

Sau khi đã tạo 1 image cho RPi từ 1 base image bằng CLI của resin và burn nó vào thẻ nhớ bằng Etcher (powered by Resio too), resin tiếp tục dẫn bước cho chúng ta đi vào giai đoạn tiếp theo. Sử dụng Resin OS với docker.

*Lưu ý:* Do RPi có kiến trúc là ARM nên một số (nếu không muốn nói là đa số) image trên docker hub sẽ không chạy đuợc, do phải đúng kiến trúc ARM thì mới chạy.

Trước đây để sử dụng docker trên RPi thì chúng ta thường scp mọi thứ vào RPi, SSH, và chạy mấy lệnh build docker... Bây giờ mọi thứ có hơi khác chút xíu với **Resin CLI** là chúng ta có thể làm mọi thứ trên máy host chứ không cần SSH trục tiếp vào RPi như xưa nữa.

Trên máy host tạo 1 thư mục và tạo file Dockerfile trong thư mục đó.

```
$ mkdir ~/Projects/rpi-hw && touch ~/Projects/rpi-hw/Dockerfile
```

Sau đó nếu máy bạn chưa cài Resin CLI và muốn xài Resin CLI thông qua 1 docker container thì chạy thêm lệnh sau để lấy shell của container resin-cli ra và cd vào /opt/docker để sử dụng CLI như bình thường.

```
$ docker run -it --network=host -v ~/Projects/rpi-hw:/opt/docker voldedore/resin-cli
```

Thay đổi nội dung của Dockerfile, ví dụ:

```
FROM resin/raspberrypi3-alpine-node:slim
CMD [“cat”, “/etc/os-release”]
```

Dockerfile trên sẽ lấy image alpine-node dành cho RPi (khác node:alpine), chạy câu lệnh `cat /etc/os-release`. Sau khi có Dockerfile ưng ý rồi, chạy lệnh sau

```
$ resin local push resin.local --source .
```

hoặc

```
$ resin local push resin.local -s .
```

Lệnh trên resin sẽ hiểu việc push của ta là ở nội bộ, push về máy RPi có tên `resin.local`, source lấy Dockerfile nằm tại thư mục hiện tại.

```
$ sudo resin local push resin.local --source .
* Building..
- Stopping and Removing any previous 'myapp' container
- Removing any existing container images for 'myapp'
- Building new 'myapp' image
Step 1 : FROM resin/raspberrypi3-alpine-node:slim
Pulling from resin/raspberrypi3-alpine-node
Pulling fs layer
Verifying Checksum=============================================>]     32 B/32 B7 MB
Download complete
Verifying Checksum=============================================>] 1.987 MB/1.987 MB
Pull complete=================================================>]    12 MB/12 MB
Pull complete
Digest: sha256:410a5add3aa281d97afea1ae4fcdbec203c69ea34faea8d84349456c211f33a3
Status: Downloaded newer image for resin/raspberrypi3-alpine-node:slim
 ---> bf37b6350e63
Step 2 : CMD [“cat”, “/etc/os-release”]
 ---> Running in a376f4a781d5
 ---> a3c2c42b1212
Removing intermediate container a376f4a781d5
Successfully built a3c2c42b1212
- Creating 'myapp' container
- Starting 'myapp' container

resin push completed successfully!
```

Như anh em cũng thấy là mình không cần phải SSH vào RPi để chạy lệnh `docker build -t abc .` gì cả, resin push mọi thứ về board RPi của mình và sau đó tự build theo Dockerfile đã chỉ định.

Hết tập 1

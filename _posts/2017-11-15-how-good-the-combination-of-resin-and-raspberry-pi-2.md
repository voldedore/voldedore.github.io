---
layout: post
title: "Sự phối hợp nhịp nhàng của Resin và Raspberry Pi (2)"
author: "Vinh VO"
published: false
---

Ở phần 1 chúng ta đã hiểu workflow mà Resin cugn cấp cho chúng ta tiện lợi như thế nào. Mình xin tóm gọn lại như sau:

1. Đầu tiên tải resin.img về (local use)
2. Dùng Resin CLI (cài bằng node hoặc xài thông qua [docker image](https://hub.docker.com/r/voldedore/resin-cli/)) để configure các cấu hình wifi, hostname cho resin.img
3. Dùng Etcher để burn resin.img vào microSD
4. Cắm microSD và cắm điện cho RPI
5. Ping hostname.local & SSH tới RPI
6. Tạo Dockerfile
7. Dùng Resin CLI để push Dockerfile qua RPI local. ResinOS trên máy RPI sẽ tự nhận Dockerfile và build/run container.

## Như vậy Resin cloud có gì khác?

Resin cloud hỗ trợ quản lý theo dõi các thiết bị đang hoạt động, là một registry cho docker (lưu giữ các image được build từ thiết bị có quản lý bởi resin), ngoài ra còn có terminal, reload app, shutdown, cug cấp live URL thẳng tới container đang chạy.

## Cách sử dụng RPI với Resin.io

1. Để sử dụng, đầu tiên ta bỏ 5 phút ra để đăng ký tài khỏan ở trang resin.io. Cũng add ssh key đầy đủ để xài git repo của resin. Sau đó tạo một Application mới. Ở đây mình đặt tên home.

   ![Cách đúc các số cho mặt đồng hồ]({{ '/assets/images/resin/resin_io_create_app.png' | relative_url }})

2. Sau khi tạo application xong, tải về ResinOS và tiến hành flash vào microSD (bằng Etcher). Nếu các bạn đã có OS rồi thì có thể chỉ tải về file config thôi sau đó replace file config.json ở phân vùng resin-boot (cắm vào máy host)

   ![Cách đúc các số cho mặt đồng hồ]({{ '/assets/images/resin/download-resin-os.png' | relative_url }})

3. Sau khi flash microSD xong, cắm vào RPI và ghim điện. Chờ đèn xanh chớp khoảng vài lần thì trên dashboard của resin.io sẽ xuất hiện thiết bị của chúng ta.

   ![Cách đúc các số cho mặt đồng hồ]({{ '/assets/images/resin/dashboard-resin-io.png' | relative_url }})

   Nếu bạn ghim RPI vào màn hình thông qua cổng HDMI, các bạn sẽ thấy một thông báo

   > Booted! Check your dashboard

   là ok. Nếu không thấy thông báo này nghĩa là OS bị lỗi, phải burn lại.

   Nếu không có màn hình, thì thông qua đèn LED ta có thể biết được lỗi gặp phải.

   Nếu LED chớp 4 lần, nghỉ 1 vài nhịp, rồi 4 lần... nghĩa là Booted ok, nhưng không kết nối tới resin.io được (do network bị block, do firewall, do wifi sai password...). Lưu ý là Resin sử dụng cổng 123, 53 UDP và 443 TCP để hoạt động. Nếu bạn có firewall thì nên open các port trên ra nhé. (Trường hợp của mình không phải mở cổng, chỉ ghim và nhận)

## Build dockerfile bằng resin.io

Tóm tắt workflow: Trên mỗi application, chúng ta được cấp một repo để push dockerfile lên. Mỗi khi resin nhận dockerfile sẽ tiến hành build dockerfile, nếu build failed, push không được chấp nhận, ta phải chỉnh sửa dockerfile, push lại. Nếu build ok,
resin.io sẽ tiến hành push image lên registry, tạo container và tự run container này mỗi khi boot RPI.

Các bước để thực hiện:

1. Trên host machine, tạo Dockerfile với nội dung mà bạn muốn build image.

   ```
   $ mkdir ~/Projects/rpi-docker
   $ cd !$
   $ touch Dockerfile
   $ git init
   $ git add Dockerfile
   $ git commit -m "Commit message"
   $ git remote add resin username@git.resin.io:username/app_name.git
   $ git push resin master
   ```

2. Nếu dockerfile của bạn được build thành công, bạn sẽ thấy một con kỳ mã và các thông tin về image mới được build.


    ![Cách đúc các số cho mặt đồng hồ]({{ '/assets/images/resin/success_unicorn_simple_nodejs.png' | relative_url }})

3. Trên dashboard sẽ hiện uploading image... download image... Các bạn có thể check logs để biết thêm thông tin.

   ![Cách đúc các số cho mặt đồng hồ]({{ '/assets/images/resin/dashboard-device-summary.png' | relative_url }})

**Lưu ý**

1. Khi ssh root@resin.local -p22222, chúng ta sẽ ssh tới máy RPI. Nhưng trên dashboard, khi mở terminal, chúng ta sẽ ở shell của container được chạy bên trong RPI (run từ image docker đã build bên trên)
2. Để container nhận được net, expose được ports,... cần set variable INITSYSTEM on như sau

   ![initsystem]({{ '/assets/images/resin/environment-variables-settings.png' | relative_url }})

---
layout: post
title: "Ngắn gọn về Early Userspace trong Arch Linux"
author: "Vinh VO"
meta_keywords: "linux, early userspace, arch linux, summary"
meta_description: ""
published: false
---

## Khởi động một hệ thống chạy Linux

Hồi xưa, khởi động một hệ thống chạy linux đơn giản như sau: Đầu tiên, sau khi nhấn nút nguồn, Bootloader sẽ load kernel. Kernel sau đó sẽ được giải nén (extracted) và init phần cứng. Kernel tiếp theo init cụm hard disk controller, tìm thấy dĩa cứng, thấy phân vùng root, mount nó và chạy `/sbin/init`.

Hiện nay, do có quá xá controllers (vì sự phát triển quá nhanh của công nghệ), các distro luôn cố tỏ ra thân thiện và support hết chúng nó, vì chúng ta thân thiện mà :D. Nên các dev đã làm hết công sức, làm ngày làm đêm để tiền được nhiều thêm (`-- Đen`), và để build một cục kernel nặng vài MB và hỗ trợ tận răng (thậm chí có thể là tới cái bồn rửa chén cũng được hỗ trợ). À phần ngày đêm là mình nói hơi quá lên thôi chứ không phải nhé.

NHƯNG, hãy thử tưởng tượng một người dùng random nào đó, có 2 SATA controllers, 3 IDE controllers, 7 cái dĩa cứng, 3 cái USB drives và mây mây. Lúc này kernel sẽ detect những thứ trên **1 cách bất đồng bộ** -- và đâu là cái root FS? Nó ở cái đĩa thứ nhất, hay 2, hay 4? Mà cái đĩa nào là thứ nhất cái đã?

Rồi nếu tôi muốn mount root fs nằm trên cái VG LVM bên trong 1 cái container được mã hóa, lại nằm trong 1 cái array chạy RAID thì sao?

Cuộc đời màu hồng giờ đã chuyển sang thâm, và việc làm vừa lòng tất cả mọi người thực tế là rất khó (và rất ngu). Kernel nó rất khôn rằng nó sẽ giả bộ ngu -- hay đơn giản hơn là nó không quan tâm về các nhu cầu của bạn, đặc biệt là giờ nó bắt đầu mập mạp (vì nó phải ăn hết mấy cái driver trên thế giới này).

Giải pháp cho vấn đề này là chuyển hết những thứ đó vào userspace, handling hardware detection, cài mọi thứ rắc rối mà người dùng muốn, mount root fs và chạy luôn cái /sbin/init. "Ồ, làm sao chạy được mấy ứng dụng userspace khi mà root fs chưa được mount?".

Trả lời: "It's magic!"

## initramfs là gì?

Ok, thực ra câu trả lời không phải là magic. Mà là `initramfs` aka `Initial ramdisk` aka `initrd`. Hai tên gọi `initrd` hay `initramfs` chủ yếu để phân biệt 2 cách tạo ra chúng, tuy chúng có cùng một mục đích.

File image của init root file system này, cùng với kernel phải được lưu đâu đó mà `bootloader` có thể truy cập được. Tiêu biểu là ở `/boot`. Ví dụ:

Fedora

```
# tree /boot
/boot
├── initramfs-5.3.11-200.fc30.x86_64.img
├── initramfs-5.4.12-100.fc30.x86_64.img
├── initramfs-5.5.8-100.fc30.x86_64.img
├── vmlinuz-5.3.11-200.fc30.x86_64
├── vmlinuz-5.4.12-100.fc30.x86_64
└── vmlinuz-5.5.8-100.fc30.x86_64
```

Arch

```
‣ ll /boot
total 61M
drwxr-xr-x 5 root root 4.0K Jan  1  1970 .
drwxr-xr-x 1 root root  152 Mar 13 14:50 ..
-rwxr-xr-x 1 root root  38M Jan  7 15:12 initramfs-linux-fallback.img
-rwxr-xr-x 1 root root  18M Jan  7 15:12 initramfs-linux.img
-rwxr-xr-x 1 root root 6.1M Jan  7 15:12 vmlinuz-linux
```

Như đã đề cập cách đây 6 phút trước, một khi boot lên, bootloader sẽ load kernel. Với sự hiện diện của initramfs/initrd, bootloader sẽ mount chúng vào bộ nhớ. Rồi start kernel. Có thể bạn sẽ không thấy initramfs được mount vào đâu bởi vì về sau nó bị mount chồng lên bằng root file system khác rồi.

**Đối với initrd scheme,** sau khi mount được initrd rồi, kernel sẽ thực thi `/linuxrc`. Khi process này kết thúc, kernel xem như `/` đã được mount rồi và thực thi tiếp `/sbin/init` để bắt đầu tiến trình boot userspace bình thường.

**Còn đối với initramfs scheme,** (available since the Linux kernel 2.6.13) kernel có một thứ gọi là `cpio` được nén lại và chèn vào ramfs, để rồi nó được giải nén vào `rootfs` sau khi khởi động. Xịn hơn là có thể nén cpio và nhét thẳng vào kernel để nó extract ra lúc boot luôn.

Trước khi kernel chạy mấy cái `init code` đã lỗi thời, nó sẽ check xem trong cái `rootfs` có chứa file nào tên là `/init` không. Nếu có thì nó sẽ bỏ qua cái phương thức truyền thống (mount/init code) mà chạy luôn cái `/init` đó. Phần `/init` này sẽ đảm nhận mọi thứ mà kernel nó nghĩ là rắc rối.

Bằng cách này, chúng ta có thể build một cái kernel không cần support hết các thể loại controller ổ cứng hay fs gì cả, thay vì vậy nó nằm trong các module của cái `initramfs`. (Hiện tại Arch Linux default kernel đang làm như vậy).

## Cách tạo ra initramfs

Trong arch có một tool gọi là `mkinitcpio`. Man page:

> The initial ramdisk is in essence a very small environment (early userspace) which loads various kernel modules and sets up necessary things before handing over control to init. This makes it possible to have, for example, encrypted root file systems and root file systems on a software RAID array. mkinitcpio allows for easy extension with custom hooks, has autodetection at runtime, and many other features.

Khi hệ thống update các package có liên quan tới module kernel, lệnh này sẽ được trigger để compile lại initramfs. Fedora có thể sẽ chạy thêm grub-install để cập nhật lại phiên bản kernel cũ để rollback khi cần thiết. Arch thì nó override lên kernel hiện tại.

Bài này dịch từ [bài này](https://web.archive.org/web/20150430223035/http://archlinux.me/brain0/2010/02/13/early-userspace-in-arch-linux/).

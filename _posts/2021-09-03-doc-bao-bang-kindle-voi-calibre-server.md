---
layout: post
title: "Tự động gửi báo hằng ngày vào Kindle với calibre server"
author: "Vinh VO"
meta_keywords: "news, guardian, le monde, kindle, calibre, server, calibre server, automatically, periodically, voyage, báo, tin tức, tự động gửi, cập nhật"
meta_description: ""
comments: true
disqus_id: CALIBRE_SERVER_VI
published: false
---

/**: The english version of this article will be available in the next few days. Or at least I hoped so.

_Cũng lâu rồi tôi không viết gì. Hơi lạ vì đại dịch khiến con người ta ở nhà, có nhiều thời gian hơn, nhưng tôi thì lại không như vậy, công việc túi bụi. Tôi không thích việc đó lắm, cái việc mà tôi không có thời gian để viết được gì này, làm tôi mất đi văn phong hài hước kỳ quặc của mình._

Có lẽ tôi không cần giới thiệu nhiều về Kindle, hay calibre, hay python nữa. Mấy thứ đó quá dễ tìm thấy trên mạng. Tôi dùng Kindle được vài ba tháng thì mắt tôi trở nên bớt đau hơn vào mỗi tối. Nên tôi nảy sinh ý định dùng nó để đọc báo vào buổi sáng, như thường lệ, sau khi thức dậy, thay cho iPad. Mặc dù ý tưởng này có lẽ chả đi tới đâu, ngắn ngủi như vòng đời của nhiều sản phẩm khác xuất hiện trong đầu tôi và chết đi cũng trong ấy.

Tôi cũng không theo trào lưu Paperless. Dù cho tôi đang thực hiện (hầu như) toàn bộ ghi chú của mình trên máy tính bảng thay cho sổ tay giấy hồi xưa. Dù cho tôi đọc ebook 99% thay cho sách giấy (no more war please). Thực ra lý do tôi đọc ebook thay cho sách giấy là vì tôi đang sống cuộc sống du mục. Hôm nay tôi chưa biết mai tôi sẽ ở đâu. Nên vác theo 7749 cuốn sách giấy đối với tôi là điều không thể và vô ích. Tôi sẵn sàng mua sách có bản quyền, nhưng tiếc rằng thị trường sách điện tử ở Việt Nam chưa đủ to để hấp dẫn các nhà đầu tư, mà phần lớn họ xem trọng những tờ giấy bạc hơn những trang sách. Tôi đọc báo trên mạng chỉ vì nó nhanh hơn là đọc báo giấy. Đôi khi cần giấy gói đồ thì tôi cũng mua báo giấy như thường thôi.

Đối với một số người, máy đọc sách là một cứu cánh vì 1) họ có quá nhiều sách và họ ưa di chuyển; 2) họ có vấn đề về mắt nên buộc phải dùng máy đọc sách thay cho các thiết bị dùng đèn nền LCD khác; 3) họ bị nghiện. Những người nghiện sẽ tìm cách làm mọi thứ trên những thiết bị của họ. Tôi viết bài này để giúp cho cả 3 loại người kể trên, vì tôi thuộc kiểu 1 và 2. Thường thì những người nghiện rất khó đồng ý về tình trạng nghiện ngập của bản thân họ.

Vì vậy, nhu cầu đọc báo trên Kindle là có thật. Thực tế có rất nhiều tạp chí được bán theo dạng tuần san hoặc nguyệt san trên Amazon như National Geographic, The Economist, New Scientist... Tiếc là những dịch vụ này còn quá xa xỉ với người dùng Việt Nam. Nhưng người Việt họ luôn có những giải pháp rất hay, vì họ là một dân tộc thông minh, kiên cường, hoặc vì họ đã quen sống trong tình cảnh bất lợi cũng khá lâu rồi.

Trở về với `calibre`. Bất cứ ai dùng máy đọc sách cũng có thể đã nghe và từng dùng qua phần mềm này. Trữ sách, gửi sách vào máy, chỉnh sửa sách, thêm bìa, thêm wordwise cho các máy hệ Amazon (hay còn gọi là người chơi hệ ngồi gốc cây), v.v... Có một thứ mà ít ai dùng tới đó là tính năng Fetch news, tính năng để gởi tin tức vào máy thông qua server của Amazon.

[Insert hình here]

Tính năng này nó thực hiện các chuyện sau:

1. Dùng các recipe để fetch những trang tin có RSS feed, xào nấu lại thành file mobi chứa tin tức theo đúng mẫu và chuẩn của Amazon (để hiển thị được trên thiết bị của người dùng hệ ngồi gốc cây).
2. Từ các file mobi này, dùng config SMTP để gởi từ mailbox được phép gởi sách vào Kindle Cloud (from).
3. Gởi vào email được thiết lập sẵn (email nhận sách ở Kindle Cloud hoặc email được cung cấp tương ứng với từng thiết bị) (to).
4. Lặp lại các bước trên theo một lịch trình được thiết lập sẵn.

Thử gởi báo Le Monde vào. Nói chung là mọi thứ diễn ra đúng như cách nó được lập trình.

[Chèn hình ở đây]

Nhưng điểm yếu của calibre ở đây là: để nhận được tin tức mỗi ngày, ví dụ vào buổi sáng 6 giờ thì chúng ta phải thức dậy trước đó và mở calibre lên để nó thực hiện việc gởi tin tức. Hoặc phải treo máy tính suốt, để vào đúng thời điểm được thiết lập, nó có thể gởi mail một cách tự động được. Nhưng đâu phải ai cũng có máy tính để treo suốt ngày, hoặc đâu phải máy tính nào treo suốt ngày cũng chạy được calibre. Hoặc là có.

Sau đó tôi nghĩ chắc phải có 1 cái calibre headless, hoặc cái gì đó tương tự. Mà đúng là đã có người từng nghĩ như tôi, cách đây 10 năm. Repo này cung cấp chính xác những gì tôi cần. https://github.com/chris838/calibre-kindle-server

Nửa tiếng đồng hồ thử một vài lần gởi, cuối cùng tôi cũng đã gởi được thành công một tờ báo Le Monde vào con Kindle Voyage chỉ với 1 dòng lệnh.

```bash
$ python2 process-recipe.py lemonde
Sending lemonde.mobi over email
```

Những việc còn lại chỉ là tweak lại cái tool này cho mượt hơn chút xíu thôi. Tác giả có lẽ đã không còn maintain nó nữa rồi. Hy vọng ông không có cùng một ý tưởng như tôi, hoặc nếu có cũng hy vọng ông không gặp cùng vấn đề để ý tưởng đó chết đi một cách sớm hơn ông tưởng.

Bản fork mới của tool này có thể được tìm thấy tại đây: https://github.com/voldedore/calibre-kindle-server

Tiền Giang, 03/09/2021

Một buổi sáng bị cho leo cây.

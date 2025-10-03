import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Ứng dụng có miễn phí không?",
    answer: "Phiên bản hiện tại cho phép bạn sử dụng miễn phí với đầy đủ tính năng cốt lõi: tạo nhóm, thêm chi tiêu, tự động tổng hợp và gợi ý thanh toán. Chúng tôi đang phát triển các gói nâng cao (xuất file, phân quyền chi tiết, tích hợp kế toán) nhưng không ảnh hưởng đến trải nghiệm miễn phí.",
  },
  {
    question: "Dữ liệu của tôi có an toàn không?",
    answer: "Chúng tôi sử dụng hạ tầng bảo mật hiện đại: xác thực an toàn, phân quyền theo nhóm, sao lưu định kỳ. Tất cả giao tiếp đều qua HTTPS và các thao tác nhạy cảm được ghi nhận lịch sử.",
  },
  {
    question: "Tôi có thể xuất báo cáo không?",
    answer: "Bạn có thể xem tổng kết theo thành viên, theo thời gian và theo hạng mục. Chúng tôi đang bổ sung xuất CSV/PDF để gửi nhanh cho các thành viên, cũng như chia sẻ link tổng hợp chỉ xem.",
  },
  {
    question: "Làm sao để mời thành viên mới vào nhóm?",
    answer: "Trong trang nhóm, chọn 'Mời thành viên' và gửi link mời qua bất kỳ ứng dụng nhắn tin nào. Người nhận chỉ cần đăng nhập để tham gia. Bạn có thể đặt quyền chỉ xem hoặc cho phép thêm/sửa chi tiêu.",
  },
  {
    question: "App tính toán nợ như thế nào?",
    answer: "Hệ thống tự động phân bổ chi tiêu theo tỷ lệ bạn chọn (đều, theo phần trăm, theo trọng số). Sau đó áp dụng thuật toán tối ưu hoá để giảm số lần thanh toán giữa các thành viên, giúp việc quyết toán nhanh và rõ ràng.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-16 px-4"> {/* Reduced padding */}
      <div className="container mx-auto max-w-3xl">
        <div className="text-center space-y-3 mb-10"> {/* Reduced space-y and margin */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground"> {/* Reduced font size */}
            Câu hỏi thường gặp
          </h2>
          <p className="text-base text-muted-foreground"> {/* Reduced font size */}
            Giải đáp chi tiết những thắc mắc phổ biến khi sử dụng ứng dụng
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3"> {/* Reduced space-y */}
          {faqs.map((faq, index) => (
            // Reduced padding
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-border rounded-lg px-5 bg-card" 
            >
              <AccordionTrigger className="text-left font-semibold text-base hover:no-underline"> {/* Reduced font size */}
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground"> {/* Reduced font size */}
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
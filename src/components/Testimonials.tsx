import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    content: "Cái này hay, như em kinh nghiệm đi chơi nhóm thì trước khi đi nộp vào quỹ, sau đó mọi chi tiêu do người cầm quỹ chi thôi đỡ lằng nhằng.",
    author: "Nguyễn Vũ Linh",
  },
  {
    content: "Được đấy bác. Nhóm e có ng ăn chay có ng ăn mặn có đứa vào no rồi chỉ uống nên mỗi lần chia hơi cực",
    author: "Duong Chau",
  },
  {
    content: "App khá tiện trong những lần đi chơi xa với bạn bè ấy, ai trả gì ghi vô cuối trip tổng kết.",
    author: "Quân Trần",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-xl md:text-3xl font-bold text-foreground"> {/* Adjusted font size */}
            Người dùng nói gì?
          </h2>
          <p className="text-sm md:text-base text-muted-foreground"> {/* Adjusted font size */}
            Những phản hồi tích cực từ cộng đồng sử dụng hằng ngày
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-all duration-300">
              <CardContent className="p-5 space-y-3">
                <Quote className="w-7 h-7 text-primary/40" />
                <p className="text-sm italic text-foreground"> {/* Adjusted font size */}
                  "{testimonial.content}"
                </p>
                <p className="text-xs font-semibold text-muted-foreground">
                  — {testimonial.author}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
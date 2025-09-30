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
    <section id="testimonials" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Người dùng nói gì?
          </h2>
          <p className="text-lg text-muted-foreground">
            Những phản hồi tích cực từ cộng đồng sử dụng hằng ngày
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <Quote className="w-8 h-8 text-primary/40" />
                <p className="text-foreground italic">
                  "{testimonial.content}"
                </p>
                <p className="text-sm font-semibold text-muted-foreground">
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

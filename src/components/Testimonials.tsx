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
    <section id="testimonials" className="py-16 px-4"> {/* Reduced padding */}
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-3 mb-10"> {/* Reduced space-y and margin */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground"> {/* Reduced font size */}
            Người dùng nói gì?
          </h2>
          <p className="text-base text-muted-foreground"> {/* Reduced font size */}
            Những phản hồi tích cực từ cộng đồng sử dụng hằng ngày
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5"> {/* Reduced gap */}
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-all duration-300">
              <CardContent className="p-5 space-y-3"> {/* Reduced padding and space-y */}
                <Quote className="w-7 h-7 text-primary/40" /> {/* Smaller icon */}
                <p className="text-sm text-foreground italic"> {/* Reduced font size */}
                  "{testimonial.content}"
                </p>
                <p className="text-xs font-semibold text-muted-foreground"> {/* Reduced font size */}
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
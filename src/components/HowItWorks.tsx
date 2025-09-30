import { UserPlus, Users, Receipt } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: UserPlus,
    title: "Tạo nhóm",
    description: "Tạo nhóm mới cho chuyến đi, dự án hoặc chi tiêu chung.",
  },
  {
    number: "2",
    icon: Users,
    title: "Mời thành viên",
    description: "Mời bạn bè, đồng nghiệp hoặc người thân tham gia.",
  },
  {
    number: "3",
    icon: Receipt,
    title: "Thêm chi tiêu",
    description: "Ghi lại chi phí và để hệ thống tự tính toán thông minh.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Cách hoạt động
          </h2>
          <p className="text-lg text-muted-foreground">
            Chỉ 3 bước đơn giản để bắt đầu sử dụng ứng dụng
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection lines for desktop */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
          
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md">
                    {step.number}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

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
    <section id="how-it-works" className="py-16 px-4 bg-gradient-to-b from-background to-secondary/10"> {/* Reduced padding */}
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-3 mb-12"> {/* Reduced space-y and margin */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground"> {/* Reduced font size */}
            Cách hoạt động
          </h2>
          <p className="text-base text-muted-foreground"> {/* Reduced font size */}
            Chỉ 3 bước đơn giản để bắt đầu sử dụng ứng dụng
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative"> {/* Reduced gap */}
          {/* Connection lines for desktop */}
          <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" /> {/* Adjusted top */}
          
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center space-y-3"> {/* Reduced space-y */}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md"> {/* Smaller icon container */}
                    <step.icon className="w-8 h-8 text-white" /> {/* Smaller icon */}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-sm"> {/* Smaller number badge */}
                    {step.number}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground"> {/* Reduced font size */}
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground"> {/* Reduced font size */}
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
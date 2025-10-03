const stats = [
  {
    value: "541+",
    label: "Người dùng",
  },
  {
    value: "650+",
    label: "Nhóm hoạt động",
  },
  {
    value: "1.3 tỷ+",
    label: "Tổng tiền chi tiêu",
  },
  {
    value: "5.0",
    label: "Đánh giá",
  },
];

const Stats = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-secondary/10 to-background"> {/* Reduced padding */}
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-3 mb-10"> {/* Reduced space-y and margin */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground"> {/* Reduced font size */}
            Thành tựu của chúng tôi
          </h2>
          <p className="text-base text-muted-foreground"> {/* Reduced font size */}
            Những con số ấn tượng từ cộng đồng người dùng Share Bill
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6"> {/* Reduced gap */}
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-1"> {/* Reduced space-y */}
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> {/* Reduced font size */}
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground font-medium"> {/* Reduced font size */}
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
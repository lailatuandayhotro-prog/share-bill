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
    <section className="py-20 px-4 bg-gradient-to-b from-secondary/10 to-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Thành tựu của chúng tôi
          </h2>
          <p className="text-lg text-muted-foreground">
            Những con số ấn tượng từ cộng đồng người dùng ChiTi
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-muted-foreground font-medium">
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

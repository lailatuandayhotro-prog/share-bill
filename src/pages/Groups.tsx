import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, UserPlus, Plus, Search, Users, Clock, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Group {
  id: string;
  name: string;
  creator: string;
  memberCount: number;
  createdAt: string;
  isOwner: boolean;
}

const Groups = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  // Mock data
  const [groups, setGroups] = useState<Group[]>([
    {
      id: "test-group",
      name: "Test",
      creator: "tuan hoang",
      memberCount: 1,
      createdAt: "29/9/2025",
      isOwner: true,
    },
  ]);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast.error("Vui lòng nhập tên nhóm");
      return;
    }
    
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name: newGroupName,
      creator: "tuan hoang",
      memberCount: 1,
      createdAt: new Date().toLocaleDateString("vi-VN"),
      isOwner: true,
    };
    
    setGroups([...groups, newGroup]);
    setOpenCreateDialog(false);
    setNewGroupName("");
    toast.success("Tạo nhóm thành công!");
    navigate(`/groups/${newGroup.id}`);
  };

  const handleJoinGroup = () => {
    if (!joinCode.trim()) {
      toast.error("Vui lòng nhập mã nhóm");
      return;
    }
    
    toast.success("Tham gia nhóm thành công!");
    setOpenJoinDialog(false);
    setJoinCode("");
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Chi_
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Text */}
        <div className="mb-8">
          <p className="text-lg text-muted-foreground">
            Chia sẻ chi phí với bạn bè và gia đình một cách dễ dàng. Theo dõi chi phí chung
            và thanh toán chi với vài cú nhấp chuột.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <Dialog open={openJoinDialog} onOpenChange={setOpenJoinDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="h-16 text-base">
                <UserPlus className="w-5 h-5" />
                Tham gia nhóm
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tham gia nhóm</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="join-code">Mã nhóm hoặc link mời</Label>
                  <Input
                    id="join-code"
                    placeholder="Nhập mã nhóm..."
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                  />
                </div>
                <Button onClick={handleJoinGroup} className="w-full">
                  Tham gia
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-16 text-base">
                <Plus className="w-5 h-5" />
                Tạo nhóm
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo nhóm mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name">Tên nhóm</Label>
                  <Input
                    id="group-name"
                    placeholder="VD: Chuyến đi Đà Lạt"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateGroup} className="w-full">
                  Tạo nhóm
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Groups List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-6 h-6" />
              Nhóm của bạn ({filteredGroups.length})
            </h2>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nhóm, thành viên hoặc ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Groups */}
          <div className="space-y-4">
            {filteredGroups.map((group) => (
              <Card
                key={group.id}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-7 h-7 text-primary" />
                      </div>
                      
                      <div className="space-y-3 flex-1">
                        <h3 className="text-xl font-semibold text-foreground">
                          {group.name}
                        </h3>
                        
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>Với tên: {group.creator}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{group.memberCount} Thành viên</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Tạo: {group.createdAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {group.isOwner && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        <Crown className="w-4 h-4" />
                        TRƯỞNG NHÓM
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Groups;

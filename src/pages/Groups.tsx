import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, UserPlus, Plus, Search, Users, Clock, Crown, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LogoutButton } from "@/components/LogoutButton";
import UserProfileDialog from "@/components/UserProfileDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [openUserProfileDialog, setOpenUserProfileDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ full_name: string; avatar_url: string | null } | null>(null);

  useEffect(() => {
    fetchGroups();
    fetchUserProfileData();
  }, [user]);

  const fetchUserProfileData = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user profile data:", error);
    }
  };

  const fetchGroups = async () => {
    if (!user) return;
    
    try {
      const { data: groupMembers, error } = await supabase
        .from('group_members')
        .select(`
          group_id,
          groups (
            id,
            name,
            owner_id,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name');

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      const groupsWithMembers = await Promise.all(
        (groupMembers || []).map(async (gm: any) => {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', gm.groups.id);

          return {
            id: gm.groups.id,
            name: gm.groups.name,
            creator: profileMap.get(gm.groups.owner_id) || "Unknown",
            memberCount: count || 0,
            createdAt: new Date(gm.groups.created_at).toLocaleDateString("vi-VN"),
            isOwner: gm.groups.owner_id === user.id,
          };
        })
      );

      setGroups(groupsWithMembers);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error("Không thể tải danh sách nhóm");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("Vui lòng nhập tên nhóm");
      return;
    }

    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }
    
    try {
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: newGroupName,
          owner_id: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      setOpenCreateDialog(false);
      setNewGroupName("");
      toast.success("Tạo nhóm thành công!");
      navigate(`/groups/${group.id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error("Không thể tạo nhóm");
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) {
      toast.error("Vui lòng nhập mã nhóm");
      return;
    }

    if (!user) {
      toast.error("Vui lòng đăng nhập để tham gia nhóm");
      return;
    }

    try {
      // 1) Kiểm tra nếu đã là thành viên
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', joinCode)
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberCheckError) throw memberCheckError;

      if (existingMember) {
        toast.info("Bạn đã là thành viên của nhóm này rồi!");
        setOpenJoinDialog(false);
        setJoinCode("");
        navigate(`/groups/${joinCode}`);
        return;
      }

      // 2) Thử thêm thành viên trực tiếp (RLS đã cho phép)
      const { error: addMemberError } = await supabase
        .from('group_members')
        .insert({
          group_id: joinCode,
          user_id: user.id,
          role: 'member',
        });

      if (addMemberError) {
        // Nếu mã nhóm sai/không tồn tại (FK vi phạm)
        if (
          addMemberError.code === '23503' ||
          /foreign key|violates foreign key/i.test(addMemberError.message || '')
        ) {
          toast.error("Mã nhóm không hợp lệ hoặc nhóm không tồn tại");
          return;
        }
        // Nếu đã tồn tại (trường hợp có unique constraint)
        if (addMemberError.code === '23505') {
          toast.info("Bạn đã là thành viên của nhóm này rồi!");
        } else {
          throw addMemberError;
        }
      }

      setOpenJoinDialog(false);
      setJoinCode("");
      toast.success("Tham gia nhóm thành công!");
      navigate(`/groups/${joinCode}`);
    } catch (error: any) {
      console.error('Error joining group:', error.message || error);
      toast.error("Không thể tham gia nhóm: " + (error.message || 'Lỗi không xác định'));
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3"> {/* Reduced padding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"> {/* Smaller icon container */}
                <DollarSign className="w-5 h-5 text-primary" /> {/* Smaller icon */}
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> {/* Reduced font size */}
                Share Bill
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setOpenUserProfileDialog(true)} className="h-8 w-8"> {/* Smaller button */}
                <Avatar className="h-7 w-7"> {/* Smaller avatar */}
                  <AvatarImage src={userProfile?.avatar_url || ""} alt={userProfile?.full_name || "User"} />
                  <AvatarFallback>
                    <UserIcon className="h-4 w-4" /> {/* Smaller icon */}
                  </AvatarFallback>
                </Avatar>
              </Button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl"> {/* Reduced padding */}
        {/* Hero Text */}
        <div className="mb-6"> {/* Reduced margin */}
          <p className="text-base text-muted-foreground"> {/* Reduced font size */}
            Chia sẻ chi phí với bạn bè và gia đình một cách dễ dàng. Theo dõi chi phí chung
            và thanh toán chi với vài cú nhấp chuột.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-3 mb-10"> {/* Reduced gap and margin */}
          <Dialog open={openJoinDialog} onOpenChange={setOpenJoinDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" 
                // Reduced height
                className="h-12 text-base"
              >
                <UserPlus className="w-4 h-4 mr-2" /> {/* Smaller icon */}
                Tham gia nhóm
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm"> {/* Smaller max-width for dialog */}
              <DialogHeader>
                <DialogTitle className="text-xl">Tham gia nhóm</DialogTitle> {/* Reduced font size */}
              </DialogHeader>
              <div className="space-y-3 pt-3"> {/* Reduced space-y and padding */}
                <div className="space-y-1.5"> {/* Reduced space-y */}
                  <Label htmlFor="join-code" className="text-sm">Mã nhóm</Label>
                  <Input
                    id="join-code"
                    placeholder="Nhập mã nhóm..."
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    // Reduced height and font size
                    className="h-9 text-sm" 
                  />
                </div>
                <Button onClick={handleJoinGroup} 
                  // Reduced height and font size
                  className="w-full h-9 text-sm"
                >
                  Tham gia
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <DialogTrigger asChild>
              <Button size="lg" 
                // Reduced height
                className="h-12 text-base"
              >
                <Plus className="w-4 h-4 mr-2" /> {/* Smaller icon */}
                Tạo nhóm
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm"> {/* Smaller max-width for dialog */}
              <DialogHeader>
                <DialogTitle className="text-xl">Tạo nhóm mới</DialogTitle> {/* Reduced font size */}
              </DialogHeader>
              <div className="space-y-3 pt-3"> {/* Reduced space-y and padding */}
                <div className="space-y-1.5"> {/* Reduced space-y */}
                  <Label htmlFor="group-name" className="text-sm">Tên nhóm</Label>
                  {/* Reduced height and font size */}
                  <Input
                    id="group-name"
                    placeholder="VD: Chuyến đi Đà Lạt"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="h-9 text-sm" 
                  />
                </div>
                <Button onClick={handleCreateGroup} 
                  // Reduced height and font size
                  className="w-full h-9 text-sm"
                >
                  Tạo nhóm
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Groups List */}
        <div className="space-y-5"> {/* Reduced space-y */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2"> {/* Reduced font size */}
              <Users className="w-5 h-5" /> {/* Smaller icon */}
              Nhóm của bạn ({filteredGroups.length})
            </h2>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /> {/* Smaller icon */}
            <Input
              placeholder="Tìm kiếm nhóm, thành viên hoặc ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              // Reduced padding, height and font size
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Groups */}
          <div className="space-y-3"> {/* Reduced space-y */}
            {loading ? (
              <div className="text-center py-10"> {/* Reduced padding */}
                <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div> {/* Smaller loader */}
                <p className="text-sm text-muted-foreground">Đang tải...</p> {/* Reduced font size */}
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-10"> {/* Reduced padding */}
                <Users className="w-14 h-14 text-muted-foreground mx-auto mb-3" /> {/* Smaller icon */}
                <p className="text-lg font-semibold mb-1.5">Chưa có nhóm nào</p> {/* Reduced font size */}
                <p className="text-sm text-muted-foreground mb-5"> {/* Reduced font size */}
                  Tạo nhóm mới hoặc tham gia nhóm có sẵn để bắt đầu
                </p>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <Card
                  key={group.id}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <CardContent className="p-4"> {/* Reduced padding */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1"> {/* Reduced gap */}
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"> {/* Smaller icon container */}
                          <DollarSign className="w-6 h-6 text-primary" /> {/* Smaller icon */}
                        </div>
                        
                        <div className="space-y-2 flex-1"> {/* Reduced space-y */}
                          <h3 className="text-lg font-semibold text-foreground"> {/* Reduced font size */}
                            {group.name}
                          </h3>
                          
                          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground"> {/* Reduced gap and font size */}
                            <div className="flex items-center gap-1.5"> {/* Reduced gap */}
                              <Users className="w-3 h-3" /> {/* Smaller icon */}
                              <span>Với tên: {group.creator}</span>
                            </div>
                            <div className="flex items-center gap-1.5"> {/* Reduced gap */}
                              <Users className="w-3 h-3" /> {/* Smaller icon */}
                              <span>{group.memberCount} Thành viên</span>
                            </div>
                            <div className="flex items-center gap-1.5"> {/* Reduced gap */}
                              <Clock className="w-3 h-3" /> {/* Smaller icon */}
                              <span>Tạo: {group.createdAt}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {group.isOwner && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium"> {/* Smaller badge */}
                          <Crown className="w-3 h-3" /> {/* Smaller icon */}
                          TRƯỞNG NHÓM
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* User Profile Dialog */}
      <UserProfileDialog
        open={openUserProfileDialog}
        onOpenChange={setOpenUserProfileDialog}
        onProfileUpdated={fetchUserProfileData}
      />
    </div>
  );
};

export default Groups;
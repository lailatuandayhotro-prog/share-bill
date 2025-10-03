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
      // Check if group exists
      const { data: existingGroup, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('id', joinCode)
        .single();

      if (groupError || !existingGroup) {
        toast.error("Mã nhóm không hợp lệ hoặc nhóm không tồn tại");
        return;
      }

      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', joinCode)
        .eq('user_id', user.id)
        .single();

      if (memberCheckError && memberCheckError.code !== 'PGRST116') { // PGRST116 means no rows found
        throw memberCheckError;
      }

      if (existingMember) {
        toast.info("Bạn đã là thành viên của nhóm này rồi!");
        setOpenJoinDialog(false);
        setJoinCode("");
        navigate(`/groups/${joinCode}`);
        return;
      }

      // Add user to group_members
      const { error: addMemberError } = await supabase
        .from('group_members')
        .insert({
          group_id: joinCode,
          user_id: user.id,
          role: 'member', // Default role for new members
        });

      if (addMemberError) throw addMemberError;

      setOpenJoinDialog(false);
      setJoinCode("");
      toast.success("Tham gia nhóm thành công!");
      navigate(`/groups/${joinCode}`);
    } catch (error: any) {
      console.error('Error joining group:', error.message);
      toast.error("Không thể tham gia nhóm: " + error.message);
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Share Bill
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setOpenUserProfileDialog(true)}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile?.avatar_url || ""} alt={userProfile?.full_name || "User"} />
                  <AvatarFallback>
                    <UserIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
              <LogoutButton />
            </div>
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
                  <Label htmlFor="join-code">Mã nhóm</Label> {/* Changed text here */}
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
            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Đang tải...</p>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-semibold mb-2">Chưa có nhóm nào</p>
                <p className="text-muted-foreground mb-6">
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
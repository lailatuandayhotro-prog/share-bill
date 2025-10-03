import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Crown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

interface Member {
  id: string;
  name: string;
  isOwner: boolean;
  avatarUrl?: string;
}

interface GroupMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
  groupName: string;
}

const GroupMembersDialog = ({ open, onOpenChange, members, groupName }: GroupMembersDialogProps) => {
  const { user } = useAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Thành viên nhóm "{groupName}"</DialogTitle>
          <DialogDescription>
            Danh sách tất cả thành viên trong nhóm này.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-4 py-4">
            {members.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Chưa có thành viên nào trong nhóm.
              </div>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback>
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{member.name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {member.id === user?.id && (
                        <span className="px-2 py-0.5 rounded-md bg-green-500 text-white text-xs font-medium">
                          Bạn
                        </span>
                      )}
                      {member.isOwner && (
                        <span className="px-2 py-0.5 rounded-md bg-yellow-500 text-white text-xs font-medium flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Trưởng nhóm
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default GroupMembersDialog;
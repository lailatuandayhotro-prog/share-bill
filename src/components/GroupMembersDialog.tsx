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
      <DialogContent className="max-w-sm max-h-[80vh] flex flex-col p-0 overflow-hidden"> {/* Changed p-4 to p-0 and added overflow-hidden */}
        <DialogHeader className="px-4 pt-4 pb-2"> {/* Added padding */}
          <DialogTitle className="text-base sm:text-xl">Thành viên nhóm "{groupName}"</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Danh sách tất cả thành viên trong nhóm này.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1"> {/* Removed pr-3 -mr-3 */}
          <div className="space-y-3 px-4 py-2"> {/* Added px-4 */}
            {members.length === 0 ? (
              <div className="text-center text-muted-foreground py-6 text-sm">
                Chưa có thành viên nào trong nhóm.
              </div>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground">{member.name}</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {member.id === user?.id && (
                        <span className="px-1.5 py-0.5 rounded-md bg-green-500 text-white text-xs font-medium">
                          Bạn
                        </span>
                      )}
                      {member.isOwner && (
                        <span className="px-1.5 py-0.5 rounded-md bg-yellow-500 text-white text-xs font-medium flex items-center gap-1">
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
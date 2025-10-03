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
      <DialogContent className="max-w-sm max-h-[80vh] flex flex-col p-4"> {/* Reduced max-w, padding, and added flex-col */}
        <DialogHeader className="pb-2"> {/* Reduced padding */}
          <DialogTitle className="text-xl">Thành viên nhóm "{groupName}"</DialogTitle> {/* Reduced font size */}
          <DialogDescription className="text-sm">
            Danh sách tất cả thành viên trong nhóm này.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-3 -mr-3"> {/* Reduced padding */}
          <div className="space-y-3 py-2"> {/* Reduced space-y and padding */}
            {members.length === 0 ? (
              <div className="text-center text-muted-foreground py-6 text-sm"> {/* Reduced padding and font size */}
                Chưa có thành viên nào trong nhóm.
              </div>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center gap-3"> {/* Reduced gap */}
                  <Avatar className="h-9 w-9"> {/* Reduced size */}
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4 text-muted-foreground" /> {/* Reduced size */}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground">{member.name}</div> {/* Reduced font size */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground"> {/* Reduced gap and font size */}
                      {member.id === user?.id && (
                        <span className="px-1.5 py-0.5 rounded-md bg-green-500 text-white text-xs font-medium">
                          Bạn
                        </span>
                      )}
                      {member.isOwner && (
                        <span className="px-1.5 py-0.5 rounded-md bg-yellow-500 text-white text-xs font-medium flex items-center gap-1">
                          <Crown className="w-3 h-3" /> {/* Reduced size */}
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
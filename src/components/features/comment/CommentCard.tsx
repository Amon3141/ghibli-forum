import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

import LikeButton from "@/components/features/action_buttons/LikeButton";
import TrashButton from "@/components/features/action_buttons/TrashButton";

interface CommentCardProps {
  commentData: {
    id: number,
    createdAt: string,
    content: string,
    author: {
      id: number,
      username: string
    } | null,
    likes: number,
  },
  selectedCommentId: number | null,
  onClickShowReply: () => void,
  onClickTrashButton: (commentId: number) => void
}

export default function CommentCard({
  commentData, selectedCommentId, onClickShowReply: handleClickShowReply, onClickTrashButton: handleClickTrashButton
}: CommentCardProps) {
  const { user } = useAuth();
  const userDBId = user?.id;
  
  const handleClickLikeButton = (isLike: boolean) => {
    try {
      api.put(`/comments/${commentData.id}/likes`, {
        increment: isLike
      });
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        console.error((err as any).response?.data?.error || 'コメントのいいねに失敗しました', err);
      } else {
        console.error('コメントのいいねに失敗しました', err);
      }
    }
  };

  return (
    <div className={`
      clickable-card
      rounded-md p-4 text-left
      flex flex-col items-start gap-2
      ${selectedCommentId === commentData.id ? "bg-primary/70" : "bg-white"}
    `}>
      <div className="flex items-end justify-between w-full">
        <p className="font-bold">{commentData.author?.username || "不明"}</p>
        <p className="text-sm">{format(new Date(commentData.createdAt), "yyyy/MM/dd HH:mm", { locale: ja })}</p>
      </div>
      <p>{commentData.content}</p>
      <button onClick={handleClickShowReply}>
        <p className="text-amber-600 underline">返信を表示</p>
      </button>
      <div className="flex items-center justify-between w-full">
        <LikeButton
          likes={commentData.likes}
          isLiked={false}
          onLike={() => handleClickLikeButton(true)}
          onUnlike={() => handleClickLikeButton(false)}
        />
        {commentData.author?.id === userDBId && (
          <TrashButton onClick={() => handleClickTrashButton(commentData.id)} />
        )}
      </div>
    </div>
  );
}
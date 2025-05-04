'use client';

import { useState, useEffect, use } from 'react';
import { api } from "@/lib/api";

import ThreadTitleCard from "@/components/features/ThreadTitleCard";
import CommentCard from "@/components/features/comment/CommentCard";
import ReplyCard from "@/components/features/comment/ReplyCard";
import CommentPopup from "@/components/features/comment/CommentPopup";
import CommentPopupPortal from "@/components/features/comment/CommentPopupPortal";

import { FaComment } from "react-icons/fa6";

import { Thread } from "@/types/thread";
import { Comment } from "@/types/comment";

interface ThreadPageProps {
  params: Promise<{
    movieId: number;
    threadId: number;
  }>
}

export default function ThreadPage({ params } : ThreadPageProps) {
  const { threadId } = use(params);

  const [thread, setThread] = useState<Thread | null>(null);
  const [fetchThreadError, setFetchThreadError] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [fetchCommentsError, setFetchCommentsError] = useState<string | null>(null);
  const [createCommentError, setCreateCommentError] = useState<string | null>(null);

  const [replies, setReplies] = useState<Comment[]>([]);
  const [newReply, setNewReply] = useState<string>("");
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [fetchRepliesError, setFetchRepliesError] = useState<string | null>(null);
  const [createReplyError, setCreateReplyError] = useState<string | null>(null);

  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);

  const [isCommentPopupOpen, setIsCommentPopupOpen] = useState<boolean>(false);

  console.log(fetchCommentsError, createCommentError, fetchRepliesError, createReplyError);
  setReplyToId(null);

  const fetchThread = async () => {
    try {
      const response = await api.get(`/threads/${threadId}`);
      setThread(response.data);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        console.error((err as any).response?.data?.error || 'スレッド取得時にエラーが発生しました', err);
        setFetchThreadError((err as any).response?.data?.error || 'スレッド取得時にエラーが発生しました');
      } else {
        console.error('スレッド取得時にエラーが発生しました', err);
        setFetchThreadError('スレッド取得時にエラーが発生しました');
      }
    }
  }

  const fetchComments = async () => {
    try {
      const response = await api.get(`/threads/${threadId}/comments`);
      setComments(response.data);
      return response.data;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        console.error((err as any).response?.data?.error || 'コメント取得時にエラーが発生しました', err);
        setFetchCommentsError((err as any).response?.data?.error || 'コメント取得時にエラーが発生しました');
      } else {
        console.error('コメント取得時にエラーが発生しました', err);
        setFetchCommentsError('コメント取得時にエラーが発生しました');
      }
      return [];
    }
  }

  const fetchReplies = async (commentId: number) => {
    try {
      const response = await api.get(`/comments/${commentId}/replies`);
      setReplies(response.data);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        console.error((err as any).response?.data?.error || '返信取得時にエラーが発生しました', err);
        setFetchRepliesError((err as any).response?.data?.error || '返信取得時にエラーが発生しました');
      } else {
        console.error('返信取得時にエラーが発生しました', err);
        setFetchRepliesError('返信取得時にエラーが発生しました');
      }
    }
  }

  const setSelectedComment = (replyId: number) => {
    setSelectedCommentId(replyId);
    fetchReplies(replyId);
  }

  const handlePostComment = async (comment: string) => {
    try {
      const response = await api.post(`/threads/${threadId}/comments`, {
        content: comment
      });
      setComments([response.data, ...comments]);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        console.error((err as any).response?.data?.error || 'コメント投稿時にエラーが発生しました', err);
        setCreateCommentError((err as any).response?.data?.error || 'コメント投稿時にエラーが発生しました');
      } else {
        console.error('コメント投稿時にエラーが発生しました', err);
        setCreateCommentError('コメント投稿時にエラーが発生しました');
      }
    }
  }

  const handlePostReply = async (reply: string, parentId: number, replyToId: number | null) => {
    try {
      const response = await api.post(`/threads/${threadId}/comments`, {
        content: reply,
        parentId,
        replyToId: replyToId || undefined
      });
      setReplies([response.data, ...replies]);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        console.error((err as any).response?.data?.error || '返信投稿時にエラーが発生しました', err);
        setCreateReplyError((err as any).response?.data?.error || '返信投稿時にエラーが発生しました');
      } else {
        console.error('返信投稿時にエラーが発生しました', err);
        setCreateReplyError('返信投稿時にエラーが発生しました');
      }
    }
  }

  const handleClickTrashButton = async (commentId: number, isReply: boolean) => {
    try {
      await api.delete(`/comments/${commentId}`);
      if (isReply) {
        setReplies(replies.filter((reply) => reply.id !== commentId));
      } else {
        setComments(comments.filter((comment) => comment.id !== commentId));
      }
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        console.error((err as any).response?.data?.error || 'コメントの削除に失敗しました', err);
      } else {
        console.error('コメントの削除に失敗しました', err);
      }
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const [_, fetchedComments] = await Promise.all([
        fetchThread(),
        fetchComments()
      ]);

      if (fetchedComments.length > 0) {
        setSelectedCommentId(fetchedComments[0].id);
        await fetchReplies(fetchedComments[0].id);
      }
    };

    initializeData();
  }, []);

  return (
    <div className="w-full space-y-4">
      {thread && (
        <ThreadTitleCard
          title={thread.title}
          creator={thread.creator?.username || "不明"}
          summary={thread.description}
          likes={thread.likes}
        />
      )}
      {fetchThreadError && (
       <div className="rounded-sm bg-red-100 p-4">
        <p className="text-textcolor/80">{fetchThreadError}</p>
      </div>
      )}

      <div className={`
        h-[83vh]
        flex justify-start items-start gap-4
        transition-all duration-300
      `}>
        <div className="w-[50%] flex flex-col gap-4">
          {comments && comments.map((comment) => (
            <CommentCard
              key={comment.id}
              commentData={{
                id: comment.id,
                createdAt: comment.createdAt,
                content: comment.content,
                author: comment.author ?? null,
                likes: comment.likes
              }}
              selectedCommentId={selectedCommentId}
              onClickShowReply={() => {
                setSelectedComment(comment.id);
                setNewReply("");
              }}
              onClickTrashButton={() => {
                handleClickTrashButton(comment.id, false);
              }}
            />
          ))}
        </div>

        {(() => {
          if (selectedCommentId === null) return null;

          return (
            <div className={`
              flex-1
              bg-white rounded-md p-4
              flex flex-col
            `}>
              <div className="flex items-center justify-between w-full">
                <h3 className="font-bold text-lg">返信</h3>
              </div>
              <div className="w-full h-[1px] bg-gray-200 mt-3"></div>
              <div className="flex-1 overflow-y-auto max-h-[54vh]">
                <div className="flex flex-col mt-3">
                  {replies && replies.map((reply) => (
                    <div key={reply.id}>
                      <ReplyCard replyData={{
                        id: reply.id,
                        createdAt: reply.createdAt,
                        content: reply.content,
                        author: reply.author ?? null,
                        likes: reply.likes,
                        replyTo: reply.replyTo?.author?.username || "不明"
                      }}
                      onClickTrashButton={() => {
                        handleClickTrashButton(reply.id, true);
                      }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                <textarea
                  className={`
                    w-full p-3 border border-gray-300 rounded-md
                    resize-none focus:outline-none
                  `}
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  rows={3}
                  placeholder="返信を入力してください..."
                />
                <button
                  className={`
                    self-end px-4 py-2 bg-primary
                    text-sm rounded-md text-textcolor/80 font-semibold
                    hover:bg-primary/80
                  `}
                  onClick={() => {
                    handlePostReply(newReply, selectedCommentId, replyToId);
                    setNewReply("");
                  }}
                >
                  返信
                </button>
              </div>
            </div>
          );
        })()}
      </div>
      <button
        className="
          fixed bottom-8 right-8
          w-16 h-16
          bg-primary text-textcolor
          rounded-full shadow-md
          flex items-center justify-center
          hover:scale-110
          transition-all duration-200
          z-30
        "
        onClick={() =>setIsCommentPopupOpen(true)}
      >
        <FaComment size={28} />
      </button>
      {isCommentPopupOpen && (
        <CommentPopupPortal>
          <div
            className="fixed inset-0 bg-black opacity-50 z-40"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <CommentPopup
              onClose={() => setIsCommentPopupOpen(false)}
              handlePostComment={handlePostComment}
            />
          </div>
        </CommentPopupPortal>
      )}
    </div>
  );
}

// const commentData = [
//   {
//     id: 0,
//     date: "2024-04-15",
//     time: "14:30",
//     content: "千尋が最初は無気力だったのが、最後には勇気を持って行動できるようになる成長が素晴らしいですね。",
//     author: "映画好き",
//     likes: 12,
//     replies: [
//       {
//         id: 0,
//         date: "2024-04-15",
//         time: "15:45",
//         content: "特に印象的だったのは、ハクのために薬を届けるシーンですね。自分の恐怖を乗り越えて行動する姿に感動しました。",
//         author: "アニメファン",
//         likes: 8,
//         replyTo: null
//       },
//       {
//         id: 1,
//         date: "2024-04-15",
//         time: "16:20",
//         content: "湯屋での労働を通じて、千尋は責任感と自立心を学んでいきます。これは現代の若者にも通じる成長の物語だと思います。",
//         author: "ジブリ研究家",
//         likes: 15,
//         replyTo: "アニメファン"
//       },
//       {
//         id: 2,
//         date: "2024-04-15",
//         time: "16:25",
//         content: "そうですね。千尋の成長は、単なる外見的な変化だけでなく、内面的な強さを獲得していく過程が丁寧に描かれています。特に、最初は泣いてばかりいた彼女が、次第に困難に立ち向かう勇気を身につけていく様子が印象的です。",
//         author: "じろう2",
//         likes: 9,
//         replyTo: "ジブリ研究家"
//       },
//       {
//         id: 3,
//         date: "2024-04-15",
//         time: "16:44",
//         content: "そうですね。また、千尋が湯婆婆との契約を通じて、自分の名前の大切さに気づくシーンも印象的でした。これは自分のアイデンティティを守ることの重要性を示唆していると思います。",
//         author: "ハウル",
//         likes: 6,
//         replyTo: null
//       }
//     ]
//   }, 
//   {
//     id: 1,
//     date: "2024-04-15",
//     time: "17:00",
//     content: "湯屋の世界観の作り込みが素晴らしいです。特に八百万の神々のデザインが印象的でした。",
//     author: "アート好き",
//     likes: 10,
//     replies: []
//   }
// ];

// const threadData = {
//   title: "千と千尋の神隠しの考察",
//   creator: "ジブリファン",
//   summary: "千尋の成長と湯屋での経験について語り合いましょう。",
//   likes: 24,
//   comments: commentData
// };
"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { ModalPhoto } from "./ModalPhoto";
import { PostData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Media } from "@prisma/client";
import useEmblaCarousel from "embla-carousel-react";
import { MessageSquare} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Comments from "../comments/Comments";
import Linkify from "../Linkify";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import BookmarkButton from "./BookmarkButton";
import LikeButton from "./LikeButton";
import PostMoreButton from "./PostMoreButton";

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();
  const [showComments, setShowComments] = useState(false);

  return (
    <article className="group/post space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={post.user}>
              <Link
                href={`/users/${post.user.username}`}
                className="block font-medium hover:underline"
              >
                {post.user.displayName}
              </Link>
            </UserTooltip>
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
              suppressHydrationWarning
            >
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>
        {post.user.id === user.id && (
          <PostMoreButton
            post={post}
            className="opacity-0 transition-opacity group-hover/post:opacity-100"
          />
        )}
      </div>
      <Linkify>
        <div className="whitespace-pre-line break-words">{post.content}</div>
      </Linkify>
      {!!post.attachments.length && (
        <MediaPreviews attachments={post.attachments} />
      )}
      <hr className="text-muted-foreground" />
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser: post.likes.some((like) => like.userId === user.id),
            }}
          />
          <CommentButton
            post={post}
            onClick={() => setShowComments(!showComments)}
          />
        </div>
        <BookmarkButton
          postId={post.id}
          initialState={{
            isBookmarkedByUser: post.bookmarks.some(
              (bookmark) => bookmark.userId === user.id,
            ),
          }}
        />
      </div>
      {showComments && <Comments post={post} />}
    </article>
  );
}

interface MediaPreviewsProps {
  attachments: Media[];
}

function MediaPreviews({ attachments }: MediaPreviewsProps) {
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  return (
    <>
      {attachments.length === 1 ? (
        <MediaPreview
          media={attachments[0]}
          onClick={() => setSelectedMedia(attachments[0])}
        />
      ) : (
        <MediaCarousel
          attachments={attachments}
          onMediaClick={setSelectedMedia}
        />
      )}

      <MediaViewerModal
        media={selectedMedia}
        allMedia={attachments}
        onClose={() => setSelectedMedia(null)}
      />
    </>
  );
}

interface MediaViewerModalProps {
  media: Media | null;
  allMedia: Media[];
  onClose: () => void;
}

function MediaViewerModal({ media, allMedia, onClose }: MediaViewerModalProps) {
  const startIndex = allMedia.findIndex((m) => m.id === media?.id);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    startIndex: startIndex >= 0 ? startIndex : 0,
  });

  const [selectedIndex, setSelectedIndex] = useState(
    startIndex >= 0 ? startIndex : 0,
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (emblaApi && startIndex >= 0) {
      emblaApi.scrollTo(startIndex, true);
      setSelectedIndex(startIndex);
    }
  }, [media?.id]);

  return (
    <ModalPhoto open={!!media} onClose={onClose}>
      <div className="relative flex h-full w-full flex-col">
    
        {/* Top gradient */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/70 to-transparent z-[5]" />
  
    
        {/* Carousel */}
        <div className="overflow-hidden w-full h-full" ref={emblaRef}>
          <div className="flex touch-pan-y h-full">
            {allMedia.map((m) => (
              <div
                key={m.id}
                className="relative min-w-0 flex-[0_0_100%] h-dvh"
              >
                {m.type === "IMAGE" ? (
                  <Image
                    src={m.url}
                    alt="Media"
                    fill
                    className="object-contain"
                  />
                ) : (
                  <video
                    src={m.url}
                    controls
                    autoPlay
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
    
        {/* Dots */}
        {allMedia.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-1.5">
            {allMedia.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={cn(
                  "size-1.5 rounded-full transition-all duration-300",
                  i === selectedIndex ? "w-3 bg-white" : "bg-white/30",
                )}
              />
            ))}
          </div>
        )}
    
      </div>
    </ModalPhoto>
  );
}

interface MediaCarouselProps {
  attachments: Media[];
  onMediaClick: (media: Media) => void;
}

function MediaCarousel({ attachments, onMediaClick }: MediaCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex touch-pan-y gap-2">
          {attachments.map((media) => (
            <div key={media.id} className="min-w-0 flex-[0_0_80%]">
              <MediaPreview media={media} onClick={() => onMediaClick(media)} />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white">
        {selectedIndex + 1}/{attachments.length}
      </div>

      <div className="mt-2 flex justify-center gap-1">
        {attachments.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={cn(
              "size-1.5 rounded-full transition-all duration-300",
              i === selectedIndex ? "w-3 bg-foreground" : "bg-foreground/20",
            )}
          />
        ))}
      </div>
    </div>
  );
}

interface MediaPreviewProps {
  media: Media;
  onClick: () => void;
}

function MediaPreview({ media, onClick }: MediaPreviewProps) {
  if (media.type === "IMAGE") {
    return (
      <button onClick={onClick} className="w-full">
        <Image
          src={media.url}
          alt="Attachment"
          width={500}
          height={500}
          className="h-48 w-full cursor-pointer rounded-2xl object-cover transition-opacity hover:opacity-90 sm:h-64"
        />
      </button>
    );
  }

  if (media.type === "VIDEO") {
    return (
      <button onClick={onClick} className="w-full">
        <video
          src={media.url}
          className="mx-auto size-fit max-h-[30rem] cursor-pointer rounded-2xl"
        />
      </button>
    );
  }

  return <p className="text-destructive">Unsupported media type</p>;
}

interface CommentButtonProps {
  post: PostData;
  onClick: () => void;
}

function CommentButton({ post, onClick }: CommentButtonProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-2">
      <MessageSquare className="size-5" />
      <span className="text-sm font-medium tabular-nums">
        {post._count.comments}{" "}
        <span className="hidden sm:inline">comments</span>
      </span>
    </button>
  );
}
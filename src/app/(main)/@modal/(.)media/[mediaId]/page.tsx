import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import MediaModal from "./MediaModal";


interface PageProps {
  params: { mediaId: string };
}

export default async function Page({ params: { mediaId } }: PageProps) {
  const { user } = await validateRequest();
  if (!user) return notFound();

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    include: {
      post: {
        include: {
          attachments: {
            orderBy: {
              createdAt: "asc", // ✅ add explicit ordering
            },
          },
        },
      },
    },
  });

  // ✅ Safe fallback
  const allMedia = Array.isArray(media?.post?.attachments) && media.post.attachments.length > 0
    ? media.post.attachments
    : media
      ? [media]
      : [];

  if (!media || allMedia.length === 0) return notFound();

  return <MediaModal media={media} allMedia={allMedia} />;

}
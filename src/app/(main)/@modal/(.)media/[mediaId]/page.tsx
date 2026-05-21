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
          attachments: true,
        },
      },
    },
  });

  if (!media) return notFound();

  const allMedia = media.post?.attachments ?? [media];

  return <MediaModal media={media} allMedia={allMedia} />;

}
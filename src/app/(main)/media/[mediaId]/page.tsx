import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";

interface PageProps {
  params: { mediaId: string };
}

export default async function Page({ params: { mediaId } }: PageProps) {
  const { user } = await validateRequest();
  if (!user) return notFound();

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
  });

  if (!media) return notFound();

  return (
    <main className="flex min-h-screen items-center justify-center bg-black">
      {media.type === "IMAGE" ? (
        <Image
          src={media.url}
          alt="Media"
          width={1200}
          height={900}
          className="max-h-screen w-auto object-contain"
        />
      ) : (
        <video
          src={media.url}
          controls
          autoPlay
          className="max-h-screen w-full"
        />
      )}
    </main>
  );
}